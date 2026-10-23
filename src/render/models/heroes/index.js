// src/render/models/heroes/index.js
export * from './baseAvatar.js';
export * from './adventurerGear.js';
export * from './paladinGear.js';
export * from './rangerGear.js';
export * from './wizardGear.js';
export * from './guardianGear.js';
export * from './heroWeapons.js';

import { buildAdventurerGear, disposeAdventurerGearCache } from './adventurerGear.js';
import { buildPaladinGear, disposePaladinGearCache } from './paladinGear.js';
import { buildRangerGear, disposeRangerGearCache } from './rangerGear.js';
import { buildWizardGear, disposeWizardGearCache } from './wizardGear.js';
import { buildGuardianGear, disposeGuardianGearCache } from './guardianGear.js';
import { disposeWeaponCache } from './heroWeapons.js';

/**
 * Mapeo de constructores de equipamiento por identificador de clase de héroe.
 */
export const GEAR_BUILDERS = {
  adventurer: (a, G, add) => buildAdventurerGear(a, G, add),
  paladin: (a, G, add) => buildPaladinGear(a, G, add),
  ranger: (a, G, add) => buildRangerGear(a, G, add),
  wizard: (a, G, add) => buildWizardGear(a, G, add),
  guardian: (a, G, add) => buildGuardianGear(a, G, add),
};

/**
 * Libera las cachés singleton de geometrías y materiales de equipamiento de todos los héroes.
 */
export function disposeHeroGearCaches() {
  disposeAdventurerGearCache();
  disposePaladinGearCache();
  disposeRangerGearCache();
  disposeWizardGearCache();
  disposeGuardianGearCache();
  disposeWeaponCache();
}
