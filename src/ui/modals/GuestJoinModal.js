/**
 * GuestJoinModal.js - Selector de Héroe y Perfil al Unirse como Invitado
 * 
 * Permite a los jugadores que se unen a una mazmorra mediante PIN o enlace directo (?join=XXXX)
 * confirmar su apodo, inspeccionar los atributos y habilidades de las 5 clases y seleccionar
 * su aventurero antes de ingresar a la expedición.
 */
import { renderIcon, escapeHtml } from '../Icons.js';
import { PLAYER_HEROES } from '../../config/constants.js';
import { soundManager } from '../../audio/SoundManager.js';

export const GuestJoinModalMixin = {
  /**
   * Muestra el modal interactivo de selección de clase y apodo para invitados.
   * @param {object} options
   * @param {string} options.pin - PIN de la sala a la que se une.
   * @param {string} [options.initialName] - Nombre predeterminado.
   * @param {number} [options.initialHeroIndex] - Índice de héroe predeterminado (0..4).
   * @param {function} [options.onConfirm] - Callback invocado con { name, colorIndex }.
   * @param {function} [options.onCancel] - Callback al cancelar o cerrar el diálogo.
   */
  showGuestJoinModal({
    pin = '',
    initialName = '',
    initialHeroIndex = 0,
    onConfirm = () => {},
    onCancel = () => {},
  } = {}) {
    this.closeGuestJoinModal();

    let selectedHeroIndex = Math.max(0, Math.min(PLAYER_HEROES.length - 1, Number(initialHeroIndex) || 0));
    const currentHero = PLAYER_HEROES[selectedHeroIndex] || PLAYER_HEROES[0];

    // Detectar si el nombre ya ha sido personalizado por el jugador o sigue siendo el nombre genérico de una clase
    const isHeroClassName = (name) => {
      if (!name) return true;
      const clean = name.trim().toLowerCase();
      return PLAYER_HEROES.some((h) => h.name.toLowerCase() === clean);
    };

    const rawInitialName = (initialName || this.playerName || '').trim();
    let hasUserEditedName = Boolean(rawInitialName && !isHeroClassName(rawInitialName));
    const initialPlayerName = hasUserEditedName ? rawInitialName : currentHero.name;

    const overlay = document.createElement('div');
    overlay.id = 'modal-guest-join-dialog';
    overlay.className = 'confirm-overlay';

    const renderChipsHtml = () => {
      return PLAYER_HEROES.map((h) => {
        const isSelected = h.index === selectedHeroIndex;
        return `
          <div class="hero-chip ${isSelected ? 'selected' : ''}" 
               data-hero-index="${h.index}" 
               style="background:${h.color};--hero-color:${h.color}"
               role="button"
               tabindex="0"
               title="${escapeHtml(h.name)} - ${escapeHtml(h.title)}">
            ${renderIcon(h.icon || 'shield', { size: 18, color: '#fff' })}
          </div>
        `;
      }).join('');
    };

    overlay.innerHTML = `
      <div class="confirm-modal modal-guest-box" role="dialog" aria-modal="true">
        <div class="modal-slots-header" style="width:100%;box-sizing:border-box;">
          <div class="modal-slots-title-wrap">
            <div class="modal-slots-icon" style="background:rgba(56,189,248,0.15);border-color:rgba(56,189,248,0.4);">
              ${renderIcon('door', { size: 22, color: '#38bdf8' })}
            </div>
            <div>
              <div class="modal-slots-title">Unirse a la Mazmorra</div>
              <div class="modal-slots-subtitle" style="display:flex;align-items:center;gap:4px;">
                ${renderIcon('key', { size: 12, color: '#fbbf24' })}
                <span>Sala <strong>#${escapeHtml(pin)}</strong> · Elige tu Aventurero</span>
              </div>
            </div>
          </div>
          <button id="btn-guest-modal-close" class="modal-slots-close" type="button" aria-label="Cerrar">
            ${renderIcon('close', { size: 16, color: '#94a3b8' })}
          </button>
        </div>

        <div style="width:100%;text-align:left;margin-top:10px;">
          <label class="lobby-label" style="display:flex;align-items:center;gap:5px;margin-bottom:6px;">
            ${renderIcon('user', { size: 12, color: '#38bdf8' })} Apodo de Aventurero
          </label>
          <input id="guest-player-name-input" 
                 class="name-input" 
                 maxlength="14" 
                 value="${escapeHtml(initialPlayerName)}" 
                 placeholder="Tu apodo..." 
                 autocomplete="off" />
        </div>

        <div style="width:100%;text-align:left;margin-top:14px;">
          <label class="lobby-label" style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
            ${renderIcon('shield', { size: 12, color: '#f59e0b' })} Clase de Héroe
          </label>
          <div class="heroes-row" id="guest-heroes-row">
            ${renderChipsHtml()}
          </div>
          <div id="guest-hero-badge" class="hero-badge" style="color:${currentHero.color};margin-bottom:6px;">
            ${renderIcon(currentHero.icon || 'shield', { size: 14, color: currentHero.color })} 
            <span>${escapeHtml(currentHero.name)} (${escapeHtml(currentHero.title)})</span>
          </div>
          <div id="guest-hero-trait-container">
            ${this.renderHeroTraitCard ? this.renderHeroTraitCard(currentHero) : ''}
          </div>
        </div>

        <div class="confirm-actions" style="width:100%;margin-top:18px;">
          <button id="btn-guest-cancel" class="btn-secondary" type="button">
            ${renderIcon('close', { size: 13, color: '#94a3b8' })} Volver
          </button>
          <button id="btn-guest-confirm" class="btn-primary" type="button" style="flex:1.5;">
            ${renderIcon('door', { size: 16, color: '#fff' })} ¡Entrar a la Expedición!
          </button>
        </div>
      </div>
    `;

    const handleBackdrop = (e) => {
      if (e.target === overlay) {
        if (e.cancelable) e.preventDefault();
        soundManager.playClick();
        this.closeGuestJoinModal();
        onCancel?.();
      }
    };
    overlay.addEventListener('click', handleBackdrop);

    (document.body || this.uiEl).appendChild(overlay);

    const nameInput = document.getElementById('guest-player-name-input');
    if (nameInput) {
      nameInput.value = initialPlayerName;
    }
    const heroesRow = document.getElementById('guest-heroes-row');
    const heroBadge = document.getElementById('guest-hero-badge');
    const traitContainer = document.getElementById('guest-hero-trait-container');
    const btnCancel = document.getElementById('btn-guest-cancel');
    const btnConfirm = document.getElementById('btn-guest-confirm');
    const btnClose = document.getElementById('btn-guest-modal-close');

    overlay._updateSelectedHero = (idx) => updateSelectedHero(idx);

    const updateSelectedHero = (idx) => {
      selectedHeroIndex = idx;
      const hero = PLAYER_HEROES[idx] || PLAYER_HEROES[0];
      if (!hasUserEditedName && nameInput) {
        nameInput.value = hero.name;
      }
      if (heroesRow) {
        heroesRow.querySelectorAll('.hero-chip').forEach((chip) => {
          const cIdx = parseInt(chip.getAttribute('data-hero-index'), 10);
          chip.classList.toggle('selected', cIdx === idx);
        });
      }
      if (heroBadge) {
        heroBadge.style.color = hero.color;
        heroBadge.innerHTML = `${renderIcon(hero.icon || 'shield', { size: 14, color: hero.color })} <span>${escapeHtml(hero.name)} (${escapeHtml(hero.title)})</span>`;
      }
      if (traitContainer && this.renderHeroTraitCard) {
        traitContainer.innerHTML = this.renderHeroTraitCard(hero);
      }
    };

    if (heroesRow) {
      heroesRow.addEventListener('click', (e) => {
        const chip = e.target.closest('.hero-chip');
        if (!chip) return;
        const idx = parseInt(chip.getAttribute('data-hero-index'), 10);
        if (!isNaN(idx)) {
          soundManager.playClick();
          updateSelectedHero(idx);
        }
      });
    }

    const doConfirm = () => {
      soundManager.playClick();
      const hero = PLAYER_HEROES[selectedHeroIndex] || PLAYER_HEROES[0];
      const finalName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : hero.name;
      // Guardar preferencia de sesión para invitados sin alterar las ranuras guardadas locales
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('dungeon_guest_name', finalName);
          sessionStorage.setItem('dungeon_guest_hero', String(selectedHeroIndex));
        }
      } catch {}
      this.closeGuestJoinModal();
      onConfirm({ name: finalName, colorIndex: selectedHeroIndex });
    };

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        const val = nameInput.value.trim();
        hasUserEditedName = Boolean(val && !isHeroClassName(val));
      });
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doConfirm();
      });
      setTimeout(() => {
        try { nameInput.focus(); } catch {}
      }, 100);
    }

    if (btnConfirm) {
      btnConfirm.onclick = (e) => {
        e.stopPropagation();
        doConfirm();
      };
    }

    const doCancel = (e) => {
      if (e) e.stopPropagation();
      soundManager.playClick();
      this.closeGuestJoinModal();
      onCancel?.();
    };

    if (btnCancel) btnCancel.onclick = doCancel;
    if (btnClose) btnClose.onclick = doCancel;
  },

  /**
   * Cierra y elimina el diálogo de unión de invitado si está en pantalla.
   */
  closeGuestJoinModal() {
    const input = document.getElementById('guest-player-name-input');
    if (input && typeof input.remove === 'function') input.remove();
    const el = document.getElementById('modal-guest-join-dialog');
    if (el) el.remove();
  },
};
