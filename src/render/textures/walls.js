// src/render/textures/walls.js

/**
 * Tile 0: Muro de Cantería Zen Regular (wallRegular)
 * Sillar ancestral sereno en Pixel Art puro (cuadrícula retro 64x64 escalada a 128x128 con crispEdges),
 * aguadas de volumen modeladas con dithering, hilada corrida continua en y=32 y salpicaduras Haboku.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallRegular(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Fondo Washi tradicional -->
      <rect width="64" height="64" fill="#f4efe4"/>
      <rect x="0" y="0" width="64" height="64" fill="#e7ded0" opacity="0.45"/>

      <!-- Hilada de mortero continua en y=31..32 (conecta a y=64 en S=128) -->
      <rect x="0" y="31" width="64" height="2" fill="#292524"/>
      <!-- Sombra de sangrado en la junta -->
      <rect x="0" y="30" width="64" height="1" fill="#78716c" opacity="0.4"/>
      <rect x="0" y="33" width="64" height="1" fill="#78716c" opacity="0.4"/>

      <!-- Juntas verticales asimétricas -->
      <!-- Hilada Superior: junta en x=31..32 -->
      <rect x="31" y="0" width="2" height="31" fill="#292524"/>
      <!-- Hilada Inferior: junta en x=19..20 -->
      <rect x="19" y="33" width="2" height="31" fill="#292524"/>

      <!-- Aguadas de volumen Tanboku en las piedras (Bloques de píxeles) -->
      <!-- Bloque Superior Izquierdo -->
      <g fill="#78716c" opacity="0.25">
        <rect x="3" y="3" width="25" height="8"/>
        <rect x="4" y="11" width="23" height="12"/>
        <rect x="6" y="23" width="20" height="6"/>
      </g>
      <!-- Bloque Superior Derecho -->
      <g fill="#78716c" opacity="0.2">
        <rect x="36" y="4" width="24" height="8"/>
        <rect x="35" y="12" width="25" height="12"/>
        <rect x="37" y="24" width="23" height="5"/>
      </g>
      <!-- Bloque Inferior Izquierdo -->
      <g fill="#78716c" opacity="0.22">
        <rect x="3" y="36" width="13" height="24"/>
      </g>
      <!-- Bloque Inferior Derecho -->
      <g fill="#78716c" opacity="0.25">
        <rect x="24" y="36" width="36" height="10"/>
        <rect x="23" y="46" width="37" height="14"/>
      </g>

      <!-- Salpicaduras Haboku de 1 px -->
      <g fill="#121212">
        <rect x="14" y="12" width="1" height="1"/>
        <rect x="44" y="18" width="1" height="1"/>
        <rect x="10" y="48" width="1" height="1"/>
        <rect x="52" y="42" width="1" height="1"/>
        <rect x="38" y="52" width="1" height="1"/>
      </g>

      <!-- Bordes de absorción de agua (arriba y abajo) -->
      <rect x="0" y="0" width="64" height="1" fill="#292524" opacity="0.3"/>
      <rect x="0" y="63" width="64" height="1" fill="#292524" opacity="0.3"/>
    </g>
  `;
}

/**
 * Tile 1: Muro Zen Agrietado Pixel Art (wallCracked)
 * Losa de roca ancestral con fractura de pincel seco (Nōboku) escalonada y salpicaduras de 1 px.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallCracked(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Fondo Washi -->
      <rect width="64" height="64" fill="#f4efe4"/>
      <rect x="0" y="0" width="64" height="64" fill="#e7ded0" opacity="0.45"/>

      <!-- Hiladas de mortero -->
      <rect x="0" y="31" width="64" height="2" fill="#292524"/>
      <rect x="31" y="0" width="2" height="31" fill="#292524"/>
      <rect x="19" y="33" width="2" height="31" fill="#292524"/>

      <!-- Aguada base -->
      <rect x="3" y="3" width="26" height="26" fill="#78716c" opacity="0.2"/>
      <rect x="35" y="3" width="26" height="26" fill="#78716c" opacity="0.22"/>
      <rect x="23" y="35" width="38" height="25" fill="#78716c" opacity="0.22"/>

      <!-- GRAN FRACTURA DE CORTE NŌBOKU (Trazo caligráfico escalonado) -->
      <g fill="#0c0a09">
        <rect x="32" y="4" width="2" height="4"/><rect x="30" y="8" width="2" height="4"/>
        <rect x="27" y="12" width="2" height="4"/><rect x="25" y="16" width="3" height="3"/>
        <rect x="28" y="19" width="3" height="4"/><rect x="31" y="23" width="2" height="4"/>
        <rect x="33" y="27" width="2" height="5"/>
        <!-- Ramificación a izquierda -->
        <rect x="24" y="14" width="4" height="1"/><rect x="19" y="15" width="5" height="1"/><rect x="16" y="16" width="3" height="1"/>
        <!-- Ramificación a derecha -->
        <rect x="33" y="22" width="5" height="1"/><rect x="38" y="23" width="6" height="1"/>
      </g>
      <!-- Filo de piedra iluminado de 1px -->
      <g fill="#a8a29e">
        <rect x="34" y="4" width="1" height="4"/><rect x="32" y="8" width="1" height="4"/>
        <rect x="29" y="12" width="1" height="4"/><rect x="30" y="19" width="1" height="4"/>
        <rect x="33" y="23" width="1" height="4"/><rect x="35" y="27" width="1" height="5"/>
      </g>

      <!-- Salpicaduras Haboku de 1 px -->
      <g fill="#121212">
        <rect x="28" y="10" width="1" height="1"/><rect x="36" y="20" width="1" height="1"/>
        <rect x="24" y="18" width="1" height="1"/><rect x="46" y="26" width="1" height="1"/>
        <rect x="12" y="44" width="1" height="1"/><rect x="14" y="47" width="1" height="1"/>
      </g>

      <rect x="0" y="0" width="64" height="1" fill="#292524" opacity="0.3"/>
      <rect x="0" y="63" width="64" height="1" fill="#292524" opacity="0.3"/>
    </g>
  `;
}

/**
 * Tile 2: Muro de Mampostería Zen Pixel Art (wallMasonry)
 * Cantos y sillares asimétricos con aguadas diferenciadas en cuadrícula retro 64x64.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallMasonry(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Fondo Washi -->
      <rect width="64" height="64" fill="#f4efe4"/>
      <rect x="0" y="0" width="64" height="64" fill="#e7ded0" opacity="0.45"/>

      <!-- Sillares con aguada independiente y dithering -->
      <rect x="2" y="2" width="36" height="28" fill="#78716c" opacity="0.25"/>
      <rect x="40" y="2" width="22" height="28" fill="#78716c" opacity="0.15"/>
      <rect x="2" y="33" width="22" height="29" fill="#78716c" opacity="0.16"/>
      <rect x="26" y="33" width="36" height="29" fill="#78716c" opacity="0.26"/>

      <!-- Hilada horizontal continua en y=31..32 -->
      <rect x="0" y="31" width="64" height="2" fill="#292524"/>

      <!-- Juntas verticales caligráficas escalonadas -->
      <rect x="38" y="0" width="2" height="31" fill="#292524"/>
      <rect x="24" y="33" width="2" height="31" fill="#292524"/>

      <!-- Puntos de tinta en intersecciones -->
      <rect x="38" y="16" width="1" height="1" fill="#121212"/>
      <rect x="25" y="48" width="1" height="1" fill="#121212"/>
      <rect x="14" y="22" width="1" height="1" fill="#121212"/>
      <rect x="52" y="44" width="1" height="1" fill="#121212"/>

      <rect x="0" y="0" width="64" height="1" fill="#292524" opacity="0.25"/>
      <rect x="0" y="63" width="64" height="1" fill="#292524" opacity="0.25"/>
    </g>
  `;
}

/**
 * Tile 3: Muro Zen Musgoso Pixel Art (wallMossy)
 * Pátina de musgo (Koke-dera) en racimos de píxeles verde matcha sobre fondo Washi.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallMossy(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Fondo Washi -->
      <rect width="64" height="64" fill="#f4efe4"/>
      <rect x="0" y="0" width="64" height="64" fill="#e7ded0" opacity="0.45"/>

      <!-- Hiladas de mortero -->
      <rect x="0" y="31" width="64" height="2" fill="#292524"/>
      <rect x="31" y="0" width="2" height="31" fill="#292524"/>
      <rect x="19" y="33" width="2" height="31" fill="#292524"/>

      <!-- Aguada Tanboku base -->
      <rect x="3" y="3" width="26" height="26" fill="#78716c" opacity="0.2"/>
      <rect x="35" y="3" width="26" height="26" fill="#78716c" opacity="0.22"/>
      <rect x="23" y="35" width="38" height="25" fill="#78716c" opacity="0.22"/>

      <!-- Racimos de musgo verde matcha (Koke-dera) en la junta y esquinas -->
      <g fill="#14532d">
        <rect x="12" y="29" width="10" height="6"/>
        <rect x="42" y="28" width="12" height="7"/>
        <rect x="18" y="35" width="5" height="8"/>
      </g>
      <g fill="#3f6212">
        <rect x="14" y="30" width="6" height="4"/>
        <rect x="44" y="29" width="8" height="4"/>
        <rect x="19" y="36" width="3" height="5"/>
      </g>
      <g fill="#65a30d">
        <rect x="15" y="31" width="2" height="2"/>
        <rect x="46" y="30" width="3" height="2"/>
      </g>

      <rect x="0" y="0" width="64" height="1" fill="#292524" opacity="0.25"/>
      <rect x="0" y="63" width="64" height="1" fill="#292524" opacity="0.25"/>
    </g>
  `;
}

/**
 * Tile 4: Muro Rúnico Zen / Ensō Sagrado Pixel Art (wallRunic)
 * Círculo Ensō caligráfico y glifo arcaico en bermellón cinabrio (Shuniku) con orbe dorado en Pixel Art puro.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallRunic(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Fondo Washi -->
      <rect width="64" height="64" fill="#f4efe4"/>
      <rect x="0" y="0" width="64" height="64" fill="#e7ded0" opacity="0.45"/>

      <!-- Hilada de fondo tenue -->
      <rect x="0" y="31" width="64" height="2" fill="#292524" opacity="0.4"/>

      <!-- Halo místico centrado -->
      <circle cx="32" cy="32" r="26" fill="#78716c" opacity="0.15"/>

      <!-- Ensō caligráfico pixelado (anillo circular incompleto) -->
      <circle cx="32" cy="32" r="22" fill="#0c0a09"/>
      <circle cx="32" cy="32" r="18" fill="#f4efe4"/>
      <!-- Apertura del Ensō (corte zen de pincel en esquina superior derecha) -->
      <rect x="44" y="12" width="10" height="12" fill="#f4efe4"/>

      <!-- Runa ancestral en tinta bermellón cinabrio (Shuniku) -->
      <g fill="#b91c1c">
        <!-- Barra vertical -->
        <rect x="31" y="18" width="2" height="28"/>
        <!-- Barras horizontales -->
        <rect x="21" y="26" width="22" height="2"/>
        <rect x="24" y="38" width="16" height="2"/>
      </g>
      <!-- Núcleo orbe cinabrio y foco dorado -->
      <rect x="30" y="30" width="4" height="4" fill="#dc2626"/>
      <rect x="31" y="31" width="2" height="2" fill="#f59e0b"/>
      <rect x="31" y="31" width="1" height="1" fill="#fef08a"/>

      <!-- Salpicaduras de tinta de 1px -->
      <rect x="52" y="18" width="1" height="1" fill="#0c0a09"/>
      <rect x="55" y="23" width="1" height="1" fill="#0c0a09"/>
      <rect x="24" y="22" width="1" height="1" fill="#b91c1c"/>
      <rect x="41" y="44" width="1" height="1" fill="#b91c1c"/>

      <rect x="0" y="0" width="64" height="1" fill="#292524" opacity="0.25"/>
      <rect x="0" y="63" width="64" height="1" fill="#292524" opacity="0.25"/>
    </g>
  `;
}

export const wallSprites = {
  wallRegular,
  wallCracked,
  wallMasonry,
  wallMossy,
  wallRunic
};
