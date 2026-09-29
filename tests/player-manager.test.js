import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PlayerManager } from '../src/entities/PlayerManager.js';

test('jugador local id 0 y remotos incrementales', () => {
  const pm = new PlayerManager();
  assert.equal(pm.localPlayer.id, 0);
  const c1 = {}, c2 = {};
  const r1 = pm.addRemotePlayer(c1);
  const r2 = pm.addRemotePlayer(c2);
  assert.equal(r1.id, 1);
  assert.equal(r2.id, 2);
  assert.equal(pm.getPlayerByConnection(c1), r1);
  assert.equal(pm.getPlayerById(2), r2);
});

test('metadatos y snapshots con vidas', () => {
  const pm = new PlayerManager();
  const c1 = {};
  pm.addRemotePlayer(c1, 'Viejo', 0);
  pm.updatePlayerMeta(1, 'Nuevo', 2);
  const p = pm.getPlayerById(1);
  assert.equal(p.name, 'Nuevo');
  assert.equal(p.colorIndex, 2);
  const snaps = pm.getSnapshots();
  assert.equal(snaps.length, 2);
  assert.ok(snaps.every(s => typeof s.lives === 'number'));
});

test('removeByConnection limpia jugador y mapeo', () => {
  const pm = new PlayerManager();
  const c1 = {};
  pm.addRemotePlayer(c1);
  const removed = pm.removeByConnection(c1);
  assert.equal(removed.id, 1);
  assert.equal(pm.getPlayerByConnection(c1), null);
  assert.equal(pm.getAllPlayers().length, 1);
});

test('setLocalId reasigna sin duplicar', () => {
  const pm = new PlayerManager();
  pm.setLocalId(7);
  assert.equal(pm.localPlayer.id, 7);
  assert.equal(pm.getAllPlayers().filter(p => p.id === 7).length, 1);
});
