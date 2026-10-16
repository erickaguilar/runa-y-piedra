// src/render/models/heroes/wizardGear.js
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
} from '../../../heroes/heroPortraits.js';

let _wizGeoCache = null;
let _wizMatCache = null;

function getWizardGeoCache() {
  if (_wizGeoCache) return _wizGeoCache;

  const c1 = new THREE.BoxGeometry(0.32, 0.12, 0.32).translate(0, 0.28, 0);
  const c2 = new THREE.BoxGeometry(0.22, 0.12, 0.22).translate(0, 0.38, 0);
  const c3 = new THREE.BoxGeometry(0.12, 0.12, 0.12).translate(0, 0.48, 0);
  const hatConeGeo = mergeGeometries([c1, c2, c3], false);
  c1.dispose();
  c2.dispose();
  c3.dispose();

  _wizGeoCache = {
    brim: new THREE.BoxGeometry(0.56, 0.04, 0.56),
    band: new THREE.BoxGeometry(0.44, 0.05, 0.44),
    hatConeGeo,
    pom: new THREE.BoxGeometry(0.08, 0.08, 0.08),
    shaft: new THREE.BoxGeometry(0.06, 1.60, 0.06),
    knot: new THREE.BoxGeometry(0.09, 0.10, 0.09),
    staffRing: new THREE.BoxGeometry(0.10, 0.06, 0.10),
    crystal: new THREE.OctahedronGeometry(0.09, 0),
    crystalInner: new THREE.OctahedronGeometry(0.05, 0),
    book: new THREE.BoxGeometry(0.14, 0.18, 0.06),
    pages: new THREE.BoxGeometry(0.12, 0.17, 0.02),
    clasp: new THREE.BoxGeometry(0.03, 0.18, 0.02),
  };
  for (const g of Object.values(_wizGeoCache)) {
    g.userData = { isShared: true, heroId: 'wizard' };
  }
  return _wizGeoCache;
}

function getWizardMatCache() {
  if (_wizMatCache) return _wizMatCache;
  _wizMatCache = {
    hatMat: new THREE.MeshLambertMaterial({ color: 0x5b21b6 }),
    hatDarkMat: new THREE.MeshLambertMaterial({ color: 0x3b1078 }),
    hatBandMat: new THREE.MeshLambertMaterial({ color: 0x8b5cf6 }),
    pomMat: new THREE.MeshLambertMaterial({ color: 0xf97316 }),
    woodMat: new THREE.MeshLambertMaterial({ color: 0x4a2e18 }),
    woodHiMat: new THREE.MeshLambertMaterial({ color: 0x6b4423 }),
    crystalMat: new THREE.MeshLambertMaterial({
      color: 0xd8b4fe,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.8,
    }),
    ringMat: new THREE.MeshLambertMaterial({ color: 0xd4af37 }),
    bookCoverMat: new THREE.MeshLambertMaterial({ color: 0x4a1818 }),
    bookPagesMat: new THREE.MeshLambertMaterial({ color: 0xe8dcb8 }),
  };
  for (const m of Object.values(_wizMatCache)) {
    m.userData = { isShared: true, heroId: 'wizard' };
  }
  return _wizMatCache;
}

export function disposeWizardGearCache() {
  if (_wizGeoCache) {
    for (const g of Object.values(_wizGeoCache)) g.dispose?.();
    _wizGeoCache = null;
  }
  if (_wizMatCache) {
    for (const m of Object.values(_wizMatCache)) m.dispose?.();
    _wizMatCache = null;
  }
}

/**
 * Kit del Hechicero (wizard): arquetipo de taumaturgo arcano.
 * Incluye:
 * 1. Sombrero picudo de ala ancha, banda violeta brillante, cono escalonado y pom-pom naranja.
 * 2. Barba larga de sabio con bigote y remate en pico que cuelga del mentón al pecho.
 * 3. Báculo arcano articulado a la mano derecha (armRPivot) con madera nudosa, aro dorado y cristal octaédrico emisivo violeta.
 * 4. Grimorio de tapas carmesí con hojas de pergamino y broche dorado colgado del cinturón.
 *
 * @param {object} a - Entidad del avatar (con parts, gear, mesh).
 * @param {object} G - Caché de geometrías compartidas.
 * @param {function} add - Función para registrar nodos añadidos.
 * @returns {THREE.Material[]} Materiales propios para disponer al cambiar de clase.
 */
export function buildWizardGear(a, G, add) {
  const geo = getWizardGeoCache();
  const {
    hatMat,
    hatDarkMat,
    hatBandMat,
    pomMat,
    woodMat,
    woodHiMat,
    crystalMat,
    ringMat,
    bookCoverMat,
    bookPagesMat,
  } = getWizardMatCache();

  // ═══════════════════════════════════════════════════════════
  // 1. SOMBRERO — Ala ancha + cono más bajo con pom-pom
  //    Anclado a a.parts.head (cabeza centrada en 1.63, radio 0.20)
  // ═══════════════════════════════════════════════════════════
  const hatGroup = new THREE.Group();

  const brim = new THREE.Mesh(geo.brim, hatDarkMat);
  brim.position.set(0, 0.16, 0);
  hatGroup.add(brim);

  const band = new THREE.Mesh(geo.band, hatBandMat);
  band.position.set(0, 0.20, 0);
  hatGroup.add(band);

  const hatCone = new THREE.Mesh(geo.hatConeGeo, hatMat);
  hatGroup.add(hatCone);

  const pom = new THREE.Mesh(geo.pom, pomMat);
  pom.position.set(0, 0.58, 0);
  hatGroup.add(pom);

  if (a.parts?.head) {
    add(hatGroup, a.parts.head);
  } else {
    hatGroup.position.set(0, 1.63, 0);
    add(hatGroup, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 2. ROSTRO, LATERALES, NUCA Y PECHO SUMI-E (360°)
  //    La barba larga conecta directamente del mentón hacia el pecho
  // ═══════════════════════════════════════════════════════════
  let faceMat = null;
  let sideRightMat = null;
  let sideLeftMat = null;
  let backMat = null;
  if (a.parts?.head && Array.isArray(a.parts.head.material)) {
    faceMat = createHeroFaceMaterial('wizard');
    sideRightMat = createHeroHeadSideMaterial('wizard', 'R');
    sideLeftMat = createHeroHeadSideMaterial('wizard', 'L');
    backMat = createHeroHeadBackMaterial('wizard');
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
    chestMat = createHeroChestMaterial('wizard');
    torsoSideRightMat = createHeroTorsoSideMaterial('wizard', 'R');
    torsoSideLeftMat = createHeroTorsoSideMaterial('wizard', 'L');
    torsoBackMat = createHeroTorsoBackMaterial('wizard');
    if (chestMat) {
      a.parts.torso.material = [
        torsoSideRightMat || baseMat, // +X
        torsoSideLeftMat || baseMat, // -X
        baseMat, // +Y
        baseMat, // -Y
        chestMat, // +Z (pecho con túnica y barba larga)
        torsoBackMat || baseMat, // -Z (espalda con pliegues y runas)
      ];
    }
  }

  // Aplicar texturas Sumi-e de brazos 360° del Hechicero (frente +Z, exterior, interior, espalda -Z)
  let armFrontMat = null;
  let armSideRMat = null;
  let armSideLMat = null;
  let armInnerRMat = null;
  let armInnerLMat = null;
  let armBackMat = null;
  const armL = a.parts?.armL || (a.parts?.armLPivot?.children?.find((c) => c.geometry === G?.arm));
  const armR = a.parts?.armR || (a.parts?.armRPivot?.children?.find((c) => c.geometry === G?.arm));

  if (armL || armR) {
    armFrontMat = createHeroArmFrontMaterial('wizard');
    armSideRMat = createHeroArmSideMaterial('wizard', 'R');
    armSideLMat = createHeroArmSideMaterial('wizard', 'L');
    armInnerRMat = createHeroArmInnerMaterial('wizard', 'R');
    armInnerLMat = createHeroArmInnerMaterial('wizard', 'L');
    armBackMat = createHeroArmBackMaterial('wizard');

    if (armR) {
      if (!a._origArmRMat) a._origArmRMat = armR.material;
      const baseArmR = Array.isArray(a._origArmRMat) ? a._origArmRMat[0] : (a._origArmRMat || armR.material);
      armR.material = [
        armSideRMat || baseArmR,   // +X (exterior derecho)
        armInnerRMat || baseArmR,  // -X (interior derecho)
        baseArmR,                  // +Y (hombro)
        baseArmR,                  // -Y (muñeca)
        armFrontMat || baseArmR,   // +Z (frente / manga ancha con runas doradas)
        armBackMat || baseArmR,    // -Z (espalda / caída de túnica)
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
        armFrontMat || baseArmL,   // +Z (frente / manga ancha con runas doradas)
        armBackMat || baseArmL,    // -Z (espalda / caída de túnica)
      ];
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 3. BÁCULO ARCANO — Anclado directamente a la MANO derecha (armRPivot)
  //    armRPivot está en y = 1.33. La mano está en y = -0.42 a -0.47.
  // ═══════════════════════════════════════════════════════════
  const staff = new THREE.Group();
  staff.position.set(0, -0.42, 0.10);

  const shaft = new THREE.Mesh(geo.shaft, woodMat);
  shaft.position.set(0, 0.20, 0);
  staff.add(shaft);

  const knot = new THREE.Mesh(geo.knot, woodHiMat);
  knot.position.set(0, 0.10, 0);
  staff.add(knot);

  const staffRing = new THREE.Mesh(geo.staffRing, ringMat);
  staffRing.position.set(0, 0.98, 0);
  staff.add(staffRing);

  const crystal = new THREE.Mesh(geo.crystal, crystalMat);
  crystal.position.set(0, 1.12, 0);
  crystal.rotation.y = Math.PI / 4;
  staff.add(crystal);

  const crystalInner = new THREE.Mesh(geo.crystalInner, crystalMat);
  crystalInner.position.set(0, 1.12, 0);
  crystalInner.rotation.y = Math.PI / 4;
  crystalInner.rotation.x = Math.PI / 4;
  staff.add(crystalInner);

  if (a.parts?.armRPivot) {
    add(staff, a.parts.armRPivot);
  } else {
    staff.position.set(0.30, 0.91, 0.10);
    add(staff, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 4. GRIMORIO EN EL CINTURÓN — Colgado a la cadera izquierda (volumen mixto)
  // ═══════════════════════════════════════════════════════════
  const bookGroup = new THREE.Group();

  const book = new THREE.Mesh(geo.book, bookCoverMat);
  book.position.set(-0.20, 0.82, 0.16);
  book.rotation.z = 0.15;
  bookGroup.add(book);

  const pages = new THREE.Mesh(geo.pages, bookPagesMat);
  pages.position.set(-0.20, 0.82, 0.185);
  pages.rotation.z = 0.15;
  bookGroup.add(pages);

  const clasp = new THREE.Mesh(geo.clasp, ringMat);
  clasp.position.set(-0.15, 0.82, 0.19);
  clasp.rotation.z = 0.15;
  bookGroup.add(clasp);

  add(bookGroup, a.gear);

  if (a.parts) {
    a.parts.crystal = crystal;
    a.parts.crystalInner = crystalInner;
    a.parts.emissiveMats = [{ mat: crystalMat, base: 0.75, amp: 0.25 }];
  }

  const mats = [
    hatMat,
    hatDarkMat,
    hatBandMat,
    pomMat,
    woodMat,
    woodHiMat,
    crystalMat,
    ringMat,
    bookCoverMat,
    bookPagesMat,
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
  return mats;
}

export { buildWizardGear as wizardGear };
