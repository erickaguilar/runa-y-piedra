import { SceneManager } from './render/SceneManager.js';
import { VoxelMap } from './render/VoxelMap.js';
import { AvatarRenderer } from './render/AvatarRenderer.js';
import { ChestRenderer } from './render/ChestRenderer.js';
import { DoorRenderer } from './render/DoorRenderer.js';
import { PedestalRenderer } from './render/PedestalRenderer.js';
import { StairsRenderer } from './render/StairsRenderer.js';
import { floorVariant } from './levels/LevelLoader.js';
import { World } from './core/World.js';
import { GameLoop } from './core/GameLoop.js';
import { PlayerManager } from './entities/PlayerManager.js';
import { SimulationEngine } from './simulation/SimulationEngine.js';
import { InputManager } from './input/InputManager.js';
import { CameraController } from './camera/CameraController.js';
import { BlockRaycaster } from './interaction/BlockRaycaster.js';
import { NetworkManager } from './network/NetworkManager.js';
import * as Proto from './network/Protocol.js';
import { ClientReconciler } from './network/ClientReconciler.js';
import { InputQueue } from './network/InputQueue.js';
import { UIManager } from './ui/UIManager.js';
import { soundManager } from './audio/SoundManager.js';
import { NET_CONFIG, BLOCK_TYPES, PHYSICS_CONFIG, PLAYER_HEROES } from './config/constants.js';

class VoxelSandboxGame {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.mode = null; // 'host' | 'client'

    // 1. Núcleo gráfico y simulación
    this.sceneManager = new SceneManager(this.canvas);
    this.world = new World();
    this.voxelMap = new VoxelMap(this.sceneManager.scene, this.world);
    this.chestRenderer = new ChestRenderer(this.sceneManager.scene);
    this.chestRenderer.loadChests(this.world.chests);
    this.doorRenderer = new DoorRenderer(this.sceneManager.scene);
    this.doorRenderer.loadDoors(this.world.doors);
    this.pedestalRenderer = new PedestalRenderer(this.sceneManager.scene);
    this.pedestalRenderer.loadPedestals(this.world.objectives, { theme: this.pedestalTheme() });
    this.stairsRenderer = new StairsRenderer(this.sceneManager.scene);
    this.stairsRenderer.loadStairs(this.world.stairwells[0] || null);
    this.avatars = new AvatarRenderer(this.sceneManager.scene);
    this.playerManager = new PlayerManager();
    this.simulation = new SimulationEngine(this.world, {
      onStairTouch: (p) => this._onStairTouch(p),
      onPlayerRespawn: (p, cp, info = {}) => {        if (p !== this.playerManager.localPlayer) return;
        const { cause = 'void', lives = 3, maxLives = 3, gameOver = false, noPenalty = false } = info;
        if (noPenalty) {
          this.ui.showNarrativeMessage('⚠️ ¡Zona restringida! Vuelves al checkpoint.', 2500);
          return;
        }
        this.ui.updateLives(lives, maxLives);
        if (gameOver) {
          this.soundManager.playGameOver();
          this.ui.showGameOver(lives, maxLives);
          // Tras Game Over las vidas ya se restauraron a 3: refrescar HUD lleno
          this.ui.updateLives(p.lives, p.maxLives ?? 3);
        } else {
          this.soundManager.playHurt();
          const roomMsg = cp?.roomName ? ` en ${cp.roomName}` : '';
          if (cause === 'lava') {
            this.ui.showNarrativeMessage(`🔥 ¡Te quemó la lava! Te quedan ${lives} ${lives === 1 ? 'vida' : 'vidas'}. Reapareciendo${roomMsg}...`, 3200);
          } else {
            this.ui.showNarrativeMessage(`⚠️ ¡Caíste al abismo! Te quedan ${lives} ${lives === 1 ? 'vida' : 'vidas'}. Reapareciendo${roomMsg}...`, 3200);
          }
        }
      },
    });
    this.cameraController = new CameraController(this.sceneManager.camera);
    this.raycaster = new BlockRaycaster(this.sceneManager.camera, this.voxelMap, this.world);

    // 2. Red, Audio y UI
    this.network = new NetworkManager();
    this.ui = new UIManager();
    this.soundManager = soundManager;
    this.network.stats.setRenderer(this.sceneManager.renderer);

    // 3. Controles
    this.input = new InputManager({
      canvas: this.canvas,
      onJump: () => {
        if (this.playerManager.localPlayer?.onGround) {
          this.soundManager.playJump();
        }
      },
      onInteract: () => this.handleInteract(),
    });

    this.currentJoinUrl = null;
    this.inputSeq = 0;
    this.snapshotSeq = 0;
    this.inputQueue = new InputQueue();
    this.reconciler = new ClientReconciler();
    this.transitioning = false; // Ceremonia de portal en curso (bloquea re-activaciones)
    // Descenso sincronizado por la escalinata
    this.descentActive = false;
    this.descentInitiator = null;
    this.descentTimer = null;

    // Aplicar calidad gráfica guardada
    const savedDpr = parseFloat(localStorage.getItem('dungeon_dpr') || '1.5');
    this.sceneManager.setQuality(savedDpr);

    this.initNetworkEvents();
    this.initNetworkTimers();
    this.initGameLoop();
    this.initSettings();
    this.initUI();
  }

  initSettings() {
    this.ui.bindSettings({
      onProfileSave: ({ name, colorIndex }) => {
        const local = this.playerManager.localPlayer;
        local.name = name;
        local.colorIndex = colorIndex;

        // Si estamos conectados en red, propagar metadatos a los demás
        if (this.mode === 'host') {
          this.network.broadcast(Proto.serializePlayerMeta(local.id, colorIndex, name));
        } else if (this.mode === 'client') {
          this.network.sendToHost(Proto.serializePlayerMeta(local.id, colorIndex, name));
        }
      },
      onQualityChange: (dpr) => {
        this.sceneManager.setQuality(dpr);
      },
      onSensitivityChange: (val) => {
        this.input.setSensitivity(val);
      },
      onLeaveGame: () => {
        window.location.href = window.location.origin + window.location.pathname;
      },
      getGameState: () => ({
        inGame: this.mode !== null,
        isHost: this.mode === 'host',
        roomPin: this.network.roomId ? this.network.roomId.replace(NET_CONFIG.ROOM_PREFIX, '') : null,
        joinUrl: this.currentJoinUrl,
        levels: this.world.levelRegistry.getAllLevels(),
        currentLevelId: this.world.levelRegistry.getCurrentLevel().id,
        players: this.playerManager.getAllPlayers(),
      }),
      onSelectLevel: (lvlId) => {
        this.switchLevel(lvlId);
      },
      onToggleDebug: (enable) => {
        this.network.stats.setEnabled(enable);
      },
    });
  }

  initUI() {
    this.ui.showMenu({
      onHost: (profile) => this.startHost(profile),
      onJoin: (pin, profile) => this.joinRoom(pin, profile),
    });
  }

  async startHost(profile = {}) {
    const name = profile.name || 'Host';
    const colorIndex = profile.colorIndex ?? 0;
    this.playerManager.setLocalProfile(name, colorIndex);

    this.ui.setStatus('Creando mazmorra...');
    try {
      const pin = await this.network.host();
      this.mode = 'host';

      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const hostAddr = isLocal ? (localStorage.getItem('dungeon_lan_ip') || '192.168.100.28:5173') : window.location.host;
      const joinUrl = `${window.location.protocol}//${hostAddr}/?join=${pin}`;
      this.currentJoinUrl = joinUrl;

      // Entrar directamente a la partida sin segundo modal
      this.ui.currentScreen = 'in_game';
      this.ui.hideMenu();
      this.ui.setCrosshairVisible(true);
      this.ui.setActionButtonsVisible(true);
      this.ui.setLivesVisible(true);
      const localInit = this.playerManager.localPlayer;
      localInit.resetLives();
      this.ui.updateLives(localInit.lives, localInit.maxLives);
      this.ui.setHasKey(false);

      const lvl = this.world.levelRegistry.getCurrentLevel();
      this.ui.showNarrativeMessage(`🏰 ${lvl.name} (Sala PIN: ${pin}). Toca ⚙️ para invitar amigos o cambiar mapa.`, 5500);
    } catch (e) {
      this.ui.setStatus('Error al crear sala: ' + (e?.message || e));
    }
  }

  switchLevel(levelId, broadcast = true) {
    const levelData = this.world.levelRegistry.getLevel(levelId);
    if (!levelData) return;
    this.world.levelRegistry.setCurrentLevel(levelId);
    this.world.loadLevel(levelData);
    this.voxelMap.rebuildFromWorld();
    this.chestRenderer.loadChests(this.world.chests);
    this.doorRenderer.loadDoors(this.world.doors);
    this.pedestalRenderer.loadPedestals(this.world.objectives, { theme: this.pedestalTheme() });
    this.stairsRenderer.loadStairs(this.world.stairwells[0] || null);
    // Reset del descenso sincronizado al cambiar de mapa
    if (this.descentTimer) { clearTimeout(this.descentTimer); this.descentTimer = null; }
    this.descentActive = false;
    this.descentInitiator = null;
    this.ui.hideDescent();

    const spawn = levelData.spawn || { x: 12.0, y: 1.2, z: 4.5 };
    const local = this.playerManager.localPlayer;
    local.setCheckpoint(spawn.x, spawn.y, spawn.z, levelData.name);
    local.respawn();
    local.resetLives();
    local.vel.x = 0;
    local.vel.y = 0;
    local.vel.z = 0;
    this.ui.setLivesVisible(true);
    this.ui.updateLives(local.lives, local.maxLives);
    // Nueva mazmorra, nuevas llaves: los cofres reaparecen cerrados
    for (const pl of this.playerManager.getAllPlayers()) {
      pl.clearKeys?.();
    }
    this.ui.setHasKey(false);
    // Fin de la transición del portal (el velo se retira sobre el nuevo mapa)
    this.transitioning = false;
    this.ui.hideLevelTransition();

    // Limpiar buffers de reconciliación y cola de inputs para evitar replay cruzado de niveles
    this.reconciler.reset();
    this.inputQueue.clear();

    this.ui.showNarrativeMessage(`Mapa cargado: ${levelData.name}`, 3500);

    if (broadcast && this.mode === 'host') {
      this.network.broadcast(Proto.serializeLevelChange(levelId));
    }
  }

  /** Clientes que se unen tarde: si la fosa ya está abierta en los bloques, reflejarlo. */
  syncStairsFromWorld() {
    const rect = this.stairPitRect();
    if (!rect) return;
    // La fosa abierta = suelo y=0 retirado en todo el rectángulo
    let pitOpen = true;
    for (let x = rect.x1; x <= rect.x2 && pitOpen; x++) {
      for (let z = rect.z1; z <= rect.z2 && pitOpen; z++) {
        if (this.world.get(x, 0, z) !== BLOCK_TYPES.AIR) pitOpen = false;
      }
    }
    if (pitOpen) {
      this.world.stairsOpen = true;
      for (const w of this.world.stairwells) w.open = true;
      this.stairsRenderer.setOpenInstant();
    }
  }

  /** Tema visual del altar según la mazmorra activa (clásico dorado / inferno brasa). */
  pedestalTheme() {
    const id = this.world.levelRegistry.getCurrentLevel()?.id || '';
    return id.includes('inferno') ? 'inferno' : 'classic';
  }

  /**
   * Petición de portal (solo Host): valida distancia al altar y arranca la ceremonia
   * para todos. Si hay siguiente mazmorra, viajan tras la ceremonia; si no, victoria.
   */
  requestPedestal(objIndex = 0, player = null) {
    if (this.mode !== 'host' || this.transitioning) return false;
    const obj = this.world.objectives?.[objIndex];
    if (!obj) return false;
    if (player) {
      const dist = Math.hypot(player.pos.x - obj.x, player.pos.z - obj.z);
      if (dist > (obj.triggerRadius || 3.2) + 0.5) {
        console.warn(`[AntiCheat] Activación de altar rechazada: ${player.name} fuera de rango (${dist.toFixed(2)}m)`);
        return false;
      }
    }

    const levels = this.world.levelRegistry.getAllLevels();
    const curIdx = levels.findIndex(l => l.id === this.world.levelRegistry.getCurrentLevel()?.id);
    const next = levels[curIdx + 1] || null;
    if (this.world.stairsOpen) {
      this.ui.showNarrativeMessage('La escalinata ya desciende. ¡Bajad!', 3000);
      return true;
    }
    const evt = {
      index: objIndex,
      isLast: !next,
      nextLevelId: next?.id || '',
      nextName: next?.name || '',
    };
    this.network.broadcast(Proto.serializePedestalEvent(evt.index, evt.nextLevelId, evt.nextName, evt.isLast));
    this.startPortalCeremony(evt);
    return true;
  }

  /** Rectángulo de fosa de la escalinata del nivel actual (o null). */
  stairPitRect() {
    return this.world.stairwells?.[0] || null;
  }

  /**
   * Abre la fosa real en el mundo: retira 6 bloques de suelo, pone fondo en y=-1
   * y actualiza el render. Determinista: host y clientes aplican lo mismo.
   */
  applyStairPit(rect) {
    if (!rect) return;
    for (let x = rect.x1; x <= rect.x2; x++) {
      for (let z = rect.z1; z <= rect.z2; z++) {
        this.world.set(x, 0, z, BLOCK_TYPES.AIR);
        this.voxelMap.removeBlock(x, 0, z);
        const t = floorVariant(x, z);
        this.world.set(x, -1, z, t);
        this.voxelMap.addBlock(x, -1, z, t);
      }
    }
  }

  /** Ceremonia local del portal: altar, losa deslizante, fosa y mensaje (sin cambio de nivel). */
  startPortalCeremony({ isLast = false, nextLevelId = '', nextName = '' } = {}) {
    if (this.transitioning) return;
    this.transitioning = true;
    this.pedestalRenderer.activate();
    this.soundManager.playPedestal();

    if (isLast) {
      this.ui.showLevelTransition(
        '🏆 ¡Mazmorras Conquistadas!',
        'Habéis bendecido todos los altares. ¡Leyendas de la mazmorra cooperativa!',
        { victory: true, autoHideMs: 6000 }
      );
      setTimeout(() => { this.transitioning = false; }, 6000);
      return;
    }

    const rect = this.stairPitRect();
    if (rect) {
      this.applyStairPit(rect);
      this.world.stairsOpen = true;
      for (const w of this.world.stairwells) w.open = true;
    }
    this.stairsRenderer.open();
    this.soundManager.playSlabGrind();
    this.ui.showNarrativeMessage('✨ ¡El altar despierta! La losa se desliza y una escalinata desciende a la oscuridad. ¡Bajad!', 6000);
    setTimeout(() => { this.transitioning = false; }, 2600);
  }

  // ================= DESCENSO SINCRONIZADO (8s, estilo Deep Rock) =================

  _onStairTouch(p) {
    if (this.mode !== 'host') return;
    if (!this.world.stairsOpen || this.transitioning) return;
    if (!this.descentActive) {
      this.startDescentCountdown(p);
    } else if (p !== this.descentInitiator) {
      this.goNow();
    }
  }

  startDescentCountdown(initiator) {
    if (this.descentActive) return;
    this.descentActive = true;
    this.descentInitiator = initiator;
    const deadline = Date.now() + 8000;
    this.network.broadcast(Proto.serializeDescentStart(initiator.id, initiator.name, deadline));
    this.ui.showDescentCountdown({
      byName: initiator.name, endsAtMs: deadline, onNow: () => this.goNow(),
    });
    this.ui.showNarrativeMessage(`🌀 ¡${initiator.name} desciende! 8s para bajar juntos...`, 4000);
    this.descentTimer = setTimeout(() => this.goNow(), 8000);
  }

  /** Transición inmediata de toda la party: fade negro + siguiente nivel. */
  goNow() {
    if (!this.descentActive) return;
    if (this.descentTimer) { clearTimeout(this.descentTimer); this.descentTimer = null; }
    this.descentActive = false;
    this.descentInitiator = null;

    const levels = this.world.levelRegistry.getAllLevels();
    const curIdx = levels.findIndex(l => l.id === this.world.levelRegistry.getCurrentLevel()?.id);
    const next = levels[curIdx + 1] || null;
    if (!next) return;
    this.network.broadcast(Proto.serializeDescentGo(next.id, next.name));
    this.beginDescentFade(next.name);
    if (this.mode === 'host') {
      setTimeout(() => {
        if (this.mode === 'host') this.switchLevel(next.id, true);
      }, 1600);
    }
  }

  beginDescentFade(nextName = '') {
    this.ui.hideDescent();
    this.ui.showLevelTransition(nextName || 'Descendiendo...', 'Descendiendo a las profundidades…');
    this.soundManager.playDescentEcho();
  }

  async joinRoom(pin, profile = {}) {
    if (!/^\d{4}$/.test(pin)) {
      this.ui.setStatus('PIN inválido (debe contener 4 dígitos)');
      return;
    }
    const name = profile.name || 'Aventurero';
    const colorIndex = profile.colorIndex ?? 0;
    this.playerManager.setLocalProfile(name, colorIndex);

    this.ui.setStatus('Conectando a la mazmorra...');
    try {
      await this.network.join(pin);
      this.mode = 'client';
      this.currentJoinUrl = `${window.location.protocol}//${window.location.host}/?join=${pin}`;
      this.ui.currentScreen = 'in_game';
      this.ui.setCrosshairVisible(true);
      this.ui.setActionButtonsVisible(true);
      this.ui.hideMenu();
      this.ui.setLivesVisible(true);
      const localCli = this.playerManager.localPlayer;
      localCli.resetLives();
      this.ui.updateLives(localCli.lives, localCli.maxLives);
      this.ui.setHasKey(false);
      this.ui.showNarrativeMessage(`Conectado como ${name}. Explorad juntos.`, 5000);

      // Enviar metadatos locales (nombre y color de clase) al Host
      this.network.sendToHost(Proto.serializePlayerMeta(0, colorIndex, name));
    } catch (e) {
      this.ui.setStatus('Error de conexión: ' + (e?.message || e));
    }
  }

  handleJump() {
    const local = this.playerManager.localPlayer;
    if (local.onGround) {
      const jumpMult = local.hero?.jumpMultiplier || 1.0;
      local.vel.y = PHYSICS_CONFIG.JUMP_VELOCITY * jumpMult;
      local.onGround = false;
    }
  }

  handleInteract() {
    if (!this.mode) return;
    const local = this.playerManager.localPlayer;
    const interaction = this.raycaster.getTargetInteraction(local.pos);
    if (!interaction) {
      this.ui.showNarrativeMessage('Nada con lo que interactuar cerca.', 2000);
      return;
    }

    if (interaction.type === 'door') {
      const doorId = interaction.doorId || 1;
      const isOpen = doorId === 1 ? this.world.isDoor1Open : this.world.isDoor2Open;
      if (isOpen) return;

      if (this.mode === 'host') {
        this.requestOpenDoor(doorId, local);
      } else {
        // Pre-chequeo local de llave para feedback inmediato sin tráfico de red
        const door = this.world.doors?.find(d => d.id === doorId);
        if (door?.requiresKey && !local.hasKey?.(door.requiresKey)) {
          this.doorLockedFeedback(door);
          return;
        }
        this.network.sendToHost(Proto.serializeDoorOpen(doorId));
        this.ui.showNarrativeMessage(`Abriendo Puerta ${doorId}...`, 2500);
      }
    } else if (interaction.type === 'chest') {
      const chestId = interaction.chestId || 1;
      if (this.chestRenderer.isChestOpen(chestId)) return;

      if (this.mode === 'host') {
        this.openChest(chestId, local);
      } else {
        this.network.sendToHost(Proto.serializeChestOpen(chestId));
        this.ui.showNarrativeMessage('Abriendo cofre...', 1500);
      }
    } else if (interaction.type === 'pedestal') {
      if (this.transitioning) return;
      const objIndex = interaction.objIndex ?? 0;
      if (this.mode === 'host') {
        this.requestPedestal(objIndex, local);
      } else {
        this.network.sendToHost(Proto.serializePedestalRequest(objIndex));
        this.ui.showNarrativeMessage('Activando el altar...', 1500);
      }
    }
  }

  openChest(chestId = 1, opener = null) {
    const opened = this.chestRenderer.openChest(chestId);
    if (!opened) return;

    const chestData = this.world.chests?.find(c => c.id === chestId);
    if (chestData) chestData.isOpen = true;

    const local = this.playerManager.localPlayer;
    if (chestData && local) {
      this.soundManager.playChestOpen({ x: chestData.x, y: chestData.y, z: chestData.z }, local.pos);
    } else {
      this.soundManager.playChestOpen();
    }

    if (this.mode === 'host') {
      this.network.broadcast(Proto.serializeChestOpen(chestId));
      // Otorgamiento autoritativo de llave al jugador que abrió el cofre
      if (chestData?.givesKey && opener?.addKey) {
        if (opener.addKey(chestData.givesKey)) {
          this.network.broadcast(Proto.serializeKeyUpdate(opener.id, chestData.givesKey));
          if (opener === local) {
            this.onLocalKeyReceived(chestData);
          }
        }
      }
    }

    const msg = chestData?.message || `📦 ¡Has abierto el ${chestData?.name || 'Cofre'}! Recompensa: ${chestData?.reward || 'Tesoros de la Mazmorra'}`;
    this.ui.showNarrativeMessage(msg, 5000);
  }

  /** Feedback local al recibir una llave: insignia del HUD + sonido. */
  onLocalKeyReceived(chestData = {}) {
    const local = this.playerManager.localPlayer;
    this.ui.setHasKey(true);
    this.soundManager.playKeyPickup();
    const keyName = chestData.keyName || 'Llave del Santuario';
    this.ui.showNarrativeMessage(`🗝️ ¡${keyName} conseguida! Ahora puedes abrir la Puerta 2.`, 4500);
    void local;
  }

  /** Puerta bloqueada por falta de llave: mensaje + sonido metálico (solo jugador local). */
  doorLockedFeedback(door) {
    const msg = door?.lockedMessage || '🔒 ¡Puerta sellada! Necesitas una llave.';
    this.soundManager.playLocked();
    this.ui.showNarrativeMessage(msg, 4000);
  }

  /**
   * Apertura validada: verifica llave requerida antes de abrir.
   * Retorna true si se abrió, false si está bloqueada o ya abierta.
   */
  requestOpenDoor(doorId = 1, player = null) {
    const isOpen = doorId === 1 ? this.world.isDoor1Open : this.world.isDoor2Open;
    if (isOpen) return false;

    const door = this.world.doors?.find(d => d.id === doorId);
    const keyId = door?.requiresKey;
    if (keyId && !(player?.hasKey?.(keyId))) {
      // Solo el jugador local recibe el aviso; los remotos ya fueron filtrados en su cliente
      if (player === this.playerManager.localPlayer) {
        this.doorLockedFeedback(door);
      }
      return false;
    }

    this.openDoor(doorId);
    return true;
  }

  openDoor(doorId = 1) {
    const isOpen = doorId === 1 ? this.world.isDoor1Open : this.world.isDoor2Open;
    if (isOpen) return;

    this.world.openDoor(doorId);
    this.voxelMap.openDoor(doorId);
    this.doorRenderer.openDoor(doorId);

    const door = this.world.doors?.find(d => d.id === doorId);
    const doorZ = door?.z ?? (doorId === 1 ? 11 : 24);
    const local = this.playerManager.localPlayer;
    if (local) {
      this.soundManager.playDoorOpen({ x: 12.0, y: 2.0, z: doorZ + 0.5 }, local.pos);
    } else {
      this.soundManager.playDoorOpen();
    }

    const msg = door?.openMessage || (doorId === 1
      ? '🚪 ¡Puerta 1 abierta! Sala 2: El Abismo. ¡Usa el botón SALTAR para cruzar las plataformas!'
      : '🚪 ¡Puerta 2 abierta! ¡Has superado el Abismo! Avanzad al Santuario Ancestral.');
    this.ui.showNarrativeMessage(msg, 6000);

    if (this.mode === 'host') {
      this.network.broadcast(Proto.serializeDoorOpen(doorId));
    }
  }

  initNetworkEvents() {
    this.network.addEventListener('peer-joined', (e) => {
      const conn = e.detail.conn;
      const remotePlayer = this.playerManager.addRemotePlayer(conn);

      // 1. Enviar INIT con el mapa y el ID asignado
      this.network.sendTo(conn, Proto.serializeInit(this.world.blocks, remotePlayer.id));

      // Sincronizar el nivel actual activo con el cliente que ingresa
      const currentLvl = this.world.levelRegistry.getCurrentLevel();
      if (currentLvl) {
        this.network.sendTo(conn, Proto.serializeLevelChange(currentLvl.id));
      }

      // 2. Enviar metadatos del Host al nuevo jugador
      const local = this.playerManager.localPlayer;
      this.network.sendTo(conn, Proto.serializePlayerMeta(local.id, local.colorIndex, local.name));

      // 3. Enviar metadatos de otros compañeros si los hubiera
      for (const p of this.playerManager.getAllPlayers()) {
        if (p.id !== local.id && p.id !== remotePlayer.id) {
          this.network.sendTo(conn, Proto.serializePlayerMeta(p.id, p.colorIndex, p.name));
        }
      }

      // 4. Sincronizar llaves ya otorgadas (p. ej. si el cofre 1 se abrió antes de unirse)
      for (const p of this.playerManager.getAllPlayers()) {
        if (Array.isArray(p.keys)) {
          for (const keyId of p.keys) {
            this.network.sendTo(conn, Proto.serializeKeyUpdate(p.id, keyId));
          }
        }
      }

      this.avatars.setTarget(
        remotePlayer.id,
        remotePlayer.pos.x,
        remotePlayer.pos.y,
        remotePlayer.pos.z,
        remotePlayer.yaw
      );

      this.ui.updatePartyList(this.playerManager.getAllPlayers());
    });

    this.network.addEventListener('peer-left', (e) => {
      this.inputQueue.remove(e.detail.conn);
      const removedPlayer = this.playerManager.removeByConnection(e.detail.conn);
      if (removedPlayer) {
        this.avatars.remove(removedPlayer.id);
        this.ui.showNarrativeMessage(`⚠️ ${removedPlayer.name} ha abandonado la partida.`, 4000);
        this.ui.updatePartyList(this.playerManager.getAllPlayers());
      }
    });

    this.network.addEventListener('version-mismatch', (e) => {
      const { hostVersion, clientVersion } = e.detail;
      alert(`⚠️ Versión de protocolo incompatible.\nHost v${hostVersion} vs Cliente v${clientVersion}.\nPor favor, actualiza tu versión del juego.`);
      window.location.href = window.location.origin + window.location.pathname;
    });

    this.network.addEventListener('host-closing', () => {
      this.ui.showNarrativeMessage('🏰 El anfitrión ha abandonado o cerrado la partida.', 5000);
      setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname;
      }, 1500);
    });

    this.network.addEventListener('level-change', (e) => {
      const lvlId = e.detail?.levelId;
      if (lvlId) {
        this.switchLevel(lvlId, false);
      }
    });

    this.network.addEventListener('player-meta', (e) => {
      const { playerId, colorIndex, name, conn } = e.detail;
      const hero = PLAYER_HEROES[colorIndex] || PLAYER_HEROES[0];

      if (this.mode === 'host') {
        const player = this.playerManager.getPlayerByConnection(conn);
        if (player) {
          player.name = name;
          player.colorIndex = colorIndex;
          this.avatars.setMetadata(player.id, name, hero.hex);
          this.ui.showNarrativeMessage(`🛡️ ¡${name} (${hero.name}) se unió a la partida!`, 4500);

          // Transmitir metadatos oficiales del jugador a todos los clientes
          this.network.broadcast(Proto.serializePlayerMeta(player.id, colorIndex, name));
          this.ui.updatePartyList(this.playerManager.getAllPlayers());
        }
      } else if (this.mode === 'client') {
        this.playerManager.updatePlayerMeta(playerId, name, colorIndex);
        this.avatars.setMetadata(playerId, name, hero.hex);
        if (playerId === 0) {
          this.ui.showNarrativeMessage(`🏰 Mazmorra de ${name} (${hero.name})`, 4000);
        } else if (playerId !== this.playerManager.localPlayer.id) {
          this.ui.showNarrativeMessage(`🛡️ ¡${name} (${hero.name}) se unió!`, 4000);
        }
      }
    });

    this.network.addEventListener('input', (e) => {
      if (this.mode !== 'host') return;
      this.inputQueue.enqueue(e.detail.conn, e.detail);
    });

    this.network.addEventListener('door-open', (e) => {
      const doorId = e.detail?.doorId || 1;
      const conn = e.detail?.conn;

      // Validación autoritativa en el Host: distancia euclidiana <= 3.5m (tolerancia de jitter)
      let requester = null;
      if (this.mode === 'host' && conn) {
        requester = this.playerManager.getPlayerByConnection(conn);
        if (!requester) return;

        const door = this.world.doors?.find(d => d.id === doorId);
        const doorZ = door?.z ?? (doorId === 1 ? 11 : 24);
        const doorCenterX = 12.0;
        const doorCenterZ = doorZ + 0.5;
        const dist = Math.hypot(requester.pos.x - doorCenterX, requester.pos.z - doorCenterZ);
        if (dist > 3.5) {
          console.warn(`[AntiCheat] Apertura de puerta ${doorId} rechazada: jugador ${requester.name} fuera de rango (${dist.toFixed(2)}m > 3.5m)`);
          return;
        }

        // Validación de llave en el Host (el cliente ya pre-chequeó, esto es anti-trampas)
        this.requestOpenDoor(doorId, requester);
        return;
      }

      this.openDoor(doorId);
    });

    this.network.addEventListener('chest-open', (e) => {
      const chestId = e.detail?.chestId || 1;
      const conn = e.detail?.conn;

      // Validación autoritativa en el Host: distancia euclidiana al cofre <= 3.2m
      let opener = null;
      if (this.mode === 'host' && conn) {
        opener = this.playerManager.getPlayerByConnection(conn);
        if (!opener) return;

        const chest = this.world.chests?.find(c => c.id === chestId);
        if (chest) {
          const dist = Math.hypot(opener.pos.x - chest.x, opener.pos.z - chest.z);
          if (dist > 3.2) {
            console.warn(`[AntiCheat] Apertura de cofre ${chestId} rechazada: jugador ${opener.name} fuera de rango (${dist.toFixed(2)}m > 3.2m)`);
            return;
          }
        }
      }

      this.openChest(chestId, opener);
    });

    this.network.addEventListener('pedestal', (e) => {
      const detail = e.detail || {};
      if (this.mode === 'host') {
        // Petición de un cliente: validar solicitante y arrancar ceremonia global
        if (!detail.isRequest) return;
        if (this.transitioning) return;
        const player = this.playerManager.getPlayerByConnection(detail.conn);
        if (!player) return;
        this.requestPedestal(detail.index ?? 0, player);
      } else if (this.mode === 'client') {
        // Ceremonia retransmitida por el Host: vivirla en local
        if (detail.isRequest) return;
        this.startPortalCeremony(detail);
      }
    });

    this.network.addEventListener('descent', (e) => {
      const detail = e.detail || {};
      if (this.mode === 'host') {
        // "Bajar ya" de un cliente: transición inmediata si hay cuenta atrás
        if (detail.kind === Proto.DESCENT_KIND.NOW && this.descentActive) {
          this.goNow();
        }
        return;
      }
      if (this.mode !== 'client') return;
      if (detail.kind === Proto.DESCENT_KIND.START) {
        this.descentActive = true;
        this.ui.showDescentCountdown({
          byName: detail.byName || 'Un compañero',
          endsAtMs: detail.deadline || (Date.now() + 8000),
          onNow: () => this.network.sendToHost(Proto.serializeDescentNow()),
        });
        this.ui.showNarrativeMessage(`🌀 ¡${detail.byName || 'Un compañero'} desciende! 8s para bajar juntos...`, 4000);
      } else if (detail.kind === Proto.DESCENT_KIND.GO) {
        this.descentActive = false;
        this.beginDescentFade(detail.nextName || '');
      }
    });

    this.network.addEventListener('key-update', (e) => {      if (this.mode !== 'client') return;
      const { playerId, keyId } = e.detail || {};
      if (!keyId) return;
      const player = this.playerManager.getPlayerById(playerId);
      if (!player) return;
      if (player.addKey(keyId) && player === this.playerManager.localPlayer) {
        const chestData = this.world.chests?.find(c => c.givesKey === keyId);
        this.onLocalKeyReceived(chestData || {});
      }
    });

    this.network.addEventListener('snapshot', (e) => {
      if (this.mode !== 'client') return;
      const players = Array.isArray(e.detail) ? e.detail : (e.detail?.players || []);
      const simTime = e.detail?.time || performance.now();
      const local = this.playerManager.localPlayer;
      this.reconciler.onSnapshot(simTime, players, local, this.simulation);
      // Sincronización autoritativa de vidas desde el host
      const localEntry = players.find(p => p.id === local.id);
      if (localEntry && localEntry.lives !== undefined && localEntry.lives !== local.lives) {
        const wasGameOver = localEntry.lives >= (local.maxLives ?? 3) && local.lives <= 0;
        local.lives = localEntry.lives;
        this.ui.updateLives(local.lives, local.maxLives ?? 3);
        if (wasGameOver) {
          this.soundManager.playGameOver();
          this.ui.showGameOver(local.lives, local.maxLives ?? 3);
        }
      }
    });

    this.network.addEventListener('init', (e) => {
      this.world.setFromArray(e.detail.blocks);
      this.voxelMap.rebuildFromWorld();
      this.chestRenderer.loadChests(this.world.chests);
      this.doorRenderer.loadDoors(this.world.doors);
      this.pedestalRenderer.loadPedestals(this.world.objectives, { theme: this.pedestalTheme() });
      this.stairsRenderer.loadStairs(this.world.stairwells[0] || null);
      this.syncStairsFromWorld();
      if (this.world.isDoor1Open) {
        this.doorRenderer.setOpenInstant(1);
      }
      if (this.world.isDoor2Open) {
        this.doorRenderer.setOpenInstant(2);
      }
      if (Array.isArray(this.world.chests)) {
        for (const c of this.world.chests) {
          if (c.isOpen) {
            this.chestRenderer.setOpenInstant(c.id);
          }
        }
      }
      this.playerManager.setLocalId(e.detail.playerId);
      if (this.world.isDoor2Open) {
        this.ui.showNarrativeMessage('Las dos puertas ya están abiertas. El Santuario os espera.', 4000);
      } else if (this.world.isDoor1Open) {
        this.ui.showNarrativeMessage('Puerta 1 abierta. ¡Cruza el Abismo con el botón SALTAR!', 4000);
      }
    });
  }

  initNetworkTimers() {
    // Broadcast de snapshots (Host -> Clientes @ 20 Hz con sequence number)
    setInterval(() => {
      if (this.mode !== 'host') return;
      this.snapshotSeq = (this.snapshotSeq + 1) & 0xFFFF;
      const snapshots = this.playerManager.getSnapshots();
      this.network.broadcast(Proto.serializeSnapshot(this.snapshotSeq, snapshots));

      // Actualizar réplicas visuales en el host
      for (const p of snapshots) {
        if (p.id !== 0) {
          this.avatars.setTarget(p.id, p.x, p.y, p.z, p.yaw);
        }
      }
    }, 1000 / NET_CONFIG.SNAPSHOT_HZ);
  }

  initGameLoop() {
    const loop = new GameLoop({
      tickHz: PHYSICS_CONFIG.TICK_HZ,
      onTick: (dt) => {
        const FIXED_DT = 1 / PHYSICS_CONFIG.TICK_HZ;
        const local = this.playerManager.localPlayer;
        const move = this.input.getMovement();
        local.setInput(move.forward, move.right, this.input.yaw);
        local.pitch = this.input.pitch;

        // Muestreo determinista edge-triggered de acciones en el inicio del tick
        const jumpAction = this.input.consumeJump() ? Proto.ACTION_FLAGS.JUMP : 0;

        if (this.mode === 'host') {
          // 1. Simular jugador local del Host aplicando su acción con dt fijo
          this.simulation.integratePlayer(local, FIXED_DT, jumpAction);

          // 2. Desacoplar jitter de red consumiendo exactamente 1 input sanitizado por tick (30 Hz)
          for (const [conn, pid] of this.playerManager.connToPlayerId.entries()) {
            const remotePlayer = this.playerManager.players.get(pid);
            if (!remotePlayer) continue;
            const clientInput = this.inputQueue.dequeue(conn);
            if (clientInput) {
              remotePlayer.setInput(clientInput.dz, clientInput.dx, clientInput.yaw);
              remotePlayer.lastInputSeq = clientInput.seq || 0;
              this.simulation.integratePlayer(remotePlayer, FIXED_DT, clientInput.actions || 0);
            } else {
              this.simulation.integratePlayer(remotePlayer, FIXED_DT, 0);
            }
          }
        } else if (this.mode === 'client') {
          this.inputSeq = (this.inputSeq + 1) & 0xFFFF;

          // 1. Enviar input autoritativo con flags de acción al Host en lockstep con el tick de física
          this.network.sendToHost(
            Proto.serializeInput(
              this.inputSeq,
              local.inputRight,
              local.inputForward,
              local.yaw,
              jumpAction
            )
          );

          // 2. Registrar input en el buffer de predicción local con dt fijo y flags de acción
          this.reconciler.recordInput(
            this.inputSeq,
            FIXED_DT,
            local.inputForward,
            local.inputRight,
            local.yaw,
            jumpAction
          );

          // 3. Simular predicción local con la misma acción y dt fijo
          this.simulation.integratePlayer(local, FIXED_DT, jumpAction);
        }
      },
      onRender: (dt) => {
        if (this.mode) {
          const local = this.playerManager.localPlayer;
          local.updateVisualSmoothing(dt);
          this.cameraController.update(local, local.yaw, local.pitch);

          // Reflejar invulnerabilidad post-respawn en el HUD sin re-renderizar corazones
          const livesHud = document.getElementById('hud-lives');
          if (livesHud) {
            livesHud.classList.toggle('invuln', !!local.isInvulnerable);
          }

          if (this.mode === 'client') {
            // Interpolación temporal de entidades remotas (~100ms)
            this.reconciler.updateRemoteAvatars(this.avatars);

            // Transmitir telemetría de reconciliación al panel de diagnóstico
            const rStats = this.reconciler.getStats();
            this.network.stats.setReconciliationStats(
              rStats.predictionError,
              rStats.inputsInFlight,
              rStats.softCorrectionsPerSec,
              rStats.teleportsPerSec
            );
          }

          this.avatars.update(dt);
        }
        this.chestRenderer.update(dt);
        this.doorRenderer.update(dt);
        this.pedestalRenderer.update(dt);
        this.stairsRenderer.update(dt);
        this.sceneManager.render();
      },
    });

    loop.start();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new VoxelSandboxGame();
});
