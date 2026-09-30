import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { InteractionController } from '../src/controllers/InteractionController.js';

describe('Inventario y botín de cofres', () => {
  it('collectChestLoot extrae llaves, gemas y reliquias míticas', () => {
    const inventory = { keys: [], gems: 0, relics: [] };
    const openedChestKeys = new Set();
    const uiUpdates = [];

    const mockGame = {
      world: {
        levelRegistry: {
          getCurrentLevel: () => ({ id: 'dungeon_classic' }),
        },
      },
      inventory,
      openedChestKeys,
      addInventoryKey(key) {
        inventory.keys.push(key);
      },
      addInventoryGems(amount) {
        inventory.gems += amount;
      },
      addInventoryRelic(relic) {
        inventory.relics.push(relic);
      },
      ui: {
        updateInventory(inv) {
          uiUpdates.push({ ...inv });
        },
      },
    };

    const controller = new InteractionController(mockGame);

    // Cofre 1: Llave + Gemas
    const chest1 = {
      id: 1,
      name: 'Cofre Antiguo',
      givesKey: 'llave_santuario',
      keyName: 'Llave del Santuario',
      message: '📦 ¡Has abierto el cofre! Recompensa: 🗝️ Llave del Santuario y 💎 100 Gemas.',
    };

    controller.collectChestLoot(chest1);

    assert.equal(inventory.keys.length, 1);
    assert.equal(inventory.keys[0].name, 'Llave del Santuario');
    assert.equal(inventory.gems, 100);

    // Idempotencia: intentar colectar cofre 1 de nuevo no duplica botín
    controller.collectChestLoot(chest1);
    assert.equal(inventory.keys.length, 1);
    assert.equal(inventory.gems, 100);

    // Cofre 2: Reliquia (Cáliz Sagrado) + 250 Gemas
    const chest2 = {
      id: 2,
      name: 'Cofre Secreto',
      reward: '🏆 Reliquia Dorada',
      message: '📦 ¡Has obtenido: 🏆 Cáliz Sagrado y 💎 250 Gemas Legendarias.',
    };

    controller.collectChestLoot(chest2);

    assert.equal(inventory.gems, 350); // 100 + 250
    assert.equal(inventory.relics.length, 1);
    assert.equal(inventory.relics[0].id, 'caliz_sagrado');
    assert.equal(inventory.relics[0].name, 'Cáliz Sagrado');
  });

  it('reconoce las reliquias Corazón del Volcán y Corona del Vacío', () => {
    const inventory = { keys: [], gems: 0, relics: [] };
    const mockGame = {
      world: {
        levelRegistry: {
          getCurrentLevel: () => ({ id: 'crypt_inferno' }),
        },
      },
      inventory,
      openedChestKeys: new Set(),
      addInventoryKey() {},
      addInventoryGems() {},
      addInventoryRelic(relic) {
        inventory.relics.push(relic);
      },
    };

    const controller = new InteractionController(mockGame);

    controller.collectChestLoot({
      id: 2,
      reward: '🌋 Corazón del Volcán',
      message: 'Obtienes 🌋 Corazón del Volcán',
    });
    assert.equal(inventory.relics[0].id, 'corazon_volcan');

    mockGame.world.levelRegistry.getCurrentLevel = () => ({ id: 'abyss_throne' });
    controller.collectChestLoot({
      id: 2,
      reward: '👑 Corona del Vacío',
      message: 'Obtienes 👑 Corona del Vacío',
    });
    assert.equal(inventory.relics[1].id, 'corona_vacio');
  });
});
