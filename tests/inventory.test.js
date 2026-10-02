import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { InteractionController } from '../src/controllers/InteractionController.js';
import { serializeOpenedChests, deserializeOpenedChests } from '../src/storage/SaveManager.js';

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

  it('extrae la poción de vida al cofre del umbral sin consumirla automáticamente', () => {
    let potionSoundPlayed = false;
    let uiLivesUpdated = null;
    const inventory = { keys: [], gems: 0, relics: [], potions: [] };

    const mockPlayer = {
      id: 0,
      lives: 2,
      maxLives: 3,
      recoverHeart(amount = 1) {
        const old = this.lives;
        this.lives = Math.min(this.maxLives, this.lives + amount);
        return { recovered: this.lives - old, lives: this.lives };
      },
    };

    const mockGame = {
      world: {
        levelRegistry: {
          getCurrentLevel: () => ({ id: 'abyss_throne' }),
        },
      },
      playerManager: {
        localPlayer: mockPlayer,
      },
      inventory,
      openedChestKeys: new Set(),
      addInventoryKey(key) {
        inventory.keys.push(key);
      },
      addInventoryGems(amount) {
        inventory.gems += amount;
      },
      addInventoryPotion(potion) {
        inventory.potions.push(potion);
      },
      soundManager: {
        playPotion() {
          potionSoundPlayed = true;
        },
      },
      ui: {
        updateLives(lives, maxLives) {
          uiLivesUpdated = { lives, maxLives };
        },
        updateInventory() {},
      },
    };

    const controller = new InteractionController(mockGame);

    const chest1Abyss = {
      id: 1,
      name: 'Cofre del Umbral',
      x: 5.5,
      y: 1.0,
      z: 8.5,
      reward: '🗝️ Llave del Santuario, 🧪 Poción de Vida y 💎 Gemas Abisales',
      message: '📦 ¡Has abierto el Cofre del Umbral! Has obtenido: 🗝️ Llave del Santuario, 🧪 Poción de Vida (+1 ❤️) y 💎 200 Gemas Abisales.',
      givesKey: 'llave_santuario',
      potion: {
        id: 'pocion_vida',
        name: 'Poción de Vida',
        healAmount: 1,
      },
    };

    controller.collectChestLoot(chest1Abyss, mockPlayer);

    // Verificaciones:
    // 1. Salud NO consumida automáticamente: el jugador sigue en 2 vidas
    assert.equal(mockPlayer.lives, 2, 'La poción NO debe consumirse de forma automática al abrir el cofre');
    // 2. Poción guardada en el inventario para decisión manual del aventurero
    assert.equal(inventory.potions.length, 1);
    assert.equal(inventory.potions[0].name, 'Poción de Vida');
    // 3. Llave y gemas también extraídas normalmente
    assert.equal(inventory.keys.length, 1);
    assert.equal(inventory.gems, 200);
    // 4. El sonido curativo y la actualización de vidas no deben haberse disparado aún
    assert.equal(potionSoundPlayed, false);
    assert.equal(uiLivesUpdated, null);
  });

  it('permite usar la poción manualmente para recuperar 1 corazón y no la desperdicia si la vida está llena', () => {
    let potionSoundPlayed = false;
    let uiLivesUpdated = null;
    let narrativeMessage = null;
    const inventory = {
      keys: [],
      gems: 0,
      relics: [],
      potions: [{ id: 'pocion_vida', name: 'Poción de Vida', healAmount: 1 }],
    };

    const mockPlayer = {
      id: 0,
      lives: 2,
      maxLives: 3,
      recoverHeart(amount = 1) {
        const old = this.lives;
        this.lives = Math.min(this.maxLives, this.lives + amount);
        return { recovered: this.lives - old, lives: this.lives };
      },
    };

    const mockGame = {
      inventory,
      playerManager: { localPlayer: mockPlayer },
      soundManager: {
        playPotion() { potionSoundPlayed = true; },
        playClick() {},
      },
      ui: {
        updateLives(lives, maxLives) { uiLivesUpdated = { lives, maxLives }; },
        updateInventory() {},
        showNarrativeMessage(msg) { narrativeMessage = msg; },
      },
      usePotion(potion = null, idx = -1) {
        if (!this.inventory?.potions || this.inventory.potions.length === 0) return false;
        const local = this.playerManager?.localPlayer;
        if (!local) return false;
        if (local.lives >= (local.maxLives ?? 3)) {
          this.ui.showNarrativeMessage('❤️ ¡Tu salud ya está al máximo!');
          return false;
        }
        let potionObj = null;
        if (idx >= 0 && idx < this.inventory.potions.length) {
          potionObj = this.inventory.potions.splice(idx, 1)[0];
        } else {
          potionObj = this.inventory.potions.pop();
        }
        const healResult = local.recoverHeart(potionObj?.healAmount || 1);
        this.soundManager.playPotion();
        this.ui.updateLives(local.lives, local.maxLives ?? 3);
        this.ui.showNarrativeMessage(`🧪 ¡Has bebido ${potionObj?.name}!`);
        return true;
      },
    };

    // 1. Uso manual con vidas < maxLives (2 -> 3)
    const used = mockGame.usePotion();
    assert.equal(used, true);
    assert.equal(mockPlayer.lives, 3, 'Debe haber recuperado a 3 vidas');
    assert.equal(inventory.potions.length, 0, 'La poción debe haberse consumido del inventario');
    assert.equal(potionSoundPlayed, true);
    assert.deepEqual(uiLivesUpdated, { lives: 3, maxLives: 3 });

    // 2. Intentar usar de nuevo con vidas llenas (3/3)
    // Agregar otra poción al inventario
    inventory.potions.push({ id: 'pocion_vida_2', name: 'Poción de Vida', healAmount: 1 });
    const usedFull = mockGame.usePotion();
    assert.equal(usedFull, false, 'No debe permitir usar la poción si la vida ya está llena');
    assert.equal(inventory.potions.length, 1, 'No debe descontar la poción del inventario');
    assert.equal(mockPlayer.lives, 3);
    assert.match(narrativeMessage, /máximo/);
  });

  it('openDoor consume la llave del jugador y del inventario al abrir puerta sellada', () => {
    const inventory = {
      keys: [{ id: 'llave_santuario', name: 'Llave del Santuario' }],
      gems: 100,
      relics: [],
    };
    let hasKeyFlag = true;
    let narrativeMsg = '';

    const mockPlayer = {
      id: 0,
      pos: { x: 12, y: 1.2, z: 23 },
      keys: ['llave_santuario'],
      hasKey(id) {
        return this.keys.includes(id);
      },
      removeKey(id) {
        const idx = this.keys.indexOf(id);
        if (idx !== -1) {
          this.keys.splice(idx, 1);
          return true;
        }
        return false;
      },
    };

    const mockGame = {
      mode: 'host',
      world: {
        isDoor1Open: true,
        isDoor2Open: false,
        doors: [
          { id: 1, z: 11, requiresKey: null, openMessage: 'Puerta 1 abierta' },
          { id: 2, z: 24, requiresKey: 'llave_santuario', openMessage: 'Puerta 2 abierta' },
        ],
        openDoor(id) {
          if (id === 2) this.isDoor2Open = true;
        },
      },
      voxelMap: {
        openDoor() {},
      },
      doorRenderer: {
        openDoor() {},
      },
      soundManager: {
        playDoorOpen() {},
      },
      playerManager: {
        localPlayer: mockPlayer,
      },
      inventory,
      removeInventoryKey(keyId) {
        const targetId = typeof keyId === 'object' ? (keyId.id || keyId.name) : keyId;
        const idx = inventory.keys.findIndex(k => (typeof k === 'string' ? k : (k.id || k.name)) === targetId);
        if (idx !== -1) {
          inventory.keys.splice(idx, 1);
          return true;
        }
        return false;
      },
      ui: {
        setHasKey(val) {
          hasKeyFlag = val;
        },
        showNarrativeMessage(msg) {
          narrativeMsg = msg;
        },
      },
      network: {
        broadcast() {},
      },
    };

    const controller = new InteractionController(mockGame);

    assert.equal(mockPlayer.hasKey('llave_santuario'), true);
    assert.equal(inventory.keys.length, 1);

    // Abrir Puerta 2 con la llave
    const res = controller.requestOpenDoor(2, mockPlayer);
    assert.equal(res, true);
    assert.equal(mockGame.world.isDoor2Open, true);

    // La llave fue consumida de la entidad Jugador y del inventario
    assert.equal(mockPlayer.hasKey('llave_santuario'), false);
    assert.equal(mockPlayer.keys.length, 0);
    assert.equal(inventory.keys.length, 0);
    assert.equal(hasKeyFlag, false);
    assert.ok(narrativeMsg.includes('🗝️ ¡Llave consumida!'));
  });

  it('openChest unifica el botín, la llave y el desbloqueo de puertas en una única notificación narrativa', () => {
    const inventory = { keys: [], gems: 0, relics: [] };
    const narrativeMessages = [];
    let hasKeyFlag = false;

    const mockPlayer = {
      id: 0,
      pos: { x: 10, y: 1.2, z: 10 },
      keys: [],
      addKey(id) {
        if (!this.keys.includes(id)) {
          this.keys.push(id);
          return true;
        }
        return false;
      },
      hasKey(id) {
        return this.keys.includes(id);
      },
    };

    const mockGame = {
      mode: 'host',
      world: {
        chests: [
          {
            id: 1,
            name: 'Cofre del Vestíbulo',
            givesKey: 'llave_santuario',
            keyName: 'Llave Antigua del Santuario',
            message: '📦 ¡Has abierto el Cofre del Vestíbulo! Has obtenido: 🗝️ Llave Antigua del Santuario y 💎 100 Gemas.',
            x: 10,
            y: 1,
            z: 10,
          },
        ],
        doors: [
          { id: 2, name: 'Puerta del Santuario', requiresKey: 'llave_santuario' },
        ],
        levelRegistry: {
          getCurrentLevel: () => ({ id: 'dungeon_classic' }),
        },
      },
      chestRenderer: {
        isChestOpen: () => false,
        openChest: () => true,
      },
      soundManager: {
        playChestOpen() {},
        playKeyPickup() {},
      },
      network: {
        broadcast() {},
      },
      playerManager: {
        localPlayer: mockPlayer,
      },
      inventory,
      openedChestKeys: new Set(),
      addInventoryKey(key) {
        const keyId = typeof key === 'string' ? key : (key.id || key.name);
        if (!inventory.keys.some(k => (typeof k === 'string' ? k : (k.id || k.name)) === keyId)) {
          inventory.keys.push(key);
        }
      },
      addInventoryGems(amount) {
        inventory.gems += amount;
      },
      ui: {
        setHasKey(val) {
          hasKeyFlag = val;
        },
        showNarrativeMessage(msg) {
          narrativeMessages.push(msg);
        },
      },
    };

    const controller = new InteractionController(mockGame);

    // Abrir cofre que otorga llave y gemas
    controller.openChest(1, mockPlayer);

    // EXACTAMENTE una única notificación narrativa emitida
    assert.equal(narrativeMessages.length, 1);
    const unifiedMsg = narrativeMessages[0];

    // Contiene el cofre, las recompensas y la puerta desbloqueada
    assert.ok(unifiedMsg.includes('📦 ¡Has abierto el Cofre del Vestíbulo!'));
    assert.ok(unifiedMsg.includes('Llave Antigua del Santuario'));
    assert.ok(unifiedMsg.includes('100 Gemas'));
    assert.ok(unifiedMsg.includes('Ahora puedes abrir: Puerta del Santuario'));

    // Estado del juego actualizado correctamente
    assert.equal(mockPlayer.hasKey('llave_santuario'), true);
    assert.equal(inventory.keys.length, 1);
    assert.equal(inventory.gems, 100);
    assert.equal(hasKeyFlag, true);
  });

  it('openChest rechaza interacción y no entrega botín si el cofre ya fue saqueado', () => {
    const inventory = { keys: [], gems: 0, relics: [], potions: [] };
    const openedChestKeys = new Set(['dungeon_classic_chest_1']);
    const narrativeMessages = [];
    let soundClicks = 0;

    const mockChestRenderer = {
      isOpen: false,
      openChest() {
        this.isOpen = true;
        return true;
      },
      isChestOpen() {
        return this.isOpen;
      },
    };

    const mockGame = {
      world: {
        levelRegistry: {
          getCurrentLevel: () => ({ id: 'dungeon_classic' }),
        },
        chests: [
          { id: 1, name: 'Cofre del Vestíbulo', reward: '100 Gemas' },
        ],
      },
      chestRenderer: mockChestRenderer,
      inventory,
      openedChestKeys,
      soundManager: {
        playClick: () => { soundClicks++; },
        playChestOpen: () => {},
      },
      ui: {
        showNarrativeMessage: (msg) => { narrativeMessages.push(msg); },
      },
      playerManager: {
        localPlayer: { id: 0, pos: { x: 0, y: 0, z: 0 } },
      },
    };

    const controller = new InteractionController(mockGame);

    // Intentar abrir el cofre ya saqueado
    controller.openChest(1);

    // Debe emitir retroalimentación de cofre saqueado
    assert.equal(soundClicks, 1);
    assert.equal(narrativeMessages.length, 1);
    assert.ok(narrativeMessages[0].includes('Este cofre ya ha sido saqueado'));

    // No debe haber modificado el inventario ni la tapa
    assert.equal(inventory.gems, 0);
    assert.equal(mockChestRenderer.isOpen, false);
  });

  it('serializeOpenedChests y deserializeOpenedChests comprimen y escalan eficientemente a 1000 cofres', () => {
    const totalChests = 1000;
    const dungeonsCount = 50;
    const chestsPerDungeon = totalChests / dungeonsCount; // 20 cofres por mazmorra
    const mockOpenedSet = new Set();

    for (let d = 1; d <= dungeonsCount; d++) {
      const dungeonId = `dungeon_chapter_${d}`;
      for (let c = 1; c <= chestsPerDungeon; c++) {
        // Mezclamos formatos: algunos con _chest_ y otros con :
        if (c % 2 === 0) {
          mockOpenedSet.add(`${dungeonId}_chest_${c}`);
        } else {
          mockOpenedSet.add(`${dungeonId}:${c}`);
        }
      }
    }

    assert.equal(mockOpenedSet.size, 1000);

    const startTime = performance.now();
    const serialized = serializeOpenedChests(mockOpenedSet);
    const serializeDuration = performance.now() - startTime;

    // Verificar que se serializó instantáneamente (< 25ms)
    assert.ok(serializeDuration < 25, `Serialización tardó demasiado: ${serializeDuration}ms`);

    // Verificar estructura sparse agrupada por 50 mazmorras
    const levelKeys = Object.keys(serialized);
    assert.equal(levelKeys.length, dungeonsCount);
    for (const lvl of levelKeys) {
      assert.equal(serialized[lvl].length, chestsPerDungeon);
      // Cada lista de cofres está numéricamente ordenada
      for (let i = 0; i < chestsPerDungeon; i++) {
        assert.equal(serialized[lvl][i], i + 1);
      }
    }

    // Comprobar tamaño en JSON: para 1000 cofres debe ser ultra-compacto (< 10 KB)
    const jsonStr = JSON.stringify(serialized);
    const byteSize = new TextEncoder().encode(jsonStr).length;
    assert.ok(byteSize < 10000, `Tamaño excesivo: ${byteSize} bytes`);

    // Deserializar de vuelta y comprobar comprobaciones O(1)
    const startDeserTime = performance.now();
    const restoredSet = deserializeOpenedChests(serialized);
    const deserDuration = performance.now() - startDeserTime;

    assert.ok(deserDuration < 25, `Deserialización tardó demasiado: ${deserDuration}ms`);

    // Comprobar que contiene consultas en ambos formatos
    assert.equal(restoredSet.has('dungeon_chapter_1_chest_1'), true);
    assert.equal(restoredSet.has('dungeon_chapter_1:1'), true);
    assert.equal(restoredSet.has('dungeon_chapter_50_chest_20'), true);
    assert.equal(restoredSet.has('dungeon_chapter_50:20'), true);
    assert.equal(restoredSet.has('dungeon_chapter_1_chest_999'), false);
  });
});

