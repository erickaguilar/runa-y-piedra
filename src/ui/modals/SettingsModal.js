/**
 * SettingsModal.js - Modal de configuración de gráficos, audio, controles y sala
 */
import QRCode from 'qrcode';
import { PLAYER_HEROES, APP_CONFIG } from '../../config/constants.js';
import { renderIcon, escapeHtml } from '../Icons.js';
import { soundManager } from '../../audio/SoundManager.js';
import { saveManager } from '../../storage/SaveManager.js';

export const SettingsModalMixin = {
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
    const savedSettings = saveManager.getSettings?.() || {};
    const sens = parseFloat(savedSettings.sensitivity ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('dungeon_sensitivity') : null) ?? '1.0');
    const dpr = parseFloat(savedSettings.dpr ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('dungeon_dpr') : null) ?? '1.5');
    this.cameraModeUI = savedSettings.camera || (typeof localStorage !== 'undefined' ? localStorage.getItem('dungeon_camera') : null) || 'first';

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

    const currentHero = PLAYER_HEROES[this.selectedColorIndex] || PLAYER_HEROES[0];

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

        <!-- 1. Perfil de Aventurero (Solo lectura) -->
        <div class="settings-group">
          <label class="lobby-label">Tu Aventurero</label>
          <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(15,23,42,0.65);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:8px 12px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:6px;background:${currentHero.color};color:#ffffff;box-shadow:0 0 10px ${currentHero.color}44;">
                ${renderIcon(currentHero.icon || 'shield', { size: 16, color: '#ffffff' })}
              </span>
              <div>
                <div style="font-size:13px;font-weight:700;color:#f8fafc;">${escapeHtml(this.playerName)}</div>
                <div style="font-size:11px;color:${currentHero.color};font-weight:600;">${currentHero.name} (${currentHero.title || 'Clase de Héroe'})</div>
              </div>
            </div>
            <span style="font-size:10px;color:#94a3b8;font-style:italic;">Gestionado en el Menú</span>
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

        <!-- 6. Gestión de Partidas Guardadas -->
        <div class="settings-group" style="margin-top:10px;">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;">
              ${renderIcon('save', { size: 14, color: '#38bdf8' })} Partidas Guardadas
            </span>
          </div>
          <button id="btn-settings-save-slots" class="btn-secondary" style="width:100%;margin-top:6px;padding:9px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:12px;color:#38bdf8;border-color:rgba(56, 189, 248, 0.4);">
            ${renderIcon('save', { size: 15, color: '#38bdf8' })} Administrar Ranuras (3 Slots)
          </button>
        </div>

        <!-- 7. SALA DE EXPEDICIÓN (si está en partida) -->
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
      try {
        saveManager.updateSettings({ dpr: val });
      } catch {}
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dungeon_dpr', val.toString());
      }
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
      try {
        saveManager.updateSettings({ camera: mode });
      } catch {}
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dungeon_camera', mode);
      }
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

    // Botón de acceso a Ranuras de Guardado
    const btnSaveSlots = document.getElementById('btn-settings-save-slots');
    if (btnSaveSlots) {
      btnSaveSlots.onclick = () => {
        soundManager.playClick();
        this.openSaveSlotsModal();
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

    // Guardar cambios de configuración
    document.getElementById('btn-save-settings').onclick = () => {
      soundManager.playClick();
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
};
