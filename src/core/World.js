export const WORLD_X = 24;
export const WORLD_Y = 16;
export const WORLD_Z = 24;

export const BLOCK_AIR   = 0;
export const BLOCK_GRASS = 1;
export const BLOCK_DIRT  = 2;
export const BLOCK_STONE = 3;

export class World {
  constructor() {
    this.blocks = new Uint8Array(WORLD_X * WORLD_Y * WORLD_Z);
    this._generate();
  }

  idx(x, y, z) { return x + y * WORLD_X + z * WORLD_X * WORLD_Y; }
  inBounds(x, y, z) {
    return x >= 0 && x < WORLD_X && y >= 0 && y < WORLD_Y && z >= 0 && z < WORLD_Z;
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
  setFromArray(arr) { this.blocks.set(arr); }

  _generate() {
    // Capa 0 = césped, capas 1..3 = tierra, resto aire
    for (let x = 0; x < WORLD_X; x++) {
      for (let z = 0; z < WORLD_Z; z++) {
        this.set(x, 0, z, BLOCK_GRASS);
        for (let y = 1; y < 4; y++) this.set(x, y, z, BLOCK_DIRT);
      }
    }
    // Un par de bloques decorativos centrales
    this.set(12, 4, 12, BLOCK_STONE);
    this.set(11, 4, 12, BLOCK_STONE);
    this.set(12, 5, 12, BLOCK_STONE);
  }
}
