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
      // Tile 5: Grandes losas cuadradas con bisel pulido (2x2)
      `
        <rect width="${S}" height="${S}" fill="#18181b"/>
        <!-- 4 Losas de piedra lisa -->
        <rect x="4" y="4" width="58" height="58" rx="2" fill="#e4e4e7"/>
        <rect x="66" y="4" width="58" height="58" rx="2" fill="#d4d4d8"/>
        <rect x="4" y="66" width="58" height="58" rx="2" fill="#d4d4d8"/>
        <rect x="66" y="66" width="58" height="58" rx="2" fill="#e4e4e7"/>
        <!-- Bisel de iluminación en cada losa -->
        <g stroke="#ffffff" stroke-width="2" opacity="0.5" fill="none">
          <path d="M 6,60 L 6,6 L 60,6"/>
          <path d="M 68,60 L 68,6 L 122,6"/>
          <path d="M 6,122 L 6,68 L 60,68"/>
          <path d="M 68,122 L 68,68 L 122,68"/>
        </g>
        <!-- Grano de desgaste central -->
        <circle cx="32" cy="32" r="3" fill="#a1a1aa" opacity="0.3"/>
        <circle cx="96" cy="96" r="3" fill="#a1a1aa" opacity="0.3"/>
      `,

      // Tile 6: Losa de suelo fracturada por impacto de combate
      `
        <rect width="${S}" height="${S}" fill="#18181b"/>
        <rect x="4" y="4" width="58" height="58" rx="2" fill="#e4e4e7"/>
        <rect x="66" y="4" width="58" height="58" rx="2" fill="#d4d4d8"/>
        <rect x="4" y="66" width="58" height="58" rx="2" fill="#d4d4d8"/>
        <rect x="66" y="66" width="58" height="58" rx="2" fill="#e4e4e7"/>
        <!-- Fractura en estrella por impacto en la losa superior izquierda -->
        <path d="M 32,32 L 6,18 M 32,32 L 20,6 M 32,32 L 52,14 M 32,32 L 56,48 M 32,32 L 18,54" stroke="#18181b" stroke-width="3" fill="none"/>
        <path d="M 33,33 L 7,19 M 33,33 L 21,7 M 33,33 L 53,15 M 33,33 L 57,49 M 33,33 L 19,55" stroke="#ffffff" stroke-width="1" opacity="0.6" fill="none"/>
        <circle cx="32" cy="32" r="4" fill="#18181b"/>
      `,

      // Tile 7: Adoquines medievales irregulares encajados
      `
        <rect width="${S}" height="${S}" fill="#18181b"/>
        <!-- Adoquines redondeados tallados orgánicamente -->
        <g stroke="#18181b" stroke-width="2.5">
          <ellipse cx="28" cy="24" rx="22" ry="18" fill="#d4d4d8"/>
          <ellipse cx="76" cy="20" rx="20" ry="15" fill="#e4e4e7"/>
          <ellipse cx="112" cy="28" rx="14" ry="18" fill="#d4d4d8"/>
          <ellipse cx="16" cy="64" rx="14" ry="18" fill="#e4e4e7"/>
          <ellipse cx="56" cy="62" rx="22" ry="18" fill="#d4d4d8"/>
          <ellipse cx="102" cy="66" rx="20" ry="19" fill="#e4e4e7"/>
          <ellipse cx="28" cy="104" rx="24" ry="18" fill="#e4e4e7"/>
          <ellipse cx="78" cy="106" rx="22" ry="16" fill="#d4d4d8"/>
          <ellipse cx="116" cy="108" rx="12" ry="15" fill="#e4e4e7"/>
        </g>
        <!-- Brillo en la cresta de cada adoquín -->
        <g fill="#ffffff" opacity="0.35">
          <ellipse cx="24" cy="20" rx="8" ry="5"/>
          <ellipse cx="72" cy="17" rx="8" ry="4"/>
          <ellipse cx="52" cy="58" rx="9" ry="6"/>
          <ellipse cx="98" cy="62" rx="8" ry="5"/>
          <ellipse cx="24" cy="100" rx="9" ry="5"/>
          <ellipse cx="74" cy="102" rx="8" ry="5"/>
        </g>
      `,

      // Tile 8: Losas con vegetación y musgo brotando en las ranuras
      `
        <rect width="${S}" height="${S}" fill="#18181b"/>
        <rect x="4" y="4" width="58" height="58" rx="2" fill="#e4e4e7"/>
        <rect x="66" y="4" width="58" height="58" rx="2" fill="#d4d4d8"/>
        <rect x="4" y="66" width="58" height="58" rx="2" fill="#d4d4d8"/>
        <rect x="66" y="66" width="58" height="58" rx="2" fill="#e4e4e7"/>
        <!-- Vegetación de musgo en la cruz de unión de las losas -->
        <g fill="#166534" opacity="0.85">
          <circle cx="64" cy="64" r="14"/>
          <circle cx="64" cy="46" r="8"/><circle cx="64" cy="82" r="8"/>
          <circle cx="46" cy="64" r="8"/><circle cx="82" cy="64" r="8"/>
          <circle cx="54" cy="54" r="6"/><circle cx="74" cy="74" r="6"/>
        </g>
        <g fill="#4ade80" opacity="0.65">
          <circle cx="64" cy="64" r="8"/>
          <circle cx="64" cy="50" r="4"/><circle cx="64" cy="78" r="4"/>
          <circle cx="50" cy="64" r="4"/><circle cx="78" cy="64" r="4"/>
        </g>
      `,

      // Tile 9: Losa ceremonial con rombo y molduras concéntricas
      `
        <rect width="${S}" height="${S}" fill="#18181b"/>
        <rect x="4" y="4" width="${S - 8}" height="${S - 8}" fill="#d4d4d8"/>
        <!-- Rombo ceremonial exterior -->
        <polygon points="64,10 118,64 64,118 10,64" fill="#e4e4e7" stroke="#18181b" stroke-width="3"/>
        <polygon points="64,12 116,64 64,116 12,64" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
        <!-- Rombo interior hundido -->
        <polygon points="64,28 100,64 64,100 28,64" fill="#d4d4d8" stroke="#18181b" stroke-width="2.5"/>
        <circle cx="64" cy="64" r="8" fill="#18181b"/>
        <!-- Triángulos en las 4 esquinas exteriores -->
        <polygon points="6,6 36,6 6,36" fill="#71717a" opacity="0.4"/>
        <polygon points="122,6 92,6 122,36" fill="#71717a" opacity="0.4"/>
        <polygon points="6,122 36,122 6,92" fill="#71717a" opacity="0.4"/>
        <polygon points="122,122 92,122 122,92" fill="#71717a" opacity="0.4"/>
      `,

      // ==================== GRUPO 3: PILARES (Tiles 10 a 14) ====================
      // Tile 10: Columna estriada clásica con acanaladuras verticales
      `
        <rect width="${S}" height="${S}" fill="#d4d4d8"/>
        <!-- 6 Acanaladuras verticales alternando sombras y luces -->
        <g stroke-width="3">
          <line x1="16" y1="0" x2="16" y2="${S}" stroke="#18181b" opacity="0.8"/>
          <line x1="18" y1="0" x2="18" y2="${S}" stroke="#ffffff" opacity="0.6"/>
          
          <line x1="36" y1="0" x2="36" y2="${S}" stroke="#18181b" opacity="0.8"/>
          <line x1="38" y1="0" x2="38" y2="${S}" stroke="#ffffff" opacity="0.6"/>

          <line x1="56" y1="0" x2="56" y2="${S}" stroke="#18181b" opacity="0.8"/>
          <line x1="58" y1="0" x2="58" y2="${S}" stroke="#ffffff" opacity="0.6"/>

          <line x1="74" y1="0" x2="74" y2="${S}" stroke="#18181b" opacity="0.8"/>
          <line x1="76" y1="0" x2="76" y2="${S}" stroke="#ffffff" opacity="0.6"/>

          <line x1="94" y1="0" x2="94" y2="${S}" stroke="#18181b" opacity="0.8"/>
          <line x1="96" y1="0" x2="96" y2="${S}" stroke="#ffffff" opacity="0.6"/>

          <line x1="112" y1="0" x2="112" y2="${S}" stroke="#18181b" opacity="0.8"/>
          <line x1="114" y1="0" x2="114" y2="${S}" stroke="#ffffff" opacity="0.6"/>
        </g>
        <!-- Borde sutil superior e inferior -->
        <line x1="0" y1="2" x2="${S}" y2="2" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
        <line x1="0" y1="${S - 2}" x2="${S}" y2="${S - 2}" stroke="#18181b" stroke-width="2" opacity="0.5"/>
      `,

      // Tile 11: Pilar con anillo/abrazadera horizontal de refuerzo y remaches
      `
        <rect width="${S}" height="${S}" fill="#d4d4d8"/>
        <!-- Estrías de fondo -->
        <line x1="24" y1="0" x2="24" y2="${S}" stroke="#18181b" stroke-width="2" opacity="0.5"/>
        <line x1="48" y1="0" x2="48" y2="${S}" stroke="#18181b" stroke-width="2" opacity="0.5"/>
        <line x1="80" y1="0" x2="80" y2="${S}" stroke="#18181b" stroke-width="2" opacity="0.5"/>
        <line x1="104" y1="0" x2="104" y2="${S}" stroke="#18181b" stroke-width="2" opacity="0.5"/>
        <!-- Anillo central de hierro forjado -->
        <rect x="0" y="44" width="${S}" height="40" fill="#27272a"/>
        <line x1="0" y1="44" x2="${S}" y2="44" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
        <line x1="0" y1="84" x2="${S}" y2="84" stroke="#09090b" stroke-width="3"/>
        <!-- Remaches de forja con reflejo -->
        <g fill="#18181b">
          <circle cx="20" cy="64" r="5"/><circle cx="50" cy="64" r="5"/>
          <circle cx="78" cy="64" r="5"/><circle cx="108" cy="64" r="5"/>
        </g>
        <g fill="#e4e4e7">
          <circle cx="18" cy="62" r="1.8"/><circle cx="48" cy="62" r="1.8"/>
          <circle cx="76" cy="62" r="1.8"/><circle cx="106" cy="62" r="1.8"/>
        </g>
      `,

      // Tile 12: Bloque almohadillado rústico con bordes achaflanados pronunciados
      `
        <rect width="${S}" height="${S}" fill="#18181b"/>
        <!-- Cara frontal elevada en pirámide truncada -->
        <polygon points="0,0 ${S},0 ${S - 14},14 14,14" fill="#ffffff" opacity="0.5"/>
        <polygon points="0,0 14,14 14,${S - 14} 0,${S}" fill="#ffffff" opacity="0.35"/>
        <polygon points="${S},0 ${S},${S} ${S - 14},${S - 14} ${S - 14},14" fill="#18181b" opacity="0.6"/>
        <polygon points="0,${S} ${S},${S} ${S - 14},${S - 14} 14,${S - 14}" fill="#18181b" opacity="0.8"/>
        <!-- Almohadillado central picado -->
        <rect x="14" y="14" width="${S - 28}" height="${S - 28}" fill="#d4d4d8"/>
        <g fill="#71717a" opacity="0.35">
          <rect x="28" y="28" width="8" height="6"/><rect x="68" y="36" width="10" height="6"/>
          <rect x="42" y="64" width="8" height="8"/><rect x="84" y="74" width="10" height="6"/>
          <rect x="36" y="88" width="6" height="8"/><rect x="64" y="92" width="8" height="6"/>
        </g>
      `,

      // Tile 13: Columna salomónica / espiral rúnica helicoidal
      `
        <rect width="${S}" height="${S}" fill="#d4d4d8"/>
        <!-- Bandas diagonales en espiral a 45 grados con luces y sombras -->
        <g stroke-width="5" stroke-linecap="round">
          <line x1="-30" y1="30" x2="30" y2="-30" stroke="#18181b" opacity="0.7"/>
          <line x1="0" y1="64" x2="64" y2="0" stroke="#18181b" opacity="0.7"/>
          <line x1="2" y1="62" x2="66" y2="-2" stroke="#ffffff" stroke-width="2" opacity="0.6"/>

          <line x1="32" y1="96" x2="96" y2="32" stroke="#18181b" opacity="0.7"/>
          <line x1="34" y1="94" x2="98" y2="30" stroke="#ffffff" stroke-width="2" opacity="0.6"/>

          <line x1="64" y1="128" x2="128" y2="64" stroke="#18181b" opacity="0.7"/>
          <line x1="66" y1="126" x2="130" y2="62" stroke="#ffffff" stroke-width="2" opacity="0.6"/>

          <line x1="96" y1="160" x2="160" y2="96" stroke="#18181b" opacity="0.7"/>
          <line x1="98" y1="158" x2="162" y2="94" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
        </g>
      `,

      // Tile 14: Base / Capitel con molduras escalonadas y herrajes de escuadra
      `
        <rect width="${S}" height="${S}" fill="#d4d4d8"/>
        <!-- Moldura horizontal superior escalonada -->
        <rect x="0" y="0" width="${S}" height="18" fill="#e4e4e7"/>
        <line x1="0" y1="18" x2="${S}" y2="18" stroke="#18181b" stroke-width="3"/>
        <rect x="6" y="18" width="${S - 12}" height="12" fill="#d4d4d8"/>
        <line x1="6" y1="30" x2="${S - 6}" y2="30" stroke="#18181b" stroke-width="2"/>
        
        <!-- Fuste medio -->
        <rect x="12" y="30" width="${S - 24}" height="68" fill="#e4e4e7"/>
        <line x1="36" y1="30" x2="36" y2="98" stroke="#18181b" stroke-width="2" opacity="0.4"/>
        <line x1="64" y1="30" x2="64" y2="98" stroke="#18181b" stroke-width="2" opacity="0.4"/>
        <line x1="92" y1="30" x2="92" y2="98" stroke="#18181b" stroke-width="2" opacity="0.4"/>

        <!-- Moldura horizontal inferior (plinto) -->
        <rect x="6" y="98" width="${S - 12}" height="12" fill="#d4d4d8"/>
        <line x1="0" y1="110" x2="${S}" y2="110" stroke="#18181b" stroke-width="3"/>
        <rect x="0" y="110" width="${S}" height="18" fill="#27272a"/>
        <line x1="0" y1="110" x2="${S}" y2="110" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
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
