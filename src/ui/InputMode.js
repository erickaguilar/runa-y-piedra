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
    this.mode = this._initialGuess();
    this.listeners = new Set();
    this._bind();
    this._apply();
  }

  _initialGuess() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'pc';
    }
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const hasFine = window.matchMedia('(any-pointer: fine)').matches;
    // Si tiene apuntador fino (ratón/trackpad físico), priorizar PC en híbridos
    return hasFine ? 'pc' : (isTouch ? 'touch' : 'pc');
  }

  _bind() {
    if (typeof window === 'undefined') return;

    // Cualquier pulsación de tecla real -> cambiar inmediatamente a modo PC
    window.addEventListener('keydown', (e) => {
      if (['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
           'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(e.code)) return;
      this.setMode('pc');
    }, { passive: true });

    // Cualquier toque táctil en pantalla -> cambiar inmediatamente a modo táctil
    window.addEventListener('touchstart', () => {
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
