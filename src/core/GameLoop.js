export class GameLoop {
  constructor({ tickHz = 30, onTick, onRender }) {
    this.step = 1000 / tickHz;
    this.acc = 0;
    this.last = 0;
    this.onTick = onTick;
    this.onRender = onRender;
    this.running = false;
    this._raf = null;
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      let dt = now - this.last;
      this.last = now;
      if (dt > 200) dt = 200; // protección contra pestañas inactivas
      this.acc += dt;
      let guard = 0;
      while (this.acc >= this.step && guard++ < 5) {
        this.onTick(this.step / 1000);
        this.acc -= this.step;
      }
      this.onRender(dt / 1000);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }
  stop() { this.running = false; if (this._raf) cancelAnimationFrame(this._raf); }
}
