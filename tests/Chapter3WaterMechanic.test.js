import test from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { BLOCK_TYPES, PHYSICS_CONFIG } from '../src/config/constants.js';
import { isSolid, isWaterBlock } from '../src/core/PhysicsAABB.js';
import { SimulationEngine } from '../src/simulation/SimulationEngine.js';
import { ChapterRegistry } from '../src/levels/ChapterRegistry.js';
import { ACTION_FLAGS } from '../src/network/Protocol.js';

test('Constantes de Bloques de Agua y Torrente existen y son coherentes', () => {
  assert.equal(typeof BLOCK_TYPES.WATER, 'number');
  assert.equal(typeof BLOCK_TYPES.WATER_STREAM_NORTH, 'number');
  assert.equal(typeof BLOCK_TYPES.WATER_STREAM_SOUTH, 'number');
  assert.equal(typeof BLOCK_TYPES.WATER_STREAM_EAST, 'number');
  assert.equal(typeof BLOCK_TYPES.WATER_STREAM_WEST, 'number');

  assert.equal(isWaterBlock(BLOCK_TYPES.WATER), true);
  assert.equal(isWaterBlock(BLOCK_TYPES.WATER_STREAM_NORTH), true);
  assert.equal(isWaterBlock(BLOCK_TYPES.WATER_STREAM_SOUTH), true);
  assert.equal(isWaterBlock(BLOCK_TYPES.WATER_STREAM_EAST), true);
  assert.equal(isWaterBlock(BLOCK_TYPES.WATER_STREAM_WEST), true);
  assert.equal(isWaterBlock(BLOCK_TYPES.STONE_FLOOR), false);
  assert.equal(isWaterBlock(BLOCK_TYPES.AIR), false);
});

test('Los bloques de agua no son sólidos (permiten inmersión y desplazamiento)', () => {
  const world = new World();
  world.set(10, 1, 10, BLOCK_TYPES.WATER);
  world.set(11, 1, 10, BLOCK_TYPES.WATER_STREAM_SOUTH);
  world.set(12, 1, 10, BLOCK_TYPES.WALL);

  assert.equal(isSolid(world, 10, 1, 10), false, 'WATER no debe ser sólido');
  assert.equal(isSolid(world, 11, 1, 10), false, 'WATER_STREAM_SOUTH no debe ser sólido');
  assert.equal(isSolid(world, 12, 1, 10), true, 'WALL debe ser sólido');
});

test('SimulationEngine detecta agua y aplica empuje vectorial direccional de torrente', () => {
  const world = new World();
  const sim = new SimulationEngine(world);
  const baseSpeed = PHYSICS_CONFIG.WATER_STREAM_SPEED || 4.2;

  // 1. Torrente Sur (+Z)
  world.set(12, 0, 12, BLOCK_TYPES.WATER_STREAM_SOUTH);
  const p1 = {
    pos: { x: 12.5, y: 1.0, z: 12.5 },
    vel: { x: 0, y: 0, z: 0 },
  };
  const inter1 = sim.getWaterInteraction(p1);
  assert.equal(inter1.inWater, true);
  assert.equal(inter1.streamVx, 0);
  assert.ok(Math.abs(inter1.streamVz - baseSpeed) < 1e-3, 'Debe empujar hacia +Z');

  // 2. Torrente Norte (-Z)
  world.set(12, 0, 12, BLOCK_TYPES.WATER_STREAM_NORTH);
  const inter2 = sim.getWaterInteraction(p1);
  assert.equal(inter2.inWater, true);
  assert.equal(inter2.streamVx, 0);
  assert.ok(Math.abs(inter2.streamVz - (-baseSpeed)) < 1e-3, 'Debe empujar hacia -Z');

  // 3. Torrente Este (+X)
  world.set(12, 0, 12, BLOCK_TYPES.WATER_STREAM_EAST);
  const inter3 = sim.getWaterInteraction(p1);
  assert.equal(inter3.inWater, true);
  assert.ok(Math.abs(inter3.streamVx - baseSpeed) < 1e-3, 'Debe empujar hacia +X');
  assert.equal(inter3.streamVz, 0);

  // 4. Torrente Oeste (-X)
  world.set(12, 0, 12, BLOCK_TYPES.WATER_STREAM_WEST);
  const inter4 = sim.getWaterInteraction(p1);
  assert.equal(inter4.inWater, true);
  assert.ok(Math.abs(inter4.streamVx - (-baseSpeed)) < 1e-3, 'Debe empujar hacia -X');
  assert.equal(inter4.streamVz, 0);
});

test('El torrente acuático arrastra al jugador y el agua amortigua caídas a gran velocidad', () => {
  const world = new World();
  let enteredWater = false;
  const sim = new SimulationEngine(world, {
    onPlayerWaterEnter: () => { enteredWater = true; }
  });

  world.set(12, 1, 15, BLOCK_TYPES.WATER_STREAM_SOUTH);
  world.set(12, 0, 15, BLOCK_TYPES.STONE_FLOOR);

  const player = {
    pos: { x: 12.5, y: 1.5, z: 15.5 },
    visualPos: { x: 12.5, y: 1.5, z: 15.5 },
    vel: { x: 0, y: -25, z: 0 }, // Cayendo a alta velocidad
    yaw: 0,
    inputForward: 0,
    inputRight: 0,
    onGround: false,
    hero: { speedMultiplier: 1.0, jumpMultiplier: 1.0 },
    setCheckpoint: () => {},
    tickInvulnerability: () => {},
  };

  sim.integratePlayer(player, 1 / 30, 0);

  assert.equal(enteredWater, true, 'Debe disparar onPlayerWaterEnter');
  assert.ok(player.vel.z > 0, 'La velocidad Z debe ser positiva arrastrado por el torrente');
  assert.ok(player.vel.y > -25, 'La velocidad vertical debe ser frenada/amortiguada por el agua');
});

test('El jugador puede saltar desde el agua para salir del canal', () => {
  const world = new World();
  const sim = new SimulationEngine(world);

  world.set(12, 1, 15, BLOCK_TYPES.WATER);

  const player = {
    pos: { x: 12.5, y: 1.2, z: 15.5 },
    visualPos: { x: 12.5, y: 1.2, z: 15.5 },
    vel: { x: 0, y: 0, z: 0 },
    yaw: 0,
    inputForward: 0,
    inputRight: 0,
    onGround: false, // Flotando en el agua sin tocar suelo firme
    hero: { speedMultiplier: 1.0, jumpMultiplier: 1.0 },
    setCheckpoint: () => {},
    tickInvulnerability: () => {},
  };

  sim.integratePlayer(player, 1 / 30, ACTION_FLAGS.JUMP);

  assert.ok(player.vel.y > 0, 'Debe impulsarse hacia arriba con un salto desde el agua');
});

test('El personaje se mantiene sobre el canal de agua y no cae al vacío al pisar un bloque de agua', () => {
  const world = new World();
  const sim = new SimulationEngine(world);

  // Canal de agua en y=0, con aire arriba
  for (let z = 4; z <= 10; z++) {
    world.set(11, 0, z, BLOCK_TYPES.WATER_STREAM_SOUTH);
    world.set(12, 0, z, BLOCK_TYPES.WATER_STREAM_SOUTH);
  }

  const player = {
    pos: { x: 11.5, y: 1.0, z: 5.0 },
    visualPos: { x: 11.5, y: 1.0, z: 5.0 },
    vel: { x: 0, y: 0, z: 0 },
    yaw: Math.PI, // Mirando hacia adelante (+Z)
    inputForward: 1, // Caminando a favor de corriente en el canal
    inputRight: 0,
    onGround: true,
    hero: { speedMultiplier: 1.0, jumpMultiplier: 1.0 },
    setCheckpoint: () => {},
    tickInvulnerability: () => {},
  };

  // Simular 30 ticks (1 segundo de física) sobre el canal de agua
  for (let i = 0; i < 30; i++) {
    sim.integratePlayer(player, 1 / 30, 0);
  }

  // Debe mantenerse sobre el agua (y >= 0.99), con onGround=true y avanzando por el torrente
  assert.ok(player.pos.y >= 0.99, `El jugador no debe caer al vacío (y=${player.pos.y})`);
  assert.equal(player.onGround, true, 'Debe permanecer apoyado sobre el agua');
  assert.ok(player.pos.z > 5.0, `Debe haber avanzado hacia adelante impulsado por la corriente (z=${player.pos.z})`);
});

test('Capítulo 3 (Cataratas Subterráneas) está registrado, activo y sus 3 mazmorras cargan correctamente', () => {
  const registry = new ChapterRegistry();
  const ch3 = registry.getChapter('capitulo_3');

  assert.ok(ch3, 'Capítulo 3 debe existir');
  assert.equal(ch3.number, 3);
  assert.equal(ch3.id, 'capitulo_3');
  assert.equal(ch3.name, 'Cataratas Subterráneas');
  assert.equal(ch3.theme, 'subterranean_falls');
  assert.equal(ch3.underConstruction, undefined, 'No debe estar en construcción');

  assert.equal(ch3.dungeons.length, 3);
  const dungeonIds = ch3.dungeons.map(d => d.id);
  assert.deepEqual(dungeonIds, ['falls_aqueduct', 'falls_torrent', 'falls_reservoir']);

  // Probar carga en el World de las 3 mazmorras
  const world = new World();
  const l1 = world.levelRegistry.getLevel('falls_aqueduct');
  assert.ok(l1);
  world.loadLevel(l1);
  assert.equal(world.currentLevel.id, 'falls_aqueduct');
  assert.ok(world.doors.length >= 2, 'Acueducto debe tener al menos 2 puertas');

  const l2 = world.levelRegistry.getLevel('falls_torrent');
  assert.ok(l2);
  world.loadLevel(l2);
  assert.equal(world.currentLevel.id, 'falls_torrent');

  const l3 = world.levelRegistry.getLevel('falls_reservoir');
  assert.ok(l3);
  world.loadLevel(l3);
  assert.equal(world.currentLevel.id, 'falls_reservoir');
  assert.equal(world.currentLevel.stairs, null, 'Cisterna Sumergida es clímax y no tiene escalinata');
  assert.equal(world.objectives[0].name, 'Altar Fluvial Supremo');
});

test('Completar Capítulo 2 desbloquea Capítulo 3 en ChapterRegistry', () => {
  const registry = new ChapterRegistry();
  registry.resetProgress();

  assert.equal(registry.isChapterUnlocked(2), false);
  assert.equal(registry.isChapterUnlocked(3), false);

  // Completar Cap 1
  registry.completeChapter('capitulo_1');
  assert.equal(registry.isChapterUnlocked(2), true);
  assert.equal(registry.isChapterPlayable(2), true);
  assert.equal(registry.isChapterUnlocked(3), false);

  // Completar Cap 2
  const res2 = registry.completeChapter('capitulo_2');
  assert.ok(res2.nextChapter);
  assert.equal(res2.nextChapter.id, 'capitulo_3');
  assert.equal(registry.isChapterUnlocked(3), true);
  assert.equal(registry.isChapterPlayable(3), true);
});
