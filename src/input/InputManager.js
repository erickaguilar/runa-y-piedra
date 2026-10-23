import nipplejs from 'nipplejs';
import { saveManager } from '../storage/SaveManager.js';

export class InputManager {
  constructor({ canvas, inputMode = null, isGameActive = null, onJump, onInteract, onAttack, onCameraToggle, onSettingsToggle, onInventoryToggle, onUsePotion, onControlsToggle, onChapterMapToggle, onToggleFlightMode }) {
    this.canvas = canvas;
    this.inputMode = inputMode;
    this.isGameActive = isGameActive;
    this.onJump = onJump;
    this.onInteract = onInteract;
    this.onAttack = onAttack;
    this.onCameraToggle = onCameraToggle;
    this.onSettingsToggle = onSettingsToggle;
    this.onInventoryToggle = onInventoryToggle;
    this.onUsePotion = onUsePotion;
    this.onControlsToggle = onControlsToggle;
    this.onChapterMapToggle = onChapterMapToggle;
    this.onToggleFlightMode = onToggleFlightMode;

    this.keys = {};
    this.moveJoystick = { x: 0, y: 0 };
    this.flightJoystick = { x: 0, y: 0 };
    this.isFlightMode = false;
    this.pendingJump = false;

    this.yaw = Math.PI;
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
      const savedSens = saveManager.getSettings?.()?.sensitivity ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('dungeon_sensitivity') : null);
      if (savedSens !== null && savedSens !== undefined) {
        sens = parseFloat(savedSens);
      }
    } catch { /* ignore */ }
    this.sensitivity = Number.isFinite(sens) ? sens : 1.0;

    this.initKeyboard();
    this.initMouseLook();
    this.initTouchControls();
    this.initFlightStick();
  }

  clearKeys() {
    this.keys = {};
    this.pendingJump = false;
    this.moveJoystick.x = 0;
    this.moveJoystick.y = 0;
    this.flightJoystick.x = 0;
    this.flightJoystick.y = 0;
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      const tag = /** @type {HTMLElement} */ (e.target)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault(); // Evitar scroll accidental de la página en navegadores de escritorio
        this.keys[e.code] = true;
        this.pendingJump = true;
        this.onJump?.();
        return;
      }

      if (e.code === 'KeyF' || e.code === 'KeyJ') {
        e.preventDefault();
        this.onAttack?.();
        return;
      }

      if (e.code === 'KeyE' || e.code === 'Enter') {
        e.preventDefault();
        this.onInteract?.();
        return;
      }

      if (e.code === 'KeyB' || e.code === 'KeyI') {
        e.preventDefault();
        this.onInventoryToggle?.();
        return;
      }

      if (e.code === 'KeyH') {
        e.preventDefault();
        this.onControlsToggle?.();
        return;
      }

      if (e.code === 'KeyP') {
        e.preventDefault();
        this.onUsePotion?.();
        return;
      }

      if (e.code === 'KeyM') {
        e.preventDefault();
        this.onChapterMapToggle?.();
        return;
      }

      if (e.code === 'KeyV') {
        e.preventDefault();
        this.onToggleFlightMode?.();
        return;
      }

      if (e.code === 'Escape') {
        this.onSettingsToggle?.();
        return;
      }

      this.keys[e.code] = true;
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
    this.canvas.addEventListener('click', (_e) => {
      // Solo en modo PC y si la partida está activa (evitar capturar ratón en menús)
      if (this.inputMode && this.inputMode.mode !== 'pc') return;
      if (this.isGameActive && !this.isGameActive()) return;

      // No capturar pointer lock si hay un modal o panel de herramientas abierto
      if (document.getElementById('modal-settings') || document.getElementById('modal-dev')) return;

      if (document.pointerLockElement !== this.canvas) {
        try {
          const req = this.canvas.requestPointerLock?.();
          if (req && typeof req.catch === 'function') {
            req.catch(() => { /* ignorar SecurityError transitorio de navegador */ });
          }
        } catch { /* ignorar */ }
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      if (!this.pointerLocked) this.clearKeys();
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
        if (this.onAttack) {
          this.onAttack();
        } else {
          this.onInteract?.();
        }
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
          // Si el toque cae dentro del área de la palanca de vuelo activa, no capturarlo como rotación de cámara
          if (this.isFlightMode) {
            const flightZone = document.getElementById('flight-stick-zone');
            if (flightZone && flightZone.style.display !== 'none') {
              const r = flightZone.getBoundingClientRect();
              if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom) {
                continue;
              }
            }
          }
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

    // 3. Botones táctiles de Mazmorra (SALTAR, ATACAR e INTERACTUAR/ABRIR)
    this.bindTouchButton('btn-jump', () => {
      this.pendingJump = true;
      this.onJump?.();
    });
    this.bindTouchButton('btn-attack', () => this.onAttack?.());
    this.bindTouchButton('btn-interact', () => this.onInteract?.());
  }

  initFlightStick() {
    const base = document.getElementById('flight-stick-base');
    const knob = document.getElementById('flight-stick-knob');
    const badge = document.getElementById('flight-stick-badge');

    if (!base || !knob) return;

    if (badge) {
      const toggle = (e) => {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
        this.onToggleFlightMode?.();
      };
      badge.addEventListener('click', toggle);
      badge.addEventListener('touchend', toggle, { passive: false });
    }

    let activePointerId = null;
    const maxRadius = 38;

    const updateKnob = (clientX, clientY) => {
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      knob.style.transform = `translate(${dx}px, ${dy}px)`;

      // Normalizado: -1 a 1
      // dy < 0 hacia ARRIBA -> elevarse (subir)
      // dy > 0 hacia ABAJO -> descender (bajar)
      this.flightJoystick.x = dx / maxRadius;
      this.flightJoystick.y = -dy / maxRadius;
    };

    const handlePointerDown = (e) => {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      if (activePointerId !== null) return;
      activePointerId = e.pointerId ?? (e.touches ? e.touches[0]?.identifier : 1);

      if (knob.setPointerCapture && e.pointerId !== undefined) {
        try { knob.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      }

      knob.classList.add('active');
      knob.style.transition = 'none';

      if (navigator.vibrate) {
        try { navigator.vibrate(10); } catch { /* ignore */ }
      }

      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      updateKnob(clientX, clientY);
    };

    const handlePointerMove = (e) => {
      if (activePointerId === null) return;
      const currentId = e.pointerId ?? (e.touches ? e.touches[0]?.identifier : activePointerId);
      if (currentId !== activePointerId && e.pointerId !== undefined) return;
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();

      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      updateKnob(clientX, clientY);
    };

    const handlePointerUp = (e) => {
      if (activePointerId === null) return;
      if (e.pointerId !== undefined && e.pointerId !== activePointerId) return;
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();

      if (knob.releasePointerCapture && e.pointerId !== undefined) {
        try { knob.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      }

      activePointerId = null;
      knob.classList.remove('active');
      knob.style.transition = 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)';
      knob.style.transform = 'translate(0px, 0px)';

      this.flightJoystick.x = 0;
      this.flightJoystick.y = 0;

      setTimeout(() => {
        if (activePointerId === null) {
          knob.style.transition = 'none';
        }
      }, 160);
    };

    base.addEventListener('pointerdown', handlePointerDown, { passive: false });
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
    window.addEventListener('pointercancel', handlePointerUp, { passive: false });

    base.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp, { passive: false });
    window.addEventListener('touchcancel', handlePointerUp, { passive: false });
  }

  setFlightMode(enabled) {
    this.isFlightMode = !!enabled;
    const zone = document.getElementById('flight-stick-zone');
    const btnJump = document.getElementById('btn-jump');
    if (zone) {
      zone.style.display = this.isFlightMode ? 'flex' : 'none';
    }
    if (btnJump) {
      if (this.isFlightMode) {
        btnJump.style.display = 'none';
      } else {
        const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? (window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0))
          : false;
        btnJump.style.display = isTouch ? 'flex' : 'none';
      }
    }
    if (!this.isFlightMode) {
      this.flightJoystick.x = 0;
      this.flightJoystick.y = 0;
      const knob = document.getElementById('flight-stick-knob');
      if (knob) knob.style.transform = 'translate(0px, 0px)';
    }
  }

  getFlightElevation() {
    if (!this.isFlightMode) return 0;
    return this.flightJoystick.y;
  }

  consumeFlightYawDelta(dt) {
    if (!this.isFlightMode || Math.abs(this.flightJoystick.x) < 0.05) return 0;
    const turnSpeed = 2.4 * this.sensitivity;
    return -this.flightJoystick.x * turnSpeed * dt;
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
    saveManager.updateSettings({ sensitivity: this.sensitivity });
  }
}
