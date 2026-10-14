// src/render/textures/ceilings.js

/**
 * Tile 23: Techo Regular Sumi-e Pixel Art (ceilingVault / sumiePixelCeilingRegular)
 * Casetones de bóveda con biseles escalonados, sombreado de tramado (dithering) en esquinas,
 * salpicaduras de 1 px y mancha central de hollín en resolución retro 64x64 con crispEdges.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingVault(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Fondo de tinta negra pura (Mortero y bordes) -->
      <rect width="64" height="64" fill="#0c0a09"/>

      <!-- 4 Losas base de piedra Sumi-e (Gris pergamino ceniza) -->
      <rect x="1" y="1" width="30" height="30" fill="#78716c"/>
      <rect x="33" y="1" width="30" height="30" fill="#78716c"/>
      <rect x="1" y="33" width="30" height="30" fill="#78716c"/>
      <rect x="33" y="33" width="30" height="30" fill="#78716c"/>

      <!-- Sombras de aguada en losas (Tono intermedio sin opacidad) -->
      <rect x="2" y="2" width="28" height="28" fill="#57534e"/>
      <rect x="34" y="2" width="28" height="28" fill="#57534e"/>
      <rect x="2" y="34" width="28" height="28" fill="#57534e"/>
      <rect x="34" y="34" width="28" height="28" fill="#57534e"/>

      <!-- Biseles de luz pixelados en el borde de cada losa -->
      <g fill="#a8a29e">
        <rect x="1" y="1" width="29" height="1"/><rect x="1" y="2" width="1" height="28"/>
        <rect x="33" y="1" width="29" height="1"/><rect x="33" y="2" width="1" height="28"/>
        <rect x="1" y="33" width="29" height="1"/><rect x="1" y="34" width="1" height="28"/>
        <rect x="33" y="33" width="29" height="1"/><rect x="33" y="34" width="1" height="28"/>
      </g>

      <!-- 4 CASETONES REHUNDIDOS -->
      <!-- Marco negro de los 4 casetones -->
      <rect x="5" y="5" width="22" height="22" fill="#0c0a09"/>
      <rect x="37" y="5" width="22" height="22" fill="#0c0a09"/>
      <rect x="5" y="37" width="22" height="22" fill="#0c0a09"/>
      <rect x="37" y="37" width="22" height="22" fill="#0c0a09"/>

      <!-- Bisel interior sombreado (Arriba e Izquierda) -->
      <g fill="#292524">
        <rect x="6" y="6" width="20" height="2"/><rect x="6" y="8" width="2" height="18"/>
        <rect x="38" y="6" width="20" height="2"/><rect x="38" y="8" width="2" height="18"/>
        <rect x="6" y="38" width="20" height="2"/><rect x="6" y="40" width="2" height="18"/>
        <rect x="38" y="38" width="20" height="2"/><rect x="38" y="40" width="2" height="18"/>
      </g>

      <!-- Bisel interior iluminado (Abajo y Derecha) -->
      <g fill="#78716c">
        <rect x="8" y="24" width="18" height="2"/><rect x="24" y="8" width="2" height="16"/>
        <rect x="40" y="24" width="18" height="2"/><rect x="56" y="8" width="2" height="16"/>
        <rect x="8" y="56" width="18" height="2"/><rect x="24" y="40" width="2" height="16"/>
        <rect x="40" y="56" width="18" height="2"/><rect x="56" y="40" width="2" height="16"/>
      </g>

      <!-- Fondo interior de cada casetón -->
      <rect x="8" y="8" width="16" height="16" fill="#44403c"/>
      <rect x="40" y="8" width="16" height="16" fill="#44403c"/>
      <rect x="8" y="40" width="16" height="16" fill="#44403c"/>
      <rect x="40" y="40" width="16" height="16" fill="#44403c"/>

      <!-- Sombras internas de tramado (Aguada oscura en casetones) -->
      <g fill="#292524">
        <rect x="8" y="8" width="10" height="4"/><rect x="8" y="12" width="6" height="6"/>
        <rect x="40" y="8" width="12" height="5"/><rect x="40" y="13" width="8" height="7"/>
        <rect x="8" y="40" width="10" height="5"/><rect x="8" y="45" width="5" height="6"/>
        <rect x="40" y="40" width="12" height="4"/><rect x="40" y="44" width="7" height="6"/>
      </g>

      <!-- MANCHA CENTRAL DE HOLLÍN Y HUMO (Pixel Clusters escalonados) -->
      <!-- Halo exterior pardo quemado -->
      <g fill="#432818">
        <rect x="24" y="22" width="14" height="18"/>
        <rect x="22" y="26" width="18" height="12"/>
        <rect x="36" y="16" width="8" height="10"/>
        <rect x="42" y="12" width="6" height="6"/>
      </g>
      <!-- Masa media de hollín gris carbón -->
      <g fill="#1c1917">
        <rect x="26" y="24" width="12" height="14"/>
        <rect x="24" y="28" width="16" height="8"/>
        <rect x="38" y="18" width="6" height="8"/>
        <rect x="43" y="14" width="4" height="5"/>
      </g>
      <!-- Núcleo negro de hollín denso en la cruz y rastro de humo -->
      <g fill="#0c0a09">
        <rect x="28" y="26" width="8" height="10"/>
        <rect x="26" y="29" width="12" height="5"/>
        <rect x="36" y="22" width="5" height="6"/>
        <rect x="40" y="19" width="4" height="4"/>
        <rect x="44" y="15" width="2" height="3"/>
        <!-- Píxeles sueltos de dithering (Dispersión de humo) -->
        <rect x="25" y="25" width="1" height="1"/><rect x="37" y="25" width="1" height="1"/>
        <rect x="23" y="31" width="1" height="1"/><rect x="27" y="37" width="1" height="1"/>
        <rect x="39" y="29" width="1" height="1"/><rect x="35" y="38" width="1" height="1"/>
        <rect x="42" y="17" width="1" height="1"/><rect x="46" y="13" width="1" height="1"/>
      </g>

      <!-- Grietas escalonadas de 1px y salpicaduras Haboku en los bordes -->
      <g fill="#0c0a09">
        <rect x="4" y="4" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/>
        <rect x="59" y="4" width="1" height="1"/><rect x="60" y="3" width="1" height="1"/>
        <rect x="4" y="59" width="1" height="1"/><rect x="3" y="60" width="1" height="1"/>
        <rect x="59" y="59" width="1" height="1"/><rect x="60" y="60" width="1" height="1"/>
        <rect x="14" y="2" width="1" height="2"/><rect x="15" y="4" width="1" height="1"/>
        <rect x="48" y="60" width="1" height="2"/><rect x="47" y="59" width="1" height="1"/>
        <!-- Salpicaduras de tinta de 1px -->
        <rect x="3" y="8" width="1" height="1"/><rect x="2" y="11" width="1" height="1"/>
        <rect x="9" y="3" width="1" height="1"/><rect x="54" y="2" width="1" height="1"/>
        <rect x="60" y="9" width="1" height="1"/><rect x="61" y="14" width="1" height="1"/>
        <rect x="2" y="52" width="1" height="1"/><rect x="4" y="55" width="1" height="1"/>
        <rect x="9" y="61" width="1" height="1"/><rect x="55" y="61" width="1" height="1"/>
        <rect x="60" y="53" width="1" height="1"/><rect x="58" y="56" width="1" height="1"/>
      </g>
    </g>
  `;
}

/**
 * Tile 24: Techo con Reja / Tragaluz Pixel Art (ceilingCoffered)
 * Hueco central abismal con barrotes forjados en pixel art y remaches.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingCoffered(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#0c0a09"/>
      <rect x="1" y="1" width="62" height="62" fill="#57534e"/>
      <rect x="2" y="2" width="60" height="60" fill="#78716c"/>

      <!-- Hueco abismal central -->
      <rect x="10" y="10" width="44" height="44" fill="#000000"/>
      <rect x="9" y="9" width="46" height="46" fill="none" stroke="#0c0a09" stroke-width="1"/>

      <!-- Barrotes Verticales -->
      <g fill="#18181b">
        <rect x="20" y="10" width="3" height="44"/>
        <rect x="31" y="10" width="3" height="44"/>
        <rect x="42" y="10" width="3" height="44"/>
      </g>
      <g fill="#a8a29e">
        <rect x="20" y="10" width="1" height="44"/>
        <rect x="31" y="10" width="1" height="44"/>
        <rect x="42" y="10" width="1" height="44"/>
      </g>

      <!-- Barrotes Horizontales -->
      <g fill="#18181b">
        <rect x="10" y="20" width="44" height="3"/>
        <rect x="10" y="31" width="44" height="3"/>
        <rect x="10" y="42" width="44" height="3"/>
      </g>
      <g fill="#a8a29e">
        <rect x="10" y="20" width="44" height="1"/>
        <rect x="10" y="31" width="44" height="1"/>
        <rect x="10" y="42" width="44" height="1"/>
      </g>

      <!-- Remaches con acentos bermellón -->
      <g fill="#991b1b">
        <rect x="21" y="21" width="1" height="1"/><rect x="32" y="21" width="1" height="1"/><rect x="43" y="21" width="1" height="1"/>
        <rect x="21" y="32" width="1" height="1"/><rect x="32" y="32" width="1" height="1"/><rect x="43" y="32" width="1" height="1"/>
        <rect x="21" y="43" width="1" height="1"/><rect x="32" y="43" width="1" height="1"/><rect x="43" y="43" width="1" height="1"/>
      </g>
    </g>
  `;
}

/**
 * Tile 25: Techo Agrietado Pixel Art (ceilingCracked)
 * Casetones de bóveda con fractura sísmica de pincel seco escalonada en pixel art.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingCracked(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#0c0a09"/>
      <rect x="1" y="1" width="30" height="30" fill="#78716c"/>
      <rect x="33" y="1" width="30" height="30" fill="#78716c"/>
      <rect x="1" y="33" width="30" height="30" fill="#78716c"/>
      <rect x="33" y="33" width="30" height="30" fill="#78716c"/>

      <!-- Casetones -->
      <rect x="5" y="5" width="22" height="22" fill="#44403c"/>
      <rect x="37" y="5" width="22" height="22" fill="#44403c"/>
      <rect x="5" y="37" width="22" height="22" fill="#44403c"/>
      <rect x="37" y="37" width="22" height="22" fill="#44403c"/>

      <!-- Gran fractura escalonada Nōboku -->
      <path d="M 32,1 L 28,12 L 36,24 L 30,36 L 38,48 L 32,63" stroke="#0c0a09" stroke-width="2" fill="none"/>
      <path d="M 33,1 L 29,12 L 37,24 L 31,36 L 39,48 L 33,63" stroke="#a8a29e" stroke-width="1" fill="none"/>
      <!-- Ramificaciones -->
      <path d="M 28,12 L 16,16" stroke="#0c0a09" stroke-width="1" fill="none"/>
      <path d="M 36,24 L 48,28" stroke="#0c0a09" stroke-width="1" fill="none"/>
      <path d="M 30,36 L 18,44" stroke="#0c0a09" stroke-width="1" fill="none"/>
    </g>
  `;
}

/**
 * Tile 26: Techo Musgoso Pixel Art (ceilingMossy)
 * Casetones de bóveda con líquenes y gotas de condensación en pixel art.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingMossy(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#0c0a09"/>
      <rect x="1" y="1" width="30" height="30" fill="#78716c"/>
      <rect x="33" y="1" width="30" height="30" fill="#78716c"/>
      <rect x="1" y="33" width="30" height="30" fill="#78716c"/>
      <rect x="33" y="33" width="30" height="30" fill="#78716c"/>

      <!-- Casetones -->
      <rect x="5" y="5" width="22" height="22" fill="#44403c"/>
      <rect x="37" y="5" width="22" height="22" fill="#44403c"/>
      <rect x="5" y="37" width="22" height="22" fill="#44403c"/>
      <rect x="37" y="37" width="22" height="22" fill="#44403c"/>

      <!-- Racimos de musgo verde matcha Koke-dera -->
      <g fill="#14532d">
        <circle cx="32" cy="32" r="8"/>
        <rect x="26" y="26" width="12" height="12"/>
        <rect x="14" y="14" width="6" height="6"/>
        <rect x="44" y="44" width="6" height="6"/>
      </g>
      <g fill="#3f6212">
        <circle cx="32" cy="32" r="5"/>
        <rect x="28" y="28" width="8" height="8"/>
        <rect x="15" y="15" width="4" height="4"/>
        <rect x="45" y="45" width="4" height="4"/>
      </g>
      <g fill="#65a30d">
        <rect x="31" y="31" width="2" height="2"/>
        <rect x="16" y="16" width="2" height="2"/>
        <rect x="46" y="46" width="2" height="2"/>
      </g>
    </g>
  `;
}

/**
 * Tile 27: Techo Rúnico Sumi-e Pixel Art (ceilingRunic / sumiePixelCeilingRunic)
 * Rosetón circular con anillo de fuego en tres tonos, 4 kanjis/glifos caligráficos en tinta negra,
 * orbe rojo central y 4 sellos Hanko bermellón en las esquinas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function ceilingRunic(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Mortero perimetral negro -->
      <rect width="64" height="64" fill="#0c0a09"/>

      <!-- Base de piedra ceniza Sumi-e -->
      <rect x="1" y="1" width="62" height="62" fill="#57534e"/>
      <rect x="2" y="2" width="60" height="60" fill="#78716c"/>

      <!-- Bisel de luz superior/izquierdo y sombra inferior/derecha -->
      <rect x="1" y="1" width="61" height="1" fill="#a8a29e"/>
      <rect x="1" y="2" width="1" height="60" fill="#a8a29e"/>
      <rect x="2" y="62" width="61" height="1" fill="#292524"/>
      <rect x="62" y="2" width="1" height="61" fill="#292524"/>

      <!-- 4 SELLOS HANKO BERMELLÓN EN LAS ESQUINAS (Pixel Art 7x7) -->
      <!-- Superior Izquierdo -->
      <rect x="4" y="4" width="7" height="7" fill="#991b1b"/>
      <g fill="#d6cfc2">
        <rect x="5" y="5" width="5" height="1"/><rect x="5" y="7" width="3" height="1"/>
        <rect x="9" y="7" width="1" height="3"/><rect x="5" y="9" width="3" height="1"/>
      </g>
      <!-- Superior Derecho -->
      <rect x="53" y="4" width="7" height="7" fill="#991b1b"/>
      <g fill="#d6cfc2">
        <rect x="54" y="5" width="5" height="1"/><rect x="54" y="7" width="2" height="3"/>
        <rect x="57" y="7" width="2" height="1"/><rect x="57" y="9" width="2" height="1"/>
      </g>
      <!-- Inferior Izquierdo -->
      <rect x="4" y="53" width="7" height="7" fill="#991b1b"/>
      <g fill="#d6cfc2">
        <rect x="5" y="54" width="5" height="1"/><rect x="7" y="55" width="1" height="4"/>
        <rect x="5" y="57" width="5" height="1"/>
      </g>
      <!-- Inferior Derecho -->
      <rect x="53" y="53" width="7" height="7" fill="#991b1b"/>
      <g fill="#d6cfc2">
        <rect x="54" y="54" width="5" height="1"/><rect x="54" y="56" width="5" height="1"/>
        <rect x="56" y="57" width="1" height="2"/><rect x="54" y="59" width="5" height="1"/>
      </g>

      <!-- MEDALLÓN Y ANILLO DE FUEGO PIXELADO -->
      <!-- Borde exterior negro del medallón (Círculo escalonado r=25) -->
      <circle cx="32" cy="32" r="25" fill="#0c0a09"/>
      
      <!-- Canal de fuego rojo oscuro (Base del anillo) -->
      <circle cx="32" cy="32" r="23" fill="#991b1b"/>
      <!-- Fuego naranja intermedio -->
      <circle cx="32" cy="32" r="22" fill="#ea580c"/>
      <!-- Filamento amarillo incandescente (Centro del canal de fuego) -->
      <circle cx="32" cy="32" r="21" fill="#f59e0b"/>
      <circle cx="32" cy="31" r="20.5" fill="#fef08a"/>

      <!-- Borde interno negro que separa el fuego del plato central -->
      <circle cx="32" cy="32" r="19.5" fill="#0c0a09"/>

      <!-- Plato interior de piedra tallada con aguada concéntrica -->
      <circle cx="32" cy="32" r="18" fill="#57534e"/>
      <circle cx="32" cy="32" r="16" fill="#78716c"/>
      <circle cx="32" cy="32" r="14" fill="#a8a29e"/>
      <circle cx="32" cy="32" r="12" fill="#78716c"/>

      <!-- LOS 4 KANJIS / GLIFOS CALIGRÁFICOS EN PIXEL ART (Tinta Negra #0c0a09) -->
      <g fill="#0c0a09">
        <!-- Glifo Superior -->
        <rect x="31" y="15" width="2" height="3"/>
        <rect x="28" y="16" width="1" height="2"/><rect x="35" y="16" width="1" height="2"/>
        <rect x="27" y="18" width="10" height="2"/>
        <rect x="27" y="20" width="1" height="2"/><rect x="36" y="20" width="1" height="2"/>
        <rect x="29" y="21" width="6" height="1"/>
        <rect x="29" y="22" width="2" height="3"/><rect x="33" y="22" width="2" height="3"/>
        <rect x="35" y="24" width="2" height="1"/>

        <!-- Glifo Inferior -->
        <rect x="31" y="39" width="2" height="9"/>
        <rect x="28" y="42" width="8" height="2"/>
        <rect x="28" y="40" width="1" height="3"/><rect x="35" y="40" width="1" height="3"/>
        <rect x="27" y="47" width="10" height="2"/>

        <!-- Glifo Izquierdo -->
        <rect x="17" y="26" width="5" height="2"/>
        <rect x="16" y="28" width="2" height="2"/><rect x="21" y="28" width="2" height="2"/>
        <rect x="16" y="30" width="8" height="2"/>
        <rect x="17" y="33" width="6" height="2"/>
        <rect x="19" y="32" width="2" height="8"/>
        <rect x="17" y="37" width="1" height="3"/><rect x="22" y="37" width="1" height="3"/>

        <!-- Glifo Derecho -->
        <rect x="42" y="26" width="5" height="2"/>
        <rect x="41" y="28" width="7" height="2"/>
        <rect x="41" y="30" width="1" height="3"/><rect x="47" y="30" width="1" height="3"/>
        <rect x="42" y="32" width="5" height="2"/>
        <rect x="44" y="34" width="2" height="7"/>
        <rect x="42" y="39" width="2" height="1"/>
      </g>

      <!-- ORBE / GEMA CENTRAL ROJA -->
      <!-- Anillo de piedra y cavidad oscura -->
      <circle cx="32" cy="32" r="6" fill="#292524"/>
      <circle cx="32" cy="32" r="5" fill="#0c0a09"/>
      <!-- Gema roja cinabrio -->
      <circle cx="32" cy="32" r="4" fill="#991b1b"/>
      <rect x="30" y="30" width="4" height="4" fill="#dc2626"/>
      <!-- Reflejo naranja inferior derecho -->
      <rect x="32" y="32" width="2" height="2" fill="#f59e0b"/>
      <!-- Píxel de brillo especular blanco arriba a la izquierda -->
      <rect x="30" y="30" width="1" height="1" fill="#ffffff"/>

      <!-- Grietas radiales y salpicaduras de tinta de 1px -->
      <g fill="#0c0a09">
        <rect x="14" y="13" width="1" height="1"/><rect x="15" y="14" width="1" height="1"/>
        <rect x="49" y="13" width="1" height="1"/><rect x="48" y="14" width="1" height="1"/>
        <rect x="14" y="50" width="1" height="1"/><rect x="15" y="49" width="1" height="1"/>
        <rect x="49" y="50" width="1" height="1"/><rect x="48" y="49" width="1" height="1"/>
        <!-- Puntos de tinta sueltos -->
        <rect x="12" y="22" width="1" height="1"/>
        <rect x="51" y="24" width="1" height="1"/>
        <rect x="11" y="41" width="1" height="1"/>
        <rect x="52" y="39" width="1" height="1"/>
      </g>
    </g>
  `;
}

// Alias Sumi-e Pixel Art
export const sumiePixelCeilingRegular = ceilingVault;
export const sumiePixelCeilingRunic = ceilingRunic;

// Alias de retrocompatibilidad
export const ceilingClean = ceilingVault;
export const ceilingGrate = ceilingCoffered;

export const ceilingSprites = {
  ceilingVault,
  ceilingCoffered,
  ceilingCracked,
  ceilingMossy,
  ceilingRunic,
  // Alias Pixel Art
  sumiePixelCeilingRegular,
  sumiePixelCeilingRunic,
  // Alias de compatibilidad
  ceilingClean,
  ceilingGrate
};
