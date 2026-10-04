// src/render/models/heroes/adventurerGear.js
import * as THREE from 'three';

/**
 * Kit del Aventurero (adventurer): arquetipo de explorador versátil.
 * Incluye capucha sobre los hombros, bufanda de cuello, mochila de viaje con correas,
 * bolsas utilitarias en el cinto, brújula dorada en el pecho y botas de cuero
 * emparentadas a los pivotes de las piernas para animación de marcha síncrona.
 * 
 * @param {object} a - Entidad del avatar (con parts, gear, mesh).
 * @param {object} G - Caché de geometrías compartidas.
 * @param {function} add - Función para registrar nodos añadidos.
 * @returns {THREE.Material[]} Materiales propios para disponer al cambiar de clase.
 */
export function buildAdventurerGear(a, G, add) {
  const leatherMat     = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
  const leatherDarkMat = new THREE.MeshLambertMaterial({ color: 0x4a2e18 });
  const clothMat       = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
  const brassMat       = new THREE.MeshLambertMaterial({ color: 0xc9a227, emissive: 0x3d2b05 });
  const bootsMat       = new THREE.MeshLambertMaterial({ color: 0x3d2817 });

  // ───── 1. Capucha sobre los hombros ─────
  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(0.60, 0.14, 0.40),
    clothMat
  );
  hood.position.set(0, 1.40, -0.02);
  add(hood, a.gear);

  // ───── 2. Bufanda/pañuelo al cuello ─────
  const scarf = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.10, 0.24),
    leatherMat
  );
  scarf.position.set(0, 1.36, 0);
  add(scarf, a.gear);

  // ───── 3. Mochila pequeña (visible desde atrás) con correas al frente ─────
  const pack = new THREE.Group();
  const packBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.30, 0.34, 0.14),
    leatherMat
  );
  packBody.position.set(0, 1.15, -0.24);
  pack.add(packBody);

  // Correas de la mochila cruzando los hombros hacia el pecho
  const strapL = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.44, 0.04),
    leatherDarkMat
  );
  strapL.position.set(-0.14, 1.15, -0.18);
  strapL.rotation.x = 0.15;
  pack.add(strapL);

  const strapR = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.44, 0.04),
    leatherDarkMat
  );
  strapR.position.set(0.14, 1.15, -0.18);
  strapR.rotation.x = 0.15;
  pack.add(strapR);

  add(pack, a.gear);

  // ───── 4. Bolsas en el cinturón ─────
  const pouchL = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.12, 0.08),
    leatherMat
  );
  pouchL.position.set(-0.20, 0.76, 0.14);
  add(pouchL, a.gear);

  const pouchR = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.12, 0.08),
    leatherMat
  );
  pouchR.position.set(0.20, 0.76, 0.14);
  add(pouchR, a.gear);

  // ───── 5. Botas emparentadas a los pivotes de las piernas (animación de marcha sincronizada) ─────
  const bootGeo = new THREE.BoxGeometry(0.20, 0.22, 0.20);

  if (a.parts?.legLPivot) {
    const bootL = new THREE.Mesh(bootGeo, bootsMat);
    bootL.position.set(0, -0.69, 0);
    add(bootL, a.parts.legLPivot);
  }

  if (a.parts?.legRPivot) {
    const bootR = new THREE.Mesh(bootGeo, bootsMat);
    bootR.position.set(0, -0.69, 0);
    add(bootR, a.parts.legRPivot);
  }

  // ───── 6. Brújula dorada en el pecho ─────
  const compass = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.07, 0.02),
    brassMat
  );
  compass.position.set(0, 1.20, 0.17);
  add(compass, a.gear);

  // ───── 7. Cabello de Aventurero (casquete castaño + mechón despeinado) ─────
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x4a2e18 });

  // Casquete: 1cm más ancho que la cabeza (0.42 x 0.14 x 0.42) envolviendo el cráneo superior
  const hairCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.14, 0.42),
    hairMat
  );
  hairCap.position.set(0, 1.82, 0);
  add(hairCap, a.gear);

  // Mechón frontal con aire despeinado de explorador
  const hairTuft = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.06, 0.10),
    hairMat
  );
  hairTuft.position.set(0.06, 1.86, 0.18);
  add(hairTuft, a.gear);

  return [leatherMat, leatherDarkMat, clothMat, brassMat, bootsMat, hairMat];
}
