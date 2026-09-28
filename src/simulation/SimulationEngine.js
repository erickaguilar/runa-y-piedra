import { tryMove } from '../core/PhysicsAABB.js';
import { PHYSICS_CONFIG, WORLD_CONFIG, BLOCK_TYPES } from '../config/constants.js';
import { ACTION_FLAGS } from '../network/Protocol.js';

const HALF_W = (PHYSICS_CONFIG.PLAYER_W || 0.6) / 2;
const PLAYER_H = PHYSICS_CONFIG.PLAYER_H || 1.8;

export class SimulationEngine {
  constructor(world, { onPlayerRespawn } = {}) {
    this.world = world;
    this.onPlayerRespawn = onPlayerRespawn || null;
  }

  isTouchingLava(p) {
    const minX = Math.floor(p.pos.x - HALF_W);
    const maxX = Math.floor(p.pos.x + HALF_W);
    const minY = Math.floor(p.pos.y);
    const maxY = Math.floor(p.pos.y + PLAYER_H - 1e-4);
    const minZ = Math.floor(p.pos.z - HALF_W);
    const maxZ = Math.floor(p.pos.z + HALF_W);
    for (let bx = minX; bx <= maxX; bx++) {
      for (let by = minY; by <= maxY; by++) {
        for (let bz = minZ; bz <= maxZ; bz++) {
          if (this.world.get(bx, by, bz) === BLOCK_TYPES.LAVA) return true;
        }
      }
    }
    // También detectar pisar directamente sobre lava (bloque bajo los pies)
    const feetBy = Math.floor(p.pos.y - 0.08);
    for (let bx = minX; bx <= maxX; bx++) {
      for (let bz = minZ; bz <= maxZ; bz++) {
        if (this.world.get(bx, feetBy, bz) === BLOCK_TYPES.LAVA) return true;
      }
    }
    return false;
  }

  /**
   * Aplica muerte por causa ('lava' | 'void' | 'fence'):
   * quita 1 vida, respawnea en checkpoint o hace Game Over al spawn.
   */
  killPlayer(p, cause) {
    const res = p.loseLife ? p.loseLife() : { lives: 0, gameOver: false, ignored: false };
    if (res.ignored) return null; // invulnerable: ignorar
    let cp;
    let gameOver = false;
    if (res.gameOver) {
      const spawn = this.world.spawnPoint || {
        x: WORLD_CONFIG.SPAWN_X, y: 1.2, z: WORLD_CONFIG.SPAWN_Z,
      };
      cp = p.fullResetToSpawn ? p.fullResetToSpawn(spawn) : p.respawn();
      gameOver = true;
    } else {
      cp = p.respawn();
    }
    if (this.onPlayerRespawn) {
      this.onPlayerRespawn(p, cp, { cause, lives: p.lives, maxLives: p.maxLives ?? 3, gameOver });
    }
    return { cp, ...res, gameOver };
  }

  integratePlayer(p, dt, actions = 0) {
    // Tick de invulnerabilidad post-respawn
    if (p.tickInvulnerability) p.tickInvulnerability();
    // 0. Aplicar acciones edge-triggered deterministas (Salto autoritativo)
    if (actions & ACTION_FLAGS.JUMP) {
      if (p.onGround) {
        const jumpMult = p.hero?.jumpMultiplier || 1.0;
        p.vel.y = PHYSICS_CONFIG.JUMP_VELOCITY * jumpMult;
        p.onGround = false;
      }
    }

    // 1. Cálculo de velocidad según yaw, input y características del héroe
    const speedMult = p.hero?.speedMultiplier || 1.0;
    const currentSpeed = PHYSICS_CONFIG.SPEED * speedMult;
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    const rx =  Math.cos(p.yaw), rz = -Math.sin(p.yaw);
    p.vel.x = (fx * p.inputForward + rx * p.inputRight) * currentSpeed;
    p.vel.z = (fz * p.inputForward + rz * p.inputRight) * currentSpeed;

    p.vel.y += PHYSICS_CONFIG.GRAVITY * dt;
    if (p.vel.y < PHYSICS_CONFIG.TERMINAL_VELOCITY) {
      p.vel.y = PHYSICS_CONFIG.TERMINAL_VELOCITY;
    }

    const r = tryMove(this.world, p.pos, p.vel.x * dt, p.vel.y * dt, p.vel.z * dt);
    if (r.hitY && p.vel.y > 0) {
      p.vel.y = 0; // Impulso detenido al chocar con techo o dintel
    }
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

    // 3. Muerte por Lava (muerte instantánea, -1 vida). Se comprueba antes del vacío
    // para que el mensaje sea "lava" aunque el bloque esté al fondo del abismo.
    if (!p.isInvulnerable && this.isTouchingLava(p)) {
      this.killPlayer(p, 'lava');
      return;
    }

    // 4. Rescate y pérdida de vida al Caer al Abismo / Vacío (extendido 4 bloques: de -0.5 a -4.5)
    if (p.pos.y < (WORLD_CONFIG.VOID_RESCUE_Y ?? -4.5)) {
      this.killPlayer(p, 'void');
      return;
    }

    // 5. Seguridad Anti-Barda y Techo: Si escapa por encima de las bardas perimetrales o el techo
    // No quita vida (es anti-trampas), solo reposiciona sin castigo.
    if (p.pos.y >= 6.0 || (p.pos.y >= 5.0 && (p.pos.x <= 1.0 || p.pos.x >= WORLD_CONFIG.SIZE_X - 2.0 || p.pos.z <= 1.0 || p.pos.z >= WORLD_CONFIG.SIZE_Z - 2.0))) {
      const cp = p.respawn();
      if (this.onPlayerRespawn) {
        this.onPlayerRespawn(p, cp, { cause: 'fence', lives: p.lives, maxLives: p.maxLives ?? 3, gameOver: false, noPenalty: true });
      }
    }
  }

  stepHost(playerManager, dt) {
    for (const player of playerManager.getAllPlayers()) {
      this.integratePlayer(player, dt);
    }
  }

  stepClient(playerManager, dt, actions = 0) {
    this.integratePlayer(playerManager.localPlayer, dt, actions);
  }
}
