import { WORLD_CONFIG, BLOCK_TYPES } from '../config/constants.js';

export const WORLD_X = WORLD_CONFIG.SIZE_X;
export const WORLD_Y = WORLD_CONFIG.SIZE_Y;
export const WORLD_Z = WORLD_CONFIG.SIZE_Z;

export class World {
  constructor() {
    this.blocks = new Uint8Array(WORLD_X * WORLD_Y * WORLD_Z);
    this.isDoorOpen = false;
    this._generateDungeon();
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

  isDoorCoord(x, y, z) {
    return (x === 11 || x === 12) && z === 12 && (y === 1 || y === 2);
  }

  get(x, y, z) {
    if (!this.inBounds(x, y, z)) return BLOCK_TYPES.AIR;
    return this.blocks[this.idx(x, y, z)];
  }

  set(x, y, z, v) {
    if (!this.inBounds(x, y, z)) return false;
    this.blocks[this.idx(x, y, z)] = v;
    return true;
  }

  setFromArray(arr) {
    this.blocks.set(arr);
    this.isDoorOpen = (this.get(11, 1, 12) === BLOCK_TYPES.AIR);
  }

  openDungeonDoor() {
    this.isDoorOpen = true;
    this.set(11, 1, 12, BLOCK_TYPES.AIR);
    this.set(11, 2, 12, BLOCK_TYPES.AIR);
    this.set(12, 1, 12, BLOCK_TYPES.AIR);
    this.set(12, 2, 12, BLOCK_TYPES.AIR);
  }

  _generateDungeon() {
    // 1. Suelo de losas de piedra en toda la mazmorra (y = 0)
    for (let x = 0; x < WORLD_X; x++) {
      for (let z = 0; z < WORLD_Z; z++) {
        this.set(x, 0, z, BLOCK_TYPES.STONE_FLOOR);
      }
    }

    // 2. Muros perimetrales exteriores (altura 3 bloques: y = 1, 2, 3)
    for (let x = 0; x < WORLD_X; x++) {
      for (let z = 0; z < WORLD_Z; z++) {
        if (this.isBorder(x, z)) {
          for (let y = 1; y <= 3; y++) {
            this.set(x, y, z, BLOCK_TYPES.WALL);
          }
        }
      }
    }

    // 3. Muro divisor entre Área 1 (Vestíbulo) y Área 2 (Cripta) en z = 12
    for (let x = 1; x < WORLD_X - 1; x++) {
      for (let y = 1; y <= 3; y++) {
        // En el centro (x = 11, 12) colocamos la Gran Puerta de la Mazmorra
        if (x === 11 || x === 12) {
          if (y === 1 || y === 2) {
            this.set(x, y, 12, BLOCK_TYPES.DOOR);
          } else {
            this.set(x, y, 12, BLOCK_TYPES.WALL); // Dintel superior de la puerta
          }
        } else {
          this.set(x, y, 12, BLOCK_TYPES.WALL);
        }
      }
    }

    // 4. Columnas arquitectónicas en Área 1 (Vestíbulo)
    this._buildPillar(6, 6);
    this._buildPillar(17, 6);

    // 5. Columnas arquitectónicas y pedestal en Área 2 (Cripta)
    this._buildPillar(6, 18);
    this._buildPillar(17, 18);
    this.set(12, 1, 18, BLOCK_TYPES.PEDESTAL);
  }

  _buildPillar(x, z) {
    this.set(x, 1, z, BLOCK_TYPES.PILLAR);
    this.set(x, 2, z, BLOCK_TYPES.PILLAR);
    this.set(x, 3, z, BLOCK_TYPES.PILLAR);
  }
}
