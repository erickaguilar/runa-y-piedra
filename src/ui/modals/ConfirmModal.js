/**
 * ConfirmModal.js - Diálogo temático de confirmación in-game
 */
import { renderIcon, escapeHtml } from '../Icons.js';
import { soundManager } from '../../audio/SoundManager.js';

export const ConfirmModalMixin = {
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

    const handleBackdrop = (e) => {
      if (e.target === overlay) {
        if (e.cancelable) e.preventDefault();
        soundManager.playClick();
        this.closeConfirmDialog();
        onCancel?.();
      }
    };
    overlay.addEventListener('click', handleBackdrop);
    overlay.addEventListener('touchend', handleBackdrop, { passive: false });

    (document.body || this.uiEl).appendChild(overlay);

    const btnCancel = document.getElementById('btn-confirm-cancel');
    const btnAccept = document.getElementById('btn-confirm-accept');

    if (btnCancel) {
      const handleCancel = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        this.closeConfirmDialog();
        onCancel?.();
      };
      btnCancel.onclick = handleCancel;
      btnCancel.addEventListener('touchend', handleCancel, { passive: false });
    }

    if (btnAccept) {
      const handleAccept = async (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        this.closeConfirmDialog();
        return await onConfirm?.();
      };
      btnAccept.onclick = handleAccept;
      btnAccept.addEventListener('touchend', handleAccept, { passive: false });
    }
  },

  closeConfirmDialog() {
    const el = document.getElementById('modal-confirm-dialog');
    if (el) {
      el.remove();
    }
  },
};
