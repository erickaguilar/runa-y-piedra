/**
 * InteractionActions.js - Ejecución de acciones de interacción.
 *
 * Comprende cofres/llaves, puertas con cerradura, placas de presión, pedestal/altar
 * y la fosa de escalinata. Se compone sobre `InteractionController.prototype` vía
 * `Object.assign` (patrón de mixins del proyecto), de modo que cada método asume el
 * contexto de `InteractionController` (`this.game`, `this.transitioning`, `this.stairCeremony`).
 */
import * as Proto from '../network/Protocol.js';
import { getItemDefinition } from '../inventory/ItemRegistry.js';

export const InteractionActionsMixin = {
  openChest(chestId = 1, opener = null) {
    const game = this.game;
    const currentLevelId = game.world?.levelRegistry?.getCurrentLevel()?.id || 'dungeon';
    const chestKey = `${currentLevelId}_chest_${chestId}`;
    const chestKeyShort = `${currentLevelId}:${chestId}`;

    if (game.openedChestKeys?.has(chestKey) || game.openedChestKeys?.has(chestKeyShort)) {
      game.soundManager?.playClick?.();
      game.ui?.showNarrativeMessage?.(':chest: Este cofre ya ha sido saqueado.', 3000);
      return;
    }

    const opened = game.chestRenderer.openChest(chestId);
    if (!opened) {
      game.soundManager?.playClick?.();
      game.ui?.showNarrativeMessage?.(':chest: Este cofre ya ha sido saqueado.', 3000);
      return;
    }

    const chestData = game.world.chests?.find(c => c.id === chestId);
    if (chestData) chestData.isOpen = true;

    const local = game.playerManager.localPlayer;
    if (chestData && local) {
      game.soundManager.playChestOpen({ x: chestData.x, y: chestData.y, z: chestData.z }, local.pos);
    } else {
      game.soundManager.playChestOpen();
    }

    if (game.mode === 'host') {
      game.network.broadcast(Proto.serializeChestOpen(chestId));
      // Otorgamiento autoritativo de llave al jugador que abrió el cofre
      if (chestData?.givesKey) {
        if (opener?.addKey) opener.addKey(chestData.givesKey);
        if (local && local !== opener && local.addKey) local.addKey(chestData.givesKey);
        game.network.broadcast(Proto.serializeKeyUpdate(opener?.id ?? local?.id ?? 0, chestData.givesKey));
        if (opener === local || !opener) {
          // Actualizar HUD e inventario sin duplicar la notificación narrativa
          this.onLocalKeyReceived(chestData, false);
        }
      }
    }

    // Registrar y acumular botín del cofre en el inventario local
    this.collectChestLoot(chestData, opener);

    // Unificación de la notificación del cofre:
    // Presenta una única tarjeta narrativa estructurada con el cofre abierto,
    // el botín obtenido y la puerta que ahora se puede abrir si incluía llave.
    let msg = chestData?.message || `:chest: ¡Has abierto el ${chestData?.name || 'Cofre'}! Recompensa: ${chestData?.reward || 'Tesoros de la Mazmorra'}`;
    if (chestData?.givesKey) {
      const door = game.world.doors?.find(d => d.requiresKey === chestData.givesKey);
      if (door?.name && !msg.includes(door.name)) {
        const trimmed = msg.trim().replace(/\.*$/, '');
        msg = `${trimmed}. Ahora puedes abrir: ${door.name}.`;
      }
    }
    game.ui.showNarrativeMessage(msg, 5500);
  },

  /**
   * Extrae y añade al inventario del juego el botín del cofre:
   * llaves, gemas numéricas y reliquias míticas.
   */
  collectChestLoot(chestData, _opener = null) {
    if (!chestData) return;
    const game = this.game;
    const currentLevelId = game.world?.levelRegistry?.getCurrentLevel()?.id || 'dungeon';
    const chestKey = `${currentLevelId}_chest_${chestData.id ?? 1}`;
    const chestKeyShort = `${currentLevelId}:${chestData.id ?? 1}`;

    if (game.openedChestKeys?.has(chestKey) || game.openedChestKeys?.has(chestKeyShort)) {
      return;
    }
    game.openedChestKeys?.add(chestKey);
    game.openedChestKeys?.add(chestKeyShort);

    // 1. Llaves
    if (chestData.givesKey && game.addInventoryKey) {
      const def = getItemDefinition(chestData.givesKey);
      const keyName = chestData.keyName || def?.name || 'Llave del Santuario';
      game.addInventoryKey({ id: chestData.givesKey, name: keyName });
    }

    // 2. Gemas (propiedad directa o parseo numérico de reward / message)
    let gems = chestData.gems ?? 0;
    if (!gems) {
      const textToSearch = `${chestData.message || ''} ${chestData.reward || ''}`;
      const match = textToSearch.match(/(\d+)\s*Gemas/i);
      if (match) {
        gems = parseInt(match[1], 10);
      }
    }
    if (gems > 0 && game.addInventoryGems) {
      game.addInventoryGems(gems);
    }

    // 3. Poción de Vida (se guarda en el inventario para uso manual cuando el jugador decida)
    const textForPotion = `${chestData.message || ''} ${chestData.reward || ''}`;
    const potionDef = chestData.potion || chestData.givesPotion;
    if (potionDef || /Poci[oó]n/i.test(textForPotion)) {
      const canonPotion = getItemDefinition('pocion_vida');
      const potionData = potionDef || canonPotion || {
        id: 'pocion_vida',
        name: 'Poción de Vida',
        healAmount: 1,
        icon: 'potion',
        color: '#f43f5e',
      };
      if (game.addInventoryPotion) {
        game.addInventoryPotion(potionData);
      }
    }

    // 4. Reliquias míticas (Cáliz Sagrado, Corazón del Volcán, Corona del Vacío)
    const textForRelic = `${chestData.message || ''} ${chestData.reward || ''}`;
    if (chestData.relic && game.addInventoryRelic) {
      game.addInventoryRelic(chestData.relic);
    } else if (/C[aá]liz|Reliquia Dorada/i.test(textForRelic)) {
      const relicDef = getItemDefinition('caliz_sagrado') || {
        id: 'caliz_sagrado',
        name: 'Cáliz Sagrado',
        icon: 'trophy',
        color: '#eab308'
      };
      game.addInventoryRelic?.(relicDef);
    } else if (/Coraz[oó]n|Volc[aá]n/i.test(textForRelic)) {
      const relicDef = getItemDefinition('corazon_volcan') || {
        id: 'corazon_volcan',
        name: 'Corazón del Volcán',
        icon: 'flame',
        color: '#f97316'
      };
      game.addInventoryRelic?.(relicDef);
    } else if (/Corona|Vac[ií]o/i.test(textForRelic)) {
      const relicDef = getItemDefinition('corona_vacio') || {
        id: 'corona_vacio',
        name: 'Corona del Vacío',
        icon: 'crown',
        color: '#c084fc'
      };
      game.addInventoryRelic?.(relicDef);
    }
  },

  /** Feedback local al recibir una llave: insignia del HUD + sonido (opcionalmente notificación si no proviene de un cofre). */
  onLocalKeyReceived(chestData = {}, showNotification = true) {
    const game = this.game;
    game.ui.setHasKey(true);
    game.soundManager.playKeyPickup();
    const keyName = chestData.keyName || 'Llave del Santuario';
    if (chestData.givesKey && game.addInventoryKey) {
      game.addInventoryKey({ id: chestData.givesKey, name: keyName });
    }
    if (showNotification) {
      const door = game.world.doors?.find(d => d.requiresKey === chestData.givesKey);
      const doorMsg = door?.name ? ` Ahora puedes abrir: ${door.name}.` : '';
      game.ui.showNarrativeMessage(`:key: ¡${keyName} conseguida!${doorMsg}`, 4500);
    }
  },

  isMechanismDoor(door) {
    if (!door) return false;
    if (door.mechanism || door.lockedByPlate || door.mechanismOnly) return true;
    return Array.isArray(this.game.world?.pressurePlates) &&
      this.game.world.pressurePlates.some(p => p.targetDoorId === door.id);
  },

  /** Puerta bloqueada por falta de llave: mensaje + sonido metálico (solo jugador local). */
  doorLockedFeedback(door) {
    const game = this.game;
    const msg = door?.lockedMessage || ':lock: ¡Puerta sellada! Necesitas una llave.';
    game.soundManager?.playLocked?.();
    game.ui?.showNarrativeMessage?.(msg, 4000);
  },

  /**
   * Apertura validada: verifica llave requerida antes de abrir.
   * Retorna true si se abrió, false si está bloqueada o ya abierta.
   */
  requestOpenDoor(doorId = 1, player = null) {
    const game = this.game;
    const isOpen = doorId === 1 ? game.world.isDoor1Open : game.world.isDoor2Open;
    if (isOpen) return false;

    const door = game.world.doors?.find(d => d.id === doorId);

    // Las puertas controladas por mecanismos/losas no pueden abrirse manualmente
    if (this.isMechanismDoor(door)) {
      if (player === game.playerManager.localPlayer) {
        game.soundManager?.playLocked?.();
        game.ui?.showNarrativeMessage?.(':lock: Esta puerta está sellada por un mecanismo rúnico. Activa la losa de presión correspondiente.', 3500);
      }
      return false;
    }

    const keyId = door?.requiresKey;
    const hasKey = !keyId
      || player?.hasKey?.(keyId)
      || (keyId !== 'llave_santuario' && player?.hasKey?.('llave_santuario'))
      || game.inventory?.keys?.some(k => {
        const id = typeof k === 'string' ? k : (k.id || k.name);
        return id === keyId || (keyId !== 'llave_santuario' && id === 'llave_santuario');
      });

    if (keyId && !hasKey) {
      // Solo el jugador local recibe el aviso; los remotos ya fueron filtrados en su cliente
      if (player === game.playerManager.localPlayer) {
        this.doorLockedFeedback(door);
      }
      return false;
    }

    this.openDoor(doorId, player);
    return true;
  },

  openDoor(doorId = 1, _opener = null) {
    const game = this.game;
    const door = game.world.doors?.find(d => d.id === doorId);
    const isOpen = game.world?.isDoorOpenId ? game.world.isDoorOpenId(doorId) : (door?.isOpen ?? (doorId === 1 ? game.world.isDoor1Open : game.world.isDoor2Open));
    if (isOpen) return;

    game.world.openDoor(doorId);
    game.voxelMap?.openDoor?.(doorId);
    game.doorRenderer?.openDoor?.(doorId);

    const doorZ = door?.z ?? (doorId === 1 ? 11 : 24);
    const doorX = door?.x1 ? (door.x1 + door.x2) / 2 : 12.0;
    const local = game.playerManager?.localPlayer;
    if (local) {
      game.soundManager.playDoorOpen({ x: doorX, y: 2.0, z: doorZ + 0.5 }, local.pos);
    } else {
      game.soundManager.playDoorOpen();
    }

    // Registrar la puerta abierta en el registro persistente de puertas solo si no es de mecanismo/puzle
    if (!this.isMechanismDoor(door)) {
      const currentLevelId = game.world?.levelRegistry?.getCurrentLevel()?.id || 'dungeon';
      game.openedDoorKeys?.add(`${currentLevelId}_door_${doorId}`);
      game.openedDoorKeys?.add(`${currentLevelId}:${doorId}`);
    }

    // Llavero permanente: las llaves no se consumen ni se eliminan del inventario
    const defaultMsg = doorId === 1
      ? ':door: ¡Puerta 1 abierta! Sala 2: El Abismo. ¡Usa el botón SALTAR para cruzar las plataformas!'
      : ':door: ¡Puerta 2 abierta! ¡Has superado el Abismo! Avanzad al Santuario Ancestral.';
    const keySuffix = door?.requiresKey ? ' :key: (Llave en tu llavero)' : '';
    const msg = (door?.openMessage || defaultMsg) + keySuffix;
    game.ui.showNarrativeMessage(msg, 6000);

    if (game.mode === 'host' && game.network?.broadcast) {
      game.network.broadcast(Proto.serializeDoorOpen(doorId));
    }
  },

  /**
   * Cierra una puerta batiente:
   * Restaura la colisión en el mundo, devuelve las hojas batientes con resorte y reproduce el sonido de cerrojo.
   */
  closeDoor(doorId = 1, _closer = null) {
    const game = this.game;
    const door = game.world.doors?.find(d => d.id === doorId);
    const isOpen = door?.isOpen ?? (game.world.isDoorOpenId ? game.world.isDoorOpenId(doorId) : (doorId === 1 ? game.world.isDoor1Open : game.world.isDoor2Open));
    if (!isOpen) return false;

    game.world.closeDoor?.(doorId);
    game.voxelMap?.closeDoor?.(doorId);
    game.doorRenderer?.closeDoor?.(doorId);

    const doorZ = door?.z ?? (doorId === 1 ? 11 : 24);
    const doorX = door?.x1 ? (door.x1 + door.x2) / 2 : 12.0;
    const local = game.playerManager?.localPlayer;
    if (local) {
      game.soundManager?.playDoorClose?.({ x: doorX, y: 2.0, z: doorZ + 0.5 }, local.pos);
    } else {
      game.soundManager?.playDoorClose?.();
    }

    const currentLevelId = game.world?.levelRegistry?.getCurrentLevel()?.id || 'dungeon';
    game.openedDoorKeys?.delete(`${currentLevelId}_door_${doorId}`);
    game.openedDoorKeys?.delete(`${currentLevelId}:${doorId}`);

    const defaultMsg = `:door: ¡Puerta ${doorId} cerrada! El mecanismo de cerrojo ha sido accionado.`;
    const msg = door?.closeMessage || defaultMsg;
    game.ui?.showNarrativeMessage?.(msg, 4500);

    return true;
  }
};
