// src/render/models/heroes/rangerGear.js
import * as THREE from 'three';

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
  // Paleta de materiales de Explorador
  const hoodMat      = new THREE.MeshLambertMaterial({ color: 0x2a5a3a }); // Verde bosque
  const hoodDarkMat  = new THREE.MeshLambertMaterial({ color: 0x1a3d26 }); // Verde sombra profundo
  const cloakMat     = new THREE.MeshLambertMaterial({ color: 0x2f6b42 }); // Verde medio de capa
  const leatherMat   = new THREE.MeshLambertMaterial({ color: 0x4a2e18 }); // Cuero oscuro
  const leatherHiMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 }); // Cuero claro
  const quiverMat    = new THREE.MeshLambertMaterial({ color: 0x3a2410 }); // Cuero reforzado
  const featherMat   = new THREE.MeshLambertMaterial({ color: 0xc83226 }); // Rojo vivo de plumas
  const shaftMat     = new THREE.MeshLambertMaterial({ color: 0xd9b48a }); // Madera de fresno
  const bootsMat     = new THREE.MeshLambertMaterial({ color: 0x3d2817 }); // Cuero de bota curtido

  // Suavizar ligeramente el tono de la túnica base para balance tonal
  if (a.mats?.[0]) {
    a.mats[0].color.multiplyScalar(0.90);
  }

  // ═══════════════════════════════════════════════════════════
  // 1. CAPUCHA — Casquete superior, laterales, nuca y faldón trasero
  //    Cabeza centrada en (0, 1.63, 0)
  // ═══════════════════════════════════════════════════════════
  const hoodGroup = new THREE.Group();

  // Casquete superior (cubre el techo de la cabeza)
  const hoodTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.16, 0.44),
    hoodMat
  );
  hoodTop.position.set(0, 0.22, 0);
  hoodGroup.add(hoodTop);

  // Laterales (cubren sienes y orejas, dejando el frente libre)
  const hoodSideL = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.24, 0.44),
    hoodMat
  );
  hoodSideL.position.set(-0.20, 0.08, 0);
  hoodGroup.add(hoodSideL);

  const hoodSideR = hoodSideL.clone();
  hoodSideR.position.x = 0.20;
  hoodGroup.add(hoodSideR);

  // Nuca (cubre la parte trasera de la cabeza)
  const hoodBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.34, 0.06),
    hoodMat
  );
  hoodBack.position.set(0, 0.05, -0.20);
  hoodGroup.add(hoodBack);

  // Faldón trasero (cae por detrás hasta el cuello/espalda alta)
  const hoodTail = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.28, 0.05),
    hoodDarkMat
  );
  hoodTail.position.set(0, -0.26, -0.22);
  hoodGroup.add(hoodTail);

  if (a.parts?.head) {
    add(hoodGroup, a.parts.head);
  } else {
    hoodGroup.position.set(0, 1.63, 0);
    add(hoodGroup, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 2. CAPA CORTA — Cuelga de los hombros hacia atrás hasta la cadera
  // ═══════════════════════════════════════════════════════════
  const cloakGroup = new THREE.Group();

  const cloak = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.68, 0.05),
    cloakMat
  );
  cloak.position.set(0, 0.98, -0.19);
  cloak.rotation.x = 0.06; // Ligera caída natural hacia atrás
  cloakGroup.add(cloak);

  // Borde inferior de la capa (más oscuro, da peso visual)
  const cloakEdge = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.06, 0.06),
    hoodDarkMat
  );
  cloakEdge.position.set(0, 0.65, -0.17);
  cloakEdge.rotation.x = 0.06;
  cloakGroup.add(cloakEdge);

  add(cloakGroup, a.gear);

  // ═══════════════════════════════════════════════════════════
  // 3. CARCAJ CON FLECHAS — Sobre el hombro derecho
  //    Hombro derecho en x = 0.30, y = 1.33
  // ═══════════════════════════════════════════════════════════
  const quiver = new THREE.Group();
  quiver.position.set(0.24, 1.38, -0.18);
  quiver.rotation.z = -0.22; // Inclinado hacia afuera del hombro
  quiver.rotation.x = -0.08; // Ligera inclinación hacia atrás

  // Cuerpo cilíndrico prismático del carcaj
  const quiverBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.42, 0.12),
    quiverMat
  );
  quiver.add(quiverBody);

  // Anillos de refuerzo de cuero
  const ringTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.03, 0.14),
    leatherHiMat
  );
  ringTop.position.set(0, 0.14, 0);
  quiver.add(ringTop);

  const ringBot = ringTop.clone();
  ringBot.position.y = -0.14;
  quiver.add(ringBot);

  // 3 flechas asomando por arriba con emplumado rojo vivo
  for (let i = 0; i < 3; i++) {
    const offsetX = (i - 1) * 0.035;
    const offsetZ = (i === 1 ? 0.02 : -0.02);

    // Vara de madera
    const shaft = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.28, 0.02),
      shaftMat
    );
    shaft.position.set(offsetX, 0.28, offsetZ);
    quiver.add(shaft);

    // Emplumado rojo
    const feather = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.08, 0.04),
      featherMat
    );
    feather.position.set(offsetX, 0.38, offsetZ);
    quiver.add(feather);
  }

  add(quiver, a.gear);

  // ═══════════════════════════════════════════════════════════
  // 4. CORREAS CRUZADAS EN EL PECHO (sujetan el carcaj)
  // ═══════════════════════════════════════════════════════════
  const strap = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.60, 0.02),
    leatherMat
  );
  strap.position.set(0.06, 1.15, 0.17);
  strap.rotation.z = 0.45;
  add(strap, a.gear);

  // Hebilla central de la bandolera
  const strapBuckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.07, 0.03),
    leatherHiMat
  );
  strapBuckle.position.set(0.06, 1.15, 0.18);
  strapBuckle.rotation.z = 0.45;
  add(strapBuckle, a.gear);

  // ═══════════════════════════════════════════════════════════
  // 5. BOTAS ALTAS DE CUERO — Articuladas en los pivotes de las piernas
  //    legLPivot / legRPivot a y = 0.80. Centro de la bota a -0.64m
  // ═══════════════════════════════════════════════════════════
  const bootGeo = new THREE.BoxGeometry(0.20, 0.32, 0.22);

  if (a.parts?.legLPivot) {
    const bootL = new THREE.Mesh(bootGeo, bootsMat);
    bootL.position.set(0, -0.64, 0);
    add(bootL, a.parts.legLPivot);
  } else {
    const bootL = new THREE.Mesh(bootGeo, bootsMat);
    bootL.position.set(-0.15, 0.16, 0);
    add(bootL, a.gear);
  }

  if (a.parts?.legRPivot) {
    const bootR = new THREE.Mesh(bootGeo, bootsMat);
    bootR.position.set(0, -0.64, 0);
    add(bootR, a.parts.legRPivot);
  } else {
    const bootR = new THREE.Mesh(bootGeo, bootsMat);
    bootR.position.set(0.15, 0.16, 0);
    add(bootR, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 6. GUANTES DE CUERO — Articulados en los pivotes de los brazos
  //    Manos a y = -0.47 del pivote de hombro
  // ═══════════════════════════════════════════════════════════
  const gloveGeo = new THREE.BoxGeometry(0.21, 0.11, 0.21);

  if (a.parts?.armLPivot) {
    const gloveL = new THREE.Mesh(gloveGeo, leatherMat);
    gloveL.position.set(0, -0.47, 0);
    add(gloveL, a.parts.armLPivot);
  }

  if (a.parts?.armRPivot) {
    const gloveR = new THREE.Mesh(gloveGeo, leatherMat);
    gloveR.position.set(0, -0.47, 0);
    add(gloveR, a.parts.armRPivot);
  }

  return [
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
}

export { buildRangerGear as rangerGear };
