// src/render/textures/specials.js

/**
 * Tile 11: RESPAWN_PAD — Losa Rúnica de Aparición / Reaparición de Aventureros.
 * Cantería de pizarra abismal en Pixel Art Sumi-e puro (64x64 escalado), herrajes esquineros
 * de hierro, tramado de invocación en azul cian espiritual (#38bdf8) y rosa de los vientos
 * de 4 puntas con núcleo de almas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function respawnPad(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Mortero negro carbón perimetral -->
      <rect width="64" height="64" fill="#080c14"/>

      <!-- Base de sillar estelar Sumi-e -->
      <rect x="1" y="1" width="62" height="62" fill="#131b2e"/>
      <rect x="3" y="3" width="58" height="58" fill="#1e293b"/>

      <!-- Bisel de luz cian superior/izquierdo y sombra profunda inferior/derecha -->
      <path d="M1,1 H62 V2 H2 V62 H1 Z" fill="#38bdf8"/>
      <path d="M2,62 H63 V1 H62 V61 H2 Z" fill="#030712"/>

      <!-- Aguada interior oscura y grietas de pincel seco (Kasure) -->
      <rect x="8" y="8" width="48" height="48" fill="#0f172a"/>
      <path d="M14,3 V7 M15,5 H18 M50,57 V61 M48,59 H52 M3,36 H7 M57,26 H61" stroke="#080c14" stroke-width="1" fill="none"/>

      <!-- Esquineros de forja celestial con remaches de zafiro -->
      <g fill="#334155">
        <path d="M3,3 H15 V6 H6 V15 H3 Z"/>
        <path d="M49,3 H61 V15 H58 V6 H49 Z"/>
        <path d="M3,49 H6 V58 H15 V61 H3 Z"/>
        <path d="M58,49 H61 V61 H49 V58 H58 Z"/>
      </g>
      <g fill="#0284c7">
        <rect x="3" y="3" width="12" height="1"/><rect x="3" y="3" width="1" height="12"/>
        <rect x="49" y="3" width="12" height="1"/><rect x="60" y="3" width="1" height="12"/>
        <rect x="3" y="60" width="12" height="1"/><rect x="3" y="49" width="1" height="12"/>
        <rect x="49" y="60" width="12" height="1"/><rect x="60" y="49" width="1" height="12"/>
      </g>
      <!-- Remaches luminosos de 1px -->
      <g fill="#7dd3fc">
        <rect x="5" y="5" width="1" height="1"/><rect x="12" y="5" width="1" height="1"/><rect x="5" y="12" width="1" height="1"/>
        <rect x="58" y="5" width="1" height="1"/><rect x="51" y="5" width="1" height="1"/><rect x="58" y="12" width="1" height="1"/>
        <rect x="5" y="58" width="1" height="1"/><rect x="12" y="58" width="1" height="1"/><rect x="5" y="51" width="1" height="1"/>
        <rect x="58" y="58" width="1" height="1"/><rect x="51" y="58" width="1" height="1"/><rect x="58" y="51" width="1" height="1"/>
      </g>

      <!-- Círculos concéntricos de invocación en bajorrelieve pixelado -->
      <circle cx="32" cy="32" r="23" fill="none" stroke="#080c14" stroke-width="2"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#0284c7" stroke-width="1"/>
      <circle cx="32" cy="32" r="16" fill="#131b2e" stroke="#0369a1" stroke-width="1"/>
      <circle cx="32" cy="32" r="15" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3 1"/>

      <!-- Tramado (Dithering) de resonancia espiritual -->
      <g fill="#0284c7">
        <rect x="20" y="20" width="1" height="1"/><rect x="43" y="20" width="1" height="1"/>
        <rect x="20" y="43" width="1" height="1"/><rect x="43" y="43" width="1" height="1"/>
        <rect x="31" y="13" width="2" height="1"/><rect x="31" y="50" width="2" height="1"/>
        <rect x="13" y="31" width="1" height="2"/><rect x="50" y="31" width="1" height="2"/>
      </g>

      <!-- 4 Nodos cardinales de anclaje -->
      <g fill="#38bdf8">
        <rect x="31" y="9" width="2" height="2"/>
        <rect x="31" y="53" width="2" height="2"/>
        <rect x="9" y="31" width="2" height="2"/>
        <rect x="53" y="31" width="2" height="2"/>
      </g>

      <!-- Estrella Rúnica de 4 puntas / Rosa de los Vientos -->
      <!-- Sombra de tinta negra de la estrella -->
      <polygon points="32,11 37,27 53,32 37,37 32,53 27,37 11,32 27,27" fill="#080c14"/>
      <!-- Cuerpo zafiro -->
      <polygon points="32,12 36,28 52,32 36,36 32,52 28,36 12,32 28,28" fill="#0284c7"/>
      <!-- Filo cian celeste -->
      <polygon points="32,15 35,29 49,32 35,35 32,49 29,35 15,32 29,29" fill="#38bdf8"/>
      <!-- Cruce interior blanco alma -->
      <polygon points="32,19 34,30 45,32 34,34 32,45 30,34 19,32 30,30" fill="#e0f2fe"/>

      <!-- Núcleo de energía de almas -->
      <rect x="29" y="29" width="6" height="6" fill="#0369a1"/>
      <rect x="30" y="30" width="4" height="4" fill="#38bdf8"/>
      <rect x="31" y="31" width="2" height="2" fill="#ffffff"/>
    </g>
  `;
}

/**
 * Tile 14: JUMP_PAD — Losa con Runa Ámbar de Salto Potenciado (+35%).
 * Basalto oscuro en Pixel Art Sumi-e puro (64x64 escalado), con esquineros de hierro,
 * remaches de bronce antiguo, grietas del abismo y el glifo tallado de torbellino
 * ascendente en ámbar y oro (#d97706 / #fef08a).
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function jumpPad(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Mortero negro carbón -->
      <rect width="64" height="64" fill="#0a0c10"/>

      <!-- Sillar de basalto oscuro -->
      <rect x="1" y="1" width="62" height="62" fill="#27272a"/>
      <rect x="3" y="3" width="58" height="58" fill="#3f3f46"/>
      <rect x="6" y="6" width="52" height="52" fill="#27272a"/>

      <!-- Bisel de iluminación cenital -->
      <path d="M1,1 H62 V2 H2 V62 H1 Z" fill="#71717a"/>
      <path d="M2,62 H63 V1 H62 V61 H2 Z" fill="#09090b"/>

      <!-- Grietas tectónicas escalonadas de 1px -->
      <g fill="#09090b">
        <path d="M2,20 H5 V22 H4 V26 H7 V29 H6 V27 H3 V22 H2 Z"/>
        <path d="M62,41 H59 V43 H60 V47 H56 V50 H58 V48 H61 V43 H62 Z"/>
        <rect x="28" y="2" width="1" height="3"/><rect x="29" y="4" width="1" height="3"/>
      </g>
      <g fill="#52525b">
        <rect x="5" y="21" width="1" height="1"/><rect x="7" y="28" width="1" height="1"/>
        <rect x="58" y="42" width="1" height="1"/><rect x="55" y="49" width="1" height="1"/>
      </g>

      <!-- Esquineros de hierro forjado negro -->
      <g fill="#18181b">
        <path d="M3,3 H14 V6 H6 V14 H3 Z"/>
        <path d="M50,3 H61 V14 H58 V6 H50 Z"/>
        <path d="M3,50 H6 V58 H14 V61 H3 Z"/>
        <path d="M58,50 H61 V61 H50 V58 H58 Z"/>
      </g>
      <!-- Remaches dorados de forja -->
      <g fill="#ca8a04">
        <rect x="4" y="4" width="2" height="2"/><rect x="11" y="4" width="1" height="2"/><rect x="4" y="11" width="2" height="1"/>
        <rect x="58" y="4" width="2" height="2"/><rect x="52" y="4" width="1" height="2"/><rect x="58" y="11" width="2" height="1"/>
        <rect x="4" y="58" width="2" height="2"/><rect x="11" y="58" width="1" height="2"/><rect x="4" y="52" width="2" height="1"/>
        <rect x="58" y="58" width="2" height="2"/><rect x="52" y="58" width="1" height="2"/><rect x="58" y="52" width="2" height="1"/>
      </g>
      <g fill="#fef08a">
        <rect x="4" y="4" width="1" height="1"/><rect x="58" y="4" width="1" height="1"/>
        <rect x="4" y="58" width="1" height="1"/><rect x="58" y="58" width="1" height="1"/>
      </g>

      <!-- Placa octogonal central rehundida -->
      <polygon points="22,10 42,10 54,22 54,42 42,54 22,54 10,42 10,22" fill="#18181b" stroke="#09090b" stroke-width="1"/>
      <polygon points="23,12 41,12 52,23 52,41 41,52 23,52 12,41 12,23" fill="#27272a"/>

      <!-- Tramado (Dithering) de calor ámbar alrededor del glifo -->
      <g fill="#78350f">
        <rect x="20" y="24" width="1" height="1"/><rect x="43" y="24" width="1" height="1"/>
        <rect x="18" y="32" width="1" height="1"/><rect x="45" y="32" width="1" height="1"/>
        <rect x="22" y="42" width="1" height="1"/><rect x="41" y="42" width="1" height="1"/>
      </g>

      <!-- SURCO PROFUNDO TALLADO (Sombra negra desplazada 1px) -->
      <g fill="none" stroke="#09090b" stroke-width="3">
        <path d="M32,16 Q21,25 21,34 Q21,43 32,49 Q43,43 43,34 Q43,25 32,16"/>
        <path d="M32,25 Q26,30 26,34 Q26,39 32,42"/>
        <path d="M32,14 V54"/>
        <path d="M24,22 L32,14 L40,22"/>
      </g>

      <!-- RUNA DE IMPULSO ÁMBAR: Espiral de torbellino + Flecha ascendente -->
      <g fill="none" stroke="#d97706" stroke-width="2">
        <path d="M32,16 Q21,25 21,34 Q21,43 32,49 Q43,43 43,34 Q43,25 32,16"/>
        <path d="M32,25 Q26,30 26,34 Q26,39 32,42"/>
        <path d="M32,14 V53"/>
        <path d="M24,22 L32,14 L40,22"/>
      </g>

      <!-- Filamento central incandescente amarillo oro de 1px -->
      <g fill="none" stroke="#f59e0b" stroke-width="1">
        <path d="M32,16 Q21,25 21,34 Q21,43 32,49 Q43,43 43,34 Q43,25 32,16"/>
        <path d="M32,14 V52"/>
        <path d="M25,21 L32,14 L39,21"/>
      </g>
      <!-- Puntos de luz blanca en la punta de la flecha y el vórtice -->
      <rect x="31" y="14" width="2" height="2" fill="#fef08a"/>
      <rect x="31" y="33" width="2" height="2" fill="#fef08a"/>
    </g>
  `;
}

/**
 * Tile 13 (Especial): PRESSURE_PAD — Losa Mecánica de Presión.
 * Placa cuadrada hundible en Pixel Art Sumi-e puro (64x64 escalado), con ranuras de pistón,
 * abrazaderas de hierro y canales de activación en bermellón Hanko (#b91c1c / #ef4444)
 * que conectan hacia los 4 bordes del bloque.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pressurePad(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Mortero negro carbón -->
      <rect width="64" height="64" fill="#0c0a09"/>

      <!-- Marco exterior fijo de piedra ceniza -->
      <rect x="1" y="1" width="62" height="62" fill="#44403c"/>
      <path d="M1,1 H62 V2 H2 V62 H1 Z" fill="#78716c"/>
      <path d="M2,62 H63 V1 H62 V61 H2 Z" fill="#1c1917"/>

      <!-- Foso mecánico profundo (Holgura para que la placa baje al pisarla) -->
      <rect x="7" y="7" width="50" height="50" fill="#09090b"/>
      <!-- Bisel invertido del foso -->
      <path d="M7,57 H57 V7 H56 V56 H7 Z" fill="#57534e"/>

      <!-- Canales de transmisión rúnica en los 4 puntos cardinales -->
      <g fill="#7f1d1d">
        <rect x="29" y="1" width="6" height="8"/>
        <rect x="29" y="55" width="6" height="8"/>
        <rect x="1" y="29" width="8" height="6"/>
        <rect x="55" y="29" width="8" height="6"/>
      </g>
      <g fill="#ef4444">
        <rect x="31" y="1" width="2" height="8"/>
        <rect x="31" y="55" width="2" height="8"/>
        <rect x="1" y="31" width="8" height="2"/>
        <rect x="55" y="31" width="8" height="2"/>
      </g>

      <!-- PLACA MÓVIL CENTRAL DE BASALTO -->
      <rect x="10" y="10" width="44" height="44" fill="#292524"/>
      <path d="M10,10 H53 V11 H11 V53 H10 Z" fill="#57534e"/>
      <path d="M11,53 H54 V10 H53 V52 H11 Z" fill="#1c1917"/>

      <!-- Abrazaderas de esquina de hierro pesado -->
      <g fill="#18181b">
        <rect x="10" y="10" width="8" height="8"/>
        <rect x="46" y="10" width="8" height="8"/>
        <rect x="10" y="46" width="8" height="8"/>
        <rect x="46" y="46" width="8" height="8"/>
      </g>
      <g fill="#dc2626">
        <rect x="13" y="13" width="2" height="2"/>
        <rect x="49" y="13" width="2" height="2"/>
        <rect x="13" y="49" width="2" height="2"/>
        <rect x="49" y="49" width="2" height="2"/>
      </g>

      <!-- Grabado de circuito de presión en bermellón Sumi-e -->
      <rect x="18" y="18" width="28" height="28" fill="none" stroke="#0c0a09" stroke-width="3"/>
      <rect x="18" y="18" width="28" height="28" fill="none" stroke="#b91c1c" stroke-width="1"/>
      
      <!-- Líneas diagonales de tensión mecánica hacia el botón central -->
      <path d="M18,18 L26,26 M46,18 L38,26 M18,46 L26,38 M46,46 L38,38" stroke="#0c0a09" stroke-width="3"/>
      <path d="M18,18 L26,26 M46,18 L38,26 M18,46 L26,38 M46,46 L38,38" stroke="#ef4444" stroke-width="1"/>

      <!-- Botón / Sello Hanko central de activación -->
      <rect x="24" y="24" width="16" height="16" fill="#0c0a09"/>
      <rect x="26" y="26" width="12" height="12" fill="#991b1b"/>
      <rect x="27" y="27" width="10" height="10" fill="none" stroke="#fca5a5" stroke-width="1"/>
      <!-- Glifo de peso / presión en el centro -->
      <path d="M29,30 H35 M32,28 V36 M29,35 H35" stroke="#fef08a" stroke-width="1"/>
    </g>
  `;
}

/**
 * Tile 15: PEDESTAL — Losa Ceremonial de Octagrama (pedestalOctagram).
 * Altar circular de piedra sagrada en Pixel Art Sumi-e puro (64x64 escalado), con el octagrama
 * místico (estrella de 8 puntas entrelazada) en marfil antiguo (#e4e4e7), sellos Hanko
 * en las esquinas y receptáculo ardiente para el Ojo de Runa.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pedestalOctagram(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Mortero negro carbón -->
      <rect width="64" height="64" fill="#0c0a09"/>

      <!-- Losa de cantería de santuario -->
      <rect x="1" y="1" width="62" height="62" fill="#383431"/>
      <rect x="2" y="2" width="60" height="60" fill="#44403c"/>

      <!-- Bisel perimetral -->
      <path d="M1,1 H62 V2 H2 V62 H1 Z" fill="#78716c"/>
      <path d="M2,62 H63 V1 H62 V61 H2 Z" fill="#1c1917"/>

      <!-- 4 Sellos Hanko rituales en las esquinas -->
      <g fill="#991b1b">
        <rect x="4" y="4" width="6" height="6"/>
        <rect x="54" y="4" width="6" height="6"/>
        <rect x="4" y="54" width="6" height="6"/>
        <rect x="54" y="54" width="6" height="6"/>
      </g>
      <g fill="#d6cfc2">
        <rect x="5" y="5" width="4" height="1"/><rect x="6" y="7" width="2" height="2"/>
        <rect x="55" y="5" width="4" height="1"/><rect x="56" y="7" width="2" height="2"/>
        <rect x="5" y="55" width="4" height="1"/><rect x="6" y="57" width="2" height="2"/>
        <rect x="55" y="55" width="4" height="1"/><rect x="56" y="57" width="2" height="2"/>
      </g>

      <!-- Plataforma circular ceremonial en bajorrelieve -->
      <circle cx="32" cy="32" r="25" fill="#0c0a09"/>
      <circle cx="32" cy="32" r="24" fill="#292524"/>
      <circle cx="32" cy="32" r="22" fill="#1c1917" stroke="#57534e" stroke-width="1"/>
      <!-- Anillo de luz rúnica -->
      <circle cx="32" cy="32" r="20" fill="none" stroke="#a8a29e" stroke-width="1" stroke-dasharray="4 2"/>

      <!-- OCTAGRAMA MÍSTICO (Dos cuadrados entrelazados a 45 grados) -->
      <!-- Sombra de grabado de los dos cuadrados -->
      <rect x="17" y="17" width="30" height="30" fill="none" stroke="#0c0a09" stroke-width="3"/>
      <polygon points="32,11 53,32 32,53 11,32" fill="none" stroke="#0c0a09" stroke-width="3"/>

      <!-- Cuadrado 1 (Ortogonal en piedra marfil #e4e4e7) -->
      <rect x="17" y="17" width="30" height="30" fill="none" stroke="#d4d4d8" stroke-width="1.5"/>
      
      <!-- Cuadrado 2 (Rotado 45° en marfil brillante #f4f4f5) -->
      <polygon points="32,11 53,32 32,53 11,32" fill="none" stroke="#e4e4e7" stroke-width="1.5"/>

      <!-- 8 Nodos brillantes en los vértices del octagrama -->
      <g fill="#ffffff">
        <rect x="31" y="10" width="2" height="2"/><rect x="31" y="52" width="2" height="2"/>
        <rect x="10" y="31" width="2" height="2"/><rect x="52" y="31" width="2" height="2"/>
        <rect x="16" y="16" width="2" height="2"/><rect x="46" y="16" width="2" height="2"/>
        <rect x="16" y="46" width="2" height="2"/><rect x="46" y="46" width="2" height="2"/>
      </g>

      <!-- Líneas interiores de convergencia hacia el pedestal -->
      <path d="M32,14 V50 M14,32 H50 M19,19 L45,45 M45,19 L19,45" stroke="#0c0a09" stroke-width="1"/>

      <!-- Anillo de engaste central (Base del Pedestal 3D / Ojo de Runa) -->
      <circle cx="32" cy="32" r="9" fill="#0c0a09" stroke="#e4e4e7" stroke-width="1"/>
      <circle cx="32" cy="32" r="7" fill="#7f1d1d"/>
      <circle cx="32" cy="32" r="5" fill="#dc2626"/>
      <circle cx="32" cy="32" r="3" fill="#f59e0b"/>
      <!-- Destello especular central -->
      <rect x="31" y="31" width="2" height="2" fill="#fef08a"/>
      <rect x="30" y="30" width="1" height="1" fill="#ffffff"/>
    </g>
  `;
}

export const specialSprites = {
  respawnPad,
  jumpPad,
  pressurePad,
  pedestalOctagram
};
