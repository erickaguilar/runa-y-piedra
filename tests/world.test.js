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

test('dungeon_classic: Sala 2 expande la zona segura un bloque y separa plataformas en 2 bloques de lava', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));

  // Zona segura de entrada expandida hasta z=13 (1 bloque más hacia el sur)
  assert.notEqual(world.get(11, 0, 13), 0, 'Suelo seguro en z=13 (expandido 1 bloque)');
  assert.notEqual(world.get(12, 0, 13), 0, 'Suelo seguro en z=13 (expandido 1 bloque)');

  // 2 bloques de lava entre zona segura y Plataforma 1 (z=14, 15)
  assert.equal(world.get(11, 0, 14), BLOCK_TYPES.AIR, 'z=14 debe ser aire sobre lava');
  assert.equal(world.get(11, 0, 15), BLOCK_TYPES.AIR, 'z=15 debe ser aire sobre lava');
  assert.equal(world.get(11, -1, 14), BLOCK_TYPES.LAVA, 'z=14 debe ser lava');
  assert.equal(world.get(11, -1, 15), BLOCK_TYPES.LAVA, 'z=15 debe ser lava');

  // Plataforma 1 en z=16
  assert.equal(world.get(11, 0, 16), BLOCK_TYPES.JUMP_PAD, 'Plataforma 1 es JUMP_PAD en z=16');

  // 2 bloques de lava entre Plataforma 1 y Plataforma 2 (z=17, 18)
  assert.equal(world.get(11, 0, 17), BLOCK_TYPES.AIR);
  assert.equal(world.get(11, 0, 18), BLOCK_TYPES.AIR);

  // Plataforma 2 en z=19
  assert.equal(world.get(11, 0, 19), BLOCK_TYPES.JUMP_PAD, 'Plataforma 2 es JUMP_PAD en z=19');

  // 2 bloques de lava entre Plataforma 2 y Plataforma 3 (z=20, 21)
  assert.equal(world.get(11, 0, 20), BLOCK_TYPES.AIR);
  assert.equal(world.get(11, 0, 21), BLOCK_TYPES.AIR);

  // Plataforma 3 en z=22 (elevada y=1 con pilar y=0)
  assert.equal(world.get(11, 1, 22), BLOCK_TYPES.JUMP_PAD, 'Plataforma 3 es JUMP_PAD en y=1, z=22');
  assert.equal(world.get(11, 0, 22), BLOCK_TYPES.PILLAR, 'Soporte pilar bajo Plataforma 3');

  // 2 bloques de lava entre Plataforma 3 y Plataforma 4 (z=23, 24)
  assert.equal(world.get(11, 0, 23), BLOCK_TYPES.AIR);
  assert.equal(world.get(11, 0, 24), BLOCK_TYPES.AIR);

  // Plataforma 4 en z=25 (elevada y=1 con pilar y=0)
  assert.equal(world.get(11, 1, 25), BLOCK_TYPES.JUMP_PAD, 'Plataforma 4 es JUMP_PAD en y=1, z=25');
  assert.equal(world.get(11, 0, 25), BLOCK_TYPES.PILLAR, 'Soporte pilar bajo Plataforma 4');

  // 2 bloques de lava entre Plataforma 4 y Zona segura de llegada (z=26, 27)
  assert.equal(world.get(11, 0, 26), BLOCK_TYPES.AIR);
  assert.equal(world.get(11, 0, 27), BLOCK_TYPES.AIR);

  // Zona segura de llegada en z=28..30
  assert.notEqual(world.get(11, 0, 28), 0, 'Suelo seguro de llegada en z=28');
  assert.notEqual(world.get(11, 0, 29), 0, 'Suelo seguro de llegada en z=29');
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
    [11, 12, 59, 61]
  );
});
