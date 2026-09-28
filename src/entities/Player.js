import { WORLD_CONFIG, PLAYER_HEROES } from '../config/constants.js';

export class Player {
  constructor(id, x = WORLD_CONFIG.SPAWN_X, y = WORLD_CONFIG.SPAWN_Y, z = WORLD_CONFIG.SPAWN_Z, name = 'Aventurero', colorIndex = 0) {
    this.id = id;
    this.name = name;
    this.colorIndex = colorIndex;
    this.hero = PLAYER_HEROES[colorIndex] || PLAYER_HEROES[0];
    this.pos = { x, y, z };
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
    };
  }
}
