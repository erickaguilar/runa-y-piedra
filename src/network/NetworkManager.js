import Peer from 'peerjs';
import * as Proto from './Protocol.js';
import { NetworkStats } from './NetworkStats.js';

export class NetworkManager extends EventTarget {
  constructor() {
    super();
    this.peer = null;
    this.connections = [];    // host: peers conectados
    this.hostConn = null;     // client: canal hacia el host
    this.isHost = false;
    this.roomId = null;

    // Monitor y telemetría de red (?debug=1)
    this.stats = new NetworkStats({ protocolVersion: Proto.PROTOCOL_VERSION });
    this._pingInterval = null;

    // Notificar cierre ordenado a peers cuando el anfitrión cierra la ventana o sale de la app
    let closingSent = false;
    const sendHostClosing = () => {
      if (this.isHost && this.connections.length > 0 && !closingSent) {
        closingSent = true;
        this.broadcast(Proto.serializeHostClosing(0));
      }
    };
    window.addEventListener('beforeunload', sendHostClosing);
    window.addEventListener('pagehide', sendHostClosing);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.isHost) {
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            sendHostClosing();
          }
        }, 2500);
      }
    });
  }

  host() {
    this.isHost = true;
    const pin = Math.floor(1000 + Math.random() * 9000);
    this.roomId = 'VOXELSALA-' + pin;
    this.stats.setMode('HOST', 0);

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
      this.stats.setMode('HOST', this.connections.length);
      this.dispatchEvent(new CustomEvent('peer-joined', { detail: { conn } }));
    });
    conn.on('data', (data) => this._handleIncoming(data, conn));
    conn.on('close', () => {
      this.connections = this.connections.filter(c => c !== conn);
      this.stats.setMode('HOST', this.connections.length);
      this.dispatchEvent(new CustomEvent('peer-left', { detail: { conn } }));
    });
  }

  join(pin) {
    this.isHost = false;
    this.peer = new Peer({ debug: 0 });
    return new Promise((resolve, reject) => {
      this.peer.on('open', () => {
        // Canales ordenados y fiables para evitar pérdida y congelamiento
        const conn = this.peer.connect('VOXELSALA-' + pin, {
          reliable: true,
          serialization: 'binary',
        });
        const onErr = (e) => reject(e);
        conn.on('error', onErr);
        conn.on('open', () => {
          conn.off('error', onErr);
          this.hostConn = conn;
          this.stats.setMode('CLIENT', 1);

          // Iniciar sonda periódica de latencia (Ping RTT cada 1000ms)
          if (this._pingInterval) clearInterval(this._pingInterval);
          this._pingInterval = setInterval(() => {
            if (this.hostConn?.open) {
              const pingBuf = Proto.serializePing(performance.now());
              this.sendToHost(pingBuf);
            }
          }, 1000);

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
    this.stats.recordPacketIn(buf.byteLength);

    const v = new DataView(buf);
    const type = v.getUint8(0);

    switch (type) {
      case Proto.MSG.INPUT: {
        const m = Proto.deserializeInput(buf);
        m.conn = conn;
        this.dispatchEvent(new CustomEvent('input', { detail: m }));
        break;
      }

      case Proto.MSG.SNAPSHOT: {
        const s = Proto.deserializeSnapshot(buf);
        this.stats.recordSnapshotSeq(s.seq);
        this.dispatchEvent(new CustomEvent('snapshot', {
          detail: {
            players: s.players,
            seq: s.seq,
            time: s.time,
          }
        }));
        break;
      }

      case Proto.MSG.PING: {
        // El Host responde de inmediato con PONG y el mismo timestamp del cliente
        if (this.isHost) {
          const p = Proto.deserializePing(buf);
          this.sendTo(conn, Proto.serializePong(p.time));
        }
        break;
      }

      case Proto.MSG.PONG: {
        // El cliente calcula el RTT exacto
        const p = Proto.deserializePong(buf);
        const rtt = Math.round(performance.now() - p.time);
        this.stats.recordRtt(rtt);
        this.dispatchEvent(new CustomEvent('rtt-update', { detail: { rtt } }));
        break;
      }

      case Proto.MSG.INIT: {
        const init = Proto.deserializeInit(buf);
        // Comprobación estricta de versión del protocolo
        if (init.version !== Proto.PROTOCOL_VERSION) {
          this.dispatchEvent(new CustomEvent('version-mismatch', {
            detail: {
              hostVersion: init.version,
              clientVersion: Proto.PROTOCOL_VERSION,
            }
          }));
          return;
        }
        this.dispatchEvent(new CustomEvent('init', { detail: init }));
        break;
      }

      case Proto.MSG.HOST_CLOSING: {
        this.dispatchEvent(new CustomEvent('host-closing', { detail: Proto.deserializeHostClosing(buf) }));
        break;
      }

      case Proto.MSG.LEVEL_CHANGE: {
        const lvl = Proto.deserializeLevelChange(buf);
        this.dispatchEvent(new CustomEvent('level-change', { detail: lvl }));
        break;
      }

      case Proto.MSG.BLOCK: {
        const m = Proto.deserializeBlock(buf);
        m.conn = conn;
        this.dispatchEvent(new CustomEvent('block-edit', { detail: m }));
        break;
      }

      case Proto.MSG.DOOR: {
        const d = Proto.deserializeDoorOpen(buf);
        this.dispatchEvent(new CustomEvent('door-open', { detail: { doorId: d.doorId, conn } }));
        break;
      }

      case Proto.MSG.PLAYER_META: {
        const m = Proto.deserializePlayerMeta(buf);
        m.conn = conn;
        this.dispatchEvent(new CustomEvent('player-meta', { detail: m }));
        break;
      }

      case Proto.MSG.CHEST_OPEN: {
        const c = Proto.deserializeChestOpen(buf);
        this.dispatchEvent(new CustomEvent('chest-open', { detail: { chestId: c.chestId, conn } }));
        break;
      }

      case Proto.MSG.DESCENT: {        const d = Proto.deserializeDescent(buf);
        // NOW solo lo procesa el Host; START/GO solo los clientes
        // (el Host ejecuta su propio descenso en local).
        if (d.kind === Proto.DESCENT_KIND.NOW && !this.isHost) break;
        if (d.kind !== Proto.DESCENT_KIND.NOW && this.isHost) break;
        d.conn = conn;
        this.dispatchEvent(new CustomEvent('descent', { detail: d }));
        break;
      }

      case Proto.MSG.STAIRS: {
        const s = Proto.deserializeStairs(buf);
        // REQ solo lo procesa el Host; OPEN solo los clientes.
        if (s.kind === Proto.STAIRS_KIND.REQ && !this.isHost) break;
        if (s.kind !== Proto.STAIRS_KIND.REQ && this.isHost) break;
        s.conn = conn;
        this.dispatchEvent(new CustomEvent('stairs', { detail: s }));
        break;
      }

      case Proto.MSG.PEDESTAL: {
        const p = Proto.deserializePedestal(buf);
        // Peticiones solo las procesa el Host; ceremonias solo los clientes
        // (el Host ejecuta su propia ceremonia en local sin pasar por la red).
        if (p.isRequest && !this.isHost) break;
        if (!p.isRequest && this.isHost) break;
        p.conn = conn;
        this.dispatchEvent(new CustomEvent('pedestal', { detail: p }));
        break;
      }

      case Proto.MSG.KEY: {
        // Solo el Host otorga llaves: los clientes ignoran KEY entrantes no solicitados
        // y el Host ignora KEY de clientes (anti-trampas: nadie se auto-otorga llaves).
        if (this.isHost) break;
        const k = Proto.deserializeKeyUpdate(buf);
        this.dispatchEvent(new CustomEvent('key-update', { detail: k }));
        break;
      }
    }
  }

  sendToHost(buf) {
    if (this.hostConn?.open) {
      this.stats.recordPacketOut(buf.byteLength);
      this.hostConn.send(buf);
    }
  }

  sendTo(conn, buf) {
    if (conn?.open) {
      this.stats.recordPacketOut(buf.byteLength);
      conn.send(buf);
    }
  }

  broadcast(buf) {
    if (this.connections.length > 0) {
      this.stats.recordPacketOut(buf.byteLength * this.connections.length);
    }
    for (const c of this.connections) {
      if (c.open) c.send(buf);
    }
  }

  disconnect() {
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
    if (this.hostConn) {
      this.hostConn.close();
      this.hostConn = null;
    }
    for (const c of this.connections) {
      c.close();
    }
    this.connections = [];
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.stats.setMode('OFFLINE', 0);
  }
}
