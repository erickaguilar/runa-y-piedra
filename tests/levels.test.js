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
  assert.ok(floorSprites.floorClean(128).includes('<pattern id="floorA"'), 'floorClean debe generar patrón');
  assert.ok(pillarSprites.pillarMonolith(128).includes('stroke="#0e1015"'), 'pillarMonolith debe tener estrías');
  assert.ok(lavaSprites.lavaActive(128).includes('lava-core-13'), 'lavaActive debe tener gradiente');
  assert.ok(specialSprites.respawnPad(128).includes('38bdf8'), 'respawnPad debe tener glifo cian');
  assert.ok(specialSprites.jumpPad(128).includes('d97706'), 'jumpPad debe tener runa ámbar');
  assert.ok(ceilingSprites.ceilingVault(128).includes('<rect'), 'ceilingVault debe generar SVG');
  assert.ok(ceilingSprites.ceilingCoffered(128).includes('<rect'), 'ceilingCoffered debe generar SVG');
  assert.ok(ceilingSprites.ceilingCracked(128).includes('<path'), 'ceilingCracked debe generar SVG');
  assert.ok(ceilingSprites.ceilingMossy(128).includes('<circle'), 'ceilingMossy debe generar SVG');
  assert.ok(ceilingSprites.ceilingRunic(128).includes('rotate(45'), 'ceilingRunic debe generar glifo rotado');
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

    // Validar estructura base unificada idéntica (fondo térmico, canales de flujo y placas de basalto)
    assert.ok(svg.includes('fill="#450a0a"'), `Lava variante ${i} debe compartir el fondo profundo #450a0a`);
    assert.ok(svg.includes('stroke-width="15"'), `Lava variante ${i} debe compartir los canales térmicos base`);
    assert.ok(svg.includes('points="45,53 63,48 70,58 63,70 47,67"'), `Lava variante ${i} debe compartir las placas de basalto base`);
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

    // Validar estructura base unificada idéntica (fondo sillar cenital, nervaduras de crucería y clave)
    assert.ok(svg.includes('fill="#181a20"'), `Techo variante ${i} debe compartir el fondo de sillar #181a20`);
    assert.ok(svg.includes('stroke="#2d323b" stroke-width="5"'), `Techo variante ${i} debe compartir las nervaduras de crucería base`);
    assert.ok(svg.includes('cx="64" cy="64" r="16"'), `Techo variante ${i} debe compartir la clave central de bóveda`);
  }
});

test('los sprites de pilares no contienen coordenadas fuera de límites [0, 128] y pillarDark comparte el tono base #1c2027', () => {
  const S = 128;
  const pillarVariants = [
    pillarSprites.pillarMonolith(S),
    pillarSprites.pillarFluted(S),
    pillarSprites.pillarMossy(S),
    pillarSprites.pillarCracked(S),
    pillarSprites.pillarDark(S)
  ];

  for (let i = 0; i < pillarVariants.length; i++) {
    const svg = pillarVariants[i];
    assert.doesNotMatch(svg, /\bpoints="[^"]*-\d+/, `Pilar variante ${i} no debe contener coordenadas de puntos negativas`);
    assert.doesNotMatch(svg, /\bpoints="[^"]*13\d+/, `Pilar variante ${i} no debe contener coordenadas de puntos mayores a 128`);
    assert.doesNotMatch(svg, /\bd="[^"]*-\d+/, `Pilar variante ${i} no debe contener coordenadas path negativas`);
    assert.doesNotMatch(svg, /\bd="[^"]*13\d+/, `Pilar variante ${i} no debe contener coordenadas path mayores a 128`);
  }

  // pillarDark debe compartir la base #1c2027 y contener manchas oscuras #040507
  assert.ok(pillarSprites.pillarDark(S).includes('fill="#1c2027"'), 'pillarDark debe usar el mismo tono base #1c2027');
  assert.ok(pillarSprites.pillarDark(S).includes('fill="#040507"'), 'pillarDark debe contener manchas oscuras');
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
  assert.deepEqual(regularLevels.map(l => l.id), ['lobby_tutorial', 'dungeon_classic', 'crypt_inferno', 'abyss_throne']);

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
  assert.equal(world.doors.length, 2);
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


