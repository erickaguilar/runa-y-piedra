import { WORLD_CONFIG, BLOCK_TYPES } from '../config/constants.js';
import { LevelLoader, LevelRegistry } from '../levels/index.js';

export const WORLD_X = WORLD_CONFIG.SIZE_X;
export const WORLD_Y = WORLD_CONFIG.SIZE_Y;
export const WORLD_Z = WORLD_CONFIG.SIZE_Z;

export class World {
  constructor(levelData = null) {
    this.blocks = new Uint8Array(WORLD_X * WORLD_Y * WORLD_Z);
    this.isDoor1Open = false;
    this.isDoor2Open = false;
    this.doors = [];
    this.checkpoints = [];
    this.objectives = [];
    this.torches = [];
    this.spawnPoint = { x: WORLD_CONFIG.SPAWN_X, y: 1.2, z: WORLD_CONFIG.SPAWN_Z };
    this.levelRegistry = new LevelRegistry();

    const initialLevel = levelData || this.levelRegistry.getCurrentLevel();
    this.loadLevel(initialLevel);
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
    if (Array.isArray(this.doors) && this.doors.length > 0) {
      return this.doors.some(d => d.coords?.some(c => c.x === x && c.y === y && c.z === z));
    }
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

  loadLevel(levelData) {
    return LevelLoader.applyLevelToWorld(this, levelData);
  }

  setFromArray(arr) {
    this.blocks.set(arr);
    this.isDoor1Open = (this.get(11, 1, 11) === BLOCK_TYPES.AIR);
    this.isDoor2Open = (this.get(11, 1, 24) === BLOCK_TYPES.AIR);
  }

  openDoor(doorId = 1) {
    const door = this.doors?.find(d => d.id === doorId);
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

  openDungeonDoor() {
    this.openDoor(1);
  }

  get isDoorOpen() {
    return this.isDoor1Open;
  }
}

