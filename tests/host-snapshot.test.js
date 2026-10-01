import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWorldSnapshot,
  isValidWorldSnapshot,
  saveWorldSnapshot,
  loadWorldSnapshot,
  clearWorldSnapshot,
} from '../src/network/HostSnapshot.js';
import * as Proto from '../src/network/Protocol.js';

describe('HostSnapshot - foto de mazmorra para host-migration', () => {
  it('normaliza puertas/cofres (dedup + orden) e incluye chapterId', () => {
    const snap = buildWorldSnapshot({ levelId: 'dungeon_classic', chapterId: 'capitulo_1', doorsOpen: [2, 1, 1], chestsOpen: [3, 1], stairsOpen: true });
    assert.equal(snap.v, 1);
    assert.equal(snap.chapterId, 'capitulo_1');
    assert.deepEqual(snap.doorsOpen, [1, 2]);
    assert.deepEqual(snap.chestsOpen, [1, 3]);
    assert.equal(snap.stairsOpen, true);
    assert.ok(isValidWorldSnapshot(snap));
  });

  it('rechaza snapshots inválidos', () => {
    assert.equal(isValidWorldSnapshot(null), false);
    assert.equal(isValidWorldSnapshot({}), false);
    assert.equal(isValidWorldSnapshot({ v: 1, levelId: '', doorsOpen: [], chestsOpen: [] }), false);
  });

  it('roundtrip por sessionStorage (mock)', () => {
    const store = new Map();
    globalThis.sessionStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    };
    try {
      const snap = buildWorldSnapshot({ levelId: 'abyss_throne', doorsOpen: [1], chestsOpen: [] });
      assert.equal(saveWorldSnapshot(snap), true);
      const loaded = loadWorldSnapshot();
      assert.deepEqual(loaded.doorsOpen, [1]);
      assert.equal(loaded.levelId, 'abyss_throne');
      clearWorldSnapshot();
      assert.equal(loadWorldSnapshot(), null);
    } finally {
      delete globalThis.sessionStorage;
    }
  });

  it('protocolo WORLD_SNAPSHOT hace roundtrip binario', () => {
    const snap = buildWorldSnapshot({ levelId: 'crypt_inferno', doorsOpen: [1, 2], chestsOpen: [1], stairsOpen: false });
    const buf = Proto.serializeWorldSnapshot(snap);
    assert.equal(new DataView(buf).getUint8(0), Proto.MSG.WORLD_SNAPSHOT);
    const back = Proto.deserializeWorldSnapshot(buf);
    assert.equal(back.levelId, 'crypt_inferno');
    assert.deepEqual(back.doorsOpen, [1, 2]);
  });
});
