// src/render/models/heroes/adventurerGear.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  createHeroFaceMaterial,
  createHeroHeadSideMaterial,
  createHeroHeadBackMaterial,
  createHeroChestMaterial,
  createHeroTorsoSideMaterial,
  createHeroTorsoBackMaterial,
  createHeroArmFrontMaterial,
  createHeroArmSideMaterial,
  createHeroArmInnerMaterial,
  createHeroArmBackMaterial,
  createHeroLegFrontMaterial,
  createHeroLegSideMaterial,
  createHeroLegInnerMaterial,
  createHeroLegBackMaterial,
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
  let torsoSideRightMat = null;
  let torsoSideLeftMat = null;
  let torsoBackMat = null;
  if (a.parts?.torso) {
    if (!a._origTorsoMat) a._origTorsoMat = a.parts.torso.material;
    const baseMat = Array.isArray(a._origTorsoMat) ? a._origTorsoMat[0] : (a._origTorsoMat || a.parts.torso.material);
    chestMat = createHeroChestMaterial('adventurer');
    torsoSideRightMat = createHeroTorsoSideMaterial('adventurer', 'R');
    torsoSideLeftMat = createHeroTorsoSideMaterial('adventurer', 'L');
    torsoBackMat = createHeroTorsoBackMaterial('adventurer');
    if (chestMat) {
      a.parts.torso.material = [
        torsoSideRightMat || baseMat,
        torsoSideLeftMat || baseMat,
        baseMat,
        baseMat,
        chestMat,
        torsoBackMat || baseMat,
      ];
    }
  }

  // Aplicar texturas Sumi-e de brazos 360° del Aventurero (frente +Z, exterior, interior, espalda -Z)
  let armFrontMat = null;
  let armSideRMat = null;
  let armSideLMat = null;
  let armInnerRMat = null;
  let armInnerLMat = null;
  let armBackMat = null;
  const armL = a.parts?.armL || (a.parts?.armLPivot?.children?.find((c) => c.geometry === G?.arm));
  const armR = a.parts?.armR || (a.parts?.armRPivot?.children?.find((c) => c.geometry === G?.arm));

  if (armL || armR) {
    armFrontMat = createHeroArmFrontMaterial('adventurer');
    armSideRMat = createHeroArmSideMaterial('adventurer', 'R');
    armSideLMat = createHeroArmSideMaterial('adventurer', 'L');
    armInnerRMat = createHeroArmInnerMaterial('adventurer', 'R');
    armInnerLMat = createHeroArmInnerMaterial('adventurer', 'L');
    armBackMat = createHeroArmBackMaterial('adventurer');

    if (armR) {
      if (!a._origArmRMat) a._origArmRMat = armR.material;
      const baseArmR = Array.isArray(a._origArmRMat) ? a._origArmRMat[0] : (a._origArmRMat || armR.material);
      armR.material = [
        armSideRMat || baseArmR,   // +X (exterior derecho)
        armInnerRMat || baseArmR,  // -X (interior derecho)
        baseArmR,                  // +Y (hombro)
        baseArmR,                  // -Y (muñeca)
        armFrontMat || baseArmR,   // +Z (frente / brazal de cuero con vendas de lino)
        armBackMat || baseArmR,    // -Z (espalda / codera acolchada)
      ];
    }

    if (armL) {
      if (!a._origArmLMat) a._origArmLMat = armL.material;
      const baseArmL = Array.isArray(a._origArmLMat) ? a._origArmLMat[0] : (a._origArmLMat || armL.material);
      armL.material = [
        armInnerLMat || baseArmL,  // +X (interior izquierdo)
        armSideLMat || baseArmL,   // -X (exterior izquierdo)
        baseArmL,                  // +Y (hombro)
        baseArmL,                  // -Y (muñeca)
        armFrontMat || baseArmL,   // +Z (frente / brazal de cuero con vendas de lino)
        armBackMat || baseArmL,    // -Z (espalda / codera acolchada)
      ];
    }
  }

  // Aplicar texturas Sumi-e de piernas 360° del Aventurero (frente +Z, exterior, interior, espalda -Z)
  let legFrontMat = null;
  let legSideRMat = null;
  let legSideLMat = null;
  let legInnerRMat = null;
  let legInnerLMat = null;
  let legBackMat = null;
  const legL = a.parts?.legL || (a.parts?.legLPivot?.children?.find((c) => c.geometry === G?.leg));
  const legR = a.parts?.legR || (a.parts?.legRPivot?.children?.find((c) => c.geometry === G?.leg));

  if (legL || legR) {
    legFrontMat = createHeroLegFrontMaterial('adventurer');
    legSideRMat = createHeroLegSideMaterial('adventurer', 'R');
    legSideLMat = createHeroLegSideMaterial('adventurer', 'L');
    legInnerRMat = createHeroLegInnerMaterial('adventurer', 'R');
    legInnerLMat = createHeroLegInnerMaterial('adventurer', 'L');
    legBackMat = createHeroLegBackMaterial('adventurer');

    if (legR) {
      if (!a._origLegRMat) a._origLegRMat = legR.material;
      const baseLegR = Array.isArray(a._origLegRMat) ? a._origLegRMat[0] : (a._origLegRMat || legR.material);
      legR.material = [
        legSideRMat || baseLegR,   // +X (exterior derecho)
        legInnerRMat || baseLegR,  // -X (interior derecho)
        baseLegR,                  // +Y (cadera)
        baseLegR,                  // -Y (suela)
        legFrontMat || baseLegR,   // +Z (frente / rodillera y polaina)
        legBackMat || baseLegR,    // -Z (espalda / gemelo y correa)
      ];
    }

    if (legL) {
      if (!a._origLegLMat) a._origLegLMat = legL.material;
      const baseLegL = Array.isArray(a._origLegLMat) ? a._origLegLMat[0] : (a._origLegLMat || legL.material);
      legL.material = [
        legInnerLMat || baseLegL,  // +X (interior izquierdo)
        legSideLMat || baseLegL,   // -X (exterior izquierdo)
        baseLegL,                  // +Y (cadera)
        baseLegL,                  // -Y (suela)
        legFrontMat || baseLegL,   // +Z (frente / rodillera y polaina)
        legBackMat || baseLegL,    // -Z (espalda / gemelo y correa)
      ];
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
  if (torsoSideRightMat) mats.push(torsoSideRightMat);
  if (torsoSideLeftMat) mats.push(torsoSideLeftMat);
  if (torsoBackMat) mats.push(torsoBackMat);
  if (armFrontMat) mats.push(armFrontMat);
  if (armSideRMat) mats.push(armSideRMat);
  if (armSideLMat) mats.push(armSideLMat);
  if (armInnerRMat) mats.push(armInnerRMat);
  if (armInnerLMat) mats.push(armInnerLMat);
  if (armBackMat) mats.push(armBackMat);
  if (legFrontMat) mats.push(legFrontMat);
  if (legSideRMat) mats.push(legSideRMat);
  if (legSideLMat) mats.push(legSideLMat);
  if (legInnerRMat) mats.push(legInnerRMat);
  if (legInnerLMat) mats.push(legInnerLMat);
  if (legBackMat) mats.push(legBackMat);
  return mats;
}
