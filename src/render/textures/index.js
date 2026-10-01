// src/render/textures/index.js
export * from './walls.js';
export * from './floors.js';
export * from './pillars.js';
export * from './specials.js';
export * from './lava.js';
export * from './ceilings.js';

import { wallSprites } from './walls.js';
import { floorSprites } from './floors.js';
import { pillarSprites } from './pillars.js';
import { specialSprites } from './specials.js';
import { lavaSprites } from './lava.js';
import { ceilingSprites } from './ceilings.js';

/**
 * Ensambla el arreglo de fragmentos SVG para las casillas del Texture Atlas (matriz 4x8, 32 casillas posibles).
 * @param {number} S - Dimensión de cada celda en píxeles (default: 128).
 * @returns {string[]} Arreglo de fragmentos SVG indexados por tileIndex.
 */
export function createTilesSvgArray(S = 128) {
  const tilesSvg = [];

  // ==================== GRUPO 1: MUROS (Tiles 0 a 4) ====================
  tilesSvg[0] = wallSprites.wallRegular(S);
  tilesSvg[1] = wallSprites.wallCracked(S);
  tilesSvg[2] = wallSprites.wallMasonry(S);
  tilesSvg[3] = wallSprites.wallMossy(S);
  tilesSvg[4] = wallSprites.wallRunic(S);

  // ==================== GRUPO 2: PISO (Tiles 5 a 9) ====================
  tilesSvg[5] = floorSprites.floorClean(S);
  tilesSvg[6] = floorSprites.floorWorn(S);
  tilesSvg[7] = floorSprites.floorMossy(S);
  tilesSvg[8] = floorSprites.floorMossyWorn(S);
  tilesSvg[9] = floorSprites.floorSanctuary(S);

  // ==================== GRUPO 3: PILARES & ESPECIALES (Tiles 10 a 15) ====================
  tilesSvg[10] = pillarSprites.pillarMonolith(S);
  tilesSvg[11] = specialSprites.respawnPad(S);
  tilesSvg[12] = pillarSprites.pillarFluted(S);
  tilesSvg[13] = lavaSprites.lavaActive(S);
  tilesSvg[14] = specialSprites.jumpPad(S);
  tilesSvg[15] = specialSprites.pedestalOctagram(S);

  // ==================== GRUPO 4: LAVA EXPANDIDA (Tiles 16 a 19) ====================
  tilesSvg[16] = lavaSprites.lavaFissures(S);
  tilesSvg[17] = lavaSprites.lavaGeysers(S);
  tilesSvg[18] = lavaSprites.lavaRiver(S);
  tilesSvg[19] = lavaSprites.lavaCaldera(S);

  // ==================== GRUPO 5: PILARES EXPANDIDOS (Tiles 20 a 22) ====================
  tilesSvg[20] = pillarSprites.mossy ? pillarSprites.mossy(S) : pillarSprites.pillarMossy(S);
  tilesSvg[21] = pillarSprites.cracked ? pillarSprites.cracked(S) : pillarSprites.pillarCracked(S);
  tilesSvg[22] = pillarSprites.dark ? pillarSprites.dark(S) : pillarSprites.pillarDark(S);

  // ==================== GRUPO 6: TECHOS / BÓVEDAS (Tiles 23 a 27) ====================
  tilesSvg[23] = ceilingSprites.ceilingVault(S);
  tilesSvg[24] = ceilingSprites.ceilingCoffered(S);
  tilesSvg[25] = ceilingSprites.ceilingCracked(S);
  tilesSvg[26] = ceilingSprites.ceilingMossy(S);
  tilesSvg[27] = ceilingSprites.ceilingRunic(S);

  return tilesSvg;
}
