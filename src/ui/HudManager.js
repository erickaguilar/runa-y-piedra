import { renderIcon, replaceEmojisWithSvg, escapeHtml } from './Icons.js';
import { soundManager } from '../audio/SoundManager.js';
import { saveManager } from '../storage/SaveManager.js';

export const HudMixin = {
  _bindControlsHud() {
    if (typeof document === 'undefined') return;
    const btnCloseControls = document.getElementById('btn-close-controls');
    if (btnCloseControls && !btnCloseControls.__bound) {
      btnCloseControls.__bound = true;
      const handleClose = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        this.hideControlsHud(true);
      };
      btnCloseControls.onclick = handleClose;
      btnCloseControls.addEventListener('touchend', handleClose, { passive: false });
    }
  },

  setCrosshairVisible(visible) {
    if (this.crosshair) {
      this.crosshair.style.display = visible ? 'block' : 'none';
    }
  },

  setSettingsButtonVisible(visible) {
    if (this.settingsBtn) {
      this.settingsBtn.style.display = visible ? 'flex' : 'none';
    }
    if (!visible && this.muteBtn) {
      this.muteBtn.style.display = 'none';
    }
  },

  setVoiceButtonVisible(visible) {
    if (this.muteBtn) {
      this.muteBtn.style.display = visible ? 'flex' : 'none';
    }
  },

  setActionButtonsVisible(visible) {
    const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? (window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0))
      : false;
    const btnInteract = document.getElementById('btn-interact');
    const btnJump = document.getElementById('btn-jump');
    const flightStick = document.getElementById('flight-stick-zone');

    this._actionButtonsVisible = !!visible;

    // En modo de vuelo activo, la palanca de vuelo del lado derecho sustituye al botón de salto
    if (this._isFlightMode) {
      if (btnJump) btnJump.style.display = 'none';
      if (flightStick) flightStick.style.display = visible ? 'flex' : 'none';
    } else {
      if (flightStick) flightStick.style.display = 'none';
      if (btnJump) btnJump.style.display = (visible && isTouch) ? 'flex' : 'none';
    }

    if (btnInteract) {
      if (!isTouch) {
        // En desktop solo se muestra si hay un objeto interactuable cercano (indicador de tecla E)
        btnInteract.style.display = (visible && this._interactKey && this._interactKey !== 'none') ? 'flex' : 'none';
      } else {
        btnInteract.style.display = visible ? 'flex' : 'none';
      }
    }
  },

  setFlightMode(enabled) {
    this._isFlightMode = !!enabled;
    const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? (window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0))
      : false;
    const btnJump = document.getElementById('btn-jump');
    const flightStick = document.getElementById('flight-stick-zone');
    const isVisible = this._actionButtonsVisible !== false;

    if (this._isFlightMode) {
      if (btnJump) btnJump.style.display = 'none';
      if (flightStick) flightStick.style.display = isVisible ? 'flex' : 'none';
    } else {
      if (flightStick) flightStick.style.display = 'none';
      if (btnJump) btnJump.style.display = (isVisible && isTouch) ? 'flex' : 'none';
    }
  },

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
      ? (window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0))
      : false;

    const iconEl = document.getElementById('interact-icon');
    const labelEl = document.getElementById('interact-label');
    const MAP = {
      door: ['door', isTouch ? 'ABRIR' : '[E] ABRIR'],
      chest: ['chest', isTouch ? 'ABRIR' : '[E] ABRIR'],
      stairs: ['stairs', isTouch ? 'EMPUJAR' : '[E] EMPUJAR'],
      pedestal: ['sparkles', isTouch ? 'ACTIVAR' : '[E] ACTIVAR'],
      cartography: ['compass', isTouch ? 'MAPA' : '[E] MAPA'],
      merchant: ['gem', isTouch ? 'COMERCIAR' : '[E] BAZAR'],
      shop: ['gem', isTouch ? 'COMERCIAR' : '[E] BAZAR'],
      pressure_plate: ['stone', isTouch ? 'PISAR' : '[E] PRESIONAR'],
    };
    if (MAP[key]) {
      if (iconEl) iconEl.innerHTML = renderIcon(MAP[key][0], { size: 26 });
      if (labelEl) labelEl.textContent = MAP[key][1];
      btn.classList.remove('dim');
      btn.classList.add('ready');
      if (this._actionButtonsVisible !== false) {
        btn.style.display = 'flex';
      }
    } else {
      if (iconEl) iconEl.innerHTML = renderIcon('star', { size: 24 });
      if (labelEl) labelEl.textContent = isTouch ? 'USAR' : '[E] USAR';
      btn.classList.add('dim');
      btn.classList.remove('ready');
      if (!isTouch) {
        btn.style.display = 'none';
      } else if (this._actionButtonsVisible !== false) {
        btn.style.display = 'flex';
      }
    }
  },

  setLivesVisible(visible) {
    this._livesVisible = !!visible;
    if (this.livesHud) {
      this.livesHud.style.display = visible ? 'flex' : 'none';
    }
    this.setInventoryVisible(visible);
    this.setKeysTagVisible(visible);
    if (!visible) {
      this.setTutorialControlsVisible(false);
    }
  },

  setKeysTagVisible(visible) {
    if (this.keysTagHud) {
      const keysCount = this.inventory?.keys?.length || 0;
      this.keysTagHud.style.display = (visible && keysCount > 0) ? 'flex' : 'none';
      const countEl = document.getElementById('hud-keys-count');
      if (countEl) countEl.textContent = keysCount;
    }
  },

  setInventoryVisible(visible) {
    if (this.inventoryHud) {
      this.inventoryHud.style.display = visible ? 'flex' : 'none';
    }
    if (!visible) {
      this.closeInventoryModal();
    }
  },

  setTutorialControlsVisible(visible, force = false) {
    if (visible) {
      if (force || !this.isControlsDismissed) {
        this.showControlsHud(false);
      } else {
        this.hideControlsHud(false);
      }
    } else {
      this.hideControlsHud(false);
    }
  },

  showControlsHud(userAction = false) {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('tutorial-controls-hud');
      if (el) {
        el.style.display = 'flex';
      }
    }
    this.isControlsHudVisible = true;
    this._bindControlsHud();
    if (userAction) {
      this.isControlsDismissed = false;
      try {
        saveManager.updateSettings({ controlsDismissed: false });
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('runa_controls_dismissed');
        }
      } catch {}
      this._updateSettingsControlsButtons();
    }
  },

  hideControlsHud(userAction = false) {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('tutorial-controls-hud');
      if (el) {
        el.style.display = 'none';
      }
    }
    this.isControlsHudVisible = false;
    if (userAction) {
      this.isControlsDismissed = true;
      try {
        saveManager.updateSettings({ controlsDismissed: true });
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('runa_controls_dismissed', 'true');
        }
      } catch {}
      this._updateSettingsControlsButtons();
    }
  },

  toggleControlsHud(userAction = true) {
    if (this.isControlsHudVisible) {
      this.hideControlsHud(userAction);
    } else {
      this.showControlsHud(userAction);
    }
    return this.isControlsHudVisible;
  },

  _updateSettingsControlsButtons() {
    if (typeof document === 'undefined') return;
    const btnOn = document.getElementById('btn-controls-on');
    const btnOff = document.getElementById('btn-controls-off');
    if (btnOn && btnOff) {
      btnOn.classList.toggle('active', this.isControlsHudVisible);
      btnOff.classList.toggle('active', !this.isControlsHudVisible);
    }
  },

  /**
   * Actualiza el HUD de estado (vidas con contorno para corazones perdidos, llave y gemas).
   * lives: vidas restantes, maxLives: total.
   * Si hubo pérdida, anima el corazón perdido con shake y contorno vacío.
   */
  updateLives(lives = 3, maxLives = 3, { invulnerable = false, gems = null } = {}) {
    if (!this.livesHud) return;
    const lost = this._lastLives !== -1 && lives < this._lastLives;
    this._lastLives = lives;
    this._lastMaxLives = maxLives;
    let html = '';
    for (let i = 0; i < maxLives; i++) {
      const alive = i < lives;
      const cls = alive ? 'heart' : 'heart lost';
      const iconName = alive ? 'heart' : 'heartOutline';
      const color = alive ? '#ef4444' : '#64748b';
      html += `<span class="${cls}${lost && !alive ? ' hurt' : ''}">${renderIcon(iconName, { size: 18, color })}</span>`;
    }
    const currentGems = gems !== null ? gems : (this.inventory?.gems ?? 0);
    html += `<span class="gems-badge" title="${currentGems} Gemas recolectadas">${renderIcon('gem', { size: 16, color: '#38bdf8' })}<span class="gems-count">${currentGems}</span></span>`;
    this.livesHud.innerHTML = html;
    this.livesHud.classList.toggle('invuln', !!invulnerable);
  },

  /** Muestra/oculta el tag de llaves en el HUD según posesión de llaves. */
  setHasKey(hasKey) {
    this._hasKey = !!hasKey;
    if (this.keysTagHud) {
      const keysCount = this.inventory?.keys?.length || (hasKey ? 1 : 0);
      this.keysTagHud.style.display = (hasKey && keysCount > 0 && this._livesVisible !== false) ? 'flex' : 'none';
      const countEl = document.getElementById('hud-keys-count');
      if (countEl) countEl.textContent = keysCount;
    }
  },

  showGameOver(lives, maxLives, { onContinue = null } = {}) {
    this.updateLives(lives, maxLives);
    this.hideGameOver();
    this.hideNarrativeMessage?.();

    if (typeof document === 'undefined') return;

    const overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    overlay.className = 'game-over-overlay-sumie';
    overlay.setAttribute?.('role', 'alertdialog');
    overlay.setAttribute?.('aria-modal', 'true');
    overlay.setAttribute?.('aria-label', 'Fin de la partida: Game Over');

    const card = document.createElement('div');
    card.id = 'game-over-card';
    card.className = 'game-over-card-sumie';

    card.innerHTML = `
      <div class="game-over-seal-box">
        <span class="game-over-hanko-seal" title="Sello Imperial de Caída">
          ${renderIcon('hanko', { size: 36, color: '#ef4444' })}
        </span>
      </div>
      <div class="game-over-header">
        <h2 class="game-over-title">¡GAME OVER!</h2>
        <div class="game-over-pill">EXPEDICIÓN FALLIDA</div>
      </div>
      <div class="game-over-body">
        <p class="game-over-desc">
          Has sucumbido a las sombras de la mazmorra.
        </p>
        <div class="game-over-notice">
          ${renderIcon('refresh', { size: 14, color: '#38bdf8' })}
          <span>Regresando al <strong>Campamento Central</strong> con tus vidas restauradas.</span>
        </div>
      </div>
      <div class="game-over-actions">
        <button id="btn-game-over-continue" class="btn-primary game-over-continue-btn" type="button" autofocus aria-label="Continuar al Campamento">
          ${renderIcon('check', { size: 16, color: '#ffffff' })} Continuar
        </button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    this.gameOverOverlay = overlay;
    this.gameOverCard = card;

    const handleDismiss = (e) => {
      if (e) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
      soundManager.playClick();
      this.hideGameOver();
      if (typeof onContinue === 'function') onContinue();
    };

    const continueBtn = document.getElementById('btn-game-over-continue') || card.querySelector('#btn-game-over-continue');
    if (continueBtn) {
      continueBtn.onclick = handleDismiss;
      continueBtn.focus?.();
    }

    const handleKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        handleDismiss(e);
      }
    };
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('keydown', handleKey);
      this._gameOverKeyHandler = handleKey;
    }

    // Auto-cierre de seguridad a los 5.5s
    this._gameOverTimer = setTimeout(() => {
      this.hideGameOver();
      if (typeof onContinue === 'function') onContinue();
    }, 5500);
  },

  hideGameOver() {
    if (this._gameOverTimer) {
      clearTimeout(this._gameOverTimer);
      this._gameOverTimer = null;
    }
    if (this._gameOverKeyHandler) {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('keydown', this._gameOverKeyHandler);
      }
      this._gameOverKeyHandler = null;
    }
    if (this.gameOverOverlay) {
      this.gameOverOverlay.remove();
      this.gameOverOverlay = null;
    }
    this.gameOverCard = null;
  },

  /** Velo de transición entre mazmorras (fade negro estilo Dark Souls con nombre del destino). */
  showLevelTransition(title = '', subtitle = '', { victory = false, autoHideMs = 0, onClose = null } = {}) {
    this.hideGameOver?.();
    if (!this.transitionEl) return;
    if (this._transitionTimer) { clearTimeout(this._transitionTimer); this._transitionTimer = null; }
    this.transitionEl.className = victory ? 'visible victory' : 'visible';
    this.transitionEl.style.display = 'flex';
    // Forzar reflow para que la transición de opacidad se reproduzca
    void this.transitionEl.offsetWidth;

    let html = `
      <div class="portal-title">${replaceEmojisWithSvg(title, { className: 'narrative-icon pop-in' })}</div>
      ${subtitle ? `<div class="portal-sub">${replaceEmojisWithSvg(subtitle, { className: 'narrative-icon' })}</div>` : ''}`;

    if (victory) {
      html += `
        <button id="btn-close-victory" class="btn-primary" style="margin-top:22px;padding:12px 28px;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:8px;cursor:pointer;pointer-events:auto;border-radius:12px;background:linear-gradient(135deg,#fbbf24,#d97706);color:#0f172a;border:none;box-shadow:0 0 20px rgba(251,191,36,0.35);">
          ${renderIcon('check', { size: 16, color: '#0f172a' })} Continuar Explorando
        </button>`;
    }

    this.transitionEl.innerHTML = html;

    if (victory) {
      const btn = document.getElementById('btn-close-victory');
      if (btn) {
        btn.onclick = () => {
          this.hideLevelTransition();
          if (onClose) onClose();
        };
      }
    }

    if (autoHideMs > 0) {
      this._transitionTimer = setTimeout(() => {
        this.hideLevelTransition();
        if (onClose) onClose();
      }, autoHideMs);
    }
  },

  hideLevelTransition() {
    this.hideGameOver?.();
    if (!this.transitionEl) return;
    if (this._transitionTimer) { clearTimeout(this._transitionTimer); this._transitionTimer = null; }
    this.transitionEl.classList.remove('visible', 'victory');
    this.transitionEl.style.display = 'none';
    this.transitionEl.innerHTML = '';
  },

  /**
   * Tarjeta de descenso sincronizado unificada: cuenta atrás de 5s + botón BAJAR YA integrado.
   * endsAtMs: timestamp (reloj del Host) del descenso automático.
   */
  showDescentCountdown({ byName = 'Un compañero', endsAtMs = 0, onNow = null } = {}) {
    this.hideDescent();
    this.hideNarrativeMessage?.();
    const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;

    const card = document.createElement('div');
    card.id = 'descent-card';
    card.className = 'descent-card-unified';

    const bigBtn = document.createElement('button');
    bigBtn.id = 'btn-descend-now';
    bigBtn.type = 'button';
    bigBtn.className = 'btn-descend-now-unified';
    bigBtn.title = 'Bajar ya a la siguiente mazmorra';

    const contentHtml = `
      <div class="descent-badge-seal">
        ${renderIcon('temple', { size: 20, color: '#fbbf24' })}
      </div>
      <div class="descent-info-col">
        <div class="descent-title">
          <span>¡${escapeHtml(byName)} desciende!</span>
          <span class="hanko-seal-mini" title="Sello Hanko Imperial" style="display:inline-flex;align-items:center;">${renderIcon('hanko', { size: 14 })}</span>
        </div>
        <div class="descent-sub">${isTouch ? 'Toca aquí para descender' : 'Pulsa [E / Clic] o toca aquí para bajar'}</div>
      </div>
      <div class="descent-action-pill">
        <span class="descent-action-text">${isTouch ? 'BAJAR YA' : '[E] BAJAR YA'}</span>
        <span class="descent-timer-badge"><span class="descent-timer">5</span>s</span>
      </div>
    `;

    bigBtn.innerHTML = contentHtml;
    card.appendChild(bigBtn);
    Object.defineProperty(card, 'innerHTML', {
      get() { return bigBtn.innerHTML; },
      set(val) { bigBtn.innerHTML = val; },
      configurable: true
    });
    document.body.appendChild(card);
    this.descentCard = card;
    this.descentBtn = bigBtn;
    this.descentOnNow = onNow;

    const handleDescent = (e) => {
      if (e) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
      soundManager.playClick();
      if (this.descentOnNow) this.descentOnNow();
    };

    bigBtn.onclick = handleDescent;
    bigBtn.addEventListener('touchend', handleDescent, { passive: false });

    const tick = () => {
      if (!this.descentCard) return;
      const remain = Math.max(0, Math.ceil((endsAtMs - Date.now()) / 1000));
      const el = this.descentCard.querySelector('.descent-timer');
      if (el) el.textContent = remain > 0 ? remain : '0';
    };
    tick();
    this._descentInterval = setInterval(tick, 250);
  },

  hideDescent() {
    if (this._descentInterval) { clearInterval(this._descentInterval); this._descentInterval = null; }
    if (this.descentBtn) {
      this.descentBtn.remove();
      this.descentBtn = null;
    }
    if (this.descentCard) {
      this.descentCard.remove();
      this.descentCard = null;
    }
    this.descentOnNow = null;
  },

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

    // 1. Mensajes de cofre o recompensas: ":chest: ¡Has abierto...! Has obtenido: :key: Llave... y :gem: 100..."
    if (/Has obtenido:|Recompensa:/i.test(text)) {
      const match = text.split(/Has obtenido:|Recompensa:/i);
      const title = match[0].trim();
      let rawItems = match[1] ? match[1].trim() : '';
      let extraInstruction = '';
      if (/Ahora puedes abrir:/i.test(rawItems)) {
        const parts = rawItems.split(/(?=Ahora puedes abrir:)/i);
        rawItems = parts[0].trim();
        extraInstruction = parts[1] ? parts[1].trim().replace(/\.*$/, '') : '';
      }
      const items = rawItems
        .split(/\s+y\s+|,\s*/)
        .map(i => i.trim().replace(/^\.*|\.*$/g, ''))
        .filter(Boolean);
      if (extraInstruction) {
        const prefix = /^(:door:|\u{1F6AA})/u.test(extraInstruction) ? '' : ':door: ';
        items.push(`${prefix}${extraInstruction}`);
      }
      return { title, items };
    }

    // 2. Mensajes con salto de línea explícito (\n)
    if (text.includes('\n')) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      return { title: lines[0], items: lines.slice(1) };
    }

    // 3. Múltiples oraciones separadas por delimitadores (. ! ?)
    // Evitar dividir en abreviaturas comunes (Cap., pág., etc.) o puntos dentro de paréntesis
    const sentences = text
      .split(/(?<=[!?]|\b(?<!Cap|pág|etc|ej|Dr|Sr|Sra)\.)\s+(?![^(]*\))/i)
      .map(s => s.trim())
      .filter(Boolean);

    if (sentences.length > 1) {
      return {
        title: sentences[0],
        items: sentences.slice(1),
      };
    }

    return { title: text, items: [] };
  },

  showNarrativeMessage(content, durationMs = 2400) {
    if (!this.hudMessage) return;
    const { title, items } = this.parseMessageToList(content);
    if (!title && items.length === 0) return;

    // Deduplicación para no saturar con notificaciones idénticas consecutivas
    const cleanContent = typeof content === 'string' ? content.trim() : '';
    const now = Date.now();
    if (this._lastNarrativeText === cleanContent && now - (this._lastNarrativeTime || 0) < 2000) {
      return;
    }
    this._lastNarrativeText = cleanContent;
    this._lastNarrativeTime = now;

    // Acotar y reducir la duración para no obstruir la visión de juego
    const effectiveDuration = Math.min(Math.max(durationMs ? Math.round(durationMs * 0.6) : 2400, 1400), 2800);

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

    // Permitir descartar la alerta tocando o haciendo clic sobre ella
    card.onclick = () => {
      card.classList.add('fade-out');
      setTimeout(() => {
        if (card.parentNode === this.hudMessage) {
          this.hudMessage.removeChild(card);
          if (this.hudMessage.children.length === 0) {
            this.hudMessage.style.display = 'none';
          }
        }
      }, 200);
    };

    // Mantener como máximo 2 alertas activas simultáneas en la lista vertical
    while (this.hudMessage.children.length >= 2) {
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
    }, effectiveDuration);
  },

  // Alias usado por DevTools para logs rápidos
  showHudMessage(content, durationMs) {
    return this.showNarrativeMessage(content, durationMs);
  },

  hideNarrativeMessage() {
    if (this.hudMessage) {
      this.hudMessage.innerHTML = '';
      this.hudMessage.style.display = 'none';
    }
  },

  bindVoice(network) {
    if (!this.muteBtn || this.muteBtn.__bound) return;
    this.muteBtn.__bound = true;

    const updateMuteUI = () => {
      const isMuted = network ? network.isMuted() : true;
      const iconOn = this.muteBtn.querySelector('.icon-mic-on');
      const iconOff = this.muteBtn.querySelector('.icon-mic-off');
      if (iconOn) iconOn.style.display = isMuted ? 'none' : 'block';
      if (iconOff) iconOff.style.display = isMuted ? 'block' : 'none';
      this.muteBtn.classList.toggle('muted', isMuted);
    };

    const handleMuteClick = async (e) => {
      if (e) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
      soundManager.playClick?.();
      if (!network) return;

      if (!network.localStream) {
        const stream = await network._ensureLocalStream();
        if (stream && network.isHost && Array.isArray(network.connections)) {
          for (const c of network.connections) {
            network.startVoiceCall(c.peer);
          }
        }
      } else {
        network.toggleMute();
      }
      updateMuteUI();
    };

    this.muteBtn.onclick = handleMuteClick;
    this.muteBtn.addEventListener('touchend', handleMuteClick, { passive: false });

    if (network && typeof network.addEventListener === 'function') {
      network.addEventListener('voice-mute-change', () => updateMuteUI());
      network.addEventListener('voice-stream-ready', () => updateMuteUI());
      network.addEventListener('voice-stop', () => updateMuteUI());
    }
    updateMuteUI();
  },
};
