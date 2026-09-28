import { WORLD_CONFIG, PHYSICS_CONFIG } from '../config/constants.js';

export const PLAYER_W = PHYSICS_CONFIG.PLAYER_W;
export const PLAYER_H = PHYSICS_CONFIG.PLAYER_H;
const HALF_W = PLAYER_W / 2;

function overlaps(world, x, y, z) {
  const minX = Math.floor(x - HALF_W);
  const maxX = Math.floor(x + HALF_W);
  const minY = Math.floor(y);
  const maxY = Math.floor(y + PLAYER_H - 1e-4);
  const minZ = Math.floor(z - HALF_W);
  const maxZ = Math.floor(z + HALF_W);

  // Límite físico: impide salir de las dimensiones del mundo
  if (minX < 0 || maxX >= WORLD_CONFIG.SIZE_X || minZ < 0 || maxZ >= WORLD_CONFIG.SIZE_Z) {
    return true;
  }

  for (let bx = minX; bx <= maxX; bx++) {
    for (let by = minY; by <= maxY; by++) {
      for (let bz = minZ; bz <= maxZ; bz++) {
        if (world.get(bx, by, bz) !== 0) return true;
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

  // Eje X
  if (dx !== 0) {
    pos.x += dx;
    if (overlaps(world, pos.x, pos.y, pos.z)) {
      pos.x -= dx;
      hitX = true;
    }
  }

  // Eje Z
  if (dz !== 0) {
    pos.z += dz;
    if (overlaps(world, pos.x, pos.y, pos.z)) {
      pos.z -= dz;
      hitZ = true;
    }
  }

  // Eje Y
  if (dy !== 0) {
    pos.y += dy;
    if (overlaps(world, pos.x, pos.y, pos.z)) {
      if (dy < 0) {
        // Snap hacia arriba hasta salir del bloque
        pos.y = Math.ceil(pos.y);
        let guard = 0;
        while (overlaps(world, pos.x, pos.y, pos.z) && guard++ < WORLD_CONFIG.SIZE_Y + 2) {
          pos.y += 1;
        }
        onGround = true;
      } else {
        pos.y -= dy;
      }
      hitY = true;
    }
  }

  // Chequeo de suelo
  if (!onGround && overlaps(world, pos.x, pos.y - 0.05, pos.z)) {
    onGround = true;
  }

  return { onGround, hitX, hitY, hitZ };
}
