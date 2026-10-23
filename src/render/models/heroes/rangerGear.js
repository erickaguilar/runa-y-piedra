// src/render/models/heroes/rangerGear.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildRangerBowMesh } from './heroWeapons.js';
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

let _rngGeoCache = null;
let _rngMatCache = null;

function getRangerGeoCache() {
  if (_rngGeoCache) return _rngGeoCache;

  const hTop = new THREE.BoxGeometry(0.44, 0.16, 0.44).translate(0, 0.22, 0);
  const hSideBase = new THREE.BoxGeometry(0.06, 0.24, 0.44);
  const hSideL = hSideBase.clone().translate(-0.20, 0.08, 0);
  const hSideR = hSideBase.clone().translate(0.20, 0.08, 0);
  const hBack = new THREE.BoxGeometry(0.44, 0.34, 0.06).translate(0, 0.05, -0.20);
  const hoodMainGeo = mergeGeometries([hTop, hSideL, hSideR, hBack], false);
  hTop.dispose();
  hSideBase.dispose();
  hSideL.dispose();
  hSideR.dispose();
  hBack.dispose();

  const qRingBase = new THREE.BoxGeometry(0.14, 0.03, 0.14);
  const qRingTop = qRingBase.clone().translate(0, 0.14, 0);
  const qRingBot = qRingBase.clone().translate(0, -0.14, 0);
  const quiverRingsGeo = mergeGeometries([qRingTop, qRingBot], false);
  qRingBase.dispose();
  qRingTop.dispose();
  qRingBot.dispose();

  const shaftBase = new THREE.BoxGeometry(0.02, 0.28, 0.02);
  const featherBase = new THREE.BoxGeometry(0.04, 0.08, 0.04);
  const shafts = [];
  const feathers = [];
  for (let i = 0; i < 3; i++) {
    const offsetX = (i - 1) * 0.035;
    const offsetZ = (i === 1 ? 0.02 : -0.02);
    shafts.push(shaftBase.clone().translate(offsetX, 0.28, offsetZ));
    feathers.push(featherBase.clone().translate(offsetX, 0.38, offsetZ));
  }
  const arrowsShaftGeo = mergeGeometries(shafts, false);
  const arrowsFeatherGeo = mergeGeometries(feathers, false);
  shaftBase.dispose();
  featherBase.dispose();
  for (const s of shafts) s.dispose();
  for (const f of feathers) f.dispose();

  _rngGeoCache = {
    hoodMainGeo,
    hoodTail: new THREE.BoxGeometry(0.34, 0.28, 0.05),
    cloak: new THREE.BoxGeometry(0.54, 0.68, 0.05),
    cloakEdge: new THREE.BoxGeometry(0.56, 0.06, 0.06),
    quiverBody: new THREE.BoxGeometry(0.12, 0.42, 0.12),
    quiverRingsGeo,
    arrowsShaftGeo,
    arrowsFeatherGeo,
    strap: new THREE.BoxGeometry(0.08, 0.60, 0.02),
    strapBuckle: new THREE.BoxGeometry(0.09, 0.07, 0.03),
    boot: new THREE.BoxGeometry(0.20, 0.32, 0.22),
    glove: new THREE.BoxGeometry(0.21, 0.11, 0.21),
  };
  for (const g of Object.values(_rngGeoCache)) {
    g.userData = { isShared: true, heroId: 'ranger' };
  }
  return _rngGeoCache;
}

function getRangerMatCache() {
  if (_rngMatCache) return _rngMatCache;
  _rngMatCache = {
    hoodMat: new THREE.MeshLambertMaterial({ color: 0x2a5a3a }),
    hoodDarkMat: new THREE.MeshLambertMaterial({ color: 0x1a3d26 }),
    cloakMat: new THREE.MeshLambertMaterial({ color: 0x2f6b42 }),
    leatherMat: new THREE.MeshLambertMaterial({ color: 0x4a2e18 }),
    leatherHiMat: new THREE.MeshLambertMaterial({ color: 0x6b4423 }),
    quiverMat: new THREE.MeshLambertMaterial({ color: 0x3a2410 }),
    featherMat: new THREE.MeshLambertMaterial({ color: 0xc83226 }),
    shaftMat: new THREE.MeshLambertMaterial({ color: 0xd9b48a }),
    bootsMat: new THREE.MeshLambertMaterial({ color: 0x3d2817 }),
  };
  for (const m of Object.values(_rngMatCache)) {
    m.userData = { isShared: true, heroId: 'ranger' };
  }
  return _rngMatCache;
}

export function disposeRangerGearCache() {
  if (_rngGeoCache) {
    for (const g of Object.values(_rngGeoCache)) g.dispose?.();
    _rngGeoCache = null;
  }
  if (_rngMatCache) {
    for (const m of Object.values(_rngMatCache)) m.dispose?.();
    _rngMatCache = null;
  }
}

/**
 * Kit del Explorador (ranger): arquetipo de rastreador ágil y arquero.
 * Incluye:
 * 1. Capucha con faldón trasero (casquete, laterales de sien, nuca y caída de tela).
 * 2. Capa corta con ribete oscuro que cae desde los hombros hasta la cintura.
 * 3. Carcaj de cuero sobre el hombro derecho con anillos y 3 flechas con emplumado rojo vivo.
 * 4. Bandolera/correas de cuero cruzadas en el pecho con hebilla utilitaria.
 * 5. Botas altas de cuero articuladas en los pivotes de las piernas (legLPivot / legRPivot).
 * 6. Guantes de cuero articulados en las manos (armLPivot / armRPivot).
 *
 * @param {object} a - Entidad del avatar (con parts, gear, mesh).
 * @param {object} G - Caché de geometrías compartidas.
 * @param {function} add - Función para registrar nodos añadidos.
 * @returns {THREE.Material[]} Materiales propios para disponer al cambiar de clase.
 */
export function buildRangerGear(a, G, add) {
  const geo = getRangerGeoCache();
  const {
    hoodMat,
    hoodDarkMat,
    cloakMat,
    leatherMat,
    leatherHiMat,
    quiverMat,
    featherMat,
    shaftMat,
    bootsMat,
  } = getRangerMatCache();

  // Suavizar ligeramente el tono de la túnica base para balance tonal
  if (a.mats?.[0]) {
    if (a._origTunicHex === undefined) {
      a._origTunicHex = a.mats[0].color.getHex();
    }
    a.mats[0].color.multiplyScalar(0.90);
  }

  // ═══════════════════════════════════════════════════════════
  // 1. CAPUCHA — Casquete superior, laterales, nuca y faldón trasero
  //    Cabeza centrada en (0, 1.63, 0)
  // ═══════════════════════════════════════════════════════════
  const hoodGroup = new THREE.Group();

  const hoodMain = new THREE.Mesh(geo.hoodMainGeo, hoodMat);
  hoodGroup.add(hoodMain);

  const hoodTail = new THREE.Mesh(geo.hoodTail, hoodDarkMat);
  hoodTail.position.set(0, -0.26, -0.22);
  hoodGroup.add(hoodTail);

  // Aplicar texturas Sumi-e de cabeza (360°) y torso propia del Explorador
  let faceMat = null;
  let sideRightMat = null;
  let sideLeftMat = null;
  let backMat = null;
  if (a.parts?.head && Array.isArray(a.parts.head.material)) {
    faceMat = createHeroFaceMaterial('ranger');
    sideRightMat = createHeroHeadSideMaterial('ranger', 'R');
    sideLeftMat = createHeroHeadSideMaterial('ranger', 'L');
    backMat = createHeroHeadBackMaterial('ranger');
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
    chestMat = createHeroChestMaterial('ranger');
    torsoSideRightMat = createHeroTorsoSideMaterial('ranger', 'R');
    torsoSideLeftMat = createHeroTorsoSideMaterial('ranger', 'L');
    torsoBackMat = createHeroTorsoBackMaterial('ranger');
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

  // Aplicar texturas Sumi-e de brazos 360° del Explorador (frente +Z, exterior, interior, espalda -Z)
  let armFrontMat = null;
  let armSideRMat = null;
  let armSideLMat = null;
  let armInnerRMat = null;
  let armInnerLMat = null;
  let armBackMat = null;
  const armL = a.parts?.armL || (a.parts?.armLPivot?.children?.find((c) => c.geometry === G?.arm));
  const armR = a.parts?.armR || (a.parts?.armRPivot?.children?.find((c) => c.geometry === G?.arm));

  if (armL || armR) {
    armFrontMat = createHeroArmFrontMaterial('ranger');
    armSideRMat = createHeroArmSideMaterial('ranger', 'R');
    armSideLMat = createHeroArmSideMaterial('ranger', 'L');
    armInnerRMat = createHeroArmInnerMaterial('ranger', 'R');
    armInnerLMat = createHeroArmInnerMaterial('ranger', 'L');
    armBackMat = createHeroArmBackMaterial('ranger');

    if (armR) {
      if (!a._origArmRMat) a._origArmRMat = armR.material;
      const baseArmR = Array.isArray(a._origArmRMat) ? a._origArmRMat[0] : (a._origArmRMat || armR.material);
      armR.material = [
        armSideRMat || baseArmR,   // +X (exterior derecho)
        armInnerRMat || baseArmR,  // -X (interior derecho)
        baseArmR,                  // +Y (hombro)
        baseArmR,                  // -Y (muñeca)
        armFrontMat || baseArmR,   // +Z (frente / brazal de arquero acordonado)
        armBackMat || baseArmR,    // -Z (espalda / codera de cuero)
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
        armFrontMat || baseArmL,   // +Z (frente / brazal de arquero acordonado)
        armBackMat || baseArmL,    // -Z (espalda / codera de cuero)
      ];
    }
  }

  if (a.parts?.head) {
    add(hoodGroup, a.parts.head);
  } else {
    hoodGroup.position.set(0, 1.63, 0);
    add(hoodGroup, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 2. CAPA CORTA — Cuelga de los hombros hacia atrás hasta la cadera
  //    Pivote en los hombros (y = 1.32, z = -0.17) para ondeo dinámico
  // ═══════════════════════════════════════════════════════════
  const cloakGroup = new THREE.Group();
  cloakGroup.position.set(0, 1.32, -0.17);

  const cloak = new THREE.Mesh(geo.cloak, cloakMat);
  cloak.position.set(0, -0.34, -0.02);
  cloak.rotation.x = 0.06;
  cloakGroup.add(cloak);

  const cloakEdge = new THREE.Mesh(geo.cloakEdge, hoodDarkMat);
  cloakEdge.position.set(0, -0.67, 0.00);
  cloakEdge.rotation.x = 0.06;
  cloakGroup.add(cloakEdge);

  add(cloakGroup, a.gear);
  if (a.parts) {
    a.parts.cloak = cloakGroup;
  }

  // ═══════════════════════════════════════════════════════════
  // 3. CARCAJ CON FLECHAS — Sobre el hombro derecho
  //    Hombro derecho en x = 0.30, y = 1.33
  // ═══════════════════════════════════════════════════════════
  const quiver = new THREE.Group();
  quiver.position.set(0.24, 1.38, -0.18);
  quiver.rotation.z = -0.22;
  quiver.rotation.x = -0.08;

  const quiverBody = new THREE.Mesh(geo.quiverBody, quiverMat);
  quiver.add(quiverBody);

  const rings = new THREE.Mesh(geo.quiverRingsGeo, leatherHiMat);
  quiver.add(rings);

  const shafts = new THREE.Mesh(geo.arrowsShaftGeo, shaftMat);
  quiver.add(shafts);

  const feathers = new THREE.Mesh(geo.arrowsFeatherGeo, featherMat);
  quiver.add(feathers);

  add(quiver, a.gear);

  // ═══════════════════════════════════════════════════════════
  // 4. CORREAS CRUZADAS EN EL PECHO (volumen mixto)
  // ═══════════════════════════════════════════════════════════
  const strap = new THREE.Mesh(geo.strap, leatherMat);
  strap.position.set(0.06, 1.15, 0.17);
  strap.rotation.z = 0.45;
  add(strap, a.gear);

  const strapBuckle = new THREE.Mesh(geo.strapBuckle, leatherHiMat);
  strapBuckle.position.set(0.06, 1.15, 0.18);
  strapBuckle.rotation.z = 0.45;
  add(strapBuckle, a.gear);

  // ═══════════════════════════════════════════════════════════
  // 5. BOTAS ALTAS DE CUERO — Articuladas en los pivotes de las piernas
  // ═══════════════════════════════════════════════════════════
  if (a.parts?.legLPivot) {
    const bootL = new THREE.Mesh(geo.boot, bootsMat);
    bootL.position.set(0, -0.64, 0);
    add(bootL, a.parts.legLPivot);
  } else {
    const bootL = new THREE.Mesh(geo.boot, bootsMat);
    bootL.position.set(-0.15, 0.16, 0);
    add(bootL, a.gear);
  }

  if (a.parts?.legRPivot) {
    const bootR = new THREE.Mesh(geo.boot, bootsMat);
    bootR.position.set(0, -0.64, 0);
    add(bootR, a.parts.legRPivot);
  } else {
    const bootR = new THREE.Mesh(geo.boot, bootsMat);
    bootR.position.set(0.15, 0.16, 0);
    add(bootR, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 6. GUANTES DE CUERO — Articulados en los pivotes de los brazos
  // ═══════════════════════════════════════════════════════════
  if (a.parts?.armLPivot) {
    const gloveL = new THREE.Mesh(geo.glove, leatherMat);
    gloveL.position.set(0, -0.47, 0);
    add(gloveL, a.parts.armLPivot);
  }

  if (a.parts?.armRPivot) {
    const gloveR = new THREE.Mesh(geo.glove, leatherMat);
    gloveR.position.set(0, -0.47, 0);
    add(gloveR, a.parts.armRPivot);
  }

  // 6b. ARCO RÚNICO DEL VIENTO — Empuñado en la mano derecha (armLPivot)
  const bow = buildRangerBowMesh();
  bow.position.set(0, -0.45, 0.08);
  bow.rotation.set(Math.PI / 12, 0, -Math.PI / 16);
  if (a.parts?.armLPivot) {
    add(bow, a.parts.armLPivot);
  } else {
    bow.position.set(-0.30, 0.88, 0.10);
    add(bow, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 7. PIERNAS — Texturas Sumi-e 360° (frente +Z, exterior, interior, espalda -Z)
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
    legFrontMat = createHeroLegFrontMaterial('ranger');
    legSideRMat = createHeroLegSideMaterial('ranger', 'R');
    legSideLMat = createHeroLegSideMaterial('ranger', 'L');
    legInnerRMat = createHeroLegInnerMaterial('ranger', 'R');
    legInnerLMat = createHeroLegInnerMaterial('ranger', 'L');
    legBackMat = createHeroLegBackMaterial('ranger');

    if (legR) {
      if (!a._origLegRMat) a._origLegRMat = legR.material;
      const baseLegR = Array.isArray(a._origLegRMat) ? a._origLegRMat[0] : (a._origLegRMat || legR.material);
      legR.material = [
        legSideRMat || baseLegR,   // +X (exterior derecho)
        legInnerRMat || baseLegR,  // -X (interior derecho)
        baseLegR,                  // +Y (cadera)
        baseLegR,                  // -Y (suela)
        legFrontMat || baseLegR,   // +Z (frente / rodillera y cordones)
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
        legFrontMat || baseLegL,   // +Z (frente / rodillera y cordones)
        legBackMat || baseLegL,    // -Z (espalda / gemelo y talonera)
      ];
    }
  }

  const mats = [
    hoodMat,
    hoodDarkMat,
    cloakMat,
    leatherMat,
    leatherHiMat,
    quiverMat,
    featherMat,
    shaftMat,
    bootsMat,
  ];
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

export { buildRangerGear as rangerGear };
