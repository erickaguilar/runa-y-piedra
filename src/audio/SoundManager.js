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

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this._isMuted = false;
    this._volume = 0.6;
    this._noiseBuffer = null;
    this._brownNoiseBuffer = null;
    this._initialized = false;

    // Cargar preferencia de mute desde localStorage
    if (typeof localStorage !== 'undefined') {
      this._isMuted = localStorage.getItem('dungeon_sound_muted') === '1';
    }

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

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this._isMuted ? 0 : this._volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this._generateNoiseBuffers();
      this._initialized = true;
    } catch (e) {
      console.warn('[SoundManager] No se pudo inicializar Web Audio API:', e);
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
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dungeon_sound_muted', this._isMuted ? '1' : '0');
    }
    if (this.masterGain && this.ctx) {
      const targetGain = this._isMuted ? 0 : this._volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
    return this._isMuted;
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
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(distanceGain * distanceGain, this.ctx.currentTime);

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
   * Sonido sutil de salto: impulso aerodinámico.
   */
  playJump() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Retroalimentación sonora al hacer clic en botones de la interfaz.
   */
  playClick() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);
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
   * Llave conseguida: tintineo brillante de dos notas agudas.
   */
  playKeyPickup() {
    this._initContext();
    if (!this.ctx || this._isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
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
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.09);
      osc.stop(t + idx * 0.09 + 0.45);
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
}

// Instancia singleton para fácil reutilización
export const soundManager = new SoundManager();
