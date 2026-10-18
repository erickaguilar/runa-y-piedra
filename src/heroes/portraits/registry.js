// src/heroes/portraits/registry.js
// Registro canonico de retratos Sumi-e por heroe (ensambla las definiciones de cada modulo).
import { guardianPortrait } from './guardian.js';
import { wizardPortrait } from './wizard.js';
import { rangerPortrait } from './ranger.js';
import { paladinPortrait } from './paladin.js';
import { adventurerPortrait } from './adventurer.js';

export const HERO_PORTRAITS = {
  guardian: guardianPortrait,
  wizard: wizardPortrait,
  ranger: rangerPortrait,
  paladin: paladinPortrait,
  adventurer: adventurerPortrait,
};
