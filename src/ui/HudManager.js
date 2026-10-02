import { renderIcon, replaceEmojisWithSvg } from './Icons.js';
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
  },

  setActionButtonsVisible(visible) {
    const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? (window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0))
      : false;
    const btnInteract = document.getElementById('btn-interact');
    const btnJump = document.getElementById('btn-jump');

    this._actionButtonsVisible = !!visible;

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

  showGameOver(lives, maxLives) {
    this.updateLives(lives, maxLives);
    this.showNarrativeMessage(
      ':skull: ¡GAME OVER! Has caído en la expedición. Regresando al Campamento con tus vidas restauradas.',
      4500
    );
  },

  /** Velo de transición entre mazmorras (fade negro estilo Dark Souls con nombre del destino). */
  showLevelTransition(title = '', subtitle = '', { victory = false, autoHideMs = 0, onClose = null } = {}) {
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
    if (!this.transitionEl) return;
    if (this._transitionTimer) { clearTimeout(this._transitionTimer); this._transitionTimer = null; }
    this.transitionEl.classList.remove('visible', 'victory');
    this.transitionEl.style.display = 'none';
    this.transitionEl.innerHTML = '';
  },

  /**
   * Tarjeta de descenso sincronizado: cuenta atrás de 5s + botón BAJAR YA.
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
      <div class="descent-title">${renderIcon('vortex', { size: 18, color: '#38bdf8' })} ¡${byName} desciende!</div>
      <div class="descent-timer">5</div>
      <div class="descent-sub">${isTouch ? 'Toca BAJAR YA o baja a la escalinata para ir ya' : 'Pulsa [E / CLICK] o baja a la escalinata para ir ya'}</div>`;
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
  },

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
};
