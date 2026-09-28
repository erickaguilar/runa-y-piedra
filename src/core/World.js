import { WORLD_CONFIG, BLOCK_TYPES } from '../config/constants.js';

export const WORLD_X = WORLD_CONFIG.SIZE_X;
export const WORLD_Y = WORLD_CONFIG.SIZE_Y;
export const WORLD_Z = WORLD_CONFIG.SIZE_Z;

export class World {
  constructor() {
    this.blocks = new Uint8Array(WORLD_X * WORLD_Y * WORLD_Z);
    this.isDoor1Open = false;
    this.isDoor2Open = false;
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
    return (x === 11 || x === 12) && (y === 1 || y === 2) && (z === 11 || z === 24);
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
    this.isDoor1Open = (this.get(11, 1, 11) === BLOCK_TYPES.AIR);
    this.isDoor2Open = (this.get(11, 1, 24) === BLOCK_TYPES.AIR);
  }

  openDoor(doorId = 1) {
    if (doorId === 1) {
      this.isDoor1Open = true;
      this.set(11, 1, 11, BLOCK_TYPES.AIR);
      this.set(11, 2, 11, BLOCK_TYPES.AIR);
      this.set(12, 1, 11, BLOCK_TYPES.AIR);
      this.set(12, 2, 11, BLOCK_TYPES.AIR);
    } else if (doorId === 2) {
      this.isDoor2Open = true;
      this.set(11, 1, 24, BLOCK_TYPES.AIR);
      this.set(11, 2, 24, BLOCK_TYPES.AIR);
      this.set(12, 1, 24, BLOCK_TYPES.AIR);
      this.set(12, 2, 24, BLOCK_TYPES.AIR);
    }
  }

  openDungeonDoor() {
    this.openDoor(1);
  }

  get isDoorOpen() {
    return this.isDoor1Open;
  }

  _generateDungeon() {
    // 1. Suelos base (y = 0)
    for (let x = 0; x < WORLD_X; x++) {
      for (let z = 0; z < WORLD_Z; z++) {
        if (z >= 12 && z <= 23) {
          // Sala 2: Fondo del abismo (lava/foso)
          this.set(x, 0, z, BLOCK_TYPES.LAVA);
        } else {
          // Salas 1 y 3: Losas de piedra
          this.set(x, 0, z, BLOCK_TYPES.STONE_FLOOR);
        }
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

    // 3. Muro divisor 1 en z = 11 (Separa Sala 1 y Sala 2)
    for (let x = 1; x < WORLD_X - 1; x++) {
      for (let y = 1; y <= 3; y++) {
        if (x === 11 || x === 12) {
          if (y === 1 || y === 2) {
            this.set(x, y, 11, BLOCK_TYPES.DOOR);
          } else {
            this.set(x, y, 11, BLOCK_TYPES.WALL); // Dintel superior
          }
        } else {
          this.set(x, y, 11, BLOCK_TYPES.WALL);
        }
      }
    }

    // 4. Muro divisor 2 en z = 24 (Separa Sala 2 y Sala 3)
    for (let x = 1; x < WORLD_X - 1; x++) {
      for (let y = 1; y <= 3; y++) {
        if (x === 11 || x === 12) {
          if (y === 1 || y === 2) {
            this.set(x, y, 24, BLOCK_TYPES.DOOR);
          } else {
            this.set(x, y, 24, BLOCK_TYPES.WALL); // Dintel superior
          }
        } else {
          this.set(x, y, 24, BLOCK_TYPES.WALL);
        }
      }
    }

    // 5. Sala 1 (Vestíbulo de entrada): Columnas arquitectónicas
    this._buildPillar(6, 5);
    this._buildPillar(17, 5);

    // 6. Sala 2: ¡ZONA DE SALTO OBLIGATORIO (PARKOUR SOBRE EL ABISMO)!
    // Plataforma de salida tras la Puerta 1
    for (let x = 10; x <= 13; x++) {
      this.set(x, 1, 12, BLOCK_TYPES.STONE_FLOOR);
    }

    // Plataforma de Salto 1 (z = 14, tras hueco z = 13)
    this.set(11, 1, 14, BLOCK_TYPES.JUMP_PAD);
    this.set(12, 1, 14, BLOCK_TYPES.JUMP_PAD);

    // Plataforma de Salto 2 (z = 17, tras hueco doble z = 15, 16)
    for (let x = 10; x <= 13; x++) {
      this.set(x, 1, 17, BLOCK_TYPES.JUMP_PAD);
    }

    // Plataforma de Salto 3 ELEVADA a y = 2 (z = 19, tras hueco z = 18 - ¡Requiere SALTAR hacia arriba!)
    this.set(11, 1, 19, BLOCK_TYPES.PILLAR); // Pilar de soporte
    this.set(12, 1, 19, BLOCK_TYPES.PILLAR);
    this.set(11, 2, 19, BLOCK_TYPES.JUMP_PAD); // Plataforma superior
    this.set(12, 2, 19, BLOCK_TYPES.JUMP_PAD);

    // Plataforma de Salto 4 ELEVADA a y = 2 (z = 21, tras hueco z = 20)
    this.set(11, 1, 21, BLOCK_TYPES.PILLAR); // Pilar de soporte
    this.set(12, 1, 21, BLOCK_TYPES.PILLAR);
    this.set(11, 2, 21, BLOCK_TYPES.JUMP_PAD); // Plataforma superior
    this.set(12, 2, 21, BLOCK_TYPES.JUMP_PAD);

    // Plataforma de llegada ante la Puerta 2 (z = 23, tras hueco z = 22)
    for (let x = 10; x <= 13; x++) {
      this.set(x, 1, 23, BLOCK_TYPES.STONE_FLOOR);
    }

    // Escalera lateral de retorno / rescate si caen al fondo del abismo
    this.set(21, 1, 13, BLOCK_TYPES.STONE_FLOOR);
    this.set(21, 1, 12, BLOCK_TYPES.STONE_FLOOR);
    this.set(20, 1, 12, BLOCK_TYPES.STONE_FLOOR);

    // 7. Sala 3 (Santuario Interior): Columnas y Pedestal Ancestral
    this._buildPillar(6, 29);
    this._buildPillar(17, 29);
    this.set(12, 1, 30, BLOCK_TYPES.PEDESTAL);
  }

  _buildPillar(x, z) {
    this.set(x, 1, z, BLOCK_TYPES.PILLAR);
    this.set(x, 2, z, BLOCK_TYPES.PILLAR);
    this.set(x, 3, z, BLOCK_TYPES.PILLAR);
  }
}
