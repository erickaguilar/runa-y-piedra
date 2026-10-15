// src/render/models/props/pressurePlateModel.js
import * as THREE from 'three';

export const PLATE_PRESS_DEPTH = 0.055; // Hundimiento físico de 5.5 cm al activarse

/**
 * Genera proceduralmente una textura Pixel Art 64x64 en estilo Sumi-e Zen / Kasure
 * con base de sillar de basalto oscuro, biselado cenital de tinta, ranuras de pistón mecánico,
 * cuatro herrajes esquineros Kanagu y remaches de bronce antiguo.
 */
export function createPressurePlateTexture(width = 128, height = 128) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#27272a';
  ctx.fillRect(0, 0, width, height);

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 64 64" shape-rendering="crispEdges">
      <!-- Mortero negro carbón perimetral -->
      <rect width="64" height="64" fill="#0c0a09"/>

      <!-- Sillar de basalto oscuro Sumi-e -->
      <rect x="1" y="1" width="62" height="62" fill="#1c1917"/>
      <rect x="3" y="3" width="58" height="58" fill="#292524"/>
      <rect x="6" y="6" width="52" height="52" fill="#3f3f46"/>

      <!-- Bisel de iluminación cenital y sombra profunda -->
      <path d="M1,1 H62 V2 H2 V62 H1 Z" fill="#78716c"/>
      <path d="M2,62 H63 V1 H62 V61 H2 Z" fill="#09090b"/>

      <!-- Aguadas de volumen Tanboku y grietas de pincel seco (Kasure) -->
      <g fill="#292524">
        <rect x="8" y="8" width="48" height="48"/>
      </g>
      <g fill="#09090b">
        <path d="M4,18 H7 V20 H6 V24 H9 V27 H8 V25 H5 V20 H4 Z"/>
        <path d="M60,39 H57 V41 H58 V45 H54 V48 H56 V46 H59 V41 H60 Z"/>
        <rect x="26" y="3" width="1" height="4"/><rect x="27" y="5" width="1" height="3"/>
      </g>
      <g fill="#52525b">
        <rect x="7" y="19" width="1" height="1"/><rect x="9" y="26" width="1" height="1"/>
        <rect x="56" y="40" width="1" height="1"/><rect x="53" y="47" width="1" height="1"/>
      </g>

      <!-- Esquineros de forja Kanagu negro carbón -->
      <g fill="#18181b">
        <path d="M3,3 H15 V7 H7 V15 H3 Z"/>
        <path d="M49,3 H61 V15 H57 V7 H49 Z"/>
        <path d="M3,49 H7 V57 H15 V61 H3 Z"/>
        <path d="M57,49 H61 V61 H49 V57 H57 Z"/>
      </g>
      <!-- Remaches de forja dorados -->
      <g fill="#ca8a04">
        <rect x="5" y="5" width="2" height="2"/><rect x="12" y="5" width="2" height="1"/><rect x="5" y="12" width="1" height="2"/>
        <rect x="57" y="5" width="2" height="2"/><rect x="50" y="5" width="2" height="1"/><rect x="58" y="12" width="1" height="2"/>
        <rect x="5" y="57" width="2" height="2"/><rect x="12" y="58" width="2" height="1"/><rect x="5" y="50" width="1" height="2"/>
        <rect x="57" y="57" width="2" height="2"/><rect x="50" y="58" width="2" height="1"/><rect x="58" y="50" width="1" height="2"/>
      </g>
      <g fill="#fef08a">
        <rect x="5" y="5" width="1" height="1"/>
        <rect x="57" y="5" width="1" height="1"/>
        <rect x="5" y="57" width="1" height="1"/>
        <rect x="57" y="57" width="1" height="1"/>
      </g>

      <!-- Placa octogonal central rehundida para la runa -->
      <polygon points="20,10 44,10 54,20 54,44 44,54 20,54 10,44 10,20" fill="#18181b"/>
      <polygon points="21,12 43,12 52,21 52,43 43,52 21,52 12,43 12,21" fill="#292524"/>

      <!-- Bisel interior del foso central -->
      <path d="M12,12 H52 V13 H13 V52 H12 Z" fill="#09090b"/>
      <path d="M13,52 H53 V12 H52 V51 H13 Z" fill="#52525b" opacity="0.6"/>
    </svg>
  `;

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  if (typeof Image !== 'undefined') {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      texture.needsUpdate = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  }

  return texture;
}

/**
 * Crea los materiales de cantería, forja y runas emisivas para la losa de presión
 * armonizados con la paleta Sumi-e Zen y texturas Pixel Art.
 */
export function createPressurePlateMaterials(stoneTexture = null) {
  const tex = stoneTexture || createPressurePlateTexture(128, 128);

  return {
    frameStone: new THREE.MeshLambertMaterial({ color: 0x1c1917 }), // Zócalo perimetral de basalto Sumi-e oscuro
    plateStone: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: tex, // Textura Sumi-e Pixel Art con bisel y herrajes
    }),
    ironTrim: new THREE.MeshLambertMaterial({ color: 0x18181b }),   // Esquineros de hierro forjado Kanagu
    brassRivet: new THREE.MeshLambertMaterial({
      color: 0xca8a04,
      emissive: 0x78350f,
      emissiveIntensity: 0.4,
    }),
    runeInactive: new THREE.MeshLambertMaterial({
      color: 0xd97706,
      emissive: 0x78350f,
      emissiveIntensity: 0.7,
    }),
    runeActive: new THREE.MeshLambertMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
    }),
    runeCloseInactive: new THREE.MeshLambertMaterial({
      color: 0xef4444,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.7,
    }),
    runeCloseActive: new THREE.MeshLambertMaterial({
      color: 0xf43f5e,
      emissive: 0xbe123c,
      emissiveIntensity: 1.5,
    }),
    runeHoldInactive: new THREE.MeshLambertMaterial({
      color: 0x059669,
      emissive: 0x064e3b,
      emissiveIntensity: 0.7,
    }),
    runeHoldActive: new THREE.MeshLambertMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 1.6,
    }),
  };
}

/**
 * Geometrías modulares compartidas para la losa de presión y sus herrajes.
 */
export function createPressurePlateGeometries() {
  return {
    frameGeo: new THREE.BoxGeometry(1.18, 0.04, 1.18),
    plateGeo: new THREE.BoxGeometry(0.92, 0.06, 0.92),
    runeGeo: new THREE.CylinderGeometry(0.24, 0.24, 0.015, 16),
    runeHoldRingGeo: new THREE.RingGeometry(0.27, 0.33, 16),
    cornersGeo: new THREE.BoxGeometry(0.14, 0.07, 0.14),
    rivetGeo: new THREE.CylinderGeometry(0.018, 0.018, 0.015, 6),
  };
}

/**
 * Ensambla la jerarquía 3D de la losa de presión con base fija, pivote móvil y runa de activación.
 *
 * @param {object} geos - Geometrías compartidas
 * @param {object} mats - Materiales compartidos
 * @param {object} [options] - Configuración de la losa (ej. action, mode)
 * @returns {{ root: THREE.Group, platePivot: THREE.Object3D, plateMesh: THREE.Mesh, runeMesh: THREE.Mesh, light: THREE.PointLight }}
 */
export function buildPressurePlateMesh(geos, mats, options = {}) {
  const root = new THREE.Group();
  const isCloseAction = options.action === 'close_door';
  const isHoldMode = options.mode === 'hold';

  // 1. Marco perimetral fijo exterior encastrado al ras del suelo
  const frameMesh = new THREE.Mesh(geos.frameGeo, mats.frameStone);
  frameMesh.position.y = 0.02;
  root.add(frameMesh);

  // 2. Cuatro esquineros de hierro forjado reforzado tipo Kanagu con remaches dorados
  const corners = [
    [-0.48, 0.48], [0.48, 0.48],
    [-0.48, -0.48], [0.48, -0.48],
  ];
  for (const [cx, cz] of corners) {
    const cMesh = new THREE.Mesh(geos.cornersGeo, mats.ironTrim);
    cMesh.position.set(cx, 0.035, cz);
    root.add(cMesh);

    if (geos.rivetGeo && mats.brassRivet) {
      const rMesh = new THREE.Mesh(geos.rivetGeo, mats.brassRivet);
      rMesh.position.set(cx, 0.075, cz);
      root.add(rMesh);
    }
  }

  // 3. Pivote de descenso amortiguado para la placa móvil
  const platePivot = new THREE.Object3D();
  platePivot.position.y = 0;
  root.add(platePivot);

  // 4. Placa central de piedra de cantería con textura Sumi-e Pixel Art
  const plateMesh = new THREE.Mesh(geos.plateGeo, mats.plateStone);
  plateMesh.position.y = 0.04;
  platePivot.add(plateMesh);

  // 5. Disco rúnico central en relieve con color temático según su función
  let runeMat = mats.runeInactive;
  if (isHoldMode) {
    runeMat = mats.runeHoldInactive;
  } else if (isCloseAction) {
    runeMat = mats.runeCloseInactive;
  }
  const runeMesh = new THREE.Mesh(geos.runeGeo, runeMat);
  runeMesh.position.y = 0.072;
  platePivot.add(runeMesh);

  // Anillo concéntrico de forja rúnica exclusivo para losas de presencia continua (Hold)
  if (isHoldMode && geos.runeHoldRingGeo) {
    const ringMesh = new THREE.Mesh(geos.runeHoldRingGeo, mats.ironTrim);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.073;
    platePivot.add(ringMesh);
  }

  // 6. Luz rúnica puntual sutil
  let lightColor = 0xf59e0b;
  if (isHoldMode) {
    lightColor = 0x10b981;
  } else if (isCloseAction) {
    lightColor = 0xef4444;
  }
  const light = new THREE.PointLight(lightColor, 0.5, 2.2);
  light.position.set(0, 0.25, 0);
  root.add(light);

  return { root, platePivot, plateMesh, runeMesh, light };
}
