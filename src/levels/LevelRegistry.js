import lobbyTutorial from './data/lobby_tutorial.json';
import dungeonClassic from './data/dungeon_classic.json';
import cryptInferno from './data/crypt_inferno.json';
import abyssThrone from './data/abyss_throne.json';

export class LevelRegistry {
  constructor() {
    this.levels = new Map();
    // El lobby es el nivel 0: hub de práctica y destino del Game Over
    this.registerLevel(lobbyTutorial);
    this.registerLevel(dungeonClassic);
    this.registerLevel(cryptInferno);
    this.registerLevel(abyssThrone);
    this.currentLevelId = lobbyTutorial.id;
  }

  registerLevel(levelData) {
    if (!levelData || !levelData.id) return;
    this.levels.set(levelData.id, levelData);
  }

  getLevel(id) {
    return this.levels.get(id) || this.levels.get('dungeon_classic');
  }

  getAllLevels() {
    return Array.from(this.levels.values());
  }

  getCurrentLevel() {
    return this.getLevel(this.currentLevelId);
  }

  setCurrentLevel(id) {
    if (this.levels.has(id)) {
      this.currentLevelId = id;
      return true;
    }
    return false;
  }
}
