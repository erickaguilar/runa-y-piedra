export const WORLD_CONFIG = {
  SIZE_X: 24,
  SIZE_Y: 16,
  SIZE_Z: 24,
  SPAWN_X: 12.5,
  SPAWN_Y: 2.1,
  SPAWN_Z: 4.5,
  VOID_RESCUE_Y: -5.0,
};

export const PHYSICS_CONFIG = {
  SPEED: 4.8,
  JUMP_VELOCITY: 6.8,
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
  STONE_FLOOR: 1,
  WALL: 2,
  DOOR: 3,
  PILLAR: 4,
  PEDESTAL: 5,
};

export const BLOCK_COLORS = {
  1: 0x334155, // Suelo de losas de piedra
  2: 0x1e293b, // Muro de mazmorra oscuro
  3: 0xd97706, // Puerta de madera/hierro
  4: 0x475569, // Columnas/Pilares
  5: 0xf59e0b, // Pedestal/Luz
};

export const PLAYER_PALETTE = [
  0x38bdf8, // azul aventurero
  0xf43f5e, // rojo paladín
  0x10b981, // verde explorador
  0xa855f7, // púrpura hechicero
  0xfbbf24, // dorado guardián
];
