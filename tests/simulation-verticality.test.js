import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { SimulationEngine } from '../src/simulation/SimulationEngine.js';
import { Player } from '../src/entities/Player.js';
import { BLOCK_TYPES, PHYSICS_CONFIG } from '../src/config/constants.js';
import { ACTION_FLAGS } from '../src/network/Protocol.js';

test('JUMP_PAD otorga impulso vertical aumentado (1.35x) y registra métricas cuantificables', () => {
  const world = new World();
  // Usar zona despejada del vestíbulo (x=11, z=3) donde no hay pilares ni techos bajos
  world.set(11, 0, 3, BLOCK_TYPES.STONE_FLOOR);
  world.set(12, 0, 3, BLOCK_TYPES.JUMP_PAD);

  let jumpPadEventFired = false;
  const sim = new SimulationEngine(world, {
    onJumpPad: () => {
      jumpPadEventFired = true;
    }
  });


  // 1. Salto normal sobre STONE_FLOOR
  const dt = 0.033;
  const p1 = new Player(1, 11.5, 1.0, 3.5);
  p1.onGround = true;
  sim.integratePlayer(p1, dt, ACTION_FLAGS.JUMP);

  assert.equal(p1.jumpCount, 1);
  assert.equal(p1.jumpPadCount || 0, 0);
  assert.equal(jumpPadEventFired, false);
  const normalJumpVy = (PHYSICS_CONFIG.JUMP_VELOCITY * (p1.hero?.jumpMultiplier || 1.0)) + (PHYSICS_CONFIG.GRAVITY * dt);
  assert.ok(Math.abs(p1.vel.y - normalJumpVy) < 1e-4, `p1.vel.y ${p1.vel.y} vs ${normalJumpVy}`);

  // 2. Salto potenciado sobre JUMP_PAD
  const p2 = new Player(2, 12.5, 1.0, 3.5);
  p2.onGround = true;
  sim.integratePlayer(p2, dt, ACTION_FLAGS.JUMP);

  assert.equal(p2.jumpCount, 1);
  assert.equal(p2.jumpPadCount, 1);
  assert.equal(jumpPadEventFired, true);
  const boostedJumpVy = (PHYSICS_CONFIG.JUMP_VELOCITY * (p2.hero?.jumpMultiplier || 1.0) * 1.35) + (PHYSICS_CONFIG.GRAVITY * dt);
  assert.ok(Math.abs(p2.vel.y - boostedJumpVy) < 1e-4, `p2.vel.y ${p2.vel.y} vs ${boostedJumpVy}`);
});



test('SimulationEngine registra cota de altitud máxima (maxAltitude) alcanzada por el jugador', () => {
  const world = new World();
  world.set(5, 0, 5, BLOCK_TYPES.STONE_FLOOR);
  const sim = new SimulationEngine(world);

  const p = new Player(1, 5.5, 1.0, 5.5);
  p.onGround = true;
  sim.integratePlayer(p, 0.033, 0);
  assert.equal(p.maxAltitude, 1.0);

  // Simular ascenso a plataforma elevada
  p.pos.y = 3.5;
  sim.integratePlayer(p, 0.033, 0);
  assert.equal(p.maxAltitude, 3.5);

  // Caer no reduce maxAltitude
  p.pos.y = 2.0;
  sim.integratePlayer(p, 0.033, 0);
  assert.equal(p.maxAltitude, 3.5);
});

test('abyss_throne incorpora verticalidad escalonada (y=0, y=1, y=2) y pilares de apoyo en el Vacío', () => {
  const world = new World();
  const abyssLevel = world.levelRegistry.getLevel('abyss_throne');
  assert.ok(abyssLevel, 'abyss_throne debe estar registrado');
  world.loadLevel(abyssLevel);

  // Plataforma 1 (y=0, z=14)
  assert.equal(world.get(8, 0, 14), BLOCK_TYPES.JUMP_PAD);

  // Plataforma 2 elevada (pilar en y=0, jump pad en y=1, z=16)
  assert.equal(world.get(12, 0, 16), BLOCK_TYPES.PILLAR);
  assert.equal(world.get(12, 1, 16), BLOCK_TYPES.JUMP_PAD);

  // Plataforma 3 cúspide (pilares en y=0 e y=1, jump pad en y=2, z=18)
  assert.equal(world.get(10, 0, 18), BLOCK_TYPES.PILLAR);
  assert.equal(world.get(10, 1, 18), BLOCK_TYPES.PILLAR);
  assert.equal(world.get(10, 2, 18), BLOCK_TYPES.JUMP_PAD);

  // Plataforma 4 elevada (pilar en y=0, jump pad en y=1, z=20)
  assert.equal(world.get(13, 0, 20), BLOCK_TYPES.PILLAR);
  assert.equal(world.get(13, 1, 20), BLOCK_TYPES.JUMP_PAD);

  // Plataforma 5 (y=0, z=22)
  assert.equal(world.get(10, 0, 22), BLOCK_TYPES.JUMP_PAD);
});
