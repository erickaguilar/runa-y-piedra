// src/ui/Spring.js
/**
 * Integrador de resorte amortiguado (semi-implicit Euler, 4 sub-pasos).
 * Autónomo, sin registry. Cada consumidor es dueño de su instancia.
 *
 * Parámetros típicos (target=1, from=0):
 *   Crítico      (180, 22)  → sin overshoot, ~200ms
 *   Pop          (200, 14)  → 1 overshoot, ~350ms
 *   Rebote       (260, 10)  → 2-3 overshoots, ~500ms
 */
export class Spring {
  constructor(stiffness = 180, damping = 22, value = 0) {
    this.k = stiffness;
    this.c = damping;
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this._settled = true;
  }

  set(target) {
    if (target !== this.target) {
      this.target = target;
      this._settled = false;
    }
  }

  /** Salta instantáneamente, sin física. Útil al inicializar. */
  snap(v) {
    this.value = this.target = v;
    this.velocity = 0;
    this._settled = true;
  }

  /** Avanza el resorte. dt en segundos. Retorna el valor actual. */
  update(dt) {
    if (this._settled) return this.value;

    const h = Math.min(dt, 0.05) / 4;
    for (let i = 0; i < 4; i++) {
      const a = -this.k * (this.value - this.target) - this.c * this.velocity;
      this.velocity += a * h;
      this.value += this.velocity * h;
    }

    if (Math.abs(this.value - this.target) < 5e-4 &&
        Math.abs(this.velocity) < 5e-4) {
      this.value = this.target;
      this.velocity = 0;
      this._settled = true;
    }
    return this.value;
  }

  get isSettled() { return this._settled; }
}
