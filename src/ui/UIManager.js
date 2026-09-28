import QRCode from 'qrcode';
import { PLAYER_HEROES } from '../config/constants.js';

export class UIManager {
  constructor({ uiContainerId = 'ui', crosshairId = 'crosshair', hudMessageId = 'hud-message' } = {}) {
    this.uiEl = document.getElementById(uiContainerId);
    this.crosshair = document.getElementById(crosshairId);
    this.hudMessage = document.getElementById(hudMessageId);
    this.messageTimeout = null;

    // Cargar perfil guardado del jugador
    this.selectedColorIndex = parseInt(localStorage.getItem('dungeon_player_color') || '0', 10);
    if (this.selectedColorIndex < 0 || this.selectedColorIndex >= PLAYER_HEROES.length) {
      this.selectedColorIndex = 0;
    }
    this.playerName = localStorage.getItem('dungeon_player_name') || 'Aventurero';
  }

  showMenu({ onHost, onJoin }) {
    const heroesHtml = PLAYER_HEROES.map((h, i) => `
      <div class="hero-chip ${i === this.selectedColorIndex ? 'selected' : ''}" 
           data-index="${i}" 
           style="background:${h.color}; --hero-color:${h.color}" 
           title="${h.name}"></div>
    `).join('');

    const currentHero = PLAYER_HEROES[this.selectedColorIndex];

    this.uiEl.innerHTML = `
      <div class="menu">
        <h1>⚔️ VOXEL DUNGEON · CO-OP</h1>
        
        <div class="lobby-section">
          <label class="lobby-label">Tu Aventurero</label>
          <input id="player-name-input" class="name-input" maxlength="12" 
                 placeholder="Nombre o Apodo" value="${this.playerName}" autocomplete="off" />
        </div>

        <div class="lobby-section">
          <label class="lobby-label">Clase y Color</label>
          <div class="heroes-row" id="heroes-row">
            ${heroesHtml}
          </div>
          <div id="hero-badge" class="hero-badge" style="color:${currentHero.color}">
            🛡️ ${currentHero.name}
          </div>
        </div>

        <div class="divider"></div>

        <button id="btn-host" class="btn-primary">🏰 Crear Mazmorra</button>
        
        <div class="join-container">
          <input id="pin-input" class="join-input" placeholder="0000" maxlength="4" inputmode="numeric" />
          <button id="btn-join" class="btn-join">Unirse</button>
        </div>

        <div class="status" id="status"></div>
      </div>`;

    // 1. Selector de clases/colores
    const chips = this.uiEl.querySelectorAll('.hero-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        const idx = parseInt(chip.dataset.index, 10);
        this.selectedColorIndex = idx;
        localStorage.setItem('dungeon_player_color', idx.toString());

        const hero = PLAYER_HEROES[idx];
        const badge = document.getElementById('hero-badge');
        if (badge) {
          badge.textContent = `🛡️ ${hero.name}`;
          badge.style.color = hero.color;
        }
      };
    });

    // 2. Guardar nombre
    const nameInput = document.getElementById('player-name-input');
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      this.playerName = val || 'Aventurero';
      localStorage.setItem('dungeon_player_name', this.playerName);
    });

    // 3. Crear sala
    document.getElementById('btn-host').onclick = () => {
      const name = nameInput.value.trim() || 'Aventurero';
      onHost({ name, colorIndex: this.selectedColorIndex });
    };

    // 4. Unirse
    const handleJoin = () => {
      const pin = document.getElementById('pin-input').value.trim();
      const name = nameInput.value.trim() || 'Aventurero';
      onJoin(pin, { name, colorIndex: this.selectedColorIndex });
    };

    document.getElementById('btn-join').onclick = handleJoin;
    document.getElementById('pin-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleJoin();
    });

    // 5. Auto-join si existe parámetro ?join= en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinParam = urlParams.get('join');
    if (joinParam) {
      document.getElementById('pin-input').value = joinParam;
      this.setStatus(`Invitación a sala ${joinParam} detectada`);
    }
  }

  showHostRoom(pin, joinUrl, { hostName, hostColorHex, onPlay }) {
    this.setCrosshairVisible(true);
    this.uiEl.innerHTML = `
      <div class="menu">
        <h1 style="margin-bottom:2px">SALA DE EXPEDICIÓN</h1>
        <div class="room-pin-display">${pin}</div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:12px">PIN de 4 dígitos</div>

        <button id="btn-share-link" class="share-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>Compartir en Mensajería</span>
        </button>

        <button id="btn-copy-link" class="copy-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span id="copy-btn-text">Copiar Enlace</span>
        </button>

        <canvas id="qr-canvas"></canvas>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px">O escanea el código con la cámara</div>

        <div class="party-box">
          <div class="party-title">Compañeros de Mazmorra</div>
          <div id="party-list">
            <div class="party-item">
              <div class="party-member">
                <span class="party-dot" style="background:${hostColorHex}"></span>
                <span>${hostName}</span>
              </div>
              <span class="party-badge">Host</span>
            </div>
            <div id="party-waiting" class="party-item" style="color:#64748b;font-style:italic">
              <span>Esperando compañero...</span>
            </div>
          </div>
        </div>

        <button id="btn-start-play" class="btn-play">Comenzar Aventura</button>
      </div>`;

    const qrCanvas = document.getElementById('qr-canvas');
    if (qrCanvas) {
      QRCode.toCanvas(qrCanvas, joinUrl, { width: 130, margin: 1 });
    }

    // Compartir por mensajería (WhatsApp / Telegram / etc.)
    const shareBtn = document.getElementById('btn-share-link');
    if (shareBtn) {
      shareBtn.onclick = () => this.shareLink(joinUrl, pin);
    }

    // Copiar enlace directo
    const copyBtn = document.getElementById('btn-copy-link');
    if (copyBtn) {
      copyBtn.onclick = () => this.copyLink(joinUrl);
    }

    // Comenzar juego
    document.getElementById('btn-start-play')?.addEventListener('click', () => {
      this.hideMenu();
      onPlay?.();
    });
  }

  async shareLink(url, pin) {
    const shareData = {
      title: 'Voxel Dungeon Co-op P2P',
      text: `¡Únete a mi mazmorra cooperativa en 3D! Código PIN: ${pin}`,
      url: url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    await this.copyLink(url);
  }

  async copyLink(url) {
    const copyText = document.getElementById('copy-btn-text');
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      copied = document.execCommand('copy');
      document.body.removeChild(ta);
    }

    if (copyText) {
      copyText.textContent = copied ? '✅ ¡Enlace Copiado!' : 'Error al copiar';
      setTimeout(() => {
        if (copyText) copyText.textContent = 'Copiar Enlace';
      }, 3000);
    }
    this.showNarrativeMessage('¡Enlace copiado! Envíalo por WhatsApp o Telegram.', 3500);
  }

  updatePartyList(players) {
    const partyList = document.getElementById('party-list');
    if (!partyList) return;

    partyList.innerHTML = players.map(p => {
      const hero = PLAYER_HEROES[p.colorIndex] || PLAYER_HEROES[0];
      const isHost = p.id === 0;
      return `
        <div class="party-item">
          <div class="party-member">
            <span class="party-dot" style="background:${hero.color}"></span>
            <span>${p.name || 'Aventurero'}</span>
          </div>
          <span class="party-badge" style="${isHost ? '' : 'background:rgba(56,189,248,.2);color:#38bdf8'}">
            ${isHost ? 'Host' : 'Listo'}
          </span>
        </div>`;
    }).join('');

    if (players.length < 2) {
      partyList.innerHTML += `
        <div class="party-item" style="color:#64748b;font-style:italic">
          <span>Esperando compañero...</span>
        </div>`;
    }
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
