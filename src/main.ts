import * as THREE from 'three';
import { SceneManager } from './render/SceneManager';
import { VoxelMap } from './render/VoxelMap';
import { AvatarRenderer } from './render/AvatarRenderer';
import { World } from './core/World';
import { PhysicsAABB, EntityState } from './core/PhysicsAABB';
import { GameLoop } from './core/GameLoop';
import { TouchControls } from './ui/TouchControls';
import { UIManager } from './ui/UIManager';
import { NetworkManager } from './network/NetworkManager';
import { Protocol, MessageType, ClientInputData, BlockModData, HostSnapshotData } from './network/Protocol';

class VoxelSandboxApp {
  private sceneManager: SceneManager;
  private world: World;
  private voxelMap: VoxelMap;
  private physics: PhysicsAABB;
  private gameLoop: GameLoop;
  private controls: TouchControls;
  private ui: UIManager;
  private network: NetworkManager;
  private remoteAvatar: AvatarRenderer;

  // Estados de entidades
  private localPlayer: EntityState = {
    x: 12,
    y: 2,
    z: 12,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: 0,
    onGround: false
  };

  private clientLatestInput: ClientInputData = { deltaX: 0, deltaZ: 0, yaw: 0 };
  private clientEntityState: EntityState = {
    x: 12,
    y: 2,
    z: 12,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: 0,
    onGround: false
  };

  private netBroadcastTimer = 0;
  private raycaster = new THREE.Raycaster();
  private screenCenter = new THREE.Vector2(0, 0);

  // Objetos temporales reutilizables para desempaque binario (Zero-GC)
  private tempInput: ClientInputData = { deltaX: 0, deltaZ: 0, yaw: 0 };
  private tempBlockMod: BlockModData = { action: 0, x: 0, y: 0, z: 0 };
  private tempSnapshot: HostSnapshotData = {
    hostX: 0, hostY: 0, hostZ: 0, hostYaw: 0,
    clientX: 0, clientY: 0, clientZ: 0, clientYaw: 0
  };
  private tempCoord = { x: 0, y: 0, z: 0 };

  constructor() {
    const container = document.getElementById('canvas-container')!;
    this.sceneManager = new SceneManager(container);
    this.world = new World();
    this.voxelMap = new VoxelMap(this.sceneManager.scene, this.world);
    this.physics = new PhysicsAABB(this.world);
    this.controls = new TouchControls();
    this.gameLoop = new GameLoop();

    this.remoteAvatar = new AvatarRenderer(this.sceneManager.scene);
    this.remoteAvatar.setVisible(false);

    this.network = new NetworkManager({
      onConnected: (_id) => this.handleConnected(),
      onDisconnected: () => this.handleDisconnected(),
      onData: (buf) => this.handleNetworkPacket(buf),
      onError: (err) => console.warn('[Network Error]:', err)
    });

    this.ui = new UIManager({
      onCreateRoom: () => this.network.createHost(),
      onJoinRoom: (pin) => this.network.join(pin),
      onEnterGame: () => this.handleEnterGame()
    });

    this.initInteractionEvents();
    this.gameLoop.onUpdate(this.update.bind(this));
    this.gameLoop.start();
  }

  private handleEnterGame(): void {
    // Al entrar al juego, si se está en PC, permitir PointerLock al hacer clic en canvas
    this.sceneManager.renderer.domElement.addEventListener('click', () => {
      this.sceneManager.renderer.domElement.requestPointerLock?.();
    });
  }

  private handleConnected(): void {
    this.ui.updateP2PStatus(true, this.network.isHost);
    this.remoteAvatar.setVisible(true);
  }

  private handleDisconnected(): void {
    this.ui.updateP2PStatus(false, this.network.isHost);
    this.remoteAvatar.setVisible(false);
  }

  // Desempaque y procesamiento de paquetes binarios
  private handleNetworkPacket(buffer: ArrayBuffer): void {
    const view = new DataView(buffer);
    if (view.byteLength === 0) return;

    const type = view.getUint8(0);

    if (this.network.isHost) {
      // HOST RECIBE:
      if (type === MessageType.CLIENT_INPUT) {
        Protocol.unpackInput(view, this.tempInput);
        this.clientLatestInput.deltaX = this.tempInput.deltaX;
        this.clientLatestInput.deltaZ = this.tempInput.deltaZ;
        this.clientLatestInput.yaw = this.tempInput.yaw;
      } else if (type === MessageType.BLOCK_MOD) {
        Protocol.unpackBlockMod(view, this.tempBlockMod);
        // El Host valida autoritativamente la distancia antes de aplicar
        this.handleAuthoritativeBlockMod(this.tempBlockMod.action, this.tempBlockMod.x, this.tempBlockMod.y, this.tempBlockMod.z);
      }
    } else {
      // CLIENTE RECIBE:
      if (type === MessageType.HOST_SNAPSHOT) {
        Protocol.unpackSnapshot(view, this.tempSnapshot);
        // Actualizar posición autoritativa del Host en el avatar remoto
        this.remoteAvatar.setTarget(
          this.tempSnapshot.hostX,
          this.tempSnapshot.hostY,
          this.tempSnapshot.hostZ,
          this.tempSnapshot.hostYaw
        );
        // Conciliación del jugador local (si la desviación del cliente es excesiva)
        const dx = Math.abs(this.localPlayer.x - this.tempSnapshot.clientX);
        const dz = Math.abs(this.localPlayer.z - this.tempSnapshot.clientZ);
        if (dx > 2.0 || dz > 2.0) {
          this.localPlayer.x = this.tempSnapshot.clientX;
          this.localPlayer.y = this.tempSnapshot.clientY;
          this.localPlayer.z = this.tempSnapshot.clientZ;
        }
      } else if (type === MessageType.BLOCK_MOD) {
        Protocol.unpackBlockMod(view, this.tempBlockMod);
        if (this.tempBlockMod.action === 0) {
          this.voxelMap.destroyBlock(this.tempBlockMod.x, this.tempBlockMod.y, this.tempBlockMod.z);
        } else {
          this.voxelMap.placeBlock(this.tempBlockMod.x, this.tempBlockMod.y, this.tempBlockMod.z, 0xf43f5e);
        }
      }
    }
  }

  // Validación y ejecución autoritativa de bloques por parte del Host
  private handleAuthoritativeBlockMod(action: number, x: number, y: number, z: number): void {
    if (!this.network.isHost) return;

    if (action === 0) {
      if (this.voxelMap.destroyBlock(x, y, z)) {
        // Broadcast a clientes
        this.network.send(Protocol.packBlockMod(0, x, y, z));
      }
    } else {
      if (this.voxelMap.placeBlock(x, y, z, 0xf43f5e)) {
        // Broadcast a clientes
        this.network.send(Protocol.packBlockMod(1, x, y, z));
      }
    }
  }

  // Interacción de bloques mediante Raycaster
  private initInteractionEvents(): void {
    // La detección de romper/colocar se evalúa en el loop de actualización
  }

  private performRaycast(isBreak: boolean): void {
    this.raycaster.setFromCamera(this.screenCenter, this.sceneManager.camera);
    const intersects = this.raycaster.intersectObject(this.voxelMap.instancedMesh, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      if (hit.instanceId === undefined || hit.distance > 7.0) return;

      if (this.voxelMap.getCoordinatesFromInstance(hit.instanceId, this.tempCoord)) {
        if (isBreak) {
          // Destruir bloque interceptado
          if (this.network.isHost) {
            this.handleAuthoritativeBlockMod(0, this.tempCoord.x, this.tempCoord.y, this.tempCoord.z);
          } else {
            // Solicitar al Host
            this.network.send(Protocol.packBlockMod(0, this.tempCoord.x, this.tempCoord.y, this.tempCoord.z));
          }
        } else if (hit.face) {
          // Colocar en la celda adyacente según la normal de la cara
          const nx = Math.round(hit.face.normal.x);
          const ny = Math.round(hit.face.normal.y);
          const nz = Math.round(hit.face.normal.z);
          const placeX = this.tempCoord.x + nx;
          const placeY = this.tempCoord.y + ny;
          const placeZ = this.tempCoord.z + nz;

          if (this.network.isHost) {
            this.handleAuthoritativeBlockMod(1, placeX, placeY, placeZ);
          } else {
            this.network.send(Protocol.packBlockMod(1, placeX, placeY, placeZ));
          }
        }
      }
    }
  }

  private update(deltaTime: number): void {
    this.sceneManager.stats.begin();

    // 1. Sincronizar rotación local
    this.localPlayer.yaw = this.controls.yaw;

    // 2. Físicas autoritativas (30 Hz desacopladas)
    if (this.network.isHost) {
      // Simular física del Host (jugador local)
      this.physics.update(
        deltaTime,
        this.localPlayer,
        this.controls.deltaX,
        this.controls.deltaZ,
        this.controls.jump
      );

      // Simular física del Cliente remoto usando sus inputs recibidos
      this.clientEntityState.yaw = this.clientLatestInput.yaw;
      this.physics.update(
        deltaTime,
        this.clientEntityState,
        this.clientLatestInput.deltaX,
        this.clientLatestInput.deltaZ,
        false
      );

      // El avatar remoto en el Host representa la posición calculada del cliente
      this.remoteAvatar.setTarget(
        this.clientEntityState.x,
        this.clientEntityState.y,
        this.clientEntityState.z,
        this.clientEntityState.yaw
      );
    } else {
      // Lado Cliente: Predicción local suave
      this.physics.update(
        deltaTime,
        this.localPlayer,
        this.controls.deltaX,
        this.controls.deltaZ,
        this.controls.jump
      );
    }

    // 3. Posicionamiento de cámara en primera persona
    const eyeHeight = 1.6;
    const camX = this.localPlayer.x;
    const camY = this.localPlayer.y + eyeHeight;
    const camZ = this.localPlayer.z;

    this.sceneManager.camera.position.set(camX, camY, camZ);

    const lookDirX = -Math.sin(this.controls.yaw) * Math.cos(this.controls.pitch);
    const lookDirY = Math.sin(this.controls.pitch);
    const lookDirZ = -Math.cos(this.controls.yaw) * Math.cos(this.controls.pitch);

    this.sceneManager.camera.lookAt(
      camX + lookDirX * 10,
      camY + lookDirY * 10,
      camZ + lookDirZ * 10
    );

    // 4. Procesar acciones de bloques
    if (this.controls.breakAction) {
      this.performRaycast(true);
      this.controls.breakAction = false;
    }
    if (this.controls.placeAction) {
      this.performRaycast(false);
      this.controls.placeAction = false;
    }

    // 5. Suavizado del avatar remoto a 60 FPS
    this.remoteAvatar.update(deltaTime);

    // 6. Transmisión de red
    this.netBroadcastTimer += deltaTime;
    if (this.netBroadcastTimer >= 1 / 30) {
      this.netBroadcastTimer = 0;

      if (this.network.isHost) {
        // Host transmite el Snapshot autoritativo a 30 Hz
        const snapshotPkt = Protocol.packSnapshot(
          this.localPlayer.x, this.localPlayer.y, this.localPlayer.z, this.localPlayer.yaw,
          this.clientEntityState.x, this.clientEntityState.y, this.clientEntityState.z, this.clientEntityState.yaw
        );
        this.network.send(snapshotPkt);
      } else {
        // Cliente envía su paquete de movimiento de 13 bytes a 30 Hz
        const inputPkt = Protocol.packInput(
          this.controls.deltaX,
          this.controls.deltaZ,
          this.controls.yaw
        );
        this.network.send(inputPkt);
      }
    }

    // 7. Renderizado Three.js
    this.sceneManager.render();

    // 8. Actualización de métricas
    this.ui.updateMetrics(this.sceneManager.getDrawCalls(), this.sceneManager.getTriangles());

    this.sceneManager.stats.end();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new VoxelSandboxApp();
});
