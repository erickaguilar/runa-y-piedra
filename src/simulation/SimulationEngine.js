import { tryMove } from '../core/PhysicsAABB.js';
import { PHYSICS_CONFIG, WORLD_CONFIG } from '../config/constants.js';

export class SimulationEngine {
  constructor(world) {
    this.world = world;
  }

  integratePlayer(p, dt) {
    // Cálculo de velocidad según yaw e input
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    const rx =  Math.cos(p.yaw), rz = -Math.sin(p.yaw);
    p.vel.x = (fx * p.inputForward + rx * p.inputRight) * PHYSICS_CONFIG.SPEED;
    p.vel.z = (fz * p.inputForward + rz * p.inputRight) * PHYSICS_CONFIG.SPEED;

    p.vel.y += PHYSICS_CONFIG.GRAVITY * dt;
    if (p.vel.y < PHYSICS_CONFIG.TERMINAL_VELOCITY) {
      p.vel.y = PHYSICS_CONFIG.TERMINAL_VELOCITY;
    }

    const r = tryMove(this.world, p.pos, p.vel.x * dt, p.vel.y * dt, p.vel.z * dt);
    if (r.onGround) {
      p.onGround = true;
      if (p.vel.y < 0) p.vel.y = 0;
    } else {
      p.onGround = false;
    }

    // Rescate al vacío
    if (p.pos.y < WORLD_CONFIG.VOID_RESCUE_Y) {
      p.reset(WORLD_CONFIG.SPAWN_X, WORLD_CONFIG.SPAWN_Y, WORLD_CONFIG.SPAWN_Z);
    }
  }

  stepHost(playerManager, dt) {
    for (const player of playerManager.getAllPlayers()) {
      this.integratePlayer(player, dt);
    }
  }

  stepClient(playerManager, dt) {
    this.integratePlayer(playerManager.localPlayer, dt);
  }
}
