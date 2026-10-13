import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { ChapterRegistry } from '../src/levels/ChapterRegistry.js';
import { LevelRegistry } from '../src/levels/LevelRegistry.js';
import { InteractionController } from '../src/controllers/InteractionController.js';
import { BlockRaycaster } from '../src/interaction/BlockRaycaster.js';

test('Capítulo 2 - LevelRegistry registra los 3 niveles del Capítulo 2', () => {
  const lr = new LevelRegistry();
  assert.ok(lr.getLevel('shadow_vault'), 'Debe existir shadow_vault');
  assert.ok(lr.getLevel('shadow_chasm'), 'Debe existir shadow_chasm');
  assert.ok(lr.getLevel('shadow_sanctum'), 'Debe existir shadow_sanctum');

  assert.equal(lr.getLevel('shadow_vault').id, 'shadow_vault');
  assert.equal(lr.getLevel('shadow_chasm').id, 'shadow_chasm');
  assert.equal(lr.getLevel('shadow_sanctum').id, 'shadow_sanctum');
});

test('Capítulo 2 - ChapterRegistry define Cripta de las Sombras como jugable y con su trilogía de mazmorras', () => {
  const cr = new ChapterRegistry();
  const ch2 = cr.getChapter(2);
  assert.ok(ch2, 'Capítulo 2 debe existir');
  assert.equal(ch2.id, 'capitulo_2');
  assert.equal(ch2.name, 'Cripta de las Sombras');
  assert.equal(ch2.underConstruction, undefined, 'No debe estar marcado en construcción');

  const dungeons = cr.getDungeonsForChapter(2);
  assert.equal(dungeons.length, 3, 'Debe tener exactamente 3 mazmorras');
  assert.equal(dungeons[0].id, 'shadow_vault');
  assert.equal(dungeons[1].id, 'shadow_chasm');
  assert.equal(dungeons[2].id, 'shadow_sanctum');

  // Transición de mazmorras dentro del capítulo
  assert.equal(cr.getNextDungeonInChapter('shadow_vault')?.id, 'shadow_chasm');
  assert.equal(cr.getNextDungeonInChapter('shadow_chasm')?.id, 'shadow_sanctum');
  assert.equal(cr.getNextDungeonInChapter('shadow_sanctum'), null);
  assert.equal(cr.isLastDungeonInChapter('shadow_sanctum'), true);
  assert.equal(cr.isLastDungeonInChapter('shadow_vault'), false);

  // Desbloqueo y jugabilidad
  cr.progress.highestChapterUnlocked = 2;
  assert.equal(cr.isChapterUnlocked(2), true);
  assert.equal(cr.isChapterPlayable(2), true, 'Capítulo 2 debe ser jugable cuando está desbloqueado');
});

test('Capítulo 2 - Nivel 1 (shadow_vault) incorpora puzzle cooperativo de Puertas Gemelas y losas cruzadas', () => {
  const world = new World();
  const levelData = world.levelRegistry.getLevel('shadow_vault');
  world.loadLevel(levelData);

  assert.equal(world.doors.length, 3, 'shadow_vault debe tener 3 puertas (Puerta 1 y Puertas Gemelas 2 y 3)');
  assert.equal(world.pressurePlates.length, 3, 'shadow_vault debe tener 3 losas');

  const p1 = world.pressurePlates.find(p => p.id === 'losa_umbral_boveda');
  const pIzq = world.pressurePlates.find(p => p.id === 'losa_gemela_izq');
  const pDer = world.pressurePlates.find(p => p.id === 'losa_gemela_der');

  assert.ok(p1 && pIzq && pDer);
  assert.equal(p1.targetDoorId, 1, 'Losa 1 abre Puerta 1');
  assert.equal(pIzq.targetDoorId, 3, 'Losa Izquierda abre la Puerta Derecha (cross-activation)');
  assert.equal(pDer.targetDoorId, 2, 'Losa Derecha abre la Puerta Izquierda (cross-activation)');

  assert.equal(world.stairwells.length, 1, 'Debe tener escalinata hacia el nivel 2');
  assert.equal(world.chests.length, 2, 'Debe tener 2 cofres con recompensas');

  // El umbral inmediatamente tras la Puerta 1 (z=12 y z=13) debe estar despejado para transitar
  assert.equal(world.get(11, 1, 12), 0, 'Bloque (11, 1, 12) tras Puerta 1 debe ser AIRE');
  assert.equal(world.get(12, 1, 12), 0, 'Bloque (12, 1, 12) tras Puerta 1 debe ser AIRE');
  assert.notEqual(world.get(11, 0, 12), 0, 'Bloque (11, 0, 12) debe tener suelo');
  assert.notEqual(world.get(12, 0, 12), 0, 'Bloque (12, 0, 12) debe tener suelo');
});

test('Capítulo 2 - Nivel 2 (shadow_chasm) incorpora abismo, plataformas JUMP_PAD y losa de presión para Puerta 2', () => {
  const world = new World();
  const levelData = world.levelRegistry.getLevel('shadow_chasm');
  world.loadLevel(levelData);

  assert.equal(world.doors.length, 2);
  const d2 = world.doors.find(d => d.id === 2);
  assert.ok(d2, 'Puerta 2 debe existir');

  // La Puerta 2 ahora es activada por mecanismo de losa de presión en la Sala 2
  const p2 = world.pressurePlates.find(p => p.targetDoorId === 2 || p.id === 'losa_chasm_puerta2');
  assert.ok(p2, 'Debe existir una losa de presión para la Puerta 2 en Sala 2');
  assert.equal(p2.x, 19.0);
  assert.equal(p2.y, 3.0);
  assert.equal(p2.z, 17.0);

  const c1 = world.chests.find(c => c.id === 1);
  assert.ok(c1, 'Cofre 1 debe existir');

  assert.equal(world.stairwells.length, 1);
});

test('Capítulo 2 - Nivel 3 (shadow_sanctum) es el Climax con altar y sin escalinata', () => {
  const world = new World();
  const levelData = world.levelRegistry.getLevel('shadow_sanctum');
  world.loadLevel(levelData);

  assert.equal(world.stairwells.length, 0, 'No debe tener escalinata (nivel final)');
  assert.equal(world.objectives.length, 1, 'Debe tener el altar del pedestal');
  assert.equal(world.objectives[0].type, 'pedestal');
  assert.equal(world.objectives[0].name, 'Altar Crepuscular');

  // El altar debe descansar en el suelo (y=0) y no estar enterrado por bloques sólidos en y=1 o y=2
  const ped = world.objectives[0];
  assert.notEqual(world.get(ped.x, 0, ped.z), 0, 'La base bajo el altar en y=0 debe ser suelo sólido');
  assert.equal(world.get(ped.x, 1, ped.z), 0, 'El espacio del altar en y=1 no debe contener bloques sólidos que lo oculten');
  assert.equal(world.get(ped.x, 2, ped.z), 0, 'El espacio superior del altar en y=2 debe ser aire libre');
});

test('Capítulo 2 - completeChapter culmina Cripta de las Sombras y desbloquea Capítulo 3', () => {
  const cr = new ChapterRegistry();
  cr.progress.highestChapterUnlocked = 2;

  const res = cr.completeChapter('capitulo_2', { timeSec: 180, deaths: 0, stars: 3 });
  assert.ok(res);
  assert.equal(res.chapter.id, 'capitulo_2');
  assert.equal(res.nextChapter.id, 'capitulo_3');
  assert.equal(res.nextChapter.number, 3);
  assert.equal(cr.progress.highestChapterUnlocked, 3);
  assert.ok(cr.progress.completedChapters.includes('capitulo_2'));
});

test('Capítulo 2 - shadow_vault: Puerta 1 tiene colisión sólida al inicio y bloquea el paso', () => {
  const world = new World();
  const levelData = world.levelRegistry.getLevel('shadow_vault');
  world.loadLevel(levelData);

  const door1 = world.doors.find(d => d.id === 1);
  assert.ok(door1, 'Debe existir Puerta 1');
  assert.equal(door1.isOpen, false, 'Puerta 1 debe iniciar cerrada');
  assert.equal(world.isDoorOpenId(1), false, 'Puerta 1 debe reportarse como cerrada');

  // Vano de la Puerta 1 (x=11..12, y=1..2, z=11) debe contener BLOCK_TYPES.DOOR (3)
  assert.equal(world.get(11, 1, 11), 3, 'Bloque (11, 1, 11) debe ser DOOR');
  assert.equal(world.get(11, 2, 11), 3, 'Bloque (11, 2, 11) debe ser DOOR');
  assert.equal(world.get(12, 1, 11), 3, 'Bloque (12, 1, 11) debe ser DOOR');
  assert.equal(world.get(12, 2, 11), 3, 'Bloque (12, 2, 11) debe ser DOOR');
});

test('Capítulo 2 - shadow_vault: Puertas de mecanismo no se abren con el botón de interacción manual', () => {
  const world = new World();
  const levelData = world.levelRegistry.getLevel('shadow_vault');
  world.loadLevel(levelData);

  const fakeGame = {
    world,
    mode: 'host',
    playerManager: { localPlayer: { id: 0, keys: [] } },
    ui: { showNarrativeMessage: () => {} },
    soundManager: { playLocked: () => {}, playDoorOpen: () => {} },
    voxelMap: { openDoor: () => {} },
    doorRenderer: { openDoor: () => {} },
    openedDoorKeys: new Set(),
  };

  const ic = new InteractionController(fakeGame);

  // Intentar abrir manualmente con el botón
  assert.equal(ic.requestOpenDoor(1), false, 'Puerta 1 no debe abrirse manualmente');
  assert.equal(ic.requestOpenDoor(2), false, 'Puerta 2 no debe abrirse manualmente');
  assert.equal(ic.requestOpenDoor(3), false, 'Puerta 3 no debe abrirse manualmente');
  assert.equal(world.isDoorOpenId(1), false, 'Puerta 1 sigue cerrada');
  assert.equal(world.isDoorOpenId(2), false, 'Puerta 2 sigue cerrada');
  assert.equal(world.isDoorOpenId(3), false, 'Puerta 3 sigue cerrada');

  // Raycaster no debe ofrecer ABRIR por proximidad para puertas de mecanismo
  const raycaster = new BlockRaycaster(null, { mesh: null, instToBlock: [] }, world);
  const targetNearDoor1 = raycaster.getProximityTarget({ x: 12.0, y: 1.0, z: 10.5 });
  assert.equal(targetNearDoor1, null, 'No debe mostrar prompt contextual de abrir en Puerta 1');

  const targetNearDoor2 = raycaster.getProximityTarget({ x: 6.0, y: 1.0, z: 42.0 });
  assert.equal(targetNearDoor2, null, 'No debe mostrar prompt contextual de abrir en Puerta 2');

  const targetNearDoor3 = raycaster.getProximityTarget({ x: 18.0, y: 1.0, z: 42.0 });
  assert.equal(targetNearDoor3, null, 'No debe mostrar prompt contextual de abrir en Puerta 3');
});

test('Capítulo 2 - shadow_vault: Dispone de bloques de aterrizaje en z=42 frente a Puerta 2 y Puerta 3 sin huecos de vacío', () => {
  const world = new World();
  const levelData = world.levelRegistry.getLevel('shadow_vault');
  world.loadLevel(levelData);

  // Galería izquierda: frente a Puerta 2 y ancho transitable en z=42 (x=4..8)
  for (let x = 4; x <= 8; x++) {
    assert.notEqual(world.get(x, 0, 42), 0, `Suelo en galería izquierda (x=${x}, z=42) debe ser sólido`);
    assert.notEqual(world.get(x, 0, 42), 7, `Suelo en galería izquierda (x=${x}, z=42) no debe ser lava`);
  }

  // Galería derecha: frente a Puerta 3 y ancho transitable en z=42 (x=16..20)
  for (let x = 16; x <= 20; x++) {
    assert.notEqual(world.get(x, 0, 42), 0, `Suelo en galería derecha (x=${x}, z=42) debe ser sólido`);
    assert.notEqual(world.get(x, 0, 42), 7, `Suelo en galería derecha (x=${x}, z=42) no debe ser lava`);
  }

  // Muro divisorio central sólido en z=42 (sin hueco ni vacío flotante)
  for (let x = 11; x <= 13; x++) {
    assert.notEqual(world.get(x, 0, 42), 0, `Base del muro divisorio central en (x=${x}, z=42) no debe ser vacío`);
  }
});

test('Capítulo 2 - shadow_vault: todos los héroes alcanzan cada salto de ambas galerías con margen y verticalidad escalonada', async () => {
  const { PLAYER_HEROES, PHYSICS_CONFIG, BLOCK_TYPES } = await import('../src/config/constants.js');
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('shadow_vault'));

  // Alcance horizontal discreto (30 Hz, mismo integrador que SimulationEngine) con diferencia de cota deltaY
  const reach = (jumpMult, speedMult, deltaY = 0) => {
    const dt = 1 / PHYSICS_CONFIG.TICK_HZ;
    let vy = PHYSICS_CONFIG.JUMP_VELOCITY * jumpMult, y = 0, ticks = 0;
    do {
      vy += PHYSICS_CONFIG.GRAVITY * dt;
      y += vy * dt;
      ticks++;
    } while (ticks < 120 && !(ticks > 1 && y <= deltaY && vy < 0));
    return PHYSICS_CONFIG.SPEED * speedMult * (ticks - 1) * dt;
  };
  // Distancia borde a borde entre superficies [x1, x2, y, z1, z2] (bloques inclusivos)
  const gap = (a, b) => Math.hypot(
    Math.max(0, b[0] - (a[1] + 1), a[0] - (b[1] + 1)),
    Math.max(0, b[3] - (a[4] + 1), a[3] - (b[4] + 1)),
  );
  const galleries = {
    izquierda: [
      [5, 7, 0, 16, 17], // y=0
      [5, 7, 1, 20, 21], // y=1
      [5, 7, 2, 24, 25], // y=2 (cúspide)
      [5, 7, 1, 28, 29], // y=1
      [5, 7, 0, 32, 33], // y=0
      [4, 8, 0, 36, 42], // y=0 (plataforma losa continua a Puerta 2)
    ],
    derecha: [
      [17, 18, 0, 16, 17], // y=0
      [19, 20, 1, 20, 21], // y=1
      [16, 17, 2, 24, 25], // y=2 (cúspide)
      [19, 20, 1, 28, 29], // y=1
      [16, 17, 0, 32, 33], // y=0
      [16, 20, 0, 36, 42], // y=0 (plataforma losa continua a Puerta 3)
    ],
  };

  for (const [name, surfaces] of Object.entries(galleries)) {
    // Las losas de salto declaradas existen realmente en el mapa a su cota correspondiente
    for (const s of surfaces.slice(0, -1)) {
      assert.equal(world.get(s[0], s[2], s[3]), BLOCK_TYPES.JUMP_PAD, `JUMP_PAD esperado en galería ${name} (${s[0]},${s[2]},${s[3]})`);
    }
    for (const h of PLAYER_HEROES) {
      for (let i = 0; i < surfaces.length - 1; i++) {
        const deltaY = surfaces[i + 1][2] - surfaces[i][2];
        const r = reach(h.jumpMultiplier * 1.35, h.speedMultiplier, deltaY);
        const g = gap(surfaces[i], surfaces[i + 1]);
        assert.ok(g <= r * 0.65, `${h.name} en galería ${name}, salto ${i + 1} (dY=${deltaY}): ${g.toFixed(2)}m excede el 65% de su alcance (${r.toFixed(2)}m)`);
      }
    }
  }
});

test('Capítulo 2 - shadow_vault: incorpora verticalidad escalonada (y=0, y=1, y=2) y pilares de soporte en las Galerías Gemelas', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('shadow_vault'));

  // Galería Izquierda: soportes y cotas
  assert.equal(world.get(5, 0, 16), 6, 'Salto 1 izquierdo en y=0');
  assert.equal(world.get(5, 0, 20), 4, 'Pilar bajo Salto 2 izquierdo');
  assert.equal(world.get(5, 1, 20), 6, 'Salto 2 izquierdo en y=1');
  assert.equal(world.get(5, 0, 24), 4, 'Pilar inferior bajo cúspide izquierda');
  assert.equal(world.get(5, 1, 24), 4, 'Pilar intermedio bajo cúspide izquierda');
  assert.equal(world.get(5, 2, 24), 6, 'Cúspide izquierda en y=2');
  assert.equal(world.get(5, 0, 28), 4, 'Pilar bajo Salto 4 izquierdo');
  assert.equal(world.get(5, 1, 28), 6, 'Salto 4 izquierdo en y=1');
  assert.equal(world.get(5, 0, 32), 6, 'Salto 5 izquierdo en y=0');

  // Galería Derecha: soportes y cotas
  assert.equal(world.get(17, 0, 16), 6, 'Salto 1 derecho en y=0');
  assert.equal(world.get(19, 0, 20), 4, 'Pilar bajo Salto 2 derecho');
  assert.equal(world.get(19, 1, 20), 6, 'Salto 2 derecho en y=1');
  assert.equal(world.get(16, 0, 24), 4, 'Pilar inferior bajo cúspide derecha');
  assert.equal(world.get(16, 1, 24), 4, 'Pilar intermedio bajo cúspide derecha');
  assert.equal(world.get(16, 2, 24), 6, 'Cúspide derecha en y=2');
  assert.equal(world.get(19, 0, 28), 4, 'Pilar bajo Salto 4 derecho');
  assert.equal(world.get(19, 1, 28), 6, 'Salto 4 derecho en y=1');
  assert.equal(world.get(16, 0, 32), 6, 'Salto 5 derecho en y=0');
});

test('Capítulo 2 - shadow_sanctum: incorpora Sala 2 extendida (sizeZ: 64) con verticalidad escalonada (y=0, y=1, y=2) en ambas alas', () => {
  const world = new World();
  const levelData = world.levelRegistry.getLevel('shadow_sanctum');
  world.loadLevel(levelData);

  // Dimensiones del mundo extendidas
  assert.equal(world.sizeZ, 64, 'shadow_sanctum debe tener sizeZ de 64 bloques');

  // Muro central divisorio presente a lo largo de la sala 2
  assert.equal(world.get(11, 2, 20), 2, 'Muro divisorio central debe existir en x=11, z=20');
  assert.equal(world.get(12, 2, 20), 2, 'Muro divisorio central debe existir en x=12, z=20');
  assert.equal(world.get(11, 2, 40), 2, 'Muro divisorio central debe existir en x=11, z=40');

  // Fosa de lava bajo la sala 2
  assert.equal(world.get(5, -1, 21), 7, 'Debe haber lava en y=-1 en ala oeste');
  assert.equal(world.get(18, -1, 21), 7, 'Debe haber lava en y=-1 en ala este');

  // Ala Oeste - Fase 1: Alturas variables (y=0, y=1, y=2)
  assert.notEqual(world.get(5, 0, 16), 0, 'Plataforma base oeste en y=0');
  assert.equal(world.get(5, 0, 19), 4, 'Soporte pilar bajo plataforma elevada y=1 oeste');
  assert.notEqual(world.get(5, 1, 19), 0, 'Plataforma elevada oeste en y=1');
  assert.equal(world.get(5, 1, 22), 4, 'Soporte pilar bajo plataforma cumbre y=2 oeste');
  assert.notEqual(world.get(5, 2, 22), 0, 'Plataforma cúspide oeste en y=2');
  assert.equal(world.get(5, 1, 25), 6, 'JUMP_PAD escalonado en y=1 oeste');

  // Ala Oeste - Fase 2: Alturas variables tras cruzar la reja 4
  assert.notEqual(world.get(5, 1, 36), 0, 'Plataforma elevada y=1 oeste fase 2');
  assert.equal(world.get(5, 2, 39), 6, 'JUMP_PAD cúspide y=2 oeste fase 2');
  assert.notEqual(world.get(5, 1, 43), 0, 'Plataforma y=1 oeste fase 2');

  // Ala Este - Fase 1: Alturas variables (y=0, y=1, y=2)
  assert.notEqual(world.get(18, 0, 16), 0, 'Plataforma base este en y=0');
  assert.equal(world.get(18, 0, 19), 4, 'Soporte pilar bajo plataforma elevada y=1 este');
  assert.notEqual(world.get(18, 1, 19), 0, 'Plataforma elevada este en y=1');
  assert.equal(world.get(18, 1, 22), 4, 'Soporte pilar bajo plataforma cumbre y=2 este');
  assert.notEqual(world.get(18, 2, 22), 0, 'Plataforma cúspide este en y=2');
  assert.equal(world.get(18, 1, 25), 6, 'JUMP_PAD escalonado en y=1 este');

  // Ala Este - Fase 2: Alturas variables tras cruzar la reja 3
  assert.notEqual(world.get(18, 1, 38), 0, 'Plataforma elevada y=1 este fase 2');
  assert.equal(world.get(18, 2, 41), 6, 'JUMP_PAD cúspide y=2 este fase 2');
  assert.notEqual(world.get(18, 1, 44), 0, 'Plataforma y=1 este fase 2');

  // Confluencia y umbral de la antesala en z=49..52
  assert.notEqual(world.get(11, 0, 50), 0, 'Antesala unificada frente a Puerta 2 en z=50');
  assert.notEqual(world.get(12, 0, 50), 0, 'Antesala unificada frente a Puerta 2 en z=50');
});

test('Capítulo 2 - shadow_sanctum: preserva el desafío cooperativo de 2 jugadores con losas cruzadas y llave', () => {
  const world = new World();
  const levelData = world.levelRegistry.getLevel('shadow_sanctum');
  world.loadLevel(levelData);

  // Puertas requeridas
  const door1 = world.doors.find(d => d.id === 1);
  const door2 = world.doors.find(d => d.id === 2);
  const door3 = world.doors.find(d => d.id === 3);
  const door4 = world.doors.find(d => d.id === 4);

  assert.ok(door1, 'Puerta 1 debe existir');
  assert.ok(door2, 'Puerta 2 (Trono) debe existir');
  assert.ok(door3, 'Puerta 3 (Reja Este) debe existir');
  assert.ok(door4, 'Puerta 4 (Reja Oeste) debe existir');

  assert.equal(door2.requiresKey, 'llave_crepusculo', 'Puerta 2 exige llave_crepusculo');

  // Losas cooperativas
  const plateOeste = world.pressurePlates.find(p => p.id === 'losa_sanctum_coop_izq');
  const plateEste = world.pressurePlates.find(p => p.id === 'losa_sanctum_coop_der');

  assert.ok(plateOeste, 'Losa cooperativa oeste debe existir');
  assert.ok(plateEste, 'Losa cooperativa este debe existir');

  assert.equal(plateOeste.targetDoorId, 3, 'Losa oeste abre Reja Este (3)');
  assert.equal(plateOeste.mode, 'hold', 'Losa oeste debe ser de presencia sostenida (hold)');

  assert.equal(plateEste.targetDoorId, 4, 'Losa este abre Reja Oeste (4)');

  // Cofre con la llave
  const chest1 = world.chests.find(c => c.id === 1);
  assert.ok(chest1, 'Cofre 1 debe existir');
  assert.equal(chest1.givesKey, 'llave_crepusculo', 'Cofre 1 otorga llave_crepusculo');

  // Checkpoints
  assert.equal(world.checkpoints.length, 3, 'Debe haber 3 checkpoints para las 3 salas');
  const s2 = world.checkpoints.find(c => c.id === 'sala_2');
  const s3 = world.checkpoints.find(c => c.id === 'sala_3');
  assert.ok(s2 && s3);
  assert.equal(s2.maxZ, 52.0, 'Sala 2 llega hasta z=52');
  assert.equal(s3.minZ, 52.5, 'Sala 3 arranca en z=52.5');
});

test('Altares de Clímax: Capítulo 1 finaliza con Altar Dorado (Cáliz Sagrado) y Capítulo 2 con Altar Crepuscular (Ojo del Vacío)', () => {
  const world = new World();
  const cap1Final = world.levelRegistry.getLevel('abyss_throne');
  const cap2Final = world.levelRegistry.getLevel('shadow_sanctum');

  assert.equal(cap1Final.pedestalTheme, 'classic', 'Capítulo 1 debe culminar con altar classic (dorado)');
  assert.equal(cap1Final.objectives[0].theme, 'classic');
  assert.equal(cap1Final.objectives[0].name, 'Altar Dorado de los Primeros Reyes');

  assert.equal(cap2Final.pedestalTheme, 'abyss', 'Capítulo 2 debe culminar con altar abyss (crepuscular)');
  assert.equal(cap2Final.objectives[0].theme, 'abyss');
  assert.equal(cap2Final.objectives[0].name, 'Altar Crepuscular');
});
