/**
 * ShopModal.js - Modal interactivo del Bazar Rúnico del Mercader
 * 
 * Permite comprar suministros y reliquias utilizando gemas acumuladas,
 * o vender pociones, reliquias y tesoros del inventario por gemas.
 */
import { renderIcon, escapeHtml } from '../Icons.js';
import { soundManager } from '../../audio/SoundManager.js';

export const SHOP_CATALOG = [
  {
    id: 'pocion_vida',
    type: 'potion',
    name: 'Poción de Vida',
    icon: 'potion',
    color: '#f43f5e',
    healAmount: 1,
    desc: 'Restaura 1 corazón de salud vital (+1 ❤️).',
    price: 50,
  },
  {
    id: 'pocion_mayor',
    type: 'potion',
    name: 'Elixir Mayor de Vida',
    icon: 'potion',
    color: '#fb7185',
    healAmount: 2,
    desc: 'Elixir vigorizante. Restaura 2 corazones vitales (+2 ❤️❤️).',
    price: 100,
  },
  {
    id: 'pergamino_retorno',
    type: 'scroll',
    name: 'Pergamino de Retorno',
    icon: 'vortex',
    color: '#38bdf8',
    desc: 'Canaliza un portal instantáneo de regreso al Campamento Central (Lobby).',
    price: 120,
  },
  {
    id: 'amuleto_jade',
    type: 'relic',
    name: 'Amuleto de Jade Rúnico',
    icon: 'trophy',
    color: '#10b981',
    desc: 'Reliquia milenaria que canaliza bendiciones de buena fortuna.',
    price: 350,
  },
];

/**
 * Modifica o ajusta el precio de compra de un artículo del bazar.
 * Permite balancear la economía o personalizar el coste de adquisición de vidas u objetos.
 * @param {string} id ID del artículo (ej. 'pocion_vida', 'pocion_mayor')
 * @param {number} newPrice Nuevo precio en gemas
 * @returns {boolean}
 */
export function setShopItemPrice(id, newPrice) {
  const item = SHOP_CATALOG.find(i => i.id === id);
  if (item && typeof newPrice === 'number' && newPrice > 0) {
    item.price = Math.round(newPrice);
    return true;
  }
  return false;
}

export function getSellPrice(item) {
  if (!item) return 50;
  const id = typeof item === 'string' ? item : (item.id || item.name || '');
  const type = typeof item === 'object' ? item.type : '';

  if (id === 'tomo_astral' || /Tomo/i.test(id)) return 650;
  if (id === 'cetro_sombras' || /Cetro/i.test(id)) return 600;
  if (id === 'reloj_arenas_tiempo' || /Reloj/i.test(id)) return 550;
  if (id === 'corona_vacio' || /Corona/i.test(id)) return 500;
  if (id === 'lagrima_hielo' || /L[aá]grima/i.test(id)) return 450;
  if (id === 'orbe_tempestad' || /Orbe/i.test(id)) return 400;
  if (id === 'corazon_volcan' || /Coraz[oó]n/i.test(id)) return 350;
  if (id === 'caliz_sagrado' || /C[aá]liz/i.test(id)) return 250;
  if (id === 'espejo_sombras' || /Espejo/i.test(id)) return 200;
  if (id === 'amuleto_jade') return 200;
  if (id === 'pergamino_retorno' || id === 'runa_retorno' || type === 'scroll') return 60;

  if (type === 'potion' || item.healAmount) {
    return (item.healAmount >= 2) ? 50 : 25;
  }
  if (type === 'key') return 0;
  if (type === 'relic') return 200;

  return 50;
}

export const ShopModalMixin = {
  bindShop(callbacks = {}) {
    this.shopCallbacks = callbacks;
  },

  /**
   * Abre el modal del Bazar Rúnico del Mercader
   * @param {'buy'|'sell'} tab Pestaña activa ('buy' por defecto)
   */
  openShopModal(tab = 'buy') {
    this.shopTab = tab;
    this.closeConfirmDialog?.();
    if (this.isSettingsOpen) this.closeSettingsModal?.();
    if (this.isDevOpen) this.closeDevModal?.();
    if (this.isInventoryOpen) this.closeInventoryModal?.();

    this.isShopOpen = true;

    if (document.exitPointerLock) {
      try { document.exitPointerLock(); } catch {}
    }

    let overlay = document.getElementById('modal-shop-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-shop-overlay';
      overlay.className = 'confirm-overlay';
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          soundManager.playClick();
          this.closeShopModal();
        }
      });
      this.uiEl.appendChild(overlay);
    }

    this.renderShopModalContent();
  },

  closeShopModal() {
    this.isShopOpen = false;
    const overlay = document.getElementById('modal-shop-overlay');
    if (overlay) {
      overlay.style.display = 'none';
      overlay.innerHTML = '';
    }
  },

  toggleShopModal() {
    if (this.isShopOpen) {
      this.closeShopModal();
    } else {
      this.openShopModal('buy');
    }
  },

  renderShopModalContent() {
    const overlay = document.getElementById('modal-shop-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';

    const currentGems = this.inventory?.gems || 0;
    const activeTab = this.shopTab || 'buy';

    overlay.innerHTML = `
      <div id="modal-shop-panel" class="shop-modal" style="max-height:88vh;overflow-y:auto;width:94vw;max-width:440px;text-align:left;padding:20px 22px;">
        <div class="shop-header">
          <div class="shop-title-row">
            <div class="shop-title-main">
              <span class="shop-badge-icon">${renderIcon('gem', { size: 24, color: '#10b981' })}</span>
              <div>
                <h3 class="shop-heading">Bazar Rúnico del Mercader</h3>
                <p class="shop-subheading">Intercambia riquezas por suministros arcanos</p>
              </div>
            </div>
            <button id="btn-close-shop" class="close-x-btn" title="Cerrar (Esc)">
              ${renderIcon('x', { size: 18, color: 'currentColor' })}
            </button>
          </div>

          <!-- Tarjeta de Saldo de Gemas del Jugador -->
          <div class="shop-balance-card">
            <div class="shop-balance-info">
              <span class="shop-balance-label">Tu Monedero</span>
              <div class="shop-balance-value">
                ${renderIcon('gem', { size: 18, color: '#38bdf8' })}
                <span id="shop-gems-counter">${currentGems}</span> <span style="font-size:12px;color:#94a3b8;font-weight:600;">Gemas</span>
              </div>
            </div>
            <div class="shop-pedestal-pill">
              <span class="shop-pedestal-dot"></span>
              Lobby • Pedestal Rúnico
            </div>
          </div>

          <!-- Selector de Pestañas: Comprar vs Vender -->
          <div class="shop-tabs">
            <button class="shop-tab-btn ${activeTab === 'buy' ? 'active' : ''}" data-shop-tab="buy">
              ${renderIcon('sparkles', { size: 16, color: 'currentColor' })} Comprar
            </button>
            <button class="shop-tab-btn ${activeTab === 'sell' ? 'active' : ''}" data-shop-tab="sell">
              ${renderIcon('chest', { size: 16, color: 'currentColor' })} Vender
            </button>
          </div>
        </div>

        <div class="shop-body">
          ${activeTab === 'buy' ? this._getShopBuyListHtml(currentGems) : this._getShopSellListHtml()}
        </div>
      </div>
    `;

    // Listeners
    const closeBtn = document.getElementById('btn-close-shop');
    if (closeBtn) {
      closeBtn.onclick = () => {
        soundManager.playClick();
        this.closeShopModal();
      };
    }

    const tabBtns = overlay.querySelectorAll('.shop-tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        const tab = btn.dataset.shopTab;
        if (tab && tab !== this.shopTab) {
          soundManager.playClick();
          this.shopTab = tab;
          this.renderShopModalContent();
        }
      };
    });

    // Delegación de eventos para Comprar
    const buyBtns = overlay.querySelectorAll('.btn-shop-buy');
    buyBtns.forEach(btn => {
      btn.onclick = () => {
        const itemId = btn.dataset.itemId;
        const item = SHOP_CATALOG.find(i => i.id === itemId);
        if (!item) return;

        if (this.shopCallbacks?.onBuyItem) {
          const ok = this.shopCallbacks.onBuyItem(item, item.price);
          if (ok) {
            this.renderShopModalContent();
          }
        }
      };
    });

    // Delegación de eventos para Vender
    const sellBtns = overlay.querySelectorAll('.btn-shop-sell');
    sellBtns.forEach(btn => {
      btn.onclick = () => {
        const itemType = btn.dataset.itemType;
        const itemId = btn.dataset.itemId;
        const price = parseInt(btn.dataset.itemPrice, 10);
        if (!itemType || !itemId || isNaN(price)) return;

        if (this.shopCallbacks?.onSellItem) {
          const ok = this.shopCallbacks.onSellItem(itemType, itemId, price);
          if (ok) {
            this.renderShopModalContent();
          }
        }
      };
    });
  },

  _getShopBuyListHtml(currentGems) {
    return `
      <div class="shop-items-grid">
        ${SHOP_CATALOG.map(item => {
          const canAfford = currentGems >= item.price;
          return `
            <div class="shop-item-card ${canAfford ? '' : 'disabled'}">
              <div class="shop-item-icon-box" style="background:${item.color}20;border-color:${item.color}60;">
                ${renderIcon(item.icon, { size: 24, color: item.color })}
              </div>
              <div class="shop-item-details">
                <div class="shop-item-title">${escapeHtml(item.name)}</div>
                <div class="shop-item-desc">${escapeHtml(item.desc)}</div>
                <div class="shop-item-price-tag">
                  ${renderIcon('gem', { size: 14, color: '#38bdf8' })}
                  <span>${item.price} Gemas</span>
                </div>
              </div>
              <div class="shop-item-action">
                <button
                  class="btn-shop-buy ${canAfford ? 'ready' : 'locked'}"
                  data-item-id="${item.id}"
                  ${canAfford ? '' : 'disabled title="Gemas insuficientes"'}
                >
                  ${canAfford ? 'Comprar' : 'Insuficiente'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  _getShopSellListHtml() {
    const { relics = [], potions = [] } = this.inventory || {};
    const sellableList = [];

    // 1. Pociones y Consumibles
    potions.forEach(p => {
      const price = getSellPrice(p);
      const isScroll = (typeof p === 'object' && (p.id === 'pergamino_retorno' || p.id === 'runa_retorno' || p.type === 'scroll'));
      sellableList.push({
        raw: p,
        id: p.id || p.name || 'pocion',
        name: p.name || (isScroll ? 'Pergamino de Retorno' : 'Poción de Vida'),
        type: isScroll ? 'scroll' : 'potion',
        icon: (typeof p === 'object' && p.icon) || (isScroll ? 'vortex' : 'potion'),
        color: (typeof p === 'object' && p.color) || (isScroll ? '#38bdf8' : '#f43f5e'),
        desc: isScroll ? `Retorno al Campamento • Valor de venta: ${price} gemas` : `Restaura vida • Valor de venta: ${price} gemas`,
        price,
      });
    });

    // 2. Reliquias
    relics.forEach(r => {
      const price = getSellPrice(r);
      sellableList.push({
        raw: r,
        id: r.id || r.name || 'relic',
        name: r.name || 'Reliquia Mítica',
        type: 'relic',
        icon: r.icon || 'trophy',
        color: r.color || '#eab308',
        desc: `Reliquia ancestral de mazmorra • Valor de venta: ${price} gemas`,
        price,
      });
    });

    if (sellableList.length === 0) {
      return `
        <div class="shop-empty-state">
          <div class="shop-empty-icon">${renderIcon('chest', { size: 32, color: '#64748b' })}</div>
          <div class="shop-empty-title">Sin objetos vendibles</div>
          <p class="shop-empty-desc">
            No tienes pociones, pergaminos ni reliquias en tu inventario actual.<br>
            ¡Explora las mazmorras y saquea cofres para vender tu botín!
          </p>
        </div>
      `;
    }

    return `
      <div class="shop-items-grid">
        ${sellableList.map(item => `
          <div class="shop-item-card sell-card">
            <div class="shop-item-icon-box" style="background:${item.color}20;border-color:${item.color}60;">
              ${renderIcon(item.icon, { size: 24, color: item.color })}
            </div>
            <div class="shop-item-details">
              <div class="shop-item-title">${escapeHtml(item.name)}</div>
              <div class="shop-item-desc">${escapeHtml(item.desc)}</div>
              <div class="shop-item-price-tag sell-tag">
                ${renderIcon('gem', { size: 14, color: '#10b981' })}
                <span style="color:#34d399;">+${item.price} Gemas</span>
              </div>
            </div>
            <div class="shop-item-action">
              <button
                class="btn-shop-sell ready"
                data-item-type="${item.type}"
                data-item-id="${item.id}"
                data-item-price="${item.price}"
              >
                Vender
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },
};
