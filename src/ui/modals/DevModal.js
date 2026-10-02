/**
 * DevModal.js - Herramientas de diagnóstico, telemetría y showroom para desarrolladores
 */
import { renderIcon } from '../Icons.js';
import { soundManager } from '../../audio/SoundManager.js';
import { APP_CONFIG } from '../../config/constants.js';

export const DevModalMixin = {
  bindDev(callbacks = {}) {
    this.devCallbacks = callbacks;
  },

  checkDevMode() {
    if (typeof window === 'undefined') return false;
    const isDevHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const hasDevQuery = new URLSearchParams(window.location.search).get('dev') === '1';
    const hasDevStored = localStorage.getItem('dungeon_dev_tools') === '1';
    return isDevHost || hasDevQuery || hasDevStored;
  },

  updateDevButtonVisibility() {
    if (this.devBtn) {
      this.devBtn.style.display = this.isDevMode ? 'flex' : 'none';
    }
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
    const isCurrentShowroom = state.currentLevelId === 'dev_showroom';

    this.uiEl.innerHTML = `
      <div id="modal-dev" class="menu dev-modal" style="max-height:86vh;overflow-y:auto;padding-bottom:18px;">
        <div class="settings-header">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h2 style="display:flex;align-items:center;gap:6px;color:#34d399;margin:0;">
                ${renderIcon('terminal', { size: 18, color: '#10b981' })} HERRAMIENTAS DEV
              </h2>
              <span class="settings-version-pill" style="color:#34d399;background:rgba(16, 185, 129, 0.15);border-color:rgba(16, 185, 129, 0.35);">
                DEV MODE
              </span>
            </div>
            <div class="settings-subtitle" style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8;margin-top:4px;">
              ${renderIcon('sparkles', { size: 12, color: '#34d399' })} <span>Panel de Pruebas y Diagnóstico en Vivo</span>
            </div>
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
              ${renderIcon('sparkles', { size: 15, color: '#fff' })} Entrar al Showroom de Bloques
            </button>
            <button id="btn-dev-open-atlas" class="btn-secondary" style="width:100%;padding:9px;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#38bdf8;border-color:rgba(56, 189, 248, 0.4);" title="Abrir Atlas de Expedición">
              ${renderIcon('map', { size: 14, color: '#38bdf8' })} Explorar Atlas de Expedición
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
              ${renderIcon('bolt', { size: 15, color: '#38bdf8' })} Telemetría de Red WebRTC
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

        <!-- 4. Acciones de Auditoría y Diagnóstico -->
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
      }
    });

    document.getElementById('btn-dev-exit-showroom')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeDevModal();
      if (callbacks.onExitShowroom) {
        callbacks.onExitShowroom();
      }
    });

    document.getElementById('btn-dev-open-atlas')?.addEventListener('click', () => {
      soundManager.playClick();
      this.openChapterModal();
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
      if (callbacks.onPrintNetAudit) {
        callbacks.onPrintNetAudit();
      } else if (typeof window !== 'undefined' && typeof window.printNetAudit === 'function') {
        window.printNetAudit();
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
};
