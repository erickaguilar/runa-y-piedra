// src/render/models/heroes/heroWeapons.js
import * as THREE from 'three';

let _weaponGeoCache = null;
let _weaponMatCache = null;

function getWeaponGeoCache() {
  if (_weaponGeoCache) return _weaponGeoCache;

  // 1. Espada de Explorador (Aventurero)
  const swordBlade = new THREE.BoxGeometry(0.06, 0.54, 0.025);
  const swordBladeTip = new THREE.ConeGeometry(0.042, 0.12, 4);
  const swordFuller = new THREE.BoxGeometry(0.016, 0.44, 0.028);
  const swordCompass = new THREE.OctahedronGeometry(0.032, 0);
  const swordGuard = new THREE.BoxGeometry(0.20, 0.035, 0.048);
  const swordGrip = new THREE.BoxGeometry(0.035, 0.14, 0.035);
  const swordPommel = new THREE.BoxGeometry(0.055, 0.04, 0.045);

  // 2. Mandoble de la Luz (Paladín)
  const greatBlade = new THREE.BoxGeometry(0.12, 0.96, 0.035);
  const greatFuller = new THREE.BoxGeometry(0.035, 0.84, 0.042);
  const greatGuard = new THREE.BoxGeometry(0.34, 0.05, 0.065);
  const greatGrip = new THREE.BoxGeometry(0.04, 0.24, 0.04);
  const greatPommel = new THREE.BoxGeometry(0.07, 0.06, 0.06);
  const greatCrossBoss = new THREE.BoxGeometry(0.08, 0.08, 0.085);
  const greatSolarGem = new THREE.OctahedronGeometry(0.045, 0);
  const greatQuillonTip = new THREE.ConeGeometry(0.032, 0.06, 4);

  // 3. Arco Rúnico del Viento (Explorador)
  const bowGrip = new THREE.BoxGeometry(0.04, 0.14, 0.055);
  const bowRiserPlate = new THREE.BoxGeometry(0.048, 0.08, 0.06);
  const bowWindGem = new THREE.OctahedronGeometry(0.035, 0);
  const bowLimbUpper = new THREE.BoxGeometry(0.035, 0.36, 0.035);
  const bowLimbLower = new THREE.BoxGeometry(0.035, 0.36, 0.035);
  const bowLimbPlate = new THREE.BoxGeometry(0.042, 0.06, 0.042);
  const bowTipUpper = new THREE.BoxGeometry(0.03, 0.18, 0.03);
  const bowTipLower = new THREE.BoxGeometry(0.03, 0.18, 0.03);
  const bowString = new THREE.CylinderGeometry(0.005, 0.005, 0.98, 4);
  const bowArrowShaft = new THREE.CylinderGeometry(0.007, 0.007, 0.58, 4);
  const bowArrowTip = new THREE.ConeGeometry(0.018, 0.06, 4);
  const bowArrowFletch = new THREE.BoxGeometry(0.028, 0.08, 0.004);

  // 4. Báculo de Rayo Arcano (Hechicero)
  const staffShaft = new THREE.CylinderGeometry(0.022, 0.022, 1.15, 6);
  const staffGripWrap = new THREE.CylinderGeometry(0.026, 0.026, 0.28, 6);
  const staffPommel = new THREE.CylinderGeometry(0.038, 0.045, 0.06, 6);
  const staffBaseGem = new THREE.OctahedronGeometry(0.035, 0);
  const staffCollar = new THREE.BoxGeometry(0.07, 0.035, 0.07);
  const staffCrownProng = new THREE.BoxGeometry(0.016, 0.15, 0.016);
  const staffRing = new THREE.CylinderGeometry(0.052, 0.052, 0.035, 6);
  const staffCrystal = new THREE.OctahedronGeometry(0.095, 0);
  const staffCrystalCore = new THREE.OctahedronGeometry(0.05, 0);
  const staffOrbitalRing = new THREE.TorusGeometry(0.125, 0.009, 4, 12);

  // 5. Mazo Sísmico de Basalto (Guardián)
  const hammerShaft = new THREE.CylinderGeometry(0.03, 0.03, 0.76, 6);
  const hammerGripWrap = new THREE.CylinderGeometry(0.034, 0.034, 0.30, 6);
  const hammerPommel = new THREE.CylinderGeometry(0.045, 0.05, 0.07, 6);
  const hammerCollar = new THREE.BoxGeometry(0.10, 0.05, 0.10);
  const hammerHead = new THREE.BoxGeometry(0.22, 0.20, 0.30);
  const hammerFaceFront = new THREE.BoxGeometry(0.24, 0.22, 0.04);
  const hammerRune = new THREE.BoxGeometry(0.23, 0.14, 0.18);
  const hammerSpike = new THREE.ConeGeometry(0.07, 0.12, 4);
  const hammerTopSpike = new THREE.ConeGeometry(0.055, 0.10, 4);

  _weaponGeoCache = {
    swordBlade, swordBladeTip, swordFuller, swordCompass, swordGuard, swordGrip, swordPommel,
    greatBlade, greatFuller, greatGuard, greatGrip, greatPommel, greatCrossBoss, greatSolarGem, greatQuillonTip,
    bowGrip, bowRiserPlate, bowWindGem, bowLimbUpper, bowLimbLower, bowLimbPlate, bowTipUpper, bowTipLower, bowString, bowArrowShaft, bowArrowTip, bowArrowFletch,
    staffShaft, staffGripWrap, staffPommel, staffBaseGem, staffCollar, staffCrownProng, staffRing, staffCrystal, staffCrystalCore, staffOrbitalRing,
    hammerShaft, hammerGripWrap, hammerPommel, hammerCollar, hammerHead, hammerFaceFront, hammerRune, hammerSpike, hammerTopSpike,
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
    holyGoldBrightMat: new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.2, emissive: 0xfacc15, emissiveIntensity: 0.8 }),
    runicBlueBrightMat: new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.1, emissive: 0x0284c7, emissiveIntensity: 1.2 }),
    compassCoreMat: new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.2, emissive: 0x0369a1, emissiveIntensity: 1.0 }),
    leatherMat: new THREE.MeshLambertMaterial({ color: 0x5c3317 }),
    leatherRedMat: new THREE.MeshLambertMaterial({ color: 0x991b1b }),
    woodMat: new THREE.MeshLambertMaterial({ color: 0x78350f }),
    runicGreenMat: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5, emissive: 0x064e3b, emissiveIntensity: 0.4 }),
    runicGreenBrightMat: new THREE.MeshStandardMaterial({ color: 0x6ee7b7, roughness: 0.2, emissive: 0x10b981, emissiveIntensity: 1.2 }),
    arrowWoodMat: new THREE.MeshLambertMaterial({ color: 0xd9b48a }),
    fletchRedMat: new THREE.MeshLambertMaterial({ color: 0xb91c1c }),
    runicPurpleMat: new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.2, emissive: 0x6b21a8, emissiveIntensity: 0.8 }),
    runicPurpleBrightMat: new THREE.MeshStandardMaterial({ color: 0xf3e8ff, roughness: 0.1, emissive: 0xc084fc, emissiveIntensity: 1.5 }),
    arcaneWoodMat: new THREE.MeshLambertMaterial({ color: 0x3b1d11 }),
    velvetVioletMat: new THREE.MeshLambertMaterial({ color: 0x4c1d95 }),
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

  // Hoja ligera de acero templado
  const blade = new THREE.Mesh(G.swordBlade, M.steelLightMat);
  blade.position.set(0, 0.34, 0);
  group.add(blade);

  // Acanaladura central
  const fuller = new THREE.Mesh(G.swordFuller, M.brassGoldMat);
  fuller.position.set(0, 0.32, 0);
  group.add(fuller);

  // Punta de Hoja biselada (bonificación por distancia sweet spot)
  const tip = new THREE.Mesh(G.swordBladeTip, M.runicBlueBrightMat);
  tip.name = 'AdventurerBladeTip';
  tip.position.set(0, 0.64, 0);
  group.add(tip);

  // Cruceta de expedición con gavilanes
  const guard = new THREE.Mesh(G.swordGuard, M.brassGoldMat);
  guard.position.set(0, 0.08, 0);
  group.add(guard);

  // Micro-brújula rúnica en el centro de la cruz
  const compass = new THREE.Mesh(G.swordCompass, M.compassCoreMat);
  compass.name = 'AdventurerCompassCore';
  compass.position.set(0, 0.08, 0.026);
  group.add(compass);

  // Empuñadura forrada en cuero
  const grip = new THREE.Mesh(G.swordGrip, M.leatherMat);
  grip.position.set(0, 0, 0);
  group.add(grip);

  // Pomo contrapeso de bronce
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

  // Hoja ancha de acero templado radiante
  const blade = new THREE.Mesh(G.greatBlade, M.steelLightMat);
  blade.position.set(0, 0.58, 0);
  group.add(blade);

  // Acanaladura sagrada central grabada
  const fuller = new THREE.Mesh(G.greatFuller, M.brassGoldMat);
  fuller.name = 'PaladinBladeFuller';
  fuller.position.set(0, 0.54, 0);
  group.add(fuller);

  // Cruceta masiva de oro sacro
  const guard = new THREE.Mesh(G.greatGuard, M.brassGoldMat);
  guard.position.set(0, 0.11, 0);
  group.add(guard);

  // Gavilanes laterales en punta (quillons)
  const quillonL = new THREE.Mesh(G.greatQuillonTip, M.brassGoldMat);
  quillonL.position.set(-0.19, 0.11, 0);
  quillonL.rotation.z = Math.PI / 2;
  group.add(quillonL);

  const quillonR = new THREE.Mesh(G.greatQuillonTip, M.brassGoldMat);
  quillonR.position.set(0.19, 0.11, 0);
  quillonR.rotation.z = -Math.PI / 2;
  group.add(quillonR);

  // Umbo central en la cruz de la guarda
  const boss = new THREE.Mesh(G.greatCrossBoss, M.brassGoldMat);
  boss.position.set(0, 0.11, 0);
  group.add(boss);

  // Núcleo Solar Sagrado incrustado en el centro de la cruz
  const gem = new THREE.Mesh(G.greatSolarGem, M.holyGoldBrightMat);
  gem.name = 'PaladinHolyCore';
  gem.position.set(0, 0.11, 0.035);
  group.add(gem);

  // Empuñadura bimano forrada en cuero rojo carmesí
  const grip = new THREE.Mesh(G.greatGrip, M.leatherRedMat);
  grip.position.set(0, -0.03, 0);
  group.add(grip);

  // Pomo contrapeso dorado
  const pommel = new THREE.Mesh(G.greatPommel, M.brassGoldMat);
  pommel.position.set(0, -0.17, 0);
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

  // Empuñadura central de cuero de arquero con reposaflechas
  const grip = new THREE.Mesh(G.bowGrip, M.leatherMat);
  grip.position.set(0, 0, 0.08);
  group.add(grip);

  // Placas de refuerzo áureas en la montura central
  const plate = new THREE.Mesh(G.bowRiserPlate, M.brassGoldMat);
  plate.position.set(0, 0, 0.08);
  group.add(plate);

  // Gema Rúnica del Viento incrustada en el núcleo del arco
  const gem = new THREE.Mesh(G.bowWindGem, M.runicGreenBrightMat);
  gem.name = 'RangerWindGem';
  gem.position.set(0, 0, 0.115);
  group.add(gem);

  // Pala superior esmeralda con placa de refuerzo dorada
  const limbUpper = new THREE.Mesh(G.bowLimbUpper, M.runicGreenMat);
  limbUpper.position.set(0, 0.22, 0.04);
  limbUpper.rotation.x = -0.24;
  group.add(limbUpper);

  const plateUpper = new THREE.Mesh(G.bowLimbPlate, M.brassGoldMat);
  plateUpper.position.set(0, 0.10, 0.065);
  group.add(plateUpper);

  const tipUpper = new THREE.Mesh(G.bowTipUpper, M.woodMat);
  tipUpper.position.set(0, 0.45, -0.04);
  tipUpper.rotation.x = -0.65;
  group.add(tipUpper);

  // Pala inferior esmeralda con placa de refuerzo dorada
  const limbLower = new THREE.Mesh(G.bowLimbLower, M.runicGreenMat);
  limbLower.position.set(0, -0.22, 0.04);
  limbLower.rotation.x = 0.24;
  group.add(limbLower);

  const plateLower = new THREE.Mesh(G.bowLimbPlate, M.brassGoldMat);
  plateLower.position.set(0, -0.10, 0.065);
  group.add(plateLower);

  const tipLower = new THREE.Mesh(G.bowTipLower, M.woodMat);
  tipLower.position.set(0, -0.45, -0.04);
  tipLower.rotation.x = 0.65;
  group.add(tipLower);

  // Cuerda de seda rúnica plateada
  const string = new THREE.Mesh(G.bowString, M.stringMat);
  string.name = 'RangerBowString';
  string.position.set(0, 0, -0.04);
  group.add(string);

  // Flecha rúnica montada en el reposaflechas lista para disparar
  const arrowGroup = new THREE.Group();
  arrowGroup.name = 'RangerArrow';
  arrowGroup.position.set(0, 0.02, 0.08);

  const shaft = new THREE.Mesh(G.bowArrowShaft, M.arrowWoodMat);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.set(0, 0, 0.12);
  arrowGroup.add(shaft);

  const arrowTip = new THREE.Mesh(G.bowArrowTip, M.steelLightMat);
  arrowTip.rotation.x = Math.PI / 2;
  arrowTip.position.set(0, 0, 0.43);
  arrowGroup.add(arrowTip);

  const fletch1 = new THREE.Mesh(G.bowArrowFletch, M.fletchRedMat);
  fletch1.position.set(0, 0.015, -0.12);
  arrowGroup.add(fletch1);

  const fletch2 = new THREE.Mesh(G.bowArrowFletch, M.runicGreenMat);
  fletch2.rotation.z = Math.PI / 2;
  fletch2.position.set(0.015, 0, -0.12);
  arrowGroup.add(fletch2);

  group.add(arrowGroup);

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

  // Asta de madera arcana oscura pulida
  const shaft = new THREE.Mesh(G.staffShaft, M.arcaneWoodMat);
  shaft.name = 'WizardStaffShaft';
  shaft.position.set(0, 0.20, 0);
  group.add(shaft);

  // Empuñadura forrada en terciopelo violeta místico
  const grip = new THREE.Mesh(G.staffGripWrap, M.velvetVioletMat);
  grip.position.set(0, 0.05, 0);
  group.add(grip);

  // Contera / pomo dorado contrapeso inferior
  const pommel = new THREE.Mesh(G.staffPommel, M.brassGoldMat);
  pommel.position.set(0, -0.37, 0);
  group.add(pommel);

  // Gema amatista inferior en el pomo
  const baseGem = new THREE.Mesh(G.staffBaseGem, M.runicPurpleMat);
  baseGem.position.set(0, -0.42, 0);
  group.add(baseGem);

  // Collarín dorado bajo la corona
  const collar = new THREE.Mesh(G.staffCollar, M.brassGoldMat);
  collar.position.set(0, 0.74, 0);
  group.add(collar);

  // Anillo de resonancia principal
  const ring = new THREE.Mesh(G.staffRing, M.brassGoldMat);
  ring.position.set(0, 0.78, 0);
  group.add(ring);

  // Corona de 4 garras arcanas ascendentes que enmarcan el cristal
  const prongOffsets = [
    { x: 0.045, z: 0, rotZ: -0.18 },
    { x: -0.045, z: 0, rotZ: 0.18 },
    { x: 0, z: 0.045, rotX: 0.18 },
    { x: 0, z: -0.045, rotX: -0.18 },
  ];
  for (let i = 0; i < prongOffsets.length; i++) {
    const p = prongOffsets[i];
    const prong = new THREE.Mesh(G.staffCrownProng, M.brassGoldMat);
    prong.position.set(p.x, 0.84, p.z);
    if (p.rotZ) prong.rotation.z = p.rotZ;
    if (p.rotX) prong.rotation.x = p.rotX;
    group.add(prong);
  }

  // Cristal amatista principal levitante
  const crystal = new THREE.Mesh(G.staffCrystal, M.runicPurpleMat);
  crystal.name = 'WizardArcaneCrystal';
  crystal.position.set(0, 0.89, 0);
  crystal.rotation.y = Math.PI / 4;
  crystal.rotation.x = Math.PI / 4;
  group.add(crystal);

  // Núcleo de plasma arcano hiper-luminoso interior
  const core = new THREE.Mesh(G.staffCrystalCore, M.runicPurpleBrightMat);
  core.name = 'WizardArcaneCore';
  core.position.set(0, 0.89, 0);
  group.add(core);

  // Anillo orbital de plasma que rota alrededor del cristal
  const orbitalRing = new THREE.Mesh(G.staffOrbitalRing, M.runicPurpleMat);
  orbitalRing.name = 'WizardOrbitalRing';
  orbitalRing.position.set(0, 0.89, 0);
  orbitalRing.rotation.x = Math.PI / 3;
  group.add(orbitalRing);

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

  // Mango de acero oscuro
  const shaft = new THREE.Mesh(G.hammerShaft, M.steelDarkMat);
  shaft.position.set(0, 0.12, 0);
  group.add(shaft);

  // Agarre forrado en cuero
  const wrap = new THREE.Mesh(G.hammerGripWrap, M.leatherMat);
  wrap.position.set(0, -0.05, 0);
  group.add(wrap);

  // Pomo contrapeso dorado
  const pommel = new THREE.Mesh(G.hammerPommel, M.brassGoldMat);
  pommel.position.set(0, -0.24, 0);
  group.add(pommel);

  // Collarín metálico bajo el cabezal
  const collar = new THREE.Mesh(G.hammerCollar, M.brassGoldMat);
  collar.position.set(0, 0.36, 0);
  group.add(collar);

  // Bloque principal de basalto
  const head = new THREE.Mesh(G.hammerHead, M.basaltMat);
  head.position.set(0, 0.48, 0);
  group.add(head);

  // Caras de choque de acero frontal y posterior
  const faceF = new THREE.Mesh(G.hammerFaceFront, M.steelMat);
  faceF.position.set(0, 0.48, 0.16);
  group.add(faceF);

  const faceB = new THREE.Mesh(G.hammerFaceFront, M.steelMat);
  faceB.position.set(0, 0.48, -0.16);
  group.add(faceB);

  // Núcleo rúnico telúrico
  const rune = new THREE.Mesh(G.hammerRune, M.runicGoldMat);
  rune.name = 'GuardianRunicCore';
  rune.position.set(0, 0.48, 0);
  group.add(rune);

  // Púa frontal
  const spike = new THREE.Mesh(G.hammerSpike, M.steelDarkMat);
  spike.position.set(0, 0.48, 0.22);
  spike.rotation.x = Math.PI / 2;
  group.add(spike);

  // Púa superior
  const topSpike = new THREE.Mesh(G.hammerTopSpike, M.brassGoldMat);
  topSpike.position.set(0, 0.63, 0);
  group.add(topSpike);

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
