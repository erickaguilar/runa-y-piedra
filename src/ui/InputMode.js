// src/ui/InputMode.js

/**
 * InputMode - Detección dinámica y adaptativa del modo de entrada (PC vs Táctil).
 *
 * Resuelve dispositivos híbridos (Surface, laptops táctiles, tablets con teclado/ratón):
 * - Si el usuario pulsa una tecla -> activa modo 'pc' (oculta botones táctiles y activa crosshair).
 * - Si el usuario toca la pantalla -> activa modo 'touch' (muestra joystick y botones táctiles).
 */
export class InputMode {
  constructor() {
    this.lastKeyTime = 0;
    this.mode = this._initialGuess();
    this.listeners = new Set();
    this._bind();
    this._apply();
  }

  _initialGuess() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'pc';
    }
    const isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const hasFine = window.matchMedia('(pointer: fine)').matches && !isTouch;
    return isTouch ? 'touch' : (hasFine ? 'pc' : 'touch');
  }

  _bind() {
    if (typeof window === 'undefined') return;

    // Cualquier pulsación de tecla real de juego -> cambiar inmediatamente a modo PC si no está en un input
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || e.isComposing) return;
      this.lastKeyTime = Date.now();
      if (['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
           'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(e.code)) return;
      this.setMode('pc');
    }, { passive: true });

    // Toque táctil -> cambiar a modo táctil
    window.addEventListener('touchstart', (e) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      if (Date.now() - this.lastKeyTime < 300) return;
      this.setMode('touch');
    }, { passive: true });
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this._apply();
    for (const cb of this.listeners) {
      try {
        cb(mode);
      } catch (err) {
        console.error('[InputMode] Error en listener:', err);
      }
    }
  }

  onModeChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  _apply() {
    if (typeof document === 'undefined') return;
    if (document.documentElement) {
      document.documentElement.dataset.inputMode = this.mode;
    }
    if (document.body) {
      document.body.classList.toggle('input-pc', this.mode === 'pc');
      document.body.classList.toggle('input-touch', this.mode === 'touch');
    }
  }
}
