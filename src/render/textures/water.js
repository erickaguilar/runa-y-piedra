// src/render/textures/water.js

/**
 * Tile 28: WATER — Agua Subterránea Tranquila / Estanque Cristalino (waterCalm).
 * Fondo aguamarina profundo con reflejos caústicos de luz cristalina y ondas suaves.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function waterCalm(S = 128) {
  return `
    <!-- Fondo abisal azul turquesa -->
    <rect width="${S}" height="${S}" fill="#0369a1"/>
    <rect x="2" y="2" width="${S - 4}" height="${S - 4}" fill="#0284c7"/>

    <!-- Capa de profundidad azul cerúleo -->
    <circle cx="36" cy="40" r="32" fill="#075985" opacity="0.6"/>
    <circle cx="96" cy="88" r="30" fill="#0c4a6e" opacity="0.5"/>
    <circle cx="80" cy="32" r="24" fill="#0369a1" opacity="0.7"/>

    <!-- Red de caústicas de luz en la superficie -->
    <g fill="none" stroke="#38bdf8" stroke-width="2.5" opacity="0.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 24 Q32 16 52 28 T92 24 T120 32"/>
      <path d="M8 68 Q36 56 64 72 T108 64 T124 76"/>
      <path d="M20 108 Q48 96 76 112 T116 104"/>
      <path d="M32 20 Q44 48 36 68 T44 116"/>
      <path d="M84 12 Q76 44 88 72 T80 120"/>
    </g>

    <!-- Destellos de luz blanca cristalina -->
    <g fill="none" stroke="#e0f2fe" stroke-width="1.2" opacity="0.85" stroke-linecap="round">
      <path d="M50 26 Q60 30 70 24"/>
      <path d="M24 70 Q34 66 44 72"/>
      <path d="M78 68 Q90 62 100 66"/>
      <path d="M84 106 Q94 110 104 104"/>
    </g>

    <!-- Micro-burbujas translúcidas de manantial -->
    <g fill="#bae6fd" opacity="0.7">
      <circle cx="28" cy="48" r="2"/>
      <circle cx="62" cy="42" r="2.5"/>
      <circle cx="102" cy="38" r="1.8"/>
      <circle cx="48" cy="92" r="2.2"/>
      <circle cx="90" cy="86" r="3"/>
      <circle cx="112" cy="112" r="1.6"/>
    </g>
  `;
}

/**
 * Tile 29: WATER_STREAM_NORTH / WATER_STREAM_SOUTH — Torrente Longitudinal de Acueducto (waterCurrentZ).
 * Flujo acuático veloz a lo largo del eje Z con estelas de espuma y ondas chevron direccionales.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function waterCurrentZ(S = 128) {
  return `
    <!-- Base de canal torrencial azul zafiro -->
    <rect width="${S}" height="${S}" fill="#0284c7"/>

    <!-- Bandas de flujo laminar rápido -->
    <rect x="0" y="0" width="38" height="${S}" fill="#0369a1" opacity="0.5"/>
    <rect x="38" y="0" width="52" height="${S}" fill="#0284c7"/>
    <rect x="90" y="0" width="38" height="${S}" fill="#075985" opacity="0.45"/>

    <!-- Líneas de corriente longitudinal Z -->
    <g stroke="#38bdf8" stroke-width="2.2" fill="none" opacity="0.85" stroke-linecap="round">
      <line x1="20" y1="4" x2="20" y2="${S - 4}"/>
      <line x1="44" y1="12" x2="44" y2="${S - 12}"/>
      <line x1="64" y1="2" x2="64" y2="${S - 2}"/>
      <line x1="84" y1="8" x2="84" y2="${S - 8}"/>
      <line x1="108" y1="6" x2="108" y2="${S - 6}"/>
    </g>

    <!-- Ondas chevron de avance del torrente -->
    <g fill="none" stroke="#e0f2fe" stroke-width="2.6" opacity="0.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M40 24 L64 42 L88 24"/>
      <path d="M36 68 L64 88 L92 68"/>
      <path d="M42 110 L64 126 L86 110"/>
      <path d="M6 46 L20 58 L34 46"/>
      <path d="M94 46 L108 58 L122 46"/>
    </g>

    <!-- Espuma y crestas de rompiente blanca -->
    <g fill="#ffffff" opacity="0.9">
      <!-- Cresta 1 -->
      <circle cx="64" cy="42" r="3.2"/>
      <circle cx="58" cy="38" r="2.2"/>
      <circle cx="70" cy="38" r="2.2"/>
      <!-- Cresta 2 -->
      <circle cx="64" cy="88" r="3.5"/>
      <circle cx="56" cy="82" r="2.4"/>
      <circle cx="72" cy="82" r="2.4"/>
      <circle cx="48" cy="76" r="1.8"/>
      <circle cx="80" cy="76" r="1.8"/>
      <!-- Salpicaduras laterales -->
      <circle cx="20" cy="58" r="2.5"/>
      <circle cx="108" cy="58" r="2.5"/>
      <circle cx="64" cy="126" r="3"/>
    </g>
  `;
}

/**
 * Tile 30: WATER_STREAM_EAST / WATER_STREAM_WEST — Torrente Transversal de Acueducto (waterCurrentX).
 * Flujo acuático transversal a lo largo del eje X con estelas de espuma y ondas chevron horizontales.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function waterCurrentX(S = 128) {
  return `
    <!-- Base de canal torrencial azul zafiro -->
    <rect width="${S}" height="${S}" fill="#0284c7"/>

    <!-- Bandas de flujo transversal rápido -->
    <rect x="0" y="0" width="${S}" height="38" fill="#0369a1" opacity="0.5"/>
    <rect x="0" y="38" width="${S}" height="52" fill="#0284c7"/>
    <rect x="0" y="90" width="${S}" height="38" fill="#075985" opacity="0.45"/>

    <!-- Líneas de corriente transversal X -->
    <g stroke="#38bdf8" stroke-width="2.2" fill="none" opacity="0.85" stroke-linecap="round">
      <line x1="4" y1="20" x2="${S - 4}" y2="20"/>
      <line x1="12" y1="44" x2="${S - 12}" y2="44"/>
      <line x1="2" y1="64" x2="${S - 2}" y2="64"/>
      <line x1="8" y1="84" x2="${S - 8}" y2="84"/>
      <line x1="6" y1="108" x2="${S - 6}" y2="108"/>
    </g>

    <!-- Ondas chevron de avance horizontal -->
    <g fill="none" stroke="#e0f2fe" stroke-width="2.6" opacity="0.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M24 40 L42 64 L24 88"/>
      <path d="M68 36 L88 64 L68 92"/>
      <path d="M110 42 L126 64 L110 86"/>
      <path d="M46 6 L58 20 L46 34"/>
      <path d="M46 94 L58 108 L46 122"/>
    </g>

    <!-- Espuma y crestas de rompiente blanca -->
    <g fill="#ffffff" opacity="0.9">
      <circle cx="42" cy="64" r="3.2"/>
      <circle cx="38" cy="58" r="2.2"/>
      <circle cx="38" cy="70" r="2.2"/>
      <circle cx="88" cy="64" r="3.5"/>
      <circle cx="82" cy="56" r="2.4"/>
      <circle cx="82" cy="72" r="2.4"/>
      <circle cx="76" cy="48" r="1.8"/>
      <circle cx="76" cy="80" r="1.8"/>
      <circle cx="58" cy="20" r="2.5"/>
      <circle cx="58" cy="108" r="2.5"/>
      <circle cx="126" cy="64" r="3"/>
    </g>
  `;
}

/**
 * Tile 31: Cascada Efervescente y Fosa de Caída (waterCascade).
 * Espuma intensa de rompiente acuática sobre piedra caliza húmeda.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function waterCascade(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#0284c7"/>

    <!-- Velo de agua de cascada -->
    <g fill="none" stroke="#7dd3fc" stroke-width="3" opacity="0.8">
      <line x1="16" y1="0" x2="20" y2="${S}"/>
      <line x1="36" y1="0" x2="34" y2="${S}"/>
      <line x1="56" y1="0" x2="60" y2="${S}"/>
      <line x1="76" y1="0" x2="74" y2="${S}"/>
      <line x1="96" y1="0" x2="98" y2="${S}"/>
      <line x1="114" y1="0" x2="112" y2="${S}"/>
    </g>

    <!-- Ebullición y remolinos de espuma blanca -->
    <g fill="#ffffff" opacity="0.95">
      <circle cx="24" cy="24" r="6"/>
      <circle cx="38" cy="20" r="8"/>
      <circle cx="54" cy="26" r="7"/>
      <circle cx="72" cy="22" r="9"/>
      <circle cx="92" cy="26" r="8"/>
      <circle cx="108" cy="22" r="6"/>

      <circle cx="30" cy="74" r="7"/>
      <circle cx="48" cy="78" r="9"/>
      <circle cx="68" cy="72" r="10"/>
      <circle cx="88" cy="76" r="8"/>
      <circle cx="104" cy="72" r="6"/>

      <circle cx="20" cy="116" r="6"/>
      <circle cx="42" cy="114" r="8"/>
      <circle cx="64" cy="118" r="9"/>
      <circle cx="86" cy="112" r="8"/>
      <circle cx="108" cy="116" r="7"/>
    </g>

    <!-- Salpicaduras finas de niebla acuática -->
    <g fill="#e0f2fe" opacity="0.8">
      <circle cx="14" cy="46" r="2.5"/>
      <circle cx="46" cy="48" r="3"/>
      <circle cx="82" cy="46" r="3"/>
      <circle cx="116" cy="48" r="2.5"/>
      <circle cx="26" cy="98" r="2.8"/>
      <circle cx="58" cy="96" r="3.2"/>
      <circle cx="94" cy="98" r="2.8"/>
    </g>
  `;
}

export const waterSprites = {
  waterCalm,
  waterCurrentZ,
  waterCurrentX,
  waterCascade,
};
