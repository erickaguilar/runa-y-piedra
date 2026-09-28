import nipplejs from 'nipplejs';

export class TouchControls {
  constructor(container, { onJump, onDestroy, onPlace } = {}) {
    this.move = { x: 0, y: 0 };
    this._isTouch = matchMedia('(pointer: coarse)').matches;

    if (this._isTouch) {
      const zone = document.createElement('div');
      zone.style.cssText =
        'position:fixed;left:0;bottom:0;width:45vw;height:55vh;z-index:18;';
      container.appendChild(zone);

      this.joystick = nipplejs.create({
        zone,
        mode: 'dynamic',
        color: 'rgba(255,255,255,0.7)',
        size: 110,
        threshold: 0.05,
      });
      this.joystick.on('move', (_e, d) => {
        if (!d.vector) return;
        this.move.x = d.vector.x;
        this.move.y = d.vector.y;
      });
      this.joystick.on('end', () => { this.move.x = 0; this.move.y = 0; });

      // Botones de acción visibles en táctil
      for (const id of ['btn-place', 'btn-destroy', 'btn-jump']) {
        const b = document.getElementById(id);
        if (b) b.style.display = 'flex';
      }
    }

    const jump = document.getElementById('btn-jump');
    const place = document.getElementById('btn-place');
    const destroy = document.getElementById('btn-destroy');

    const bind = (el, cb) => {
      if (!el || !cb) return;
      const stop = (e) => { e.preventDefault(); cb(); };
      el.addEventListener('touchstart', stop, { passive: false });
      el.addEventListener('mousedown', stop);
    };
    bind(jump, onJump);
    bind(place, onPlace);
    bind(destroy, onDestroy);
  }

  getMovement() {
    // devuelve {x: right, y: forward} en rango [-1,1]
    return this.move;
  }
}
