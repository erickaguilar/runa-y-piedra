import QRCode from 'qrcode';
import { PLAYER_HEROES } from '../config/constants.js';

export class UIManager {
  constructor({ uiContainerId = 'ui', crosshairId = 'crosshair', hudMessageId = 'hud-message', settingsBtnId = 'btn-settings' } = {}) {
    this.uiEl = document.getElementById(uiContainerId);
    this.crosshair = document.getElementById(crosshairId);
    this.hudMessage = document.getElementById(hudMessageId);
    this.settingsBtn = document.getElementById(settingsBtnId);
    this.messageTimeout = null;

    // Estado de pantallas
    this.currentScreen = 'menu'; // 'menu' | 'host_room' | 'in_game'
    this.lastMenuParams = null;
    this.lastHostParams = null;
    this.isSettingsOpen = false;
    this.settingsCallbacks = null;

    // Cargar perfil guardado del jugador
    this.selectedColorIndex = parseInt(localStorage.getItem('dungeon_player_color') || '0', 10);
    if (this.selectedColorIndex < 0 || this.selectedColorIndex >= PLAYER_HEROES.length) {
      this.selectedColorIndex = 0;
    }
    this.playerName = localStorage.getItem('dungeon_player_name') || 'Aventurero';
    this.setActionButtonsVisible(false);
  }

  bindSettings(callbacks = {}) {
    this.settingsCallbacks = callbacks;
    if (this.settingsBtn) {
      this.settingsBtn.onclick = () => this.toggleSettingsModal();
    }
  }

  showMenu({ onHost, onJoin }) {
    this.currentScreen = 'menu';
    this.lastMenuParams = { onHost, onJoin };
    this.setCrosshairVisible(false);
    this.setActionButtonsVisible(false);

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

  showHostRoom(pin, joinUrl, options = {}) {
    this.currentScreen = 'host_room';
    this.lastHostParams = { pin, joinUrl, options };
    this.setCrosshairVisible(false);
    this.setActionButtonsVisible(false);
    const { hostName, hostColorHex, onPlay, levels = [], selectedLevelId = 'dungeon_classic', onSelectLevel } = options;

    const levelsHtml = levels.length > 0 ? `
        <div class="level-box">
          <div class="level-title">Seleccionar Mapa de la Mazmorra</div>
          <div class="level-grid" id="level-grid">
            ${levels.map(lvl => `
              <div class="level-card ${lvl.id === selectedLevelId ? 'selected' : ''}" data-level-id="${lvl.id}">
                <div class="level-card-header">
                  <span class="level-icon">${lvl.icon || '🏰'}</span>
                  <span class="level-badge">${lvl.difficulty || 'Normal'}</span>
                </div>
                <div class="level-name">${lvl.name}</div>
                <div class="level-desc">${lvl.description || ''}</div>
              </div>
            `).join('')}
          </div>
        </div>
    ` : '';

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

        ${levelsHtml}

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

    // Selector de nivel interactivo
    const levelCards = this.uiEl.querySelectorAll('.level-card');
    levelCards.forEach(card => {
      card.onclick = () => {
        const id = card.dataset.levelId;
        levelCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        onSelectLevel?.(id);
      };
    });

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
      this.currentScreen = 'in_game';
      this.hideMenu();
      this.setCrosshairVisible(true);
      this.setActionButtonsVisible(true);
      onPlay?.();
    });
  }

  toggleSettingsModal() {
    if (this.isSettingsOpen) {
      this.closeSettingsModal();
    } else {
      this.openSettingsModal();
    }
  }

  openSettingsModal() {
    this.isSettingsOpen = true;
    this.setCrosshairVisible(false);
    this.setActionButtonsVisible(false);
    document.exitPointerLock?.();

    if (this.settingsBtn) {
      this.settingsBtn.style.borderColor = '#38bdf8';
      this.settingsBtn.style.color = '#38bdf8';
    }

    const state = this.settingsCallbacks?.getGameState ? this.settingsCallbacks.getGameState() : {};
    const inGame = this.currentScreen === 'in_game';
    const sens = parseFloat(localStorage.getItem('dungeon_sensitivity') || '1.0');
    const dpr = parseFloat(localStorage.getItem('dungeon_dpr') || '1.5');

    const heroesHtml = PLAYER_HEROES.map((h, i) => `
      <div class="hero-chip ${i === this.selectedColorIndex ? 'selected' : ''}" 
           data-index="${i}" 
           style="background:${h.color}; --hero-color:${h.color}" 
           title="${h.name}"></div>
    `).join('');
    const currentHero = PLAYER_HEROES[this.selectedColorIndex];

    this.uiEl.innerHTML = `
      <div class="menu" style="max-height:86vh;overflow-y:auto;padding-bottom:18px;">
        <div class="settings-header">
          <h2>⚙️ CONFIGURACIÓN</h2>
          <button id="btn-close-settings" class="close-x-btn" title="Cerrar">✕</button>
        </div>

        <!-- 1. Perfil de Aventurero -->
        <div class="settings-group">
          <label class="lobby-label">Tu Aventurero</label>
          <input id="settings-name-input" class="name-input" maxlength="12" 
                 placeholder="Nombre o Apodo" value="${this.playerName}" autocomplete="off" />
        </div>

        <div class="settings-group">
          <label class="lobby-label">Clase y Color</label>
          <div class="heroes-row" id="settings-heroes-row">
            ${heroesHtml}
          </div>
          <div id="settings-hero-badge" class="hero-badge" style="color:${currentHero.color}">
            🛡️ ${currentHero.name}
          </div>
        </div>

        <div class="divider" style="margin:10px 0"></div>

        <!-- 2. Controles -->
        <div class="settings-group">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0">Sensibilidad de Mirada</span>
            <span id="sens-val-display" style="font-size:12px;color:#38bdf8;font-weight:700">${sens.toFixed(1)}x</span>
          </div>
          <input id="settings-sens-slider" type="range" min="0.4" max="2.5" step="0.1" value="${sens}" 
                 style="width:100%;accent-color:#38bdf8;cursor:pointer;margin-top:4px;" />
        </div>

        <!-- 3. Gráficos & Rendimiento -->
        <div class="settings-group">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0">Rendimiento Gráfico</span>
          </div>
          <div class="quality-selector">
            <button class="quality-btn ${dpr <= 1.0 ? 'active' : ''}" id="btn-dpr-1" data-dpr="1.0">
              Ahorro / Fluido (1.0x)
            </button>
            <button class="quality-btn ${dpr > 1.0 ? 'active' : ''}" id="btn-dpr-15" data-dpr="1.5">
              Alta Nitidez (1.5x)
            </button>
          </div>
        </div>

        <!-- 4. Acciones de Sala (si está en partida) -->
        ${inGame && state.roomPin ? `
          <div class="divider" style="margin:10px 0"></div>
          <div class="settings-group" style="background:rgba(11,17,32,0.7);border-radius:10px;padding:8px 10px;border:1px solid #1e293b;">
            <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">SALA ACTUAL: <strong style="color:#fbbf24;font-size:13px">${state.roomPin}</strong></div>
            <div style="display:flex;gap:6px">
              <button id="btn-settings-share" class="copy-btn" style="flex:1">📱 Compartir</button>
              <button id="btn-settings-copy" class="copy-btn" style="flex:1">📋 Copiar Link</button>
            </div>
          </div>
        ` : ''}

        <div style="display:flex;gap:8px;margin-top:14px;">
          ${inGame ? `<button id="btn-leave-game" class="btn-danger" style="flex:1">Salir al Menú</button>` : ''}
          <button id="btn-save-settings" class="btn-primary" style="flex:1">Aceptar</button>
        </div>
      </div>`;

    // Interacciones del modal
    document.getElementById('btn-close-settings').onclick = () => this.closeSettingsModal();

    // Selector de clases en configuración
    const chips = this.uiEl.querySelectorAll('.hero-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        const idx = parseInt(chip.dataset.index, 10);
        this.selectedColorIndex = idx;
        localStorage.setItem('dungeon_player_color', idx.toString());

        const hero = PLAYER_HEROES[idx];
        const badge = document.getElementById('settings-hero-badge');
        if (badge) {
          badge.textContent = `🛡️ ${hero.name}`;
          badge.style.color = hero.color;
        }
      };
    });

    // Slider de sensibilidad
    const sensSlider = document.getElementById('settings-sens-slider');
    const sensVal = document.getElementById('sens-val-display');
    sensSlider.oninput = (e) => {
      const val = parseFloat(e.target.value);
      sensVal.textContent = `${val.toFixed(1)}x`;
      this.settingsCallbacks?.onSensitivityChange?.(val);
    };

    // Botones de calidad (DPR)
    const btnDpr1 = document.getElementById('btn-dpr-1');
    const btnDpr15 = document.getElementById('btn-dpr-15');
    const setDpr = (val) => {
      localStorage.setItem('dungeon_dpr', val.toString());
      btnDpr1.classList.toggle('active', val <= 1.0);
      btnDpr15.classList.toggle('active', val > 1.0);
      this.settingsCallbacks?.onQualityChange?.(val);
    };
    btnDpr1.onclick = () => setDpr(1.0);
    btnDpr15.onclick = () => setDpr(1.5);

    // Compartir y copiar dentro de partida
    const shareBtn = document.getElementById('btn-settings-share');
    if (shareBtn && state.joinUrl) {
      shareBtn.onclick = () => this.shareLink(state.joinUrl, state.roomPin);
    }
    const copyBtn = document.getElementById('btn-settings-copy');
    if (copyBtn && state.joinUrl) {
      copyBtn.onclick = () => this.copyLink(state.joinUrl);
    }

    // Salir al menú
    document.getElementById('btn-leave-game')?.addEventListener('click', () => {
      if (confirm('¿Deseas salir al menú principal? Se abandonará la partida actual.')) {
        this.closeSettingsModal();
        this.settingsCallbacks?.onLeaveGame?.();
      }
    });

    // Guardar cambios
    document.getElementById('btn-save-settings').onclick = () => {
      const name = document.getElementById('settings-name-input').value.trim() || 'Aventurero';
      this.playerName = name;
      localStorage.setItem('dungeon_player_name', name);
      this.settingsCallbacks?.onProfileSave?.({ name, colorIndex: this.selectedColorIndex });
      this.showNarrativeMessage('Configuración guardada correctamente.', 2500);
      this.closeSettingsModal();
    };
  }

  closeSettingsModal() {
    this.isSettingsOpen = false;
    if (this.settingsBtn) {
      this.settingsBtn.style.borderColor = 'rgba(255, 255, 255, 0.16)';
      this.settingsBtn.style.color = '#cbd5e1';
    }

    if (this.currentScreen === 'in_game') {
      this.hideMenu();
      this.setCrosshairVisible(true);
      this.setActionButtonsVisible(true);
    } else if (this.currentScreen === 'host_room' && this.lastHostParams) {
      this.showHostRoom(this.lastHostParams.pin, this.lastHostParams.joinUrl, this.lastHostParams.options);
    } else if (this.lastMenuParams) {
      this.showMenu(this.lastMenuParams);
    }
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

  setActionButtonsVisible(visible) {
    const btnInteract = document.getElementById('btn-interact');
    const btnJump = document.getElementById('btn-jump');
    if (btnInteract) btnInteract.style.display = visible ? 'flex' : 'none';
    if (btnJump) btnJump.style.display = visible ? 'flex' : 'none';
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
