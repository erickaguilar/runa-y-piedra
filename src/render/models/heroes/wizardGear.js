// src/render/models/heroes/wizardGear.js
import * as THREE from 'three';

/**
 * Kit del Hechicero (wizard): sombrero picudo con ala y báculo con cristal
 * arcano en la mano derecha (acompaña el balanceo del brazo).
 * @param {object} a - Entidad del avatar.
 * @param {object} G - Caché de geometrías compartidas.
 * @param {function} add - Función de registro para añadir nodos.
 * @returns {THREE.Material[]} Materiales propios para disponer al cambiar de clase.
 */
export function buildWizardGear(a, G, add) {
  const hatMat = new THREE.MeshLambertMaterial({ color: 0x6d28d9 });
  const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f });
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x573418 });
  const crystalMat = new THREE.MeshLambertMaterial({
    color: 0xc4b5fd, emissive: 0x7c3aed, emissiveIntensity: 1.0,
  });

  // Ala + cono picudo ligeramente ladeado + remate dorado
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.06, 14), hatMat);
  brim.position.set(0, 1.88, 0);
  add(brim, a.gear);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 12), hatMat);
  cone.position.set(0, 2.18, 0);
  cone.rotation.z = 0.07;
  add(cone, a.gear);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), goldMat);
  tip.position.set(-0.02, 2.47, 0);
  add(tip, a.gear);

  // Báculo en la mano derecha: vara, collar y cristal arcano
  const staff = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 1.2, 8), woodMat);
  staff.add(rod);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.07, 8), goldMat);
  collar.position.y = 0.52;
  staff.add(collar);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), crystalMat);
  crystal.position.y = 0.66;
  staff.add(crystal);
  staff.position.set(0.1, -0.32, 0.06);
  add(staff, a.parts.armRPivot);

  return [hatMat, goldMat, woodMat, crystalMat];
}
