import { WORLD_CONFIG } from '../config/constants.js';

export class Player {
  constructor(id, x = WORLD_CONFIG.SPAWN_X, y = WORLD_CONFIG.SPAWN_Y, z = WORLD_CONFIG.SPAWN_Z) {
    this.id = id;
    this.pos = { x, y, z };
    this.vel = { x: 0, y: 0, z: 0 };
    this.yaw = 0;
    this.pitch = 0;
    this.onGround = false;
    this.inputForward = 0;
    this.inputRight = 0;
  }

  setInput(forward, right, yaw = this.yaw) {
    this.inputForward = forward;
    this.inputRight = right;
    this.yaw = yaw;
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
      x: this.pos.x,
      y: this.pos.y,
      z: this.pos.z,
      yaw: this.yaw,
    };
  }
}
