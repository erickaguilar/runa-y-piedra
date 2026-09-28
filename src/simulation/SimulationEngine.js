import { tryMove } from '../core/PhysicsAABB.js';
import { PHYSICS_CONFIG, WORLD_CONFIG } from '../config/constants.js';

export class SimulationEngine {
  constructor(world, { onPlayerRespawn } = {}) {
    this.world = world;
    this.onPlayerRespawn = onPlayerRespawn || null;
  }

  integratePlayer(p, dt) {
    // 1. Cálculo de velocidad según yaw e input
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

    // 2. Registro dinámico de Puntos de Reaparición (Checkpoints por nivel)
    // Se registran únicamente cuando el jugador pisa suelo firme (pos.y >= 0.95)
    if (p.onGround && p.pos.y >= 0.95) {
      if (Array.isArray(this.world.checkpoints) && this.world.checkpoints.length > 0) {
        for (const cp of this.world.checkpoints) {
          if (p.pos.z >= cp.minZ && p.pos.z <= cp.maxZ) {
            if (!p.checkpoint || p.checkpoint.roomName !== cp.name) {
              p.setCheckpoint(cp.respawn.x, cp.respawn.y, cp.respawn.z, cp.name);
            }
            break;
          }
        }
      } else {
        if (p.pos.z >= 24.5) {
          if (!p.checkpoint || p.checkpoint.roomName !== 'Sala 3 (Santuario Ancestral)') {
            p.setCheckpoint(11.5, 1.2, 25.0, 'Sala 3 (Santuario Ancestral)');
          }
        } else if (p.pos.z >= 11.5 && p.pos.z < 24.0) {
          if (!p.checkpoint || p.checkpoint.roomName !== 'Sala 2 (El Abismo)') {
            p.setCheckpoint(11.5, 1.2, 12.0, 'Sala 2 (El Abismo)');
          }
        } else if (p.pos.z < 11.0) {
          if (!p.checkpoint || p.checkpoint.roomName !== 'Sala 1 (Vestíbulo)') {
            p.setCheckpoint(WORLD_CONFIG.SPAWN_X, 1.2, WORLD_CONFIG.SPAWN_Z, 'Sala 1 (Vestíbulo)');
          }
        }
      }
    }

    // 3. Rescate y Reaparición al Caer al Abismo / Vacío
    if (p.pos.y < -0.5) {
      const cp = p.respawn();
      if (this.onPlayerRespawn) {
        this.onPlayerRespawn(p, cp);
      }
    }

    // 4. Seguridad Anti-Barda: Si termina en lo alto de las bardas perimetrales exteriores
    if (p.pos.y >= 3.8 && (p.pos.x <= 1.0 || p.pos.x >= WORLD_CONFIG.SIZE_X - 2.0 || p.pos.z <= 1.0 || p.pos.z >= WORLD_CONFIG.SIZE_Z - 2.0)) {
      const cp = p.respawn();
      if (this.onPlayerRespawn) {
        this.onPlayerRespawn(p, cp);
      }
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
