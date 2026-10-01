// src/render/models/heroes/index.js
export * from './baseAvatar.js';
export * from './paladinGear.js';
export * from './rangerGear.js';
export * from './wizardGear.js';
export * from './guardianGear.js';

import { buildPaladinGear } from './paladinGear.js';
import { buildRangerGear } from './rangerGear.js';
import { buildWizardGear } from './wizardGear.js';
import { buildGuardianGear } from './guardianGear.js';

/**
 * Mapeo de constructores de equipamiento por identificador de clase de héroe.
 */
export const GEAR_BUILDERS = {
  paladin: (a, G, add) => buildPaladinGear(a, G, add),
  ranger: (a, G, add) => buildRangerGear(a, G, add),
  wizard: (a, G, add) => buildWizardGear(a, G, add),
  guardian: (a, G, add) => buildGuardianGear(a, G, add),
};
