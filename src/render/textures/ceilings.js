// src/render/textures/ceilings.js

/**
 * Tile 23: Techo Regular / Casetón de Bóveda Gris Claro (ceilingVault / ceilingClean)
 * Cuatro losas pesadas de cantería gris claro (#8a929d, #78808c, #6c7480, #7f8793) con casetón interior rehundido
 * (#747c88, #68707c, #5c6470, #6e7682), biseles de 1 px (#d1d5db, #b0b7c1) y hollín tenue disperso.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingVault(S = 128) {
  return `
    <!-- Mortero carbón de 2px de fondo -->
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- Losa 1: Superior Izquierda (Gris claro cenital) -->
    <rect x="1" y="1" width="62" height="62" fill="#8a929d"/>
    <line x1="2" y1="2" x2="62" y2="2" stroke="#374151" stroke-width="1"/>
    <line x1="2" y1="2" x2="2" y2="62" stroke="#374151" stroke-width="1"/>
    <line x1="2" y1="62" x2="62" y2="62" stroke="#d1d5db" stroke-width="1" opacity="0.85"/>
    <line x1="62" y1="2" x2="62" y2="62" stroke="#d1d5db" stroke-width="1" opacity="0.85"/>
    <!-- Rebaje de casetón interior de 1px -->
    <rect x="8" y="8" width="48" height="48" fill="#747c88" stroke="#0c0a09" stroke-width="1"/>
    <line x1="9" y1="56" x2="56" y2="56" stroke="#b0b7c1" stroke-width="1" opacity="0.7"/>
    <line x1="56" y1="9" x2="56" y2="56" stroke="#b0b7c1" stroke-width="1" opacity="0.7"/>

    <!-- Losa 2: Superior Derecha (Gris medio) -->
    <rect x="65" y="1" width="62" height="62" fill="#78808c"/>
    <line x1="66" y1="2" x2="126" y2="2" stroke="#374151" stroke-width="1"/>
    <line x1="66" y1="2" x2="66" y2="62" stroke="#374151" stroke-width="1"/>
    <line x1="66" y1="62" x2="126" y2="62" stroke="#b0b7c1" stroke-width="1" opacity="0.8"/>
    <line x1="126" y1="2" x2="126" y2="62" stroke="#b0b7c1" stroke-width="1" opacity="0.8"/>
    <rect x="72" y="8" width="48" height="48" fill="#68707c" stroke="#0c0a09" stroke-width="1"/>
    <line x1="73" y1="56" x2="120" y2="56" stroke="#9ca3af" stroke-width="1" opacity="0.65"/>
    <line x1="120" y1="9" x2="120" y2="56" stroke="#9ca3af" stroke-width="1" opacity="0.65"/>

    <!-- Losa 3: Inferior Izquierda (Gris basalto frío) -->
    <rect x="1" y="65" width="62" height="62" fill="#6c7480"/>
    <line x1="2" y1="66" x2="62" y2="66" stroke="#2d333d" stroke-width="1"/>
    <line x1="2" y1="66" x2="2" y2="126" stroke="#2d333d" stroke-width="1"/>
    <line x1="2" y1="126" x2="62" y2="126" stroke="#9ca3af" stroke-width="1" opacity="0.75"/>
    <line x1="62" y1="66" x2="62" y2="126" stroke="#9ca3af" stroke-width="1" opacity="0.75"/>
    <rect x="8" y="72" width="48" height="48" fill="#5c6470" stroke="#0c0a09" stroke-width="1"/>
    <line x1="9" y1="120" x2="56" y2="120" stroke="#9ca3af" stroke-width="1" opacity="0.6"/>
    <line x1="56" y1="73" x2="56" y2="120" stroke="#9ca3af" stroke-width="1" opacity="0.6"/>

    <!-- Losa 4: Inferior Derecha (Gris cantería cálida suave) -->
    <rect x="65" y="65" width="62" height="62" fill="#7f8793"/>
    <line x1="66" y1="66" x2="126" y2="66" stroke="#374151" stroke-width="1"/>
    <line x1="66" y1="66" x2="66" y2="126" stroke="#374151" stroke-width="1"/>
    <line x1="66" y1="126" x2="126" y2="126" stroke="#b8bfc9" stroke-width="1" opacity="0.85"/>
    <line x1="126" y1="66" x2="126" y2="126" stroke="#b8bfc9" stroke-width="1" opacity="0.85"/>
    <rect x="72" y="72" width="48" height="48" fill="#6e7682" stroke="#0c0a09" stroke-width="1"/>
    <line x1="73" y1="120" x2="120" y2="120" stroke="#b0b7c1" stroke-width="1" opacity="0.7"/>
    <line x1="120" y1="73" x2="120" y2="120" stroke="#b0b7c1" stroke-width="1" opacity="0.7"/>

    <!-- Manchas tenues de hollín ascendente en la cruz central -->
    <ellipse cx="64" cy="64" rx="16" ry="14" fill="#0c0a09" opacity="0.35"/>
    <circle cx="32" cy="32" r="10" fill="#020617" opacity="0.2"/>

    <!-- Piqueteado mineral de cantero (1 a 2 px) -->
    <g fill="#374151" opacity="0.6">
      <rect x="22" y="24" width="2" height="2"/>
      <rect x="88" y="20" width="3" height="2"/>
      <rect x="26" y="86" width="2" height="2"/>
      <rect x="94" y="90" width="3" height="2"/>
    </g>
    <!-- Granos minerales claros de relieve -->
    <g fill="#d1d5db" opacity="0.75">
      <rect x="23" y="25" width="1" height="1"/>
      <rect x="89" y="21" width="1" height="1"/>
      <rect x="27" y="87" width="1" height="1"/>
      <rect x="95" y="91" width="1" height="1"/>
    </g>
  `;
}

/**
 * Tile 24: Techo con Reja de Hierro / Pozo Tragaluz (ceilingCoffered / ceilingGrate)
 * Abertura de ventilación hacia el abismo superior, enmarcada en cantería gris claro con barrotes de hierro y remaches.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingCoffered(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- Marco perimetral de piedra gris con 2px de junta -->
    <rect x="1" y="1" width="126" height="126" fill="#78808c"/>
    <!-- Bisel perimetral fino de 1px -->
    <line x1="2" y1="2" x2="126" y2="2" stroke="#374151" stroke-width="1"/>
    <line x1="2" y1="2" x2="2" y2="126" stroke="#374151" stroke-width="1"/>
    <line x1="2" y1="126" x2="126" y2="126" stroke="#d1d5db" stroke-width="1" opacity="0.8"/>
    <line x1="126" y1="2" x2="126" y2="126" stroke="#d1d5db" stroke-width="1" opacity="0.8"/>

    <!-- HUECO DEL POZO / ABISMO NEGRO (y=18 a 110, x=18 a 110) -->
    <rect x="18" y="18" width="92" height="92" fill="#000000"/>
    <!-- Sombra interior del marco de piedra sobre el foso -->
    <rect x="18" y="18" width="92" height="92" fill="none" stroke="#0c0a09" stroke-width="3"/>
    <path d="M 19,109 L 109,109 L 109,19" stroke="#9ca3af" stroke-width="1" fill="none" opacity="0.6"/>

    <!-- BARROTES DE HIERRO VERTICALES (3 barrotes espaciados) -->
    <!-- Barrote V1 (x=38) -->
    <rect x="36" y="18" width="6" height="92" fill="#18181b"/>
    <line x1="37" y1="18" x2="37" y2="110" stroke="#3f3f46" stroke-width="1"/>
    <line x1="41" y1="18" x2="41" y2="110" stroke="#0c0a09" stroke-width="1"/>

    <!-- Barrote V2 Central (x=61) -->
    <rect x="61" y="18" width="6" height="92" fill="#18181b"/>
    <line x1="62" y1="18" x2="62" y2="110" stroke="#52525b" stroke-width="1"/>
    <line x1="66" y1="18" x2="66" y2="110" stroke="#0c0a09" stroke-width="1"/>

    <!-- Barrote V3 (x=86) -->
    <rect x="86" y="18" width="6" height="92" fill="#18181b"/>
    <line x1="87" y1="18" x2="87" y2="110" stroke="#3f3f46" stroke-width="1"/>
    <line x1="91" y1="18" x2="91" y2="110" stroke="#0c0a09" stroke-width="1"/>

    <!-- BARROTES DE HIERRO HORIZONTALES (3 travesaños) -->
    <!-- Travesaño H1 (y=38) -->
    <rect x="18" y="36" width="92" height="6" fill="#18181b"/>
    <line x1="18" y1="37" x2="110" y2="37" stroke="#3f3f46" stroke-width="1"/>
    <line x1="18" y1="41" x2="110" y2="41" stroke="#0c0a09" stroke-width="1"/>

    <!-- Travesaño H2 Central (y=61) -->
    <rect x="18" y="61" width="92" height="6" fill="#18181b"/>
    <line x1="18" y1="62" x2="110" y2="62" stroke="#52525b" stroke-width="1"/>
    <line x1="18" y1="66" x2="110" y2="66" stroke="#0c0a09" stroke-width="1"/>

    <!-- Travesaño H3 (y=86) -->
    <rect x="18" y="86" width="92" height="6" fill="#18181b"/>
    <line x1="18" y1="87" x2="110" y2="87" stroke="#3f3f46" stroke-width="1"/>
    <line x1="18" y1="91" x2="110" y2="91" stroke="#0c0a09" stroke-width="1"/>

    <!-- REMACHES CUADRADOS DE HIERRO EN LAS 9 INTERSECCIONES -->
    <!-- Fila 1 -->
    <rect x="37" y="37" width="4" height="4" fill="#0c0a09"/><rect x="38" y="38" width="2" height="2" fill="#71717a"/>
    <rect x="62" y="37" width="4" height="4" fill="#0c0a09"/><rect x="63" y="38" width="2" height="2" fill="#71717a"/>
    <rect x="87" y="37" width="4" height="4" fill="#0c0a09"/><rect x="88" y="38" width="2" height="2" fill="#71717a"/>
    <!-- Fila 2 Central -->
    <rect x="37" y="62" width="4" height="4" fill="#0c0a09"/><rect x="38" y="63" width="2" height="2" fill="#71717a"/>
    <rect x="62" y="62" width="4" height="4" fill="#0c0a09"/><rect x="63" y="63" width="2" height="2" fill="#a1a1aa"/>
    <rect x="87" y="62" width="4" height="4" fill="#0c0a09"/><rect x="88" y="63" width="2" height="2" fill="#71717a"/>
    <!-- Fila 3 -->
    <rect x="37" y="87" width="4" height="4" fill="#0c0a09"/><rect x="38" y="88" width="2" height="2" fill="#71717a"/>
    <rect x="62" y="87" width="4" height="4" fill="#0c0a09"/><rect x="63" y="88" width="2" height="2" fill="#71717a"/>
    <rect x="87" y="87" width="4" height="4" fill="#0c0a09"/><rect x="88" y="88" width="2" height="2" fill="#71717a"/>

    <!-- Manchas de óxido viejo cayendo por el marco de piedra -->
    <path d="M 60,18 L 68,18 L 66,10 L 62,10 Z" fill="#78350f" opacity="0.6"/>
    <path d="M 60,110 L 68,110 L 66,118 L 62,118 Z" fill="#78350f" opacity="0.6"/>
  `;
}

/**
 * Tile 25: Techo Agrietado / Fractura de Carga (ceilingCracked)
 * Cantería gris claro bajo la presión de la catacumba: fisuras quebradizas de 1 px con abismo superior y lascas minerales.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingCracked(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- 4 Losas base gris claro -->
    <rect x="1" y="1" width="62" height="62" fill="#8a929d"/>
    <rect x="65" y="1" width="62" height="62" fill="#78808c"/>
    <rect x="1" y="65" width="62" height="62" fill="#6c7480"/>
    <rect x="65" y="65" width="62" height="62" fill="#7f8793"/>

    <!-- Casetones interiores -->
    <rect x="8" y="8" width="48" height="48" fill="#747c88" stroke="#0c0a09" stroke-width="1"/>
    <rect x="72" y="8" width="48" height="48" fill="#68707c" stroke="#0c0a09" stroke-width="1"/>
    <rect x="8" y="72" width="48" height="48" fill="#5c6470" stroke="#0c0a09" stroke-width="1"/>
    <rect x="72" y="72" width="48" height="48" fill="#6e7682" stroke="#0c0a09" stroke-width="1"/>

    <!-- FRACTURA CENTRAL DE BÓVEDA DE 1px -->
    <!-- Sombra profunda del abismo superior -->
    <path d="M 64,2 L 54,22 L 70,42 L 58,64 L 74,86 L 62,110 L 68,126" stroke="#000000" stroke-width="3" fill="none"/>
    
    <!-- Grieta principal dentada -->
    <path d="M 64,2 L 54,22 L 70,42 L 58,64 L 74,86 L 62,110 L 68,126" stroke="#0c0a09" stroke-width="1.8" fill="none"/>
    
    <!-- Filo iluminado de piedra fracturada -->
    <path d="M 65,2 L 55,22 L 71,42 L 59,64 L 75,86 L 63,110 L 69,126" stroke="#e5e7eb" stroke-width="1" opacity="0.85" fill="none"/>

    <!-- Ramificaciones secundarias que parten los casetones -->
    <path d="M 54,22 L 32,28 L 18,22" stroke="#0c0a09" stroke-width="1.5" fill="none"/>
    <path d="M 54,23 L 32,29 L 18,23" stroke="#b0b7c1" stroke-width="1" opacity="0.75" fill="none"/>

    <path d="M 70,42 L 94,48 L 110,42" stroke="#0c0a09" stroke-width="1.5" fill="none"/>
    <path d="M 70,43 L 94,49 L 110,43" stroke="#b0b7c1" stroke-width="1" opacity="0.75" fill="none"/>

    <path d="M 58,64 L 38,78 L 22,86" stroke="#0c0a09" stroke-width="1.5" fill="none"/>
    <path d="M 58,65 L 38,79 L 22,87" stroke="#b0b7c1" stroke-width="1" opacity="0.75" fill="none"/>

    <!-- Lascas y desprendimientos en la piedra -->
    <polygon points="63,60 70,62 65,68" fill="#0c0a09"/>
    <polygon points="64,61 68,62 65,66" fill="#9ca3af"/>
    <polygon points="56,22 60,20 58,25" fill="#0c0a09"/>
  `;
}

/**
 * Tile 26: Techo con Humedad y Moho Colgante (ceilingMossy)
 * Cantería gris claro con condensación oscura, líquenes de cripta y gotas colgando entre las juntas del casetón.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingMossy(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- 4 Losas base gris claro -->
    <rect x="1" y="1" width="62" height="62" fill="#8a929d"/>
    <rect x="65" y="1" width="62" height="62" fill="#78808c"/>
    <rect x="1" y="65" width="62" height="62" fill="#6c7480"/>
    <rect x="65" y="65" width="62" height="62" fill="#7f8793"/>

    <!-- Casetones interiores -->
    <rect x="8" y="8" width="48" height="48" fill="#747c88" stroke="#0c0a09" stroke-width="1"/>
    <rect x="72" y="8" width="48" height="48" fill="#68707c" stroke="#0c0a09" stroke-width="1"/>
    <rect x="8" y="72" width="48" height="48" fill="#5c6470" stroke="#0c0a09" stroke-width="1"/>
    <rect x="72" y="72" width="48" height="48" fill="#6e7682" stroke="#0c0a09" stroke-width="1"/>

    <!-- Mancha viscosa de condensación de humedad que brota del centro -->
    <path d="M 64,24 Q 86,38 78,64 Q 98,82 76,96 Q 64,110 46,90 Q 28,74 44,52 Q 36,32 64,24 Z" fill="#0f172a" opacity="0.65"/>

    <!-- Capa 1: Raíz y base de moho oscuro de cripta -->
    <g fill="#14532d" opacity="0.95">
      <circle cx="64" cy="64" r="13"/><circle cx="52" cy="56" r="10"/><circle cx="76" cy="70" r="11"/>
      <circle cx="64" cy="44" r="8"/><circle cx="64" cy="82" r="9"/>
      <circle cx="44" cy="64" r="9"/><circle cx="84" cy="64" r="8"/>
      <!-- Brotes en los casetones -->
      <circle cx="28" cy="28" r="6"/><circle cx="100" cy="100" r="6"/>
    </g>

    <!-- Capa 2: Hongos y líquenes oliva -->
    <g fill="#3f6212">
      <circle cx="63" cy="63" r="9"/><circle cx="51" cy="55" r="7"/><circle cx="75" cy="69" r="7.5"/>
      <circle cx="63" cy="43" r="5.5"/><circle cx="63" cy="81" r="6"/>
      <circle cx="43" cy="63" r="6"/><circle cx="83" cy="63" r="5.5"/>
      <circle cx="27" cy="27" r="4"/><circle cx="99" cy="99" r="4"/>
    </g>

    <!-- Capa 3: Esporas luminiscentes que cuelgan del techo (1 a 2 px) -->
    <g fill="#65a30d" opacity="0.85">
      <circle cx="62" cy="62" r="4.5"/><circle cx="50" cy="54" r="3"/><circle cx="74" cy="68" r="3.5"/>
      <circle cx="62" cy="42" r="2.5"/><circle cx="62" cy="80" r="2.5"/>
    </g>
    <circle cx="62" cy="61" r="1.2" fill="#bbf7d0"/>
    <circle cx="50" cy="53" r="1" fill="#bbf7d0"/>
    <circle cx="74" cy="67" r="1" fill="#bbf7d0"/>

    <!-- Gotas condensadas a punto de caer hacia el suelo -->
    <ellipse cx="64" cy="74" rx="2" ry="3" fill="#38bdf8" opacity="0.7"/>
    <circle cx="64" cy="75" r="1" fill="#ffffff" opacity="0.9"/>
    <ellipse cx="54" cy="62" rx="1.5" ry="2.5" fill="#38bdf8" opacity="0.6"/>
  `;
}

/**
 * Tile 27: Techo Rúnico / Rosetón Ocular (ceilingRunic)
 * Clave de bóveda ritual sobre cantería gris claro, medallón tallado, canal rúnico de fuego de azufre y foco arcano.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingRunic(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- 4 Losas de bóveda base gris claro con juntas de 2px -->
    <rect x="1" y="1" width="62" height="62" fill="#8a929d"/>
    <rect x="65" y="1" width="62" height="62" fill="#78808c"/>
    <rect x="1" y="65" width="62" height="62" fill="#6c7480"/>
    <rect x="65" y="65" width="62" height="62" fill="#7f8793"/>

    <!-- Sombra exterior de la clave de bóveda circular -->
    <circle cx="64" cy="64" r="50" fill="#0c0a09" opacity="0.7"/>

    <!-- Clave de bóveda circular de piedra gris -->
    <circle cx="64" cy="64" r="48" fill="#5c6470" stroke="#0c0a09" stroke-width="1.5"/>
    <!-- Bisel circular invertido de 1px -->
    <circle cx="64" cy="64" r="46" fill="none" stroke="#b0b7c1" stroke-width="1" opacity="0.8"/>
    <circle cx="64" cy="64" r="34" fill="#374151" stroke="#0c0a09" stroke-width="1.5"/>

    <!-- CANAL DEL GLIFO DE AZUFRE / FUEGO ARCANO (Trazos de 1px) -->
    <!-- Sombra interior del surco tallado -->
    <polygon points="63,39 89,63 63,89 37,63" stroke="#0c0a09" stroke-width="3" fill="none"/>
    <circle cx="63" cy="63" r="16" stroke="#0c0a09" stroke-width="2.5" fill="none"/>
    <line x1="63" y1="30" x2="63" y2="98" stroke="#0c0a09" stroke-width="2.5"/>
    <line x1="30" y1="63" x2="98" y2="63" stroke="#0c0a09" stroke-width="2.5"/>

    <!-- Línea de incandescencia arcana de 1px -->
    <polygon points="64,40 88,64 64,88 40,64" stroke="#ea580c" stroke-width="1.5" fill="none"/>
    <circle cx="64" cy="64" r="16" stroke="#ea580c" stroke-width="1.5" fill="none"/>
    <line x1="64" y1="30" x2="64" y2="98" stroke="#ea580c" stroke-width="1.5"/>
    <line x1="30" y1="64" x2="98" y2="64" stroke="#ea580c" stroke-width="1.5"/>

    <!-- Resplandor amarillo central de 1px -->
    <polygon points="64,40 88,64 64,88 40,64" stroke="#f59e0b" stroke-width="0.8" fill="none"/>
    <circle cx="64" cy="64" r="16" stroke="#fef08a" stroke-width="0.8" fill="none"/>
    <line x1="64" y1="30" x2="64" y2="98" stroke="#fef08a" stroke-width="0.8"/>
    <line x1="30" y1="64" x2="98" y2="64" stroke="#fef08a" stroke-width="0.8"/>

    <!-- Ojo / Foco místico central descendente -->
    <circle cx="64" cy="64" r="8" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
    <circle cx="64" cy="64" r="6" fill="#7f1d1d"/>
    <circle cx="64" cy="64" r="3.5" fill="#f59e0b"/>
    <circle cx="63.5" cy="63.5" r="1.5" fill="#fef08a"/>

    <!-- Clavos de fijación en las esquinas de los cuadrantes -->
    <rect x="14" y="14" width="3" height="3" fill="#0c0a09"/><rect x="15" y="15" width="1" height="1" fill="#9ca3af"/>
    <rect x="110" y="14" width="3" height="3" fill="#0c0a09"/><rect x="111" y="15" width="1" height="1" fill="#9ca3af"/>
    <rect x="14" y="110" width="3" height="3" fill="#0c0a09"/><rect x="15" y="111" width="1" height="1" fill="#9ca3af"/>
    <rect x="110" y="110" width="3" height="3" fill="#0c0a09"/><rect x="111" y="111" width="1" height="1" fill="#9ca3af"/>
  `;
}

// Alias de retrocompatibilidad
export const ceilingClean = ceilingVault;
export const ceilingGrate = ceilingCoffered;

export const ceilingSprites = {
  ceilingVault,
  ceilingCoffered,
  ceilingCracked,
  ceilingMossy,
  ceilingRunic,
  // Alias de compatibilidad
  ceilingClean,
  ceilingGrate
};
