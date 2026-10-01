// src/render/textures/specials.js

/**
 * Tile 11: RESPAWN_PAD — Losa Rúnica de Aparición / Reaparición de Aventureros.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function respawnPad(S = 128) {
  return `
    <!-- Base de sillar oscuro de piedra mística -->
    <rect width="${S}" height="${S}" fill="#0b0f19"/>
    <rect x="2" y="2" width="${S - 4}" height="${S - 4}" fill="#131b2e"/>

    <!-- Bisel de iluminación: luz cian/plateada arriba-izquierda, sombra profunda abajo-derecha -->
    <path d="M2 2 L${S - 2} 2 L${S - 2} 6 L6 6 L6 ${S - 2} L2 ${S - 2} Z" fill="#38bdf8" opacity="0.35"/>
    <path d="M2 ${S - 2} L${S - 2} ${S - 2} L${S - 2} 2 L${S - 6} 2 L${S - 6} ${S - 6} L2 ${S - 6} Z" fill="#030712" opacity="0.9"/>

    <!-- Esquineros de aleación rúnica y forja celestial -->
    <g fill="#1e293b" stroke="#0284c7" stroke-width="1.2">
      <rect x="5" y="5" width="24" height="5"/>
      <rect x="5" y="5" width="5" height="24"/>
      <rect x="99" y="5" width="24" height="5"/>
      <rect x="118" y="5" width="5" height="24"/>
      <rect x="5" y="118" width="24" height="5"/>
      <rect x="5" y="99" width="5" height="24"/>
      <rect x="99" y="118" width="24" height="5"/>
      <rect x="118" y="99" width="5" height="24"/>
    </g>

    <!-- Remaches rúnicos de zafiro -->
    <g fill="#38bdf8">
      <circle cx="10" cy="10" r="2"/>
      <circle cx="24" cy="10" r="1.8"/>
      <circle cx="10" cy="24" r="1.8"/>
      <circle cx="118" cy="10" r="2"/>
      <circle cx="104" cy="10" r="1.8"/>
      <circle cx="118" cy="24" r="1.8"/>
      <circle cx="10" cy="118" r="2"/>
      <circle cx="24" cy="118" r="1.8"/>
      <circle cx="10" cy="104" r="1.8"/>
      <circle cx="118" cy="118" r="2"/>
      <circle cx="104" cy="118" r="1.8"/>
      <circle cx="118" cy="104" r="1.8"/>
    </g>

    <!-- Halo místico de invocación / resonancia -->
    <circle cx="64" cy="64" r="44" fill="#0284c7" opacity="0.12"/>
    <circle cx="64" cy="64" r="34" fill="#38bdf8" opacity="0.18"/>

    <!-- Círculos concéntricos de invocación tallados en bajorrelieve -->
    <circle cx="64" cy="64" r="48" fill="none" stroke="#075985" stroke-width="2.5"/>
    <circle cx="64" cy="64" r="48" fill="none" stroke="#38bdf8" stroke-width="1.2" opacity="0.8"/>
    <circle cx="64" cy="64" r="32" fill="none" stroke="#0284c7" stroke-width="2"/>
    <circle cx="64" cy="64" r="32" fill="none" stroke="#7dd3fc" stroke-width="1" opacity="0.9"/>

    <!-- Glifos cardinales rúnicos en los 4 extremos -->
    <g fill="#38bdf8" opacity="0.95">
      <circle cx="64" cy="20" r="3.5"/>
      <circle cx="64" cy="108" r="3.5"/>
      <circle cx="20" cy="64" r="3.5"/>
      <circle cx="108" cy="64" r="3.5"/>
    </g>

    <!-- Estrella rúnica de 4 puntas de reaparición / rosa de los vientos sagrada -->
    <polygon points="64,24 72,56 104,64 72,72 64,104 56,72 24,64 56,56" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
    <polygon points="64,28 70,58 100,64 70,70 64,100 58,70 28,64 58,58" fill="#38bdf8" opacity="0.8"/>
    <polygon points="64,36 68,60 92,64 68,68 64,92 60,68 36,64 60,60" fill="#e0f2fe" opacity="0.95"/>

    <!-- Núcleo de energía de almas -->
    <circle cx="64" cy="64" r="9" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="64" cy="64" r="5" fill="#f0f9ff"/>
  `;
}

/**
 * Tile 14: JUMP_PAD — Losa de Cantería con Runa Ámbar de Salto.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function jumpPad(S = 128) {
  return `
    <!-- base: sillar oscuro de los nuevos pilares -->
    <rect width="${S}" height="${S}" fill="#0a0c10"/>
    <rect x="2" y="2" width="${S - 4}" height="${S - 4}" fill="#252a32"/>

    <!-- bisel: luz cenital arriba-izquierda, sombra abajo-derecha -->
    <path d="M2 2 L${S - 2} 2 L${S - 2} 6 L6 6 L6 ${S - 2} L2 ${S - 2} Z" fill="#3d434c" opacity="0.9"/>
    <path d="M2 ${S - 2} L${S - 2} ${S - 2} L${S - 2} 2 L${S - 6} 2 L${S - 6} ${S - 6} L2 ${S - 6} Z" fill="#14181e" opacity="0.9"/>

    <!-- grietas (herencia de la ruina del abismo) -->
    <g stroke="#14181e" stroke-width="1.2" fill="none" opacity="0.8">
      <path d="M2 40 L10 44 L8 52 L14 58"/>
      <path d="M126 82 L118 86 L120 94 L112 100"/>
      <path d="M56 2 L60 8 L58 14"/>
    </g>
    <g stroke="#3d434c" stroke-width="0.5" fill="none" opacity="0.45">
      <path d="M3 41 L11 45 L9 53 L15 59"/>
      <path d="M125 83 L117 87 L119 95 L111 101"/>
    </g>

    <!-- esquineros de hierro forjado -->
    <g fill="#27272a" stroke="#0a0c10" stroke-width="1">
      <rect x="6" y="6" width="22" height="4"/>
      <rect x="6" y="6" width="4" height="22"/>
      <rect x="100" y="6" width="22" height="4"/>
      <rect x="118" y="6" width="4" height="22"/>
      <rect x="6" y="118" width="22" height="4"/>
      <rect x="6" y="100" width="4" height="22"/>
      <rect x="100" y="118" width="22" height="4"/>
      <rect x="118" y="100" width="4" height="22"/>
    </g>

    <!-- remaches dorados -->
    <g fill="#8a7a4a">
      <circle cx="10" cy="10" r="1.8"/>
      <circle cx="24" cy="10" r="1.8"/>
      <circle cx="10" cy="24" r="1.8"/>
      <circle cx="118" cy="10" r="1.8"/>
      <circle cx="104" cy="10" r="1.8"/>
      <circle cx="118" cy="24" r="1.8"/>
      <circle cx="10" cy="118" r="1.8"/>
      <circle cx="24" cy="118" r="1.8"/>
      <circle cx="10" cy="104" r="1.8"/>
      <circle cx="118" cy="118" r="1.8"/>
      <circle cx="104" cy="118" r="1.8"/>
      <circle cx="118" cy="104" r="1.8"/>
    </g>

    <!-- halo ámbar contenido (visibilidad a distancia sin fluorescencia) -->
    <circle cx="64" cy="64" r="32" fill="#d97706" opacity="0.08"/>

    <!-- surco de sombra bajo la runa (da efecto de bajorrelieve tallado) -->
    <g fill="none" stroke="#0a0c10" stroke-width="2.6" opacity="0.9" stroke-linecap="round">
      <path d="M65 35 Q47 49 47 65 Q47 81 65 97 Q83 81 83 65 Q83 49 65 35"/>
      <path d="M65 51 Q55 59 55 65 Q55 71 65 79"/>
      <path d="M65 97 L65 109"/>
      <path d="M65 109 L58 100 M65 109 L72 100"/>
    </g>

    <!-- runa tallada: espiral de viento + flecha ascendente -->
    <g fill="none" stroke="#d97706" stroke-width="2.2" opacity="0.9" stroke-linecap="round">
      <path d="M64 34 Q46 48 46 64 Q46 80 64 96 Q82 80 82 64 Q82 48 64 34"/>
      <path d="M64 50 Q54 58 54 64 Q54 70 64 78"/>
      <path d="M64 96 L64 108"/>
      <path d="M64 108 L57 99 M64 108 L71 99"/>
    </g>

    <!-- brillo interior de la runa (sub-acento, calidez y volumen) -->
    <g fill="none" stroke="#f5a623" stroke-width="1.1" opacity="0.6" stroke-linecap="round">
      <path d="M64 34 Q46 48 46 64 Q46 80 64 96 Q82 80 82 64 Q82 48 64 34"/>
      <path d="M64 96 L64 108"/>
    </g>
  `;
}

/**
 * Tile 15: ESPECIAL / PEDESTALES — Glifo rúnico ceremonial con octagrama místico.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pedestalOctagram(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#18181b"/>
    <circle cx="64" cy="64" r="56" fill="#27272a" stroke="#d4d4d8" stroke-width="2.5"/>
    <circle cx="64" cy="64" r="50" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
    <!-- Octagrama / Estrella mágica de 8 puntas -->
    <polygon points="64,18 78,50 110,64 78,78 64,110 50,78 18,64 50,50" fill="#e4e4e7" stroke="#18181b" stroke-width="2"/>
    <polygon points="64,28 74,54 100,64 74,74 64,100 54,74 28,64 54,54" fill="#ffffff" opacity="0.4"/>
    <circle cx="64" cy="64" r="14" fill="#27272a" stroke="#ffffff" stroke-width="2"/>
    <circle cx="64" cy="64" r="6" fill="#e4e4e7"/>
  `;
}

export const specialSprites = {
  respawnPad,
  jumpPad,
  pedestalOctagram
};
