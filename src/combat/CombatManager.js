/**
 * CombatManager.js - Gestor autoritativo del sistema de combate híbrido PvE.
 *
 * Administra el pool Zero-GC de proyectiles balísticos y arcanos, la resolución
 * geométrica de ataques cuerpo a cuerpo (conos y ondas radiales), los blancos
 * de entrenamiento (Training Dummies) del Sector 2 y el cómputo de daño y DPS.
 */
import {
  WEAPON_TYPES,
  TRAINING_DUMMIES,
  getHeroWeapon,
  calculateDamage,
  calculateDps,
} from '../config/combat.js';
import { isSolid } from '../core/PhysicsAABB.js';

const MAX_PROJECTILES = 16;
const RECENT_HITS_WINDOW_MS = 3000;

export class CombatManager {
  /**
   * @param {Object} [options]
   * @param {(hitInfo: Object) => void} [options.onHit] Callback al impactar un blanco
   * @param {(proj: Object, weapon: Object, player: Object) => void} [options.onProjectileSpawn] Callback al disparar proyectil
   * @param {Object} [options.enemyManager] Gestor de enemigos PvE
   */
  constructor(options = {}) {
    this.onHit = options.onHit || null;
    this.onProjectileSpawn = options.onProjectileSpawn || null;
    this.enemyManager = options.enemyManager || null;

    // Inicializar blancos de entrenamiento a partir de la configuración canónica
    this.dummies = this._initDummies();

    // Pool de proyectiles Zero-GC pre-asignado
    this.projectiles = this._initProjectilePool(MAX_PROJECTILES);
  }

  /**
   * Crea el registro inicial de maniquíes con cajas AABB y estado de telemetría.
   * @private
   */
  _initDummies() {
    return TRAINING_DUMMIES.map(def => ({
      id: def.id,
      name: def.name,
      category: def.category,
      type: def.type,
      x: def.x,
      y: def.y,
      z: def.z,
      width: def.width,
      height: def.height,
      depth: def.depth,
      defense: def.defense,
      weakness: def.weakness,
      color: def.color,
      soundType: def.soundType,
      aabb: {
        minX: def.x - def.width / 2,
        maxX: def.x + def.width / 2,
        minY: def.y,
        maxY: def.y + def.height,
        minZ: def.z - def.depth / 2,
        maxZ: def.z + def.depth / 2,
      },
      totalDamage: 0,
      hitCount: 0,
      lastDamage: 0,
      lastHitTime: 0,
      recentHits: [],
      dps: 0.0,
      flashTimer: 0,
      shakeTimer: 0,
      shakeIntensity: 0,
    }));
  }

  /**
   * Pre-asigna las ranuras fijas de memoria para proyectiles activos.
   * @private
   */
  _initProjectilePool(capacity) {
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
   * Ejecuta el ataque de un jugador evaluando su arma canónica según su clase.
   * @param {Object} player Instancia del jugador (Player)
   * @param {number} [now] Timestamp en ms (por defecto Date.now())
   * @returns {{ weapon: Object, hits: Array<Object>, isProjectile: boolean, projectile?: Object }|null}
   */
  executePlayerAttack(player, now = Date.now()) {
    if (!player) return null;
    if (!player.triggerAttack(now)) return null;

    const weapon = player.weapon || getHeroWeapon(player.colorIndex);

    if (weapon.category === 'projectile') {
      const proj = this._spawnProjectile(player, weapon);
      if (this.onProjectileSpawn) {
        this.onProjectileSpawn(proj, weapon, player);
      }
      return { weapon, hits: [], isProjectile: true, projectile: proj };
    }

    // Ataque cuerpo a cuerpo / barrido / onda sísmica
    const hits = this._resolveMeleeAttack(player, weapon, now);
    return { weapon, hits, isProjectile: false };
  }

  /**
   * Resuelve el barrido cuerpo a cuerpo contra todos los blancos activos.
   * @private
   */
  _resolveMeleeAttack(player, weapon, now) {
    const hits = [];
    const px = player.pos.x;
    const py = player.pos.y;
    const pz = player.pos.z;
    const yaw = player.yaw;

    // Vector unitario de avance del jugador en el plano horizontal XZ
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const rangeSq = weapon.range * weapon.range;

    for (let i = 0; i < this.dummies.length; i++) {
      const dummy = this.dummies[i];
      const aabb = dummy.aabb;

      // 1. Descarte vertical por altura (holgura de ±0.5m)
      if (aabb.maxY < py - 0.5 || aabb.minY > py + 2.2) {
        continue;
      }

      // 2. Punto más cercano en AABB respecto a la posición del jugador en XZ
      const cx = Math.max(aabb.minX, Math.min(px, aabb.maxX));
      const cz = Math.max(aabb.minZ, Math.min(pz, aabb.maxZ));

      const dx = cx - px;
      const dz = cz - pz;
      const distSq = dx * dx + dz * dz;

      if (distSq > rangeSq) {
        continue;
      }

      // 3. Test angular según el arco del arma (60°, 180° o 360°)
      if (weapon.minDot <= -1) {
        // Onda sísmica radial de 360°: impacta en todas direcciones
        const hitResult = this.applyDamageToDummy(dummy.id, weapon.damage, weapon, player, now);
        if (hitResult) hits.push(hitResult);
      } else if (distSq === 0) {
        // Jugador colisionando directamente dentro de la AABB
        const hitResult = this.applyDamageToDummy(dummy.id, weapon.damage, weapon, player, now);
        if (hitResult) hits.push(hitResult);
      } else {
        const dist = Math.sqrt(distSq);
        const dot = (fx * dx + fz * dz) / dist;
        if (dot >= weapon.minDot) {
          const hitResult = this.applyDamageToDummy(dummy.id, weapon.damage, weapon, player, now);
          if (hitResult) hits.push(hitResult);
        }
      }
    }

    // Resolver barrido cuerpo a cuerpo contra enemigos vivos
    if (this.enemyManager) {
      const enemyMeleeHits = this.enemyManager.resolveMeleeAttack(player, weapon, now);
      for (let j = 0; j < enemyMeleeHits.length; j++) {
        hits.push(enemyMeleeHits[j]);
      }
    }

    return hits;
  }

  /**
   * Obtiene una ranura libre del pool de proyectiles y la activa con trayectoria 3D.
   * @private
   */
  _spawnProjectile(player, weapon) {
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

    return proj;
  }

  /**
   * Aplica daño a un maniquí específico calculando armadura y ventana de DPS.
   * @param {string} dummyId
   * @param {number} baseDamage
   * @param {Object} weapon
   * @param {Object} [sourcePlayer]
   * @param {number} [now]
   * @returns {{ dummy: Object, effectiveDamage: number, dps: number, weapon: Object }|null}
   */
  applyDamageToDummy(dummyId, baseDamage, weapon, sourcePlayer = null, now = Date.now()) {
    const dummy = this.dummies.find(d => d.id === dummyId);
    if (!dummy) return null;

    const effectiveDamage = calculateDamage(
      baseDamage,
      dummy.defense,
      dummy.weakness,
      weapon?.type || ''
    );

    dummy.totalDamage += effectiveDamage;
    dummy.hitCount += 1;
    dummy.lastDamage = effectiveDamage;
    dummy.lastHitTime = now;

    dummy.recentHits.push({ damage: effectiveDamage, timestamp: now });
    dummy.dps = calculateDps(dummy.recentHits, now, RECENT_HITS_WINDOW_MS);

    // Activar retroalimentación visual: hit flash (150ms) y sacudida
    dummy.flashTimer = 0.15;
    dummy.shakeTimer = 0.20;
    dummy.shakeIntensity = 0.08;

    const result = {
      dummy,
      dummyId: dummy.id,
      dummyName: dummy.name,
      effectiveDamage,
      dps: dummy.dps,
      totalDamage: dummy.totalDamage,
      hitCount: dummy.hitCount,
      weapon,
      sourcePlayer,
      soundType: dummy.soundType,
    };

    if (this.onHit) {
      this.onHit(result);
    }

    return result;
  }

  /**
   * Resuelve el impacto en área (AoE) provocado por proyectiles mágicos.
   * @private
   */
  _resolveAoeImpact(x, y, z, aoeRadius, damage, weapon, sourcePlayer, now) {
    const aoeRadiusSq = aoeRadius * aoeRadius;
    const hits = [];

    for (let i = 0; i < this.dummies.length; i++) {
      const dummy = this.dummies[i];
      const aabb = dummy.aabb;

      const cx = Math.max(aabb.minX, Math.min(x, aabb.maxX));
      const cy = Math.max(aabb.minY, Math.min(y, aabb.maxY));
      const cz = Math.max(aabb.minZ, Math.min(z, aabb.maxZ));

      const dx = cx - x;
      const dy = cy - y;
      const dz = cz - z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq <= aoeRadiusSq) {
        const hit = this.applyDamageToDummy(dummy.id, damage, weapon, sourcePlayer, now);
        if (hit) hits.push(hit);
      }
    }

    // Resolver también impacto en área contra enemigos vivos
    if (this.enemyManager) {
      const enemyHits = this.enemyManager.resolveAoeImpact(x, y, z, aoeRadius, damage, weapon, sourcePlayer, now);
      for (let j = 0; j < enemyHits.length; j++) {
        hits.push(enemyHits[j]);
      }
    }

    return hits;
  }

  /**
   * Actualiza la simulación física de proyectiles, temporizadores y ventanas de DPS.
   * @param {number} dt Delta time en segundos
   * @param {Object} [world] Instancia del mundo voxel para test de obstáculos
   * @param {number} [now] Timestamp en ms
   */
  update(dt, world = null, now = Date.now()) {
    // 1. Actualizar temporizadores y depurar impactos viejos en maniquíes
    const cutoff = now - RECENT_HITS_WINDOW_MS;
    for (let i = 0; i < this.dummies.length; i++) {
      const d = this.dummies[i];
      if (d.flashTimer > 0) d.flashTimer = Math.max(0, d.flashTimer - dt);
      if (d.shakeTimer > 0) d.shakeTimer = Math.max(0, d.shakeTimer - dt);

      // Limpiar impactos fuera de la ventana móvil de DPS
      if (d.recentHits.length > 0) {
        let removeCount = 0;
        for (let j = 0; j < d.recentHits.length; j++) {
          if (d.recentHits[j].timestamp < cutoff) {
            removeCount++;
          } else {
            break;
          }
        }
        if (removeCount > 0) {
          d.recentHits.splice(0, removeCount);
          d.dps = calculateDps(d.recentHits, now, RECENT_HITS_WINDOW_MS);
        }
      }
    }

    // 2. Simular proyectiles activos (Zero-GC)
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.active) continue;

      const stepDist = p.speed * dt;
      const prevX = p.x;
      const prevY = p.y;
      const prevZ = p.z;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.traveled += stepDist;

      if (p.traveled >= p.maxRange) {
        p.active = false;
        continue;
      }

      // Colisión contra vóxeles sólidos del mapa
      if (world) {
        const bx = Math.floor(p.x);
        const by = Math.floor(p.y);
        const bz = Math.floor(p.z);
        if (isSolid(world, bx, by, bz)) {
          if (p.aoeRadius > 0) {
            this._resolveAoeImpact(p.x, p.y, p.z, p.aoeRadius, p.damage, { type: p.type }, null, now);
          }
          p.active = false;
          continue;
        }
      }

      // Colisión contra cajas AABB de los maniquíes (swept AABB)
      const projRadius = 0.3;
      const pMinX = Math.min(prevX, p.x) - projRadius;
      const pMaxX = Math.max(prevX, p.x) + projRadius;
      const pMinY = Math.min(prevY, p.y) - projRadius;
      const pMaxY = Math.max(prevY, p.y) + projRadius;
      const pMinZ = Math.min(prevZ, p.z) - projRadius;
      const pMaxZ = Math.max(prevZ, p.z) + projRadius;

      let impacted = false;
      for (let j = 0; j < this.dummies.length; j++) {
        const dummy = this.dummies[j];
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
          if (p.aoeRadius > 0) {
            this._resolveAoeImpact(p.x, p.y, p.z, p.aoeRadius, p.damage, { type: p.type }, null, now);
          } else {
            this.applyDamageToDummy(dummy.id, p.damage, { type: p.type }, null, now);
          }
          break;
        }
      }

      if (!impacted && this.enemyManager) {
        if (this.enemyManager.testProjectileCollision(p, now, prevX, prevY, prevZ)) {
          impacted = true;
        }
      }

      if (impacted) {
        p.active = false;
      }
    }
  }

  /**
   * Reinicia los registros de daño y DPS de todos los maniquíes de prueba.
   */
  resetDummies() {
    for (let i = 0; i < this.dummies.length; i++) {
      const d = this.dummies[i];
      d.totalDamage = 0;
      d.hitCount = 0;
      d.lastDamage = 0;
      d.lastHitTime = 0;
      d.recentHits.length = 0;
      d.dps = 0.0;
      d.flashTimer = 0;
      d.shakeTimer = 0;
    }
  }

  /**
   * Obtiene un maniquí por su ID.
   * @param {string} id
   * @returns {Object|null}
   */
  getDummy(id) {
    return this.dummies.find(d => d.id === id) || null;
  }

  /**
   * Obtiene el listado completo de maniquíes.
   * @returns {Array<Object>}
   */
  getAllDummies() {
    return this.dummies;
  }
}
