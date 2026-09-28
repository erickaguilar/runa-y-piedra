import { WORLD_CONFIG, BLOCK_TYPES } from '../config/constants.js';

export const WORLD_X = WORLD_CONFIG.SIZE_X;
export const WORLD_Y = WORLD_CONFIG.SIZE_Y;
export const WORLD_Z = WORLD_CONFIG.SIZE_Z;

export const BLOCK_AIR   = BLOCK_TYPES.AIR;
export const BLOCK_GRASS = BLOCK_TYPES.GRASS;
export const BLOCK_DIRT  = BLOCK_TYPES.DIRT;
export const BLOCK_STONE = BLOCK_TYPES.STONE;
export const BLOCK_WALL  = BLOCK_TYPES.WALL;

export class World {
  constructor() {
    this.blocks = new Uint8Array(WORLD_X * WORLD_Y * WORLD_Z);
    this._generate();
  }

  idx(x, y, z) {
    return x + y * WORLD_X + z * WORLD_X * WORLD_Y;
  }

  inBounds(x, y, z) {
    return x >= 0 && x < WORLD_X && y >= 0 && y < WORLD_Y && z >= 0 && z < WORLD_Z;
  }

  isBorder(x, z) {
    return x === 0 || x === WORLD_X - 1 || z === 0 || z === WORLD_Z - 1;
  }

  get(x, y, z) {
    if (!this.inBounds(x, y, z)) return BLOCK_AIR;
    return this.blocks[this.idx(x, y, z)];
  }

  set(x, y, z, v) {
    if (!this.inBounds(x, y, z)) return false;
    this.blocks[this.idx(x, y, z)] = v;
    return true;
  }

  setFromArray(arr) {
    this.blocks.set(arr);
  }

  _generate() {
    // Capa 0 = césped, capas 1..3 = tierra, resto aire
    for (let x = 0; x < WORLD_X; x++) {
      for (let z = 0; z < WORLD_Z; z++) {
        this.set(x, 0, z, BLOCK_GRASS);
        for (let y = 1; y < 4; y++) this.set(x, y, z, BLOCK_DIRT);

        // Muros perimetrales protectores en los bordes (2 bloques sobre el suelo)
        if (this.isBorder(x, z)) {
          this.set(x, 4, z, BLOCK_WALL);
          this.set(x, 5, z, BLOCK_WALL);
        }
      }
    }
    // Bloques decorativos centrales
    this.set(12, 4, 12, BLOCK_STONE);
    this.set(11, 4, 12, BLOCK_STONE);
    this.set(12, 5, 12, BLOCK_STONE);
  }
}
