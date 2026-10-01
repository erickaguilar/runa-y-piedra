// src/render/TextureGenerator.js
import * as THREE from 'three';
import { createTilesSvgArray } from './textures/index.js';

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

    const tilesSvg = createTilesSvgArray(S);

    // Máscara de recorte estricta por celda para garantizar contención absoluta (evitar sangrado entre celdas)
    let innerSvg = `
      <defs>
        <clipPath id="tile-cell-clip">
          <rect x="0" y="0" width="${S}" height="${S}" />
        </clipPath>
      </defs>
    `;

    // Ensamblar los grupos en la cuadrícula 4x8 (32 casillas de 128x128 en 512x1024)
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 4; c++) {
        const idx = r * 4 + c;
        const x = c * S;
        const y = r * S;
        const tileContent = tilesSvg[idx] || `<rect width="${S}" height="${S}" fill="#18181b"/>`;
        innerSvg += `<g transform="translate(${x}, ${y})" clip-path="url(#tile-cell-clip)">${tileContent}</g>\n`;
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
