import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  ChapterRegistry,
  CHAPTER_CATALOG,
  CAMPAIGN_PROGRESS_STORAGE_KEY,
  createInitialCampaignProgress,
} from '../src/levels/ChapterRegistry.js';

describe('ChapterRegistry - Catálogo y Progresión de Campaña', () => {
  let registry;

  beforeEach(() => {
    registry = new ChapterRegistry();
    registry.resetProgress();
  });

  describe('Catálogo Canónico de 10 Capítulos', () => {
    it('declara exactamente 10 capítulos numerados del 1 al 10', () => {
      assert.equal(CHAPTER_CATALOG.length, 10);
      CHAPTER_CATALOG.forEach((ch, idx) => {
        assert.equal(ch.number, idx + 1);
        assert.equal(ch.id, `capitulo_${idx + 1}`);
        assert.ok(ch.name && typeof ch.name === 'string');
        assert.ok(ch.theme && typeof ch.theme === 'string');
        assert.ok(ch.lore && typeof ch.lore === 'string');
        assert.ok(ch.icon && typeof ch.icon === 'string');
        assert.ok(Array.isArray(ch.dungeons));
        assert.equal(ch.dungeons.length, 3, `Capítulo ${ch.number} debe tener 3 mazmorras`);
      });
    });

    it('el Capítulo 1 contiene la trilogía ancestral original', () => {
      const cap1 = registry.getChapter(1);
      assert.equal(cap1.id, 'capitulo_1');
      assert.equal(cap1.name, 'El Descenso Ancestral');
      assert.deepEqual(
        cap1.dungeons.map(d => ({ id: d.id, role: d.role })),
        [
          { id: 'dungeon_classic', role: 'intro' },
          { id: 'crypt_inferno', role: 'challenge' },
          { id: 'abyss_throne', role: 'climax' },
        ]
      );
    });

    it('asigna roles intro, challenge y climax a cada capítulo', () => {
      for (const ch of registry.getAllChapters()) {
        assert.equal(ch.dungeons[0].role, 'intro');
        assert.equal(ch.dungeons[1].role, 'challenge');
        assert.equal(ch.dungeons[2].role, 'climax');
      }
    });
  });

  describe('Consultas y Navegación entre Mazmorras', () => {
    it('obtiene capítulo por ID o por número', () => {
      const byId = registry.getChapter('capitulo_1');
      const byNum = registry.getChapter(1);
      assert.equal(byId, byNum);
      assert.equal(byId.id, 'capitulo_1');
      assert.equal(registry.getChapter(999), undefined);
    });

    it('identifica el capítulo al que pertenece un nivel', () => {
      assert.equal(registry.getChapterForLevel('dungeon_classic')?.id, 'capitulo_1');
      assert.equal(registry.getChapterForLevel('crypt_inferno')?.id, 'capitulo_1');
      assert.equal(registry.getChapterForLevel('abyss_throne')?.id, 'capitulo_1');
      assert.equal(registry.getChapterForLevel('shadow_vault')?.id, 'capitulo_2');
      assert.equal(registry.getChapterForLevel('lobby_tutorial'), null);
      assert.equal(registry.getChapterForLevel('nivel_inexistente'), null);
    });

    it('obtiene la siguiente mazmorra dentro del mismo capítulo', () => {
      const next1 = registry.getNextDungeonInChapter('dungeon_classic');
      assert.equal(next1?.id, 'crypt_inferno');

      const next2 = registry.getNextDungeonInChapter('crypt_inferno');
      assert.equal(next2?.id, 'abyss_throne');

      const next3 = registry.getNextDungeonInChapter('abyss_throne');
      assert.equal(next3, null, 'El clímax no tiene siguiente mazmorra en el capítulo');
    });

    it('detecta correctamente la última mazmorra (clímax) del capítulo', () => {
      assert.equal(registry.isLastDungeonInChapter('dungeon_classic'), false);
      assert.equal(registry.isLastDungeonInChapter('crypt_inferno'), false);
      assert.equal(registry.isLastDungeonInChapter('abyss_throne'), true);
      assert.equal(registry.isLastDungeonInChapter('lobby_tutorial'), false);
    });

    it('permite cambiar y consultar el capítulo actual', () => {
      assert.equal(registry.getCurrentChapter().id, 'capitulo_1');
      assert.equal(registry.setCurrentChapter(2), true);
      assert.equal(registry.getCurrentChapter().id, 'capitulo_2');
      assert.equal(registry.setCurrentChapter('capitulo_3'), true);
      assert.equal(registry.getCurrentChapter().number, 3);
      assert.equal(registry.setCurrentChapter('inexistente'), false);
    });
  });

  describe('Persistencia y Desbloqueo de Progresión', () => {
    it('comienza con el Capítulo 1 desbloqueado y capítulos posteriores bloqueados', () => {
      assert.equal(registry.isChapterUnlocked(1), true);
      assert.equal(registry.isChapterUnlocked(2), false);
      assert.equal(registry.isChapterUnlocked(10), false);
    });

    it('desbloquea el Capítulo 2 al completar el Capítulo 1 y guarda récords', () => {
      const res = registry.completeChapter('capitulo_1', {
        timeSec: 185,
        deaths: 1,
        stars: 3,
      });

      assert.ok(res);
      assert.equal(res.chapter.id, 'capitulo_1');
      assert.equal(res.nextChapter?.id, 'capitulo_2');
      assert.equal(registry.isChapterUnlocked('capitulo_2'), true);
      assert.equal(registry.isChapterUnlocked(2), true);
      assert.equal(registry.isChapterUnlocked(3), false);

      const record = registry.getRecord('capitulo_1');
      assert.equal(record.bestTimeSec, 185);
      assert.equal(record.deaths, 1);
      assert.equal(record.stars, 3);
      assert.ok(record.completedAt > 0);
    });

    it('conserva el mejor tiempo al re-completar un capítulo', () => {
      registry.completeChapter('capitulo_1', { timeSec: 200 });
      registry.completeChapter('capitulo_1', { timeSec: 250 });
      assert.equal(registry.getRecord('capitulo_1').bestTimeSec, 200);

      registry.completeChapter('capitulo_1', { timeSec: 160 });
      assert.equal(registry.getRecord('capitulo_1').bestTimeSec, 160);
    });

    it('reinicia el progreso a los valores por defecto', () => {
      registry.completeChapter('capitulo_1');
      registry.completeChapter('capitulo_2');
      assert.equal(registry.isChapterUnlocked(3), true);

      registry.resetProgress();
      assert.equal(registry.isChapterUnlocked(1), true);
      assert.equal(registry.isChapterUnlocked(2), false);
      assert.deepEqual(registry.progress.completedChapters, []);
    });

    it('interactúa correctamente con localStorage mockeado', () => {
      const storageMock = new Map();
      globalThis.localStorage = {
        getItem: (k) => storageMock.get(k) ?? null,
        setItem: (k, v) => storageMock.set(k, String(v)),
        removeItem: (k) => storageMock.delete(k),
      };

      try {
        const customRegistry = new ChapterRegistry();
        customRegistry.completeChapter('capitulo_1', { timeSec: 120 });
        assert.ok(storageMock.has(CAMPAIGN_PROGRESS_STORAGE_KEY));

        // Nuevo registry carga del storage simulado
        const reloaded = new ChapterRegistry();
        assert.equal(reloaded.isChapterUnlocked(2), true);
        assert.equal(reloaded.getRecord('capitulo_1').bestTimeSec, 120);
      } finally {
        delete globalThis.localStorage;
      }
    });

    it('maneja datos corruptos en storage de forma resiliente', () => {
      const storageMock = new Map();
      storageMock.set(CAMPAIGN_PROGRESS_STORAGE_KEY, '{ invalid_json ...');
      globalThis.localStorage = {
        getItem: (k) => storageMock.get(k) ?? null,
        setItem: (k, v) => storageMock.set(k, String(v)),
        removeItem: (k) => storageMock.delete(k),
      };

      try {
        const resilientRegistry = new ChapterRegistry();
        assert.equal(resilientRegistry.progress.highestChapterUnlocked, 1);
        assert.equal(resilientRegistry.isChapterUnlocked(1), true);
      } finally {
        delete globalThis.localStorage;
      }
    });
  });
});
