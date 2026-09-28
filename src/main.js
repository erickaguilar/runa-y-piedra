import { SceneManager } from './render/SceneManager.js';
import { VoxelMap } from './render/VoxelMap.js';
import { AvatarRenderer } from './render/AvatarRenderer.js';
import { World } from './core/World.js';
import { GameLoop } from './core/GameLoop.js';
import { PlayerManager } from './entities/PlayerManager.js';
import { SimulationEngine } from './simulation/SimulationEngine.js';
import { InputManager } from './input/InputManager.js';
import { CameraController } from './camera/CameraController.js';
import { BlockRaycaster } from './interaction/BlockRaycaster.js';
import { NetworkManager } from './network/NetworkManager.js';
import * as Proto from './network/Protocol.js';
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
    this.avatars = new AvatarRenderer(this.sceneManager.scene);
    this.playerManager = new PlayerManager();
    this.simulation = new SimulationEngine(this.world);
    this.cameraController = new CameraController(this.sceneManager.camera);
    this.raycaster = new BlockRaycaster(this.sceneManager.camera, this.voxelMap, this.world);

    // 2. Red y UI
    this.network = new NetworkManager();
    this.ui = new UIManager();

    // 3. Controles
    this.input = new InputManager({
      canvas: this.canvas,
      onJump: () => this.handleJump(),
      onInteract: () => this.handleInteract(),
    });

    this.currentJoinUrl = null;

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
        roomPin: this.network.roomId ? this.network.roomId.replace(NET_CONFIG.ROOM_PREFIX, '') : null,
        joinUrl: this.currentJoinUrl,
      }),
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

      const hero = PLAYER_HEROES[colorIndex] || PLAYER_HEROES[0];
      this.ui.showHostRoom(pin, joinUrl, {
        hostName: name,
        hostColorHex: hero.color,
        onPlay: () => {
          this.ui.showNarrativeMessage(`Sala 1: Vestíbulo de la Mazmorra. Adelante, ${name}.`, 5000);
        },
      });
    } catch (e) {
      this.ui.setStatus('Error al crear sala: ' + (e?.message || e));
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
      local.vel.y = PHYSICS_CONFIG.JUMP_VELOCITY;
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
    } else if (interaction.type === 'pedestal') {
      this.ui.showNarrativeMessage('✨ ¡Pedestal Ancestral Activado! Habéis completado la Mazmorra Cooperativa con éxito.', 6000);
    }
  }

  openDoor(doorId = 1) {
    const isOpen = doorId === 1 ? this.world.isDoor1Open : this.world.isDoor2Open;
    if (isOpen) return;

    this.world.openDoor(doorId);
    this.voxelMap.openDoor(doorId);

    if (doorId === 1) {
      this.ui.showNarrativeMessage('🚪 ¡Puerta 1 abierta! Sala 2: El Abismo. ¡Usa el botón SALTAR para cruzar las plataformas!', 6500);
    } else if (doorId === 2) {
      this.ui.showNarrativeMessage('🚪 ¡Puerta 2 abierta! ¡Has superado el Abismo! Avanzad al Santuario Ancestral.', 5000);
    }

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
      const removedPlayer = this.playerManager.removeByConnection(e.detail.conn);
      if (removedPlayer) {
        this.avatars.remove(removedPlayer.id);
        this.ui.showNarrativeMessage(`⚠️ ${removedPlayer.name} ha abandonado la partida.`, 4000);
        this.ui.updatePartyList(this.playerManager.getAllPlayers());
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
      const player = this.playerManager.getPlayerByConnection(e.detail.conn);
      if (player) {
        player.setInput(e.detail.dz, e.detail.dx, e.detail.yaw);
      }
    });

    this.network.addEventListener('door-open', (e) => {
      const doorId = e.detail?.doorId || 1;
      this.openDoor(doorId);
    });

    this.network.addEventListener('snapshot', (e) => {
      if (this.mode !== 'client') return;
      for (const p of e.detail) {
        if (p.id !== this.playerManager.localPlayer.id) {
          this.avatars.setTarget(p.id, p.x, p.y, p.z, p.yaw);
        }
      }
    });

    this.network.addEventListener('init', (e) => {
      this.world.setFromArray(e.detail.blocks);
      this.voxelMap.rebuildFromWorld();
      this.playerManager.setLocalId(e.detail.playerId);
      if (this.world.isDoor2Open) {
        this.ui.showNarrativeMessage('Las dos puertas ya están abiertas. El Santuario os espera.', 4000);
      } else if (this.world.isDoor1Open) {
        this.ui.showNarrativeMessage('Puerta 1 abierta. ¡Cruza el Abismo con el botón SALTAR!', 4000);
      }
    });
  }

  initNetworkTimers() {
    // 1. Envío de inputs (Cliente -> Host @ 30 Hz)
    setInterval(() => {
      if (this.mode !== 'client') return;
      const local = this.playerManager.localPlayer;
      this.network.sendToHost(Proto.serializeInput(local.inputRight, local.inputForward, local.yaw));
    }, 1000 / NET_CONFIG.INPUT_HZ);

    // 2. Broadcast de snapshots (Host -> Clientes @ 20 Hz)
    setInterval(() => {
      if (this.mode !== 'host') return;
      const snapshots = this.playerManager.getSnapshots();
      this.network.broadcast(Proto.serializeSnapshot(snapshots));

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
        const local = this.playerManager.localPlayer;
        const move = this.input.getMovement();
        local.setInput(move.forward, move.right, this.input.yaw);
        local.pitch = this.input.pitch;

        if (this.input.consumeJump()) {
          this.handleJump();
        }

        if (this.mode === 'host') {
          this.simulation.stepHost(this.playerManager, dt);
        } else if (this.mode === 'client') {
          this.simulation.stepClient(this.playerManager, dt);
        }
      },
      onRender: (dt) => {
        if (this.mode) {
          const local = this.playerManager.localPlayer;
          this.cameraController.update(local, local.yaw, local.pitch);
          this.avatars.update(dt);
        }
        this.sceneManager.render();
      },
    });

    loop.start();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new VoxelSandboxGame();
});
