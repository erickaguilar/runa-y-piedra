import nipplejs from 'nipplejs';

export class TouchControls {
  public deltaX = 0;
  public deltaZ = 0;
  public jump = false;
  public breakAction = false;
  public placeAction = false;

  public yaw = 0;
  public pitch = 0;

  private joystick: nipplejs.JoystickManager | null = null;
  private lastTouchX = 0;
  private lastTouchY = 0;
  private isLooking = false;

  constructor() {
    this.setupJoystick();
    this.setupCameraLook();
    this.setupButtons();
    this.setupKeyboardFallback();
  }

  private setupJoystick(): void {
    const zone = document.getElementById('joystick-zone');
    if (!zone) return;

    this.joystick = nipplejs.create({
      zone: zone,
      mode: 'dynamic',
      color: '#38bdf8',
      size: 90
    });

    this.joystick.on('move', (_evt, data) => {
      if (data && data.vector) {
        this.deltaX = data.vector.x;
        this.deltaZ = data.vector.y;
      }
    });

    this.joystick.on('end', () => {
      this.deltaX = 0;
      this.deltaZ = 0;
    });
  }

  private setupCameraLook(): void {
    const camZone = document.getElementById('camera-zone');
    if (!camZone) return;

    const sensitivity = 0.005;

    camZone.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        this.lastTouchX = e.touches[0].clientX;
        this.lastTouchY = e.touches[0].clientY;
        this.isLooking = true;
      }
    }, { passive: true });

    camZone.addEventListener('touchmove', (e: TouchEvent) => {
      if (!this.isLooking || e.touches.length === 0) return;

      const touch = e.touches[0];
      const dx = touch.clientX - this.lastTouchX;
      const dy = touch.clientY - this.lastTouchY;

      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;

      this.yaw -= dx * sensitivity;
      this.pitch -= dy * sensitivity;

      const limit = Math.PI / 2.2;
      this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
    }, { passive: true });

    const endLook = () => { this.isLooking = false; };
    camZone.addEventListener('touchend', endLook, { passive: true });
    camZone.addEventListener('touchcancel', endLook, { passive: true });
  }

  private setupButtons(): void {
    const btnJump = document.getElementById('btn-jump');
    const btnBreak = document.getElementById('btn-break');
    const btnPlace = document.getElementById('btn-place');

    if (btnJump) {
      btnJump.addEventListener('touchstart', () => { this.jump = true; }, { passive: true });
      btnJump.addEventListener('touchend', () => { this.jump = false; }, { passive: true });
    }

    if (btnBreak) {
      btnBreak.addEventListener('touchstart', () => {
        this.breakAction = true;
        setTimeout(() => { this.breakAction = false; }, 100);
      }, { passive: true });
    }

    if (btnPlace) {
      btnPlace.addEventListener('touchstart', () => {
        this.placeAction = true;
        setTimeout(() => { this.placeAction = false; }, 100);
      }, { passive: true });
    }
  }

  private setupKeyboardFallback(): void {
    const keys: Record<string, boolean> = {};

    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      this.updateKeyboard(keys);
    });

    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
      this.updateKeyboard(keys);
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.yaw -= e.movementX * 0.0025;
        this.pitch -= e.movementY * 0.0025;
        const limit = Math.PI / 2.2;
        this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (!document.pointerLockElement) return;
      if (e.button === 0) {
        // Clic izquierdo: Romper
        this.breakAction = true;
        setTimeout(() => { this.breakAction = false; }, 100);
      } else if (e.button === 2) {
        // Clic derecho: Colocar
        this.placeAction = true;
        setTimeout(() => { this.placeAction = false; }, 100);
      }
    });

    window.addEventListener('contextmenu', (e) => {
      if (document.pointerLockElement) {
        e.preventDefault();
      }
    });
  }

  private updateKeyboard(keys: Record<string, boolean>): void {
    let x = 0;
    let z = 0;

    if (keys['KeyW'] || keys['ArrowUp']) z += 1;
    if (keys['KeyS'] || keys['ArrowDown']) z -= 1;
    if (keys['KeyA'] || keys['ArrowLeft']) x -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) x += 1;

    const len = Math.hypot(x, z);
    if (len > 0) {
      this.deltaX = x / len;
      this.deltaZ = z / len;
    } else if (!this.joystick) {
      this.deltaX = 0;
      this.deltaZ = 0;
    }

    this.jump = !!keys['Space'];
  }
}
