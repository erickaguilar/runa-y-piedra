// src/heroes/heroPortraits.js
// Fachada del arte Sumi-e de heroes: reune el registro de retratos (registry),
// las factorias de textura/material por region y el arte por heroe.
// La implementacion vive en src/heroes/portraits/ (Fase 6).

export { HERO_PORTRAITS } from './portraits/registry.js';
export * from './portraits/texturesHead.js';
export * from './portraits/texturesTorso.js';
export * from './portraits/texturesArm.js';
export * from './portraits/texturesLeg.js';
export * from './portraits/guardian.js';
export * from './portraits/wizard.js';
export * from './portraits/ranger.js';
export * from './portraits/paladin.js';
export * from './portraits/adventurer.js';

import { disposeHeadPortraitTextures } from './portraits/texturesHead.js';
import { disposeTorsoPortraitTextures } from './portraits/texturesTorso.js';
import { disposeArmPortraitTextures } from './portraits/texturesArm.js';
import { disposeLegPortraitTextures } from './portraits/texturesLeg.js';

/**
 * Libera todas las texturas y materiales cacheados de los retratos de heroes.
 */
export function disposeHeroPortraitsCache() {
  disposeHeadPortraitTextures();
  disposeTorsoPortraitTextures();
  disposeArmPortraitTextures();
  disposeLegPortraitTextures();
}
