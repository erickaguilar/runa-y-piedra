// src/render/models/heroes/guardianGear.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildGuardianHammerMesh } from './heroWeapons.js';
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

let _grdGeoCache = null;
let _grdMatCache = null;

function getGuardianGeoCache() {
  if (_grdGeoCache) return _grdGeoCache;

  const crownBand = new THREE.BoxGeometry(0.46, 0.08, 0.46);
  const spikeBase = new THREE.BoxGeometry(0.08, 0.14, 0.08);
  const sp1 = spikeBase.clone().translate(-0.19, 0.11, -0.19);
  const sp2 = spikeBase.clone().translate(0.19, 0.11, -0.19);
  const sp3 = spikeBase.clone().translate(-0.19, 0.11, 0.19);
  const sp4 = spikeBase.clone().translate(0.19, 0.11, 0.19);
  const centerSpike = new THREE.BoxGeometry(0.10, 0.20, 0.10).translate(0, 0.14, 0.20);
  const crownGoldGeo = mergeGeometries([crownBand, sp1, sp2, sp3, sp4, centerSpike], false);
  crownBand.dispose();
  spikeBase.dispose();
  sp1.dispose();
  sp2.dispose();
  sp3.dispose();
  sp4.dispose();
  centerSpike.dispose();

  const gRing = new THREE.BoxGeometry(0.26, 0.04, 0.26).translate(0, 0.13, 0);
  const gStud = new THREE.BoxGeometry(0.05, 0.05, 0.02).translate(0, -0.16, 0.14);
  const gauntletGoldGeo = mergeGeometries([gRing, gStud], false);
  gRing.dispose();
  gStud.dispose();

  _grdGeoCache = {
    crownGoldGeo,
    crownGem: new THREE.BoxGeometry(0.08, 0.08, 0.06),
    skirtBody: new THREE.BoxGeometry(0.16, 0.32, 0.06),
    skirtEdge: new THREE.BoxGeometry(0.18, 0.04, 0.07),
    skirtRivet: new THREE.BoxGeometry(0.04, 0.04, 0.02),
    gauntletBase: new THREE.BoxGeometry(0.24, 0.22, 0.24),
    gauntletGoldGeo,
    gauntletFist: new THREE.BoxGeometry(0.22, 0.10, 0.14),
    chestPlate: new THREE.BoxGeometry(0.30, 0.24, 0.02),
    emblem: new THREE.BoxGeometry(0.10, 0.10, 0.03),
  };
  for (const g of Object.values(_grdGeoCache)) {
    g.userData = { isShared: true, heroId: 'guardian' };
  }
  return _grdGeoCache;
}

function getGuardianMatCache() {
  if (_grdMatCache) return _grdMatCache;
  _grdMatCache = {
    goldMat: new THREE.MeshLambertMaterial({ color: 0xd4af37 }),
    goldDarkMat: new THREE.MeshLambertMaterial({ color: 0x8a6a20 }),
    bronzeMat: new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
    bronzeDkMat: new THREE.MeshLambertMaterial({ color: 0x5a3a18 }),
    steelMat: new THREE.MeshLambertMaterial({ color: 0x6b7078 }),
    steelDkMat: new THREE.MeshLambertMaterial({ color: 0x3a3f48 }),
    gemMat: new THREE.MeshLambertMaterial({
      color: 0xdc2626,
      emissive: 0x5a0a0a,
      emissiveIntensity: 0.5,
    }),
  };
  for (const m of Object.values(_grdMatCache)) {
    m.userData = { isShared: true, heroId: 'guardian' };
  }
  return _grdMatCache;
}

export function disposeGuardianGearCache() {
  if (_grdGeoCache) {
    for (const g of Object.values(_grdGeoCache)) g.dispose?.();
    _grdGeoCache = null;
  }
  if (_grdMatCache) {
    for (const m of Object.values(_grdMatCache)) m.dispose?.();
    _grdMatCache = null;
  }
}

/**
 * Kit del Guardián (guardian): arquetipo de coloso acorazado / tanque de vanguardia.
 * Incluye:
 * 1. Corona dorada con púas angulares, púa central con gema roja emisiva sobre la cabeza.
 * 2. Hombreras macizas de bronce en doble placa angulada con ribete y remaches dorados.
 * 3. Faldón acorazado con 5 placas independientes (3 frontales y 2 laterales) con filo dorado.
 * 4. Guanteletes pesados de acero con aro dorado y puño de choque (articulados en armLPivot y armRPivot).
 * 5. Pechera de bronce con emblema romboidal de oro en el esternón.
 * 6. Botas de placas con ribete superior dorado articuladas en los pivotes de las piernas (legLPivot / legRPivot).
 *
 * @param {object} a - Entidad del avatar (con parts, gear, mesh).
 * @param {object} G - Caché de geometrías compartidas.
 * @param {function} add - Función para registrar nodos añadidos.
 * @returns {THREE.Material[]} Materiales propios para disponer al cambiar de clase.
 */
export function buildGuardianGear(a, G, add) {
  const geo = getGuardianGeoCache();
  const {
    goldMat,
    goldDarkMat,
    bronzeMat,
    bronzeDkMat,
    steelMat,
    steelDkMat,
    gemMat,
  } = getGuardianMatCache();

  // Atenuar ligeramente la túnica base para que los dorados y bronces resalten con fuerte contraste
  if (a.mats?.[0]) {
    if (a._origTunicHex === undefined) {
      a._origTunicHex = a.mats[0].color.getHex();
    }
    a.mats[0].color.multiplyScalar(0.88);
  }

  // ═══════════════════════════════════════════════════════════
  // 1. CORONA DORADA CON PÚAS — Sobre la parte superior de la cabeza
  //    Cabeza centrada en (0, 1.63, 0), tope en y = +0.20 rel
  // ═══════════════════════════════════════════════════════════
  const crown = new THREE.Group();
  crown.position.set(0, 0.22, 0);

  const crownGold = new THREE.Mesh(geo.crownGoldGeo, goldMat);
  crown.add(crownGold);

  const crownGem = new THREE.Mesh(geo.crownGem, gemMat);
  crownGem.position.set(0, 0.20, 0.24);
  crown.add(crownGem);

  // Aplicar texturas Sumi-e de cabeza (frente +Z, laterales +X/-X, nuca -Z) y torso (+Z) del Guardián
  let faceMat = null;
  let sideRightMat = null;
  let sideLeftMat = null;
  let backMat = null;
  if (a.parts?.head && Array.isArray(a.parts.head.material)) {
    faceMat = createHeroFaceMaterial('guardian');
    sideRightMat = createHeroHeadSideMaterial('guardian', 'R');
    sideLeftMat = createHeroHeadSideMaterial('guardian', 'L');
    backMat = createHeroHeadBackMaterial('guardian');
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
    chestMat = createHeroChestMaterial('guardian');
    torsoSideRightMat = createHeroTorsoSideMaterial('guardian', 'R');
    torsoSideLeftMat = createHeroTorsoSideMaterial('guardian', 'L');
    torsoBackMat = createHeroTorsoBackMaterial('guardian');
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

  // Aplicar texturas Sumi-e de brazos 360° del Guardián (frente +Z, exterior, interior, espalda -Z)
  let armFrontMat = null;
  let armSideRMat = null;
  let armSideLMat = null;
  let armInnerRMat = null;
  let armInnerLMat = null;
  let armBackMat = null;
  const armL = a.parts?.armL || (a.parts?.armLPivot?.children?.find((c) => c.geometry === G?.arm));
  const armR = a.parts?.armR || (a.parts?.armRPivot?.children?.find((c) => c.geometry === G?.arm));

  if (armL || armR) {
    armFrontMat = createHeroArmFrontMaterial('guardian');
    armSideRMat = createHeroArmSideMaterial('guardian', 'R');
    armSideLMat = createHeroArmSideMaterial('guardian', 'L');
    armInnerRMat = createHeroArmInnerMaterial('guardian', 'R');
    armInnerLMat = createHeroArmInnerMaterial('guardian', 'L');
    armBackMat = createHeroArmBackMaterial('guardian');

    if (armR) {
      if (!a._origArmRMat) a._origArmRMat = armR.material;
      const baseArmR = Array.isArray(a._origArmRMat) ? a._origArmRMat[0] : (a._origArmRMat || armR.material);
      armR.material = [
        armSideRMat || baseArmR,   // +X (exterior derecho)
        armInnerRMat || baseArmR,  // -X (interior derecho)
        baseArmR,                  // +Y (hombro)
        baseArmR,                  // -Y (muñeca)
        armFrontMat || baseArmR,   // +Z (frente)
        armBackMat || baseArmR,    // -Z (espalda/tríceps)
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
        armFrontMat || baseArmL,   // +Z (frente)
        armBackMat || baseArmL,    // -Z (espalda/tríceps)
      ];
    }
  }

  if (a.parts?.head) {
    add(crown, a.parts.head);
  } else {
    crown.position.set(0, 1.85, 0);
    add(crown, a.gear);
  }


  // ═══════════════════════════════════════════════════════════
  // 3. FALDÓN DE 5 PLACAS INDEPENDIENTES (3 frontales + 2 laterales)
  //    Cuelgan del cinturón (y = 0.78)
  // ═══════════════════════════════════════════════════════════
  const skirtGroup = new THREE.Group();
  skirtGroup.position.set(0, 0.78, 0);

  const platePositions = [
    { x: -0.20, z:  0.14, rotY:  0 },
    { x:  0.00, z:  0.16, rotY:  0 },
    { x:  0.20, z:  0.14, rotY:  0 },
    { x: -0.28, z: -0.05, rotY:  0.4 },
    { x:  0.28, z: -0.05, rotY: -0.4 },
  ];

  for (const p of platePositions) {
    const plate = new THREE.Group();
    plate.position.set(p.x, 0, p.z);
    plate.rotation.y = p.rotY;
    skirtGroup.add(plate);

    const body = new THREE.Mesh(geo.skirtBody, bronzeMat);
    body.position.set(0, -0.16, 0);
    plate.add(body);

    const edge = new THREE.Mesh(geo.skirtEdge, goldMat);
    edge.position.set(0, -0.34, 0);
    plate.add(edge);

    const rivet = new THREE.Mesh(geo.skirtRivet, steelMat);
    rivet.position.set(0, -0.04, 0.03);
    plate.add(rivet);
  }

  add(skirtGroup, a.gear);
  if (a.parts) {
    a.parts.skirt = skirtGroup;
  }

  // ═══════════════════════════════════════════════════════════
  // 4. GUANTELETES PESADOS EN ANTEBRAZOS (articulados a armLPivot/armRPivot)
  // ═══════════════════════════════════════════════════════════
  const buildGauntlet = (pivot) => {
    const g = new THREE.Group();
    g.position.set(0, -0.32, 0);

    const base = new THREE.Mesh(geo.gauntletBase, steelMat);
    g.add(base);

    const goldParts = new THREE.Mesh(geo.gauntletGoldGeo, goldMat);
    g.add(goldParts);

    const fist = new THREE.Mesh(geo.gauntletFist, steelDkMat);
    fist.position.set(0, -0.16, 0.06);
    g.add(fist);

    add(g, pivot);
  };

  if (a.parts?.armLPivot) buildGauntlet(a.parts.armLPivot);
  if (a.parts?.armRPivot) buildGauntlet(a.parts.armRPivot);

  // 4b. MAZO SÍSMICO DE BASALTO — Empuñado en la mano derecha (armLPivot)
  const hammer = buildGuardianHammerMesh();
  hammer.position.set(0, -0.45, 0.08);
  hammer.rotation.x = Math.PI / 4;
  if (a.parts?.armLPivot) {
    add(hammer, a.parts.armLPivot);
  } else {
    hammer.position.set(-0.30, 0.88, 0.12);
    add(hammer, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 5. PECHERA REFORZADA CON ROMBO DORADO (volumen mixto)
  // ═══════════════════════════════════════════════════════════
  const chestPlate = new THREE.Mesh(geo.chestPlate, bronzeDkMat);
  chestPlate.position.set(0, 1.18, 0.17);
  add(chestPlate, a.gear);

  const emblem = new THREE.Mesh(geo.emblem, goldMat);
  emblem.position.set(0, 1.18, 0.185);
  emblem.rotation.z = Math.PI / 4;
  add(emblem, a.gear);

  if (a.parts) {
    a.parts.emissiveMats = [{ mat: gemMat, base: 0.50, amp: 0.25 }];
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
    legFrontMat = createHeroLegFrontMaterial('guardian');
    legSideRMat = createHeroLegSideMaterial('guardian', 'R');
    legSideLMat = createHeroLegSideMaterial('guardian', 'L');
    legInnerRMat = createHeroLegInnerMaterial('guardian', 'R');
    legInnerLMat = createHeroLegInnerMaterial('guardian', 'L');
    legBackMat = createHeroLegBackMaterial('guardian');

    if (legR) {
      if (!a._origLegRMat) a._origLegRMat = legR.material;
      const baseLegR = Array.isArray(a._origLegRMat) ? a._origLegRMat[0] : (a._origLegRMat || legR.material);
      legR.material = [
        legSideRMat || baseLegR,   // +X (exterior derecho)
        legInnerRMat || baseLegR,  // -X (interior derecho)
        baseLegR,                  // +Y (cadera)
        baseLegR,                  // -Y (suela)
        legFrontMat || baseLegR,   // +Z (frente / quijote y greba)
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
        legFrontMat || baseLegL,   // +Z (frente / quijote y greba)
        legBackMat || baseLegL,    // -Z (espalda / gemelo y talonera)
      ];
    }
  }

  const mats = [
    goldMat,
    goldDarkMat,
    bronzeMat,
    bronzeDkMat,
    steelMat,
    steelDkMat,
    gemMat,
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

export { buildGuardianGear as guardianGear };
