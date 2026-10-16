// src/audio/SoundManager.js
/**
 * SoundManager.js - Sintetizador de Audio Procedural Web Audio API
 * 
 * Genera efectos de sonido procedurales para la mazmorra sin requerir ningún asset externo (.mp3/.wav):
 * - playDoorOpen: Liberación de pestillo forjado, crujido resonante de roble y tope mecánico.
 * - playChestOpen: Crujido de tapa de cofre y arpegio armónico de tesoro áureo.
 * - playJump: Impulso de salto y suspensión aérea.
 * - playClick: Retroalimentación táctil de interfaz.
 * 
 * Cumple con las políticas de autoplay de navegadores móviles (reanuda AudioContext con interacción de usuario)
 * y mantiene consumo Zero-GC reutilizando buffers de ruido estáticos.
 */

import { saveManager } from '../storage/SaveManager.js';

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.uiGain = null;
    this.ambientGain = null;
    this._gainNodePool = [];
    this._isMuted = false;
    this._volume = 0.6;
    this._noiseBuffer = null;
    this._brownNoiseBuffer = null;
    this._clickBuffer = null;
    this._jumpBuffer = null;
    this._keyPickupBuffer = null;
    this._caveImpulseBuffer = null;
    this._initialized = false;

    // Cargar preferencia de mute desde saveManager o fallback legacy
    try {
      const settings = saveManager.getSettings?.() || {};
      if (typeof settings.soundMuted === 'boolean') {
        this._isMuted = settings.soundMuted;
      } else if (typeof localStorage !== 'undefined') {
        this._isMuted = localStorage.getItem('dungeon_sound_muted') === '1';
      }
    } catch { /* ignore */ }

    this._setupUnlockListeners();
  }

  _setupUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this._initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      // Una vez desbloqueado, removemos los listeners iniciales
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  _initContext() {
    if (this._initialized) return;
    if (typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      this.ctx = new AudioContextClass();

      // Bus Maestro
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this._isMuted ? 0 : this._volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Buses de canal dedicados para pooling y mezcla limpia
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);

      this.uiGain = this.ctx.createGain();
      this.uiGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.connect(this.masterGain);

      this._generateNoiseBuffers();
      this._generateProceduralBuffers();
      this._initialized = true;
    } catch (e) {
      console.warn('[SoundManager] No se pudo inicializar Web Audio API:', e);
    }
  }

  _acquireGainNode() {
    if (this._gainNodePool && this._gainNodePool.length > 0) {
      return this._gainNodePool.pop();
    }
    return this.ctx.createGain();
  }

  _releaseGainNode(node, delayMs = 1500) {
    if (!node || !this._gainNodePool || this._gainNodePool.length >= 16) return;
    setTimeout(() => {
      try {
        node.disconnect();
        if (this._gainNodePool.length < 16) {
          this._gainNodePool.push(node);
        }
      } catch {}
    }, delayMs);
  }

  /**
   * Sintetiza y almacena en caché PCM buffers para sonidos de alta repetición
   * (salto, clics UI, llaves y reverb de cueva), garantizando Zero-GC y 0 ms de jank.
   */
  _generateProceduralBuffers() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;

    try {
      // 1. Buffer para playClick() (40ms, 950Hz sine con decaimiento rápido)
      const clickLen = Math.floor(sampleRate * 0.04);
      this._clickBuffer = this.ctx.createBuffer(1, clickLen, sampleRate);
      const clickData = this._clickBuffer.getChannelData(0);
      for (let i = 0; i < clickLen; i++) {
        const t = i / sampleRate;
        const env = 0.12 * Math.exp(-t / 0.008);
        clickData[i] = Math.sin(2 * Math.PI * 950 * t) * env;
      }

      // 2. Buffer para playJump() (130ms, barrido triangular 140Hz -> 260Hz)
      const jumpLen = Math.floor(sampleRate * 0.13);
      this._jumpBuffer = this.ctx.createBuffer(1, jumpLen, sampleRate);
      const jumpData = this._jumpBuffer.getChannelData(0);
      let phase = 0;
      for (let i = 0; i < jumpLen; i++) {
        const t = i / sampleRate;
        const freq = t < 0.08 ? 140 * Math.pow(260 / 140, t / 0.08) : 260;
        phase += (2 * Math.PI * freq) / sampleRate;
        const tri = (2 / Math.PI) * Math.asin(Math.sin(phase));
        const env = 0.2 * Math.exp(-t / 0.025);
        jumpData[i] = tri * env;
      }

      // 3. Buffer para playKeyPickup() (450ms, campanillas duales 1318.5Hz y 1568.0Hz)
      const keyLen = Math.floor(sampleRate * 0.45);
      this._keyPickupBuffer = this.ctx.createBuffer(1, keyLen, sampleRate);
      const keyData = this._keyPickupBuffer.getChannelData(0);
      for (let i = 0; i < keyLen; i++) {
        const t = i / sampleRate;
        let sample = 0;
        if (t <= 0.45) {
          const t1 = t;
          const attack1 = Math.min(1, t1 / 0.02);
          const env1 = 0.24 * attack1 * Math.exp(-t1 / 0.08);
          sample += Math.sin(2 * Math.PI * 1318.5 * t1) * env1;
        }
        if (t >= 0.09 && t <= 0.45) {
          const t2 = t - 0.09;
          const attack2 = Math.min(1, t2 / 0.02);
          const env2 = 0.24 * attack2 * Math.exp(-t2 / 0.08);
          sample += Math.sin(2 * Math.PI * 1568.0 * t2) * env2;
        }
        keyData[i] = sample;
      }

      // 4. Buffer de Impulso Reverb para playDescentEcho() (1.4s estéreo)
      const dur = 1.4;
      const len = Math.floor(sampleRate * dur);
      this._caveImpulseBuffer = this.ctx.createBuffer(2, len, sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = this._caveImpulseBuffer.getChannelData(ch);
        for (let i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
        }
      }
    } catch (e) {
      console.warn('[SoundManager] Error pre-calculando buffers procedurales:', e);
    }
  }

  /**
   * Genera de forma pre-calculada 1 segundo de ruido blanco y marrón (Zero-GC en gameplay).
   */
  _generateNoiseBuffers() {
    if (!this.ctx) return;

    const sampleRate = this.ctx.sampleRate;
    const bufferLength = sampleRate * 1.0;

    // 1. Buffer de Ruido Blanco
    this._noiseBuffer = this.ctx.createBuffer(1, bufferLength, sampleRate);
    const whiteData = this._noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferLength; i++) {
      whiteData[i] = Math.random() * 2 - 1;
    }

    // 2. Buffer de Ruido Marrón (integración acumulativa para graves orgánicos)
    this._brownNoiseBuffer = this.ctx.createBuffer(1, bufferLength, sampleRate);
    const brownData = this._brownNoiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferLength; i++) {
      const white = Math.random() * 2 - 1;
      brownData[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brownData[i];
      brownData[i] *= 3.5; // Ganancia de normalización
    }
  }

  get isMuted() {
    return this._isMuted;
  }

  toggleMute() {
    this._isMuted = !this._isMuted;
    try {
      saveManager.updateSettings({ soundMuted: this._isMuted });
    } catch { /* ignore */ }
    if (this.masterGain && this.ctx) {
      const targetGain = this._isMuted ? 0 : this._volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
    return this._isMuted;
  }

  setMuted(muted) {
    if (this._isMuted !== !!muted) {
      this.toggleMute();
    }
  }

  setVolume(vol) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (!this._isMuted && this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this._volume, this.ctx.currentTime);
    }
  }

  /**
   * Crea un nodo de atenuación espacial estéreo relativo entre la fuente sonora y el jugador local.
   */
  _createSpatialNode(sourcePos, listenerPos, maxDistance = 32) {
    if (!this.ctx || !sourcePos || !listenerPos) return null;

    const dx = sourcePos.x - listenerPos.x;
    const dz = sourcePos.z - listenerPos.z;
    const dist = Math.hypot(dx, dz);

    if (dist > maxDistance) return { audible: false };

    const distanceGain = Math.max(0, 1 - (dist / maxDistance));
    const gainNode = this._acquireGainNode();
    gainNode.gain.setValueAtTime(distanceGain * distanceGain, this.ctx.currentTime);
    this._releaseGainNode(gainNode, 1500);

    // Si el navegador soporta StereoPannerNode, calcular paneo L/R
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      const pan = Math.max(-1, Math.min(1, dx / 12));
      panner.pan.setValueAtTime(pan, this.ctx.currentTime);
      gainNode.connect(panner);
      panner.connect(this.masterGain);
      return { input: gainNode, audible: true };
    }

    gainNode.connect(this.masterGain);
    return { input: gainNode, audible: true };
  }

  /**
   * Reproduce el sonido de apertura de puerta de mazmorra:
   * 1. Liberación del cerrojo/pestillo de forja (transitorio metálico).
   * 2. Crujido y fricción de las pesadas hojas de roble macizo con filtro pasabanda dinámico.
   * 3. Tope amortiguado al alcanzar el ángulo de apertura.
   */
  playDoorOpen(sourcePos = null, listenerPos = null) {
    this._initContext();
    if (!this.ctx || this._isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const t = this.ctx.currentTime;
    let outputNode = this.masterGain;

    if (sourcePos && listenerPos) {
      const spatial = this._createSpatialNode(sourcePos, listenerPos, 32);
      if (!spatial || !spatial.audible) return;
      outputNode = spatial.input;
    }

    // --- 1. CLANK DE CERROJO / PESTILLO METÁLICO (t + 0.0s a t + 0.12s) ---
    const latchOsc = this.ctx.createOscillator();
    const latchGain = this.ctx.createGain();
    latchOsc.type = 'triangle';
    latchOsc.frequency.setValueAtTime(320, t);
    latchOsc.frequency.exponentialRampToValueAtTime(110, t + 0.09);

    latchGain.gain.setValueAtTime(0.45, t);
    latchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    latchOsc.connect(latchGain);
    latchGain.connect(outputNode);
    latchOsc.start(t);
    latchOsc.stop(t + 0.12);

    // Chasquido de fricción del perno
    if (this._noiseBuffer) {
      const clickSrc = this.ctx.createBufferSource();
      const clickFilter = this.ctx.createBiquadFilter();
      const clickGain = this.ctx.createGain();

      clickSrc.buffer = this._noiseBuffer;
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(2200, t);
      clickFilter.Q.setValueAtTime(4.0, t);

      clickGain.gain.setValueAtTime(0.35, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      clickSrc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(outputNode);
      clickSrc.start(t);
      clickSrc.stop(t + 0.06);
    }

    // --- 2. CRUJIDO DE ROBLE Y BISAGRAS (t + 0.04s a t + 0.52s) ---
    if (this._brownNoiseBuffer) {
      const creakSrc = this.ctx.createBufferSource();
      const creakFilter = this.ctx.createBiquadFilter();
      const creakGain = this.ctx.createGain();

      creakSrc.buffer = this._brownNoiseBuffer;
      creakFilter.type = 'bandpass';
      creakFilter.Q.setValueAtTime(8.5, t);

      // Barrido de frecuencia que simula la fricción de madera noble
      creakFilter.frequency.setValueAtTime(210, t + 0.04);
      creakFilter.frequency.exponentialRampToValueAtTime(480, t + 0.26);
      creakFilter.frequency.exponentialRampToValueAtTime(170, t + 0.50);

      creakGain.gain.setValueAtTime(0.01, t);
      creakGain.gain.linearRampToValueAtTime(0.65, t + 0.12);
      creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.52);

      creakSrc.connect(creakFilter);
      creakFilter.connect(creakGain);
      creakGain.connect(outputNode);
      creakSrc.start(t + 0.04);
      creakSrc.stop(t + 0.53);
    }

    // Vibración sub-grave de la masa de la puerta
    const rumbleOsc = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.setValueAtTime(74, t + 0.05);
    rumbleOsc.frequency.exponentialRampToValueAtTime(52, t + 0.45);

    rumbleGain.gain.setValueAtTime(0.3, t + 0.05);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.46);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(outputNode);
    rumbleOsc.start(t + 0.05);
    rumbleOsc.stop(t + 0.48);

    // --- 3. TOPE FINAL AL ABRIR CONTRA EL SILLAR (t + 0.38s) ---
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(95, t + 0.36);
    thudOsc.frequency.exponentialRampToValueAtTime(38, t + 0.46);

    thudGain.gain.setValueAtTime(0.35, t + 0.36);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.47);

    thudOsc.connect(thudGain);
    thudGain.connect(outputNode);
    thudOsc.start(t + 0.36);
    thudOsc.stop(t + 0.48);
  }

  /**
   * Reproduce el sonido de cierre de puerta:
   * Batiente regresando + golpe sordo contra el marco + cierre de cerrojo de hierro forjado.
   */
  playDoorClose(sourcePos = null, listenerPos = null) {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    let outputNode = this.masterGain;
    let distGainNode = null;
    let pannerNode = null;

    if (sourcePos && listenerPos) {
      const dx = sourcePos.x - listenerPos.x;
      const dz = sourcePos.z - listenerPos.z;
      const dist = Math.hypot(dx, dz);
      const atten = Math.max(0.08, 1 - Math.min(dist / 18, 0.92));

      distGainNode = this.ctx.createGain();
      distGainNode.gain.setValueAtTime(atten, this.ctx.currentTime);

      if (this.ctx.createStereoPanner) {
        pannerNode = this.ctx.createStereoPanner();
        const pan = Math.max(-1, Math.min(1, dx / 8));
        pannerNode.pan.setValueAtTime(pan, this.ctx.currentTime);
        distGainNode.connect(pannerNode);
        pannerNode.connect(this.masterGain);
      } else {
        distGainNode.connect(this.masterGain);
      }
      outputNode = distGainNode;
    }

    const t = this.ctx.currentTime;

    // 1. Golpe sordo de madera maciza contra el quicio de piedra
    const slamOsc = this.ctx.createOscillator();
    const slamGain = this.ctx.createGain();
    slamOsc.type = 'sine';
    slamOsc.frequency.setValueAtTime(110, t);
    slamOsc.frequency.exponentialRampToValueAtTime(32, t + 0.22);
    slamGain.gain.setValueAtTime(0.6, t);
    slamGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    slamOsc.connect(slamGain);
    slamGain.connect(outputNode);
    slamOsc.start(t);
    slamOsc.stop(t + 0.26);

    // 2. Ruido marrón filtrado del encastre de la hoja
    if (this._brownNoiseBuffer) {
      const noise = this.ctx.createBufferSource();
      const filt = this.ctx.createBiquadFilter();
      const noiseGain = this.ctx.createGain();
      noise.buffer = this._brownNoiseBuffer;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(300, t);
      noiseGain.gain.setValueAtTime(0.35, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      noise.connect(filt);
      filt.connect(noiseGain);
      noiseGain.connect(outputNode);
      noise.start(t);
      noise.stop(t + 0.2);
    }

    // 3. Pestillo / cerrojo de hierro que cae y traba (t + 0.12s)
    const latchOsc = this.ctx.createOscillator();
    const latchGain = this.ctx.createGain();
    latchOsc.type = 'triangle';
    latchOsc.frequency.setValueAtTime(480, t + 0.12);
    latchOsc.frequency.exponentialRampToValueAtTime(140, t + 0.22);
    latchGain.gain.setValueAtTime(0.001, t);
    latchGain.gain.setValueAtTime(0.4, t + 0.12);
    latchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    latchOsc.connect(latchGain);
    latchGain.connect(outputNode);
    latchOsc.start(t + 0.12);
    latchOsc.stop(t + 0.25);
  }

  /**
   * Reproduce el sonido de apertura de cofre:
   * Crujido de bisagra + arpegio armónico resplandeciente de gemas/oro.
   */
  playChestOpen(sourcePos = null, listenerPos = null) {
    this._initContext();
    if (!this.ctx || this._isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const t = this.ctx.currentTime;
    let outputNode = this.masterGain;

    if (sourcePos && listenerPos) {
      const spatial = this._createSpatialNode(sourcePos, listenerPos, 28);
      if (!spatial || !spatial.audible) return;
      outputNode = spatial.input;
    }

    // Crujido inicial
    if (this._noiseBuffer) {
      const creakSrc = this.ctx.createBufferSource();
      const creakFilter = this.ctx.createBiquadFilter();
      const creakGain = this.ctx.createGain();

      creakSrc.buffer = this._noiseBuffer;
      creakFilter.type = 'bandpass';
      creakFilter.frequency.setValueAtTime(320, t);
      creakFilter.frequency.exponentialRampToValueAtTime(750, t + 0.22);
      creakFilter.Q.setValueAtTime(6.0, t);

      creakGain.gain.setValueAtTime(0.4, t);
      creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      creakSrc.connect(creakFilter);
      creakFilter.connect(creakGain);
      creakGain.connect(outputNode);
      creakSrc.start(t);
      creakSrc.stop(t + 0.30);
    }

    // Arpegio armónico de tesoro: Do5 (523Hz), Mi5 (659Hz), Sol5 (784Hz), Do6 (1046Hz)
    const chord = [523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.001, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.28, t + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.65);

      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.70);
    });
  }

  /**
   * Sonido sutil de salto: impulso aerodinámico (utiliza AudioBuffer pre-calculado para Zero-GC).
   */
  playJump() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;

    if (this._jumpBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this._jumpBuffer;
      src.connect(this.sfxGain || this.masterGain);
      src.start();
      return;
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Salpicadura y corriente acuática al entrar en torrente o canales de agua.
   */
  playWaterSplash() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.15);

    oscGain.gain.setValueAtTime(0.22, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.17);

    if (this._noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this._noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + 0.2);
      filter.Q.setValueAtTime(2.0, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(t);
      noise.stop(t + 0.23);
    }
  }

  /**
   * Retroalimentación sonora al hacer clic en botones de la interfaz (Zero-GC con AudioBuffer).
   */
  playClick() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;

    if (this._clickBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this._clickBuffer;
      src.connect(this.uiGain || this.masterGain);
      src.start();
      return;
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.uiGain || this.masterGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * Bendición del Pedestal Ancestral: arpegio ascendente místico + velo brillante.
   */
  playPedestal() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const t = this.ctx.currentTime;
    // Arpegio ascendente sagrado: Sol4, Do5, Mi5, Sol5, Do6
    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.09);
      gain.gain.setValueAtTime(0.001, t + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.26, t + idx * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.9);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.09);
      osc.stop(t + idx * 0.09 + 0.95);
    });
    // Velo brillante (shimmer agudo que corona la bendición)
    if (this._noiseBuffer) {
      const src = this.ctx.createBufferSource();
      const filt = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      src.buffer = this._noiseBuffer;
      filt.type = 'highpass';
      filt.frequency.setValueAtTime(5200, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.10, t + 0.35);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 1.05);
    }
  }

  /**
   * Llave conseguida: tintineo brillante de dos notas agudas (Zero-GC con AudioBuffer).
   */
  playKeyPickup() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this._keyPickupBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this._keyPickupBuffer;
      src.connect(this.sfxGain || this.masterGain);
      src.start();
      return;
    }

    const t = this.ctx.currentTime;
    [1318.5, 1568.0].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.09);
      gain.gain.setValueAtTime(0.001, t + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.24, t + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain);
      osc.start(t + idx * 0.09);
      osc.stop(t + idx * 0.09 + 0.45);
    });
  }

  /**
   * Poción de Vida consumida: melodía burbujeante ascendente y resplandor curativo.
   */
  playPotion() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const t = this.ctx.currentTime;
    // Arpegio curativo ascendente: Fa#5, La5, Do#6, Fa#6
    [739.99, 880.0, 1108.73, 1479.98].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.001, t + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.22, t + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.38);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.42);
    });
  }

  /**
   * Puerta bloqueada: golpe metálico sordo de cerradura.
   */
  playLocked() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(85, t + 0.12);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.18);
    if (this._noiseBuffer) {
      const src = this.ctx.createBufferSource();
      const filt = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      src.buffer = this._noiseBuffer;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(900, t);
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.12);
    }
  }

  /**
   * Daño por lava/caída: golpe descendente + chisporroteo de ruido.
   */
  playHurt() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.28);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.34);
    // Chisporroteo de lava con ruido blanco filtrado
    if (this._noiseBuffer) {
      const src = this.ctx.createBufferSource();
      const filt = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      src.buffer = this._noiseBuffer;
      filt.type = 'highpass';
      filt.frequency.setValueAtTime(1800, t);
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.42);
    }
  }

  /**
   * Game Over: fanfarria descendente de 3 notas graves.
   */
  playGameOver() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const t = this.ctx.currentTime;
    [220, 174, 130].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.18);
      gain.gain.setValueAtTime(0.001, t + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.32, t + idx * 0.18 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.18 + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.18);
      osc.stop(t + idx * 0.18 + 0.4);
    });
  }

  /**
   * Losa deslizante: roce piedra-piedra (ruido marrón filtrado) + tope grave.
   */
  playSlabGrind() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const t = this.ctx.currentTime;
    if (this._brownNoiseBuffer) {
      const src = this.ctx.createBufferSource();
      const filt = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      src.buffer = this._brownNoiseBuffer;
      src.loop = true;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(320, t);
      filt.frequency.exponentialRampToValueAtTime(90, t + 1.3);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + 1.55);
    }
    // Tope de la losa contra el sillar
    const thud = this.ctx.createOscillator();
    const thudG = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(70, t + 1.3);
    thud.frequency.exponentialRampToValueAtTime(34, t + 1.45);
    thudG.gain.setValueAtTime(0.4, t + 1.3);
    thudG.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    thud.connect(thudG);
    thudG.connect(this.masterGain);
    thud.start(t + 1.3);
    thud.stop(t + 1.52);
  }

  /**
   * Eco de descenso: barrido grave con reverberación de cueva procedural (ConvolverNode).
   */
  playDescentEcho() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const t = this.ctx.currentTime;
    // Reutilizar impulso de cueva pre-calculado (Zero-GC, sin generar 134.400 floats en el loop)
    let impulse = this._caveImpulseBuffer;
    if (!impulse) {
      const dur = 1.4;
      const rate = this.ctx.sampleRate;
      const len = Math.floor(rate * dur);
      impulse = this.ctx.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
        }
      }
      this._caveImpulseBuffer = impulse;
    }
    const conv = this.ctx.createConvolver();
    conv.buffer = impulse;
    const wet = this.ctx.createGain();
    wet.gain.setValueAtTime(0.5, t);
    conv.connect(wet);
    wet.connect(this.masterGain);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 1.3);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(conv);
    osc.start(t);
    osc.stop(t + 1.45);
  }

  /**
   * Resonancia de reaparición celestial: arpegio de campanillas/cristal místico
   * con armónicos senoidales ascendentes (C5-E5-G5-C6) y decaimiento suave sobre la losa de respawn.
   */
  playRespawn() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const start = t + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.42);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.45);
    });
  }

  /**
   * Losa de presión mecánica: click de percusión pétrea con resorte y engranaje + eco sutil.
   */
  playPressurePlate(sourcePos = null, listenerPos = null) {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const dist = (sourcePos && listenerPos) ? Math.hypot(sourcePos.x - listenerPos.x, sourcePos.z - listenerPos.z) : 0;
    const vol = Math.max(0.1, 1 - Math.min(dist / 16, 0.9));
    const t = this.ctx.currentTime;

    // 1. Clic percusivo pétreo/metálico de contacto
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(320, t);
    clickOsc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
    clickGain.gain.setValueAtTime(0.5 * vol, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(t);
    clickOsc.stop(t + 0.1);

    // 2. Resonancia grave de la losa encastrándose en el zócalo
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(140, t);
    thudOsc.frequency.exponentialRampToValueAtTime(42, t + 0.25);
    thudGain.gain.setValueAtTime(0.6 * vol, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);
    thudOsc.start(t);
    thudOsc.stop(t + 0.3);

    // 3. Fricción sutil de piedra (ruido marrón breve)
    if (this._brownNoiseBuffer) {
      const noise = this.ctx.createBufferSource();
      const filt = this.ctx.createBiquadFilter();
      const noiseGain = this.ctx.createGain();
      noise.buffer = this._brownNoiseBuffer;
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(420, t);
      filt.Q.setValueAtTime(2.2, t);
      noiseGain.gain.setValueAtTime(0.28 * vol, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      noise.connect(filt);
      filt.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(t);
      noise.stop(t + 0.22);
    }
  }
}

// Instancia singleton para fácil reutilización
export const soundManager = new SoundManager();
