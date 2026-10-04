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
  AVAILABLE_SLOTS,
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

  describe('Gestión de 3 Ranuras de Guardado y Persistencia Exclusiva al Terminar Mazmorra', () => {
    it('dispone de exactamente 3 ranuras disponibles en la constante AVAILABLE_SLOTS', () => {
      assert.deepEqual(AVAILABLE_SLOTS, ['slot_1', 'slot_2', 'slot_3']);
      assert.equal(AVAILABLE_SLOTS.length, 3);
    });

    it('getAllSlotsSummary devuelve el resumen de las 3 ranuras con indicador de ranura activa', async () => {
      await manager.init('slot_1');
      const summaries = await manager.getAllSlotsSummary();

      assert.equal(summaries.length, 3);
      assert.equal(summaries[0].slotId, 'slot_1');
      assert.equal(summaries[0].isActive, true);
      assert.equal(summaries[0].isEmpty, false); // inicializado por init

      assert.equal(summaries[1].slotId, 'slot_2');
      assert.equal(summaries[1].isActive, false);
      assert.equal(summaries[1].isEmpty, true);

      assert.equal(summaries[2].slotId, 'slot_3');
      assert.equal(summaries[2].isActive, false);
      assert.equal(summaries[2].isEmpty, true);
    });

    it('switchSlot cambia la ranura activa y carga sus datos canónicos', async () => {
      await manager.init('slot_1');
      assert.equal(manager.currentSlotId, 'slot_1');

      // Crear y modificar datos en slot_2
      await manager.switchSlot('slot_2');
      assert.equal(manager.currentSlotId, 'slot_2');
      manager.currentSave.profile.name = 'HéroeSlot2';

      await manager.saveDungeonCompletion({
        levelId: 'crypt_shadows',
        chapterId: 'capitulo_1',
        isVictory: true,
        campaign: { highestChapterUnlocked: 2 },
        inventory: { totalGems: 45 },
      });

      // Cambiar de vuelta a slot_1
      await manager.switchSlot('slot_1');
      assert.equal(manager.currentSlotId, 'slot_1');
      assert.equal(manager.currentSave.campaign.highestChapterUnlocked, 1);

      // Regresar a slot_2: debe conservar el progreso guardado
      await manager.switchSlot('slot_2');
      assert.equal(manager.currentSlotId, 'slot_2');
      assert.equal(manager.currentSave.profile.name, 'HéroeSlot2');
      assert.equal(manager.currentSave.campaign.highestChapterUnlocked, 2);
      assert.equal(manager.currentSave.inventory.totalGems, 45);
    });

    it('deleteSlot borra claves activas y de backup y reinicia el slot a valores por defecto', async () => {
      await manager.init('slot_3');
      await manager.saveDungeonCompletion({
        levelId: 'crypt_shadows',
        campaign: { highestChapterUnlocked: 5 },
        inventory: { totalGems: 999 },
      });

      assert.equal(manager.currentSave.campaign.highestChapterUnlocked, 5);

      await manager.deleteSlot('slot_3');
      assert.equal(manager.currentSave.campaign.highestChapterUnlocked, 1);
      assert.equal(manager.currentSave.inventory.totalGems, 0);

      const activeKey = await memoryAdapter.get('save_slot_3_active');
      assert.equal(activeKey, null);
    });

    it('updateCampaign en memoria no persiste a almacenamiento a menos que se invoque saveDungeonCompletion', async () => {
      await manager.init('slot_1');

      // Modificación durante el juego en memoria
      manager.updateCampaign({ highestChapterUnlocked: 4 });
      assert.equal(manager.getCampaign().highestChapterUnlocked, 4);

      // El almacenamiento persistente NO debe tener el capítulo 4 aún (política estricta al terminar mazmorra)
      const storedBefore = await memoryAdapter.get('save_slot_1_active');
      assert.equal(storedBefore.campaign.highestChapterUnlocked, 1);

      // Ahora se completa la mazmorra
      await manager.saveDungeonCompletion({
        levelId: 'dungeon_classic',
        chapterId: 'capitulo_1',
        isVictory: false,
        campaign: { highestChapterUnlocked: 2 },
        inventory: { totalGems: 50 },
      });

      // Ahora SÍ debe estar persistido en el almacenamiento
      const storedAfter = await memoryAdapter.get('save_slot_1_active');
      assert.equal(storedAfter.campaign.highestChapterUnlocked, 2);
      assert.equal(storedAfter.inventory.totalGems, 50);
      assert.equal(validateSaveData(storedAfter), true);
    });

    it('no duplica la ranura 1 en las ranuras 2 o 3 al cambiar a ranuras vacías', async () => {
      await manager.init('slot_1');
      await manager.saveDungeonCompletion({
        levelId: 'crypt_shadows',
        campaign: { highestChapterUnlocked: 3 },
      });

      // Cambiar a slot_2
      await manager.switchSlot('slot_2');
      const summaries = await manager.getAllSlotsSummary();
      const slot2 = summaries.find(s => s.slotId === 'slot_2');
      assert.equal(slot2.isEmpty, true);
      assert.equal(slot2.highestChapter, 1);

      // Cambiar a slot_3
      await manager.switchSlot('slot_3');
      const summaries3 = await manager.getAllSlotsSummary();
      const slot3 = summaries3.find(s => s.slotId === 'slot_3');
      assert.equal(slot3.isEmpty, true);
      assert.equal(slot3.highestChapter, 1);
    });

    it('persiste inventario completo (gemas, pociones, reliquias, llaves y cofres abiertos) en saveDungeonCompletion', async () => {
      await manager.init('slot_2');
      const openedSet = new Set(['dungeon_classic_chest_1', 'crypt_inferno:2']);
      await manager.saveDungeonCompletion({
        levelId: 'dungeon_classic',
        chapterId: 'capitulo_1',
        isVictory: true,
        campaign: { highestChapterUnlocked: 2 },
        inventory: {
          totalGems: 350,
          potions: [{ id: 'pocion_vida', name: 'Poción de Vida', healAmount: 1 }],
          relics: [{ id: 'caliz_sagrado', name: 'Cáliz Sagrado' }],
          keys: [{ id: 'llave_santuario', name: 'Llave del Santuario' }],
          openedChests: openedSet,
        },
      });

      const inv = manager.currentSave.inventory;
      assert.equal(inv.totalGems, 350);
      assert.equal(inv.potions.length, 1);
      assert.equal(inv.relics.length, 1);
      assert.equal(inv.relics[0].name, 'Cáliz Sagrado');
      assert.equal(inv.keys.length, 1);
      assert.deepEqual(inv.openedChests, {
        crypt_inferno: [2],
        dungeon_classic: [1],
      });

      // Recargar desde almacenamiento y validar recuperación íntegra
      const reloaded = await manager.loadSlot('slot_2');
      assert.equal(reloaded.inventory.totalGems, 350);
      assert.equal(reloaded.inventory.relics[0].id, 'caliz_sagrado');
      const restoredSet = manager.deserializeOpenedChests(reloaded.inventory.openedChests);
      assert.equal(restoredSet.has('dungeon_classic_chest_1'), true);
      assert.equal(restoredSet.has('crypt_inferno:2'), true);
    });

    it('las ranuras vacías no se autoguardan al modificar perfil o ajustes hasta culminar una expedición', async () => {
      await manager.init('slot_1');
      await manager.switchSlot('slot_2');

      // Verificar que slot_2 arranca vacía
      let summaries = await manager.getAllSlotsSummary();
      let slot2 = summaries.find(s => s.slotId === 'slot_2');
      assert.equal(slot2.isEmpty, true);
      assert.equal(manager.isSlotEmpty('slot_2'), true);

      // Modificar perfil y ajustes en el menú
      manager.updateProfile({ name: 'AventureroFantasma', favoriteHero: 3 });
      manager.updateSettings({ sensitivity: 1.8 });
      await manager.saveCurrent();

      // El almacenamiento persistente NO debe contener save_slot_2_active aún
      const storedActive = await memoryAdapter.get('save_slot_2_active');
      assert.equal(storedActive, null);

      // Sigue apareciendo como vacía en los resúmenes del menú
      summaries = await manager.getAllSlotsSummary();
      slot2 = summaries.find(s => s.slotId === 'slot_2');
      assert.equal(slot2.isEmpty, true);

      // Ahora se culmina con éxito una expedición
      await manager.saveDungeonCompletion({
        levelId: 'dungeon_classic',
        chapterId: 'capitulo_1',
        isVictory: true,
        campaign: { highestChapterUnlocked: 2 },
        inventory: { totalGems: 100 },
      });

      // Ahora SÍ debe estar persistida en almacenamiento
      const savedAfter = await memoryAdapter.get('save_slot_2_active');
      assert.ok(savedAfter);
      assert.equal(savedAfter.profile.name, 'AventureroFantasma');
      assert.equal(savedAfter.profile.favoriteHero, 3);
      assert.equal(savedAfter.campaign.highestChapterUnlocked, 2);

      summaries = await manager.getAllSlotsSummary();
      slot2 = summaries.find(s => s.slotId === 'slot_2');
      assert.equal(slot2.isEmpty, false);
      assert.equal(manager.isSlotEmpty('slot_2'), false);
    });
  });

  describe('Aislamiento de Sesión y Protección en Modo Invitado (Guest Mode)', () => {
    it('setGuestMode(true) bloquea escrituras y mutaciones protegiendo la ranura local activa', async () => {
      // 1. Crear y persistir una ranura individual previa (slot_1)
      await manager.init('slot_1');
      await manager.saveDungeonCompletion({
        levelId: 'dungeon_classic',
        chapterId: 'capitulo_1',
        isVictory: true,
        campaign: { highestChapterUnlocked: 2 },
        inventory: { totalGems: 250, relics: [{ id: 'reliquia_sol' }] },
      });
      manager.updateProfile({ name: 'SirGalahad', favoriteHero: 1 });
      await manager.saveCurrent();

      const storedBefore = await memoryAdapter.get('save_slot_1_active');
      assert.equal(storedBefore.profile.name, 'SirGalahad');
      assert.equal(storedBefore.inventory.totalGems, 250);

      // 2. Activar modo invitado al unirse a la sala de un anfitrión
      assert.equal(manager.isGuestMode(), false);
      manager.setGuestMode(true);
      assert.equal(manager.isGuestMode(), true);

      // 3. Simular que en la sesión cooperativa se intenta mutar perfil, campaña o inventario
      manager.updateProfile({ name: 'InvitadoHechicero', favoriteHero: 3 });
      manager.updateCampaign({ highestChapterUnlocked: 4 });
      manager.updateInventory({ totalGems: 9999 });

      // Verificar que el estado en memoria no se alteró
      assert.equal(manager.currentSave.profile.name, 'SirGalahad', 'El perfil no debe mutar en modo invitado');
      assert.equal(manager.currentSave.campaign.highestChapterUnlocked, 2, 'La campaña no debe mutar en modo invitado');
      assert.equal(manager.currentSave.inventory.totalGems, 250, 'El inventario no debe mutar en modo invitado');

      // Intentar guardar deliberadamente
      await manager.saveCurrent();
      await manager.saveSlot('slot_1', { ...manager.currentSave, profile: { name: 'Hack' } });
      await manager.saveDungeonCompletion({ levelId: 'dungeon_final', chapterId: 'capitulo_3', isVictory: true });

      // Comprobar que en almacenamiento sigue 100% intacto el save original
      const storedAfter = await memoryAdapter.get('save_slot_1_active');
      assert.equal(storedAfter.profile.name, 'SirGalahad');
      assert.equal(storedAfter.campaign.highestChapterUnlocked, 2);
      assert.equal(storedAfter.inventory.totalGems, 250);

      // 4. Salir de la sesión cooperativa y desactivar modo invitado
      manager.setGuestMode(false);
      assert.equal(manager.isGuestMode(), false);

      // Ahora el anfitrión/jugador local puede volver a guardar con normalidad
      manager.updateProfile({ name: 'SirGalahadElValiente' });
      await manager.saveCurrent();
      const storedRestored = await memoryAdapter.get('save_slot_1_active');
      assert.equal(storedRestored.profile.name, 'SirGalahadElValiente');
    });
  });
});

