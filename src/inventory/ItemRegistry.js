/**
 * ItemRegistry.js - Catálogo canónico y Biblioteca de Objetos del Mundo
 *
 * Centraliza la definición de todas las llaves, reliquias, pociones y tesoros
 * con identificadores únicos estables (IDs canónicos).
 * Permite que cualquier sistema apunte directamente al objeto sin duplicar lógica ni datos.
 */

export const ITEM_LIBRARY = Object.freeze({
  // --- LLAVES DE MAZMORRA Y CAPÍTULO ---
  llave_tutorial: {
    id: 'llave_tutorial',
    type: 'key',
    name: 'Llave del Aprendiz',
    icon: 'key',
    color: '#38bdf8',
    chapterId: 'lobby_tutorial',
    levelId: 'lobby_tutorial',
    description: 'Llave de forja otorgada a los iniciados en el campo de entrenamiento.',
    lore: 'Su empuñadura de bronce lleva grabada la runa del aprendiz.'
  },
  llave_santuario: {
    id: 'llave_santuario',
    type: 'key',
    name: 'Llave del Santuario Antiguo',
    icon: 'key',
    color: '#fbbf24',
    chapterId: 'capitulo_1',
    levelId: 'dungeon_classic',
    description: 'Antigua llave de bronce que abre las cámaras del Santuario Antiguo.',
    lore: 'Desprende un leve calor rúnico tras siglos de reposo en el vestíbulo.'
  },
  llave_cripta_fuego: {
    id: 'llave_cripta_fuego',
    type: 'key',
    name: 'Llave de la Cripta de Fuego',
    icon: 'key',
    color: '#f97316',
    chapterId: 'capitulo_1',
    levelId: 'crypt_inferno',
    description: 'Llave templada al fuego para las puertas de la Cripta Infernal.',
    lore: 'Forjada con cenizas volcánicas resistentes a las llamas eternas.'
  },
  llave_trono_vacio: {
    id: 'llave_trono_vacio',
    type: 'key',
    name: 'Llave del Trono del Vacío',
    icon: 'key',
    color: '#a855f7',
    chapterId: 'capitulo_1',
    levelId: 'abyss_throne',
    description: 'Llave de obsidiana del altar supremo del Trono del Vacío.',
    lore: 'Una lámina de vacío sólido que desafía la luz de las antorchas.'
  },

  // --- POCIONES DE SALUD ---
  pocion_vida: {
    id: 'pocion_vida',
    type: 'potion',
    name: 'Poción de Vida',
    icon: 'potion',
    color: '#f43f5e',
    healAmount: 1,
    description: 'Brebaje carmesí que restaura 1 corazón de salud vital.',
    lore: 'Destilada a partir de raíces rúnicas encontradas en las profundidades.'
  },

  // --- RELIQUIAS MÍTICAS ---
  caliz_sagrado: {
    id: 'caliz_sagrado',
    type: 'relic',
    name: 'Cáliz Sagrado',
    icon: 'trophy',
    color: '#eab308',
    chapterId: 'capitulo_1',
    levelId: 'dungeon_classic',
    description: 'Reliquia sagrada de la Mazmorra Ancestral.',
    lore: 'Se dice que contenía el néctar de los primeros constructores.'
  },
  corazon_volcan: {
    id: 'corazon_volcan',
    type: 'relic',
    name: 'Corazón del Volcán',
    icon: 'flame',
    color: '#f97316',
    chapterId: 'capitulo_1',
    levelId: 'crypt_inferno',
    description: 'Núcleo incandescente extraído del magma de la Cripta.',
    lore: 'Late con el pulso ígneo de las entrañas de la tierra.'
  },
  corona_vacio: {
    id: 'corona_vacio',
    type: 'relic',
    name: 'Corona del Vacío',
    icon: 'crown',
    color: '#a855f7',
    chapterId: 'capitulo_1',
    levelId: 'abyss_throne',
    description: 'Corona milenaria recuperada del Trono del Vacío.',
    lore: 'Símbolo del antiguo monarca que reinaba antes del cataclismo.'
  }
});

/**
 * Obtiene la definición canónica de un ítem a partir de su ID o un objeto que contenga id/name.
 * @param {string|Object} itemRef ID o referencia al ítem
 * @returns {Object|null}
 */
export function getItemDefinition(itemRef) {
  if (!itemRef) return null;
  const id = typeof itemRef === 'object' ? (itemRef.id || itemRef.name) : itemRef;
  return ITEM_LIBRARY[id] || null;
}

/**
 * Crea o normaliza una instancia de ítem para el inventario, completando atributos
 * canónicos desde la biblioteca si faltan.
 * @param {string|Object} itemRef
 * @param {Object} [overrides={}]
 * @returns {Object}
 */
export function createInventoryItem(itemRef, overrides = {}) {
  const rawId = typeof itemRef === 'object' ? (itemRef.id || itemRef.name) : itemRef;
  const def = getItemDefinition(rawId) || {};
  return {
    id: rawId,
    name: overrides.name || (typeof itemRef === 'object' && itemRef.name) || def.name || rawId,
    type: overrides.type || (typeof itemRef === 'object' && itemRef.type) || def.type || 'item',
    icon: overrides.icon || (typeof itemRef === 'object' && itemRef.icon) || def.icon || 'gem',
    color: overrides.color || (typeof itemRef === 'object' && itemRef.color) || def.color || '#fbbf24',
    description: overrides.description || (typeof itemRef === 'object' && itemRef.description) || def.description || '',
    lore: overrides.lore || (typeof itemRef === 'object' && itemRef.lore) || def.lore || '',
    ...(def.healAmount ? { healAmount: def.healAmount } : {}),
    ...overrides,
  };
}

/**
 * Genera el identificador canónico único de un cofre a partir de su mazmorra e ID numérico.
 * @param {string} levelId
 * @param {number|string} chestId
 * @returns {string} Ejemplo: 'dungeon_classic_chest_1'
 */
export function getChestCanonicalId(levelId, chestId) {
  const num = Number(chestId ?? 1);
  return `${levelId}_chest_${num}`;
}

/**
 * Genera el identificador compacto de un cofre.
 * @param {string} levelId
 * @param {number|string} chestId
 * @returns {string} Ejemplo: 'dungeon_classic:1'
 */
export function getChestShortId(levelId, chestId) {
  const num = Number(chestId ?? 1);
  return `${levelId}:${num}`;
}

/**
 * Lista todos los ítems de la biblioteca pertenecientes a un tipo determinado.
 * @param {'key'|'relic'|'potion'} type
 * @returns {Array<Object>}
 */
export function getItemsByType(type) {
  return Object.values(ITEM_LIBRARY).filter(item => item.type === type);
}
