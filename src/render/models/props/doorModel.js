// src/render/models/props/doorModel.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const LEAF_THICKNESS = 0.12; // 12 cm de roble macizo
export const LEAF_WIDTH     = 1.00; // 2 hojas de 1.00m cubren el vano de 2.00m
export const LEAF_HEIGHT    = 1.98; // Ajustado al vano de 2 bloques de altura

/**
 * Genera proceduralmente una textura de alta resolución (256x512) para las hojas de puerta,
 * con 4 tablones verticales de roble noble, vetas longitudinales orgánicas, nudos de madera,
 * ranuras profundas y remaches de forja en escala 1:2.
 */
export function createWoodPlankTexture(width = 256, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#582f14';
  ctx.fillRect(0, 0, width, height);

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <!-- Fondo base de madera de roble oscuro -->
      <rect width="${width}" height="${height}" fill="#381c0c"/>
      
      <!-- 4 Tablones verticales con matices de madera cálida -->
      <rect x="2" y="2" width="60" height="${height - 4}" fill="#582f14"/>
      <rect x="66" y="2" width="60" height="${height - 4}" fill="#6d3a19"/>
      <rect x="130" y="2" width="60" height="${height - 4}" fill="#582f14"/>
      <rect x="194" y="2" width="60" height="${height - 4}" fill="#643516"/>

      <!-- Ranuras profundas entre tablones con sombras y biseles de luz -->
      <line x1="64" y1="0" x2="64" y2="${height}" stroke="#1f0f06" stroke-width="4"/>
      <line x1="66" y1="0" x2="66" y2="${height}" stroke="#8c4e23" stroke-width="1" opacity="0.6"/>
      <line x1="128" y1="0" x2="128" y2="${height}" stroke="#1f0f06" stroke-width="4"/>
      <line x1="130" y1="0" x2="130" y2="${height}" stroke="#8c4e23" stroke-width="1" opacity="0.6"/>
      <line x1="192" y1="0" x2="192" y2="${height}" stroke="#1f0f06" stroke-width="4"/>
      <line x1="194" y1="0" x2="194" y2="${height}" stroke="#8c4e23" stroke-width="1" opacity="0.6"/>

      <!-- Vetas longitudinales de madera (fibra orgánica) -->
      <g stroke="#3d1f0d" stroke-width="1.2" opacity="0.65" fill="none">
        <path d="M 12 0 Q 18 120 14 260 T 20 ${height}"/>
        <path d="M 36 0 Q 30 180 38 340 T 32 ${height}"/>
        <path d="M 48 0 Q 52 140 46 300 T 50 ${height}"/>

        <path d="M 78 0 Q 84 160 80 320 T 86 ${height}"/>
        <path d="M 100 0 Q 94 130 102 280 T 96 ${height}"/>
        <path d="M 116 0 Q 120 200 114 380 T 118 ${height}"/>

        <path d="M 142 0 Q 148 150 144 300 T 150 ${height}"/>
        <path d="M 164 0 Q 158 170 166 350 T 160 ${height}"/>
        <path d="M 178 0 Q 182 130 176 290 T 180 ${height}"/>

        <path d="M 206 0 Q 212 180 208 340 T 214 ${height}"/>
        <path d="M 228 0 Q 222 140 230 300 T 224 ${height}"/>
        <path d="M 244 0 Q 248 190 242 370 T 246 ${height}"/>
      </g>

      <!-- Nudos de madera artesanales -->
      <g fill="#2e1507" opacity="0.8">
        <ellipse cx="32" cy="110" rx="7" ry="12"/>
        <ellipse cx="104" cy="380" rx="8" ry="14"/>
        <ellipse cx="160" cy="180" rx="7" ry="11"/>
        <ellipse cx="226" cy="440" rx="6" ry="10"/>
      </g>
      <g stroke="#4a2610" stroke-width="1.5" fill="none" opacity="0.7">
        <ellipse cx="32" cy="110" rx="12" ry="20"/>
        <ellipse cx="104" cy="380" rx="14" ry="22"/>
        <ellipse cx="160" cy="180" rx="11" ry="18"/>
        <ellipse cx="226" cy="440" rx="10" ry="16"/>
      </g>

      <!-- Clavos de hierro forjado con remaches en los extremos -->
      <g fill="#18181b">
        <circle cx="32" cy="24" r="3"/><circle cx="96" cy="24" r="3"/>
        <circle cx="160" cy="24" r="3"/><circle cx="224" cy="24" r="3"/>
        <circle cx="32" cy="${height - 24}" r="3"/><circle cx="96" cy="${height - 24}" r="3"/>
        <circle cx="160" cy="${height - 24}" r="3"/><circle cx="224" cy="${height - 24}" r="3"/>
      </g>
      <g fill="#71717a">
        <circle cx="31" cy="23" r="1"/><circle cx="95" cy="23" r="1"/>
        <circle cx="159" cy="23" r="1"/><circle cx="223" cy="23" r="1"/>
        <circle cx="31" cy="${height - 25}" r="1"/><circle cx="95" cy="${height - 25}" r="1"/>
        <circle cx="159" cy="${height - 25}" r="1"/><circle cx="223" cy="${height - 25}" r="1"/>
      </g>

      <!-- Bisel perimetral de relieve -->
      <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#1f0f06" stroke-width="2" opacity="0.8"/>
      <line x1="2" y1="2" x2="${width - 2}" y2="2" stroke="#8c4e23" stroke-width="2" opacity="0.5"/>
    </svg>
  `;

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    texture.needsUpdate = true;
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

  return texture;
}

/**
 * Crea los materiales compartidos para las puertas.
 */
export function createDoorMaterials(woodTexture) {
  return {
    wood: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: woodTexture,
    }),
    iron: new THREE.MeshLambertMaterial({ color: 0x27272a }),
  };
}

/**
 * Crea las geometrías de las hojas batientes y sus herrajes de forja.
 */
export function createDoorGeometries() {
  const leftWood = new THREE.BoxGeometry(LEAF_WIDTH, LEAF_HEIGHT, LEAF_THICKNESS);
  leftWood.translate(LEAF_WIDTH / 2, 0, 0);

  const rightWood = new THREE.BoxGeometry(LEAF_WIDTH, LEAF_HEIGHT, LEAF_THICKNESS);
  rightWood.translate(-LEAF_WIDTH / 2, 0, 0);

  const buildHardwareGeom = (sign) => {
    const b1 = new THREE.BoxGeometry(LEAF_WIDTH, 0.09, LEAF_THICKNESS + 0.02)
      .translate(sign * (LEAF_WIDTH / 2), 0.65, 0);
    const b2 = new THREE.BoxGeometry(LEAF_WIDTH, 0.09, LEAF_THICKNESS + 0.02)
      .translate(sign * (LEAF_WIDTH / 2), -0.65, 0);
    const lk = new THREE.BoxGeometry(0.12, 0.22, LEAF_THICKNESS + 0.04)
      .translate(sign * (LEAF_WIDTH - 0.08), 0, 0);
    const kFront = new THREE.SphereGeometry(0.04, 8, 6)
      .translate(sign * (LEAF_WIDTH - 0.08), -0.02, (LEAF_THICKNESS / 2) + 0.03);
    const kBack = new THREE.SphereGeometry(0.04, 8, 6)
      .translate(sign * (LEAF_WIDTH - 0.08), -0.02, -(LEAF_THICKNESS / 2) - 0.03);

    const merged = mergeGeometries([b1, b2, lk, kFront, kBack]);
    b1.dispose(); b2.dispose(); lk.dispose(); kFront.dispose(); kBack.dispose();
    return merged;
  };

  return {
    leftWood,
    rightWood,
    leftIron: buildHardwareGeom(+1),
    rightIron: buildHardwareGeom(-1),
  };
}

/**
 * Ensambla una hoja de puerta (izquierda si sign=+1, derecha si sign=-1).
 */
export function buildDoorLeaf(sign, geos, mats) {
  const leafGroup = new THREE.Group();
  const woodGeo = sign > 0 ? geos.leftWood : geos.rightWood;
  const ironGeo = sign > 0 ? geos.leftIron : geos.rightIron;

  leafGroup.add(new THREE.Mesh(woodGeo, mats.wood));
  leafGroup.add(new THREE.Mesh(ironGeo, mats.iron));

  return leafGroup;
}
