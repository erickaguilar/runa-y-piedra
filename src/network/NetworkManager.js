import Peer from 'peerjs';
import * as Proto from './Protocol.js';
import { NetworkStats } from './NetworkStats.js';

export class NetworkManager extends EventTarget {
  constructor() {
    super();
    this.peer = null;
    this.connections = [];    // host: canales safe por peer (compat)
    this.hostConn = null;     // client: canal safe hacia el host
    this.hostHotConn = null;  // client: canal hot (unreliable) hacia el host
    this._links = new Map();  // peerId -> {safe, hot}
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
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', sendHostClosing);
      window.addEventListener('pagehide', sendHostClosing);
    }
    if (typeof document !== 'undefined') {
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
  }

  /** Config ICE: STUN público + TURN opcional vía ?turn=openrelay o localStorage (dungeon_turn_url/user/pass). */
  getIceConfig() {
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const turnParam = urlParams.get('turn');
        if (turnParam === 'openrelay' || turnParam === 'test') {
          iceServers.push(
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject',
            },
            {
              urls: 'turn:openrelay.metered.ca:443',
              username: 'openrelayproject',
              credential: 'openrelayproject',
            }
          );
        } else {
          const url = localStorage.getItem('dungeon_turn_url');
          const user = localStorage.getItem('dungeon_turn_user') || '';
          const pass = localStorage.getItem('dungeon_turn_pass') || '';
          if (url) {
            iceServers.push({ urls: url, username: user || undefined, credential: pass || undefined });
          }
        }
      }
    } catch { /* localStorage / window no disponible */ }
    return { iceServers };
  }

  static translatePeerError(e) {
    const type = e?.type || e?.message || '';
    if (type === 'peer-unavailable' || /peer-unavailable|taken|unavailable/i.test(String(type))) {
      return 'Sala no encontrada o PIN en uso. Revisa el PIN e inténtalo de nuevo.';
    }
    if (type === 'unavailable-id' || /unavailable-id/i.test(String(type))) {
      return 'PIN en uso, genera una sala nueva.';
    }
    if (type === 'network' || /network/i.test(String(type))) {
      return 'Error de red o NAT restrictivo. Prueba en la misma Wi-Fi o configura un TURN.';
    }
    if (type === 'server-error' || /server/i.test(String(type))) {
      return 'Servidor de señalización no disponible. Reintenta en unos segundos.';
    }
    return e?.message || String(e);
  }

  _newPeer(roomIdOrOpts, opts = {}) {
    let debugLevel = 0;
    try {
      if (typeof window !== 'undefined') {
        const p = new URLSearchParams(window.location.search);
        if (p.has('debug') || p.has('webrtc_debug')) {
          debugLevel = parseInt(p.get('webrtc_debug') || '3', 10);
        }
      }
    } catch { /* ignore */ }

    const base = { debug: debugLevel, config: this.getIceConfig() };
    if (typeof roomIdOrOpts === 'string') {
      return new Peer(roomIdOrOpts, { ...base, ...opts });
    }
    return new Peer({ ...base, ...roomIdOrOpts, ...opts });
  }

  _trackLink(conn, kind) {
    // kind: 'safe' | 'hot'. Agrupa ambos canales por peer remoto.
    const peerId = conn?.peer;
    if (!peerId) return null;
    if (!this._links) this._links = new Map();
    let link = this._links.get(peerId);
    if (!link) {
      link = {};
      this._links.set(peerId, link);
    }
    link[kind] = conn;
    return link;
  }

  _safeForConn(conn) {
    // Normaliza al canal safe para que PlayerManager/InputQueue usen una clave estable.
    const peerId = conn?.peer;
    const link = peerId && this._links?.get(peerId);
    if (link?.safe) return link.safe;
    return conn;
  }

  host(maxRetries = 5) {
    this.isHost = true;
    this._links = new Map();
    this.stats.setMode('HOST', 0);

    const tryPin = (attempt) => new Promise((resolve, reject) => {
      const pin = Math.floor(1000 + Math.random() * 9000);
      this.roomId = 'VOXELSALA-' + pin;
      if (this.peer) { try { this.peer.destroy(); } catch {} this.peer = null; }
      this.peer = this._newPeer(this.roomId);

      const onOpen = () => {
        cleanup();
        resolve(pin);
      };
      const onError = (e) => {
        const t = e?.type;
        if ((t === 'unavailable-id' || /taken/i.test(e?.message || '')) && attempt < maxRetries) {
          cleanup();
          tryPin(attempt + 1).then(resolve, reject);
          return;
        }
        cleanup();
        reject(new Error(NetworkManager.translatePeerError(e)));
      };
      const onConn = (conn) => this._setupHostChannel(conn);
      const cleanup = () => {
        this.peer?.off?.('open', onOpen);
        this.peer?.off?.('error', onError);
        this.peer?.off?.('connection', onConn);
      };
      this.peer.on('open', onOpen);
      this.peer.on('error', onError);
      this.peer.on('connection', onConn);
    });

    return tryPin(1);
  }

  _isHotChannel(conn) {
    const label = conn?.label || conn?.metadata?.channel || '';
    return /hot/i.test(label);
  }

  _setupHostChannel(conn) {
    const isHot = this._isHotChannel(conn);
    // Enlazar inmediatamente para que conn.peer esté disponible de inmediato
    this._trackLink(conn, isHot ? 'hot' : 'safe');

    conn.on('open', () => {
      const link = this._trackLink(conn, isHot ? 'hot' : 'safe');
      if (isHot) {
        // El canal hot es oportunista: no dispara peer-joined, solo se enlaza.
        if (link?.safe && link.safe.open) {
          // Ya unido: nada que hacer, el hot queda listo para INPUTs.
        }
        return;
      }
      this.connections.push(conn);
      this.stats.setMode('HOST', this.connections.length);
      this.dispatchEvent(new CustomEvent('peer-joined', { detail: { conn } }));
    });
    conn.on('data', (data) => this._handleIncoming(data, conn));
    conn.on('close', () => {
      if (isHot) {
        const link = this._links?.get(conn?.peer);
        if (link) {
          link.hot = null;
          link.hotReady = false;
        }
        return; // el peer sigue unido por el canal safe (fallback)
      }
      this.connections = this.connections.filter(c => c !== conn);
      const link = this._links?.get(conn?.peer);
      if (link) this._links.delete(conn.peer);
      this.stats.setMode('HOST', this.connections.length);
      this.dispatchEvent(new CustomEvent('peer-left', { detail: { conn } }));
    });
  }

  join(pin, { timeoutMs = 12000 } = {}) {
    this.isHost = false;
    this._links = new Map();
    if (this.peer) { try { this.peer.destroy(); } catch {} }
    this.peer = this._newPeer({});
    this.hostHotConn = null;

    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error(`Tiempo de espera agotado (${timeoutMs / 1000}s). Revisa PIN y Wi-Fi.`));
        }
      }, timeoutMs);
      const done = (fn, val) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn(val);
      };

      this.peer.on('open', () => {
        const room = 'VOXELSALA-' + pin;
        // Canal fiable para eventos (INIT, DOOR, CHEST, ...)
        const safe = this.peer.connect(room, {
          label: 'game-safe',
          reliable: true,
          serialization: 'binary',
        });
        // Canal no fiable para hot-path (INPUT/SNAPSHOT/PING): sin reintentos,
        // un paquete perdido lo reemplaza el siguiente tick (30/20 Hz).
        const hot = this.peer.connect(room, {
          label: 'game-hot',
          reliable: false,
          serialization: 'binary',
        });

        this._trackLink(safe, 'safe');
        this._trackLink(hot, 'hot');

        // Escuchar datos de inmediato para no perder paquetes de negociación inicial
        safe.on('data', (d) => this._handleIncoming(d, safe));
        safe.on('error', (e) => done(reject, new Error(NetworkManager.translatePeerError(e))));

        hot.on('data', (d) => this._handleIncoming(d, hot));
        hot.on('error', () => { /* oportunista: fallback a safe */ });

        safe.on('open', () => {
          this.hostConn = safe;
          this._trackLink(safe, 'safe');
          this.stats.setMode('CLIENT', 1);

          // Iniciar sonda periódica de latencia (Ping RTT cada 1000ms, por hot si hay)
          if (this._pingInterval) clearInterval(this._pingInterval);
          this._pingInterval = setInterval(() => {
            const pingBuf = Proto.serializePing(performance.now());
            this.sendToHostHot(pingBuf);
          }, 1000);

          done(resolve);
        });

        hot.on('open', () => {
          this.hostHotConn = hot;
          this._trackLink(hot, 'hot');
        });
        hot.on('close', () => {
          if (this.hostHotConn === hot) this.hostHotConn = null;
        });
      });
      this.peer.on('error', (e) => done(reject, new Error(NetworkManager.translatePeerError(e))));
    });
  }

  /** Info de diagnóstico para UI: ¿hay hot o estamos en fallback safe? */
  getLinkInfo() {
    if (this.isHost) {
      let hot = 0;
      for (const [, link] of this._links || []) {
        if (link?.hot?.open) hot++;
      }
      return { mode: 'HOST', peers: this.connections.length, hotPeers: hot, fallback: hot < this.connections.length };
    }
    const safeOpen = !!this.hostConn?.open;
    const hotOpen = !!this.hostHotConn?.open;
    return { mode: 'CLIENT', safeOpen, hotOpen, fallback: safeOpen && !hotOpen };
  }

  _handleIncoming(data, conn) {
    let buf;
    if (data instanceof ArrayBuffer) {
      buf = data;
    } else if (ArrayBuffer.isView(data)) {
      buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    } else if (data?.buffer instanceof ArrayBuffer) {
      buf = data.buffer;
    } else {
      buf = data;
    }
    if (!buf || buf.byteLength < 1) return;
    this.stats.recordPacketIn(buf.byteLength);

    const isHot = this._isHotChannel(conn);
    const peerId = conn?.peer;
    if (isHot && peerId && this._links) {
      const link = this._links.get(peerId);
      if (link) link.hotReady = true;
    }

    // Normalizar al canal safe para claves estables (PlayerManager/InputQueue).
    const logicalConn = this.isHost ? this._safeForConn(conn) : conn;

    const v = new DataView(buf);
    const type = v.getUint8(0);

    switch (type) {
      case Proto.MSG.INPUT: {
        const m = Proto.deserializeInput(buf);
        m.conn = logicalConn;
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
        // (por hot si existe para no bloquear el canal fiable).
        if (this.isHost) {
          const p = Proto.deserializePing(buf);
          this.sendToHot(logicalConn, Proto.serializePong(p.time));
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
        m.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('block-edit', { detail: m }));
        break;
      }

      case Proto.MSG.DOOR: {
        const d = Proto.deserializeDoorOpen(buf);
        this.dispatchEvent(new CustomEvent('door-open', { detail: { doorId: d.doorId, conn: logicalConn } }));
        break;
      }

      case Proto.MSG.PLAYER_META: {
        const m = Proto.deserializePlayerMeta(buf);
        m.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('player-meta', { detail: m }));
        break;
      }

      case Proto.MSG.CHEST_OPEN: {
        const c = Proto.deserializeChestOpen(buf);
        this.dispatchEvent(new CustomEvent('chest-open', { detail: { chestId: c.chestId, conn: logicalConn } }));
        break;
      }

      case Proto.MSG.DESCENT: {        const d = Proto.deserializeDescent(buf);
        // NOW solo lo procesa el Host; START/GO solo los clientes
        // (el Host ejecuta su propio descenso en local).
        if (d.kind === Proto.DESCENT_KIND.NOW && !this.isHost) break;
        if (d.kind !== Proto.DESCENT_KIND.NOW && this.isHost) break;
        d.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('descent', { detail: d }));
        break;
      }

      case Proto.MSG.STAIRS: {
        const s = Proto.deserializeStairs(buf);
        // REQ solo lo procesa el Host; OPEN solo los clientes.
        if (s.kind === Proto.STAIRS_KIND.REQ && !this.isHost) break;
        if (s.kind !== Proto.STAIRS_KIND.REQ && this.isHost) break;
        s.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('stairs', { detail: s }));
        break;
      }

      case Proto.MSG.PEDESTAL: {
        const p = Proto.deserializePedestal(buf);
        // Peticiones solo las procesa el Host; ceremonias solo los clientes
        // (el Host ejecuta su propia ceremonia en local sin pasar por la red).
        if (p.isRequest && !this.isHost) break;
        if (!p.isRequest && this.isHost) break;
        p.conn = logicalConn;
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

  /** Hot-path Host -> clientes: SNAPSHOT/PONG por canal unreliable, fallback a safe. */
  broadcastHot(buf) {
    let n = 0;
    for (const [, link] of this._links || []) {
      const hot = link?.hot;
      const safe = link?.safe;
      // Solo enviar por hot si está abierto Y ha confirmado recepción bidireccional (hotReady)
      if (hot?.open && link.hotReady) {
        hot.send(buf);
        n++;
      } else if (safe?.open) {
        safe.send(buf); // fallback seguro al canal fiable
        n++;
      }
    }
    // Compat: si aún no hay links (versión vieja de un solo canal), usar connections.
    if (n === 0) {
      for (const c of this.connections) {
        if (c.open) { c.send(buf); n++; }
      }
    }
    if (n > 0) this.stats.recordPacketOut(buf.byteLength * n);
  }

  /** Hot-path hacia un peer concreto (PONG), con fallback a safe. */
  sendToHot(safeConn, buf) {
    const peerId = safeConn?.peer;
    const link = peerId && this._links?.get(peerId);
    const hot = link?.hot;
    if (hot?.open) {
      this.stats.recordPacketOut(buf.byteLength);
      hot.send(buf);
      return;
    }
    this.sendTo(safeConn, buf);
  }

  /** Hot-path Cliente -> Host: INPUT/PING por unreliable, fallback a safe. */
  sendToHostHot(buf) {
    if (this.hostHotConn?.open) {
      this.stats.recordPacketOut(buf.byteLength);
      this.hostHotConn.send(buf);
      return;
    }
    this.sendToHost(buf);
  }

  disconnect() {
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
    if (this.hostConn) {
      try { this.hostConn.close(); } catch {}
      this.hostConn = null;
    }
    if (this.hostHotConn) {
      try { this.hostHotConn.close(); } catch {}
      this.hostHotConn = null;
    }
    for (const c of this.connections) {
      try { c.close(); } catch {}
    }
    for (const [, link] of this._links || []) {
      if (link?.hot && !this.connections.includes(link.hot)) {
        try { link.hot.close(); } catch {}
      }
    }
    this.connections = [];
    this._links = new Map();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.stats.setMode('OFFLINE', 0);
  }
}
