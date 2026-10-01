// src/render/textures/ceilings.js

/**
 * Tile 23: Techo 1 — Bóveda de cantería con nervaduras góticas cruzadas y clave central.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingVault(S = 128) {
  return `
    <!-- Fondo base: Piedra oscura de sillar cenital -->
    <rect width="${S}" height="${S}" fill="#181a20"/>
    <rect x="2" y="2" width="${S - 4}" height="${S - 4}" fill="#22252c"/>

    <!-- Bisel de profundidad cenital en perímetro -->
    <path d="M 0,0 L ${S},0 L ${S - 6},6 L 6,6 L 6,${S - 6} L 0,${S} Z" fill="#2d323b" opacity="0.6"/>
    <path d="M ${S},0 L ${S},${S} L 0,${S} L 6,${S - 6} L ${S - 6},${S - 6} L ${S - 6},6 Z" fill="#0d0e12" opacity="0.85"/>

    <!-- Hiladas de mampostería en 4 cuadrantes triangulares -->
    <g stroke="#121418" stroke-width="1.6" fill="none" opacity="0.65">
      <!-- Cuadrante Superior -->
      <path d="M 22,22 L 106,22"/>
      <path d="M 36,36 L 92,36"/>
      <!-- Cuadrante Inferior -->
      <path d="M 22,106 L 106,106"/>
      <path d="M 36,92 L 92,92"/>
      <!-- Cuadrante Izquierdo -->
      <path d="M 22,22 L 22,106"/>
      <path d="M 36,36 L 36,92"/>
      <!-- Cuadrante Derecho -->
      <path d="M 106,22 L 106,106"/>
      <path d="M 92,36 L 92,92"/>
    </g>

    <!-- Nervaduras diagonales cruzadas (arcos fajones / crucería de ojiva) -->
    <!-- Sombra profunda bajo la nervadura -->
    <line x1="8" y1="8" x2="120" y2="120" stroke="#0a0b0e" stroke-width="8" stroke-linecap="round"/>
    <line x1="120" y1="8" x2="8" y2="120" stroke="#0a0b0e" stroke-width="8" stroke-linecap="round"/>

    <!-- Cuerpo de sillar de las nervaduras -->
    <line x1="8" y1="8" x2="120" y2="120" stroke="#2d323b" stroke-width="5" stroke-linecap="round"/>
    <line x1="120" y1="8" x2="8" y2="120" stroke="#2d323b" stroke-width="5" stroke-linecap="round"/>

    <!-- Realce lumínico superior de arista en nervaduras -->
    <line x1="7" y1="7" x2="119" y2="119" stroke="#4b5563" stroke-width="1.8" opacity="0.75" stroke-linecap="round"/>
    <line x1="119" y1="7" x2="7" y2="119" stroke="#4b5563" stroke-width="1.8" opacity="0.75" stroke-linecap="round"/>

    <!-- Clave de bóveda central circular en relieve tallado -->
    <circle cx="64" cy="64" r="16" fill="#0d0e12" opacity="0.8"/>
    <circle cx="64" cy="64" r="14" fill="#2d323b" stroke="#121418" stroke-width="2"/>
    <circle cx="64" cy="64" r="12" fill="#374151" stroke="#4b5563" stroke-width="1.2"/>
    <circle cx="64" cy="64" r="6" fill="#1f2937"/>
    <circle cx="64" cy="64" r="2.5" fill="#9ca3af"/>

    <!-- Cuatro dovelas angulares de sujeción -->
    <circle cx="36" cy="36" r="3" fill="#1f2937" stroke="#4b5563" stroke-width="1"/>
    <circle cx="92" cy="36" r="3" fill="#1f2937" stroke="#4b5563" stroke-width="1"/>
    <circle cx="36" cy="92" r="3" fill="#1f2937" stroke="#4b5563" stroke-width="1"/>
    <circle cx="92" cy="92" r="3" fill="#1f2937" stroke="#4b5563" stroke-width="1"/>
  `;
}

/**
 * Tile 24: Techo 2 — Artesonado de vigas de roble cruzadas con herrajes de hierro forjado.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingCoffered(S = 128) {
  return `
    <!-- Fondo: Paneles de madera de roble rehundidos en 4 casetones -->
    <rect width="${S}" height="${S}" fill="#1c140e"/>

    <!-- 4 Casetones cuadrangulares con veta de madera -->
    <!-- Casetón 1: Noroeste -->
    <rect x="6" y="6" width="50" height="50" fill="#291e17"/>
    <path d="M 6,6 L 56,6 L 52,10 L 10,10 L 10,52 L 6,56 Z" fill="#3b2b21" opacity="0.6"/>
    <path d="M 56,6 L 56,56 L 6,56 L 10,52 L 52,52 L 52,10 Z" fill="#120c08" opacity="0.8"/>
    <line x1="16" y1="12" x2="16" y2="50" stroke="#1f1611" stroke-width="1.2"/>
    <line x1="32" y1="12" x2="32" y2="50" stroke="#1f1611" stroke-width="1.2"/>

    <!-- Casetón 2: Noreste -->
    <rect x="72" y="6" width="50" height="50" fill="#291e17"/>
    <path d="M 72,6 L 122,6 L 118,10 L 76,10 L 76,52 L 72,56 Z" fill="#3b2b21" opacity="0.6"/>
    <path d="M 122,6 L 122,56 L 72,56 L 76,52 L 118,52 L 118,10 Z" fill="#120c08" opacity="0.8"/>
    <line x1="88" y1="12" x2="88" y2="50" stroke="#1f1611" stroke-width="1.2"/>
    <line x1="104" y1="12" x2="104" y2="50" stroke="#1f1611" stroke-width="1.2"/>

    <!-- Casetón 3: Suroeste -->
    <rect x="6" y="72" width="50" height="50" fill="#291e17"/>
    <path d="M 6,72 L 56,72 L 52,76 L 10,76 L 10,118 L 6,122 Z" fill="#3b2b21" opacity="0.6"/>
    <path d="M 56,72 L 56,122 L 6,122 L 10,118 L 52,118 L 52,76 Z" fill="#120c08" opacity="0.8"/>
    <line x1="16" y1="78" x2="16" y2="116" stroke="#1f1611" stroke-width="1.2"/>
    <line x1="32" y1="78" x2="32" y2="116" stroke="#1f1611" stroke-width="1.2"/>

    <!-- Casetón 4: Sureste -->
    <rect x="72" y="72" width="50" height="50" fill="#291e17"/>
    <path d="M 72,72 L 122,72 L 118,76 L 76,76 L 76,118 L 72,122 Z" fill="#3b2b21" opacity="0.6"/>
    <path d="M 122,72 L 122,122 L 72,122 L 76,118 L 118,118 L 118,76 Z" fill="#120c08" opacity="0.8"/>
    <line x1="88" y1="78" x2="88" y2="116" stroke="#1f1611" stroke-width="1.2"/>
    <line x1="104" y1="78" x2="104" y2="116" stroke="#1f1611" stroke-width="1.2"/>

    <!-- Gran Viga Horizontal de Roble Central (Y: 56 a 72) -->
    <rect x="0" y="56" width="${S}" height="16" fill="#382416"/>
    <line x1="0" y1="56" x2="${S}" y2="56" stroke="#4f331f" stroke-width="1.5"/>
    <line x1="0" y1="72" x2="${S}" y2="72" stroke="#1a110a" stroke-width="2"/>
    <line x1="0" y1="62" x2="${S}" y2="62" stroke="#2c1c11" stroke-width="1" opacity="0.7"/>

    <!-- Gran Viga Vertical de Roble Central (X: 56 a 72) -->
    <rect x="56" y="0" width="16" height="${S}" fill="#332114"/>
    <line x1="56" y1="0" x2="56" y2="${S}" stroke="#4f331f" stroke-width="1.5"/>
    <line x1="72" y1="0" x2="72" y2="${S}" stroke="#1a110a" stroke-width="2"/>
    <line x1="62" y1="0" x2="62" y2="${S}" stroke="#2c1c11" stroke-width="1" opacity="0.7"/>

    <!-- Placa de unión de hierro forjado central con remaches -->
    <rect x="52" y="52" width="24" height="24" fill="#1c1917" stroke="#292524" stroke-width="1.5"/>
    <circle cx="64" cy="64" r="5" fill="#0c0a09" stroke="#44403c" stroke-width="1"/>
    <!-- 4 Remaches de forja en las esquinas de la placa -->
    <circle cx="56" cy="56" r="1.8" fill="#78716c"/>
    <circle cx="72" cy="56" r="1.8" fill="#78716c"/>
    <circle cx="56" cy="72" r="1.8" fill="#78716c"/>
    <circle cx="72" cy="72" r="1.8" fill="#78716c"/>
  `;
}

/**
 * Tile 25: Techo 3 — Losa cenital con fracturas tectónicas profundas y filtraciones minerales.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingCracked(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#181a20"/>
    <rect x="2" y="2" width="${S - 4}" height="${S - 4}" fill="#22252c"/>

    <!-- Bisel perimetral -->
    <path d="M 0,0 L ${S},0 L ${S - 4},4 L 4,4 L 4,${S - 4} L 0,${S} Z" fill="#2d323b" opacity="0.5"/>
    <path d="M ${S},0 L ${S},${S} L 0,${S} L 4,${S - 4} L ${S - 4},${S - 4} L ${S - 4},4 Z" fill="#0d0e12" opacity="0.8"/>

    <!-- Hiladas base de losa con juntas rústicas -->
    <line x1="0" y1="42" x2="${S}" y2="42" stroke="#121418" stroke-width="3"/>
    <line x1="0" y1="86" x2="${S}" y2="86" stroke="#121418" stroke-width="3"/>
    <line x1="64" y1="0" x2="64" y2="42" stroke="#121418" stroke-width="2.5"/>
    <line x1="48" y1="42" x2="48" y2="86" stroke="#121418" stroke-width="2.5"/>
    <line x1="84" y1="86" x2="84" y2="${S}" stroke="#121418" stroke-width="2.5"/>

    <!-- Gran fractura tectónica cenital con sombra y realce lumínico -->
    <!-- Sombra profunda -->
    <g stroke="#090a0d" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 18,6 L 32,24 L 28,42 L 48,56 L 62,50 L 78,68 L 88,96 L 76,118 L 82,128"/>
      <path d="M 48,56 L 68,64 L 94,60 L 112,74"/>
      <path d="M 28,42 L 14,48 L 4,66"/>
      <path d="M 78,68 L 70,84 L 54,94"/>
    </g>

    <!-- Bisel de fractura 3D de piedra quebrada -->
    <g stroke="#4b5563" stroke-width="1.1" fill="none" opacity="0.65" stroke-linecap="round">
      <path d="M 19,6 L 33,24 L 29,42 L 49,56 L 63,50 L 79,68 L 89,96 L 77,118 L 83,128"/>
      <path d="M 49,56 L 69,64 L 95,60 L 113,74"/>
    </g>

    <!-- Manchas de humedad y filtración mineral de mazmorra -->
    <g fill="#0e1014" opacity="0.5">
      <ellipse cx="48" cy="56" rx="14" ry="10"/>
      <ellipse cx="78" cy="68" rx="12" ry="8"/>
      <ellipse cx="28" cy="42" rx="10" ry="8"/>
    </g>

    <!-- Depósitos de caliza/salitre y micro-estalactitas incipientes -->
    <g fill="#94a3b8" opacity="0.7">
      <circle cx="32" cy="24" r="2"/>
      <circle cx="48" cy="56" r="2.5"/>
      <circle cx="68" cy="64" r="2"/>
      <circle cx="78" cy="68" r="2.2"/>
      <circle cx="88" cy="96" r="2"/>
      <circle cx="76" cy="118" r="1.8"/>
      <!-- Gotas de condensación translúcidas -->
      <circle cx="48" cy="59" r="1.2" fill="#e2e8f0"/>
      <circle cx="78" cy="71" r="1.1" fill="#e2e8f0"/>
    </g>
  `;
}

/**
 * Tile 26: Techo 4 — Bóveda con musgo colgante, moho umbrío y humedad subterránea.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingMossy(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#181a20"/>
    <rect x="2" y="2" width="${S - 4}" height="${S - 4}" fill="#20242a"/>

    <!-- Juntas de cantería cenital -->
    <line x1="0" y1="42" x2="${S}" y2="42" stroke="#121418" stroke-width="3"/>
    <line x1="0" y1="86" x2="${S}" y2="86" stroke="#121418" stroke-width="3"/>
    <line x1="64" y1="0" x2="64" y2="42" stroke="#121418" stroke-width="2.5"/>
    <line x1="32" y1="42" x2="32" y2="86" stroke="#121418" stroke-width="2.5"/>
    <line x1="96" y1="42" x2="96" y2="86" stroke="#121418" stroke-width="2.5"/>
    <line x1="64" y1="86" x2="64" y2="${S}" stroke="#121418" stroke-width="2.5"/>

    <!-- Capa 1: Humedad oscura umbría acumulada en grietas y juntas -->
    <g fill="#14532d" opacity="0.85">
      <ellipse cx="64" cy="42" rx="28" ry="12"/>
      <ellipse cx="32" cy="86" rx="22" ry="10"/>
      <ellipse cx="96" cy="42" rx="20" ry="9"/>
      <ellipse cx="48" cy="64" rx="16" ry="14"/>
      <ellipse cx="88" cy="86" rx="24" ry="11"/>
      <ellipse cx="20" cy="24" rx="14" ry="12"/>
      <ellipse cx="108" cy="104" rx="15" ry="12"/>
    </g>

    <!-- Capa 2: Musgo vivo verde bosque que se adhiere al techo -->
    <g fill="#16a34a" opacity="0.9">
      <circle cx="64" cy="42" r="8"/>
      <circle cx="56" cy="40" r="5.5"/>
      <circle cx="72" cy="44" r="6"/>
      <circle cx="32" cy="86" r="7"/>
      <circle cx="26" cy="84" r="5"/>
      <circle cx="38" cy="88" r="4.5"/>
      <circle cx="48" cy="64" r="7.5"/>
      <circle cx="88" cy="86" r="8"/>
      <circle cx="94" cy="84" r="5"/>
      <circle cx="20" cy="24" r="6"/>
      <circle cx="108" cy="104" r="6.5"/>
    </g>

    <!-- Capa 3: Brotes y esporas claras de líquenes colgantes -->
    <g fill="#4ade80" opacity="0.75">
      <circle cx="64" cy="44" r="2.2"/>
      <circle cx="58" cy="38" r="1.8"/>
      <circle cx="70" cy="42" r="1.6"/>
      <circle cx="32" cy="88" r="2"/>
      <circle cx="28" cy="82" r="1.5"/>
      <circle cx="48" cy="66" r="2.4"/>
      <circle cx="88" cy="88" r="2.2"/>
      <circle cx="92" cy="82" r="1.7"/>
      <circle cx="20" cy="26" r="1.8"/>
      <circle cx="108" cy="106" r="2"/>
    </g>

    <!-- Gotas de agua pura condensadas a punto de caer -->
    <g fill="#e0f2fe" opacity="0.85">
      <circle cx="64" cy="47" r="1.5"/>
      <circle cx="32" cy="91" r="1.4"/>
      <circle cx="48" cy="69" r="1.6"/>
      <circle cx="88" cy="91" r="1.5"/>
      <circle cx="20" cy="29" r="1.2"/>
    </g>
  `;
}

/**
 * Tile 27: Techo 5 — Clave de bóveda arcana con círculo rúnico de contención tectónica.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingRunic(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#16181e"/>
    <rect x="2" y="2" width="${S - 4}" height="${S - 4}" fill="#20232a"/>

    <!-- Bisel perimetral y ménsulas angulares de soporte -->
    <path d="M 0,0 L ${S},0 L ${S - 6},6 L 6,6 L 6,${S - 6} L 0,${S} Z" fill="#2d323b" opacity="0.6"/>
    <path d="M ${S},0 L ${S},${S} L 0,${S} L 6,${S - 6} L ${S - 6},${S - 6} L ${S - 6},6 Z" fill="#0d0e12" opacity="0.85"/>

    <!-- Ménsulas angulares talladas en sillar noble -->
    <g fill="#272b34" stroke="#121418" stroke-width="1.5">
      <polygon points="6,6 26,6 6,26"/>
      <polygon points="122,6 102,6 122,26"/>
      <polygon points="6,122 26,122 6,102"/>
      <polygon points="122,122 102,122 122,102"/>
    </g>

    <!-- Círculo rúnico arcano concéntrico -->
    <circle cx="64" cy="64" r="46" fill="none" stroke="#0f1115" stroke-width="3"/>
    <circle cx="64" cy="64" r="46" fill="none" stroke="#4b5563" stroke-width="1.2" opacity="0.7"/>

    <circle cx="64" cy="64" r="34" fill="none" stroke="#0f1115" stroke-width="2.5"/>
    <circle cx="64" cy="64" r="34" fill="none" stroke="#d97706" stroke-width="1.4" opacity="0.75"/>

    <!-- Cuadrado inscrito girado a 45 grados (octagrama de soporte) -->
    <rect x="42" y="42" width="44" height="44" fill="none" stroke="#0f1115" stroke-width="2"/>
    <rect x="42" y="42" width="44" height="44" fill="none" stroke="#4b5563" stroke-width="1" opacity="0.6"/>
    <g transform="rotate(45 64 64)">
      <rect x="42" y="42" width="44" height="44" fill="none" stroke="#0f1115" stroke-width="2"/>
      <rect x="42" y="42" width="44" height="44" fill="none" stroke="#f59e0b" stroke-width="1.2" opacity="0.75"/>
    </g>

    <!-- Clave central de contención con núcleo ámbar cálido -->
    <circle cx="64" cy="64" r="14" fill="#1c1f26" stroke="#0f1115" stroke-width="2"/>
    <circle cx="64" cy="64" r="14" fill="none" stroke="#d97706" stroke-width="1.2" opacity="0.85"/>
    <circle cx="64" cy="64" r="8" fill="#d97706" opacity="0.3"/>
    <circle cx="64" cy="64" r="5" fill="#fef08a" opacity="0.85"/>
    <circle cx="64" cy="64" r="2.5" fill="#ffffff"/>

    <!-- 4 Glifos cardinales rúnicos en relieve -->
    <g fill="#f59e0b" opacity="0.8">
      <circle cx="64" cy="24" r="2.2"/>
      <circle cx="64" cy="104" r="2.2"/>
      <circle cx="24" cy="64" r="2.2"/>
      <circle cx="104" cy="64" r="2.2"/>
    </g>
  `;
}

export const ceilingSprites = {
  ceilingVault,
  ceilingCoffered,
  ceilingCracked,
  ceilingMossy,
  ceilingRunic
};
