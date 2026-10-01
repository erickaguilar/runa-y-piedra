// src/render/textures/lava.js

/**
 * Tile 13: LAVA 1 — Magma Volcánico Incandescente con Corteza de Basalto y afluentes divergentes.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaActive(S = 128) {
  return `
    <defs>
      <!-- Núcleo ígneo incandescente: transición de blanco-oro a carmesí volcánico -->
      <radialGradient id="lava-core-13" cx="42%" cy="48%" r="62%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="14%" stop-color="#fef08a"/>
        <stop offset="30%" stop-color="#f59e0b"/>
        <stop offset="55%" stop-color="#ea580c"/>
        <stop offset="78%" stop-color="#dc2626"/>
        <stop offset="92%" stop-color="#991b1b"/>
        <stop offset="100%" stop-color="#450a0a"/>
      </radialGradient>

      <!-- Corriente secundaria de magma fluido -->
      <radialGradient id="lava-flow-13" cx="78%" cy="75%" r="50%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="25%" stop-color="#f97316"/>
        <stop offset="60%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#7f1d1d"/>
      </radialGradient>

      <!-- Corteza de basalto y obsidiana con biselado de enfriamiento -->
      <linearGradient id="lava-basalt-13" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2d2a29"/>
        <stop offset="40%" stop-color="#1c1917"/>
        <stop offset="75%" stop-color="#141211"/>
        <stop offset="100%" stop-color="#0c0a09"/>
      </linearGradient>

      <!-- Burbuja magmática de gas a presión -->
      <radialGradient id="lava-bubble-13" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="25%" stop-color="#fef08a"/>
        <stop offset="55%" stop-color="#f97316"/>
        <stop offset="85%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#7f1d1d"/>
      </radialGradient>
    </defs>

    <!-- Capa 1: Fondo de magma fundido con resonancia térmica -->
    <rect width="${S}" height="${S}" fill="#450a0a"/>
    <rect width="${S}" height="${S}" fill="url(#lava-core-13)"/>
    <circle cx="98" cy="92" r="54" fill="url(#lava-flow-13)" opacity="0.85"/>

    <!-- Capa 2: Canales y afluentes de magma viscoso en capas térmicas -->
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

    <!-- Capa 3: Placas tectónicas de basalto y obsidiana con bordes fundidos -->
    <!-- Placa 1: Noroeste / Superior-Izquierda -->
    <g>
      <polygon points="-2,-2 62,-2 52,20 36,30 16,26 -2,20" fill="none" stroke="#b91c1c" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-2,-2 62,-2 52,20 36,30 16,26 -2,20" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="-2,-2 60,-2 50,18 35,28 15,24 -2,18" fill="url(#lava-basalt-13)"/>
      <path d="M 12,2 L 20,10 L 16,18 M 38,4 L 32,12" stroke="#7f1d1d" stroke-width="1" fill="none" opacity="0.85"/>
      <path d="M 12,2 L 19,9" stroke="#ef4444" stroke-width="0.5" fill="none" opacity="0.7"/>
      <circle cx="28" cy="12" r="2.2" fill="#3f3f46" opacity="0.45"/>
      <circle cx="10" cy="14" r="1.6" fill="#1c1917"/>
    </g>

    <!-- Placa 2: Noreste / Superior-Derecha -->
    <g>
      <polygon points="72,-2 130,-2 130,42 108,34 86,24 72,8" fill="none" stroke="#b91c1c" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="72,-2 130,-2 130,42 108,34 86,24 72,8" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="74,-2 130,-2 130,40 106,32 85,22 74,8" fill="url(#lava-basalt-13)"/>
      <path d="M 104,6 L 98,16 L 102,24" stroke="#7f1d1d" stroke-width="1" fill="none" opacity="0.85"/>
      <path d="M 104,6 L 99,14" stroke="#ef4444" stroke-width="0.5" fill="none" opacity="0.7"/>
      <circle cx="118" cy="18" r="2.5" fill="#3f3f46" opacity="0.5"/>
    </g>

    <!-- Placa 3: Este / Centro-Derecha -->
    <g>
      <polygon points="86,46 130,58 130,80 110,82 86,68 76,54" fill="none" stroke="#b91c1c" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="86,46 130,58 130,80 110,82 86,68 76,54" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="88,48 130,60 130,78 108,80 88,66 78,54" fill="url(#lava-basalt-13)"/>
      <path d="M 112,68 L 102,72" stroke="#7f1d1d" stroke-width="1" fill="none" opacity="0.8"/>
      <circle cx="98" cy="62" r="2" fill="#3f3f46" opacity="0.4"/>
    </g>

    <!-- Placa 4: Suroeste / Centro-Izquierda -->
    <g>
      <polygon points="-2,38 24,42 40,64 30,88 -2,94" fill="none" stroke="#b91c1c" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="-2,38 24,42 40,64 30,88 -2,94" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="-2,40 22,44 38,64 28,86 -2,92" fill="url(#lava-basalt-13)"/>
      <path d="M 8,58 L 18,64 L 14,76" stroke="#7f1d1d" stroke-width="1" fill="none" opacity="0.85"/>
      <path d="M 8,58 L 16,63" stroke="#ef4444" stroke-width="0.5" fill="none" opacity="0.7"/>
      <circle cx="16" cy="52" r="2.2" fill="#3f3f46" opacity="0.45"/>
    </g>

    <!-- Placa 5: Sur / Centro-Inferior -->
    <g>
      <polygon points="44,106 68,94 98,100 94,130 30,130 36,114" fill="none" stroke="#b91c1c" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="44,106 68,94 98,100 94,130 30,130 36,114" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="46,108 68,96 96,102 92,130 32,130 38,116" fill="url(#lava-basalt-13)"/>
      <path d="M 64,110 L 70,122" stroke="#7f1d1d" stroke-width="1" fill="none" opacity="0.8"/>
      <circle cx="56" cy="118" r="2.2" fill="#3f3f46" opacity="0.45"/>
    </g>

    <!-- Placa 6: Sureste / Esquina Inferior-Derecha -->
    <g>
      <polygon points="114,96 130,92 130,130 102,130" fill="none" stroke="#b91c1c" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="114,96 130,92 130,130 102,130" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <polygon points="116,98 130,94 130,130 104,130" fill="url(#lava-basalt-13)"/>
      <circle cx="120" cy="116" r="1.8" fill="#3f3f46" opacity="0.5"/>
    </g>

    <!-- Islote Flotante Central de Obsidiana -->
    <g>
      <polygon points="44,52 64,46 72,58 64,72 46,68" fill="none" stroke="#b91c1c" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="44,52 64,46 72,58 64,72 46,68" fill="none" stroke="#f97316" stroke-width="1.2" stroke-linejoin="round" opacity="0.85"/>
      <polygon points="45,53 63,48 70,58 63,70 47,67" fill="url(#lava-basalt-13)"/>
      <circle cx="56" cy="58" r="1.6" fill="#3f3f46" opacity="0.6"/>
    </g>

    <!-- Capa 4: Vórtices, Burbujas Magmáticas y Domos de Gas -->
    <!-- Burbuja Grande en ebullición (Centro-Izquierda) -->
    <g>
      <circle cx="48" cy="88" r="7.5" fill="#f97316" opacity="0.35"/>
      <circle cx="48" cy="88" r="5.2" fill="url(#lava-bubble-13)"/>
      <ellipse cx="46.5" cy="86" rx="2" ry="1.2" fill="#ffffff" opacity="0.9"/>
    </g>

    <!-- Burbuja Mediana (Superior-Derecha) -->
    <g>
      <circle cx="106" cy="58" r="5.5" fill="#f97316" opacity="0.35"/>
      <circle cx="106" cy="58" r="3.8" fill="url(#lava-bubble-13)"/>
      <ellipse cx="105" cy="56.8" rx="1.4" ry="0.8" fill="#ffffff" opacity="0.9"/>
    </g>

    <!-- Burbuja Pequeña (Inferior-Derecha) -->
    <g>
      <circle cx="82" cy="78" r="4.2" fill="#f97316" opacity="0.3"/>
      <circle cx="82" cy="78" r="2.8" fill="url(#lava-bubble-13)"/>
      <circle cx="81.2" cy="77.2" r="0.9" fill="#ffffff" opacity="0.9"/>
    </g>

    <!-- Cráter de gas recién reventado con centro incandescente -->
    <g>
      <circle cx="28" cy="38" r="3.6" fill="#18181b" stroke="#7f1d1d" stroke-width="1"/>
      <circle cx="28" cy="38" r="1.8" fill="#facc15"/>
      <circle cx="28" cy="38" r="0.9" fill="#ffffff"/>
    </g>

    <!-- Capa 5: Chispas y Ascuas Ígneas Volcánicas (Ember Sparks) con aura de luz -->
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
 * Tile 16: LAVA 2 — Corteza de Basalto Fracturada & Fisuras de Magma Vivo.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaFissures(S = 128) {
  return `
    <defs>
      <radialGradient id="lava-glow-16" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="20%" stop-color="#fef08a"/>
        <stop offset="45%" stop-color="#f97316"/>
        <stop offset="75%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#450a0a"/>
      </radialGradient>
      <linearGradient id="lava-basalt-16" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#262322"/>
        <stop offset="50%" stop-color="#191716"/>
        <stop offset="100%" stop-color="#0c0a09"/>
      </linearGradient>
    </defs>

    <!-- Fondo incandescente bajo las placas -->
    <rect width="${S}" height="${S}" fill="url(#lava-glow-16)"/>

    <!-- Gran red de fisuras de magma ardiente (Halo de calor) -->
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 0,28 L 34,36 L 62,24 L 88,48 L 128,40 M 62,24 L 68,64 L 54,92 L 64,128 M 68,64 L 102,74 L 128,88 M 54,92 L 24,104 L 0,96 M 34,36 L 22,68 L 24,104" stroke="#ea580c" stroke-width="12" opacity="0.7"/>
      <path d="M 0,28 L 34,36 L 62,24 L 88,48 L 128,40 M 62,24 L 68,64 L 54,92 L 64,128 M 68,64 L 102,74 L 128,88 M 54,92 L 24,104 L 0,96 M 34,36 L 22,68 L 24,104" stroke="#f97316" stroke-width="6"/>
      <path d="M 0,28 L 34,36 L 62,24 L 88,48 L 128,40 M 62,24 L 68,64 L 54,92 L 64,128 M 68,64 L 102,74 L 128,88 M 54,92 L 24,104 L 0,96 M 34,36 L 22,68 L 24,104" stroke="#facc15" stroke-width="2.6"/>
      <path d="M 0,28 L 34,36 L 62,24 L 88,48 L 128,40 M 62,24 L 68,64 L 54,92 L 64,128 M 68,64 L 102,74 L 128,88 M 54,92 L 24,104 L 0,96 M 34,36 L 22,68 L 24,104" stroke="#ffffff" stroke-width="1.2" opacity="0.9"/>
    </g>

    <!-- Placas tectónicas de basalto oscuro enfriado -->
    <polygon points="-2,-2 60,-2 58,20 32,32 0,24" fill="url(#lava-basalt-16)" stroke="#7f1d1d" stroke-width="1"/>
    <polygon points="66,-2 130,-2 130,36 90,44 64,20" fill="url(#lava-basalt-16)" stroke="#7f1d1d" stroke-width="1"/>
    <polygon points="-2,32 18,34 18,64 20,100 -2,92" fill="url(#lava-basalt-16)" stroke="#7f1d1d" stroke-width="1"/>
    <polygon points="26,40 58,30 64,60 50,88 26,64" fill="url(#lava-basalt-16)" stroke="#7f1d1d" stroke-width="1"/>
    <polygon points="94,50 130,42 130,84 106,70 74,60" fill="url(#lava-basalt-16)" stroke="#7f1d1d" stroke-width="1"/>
    <polygon points="-2,100 20,108 50,96 58,130 -2,130" fill="url(#lava-basalt-16)" stroke="#7f1d1d" stroke-width="1"/>
    <polygon points="70,68 102,78 130,92 130,130 68,130 58,96" fill="url(#lava-basalt-16)" stroke="#7f1d1d" stroke-width="1"/>

    <!-- Micro-grietas en las placas con brillo interno -->
    <g stroke="#ea580c" stroke-width="0.8" fill="none" opacity="0.75">
      <path d="M 12,6 L 24,14 L 32,10 M 80,8 L 92,16 M 10,114 L 20,122 L 32,118 M 84,104 L 96,112"/>
    </g>
    <g fill="#fef08a" opacity="0.85">
      <circle cx="62" cy="24" r="2"/><circle cx="68" cy="64" r="2.4"/><circle cx="54" cy="92" r="1.8"/>
    </g>
  `;
}

/**
 * Tile 17: LAVA 3 — Géiseres, Domos de Gas & Burbujas Hirvientes en Erupción.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaGeysers(S = 128) {
  return `
    <defs>
      <radialGradient id="lava-base-17" cx="48%" cy="52%" r="65%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="25%" stop-color="#f97316"/>
        <stop offset="65%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#450a0a"/>
      </radialGradient>
      <radialGradient id="lava-bubble-major-17" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="20%" stop-color="#fef08a"/>
        <stop offset="45%" stop-color="#f59e0b"/>
        <stop offset="70%" stop-color="#ea580c"/>
        <stop offset="90%" stop-color="#991b1b"/>
        <stop offset="100%" stop-color="#450a0a"/>
      </radialGradient>
      <radialGradient id="lava-bubble-burst-17" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="35%" stop-color="#facc15"/>
        <stop offset="70%" stop-color="#f97316"/>
        <stop offset="100%" stop-color="#7f1d1d"/>
      </radialGradient>
    </defs>

    <!-- Base de magma ardiente -->
    <rect width="${S}" height="${S}" fill="url(#lava-base-17)"/>

    <!-- Ondas de choque térmico concéntricas -->
    <circle cx="44" cy="54" r="38" fill="none" stroke="#ea580c" stroke-width="2" opacity="0.45"/>
    <circle cx="44" cy="54" r="30" fill="none" stroke="#f97316" stroke-width="1.8" opacity="0.6"/>
    <circle cx="92" cy="38" r="26" fill="none" stroke="#ea580c" stroke-width="1.5" opacity="0.5"/>

    <!-- Gran Domo Alfa (Burbuja Gigante antes de estallar) -->
    <circle cx="44" cy="54" r="22" fill="url(#lava-bubble-major-17)"/>
    <path d="M 32,42 Q 40,36 50,40" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.9"/>
    <circle cx="34" cy="44" r="2" fill="#ffffff" opacity="0.95"/>

    <!-- Domo Beta (En erupción / estallido expulsando salpicaduras) -->
    <circle cx="92" cy="38" r="15" fill="url(#lava-bubble-burst-17)"/>
    <path d="M 84,30 Q 90,26 96,28" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.85"/>
    <circle cx="92" cy="38" r="16" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="4,2"/>
    <circle cx="96" cy="18" r="2.5" fill="#facc15"/><circle cx="108" cy="28" r="2" fill="#f97316"/>
    <circle cx="80" cy="24" r="1.8" fill="#fffbeb"/><circle cx="106" cy="46" r="2.2" fill="#ea580c"/>

    <!-- Burbujas secundarias menores -->
    <circle cx="32" cy="100" r="12" fill="url(#lava-bubble-burst-17)"/>
    <path d="M 26,94 Q 30,92 35,93" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.8"/>
    <circle cx="98" cy="98" r="14" fill="url(#lava-bubble-major-17)"/>
    <path d="M 90,90 Q 95,87 102,89" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.85"/>
    <circle cx="70" cy="82" r="8" fill="url(#lava-bubble-burst-17)"/>

    <!-- Costras menores de basalto flotante arrastradas -->
    <polygon points="6,12 18,8 22,20 10,24" fill="#1c1917" stroke="#7f1d1d" stroke-width="0.8"/>
    <polygon points="112,74 124,70 126,82 116,84" fill="#1c1917" stroke="#7f1d1d" stroke-width="0.8"/>
  `;
}

/**
 * Tile 18: LAVA 4 — Río Rápido de Magma / Corriente Piroclástica Diagonal.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaRiver(S = 128) {
  return `
    <defs>
      <linearGradient id="lava-river-18" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#450a0a"/>
        <stop offset="25%" stop-color="#dc2626"/>
        <stop offset="50%" stop-color="#f97316"/>
        <stop offset="75%" stop-color="#facc15"/>
        <stop offset="90%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#fffbeb"/>
      </linearGradient>
      <linearGradient id="lava-edge-18" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1c1917"/>
        <stop offset="100%" stop-color="#0c0a09"/>
      </linearGradient>
    </defs>

    <!-- Base ígnea de gran caudal -->
    <rect width="${S}" height="${S}" fill="#7f1d1d"/>
    <rect width="${S}" height="${S}" fill="url(#lava-river-18)" opacity="0.9"/>

    <!-- Líneas de corriente fluidodinámica en alta velocidad -->
    <g fill="none" stroke-linecap="round">
      <path d="M -6,110 Q 24,96 54,64 Q 84,32 120,4 Q 128,-4 134,-6" stroke="#ea580c" stroke-width="18" opacity="0.6"/>
      <path d="M 4,134 Q 38,104 68,72 Q 98,40 134,16" stroke="#ea580c" stroke-width="14" opacity="0.55"/>
      <path d="M -6,110 Q 24,96 54,64 Q 84,32 120,4 Q 128,-4 134,-6" stroke="#f97316" stroke-width="9"/>
      <path d="M 4,134 Q 38,104 68,72 Q 98,40 134,16" stroke="#f97316" stroke-width="7"/>
      <path d="M -6,110 Q 24,96 54,64 Q 84,32 120,4 Q 128,-4 134,-6" stroke="#fef08a" stroke-width="4"/>
      <path d="M 4,134 Q 38,104 68,72 Q 98,40 134,16" stroke="#fde047" stroke-width="3"/>
      <path d="M -4,110 Q 24,96 54,64 Q 84,32 120,4" stroke="#ffffff" stroke-width="1.8" opacity="0.95"/>
      <path d="M 6,132 Q 38,104 68,72 Q 98,40 132,16" stroke="#ffffff" stroke-width="1.4" opacity="0.9"/>
    </g>

    <!-- Orillas de roca y basalto que canalizan el torrente -->
    <polygon points="-2,-2 82,-2 52,24 24,44 -2,66" fill="url(#lava-edge-18)" stroke="#7f1d1d" stroke-width="1.2"/>
    <polygon points="66,130 130,130 130,52 108,74 88,104" fill="url(#lava-edge-18)" stroke="#7f1d1d" stroke-width="1.2"/>

    <!-- Estelas de arrastre y vórtices térmicos -->
    <g stroke="#fef08a" stroke-width="1" fill="none" opacity="0.8">
      <path d="M 38,52 L 48,42 M 56,76 L 68,64 M 78,44 L 90,32 M 94,68 L 104,58"/>
    </g>
    <circle cx="58" cy="50" r="2.2" fill="#fffbeb"/><circle cx="82" cy="28" r="1.8" fill="#fffbeb"/>
    <circle cx="34" cy="78" r="2" fill="#facc15"/><circle cx="72" cy="88" r="2.4" fill="#facc15"/>
  `;
}

/**
 * Tile 19: LAVA 5 — Caldera de Fusión Pura / Núcleo Solar Blanco-Dorado.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaCaldera(S = 128) {
  return `
    <defs>
      <radialGradient id="lava-hyper-19" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="25%" stop-color="#fffbeb"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="72%" stop-color="#f59e0b"/>
        <stop offset="88%" stop-color="#ea580c"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </radialGradient>
    </defs>

    <!-- Base hiper-térmica cegadora -->
    <rect width="${S}" height="${S}" fill="#991b1b"/>
    <rect width="${S}" height="${S}" fill="url(#lava-hyper-19)"/>

    <!-- Espirales de convección rotacional / Vórtice solar -->
    <g fill="none" stroke-linecap="round">
      <ellipse cx="64" cy="64" rx="46" ry="46" stroke="#ea580c" stroke-width="10" opacity="0.6"/>
      <ellipse cx="64" cy="64" rx="34" ry="34" stroke="#f97316" stroke-width="8" opacity="0.75"/>
      <ellipse cx="64" cy="64" rx="22" ry="22" stroke="#fde047" stroke-width="6"/>
      <ellipse cx="64" cy="64" rx="10" ry="10" stroke="#ffffff" stroke-width="3.5"/>

      <path d="M 64,18 Q 98,24 104,58 Q 106,92 74,106 Q 38,108 26,76 Q 24,44 54,28" stroke="#ffffff" stroke-width="1.8" opacity="0.9"/>
      <path d="M 64,28 Q 88,34 94,60 Q 94,84 70,94 Q 44,96 36,72" stroke="#fffbeb" stroke-width="2.5" opacity="0.95"/>
    </g>

    <!-- Destellos estelares de temperatura límite -->
    <g stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.95">
      <line x1="64" y1="46" x2="64" y2="82"/>
      <line x1="46" y1="64" x2="82" y2="64"/>
      <line x1="51" y1="51" x2="77" y2="77"/>
      <line x1="77" y1="51" x2="51" y2="77"/>
    </g>
    <circle cx="64" cy="64" r="6" fill="#ffffff"/>

    <!-- Micro-esquirlas minerales flotantes incandescentes -->
    <polygon points="18,16 26,14 24,22 16,20" fill="#2d2a29" stroke="#ea580c" stroke-width="0.8"/>
    <polygon points="106,18 114,22 110,28 102,24" fill="#2d2a29" stroke="#ea580c" stroke-width="0.8"/>
    <polygon points="16,104 24,108 22,116 14,112" fill="#2d2a29" stroke="#ea580c" stroke-width="0.8"/>
    <polygon points="108,102 116,98 118,108 110,112" fill="#2d2a29" stroke="#ea580c" stroke-width="0.8"/>
  `;
}

export const lavaSprites = {
  lavaActive,
  lavaFissures,
  lavaGeysers,
  lavaRiver,
  lavaCaldera
};
