import * as THREE from 'three';

export class TextureGenerator {
  /**
   * Genera una textura procedural estilo voxel a partir de un SVG vectorial
   * con biseles de iluminación, bordes pixelados y textura de detalle.
   * Al ser en escala de grises, Three.js la multiplica automáticamente
   * por el color de cada instancia (verde césped, marrón tierra, etc.).
   */
  static createVoxelTexture(size = 64) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // SVG en escala de grises con bordes de bisel y textura táctil
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <!-- Fondo base neutro -->
        <rect width="${size}" height="${size}" fill="#d4d4d8" />

        <!-- Bisel de iluminación superior e izquierdo -->
        <path d="M 0,0 L ${size},0 L ${size - 4},4 L 4,4 L 4,${size - 4} L 0,${size} Z" fill="#ffffff" opacity="0.45" />

        <!-- Bisel de sombra inferior y derecho -->
        <path d="M ${size},0 L ${size},${size} L 0,${size} L 4,${size - 4} L ${size - 4},${size - 4} L ${size - 4},4 Z" fill="#18181b" opacity="0.3" />

        <!-- Cuadrícula interna de detalles estilo bloque -->
        <rect x="4" y="4" width="${size - 8}" height="${size - 8}" fill="#e4e4e7" />
        
        <!-- Píxeles decorativos de ruido/relieve -->
        <rect x="8" y="10" width="6" height="6" fill="#a1a1aa" opacity="0.35" />
        <rect x="24" y="16" width="8" height="6" fill="#ffffff" opacity="0.3" />
        <rect x="44" y="12" width="6" height="6" fill="#71717a" opacity="0.25" />
        <rect x="14" y="32" width="8" height="6" fill="#71717a" opacity="0.3" />
        <rect x="36" y="38" width="10" height="6" fill="#a1a1aa" opacity="0.35" />
        <rect x="22" y="46" width="6" height="6" fill="#ffffff" opacity="0.25" />
        <rect x="48" y="44" width="6" height="6" fill="#71717a" opacity="0.3" />
        
        <!-- Borde sutil exterior -->
        <rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" fill="none" stroke="#27272a" stroke-width="1" opacity="0.2" />
      </svg>
    `;

    const img = new Image();
    const texture = new THREE.CanvasTexture(canvas);
    // NearestFilter produce un estilo pixel-art nítido sin borrosidad
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      texture.needsUpdate = true;
    };

    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

    return texture;
  }
}
