/**
 * BaseEnemy.js - Entidad base y motor de navegación inteligente para enemigos PvE.
 *
 * Implementa la arquitectura común de IA para todos los monstruos:
 * - Ciclo de vida y máquina de estados (idle, chase, telegraph, hurt, dead, respawn).
 * - Deslizamiento continuo por descomposición de ejes (Wall Sliding).
 * - Colisión basada en radio y caja envolvente AABB (Body Margin).
 * - Sensores de evasión de esquinas y columnas (Whiskers Steering a ±45° y ±90°).
 * - Watchdog anti-trampa para desbloqueo automático en concavidades.
 *
 * Los enemigos específicos (Serpiente, Esqueleto, etc.) heredan de esta clase y
 * pueden sobreescribir o afinar ganchos como `customCanMove()` o `getMovementSpeed()`.
 */
import { calculateDamage } from '../config/combat.js';
import { isSolid } from '../core/PhysicsAABB.js';

export class BaseEnemy {
  /**
   * @param {Object} template Configuración canónica desde CANONICAL_ENEMIES
   * @param {Object} spawnPos { x, y, z }
   * @param {string} id Identificador único
   */
  constructor(template, spawnPos, id) {
    this.id = id;
    this.type = template.id;
    this.name = template.name;
    this.tier = template.tier;
    this.maxHp = template.maxHp;
    this.hp = template.maxHp;
    this.speed = template.speed;
    this.damage = template.damage;
    this.attackRange = template.attackRange;
    this.aggroRange = template.aggroRange;
    this.attackCooldownMs = template.attackCooldownMs;
    this.telegraphMs = template.telegraphMs;
    this.knockbackFactor = template.knockbackFactor;
    this.respawnDelayMs = template.respawnDelayMs;
    this.color = template.color;
    this.eyeColor = template.eyeColor;
    this.soundType = template.soundType || 'stone';
    this.width = template.width;
    this.height = template.height;
    this.depth = template.depth;

    // Posición física y orientación
    this.x = spawnPos.x;
    this.y = spawnPos.y;
    this.z = spawnPos.z;
    this.spawnPos = { x: spawnPos.x, y: spawnPos.y, z: spawnPos.z };
    this.yaw = 0;
    this.pitch = 0;

    // Estado de combate
    this.state = 'idle'; // 'idle' | 'chase' | 'telegraph' | 'hurt' | 'dead'
    this.isDead = false;
    this.lastAttackTime = -999999;
    this.lastHitTime = 0;
    this.telegraphTimer = 0;
    this.stunTimer = 0;
    this.flashTimer = 0;
    this.shakeTimer = 0;
    this.knockbackVx = 0;
    this.knockbackVz = 0;
    this.knockbackTimer = 0;
    this.respawnTimer = 0;

    // Navegación inteligente y anti-trampa
    this.stuckTimer = 0;
    this.stuckBias = 1;

    // Bounding Box AABB
    this.aabb = {
      minX: spawnPos.x - template.width / 2,
      maxX: spawnPos.x + template.width / 2,
      minY: spawnPos.y,
      maxY: spawnPos.y + template.height,
      minZ: spawnPos.z - template.depth / 2,
      maxZ: spawnPos.z + template.depth / 2,
    };
  }

  /**
   * Sincroniza la caja AABB con las coordenadas del enemigo.
   */
  updateAABB() {
    const hw = this.width / 2;
    const hd = this.depth / 2;
    this.aabb.minX = this.x - hw;
    this.aabb.maxX = this.x + hw;
    this.aabb.minY = this.y;
    this.aabb.maxY = this.y + this.height;
    this.aabb.minZ = this.z - hd;
    this.aabb.maxZ = this.z + hd;
  }

  /**
   * Comprueba si una posición horizontal (x, z) colisiona con geometría sólida
   * evaluando el centro y los 4 extremos de la base del cuerpo (Body Margin).
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {Object} world
   * @param {number} [margin]
   * @returns {boolean}
   */
  isBlocked(x, y, z, world, margin = null) {
    if (!world) return false;
    const limitX = world?.sizeX ?? 32;
    const limitZ = world?.sizeZ ?? 64;
    const m = margin !== null ? margin : Math.min(this.width, this.depth) * 0.35;
    const by = Math.floor(y + 0.2);

    const points = [
      [x, z],
      [x - m, z - m],
      [x + m, z - m],
      [x - m, z + m],
      [x + m, z + m],
    ];

    for (let i = 0; i < points.length; i++) {
      const px = points[i][0];
      const pz = points[i][1];
      const bx = Math.floor(px);
      const bz = Math.floor(pz);
      if (bx < 0 || bx >= limitX || bz < 0 || bz >= limitZ) return true;
      if (isSolid(world, bx, by, bz)) return true;
    }
    return false;
  }

  /**
   * Gancho de validación personalizada para subclases (ej. barreras de lava o zonas prohibidas).
   * @param {number} _nextX
   * @param {number} _nextY
   * @param {number} _nextZ
   * @param {Object} [_world]
   * @returns {boolean}
   */
  customCanMove(_nextX, _nextY, _nextZ, _world) {
    return true;
  }

  /**
   * Aplica desplazamiento hacia el objetivo con deslizamiento por paredes y evasión de obstáculos.
   * @param {Object} targetPlayer
   * @param {number} dt
   * @param {Object} world
   */
  performMovement(targetPlayer, dt, world) {
    this.state = 'chase';
    this.telegraphTimer = 0;

    const dx = targetPlayer.pos.x - this.x;
    const dz = targetPlayer.pos.z - this.z;
    const dist = Math.hypot(dx, dz);
    if (dist <= 0.0001) return;

    const step = Math.min(dist, this.speed * dt);
    const dirX = dx / dist;
    const dirZ = dz / dist;
    const baseAngle = Math.atan2(-dx, -dz);

    // 1. Intento directo hacia el objetivo
    const directX = this.x + dirX * step;
    const directZ = this.z + dirZ * step;

    if (!this.isBlocked(directX, this.y, directZ, world) && this.customCanMove(directX, this.y, directZ, world)) {
      this.x = directX;
      this.z = directZ;
      this.yaw = baseAngle;
      this.updateAABB();
      this.stuckTimer = 0;
      return;
    }

    // 2. Deslizamiento continuo por descomposición de ejes (Wall Sliding)
    const hasDirX = Math.abs(dirX) > 0.08;
    const hasDirZ = Math.abs(dirZ) > 0.08;

    const canMoveX = hasDirX && !this.isBlocked(directX, this.y, this.z, world) && this.customCanMove(directX, this.y, this.z, world);
    const canMoveZ = hasDirZ && !this.isBlocked(this.x, this.y, directZ, world) && this.customCanMove(this.x, this.y, directZ, world);

    if (canMoveX && !canMoveZ) {
      this.x = directX;
      this.yaw = dirX > 0 ? -Math.PI / 2 : Math.PI / 2;
      this.updateAABB();
      this.stuckTimer = 0;
      return;
    }

    if (canMoveZ && !canMoveX) {
      this.z = directZ;
      this.yaw = dirZ > 0 ? 0 : Math.PI;
      this.updateAABB();
      this.stuckTimer = 0;
      return;
    }

    // 3. Sensores de Evasión de Esquinas y Columnas ("Whiskers Steering")
    // Si choca de frente contra una esquina o columna, prueba desviaciones angulares laterales
    const bias = this.stuckBias || 1;
    const probeAngles = [
      bias * 1.571, // ±90° (paso lateral perpendicular para rodear obstáculo frontal)
      -bias * 1.571,
      bias * 1.047, // ±60°
      -bias * 1.047,
      bias * 0.785, // ±45°
      -bias * 0.785,
    ];

    for (let i = 0; i < probeAngles.length; i++) {
      const pAngle = baseAngle + probeAngles[i];
      const pDirX = -Math.sin(pAngle);
      const pDirZ = -Math.cos(pAngle);
      const pNextX = this.x + pDirX * step;
      const pNextZ = this.z + pDirZ * step;

      if (!this.isBlocked(pNextX, this.y, pNextZ, world) && this.customCanMove(pNextX, this.y, pNextZ, world)) {
        this.x = pNextX;
        this.z = pNextZ;
        this.yaw = pAngle;
        this.updateAABB();
        this.stuckTimer = 0;
        return;
      }
    }

    // 4. Watchdog anti-trampa para concavidades complejas
    this.stuckTimer = (this.stuckTimer || 0) + dt;
    if (this.stuckTimer > 0.3) {
      this.stuckBias = (this.stuckBias || 1) * -1;
      this.stuckTimer = 0;
    }
  }

  /**
   * Actualiza el retroceso por impacto con deslizamiento por ejes.
   * @param {number} dt
   * @param {Object} world
   * @returns {boolean} True si estaba en retroceso
   */
  updateKnockback(dt, world) {
    if (this.knockbackTimer <= 0) return false;
    this.knockbackTimer = Math.max(0, this.knockbackTimer - dt);
    const nextX = this.x + this.knockbackVx * dt;
    const nextZ = this.z + this.knockbackVz * dt;

    if (!this.isBlocked(nextX, this.y, nextZ, world) && this.customCanMove(nextX, this.y, nextZ, world)) {
      this.x = nextX;
      this.z = nextZ;
    } else {
      if (!this.isBlocked(nextX, this.y, this.z, world) && this.customCanMove(nextX, this.y, this.z, world)) {
        this.x = nextX;
      }
      if (!this.isBlocked(this.x, this.y, nextZ, world) && this.customCanMove(this.x, this.y, nextZ, world)) {
        this.z = nextZ;
      }
    }
    this.updateAABB();
    return true;
  }

  /**
   * Busca el jugador vivo más cercano dentro del radio de agro.
   * @param {Array<Object>} players
   * @returns {Object|null}
   */
  findTargetPlayer(players) {
    let target = null;
    let minDist = this.aggroRange;

    for (let i = 0; i < players.length; i++) {
      const pl = players[i];
      if (!pl || pl.lives <= 0) continue;
      const dist = Math.hypot(pl.pos.x - this.x, pl.pos.z - this.z);
      if (dist < minDist) {
        minDist = dist;
        target = pl;
      }
    }
    return target;
  }

  /**
   * Aplica daño a la entidad, gestionando retroceso, flash, aturdimiento y derrota.
   * @param {number} baseDamage
   * @param {Object} weapon
   * @param {Object} [sourcePlayer]
   * @param {number} [now]
   * @returns {Object}
   */
  applyDamage(baseDamage, weapon, sourcePlayer = null, now = Date.now()) {
    const effective = calculateDamage(baseDamage, 0, null, weapon?.type || '');
    this.hp = Math.max(0, this.hp - effective);
    this.lastHitTime = now;

    this.flashTimer = 0.15;
    this.shakeTimer = 0.20;

    const kb = weapon?.knockback || 0;
    if (kb > 0 && sourcePlayer) {
      const dx = this.x - sourcePlayer.pos.x;
      const dz = this.z - sourcePlayer.pos.z;
      const len = Math.hypot(dx, dz) || 1.0;
      this.knockbackVx = (dx / len) * kb * 3.5;
      this.knockbackVz = (dz / len) * kb * 3.5;
      this.knockbackTimer = 0.18;
    }

    if (weapon?.stunMs > 0) {
      this.stunTimer = weapon.stunMs / 1000;
    }

    if (this.hp <= 0) {
      this.isDead = true;
      this.state = 'dead';
      this.respawnTimer = this.respawnDelayMs / 1000;
    }

    return {
      enemy: this,
      enemyId: this.id,
      enemyName: this.name,
      effectiveDamage: effective,
      hp: this.hp,
      maxHp: this.maxHp,
      weapon,
      sourcePlayer,
      soundType: this.soundType,
    };
  }

  /**
   * Ciclo de actualización por frame de la entidad.
   * @param {number} dt Delta time en segundos
   * @param {Object} world Mundo de bloques voxel
   * @param {Array<Object>} players Jugadores activos
   * @param {number} now Timestamp ms
   * @param {Object} callbacks
   */
  update(dt, world = null, players = [], now = Date.now(), callbacks = {}) {
    if (this.isDead) {
      this.respawnTimer = Math.max(0, this.respawnTimer - dt);
      if (this.respawnTimer <= 0) {
        this.isDead = false;
        this.hp = this.maxHp;
        this.state = 'idle';
        this.x = this.spawnPos.x;
        this.y = this.spawnPos.y;
        this.z = this.spawnPos.z;
        this.knockbackVx = 0;
        this.knockbackVz = 0;
        this.telegraphTimer = 0;
        this.stunTimer = 0;
        this.stuckTimer = 0;
        this.updateAABB();
      }
      return;
    }

    if (this.flashTimer > 0) this.flashTimer = Math.max(0, this.flashTimer - dt);
    if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - dt);
      return;
    }

    if (this.updateKnockback(dt, world)) {
      return;
    }

    const targetPlayer = this.findTargetPlayer(players);
    if (!targetPlayer) {
      this.state = 'idle';
      return;
    }

    const dx = targetPlayer.pos.x - this.x;
    const dz = targetPlayer.pos.z - this.z;
    const dist = Math.hypot(dx, dz);

    this.yaw = Math.atan2(-dx, -dz);

    if (dist <= this.attackRange) {
      if (this.state !== 'telegraph') {
        const canAttack = (now - this.lastAttackTime) >= this.attackCooldownMs;
        if (canAttack) {
          this.state = 'telegraph';
          this.telegraphTimer = this.telegraphMs / 1000;
        } else {
          this.state = 'idle';
        }
      } else {
        this.telegraphTimer -= dt;
        if (this.telegraphTimer <= 0) {
          this.state = 'idle';
          this.lastAttackTime = now;
          if (dist <= this.attackRange + 0.3) {
            callbacks.onPlayerDamaged?.(targetPlayer, this.damage, this);
          }
        }
      }
    } else {
      this.performMovement(targetPlayer, dt, world);
    }
  }
}

/**
 * Serpiente de Ceniza (Dificultad 0):
 * Alimaña rastrera de iniciación con restricción de límite de arena de lava.
 */
export class CaveSerpentEnemy extends BaseEnemy {
  customCanMove(_nextX, _nextY, nextZ, _world) {
    // Evita arrojarse a la fosa de lava de castigo en z >= 32.5
    if (nextZ >= 32.5) return false;
    return true;
  }
}

/**
 * Esqueleto de Basalto (Dificultad 1):
 * Tropa básica de hostigamiento cuerpo a cuerpo.
 */
export class BasaltSkittererEnemy extends BaseEnemy {
  // Hereda directamente la mecánica base completa
}

/**
 * Registro de factoría polimórfica para instanciación extensible.
 */
export const ENEMY_CLASS_REGISTRY = {
  cave_serpent: CaveSerpentEnemy,
  basalt_skitterer: BasaltSkittererEnemy,
};
