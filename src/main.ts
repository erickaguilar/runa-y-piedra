import { Engine } from './core/Engine';
import { WorldRenderer } from './graphics/WorldRenderer';
import { PlayerMesh } from './graphics/PlayerMesh';
import { PhysicsWorld, PlayerPhysicsState } from './physics/PhysicsWorld';
import { InputManager } from './input/InputManager';
import { BinaryProtocol, PacketType, FullPlayerState, BlockChange, PlayerTransform } from './net/BinaryProtocol';
import { PeerNetwork } from './net/PeerNetwork';
import QRCode from 'qrcode';

class GameApp {
  private engine: Engine;
  private world: WorldRenderer;
  private physics: PhysicsWorld;
  private input: InputManager;
  private remotePlayer: PlayerMesh;
  private network: PeerNetwork;

  private localPlayer: PlayerPhysicsState = {
    x: 16,
    y: 2,
    z: 16,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: 0,
    onGround: false
  };

  private netSendTimer = 0;
  private actionCooldown = 0;

  // Reusable unpacking objects (Zero-GC)
  private tempTransform: PlayerTransform = { x: 0, z: 0, yaw: 0 };
  private tempFullState: FullPlayerState = { x: 0, y: 0, z: 0, yaw: 0 };
  private tempBlockChange: BlockChange = { x: 0, y: 0, z: 0, blockType: 0 };

  constructor() {
    const container = document.getElementById('canvas-container')!;
    this.engine = new Engine(container);
    this.world = new WorldRenderer(this.engine.scene);
    this.physics = new PhysicsWorld(this.world);
    this.input = new InputManager();
    this.remotePlayer = new PlayerMesh(this.engine.scene);
    this.remotePlayer.setVisible(false);

    this.network = new PeerNetwork({
      onConnected: (peerId) => this.handlePeerConnected(peerId),
      onDisconnected: () => this.handlePeerDisconnected(),
      onData: (buf) => this.handleNetworkData(buf),
      onError: (err) => this.handleNetworkError(err)
    });

    this.setupUI();
    this.checkAutoJoin();
    this.engine.registerRenderCallback(this.onUpdate.bind(this));
  }

  private setupUI(): void {
    const btnCreate = document.getElementById('btn-create-room')!;
    const btnJoin = document.getElementById('btn-join-room')!;
    const inputCode = document.getElementById('input-room-code') as HTMLInputElement;
    const roomStatus = document.getElementById('room-status')!;
    const lobbyPanel = document.getElementById('lobby-panel')!;
    const touchControls = document.getElementById('touch-controls')!;
    const reticle = document.getElementById('reticle')!;
    const qrModal = document.getElementById('qr-modal')!;
    const qrCanvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    const qrPinText = document.getElementById('qr-pin-text')!;
    const qrLinkText = document.getElementById('qr-link-text')!;
    const btnCloseQr = document.getElementById('btn-close-qr')!;

    btnCreate.addEventListener('click', async () => {
      btnCreate.setAttribute('disabled', 'true');
      roomStatus.classList.remove('hidden');
      roomStatus.textContent = 'Creando sala P2P...';

      try {
        const pin = await this.network.startHost();
        lobbyPanel.classList.add('hidden');

        // Determinar host para el enlace QR
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        // Si es localhost, sugerir la IP Wi-Fi local para que otro dispositivo pueda acceder
        const hostAddress = isLocal ? '192.168.100.28:3000' : window.location.host;
        const joinUrl = `${window.location.protocol}//${hostAddress}/?join=${pin}`;

        // Renderizar Código QR
        await QRCode.toCanvas(qrCanvas, joinUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });

        qrPinText.textContent = `PIN DE SALA: ${pin}`;
        qrLinkText.textContent = joinUrl;
        qrModal.classList.remove('hidden');
      } catch (err) {
        roomStatus.textContent = `Error al crear sala: ${err}`;
        btnCreate.removeAttribute('disabled');
      }
    });

    btnCloseQr.addEventListener('click', () => {
      qrModal.classList.add('hidden');
      touchControls.classList.remove('hidden');
      reticle.classList.remove('hidden');
    });

    btnJoin.addEventListener('click', async () => {
      const code = inputCode.value.trim().toUpperCase();
      if (code.length < 4) {
        alert('Ingresa un PIN de sala válido (4 dígitos).');
        return;
      }

      btnJoin.setAttribute('disabled', 'true');
      roomStatus.classList.remove('hidden');
      roomStatus.textContent = `Conectando a sala ${code}...`;

      try {
        await this.network.joinRoom(code);
        roomStatus.textContent = `¡Conectado a sala ${code}!`;
        this.startGameSession(lobbyPanel, touchControls, reticle);
      } catch (err) {
        roomStatus.textContent = `Fallo de conexión: ${err}`;
        btnJoin.removeAttribute('disabled');
      }
    });

    // Clic en canvas para activar Pointer Lock en ordenador
    this.engine.renderer.domElement.addEventListener('click', () => {
      if (lobbyPanel.classList.contains('hidden') && qrModal.classList.contains('hidden')) {
        this.engine.renderer.domElement.requestPointerLock?.();
      }
    });
  }

  private checkAutoJoin(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      const inputCode = document.getElementById('input-room-code') as HTMLInputElement;
      const btnJoin = document.getElementById('btn-join-room')!;
      if (inputCode && btnJoin) {
        inputCode.value = joinCode.toUpperCase();
        setTimeout(() => {
          btnJoin.click();
        }, 300);
      }
    }
  }

  private startGameSession(lobby: HTMLElement, touch: HTMLElement, reticle: HTMLElement): void {
    lobby.classList.add('hidden');
    touch.classList.remove('hidden');
    reticle.classList.remove('hidden');
  }

  private handlePeerConnected(_peerId: string): void {
    const pingHud = document.getElementById('ping-hud')!;
    pingHud.textContent = `P2P: Conectado (${this.network.isHost ? 'Host' : 'Cliente'})`;
    pingHud.style.color = '#4ade80';
    this.remotePlayer.setVisible(true);
  }

  private handlePeerDisconnected(): void {
    const pingHud = document.getElementById('ping-hud')!;
    pingHud.textContent = 'P2P: Desconectado';
    pingHud.style.color = '#f87171';
    this.remotePlayer.setVisible(false);
  }

  private handleNetworkError(err: Error): void {
    console.warn('[PeerNetwork Error]:', err);
  }

  private handleNetworkData(buffer: ArrayBuffer): void {
    const view = new DataView(buffer);
    if (view.byteLength === 0) return;

    const packetType = view.getUint8(0);

    switch (packetType) {
      case PacketType.MOVE_13_BYTE:
        BinaryProtocol.unpackMove13(view, this.tempTransform);
        this.remotePlayer.targetX = this.tempTransform.x;
        this.remotePlayer.targetZ = this.tempTransform.z;
        this.remotePlayer.targetYaw = this.tempTransform.yaw;
        break;

      case PacketType.STATE_FULL_17_BYTE:
        BinaryProtocol.unpackFullState17(view, this.tempFullState);
        this.remotePlayer.targetX = this.tempFullState.x;
        this.remotePlayer.targetY = this.tempFullState.y;
        this.remotePlayer.targetZ = this.tempFullState.z;
        this.remotePlayer.targetYaw = this.tempFullState.yaw;
        break;

      case PacketType.BLOCK_CHANGE_5_BYTE:
        BinaryProtocol.unpackBlockChange5(view, this.tempBlockChange);
        if (this.tempBlockChange.blockType > 0) {
          this.world.placeBlock(
            this.tempBlockChange.x,
            this.tempBlockChange.y,
            this.tempBlockChange.z,
            0xf43f5e // Bloque colocado por el compañero en color distintivo
          );
        }
        break;
    }
  }

  private onUpdate(deltaTime: number): void {
    // 1. Sincronizar rotación con input
    this.localPlayer.yaw = this.input.yaw;

    // 2. Físicas desacopladas a 30 Hz con colisiones AABB
    this.physics.update(
      deltaTime,
      this.localPlayer,
      this.input.moveX,
      this.input.moveZ,
      this.input.jump
    );

    // 3. Posicionar cámara en primera/tercera persona
    const eyeHeight = 1.6;
    const camX = this.localPlayer.x;
    const camY = this.localPlayer.y + eyeHeight;
    const camZ = this.localPlayer.z;

    this.engine.camera.position.set(camX, camY, camZ);

    // Dirección de la mirada según yaw y pitch
    const lookDirX = -Math.sin(this.input.yaw) * Math.cos(this.input.pitch);
    const lookDirY = Math.sin(this.input.pitch);
    const lookDirZ = -Math.cos(this.input.yaw) * Math.cos(this.input.pitch);

    this.engine.camera.lookAt(
      camX + lookDirX * 10,
      camY + lookDirY * 10,
      camZ + lookDirZ * 10
    );

    // 4. Acción de colocar bloque frente a la mirada
    if (this.actionCooldown > 0) {
      this.actionCooldown -= deltaTime;
    } else if (this.input.action) {
      this.actionCooldown = 0.3; // Cooldown de 300 ms para evitar spam
      const targetBlockX = Math.floor(camX + lookDirX * 2.5);
      const targetBlockY = Math.max(1, Math.floor(camY + lookDirY * 2.5));
      const targetBlockZ = Math.floor(camZ + lookDirZ * 2.5);

      if (this.world.placeBlock(targetBlockX, targetBlockY, targetBlockZ, 0x38bdf8)) {
        // Enviar evento de bloque a través del DataChannel
        const blockPkt = BinaryProtocol.packBlockChange5(targetBlockX, targetBlockY, targetBlockZ, 1);
        this.network.send(blockPkt);
      }
    }

    // 5. Suavizado (Lerp) del jugador remoto a 60 FPS
    this.remotePlayer.update(deltaTime);

    // 6. Transmisión de red a 30 Hz (Cero GC con Float32Array / DataView)
    this.netSendTimer += deltaTime;
    if (this.netSendTimer >= 1 / 30) {
      this.netSendTimer = 0;
      // Usar paquete completo de 17 bytes para posición 3D real
      const packet = BinaryProtocol.packFullState17(
        this.localPlayer.x,
        this.localPlayer.y,
        this.localPlayer.z,
        this.localPlayer.yaw
      );
      this.network.send(packet);
    }

    // 7. Actualización del HUD de rendimiento
    const drawCallsEl = document.getElementById('draw-calls');
    const triCountEl = document.getElementById('tri-count');
    if (drawCallsEl) drawCallsEl.textContent = `Calls: ${this.engine.getDrawCalls()}`;
    if (triCountEl) triCountEl.textContent = `Tris: ${this.engine.getTriangles().toLocaleString()}`;
  }
}

// Inicializar al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
