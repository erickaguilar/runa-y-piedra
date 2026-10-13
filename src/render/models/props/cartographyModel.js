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
    needleNorth: new THREE.MeshLambertMaterial({
      color: 0xef4444, // Flecha Norte: Carmesí magnético
      emissive: 0x991b1b,
      emissiveIntensity: 0.8,
    }),
    needleSouth: new THREE.MeshLambertMaterial({
      color: 0xf8fafc, // Flecha Sur: Acero / Blanco plata
      emissive: 0x64748b,
      emissiveIntensity: 0.4,
    }),
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
 * aros armilares de orientación y brújula náutica mística (rosa de los vientos y aguja imantada).
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

  // 6. Brújula Cartográfica 3D (Caja cilíndrica de bronce, rosa de los vientos y aguja magnética)
  // Caja / Limbo graduado de la brújula
  const compassCase = new THREE.CylinderGeometry(0.18, 0.18, 0.035, 24);
  const compassRim = new THREE.TorusGeometry(0.18, 0.012, 6, 24);
  compassRim.rotateX(Math.PI / 2);
  const compassCenterPin = new THREE.CylinderGeometry(0.02, 0.02, 0.07, 12);
  const compassDialGeo = mergeGeometries([compassCase, compassRim, compassCenterPin]);
  compassCase.dispose(); compassRim.dispose(); compassCenterPin.dispose();

  // Aguja Norte (Pirámide/Cono carmesí alargado hacia +Z)
  const needleN = new THREE.ConeGeometry(0.04, 0.18, 4);
  needleN.rotateX(Math.PI / 2); // Apunta hacia +Z
  needleN.translate(0, 0.02, 0.09);

  // Aguja Sur (Pirámide/Cono plateado alargado hacia -Z)
  const needleS = new THREE.ConeGeometry(0.04, 0.18, 4);
  needleS.rotateX(-Math.PI / 2); // Apunta hacia -Z
  needleS.translate(0, 0.02, -0.09);

  // Rosa de los vientos: cruz Este-Oeste de latón
  const needleE = new THREE.ConeGeometry(0.025, 0.09, 4);
  needleE.rotateZ(-Math.PI / 2);
  needleE.translate(0.045, 0.015, 0);
  const needleW = new THREE.ConeGeometry(0.025, 0.09, 4);
  needleW.rotateZ(Math.PI / 2);
  needleW.translate(-0.045, 0.015, 0);
  const compassCrossEW = mergeGeometries([needleE, needleW]);
  needleE.dispose(); needleW.dispose();

  // Para retrocompatibilidad
  const celestialCore = compassDialGeo;

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
    compassDialGeo,
    needleN,
    needleS,
    compassCrossEW,
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

  // Brújula náutica mística flotante central
  const compassGroup = new THREE.Group();
  compassGroup.name = 'CompassUnit';

  // Limbo / plato de bronce de la brújula
  const dialMesh = new THREE.Mesh(geos.compassDialGeo, mats.bronzeTrim);
  compassGroup.add(dialMesh);

  // Rosa de los vientos (ejes Este - Oeste)
  const crossEWMesh = new THREE.Mesh(geos.compassCrossEW, mats.bronzeTrim);
  compassGroup.add(crossEWMesh);

  // Aguja imantada articulada: gira marcando el rumbo
  const needleGroup = new THREE.Group();
  needleGroup.name = 'CompassNeedle';
  const needleNMesh = new THREE.Mesh(geos.needleN, mats.needleNorth); // Norte carmesí
  const needleSMesh = new THREE.Mesh(geos.needleS, mats.needleSouth); // Sur blanco plata
  needleGroup.add(needleNMesh, needleSMesh);
  compassGroup.add(needleGroup);

  // Perno central / joya de orientación
  const coreMesh = new THREE.Mesh(geos.celestialCore, mats.celestialCore);
  coreMesh.scale.set(0.35, 0.35, 0.35);
  compassGroup.add(coreMesh);

  astrolabePivot.add(compassGroup);
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
    coreMesh: compassGroup, // Para retrocompatibilidad y giro de la brújula
    compassGroup,
    compassMesh: compassGroup,
    needleGroup,
    dialMesh,
    needleNMesh,
    needleSMesh,
    light,
    stardustPoints,
    stardustPos,
    stardustSpeed,
    isCartography: true,
  };
}
