// src/render/textures/walls.js

/**
 * Tile 0: Muro de sillar regular con hiladas alternadas y juntas profundas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallRegular(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#d4d4d8"/>
    <rect x="2" y="2" width="${S - 4}" height="38" fill="#e4e4e7"/>
    <rect x="2" y="44" width="${S - 4}" height="40" fill="#d4d4d8"/>
    <rect x="2" y="88" width="${S - 4}" height="38" fill="#e4e4e7"/>
    <!-- Biseles de iluminación -->
    <line x1="0" y1="2" x2="${S}" y2="2" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
    <line x1="0" y1="44" x2="${S}" y2="44" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
    <line x1="0" y1="88" x2="${S}" y2="88" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
    <!-- Juntas de mortero oscuro -->
    <line x1="0" y1="42" x2="${S}" y2="42" stroke="#18181b" stroke-width="4"/>
    <line x1="0" y1="86" x2="${S}" y2="86" stroke="#18181b" stroke-width="4"/>
    <line x1="64" y1="0" x2="64" y2="42" stroke="#18181b" stroke-width="3"/>
    <line x1="32" y1="42" x2="32" y2="86" stroke="#18181b" stroke-width="3"/>
    <line x1="96" y1="42" x2="96" y2="86" stroke="#18181b" stroke-width="3"/>
    <line x1="64" y1="86" x2="64" y2="${S}" stroke="#18181b" stroke-width="3"/>
    <!-- Picado de piedra sutil -->
    <circle cx="24" cy="20" r="2" fill="#71717a" opacity="0.4"/>
    <circle cx="88" cy="24" r="2.5" fill="#a1a1aa" opacity="0.4"/>
    <circle cx="48" cy="64" r="2" fill="#71717a" opacity="0.4"/>
    <circle cx="112" cy="68" r="3" fill="#a1a1aa" opacity="0.4"/>
    <circle cx="34" cy="106" r="2.5" fill="#71717a" opacity="0.4"/>
    <circle cx="94" cy="110" r="2" fill="#a1a1aa" opacity="0.4"/>
  `;
}

/**
 * Tile 1: Muro de sillar agrietado con fracturas diagonales profundas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallCracked(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#d4d4d8"/>
    <!-- Hiladas base -->
    <line x1="0" y1="42" x2="${S}" y2="42" stroke="#18181b" stroke-width="4"/>
    <line x1="0" y1="86" x2="${S}" y2="86" stroke="#18181b" stroke-width="4"/>
    <line x1="64" y1="0" x2="64" y2="42" stroke="#18181b" stroke-width="3"/>
    <line x1="32" y1="42" x2="32" y2="86" stroke="#18181b" stroke-width="3"/>
    <line x1="96" y1="42" x2="96" y2="86" stroke="#18181b" stroke-width="3"/>
    <line x1="64" y1="86" x2="64" y2="${S}" stroke="#18181b" stroke-width="3"/>
    <!-- Grieta principal en zigzag con bisel de sombra y luz -->
    <path d="M 64,4 L 56,22 L 44,38 L 48,56 L 36,72 L 42,94 L 28,124" stroke="#18181b" stroke-width="3.5" fill="none"/>
    <path d="M 65,4 L 57,22 L 45,38 L 49,56 L 37,72 L 43,94 L 29,124" stroke="#ffffff" stroke-width="1.2" opacity="0.7" fill="none"/>
    <!-- Ramificaciones secundarias -->
    <path d="M 44,38 L 26,44" stroke="#18181b" stroke-width="2.2" fill="none"/>
    <path d="M 48,56 L 68,66" stroke="#18181b" stroke-width="2.2" fill="none"/>
    <path d="M 42,94 L 62,102" stroke="#18181b" stroke-width="2.2" fill="none"/>
    <!-- Esquina desconchada -->
    <polygon points="96,42 108,42 96,56" fill="#18181b" opacity="0.8"/>
  `;
}

/**
 * Tile 2: Mampostería irregular con bloques de diferentes tamaños y mortero ancho.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallMasonry(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#18181b"/>
    <!-- Bloques rústicos tallados -->
    <rect x="4" y="4" width="72" height="34" rx="3" fill="#e4e4e7"/>
    <rect x="80" y="4" width="44" height="34" rx="3" fill="#d4d4d8"/>
    <rect x="4" y="42" width="46" height="42" rx="3" fill="#d4d4d8"/>
    <rect x="54" y="42" width="70" height="42" rx="3" fill="#e4e4e7"/>
    <rect x="4" y="88" width="66" height="36" rx="3" fill="#e4e4e7"/>
    <rect x="74" y="88" width="50" height="36" rx="3" fill="#d4d4d8"/>
    <!-- Relieve de bisel en cada bloque individual -->
    <g stroke="#ffffff" stroke-width="1.5" opacity="0.5" fill="none">
      <path d="M 6,36 L 6,6 L 74,6"/>
      <path d="M 82,36 L 82,6 L 122,6"/>
      <path d="M 6,82 L 6,44 L 48,44"/>
      <path d="M 56,82 L 56,44 L 122,44"/>
      <path d="M 6,122 L 6,90 L 68,90"/>
      <path d="M 76,122 L 76,90 L 122,90"/>
    </g>
  `;
}

/**
 * Tile 3: Muro con musgo y humedad entre juntas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallMossy(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#d4d4d8"/>
    <line x1="0" y1="42" x2="${S}" y2="42" stroke="#18181b" stroke-width="4"/>
    <line x1="0" y1="86" x2="${S}" y2="86" stroke="#18181b" stroke-width="4"/>
    <line x1="64" y1="0" x2="64" y2="42" stroke="#18181b" stroke-width="3"/>
    <line x1="32" y1="42" x2="32" y2="86" stroke="#18181b" stroke-width="3"/>
    <line x1="96" y1="42" x2="96" y2="86" stroke="#18181b" stroke-width="3"/>
    <line x1="64" y1="86" x2="64" y2="${S}" stroke="#18181b" stroke-width="3"/>
    <!-- Manchas de humedad oscura -->
    <path d="M 24,42 Q 32,32 40,42 Q 48,50 36,54 Z" fill="#27272a" opacity="0.6"/>
    <path d="M 88,86 Q 96,74 104,86 Q 112,96 92,98 Z" fill="#27272a" opacity="0.6"/>
    <!-- Eclosión de musgo y líquenes -->
    <g fill="#15803d" opacity="0.75">
      <circle cx="28" cy="42" r="5"/><circle cx="36" cy="44" r="6"/><circle cx="44" cy="40" r="4"/>
      <circle cx="92" cy="86" r="6"/><circle cx="100" cy="88" r="5"/><circle cx="106" cy="84" r="4"/>
      <circle cx="62" cy="18" r="4"/><circle cx="66" cy="24" r="5"/>
    </g>
    <g fill="#86efac" opacity="0.5">
      <circle cx="29" cy="41" r="2"/><circle cx="37" cy="43" r="3"/>
      <circle cx="93" cy="85" r="3"/><circle cx="101" cy="87" r="2"/>
    </g>
  `;
}

/**
 * Tile 4: Sillar con glifo rúnico tallado en bajorrelieve.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function wallRunic(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#d4d4d8"/>
    <!-- Bisel perimetral del bloque de altar -->
    <rect x="6" y="6" width="${S - 12}" height="${S - 12}" fill="#e4e4e7" stroke="#18181b" stroke-width="2"/>
    <!-- Medallón central tallado -->
    <circle cx="64" cy="64" r="42" fill="#d4d4d8" stroke="#18181b" stroke-width="3"/>
    <circle cx="64" cy="64" r="40" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
    <!-- Glifo rúnico ancestral (estrella geométrica y rombo sagrado) -->
    <polygon points="64,30 94,64 64,98 34,64" stroke="#18181b" stroke-width="3.5" fill="none"/>
    <polygon points="65,30 95,64 65,98 35,64" stroke="#ffffff" stroke-width="1" opacity="0.5" fill="none"/>
    <line x1="64" y1="24" x2="64" y2="104" stroke="#18181b" stroke-width="3"/>
    <line x1="24" y1="64" x2="104" y2="64" stroke="#18181b" stroke-width="3"/>
    <circle cx="64" cy="64" r="12" stroke="#18181b" stroke-width="2.5" fill="none"/>
    <circle cx="64" cy="64" r="4" fill="#18181b"/>
  `;
}

export const wallSprites = {
  wallRegular,
  wallCracked,
  wallMasonry,
  wallMossy,
  wallRunic
};
