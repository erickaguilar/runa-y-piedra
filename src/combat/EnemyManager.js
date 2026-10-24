/**
 * EnemyManager.js - Gestor autoritativo de entidades enemigas PvE e Inteligencia Artificial.
 *
 * Administra el ciclo de vida de enemigos, resolución de ataques Melee/Rango,
 * y orquesta la actualización de entidades basadas en BaseEnemy (Navegación inteligente).
 */
import { CANONICAL_ENEMIES } from '../config/combat.js';
import { BaseEnemy, ENEMY_CLASS_REGISTRY } from './BaseEnemy.js';
import { closestPointOnAabb, hasLineOfSight } from './combatGeometry.js';

export class EnemyManager {
  /**
   * @param {Object} [options]
   * @param {(hitInfo: Object) => void} [options.onEnemyHit]
   * @param {(enemy: Object, sourcePlayer: Object) => void} [options.onEnemyDefeated]
   * @param {(player: Object, damage: number, enemy: Object) => void} [options.onPlayerDamaged]
   * @param {Object} [options.world] Mundo voxel para línea de visión
   */
  constructor(options = {}) {
    this.onEnemyHit = options.onEnemyHit || null;
    this.onEnemyDefeated = options.onEnemyDefeated || null;
    this.onPlayerDamaged = options.onPlayerDamaged || null;
    this.world = options.world || null;

    this._losPoint = { x: 0, y: 0, z: 0 };
    this.enemies = [];
  }

  /**
   * Genera un enemigo a partir de una plantilla canónica y su clase especializada.
   * @param {string} type Tipo en CANONICAL_ENEMIES
   * @param {Object} spawnPos { x, y, z }
   * @param {string} [customId]
   * @returns {BaseEnemy}
   */
  spawnEnemy(type, spawnPos, customId = null) {
    const template = CANONICAL_ENEMIES[type] || CANONICAL_ENEMIES.basalt_skitterer;
    const id = customId || `${template.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const EnemyClass = ENEMY_CLASS_REGISTRY[type] || BaseEnemy;
    const enemy = new EnemyClass(template, spawnPos, id);

    this.enemies.push(enemy);
    return enemy;
  }

  /**
   * Actualiza la caja AABB a partir de las coordenadas actuales del enemigo.
   * @param {Object} enemy
   * @private
   */
  _updateAABB(enemy) {
    enemy?.updateAABB?.();
  }

  /**
   * Resuelve el barrido cuerpo a cuerpo de un jugador contra todos los enemigos vivos.
   * @param {Object} player
   * @param {Object} weapon
   * @param {number} now
   * @param {Object} [world] Mundo voxel para línea de visión
   * @returns {Array<Object>}
   */
  resolveMeleeAttack(player, weapon, now, world = this.world) {
    const hits = [];
    const px = player.pos.x;
    const py = player.pos.y;
    const pz = player.pos.z;
    const yaw = player.yaw;
    const eyeY = py + 1.2;

    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const rangeSq = weapon.range * weapon.range;

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (enemy.isDead) continue;

      const aabb = enemy.aabb;
      if (aabb.maxY < py - 0.5 || aabb.minY > py + 2.2) continue;

      const cx = Math.max(aabb.minX, Math.min(px, aabb.maxX));
      const cz = Math.max(aabb.minZ, Math.min(pz, aabb.maxZ));
      const dx = cx - px;
      const dz = cz - pz;
      const distSq = dx * dx + dz * dz;

      if (distSq > rangeSq) continue;

      let inArc = false;
      const dist = distSq > 0 ? Math.sqrt(distSq) : 0;
      if (weapon.minDot <= -1 || distSq === 0) {
        inArc = true;
      } else {
        const dot = (fx * dx + fz * dz) / dist;
        if (dot >= weapon.minDot) inArc = true;
      }

      if (inArc) {
        const target = closestPointOnAabb(aabb, px, eyeY, pz, this._losPoint);
        if (!hasLineOfSight(world, px, eyeY, pz, target.x, target.y, target.z)) continue;

        const hit = this.applyDamage(enemy.id, weapon.damage, weapon, player, now, dist);
        if (hit) hits.push(hit);
      }
    }

    return hits;
  }

  /**
   * Resuelve el impacto de un proyectil en un punto 3D sobre los enemigos vivos.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} radius
   * @param {number} damage
   * @param {Object} weapon
   * @param {Object} [sourcePlayer]
   * @param {number} [now]
   * @param {number} [distance]
   * @param {Object} [world] Mundo voxel para oclusión de la explosión
   * @returns {Array<Object>}
   */
  resolveProjectileHit(x, y, z, radius, damage, weapon, sourcePlayer = null, now = Date.now(), distance = 0, world = this.world) {
    const hits = [];
    const radiusSq = radius * radius;

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (enemy.isDead) continue;

      const aabb = enemy.aabb;
      const closest = closestPointOnAabb(aabb, x, y, z, this._losPoint);

      const dx = closest.x - x;
      const dy = closest.y - y;
      const dz = closest.z - z;
      if (
        dx * dx + dy * dy + dz * dz <= radiusSq &&
        hasLineOfSight(world, x, y, z, closest.x, closest.y, closest.z)
      ) {
        const hit = this.applyDamage(enemy.id, damage, weapon, sourcePlayer, now, distance);
        if (hit) hits.push(hit);
      }
    }

    return hits;
  }

  /**
   * Alias para resolución de daño AoE de proyectiles en área.
   */
  resolveAoeImpact(x, y, z, radius, damage, weapon, sourcePlayer = null, now = Date.now(), distance = 0, world = this.world) {
    return this.resolveProjectileHit(x, y, z, radius, damage, weapon, sourcePlayer, now, distance, world);
  }

  /**
   * Comprueba colisión barrida (swept AABB) de un proyectil activo contra las AABB de enemigos vivos.
   * @param {Object} proj
   * @param {number} now
   * @param {number} [prevX]
   * @param {number} [prevY]
   * @param {number} [prevZ]
   * @param {number} [distance=0]
   * @param {Object} [weapon=null]
   * @param {Object} [world] Mundo voxel para oclusión de la explosión
   * @returns {boolean} True si hubo impacto
   */
  testProjectileCollision(proj, now, prevX = proj.x, prevY = proj.y, prevZ = proj.z, distance = 0, weapon = null, world = this.world) {
    const radius = 0.3;
    const pMinX = Math.min(prevX, proj.x) - radius;
    const pMaxX = Math.max(prevX, proj.x) + radius;
    const pMinY = Math.min(prevY, proj.y) - radius;
    const pMaxY = Math.max(prevY, proj.y) + radius;
    const pMinZ = Math.min(prevZ, proj.z) - radius;
    const pMaxZ = Math.max(prevZ, proj.z) + radius;

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (enemy.isDead) continue;

      const aabb = enemy.aabb;
      if (
        pMaxX >= aabb.minX &&
        pMinX <= aabb.maxX &&
        pMaxY >= aabb.minY &&
        pMinY <= aabb.maxY &&
        pMaxZ >= aabb.minZ &&
        pMinZ <= aabb.maxZ
      ) {
        if (proj.aoeRadius > 0) {
          this.resolveAoeImpact(proj.x, proj.y, proj.z, proj.aoeRadius, proj.damage, weapon || { type: proj.type }, null, now, distance, world);
        } else {
          this.applyDamage(enemy.id, proj.damage, weapon || { type: proj.type, knockback: proj.knockback }, null, now, distance);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Aplica daño a un enemigo, gestionando retroceso, flash, aturdimiento y derrota.
   * @param {string} enemyId
   * @param {number} baseDamage
   * @param {Object} weapon
   * @param {Object} [sourcePlayer]
   * @param {number} [now]
   * @param {number} [distance=0]
   * @returns {Object|null}
   */
  applyDamage(enemyId, baseDamage, weapon, sourcePlayer = null, now = Date.now(), distance = 0) {
    const enemy = this.enemies.find(e => e.id === enemyId);
    if (!enemy || enemy.isDead) return null;

    const hitResult = enemy.applyDamage(baseDamage, weapon, sourcePlayer, now, distance);

    if (enemy.isDead && this.onEnemyDefeated) {
      this.onEnemyDefeated(enemy, sourcePlayer);
    }

    if (this.onEnemyHit) {
      this.onEnemyHit(hitResult);
    }

    return hitResult;
  }

  /**
   * Actualiza el ciclo de IA, navegación y temporizadores de todos los enemigos.
   * @param {number} dt Delta time en segundos
   * @param {Object} world Instancia del mundo voxel
   * @param {Array<Object>} players Jugadores activos
   * @param {number} now Timestamp actual
   */
  update(dt, world = null, players = [], now = Date.now()) {
    if (world) this.world = world;

    const callbacks = {
      onPlayerDamaged: this.onPlayerDamaged,
      nearbyEnemies: this.enemies,
    };

    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].update(dt, world, players, now, callbacks);
    }
  }

  /**
   * Comprueba si la posición está bloqueada por geometría sólida.
   * @private
   */
  _isBlocked(x, y, z, world) {
    if (this.enemies.length > 0) {
      return this.enemies[0].isBlocked(x, y, z, world);
    }
    return false;
  }

  /**
   * Obtiene todos los enemigos registrados.
   * @returns {Array<Object>}
   */
  getAllEnemies() {
    return this.enemies;
  }

  /**
   * Obtiene un enemigo por su identificador.
   * @param {string} id
   * @returns {Object|null}
   */
  getEnemy(id) {
    return this.enemies.find(e => e.id === id) || null;
  }

  /**
   * Limpia todos los enemigos de la sesión.
   */
  clear() {
    this.enemies.length = 0;
  }
}
