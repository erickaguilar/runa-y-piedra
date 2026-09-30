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

test('reset(minSimTime) descarta snapshots rezagados de niveles anteriores', () => {
  const { sim, rec, local } = setup();
  // El cliente cambia de nivel en timestamp 5000 y se sitúa en spawn (z = 7.5)
  local.pos.x = 12;
  local.pos.y = 1.2;
  local.pos.z = 7.5;
  rec.reset(5000);

  // Llega un snapshot tardío del nivel anterior emitido a timestamp 4900 donde el jugador estaba en z=19.5
  const staleSnap = [{ id: 1, lastInputSeq: 0, x: 12, y: 1.2, z: 19.5, yaw: 0, velY: 0, onGround: true, lives: 3 }];
  rec.onSnapshot(4900, staleSnap, local, sim);

  // Debe descartarse: el jugador permanece intacto en z = 7.5
  assert.equal(local.pos.z, 7.5, 'No debe aplicar snapshot viejo del nivel anterior');

  // Un snapshot nuevo del nivel actual (timestamp 5100) sí se procesa
  const freshSnap = [{ id: 1, lastInputSeq: 0, x: 12, y: 1.2, z: 7.6, yaw: 0, velY: 0, onGround: true, lives: 3 }];
  rec.onSnapshot(5100, freshSnap, local, sim);
  assert.equal(local.pos.z, 7.6, 'Debe procesar snapshots nuevos posteriores al cambio de nivel');
});

