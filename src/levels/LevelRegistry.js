import lobbyTutorial from './data/lobby_tutorial.json' with { type: 'json' };
import dungeonClassic from './data/dungeon_classic.json' with { type: 'json' };
import cryptInferno from './data/crypt_inferno.json' with { type: 'json' };
import abyssThrone from './data/abyss_throne.json' with { type: 'json' };
import shadowVault from './data/shadow_vault.json' with { type: 'json' };
import shadowChasm from './data/shadow_chasm.json' with { type: 'json' };
import shadowSanctum from './data/shadow_sanctum.json' with { type: 'json' };
import fallsAqueduct from './data/falls_aqueduct.json' with { type: 'json' };
import fallsTorrent from './data/falls_torrent.json' with { type: 'json' };
import fallsReservoir from './data/falls_reservoir.json' with { type: 'json' };
import forgeHall from './data/forge_hall.json' with { type: 'json' };
import forgeSlag from './data/forge_slag.json' with { type: 'json' };
import forgeCrucible from './data/forge_crucible.json' with { type: 'json' };
import frostCavern from './data/frost_cavern.json' with { type: 'json' };
import frostGlacier from './data/frost_glacier.json' with { type: 'json' };
import frostSpire from './data/frost_spire.json' with { type: 'json' };
import poisonMoss from './data/poison_moss.json' with { type: 'json' };
import poisonCanal from './data/poison_canal.json' with { type: 'json' };
import poisonNecropolis from './data/poison_necropolis.json' with { type: 'json' };
import arcaneVestibule from './data/arcane_vestibule.json' with { type: 'json' };
import arcaneNexus from './data/arcane_nexus.json' with { type: 'json' };
import arcaneSanctuary from './data/arcane_sanctuary.json' with { type: 'json' };
import minesShaft from './data/mines_shaft.json' with { type: 'json' };
import minesAbyss from './data/mines_abyss.json' with { type: 'json' };
import minesHeart from './data/mines_heart.json' with { type: 'json' };
import voidIsles from './data/void_isles.json' with { type: 'json' };
import voidBridge from './data/void_bridge.json' with { type: 'json' };
import voidCitadel from './data/void_citadel.json' with { type: 'json' };
import titanGate from './data/titan_gate.json' with { type: 'json' };
import titanChamber from './data/titan_chamber.json' with { type: 'json' };
import titanHeart from './data/titan_heart.json' with { type: 'json' };
import devShowroom from './data/dev_showroom.json' with { type: 'json' };
import devCombatroom from './data/dev_combatroom.json' with { type: 'json' };


export class LevelRegistry {
  constructor() {
    this.levels = new Map();
    // El lobby es el nivel 0: hub de práctica y destino del Game Over
    this.registerLevel(lobbyTutorial);
    // Capítulo 1: El Descenso Ancestral
    this.registerLevel(dungeonClassic);
    this.registerLevel(cryptInferno);
    this.registerLevel(abyssThrone);
    // Capítulo 2: Cripta de las Sombras
    this.registerLevel(shadowVault);
    this.registerLevel(shadowChasm);
    this.registerLevel(shadowSanctum);
    // Capítulo 3: Cataratas Subterráneas
    this.registerLevel(fallsAqueduct);
    this.registerLevel(fallsTorrent);
    this.registerLevel(fallsReservoir);
    // Capítulo 4: La Gran Forja Enana
    this.registerLevel(forgeHall);
    this.registerLevel(forgeSlag);
    this.registerLevel(forgeCrucible);
    // Capítulo 5: Cuevas de Escarcha y Hielo
    this.registerLevel(frostCavern);
    this.registerLevel(frostGlacier);
    this.registerLevel(frostSpire);
    // Capítulo 6: Catacumbas del Moho Venenoso
    this.registerLevel(poisonMoss);
    this.registerLevel(poisonCanal);
    this.registerLevel(poisonNecropolis);
    // Capítulo 7: Templo Arcano Olvidado
    this.registerLevel(arcaneVestibule);
    this.registerLevel(arcaneNexus);
    this.registerLevel(arcaneSanctuary);
    // Capítulo 8: Minas Profundas de Carbón
    this.registerLevel(minesShaft);
    this.registerLevel(minesAbyss);
    this.registerLevel(minesHeart);
    // Capítulo 9: Prisión Flotante del Vacío
    this.registerLevel(voidIsles);
    this.registerLevel(voidBridge);
    this.registerLevel(voidCitadel);
    // Capítulo 10: El Núcleo del Titán Rúnico
    this.registerLevel(titanGate);
    this.registerLevel(titanChamber);
    this.registerLevel(titanHeart);
    // Nivel Showroom de pruebas exclusivo de herramientas dev
    this.registerLevel(devShowroom);
    // Nivel CombatRoom de pruebas exclusivo de herramientas dev
    this.registerLevel(devCombatroom);
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
