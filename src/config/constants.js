export const WORLD_CONFIG = {
  SIZE_X: 24,
  SIZE_Y: 16,
  SIZE_Z: 24,
  SPAWN_X: 12.5,
  SPAWN_Y: 4.1,
  SPAWN_Z: 12.5,
  VOID_RESCUE_Y: -5.0,
};

export const PHYSICS_CONFIG = {
  SPEED: 5.2,
  JUMP_VELOCITY: 7.2,
  GRAVITY: -20,
  TERMINAL_VELOCITY: -40,
  PLAYER_W: 0.6,
  PLAYER_H: 1.8,
  TICK_HZ: 30,
};

export const NET_CONFIG = {
  INPUT_HZ: 30,
  SNAPSHOT_HZ: 20,
  ROOM_PREFIX: 'VOXELSALA-',
};

export const BLOCK_TYPES = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WALL: 4,
};

export const BLOCK_COLORS = {
  1: 0x4caf50, // grass
  2: 0x8d6e63, // dirt
  3: 0x9e9e9e, // stone
  4: 0x475569, // wall (slate)
};

export const PLAYER_PALETTE = [
  0xff5252, // rojo coral
  0x4fc3f7, // azul cielo
  0xffb74d, // naranja ámbar
  0xab47bc, // púrpura
  0x66bb6a, // verde esmeralda
  0xfff176, // amarillo brillante
];
