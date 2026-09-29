import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { Player } from '../src/entities/Player.js';
import { SimulationEngine } from '../src/simulation/SimulationEngine.js';
import { ClientReconciler } from '../src/network/ClientReconciler.js';

function setup() {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  const sim = new SimulationEngine(world, {});
  const rec = new ClientReconciler();
  const local = new Player(1, 12, 1.2, 4.5);
  return { sim, rec, local };
}

test('snapshot exacto confirma inputs y error ~0', () => {
  const { sim, rec, local } = setup();
  rec.recordInput(1, 1 / 30, 0, 0, 0, 0);
  rec.recordInput(2, 1 / 30, 0, 0, 0, 0);
  const snap = [{ id: 1, lastInputSeq: 2, x: 12, y: 1.2, z: 4.5, yaw: 0, velY: 0, onGround: true, lives: 3 }];
  rec.onSnapshot(1000, snap, local, sim);
  assert.equal(rec.pendingInputs.length, 0);
  assert.ok(rec.predictionError < 0.09, `error ${rec.predictionError}`);
});

test('desfase enorme teletransporta y vacía el buffer', () => {
  const { sim, rec, local } = setup();
  rec.recordInput(1, 1 / 30, 1, 0, 0, 0);
  const snap = [{ id: 1, lastInputSeq: 0, x: 100, y: 50, z: 100, yaw: 0, velY: 0, onGround: false, lives: 3 }];
  rec.onSnapshot(2000, snap, local, sim);
  assert.equal(local.pos.x, 100);
  assert.equal(rec.pendingInputs.length, 0);
});

test('snapshots viejos se descartan (guarda monotónica)', () => {
  const { sim, rec, local } = setup();
  const snap = [{ id: 1, lastInputSeq: 0, x: 12, y: 1.2, z: 4.5, yaw: 0, velY: 0, onGround: true, lives: 3 }];
  rec.onSnapshot(3000, snap, local, sim);
  local.pos.x = -999; // si procesara el viejo, esto cambiaría
  rec.onSnapshot(2000, snap, local, sim);
  assert.equal(local.pos.x, -999);
});

test('buffer de inputs respeta el máximo', () => {
  const rec = new ClientReconciler({ maxPendingInputs: 10 });
  for (let i = 0; i < 30; i++) rec.recordInput(i, 1 / 30, 0, 0, 0, 0);
  assert.equal(rec.pendingInputs.length, 10);
});
