/**
 * StairCeremonyController.js - Controlador especializado en fosa de escalinata,
 * tallado de vóxeles determinista y ceremonias de transición de portal.
 * Desacoplado de InteractionController para mantener el SRP.
 */

import { BLOCK_TYPES, WORLD_CONFIG } from '../config/constants.js';
import { floorVariant } from '../levels/LevelLoader.js';
import * as Proto from '../network/Protocol.js';

export class StairCeremonyController {
  /**
   * @param {import('./InteractionController.js').InteractionController} controller
   */
  constructor(controller) {
    this.controller = controller;
  }

  get game() {
    return this.controller.game;
  }

  get transitioning() {
    return this.controller.transitioning;
  }

  set transitioning(val) {
    this.controller.transitioning = val;
  }

  /** Rectángulo de fosa de la escalinata del nivel actual (o null). */
  stairPitRect() {
    return this.game.world.stairwells?.[0] || null;
  }

  /**
   * Apertura de la losa sellada (solo Host): valida cercanía y la abre para todos.
   * La fosa con escalinata hasta el fondo queda transitable y activa el descenso.
   */
  requestStairsOpen(player = null) {
    const game = this.game;
    if (game.mode !== 'host' || this.transitioning || game.world.stairsOpen) return false;
    const w = game.world.stairwells?.[0];
    if (!w) return false;
    if (player) {
      const qx = Math.min(Math.max(player.pos.x, w.x1), w.x2 + 1);
      const qz = Math.min(Math.max(player.pos.z, w.z1), w.z2 + 1);
      const dist = Math.hypot(player.pos.x - qx, player.pos.z - qz);
      if (dist > 3.2) {
        console.warn(`[AntiCheat] Apertura de losa rechazada: ${player.name} fuera de rango (${dist.toFixed(2)}m)`);
        return false;
      }
    }
    game.network.broadcast(Proto.serializeStairsOpen());
    this.openStairsCeremony();
    return true;
  }

  /** Ceremonia local de apertura: fosa real, losa animada, sonido y mensaje (movimiento fluido sin congelar al jugador). */
  openStairsCeremony() {
    if (this.game.world.stairsOpen) return;
    const rect = this.stairPitRect();
    if (rect) {
      this.applyStairPit(rect);
      this.tintStairPit(rect);
      this.game.world.stairsOpen = true;
      for (const w of this.game.world.stairwells) w.open = true;
    }
    this.game.stairsRenderer.open();
    this.game.soundManager.playSlabGrind();

    const curLevelId = this.game.world.levelRegistry.getCurrentLevel()?.id;
    if ((curLevelId === 'lobby_tutorial' || curLevelId === 'lobby') && this.game.chapterRegistry) {
      const targetChapter = this.game.chapterRegistry.getHighestUnlockedPlayableChapter?.();
      if (targetChapter) {
        this.game.ui.showNarrativeMessage(`:stone: ¡La losa cede! Desciende al Capítulo ${targetChapter.number}: ${targetChapter.name}. ¡Bajad!`, 4500);
        return;
      }
    }
    this.game.ui.showNarrativeMessage(':stone: ¡La losa cede! Una escalinata desciende a la oscuridad. ¡Bajad!', 4500);
  }

  /** Oscurece el pozo (serpentina en degradado + fondo y muros casi negros o azul pizarra abisal). */
  tintStairPit(rect) {
    if (!rect) return;
    const game = this.game;
    const BOTTOM = WORLD_CONFIG.MIN_Y ?? -8;
    const isAbyss = (game.pedestalTheme ? game.pedestalTheme() : 'classic') === 'abyss';
    const shade = (y) => {
      const f = Math.min(1, Math.max(0, (-1 - y) / (-1 - BOTTOM)));
      if (isAbyss) {
        const r = Math.round(50 - f * (50 - 10));
        const g = Math.round(45 - f * (45 - 8));
        const b = Math.round(85 - f * (85 - 18));
        return (r << 16) | (g << 8) | b;
      }
      const v = Math.round(74 - f * (74 - 11));
      return (v << 16) | (v << 8) | v;
    };
    const PATH = [
      [0, 0, -1], [1, 0, -2], [1, 1, -3],
      [0, 1, -4], [0, 2, -5], [1, 2, -6],
    ];
    for (const [dx, dz, y] of PATH) {
      game.voxelMap.setTint(rect.x1 + dx, y, rect.z1 + dz, shade(y));
    }
    for (let x = rect.x1 - 1; x <= rect.x2 + 1; x++) {
      for (let z = rect.z1 - 1; z <= rect.z2 + 1; z++) {
        for (let y = BOTTOM; y <= -1; y++) {
          if (game.world.get(x, y, z) === BLOCK_TYPES.WALL) {
            game.voxelMap.setTint(x, y, z, isAbyss ? 0x0f1422 : 0x141414);
          }
        }
      }
    }
  }

  /**
   * Abre la fosa real en el mundo: retira el suelo del rectángulo 2x3 y talla una
   * serpentina descendente con colisión (un peldaño de 1 m por celda, 6 peldaños
   * hasta cima -5.0), con macizo, altura libre y pozo revestido de muros.
   * Determinista: host y clientes aplican lo mismo.
   */
  applyStairPit(rect) {
    if (!rect) return;
    const game = this.game;
    const BOTTOM = WORLD_CONFIG.MIN_Y ?? -8;
    // Recorrido en serpentina dentro del hueco 2x3 (dx,dz relativos + bloque y)
    const PATH = [
      { dx: 0, dz: 0, y: -1 },
      { dx: 1, dz: 0, y: -2 },
      { dx: 1, dz: 1, y: -3 },
      { dx: 0, dz: 1, y: -4 },
      { dx: 0, dz: 2, y: -5 },
      { dx: 1, dz: 2, y: -6 },
    ];
    const setCell = (x, y, z, type) => {
      game.world.set(x, y, z, type);
      game.voxelMap.removeBlock(x, y, z);
      if (type !== BLOCK_TYPES.AIR) game.voxelMap.addBlock(x, y, z, type);
    };
    // 1. Retirar suelo y=0 del rectángulo
    for (let x = rect.x1; x <= rect.x2; x++) {
      for (let z = rect.z1; z <= rect.z2; z++) {
        setCell(x, 0, z, BLOCK_TYPES.AIR);
      }
    }
    // 2. Macizar el hueco hasta el fondo
    for (let x = rect.x1; x <= rect.x2; x++) {
      for (let z = rect.z1; z <= rect.z2; z++) {
        for (let y = BOTTOM; y <= -1; y++) setCell(x, y, z, BLOCK_TYPES.WALL);
      }
    }
    // 3. Revestir el pozo con muros (anillo expandido, hasta el fondo, solo aire)
    for (let x = rect.x1 - 1; x <= rect.x2 + 1; x++) {
      for (let z = rect.z1 - 1; z <= rect.z2 + 1; z++) {
        const inside = x >= rect.x1 && x <= rect.x2 && z >= rect.z1 && z <= rect.z2;
        if (inside) continue;
        for (let y = BOTTOM; y <= -1; y++) {
          if (game.world.get(x, y, z) === BLOCK_TYPES.AIR) {
            setCell(x, y, z, BLOCK_TYPES.WALL);
          }
        }
      }
    }
    // 4. Tallar peldaños + altura libre (2 m sobre cada peldaño)
    for (const s of PATH) {
      const x = rect.x1 + s.dx;
      const z = rect.z1 + s.dz;
      setCell(x, s.y, z, floorVariant(x, z));
      for (let y = s.y + 1; y <= -1; y++) setCell(x, y, z, BLOCK_TYPES.AIR);
    }
  }

  /** Ceremonia local del portal: altar y (si no es el final) apertura de la escalinata. */
  startPortalCeremony({ isLast = false, nextLevelId = '', _nextName = '' } = {}) {
    const game = this.game;
    if (this.transitioning) return;
    this.transitioning = true;
    game.pedestalRenderer.activate();
    game.soundManager.playPedestal();

    if (isLast) {
      const curLevelId = game.world?.levelRegistry?.getCurrentLevel()?.id;
      const curChapter = game.chapterRegistry?.getChapterForLevel(curLevelId)
        || game.chapterRegistry?.getCurrentChapter();

      let unlockMsg = '';
      let nextPlayableChapter = null;
      let nextFirstDungeon = null;

      if (curChapter && game.chapterRegistry) {
        if (game.mode !== 'client') {
          const result = game.chapterRegistry.completeChapter(curChapter.id);
          if (result?.nextChapter) {
            unlockMsg = ` :star: ¡Capítulo ${result.nextChapter.number} desbloqueado: ${result.nextChapter.name}!`;
            if (game.chapterRegistry.isChapterPlayable(result.nextChapter.id)) {
              nextPlayableChapter = result.nextChapter;
              const dungeons = game.chapterRegistry.getDungeonsForChapter(result.nextChapter.id);
              if (dungeons?.[0]) {
                nextFirstDungeon = game.world.levelRegistry.getLevel(dungeons[0].id);
              }
            }
          }
        } else {
          const nextNum = (curChapter.number || 1) + 1;
          const candidate = game.chapterRegistry.getChapter(nextNum);
          if (candidate && game.chapterRegistry.isChapterPlayable(candidate.id)) {
            nextPlayableChapter = candidate;
            unlockMsg = ` :star: ¡Capítulo ${candidate.number} desbloqueado: ${candidate.name}!`;
            const dungeons = game.chapterRegistry.getDungeonsForChapter(candidate.id);
            if (dungeons?.[0]) {
              nextFirstDungeon = game.world.levelRegistry.getLevel(dungeons[0].id);
            }
          }
        }
      }

      if (!nextFirstDungeon && nextLevelId && game.world?.levelRegistry) {
        nextFirstDungeon = game.world.levelRegistry.getLevel(nextLevelId);
      }

      if (curLevelId && curLevelId !== 'lobby_tutorial' && curLevelId !== 'dev_showroom') {
        game.saveDungeonCompletion?.(curLevelId, true);
      }

      const title = curChapter ? `:trophy: ¡${curChapter.name} Conquistado!` : ':trophy: ¡Mazmorras Conquistadas!';
      const subtitle = (nextPlayableChapter && nextFirstDungeon)
        ? `Habéis consagrado el altar supremo.${unlockMsg} Avanzando al siguiente capítulo...`
        : `Habéis bendecido todos los altares.${unlockMsg} Regresando al Campamento...`;

      const buttonText = (nextPlayableChapter && nextFirstDungeon)
        ? `Avanzar al Capítulo ${nextPlayableChapter.number}: ${nextPlayableChapter.name}`
        : 'Continuar Explorando';

      game.ui.showLevelTransition(
        title,
        subtitle,
        {
          victory: true,
          autoHideMs: 12000,
          buttonText,
          onClose: () => {
            this.transitioning = false;
            if (game.mode === 'host') {
              if (nextPlayableChapter && nextFirstDungeon) {
                game.chapterRegistry?.setCurrentChapter(nextPlayableChapter.id);
                if (game.network && (game.network.connections?.length > 0 || game.network.isHost)) {
                  game.network.broadcast(Proto.serializeChapterSelect(nextPlayableChapter.id, nextFirstDungeon.id));
                }
                game.switchLevel(nextFirstDungeon.id, true);
              } else {
                game.switchLevel('lobby_tutorial', true);
              }
            }
          },
          onReturnToLobby: nextPlayableChapter ? () => {
            this.transitioning = false;
            if (game.mode === 'host') {
              game.switchLevel('lobby_tutorial', true);
            }
          } : null,
        }
      );
      return;
    }

    // La apertura de la escalinata gestiona su propio flag y temporizador
    this.transitioning = false;
    this.openStairsCeremony();
  }

  /** Estado inicial de la escalinata: abierta desde el inicio o ya abierta en bloques recibidos. */
  ensureStairsState() {
    const game = this.game;
    const rect = this.stairPitRect();
    const theme = game.pedestalTheme ? game.pedestalTheme() : 'classic';
    game.stairsRenderer.loadStairs(rect, theme);
    if (!rect) return;
    const shouldOpen = !!rect.open || this.isPitOpenInBlocks(rect);
    if (shouldOpen) {
      if (!this.isPitOpenInBlocks(rect)) this.applyStairPit(rect);
      this.tintStairPit(rect);
      game.world.stairsOpen = true;
      for (const w of (game.world.stairwells || [])) w.open = true;
      game.stairsRenderer?.setOpenInstant?.();
    }
  }

  /** La fosa está abierta si el suelo y=0 fue retirado en todo el rectángulo. */
  isPitOpenInBlocks(rect) {
    const game = this.game;
    for (let x = rect.x1; x <= rect.x2; x++) {
      for (let z = rect.z1; z <= rect.z2; z++) {
        if (game.world.get(x, 0, z) !== BLOCK_TYPES.AIR) return false;
      }
    }
    return true;
  }
}
