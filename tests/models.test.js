import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

// Importar constructores 3D modulares
import {
  buildSharedGeometries,
  buildSharedMaterials,
  buildBaseAvatarMesh,
  GEAR_BUILDERS,
} from '../src/render/models/heroes/index.js';

import {
  createChestGeometries,
  createChestMaterials,
  buildChestMesh,
  createDoorGeometries,
  createDoorMaterials,
  buildDoorLeaf,
  createPedestalGeometries,
  createPedestalMaterials,
  buildPedestalMesh,
  createStairsMaterials,
  buildStairsMesh,
} from '../src/render/models/props/index.js';
import { ChestRenderer } from '../src/render/ChestRenderer.js';
import { parseOrientationYaw } from '../src/levels/LevelLoader.js';

test('Modelos Héroes: buildSharedGeometries y buildSharedMaterials generan geometrías y materiales válidos', () => {
  const geos = buildSharedGeometries();
  assert.ok(geos.head instanceof THREE.BoxGeometry, 'head debe ser BoxGeometry');
  assert.ok(geos.torso instanceof THREE.BoxGeometry, 'torso debe ser BoxGeometry');
  assert.ok(geos.belt instanceof THREE.BoxGeometry, 'belt debe ser BoxGeometry');
  assert.ok(geos.arm instanceof THREE.BoxGeometry, 'arm debe ser BoxGeometry');
  assert.ok(geos.leg instanceof THREE.BoxGeometry, 'leg debe ser BoxGeometry');

  const mats = buildSharedMaterials();
  assert.ok(mats.skin instanceof THREE.MeshLambertMaterial, 'skin debe ser MeshLambertMaterial');
  assert.ok(mats.face instanceof THREE.MeshLambertMaterial, 'face debe ser MeshLambertMaterial');
  assert.ok(mats.pants instanceof THREE.MeshLambertMaterial, 'pants debe ser MeshLambertMaterial');
  assert.ok(mats.belt instanceof THREE.MeshLambertMaterial, 'belt debe ser MeshLambertMaterial');
});

test('Modelos Héroes: buildBaseAvatarMesh construye la jerarquía 3D con pivotes articulados', () => {
  const geos = buildSharedGeometries();
  const mats = buildSharedMaterials();
  const { root, parts, mats: heroMats } = buildBaseAvatarMesh('#38bdf8', geos, mats);

  assert.ok(root instanceof THREE.Group, 'root debe ser THREE.Group');
  assert.ok(parts.armLPivot instanceof THREE.Group, 'armLPivot debe ser Group');
  assert.ok(parts.armRPivot instanceof THREE.Group, 'armRPivot debe ser Group');
  assert.ok(parts.legLPivot instanceof THREE.Group, 'legLPivot debe ser Group');
  assert.ok(parts.legRPivot instanceof THREE.Group, 'legRPivot debe ser Group');
  assert.equal(heroMats.length, 2, 'Debe devolver materiales propios de túnica y pelo');
});

test('Modelos Héroes: GEAR_BUILDERS construye el equipamiento para las 4 clases de héroe', () => {
  const geos = buildSharedGeometries();
  const mats = buildSharedMaterials();

  const heroClasses = ['paladin', 'ranger', 'wizard', 'guardian'];
  for (const hero of heroClasses) {
    const { root, parts } = buildBaseAvatarMesh('#38bdf8', geos, mats);
    const gearGroup = new THREE.Group();
    root.add(gearGroup);

    const avatarStub = {
      mesh: root,
      gear: gearGroup,
      parts,
    };

    const added = [];
    const add = (obj, parent) => {
      parent.add(obj);
      added.push({ obj, parent });
    };

    const gearMats = GEAR_BUILDERS[hero](avatarStub, geos, add);
    assert.ok(Array.isArray(gearMats), `${hero} debe devolver un array de materiales`);
    assert.ok(added.length > 0, `${hero} debe agregar nodos de equipamiento 3D`);
  }
});

test('Modelos Props: createChestGeometries y buildChestMesh generan cofre 3D articulado', () => {
  const geos = createChestGeometries();
  assert.ok(geos.baseWoodGeo, 'baseWoodGeo debe existir');
  assert.ok(geos.baseIronGeo, 'baseIronGeo debe existir');
  assert.ok(geos.lidWoodGeo, 'lidWoodGeo debe existir');
  assert.ok(geos.lidIronGeo, 'lidIronGeo debe existir');
  assert.ok(geos.goldMoundGeo, 'goldMoundGeo debe existir');

  const mats = createChestMaterials(null);
  const { chestGroup, lidPivot, lootLight } = buildChestMesh(geos, mats);

  assert.ok(chestGroup instanceof THREE.Group, 'chestGroup debe ser THREE.Group');
  assert.ok(lidPivot instanceof THREE.Group, 'lidPivot debe ser THREE.Group');
  assert.ok(lootLight instanceof THREE.PointLight, 'lootLight debe ser THREE.PointLight');
});

test('Modelos Props: createDoorGeometries y buildDoorLeaf generan hojas batientes', () => {
  const geos = createDoorGeometries();
  assert.ok(geos.leftWood, 'leftWood debe existir');
  assert.ok(geos.rightWood, 'rightWood debe existir');
  assert.ok(geos.leftIron, 'leftIron debe existir');
  assert.ok(geos.rightIron, 'rightIron debe existir');

  const mats = createDoorMaterials(null);

  const leftLeaf = buildDoorLeaf(+1, geos, mats);
  const rightLeaf = buildDoorLeaf(-1, geos, mats);

  assert.ok(leftLeaf instanceof THREE.Group, 'leftLeaf debe ser THREE.Group');
  assert.ok(rightLeaf instanceof THREE.Group, 'rightLeaf debe ser THREE.Group');
  assert.equal(leftLeaf.children.length, 2, 'Hoja debe tener panel de madera y herrajes');

  // El herraje de forja debe terminar antes del canto batiente (1.00m) para evitar Z-fighting
  geos.leftIron.computeBoundingBox();
  geos.rightIron.computeBoundingBox();
  assert.ok(geos.leftIron.boundingBox.max.x < 1.00, 'El herraje izquierdo debe terminar antes del canto (x < 1.00)');
  assert.ok(geos.rightIron.boundingBox.min.x > -1.00, 'El herraje derecho debe terminar antes del canto (x > -1.00)');
});

test('Modelos Props: createPedestalGeometries y buildPedestalMesh construyen altar y runas', () => {
  const geos = createPedestalGeometries();
  assert.ok(geos.stoneBase, 'stoneBase debe existir');
  assert.ok(geos.column, 'column debe existir');
  assert.ok(geos.runeDisc, 'runeDisc debe existir');
  assert.ok(geos.crystal, 'crystal debe existir');

  const mats = createPedestalMaterials('classic');
  const { root, runePivot, crystalMesh, light, embers } = buildPedestalMesh(geos, mats);

  assert.ok(root instanceof THREE.Group, 'root debe ser THREE.Group');
  assert.ok(runePivot instanceof THREE.Group, 'runePivot debe ser THREE.Group');
  assert.ok(crystalMesh instanceof THREE.Mesh, 'crystalMesh debe ser THREE.Mesh');
  assert.ok(light instanceof THREE.PointLight, 'light debe ser THREE.PointLight');
  assert.ok(embers instanceof THREE.Points, 'embers debe ser THREE.Points');
});

test('Modelos Props: createStairsMaterials y buildStairsMesh construyen losa y niebla', () => {
  const mats = createStairsMaterials();
  assert.ok(mats.wood instanceof THREE.MeshLambertMaterial, 'wood material debe existir en los materiales de escaleras');
  assert.ok(mats.stoneDark instanceof THREE.MeshLambertMaterial, 'stoneDark material debe existir');

  const rect = { x1: 11, x2: 12, z1: 31, z2: 33 };
  const { root, slab, pitLight, fog } = buildStairsMesh(rect, mats);

  assert.ok(root instanceof THREE.Group, 'root debe ser THREE.Group');
  assert.ok(slab instanceof THREE.Group, 'slab debe ser THREE.Group');
  assert.ok(pitLight instanceof THREE.PointLight, 'pitLight debe ser THREE.PointLight');
  assert.ok(fog instanceof THREE.Points, 'fog debe ser THREE.Points');

  // La losa debe incluir el cuerpo de tablones de madera estilo puerta
  const hasWoodMesh = slab.children.some(c => c.isMesh && c.material === mats.wood);
  assert.ok(hasWoodMesh, 'slab debe contener una malla de tablones de madera estilo puerta');
});

test('ChestRenderer: parseChestYaw y parseOrientationYaw resuelven orientaciones de 90 grados', () => {
  // Puntos cardinales en inglés y español
  assert.equal(parseOrientationYaw({ facing: 'south' }), 0);
  assert.equal(parseOrientationYaw({ facing: 'sur' }), 0);
  assert.equal(parseOrientationYaw({ facing: 's' }), 0);

  assert.equal(parseOrientationYaw({ facing: 'east' }), Math.PI / 2);
  assert.equal(parseOrientationYaw({ facing: 'este' }), Math.PI / 2);
  assert.equal(parseOrientationYaw({ facing: 'e' }), Math.PI / 2);

  assert.equal(parseOrientationYaw({ facing: 'north' }), Math.PI);
  assert.equal(parseOrientationYaw({ facing: 'norte' }), Math.PI);
  assert.equal(parseOrientationYaw({ facing: 'n' }), Math.PI);

  assert.equal(parseOrientationYaw({ facing: 'west' }), (3 * Math.PI) / 2);
  assert.equal(parseOrientationYaw({ facing: 'oeste' }), (3 * Math.PI) / 2);
  assert.equal(parseOrientationYaw({ facing: 'w' }), (3 * Math.PI) / 2);

  // Grados sexagesimales (rotation / angle)
  assert.equal(ChestRenderer.parseChestYaw({ rotation: 0 }), 0);
  assert.equal(ChestRenderer.parseChestYaw({ rotation: 90 }), Math.PI / 2);
  assert.equal(ChestRenderer.parseChestYaw({ angle: 180 }), Math.PI);
  assert.equal(ChestRenderer.parseChestYaw({ rotation: 270 }), (3 * Math.PI) / 2);
  assert.equal(ChestRenderer.parseChestYaw({ rotation: -90 }), (-90 * Math.PI) / 180);

  // Radianes directos (yaw)
  assert.equal(ChestRenderer.parseChestYaw({ yaw: 1.23 }), 1.23);

  // Valor por defecto sin configuración
  assert.equal(ChestRenderer.parseChestYaw({}), 0);
  assert.equal(ChestRenderer.parseChestYaw(null), 0);
});

test('ChestRenderer: loadChests aplica rotaciones de 90 grados a chestGroup y preserva yaw', () => {
  const scene = new THREE.Scene();
  const renderer = new ChestRenderer(scene);

  const configs = [
    { id: 1, x: 10, y: 1, z: 10, facing: 'south' },
    { id: 2, x: 20, y: 1, z: 20, facing: 'east' },
    { id: 3, x: 30, y: 1, z: 30, rotation: 180 },
    { id: 4, x: 40, y: 1, z: 40, direction: 'west' },
  ];

  renderer.loadChests(configs);

  const c1 = renderer.chests.get(1);
  const c2 = renderer.chests.get(2);
  const c3 = renderer.chests.get(3);
  const c4 = renderer.chests.get(4);

  assert.equal(c1.chestGroup.rotation.y, 0, 'Cofre 1 debe mirar al Sur (0 rad)');
  assert.equal(c1.yaw, 0);

  assert.equal(c2.chestGroup.rotation.y, Math.PI / 2, 'Cofre 2 debe mirar al Este (PI/2 rad)');
  assert.equal(c2.yaw, Math.PI / 2);

  assert.equal(c3.chestGroup.rotation.y, Math.PI, 'Cofre 3 debe mirar al Norte (PI rad)');
  assert.equal(c3.yaw, Math.PI);

  assert.equal(c4.chestGroup.rotation.y, (3 * Math.PI) / 2, 'Cofre 4 debe mirar al Oeste (3PI/2 rad)');
  assert.equal(c4.yaw, (3 * Math.PI) / 2);

  // Apertura y resorte funcionan independientemente de la orientación
  assert.equal(renderer.isChestOpen(2), false);
  const opened = renderer.openChest(2);
  assert.equal(opened, true);
  assert.equal(renderer.isChestOpen(2), true);
  assert.equal(c2.chestGroup.rotation.y, Math.PI / 2, 'La rotación del cofre debe conservarse al abrirse');

  renderer.dispose();
});
