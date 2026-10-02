/**
 * SaveSlotsModal.js - Modal de gestión de las 3 ranuras de guardado, importación y exportación JSON
 */
import { PLAYER_HEROES } from '../../config/constants.js';
import { renderIcon, escapeHtml } from '../Icons.js';
import { soundManager } from '../../audio/SoundManager.js';
import { saveManager } from '../../storage/SaveManager.js';

export const SaveSlotsModalMixin = {
  toggleSaveSlotsModal() {
    if (this.isSaveSlotsOpen) {
      this.closeSaveSlotsModal();
    } else {
      this.openSaveSlotsModal();
    }
  },

  async openSaveSlotsModal() {
    this.closeConfirmDialog();
    this.closeInventoryModal();
    if (this.isChapterOpen) {
      this.closeChapterModal();
    }

    let overlay = document.getElementById('modal-save-slots-overlay');
    if (overlay) {
      overlay.remove();
    }

    this.isSaveSlotsOpen = true;
    this.setCrosshairVisible(false);
    this.setActionButtonsVisible(false);
    document.exitPointerLock?.();

    let slots = [];
    try {
      slots = await saveManager.getAllSlotsSummary();
    } catch (err) {
      console.warn('[SaveSlotsModal] Error obteniendo resumen de ranuras:', err);
      slots = [
        { slotId: 'slot_1', isEmpty: true, isActive: true, name: 'Ranura 1', heroIndex: 0, highestChapter: 1, completedCount: 0, totalGems: 0, updatedAt: null },
        { slotId: 'slot_2', isEmpty: true, isActive: false, name: 'Ranura 2', heroIndex: 0, highestChapter: 1, completedCount: 0, totalGems: 0, updatedAt: null },
        { slotId: 'slot_3', isEmpty: true, isActive: false, name: 'Ranura 3', heroIndex: 0, highestChapter: 1, completedCount: 0, totalGems: 0, updatedAt: null },
      ];
    }

    const cardsHtml = slots.map((s) => {
      const num = s.slotId.replace('slot_', '');
      const hero = PLAYER_HEROES[s.heroIndex] || PLAYER_HEROES[0];
      const dateStr = s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() + ' ' + new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sin registros';

      if (s.isEmpty) {
        return `
          <div class="slot-card empty ${s.isActive ? 'is-active' : ''}" data-slot-id="${s.slotId}">
            <div class="slot-card-header">
              <div class="slot-title-wrap">
                <span class="slot-number">Ranura ${num}</span>
                ${s.isActive ? `<span class="slot-badge active">${renderIcon('check', { size: 11, color: '#22c55e' })} Activa</span>` : `<span class="slot-badge empty">Vacía</span>`}
              </div>
            </div>
            <div class="slot-card-body">
              <div class="slot-empty-icon">
                ${renderIcon('sparkles', { size: 26, color: '#64748b' })}
              </div>
              <div class="slot-empty-title">Ranura Disponible</div>
              <div class="slot-empty-desc">Sin progreso de mazmorra</div>
            </div>
            <div class="slot-actions">
              <button class="btn-slot-new" data-slot-id="${s.slotId}">
                ${renderIcon('sparkles', { size: 14, color: '#fff' })} Nueva Partida
              </button>
              <button class="btn-slot-import" data-slot-id="${s.slotId}">
                ${renderIcon('upload', { size: 14, color: '#cbd5e1' })} Importar
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="slot-card filled ${s.isActive ? 'is-active' : ''}" data-slot-id="${s.slotId}">
          <div class="slot-card-header">
            <div class="slot-title-wrap">
              <span class="slot-number">Ranura ${num}</span>
              ${s.isActive ? `<span class="slot-badge active">${renderIcon('check', { size: 11, color: '#22c55e' })} Activa</span>` : `<span class="slot-badge ready">${renderIcon('save', { size: 11, color: '#94a3b8' })} Guardada</span>`}
            </div>
          </div>
          <div class="slot-card-body">
            <div class="slot-hero-info">
              <div class="slot-hero-avatar" style="background:${hero.color};box-shadow: 0 0 12px ${hero.color}55;">
                ${renderIcon(hero.icon || 'shield', { size: 20, color: '#ffffff' })}
              </div>
              <div class="slot-player-meta">
                <div class="slot-player-name">${escapeHtml(s.name)}</div>
                <div class="slot-hero-name" style="color:${hero.color}">${hero.name}</div>
              </div>
            </div>
            <div class="slot-stats-list">
              <div class="slot-stat-row">
                <span class="slot-stat-label">${renderIcon('compass', { size: 13, color: '#38bdf8' })} Máximo Capítulo:</span>
                <span class="slot-stat-val">Capítulo ${s.highestChapter} / 10</span>
              </div>
              <div class="slot-stat-row">
                <span class="slot-stat-label">${renderIcon('trophy', { size: 13, color: '#facc15' })} Conquistados:</span>
                <span class="slot-stat-val">${s.completedCount} ${s.completedCount === 1 ? 'capítulo' : 'capítulos'}</span>
              </div>
              <div class="slot-stat-row">
                <span class="slot-stat-label">${renderIcon('gem', { size: 13, color: '#38bdf8' })} Tesoro Total:</span>
                <span class="slot-stat-val">${s.totalGems} gemas</span>
              </div>
              <div class="slot-stat-row date-row">
                <span class="slot-stat-label">${renderIcon('timer', { size: 12, color: '#94a3b8' })} Guardado:</span>
                <span class="slot-stat-val date-val">${dateStr}</span>
              </div>
            </div>
          </div>
          <div class="slot-actions">
            ${s.isActive
              ? `<button class="btn-slot-current" disabled>${renderIcon('check', { size: 13, color: '#22c55e' })} En Uso</button>`
              : `<button class="btn-slot-load" data-slot-id="${s.slotId}">${renderIcon('save', { size: 13, color: '#fff' })} Cargar</button>`}
            <button class="btn-slot-export" data-slot-id="${s.slotId}" title="Exportar partida (JSON)">${renderIcon('download', { size: 13, color: '#38bdf8' })} Exportar</button>
            <button class="btn-slot-delete" data-slot-id="${s.slotId}" title="Borrar partida">${renderIcon('trash', { size: 13, color: '#ef4444' })} Borrar</button>
          </div>
        </div>
      `;
    }).join('');

    overlay = document.createElement('div');
    overlay.id = 'modal-save-slots-overlay';
    overlay.className = 'modal-save-slots-overlay';
    overlay.innerHTML = `
      <div class="modal-slots-box" role="dialog" aria-modal="true">
        <div class="modal-slots-header">
          <div class="modal-slots-title-wrap">
            <div class="modal-slots-icon">${renderIcon('save', { size: 24, color: '#38bdf8' })}</div>
            <div>
              <div class="modal-slots-title">Ranuras de Guardado</div>
              <div class="modal-slots-subtitle" style="display:flex;align-items:center;gap:6px;">
                ${renderIcon('save', { size: 12, color: '#94a3b8' })} <span>Gestión de Partidas (3 Slots Disponibles)</span>
              </div>
            </div>
          </div>
          <button class="modal-slots-close" id="btn-close-save-slots" aria-label="Cerrar">
            ${renderIcon('x', { size: 20, color: '#94a3b8' })}
          </button>
        </div>

        <div class="modal-slots-banner">
          ${renderIcon('sparkles', { size: 14, color: '#38bdf8' })}
          <span><strong>Regla de la Mazmorra:</strong> El progreso y los tesoros solo se guardan de forma permanente al culminar una mazmorra (descenso por escalinata o consagración del altar supremo).</span>
        </div>

        <div class="slots-grid">
          ${cardsHtml}
        </div>

        <input type="file" id="slot-file-input" accept=".json,application/json" style="display:none;" />
      </div>
    `;

    document.body.appendChild(overlay);
    const openedAt = Date.now();

    const closeBtn = overlay.querySelector('#btn-close-save-slots');
    const handleClose = (e) => {
      if (e) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
      soundManager.playClick();
      this.closeSaveSlotsModal();
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
        this.closeSaveSlotsModal();
      }
    };
    overlay.onclick = handleBackdrop;
    overlay.addEventListener('touchend', handleBackdrop, { passive: false });

    // Cargar ranura
    overlay.querySelectorAll('.btn-slot-load').forEach(btn => {
      const handleLoad = async (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        const slotId = btn.dataset.slotId;
        try {
          const updatedSave = await saveManager.switchSlot(slotId);
          this.playerName = updatedSave.profile?.name || 'Aventurero';
          this.selectedColorIndex = Number.isFinite(updatedSave.profile?.favoriteHero) ? updatedSave.profile.favoriteHero : 0;
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('dungeon_player_name', this.playerName);
              localStorage.setItem('dungeon_player_color', this.selectedColorIndex.toString());
            }
          } catch {}
          try {
            await this.campaignCallbacks?.onReloadCatalog?.();
          } catch {}
          this.settingsCallbacks?.onProfileSave?.({ name: this.playerName, colorIndex: this.selectedColorIndex });
          const num = slotId.replace('slot_', '');
          this.showNarrativeMessage(`:save: Ranura ${num} activada y cargada.`, 3000);
          await this.openSaveSlotsModal();
        } catch (err) {
          this.showNarrativeMessage(`Error al cargar ranura: ${err.message}`, 3500);
        }
      };
      btn.onclick = handleLoad;
      btn.addEventListener('touchend', handleLoad, { passive: false });
    });

    // Nueva partida en ranura vacía
    overlay.querySelectorAll('.btn-slot-new').forEach(btn => {
      const handleNew = async (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        const slotId = btn.dataset.slotId;
        try {
          const updatedSave = await saveManager.switchSlot(slotId);
          this.playerName = updatedSave.profile?.name || 'Aventurero';
          this.selectedColorIndex = Number.isFinite(updatedSave.profile?.favoriteHero) ? updatedSave.profile.favoriteHero : 0;
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('dungeon_player_name', this.playerName);
              localStorage.setItem('dungeon_player_color', this.selectedColorIndex.toString());
            }
          } catch {}
          try {
            await this.campaignCallbacks?.onReloadCatalog?.();
          } catch {}
          this.settingsCallbacks?.onProfileSave?.({ name: this.playerName, colorIndex: this.selectedColorIndex });
          const num = slotId.replace('slot_', '');
          this.showNarrativeMessage(`:save: Nueva partida iniciada en Ranura ${num}.`, 3000);
          await this.openSaveSlotsModal();
        } catch (err) {
          this.showNarrativeMessage(`Error al inicializar ranura: ${err.message}`, 3500);
        }
      };
      btn.onclick = handleNew;
      btn.addEventListener('touchend', handleNew, { passive: false });
    });

    // Exportar partida
    overlay.querySelectorAll('.btn-slot-export').forEach(btn => {
      const handleExport = async (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        const slotId = btn.dataset.slotId;
        try {
          const jsonStr = await saveManager.exportSlotJson(slotId);
          if (!jsonStr) throw new Error('No se pudo generar el archivo de guardado');
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `runa_save_${slotId}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          this.showNarrativeMessage(':save: Archivo de guardado exportado con éxito.', 3000);
        } catch (err) {
          this.showNarrativeMessage(`Error al exportar: ${err.message}`, 3500);
        }
      };
      btn.onclick = handleExport;
      btn.addEventListener('touchend', handleExport, { passive: false });
    });

    // Borrar / Reiniciar partida
    overlay.querySelectorAll('.btn-slot-delete').forEach(btn => {
      const handleDelete = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        const slotId = btn.dataset.slotId;
        const num = slotId.replace('slot_', '');
        this.showConfirmDialog({
          title: `¿Borrar Ranura ${num}?`,
          message: 'Esta acción borrará de forma permanente el avance y los tesoros de esta partida.',
          confirmText: 'Borrar Partida',
          cancelText: 'Cancelar',
          icon: 'trash',
          iconColor: '#ef4444',
          danger: true,
          onConfirm: async () => {
            try {
              await saveManager.deleteSlot(slotId);
              if (slotId === saveManager.currentSlotId) {
                this.playerName = saveManager.currentSave.profile?.name || 'Aventurero';
                this.selectedColorIndex = Number.isFinite(saveManager.currentSave.profile?.favoriteHero) ? saveManager.currentSave.profile.favoriteHero : 0;
                try {
                  if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('dungeon_player_name', this.playerName);
                    localStorage.setItem('dungeon_player_color', this.selectedColorIndex.toString());
                  }
                } catch {}
                try {
                  await this.campaignCallbacks?.onReloadCatalog?.();
                } catch {}
                this.settingsCallbacks?.onProfileSave?.({ name: this.playerName, colorIndex: this.selectedColorIndex });
              }
              this.showNarrativeMessage(`:save: Ranura ${num} reiniciada.`, 3000);
              await this.openSaveSlotsModal();
            } catch (err) {
              console.error('[SaveSlotsModal] Error borrando ranura:', err);
              this.showNarrativeMessage(`Error al borrar ranura: ${err.message}`, 3500);
            }
          },
        });
      };
      btn.onclick = handleDelete;
      btn.addEventListener('touchend', handleDelete, { passive: false });
    });

    // Importar partida
    const fileInput = overlay.querySelector('#slot-file-input');
    let pendingImportSlotId = null;

    overlay.querySelectorAll('.btn-slot-import').forEach(btn => {
      const handleImport = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        pendingImportSlotId = btn.dataset.slotId;
        if (fileInput) {
          fileInput.value = '';
          fileInput.click();
        }
      };
      btn.onclick = handleImport;
      btn.addEventListener('touchend', handleImport, { passive: false });
    });

    if (fileInput) {
      fileInput.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !pendingImportSlotId) return;
        try {
          const text = await file.text();
          await saveManager.importSaveJson(text, pendingImportSlotId);
          const num = pendingImportSlotId.replace('slot_', '');
          this.showNarrativeMessage(`:save: Partida importada con éxito en Ranura ${num}.`, 3000);
          if (pendingImportSlotId === saveManager.currentSlotId) {
            const cur = saveManager.currentSave;
            this.playerName = cur.profile?.name || 'Aventurero';
            this.selectedColorIndex = Number.isFinite(cur.profile?.favoriteHero) ? cur.profile.favoriteHero : 0;
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('dungeon_player_name', this.playerName);
                localStorage.setItem('dungeon_player_color', this.selectedColorIndex.toString());
              }
            } catch {}
            try {
              await this.campaignCallbacks?.onReloadCatalog?.();
            } catch {}
            this.settingsCallbacks?.onProfileSave?.({ name: this.playerName, colorIndex: this.selectedColorIndex });
          }
          await this.openSaveSlotsModal();
        } catch (err) {
          this.showNarrativeMessage(`Error al importar: ${err.message}`, 4000);
        }
      };
    }
  },

  closeSaveSlotsModal() {
    this.isSaveSlotsOpen = false;
    const overlay = document.getElementById('modal-save-slots-overlay');
    if (overlay) {
      overlay.remove();
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
};
