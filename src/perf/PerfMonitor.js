export const PERF_BUDGET = {
  FPS_TARGET: 60,
  FPS_MIN: 30,
  DRAW_CALLS_MAX: 25,
};

export class PerfMonitor {
  constructor({ windowMs = 1000 } = {}) {
    this.windowMs = windowMs;
    this.frames = 0;
    this.elapsed = 0;
    this.fps = 0;
    // EMA suavizada para overlay estable
    this.fpsEma = 0;
    this.worstDt = 0;
  }

  /** Registra un frame. dt en segundos (como entrega GameLoop.onRender). */
  record(dtSec = 1 / 60) {
    const dtMs = Math.max(0.01, dtSec * 1000);
    this.frames += 1;
    this.elapsed += dtMs;
    if (dtMs > this.worstDt) this.worstDt = dtMs;
    if (this.elapsed >= this.windowMs) {
      const instant = (this.frames * 1000) / this.elapsed;
      this.fps = Math.round(instant);
      this.fpsEma = this.fpsEma === 0 ? this.fps : Math.round(this.fpsEma * 0.6 + this.fps * 0.4);
      this.frames = 0;
      this.elapsed = 0;
      this.worstDt = 0;
    }
    return this.fpsEma || this.fps;
  }

  getStats() {
    return { fps: this.fpsEma || this.fps };
  }

  static fpsColor(fps) {
    if (fps >= PERF_BUDGET.FPS_TARGET - 5) return '#4ade80';
    if (fps >= PERF_BUDGET.FPS_MIN) return '#f59e0b';
    return '#ef4444';
  }

  static drawCallsColor(calls) {
    if (calls <= PERF_BUDGET.DRAW_CALLS_MAX) return '#4ade80';
    if (calls <= PERF_BUDGET.DRAW_CALLS_MAX * 2) return '#f59e0b';
    return '#ef4444';
  }
}
