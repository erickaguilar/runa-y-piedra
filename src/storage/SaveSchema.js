/**
 * SaveSchema.js - Definición de esquemas, validación FNV-1a y serializadores de guardado
 * Desacoplado de SaveManager para responsabilidad única y testabilidad pura.
 */

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
  const { checksum: _checksum, ...rest } = data;

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
      name: '',
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
    /** @type {Record<string, number[]>} */
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

  /** @type {Record<string, number[]>} */
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
    /** @type {Record<string, number[]>} */
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

  /** @type {Record<string, number[]>} */
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
