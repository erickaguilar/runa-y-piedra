/**
 * ChapterModal.js - Modal de selección de capítulos y Atlas de Expedición (10 Capítulos)
 */
import { renderIcon, escapeHtml } from '../Icons.js';
import { soundManager } from '../../audio/SoundManager.js';
import { CHAPTER_CATALOG } from '../../levels/ChapterRegistry.js';

export const ChapterModalMixin = {
  bindCampaign(callbacks = {}) {
    this.campaignCallbacks = callbacks;
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
    const currentLevelId = state.currentLevelId;
    const currentChapter = registry?.getChapterForLevel?.(currentLevelId);
    const currentChapterId = currentChapter ? currentChapter.id : null;
    const isAtLobby = (currentLevelId === 'lobby_tutorial' || !currentLevelId);

    const overlay = document.createElement('div');
    overlay.id = 'modal-chapter-overlay';
    overlay.className = 'modal-chapter-overlay';

    const lobbyCardHtml = `
      <div class="modal-chapter-section-header">
        ${renderIcon('shield', { size: 16, color: '#38bdf8' })}
        <span>Refugio & Campamento Base</span>
      </div>
      <div class="chapter-card lobby-card unlocked ${isAtLobby ? 'is-active' : ''}" data-chapter-id="lobby_tutorial">
        <div class="chapter-card-header">
          <span class="chapter-num-badge lobby">Campamento</span>
          ${isAtLobby 
            ? `<span class="chapter-status-badge current">${renderIcon('mapPin', { size: 12, color: '#38bdf8' })} Ubicación Actual</span>` 
            : '<span class="chapter-status-badge available">Zona Segura</span>'}
        </div>
        <div class="chapter-icon-wrap lobby">
          ${renderIcon('castle', { size: 28, color: isAtLobby ? '#38bdf8' : '#fbbf24' })}
        </div>
        <div class="chapter-card-title">Campamento Central (Lobby)</div>
        <div class="chapter-card-desc">Refugio de la cofradía, monolito cartográfico, forja y zona de maniobras previa a las expediciones.</div>
        <div class="chapter-dungeons-track" title="Zona segura y tutorial">${renderIcon('temple', { size: 13, color: '#38bdf8' })} Mazmorra de Entrenamiento & Sala de Maniobras</div>
        <div class="chapter-card-actions">
          ${isHost ? (isAtLobby 
            ? `<div class="chapter-client-info chapter-action-pill is-current">${renderIcon('mapPin', { size: 12, color: '#38bdf8' })} Estás aquí actualmente</div>` 
            : `<button class="chapter-launch-btn btn-lobby chapter-action-pill is-launch" data-chapter-id="lobby_tutorial">${renderIcon('rocket', { size: 13, color: '#fff' })} Viaje Rápido al Lobby</button>`)
            : (isAtLobby 
              ? `<div class="chapter-client-info chapter-action-pill is-current">${renderIcon('mapPin', { size: 12, color: '#38bdf8' })} Estás aquí actualmente</div>` 
              : '<div class="chapter-client-info chapter-action-pill is-client">Refugio disponible</div>')}
        </div>
      </div>
      <div class="modal-chapter-section-header" style="margin-top: 8px;">
        ${renderIcon('compass', { size: 16, color: '#fbbf24' })}
        <span>Campaña de Expediciones (10 Capítulos)</span>
      </div>
    `;

    const cardsHtml = chapters.map((ch) => {
      const isUnderConstruction = Boolean(ch.underConstruction || ch.number >= 2);
      const isUnlocked = !isUnderConstruction && (registry ? registry.isChapterUnlocked(ch.id) : (ch.number === 1));
      const isCompleted = registry?.progress?.completedChapters?.includes(ch.id) || false;
      const isCurrent = currentChapterId === ch.id;
      const record = registry?.getRecord?.(ch.id);

      const iconName = ch.icon || 'castle';
      const bestTimeText = record?.bestTimeSec
        ? `${Math.floor(record.bestTimeSec / 60)}m ${String(record.bestTimeSec % 60).padStart(2, '0')}s`
        : null;

      const dungeonsList = (ch.dungeons || []).map((d) => escapeHtml(d.name || d.id)).join(' → ');

      if (isUnderConstruction) {
        return `
          <div class="chapter-card locked construction" data-chapter-id="${ch.id}">
            <div class="chapter-card-header">
              <span class="chapter-num-badge locked">Capítulo ${ch.number}</span>
              <span class="chapter-lock-badge construction">${renderIcon('hammer', { size: 12, color: '#f59e0b' })} En Construcción</span>
            </div>
            <div class="chapter-icon-wrap locked construction">
              ${renderIcon(iconName, { size: 28, color: '#f59e0b' })}
            </div>
            <div class="chapter-card-title">${escapeHtml(ch.name)}</div>
            <div class="chapter-card-desc">${escapeHtml(ch.lore)}</div>
            <div class="chapter-dungeons-track construction" title="Niveles en desarrollo">
              ${renderIcon('construction', { size: 12, color: '#f59e0b' })} 3 Niveles: ${dungeonsList}
            </div>
            <div class="chapter-req-notice construction">
              ${renderIcon('construction', { size: 12, color: '#f59e0b' })} Niveles del 2 al 10 en construcción
            </div>
            <div class="chapter-card-actions">
              <div class="chapter-client-info chapter-action-pill is-construction">${renderIcon('construction', { size: 12, color: '#f59e0b' })} En Construcción</div>
            </div>
          </div>
        `;
      }

      if (!isUnlocked) {
        return `
          <div class="chapter-card locked" data-chapter-id="${ch.id}">
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
        statusBadge = `<span class="chapter-status-badge current">${renderIcon('bolt', { size: 12, color: '#38bdf8' })} Activo</span>`;
      } else {
        statusBadge = `<span class="chapter-status-badge available">${renderIcon('compass', { size: 12, color: '#94a3b8' })} Disponible</span>`;
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
            ${bestTimeText ? `<span>${renderIcon('timer', { size: 12, color: '#fbbf24' })} ${bestTimeText}</span>` : ''}
            ${record.deaths !== undefined ? `<span>${renderIcon('skull', { size: 12, color: '#e2e8f0' })} ${record.deaths} bajas</span>` : ''}
          </div>
        `;
      }

      let actionPill = '';
      if (isHost) {
        actionPill = `
          <button class="chapter-launch-btn chapter-action-pill ${isCurrent ? 'btn-current is-current' : 'is-launch'}" data-chapter-id="${ch.id}">
            ${isCurrent ? `${renderIcon('bolt', { size: 13, color: '#fff' })} En curso (Explorar)` : `${renderIcon('rocket', { size: 13, color: '#fff' })} Viaje Rápido`}
          </button>
        `;
      } else {
        actionPill = `
          <div class="chapter-client-info chapter-action-pill is-client">${isCurrent ? `${renderIcon('bolt', { size: 13, color: '#38bdf8' })} En curso` : 'Listo para expedición'}</div>
        `;
      }

      return `
        <div class="chapter-card unlocked ${isCurrent ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}" 
             data-chapter-id="${ch.id}" 
             tabindex="0" 
             title="${isHost ? `Capítulo ${ch.number}: ${escapeHtml(ch.name)}` : `Capítulo ${ch.number}: ${escapeHtml(ch.name)}`}">
          <div class="chapter-card-header">
            <span class="chapter-num-badge">Capítulo ${ch.number}</span>
            ${statusBadge}
          </div>
          <div class="chapter-icon-wrap">
            ${renderIcon(iconName, { size: 28, color: isCurrent ? '#38bdf8' : '#fbbf24' })}
          </div>
          <div class="chapter-card-title">${escapeHtml(ch.name)}</div>
          <div class="chapter-card-desc">${escapeHtml(ch.lore)}</div>
          <div class="chapter-dungeons-track" title="Trilogía de mazmorras">${renderIcon('temple', { size: 13, color: '#38bdf8' })} ${dungeonsList}</div>
          ${starsHtml}
          ${recordInfo}
          <div class="chapter-card-actions">
            ${actionPill}
          </div>
        </div>
      `;
    }).join('');

    const hostNote = isHost
      ? `${renderIcon('crown', { size: 14, color: '#fbbf24' })} <strong>Anfitrión</strong>: Pulsa el botón <strong>Viaje Rápido</strong> para desplegar la expedición con tu equipo.`
      : `${renderIcon('shield', { size: 14, color: '#38bdf8' })} <strong>Aventurero</strong>: Explora los capítulos de la campaña. Solo el anfitrión puede liderar el Viaje Rápido.`;

    overlay.innerHTML = `
      <div class="modal-chapter-box">
        <div class="modal-chapter-header">
          <div class="modal-chapter-title-wrap">
            <div class="modal-chapter-icon">${renderIcon('compass', { size: 24, color: '#38bdf8' })}</div>
            <div>
              <div class="modal-chapter-title">Atlas de Expedición</div>
              <div class="modal-chapter-subtitle" style="display:flex;align-items:center;gap:6px;">
                ${renderIcon('map', { size: 12, color: '#94a3b8' })} <span>Campaña de los 10 Capítulos Primordiales</span>
              </div>
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
          ${lobbyCardHtml}
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

    const handleBackdrop = (e) => {
      if (e.target === overlay) {
        if (Date.now() - openedAt < 350) return;
        if (e.cancelable) e.preventDefault();
        soundManager.playClick();
        this.closeChapterModal();
      }
    };
    overlay.onclick = handleBackdrop;
    overlay.addEventListener('touchend', handleBackdrop, { passive: false });

    const triggerSelect = (chapterId, isTouchEvent = false) => {
      if (isTouchEvent && (Date.now() - openedAt < 350)) return;
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
      let touchStartX = 0;
      let touchStartY = 0;
      let isScrolling = false;

      btn.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isScrolling = false;
        }
      }, { passive: true });

      btn.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const dx = e.touches[0].clientX - touchStartX;
          const dy = e.touches[0].clientY - touchStartY;
          if (Math.hypot(dx, dy) > 8) {
            isScrolling = true;
          }
        }
      }, { passive: true });

      const handleBtn = (e) => {
        if (e) {
          e.stopPropagation();
        }
        if (isScrolling) {
          isScrolling = false;
          return;
        }
        const isTouch = e?.type === 'touchend';
        triggerSelect(btn.dataset.chapterId, isTouch);
      };

      btn.onclick = handleBtn;
      btn.addEventListener('touchend', (e) => {
        if (isScrolling) {
          isScrolling = false;
          return;
        }
        if (e.cancelable) e.preventDefault();
        handleBtn(e);
      }, { passive: false });
    });
  },

  closeChapterModal() {
    this.isChapterOpen = false;
    const overlay = document.getElementById('modal-chapter-overlay');
    if (overlay) {
      overlay.remove();
    }
    this.currentScreen = 'in_game';
    this.setCrosshairVisible(true);
    this.setActionButtonsVisible(true);
  },
};
