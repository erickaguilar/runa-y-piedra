export const WORLD_CONFIG = {
  SIZE_X: 24,
  SIZE_Y: 16,
  SIZE_Z: 36,
  SPAWN_X: 12.0,
  SPAWN_Y: 2.1,
  SPAWN_Z: 4.5,
  VOID_RESCUE_Y: -4.5,
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
  JUMP_PAD: 6,
  LAVA: 7,
};

export const BLOCK_COLORS = {
  1: 0x475569, // Suelo de losas de piedra (slate-600 más claro y visible)
  2: 0x334155, // Muro de mazmorra de piedra labrada (slate-700)
  3: 0xd97706, // Puerta de madera y hierro reforzado
  4: 0x64748b, // Columnas y pilares de sillar (slate-500)
  5: 0xfbbf24, // Pedestal/Luz rúnica dorada
  6: 0x0ea5e9, // Plataforma de Salto (celeste rúnico)
  7: 0x991b1b, // Fondo del Abismo / Lava
};

import heroesData from '../heroes/data/heroes.json';

export const PLAYER_HEROES = heroesData.heroes;
export const PLAYER_PALETTE = heroesData.heroes.map(h => h.hex);

