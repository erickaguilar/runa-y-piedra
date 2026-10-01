// src/render/textures/floors.js

/**
 * Tile 5: floorTiles — Losas grandes 2x2 limpias (base, ~70% del suelo).
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorClean(S = 128) {
  return `
    <defs>
      <pattern id="floorA" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
        <rect width="64" height="64" fill="#22262d"/>
        <rect x="1" y="1" width="62" height="62" fill="#6a7078"/>
        <!-- bisel superior + lateral izquierdo (luz cenital) -->
        <path d="M1 1 L63 1 L63 3 L3 3 L3 63 L1 63 Z" fill="#9ca3af" opacity="0.4"/>
        <!-- bisel inferior + lateral derecho (sombra suave sin corte negro agresivo) -->
        <path d="M1 63 L63 63 L63 1 L61 1 L61 61 L1 61 Z" fill="#181b20" opacity="0.35"/>
      </pattern>
    </defs>
    <rect width="${S}" height="${S}" fill="url(#floorA)"/>
    <!-- Variación tonal sutil entre las 4 losas grandes -->
    <rect x="2" y="2" width="60" height="60" fill="#717780" opacity="0.25"/>
    <rect x="66" y="66" width="60" height="60" fill="#646a72" opacity="0.25"/>
    <rect x="66" y="2" width="60" height="60" fill="#6f757e" opacity="0.15"/>
    <!-- Textura de cantería y grano de piedra natural muy suave -->
    <circle cx="28" cy="36" r="2" fill="#4b5563" opacity="0.25"/>
    <circle cx="98" cy="42" r="2.5" fill="#9ca3af" opacity="0.2"/>
    <circle cx="44" cy="94" r="2" fill="#9ca3af" opacity="0.2"/>
    <circle cx="106" cy="100" r="2" fill="#4b5563" opacity="0.25"/>
  `;
}

/**
 * Tile 6: floorTilesWorn — Losas grandes 2x2 con grietas (~20%).
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorWorn(S = 128) {
  return `
    <defs>
      <pattern id="floorB" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
        <rect width="64" height="64" fill="#22262d"/>
        <rect x="1" y="1" width="62" height="62" fill="#6a7078"/>
        <path d="M1 1 L63 1 L63 3 L3 3 L3 63 L1 63 Z" fill="#9ca3af" opacity="0.4"/>
        <path d="M1 63 L63 63 L63 1 L61 1 L61 61 L1 61 Z" fill="#181b20" opacity="0.35"/>
      </pattern>
    </defs>
    <rect width="${S}" height="${S}" fill="url(#floorB)"/>
    <rect x="2" y="2" width="60" height="60" fill="#717780" opacity="0.2"/>
    <!-- Grietas orgánicas que cruzan las losas grandes con bisel de relieve -->
    <g stroke="#181b20" stroke-width="1.5" fill="none" opacity="0.8">
      <path d="M24 10 L30 26 L22 42 L34 54"/>
      <path d="M84 20 L96 34 L90 50 L104 62"/>
      <path d="M40 76 L52 88 L46 106 L56 120"/>
      <path d="M100 80 L112 96 L108 114"/>
    </g>
    <g stroke="#9ca3af" stroke-width="0.7" fill="none" opacity="0.4">
      <path d="M23 9 L29 25 L21 41 L33 53"/>
      <path d="M83 19 L95 33 L89 49 L103 61"/>
      <path d="M39 75 L51 87 L45 105 L55 119"/>
      <path d="M99 79 L111 95 L107 113"/>
    </g>
    <!-- Desconchones y lascas en juntas -->
    <g fill="#181b20" opacity="0.55">
      <polygon points="62,28 64,28 64,36 60,34"/>
      <polygon points="92,62 100,64 94,66"/>
      <polygon points="64,96 66,104 62,102"/>
    </g>
  `;
}

/**
 * Tile 7: floorTilesMossy — Losas grandes 2x2 con musgo (~10%, para zonas húmedas).
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorMossy(S = 128) {
  return `
    <defs>
      <pattern id="floorC" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
        <rect width="64" height="64" fill="#22262d"/>
        <rect x="1" y="1" width="62" height="62" fill="#6a7078"/>
        <path d="M1 1 L63 1 L63 3 L3 3 L3 63 L1 63 Z" fill="#9ca3af" opacity="0.4"/>
        <path d="M1 63 L63 63 L63 1 L61 1 L61 61 L1 61 Z" fill="#181b20" opacity="0.35"/>
      </pattern>
    </defs>
    <rect width="${S}" height="${S}" fill="url(#floorC)"/>
    <!-- Musgo húmedo en las juntas perimetrales y en la cruz central -->
    <g fill="#3d5a2a" opacity="0.75">
      <rect x="0" y="0" width="${S}" height="2.5"/>
      <rect x="0" y="62.5" width="${S}" height="3"/>
      <rect x="0" y="0" width="2.5" height="${S}"/>
      <rect x="62.5" y="0" width="3" height="${S}"/>
    </g>
    <!-- Matas de musgo orgánico en la cruz central y bordes -->
    <g fill="#4a6e30">
      <ellipse cx="64" cy="64" rx="14" ry="11"/>
      <ellipse cx="64" cy="38" rx="8"  ry="14"/>
      <ellipse cx="64" cy="92" rx="9"  ry="13"/>
      <ellipse cx="36" cy="64" rx="13" ry="8"/>
      <ellipse cx="94" cy="64" rx="12" ry="8"/>
      <ellipse cx="14" cy="20" rx="9"  ry="6"/>
      <ellipse cx="112" cy="108" rx="10" ry="7"/>
    </g>
    <!-- Brillos volumétricos claros del musgo -->
    <g fill="#5d8a3d" opacity="0.85">
      <ellipse cx="64" cy="64" rx="7"   ry="5"/>
      <ellipse cx="64" cy="38" rx="4"   ry="7"/>
      <ellipse cx="64" cy="92" rx="4.5" ry="6.5"/>
      <ellipse cx="36" cy="64" rx="6.5" ry="4"/>
      <ellipse cx="94" cy="64" rx="6"   ry="4"/>
      <ellipse cx="14" cy="20" rx="4.5" ry="3"/>
      <ellipse cx="112" cy="108" rx="5"  ry="3.5"/>
    </g>
  `;
}

/**
 * Tile 8: floorTilesMossyWorn — Losas grandes 2x2 combinando grietas y musgo.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorMossyWorn(S = 128) {
  return `
    <defs>
      <pattern id="floorD" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
        <rect width="64" height="64" fill="#22262d"/>
        <rect x="1" y="1" width="62" height="62" fill="#6a7078"/>
        <path d="M1 1 L63 1 L63 3 L3 3 L3 63 L1 63 Z" fill="#9ca3af" opacity="0.4"/>
        <path d="M1 63 L63 63 L63 1 L61 1 L61 61 L1 61 Z" fill="#181b20" opacity="0.35"/>
      </pattern>
    </defs>
    <rect width="${S}" height="${S}" fill="url(#floorD)"/>
    <!-- Grietas secundarias -->
    <g stroke="#181b20" stroke-width="1.5" fill="none" opacity="0.8">
      <path d="M64 40 L54 52 L64 64 L50 78"/>
      <path d="M84 94 L98 106 L92 118"/>
    </g>
    <g stroke="#9ca3af" stroke-width="0.7" fill="none" opacity="0.4">
      <path d="M63 39 L53 51 L63 63 L49 77"/>
      <path d="M83 93 L97 105 L91 117"/>
    </g>
    <!-- Musgo en cruz y grieta -->
    <g fill="#4a6e30">
      <ellipse cx="64" cy="64" rx="11" ry="9"/>
      <ellipse cx="32" cy="64" rx="8"  ry="5"/>
      <ellipse cx="64" cy="96" rx="6"  ry="10"/>
    </g>
    <g fill="#5d8a3d" opacity="0.85">
      <ellipse cx="64" cy="64" rx="5.5" ry="4.5"/>
      <ellipse cx="32" cy="64" rx="4"   ry="2.5"/>
      <ellipse cx="64" cy="96" rx="3"   ry="5"/>
    </g>
  `;
}

/**
 * Tile 9: floorTilesSanctuary — Losa grande con rombo ceremonial integrado.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorSanctuary(S = 128) {
  return `
    <defs>
      <pattern id="floorE" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
        <rect width="64" height="64" fill="#22262d"/>
        <rect x="1" y="1" width="62" height="62" fill="#6a7078"/>
        <path d="M1 1 L63 1 L63 3 L3 3 L3 63 L1 63 Z" fill="#9ca3af" opacity="0.4"/>
        <path d="M1 63 L63 63 L63 1 L61 1 L61 61 L1 61 Z" fill="#181b20" opacity="0.35"/>
      </pattern>
    </defs>
    <rect width="${S}" height="${S}" fill="url(#floorE)"/>
    <!-- Rombo ceremonial que abarca el centro de las 4 losas con bisel pulido -->
    <polygon points="64,16 112,64 64,112 16,64" fill="#525860" stroke="#181b20" stroke-width="2.5"/>
    <polygon points="64,18 110,64 64,110 18,64" fill="none" stroke="#9ca3af" stroke-width="1.2" opacity="0.6"/>
    <polygon points="64,32 96,64 64,96 32,64" fill="#6a7078" stroke="#181b20" stroke-width="2"/>
    <circle cx="64" cy="64" r="8" fill="#181b20"/>
    <circle cx="64" cy="64" r="3.5" fill="#9ca3af"/>
  `;
}

export const floorSprites = {
  floorClean,
  floorWorn,
  floorMossy,
  floorMossyWorn,
  floorSanctuary
};
