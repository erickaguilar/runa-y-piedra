// src/render/textures/pillars.js

/**
 * Tile 10: Pilar de Cripta Regular (pillarRegular / sumiePillarRegular)
 * Fuste con estrías verticales en Pixel Art (64x64 escalado), oclusión lateral externa para volumen 3D cilíndrico,
 * junta de mortero continua en y=31..32, estrías con reflejos claros/oscuros, óxido dithered y grano Haboku.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarRegular(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Fondo de papel Washi tradicional desgastado y húmedo -->
      <rect width="64" height="64" fill="#d6cfc2"/>
      <rect width="64" height="64" fill="#bfb6a6" opacity="0.45"/>

      <!-- Oclusión ambiental lateral externa (curvatura del cilindro) -->
      <!-- Borde izquierdo (penumbra lateral profunda) -->
      <rect x="0" y="1" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="0" y="33" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="3" y="1" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="3" y="33" width="3" height="30" fill="#1c1917" opacity="0.35"/>

      <!-- Borde derecho (penumbra lateral profunda) -->
      <rect x="61" y="1" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="61" y="33" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="58" y="1" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="58" y="33" width="3" height="30" fill="#1c1917" opacity="0.35"/>

      <!-- SECCIÓN SUPERIOR DEL PILAR (y=1 a 30) -->
      <!-- Estría lateral izquierda (penumbra media) -->
      <rect x="7" y="1" width="14" height="30" fill="#44403c" opacity="0.85"/>
      <line x1="7" y1="1" x2="7" y2="30" stroke="#78716c" stroke-width="1"/>
      <line x1="20" y1="1" x2="20" y2="30" stroke="#1c1917" stroke-width="1"/>

      <!-- Estría central frontal (luz principal en aguada pálida) -->
      <rect x="22" y="1" width="19" height="30" fill="#57534e" opacity="0.6"/>
      <line x1="22" y1="1" x2="22" y2="30" stroke="#a8a29e" stroke-width="1"/>
      <line x1="40" y1="1" x2="40" y2="30" stroke="#292524" stroke-width="1"/>

      <!-- Estría lateral derecha (sombra de volumen en tinta densa) -->
      <rect x="42" y="1" width="15" height="30" fill="#292524" opacity="0.9"/>
      <line x1="42" y1="1" x2="42" y2="30" stroke="#57534e" stroke-width="1"/>
      <line x1="56" y1="1" x2="56" y2="30" stroke="#0c0a09" stroke-width="1"/>

      <!-- SECCIÓN INFERIOR DEL PILAR (y=33 a 62) -->
      <!-- Estría lateral izquierda -->
      <rect x="7" y="33" width="14" height="30" fill="#44403c" opacity="0.85"/>
      <line x1="7" y1="33" x2="7" y2="62" stroke="#78716c" stroke-width="1"/>
      <line x1="20" y1="33" x2="20" y2="62" stroke="#1c1917" stroke-width="1"/>

      <!-- Estría central frontal -->
      <rect x="22" y="33" width="19" height="30" fill="#57534e" opacity="0.6"/>
      <line x1="22" y1="33" x2="22" y2="62" stroke="#a8a29e" stroke-width="1"/>
      <line x1="40" y1="33" x2="40" y2="62" stroke="#292524" stroke-width="1"/>

      <!-- Estría lateral derecha -->
      <rect x="42" y="33" width="15" height="30" fill="#292524" opacity="0.9"/>
      <line x1="42" y1="33" x2="42" y2="62" stroke="#57534e" stroke-width="1"/>
      <line x1="56" y1="33" x2="56" y2="62" stroke="#0c0a09" stroke-width="1"/>

      <!-- JUNTAS DE CONEXIÓN MODULAR -->
      <!-- Anillo intermedio entre tambores (y=31..32) -->
      <rect x="0" y="31" width="64" height="2" fill="#121212"/>
      <rect x="0" y="30" width="64" height="1" fill="#78716c" opacity="0.4"/>
      <rect x="0" y="33" width="64" height="1" fill="#1c1917" opacity="0.3"/>

      <!-- Bordes superior e inferior continuos (1 px cada extremo = 2 px en unión) -->
      <rect x="0" y="0" width="64" height="1" fill="#121212"/>
      <rect x="0" y="63" width="64" height="1" fill="#121212"/>

      <!-- Escurrimientos de óxido en hendiduras de estrías -->
      <g fill="#78350f" opacity="0.7">
        <rect x="21" y="2" width="1" height="16"/>
        <rect x="21" y="18" width="1" height="4" opacity="0.5"/>
        <rect x="41" y="2" width="1" height="12"/>
        <rect x="41" y="14" width="1" height="3" opacity="0.5"/>
        <rect x="21" y="34" width="1" height="18"/>
        <rect x="41" y="34" width="1" height="15"/>
      </g>

      <!-- Piqueteado asimétrico y grano de tinta Haboku de 1 px -->
      <g fill="#1c1917">
        <rect x="12" y="9" width="1" height="1"/>
        <rect x="29" y="12" width="1" height="1"/>
        <rect x="48" y="10" width="1" height="1"/>
        <rect x="14" y="44" width="1" height="1"/>
        <rect x="32" y="47" width="1" height="1"/>
        <rect x="49" y="41" width="1" height="1"/>
      </g>
    </g>
  `;
}

/**
 * Tile 12: Pilar con Soporte de Antorcha (pillarTorch)
 * Soporte de hierro forjado medieval pixelado con remaches, brazo angular,
 * casquillo receptor y penacho ascendente de hollín negro con tramado escalonado.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarTorch(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Base estructural Sumi-e cilíndrica -->
      <rect width="64" height="64" fill="#d6cfc2"/>
      <rect width="64" height="64" fill="#bfb6a6" opacity="0.45"/>

      <!-- Oclusión cilíndrica lateral -->
      <rect x="0" y="1" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="0" y="33" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="3" y="1" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="3" y="33" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="61" y="1" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="61" y="33" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="58" y="1" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="58" y="33" width="3" height="30" fill="#1c1917" opacity="0.35"/>

      <!-- Estrías laterales -->
      <rect x="7" y="1" width="14" height="30" fill="#44403c" opacity="0.85"/>
      <rect x="22" y="1" width="19" height="30" fill="#57534e" opacity="0.6"/>
      <rect x="42" y="1" width="15" height="30" fill="#292524" opacity="0.9"/>

      <rect x="7" y="33" width="14" height="30" fill="#44403c" opacity="0.85"/>
      <rect x="22" y="33" width="19" height="30" fill="#57534e" opacity="0.6"/>
      <rect x="42" y="33" width="15" height="30" fill="#292524" opacity="0.9"/>

      <!-- Junta central continua y bordes modulares -->
      <rect x="0" y="31" width="64" height="2" fill="#121212"/>
      <rect x="0" y="0" width="64" height="1" fill="#121212"/>
      <rect x="0" y="63" width="64" height="1" fill="#121212"/>

      <!-- Mancha vertical ascendente de hollín y humo sobre la antorcha (Tramado escalonado) -->
      <!-- Núcleo oscuro de hollín -->
      <rect x="29" y="3" width="6" height="24" fill="#0c0a09"/>
      <rect x="28" y="7" width="8" height="18" fill="#0c0a09"/>
      <rect x="27" y="12" width="10" height="12" fill="#0c0a09"/>
      <!-- Halo de carbón / aguada densa -->
      <rect x="26" y="14" width="12" height="11" fill="#1c1917" opacity="0.75"/>
      <rect x="25" y="18" width="14" height="6" fill="#292524" opacity="0.6"/>
      <!-- Dithering de humo en el ápice -->
      <rect x="30" y="1" width="4" height="2" fill="#1c1917"/>
      <rect x="29" y="2" width="1" height="1" fill="#292524"/>
      <rect x="34" y="2" width="1" height="1" fill="#292524"/>

      <!-- SOPORTE DE HIERRO FORJADO / APLIQUE MEDIEVAL PIXEL ART -->
      <!-- Placa de anclaje a la piedra (x=29..34, y=26..44) -->
      <rect x="29" y="26" width="6" height="18" fill="#18181b"/>
      <rect x="30" y="27" width="4" height="16" fill="#27272a"/>
      <!-- Bisel metálico superior -->
      <rect x="30" y="27" width="4" height="1" fill="#52525b"/>

      <!-- Clavos / Remaches de fijación cuadrados -->
      <rect x="31" y="28" width="2" height="2" fill="#0c0a09"/>
      <rect x="31" y="28" width="1" height="1" fill="#71717a"/>
      <rect x="31" y="41" width="2" height="2" fill="#0c0a09"/>
      <rect x="31" y="41" width="1" height="1" fill="#71717a"/>

      <!-- Brazo angular del soporte (diagonal pixelada) -->
      <rect x="32" y="32" width="2" height="5" fill="#18181b"/>
      <rect x="34" y="33" width="2" height="3" fill="#27272a"/>
      <rect x="36" y="34" width="1" height="1" fill="#3f3f46"/>

      <!-- Anillo / Casquillo receptor de la antorcha (perspectiva pixelada) -->
      <rect x="27" y="30" width="10" height="3" fill="#0c0a09"/>
      <rect x="28" y="29" width="8" height="2" fill="#27272a"/>
      <rect x="29" y="29" width="6" height="1" fill="#52525b"/>
      <rect x="30" y="30" width="4" height="1" fill="#0c0a09"/>

      <!-- Vástago curvado inferior de refuerzo -->
      <rect x="31" y="37" width="2" height="6" fill="#18181b"/>
      <rect x="30" y="43" width="2" height="2" fill="#27272a"/>
      <rect x="28" y="45" width="3" height="1" fill="#3f3f46"/>

      <!-- Escurrimiento de óxido bajo la placa de hierro -->
      <rect x="31" y="44" width="2" height="14" fill="#78350f" opacity="0.6"/>
      <rect x="32" y="58" width="1" height="4" fill="#78350f" opacity="0.3"/>
    </g>
  `;
}

/**
 * Tile 20: Pilar con Moho y Líquenes (pillarMossy)
 * Fuste cilíndrico Sumi-e con racimos de musgo verde matcha pixelado (Koke-dera)
 * y líquenes adheridos en las estrías y junta media.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarMossy(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#d6cfc2"/>
      <rect width="64" height="64" fill="#bfb6a6" opacity="0.45"/>

      <!-- Oclusión cilíndrica lateral -->
      <rect x="0" y="1" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="0" y="33" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="3" y="1" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="3" y="33" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="61" y="1" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="61" y="33" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="58" y="1" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="58" y="33" width="3" height="30" fill="#1c1917" opacity="0.35"/>

      <!-- Estrías laterales y frontal -->
      <rect x="7" y="1" width="14" height="30" fill="#44403c" opacity="0.85"/>
      <rect x="22" y="1" width="19" height="30" fill="#57534e" opacity="0.6"/>
      <rect x="42" y="1" width="15" height="30" fill="#292524" opacity="0.9"/>

      <rect x="7" y="33" width="14" height="30" fill="#44403c" opacity="0.85"/>
      <rect x="22" y="33" width="19" height="30" fill="#57534e" opacity="0.6"/>
      <rect x="42" y="33" width="15" height="30" fill="#292524" opacity="0.9"/>

      <!-- Junta central continua y bordes modulares -->
      <rect x="0" y="31" width="64" height="2" fill="#121212"/>
      <rect x="0" y="0" width="64" height="1" fill="#121212"/>
      <rect x="0" y="63" width="64" height="1" fill="#121212"/>

      <!-- Humedad profunda previa en las estrías sombrías -->
      <rect x="6" y="24" width="15" height="16" fill="#020617" opacity="0.4"/>
      <rect x="39" y="25" width="18" height="15" fill="#020617" opacity="0.4"/>

      <!-- Capa 1: Musgo verde profundo Koke-dera (Bloques escalonados) -->
      <g fill="#14532d">
        <!-- Racimo en estría izquierda -->
        <rect x="7" y="27" width="12" height="10"/>
        <rect x="9" y="25" width="8" height="14"/>
        <rect x="5" y="29" width="4" height="6"/>
        <!-- Racimo en junta central derecha -->
        <rect x="41" y="26" width="15" height="11"/>
        <rect x="43" y="24" width="11" height="15"/>
        <rect x="55" y="28" width="4" height="7"/>
        <!-- Salpicaduras en estría central -->
        <rect x="22" y="18" width="5" height="4"/>
        <rect x="23" y="46" width="6" height="5"/>
      </g>

      <!-- Capa 2: Manchas de hongos y líquenes marchitos -->
      <g fill="#3f6212">
        <rect x="9" y="28" width="8" height="7"/>
        <rect x="11" y="26" width="4" height="11"/>
        <rect x="43" y="28" width="10" height="7"/>
        <rect x="45" y="25" width="6" height="12"/>
        <rect x="23" y="19" width="3" height="2"/>
        <rect x="24" y="47" width="4" height="3"/>
      </g>

      <!-- Capa 3: Esporas luminiscentes / brotes jóvenes (Píxeles de 1 px) -->
      <g fill="#65a30d">
        <rect x="10" y="27" width="2" height="2"/>
        <rect x="13" y="31" width="1" height="2"/>
        <rect x="8" y="32" width="2" height="1"/>
        <rect x="44" y="27" width="2" height="2"/>
        <rect x="49" y="30" width="2" height="1"/>
        <rect x="52" y="32" width="1" height="2"/>
        <rect x="24" y="20" width="1" height="1"/>
      </g>

      <!-- Escurrimiento viscoso en la junta vertical -->
      <rect x="13" y="37" width="1" height="15" fill="#14532d" opacity="0.8"/>
      <rect x="47" y="37" width="1" height="18" fill="#14532d" opacity="0.8"/>
    </g>
  `;
}

/**
 * Tile 21: Pilar Agrietado / Ancestral (pillarCracked / sumiePillarCracked)
 * Fuste cilíndrico Sumi-e con gran fractura diagonal escalonada (Nōboku),
 * talismán Ofuda cinabrio centrado, sello Hanko y salpicaduras Haboku.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarCracked(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <rect width="64" height="64" fill="#d6cfc2"/>
      <rect width="64" height="64" fill="#bfb6a6" opacity="0.45"/>

      <!-- Oclusión cilíndrica lateral -->
      <rect x="0" y="1" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="0" y="33" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="3" y="1" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="3" y="33" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="61" y="1" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="61" y="33" width="3" height="30" fill="#141210" opacity="0.5"/>
      <rect x="58" y="1" width="3" height="30" fill="#1c1917" opacity="0.35"/>
      <rect x="58" y="33" width="3" height="30" fill="#1c1917" opacity="0.35"/>

      <!-- Estrías laterales y central -->
      <rect x="7" y="1" width="14" height="30" fill="#44403c" opacity="0.85"/>
      <rect x="22" y="1" width="19" height="30" fill="#57534e" opacity="0.6"/>
      <rect x="42" y="1" width="15" height="30" fill="#292524" opacity="0.9"/>

      <rect x="7" y="33" width="14" height="30" fill="#44403c" opacity="0.85"/>
      <rect x="22" y="33" width="19" height="30" fill="#57534e" opacity="0.6"/>
      <rect x="42" y="33" width="15" height="30" fill="#292524" opacity="0.9"/>

      <!-- Junta central continua y bordes modulares -->
      <rect x="0" y="31" width="64" height="2" fill="#121212"/>
      <rect x="0" y="0" width="64" height="1" fill="#121212"/>
      <rect x="0" y="63" width="64" height="1" fill="#121212"/>

      <!-- GRAN FRACTURA DIAGONAL ESCALONADA (Nōboku) -->
      <!-- Sombra abisal de la fisura -->
      <g fill="#0c0a09">
        <rect x="44" y="1" width="3" height="8"/>
        <rect x="41" y="8" width="4" height="6"/>
        <rect x="36" y="13" width="6" height="5"/>
        <rect x="30" y="17" width="7" height="6"/>
        <rect x="28" y="22" width="4" height="8"/>
        <rect x="25" y="29" width="4" height="6"/>
        <rect x="20" y="34" width="6" height="7"/>
        <rect x="18" y="40" width="3" height="8"/>
        <rect x="13" y="47" width="6" height="7"/>
        <rect x="10" y="53" width="4" height="10"/>
      </g>

      <!-- Filo de fractura iluminado (Bisel de la piedra quebrada) -->
      <g fill="#a8a29e">
        <rect x="47" y="1" width="1" height="7"/>
        <rect x="45" y="8" width="1" height="5"/>
        <rect x="42" y="13" width="1" height="4"/>
        <rect x="37" y="17" width="1" height="5"/>
        <rect x="32" y="22" width="1" height="7"/>
        <rect x="29" y="29" width="1" height="5"/>
        <rect x="26" y="34" width="1" height="6"/>
        <rect x="21" y="40" width="1" height="7"/>
        <rect x="19" y="47" width="1" height="6"/>
        <rect x="14" y="53" width="1" height="10"/>
      </g>

      <!-- Fisuras secundarias que rajan las estrías -->
      <rect x="14" y="22" width="14" height="1" fill="#0c0a09"/>
      <rect x="14" y="23" width="14" height="1" fill="#78716c" opacity="0.6"/>
      <rect x="30" y="35" width="14" height="1" fill="#0c0a09"/>
      <rect x="30" y="36" width="14" height="1" fill="#78716c" opacity="0.6"/>

      <!-- TALISMÁN OFUDA EN EL CENTRO (Sellado ritual en diagonal) -->
      <!-- Sombra del pergamino -->
      <rect x="35" y="27" width="11" height="22" fill="#121212" opacity="0.4"/>
      <!-- Pergamino cinabrio ritual -->
      <rect x="34" y="26" width="11" height="22" fill="#991b1b"/>
      <rect x="35" y="27" width="9" height="20" fill="none" stroke="#f4efe4" stroke-width="1" opacity="0.7"/>
      <!-- Trazo caligráfico ritual y núcleo dorado -->
      <rect x="39" y="29" width="1" height="16" fill="#121212"/>
      <rect x="37" y="32" width="5" height="1" fill="#121212"/>
      <rect x="36" y="36" width="7" height="1" fill="#121212"/>
      <rect x="38" y="40" width="3" height="1" fill="#121212"/>
      <rect x="39" y="35" width="1" height="2" fill="#fef08a"/>

      <!-- Sello Hanko bermellón en la base derecha -->
      <rect x="50" y="50" width="8" height="8" fill="#b91c1c"/>
      <rect x="51" y="51" width="6" height="6" fill="none" stroke="#f4efe4" stroke-width="1"/>
      <rect x="54" y="52" width="1" height="4" fill="#f4efe4"/>
      <rect x="52" y="54" width="4" height="1" fill="#f4efe4"/>

      <!-- Salpicaduras Haboku de 1 px -->
      <g fill="#121212">
        <rect x="17" y="24" width="1" height="1"/>
        <rect x="20" y="25" width="1" height="1"/>
        <rect x="40" y="9" width="1" height="1"/>
      </g>
    </g>
  `;
}

/**
 * Tile 22: Pilar Rúnico / Anillo Arcano (pillarRunic)
 * Collarín de cantería con biseles escalonados, medallón tallado, runa incandescente
 * en bermellón cinabrio (Shuniku), núcleo dorado y canales de energía vertical continuos.
 * @param {number} S - Tamaño de la casilla en píxeles (default: 128).
 * @returns {string} Fragmento SVG.
 */
export function pillarRunic(S = 128) {
  const scale = S / 64;
  return `
    <g transform="scale(${scale})" shape-rendering="crispEdges">
      <!-- Base estructural Sumi-e cilíndrica -->
      <rect width="64" height="64" fill="#d6cfc2"/>
      <rect width="64" height="64" fill="#bfb6a6" opacity="0.45"/>

      <!-- Oclusión cilíndrica lateral continua -->
      <rect x="0" y="1" width="3" height="62" fill="#141210" opacity="0.5"/>
      <rect x="3" y="1" width="3" height="62" fill="#1c1917" opacity="0.35"/>
      <rect x="61" y="1" width="3" height="62" fill="#141210" opacity="0.5"/>
      <rect x="58" y="1" width="3" height="62" fill="#1c1917" opacity="0.35"/>

      <!-- Estrías cilíndricas de fondo -->
      <rect x="7" y="1" width="14" height="62" fill="#44403c" opacity="0.85"/>
      <rect x="22" y="1" width="19" height="62" fill="#57534e" opacity="0.6"/>
      <rect x="42" y="1" width="15" height="62" fill="#292524" opacity="0.9"/>

      <!-- Bordes modulares continuos superior e inferior -->
      <rect x="0" y="0" width="64" height="1" fill="#121212"/>
      <rect x="0" y="63" width="64" height="1" fill="#121212"/>

      <!-- Canales de energía vertical continua (cruzan el pilar de punta a punta) -->
      <rect x="31" y="0" width="2" height="64" fill="#b91c1c" opacity="0.85"/>
      <line x1="32" y1="0" x2="32" y2="64" stroke="#ea580c" stroke-width="1"/>

      <!-- COLLARÍN / ANILLO DE CANTERÍA ARCANO CENTRAL (y=19 a 44) -->
      <!-- Sombra exterior del collarín -->
      <rect x="3" y="18" width="58" height="28" fill="#0c0a09" opacity="0.7"/>
      <!-- Bloque del collarín -->
      <rect x="4" y="19" width="56" height="26" fill="#292524"/>
      <!-- Bisel iluminado superior del collarín -->
      <rect x="4" y="19" width="56" height="1" fill="#78716c"/>
      <!-- Sombra inferior del collarín -->
      <rect x="4" y="44" width="56" height="1" fill="#141210"/>

      <!-- Medallón circular tallado en el collarín (diámetro 22 px) -->
      <rect x="21" y="21" width="22" height="22" fill="#1c1917"/>
      <rect x="22" y="22" width="20" height="20" fill="#292524"/>
      <rect x="23" y="23" width="18" height="18" fill="#141210"/>

      <!-- Surco del glifo rúnico (Rombo tallado) -->
      <rect x="31" y="24" width="2" height="16" fill="#0c0a09"/>
      <rect x="24" y="31" width="16" height="2" fill="#0c0a09"/>
      <!-- Diagonales del rombo rúnico tallado -->
      <rect x="28" y="26" width="2" height="2" fill="#0c0a09"/>
      <rect x="34" y="26" width="2" height="2" fill="#0c0a09"/>
      <rect x="26" y="28" width="2" height="2" fill="#0c0a09"/>
      <rect x="36" y="28" width="2" height="2" fill="#0c0a09"/>
      <rect x="26" y="34" width="2" height="2" fill="#0c0a09"/>
      <rect x="36" y="34" width="2" height="2" fill="#0c0a09"/>
      <rect x="28" y="36" width="2" height="2" fill="#0c0a09"/>
      <rect x="34" y="36" width="2" height="2" fill="#0c0a09"/>

      <!-- RUNA EN BERMELLÓN CINABRIO (Shuniku) -->
      <line x1="32" y1="24" x2="32" y2="40" stroke="#b91c1c" stroke-width="1"/>
      <line x1="24" y1="32" x2="40" y2="32" stroke="#b91c1c" stroke-width="1"/>
      <!-- Rombo trazado de la runa -->
      <rect x="31" y="25" width="2" height="1" fill="#ea580c"/>
      <rect x="31" y="38" width="2" height="1" fill="#ea580c"/>
      <rect x="25" y="31" width="1" height="2" fill="#ea580c"/>
      <rect x="38" y="31" width="1" height="2" fill="#ea580c"/>
      <rect x="29" y="27" width="1" height="1" fill="#b91c1c"/>
      <rect x="34" y="27" width="1" height="1" fill="#b91c1c"/>
      <rect x="27" y="29" width="1" height="1" fill="#b91c1c"/>
      <rect x="36" y="29" width="1" height="1" fill="#b91c1c"/>
      <rect x="27" y="34" width="1" height="1" fill="#b91c1c"/>
      <rect x="36" y="34" width="1" height="1" fill="#b91c1c"/>
      <rect x="29" y="36" width="1" height="1" fill="#b91c1c"/>
      <rect x="34" y="36" width="1" height="1" fill="#b91c1c"/>

      <!-- Núcleo incandescente dorado -->
      <rect x="30" y="30" width="4" height="4" fill="#7f1d1d"/>
      <rect x="31" y="31" width="2" height="2" fill="#f59e0b"/>
      <rect x="31" y="31" width="1" height="1" fill="#fef08a"/>

      <!-- Remaches de forja del anillo -->
      <rect x="8" y="30" width="2" height="2" fill="#0c0a09"/>
      <rect x="8" y="30" width="1" height="1" fill="#71717a"/>
      <rect x="54" y="30" width="2" height="2" fill="#0c0a09"/>
      <rect x="54" y="30" width="1" height="1" fill="#71717a"/>
    </g>
  `;
}

// Compatibilidad retroactiva de nombres
export const sumiePillarRegular = pillarRegular;
export const sumiePillarCracked = pillarCracked;
export const pillarMonolith = pillarRegular;
export const pillarFluted = pillarTorch;
export const pillarDark = pillarRunic;

export const pillarSprites = {
  pillarRegular,
  pillarCracked,
  pillarTorch,
  pillarMossy,
  pillarRunic,
  // Alias Sumi-e
  sumiePillarRegular,
  sumiePillarCracked,
  // Alias de compatibilidad
  pillarMonolith,
  pillarFluted,
  pillarDark
};
