import { WORLD_CONFIG, PLAYER_HEROES } from '../config/constants.js';

export class Player {
  constructor(id, x = WORLD_CONFIG.SPAWN_X, y = WORLD_CONFIG.SPAWN_Y, z = WORLD_CONFIG.SPAWN_Z, name = 'Aventurero', colorIndex = 0) {
    this.id = id;
    this.name = name;
    this.colorIndex = colorIndex;
    this.hero = PLAYER_HEROES[colorIndex] || PLAYER_HEROES[0];

    // Posición lógica/física autoritativa (utilizada por SimulationEngine y replay)
    this.pos = { x, y, z };
    // Posición visual suavizada (utilizada por CameraController para render a 60 FPS)
    this.visualPos = { x, y, z };

    this.vel = { x: 0, y: 0, z: 0 };
    this.yaw = 0;
    this.pitch = 0;
    this.onGround = false;
    this.inputForward = 0;
    this.inputRight = 0;
    this.lastInputSeq = 0;
    this.checkpoint = { x, y: 1.2, z, roomName: 'Sala 1 (Vestíbulo)' };
  }

  setColorIndex(colorIndex) {
    this.colorIndex = colorIndex;
    this.hero = PLAYER_HEROES[colorIndex] || PLAYER_HEROES[0];
  }

  setInput(forward, right, yaw = this.yaw) {
    this.inputForward = forward;
    this.inputRight = right;
    this.yaw = yaw;
  }

  updateVisualSmoothing(dt) {
    // Clampear dt a un máximo de 50ms para evitar tirones de cámara al reanudar tabs o tras caídas de FPS
    const safeDt = Math.min(dt, 0.05);
    // Suavizado visual exponencial (~0.5 por frame a 60 FPS)
    const t = 1 - Math.pow(0.001, safeDt);
    this.visualPos.x += (this.pos.x - this.visualPos.x) * t;
    this.visualPos.y += (this.pos.y - this.visualPos.y) * t;
    this.visualPos.z += (this.pos.z - this.visualPos.z) * t;
  }

  setCheckpoint(x, y, z, roomName = 'Punto de Control') {
    this.checkpoint = { x, y, z, roomName };
  }

  respawn() {
    const cp = this.checkpoint || {
      x: WORLD_CONFIG.SPAWN_X,
      y: 1.2,
      z: WORLD_CONFIG.SPAWN_Z,
      roomName: 'Sala 1 (Vestíbulo)',
    };
    this.pos.x = cp.x;
    this.pos.y = cp.y;
    this.pos.z = cp.z;
    this.visualPos.x = cp.x;
    this.visualPos.y = cp.y;
    this.visualPos.z = cp.z;
    this.vel.x = 0;
    this.vel.y = 0;
    this.vel.z = 0;
    this.onGround = false;
    return cp;
  }

  reset(x = WORLD_CONFIG.SPAWN_X, y = WORLD_CONFIG.SPAWN_Y, z = WORLD_CONFIG.SPAWN_Z) {
    this.pos.x = x;
    this.pos.y = y;
    this.pos.z = z;
    this.visualPos.x = x;
    this.visualPos.y = y;
    this.visualPos.z = z;
    this.vel.x = 0;
    this.vel.y = 0;
    this.vel.z = 0;
    this.onGround = false;
  }

  toSnapshot() {
    return {
      id: this.id,
      lastInputSeq: this.lastInputSeq || 0,
      x: this.pos.x,
      y: this.pos.y,
      z: this.pos.z,
      yaw: this.yaw,
      velY: this.vel.y,
      onGround: this.onGround,
    };
  }
}
