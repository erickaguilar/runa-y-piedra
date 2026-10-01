// src/render/models/props/pedestalModel.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const IDLE_LIGHT = 1.4;
export const BLESSED_LIGHT = 2.6;
export const FLASH_LIGHT = 7.0;
export const PARTICLE_COUNT = 36;

export const THEMES = {
  classic: { light: 0xfbbf24, rune: 0xfde68a, crystal: 0xf59e0b, ember: 0xfcd34d },
  inferno: { light: 0xfb9235, rune: 0xfdba74, crystal: 0xea580c, ember: 0xf97316 },
  abyss: { light: 0xa78bfa, rune: 0xddd6fe, crystal: 0x7c3aed, ember: 0x8b5cf6 },
  cartography: { light: 0x38bdf8, rune: 0xbae6fd, crystal: 0x0284c7, ember: 0x38bdf8 },
};

/**
 * Crea los materiales para el pedestal y orbe místico según el tema de la mazmorra.
 */
export function createPedestalMaterials(themeName = 'classic') {
  const t = THEMES[themeName] || THEMES.classic;
  return {
    theme: themeName,
    stone: new THREE.MeshLambertMaterial({ color: 0x475569 }), // Sillar pizarra (muros)
    stoneDark: new THREE.MeshLambertMaterial({ color: 0x1e293b }), // Zócalo profundo
    iron: new THREE.MeshLambertMaterial({ color: 0x27272a }), // Forja (cofres/puertas)
    gold: new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f }),
    rune: new THREE.MeshBasicMaterial({ color: t.rune, transparent: true, opacity: 0.95 }),
    crystal: new THREE.MeshLambertMaterial({
      color: 0xffffff, emissive: t.crystal, emissiveIntensity: 0.9, transparent: true, opacity: 0.96,
    }),
    ember: new THREE.PointsMaterial({
      color: t.ember, size: 0.055, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }),
  };
}

/**
 * Crea las geometrías de cantería, collar, runas solares y cristal octaédrico.
 */
export function createPedestalGeometries() {
  // Zócalo escalonado de cantería (2 peldaños)
  const plinth1 = new THREE.BoxGeometry(1.0, 0.18, 1.0).translate(0, 0.09, 0);
  const plinth2 = new THREE.BoxGeometry(0.8, 0.16, 0.8).translate(0, 0.26, 0);
  const stoneBase = mergeGeometries([plinth1, plinth2]);
  plinth1.dispose(); plinth2.dispose();

  // Fuste monolítico de 4 caras
  const column = new THREE.CylinderGeometry(0.30, 0.38, 0.86, 4, 1);
  column.rotateY(Math.PI / 4);
  column.translate(0, 0.77, 0);

  // Collar de forja + losa de coronación + filete dorado
  const collar = new THREE.BoxGeometry(0.62, 0.10, 0.62).translate(0, 1.25, 0);
  const cap = new THREE.BoxGeometry(0.78, 0.12, 0.78).translate(0, 1.36, 0);
  const trimN = new THREE.BoxGeometry(0.80, 0.035, 0.05).translate(0, 1.425, 0.375);
  const trimS = new THREE.BoxGeometry(0.80, 0.035, 0.05).translate(0, 1.425, -0.375);
  const trimE = new THREE.BoxGeometry(0.05, 0.035, 0.80).translate(0.375, 1.425, 0);
  const trimW = new THREE.BoxGeometry(0.05, 0.035, 0.80).translate(-0.375, 1.425, 0);
  const goldTrim = mergeGeometries([trimN, trimS, trimE, trimW]);
  trimN.dispose(); trimS.dispose(); trimE.dispose(); trimW.dispose();

  // Runa solar: disco + anillo (giran en sentidos opuestos)
  const runeDisc = new THREE.CircleGeometry(0.24, 24);
  runeDisc.rotateX(-Math.PI / 2);
  runeDisc.translate(0, 1.445, 0);
  const runeRing = new THREE.RingGeometry(0.27, 0.33, 24);
  runeRing.rotateX(-Math.PI / 2);
  runeRing.translate(0, 1.445, 0);

  // Cristal rúnico flotante (octaedro)
  const crystal = new THREE.OctahedronGeometry(0.14, 0);
  crystal.translate(0, 1.95, 0);

  return { stoneBase, column, collar, cap, goldTrim, runeDisc, runeRing, crystal };
}

/**
 * Ensambla el modelo completo del altar ceremonial, sus runas y sistema de partículas.
 */
export function buildPedestalMesh(geos, mats) {
  const root = new THREE.Group();

  const baseMesh = new THREE.Mesh(geos.stoneBase, mats.stoneDark);
  const columnMesh = new THREE.Mesh(geos.column, mats.stone);
  const collarMesh = new THREE.Mesh(geos.collar, mats.iron);
  const capMesh = new THREE.Mesh(geos.cap, mats.stone);
  const trimMesh = new THREE.Mesh(geos.goldTrim, mats.gold);
  root.add(baseMesh, columnMesh, collarMesh, capMesh, trimMesh);

  // Runa giratoria sobre la losa
  const runePivot = new THREE.Group();
  runePivot.position.set(0, 0, 0);
  const runeMesh = new THREE.Mesh(geos.runeDisc, mats.rune);
  const ringMesh = new THREE.Mesh(geos.runeRing, mats.gold);
  runePivot.add(runeMesh, ringMesh);
  root.add(runePivot);

  // Cristal flotante
  const crystalMesh = new THREE.Mesh(geos.crystal, mats.crystal);
  root.add(crystalMesh);

  // Luz cálida del altar
  const light = new THREE.PointLight(mats.rune.color, IDLE_LIGHT, 9, 2.0);
  light.position.set(0, 2.1, 0);
  root.add(light);

  // Brasas ascendentes
  const emberPos = new Float32Array(PARTICLE_COUNT * 3);
  const emberSpeed = new Float32Array(PARTICLE_COUNT);
  for (let k = 0; k < PARTICLE_COUNT; k++) {
    const r = 0.15 + Math.random() * 0.45;
    const a = Math.random() * Math.PI * 2;
    emberPos[k * 3] = Math.cos(a) * r;
    emberPos[k * 3 + 1] = Math.random() * 2.2;
    emberPos[k * 3 + 2] = Math.sin(a) * r;
    emberSpeed[k] = 0.25 + Math.random() * 0.35;
  }
  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  const embers = new THREE.Points(emberGeo, mats.ember);
  root.add(embers);

  return {
    root,
    runePivot,
    runeMesh,
    ringMesh,
    crystalMesh,
    light,
    embers,
    emberPos,
    emberSpeed,
  };
}
