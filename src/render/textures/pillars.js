// src/render/textures/pillars.js

/**
 * Tile 10: Pilar de Cripta Regular (pillarRegular)
 * Fuste acanalado con estrías de cantería, biselado de curvatura cilíndrica,
 * junta de tambor intermedia y escurrimientos de óxido continuo estilo Heretic.
 * Ranuras verticales e intermedias ultrafinas de 1 px para máxima definición de cantería.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarRegular(S = 128) {
  return `
    <!-- Fondo de mortero carbón (se apreciará como finas ranuras de 1px) -->
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- Penumbra lateral externa continua (sin marcos negros en x=0 y x=128) -->
    <rect x="0" y="1" width="14" height="62" fill="#1c1917"/>
    <rect x="0" y="64" width="14" height="63" fill="#1c1917"/>
    <rect x="114" y="1" width="14" height="62" fill="#141210"/>
    <rect x="114" y="64" width="14" height="63" fill="#141210"/>

    <!-- TAMBOR SUPERIOR (y=1 a 63) -->
    <!-- Estría lateral izquierda (x=15..44, ranura de 1px en x=14) -->
    <rect x="15" y="1" width="29" height="62" fill="#383431"/>
    <line x1="15" y1="1" x2="44" y2="1" stroke="#65605b" stroke-width="1.5" opacity="0.6"/>
    <line x1="15" y1="1" x2="15" y2="63" stroke="#65605b" stroke-width="1.2" opacity="0.6"/>
    <line x1="15" y1="63" x2="44" y2="63" stroke="#1c1917" stroke-width="1.5"/>

    <!-- Estría central frontal (x=45..83, ranura de 1px en x=44) -->
    <rect x="45" y="1" width="38" height="62" fill="#44403c"/>
    <line x1="45" y1="1" x2="83" y2="1" stroke="#78716c" stroke-width="1.8" opacity="0.75"/>
    <line x1="45" y1="1" x2="45" y2="63" stroke="#78716c" stroke-width="1.5" opacity="0.7"/>
    <line x1="83" y1="1" x2="83" y2="63" stroke="#1c1917" stroke-width="1.5"/>
    <line x1="45" y1="63" x2="83" y2="63" stroke="#1c1917" stroke-width="1.5"/>

    <!-- Estría lateral derecha (x=84..113, ranura de 1px en x=83 y x=113) -->
    <rect x="84" y="1" width="29" height="62" fill="#302c29"/>
    <line x1="84" y1="1" x2="113" y2="1" stroke="#57534e" stroke-width="1.5" opacity="0.5"/>
    <line x1="84" y1="1" x2="84" y2="63" stroke="#57534e" stroke-width="1.2" opacity="0.5"/>
    <line x1="113" y1="1" x2="113" y2="63" stroke="#141210" stroke-width="1.5"/>
    <line x1="84" y1="63" x2="113" y2="63" stroke="#141210" stroke-width="1.5"/>

    <!-- TAMBOR INFERIOR (y=64 a 127, ranura horizontal intermedia de 1px en y=63) -->
    <!-- Estría lateral izquierda -->
    <rect x="15" y="64" width="29" height="63" fill="#383431"/>
    <line x1="15" y1="64" x2="44" y2="64" stroke="#65605b" stroke-width="1.5" opacity="0.55"/>
    <line x1="15" y1="64" x2="15" y2="127" stroke="#65605b" stroke-width="1.2" opacity="0.55"/>
    <line x1="15" y1="127" x2="44" y2="127" stroke="#1c1917" stroke-width="1.5"/>

    <!-- Estría central frontal -->
    <rect x="45" y="64" width="38" height="63" fill="#44403c"/>
    <line x1="45" y1="64" x2="83" y2="64" stroke="#78716c" stroke-width="1.8" opacity="0.7"/>
    <line x1="45" y1="64" x2="45" y2="127" stroke="#78716c" stroke-width="1.5" opacity="0.65"/>
    <line x1="83" y1="64" x2="83" y2="127" stroke="#1c1917" stroke-width="1.5"/>
    <line x1="45" y1="127" x2="83" y2="127" stroke="#1c1917" stroke-width="1.5"/>

    <!-- Estría lateral derecha -->
    <rect x="84" y="64" width="29" height="63" fill="#302c29"/>
    <line x1="84" y1="64" x2="113" y2="64" stroke="#57534e" stroke-width="1.5" opacity="0.45"/>
    <line x1="84" y1="64" x2="84" y2="127" stroke="#57534e" stroke-width="1.2" opacity="0.45"/>
    <line x1="113" y1="64" x2="113" y2="127" stroke="#141210" stroke-width="1.5"/>
    <line x1="84" y1="127" x2="113" y2="127" stroke="#141210" stroke-width="1.5"/>

    <!-- Escurrimientos verticales de óxido continuo que bajan por las ranuras de 1px -->
    <g fill="#78350f" opacity="0.5">
      <path d="M 44,1 L 45,1 L 45,36 L 44,44 Z"/>
      <path d="M 83,1 L 84,1 L 84,28 L 83,34 Z"/>
      <path d="M 44,64 L 45,64 L 45,102 L 44,110 Z"/>
      <path d="M 83,64 L 84,64 L 84,96 L 83,104 Z"/>
      <path d="M 62,1 L 64,1 L 65,22 L 63,28 L 62,18 Z"/>
    </g>

    <!-- Piqueteado fino de cincel -->
    <g fill="#1c1917" opacity="0.6">
      <rect x="24" y="18" width="3" height="2"/>
      <rect x="58" y="24" width="3" height="3"/>
      <rect x="96" y="20" width="3" height="2"/>
      <rect x="28" y="88" width="3" height="3"/>
      <rect x="64" y="94" width="3" height="2"/>
      <rect x="98" y="82" width="2" height="3"/>
    </g>
  `;
}

/**
 * Tile 12: Pilar con Soporte de Antorcha (pillarTorch)
 * Soporte de hierro forjado clavado en el sillar central con anillo de sujeción,
 * remaches y mancha vertical de hollín negro ascendente. Ranuras de 1 px.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarTorch(S = 128) {
  return `
    <!-- Estructura base del pilar con ranuras de 1px -->
    <rect width="${S}" height="${S}" fill="#0c0a09"/>
    <rect x="0" y="1" width="14" height="62" fill="#1c1917"/>
    <rect x="0" y="64" width="14" height="63" fill="#1c1917"/>
    <rect x="114" y="1" width="14" height="62" fill="#141210"/>
    <rect x="114" y="64" width="14" height="63" fill="#141210"/>

    <rect x="15" y="1" width="29" height="62" fill="#383431"/>
    <rect x="45" y="1" width="38" height="62" fill="#44403c"/>
    <rect x="84" y="1" width="29" height="62" fill="#302c29"/>

    <rect x="15" y="64" width="29" height="63" fill="#383431"/>
    <rect x="45" y="64" width="38" height="63" fill="#44403c"/>
    <rect x="84" y="64" width="29" height="63" fill="#302c29"/>

    <line x1="15" y1="1" x2="113" y2="1" stroke="#78716c" stroke-width="1.8" opacity="0.6"/>
    <line x1="15" y1="64" x2="113" y2="64" stroke="#78716c" stroke-width="1.8" opacity="0.5"/>

    <!-- Mancha vertical de hollín y humo sobre la antorcha -->
    <path d="M 52,56 C 50,30 46,12 64,2 C 82,12 78,30 76,56 Z" fill="#020617" opacity="0.7"/>
    <path d="M 56,54 C 54,36 52,18 64,6 C 76,18 74,36 72,54 Z" fill="#0c0a09" opacity="0.85"/>

    <!-- SOPORTE DE HIERRO FORJADO / APLIQUE MEDIEVAL -->
    <!-- Placa base de hierro clavada al sillar central -->
    <rect x="59" y="52" width="10" height="34" rx="1" fill="#18181b"/>
    <rect x="60" y="53" width="8" height="32" fill="#27272a"/>
    <line x1="60" y1="53" x2="67" y2="53" stroke="#52525b" stroke-width="1.2"/>

    <!-- Clavos de fijación cuadrados -->
    <rect x="62" y="55" width="4" height="4" fill="#0c0a09"/>
    <rect x="63" y="56" width="2" height="2" fill="#71717a"/>
    <rect x="62" y="79" width="4" height="4" fill="#0c0a09"/>
    <rect x="63" y="80" width="2" height="2" fill="#71717a"/>

    <!-- Brazo angular del soporte -->
    <path d="M 64,64 L 64,74 L 72,70 Z" fill="#18181b"/>
    <path d="M 63,65 L 63,73 L 70,70 Z" fill="#3f3f46"/>

    <!-- Anillo / Casquillo receptor de la antorcha -->
    <ellipse cx="64" cy="62" rx="9" ry="5" fill="#0c0a09"/>
    <ellipse cx="64" cy="61" rx="8" ry="4" fill="#27272a" stroke="#52525b" stroke-width="1.2"/>
    <ellipse cx="64" cy="61" rx="5" ry="2.2" fill="#0c0a09"/>

    <!-- Vástago inferior de refuerzo curvado -->
    <path d="M 64,74 Q 64,88 56,92" stroke="#18181b" stroke-width="3" fill="none"/>
    <path d="M 64,74 Q 64,88 56,92" stroke="#3f3f46" stroke-width="1.5" fill="none"/>

    <!-- Escurrimiento de óxido bajo la placa de hierro -->
    <path d="M 62,86 L 66,86 L 65,114 L 63,114 Z" fill="#78350f" opacity="0.5"/>
  `;
}

/**
 * Tile 20: Pilar con Moho y Podredumbre (pillarMossy)
 * Humedad estancada, líquenes y esporas luminiscentes acumulándose en las estrías y junta central. Ranuras de 1 px.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarMossy(S = 128) {
  return `
    <!-- Base de pilar con ranuras de 1px -->
    <rect width="${S}" height="${S}" fill="#0c0a09"/>
    <rect x="0" y="1" width="14" height="62" fill="#1c1917"/>
    <rect x="0" y="64" width="14" height="63" fill="#1c1917"/>
    <rect x="114" y="1" width="14" height="62" fill="#141210"/>
    <rect x="114" y="64" width="14" height="63" fill="#141210"/>

    <rect x="15" y="1" width="29" height="62" fill="#383431"/>
    <rect x="45" y="1" width="38" height="62" fill="#44403c"/>
    <rect x="84" y="1" width="29" height="62" fill="#302c29"/>

    <rect x="15" y="64" width="29" height="63" fill="#383431"/>
    <rect x="45" y="64" width="38" height="63" fill="#44403c"/>
    <rect x="84" y="64" width="29" height="63" fill="#302c29"/>

    <line x1="15" y1="1" x2="113" y2="1" stroke="#78716c" stroke-width="1.8" opacity="0.4"/>
    <line x1="15" y1="64" x2="113" y2="64" stroke="#78716c" stroke-width="1.8" opacity="0.4"/>

    <!-- Manchas oscuras de filtración en las canaladuras -->
    <path d="M 12,65 Q 24,45 34,65 Q 44,92 24,96 Q 10,88 12,65 Z" fill="#020617" opacity="0.6"/>
    <path d="M 78,65 Q 92,44 104,65 Q 114,94 92,98 Q 76,88 78,65 Z" fill="#020617" opacity="0.6"/>

    <!-- Capa 1: Moho verde oscuro de catacumba -->
    <g fill="#14532d" opacity="0.9">
      <circle cx="16" cy="65" r="7"/><circle cx="26" cy="67" r="8"/><circle cx="36" cy="63" r="6"/>
      <circle cx="86" cy="65" r="8"/><circle cx="98" cy="68" r="7"/><circle cx="108" cy="64" r="6"/>
      <circle cx="44" cy="38" r="5"/><circle cx="46" cy="94" r="6"/>
    </g>

    <!-- Capa 2: Manchas de hongos y líquenes marchitos -->
    <g fill="#3f6212">
      <circle cx="15" cy="63" r="5"/><circle cx="25" cy="65" r="6"/><circle cx="35" cy="61" r="4.5"/>
      <circle cx="85" cy="63" r="6"/><circle cx="97" cy="66" r="5.5"/><circle cx="106" cy="62" r="4.5"/>
      <circle cx="43" cy="36" r="3.5"/><circle cx="45" cy="92" r="4"/>
    </g>

    <!-- Capa 3: Esporas luminiscentes -->
    <g fill="#65a30d" opacity="0.8">
      <circle cx="14" cy="61" r="2.2"/><circle cx="23" cy="63" r="2.8"/>
      <circle cx="84" cy="61" r="2.5"/><circle cx="95" cy="64" r="2.4"/>
      <circle cx="42" cy="34" r="2"/>
    </g>

    <!-- Escurrimiento viscoso en la junta central -->
    <path d="M 26,74 L 28,74 L 27,104 L 26,104 Z" fill="#14532d" opacity="0.7"/>
    <path d="M 94,74 L 96,74 L 95,108 L 94,108 Z" fill="#14532d" opacity="0.7"/>
  `;
}

/**
 * Tile 21: Pilar Agrietado (pillarCracked)
 * El tambor de la columna sufre una fractura transversal severa que quiebra las estrías y genera desprendimientos. Ranuras de 1 px.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarCracked(S = 128) {
  return `
    <!-- Base estructural idéntica a Tile Regular con ranuras de 1px -->
    <rect width="${S}" height="${S}" fill="#0c0a09"/>
    <rect x="0" y="1" width="14" height="62" fill="#1c1917"/>
    <rect x="0" y="64" width="14" height="63" fill="#1c1917"/>
    <rect x="114" y="1" width="14" height="62" fill="#141210"/>
    <rect x="114" y="64" width="14" height="63" fill="#141210"/>

    <rect x="15" y="1" width="29" height="62" fill="#383431"/>
    <rect x="45" y="1" width="38" height="62" fill="#44403c"/>
    <rect x="84" y="1" width="29" height="62" fill="#302c29"/>

    <rect x="15" y="64" width="29" height="63" fill="#383431"/>
    <rect x="45" y="64" width="38" height="63" fill="#44403c"/>
    <rect x="84" y="64" width="29" height="63" fill="#302c29"/>

    <!-- Biseles superiores y medios -->
    <line x1="15" y1="1" x2="113" y2="1" stroke="#78716c" stroke-width="1.8" opacity="0.6"/>
    <line x1="15" y1="64" x2="113" y2="64" stroke="#78716c" stroke-width="1.8" opacity="0.5"/>

    <!-- Abismo interior de la fractura -->
    <path d="M 88,1 L 76,24 L 54,42 L 58,62 L 38,82 L 44,104 L 20,126" stroke="#000000" stroke-width="7" stroke-linecap="square" fill="none"/>
    
    <!-- Grieta principal oscura dentada -->
    <path d="M 88,1 L 77,24 L 55,42 L 59,62 L 39,82 L 45,104 L 21,126" stroke="#0c0a09" stroke-width="4.2" stroke-linejoin="bevel" fill="none"/>

    <!-- Filo iluminado de piedra fracturada -->
    <path d="M 90,1 L 79,24 L 57,42 L 61,62 L 41,82 L 47,104 L 23,126" stroke="#a8a29e" stroke-width="1.6" opacity="0.8" fill="none"/>

    <!-- Fisuras que cortan las canaladuras -->
    <path d="M 55,42 L 28,48" stroke="#0c0a09" stroke-width="2.6" fill="none"/>
    <path d="M 55,43 L 28,49" stroke="#78716c" stroke-width="1" opacity="0.7" fill="none"/>

    <path d="M 59,62 L 86,72" stroke="#0c0a09" stroke-width="2.6" fill="none"/>
    <path d="M 59,63 L 86,73" stroke="#78716c" stroke-width="1" opacity="0.7" fill="none"/>

    <!-- Fragmentos desprendidos en el canal medio -->
    <polygon points="45,60 50,60 45,67" fill="#0c0a09"/>
    <polygon points="46,61 49,61 46,65" fill="#57534e"/>
  `;
}

/**
 * Tile 22: Pilar Rúnico / Anillo Arcano (pillarRunic)
 * Collarín de cantería con medallón tallado, runa incandescente de azufre Heretic (#ea580c)
 * y núcleo ámbar con canales de energía vertical continuo. Ranuras de 1 px.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarRunic(S = 128) {
  return `
    <!-- Base de pilar regular con ranuras de 1px -->
    <rect width="${S}" height="${S}" fill="#0c0a09"/>
    <rect x="0" y="1" width="14" height="126" fill="#1c1917"/>
    <rect x="114" y="1" width="14" height="126" fill="#141210"/>

    <rect x="15" y="1" width="29" height="126" fill="#383431"/>
    <rect x="45" y="1" width="38" height="126" fill="#44403c"/>
    <rect x="84" y="1" width="29" height="126" fill="#302c29"/>

    <line x1="15" y1="1" x2="113" y2="1" stroke="#78716c" stroke-width="1.8" opacity="0.5"/>
    <line x1="15" y1="126" x2="113" y2="126" stroke="#1c1917" stroke-width="1.8"/>

    <!-- COLLARÍN / ANILLO RÚNICO CENTRAL (y=40 a 88) -->
    <!-- Sombra del anillo proyectada sobre el fuste -->
    <rect x="6" y="38" width="116" height="52" fill="#0c0a09" opacity="0.7"/>
    
    <!-- Bloque macizo del anillo en bajorrelieve -->
    <rect x="8" y="40" width="112" height="48" rx="2" fill="#292524"/>
    <line x1="8" y1="40" x2="120" y2="40" stroke="#65605b" stroke-width="2" opacity="0.8"/>
    <line x1="8" y1="88" x2="120" y2="88" stroke="#141210" stroke-width="2"/>

    <!-- Medallón circular tallado en el collarín -->
    <circle cx="64" cy="64" r="22" fill="#1c1917" stroke="#0c0a09" stroke-width="2"/>
    <circle cx="64" cy="64" r="20" fill="none" stroke="#57534e" stroke-width="1.2" opacity="0.6"/>

    <!-- Surco tallado del glifo rúnico -->
    <polygon points="63,49 79,63 63,77 47,63" stroke="#0c0a09" stroke-width="3.5" fill="none"/>
    <line x1="63" y1="45" x2="63" y2="81" stroke="#0c0a09" stroke-width="3"/>
    <line x1="45" y1="63" x2="81" y2="63" stroke="#0c0a09" stroke-width="3"/>

    <!-- Filo iluminado del grabado -->
    <polygon points="65,51 81,65 65,79 49,65" stroke="#78716c" stroke-width="1.2" opacity="0.7" fill="none"/>

    <!-- Runa latente de azufre / fuego arcano (Heretic) -->
    <polygon points="64,50 80,64 64,78 48,64" stroke="#ea580c" stroke-width="1.8" fill="none"/>
    <line x1="64" y1="46" x2="64" y2="82" stroke="#ea580c" stroke-width="1.6"/>
    <line x1="46" y1="64" x2="82" y2="64" stroke="#ea580c" stroke-width="1.6"/>

    <!-- Núcleo incandescente -->
    <circle cx="64" cy="64" r="4.5" fill="#7f1d1d" stroke="#0c0a09" stroke-width="1"/>
    <circle cx="64" cy="64" r="2.5" fill="#f59e0b"/>
    <circle cx="63.5" cy="63.5" r="1" fill="#fef08a"/>

    <!-- Canales de energía vertical que bajan por el pilar de forma continua -->
    <line x1="64" y1="0" x2="64" y2="38" stroke="#ea580c" stroke-width="1.5" opacity="0.8"/>
    <line x1="64" y1="90" x2="64" y2="${S}" stroke="#ea580c" stroke-width="1.5" opacity="0.8"/>
    <line x1="64" y1="0" x2="64" y2="38" stroke="#fef08a" stroke-width="0.8" opacity="0.6"/>
    <line x1="64" y1="90" x2="64" y2="${S}" stroke="#fef08a" stroke-width="0.8" opacity="0.6"/>

    <!-- Remaches de fijación del anillo -->
    <rect x="16" y="62" width="4" height="4" fill="#0c0a09"/>
    <rect x="17" y="63" width="2" height="2" fill="#71717a"/>
    <rect x="108" y="62" width="4" height="4" fill="#0c0a09"/>
    <rect x="109" y="63" width="2" height="2" fill="#71717a"/>
  `;
}

// Compatibilidad retroactiva de nombres
export const pillarMonolith = pillarRegular;
export const pillarFluted = pillarTorch;
export const pillarDark = pillarRunic;

export const pillarSprites = {
  pillarRegular,
  pillarCracked,
  pillarTorch,
  pillarMossy,
  pillarRunic,
  // Alias de compatibilidad
  pillarMonolith,
  pillarFluted,
  pillarDark
};
