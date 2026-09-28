import { SceneManager } from './render/SceneManager.js';
import { VoxelMap } from './render/VoxelMap.js';
import { AvatarRenderer } from './render/AvatarRenderer.js';
import { ChestRenderer } from './render/ChestRenderer.js';
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
    this.avatars = new AvatarRenderer(this.sceneManager.scene);
    this.playerManager = new PlayerManager();
    this.simulation = new SimulationEngine(this.world, {
      onPlayerRespawn: (p, cp) => {
        if (p === this.playerManager.localPlayer) {
          const roomMsg = cp?.roomName ? ` en ${cp.roomName}` : '';
          this.ui.showNarrativeMessage(`⚠️ ¡Caíste al abismo! Reapareciendo${roomMsg}...`, 2800);
        }
      },
    });
    this.cameraController = new CameraController(this.sceneManager.camera);
    this.raycaster = new BlockRaycaster(this.sceneManager.camera, this.voxelMap, this.world);

    // 2. Red y UI
    this.network = new NetworkManager();
    this.ui = new UIManager();

    // 3. Controles
    this.input = new InputManager({
      canvas: this.canvas,
      onJump: null,
      onInteract: () => this.handleInteract(),
    });

    this.currentJoinUrl = null;
    this.inputSeq = 0;
    this.snapshotSeq = 0;
    this.inputQueue = new InputQueue();
    this.reconciler = new ClientReconciler();

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

    const spawn = levelData.spawn || { x: 12.0, y: 1.2, z: 4.5 };
    const local = this.playerManager.localPlayer;
    local.setCheckpoint(spawn.x, spawn.y, spawn.z, levelData.name);
    local.respawn();
    local.vel.x = 0;
    local.vel.y = 0;
    local.vel.z = 0;

    // Limpiar buffers de reconciliación y cola de inputs para evitar replay cruzado de niveles
    this.reconciler.reset();
    this.inputQueue.clear();

    this.ui.showNarrativeMessage(`Mapa cargado: ${levelData.name}`, 3500);

    if (broadcast && this.mode === 'host') {
      this.network.broadcast(Proto.serializeLevelChange(levelId));
    }
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
        this.openDoor(doorId);
      } else {
        this.network.sendToHost(Proto.serializeDoorOpen(doorId));
        this.ui.showNarrativeMessage(`Abriendo Puerta ${doorId}...`, 2500);
      }
    } else if (interaction.type === 'chest') {
      const chestId = interaction.chestId || 1;
      if (this.chestRenderer.isChestOpen(chestId)) return;

      if (this.mode === 'host') {
        this.openChest(chestId);
      } else {
        this.network.sendToHost(Proto.serializeChestOpen(chestId));
        this.ui.showNarrativeMessage('Abriendo cofre...', 1500);
      }
    } else if (interaction.type === 'pedestal') {
      const msg = interaction.message || '✨ ¡Pedestal Ancestral Activado! Habéis completado la Mazmorra Cooperativa con éxito.';
      this.ui.showNarrativeMessage(msg, 6000);
    }
  }

  openChest(chestId = 1) {
    const opened = this.chestRenderer.openChest(chestId);
    if (!opened) return;

    const chestData = this.world.chests?.find(c => c.id === chestId);
    if (chestData) chestData.isOpen = true;

    if (this.mode === 'host') {
      this.network.broadcast(Proto.serializeChestOpen(chestId));
    }

    const msg = chestData?.message || `📦 ¡Has abierto el ${chestData?.name || 'Cofre'}! Recompensa: ${chestData?.reward || 'Tesoros de la Mazmorra'}`;
    this.ui.showNarrativeMessage(msg, 5000);
  }

  openDoor(doorId = 1) {
    const isOpen = doorId === 1 ? this.world.isDoor1Open : this.world.isDoor2Open;
    if (isOpen) return;

    this.world.openDoor(doorId);
    this.voxelMap.openDoor(doorId);

    const door = this.world.doors?.find(d => d.id === doorId);
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
      this.openDoor(doorId);
    });

    this.network.addEventListener('chest-open', (e) => {
      const chestId = e.detail?.chestId || 1;
      this.openChest(chestId);
    });

    this.network.addEventListener('snapshot', (e) => {
      if (this.mode !== 'client') return;
      const players = Array.isArray(e.detail) ? e.detail : (e.detail?.players || []);
      const simTime = e.detail?.time || performance.now();
      const local = this.playerManager.localPlayer;
      this.reconciler.onSnapshot(simTime, players, local, this.simulation);
    });

    this.network.addEventListener('init', (e) => {
      this.world.setFromArray(e.detail.blocks);
      this.voxelMap.rebuildFromWorld();
      this.chestRenderer.loadChests(this.world.chests);
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
        this.sceneManager.render();
      },
    });

    loop.start();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new VoxelSandboxGame();
});
