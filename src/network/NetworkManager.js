import * as Proto from './Protocol.js';
import { NetworkStats } from './NetworkStats.js';
import { ICE_SERVERS, getIceConfig, translatePeerError } from './SignalingConfig.js';
import { VoiceChatManager } from './VoiceChatManager.js';
import { SignalingMixin } from './SignalingMixin.js';
import { ChannelsMixin } from './ChannelsMixin.js';
import { IncomingMixin } from './IncomingMixin.js';

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

    // Gestor de chat de voz WebRTC desacoplado
    this.voiceManager = new VoiceChatManager({
      eventTarget: this,
      getPeer: () => this.peer,
    });

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
    const snapshotTimer = /** @type {any} */ (this._worldSnapshotTimer);
    if (snapshotTimer?.unref) snapshotTimer.unref();
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

  // ═══════════════════════════════════════════════════════════
  // CHAT DE VOZ WEBRTC (DELEGACIÓN A VoiceChatManager)
  // ═══════════════════════════════════════════════════════════

  get localStream() {
    return this.voiceManager?.localStream ?? null;
  }

  set localStream(stream) {
    if (this.voiceManager) this.voiceManager.localStream = stream;
  }

  get mediaCalls() {
    return this.voiceManager?.mediaCalls;
  }

  set mediaCalls(map) {
    if (this.voiceManager) this.voiceManager.mediaCalls = map;
  }

  get remoteAudios() {
    return this.voiceManager?.remoteAudios;
  }

  set remoteAudios(map) {
    if (this.voiceManager) this.voiceManager.remoteAudios = map;
  }

  get voiceEnabled() {
    return this.voiceManager?.voiceEnabled ?? false;
  }

  set voiceEnabled(val) {
    if (this.voiceManager) this.voiceManager.voiceEnabled = val;
  }

  async _ensureLocalStream() {
    return this.voiceManager.ensureLocalStream();
  }

  _attachRemoteAudio(peerId, stream) {
    return this.voiceManager.attachRemoteAudio(peerId, stream);
  }

  async startVoiceCall(peerId) {
    return this.voiceManager.startVoiceCall(peerId, () => this._ensureLocalStream());
  }

  _setupVoiceListener() {
    return this.voiceManager.setupVoiceListener(this.peer);
  }

  _wireMediaCall(peerId, call) {
    return this.voiceManager.wireMediaCall(peerId, call);
  }

  _cleanupMedia(peerId) {
    return this.voiceManager.cleanupMedia(peerId);
  }

  toggleMute() {
    return this.voiceManager.toggleMute();
  }

  isMuted() {
    return this.voiceManager.isMuted();
  }

  stopAllVoice() {
    return this.voiceManager.stopAllVoice();
  }

  disconnect() {
    this._hostClosingHandled = true;
    this.stopWorldSnapshot();
    this.stopAllVoice();
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

// Composición modular SRP: NetworkManager delega señalización, canales duales
// y despacho de mensajes entrantes en mixins temáticos.
Object.assign(NetworkManager.prototype, SignalingMixin, ChannelsMixin, IncomingMixin);
