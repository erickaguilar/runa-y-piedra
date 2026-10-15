import { WORLD_CONFIG, BLOCK_TYPES, BLOCK_FLOOR_STONE, BLOCK_FLOOR_WORN, BLOCK_FLOOR_MOSS } from '../config/constants.js';
import { LevelLoader, LevelRegistry, ChapterRegistry } from '../levels/index.js';

export const WORLD_X = WORLD_CONFIG.SIZE_X;
export const WORLD_Y = WORLD_CONFIG.SIZE_Y;
export const WORLD_Z = WORLD_CONFIG.SIZE_Z;
// Rango vertical ampliado: [MIN_Y, SIZE_Y). La capa y=-1 aloja la fosa de lava.
export const WORLD_MIN_Y = WORLD_CONFIG.MIN_Y ?? 0;
export const WORLD_Y_SIZE = WORLD_Y - WORLD_MIN_Y;

export { BLOCK_FLOOR_STONE, BLOCK_FLOOR_WORN, BLOCK_FLOOR_MOSS };

export class World {
  constructor(levelData = null) {
    this.minY = WORLD_MIN_Y;
    this.sizeY = WORLD_Y_SIZE;
    this.sizeX = WORLD_X;
    this.sizeZ = WORLD_Z;
    this.blocks = new Uint8Array(WORLD_X * this.sizeY * WORLD_Z);
    this.isDoor1Open = false;
    this.isDoor2Open = false;
    this.doors = [];
    this.checkpoints = [];
    this.objectives = [];
    this.monoliths = [];
    this.torches = [];
    this.chests = [];
    this.heroShowcases = [];
    this.propShowcases = [];
    this.pressurePlates = [];
    this.waterStreams = [];
    // Escalinata de descenso: [{x1,x2,z1,z2,triggerY,open}] derivada del altar (LevelLoader)
    this.stairwells = [];
    this.stairsOpen = false;
    this.spawnPoint = { x: WORLD_CONFIG.SPAWN_X, y: 1.2, z: WORLD_CONFIG.SPAWN_Z };
    this.levelRegistry = new LevelRegistry();
    this.chapterRegistry = new ChapterRegistry();

    const initialLevel = levelData || this.levelRegistry.getCurrentLevel();
    this.loadLevel(initialLevel);
  }

  idx(x, y, z) {
    const sx = this.sizeX || WORLD_X;
    const sy = this.sizeY || WORLD_Y_SIZE;
    return x + (y - this.minY) * sx + z * sx * sy;
  }

  inBounds(x, y, z) {
    const maxX = this.sizeX || WORLD_X;
    const maxZ = this.sizeZ || WORLD_Z;
    const maxY = (this.minY ?? WORLD_MIN_Y) + (this.sizeY || WORLD_Y_SIZE);
    return x >= 0 && x < maxX && y >= this.minY && y < maxY && z >= 0 && z < maxZ;
  }

  isBorder(x, z) {
    const maxX = this.sizeX || WORLD_X;
    const maxZ = this.sizeZ || WORLD_Z;
    return x === 0 || x === maxX - 1 || z === 0 || z === maxZ - 1;
  }

  isDoorCoord(x, y, z) {
    if (Array.isArray(this.doors) && this.doors.length > 0) {
      return this.doors.some(d => d.coords?.some(c => c.x === x && c.y === y && c.z === z));
    }
    return (x === 11 || x === 12) && (y === 1 || y === 2) && (z === 11 || z === 24);
  }

  get(x, y, z) {
    if (!this.inBounds(x, y, z)) return BLOCK_TYPES.AIR;
    const val = this.blocks[this.idx(x, y, z)];
    return val !== undefined ? val : BLOCK_TYPES.AIR;
  }

  set(x, y, z, v) {
    if (!this.inBounds(x, y, z)) return false;
    const i = this.idx(x, y, z);
    if (i >= this.blocks.length) return false;
    this.blocks[i] = v;
    return true;
  }

  loadLevel(levelData) {
    if (levelData?.id) {
      if (this.levelRegistry) {
        this.levelRegistry.setCurrentLevel(levelData.id);
      }
      if (this.chapterRegistry) {
        const ch = this.chapterRegistry.getChapterForLevel(levelData.id);
        if (ch) this.chapterRegistry.setCurrentChapter(ch.id);
      }
    }
    return LevelLoader.applyLevelToWorld(this, levelData);
  }

  setFromArray(arr) {
    if (this.blocks.length !== arr.length) {
      this.blocks = new Uint8Array(arr.length);
    }
    this.blocks.set(arr);
    const d1 = this.doors?.find(d => d.id === 1);
    const d2 = this.doors?.find(d => d.id === 2);
    if (d1?.coords?.length) {
      this.isDoor1Open = (this.get(d1.coords[0].x, d1.coords[0].y, d1.coords[0].z) === BLOCK_TYPES.AIR);
    } else {
      this.isDoor1Open = (this.get(11, 1, 11) === BLOCK_TYPES.AIR);
    }
    if (d2?.coords?.length) {
      this.isDoor2Open = (this.get(d2.coords[0].x, d2.coords[0].y, d2.coords[0].z) === BLOCK_TYPES.AIR);
    } else {
      this.isDoor2Open = (this.get(11, 1, 24) === BLOCK_TYPES.AIR);
    }
  }

  openDoor(doorId = 1) {
    const door = this.doors?.find(d => d.id === doorId);
    if (door) door.isOpen = true;
    if (door && Array.isArray(door.coords)) {
      if (doorId === 1) this.isDoor1Open = true;
      if (doorId === 2) this.isDoor2Open = true;
      for (const c of door.coords) {
        this.set(c.x, c.y, c.z, BLOCK_TYPES.AIR);
      }
    } else {
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
  }

  closeDoor(doorId = 1) {
    const door = this.doors?.find(d => d.id === doorId);
    if (door) door.isOpen = false;
    if (door && Array.isArray(door.coords)) {
      if (doorId === 1) this.isDoor1Open = false;
      if (doorId === 2) this.isDoor2Open = false;
      for (const c of door.coords) {
        this.set(c.x, c.y, c.z, BLOCK_TYPES.DOOR);
      }
    } else {
      if (doorId === 1) {
        this.isDoor1Open = false;
        this.set(11, 1, 11, BLOCK_TYPES.DOOR);
        this.set(11, 2, 11, BLOCK_TYPES.DOOR);
        this.set(12, 1, 11, BLOCK_TYPES.DOOR);
        this.set(12, 2, 11, BLOCK_TYPES.DOOR);
      } else if (doorId === 2) {
        this.isDoor2Open = false;
        this.set(11, 1, 24, BLOCK_TYPES.DOOR);
        this.set(11, 2, 24, BLOCK_TYPES.DOOR);
        this.set(12, 1, 24, BLOCK_TYPES.DOOR);
        this.set(12, 2, 24, BLOCK_TYPES.DOOR);
      }
    }
  }

  isDoorOpenId(doorId = 1) {
    const door = this.doors?.find(d => d.id === doorId);
    if (door && door.isOpen !== undefined) return !!door.isOpen;
    if (doorId === 1) return !!this.isDoor1Open;
    if (doorId === 2) return !!this.isDoor2Open;
    if (door && Array.isArray(door.coords) && door.coords.length > 0) {
      const c = door.coords[0];
      return this.get(c.x, c.y, c.z) === BLOCK_TYPES.AIR;
    }
    return false;
  }

  get isDoorOpen() {
    return this.isDoor1Open;
  }
}

