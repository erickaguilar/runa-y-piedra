// src/render/textures/ceilings.js

/**
 * Genera la estructura base unificada para todos los sprites de techo:
 * piedra oscura de sillar cenital, bisel de profundidad perimetral,
 * juntas de mampostería en 4 cuadrantes, nervaduras diagonales cruzadas
 * (arcos fajones de crucería de ojiva) y clave central circular tallada en relieve.
 * Comparte la misma filosofía que los pilares y la lava: estructura común idéntica
 * con ligeros cambios/detalles distintivos en el interior de cada variante.
 *
 * @param {number} S - Tamaño de celda en píxeles (default: 128).
 * @returns {string} Fragmento SVG base unificado.
 */
function createCeilingBaseSvg(S = 128) {
  return `
    <!-- Fondo base: Piedra oscura de sillar cenital unificada -->
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
 * Tile 23: Techo 1 — Bóveda Gótica de Crucería / Base Limpia.
 * Estructura base unificada con relieve de aristas, nervaduras y micro-desgaste mineral sutil.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingVault(S = 128) {
  return `
    ${createCeilingBaseSvg(S)}

    <!-- Detalle Característico 1: Micro-desgaste de cantería y textura mineral sutil -->
    <g fill="#4b5563" opacity="0.4">
      <circle cx="48" cy="28" r="1.5"/><circle cx="80" cy="28" r="1.2"/>
      <circle cx="28" cy="48" r="1.2"/><circle cx="28" cy="80" r="1.5"/>
      <circle cx="100" cy="48" r="1.5"/><circle cx="100" cy="80" r="1.2"/>
      <circle cx="48" cy="100" r="1.2"/><circle cx="80" cy="100" r="1.5"/>
    </g>
  `;
}

/**
 * Tile 24: Techo 2 — Bóveda con Refuerzos de Hierro Forjado y Herrajes.
 * Misma base unificada enriquecida con placa de unión central de forja y remaches en dovelas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingCoffered(S = 128) {
  return `
    ${createCeilingBaseSvg(S)}

    <!-- Detalle Característico 2: Placa de unión de hierro forjado y remaches en clave y dovelas -->
    <!-- Placa cuadrada de forja sobre la clave central -->
    <rect x="52" y="52" width="24" height="24" fill="#1c1917" stroke="#3b4252" stroke-width="1.5"/>
    <circle cx="64" cy="64" r="5" fill="#0d0e12" stroke="#4c566a" stroke-width="1"/>
    <circle cx="64" cy="64" r="2" fill="#78716c"/>
    <!-- 4 Remaches de forja en las esquinas de la placa central -->
    <circle cx="56" cy="56" r="1.8" fill="#9ca3af" stroke="#121418" stroke-width="0.8"/>
    <circle cx="72" cy="56" r="1.8" fill="#9ca3af" stroke="#121418" stroke-width="0.8"/>
    <circle cx="56" cy="72" r="1.8" fill="#9ca3af" stroke="#121418" stroke-width="0.8"/>
    <circle cx="72" cy="72" r="1.8" fill="#9ca3af" stroke="#121418" stroke-width="0.8"/>

    <!-- Abrazaderas metálicas con remaches en las 4 dovelas angulares -->
    <rect x="32" y="32" width="8" height="8" fill="#1c1917" stroke="#3b4252" stroke-width="1"/>
    <circle cx="36" cy="36" r="1.5" fill="#9ca3af"/>
    <rect x="88" y="32" width="8" height="8" fill="#1c1917" stroke="#3b4252" stroke-width="1"/>
    <circle cx="92" cy="36" r="1.5" fill="#9ca3af"/>
    <rect x="32" y="88" width="8" height="8" fill="#1c1917" stroke="#3b4252" stroke-width="1"/>
    <circle cx="36" cy="92" r="1.5" fill="#9ca3af"/>
    <rect x="88" y="88" width="8" height="8" fill="#1c1917" stroke="#3b4252" stroke-width="1"/>
    <circle cx="92" cy="92" r="1.5" fill="#9ca3af"/>
  `;
}

/**
 * Tile 25: Techo 3 — Bóveda con Fisuras Tectónicas y Filtraciones Minerales.
 * Misma base unificada con fracturas que cruzan nervaduras, halo de humedad y gotas de condensación.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingCracked(S = 128) {
  return `
    ${createCeilingBaseSvg(S)}

    <!-- Detalle Característico 3: Fracturas tectónicas profundas, filtración mineral y condensación -->
    <g stroke="#090a0d" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 18,12 L 28,26 L 36,36 L 46,50 L 64,64 L 74,78 L 86,90 L 98,106 L 110,118"/>
      <path d="M 46,50 L 58,46 L 72,52 L 88,48"/>
      <path d="M 74,78 L 70,92 L 56,102"/>
      <path d="M 28,26 L 16,34 L 8,48"/>
    </g>

    <!-- Bisel de fractura 3D de piedra quebrada -->
    <g stroke="#4b5563" stroke-width="0.9" fill="none" opacity="0.7" stroke-linecap="round">
      <path d="M 19,12 L 29,26 L 37,36 L 47,50 L 65,64 L 75,78 L 87,90 L 99,106 L 111,118"/>
      <path d="M 47,50 L 59,46 L 73,52 L 89,48"/>
    </g>

    <!-- Manchas de humedad oscura acumulada en las fisuras -->
    <g fill="#0e1014" opacity="0.55">
      <ellipse cx="46" cy="50" rx="10" ry="7"/>
      <ellipse cx="74" cy="78" rx="9" ry="6"/>
      <ellipse cx="64" cy="64" rx="8" ry="8"/>
    </g>

    <!-- Depósitos de caliza/salitre y micro-gotas de condensación -->
    <g fill="#94a3b8" opacity="0.75">
      <circle cx="28" cy="26" r="1.8"/>
      <circle cx="46" cy="50" r="2.2"/>
      <circle cx="74" cy="78" r="2"/>
      <circle cx="86" cy="90" r="1.8"/>
      <!-- Gotas translúcidas a punto de desprenderse -->
      <circle cx="46" cy="53" r="1.2" fill="#e2e8f0"/>
      <circle cx="74" cy="81" r="1.1" fill="#e2e8f0"/>
    </g>
  `;
}

/**
 * Tile 26: Techo 4 — Bóveda con Musgo Colgante y Moho Umbrío.
 * Misma base unificada con vegetación descendente en 3 capas botánicas y gotas de agua suspendidas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingMossy(S = 128) {
  return `
    ${createCeilingBaseSvg(S)}

    <!-- Detalle Característico 4: Colonización vegetal cenital en 3 capas botánicas y gotas de agua -->
    <!-- Capa 1: Humedad umbría profunda verde oscura -->
    <g fill="#14532d" opacity="0.85">
      <ellipse cx="64" cy="64" rx="18" ry="18"/>
      <ellipse cx="36" cy="36" rx="14" ry="10"/>
      <ellipse cx="92" cy="36" rx="13" ry="9"/>
      <ellipse cx="36" cy="92" rx="13" ry="9"/>
      <ellipse cx="92" cy="92" rx="14" ry="10"/>
      <ellipse cx="64" cy="30" rx="12" ry="7"/>
      <ellipse cx="64" cy="98" rx="12" ry="7"/>
    </g>

    <!-- Capa 2: Musgo vivo verde bosque -->
    <g fill="#16a34a" opacity="0.9">
      <circle cx="64" cy="64" r="10"/>
      <circle cx="58" cy="60" r="6"/>
      <circle cx="70" cy="68" r="5.5"/>
      <circle cx="36" cy="36" r="6"/>
      <circle cx="92" cy="36" r="5.5"/>
      <circle cx="36" cy="92" r="5.5"/>
      <circle cx="92" cy="92" r="6"/>
      <circle cx="64" cy="30" r="5"/>
      <circle cx="64" cy="98" r="5"/>
    </g>

    <!-- Capa 3: Brotes y esporas claras de líquenes -->
    <g fill="#4ade80" opacity="0.75">
      <circle cx="64" cy="66" r="2.2"/>
      <circle cx="56" cy="58" r="1.6"/>
      <circle cx="72" cy="70" r="1.8"/>
      <circle cx="36" cy="38" r="1.8"/>
      <circle cx="92" cy="38" r="1.8"/>
      <circle cx="36" cy="94" r="1.8"/>
      <circle cx="92" cy="94" r="1.8"/>
      <circle cx="64" cy="32" r="1.6"/>
      <circle cx="64" cy="100" r="1.6"/>
    </g>

    <!-- Gotas de condensación translúcidas -->
    <g fill="#e0f2fe" opacity="0.85">
      <circle cx="64" cy="74" r="1.5"/>
      <circle cx="36" cy="44" r="1.3"/>
      <circle cx="92" cy="44" r="1.3"/>
      <circle cx="36" cy="100" r="1.3"/>
      <circle cx="92" cy="100" r="1.3"/>
    </g>
  `;
}

/**
 * Tile 27: Techo 5 — Bóveda con Inscripción Rúnica de Contención Arcana.
 * Misma base unificada con octagrama místico grabado, núcleo ámbar cálido y glifos cardinales.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingRunic(S = 128) {
  return `
    ${createCeilingBaseSvg(S)}

    <!-- Detalle Característico 5: Inscripción rúnica arcana, octagrama de contención y núcleo ámbar -->
    <!-- Círculo rúnico exterior grabado alrededor de la clave -->
    <circle cx="64" cy="64" r="30" fill="none" stroke="#0f1115" stroke-width="2.5"/>
    <circle cx="64" cy="64" r="30" fill="none" stroke="#d97706" stroke-width="1.2" opacity="0.75"/>

    <circle cx="64" cy="64" r="22" fill="none" stroke="#0f1115" stroke-width="2"/>
    <circle cx="64" cy="64" r="22" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.8"/>

    <!-- Octagrama de soporte místico inscrito -->
    <rect x="50" y="50" width="28" height="28" fill="none" stroke="#d97706" stroke-width="1" opacity="0.7"/>
    <g transform="rotate(45 64 64)">
      <rect x="50" y="50" width="28" height="28" fill="none" stroke="#f59e0b" stroke-width="1.2" opacity="0.85"/>
    </g>

    <!-- Núcleo ámbar incandescente en el centro de la clave de bóveda -->
    <circle cx="64" cy="64" r="8" fill="#d97706" opacity="0.35"/>
    <circle cx="64" cy="64" r="5" fill="#fef08a" opacity="0.9"/>
    <circle cx="64" cy="64" r="2.2" fill="#ffffff"/>

    <!-- 4 Glifos cardinales rúnicos en los plementos -->
    <g fill="#f59e0b" opacity="0.85">
      <circle cx="64" cy="22" r="2"/>
      <circle cx="64" cy="106" r="2"/>
      <circle cx="22" cy="64" r="2"/>
      <circle cx="106" cy="64" r="2"/>
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
