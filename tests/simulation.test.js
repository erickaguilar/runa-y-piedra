import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { Player } from '../src/entities/Player.js';
import { SimulationEngine } from '../src/simulation/SimulationEngine.js';

function setup() {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  const events = [];
  const sim = new SimulationEngine(world, {
    onPlayerRespawn: (p, cp, info) => events.push(info),
  });
  return { world, sim, events };
}

test('tocar lava quita 1 vida y reaparece en checkpoint', () => {
  const { sim, events } = setup();
  const p = new Player(0, 5, 0.0, 15);
  p.setCheckpoint(12, 1.2, 4.5, 'Sala 1');
  p.vel.y = 0;
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(p.lives, 2);
  assert.equal(events.length, 1);
  assert.equal(events[0].cause, 'lava');
  assert.equal(p.pos.x, 12);
  assert.ok(p.isInvulnerable);
});

test('muerte ignorada durante invulnerabilidad', () => {
  const { sim, events } = setup();
  const p = new Player(0, 5, 0.0, 15);
  p.setCheckpoint(12, 1.2, 4.5, 'Sala 1');
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(p.lives, 2);
  // Seguir en lava pero invulnerable: sin más muertes
  p.pos.x = 5; p.pos.y = 0.0; p.pos.z = 15;
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(p.lives, 2);
  assert.equal(events.length, 1);
});

test('caer al vacío quita 1 vida', () => {
  const { sim, events } = setup();
  const p = new Player(0, 12, 1.2, 15);
  p.setCheckpoint(12, 1.2, 4.5, 'Sala 1');
  p.pos.y = -9;
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(p.lives, 2);
  assert.equal(events[0].cause, 'void');
});

test('tercera muerte = game over con vidas restauradas', () => {
  const { sim, events } = setup();
  const p = new Player(0, 5, 0.0, 15);
  p.setCheckpoint(12, 1.2, 4.5, 'Sala 1');
  p.lives = 1;
  p.invulnTicks = 0;
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(events[events.length - 1].gameOver, true);
  assert.equal(p.lives, p.maxLives);
});

test('sensor de escalinata notifica sin quitar vidas', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  // Abrir fosa mínima a mano para el test
  world.stairwells = [{ x1: 11, x2: 12, z1: 31, z2: 33, triggerY: 0.75, open: true }];
  const touched = [];
  const sim = new SimulationEngine(world, { onStairTouch: (p, w) => touched.push(w) });
  const p = new Player(0, 11.5, 0.5, 32);
  p.invulnTicks = 60; // invulnerable: ni la lava/abismo lo tocan, el sensor sí
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(touched.length, 1);
  assert.equal(p.lives, 3);
});
