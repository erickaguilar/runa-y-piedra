import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { floorVariant } from '../src/levels/LevelLoader.js';
import { BLOCK_TYPES } from '../src/config/constants.js';
import { VoxelMap } from '../src/render/VoxelMap.js';
import {
  createTilesSvgArray,
  wallSprites,
  floorSprites,
  pillarSprites,
  lavaSprites,
  specialSprites,
  ceilingSprites
} from '../src/render/textures/index.js';

test('floorVariant es determinista y solo da tipos de suelo', () => {
  const a = floorVariant(7, 19);
  assert.equal(floorVariant(7, 19), a);
  assert.ok([BLOCK_TYPES.FLOOR_STONE, BLOCK_TYPES.FLOOR_WORN, BLOCK_TYPES.FLOOR_MOSS].includes(a));
  const seen = new Set();
  for (let x = 0; x < 24; x++) {
    for (let z = 0; z < 36; z++) seen.add(floorVariant(x, z));
  }
  assert.ok(seen.size >= 2, 'sin variación de suelo');
});

test('divider sella bajo el umbral hasta MIN_Y', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  assert.equal(world.get(5, -1, 11), BLOCK_TYPES.WALL);
  assert.equal(world.get(5, -8, 11), BLOCK_TYPES.WALL);
});

test('perímetro baja hasta MIN_Y', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  assert.equal(world.get(0, -8, 10), BLOCK_TYPES.WALL);
});

test('escalinata explícita respeta openFromStart', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('lobby_tutorial'));
  assert.equal(world.stairwells[0].open, false);
  assert.equal(world.stairsOpen, false);
});

test('LevelLoader instala losas de respawn rúnicas (RESPAWN_PAD) bajo el spawn principal', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('lobby_tutorial'));
  // El spawn en lobby_tutorial está a un bloque de la pared: x=12.0, z=2.5 -> bloque y=0, x en [11, 12], z en [2, 3]
  assert.equal(world.get(11, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(11, 0, 3), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 3), BLOCK_TYPES.RESPAWN_PAD);
  // El bloque z=1 es el bloque de separación respecto a la pared trasera z=0
  assert.notEqual(world.get(11, 0, 1), BLOCK_TYPES.RESPAWN_PAD);
  assert.notEqual(world.get(12, 0, 1), BLOCK_TYPES.RESPAWN_PAD);
});

test('LevelLoader instala una única losa de respawn rúnica por mazmorra en la entrada', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  // Spawn único principal en la entrada a 1 bloque de la pared (2x2)
  assert.equal(world.get(11, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(11, 0, 3), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 3), BLOCK_TYPES.RESPAWN_PAD);

  // Las salas intermedias y checkpoints NO tienen losa de respawn
  assert.notEqual(world.get(11, 0, 12), BLOCK_TYPES.RESPAWN_PAD);
  assert.notEqual(world.get(12, 0, 12), BLOCK_TYPES.RESPAWN_PAD);

  // Conteo exhaustivo: exactamente 4 bloques de RESPAWN_PAD en todo el mapa
  let padCount = 0;
  for (let i = 0; i < world.blocks.length; i++) {
    if (world.blocks[i] === BLOCK_TYPES.RESPAWN_PAD) padCount++;
  }
  assert.equal(padCount, 4, 'Solo debe existir una única plataforma de respawn (4 bloques) por mazmorra');
});

test('VoxelMap asigna el Tile 11 al bloque RESPAWN_PAD', () => {
  assert.equal(VoxelMap.selectTile(11, 0, 4, BLOCK_TYPES.RESPAWN_PAD), 11);
});

test('VoxelMap distribuye deterministamente las 5 variantes de sprites para el bloque LAVA', () => {
  const validTiles = new Set([13, 16, 17, 18, 19]);
  const seen = new Set();
  for (let x = 0; x < 24; x++) {
    for (let z = 0; z < 36; z++) {
      const tile = VoxelMap.selectTile(x, -1, z, BLOCK_TYPES.LAVA);
      assert.ok(validTiles.has(tile), `Tile ${tile} debe ser una de las variantes válidas de lava`);
      seen.add(tile);
    }
  }
  assert.equal(seen.size, 5, 'Debe generar las 5 variantes distintas de lava');
});

test('VoxelMap distribuye deterministamente las 5 variantes de sprites para el bloque PILLAR', () => {
  const validTiles = new Set([10, 12, 20, 21, 22]);
  const seen = new Set();
  for (let x = 0; x < 24; x++) {
    for (let z = 0; z < 36; z++) {
      for (let y = 1; y <= 5; y++) {
        const tile = VoxelMap.selectTile(x, y, z, BLOCK_TYPES.PILLAR);
        assert.ok(validTiles.has(tile), `Tile ${tile} debe ser una de las variantes válidas de pilar`);
        seen.add(tile);
      }
    }
  }
  assert.equal(seen.size, 5, 'Debe generar las 5 variantes distintas de pilares (base, lisa, musgo, desgaste, oscuro)');
});

test('VoxelMap.getTileUVOffset calcula coordenadas UV exactas para la cuadrícula 4x8', () => {
  assert.deepEqual(VoxelMap.getTileUVOffset(0), { u: 0.0, v: 0.875 });
  assert.deepEqual(VoxelMap.getTileUVOffset(13), { u: 0.25, v: 0.5 });
  assert.deepEqual(VoxelMap.getTileUVOffset(16), { u: 0.0, v: 0.375 });
  assert.deepEqual(VoxelMap.getTileUVOffset(19), { u: 0.75, v: 0.375 });
  assert.deepEqual(VoxelMap.getTileUVOffset(20), { u: 0.0, v: 0.25 });
  assert.deepEqual(VoxelMap.getTileUVOffset(21), { u: 0.25, v: 0.25 });
  assert.deepEqual(VoxelMap.getTileUVOffset(22), { u: 0.5, v: 0.25 });
  assert.deepEqual(VoxelMap.getTileUVOffset(23), { u: 0.75, v: 0.25 });
  assert.deepEqual(VoxelMap.getTileUVOffset(24), { u: 0.0, v: 0.125 });
  assert.deepEqual(VoxelMap.getTileUVOffset(25), { u: 0.25, v: 0.125 });
  assert.deepEqual(VoxelMap.getTileUVOffset(26), { u: 0.5, v: 0.125 });
  assert.deepEqual(VoxelMap.getTileUVOffset(27), { u: 0.75, v: 0.125 });
});

test('VoxelMap distribuye deterministamente las 5 variantes de sprites para el bloque CEILING', () => {
  const validTiles = new Set([23, 24, 25, 26, 27]);
  const seen = new Set();
  for (let x = 0; x < 24; x++) {
    for (let z = 0; z < 36; z++) {
      const tile = VoxelMap.selectTile(x, 6, z, BLOCK_TYPES.CEILING);
      assert.ok(validTiles.has(tile), `Tile ${tile} debe ser una de las variantes válidas de techo`);
      seen.add(tile);
    }
  }
  assert.equal(seen.size, 5, 'Debe generar las 5 variantes distintas de techo (bóveda, artesonado, fracturas, musgo, rúnico)');
});

test('VoxelMap distribuye deterministamente las 5 variantes de sprites para el bloque WALL con ~80% regular', () => {
  const validTiles = new Set([0, 1, 2, 3, 4]);
  const seen = new Set();
  let regularCount = 0;
  let total = 0;
  for (let x = 0; x < 24; x++) {
    for (let z = 0; z < 36; z++) {
      for (let y = 0; y < 4; y++) {
        const tile = VoxelMap.selectTile(x, y, z, BLOCK_TYPES.WALL);
        assert.ok(validTiles.has(tile), `Tile ${tile} debe ser una de las variantes válidas de muro`);
        seen.add(tile);
        if (tile === 0) regularCount++;
        total++;
      }
    }
  }
  assert.equal(seen.size, 5, 'Debe generar las 5 variantes distintas de muro');
  const regularRatio = regularCount / total;
  assert.ok(regularRatio >= 0.75 && regularRatio <= 0.85, `El sillar regular debe representar ~80% (obtenido ${(regularRatio * 100).toFixed(1)}%)`);
});

test('createTilesSvgArray y módulos de texturas generan los 28 sprites SVG modulares válidos', () => {
  const tilesSvg = createTilesSvgArray(128);
  assert.ok(Array.isArray(tilesSvg), 'createTilesSvgArray debe devolver un arreglo');
  assert.ok(tilesSvg.length >= 28, 'Debe contener al menos 28 casillas con sprites activos');

  // Validar que cada uno de los 28 tiles tiene contenido SVG sustancial
  for (let i = 0; i <= 27; i++) {
    const tile = tilesSvg[i];
    assert.ok(typeof tile === 'string' && tile.trim().length > 20, `Tile ${i} debe ser un fragmento SVG válido`);
    assert.ok(tile.includes('<rect') || tile.includes('<circle') || tile.includes('<path') || tile.includes('<defs') || tile.includes('<g'), `Tile ${i} debe contener elementos SVG`);
  }

  // Validar módulos individuales
  assert.ok(wallSprites.wallRegular(128).includes('<rect'), 'wallRegular debe generar SVG');
  assert.ok(floorSprites.floorClean(128).includes('fill="#0c0a09"'), 'floorClean debe tener fondo de mortero #0c0a09');
  assert.ok((pillarSprites.pillarRegular || pillarSprites.pillarMonolith)(128).includes('stroke="#78716c"'), 'pillarRegular debe tener estrías');
  assert.ok((lavaSprites.lavaFlow || lavaSprites.lavaActive)(128).includes('stroke-width="1"'), 'lavaActive debe tener trazo fino de 1px');
  assert.ok(specialSprites.respawnPad(128).includes('38bdf8'), 'respawnPad debe tener glifo cian');
  assert.ok(specialSprites.jumpPad(128).includes('d97706'), 'jumpPad debe tener runa ámbar');
  assert.ok(ceilingSprites.ceilingVault(128).includes('<rect'), 'ceilingVault debe generar SVG');
  assert.ok(ceilingSprites.ceilingCoffered(128).includes('<rect'), 'ceilingCoffered debe generar SVG');
  assert.ok(ceilingSprites.ceilingCracked(128).includes('<path'), 'ceilingCracked debe generar SVG');
  assert.ok(ceilingSprites.ceilingMossy(128).includes('<circle'), 'ceilingMossy debe generar SVG');
  assert.ok(ceilingSprites.ceilingRunic(128).includes('stroke="#ea580c"'), 'ceilingRunic debe generar runa #ea580c');
});

test('los sprites de lava no contienen coordenadas fuera de límites [0, 128] para evitar sangrado a celdas adyacentes', () => {
  const S = 128;
  const lavaVariants = [
    lavaSprites.lavaActive(S),
    lavaSprites.lavaFissures(S),
    lavaSprites.lavaGeysers(S),
    lavaSprites.lavaRiver(S),
    lavaSprites.lavaCaldera(S)
  ];

  for (let i = 0; i < lavaVariants.length; i++) {
    const svg = lavaVariants[i];
    // No debe contener polígonos con coordenadas negativas como -2 ni mayores a 128 como 130 o 134
    assert.doesNotMatch(svg, /\bpoints="[^"]*-\d+/, `Lava variante ${i} no debe contener coordenadas de puntos negativas`);
    assert.doesNotMatch(svg, /\bpoints="[^"]*13\d+/, `Lava variante ${i} no debe contener coordenadas de puntos mayores a 128`);
    assert.doesNotMatch(svg, /\bd="[^"]*-\d+/, `Lava variante ${i} no debe contener coordenadas path negativas`);
    assert.doesNotMatch(svg, /\bd="[^"]*13\d+/, `Lava variante ${i} no debe contener coordenadas path mayores a 128`);

    // Validar estructura base continua (fondo térmico #450a0a, basalto oscuro #0c0a09 y trazos de 1px)
    assert.ok(svg.includes('fill="#450a0a"'), `Lava variante ${i} debe compartir el fondo profundo #450a0a`);
    assert.ok(svg.includes('fill="#0c0a09"'), `Lava variante ${i} debe compartir las costras de basalto #0c0a09`);
    assert.ok(svg.includes('stroke-width="1"'), `Lava variante ${i} debe operar con trazos finos de 1px`);
  }
});

test('los sprites de techo no contienen coordenadas fuera de límites [0, 128] para evitar sangrado a celdas adyacentes', () => {
  const S = 128;
  const ceilingVariants = [
    ceilingSprites.ceilingVault(S),
    ceilingSprites.ceilingCoffered(S),
    ceilingSprites.ceilingCracked(S),
    ceilingSprites.ceilingMossy(S),
    ceilingSprites.ceilingRunic(S)
  ];

  for (let i = 0; i < ceilingVariants.length; i++) {
    const svg = ceilingVariants[i];
    assert.doesNotMatch(svg, /\bpoints="[^"]*-\d+/, `Techo variante ${i} no debe contener coordenadas de puntos negativas`);
    assert.doesNotMatch(svg, /\bpoints="[^"]*13\d+/, `Techo variante ${i} no debe contener coordenadas de puntos mayores a 128`);
    assert.doesNotMatch(svg, /\bd="[^"]*-\d+/, `Techo variante ${i} no debe contener coordenadas path negativas`);
    assert.doesNotMatch(svg, /\bd="[^"]*13\d+/, `Techo variante ${i} no debe contener coordenadas path mayores a 128`);

    // Validar estructura de mortero oscuro de cripta #0c0a09 y trazos de 1px
    assert.ok(svg.includes('fill="#0c0a09"'), `Techo variante ${i} debe compartir el fondo de mortero #0c0a09`);
    assert.ok(svg.includes('stroke-width="1"'), `Techo variante ${i} debe operar con trazos de 1px`);
  }
});

test('los sprites de pilares no contienen coordenadas fuera de límites [0, 128] y comparten la paleta de cantería oscura', () => {
  const S = 128;
  const pillarVariants = [
    (pillarSprites.pillarRegular || pillarSprites.pillarMonolith)(S),
    (pillarSprites.pillarTorch || pillarSprites.pillarFluted)(S),
    pillarSprites.pillarMossy(S),
    pillarSprites.pillarCracked(S),
    (pillarSprites.pillarRunic || pillarSprites.pillarDark)(S)
  ];

  for (let i = 0; i < pillarVariants.length; i++) {
    const svg = pillarVariants[i];
    assert.doesNotMatch(svg, /\bpoints="[^"]*-\d+/, `Pilar variante ${i} no debe contener coordenadas de puntos negativas`);
    assert.doesNotMatch(svg, /\bpoints="[^"]*13\d+/, `Pilar variante ${i} no debe contener coordenadas de puntos mayores a 128`);
    assert.doesNotMatch(svg, /\bd="[^"]*-\d+/, `Pilar variante ${i} no debe contener coordenadas path negativas`);
    assert.doesNotMatch(svg, /\bd="[^"]*13\d+/, `Pilar variante ${i} no debe contener coordenadas path mayores a 128`);

    // Validar base unificada de mortero negro carbón
    assert.ok(svg.includes('fill="#0c0a09"'), `Pilar variante ${i} debe compartir el fondo de mortero #0c0a09`);
  }

  // pillarRunic debe contener el glifo rúnico Heretic #ea580c y núcleo incandescente
  const runicSvg = (pillarSprites.pillarRunic || pillarSprites.pillarDark)(S);
  assert.ok(runicSvg.includes('stroke="#ea580c"'), 'pillarRunic debe contener runa arcana #ea580c');
  assert.ok(runicSvg.includes('fill="#f59e0b"'), 'pillarRunic debe contener núcleo incandescente');
});

test('abyss_throne Sala 1 contiene el cofre con la poción de vida para recuperar 1 corazón', () => {
  const world = new World();
  const abyssData = world.levelRegistry.getLevel('abyss_throne');
  assert.ok(abyssData, 'El nivel abyss_throne debe existir');
  const chest1 = abyssData.chests?.find(c => c.id === 1);
  assert.ok(chest1, 'El cofre 1 debe existir en abyss_throne');
  assert.ok(chest1.potion, 'El cofre 1 debe otorgar una poción');
  assert.equal(chest1.potion.id, 'pocion_vida');
  assert.equal(chest1.potion.healAmount, 1);
  assert.ok(chest1.reward.includes('Poción de Vida'));
  assert.ok(chest1.message.includes('+1 :heart:'));
});

test('dev_showroom está registrado pero aislado de la campaña regular', () => {
  const world = new World();
  const registry = world.levelRegistry;

  // Existe en el registry
  const devLvl = registry.getLevel('dev_showroom');
  assert.ok(devLvl, 'dev_showroom debe estar registrado');
  assert.equal(devLvl.id, 'dev_showroom');
  assert.equal(devLvl.isDevOnly, true);
  assert.equal(devLvl.hiddenFromCampaign, true);

  // La campaña regular (getAllLevels(false)) debe excluir dev_showroom
  const regularLevels = registry.getAllLevels(false);
  assert.equal(regularLevels.some(l => l.id === 'dev_showroom'), false, 'dev_showroom no debe aparecer en la campaña');
  assert.deepEqual(regularLevels.map(l => l.id), [
    'lobby_tutorial',
    'dungeon_classic',
    'crypt_inferno',
    'abyss_throne',
    'shadow_vault',
    'shadow_chasm',
    'shadow_sanctum'
  ]);

  // getAllLevels(true) debe incluir dev_showroom
  const allLevelsWithDev = registry.getAllLevels(true);
  assert.equal(allLevelsWithDev.some(l => l.id === 'dev_showroom'), true);

  // Mecánicas de llaves y puertas en el showroom
  const chest1 = devLvl.chests?.find(c => c.id === 1);
  assert.ok(chest1, 'Cofre 1 debe existir en dev_showroom');
  assert.equal(chest1.givesKey, 'llave_showroom');

  const door2 = devLvl.doors?.find(d => d.id === 2);
  assert.ok(door2, 'Puerta 2 debe existir en dev_showroom');
  assert.equal(door2.requiresKey, 'llave_showroom');

  // Cofre 2 (gemas) y Cofre 3 (poción)
  const chest2 = devLvl.chests?.find(c => c.id === 2);
  assert.equal(chest2.gems, 250);
  const chest3 = devLvl.chests?.find(c => c.id === 3);
  assert.equal(chest3.potion?.id, 'pocion_vida');

  // Puede cargarse en World sin errores
  assert.doesNotThrow(() => {
    world.loadLevel(devLvl);
  });
  assert.equal(world.doors.length, 3, 'dev_showroom cuenta con 3 puertas (incluyendo la Puerta 3 de la sala de pruebas)');
  assert.equal(world.chests.length, 3);
  assert.equal(world.objectives.length, 1);
  assert.equal(world.stairwells.length, 1);
  assert.equal(world.monoliths.length, 1, 'Debe registrar el monolito cartográfico (Atlas)');
  const cartoMonolith = devLvl.monoliths?.find(m => m.id === 'cartography');
  assert.ok(cartoMonolith, 'Monolito de Cartografía (Atlas) debe existir en dev_showroom');
  assert.equal(cartoMonolith.type, 'cartography');

  let jumpPadCount = 0;
  for (let i = 0; i < world.blocks.length; i++) {
    if (world.blocks[i] === BLOCK_TYPES.JUMP_PAD) jumpPadCount++;
  }
  assert.ok(jumpPadCount > 0, 'Debe registrar bloques JUMP_PAD');
});

test('dev_showroom el punto de spawn no contiene bloques sólidos en el cuerpo del jugador', () => {
  const world = new World();
  const devLvl = world.levelRegistry.getLevel('dev_showroom');
  world.loadLevel(devLvl);

  const sp = devLvl.spawn;
  const sx = Math.floor(sp.x);
  const sz = Math.floor(sp.z);
  // En las capas y=1 e y=2 (altura del jugador) en torno al spawn, debe ser aire (0)
  for (let x = sx - 1; x <= sx + 1; x++) {
    for (let z = sz - 1; z <= sz + 1; z++) {
      assert.equal(world.get(x, 1, z), 0, `Bloque en x=${x}, y=1, z=${z} obstruye el spawn`);
      assert.equal(world.get(x, 2, z), 0, `Bloque en x=${x}, y=2, z=${z} obstruye el spawn`);
    }
  }

  // La losa bajo los pies del spawn (y=0) debe ser la losa rúnica RESPAWN_PAD
  assert.equal(world.get(11, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 2), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(11, 0, 3), BLOCK_TYPES.RESPAWN_PAD);
  assert.equal(world.get(12, 0, 3), BLOCK_TYPES.RESPAWN_PAD);
});

test('Orientación de cofres: los niveles cargan y calculan yaw en pasos de 90 grados', () => {
  const world = new World();

  // dungeon_classic: cofre 1 mira al oeste (3PI/2 rad), cofre 2 mira al este (PI/2 rad)
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  const dc1 = world.chests.find(c => c.id === 1);
  const dc2 = world.chests.find(c => c.id === 2);
  assert.equal(dc1.yaw, (3 * Math.PI) / 2);
  assert.equal(dc2.yaw, Math.PI / 2);

  // dev_showroom: cofre 1 mira al este, cofre 2 al sur, cofre 3 al oeste
  world.loadLevel(world.levelRegistry.getLevel('dev_showroom'));
  const s1 = world.chests.find(c => c.id === 1);
  const s2 = world.chests.find(c => c.id === 2);
  const s3 = world.chests.find(c => c.id === 3);
  assert.equal(s1.yaw, Math.PI / 2);
  assert.equal(s2.yaw, 0);
  assert.equal(s3.yaw, (3 * Math.PI) / 2);
});

test('Orientación fija de spawn: los niveles declaran o calculan yaw en spawnPoint y checkpoints', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));

  assert.equal(world.spawnPoint.yaw, Math.PI, 'Spawn point de dungeon_classic debe mirar al norte (+Z, yaw = PI)');
  for (const cp of world.checkpoints) {
    assert.equal(cp.yaw, Math.PI, 'Checkpoints de dungeon_classic deben preservar yaw = PI');
  }

  // Comprobar con orientación personalizada
  const customLevel = {
    id: 'custom_spawn_test',
    spawn: { x: 5, y: 1.2, z: 8, facing: 'east' },
    checkpoints: [{ id: 'cp1', minZ: 0, maxZ: 10, respawn: { x: 5, y: 1.2, z: 8, facing: 'west' } }],
  };
  world.loadLevel(customLevel);
  assert.equal(world.spawnPoint.yaw, Math.PI / 2, 'Facing east debe ser PI / 2');
  assert.equal(world.checkpoints[0].yaw, (3 * Math.PI) / 2, 'Checkpoint facing west debe ser 3*PI / 2');
});

test('shadow_vault: muros divisores contienen dinteles superiores sólidos (y=3,4,5) sobre las puertas', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('shadow_vault'));

  // Puerta 1 en z=11, x=11..12
  for (const x of [11, 12]) {
    assert.equal(world.get(x, 1, 11), BLOCK_TYPES.DOOR, `x=${x}, y=1, z=11 debe ser DOOR`);
    assert.equal(world.get(x, 2, 11), BLOCK_TYPES.DOOR, `x=${x}, y=2, z=11 debe ser DOOR`);
    assert.equal(world.get(x, 3, 11), BLOCK_TYPES.WALL, `x=${x}, y=3, z=11 debe ser WALL (dintel)`);
    assert.equal(world.get(x, 4, 11), BLOCK_TYPES.WALL, `x=${x}, y=4, z=11 debe ser WALL (dintel)`);
    assert.equal(world.get(x, 5, 11), BLOCK_TYPES.WALL, `x=${x}, y=5, z=11 debe ser WALL (dintel)`);
  }

  // Puertas Gemelas en z=43: Puerta 2 (x=5..6) y Puerta 3 (x=17..18)
  for (const x of [5, 6, 17, 18]) {
    assert.equal(world.get(x, 1, 43), BLOCK_TYPES.DOOR, `x=${x}, y=1, z=43 debe ser DOOR`);
    assert.equal(world.get(x, 2, 43), BLOCK_TYPES.DOOR, `x=${x}, y=2, z=43 debe ser DOOR`);
    assert.equal(world.get(x, 3, 43), BLOCK_TYPES.WALL, `x=${x}, y=3, z=43 debe ser WALL (dintel superior)`);
    assert.equal(world.get(x, 4, 43), BLOCK_TYPES.WALL, `x=${x}, y=4, z=43 debe ser WALL (dintel superior)`);
    assert.equal(world.get(x, 5, 43), BLOCK_TYPES.WALL, `x=${x}, y=5, z=43 debe ser WALL (dintel superior)`);
  }
});

test('ensureStairsState talla la fosa física y abre la escalinata en shadow_vault (openFromStart: true)', async () => {
  const { InteractionController } = await import('../src/controllers/InteractionController.js');
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('shadow_vault'));

  let setOpenInstantCalled = false;
  const mockGame = {
    mode: 'host',
    world,
    voxelMap: {
      removeBlock: () => {},
      addBlock: () => {},
      setTint: () => {},
    },
    stairsRenderer: {
      loadStairs: () => {},
      setOpenInstant: () => { setOpenInstantCalled = true; },
    },
    soundManager: { playSlabGrind: () => {} },
    ui: { showNarrativeMessage: () => {} },
  };

  const ctrl = new InteractionController(mockGame);
  const rect = ctrl.stairPitRect();
  assert.ok(rect, 'rectángulo de escalinata debe existir');
  assert.equal(rect.open, true, 'rect.open debe ser true por openFromStart');

  // Antes de ensureStairsState, el suelo y=0 está cubierto por STONE_FLOOR de las regiones
  assert.equal(ctrl.isPitOpenInBlocks(rect), false);

  // Al invocar ensureStairsState, talla la fosa y abre la escalinata
  ctrl.ensureStairsState();
  assert.equal(ctrl.isPitOpenInBlocks(rect), true, 'la fosa física debe quedar tallada a AIR');
  assert.equal(mockGame.world.stairsOpen, true);
  assert.equal(setOpenInstantCalled, true, 'setOpenInstant debe haber sido invocado');
});

test('Puertas independientes del mapa: _installDoors genera vano sólido, dinteles y jambas sin regiones declarativas', () => {
  const customLevel = {
    id: 'test_isolated_doors',
    name: 'Nivel con puertas autónomas',
    dimensions: { sizeX: 24, sizeY: 16, sizeZ: 40 },
    spawn: { x: 12, y: 1.2, z: 2 },
    doors: [
      { id: 99, name: "Puerta Mágica Autónoma", x1: 8, x2: 10, y1: 1, y2: 3, z: 20 }
    ],
    regions: []
  };

  const world = new World();
  world.loadLevel(customLevel);

  // Vano cerrado
  assert.equal(world.get(8, 1, 20), BLOCK_TYPES.DOOR);
  assert.equal(world.get(9, 1, 20), BLOCK_TYPES.DOOR);
  assert.equal(world.get(8, 2, 20), BLOCK_TYPES.DOOR);
  assert.equal(world.get(9, 2, 20), BLOCK_TYPES.DOOR);

  // Dintel superior (y=3, 4, 5)
  for (let y = 3; y <= 5; y++) {
    assert.equal(world.get(8, y, 20), BLOCK_TYPES.WALL, `dintel en y=${y} debe ser WALL`);
    assert.equal(world.get(9, y, 20), BLOCK_TYPES.WALL, `dintel en y=${y} debe ser WALL`);
  }

  // Jambas laterales
  assert.equal(world.get(7, 1, 20), BLOCK_TYPES.WALL);
  assert.equal(world.get(10, 1, 20), BLOCK_TYPES.WALL);
});

test('Colisión y atravesabilidad de puertas: cerrada es impenetrable y abierta es transitable', async () => {
  const { tryMove } = await import('../src/core/PhysicsAABB.js');
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('shadow_vault'));

  // Puerta 1 cerrada: impenetrable
  const p = { x: 11.5, y: 1.0, z: 10.2 };
  const resClosed = tryMove(world, p, 0, 0, 1.5);
  assert.equal(resClosed.hitZ, true);
  assert.ok(p.z <= 10.3, 'No debe atravesar la puerta 1 cerrada');

  // Abrir puerta 1: transitable
  world.openDoor(1);
  const resOpen = tryMove(world, p, 0, 0, 1.5);
  assert.ok(p.z > 11.0, 'Debe atravesar la puerta 1 abierta');

  // Cerrar puerta 1: vuelve a ser impenetrable
  world.closeDoor(1);
  p.z = 10.2;
  const resClosedAgain = tryMove(world, p, 0, 0, 1.5);
  assert.equal(resClosedAgain.hitZ, true);
  assert.ok(p.z <= 10.3, 'No debe atravesar la puerta 1 re-cerrada');
});

test('DoorRenderer: genera marco arquitectónico 3D con dintel de piedra para cada puerta', async () => {
  const THREE = await import('three');
  const { DoorRenderer } = await import('../src/render/DoorRenderer.js');
  const scene = new THREE.Scene();
  const renderer = new DoorRenderer(scene);

  renderer.loadDoors([
    { id: 1, name: 'Puerta Principal', x1: 11, x2: 13, y1: 1, y2: 3, z: 11 }
  ]);

  const doorRecord = renderer.doors.get(1);
  assert.ok(doorRecord, 'registro de puerta debe existir');
  assert.ok(doorRecord.frame, 'marco 3D frame debe existir');
  assert.equal(doorRecord.frame.name, 'DoorFrame');
  assert.ok(doorRecord.frame.children.length >= 2, 'debe contener sillares de piedra y herrajes');

  renderer.dispose();
});


