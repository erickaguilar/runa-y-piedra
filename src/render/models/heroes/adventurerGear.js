// src/render/models/heroes/adventurerGear.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  createHeroFaceMaterial,
  createHeroHeadSideMaterial,
  createHeroHeadBackMaterial,
  createHeroChestMaterial,
} from '../../../heroes/heroPortraits.js';

let _advGeoCache = null;
let _advMatCache = null;

function getAdventurerGeoCache() {
  if (_advGeoCache) return _advGeoCache;

  const strapBase = new THREE.BoxGeometry(0.04, 0.44, 0.04);
  const sL = strapBase.clone().rotateX(0.15).translate(-0.14, 1.15, -0.18);
  const sR = strapBase.clone().rotateX(0.15).translate(0.14, 1.15, -0.18);
  const packStrapsGeo = mergeGeometries([sL, sR], false);
  strapBase.dispose();
  sL.dispose();
  sR.dispose();

  const pouchBase = new THREE.BoxGeometry(0.10, 0.12, 0.08);
  const pL = pouchBase.clone().translate(-0.20, 0.76, 0.14);
  const pR = pouchBase.clone().translate(0.20, 0.76, 0.14);
  const pouchesGeo = mergeGeometries([pL, pR], false);
  pouchBase.dispose();
  pL.dispose();
  pR.dispose();

  const hairCap = new THREE.BoxGeometry(0.42, 0.14, 0.42).translate(0, 1.82, 0);
  const hairTuft = new THREE.BoxGeometry(0.10, 0.06, 0.10).translate(0.06, 1.86, 0.18);
  const hairGeo = mergeGeometries([hairCap, hairTuft], false);
  hairCap.dispose();
  hairTuft.dispose();

  _advGeoCache = {
    hood: new THREE.BoxGeometry(0.60, 0.14, 0.40),
    scarf: new THREE.BoxGeometry(0.24, 0.10, 0.24),
    packBody: new THREE.BoxGeometry(0.30, 0.34, 0.14),
    packStrapsGeo,
    pouchesGeo,
    boot: new THREE.BoxGeometry(0.20, 0.22, 0.20),
    compass: new THREE.BoxGeometry(0.07, 0.07, 0.02),
    hairGeo,
  };
  for (const g of Object.values(_advGeoCache)) {
    g.userData = { isShared: true, heroId: 'adventurer' };
  }
  return _advGeoCache;
}

function getAdventurerMatCache() {
  if (_advMatCache) return _advMatCache;
  _advMatCache = {
    leatherMat: new THREE.MeshLambertMaterial({ color: 0x6b4423 }),
    leatherDarkMat: new THREE.MeshLambertMaterial({ color: 0x4a2e18 }),
    clothMat: new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
    brassMat: new THREE.MeshLambertMaterial({ color: 0xc9a227, emissive: 0x3d2b05, emissiveIntensity: 0.35 }),
    bootsMat: new THREE.MeshLambertMaterial({ color: 0x3d2817 }),
    hairMat: new THREE.MeshLambertMaterial({ color: 0x4a2e18 }),
  };
  for (const m of Object.values(_advMatCache)) {
    m.userData = { isShared: true, heroId: 'adventurer' };
  }
  return _advMatCache;
}

export function disposeAdventurerGearCache() {
  if (_advGeoCache) {
    for (const g of Object.values(_advGeoCache)) g.dispose?.();
    _advGeoCache = null;
  }
  if (_advMatCache) {
    for (const m of Object.values(_advMatCache)) m.dispose?.();
    _advMatCache = null;
  }
}

/**
 * Kit del Aventurero (adventurer): arquetipo de explorador versátil.
 * Incluye capucha sobre los hombros, bufanda de cuello, mochila de viaje con correas,
 * bolsas utilitarias en el cinto, brújula dorada en el pecho y botas de cuero
 * emparentadas a los pivotes de las piernas para animación de marcha síncrona.
 * 
 * @param {object} a - Entidad del avatar (con parts, gear, mesh).
 * @param {object} G - Caché de geometrías compartidas.
 * @param {function} add - Función para registrar nodos añadidos.
 * @returns {THREE.Material[]} Materiales propios para disponer al cambiar de clase.
 */
export function buildAdventurerGear(a, G, add) {
  const geo = getAdventurerGeoCache();
  const { leatherMat, leatherDarkMat, clothMat, brassMat, bootsMat, hairMat } = getAdventurerMatCache();

  // ───── 1. Capucha sobre los hombros ─────
  const hood = new THREE.Mesh(geo.hood, clothMat);
  hood.position.set(0, 1.40, -0.02);
  add(hood, a.gear);

  // ───── 2. Bufanda/pañuelo al cuello ─────
  const scarf = new THREE.Mesh(geo.scarf, leatherMat);
  scarf.position.set(0, 1.36, 0);
  add(scarf, a.gear);

  // ───── 3. Mochila pequeña (visible desde atrás) con correas al frente ─────
  const pack = new THREE.Group();
  const packBody = new THREE.Mesh(geo.packBody, leatherMat);
  packBody.position.set(0, 1.15, -0.24);
  pack.add(packBody);

  const straps = new THREE.Mesh(geo.packStrapsGeo, leatherDarkMat);
  pack.add(straps);

  add(pack, a.gear);

  // ───── 4. Bolsas en el cinturón (fusionadas en una sola draw call) ─────
  const pouches = new THREE.Mesh(geo.pouchesGeo, leatherMat);
  add(pouches, a.gear);

  // ───── 5. Botas emparentadas a los pivotes de las piernas (animación de marcha sincronizada) ─────
  if (a.parts?.legLPivot) {
    const bootL = new THREE.Mesh(geo.boot, bootsMat);
    bootL.position.set(0, -0.69, 0);
    add(bootL, a.parts.legLPivot);
  }

  if (a.parts?.legRPivot) {
    const bootR = new THREE.Mesh(geo.boot, bootsMat);
    bootR.position.set(0, -0.69, 0);
    add(bootR, a.parts.legRPivot);
  }

  // ───── 6. Brújula dorada en el pecho (micro-cubo en relieve) ─────
  const compass = new THREE.Mesh(geo.compass, brassMat);
  compass.position.set(0, 1.20, 0.17);
  add(compass, a.gear);

  // ───── 7. Cabello de Aventurero (casquete castaño + mechón fusionados) ─────
  const hair = new THREE.Mesh(geo.hairGeo, hairMat);
  add(hair, a.gear);

  // Aplicar texturas Sumi-e de cabeza (360°) y torso propia del Aventurero
  let faceMat = null;
  let sideRightMat = null;
  let sideLeftMat = null;
  let backMat = null;
  if (a.parts?.head && Array.isArray(a.parts.head.material)) {
    faceMat = createHeroFaceMaterial('adventurer');
    sideRightMat = createHeroHeadSideMaterial('adventurer', 'R');
    sideLeftMat = createHeroHeadSideMaterial('adventurer', 'L');
    backMat = createHeroHeadBackMaterial('adventurer');
    if (sideRightMat) a.parts.head.material[0] = sideRightMat;
    if (sideLeftMat) a.parts.head.material[1] = sideLeftMat;
    if (faceMat) a.parts.head.material[4] = faceMat;
    if (backMat) a.parts.head.material[5] = backMat;
  }

  let chestMat = null;
  if (a.parts?.torso) {
    if (!a._origTorsoMat) a._origTorsoMat = a.parts.torso.material;
    const baseMat = Array.isArray(a._origTorsoMat) ? a._origTorsoMat[0] : (a._origTorsoMat || a.parts.torso.material);
    chestMat = createHeroChestMaterial('adventurer');
    if (chestMat) {
      a.parts.torso.material = [baseMat, baseMat, baseMat, baseMat, chestMat, baseMat];
    }
  }

  if (a.parts) {
    a.parts.emissiveMats = [{ mat: brassMat, base: 0.35, amp: 0.18 }];
  }

  const mats = [leatherMat, leatherDarkMat, clothMat, brassMat, bootsMat, hairMat];
  if (faceMat) mats.push(faceMat);
  if (sideRightMat) mats.push(sideRightMat);
  if (sideLeftMat) mats.push(sideLeftMat);
  if (backMat) mats.push(backMat);
  if (chestMat) mats.push(chestMat);
  return mats;
}
