// src/render/models/heroes/paladinGear.js
import * as THREE from 'three';

/**
 * Kit del Paladín (paladin): yelmo plateado sobre la cabeza + cresta roja de crin,
 * hombreras redondeadas y escudo con umbo dorado en el antebrazo izquierdo.
 * @param {object} a - Entidad del avatar.
 * @param {object} G - Caché de geometrías compartidas.
 * @param {function} add - Función de registro para añadir nodos.
 * @returns {THREE.Material[]} Materiales propios para disponer al cambiar de clase.
 */
export function buildPaladinGear(a, G, add) {
  const silverMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });
  const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f });
  const crestMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });

  // Yelmo plateado sobre la cabeza + cresta roja de crin
  const helm = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.22, 0.54), silverMat);
  helm.position.set(0, 1.82, 0);
  add(helm, a.gear);
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.2, 0.44), crestMat);
  crest.position.set(0, 2.0, -0.02);
  add(crest, a.gear);

  // Hombreras redondeadas
  const pauldronGeo = new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const pauldronL = new THREE.Mesh(pauldronGeo, silverMat);
  pauldronL.position.set(-0.34, 1.34, 0);
  add(pauldronL, a.gear);
  const pauldronR = new THREE.Mesh(pauldronGeo, silverMat);
  pauldronR.position.set(0.34, 1.34, 0);
  add(pauldronR, a.gear);

  // Escudo antebrazo izquierdo: tabla, cantos y umbo dorado (sigue el balanceo)
  const shield = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.52, 0.38), silverMat);
  shield.add(board);
  const rimV = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.56, 0.06), goldMat);
  rimV.position.set(0, 0, 0.17);
  shield.add(rimV);
  const rimV2 = rimV.clone();
  rimV2.position.z = -0.17;
  shield.add(rimV2);
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), goldMat);
  boss.position.set(-0.05, 0, 0);
  shield.add(boss);
  shield.position.set(-0.14, -0.32, 0.02);
  add(shield, a.parts.armLPivot);

  return [silverMat, goldMat, crestMat];
}
