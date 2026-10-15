/**
 * DevModal.js - Herramientas de diagnóstico, telemetría, showroom y calibración de salas
 */
import { renderIcon } from '../Icons.js';
import { soundManager } from '../../audio/SoundManager.js';
import { APP_CONFIG, PLAYER_HEROES } from '../../config/constants.js';

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
    const inGame = !!state.inGame;
    const currentHeroIdx = state.currentHeroIndex ?? 0;
    const isNoclip = !!state.isNoclip;
    const coordsOverlayEnabled = !!state.coordsOverlayEnabled;

    const currentLevel = state.currentLevel || {};
    const checkpoints = Array.isArray(currentLevel.checkpoints) ? currentLevel.checkpoints : [];
    const doors = Array.isArray(currentLevel.doors) ? currentLevel.doors : [];

    this.uiEl.innerHTML = `
      <div id="modal-dev" class="menu dev-modal sumie-modal-box">
        <div class="settings-header sumie-modal-header">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h2 class="sumie-modal-title" style="display:flex;align-items:center;gap:6px;color:var(--rune-jade,#34d399);margin:0;">
                ${renderIcon('terminal', { size: 18, color: '#10b981' })} HERRAMIENTAS DEV
              </h2>
              <span class="settings-version-pill sumie-stamp-pill" style="color:var(--rune-jade,#34d399);">
                DEV MODE
              </span>
            </div>
            <div class="settings-subtitle" style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--washi-muted,#94a3b8);margin-top:4px;">
              ${renderIcon('sparkles', { size: 12, color: '#34d399' })} <span>Calibración de Salas, Físicas & Diagnóstico en Vivo</span>
            </div>
          </div>
          <button id="btn-close-dev" class="close-x-btn" title="Cerrar (Esc)">${renderIcon('x', { size: 18, color: 'currentColor' })}</button>
        </div>

        <div class="dev-modal-content">
          <div class="dev-grid-columns">
            <!-- COLUMNA PRINCIPAL (Calibración & Físicas In-Game) -->
            <div class="dev-col-main">
              <!-- 1. Calibración & Herramientas de Sala (Prioridad In-Game) -->
              <div class="settings-group sumie-dev-card featured-card">
                <div class="setting-row">
                  <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;color:var(--rune-jade,#34d399);font-weight:700;">
                    ${renderIcon('map', { size: 15, color: '#34d399' })} Calibración de Salas & Físicas
                  </span>
                  <span class="settings-version-pill sumie-stamp-pill" style="color:${inGame ? 'var(--rune-jade,#34d399)' : 'var(--washi-muted,#94a3b8)'};font-size:9px;">
                    ${inGame ? (state.currentLevelId || 'EN PARTIDA') : 'REQUIERE PARTIDA'}
                  </span>
                </div>

                ${inGame ? `
                  <!-- A. Teletransporte por Salas y Puntos Clave -->
                  <div class="sumie-dev-section" style="margin-top:10px;padding-top:8px;border-top:2px solid var(--ink-black);">
                    <span class="sumie-dev-sublabel">
                      ${renderIcon('bolt', { size: 13, color: '#38bdf8' })} Teletransporte a Salas
                    </span>
                    ${checkpoints.length > 0 ? `
                      <div class="sumie-dev-warp-row">
                        <select id="dev-sel-room" class="sumie-select dev-room-select" title="Seleccionar sala para teletransporte">
                          ${checkpoints.map((cp, idx) => `
                            <option value="${idx}">Sala ${idx + 1}: ${cp.name} (Z: ${cp.minZ} - ${cp.maxZ})</option>
                          `).join('')}
                        </select>
                        <button id="btn-dev-teleport-room" class="btn-primary sumie-btn-warp" title="Viajar a la sala seleccionada">
                          ${renderIcon('bolt', { size: 13, color: '#ffffff' })} Viajar
                        </button>
                      </div>
                    ` : `
                      <p class="sumie-dev-muted">Este nivel no tiene salas registradas en checkpoints.</p>
                    `}
                    <div class="sumie-dev-pill-row">
                      <button id="btn-dev-teleport-spawn" class="btn-secondary sumie-btn-small">
                        🚩 Spawn Entrada
                      </button>
                      ${doors.map(d => `
                        <button class="btn-secondary btn-dev-door-warp sumie-btn-small" data-door-id="${d.id}">
                          🚪 Puerta ${d.id}
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- B. Modo Vuelo (Noclip) -->
                  <div class="sumie-dev-section" style="margin-top:10px;padding-top:8px;border-top:2px solid var(--ink-black);">
                    <div class="setting-row">
                      <span class="sumie-dev-sublabel" style="margin:0;">
                        ${renderIcon('sparkles', { size: 13, color: '#fbbf24' })} Modo Vuelo (Noclip / Free Cam)
                      </span>
                    </div>
                    <p class="sumie-dev-muted">
                      Atraviesa paredes y lava sin morir. Espacio / Salto táctil para ascender; Shift o C para descender.
                    </p>
                    <div class="quality-selector">
                      <button class="quality-btn ${!isNoclip ? 'active' : ''}" id="btn-dev-noclip-off">
                        Suelo Normal
                      </button>
                      <button class="quality-btn ${isNoclip ? 'active' : ''}" id="btn-dev-noclip-on">
                        Vuelo Activo
                      </button>
                    </div>
                  </div>

                  <!-- C. Selector Rápido de Héroe (Hero Swapper) -->
                  <div class="sumie-dev-section" style="margin-top:10px;padding-top:8px;border-top:2px solid var(--ink-black);">
                    <span class="sumie-dev-sublabel">
                      ${renderIcon('trophy', { size: 13, color: '#34d399' })} Probar con Otro Héroe (En Vivo)
                    </span>
                    <p class="sumie-dev-muted">
                      Cambia de personaje al instante para testear si los saltos y parkours son viables para cada clase.
                    </p>
                    <div class="dev-hero-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:6px;margin-bottom:8px;">
                      ${PLAYER_HEROES.map((h, idx) => {
                        const isActive = currentHeroIdx === idx;
                        return `
                          <button class="btn-secondary btn-dev-hero-pick ${isActive ? 'active' : ''}" data-hero-idx="${idx}">
                            <div style="display:flex;align-items:center;gap:6px;color:${h.color || '#fff'};font-weight:700;">
                              ${renderIcon(h.avatar || h.icon || 'shield', { size: h.avatar ? 18 : 14, color: h.color })}
                              <span>${h.name}</span>
                            </div>
                            <div style="color:var(--washi-muted,#94a3b8);font-size:9px;">Salto ×${h.jumpMultiplier.toFixed(2)} · Vel ×${h.speedMultiplier.toFixed(2)}</div>
                          </button>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <!-- D. Overlay de Coordenadas y Raycast en Pantalla -->
                  <div class="sumie-dev-section" style="margin-top:10px;padding-top:8px;border-top:2px solid var(--ink-black);">
                    <div class="setting-row">
                      <span class="sumie-dev-sublabel" style="margin:0;">
                        ${renderIcon('terminal', { size: 13, color: '#38bdf8' })} Overlay de Coordenadas en HUD
                      </span>
                    </div>
                    <p class="sumie-dev-muted">
                      Muestra coordenadas exactas (X, Y, Z), orientación, sala y bloque con botón de copia rápida.
                    </p>
                    <div class="quality-selector">
                      <button class="quality-btn ${!coordsOverlayEnabled ? 'active' : ''}" id="btn-dev-overlay-off">
                        Oculto
                      </button>
                      <button class="quality-btn ${coordsOverlayEnabled ? 'active' : ''}" id="btn-dev-overlay-on">
                        Visible en Pantalla
                      </button>
                    </div>
                  </div>

                  <!-- E. Mecanismos de Sala & Acciones Rápidas -->
                  <div class="sumie-dev-section" style="margin-top:10px;padding-top:8px;border-top:2px solid var(--ink-black);">
                    <span class="sumie-dev-sublabel">
                      ${renderIcon('refresh', { size: 13, color: '#f59e0b' })} Control de Mecanismos
                    </span>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                      <button id="btn-dev-open-doors" class="btn-secondary sumie-btn-small" style="flex:1;min-width:130px;color:var(--rune-cyan,#38bdf8);">
                        🔓 Abrir Puertas
                      </button>
                      <button id="btn-dev-reset-room" class="btn-secondary sumie-btn-small" style="flex:1;min-width:130px;color:var(--rune-gold,#f59e0b);">
                        🔄 Resetear Mecanismos
                      </button>
                      <button id="btn-dev-heal" class="btn-secondary sumie-btn-small" style="flex:1;min-width:130px;color:var(--cinnabar-light,#ef4444);">
                        ❤️ Restaurar 3 Vidas
                      </button>
                    </div>
                  </div>

                  <!-- F. Exportar Reporte de Posición / JSON -->
                  <div class="sumie-dev-section" style="margin-top:10px;padding-top:8px;border-top:2px solid var(--ink-black);">
                    <div style="display:flex;gap:6px;">
                      <button id="btn-dev-copy-report" class="btn-secondary sumie-btn-small" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;">
                        ${renderIcon('copy', { size: 13, color: '#34d399' })} <span id="btn-dev-copy-report-text">Copiar Posición</span>
                      </button>
                      <button id="btn-dev-copy-props" class="btn-secondary sumie-btn-small" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;">
                        ${renderIcon('copy', { size: 13, color: '#38bdf8' })} <span id="btn-dev-copy-props-text">Copiar Props (JSON)</span>
                      </button>
                    </div>
                  </div>
                ` : `
                  <p class="sumie-dev-muted" style="margin:8px 0 4px;line-height:1.4;">
                    Inicia una partida o accede al Showroom de Bloques para calibrar y teletransportarte por las salas en vivo.
                  </p>
                `}
              </div>
            </div>

            <!-- COLUMNA SECUNDARIA (Showroom, Red, Telemetría y Utilidades) -->
            <div class="dev-col-side">
              <!-- 2. Showroom de Bloques & Físicas (Exclusivo Dev) -->
              <div class="settings-group sumie-dev-card">
                <div class="setting-row">
                  <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;color:var(--rune-jade,#34d399);font-weight:700;">
                    ${renderIcon('sparkles', { size: 15, color: '#34d399' })} Showroom & Atlas
                  </span>
                  <span class="settings-version-pill sumie-stamp-pill" style="color:var(--rune-jade,#34d399);font-size:9px;">
                    EXCLUSIVO DEV
                  </span>
                </div>
                <p class="sumie-dev-muted" style="margin:4px 0 10px;line-height:1.4;">
                  Mapa con podios de bloques, jump pads, lava, puertas mecánicas, cofres y altar de victoria.
                </p>
                <div style="display:flex;flex-direction:column;gap:6px;">
                  <button id="btn-dev-enter-showroom" class="btn-primary" style="width:100%;padding:9px;display:inline-flex;align-items:center;justify-content:center;gap:8px;" title="Cargar mapa showroom">
                    ${renderIcon('sparkles', { size: 15, color: '#fff' })} Entrar al Showroom de Bloques
                  </button>
                  <button id="btn-dev-open-atlas" class="btn-secondary" style="width:100%;padding:8px;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:11px;" title="Abrir Atlas de Expedición">
                    ${renderIcon('map', { size: 14, color: '#38bdf8' })} Explorar Atlas de Expedición
                  </button>
                  ${isCurrentShowroom ? `
                    <button id="btn-dev-exit-showroom" class="btn-secondary" style="width:100%;padding:8px;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:11px;" title="Volver al lobby">
                      ${renderIcon('refresh', { size: 14, color: '#cbd5e1' })} Volver al Lobby / Tutorial
                    </button>
                  ` : ''}
                </div>
              </div>

              <!-- 3. Telemetría de Red WebRTC (?debug=1) -->
              <div class="settings-group sumie-dev-card">
                <div class="setting-row">
                  <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;color:var(--washi-paper,#f8fafc);">
                    ${renderIcon('bolt', { size: 15, color: '#38bdf8' })} Telemetría WebRTC
                  </span>
                  <span class="settings-version-pill sumie-stamp-pill" style="color:var(--rune-cyan,#38bdf8);font-size:9px;">
                    ?debug=1
                  </span>
                </div>
                <p class="sumie-dev-muted" style="margin:4px 0 10px;line-height:1.4;">
                  Monitorea en vivo RTT (ping en ms), paquetes/seg, KB/s y pérdida de paquetes.
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
              <div class="settings-group sumie-dev-card">
                <div class="setting-row">
                  <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;color:var(--washi-paper,#f8fafc);">
                    ${renderIcon('trophy', { size: 15, color: '#fbbf24' })} Diagnóstico de Sesión
                  </span>
                </div>
                <div id="dev-perf-summary" style="font-size:11px;color:var(--washi-muted,#94a3b8);margin:4px 0 10px;line-height:1.6;font-family:'Pixelify Sans',monospace;">
                  FPS: <strong style="color:var(--washi-paper);">${state.perf?.fps ?? '—'}</strong> (obj ≥55)
                  · Draws: <strong style="color:var(--washi-paper);">${state.perf?.calls ?? '—'}</strong>
                  · Tris: <strong style="color:var(--washi-paper);">${state.perf?.tris ?? '—'}</strong>
                  · DPR: <strong style="color:var(--washi-paper);">${state.perf?.dpr ? Number(state.perf.dpr).toFixed(2) : '—'}</strong>
                  · RTT: <strong style="color:var(--washi-paper);">${state.perf?.rttMs ?? '—'} ms</strong>
                  <br>
                  Verticalidad: <strong style="color:var(--rune-cyan);">Y: ${state.gameplay?.altitude != null ? Number(state.gameplay.altitude).toFixed(1) : '—'}m (máx ${state.gameplay?.maxAltitude != null ? Number(state.gameplay.maxAltitude).toFixed(1) : '—'}m)</strong>
                  · Saltos: <strong style="color:var(--rune-gold);">${state.gameplay?.jumpCount ?? 0}</strong>
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px;">
                  <button id="btn-dev-audit" class="btn-secondary sumie-btn-small" style="display:flex;align-items:center;justify-content:center;gap:6px;">
                    ${renderIcon('terminal', { size: 14, color: '#10b981' })} Imprimir Auditoría en Consola (F12)
                  </button>
                  <button id="btn-dev-copy-state" class="btn-secondary sumie-btn-small" style="display:flex;align-items:center;justify-content:center;gap:6px;">
                    ${renderIcon('copy', { size: 14, color: '#cbd5e1' })} <span id="btn-dev-copy-text">Copiar Resumen de Red</span>
                  </button>
                </div>
              </div>

              <!-- 5. Recargar Juego (F5) -->
              <div class="settings-group sumie-dev-card">
                <div class="setting-row">
                  <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;color:var(--washi-paper,#f8fafc);">
                    ${renderIcon('refresh', { size: 15, color: '#38bdf8' })} Recargar Página (F5)
                  </span>
                </div>
                <button id="btn-reload-page" class="btn-primary" style="width:100%;padding:9px;background:linear-gradient(135deg,#0284c7,#0369a1);border:2px solid var(--ink-black);box-shadow:inset 0 0 0 1px var(--rune-cyan), 3px 3px 0px var(--ink-black);display:inline-flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;border-radius:0;font-family:'Silkscreen',monospace;font-size:10px;" title="Recargar juego (F5)">
                  ${renderIcon('refresh', { size: 15, color: '#fff' })} Recargar Página Ahora
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:14px;">
          <button id="btn-dev-close-footer" class="btn-primary" style="width:100%;padding:11px;cursor:pointer;">
            Cerrar Herramientas Dev (Esc)
          </button>
        </div>

        <div class="settings-footer-version" style="color:var(--rune-jade,#6ee7b7);opacity:0.8;margin-top:10px;">
          <span>Entorno de Desarrollo Activo • v${APP_CONFIG.VERSION}</span>
        </div>
      </div>`;

    const handleClose = () => {
      soundManager.playClick();
      this.closeDevModal();
    };

    if (typeof window !== 'undefined') {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      this._devKeyDownHandler = handleKeyDown;
    }

    document.getElementById('btn-close-dev')?.addEventListener('click', handleClose);
    document.getElementById('btn-dev-close-footer')?.addEventListener('click', handleClose);

    // Eventos de Calibración de Salas (si está en juego)
    if (inGame) {
      // Teletransporte a sala seleccionada
      document.getElementById('btn-dev-teleport-room')?.addEventListener('click', () => {
        soundManager.playClick();
        const sel = document.getElementById('dev-sel-room');
        const roomIdx = parseInt(sel?.value || '0', 10);
        callbacks.onTeleportToRoom?.(roomIdx);
        this.closeDevModal();
      });

      // Spawn inicial
      document.getElementById('btn-dev-teleport-spawn')?.addEventListener('click', () => {
        soundManager.playClick();
        callbacks.onTeleportToSpawn?.();
        this.closeDevModal();
      });

      // Botones de puertas
      document.querySelectorAll('.btn-dev-door-warp').forEach(btn => {
        btn.addEventListener('click', () => {
          soundManager.playClick();
          const doorId = parseInt(btn.getAttribute('data-door-id') || '1', 10);
          callbacks.onTeleportToDoor?.(doorId);
          this.closeDevModal();
        });
      });

      // Modo Vuelo (Noclip)
      const btnNoclipOff = document.getElementById('btn-dev-noclip-off');
      const btnNoclipOn = document.getElementById('btn-dev-noclip-on');
      const setNoclipMode = (val) => {
        soundManager.playClick();
        callbacks.onToggleNoclip?.(val);
        btnNoclipOff?.classList.toggle('active', !val);
        btnNoclipOn?.classList.toggle('active', val);
      };
      if (btnNoclipOff) btnNoclipOff.onclick = () => setNoclipMode(false);
      if (btnNoclipOn) btnNoclipOn.onclick = () => setNoclipMode(true);

      // Hero Swapper
      document.querySelectorAll('.btn-dev-hero-pick').forEach(btn => {
        btn.addEventListener('click', () => {
          soundManager.playClick();
          const heroIdx = parseInt(btn.getAttribute('data-hero-idx') || '0', 10);
          callbacks.onSwitchHero?.(heroIdx);
            document.querySelectorAll('.btn-dev-hero-pick').forEach(b => {
              const bIdx = parseInt(b.getAttribute('data-hero-idx') || '0', 10);
              b.classList.toggle('active', bIdx === heroIdx);
            });
        });
      });

      // Overlay de Coordenadas
      const btnOverlayOff = document.getElementById('btn-dev-overlay-off');
      const btnOverlayOn = document.getElementById('btn-dev-overlay-on');
      const setCoordsOverlay = (val) => {
        soundManager.playClick();
        callbacks.onToggleCoordsOverlay?.(val);
        btnOverlayOff?.classList.toggle('active', !val);
        btnOverlayOn?.classList.toggle('active', val);
      };
      if (btnOverlayOff) btnOverlayOff.onclick = () => setCoordsOverlay(false);
      if (btnOverlayOn) btnOverlayOn.onclick = () => setCoordsOverlay(true);

      // Mecanismos
      document.getElementById('btn-dev-open-doors')?.addEventListener('click', () => {
        soundManager.playClick();
        callbacks.onOpenAllDoors?.();
        this.closeDevModal();
      });

      document.getElementById('btn-dev-reset-room')?.addEventListener('click', () => {
        soundManager.playClick();
        callbacks.onResetRoomMechanisms?.();
        this.closeDevModal();
      });

      document.getElementById('btn-dev-heal')?.addEventListener('click', () => {
        soundManager.playClick();
        callbacks.onRestoreHealth?.();
      });

      // Copiar Reporte de Posición
      document.getElementById('btn-dev-copy-report')?.addEventListener('click', () => {
        soundManager.playClick();
        const report = callbacks.onCopyRoomReport?.() || {};
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(JSON.stringify(report, null, 2)).catch(() => {});
        }
        const label = document.getElementById('btn-dev-copy-report-text');
        if (label) label.textContent = '¡Reporte Copiado!';
        setTimeout(() => {
          if (label) label.textContent = 'Copiar Reporte de Posición';
        }, 2200);
      });

      // Copiar Props del Nivel (JSON)
      document.getElementById('btn-dev-copy-props')?.addEventListener('click', () => {
        soundManager.playClick();
        const propsJson = callbacks.onCopyLevelProps?.() || {};
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(JSON.stringify(propsJson, null, 2)).catch(() => {});
        }
        const label = document.getElementById('btn-dev-copy-props-text');
        if (label) label.textContent = '¡JSON Copiado!';
        setTimeout(() => {
          if (label) label.textContent = 'Copiar Props del Nivel (JSON)';
        }, 2200);
      });
    }

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
    if (this._devKeyDownHandler) {
      window.removeEventListener('keydown', this._devKeyDownHandler);
      this._devKeyDownHandler = null;
    }
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
