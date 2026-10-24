/**
 * ProjectilePool.js - Pool Zero-GC y simulación física de proyectiles de combate.
 *
 * Extraído de CombatManager para mantener la resolución de daño separada del
 * ciclo de vida de los proyectiles. El pool pre-asigna todas las ranuras para
 * evitar asignaciones por frame; el impacto se delega a los handlers del gestor.
 */
import { WEAPON_TYPES } from '../config/combat.js';
import { traceSolidSegment } from './combatGeometry.js';

export const MAX_PROJECTILES = 16;
const PROJECTILE_RADIUS = 0.3;
const TRACE_STEP = 0.25;

export class ProjectilePool {
  /** @param {number} [capacity] */
  constructor(capacity = MAX_PROJECTILES) {
    this.projectiles = this._createPool(capacity);
    this._tracePoint = { x: 0, y: 0, z: 0 };
  }

  /**
   * Pre-asigna las ranuras fijas de memoria para proyectiles activos.
   * @private
   */
  _createPool(capacity) {
    const pool = new Array(capacity);
    for (let i = 0; i < capacity; i++) {
      pool[i] = {
        index: i,
        active: false,
        type: WEAPON_TYPES.PROJECTILE_ARROW,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        speed: 0,
        traveled: 0,
        maxRange: 0,
        damage: 1,
        aoeRadius: 0,
        knockback: 0,
        color: '#10b981',
        sourcePlayerId: 0,
      };
    }
    return pool;
  }

  /**
   * Obtiene una ranura libre del pool y la activa con trayectoria 3D.
   * @param {Object} player
   * @param {Object} weapon
   * @returns {Object|null} Proyectil activo o null si el pool está saturado
   */
  spawn(player, weapon) {
    let proj = null;
    for (let i = 0; i < this.projectiles.length; i++) {
      if (!this.projectiles[i].active) {
        proj = this.projectiles[i];
        break;
      }
    }
    if (!proj) return null; // Pool saturado temporalmente (Zero-GC)

    const pitch = player.pitch || 0;
    const yaw = player.yaw;
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    // Vector director 3D de la trayectoria
    const fx = -Math.sin(yaw) * cosP;
    const fy = sinP;
    const fz = -Math.cos(yaw) * cosP;

    proj.active = true;
    proj.type = weapon.type;
    // Origen a la altura del pecho / ojos del jugador
    proj.x = player.pos.x + fx * 0.4;
    proj.y = player.pos.y + 1.2 + fy * 0.4;
    proj.z = player.pos.z + fz * 0.4;
    proj.speed = weapon.speed;
    proj.vx = fx * weapon.speed;
    proj.vy = fy * weapon.speed;
    proj.vz = fz * weapon.speed;
    proj.traveled = 0;
    proj.maxRange = weapon.range;
    proj.damage = weapon.damage;
    proj.aoeRadius = weapon.aoeRadius || 0;
    proj.knockback = weapon.knockback || 0;
    proj.color = weapon.color;
    proj.sourcePlayerId = player.id;
    proj.weapon = weapon;

    return proj;
  }

  /**
   * Simula los proyectiles activos con colisión continua contra el mundo y swept AABB.
   *
   * @param {number} dt Delta time en segundos
   * @param {Object|null} world Mundo voxel
   * @param {number} now Timestamp en ms
   * @param {Array<Object>} dummies Maniquíes de entrenamiento
   * @param {Object|null} enemyManager Gestor de enemigos
   * @param {{onWorldHit: Function, onDummyHit: Function}} handlers Callbacks de impacto
   */
  update(dt, world, now, dummies, enemyManager, handlers) {
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.active) continue;

      const prevX = p.x;
      const prevY = p.y;
      const prevZ = p.z;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.traveled += p.speed * dt;

      if (p.traveled >= p.maxRange) {
        p.active = false;
        continue;
      }

      // Colisión continua contra vóxeles sólidos del mapa (evita tunneling)
      if (world) {
        const wallHit = traceSolidSegment(world, prevX, prevY, prevZ, p.x, p.y, p.z, TRACE_STEP, this._tracePoint);
        if (wallHit) {
          if (p.aoeRadius > 0) {
            handlers.onWorldHit(p, wallHit, now);
          }
          p.active = false;
          continue;
        }
      }

      // Colisión contra cajas AABB de los maniquíes (swept AABB)
      const pMinX = Math.min(prevX, p.x) - PROJECTILE_RADIUS;
      const pMaxX = Math.max(prevX, p.x) + PROJECTILE_RADIUS;
      const pMinY = Math.min(prevY, p.y) - PROJECTILE_RADIUS;
      const pMaxY = Math.max(prevY, p.y) + PROJECTILE_RADIUS;
      const pMinZ = Math.min(prevZ, p.z) - PROJECTILE_RADIUS;
      const pMaxZ = Math.max(prevZ, p.z) + PROJECTILE_RADIUS;

      let impacted = false;
      for (let j = 0; j < dummies.length; j++) {
        const dummy = dummies[j];
        const aabb = dummy.aabb;

        if (
          pMaxX >= aabb.minX &&
          pMinX <= aabb.maxX &&
          pMaxY >= aabb.minY &&
          pMinY <= aabb.maxY &&
          pMaxZ >= aabb.minZ &&
          pMinZ <= aabb.maxZ
        ) {
          impacted = true;
          handlers.onDummyHit(p, dummy, now);
          break;
        }
      }

      if (!impacted && enemyManager) {
        if (enemyManager.testProjectileCollision(p, now, prevX, prevY, prevZ, p.traveled, p.weapon, world)) {
          impacted = true;
        }
      }

      if (impacted) {
        p.active = false;
      }
    }
  }
}
