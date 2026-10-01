export const APP_CONFIG = {
  NAME: 'Runa y Piedra',
  VERSION: '1.29.0',
};

export const GAME_CONFIG = {
  MAX_PLAYERS: 5,
};

export const WORLD_CONFIG = {
  SIZE_X: 24,
  SIZE_Y: 16,
  SIZE_Z: 36,
  MIN_Y: -8, // Capas inferiores: lava (y=-1) y pozo de escalinata (hasta y=-8)
  SPAWN_X: 12.0,
  SPAWN_Y: 2.1,
  SPAWN_Z: 2.5,
  VOID_RESCUE_Y: -8.5,
};

export const PHYSICS_CONFIG = {
  SPEED: 4.8,
  // 7.2 base: el héroe más pesado (guardián ×0.96) libra 1.19 m y supera
  // el bloque de 1 m con margen; el resto escala con su multiplicador.
  JUMP_VELOCITY: 7.2,
  GRAVITY: -20,
  TERMINAL_VELOCITY: -40,
  PLAYER_W: 0.6,
  PLAYER_H: 1.8,
  TICK_HZ: 30,
  LAVA_SINK_TICKS: 36, // ~1.2s a 30 ticks/s de animación de hundimiento/caída lenta
  LAVA_SINK_SPEED: -1.0, // Velocidad vertical lenta dentro del magma viscoso
};

export const NET_CONFIG = {
  INPUT_HZ: 30,
  SNAPSHOT_HZ: 20,
  ROOM_PREFIX: 'VOXELSALA-',
  JOIN_TIMEOUT_MS: 12000,
  JOIN_RETRIES: 2,
  MAX_PLAYERS: 5,
  CLOSE_REASON: {
    NORMAL: 0,
    ROOM_FULL: 1,
  },
  // Canales WebRTC: hot (INPUT/SNAPSHOT/PING, unreliable) vs safe (eventos, reliable).
  CHANNEL_SAFE: 'game-safe',
  CHANNEL_HOT: 'game-hot',
  HOT_MSGS: [0x01, 0x02, 0x08, 0x09], // INPUT, SNAPSHOT, PING, PONG
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
  FLOOR_STONE: 8,
  FLOOR_WORN: 9,
  FLOOR_MOSS: 10,
  RESPAWN_PAD: 11,
  CEILING: 12,
};

export const BLOCK_FLOOR_STONE = 8;
export const BLOCK_FLOOR_WORN  = 9;
export const BLOCK_FLOOR_MOSS  = 10;

export const BLOCK_COLORS = {
  1: 0xffffff, // Suelo de adoquín (blanco neutro para respetar los tonos y el musgo verde del SVG)
  2: 0x334155, // Muro de mazmorra de piedra labrada (slate-700)
  3: 0xd97706, // Puerta de madera y hierro reforzado
  4: 0xffffff, // Columnas y pilares monolíticos (blanco neutro para respetar tonos oscuros y desgaste del SVG)
  5: 0xfbbf24, // Pedestal/Luz rúnica dorada
  6: 0xffffff, // Plataforma de Salto JUMP_PAD (blanco neutro para respetar base de sillar y runa ámbar del SVG)
  7: 0xffffff, // Lava volcánica (blanco neutro para respetar naranjas y rojos del SVG)
  8: 0xffffff, // Adoquín limpio
  9: 0xffffff, // Adoquín con grietas
  10: 0xffffff, // Adoquín con musgo
  11: 0xffffff, // Losa de Respawn / Invocación Rúnica (blanco neutro para respetar azul cian radiante y sillar oscuro del SVG)
  12: 0xffffff, // Techo y bóveda de mazmorra (blanco neutro para respetar los tonos y relieves del SVG)
};

import heroesData from '../heroes/data/heroes.json' with { type: 'json' };

export const PLAYER_HEROES = heroesData.heroes;
export const PLAYER_PALETTE = heroesData.heroes.map(h => h.hex);

