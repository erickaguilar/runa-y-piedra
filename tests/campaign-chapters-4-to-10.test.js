import test from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { CHAPTER_CATALOG, ChapterRegistry } from '../src/levels/ChapterRegistry.js';
import { BLOCK_TYPES } from '../src/config/constants.js';
import { THEMES, createPedestalMaterials } from '../src/render/models/props/pedestalModel.js';
import { createStairsMaterials } from '../src/render/models/props/stairsModel.js';

test('Campaña completa (Capítulos 1 al 10): ningún capítulo ni mazmorra está bajo construcción', () => {
  const chapterRegistry = new ChapterRegistry();
  chapterRegistry.resetProgress();
  const chapters = chapterRegistry.getAllChapters();
  assert.equal(chapters.length, 10, 'El catálogo debe contener exactamente 10 capítulos');

  for (const ch of chapters) {
    assert.equal(
      Boolean(ch.underConstruction),
      false,
      `El capítulo ${ch.id} (${ch.name}) debe estar activo y jugable`
    );
    assert.equal(
      chapterRegistry.isChapterPlayable(ch.number),
      true,
      `isChapterPlayable(${ch.number}) debe devolver true al desbloquearse en cadena`
    );
    assert.equal(ch.dungeons.length, 3, `El capítulo ${ch.id} debe tener 3 mazmorras`);

    for (const d of ch.dungeons) {
      assert.equal(
        Boolean(d.underConstruction),
        false,
        `La mazmorra ${d.id} del capítulo ${ch.id} debe estar activa`
      );
      assert.equal(
        chapterRegistry.getChapterForLevel(d.id)?.id,
        ch.id,
        `getChapterForLevel('${d.id}') debe apuntar a ${ch.id}`
      );
    }

    // Completar capítulo actual para desbloquear el siguiente
    chapterRegistry.completeChapter(ch.number, { timeSec: 90, deaths: 0, stars: 3 });
  }
  chapterRegistry.resetProgress();
});

test('Capítulos 4 al 10: las 21 nuevas mazmorras se cargan en World con geometría, puertas, cofres, altares y escalinatas válidas', () => {
  const world = new World();
  const chapters4To10 = CHAPTER_CATALOG.filter((ch) => ch.number >= 4 && ch.number <= 10);
  assert.equal(chapters4To10.length, 7);

  for (const ch of chapters4To10) {
    // Verificar soporte visual de temas en pedestalModel y stairsModel
    assert.ok(THEMES[ch.theme], `El tema '${ch.theme}' debe existir en pedestalModel.THEMES`);
    const pedMats = createPedestalMaterials(ch.theme);
    assert.equal(pedMats.theme, ch.theme);
    const stairMats = createStairsMaterials(null, ch.theme);
    assert.equal(stairMats.theme, ch.theme);

    ch.dungeons.forEach((dSpec, idx) => {
      const levelData = world.levelRegistry.getLevel(dSpec.id);
      assert.ok(levelData, `La mazmorra '${dSpec.id}' debe estar registrada en LevelRegistry`);
      assert.equal(levelData.id, dSpec.id);

      const loadedWorld = world.loadLevel(levelData);
      assert.equal(loadedWorld, world, `world.loadLevel(levelData) para '${dSpec.id}' debe devolver la instancia de World`);

      // Verificar losa de respawn rúnica despejada en la entrada
      const sx = Math.floor(world.spawnPoint.x);
      const sz = Math.floor(world.spawnPoint.z);
      assert.equal(
        world.get(sx, 0, sz),
        BLOCK_TYPES.RESPAWN_PAD,
        `${dSpec.id}: el suelo en el spawn (${sx}, 0, ${sz}) debe ser RESPAWN_PAD`
      );
      assert.equal(
        world.get(sx, 1, sz),
        BLOCK_TYPES.AIR,
        `${dSpec.id}: el espacio del jugador en (${sx}, 1, ${sz}) debe estar libre (AIR)`
      );
      assert.equal(
        world.get(sx, 2, sz),
        BLOCK_TYPES.AIR,
        `${dSpec.id}: la cabeza del jugador en (${sx}, 2, ${sz}) debe estar libre (AIR)`
      );

      // Verificar 3 checkpoints (sala_1, sala_2, sala_3)
      assert.equal(world.checkpoints.length, 3, `${dSpec.id} debe tener 3 checkpoints`);

      // Verificar puertas cerradas inicialmente
      assert.ok(world.doors.length >= 2, `${dSpec.id} debe tener al menos 2 puertas`);
      for (const door of world.doors) {
        assert.equal(door.isOpen, false, `${dSpec.id}: puerta ${door.id} debe iniciar cerrada`);
        for (const c of door.coords) {
          assert.equal(
            world.get(c.x, c.y, c.z),
            BLOCK_TYPES.DOOR,
            `${dSpec.id}: bloque de puerta (${c.x},${c.y},${c.z}) debe ser DOOR`
          );
        }
      }

      // Verificar llaves, losas de presión, cofres y objetivo pedestal
      assert.ok((levelData.keys || []).length >= 1, `${dSpec.id} debe definir al menos 1 llave`);
      assert.ok(world.pressurePlates.length >= 1, `${dSpec.id} debe definir al menos 1 losa de presión`);
      assert.ok(world.chests.length >= 2, `${dSpec.id} debe definir al menos 2 cofres`);
      assert.equal(world.objectives.length, 1, `${dSpec.id} debe tener 1 altar objetivo`);
      assert.equal(world.objectives[0].theme, ch.theme, `${dSpec.id} debe usar el tema '${ch.theme}'`);

      // Verificar contrato de escalinata: intro y challenge tienen escalinata sellada; climax tiene stairs: null
      const isLast = idx === ch.dungeons.length - 1;
      if (isLast) {
        assert.equal(dSpec.role, 'climax');
        assert.equal(levelData.stairs, null, `${dSpec.id} (climax) debe tener stairs: null`);
        assert.equal(world.stairwells.length, 0, `${dSpec.id} (climax) no debe generar stairwells`);
      } else {
        assert.ok(levelData.stairs, `${dSpec.id} (${dSpec.role}) debe definir stairs`);
        assert.equal(world.stairwells.length, 1, `${dSpec.id} (${dSpec.role}) debe tener 1 stairwell`);
        assert.equal(world.stairwells[0].open, false, `${dSpec.id} debe iniciar con la escalinata cerrada`);
      }
    });
  }
});
