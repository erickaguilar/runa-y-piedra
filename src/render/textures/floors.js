// src/render/textures/floors.js

/**
 * Tile 5: Piso de Mazmorra Base Pixel Art (floorClean / sumieDungeonFloor — Losas de Calabozo)
 * Cuatro losas sombrías en resolución retro 64x64 con crispEdges, técnica Tarashikomi en pixel clusters,
 * cruz central de mortero en x=32 y y=32, argolla de grillete oxidado, rasguños kasure y salpicaduras Haboku.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorClean(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Fondo de papel Washi envejecido y húmedo (tono ceniza subterráneo) -->
      <rect width="64" height="64" fill="#d6cfc2"/>
      <rect width="64" height="64" fill="#bfb6a6" opacity="0.45"/>

      <!-- AGUADAS DE HUMEDAD EN LAS 4 LOSAS (Técnica Tarashikomi en Pixel Clusters) -->
      <!-- Losa Superior Izquierda (x=1..30, y=1..30) -->
      <rect x="2" y="2" width="28" height="28" fill="#57534e" opacity="0.35"/>
      <rect x="5" y="6" width="20" height="18" fill="#292524" opacity="0.25"/>

      <!-- Losa Superior Derecha (x=33..62, y=1..30) -->
      <rect x="34" y="2" width="28" height="28" fill="#44403c" opacity="0.4"/>
      <rect x="38" y="7" width="20" height="18" fill="#1c1917" opacity="0.25"/>

      <!-- Losa Inferior Izquierda (x=1..30, y=33..62) -->
      <rect x="2" y="34" width="28" height="28" fill="#44403c" opacity="0.42"/>
      <rect x="7" y="38" width="18" height="20" fill="#1c1917" opacity="0.28"/>

      <!-- Losa Inferior Derecha (x=33..62, y=33..62) -->
      <rect x="34" y="34" width="28" height="28" fill="#57534e" opacity="0.35"/>
      <rect x="38" y="38" width="20" height="18" fill="#292524" opacity="0.25"/>

      <!-- HALO DE SANGRADO DIFUSO EN LAS JUNTAS -->
      <rect x="0" y="30" width="64" height="4" fill="#292524" opacity="0.3"/>
      <rect x="30" y="0" width="4" height="64" fill="#292524" opacity="0.3"/>
      <rect x="0" y="0" width="64" height="64" fill="none" stroke="#292524" stroke-width="2" opacity="0.3"/>

      <!-- JUNTAS CALIGRÁFICAS EN PIXEL ART (Cruz central continua en x=31..32, y=31..32) -->
      <rect x="0" y="31" width="64" height="2" fill="#121212"/>
      <rect x="31" y="0" width="2" height="64" fill="#121212"/>

      <!-- Bordes perimetrales (1px para sumar 2px idénticos a la cruz al repetir) -->
      <rect x="0" y="0" width="64" height="1" fill="#121212"/>
      <rect x="0" y="63" width="64" height="1" fill="#121212"/>
      <rect x="0" y="0" width="1" height="64" fill="#121212"/>
      <rect x="63" y="0" width="1" height="64" fill="#121212"/>

      <!-- Pozo de sombra central (Piedra desportillada) -->
      <rect x="29" y="30" width="6" height="4" fill="#121212"/>
      <rect x="30" y="29" width="4" height="6" fill="#121212"/>

      <!-- GRIETAS DE PINCEL SECO ESCALONADAS -->
      <!-- Grieta Losa 1 -->
      <g fill="#121212">
        <rect x="0" y="14" width="8" height="1"/>
        <rect x="8" y="15" width="4" height="1"/>
        <rect x="12" y="12" width="7" height="1"/>
        <rect x="12" y="10" width="2" height="2"/>
      </g>
      <!-- Grieta Losa 2 -->
      <g fill="#121212">
        <rect x="32" y="18" width="9" height="1"/>
        <rect x="41" y="14" width="6" height="1"/>
        <rect x="47" y="19" width="8" height="1"/>
      </g>
      <!-- Grieta Losa 3 -->
      <g fill="#121212">
        <rect x="32" y="48" width="9" height="1"/>
        <rect x="23" y="44" width="9" height="1"/>
        <rect x="16" y="51" width="7" height="1"/>
      </g>
      <!-- Grieta Losa 4 -->
      <g fill="#121212">
        <rect x="46" y="32" width="1" height="9"/>
        <rect x="44" y="41" width="1" height="8"/>
        <rect x="51" y="47" width="1" height="9"/>
      </g>

      <!-- Rasguños Kasure (Cerdas abiertas en 1 px) -->
      <g fill="#292524" opacity="0.65">
        <rect x="7" y="22" width="6" height="1"/>
        <rect x="41" y="8" width="7" height="1"/>
        <rect x="14" y="39" width="7" height="1"/>
        <rect x="39" y="54" width="6" height="1"/>
      </g>

      <!-- Argolla de grillete / hierro oxidado en Losa 3 -->
      <rect x="12" y="53" width="3" height="3" fill="#121212"/>
      <rect x="11" y="55" width="5" height="5" fill="none" stroke="#121212" stroke-width="1"/>
      <rect x="13" y="57" width="2" height="1" fill="#7f1d1d"/>

      <!-- Salpicaduras Haboku y óxido de 1 px -->
      <rect x="22" y="26" width="1" height="1" fill="#121212"/>
      <rect x="38" y="24" width="1" height="1" fill="#121212"/>
      <rect x="26" y="39" width="1" height="1" fill="#121212"/>
      <rect x="53" y="41" width="1" height="1" fill="#7f1d1d"/>
      <rect x="55" y="43" width="1" height="1" fill="#7f1d1d"/>
    </g>
  `;
}

/**
 * Tile 6: Piso Desgastado / Fracturado Pixel Art (floorWorn)
 * Losas de calabozo con fracturas profundas de pincel seco Nōboku escalonadas en 64x64.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorWorn(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#d6cfc2"/>
      <rect width="64" height="64" fill="#bfb6a6" opacity="0.45"/>

      <!-- Aguadas de humedad en las losas -->
      <rect x="2" y="2" width="28" height="28" fill="#57534e" opacity="0.4"/>
      <rect x="34" y="2" width="28" height="28" fill="#44403c" opacity="0.45"/>
      <rect x="2" y="34" width="28" height="28" fill="#44403c" opacity="0.45"/>
      <rect x="34" y="34" width="28" height="28" fill="#57534e" opacity="0.4"/>

      <!-- Juntas continuas caligráficas -->
      <rect x="0" y="31" width="64" height="2" fill="#121212"/>
      <rect x="31" y="0" width="2" height="64" fill="#121212"/>
      <rect x="0" y="0" width="64" height="1" fill="#121212"/>
      <rect x="0" y="63" width="64" height="1" fill="#121212"/>
      <rect x="0" y="0" width="1" height="64" fill="#121212"/>
      <rect x="63" y="0" width="1" height="64" fill="#121212"/>

      <!-- Múltiples fracturas escalonadas Nōboku intensas -->
      <g fill="#121212">
        <rect x="11" y="2" width="2" height="10"/>
        <rect x="10" y="12" width="6" height="2"/>
        <rect x="15" y="14" width="2" height="9"/>
        <rect x="32" y="16" width="11" height="2"/>
        <rect x="42" y="11" width="8" height="2"/>
        <rect x="49" y="13" width="2" height="8"/>
        <rect x="19" y="32" width="2" height="10"/>
        <rect x="17" y="42" width="7" height="2"/>
        <rect x="23" y="44" width="2" height="11"/>
        <rect x="48" y="32" width="2" height="11"/>
        <rect x="49" y="43" width="8" height="2"/>
        <rect x="56" y="45" width="2" height="11"/>
      </g>
      <!-- Filo claro de 1px -->
      <g fill="#a8a29e">
        <rect x="13" y="2" width="1" height="10"/>
        <rect x="17" y="14" width="1" height="9"/>
        <rect x="21" y="32" width="1" height="10"/>
        <rect x="25" y="44" width="1" height="11"/>
      </g>

      <!-- Salpicaduras Haboku -->
      <rect x="17" y="13" width="1" height="1" fill="#121212"/>
      <rect x="46" y="14" width="1" height="1" fill="#121212"/>
      <rect x="24" y="44" width="1" height="1" fill="#121212"/>
      <rect x="52" y="47" width="1" height="1" fill="#121212"/>
    </g>
  `;
}

/**
 * Tile 7: Piso con Moho y Humedad Pixel Art (floorMossy)
 * Losas de calabozo con veladuras orgánicas de musgo Koke-dera en racimos de píxeles.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorMossy(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#d6cfc2"/>
      <rect width="64" height="64" fill="#bfb6a6" opacity="0.45"/>

      <!-- Aguadas de piedra base -->
      <rect x="2" y="2" width="28" height="28" fill="#57534e" opacity="0.35"/>
      <rect x="34" y="2" width="28" height="28" fill="#44403c" opacity="0.4"/>
      <rect x="2" y="34" width="28" height="28" fill="#44403c" opacity="0.42"/>
      <rect x="34" y="34" width="28" height="28" fill="#57534e" opacity="0.35"/>

      <!-- Juntas continuas caligráficas -->
      <rect x="0" y="31" width="64" height="2" fill="#121212"/>
      <rect x="31" y="0" width="2" height="64" fill="#121212"/>
      <rect x="0" y="0" width="64" height="1" fill="#121212"/>
      <rect x="0" y="63" width="64" height="1" fill="#121212"/>
      <rect x="0" y="0" width="1" height="64" fill="#121212"/>
      <rect x="63" y="0" width="1" height="64" fill="#121212"/>

      <!-- Racimos de musgo verde matcha Koke-dera en la cruz central -->
      <g fill="#14532d">
        <rect x="22" y="26" width="20" height="12"/>
        <rect x="26" y="22" width="12" height="20"/>
        <rect x="10" y="30" width="8" height="4"/>
        <rect x="46" y="30" width="8" height="4"/>
      </g>
      <g fill="#3f6212">
        <rect x="25" y="28" width="14" height="8"/>
        <rect x="28" y="25" width="8" height="14"/>
        <rect x="12" y="31" width="4" height="2"/>
        <rect x="48" y="31" width="4" height="2"/>
      </g>
      <g fill="#65a30d">
        <rect x="29" y="29" width="6" height="6"/>
        <rect x="31" y="31" width="2" height="2" fill="#dcfce7"/>
      </g>
    </g>
  `;
}

/**
 * Tile 8: Piso con Drenaje / Reja Pixel Art (floorMossyWorn / sumieDungeonGrate)
 * Pozo abismal central de tinta pura cubierto por reja forjada en pixel art con remaches bermellón.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorMossyWorn(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#d6cfc2"/>
      <rect width="64" height="64" fill="#bfb6a6" opacity="0.45"/>

      <!-- Juntas perimetrales y cruz -->
      <rect x="0" y="31" width="64" height="2" fill="#121212"/>
      <rect x="31" y="0" width="2" height="64" fill="#121212"/>
      <rect x="0" y="0" width="64" height="1" fill="#121212"/>
      <rect x="0" y="63" width="64" height="1" fill="#121212"/>
      <rect x="0" y="0" width="1" height="64" fill="#121212"/>
      <rect x="63" y="0" width="1" height="64" fill="#121212"/>

      <!-- Halo de humedad alrededor del pozo central -->
      <rect x="11" y="11" width="42" height="42" rx="3" fill="#1c1917" opacity="0.45"/>

      <!-- POZO ABISMAL CENTRAL (Tinta negra pura Nōboku) -->
      <rect x="14" y="14" width="36" height="36" fill="#121212"/>
      <!-- Bisel de piedra irregular -->
      <rect x="14" y="14" width="36" height="36" fill="none" stroke="#d6cfc2" stroke-width="1" opacity="0.5"/>

      <!-- BARROTES DE HIERRO FORJADO EN PIXEL ART -->
      <!-- Verticales (x=23, 31, 40) -->
      <g fill="#292524">
        <rect x="22" y="14" width="3" height="36"/>
        <rect x="31" y="14" width="3" height="36"/>
        <rect x="40" y="14" width="3" height="36"/>
      </g>
      <g fill="#a8a29e">
        <rect x="22" y="15" width="1" height="34"/>
        <rect x="31" y="15" width="1" height="34"/>
        <rect x="40" y="15" width="1" height="34"/>
      </g>

      <!-- Horizontales (y=23, 31, 40) -->
      <g fill="#292524">
        <rect x="14" y="22" width="36" height="3"/>
        <rect x="14" y="31" width="36" height="3"/>
        <rect x="14" y="40" width="36" height="3"/>
      </g>
      <g fill="#a8a29e">
        <rect x="15" y="22" width="34" height="1"/>
        <rect x="15" y="31" width="34" height="1"/>
        <rect x="15" y="40" width="34" height="1"/>
      </g>

      <!-- Remaches con óxido bermellón -->
      <g fill="#7f1d1d">
        <rect x="23" y="23" width="1" height="1"/><rect x="32" y="23" width="1" height="1"/><rect x="41" y="23" width="1" height="1"/>
        <rect x="23" y="32" width="1" height="1"/><rect x="32" y="32" width="1" height="1"/><rect x="41" y="32" width="1" height="1"/>
        <rect x="23" y="41" width="1" height="1"/><rect x="32" y="41" width="1" height="1"/><rect x="41" y="41" width="1" height="1"/>
      </g>

      <!-- Grietas en las 4 esquinas de la reja -->
      <g fill="#121212">
        <rect x="10" y="10" width="4" height="1"/><rect x="7" y="9" width="3" height="1"/>
        <rect x="50" y="10" width="4" height="1"/><rect x="54" y="9" width="3" height="1"/>
        <rect x="10" y="53" width="4" height="1"/><rect x="7" y="54" width="3" height="1"/>
        <rect x="50" y="53" width="4" height="1"/><rect x="54" y="54" width="3" height="1"/>
      </g>
    </g>
  `;
}

/**
 * Tile 9: Piso Quebrado con Sello Ofuda Pixel Art (floorSanctuary / sumieDungeonCursed)
 * Gran falla caligráfica violenta sellada con un talismán Ofuda bermellón en diagonal y caligrafía ritual.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function floorSanctuary(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#d6cfc2"/>
      <rect width="64" height="64" fill="#bfb6a6" opacity="0.45"/>

      <!-- Aguadas de piedra húmeda -->
      <rect x="2" y="2" width="28" height="28" fill="#44403c" opacity="0.38"/>
      <rect x="34" y="2" width="28" height="28" fill="#57534e" opacity="0.32"/>
      <rect x="2" y="34" width="28" height="28" fill="#57534e" opacity="0.35"/>
      <rect x="34" y="34" width="28" height="28" fill="#44403c" opacity="0.42"/>

      <!-- Juntas de conexión continua -->
      <rect x="0" y="31" width="64" height="2" fill="#121212"/>
      <rect x="31" y="0" width="2" height="64" fill="#121212"/>
      <rect x="0" y="0" width="64" height="1" fill="#121212"/>
      <rect x="0" y="63" width="64" height="1" fill="#121212"/>
      <rect x="0" y="0" width="1" height="64" fill="#121212"/>
      <rect x="63" y="0" width="1" height="64" fill="#121212"/>

      <!-- GRAN FALLA CALIGRÁFICA DE MAZMORRA (Trazo violento escalonado) -->
      <g fill="#121212">
        <rect x="9" y="7" width="12" height="3"/>
        <rect x="18" y="10" width="3" height="10"/>
        <rect x="21" y="20" width="11" height="3"/>
        <rect x="30" y="23" width="3" height="9"/>
        <rect x="33" y="32" width="12" height="3"/>
        <rect x="42" y="35" width="3" height="10"/>
        <rect x="45" y="45" width="10" height="3"/>
        <rect x="52" y="48" width="3" height="9"/>
      </g>

      <!-- TALISMÁN OFUDA PEGADO SOBRE LA GRIETA CENTRAL -->
      <g transform="rotate(-35 32 32)">
        <!-- Sombra del pergamino -->
        <rect x="27" y="21" width="12" height="24" fill="#121212" opacity="0.4"/>
        <!-- Cuerpo del talismán en rojo cinabrio -->
        <rect x="26" y="20" width="12" height="24" fill="#991b1b" stroke="#121212" stroke-width="1"/>
        <rect x="28" y="22" width="8" height="20" fill="none" stroke="#f4efe4" stroke-width="0.8" opacity="0.7"/>
        <!-- Caligrafía ritual interna -->
        <rect x="31" y="23" width="2" height="18" fill="#121212"/>
        <rect x="29" y="26" width="6" height="1" fill="#121212"/>
        <rect x="29" y="37" width="6" height="1" fill="#121212"/>
        <rect x="31" y="31" width="2" height="2" fill="#fef08a"/>
      </g>

      <!-- Salpicaduras de tinta y cinabrio de 1px -->
      <rect x="24" y="24" width="1" height="1" fill="#121212"/>
      <rect x="40" y="28" width="1" height="1" fill="#991b1b"/>
      <rect x="26" y="41" width="1" height="1" fill="#991b1b"/>
      <rect x="39" y="44" width="1" height="1" fill="#121212"/>
      <rect x="15" y="12" width="1" height="1" fill="#121212"/>
      <rect x="49" y="53" width="1" height="1" fill="#121212"/>
    </g>
  `;
}

export const sumieDungeonFloor = floorClean;
export const sumieDungeonGrate = floorMossyWorn;
export const sumieDungeonCursed = floorSanctuary;

export const floorSprites = {
  floorClean,
  floorWorn,
  floorMossy,
  floorMossyWorn,
  floorSanctuary,
  sumieDungeonFloor,
  sumieDungeonGrate,
  sumieDungeonCursed,
};
