// src/render/textures/walls.js

/**
 * Tile 0: Muro de Cripta Regular (wallRegular)
 * Aparejo a soga sin marco perimetral negro: la hilada 2 cruza continuamente entre bloques contiguos.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallRegular(S = 128) {
  return `
    <!-- Fondo continuo de piedra base (sin bordes negros perimetrales) -->
    <rect width="${S}" height="${S}" fill="#383431"/>

    <!-- HILADA 1 (Superior: y=0 a 42) -->
    <rect x="0" y="0" width="63" height="42" fill="#44403c"/>
    <path d="M 0,0 L 63,0 L 61,2 L 0,2 Z" fill="#78716c" opacity="0.6"/>
    <path d="M 0,40 L 61,40 L 63,42 L 0,42 Z" fill="#1c1917" opacity="0.75"/>

    <rect x="65" y="0" width="63" height="42" fill="#383431"/>
    <path d="M 65,0 L 128,0 L 128,2 L 67,2 Z" fill="#78716c" opacity="0.65"/>
    <path d="M 67,40 L 128,40 L 128,42 L 65,42 Z" fill="#1c1917" opacity="0.75"/>

    <!-- Junta vertical interna Hilada 1 -->
    <line x1="64" y1="0" x2="64" y2="42" stroke="#1c1917" stroke-width="2"/>

    <!-- Junta horizontal 1-2 -->
    <line x1="0" y1="42.5" x2="${S}" y2="42.5" stroke="#1c1917" stroke-width="2"/>

    <!-- HILADA 2 (Media alternada continua: y=43 a 85) -->
    <!-- Bloque 2A (conecta con Bloque 2C del sprite contiguo formando un bloque continuo de 64px sin línea negra) -->
    <rect x="0" y="43" width="32" height="42" fill="#383431"/>
    <path d="M 0,43 L 32,43 L 30,45 L 0,45 Z" fill="#65605b" opacity="0.6"/>
    <path d="M 0,83 L 30,83 L 32,85 L 0,85 Z" fill="#1c1917" opacity="0.75"/>

    <!-- Bloque 2B central -->
    <rect x="34" y="43" width="60" height="42" fill="#44403c"/>
    <path d="M 34,43 L 94,43 L 92,45 L 36,45 L 36,83 L 34,85 Z" fill="#78716c" opacity="0.6"/>
    <path d="M 36,83 L 92,83 L 94,85 L 34,85 Z" fill="#1c1917" opacity="0.75"/>

    <!-- Bloque 2C (remate derecho que conecta con Bloque 2A) -->
    <rect x="96" y="43" width="32" height="42" fill="#383431"/>
    <path d="M 96,43 L 128,43 L 128,45 L 98,45 Z" fill="#65605b" opacity="0.6"/>
    <path d="M 98,83 L 128,83 L 128,85 L 96,85 Z" fill="#1c1917" opacity="0.75"/>

    <!-- Juntas verticales internas Hilada 2 -->
    <line x1="33" y1="43" x2="33" y2="85" stroke="#1c1917" stroke-width="2"/>
    <line x1="95" y1="43" x2="95" y2="85" stroke="#1c1917" stroke-width="2"/>

    <!-- Junta horizontal 2-3 -->
    <line x1="0" y1="85.5" x2="${S}" y2="85.5" stroke="#1c1917" stroke-width="2"/>

    <!-- HILADA 3 (Inferior: y=86 a 128) -->
    <rect x="0" y="86" width="63" height="42" fill="#383431"/>
    <path d="M 0,86 L 63,86 L 61,88 L 0,88 Z" fill="#65605b" opacity="0.6"/>
    <path d="M 0,126 L 61,126 L 63,128 L 0,128 Z" fill="#1c1917" opacity="0.75"/>

    <rect x="65" y="86" width="63" height="42" fill="#44403c"/>
    <path d="M 65,86 L 128,86 L 128,88 L 67,88 Z" fill="#78716c" opacity="0.6"/>
    <path d="M 67,126 L 128,126 L 128,128 L 65,128 Z" fill="#1c1917" opacity="0.75"/>

    <!-- Junta vertical interna Hilada 3 -->
    <line x1="64" y1="86" x2="64" y2="128" stroke="#1c1917" stroke-width="2"/>

    <!-- Escurrimientos de óxido vertical estrechos -->
    <g fill="#78350f" opacity="0.45">
      <path d="M 22,0 L 24,0 L 25,32 L 23,38 L 22,24 Z"/>
      <path d="M 88,0 L 90,0 L 91,26 L 89,34 L 88,20 Z"/>
      <path d="M 48,43 L 50,43 L 51,72 L 49,78 L 47,64 Z"/>
      <path d="M 114,43 L 116,43 L 117,74 L 115,80 L 113,62 Z"/>
      <path d="M 30,86 L 32,86 L 33,118 L 31,124 L 29,106 Z"/>
      <path d="M 100,86 L 102,86 L 103,116 L 101,122 L 99,108 Z"/>
    </g>

    <!-- Piqueteado fino de cincel -->
    <g fill="#1c1917" opacity="0.65">
      <rect x="14" y="16" width="3" height="2"/>
      <rect x="46" y="26" width="3" height="2"/>
      <rect x="86" y="18" width="3" height="2"/>
      <rect x="22" y="62" width="2" height="3"/>
      <rect x="74" y="68" width="3" height="2"/>
      <rect x="48" y="106" width="3" height="2"/>
      <rect x="110" y="102" width="3" height="2"/>
    </g>
  `;
}

/**
 * Tile 1: Muro Agrietado (wallCracked)
 * Aparejo sin marcos negros con fractura profunda confinada al interior del bloque.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallCracked(S = 128) {
  return `
    <!-- Fondo continuo de piedra base -->
    <rect width="${S}" height="${S}" fill="#383431"/>

    <!-- Hilada 1 -->
    <rect x="0" y="0" width="63" height="42" fill="#44403c"/>
    <rect x="65" y="0" width="63" height="42" fill="#383431"/>
    <line x1="0" y1="1" x2="63" y2="1" stroke="#78716c" stroke-width="1.8" opacity="0.5"/>
    <line x1="65" y1="1" x2="${S}" y2="1" stroke="#78716c" stroke-width="1.8" opacity="0.5"/>
    <line x1="64" y1="0" x2="64" y2="42" stroke="#1c1917" stroke-width="2"/>

    <line x1="0" y1="42.5" x2="${S}" y2="42.5" stroke="#1c1917" stroke-width="2"/>

    <!-- Hilada 2 (continua en bordes) -->
    <rect x="0" y="43" width="32" height="42" fill="#383431"/>
    <rect x="34" y="43" width="60" height="42" fill="#44403c"/>
    <rect x="96" y="43" width="32" height="42" fill="#383431"/>
    <line x1="0" y1="44" x2="${S}" y2="44" stroke="#65605b" stroke-width="1.6" opacity="0.45"/>
    <line x1="33" y1="43" x2="33" y2="85" stroke="#1c1917" stroke-width="2"/>
    <line x1="95" y1="43" x2="95" y2="85" stroke="#1c1917" stroke-width="2"/>

    <line x1="0" y1="85.5" x2="${S}" y2="85.5" stroke="#1c1917" stroke-width="2"/>

    <!-- Hilada 3 -->
    <rect x="0" y="86" width="63" height="42" fill="#383431"/>
    <rect x="65" y="86" width="63" height="42" fill="#44403c"/>
    <line x1="0" y1="87" x2="${S}" y2="87" stroke="#65605b" stroke-width="1.6" opacity="0.45"/>
    <line x1="64" y1="86" x2="64" y2="${S}" stroke="#1c1917" stroke-width="2"/>

    <!-- Abismo interior de la grieta -->
    <path d="M 64,2 L 53,18 L 41,36 L 47,56 L 31,74 L 39,96 L 23,126" stroke="#000000" stroke-width="7" stroke-linecap="square" fill="none"/>
    
    <!-- Grieta principal oscura dentada -->
    <path d="M 64,2 L 54,18 L 42,36 L 48,56 L 32,74 L 40,96 L 24,126" stroke="#0c0a09" stroke-width="3.8" stroke-linejoin="bevel" fill="none"/>

    <!-- Filo iluminado de piedra fracturada -->
    <path d="M 66,2 L 56,18 L 44,36 L 50,56 L 34,74 L 42,96 L 26,126" stroke="#a8a29e" stroke-width="1.6" opacity="0.8" fill="none"/>

    <!-- Fisuras secundarias -->
    <path d="M 42,36 L 18,44" stroke="#0c0a09" stroke-width="2.5" fill="none"/>
    <path d="M 42,37 L 18,45" stroke="#78716c" stroke-width="1" opacity="0.7" fill="none"/>

    <path d="M 48,56 L 76,68" stroke="#0c0a09" stroke-width="2.5" fill="none"/>
    <path d="M 48,57 L 76,69" stroke="#78716c" stroke-width="1" opacity="0.7" fill="none"/>

    <path d="M 40,96 L 66,106" stroke="#0c0a09" stroke-width="2.5" fill="none"/>
    <path d="M 40,97 L 66,107" stroke="#78716c" stroke-width="1" opacity="0.7" fill="none"/>

    <!-- Desconchado menor en la junta central -->
    <polygon points="64,43 76,43 64,55" fill="#0c0a09"/>
    <polygon points="65,44 73,44 65,52" fill="#57534e"/>
  `;
}

/**
 * Tile 2: Muro de Mampostería Fina (wallMasonry)
 * Piedras rústicas labradas a sangre completa que entrelazan entre bloques sin marcos negros.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallMasonry(S = 128) {
  return `
    <!-- Fondo continuo de piedra base -->
    <rect width="${S}" height="${S}" fill="#383431"/>

    <!-- Bloque 1 (Superior Izquierdo amplio, sin margen exterior) -->
    <rect x="0" y="0" width="76" height="42" fill="#44403c"/>
    <path d="M 0,40 L 0,1 L 75,1" stroke="#78716c" stroke-width="2" fill="none" opacity="0.65"/>
    <path d="M 0,42 L 76,42 L 76,1" stroke="#1c1917" stroke-width="2" fill="none"/>

    <!-- Bloque 2 (Superior Derecho, hasta borde x=S) -->
    <rect x="78" y="0" width="50" height="42" fill="#383431"/>
    <path d="M 79,40 L 79,1 L 128,1" stroke="#65605b" stroke-width="2" fill="none" opacity="0.65"/>
    <path d="M 80,42 L 128,42" stroke="#1c1917" stroke-width="2" fill="none"/>

    <!-- Junta horizontal 1-2 -->
    <line x1="0" y1="42.5" x2="${S}" y2="42.5" stroke="#1c1917" stroke-width="2"/>

    <!-- Bloque 3 (Medio Izquierdo: conecta con Bloque 5 formando un sillar continuo) -->
    <rect x="0" y="43" width="46" height="42" fill="#33302d"/>
    <path d="M 0,83 L 0,44 L 45,44" stroke="#65605b" stroke-width="2" fill="none" opacity="0.65"/>
    <path d="M 0,85 L 46,85 L 46,44" stroke="#1c1917" stroke-width="2" fill="none"/>

    <!-- Bloque 4 (Medio Derecho Grande) -->
    <rect x="48" y="43" width="58" height="42" fill="#44403c"/>
    <path d="M 49,83 L 49,44 L 105,44" stroke="#78716c" stroke-width="2" fill="none" opacity="0.65"/>
    <path d="M 50,85 L 106,85 L 106,44" stroke="#1c1917" stroke-width="2" fill="none"/>

    <!-- Bloque 5 (Medio Remate Derecho: 20px + 46px = 66px de sillar continuo) -->
    <rect x="108" y="43" width="20" height="42" fill="#33302d"/>
    <path d="M 109,83 L 109,44 L 128,44" stroke="#65605b" stroke-width="2" fill="none" opacity="0.65"/>
    <path d="M 110,85 L 128,85" stroke="#1c1917" stroke-width="2" fill="none"/>

    <!-- Junta horizontal 2-3 -->
    <line x1="0" y1="85.5" x2="${S}" y2="85.5" stroke="#1c1917" stroke-width="2"/>

    <!-- Bloque 6 (Inferior Izquierdo) -->
    <rect x="0" y="86" width="68" height="42" fill="#383431"/>
    <path d="M 0,126 L 0,87 L 67,87" stroke="#65605b" stroke-width="2" fill="none" opacity="0.65"/>
    <path d="M 0,128 L 68,128 L 68,88" stroke="#1c1917" stroke-width="2" fill="none"/>

    <!-- Bloque 7 (Inferior Derecho) -->
    <rect x="70" y="86" width="58" height="42" fill="#33302d"/>
    <path d="M 71,126 L 71,87 L 128,87" stroke="#65605b" stroke-width="2" fill="none" opacity="0.65"/>
    <path d="M 72,128 L 128,128" stroke="#1c1917" stroke-width="2" fill="none"/>

    <!-- Óxido y suciedad incrustada en las esquinas interiores -->
    <g fill="#78350f" opacity="0.4">
      <path d="M 74,22 L 76,22 L 77,40 L 74,40 Z"/>
      <path d="M 46,60 L 48,60 L 49,82 L 46,82 Z"/>
      <path d="M 66,102 L 68,102 L 69,124 L 66,124 Z"/>
    </g>
  `;
}

/**
 * Tile 3: Muro con Moho / Humedad (wallMossy)
 * Moho y líquenes orgánicos sobre sillar continuo sin bordes negros.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallMossy(S = 128) {
  return `
    <!-- Fondo continuo de piedra base -->
    <rect width="${S}" height="${S}" fill="#383431"/>

    <!-- Hilada 1 -->
    <rect x="0" y="0" width="63" height="42" fill="#44403c"/>
    <rect x="65" y="0" width="63" height="42" fill="#383431"/>
    <line x1="0" y1="1" x2="${S}" y2="1" stroke="#78716c" stroke-width="1.8" opacity="0.4"/>
    <line x1="64" y1="0" x2="64" y2="42" stroke="#1c1917" stroke-width="2"/>

    <line x1="0" y1="42.5" x2="${S}" y2="42.5" stroke="#1c1917" stroke-width="2"/>

    <!-- Hilada 2 (continua en bordes) -->
    <rect x="0" y="43" width="32" height="42" fill="#383431"/>
    <rect x="34" y="43" width="60" height="42" fill="#44403c"/>
    <rect x="96" y="43" width="32" height="42" fill="#383431"/>
    <line x1="0" y1="44" x2="${S}" y2="44" stroke="#65605b" stroke-width="1.6" opacity="0.4"/>
    <line x1="33" y1="43" x2="33" y2="85" stroke="#1c1917" stroke-width="2"/>
    <line x1="95" y1="43" x2="95" y2="85" stroke="#1c1917" stroke-width="2"/>

    <line x1="0" y1="85.5" x2="${S}" y2="85.5" stroke="#1c1917" stroke-width="2"/>

    <!-- Hilada 3 -->
    <rect x="0" y="86" width="63" height="42" fill="#383431"/>
    <rect x="65" y="86" width="63" height="42" fill="#44403c"/>
    <line x1="0" y1="87" x2="${S}" y2="87" stroke="#65605b" stroke-width="1.6" opacity="0.4"/>
    <line x1="64" y1="86" x2="64" y2="${S}" stroke="#1c1917" stroke-width="2"/>

    <!-- Manchas oscuras de humedad en juntas internas -->
    <path d="M 22,43 Q 34,28 46,43 Q 54,64 38,72 Q 20,64 22,43 Z" fill="#020617" opacity="0.55"/>
    <path d="M 82,85 Q 98,68 108,85 Q 118,108 96,114 Q 80,104 82,85 Z" fill="#020617" opacity="0.55"/>
    <path d="M 58,14 Q 66,1 72,14 Q 78,30 66,32 Q 54,28 58,14 Z" fill="#020617" opacity="0.5"/>

    <!-- Capa 1: Moho verde oliva profundo -->
    <g fill="#14532d" opacity="0.9">
      <circle cx="26" cy="43" r="6"/><circle cx="36" cy="44" r="7"/><circle cx="46" cy="41" r="5.5"/>
      <circle cx="92" cy="85" r="7"/><circle cx="102" cy="87" r="6.5"/><circle cx="110" cy="83" r="5.5"/>
      <circle cx="62" cy="18" r="5.5"/><circle cx="68" cy="24" r="6.5"/>
    </g>

    <!-- Capa 2: Manchas de hongos y líquenes -->
    <g fill="#3f6212">
      <circle cx="25" cy="41" r="4.5"/><circle cx="35" cy="42" r="5"/><circle cx="44" cy="39" r="4"/>
      <circle cx="91" cy="83" r="5"/><circle cx="101" cy="85" r="4.5"/><circle cx="108" cy="81" r="4"/>
      <circle cx="61" cy="17" r="4"/><circle cx="67" cy="22" r="4.5"/>
    </g>

    <!-- Capa 3: Moho marchito luminiscente -->
    <g fill="#65a30d" opacity="0.8">
      <circle cx="24" cy="39" r="2.2"/><circle cx="33" cy="40" r="2.8"/>
      <circle cx="90" cy="81" r="2.5"/><circle cx="99" cy="83" r="2.4"/>
      <circle cx="60" cy="15" r="2.2"/><circle cx="66" cy="20" r="2.5"/>
    </g>
  `;
}

/**
 * Tile 4: Muro Rúnico (wallRunic)
 * Placa monolítica a sangre completa sin marco exterior negro: relieve y glifo en bajorrelieve.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallRunic(S = 128) {
  return `
    <!-- Placa monolítica exterior a sangre completa (sin marco negro perimetral) -->
    <rect width="${S}" height="${S}" fill="#383431"/>
    <path d="M 0,0 L 128,0 L 126,3 L 2,3 L 2,126 L 0,128 Z" fill="#65605b" opacity="0.8"/>
    <path d="M 128,0 L 128,128 L 0,128 L 2,126 L 126,126 L 126,3 Z" fill="#1c1917" opacity="0.85"/>

    <!-- Panel interior rehundido con bisel fino -->
    <rect x="6" y="6" width="116" height="116" fill="#292524"/>
    <path d="M 6,6 L 122,6 L 122,9 L 9,9 L 9,122 L 6,122 Z" fill="#0c0a09" opacity="0.7"/>
    <path d="M 9,122 L 122,122 L 122,9 L 120,11 L 120,120 L 11,120 Z" fill="#57534e" opacity="0.5"/>

    <!-- Medallón central tallado -->
    <circle cx="64" cy="64" r="45" fill="#0c0a09" opacity="0.6"/>
    <circle cx="64" cy="64" r="43" fill="#383431" stroke="#0c0a09" stroke-width="2"/>
    <circle cx="64" cy="64" r="41" fill="none" stroke="#65605b" stroke-width="1.5" opacity="0.7"/>

    <!-- Canal tallado del glifo rúnico -->
    <polygon points="63,28 94,63 63,98 32,63" stroke="#0c0a09" stroke-width="4.5" fill="none"/>
    <line x1="63" y1="22" x2="63" y2="104" stroke="#0c0a09" stroke-width="4"/>
    <line x1="22" y1="63" x2="104" y2="63" stroke="#0c0a09" stroke-width="4"/>
    <circle cx="63" cy="63" r="12" stroke="#0c0a09" stroke-width="3.5" fill="none"/>

    <!-- Filo iluminado de piedra cincelada -->
    <polygon points="65,30 96,65 65,100 34,65" stroke="#78716c" stroke-width="1.6" opacity="0.75" fill="none"/>
    <line x1="65" y1="24" x2="65" y2="106" stroke="#78716c" stroke-width="1.3" opacity="0.75"/>
    <line x1="24" y1="65" x2="106" y2="65" stroke="#78716c" stroke-width="1.3" opacity="0.75"/>

    <!-- Runa latente de azufre / fuego arcano herético -->
    <polygon points="64,29 95,64 64,99 33,64" stroke="#ea580c" stroke-width="2" fill="none"/>
    <line x1="64" y1="23" x2="64" y2="105" stroke="#ea580c" stroke-width="2"/>
    <line x1="23" y1="64" x2="105" y2="64" stroke="#ea580c" stroke-width="2"/>

    <!-- Ojo central encendido -->
    <circle cx="64" cy="64" r="6" fill="#7f1d1d" stroke="#0c0a09" stroke-width="1.5"/>
    <circle cx="64" cy="64" r="3.5" fill="#f59e0b"/>
    <circle cx="63" cy="63" r="1.5" fill="#fef08a"/>

    <!-- Clavos de fijación en las esquinas -->
    <rect x="12" y="12" width="4" height="4" fill="#1c1917" stroke="#44403c" stroke-width="0.8"/>
    <rect x="112" y="12" width="4" height="4" fill="#1c1917" stroke="#44403c" stroke-width="0.8"/>
    <rect x="12" y="112" width="4" height="4" fill="#1c1917" stroke="#44403c" stroke-width="0.8"/>
    <rect x="112" y="112" width="4" height="4" fill="#1c1917" stroke="#44403c" stroke-width="0.8"/>
  `;
}

export const wallSprites = {
  wallRegular,
  wallCracked,
  wallMasonry,
  wallMossy,
  wallRunic
};
