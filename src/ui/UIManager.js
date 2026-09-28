import QRCode from 'qrcode';
import { PLAYER_HEROES } from '../config/constants.js';
import { renderIcon, replaceEmojisWithSvg } from './Icons.js';
import { soundManager } from '../audio/SoundManager.js';

export class UIManager {
  constructor({ uiContainerId = 'ui', crosshairId = 'crosshair', hudMessageId = 'hud-message', settingsBtnId = 'btn-settings', livesHudId = 'hud-lives', transitionId = 'level-transition' } = {}) {
    this.uiEl = document.getElementById(uiContainerId);
    this.crosshair = document.getElementById(crosshairId);
    this.hudMessage = document.getElementById(hudMessageId);
    this.livesHud = document.getElementById(livesHudId);
    this.transitionEl = document.getElementById(transitionId);
    this.settingsBtn = document.getElementById(settingsBtnId);
    this.messageTimeout = null;
    this._lastLives = -1;
    this._lastMaxLives = 3;
    this._hasKey = false;
    this._interactKey = null;

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
      this.settingsBtn.onclick = () => {
        soundManager.playClick();
        this.toggleSettingsModal();
      };
    }
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
        <h1>${renderIcon('swords', { size: 20, color: '#94a3b8' })} VOXEL DUNGEON · CO-OP</h1>
        
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
                  <span class="level-icon">${renderIcon(lvl.icon || 'castle', { size: 24, color: lvl.icon === 'volcano' ? '#f97316' : '#fbbf24' })}</span>
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
        <h1 style="margin-bottom:2px;display:flex;align-items:center;justify-content:center;gap:6px;">${renderIcon('castle', { size: 20, color: '#fbbf24' })} SALA DE EXPEDICIÓN</h1>
        <div class="room-pin-display">${pin}</div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:12px">PIN de 4 dígitos</div>

        <button id="btn-share-link" class="share-btn">
          ${renderIcon('share', { size: 18, color: '#fff' })}
          <span>Compartir en Mensajería</span>
        </button>

        <button id="btn-copy-link" class="copy-btn">
          ${renderIcon('copy', { size: 16, color: '#cbd5e1' })}
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
    const debugEnabled = localStorage.getItem('dungeon_debug') === '1' || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1');

    const heroesHtml = PLAYER_HEROES.map((h, i) => `
      <div class="hero-chip ${i === this.selectedColorIndex ? 'selected' : ''}" 
           data-index="${i}" 
           style="background:${h.color}; --hero-color:${h.color}" 
           title="${h.name}"></div>
    `).join('');
    const currentHero = PLAYER_HEROES[this.selectedColorIndex];

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
              <span>${p.name || 'Aventurero'} (${hero.name})</span>
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
            <span>${this.playerName} (${hero.name})</span>
          </div>
          <span class="party-badge">${state.isHost ? 'Host' : 'Tú'}</span>
        </div>
        <div class="party-item" style="color:#64748b;font-style:italic">
          <span>Esperando compañero...</span>
        </div>`;
    }

    // (Selección de mazmorra eliminada: la progresión es lineal por escalinatas)

    this.uiEl.innerHTML = `
      <div class="menu" style="max-height:86vh;overflow-y:auto;padding-bottom:18px;">
        <div class="settings-header">
          <h2 style="display:flex;align-items:center;gap:6px;">${renderIcon('settings', { size: 18, color: '#cbd5e1' })} CONFIGURACIÓN</h2>
          <button id="btn-close-settings" class="close-x-btn" title="Cerrar">${renderIcon('x', { size: 18, color: 'currentColor' })}</button>
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

        <!-- 4. Telemetría de Red (?debug=1) -->
        <div class="settings-group" style="margin-top:10px;">
          <div class="setting-row">
            <span class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;">
              ${renderIcon('sparkles', { size: 14, color: '#38bdf8' })} Telemetría de Red (?debug=1)
            </span>
          </div>
          <div class="quality-selector">
            <button class="quality-btn ${!debugEnabled ? 'active' : ''}" id="btn-net-debug-off">
              Oculto
            </button>
            <button class="quality-btn ${debugEnabled ? 'active' : ''}" id="btn-net-debug-on">
              Activo (Overlay RTT)
            </button>
          </div>
          <div style="font-size:10px;color:#64748b;margin-top:4px;">
            Monitorea RTT (ping en ms), paquetes/seg, KB/s y pérdidas de paquetes en tiempo real.
          </div>
        </div>

        <!-- 5. Efectos de Sonido Procedurales -->
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
              <div class="party-title">Compañeros en la Mazmorra</div>
              <div id="settings-party-list">
                ${partyHtml}
              </div>
            </div>
          </div>
        ` : ''}

        <div style="display:flex;gap:8px;margin-top:14px;">
          ${inGame ? `<button id="btn-leave-game" class="btn-danger" style="flex:1">Salir al Menú</button>` : ''}
          <button id="btn-save-settings" class="btn-primary" style="flex:1">Aceptar</button>
        </div>
      </div>`;

    // Interacciones del modal
    document.getElementById('btn-close-settings').onclick = () => {
      soundManager.playClick();
      this.closeSettingsModal();
    };

    // Selector de clases en configuración
    const chips = this.uiEl.querySelectorAll('.hero-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        soundManager.playClick();
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        const idx = parseInt(chip.dataset.index, 10);
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
      if (confirm('¿Deseas salir al menú principal? Se abandonará la partida actual.')) {
        this.closeSettingsModal();
        this.settingsCallbacks?.onLeaveGame?.();
      }
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
            <span>${p.name || 'Aventurero'} (${hero.name})</span>
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
    const btnInteract = document.getElementById('btn-interact');
    const btnJump = document.getElementById('btn-jump');
    if (btnInteract) btnInteract.style.display = visible ? 'flex' : 'none';
    if (btnJump) btnJump.style.display = visible ? 'flex' : 'none';
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

    const iconEl = document.getElementById('interact-icon');
    const labelEl = document.getElementById('interact-label');
    const MAP = {
      door: ['door', 'ABRIR'],
      chest: ['chest', 'ABRIR'],
      stairs: ['stone', 'EMPUJAR'],
      pedestal: ['sparkles', 'ACTIVAR'],
    };
    if (MAP[key]) {
      if (iconEl) iconEl.innerHTML = renderIcon(MAP[key][0], { size: 26 });
      if (labelEl) labelEl.textContent = MAP[key][1];
      btn.classList.remove('dim');
      btn.classList.add('ready');
    } else {
      if (iconEl) iconEl.innerHTML = renderIcon('star', { size: 24 });
      if (labelEl) labelEl.textContent = 'USAR';
      btn.classList.add('dim');
      btn.classList.remove('ready');
    }
  }

  setLivesVisible(visible) {
    if (this.livesHud) {
      this.livesHud.style.display = visible ? 'flex' : 'none';
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
      '💀 ¡GAME OVER! Te quedaste sin vidas. Reapareces en el inicio con corazones llenos.',
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
    const card = document.createElement('div');
    card.id = 'descent-card';
    card.innerHTML = `
      <div class="descent-title">${renderIcon('vortex', { size: 18, color: '#38bdf8' })} ¡${byName} desciende!</div>
      <div class="descent-timer">8</div>
      <div class="descent-sub">Baja a la escalinata para ir ya</div>
      <button id="btn-descend-now" type="button">BAJAR YA</button>`;
    document.body.appendChild(card);
    this.descentCard = card;
    this.descentOnNow = onNow;

    const btn = card.querySelector('#btn-descend-now');
    if (btn) {
      btn.onclick = () => {
        if (this.descentOnNow) this.descentOnNow();
      };
    }

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
