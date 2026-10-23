// src/render/models/heroes/heroArms.js
import * as THREE from 'three';

const HERO_COLORS = {
  adventurer: 0x38bdf8,
  paladin: 0xf43f5e,
  ranger: 0x10b981,
  wizard: 0xa855f7,
  guardian: 0xfbbf24,
};

const GRIP_OFFSETS = {
  adventurer: { gripY: -0.09, armRotX: -0.55, armRotZ: 0.25 },
  paladin:    { gripY: -0.15, armRotX: -0.55, armRotZ: 0.22 },
  ranger:     { gripY:  0.00, armRotX: -0.40, armRotZ: 0.20 },
  wizard:     { gripY:  0.20, armRotX: -0.50, armRotZ: 0.18 },
  guardian:   { gripY:  0.08, armRotX: -0.55, armRotZ: 0.22 },
};

let _sharedArmGeo = null;

export function getArmGeometries() {
  if (!_sharedArmGeo) {
    const forearm = new THREE.BoxGeometry(0.08, 0.30, 0.08);
    const hand = new THREE.BoxGeometry(0.09, 0.08, 0.09);
    const vambrace = new THREE.BoxGeometry(0.095, 0.18, 0.035);
    const leftHand = new THREE.BoxGeometry(0.085, 0.08, 0.085);
    const leftForearm = new THREE.BoxGeometry(0.08, 0.24, 0.08);

    // Complementos para la túnica y canalización del Hechicero
    const wizardCuff = new THREE.BoxGeometry(0.105, 0.14, 0.105);
    const wizardBracelet = new THREE.BoxGeometry(0.098, 0.03, 0.098);
    const wizardLeftHand = new THREE.BoxGeometry(0.08, 0.075, 0.08);
    const wizardLeftForearm = new THREE.BoxGeometry(0.085, 0.22, 0.085);

    forearm.userData = { isShared: true };
    hand.userData = { isShared: true };
    vambrace.userData = { isShared: true };
    leftHand.userData = { isShared: true };
    leftForearm.userData = { isShared: true };
    wizardCuff.userData = { isShared: true };
    wizardBracelet.userData = { isShared: true };
    wizardLeftHand.userData = { isShared: true };
    wizardLeftForearm.userData = { isShared: true };

    _sharedArmGeo = {
      forearm,
      hand,
      vambrace,
      leftHand,
      leftForearm,
      wizardCuff,
      wizardBracelet,
      wizardLeftHand,
      wizardLeftForearm,
    };
  }
  return _sharedArmGeo;
}

const _armMatCache = new Map();

export function getArmMaterials(heroKey) {
  if (_armMatCache.has(heroKey)) return _armMatCache.get(heroKey);
  const colorHex = HERO_COLORS[heroKey] || HERO_COLORS.adventurer;
  const sleeveMat = new THREE.MeshLambertMaterial({ color: colorHex });
  const handColor = (heroKey === 'paladin' || heroKey === 'guardian') ? 0x64748b : 0xd9b48a;
  const handMat = new THREE.MeshLambertMaterial({ color: handColor });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.75 });
  const darkRobeMat = new THREE.MeshLambertMaterial({ color: 0x581c87 });

  sleeveMat.userData = { isShared: true };
  handMat.userData = { isShared: true };
  goldMat.userData = { isShared: true };
  darkRobeMat.userData = { isShared: true };

  const mats = { sleeveMat, handMat, goldMat, darkRobeMat };
  _armMatCache.set(heroKey, mats);
  return mats;
}

export function disposeArmCache() {
  if (_sharedArmGeo) {
    for (const g of Object.values(_sharedArmGeo)) g.dispose?.();
    _sharedArmGeo = null;
  }
  for (const mats of _armMatCache.values()) {
    for (const m of Object.values(mats)) m.dispose?.();
  }
  _armMatCache.clear();
}

export function setupOverlayMesh(mesh) {
  mesh.frustumCulled = false;
  mesh.renderOrder = 9999;
  mesh.onBeforeRender = (renderer) => renderer.clearDepth?.();
  return mesh;
}

/**
 * Construye el ensamble de brazo, guanteletes y túnica en primera persona del héroe.
 * @param {string} heroKey
 * @returns {THREE.Group}
 */
export function buildHeroArmMesh(heroKey) {
  const G = getArmGeometries();
  const M = getArmMaterials(heroKey);
  const armGroup = new THREE.Group();
  armGroup.name = `Arm_${heroKey}`;
  const grip = GRIP_OFFSETS[heroKey] || GRIP_OFFSETS.adventurer;

  // Mano derecha empuñando el arma principal
  const handMesh = setupOverlayMesh(new THREE.Mesh(G.hand, M.handMat));
  handMesh.position.set(0, grip.gripY, 0);
  armGroup.add(handMesh);

  // Antebrazo derecho
  const forearmMesh = setupOverlayMesh(new THREE.Mesh(G.forearm, M.sleeveMat));
  forearmMesh.position.set(0.06, grip.gripY - 0.18, 0.14);
  forearmMesh.rotation.set(grip.armRotX, 0, grip.armRotZ);
  armGroup.add(forearmMesh);

  if (heroKey === 'guardian') {
    const plate = setupOverlayMesh(new THREE.Mesh(G.vambrace, M.handMat));
    plate.position.set(0.06, grip.gripY - 0.15, 0.19);
    plate.rotation.set(grip.armRotX, 0, grip.armRotZ);
    armGroup.add(plate);

    const lHand = setupOverlayMesh(new THREE.Mesh(G.leftHand, M.handMat));
    lHand.position.set(-0.02, grip.gripY - 0.20, 0.02);
    armGroup.add(lHand);

    const lArm = setupOverlayMesh(new THREE.Mesh(G.leftForearm, M.sleeveMat));
    lArm.position.set(-0.09, grip.gripY - 0.32, 0.15);
    lArm.rotation.set(-0.40, 0.20, -0.35);
    armGroup.add(lArm);
  } else if (heroKey === 'wizard') {
    // Bocamanga acampanada de túnica mística
    const cuff = setupOverlayMesh(new THREE.Mesh(G.wizardCuff, M.darkRobeMat));
    cuff.name = 'WizardRobeCuff';
    cuff.position.set(0.06, grip.gripY - 0.16, 0.15);
    cuff.rotation.set(grip.armRotX, 0, grip.armRotZ);
    armGroup.add(cuff);

    // Brazalete rúnico dorado en la muñeca
    const bracelet = setupOverlayMesh(new THREE.Mesh(G.wizardBracelet, M.goldMat));
    bracelet.name = 'WizardArcaneBracelet';
    bracelet.position.set(0.03, grip.gripY - 0.05, 0.05);
    bracelet.rotation.set(grip.armRotX, 0, grip.armRotZ);
    armGroup.add(bracelet);

    // Mano izquierda mágica de canalización
    const lHand = setupOverlayMesh(new THREE.Mesh(G.wizardLeftHand, M.handMat));
    lHand.name = 'WizardLeftHand';
    lHand.position.set(-0.14, grip.gripY - 0.14, 0.06);
    lHand.rotation.set(-0.35, 0.30, -0.20);
    armGroup.add(lHand);

    // Antebrazo izquierdo con manga violeta
    const lArm = setupOverlayMesh(new THREE.Mesh(G.wizardLeftForearm, M.sleeveMat));
    lArm.name = 'WizardLeftArm';
    lArm.position.set(-0.19, grip.gripY - 0.26, 0.16);
    lArm.rotation.set(-0.45, 0.35, -0.30);
    armGroup.add(lArm);
  }

  return armGroup;
}
