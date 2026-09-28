import QRCode from 'qrcode';

export interface UICallbacks {
  onCreateRoom: () => Promise<string>;
  onJoinRoom: (pin: string) => Promise<void>;
  onEnterGame: () => void;
}

export class UIManager {
  private lobbyPanel: HTMLElement;
  private qrModal: HTMLElement;
  private touchControls: HTMLElement;
  private reticle: HTMLElement;
  private roomStatus: HTMLElement;
  private inputCode: HTMLInputElement;
  private btnCreate: HTMLButtonElement;
  private btnJoin: HTMLButtonElement;
  private btnCloseQr: HTMLButtonElement;
  private qrCanvas: HTMLCanvasElement;
  private qrPinText: HTMLElement;
  private qrLinkText: HTMLElement;
  private pingHud: HTMLElement;
  private drawCallsEl: HTMLElement | null;
  private triCountEl: HTMLElement | null;

  private callbacks: UICallbacks;

  constructor(callbacks: UICallbacks) {
    this.callbacks = callbacks;

    this.lobbyPanel = document.getElementById('lobby-panel')!;
    this.qrModal = document.getElementById('qr-modal')!;
    this.touchControls = document.getElementById('touch-controls')!;
    this.reticle = document.getElementById('reticle')!;
    this.roomStatus = document.getElementById('room-status')!;
    this.inputCode = document.getElementById('input-room-code') as HTMLInputElement;
    this.btnCreate = document.getElementById('btn-create-room') as HTMLButtonElement;
    this.btnJoin = document.getElementById('btn-join-room') as HTMLButtonElement;
    this.btnCloseQr = document.getElementById('btn-close-qr') as HTMLButtonElement;
    this.qrCanvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    this.qrPinText = document.getElementById('qr-pin-text')!;
    this.qrLinkText = document.getElementById('qr-link-text')!;
    this.pingHud = document.getElementById('ping-hud')!;
    this.drawCallsEl = document.getElementById('draw-calls');
    this.triCountEl = document.getElementById('tri-count');

    this.initEvents();
    this.checkAutoJoin();
  }

  private initEvents(): void {
    this.btnCreate.addEventListener('click', async () => {
      this.btnCreate.disabled = true;
      this.roomStatus.classList.remove('hidden');
      this.roomStatus.textContent = 'Creando sala P2P...';

      try {
        const pin = await this.callbacks.onCreateRoom();
        this.lobbyPanel.classList.add('hidden');

        // Construir enlace directo para el código QR
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const hostAddress = isLocal ? '192.168.100.28:3000' : window.location.host;
        const joinUrl = `${window.location.protocol}//${hostAddress}/?join=${pin}`;

        await QRCode.toCanvas(this.qrCanvas, joinUrl, {
          width: 200,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' }
        });

        this.qrPinText.textContent = `PIN DE SALA: ${pin}`;
        this.qrLinkText.textContent = joinUrl;
        this.qrModal.classList.remove('hidden');
      } catch (err) {
        this.roomStatus.textContent = `Error al crear sala: ${err}`;
        this.btnCreate.disabled = false;
      }
    });

    this.btnCloseQr.addEventListener('click', () => {
      this.qrModal.classList.add('hidden');
      this.showGameUI();
      this.callbacks.onEnterGame();
    });

    this.btnJoin.addEventListener('click', async () => {
      const pin = this.inputCode.value.trim().toUpperCase();
      if (pin.length < 4) {
        alert('Ingresa un PIN de sala válido (4 dígitos).');
        return;
      }

      this.btnJoin.disabled = true;
      this.roomStatus.classList.remove('hidden');
      this.roomStatus.textContent = `Conectando a sala ${pin}...`;

      try {
        await this.callbacks.onJoinRoom(pin);
        this.lobbyPanel.classList.add('hidden');
        this.showGameUI();
        this.callbacks.onEnterGame();
      } catch (err) {
        this.roomStatus.textContent = `Fallo de conexión: ${err}`;
        this.btnJoin.disabled = false;
      }
    });
  }

  public showGameUI(): void {
    this.touchControls.classList.remove('hidden');
    this.reticle.classList.remove('hidden');
  }

  public updateP2PStatus(connected: boolean, isHost: boolean): void {
    if (connected) {
      this.pingHud.textContent = `P2P: Conectado (${isHost ? 'Host' : 'Cliente'})`;
      this.pingHud.style.color = '#4ade80';
    } else {
      this.pingHud.textContent = 'P2P: Desconectado';
      this.pingHud.style.color = '#f87171';
    }
  }

  public updateMetrics(drawCalls: number, triangles: number): void {
    if (this.drawCallsEl) this.drawCallsEl.textContent = `Calls: ${drawCalls}`;
    if (this.triCountEl) this.triCountEl.textContent = `Tris: ${triangles.toLocaleString()}`;
  }

  private checkAutoJoin(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const joinPin = urlParams.get('join');
    if (joinPin) {
      this.inputCode.value = joinPin.toUpperCase();
      setTimeout(() => {
        this.btnJoin.click();
      }, 350);
    }
  }
}
