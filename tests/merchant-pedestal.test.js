import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { BlockRaycaster } from '../src/interaction/BlockRaycaster.js';
import { InteractionController } from '../src/controllers/InteractionController.js';
import { InventoryMixin } from '../src/controllers/InventoryController.js';
import { SHOP_CATALOG, getSellPrice } from '../src/ui/modals/ShopModal.js';

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
  assert.equal(host.inventory.gems, 200, '300 - 100 = 200 gemas restantes');
  assert.equal(host.inventory.potions.length, 1, 'Debe haber recibido 1 poción');

  // Compra rechazada por gemas insuficientes
  const jadeItem = SHOP_CATALOG.find(i => i.id === 'amuleto_jade');
  assert.ok(jadeItem);
  assert.equal(jadeItem.price, 350);

  const failBuy = host.buyShopItem(jadeItem, jadeItem.price);
  assert.equal(failBuy, false);
  assert.equal(host.inventory.gems, 200, 'El saldo no debe cambiar si la compra falla');
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
  assert.equal(potionPrice, 50);

  const sellPotionOk = host.sellShopItem('potion', 'pocion_vida', potionPrice);
  assert.equal(sellPotionOk, true);
  assert.equal(host.inventory.gems, 350, '300 + 50 = 350 gemas');
  assert.equal(host.inventory.potions.length, 0);
});
