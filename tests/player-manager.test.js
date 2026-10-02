import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PlayerManager } from '../src/entities/PlayerManager.js';

test('jugador local id -1 inicial y asignable a 0 (host) o 1+ (cliente)', () => {
  const pm = new PlayerManager();
  assert.equal(pm.localPlayer.id, -1, 'el jugador local debe arrancar con id -1 (no asignado)');
  pm.setLocalId(0); // Anfitrión
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

test('addRemotePlayer no duplica jugadores para la misma conexión o peer', () => {
  const pm = new PlayerManager();
  const connSafe = { peer: 'peer-unique', label: 'game-safe' };
  const connHot = { peer: 'peer-unique', label: 'game-hot' };

  const p1 = pm.addRemotePlayer(connSafe, 'Aventurero', 1);
  const p2 = pm.addRemotePlayer(connHot, 'Aventurero Renombrado', 2);
  assert.equal(p1.id, p2.id, 'debe ser el mismo id');
  assert.equal(pm.getAllPlayers().filter(p => p.id === p1.id).length, 1, 'solo debe haber una instancia del jugador');
  assert.equal(p2.name, 'Aventurero Renombrado');
});

test('límite estricto de 5 jugadores simultáneos y rechazo al exceder aforo', () => {
  const pm = new PlayerManager(5);
  pm.setLocalId(0); // Host (jugador 1)
  assert.equal(pm.isFull(), false);

  const c1 = { peer: 'peer-1' };
  const c2 = { peer: 'peer-2' };
  const c3 = { peer: 'peer-3' };
  const c4 = { peer: 'peer-4' };
  const c5 = { peer: 'peer-5' }; // Intentará ser el 6º jugador

  assert.ok(pm.addRemotePlayer(c1)); // Jugador 2
  assert.ok(pm.addRemotePlayer(c2)); // Jugador 3
  assert.ok(pm.addRemotePlayer(c3)); // Jugador 4
  assert.ok(pm.addRemotePlayer(c4)); // Jugador 5
  assert.equal(pm.getAllPlayers().length, 5);
  assert.equal(pm.isFull(), true, 'la sala debe marcar aforo completo con 5 jugadores');

  // El 6º jugador debe ser rechazado (devuelve null)
  const rejected = pm.addRemotePlayer(c5);
  assert.equal(rejected, null, 'no se debe permitir agregar un 6º jugador');
  assert.equal(pm.getAllPlayers().length, 5);

  // Si un jugador se va, se libera cupo
  pm.removeByConnection(c1);
  assert.equal(pm.getAllPlayers().length, 4);
  assert.equal(pm.isFull(), false, 'tras la desconexión el cupo debe liberarse');
  assert.ok(pm.addRemotePlayer(c5), 'ahora sí debe permitirse el ingreso');
  assert.equal(pm.getAllPlayers().length, 5);
});

test('unicidad absoluta de razas/héroes: no permite clases duplicadas en el equipo', () => {
  const pm = new PlayerManager(5);
  pm.setLocalId(0);
  pm.setLocalProfile('Anfitrión Aventurero', 0); // Ocupa Aventurero (0)

  // Cliente 1 intenta unirse también como Aventurero (0)
  const c1 = { peer: 'peer-alpha' };
  const p1 = pm.addRemotePlayer(c1, 'Cliente Uno', 0);
  assert.notEqual(p1.colorIndex, 0, 'no debe duplicar la clase Aventurero (0)');
  assert.equal(p1.colorIndex, 1, 'debe asignar la siguiente clase libre (Paladín - 1)');

  // Cliente 2 también pide Aventurero (0)
  const c2 = { peer: 'peer-beta' };
  const p2 = pm.addRemotePlayer(c2, 'Cliente Dos', 0);
  assert.notEqual(p2.colorIndex, 0);
  assert.notEqual(p2.colorIndex, 1);
  assert.equal(p2.colorIndex, 2, 'debe asignar Explorador (2)');

  // Comprobar getTakenColorIndices
  const taken = pm.getTakenColorIndices();
  assert.equal(taken.has(0), true);
  assert.equal(taken.has(1), true);
  assert.equal(taken.has(2), true);
  assert.equal(taken.size, 3);

  // Cliente 3 pide clase libre Hechicero (3)
  const c3 = { peer: 'peer-gamma' };
  const p3 = pm.addRemotePlayer(c3, 'Cliente Tres', 3);
  assert.equal(p3.colorIndex, 3, 'si la clase solicitada está libre, se le concede');

  // getAvailableColorIndex excluyendo al propio jugador
  const availForP1 = pm.getAvailableColorIndex(1, p1.id, 5);
  assert.equal(availForP1, 1, 'debe permitirle mantener su clase asignada');
});

test('PlayerManager.reset() limpia todas las conexiones y restaura jugador local id -1', () => {
  const pm = new PlayerManager();
  pm.setLocalId(0);
  pm.setLocalProfile('Leader', 3);
  pm.addRemotePlayer({ peer: 'peer-1' }, 'Guest', 1);
  assert.equal(pm.getAllPlayers().length, 2);

  pm.reset();
  assert.equal(pm.getAllPlayers().length, 1);
  assert.equal(pm.localPlayer.id, -1);
  assert.equal(pm.connToPlayerId.size, 0);
});


