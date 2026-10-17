/**
 * VoiceChatManager.js - Gestor de audio y llamadas WebRTC para chat de voz P2P
 * Desacoplado de NetworkManager para mantener la responsabilidad única (SRP).
 */

import { logger } from '../config/logger.js';

export class VoiceChatManager {
  /**
   * @param {Object} [options]
   * @param {EventTarget} [options.eventTarget] - Objeto para despachar eventos (e.g. NetworkManager).
   * @param {Function} [options.getPeer] - Función que devuelve la instancia de Peer activa.
   */
  constructor({ eventTarget = null, getPeer = () => null } = {}) {
    this.eventTarget = eventTarget;
    this.getPeer = getPeer;
    this.localStream = null;
    this.mediaCalls = new Map();     // peerId -> MediaConnection
    this.remoteAudios = new Map();   // peerId -> <audio> element
    this.voiceEnabled = false;
  }

  _dispatchEvent(name, detail = {}) {
    if (this.eventTarget && typeof this.eventTarget.dispatchEvent === 'function') {
      this.eventTarget.dispatchEvent(new CustomEvent(name, { detail }));
    }
  }

  /**
   * Solicita acceso al micrófono local tras gesto del usuario.
   * Aplica cancelación de eco, supresión de ruido y ganancia automática.
   */
  async ensureLocalStream() {
    if (this.localStream) return this.localStream;

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        console.warn('[Voz] ⚠️ getUserMedia no disponible en este entorno');
        return null;
      }
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      this.voiceEnabled = true;
      logger.debug('[Voz] 🎤 Micrófono concedido');
      this._dispatchEvent('voice-stream-ready', { stream: this.localStream });
      return this.localStream;
    } catch (err) {
      console.error('[Voz] ❌ Permiso denegado:', err?.name || err);
      this._dispatchEvent('voice-denied', { reason: err?.name || 'Error' });
      return null;
    }
  }

  /**
   * Reproduce el stream de audio remoto en un elemento <audio> dedicado
   * en document.body con playsinline y autoplay (evitando AudioContext del juego).
   */
  attachRemoteAudio(peerId, stream) {
    if (typeof document === 'undefined') return;

    let audio = this.remoteAudios.get(peerId);
    if (!audio) {
      audio = document.createElement('audio');
      audio.playsinline = true;      // iOS Safari: NO abrir fullscreen
      audio.autoplay = true;
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      audio.style.display = 'none';
      document.body.appendChild(audio);
      this.remoteAudios.set(peerId, audio);
    }
    audio.srcObject = stream;

    try {
      const p = audio.play?.();
      if (p && typeof p.catch === 'function') {
        p.catch((err) => {
          console.warn('[Voz] Autoplay bloqueado, esperando gesto:', err?.name || err);
          const resume = () => {
            audio.play?.().catch(() => {});
            document.removeEventListener('touchstart', resume);
            document.removeEventListener('click', resume);
          };
          document.addEventListener('touchstart', resume, { once: true });
          document.addEventListener('click', resume, { once: true });
        });
      }
    } catch (e) {
      console.warn('[Voz] Error reproduciendo audio:', e);
    }

    logger.debug('[Voz] 🔊 Reproduciendo audio de:', peerId);
  }

  /**
   * Host o participante inicia llamada de voz hacia un peerId específico.
   * @param {string} peerId
   * @param {Function} [ensureStreamFn] - Función opcional para resolver el stream (útil para mocking/delegación)
   */
  async startVoiceCall(peerId, ensureStreamFn = null) {
    if (!peerId) return;
    const stream = ensureStreamFn ? await ensureStreamFn() : await this.ensureLocalStream();
    if (!stream) return;

    if (this.mediaCalls.has(peerId)) return;

    logger.debug('[Voz] 📞 Llamando a:', peerId);
    const peer = this.getPeer();
    if (!peer || typeof peer.call !== 'function') {
      console.warn('[Voz] Peer no disponible o sin método call()');
      return;
    }
    const call = peer.call(peerId, stream);
    if (!call) {
      console.warn('[Voz] No se pudo iniciar la llamada con', peerId);
      return;
    }
    this.wireMediaCall(peerId, call);
  }

  /**
   * Registra el listener de llamadas entrantes en el objeto Peer.
   */
  setupVoiceListener(peer = this.getPeer()) {
    if (!peer || typeof peer.on !== 'function') return;
    peer.on('call', async (call) => {
      logger.debug('[Voz] 📞 Llamada entrante de:', call?.peer);
      try {
        const stream = await this.ensureLocalStream();
        if (stream) {
          call.answer(stream);
        } else {
          call.answer();
        }
        this.wireMediaCall(call?.peer, call);
      } catch (err) {
        console.error('[Voz] ❌ Error al responder llamada de voz:', err);
      }
    });
  }

  /**
   * Enlaza eventos de la llamada PeerJS MediaConnection (stream, close, error).
   */
  wireMediaCall(peerId, call) {
    if (!call || typeof call.on !== 'function') return;
    this.mediaCalls.set(peerId, call);

    call.on('stream', (remoteStream) => {
      this.attachRemoteAudio(peerId, remoteStream);
    });

    call.on('close', () => {
      logger.debug('[Voz] 📞 Llamada cerrada con', peerId);
      this.cleanupMedia(peerId);
    });

    call.on('error', (err) => {
      console.error('[Voz] ❌ Error en llamada con', peerId, err);
      this.cleanupMedia(peerId);
    });
  }

  /**
   * Limpia el elemento <audio> y la llamada asociada a un peer.
   */
  cleanupMedia(peerId) {
    if (!peerId) return;
    const audio = this.remoteAudios.get(peerId);
    if (audio) {
      audio.srcObject = null;
      try { audio.remove(); } catch {}
      this.remoteAudios.delete(peerId);
    }
    const call = this.mediaCalls.get(peerId);
    if (call) {
      try { call.close(); } catch {}
      this.mediaCalls.delete(peerId);
    }
  }

  /**
   * Alterna mute del micrófono local. Devuelve true si el micro queda activo, false si queda silenciado.
   */
  toggleMute() {
    if (!this.localStream) return false;
    const track = this.localStream.getAudioTracks?.()?.[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    logger.debug('[Voz] Micrófono', track.enabled ? '🎤 activo' : '🔇 silenciado');
    this._dispatchEvent('voice-mute-change', { muted: !track.enabled, enabled: track.enabled });
    return track.enabled;
  }

  /**
   * Comprueba si el micrófono local está actualmente silenciado o inactivo.
   */
  isMuted() {
    if (!this.localStream) return true;
    const track = this.localStream.getAudioTracks?.()?.[0];
    return !track || !track.enabled;
  }

  /**
   * Cierra todas las llamadas de voz y libera el micrófono y elementos <audio>.
   */
  stopAllVoice() {
    for (const call of this.mediaCalls.values()) {
      try { call.close?.(); } catch {}
    }
    this.mediaCalls.clear();
    for (const audio of this.remoteAudios.values()) {
      audio.srcObject = null;
      try { audio.remove?.(); } catch {}
    }
    this.remoteAudios.clear();
    if (this.localStream) {
      try {
        this.localStream.getTracks?.().forEach(t => t.stop?.());
      } catch {}
      this.localStream = null;
    }
    this.voiceEnabled = false;
    this._dispatchEvent('voice-stop');
  }
}
