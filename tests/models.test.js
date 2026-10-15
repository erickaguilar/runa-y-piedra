import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

// Importar constructores 3D modulares
import {
  buildSharedGeometries,
  buildSharedMaterials,
  buildBaseAvatarMesh,
  GEAR_BUILDERS,
  createNameSprite,
} from '../src/render/models/heroes/index.js';
import { AvatarRenderer } from '../src/render/AvatarRenderer.js';
import { HeroShowcaseRenderer } from '../src/render/HeroShowcaseRenderer.js';
import { PropShowcaseRenderer } from '../src/render/PropShowcaseRenderer.js';
import devShowroom from '../src/levels/data/dev_showroom.json' with { type: 'json' };

import {
  createChestGeometries,
  createChestMaterials,
  buildChestMesh,
  createDoorGeometries,
  createDoorMaterials,
  buildDoorLeaf,
  buildDoorFrame,
  createPedestalGeometries,
  createPedestalMaterials,
  buildPedestalMesh,
  createStairsMaterials,
  buildStairsMesh,
  createPressurePlateGeometries,
  createPressurePlateMaterials,
  buildPressurePlateMesh,
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
  assert.ok(parts.neck instanceof THREE.Mesh, 'neck debe ser Mesh');
  assert.equal(heroMats.length, 3, 'Debe devolver materiales propios de túnica, manga y pantalón');
});

test('Modelos Héroes: GEAR_BUILDERS construye el equipamiento para las 5 clases de héroe', () => {
  const geos = buildSharedGeometries();
  const mats = buildSharedMaterials();

  const heroClasses = ['adventurer', 'paladin', 'ranger', 'wizard', 'guardian'];
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

test('Nameplate: resolución de displayName para apodos y clases de héroe', () => {
  // 1. Jugador 1: nombre "Roberto", héroe Paladín → debe decir "Roberto"
  const s1 = createNameSprite('Roberto', '#f43f5e', 'paladin');
  assert.equal(s1.userData.displayName, 'Roberto');
  assert.equal(s1.userData.heroId, 'paladin');

  // 2. Jugador 2: sin nombre ("" o null), héroe Hechicero → debe decir "Hechicero"
  const s2 = createNameSprite('', '#a855f7', 'wizard');
  assert.equal(s2.userData.displayName, 'Hechicero');
  assert.equal(s2.userData.heroId, 'wizard');

  const s2Null = createNameSprite(null, '#a855f7', 'wizard');
  assert.equal(s2Null.userData.displayName, 'Hechicero');

  // 3. Jugador 3: sin nombre, héroe Aventurero → debe decir "Aventurero"
  const s3 = createNameSprite('', '#38bdf8', 'adventurer');
  assert.equal(s3.userData.displayName, 'Aventurero');

  // 4. Caso bug: nombre legacy por defecto "Aventurero", pero héroe Paladín → debe decir "Paladín"
  const s4 = createNameSprite('Aventurero', '#f43f5e', 'paladin');
  assert.equal(s4.userData.displayName, 'Paladín');

  // 5. AvatarRenderer.setMetadata integra heroId y actualiza el sprite correctamente
  const dummyScene = new THREE.Scene();
  const ar = new AvatarRenderer(dummyScene);
  ar.setMetadata(1, '', '#f43f5e', 'paladin');
  const av = ar.avatars.get(1);
  assert.ok(av.sprite, 'El sprite debe estar creado en el avatar');
  assert.equal(av.sprite.userData.displayName, 'Paladín');

  // Si luego se le asigna apodo explícito
  ar.setMetadata(1, 'SirErick', '#f43f5e', 'paladin');
  assert.equal(av.sprite.userData.displayName, 'SirErick');

  ar.dispose();
});

test('HeroShowcaseRenderer: carga y exhibe los 5 avatares en la nueva sala del showroom', () => {
  const scene = new THREE.Scene();
  const showcaseRenderer = new HeroShowcaseRenderer(scene);

  assert.ok(Array.isArray(devShowroom.heroShowcases), 'devShowroom debe definir heroShowcases');
  assert.equal(devShowroom.heroShowcases.length, 5, 'devShowroom debe tener 5 héroes');

  showcaseRenderer.loadShowcases(devShowroom.heroShowcases);
  assert.equal(showcaseRenderer.showcases.length, 5, 'Debe haber 5 avatares cargados en el showroom');

  const heroIds = showcaseRenderer.showcases.map(s => s.id);
  assert.deepEqual(heroIds, ['adventurer', 'paladin', 'ranger', 'wizard', 'guardian']);

  for (const s of showcaseRenderer.showcases) {
    assert.ok(s.root instanceof THREE.Group, 'Cada avatar debe tener una malla root');
    assert.ok(s.sprite instanceof THREE.Sprite, 'Cada avatar debe tener su sprite nameplate');
    assert.ok(s.gearMats.length > 0, 'Cada avatar debe tener materiales de gear cargados');
  }

  showcaseRenderer.dispose();
  assert.equal(showcaseRenderer.showcases.length, 0);
});

test('Modelos Props: buildPressurePlateMesh construye losa estándar y losa de presencia continua (Hold)', () => {
  const geos = createPressurePlateGeometries();
  const mats = createPressurePlateMaterials();

  assert.ok(geos.frameGeo instanceof THREE.BoxGeometry);
  assert.ok(geos.plateGeo instanceof THREE.BoxGeometry);
  assert.ok(geos.runeGeo instanceof THREE.CylinderGeometry);
  assert.ok(geos.runeHoldRingGeo instanceof THREE.RingGeometry);
  assert.ok(mats.runeHoldInactive instanceof THREE.MeshLambertMaterial);
  assert.ok(mats.runeHoldActive instanceof THREE.MeshLambertMaterial);

  // 1. Losa de trigger estándar
  const standard = buildPressurePlateMesh(geos, mats, { action: 'open_door', mode: 'trigger' });
  assert.ok(standard.root instanceof THREE.Group);
  assert.ok(standard.platePivot instanceof THREE.Object3D);
  assert.equal(standard.runeMesh.material, mats.runeInactive);
  assert.equal(standard.light.color.getHex(), 0xf59e0b);

  // 2. Losa de presencia continua (Hold)
  const hold = buildPressurePlateMesh(geos, mats, { action: 'open_door', mode: 'hold' });
  assert.ok(hold.root instanceof THREE.Group);
  assert.ok(hold.platePivot instanceof THREE.Object3D);
  assert.equal(hold.runeMesh.material, mats.runeHoldInactive);
  assert.equal(hold.light.color.getHex(), 0x10b981);

  // La losa hold debe incluir el anillo de forja concéntrico en platePivot
  const rings = hold.platePivot.children.filter(c => c.geometry === geos.runeHoldRingGeo);
  assert.equal(rings.length, 1, 'Debe incluir el anillo concéntrico de forja para la losa hold');

  for (const m of Object.values(mats)) m.dispose();
  for (const g of Object.values(geos)) g.dispose();
});

test('PropShowcaseRenderer: carga todos los props de dev_showroom sin colisiones ni interactuadores', () => {
  const scene = new THREE.Scene();
  const renderer = new PropShowcaseRenderer(scene);

  assert.ok(Array.isArray(devShowroom.propShowcases), 'devShowroom debe tener propShowcases');
  assert.equal(devShowroom.propShowcases.length, 12, 'Deben existir 12 props de exhibición');

  renderer.loadShowcases(devShowroom.propShowcases);
  assert.equal(renderer.showcases.length, 12);

  assert.ok(scene.children.includes(renderer.group));

  for (const s of renderer.showcases) {
    assert.ok(s.root instanceof THREE.Group, `${s.id} debe tener una raíz Group`);
    assert.ok(s.sprite instanceof THREE.Sprite, `${s.id} debe tener una etiqueta Sprite`);
    assert.ok(s.name, `${s.id} debe tener un nombre`);
    assert.ok(s.type, `${s.id} debe tener un tipo`);
    assert.ok(renderer.group.children.includes(s.root));
  }

  // Comprobar actualización de animaciones
  renderer.update(0.016);

  // Comprobar búsqueda por coordenadas para el raycaster / mira de debug
  const found = renderer.findShowcaseAt(5, 70);
  assert.ok(found, 'Debe encontrar el cofre cerrado en x=5, z=70');
  assert.equal(found.id, 'showcase_chest_closed');

  const foundPlate = renderer.findShowcaseAt(12, 86);
  assert.ok(foundPlate, 'Debe encontrar la losa hold en x=12, z=86');
  assert.equal(foundPlate.id, 'showcase_plate_hold');

  // Comprobar que las puertas modeladas tienen el marco alineado a y=1.0 (no en medio a y=0)
  const doorClosed = renderer.showcases.find(s => s.type === 'door_closed');
  assert.ok(doorClosed);
  const frameClosed = doorClosed.root.getObjectByName('DoorFrame');
  assert.ok(frameClosed, 'door_closed debe contener DoorFrame');
  assert.equal(frameClosed.position.y, 1.0, 'DoorFrame debe estar alineado a y=1.0 en door_closed');

  const doorOpen = renderer.showcases.find(s => s.type === 'door_open');
  assert.ok(doorOpen);
  const frameOpen = doorOpen.root.getObjectByName('DoorFrame');
  assert.ok(frameOpen, 'door_open debe contener DoorFrame');
  assert.equal(frameOpen.position.y, 1.0, 'DoorFrame debe estar alineado a y=1.0 en door_open');

  // Limpieza completa
  renderer.dispose();
  assert.equal(renderer.showcases.length, 0);
  assert.equal(scene.children.length, 0);
});

test('Modelos Puertas: createDoorMaterials define polygonOffset y buildDoorFrame evita Z-fighting', () => {
  const mats = createDoorMaterials(null);
  assert.equal(mats.stone.polygonOffset, true);
  assert.equal(mats.stone.polygonOffsetFactor, -1.0);
  assert.equal(mats.stoneAccent.polygonOffset, true);
  assert.equal(mats.iron.polygonOffset, true);

  const frame = buildDoorFrame(2.0, 2.0, mats);
  assert.equal(frame.name, 'DoorFrame');
  assert.ok(frame.children.length >= 2);

  for (const m of Object.values(mats)) m.dispose();
});

test('Modelos Pedestales: geometrías y accesorios únicos para Classic, Abismo y Mercader', () => {
  // 1. Altar Clásico: fuste con 4 contrafuertes, Cáliz Sagrado 3D y Esencia Solar flotante
  const classicGeos = createPedestalGeometries('classic');
  const classicMats = createPedestalMaterials('classic');
  assert.equal(classicGeos.variant, 'classic');
  assert.ok(classicGeos.crystal instanceof THREE.BufferGeometry, 'Debe incluir la geometría del Cáliz Sagrado');
  assert.ok(classicGeos.accessory instanceof THREE.BufferGeometry, 'Debe incluir la Esencia Solar');
  const classicModel = buildPedestalMesh(classicGeos, classicMats);
  assert.ok(classicModel.root instanceof THREE.Group);
  assert.ok(classicModel.crystalMesh instanceof THREE.Mesh);
  assert.ok(classicModel.accessoryMesh instanceof THREE.Mesh);

  // 2. Altar Abisal: fuste hexagonal con 4 colmillos, Ojo del Vacío 3D y Corona de Sombras
  const abyssGeos = createPedestalGeometries('abyss');
  const abyssMats = createPedestalMaterials('abyss');
  assert.equal(abyssGeos.variant, 'abyss');
  assert.ok(abyssGeos.crystal instanceof THREE.BufferGeometry, 'Debe incluir el Ojo del Vacío');
  assert.ok(abyssGeos.accessory instanceof THREE.BufferGeometry, 'Debe incluir la Corona / Creciente de Sombras');
  const abyssModel = buildPedestalMesh(abyssGeos, abyssMats);
  assert.ok(abyssModel.crystalMesh instanceof THREE.Mesh);
  assert.ok(abyssModel.accessoryMesh instanceof THREE.Mesh);

  // 3. Pedestal Mercader: fuste octogonal, mostrador con cuenco, Balanza de Comercio (Scales) y gema tasadora
  const merchantGeos = createPedestalGeometries('merchant');
  const merchantMats = createPedestalMaterials('merchant');
  assert.equal(merchantGeos.variant, 'merchant');
  assert.ok(merchantGeos.scalesGeo instanceof THREE.BufferGeometry, 'Debe incluir la geometría de la balanza de comercio');
  assert.ok(merchantGeos.accessory instanceof THREE.BufferGeometry, 'Debe incluir la gema de tasación en el platillo');
  const merchantModel = buildPedestalMesh(merchantGeos, merchantMats);
  assert.ok(merchantModel.crystalMesh instanceof THREE.Mesh, 'Debe instanciar la balanza central');
  assert.ok(merchantModel.accessoryMesh instanceof THREE.Mesh, 'Debe instanciar accesorio de pesaje');

  // Limpieza de recursos de la prueba
  for (const g of Object.values(classicGeos)) g?.dispose?.();
  for (const m of Object.values(classicMats)) m?.dispose?.();
  for (const g of Object.values(abyssGeos)) g?.dispose?.();
  for (const m of Object.values(abyssMats)) m?.dispose?.();
  for (const g of Object.values(merchantGeos)) g?.dispose?.();
  for (const m of Object.values(merchantMats)) m?.dispose?.();
});

test('Mesa de Cartografía: integra Brújula náutica 3D (dial, rosa de los vientos y aguja magnética)', async () => {
  const { createCartographyGeometries, createCartographyMaterials, buildCartographyTableMesh } = await import('../src/render/models/props/cartographyModel.js');

  const geos = createCartographyGeometries();
  const mats = createCartographyMaterials();

  assert.ok(geos.compassDialGeo instanceof THREE.BufferGeometry);
  assert.ok(geos.needleN instanceof THREE.BufferGeometry);
  assert.ok(geos.needleS instanceof THREE.BufferGeometry);
  assert.ok(geos.compassCrossEW instanceof THREE.BufferGeometry);

  assert.ok(mats.needleNorth instanceof THREE.MeshLambertMaterial);
  assert.ok(mats.needleSouth instanceof THREE.MeshLambertMaterial);

  const carto = buildCartographyTableMesh(geos, mats);
  assert.ok(carto.root instanceof THREE.Group);
  assert.ok(carto.compassGroup instanceof THREE.Group);
  assert.ok(carto.needleGroup instanceof THREE.Group);
  assert.ok(carto.needleNMesh instanceof THREE.Mesh);
  assert.ok(carto.needleSMesh instanceof THREE.Mesh);

  // Comprobar que la aguja Norte tiene el material carmesí
  assert.equal(carto.needleNMesh.material, mats.needleNorth);
  assert.equal(carto.needleSMesh.material, mats.needleSouth);

  for (const g of Object.values(geos)) g?.dispose?.();
  for (const m of Object.values(mats)) m?.dispose?.();
});

test('Escalinata Ancestral: Mejora A integra Brocal 3D de cantería fija con rieles y cromática adaptativa (oro/fuego vs amatista/abismo)', () => {
  const rect = { x1: 11, x2: 12, z1: 31, z2: 33 };

  // 1. Tema Clásico (Capítulo 1: Mazmorra Ancestral y Cripta de Fuego)
  const classicMats = createStairsMaterials(null, 'classic');
  assert.equal(classicMats.lightColor, 0xea580c, 'Luz abisal clásica debe ser ígnea / ámbar');
  assert.equal(classicMats.gold.color.getHex(), 0xf59e0b, 'Runas deben ser de oro solar');

  const classicModel = buildStairsMesh(rect, classicMats, 'classic');
  assert.ok(classicModel.root instanceof THREE.Group);
  assert.ok(classicModel.slab instanceof THREE.Group, 'Debe contener la losa corrediza');
  assert.ok(classicModel.frame instanceof THREE.Group, 'Debe contener el marco brocal 3D de cantería');
  assert.equal(classicModel.frame.name, 'StairsStoneFrame');
  assert.ok(classicModel.frame.children.length >= 3, 'El marco debe incluir bordillos, rieles de forja y cantoneras');
  assert.equal(classicModel.pitLight.color.getHex(), 0xea580c);
  assert.equal(classicModel.root.children.includes(classicModel.frame), true, 'El marco debe estar anclado a root');

  // 2. Tema Abisal (Capítulo 2: Cripta de las Sombras)
  const abyssMats = createStairsMaterials(null, 'abyss');
  assert.equal(abyssMats.lightColor, 0x8b5cf6, 'Luz abisal de sombras debe ser violeta / amatista');
  assert.equal(abyssMats.gold.color.getHex(), 0xc084fc, 'Runas deben ser de amatista espectral');

  const abyssModel = buildStairsMesh(rect, abyssMats, 'abyss');
  assert.equal(abyssModel.pitLight.color.getHex(), 0x8b5cf6);
  assert.ok(abyssModel.frame instanceof THREE.Group);

  for (const m of Object.values(classicMats)) m?.dispose?.();
  for (const m of Object.values(abyssMats)) m?.dispose?.();
});

