// src/render/TextureGenerator.js
import * as THREE from 'three';

export class TextureGenerator {
  /**
   * Genera el Texture Atlas procedural estilo voxel con 16 patrones vectoriales (4x4):
   * - Muros (5 variaciones): Sillar regular, sillar agrietado, mampostería irregular, sillar con musgo, glifo rúnico.
   * - Suelo (5 variaciones): Grandes losas, losa fracturada, adoquines irregulares, losa con musgo, rombo ceremonial.
   * - Pilares (5 variaciones): Columna estriada, pilar con anillo de forja, sillar almohadillado, espiral helicoidal, capitel con escuadras.
   * - Especial (1 patrón): Círculo rúnico solar para pedestales y plataformas mágicas.
   * 
   * Al estar en escala de grises calibrada, Three.js multiplica automáticamente la textura
   * por el color del tipo de bloque (p. ej. slate-700 para muros, slate-600 para suelo, slate-500 para pilares).
   */
  static createVoxelAtlasTexture(atlasSize = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = atlasSize;
    canvas.height = atlasSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const S = atlasSize / 4; // 128 px por casilla en el atlas de 512x512

    // Color base neutro inmediato para evitar destellos antes de que cargue la imagen
    ctx.fillStyle = '#d4d4d8';
    ctx.fillRect(0, 0, atlasSize, atlasSize);

    const tilesSvg = [
      // ==================== GRUPO 1: MUROS (Tiles 0 a 4) ====================
      // Tile 0: Muro de sillar regular con hiladas alternadas y juntas profundas
      `
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
      `,

      // Tile 1: Muro de sillar agrietado con fracturas diagonales profundas
      `
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
      `,

      // Tile 2: Mampostería irregular con bloques de diferentes tamaños y mortero ancho
      `
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
      `,

      // Tile 3: Muro con musgo y humedad entre juntas
      `
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
      `,

      // Tile 4: Sillar con glifo rúnico tallado en bajorrelieve
      `
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
      `,

      // ==================== GRUPO 2: PISO (Tiles 5 a 9) ====================
      // Tile 5: floorTiles — Losas grandes 2x2 limpias (base, ~70% del suelo)
      `
        <defs>
          <pattern id="floorA" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
            <rect width="64" height="64" fill="#22262d"/>
            <rect x="1" y="1" width="62" height="62" fill="#6a7078"/>
            <!-- bisel superior + lateral izquierdo (luz cenital) -->
            <path d="M1 1 L63 1 L63 3 L3 3 L3 63 L1 63 Z" fill="#9ca3af" opacity="0.4"/>
            <!-- bisel inferior + lateral derecho (sombra suave sin corte negro agresivo) -->
            <path d="M1 63 L63 63 L63 1 L61 1 L61 61 L1 61 Z" fill="#181b20" opacity="0.35"/>
          </pattern>
        </defs>
        <rect width="${S}" height="${S}" fill="url(#floorA)"/>
        <!-- Variación tonal sutil entre las 4 losas grandes -->
        <rect x="2" y="2" width="60" height="60" fill="#717780" opacity="0.25"/>
        <rect x="66" y="66" width="60" height="60" fill="#646a72" opacity="0.25"/>
        <rect x="66" y="2" width="60" height="60" fill="#6f757e" opacity="0.15"/>
        <!-- Textura de cantería y grano de piedra natural muy suave -->
        <circle cx="28" cy="36" r="2" fill="#4b5563" opacity="0.25"/>
        <circle cx="98" cy="42" r="2.5" fill="#9ca3af" opacity="0.2"/>
        <circle cx="44" cy="94" r="2" fill="#9ca3af" opacity="0.2"/>
        <circle cx="106" cy="100" r="2" fill="#4b5563" opacity="0.25"/>
      `,

      // Tile 6: floorTilesWorn — Losas grandes 2x2 con grietas (~20%)
      `
        <defs>
          <pattern id="floorB" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
            <rect width="64" height="64" fill="#22262d"/>
            <rect x="1" y="1" width="62" height="62" fill="#6a7078"/>
            <path d="M1 1 L63 1 L63 3 L3 3 L3 63 L1 63 Z" fill="#9ca3af" opacity="0.4"/>
            <path d="M1 63 L63 63 L63 1 L61 1 L61 61 L1 61 Z" fill="#181b20" opacity="0.35"/>
          </pattern>
        </defs>
        <rect width="${S}" height="${S}" fill="url(#floorB)"/>
        <rect x="2" y="2" width="60" height="60" fill="#717780" opacity="0.2"/>
        <!-- Grietas orgánicas que cruzan las losas grandes con bisel de relieve -->
        <g stroke="#181b20" stroke-width="1.5" fill="none" opacity="0.8">
          <path d="M24 10 L30 26 L22 42 L34 54"/>
          <path d="M84 20 L96 34 L90 50 L104 62"/>
          <path d="M40 76 L52 88 L46 106 L56 120"/>
          <path d="M100 80 L112 96 L108 114"/>
        </g>
        <g stroke="#9ca3af" stroke-width="0.7" fill="none" opacity="0.4">
          <path d="M23 9 L29 25 L21 41 L33 53"/>
          <path d="M83 19 L95 33 L89 49 L103 61"/>
          <path d="M39 75 L51 87 L45 105 L55 119"/>
          <path d="M99 79 L111 95 L107 113"/>
        </g>
        <!-- Desconchones y lascas en juntas -->
        <g fill="#181b20" opacity="0.55">
          <polygon points="62,28 64,28 64,36 60,34"/>
          <polygon points="92,62 100,64 94,66"/>
          <polygon points="64,96 66,104 62,102"/>
        </g>
      `,

      // Tile 7: floorTilesMossy — Losas grandes 2x2 con musgo (~10%, para zonas húmedas)
      `
        <defs>
          <pattern id="floorC" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
            <rect width="64" height="64" fill="#22262d"/>
            <rect x="1" y="1" width="62" height="62" fill="#6a7078"/>
            <path d="M1 1 L63 1 L63 3 L3 3 L3 63 L1 63 Z" fill="#9ca3af" opacity="0.4"/>
            <path d="M1 63 L63 63 L63 1 L61 1 L61 61 L1 61 Z" fill="#181b20" opacity="0.35"/>
          </pattern>
        </defs>
        <rect width="${S}" height="${S}" fill="url(#floorC)"/>
        <!-- Musgo húmedo en las juntas perimetrales y en la cruz central -->
        <g fill="#3d5a2a" opacity="0.75">
          <rect x="0" y="0" width="${S}" height="2.5"/>
          <rect x="0" y="62.5" width="${S}" height="3"/>
          <rect x="0" y="0" width="2.5" height="${S}"/>
          <rect x="62.5" y="0" width="3" height="${S}"/>
        </g>
        <!-- Matas de musgo orgánico en la cruz central y bordes -->
        <g fill="#4a6e30">
          <ellipse cx="64" cy="64" rx="14" ry="11"/>
          <ellipse cx="64" cy="38" rx="8"  ry="14"/>
          <ellipse cx="64" cy="92" rx="9"  ry="13"/>
          <ellipse cx="36" cy="64" rx="13" ry="8"/>
          <ellipse cx="94" cy="64" rx="12" ry="8"/>
          <ellipse cx="14" cy="20" rx="9"  ry="6"/>
          <ellipse cx="112" cy="108" rx="10" ry="7"/>
        </g>
        <!-- Brillos volumétricos claros del musgo -->
        <g fill="#5d8a3d" opacity="0.85">
          <ellipse cx="64" cy="64" rx="7"   ry="5"/>
          <ellipse cx="64" cy="38" rx="4"   ry="7"/>
          <ellipse cx="64" cy="92" rx="4.5" ry="6.5"/>
          <ellipse cx="36" cy="64" rx="6.5" ry="4"/>
          <ellipse cx="94" cy="64" rx="6"   ry="4"/>
          <ellipse cx="14" cy="20" rx="4.5" ry="3"/>
          <ellipse cx="112" cy="108" rx="5"  ry="3.5"/>
        </g>
      `,

      // Tile 8: floorTilesMossyWorn — Losas grandes 2x2 combinando grietas y musgo
      `
        <defs>
          <pattern id="floorD" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
            <rect width="64" height="64" fill="#22262d"/>
            <rect x="1" y="1" width="62" height="62" fill="#6a7078"/>
            <path d="M1 1 L63 1 L63 3 L3 3 L3 63 L1 63 Z" fill="#9ca3af" opacity="0.4"/>
            <path d="M1 63 L63 63 L63 1 L61 1 L61 61 L1 61 Z" fill="#181b20" opacity="0.35"/>
          </pattern>
        </defs>
        <rect width="${S}" height="${S}" fill="url(#floorD)"/>
        <!-- Grietas secundarias -->
        <g stroke="#181b20" stroke-width="1.5" fill="none" opacity="0.8">
          <path d="M64 40 L54 52 L64 64 L50 78"/>
          <path d="M84 94 L98 106 L92 118"/>
        </g>
        <g stroke="#9ca3af" stroke-width="0.7" fill="none" opacity="0.4">
          <path d="M63 39 L53 51 L63 63 L49 77"/>
          <path d="M83 93 L97 105 L91 117"/>
        </g>
        <!-- Musgo en cruz y grieta -->
        <g fill="#4a6e30">
          <ellipse cx="64" cy="64" rx="11" ry="9"/>
          <ellipse cx="32" cy="64" rx="8"  ry="5"/>
          <ellipse cx="64" cy="96" rx="6"  ry="10"/>
        </g>
        <g fill="#5d8a3d" opacity="0.85">
          <ellipse cx="64" cy="64" rx="5.5" ry="4.5"/>
          <ellipse cx="32" cy="64" rx="4"   ry="2.5"/>
          <ellipse cx="64" cy="96" rx="3"   ry="5"/>
        </g>
      `,

      // Tile 9: floorTilesSanctuary — Losa grande con rombo ceremonial integrado
      `
        <defs>
          <pattern id="floorE" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
            <rect width="64" height="64" fill="#22262d"/>
            <rect x="1" y="1" width="62" height="62" fill="#6a7078"/>
            <path d="M1 1 L63 1 L63 3 L3 3 L3 63 L1 63 Z" fill="#9ca3af" opacity="0.4"/>
            <path d="M1 63 L63 63 L63 1 L61 1 L61 61 L1 61 Z" fill="#181b20" opacity="0.35"/>
          </pattern>
        </defs>
        <rect width="${S}" height="${S}" fill="url(#floorE)"/>
        <!-- Rombo ceremonial que abarca el centro de las 4 losas con bisel pulido -->
        <polygon points="64,16 112,64 64,112 16,64" fill="#525860" stroke="#181b20" stroke-width="2.5"/>
        <polygon points="64,18 110,64 64,110 18,64" fill="none" stroke="#9ca3af" stroke-width="1.2" opacity="0.6"/>
        <polygon points="64,32 96,64 64,96 32,64" fill="#6a7078" stroke="#181b20" stroke-width="2"/>
        <circle cx="64" cy="64" r="8" fill="#181b20"/>
        <circle cx="64" cy="64" r="3.5" fill="#9ca3af"/>
      `,

      // ==================== GRUPO 3: PILARES (Tile 10 a 14 unificados) ====================
      // Tile 10: Columna monolítica continua: fuste oscuro, desgastado y con continuidad vertical absoluta (seamless)
      `
        <!-- Fondo base: Piedra oscura de sillar macizo -->
        <rect width="${S}" height="${S}" fill="#1c2027"/>

        <!-- Sombreado de volumen cilíndrico/prismático continuo (sin cortes horizontales) -->
        <!-- Realce lumínico en el lateral izquierdo -->
        <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
        <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
        <!-- Sombra en el lateral derecho -->
        <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
        <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>

        <!-- 3 Acanaladuras/Estrías verticales profundas continuas de Y=0 a Y=S -->
        <!-- Estría 1 (X = 32) -->
        <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="32"   y1="0" x2="32"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

        <!-- Estría 2 (Central, X = 64) -->
        <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="64"   y1="0" x2="64"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

        <!-- Estría 3 (X = 96) -->
        <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="96"   y1="0" x2="96"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>

        <!-- Desgaste y erosión por los siglos (micro-fisuras verticales en cantería) -->
        <g stroke="#080a0d" stroke-width="1.4" fill="none" opacity="0.75">
          <path d="M 16,14 L 18,28 L 15,44 L 17,58"/>
          <path d="M 48,68 L 51,84 L 47,102 L 50,116"/>
          <path d="M 80,22 L 78,38 L 82,54 L 79,70"/>
          <path d="M 110,50 L 108,66 L 111,82"/>
        </g>
        <g stroke="#454f5d" stroke-width="0.6" fill="none" opacity="0.4">
          <path d="M 17,14 L 19,28 L 16,44 L 18,58"/>
          <path d="M 49,68 L 52,84 L 48,102 L 51,116"/>
          <path d="M 81,22 L 79,38 L 83,54 L 80,70"/>
        </g>

        <!-- Muescas de piedra desconchada y desgaste en aristas -->
        <g fill="#080a0d" opacity="0.7">
          <polygon points="32,36 36,40 32,44"/>
          <polygon points="64,74 60,78 64,82"/>
          <polygon points="96,26 92,30 96,34"/>
          <polygon points="96,90 100,94 96,98"/>
          <polygon points="16,50 18,54 15,56"/>
          <polygon points="80,62 83,66 79,68"/>
        </g>

        <!-- Pátina oscura / hollín vertical acumulado -->
        <g fill="#080a0d" opacity="0.35">
          <ellipse cx="32" cy="64" rx="4" ry="18"/>
          <ellipse cx="64" cy="40" rx="5" ry="22"/>
          <ellipse cx="96" cy="80" rx="4" ry="20"/>
          <ellipse cx="122" cy="64" rx="3" ry="30"/>
        </g>

        <!-- Picado de cantería y textura mineral áspera -->
        <g fill="#454f5d" opacity="0.3">
          <circle cx="12" cy="34" r="1.5"/><circle cx="24" cy="86" r="2"/>
          <circle cx="44" cy="22" r="2"/><circle cx="54" cy="96" r="1.5"/>
          <circle cx="74" cy="48" r="1.8"/><circle cx="86" cy="104" r="2"/>
          <circle cx="104" cy="32" r="1.5"/><circle cx="114" cy="78" r="1.8"/>
        </g>
      `,

      // Tiles 11 a 14: Réplicas coordinadas para garantizar que cualquier mapeo de pilar sea idéntico
      `
        <rect width="${S}" height="${S}" fill="#1c2027"/>
        <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
        <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
        <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
        <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>
        <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="32" y1="0" x2="32" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>
        <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="64" y1="0" x2="64" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>
        <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="96" y1="0" x2="96" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>
      `,

      `
        <rect width="${S}" height="${S}" fill="#1c2027"/>
        <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
        <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
        <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
        <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>
        <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="32" y1="0" x2="32" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>
        <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="64" y1="0" x2="64" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>
        <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="96" y1="0" x2="96" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>
      `,

      `
        <rect width="${S}" height="${S}" fill="#1c2027"/>
        <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
        <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
        <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
        <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>
        <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="32" y1="0" x2="32" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>
        <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="64" y1="0" x2="64" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>
        <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="96" y1="0" x2="96" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>
      `,

      `
        <rect width="${S}" height="${S}" fill="#1c2027"/>
        <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
        <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
        <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
        <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>
        <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="32" y1="0" x2="32" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>
        <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="64" y1="0" x2="64" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>
        <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="96" y1="0" x2="96" y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>
      `,

      // ==================== TILE 15: ESPECIAL / PEDESTALES ====================
      // Tile 15: Glifo rúnico ceremonial con octagrama místico
      `
        <rect width="${S}" height="${S}" fill="#18181b"/>
        <circle cx="64" cy="64" r="56" fill="#27272a" stroke="#d4d4d8" stroke-width="2.5"/>
        <circle cx="64" cy="64" r="50" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
        <!-- Octagrama / Estrella mágica de 8 puntas -->
        <polygon points="64,18 78,50 110,64 78,78 64,110 50,78 18,64 50,50" fill="#e4e4e7" stroke="#18181b" stroke-width="2"/>
        <polygon points="64,28 74,54 100,64 74,74 64,100 54,74 28,64 54,54" fill="#ffffff" opacity="0.4"/>
        <circle cx="64" cy="64" r="14" fill="#27272a" stroke="#ffffff" stroke-width="2"/>
        <circle cx="64" cy="64" r="6" fill="#e4e4e7"/>
      `
    ];

    // Ensamblar los 16 grupos en la cuadrícula 4x4
    let innerSvg = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const idx = r * 4 + c;
        const x = c * S;
        const y = r * S;
        innerSvg += `<g transform="translate(${x}, ${y})">${tilesSvg[idx]}</g>\n`;
      }
    }

    const fullSvgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${atlasSize}" height="${atlasSize}" viewBox="0 0 ${atlasSize} ${atlasSize}">
        ${innerSvg}
      </svg>
    `;

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, atlasSize, atlasSize);
      texture.needsUpdate = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fullSvgString);

    return texture;
  }

  /** Mantiene compatibilidad con versiones previas. */
  static createVoxelTexture(size = 64) {
    return TextureGenerator.createVoxelAtlasTexture(size * 4);
  }
}
