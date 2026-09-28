import nipplejs from 'nipplejs';

export class InputManager {
  constructor({ canvas, onJump, onInteract }) {
    this.canvas = canvas;
    this.onJump = onJump;
    this.onInteract = onInteract;

    this.keys = {};
    this.moveJoystick = { x: 0, y: 0 };
    this.pendingJump = false;

    this.yaw = 0;
    this.pitch = 0;

    this.pointerLocked = false;
    this.lookTouchId = null;
    this.lookTouchX = 0;
    this.lookTouchY = 0;

    this.isTouchDevice = matchMedia('(pointer: coarse)').matches;

    this.initKeyboard();
    this.initMouseLook();
    this.initTouchControls();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        this.pendingJump = true;
        this.onJump?.();
      } else if (e.code === 'KeyE' || e.code === 'KeyF') {
        this.onInteract?.();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  initMouseLook() {
    this.canvas.addEventListener('click', () => {
      if (!this.isTouchDevice) {
        this.canvas.requestPointerLock?.();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      this.yaw -= e.movementX * 0.0022;
      this.pitch -= e.movementY * 0.0022;
      this.pitch = Math.max(-1.55, Math.min(1.55, this.pitch));
    });

    window.addEventListener('mousedown', (e) => {
      if (!this.pointerLocked) return;
      if (e.button === 0) {
        this.onInteract?.();
      }
    });

    window.addEventListener('contextmenu', (e) => {
      if (this.pointerLocked) e.preventDefault();
    });
  }

  initTouchControls() {
    if (!this.isTouchDevice) return;

    // 1. Zona izquierda: Joystick Nipple.js
    const zone = document.createElement('div');
    zone.id = 'joystick-zone';
    zone.style.cssText = 'position:fixed;left:0;bottom:0;width:45vw;height:55vh;z-index:18;touch-action:none;';
    document.body.appendChild(zone);

    this.joystick = nipplejs.create({
      zone,
      mode: 'dynamic',
      color: 'rgba(255,255,255,0.7)',
      size: 110,
      threshold: 0.05,
    });

    this.joystick.on('move', (_e, data) => {
      if (data && data.vector) {
        this.moveJoystick.x = data.vector.x;
        this.moveJoystick.y = data.vector.y;
      }
    });

    this.joystick.on('end', () => {
      this.moveJoystick.x = 0;
      this.moveJoystick.y = 0;
    });

    // 2. Zona derecha: Touch Look para rotar cámara
    this.canvas.addEventListener('touchstart', (e) => {
      if (this.lookTouchId !== null) return;
      for (const t of e.changedTouches) {
        if (t.clientX > window.innerWidth * 0.45) {
          this.lookTouchId = t.identifier;
          this.lookTouchX = t.clientX;
          this.lookTouchY = t.clientY;
          break;
        }
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.lookTouchId) {
          this.yaw -= (t.clientX - this.lookTouchX) * 0.006;
          this.pitch -= (t.clientY - this.lookTouchY) * 0.006;
          this.pitch = Math.max(-1.55, Math.min(1.55, this.pitch));
          this.lookTouchX = t.clientX;
          this.lookTouchY = t.clientY;
        }
      }
    }, { passive: true });

    const endLook = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    };
    this.canvas.addEventListener('touchend', endLook, { passive: true });
    this.canvas.addEventListener('touchcancel', endLook, { passive: true });

    // 3. Botones táctiles de Mazmorra (SALTAR e INTERACTUAR/ABRIR)
    this.bindTouchButton('btn-jump', () => {
      this.pendingJump = true;
      this.onJump?.();
    });
    this.bindTouchButton('btn-interact', () => this.onInteract?.());
  }

  bindTouchButton(id, callback) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.style.display = 'flex';
    const handler = (e) => {
      e.preventDefault();
      callback();
    };
    btn.addEventListener('touchstart', handler, { passive: false });
    btn.addEventListener('mousedown', handler);
  }

  getMovement() {
    const kForward = (this.keys['KeyW'] ? 1 : 0) - (this.keys['KeyS'] ? 1 : 0);
    const kRight = (this.keys['KeyD'] ? 1 : 0) - (this.keys['KeyA'] ? 1 : 0);

    let forward = kForward + this.moveJoystick.y;
    let right = kRight + this.moveJoystick.x;

    const mag = Math.hypot(forward, right);
    if (mag > 1) {
      forward /= mag;
      right /= mag;
    }

    return { forward, right };
  }

  consumeJump() {
    const jump = this.pendingJump;
    this.pendingJump = false;
    return jump;
  }
}
