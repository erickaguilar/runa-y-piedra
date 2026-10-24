// src/render/models/heroes/heroArms.js
import * as THREE from 'three';

const HERO_COLORS = {
  adventurer: 0x38bdf8,
  paladin: 0xf43f5e,
  ranger: 0x10b981,
  wizard: 0xa855f7,
  guardian: 0xfbbf24,
};

export const FP_CONFIGS = {
  adventurer: { pos: [0.26, -0.22, -0.46], rot: [-0.65, -0.20, 0.10], scale: 0.65 },
  paladin:    { pos: [0.28, -0.24, -0.50], rot: [-0.60, -0.22, 0.08], scale: 0.58 },
  ranger:     { pos: [0.24, -0.20, -0.44], rot: [-0.15, Math.PI - 0.20, 0.15], scale: 0.62 },
  wizard:     { pos: [0.28, -0.26, -0.48], rot: [-0.55, -0.18, 0.06], scale: 0.55 },
  guardian:   { pos: [0.24, -0.25, -0.47], rot: [-0.54, -0.25, 0.12], scale: 0.63 },
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

    // Complementos para el arquero forestal (Explorador)
    const rangerBracer = new THREE.BoxGeometry(0.092, 0.16, 0.035);
    const rangerBuckle = new THREE.BoxGeometry(0.096, 0.035, 0.04);
    const rangerDrawHand = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const rangerDrawArm = new THREE.BoxGeometry(0.08, 0.22, 0.08);

    // Complementos para el paladín (Caballero de la Luz)
    const paladinKnuckles = new THREE.BoxGeometry(0.092, 0.025, 0.095);
    const paladinVambrace = new THREE.BoxGeometry(0.098, 0.18, 0.038);
    const paladinLeftHand = new THREE.BoxGeometry(0.088, 0.08, 0.088);
    const paladinLeftForearm = new THREE.BoxGeometry(0.082, 0.24, 0.082);

    // Complementos para el aventurero explorador
    const advBracer = new THREE.BoxGeometry(0.092, 0.16, 0.035);
    const advStrap = new THREE.BoxGeometry(0.096, 0.03, 0.04);
    const advLeftHand = new THREE.BoxGeometry(0.08, 0.075, 0.08);
    const advLeftForearm = new THREE.BoxGeometry(0.08, 0.22, 0.08);

    forearm.userData = { isShared: true };
    hand.userData = { isShared: true };
    vambrace.userData = { isShared: true };
    leftHand.userData = { isShared: true };
    leftForearm.userData = { isShared: true };
    wizardCuff.userData = { isShared: true };
    wizardBracelet.userData = { isShared: true };
    wizardLeftHand.userData = { isShared: true };
    wizardLeftForearm.userData = { isShared: true };
    rangerBracer.userData = { isShared: true };
    rangerBuckle.userData = { isShared: true };
    rangerDrawHand.userData = { isShared: true };
    rangerDrawArm.userData = { isShared: true };
    paladinKnuckles.userData = { isShared: true };
    paladinVambrace.userData = { isShared: true };
    paladinLeftHand.userData = { isShared: true };
    paladinLeftForearm.userData = { isShared: true };
    advBracer.userData = { isShared: true };
    advStrap.userData = { isShared: true };
    advLeftHand.userData = { isShared: true };
    advLeftForearm.userData = { isShared: true };

    _sharedArmGeo = {
      forearm, hand, vambrace, leftHand, leftForearm,
      wizardCuff, wizardBracelet, wizardLeftHand, wizardLeftForearm,
      rangerBracer, rangerBuckle, rangerDrawHand, rangerDrawArm,
      paladinKnuckles, paladinVambrace, paladinLeftHand, paladinLeftForearm,
      advBracer, advStrap, advLeftHand, advLeftForearm,
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
  const leatherMat = new THREE.MeshLambertMaterial({ color: 0x4a2e18 });

  sleeveMat.userData = { isShared: true };
  handMat.userData = { isShared: true };
  goldMat.userData = { isShared: true };
  darkRobeMat.userData = { isShared: true };
  leatherMat.userData = { isShared: true };

  const mats = { sleeveMat, handMat, goldMat, darkRobeMat, leatherMat };
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

  if (heroKey === 'paladin') {
    // Guantelete de placas con nudillera dorada
    const knuckles = setupOverlayMesh(new THREE.Mesh(G.paladinKnuckles, M.goldMat));
    knuckles.name = 'PaladinKnuckles';
    knuckles.position.set(0, grip.gripY + 0.035, 0.01);
    armGroup.add(knuckles);

    // Brazal de placas sobre el antebrazo derecho
    const plate = setupOverlayMesh(new THREE.Mesh(G.paladinVambrace, M.handMat));
    plate.name = 'PaladinVambrace';
    plate.position.set(0.06, grip.gripY - 0.15, 0.18);
    plate.rotation.set(grip.armRotX, 0, grip.armRotZ);
    armGroup.add(plate);

    // Mano izquierda en agarre inferior bimanual del mandoble
    const lHand = setupOverlayMesh(new THREE.Mesh(G.paladinLeftHand, M.handMat));
    lHand.name = 'PaladinLeftHand';
    lHand.position.set(-0.01, grip.gripY - 0.12, 0.01);
    armGroup.add(lHand);

    // Antebrazo izquierdo con guantelete y manga carmesí
    const lArm = setupOverlayMesh(new THREE.Mesh(G.paladinLeftForearm, M.sleeveMat));
    lArm.name = 'PaladinLeftArm';
    lArm.position.set(-0.07, grip.gripY - 0.24, 0.14);
    lArm.rotation.set(-0.45, 0.18, -0.28);
    armGroup.add(lArm);
  } else if (heroKey === 'guardian') {
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
  } else if (heroKey === 'ranger') {
    // Brazalete de cuero de arquero (arm guard) sobre el antebrazo izquierdo
    const bracer = setupOverlayMesh(new THREE.Mesh(G.rangerBracer, M.leatherMat));
    bracer.name = 'RangerArmGuard';
    bracer.position.set(0.06, grip.gripY - 0.16, 0.16);
    bracer.rotation.set(grip.armRotX, 0, grip.armRotZ);
    armGroup.add(bracer);

    // Hebilla dorada del brazalete
    const buckle = setupOverlayMesh(new THREE.Mesh(G.rangerBuckle, M.goldMat));
    buckle.name = 'RangerBracerBuckle';
    buckle.position.set(0.06, grip.gripY - 0.16, 0.19);
    buckle.rotation.set(grip.armRotX, 0, grip.armRotZ);
    armGroup.add(buckle);

    // Mano derecha de tensado (draw hand) lista en la cuerda
    const drawHand = setupOverlayMesh(new THREE.Mesh(G.rangerDrawHand, M.leatherMat));
    drawHand.name = 'RangerDrawHand';
    drawHand.position.set(0.02, grip.gripY - 0.04, -0.07);
    armGroup.add(drawHand);

    // Antebrazo de tensado con manga verde
    const drawArm = setupOverlayMesh(new THREE.Mesh(G.rangerDrawArm, M.sleeveMat));
    drawArm.name = 'RangerDrawArm';
    drawArm.position.set(0.08, grip.gripY - 0.18, -0.15);
    drawArm.rotation.set(-0.70, 0.15, 0.40);
    armGroup.add(drawArm);
  } else if (heroKey === 'adventurer') {
    // Protector de antebrazo de explorador en cuero curtido
    const bracer = setupOverlayMesh(new THREE.Mesh(G.advBracer, M.leatherMat));
    bracer.name = 'AdventurerBracer';
    bracer.position.set(0.06, grip.gripY - 0.16, 0.16);
    bracer.rotation.set(grip.armRotX, 0, grip.armRotZ);
    armGroup.add(bracer);

    // Correa de sujeción y broche de expedición
    const strap = setupOverlayMesh(new THREE.Mesh(G.advStrap, M.goldMat));
    strap.name = 'AdventurerStrap';
    strap.position.set(0.06, grip.gripY - 0.16, 0.18);
    strap.rotation.set(grip.armRotX, 0, grip.armRotZ);
    armGroup.add(strap);

    // Mano izquierda de equilibrio táctico de explorador
    const lHand = setupOverlayMesh(new THREE.Mesh(G.advLeftHand, M.handMat));
    lHand.name = 'AdventurerLeftHand';
    lHand.position.set(-0.10, grip.gripY - 0.14, 0.08);
    lHand.rotation.set(-0.35, 0.20, -0.22);
    armGroup.add(lHand);

    // Antebrazo izquierdo con manga celeste
    const lArm = setupOverlayMesh(new THREE.Mesh(G.advLeftForearm, M.sleeveMat));
    lArm.name = 'AdventurerLeftArm';
    lArm.position.set(-0.15, grip.gripY - 0.26, 0.16);
    lArm.rotation.set(-0.45, 0.25, -0.30);
    armGroup.add(lArm);
  }

  return armGroup;
}
