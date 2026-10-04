// src/render/models/heroes/wizardGear.js
import * as THREE from 'three';

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
  // Paleta de materiales de Hechicero
  const hatMat       = new THREE.MeshLambertMaterial({ color: 0x5b21b6 }); // Violeta mago
  const hatDarkMat   = new THREE.MeshLambertMaterial({ color: 0x3b1078 }); // Violeta oscuro para el ala
  const hatBandMat   = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 }); // Banda violeta luminosa
  const pomMat       = new THREE.MeshLambertMaterial({ color: 0xf97316 }); // Pom-pom naranja cálido
  const beardMat     = new THREE.MeshLambertMaterial({ color: 0xc8c4b8 }); // Barba ceniza/sabio
  const woodMat      = new THREE.MeshLambertMaterial({ color: 0x4a2e18 }); // Madera de roble oscuro
  const woodHiMat    = new THREE.MeshLambertMaterial({ color: 0x6b4423 }); // Veta / nudo de madera clara
  const crystalMat   = new THREE.MeshLambertMaterial({
    color: 0xd8b4fe,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.8,
  }); // Cristal arcano radiante
  const ringMat      = new THREE.MeshLambertMaterial({ color: 0xd4af37 }); // Oro arcano
  const bookCoverMat = new THREE.MeshLambertMaterial({ color: 0x4a1818 }); // Cuero carmesí grimorio
  const bookPagesMat = new THREE.MeshLambertMaterial({ color: 0xe8dcb8 }); // Filo de páginas pergamino

  // ═══════════════════════════════════════════════════════════
  // 1. SOMBRERO — Ala ancha + cono más bajo con pom-pom
  //    Anclado a a.parts.head (cabeza centrada en 1.63, radio 0.20)
  // ═══════════════════════════════════════════════════════════
  const hatGroup = new THREE.Group();

  // Ala (plana, ancha — 0.56m cubre ampliamente la cabeza de 0.40m)
  const brim = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.04, 0.56),
    hatDarkMat
  );
  brim.position.set(0, 0.16, 0);
  hatGroup.add(brim);

  // Banda del sombrero (aro luminoso donde nace el cono)
  const band = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.05, 0.44),
    hatBandMat
  );
  band.position.set(0, 0.20, 0);
  hatGroup.add(band);

  // Cono escalonado (~0.35m de altura total)
  const cone = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.12, 0.32),
    hatMat
  );
  cone.position.set(0, 0.28, 0);
  hatGroup.add(cone);

  const coneMid = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.12, 0.22),
    hatMat
  );
  coneMid.position.set(0, 0.38, 0);
  hatGroup.add(coneMid);

  const coneTip = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.12),
    hatMat
  );
  coneTip.position.set(0, 0.48, 0);
  hatGroup.add(coneTip);

  // Pom-pom naranja en la cúspide
  const pom = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.08),
    pomMat
  );
  pom.position.set(0, 0.58, 0);
  hatGroup.add(pom);

  if (a.parts?.head) {
    add(hatGroup, a.parts.head);
  } else {
    hatGroup.position.set(0, 1.63, 0);
    add(hatGroup, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 2. BARBA Y BIGOTE — Cuelgan del mentón hacia el pecho
  //    Anclados a a.parts.head
  // ═══════════════════════════════════════════════════════════
  const beardGroup = new THREE.Group();

  // Bloque principal de barba
  const beard = new THREE.Mesh(
    new THREE.BoxGeometry(0.30, 0.34, 0.12),
    beardMat
  );
  beard.position.set(0, -0.38, 0.16);
  beardGroup.add(beard);

  // Bigote (más ancho sobre la comisura)
  const mustache = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.05, 0.04),
    beardMat
  );
  mustache.position.set(0, -0.22, 0.21);
  beardGroup.add(mustache);

  // Pico de la barba (remate cónico inferior hacia el esternón)
  const beardTip = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.14, 0.10),
    beardMat
  );
  beardTip.position.set(0, -0.60, 0.16);
  beardGroup.add(beardTip);

  if (a.parts?.head) {
    add(beardGroup, a.parts.head);
  } else {
    beardGroup.position.set(0, 1.63, 0);
    add(beardGroup, a.gear);
  }

  // ═══════════════════════════════════════════════════════════
  // 3. BÁCULO ARCANO — Anclado directamente a la MANO derecha (armRPivot)
  //    armRPivot está en y = 1.33. La mano está en y = -0.42 a -0.47.
  // ═══════════════════════════════════════════════════════════
  const staff = new THREE.Group();
  staff.position.set(0, -0.42, 0.10); // Agarre en la mano

  // Mango de madera de 1.60m: la base baja cerca del suelo y la punta corona el hombro
  const shaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 1.60, 0.06),
    woodMat
  );
  shaft.position.set(0, 0.20, 0);
  staff.add(shaft);

  // Nudo de madera / refuerzo de agarre
  const knot = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.10, 0.09),
    woodHiMat
  );
  knot.position.set(0, 0.10, 0);
  staff.add(knot);

  // Anillo de oro que engarza el cristal
  const staffRing = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.06, 0.10),
    ringMat
  );
  staffRing.position.set(0, 0.98, 0);
  staff.add(staffRing);

  // Cristal emisivo radiante (octaedro exterior de 0.16m de envergadura)
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.09, 0),
    crystalMat
  );
  crystal.position.set(0, 1.12, 0);
  crystal.rotation.y = Math.PI / 4;
  staff.add(crystal);

  // Faceta interior del cristal (segunda capa reflectante)
  const crystalInner = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.05, 0),
    crystalMat
  );
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
  // 4. GRIMORIO EN EL CINTURÓN — Colgado a la cadera izquierda
  // ═══════════════════════════════════════════════════════════
  const bookGroup = new THREE.Group();

  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.18, 0.06),
    bookCoverMat
  );
  book.position.set(-0.20, 0.82, 0.16);
  book.rotation.z = 0.15;
  bookGroup.add(book);

  // Filo de páginas de pergamino
  const pages = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.17, 0.02),
    bookPagesMat
  );
  pages.position.set(-0.20, 0.82, 0.185);
  pages.rotation.z = 0.15;
  bookGroup.add(pages);

  // Broche de cierre dorado
  const clasp = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.18, 0.02),
    ringMat
  );
  clasp.position.set(-0.15, 0.82, 0.19);
  clasp.rotation.z = 0.15;
  bookGroup.add(clasp);

  add(bookGroup, a.gear);

  return [
    hatMat,
    hatDarkMat,
    hatBandMat,
    pomMat,
    beardMat,
    woodMat,
    woodHiMat,
    crystalMat,
    ringMat,
    bookCoverMat,
    bookPagesMat,
  ];
}

export { buildWizardGear as wizardGear };
