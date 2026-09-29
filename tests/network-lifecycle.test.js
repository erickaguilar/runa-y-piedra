import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { NetworkManager } from '../src/network/NetworkManager.js';
import { InputQueue } from '../src/network/InputQueue.js';
import { PlayerManager } from '../src/entities/PlayerManager.js';
import { SimulationEngine } from '../src/simulation/SimulationEngine.js';
import { World } from '../src/core/World.js';
import { ClientReconciler } from '../src/network/ClientReconciler.js';
import * as Proto from '../src/network/Protocol.js';

/**
 * Mock de DataConnection que emula exactamente la interfaz y comportamiento
 * de PeerJS (eventos 'open', 'data', 'close', 'error', propiedades peer, label, open).
 */
class MockDataConnection extends EventEmitter {
  constructor(peerId, label, reliable = true) {
    super();
    this.peer = peerId;
    this.label = label;
    this.reliable = reliable;
    this.open = false;
    this.paired = null;
  }

  send(data) {
    if (!this.open || !this.paired) {
      throw new Error('Connection not open');
    }
    // Entregar como ArrayBuffer / slice de forma asíncrona (microtask) como WebRTC
    const copy = data instanceof ArrayBuffer ? data.slice(0) : data;
    queueMicrotask(() => {
      if (this.paired && this.paired.open) {
        this.paired.emit('data', copy);
      }
    });
  }

  close() {
    this.open = false;
    this.emit('close');
    if (this.paired) {
      this.paired.open = false;
      this.paired.emit('close');
    }
  }

  static createPair(peerA, peerB, label, reliable = true) {
    const connA = new MockDataConnection(peerB, label, reliable);
    const connB = new MockDataConnection(peerA, label, reliable);
    connA.paired = connB;
    connB.paired = connA;
    return [connA, connB];
  }
}

describe('Test de Integración End-to-End: Ciclo de Vida Multijugador WebRTC', () => {
  it('handshake dual-channel, encolado cruzado hot/safe, física y reconciliación', async () => {
    const hostPeerId = 'VOXELSALA-7777';
    const clientPeerId = 'client-peer-alpha';

    // 1. Instancias completas de Host y Cliente
    const hostNet = new NetworkManager();
    hostNet.isHost = true;
    hostNet._links = new Map();

    const hostPM = new PlayerManager();
    hostPM.setLocalId(0);
    const hostWorld = new World();
    const hostSim = new SimulationEngine(hostWorld, {});
    const hostQueue = new InputQueue();

    const clientPM = new PlayerManager();
    assert.equal(clientPM.localPlayer.id, -1, 'Cliente arranca con id -1 (no asignado)');
    const clientWorld = new World();
    const clientSim = new SimulationEngine(clientWorld, {});
    const clientRec = new ClientReconciler();

    // 2. Crear pares de canales seguros (safe) y rápidos (hot)
    const [clientSafe, hostSafe] = MockDataConnection.createPair(clientPeerId, hostPeerId, 'game-safe', true);
    const [clientHot, hostHot] = MockDataConnection.createPair(clientPeerId, hostPeerId, 'game-hot', false);

    // 3. Simular interleave asíncrono real: el canal HOT llega a Host ANTES del evento open de SAFE
    hostNet._setupHostChannel(hostSafe);
    hostNet._setupHostChannel(hostHot);

    // Canal hot abre primero en el Host
    hostHot.open = true;
    hostHot.emit('open');

    // Ahora safe abre en el Host -> dispara peer-joined
    let remotePlayerOnHost = null;
    hostNet.addEventListener('peer-joined', (e) => {
      remotePlayerOnHost = hostPM.addRemotePlayer(e.detail.conn, 'Invitado', 1);
    });
    hostSafe.open = true;
    hostSafe.emit('open');

    assert.ok(remotePlayerOnHost, 'Host debe haber creado remotePlayer al abrir safe');
    assert.equal(remotePlayerOnHost.id, 1);

    // 4. En el Host, escuchar evento input y encolar en hostQueue
    hostNet.addEventListener('input', (e) => {
      hostQueue.enqueue(e.detail.conn, e.detail);
    });

    // 5. Configurar canales en el cliente
    clientSafe.open = true;
    clientHot.open = true;

    // Conectar recepción del cliente
    clientSafe.on('data', (d) => {
      const v = new DataView(d);
      if (v.getUint8(0) === Proto.MSG.INIT) {
        const init = Proto.deserializeInit(d);
        clientPM.setLocalId(init.playerId);
      }
    });

    // Host envía INIT por safe
    hostSafe.send(Proto.serializeInit(hostWorld.blocks, remotePlayerOnHost.id));
    await new Promise((r) => setTimeout(r, 20));

    assert.equal(clientPM.localPlayer.id, 1, 'Cliente debe haber adoptado id 1 tras recibir INIT');

    // 6. Cliente envía INPUT a 30Hz por el canal HOT
    const initialZ = remotePlayerOnHost.pos.z;
    const inputBuf = Proto.serializeInput(1, 0, 1.0, 0, 0); // Avanzar forward=+1.0
    clientHot.send(inputBuf);
    await new Promise((r) => setTimeout(r, 20));

    // 7. Bucle de física del Host: desencolar usando safeConn desde connToPlayerId
    for (const [conn, pid] of hostPM.connToPlayerId.entries()) {
      assert.equal(conn, hostSafe, 'connToPlayerId debe contener el canal safe');
      const input = hostQueue.dequeue(conn);
      assert.ok(input, 'InputQueue debe desencolar el paquete enviado por hot usando safeConn');
      assert.equal(input.seq, 1);

      remotePlayerOnHost.setInput(input.dz, input.dx, input.yaw);
      remotePlayerOnHost.lastInputSeq = input.seq;
      hostSim.integratePlayer(remotePlayerOnHost, 1 / 30, input.actions);
    }

    // Comprobar que el jugador remoto en el Host SE MOVIÓ hacia adelante
    assert.notEqual(remotePlayerOnHost.pos.z, initialZ, 'El jugador remoto debe haberse desplazado en la simulación del host');

    // 8. Host genera y difunde SNAPSHOT por broadcastHot
    let receivedSnapshot = null;
    clientHot.on('data', (d) => {
      const v = new DataView(d);
      if (v.getUint8(0) === Proto.MSG.SNAPSHOT) {
        receivedSnapshot = Proto.deserializeSnapshot(d);
      }
    });

    const snaps = hostPM.getSnapshots();
    hostNet.broadcastHot(Proto.serializeSnapshot(1, snaps));
    await new Promise((r) => setTimeout(r, 20));

    assert.ok(receivedSnapshot, 'Cliente debe haber recibido el snapshot por broadcastHot');
    assert.equal(receivedSnapshot.players.length, 2, 'Snapshot debe incluir anfitrión e invitado');

    // 9. Reconciliación en el cliente: confirmar que el cliente valida su id 1
    const localCli = clientPM.localPlayer;
    clientRec.onSnapshot(receivedSnapshot.time, receivedSnapshot.players, localCli, clientSim);
    assert.equal(clientRec.remoteSnapshots.has(0), true, 'El buffer remoto debe registrar al Host (id=0)');
    assert.equal(clientRec.remoteSnapshots.has(1), false, 'El buffer remoto NO debe contener al jugador local (id=1)');

    // 10. Desconexión ordenada
    let peerLeftCalled = false;
    hostNet.addEventListener('peer-left', (e) => {
      peerLeftCalled = true;
      hostQueue.remove(e.detail.conn);
      hostPM.removeByConnection(e.detail.conn);
    });

    clientSafe.close();
    assert.ok(peerLeftCalled, 'Host debe haber recibido peer-left al cerrar safe');
    assert.equal(hostPM.getAllPlayers().length, 1, 'Solo debe quedar el Host en la partida');
    assert.equal(hostQueue.dequeue(hostSafe), null, 'InputQueue debe haberse limpiado');
  });
});
