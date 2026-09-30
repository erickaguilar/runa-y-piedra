import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NET_CONFIG } from '../src/config/constants.js';
import { MSG } from '../src/network/Protocol.js';

// P0 red: el hot-path (alta frecuencia, tolerante a pérdida) debe ir por el
// canal unreliable; los eventos raros van por el canal fiable.
describe('P0: enrutado de canales duales WebRTC', () => {
  it('HOT_MSGS contiene INPUT, SNAPSHOT, PING y PONG', () => {
    for (const m of [MSG.INPUT, MSG.SNAPSHOT, MSG.PING, MSG.PONG]) {
      assert.ok(NET_CONFIG.HOT_MSGS.includes(m), `MSG ${m} debe ser hot`);
    }
  });

  it('eventos raros NO van por hot (INIT, DOOR, CHEST, KEY, LEVEL_CHANGE)', () => {
    for (const m of [MSG.INIT, MSG.DOOR, MSG.CHEST_OPEN, MSG.KEY, MSG.LEVEL_CHANGE, MSG.PLAYER_META]) {
      assert.ok(!NET_CONFIG.HOT_MSGS.includes(m), `MSG ${m} debe ser safe/reliable`);
    }
  });

  it('nombres de canal safe/hot definidos y distintos', () => {
    assert.ok(NET_CONFIG.CHANNEL_SAFE);
    assert.ok(NET_CONFIG.CHANNEL_HOT);
    assert.notEqual(NET_CONFIG.CHANNEL_SAFE, NET_CONFIG.CHANNEL_HOT);
  });

  it('timeout y reintentos de join configurados', () => {
    assert.ok(NET_CONFIG.JOIN_TIMEOUT_MS >= 5000, 'timeout mínimo 5s para móvil');
    assert.ok(NET_CONFIG.JOIN_RETRIES >= 2, 'al menos 1 reintento');
  });

  it('host() mantiene el listener connection activo tras resolver', async () => {
    const { NetworkManager } = await import('../src/network/NetworkManager.js');
    const { EventEmitter } = await import('node:events');

    const net = new NetworkManager();
    const fakePeer = new EventEmitter();
    fakePeer.destroy = () => {};
    net._newPeer = () => fakePeer;

    const hostPromise = net.host();
    fakePeer.emit('open');
    const pin = await hostPromise;

    assert.ok(pin >= 1000 && pin <= 9999);
    assert.equal(fakePeer.listenerCount('connection'), 1, 'El listener de conexión entrante DEBE permanecer activo');
    net.disconnect();
  });

  it('host() maneja disconnected y reconecta automáticamente', async () => {
    const { NetworkManager } = await import('../src/network/NetworkManager.js');
    const { EventEmitter } = await import('node:events');

    const net = new NetworkManager();
    const fakePeer = new EventEmitter();
    fakePeer.destroy = () => {};
    let reconnected = false;
    fakePeer.reconnect = () => { reconnected = true; };
    net._newPeer = () => fakePeer;

    const hostPromise = net.host();
    fakePeer.emit('open');
    await hostPromise;

    fakePeer.disconnected = true;
    fakePeer.emit('disconnected');

    // El debounce es de 800ms
    await new Promise((r) => setTimeout(r, 950));
    assert.equal(reconnected, true, 'Debe llamar a peer.reconnect() tras desconexión');
    net.disconnect();
  });

  it('translatePeerError traduce peer-unavailable y Could not connect to peer con contexto útil', async () => {
    const { NetworkManager } = await import('../src/network/NetworkManager.js');
    const err1 = new Error('Could not connect to peer VOXELSALA-5239');
    err1.type = 'peer-unavailable';
    const msg1 = NetworkManager.translatePeerError(err1);
    assert.ok(msg1.includes('sala no encontrada'), 'Debe mencionar sala no encontrada');
    assert.ok(msg1.includes('pantalla apagada') || msg1.includes('segundo plano'), 'Debe sugerir que el host puede estar dormido/segundo plano');

    const err2 = { message: 'Could not connect to peer VOXELSALA-1234' };
    const msg2 = NetworkManager.translatePeerError(err2);
    assert.ok(msg2.includes('sala no encontrada'));
  });

  it('_checkSignalingHealth invoca reconnect() si el peer está desconectado', async () => {
    const { NetworkManager } = await import('../src/network/NetworkManager.js');
    const net = new NetworkManager();
    let reconnected = false;
    net.peer = {
      destroyed: false,
      disconnected: true,
      destroy: () => {},
      reconnect: () => { reconnected = true; }
    };

    net._checkSignalingHealth();
    await new Promise((r) => setTimeout(r, 950));
    assert.equal(reconnected, true);
    net.disconnect();
  });
});
