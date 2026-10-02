/**
 * InventoryModal.js - Modal interactivo del botín de expedición (llaves, gemas, pociones, reliquias)
 */
import { renderIcon, escapeHtml } from '../Icons.js';
import { soundManager } from '../../audio/SoundManager.js';

export const InventoryModalMixin = {
  bindInventory(callbacks = {}) {
    this.inventoryCallbacks = callbacks;
  },

  /**
   * Actualiza el icon botón de inventario (a la izquierda de los corazones)
   * con su estado visual y contador badge de tesoros recolectados.
   */
  updateInventory({ keys = [], gems = 0, relics = [], potions = [] } = {}) {
    this.inventory = { keys, gems, relics, potions };

    if (this.keysTagHud) {
      const keysCount = keys?.length || 0;
      this.keysTagHud.style.display = (keysCount > 0 && this._livesVisible !== false) ? 'flex' : 'none';
      const countEl = document.getElementById('hud-keys-count');
      if (countEl) countEl.textContent = keysCount;
    }

    if (!this.inventoryHud) return;

    const totalItems = (keys?.length || 0) + (gems > 0 ? 1 : 0) + (relics?.length || 0) + (potions?.length || 0);
    const hasAny = totalItems > 0;
    this.inventoryHud.classList.toggle('has-loot', hasAny);
    this.inventoryHud.title = hasAny
      ? `Inventario (${totalItems} ${totalItems === 1 ? 'tesoro' : 'tesoros'}) - Clic para abrir (B)`
      : 'Inventario vacío - Clic para abrir (B)';

    let html = `
      <span class="inv-btn-icon">
        ${renderIcon('chest', { size: 20, color: hasAny ? '#fbbf24' : '#94a3b8' })}
      </span>
    `;

    if (hasAny) {
      html += `<span class="inv-btn-badge">${totalItems}</span>`;
    }

    this.inventoryHud.innerHTML = html;

    // Mantener sincronizado el contador de gemas del HUD de vidas en tiempo real
    if (this._lastLives >= 0) {
      this.updateLives(this._lastLives, this._lastMaxLives);
    }

    if (this.isInventoryOpen) {
      this.renderInventoryModalContent();
    }
  },

  /**
   * Abre el modal interactivo de botín recolectado
   * @param {string|null} filter Filtro opcional ('all' | 'keys' | 'gems' | 'relics' | 'potions')
   */
  openInventoryModal(filter = null) {
    if (filter) {
      this.inventoryFilter = filter;
    } else if (!this.inventoryFilter) {
      this.inventoryFilter = 'all';
    }
    this.closeConfirmDialog();
    if (this.isSettingsOpen) {
      this.closeSettingsModal();
    }
    if (this.isDevOpen) {
      this.closeDevModal();
    }

    this.isInventoryOpen = true;

    // Liberar pointer lock para interacción con cursor
    if (document.exitPointerLock) {
      try { document.exitPointerLock(); } catch {}
    }

    let overlay = document.getElementById('modal-inventory-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-inventory-overlay';
      overlay.className = 'confirm-overlay';
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          soundManager.playClick();
          this.closeInventoryModal();
        }
      });
      this.uiEl.appendChild(overlay);
    }

    this.renderInventoryModalContent();
  },

  getInventoryBodyHtml(activeFilter = this.inventoryFilter || 'all') {
    const { keys = [], gems = 0, relics = [], potions = [] } = this.inventory || {};
    const totalItems = (keys?.length || 0) + (gems > 0 ? 1 : 0) + (relics?.length || 0) + (potions?.length || 0);
    const hasAny = totalItems > 0;

    let keysHtml = '';
    if (keys.length > 0) {
      keysHtml = `
        <div class="inv-section">
          <div class="inv-section-title">
            ${renderIcon('key', { size: 14, color: '#fbbf24' })} LLAVES DE MAZMORRA (${keys.length})
          </div>
          <div class="inv-items-list">
            ${keys.map(k => {
              const name = typeof k === 'string' ? k : (k?.name || 'Llave');
              return `
                <div class="inv-detail-card">
                  <div class="inv-detail-icon key-bg">${renderIcon('key', { size: 20, color: '#fbbf24' })}</div>
                  <div class="inv-detail-info">
                    <div class="inv-detail-name">${escapeHtml(name)}</div>
                    <div class="inv-detail-desc">Llave de paso • Abre puertas selladas</div>
                  </div>
                  <span class="inv-status-pill key">Activa</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    let gemsHtml = '';
    if (gems > 0) {
      gemsHtml = `
        <div class="inv-section" style="${keys.length > 0 ? 'margin-top:14px;' : ''}">
          <div class="inv-section-title">
            ${renderIcon('gem', { size: 14, color: '#38bdf8' })} TESORO EN GEMAS
          </div>
          <div class="inv-detail-card">
            <div class="inv-detail-icon gem-bg">${renderIcon('gem', { size: 22, color: '#38bdf8' })}</div>
            <div class="inv-detail-info">
              <div class="inv-detail-name" style="color:#38bdf8;font-size:15px;font-weight:800;">${gems} Gemas</div>
              <div class="inv-detail-desc">Riquezas extraídas de cofres antiguos</div>
            </div>
            <span class="inv-status-pill gem">Acumulado</span>
          </div>
        </div>
      `;
    }

    let relicsHtml = '';
    if (relics.length > 0) {
      relicsHtml = `
        <div class="inv-section" style="${(keys.length > 0 || gems > 0) ? 'margin-top:14px;' : ''}">
          <div class="inv-section-title">
            ${renderIcon('trophy', { size: 14, color: '#eab308' })} RELIQUIAS MÍTICAS (${relics.length})
          </div>
          <div class="inv-items-list">
            ${relics.map(r => {
              const name = r.name || 'Reliquia';
              const icon = r.icon || 'trophy';
              const color = r.color || '#eab308';
              return `
                <div class="inv-detail-card">
                  <div class="inv-detail-icon relic-bg">${renderIcon(icon, { size: 20, color })}</div>
                  <div class="inv-detail-info">
                    <div class="inv-detail-name" style="color:#fef08a;">${escapeHtml(name)}</div>
                    <div class="inv-detail-desc">Artefacto arcano de inmenso poder</div>
                  </div>
                  <span class="inv-status-pill relic">Mítico</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    let potionsHtml = '';
    if (potions.length > 0) {
      potionsHtml = `
        <div class="inv-section" style="${(keys.length > 0 || gems > 0 || relics.length > 0) ? 'margin-top:14px;' : ''}">
          <div class="inv-section-title">
            ${renderIcon('potion', { size: 14, color: '#f43f5e' })} POCIONES Y ELIXIRES (${potions.length})
          </div>
          <div class="inv-items-list">
            ${potions.map((p, idx) => {
              const name = typeof p === 'string' ? p : (p?.name || 'Poción de Vida');
              const icon = (typeof p === 'object' && p?.icon) || 'potion';
              const color = (typeof p === 'object' && p?.color) || '#f43f5e';
              return `
                <div class="inv-detail-card" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                  <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                    <div class="inv-detail-icon potion-bg" style="background:rgba(244,63,94,0.12);border:1px solid rgba(244,63,94,0.3);display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;flex-shrink:0;">${renderIcon(icon, { size: 20, color })}</div>
                    <div class="inv-detail-info" style="min-width:0;">
                      <div class="inv-detail-name" style="color:#fda4af;">${escapeHtml(name)}</div>
                      <div class="inv-detail-desc">Restaura 1 corazón de vida</div>
                    </div>
                  </div>
                  <button class="btn-use-potion" data-potion-index="${idx}" title="Beber Poción de Vida" style="background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 2px 8px rgba(244,63,94,0.35);flex-shrink:0;transition:transform 0.1s,background 0.2s;">
                    ${renderIcon('potion', { size: 14, color: '#fff' })} Beber
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    if (!hasAny) {
      return `
        <div class="inv-modal-empty">
          <div class="inv-modal-empty-icon">
            ${renderIcon('chest', { size: 32, color: '#64748b' })}
          </div>
          <h3 style="color:#f8fafc;font-size:15px;margin:6px 0 4px;text-align:center;">Cofre de Aventurero Vacío</h3>
          <p style="color:#94a3b8;font-size:12px;line-height:1.5;text-align:center;margin:0;">
            Aún no has recolectado botín en esta mazmorra. Explora las cámaras para encontrar cofres antiguos con llaves, gemas, pociones y reliquias míticas.
          </p>
        </div>
      `;
    }

    if (activeFilter === 'keys') {
      return keysHtml || `
        <div class="inv-modal-empty" style="padding:16px 10px;display:flex;align-items:center;justify-content:center;gap:8px;">
          ${renderIcon('key', { size: 16, color: '#64748b' })}
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">No tienes ninguna llave en tu llavero todavía. Abre cofres en las cámaras para obtener llaves de paso.</p>
        </div>
      `;
    }

    if (activeFilter === 'gems') {
      return gemsHtml || `
        <div class="inv-modal-empty" style="padding:16px 10px;display:flex;align-items:center;justify-content:center;gap:8px;">
          ${renderIcon('gem', { size: 16, color: '#64748b' })}
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">No tienes gemas recolectadas actualmente.</p>
        </div>
      `;
    }

    if (activeFilter === 'relics') {
      return relicsHtml || `
        <div class="inv-modal-empty" style="padding:16px 10px;display:flex;align-items:center;justify-content:center;gap:8px;">
          ${renderIcon('trophy', { size: 16, color: '#64748b' })}
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Aún no has descubierto reliquias arcanas míticas.</p>
        </div>
      `;
    }

    if (activeFilter === 'potions') {
      return potionsHtml || `
        <div class="inv-modal-empty" style="padding:16px 10px;display:flex;align-items:center;justify-content:center;gap:8px;">
          ${renderIcon('potion', { size: 16, color: '#64748b' })}
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">No tienes pociones de vida disponibles.</p>
        </div>
      `;
    }

    return keysHtml + gemsHtml + relicsHtml + potionsHtml;
  },

  /**
   * Cambia el filtro activo actualizando solo la clase activa de los botones
   * y el contenedor de tarjetas sin redibujar ni reiniciar el scroll horizontal de las tags.
   */
  setInventoryFilter(filter = 'all') {
    this.inventoryFilter = filter;
    const overlay = document.getElementById('modal-inventory-overlay');
    if (!overlay) return;

    const bodyEl = overlay.querySelector ? overlay.querySelector('.inventory-modal-body') : null;
    const tagsContainer = overlay.querySelector ? overlay.querySelector('.inv-filter-tags') : null;
    if (!bodyEl || !tagsContainer) {
      this.renderInventoryModalContent();
      return;
    }

    const filterBtns = tagsContainer.querySelectorAll ? tagsContainer.querySelectorAll('.inv-filter-tag') : [];
    filterBtns.forEach(btn => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle('active', isActive);
      if (isActive && typeof btn.scrollIntoView === 'function') {
        try {
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        } catch {}
      }
    });

    bodyEl.innerHTML = this.getInventoryBodyHtml(filter);
    this.bindPotionButtons(overlay);
  },

  renderInventoryModalContent() {
    const overlay = document.getElementById('modal-inventory-overlay');
    if (!overlay) return;

    const { keys = [], gems = 0, relics = [], potions = [] } = this.inventory || {};
    const totalItems = (keys?.length || 0) + (gems > 0 ? 1 : 0) + (relics?.length || 0) + (potions?.length || 0);
    const hasAny = totalItems > 0;
    const activeFilter = this.inventoryFilter || 'all';

    // Preservar posición de scroll horizontal y vertical si ya existía el modal
    const existingTags = overlay.querySelector ? overlay.querySelector('.inv-filter-tags') : null;
    const savedTagsScrollLeft = existingTags ? existingTags.scrollLeft : (this._lastInvTagsScrollLeft || 0);
    const existingPanel = document.getElementById('modal-inventory-panel');
    const savedPanelScrollTop = existingPanel ? existingPanel.scrollTop : 0;

    let filterTagsHtml = '';
    if (hasAny) {
      filterTagsHtml = `
        <div class="inv-filter-tags">
          <button type="button" class="inv-filter-tag ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">Todos (${totalItems})</button>
          <button type="button" class="inv-filter-tag ${activeFilter === 'keys' ? 'active' : ''}" data-filter="keys">${renderIcon('key', { size: 14 })} Solo Llaves (${keys.length})</button>
          <button type="button" class="inv-filter-tag ${activeFilter === 'gems' ? 'active' : ''}" data-filter="gems">${renderIcon('gem', { size: 14 })} Gemas (${gems})</button>
          <button type="button" class="inv-filter-tag ${activeFilter === 'relics' ? 'active' : ''}" data-filter="relics">${renderIcon('trophy', { size: 14 })} Reliquias (${relics.length})</button>
          <button type="button" class="inv-filter-tag ${activeFilter === 'potions' ? 'active' : ''}" data-filter="potions">${renderIcon('potion', { size: 14 })} Pociones (${potions.length})</button>
        </div>
      `;
    }

    const bodyHtml = this.getInventoryBodyHtml(activeFilter);

    overlay.innerHTML = `
      <div id="modal-inventory-panel" class="inventory-modal" style="max-height:86vh;overflow-y:auto;width:92vw;max-width:380px;text-align:left;padding:18px 20px;">
        <div class="settings-header" style="margin-bottom:12px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h2 style="display:flex;align-items:center;gap:6px;font-size:15px;margin:0;">
                ${renderIcon('chest', { size: 18, color: '#f59e0b' })} BOTÍN DE EXPEDICIÓN
              </h2>
              <span class="settings-version-pill" style="color:#fbbf24;background:rgba(251,191,36,0.12);border-color:rgba(251,191,36,0.3);">
                ${totalItems} ${totalItems === 1 ? 'tesoro' : 'tesoros'}
              </span>
            </div>
            <div class="settings-subtitle" style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8;margin-top:4px;">
              ${renderIcon('sparkles', { size: 12, color: '#fbbf24' })} <span>Tesoros, llaves, gemas y elixires recolectados</span>
            </div>
          </div>
          <button id="btn-close-inventory" class="close-x-btn" title="Cerrar">${renderIcon('x', { size: 18, color: 'currentColor' })}</button>
        </div>

        ${filterTagsHtml}

        <div class="inventory-modal-body">
          ${bodyHtml}
        </div>

        <div style="margin-top:16px;">
          <button id="btn-close-inv-modal" class="btn-primary" style="width:100%;padding:11px;">Cerrar Botín</button>
        </div>
      </div>
    `;

    // Restaurar posiciones de scroll si es aplicable
    const newTags = overlay.querySelector ? overlay.querySelector('.inv-filter-tags') : null;
    if (newTags && savedTagsScrollLeft > 0) {
      newTags.scrollLeft = savedTagsScrollLeft;
    }
    const newPanel = document.getElementById('modal-inventory-panel');
    if (newPanel && savedPanelScrollTop > 0) {
      newPanel.scrollTop = savedPanelScrollTop;
    }

    const closeBtn = document.getElementById('btn-close-inventory');
    const closeFooterBtn = document.getElementById('btn-close-inv-modal');

    const handleClose = (e) => {
      if (e) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
      soundManager.playClick();
      this.closeInventoryModal();
    };

    if (closeBtn) {
      closeBtn.onclick = handleClose;
      closeBtn.addEventListener('touchend', handleClose, { passive: false });
    }
    if (closeFooterBtn) {
      closeFooterBtn.onclick = handleClose;
      closeFooterBtn.addEventListener('touchend', handleClose, { passive: false });
    }

    this.bindFilterButtons(overlay);
    this.bindPotionButtons(overlay);
  },

  /**
   * Enlaza eventos de filtrado a las pestañas tags con discriminación precisa
   * entre desplazamiento táctil (scroll/swipe) y pulsación (tap).
   */
  bindFilterButtons(overlay) {
    const filterBtns = (overlay.querySelectorAll ? overlay.querySelectorAll('.inv-filter-tag') : (typeof document !== 'undefined' && document.querySelectorAll ? document.querySelectorAll('.inv-filter-tag') : [])) || [];
    filterBtns.forEach(btn => {
      let touchStartX = 0;
      let touchStartY = 0;
      let isScrolling = false;
      let lastScrollTime = 0;

      btn.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isScrolling = false;
          lastScrollTime = 0;
        }
      }, { passive: true });

      btn.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const dx = e.touches[0].clientX - touchStartX;
          const dy = e.touches[0].clientY - touchStartY;
          if (Math.abs(dx) > 7 || Math.abs(dy) > 7) {
            isScrolling = true;
            lastScrollTime = Date.now();
          }
        }
      }, { passive: true });

      const handleFilter = (e) => {
        if (e?.stopPropagation) {
          e.stopPropagation();
        }
        // Si el usuario estaba realizando un scroll táctil o acaba de terminar de deslizar, ignorar
        if (isScrolling || (Date.now() - lastScrollTime < 350)) {
          isScrolling = false;
          return;
        }
        if (e && e.cancelable && e.type === 'touchend' && e.preventDefault) {
          e.preventDefault();
        }
        soundManager.playClick();
        this.setInventoryFilter(btn.dataset.filter || 'all');
      };

      btn.onclick = handleFilter;
      btn.addEventListener('touchend', handleFilter, { passive: false });
    });

    const tagsContainer = overlay.querySelector ? overlay.querySelector('.inv-filter-tags') : null;
    if (tagsContainer) {
      tagsContainer.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && tagsContainer.scrollWidth > tagsContainer.clientWidth) {
          tagsContainer.scrollLeft += e.deltaY;
          if (e.preventDefault) e.preventDefault();
        }
      }, { passive: false });

      tagsContainer.addEventListener('scroll', () => {
        this._lastInvTagsScrollLeft = tagsContainer.scrollLeft;
      }, { passive: true });
    }
  },

  /**
   * Enlaza eventos a los botones de pociones protegiendo contra pulsaciones accidentales durante el scroll vertical.
   */
  bindPotionButtons(overlay) {
    const potionBtns = (overlay.querySelectorAll ? overlay.querySelectorAll('.btn-use-potion') : (typeof document !== 'undefined' && document.querySelectorAll ? document.querySelectorAll('.btn-use-potion') : [])) || [];
    potionBtns.forEach(btn => {
      let touchStartX = 0;
      let touchStartY = 0;
      let isScrolling = false;
      let lastScrollTime = 0;

      btn.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isScrolling = false;
          lastScrollTime = 0;
        }
      }, { passive: true });

      btn.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const dx = e.touches[0].clientX - touchStartX;
          const dy = e.touches[0].clientY - touchStartY;
          if (Math.abs(dx) > 7 || Math.abs(dy) > 7) {
            isScrolling = true;
            lastScrollTime = Date.now();
          }
        }
      }, { passive: true });

      const handlePotionClick = (e) => {
        if (e?.stopPropagation) {
          e.stopPropagation();
        }
        if (isScrolling || (Date.now() - lastScrollTime < 350)) {
          isScrolling = false;
          return;
        }
        if (e && e.cancelable && e.type === 'touchend' && e.preventDefault) {
          e.preventDefault();
        }
        const idx = parseInt(btn.dataset.potionIndex, 10);
        const potion = this.inventory?.potions?.[idx] || this.inventory?.potions?.[0];
        if (this.inventoryCallbacks?.onUsePotion) {
          this.inventoryCallbacks.onUsePotion(potion, idx);
        }
      };

      btn.onclick = handlePotionClick;
      btn.addEventListener('touchend', handlePotionClick, { passive: false });
    });
  },

  closeInventoryModal() {
    this.isInventoryOpen = false;
    this._lastInvTagsScrollLeft = 0;
    const overlay = document.getElementById('modal-inventory-overlay');
    if (overlay) {
      overlay.remove();
    }
  },

  toggleInventoryModal() {
    if (this.isInventoryOpen) {
      this.closeInventoryModal();
    } else {
      this.openInventoryModal();
    }
  },
};
