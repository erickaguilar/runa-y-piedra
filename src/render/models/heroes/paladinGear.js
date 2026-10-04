// src/render/models/heroes/paladinGear.js
import * as THREE from 'three';

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
  const steelMat     = new THREE.MeshLambertMaterial({ color: 0xb8bcc4 });
  const steelDarkMat = new THREE.MeshLambertMaterial({ color: 0x7a7f88 });
  const goldMat      = new THREE.MeshLambertMaterial({ color: 0xd4af37, emissive: 0x473b13, emissiveIntensity: 0.25 });
  const redMat       = new THREE.MeshLambertMaterial({ color: 0xa01828 });

  // ═══════════════════════════════════════════════════════════
  // 1. YELMO — Casco envolvente anclado a la cabeza
  //    Cabeza centrada en y = 1.63, dimensiones 0.40 x 0.40 x 0.40
  // ═══════════════════════════════════════════════════════════
  const helm = new THREE.Group();

  // Corona superior (cubre el techo de la cabeza)
  const helmTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.10, 0.44),
    steelMat
  );
  helmTop.position.set(0, 0.20, 0);
  helm.add(helmTop);

  // Nuca (cubre la parte trasera)
  const helmBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.34, 0.06),
    steelMat
  );
  helmBack.position.set(0, 0.05, -0.19);
  helm.add(helmBack);

  // Laterales (cubren orejas y sienes)
  const helmSideL = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.30, 0.38),
    steelMat
  );
  helmSideL.position.set(-0.20, 0.06, 0);
  helm.add(helmSideL);

  const helmSideR = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.30, 0.38),
    steelMat
  );
  helmSideR.position.set(0.20, 0.06, 0);
  helm.add(helmSideR);

  // Banda frontal (visor abierto por encima de los ojos)
  const helmBrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.08, 0.06),
    steelMat
  );
  helmBrow.position.set(0, 0.14, 0.19);
  helm.add(helmBrow);

  // Ribete dorado sobre la banda frontal
  const helmBrowGold = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.025, 0.06),
    goldMat
  );
  helmBrowGold.position.set(0, 0.18, 0.19);
  helm.add(helmBrowGold);

  // Base de la cresta (soporte dorado)
  const crestBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.04, 0.34),
    goldMat
  );
  crestBase.position.set(0, 0.24, -0.02);
  helm.add(crestBase);

  // Cresta de pluma roja — baja y ancha
  const crest = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.16, 0.32),
    redMat
  );
  crest.position.set(0, 0.32, -0.02);
  helm.add(crest);

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

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.26), steelMat);
    pGroup.add(body);

    const rim = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.28), goldMat);
    rim.position.set(0, -0.06, 0);
    pGroup.add(rim);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.10, 0.28), steelDarkMat);
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

  // Tabla central
  const shieldBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.42, 0.06),
    steelMat
  );
  shieldGroup.add(shieldBody);

  // Marco exterior dorado
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.07), goldMat);
  frameTop.position.set(0, 0.20, 0);
  shieldGroup.add(frameTop);

  const frameBot = frameTop.clone();
  frameBot.position.y = -0.20;
  shieldGroup.add(frameBot);

  const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.07), goldMat);
  frameL.position.set(-0.15, 0, 0);
  shieldGroup.add(frameL);

  const frameR = frameL.clone();
  frameR.position.x = 0.15;
  shieldGroup.add(frameR);

  // Umbo central dorado
  const boss = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.10, 0.09),
    goldMat
  );
  boss.position.set(0, 0, 0.01);
  shieldGroup.add(boss);

  // Emblema sagrado: cruz dorada sobre la cara del escudo
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.02), goldMat);
  crossH.position.set(0, -0.08, 0.04);
  shieldGroup.add(crossH);

  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.02), goldMat);
  crossV.position.set(0, -0.08, 0.04);
  shieldGroup.add(crossV);

  if (a.parts?.armLPivot) {
    add(shieldGroup, a.parts.armLPivot);
  } else {
    shieldGroup.position.set(-0.36, 0.91, 0.14);
    add(shieldGroup, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 4. PECHERA — Emblema de cruz dorada sobre el torso
  //    Torso centrado en y = 1.13, frente en z = +0.16
  // ═══════════════════════════════════════════════════════════
  const chestCrossH = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.04, 0.02),
    goldMat
  );
  chestCrossH.position.set(0, 1.20, 0.17);
  add(chestCrossH, a.gear);

  const chestCrossV = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.16, 0.02),
    goldMat
  );
  chestCrossV.position.set(0, 1.20, 0.17);
  add(chestCrossV, a.gear);

  // ═══════════════════════════════════════════════════════════
  // 5. CINTURÓN — Hebilla dorada
  // ═══════════════════════════════════════════════════════════
  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.06, 0.02),
    goldMat
  );
  buckle.position.set(0, 0.84, 0.18);
  add(buckle, a.gear);

  return [steelMat, steelDarkMat, goldMat, redMat];
}
