import { WORLD_X, WORLD_Z, WORLD_Y } from './World.js';

export const PLAYER_W = 0.6;
export const PLAYER_H = 1.8;
const HALF_W = PLAYER_W / 2;

function overlaps(world, x, y, z) {
  const minX = Math.floor(x - HALF_W);
  const maxX = Math.floor(x + HALF_W);
  const minY = Math.floor(y);
  const maxY = Math.floor(y + PLAYER_H - 1e-4);
  const minZ = Math.floor(z - HALF_W);
  const maxZ = Math.floor(z + HALF_W);

  // Límite físico: impide salir de las dimensiones del mundo (barrera invisible impenetrable)
  if (minX < 0 || maxX >= WORLD_X || minZ < 0 || maxZ >= WORLD_Z) {
    return true;
  }

  for (let bx = minX; bx <= maxX; bx++)
    for (let by = minY; by <= maxY; by++)
      for (let bz = minZ; bz <= maxZ; bz++)
        if (world.get(bx, by, bz) !== 0) return true;
  return false;
}

/**
 * Mueve la posición con resolución por ejes.
 * @returns {{onGround:boolean, hitX:boolean, hitY:boolean, hitZ:boolean}}
 */
export function tryMove(world, pos, dx, dy, dz) {
  let hitX = false, hitY = false, hitZ = false, onGround = false;

  // X
  if (dx !== 0) {
    pos.x += dx;
    if (overlaps(world, pos.x, pos.y, pos.z)) { pos.x -= dx; hitX = true; }
  }

  // Z
  if (dz !== 0) {
    pos.z += dz;
    if (overlaps(world, pos.x, pos.y, pos.z)) { pos.z -= dz; hitZ = true; }
  }

  // Y
  if (dy !== 0) {
    pos.y += dy;
    if (overlaps(world, pos.x, pos.y, pos.z)) {
      if (dy < 0) {
        // Snap hacia arriba hasta salir del bloque (busca el suelo)
        pos.y = Math.ceil(pos.y);
        let guard = 0;
        while (overlaps(world, pos.x, pos.y, pos.z) && guard++ < WORLD_Y + 2) pos.y += 1;
        onGround = true;
      } else {
        pos.y -= dy;
      }
      hitY = true;
    }
  }

  // Chequeo de suelo (para detectar estar parado)
  if (!onGround && overlaps(world, pos.x, pos.y - 0.05, pos.z)) onGround = true;

  return { onGround, hitX, hitY, hitZ };
}
