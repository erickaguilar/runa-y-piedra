/**
 * ChapterRegistry.js
 * 
 * Catálogo formal de capítulos y orquestador de progresión de la campaña (10 capítulos × 3 mazmorras).
 * Proporciona persistencia resiliente en localStorage ('runa_campaign_progress_v1') con fallback
 * seguro en memoria para entornos Node.js / SSR.
 */

export const CAMPAIGN_PROGRESS_STORAGE_KEY = 'runa_campaign_progress_v1';
import { saveManager } from '../storage/SaveManager.js';

export const CHAPTER_CATALOG = Object.freeze([
  {
    id: 'capitulo_1',
    number: 1,
    name: 'El Descenso Ancestral',
    theme: 'ancient_stone',
    lore: 'Antiguas cámaras de sillar milenario y corrientes de magma primigenio.',
    icon: 'castle',
    dungeons: [
      { id: 'dungeon_classic', role: 'intro', name: 'Mazmorra Ancestral' },
      { id: 'crypt_inferno',  role: 'challenge', name: 'Cripta del Fuego' },
      { id: 'abyss_throne',   role: 'climax', name: 'Trono del Abismo' }
    ]
  },
  {
    id: 'capitulo_2',
    number: 2,
    name: 'Cripta de las Sombras',
    theme: 'dark_shadows',
    lore: 'Galerías de basalto negro y niebla densa donde las antorchas revelan secretos.',
    icon: 'pickaxe',
    underConstruction: true,
    dungeons: [
      { id: 'shadow_vault', role: 'intro', name: 'Bóveda Umbría', underConstruction: true },
      { id: 'shadow_chasm', role: 'challenge', name: 'Abismo de las Sombras', underConstruction: true },
      { id: 'shadow_sanctum', role: 'climax', name: 'Santuario Crepuscular', underConstruction: true }
    ]
  },
  {
    id: 'capitulo_3',
    number: 3,
    name: 'Cataratas Subterráneas',
    theme: 'subterranean_falls',
    lore: 'Piedra caliza húmeda y acueductos milenarios con corrientes turbulentas.',
    icon: 'droplet',
    underConstruction: true,
    dungeons: [
      { id: 'falls_aqueduct', role: 'intro', name: 'Acueducto Arcaico', underConstruction: true },
      { id: 'falls_torrent', role: 'challenge', name: 'Torrente Subterráneo', underConstruction: true },
      { id: 'falls_reservoir', role: 'climax', name: 'Cisterna Sumergida', underConstruction: true }
    ]
  },
  {
    id: 'capitulo_4',
    number: 4,
    name: 'La Gran Forja Enana',
    theme: 'dwarven_forge',
    lore: 'Ladrillos de hierro forjado, engranajes colosales y pistones aplastantes.',
    icon: 'anvil',
    underConstruction: true,
    dungeons: [
      { id: 'forge_hall', role: 'intro', name: 'Vestíbulo de Yunque', underConstruction: true },
      { id: 'forge_slag', role: 'challenge', name: 'Canal de Escoria', underConstruction: true },
      { id: 'forge_crucible', role: 'climax', name: 'Crisol del Titán', underConstruction: true }
    ]
  },
  {
    id: 'capitulo_5',
    number: 5,
    name: 'Cuevas de Escarcha y Hielo',
    theme: 'frost_caves',
    lore: 'Bloques translúcidos de hielo donde la inercia desafía el equilibrio del explorador.',
    icon: 'snowflake',
    underConstruction: true,
    dungeons: [
      { id: 'frost_cavern', role: 'intro', name: 'Caverna Gélida', underConstruction: true },
      { id: 'frost_glacier', role: 'challenge', name: 'Glaciar Quebradizo', underConstruction: true },
      { id: 'frost_spire', role: 'climax', name: 'Aguja Helada', underConstruction: true }
    ]
  },
  {
    id: 'capitulo_6',
    number: 6,
    name: 'Catacumbas del Moho Venenoso',
    theme: 'poison_catacombs',
    lore: 'Roca cubierta de líquenes, lodo verde y miasmas tóxicos que drenan la vitalidad.',
    icon: 'biohazard',
    underConstruction: true,
    dungeons: [
      { id: 'poison_moss', role: 'intro', name: 'Galería de Líquenes', underConstruction: true },
      { id: 'poison_canal', role: 'challenge', name: 'Canal Miasmático', underConstruction: true },
      { id: 'poison_necropolis', role: 'climax', name: 'Necrópolis Esmeralda', underConstruction: true }
    ]
  },
  {
    id: 'capitulo_7',
    number: 7,
    name: 'Templo Arcano Olvidado',
    theme: 'arcane_temple',
    lore: 'Mármol blanco refinado, energía cian y portales de teletransporte instantáneo.',
    icon: 'sparkles',
    underConstruction: true,
    dungeons: [
      { id: 'arcane_vestibule', role: 'intro', name: 'Vestíbulo Celestial', underConstruction: true },
      { id: 'arcane_nexus', role: 'challenge', name: 'Nexo de Portales', underConstruction: true },
      { id: 'arcane_sanctuary', role: 'climax', name: 'Santuario de Éter', underConstruction: true }
    ]
  },
  {
    id: 'capitulo_8',
    number: 8,
    name: 'Minas Profundas de Carbón',
    theme: 'coal_mines',
    lore: 'Vigas de madera carcomida y losas frágiles que se quiebran bajo tus pies.',
    icon: 'hammer',
    underConstruction: true,
    dungeons: [
      { id: 'mines_shaft', role: 'intro', name: 'Pozo de Extracción', underConstruction: true },
      { id: 'mines_abyss', role: 'challenge', name: 'Grieta Carbonífera', underConstruction: true },
      { id: 'mines_heart', role: 'climax', name: 'Corazón de la Veta', underConstruction: true }
    ]
  },
  {
    id: 'capitulo_9',
    number: 9,
    name: 'Prisión Flotante del Vacío',
    theme: 'void_prison',
    lore: 'Monolitos suspendidos en el cosmos; parkour de precisión sin margen para el error.',
    icon: 'orbit',
    underConstruction: true,
    dungeons: [
      { id: 'void_isles', role: 'intro', name: 'Islotes Ingrávidos', underConstruction: true },
      { id: 'void_bridge', role: 'challenge', name: 'Puente Estelar', underConstruction: true },
      { id: 'void_citadel', role: 'climax', name: 'Ciudadela del Vacío', underConstruction: true }
    ]
  },
  {
    id: 'capitulo_10',
    number: 10,
    name: 'El Núcleo del Titán Rúnico',
    theme: 'titan_core',
    lore: 'Obsidiana pulida, magma dorado y el santuario supremo que exige cooperación total.',
    icon: 'sun',
    underConstruction: true,
    dungeons: [
      { id: 'titan_gate', role: 'intro', name: 'Puerta Primordial', underConstruction: true },
      { id: 'titan_chamber', role: 'challenge', name: 'Cámara de Presión', underConstruction: true },
      { id: 'titan_heart', role: 'climax', name: 'Núcleo Rúnico Final', underConstruction: true }
    ]
  }
]);

export function createInitialCampaignProgress() {
  return {
    highestChapterUnlocked: 1,
    completedChapters: [],
    records: {},
    lastPlayedChapterId: 'capitulo_1',
    updatedAt: Date.now(),
  };
}

const memoryStore = new Map();

function getStorage() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch { /* Entornos restringidos o tests Node */ }
  return {
    getItem: (k) => (memoryStore.has(k) ? memoryStore.get(k) : null),
    setItem: (k, v) => memoryStore.set(k, String(v)),
    removeItem: (k) => memoryStore.delete(k),
  };
}

export class ChapterRegistry {
  constructor(catalog = CHAPTER_CATALOG) {
    this.catalog = catalog;
    this.chaptersById = new Map();
    this.chaptersByNumber = new Map();
    this.dungeonToChapter = new Map();

    for (const ch of this.catalog) {
      this.chaptersById.set(ch.id, ch);
      this.chaptersByNumber.set(ch.number, ch);
      for (const d of ch.dungeons || []) {
        this.dungeonToChapter.set(d.id, ch);
      }
    }

    this.progress = this.loadProgress();
    this.currentChapterId = this.progress.lastPlayedChapterId || 'capitulo_1';
    if (!this.chaptersById.has(this.currentChapterId)) {
      this.currentChapterId = this.catalog[0]?.id || 'capitulo_1';
    }
  }

  getAllChapters() {
    return [...this.catalog];
  }

  getChapter(idOrNumber) {
    if (typeof idOrNumber === 'number') {
      return this.chaptersByNumber.get(idOrNumber);
    }
    return this.chaptersById.get(String(idOrNumber));
  }

  getCurrentChapter() {
    return this.getChapter(this.currentChapterId) || this.catalog[0];
  }

  setCurrentChapter(idOrNumber) {
    const ch = this.getChapter(idOrNumber);
    if (!ch) return false;
    this.currentChapterId = ch.id;
    this.progress.lastPlayedChapterId = ch.id;
    this.saveProgress(this.progress);
    return true;
  }

  getChapterForLevel(levelId) {
    if (!levelId) return null;
    return this.dungeonToChapter.get(levelId) || null;
  }

  getDungeonsForChapter(idOrNumber) {
    const ch = this.getChapter(idOrNumber);
    return ch?.dungeons ? [...ch.dungeons] : [];
  }

  getNextDungeonInChapter(levelId) {
    const ch = this.getChapterForLevel(levelId);
    if (!ch || !Array.isArray(ch.dungeons)) return null;
    const idx = ch.dungeons.findIndex((d) => d.id === levelId);
    if (idx < 0 || idx >= ch.dungeons.length - 1) return null;
    return ch.dungeons[idx + 1];
  }

  isLastDungeonInChapter(levelId) {
    const ch = this.getChapterForLevel(levelId);
    if (!ch || !Array.isArray(ch.dungeons) || ch.dungeons.length === 0) return false;
    const lastDungeon = ch.dungeons[ch.dungeons.length - 1];
    return lastDungeon.id === levelId;
  }

  loadProgress() {
    // 1. Intentar cargar desde saveManager v2 si ya está inicializado
    if (saveManager && saveManager.currentSave?.campaign) {
      const v2Campaign = saveManager.getCampaign();
      if (v2Campaign && typeof v2Campaign.highestChapterUnlocked === 'number') {
        return {
          highestChapterUnlocked: Math.max(1, Number(v2Campaign.highestChapterUnlocked) || 1),
          completedChapters: Array.isArray(v2Campaign.completedChapters) ? [...new Set(v2Campaign.completedChapters)] : [],
          records: v2Campaign.records && typeof v2Campaign.records === 'object' ? v2Campaign.records : {},
          lastPlayedChapterId: typeof v2Campaign.lastPlayedChapterId === 'string' ? v2Campaign.lastPlayedChapterId : 'capitulo_1',
          updatedAt: Number(v2Campaign.updatedAt) || Date.now(),
        };
      }
    }

    // 2. Fallback a storage directo / legacy
    const store = getStorage();
    try {
      const raw = store.getItem(CAMPAIGN_PROGRESS_STORAGE_KEY);
      if (!raw) return createInitialCampaignProgress();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return createInitialCampaignProgress();

      return {
        highestChapterUnlocked: Math.max(1, Number(parsed.highestChapterUnlocked) || 1),
        completedChapters: Array.isArray(parsed.completedChapters) ? [...new Set(parsed.completedChapters)] : [],
        records: parsed.records && typeof parsed.records === 'object' ? parsed.records : {},
        lastPlayedChapterId: typeof parsed.lastPlayedChapterId === 'string' ? parsed.lastPlayedChapterId : 'capitulo_1',
        updatedAt: Number(parsed.updatedAt) || Date.now(),
      };
    } catch {
      return createInitialCampaignProgress();
    }
  }

  saveProgress(progress = this.progress) {
    const store = getStorage();
    try {
      const normalized = {
        highestChapterUnlocked: Math.max(1, Number(progress.highestChapterUnlocked) || 1),
        completedChapters: Array.isArray(progress.completedChapters) ? [...new Set(progress.completedChapters)] : [],
        records: progress.records && typeof progress.records === 'object' ? progress.records : {},
        lastPlayedChapterId: String(progress.lastPlayedChapterId || 'capitulo_1'),
        updatedAt: Date.now(),
      };
      this.progress = normalized;
      store.setItem(CAMPAIGN_PROGRESS_STORAGE_KEY, JSON.stringify(normalized));

      // Sincronizar asíncronamente con saveManager v2 (IndexedDB + doble buffer)
      if (saveManager) {
        saveManager.updateCampaign(normalized);
      }

      return true;
    } catch {
      return false;
    }
  }

  resetProgress() {
    const initial = createInitialCampaignProgress();
    this.progress = initial;
    this.currentChapterId = initial.lastPlayedChapterId;
    this.saveProgress(initial);
    return initial;
  }

  isChapterUnlocked(idOrNumber) {
    const ch = this.getChapter(idOrNumber);
    if (!ch) return false;
    if (ch.number === 1) return true;
    return ch.number <= (this.progress.highestChapterUnlocked || 1);
  }

  isChapterPlayable(idOrNumber) {
    const ch = this.getChapter(idOrNumber);
    if (!ch) return false;
    if (ch.underConstruction || ch.number >= 2) return false;
    return this.isChapterUnlocked(idOrNumber);
  }

  completeChapter(idOrNumber, stats = {}) {
    const ch = this.getChapter(idOrNumber);
    if (!ch) return null;

    if (!this.progress.completedChapters.includes(ch.id)) {
      this.progress.completedChapters.push(ch.id);
    }

    const prevRecord = this.progress.records[ch.id] || {};
    const bestTimeSec = Number.isFinite(stats.timeSec)
      ? Math.min(prevRecord.bestTimeSec ?? Infinity, stats.timeSec)
      : (prevRecord.bestTimeSec ?? null);

    const deaths = Number.isFinite(stats.deaths)
      ? stats.deaths
      : (prevRecord.deaths ?? 0);

    const stars = Number.isFinite(stats.stars)
      ? Math.max(prevRecord.stars ?? 0, stats.stars)
      : (prevRecord.stars ?? 3);

    this.progress.records[ch.id] = {
      bestTimeSec,
      deaths,
      stars,
      completedAt: Date.now(),
    };

    const nextNumber = ch.number + 1;
    let nextChapter = null;
    if (nextNumber <= this.catalog.length) {
      this.progress.highestChapterUnlocked = Math.max(
        this.progress.highestChapterUnlocked,
        nextNumber
      );
      nextChapter = this.getChapter(nextNumber);
    }

    this.saveProgress(this.progress);

    return {
      chapter: ch,
      nextChapter,
      progress: this.progress,
    };
  }

  getRecord(idOrNumber) {
    const ch = this.getChapter(idOrNumber);
    if (!ch) return null;
    return this.progress.records[ch.id] || null;
  }
}

export const chapterRegistry = new ChapterRegistry();
