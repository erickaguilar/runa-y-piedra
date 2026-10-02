import Peer from 'peerjs';
import * as Proto from './Protocol.js';
import { NetworkStats } from './NetworkStats.js';
import { ICE_SERVERS, getIceConfig, translatePeerError } from './SignalingConfig.js';
import { isHotChannel, trackLink, safeForConn } from './ChannelLinks.js';
import { saveWorldSnapshot } from './HostSnapshot.js';

export { ICE_SERVERS };

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
    this.peerRoster = [];
    this._pingInterval = null;
    this._signalingHeartbeat = null;
    this._reconnectTimer = null;
    this._worldSnapshotTimer = null;

    if (typeof window !== 'undefined') {
      window.network = this;
    }

    // Notificar cierre ordenado a peers cuando el anfitrión cierra la ventana o sale definitivamente de la app
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
      window.addEventListener('online', () => {
        this._checkSignalingHealth();
      });
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this._checkSignalingHealth();
        }
      });
    }
  }

  /** Config ICE: STUN/TURN de Metered por defecto + fallback Google STUN + override opcional vía localStorage. */
  getIceConfig() {
    return getIceConfig();
  }

  static translatePeerError(e) {
    return translatePeerError(e);
  }

  _newPeer(roomIdOrOpts, opts = {}) {
    let debugLevel = 1;
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
    if (!this._links) this._links = new Map();
    return trackLink(this._links, conn, kind);
  }

  _safeForConn(conn) {
    return safeForConn(this._links, conn);
  }

  host(pinOrOpts = null, maxRetries = 5) {
    if (typeof pinOrOpts === 'number' && pinOrOpts <= 10) {
      maxRetries = pinOrOpts;
      pinOrOpts = null;
    }
    this.isHost = true;
    this._links = new Map();
    this.peerRoster = [];
    this.stats.setMode('HOST', 0);

    const tryPin = (attempt) => new Promise((resolve, reject) => {
      let pin;
      if (pinOrOpts) {
        this.roomId = String(pinOrOpts).startsWith('VOXELSALA-')
          ? String(pinOrOpts)
          : 'VOXELSALA-' + pinOrOpts;
        pin = this.roomId.replace(/^VOXELSALA-/, '');
      } else {
        pin = Math.floor(1000 + Math.random() * 9000);
        this.roomId = 'VOXELSALA-' + pin;
      }
      if (this.peer) { try { this.peer.destroy(); } catch {} this.peer = null; }
      this.peer = this._newPeer(this.roomId);
      if (typeof window !== 'undefined') {
        window.__peer = this.peer;
        window.network = this;
      }


      const onOpen = () => {
        this.peer?.off?.('open', onOpen);
        this.peer?.off?.('error', onError);
        console.log(`[WebRTC] [HOST] Host listo en sala ${this.roomId}. Escuchando conexiones entrantes...`);
        this._setupHostSignalingLifecycle();
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
      const onConn = (conn) => {
        console.log(`[WebRTC] [INCOMING] Host recibió conexión entrante:`, conn?.peer, conn?.label);
        this._setupHostChannel(conn);
      };
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

  _setupHostSignalingLifecycle() {
    if (!this.peer) return;

    this.peer.on('disconnected', () => {
      console.warn(`[PeerJS] [WARN] Host desconectado del servidor de señalización (${this.roomId}). Intentando reconectar...`);
      this.dispatchEvent(new CustomEvent('signaling-disconnected', { detail: { roomId: this.roomId } }));
      this._reconnectSignaling();
    });

    this.peer.on('close', () => {
      console.warn('[PeerJS] [CLOSED] Host Peer cerrado definitivamente.');
      this.dispatchEvent(new CustomEvent('host-offline', { detail: { roomId: this.roomId } }));
    });

    this.peer.on('error', (err) => {
      console.warn('[PeerJS] [WARN] Error en Host Peer:', err?.type || err?.message || err);
      if (err?.type === 'network' || err?.type === 'server-error' || /disconnected/i.test(err?.message || '')) {
        this._reconnectSignaling();
      }
    });

    this.peer.on('open', (id) => {
      console.log(`[PeerJS] [OK] Host registrado en servidor de señalización. Sala ID: ${id}`);
      this.dispatchEvent(new CustomEvent('signaling-connected', { detail: { id } }));
    });

    if (this._signalingHeartbeat) clearInterval(this._signalingHeartbeat);
    this._signalingHeartbeat = setInterval(() => {
      if (this.isHost && this.peer && !this.peer.destroyed && this.peer.disconnected) {
        console.log('[PeerJS] [HEARTBEAT] Host desconectado de señalización. Reconectando...');
        this._reconnectSignaling();
      }
    }, 6000);
  }

  _reconnectSignaling() {
    if (!this.peer || this.peer.destroyed || !this.peer.disconnected) return;
    if (this._reconnectTimer) return;
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (this.peer && !this.peer.destroyed && this.peer.disconnected) {
        try {
          console.log(`[PeerJS] [RECONNECT] Reconectando sala ${this.roomId || this.peer.id} a 0.peerjs.com...`);
          this.peer.reconnect();
        } catch (e) {
          console.warn('[PeerJS] Fallo al invocar reconnect():', e);
        }
      }
    }, 800);
  }

  _checkSignalingHealth() {
    if (!this.peer || this.peer.destroyed) return;
    if (this.peer.disconnected) {
      console.warn(`[WebRTC] [RECONNECT] Peer desconectado de señalización (${this.roomId || this.peer.id || 'cliente'}). Reconectando...`);
      this._reconnectSignaling();
    }
  }

  _isHotChannel(conn) {
    return isHotChannel(conn);
  }

  _attachConnectionDiagnostics(conn, label) {
    if (!conn) return;
    const registerPc = (pc) => {
      if (typeof window !== 'undefined') {
        window.__debugPeerConnections = window.__debugPeerConnections || [];
        if (pc && !window.__debugPeerConnections.includes(pc)) {
          window.__debugPeerConnections.push(pc);
        }
      }
    };
    if (conn.peerConnection) registerPc(conn.peerConnection);

    const hook = () => {
      const pc = conn.peerConnection;
      if (!pc || pc._diagHooked || typeof pc.addEventListener !== 'function') return;
      pc._diagHooked = true;
      registerPc(pc);
      console.log(`[WebRTC] [ICE] Connection state (${label}):`, pc.iceConnectionState);
      pc.addEventListener('iceconnectionstatechange', () => {
        console.log(`[WebRTC] [ICE] Connection state (${label}):`, pc.iceConnectionState);
      });
      pc.addEventListener('connectionstatechange', () => {
        console.log(`[WebRTC] [PEER] Connection state (${label}):`, pc.connectionState);
      });
      pc.addEventListener('icecandidateerror', (e) => {
        if (e.errorCode >= 300) {
          console.warn(`[WebRTC] [WARN] ICE candidate error (${label} / ${e.url}):`, e.errorCode, e.errorText);
        }
      });
    };
    if (conn.peerConnection) {
      hook();
    } else {
      const checkInterval = setInterval(() => {
        if (conn.peerConnection) {
          clearInterval(checkInterval);
          hook();
        }
      }, 50);
      if (typeof setTimeout === 'function') {
        const timer = setTimeout(() => clearInterval(checkInterval), 5000);
        timer.unref?.();
      }
    }
  }

  _setupHostChannel(conn) {
    const isHot = this._isHotChannel(conn);
    const label = isHot ? 'HOST-HOT' : 'HOST-SAFE';
    this._attachConnectionDiagnostics(conn, label);
    // Enlazar inmediatamente para que conn.peer esté disponible de inmediato
    this._trackLink(conn, isHot ? 'hot' : 'safe');

    let opened = false;
    const handleOpen = () => {
      if (opened) return;
      opened = true;
      console.log(`[WebRTC] [OK] DataChannel ABIERTO [${label}] con peer:`, conn.peer);
      const link = this._trackLink(conn, isHot ? 'hot' : 'safe');
      if (isHot) {
        // El canal hot es oportunista: no dispara peer-joined, solo se enlaza.
        if (link?.safe && link.safe.open) {
          // Ya unido: nada que hacer, el hot queda listo para INPUTs.
        }
        return;
      }
      const alreadyConnected = this.connections.some(c => c.peer === conn.peer);
      if (alreadyConnected) {
        console.log(`[WebRTC] [INFO] Peer ${conn.peer} ya tiene un canal safe registrado. Ignorando evento duplicado.`);
        return;
      }
      this.connections.push(conn);
      this.stats.setMode('HOST', this.connections.length);
      this.dispatchEvent(new CustomEvent('peer-joined', { detail: { conn } }));
    };

    if (conn.open) {
      handleOpen();
    } else {
      conn.on('open', handleOpen);
    }
    conn.on('data', (data) => this._handleIncoming(data, conn));
    conn.on('close', () => {
      console.log(`[WebRTC] [CLOSED] DataChannel CERRADO [${label}] con peer:`, conn?.peer);
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
    conn.on('error', (err) => {
      console.error(`[WebRTC] [ERROR] Error en DataChannel [${label}] con peer ${conn?.peer}:`, err);
    });
  }

  join(pin, { timeoutMs = 12000 } = {}) {
    this.isHost = false;
    this._links = new Map();
    if (this.peer) { try { this.peer.destroy(); } catch {} }
    this.peer = this._newPeer({});
    if (typeof window !== 'undefined') {
      window.__peer = this.peer;
      window.network = this;
    }
    this.hostHotConn = null;
    this._hostClosingHandled = false;

    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error(`Tiempo de espera agotado (${timeoutMs / 1000}s) sin respuesta del anfitrión. Revisa que el host tenga el juego en pantalla y prueba de nuevo.`));
        }
      }, timeoutMs);
      const done = (fn, val) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn(val);
      };

      this.peer.on('open', () => {
        const room = String(pin).startsWith('VOXELSALA-') ? String(pin) : 'VOXELSALA-' + pin;
        console.log(`[WebRTC] [CLIENT] Peer cliente abierto con ID: ${this.peer.id}. Conectando a sala ${room}...`);

        // Canal fiable para eventos (INIT, DOOR, CHEST, ...)
        const safe = this.peer.connect(room, {
          label: 'game-safe',
          metadata: { channel: 'safe' },
          reliable: true,
          serialization: 'binary',
        });
        // Canal no fiable para hot-path (INPUT/SNAPSHOT/PING): sin reintentos,
        // un paquete perdido lo reemplaza el siguiente tick (30/20 Hz).
        const hot = this.peer.connect(room, {
          label: 'game-hot',
          metadata: { channel: 'hot' },
          reliable: false,
          serialization: 'binary',
        });

        this._attachConnectionDiagnostics(safe, 'CLIENT-SAFE');
        this._attachConnectionDiagnostics(hot, 'CLIENT-HOT');

        this._trackLink(safe, 'safe');
        this._trackLink(hot, 'hot');

        // Escuchar datos de inmediato para no perder paquetes de negociación inicial
        safe.on('data', (d) => this._handleIncoming(d, safe));
        safe.on('error', (e) => {
          console.error('[WebRTC] [ERROR] Error en DataChannel safe:', e);
          done(reject, new Error(NetworkManager.translatePeerError(e)));
        });

        hot.on('data', (d) => this._handleIncoming(d, hot));
        hot.on('error', (e) => {
          console.warn('[WebRTC] [WARN] Error en DataChannel hot (fallback a safe activo):', e);
        });

        let safeOpened = false;
        const handleSafeOpen = () => {
          if (safeOpened) return;
          safeOpened = true;
          console.log('[WebRTC] [OK] DataChannel ABIERTO con el host (game-safe)');
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
        };

        if (safe.open) {
          handleSafeOpen();
        } else {
          safe.on('open', handleSafeOpen);
        }

        let hotOpened = false;
        const handleHotOpen = () => {
          if (hotOpened) return;
          hotOpened = true;
          console.log('[WebRTC] [OK] DataChannel ABIERTO con el host (game-hot)');
          this.hostHotConn = hot;
          this._trackLink(hot, 'hot');
        };

        if (hot.open) {
          handleHotOpen();
        } else {
          hot.on('open', handleHotOpen);
        }
        hot.on('close', () => {
          console.log('[WebRTC] [CLOSED] DataChannel hot cerrado (fallback a safe)');
          if (this.hostHotConn === hot) this.hostHotConn = null;
        });
        safe.on('close', () => {
          console.log('[WebRTC] [CLOSED] DataChannel safe cerrado con el host');
          if (!this.isHost && !this._hostClosingHandled) {
            this._hostClosingHandled = true;
            this.dispatchEvent(new CustomEvent('host-closing', { detail: { reason: 0 } }));
          }
        });
      });
      this.peer.on('error', (e) => {
        console.error('[WebRTC] [ERROR] Error en instancia Peer cliente:', e);
        done(reject, new Error(NetworkManager.translatePeerError(e)));
      });
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

      case Proto.MSG.POTION: {
        // Solo el Host procesa peticiones de poción de clientes para sincronizar la salud autoritativa
        if (!this.isHost) break;
        const potionData = Proto.deserializePotionUse(buf);
        potionData.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('potion-use', { detail: potionData }));
        break;
      }

      case Proto.MSG.WORLD_SNAPSHOT: {
        // Solo los clientes procesan snapshots de mundo (el Host es la fuente).
        if (this.isHost) break;
        const snap = Proto.deserializeWorldSnapshot(buf);
        if (!snap) break;
        saveWorldSnapshot(snap);
        this.dispatchEvent(new CustomEvent('world-snapshot', { detail: snap }));
        break;
      }

      case Proto.MSG.PEER_ROSTER: {
        // Solo los clientes procesan el roster sincronizado por el Host
        if (this.isHost) break;
        const roster = Proto.deserializePeerRoster(buf);
        if (Array.isArray(roster)) {
          this.peerRoster = roster;
          this.dispatchEvent(new CustomEvent('peer-roster', { detail: { roster } }));
        }
        break;
      }

      case Proto.MSG.CHAPTER_SELECT: {
        const cs = Proto.deserializeChapterSelect(buf);
        cs.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('chapter-select', { detail: cs }));
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

  /** Snapshot de mazmorra (Fase 2 MVP): el Host difunde nivel+puertas+cofres cada ~5s por safe. */
  startWorldSnapshot(getStateFn, intervalMs = 5000) {
    this.stopWorldSnapshot();
    if (typeof getStateFn !== 'function') return;
    const tick = () => {
      if (!this.isHost) return;
      try {
        const snap = getStateFn();
        if (!snap) return;
        this.broadcast(Proto.serializeWorldSnapshot(snap));
      } catch (e) {
        console.warn('[WebRTC] Fallo al difundir world-snapshot:', e);
      }
    };
    // Difusión inmediata + periódica (el invitado guarda en sessionStorage al recibir).
    tick();
    this._worldSnapshotTimer = setInterval(tick, intervalMs);
    if (this._worldSnapshotTimer?.unref) this._worldSnapshotTimer.unref();
  }

  stopWorldSnapshot() {
    if (this._worldSnapshotTimer) {
      clearInterval(this._worldSnapshotTimer);
      this._worldSnapshotTimer = null;
    }
  }

  /** Sincronización de roster de peers para migración determinista de host */
  broadcastPeerRoster(roster) {
    if (Array.isArray(roster)) this.peerRoster = roster;
    if (this.isHost && this.peerRoster.length > 0) {
      this.broadcast(Proto.serializePeerRoster(this.peerRoster));
    }
  }

  disconnect() {
    this._hostClosingHandled = true;
    this.stopWorldSnapshot();
    this.peerRoster = [];
    if (this._signalingHeartbeat) {

      clearInterval(this._signalingHeartbeat);
      this._signalingHeartbeat = null;
    }
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
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
      try { this.peer.destroy?.(); } catch {}
      this.peer = null;
    }
    this.stats.setMode('OFFLINE', 0);
  }
}
