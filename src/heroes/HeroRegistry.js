/**
 * HeroRegistry.js - Character Management & Trait Provider
 * 
 * Central registry that loads character definitions from heroes.json,
 * providing easy access to heroes by ID or color index, along with
 * their custom icons, attributes, and gameplay multipliers.
 */

import heroesData from './data/heroes.json' with { type: 'json' };

export class HeroRegistry {
  constructor() {
    this.heroes = heroesData.heroes;
    this.heroesById = new Map();
    this.heroesByIndex = new Map();

    this.heroes.forEach(hero => {
      this.heroesById.set(hero.id, hero);
      this.heroesByIndex.set(hero.index, hero);
    });
  }

  getAllHeroes() {
    return this.heroes;
  }

  getHeroByIndex(index = 0) {
    const idx = parseInt(index, 10);
    return this.heroesByIndex.get(idx) || this.heroes[0];
  }

  getHeroById(id) {
    return this.heroesById.get(id) || this.heroes[0];
  }

  getHero(idOrIndex = 0) {
    if (typeof idOrIndex === 'number' || !isNaN(parseInt(idOrIndex, 10))) {
      return this.getHeroByIndex(parseInt(idOrIndex, 10));
    }
    return this.getHeroById(idOrIndex);
  }
}

export const heroRegistry = new HeroRegistry();
