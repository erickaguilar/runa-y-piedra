// src/render/models/heroes/paladinGear.js
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

let _palGeoCache = null;
let _palMatCache = null;

function getPaladinGeoCache() {
  if (_palGeoCache) return _palGeoCache;

  const hTop = new THREE.BoxGeometry(0.44, 0.10, 0.44).translate(0, 0.20, 0);
  const hBack = new THREE.BoxGeometry(0.42, 0.34, 0.06).translate(0, 0.05, -0.19);
  const hSideBase = new THREE.BoxGeometry(0.06, 0.30, 0.38);
  const hSideL = hSideBase.clone().translate(-0.20, 0.06, 0);
  const hSideR = hSideBase.clone().translate(0.20, 0.06, 0);
  const helmSteelGeo = mergeGeometries([hTop, hBack, hSideL, hSideR], false);
  hTop.dispose();
  hBack.dispose();
  hSideBase.dispose();
  hSideL.dispose();
  hSideR.dispose();

  const fH = new THREE.BoxGeometry(0.34, 0.04, 0.07);
  const fTop = fH.clone().translate(0, 0.20, 0);
  const fBot = fH.clone().translate(0, -0.20, 0);
  const fV = new THREE.BoxGeometry(0.04, 0.44, 0.07);
  const fL = fV.clone().translate(-0.15, 0, 0);
  const fR = fV.clone().translate(0.15, 0, 0);
  const boss = new THREE.BoxGeometry(0.10, 0.10, 0.09).translate(0, 0, 0.01);
  const cH = new THREE.BoxGeometry(0.14, 0.03, 0.02).translate(0, -0.08, 0.04);
  const cV = new THREE.BoxGeometry(0.03, 0.14, 0.02).translate(0, -0.08, 0.04);
  const shieldGoldGeo = mergeGeometries([fTop, fBot, fL, fR, boss, cH, cV], false);
  fH.dispose();
  fTop.dispose();
  fBot.dispose();
  fV.dispose();
  fL.dispose();
  fR.dispose();
  boss.dispose();
  cH.dispose();
  cV.dispose();

  _palGeoCache = {
    helmSteelGeo,
    crestBase: new THREE.BoxGeometry(0.08, 0.04, 0.34),
    crest: new THREE.BoxGeometry(0.06, 0.16, 0.32),
    pauldronBody: new THREE.BoxGeometry(0.20, 0.14, 0.26),
    pauldronRim: new THREE.BoxGeometry(0.22, 0.03, 0.28),
    pauldronCap: new THREE.BoxGeometry(0.22, 0.10, 0.28),
    shieldBody: new THREE.BoxGeometry(0.32, 0.42, 0.06),
    shieldGoldGeo,
    chestCrossH: new THREE.BoxGeometry(0.16, 0.04, 0.02),
    chestCrossV: new THREE.BoxGeometry(0.04, 0.16, 0.02),
    buckle: new THREE.BoxGeometry(0.08, 0.06, 0.02),
  };
  for (const g of Object.values(_palGeoCache)) {
    g.userData = { isShared: true, heroId: 'paladin' };
  }
  return _palGeoCache;
}

function getPaladinMatCache() {
  if (_palMatCache) return _palMatCache;
  _palMatCache = {
    steelMat: new THREE.MeshLambertMaterial({ color: 0xb8bcc4 }),
    steelDarkMat: new THREE.MeshLambertMaterial({ color: 0x7a7f88 }),
    goldMat: new THREE.MeshLambertMaterial({ color: 0xd4af37, emissive: 0x473b13, emissiveIntensity: 0.25 }),
    redMat: new THREE.MeshLambertMaterial({ color: 0xa01828 }),
  };
  for (const m of Object.values(_palMatCache)) {
    m.userData = { isShared: true, heroId: 'paladin' };
  }
  return _palMatCache;
}

export function disposePaladinGearCache() {
  if (_palGeoCache) {
    for (const g of Object.values(_palGeoCache)) g.dispose?.();
    _palGeoCache = null;
  }
  if (_palMatCache) {
    for (const m of Object.values(_palMatCache)) m.dispose?.();
    _palMatCache = null;
  }
}

/**
 * Kit del Paladín (paladin): arquetipo de caballero sagrado y vanguardia.
 * Incluye casco envolvente con visor abierto y cresta de pluma roja sobre base dorada,
 * hombreras dobles de acero con ribete, escudo heráldico con umbo y cruz anclado
 * al brazo izquierdo (oscilando en marcha), pechera con cruz dorada y hebilla.
 * 
 * @param {object} a - Entidad del avatar.
 * @param {object} G - Caché de geometrías compartidas.
 * @param {function} add - Función de registro para añadir nodos.
 * @returns {THREE.Material[]} Materiales propios para disponer al cambiar de clase.
 */
export function buildPaladinGear(a, G, add) {
  const geo = getPaladinGeoCache();
  const { steelMat, steelDarkMat, goldMat, redMat } = getPaladinMatCache();

  // ═══════════════════════════════════════════════════════════
  // 1. YELMO — Casco envolvente anclado a la cabeza
  //    Cabeza centrada en y = 1.63, dimensiones 0.40 x 0.40 x 0.40
  // ═══════════════════════════════════════════════════════════
  const helm = new THREE.Group();

  const helmSteel = new THREE.Mesh(geo.helmSteelGeo, steelMat);
  helm.add(helmSteel);

  const crestBase = new THREE.Mesh(geo.crestBase, goldMat);
  crestBase.position.set(0, 0.24, -0.02);
  helm.add(crestBase);

  const crest = new THREE.Mesh(geo.crest, redMat);
  crest.position.set(0, 0.32, -0.02);
  helm.add(crest);

  // Aplicar texturas Sumi-e de cabeza (360°) y torso propia del Paladín
  let faceMat = null;
  let sideRightMat = null;
  let sideLeftMat = null;
  let backMat = null;
  if (a.parts?.head && Array.isArray(a.parts.head.material)) {
    faceMat = createHeroFaceMaterial('paladin');
    sideRightMat = createHeroHeadSideMaterial('paladin', 'R');
    sideLeftMat = createHeroHeadSideMaterial('paladin', 'L');
    backMat = createHeroHeadBackMaterial('paladin');
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
    chestMat = createHeroChestMaterial('paladin');
    torsoSideRightMat = createHeroTorsoSideMaterial('paladin', 'R');
    torsoSideLeftMat = createHeroTorsoSideMaterial('paladin', 'L');
    torsoBackMat = createHeroTorsoBackMaterial('paladin');
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

  // Aplicar texturas Sumi-e de brazos 360° del Paladín (frente +Z, exterior, interior, espalda -Z)
  let armFrontMat = null;
  let armSideRMat = null;
  let armSideLMat = null;
  let armInnerRMat = null;
  let armInnerLMat = null;
  let armBackMat = null;
  const armL = a.parts?.armL || (a.parts?.armLPivot?.children?.find((c) => c.geometry === G?.arm));
  const armR = a.parts?.armR || (a.parts?.armRPivot?.children?.find((c) => c.geometry === G?.arm));

  if (armL || armR) {
    armFrontMat = createHeroArmFrontMaterial('paladin');
    armSideRMat = createHeroArmSideMaterial('paladin', 'R');
    armSideLMat = createHeroArmSideMaterial('paladin', 'L');
    armInnerRMat = createHeroArmInnerMaterial('paladin', 'R');
    armInnerLMat = createHeroArmInnerMaterial('paladin', 'L');
    armBackMat = createHeroArmBackMaterial('paladin');

    if (armR) {
      if (!a._origArmRMat) a._origArmRMat = armR.material;
      const baseArmR = Array.isArray(a._origArmRMat) ? a._origArmRMat[0] : (a._origArmRMat || armR.material);
      armR.material = [
        armSideRMat || baseArmR,   // +X (exterior derecho)
        armInnerRMat || baseArmR,  // -X (interior derecho)
        baseArmR,                  // +Y (hombro)
        baseArmR,                  // -Y (muñeca)
        armFrontMat || baseArmR,   // +Z (frente / brazal de acero con cruz solar)
        armBackMat || baseArmR,    // -Z (espalda / codera puntiaguda)
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
        armFrontMat || baseArmL,   // +Z (frente / brazal de acero con cruz solar)
        armBackMat || baseArmL,    // -Z (espalda / codera puntiaguda)
      ];
    }
  }

  if (a.parts?.head) {
    add(helm, a.parts.head);
  } else {
    helm.position.set(0, 1.63, 0);
    add(helm, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 2. HOMBRERAS — Rectangulares dobles pegadas al torso
  //    Hombros del avatar en y = 1.33, x = ±0.30
  // ═══════════════════════════════════════════════════════════
  const createPauldron = (isLeft) => {
    const pGroup = new THREE.Group();
    pGroup.position.set(isLeft ? -0.34 : 0.34, 1.40, 0);

    const body = new THREE.Mesh(geo.pauldronBody, steelMat);
    pGroup.add(body);

    const rim = new THREE.Mesh(geo.pauldronRim, goldMat);
    rim.position.set(0, -0.06, 0);
    pGroup.add(rim);

    const cap = new THREE.Mesh(geo.pauldronCap, steelDarkMat);
    cap.position.set(isLeft ? -0.02 : 0.02, 0.10, 0);
    cap.rotation.z = isLeft ? 0.20 : -0.20;
    pGroup.add(cap);

    return pGroup;
  };

  const pauldronL = createPauldron(true);
  add(pauldronL, a.gear);

  const pauldronR = createPauldron(false);
  add(pauldronR, a.gear);

  // ═══════════════════════════════════════════════════════════
  // 3. ESCUDO — Anclado al brazo izquierdo (armLPivot)
  //    Sigue el balanceo natural de marcha del brazo
  // ═══════════════════════════════════════════════════════════
  const shieldGroup = new THREE.Group();
  shieldGroup.position.set(0, -0.28, 0.18);

  const shieldBody = new THREE.Mesh(geo.shieldBody, steelMat);
  shieldGroup.add(shieldBody);

  const shieldGold = new THREE.Mesh(geo.shieldGoldGeo, goldMat);
  shieldGroup.add(shieldGold);

  if (a.parts?.armLPivot) {
    add(shieldGroup, a.parts.armLPivot);
  } else {
    shieldGroup.position.set(-0.36, 0.91, 0.14);
    add(shieldGroup, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 4. PECHERA — Emblema de cruz dorada sobre el torso (volumen mixto)
  //    Torso centrado en y = 1.13, frente en z = +0.16
  // ═══════════════════════════════════════════════════════════
  const chestCrossH = new THREE.Mesh(geo.chestCrossH, goldMat);
  chestCrossH.position.set(0, 1.20, 0.17);
  add(chestCrossH, a.gear);

  const chestCrossV = new THREE.Mesh(geo.chestCrossV, goldMat);
  chestCrossV.position.set(0, 1.20, 0.17);
  add(chestCrossV, a.gear);

  // ═══════════════════════════════════════════════════════════
  // 5. CINTURÓN — Hebilla dorada (volumen mixto)
  // ═══════════════════════════════════════════════════════════
  const buckle = new THREE.Mesh(geo.buckle, goldMat);
  buckle.position.set(0, 0.84, 0.18);
  add(buckle, a.gear);

  if (a.parts) {
    a.parts.emissiveMats = [{ mat: goldMat, base: 0.25, amp: 0.10 }];
  }

  // ═══════════════════════════════════════════════════════════
  // 6. PIERNAS — Texturas Sumi-e 360° (frente +Z, exterior, interior, espalda -Z)
  // ═══════════════════════════════════════════════════════════
  let legFrontMat = null;
  let legSideRMat = null;
  let legSideLMat = null;
  let legInnerRMat = null;
  let legInnerLMat = null;
  let legBackMat = null;
  const legL = a.parts?.legL || (a.parts?.legLPivot?.children?.find((c) => c.geometry === G?.leg));
  const legR = a.parts?.legR || (a.parts?.legRPivot?.children?.find((c) => c.geometry === G?.leg));

  if (legL || legR) {
    legFrontMat = createHeroLegFrontMaterial('paladin');
    legSideRMat = createHeroLegSideMaterial('paladin', 'R');
    legSideLMat = createHeroLegSideMaterial('paladin', 'L');
    legInnerRMat = createHeroLegInnerMaterial('paladin', 'R');
    legInnerLMat = createHeroLegInnerMaterial('paladin', 'L');
    legBackMat = createHeroLegBackMaterial('paladin');

    if (legR) {
      if (!a._origLegRMat) a._origLegRMat = legR.material;
      const baseLegR = Array.isArray(a._origLegRMat) ? a._origLegRMat[0] : (a._origLegRMat || legR.material);
      legR.material = [
        legSideRMat || baseLegR,   // +X (exterior derecho)
        legInnerRMat || baseLegR,  // -X (interior derecho)
        baseLegR,                  // +Y (cadera)
        baseLegR,                  // -Y (suela)
        legFrontMat || baseLegR,   // +Z (frente / poleyn y greba)
        legBackMat || baseLegR,    // -Z (espalda / gemelo y talonera)
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
        legFrontMat || baseLegL,   // +Z (frente / poleyn y greba)
        legBackMat || baseLegL,    // -Z (espalda / gemelo y talonera)
      ];
    }
  }

  const mats = [steelMat, steelDarkMat, goldMat, redMat];
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
