/**
 * SignalingMixin.js - Señalización PeerJS/ICE y ciclo de vida del host.
 *
 * Composición por mixin sobre `NetworkManager.prototype`. Los métodos asumen el
 * contexto de `NetworkManager` (`this.peer`, `this.stats`, `this._links`, ...).
 */
import Peer from 'peerjs';
import { logger } from '../config/logger.js';
import { translatePeerError } from './SignalingConfig.js';
import { trackLink, safeForConn } from './ChannelLinks.js';

export const SignalingMixin = {
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
  },

  _trackLink(conn, kind) {
    if (!this._links) this._links = new Map();
    return trackLink(this._links, conn, kind);
  },

  _safeForConn(conn) {
    return safeForConn(this._links, conn);
  },

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
      this._setupVoiceListener();
      if (typeof window !== 'undefined') {
        window.__peer = this.peer;
        window.network = this;
      }


      const onOpen = () => {
        this.peer?.off?.('open', onOpen);
        this.peer?.off?.('error', onError);
        logger.debug(`[WebRTC] [HOST] Host listo en sala ${this.roomId}. Escuchando conexiones entrantes...`);
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
        reject(new Error(translatePeerError(e)));
      };
      const onConn = (conn) => {
        logger.debug(`[WebRTC] [INCOMING] Host recibió conexión entrante:`, conn?.peer, conn?.label);
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
  },

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
      logger.debug(`[PeerJS] [OK] Host registrado en servidor de señalización. Sala ID: ${id}`);
      this.dispatchEvent(new CustomEvent('signaling-connected', { detail: { id } }));
    });

    if (this._signalingHeartbeat) clearInterval(this._signalingHeartbeat);
    this._signalingHeartbeat = setInterval(() => {
      if (this.isHost && this.peer && !this.peer.destroyed && this.peer.disconnected) {
        logger.debug('[PeerJS] [HEARTBEAT] Host desconectado de señalización. Reconectando...');
        this._reconnectSignaling();
      }
    }, 6000);
  },

  _reconnectSignaling() {
    if (!this.peer || this.peer.destroyed || !this.peer.disconnected) return;
    if (this._reconnectTimer) return;
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (this.peer && !this.peer.destroyed && this.peer.disconnected) {
        try {
          logger.debug(`[PeerJS] [RECONNECT] Reconectando sala ${this.roomId || this.peer.id} a 0.peerjs.com...`);
          this.peer.reconnect();
        } catch (e) {
          console.warn('[PeerJS] Fallo al invocar reconnect():', e);
        }
      }
    }, 800);
  },

  _checkSignalingHealth() {
    if (!this.peer || this.peer.destroyed) return;
    if (this.peer.disconnected) {
      console.warn(`[WebRTC] [RECONNECT] Peer desconectado de señalización (${this.roomId || this.peer.id || 'cliente'}). Reconectando...`);
      this._reconnectSignaling();
    }
  }
};
