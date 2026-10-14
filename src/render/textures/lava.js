// src/render/textures/lava.js

/**
 * Tile 13: Lava Flujo Laminar (lavaFlow / lavaActive)
 * Corriente magmática densa en Pixel Art Sumi-e puro (64x64 escalado), con costras de basalto
 * en bordes continuos (x=0 y x=64), filamentos térmicos de 1 px, isla de roca flotante y microburbujas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaFlow(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Fondo de magma oscuro profundo -->
      <rect width="64" height="64" fill="#450a0a"/>

      <!-- Costra de basalto superior (Borde en y=6 continuo en extremos x=0 y x=64) -->
      <polygon points="0,0 64,0 64,6 48,4 32,7 16,8 0,6" fill="#0c0a09"/>
      <polyline points="0,6 16,8 32,7 48,4 64,6" stroke="#1c1917" stroke-width="1" fill="none"/>
      <!-- Microfisuras de calor de 1 px en la costra superior -->
      <polyline points="12,0 13,3 11,6" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="43,0 44,3 47,5" stroke="#ea580c" stroke-width="1" fill="none"/>
      <line x1="13" y1="3" x2="16" y2="4" stroke="#f59e0b" stroke-width="1"/>

      <!-- Costra de basalto inferior (Borde en y=58 continuo en extremos x=0 y x=64) -->
      <polygon points="0,58 16,60 32,57 48,55 64,58 64,64 0,64" fill="#0c0a09"/>
      <polyline points="0,58 16,60 32,57 48,55 64,58" stroke="#1c1917" stroke-width="1" fill="none"/>
      <!-- Microfisuras de 1 px en la costra inferior -->
      <polyline points="21,64 22,61 20,58" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="52,64 51,60 54,57" stroke="#ea580c" stroke-width="1" fill="none"/>

      <!-- Canales de flujo intermedio rojo bermellón (y=12..29 y y=36..53) -->
      <polygon points="0,12 16,9 32,14 48,11 64,12 64,29 48,24 32,28 16,25 0,29" fill="#991b1b"/>
      <polygon points="0,36 16,41 32,37 48,40 64,36 64,53 48,56 32,51 16,54 0,53" fill="#991b1b"/>

      <!-- Corrientes de magma ardiente naranja vivo (Dithering escalonado) -->
      <polygon points="0,17 16,13 32,18 48,15 64,17 64,24 48,20 32,24 16,21 0,24" fill="#ea580c"/>
      <polygon points="0,40 16,45 32,41 48,44 64,40 64,47 48,50 32,46 16,49 0,47" fill="#ea580c"/>

      <!-- Filamentos de plasma amarillo de 1 px continuos -->
      <polyline points="0,20 16,16 32,21 48,18 64,20" stroke="#f59e0b" stroke-width="1" fill="none"/>
      <polyline points="0,43 16,48 32,44 48,47 64,43" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- Hilos de calor extremo blanco nuclear de 1 px -->
      <polyline points="0,21 16,17 32,22 48,19 64,21" stroke="#fef08a" stroke-width="1" fill="none"/>
      <polyline points="0,44 16,49 32,45 48,48 64,44" stroke="#fef08a" stroke-width="1" fill="none"/>
      <line x1="6" y1="21" x2="26" y2="18" stroke="#ffffff" stroke-width="1"/>
      <line x1="38" y1="44" x2="58" y2="45" stroke="#ffffff" stroke-width="1"/>

      <!-- Isla central de roca volcánica flotante con fisuras de calor -->
      <polygon points="22,29 39,28 44,34 31,37 18,33" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
      <polygon points="24,30 38,29 42,33 31,36 20,33" fill="#1c1917"/>
      <!-- Grietas internas de 1 px dentro de la roca -->
      <polyline points="24,30 28,33 34,32 39,34" stroke="#ea580c" stroke-width="1" fill="none"/>
      <line x1="28" y1="33" x2="27" y2="36" stroke="#f59e0b" stroke-width="1"/>
      <!-- Reborde de calor de 1 px bajo la roca -->
      <polyline points="18,33 31,37 44,34" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- Burbujas térmicas pixeladas con brillo especular -->
      <rect x="13" y="18" width="3" height="3" fill="#f59e0b"/>
      <rect x="14" y="19" width="1" height="1" fill="#ffffff"/>
      <rect x="51" y="42" width="3" height="3" fill="#f59e0b"/>
      <rect x="52" y="43" width="1" height="1" fill="#ffffff"/>

      <!-- Escamas de ceniza fría de 1 px flotante -->
      <rect x="9" y="14" width="2" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="44" y="16" width="3" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="7" y="43" width="2" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="37" y="48" width="3" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    </g>
  `;
}

/**
 * Tile 16: Lava Ondulación y Tensión (lavaSurge / lavaFissures)
 * Magma en cresta de ola con fisuras dilatadas en la costra, domos de burbujas
 * hinchados a punto de romper con tramado y roca central desplazada.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaSurge(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#450a0a"/>

      <!-- Costra superior continua en extremos (y=6 en x=0 y x=64) -->
      <polygon points="0,0 64,0 64,6 48,9 32,5 16,3 0,6" fill="#0c0a09"/>
      <polyline points="0,6 16,3 32,5 48,9 64,6" stroke="#1c1917" stroke-width="1" fill="none"/>
      <!-- Fisuras abiertas de 1 px -->
      <polyline points="12,0 14,3 13,6" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="29,0 31,3 33,6" stroke="#f59e0b" stroke-width="1" fill="none"/>
      <line x1="31" y1="3" x2="28" y2="4" stroke="#ffffff" stroke-width="1"/>
      <polyline points="44,0 46,3 48,6" stroke="#ea580c" stroke-width="1" fill="none"/>

      <!-- Costra inferior continua en extremos (y=58 en x=0 y x=64) -->
      <polygon points="0,58 16,55 32,59 48,61 64,58 64,64 0,64" fill="#0c0a09"/>
      <polyline points="0,58 16,55 32,59 48,61 64,58" stroke="#1c1917" stroke-width="1" fill="none"/>
      <polyline points="22,64 21,61 23,58" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="39,64 41,60 38,58" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- Desplazamiento ondular de la masa de magma (canales rojo bermellón) -->
      <polygon points="0,12 16,16 32,10 48,15 64,12 64,29 48,32 32,25 16,30 0,29" fill="#991b1b"/>
      <polygon points="0,36 16,32 32,39 48,34 64,36 64,53 48,49 32,55 16,50 0,53" fill="#991b1b"/>

      <!-- Vetas ardientes activas en pico de ola -->
      <polygon points="0,17 16,21 32,15 48,19 64,17 64,24 48,27 32,21 16,25 0,24" fill="#ea580c"/>
      <polygon points="0,40 16,36 32,44 48,39 64,40 64,47 48,43 32,49 16,45 0,47" fill="#ea580c"/>

      <!-- Filamentos modulados de 1 px -->
      <polyline points="0,20 16,24 32,18 48,22 64,20" stroke="#f59e0b" stroke-width="1" fill="none"/>
      <polyline points="0,43 16,39 32,47 48,42 64,43" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- Filamentos incandescentes blancos de 1 px -->
      <polyline points="0,21 16,25 32,19 48,23 64,21" stroke="#fef08a" stroke-width="1" fill="none"/>
      <polyline points="0,44 16,40 32,48 48,43 64,44" stroke="#fef08a" stroke-width="1" fill="none"/>
      <line x1="10" y1="23" x2="25" y2="21" stroke="#ffffff" stroke-width="1"/>
      <line x1="40" y1="41" x2="56" y2="44" stroke="#ffffff" stroke-width="1"/>

      <!-- Roca central desplazada y fracturada por la presión del magma -->
      <polygon points="24,28 41,27 46,33 33,37 20,33" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
      <polygon points="25,29 40,28 44,32 33,35 21,32" fill="#1c1917"/>
      <!-- Falla diagonal interna de 1 px que parte la roca -->
      <polyline points="32,27 33,31 37,36" stroke="#fef08a" stroke-width="1" fill="none"/>
      <line x1="33" y1="31" x2="29" y2="34" stroke="#ea580c" stroke-width="1"/>
      <polyline points="20,33 33,37 46,33" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- Domos de magma / Burbujas hinchadas (Dithering concéntrico de 1 px) -->
      <rect x="16" y="21" width="4" height="4" fill="#ea580c"/>
      <rect x="17" y="22" width="2" height="2" fill="#f59e0b"/>
      <rect x="17" y="22" width="1" height="1" fill="#ffffff"/>

      <rect x="48" y="40" width="5" height="5" fill="#ea580c"/>
      <rect x="49" y="41" width="3" height="3" fill="#f59e0b"/>
      <rect x="50" y="42" width="1" height="1" fill="#ffffff"/>

      <!-- Microcostras de ceniza de 1 px arrastradas -->
      <rect x="11" y="17" width="3" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="38" y="14" width="3" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="4" y="40" width="2" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="31" y="50" width="3" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    </g>
  `;
}

/**
 * Tile 17: Lava Eclosión y Chispas (lavaBubble / lavaGeysers)
 * Estallido de burbujas con ondas de choque circulares pixeladas, eyección de gotas
 * y microchispas de 1 px, cerrando el ciclo de vuelta a la calma.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaBubble(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#450a0a"/>

      <!-- Costra superior fija (y=6 en extremos) -->
      <polygon points="0,0 64,0 64,6 48,6 32,8 16,7 0,6" fill="#0c0a09"/>
      <polyline points="0,6 16,7 32,8 48,6 64,6" stroke="#1c1917" stroke-width="1" fill="none"/>
      <polyline points="13,0 12,3 15,6" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="45,0 46,3 43,6" stroke="#ea580c" stroke-width="1" fill="none"/>

      <!-- Costra inferior fija (y=58 en extremos) -->
      <polygon points="0,58 16,59 32,56 48,58 64,58 64,64 0,64" fill="#0c0a09"/>
      <polyline points="0,58 16,59 32,56 48,58 64,58" stroke="#1c1917" stroke-width="1" fill="none"/>
      <polyline points="20,64 22,60 19,57" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="53,64 51,59 55,57" stroke="#ea580c" stroke-width="1" fill="none"/>

      <!-- Canales de lava transicionando a reposo -->
      <polygon points="0,12 16,11 32,13 48,10 64,12 64,29 48,27 32,30 16,27 0,29" fill="#991b1b"/>
      <polygon points="0,36 16,38 32,36 48,39 64,36 64,53 48,54 32,52 16,55 0,53" fill="#991b1b"/>

      <polygon points="0,17 16,15 32,19 48,16 64,17 64,24 48,22 32,25 16,23 0,24" fill="#ea580c"/>
      <polygon points="0,40 16,43 32,40 48,44 64,40 64,47 48,48 32,45 16,49 0,47" fill="#ea580c"/>

      <!-- Filamentos de 1 px -->
      <polyline points="0,20 16,18 32,22 48,19 64,20" stroke="#f59e0b" stroke-width="1" fill="none"/>
      <polyline points="0,43 16,46 32,43 48,47 64,43" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- Filamentos blancos de 1 px -->
      <polyline points="0,21 16,19 32,23 48,20 64,21" stroke="#fef08a" stroke-width="1" fill="none"/>
      <polyline points="0,44 16,47 32,44 48,48 64,44" stroke="#fef08a" stroke-width="1" fill="none"/>
      <line x1="5" y1="20" x2="21" y2="19" stroke="#ffffff" stroke-width="1"/>
      <line x1="43" y1="43" x2="59" y2="43" stroke="#ffffff" stroke-width="1"/>

      <!-- Roca central erosionada por el estallido -->
      <polygon points="21,30 38,29 43,35 30,38 17,34" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
      <polygon points="23,31 37,30 41,34 30,36 19,33" fill="#1c1917"/>
      <polyline points="23,32 27,34 33,33 38,35" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="17,34 30,38 43,35" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- REVENTÓN DE BURBUJA SUPERIOR (Onda de choque pixelada) -->
      <rect x="17" y="20" width="4" height="2" fill="#991b1b" stroke="#ea580c" stroke-width="1"/>
      <rect x="16" y="19" width="6" height="4" fill="none" stroke="#f59e0b" stroke-width="1"/>
      <rect x="18" y="21" width="1" height="1" fill="#ffffff"/>

      <!-- REVENTÓN DE BURBUJA INFERIOR (Onda de eyección y choque) -->
      <rect x="47" y="41" width="5" height="3" fill="#991b1b" stroke="#ea580c" stroke-width="1"/>
      <rect x="45" y="40" width="9" height="5" fill="none" stroke="#f59e0b" stroke-width="1"/>
      <rect x="43" y="39" width="13" height="7" fill="none" stroke="#ea580c" stroke-width="1" opacity="0.6"/>

      <!-- Microchispas y gotas de magma expulsadas de 1 px -->
      <rect x="47" y="36" width="1" height="1" fill="#ffffff"/>
      <rect x="53" y="38" width="1" height="1" fill="#fef08a"/>
      <rect x="42" y="40" width="1" height="1" fill="#f59e0b"/>
      <rect x="50" y="47" width="1" height="1" fill="#ea580c"/>
      <rect x="23" y="17" width="1" height="1" fill="#ffffff"/>
      <rect x="13" y="24" width="1" height="1" fill="#fef08a"/>

      <!-- Escamas de ceniza de 1 px -->
      <rect x="10" y="16" width="2" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="42" y="17" width="3" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="8" y="44" width="3" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="35" y="49" width="2" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    </g>
  `;
}

/**
 * Tile 18: Lava Disipación y Ascuas (lavaRiver)
 * Fase post-eclosión: nubes de microchispas y ascuas flotantes de 1 px dispersándose
 * sobre las corrientes de magma calmadas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaRiver(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#450a0a"/>

      <!-- Costra de basalto superior continua en extremos (y=6 en x=0 y x=64) -->
      <polygon points="0,0 64,0 64,6 48,7 32,6 16,4 0,6" fill="#0c0a09"/>
      <polyline points="0,6 16,4 32,6 48,7 64,6" stroke="#1c1917" stroke-width="1" fill="none"/>
      <polyline points="15,0 16,3 14,6" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="42,0 43,3 45,5" stroke="#ea580c" stroke-width="1" fill="none"/>
      <line x1="43" y1="3" x2="40" y2="4" stroke="#f59e0b" stroke-width="1"/>

      <!-- Costra de basalto inferior continua en extremos (y=58 en x=0 y x=64) -->
      <polygon points="0,58 16,57 32,58 48,59 64,58 64,64 0,64" fill="#0c0a09"/>
      <polyline points="0,58 16,57 32,58 48,59 64,58" stroke="#1c1917" stroke-width="1" fill="none"/>
      <polyline points="19,64 20,60 23,58" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="48,64 47,61 49,57" stroke="#ea580c" stroke-width="1" fill="none"/>

      <!-- Canales de flujo intermedio rojo vivo -->
      <polygon points="0,12 16,10 32,12 48,11 64,12 64,29 48,25 32,27 16,26 0,29" fill="#991b1b"/>
      <polygon points="0,36 16,40 32,38 48,39 64,36 64,53 48,55 32,53 16,54 0,53" fill="#991b1b"/>

      <!-- Corrientes de magma ardiente naranja -->
      <polygon points="0,17 16,14 32,16 48,15 64,17 64,24 48,21 32,23 16,22 0,24" fill="#ea580c"/>
      <polygon points="0,40 16,44 32,42 48,43 64,40 64,47 48,49 32,47 16,48 0,47" fill="#ea580c"/>

      <!-- Filamentos de plasma de 1 px -->
      <polyline points="0,20 16,17 32,19 48,18 64,20" stroke="#f59e0b" stroke-width="1" fill="none"/>
      <polyline points="0,43 16,47 32,45 48,46 64,43" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- Hilos de calor blanco nuclear de 1 px -->
      <polyline points="0,21 16,18 32,20 48,19 64,21" stroke="#fef08a" stroke-width="1" fill="none"/>
      <polyline points="0,44 16,48 32,46 48,47 64,44" stroke="#fef08a" stroke-width="1" fill="none"/>
      <line x1="8" y1="20" x2="28" y2="19" stroke="#ffffff" stroke-width="1"/>
      <line x1="36" y1="44" x2="56" y2="45" stroke="#ffffff" stroke-width="1"/>

      <!-- Isla central de basalto con fractura de enfriamiento -->
      <polygon points="23,28 40,27 45,33 32,37 19,33" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
      <polygon points="24,29 39,28 43,32 32,36 21,33" fill="#1c1917"/>
      <polyline points="25,30 30,32 36,31 40,33" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="19,33 32,37 45,33" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- Enjambre de ascuas y chispas disipadas de 1 px -->
      <rect x="11" y="18" width="1" height="1" fill="#ffffff"/>
      <rect x="24" y="21" width="1" height="1" fill="#fef08a"/>
      <rect x="35" y="19" width="1" height="1" fill="#ffffff"/>
      <rect x="46" y="23" width="1" height="1" fill="#f59e0b"/>
      <rect x="57" y="20" width="1" height="1" fill="#fef08a"/>
      <rect x="15" y="44" width="1" height="1" fill="#ffffff"/>
      <rect x="26" y="41" width="1" height="1" fill="#fef08a"/>
      <rect x="39" y="46" width="1" height="1" fill="#ffffff"/>
      <rect x="51" y="43" width="1" height="1" fill="#f59e0b"/>
      <rect x="60" y="45" width="1" height="1" fill="#ea580c"/>

      <!-- Escamas de ceniza de 1 px -->
      <rect x="12" y="15" width="3" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="41" y="15" width="2" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="6" y="42" width="3" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
      <rect x="33" y="49" width="2" height="1" fill="#0c0a09" stroke="#450a0a" stroke-width="1"/>
    </g>
  `;
}

/**
 * Tile 19: Lava Costras y Placas de Obsidiana (lavaCaldera)
 * Placas flotantes de obsidiana y escoria basáltica con rebordes de calor de 1 px
 * y microburbujas térmicas.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function lavaCaldera(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#450a0a"/>

      <!-- Costra de basalto superior continua en extremos (y=6 en x=0 y x=64) -->
      <polygon points="0,0 64,0 64,6 48,4 32,7 16,7 0,6" fill="#0c0a09"/>
      <polyline points="0,6 16,7 32,7 48,4 64,6" stroke="#1c1917" stroke-width="1" fill="none"/>
      <polyline points="14,0 13,3 15,6" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="46,0 45,2 43,5" stroke="#ea580c" stroke-width="1" fill="none"/>

      <!-- Costra de basalto inferior continua en extremos (y=58 en x=0 y x=64) -->
      <polygon points="0,58 16,60 32,57 48,56 64,58 64,64 0,64" fill="#0c0a09"/>
      <polyline points="0,58 16,60 32,57 48,56 64,58" stroke="#1c1917" stroke-width="1" fill="none"/>
      <polyline points="18,64 19,60 17,58" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="50,64 49,61 52,58" stroke="#ea580c" stroke-width="1" fill="none"/>

      <!-- Canales de flujo intermedio rojo vivo -->
      <polygon points="0,12 16,13 32,11 48,13 64,12 64,29 48,30 32,26 16,28 0,29" fill="#991b1b"/>
      <polygon points="0,36 16,34 32,38 48,35 64,36 64,53 48,51 32,54 16,52 0,53" fill="#991b1b"/>

      <!-- Corrientes de magma ardiente naranja -->
      <polygon points="0,17 16,18 32,16 48,17 64,17 64,24 48,25 32,22 16,23 0,24" fill="#ea580c"/>
      <polygon points="0,40 16,38 32,42 48,39 64,40 64,47 48,44 32,48 16,46 0,47" fill="#ea580c"/>

      <!-- Filamentos de plasma amarillo de 1 px -->
      <polyline points="0,20 16,21 32,19 48,20 64,20" stroke="#f59e0b" stroke-width="1" fill="none"/>
      <polyline points="0,43 16,41 32,45 48,42 64,43" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- Hilos de calor blanco nuclear de 1 px -->
      <polyline points="0,21 16,22 32,20 48,21 64,21" stroke="#fef08a" stroke-width="1" fill="none"/>
      <polyline points="0,44 16,42 32,46 48,43 64,44" stroke="#fef08a" stroke-width="1" fill="none"/>
      <line x1="7" y1="21" x2="27" y2="22" stroke="#ffffff" stroke-width="1"/>
      <line x1="37" y1="43" x2="57" y2="41" stroke="#ffffff" stroke-width="1"/>

      <!-- Isla central de roca volcánica flotante -->
      <polygon points="22,28 39,27 44,33 31,36 18,32" fill="#0c0a09" stroke="#1c1917" stroke-width="1"/>
      <polygon points="24,29 38,28 42,32 31,35 20,32" fill="#1c1917"/>
      <polyline points="24,29 28,32 34,31 39,33" stroke="#ea580c" stroke-width="1" fill="none"/>
      <polyline points="18,32 31,36 44,33" stroke="#f59e0b" stroke-width="1" fill="none"/>

      <!-- Placas flotantes de obsidiana en enfriamiento con reborde de calor de 1 px -->
      <polygon points="9,18 14,17 16,21 12,23 8,21" fill="#0c0a09" stroke="#ea580c" stroke-width="1"/>
      <polygon points="10,19 13,18 15,21 12,22 9,20" fill="#1c1917"/>

      <polygon points="47,20 53,19 55,23 51,25 46,23" fill="#0c0a09" stroke="#ea580c" stroke-width="1"/>
      <polygon points="48,21 52,20 54,23 51,24 47,22" fill="#1c1917"/>

      <polygon points="38,43 44,42 46,46 42,48 37,46" fill="#0c0a09" stroke="#ea580c" stroke-width="1"/>
      <polygon points="39,44 43,43 45,45 42,47 38,45" fill="#1c1917"/>

      <!-- Microburbujas térmicas de 1 px -->
      <rect x="28" y="21" width="2" height="2" fill="#f59e0b"/>
      <rect x="28" y="21" width="1" height="1" fill="#ffffff"/>
      <rect x="19" y="44" width="2" height="2" fill="#f59e0b"/>
      <rect x="19" y="44" width="1" height="1" fill="#ffffff"/>
    </g>
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
