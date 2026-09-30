import QRCode from 'qrcode';
import { PLAYER_HEROES, APP_CONFIG } from '../config/constants.js';
import { renderIcon, replaceEmojisWithSvg, escapeHtml } from './Icons.js';
import { soundManager } from '../audio/SoundManager.js';

export class UIManager {
  constructor({
    uiContainerId = 'ui',
    crosshairId = 'crosshair',
    hudMessageId = 'hud-message',
    settingsBtnId = 'btn-settings',
    devBtnId = 'btn-dev',
    livesHudId = 'hud-lives',
    transitionId = 'level-transition',
    inventoryHudId = 'hud-inventory',
    isDev = undefined,
  } = {}) {
    this.version = APP_CONFIG.VERSION;
    this.uiEl = document.getElementById(uiContainerId);
    this.crosshair = document.getElementById(crosshairId);
    this.hudMessage = document.getElementById(hudMessageId);
    this.livesHud = document.getElementById(livesHudId);
    this.transitionEl = document.getElementById(transitionId);
    this.settingsBtn = document.getElementById(settingsBtnId);
    this.devBtn = document.getElementById(devBtnId);
    this.inventoryHud = document.getElementById(inventoryHudId);
    this.inventory = { keys: [], gems: 0, relics: [] };
    this.isInventoryOpen = false;
    this.isDevOpen = false;
    this.isDevMode = typeof isDev === 'boolean' ? isDev : this.checkDevMode();

    if (this.inventoryHud) {
      const handleOpenLoot = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        this.toggleInventoryModal();
      };
      this.inventoryHud.onclick = handleOpenLoot;
      this.inventoryHud.addEventListener('touchend', handleOpenLoot, { passive: false });
    }

    if (this.devBtn) {
      const handleDevClick = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        this.toggleDevModal();
      };
      this.devBtn.onclick = handleDevClick;
      this.devBtn.addEventListener('touchend', handleDevClick, { passive: false });
    }

    this.updateDevButtonVisibility();

    this.messageTimeout = null;
    this._lastLives = -1;
    this._lastMaxLives = 3;
    this._hasKey = false;
    this._interactKey = null;

    // Estado de pantallas
    this.currentScreen = 'menu'; // 'menu' | 'in_game'
    this.lastMenuParams = null;
    this.isSettingsOpen = false;
    this.settingsCallbacks = null;
    this.devCallbacks = null;

    // Cargar perfil guardado del jugador
    this.selectedColorIndex = parseInt(localStorage.getItem('dungeon_player_color') || '0', 10);
    if (this.selectedColorIndex < 0 || this.selectedColorIndex >= PLAYER_HEROES.length) {
      this.selectedColorIndex = 0;
    }
    this.playerName = localStorage.getItem('dungeon_player_name') || 'Aventurero';
    this.setActionButtonsVisible(false);
    this.updateInventory(this.inventory);
  }

  checkDevMode() {
    if (typeof window === 'undefined') return false;
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        return true;
      }
    } catch {}
    const host = window.location?.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.startsWith('192.168.') || host.startsWith('10.') || host.endsWith('.local')) {
      return true;
    }
    try {
      const search = window.location?.search || '';
      const params = new URLSearchParams(search);
      return params.has('dev') || params.get('debug') === '1';
    } catch {
      return false;
    }
  }

  updateDevButtonVisibility() {
    if (!this.devBtn) return;
    if (this.isDevMode) {
      this.devBtn.style.display = 'flex';
      this.devBtn.classList.add('is-dev');
    } else {
      this.devBtn.style.display = 'none';
      this.devBtn.classList.remove('is-dev');
    }
  }

  bindSettings(callbacks = {}) {
    this.settingsCallbacks = callbacks;
    if (this.settingsBtn) {
      const handleSettingsClick = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        this.toggleSettingsModal();
      };
      this.settingsBtn.onclick = handleSettingsClick;
      this.settingsBtn.addEventListener('touchend', handleSettingsClick, { passive: false });
    }
  }

  bindDev(callbacks = {}) {
    this.devCallbacks = callbacks;
  }

  renderHeroTraitCard(hero) {
    if (!hero) return '';
    const speedPct = Math.round((hero.speedMultiplier || 1.0) * 100);
    const jumpPct = Math.round((hero.jumpMultiplier || 1.0) * 100);
    const defense = hero.stats?.defense || 3;
    return `
      <div class="hero-trait-box" style="border-left:3px solid ${hero.color}">
        <div class="hero-role" style="color:${hero.color}">
          ${renderIcon(hero.icon || 'shield', { size: 14, color: hero.color })}
          <span>${hero.title || hero.name}</span>
        </div>
        <div class="hero-trait">${hero.trait || hero.description || ''}</div>
        <div class="hero-stat-badges">
          <span class="hero-stat">${renderIcon('action', { size: 11, color: '#f59e0b' })} Vel ${speedPct}%</span>
          <span class="hero-stat">${renderIcon('jump', { size: 11, color: '#38bdf8' })} Salto ${jumpPct}%</span>
          <span class="hero-stat">${renderIcon('shield', { size: 11, color: '#10b981' })} Def ${defense}/5</span>
        </div>
      </div>
    `;
  }

  showMenu({ onHost, onJoin }) {
    this.currentScreen = 'menu';
    this.lastMenuParams = { onHost, onJoin };
    this.setCrosshairVisible(false);
    this.setActionButtonsVisible(false);
    this.setLivesVisible(false);

    const heroesHtml = PLAYER_HEROES.map((h, i) => `
      <div class="hero-chip ${i === this.selectedColorIndex ? 'selected' : ''}" 
           data-index="${i}" 
           style="background:${h.color}; --hero-color:${h.color}" 
           title="${h.name} (${h.title || ''})"></div>
    `).join('');

    const currentHero = PLAYER_HEROES[this.selectedColorIndex];

    this.uiEl.innerHTML = `
      <div class="menu">
        <h1>${renderIcon('raido', { size: 22, color: '#d97706' })} RUNA Y PIEDRA</h1>
        
        <div class="lobby-section">
          <label class="lobby-label">Tu Aventurero</label>
          <input id="player-name-input" class="name-input" maxlength="12" 
                 placeholder="Nombre o Apodo" value="${escapeHtml(this.playerName)}" autocomplete="off" />
        </div>

        <div class="lobby-section">
          <label class="lobby-label">Clase y Color</label>
          <div class="heroes-row" id="heroes-row">
            ${heroesHtml}
          </div>
          <div id="hero-badge" class="hero-badge" style="color:${currentHero.color}">
            ${renderIcon(currentHero.icon || 'shield', { size: 15, color: currentHero.color })} <span>${currentHero.name}</span>
          </div>
          <div id="hero-trait-container">
            ${this.renderHeroTraitCard(currentHero)}
          </div>
        </div>

        <div class="divider"></div>

        <button id="btn-host" class="btn-primary">${renderIcon('castle', { size: 18, color: '#fff' })} Crear Mazmorra</button>
        
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
          badge.innerHTML = `${renderIcon(hero.icon || 'shield', { size: 15, color: hero.color })} <span>${hero.name}</span>`;
          badge.style.color = hero.color;
        }
        const traitContainer = document.getElementById('hero-trait-container');
        if (traitContainer) {
          traitContainer.innerHTML = this.renderHeroTraitCard(hero);
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


  toggleSettingsModal() {
    if (this.isSettingsOpen) {
      this.closeSettingsModal();
    } else {
      this.openSettingsModal();
    }
  }

  toggleSettings() {
    this.toggleSettingsModal();
  }

  openSettings() {
    this.openSettingsModal();
  }

  showSettings() {
    this.openSettingsModal();
  }

  openSettingsModal() {
    this.closeConfirmDialog();
    this.closeInventoryModal();
    if (this.isDevOpen) {
      this.closeDevModal();
    }
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
    this.cameraModeUI = localStorage.getItem('dungeon_camera') || 'first';
    const debugEnabled = localStorage.getItem('dungeon_debug') === '1' || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1');

    const playersList = state.players || [];
    let partyHtml = '';
    if (playersList.length > 0) {
      partyHtml = playersList.map((p, idx) => {
        const hero = PLAYER_HEROES[p.colorIndex] || PLAYER_HEROES[0];
        const isHost = idx === 0 || p.id === 0;
        return `
          <div class="party-item">
            <div class="party-member">
              <span class="party-dot" style="background:${hero.color}"></span>
              ${renderIcon(hero.icon || 'shield', { size: 13, color: hero.color })}
              <span>${escapeHtml(p.name || 'Aventurero')} (${hero.name})</span>
            </div>
            <span class="party-badge" style="${isHost ? '' : 'background:rgba(56,189,248,.2);color:#38bdf8'}">${isHost ? 'Host' : 'Listo'}</span>
          </div>`;
      }).join('');
      if (playersList.length < 2) {
        partyHtml += `
          <div class="party-item" style="color:#64748b;font-style:italic">
            <span>Esperando compañero...</span>
          </div>`;
      }
    } else {
      const hero = PLAYER_HEROES[this.selectedColorIndex] || PLAYER_HEROES[0];
      partyHtml = `
        <div class="party-item">
          <div class="party-member">
            <span class="party-dot" style="background:${hero.color}"></span>
            ${renderIcon(hero.icon || 'shield', { size: 13, color: hero.color })}
            <span>${escapeHtml(this.playerName)} (${hero.name})</span>
          </div>
          <span class="party-badge">${state.isHost ? 'Host' : 'Tú'}</span>
        </div>
        <div class="party-item" style="color:#64748b;font-style:italic">
          <span>Esperando compañero...</span>
        </div>`;
    }

    // (Selección de mazmorra eliminada: la progresión es lineal por escalinatas)
    this.closeInventoryModal();

    this.uiEl.innerHTML = `
      <div id="modal-settings" class="menu" style="max-height:86vh;overflow-y:auto;padding-bottom:18px;">
        <div class="settings-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <h2 style="display:flex;align-items:center;gap:6px;">${renderIcon('settings', { size: 18, color: '#cbd5e1' })} CONFIGURACIÓN</h2>
            <span class="settings-version-pill">v${APP_CONFIG.VERSION}</span>
          </div>
          <button id="btn-close-settings" class="close-x-btn" title="Cerrar">${renderIcon('x', { size: 18, color: 'currentColor' })}</button>
        </div>

        <!-- 1. Perfil de Aventurero -->
        <div class="settings-group">
          <label class="lobby-label">Tu Aventurero</label>
          <input id="settings-name-input" class="name-input" maxlength="12" 
                 placeholder="Nombre o Apodo" value="${escapeHtml(this.playerName)}" autocomplete="off" />
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

        <!-- 2b. Cámara -->
        <div class="settings-group">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0">Vista de Cámara (V)</span>
          </div>
          <div class="quality-selector">
            <button class="quality-btn ${this.cameraModeUI !== 'third' ? 'active' : ''}" id="btn-cam-first">
              1ª Persona
            </button>
            <button class="quality-btn ${this.cameraModeUI === 'third' ? 'active' : ''}" id="btn-cam-third">
              3ª Persona
            </button>
          </div>
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

        <!-- 4. Efectos de Sonido Procedurales -->
        <div class="settings-group" style="margin-top:10px;">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;">
              ${renderIcon('sparkles', { size: 14, color: '#fbbf24' })} Efectos de Sonido (Web Audio)
            </span>
          </div>
          <div class="quality-selector">
            <button class="quality-btn ${!soundManager.isMuted ? 'active' : ''}" id="btn-sound-on">
              ${renderIcon('soundOn', { size: 14 })} Activado
            </button>
            <button class="quality-btn ${soundManager.isMuted ? 'active' : ''}" id="btn-sound-off">
              ${renderIcon('soundOff', { size: 14 })} Silenciado
            </button>
          </div>
        </div>

        <!-- 5. SALA DE EXPEDICIÓN (si está en partida) -->
        ${inGame && state.roomPin ? `
          <div class="divider" style="margin:12px 0"></div>
          <div class="settings-group" style="background:rgba(11,17,32,0.85);border-radius:14px;padding:14px;border:1px solid #1e293b;text-align:center;">
            <div class="lobby-label" style="text-align:center;margin-bottom:2px;display:flex;align-items:center;justify-content:center;gap:6px;">${renderIcon('castle', { size: 15, color: '#fbbf24' })} SALA DE EXPEDICIÓN</div>
            <div class="room-pin-display" style="font-size:32px;letter-spacing:6px;margin:2px 0;">${state.roomPin}</div>
            <div style="font-size:11px;color:#64748b;margin-bottom:12px">PIN de 4 dígitos para unirse</div>

            <button id="btn-settings-share" class="share-btn">
              ${renderIcon('share', { size: 18, color: '#fff' })}
              <span>Compartir en Mensajería</span>
            </button>

            <button id="btn-settings-copy" class="copy-btn" style="margin-bottom:10px">
              ${renderIcon('copy', { size: 16, color: '#cbd5e1' })}
              <span id="copy-btn-text">Copiar Enlace</span>
            </button>

            <canvas id="settings-qr-canvas" style="border-radius:8px;margin:6px auto;background:#fff;padding:4px;display:block;"></canvas>
            <div style="font-size:10px;color:#94a3b8;margin-top:2px;margin-bottom:8px">O escanea el código con la cámara</div>

            <div class="party-box" style="margin-top:12px;text-align:left">
              <div class="party-title">Compañeros en la Mazmorra</div>
              <div id="settings-party-list">
                ${partyHtml}
              </div>
            </div>
          </div>
        ` : ''}

        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
          ${inGame ? `<button id="btn-leave-game" class="btn-danger" style="flex:1">Salir al Menú</button>` : ''}
          <button id="btn-save-settings" class="btn-primary" style="flex:1">Aceptar</button>
        </div>

        <div class="settings-footer-version">
          <span>${APP_CONFIG.NAME} • v${APP_CONFIG.VERSION}</span>
        </div>
      </div>`;

    // Interacciones del modal
    document.getElementById('btn-close-settings').onclick = () => {
      soundManager.playClick();
      this.closeSettingsModal();
    };

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

    // Botones de cámara (1ª / 3ª persona)
    const btnCamFirst = document.getElementById('btn-cam-first');
    const btnCamThird = document.getElementById('btn-cam-third');
    const setCam = (mode) => {
      this.cameraModeUI = mode;
      btnCamFirst.classList.toggle('active', mode !== 'third');
      btnCamThird.classList.toggle('active', mode === 'third');
      this.settingsCallbacks?.onCameraChange?.(mode);
    };
    if (btnCamFirst) btnCamFirst.onclick = () => setCam('first');
    if (btnCamThird) btnCamThird.onclick = () => setCam('third');

    // Botones de Telemetría de Red (?debug=1)
    const btnNetDebugOff = document.getElementById('btn-net-debug-off');
    const btnNetDebugOn = document.getElementById('btn-net-debug-on');
    const setNetDebug = (val) => {
      localStorage.setItem('dungeon_debug', val ? '1' : '0');
      if (btnNetDebugOff && btnNetDebugOn) {
        btnNetDebugOff.classList.toggle('active', !val);
        btnNetDebugOn.classList.toggle('active', val);
      }
      this.settingsCallbacks?.onToggleDebug?.(val);
    };
    if (btnNetDebugOff) btnNetDebugOff.onclick = () => setNetDebug(false);
    if (btnNetDebugOn) btnNetDebugOn.onclick = () => setNetDebug(true);

    // Botones de Sonido (Web Audio API)
    const btnSoundOn = document.getElementById('btn-sound-on');
    const btnSoundOff = document.getElementById('btn-sound-off');
    if (btnSoundOn && btnSoundOff) {
      btnSoundOn.onclick = () => {
        if (soundManager.isMuted) soundManager.toggleMute();
        btnSoundOn.classList.add('active');
        btnSoundOff.classList.remove('active');
        soundManager.playClick();
      };
      btnSoundOff.onclick = () => {
        if (!soundManager.isMuted) soundManager.toggleMute();
        btnSoundOff.classList.add('active');
        btnSoundOn.classList.remove('active');
      };
    }

    // QR Canvas en Configuración
    const qrCanvas = document.getElementById('settings-qr-canvas');
    if (qrCanvas && state.joinUrl) {
      QRCode.toCanvas(qrCanvas, state.joinUrl, { width: 120, margin: 1 });
    }

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
      soundManager.playClick();
      this.showConfirmDialog({
        title: '¿Abandonar Incursión?',
        message: 'Regresarás al menú principal y se cancelará tu expedición actual.',
        confirmText: 'Salir al Menú',
        cancelText: 'Seguir Jugando',
        icon: 'warning',
        iconColor: '#f59e0b',
        danger: true,
        onConfirm: () => {
          this.closeSettingsModal();
          this.settingsCallbacks?.onLeaveGame?.();
        },
      });
    });

    // Guardar cambios
    document.getElementById('btn-save-settings').onclick = () => {
      soundManager.playClick();
      const name = document.getElementById('settings-name-input').value.trim() || 'Aventurero';
      this.playerName = name;
      localStorage.setItem('dungeon_player_name', name);
      this.settingsCallbacks?.onProfileSave?.({ name, colorIndex: this.selectedColorIndex });
      this.showNarrativeMessage('Configuración guardada correctamente.', 2500);
      this.closeSettingsModal();
    };
  }

  closeSettingsModal() {
    this.closeConfirmDialog();
    this.closeInventoryModal();
    this.isSettingsOpen = false;
    if (this.settingsBtn) {
      this.settingsBtn.style.borderColor = 'rgba(255, 255, 255, 0.16)';
      this.settingsBtn.style.color = '#cbd5e1';
    }

    if (this.currentScreen === 'in_game') {
      this.hideMenu();
      this.setCrosshairVisible(true);
      this.setActionButtonsVisible(true);
      this.setLivesVisible(true);
    } else if (this.lastMenuParams) {
      this.showMenu(this.lastMenuParams);
    }
  }

  closeSettings() {
    this.closeSettingsModal();
  }

  showDev() {
    this.openDevModal();
  }

  openDev() {
    this.openDevModal();
  }

  closeDev() {
    this.closeDevModal();
  }

  toggleDev() {
    this.toggleDevModal();
  }

  openDevModal() {
    this.closeConfirmDialog();
    this.closeInventoryModal();
    if (this.isSettingsOpen) {
      this.closeSettingsModal();
    }

    this.isDevOpen = true;
    this.setCrosshairVisible(false);
    this.setActionButtonsVisible(false);
    document.exitPointerLock?.();

    if (this.devBtn) {
      this.devBtn.style.borderColor = '#10b981';
      this.devBtn.style.color = '#34d399';
      this.devBtn.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.45)';
    }

    const debugEnabled = localStorage.getItem('dungeon_debug') === '1' || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1');
    const callbacks = this.devCallbacks || this.settingsCallbacks || {};
    const state = callbacks.getGameState ? callbacks.getGameState() : {};

    this.uiEl.innerHTML = `
      <div id="modal-dev" class="menu dev-modal" style="max-height:86vh;overflow-y:auto;padding-bottom:18px;">
        <div class="settings-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <h2 style="display:flex;align-items:center;gap:6px;color:#34d399;">
              ${renderIcon('terminal', { size: 18, color: '#10b981' })} HERRAMIENTAS DEV
            </h2>
            <span class="settings-version-pill" style="color:#34d399;background:rgba(16, 185, 129, 0.15);border-color:rgba(16, 185, 129, 0.35);">
              DEV MODE
            </span>
          </div>
          <button id="btn-close-dev" class="close-x-btn" title="Cerrar">${renderIcon('x', { size: 18, color: 'currentColor' })}</button>
        </div>

        <!-- 1. Recargar Juego (F5) -->
        <div class="settings-group" style="background:rgba(15, 23, 42, 0.6);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin-bottom:12px;">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;color:#f8fafc;">
              ${renderIcon('refresh', { size: 15, color: '#38bdf8' })} Recargar Juego (F5)
            </span>
          </div>
          <p style="font-size:11px;color:#94a3b8;margin:4px 0 10px;line-height:1.4;">
            Fuerza la recarga limpia de la aplicación en dispositivos móviles o escritorio sin atajos de teclado.
          </p>
          <button id="btn-reload-page" class="btn-primary" style="width:100%;padding:10px;background:linear-gradient(135deg,#0284c7,#0369a1);border:1px solid #38bdf8;box-shadow:0 4px 14px rgba(14, 165, 233, 0.3);display:inline-flex;align-items:center;justify-content:center;gap:8px;" title="Recargar juego (F5)">
            ${renderIcon('refresh', { size: 15, color: '#fff' })} Recargar Página Ahora (F5)
          </button>
        </div>

        <!-- 2. Telemetría de Red WebRTC (?debug=1) -->
        <div class="settings-group" style="background:rgba(15, 23, 42, 0.6);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin-bottom:12px;">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;color:#f8fafc;">
              ${renderIcon('sparkles', { size: 15, color: '#34d399' })} Telemetría de Red WebRTC
            </span>
            <span class="settings-version-pill" style="color:#38bdf8;background:rgba(56, 189, 248, 0.12);border-color:rgba(56, 189, 248, 0.28);font-size:9px;">
              ?debug=1
            </span>
          </div>
          <p style="font-size:11px;color:#94a3b8;margin:4px 0 10px;line-height:1.4;">
            Monitorea en tiempo real RTT (ping en ms), paquetes/seg, KB/s y pérdida de paquetes en el overlay HUD.
          </p>
          <div class="quality-selector">
            <button class="quality-btn ${!debugEnabled ? 'active' : ''}" id="btn-net-debug-off">
              Oculto
            </button>
            <button class="quality-btn ${debugEnabled ? 'active' : ''}" id="btn-net-debug-on">
              Activo (Overlay RTT)
            </button>
          </div>
        </div>

        <!-- 3. Acciones de Auditoría y Diagnóstico -->
        <div class="settings-group" style="background:rgba(15, 23, 42, 0.6);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin-bottom:12px;">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;color:#f8fafc;">
              ${renderIcon('trophy', { size: 15, color: '#fbbf24' })} Diagnóstico de Sesión
            </span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px;">
            <button id="btn-dev-audit" class="btn-secondary" style="font-size:11px;padding:9px 10px;display:flex;align-items:center;justify-content:center;gap:6px;">
              ${renderIcon('terminal', { size: 14, color: '#10b981' })} Imprimir Auditoría en Consola (printNetAudit)
            </button>
            <button id="btn-dev-copy-state" class="btn-secondary" style="font-size:11px;padding:9px 10px;display:flex;align-items:center;justify-content:center;gap:6px;">
              ${renderIcon('copy', { size: 14, color: '#cbd5e1' })} <span id="btn-dev-copy-text">Copiar Resumen de Red</span>
            </button>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:14px;">
          <button id="btn-dev-close-footer" class="btn-primary" style="width:100%;padding:11px;background:linear-gradient(135deg,#059669,#047857);border-color:#10b981;">
            Cerrar Herramientas Dev
          </button>
        </div>

        <div class="settings-footer-version" style="color:#6ee7b7;opacity:0.8;">
          <span>Entorno de Desarrollo Activo • v${APP_CONFIG.VERSION}</span>
        </div>
      </div>`;

    const handleClose = () => {
      soundManager.playClick();
      this.closeDevModal();
    };

    document.getElementById('btn-close-dev')?.addEventListener('click', handleClose);
    document.getElementById('btn-dev-close-footer')?.addEventListener('click', handleClose);

    // Recargar página
    document.getElementById('btn-reload-page')?.addEventListener('click', () => {
      soundManager.playClick();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });

    // Toggle de telemetría debug
    const btnNetDebugOff = document.getElementById('btn-net-debug-off');
    const btnNetDebugOn = document.getElementById('btn-net-debug-on');
    const setNetDebug = (val) => {
      localStorage.setItem('dungeon_debug', val ? '1' : '0');
      if (btnNetDebugOff && btnNetDebugOn) {
        btnNetDebugOff.classList.toggle('active', !val);
        btnNetDebugOn.classList.toggle('active', val);
      }
      callbacks.onToggleDebug?.(val);
      this.settingsCallbacks?.onToggleDebug?.(val);
    };
    if (btnNetDebugOff) btnNetDebugOff.onclick = () => setNetDebug(false);
    if (btnNetDebugOn) btnNetDebugOn.onclick = () => setNetDebug(true);

    // Auditoría en consola
    document.getElementById('btn-dev-audit')?.addEventListener('click', () => {
      soundManager.playClick();
      if (typeof window !== 'undefined' && typeof window.printNetAudit === 'function') {
        window.printNetAudit();
      } else if (typeof window !== 'undefined' && window.__game?.network?.printAudit) {
        window.__game.network.printAudit();
      } else {
        console.log('[Dev Tools] Estado actual:', state);
      }
      this.showHudMessage('Auditoría enviada a la consola (F12)');
    });

    // Copiar resumen de estado
    document.getElementById('btn-dev-copy-state')?.addEventListener('click', () => {
      soundManager.playClick();
      const summary = {
        version: APP_CONFIG.VERSION,
        time: new Date().toISOString(),
        roomPin: state.roomPin || null,
        isHost: state.isHost || false,
        inGame: state.inGame || false,
        players: state.players?.length || 0,
        debug: localStorage.getItem('dungeon_debug') === '1',
      };
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(summary, null, 2)).catch(() => {});
      }
      const label = document.getElementById('btn-dev-copy-text');
      if (label) label.textContent = '¡Copiado al Portapapeles!';
      setTimeout(() => {
        if (label) label.textContent = 'Copiar Resumen de Red';
      }, 2000);
    });
  }

  closeDevModal() {
    this.closeConfirmDialog();
    this.closeInventoryModal();
    this.isDevOpen = false;
    if (this.devBtn) {
      this.devBtn.style.borderColor = 'rgba(16, 185, 129, 0.45)';
      this.devBtn.style.color = '#34d399';
      this.devBtn.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 12px rgba(16, 185, 129, 0.18)';
    }

    if (this.currentScreen === 'in_game') {
      this.hideMenu();
      this.setCrosshairVisible(true);
      this.setActionButtonsVisible(true);
      this.setLivesVisible(true);
    } else if (this.lastMenuParams) {
      this.showMenu(this.lastMenuParams);
    }
  }

  toggleDevModal() {
    if (this.isDevOpen) {
      this.closeDevModal();
    } else {
      this.openDevModal();
    }
  }

  /**
   * Muestra un diálogo de confirmación temático (reemplazo in-game de confirm)
   */
  showConfirmDialog({
    title = '¿Abandonar Incursión?',
    message = 'Regresarás al menú principal y se cancelará tu expedición actual.',
    confirmText = 'Salir al Menú',
    cancelText = 'Seguir Jugando',
    icon = 'warning',
    iconColor = '#f59e0b',
    danger = true,
    onConfirm = () => {},
    onCancel = () => {},
  } = {}) {
    this.closeConfirmDialog();

    const overlay = document.createElement('div');
    overlay.id = 'modal-confirm-dialog';
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal" role="dialog" aria-modal="true">
        <div class="confirm-icon-box ${danger ? 'danger' : ''}">
          ${renderIcon(icon, { size: 28, color: iconColor })}
        </div>
        <h3 class="confirm-title">${escapeHtml(title)}</h3>
        <p class="confirm-message">${escapeHtml(message)}</p>
        <div class="confirm-actions">
          <button id="btn-confirm-cancel" class="btn-secondary">${escapeHtml(cancelText)}</button>
          <button id="btn-confirm-accept" class="btn-danger">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        soundManager.playClick();
        this.closeConfirmDialog();
        onCancel?.();
      }
    });

    this.uiEl.appendChild(overlay);

    const btnCancel = document.getElementById('btn-confirm-cancel');
    const btnAccept = document.getElementById('btn-confirm-accept');

    if (btnCancel) {
      btnCancel.onclick = () => {
        soundManager.playClick();
        this.closeConfirmDialog();
        onCancel?.();
      };
    }

    if (btnAccept) {
      btnAccept.onclick = () => {
        soundManager.playClick();
        this.closeConfirmDialog();
        onConfirm?.();
      };
    }
  }

  closeConfirmDialog() {
    const el = document.getElementById('modal-confirm-dialog');
    if (el) {
      el.remove();
    }
  }

  async shareLink(url, pin) {
    const shareData = {
      title: 'Runa y Piedra — Mazmorra Cooperativa P2P',
      text: `¡Únete a mi expedición en Runa y Piedra! Código PIN: ${pin}`,
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
      copyText.innerHTML = copied ? `${renderIcon('check', { size: 14, color: '#22c55e' })} ¡Enlace Copiado!` : 'Error al copiar';
      setTimeout(() => {
        if (copyText) copyText.textContent = 'Copiar Enlace';
      }, 3000);
    }
    this.showNarrativeMessage('¡Enlace copiado! Envíalo por WhatsApp o Telegram.', 3500);
  }

  updatePartyList(players) {
    const partyLists = document.querySelectorAll('#settings-party-list, #party-list');
    if (!partyLists || partyLists.length === 0) return;

    const partyHtml = players.map(p => {
      const hero = PLAYER_HEROES[p.colorIndex] || PLAYER_HEROES[0];
      const isHost = p.id === 0;
      return `
        <div class="party-item">
          <div class="party-member">
            <span class="party-dot" style="background:${hero.color}"></span>
            ${renderIcon(hero.icon || 'shield', { size: 13, color: hero.color })}
            <span>${escapeHtml(p.name || 'Aventurero')} (${hero.name})</span>
          </div>
          <span class="party-badge" style="${isHost ? '' : 'background:rgba(56,189,248,.2);color:#38bdf8'}">
            ${isHost ? 'Host' : 'Listo'}
          </span>
        </div>`;
    }).join('') + (players.length < 2 ? `
        <div class="party-item" style="color:#64748b;font-style:italic">
          <span>Esperando compañero...</span>
        </div>` : '');

    partyLists.forEach(el => {
      el.innerHTML = partyHtml;
    });
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
    const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;
    const btnInteract = document.getElementById('btn-interact');
    const btnJump = document.getElementById('btn-jump');

    // El botón táctil de salto solo se muestra en dispositivos móviles (en desktop se usa Espacio)
    if (btnJump) btnJump.style.display = (visible && isTouch) ? 'flex' : 'none';
    if (btnInteract) {
      if (!isTouch) {
        // En desktop solo se muestra si hay un objeto interactuable cercano (indicador de tecla E)
        btnInteract.style.display = (visible && this._interactKey && this._interactKey !== 'none') ? 'flex' : 'none';
      } else {
        btnInteract.style.display = visible ? 'flex' : 'none';
      }
    }
    if (!visible) this._interactKey = null;
  }

  /**
   * Botón de interactuar contextual: muestra qué se va a usar
   * (puerta/cofre/losa/altar) con pulso, o estado tenue si no hay nada cerca.
   */
  setInteractTarget(target) {
    const btn = document.getElementById('btn-interact');
    if (!btn) return;
    const key = target?.type || 'none';
    if (key === this._interactKey) return;
    this._interactKey = key;

    const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;

    const iconEl = document.getElementById('interact-icon');
    const labelEl = document.getElementById('interact-label');
    const MAP = {
      door: ['door', isTouch ? 'ABRIR' : '[E] ABRIR'],
      chest: ['chest', isTouch ? 'ABRIR' : '[E] ABRIR'],
      stairs: ['stone', isTouch ? 'EMPUJAR' : '[E] EMPUJAR'],
      pedestal: ['sparkles', isTouch ? 'ACTIVAR' : '[E] ACTIVAR'],
    };
    if (MAP[key]) {
      if (iconEl) iconEl.innerHTML = renderIcon(MAP[key][0], { size: 26 });
      if (labelEl) labelEl.textContent = MAP[key][1];
      btn.classList.remove('dim');
      btn.classList.add('ready');
      if (!isTouch) btn.style.display = 'flex';
    } else {
      if (iconEl) iconEl.innerHTML = renderIcon('star', { size: 24 });
      if (labelEl) labelEl.textContent = isTouch ? 'USAR' : '[E] USAR';
      btn.classList.add('dim');
      btn.classList.remove('ready');
      if (!isTouch) btn.style.display = 'none';
    }
  }

  setLivesVisible(visible) {
    if (this.livesHud) {
      this.livesHud.style.display = visible ? 'flex' : 'none';
    }
    this.setInventoryVisible(visible);
    if (!visible) {
      this.setTutorialControlsVisible(false);
    }
  }

  setInventoryVisible(visible) {
    if (this.inventoryHud) {
      this.inventoryHud.style.display = visible ? 'flex' : 'none';
    }
    if (!visible) {
      this.closeInventoryModal();
    }
  }

  /**
   * Actualiza el HUD del inventario con llaves, gemas y reliquias recolectadas de cofres.
   */
  updateInventory({ keys = [], gems = 0, relics = [] } = {}) {
    this.inventory = { keys, gems, relics };
    if (!this.inventoryHud) return;

    const hasAny = (keys && keys.length > 0) || (gems && gems > 0) || (relics && relics.length > 0);
    this.inventoryHud.classList.toggle('has-loot', hasAny);
    this.inventoryHud.title = hasAny ? 'Haz clic para abrir el botín recolectado' : 'Botín de cofres vacío';

    if (!hasAny) {
      this.inventoryHud.innerHTML = `
        <span class="inv-header">${renderIcon('chest', { size: 14, color: '#94a3b8' })} BOTÍN</span>
        <span class="inv-empty">Vacío</span>
      `;
      if (this.isInventoryOpen) {
        this.renderInventoryModalContent();
      }
      return;
    }

    let html = `<span class="inv-header">${renderIcon('chest', { size: 14, color: '#f59e0b' })} BOTÍN</span>`;

    if (Array.isArray(keys)) {
      for (const k of keys) {
        const name = typeof k === 'string' ? k : (k?.name || 'Llave');
        html += `
          <span class="inv-slot key" title="${escapeHtml(name)}">
            ${renderIcon('key', { size: 13, color: '#fbbf24' })}
            <span>${escapeHtml(name)}</span>
          </span>
        `;
      }
    }

    if (gems > 0) {
      html += `
        <span class="inv-slot gem" title="${gems} Gemas acumuladas">
          ${renderIcon('gem', { size: 13, color: '#38bdf8' })}
          <span>${gems}</span>
        </span>
      `;
    }

    if (Array.isArray(relics)) {
      for (const r of relics) {
        const name = r.name || 'Reliquia';
        const icon = r.icon || 'trophy';
        const color = r.color || '#eab308';
        html += `
          <span class="inv-slot relic" title="${escapeHtml(name)}">
            ${renderIcon(icon, { size: 13, color })}
            <span>${escapeHtml(name)}</span>
          </span>
        `;
      }
    }

    html += `<span class="inv-open-pill" title="Ver todo">${renderIcon('sparkles', { size: 11, color: '#fbbf24' })}</span>`;

    this.inventoryHud.innerHTML = html;

    if (this.isInventoryOpen) {
      this.renderInventoryModalContent();
    }
  }

  /**
   * Abre el modal interactivo de botín recolectado
   */
  openInventoryModal() {
    this.closeConfirmDialog();
    if (this.isSettingsOpen) {
      this.closeSettingsModal();
    }
    if (this.isDevOpen) {
      this.closeDevModal();
    }

    this.isInventoryOpen = true;

    // Liberar pointer lock para interacción con cursor
    if (document.exitPointerLock) {
      try { document.exitPointerLock(); } catch {}
    }

    let overlay = document.getElementById('modal-inventory-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-inventory-overlay';
      overlay.className = 'confirm-overlay';
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          soundManager.playClick();
          this.closeInventoryModal();
        }
      });
      this.uiEl.appendChild(overlay);
    }

    this.renderInventoryModalContent();
  }

  renderInventoryModalContent() {
    const overlay = document.getElementById('modal-inventory-overlay');
    if (!overlay) return;

    const { keys = [], gems = 0, relics = [] } = this.inventory || {};
    const totalItems = (keys?.length || 0) + (gems > 0 ? 1 : 0) + (relics?.length || 0);
    const hasAny = totalItems > 0;

    let bodyHtml = '';

    if (!hasAny) {
      bodyHtml = `
        <div class="inv-modal-empty">
          <div class="inv-modal-empty-icon">
            ${renderIcon('chest', { size: 32, color: '#64748b' })}
          </div>
          <h3 style="color:#f8fafc;font-size:15px;margin:6px 0 4px;text-align:center;">Cofre de Aventurero Vacío</h3>
          <p style="color:#94a3b8;font-size:12px;line-height:1.5;text-align:center;margin:0;">
            Aún no has recolectado botín en esta mazmorra. Explora las cámaras para encontrar cofres antiguos con llaves, gemas y reliquias míticas.
          </p>
        </div>
      `;
    } else {
      let keysHtml = '';
      if (keys.length > 0) {
        keysHtml = `
          <div class="inv-section">
            <div class="inv-section-title">
              ${renderIcon('key', { size: 14, color: '#fbbf24' })} LLAVES DE MAZMORRA (${keys.length})
            </div>
            <div class="inv-items-list">
              ${keys.map(k => {
                const name = typeof k === 'string' ? k : (k?.name || 'Llave');
                return `
                  <div class="inv-detail-card">
                    <div class="inv-detail-icon key-bg">${renderIcon('key', { size: 20, color: '#fbbf24' })}</div>
                    <div class="inv-detail-info">
                      <div class="inv-detail-name">${escapeHtml(name)}</div>
                      <div class="inv-detail-desc">Llave de paso • Abre puertas selladas</div>
                    </div>
                    <span class="inv-status-pill key">Activa</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      let gemsHtml = '';
      if (gems > 0) {
        gemsHtml = `
          <div class="inv-section" style="${keys.length > 0 ? 'margin-top:14px;' : ''}">
            <div class="inv-section-title">
              ${renderIcon('gem', { size: 14, color: '#38bdf8' })} TESORO EN GEMAS
            </div>
            <div class="inv-detail-card">
              <div class="inv-detail-icon gem-bg">${renderIcon('gem', { size: 22, color: '#38bdf8' })}</div>
              <div class="inv-detail-info">
                <div class="inv-detail-name" style="color:#38bdf8;font-size:15px;font-weight:800;">${gems} Gemas</div>
                <div class="inv-detail-desc">Riquezas extraídas de cofres antiguos</div>
              </div>
              <span class="inv-status-pill gem">Acumulado</span>
            </div>
          </div>
        `;
      }

      let relicsHtml = '';
      if (relics.length > 0) {
        relicsHtml = `
          <div class="inv-section" style="${(keys.length > 0 || gems > 0) ? 'margin-top:14px;' : ''}">
            <div class="inv-section-title">
              ${renderIcon('trophy', { size: 14, color: '#eab308' })} RELIQUIAS MÍTICAS (${relics.length})
            </div>
            <div class="inv-items-list">
              ${relics.map(r => {
                const name = r.name || 'Reliquia';
                const icon = r.icon || 'trophy';
                const color = r.color || '#eab308';
                return `
                  <div class="inv-detail-card">
                    <div class="inv-detail-icon relic-bg">${renderIcon(icon, { size: 20, color })}</div>
                    <div class="inv-detail-info">
                      <div class="inv-detail-name" style="color:#fef08a;">${escapeHtml(name)}</div>
                      <div class="inv-detail-desc">Artefacto arcano de inmenso poder</div>
                    </div>
                    <span class="inv-status-pill relic">Mítico</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      bodyHtml = keysHtml + gemsHtml + relicsHtml;
    }

    overlay.innerHTML = `
      <div id="modal-inventory-panel" class="menu inventory-modal" style="max-height:86vh;overflow-y:auto;width:92vw;max-width:380px;text-align:left;padding:18px 20px;">
        <div class="settings-header" style="margin-bottom:14px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <h2 style="display:flex;align-items:center;gap:6px;font-size:15px;">
              ${renderIcon('chest', { size: 18, color: '#f59e0b' })} BOTÍN DE EXPEDICIÓN
            </h2>
            <span class="settings-version-pill" style="color:#fbbf24;background:rgba(251,191,36,0.12);border-color:rgba(251,191,36,0.3);">
              ${totalItems} ${totalItems === 1 ? 'tesoro' : 'tesoros'}
            </span>
          </div>
          <button id="btn-close-inventory" class="close-x-btn" title="Cerrar">${renderIcon('x', { size: 18, color: 'currentColor' })}</button>
        </div>

        <div class="inventory-modal-body">
          ${bodyHtml}
        </div>

        <div style="margin-top:16px;">
          <button id="btn-close-inv-modal" class="btn-primary" style="width:100%;padding:11px;">Cerrar Botín</button>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('btn-close-inventory');
    const closeFooterBtn = document.getElementById('btn-close-inv-modal');

    const handleClose = (e) => {
      if (e) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
      soundManager.playClick();
      this.closeInventoryModal();
    };

    if (closeBtn) {
      closeBtn.onclick = handleClose;
      closeBtn.addEventListener('touchend', handleClose, { passive: false });
    }
    if (closeFooterBtn) {
      closeFooterBtn.onclick = handleClose;
      closeFooterBtn.addEventListener('touchend', handleClose, { passive: false });
    }
  }

  closeInventoryModal() {
    this.isInventoryOpen = false;
    const overlay = document.getElementById('modal-inventory-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  toggleInventoryModal() {
    if (this.isInventoryOpen) {
      this.closeInventoryModal();
    } else {
      this.openInventoryModal();
    }
  }

  setTutorialControlsVisible(visible) {
    const el = document.getElementById('tutorial-controls-hud');
    if (el) {
      el.style.display = visible ? 'flex' : 'none';
    }
  }

  /**
   * Actualiza el HUD de corazones. lives: vidas restantes, maxLives: total.
   * Si hubo pérdida, anima el corazón perdido con shake.
   */
  updateLives(lives = 3, maxLives = 3, { invulnerable = false } = {}) {
    if (!this.livesHud) return;
    const lost = this._lastLives !== -1 && lives < this._lastLives;
    this._lastLives = lives;
    this._lastMaxLives = maxLives;
    let html = '';
    for (let i = 0; i < maxLives; i++) {
      const alive = i < lives;
      const cls = alive ? 'heart' : 'heart lost';
      const color = alive ? '#ef4444' : '#475569';
      html += `<span class="${cls}${lost && !alive ? ' hurt' : ''}">${renderIcon('heart', { size: 18, color })}</span>`;
    }
    if (this._hasKey) {
      html += `<span class="key-badge" title="Llave del Santuario">${renderIcon('key', { size: 18, color: '#fbbf24' })}</span>`;
    }
    this.livesHud.innerHTML = html;
    this.livesHud.classList.toggle('invuln', !!invulnerable);
  }

  /** Muestra/oculta la insignia de llave en el HUD (sin tocar los corazones). */
  setHasKey(hasKey) {
    this._hasKey = !!hasKey;
    if (this._lastLives >= 0) {
      this.updateLives(this._lastLives, this._lastMaxLives);
    }
  }

  showGameOver(lives, maxLives) {
    this.updateLives(lives, maxLives);
    this.showNarrativeMessage(
      '💀 ¡GAME OVER! Vuelves al lobby con todo reseteado.',
      5000
    );
  }

  /** Velo de transición entre mazmorras (fade negro estilo Dark Souls con nombre del destino). */
  showLevelTransition(title = '', subtitle = '', { victory = false, autoHideMs = 0 } = {}) {
    if (!this.transitionEl) return;
    if (this._transitionTimer) { clearTimeout(this._transitionTimer); this._transitionTimer = null; }
    this.transitionEl.className = victory ? 'visible victory' : 'visible';
    this.transitionEl.style.display = 'flex';
    // Forzar reflow para que la transición de opacidad se reproduzca
    void this.transitionEl.offsetWidth;
    this.transitionEl.innerHTML = `
      <div class="portal-title">${replaceEmojisWithSvg(title, { className: 'narrative-icon pop-in' })}</div>
      ${subtitle ? `<div class="portal-sub">${replaceEmojisWithSvg(subtitle, { className: 'narrative-icon' })}</div>` : ''}`;
    if (autoHideMs > 0) {
      this._transitionTimer = setTimeout(() => this.hideLevelTransition(), autoHideMs);
    }
  }

  hideLevelTransition() {
    if (!this.transitionEl) return;
    if (this._transitionTimer) { clearTimeout(this._transitionTimer); this._transitionTimer = null; }
    this.transitionEl.classList.remove('visible', 'victory');
    this.transitionEl.style.display = 'none';
    this.transitionEl.innerHTML = '';
  }

  /**
   * Tarjeta de descenso sincronizado: cuenta atrás de 8s + botón BAJAR YA.
   * endsAtMs: timestamp (reloj del Host) del descenso automático.
   */
  showDescentCountdown({ byName = 'Un compañero', endsAtMs = 0, onNow = null } = {}) {
    this.hideDescent();
    const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;

    const card = document.createElement('div');
    card.id = 'descent-card';
    card.innerHTML = `
      <div class="descent-title">${renderIcon('vortex', { size: 18, color: '#38bdf8' })} ¡${escapeHtml(byName)} desciende!</div>
      <div class="descent-timer">8</div>
      <div class="descent-sub">${isTouch ? 'Baja a la escalinata para ir ya' : 'Pulsa [E / CLICK] o baja a la escalinata para ir ya'}</div>`;
    document.body.appendChild(card);
    this.descentCard = card;

    const bigBtn = document.createElement('button');
    bigBtn.id = 'btn-descend-now';
    bigBtn.type = 'button';
    bigBtn.textContent = isTouch ? 'BAJAR YA' : '[E / CLICK] BAJAR YA';
    document.body.appendChild(bigBtn);
    this.descentBtn = bigBtn;
    this.descentOnNow = onNow;

    bigBtn.onclick = () => {
      if (this.descentOnNow) this.descentOnNow();
    };

    const tick = () => {
      if (!this.descentCard) return;
      const remain = Math.max(0, Math.ceil((endsAtMs - Date.now()) / 1000));
      const el = this.descentCard.querySelector('.descent-timer');
      if (el) el.textContent = remain > 0 ? remain : '¡Ya!';
    };
    tick();
    this._descentInterval = setInterval(tick, 250);
  }

  hideDescent() {
    if (this._descentInterval) { clearInterval(this._descentInterval); this._descentInterval = null; }
    if (this.descentCard) {
      this.descentCard.remove();
      this.descentCard = null;
    }
    if (this.descentBtn) {
      this.descentBtn.remove();
      this.descentBtn = null;
    }
    this.descentOnNow = null;
  }

  parseMessageToList(content) {
    if (typeof content === 'object' && content !== null) {
      if (Array.isArray(content)) {
        return { title: content[0] || '', items: content.slice(1) };
      }
      return {
        title: content.title || '',
        items: Array.isArray(content.items) ? content.items : (content.items ? [content.items] : []),
      };
    }

    const text = String(content || '').trim();
    if (!text) return { title: '', items: [] };

    // 1. Mensajes de cofre o recompensas: "📦 ¡Has abierto...! Has obtenido: 🗝️ Llave... y 💎 100..."
    if (/Has obtenido:|Recompensa:/i.test(text)) {
      const match = text.split(/Has obtenido:|Recompensa:/i);
      const title = match[0].trim();
      const rawItems = match[1] ? match[1].trim() : '';
      const items = rawItems
        .split(/\s+y\s+|,\s*/)
        .map(i => i.trim().replace(/^\.*|\.*$/g, ''))
        .filter(Boolean);
      return { title, items };
    }

    // 2. Mensajes con salto de línea explícito (\n)
    if (text.includes('\n')) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      return { title: lines[0], items: lines.slice(1) };
    }

    // 3. Múltiples oraciones separadas por delimitadores (. ! ?)
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (sentences.length > 1) {
      return {
        title: sentences[0],
        items: sentences.slice(1),
      };
    }

    return { title: text, items: [] };
  }

  showNarrativeMessage(content, durationMs = 4500) {
    if (!this.hudMessage) return;
    const { title, items } = this.parseMessageToList(content);
    if (!title && items.length === 0) return;

    this.hudMessage.style.display = 'flex';

    const card = document.createElement('div');
    card.className = 'hud-alert-card';

    let html = `
      <div class="hud-alert-header">
        <span class="hud-alert-title">${replaceEmojisWithSvg(title, { className: 'narrative-icon pop-in' })}</span>
      </div>
    `;

    if (items.length > 0) {
      html += `
        <div class="hud-alert-list">
          ${items.map(item => `
            <div class="hud-alert-row">
              <span class="hud-alert-bullet">•</span>
              <span>${replaceEmojisWithSvg(item, { className: 'narrative-icon reward' })}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    card.innerHTML = html;

    // Mantener como máximo 3 alertas activas simultáneas en la lista vertical
    while (this.hudMessage.children.length >= 3) {
      this.hudMessage.removeChild(this.hudMessage.firstElementChild);
    }

    this.hudMessage.appendChild(card);

    // Animación de salida y limpieza automática
    setTimeout(() => {
      card.classList.add('fade-out');
      setTimeout(() => {
        if (card.parentNode === this.hudMessage) {
          this.hudMessage.removeChild(card);
          if (this.hudMessage.children.length === 0) {
            this.hudMessage.style.display = 'none';
          }
        }
      }, 240);
    }, durationMs);
  }

  hideNarrativeMessage() {
    if (this.hudMessage) {
      this.hudMessage.innerHTML = '';
      this.hudMessage.style.display = 'none';
    }
  }
}
