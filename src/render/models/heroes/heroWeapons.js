// src/render/models/heroes/heroWeapons.js
import * as THREE from 'three';

let _weaponGeoCache = null;
let _weaponMatCache = null;

function getWeaponGeoCache() {
  if (_weaponGeoCache) return _weaponGeoCache;

  // 1. Espada de Explorador (Aventurero)
  const swordBlade = new THREE.BoxGeometry(0.06, 0.58, 0.025);
  const swordGuard = new THREE.BoxGeometry(0.18, 0.035, 0.045);
  const swordGrip = new THREE.BoxGeometry(0.035, 0.14, 0.035);
  const swordPommel = new THREE.BoxGeometry(0.055, 0.04, 0.045);

  // 2. Mandoble de la Luz (Paladín)
  const greatBlade = new THREE.BoxGeometry(0.12, 0.92, 0.035);
  const greatFuller = new THREE.BoxGeometry(0.03, 0.82, 0.04);
  const greatGuard = new THREE.BoxGeometry(0.32, 0.05, 0.06);
  const greatGrip = new THREE.BoxGeometry(0.04, 0.22, 0.04);
  const greatPommel = new THREE.BoxGeometry(0.07, 0.06, 0.06);

  // 3. Arco Rúnico del Viento (Explorador)
  const bowGrip = new THREE.BoxGeometry(0.04, 0.12, 0.05);
  const bowLimbUpper = new THREE.BoxGeometry(0.035, 0.36, 0.035);
  const bowLimbLower = new THREE.BoxGeometry(0.035, 0.36, 0.035);
  const bowTipUpper = new THREE.BoxGeometry(0.03, 0.18, 0.03);
  const bowTipLower = new THREE.BoxGeometry(0.03, 0.18, 0.03);
  const bowString = new THREE.CylinderGeometry(0.005, 0.005, 0.98, 4);

  // 4. Báculo de Rayo Arcano (Hechicero)
  const staffShaft = new THREE.CylinderGeometry(0.024, 0.024, 1.15, 6);
  const staffRing = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 6);
  const staffCrystal = new THREE.OctahedronGeometry(0.10, 0);

  // 5. Mazo Sísmico de Basalto (Guardián)
  const hammerShaft = new THREE.CylinderGeometry(0.03, 0.03, 0.76, 6);
  const hammerHead = new THREE.BoxGeometry(0.22, 0.20, 0.32);
  const hammerRune = new THREE.BoxGeometry(0.23, 0.14, 0.18);
  const hammerSpike = new THREE.ConeGeometry(0.07, 0.12, 4);

  _weaponGeoCache = {
    swordBlade,
    swordGuard,
    swordGrip,
    swordPommel,

    greatBlade,
    greatFuller,
    greatGuard,
    greatGrip,
    greatPommel,

    bowGrip,
    bowLimbUpper,
    bowLimbLower,
    bowTipUpper,
    bowTipLower,
    bowString,

    staffShaft,
    staffRing,
    staffCrystal,

    hammerShaft,
    hammerHead,
    hammerRune,
    hammerSpike,
  };

  for (const g of Object.values(_weaponGeoCache)) {
    g.userData = { isShared: true };
  }

  return _weaponGeoCache;
}

function getWeaponMatCache() {
  if (_weaponMatCache) return _weaponMatCache;

  _weaponMatCache = {
    steelMat: new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.35, metalness: 0.8 }),
    steelLightMat: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25, metalness: 0.85 }),
    steelDarkMat: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.5 }),
    basaltMat: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9, metalness: 0.1 }),
    brassGoldMat: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.7 }),
    leatherMat: new THREE.MeshLambertMaterial({ color: 0x5c3317 }),
    leatherRedMat: new THREE.MeshLambertMaterial({ color: 0x991b1b }),
    woodMat: new THREE.MeshLambertMaterial({ color: 0x78350f }),
    runicGreenMat: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5, emissive: 0x064e3b, emissiveIntensity: 0.4 }),
    runicPurpleMat: new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.2, emissive: 0x6b21a8, emissiveIntensity: 0.8 }),
    runicGoldMat: new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, emissive: 0x78350f, emissiveIntensity: 0.6 }),
    stringMat: new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.85 }),
  };

  for (const m of Object.values(_weaponMatCache)) {
    m.userData = { isShared: true };
  }

  return _weaponMatCache;
}

export function disposeWeaponCache() {
  if (_weaponGeoCache) {
    for (const g of Object.values(_weaponGeoCache)) g.dispose?.();
    _weaponGeoCache = null;
  }
  if (_weaponMatCache) {
    for (const m of Object.values(_weaponMatCache)) m.dispose?.();
    _weaponMatCache = null;
  }
}

/**
 * 1. Espada de Explorador (Aventurero)
 */
export function buildAdventurerSwordMesh() {
  const G = getWeaponGeoCache();
  const M = getWeaponMatCache();
  const group = new THREE.Group();
  group.name = 'Weapon_AdventurerSword';

  const blade = new THREE.Mesh(G.swordBlade, M.steelMat);
  blade.position.set(0, 0.36, 0);
  group.add(blade);

  const guard = new THREE.Mesh(G.swordGuard, M.brassGoldMat);
  guard.position.set(0, 0.08, 0);
  group.add(guard);

  const grip = new THREE.Mesh(G.swordGrip, M.leatherMat);
  grip.position.set(0, 0, 0);
  group.add(grip);

  const pommel = new THREE.Mesh(G.swordPommel, M.brassGoldMat);
  pommel.position.set(0, -0.09, 0);
  group.add(pommel);

  return group;
}

/**
 * 2. Mandoble de la Luz (Paladín)
 */
export function buildPaladinGreatswordMesh() {
  const G = getWeaponGeoCache();
  const M = getWeaponMatCache();
  const group = new THREE.Group();
  group.name = 'Weapon_PaladinGreatsword';

  const blade = new THREE.Mesh(G.greatBlade, M.steelLightMat);
  blade.position.set(0, 0.56, 0);
  group.add(blade);

  const fuller = new THREE.Mesh(G.greatFuller, M.brassGoldMat);
  fuller.position.set(0, 0.52, 0);
  group.add(fuller);

  const guard = new THREE.Mesh(G.greatGuard, M.brassGoldMat);
  guard.position.set(0, 0.11, 0);
  group.add(guard);

  const grip = new THREE.Mesh(G.greatGrip, M.leatherRedMat);
  grip.position.set(0, -0.02, 0);
  group.add(grip);

  const pommel = new THREE.Mesh(G.greatPommel, M.brassGoldMat);
  pommel.position.set(0, -0.15, 0);
  group.add(pommel);

  return group;
}

/**
 * 3. Arco Rúnico del Viento (Explorador)
 */
export function buildRangerBowMesh() {
  const G = getWeaponGeoCache();
  const M = getWeaponMatCache();
  const group = new THREE.Group();
  group.name = 'Weapon_RangerBow';

  const grip = new THREE.Mesh(G.bowGrip, M.leatherMat);
  grip.position.set(0, 0, 0.08);
  group.add(grip);

  const limbUpper = new THREE.Mesh(G.bowLimbUpper, M.runicGreenMat);
  limbUpper.position.set(0, 0.22, 0.04);
  limbUpper.rotation.x = -0.24;
  group.add(limbUpper);

  const tipUpper = new THREE.Mesh(G.bowTipUpper, M.woodMat);
  tipUpper.position.set(0, 0.45, -0.04);
  tipUpper.rotation.x = -0.65;
  group.add(tipUpper);

  const limbLower = new THREE.Mesh(G.bowLimbLower, M.runicGreenMat);
  limbLower.position.set(0, -0.22, 0.04);
  limbLower.rotation.x = 0.24;
  group.add(limbLower);

  const tipLower = new THREE.Mesh(G.bowTipLower, M.woodMat);
  tipLower.position.set(0, -0.45, -0.04);
  tipLower.rotation.x = 0.65;
  group.add(tipLower);

  const string = new THREE.Mesh(G.bowString, M.stringMat);
  string.position.set(0, 0, -0.04);
  group.add(string);

  return group;
}

/**
 * 4. Báculo de Rayo Arcano (Hechicero)
 */
export function buildWizardStaffMesh() {
  const G = getWeaponGeoCache();
  const M = getWeaponMatCache();
  const group = new THREE.Group();
  group.name = 'Weapon_WizardStaff';

  const shaft = new THREE.Mesh(G.staffShaft, M.woodMat);
  shaft.position.set(0, 0.20, 0);
  group.add(shaft);

  const ring = new THREE.Mesh(G.staffRing, M.brassGoldMat);
  ring.position.set(0, 0.78, 0);
  group.add(ring);

  const crystal = new THREE.Mesh(G.staffCrystal, M.runicPurpleMat);
  crystal.position.set(0, 0.88, 0);
  crystal.rotation.y = Math.PI / 4;
  crystal.rotation.x = Math.PI / 4;
  group.add(crystal);

  return group;
}

/**
 * 5. Mazo Sísmico de Basalto (Guardián)
 */
export function buildGuardianHammerMesh() {
  const G = getWeaponGeoCache();
  const M = getWeaponMatCache();
  const group = new THREE.Group();
  group.name = 'Weapon_GuardianHammer';

  const shaft = new THREE.Mesh(G.hammerShaft, M.steelDarkMat);
  shaft.position.set(0, 0.12, 0);
  group.add(shaft);

  const head = new THREE.Mesh(G.hammerHead, M.basaltMat);
  head.position.set(0, 0.48, 0);
  group.add(head);

  const rune = new THREE.Mesh(G.hammerRune, M.runicGoldMat);
  rune.position.set(0, 0.48, 0);
  group.add(rune);

  const spike = new THREE.Mesh(G.hammerSpike, M.steelDarkMat);
  spike.position.set(0, 0.48, 0.21);
  spike.rotation.x = Math.PI / 2;
  group.add(spike);

  return group;
}

/**
 * Genera el arma 3D canónica asociada al héroe.
 * @param {string|number} heroIdOrIndex
 * @returns {THREE.Group}
 */
export function buildHeroWeaponMesh(heroIdOrIndex) {
  if (heroIdOrIndex === 1 || heroIdOrIndex === 'paladin') {
    return buildPaladinGreatswordMesh();
  }
  if (heroIdOrIndex === 2 || heroIdOrIndex === 'ranger') {
    return buildRangerBowMesh();
  }
  if (heroIdOrIndex === 3 || heroIdOrIndex === 'wizard') {
    return buildWizardStaffMesh();
  }
  if (heroIdOrIndex === 4 || heroIdOrIndex === 'guardian') {
    return buildGuardianHammerMesh();
  }
  return buildAdventurerSwordMesh();
}
