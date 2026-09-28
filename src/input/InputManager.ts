import nipplejs from 'nipplejs';

export class InputManager {
  public moveX = 0;
  public moveZ = 0;
  public jump = false;
  public action = false;

  public yaw = 0;
  public pitch = 0;

  private joystickManager: nipplejs.JoystickManager | null = null;
  private lastTouchX = 0;
  private lastTouchY = 0;
  private isTouchingCamera = false;

  constructor() {
    this.setupNipple();
    this.setupTouchCamera();
    this.setupTouchButtons();
    this.setupDesktopFallback();
  }

  private setupNipple(): void {
    const zone = document.getElementById('joystick-zone');
    if (!zone) return;

    this.joystickManager = nipplejs.create({
      zone: zone,
      mode: 'dynamic',
      color: '#38bdf8',
      size: 90
    });

    this.joystickManager.on('move', (_evt, data) => {
      if (data && data.vector) {
        // Nipplejs: x es derecha/izquierda, y es arriba/abajo
        this.moveX = data.vector.x;
        this.moveZ = data.vector.y;
      }
    });

    this.joystickManager.on('end', () => {
      this.moveX = 0;
      this.moveZ = 0;
    });
  }

  private setupTouchCamera(): void {
    const camZone = document.getElementById('camera-zone');
    if (!camZone) return;

    const sensitivity = 0.005;

    camZone.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
        this.isTouchingCamera = true;
      }
    }, { passive: true });

    camZone.addEventListener('touchmove', (e: TouchEvent) => {
      if (!this.isTouchingCamera || e.touches.length === 0) return;

      const touch = e.touches[0];
      const dx = touch.clientX - this.lastTouchX;
      const dy = touch.clientY - this.lastTouchY;

      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;

      this.yaw -= dx * sensitivity;
      this.pitch -= dy * sensitivity;

      // Limitar pitch entre -80 y 80 grados
      const maxPitch = Math.PI / 2.2;
      this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
    }, { passive: true });

    const endTouch = () => {
      this.isTouchingCamera = false;
    };
    camZone.addEventListener('touchend', endTouch, { passive: true });
    camZone.addEventListener('touchcancel', endTouch, { passive: true });
  }

  private setupTouchButtons(): void {
    const btnJump = document.getElementById('btn-jump');
    const btnAction = document.getElementById('btn-action');

    if (btnJump) {
      btnJump.addEventListener('touchstart', () => { this.jump = true; }, { passive: true });
      btnJump.addEventListener('touchend', () => { this.jump = false; }, { passive: true });
    }

    if (btnAction) {
      btnAction.addEventListener('touchstart', () => { this.action = true; }, { passive: true });
      btnAction.addEventListener('touchend', () => { this.action = false; }, { passive: true });
    }
  }

  private setupDesktopFallback(): void {
    const keys: Record<string, boolean> = {};

    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      this.updateKeyboardMovement(keys);
    });

    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
      this.updateKeyboardMovement(keys);
    });

    // Pointer lock para control de cámara con ratón en PC
    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.yaw -= e.movementX * 0.0025;
        this.pitch -= e.movementY * 0.0025;
        const maxPitch = Math.PI / 2.2;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && document.pointerLockElement) {
        this.action = true;
        setTimeout(() => { this.action = false; }, 100);
      }
    });
  }

  private updateKeyboardMovement(keys: Record<string, boolean>): void {
    let x = 0;
    let z = 0;

    if (keys['KeyW'] || keys['ArrowUp']) z += 1;
    if (keys['KeyS'] || keys['ArrowDown']) z -= 1;
    if (keys['KeyA'] || keys['ArrowLeft']) x -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) x += 1;

    // Normalizar vector si ambas teclas se presionan
    const len = Math.hypot(x, z);
    if (len > 0) {
      this.moveX = x / len;
      this.moveZ = z / len;
    } else if (!this.joystickManager) {
      this.moveX = 0;
      this.moveZ = 0;
    }

    this.jump = !!keys['Space'];
  }
}
