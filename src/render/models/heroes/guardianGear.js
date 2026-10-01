// src/render/models/heroes/guardianGear.js
import * as THREE from 'three';

/**
 * Kit del Guardián (guardian): corona áurea con gema, hombreras macizas,
 * faldón de guerra y guanteletes de forja. Silueta de coloso.
 * @param {object} a - Entidad del avatar.
 * @param {object} G - Caché de geometrías compartidas.
 * @param {function} add - Función de registro para añadir nodos.
 * @returns {THREE.Material[]} Materiales propios para disponer al cambiar de clase.
 */
export function buildGuardianGear(a, G, add) {
  const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f });
  const bronzeMat = new THREE.MeshLambertMaterial({ color: 0x92600f });
  const gemMat = new THREE.MeshLambertMaterial({
    color: 0xf87171, emissive: 0x991b1b, emissiveIntensity: 0.9,
  });

  // Corona áurea con gema carmesí al frente
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.1, 12), goldMat);
  band.position.set(0, 1.78, 0);
  add(band, a.gear);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), gemMat);
  gem.position.set(0, 1.78, 0.27);
  add(gem, a.gear);

  // Hombreras macizas de bronce con remate dorado
  const pauldronGeo = new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const rimGeo = new THREE.TorusGeometry(0.19, 0.03, 6, 14, Math.PI);
  for (const side of [-1, 1]) {
    const p = new THREE.Mesh(pauldronGeo, bronzeMat);
    p.position.set(0.36 * side, 1.34, 0);
    add(p, a.gear);
    const rim = new THREE.Mesh(rimGeo, goldMat);
    rim.position.set(0.36 * side, 1.34, 0);
    rim.rotation.x = Math.PI / 2;
    rim.rotation.z = side > 0 ? 0 : Math.PI;
    add(rim, a.gear);
  }

  // Faldón de guerra sobre caderas y muslos (las piernas oscilan dentro)
  const fauld = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.38, 10), bronzeMat);
  fauld.position.set(0, 0.72, 0);
  add(fauld, a.gear);
  const fauldTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.425, 0.425, 0.05, 10), goldMat);
  fauldTrim.position.set(0, 0.55, 0);
  add(fauldTrim, a.gear);

  // Guanteletes de forja (siguen el balanceo de los brazos)
  for (const pivot of [a.parts.armLPivot, a.parts.armRPivot]) {
    const gauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.22), bronzeMat);
    gauntlet.position.set(0, -0.5, 0);
    add(gauntlet, pivot);
  }

  return [goldMat, bronzeMat, gemMat];
}
