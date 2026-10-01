// src/render/textures/lava.js

/**
 * Genera la estructura base unificada para todos los sprites de lava:
 * gradientes térmicos, fondo ígneo incandescente, canales de flujo magmático
 * en 4 capas de temperatura y placas tectónicas perimetrales de basalto/obsidiana.
 * Comparte la misma filosofía que los pilares: estructura común idéntica
 * con ligeros cambios/detalles distintivos en el interior de cada variante.
 *
 * @param {string} idSuffix - Sufijo para IDs únicos en defs SVG.
 * @param {number} S - Tamaño de celda en píxeles.
 * @returns {string} Fragmento SVG base unificado.
 */
function createLavaBaseSvg(idSuffix, S = 128) {
  return `
    <defs>
      <!-- Núcleo ígneo incandescente: transición de blanco-oro a carmesí volcánico -->
      <radialGradient id="lava-core-${idSuffix}" cx="42%" cy="48%" r="62%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="14%" stop-color="#fef08a"/>
        <stop offset="30%" stop-color="#f59e0b"/>
        <stop offset="55%" stop-color="#ea580c"/>
        <stop offset="78%" stop-color="#dc2626"/>
        <stop offset="92%" stop-color="#991b1b"/>
        <stop offset="100%" stop-color="#450a0a"/>
      </radialGradient>

      <!-- Corriente secundaria de magma fluido -->
      <radialGradient id="lava-flow-${idSuffix}" cx="78%" cy="75%" r="50%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="25%" stop-color="#f97316"/>
        <stop offset="60%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#7f1d1d"/>
      </radialGradient>

      <!-- Corteza de basalto y obsidiana con biselado de enfriamiento -->
      <linearGradient id="lava-basalt-${idSuffix}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2d2a29"/>
        <stop offset="40%" stop-color="#1c1917"/>
        <stop offset="75%" stop-color="#141211"/>
        <stop offset="100%" stop-color="#0c0a09"/>
      </linearGradient>
    </defs>

    <!-- Capa 1: Fondo de magma fundido con resonancia térmica unificada -->
    <rect width="${S}" height="${S}" fill="#450a0a"/>
    <rect width="${S}" height="${S}" fill="url(#lava-core-${idSuffix})"/>
    <circle cx="98" cy="92" r="54" fill="url(#lava-flow-${idSuffix})" opacity="0.85"/>

    <!-- Capa 2: Canales y afluentes de magma viscoso en capas térmicas continuas -->
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- Aura térmica profunda -->
      <path d="M 0,34 Q 32,46 54,42 Q 78,38 98,54 Q 114,64 128,52" stroke="#ea580c" stroke-width="15" opacity="0.65"/>
      <path d="M 52,42 Q 62,64 56,86 Q 50,106 36,128" stroke="#ea580c" stroke-width="13" opacity="0.6"/>
      <path d="M 56,86 Q 78,94 102,86 Q 116,80 128,94" stroke="#ea580c" stroke-width="12" opacity="0.55"/>

      <!-- Corriente líquida naranja fuego -->
      <path d="M 0,34 Q 32,46 54,42 Q 78,38 98,54 Q 114,64 128,52" stroke="#f97316" stroke-width="8"/>
      <path d="M 52,42 Q 62,64 56,86 Q 50,106 36,128" stroke="#f97316" stroke-width="7"/>
      <path d="M 56,86 Q 78,94 102,86 Q 116,80 128,94" stroke="#f97316" stroke-width="6.5"/>

      <!-- Núcleo solar áureo -->
      <path d="M 0,34 Q 32,46 54,42 Q 78,38 98,54 Q 114,64 128,52" stroke="#facc15" stroke-width="3.5"/>
      <path d="M 52,42 Q 62,64 56,86 Q 50,106 36,128" stroke="#facc15" stroke-width="3"/>
      <path d="M 56,86 Q 78,94 102,86 Q 116,80 128,94" stroke="#facc15" stroke-width="2.8"/>

      <!-- Filamento incandescente blanco-amarillo (máxima temperatura) -->
      <path d="M 0,34 Q 32,46 54,42 Q 78,38 98,54 Q 114,64 128,52" stroke="#fffbeb" stroke-width="1.4" opacity="0.95"/>
      <path d="M 52,42 Q 62,64 56,86 Q 50,106 36,128" stroke="#fffbeb" stroke-width="1.2" opacity="0.9"/>
      <path d="M 56,86 Q 78,94 102,86 Q 116,80 128,94" stroke="#fffbeb" stroke-width="1.1" opacity="0.85"/>
    </g>

    <!-- Capa 3: Placas tectónicas unificadas de basalto y obsidiana con bordes fundidos -->
    <!-- Placa 1: Noroeste / Superior-Izquierda -->
    <g>
      <polygon points="0,0 62,0 52,20 36,30 16,26 0,20" fill="none" stroke="#b91c1c" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="0,0 62,0 52,20 36,30 16,26 0,20" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="0,0 60,0 50,18 35,28 15,24 0,18" fill="url(#lava-basalt-${idSuffix})"/>
      <path d="M 12,2 L 20,10 L 16,18 M 38,4 L 32,12" stroke="#7f1d1d" stroke-width="1" fill="none" opacity="0.85"/>
      <path d="M 12,2 L 19,9" stroke="#ef4444" stroke-width="0.5" fill="none" opacity="0.7"/>
      <circle cx="28" cy="12" r="2.2" fill="#3f3f46" opacity="0.45"/>
      <circle cx="10" cy="14" r="1.6" fill="#1c1917"/>
    </g>

    <!-- Placa 2: Noreste / Superior-Derecha -->
    <g>
      <polygon points="72,0 128,0 128,42 108,34 86,24 72,8" fill="none" stroke="#b91c1c" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="72,0 128,0 128,42 108,34 86,24 72,8" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="74,0 128,0 128,40 106,32 85,22 74,8" fill="url(#lava-basalt-${idSuffix})"/>
      <path d="M 104,6 L 98,16 L 102,24" stroke="#7f1d1d" stroke-width="1" fill="none" opacity="0.85"/>
      <path d="M 104,6 L 99,14" stroke="#ef4444" stroke-width="0.5" fill="none" opacity="0.7"/>
      <circle cx="118" cy="18" r="2.5" fill="#3f3f46" opacity="0.5"/>
    </g>

    <!-- Placa 3: Este / Centro-Derecha -->
    <g>
      <polygon points="86,46 128,58 128,80 110,82 86,68 76,54" fill="none" stroke="#b91c1c" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="86,46 128,58 128,80 110,82 86,68 76,54" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="88,48 128,60 128,78 108,80 88,66 78,54" fill="url(#lava-basalt-${idSuffix})"/>
      <path d="M 112,68 L 102,72" stroke="#7f1d1d" stroke-width="1" fill="none" opacity="0.8"/>
      <circle cx="98" cy="62" r="2" fill="#3f3f46" opacity="0.4"/>
    </g>

    <!-- Placa 4: Suroeste / Centro-Izquierda -->
    <g>
      <polygon points="0,38 24,42 40,64 30,88 0,94" fill="none" stroke="#b91c1c" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="0,38 24,42 40,64 30,88 0,94" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="0,40 22,44 38,64 28,86 0,92" fill="url(#lava-basalt-${idSuffix})"/>
      <path d="M 8,58 L 18,64 L 14,76" stroke="#7f1d1d" stroke-width="1" fill="none" opacity="0.85"/>
      <path d="M 8,58 L 16,63" stroke="#ef4444" stroke-width="0.5" fill="none" opacity="0.7"/>
      <circle cx="16" cy="52" r="2.2" fill="#3f3f46" opacity="0.45"/>
    </g>

    <!-- Placa 5: Sur / Centro-Inferior -->
    <g>
      <polygon points="44,106 68,94 98,100 94,128 30,128 36,114" fill="none" stroke="#b91c1c" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="44,106 68,94 98,100 94,128 30,128 36,114" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="46,108 68,96 96,102 92,128 32,128 38,116" fill="url(#lava-basalt-${idSuffix})"/>
      <path d="M 64,110 L 70,122" stroke="#7f1d1d" stroke-width="1" fill="none" opacity="0.8"/>
      <circle cx="56" cy="118" r="2.2" fill="#3f3f46" opacity="0.45"/>
    </g>

    <!-- Placa 6: Sureste / Esquina Inferior-Derecha -->
    <g>
      <polygon points="114,96 128,92 128,128 102,128" fill="none" stroke="#b91c1c" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="114,96 128,92 128,128 102,128" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="116,98 128,94 128,128 104,128" fill="url(#lava-basalt-${idSuffix})"/>
      <circle cx="120" cy="116" r="1.8" fill="#3f3f46" opacity="0.5"/>
    </g>

    <!-- Islote Flotante Central de Obsidiana -->
    <g>
      <polygon points="44,52 64,46 72,58 64,72 46,68" fill="none" stroke="#b91c1c" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="44,52 64,46 72,58 64,72 46,68" fill="none" stroke="#f97316" stroke-width="1.2" stroke-linejoin="round" opacity="0.85"/>
      <polygon points="45,53 63,48 70,58 63,70 47,67" fill="url(#lava-basalt-${idSuffix})"/>
      <circle cx="56" cy="58" r="1.6" fill="#3f3f46" opacity="0.6"/>
    </g>
  `;
}

/**
 * Tile 13: LAVA 1 — Magma Activo / Flujo Base.
 * Estructura base unificada con flujo magmático limpio y ascuas sutiles en suspensión.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaActive(S = 128) {
  return `
    ${createLavaBaseSvg('13', S)}

    <!-- Detalle Característico 1: Ascuas y chispas sutiles en suspensión continua -->
    <g>
      <circle cx="38" cy="46" r="3.5" fill="#ea580c" opacity="0.35"/>
      <circle cx="38" cy="46" r="1.6" fill="#fffbeb"/>
      <circle cx="78" cy="42" r="4" fill="#f97316" opacity="0.35"/>
      <circle cx="78" cy="42" r="1.8" fill="#ffffff"/>
      <circle cx="68" cy="82" r="3.8" fill="#ea580c" opacity="0.35"/>
      <circle cx="68" cy="82" r="1.7" fill="#fef08a"/>
      <circle cx="118" cy="72" r="3" fill="#f97316" opacity="0.3"/>
      <circle cx="118" cy="72" r="1.3" fill="#ffffff"/>
      <circle cx="18" cy="84" r="3" fill="#ea580c" opacity="0.3"/>
      <circle cx="18" cy="84" r="1.2" fill="#fef08a"/>
      <circle cx="88" cy="116" r="3.2" fill="#f97316" opacity="0.3"/>
      <circle cx="88" cy="116" r="1.4" fill="#fffbeb"/>
    </g>
  `;
}

/**
 * Tile 16: LAVA 2 — Magma con Fisuras en la Corteza de Basalto.
 * Misma base unificada con red de micro-fracturas incandescentes en las placas de roca.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaFissures(S = 128) {
  return `
    ${createLavaBaseSvg('16', S)}

    <!-- Detalle Característico 2: Micro-fisuras y fracturas incandescentes en las placas de basalto -->
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- Fisuras en Placa Noroeste -->
      <path d="M 6,4 L 18,14 L 32,10 L 44,22" stroke="#ea580c" stroke-width="2.5" opacity="0.85"/>
      <path d="M 6,4 L 18,14 L 32,10 L 44,22" stroke="#fef08a" stroke-width="1.2"/>
      <path d="M 18,14 L 14,24" stroke="#f97316" stroke-width="1.2"/>
      <!-- Fisuras en Placa Noreste -->
      <path d="M 82,4 L 94,14 L 112,12 L 122,24" stroke="#ea580c" stroke-width="2.5" opacity="0.85"/>
      <path d="M 82,4 L 94,14 L 112,12 L 122,24" stroke="#fef08a" stroke-width="1.2"/>
      <path d="M 94,14 L 100,28" stroke="#f97316" stroke-width="1.2"/>
      <!-- Fisuras en Placa Suroeste -->
      <path d="M 4,48 L 16,54 L 20,72 L 12,84" stroke="#ea580c" stroke-width="2.5" opacity="0.85"/>
      <path d="M 4,48 L 16,54 L 20,72 L 12,84" stroke="#fef08a" stroke-width="1.2"/>
      <!-- Fisuras en Placa Sur -->
      <path d="M 50,112 L 62,122 L 76,118" stroke="#ea580c" stroke-width="2.2" opacity="0.85"/>
      <path d="M 50,112 L 62,122 L 76,118" stroke="#fef08a" stroke-width="1.1"/>
      <!-- Fisura en Islote Central -->
      <path d="M 48,54 L 56,60 L 66,56" stroke="#f97316" stroke-width="1.4"/>
    </g>

    <!-- Puntos de magma vivo brotando de las fisuras -->
    <g fill="#fffbeb">
      <circle cx="18" cy="14" r="1.8"/><circle cx="94" cy="14" r="1.8"/>
      <circle cx="16" cy="54" r="1.8"/><circle cx="62" cy="122" r="1.6"/>
      <circle cx="56" cy="60" r="1.4"/>
    </g>
  `;
}

/**
 * Tile 17: LAVA 3 — Magma con Burbujas en Ebullición.
 * Misma base unificada con domos de gas volcánico y burbujas magmáticas 3D hirvientes.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaGeysers(S = 128) {
  return `
    <defs>
      <!-- Gradiente esférico para burbujas magmáticas 3D -->
      <radialGradient id="lava-bubble-17" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="25%" stop-color="#fef08a"/>
        <stop offset="55%" stop-color="#f97316"/>
        <stop offset="85%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#7f1d1d"/>
      </radialGradient>
    </defs>
    ${createLavaBaseSvg('17', S)}

    <!-- Detalle Característico 3: Burbujas de gas magmático en ebullición sobre los canales -->
    <!-- Burbuja Principal Grande (Canal Central-Izquierdo) -->
    <g>
      <circle cx="48" cy="88" r="8" fill="#f97316" opacity="0.35"/>
      <circle cx="48" cy="88" r="5.6" fill="url(#lava-bubble-17)"/>
      <ellipse cx="46.5" cy="86" rx="2.2" ry="1.3" fill="#ffffff" opacity="0.95"/>
    </g>

    <!-- Burbuja Mediana 1 (Canal Superior) -->
    <g>
      <circle cx="80" cy="44" r="6.8" fill="#f97316" opacity="0.35"/>
      <circle cx="80" cy="44" r="4.8" fill="url(#lava-bubble-17)"/>
      <ellipse cx="78.8" cy="42.5" rx="1.8" ry="1.1" fill="#ffffff" opacity="0.95"/>
    </g>

    <!-- Burbuja Mediana 2 (Canal Este) -->
    <g>
      <circle cx="106" cy="58" r="6" fill="#f97316" opacity="0.35"/>
      <circle cx="106" cy="58" r="4.2" fill="url(#lava-bubble-17)"/>
      <ellipse cx="104.8" cy="56.8" rx="1.5" ry="0.9" fill="#ffffff" opacity="0.9"/>
    </g>

    <!-- Burbuja Menor 1 (Canal Inferior) -->
    <g>
      <circle cx="64" cy="98" r="5.2" fill="#f97316" opacity="0.3"/>
      <circle cx="64" cy="98" r="3.5" fill="url(#lava-bubble-17)"/>
      <circle cx="63.2" cy="97" r="1.1" fill="#ffffff" opacity="0.9"/>
    </g>

    <!-- Burbuja Menor 2 (Canal Oeste) -->
    <g>
      <circle cx="28" cy="38" r="4.5" fill="#f97316" opacity="0.3"/>
      <circle cx="28" cy="38" r="3" fill="url(#lava-bubble-17)"/>
      <circle cx="27.3" cy="37.2" r="0.9" fill="#ffffff" opacity="0.9"/>
    </g>

    <!-- Anillos concéntricos de tensión térmica -->
    <circle cx="48" cy="88" r="11" fill="none" stroke="#ea580c" stroke-width="1.2" opacity="0.5"/>
    <circle cx="80" cy="44" r="9.5" fill="none" stroke="#ea580c" stroke-width="1.2" opacity="0.5"/>
  `;
}

/**
 * Tile 18: LAVA 4 — Magma con Enjambre de Ascuas y Chispas Volcánicas.
 * Misma base unificada con lluvia activa de ascuas flotantes y micro-destellos térmicos.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaRiver(S = 128) {
  return `
    ${createLavaBaseSvg('18', S)}

    <!-- Detalle Característico 4: Enjambre de ascuas ardientes, chispas voladoras y micro-destellos térmicos -->
    <g>
      <!-- Enjambre de chispas en canal principal -->
      <circle cx="24" cy="36" r="2.8" fill="#ea580c" opacity="0.4"/>
      <circle cx="24" cy="36" r="1.4" fill="#ffffff"/>

      <circle cx="42" cy="44" r="3.2" fill="#f97316" opacity="0.4"/>
      <circle cx="42" cy="44" r="1.6" fill="#fffbeb"/>

      <circle cx="64" cy="40" r="3.5" fill="#ea580c" opacity="0.45"/>
      <circle cx="64" cy="40" r="1.8" fill="#ffffff"/>

      <circle cx="84" cy="50" r="3.2" fill="#f97316" opacity="0.4"/>
      <circle cx="84" cy="50" r="1.5" fill="#fef08a"/>

      <circle cx="102" cy="62" r="3" fill="#ea580c" opacity="0.4"/>
      <circle cx="102" cy="62" r="1.4" fill="#ffffff"/>

      <circle cx="120" cy="54" r="2.6" fill="#f97316" opacity="0.35"/>
      <circle cx="120" cy="54" r="1.2" fill="#fffbeb"/>

      <!-- Chispas en canal vertical -->
      <circle cx="56" cy="68" r="3.2" fill="#ea580c" opacity="0.4"/>
      <circle cx="56" cy="68" r="1.5" fill="#fef08a"/>

      <circle cx="52" cy="90" r="3.5" fill="#f97316" opacity="0.45"/>
      <circle cx="52" cy="90" r="1.8" fill="#ffffff"/>

      <circle cx="40" cy="112" r="3" fill="#ea580c" opacity="0.4"/>
      <circle cx="40" cy="112" r="1.4" fill="#fffbeb"/>

      <!-- Chispas en canal sureste -->
      <circle cx="76" cy="88" r="3.2" fill="#f97316" opacity="0.4"/>
      <circle cx="76" cy="88" r="1.6" fill="#ffffff"/>

      <circle cx="98" cy="92" r="3.4" fill="#ea580c" opacity="0.45"/>
      <circle cx="98" cy="92" r="1.7" fill="#fef08a"/>

      <circle cx="116" cy="84" r="2.8" fill="#f97316" opacity="0.35"/>
      <circle cx="116" cy="84" r="1.3" fill="#ffffff"/>
    </g>

    <!-- Micro-destellos de calor extremo en filamentos -->
    <g stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.9">
      <line x1="64" y1="36" x2="64" y2="44"/>
      <line x1="60" y1="40" x2="68" y2="40"/>
      <line x1="52" y1="86" x2="52" y2="94"/>
      <line x1="48" y1="90" x2="56" y2="90"/>
    </g>
  `;
}

/**
 * Tile 19: LAVA 5 — Magma con Costra Flotante de Obsidiana / Escoria en Enfriamiento.
 * Misma base unificada con placas menores de escoria y obsidiana arrastradas por el flujo.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaCaldera(S = 128) {
  return `
    ${createLavaBaseSvg('19', S)}

    <!-- Detalle Característico 5: Costras y fragmentos flotantes de obsidiana en enfriamiento parcial -->
    <!-- Costra 1: Canal Superior -->
    <g>
      <polygon points="68,36 78,32 84,40 76,46 66,42" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="68,36 78,32 84,40 76,46 66,42" fill="none" stroke="#f97316" stroke-width="1" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="69,37 77,33 83,40 76,45 67,42" fill="#141211"/>
      <circle cx="74" cy="38" r="1" fill="#3f3f46" opacity="0.6"/>
    </g>

    <!-- Costra 2: Confluencia Media -->
    <g>
      <polygon points="50,72 60,68 64,78 56,84 48,80" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="50,72 60,68 64,78 56,84 48,80" fill="none" stroke="#f97316" stroke-width="1" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="51,73 59,69 63,77 56,83 49,80" fill="#141211"/>
      <circle cx="56" cy="76" r="1.1" fill="#3f3f46" opacity="0.6"/>
    </g>

    <!-- Costra 3: Canal Este -->
    <g>
      <polygon points="98,72 108,68 112,76 104,82 96,78" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="98,72 108,68 112,76 104,82 96,78" fill="none" stroke="#f97316" stroke-width="1" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="99,73 107,69 111,75 104,81 97,78" fill="#141211"/>
      <circle cx="104" cy="74" r="1" fill="#3f3f46" opacity="0.6"/>
    </g>

    <!-- Costra 4: Canal Inferior-Sur -->
    <g>
      <polygon points="40,110 48,106 52,114 46,120 38,116" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="40,110 48,106 52,114 46,120 38,116" fill="none" stroke="#f97316" stroke-width="1" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="41,111 47,107 51,113 46,119 39,116" fill="#141211"/>
      <circle cx="45" cy="112" r="0.9" fill="#3f3f46" opacity="0.6"/>
    </g>

    <!-- Estelas de arrastre viscoso alrededor de las costras -->
    <g stroke="#f97316" stroke-width="0.8" fill="none" opacity="0.7">
      <path d="M 64,38 Q 66,34 72,32"/>
      <path d="M 46,74 Q 48,70 54,68"/>
      <path d="M 94,74 Q 96,70 102,68"/>
    </g>
  `;
}

export const lavaSprites = {
  lavaActive,
  lavaFissures,
  lavaGeysers,
  lavaRiver,
  lavaCaldera
};
