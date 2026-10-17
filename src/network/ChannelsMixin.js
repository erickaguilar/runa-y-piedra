/**
 * ChannelsMixin.js - Gestión de canales duales hot/safe (DataChannels WebRTC).
 *
 * Composición por mixin sobre `NetworkManager.prototype`. Los métodos asumen el
 * contexto de `NetworkManager` (`this._links`, `this.connections`, ...).
 */
import { logger } from '../config/logger.js';
import * as Proto from './Protocol.js';
import { translatePeerError } from './SignalingConfig.js';
import { isHotChannel } from './ChannelLinks.js';

export const ChannelsMixin = {
  _isHotChannel(conn) {
    return isHotChannel(conn);
  },

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
      logger.debug(`[WebRTC] [ICE] Connection state (${label}):`, pc.iceConnectionState);
      pc.addEventListener('iceconnectionstatechange', () => {
        logger.debug(`[WebRTC] [ICE] Connection state (${label}):`, pc.iceConnectionState);
      });
      pc.addEventListener('connectionstatechange', () => {
        logger.debug(`[WebRTC] [PEER] Connection state (${label}):`, pc.connectionState);
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
        /** @type {any} */ (timer).unref?.();
      }
    }
  },

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
      logger.debug(`[WebRTC] [OK] DataChannel ABIERTO [${label}] con peer:`, conn.peer);
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
        logger.debug(`[WebRTC] [INFO] Peer ${conn.peer} ya tiene un canal safe registrado. Ignorando evento duplicado.`);
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
      logger.debug(`[WebRTC] [CLOSED] DataChannel CERRADO [${label}] con peer:`, conn?.peer);
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
      this._cleanupMedia(conn?.peer);
      this.stats.setMode('HOST', this.connections.length);
      this.dispatchEvent(new CustomEvent('peer-left', { detail: { conn } }));
    });
    conn.on('error', (err) => {
      console.error(`[WebRTC] [ERROR] Error en DataChannel [${label}] con peer ${conn?.peer}:`, err);
    });
  },

  join(pin, { timeoutMs = 12000 } = {}) {
    this.isHost = false;
    this._links = new Map();
    if (this.peer) { try { this.peer.destroy(); } catch {} }
    this.peer = this._newPeer({});
    this._setupVoiceListener();
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
        logger.debug(`[WebRTC] [CLIENT] Peer cliente abierto con ID: ${this.peer.id}. Conectando a sala ${room}...`);

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
          done(reject, new Error(translatePeerError(e)));
        });

        hot.on('data', (d) => this._handleIncoming(d, hot));
        hot.on('error', (e) => {
          console.warn('[WebRTC] [WARN] Error en DataChannel hot (fallback a safe activo):', e);
        });

        let safeOpened = false;
        const handleSafeOpen = () => {
          if (safeOpened) return;
          safeOpened = true;
          logger.debug('[WebRTC] [OK] DataChannel ABIERTO con el host (game-safe)');
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
          logger.debug('[WebRTC] [OK] DataChannel ABIERTO con el host (game-hot)');
          this.hostHotConn = hot;
          this._trackLink(hot, 'hot');
        };

        if (hot.open) {
          handleHotOpen();
        } else {
          hot.on('open', handleHotOpen);
        }
        hot.on('close', () => {
          logger.debug('[WebRTC] [CLOSED] DataChannel hot cerrado (fallback a safe)');
          if (this.hostHotConn === hot) this.hostHotConn = null;
        });
        safe.on('close', () => {
          logger.debug('[WebRTC] [CLOSED] DataChannel safe cerrado con el host');
          if (!this.isHost && !this._hostClosingHandled) {
            this._hostClosingHandled = true;
            this.dispatchEvent(new CustomEvent('host-closing', { detail: { reason: 0 } }));
          }
        });
      });
      this.peer.on('error', (e) => {
        console.error('[WebRTC] [ERROR] Error en instancia Peer cliente:', e);
        done(reject, new Error(translatePeerError(e)));
      });
    });
  }
};
