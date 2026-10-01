import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { floorVariant } from '../src/levels/LevelLoader.js';
import { BLOCK_TYPES } from '../src/config/constants.js';
import { VoxelMap } from '../src/render/VoxelMap.js';

test('floorVariant es determinista y solo da tipos de suelo', () => {
  const a = floorVariant(7, 19);
  assert.equal(floorVariant(7, 19), a);
  assert.ok([BLOCK_TYPES.FLOOR_STONE, BLOCK_TYPES.FLOOR_WORN, BLOCK_TYPES.FLOOR_MOSS].includes(a));
  const seen = new Set();
  for (let x = 0; x < 24; x++) {
    for (let z = 0; z < 36; z++) seen.add(floorVariant(x, z));
  }
  assert.ok(seen.size >= 2, 'sin variación de suelo');
});

test('divider sella bajo el umbral hasta MIN_Y', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  assert.equal(world.get(5, -1, 11), BLOCK_TYPES.WALL);
  assert.equal(world.get(5, -8, 11), BLOCK_TYPES.WALL);
});

test('perímetro baja hasta MIN_Y', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  assert.equal(world.get(0, -8, 10), BLOCK_TYPES.WALL);
});

test('escalinata explícita respeta openFromStart', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('lobby_tutorial'));
  assert.equal(world.stairwells[0].open, false);
  assert.equal(world.stairsOpen, false);
});

test('LevelLoader instala losas de respawn rúnicas (RESPAWN_PAD) bajo el spawn principal', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('lobby_tutorial'));
  // El spawn en lobby_tutorial está a un bloque de la pared: x=12.0, z=2.5 -> bloque y=0, x en [11, 12], z en [2, 3]
  assert.equal(world.get(11, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(11, 0, 3), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 3), BLOCK_TYPES.RESPAWN_PAD);
  // El bloque z=1 es el bloque de separación respecto a la pared trasera z=0
  assert.notEqual(world.get(11, 0, 1), BLOCK_TYPES.RESPAWN_PAD);
  assert.notEqual(world.get(12, 0, 1), BLOCK_TYPES.RESPAWN_PAD);
});

test('LevelLoader instala una única losa de respawn rúnica por mazmorra en la entrada', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  // Spawn único principal en la entrada a 1 bloque de la pared (2x2)
  assert.equal(world.get(11, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(11, 0, 3), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 3), BLOCK_TYPES.RESPAWN_PAD);

  // Las salas intermedias y checkpoints NO tienen losa de respawn
  assert.notEqual(world.get(11, 0, 12), BLOCK_TYPES.RESPAWN_PAD);
  assert.notEqual(world.get(12, 0, 12), BLOCK_TYPES.RESPAWN_PAD);

  // Conteo exhaustivo: exactamente 4 bloques de RESPAWN_PAD en todo el mapa
  let padCount = 0;
  for (let i = 0; i < world.blocks.length; i++) {
    if (world.blocks[i] === BLOCK_TYPES.RESPAWN_PAD) padCount++;
  }
  assert.equal(padCount, 4, 'Solo debe existir una única plataforma de respawn (4 bloques) por mazmorra');
});

test('VoxelMap asigna el Tile 11 al bloque RESPAWN_PAD', () => {
  assert.equal(VoxelMap.selectTile(11, 0, 4, BLOCK_TYPES.RESPAWN_PAD), 11);
});

test('VoxelMap distribuye deterministamente las 5 variantes de sprites para el bloque LAVA', () => {
  const validTiles = new Set([13, 16, 17, 18, 19]);
  const seen = new Set();
  for (let x = 0; x < 24; x++) {
    for (let z = 0; z < 36; z++) {
      const tile = VoxelMap.selectTile(x, -1, z, BLOCK_TYPES.LAVA);
      assert.ok(validTiles.has(tile), `Tile ${tile} debe ser una de las variantes válidas de lava`);
      seen.add(tile);
    }
  }
  assert.equal(seen.size, 5, 'Debe generar las 5 variantes distintas de lava');
});

test('VoxelMap.getTileUVOffset calcula coordenadas UV exactas para la cuadrícula 4x8', () => {
  assert.deepEqual(VoxelMap.getTileUVOffset(0), { u: 0.0, v: 0.875 });
  assert.deepEqual(VoxelMap.getTileUVOffset(13), { u: 0.25, v: 0.5 });
  assert.deepEqual(VoxelMap.getTileUVOffset(16), { u: 0.0, v: 0.375 });
  assert.deepEqual(VoxelMap.getTileUVOffset(19), { u: 0.75, v: 0.375 });
});

test('abyss_throne Sala 1 contiene el cofre con la poción de vida para recuperar 1 corazón', () => {
  const world = new World();
  const abyssData = world.levelRegistry.getLevel('abyss_throne');
  assert.ok(abyssData, 'El nivel abyss_throne debe existir');
  const chest1 = abyssData.chests?.find(c => c.id === 1);
  assert.ok(chest1, 'El cofre 1 debe existir en abyss_throne');
  assert.ok(chest1.potion, 'El cofre 1 debe otorgar una poción');
  assert.equal(chest1.potion.id, 'pocion_vida');
  assert.equal(chest1.potion.healAmount, 1);
  assert.ok(chest1.reward.includes('Poción de Vida'));
  assert.ok(chest1.message.includes('+1 ❤️'));
});

test('dev_showroom está registrado pero aislado de la campaña regular', () => {
  const world = new World();
  const registry = world.levelRegistry;

  // Existe en el registry
  const devLvl = registry.getLevel('dev_showroom');
  assert.ok(devLvl, 'dev_showroom debe estar registrado');
  assert.equal(devLvl.id, 'dev_showroom');
  assert.equal(devLvl.isDevOnly, true);
  assert.equal(devLvl.hiddenFromCampaign, true);

  // La campaña regular (getAllLevels(false)) debe excluir dev_showroom
  const regularLevels = registry.getAllLevels(false);
  assert.equal(regularLevels.some(l => l.id === 'dev_showroom'), false, 'dev_showroom no debe aparecer en la campaña');
  assert.deepEqual(regularLevels.map(l => l.id), ['lobby_tutorial', 'dungeon_classic', 'crypt_inferno', 'abyss_throne']);

  // getAllLevels(true) debe incluir dev_showroom
  const allLevelsWithDev = registry.getAllLevels(true);
  assert.equal(allLevelsWithDev.some(l => l.id === 'dev_showroom'), true);

  // Mecánicas de llaves y puertas en el showroom
  const chest1 = devLvl.chests?.find(c => c.id === 1);
  assert.ok(chest1, 'Cofre 1 debe existir en dev_showroom');
  assert.equal(chest1.givesKey, 'llave_showroom');

  const door2 = devLvl.doors?.find(d => d.id === 2);
  assert.ok(door2, 'Puerta 2 debe existir en dev_showroom');
  assert.equal(door2.requiresKey, 'llave_showroom');

  // Cofre 2 (gemas) y Cofre 3 (poción)
  const chest2 = devLvl.chests?.find(c => c.id === 2);
  assert.equal(chest2.gems, 250);
  const chest3 = devLvl.chests?.find(c => c.id === 3);
  assert.equal(chest3.potion?.id, 'pocion_vida');

  // Puede cargarse en World sin errores
  assert.doesNotThrow(() => {
    world.loadLevel(devLvl);
  });
  assert.equal(world.doors.length, 2);
  assert.equal(world.chests.length, 3);
  assert.equal(world.objectives.length, 1);
  assert.equal(world.stairwells.length, 1);

  let jumpPadCount = 0;
  for (let i = 0; i < world.blocks.length; i++) {
    if (world.blocks[i] === BLOCK_TYPES.JUMP_PAD) jumpPadCount++;
  }
  assert.ok(jumpPadCount > 0, 'Debe registrar bloques JUMP_PAD');
});

test('dev_showroom el punto de spawn no contiene bloques sólidos en el cuerpo del jugador', () => {
  const world = new World();
  const devLvl = world.levelRegistry.getLevel('dev_showroom');
  world.loadLevel(devLvl);

  const sp = devLvl.spawn;
  const sx = Math.floor(sp.x);
  const sz = Math.floor(sp.z);
  // En las capas y=1 e y=2 (altura del jugador) en torno al spawn, debe ser aire (0)
  for (let x = sx - 1; x <= sx + 1; x++) {
    for (let z = sz - 1; z <= sz + 1; z++) {
      assert.equal(world.get(x, 1, z), 0, `Bloque en x=${x}, y=1, z=${z} obstruye el spawn`);
      assert.equal(world.get(x, 2, z), 0, `Bloque en x=${x}, y=2, z=${z} obstruye el spawn`);
    }
  }

  // La losa bajo los pies del spawn (y=0) debe ser la losa rúnica RESPAWN_PAD
  assert.equal(world.get(11, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(11, 0, 3), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 3), BLOCK_TYPES.RESPAWN_PAD);
});

