// src/render/TextureGenerator.js
import * as THREE from 'three';

export class TextureGenerator {
  /**
   * Genera el Texture Atlas procedural estilo voxel con 32 patrones vectoriales (4x8):
   * - Muros (5 variaciones, Tiles 0 a 4): Sillar regular, sillar agrietado, mampostería irregular, sillar con musgo, glifo rúnico.
   * - Suelo (5 variaciones, Tiles 5 a 9): Grandes losas, losa fracturada, adoquines irregulares, losa con musgo, rombo ceremonial.
   * - Pilares (5 variaciones, Tiles 10, 12, 20 a 22): Columna monolítica continua base, columna lisa, columna con musgo y líquenes, columna con fracturas y desgaste, y columna con tono oscuro basáltico.
   * - Especial (3 patrones, Tiles 11, 14, 15): Losa rúnica de aparición (Respawn), losa de salto ámbar (Jump Pad) y círculo rúnico (Pedestal).
   * - Lava (5 variaciones, Tiles 13, 16 a 19): Magma activo, corteza de basalto con fisuras, domos de gas hirviente, río piroclástico y caldera de fusión pura.
   * 
   * Al estar en escala de grises calibrada, Three.js multiplica automáticamente la textura
   * por el color del tipo de bloque (p. ej. slate-700 para muros, slate-600 para suelo, slate-500 para pilares).
   */
  static createVoxelAtlasTexture(atlasWidth = 512, atlasHeight = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = atlasWidth;
    canvas.height = atlasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const S = 128; // 128 px por casilla en la cuadrícula de 4 columnas x 8 filas (512x1024)

    // Color base neutro inmediato para evitar destellos antes de que cargue la imagen
    ctx.fillStyle = '#d4d4d8';
    ctx.fillRect(0, 0, atlasWidth, atlasHeight);

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

      // ==================== TILE 11: RESPAWN_PAD (Losa Rúnica de Aparición / Reaparición de Aventureros) ====================
      `
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

      // ==================== TILE 13: LAVA (Magma Volcánico Incandescente con Corteza de Basalto) ====================
      `
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
      `,

      // ==================== TILE 14: JUMP_PAD (Losa de Cantería con Runa Ámbar de Salto) ====================
      `
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
      `,

      // ==================== TILE 16: LAVA 2 (Corteza de Basalto Fracturada & Fisuras de Magma Vivo) ====================
      `
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
      `,

      // ==================== TILE 17: LAVA 3 (Géiseres, Domos de Gas & Burbujas Hirvientes) ====================
      `
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
      `,

      // ==================== TILE 18: LAVA 4 (Río Rápido de Magma / Corriente Piroclástica Diagonal) ====================
      `
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
      `,

      // ==================== TILE 19: LAVA 5 (Caldera de Fusión Pura / Núcleo Solar Blanco-Dorado) ====================
      `
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
      `,

      // ==================== TILE 20: PILAR CON MUSGO (Columna Monolítica con Vegetación y Líquenes) ====================
      `
        <!-- Fondo base: Piedra oscura de sillar macizo (mismo tono que Tile 10) -->
        <rect width="${S}" height="${S}" fill="#1c2027"/>

        <!-- Sombreado de volumen cilíndrico continuo -->
        <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
        <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
        <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
        <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>

        <!-- 3 Acanaladuras/Estrías verticales profundas continuas de Y=0 a Y=S -->
        <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="32"   y1="0" x2="32"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

        <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="64"   y1="0" x2="64"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

        <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="96"   y1="0" x2="96"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>

        <!-- Desgaste base sutil -->
        <g stroke="#080a0d" stroke-width="1.2" fill="none" opacity="0.5">
          <path d="M 18,20 L 16,36 L 19,52"/>
          <path d="M 80,72 L 78,88 L 82,104"/>
        </g>

        <!-- Capa 1 de Musgo: Humedad profunda verde oscura en hendiduras de estrías -->
        <g fill="#14532d" opacity="0.85">
          <path d="M 30,18 Q 35,26 31,38 Q 28,48 33,56 L 35,56 Q 30,46 34,36 Q 36,24 33,18 Z"/>
          <path d="M 29,82 Q 34,92 31,104 Q 28,114 33,124 L 35,124 Q 30,112 34,102 Q 35,90 32,82 Z"/>
          <path d="M 61,42 Q 67,52 63,68 Q 59,80 66,94 L 68,94 Q 61,78 66,66 Q 69,50 64,42 Z"/>
          <path d="M 93,12 Q 98,22 95,34 Q 92,44 96,54 L 98,54 Q 94,42 97,32 Q 99,20 95,12 Z"/>
          <path d="M 92,76 Q 97,88 94,100 Q 91,110 96,120 L 98,120 Q 93,108 97,98 Q 99,86 95,76 Z"/>
          <ellipse cx="14" cy="98" rx="8" ry="14"/>
          <ellipse cx="48" cy="112" rx="10" ry="8"/>
          <ellipse cx="80" cy="28" rx="7" ry="12"/>
          <ellipse cx="112" cy="88" rx="6" ry="16"/>
        </g>

        <!-- Capa 2 de Musgo: Verde bosque vivo y filamentos vegetales -->
        <g fill="#16a34a" opacity="0.9">
          <path d="M 31,24 Q 34,30 32,40 Q 30,48 33,52 L 34,52 Q 31,46 33,38 Q 35,28 32,24 Z"/>
          <path d="M 30,88 Q 33,96 32,106 Q 30,114 33,120 L 34,120 Q 31,112 33,104 Q 34,94 32,88 Z"/>
          <path d="M 62,48 Q 66,56 64,70 Q 61,80 65,90 L 66,90 Q 62,78 65,68 Q 67,54 64,48 Z"/>
          <path d="M 94,18 Q 97,26 95,36 Q 93,44 96,50 L 97,50 Q 95,42 96,34 Q 98,24 95,18 Z"/>
          <circle cx="14" cy="98" r="5"/>
          <circle cx="18" cy="106" r="3.5"/>
          <circle cx="48" cy="112" r="6"/>
          <circle cx="56" cy="116" r="3.5"/>
          <circle cx="80" cy="28" r="4.5"/>
          <circle cx="84" cy="36" r="3"/>
          <circle cx="112" cy="88" r="4"/>
          <circle cx="110" cy="98" r="3.5"/>
        </g>

        <!-- Capa 3 de Musgo: Brotes claros de líquenes / esporas (resalte lumínico) -->
        <g fill="#4ade80" opacity="0.75">
          <circle cx="32" cy="32" r="1.8"/>
          <circle cx="33" cy="46" r="1.5"/>
          <circle cx="31" cy="96" r="1.8"/>
          <circle cx="33" cy="112" r="1.5"/>
          <circle cx="63" cy="58" r="2"/>
          <circle cx="65" cy="76" r="1.8"/>
          <circle cx="95" cy="28" r="1.8"/>
          <circle cx="96" cy="42" r="1.4"/>
          <circle cx="14" cy="96" r="2.2"/>
          <circle cx="47" cy="110" r="2.5"/>
          <circle cx="79" cy="26" r="2"/>
          <circle cx="111" cy="86" r="1.8"/>
        </g>

        <!-- Picado mineral residual -->
        <g fill="#454f5d" opacity="0.25">
          <circle cx="18" cy="36" r="1.5"/><circle cx="50" cy="32" r="1.8"/>
          <circle cx="76" cy="82" r="1.6"/><circle cx="106" cy="44" r="1.5"/>
        </g>
      `,

      // ==================== TILE 21: PILAR CON DESGASTE (Columna con Fracturas y Erosión de Cantería) ====================
      `
        <!-- Fondo base: Piedra oscura de sillar macizo (mismo tono que Tile 10) -->
        <rect width="${S}" height="${S}" fill="#1c2027"/>

        <!-- Sombreado de volumen cilíndrico continuo -->
        <rect x="0" y="0" width="6" height="${S}" fill="#3f4754" opacity="0.5"/>
        <rect x="6" y="0" width="8" height="${S}" fill="#2a303a" opacity="0.4"/>
        <rect x="116" y="0" width="6" height="${S}" fill="#12151b" opacity="0.6"/>
        <rect x="122" y="0" width="6" height="${S}" fill="#0b0d11" opacity="0.85"/>

        <!-- 3 Acanaladuras/Estrías verticales profundas continuas de Y=0 a Y=S -->
        <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="32"   y1="0" x2="32"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

        <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="64"   y1="0" x2="64"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#454f5d" stroke-width="1.5" opacity="0.65"/>

        <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#0e1015" stroke-width="2.5" opacity="0.9"/>
        <line x1="96"   y1="0" x2="96"   y2="${S}" stroke="#080a0d" stroke-width="2"/>
        <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#363e4a" stroke-width="1.5" opacity="0.55"/>

        <!-- Fracturas profundas y grietas estructurales severas por estrés de carga -->
        <g stroke="#080a0d" stroke-width="2.2" fill="none" opacity="0.9">
          <!-- Gran fisura diagonal que quiebra el fuste izquierdo -->
          <path d="M 6,32 L 18,38 L 26,34 L 32,46 L 42,42 L 52,54"/>
          <!-- Fisura central ramificada -->
          <path d="M 52,54 L 64,50 L 72,62 L 78,58 L 88,72 L 96,66"/>
          <!-- Rama secundaria hacia abajo -->
          <path d="M 64,50 L 60,66 L 66,80 L 62,98 L 65,114"/>
          <!-- Grieta en fuste derecho -->
          <path d="M 88,72 L 98,84 L 110,80 L 118,92 L 124,90"/>
          <!-- Grieta vertical profunda en estría 1 -->
          <path d="M 32,82 L 30,94 L 34,108 L 31,122"/>
          <!-- Micro-grieta superior -->
          <path d="M 76,10 L 82,18 L 80,30 L 86,40"/>
        </g>

        <!-- Resalte de luz en bordes de roca fracturada (relieve 3D) -->
        <g stroke="#64748b" stroke-width="0.8" fill="none" opacity="0.6">
          <path d="M 6,33 L 18,39 L 26,35 L 32,47 L 42,43 L 52,55"/>
          <path d="M 52,55 L 64,51 L 72,63 L 78,59 L 88,73 L 96,67"/>
          <path d="M 65,50 L 61,66 L 67,80 L 63,98 L 66,114"/>
          <path d="M 88,73 L 98,85 L 110,81 L 118,93 L 124,91"/>
        </g>

        <!-- Grandes muescas angulares de piedra desprendida / desconchada -->
        <g fill="#080a0d" opacity="0.85">
          <polygon points="32,42 42,46 36,54 30,48"/>
          <polygon points="64,48 72,52 68,60 60,56"/>
          <polygon points="96,64 104,70 98,78 92,72"/>
          <polygon points="18,34 26,38 22,46 14,40"/>
          <polygon points="86,68 94,74 90,82 82,76"/>
          <polygon points="30,92 38,96 34,104 26,98"/>
          <polygon points="114,86 122,90 118,98 110,94"/>
        </g>

        <!-- Fragmentos de piedra suelta en las muescas -->
        <g fill="#3f4754" opacity="0.5">
          <polygon points="34,44 40,47 36,52"/>
          <polygon points="66,50 70,53 67,58"/>
          <polygon points="98,66 102,71 97,75"/>
        </g>

        <!-- Picado y escoriación mineral intensa -->
        <g fill="#080a0d" opacity="0.6">
          <circle cx="22" cy="62" r="2.5"/><circle cx="28" cy="74" r="2"/>
          <circle cx="46" cy="24" r="2.2"/><circle cx="58" cy="34" r="2.8"/>
          <circle cx="76" cy="88" r="2.5"/><circle cx="84" cy="102" r="2"/>
          <circle cx="106" cy="24" r="2.2"/><circle cx="112" cy="46" r="2.5"/>
        </g>
        <g fill="#454f5d" opacity="0.35">
          <circle cx="24" cy="64" r="1.5"/><circle cx="48" cy="26" r="1.8"/>
          <circle cx="78" cy="90" r="1.8"/><circle cx="108" cy="26" r="1.5"/>
        </g>
      `,

      // ==================== TILE 22: PILAR OSCURO (Columna con Tono Ligeramente Más Oscuro / Basalto Sombrío) ====================
      `
        <!-- Fondo base: Basalto/Sillar sombrío ~35% más oscuro que Tile 10 -->
        <rect width="${S}" height="${S}" fill="#111419"/>

        <!-- Sombreado de volumen cilíndrico más profundo y frío -->
        <rect x="0" y="0" width="6" height="${S}" fill="#2a303a" opacity="0.45"/>
        <rect x="6" y="0" width="8" height="${S}" fill="#1c2027" opacity="0.35"/>
        <!-- Sombra lateral derecha más profunda -->
        <rect x="116" y="0" width="6" height="${S}" fill="#07080b" opacity="0.75"/>
        <rect x="122" y="0" width="6" height="${S}" fill="#020304" opacity="0.95"/>

        <!-- 3 Acanaladuras/Estrías verticales profundas continuas de Y=0 a Y=S con mayor contraste -->
        <line x1="30.5" y1="0" x2="30.5" y2="${S}" stroke="#06080b" stroke-width="2.5" opacity="0.95"/>
        <line x1="32"   y1="0" x2="32"   y2="${S}" stroke="#020304" stroke-width="2"/>
        <line x1="33.5" y1="0" x2="33.5" y2="${S}" stroke="#2a303a" stroke-width="1.5" opacity="0.55"/>

        <line x1="62.5" y1="0" x2="62.5" y2="${S}" stroke="#06080b" stroke-width="2.5" opacity="0.95"/>
        <line x1="64"   y1="0" x2="64"   y2="${S}" stroke="#020304" stroke-width="2"/>
        <line x1="65.5" y1="0" x2="65.5" y2="${S}" stroke="#2a303a" stroke-width="1.5" opacity="0.55"/>

        <line x1="94.5" y1="0" x2="94.5" y2="${S}" stroke="#06080b" stroke-width="2.5" opacity="0.95"/>
        <line x1="96"   y1="0" x2="96"   y2="${S}" stroke="#020304" stroke-width="2"/>
        <line x1="97.5" y1="0" x2="97.5" y2="${S}" stroke="#1c2027" stroke-width="1.5" opacity="0.5"/>

        <!-- Micro-desgaste y erosión en piedra oscura -->
        <g stroke="#040507" stroke-width="1.4" fill="none" opacity="0.8">
          <path d="M 16,18 L 19,32 L 15,50 L 18,66"/>
          <path d="M 48,62 L 52,78 L 47,96 L 51,112"/>
          <path d="M 80,18 L 77,34 L 81,52 L 78,68"/>
          <path d="M 110,46 L 107,62 L 111,78"/>
        </g>
        <g stroke="#2a303a" stroke-width="0.6" fill="none" opacity="0.35">
          <path d="M 17,18 L 20,32 L 16,50 L 19,66"/>
          <path d="M 49,62 L 53,78 L 48,96 L 52,112"/>
          <path d="M 81,18 L 78,34 L 82,52 L 79,68"/>
        </g>

        <!-- Muescas de piedra desconchada -->
        <g fill="#040507" opacity="0.8">
          <polygon points="32,32 37,37 32,42"/>
          <polygon points="64,70 59,75 64,80"/>
          <polygon points="96,22 91,27 96,32"/>
          <polygon points="96,86 101,91 96,96"/>
          <polygon points="16,46 19,51 15,54"/>
          <polygon points="80,58 84,63 79,66"/>
        </g>

        <!-- Pátina de hollín volcánico / sombra profunda continua -->
        <g fill="#020304" opacity="0.55">
          <ellipse cx="32" cy="58" rx="5" ry="24"/>
          <ellipse cx="64" cy="46" rx="6" ry="28"/>
          <ellipse cx="96" cy="74" rx="5" ry="26"/>
          <ellipse cx="120" cy="64" rx="4" ry="34"/>
          <ellipse cx="14" cy="38" rx="4" ry="18"/>
          <ellipse cx="78" cy="94" rx="5" ry="20"/>
        </g>

        <!-- Picado mineral sutil -->
        <g fill="#2a303a" opacity="0.25">
          <circle cx="12" cy="30" r="1.5"/><circle cx="24" cy="82" r="2"/>
          <circle cx="44" cy="18" r="2"/><circle cx="54" cy="92" r="1.5"/>
          <circle cx="74" cy="44" r="1.8"/><circle cx="86" cy="100" r="2"/>
          <circle cx="104" cy="28" r="1.5"/><circle cx="114" cy="74" r="1.8"/>
        </g>
      `
    ];

    // Ensamblar los grupos en la cuadrícula 4x8 (32 casillas de 128x128 en 512x1024)
    let innerSvg = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 4; c++) {
        const idx = r * 4 + c;
        const x = c * S;
        const y = r * S;
        const tileContent = tilesSvg[idx] || `<rect width="${S}" height="${S}" fill="#18181b"/>`;
        innerSvg += `<g transform="translate(${x}, ${y})">${tileContent}</g>\n`;
      }
    }

    const fullSvgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${atlasWidth}" height="${atlasHeight}" viewBox="0 0 ${atlasWidth} ${atlasHeight}">
        ${innerSvg}
      </svg>
    `;

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, atlasWidth, atlasHeight);
      texture.needsUpdate = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fullSvgString);

    return texture;
  }

  /** Mantiene compatibilidad con versiones previas. */
  static createVoxelTexture(size = 64) {
    return TextureGenerator.createVoxelAtlasTexture(size * 4, size * 8);
  }
}
