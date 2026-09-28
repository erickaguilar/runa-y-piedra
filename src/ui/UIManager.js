import QRCode from 'qrcode';

export class UIManager {
  constructor({ uiContainerId = 'ui', crosshairId = 'crosshair', hudMessageId = 'hud-message' } = {}) {
    this.uiEl = document.getElementById(uiContainerId);
    this.crosshair = document.getElementById(crosshairId);
    this.hudMessage = document.getElementById(hudMessageId);
    this.messageTimeout = null;
  }

  showMenu({ onHost, onJoin }) {
    this.uiEl.innerHTML = `
      <div class="menu">
        <h1>VOXEL DUNGEON · CO-OP</h1>
        <button id="btn-host">Crear Mazmorra</button>
        <div style="margin-top:16px">
          <input id="pin-input" placeholder="0000" maxlength="4" inputmode="numeric" />
          <button id="btn-join" style="background:#3b82f6">Unirse</button>
        </div>
        <div class="status" id="status"></div>
      </div>`;

    document.getElementById('btn-host').onclick = onHost;
    document.getElementById('btn-join').onclick = () => {
      const pin = document.getElementById('pin-input').value.trim();
      onJoin(pin);
    };

    document.getElementById('pin-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const pin = document.getElementById('pin-input').value.trim();
        onJoin(pin);
      }
    });

    // Auto-join si existe parámetro ?join= en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinParam = urlParams.get('join');
    if (joinParam) {
      document.getElementById('pin-input').value = joinParam;
      setTimeout(() => onJoin(joinParam), 350);
    }
  }

  showHostRoom(pin, joinUrl, onPlay) {
    this.setCrosshairVisible(true);
    this.uiEl.innerHTML = `
      <div class="menu">
        <h1>PIN DE SALA</h1>
        <div style="font-size:38px;letter-spacing:8px;font-weight:700;margin:10px 0">${pin}</div>
        <canvas id="qr-canvas"></canvas>
        <div style="font-size:12px;color:#aaa">Escanea o comparte el PIN</div>
        <button id="btn-close-menu" style="margin-top:12px;background:#3b82f6;font-size:13px;padding:8px 16px;">Jugar</button>
      </div>`;

    const qrCanvas = document.getElementById('qr-canvas');
    if (qrCanvas) {
      QRCode.toCanvas(qrCanvas, joinUrl, { width: 140, margin: 1 });
    }

    document.getElementById('btn-close-menu')?.addEventListener('click', () => {
      this.hideMenu();
      onPlay?.();
    });

    setTimeout(() => {
      if (this.uiEl.innerHTML.includes('PIN DE SALA')) {
        this.hideMenu();
      }
    }, 12000);
  }

  hideMenu() {
    this.uiEl.innerHTML = '';
  }

  setStatus(msg) {
    const s = document.getElementById('status');
    if (s) s.textContent = msg;
  }

  setCrosshairVisible(visible) {
    if (this.crosshair) {
      this.crosshair.style.display = visible ? 'block' : 'none';
    }
  }

  showNarrativeMessage(text, durationMs = 4000) {
    if (!this.hudMessage) return;
    this.hudMessage.textContent = text;
    this.hudMessage.style.display = 'block';
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    if (durationMs > 0) {
      this.messageTimeout = setTimeout(() => {
        this.hideNarrativeMessage();
      }, durationMs);
    }
  }

  hideNarrativeMessage() {
    if (this.hudMessage) {
      this.hudMessage.style.display = 'none';
    }
  }
}
