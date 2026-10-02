// src/render/models/props/stairsModel.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createWoodPlankTexture } from './doorModel.js';

export const SHAKE_TIME = 0.5;
export const SLIDE_TIME = 1.4;
export const SLIDE_DIST = 2.6;
export const FOG_COUNT = 24;

/**
 * Crea los materiales para la losa y escalinata de descenso.
 * Integra la textura de madera de roble noble estilo puerta para la losa.
 */
export function createStairsMaterials(woodTexture = null) {
  const tex = woodTexture || createWoodPlankTexture(256, 512);
  return {
    wood: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: tex,
    }),
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
 * Incorpora el estilo de tablones de roble macizo de las puertas con herrajes de forja.
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

  // --- Losa corrediza sellada con estilo de madera de las puertas y herrajes de forja ---
  const slab = new THREE.Group();

  // 1. Zócalo perimetral inferior de piedra oscura
  const stoneBase = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.22, 0.06, d + 0.22),
    mats.stoneDark
  );
  stoneBase.position.y = 0.03;
  slab.add(stoneBase);

  // 2. Tablones de roble noble (textura y estilo compartido con las puertas)
  const slabWood = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.16, 0.08, d + 0.16),
    mats.wood || mats.stoneDark
  );
  slabWood.position.y = 0.09;
  slab.add(slabWood);

  // 3. Herrajes de forja: marco perimetral protector, bandas transversales y anillas de tiro
  const ironGeos = [];

  // Marco perimetral que abraza el canto de la madera
  const rimT = 0.03;
  const rimH = 0.09;
  ironGeos.push(new THREE.BoxGeometry(w + 0.18, rimH, rimT).translate(0, 0.092, (d + 0.16) / 2));
  ironGeos.push(new THREE.BoxGeometry(w + 0.18, rimH, rimT).translate(0, 0.092, -(d + 0.16) / 2));
  ironGeos.push(new THREE.BoxGeometry(rimT, rimH, d + 0.16 - rimT * 2).translate((w + 0.16) / 2, 0.092, 0));
  ironGeos.push(new THREE.BoxGeometry(rimT, rimH, d + 0.16 - rimT * 2).translate(-(w + 0.16) / 2, 0.092, 0));

  // Bandas transversales de forja sobre la madera
  for (let i = 0; i < d; i++) {
    const zoff = -d / 2 + 0.5 + i * 1.0;
    ironGeos.push(new THREE.BoxGeometry(w + 0.14, 0.02, 0.10).translate(0, 0.14, zoff));
    // Remaches de forja
    ironGeos.push(new THREE.CylinderGeometry(0.014, 0.014, 0.016, 6).translate(-w / 2, 0.15, zoff));
    ironGeos.push(new THREE.CylinderGeometry(0.014, 0.014, 0.016, 6).translate(w / 2, 0.15, zoff));
  }

  // Anillas de tiro de forja (tiradores medievales de trampilla)
  const ring1 = new THREE.TorusGeometry(0.055, 0.012, 6, 12).rotateX(Math.PI / 2).translate(-0.45, 0.155, 0);
  const ring2 = new THREE.TorusGeometry(0.055, 0.012, 6, 12).rotateX(Math.PI / 2).translate(0.45, 0.155, 0);
  const mount1 = new THREE.BoxGeometry(0.06, 0.025, 0.06).translate(-0.45, 0.145, 0);
  const mount2 = new THREE.BoxGeometry(0.06, 0.025, 0.06).translate(0.45, 0.145, 0);
  ironGeos.push(ring1, ring2, mount1, mount2);

  const bands = new THREE.Mesh(mergeGeometries(ironGeos), mats.iron);
  ironGeos.forEach(g => g.dispose());
  slab.add(bands);

  // 4. Runas arcanas doradas que sellan el paso a la siguiente mazmorra
  const runeGeos = [];
  for (let i = 0; i < 2; i++) {
    const zoff = -d / 2 + 1.0 + i * 1.0;
    runeGeos.push(new THREE.BoxGeometry(0.10, 0.015, 0.45).translate(-0.5, 0.155, zoff));
    runeGeos.push(new THREE.BoxGeometry(0.10, 0.015, 0.45).translate(0.5, 0.155, zoff));
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
