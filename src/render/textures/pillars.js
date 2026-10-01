// src/render/textures/pillars.js

/**
 * Tile 10: Columna monolítica continua — fuste oscuro, desgastado y con continuidad vertical absoluta (seamless).
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarMonolith(S = 128) {
  return `
    <!-- Fondo base: Piedra oscura de sillar macizo -->
    <rect width="${S}" height="${S}" fill="#1c2027"/>

    <!-- Sombreado de volumen cilíndrico/prismático continuo (sin cortes horizontales) -->
    <!-- Realce lumínico en el lateral izquierdo -->
    <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
    <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
    <!-- Sombra en el lateral derecho -->
    <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
    <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>

    <!-- 3 Acanaladuras/Estrías verticales profundas continuas de Y=0 a Y=S -->
    <!-- Estría 1 (X = 32) -->
    <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="32"   y1="0" x2="32"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

    <!-- Estría 2 (Central, X = 64) -->
    <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="64"   y1="0" x2="64"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

    <!-- Estría 3 (X = 96) -->
    <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="96"   y1="0" x2="96"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>

    <!-- Desgaste y erosión por los siglos (micro-fisuras verticales en cantería) -->
    <g stroke="#080a0d" stroke-width="1.4" fill="none" opacity="0.75">
      <path d="M 16,14 L 18,28 L 15,44 L 17,58"/>
      <path d="M 48,68 L 51,84 L 47,102 L 50,116"/>
      <path d="M 80,22 L 78,38 L 82,54 L 79,70"/>
      <path d="M 110,50 L 108,66 L 111,82"/>
    </g>
    <g stroke="#454f5d" stroke-width="0.6" fill="none" opacity="0.4">
      <path d="M 17,14 L 19,28 L 16,44 L 18,58"/>
      <path d="M 49,68 L 52,84 L 48,102 L 51,116"/>
      <path d="M 81,22 L 79,38 L 83,54 L 80,70"/>
    </g>

    <!-- Muescas de piedra desconchada y desgaste en aristas -->
    <g fill="#080a0d" opacity="0.7">
      <polygon points="32,36 36,40 32,44"/>
      <polygon points="64,74 60,78 64,82"/>
      <polygon points="96,26 92,30 96,34"/>
      <polygon points="96,90 100,94 96,98"/>
      <polygon points="16,50 18,54 15,56"/>
      <polygon points="80,62 83,66 79,68"/>
    </g>

    <!-- Pátina oscura / hollín vertical acumulado -->
    <g fill="#080a0d" opacity="0.35">
      <ellipse cx="32" cy="64" rx="4" ry="18"/>
      <ellipse cx="64" cy="40" rx="5" ry="22"/>
      <ellipse cx="96" cy="80" rx="4" ry="20"/>
      <ellipse cx="122" cy="64" rx="3" ry="30"/>
    </g>

    <!-- Picado de cantería y textura mineral áspera -->
    <g fill="#454f5d" opacity="0.3">
      <circle cx="12" cy="34" r="1.5"/><circle cx="24" cy="86" r="2"/>
      <circle cx="44" cy="22" r="2"/><circle cx="54" cy="96" r="1.5"/>
      <circle cx="74" cy="48" r="1.8"/><circle cx="86" cy="104" r="2"/>
      <circle cx="104" cy="32" r="1.5"/><circle cx="114" cy="78" r="1.8"/>
    </g>
  `;
}

/**
 * Tile 12: Columna acanalada lisa — fuste de cantería pulido y limpio.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarFluted(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#1c2027"/>
    <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
    <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
    <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
    <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>
    <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="32"   y1="0" x2="32"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>
    <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="64"   y1="0" x2="64"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>
    <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="96"   y1="0" x2="96"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>
  `;
}

/**
 * Tile 20: Columna con musgo — vegetación y líquenes en hendiduras de estrías.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarMossy(S = 128) {
  return `
    <!-- Fondo base: Piedra oscura de sillar macizo (mismo tono que Tile 10) -->
    <rect width="${S}" height="${S}" fill="#1c2027"/>

    <!-- Sombreado de volumen cilíndrico continuo -->
    <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
    <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
    <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
    <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>

    <!-- 3 Acanaladuras/Estrías verticales profundas continuas de Y=0 a Y=S -->
    <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="32"   y1="0" x2="32"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

    <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="64"   y1="0" x2="64"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

    <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="96"   y1="0" x2="96"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>

    <!-- Desgaste base sutil -->
    <g stroke="#080a0d" stroke-width="1.2" fill="none" opacity="0.5">
      <path d="M 18,20 L 16,36 L 19,52"/>
      <path d="M 80,72 L 78,88 L 82,104"/>
    </g>

    <!-- Capa 1 de Musgo: Humedad profunda verde oscura en hendiduras de estrías -->
    <g fill="#14532d" opacity="0.85">
      <path d="M 30,18 Q 35,26 31,38 Q 28,48 33,56 L 35,56 Q 30,46 34,36 Q 36,24 33,18 Z"/>
      <path d="M 29,82 Q 34,92 31,104 Q 28,114 33,124 L 35,124 Q 30,112 34,102 Q 35,90 32,82 Z"/>
      <path d="M 61,42 Q 67,52 63,68 Q 59,80 66,94 L 68,94 Q 61,78 66,66 Q 69,50 64,42 Z"/>
      <path d="M 93,12 Q 98,22 95,34 Q 92,44 96,54 L 98,54 Q 94,42 97,32 Q 99,20 95,12 Z"/>
      <path d="M 92,76 Q 97,88 94,100 Q 91,110 96,120 L 98,120 Q 93,108 97,98 Q 99,86 95,76 Z"/>
      <ellipse cx="14" cy="98" rx="8" ry="14"/>
      <ellipse cx="48" cy="112" rx="10" ry="8"/>
      <ellipse cx="80" cy="28" rx="7" ry="12"/>
      <ellipse cx="112" cy="88" rx="6" ry="16"/>
    </g>

    <!-- Capa 2 de Musgo: Verde bosque vivo y filamentos vegetales -->
    <g fill="#16a34a" opacity="0.9">
      <path d="M 31,24 Q 34,30 32,40 Q 30,48 33,52 L 34,52 Q 31,46 33,38 Q 35,28 32,24 Z"/>
      <path d="M 30,88 Q 33,96 32,106 Q 30,114 33,120 L 34,120 Q 31,112 33,104 Q 34,94 32,88 Z"/>
      <path d="M 62,48 Q 66,56 64,70 Q 61,80 65,90 L 66,90 Q 62,78 65,68 Q 67,54 64,48 Z"/>
      <path d="M 94,18 Q 97,26 95,36 Q 93,44 96,50 L 97,50 Q 95,42 96,34 Q 98,24 95,18 Z"/>
      <circle cx="14" cy="98" r="5"/>
      <circle cx="18" cy="106" r="3.5"/>
      <circle cx="48" cy="112" r="6"/>
      <circle cx="56" cy="116" r="3.5"/>
      <circle cx="80" cy="28" r="4.5"/>
      <circle cx="84" cy="36" r="3"/>
      <circle cx="112" cy="88" r="4"/>
      <circle cx="110" cy="98" r="3.5"/>
    </g>

    <!-- Capa 3 de Musgo: Brotes claros de líquenes / esporas (resalte lumínico) -->
    <g fill="#4ade80" opacity="0.75">
      <circle cx="32" cy="32" r="1.8"/>
      <circle cx="33" cy="46" r="1.5"/>
      <circle cx="31" cy="96" r="1.8"/>
      <circle cx="33" cy="112" r="1.5"/>
      <circle cx="63" cy="58" r="2"/>
      <circle cx="65" cy="76" r="1.8"/>
      <circle cx="95" cy="28" r="1.8"/>
      <circle cx="96" cy="42" r="1.4"/>
      <circle cx="14" cy="96" r="2.2"/>
      <circle cx="47" cy="110" r="2.5"/>
      <circle cx="79" cy="26" r="2"/>
      <circle cx="111" cy="86" r="1.8"/>
    </g>

    <!-- Picado mineral residual -->
    <g fill="#454f5d" opacity="0.25">
      <circle cx="18" cy="36" r="1.5"/><circle cx="50" cy="32" r="1.8"/>
      <circle cx="76" cy="82" r="1.6"/><circle cx="106" cy="44" r="1.5"/>
    </g>
  `;
}

/**
 * Tile 21: Columna con desgaste estructural — fracturas y erosión de cantería por esfuerzo de carga.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarCracked(S = 128) {
  return `
    <!-- Fondo base: Piedra oscura de sillar macizo (mismo tono que Tile 10) -->
    <rect width="${S}" height="${S}" fill="#1c2027"/>

    <!-- Sombreado de volumen cilíndrico continuo -->
    <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
    <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
    <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
    <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>

    <!-- 3 Acanaladuras/Estrías verticales profundas continuas de Y=0 a Y=S -->
    <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="32"   y1="0" x2="32"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

    <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="64"   y1="0" x2="64"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

    <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
    <line x1="96"   y1="0" x2="96"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
    <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>

    <!-- Fracturas profundas y grietas estructurales severas por estrés de carga -->
    <g stroke="#080a0d" stroke-width="2.2" fill="none" opacity="0.9">
      <!-- Gran fisura diagonal que quiebra el fuste izquierdo -->
      <path d="M 6,32 L 18,38 L 26,34 L 32,46 L 42,42 L 52,54"/>
      <!-- Fisura central ramificada -->
      <path d="M 52,54 L 64,50 L 72,62 L 78,58 L 88,72 L 96,66"/>
      <!-- Rama secundaria hacia abajo -->
      <path d="M 64,50 L 60,66 L 66,80 L 62,98 L 65,114"/>
      <!-- Grieta en fuste derecho -->
      <path d="M 88,72 L 98,84 L 110,80 L 118,92 L 124,90"/>
      <!-- Grieta vertical profunda en estría 1 -->
      <path d="M 32,82 L 30,94 L 34,108 L 31,122"/>
      <!-- Micro-grieta superior -->
      <path d="M 76,10 L 82,18 L 80,30 L 86,40"/>
    </g>

    <!-- Resalte de luz en bordes de roca fracturada (relieve 3D) -->
    <g stroke="#64748b" stroke-width="0.8" fill="none" opacity="0.6">
      <path d="M 6,33 L 18,39 L 26,35 L 32,47 L 42,43 L 52,55"/>
      <path d="M 52,55 L 64,51 L 72,63 L 78,59 L 88,73 L 96,67"/>
      <path d="M 65,50 L 61,66 L 67,80 L 63,98 L 66,114"/>
      <path d="M 88,73 L 98,85 L 110,81 L 118,93 L 124,91"/>
    </g>

    <!-- Grandes muescas angulares de piedra desprendida / desconchada -->
    <g fill="#080a0d" opacity="0.85">
      <polygon points="32,42 42,46 36,54 30,48"/>
      <polygon points="64,48 72,52 68,60 60,56"/>
      <polygon points="96,64 104,70 98,78 92,72"/>
      <polygon points="18,34 26,38 22,46 14,40"/>
      <polygon points="86,68 94,74 90,82 82,76"/>
      <polygon points="30,92 38,96 34,104 26,98"/>
      <polygon points="114,86 122,90 118,98 110,94"/>
    </g>

    <!-- Fragmentos de piedra suelta en las muescas -->
    <g fill="#3f4754" opacity="0.5">
      <polygon points="34,44 40,47 36,52"/>
      <polygon points="66,50 70,53 67,58"/>
      <polygon points="98,66 102,71 97,75"/>
    </g>

    <!-- Picado y escoriación mineral intensa -->
    <g fill="#080a0d" opacity="0.6">
      <circle cx="22" cy="62" r="2.5"/><circle cx="28" cy="74" r="2"/>
      <circle cx="46" cy="24" r="2.2"/><circle cx="58" cy="34" r="2.8"/>
      <circle cx="76" cy="88" r="2.5"/><circle cx="84" cy="102" r="2"/>
      <circle cx="106" cy="24" r="2.2"/><circle cx="112" cy="46" r="2.5"/>
    </g>
    <g fill="#454f5d" opacity="0.35">
      <circle cx="24" cy="64" r="1.5"/><circle cx="48" cy="26" r="1.8"/>
      <circle cx="78" cy="90" r="1.8"/><circle cx="108" cy="26" r="1.5"/>
    </g>
  `;
}

/**
 * Tile 22: Columna tono oscuro — sillar sombrío de basalto ~35% más oscuro.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarDark(S = 128) {
  return `
    <!-- Fondo base: Basalto/Sillar sombrío ~35% más oscuro que Tile 10 -->
    <rect width="${S}" height="${S}" fill="#111419"/>

    <!-- Sombreado de volumen cilíndrico más profundo y frío -->
    <rect x="0" y="0" width="6" height="${S}" fill="#2a303a" opacity="0.45"/>
    <rect x="6" y="0" width="8" height="${S}" fill="#1c2027" opacity="0.35"/>
    <!-- Sombra lateral derecha más profunda -->
    <rect x="116" y="0" width="6" height="${S}" fill="#07080b" opacity="0.75"/>
    <rect x="122" y="0" width="6" height="${S}" fill="#020304" opacity="0.95"/>

    <!-- 3 Acanaladuras/Estrías verticales profundas continuas de Y=0 a Y=S con mayor contraste -->
    <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#06080b" stroke-width="2.5" opacity="0.95"/>
    <line x1="32"   y1="0" x2="32"   y2="${S}" stroke="#020304" stroke-width="2"/>
    <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#2a303a" stroke-width="1.5" opacity="0.55"/>

    <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#06080b" stroke-width="2.5" opacity="0.95"/>
    <line x1="64"   y1="0" x2="64"   y2="${S}" stroke="#020304" stroke-width="2"/>
    <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#2a303a" stroke-width="1.5" opacity="0.55"/>

    <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#06080b" stroke-width="2.5" opacity="0.95"/>
    <line x1="96"   y1="0" x2="96"   y2="${S}" stroke="#020304" stroke-width="2"/>
    <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#1c2027" stroke-width="1.5" opacity="0.5"/>

    <!-- Micro-desgaste y erosión en piedra oscura -->
    <g stroke="#040507" stroke-width="1.4" fill="none" opacity="0.8">
      <path d="M 16,18 L 19,32 L 15,50 L 18,66"/>
      <path d="M 48,62 L 52,78 L 47,96 L 51,112"/>
      <path d="M 80,18 L 77,34 L 81,52 L 78,68"/>
      <path d="M 110,46 L 107,62 L 111,78"/>
    </g>
    <g stroke="#2a303a" stroke-width="0.6" fill="none" opacity="0.35">
      <path d="M 17,18 L 20,32 L 16,50 L 19,66"/>
      <path d="M 49,62 L 53,78 L 48,96 L 52,112"/>
      <path d="M 81,18 L 78,34 L 82,52 L 79,68"/>
    </g>

    <!-- Muescas de piedra desconchada -->
    <g fill="#040507" opacity="0.8">
      <polygon points="32,32 37,37 32,42"/>
      <polygon points="64,70 59,75 64,80"/>
      <polygon points="96,22 91,27 96,32"/>
      <polygon points="96,86 101,91 96,96"/>
      <polygon points="16,46 19,51 15,54"/>
      <polygon points="80,58 84,63 79,66"/>
    </g>

    <!-- Pátina de hollín volcánico / sombra profunda continua -->
    <g fill="#020304" opacity="0.55">
      <ellipse cx="32" cy="58" rx="5" ry="24"/>
      <ellipse cx="64" cy="46" rx="6" ry="28"/>
      <ellipse cx="96" cy="74" rx="5" ry="26"/>
      <ellipse cx="120" cy="64" rx="4" ry="34"/>
      <ellipse cx="14" cy="38" rx="4" ry="18"/>
      <ellipse cx="78" cy="94" rx="5" ry="20"/>
    </g>

    <!-- Picado mineral sutil -->
    <g fill="#2a303a" opacity="0.25">
      <circle cx="12" cy="30" r="1.5"/><circle cx="24" cy="82" r="2"/>
      <circle cx="44" cy="18" r="2"/><circle cx="54" cy="92" r="1.5"/>
      <circle cx="74" cy="44" r="1.8"/><circle cx="86" cy="100" r="2"/>
      <circle cx="104" cy="28" r="1.5"/><circle cx="114" cy="74" r="1.8"/>
    </g>
  `;
}

export const pillarSprites = {
  pillarMonolith,
  pillarFluted,
  pillarMossy,
  pillarCracked,
  pillarDark
};
