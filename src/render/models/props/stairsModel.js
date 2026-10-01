// src/render/models/props/stairsModel.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const SHAKE_TIME = 0.5;
export const SLIDE_TIME = 1.4;
export const SLIDE_DIST = 2.6;
export const FOG_COUNT = 24;

/**
 * Crea los materiales para la losa y escalinata de descenso.
 */
export function createStairsMaterials() {
  return {
    stone: new THREE.MeshLambertMaterial({ color: 0x475569 }),
    stoneDark: new THREE.MeshLambertMaterial({ color: 0x1e293b }),
    iron: new THREE.MeshLambertMaterial({ color: 0x27272a }),
    gold: new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f }),
    black: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    fog: new THREE.PointsMaterial({
      color: 0x94a3b8, size: 0.16, transparent: true, opacity: 0,
      depthWrite: false, sizeAttenuation: true,
    }),
  };
}

/**
 * Ensambla el modelo de la losa de cierre corrediza, bandas de forja, runas y niebla.
 * @param {{x1: number, x2: number, z1: number, z2: number}} rect - Dimensiones de la fosa.
 * @param {object} mats - Materiales de la escalinata.
 */
export function buildStairsMesh(rect, mats) {
  const cx = (rect.x1 + rect.x2 + 1) / 2; // centro X del hueco
  const cz = (rect.z1 + rect.z2 + 1) / 2; // centro Z del hueco
  const w = rect.x2 - rect.x1 + 1; // ancho
  const d = rect.z2 - rect.z1 + 1; // profundidad

  const root = new THREE.Group();
  root.position.set(cx, 1.0, cz); // sobre el suelo (y=1.0)

  // --- Losa sellada (2x3) con bandas de forja y runas doradas ---
  const slab = new THREE.Group();
  const slabBase = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.14, d + 0.2), mats.stoneDark);
  slabBase.position.y = 0.07;
  slab.add(slabBase);

  const bandGeos = [];
  for (let i = 0; i < d; i++) {
    const zoff = -d / 2 + 0.5 + i * 1.0;
    bandGeos.push(new THREE.BoxGeometry(w + 0.24, 0.05, 0.12).translate(0, 0.15, zoff));
  }
  const bands = new THREE.Mesh(mergeGeometries(bandGeos), mats.iron);
  bandGeos.forEach(g => g.dispose());
  slab.add(bands);

  const runeGeos = [];
  for (let i = 0; i < 2; i++) {
    const zoff = -d / 2 + 1.0 + i * 1.0;
    runeGeos.push(new THREE.BoxGeometry(0.12, 0.03, 0.5).translate(-0.5, 0.155, zoff));
    runeGeos.push(new THREE.BoxGeometry(0.12, 0.03, 0.5).translate(0.5, 0.155, zoff));
  }
  const runes = new THREE.Mesh(mergeGeometries(runeGeos), mats.gold);
  runeGeos.forEach(g => g.dispose());
  slab.add(runes);
  root.add(slab);

  // --- Luz brasienta tenue desde el fondo + niebla ascendente ---
  const pitLight = new THREE.PointLight(0xea580c, 0, 7, 2.0);
  pitLight.position.set(0, -4.2, 0);
  root.add(pitLight);

  const fogPos = new Float32Array(FOG_COUNT * 3);
  for (let k = 0; k < FOG_COUNT; k++) {
    fogPos[k * 3] = (Math.random() - 0.5) * (w - 0.4);
    fogPos[k * 3 + 1] = -6.8 + Math.random() * 7.2;
    fogPos[k * 3 + 2] = (Math.random() - 0.5) * (d - 0.4);
  }
  const fogGeo = new THREE.BufferGeometry();
  fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPos, 3));
  const fog = new THREE.Points(fogGeo, mats.fog);
  fog.visible = false;
  root.add(fog);

  return { root, slab, pitLight, fog };
}
