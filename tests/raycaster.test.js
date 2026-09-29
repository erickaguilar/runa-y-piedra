import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BlockRaycaster } from '../src/interaction/BlockRaycaster.js';

function stubWorld(over = {}) {
  return {
    doors: [],
    objectives: [],
    stairwells: [],
    chests: [],
    isDoor1Open: false,
    isDoor2Open: false,
    ...over,
  };
}

const ray = new BlockRaycaster(null, null, stubWorld());

test('puerta cerrada cerca -> door; abierta se ignora', () => {
  const w = stubWorld({ doors: [{ id: 1, z: 11, name: 'P1' }] });
  const r = new BlockRaycaster(null, null, w);
  assert.equal(r.getProximityTarget({ x: 11.5, y: 1, z: 9 }).type, 'door');
  w.isDoor1Open = true;
  assert.equal(r.getProximityTarget({ x: 11.5, y: 1, z: 9 }), null);
});

test('objetivo devuelve pedestal con índice', () => {
  const w = stubWorld({ objectives: [{ type: 'pedestal', x: 12, z: 30, triggerRadius: 3.2 }] });
  const r = new BlockRaycaster(null, null, w);
  const t = r.getProximityTarget({ x: 12, y: 1, z: 29 });
  assert.equal(t.type, 'pedestal');
  assert.equal(t.objIndex, 0);
});

test('losa cerrada cerca -> stairs; abierta se ignora', () => {
  const w = stubWorld({ stairwells: [{ x1: 11, x2: 12, z1: 31, z2: 33, open: false }] });
  const r = new BlockRaycaster(null, null, w);
  assert.equal(r.getProximityTarget({ x: 12, y: 1, z: 32 }).type, 'stairs');
  w.stairwells[0].open = true;
  assert.equal(r.getProximityTarget({ x: 12, y: 1, z: 32 }), null);
});

test('cofre abierto se ignora, cerrado se ofrece', () => {
  const w = stubWorld({ chests: [{ id: 1, x: 4.5, z: 5.5, isOpen: false }] });
  const r = new BlockRaycaster(null, null, w);
  assert.equal(r.getProximityTarget({ x: 4.5, y: 1, z: 5 }).type, 'chest');
  w.chests[0].isOpen = true;
  assert.equal(r.getProximityTarget({ x: 4.5, y: 1, z: 5 }), null);
});

test('lejos de todo -> null', () => {
  assert.equal(ray.getProximityTarget({ x: 12, y: 1, z: 4.5 }), null);
});

test('prioridad: puerta antes que cofre', () => {
  const w = stubWorld({
    doors: [{ id: 1, z: 11, name: 'P1' }],
    chests: [{ id: 1, x: 11.5, z: 10, isOpen: false }],
  });
  const r = new BlockRaycaster(null, null, w);
  assert.equal(r.getProximityTarget({ x: 11.5, y: 1, z: 10 }).type, 'door');
});
