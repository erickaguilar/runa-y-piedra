import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PlayerManager } from '../src/entities/PlayerManager.js';
import { NetworkManager } from '../src/network/NetworkManager.js';
import { electLeader, deriveMigrationPin, deriveMigrationRoomId } from '../src/network/LeaderElection.js';
import * as Proto from '../src/network/Protocol.js';

test('PlayerManager.getRoster() serializa el censo completo de aventureros', () => {
  const pm = new PlayerManager();
  pm.setLocalId(0);
  pm.setLocalProfile('Guardián Host', 0);
  pm.localPlayer.peerId = 'peer-host';

  const mockConn1 = { peer: 'peer-guest-1' };
  const mockConn2 = { peer: 'peer-guest-2' };

  pm.addRemotePlayer(mockConn1, 'Mago Aliado', 1);
  pm.addRemotePlayer(mockConn2, 'Pícaro Ágil', 2);

  const roster = pm.getRoster();
  assert.equal(roster.length, 3);
  assert.equal(roster[0].playerId, 0);
  assert.equal(roster[0].peerId, 'peer-host');
  assert.equal(roster[0].name, 'Guardián Host');

  assert.equal(roster[1].playerId, 1);
  assert.equal(roster[1].peerId, 'peer-guest-1');
  assert.equal(roster[1].name, 'Mago Aliado');

  assert.equal(roster[2].playerId, 2);
  assert.equal(roster[2].peerId, 'peer-guest-2');
  assert.equal(roster[2].name, 'Pícaro Ágil');
});

test('NetworkManager procesa el paquete binario PEER_ROSTER y dispara evento peer-roster', () => {
  const net = new NetworkManager();
  net.isHost = false;

  const rosterData = [
    { peerId: 'host-xyz', playerId: 0, name: 'Anfitrión', colorIndex: 0, joinedAt: 100 },
    { peerId: 'guest-123', playerId: 1, name: 'Aventurero 1', colorIndex: 1, joinedAt: 200 }
  ];

  let eventFired = false;
  let receivedRoster = null;
  net.addEventListener('peer-roster', (e) => {
    eventFired = true;
    receivedRoster = e.detail.roster;
  });

  const buf = Proto.serializePeerRoster(rosterData);
  net._handleIncoming(buf, { peer: 'host-xyz' });

  assert.equal(eventFired, true);
  assert.deepEqual(receivedRoster, rosterData);
  assert.deepEqual(net.peerRoster, rosterData);
});

test('End-to-End: Elección determinista entre múltiples invitados ante la caída del Host', () => {
  // Simulación: Sala 8420 con Host (P0), Invitado Alpha (P1) e Invitado Bravo (P2)
  const roomPin = '8420';
  const sharedRoster = [
    { peerId: 'peer-host-root', playerId: 0, name: 'Paladín Host', colorIndex: 4, joinedAt: 1000 },
    { peerId: 'peer-alpha', playerId: 1, name: 'Guardián Alpha', colorIndex: 0, joinedAt: 2000 },
    { peerId: 'peer-bravo', playerId: 2, name: 'Clérigo Bravo', colorIndex: 3, joinedAt: 3000 }
  ];

  // 1. Invitado Alpha evalúa la caída del Host
  const electionAlpha = electLeader(sharedRoster, 'peer-alpha', 'peer-host-root');
  assert.equal(electionAlpha.isLeader, true);
  assert.equal(electionAlpha.leader?.peerId, 'peer-alpha');

  // Alpha deriva la sala de migración para reanudar la mazmorra
  const migrationPinForHost = deriveMigrationPin(roomPin);
  assert.equal(migrationPinForHost, '8420-M');
  assert.equal(deriveMigrationRoomId(roomPin), 'VOXELSALA-8420-M');

  // 2. Invitado Bravo evalúa la misma caída del Host
  const electionBravo = electLeader(sharedRoster, 'peer-bravo', 'peer-host-root');
  assert.equal(electionBravo.isLeader, false);
  assert.equal(electionBravo.leader?.peerId, 'peer-alpha');
  assert.equal(electionBravo.leader?.name, 'Guardián Alpha');

  // Bravo deriva exactamente el mismo PIN para reconectarse sin interacción manual
  const migrationPinForGuest = deriveMigrationPin(roomPin);
  assert.equal(migrationPinForGuest, '8420-M');
  assert.equal(migrationPinForHost, migrationPinForGuest);
});
