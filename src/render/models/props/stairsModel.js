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
/**
 * Crea los materiales para la losa y escalinata de descenso según el tema del capítulo.
 * Soporta tema 'classic' (Capítulo 1: Oro/Fuego) y tema 'abyss' (Capítulo 2: Amatista/Sombras).
 */
export function createStairsMaterials(woodTexture = null, theme = 'classic') {
  const tex = woodTexture || createWoodPlankTexture(256, 512);
  const isAbyss = theme === 'abyss' || theme === 'shadow';
  const isFalls = theme === 'falls' || theme === 'subterranean_falls';

  let stoneColor = isAbyss ? 0x334155 : 0x475569;
  let stoneDarkColor = isAbyss ? 0x0f172a : 0x1e293b;
  let ironColor = isAbyss ? 0x1e293b : 0x27272a;
  let goldColor = isAbyss ? 0xc084fc : 0xf59e0b;
  let emissiveColor = isAbyss ? 0x4c1d95 : 0x78350f;
  let fogColor = isAbyss ? 0x818cf8 : 0x94a3b8;
  let lightColor = isAbyss ? 0x8b5cf6 : 0xea580c;

  if (isFalls) {
    stoneColor = 0x64748b;
    stoneDarkColor = 0x334155;
    ironColor = 0x1e293b;
    goldColor = 0x38bdf8;
    emissiveColor = 0x0369a1;
    fogColor = 0x7dd3fc;
    lightColor = 0x0284c7;
  }

  return {
    theme,
    lightColor,
    wood: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: tex,
    }),
    stone: new THREE.MeshLambertMaterial({ color: stoneColor }),
    stoneDark: new THREE.MeshLambertMaterial({ color: stoneDarkColor }),
    iron: new THREE.MeshLambertMaterial({ color: ironColor }),
    gold: new THREE.MeshLambertMaterial({ color: goldColor, emissive: emissiveColor }),
    black: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    fog: new THREE.PointsMaterial({
      color: fogColor, size: isAbyss ? 0.18 : 0.16, transparent: true, opacity: 0,
      depthWrite: false, sizeAttenuation: true,
    }),
  };
}

/**
 * Ensambla el modelo de la escalinata: brocal fijo de cantería con rieles de guía (Marco 3D),
 * losa corrediza con herrajes de roble, runas arcanas y pozo iluminado con niebla volumétrica.
 * @param {{x1: number, x2: number, z1: number, z2: number}} rect - Dimensiones de la fosa.
 * @param {object} mats - Materiales de la escalinata.
 * @param {string} theme - Tema visual ('classic' o 'abyss').
 */
export function buildStairsMesh(rect, mats, theme = 'classic') {
  const cx = (rect.x1 + rect.x2 + 1) / 2; // centro X del hueco
  const cz = (rect.z1 + rect.z2 + 1) / 2; // centro Z del hueco
  const w = rect.x2 - rect.x1 + 1; // ancho (X)
  const d = rect.z2 - rect.z1 + 1; // profundidad (Z)

  const root = new THREE.Group();
  root.position.set(cx, 1.0, cz); // sobre el suelo (y=1.0)

  // =========================================================================
  // 1. Brocal Perimetral Fijo de Cantería con Rieles de Deslizamiento (Marco 3D)
  // =========================================================================
  const frame = new THREE.Group();
  frame.name = 'StairsStoneFrame';

  const frameStoneGeos = [];
  const frameStoneDarkGeos = [];
  const frameIronGeos = [];
  const frameRuneGeos = [];

  const railLen = w + SLIDE_DIST + 0.35;
  const railCenterX = (SLIDE_DIST) / 2 - 0.05;
  const curbNZ = -(d + 0.16) / 2 - 0.10;
  const curbSZ = (d + 0.16) / 2 + 0.10;
  const curbW = 0.18;
  const curbH = 0.07;
  const backX = -(w + 0.16) / 2 - 0.10;

  // Bordillos longitudinales guía (norte y sur)
  frameStoneGeos.push(new THREE.BoxGeometry(railLen, curbH, curbW).translate(railCenterX, curbH / 2, curbNZ));
  frameStoneGeos.push(new THREE.BoxGeometry(railLen, curbH, curbW).translate(railCenterX, curbH / 2, curbSZ));

  // Rieles de deslizamiento de hierro forjado sobre los bordillos
  frameIronGeos.push(new THREE.BoxGeometry(railLen, 0.02, 0.06).translate(railCenterX, curbH + 0.01, curbNZ + 0.04));
  frameIronGeos.push(new THREE.BoxGeometry(railLen, 0.02, 0.06).translate(railCenterX, curbH + 0.01, curbSZ - 0.04));

  // Remaches de forja a lo largo de los rieles
  for (let i = 0; i <= 4; i++) {
    const rx = backX + 0.3 + i * 1.0;
    frameIronGeos.push(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 6).translate(rx, curbH + 0.02, curbNZ + 0.04));
    frameIronGeos.push(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 6).translate(rx, curbH + 0.02, curbSZ - 0.04));
  }

  // Tope posterior de cantería maciza (en -X) que sella el extremo cerrado
  frameStoneDarkGeos.push(new THREE.BoxGeometry(0.18, 0.09, d + 0.38).translate(backX, 0.045, 0));
  frameIronGeos.push(new THREE.BoxGeometry(0.08, 0.02, d + 0.34).translate(backX, 0.095, 0));

  // Cantoneras esquineras y placas de advertencia rúnica en los 4 vértices
  const corners = [
    { x: backX, z: curbNZ },
    { x: backX, z: curbSZ },
    { x: (w / 2) + 0.08, z: curbNZ },
    { x: (w / 2) + 0.08, z: curbSZ },
  ];
  for (const c of corners) {
    frameStoneDarkGeos.push(new THREE.BoxGeometry(0.18, 0.085, 0.18).translate(c.x, 0.0425, c.z));
    frameRuneGeos.push(new THREE.BoxGeometry(0.12, 0.015, 0.12).translate(c.x, 0.088, c.z));
  }

  // Topes amortiguadores de fin de carrera al extremo +X
  const frontStopX = backX + railLen - 0.09;
  frameStoneDarkGeos.push(new THREE.BoxGeometry(0.14, 0.09, 0.18).translate(frontStopX, 0.045, curbNZ));
  frameStoneDarkGeos.push(new THREE.BoxGeometry(0.14, 0.09, 0.18).translate(frontStopX, 0.045, curbSZ));
  frameIronGeos.push(new THREE.BoxGeometry(0.04, 0.04, 0.08).translate(frontStopX - 0.06, 0.06, curbNZ));
  frameIronGeos.push(new THREE.BoxGeometry(0.04, 0.04, 0.08).translate(frontStopX - 0.06, 0.06, curbSZ));

  if (frameStoneGeos.length) {
    const m = new THREE.Mesh(mergeGeometries(frameStoneGeos), mats.stone);
    frameStoneGeos.forEach(g => g.dispose());
    frame.add(m);
  }
  if (frameStoneDarkGeos.length) {
    const m = new THREE.Mesh(mergeGeometries(frameStoneDarkGeos), mats.stoneDark);
    frameStoneDarkGeos.forEach(g => g.dispose());
    frame.add(m);
  }
  if (frameIronGeos.length) {
    const m = new THREE.Mesh(mergeGeometries(frameIronGeos), mats.iron);
    frameIronGeos.forEach(g => g.dispose());
    frame.add(m);
  }
  if (frameRuneGeos.length) {
    const m = new THREE.Mesh(mergeGeometries(frameRuneGeos), mats.gold);
    frameRuneGeos.forEach(g => g.dispose());
    frame.add(m);
  }
  root.add(frame);

  // =========================================================================
  // 2. Losa corrediza sellada con estilo de madera de las puertas y herrajes
  // =========================================================================
  const slab = new THREE.Group();

  // Zócalo perimetral inferior de piedra oscura
  const stoneBase = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.22, 0.06, d + 0.22),
    mats.stoneDark
  );
  stoneBase.position.y = 0.03;
  slab.add(stoneBase);

  // Tablones de roble noble (textura y estilo compartido con las puertas)
  const slabWood = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.16, 0.08, d + 0.16),
    mats.wood || mats.stoneDark
  );
  slabWood.position.y = 0.09;
  slab.add(slabWood);

  // Herrajes de forja: marco perimetral protector, bandas transversales y anillas de tiro
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

  // Runas arcanas temáticas que sellan el paso
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

  // =========================================================================
  // 3. Iluminación y niebla abisal adaptativa según capítulo
  // =========================================================================
  const chosenLightColor = mats.lightColor || ((theme === 'abyss' || theme === 'shadow') ? 0x8b5cf6 : 0xea580c);
  const pitLight = new THREE.PointLight(chosenLightColor, 0, 7, 2.0);
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

  return { root, slab, frame, pitLight, fog };
}
