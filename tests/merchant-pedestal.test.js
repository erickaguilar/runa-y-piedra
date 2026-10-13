import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { BlockRaycaster } from '../src/interaction/BlockRaycaster.js';
import { InteractionController } from '../src/controllers/InteractionController.js';
import { InventoryMixin } from '../src/controllers/InventoryController.js';
import { SHOP_CATALOG, getSellPrice, setShopItemPrice } from '../src/ui/modals/ShopModal.js';
import { ITEM_LIBRARY, getItemDefinition, getItemsByType } from '../src/inventory/ItemRegistry.js';

test('Lobby - lobby_tutorial registra el pedestal del mercader en monoliths', () => {
  const world = new World();
  const lobby = world.levelRegistry.getLevel('lobby_tutorial');
  world.loadLevel(lobby);

  assert.ok(world.monoliths.length >= 2, 'Debe haber al menos 2 monolitos en el lobby');
  const merchant = world.monoliths.find(m => m.id === 'merchant_pedestal' || m.type === 'merchant');
  assert.ok(merchant, 'El pedestal del mercader debe estar presente en el lobby');
  assert.equal(merchant.type, 'merchant');
  assert.equal(merchant.x, 6.5);
  assert.equal(merchant.y, 1.0);
  assert.equal(merchant.z, 13.5);
});

test('Lobby - BlockRaycaster detecta proximidad con el Pedestal del Mercader', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('lobby_tutorial'));

  const raycaster = new BlockRaycaster(null, { mesh: null, instToBlock: [] }, world);
  // Jugador situado frente al pedestal (x=6.5, z=13.0)
  const target = raycaster.getProximityTarget({ x: 6.5, y: 1.0, z: 13.0 });

  assert.ok(target, 'Debe detectar proximidad con el pedestal del mercader');
  assert.equal(target.type, 'merchant');
  assert.equal(target.monolithId, 'merchant_pedestal');
  assert.match(target.message, /Mercader|Bazar/i);
});

test('Lobby - InteractionController abre el modal de la tienda al interactuar con el pedestal del mercader', () => {
  let shopModalOpened = false;
  let clickPlayed = false;

  const fakeGame = {
    world: new World(),
    mode: 'host',
    soundManager: {
      playClick: () => { clickPlayed = true; },
    },
    ui: {
      openShopModal: () => { shopModalOpened = true; },
    },
  };

  const ic = new InteractionController(fakeGame);
  const handled = ic.executeInteraction({ type: 'merchant', monolithId: 'merchant_pedestal' });

  assert.equal(handled, true);
  assert.equal(shopModalOpened, true, 'Debe haber llamado a openShopModal');
  assert.equal(clickPlayed, true, 'Debe reproducir feedback de clic');
});

test('Economía del Bazar - Comprar objetos descuenta gemas y añade al inventario', () => {
  const host = {
    inventory: { keys: [], gems: 300, relics: [], potions: [] },
    ui: {
      updateInventory: (inv) => { host.inventory = inv; },
      showNarrativeMessage: () => {},
    },
    soundManager: {
      playPotion: () => {},
      playLocked: () => {},
      playChestOpen: () => {},
    },
    ...InventoryMixin,
  };

  const potionItem = SHOP_CATALOG.find(i => i.id === 'pocion_vida');
  assert.ok(potionItem);

  // Compra exitosa con saldo suficiente
  const ok = host.buyShopItem(potionItem, potionItem.price);
  assert.equal(ok, true);
  assert.equal(host.inventory.gems, 250, '300 - 50 = 250 gemas restantes');
  assert.equal(host.inventory.potions.length, 1, 'Debe haber recibido 1 poción');

  // Compra rechazada por gemas insuficientes
  const jadeItem = SHOP_CATALOG.find(i => i.id === 'amuleto_jade');
  assert.ok(jadeItem);
  assert.equal(jadeItem.price, 350);

  const failBuy = host.buyShopItem(jadeItem, jadeItem.price);
  assert.equal(failBuy, false);
  assert.equal(host.inventory.gems, 250, 'El saldo no debe cambiar si la compra falla');
  assert.equal(host.inventory.relics.length, 0, 'No debe recibir el objeto si falla');
});

test('Economía del Bazar - Vender objetos del inventario otorga gemas y retira el ítem', () => {
  const host = {
    inventory: {
      keys: [{ id: 'llave_extra', name: 'Llave Extra', type: 'key' }],
      gems: 50,
      relics: [{ id: 'caliz_sagrado', name: 'Cáliz Sagrado', type: 'relic' }],
      potions: [{ id: 'pocion_vida', name: 'Poción de Vida', type: 'potion' }],
    },
    ui: {
      updateInventory: (inv) => { host.inventory = inv; },
      showNarrativeMessage: () => {},
    },
    soundManager: {
      playPotion: () => {},
      playLocked: () => {},
      playChestOpen: () => {},
    },
    ...InventoryMixin,
  };

  // Vender la reliquia
  const relicPrice = getSellPrice({ id: 'caliz_sagrado', type: 'relic' });
  assert.equal(relicPrice, 250);

  const sellRelicOk = host.sellShopItem('relic', 'caliz_sagrado', relicPrice);
  assert.equal(sellRelicOk, true);
  assert.equal(host.inventory.gems, 300, '50 + 250 = 300 gemas');
  assert.equal(host.inventory.relics.length, 0, 'La reliquia vendida debe removerse del inventario');

  // Intentar vender de nuevo un ítem que ya no se tiene
  const failSell = host.sellShopItem('relic', 'caliz_sagrado', relicPrice);
  assert.equal(failSell, false);
  assert.equal(host.inventory.gems, 300, 'Saldo no debe cambiar si venta falla');

  // Vender poción
  const potionPrice = getSellPrice({ id: 'pocion_vida', type: 'potion' });
  assert.equal(potionPrice, 25);

  const sellPotionOk = host.sellShopItem('potion', 'pocion_vida', potionPrice);
  assert.equal(sellPotionOk, true);
  assert.equal(host.inventory.gems, 325, '300 + 25 = 325 gemas');
  assert.equal(host.inventory.potions.length, 0);

  // Intentar vender una llave debe ser rechazado
  const sellKeyOk = host.sellShopItem('key', 'llave_extra', 60);
  assert.equal(sellKeyOk, false, 'Vender llaves debe estar prohibido');
  assert.equal(host.inventory.gems, 325, 'El saldo en gemas no debe cambiar');
  assert.equal(host.inventory.keys.length, 1, 'La llave no debe removerse');
});

test('Economía del Bazar - SHOP_CATALOG no incluye llaves y prohíbe su compra', () => {
  const host = {
    inventory: { keys: [], gems: 500, relics: [], potions: [] },
    ui: {
      updateInventory: (inv) => { host.inventory = inv; },
      showNarrativeMessage: () => {},
    },
    soundManager: {
      playPotion: () => {},
      playLocked: () => {},
      playChestOpen: () => {},
    },
    ...InventoryMixin,
  };

  // 1. El catálogo de compra no contiene ningún ítem de tipo 'key'
  const keyInCatalog = SHOP_CATALOG.some(item => item.type === 'key' || item.id.includes('llave'));
  assert.equal(keyInCatalog, false, 'SHOP_CATALOG no debe ofrecer llaves');

  // 2. Intentar comprar una llave debe ser denegado por el controlador
  const fakeKeyItem = { id: 'llave_secreta', type: 'key', name: 'Llave Secreta', price: 100 };
  const buyKeyOk = host.buyShopItem(fakeKeyItem, fakeKeyItem.price);
  assert.equal(buyKeyOk, false, 'Comprar llaves debe estar prohibido');
  assert.equal(host.inventory.gems, 500, 'Las gemas no deben descontarse');
  assert.equal(host.inventory.keys.length, 0, 'No se deben otorgar llaves compradas');

  // 3. getSellPrice para llaves retorna 0
  assert.equal(getSellPrice({ type: 'key' }), 0, 'El valor de venta de llaves debe ser 0');
});

test('Economía del Bazar - Permite cambiar dinámicamente el precio de compra de vidas y suministros', () => {
  const potion = SHOP_CATALOG.find(i => i.id === 'pocion_vida');
  assert.ok(potion);
  const originalPrice = potion.price;

  // Cambiar precio a 40 gemas
  const updated = setShopItemPrice('pocion_vida', 40);
  assert.equal(updated, true);
  assert.equal(potion.price, 40);

  // Restaurar precio original
  setShopItemPrice('pocion_vida', originalPrice);
  assert.equal(potion.price, originalPrice);

  // Cambiar precio de elixir mayor
  const elixir = SHOP_CATALOG.find(i => i.id === 'pocion_mayor');
  assert.ok(elixir);
  const origElixir = elixir.price;
  setShopItemPrice('pocion_mayor', 80);
  assert.equal(elixir.price, 80);
  setShopItemPrice('pocion_mayor', origElixir);

  // Intentar cambiar precio con valor inválido debe fallar
  const invalidUpdate = setShopItemPrice('pocion_vida', -10);
  assert.equal(invalidUpdate, false);
});

test('Economía del Bazar - Comprar y vender Pergamino de Retorno al Lobby', () => {
  const scrollItem = SHOP_CATALOG.find(i => i.id === 'pergamino_retorno');
  assert.ok(scrollItem, 'SHOP_CATALOG debe incluir el Pergamino de Retorno');
  assert.equal(scrollItem.type, 'scroll');
  assert.equal(scrollItem.price, 120);

  const host = {
    inventory: { keys: [], gems: 200, relics: [], potions: [] },
    ui: {
      updateInventory: (inv) => { host.inventory = inv; },
      showNarrativeMessage: () => {},
    },
    soundManager: {
      playPotion: () => {},
      playLocked: () => {},
      playChestOpen: () => {},
    },
    ...InventoryMixin,
  };

  // 1. Compra de Pergamino de Retorno
  const buyOk = host.buyShopItem(scrollItem, scrollItem.price);
  assert.equal(buyOk, true);
  assert.equal(host.inventory.gems, 80, '200 - 120 = 80 gemas');
  assert.equal(host.inventory.potions.length, 1);
  assert.equal(host.inventory.potions[0].id, 'pergamino_retorno');

  // 2. Venta de Pergamino de Retorno
  const sellPrice = getSellPrice({ id: 'pergamino_retorno', type: 'scroll' });
  assert.equal(sellPrice, 60, 'El valor de venta debe ser 60 gemas');

  const sellOk = host.sellShopItem('scroll', 'pergamino_retorno', sellPrice);
  assert.equal(sellOk, true);
  assert.equal(host.inventory.gems, 140, '80 + 60 = 140 gemas');
  assert.equal(host.inventory.potions.length, 0);
});

test('Pergamino de Retorno - Uso en mazmorra teletransporta al Lobby y se consume', () => {
  let switchedToLevel = null;
  let broadcastValue = null;
  let narrativeMsg = null;

  const game = {
    mode: 'host',
    world: {
      levelRegistry: { currentLevelId: 'dungeon_classic' },
    },
    inventory: {
      keys: [],
      gems: 50,
      relics: [],
      potions: [{ id: 'pergamino_retorno', name: 'Pergamino de Retorno', type: 'scroll' }],
    },
    ui: {
      updateInventory: (inv) => { game.inventory = inv; },
      showNarrativeMessage: (msg) => { narrativeMsg = msg; },
      closeInventoryModal: () => {},
    },
    soundManager: {
      playLevelComplete: () => {},
      playChestOpen: () => {},
      playClick: () => {},
    },
    switchLevel: (lvlId, broadcast) => {
      switchedToLevel = lvlId;
      broadcastValue = broadcast;
    },
    ...InventoryMixin,
  };

  // Usar pergamino mediante usePotion (que delega a useTeleportScroll)
  const used = game.usePotion();
  assert.equal(used, true, 'Debe consumir el pergamino exitosamente');
  assert.equal(switchedToLevel, 'lobby_tutorial', 'Debe cambiar de nivel al Lobby');
  assert.equal(broadcastValue, true, 'En modo host debe transmitir a los clientes');
  assert.equal(game.inventory.potions.length, 0, 'El pergamino debe retirarse del inventario');
  assert.match(narrativeMsg, /Campamento Central/);
});

test('Pergamino de Retorno - Uso dentro del Lobby advierte y NO consume el objeto', () => {
  let switchedToLevel = null;
  let clickSoundPlayed = false;
  let narrativeMsg = null;

  const game = {
    mode: 'host',
    world: {
      levelRegistry: { currentLevelId: 'lobby_tutorial' },
    },
    inventory: {
      keys: [],
      gems: 50,
      relics: [],
      potions: [{ id: 'pergamino_retorno', name: 'Pergamino de Retorno', type: 'scroll' }],
    },
    ui: {
      updateInventory: (inv) => { game.inventory = inv; },
      showNarrativeMessage: (msg) => { narrativeMsg = msg; },
    },
    soundManager: {
      playClick: () => { clickSoundPlayed = true; },
      playLevelComplete: () => {},
    },
    switchLevel: (lvlId) => {
      switchedToLevel = lvlId;
    },
    ...InventoryMixin,
  };

  // Intentar usar pergamino estando ya en el lobby
  const used = game.usePotion();
  assert.equal(used, false, 'No debe permitir su uso si ya está en el lobby');
  assert.equal(switchedToLevel, null, 'No debe ejecutar switchLevel');
  assert.equal(game.inventory.potions.length, 1, 'El pergamino debe conservarse intacto');
  assert.equal(clickSoundPlayed, true);
  assert.match(narrativeMsg, /Ya te encuentras en el Campamento Central/);
});

test('Catálogo de Objetos - Unificación del Pergamino de Retorno y Panteón de 10 Reliquias', () => {
  // 1. Unificación de objeto de retorno a uno solo
  assert.ok(ITEM_LIBRARY.pergamino_retorno, 'Pergamino de retorno debe existir en ITEM_LIBRARY');
  assert.equal(ITEM_LIBRARY.runa_retorno, undefined, 'Runa de retorno no debe ser un ítem separado');
  // Compatibilidad: getItemDefinition('runa_retorno') resuelve hacia pergamino_retorno
  const resolved = getItemDefinition('runa_retorno');
  assert.ok(resolved);
  assert.equal(resolved.id, 'pergamino_retorno');

  // 2. Exactamente 10 reliquias míticas registradas
  const allRelics = getItemsByType('relic');
  assert.equal(allRelics.length, 10, 'Debe haber exactamente 10 reliquias míticas en total');

  // 3. Exactamente 6 activas/obtenibles y 4 selladas/no generables
  const obtainableRelics = allRelics.filter(r => r.obtainable === true);
  const sealedRelics = allRelics.filter(r => r.obtainable === false);
  assert.equal(obtainableRelics.length, 6, 'Debe haber 6 reliquias obtenibles en mazmorras/bazar');
  assert.equal(sealedRelics.length, 4, 'Debe haber exactamente 4 reliquias selladas (no generables)');

  const sealedIds = sealedRelics.map(r => r.id);
  assert.ok(sealedIds.includes('orbe_tempestad'));
  assert.ok(sealedIds.includes('lagrima_hielo'));
  assert.ok(sealedIds.includes('reloj_arenas_tiempo'));
  assert.ok(sealedIds.includes('tomo_astral'));

  // 4. Cada una de las 10 reliquias tiene valor de venta positivo en el Bazar
  for (const relic of allRelics) {
    const sellPrice = getSellPrice(relic);
    assert.ok(sellPrice >= 200, `El precio de venta de ${relic.id} debe ser >= 200 gemas`);
  }
});
