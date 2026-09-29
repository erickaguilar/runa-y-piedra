import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { BLOCK_TYPES } from '../src/config/constants.js';

function countType(world, type) {
  let n = 0;
  for (let x = 0; x < 24; x++) {
    for (let y = world.minY; y < 16; y++) {
      for (let z = 0; z < 36; z++) {
        if (world.get(x, y, z) === type) n++;
      }
    }
  }
  return n;
}

test('el mundo arranca en el lobby con escalinata cerrada', () => {
  const world = new World();
  assert.equal(world.levelRegistry.getCurrentLevel().id, 'lobby_tutorial');
  assert.equal(world.stairwells.length, 1);
  assert.equal(world.stairsOpen, false);
  assert.equal(world.objectives.length, 0);
});

test('dungeon_classic tiene fosa de lava bajo el abismo', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  const lava = countType(world, BLOCK_TYPES.LAVA);
  assert.ok(lava > 150, `lava esperada >150, hay ${lava}`);
  // La lava está hundida en y=-1
  assert.equal(world.get(5, -1, 15), BLOCK_TYPES.LAVA);
  // y=-9 está fuera de rango (AIRE)
  assert.equal(world.get(5, -9, 15), BLOCK_TYPES.AIR);
});

test('abyss_throne no tiene escalinata (solo altar final)', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('abyss_throne'));
  assert.equal(world.stairwells.length, 0);
  assert.equal(world.objectives.length, 1);
});

test('puerta 2 exige llave y cofre 1 la otorga (los 3 niveles con puerta 2)', () => {
  const world = new World();
  for (const id of ['dungeon_classic', 'crypt_inferno', 'abyss_throne']) {
    world.loadLevel(world.levelRegistry.getLevel(id));
    const door2 = world.doors.find(d => d.id === 2);
    const chest1 = world.chests.find(c => c.id === 1);
    assert.equal(door2.requiresKey, chest1.givesKey, `llave inconsistente en ${id}`);
    assert.ok(chest1.givesKey);
  }
});

test('lobby: puerta con llave y escalinata del tutorial', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('lobby_tutorial'));
  const door = world.doors.find(d => d.id === 1);
  assert.ok(door.requiresKey);
  const chest = world.chests.find(c => c.id === 1);
  assert.equal(chest.givesKey, door.requiresKey);
  assert.deepEqual(
    [world.stairwells[0].x1, world.stairwells[0].x2, world.stairwells[0].z1, world.stairwells[0].z2],
    [11, 12, 31, 33]
  );
});
