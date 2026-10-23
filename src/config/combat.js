/**
 * combat.js - Configuración canónica de combate y armamento para héroes y blancos de entrenamiento.
 *
 * Define las estadísticas balanceadas de armas para los 5 héroes, tipos de ataque
 * (cuerpo a cuerpo, barrido, onda radial y proyectiles balísticos/mágicos),
 * maniquíes de prueba en Sector 2 y funciones utilitarias de daño y cálculo de DPS.
 */

export const WEAPON_TYPES = {
  MELEE_LIGHT: 'melee_light',
  MELEE_HEAVY: 'melee_heavy',
  PROJECTILE_ARROW: 'projectile_arrow',
  PROJECTILE_MAGIC: 'projectile_magic',
  MELEE_WAVE: 'melee_wave',
};

export const HERO_WEAPONS = [
  {
    heroIndex: 0,
    heroId: 'adventurer',
    id: 'adventurer_sword',
    name: 'Espada de Explorador',
    type: WEAPON_TYPES.MELEE_LIGHT,
    category: 'melee',
    range: 1.8,
    arcDeg: 60,
    arcRad: (60 * Math.PI) / 180,
    minDot: Math.cos((30 * Math.PI) / 180), // cos(30°) ≈ 0.866
    cooldownMs: 350,
    damage: 1,
    knockback: 0.8,
    speed: 0,
    aoeRadius: 0,
    stunMs: 0,
    color: '#38bdf8',
    hex: 0x38bdf8,
    soundCue: 'slash',
    description: 'Espada ligera de hierro templado. Golpe rápido en arco frontal estrecho (60°).',
  },
  {
    heroIndex: 1,
    heroId: 'paladin',
    id: 'paladin_greatsword',
    name: 'Mandoble de la Luz',
    type: WEAPON_TYPES.MELEE_HEAVY,
    category: 'melee',
    range: 2.2,
    arcDeg: 180,
    arcRad: Math.PI,
    minDot: 0, // cos(90°) = 0 (cualquier blanco al frente)
    cooldownMs: 650,
    damage: 2,
    knockback: 2.5,
    speed: 0,
    aoeRadius: 0,
    stunMs: 0,
    color: '#f43f5e',
    hex: 0xf43f5e,
    soundCue: 'heavy_slash',
    description: 'Mandoble ceremonial a dos manos. Barrido horizontal de 180° con alto retroceso (2.5 m).',
  },
  {
    heroIndex: 2,
    heroId: 'ranger',
    id: 'ranger_bow',
    name: 'Arco Rúnico del Viento',
    type: WEAPON_TYPES.PROJECTILE_ARROW,
    category: 'projectile',
    range: 16.0,
    arcDeg: 0,
    arcRad: 0,
    minDot: 1,
    cooldownMs: 400,
    damage: 1,
    knockback: 0.5,
    speed: 22.0,
    aoeRadius: 0,
    stunMs: 0,
    color: '#10b981',
    hex: 0x10b981,
    soundCue: 'arrow_shoot',
    description: 'Disparo de flecha rúnica veloz (22 m/s) en trayectoria recta hacia el cursor.',
  },
  {
    heroIndex: 3,
    heroId: 'wizard',
    id: 'wizard_staff',
    name: 'Báculo de Rayo Arcano',
    type: WEAPON_TYPES.PROJECTILE_MAGIC,
    category: 'projectile',
    range: 12.0,
    arcDeg: 0,
    arcRad: 0,
    minDot: 1,
    cooldownMs: 550,
    damage: 2,
    knockback: 1.0,
    speed: 14.0,
    aoeRadius: 1.2,
    stunMs: 0,
    color: '#a855f7',
    hex: 0xa855f7,
    soundCue: 'magic_blast',
    description: 'Orbe arcano esférico de plasma que explota en radio de 1.2 m causando daño en área.',
  },
  {
    heroIndex: 4,
    heroId: 'guardian',
    id: 'guardian_hammer',
    name: 'Mazo Sísmico Basalto',
    type: WEAPON_TYPES.MELEE_WAVE,
    category: 'melee',
    range: 2.0,
    arcDeg: 360,
    arcRad: 2 * Math.PI,
    minDot: -1, // cos(180°) = -1 (impacta en todas direcciones)
    cooldownMs: 750,
    damage: 2,
    knockback: 1.2,
    speed: 0,
    aoeRadius: 0,
    stunMs: 800,
    color: '#fbbf24',
    hex: 0xfbbf24,
    soundCue: 'hammer_slam',
    description: 'Impacto sísmico frontal radial (360°) que aturde a los enemigos durante 800 ms.',
  },
];

/**
 * Obtiene el arma canónica asociada a un héroe por su índice numérico o id de clase.
 * @param {number|string} heroIdentifier
 * @returns {typeof HERO_WEAPONS[0]}
 */
export function getHeroWeapon(heroIdentifier) {
  if (typeof heroIdentifier === 'number') {
    return HERO_WEAPONS[heroIdentifier] || HERO_WEAPONS[0];
  }
  if (typeof heroIdentifier === 'string') {
    const found = HERO_WEAPONS.find(w => w.heroId === heroIdentifier || w.id === heroIdentifier);
    return found || HERO_WEAPONS[0];
  }
  return HERO_WEAPONS[0];
}

/**
 * Catálogo canónico de blancos de entrenamiento en el Sector 2 de dev_combatroom.
 */
export const TRAINING_DUMMIES = [
  {
    id: 'dummy_light',
    name: 'Maniquí de Paja',
    category: 'training',
    type: 'light',
    x: 7.5,
    y: 1.0,
    z: 15.0,
    width: 0.8,
    height: 1.8,
    depth: 0.8,
    defense: 0,
    weakness: null,
    color: '#f59e0b',
    soundType: 'wood',
    description: 'Blanco ligero de paja para pruebas de cadencia básica y golpes veloces.',
  },
  {
    id: 'dummy_heavy',
    name: 'Maniquí Acorazado',
    category: 'training',
    type: 'heavy',
    x: 11.5,
    y: 1.0,
    z: 15.0,
    width: 0.8,
    height: 1.8,
    depth: 0.8,
    defense: 1,
    weakness: null,
    color: '#94a3b8',
    soundType: 'iron',
    description: 'Blanco acorazado con 1 punto de defensa (reduce daño directo; mínimo 1).',
  },
  {
    id: 'dummy_elemental',
    name: 'Maniquí Rúnico',
    category: 'training',
    type: 'elemental',
    x: 15.5,
    y: 1.0,
    z: 15.0,
    width: 0.8,
    height: 1.8,
    depth: 0.8,
    defense: 0,
    weakness: 'magic',
    color: '#c084fc',
    soundType: 'magic',
    description: 'Blanco rúnico con vulnerabilidad a magia arcana (+1 daño ante ataques mágicos).',
  },
];

/**
 * Calcula el daño efectivo recibido por un objetivo según su armadura y vulnerabilidades.
 * @param {number} baseDamage Daño base del arma
 * @param {number} targetDefense Puntos de defensa del objetivo
 * @param {string} targetWeakness Vulnerabilidad elemental ('magic', etc.)
 * @param {string} weaponType Tipo de arma atacante
 * @returns {number} Daño final infligido (mínimo 1)
 */
export function calculateDamage(baseDamage, targetDefense = 0, targetWeakness = null, weaponType = '') {
  let dmg = baseDamage;
  if (targetWeakness === 'magic' && weaponType === WEAPON_TYPES.PROJECTILE_MAGIC) {
    dmg += 1;
  }
  const effective = Math.max(1, dmg - targetDefense);
  return effective;
}

/**
 * Calcula el DPS en una ventana móvil de tiempo (por defecto 3 segundos).
 * @param {Array<{ damage: number, timestamp: number }>} recentHits
 * @param {number} nowMs Timestamp actual en ms
 * @param {number} windowMs Duración de la ventana en ms
 * @returns {number} DPS redondeado a un decimal
 */
export function calculateDps(recentHits, nowMs, windowMs = 3000) {
  if (!recentHits || recentHits.length === 0) return 0.0;
  const cutoff = nowMs - windowMs;
  let totalDmg = 0;
  let firstHitTime = nowMs;

  for (let i = recentHits.length - 1; i >= 0; i--) {
    const h = recentHits[i];
    if (h.timestamp >= cutoff) {
      totalDmg += h.damage;
      if (h.timestamp < firstHitTime) firstHitTime = h.timestamp;
    }
  }

  if (totalDmg === 0) return 0.0;
  const elapsedSec = Math.max(0.5, (nowMs - firstHitTime) / 1000);
  return Math.round((totalDmg / elapsedSec) * 10) / 10;
}

/**
 * Catálogo canónico de enemigos PvE para mazmorras y sala de combate dev.
 */
export const CANONICAL_ENEMIES = {
  cave_serpent: {
    id: 'cave_serpent',
    name: 'Serpiente de Ceniza',
    tier: 1,
    difficulty: 'Dificultad 0 (Iniciación)',
    role: 'Alimaña rastrera muy débil (1 HP, medio corazón de daño)',
    maxHp: 1,
    speed: 2.2,
    damage: 0.5,
    attackRange: 1.2,
    aggroRange: 16.0,
    attackCooldownMs: 1200,
    telegraphMs: 350,
    knockbackFactor: 1.5,
    respawnDelayMs: 3500,
    color: '#059669',
    eyeColor: '#ef4444',
    soundType: 'slither',
    width: 0.6,
    height: 0.4,
    depth: 1.0,
  },
  basalt_skitterer: {
    id: 'basalt_skitterer',
    name: 'Esqueleto de Basalto',
    tier: 1,
    difficulty: 'Dificultad 1',
    role: 'Tropa básica de hostigamiento cuerpo a cuerpo',
    maxHp: 3,
    speed: 1.8,
    damage: 1,
    attackRange: 1.4,
    aggroRange: 8.5,
    attackCooldownMs: 1400,
    telegraphMs: 400,
    knockbackFactor: 1.0,
    respawnDelayMs: 4000,
    color: '#334155',
    eyeColor: '#fbbf24',
    soundType: 'stone',
    width: 0.8,
    height: 1.8,
    depth: 0.8,
  },
};

