// src/render/models/heroes/guardianGear.js
import * as THREE from 'three';

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
  // Paleta de materiales del Guardián (metales pesados y gema regia)
  const goldMat     = new THREE.MeshLambertMaterial({ color: 0xd4af37 }); // Oro imperial
  const goldDarkMat = new THREE.MeshLambertMaterial({ color: 0x8a6a20 }); // Oro envejecido
  const bronzeMat   = new THREE.MeshLambertMaterial({ color: 0x8b5a2b }); // Bronce cálido
  const bronzeDkMat = new THREE.MeshLambertMaterial({ color: 0x5a3a18 }); // Bronce oscuro
  const steelMat    = new THREE.MeshLambertMaterial({ color: 0x6b7078 }); // Acero pulido
  const steelDkMat  = new THREE.MeshLambertMaterial({ color: 0x3a3f48 }); // Acero templado oscuro
  const gemMat      = new THREE.MeshLambertMaterial({
    color: 0xdc2626,
    emissive: 0x5a0a0a,
    emissiveIntensity: 0.5,
  }); // Gema rubí emisiva

  // Atenuar ligeramente la túnica base para que los dorados y bronces resalten con fuerte contraste
  if (a.mats?.[0]) {
    a.mats[0].color.multiplyScalar(0.88);
  }

  // ═══════════════════════════════════════════════════════════
  // 1. CORONA DORADA CON PÚAS — Sobre la parte superior de la cabeza
  //    Cabeza centrada en (0, 1.63, 0), tope en y = +0.20 rel
  // ═══════════════════════════════════════════════════════════
  const crown = new THREE.Group();
  crown.position.set(0, 0.22, 0);

  // Banda base de la corona
  const crownBand = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.08, 0.46),
    goldMat
  );
  crown.add(crownBand);

  // Púas en las 4 esquinas
  const spikeGeo = new THREE.BoxGeometry(0.08, 0.14, 0.08);
  const spikePositions = [
    [-0.19, 0.11, -0.19],
    [ 0.19, 0.11, -0.19],
    [-0.19, 0.11,  0.19],
    [ 0.19, 0.11,  0.19],
  ];
  for (const [x, y, z] of spikePositions) {
    const spike = new THREE.Mesh(spikeGeo, goldMat);
    spike.position.set(x, y, z);
    crown.add(spike);
  }

  // Púa central frontal (más alta y prominente)
  const centerSpike = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.20, 0.10),
    goldMat
  );
  centerSpike.position.set(0, 0.14, 0.20);
  crown.add(centerSpike);

  // Gema roja engarzada en la púa central
  const crownGem = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.06),
    gemMat
  );
  crownGem.position.set(0, 0.20, 0.24);
  crown.add(crownGem);

  if (a.parts?.head) {
    add(crown, a.parts.head);
  } else {
    crown.position.set(0, 1.85, 0);
    add(crown, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 2. HOMBRERAS MACIZAS DE BRONCE CON RIBETES DORADOS
  //    Conectadas firmemente al torso superior
  // ═══════════════════════════════════════════════════════════
  const buildPauldron = (side) => {
    const g = new THREE.Group();
    const sign = side === 'L' ? -1 : 1;
    g.position.set(sign * 0.36, 1.38, 0);

    // Capa 1: Base maciza (ocupa el hombro completo)
    const layer1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.18, 0.30),
      bronzeMat
    );
    layer1.position.set(sign * 0.02, 0, 0);
    g.add(layer1);

    // Capa 2: Tapa superior angulada
    const layer2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.10, 0.32),
      bronzeDkMat
    );
    layer2.position.set(sign * 0.04, 0.12, 0);
    layer2.rotation.z = sign * 0.25;
    g.add(layer2);

    // Ribete inferior dorado
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.04, 0.32),
      goldMat
    );
    rim.position.set(sign * 0.02, -0.10, 0);
    g.add(rim);

    // Remache dorado central
    const stud = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.05),
      goldMat
    );
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

    // Placa de bronce
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.32, 0.06),
      bronzeMat
    );
    body.position.set(0, -0.16, 0);
    plate.add(body);

    // Filo inferior dorado
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.04, 0.07),
      goldMat
    );
    edge.position.set(0, -0.34, 0);
    plate.add(edge);

    // Remache superior de acero
    const rivet = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.04, 0.02),
      steelMat
    );
    rivet.position.set(0, -0.04, 0.03);
    plate.add(rivet);
  }

  add(skirtGroup, a.gear);

  // ═══════════════════════════════════════════════════════════
  // 4. GUANTELETES PESADOS EN ANTEBRAZOS (articulados a armLPivot/armRPivot)
  //    Pivote hombro y = 1.33. Antebrazo en y = -0.32
  // ═══════════════════════════════════════════════════════════
  const buildGauntlet = (pivot) => {
    const g = new THREE.Group();
    g.position.set(0, -0.32, 0);

    // Base de acero pulido
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.22, 0.24),
      steelMat
    );
    g.add(base);

    // Aro dorado superior
    const topRing = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.04, 0.26),
      goldMat
    );
    topRing.position.set(0, 0.13, 0);
    g.add(topRing);

    // Placa de choque frontal (puño)
    const fist = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.10, 0.14),
      steelDkMat
    );
    fist.position.set(0, -0.16, 0.06);
    g.add(fist);

    // Remache dorado central
    const stud = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.02),
      goldMat
    );
    stud.position.set(0, -0.16, 0.14);
    g.add(stud);

    add(g, pivot);
  };

  if (a.parts?.armLPivot) buildGauntlet(a.parts.armLPivot);
  if (a.parts?.armRPivot) buildGauntlet(a.parts.armRPivot);

  // ═══════════════════════════════════════════════════════════
  // 5. PECHERA REFORZADA CON ROMBO DORADO
  // ═══════════════════════════════════════════════════════════
  const chestPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.30, 0.24, 0.02),
    bronzeDkMat
  );
  chestPlate.position.set(0, 1.18, 0.17);
  add(chestPlate, a.gear);

  // Rombo central (emblema heráldico del Guardián)
  const emblem = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.10, 0.03),
    goldMat
  );
  emblem.position.set(0, 1.18, 0.185);
  emblem.rotation.z = Math.PI / 4;
  add(emblem, a.gear);

  // ═══════════════════════════════════════════════════════════
  // 6. BOTAS DE METAL CON RIBETE DORADO (articuladas a las piernas)
  //    Pivote pierna en y = 0.80. Suelo en y = 0.
  // ═══════════════════════════════════════════════════════════
  const bootGeo = new THREE.BoxGeometry(0.22, 0.30, 0.24);
  const bootRimGeo = new THREE.BoxGeometry(0.24, 0.04, 0.26);

  if (a.parts?.legLPivot) {
    const bootL = new THREE.Mesh(bootGeo, steelDkMat);
    bootL.position.set(0, -0.65, 0);
    add(bootL, a.parts.legLPivot);

    const bootRimL = new THREE.Mesh(bootRimGeo, goldMat);
    bootRimL.position.set(0, -0.52, 0);
    add(bootRimL, a.parts.legLPivot);
  } else {
    const bootL = new THREE.Mesh(bootGeo, steelDkMat);
    bootL.position.set(-0.15, 0.15, 0);
    add(bootL, a.gear);

    const bootRimL = new THREE.Mesh(bootRimGeo, goldMat);
    bootRimL.position.set(-0.15, 0.28, 0);
    add(bootRimL, a.gear);
  }

  if (a.parts?.legRPivot) {
    const bootR = new THREE.Mesh(bootGeo, steelDkMat);
    bootR.position.set(0, -0.65, 0);
    add(bootR, a.parts.legRPivot);

    const bootRimR = new THREE.Mesh(bootRimGeo, goldMat);
    bootRimR.position.set(0, -0.52, 0);
    add(bootRimR, a.parts.legRPivot);
  } else {
    const bootR = new THREE.Mesh(bootGeo, steelDkMat);
    bootR.position.set(0.15, 0.15, 0);
    add(bootR, a.gear);

    const bootRimR = new THREE.Mesh(bootRimGeo, goldMat);
    bootRimR.position.set(0.15, 0.28, 0);
    add(bootRimR, a.gear);
  }

  return [
    goldMat,
    goldDarkMat,
    bronzeMat,
    bronzeDkMat,
    steelMat,
    steelDkMat,
    gemMat,
  ];
}

export { buildGuardianGear as guardianGear };
