import nipplejs from 'nipplejs';

export class InputManager {
  constructor({ canvas, onJump, onInteract, onCameraToggle }) {
    this.canvas = canvas;
    this.onJump = onJump;
    this.onInteract = onInteract;
    this.onCameraToggle = onCameraToggle;

    this.keys = {};
    this.moveJoystick = { x: 0, y: 0 };
    this.pendingJump = false;

    this.yaw = 0;
    this.pitch = 0;

    this.pointerLocked = false;
    this.lookTouchId = null;
    this.lookTouchX = 0;
    this.lookTouchY = 0;

    this.isTouchDevice = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;
    let sens = 1.0;
    try {
      sens = parseFloat(localStorage.getItem('dungeon_sensitivity') || '1.0');
    } catch { /* ignore */ }
    this.sensitivity = sens;

    this.initKeyboard();
    this.initMouseLook();
    this.initTouchControls();
  }

  clearKeys() {
    this.keys = {};
    this.pendingJump = false;
    this.moveJoystick.x = 0;
    this.moveJoystick.y = 0;
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      this.keys[e.code] = true;
      if (e.code === 'Space') {
        this.pendingJump = true;
        this.onJump?.();
      } else if (e.code === 'KeyE' || e.code === 'KeyF' || e.code === 'Enter') {
        this.onInteract?.();
      } else if (e.code === 'KeyV') {
        this.onCameraToggle?.();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Limpieza de estado al perder el foco para evitar teclas atascadas (Alt+Tab, cambio de pestaña, salir de pointer lock)
    window.addEventListener('blur', () => this.clearKeys());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.clearKeys();
    });
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== this.canvas) this.clearKeys();
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
      this.yaw -= e.movementX * 0.0022 * this.sensitivity;
      this.pitch -= e.movementY * 0.0022 * this.sensitivity;
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
          this.yaw -= (t.clientX - this.lookTouchX) * 0.006 * this.sensitivity;
          this.pitch -= (t.clientY - this.lookTouchY) * 0.006 * this.sensitivity;
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
    btn.style.display = 'none'; // Oculto inicialmente; UIManager lo activa solo al entrar en juego
    const handler = (e) => {
      e.preventDefault();
      // Háptica sutil en móviles que la soporten
      if (navigator.vibrate) {
        try { navigator.vibrate(12); } catch { /* sin háptica */ }
      }
      callback();
    };
    btn.addEventListener('touchstart', handler, { passive: false });
    btn.addEventListener('mousedown', handler);
  }

  getMovement() {
    const kForward = (this.keys['KeyW'] || this.keys['ArrowUp'] ? 1 : 0) - (this.keys['KeyS'] || this.keys['ArrowDown'] ? 1 : 0);
    const kRight = (this.keys['KeyD'] || this.keys['ArrowRight'] ? 1 : 0) - (this.keys['KeyA'] || this.keys['ArrowLeft'] ? 1 : 0);

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

  setSensitivity(val) {
    this.sensitivity = Math.max(0.3, Math.min(3.0, val));
    localStorage.setItem('dungeon_sensitivity', this.sensitivity.toString());
  }
}
