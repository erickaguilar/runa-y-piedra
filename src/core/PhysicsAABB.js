import { WORLD_CONFIG, PHYSICS_CONFIG, BLOCK_TYPES } from '../config/constants.js';

export const PLAYER_W = PHYSICS_CONFIG.PLAYER_W;
export const PLAYER_H = PHYSICS_CONFIG.PLAYER_H;
const HALF_W = PLAYER_W / 2;
const MIN_Y = WORLD_CONFIG.MIN_Y ?? 0;

export function isWaterBlock(block) {
  return (
    block === BLOCK_TYPES.WATER ||
    block === BLOCK_TYPES.WATER_STREAM_NORTH ||
    block === BLOCK_TYPES.WATER_STREAM_SOUTH ||
    block === BLOCK_TYPES.WATER_STREAM_EAST ||
    block === BLOCK_TYPES.WATER_STREAM_WEST
  );
}

export function isSolid(world, bx, by, bz) {
  const block = world.get(bx, by, bz);
  return (
    block !== BLOCK_TYPES.AIR &&
    block !== BLOCK_TYPES.LAVA &&
    !isWaterBlock(block) &&
    block !== undefined &&
    block !== null
  );
}

export function isFloorOrSupport(world, bx, by, bz) {
  const block = world.get(bx, by, bz);
  return (
    block !== BLOCK_TYPES.AIR &&
    block !== BLOCK_TYPES.LAVA &&
    block !== undefined &&
    block !== null
  );
}

function overlapsSupport(world, x, y, z) {
  const minX = Math.floor(x - HALF_W);
  const maxX = Math.floor(x + HALF_W);
  const minY = Math.floor(y);
  const maxY = Math.floor(y + PLAYER_H - 1e-4);
  const minZ = Math.floor(z - HALF_W);
  const maxZ = Math.floor(z + HALF_W);

  const limitX = world?.sizeX ?? WORLD_CONFIG.SIZE_X;
  const limitZ = world?.sizeZ ?? WORLD_CONFIG.SIZE_Z;
  if (minX < 0 || maxX >= limitX || minZ < 0 || maxZ >= limitZ) {
    return true;
  }

  if (maxY < MIN_Y) {
    return false;
  }

  const checkMinY = Math.max(MIN_Y, minY);
  const checkMaxY = Math.min(WORLD_CONFIG.SIZE_Y - 1, maxY);

  for (let bx = minX; bx <= maxX; bx++) {
    for (let by = checkMinY; by <= checkMaxY; by++) {
      for (let bz = minZ; bz <= maxZ; bz++) {
        if (isFloorOrSupport(world, bx, by, bz)) return true;
      }
    }
  }
  return false;
}

function overlaps(world, x, y, z) {
  const minX = Math.floor(x - HALF_W);
  const maxX = Math.floor(x + HALF_W);
  const minY = Math.floor(y);
  const maxY = Math.floor(y + PLAYER_H - 1e-4);
  const minZ = Math.floor(z - HALF_W);
  const maxZ = Math.floor(z + HALF_W);

  // Límite físico: impide salir de las dimensiones del mundo
  const limitX = world?.sizeX ?? WORLD_CONFIG.SIZE_X;
  const limitZ = world?.sizeZ ?? WORLD_CONFIG.SIZE_Z;
  if (minX < 0 || maxX >= limitX || minZ < 0 || maxZ >= limitZ) {
    return true;
  }

  // Si el cuerpo del jugador está totalmente bajo el mundo (en el abismo), no colisiona con bloques
  if (maxY < MIN_Y) {
    return false;
  }

  const checkMinY = Math.max(MIN_Y, minY);
  const checkMaxY = Math.min(WORLD_CONFIG.SIZE_Y - 1, maxY);

  for (let bx = minX; bx <= maxX; bx++) {
    for (let by = checkMinY; by <= checkMaxY; by++) {
      for (let bz = minZ; bz <= maxZ; bz++) {
        if (isSolid(world, bx, by, bz)) return true;
      }
    }
  }
  return false;
}

/**
 * Mueve la posición con resolución por ejes.
 * @returns {{onGround:boolean, hitX:boolean, hitY:boolean, hitZ:boolean}}
 */
export function tryMove(world, pos, dx, dy, dz) {
  let hitX = false, hitY = false, hitZ = false, onGround = false;

  // Eje X: los bloques de agua no bloquean el paso horizontal
  if (dx !== 0) {
    pos.x += dx;
    if (overlaps(world, pos.x, pos.y, pos.z)) {
      pos.x -= dx;
      hitX = true;
    }
  }

  // Eje Z: los bloques de agua no bloquean el paso horizontal
  if (dz !== 0) {
    pos.z += dz;
    if (overlaps(world, pos.x, pos.y, pos.z)) {
      pos.z -= dz;
      hitZ = true;
    }
  }

  // Eje Y: soporte vertical de suelo firme o lecho/superficie de agua
  if (dy !== 0) {
    const oldY = pos.y;
    pos.y += dy;
    const isDownward = dy < 0;
    const hasOverlap = isDownward
      ? overlapsSupport(world, pos.x, pos.y, pos.z)
      : overlaps(world, pos.x, pos.y, pos.z);

    if (hasOverlap) {
      if (isDownward) {
        // Caída: buscar si hay una superficie sólida o de agua directamente bajo los pies
        const minX = Math.floor(pos.x - HALF_W);
        const maxX = Math.floor(pos.x + HALF_W);
        const minZ = Math.floor(pos.z - HALF_W);
        const maxZ = Math.floor(pos.z + HALF_W);

        let floorTop = -Infinity;
        for (let bx = minX; bx <= maxX; bx++) {
          for (let bz = minZ; bz <= maxZ; bz++) {
            // Buscamos bloques de soporte inmediatamente debajo o al nivel de los pies previos
            const maxBy = Math.min(WORLD_CONFIG.SIZE_Y - 1, Math.floor(oldY + 0.1));
            for (let by = maxBy; by >= MIN_Y; by--) {
              if (isFloorOrSupport(world, bx, by, bz)) {
                const top = by + 1.0;
                // Solo aterriza si el jugador venía desde arriba de la superficie (evita subir a muros/bardas)
                if (top <= oldY + 0.2 && top > floorTop) {
                  floorTop = top;
                }
                break; // Solo el bloque superior de esta columna
              }
            }
          }
        }

        if (floorTop !== -Infinity) {
          pos.y = floorTop;
          onGround = true;
          hitY = true;
        } else {
          // No hay superficie de aterrizaje; continúa la caída libre vertical en el abismo
          pos.y = oldY + dy;
        }
      } else {
        // Movimiento ascendente: choca contra techo o dintel sólido
        pos.y = oldY;
        hitY = true;
      }
    }
  }

  // Chequeo de suelo: verificar si los pies descansan sobre un bloque sólido o de agua
  if (!onGround && pos.y >= 0.95) {
    const minX = Math.floor(pos.x - HALF_W);
    const maxX = Math.floor(pos.x + HALF_W);
    const minZ = Math.floor(pos.z - HALF_W);
    const maxZ = Math.floor(pos.z + HALF_W);
    const checkBy = Math.floor(pos.y - 0.05);

    if (checkBy >= MIN_Y && checkBy < WORLD_CONFIG.SIZE_Y) {
      for (let bx = minX; bx <= maxX; bx++) {
        for (let bz = minZ; bz <= maxZ; bz++) {
          if (isFloorOrSupport(world, bx, checkBy, bz)) {
            onGround = true;
            break;
          }
        }
        if (onGround) break;
      }
    }
  }

  return { onGround, hitX, hitY, hitZ };
}
