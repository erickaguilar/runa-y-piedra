import { test } from 'node:test';
import assert from 'node:assert/strict';
import { electLeader, deriveMigrationPin, deriveMigrationRoomId } from '../src/network/LeaderElection.js';
import { MSG, serializePeerRoster, deserializePeerRoster } from '../src/network/Protocol.js';

test('electLeader con roster vacío o inválido retorna null', () => {
  assert.deepEqual(electLeader([]), { leader: null, isLeader: false, candidates: [] });
  assert.deepEqual(electLeader(null), { leader: null, isLeader: false, candidates: [] });
  assert.deepEqual(electLeader([{ playerId: 0, peerId: 'host-1' }]), { leader: null, isLeader: false, candidates: [] });
});

test('electLeader filtra al host (playerId: 0 y hostPeerId)', () => {
  const roster = [
    { peerId: 'host-alpha', playerId: 0, name: 'Host' },
    { peerId: 'guest-1', playerId: 1, name: 'Invitado 1' },
    { peerId: 'guest-2', playerId: 2, name: 'Invitado 2' }
  ];

  const res1 = electLeader(roster, 'guest-1', 'host-alpha');
  assert.equal(res1.leader?.peerId, 'guest-1');
  assert.equal(res1.isLeader, true);
  assert.equal(res1.candidates.length, 2);

  const res2 = electLeader(roster, 'guest-2', 'host-alpha');
  assert.equal(res2.leader?.peerId, 'guest-1');
  assert.equal(res2.isLeader, false);
});

test('electLeader elige deterministamente por menor playerId', () => {
  const roster = [
    { peerId: 'p3-peer', playerId: 3, name: 'Jugador 3' },
    { peerId: 'p1-peer', playerId: 1, name: 'Jugador 1' },
    { peerId: 'p2-peer', playerId: 2, name: 'Jugador 2' }
  ];

  const result = electLeader(roster, 'p3-peer');
  assert.equal(result.leader?.peerId, 'p1-peer');
  assert.equal(result.leader?.playerId, 1);
  assert.equal(result.isLeader, false);
});

test('electLeader desempata por timestamp de unión (joinedAt) y luego por peerId', () => {
  const t0 = 1000;
  const t1 = 2000;
  const rosterTime = [
    { peerId: 'peer-b', playerId: 1, joinedAt: t1 },
    { peerId: 'peer-a', playerId: 1, joinedAt: t0 }
  ];
  assert.equal(electLeader(rosterTime, 'peer-b').leader?.peerId, 'peer-a');

  // Desempate por orden lexicográfico de peerId si joinedAt coincide
  const rosterLex = [
    { peerId: 'peer-bravo', playerId: 1, joinedAt: t0 },
    { peerId: 'peer-alpha', playerId: 1, joinedAt: t0 }
  ];
  assert.equal(electLeader(rosterLex, 'peer-bravo').leader?.peerId, 'peer-alpha');
});

test('deriveMigrationPin y deriveMigrationRoomId generan identificadores deterministas', () => {
  assert.equal(deriveMigrationPin('4821'), '4821-M');
  assert.equal(deriveMigrationPin('VOXELSALA-4821'), '4821-M');
  assert.equal(deriveMigrationPin('4821-M'), '4821-M2');
  assert.equal(deriveMigrationPin('4821-M2'), '4821-M3');

  assert.equal(deriveMigrationRoomId('4821'), 'VOXELSALA-4821-M');
  assert.equal(deriveMigrationRoomId('VOXELSALA-4821'), 'VOXELSALA-4821-M');
});

test('Protocol.js serializa y deserializa PEER_ROSTER con MSG.PEER_ROSTER = 0x12', () => {
  assert.equal(MSG.PEER_ROSTER, 0x12);

  const roster = [
    { peerId: 'p0-host', playerId: 0, name: 'Guardián Host', colorIndex: 0 },
    { peerId: 'p1-guest', playerId: 1, name: 'Mago Aliado', colorIndex: 1 }
  ];

  const buf = serializePeerRoster(roster);
  const view = new DataView(buf);
  assert.equal(view.getUint8(0), 0x12);

  const parsed = deserializePeerRoster(buf);
  assert.deepEqual(parsed, roster);
});
