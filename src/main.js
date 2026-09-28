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
import { NET_CONFIG, BLOCK_TYPES, PHYSICS_CONFIG } from './config/constants.js';

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
      onPlace: () => this.handlePlaceBlock(),
      onDestroy: () => this.handleDestroyBlock(),
    });

    this.initNetworkEvents();
    this.initNetworkTimers();
    this.initGameLoop();
    this.initUI();
  }

  initUI() {
    this.ui.showMenu({
      onHost: () => this.startHost(),
      onJoin: (pin) => this.joinRoom(pin),
    });
  }

  async startHost() {
    this.ui.setStatus('Creando sala...');
    try {
      const pin = await this.network.host();
      this.mode = 'host';

      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const hostAddr = isLocal ? '192.168.100.28:5173' : window.location.host;
      const joinUrl = `${window.location.protocol}//${hostAddr}/?join=${pin}`;

      this.ui.showHostRoom(pin, joinUrl);
    } catch (e) {
      this.ui.setStatus('Error al crear sala: ' + (e?.message || e));
    }
  }

  async joinRoom(pin) {
    if (!/^\d{4}$/.test(pin)) {
      this.ui.setStatus('PIN inválido (debe contener 4 dígitos)');
      return;
    }
    this.ui.setStatus('Conectando a sala...');
    try {
      await this.network.join(pin);
      this.mode = 'client';
      this.ui.setCrosshairVisible(true);
      this.ui.hideMenu();
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

  handleDestroyBlock() {
    if (!this.mode) return;
    const target = this.raycaster.getTargetBlock();
    if (!target) return;
    this.applyBlockEdit(0, target.x, target.y, target.z);
  }

  handlePlaceBlock() {
    if (!this.mode) return;
    const target = this.raycaster.getTargetBlock();
    if (!target || !target.isPlaceValid) return;
    this.applyBlockEdit(1, target.placeCoord.x, target.placeCoord.y, target.placeCoord.z);
  }

  applyBlockEdit(action, x, y, z) {
    if (this.mode === 'host') {
      this.applyBlockEditLocal(action, x, y, z);
      this.network.broadcast(Proto.serializeBlock(action, x, y, z));
    } else {
      this.network.sendToHost(Proto.serializeBlock(action, x, y, z));
    }
  }

  applyBlockEditLocal(action, x, y, z) {
    // Proteger muros perimetrales de la arena
    if (action === 0 && this.world.isBorder(x, z) && y >= 4) return;

    if (action === 0) {
      if (this.world.get(x, y, z) !== 0) {
        this.world.set(x, y, z, BLOCK_TYPES.AIR);
        this.voxelMap.removeBlock(x, y, z);
      }
    } else {
      if (this.world.get(x, y, z) === 0) {
        this.world.set(x, y, z, BLOCK_TYPES.DIRT);
        this.voxelMap.addBlock(x, y, z, BLOCK_TYPES.DIRT);
      }
    }
  }

  initNetworkEvents() {
    this.network.addEventListener('peer-joined', (e) => {
      const conn = e.detail.conn;
      const remotePlayer = this.playerManager.addRemotePlayer(conn);
      this.network.sendTo(conn, Proto.serializeInit(this.world.blocks, remotePlayer.id));
      this.avatars.setTarget(
        remotePlayer.id,
        remotePlayer.pos.x,
        remotePlayer.pos.y,
        remotePlayer.pos.z,
        remotePlayer.yaw
      );
    });

    this.network.addEventListener('peer-left', (e) => {
      const removedPlayer = this.playerManager.removeByConnection(e.detail.conn);
      if (removedPlayer) {
        this.avatars.remove(removedPlayer.id);
      }
    });

    this.network.addEventListener('input', (e) => {
      if (this.mode !== 'host') return;
      const player = this.playerManager.getPlayerByConnection(e.detail.conn);
      if (player) {
        player.setInput(e.detail.dz, e.detail.dx, e.detail.yaw);
      }
    });

    this.network.addEventListener('block-edit', (e) => {
      if (this.mode !== 'host') return;
      const { action, x, y, z } = e.detail;
      this.applyBlockEditLocal(action, x, y, z);
      this.network.broadcast(Proto.serializeBlock(action, x, y, z));
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
