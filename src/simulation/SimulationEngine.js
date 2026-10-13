import { tryMove } from '../core/PhysicsAABB.js';
import { PHYSICS_CONFIG, WORLD_CONFIG, BLOCK_TYPES } from '../config/constants.js';
import { ACTION_FLAGS } from '../network/Protocol.js';

const HALF_W = (PHYSICS_CONFIG.PLAYER_W || 0.6) / 2;
const PLAYER_H = PHYSICS_CONFIG.PLAYER_H || 1.8;

export class SimulationEngine {
  constructor(world, { onPlayerRespawn, onPlayerLavaSink, onStairTouch, onJumpPad, onPressurePlateStep, onPressurePlateRelease, isTransitioning, lavaSinkTicks } = {}) {
    this.world = world;
    this.onPlayerRespawn = onPlayerRespawn || null;
    this.onPlayerLavaSink = onPlayerLavaSink || null;
    this.onStairTouch = onStairTouch || null;
    this.onJumpPad = onJumpPad || null;
    this.onPressurePlateStep = onPressurePlateStep || null;
    this.onPressurePlateRelease = onPressurePlateRelease || null;
    this.isTransitioning = isTransitioning || null;
    this.lavaSinkTicks = lavaSinkTicks !== undefined ? lavaSinkTicks : (PHYSICS_CONFIG.LAVA_SINK_TICKS ?? 36);
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
    const inTransition = typeof this.isTransitioning === 'function' ? this.isTransitioning() : !!this.isTransitioning;
    if (inTransition || p.isFrozen) return null; // No matar jugadores durante transiciones de nivel

    if (p.cancelLavaSinking) p.cancelLavaSinking();

    const res = p.loseLife ? p.loseLife() : { lives: 0, gameOver: false, ignored: false };
    if (res.ignored) return null; // invulnerable: ignorar
    let cp;
    let gameOver = false;
    const currentSpawn = this.world.spawnPoint || {
      x: WORLD_CONFIG.SPAWN_X, y: 1.2, z: WORLD_CONFIG.SPAWN_Z, yaw: Math.PI,
    };
    const spawnYaw = currentSpawn.yaw ?? Math.PI;
    if (res.gameOver) {
      cp = p.fullResetToSpawn ? p.fullResetToSpawn(currentSpawn) : p.respawn(currentSpawn);
      gameOver = true;
    } else {
      const currentLevelId = this.world.currentLevel?.id || this.world.levelRegistry?.getCurrentLevel()?.id;
      // Seguridad y consistencia: reaparición en el spawn único de la mazmorra
      p.setCheckpoint(currentSpawn.x, currentSpawn.y, currentSpawn.z, p.checkpoint?.roomName || 'Entrada', currentLevelId, spawnYaw);
      cp = p.respawn(currentSpawn);
    }
    this._clearPlayerPlates(p);
    if (this.onPlayerRespawn) {
      this.onPlayerRespawn(p, cp, { cause, lives: p.lives, maxLives: p.maxLives ?? 3, gameOver });
    }
    return { cp, ...res, gameOver };
  }

  _clearPlayerPlates(p) {
    if (!p?._standingPlates || p._standingPlates.size === 0) return;
    for (const plateId of p._standingPlates) {
      const plate = this.world?.pressurePlates?.find(pl => pl.id === plateId);
      if (plate) {
        if (plate._occupants) {
          plate._occupants.delete(p.id ?? p);
        }
        if (plate.mode === 'hold' && (!plate._occupants || plate._occupants.size === 0) && plate.isPressed) {
          if (this.onPressurePlateRelease) {
            this.onPressurePlateRelease(p, plate);
          }
          plate.isPressed = false;
        }
      }
    }
    p._standingPlates.clear();
  }

  integratePlayer(p, dt, actions = 0) {
    if (!p) return;
    // Tick de invulnerabilidad post-respawn
    if (p.tickInvulnerability) p.tickInvulnerability();

    // Congelar movimiento y física durante descenso/transición para evitar caídas al vacío o muertes en el fade
    const inTransition = typeof this.isTransitioning === 'function' ? this.isTransitioning() : !!this.isTransitioning;
    if (inTransition || p.isFrozen) {
      p.vel.x = 0;
      p.vel.y = 0;
      p.vel.z = 0;
      return;
    }

    // Modo Vuelo Espectador (Noclip / Dev)
    if (p.isNoclip) {
      if (p.cancelLavaSinking) p.cancelLavaSinking();
      const flySpeed = (PHYSICS_CONFIG.SPEED || 4.8) * 2.2;
      const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
      const rx =  Math.cos(p.yaw), rz = -Math.sin(p.yaw);
      let vy = 0;
      if (typeof p.inputFlyY === 'number' && Math.abs(p.inputFlyY) > 0.05) {
        vy = flySpeed * Math.max(-1, Math.min(1, p.inputFlyY));
      } else if (actions & ACTION_FLAGS.JUMP) {
        vy = flySpeed;
      } else if (p.inputFlyDown) {
        vy = -flySpeed;
      }
      p.pos.x += (fx * p.inputForward + rx * p.inputRight) * flySpeed * dt;
      p.pos.z += (fz * p.inputForward + rz * p.inputRight) * flySpeed * dt;
      p.pos.y += vy * dt;
      p.visualPos.x = p.pos.x;
      p.visualPos.y = p.pos.y;
      p.visualPos.z = p.pos.z;
      p.vel.x = 0;
      p.vel.y = 0;
      p.vel.z = 0;
      p.onGround = false;
      return;
    }

    // Comprobación de contacto con lava y arranque del hundimiento (caída lenta)
    const inLava = !p.isInvulnerable && this.isTouchingLava(p);
    if (inLava && !p.isSinkingInLava) {
      if (this.lavaSinkTicks <= 0) {
        this.killPlayer(p, 'lava');
        return;
      }
      p.startLavaSinking(this.lavaSinkTicks);
      if (this.onPlayerLavaSink) {
        this.onPlayerLavaSink(p);
      }
    }

    // 0. Aplicar acciones edge-triggered deterministas (Salto autoritativo)
    // Se deshabilita por completo el salto si está en lava o hundiéndose en ella
    if (actions & ACTION_FLAGS.JUMP) {
      if (p.onGround && !p.isSinkingInLava && !inLava) {
        // Detección de losa rúnica JUMP_PAD bajo cualquier parte de la huella del jugador
        // (aterrizar en el borde de una losa también otorga el impulso completo)
        const feetY = Math.floor(p.pos.y - 0.05);
        const halfW = PHYSICS_CONFIG.PLAYER_W / 2;
        let isJumpPad = false;
        for (let bx = Math.floor(p.pos.x - halfW); bx <= Math.floor(p.pos.x + halfW) && !isJumpPad; bx++) {
          for (let bz = Math.floor(p.pos.z - halfW); bz <= Math.floor(p.pos.z + halfW); bz++) {
            if (this.world.get(bx, feetY, bz) === BLOCK_TYPES.JUMP_PAD) { isJumpPad = true; break; }
          }
        }

        const jumpMult = (p.hero?.jumpMultiplier || 1.0) * (isJumpPad ? 1.35 : 1.0);
        p.vel.y = PHYSICS_CONFIG.JUMP_VELOCITY * jumpMult;
        p.onGround = false;

        // Métricas cuantificables de gameplay y verticalidad
        p.jumpCount = (p.jumpCount || 0) + 1;
        if (isJumpPad) {
          p.jumpPadCount = (p.jumpPadCount || 0) + 1;
          if (this.onJumpPad) {
            this.onJumpPad(p);
          }
        }
      }
    }

    // Seguimiento de cota de altitud máxima alcanzada (métrica de verticalidad)
    if (typeof p.maxAltitude !== 'number' || p.pos.y > p.maxAltitude) {
      p.maxAltitude = p.pos.y;
    }


    // 1. Cálculo de velocidad según yaw, input y características del héroe
    let speedMult = p.hero?.speedMultiplier || 1.0;
    if (p.isSinkingInLava || inLava) {
      // Viscosidad densa del magma: reduce drásticamente la movilidad horizontal
      speedMult *= 0.2;
    }
    const currentSpeed = PHYSICS_CONFIG.SPEED * speedMult;
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    const rx =  Math.cos(p.yaw), rz = -Math.sin(p.yaw);
    p.vel.x = (fx * p.inputForward + rx * p.inputRight) * currentSpeed;
    p.vel.z = (fz * p.inputForward + rz * p.inputRight) * currentSpeed;

    if (p.isSinkingInLava || inLava) {
      // Caída lenta / hundimiento amortiguado en la lava viscosa
      const sinkSpeed = PHYSICS_CONFIG.LAVA_SINK_SPEED ?? -1.0;
      p.vel.y = sinkSpeed;
    } else {
      p.vel.y += PHYSICS_CONFIG.GRAVITY * dt;
      if (p.vel.y < PHYSICS_CONFIG.TERMINAL_VELOCITY) {
        p.vel.y = PHYSICS_CONFIG.TERMINAL_VELOCITY;
      }
    }

    const r = tryMove(this.world, p.pos, p.vel.x * dt, p.vel.y * dt, p.vel.z * dt);
    if (r.hitY && p.vel.y > 0) {
      p.vel.y = 0; // Impulso detenido al chocar con techo o dintel
    }
    if (r.onGround && !p.isSinkingInLava && !inLava) {
      p.onGround = true;
      if (p.vel.y < 0) p.vel.y = 0;
    } else {
      p.onGround = false;
    }

    // 2. Registro dinámico de habitación y punto de reaparición único por mazmorra
    // Se registran únicamente cuando el jugador pisa suelo firme (pos.y >= 0.95) y no está en lava.
    // Las coordenadas de reaparición siempre apuntan al spawn único de la mazmorra.
    if (p.onGround && p.pos.y >= 0.95 && !p.isSinkingInLava && !inLava) {
      const currentLevelId = this.world.currentLevel?.id || this.world.levelRegistry?.getCurrentLevel()?.id || '';
      const currentSpawn = this.world.spawnPoint || {
        x: WORLD_CONFIG.SPAWN_X, y: 1.2, z: WORLD_CONFIG.SPAWN_Z, yaw: Math.PI,
      };
      const spawnYaw = currentSpawn.yaw ?? Math.PI;
      if (Array.isArray(this.world.checkpoints) && this.world.checkpoints.length > 0) {
        for (const cp of this.world.checkpoints) {
          if (p.pos.z >= cp.minZ && p.pos.z <= cp.maxZ) {
            if (!p.checkpoint || p.checkpoint.roomName !== cp.name || p.checkpoint.levelId !== currentLevelId) {
              const cpYaw = cp.yaw ?? cp.respawn?.yaw ?? spawnYaw;
              p.setCheckpoint(currentSpawn.x, currentSpawn.y, currentSpawn.z, cp.name, currentLevelId, cpYaw);
            }
            break;
          }
        }
      } else {
        if (p.pos.z >= 24.5) {
          if (!p.checkpoint || p.checkpoint.roomName !== 'Sala 3 (Santuario Ancestral)' || p.checkpoint.levelId !== currentLevelId) {
            p.setCheckpoint(currentSpawn.x, currentSpawn.y, currentSpawn.z, 'Sala 3 (Santuario Ancestral)', currentLevelId, spawnYaw);
          }
        } else if (p.pos.z >= 11.5 && p.pos.z < 24.0) {
          if (!p.checkpoint || p.checkpoint.roomName !== 'Sala 2 (El Abismo)' || p.checkpoint.levelId !== currentLevelId) {
            p.setCheckpoint(currentSpawn.x, currentSpawn.y, currentSpawn.z, 'Sala 2 (El Abismo)', currentLevelId, spawnYaw);
          }
        } else if (p.pos.z < 11.0) {
          if (!p.checkpoint || p.checkpoint.roomName !== 'Sala 1 (Vestíbulo)' || p.checkpoint.levelId !== currentLevelId) {
            p.setCheckpoint(currentSpawn.x, currentSpawn.y, currentSpawn.z, 'Sala 1 (Vestíbulo)', currentLevelId, spawnYaw);
          }
        }
      }
    }

    // 3. Muerte por Lava: progresión de la animación de hundimiento lento (-1 vida)
    if (p.isSinkingInLava) {
      if (p.tickLavaSinking) p.tickLavaSinking();
      if (p.lavaSinkingTicks <= 0) {
        this.killPlayer(p, 'lava');
        return;
      }
    }

    // 4. Rescate y pérdida de vida al Caer al Abismo / Vacío (bajo el fondo del mundo)
    if (p.pos.y < (WORLD_CONFIG.VOID_RESCUE_Y ?? -8.5)) {
      this.killPlayer(p, p.isSinkingInLava ? 'lava' : 'void');
      return;
    }

    // 5. Sensor de escalinata de descenso (fosa abierta tras el altar): no mata,
    // solo notifica para el descenso sincronizado a la siguiente mazmorra.
    if (this.onStairTouch && Array.isArray(this.world.stairwells)) {
      for (const w of this.world.stairwells) {
        if (!w.open) continue;
        if (p.pos.x >= w.x1 && p.pos.x <= w.x2 + 1 &&
            p.pos.z >= w.z1 && p.pos.z <= w.z2 + 1 &&
            p.pos.y < (w.triggerY ?? 0.75)) {
          this.onStairTouch(p, w);
          break;
        }
      }
    }

    // 5b. Sensor de Pad Losa de Presión (Pressure Pad):
    // Se activa exclusivamente al estar físicamente encima del bloque pad (sin interacción de botón)
    // En modo 'hold', se desactiva automáticamente al salir de su posición cuando no quedan ocupantes.
    if (Array.isArray(this.world.pressurePlates)) {
      p._standingPlates = p._standingPlates || new Set();

      for (const plate of this.world.pressurePlates) {
        const dx = Math.abs(p.pos.x - plate.x);
        const dz = Math.abs(p.pos.z - plate.z);
        const padRadius = plate.radius || 0.65;
        // Debe encontrarse directamente encima del área física del bloque pad
        const isInside = (dx <= padRadius && dz <= padRadius && Math.abs(p.pos.y - (plate.y ?? 1.0)) < 0.8);
        const isHoldMode = plate.mode === 'hold';

        if (isInside) {
          if (!p._standingPlates.has(plate.id)) {
            p._standingPlates.add(plate.id);
            plate._occupants = plate._occupants || new Set();
            plate._occupants.add(p.id ?? p);

            if (!plate.isPressed) {
              if (this.onPressurePlateStep) {
                this.onPressurePlateStep(p, plate);
              }
              plate.isPressed = true;
            }
          }
        } else {
          if (p._standingPlates.has(plate.id)) {
            p._standingPlates.delete(plate.id);
            if (plate._occupants) {
              plate._occupants.delete(p.id ?? p);
            }

            if (isHoldMode && (!plate._occupants || plate._occupants.size === 0) && plate.isPressed) {
              if (this.onPressurePlateRelease) {
                this.onPressurePlateRelease(p, plate);
              }
              plate.isPressed = false;
            }
          }
        }
      }
    }

    // 6. Seguridad Anti-Barda y Techo: Si escapa por encima de las bardas perimetrales o el techo
    // No quita vida (es anti-trampas), solo reposiciona sin castigo en el spawn único.
    const limitX = this.world?.sizeX ?? WORLD_CONFIG.SIZE_X;
    const limitZ = this.world?.sizeZ ?? WORLD_CONFIG.SIZE_Z;
    if (p.pos.y >= 6.0 || (p.pos.y >= 5.0 && (p.pos.x <= 1.0 || p.pos.x >= limitX - 2.0 || p.pos.z <= 1.0 || p.pos.z >= limitZ - 2.0))) {
      const currentSpawn = this.world.spawnPoint || {
        x: WORLD_CONFIG.SPAWN_X, y: 1.2, z: WORLD_CONFIG.SPAWN_Z, yaw: Math.PI,
      };
      const spawnYaw = currentSpawn.yaw ?? Math.PI;
      p.setCheckpoint(currentSpawn.x, currentSpawn.y, currentSpawn.z, p.checkpoint?.roomName || 'Entrada', this.world.currentLevel?.id || '', spawnYaw);
      const cp = p.respawn(currentSpawn);
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
