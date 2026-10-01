import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { NetworkManager } from '../src/network/NetworkManager.js';
import { buildWorldSnapshot } from '../src/network/HostSnapshot.js';
import * as Proto from '../src/network/Protocol.js';

class MockConn extends EventEmitter {
  constructor(peer, label, reliable = true) {
    super();
    this.peer = peer;
    this.label = label;
    this.reliable = reliable;
    this.open = true;
    this.paired = null;
    this.sent = [];
  }
  send(data) {
    this.sent.push(data);
    const copy = data instanceof ArrayBuffer ? data.slice(0) : data;
    queueMicrotask(() => this.paired?.emit('data', copy));
  }
  static pair(a, b, label, reliable = true) {
    const x = new MockConn(b, label, reliable);
    const y = new MockConn(a, label, reliable);
    x.paired = y;
    y.paired = x;
    return [x, y];
  }
}

describe('Migración de host: world-snapshot host->guest con respaldo en sessionStorage', () => {
  it('el guest recibe, guarda y puede reanudar nivel+puertas+cofres', async () => {
    const store = new Map();
    globalThis.sessionStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    };
    try {
      const hostNet = new NetworkManager();
      hostNet.isHost = true;
      hostNet._links = new Map();
      const guestNet = new NetworkManager();
      guestNet.isHost = false;
      guestNet._links = new Map();

      const [guestSafe, hostSafe] = MockConn.pair('guest', 'host', 'game-safe', true);
      hostNet._setupHostChannel(hostSafe);
      hostSafe.open = true;
      hostSafe.emit('open');
      guestSafe.on('data', (d) => guestNet._handleIncoming(d, guestSafe));

      let received = null;
      guestNet.addEventListener('world-snapshot', (e) => { received = e.detail; });

      const snap = buildWorldSnapshot({ levelId: 'dungeon_classic', doorsOpen: [1], chestsOpen: [2], stairsOpen: false });
      hostNet.broadcast(Proto.serializeWorldSnapshot(snap));
      await new Promise((r) => setTimeout(r, 20));

      assert.ok(received, 'guest debe recibir world-snapshot');
      assert.equal(received.levelId, 'dungeon_classic');
      assert.deepEqual(received.doorsOpen, [1]);
      assert.deepEqual(received.chestsOpen, [2]);
      const saved = JSON.parse(store.get('runa_world_snapshot_v1'));
      assert.equal(saved.levelId, 'dungeon_classic');
    } finally {
      delete globalThis.sessionStorage;
    }
  });
});
