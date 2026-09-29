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

test('updatePlayerMeta crea entidad remota si no existe (visibilidad cliente)', () => {
  const pm = new PlayerManager();
  // El cliente se reasigna a id 1 tras recibir INIT
  pm.setLocalId(1);
  assert.equal(pm.getPlayerById(0), null);

  // Al recibir metadatos del anfitrión (id 0), PlayerManager debe crear la entidad
  pm.updatePlayerMeta(0, 'Anfitrión Noble', 3);
  const host = pm.getPlayerById(0);
  assert.ok(host, 'el anfitrión debe existir en la lista de jugadores');
  assert.equal(host.name, 'Anfitrión Noble');
  assert.equal(host.colorIndex, 3);
  assert.equal(pm.getAllPlayers().length, 2);
});

test('getPlayerByConnection y removeByConnection resuelven por conn.peer', () => {
  const pm = new PlayerManager();
  const safeConn = { peer: 'client-peer-99', label: 'game-safe' };
  const hotConn = { peer: 'client-peer-99', label: 'game-hot' };

  const remote = pm.addRemotePlayer(safeConn, 'Héroe', 1);
  // Buscar con el canal hot debe resolver al mismo jugador
  assert.equal(pm.getPlayerByConnection(hotConn), remote);

  // Desconexión usando referencia alternativa
  const removed = pm.removeByConnection(hotConn);
  assert.equal(removed.id, remote.id);
  assert.equal(pm.getPlayerByConnection(safeConn), null);
});

