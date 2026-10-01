import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

// Importar constructores 3D modulares
import {
  buildSharedGeometries,
  buildSharedMaterials,
  createNameSprite,
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
  const rect = { x1: 11, x2: 12, z1: 31, z2: 33 };
  const { root, slab, pitLight, fog } = buildStairsMesh(rect, mats);

  assert.ok(root instanceof THREE.Group, 'root debe ser THREE.Group');
  assert.ok(slab instanceof THREE.Group, 'slab debe ser THREE.Group');
  assert.ok(pitLight instanceof THREE.PointLight, 'pitLight debe ser THREE.PointLight');
  assert.ok(fog instanceof THREE.Points, 'fog debe ser THREE.Points');
});
