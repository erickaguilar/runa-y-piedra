// src/render/models/props/cartographyModel.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const CARTO_LIGHT_INTENSITY = 2.0;
export const CARTO_PARTICLE_COUNT = 32;

/**
 * Materiales para la Mesa de Navegación Cartográfica y el Astrolabio Celestial.
 */
export function createCartographyMaterials() {
  return {
    stoneBase: new THREE.MeshLambertMaterial({ color: 0x1e293b }), // Granito oscuro de cantería
    stonePillars: new THREE.MeshLambertMaterial({ color: 0x334155 }), // Pilares de soporte
    bronzeTrim: new THREE.MeshLambertMaterial({
      color: 0xd97706,
      emissive: 0x78350f,
      emissiveIntensity: 0.35,
    }), // Herrajes y aros de bronce antiguo
    hologramMap: new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
    }), // Disco holográfico del mapa
    mapGrid: new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.95,
      wireframe: true,
    }), // Retícula de coordenadas celestiales
    celestialCore: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0x0284c7,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.96,
    }), // Núcleo astronómico de orientación
    stardust: new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.05,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }), // Partículas de polvo estelar
  };
}

/**
 * Geometrías para la Mesa de Cartografía: pedestal de 4 pilares, losa de mapa,
 * aros armilares de orientación y núcleo celestial poliédrico.
 */
export function createCartographyGeometries() {
  // 1. Zócalo escalonado inferior
  const step1 = new THREE.BoxGeometry(1.2, 0.14, 1.2).translate(0, 0.07, 0);
  const step2 = new THREE.BoxGeometry(1.04, 0.12, 1.04).translate(0, 0.20, 0);
  const stoneBase = mergeGeometries([step1, step2]);
  step1.dispose();
  step2.dispose();

  // 2. Cuatro pilares angulares de cantería + columna central de conducción de éter
  const p1 = new THREE.CylinderGeometry(0.09, 0.11, 0.62, 6).translate(0.38, 0.57, 0.38);
  const p2 = new THREE.CylinderGeometry(0.09, 0.11, 0.62, 6).translate(-0.38, 0.57, 0.38);
  const p3 = new THREE.CylinderGeometry(0.09, 0.11, 0.62, 6).translate(0.38, 0.57, -0.38);
  const p4 = new THREE.CylinderGeometry(0.09, 0.11, 0.62, 6).translate(-0.38, 0.57, -0.38);
  const centerShaft = new THREE.CylinderGeometry(0.18, 0.22, 0.62, 8).translate(0, 0.57, 0);
  const stonePillars = mergeGeometries([p1, p2, p3, p4, centerShaft]);
  p1.dispose();
  p2.dispose();
  p3.dispose();
  p4.dispose();
  centerShaft.dispose();

  // 3. Losa superior de la mesa cartográfica con biseles de bronce
  const tableSlab = new THREE.BoxGeometry(1.14, 0.12, 1.14).translate(0, 0.94, 0);
  const dialBezel = new THREE.CylinderGeometry(0.48, 0.50, 0.04, 24).translate(0, 1.02, 0);

  // Escuadras de bronce en las 4 esquinas de la mesa
  const b1 = new THREE.BoxGeometry(0.22, 0.04, 0.06).translate(0.45, 1.01, 0.53);
  const b2 = new THREE.BoxGeometry(0.06, 0.04, 0.22).translate(0.53, 1.01, 0.45);
  const b3 = new THREE.BoxGeometry(0.22, 0.04, 0.06).translate(-0.45, 1.01, 0.53);
  const b4 = new THREE.BoxGeometry(0.06, 0.04, 0.22).translate(-0.53, 1.01, 0.45);
  const b5 = new THREE.BoxGeometry(0.22, 0.04, 0.06).translate(0.45, 1.01, -0.53);
  const b6 = new THREE.BoxGeometry(0.06, 0.04, 0.22).translate(0.53, 1.01, -0.45);
  const b7 = new THREE.BoxGeometry(0.22, 0.04, 0.06).translate(-0.45, 1.01, -0.53);
  const b8 = new THREE.BoxGeometry(0.06, 0.04, 0.22).translate(-0.53, 1.01, -0.45);
  const bronzeTrim = mergeGeometries([dialBezel, b1, b2, b3, b4, b5, b6, b7, b8]);
  dialBezel.dispose();
  b1.dispose(); b2.dispose(); b3.dispose(); b4.dispose();
  b5.dispose(); b6.dispose(); b7.dispose(); b8.dispose();

  // 4. Disco del mapa holográfico (plano horizontal brillante)
  const mapDisc = new THREE.CircleGeometry(0.44, 32);
  mapDisc.rotateX(-Math.PI / 2);
  mapDisc.translate(0, 1.045, 0);

  // Anillo concéntrico de coordenadas cartográficas
  const mapRing = new THREE.RingGeometry(0.38, 0.44, 32);
  mapRing.rotateX(-Math.PI / 2);
  mapRing.translate(0, 1.048, 0);

  // 5. Aros armilares celestiales que rotan en órbita
  const outerArmillary = new THREE.TorusGeometry(0.32, 0.016, 8, 32);
  const innerArmillary = new THREE.TorusGeometry(0.22, 0.014, 8, 28);

  // 6. Núcleo celestial de orientación (Dodecaedro místico)
  const celestialCore = new THREE.DodecahedronGeometry(0.11, 0);

  return {
    stoneBase,
    stonePillars,
    tableSlab,
    bronzeTrim,
    mapDisc,
    mapRing,
    outerArmillary,
    innerArmillary,
    celestialCore,
  };
}

/**
 * Ensambla el modelo 3D completo de la Mesa Cartográfica con su astrolabio y polvo estelar.
 */
export function buildCartographyTableMesh(geos, mats) {
  const root = new THREE.Group();
  root.name = 'CartographyTable';

  // Base y patas de piedra
  const baseMesh = new THREE.Mesh(geos.stoneBase, mats.stoneBase);
  const pillarsMesh = new THREE.Mesh(geos.stonePillars, mats.stonePillars);
  const slabMesh = new THREE.Mesh(geos.tableSlab, mats.stoneBase);
  const trimMesh = new THREE.Mesh(geos.bronzeTrim, mats.bronzeTrim);
  root.add(baseMesh, pillarsMesh, slabMesh, trimMesh);

  // Disco holográfico del mapa sobre la losa
  const mapDiscMesh = new THREE.Mesh(geos.mapDisc, mats.hologramMap);
  const mapRingMesh = new THREE.Mesh(geos.mapRing, mats.bronzeTrim);
  root.add(mapDiscMesh, mapRingMesh);

  // Pivote del Astrolabio Flotante
  const astrolabePivot = new THREE.Group();
  astrolabePivot.position.set(0, 1.48, 0);

  // Aro exterior inclinado
  const outerRingMesh = new THREE.Mesh(geos.outerArmillary, mats.bronzeTrim);
  outerRingMesh.rotation.x = Math.PI * 0.22;
  astrolabePivot.add(outerRingMesh);

  // Aro interior perpendicular
  const innerRingMesh = new THREE.Mesh(geos.innerArmillary, mats.hologramMap);
  innerRingMesh.rotation.z = Math.PI * 0.35;
  astrolabePivot.add(innerRingMesh);

  // Núcleo celestial central
  const coreMesh = new THREE.Mesh(geos.celestialCore, mats.celestialCore);
  astrolabePivot.add(coreMesh);

  root.add(astrolabePivot);

  // Luz celestial azulada del mapa
  const light = new THREE.PointLight(0x38bdf8, CARTO_LIGHT_INTENSITY, 8.5, 2.0);
  light.position.set(0, 1.55, 0);
  root.add(light);

  // Polvo estelar orbitante (32 partículas)
  const stardustPos = new Float32Array(CARTO_PARTICLE_COUNT * 3);
  const stardustSpeed = new Float32Array(CARTO_PARTICLE_COUNT);
  for (let k = 0; k < CARTO_PARTICLE_COUNT; k++) {
    const r = 0.20 + Math.random() * 0.40;
    const a = Math.random() * Math.PI * 2;
    stardustPos[k * 3] = Math.cos(a) * r;
    stardustPos[k * 3 + 1] = 1.1 + Math.random() * 0.8;
    stardustPos[k * 3 + 2] = Math.sin(a) * r;
    stardustSpeed[k] = 0.35 + Math.random() * 0.45;
  }
  const stardustGeo = new THREE.BufferGeometry();
  stardustGeo.setAttribute('position', new THREE.BufferAttribute(stardustPos, 3));
  const stardustPoints = new THREE.Points(stardustGeo, mats.stardust);
  root.add(stardustPoints);

  return {
    root,
    baseMesh,
    mapDiscMesh,
    astrolabePivot,
    outerRingMesh,
    innerRingMesh,
    coreMesh,
    light,
    stardustPoints,
    stardustPos,
    stardustSpeed,
    isCartography: true,
  };
}
