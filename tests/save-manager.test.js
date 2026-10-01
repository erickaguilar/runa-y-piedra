import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  SaveManager,
  calculateChecksum,
  validateSaveData,
  createDefaultSave,
  migrateFromLegacy,
  SAVE_SCHEMA_VERSION,
  DEFAULT_SLOT_ID,
  LEGACY_CAMPAIGN_KEY,
} from '../src/storage/SaveManager.js';
import { MemoryAdapter, LocalStorageAdapter } from '../src/storage/StorageAdapters.js';

describe('SaveManager - Persistencia Robusta y SaveSchema v2', () => {
  let memoryAdapter;
  let manager;

  beforeEach(() => {
    memoryAdapter = new MemoryAdapter();
    manager = new SaveManager({ adapter: memoryAdapter });
  });

  describe('Integridad y Checksum Determinista', () => {
    it('genera checksum determinista FNV-1a de 8 caracteres', () => {
      const save1 = createDefaultSave('slot_1');
      const hash1 = calculateChecksum(save1);
      const hash2 = calculateChecksum(save1);
      assert.equal(typeof hash1, 'string');
      assert.equal(hash1.length, 8);
      assert.equal(hash1, hash2);
    });

    it('detecta cualquier alteración arbitraria de los datos mediante checksum', () => {
      const save = createDefaultSave('slot_1');
      assert.equal(validateSaveData(save), true);

      // Alteración no autorizada de gemas o capítulos
      const tampered = JSON.parse(JSON.stringify(save));
      tampered.campaign.highestChapterUnlocked = 99;
      assert.equal(validateSaveData(tampered), false, 'Debe fallar validación si los datos cambian sin actualizar checksum');
    });

    it('rechaza objetos sin versión o con esquema inválido', () => {
      assert.equal(validateSaveData(null), false);
      assert.equal(validateSaveData({}), false);
      assert.equal(validateSaveData({ version: 1 }), false);
      assert.equal(validateSaveData({ version: SAVE_SCHEMA_VERSION, profile: null }), false);
    });
  });

  describe('Doble Buffer y Resiliencia ante Corrupción', () => {
    it('guarda en la ranura activa y mantiene la copia previa como backup', async () => {
      const save1 = createDefaultSave('slot_1');
      save1.campaign.highestChapterUnlocked = 2;
      await manager.saveSlot('slot_1', save1);

      const active1 = await memoryAdapter.get('save_slot_1_active');
      assert.ok(active1);
      assert.equal(active1.campaign.highestChapterUnlocked, 2);

      // Segunda escritura: el estado anterior pasa a backup
      const save2 = { ...save1, campaign: { ...save1.campaign, highestChapterUnlocked: 3 } };
      await manager.saveSlot('slot_1', save2);

      const active2 = await memoryAdapter.get('save_slot_1_active');
      const backup2 = await memoryAdapter.get('save_slot_1_backup');

      assert.equal(active2.campaign.highestChapterUnlocked, 3);
      assert.ok(backup2);
      assert.equal(backup2.campaign.highestChapterUnlocked, 2);
    });

    it('se recupera automáticamente desde el backup si el archivo activo está corrupto', async () => {
      // 1. Guardar estado inicial válido (capítulo 1)
      const initial = createDefaultSave('slot_1');
      await manager.saveSlot('slot_1', initial);

      // 2. Guardar progreso avanzado (capítulo 4)
      const advanced = { ...initial, campaign: { ...initial.campaign, highestChapterUnlocked: 4 } };
      await manager.saveSlot('slot_1', advanced);

      // 3. Simular corrupción de archivo activo (ej. corte eléctrico o cierre abrupto)
      await memoryAdapter.set('save_slot_1_active', { corrupted: 'true', checksum: 'bad' });

      // 4. Cargar la ranura debe detectar la corrupción y restaurar el backup
      const loaded = await manager.loadSlot('slot_1');
      assert.ok(loaded);
      assert.equal(validateSaveData(loaded), true);
      assert.equal(loaded.campaign.highestChapterUnlocked, 1, 'Debe haber restaurado desde backup');

      // El archivo activo debe haberse reescrito con el backup recuperado
      const repairedActive = await memoryAdapter.get('save_slot_1_active');
      assert.equal(repairedActive.campaign.highestChapterUnlocked, 1);
    });
  });

  describe('Migración Transparente desde Legacy v1', () => {
    it('migra datos antiguos de localStorage (campaña y ajustes individuales)', async () => {
      const storageMock = new Map();
      globalThis.localStorage = {
        getItem: (k) => storageMock.get(k) ?? null,
        setItem: (k, v) => storageMock.set(k, String(v)),
        removeItem: (k) => storageMock.delete(k),
      };

      try {
        // Datos legacy previos en localStorage
        storageMock.set(LEGACY_CAMPAIGN_KEY, JSON.stringify({
          highestChapterUnlocked: 3,
          completedChapters: ['capitulo_1', 'capitulo_2'],
          records: { capitulo_1: { bestTimeSec: 150 } },
          lastPlayedChapterId: 'capitulo_2',
        }));
        storageMock.set('dungeon_player_name', 'MagoLegendario');
        storageMock.set('dungeon_player_color', '2');
        storageMock.set('dungeon_camera', 'third');
        storageMock.set('dungeon_dpr', '1.75');
        storageMock.set('dungeon_sensitivity', '1.2');
        storageMock.set('dungeon_sound_muted', '1');

        const migrated = migrateFromLegacy('slot_1');
        assert.ok(migrated);
        assert.equal(migrated.version, SAVE_SCHEMA_VERSION);
        assert.equal(migrated.campaign.highestChapterUnlocked, 3);
        assert.deepEqual(migrated.campaign.completedChapters, ['capitulo_1', 'capitulo_2']);
        assert.equal(migrated.profile.name, 'MagoLegendario');
        assert.equal(migrated.profile.favoriteHero, 2);
        assert.equal(migrated.profile.settings.camera, 'third');
        assert.equal(migrated.profile.settings.dpr, 1.75);
        assert.equal(migrated.profile.settings.soundMuted, true);
        assert.equal(validateSaveData(migrated), true);
      } finally {
        delete globalThis.localStorage;
      }
    });

    it('escribe el espejo legacy al guardar para no romper lectores síncronos previos', async () => {
      const storageMock = new Map();
      globalThis.localStorage = {
        getItem: (k) => storageMock.get(k) ?? null,
        setItem: (k, v) => storageMock.set(k, String(v)),
        removeItem: (k) => storageMock.delete(k),
      };

      try {
        const fresh = createDefaultSave('slot_1');
        fresh.campaign.highestChapterUnlocked = 4;
        fresh.profile.name = 'GuerreroRúnico';

        await manager.saveSlot('slot_1', fresh);

        assert.ok(storageMock.has(LEGACY_CAMPAIGN_KEY));
        const legacyParsed = JSON.parse(storageMock.get(LEGACY_CAMPAIGN_KEY));
        assert.equal(legacyParsed.highestChapterUnlocked, 4);
        assert.equal(storageMock.get('dungeon_player_name'), 'GuerreroRúnico');
      } finally {
        delete globalThis.localStorage;
      }
    });
  });

  describe('Getters y Actualizaciones Reactivas', () => {
    it('actualiza campaña y ajustes síncronamente con auto-guardado en segundo plano', async () => {
      await manager.init('slot_1');

      manager.updateCampaign({ highestChapterUnlocked: 5 });
      assert.equal(manager.getCampaign().highestChapterUnlocked, 5);

      manager.updateSettings({ camera: 'isometric', sensitivity: 1.4 });
      assert.equal(manager.getSettings().camera, 'isometric');
      assert.equal(manager.getSettings().sensitivity, 1.4);

      manager.updateInventory({ totalGems: 120 });
      assert.equal(manager.getInventory().totalGems, 120);

      // Esperar resolución de auto-save asíncrono
      await manager.saveCurrent();
      const stored = await memoryAdapter.get('save_slot_1_active');
      assert.equal(stored.campaign.highestChapterUnlocked, 5);
      assert.equal(stored.profile.settings.camera, 'isometric');
      assert.equal(stored.inventory.totalGems, 120);
    });

    it('gestiona suspendState para reanudación de incursión activa', async () => {
      await manager.init('slot_1');
      assert.equal(manager.getSuspendState(), null);

      manager.setSuspendState({
        levelId: 'crypt_inferno',
        chapterId: 'capitulo_1',
        lives: 2,
        doorsOpen: [1],
      });

      const activeSuspend = manager.getSuspendState();
      assert.ok(activeSuspend);
      assert.equal(activeSuspend.levelId, 'crypt_inferno');
      assert.equal(activeSuspend.lives, 2);

      manager.clearSuspendState();
      assert.equal(manager.getSuspendState(), null);
    });
  });

  describe('Exportación e Importación de Partida', () => {
    it('exporta e importa savefiles validados en formato JSON', async () => {
      await manager.init('slot_1');
      manager.updateCampaign({ highestChapterUnlocked: 7 });

      const exported = manager.exportSaveJson('slot_1');
      assert.ok(typeof exported === 'string');

      // Nueva instancia de SaveManager
      const newManager = new SaveManager({ adapter: new MemoryAdapter() });
      await newManager.init('slot_2');

      const imported = await newManager.importSaveJson(exported, 'slot_2');
      assert.ok(imported);
      assert.equal(imported.slotId, 'slot_2');
      assert.equal(imported.campaign.highestChapterUnlocked, 7);
      assert.equal(validateSaveData(imported), true);
    });

    it('rechaza archivos de guardado manipulados al importar', async () => {
      await manager.init('slot_1');
      const exported = manager.exportSaveJson('slot_1');
      const tampered = exported.replace('"highestChapterUnlocked": 1', '"highestChapterUnlocked": 99');

      await assert.rejects(async () => {
        await manager.importSaveJson(tampered, 'slot_1');
      }, /validación de integridad/);
    });
  });
});
