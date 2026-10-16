// src/render/models/heroes/guardianGear.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  createHeroFaceMaterial,
  createHeroHeadSideMaterial,
  createHeroHeadBackMaterial,
  createHeroChestMaterial,
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
    pauldronLayer1: new THREE.BoxGeometry(0.22, 0.18, 0.30),
    pauldronLayer2: new THREE.BoxGeometry(0.24, 0.10, 0.32),
    pauldronRim: new THREE.BoxGeometry(0.24, 0.04, 0.32),
    pauldronStud: new THREE.BoxGeometry(0.05, 0.05, 0.05),
    skirtBody: new THREE.BoxGeometry(0.16, 0.32, 0.06),
    skirtEdge: new THREE.BoxGeometry(0.18, 0.04, 0.07),
    skirtRivet: new THREE.BoxGeometry(0.04, 0.04, 0.02),
    gauntletBase: new THREE.BoxGeometry(0.24, 0.22, 0.24),
    gauntletGoldGeo,
    gauntletFist: new THREE.BoxGeometry(0.22, 0.10, 0.14),
    chestPlate: new THREE.BoxGeometry(0.30, 0.24, 0.02),
    emblem: new THREE.BoxGeometry(0.10, 0.10, 0.03),
    boot: new THREE.BoxGeometry(0.22, 0.30, 0.24),
    bootRim: new THREE.BoxGeometry(0.24, 0.04, 0.26),
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
  if (a.parts?.torso) {
    if (!a._origTorsoMat) a._origTorsoMat = a.parts.torso.material;
    const baseMat = Array.isArray(a._origTorsoMat) ? a._origTorsoMat[0] : (a._origTorsoMat || a.parts.torso.material);
    chestMat = createHeroChestMaterial('guardian');
    if (chestMat) {
      a.parts.torso.material = [baseMat, baseMat, baseMat, baseMat, chestMat, baseMat];
    }
  }

  if (a.parts?.head) {
    add(crown, a.parts.head);
  } else {
    crown.position.set(0, 1.85, 0);
    add(crown, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 2. HOMBRERAS MACIZAS DE BRONCE CON RIBETES DORADOS
  // ═══════════════════════════════════════════════════════════
  const buildPauldron = (side) => {
    const g = new THREE.Group();
    const sign = side === 'L' ? -1 : 1;
    g.position.set(sign * 0.36, 1.38, 0);

    const layer1 = new THREE.Mesh(geo.pauldronLayer1, bronzeMat);
    layer1.position.set(sign * 0.02, 0, 0);
    g.add(layer1);

    const layer2 = new THREE.Mesh(geo.pauldronLayer2, bronzeDkMat);
    layer2.position.set(sign * 0.04, 0.12, 0);
    layer2.rotation.z = sign * 0.25;
    g.add(layer2);

    const rim = new THREE.Mesh(geo.pauldronRim, goldMat);
    rim.position.set(sign * 0.02, -0.10, 0);
    g.add(rim);

    const stud = new THREE.Mesh(geo.pauldronStud, goldMat);
    stud.position.set(sign * 0.02, 0.02, 0.17);
    g.add(stud);

    add(g, a.gear);
  };

  buildPauldron('L');
  buildPauldron('R');

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

  // ═══════════════════════════════════════════════════════════
  // 6. BOTAS DE METAL CON RIBETE DORADO (articuladas a las piernas)
  // ═══════════════════════════════════════════════════════════
  if (a.parts?.legLPivot) {
    const bootL = new THREE.Mesh(geo.boot, steelDkMat);
    bootL.position.set(0, -0.65, 0);
    add(bootL, a.parts.legLPivot);

    const bootRimL = new THREE.Mesh(geo.bootRim, goldMat);
    bootRimL.position.set(0, -0.52, 0);
    add(bootRimL, a.parts.legLPivot);
  } else {
    const bootL = new THREE.Mesh(geo.boot, steelDkMat);
    bootL.position.set(-0.15, 0.15, 0);
    add(bootL, a.gear);

    const bootRimL = new THREE.Mesh(geo.bootRim, goldMat);
    bootRimL.position.set(-0.15, 0.28, 0);
    add(bootRimL, a.gear);
  }

  if (a.parts?.legRPivot) {
    const bootR = new THREE.Mesh(geo.boot, steelDkMat);
    bootR.position.set(0, -0.65, 0);
    add(bootR, a.parts.legRPivot);

    const bootRimR = new THREE.Mesh(geo.bootRim, goldMat);
    bootRimR.position.set(0, -0.52, 0);
    add(bootRimR, a.parts.legRPivot);
  } else {
    const bootR = new THREE.Mesh(geo.boot, steelDkMat);
    bootR.position.set(0.15, 0.15, 0);
    add(bootR, a.gear);

    const bootRimR = new THREE.Mesh(geo.bootRim, goldMat);
    bootRimR.position.set(0.15, 0.28, 0);
    add(bootRimR, a.gear);
  }

  if (a.parts) {
    a.parts.emissiveMats = [{ mat: gemMat, base: 0.50, amp: 0.25 }];
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
  return mats;
}

export { buildGuardianGear as guardianGear };
