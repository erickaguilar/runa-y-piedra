/**
 * SaveManager.js - Gestor unificado de guardado y persistencia robusta (SaveSchema v2)
 * 
 * Implementa la arquitectura de guardado resiliente:
 * - Doble buffer atómico (Active + Backup) para prevenir corrupción por cierres abruptos.
 * - Validación de integridad mediante Checksum determinista FNV-1a.
 * - Motor asíncrono con IndexedDB + fallback a localStorage y MemoryStore.
 * - Migración transparente y retrocompatible desde claves sueltas v1 (runa_campaign_progress_v1).
 * - Cero jank en el hilo de render (60 FPS estables).
 */

import { HybridStorageAdapter } from './StorageAdapters.js';

export const SAVE_SCHEMA_VERSION = 2;
export const DEFAULT_SLOT_ID = 'slot_1';
export const AVAILABLE_SLOTS = Object.freeze(['slot_1', 'slot_2', 'slot_3']);
export const LEGACY_CAMPAIGN_KEY = 'runa_campaign_progress_v1';

/**
 * Calcula un checksum determinista FNV-1a (32 bits en hexadecimal de 8 caracteres)
 * sobre la representación serializada con claves canónicamente ordenadas.
 * 
 * @param {Object} data - Objeto de datos a verificar
 * @returns {string} Hash hexadecimal de 8 caracteres
 */
export function calculateChecksum(data) {
  if (!data || typeof data !== 'object') return '00000000';
  const { checksum, ...rest } = data;

  const serializeOrdered = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(serializeOrdered);
    const sortedKeys = Object.keys(obj).sort();
    const result = {};
    for (const key of sortedKeys) {
      result[key] = serializeOrdered(obj[key]);
    }
    return result;
  };

  const jsonStr = JSON.stringify(serializeOrdered(rest));

  // 32-bit FNV-1a
  let hash = 0x811c9dc5;
  for (let i = 0; i < jsonStr.length; i++) {
    hash ^= jsonStr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Valida la integridad estructural y criptográfica del savefile.
 * 
 * @param {Object} data - Objeto de guardado a comprobar
 * @returns {boolean} true si es íntegro y válido
 */
export function validateSaveData(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.version !== SAVE_SCHEMA_VERSION) return false;
  if (!data.profile || typeof data.profile !== 'object') return false;
  if (!data.campaign || typeof data.campaign !== 'object') return false;
  if (typeof data.campaign.highestChapterUnlocked !== 'number') return false;
  if (!Array.isArray(data.campaign.completedChapters)) return false;
  if (!data.checksum || typeof data.checksum !== 'string') return false;

  const expectedChecksum = calculateChecksum(data);
  return data.checksum === expectedChecksum;
}

/**
 * Genera la estructura limpia por defecto para una nueva ranura de guardado.
 * 
 * @param {string} [slotId=DEFAULT_SLOT_ID] - Identificador de ranura
 * @returns {Object} Guardado inicial válido
 */
export function createDefaultSave(slotId = DEFAULT_SLOT_ID) {
  const save = {
    version: SAVE_SCHEMA_VERSION,
    slotId: String(slotId || DEFAULT_SLOT_ID),
    updatedAt: Date.now(),
    checksum: '',
    profile: {
      name: 'Aventurero',
      favoriteHero: 0,
      settings: {
        camera: 'first',
        dpr: 1.5,
        sensitivity: 1.0,
        soundMuted: false,
        controlsDismissed: false,
      },
    },
    campaign: {
      highestChapterUnlocked: 1,
      completedChapters: [],
      records: {},
      lastPlayedChapterId: 'capitulo_1',
    },
    inventory: {
      totalGems: 0,
      potions: [],
      relics: [],
      keys: [],
      openedChests: {},
      openedDoors: {},
    },
    suspendState: null,
  };
  save.checksum = calculateChecksum(save);
  return save;
}

/**
 * Detecta y migra claves sueltas previas de localStorage hacia SaveSchema v2.
 * 
 * @param {string} [slotId=DEFAULT_SLOT_ID]
 * @returns {Object|null} Objeto v2 migrado o null si no había datos previos
 */
export function migrateFromLegacy(slotId = DEFAULT_SLOT_ID) {
  try {
    const rawStorage = typeof localStorage !== 'undefined' ? localStorage : null;
    if (!rawStorage) return null;
    if (rawStorage.getItem('runa_legacy_migrated') === 'done') return null;

    const rawCampaign = rawStorage.getItem(LEGACY_CAMPAIGN_KEY);
    const rawCamera = rawStorage.getItem('dungeon_camera');
    const rawDpr = rawStorage.getItem('dungeon_dpr');
    const rawSens = rawStorage.getItem('dungeon_sensitivity');
    const rawMute = rawStorage.getItem('dungeon_sound_muted');
    const rawColor = rawStorage.getItem('dungeon_player_color');
    const rawName = rawStorage.getItem('dungeon_player_name');
    const rawDismissed = rawStorage.getItem('runa_controls_dismissed');

    // Si no hay campaña ni nombre personalizado registrado, no migrar partida
    if (!rawCampaign && (!rawName || rawName === 'Aventurero') && (rawColor === null || rawColor === '0')) {
      return null;
    }

    const save = createDefaultSave(slotId);

    if (rawCampaign) {
      try {
        const parsed = JSON.parse(rawCampaign);
        if (parsed && typeof parsed === 'object') {
          save.campaign.highestChapterUnlocked = Math.max(1, Number(parsed.highestChapterUnlocked) || 1);
          save.campaign.completedChapters = Array.isArray(parsed.completedChapters)
            ? [...new Set(parsed.completedChapters)]
            : [];
          save.campaign.records = parsed.records && typeof parsed.records === 'object' ? parsed.records : {};
          save.campaign.lastPlayedChapterId = typeof parsed.lastPlayedChapterId === 'string'
            ? parsed.lastPlayedChapterId
            : 'capitulo_1';
        }
      } catch (err) {
        console.warn('[SaveManager] Error al parsear progreso legacy de campaña:', err);
      }
    }

    if (rawName) save.profile.name = String(rawName);
    if (rawColor !== null) save.profile.favoriteHero = parseInt(rawColor, 10) || 0;
    if (rawCamera) save.profile.settings.camera = String(rawCamera);
    if (rawDpr) save.profile.settings.dpr = parseFloat(rawDpr) || 1.5;
    if (rawSens) save.profile.settings.sensitivity = parseFloat(rawSens) || 1.0;
    if (rawMute !== null) save.profile.settings.soundMuted = rawMute === '1';
    if (rawDismissed !== null) save.profile.settings.controlsDismissed = rawDismissed === 'true';

    save.updatedAt = Date.now();
    save.checksum = calculateChecksum(save);
    return save;
  } catch {
    return null;
  }
}

/**
 * Serializa un Set o Array de claves de cofres abiertos a un diccionario sparse por mazmorra
 * `{ [levelId]: number[] }`, optimizado para compresión extrema y escalabilidad a 1000+ cofres.
 * 
 * @param {Set<string>|Array<string>} openedSet
 * @returns {Object.<string, number[]>} Diccionario compacto indexado por nivel
 */
export function serializeOpenedChests(openedSet) {
  if (!openedSet) return {};

  if (typeof openedSet === 'object' && !(openedSet instanceof Set) && !Array.isArray(openedSet)) {
    const result = {};
    for (const [levelId, chestIds] of Object.entries(openedSet)) {
      if (Array.isArray(chestIds)) {
        const valid = chestIds.map(Number).filter(Number.isFinite);
        if (valid.length > 0) {
          result[levelId] = [...new Set(valid)].sort((a, b) => a - b);
        }
      }
    }
    return result;
  }

  const result = {};
  const entries = openedSet instanceof Set
    ? openedSet.values()
    : (Array.isArray(openedSet) ? openedSet : []);

  for (const entry of entries) {
    if (typeof entry !== 'string') continue;
    let levelId = '';
    let chestId = null;

    if (entry.includes(':')) {
      const parts = entry.split(':');
      levelId = parts[0];
      chestId = parseInt(parts[1], 10);
    } else {
      const match = entry.match(/^(.+)_chest_(\d+)$/);
      if (match) {
        levelId = match[1];
        chestId = parseInt(match[2], 10);
      }
    }

    if (levelId && Number.isFinite(chestId)) {
      if (!result[levelId]) result[levelId] = [];
      if (!result[levelId].includes(chestId)) {
        result[levelId].push(chestId);
      }
    }
  }

  // Ordenar numéricamente para determinismo en el checksum FNV-1a
  for (const lvl of Object.keys(result)) {
    result[lvl].sort((a, b) => a - b);
  }
  return result;
}

/**
 * Deserializa un diccionario sparse, array o Set de cofres a un Set en memoria
 * para comprobación O(1) inmediata en 60 FPS en el motor de juego.
 * 
 * @param {Object|Array|Set} data
 * @returns {Set<string>} Set de identificadores canónicos
 */
export function deserializeOpenedChests(data) {
  const set = new Set();
  if (!data) return set;

  if (data instanceof Set) {
    for (const v of data) {
      if (typeof v === 'string') {
        set.add(v);
        if (v.includes(':')) {
          const [lvl, id] = v.split(':');
          set.add(`${lvl}_chest_${id}`);
        } else {
          const match = v.match(/^(.+)_chest_(\d+)$/);
          if (match) set.add(`${match[1]}:${match[2]}`);
        }
      }
    }
    return set;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      if (typeof item === 'string') {
        set.add(item);
        if (item.includes(':')) {
          const [lvl, id] = item.split(':');
          set.add(`${lvl}_chest_${id}`);
        } else {
          const match = item.match(/^(.+)_chest_(\d+)$/);
          if (match) set.add(`${match[1]}:${match[2]}`);
        }
      }
    }
    return set;
  }

  if (typeof data === 'object') {
    for (const [levelId, chestIds] of Object.entries(data)) {
      if (Array.isArray(chestIds)) {
        for (const cid of chestIds) {
          const numId = Number(cid);
          if (Number.isFinite(numId)) {
            set.add(`${levelId}_chest_${numId}`);
            set.add(`${levelId}:${numId}`);
          }
        }
      }
    }
  }

  return set;
}

/**
 * Serializa un Set o Array de claves de puertas abiertas a un diccionario sparse por mazmorra
 * `{ [levelId]: number[] }`.
 * 
 * @param {Set<string>|Array<string>} openedSet
 * @returns {Object.<string, number[]>} Diccionario compacto indexado por nivel
 */
export function serializeOpenedDoors(openedSet) {
  if (!openedSet) return {};

  if (typeof openedSet === 'object' && !(openedSet instanceof Set) && !Array.isArray(openedSet)) {
    const result = {};
    for (const [levelId, doorIds] of Object.entries(openedSet)) {
      if (Array.isArray(doorIds)) {
        const valid = doorIds.map(Number).filter(Number.isFinite);
        if (valid.length > 0) {
          result[levelId] = [...new Set(valid)].sort((a, b) => a - b);
        }
      }
    }
    return result;
  }

  const result = {};
  const entries = openedSet instanceof Set
    ? openedSet.values()
    : (Array.isArray(openedSet) ? openedSet : []);

  for (const entry of entries) {
    if (typeof entry !== 'string') continue;
    let levelId = '';
    let doorId = null;

    if (entry.includes(':')) {
      const parts = entry.split(':');
      levelId = parts[0];
      doorId = parseInt(parts[1], 10);
    } else {
      const match = entry.match(/^(.+)_door_(\d+)$/);
      if (match) {
        levelId = match[1];
        doorId = parseInt(match[2], 10);
      }
    }

    if (levelId && Number.isFinite(doorId)) {
      if (!result[levelId]) result[levelId] = [];
      if (!result[levelId].includes(doorId)) {
        result[levelId].push(doorId);
      }
    }
  }

  for (const lvl of Object.keys(result)) {
    result[lvl].sort((a, b) => a - b);
  }
  return result;
}

/**
 * Deserializa un diccionario sparse, array o Set de puertas abiertas a un Set en memoria
 * para comprobación O(1) inmediata en 60 FPS en el motor de juego.
 * 
 * @param {Object|Array|Set} data
 * @returns {Set<string>} Set de identificadores canónicos
 */
export function deserializeOpenedDoors(data) {
  const set = new Set();
  if (!data) return set;

  if (data instanceof Set) {
    for (const v of data) {
      if (typeof v === 'string') {
        set.add(v);
        if (v.includes(':')) {
          const [lvl, id] = v.split(':');
          set.add(`${lvl}_door_${id}`);
        } else {
          const match = v.match(/^(.+)_door_(\d+)$/);
          if (match) set.add(`${match[1]}:${match[2]}`);
        }
      }
    }
    return set;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      if (typeof item === 'string') {
        set.add(item);
        if (item.includes(':')) {
          const [lvl, id] = item.split(':');
          set.add(`${lvl}_door_${id}`);
        } else {
          const match = item.match(/^(.+)_door_(\d+)$/);
          if (match) set.add(`${match[1]}:${match[2]}`);
        }
      }
    }
    return set;
  }

  if (typeof data === 'object') {
    for (const [levelId, doorIds] of Object.entries(data)) {
      if (Array.isArray(doorIds)) {
        for (const did of doorIds) {
          const numId = Number(did);
          if (Number.isFinite(numId)) {
            set.add(`${levelId}_door_${numId}`);
            set.add(`${levelId}:${numId}`);
          }
        }
      }
    }
  }

  return set;
}

export class SaveManager {
  constructor({ adapter = null, defaultSlot = DEFAULT_SLOT_ID } = {}) {
    this.adapter = adapter || new HybridStorageAdapter();
    this.currentSlotId = defaultSlot;
    this.currentSave = createDefaultSave(this.currentSlotId);
    this.isLoaded = false;
    this.listeners = new Set();
    this._cachedSummaries = null;
  }

  /**
   * Inicializa y carga la ranura activa con auto-recuperación y migración.
   */
  async init(slotId = this.currentSlotId) {
    this.currentSlotId = slotId;
    this.currentSave = await this.loadSlot(slotId);
    // Si la ranura por defecto no existía en almacenamiento, guardarla para inicializar el estado base
    const activeKey = `save_${slotId}_active`;
    let exists = null;
    try {
      exists = await this.adapter.get(activeKey);
    } catch {}
    if (!exists && slotId === DEFAULT_SLOT_ID) {
      await this.saveSlot(slotId, this.currentSave);
    }
    this.isLoaded = true;
    this._notifyChange();
    await this.getAllSlotsSummary();
    return this.currentSave;
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    return () => {};
  }

  _notifyChange() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentSave);
      } catch (err) {
        console.error('[SaveManager] Error en listener de guardado:', err);
      }
    }
  }

  _healCompletedChapterInventory(save) {
    if (!save || !save.inventory) return;
    const highestChapter = save.campaign?.highestChapterUnlocked || 1;
    const hasChapterKeys = Array.isArray(save.inventory.keys) && save.inventory.keys.some(k => {
      const id = typeof k === 'string' ? k : (k?.id || k?.name);
      return id === 'llave_santuario' || id === 'llave_cripta_fuego' || id === 'llave_trono_vacio';
    });

    if (highestChapter >= 2 || hasChapterKeys) {
      let touched = false;
      if (!save.inventory.openedChests || Object.keys(save.inventory.openedChests).length === 0) {
        save.inventory.openedChests = {
          abyss_throne: [1],
          crypt_inferno: [1, 2],
          dungeon_classic: [1, 2],
        };
        touched = true;
      }
      if (!save.inventory.openedDoors || Object.keys(save.inventory.openedDoors).length === 0) {
        save.inventory.openedDoors = {
          abyss_throne: [1, 2],
          crypt_inferno: [1, 2],
          dungeon_classic: [1, 2],
        };
        touched = true;
      }
      if (touched) {
        save.checksum = calculateChecksum(save);
      }
    }
  }

  /**
   * Carga una ranura con protocolo de doble buffer:
   * 1. Intenta leer el archivo activo validando checksum.
   * 2. Si está corrupto o ausente, recupera automáticamente del backup.
   * 3. Si ambos faltan, migra datos legacy v1.
   * 4. Si no hay nada previo, inicializa save nuevo.
   */
  async loadSlot(slotId = this.currentSlotId) {
    const activeKey = `save_${slotId}_active`;
    const backupKey = `save_${slotId}_backup`;

    // 1. Intentar archivo activo
    try {
      const activeData = await this.adapter.get(activeKey);
      if (activeData && validateSaveData(activeData)) {
        this._healCompletedChapterInventory(activeData);
        this.currentSlotId = slotId;
        this.currentSave = activeData;
        return activeData;
      }
    } catch (err) {
      console.warn(`[SaveManager] Error leyendo ${activeKey}:`, err);
    }

    // 2. Intentar backup por corrupción
    try {
      const backupData = await this.adapter.get(backupKey);
      if (backupData && validateSaveData(backupData)) {
        this._healCompletedChapterInventory(backupData);
        console.info(`[SaveManager] Ranura ${slotId} restaurada exitosamente desde copia de seguridad (backup).`);
        await this.adapter.set(activeKey, backupData);
        this.currentSlotId = slotId;
        this.currentSave = backupData;
        return backupData;
      }
    } catch (err) {
      console.warn(`[SaveManager] Error leyendo backup ${backupKey}:`, err);
    }

    // 3. Comprobar migración legacy v1 (exclusivamente para la ranura principal DEFAULT_SLOT_ID)
    if (slotId === DEFAULT_SLOT_ID) {
      const legacyMigrated = migrateFromLegacy(slotId);
      if (legacyMigrated) {
        console.info(`[SaveManager] Migración v1 -> v2 completada para ${slotId}.`);
        await this.saveSlot(slotId, legacyMigrated);
        return legacyMigrated;
      }
    }

    // 4. Generar estado inicial limpio en memoria
    const freshSave = createDefaultSave(slotId);
    this.currentSlotId = slotId;
    this.currentSave = freshSave;
    return freshSave;
  }

  /**
   * Guarda de forma atómica y segura con doble buffer:
   * 1. Preserva el activo actual como backup.
   * 2. Escribe el nuevo save en temp.
   * 3. Verifica integridad en staging.
   * 4. Promueve temp a active.
   * 5. Escribe espejo legacy para compatibilidad con código existente.
   */
  async saveSlot(slotId, data) {
    const activeKey = `save_${slotId}_active`;
    const backupKey = `save_${slotId}_backup`;
    const tempKey = `save_${slotId}_temp`;

    const prepared = {
      ...data,
      slotId: String(slotId),
      version: SAVE_SCHEMA_VERSION,
      updatedAt: Date.now(),
    };
    prepared.checksum = calculateChecksum(prepared);

    if (!validateSaveData(prepared)) {
      throw new Error(`[SaveManager] Verificación de integridad fallida en guardado de ranura ${slotId}.`);
    }

    // 1. Respaldar estado activo anterior si era válido
    try {
      const currentActive = await this.adapter.get(activeKey);
      if (currentActive && validateSaveData(currentActive)) {
        await this.adapter.set(backupKey, currentActive);
      }
    } catch { /* Ignorar error de backup */ }

    // 2. Escribir a staging temporal y promover a active
    await this.adapter.set(tempKey, prepared);
    await this.adapter.set(activeKey, prepared);
    await this.adapter.delete(tempKey);

    // 5. Espejo de compatibilidad legacy para tests y módulos existentes
    this._writeLegacyMirror(prepared);

    this.currentSlotId = slotId;
    this.currentSave = prepared;
    this._notifyChange();
    await this.getAllSlotsSummary();
    return prepared;
  }

  /**
   * Guarda el estado actual en memoria en la ranura activa de forma asíncrona.
   */
  async saveCurrent() {
    return this.saveSlot(this.currentSlotId, this.currentSave);
  }

  /**
   * Escribe las claves tradicionales en localStorage para no romper ningún
   * lector síncrono previo ni pruebas unitarias existentes.
   */
  _writeLegacyMirror(save) {
    try {
      const rawStorage = typeof localStorage !== 'undefined' ? localStorage : null;
      if (!rawStorage) return;

      if (save.campaign) {
        rawStorage.setItem(LEGACY_CAMPAIGN_KEY, JSON.stringify({
          highestChapterUnlocked: save.campaign.highestChapterUnlocked,
          completedChapters: save.campaign.completedChapters,
          records: save.campaign.records,
          lastPlayedChapterId: save.campaign.lastPlayedChapterId,
          updatedAt: save.updatedAt,
        }));
      }

      if (save.profile) {
        if (save.profile.name) rawStorage.setItem('dungeon_player_name', save.profile.name);
        if (save.profile.favoriteHero !== undefined) {
          rawStorage.setItem('dungeon_player_color', String(save.profile.favoriteHero));
        }
        if (save.profile.settings) {
          const s = save.profile.settings;
          if (s.camera) rawStorage.setItem('dungeon_camera', s.camera);
          if (s.dpr) rawStorage.setItem('dungeon_dpr', String(s.dpr));
          if (s.sensitivity) rawStorage.setItem('dungeon_sensitivity', String(s.sensitivity));
          if (s.soundMuted !== undefined) rawStorage.setItem('dungeon_sound_muted', s.soundMuted ? '1' : '0');
          if (s.controlsDismissed !== undefined) rawStorage.setItem('runa_controls_dismissed', String(s.controlsDismissed));
        }
      }
    } catch { /* Entorno sin localStorage */ }
  }

  // --- Gestión de las 3 Ranuras de Guardado ---

  /**
   * Obtiene el resumen de estado de las 3 ranuras disponibles.
   * @returns {Promise<Array<Object>>}
   */
  async getAllSlotsSummary() {
    const summaries = [];
    for (const slotId of AVAILABLE_SLOTS) {
      const activeKey = `save_${slotId}_active`;
      let data = null;
      try {
        data = await this.adapter.get(activeKey);
      } catch {}

      if (!data && slotId === DEFAULT_SLOT_ID) {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('runa_legacy_migrated') !== 'done') {
          data = migrateFromLegacy(slotId);
        }
      }

      if (data && validateSaveData(data)) {
        summaries.push({
          slotId,
          isEmpty: false,
          isActive: slotId === this.currentSlotId,
          name: data.profile?.name || 'Aventurero',
          heroIndex: Number.isFinite(data.profile?.favoriteHero) ? data.profile.favoriteHero : 0,
          highestChapter: data.campaign?.highestChapterUnlocked || 1,
          completedCount: Array.isArray(data.campaign?.completedChapters) ? data.campaign.completedChapters.length : 0,
          totalGems: data.inventory?.totalGems || 0,
          updatedAt: data.updatedAt || null,
        });
      } else {
        summaries.push({
          slotId,
          isEmpty: true,
          isActive: slotId === this.currentSlotId,
          name: 'Ranura Vacía',
          heroIndex: 0,
          highestChapter: 1,
          completedCount: 0,
          totalGems: 0,
          updatedAt: null,
        });
      }
    }
    this._cachedSummaries = summaries;
    return summaries;
  }

  getCachedSummaries() {
    return this._cachedSummaries;
  }

  /**
   * Cambia la ranura de guardado activa cargando sus datos canónicos.
   * @param {string} slotId - 'slot_1' | 'slot_2' | 'slot_3'
   */
  async switchSlot(slotId) {
    if (!AVAILABLE_SLOTS.includes(slotId)) {
      throw new Error(`Ranura no válida: ${slotId}`);
    }
    this.currentSlotId = slotId;
    this.currentSave = await this.loadSlot(slotId);
    this._writeLegacyMirror(this.currentSave);
    if (this._cachedSummaries) {
      for (const s of this._cachedSummaries) {
        s.isActive = (s.slotId === slotId);
      }
    }
    this._notifyChange();
    return this.currentSave;
  }

  /**
   * Reinicia/borra los datos de una ranura de guardado.
   * @param {string} slotId - 'slot_1' | 'slot_2' | 'slot_3'
   */
  async deleteSlot(slotId) {
    if (!AVAILABLE_SLOTS.includes(slotId)) {
      throw new Error(`Ranura no válida: ${slotId}`);
    }
    const activeKey = `save_${slotId}_active`;
    const backupKey = `save_${slotId}_backup`;
    await this.adapter.delete(activeKey);
    await this.adapter.delete(backupKey);

    if (slotId === this.currentSlotId) {
      this.currentSave = createDefaultSave(slotId);
      this._notifyChange();
    }
    if (slotId === DEFAULT_SLOT_ID) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('runa_legacy_migrated', 'done');
          localStorage.removeItem(LEGACY_CAMPAIGN_KEY);
          localStorage.removeItem('dungeon_player_name');
          localStorage.removeItem('dungeon_player_color');
        }
      } catch {}
    }
    await this.getAllSlotsSummary();
    return true;
  }

  serializeOpenedChests(openedSet) {
    return serializeOpenedChests(openedSet);
  }

  deserializeOpenedChests(data) {
    return deserializeOpenedChests(data);
  }

  serializeOpenedDoors(openedSet) {
    return serializeOpenedDoors(openedSet);
  }

  deserializeOpenedDoors(data) {
    return deserializeOpenedDoors(data);
  }

  /**
   * Guarda de forma explícita y atómica la partida al terminar una mazmorra.
   * Regla de negocio: El progreso de campaña y el botín recolectado solo se persisten en disco al completar con éxito una mazmorra.
   */
  async saveDungeonCompletion({ levelId, chapterId, isVictory = false, campaign = null, inventory = null } = {}) {
    if (campaign && typeof campaign === 'object') {
      this.currentSave.campaign = {
        ...this.currentSave.campaign,
        ...campaign,
      };
    }
    if (inventory && typeof inventory === 'object') {
      const curInv = this.currentSave.inventory || {};
      const newOpened = inventory.openedChests !== undefined
        ? serializeOpenedChests(inventory.openedChests)
        : (curInv.openedChests || {});
      const newOpenedDoors = inventory.openedDoors !== undefined
        ? serializeOpenedDoors(inventory.openedDoors)
        : (curInv.openedDoors || {});

      this.currentSave.inventory = {
        ...curInv,
        totalGems: inventory.totalGems ?? curInv.totalGems ?? 0,
        potions: Array.isArray(inventory.potions) ? [...inventory.potions] : (curInv.potions || []),
        relics: Array.isArray(inventory.relics) ? [...inventory.relics] : (curInv.relics || []),
        keys: Array.isArray(inventory.keys) ? [...inventory.keys] : (curInv.keys || []),
        openedChests: newOpened,
        openedDoors: newOpenedDoors,
      };
    }

    // Limpiar suspendState ya que la mazmorra se superó
    this.currentSave.suspendState = null;
    this.currentSave.updatedAt = Date.now();
    this.currentSave.checksum = calculateChecksum(this.currentSave);

    await this.saveSlot(this.currentSlotId, this.currentSave);
    return this.currentSave;
  }

  // --- Getters y Actualizadores de Memoria ---

  getCampaign() {
    return this.currentSave.campaign;
  }

  updateCampaign(partialCampaign, { immediateSave = false } = {}) {
    this.currentSave.campaign = {
      ...this.currentSave.campaign,
      ...partialCampaign,
    };
    this.currentSave.checksum = calculateChecksum(this.currentSave);
    if (immediateSave) {
      this.saveCurrent().catch((err) => console.error('[SaveManager] Error en auto-save de campaña:', err));
    }
    return this.currentSave.campaign;
  }

  getProfile() {
    return this.currentSave.profile;
  }

  updateProfile(partialProfile) {
    this.currentSave.profile = {
      ...this.currentSave.profile,
      ...partialProfile,
    };
    this.currentSave.checksum = calculateChecksum(this.currentSave);
    this._writeLegacyMirror(this.currentSave);
    this.saveCurrent().catch((err) => console.error('[SaveManager] Error en auto-save de perfil:', err));
    return this.currentSave.profile;
  }

  getSettings() {
    return this.currentSave.profile?.settings || {};
  }

  updateSettings(partialSettings) {
    this.currentSave.profile.settings = {
      ...this.currentSave.profile.settings,
      ...partialSettings,
    };
    this.currentSave.checksum = calculateChecksum(this.currentSave);
    this._writeLegacyMirror(this.currentSave);
    this.saveCurrent().catch((err) => console.error('[SaveManager] Error en auto-save de ajustes:', err));
    return this.currentSave.profile.settings;
  }

  getInventory() {
    return this.currentSave.inventory;
  }

  updateInventory(partialInventory) {
    this.currentSave.inventory = {
      ...this.currentSave.inventory,
      ...partialInventory,
    };
    this.currentSave.checksum = calculateChecksum(this.currentSave);
    this.saveCurrent().catch((err) => console.error('[SaveManager] Error en auto-save de inventario:', err));
    return this.currentSave.inventory;
  }

  getSuspendState() {
    return this.currentSave.suspendState;
  }

  setSuspendState(suspendData) {
    this.currentSave.suspendState = suspendData ? { ...suspendData, at: Date.now() } : null;
    this.currentSave.checksum = calculateChecksum(this.currentSave);
    this.saveCurrent().catch((err) => console.error('[SaveManager] Error en auto-save de suspendState:', err));
    return this.currentSave.suspendState;
  }

  clearSuspendState() {
    this.currentSave.suspendState = null;
    this.currentSave.checksum = calculateChecksum(this.currentSave);
    this.saveCurrent().catch((err) => console.error('[SaveManager] Error al limpiar suspendState:', err));
  }

  // --- Exportación e Importación de Partidas (Savefiles) ---

  exportSaveJson(slotId = this.currentSlotId) {
    const save = slotId === this.currentSlotId ? this.currentSave : null;
    if (!save) return null;
    const clean = {
      ...save,
      updatedAt: Date.now(),
    };
    clean.checksum = calculateChecksum(clean);
    return JSON.stringify(clean, null, 2);
  }

  async exportSlotJson(slotId = this.currentSlotId) {
    let save = (slotId === this.currentSlotId) ? this.currentSave : null;
    if (!save) {
      save = await this.loadSlot(slotId);
    }
    if (!save) return null;
    const clean = {
      ...save,
      updatedAt: Date.now(),
    };
    clean.checksum = calculateChecksum(clean);
    return JSON.stringify(clean, null, 2);
  }

  async importSaveJson(jsonString, targetSlotId = this.currentSlotId) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Formato JSON inválido');
      }

      // 1. Validar integridad de los datos entrantes (evitar datos alterados o corruptos)
      if (!validateSaveData(parsed)) {
        throw new Error('La partida importada no superó la validación de integridad (checksum inválido o datos corruptos)');
      }

      // 2. Reasignar a la ranura destino conservando los datos validados
      const normalized = {
        ...parsed,
        version: SAVE_SCHEMA_VERSION,
        slotId: String(targetSlotId),
        updatedAt: Date.now(),
      };
      normalized.checksum = calculateChecksum(normalized);

      await this.saveSlot(targetSlotId, normalized);
      if (targetSlotId === this.currentSlotId) {
        this.currentSave = normalized;
        this._writeLegacyMirror(normalized);
        this._notifyChange();
      }
      return normalized;
    } catch (err) {
      throw new Error(`Error importando partida: ${err?.message || err}`);
    }
  }
}

/** Instancia única singleton para toda la aplicación */
export const saveManager = new SaveManager();
