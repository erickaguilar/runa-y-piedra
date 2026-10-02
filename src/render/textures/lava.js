// src/render/textures/lava.js

/**
 * Tile 13: Lava Flujo Laminar (lavaFlow / lavaActive)
 * Corriente magmática densa con costras de basalto fracturadas en 1 px,
 * filamentos de calor blanco y microburbujas térmicas. Conexión continua perfecta en x=0 y x=128.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaFlow(S = 128) {
  return `
    <!-- Fondo de magma oscuro profundo -->
    <rect width="${S}" height="${S}" fill="#450a0a"/>

    <!-- Costra de basalto superior (Borde en y=12 continuo en extremos) -->
    <path d="M 0,0 L 128,0 L 128,12 Q 96,7 64,14 Q 32,18 0,12 Z" fill="#0c0a09"/>
    <path d="M 0,12 Q 32,18 64,14 Q 96,7 128,12" stroke="#1c1917" stroke-width="1" fill="none"/>
    <!-- Microfisuras de 1px en la costra superior -->
    <path d="M 24,0 L 26,6 L 22,12" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 86,0 L 88,5 L 94,10" stroke="#ea580c" stroke-width="1" fill="none"/>
    <line x1="26" y1="6" x2="32" y2="7" stroke="#f59e0b" stroke-width="1"/>

    <!-- Costra de basalto inferior (Borde en y=116 continuo en extremos) -->
    <path d="M 0,116 Q 32,121 64,113 Q 96,109 128,116 L 128,128 L 0,128 Z" fill="#0c0a09"/>
    <path d="M 0,116 Q 32,121 64,113 Q 96,109 128,116" stroke="#1c1917" stroke-width="1" fill="none"/>
    <!-- Microfisuras de 1px en la costra inferior -->
    <path d="M 42,128 L 44,122 L 40,115" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 104,128 L 102,120 L 108,114" stroke="#ea580c" stroke-width="1" fill="none"/>

    <!-- Canales de flujo intermedio rojo vivo -->
    <path d="M 0,24 Q 32,18 64,28 T 128,24 L 128,58 Q 96,48 64,56 T 0,58 Z" fill="#991b1b"/>
    <path d="M 0,72 Q 32,82 64,74 T 128,72 L 128,106 Q 96,112 64,102 T 0,106 Z" fill="#991b1b"/>

    <!-- Corrientes de magma ardiente naranja -->
    <path d="M 0,34 Q 32,26 64,36 T 128,34 L 128,48 Q 96,40 64,48 T 0,48 Z" fill="#ea580c"/>
    <path d="M 0,80 Q 32,90 64,82 T 128,80 L 128,94 Q 96,100 64,92 T 0,94 Z" fill="#ea580c"/>

    <!-- Filamentos de plasma amarillo de 1px -->
    <path d="M 0,40 Q 32,32 64,42 T 128,40" stroke="#f59e0b" stroke-width="1" fill="none"/>
    <path d="M 0,86 Q 32,96 64,88 T 128,86" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- Hilos de calor extremo blanco nuclear de 1px -->
    <path d="M 0,41 Q 32,33 64,43 T 128,41" stroke="#fef08a" stroke-width="1" fill="none"/>
    <path d="M 0,87 Q 32,97 64,89 T 128,87" stroke="#fef08a" stroke-width="1" fill="none"/>
    <path d="M 12,41 Q 32,34 52,43" stroke="#ffffff" stroke-width="1" fill="none"/>
    <path d="M 76,87 Q 96,97 116,89" stroke="#ffffff" stroke-width="1" fill="none"/>

    <!-- Isla central de roca volcánica flotante con fisuras de 1px -->
    <polygon points="44,58 78,56 88,68 62,74 36,66" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
    <polygon points="47,60 75,58 84,66 62,71 39,65" fill="#1c1917"/>
    <!-- Grietas internas de 1px dentro de la roca -->
    <path d="M 48,60 L 56,66 L 68,64 L 78,68" stroke="#ea580c" stroke-width="1" fill="none"/>
    <line x1="56" y1="66" x2="54" y2="72" stroke="#f59e0b" stroke-width="1"/>
    <!-- Reborde de calor de 1px bajo la piedra -->
    <path d="M 36,66 L 62,74 L 88,68" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- Burbujas con aro fino de 1px -->
    <circle cx="28" cy="38" r="3.5" fill="#f59e0b" stroke="#7f1d1d" stroke-width="1"/>
    <circle cx="27" cy="37" r="1" fill="#ffffff"/>
    <circle cx="104" cy="86" r="4" fill="#f59e0b" stroke="#7f1d1d" stroke-width="1"/>
    <circle cx="103" cy="85" r="1" fill="#ffffff"/>

    <!-- Escamas de ceniza fría flotante de 1px -->
    <rect x="18" y="28" width="4" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="88" y="32" width="5" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="14" y="86" width="4" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="74" y="96" width="5" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
  `;
}

/**
 * Tile 16: Lava Ondulación y Tensión (lavaSurge / lavaFissures)
 * La corriente avanza y deforma la costra. Aparecen ondas de empuje con filamentos quebrados de 1 px y burbujas a punto de romper.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaSurge(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#450a0a"/>

    <!-- Costra superior fija con fisuras abiertas -->
    <path d="M 0,0 L 128,0 L 128,12 Q 96,18 64,10 Q 32,6 0,12 Z" fill="#0c0a09"/>
    <path d="M 0,12 Q 32,6 64,10 Q 96,18 128,12" stroke="#1c1917" stroke-width="1" fill="none"/>
    <!-- Fisura expansiva de 1px -->
    <path d="M 24,0 L 28,5 L 25,12" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 58,0 L 62,6 L 66,11" stroke="#f59e0b" stroke-width="1" fill="none"/>
    <line x1="62" y1="6" x2="56" y2="8" stroke="#ffffff" stroke-width="1"/>
    <path d="M 88,0 L 92,6 L 96,11" stroke="#ea580c" stroke-width="1" fill="none"/>

    <!-- Costra inferior fija -->
    <path d="M 0,116 Q 32,110 64,118 Q 96,122 128,116 L 128,128 L 0,128 Z" fill="#0c0a09"/>
    <path d="M 0,116 Q 32,110 64,118 Q 96,122 128,116" stroke="#1c1917" stroke-width="1" fill="none"/>
    <path d="M 44,128 L 41,122 L 46,116" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 78,128 L 82,120 L 76,117" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- Desplazamiento ondular de la masa de magma -->
    <path d="M 0,24 Q 32,32 64,20 T 128,24 L 128,58 Q 96,64 64,50 T 0,58 Z" fill="#991b1b"/>
    <path d="M 0,72 Q 32,64 64,78 T 128,72 L 128,106 Q 96,98 64,110 T 0,106 Z" fill="#991b1b"/>

    <!-- Vetas activas en pico de ola -->
    <path d="M 0,34 Q 32,42 64,30 T 128,34 L 128,48 Q 96,54 64,42 T 0,48 Z" fill="#ea580c"/>
    <path d="M 0,80 Q 32,72 64,88 T 128,80 L 128,94 Q 96,84 64,98 T 0,94 Z" fill="#ea580c"/>

    <!-- Filamentos de 1px modulados -->
    <path d="M 0,40 Q 32,48 64,36 T 128,40" stroke="#f59e0b" stroke-width="1" fill="none"/>
    <path d="M 0,86 Q 32,78 64,94 T 128,86" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- Filamentos incandescentes blancos de 1px -->
    <path d="M 0,41 Q 32,49 64,37 T 128,41" stroke="#fef08a" stroke-width="1" fill="none"/>
    <path d="M 0,87 Q 32,79 64,95 T 128,87" stroke="#fef08a" stroke-width="1" fill="none"/>
    <path d="M 20,47 Q 36,52 50,42" stroke="#ffffff" stroke-width="1" fill="none"/>
    <path d="M 80,83 Q 96,76 112,88" stroke="#ffffff" stroke-width="1" fill="none"/>

    <!-- Roca central desplazada y fracturada por la presión -->
    <polygon points="48,56 82,54 92,66 66,74 40,66" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
    <polygon points="50,58 79,56 88,64 65,71 42,65" fill="#1c1917"/>
    <!-- Falla diagonal de 1px que parte la roca -->
    <path d="M 64,54 L 66,63 L 74,72" stroke="#fef08a" stroke-width="1" fill="none"/>
    <line x1="66" y1="63" x2="58" y2="68" stroke="#ea580c" stroke-width="1"/>
    <path d="M 40,66 L 66,74 L 92,66" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- Domo de magma / Burbujas hinchadas a punto de romper -->
    <circle cx="34" cy="44" r="5.5" fill="#ea580c" stroke="#7f1d1d" stroke-width="1"/>
    <circle cx="34" cy="44" r="3.5" fill="#f59e0b" stroke="#ea580c" stroke-width="1"/>
    <circle cx="33" cy="43" r="1.2" fill="#ffffff"/>

    <circle cx="98" cy="82" r="6" fill="#ea580c" stroke="#7f1d1d" stroke-width="1"/>
    <circle cx="98" cy="82" r="4" fill="#f59e0b" stroke="#ea580c" stroke-width="1"/>
    <circle cx="97" cy="81" r="1.5" fill="#ffffff"/>

    <!-- Microcostras de ceniza de 1px arrastradas -->
    <rect x="22" y="34" width="5" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="76" y="28" width="6" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="8" y="80" width="4" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="62" y="100" width="5" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
  `;
}

/**
 * Tile 17: Lava Eclosión y Chispas (lavaBubble / lavaGeysers)
 * Las burbujas revientan con anillos concéntricos y microchispas de 1 px, cerrando el ciclo de vuelta al flujo base.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaBubble(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#450a0a"/>

    <!-- Costra superior fija -->
    <path d="M 0,0 L 128,0 L 128,12 Q 96,12 64,16 Q 32,14 0,12 Z" fill="#0c0a09"/>
    <path d="M 0,12 Q 32,14 64,16 Q 96,12 128,12" stroke="#1c1917" stroke-width="1" fill="none"/>
    <!-- Fisuras estabilizándose con hilos de 1px -->
    <path d="M 26,0 L 24,7 L 29,13" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 90,0 L 92,6 L 87,13" stroke="#ea580c" stroke-width="1" fill="none"/>

    <!-- Costra inferior fija -->
    <path d="M 0,116 Q 32,118 64,112 Q 96,116 128,116 L 128,128 L 0,128 Z" fill="#0c0a09"/>
    <path d="M 0,116 Q 32,118 64,112 Q 96,116 128,116" stroke="#1c1917" stroke-width="1" fill="none"/>
    <path d="M 40,128 L 44,121 L 38,115" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 106,128 L 103,119 L 109,115" stroke="#ea580c" stroke-width="1" fill="none"/>

    <!-- Canales de lava transicionando a reposo -->
    <path d="M 0,24 Q 32,22 64,26 T 128,24 L 128,58 Q 96,54 64,60 T 0,58 Z" fill="#991b1b"/>
    <path d="M 0,72 Q 32,76 64,72 T 128,72 L 128,106 Q 96,108 64,104 T 0,106 Z" fill="#991b1b"/>

    <path d="M 0,34 Q 32,30 64,38 T 128,34 L 128,48 Q 96,44 64,50 T 0,48 Z" fill="#ea580c"/>
    <path d="M 0,80 Q 32,86 64,80 T 128,80 L 128,94 Q 96,96 64,90 T 0,94 Z" fill="#ea580c"/>

    <!-- Filamentos de plasma de 1px -->
    <path d="M 0,40 Q 32,36 64,44 T 128,40" stroke="#f59e0b" stroke-width="1" fill="none"/>
    <path d="M 0,86 Q 32,92 64,86 T 128,86" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- Filamentos blancos de 1px -->
    <path d="M 0,41 Q 32,37 64,45 T 128,41" stroke="#fef08a" stroke-width="1" fill="none"/>
    <path d="M 0,87 Q 32,93 64,87 T 128,87" stroke="#fef08a" stroke-width="1" fill="none"/>
    <path d="M 10,41 Q 26,38 42,44" stroke="#ffffff" stroke-width="1" fill="none"/>
    <path d="M 86,86 Q 102,91 118,87" stroke="#ffffff" stroke-width="1" fill="none"/>

    <!-- Roca central erosionada por el estallido -->
    <polygon points="42,60 76,58 86,70 60,76 34,68" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
    <polygon points="45,62 73,60 82,68 60,73 37,67" fill="#1c1917"/>
    <path d="M 46,64 L 54,68 L 66,66 L 76,70" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 34,68 L 60,76 L 86,70" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- REVENTÓN DE BURBUJA SUPERIOR (Onda de choque circular de 1px) -->
    <ellipse cx="36" cy="42" rx="7" ry="4" fill="#991b1b" stroke="#ea580c" stroke-width="1"/>
    <ellipse cx="36" cy="42" rx="10" ry="6" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 2"/>
    <circle cx="36" cy="42" r="2" fill="#ffffff"/>

    <!-- REVENTÓN DE BURBUJA INFERIOR (Onda de disipación y eyección) -->
    <ellipse cx="96" cy="84" rx="8" ry="4.5" fill="#991b1b" stroke="#ea580c" stroke-width="1"/>
    <ellipse cx="96" cy="84" rx="13" ry="7" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4 2"/>
    <ellipse cx="96" cy="84" rx="17" ry="9" fill="none" stroke="#ea580c" stroke-width="1" stroke-dasharray="2 3" opacity="0.6"/>

    <!-- Microchispas y gotas de magma expulsadas (1 a 1.5 px de radio) -->
    <circle cx="94" cy="73" r="1.5" fill="#ffffff" stroke="#fef08a" stroke-width="0.5"/>
    <circle cx="106" cy="76" r="1" fill="#fef08a"/>
    <circle cx="84" cy="80" r="1" fill="#f59e0b"/>
    <circle cx="99" cy="94" r="1.2" fill="#ea580c"/>
    <circle cx="46" cy="34" r="1.2" fill="#ffffff"/>
    <circle cx="26" cy="48" r="1" fill="#fef08a"/>

    <!-- Escamas de ceniza fría de 1px -->
    <rect x="20" y="32" width="4" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="84" y="34" width="5" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="16" y="88" width="5" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="70" y="98" width="4" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
  `;
}

/**
 * Tile 18: Lava Disipación y Ascuas (lavaRiver)
 * Fase post-eclosión: nubes de microchispas y ascuas flotantes de 1 px dispersándose sobre las corrientes.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaRiver(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#450a0a"/>

    <!-- Costra de basalto superior (Borde en y=12 continuo en extremos) -->
    <path d="M 0,0 L 128,0 L 128,12 Q 96,15 64,12 Q 32,9 0,12 Z" fill="#0c0a09"/>
    <path d="M 0,12 Q 32,9 64,12 Q 96,15 128,12" stroke="#1c1917" stroke-width="1" fill="none"/>
    <!-- Microfisuras de 1px en costra superior -->
    <path d="M 30,0 L 32,6 L 28,12" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 84,0 L 86,7 L 90,11" stroke="#ea580c" stroke-width="1" fill="none"/>
    <line x1="86" y1="7" x2="80" y2="9" stroke="#f59e0b" stroke-width="1"/>

    <!-- Costra de basalto inferior (Borde en y=116 continuo en extremos) -->
    <path d="M 0,116 Q 32,114 64,115 Q 96,118 128,116 L 128,128 L 0,128 Z" fill="#0c0a09"/>
    <path d="M 0,116 Q 32,114 64,115 Q 96,118 128,116" stroke="#1c1917" stroke-width="1" fill="none"/>
    <!-- Microfisuras de 1px en costra inferior -->
    <path d="M 38,128 L 40,121 L 46,116" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 96,128 L 94,122 L 98,115" stroke="#ea580c" stroke-width="1" fill="none"/>

    <!-- Canales de flujo intermedio rojo vivo -->
    <path d="M 0,24 Q 32,20 64,24 T 128,24 L 128,58 Q 96,50 64,54 T 0,58 Z" fill="#991b1b"/>
    <path d="M 0,72 Q 32,80 64,76 T 128,72 L 128,106 Q 96,110 64,106 T 0,106 Z" fill="#991b1b"/>

    <!-- Corrientes de magma ardiente naranja -->
    <path d="M 0,34 Q 32,28 64,32 T 128,34 L 128,48 Q 96,42 64,46 T 0,48 Z" fill="#ea580c"/>
    <path d="M 0,80 Q 32,88 64,84 T 128,80 L 128,94 Q 96,98 64,94 T 0,94 Z" fill="#ea580c"/>

    <!-- Filamentos de plasma amarillo de 1px -->
    <path d="M 0,40 Q 32,34 64,38 T 128,40" stroke="#f59e0b" stroke-width="1" fill="none"/>
    <path d="M 0,86 Q 32,94 64,90 T 128,86" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- Hilos de calor blanco nuclear de 1px -->
    <path d="M 0,41 Q 32,35 64,39 T 128,41" stroke="#fef08a" stroke-width="1" fill="none"/>
    <path d="M 0,87 Q 32,95 64,91 T 128,87" stroke="#fef08a" stroke-width="1" fill="none"/>
    <path d="M 16,41 Q 36,36 56,41" stroke="#ffffff" stroke-width="1" fill="none"/>
    <path d="M 72,87 Q 92,93 112,89" stroke="#ffffff" stroke-width="1" fill="none"/>

    <!-- Isla central de basalto con fractura de enfriamiento -->
    <polygon points="46,57 80,55 90,67 64,75 38,67" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
    <polygon points="48,59 77,57 86,65 64,72 41,66" fill="#1c1917"/>
    <path d="M 50,61 L 60,65 L 72,63 L 80,67" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 38,67 L 64,75 L 90,67" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- Enjambre de ascuas y chispas disipadas (1 a 1.5 px) -->
    <circle cx="22" cy="36" r="1.5" fill="#ffffff" stroke="#fef08a" stroke-width="0.5"/>
    <circle cx="48" cy="42" r="1.2" fill="#fef08a"/>
    <circle cx="70" cy="38" r="1.4" fill="#ffffff"/>
    <circle cx="92" cy="46" r="1" fill="#f59e0b"/>
    <circle cx="114" cy="40" r="1.2" fill="#fef08a"/>
    <circle cx="30" cy="88" r="1.4" fill="#ffffff"/>
    <circle cx="52" cy="82" r="1.2" fill="#fef08a"/>
    <circle cx="78" cy="92" r="1.5" fill="#ffffff" stroke="#fef08a" stroke-width="0.5"/>
    <circle cx="102" cy="86" r="1.2" fill="#f59e0b"/>
    <circle cx="120" cy="90" r="1" fill="#ea580c"/>

    <!-- Escamas de ceniza de 1px -->
    <rect x="24" y="30" width="5" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="82" y="30" width="4" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="12" y="84" width="5" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    <rect x="66" y="98" width="4" height="2" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
  `;
}

/**
 * Tile 19: Lava Costras y Placas de Obsidiana (lavaCaldera)
 * Fase de transición: placas de escoria y obsidiana flotante con rebordes de calor de 1 px.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaCaldera(S = 128) {
  return `
    <rect width="${S}" height="${S}" fill="#450a0a"/>

    <!-- Costra de basalto superior (Borde en y=12 continuo en extremos) -->
    <path d="M 0,0 L 128,0 L 128,12 Q 96,9 64,15 Q 32,15 0,12 Z" fill="#0c0a09"/>
    <path d="M 0,12 Q 32,15 64,15 Q 96,9 128,12" stroke="#1c1917" stroke-width="1" fill="none"/>
    <!-- Microfisuras de 1px en costra superior -->
    <path d="M 28,0 L 26,6 L 30,12" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 92,0 L 90,5 L 86,11" stroke="#ea580c" stroke-width="1" fill="none"/>

    <!-- Costra de basalto inferior (Borde en y=116 continuo en extremos) -->
    <path d="M 0,116 Q 32,119 64,114 Q 96,113 128,116 L 128,128 L 0,128 Z" fill="#0c0a09"/>
    <path d="M 0,116 Q 32,119 64,114 Q 96,113 128,116" stroke="#1c1917" stroke-width="1" fill="none"/>
    <!-- Microfisuras de 1px en costra inferior -->
    <path d="M 36,128 L 38,120 L 34,115" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 100,128 L 98,122 L 104,116" stroke="#ea580c" stroke-width="1" fill="none"/>

    <!-- Canales de flujo intermedio rojo vivo -->
    <path d="M 0,24 Q 32,26 64,22 T 128,24 L 128,58 Q 96,60 64,52 T 0,58 Z" fill="#991b1b"/>
    <path d="M 0,72 Q 32,68 64,76 T 128,72 L 128,106 Q 96,102 64,108 T 0,106 Z" fill="#991b1b"/>

    <!-- Corrientes de magma ardiente naranja -->
    <path d="M 0,34 Q 32,36 64,32 T 128,34 L 128,48 Q 96,50 64,44 T 0,48 Z" fill="#ea580c"/>
    <path d="M 0,80 Q 32,76 64,84 T 128,80 L 128,94 Q 96,88 64,96 T 0,94 Z" fill="#ea580c"/>

    <!-- Filamentos de plasma amarillo de 1px -->
    <path d="M 0,40 Q 32,42 64,38 T 128,40" stroke="#f59e0b" stroke-width="1" fill="none"/>
    <path d="M 0,86 Q 32,82 64,90 T 128,86" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- Hilos de calor blanco nuclear de 1px -->
    <path d="M 0,41 Q 32,43 64,39 T 128,41" stroke="#fef08a" stroke-width="1" fill="none"/>
    <path d="M 0,87 Q 32,83 64,91 T 128,87" stroke="#fef08a" stroke-width="1" fill="none"/>
    <path d="M 14,41 Q 34,44 54,39" stroke="#ffffff" stroke-width="1" fill="none"/>
    <path d="M 74,87 Q 94,83 114,91" stroke="#ffffff" stroke-width="1" fill="none"/>

    <!-- Isla central de roca volcánica flotante -->
    <polygon points="45,57 79,55 89,67 63,73 37,65" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
    <polygon points="48,59 76,57 85,65 63,70 40,64" fill="#1c1917"/>
    <path d="M 49,59 L 57,65 L 69,63 L 79,67" stroke="#ea580c" stroke-width="1" fill="none"/>
    <path d="M 37,65 L 63,73 L 89,67" stroke="#f59e0b" stroke-width="1" fill="none"/>

    <!-- Placas menores de obsidiana / costras flotantes en enfriamiento con reborde de 1px -->
    <polygon points="18,36 28,34 32,42 24,46 16,42" fill="#0c0a09" stroke="#ea580c" stroke-width="1"/>
    <polygon points="19,37 27,35 30,41 24,44 18,41" fill="#1c1917"/>

    <polygon points="94,40 106,38 110,46 102,50 92,46" fill="#0c0a09" stroke="#ea580c" stroke-width="1"/>
    <polygon points="95,41 104,39 108,45 102,48 94,45" fill="#1c1917"/>

    <polygon points="76,86 88,84 92,92 84,96 74,92" fill="#0c0a09" stroke="#ea580c" stroke-width="1"/>
    <polygon points="77,87 86,85 90,91 84,94 76,91" fill="#1c1917"/>

    <!-- Microburbujas térmicas de 1px -->
    <circle cx="56" cy="42" r="3" fill="#f59e0b" stroke="#7f1d1d" stroke-width="1"/>
    <circle cx="55" cy="41" r="1" fill="#ffffff"/>
    <circle cx="38" cy="88" r="3.5" fill="#f59e0b" stroke="#7f1d1d" stroke-width="1"/>
    <circle cx="37" cy="87" r="1" fill="#ffffff"/>
  `;
}

// Alias de retrocompatibilidad y correspondencia con los nuevos nombres
export const lavaActive = lavaFlow;
export const lavaFissures = lavaSurge;
export const lavaGeysers = lavaBubble;

export const lavaSprites = {
  lavaFlow,
  lavaSurge,
  lavaBubble,
  lavaRiver,
  lavaCaldera,
  // Alias de compatibilidad
  lavaActive,
  lavaFissures,
  lavaGeysers
};
