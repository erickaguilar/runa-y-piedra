/**
 * CombatManager.js - Gestor autoritativo del sistema de combate híbrido PvE.
 *
 * Administra el pool Zero-GC de proyectiles balísticos y arcanos, la resolución
 * geométrica de ataques cuerpo a cuerpo (conos y ondas radiales), los blancos
 * de entrenamiento (Training Dummies) del Sector 2 y el cómputo de daño y DPS.
 */
import {
  TRAINING_DUMMIES,
  getHeroWeapon,
  calculateDamage,
  calculateDps,
  getDistanceDamageModifier,
} from '../config/combat.js';
import { closestPointOnAabb, hasLineOfSight } from './combatGeometry.js';
import { ProjectilePool } from './ProjectilePool.js';

const RECENT_HITS_WINDOW_MS = 3000;
const EMPTY_LIST = [];

export class CombatManager {
  /**
   * @param {Object} [options]
   * @param {(hitInfo: Object) => void} [options.onHit] Callback al impactar un blanco
   * @param {(proj: Object, weapon: Object, player: Object) => void} [options.onProjectileSpawn] Callback al disparar proyectil
   * @param {Object} [options.enemyManager] Gestor de enemigos PvE
   * @param {Object} [options.world] Mundo voxel para línea de visión y colisiones
   * @param {boolean} [options.authoritative=true] False en clientes: el host resuelve el daño
   */
  constructor(options = {}) {
    this.onHit = options.onHit || null;
    this.onProjectileSpawn = options.onProjectileSpawn || null;
    this.enemyManager = options.enemyManager || null;
    this.world = options.world || null;
    // En un cliente el combate es solo visual: el host resuelve el daño autoritativo.
    this.authoritative = options.authoritative !== false;

    // Objetos reutilizables para no asignar memoria en la resolución de impactos
    this._losPoint = { x: 0, y: 0, z: 0 };

    // Inicializar blancos de entrenamiento a partir de la configuración canónica
    this.dummies = this._initDummies();

    // Pool de proyectiles Zero-GC y callbacks de impacto (creados una sola vez)
    this.projectilePool = new ProjectilePool();
    this.projectiles = this.projectilePool.projectiles;
    this._projectileHandlers = {
      onWorldHit: (p, hit, now) => {
        if (!this.authoritative) return;
        this._resolveAoeImpact(
          hit.x,
          hit.y,
          hit.z,
          p.aoeRadius,
          p.damage,
          p.weapon || { type: p.type },
          p.sourcePlayer || null,
          now,
          p.traveled,
          this.world
        );
      },
      onDummyHit: (p, dummy, now) => {
        if (!this.authoritative) return;
        if (p.aoeRadius > 0) {
          this._resolveAoeImpact(
            p.x,
            p.y,
            p.z,
            p.aoeRadius,
            p.damage,
            p.weapon || { type: p.type },
            p.sourcePlayer || null,
            now,
            p.traveled,
            this.world
          );
        } else {
          this.applyDamageToDummy(dummy.id, p.damage, p.weapon || { type: p.type }, p.sourcePlayer || null, now, p.traveled);
        }
      },
    };
  }

  /**
   * Activa o desactiva la resolución autoritativa de daño.
   * En clientes se desactiva para que solo rendericen proyectiles y eventos del host.
   * @param {boolean} flag
   */
  setAuthoritative(flag) {
    this.authoritative = !!flag;
  }

  /**
   * Crea un proyectil exclusivamente visual (cliente) a partir de un evento del host.
   * @param {Object} playerLike { id, pos:{x,y,z}, yaw, pitch }
   * @param {Object} weapon Arma canónica
   * @returns {Object|null}
   */
  spawnVisualProjectile(playerLike, weapon) {
    if (!playerLike || !weapon || !this.projectilePool) return null;
    return this.projectilePool.spawn(playerLike, weapon);
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
      lastDistance: 0,
      lastDistanceLabel: '',
      lastIsBonus: false,
      recentHits: [],
      dps: 0.0,
      flashTimer: 0,
      shakeTimer: 0,
      shakeIntensity: 0,
    }));
  }

  /**
   * Ejecuta el ataque de un jugador evaluando su arma canónica según su clase.
   * @param {Object} player Instancia del jugador (Player)
   * @param {number} [now] Timestamp en ms (por defecto Date.now())
   * @param {Object} [world] Mundo voxel para línea de visión (por defecto el cacheado)
   * @returns {{ weapon: Object, hits: Array<Object>, isProjectile: boolean, projectile?: Object }|null}
   */
  executePlayerAttack(player, now = Date.now(), world = this.world) {
    if (!player) return null;
    if (!player.triggerAttack(now)) return null;

    if (world) this.world = world;

    const weapon = player.weapon || getHeroWeapon(player.colorIndex);

    if (weapon.category === 'projectile') {
      const proj = this.projectilePool.spawn(player, weapon);
      if (this.onProjectileSpawn) {
        this.onProjectileSpawn(proj, weapon, player);
      }
      return { weapon, hits: [], isProjectile: true, projectile: proj };
    }

    // Ataque cuerpo a cuerpo / barrido / onda sísmica
    const hits = this._resolveMeleeAttack(player, weapon, now, this.world);
    return { weapon, hits, isProjectile: false };
  }

  /**
   * Resuelve el barrido cuerpo a cuerpo contra todos los blancos activos.
   * Exige línea de visión para que los muros no se puedan atravesar con el filo.
   * @private
   */
  _resolveMeleeAttack(player, weapon, now, world = this.world) {
    const hits = [];
    const px = player.pos.x;
    const py = player.pos.y;
    const pz = player.pos.z;
    const yaw = player.yaw;
    const eyeY = py + 1.2;

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
      const dist = distSq > 0 ? Math.sqrt(distSq) : 0;
      let inArc;
      if (weapon.minDot <= -1 || distSq === 0) {
        // Onda sísmica radial de 360° o impacto a quemarropa
        inArc = true;
      } else {
        inArc = (fx * dx + fz * dz) / dist >= weapon.minDot;
      }
      if (!inArc) continue;

      // 4. Línea de visión: el filo no atraviesa muros ni columnas
      const target = closestPointOnAabb(aabb, px, eyeY, pz, this._losPoint);
      if (!hasLineOfSight(world, px, eyeY, pz, target.x, target.y, target.z)) {
        continue;
      }

      const hitResult = this.applyDamageToDummy(dummy.id, weapon.damage, weapon, player, now, dist);
      if (hitResult) hits.push(hitResult);
    }

    // Resolver barrido cuerpo a cuerpo contra enemigos vivos
    if (this.enemyManager) {
      const enemyMeleeHits = this.enemyManager.resolveMeleeAttack(player, weapon, now, world);
      for (let j = 0; j < enemyMeleeHits.length; j++) {
        hits.push(enemyMeleeHits[j]);
      }
    }

    return hits;
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
  applyDamageToDummy(dummyId, baseDamage, weapon, sourcePlayer = null, now = Date.now(), distance = 0) {
    const dummy = this.dummies.find(d => d.id === dummyId);
    if (!dummy) return null;

    const distMod = getDistanceDamageModifier(weapon, distance);
    const effectiveDamage = calculateDamage(
      baseDamage,
      dummy.defense,
      dummy.weakness,
      weapon?.type || '',
      distance,
      weapon
    );

    dummy.totalDamage += effectiveDamage;
    dummy.hitCount += 1;
    dummy.lastDamage = effectiveDamage;
    dummy.lastHitTime = now;
    dummy.lastDistance = distance;
    dummy.lastDistanceLabel = distMod.label;
    dummy.lastIsBonus = distMod.isBonus;

    dummy.recentHits.push({ damage: effectiveDamage, timestamp: now });
    dummy.dps = calculateDps(dummy.recentHits, now, RECENT_HITS_WINDOW_MS);

    // Retroalimentación visual: hit flash (150ms) y sacudida amplificada si fue bonus
    dummy.flashTimer = 0.15;
    dummy.shakeTimer = distMod.isBonus ? 0.30 : 0.20;
    dummy.shakeIntensity = distMod.isBonus ? 0.14 : 0.08;

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
      distance,
      distanceLabel: distMod.label,
      isDistanceBonus: distMod.isBonus,
      bonusDamage: distMod.bonusDamage,
    };

    if (this.onHit) {
      this.onHit(result);
    }

    return result;
  }

  /**
   * Resuelve el impacto en área (AoE) provocado por proyectiles mágicos.
   * Aplica oclusión: la explosión no daña a través de muros.
   * @private
   */
  _resolveAoeImpact(x, y, z, aoeRadius, damage, weapon, sourcePlayer, now, distance = 0, world = this.world) {
    const aoeRadiusSq = aoeRadius * aoeRadius;
    const hits = [];

    for (let i = 0; i < this.dummies.length; i++) {
      const dummy = this.dummies[i];
      const aabb = dummy.aabb;

      const closest = closestPointOnAabb(aabb, x, y, z, this._losPoint);

      const dx = closest.x - x;
      const dy = closest.y - y;
      const dz = closest.z - z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq <= aoeRadiusSq && hasLineOfSight(world, x, y, z, closest.x, closest.y, closest.z)) {
        const hit = this.applyDamageToDummy(dummy.id, damage, weapon, sourcePlayer, now, distance);
        if (hit) hits.push(hit);
      }
    }

    // Resolver también impacto en área contra enemigos vivos
    if (this.enemyManager) {
      const enemyHits = this.enemyManager.resolveAoeImpact(x, y, z, aoeRadius, damage, weapon, sourcePlayer, now, distance, world);
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
    if (world) this.world = world;

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
    this.projectilePool.update(
      dt,
      this.world,
      now,
      this.authoritative ? this.dummies : EMPTY_LIST,
      this.authoritative ? this.enemyManager : null,
      this._projectileHandlers
    );
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
      d.lastDistance = 0;
      d.lastDistanceLabel = '';
      d.lastIsBonus = false;
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
