import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as Proto from '../src/network/Protocol.js';

test('snapshot roundtrip conserva vidas', () => {
  const players = [
    { id: 0, lastInputSeq: 41, x: 1.5, y: 2.0, z: 3.5, yaw: 0.7, velY: -1.2, onGround: true, lives: 2 },
    { id: 1, lastInputSeq: 7, x: 4, y: 5, z: 6, yaw: 0, velY: 0, onGround: false, lives: 3 },
  ];
  const buf = Proto.serializeSnapshot(99, players);
  const out = Proto.deserializeSnapshot(buf);
  assert.equal(out.seq, 99);
  assert.equal(out.players.length, 2);
  assert.equal(out.players[0].lives, 2);
  assert.equal(out.players[0].lastInputSeq, 41);
  assert.ok(Math.abs(out.players[0].x - 1.5) < 1e-6);
  assert.equal(out.players[1].onGround, false);
});

test('snapshot viejo de 24B/jugador asume lives=3', () => {
  // Formato v2.2 sin byte de vidas: [hdr:8][id:1][seq:2][x,y,z,yaw,velY:4*5][ground:1]
  const buf = new ArrayBuffer(8 + 24);
  const v = new DataView(buf);
  v.setUint8(0, Proto.MSG.SNAPSHOT);
  v.setUint16(1, 5, true);
  v.setUint32(3, 1234, true);
  v.setUint8(7, 1);
  v.setUint8(8, 3);
  v.setUint16(9, 10, true);
  v.setFloat32(11, 1, true);
  v.setFloat32(15, 2, true);
  v.setFloat32(19, 3, true);
  v.setFloat32(23, 0.5, true);
  v.setFloat32(27, 0, true);
  v.setUint8(31, 1);
  const out = Proto.deserializeSnapshot(buf);
  assert.equal(out.players.length, 1);
  assert.equal(out.players[0].lives, 3);
  assert.equal(out.players[0].id, 3);
});

test('key update roundtrip', () => {
  const buf = Proto.serializeKeyUpdate(2, 'llave_santuario');
  const out = Proto.deserializeKeyUpdate(buf);
  assert.deepEqual(out, { playerId: 2, keyId: 'llave_santuario' });
});

test('descent START/GO/NOW roundtrip', () => {
  const start = Proto.serializeDescentStart(1, 'Aventurero', 99998888);
  const ds = Proto.deserializeDescent(start);
  assert.equal(ds.kind, Proto.DESCENT_KIND.START);
  assert.equal(ds.initiatorId, 1);
  assert.equal(ds.byName, 'Aventurero');

  const go = Proto.serializeDescentGo('crypt_inferno', 'Cripta del Fuego');
  const dg = Proto.deserializeDescent(go);
  assert.equal(dg.kind, Proto.DESCENT_KIND.GO);
  assert.equal(dg.nextLevelId, 'crypt_inferno');

  const now = Proto.serializeDescentNow();
  assert.equal(Proto.deserializeDescent(now).kind, Proto.DESCENT_KIND.NOW);
});

test('stairs REQ/OPEN roundtrip', () => {
  assert.equal(Proto.deserializeStairs(Proto.serializeStairsReq()).kind, Proto.STAIRS_KIND.REQ);
  assert.equal(Proto.deserializeStairs(Proto.serializeStairsOpen()).kind, Proto.STAIRS_KIND.OPEN);
});

test('pedestal request/event roundtrip', () => {
  const req = Proto.serializePedestalRequest(0);
  const dr = Proto.deserializePedestal(req);
  assert.equal(dr.isRequest, true);

  const evt = Proto.serializePedestalEvent(0, 'crypt_inferno', 'Cripta', false);
  const de = Proto.deserializePedestal(evt);
  assert.equal(de.isRequest, false);
  assert.equal(de.nextLevelId, 'crypt_inferno');
  assert.equal(de.isLast, false);
});

test('level-change roundtrip conserva levelId e isGameOver', () => {
  const bufNormal = Proto.serializeLevelChange('crypt_inferno', false);
  const resNormal = Proto.deserializeLevelChange(bufNormal);
  assert.equal(resNormal.levelId, 'crypt_inferno');
  assert.equal(resNormal.isGameOver, false);

  const bufGameOver = Proto.serializeLevelChange('lobby_tutorial', true);
  const resGameOver = Proto.deserializeLevelChange(bufGameOver);
  assert.equal(resGameOver.levelId, 'lobby_tutorial');
  assert.equal(resGameOver.isGameOver, true);

  // Formato legacy sin byte isGameOver (2 bytes cabecera: [MSG.LEVEL_CHANGE, len, ...bytes])
  const textEncoder = new TextEncoder();
  const idBytes = textEncoder.encode('dungeon_classic');
  const legacyBuf = new ArrayBuffer(2 + idBytes.length);
  const v = new DataView(legacyBuf);
  v.setUint8(0, Proto.MSG.LEVEL_CHANGE);
  v.setUint8(1, idBytes.length);
  new Uint8Array(legacyBuf, 2).set(idBytes);

  const resLegacy = Proto.deserializeLevelChange(legacyBuf);
  assert.equal(resLegacy.levelId, 'dungeon_classic');
  assert.equal(resLegacy.isGameOver, false);
});

test('potion-use roundtrip conserva playerId y healAmount', () => {
  const buf = Proto.serializePotionUse(3, 1);
  const res = Proto.deserializePotionUse(buf);
  assert.equal(res.playerId, 3);
  assert.equal(res.healAmount, 1);
});

