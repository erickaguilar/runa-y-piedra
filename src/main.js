import { SceneManager } from './render/SceneManager.js';
import { VoxelMap } from './render/VoxelMap.js';
import { AvatarRenderer } from './render/AvatarRenderer.js';
import { ChestRenderer } from './render/ChestRenderer.js';
import { DoorRenderer } from './render/DoorRenderer.js';
import { PedestalRenderer } from './render/PedestalRenderer.js';
import { StairsRenderer } from './render/StairsRenderer.js';
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
import { escapeHtml } from './ui/Icons.js';
import { InteractionController } from './controllers/InteractionController.js';
import { DescentManager } from './controllers/DescentManager.js';
import { soundManager } from './audio/SoundManager.js';
import { InputMode } from './ui/InputMode.js';
import { NET_CONFIG, PHYSICS_CONFIG, PLAYER_HEROES, WORLD_CONFIG } from './config/constants.js';

// Auditoría automática de eventos de red WebRTC para diagnóstico en tiempo real
if (typeof window !== 'undefined') {
  const AUDIT_EVENTS = ['input', 'snapshot', 'block-edit', 'init', 'door-open', 'chest-open', 'peer-joined', 'peer-left', 'player-meta'];
  const origDispatch = window.__net_dispatch || EventTarget.prototype.dispatchEvent;
  if (!window.__net_dispatch) {
    window.__net_dispatch = origDispatch;
    window.__netAuditLogs = [];
    window.__netEventCounts = {};
    EventTarget.prototype.dispatchEvent = function(ev) {
      if (ev.type && AUDIT_EVENTS.includes(ev.type)) {
        window.__netEventCounts[ev.type] = (window.__netEventCounts[ev.type] || 0) + 1;
        window.__netAuditLogs.push({ time: Date.now(), type: ev.type, detail: ev.detail });
        if (window.__netAuditLogs.length > 200) window.__netAuditLogs.shift();

        if (ev.type === 'snapshot') {
          const count = window.__netEventCounts['snapshot'];
          if (count <= 3 || count % 20 === 0) {
            console.log(`📨 [snapshot] (#${count} @ 20Hz)`, ev.detail);
          }
        } else {
          console.log(`📨 [${ev.type}]`, ev.detail);
        }
      }
      return origDispatch.call(this, ev);
    };
    console.log('✅ Interceptor de auditoría WebRTC instalado.');
  }

  window.printNetAudit = () => {
    console.log('===== AUDITORÍA DE MENSAJES RUNE =====');
    console.log('Modo:', window.__game?.mode || 'menú');
    console.log('Conteo de eventos:', window.__netEventCounts);
    console.log('Últimos 10 eventos:', (window.__netAuditLogs || []).slice(-10));
    return window.__netEventCounts;
  };
}

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
    this.interaction = new InteractionController(this);
    this.descent = new DescentManager(this);
    this.interaction.ensureStairsState();
    this.avatars = new AvatarRenderer(this.sceneManager.scene);
    this.playerManager = new PlayerManager();
    this.simulation = new SimulationEngine(this.world, {
      onStairTouch: (p) => this.descent.onStairTouch(p),
      isTransitioning: () => !!(this.descent?.transitioning || this.interaction?.isTransitioning?.()),
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
          this.resetInventory({ keepGems: false, keepRelics: false });
          // Game Over = vuelta al lobby con todo reseteado (hub de la party)
          if (this.mode === 'host') {
            const lobbyId = this.world.levelRegistry.getAllLevels()[0]?.id || 'lobby_tutorial';
            this.switchLevel(lobbyId, true);
          }
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
    this.cameraController.setWorld(this.world);
    this.raycaster = new BlockRaycaster(this.sceneManager.camera, this.voxelMap, this.world);

    // 2. Red, Audio y UI
    this.network = new NetworkManager();
    this.ui = new UIManager();
    this.soundManager = soundManager;
    this.inventory = { keys: [], gems: 0, relics: [] };
    this.openedChestKeys = new Set();
    this.network.stats.setRenderer(this.sceneManager.renderer);
    this.inputMode = new InputMode();

    // 3. Controles adaptativos PC / Táctil
    this.input = new InputManager({
      canvas: this.canvas,
      inputMode: this.inputMode,
      isGameActive: () => !!this.mode,
      onJump: () => {},
      onInteract: () => this.interaction.handleInteract(),
      onCameraToggle: () => this.toggleCameraMode(),
      onSettingsToggle: () => this.toggleSettings(),
      onInventoryToggle: () => this.ui.toggleInventoryModal(),
    });
    this.cameraMode = localStorage.getItem('dungeon_camera') || 'first';

    // Banner flotante de controles para PC
    let pcHintTimer = null;
    const showPcHint = () => {
      if (!this.mode) return; // Solo en partida
      const hint = document.getElementById('pc-hint');
      if (!hint) return;
      hint.classList.add('shown');
      if (pcHintTimer) clearTimeout(pcHintTimer);
      pcHintTimer = setTimeout(() => hint.classList.remove('shown'), 6500);
    };

    this.inputMode.onModeChange((mode) => {
      if (mode === 'pc') {
        showPcHint();
      } else {
        const hint = document.getElementById('pc-hint');
        if (hint) hint.classList.remove('shown');
      }
    });

    this.currentJoinUrl = null;
    this.inputSeq = 0;
    this.snapshotSeq = 0;
    this.inputQueue = new InputQueue();
    this.reconciler = new ClientReconciler();
    // Salto con perdón: buffer 150ms + coyote time 120ms
    this.jumpBufferTime = 0;
    this.lastGroundTime = 0;

    // Aplicar calidad gráfica guardada
    const savedDpr = parseFloat(localStorage.getItem('dungeon_dpr') || '1.5');
    this.sceneManager.setQuality(savedDpr);

    this.initNetworkEvents();
    this.initNetworkTimers();
    this.initGameLoop();
    this.initSettings();
    this.initUI();
    if (typeof window !== 'undefined') window.__game = this;
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
      onCameraChange: (mode) => {
        this.setCameraMode(mode);
      },
      onLeaveGame: () => {
        window.location.href = window.location.origin + window.location.pathname;
      },
      getGameState: () => ({
        inGame: this.mode !== null,
        isHost: this.mode === 'host',
        roomPin: this.network.roomId ? this.network.roomId.replace(NET_CONFIG.ROOM_PREFIX, '') : null,
        joinUrl: this.currentJoinUrl,
        players: this.playerManager.getAllPlayers(),
      }),
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
      this.playerManager.setLocalId(0);
      this.avatars.remove(-1);

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
      this.resetInventory({ keepGems: false, keepRelics: false });
      const lvl = this.world.levelRegistry.getCurrentLevel();
      this.ui.setTutorialControlsVisible(lvl?.id === 'lobby_tutorial');
      const localInit = this.playerManager.localPlayer;
      this.input.yaw = Math.PI;
      localInit.yaw = Math.PI;
      localInit.resetLives();
      this.ui.updateLives(localInit.lives, localInit.maxLives);
      this.ui.setHasKey(false);

      this.ui.showNarrativeMessage(`🏰 ${lvl.name} (Sala PIN: ${pin}). Toca ⚙️ para invitar amigos.`, 5500);
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
    this.interaction.ensureStairsState();
    // Reset del descenso sincronizado al cambiar de mapa
    this.descent.reset();

    const spawn = levelData.spawn || { x: 12.0, y: 1.2, z: 4.5 };
    const allPlayers = this.playerManager.getAllPlayers();
    for (const pl of allPlayers) {
      pl.clearKeys?.();
      const spawnZ = pl.id === 0 ? spawn.z : spawn.z + 3.0;
      pl.setCheckpoint(spawn.x, spawn.y, spawnZ, levelData.name, levelData.id);
      pl.pos.x = spawn.x;
      pl.pos.y = spawn.y;
      pl.pos.z = spawnZ;
      if (pl.visualPos) {
        pl.visualPos.x = spawn.x;
        pl.visualPos.y = spawn.y;
        pl.visualPos.z = spawnZ;
      }
      pl.vel.x = 0;
      pl.vel.y = 0;
      pl.vel.z = 0;
      pl.onGround = true;
      pl.invulnTicks = 90; // 3s de invulnerabilidad garantizada en el nuevo nivel
      pl.resetLives();
    }

    // Reposicionar avatares visuales al nuevo punto de spawn
    for (const [id, a] of this.avatars.avatars.entries()) {
      const targetZ = id === 0 ? spawn.z : spawn.z + 3.0;
      a.target.x = spawn.x;
      a.target.y = spawn.y;
      a.target.z = targetZ;
      a.current.x = spawn.x;
      a.current.y = spawn.y;
      a.current.z = targetZ;
      a.mesh.position.set(spawn.x, spawn.y, targetZ);
    }

    const local = this.playerManager.localPlayer;
    this.resetInventory({ keepGems: true, keepRelics: true });
    this.ui.setLivesVisible(true);
    this.ui.updateLives(local.lives, local.maxLives);
    this.ui.setTutorialControlsVisible(levelData.id === 'lobby_tutorial');
    this.ui.setHasKey(false);
    // Fin de la transición del portal (el velo se retira sobre el nuevo mapa)
    this.ui.hideLevelTransition();

    // Limpiar buffers de reconciliación y cola de inputs para evitar replay cruzado de niveles
    this.reconciler.reset(performance.now() + 150);
    this.inputQueue.clear();

    this.ui.showNarrativeMessage(`Mapa cargado: ${levelData.name}`, 3500);
    if (levelData.id === 'lobby_tutorial') {
      const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: coarse)').matches
        : false;
      if (!isTouch) {
        this.ui.showNarrativeMessage('🎮 Controles: WASD mover · Click apuntar · Espacio saltar · E interactuar / bajar · V cámara', 7500);
      } else {
        this.ui.showNarrativeMessage('🎯 Practica: salta las losas ámbar, abre el 📦 cofre, usa la 🗝️ llave en la 🚪 puerta, empuja la 🪨 losa y baja.', 6500);
      }
    }

    if (broadcast && this.mode === 'host') {
      this.network.broadcast(Proto.serializeLevelChange(levelId));
    }
  }


  /** Alterna 1ª/3ª persona (tecla V o ajustes). Persiste la preferencia. */
  toggleCameraMode() {
    this.setCameraMode(this.cameraMode === 'third' ? 'first' : 'third');
  }

  /** Abre o cierra el modal de configuración (tecla Escape). */
  toggleSettings() {
    if (this.ui.isInventoryOpen || document.getElementById('modal-inventory-overlay')) {
      this.ui.closeInventoryModal();
      return;
    }
    if (this.ui.isSettingsOpen || document.getElementById('modal-settings')) {
      this.ui.closeSettingsModal();
    } else if (this.mode) {
      this.ui.openSettingsModal();
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode === 'third' ? 'third' : 'first';
    localStorage.setItem('dungeon_camera', this.cameraMode);
    const local = this.playerManager.localPlayer;
    if (local) this.avatars.setLocalVisible(local.id, this.cameraMode === 'third');
    this.ui.showNarrativeMessage(
      this.cameraMode === 'third' ? '📷 Vista en tercera persona.' : '📷 Vista en primera persona.', 2000
    );
  }

  /** Tema visual del altar según la mazmorra activa (dorado / brasa / amatista). */
  pedestalTheme() {
    const id = this.world.levelRegistry.getCurrentLevel()?.id || '';
    if (id.includes('inferno')) return 'inferno';
    if (id.includes('abyss')) return 'abyss';
    return 'classic';
  }

  /** Gestión del inventario de botín recolectado de cofres */
  addInventoryKey(key) {
    const keyObj = typeof key === 'string' ? { id: key, name: key } : (key || {});
    const keyId = keyObj.id || keyObj.name;
    if (!this.inventory.keys.some(k => (typeof k === 'string' ? k : (k.id || k.name)) === keyId)) {
      this.inventory.keys.push(keyObj);
      this.ui.updateInventory(this.inventory);
    }
  }

  /**
   * Elimina una llave del inventario (al ser consumida abriendo una puerta)
   * y actualiza el HUD y el modal de inventario en tiempo real.
   */
  removeInventoryKey(keyId) {
    if (!keyId || !Array.isArray(this.inventory?.keys)) return false;
    const targetId = typeof keyId === 'object' ? (keyId.id || keyId.name) : keyId;
    const idx = this.inventory.keys.findIndex(k => (typeof k === 'string' ? k : (k.id || k.name)) === targetId);
    if (idx !== -1) {
      this.inventory.keys.splice(idx, 1);
      this.ui.updateInventory(this.inventory);
      return true;
    }
    return false;
  }

  addInventoryGems(amount) {
    const n = parseInt(amount, 10);
    if (!isNaN(n) && n > 0) {
      this.inventory.gems = (this.inventory.gems || 0) + n;
      this.ui.updateInventory(this.inventory);
    }
  }

  addInventoryRelic(relic) {
    const relicObj = typeof relic === 'string' ? { id: relic, name: relic } : (relic || {});
    const relicId = relicObj.id || relicObj.name;
    if (!this.inventory.relics.some(r => (r.id || r.name) === relicId)) {
      this.inventory.relics.push(relicObj);
      this.ui.updateInventory(this.inventory);
    }
  }

  /**
   * Elimina una reliquia del inventario (para altares, sacrificios o usos míticos)
   */
  removeInventoryRelic(relicId) {
    if (!relicId || !Array.isArray(this.inventory?.relics)) return false;
    const targetId = typeof relicId === 'object' ? (relicId.id || relicId.name) : relicId;
    const idx = this.inventory.relics.findIndex(r => (typeof r === 'string' ? r : (r.id || r.name)) === targetId);
    if (idx !== -1) {
      this.inventory.relics.splice(idx, 1);
      this.ui.updateInventory(this.inventory);
      return true;
    }
    return false;
  }

  resetInventory({ keepGems = false, keepRelics = false } = {}) {
    this.inventory = {
      keys: [],
      gems: keepGems ? (this.inventory?.gems || 0) : 0,
      relics: keepRelics ? [...(this.inventory?.relics || [])] : [],
    };
    if (!keepGems && !keepRelics) {
      this.openedChestKeys?.clear();
    }
    this.ui.updateInventory(this.inventory);
  }

  async joinRoom(pin, profile = {}, attempts = 2) {
    if (!/^\d{4}$/.test(pin)) {
      this.ui.setStatus('PIN inválido (debe contener 4 dígitos)');
      return;
    }
    const name = profile.name || 'Aventurero';
    const colorIndex = profile.colorIndex ?? 0;
    this.playerManager.setLocalProfile(name, colorIndex);

    for (let i = 1; i <= attempts; i++) {
      this.ui.setStatus(i === 1 ? 'Conectando a la mazmorra...' : `Reintentando conexión (${i}/${attempts})...`);
      try {
        await this.network.join(pin, { timeoutMs: 12000 });
        this.mode = 'client';
        break;
      } catch (e) {
        if (i === attempts) {
          this.ui.setStatus('Error de conexión: ' + (e?.message || e));
          return;
        }
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
    this.currentJoinUrl = `${window.location.protocol}//${window.location.host}/?join=${pin}`;
    this.ui.currentScreen = 'in_game';
    this.ui.setCrosshairVisible(true);
    this.ui.setActionButtonsVisible(true);
    this.ui.hideMenu();
    this.resetInventory({ keepGems: false, keepRelics: false });
    this.ui.setLivesVisible(true);
    const curLevel = this.world.levelRegistry.getCurrentLevel();
    this.ui.setTutorialControlsVisible(curLevel?.id === 'lobby_tutorial');
    const localCli = this.playerManager.localPlayer;
    localCli.resetLives();
    this.ui.updateLives(localCli.lives, localCli.maxLives);
    this.ui.setHasKey(false);
    this.ui.showNarrativeMessage(`Conectado como ${escapeHtml(name)}. Explorad juntos.`, 5000);
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

      // 5. Sincronizar cofres ya abiertos
      if (Array.isArray(this.world.chests)) {
        for (const c of this.world.chests) {
          if (c.isOpen) {
            this.network.sendTo(conn, Proto.serializeChestOpen(c.id));
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
        this.ui.showNarrativeMessage(`⚠️ ${escapeHtml(removedPlayer.name)} ha abandonado la partida.`, 4000);
        this.ui.updatePartyList(this.playerManager.getAllPlayers());
      }
    });

    this.network.addEventListener('version-mismatch', (e) => {
      const { hostVersion, clientVersion } = e.detail;
      alert(`Versión de protocolo incompatible.\nHost v${hostVersion} vs Cliente v${clientVersion}.\nPor favor, actualiza tu versión del juego.`);
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
          this.avatars.setMetadata(player.id, name, hero.hex, hero.id || null);
          this.ui.showNarrativeMessage(`🛡️ ¡${escapeHtml(name)} (${hero.name}) se unió a la partida!`, 4500);

          // Transmitir metadatos oficiales del jugador a todos los clientes
          this.network.broadcast(Proto.serializePlayerMeta(player.id, colorIndex, name));
          this.ui.updatePartyList(this.playerManager.getAllPlayers());
        }
      } else if (this.mode === 'client') {
        // Evitar procesar metadatos de otros jugadores antes de recibir INIT (cuando localPlayer.id sigue en -1)
        if (this.playerManager.localPlayer.id === -1 && playerId !== 0) {
          return;
        }
        this.playerManager.updatePlayerMeta(playerId, name, colorIndex);
        if (playerId !== this.playerManager.localPlayer.id) {
          this.avatars.setMetadata(playerId, name, hero.hex, hero.id || null);
          const av = this.avatars.avatars.get(playerId);
          if (av) {
            av.isLocal = false;
            av.mesh.visible = true;
          }
          if (playerId === 0) {
            this.ui.showNarrativeMessage(`🏰 Mazmorra de ${escapeHtml(name)} (${hero.name})`, 4000);
          } else {
            this.ui.showNarrativeMessage(`🛡️ ¡${escapeHtml(name)} (${hero.name}) se unió!`, 4000);
          }
        }
        this.ui.updatePartyList(this.playerManager.getAllPlayers());
      }
    });

    this.network.addEventListener('input', (e) => {
      if (this.mode !== 'host') return;
      this.inputQueue.enqueue(e.detail.conn, e.detail);
    });

    this.interaction.bindNetworkEvents();

    this.network.addEventListener('descent', (e) => {
      this.descent.onDescendEvent(e.detail || {});
    });

    this.network.addEventListener('snapshot', (e) => {
      if (this.mode !== 'client') return;
      const players = Array.isArray(e.detail) ? e.detail : (e.detail?.players || []);
      const simTime = e.detail?.time || performance.now();
      const local = this.playerManager.localPlayer;
      this.reconciler.onSnapshot(simTime, players, local, this.simulation);

      // Posicionamiento inmediato si el avatar remoto aún no se había inicializado
      for (const p of players) {
        if (p.id !== local.id) {
          const remoteAv = this.avatars.avatars.get(p.id);
          if (!remoteAv) {
            this.avatars.setTarget(p.id, p.x, p.y, p.z, p.yaw);
          } else {
            remoteAv.isLocal = false;
            remoteAv.mesh.visible = true;
          }
        }
      }

      // Sincronización autoritativa de vidas desde el host
      const localEntry = players.find(p => p.id === local.id);
      if (localEntry && localEntry.lives !== undefined && localEntry.lives !== local.lives) {
        const wasGameOver = localEntry.lives >= (local.maxLives ?? 3) && local.lives <= 0;
        local.lives = localEntry.lives;
        this.ui.updateLives(local.lives, local.maxLives ?? 3);
        if (wasGameOver) {
          this.soundManager.playGameOver();
          this.ui.showGameOver(local.lives, local.maxLives ?? 3);
          this.resetInventory({ keepGems: false, keepRelics: false });
        }
      }
    });

    this.network.addEventListener('init', (e) => {
      this.world.setFromArray(e.detail.blocks);
      this.voxelMap.rebuildFromWorld();
      this.chestRenderer.loadChests(this.world.chests);
      this.doorRenderer.loadDoors(this.world.doors);
      this.pedestalRenderer.loadPedestals(this.world.objectives, { theme: this.pedestalTheme() });
      this.interaction.ensureStairsState();
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
            this.interaction.collectChestLoot(c);
          }
        }
      }
      this.playerManager.setLocalId(e.detail.playerId);
      const local = this.playerManager.localPlayer;
      this.avatars.remove(-1);
      const myAv = this.avatars.avatars.get(local.id);
      if (myAv) {
        myAv.isLocal = true;
        myAv.mesh.visible = (this.cameraMode === 'third');
      }

      // Colocar al jugador invitado en el punto de spawn de invitado (offset +3 en Z)
      const spawnZ = WORLD_CONFIG.SPAWN_Z + 3.0;
      local.pos.x = WORLD_CONFIG.SPAWN_X;
      local.pos.y = WORLD_CONFIG.SPAWN_Y;
      local.pos.z = spawnZ;
      if (local.visualPos) {
        local.visualPos.x = WORLD_CONFIG.SPAWN_X;
        local.visualPos.y = WORLD_CONFIG.SPAWN_Y;
        local.visualPos.z = spawnZ;
      }
      local.yaw = Math.PI;
      this.input.yaw = Math.PI;

      // El avatar 0 es el anfitrión: asegurar que exista, sea visible y esté en el spawn del anfitrión
      const hostAvatar = this.avatars.ensure(0);
      hostAvatar.isLocal = false;
      hostAvatar.mesh.visible = true;
      hostAvatar.target.x = WORLD_CONFIG.SPAWN_X;
      hostAvatar.target.y = 1.2;
      hostAvatar.target.z = WORLD_CONFIG.SPAWN_Z;
      hostAvatar.current.x = WORLD_CONFIG.SPAWN_X;
      hostAvatar.current.y = 1.2;
      hostAvatar.current.z = WORLD_CONFIG.SPAWN_Z;
      hostAvatar.mesh.position.set(WORLD_CONFIG.SPAWN_X, 1.2, WORLD_CONFIG.SPAWN_Z);

      // Enviar metadatos oficiales del jugador con su ID asignado al host
      this.network.sendToHost(Proto.serializePlayerMeta(local.id, local.colorIndex, local.name));

      // Actualizar lista de miembros de la partida en el cliente
      this.ui.updatePartyList(this.playerManager.getAllPlayers());

      if (this.world.isDoor2Open) {
        this.ui.showNarrativeMessage('Las dos puertas ya están abiertas. El Santuario os espera.', 4000);
      } else if (this.world.isDoor1Open) {
        this.ui.showNarrativeMessage('Puerta 1 abierta. ¡Cruza el Abismo con el botón SALTAR!', 4000);
      }
    });
  }

  initNetworkTimers() {
    // Broadcast de snapshots (Host -> Clientes @ 20 Hz, canal hot unreliable)
    setInterval(() => {
      if (this.mode !== 'host') return;
      this.snapshotSeq = (this.snapshotSeq + 1) & 0xFFFF;
      const snapshots = this.playerManager.getSnapshots();
      this.network.broadcastHot(Proto.serializeSnapshot(this.snapshotSeq, snapshots));

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
        const inTransition = !!(this.descent?.transitioning || this.interaction?.isTransitioning?.());
        const move = inTransition ? { forward: 0, right: 0 } : this.input.getMovement();
        local.setInput(move.forward, move.right, this.input.yaw);
        local.pitch = this.input.pitch;

        // Salto con perdón: buffer 150ms (pulsa antes de aterrizar) + coyote 120ms
        // (salta justo después de dejar el borde). El sonido va en la ejecución.
        const nowMs = performance.now();
        if (!inTransition && this.input.consumeJump()) this.jumpBufferTime = nowMs;
        if (local.onGround) this.lastGroundTime = nowMs;
        const hasBuffer = nowMs - (this.jumpBufferTime || -1e9) <= 150;
        const canCoyote = nowMs - (this.lastGroundTime || -1e9) <= 120;
        let jumpAction = 0;
        if (!inTransition && hasBuffer && (local.onGround || canCoyote)) {
          jumpAction = Proto.ACTION_FLAGS.JUMP;
          this.jumpBufferTime = 0;
          this.soundManager.playJump();
        }

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

          // 1. Enviar input autoritativo con flags de acción al Host en lockstep
          // (canal hot unreliable: si se pierde, el siguiente tick lo reemplaza)
          this.network.sendToHostHot(
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
          this.cameraController.update(local, local.yaw, local.pitch, this.cameraMode);

          // Avatar propio solo visible en tercera persona
          if (this.cameraMode === 'third') {
            const hero = local.hero || PLAYER_HEROES[local.colorIndex] || PLAYER_HEROES[0];
            this.avatars.updateLocal(local.id, local.visualPos.x, local.visualPos.y, local.visualPos.z, local.yaw, hero.hex || hero.color, hero.id || null);
          } else {
            this.avatars.setLocalVisible(local.id, false);
          }

          // Reflejar invulnerabilidad post-respawn en el HUD sin re-renderizar corazones
          const livesHud = document.getElementById('hud-lives');
          if (livesHud) {
            livesHud.classList.toggle('invuln', !!local.isInvulnerable);
          }

          // Botón contextual (~8 Hz): qué se puede usar cerca sin raycast costoso
          this._interactUiAcc = (this._interactUiAcc || 0) + dt;
          if (this._interactUiAcc >= 0.12) {
            this._interactUiAcc = 0;
            this.ui.setInteractTarget(this.raycaster.getProximityTarget(local.pos));
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
