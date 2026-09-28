import { BLOCK_TYPES, WORLD_CONFIG } from '../config/constants.js';

export class LevelLoader {
  /**
   * Carga y construye un nivel en una instancia de World.
   * @param {import('../core/World.js').World} world
   * @param {Object} levelData
   */
  static applyLevelToWorld(world, levelData) {
    if (!world || !levelData) return world;

    const sizeX = levelData.dimensions?.sizeX || WORLD_CONFIG.SIZE_X;
    const sizeY = levelData.dimensions?.sizeY || WORLD_CONFIG.SIZE_Y;
    const sizeZ = levelData.dimensions?.sizeZ || WORLD_CONFIG.SIZE_Z;

    // 1. Limpiar todos los bloques
    world.blocks.fill(BLOCK_TYPES.AIR);
    world.isDoor1Open = false;
    world.isDoor2Open = false;

    // 2. Asociar metadata y configuraciones de nivel
    world.currentLevel = levelData;
    world.doors = levelData.doors || [];
    world.checkpoints = levelData.checkpoints || [];
    world.objectives = levelData.objectives || [];
    world.spawnPoint = levelData.spawn || { x: WORLD_CONFIG.SPAWN_X, y: 1.2, z: WORLD_CONFIG.SPAWN_Z };

    // 3. Procesar regiones declarativas
    if (Array.isArray(levelData.regions)) {
      for (const region of levelData.regions) {
        this._buildRegion(world, region, sizeX, sizeY, sizeZ);
      }
    }

    // 4. Procesar bloques individuales opcionales
    if (Array.isArray(levelData.blocks)) {
      for (const b of levelData.blocks) {
        const type = typeof b.type === 'string' ? (BLOCK_TYPES[b.type] ?? 1) : b.type;
        world.set(b.x, b.y, b.z, type);
      }
    }

    return world;
  }

  static _buildRegion(world, region, sizeX, sizeY, sizeZ) {
    switch (region.type) {
      case 'perimeter': {
        const height = region.height || 3;
        const blockType = BLOCK_TYPES[region.block] ?? BLOCK_TYPES.WALL;
        for (let x = 0; x < sizeX; x++) {
          for (let z = 0; z < sizeZ; z++) {
            if (x === 0 || x === sizeX - 1 || z === 0 || z === sizeZ - 1) {
              for (let y = 0; y <= height; y++) {
                world.set(x, y, z, blockType);
              }
            }
          }
        }
        break;
      }

      case 'fill': {
        const [x1, y1, z1] = region.from;
        const [x2, y2, z2] = region.to;
        const blockType = BLOCK_TYPES[region.block] ?? BLOCK_TYPES.STONE_FLOOR;
        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
        const minZ = Math.min(z1, z2), maxZ = Math.max(z1, z2);

        for (let x = minX; x <= maxX; x++) {
          for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
              world.set(x, y, z, blockType);
            }
          }
        }
        break;
      }

      case 'divider': {
        const z = region.z;
        const height = region.height || 3;
        const blockType = BLOCK_TYPES[region.block] ?? BLOCK_TYPES.WALL;
        const doorOpening = region.doorOpening || [11, 12];

        for (let x = 1; x < sizeX - 1; x++) {
          // Suelo sólido firme bajo el muro divisor y bajo el umbral de la puerta
          world.set(x, 0, z, BLOCK_TYPES.STONE_FLOOR);

          for (let y = 1; y <= height; y++) {
            if (doorOpening.includes(x)) {
              if (y === 1 || y === 2) {
                world.set(x, y, z, BLOCK_TYPES.DOOR);
              } else {
                world.set(x, y, z, blockType); // Dintel superior
              }
            } else {
              world.set(x, y, z, blockType);
            }
          }
        }
        break;
      }

      case 'pillar': {
        const x = region.x;
        const z = region.z;
        const height = region.height || 3;
        const blockType = BLOCK_TYPES[region.block] ?? BLOCK_TYPES.PILLAR;
        for (let y = 1; y <= height; y++) {
          world.set(x, y, z, blockType);
        }
        break;
      }

      case 'block': {
        const [x, y, z] = region.pos;
        const blockType = BLOCK_TYPES[region.block] ?? 1;
        world.set(x, y, z, blockType);
        break;
      }

      default:
        console.warn(`[LevelLoader] Tipo de región desconocido: ${region.type}`);
    }
  }

  /**
   * Exporta un nivel a formato de texto JSON.
   */
  static exportToJSON(levelData) {
    return JSON.stringify(levelData, null, 2);
  }

  /**
   * Importa y valida un nivel desde un string JSON.
   */
  static importFromJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.id || !data.name || !Array.isArray(data.regions)) {
        throw new Error('Estructura de nivel inválida (faltan campos obligatorios id, name o regions)');
      }
      return data;
    } catch (e) {
      console.error('[LevelLoader] Error al importar nivel JSON:', e);
      return null;
    }
  }
}
