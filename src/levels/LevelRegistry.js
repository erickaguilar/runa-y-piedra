import lobbyTutorial from './data/lobby_tutorial.json' with { type: 'json' };
import dungeonClassic from './data/dungeon_classic.json' with { type: 'json' };
import cryptInferno from './data/crypt_inferno.json' with { type: 'json' };
import abyssThrone from './data/abyss_throne.json' with { type: 'json' };
import devShowroom from './data/dev_showroom.json' with { type: 'json' };

export class LevelRegistry {
  constructor() {
    this.levels = new Map();
    // El lobby es el nivel 0: hub de práctica y destino del Game Over
    this.registerLevel(lobbyTutorial);
    this.registerLevel(dungeonClassic);
    this.registerLevel(cryptInferno);
    this.registerLevel(abyssThrone);
    // Nivel Showroom de pruebas exclusivo de herramientas dev
    this.registerLevel(devShowroom);
    this.currentLevelId = lobbyTutorial.id;
  }

  registerLevel(levelData) {
    if (!levelData || !levelData.id) return;
    this.levels.set(levelData.id, levelData);
  }

  getLevel(id) {
    return this.levels.get(id) || this.levels.get('dungeon_classic');
  }

  /**
   * Devuelve los niveles de la campaña regular. Los niveles marcados con isDevOnly
   * o hiddenFromCampaign solo son accesibles explícitamente desde el modal de Dev.
   */
  getAllLevels(includeDev = false) {
    const list = Array.from(this.levels.values());
    if (includeDev) return list;
    return list.filter(l => !l.isDevOnly && !l.hiddenFromCampaign);
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
