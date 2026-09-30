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
  // El spawn en lobby_tutorial está en x=12.0, z=4.5 -> bloque y=0, x en [11, 12], z en [4, 5]
  assert.equal(world.get(11, 0, 4), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 4), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(11, 0, 5), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 5), BLOCK_TYPES.RESPAWN_PAD);
});

test('LevelLoader instala losas de respawn rúnicas en mazmorras clásicas y checkpoints', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  // Spawn principal
  assert.equal(world.get(11, 0, 4), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 4), BLOCK_TYPES.RESPAWN_PAD);
  // Checkpoint de Sala 2 (x=11.5, z=12.0 -> y=0, x in [11, 12], z in [11, 12])
  assert.equal(world.get(11, 0, 12), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 12), BLOCK_TYPES.RESPAWN_PAD);
});

test('VoxelMap asigna el Tile 11 al bloque RESPAWN_PAD', () => {
  assert.equal(VoxelMap.selectTile(11, 0, 4, BLOCK_TYPES.RESPAWN_PAD), 11);
});

