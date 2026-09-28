import Peer from 'peerjs';
import * as Proto from './Protocol.js';

export class NetworkManager extends EventTarget {
  constructor() {
    super();
    this.peer = null;
    this.connections = [];    // host: peers conectados
    this.hostConn = null;     // client: canal hacia el host
    this.isHost = false;
    this.roomId = null;
  }

  host() {
    this.isHost = true;
    const pin = Math.floor(1000 + Math.random() * 9000);
    this.roomId = 'VOXELSALA-' + pin;

    this.peer = new Peer(this.roomId, { debug: 0 });

    return new Promise((resolve, reject) => {
      this.peer.on('open', () => resolve(pin));
      this.peer.on('error', (e) => reject(e));
      this.peer.on('connection', (conn) => this._setupHostChannel(conn));
    });
  }

  _setupHostChannel(conn) {
    conn.on('open', () => {
      this.connections.push(conn);
      this.dispatchEvent(new CustomEvent('peer-joined', { detail: { conn } }));
    });
    conn.on('data', (data) => this._handleIncoming(data, conn));
    conn.on('close', () => {
      this.connections = this.connections.filter(c => c !== conn);
      this.dispatchEvent(new CustomEvent('peer-left', { detail: { conn } }));
    });
  }

  join(pin) {
    this.isHost = false;
    this.peer = new Peer({ debug: 0 });
    return new Promise((resolve, reject) => {
      this.peer.on('open', () => {
        // ordered:false + maxRetransmits:0 ≈ UDP mode
        const conn = this.peer.connect('VOXELSALA-' + pin, {
          reliable: false,
          serialization: 'binary',
        });
        const onErr = (e) => reject(e);
        conn.on('error', onErr);
        conn.on('open', () => {
          conn.off('error', onErr);
          this.hostConn = conn;
          conn.on('data', (d) => this._handleIncoming(d, conn));
          resolve();
        });
      });
      this.peer.on('error', reject);
    });
  }

  _handleIncoming(data, conn) {
    // PeerJS binary entrega ArrayBuffer
    const buf = data instanceof ArrayBuffer ? data : data.buffer || data;
    const v = new DataView(buf);
    const type = v.getUint8(0);
    switch (type) {
      case Proto.MSG.INPUT: {
        const m = Proto.deserializeInput(buf); m.conn = conn;
        this.dispatchEvent(new CustomEvent('input', { detail: m }));
        break;
      }
      case Proto.MSG.SNAPSHOT: {
        this.dispatchEvent(new CustomEvent('snapshot', { detail: Proto.deserializeSnapshot(buf) }));
        break;
      }
      case Proto.MSG.BLOCK: {
        const m = Proto.deserializeBlock(buf); m.conn = conn;
        this.dispatchEvent(new CustomEvent('block-edit', { detail: m }));
        break;
      }
      case Proto.MSG.INIT: {
        this.dispatchEvent(new CustomEvent('init', { detail: Proto.deserializeInit(buf) }));
        break;
      }
    }
  }

  sendToHost(buf) { if (this.hostConn?.open) this.hostConn.send(buf); }
  sendTo(conn, buf) { if (conn?.open) conn.send(buf); }
  broadcast(buf) { for (const c of this.connections) if (c.open) c.send(buf); }
}
