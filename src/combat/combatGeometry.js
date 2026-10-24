/**
 * combatGeometry.js - Utilidades geométricas compartidas por el subsistema de combate.
 *
 * Centraliza el cálculo de línea de visión y el barrido continuo contra la geometría
 * voxel para que CombatManager y EnemyManager apliquen exactamente las mismas reglas:
 * - Los ataques cuerpo a cuerpo y las explosiones AoE no atraviesan muros.
 * - Los proyectiles no se teletransportan a través de bloques en frames largos.
 */
import { isSolid } from '../core/PhysicsAABB.js';

/** Longitud (m) de cada muestra del barrido; menor que el bloque más fino del mapa. */
const SAMPLE_STEP = 0.25;

/**
 * Devuelve el punto del AABB más cercano a una coordenada dada.
 * Permite reutilizar un objeto de salida para no asignar memoria en bucles de combate.
 *
 * @param {{minX:number,maxX:number,minY:number,maxY:number,minZ:number,maxZ:number}} aabb
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {{x:number,y:number,z:number}} [out] Objeto reutilizable de salida
 * @returns {{x:number,y:number,z:number}}
 */
export function closestPointOnAabb(aabb, x, y, z, out = null) {
  const point = out || { x: 0, y: 0, z: 0 };
  point.x = Math.max(aabb.minX, Math.min(x, aabb.maxX));
  point.y = Math.max(aabb.minY, Math.min(y, aabb.maxY));
  point.z = Math.max(aabb.minZ, Math.min(z, aabb.maxZ));
  return point;
}

/**
 * Comprueba si el segmento entre dos puntos está libre de geometría sólida.
 * Sin mundo disponible se asume visión libre (entornos de test o simulación pura).
 *
 * @param {Object|null} world Mundo voxel con el método `get(bx, by, bz)`
 * @param {number} x0
 * @param {number} y0
 * @param {number} z0
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} [step=SAMPLE_STEP]
 * @returns {boolean} True si no hay bloques sólidos intermedios
 */
export function hasLineOfSight(world, x0, y0, z0, x1, y1, z1, step = SAMPLE_STEP) {
  if (!world || typeof world.get !== 'function') return true;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const dz = z1 - z0;
  const dist = Math.hypot(dx, dy, dz);
  if (dist < 1e-4) return true;

  const steps = Math.max(1, Math.ceil(dist / step));
  // Se excluyen los extremos: el origen puede estar junto a una pared y el
  // destino puede tocar el borde del AABB sin que eso cuente como oclusión.
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (isSolid(world, Math.floor(x0 + dx * t), Math.floor(y0 + dy * t), Math.floor(z0 + dz * t))) {
      return false;
    }
  }
  return true;
}

/**
 * Recorre un segmento y devuelve el primer punto que impacta geometría sólida.
 * Se usa para el barrido continuo de proyectiles y evitar tunneling en frames largos.
 *
 * @param {Object|null} world Mundo voxel con el método `get(bx, by, bz)`
 * @param {number} x0
 * @param {number} y0
 * @param {number} z0
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} [step=SAMPLE_STEP]
 * @param {{x:number,y:number,z:number}} [out] Objeto reutilizable de salida
 * @returns {{x:number,y:number,z:number}|null} Punto de impacto o null si el tramo está libre
 */
export function traceSolidSegment(world, x0, y0, z0, x1, y1, z1, step = SAMPLE_STEP, out = null) {
  if (!world || typeof world.get !== 'function') return null;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const dz = z1 - z0;
  const dist = Math.hypot(dx, dy, dz);
  if (dist < 1e-4) return null;

  const steps = Math.max(1, Math.ceil(dist / step));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    const z = z0 + dz * t;
    if (isSolid(world, Math.floor(x), Math.floor(y), Math.floor(z))) {
      const point = out || { x: 0, y: 0, z: 0 };
      point.x = x;
      point.y = y;
      point.z = z;
      return point;
    }
  }
  return null;
}
