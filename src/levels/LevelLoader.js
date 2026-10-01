import { BLOCK_TYPES, WORLD_CONFIG } from '../config/constants.js';

export function floorVariant(x, z) {
  // Hash determinista de 32 bits, idéntico y reproducible en host y clientes sin tráfico de red
  const h = ((x * 374761393) ^ (z * 668265263)) >>> 0;
  const r = h % 100;
  if (r < 70) return BLOCK_TYPES.FLOOR_STONE; // 8: adoquín limpio (~70%)
  if (r < 90) return BLOCK_TYPES.FLOOR_WORN;  // 9: con grietas (~20%)
  return BLOCK_TYPES.FLOOR_MOSS;              // 10: con musgo (~10%)
}

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
    world.torches = levelData.torches || [];
    world.chests = (levelData.chests || []).map(c => ({ ...c, isOpen: false }));
    // Escalinata de descenso:
    // - Si el nivel define "stairs" explícito se usa (openFromStart para fosa abierta).
    // - "stairs": null la desactiva aunque haya altar (nivel final).
    // - Sin campo "stairs", se deriva del altar para compatibilidad.
    if ('stairs' in levelData) {
      const s = levelData.stairs;
      world.stairwells = s
        ? [{ x1: s.x1, x2: s.x2, z1: s.z1, z2: s.z2, triggerY: 0.75, open: !!s.openFromStart }]
        : [];
    } else {
      world.stairwells = (levelData.objectives || [])
        .filter(o => (o.type || 'pedestal') === 'pedestal')
        .map(o => {
          const ox = Math.floor(o.x ?? 12);
          const oz = Math.floor(o.z ?? 30);
          return { x1: ox - 1, x2: ox, z1: oz + 1, z2: oz + 3, triggerY: 0.75, open: false };
        });
    }
    world.stairsOpen = world.stairwells.some(w => w.open);
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

    // 5. Instalar losa de respawn rúnica única (RESPAWN_PAD) en la entrada de la mazmorra
    this._placeRespawnPads(world, levelData);

    return world;
  }

  /**
   * Coloca una losa rúnica de aparición (2x2) centrada en las coordenadas de reaparición.
   */
  static _placeRespawnPad(world, pt) {
    if (!pt) return;
    const cx = pt.x ?? WORLD_CONFIG.SPAWN_X;
    const cz = pt.z ?? WORLD_CONFIG.SPAWN_Z;
    const cy = Math.max(0, Math.floor((pt.y ?? 1.2) - 0.5));
    const x1 = Math.round(cx - 1);
    const x2 = Math.round(cx);
    const z1 = Math.round(cz - 1);
    const z2 = Math.round(cz);
    for (let x = x1; x <= x2; x++) {
      for (let z = z1; z <= z2; z++) {
        if (world.inBounds(x, cy, z)) {
          world.set(x, cy, z, BLOCK_TYPES.RESPAWN_PAD);
        }
      }
    }
  }

  static _placeRespawnPads(world, levelData) {
    // Spawn único principal por mazmorra (ubicado en la entrada)
    if (world.spawnPoint) {
      this._placeRespawnPad(world, world.spawnPoint);
    }
  }

  static _buildRegion(world, region, sizeX, sizeY, sizeZ) {
    switch (region.type) {
      case 'perimeter': {
        const height = region.height || 3;
        const blockType = BLOCK_TYPES[region.block] ?? BLOCK_TYPES.WALL;
        // Arrancar en minY sella la fosa de lava (y=-1) contra el vacío exterior
        const yStart = world.minY ?? 0;
        for (let x = 0; x < sizeX; x++) {
          for (let z = 0; z < sizeZ; z++) {
            if (x === 0 || x === sizeX - 1 || z === 0 || z === sizeZ - 1) {
              for (let y = yStart; y <= height; y++) {
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
        const isFloorBlock = region.block === 'STONE_FLOOR';
        const blockType = BLOCK_TYPES[region.block] ?? BLOCK_TYPES.STONE_FLOOR;
        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
        const minZ = Math.min(z1, z2), maxZ = Math.max(z1, z2);

        for (let x = minX; x <= maxX; x++) {
          for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
              let finalBlock = blockType;
              if (isFloorBlock && y === 0) {
                finalBlock = floorVariant(x, z);
              }
              world.set(x, y, z, finalBlock);
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
          world.set(x, 0, z, floorVariant(x, z));
          // Sellar bajo el umbral (y<0) para que la fosa de lava no muestre huecos
          for (let y = (world.minY ?? 0); y < 0; y++) {
            world.set(x, y, z, blockType);
          }

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

      case 'ceiling': {
        const y = region.y ?? 6;
        const blockType = BLOCK_TYPES[region.block] ?? BLOCK_TYPES.CEILING;
        const fromX = region.fromX ?? 1;
        const toX = region.toX ?? (sizeX - 2);
        const fromZ = region.fromZ ?? 1;
        const toZ = region.toZ ?? (sizeZ - 2);

        for (let x = fromX; x <= toX; x++) {
          for (let z = fromZ; z <= toZ; z++) {
            world.set(x, y, z, blockType);
          }
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
