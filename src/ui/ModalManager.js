import QRCode from 'qrcode';
import { PLAYER_HEROES, APP_CONFIG } from '../config/constants.js';
import { renderIcon, escapeHtml } from './Icons.js';
import { soundManager } from '../audio/SoundManager.js';
import { CHAPTER_CATALOG } from '../levels/ChapterRegistry.js';

export const ModalMixin = {
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
  },

  bindDev(callbacks = {}) {
    this.devCallbacks = callbacks;
  },

  bindInventory(callbacks = {}) {
    this.inventoryCallbacks = callbacks;
  },

  bindCampaign(callbacks = {}) {
    this.campaignCallbacks = callbacks;
  },

  toggleSettingsModal() {
    if (this.isSettingsOpen) {
      this.closeSettingsModal();
    } else {
      this.openSettingsModal();
    }
  },

  toggleSettings() {
    this.toggleSettingsModal();
  },

  openSettings() {
    this.openSettingsModal();
  },

  showSettings() {
    this.openSettingsModal();
  },

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

    const myId = state.localPlayer?.id ?? (state.isHost ? 0 : -1);
    const takenHeroes = new Map();
    if (inGame && Array.isArray(playersList)) {
      for (const p of playersList) {
        if (p.id !== myId && p.colorIndex !== undefined && p.colorIndex !== null) {
          takenHeroes.set(p.colorIndex, p.name || 'Compañero');
        }
      }
    }

    const settingsHeroesHtml = PLAYER_HEROES.map((h, i) => {
      const isSelected = i === this.selectedColorIndex;
      const isOccupied = takenHeroes.has(i);
      const occupant = takenHeroes.get(i);
      const titleAttr = isOccupied
        ? `${h.name} (En uso por ${escapeHtml(occupant)})`
        : `${h.name} (${h.title || ''})`;
      return `
        <div class="hero-chip ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}" 
             data-index="${i}" 
             style="background:${h.color}; --hero-color:${h.color}" 
             title="${titleAttr}">
          ${renderIcon(h.icon || 'shield', { size: 18, color: '#ffffff' })}
        </div>
      `;
    }).join('');

    const currentHero = PLAYER_HEROES[this.selectedColorIndex] || PLAYER_HEROES[0];

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

        <div class="settings-group" style="margin-top:10px;">
          <label class="lobby-label" style="display:flex;justify-content:space-between;align-items:center;">
            <span>Clase de Héroe (Única por Aventurero)</span>
            <span style="font-size:10px;color:#94a3b8;font-weight:normal;">1 por equipo</span>
          </label>
          <div class="heroes-row" id="settings-heroes-row">
            ${settingsHeroesHtml}
          </div>
          <div id="settings-hero-badge" class="hero-badge" style="color:${currentHero.color}">
            ${renderIcon(currentHero.icon || 'shield', { size: 15, color: currentHero.color })} <span>${currentHero.name}</span>
          </div>
          <div id="settings-hero-trait-container">
            ${this.renderHeroTraitCard(currentHero)}
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

        <!-- 5. Guía de Controles en Pantalla -->
        <div class="settings-group" style="margin-top:10px;">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;">
              ${renderIcon('sparkles', { size: 14, color: '#38bdf8' })} Guía de Controles (HUD)
            </span>
          </div>
          <div class="quality-selector">
            <button class="quality-btn ${this.isControlsHudVisible ? 'active' : ''}" id="btn-controls-on">
              Mostrar
            </button>
            <button class="quality-btn ${!this.isControlsHudVisible ? 'active' : ''}" id="btn-controls-off">
              Ocultar
            </button>
          </div>
        </div>

        <!-- 6. SALA DE EXPEDICIÓN (si está en partida) -->
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
              <div class="party-title" style="display:flex;justify-content:space-between;align-items:center;">
                <span>Compañeros en la Mazmorra</span>
                <span class="party-count-pill" style="font-size:11px;color:${playersList.length >= 5 ? '#f59e0b' : '#38bdf8'};font-weight:700;">
                  ${playersList.length >= 5 ? `${renderIcon('lock', { size: 11, color: '#f59e0b' })} 5/5 Llena` : `${playersList.length}/5 Jugadores`}
                </span>
              </div>
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

    // Selector de clases únicas en configuración
    const settingsChips = (this.uiEl.querySelectorAll ? this.uiEl.querySelectorAll('#settings-heroes-row .hero-chip') : document.querySelectorAll('#settings-heroes-row .hero-chip')) || [];
    settingsChips.forEach(chip => {
      chip.onclick = () => {
        const idx = parseInt(chip.dataset.index, 10);
        if (chip.classList.contains('occupied')) {
          soundManager.playHurt();
          const occupant = takenHeroes.get(idx) || 'otro jugador';
          const hero = PLAYER_HEROES[idx];
          this.showNarrativeMessage(`⚠️ La clase ${hero.name} ya está en uso por ${occupant}.`, 3500);
          return;
        }
        soundManager.playClick();
        settingsChips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        this.selectedColorIndex = idx;
        localStorage.setItem('dungeon_player_color', idx.toString());

        const hero = PLAYER_HEROES[idx];
        const badge = document.getElementById('settings-hero-badge');
        if (badge) {
          badge.innerHTML = `${renderIcon(hero.icon || 'shield', { size: 15, color: hero.color })} <span>${hero.name}</span>`;
          badge.style.color = hero.color;
        }
        const traitContainer = document.getElementById('settings-hero-trait-container');
        if (traitContainer) {
          traitContainer.innerHTML = this.renderHeroTraitCard(hero);
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

    // Botones de Guía de Controles HUD
    const btnControlsOn = document.getElementById('btn-controls-on');
    const btnControlsOff = document.getElementById('btn-controls-off');
    if (btnControlsOn && btnControlsOff) {
      btnControlsOn.onclick = () => {
        soundManager.playClick();
        this.showControlsHud(true);
      };
      btnControlsOff.onclick = () => {
        soundManager.playClick();
        this.hideControlsHud(true);
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
  },

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
  },

  closeSettings() {
    this.closeSettingsModal();
  },

  showDev() {
    this.openDevModal();
  },

  openDev() {
    this.openDevModal();
  },

  closeDev() {
    this.closeDevModal();
  },

  toggleDev() {
    this.toggleDevModal();
  },

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
    const isCurrentShowroom = state.currentLevelId === 'dev_showroom' || (typeof window !== 'undefined' && window.__game?.world?.levelRegistry?.currentLevelId === 'dev_showroom');

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

        <!-- 2. Showroom de Bloques & Físicas (Exclusivo Dev) -->
        <div class="settings-group" style="background:rgba(15, 23, 42, 0.75);border:1px solid rgba(52, 211, 153, 0.35);border-radius:12px;padding:12px;margin-bottom:12px;box-shadow:0 4px 16px rgba(16, 185, 129, 0.12);">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;color:#34d399;font-weight:700;">
              ${renderIcon('sparkles', { size: 15, color: '#34d399' })} Showroom de Bloques & Físicas
            </span>
            <span class="settings-version-pill" style="color:#34d399;background:rgba(16, 185, 129, 0.15);border-color:rgba(16, 185, 129, 0.35);font-size:9px;">
              EXCLUSIVO DEV
            </span>
          </div>
          <p style="font-size:11px;color:#94a3b8;margin:4px 0 10px;line-height:1.4;">
            Mapa completo de pruebas con podios para todos los bloques creados (Sprites del Texture Atlas), circuito de Jump Pads, fosa activa de lava, puertas normales y selladas, cofres con botín/pociones/gemas, escalinata y altar de victoria.
          </p>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <button id="btn-dev-enter-showroom" class="btn-primary" style="width:100%;padding:10px;background:linear-gradient(135deg,#059669,#047857);border:1px solid #10b981;box-shadow:0 4px 14px rgba(16, 185, 129, 0.3);display:inline-flex;align-items:center;justify-content:center;gap:8px;" title="Cargar mapa showroom">
              ${renderIcon('castle', { size: 15, color: '#fff' })} 🧪 Entrar al Showroom de Bloques
            </button>
            ${isCurrentShowroom ? `
              <button id="btn-dev-exit-showroom" class="btn-secondary" style="width:100%;padding:9px;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#cbd5e1;" title="Volver al lobby">
                ${renderIcon('refresh', { size: 14, color: '#cbd5e1' })} Volver al Lobby / Tutorial
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 3. Telemetría de Red WebRTC (?debug=1) -->
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
          <div id="dev-perf-summary" style="font-size:11px;color:#94a3b8;margin:4px 0 10px;line-height:1.6;">
            FPS: <strong style="color:#f8fafc;">${state.perf?.fps ?? '—'}</strong> (obj ≥55)
            · Draws: <strong style="color:#f8fafc;">${state.perf?.calls ?? '—'}</strong> (≤25)
            · Tris: <strong style="color:#f8fafc;">${state.perf?.tris ?? '—'}</strong>
            · DPR: <strong style="color:#f8fafc;">${state.perf?.dpr ? Number(state.perf.dpr).toFixed(2) : '—'}</strong> (≤1.5)
            · RTT: <strong style="color:#f8fafc;">${state.perf?.rttMs ?? '—'} ms</strong>
            <br>
            Verticalidad: <strong style="color:#38bdf8;">Y: ${state.gameplay?.altitude != null ? Number(state.gameplay.altitude).toFixed(1) : '—'}m (máx ${state.gameplay?.maxAltitude != null ? Number(state.gameplay.maxAltitude).toFixed(1) : '—'}m)</strong>
            · Saltos: <strong style="color:#fbbf24;">${state.gameplay?.jumpCount ?? 0}</strong> (Losas rúnicas: <strong style="color:#fbbf24;">${state.gameplay?.jumpPadCount ?? 0}</strong>)
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

    // Showroom de desarrollo
    document.getElementById('btn-dev-enter-showroom')?.addEventListener('click', async () => {
      soundManager.playClick();
      this.closeDevModal();
      if (callbacks.onEnterShowroom) {
        await callbacks.onEnterShowroom();
      } else if (typeof window !== 'undefined' && window.__game) {
        if (!window.__game.mode) await window.__game.startDevShowroomSession();
        else window.__game.switchLevel('dev_showroom', window.__game.mode === 'host');
      }
    });

    document.getElementById('btn-dev-exit-showroom')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeDevModal();
      if (callbacks.onExitShowroom) {
        callbacks.onExitShowroom();
      } else if (typeof window !== 'undefined' && window.__game) {
        window.__game.switchLevel('lobby_tutorial', window.__game.mode === 'host');
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
  },

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
  },

  toggleDevModal() {
    if (this.isDevOpen) {
      this.closeDevModal();
    } else {
      this.openDevModal();
    }
  },

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
  },

  closeConfirmDialog() {
    const el = document.getElementById('modal-confirm-dialog');
    if (el) {
      el.remove();
    }
  },

  /**
   * Actualiza el icon botón de inventario (a la izquierda de los corazones)
   * con su estado visual y contador badge de tesoros recolectados.
   */
  updateInventory({ keys = [], gems = 0, relics = [], potions = [] } = {}) {
    this.inventory = { keys, gems, relics, potions };
    if (!this.inventoryHud) return;

    const totalItems = (keys?.length || 0) + (gems > 0 ? 1 : 0) + (relics?.length || 0) + (potions?.length || 0);
    const hasAny = totalItems > 0;
    this.inventoryHud.classList.toggle('has-loot', hasAny);
    this.inventoryHud.title = hasAny
      ? `Inventario (${totalItems} ${totalItems === 1 ? 'tesoro' : 'tesoros'}) - Clic para abrir (B)`
      : 'Inventario vacío - Clic para abrir (B)';

    let html = `
      <span class="inv-btn-icon">
        ${renderIcon('chest', { size: 20, color: hasAny ? '#fbbf24' : '#94a3b8' })}
      </span>
    `;

    if (hasAny) {
      html += `<span class="inv-btn-badge">${totalItems}</span>`;
    }

    this.inventoryHud.innerHTML = html;

    // Mantener sincronizado el contador de gemas del HUD de vidas en tiempo real
    if (this._lastLives >= 0) {
      this.updateLives(this._lastLives, this._lastMaxLives);
    }

    if (this.isInventoryOpen) {
      this.renderInventoryModalContent();
    }
  },

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
  },

  renderInventoryModalContent() {
    const overlay = document.getElementById('modal-inventory-overlay');
    if (!overlay) return;

    const { keys = [], gems = 0, relics = [], potions = [] } = this.inventory || {};
    const totalItems = (keys?.length || 0) + (gems > 0 ? 1 : 0) + (relics?.length || 0) + (potions?.length || 0);
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
            Aún no has recolectado botín en esta mazmorra. Explora las cámaras para encontrar cofres antiguos con llaves, gemas, pociones y reliquias míticas.
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

      let potionsHtml = '';
      if (potions.length > 0) {
        potionsHtml = `
          <div class="inv-section" style="${(keys.length > 0 || gems > 0 || relics.length > 0) ? 'margin-top:14px;' : ''}">
            <div class="inv-section-title">
              ${renderIcon('potion', { size: 14, color: '#f43f5e' })} POCIONES Y ELIXIRES (${potions.length})
            </div>
            <div class="inv-items-list">
              ${potions.map((p, idx) => {
                const name = typeof p === 'string' ? p : (p?.name || 'Poción de Vida');
                const icon = (typeof p === 'object' && p?.icon) || 'potion';
                const color = (typeof p === 'object' && p?.color) || '#f43f5e';
                return `
                  <div class="inv-detail-card" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                      <div class="inv-detail-icon potion-bg" style="background:rgba(244,63,94,0.12);border:1px solid rgba(244,63,94,0.3);display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;flex-shrink:0;">${renderIcon(icon, { size: 20, color })}</div>
                      <div class="inv-detail-info" style="min-width:0;">
                        <div class="inv-detail-name" style="color:#fda4af;">${escapeHtml(name)}</div>
                        <div class="inv-detail-desc">Restaura 1 ❤️ corazón de vida</div>
                      </div>
                    </div>
                    <button class="btn-use-potion" data-potion-index="${idx}" title="Beber Poción de Vida" style="background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 2px 8px rgba(244,63,94,0.35);flex-shrink:0;transition:transform 0.1s,background 0.2s;">
                      ${renderIcon('potion', { size: 14, color: '#fff' })} Beber
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      bodyHtml = keysHtml + gemsHtml + relicsHtml + potionsHtml;
    }

    overlay.innerHTML = `
      <div id="modal-inventory-panel" class="inventory-modal" style="max-height:86vh;overflow-y:auto;width:92vw;max-width:380px;text-align:left;padding:18px 20px;">
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

    // Botones de acción manual para beber pociones
    const potionBtns = (overlay.querySelectorAll ? overlay.querySelectorAll('.btn-use-potion') : (typeof document !== 'undefined' && document.querySelectorAll ? document.querySelectorAll('.btn-use-potion') : [])) || [];
    potionBtns.forEach(btn => {
      const handlePotionClick = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        const idx = parseInt(btn.dataset.potionIndex, 10);
        const potion = this.inventory?.potions?.[idx] || this.inventory?.potions?.[0];
        if (this.inventoryCallbacks?.onUsePotion) {
          this.inventoryCallbacks.onUsePotion(potion, idx);
        }
      };
      btn.onclick = handlePotionClick;
      btn.addEventListener('touchend', handlePotionClick, { passive: false });
    });
  },

  closeInventoryModal() {
    this.isInventoryOpen = false;
    const overlay = document.getElementById('modal-inventory-overlay');
    if (overlay) {
      overlay.remove();
    }
  },

  toggleInventoryModal() {
    if (this.isInventoryOpen) {
      this.closeInventoryModal();
    } else {
      this.openInventoryModal();
    }
  },

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
  },

  updateDevButtonVisibility() {
    if (!this.devBtn) return;
    if (this.isDevMode) {
      this.devBtn.style.display = 'flex';
      this.devBtn.classList.add('is-dev');
    } else {
      this.devBtn.style.display = 'none';
      this.devBtn.classList.remove('is-dev');
    }
  },

  toggleChapterModal() {
    if (this.isChapterOpen) {
      this.closeChapterModal();
    } else {
      this.openChapterModal();
    }
  },

  openChapterModal() {
    this.closeConfirmDialog();
    this.closeSettingsModal();
    this.closeInventoryModal();
    if (this.isDevOpen) {
      this.closeDevModal();
    }
    this.isChapterOpen = true;
    this.setCrosshairVisible(false);
    this.setActionButtonsVisible(false);
    document.exitPointerLock?.();

    const state = this.campaignCallbacks?.getGameState ? this.campaignCallbacks.getGameState() : {};
    const registry = this.campaignCallbacks?.getChapterRegistry ? this.campaignCallbacks.getChapterRegistry() : null;
    const chapters = registry?.getAllChapters?.() || CHAPTER_CATALOG;
    const isHost = state.isHost !== false && state.mode !== 'client';
    const currentChapterId = registry?.currentChapterId || 'capitulo_1';

    const overlay = document.createElement('div');
    overlay.id = 'modal-chapter-overlay';
    overlay.className = 'modal-chapter-overlay';

    const cardsHtml = chapters.map((ch) => {
      const isUnlocked = registry ? registry.isChapterUnlocked(ch.id) : (ch.number === 1);
      const isCompleted = registry?.progress?.completedChapters?.includes(ch.id) || false;
      const isCurrent = currentChapterId === ch.id;
      const record = registry?.getRecord?.(ch.id);

      const iconName = ch.icon || 'castle';
      const bestTimeText = record?.bestTimeSec
        ? `${Math.floor(record.bestTimeSec / 60)}m ${String(record.bestTimeSec % 60).padStart(2, '0')}s`
        : null;

      if (!isUnlocked) {
        return `
          <div class="chapter-card locked">
            <div class="chapter-card-header">
              <span class="chapter-num-badge locked">Capítulo ${ch.number}</span>
              <span class="chapter-lock-badge">${renderIcon('lock', { size: 14, color: '#94a3b8' })} Bloqueado</span>
            </div>
            <div class="chapter-icon-wrap locked">
              ${renderIcon(iconName, { size: 28, color: '#64748b' })}
            </div>
            <div class="chapter-card-title">${escapeHtml(ch.name)}</div>
            <div class="chapter-card-desc">${escapeHtml(ch.lore)}</div>
            <div class="chapter-req-notice">Completa el Capítulo ${ch.number - 1} para desbloquear</div>
          </div>
        `;
      }

      let statusBadge = '';
      if (isCompleted) {
        statusBadge = `<span class="chapter-status-badge completed">${renderIcon('check', { size: 12, color: '#10b981' })} Conquistado</span>`;
      } else if (isCurrent) {
        statusBadge = `<span class="chapter-status-badge current">⚡ Activo</span>`;
      } else {
        statusBadge = `<span class="chapter-status-badge available">Disponible</span>`;
      }

      let starsHtml = '';
      const starsCount = record?.stars ?? (isCompleted ? 3 : 0);
      if (starsCount > 0) {
        starsHtml = `
          <div class="chapter-stars">
            ${Array.from({ length: 3 }, (_, idx) => renderIcon('star', {
              size: 13,
              color: idx < starsCount ? '#f59e0b' : '#334155'
            })).join('')}
          </div>
        `;
      }

      let recordInfo = '';
      if (record) {
        recordInfo = `
          <div class="chapter-record-row">
            ${bestTimeText ? `<span>⏱️ ${bestTimeText}</span>` : ''}
            ${record.deaths !== undefined ? `<span>💀 ${record.deaths} bajas</span>` : ''}
          </div>
        `;
      }

      const dungeonsList = (ch.dungeons || []).map((d) => escapeHtml(d.name || d.id)).join(' → ');

      let actionPill = '';
      if (isHost) {
        actionPill = `
          <button class="chapter-launch-btn chapter-action-pill ${isCurrent ? 'btn-current is-current' : 'is-launch'}" data-chapter-id="${ch.id}">
            ${isCurrent ? '⚡ En curso (Explorar)' : '▶ Iniciar Expedición'}
          </button>
        `;
      } else {
        actionPill = `
          <div class="chapter-client-info chapter-action-pill is-client">${isCurrent ? '⚡ En curso' : 'Listo para expedición'}</div>
        `;
      }

      return `
        <div class="chapter-card unlocked ${isCurrent ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}" 
             data-chapter-id="${ch.id}" 
             role="button" 
             tabindex="0" 
             title="${isHost ? `Seleccionar Capítulo ${ch.number}: ${escapeHtml(ch.name)}` : `Capítulo ${ch.number}: ${escapeHtml(ch.name)}`}">
          <div class="chapter-card-header">
            <span class="chapter-num-badge">Capítulo ${ch.number}</span>
            ${statusBadge}
          </div>
          <div class="chapter-icon-wrap">
            ${renderIcon(iconName, { size: 28, color: isCurrent ? '#38bdf8' : '#fbbf24' })}
          </div>
          <div class="chapter-card-title">${escapeHtml(ch.name)}</div>
          <div class="chapter-card-desc">${escapeHtml(ch.lore)}</div>
          <div class="chapter-dungeons-track" title="Trilogía de mazmorras">🏛️ ${dungeonsList}</div>
          ${starsHtml}
          ${recordInfo}
          <div class="chapter-card-actions">
            ${actionPill}
          </div>
        </div>
      `;
    }).join('');

    const hostNote = isHost
      ? '👑 <strong>Anfitrión</strong>: Toca cualquier capítulo disponible para iniciar la travesía con tu equipo.'
      : '🛡️ <strong>Aventurero</strong>: Explora los capítulos de la campaña. Solo el anfitrión puede liderar la expedición.';

    overlay.innerHTML = `
      <div class="modal-chapter-box">
        <div class="modal-chapter-header">
          <div class="modal-chapter-title-wrap">
            <div class="modal-chapter-icon">${renderIcon('compass', { size: 24, color: '#38bdf8' })}</div>
            <div>
              <div class="modal-chapter-title">Atlas de Expedición</div>
              <div class="modal-chapter-subtitle">Campaña de los 10 Capítulos Primordiales</div>
            </div>
          </div>
          <button class="modal-chapter-close" id="btn-close-chapter" aria-label="Cerrar">
            ${renderIcon('x', { size: 20, color: '#94a3b8' })}
          </button>
        </div>

        <div class="modal-chapter-banner ${isHost ? 'host' : 'guest'}">
          ${hostNote}
        </div>

        <div class="modal-chapter-grid">
          ${cardsHtml}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const openedAt = Date.now();

    const closeBtn = overlay.querySelector('#btn-close-chapter');
    const handleClose = (e) => {
      if (e) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
      soundManager.playClick();
      this.closeChapterModal();
    };
    if (closeBtn) {
      closeBtn.onclick = handleClose;
      closeBtn.addEventListener('touchend', handleClose, { passive: false });
    }

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        // Evitar descarte accidental por ghost click inmediato al tocar el botón en móvil
        if (Date.now() - openedAt < 350) return;
        soundManager.playClick();
        this.closeChapterModal();
      }
    };

    const triggerSelect = (chapterId) => {
      if (!isHost) {
        soundManager.playClick();
        return;
      }
      soundManager.playClick();
      if (chapterId && this.campaignCallbacks?.onSelectChapter) {
        this.closeChapterModal();
        this.campaignCallbacks.onSelectChapter(chapterId);
      }
    };

    overlay.querySelectorAll('.chapter-launch-btn').forEach((btn) => {
      const handleBtn = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        triggerSelect(btn.dataset.chapterId);
      };
      btn.onclick = handleBtn;
      btn.addEventListener('touchend', handleBtn, { passive: false });
    });

    overlay.querySelectorAll('.chapter-card.unlocked').forEach((card) => {
      const handleSelect = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        triggerSelect(card.dataset.chapterId);
      };
      card.onclick = handleSelect;
      card.addEventListener('touchend', handleSelect, { passive: false });
      card.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleSelect(e);
        }
      };
    });
  },

  closeChapterModal() {
    this.isChapterOpen = false;
    const overlay = document.getElementById('modal-chapter-overlay');
    if (overlay) {
      overlay.remove();
    }
    // Restaurar siempre controles de juego y botones de acción
    this.currentScreen = 'in_game';
    this.setCrosshairVisible(true);
    this.setActionButtonsVisible(true);
  },
};
