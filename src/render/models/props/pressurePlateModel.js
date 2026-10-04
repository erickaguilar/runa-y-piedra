// src/render/models/props/pressurePlateModel.js
import * as THREE from 'three';

export const PLATE_PRESS_DEPTH = 0.055; // Hundimiento físico de 5.5 cm al activarse

/**
 * Crea los materiales de cantería, forja y runas emisivas para la losa de presión.
 */
export function createPressurePlateMaterials() {
  return {
    frameStone: new THREE.MeshLambertMaterial({ color: 0x1e293b }), // Zócalo de sillar oscuro
    plateStone: new THREE.MeshLambertMaterial({ color: 0x475569 }), // Losa de cantería móvil
    ironTrim: new THREE.MeshLambertMaterial({ color: 0x0f172a }),   // Esquineros de hierro forjado
    runeInactive: new THREE.MeshLambertMaterial({
      color: 0xd97706,
      emissive: 0x78350f,
      emissiveIntensity: 0.6,
    }),
    runeActive: new THREE.MeshLambertMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.4,
    }),
    runeCloseInactive: new THREE.MeshLambertMaterial({
      color: 0xef4444,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.6,
    }),
    runeCloseActive: new THREE.MeshLambertMaterial({
      color: 0xf43f5e,
      emissive: 0xbe123c,
      emissiveIntensity: 1.4,
    }),
  };
}

/**
 * Geometrías modulares compartidas para la losa de presión y sus herrajes.
 */
export function createPressurePlateGeometries() {
  return {
    frameGeo: new THREE.BoxGeometry(1.18, 0.04, 1.18),
    plateGeo: new THREE.BoxGeometry(0.92, 0.06, 0.92),
    runeGeo: new THREE.CylinderGeometry(0.24, 0.24, 0.015, 16),
    cornersGeo: new THREE.BoxGeometry(0.14, 0.07, 0.14),
  };
}

/**
 * Ensambla la jerarquía 3D de la losa de presión con base fija, pivote móvil y runa de activación.
 *
 * @param {object} geos - Geometrías compartidas
 * @param {object} mats - Materiales compartidos
 * @param {object} [options] - Configuración de la losa (ej. action)
 * @returns {{ root: THREE.Group, platePivot: THREE.Object3D, plateMesh: THREE.Mesh, runeMesh: THREE.Mesh, light: THREE.PointLight }}
 */
export function buildPressurePlateMesh(geos, mats, options = {}) {
  const root = new THREE.Group();
  const isCloseAction = options.action === 'close_door';

  // 1. Marco perimetral fijo exterior encastrado al ras del suelo
  const frameMesh = new THREE.Mesh(geos.frameGeo, mats.frameStone);
  frameMesh.position.y = 0.02;
  root.add(frameMesh);

  // 2. Cuatro esquineros de hierro forjado reforzado
  const corners = [
    [-0.48, 0.48], [0.48, 0.48],
    [-0.48, -0.48], [0.48, -0.48],
  ];
  for (const [cx, cz] of corners) {
    const cMesh = new THREE.Mesh(geos.cornersGeo, mats.ironTrim);
    cMesh.position.set(cx, 0.035, cz);
    root.add(cMesh);
  }

  // 3. Pivote de descenso amortiguado para la placa móvil
  const platePivot = new THREE.Object3D();
  platePivot.position.y = 0;
  root.add(platePivot);

  // 4. Placa central de piedra de cantería
  const plateMesh = new THREE.Mesh(geos.plateGeo, mats.plateStone);
  plateMesh.position.y = 0.04;
  platePivot.add(plateMesh);

  // 5. Disco rúnico central en relieve con color temático según su función
  const runeMat = isCloseAction ? mats.runeCloseInactive : mats.runeInactive;
  const runeMesh = new THREE.Mesh(geos.runeGeo, runeMat);
  runeMesh.position.y = 0.072;
  platePivot.add(runeMesh);

  // 6. Luz rúnica puntual sutil
  const lightColor = isCloseAction ? 0xef4444 : 0xf59e0b;
  const light = new THREE.PointLight(lightColor, 0.5, 2.2);
  light.position.set(0, 0.25, 0);
  root.add(light);

  return { root, platePivot, plateMesh, runeMesh, light };
}
