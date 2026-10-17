/**
 * InteractionMechanisms.js - Mecanismos activables: placas de presión, pedestal/altar
 * y fosa de escalinata.
 *
 * Composición por mixin sobre `InteractionController.prototype` (ver `InteractionActions.js`).
 * Los métodos asumen el contexto de `InteractionController` (`this.game`, `this.stairCeremony`).
 */
import * as Proto from '../network/Protocol.js';

export const InteractionMechanismsMixin = {
  /**
   * Presiona una losa de presión mecánica:
   * Activa su animación de descenso con resorte, reproduce el clic pétreo y ejecuta la acción (abrir, cerrar o alternar puerta).
   */
  pressPressurePlate(plateId, player = null) {
    const game = this.game;
    const plate = game.world.pressurePlates?.find(p => p.id === plateId);
    if (!plate || plate.isPressed) return false;

    plate.isPressed = true;
    game.pressurePlateRenderer?.press(plate.id);

    const local = game.playerManager?.localPlayer;
    const listener = player?.pos || local?.pos;
    if (game.soundManager?.playPressurePlate) {
      game.soundManager.playPressurePlate({ x: plate.x, y: plate.y, z: plate.z }, listener);
    } else {
      game.soundManager?.playClick?.();
    }

    const doorId = plate.targetDoorId ?? 1;

    // Ejecución de la acción vinculada
    if (plate.action === 'close_door') {
      this.closeDoor(doorId, player || local);
      // Reactivar losas de apertura para esta misma puerta
      for (const other of game.world.pressurePlates || []) {
        if (other !== plate && other.targetDoorId === doorId && other.action === 'open_door') {
          other.isPressed = false;
          game.pressurePlateRenderer?.unpress(other.id);
        }
      }
    } else if (plate.action === 'toggle_door') {
      const isOpen = game.world.isDoorOpenId ? game.world.isDoorOpenId(doorId) : (doorId === 1 ? game.world.isDoor1Open : game.world.isDoor2Open);
      if (isOpen) {
        this.closeDoor(doorId, player || local);
      } else {
        this.openDoor(doorId, player || local);
      }
    } else {
      // Default: 'open_door'
      this.openDoor(doorId, player || local);
      // Reactivar losas de cierre para esta misma puerta
      for (const other of game.world.pressurePlates || []) {
        if (other !== plate && other.targetDoorId === doorId && other.action === 'close_door') {
          other.isPressed = false;
          game.pressurePlateRenderer?.unpress(other.id);
        }
      }
    }

    // Registrar en losas presionadas solo si es permanente (trigger)
    if (plate.mode !== 'hold') {
      const currentLevelId = game.world?.levelRegistry?.getCurrentLevel()?.id || 'dungeon';
      game.openedPlateKeys = game.openedPlateKeys || new Set();
      game.openedPlateKeys.add(`${currentLevelId}_plate_${plate.id}`);
    }

    // Feedback narrativo de activación
    const defaultMsg = plate.mode === 'hold'
      ? `:stone: ¡Click! Has pisado la losa de presencia. ¡El mecanismo permanecerá activo mientras estés encima!`
      : `:stone: ¡Click! Has presionado la losa mecánica. ¡Mecanismo activado!`;
    const msg = plate.message || defaultMsg;
    game.ui?.showNarrativeMessage?.(msg, 5000);

    return true;
  },

  /**
   * Libera una losa de presión de presencia continua (Hold):
   * Revierte la animación con el resorte, reproduce sonido mecánico y desactiva el mecanismo vinculado (ej. cierra la puerta abierta).
   */
  releasePressurePlate(plateId, player = null) {
    const game = this.game;
    const plate = game.world.pressurePlates?.find(p => p.id === plateId);
    if (!plate || !plate.isPressed) return false;

    plate.isPressed = false;
    game.pressurePlateRenderer?.unpress(plate.id);

    const local = game.playerManager?.localPlayer;
    const listener = player?.pos || local?.pos;
    if (game.soundManager?.playPressurePlate) {
      game.soundManager.playPressurePlate({ x: plate.x, y: plate.y, z: plate.z }, listener);
    } else {
      game.soundManager?.playClick?.();
    }

    const doorId = plate.targetDoorId ?? 1;

    // Al abandonar la losa en modo hold, revertir la acción vinculada
    if (plate.action === 'close_door') {
      this.openDoor(doorId, player || local);
    } else if (plate.action === 'toggle_door') {
      const isOpen = game.world.isDoorOpenId ? game.world.isDoorOpenId(doorId) : (doorId === 1 ? game.world.isDoor1Open : game.world.isDoor2Open);
      if (isOpen) {
        this.closeDoor(doorId, player || local);
      } else {
        this.openDoor(doorId, player || local);
      }
    } else {
      // Default: 'open_door' -> se cierra al quitar el peso
      this.closeDoor(doorId, player || local);
    }

    const currentLevelId = game.world?.levelRegistry?.getCurrentLevel()?.id || 'dungeon';
    if (game.openedPlateKeys) {
      game.openedPlateKeys.delete(`${currentLevelId}_plate_${plate.id}`);
    }

    // Feedback narrativo de desactivación
    const defaultMsg = `:stone: ¡Click! Has salido de la losa de presencia continua. ¡Mecanismo desactivado!`;
    const msg = plate.releaseMessage || defaultMsg;
    game.ui?.showNarrativeMessage?.(msg, 4000);

    return true;
  },

  /**
   * Petición de portal (solo Host): valida distancia al altar y arranca la ceremonia
   * para todos. Si hay siguiente mazmorra, viajan tras la ceremonia; si no, victoria.
   */
  requestPedestal(objIndex = 0, player = null) {
    const game = this.game;
    if (game.mode !== 'host' || this.transitioning) return false;
    const obj = game.world.objectives?.[objIndex];
    if (!obj) return false;
    if (player) {
      const dist = Math.hypot(player.pos.x - obj.x, player.pos.z - obj.z);
      if (dist > (obj.triggerRadius || 3.2) + 0.5) {
        console.warn(`[AntiCheat] Activación de altar rechazada: ${player.name} fuera de rango (${dist.toFixed(2)}m)`);
        return false;
      }
    }

    const curLevel = game.world.levelRegistry.getCurrentLevel();
    const curLevelId = curLevel?.id;
    let next = null;
    let isLast = false;

    if (game.chapterRegistry) {
      const nextDungeon = game.chapterRegistry.getNextDungeonInChapter(curLevelId);
      if (nextDungeon) {
        next = game.world.levelRegistry.getLevel(nextDungeon.id);
      } else if (game.chapterRegistry.isLastDungeonInChapter(curLevelId)) {
        isLast = true;
        const curChapter = game.chapterRegistry.getChapterForLevel(curLevelId)
          || game.chapterRegistry.getCurrentChapter();
        const nextChapterNum = (curChapter?.number || 1) + 1;
        const nextChapter = game.chapterRegistry.getChapter(nextChapterNum);
        if (nextChapter && game.chapterRegistry.isChapterPlayable(nextChapter.id)) {
          const nextDungeons = game.chapterRegistry.getDungeonsForChapter(nextChapter.id);
          if (nextDungeons?.[0]) {
            next = game.world.levelRegistry.getLevel(nextDungeons[0].id);
          }
        }
      }
    }

    if (!next && !isLast) {
      const levels = game.world.levelRegistry.getAllLevels();
      const curIdx = levels.findIndex(l => l.id === curLevelId);
      next = levels[curIdx + 1] || null;
      isLast = !next;
    }

    if (game.world.stairsOpen) {
      game.ui.showNarrativeMessage('La escalinata ya desciende. ¡Bajad!', 3000);
      return true;
    }
    const evt = {
      index: objIndex,
      isLast,
      nextLevelId: next?.id || '',
      nextName: next?.name || '',
    };
    game.network.broadcast(Proto.serializePedestalEvent(evt.index, evt.nextLevelId, evt.nextName, evt.isLast));
    this.startPortalCeremony(evt);
    return true;
  },

  /** Rectángulo de fosa de la escalinata del nivel actual (o null). */
  stairPitRect() {
    return this.stairCeremony.stairPitRect();
  },

  /**
   * Apertura de la losa sellada (solo Host): valida cercanía y la abre para todos.
   * La fosa con escalinata hasta el fondo queda transitable y activa el descenso.
   */
  requestStairsOpen(player = null) {
    return this.stairCeremony.requestStairsOpen(player);
  },

  /** Ceremonia local de apertura: fosa real, losa animada, sonido y mensaje. */
  openStairsCeremony() {
    return this.stairCeremony.openStairsCeremony();
  },

  /** Oscurece el pozo (serpentina en degradado + fondo y muros casi negros o azul pizarra abisal). */
  tintStairPit(rect) {
    return this.stairCeremony.tintStairPit(rect);
  },

  /**
   * Abre la fosa real en el mundo: retira el suelo del rectángulo 2x3 y talla una
   * serpentina descendente con colisión.
   */
  applyStairPit(rect) {
    return this.stairCeremony.applyStairPit(rect);
  },

  /** Ceremonia local del portal: altar y (si no es el final) apertura de la escalinata. */
  startPortalCeremony(evt = {}) {
    return this.stairCeremony.startPortalCeremony(evt);
  },

  /** Estado inicial de la escalinata: abierta desde el inicio o ya abierta en bloques recibidos. */
  ensureStairsState() {
    return this.stairCeremony.ensureStairsState();
  },

  /** La fosa está abierta si el suelo y=0 fue retirado en todo el rectángulo. */
  isPitOpenInBlocks(rect) {
    return this.stairCeremony.isPitOpenInBlocks(rect);
  }
};
