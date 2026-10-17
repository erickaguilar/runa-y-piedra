/**
 * InventoryController.js - Gestión del inventario de botín recolectado
 * 
 * Controla llaves, gemas, reliquias arcanas y pociones de salud.
 * Sincroniza reactivamente el HUD y el modal de inventario.
 */
import * as Proto from '../network/Protocol.js';
import { createInventoryItem } from '../inventory/ItemRegistry.js';

export const InventoryMixin = {
  addInventoryKey(key) {
    const keyObj = createInventoryItem(key, { type: 'key' });
    const keyId = keyObj.id;
    if (!this.inventory.keys.some(k => (typeof k === 'string' ? k : (k.id || k.name)) === keyId)) {
      this.inventory.keys.push(keyObj);
      this.ui.updateInventory(this.inventory);
    }
  },

  /**
   * Elimina una llave del inventario (al ser consumida abriendo una puerta)
   * y actualiza el HUD y el modal de inventario en tiempo real.
   */
  removeInventoryKey(keyId) {
    if (!keyId || !Array.isArray(this.inventory?.keys)) return false;
    const targetId = typeof keyId === 'object' ? (keyId.id || keyId.name) : keyId;
    const idx = this.inventory.keys.findIndex(k => (typeof k === 'string' ? k : (k.id || k.name)) === targetId);
    if (idx !== -1) {
      this.inventory.keys.splice(idx, 1);
      this.ui.updateInventory(this.inventory);
      return true;
    }
    return false;
  },

  addInventoryGems(amount) {
    const n = parseInt(String(amount), 10);
    if (!isNaN(n) && n > 0) {
      this.inventory.gems = (this.inventory.gems || 0) + n;
      this.ui?.updateInventory?.(this.inventory);
    }
  },

  /**
   * Consume una cantidad de gemas del inventario (para compras en el bazar)
   * @param {number} amount
   * @returns {boolean} True si la transacción fue exitosa
   */
  spendInventoryGems(amount) {
    const n = parseInt(String(amount), 10);
    if (!isNaN(n) && n > 0 && (this.inventory?.gems || 0) >= n) {
      this.inventory.gems = Math.max(0, (this.inventory.gems || 0) - n);
      this.ui?.updateInventory?.(this.inventory);
      return true;
    }
    return false;
  },

  /**
   * Retira una poción del inventario (al venderla o descartarla)
   * @param {string|Object|null} potionId
   * @param {number} idx
   * @returns {Object|null} Poción retirada
   */
  removeInventoryPotion(potionId = null, idx = -1) {
    if (!Array.isArray(this.inventory?.potions) || this.inventory.potions.length === 0) return null;
    let removed = null;
    if (idx >= 0 && idx < this.inventory.potions.length) {
      removed = this.inventory.potions.splice(idx, 1)[0];
    } else if (potionId) {
      const targetId = typeof potionId === 'object' ? (potionId.id || potionId.name) : potionId;
      const fIdx = this.inventory.potions.findIndex(p => (typeof p === 'string' ? p : (p.id || p.name)) === targetId);
      if (fIdx !== -1) {
        removed = this.inventory.potions.splice(fIdx, 1)[0];
      }
    } else {
      removed = this.inventory.potions.pop();
    }
    if (removed) {
      this.ui?.updateInventory?.(this.inventory);
    }
    return removed;
  },

  /**
   * Procesa la compra de un artículo del bazar del mercader
   * @param {Object} item Definición del objeto a adquirir
   * @param {number} price Costo en gemas
   * @returns {boolean}
   */
  buyShopItem(item, price) {
    if (!item || !price) return false;
    if (item.type === 'key') {
      this.soundManager?.playLocked?.();
      this.ui?.showNarrativeMessage?.('Las llaves no están a la venta en el bazar.', 2500);
      return false;
    }

    if (!this.spendInventoryGems(price)) {
      this.soundManager?.playLocked?.();
      this.ui?.showNarrativeMessage?.(':gem: Gemas insuficientes para comprar este objeto.', 2800);
      return false;
    }

    if (item.type === 'potion' || item.type === 'scroll' || item.type === 'consumable') {
      this.addInventoryPotion(item);
    } else {
      this.addInventoryRelic(item);
    }

    this.soundManager?.playPotion?.();
    this.ui?.showNarrativeMessage?.(`:gem: ¡Has adquirido ${item.name}! (-${price} gemas)`, 3000);
    return true;
  },

  /**
   * Procesa la venta de un artículo del inventario al mercader a cambio de gemas
   * @param {'potion'|'scroll'|'consumable'|'relic'|'key'} itemType Tipo de objeto
   * @param {string} itemId ID del objeto
   * @param {number} price Gemas a recibir
   * @returns {boolean}
   */
  sellShopItem(itemType, itemId, price) {
    if (itemType === 'key') {
      this.soundManager?.playLocked?.();
      this.ui?.showNarrativeMessage?.('Las llaves no pueden venderse en el mercado.', 2500);
      return false;
    }

    const p = parseInt(String(price), 10);
    if (isNaN(p) || p <= 0) return false;

    let success = false;
    if (itemType === 'potion' || itemType === 'scroll' || itemType === 'consumable') {
      const removed = this.removeInventoryPotion(itemId);
      success = !!removed;
    } else if (itemType === 'relic') {
      success = this.removeInventoryRelic(itemId);
    }

    if (!success) {
      this.soundManager?.playLocked?.();
      this.ui?.showNarrativeMessage?.('No posees este objeto en tu inventario.', 2500);
      return false;
    }

    this.addInventoryGems(p);
    this.soundManager?.playChestOpen?.();
    this.ui?.showNarrativeMessage?.(`:gem: ¡Has vendido el objeto por +${p} gemas!`, 3000);
    return true;
  },

  addInventoryRelic(relic) {
    const relicObj = createInventoryItem(relic, { type: 'relic' });
    const relicId = relicObj.id;
    if (!this.inventory.relics.some(r => (r.id || r.name) === relicId)) {
      this.inventory.relics.push(relicObj);
      this.ui.updateInventory(this.inventory);
    }
  },

  /**
   * Elimina una reliquia del inventario (para altares, sacrificios o usos míticos)
   */
  removeInventoryRelic(relicId) {
    if (!relicId || !Array.isArray(this.inventory?.relics)) return false;
    const targetId = typeof relicId === 'object' ? (relicId.id || relicId.name) : relicId;
    const idx = this.inventory.relics.findIndex(r => (typeof r === 'string' ? r : (r.id || r.name)) === targetId);
    if (idx !== -1) {
      this.inventory.relics.splice(idx, 1);
      this.ui.updateInventory(this.inventory);
      return true;
    }
    return false;
  },

  addInventoryPotion(potion) {
    const potionObj = createInventoryItem(potion, { type: (potion?.type || 'potion') });
    if (!this.inventory.potions) this.inventory.potions = [];
    this.inventory.potions.push(potionObj);
    this.ui.updateInventory(this.inventory);
  },

  usePotion(potion = null, idx = -1) {
    if (!this.inventory?.potions || this.inventory.potions.length === 0) {
      this.ui?.showNarrativeMessage?.('No tienes pociones ni consumibles en tu inventario.', 2500);
      return false;
    }

    let potionObj = null;
    let targetIdx = idx;
    if (targetIdx >= 0 && targetIdx < this.inventory.potions.length) {
      potionObj = this.inventory.potions[targetIdx];
    } else {
      const pIdx = potion ? this.inventory.potions.findIndex(p => (p.id || p.name) === (potion.id || potion.name)) : -1;
      targetIdx = pIdx >= 0 ? pIdx : (this.inventory.potions.length - 1);
      potionObj = this.inventory.potions[targetIdx];
    }

    if (!potionObj) return false;

    // Si es un Pergamino o Runa de Retorno al Lobby
    if (potionObj.id === 'pergamino_retorno' || potionObj.id === 'runa_retorno' || potionObj.type === 'scroll' || potionObj.action === 'teleport_lobby') {
      return this.useTeleportScroll(potionObj, targetIdx);
    }

    const local = this.playerManager?.localPlayer;
    if (!local) return false;

    // Si ya tiene todas las vidas, no desperdiciar la poción
    if (local.lives >= (local.maxLives ?? 3)) {
      this.soundManager?.playClick?.();
      this.ui?.showNarrativeMessage?.(':heart: ¡Tu salud ya está al máximo (3/3 corazones)!', 3000);
      return false;
    }

    // Retirar 1 poción del inventario
    this.inventory.potions.splice(targetIdx, 1);

    const healAmount = potionObj?.healAmount || 1;
    const healResult = local.recoverHeart(healAmount);

    // Audio y retroalimentación en HUD
    this.soundManager?.playPotion?.();
    this.ui?.updateLives?.(local.lives, local.maxLives ?? 3);
    this.ui?.showNarrativeMessage?.(`:potion: ¡Has bebido ${potionObj?.name || 'la Poción de Vida'}! +${healResult.recovered} :heart: corazón restaurado.`, 3500);

    this.ui?.updateInventory?.(this.inventory);
    if (this.ui?.isInventoryOpen) {
      this.ui.renderInventoryModalContent?.();
    }

    // Sincronización multijugador autoritativa: notificar al host si somos cliente
    if (this.mode === 'client' && this.network?.sendToHost) {
      this.network.sendToHost(Proto.serializePotionUse(local.id, healAmount));
    }

    return true;
  },

  /**
   * Utiliza un Pergamino de Retorno para teletransportar al jugador al Campamento Central (Lobby).
   * Si ya se encuentra en el lobby, evita consumirse y advierte al jugador.
   * @param {Object|null} scrollObj Objeto de pergamino
   * @param {number} idx Índice en inventory.potions
   * @returns {boolean}
   */
  useTeleportScroll(scrollObj = null, idx = -1) {
    if (!this.inventory?.potions || this.inventory.potions.length === 0) return false;

    const curLevelId = this.world?.levelRegistry?.currentLevelId || this.world?.currentLevel?.id || 'lobby_tutorial';
    if (curLevelId === 'lobby_tutorial') {
      this.soundManager?.playClick?.();
      this.ui?.showNarrativeMessage?.(':sparkles: Ya te encuentras en el Campamento Central (Lobby).', 2800);
      return false;
    }

    let targetIdx = idx;
    if (targetIdx < 0 || targetIdx >= this.inventory.potions.length) {
      const scrollId = scrollObj?.id || scrollObj?.name;
      targetIdx = this.inventory.potions.findIndex(p => {
        const id = p?.id || p?.name;
        if (scrollId && id === scrollId) return true;
        return id === 'pergamino_retorno' || id === 'runa_retorno' || p?.type === 'scroll';
      });
    }

    if (targetIdx === -1) {
      this.ui?.showNarrativeMessage?.('No posees un Pergamino de Retorno en el inventario.', 2500);
      return false;
    }

    const removedItem = this.inventory.potions.splice(targetIdx, 1)[0];
    const itemName = removedItem?.name || 'Pergamino de Retorno';

    this.soundManager?.playLevelComplete?.() || this.soundManager?.playChestOpen?.();
    this.ui?.updateInventory?.(this.inventory);
    if (this.ui?.isInventoryOpen) {
      this.ui.closeInventoryModal?.();
    }

    this.ui?.showNarrativeMessage?.(`:sparkles: ¡Has usado ${itemName}! Canalizando portal al Campamento Central...`, 3500);

    if (this.mode === 'client') {
      if (this.network?.sendToHost) {
        this.network.sendToHost(Proto.serializeLevelChange('lobby_tutorial', false));
      }
      if (typeof this.switchLevel === 'function') {
        this.switchLevel('lobby_tutorial', false);
      }
    } else {
      if (typeof this.switchLevel === 'function') {
        this.switchLevel('lobby_tutorial', this.mode === 'host');
      }
    }

    return true;
  },

  resetInventory({ keepGems = false, keepRelics = false, keepPotions = false, keepKeys = false, keepChests = true } = {}) {
    this.inventory = {
      keys: keepKeys ? [...(this.inventory?.keys || [])] : [],
      gems: keepGems ? (this.inventory?.gems || 0) : 0,
      relics: keepRelics ? [...(this.inventory?.relics || [])] : [],
      potions: keepPotions ? [...(this.inventory?.potions || [])] : [],
    };
    if (!keepChests) {
      this.openedChestKeys?.clear();
    }
    this.ui.updateInventory(this.inventory);
  },
};
