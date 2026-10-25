/**
 * EnemyNavigation.js - Navegación y steering de enemigos PvE.
 *
 * Extraído de BaseEnemy para mantener la entidad por debajo del límite de líneas
 * y separar la física de movimiento de la máquina de estados de combate.
 *
 * Implementa:
 * - Persecución directa con deslizamiento por ejes (Wall Sliding).
 * - Sensores de evasión de columnas y esquinas (Whiskers a ±45°, ±60° y ±90°).
 * - Separación entre enemigos para evitar apilamiento.
 * - Watchdog anti-trampa para concavidades.
 */
import { COMBAT_TUNING } from '../config/combat.js';

/**
 * Calcula el vector de separación frente a otros enemigos cercanos.
 * Escribe el resultado en `enemy._sepX`/`enemy._sepZ` para no asignar memoria por frame.
 *
 * @param {Object} enemy Entidad BaseEnemy
 * @param {Array<Object>} [nearbyEnemies]
 * @returns {boolean} True si hay una fuerza de separación activa
 */
export function computeSeparation(enemy, nearbyEnemies) {
  enemy._sepX = 0;
  enemy._sepZ = 0;
  if (!nearbyEnemies || nearbyEnemies.length < 2) return false;

  const factor = COMBAT_TUNING.separationRadiusFactor;

  for (let i = 0; i < nearbyEnemies.length; i++) {
    const other = nearbyEnemies[i];
    if (!other || other === enemy || other.isDead) continue;

    const dx = enemy.x - other.x;
    const dz = enemy.z - other.z;
    const distSq = dx * dx + dz * dz;
    const minDist = ((enemy.width + (other.width || 0)) / 2) * factor;

    if (minDist <= 0) continue;

    if (distSq < 1e-6) {
      // Solapamiento exacto: empuje determinista alterno para desapilar
      enemy._sepX += i % 2 === 0 ? 1 : -1;
      continue;
    }

    const dist = Math.sqrt(distSq);
    if (dist >= minDist) continue;

    const push = (minDist - dist) / minDist;
    enemy._sepX += (dx / dist) * push;
    enemy._sepZ += (dz / dist) * push;
  }

  return enemy._sepX !== 0 || enemy._sepZ !== 0;
}

/**
 * Desplaza al enemigo hacia el jugador objetivo combinando persecución, separación y evasión.
 *
 * @param {Object} enemy Entidad BaseEnemy
 * @param {Object} targetPlayer
 * @param {number} dt Delta time en segundos
 * @param {Object} world Mundo voxel
 * @param {Array<Object>} [nearbyEnemies] Lista completa de enemigos de la sesión
 */
export function moveTowardsTarget(enemy, targetPlayer, dt, world, nearbyEnemies = null) {
  enemy.state = 'chase';
  enemy.telegraphTimer = 0;

  const dx = targetPlayer.pos.x - enemy.x;
  const dz = targetPlayer.pos.z - enemy.z;
  const dist = Math.hypot(dx, dz);
  if (dist <= 0.0001) return;

  const step = Math.min(dist, enemy.speed * dt);
  let dirX = dx / dist;
  let dirZ = dz / dist;

  // Separación entre enemigos: se suma al vector hacia el objetivo y se renormaliza
  if (computeSeparation(enemy, nearbyEnemies)) {
    dirX += enemy._sepX * COMBAT_TUNING.separationWeight;
    dirZ += enemy._sepZ * COMBAT_TUNING.separationWeight;
    const dirLen = Math.hypot(dirX, dirZ);
    if (dirLen > 1e-4) {
      dirX /= dirLen;
      dirZ /= dirLen;
    }
  }

  const baseAngle = Math.atan2(-dirX, -dirZ);

  // 1. Intento directo hacia el objetivo
  const directX = enemy.x + dirX * step;
  const directZ = enemy.z + dirZ * step;

  if (!enemy.isBlocked(directX, enemy.y, directZ, world) && enemy.customCanMove(directX, enemy.y, directZ, world)) {
    enemy.x = directX;
    enemy.z = directZ;
    enemy.yaw = baseAngle;
    enemy.updateAABB();
    enemy.stuckTimer = 0;
    return;
  }

  // 2. Deslizamiento continuo por descomposición de ejes (Wall Sliding)
  const hasDirX = Math.abs(dirX) > 0.08;
  const hasDirZ = Math.abs(dirZ) > 0.08;

  const canMoveX =
    hasDirX && !enemy.isBlocked(directX, enemy.y, enemy.z, world) && enemy.customCanMove(directX, enemy.y, enemy.z, world);
  const canMoveZ =
    hasDirZ && !enemy.isBlocked(enemy.x, enemy.y, directZ, world) && enemy.customCanMove(enemy.x, enemy.y, directZ, world);

  if (canMoveX && !canMoveZ) {
    enemy.x = directX;
    enemy.yaw = dirX > 0 ? -Math.PI / 2 : Math.PI / 2;
    enemy.updateAABB();
    enemy.stuckTimer = 0;
    return;
  }

  if (canMoveZ && !canMoveX) {
    enemy.z = directZ;
    enemy.yaw = dirZ > 0 ? 0 : Math.PI;
    enemy.updateAABB();
    enemy.stuckTimer = 0;
    return;
  }

  // 3. Sensores de Evasión de Esquinas y Columnas ("Whiskers Steering")
  const bias = enemy.stuckBias || 1;
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
    const pNextX = enemy.x + pDirX * step;
    const pNextZ = enemy.z + pDirZ * step;

    if (!enemy.isBlocked(pNextX, enemy.y, pNextZ, world) && enemy.customCanMove(pNextX, enemy.y, pNextZ, world)) {
      enemy.x = pNextX;
      enemy.z = pNextZ;
      enemy.yaw = pAngle;
      enemy.updateAABB();
      enemy.stuckTimer = 0;
      return;
    }
  }

  // 4. Watchdog anti-trampa para concavidades complejas
  enemy.stuckTimer = (enemy.stuckTimer || 0) + dt;
  if (enemy.stuckTimer > 0.3) {
    enemy.stuckBias = (enemy.stuckBias || 1) * -1;
    enemy.stuckTimer = 0;
  }
}
