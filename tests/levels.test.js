import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { floorVariant } from '../src/levels/LevelLoader.js';
import { BLOCK_TYPES } from '../src/config/constants.js';

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
