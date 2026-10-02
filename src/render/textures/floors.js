// src/render/textures/floors.js

/**
 * Tile 5: Piso Regular / Losas de Cantería Gris Claro (floorClean)
 * Cuatro losas cuadradas en tonos de piedra gris clara (#8a929d, #78808c, #6c7480, #7f8793)
 * con biseles de luz cenital de 1 px (#d1d5db, #b0b7c1) y mortero negro carbón de 2 px.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorClean(S = 128) {
  return `
    <!-- Fondo de mortero carbón de 2px -->
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- Losa 1: Superior Izquierda (Gris claro cenital) -->
    <rect x="1" y="1" width="62" height="62" fill="#8a929d"/>
    <line x1="2" y1="2" x2="62" y2="2" stroke="#d1d5db" stroke-width="1" opacity="0.9"/>
    <line x1="2" y1="2" x2="2" y2="62" stroke="#d1d5db" stroke-width="1" opacity="0.9"/>
    <line x1="2" y1="62" x2="62" y2="62" stroke="#374151" stroke-width="1"/>
    <line x1="62" y1="2" x2="62" y2="62" stroke="#374151" stroke-width="1"/>

    <!-- Losa 2: Superior Derecha (Gris medio) -->
    <rect x="65" y="1" width="62" height="62" fill="#78808c"/>
    <line x1="66" y1="2" x2="126" y2="2" stroke="#b0b7c1" stroke-width="1" opacity="0.8"/>
    <line x1="66" y1="2" x2="66" y2="62" stroke="#b0b7c1" stroke-width="1" opacity="0.8"/>
    <line x1="66" y1="62" x2="126" y2="62" stroke="#374151" stroke-width="1"/>
    <line x1="126" y1="2" x2="126" y2="62" stroke="#374151" stroke-width="1"/>

    <!-- Losa 3: Inferior Izquierda (Gris basalto frío) -->
    <rect x="1" y="65" width="62" height="62" fill="#6c7480"/>
    <line x1="2" y1="66" x2="62" y2="66" stroke="#9ca3af" stroke-width="1" opacity="0.75"/>
    <line x1="2" y1="66" x2="2" y2="126" stroke="#9ca3af" stroke-width="1" opacity="0.75"/>
    <line x1="2" y1="126" x2="62" y2="126" stroke="#2d333d" stroke-width="1"/>
    <line x1="62" y1="66" x2="62" y2="126" stroke="#2d333d" stroke-width="1"/>

    <!-- Losa 4: Inferior Derecha (Gris cantería cálida suave) -->
    <rect x="65" y="65" width="62" height="62" fill="#7f8793"/>
    <line x1="66" y1="66" x2="126" y2="66" stroke="#b8bfc9" stroke-width="1" opacity="0.85"/>
    <line x1="66" y1="66" x2="66" y2="126" stroke="#b8bfc9" stroke-width="1" opacity="0.85"/>
    <line x1="66" y1="126" x2="126" y2="126" stroke="#374151" stroke-width="1"/>
    <line x1="126" y1="66" x2="126" y2="126" stroke="#374151" stroke-width="1"/>

    <!-- Pátina sutil en juntas centrales -->
    <path d="M 63,22 L 63,44 L 60,32 Z" fill="#374151" opacity="0.35"/>
    <path d="M 65,84 L 65,106 L 68,96 Z" fill="#374151" opacity="0.35"/>

    <!-- Piqueteado fino de cincel y textura mineral (1 a 2 px) -->
    <g fill="#374151" opacity="0.55">
      <rect x="18" y="24" width="2" height="2"/>
      <rect x="42" y="16" width="3" height="2"/>
      <rect x="28" y="48" width="2" height="3"/>
      <rect x="84" y="20" width="3" height="2"/>
      <rect x="108" y="38" width="2" height="2"/>
      <rect x="94" y="52" width="2" height="3"/>
      <rect x="22" y="84" width="3" height="2"/>
      <rect x="44" y="106" width="2" height="2"/>
      <rect x="80" y="80" width="2" height="2"/>
      <rect x="112" y="96" width="3" height="2"/>
    </g>
    <!-- Destellos minerales y granos claros -->
    <g fill="#d1d5db" opacity="0.8">
      <rect x="19" y="25" width="1" height="1"/>
      <rect x="85" y="21" width="1" height="1"/>
      <rect x="45" y="107" width="1" height="1"/>
      <rect x="109" y="39" width="1" height="1"/>
    </g>
    <g fill="#e5e7eb" opacity="0.65">
      <rect x="43" y="17" width="1" height="1"/>
      <rect x="23" y="85" width="1" height="1"/>
    </g>
  `;
}

/**
 * Tile 6: Piso Desgastado / Agrietado (floorWorn)
 * Losas de cantería gris claro fracturadas con grietas afiladas de 1 px y filos iluminados.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorWorn(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- 4 Losas base en tonos gris claro -->
    <rect x="1" y="1" width="62" height="62" fill="#8a929d"/>
    <rect x="65" y="1" width="62" height="62" fill="#78808c"/>
    <rect x="1" y="65" width="62" height="62" fill="#6c7480"/>
    <rect x="65" y="65" width="62" height="62" fill="#7f8793"/>

    <!-- Biseles periféricos en tonos claros -->
    <line x1="2" y1="2" x2="62" y2="2" stroke="#d1d5db" stroke-width="1" opacity="0.85"/>
    <line x1="66" y1="2" x2="126" y2="2" stroke="#b0b7c1" stroke-width="1" opacity="0.75"/>
    <line x1="2" y1="66" x2="126" y2="66" stroke="#9ca3af" stroke-width="1" opacity="0.7"/>

    <!-- FRACTURAS TECTÓNICAS DE 1px CON FILO ILUMINADO CLARO -->
    <!-- Grieta en Losa Superior Izquierda -->
    <path d="M 22,2 L 28,18 L 18,34 L 32,48 L 26,62" stroke="#000000" stroke-width="3" fill="none"/>
    <path d="M 22,2 L 28,18 L 18,34 L 32,48 L 26,62" stroke="#181b20" stroke-width="1.8" fill="none"/>
    <path d="M 23,2 L 29,18 L 19,34 L 33,48 L 27,62" stroke="#e5e7eb" stroke-width="1" opacity="0.9" fill="none"/>
    <path d="M 18,34 L 8,40" stroke="#181b20" stroke-width="1.5" fill="none"/>
    <path d="M 18,35 L 8,41" stroke="#d1d5db" stroke-width="1" opacity="0.8" fill="none"/>

    <!-- Grieta en Losa Superior Derecha -->
    <path d="M 65,36 L 82,24 L 98,38 L 92,54 L 110,62" stroke="#000000" stroke-width="3" fill="none"/>
    <path d="M 65,36 L 82,24 L 98,38 L 92,54 L 110,62" stroke="#181b20" stroke-width="1.8" fill="none"/>
    <path d="M 66,36 L 83,24 L 99,38 L 93,54 L 111,62" stroke="#e5e7eb" stroke-width="1" opacity="0.9" fill="none"/>

    <!-- Grieta en Losa Inferior Izquierda -->
    <path d="M 38,65 L 48,82 L 42,102 L 56,118 L 52,126" stroke="#000000" stroke-width="3" fill="none"/>
    <path d="M 38,65 L 48,82 L 42,102 L 56,118 L 52,126" stroke="#181b20" stroke-width="1.8" fill="none"/>
    <path d="M 39,65 L 49,82 L 43,102 L 57,118 L 53,126" stroke="#e5e7eb" stroke-width="1" opacity="0.85" fill="none"/>

    <!-- Grieta en Losa Inferior Derecha -->
    <path d="M 96,65 L 108,84 L 102,104 L 118,116" stroke="#000000" stroke-width="2.5" fill="none"/>
    <path d="M 96,65 L 108,84 L 102,104 L 118,116" stroke="#181b20" stroke-width="1.6" fill="none"/>
    <path d="M 97,65 L 109,84 L 103,104 L 119,116" stroke="#d1d5db" stroke-width="1" opacity="0.8" fill="none"/>

    <!-- Desconchones y lascas en la cruz central -->
    <polygon points="63,60 63,65 58,65" fill="#181b20"/>
    <polygon points="65,65 72,65 65,72" fill="#181b20"/>
    <polygon points="66,66 70,66 66,70" fill="#9ca3af"/>
    <polygon points="60,26 63,26 63,34" fill="#181b20"/>
    <polygon points="98,63 106,63 102,65" fill="#181b20"/>
  `;
}

/**
 * Tile 7: Piso con Moho / Cripta Húmeda (floorMossy)
 * Losas de cantería gris claro con colonización vegetal de moho y líquenes en 3 capas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorMossy(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- 4 Losas base en tonos gris claro -->
    <rect x="1" y="1" width="62" height="62" fill="#8a929d"/>
    <rect x="65" y="1" width="62" height="62" fill="#78808c"/>
    <rect x="1" y="65" width="62" height="62" fill="#6c7480"/>
    <rect x="65" y="65" width="62" height="62" fill="#7f8793"/>

    <line x1="2" y1="2" x2="126" y2="2" stroke="#d1d5db" stroke-width="1" opacity="0.75"/>
    <line x1="2" y1="66" x2="126" y2="66" stroke="#b0b7c1" stroke-width="1" opacity="0.65"/>

    <!-- Mancha viscosa de humedad que brota de la cruz central -->
    <path d="M 64,28 Q 84,40 78,64 Q 96,78 78,92 Q 64,106 48,88 Q 30,76 44,56 Q 38,36 64,28 Z" fill="#1f2937" opacity="0.5"/>

    <!-- Capa 1: Raíz y base de musgo oscuro de cripta -->
    <g fill="#14532d" opacity="0.95">
      <circle cx="64" cy="64" r="14"/><circle cx="54" cy="58" r="11"/><circle cx="74" cy="68" r="12"/>
      <circle cx="64" cy="46" r="9"/><circle cx="64" cy="80" r="10"/>
      <circle cx="46" cy="64" r="10"/><circle cx="82" cy="64" r="9"/>
      <circle cx="16" cy="64" r="7"/><circle cx="112" cy="64" r="7"/>
      <circle cx="64" cy="14" r="7"/><circle cx="64" cy="114" r="7"/>
    </g>

    <!-- Capa 2: Follaje activo de líquenes (Verde oliva) -->
    <g fill="#3f6212">
      <circle cx="63" cy="63" r="10"/><circle cx="53" cy="57" r="7.5"/><circle cx="73" cy="67" r="8"/>
      <circle cx="63" cy="45" r="6"/><circle cx="63" cy="79" r="6.5"/>
      <circle cx="45" cy="63" r="6.5"/><circle cx="81" cy="63" r="6"/>
      <circle cx="15" cy="63" r="4.5"/><circle cx="111" cy="63" r="4.5"/>
      <circle cx="63" cy="13" r="4.5"/><circle cx="63" cy="113" r="4.5"/>
    </g>

    <!-- Capa 3: Esporas húmedas luminiscentes (Verde lima marchito y brillo claro) -->
    <g fill="#65a30d" opacity="0.85">
      <circle cx="62" cy="61" r="5"/><circle cx="51" cy="55" r="3.5"/><circle cx="72" cy="65" r="4"/>
      <circle cx="62" cy="43" r="2.8"/><circle cx="62" cy="77" r="3"/>
      <circle cx="43" cy="61" r="3"/><circle cx="79" cy="61" r="2.8"/>
    </g>
    <circle cx="62" cy="60" r="1.5" fill="#dcfce7"/>
    <circle cx="52" cy="54" r="1.2" fill="#dcfce7"/>
    <circle cx="71" cy="64" r="1.2" fill="#dcfce7"/>
  `;
}

/**
 * Tile 8: Piso con Moho y Grietas (floorMossyWorn)
 * Deterioro combinado sobre losas gris claro: fracturas y colonización botánica.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorMossyWorn(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- 4 Losas base -->
    <rect x="1" y="1" width="62" height="62" fill="#8a929d"/>
    <rect x="65" y="1" width="62" height="62" fill="#78808c"/>
    <rect x="1" y="65" width="62" height="62" fill="#6c7480"/>
    <rect x="65" y="65" width="62" height="62" fill="#7f8793"/>

    <!-- Grietas profundas de 1px con filo claro -->
    <path d="M 64,36 L 52,50 L 64,64 L 48,82 L 32,96" stroke="#000000" stroke-width="3" fill="none"/>
    <path d="M 64,36 L 52,50 L 64,64 L 48,82 L 32,96" stroke="#181b20" stroke-width="1.8" fill="none"/>
    <path d="M 65,36 L 53,50 L 65,64 L 49,82 L 33,96" stroke="#e5e7eb" stroke-width="1" opacity="0.85" fill="none"/>

    <path d="M 80,90 L 96,104 L 90,118 L 94,126" stroke="#000000" stroke-width="2.5" fill="none"/>
    <path d="M 80,90 L 96,104 L 90,118 L 94,126" stroke="#181b20" stroke-width="1.6" fill="none"/>
    <path d="M 81,90 L 97,104 L 91,118 L 95,126" stroke="#d1d5db" stroke-width="1" opacity="0.8" fill="none"/>

    <!-- Humedad estancada en las fisuras -->
    <path d="M 64,48 Q 50,60 58,74 Q 44,88 38,98 Q 48,96 56,84 Q 68,70 64,48 Z" fill="#1f2937" opacity="0.45"/>

    <!-- Moho brotando de las entrañas de la grieta -->
    <g fill="#14532d" opacity="0.95">
      <circle cx="64" cy="64" r="11"/><circle cx="56" cy="54" r="8"/>
      <circle cx="52" cy="74" r="8"/><circle cx="40" cy="88" r="6"/>
      <circle cx="92" cy="100" r="7"/>
    </g>
    <g fill="#3f6212">
      <circle cx="63" cy="63" r="7.5"/><circle cx="55" cy="53" r="5.5"/>
      <circle cx="51" cy="73" r="5.5"/><circle cx="39" cy="87" r="4"/>
      <circle cx="91" cy="99" r="4.5"/>
    </g>
    <g fill="#65a30d" opacity="0.8">
      <circle cx="62" cy="62" r="3.5"/><circle cx="54" cy="52" r="2.5"/>
      <circle cx="50" cy="72" r="2.5"/><circle cx="38" cy="86" r="2"/>
      <circle cx="90" cy="98" r="2.2"/>
    </g>
  `;
}

/**
 * Tile 9: Piso Santuario Ceremonial / Placa de Presión (floorSanctuary)
 * Rombo ritual tallado en bajorrelieve sobre losas gris claro con biseles de 1 px y canal de fuego.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorSanctuary(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#0c0a09"/>

    <!-- 4 Losas de base en tonos gris claro -->
    <rect x="1" y="1" width="62" height="62" fill="#8a929d"/>
    <rect x="65" y="1" width="62" height="62" fill="#78808c"/>
    <rect x="1" y="65" width="62" height="62" fill="#6c7480"/>
    <rect x="65" y="65" width="62" height="62" fill="#7f8793"/>

    <!-- Sombra de inserción del rombo ceremonial -->
    <polygon points="64,13 115,64 64,115 13,64" fill="#0c0a09" opacity="0.6"/>

    <!-- Rombo exterior tallado (Placa de piedra pesada) -->
    <polygon points="64,15 113,64 64,113 15,64" fill="#4b5563" stroke="#181b20" stroke-width="1.5"/>
    <!-- Bisel de luz superior del rombo exterior en tono claro realzado -->
    <path d="M 15,64 L 64,15 L 113,64" stroke="#d1d5db" stroke-width="1.2" fill="none" opacity="0.9"/>
    <path d="M 15,64 L 64,113 L 113,64" stroke="#1f2937" stroke-width="1.2" fill="none"/>

    <!-- Rombo interior rehundido -->
    <polygon points="64,28 100,64 64,100 28,64" fill="#2d333d" stroke="#181b20" stroke-width="1.5"/>
    <path d="M 28,64 L 64,28 L 100,64" stroke="#181b20" stroke-width="1.5" fill="none"/>
    <path d="M 28,64 L 64,100 L 100,64" stroke="#9ca3af" stroke-width="1" fill="none" opacity="0.75"/>

    <!-- CANAL DEL GLIFO DE AZUFRE / FUEGO ARCANO (Heretic) -->
    <!-- Sombra interior del grabado -->
    <polygon points="63,39 89,63 63,89 37,63" stroke="#0c0a09" stroke-width="3" fill="none"/>
    <line x1="63" y1="33" x2="63" y2="95" stroke="#0c0a09" stroke-width="2.5"/>
    <line x1="33" y1="63" x2="95" y2="63" stroke="#0c0a09" stroke-width="2.5"/>

    <!-- Línea de incandescencia arcana de 1px -->
    <polygon points="64,40 88,64 64,88 40,64" stroke="#ea580c" stroke-width="1.5" fill="none"/>
    <line x1="64" y1="34" x2="64" y2="94" stroke="#ea580c" stroke-width="1.5"/>
    <line x1="34" y1="64" x2="94" y2="64" stroke="#ea580c" stroke-width="1.5"/>

    <!-- Resplandor amarillo central -->
    <polygon points="64,40 88,64 64,88 40,64" stroke="#f59e0b" stroke-width="0.8" fill="none"/>
    <line x1="64" y1="34" x2="64" y2="94" stroke="#fef08a" stroke-width="0.8"/>
    <line x1="34" y1="64" x2="94" y2="64" stroke="#fef08a" stroke-width="0.8"/>

    <!-- Orbe central / Placa activadora de presión -->
    <circle cx="64" cy="64" r="8" fill="#181b20" stroke="#2d333d" stroke-width="1"/>
    <circle cx="64" cy="64" r="6" fill="#7f1d1d"/>
    <circle cx="64" cy="64" r="3.5" fill="#f59e0b"/>
    <circle cx="63" cy="63" r="1.5" fill="#fef08a"/>

    <!-- Remaches de bronce en los vértices del rombo -->
    <circle cx="64" cy="20" r="2" fill="#d97706" stroke="#181b20" stroke-width="0.8"/>
    <circle cx="108" cy="64" r="2" fill="#d97706" stroke="#181b20" stroke-width="0.8"/>
    <circle cx="64" cy="108" r="2" fill="#d97706" stroke="#181b20" stroke-width="0.8"/>
    <circle cx="20" cy="64" r="2" fill="#d97706" stroke="#181b20" stroke-width="0.8"/>
  `;
}

export const floorSprites = {
  floorClean,
  floorWorn,
  floorMossy,
  floorMossyWorn,
  floorSanctuary
};
