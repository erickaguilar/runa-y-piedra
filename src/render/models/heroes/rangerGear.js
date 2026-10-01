// src/render/models/heroes/rangerGear.js
import * as THREE from 'three';

/**
 * Kit del Explorador (ranger): capucha verde, capa a la espalda y carcaj
 * con flechas sobre el hombro derecho.
 * @param {object} a - Entidad del avatar.
 * @param {object} G - Caché de geometrías compartidas.
 * @param {function} add - Función de registro para añadir nodos.
 * @returns {THREE.Material[]} Materiales propios para disponer al cambiar de clase.
 */
export function buildRangerGear(a, G, add) {
  const hoodMat = new THREE.MeshLambertMaterial({ color: 0x065f46 });
  const cloakMat = new THREE.MeshLambertMaterial({ color: 0x064e3b });
  const leatherMat = new THREE.MeshLambertMaterial({ color: 0x6b4a2b });
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x92600f });
  const fletchMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

  // Capucha: corona sobre la cabeza + faldón trasero hasta la nuca
  const hoodTop = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.2, 0.56), hoodMat);
  hoodTop.position.set(0, 1.86, 0);
  add(hoodTop, a.gear);
  const hoodBack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.42, 0.12), hoodMat);
  hoodBack.position.set(0, 1.62, -0.24);
  add(hoodBack, a.gear);

  // Capa a la espalda con ligera caída
  const cloak = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.78, 0.06), cloakMat);
  cloak.position.set(0, 1.0, -0.24);
  cloak.rotation.x = 0.1;
  add(cloak, a.gear);

  // Carcaj de cuero en diagonal sobre el hombro derecho
  const quiver = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.44, 10), leatherMat);
  quiver.add(tube);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 10), woodMat);
  rim.position.y = 0.2;
  quiver.add(rim);
  for (let i = -1; i <= 1; i++) {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.5, 6), woodMat);
    shaft.position.set(i * 0.035, 0.22, (i % 2) * 0.03);
    quiver.add(shaft);
    const fletch = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.09, 0.02), fletchMat);
    fletch.position.set(i * 0.035, 0.42, (i % 2) * 0.03);
    quiver.add(fletch);
  }
  quiver.position.set(0.22, 1.32, -0.26);
  quiver.rotation.z = 0.28;
  quiver.rotation.x = -0.12;
  add(quiver, a.gear);

  return [hoodMat, cloakMat, leatherMat, woodMat, fletchMat];
}
