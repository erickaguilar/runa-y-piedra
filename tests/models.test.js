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
  disposeHeroGearCaches,
} from '../src/render/models/heroes/index.js';
import {
  HERO_PORTRAITS,
  createHeroFaceMaterial,
  createHeroHeadSideMaterial,
  createHeroHeadBackMaterial,
  createHeroChestMaterial,
  disposeHeroPortraitsCache,
} from '../src/heroes/heroPortraits.js';
import { renderIcon, ICONS } from '../src/ui/Icons.js';
import { PLAYER_HEROES } from '../src/config/constants.js';
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

test('Héroes Sumi-e: Guardián integra retrato Pixel Art en UI (Icons, PLAYER_HEROES) y textura facial 3D', () => {
  // 1. Verificación del catálogo de retratos
  assert.ok(HERO_PORTRAITS.guardian, 'HERO_PORTRAITS debe definir al guardián');
  assert.equal(HERO_PORTRAITS.guardian.icon, 'avatar_guardian');
  assert.ok(HERO_PORTRAITS.guardian.svg.includes('shape-rendering="crispEdges"'));
  assert.ok(HERO_PORTRAITS.guardian.body.includes('fill="#d6cfc2"'), 'Debe incluir fondo pergamino Washi');
  assert.ok(HERO_PORTRAITS.guardian.body.includes('fill="#0284c7"'), 'Debe incluir ojos con pupila azul espiritual');

  // 2. Verificación de Icons.js
  assert.ok(ICONS.avatar_guardian, 'ICONS debe incluir avatar_guardian');
  const rendered = renderIcon('avatar_guardian', { size: 36 });
  assert.ok(rendered.includes('shape-rendering="crispEdges"'), 'renderIcon debe incluir shape-rendering');
  assert.ok(rendered.includes('width="36"'));
  const aliasRendered = renderIcon('hero_guardian');
  assert.ok(aliasRendered.includes('viewBox="0 0 32 32"'));

  // 3. Verificación de definición en constants / heroes.json
  const guardianHero = PLAYER_HEROES.find(h => h.id === 'guardian');
  assert.ok(guardianHero, 'PLAYER_HEROES debe incluir al guardián');
  assert.equal(guardianHero.avatar, 'avatar_guardian', 'Guardián debe tener avatar_guardian asignado');

  // 4. Verificación del modelo 3D y asignación de cara frontal (+Z)
  const geos = buildSharedGeometries();
  const mats = buildSharedMaterials();
  const { root, parts } = buildBaseAvatarMesh('#fbbf24', geos, mats);
  const gearGroup = new THREE.Group();
  root.add(gearGroup);

  const initialFace = parts.head.material[4];
  assert.equal(initialFace, mats.face, 'Cara base inicial debe ser mats.face');

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

  const gearMats = GEAR_BUILDERS.guardian(avatarStub, geos, add);
  assert.ok(gearMats.length >= 8, 'Debe devolver materiales de gear más la cara custom');
  assert.notEqual(parts.head.material[4], initialFace, 'La cara frontal (+Z) debe reemplazarse con el material del Guardián');

  // 5. Verificación de _clearGear en AvatarRenderer para restauración de cara
  const dummyScene = new THREE.Scene();
  const ar = new AvatarRenderer(dummyScene);
  const a = ar.ensure(99, '#fbbf24');
  ar.setHeroGear(a, 'guardian');
  assert.notEqual(a.parts.head.material[4], ar._sharedMats.face, 'AvatarRenderer debe aplicar cara del guardián');

  // Al retirar el gear debe volver a _sharedMats.face
  ar._clearGear(a);
  assert.equal(a.parts.head.material[4], ar._sharedMats.face, '_clearGear debe restaurar _sharedMats.face');

  ar.dispose();
});

test('Héroes Sumi-e: Hechicero integra retratos Pixel Art en UI (Icons, PLAYER_HEROES) y texturas 3D de cabeza y pecho', () => {
  // 1. Verificación del catálogo de retratos
  assert.ok(HERO_PORTRAITS.wizard, 'HERO_PORTRAITS debe definir al hechicero');
  assert.equal(HERO_PORTRAITS.wizard.icon, 'avatar_wizard');
  assert.ok(HERO_PORTRAITS.wizard.svg.includes('shape-rendering="crispEdges"'));
  assert.ok(HERO_PORTRAITS.wizard.body.includes('fill="#581c87"'), 'Debe incluir runa amatista en el entrecejo');
  assert.ok(HERO_PORTRAITS.wizard.chestBody.includes('fill="#581c87"'), 'Debe incluir túnica arcana morada en el pecho');

  // 2. Verificación de Icons.js
  assert.ok(ICONS.avatar_wizard, 'ICONS debe incluir avatar_wizard');
  const rendered = renderIcon('avatar_wizard', { size: 36 });
  assert.ok(rendered.includes('shape-rendering="crispEdges"'), 'renderIcon debe incluir shape-rendering');
  assert.ok(rendered.includes('width="36"'));
  const aliasRendered = renderIcon('hero_wizard');
  assert.ok(aliasRendered.includes('viewBox="0 0 32 32"'));

  // 3. Verificación de definición en constants / heroes.json
  const wizardHero = PLAYER_HEROES.find(h => h.id === 'wizard');
  assert.ok(wizardHero, 'PLAYER_HEROES debe incluir al hechicero');
  assert.equal(wizardHero.avatar, 'avatar_wizard', 'Hechicero debe tener avatar_wizard asignado');

  // 4. Verificación del modelo 3D y asignación de cara frontal (+Z) y pecho (+Z)
  const geos = buildSharedGeometries();
  const mats = buildSharedMaterials();
  const { root, parts } = buildBaseAvatarMesh('#a855f7', geos, mats);
  const gearGroup = new THREE.Group();
  root.add(gearGroup);

  const initialFace = parts.head.material[4];
  const initialTorso = parts.torso.material;

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

  const gearMats = GEAR_BUILDERS.wizard(avatarStub, geos, add);
  assert.ok(gearMats.length >= 11, 'Debe devolver materiales de gear más cara y pecho');
  assert.notEqual(parts.head.material[4], initialFace, 'La cara frontal (+Z) debe tener el material del Hechicero');
  assert.ok(Array.isArray(parts.torso.material), 'El torso debe tener materiales por cara');
  assert.notEqual(parts.torso.material[4], initialTorso, 'El pecho frontal (+Z) debe tener el material de túnica con barba');

  // 5. Verificación de _clearGear en AvatarRenderer para restauración de cara y torso
  const dummyScene = new THREE.Scene();
  const ar = new AvatarRenderer(dummyScene);
  const a = ar.ensure(88, '#a855f7');
  ar.setHeroGear(a, 'wizard');
  assert.notEqual(a.parts.head.material[4], ar._sharedMats.face, 'AvatarRenderer debe aplicar cara del hechicero');
  assert.ok(Array.isArray(a.parts.torso.material), 'El torso en AvatarRenderer debe tener material por caras');

  // Al retirar el gear debe volver a _sharedMats.face y túnica original
  ar._clearGear(a);
  assert.equal(a.parts.head.material[4], ar._sharedMats.face, '_clearGear debe restaurar _sharedMats.face');
  assert.equal(Array.isArray(a.parts.torso.material), false, '_clearGear debe restaurar material único del torso');

  ar.dispose();
});

test('Héroes Sumi-e: Explorador integra retrato Pixel Art en UI (Icons, PLAYER_HEROES) y textura facial 3D', () => {
  // 1. Verificación del catálogo de retratos
  assert.ok(HERO_PORTRAITS.ranger, 'HERO_PORTRAITS debe definir al explorador');
  assert.equal(HERO_PORTRAITS.ranger.icon, 'avatar_ranger');
  assert.ok(HERO_PORTRAITS.ranger.svg.includes('shape-rendering="crispEdges"'));
  assert.ok(HERO_PORTRAITS.ranger.body.includes('fill="#d6cfc2"'), 'Debe incluir fondo pergamino Washi');
  assert.ok(HERO_PORTRAITS.ranger.body.includes('fill="#047857"'), 'Debe incluir ojos esmeralda');
  assert.ok(HERO_PORTRAITS.ranger.body.includes('fill="#dc2626"'), 'Debe incluir pluma de aventurero roja');

  // 2. Verificación de Icons.js
  assert.ok(ICONS.avatar_ranger, 'ICONS debe incluir avatar_ranger');
  const rendered = renderIcon('avatar_ranger', { size: 36 });
  assert.ok(rendered.includes('shape-rendering="crispEdges"'), 'renderIcon debe incluir shape-rendering');
  assert.ok(rendered.includes('width="36"'));
  const aliasRendered = renderIcon('hero_ranger');
  assert.ok(aliasRendered.includes('viewBox="0 0 32 32"'));

  // 3. Verificación de definición en constants / heroes.json
  const rangerHero = PLAYER_HEROES.find(h => h.id === 'ranger');
  assert.ok(rangerHero, 'PLAYER_HEROES debe incluir al explorador');
  assert.equal(rangerHero.avatar, 'avatar_ranger', 'Explorador debe tener avatar_ranger asignado');

  // 4. Verificación del modelo 3D y asignación de cara frontal (+Z)
  const geos = buildSharedGeometries();
  const mats = buildSharedMaterials();
  const { root, parts } = buildBaseAvatarMesh('#10b981', geos, mats);
  const gearGroup = new THREE.Group();
  root.add(gearGroup);

  const initialFace = parts.head.material[4];
  assert.equal(initialFace, mats.face, 'Cara base inicial debe ser mats.face');

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

  const gearMats = GEAR_BUILDERS.ranger(avatarStub, geos, add);
  assert.ok(gearMats.length >= 10, 'Debe devolver materiales de gear más la cara custom');
  assert.notEqual(parts.head.material[4], initialFace, 'La cara frontal (+Z) debe tener el material del Explorador');

  // 5. Verificación de _clearGear en AvatarRenderer para restauración de cara
  const dummyScene = new THREE.Scene();
  const ar = new AvatarRenderer(dummyScene);
  const a = ar.ensure(77, '#10b981');
  ar.setHeroGear(a, 'ranger');
  assert.notEqual(a.parts.head.material[4], ar._sharedMats.face, 'AvatarRenderer debe aplicar cara del explorador');

  // Al retirar el gear debe volver a _sharedMats.face
  ar._clearGear(a);
  assert.equal(a.parts.head.material[4], ar._sharedMats.face, '_clearGear debe restaurar _sharedMats.face');

  ar.dispose();
});

test('Héroes Sumi-e: Paladín integra retrato Pixel Art en UI (Icons, PLAYER_HEROES) y textura facial 3D', () => {
  // 1. Verificación del catálogo de retratos
  assert.ok(HERO_PORTRAITS.paladin, 'HERO_PORTRAITS debe definir al paladín');
  assert.equal(HERO_PORTRAITS.paladin.icon, 'avatar_paladin');
  assert.ok(HERO_PORTRAITS.paladin.svg.includes('shape-rendering="crispEdges"'));
  assert.ok(HERO_PORTRAITS.paladin.body.includes('fill="#d6cfc2"'), 'Debe incluir fondo pergamino Washi');
  assert.ok(HERO_PORTRAITS.paladin.body.includes('fill="#1d4ed8"'), 'Debe incluir ojos azul templario');
  assert.ok(HERO_PORTRAITS.paladin.body.includes('fill="#d97706"'), 'Debe incluir filo dorado en el yelmo');

  // 2. Verificación de Icons.js
  assert.ok(ICONS.avatar_paladin, 'ICONS debe incluir avatar_paladin');
  const rendered = renderIcon('avatar_paladin', { size: 36 });
  assert.ok(rendered.includes('shape-rendering="crispEdges"'), 'renderIcon debe incluir shape-rendering');
  assert.ok(rendered.includes('width="36"'));
  const aliasRendered = renderIcon('hero_paladin');
  assert.ok(aliasRendered.includes('viewBox="0 0 32 32"'));

  // 3. Verificación de definición en constants / heroes.json
  const paladinHero = PLAYER_HEROES.find(h => h.id === 'paladin');
  assert.ok(paladinHero, 'PLAYER_HEROES debe incluir al paladín');
  assert.equal(paladinHero.avatar, 'avatar_paladin', 'Paladín debe tener avatar_paladin asignado');

  // 4. Verificación del modelo 3D y asignación de cara frontal (+Z)
  const geos = buildSharedGeometries();
  const mats = buildSharedMaterials();
  const { root, parts } = buildBaseAvatarMesh('#f43f5e', geos, mats);
  const gearGroup = new THREE.Group();
  root.add(gearGroup);

  const initialFace = parts.head.material[4];
  assert.equal(initialFace, mats.face, 'Cara base inicial debe ser mats.face');

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

  const gearMats = GEAR_BUILDERS.paladin(avatarStub, geos, add);
  assert.ok(gearMats.length >= 5, 'Debe devolver materiales de gear más la cara custom');
  assert.notEqual(parts.head.material[4], initialFace, 'La cara frontal (+Z) debe tener el material del Paladín');

  // 5. Verificación de _clearGear en AvatarRenderer para restauración de cara
  const dummyScene = new THREE.Scene();
  const ar = new AvatarRenderer(dummyScene);
  const a = ar.ensure(66, '#f43f5e');
  ar.setHeroGear(a, 'paladin');
  assert.notEqual(a.parts.head.material[4], ar._sharedMats.face, 'AvatarRenderer debe aplicar cara del paladín');

  // Al retirar el gear debe volver a _sharedMats.face
  ar._clearGear(a);
  assert.equal(a.parts.head.material[4], ar._sharedMats.face, '_clearGear debe restaurar _sharedMats.face');

  ar.dispose();
});

test('Héroes Sumi-e: Aventurero integra retrato Pixel Art en UI (Icons, PLAYER_HEROES) y textura facial 3D', () => {
  // 1. Verificación del catálogo de retratos
  assert.ok(HERO_PORTRAITS.adventurer, 'HERO_PORTRAITS debe definir al aventurero');
  assert.equal(HERO_PORTRAITS.adventurer.icon, 'avatar_adventurer');
  assert.ok(HERO_PORTRAITS.adventurer.svg.includes('shape-rendering="crispEdges"'));
  assert.ok(HERO_PORTRAITS.adventurer.body.includes('fill="#d6cfc2"'), 'Debe incluir fondo pergamino Washi');
  assert.ok(HERO_PORTRAITS.adventurer.body.includes('fill="#0369a1"'), 'Debe incluir ojos azul cian');
  assert.ok(HERO_PORTRAITS.adventurer.body.includes('fill="#e7ded0"'), 'Debe incluir tirita en la mejilla');

  // 2. Verificación de Icons.js
  assert.ok(ICONS.avatar_adventurer, 'ICONS debe incluir avatar_adventurer');
  const rendered = renderIcon('avatar_adventurer', { size: 36 });
  assert.ok(rendered.includes('shape-rendering="crispEdges"'), 'renderIcon debe incluir shape-rendering');
  assert.ok(rendered.includes('width="36"'));
  const aliasRendered = renderIcon('hero_adventurer');
  assert.ok(aliasRendered.includes('viewBox="0 0 32 32"'));

  // 3. Verificación de definición en constants / heroes.json
  const adventurerHero = PLAYER_HEROES.find(h => h.id === 'adventurer');
  assert.ok(adventurerHero, 'PLAYER_HEROES debe incluir al aventurero');
  assert.equal(adventurerHero.avatar, 'avatar_adventurer', 'Aventurero debe tener avatar_adventurer asignado');

  // 4. Verificación del modelo 3D y asignación de cara frontal (+Z)
  const geos = buildSharedGeometries();
  const mats = buildSharedMaterials();
  const { root, parts } = buildBaseAvatarMesh('#38bdf8', geos, mats);
  const gearGroup = new THREE.Group();
  root.add(gearGroup);

  const initialFace = parts.head.material[4];
  assert.equal(initialFace, mats.face, 'Cara base inicial debe ser mats.face');

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

  const gearMats = GEAR_BUILDERS.adventurer(avatarStub, geos, add);
  assert.ok(gearMats.length >= 7, 'Debe devolver materiales de gear más la cara custom');
  assert.notEqual(parts.head.material[4], initialFace, 'La cara frontal (+Z) debe tener el material del Aventurero');

  // 5. Verificación de _clearGear en AvatarRenderer para restauración de cara
  const dummyScene = new THREE.Scene();
  const ar = new AvatarRenderer(dummyScene);
  const a = ar.ensure(55, '#38bdf8');
  ar.setHeroGear(a, 'adventurer');
  assert.notEqual(a.parts.head.material[4], ar._sharedMats.face, 'AvatarRenderer debe aplicar cara del aventurero');

  // Al retirar el gear debe volver a _sharedMats.face
  ar._clearGear(a);
  assert.equal(a.parts.head.material[4], ar._sharedMats.face, '_clearGear debe restaurar _sharedMats.face');

  ar.dispose();
});

test('Héroes Sumi-e: Todos los 5 héroes canónicos cuentan con retrato Pixel Art, icono UI y textura 3D', () => {
  const heroIds = ['adventurer', 'paladin', 'ranger', 'wizard', 'guardian'];
  for (const id of heroIds) {
    const heroDef = PLAYER_HEROES.find(h => h.id === id);
    assert.ok(heroDef, `Héroe ${id} debe existir en PLAYER_HEROES`);
    assert.ok(heroDef.avatar, `Héroe ${id} debe tener propiedad avatar`);
    assert.ok(ICONS[heroDef.avatar], `ICONS debe tener entrada para ${heroDef.avatar}`);

    const portrait = HERO_PORTRAITS[id];
    assert.ok(portrait, `HERO_PORTRAITS debe tener entrada para ${id}`);
    assert.ok(portrait.svg, `HERO_PORTRAITS.${id} debe tener svg definido`);
    assert.ok(portrait.body, `HERO_PORTRAITS.${id} debe tener body definido`);
    assert.equal(typeof portrait.drawToCanvas, 'function', `HERO_PORTRAITS.${id} debe tener drawToCanvas`);
  }
});

test('Héroes Sumi-e: Caché Singleton reutiliza materiales y texturas faciales/torso con cero GC', () => {
  disposeHeroPortraitsCache();

  // 1. Invocar varias veces para el mismo héroe debe retornar exactamente la misma instancia (Singleton)
  const faceMat1 = createHeroFaceMaterial('guardian');
  const faceMat2 = createHeroFaceMaterial('guardian');
  assert.equal(faceMat1, faceMat2, 'createHeroFaceMaterial debe devolver la misma instancia cacheada');
  assert.ok(faceMat1.userData?.isShared, 'El material cacheado debe estar marcado como isShared');

  const chestMat1 = createHeroChestMaterial('wizard');
  const chestMat2 = createHeroChestMaterial('wizard');
  assert.equal(chestMat1, chestMat2, 'createHeroChestMaterial debe devolver la misma instancia cacheada');
  assert.ok(chestMat1.userData?.isShared, 'El material de pecho debe estar marcado como isShared');

  // 2. Comprobar que _clearGear en AvatarRenderer no destruye el material singleton
  const dummyScene = new THREE.Scene();
  const ar = new AvatarRenderer(dummyScene);
  const a = ar.ensure(101, '#fbbf24');
  ar.setHeroGear(a, 'guardian');

  // Guardar referencia al material del rostro
  const appliedFaceMat = a.parts.head.material[4];
  assert.equal(appliedFaceMat, faceMat1, 'El material aplicado debe ser el singleton cacheado');

  // Limpiar gear del avatar
  ar._clearGear(a);
  assert.equal(a.parts.head.material[4], ar._sharedMats.face, 'Cara debe restaurarse al default');

  // Volver a consultar material para el guardián
  const faceMatAfter = createHeroFaceMaterial('guardian');
  assert.equal(faceMatAfter, faceMat1, 'El material singleton sigue vivo y utilizable tras _clearGear');

  ar.dispose();
  disposeHeroPortraitsCache();
});

test('Fases 1-5 Héroes 3D: Cachés Singleton de Gear, Texturas de Torso (Volumen Mixto), Sombra de Tinta y Cinemática Secundaria', () => {
  disposeHeroGearCaches();
  disposeHeroPortraitsCache();

  const dummyScene = new THREE.Scene();
  const ar = new AvatarRenderer(dummyScene);
  const heroIds = ['adventurer', 'paladin', 'ranger', 'wizard', 'guardian'];

  // Fase 2: Todos los 5 héroes tienen chestSvg, chestBody y drawChestToCanvas + material de pecho cacheado
  for (const id of heroIds) {
    const p = HERO_PORTRAITS[id];
    assert.ok(p.chestSvg, `${id} debe tener chestSvg definido`);
    assert.ok(p.chestBody, `${id} debe tener chestBody definido`);
    assert.equal(typeof p.drawChestToCanvas, 'function', `${id} debe tener drawChestToCanvas`);

    const cMat1 = createHeroChestMaterial(id);
    const cMat2 = createHeroChestMaterial(id);
    assert.equal(cMat1, cMat2, `createHeroChestMaterial(${id}) debe ser Singleton`);
    assert.ok(cMat1.userData?.isShared, `Material de pecho de ${id} debe tener isShared=true`);
  }

  // Fase 1 y 5: Reutilización de geometrías y materiales compartidos (isShared) y restauración de color de túnica
  const a = ar.ensure(202, '#38bdf8');
  const origTunicHex = a.mats[0].color.getHex();

  // Fase 3: Sombra de contacto Sumi-e octogonal en la base del avatar
  assert.ok(a.parts.shadow instanceof THREE.Mesh, 'El avatar debe incluir malla de sombra de contacto (parts.shadow)');
  assert.equal(a.parts.shadow.name, 'AvatarBlobShadow');

  for (const id of heroIds) {
    ar.setHeroGear(a, id);
    assert.ok(Array.isArray(a.parts.torso.material), `El torso de ${id} debe usar arreglo multimaterial con cara frontal texturizada`);
    assert.ok(a.gearNodes.length > 0, `${id} debe registrar gearNodes para volumen mixto`);

    // Verificar que todas las geometrías y materiales del gear están marcados como isShared
    for (const { obj } of a.gearNodes) {
      obj.traverse((child) => {
        if (child.isMesh) {
          assert.equal(child.geometry.userData?.isShared, true, `Geometría en ${id} debe ser compartida (Singleton)`);
        }
      });
    }
    for (const m of a.gearMats) {
      assert.equal(m.userData?.isShared, true, `Material en ${id} debe ser compartido (Singleton)`);
    }
  }

  // Al limpiar gear después de clases que oscurecen túnica (guardian/ranger), el color original debe restaurarse intacto
  ar._clearGear(a);
  assert.equal(a.mats[0].color.getHex(), origTunicHex, 'El color de la túnica debe restaurarse sin degradación acumulativa');

  // Fase 4: Cinemática secundaria en AvatarRenderer.update(dt) (caminata, salto, capa, faldón, cristal y early-exit)
  ar.setHeroGear(a, 'wizard');
  ar.setTarget(202, 0, 1.0, 0, 0, true);
  ar.setTarget(202, 2.0, 1.6, 2.0, 0.5, true); // movimiento horizontal + salto vertical
  const prevCrystalRotY = a.parts.crystal.rotation.y;
  ar.update(0.05);
  assert.notEqual(a.parts.crystal.rotation.y, prevCrystalRotY, 'El cristal arcano del Hechicero debe rotar en update(dt)');
  assert.ok(a.parts.shadow.scale.x < 1.0, 'La sombra de contacto debe encogerse dinámicamente al elevarse en un salto');

  // Early-exit cuando el avatar está oculto
  a.mesh.visible = false;
  const frozenPhase = a.phase;
  ar.update(0.05);
  assert.equal(a.phase, frozenPhase, 'Un avatar oculto (visible=false) no debe consumir CPU en update(dt)');

  ar.dispose();
  disposeHeroGearCaches();
  disposeHeroPortraitsCache();
});

test('Héroes Sumi-e 360°: Los 5 héroes integran texturas laterales (+X/-X) y trasera (-Z) en la cabeza 3D', () => {
  disposeHeroPortraitsCache();

  const heroIds = ['guardian', 'wizard', 'ranger', 'paladin', 'adventurer'];
  const dummyScene = new THREE.Scene();
  const ar = new AvatarRenderer(dummyScene);
  const a = ar.ensure(303, '#fbbf24');

  for (const id of heroIds) {
    // 1. Verificar definición en HERO_PORTRAITS[id]
    const def = HERO_PORTRAITS[id];
    assert.ok(def.sideSvg && def.sideBody, `${id} debe definir sideSvg y sideBody`);
    assert.ok(def.backSvg && def.backBody, `${id} debe definir backSvg y backBody`);
    assert.equal(typeof def.drawSideToCanvas, 'function', `${id} debe definir drawSideToCanvas`);
    assert.equal(typeof def.drawBackToCanvas, 'function', `${id} debe definir drawBackToCanvas`);

    // 2. Verificar factorías Singleton de materiales laterales ('R' y 'L') y trasero
    const sideR1 = createHeroHeadSideMaterial(id, 'R');
    const sideR2 = createHeroHeadSideMaterial(id, 'R');
    const sideL1 = createHeroHeadSideMaterial(id, 'L');
    const back1 = createHeroHeadBackMaterial(id);
    const back2 = createHeroHeadBackMaterial(id);

    assert.equal(sideR1, sideR2, `createHeroHeadSideMaterial(${id}, R) debe ser Singleton`);
    assert.notEqual(sideR1, sideL1, `Lado derecho (+X) e izquierdo (-X) de ${id} deben tener instancias distintas (simetría invertida)`);
    assert.equal(back1, back2, `createHeroHeadBackMaterial(${id}) debe ser Singleton`);
    assert.ok(sideR1.userData?.isShared && sideL1.userData?.isShared && back1.userData?.isShared);

    // 3. Verificar asignación en las caras del cubo de la cabeza [0:+X, 1:-X, 4:+Z, 5:-Z]
    ar.setHeroGear(a, id);
    assert.equal(a.parts.head.material[0], sideR1, `Cara +X (índice 0) debe tener sideRightMat de ${id}`);
    assert.equal(a.parts.head.material[1], sideL1, `Cara -X (índice 1) debe tener sideLeftMat de ${id}`);
    assert.equal(a.parts.head.material[4], createHeroFaceMaterial(id), `Cara +Z (índice 4) debe tener faceMat de ${id}`);
    assert.equal(a.parts.head.material[5], back1, `Cara -Z (índice 5) debe tener backMat de ${id}`);
  }

  ar._clearGear(a);
  assert.equal(a.parts.head.material[0], ar._sharedMats.skin, '_clearGear debe restaurar cara +X a skin');
  assert.equal(a.parts.head.material[1], ar._sharedMats.skin, '_clearGear debe restaurar cara -X a skin');
  assert.equal(a.parts.head.material[4], ar._sharedMats.face, '_clearGear debe restaurar cara +Z a face');
  assert.equal(a.parts.head.material[5], ar._sharedMats.skin, '_clearGear debe restaurar cara -Z a skin');

  ar.dispose();
  disposeHeroPortraitsCache();
});







