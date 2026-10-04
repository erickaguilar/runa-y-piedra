import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { ChapterRegistry } from '../src/levels/ChapterRegistry.js';
import { LevelRegistry } from '../src/levels/LevelRegistry.js';

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

test('Capítulo 2 - Nivel 2 (shadow_chasm) incorpora abismo, plataformas JUMP_PAD y llave', () => {
  const world = new World();
  const levelData = world.levelRegistry.getLevel('shadow_chasm');
  world.loadLevel(levelData);

  assert.equal(world.doors.length, 2);
  const d2 = world.doors.find(d => d.id === 2);
  assert.equal(d2.requiresKey, 'llave_sombras');

  const c1 = world.chests.find(c => c.id === 1);
  assert.equal(c1.givesKey, 'llave_sombras');

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
