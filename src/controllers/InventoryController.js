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
    const n = parseInt(amount, 10);
    if (!isNaN(n) && n > 0) {
      this.inventory.gems = (this.inventory.gems || 0) + n;
      this.ui.updateInventory(this.inventory);
    }
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
    const potionObj = createInventoryItem(potion, { type: 'potion' });
    if (!this.inventory.potions) this.inventory.potions = [];
    this.inventory.potions.push(potionObj);
    this.ui.updateInventory(this.inventory);
  },

  usePotion(potion = null, idx = -1) {
    if (!this.inventory?.potions || this.inventory.potions.length === 0) {
      this.ui.showNarrativeMessage('No tienes ninguna poción en tu inventario.', 2500);
      return false;
    }

    const local = this.playerManager?.localPlayer;
    if (!local) return false;

    // Si ya tiene todas las vidas, no desperdiciar la poción
    if (local.lives >= (local.maxLives ?? 3)) {
      this.soundManager.playClick?.();
      this.ui.showNarrativeMessage(':heart: ¡Tu salud ya está al máximo (3/3 corazones)!', 3000);
      return false;
    }

    // Retirar 1 poción del inventario
    let potionObj = null;
    if (idx >= 0 && idx < this.inventory.potions.length) {
      potionObj = this.inventory.potions.splice(idx, 1)[0];
    } else {
      const pIdx = potion ? this.inventory.potions.findIndex(p => (p.id || p.name) === (potion.id || potion.name)) : -1;
      potionObj = pIdx >= 0 ? this.inventory.potions.splice(pIdx, 1)[0] : this.inventory.potions.pop();
    }

    const healAmount = potionObj?.healAmount || 1;
    const healResult = local.recoverHeart(healAmount);

    // Audio y retroalimentación en HUD
    this.soundManager.playPotion?.();
    this.ui.updateLives(local.lives, local.maxLives ?? 3);
    this.ui.showNarrativeMessage(`:potion: ¡Has bebido ${potionObj?.name || 'la Poción de Vida'}! +${healResult.recovered} :heart: corazón restaurado.`, 3500);

    this.ui.updateInventory(this.inventory);
    if (this.ui.isInventoryOpen) {
      this.ui.renderInventoryModalContent();
    }

    // Sincronización multijugador autoritativa: notificar al host si somos cliente
    if (this.mode === 'client') {
      this.network.sendToHost(Proto.serializePotionUse(local.id, healAmount));
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
