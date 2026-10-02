// src/controllers/InteractionController.js
import * as Proto from '../network/Protocol.js';
import { BLOCK_TYPES, WORLD_CONFIG } from '../config/constants.js';
import { floorVariant } from '../levels/LevelLoader.js';

/**
 * InteractionController - Todas las interacciones del jugador con el mundo:
 * puertas, cofres/llaves, altar, losa sellada y construcción de la fosa.
 *
 * Extraído del game principal. Accede al juego vía `game` (mundo, renderers,
 * red, UI, audio, managers) y posee el flag `transitioning` de ceremonias.
 */
export class InteractionController {
  constructor(game) {
    this.game = game;
    this.transitioning = false;
  }

  isTransitioning() {
    return this.transitioning;
  }

  handleInteract() {
    const game = this.game;
    if (!game.mode) return;

    // Si la tarjeta de descenso ("Bajar ya") está en pantalla, pulsar E / click activa el descenso inmediato
    if (game.ui?.descentCard && game.ui.descentOnNow) {
      game.ui.descentOnNow();
      return;
    }

    const local = game.playerManager.localPlayer;
    const interaction = game.raycaster.getTargetInteraction(local.pos);
    if (!interaction) {
      game.ui.showNarrativeMessage('Nada con lo que interactuar cerca.', 2000);
      return;
    }

    if (interaction.type === 'door') {
      const doorId = interaction.doorId || 1;
      const isOpen = doorId === 1 ? game.world.isDoor1Open : game.world.isDoor2Open;
      if (isOpen) return;

      if (game.mode === 'host') {
        this.requestOpenDoor(doorId, local);
      } else {
        // Pre-chequeo local de llave para feedback inmediato sin tráfico de red
        const door = game.world.doors?.find(d => d.id === doorId);
        const reqKey = door?.requiresKey;
        const hasKey = !reqKey
          || local.hasKey?.(reqKey)
          || (reqKey !== 'llave_santuario' && local.hasKey?.('llave_santuario'))
          || game.inventory?.keys?.some(k => {
            const id = typeof k === 'string' ? k : (k.id || k.name);
            return id === reqKey || (reqKey !== 'llave_santuario' && id === 'llave_santuario');
          });
        if (reqKey && !hasKey) {
          this.doorLockedFeedback(door);
          return;
        }
        game.network.sendToHost(Proto.serializeDoorOpen(doorId));
        game.ui.showNarrativeMessage(`Abriendo Puerta ${doorId}...`, 2500);
      }
    } else if (interaction.type === 'chest') {
      const chestId = interaction.chestId || 1;
      if (game.chestRenderer.isChestOpen(chestId)) return;

      if (game.mode === 'host') {
        this.openChest(chestId, local);
      } else {
        game.network.sendToHost(Proto.serializeChestOpen(chestId));
      }
    } else if (interaction.type === 'stairs') {
      if (game.world.stairsOpen) return;
      if (this.transitioning) return;
      if (game.mode === 'host') {
        this.requestStairsOpen(local);
      } else {
        game.network.sendToHost(Proto.serializeStairsReq());
        game.ui.showNarrativeMessage('Empujando la losa sellada...', 1500);
      }
    } else if (interaction.type === 'pedestal') {
      if (this.transitioning) return;
      const objIndex = interaction.objIndex ?? 0;
      if (game.mode === 'host') {
        this.requestPedestal(objIndex, local);
      } else {
        game.network.sendToHost(Proto.serializePedestalRequest(objIndex));
        game.ui.showNarrativeMessage('Activando el altar...', 1500);
      }
    } else if (interaction.type === 'cartography') {
      game.soundManager?.playClick?.();
      game.ui.openChapterModal?.();
      return true;
    }
  }

  openChest(chestId = 1, opener = null) {
    const game = this.game;
    const currentLevelId = game.world?.levelRegistry?.getCurrentLevel()?.id || 'dungeon';
    const chestKey = `${currentLevelId}_chest_${chestId}`;
    const chestKeyShort = `${currentLevelId}:${chestId}`;

    if (game.openedChestKeys?.has(chestKey) || game.openedChestKeys?.has(chestKeyShort)) {
      game.soundManager?.playClick?.();
      game.ui?.showNarrativeMessage?.('📦 Este cofre ya ha sido saqueado.', 3000);
      return;
    }

    const opened = game.chestRenderer.openChest(chestId);
    if (!opened) {
      game.soundManager?.playClick?.();
      game.ui?.showNarrativeMessage?.('📦 Este cofre ya ha sido saqueado.', 3000);
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
    let msg = chestData?.message || `📦 ¡Has abierto el ${chestData?.name || 'Cofre'}! Recompensa: ${chestData?.reward || 'Tesoros de la Mazmorra'}`;
    if (chestData?.givesKey) {
      const door = game.world.doors?.find(d => d.requiresKey === chestData.givesKey);
      if (door?.name && !msg.includes(door.name)) {
        const trimmed = msg.trim().replace(/\.*$/, '');
        msg = `${trimmed}. Ahora puedes abrir: ${door.name}.`;
      }
    }
    game.ui.showNarrativeMessage(msg, 5500);
  }

  /**
   * Extrae y añade al inventario del juego el botín del cofre:
   * llaves, gemas numéricas y reliquias míticas.
   */
  collectChestLoot(chestData, opener = null) {
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
      const keyName = chestData.keyName || 'Llave del Santuario';
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
      const potionData = potionDef || {
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
      game.addInventoryRelic?.({
        id: 'caliz_sagrado',
        name: 'Cáliz Sagrado',
        icon: 'trophy',
        color: '#eab308'
      });
    } else if (/Coraz[oó]n|Volc[aá]n/i.test(textForRelic)) {
      game.addInventoryRelic?.({
        id: 'corazon_volcan',
        name: 'Corazón del Volcán',
        icon: 'flame',
        color: '#f97316'
      });
    } else if (/Corona|Vac[ií]o/i.test(textForRelic)) {
      game.addInventoryRelic?.({
        id: 'corona_vacio',
        name: 'Corona del Vacío',
        icon: 'crown',
        color: '#c084fc'
      });
    }
  }

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
      game.ui.showNarrativeMessage(`🗝️ ¡${keyName} conseguida!${doorMsg}`, 4500);
    }
  }

  /** Puerta bloqueada por falta de llave: mensaje + sonido metálico (solo jugador local). */
  doorLockedFeedback(door) {
    const game = this.game;
    const msg = door?.lockedMessage || '🔒 ¡Puerta sellada! Necesitas una llave.';
    game.soundManager.playLocked();
    game.ui.showNarrativeMessage(msg, 4000);
  }

  /**
   * Apertura validada: verifica llave requerida antes de abrir.
   * Retorna true si se abrió, false si está bloqueada o ya abierta.
   */
  requestOpenDoor(doorId = 1, player = null) {
    const game = this.game;
    const isOpen = doorId === 1 ? game.world.isDoor1Open : game.world.isDoor2Open;
    if (isOpen) return false;

    const door = game.world.doors?.find(d => d.id === doorId);
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
  }

  openDoor(doorId = 1, opener = null) {
    const game = this.game;
    const isOpen = doorId === 1 ? game.world.isDoor1Open : game.world.isDoor2Open;
    if (isOpen) return;

    game.world.openDoor(doorId);
    game.voxelMap.openDoor(doorId);
    game.doorRenderer.openDoor(doorId);

    const door = game.world.doors?.find(d => d.id === doorId);
    const doorZ = door?.z ?? (doorId === 1 ? 11 : 24);
    const local = game.playerManager?.localPlayer;
    if (local) {
      game.soundManager.playDoorOpen({ x: 12.0, y: 2.0, z: doorZ + 0.5 }, local.pos);
    } else {
      game.soundManager.playDoorOpen();
    }

    // Registrar la puerta abierta en el registro persistente de puertas
    const currentLevelId = game.world?.levelRegistry?.getCurrentLevel()?.id || 'dungeon';
    game.openedDoorKeys?.add(`${currentLevelId}_door_${doorId}`);
    game.openedDoorKeys?.add(`${currentLevelId}:${doorId}`);

    // Llavero permanente: las llaves no se consumen ni se eliminan del inventario
    const defaultMsg = doorId === 1
      ? '🚪 ¡Puerta 1 abierta! Sala 2: El Abismo. ¡Usa el botón SALTAR para cruzar las plataformas!'
      : '🚪 ¡Puerta 2 abierta! ¡Has superado el Abismo! Avanzad al Santuario Ancestral.';
    const keySuffix = door?.requiresKey ? ' 🗝️ (Llave en tu llavero)' : '';
    const msg = (door?.openMessage || defaultMsg) + keySuffix;
    game.ui.showNarrativeMessage(msg, 6000);

    if (game.mode === 'host') {
      game.network.broadcast(Proto.serializeDoorOpen(doorId));
    }
  }

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
    this.game.ui.showNarrativeMessage('🪨 ¡La losa cede! Una escalinata desciende a la oscuridad. ¡Bajad!', 4500);
  }

  /** Oscurece el pozo (serpentina en degradado + fondo y muros casi negros). */
  tintStairPit(rect) {
    if (!rect) return;
    const game = this.game;
    const BOTTOM = WORLD_CONFIG.MIN_Y ?? -8;
    const shade = (y) => {
      const f = Math.min(1, Math.max(0, (-1 - y) / (-1 - BOTTOM)));
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
            game.voxelMap.setTint(x, y, z, 0x141414);
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
  startPortalCeremony({ isLast = false } = {}) {
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
      if (curChapter && game.chapterRegistry) {
        const result = game.chapterRegistry.completeChapter(curChapter.id);
        if (result?.nextChapter) {
          unlockMsg = ` 🌟 ¡Capítulo ${result.nextChapter.number} desbloqueado: ${result.nextChapter.name}!`;
        }
      }

      if (curLevelId && curLevelId !== 'lobby_tutorial' && curLevelId !== 'dev_showroom') {
        game.saveDungeonCompletion?.(curLevelId, true);
      }

      const title = curChapter ? `🏆 ¡${curChapter.name} Conquistado!` : '🏆 ¡Mazmorras Conquistadas!';
      const subtitle = `Habéis bendecido todos los altares.${unlockMsg} Regresando al Campamento...`;

      game.ui.showLevelTransition(
        title,
        subtitle,
        {
          victory: true,
          autoHideMs: 12000,
          onClose: () => {
            this.transitioning = false;
            if (game.mode === 'host') {
              game.switchLevel('lobby_tutorial', true);
            }
          },
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
    game.stairsRenderer.loadStairs(rect);
    if (!rect) return;
    const shouldOpen = !!rect.open || this.isPitOpenInBlocks(rect);
    if (shouldOpen && !game.world.stairsOpen) {
      if (!this.isPitOpenInBlocks(rect)) this.applyStairPit(rect);
      this.tintStairPit(rect);
      game.world.stairsOpen = true;
      for (const w of game.world.stairwells) w.open = true;
      game.stairsRenderer.setOpenInstant();
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

  /** Registra los listeners de red de interacciones (puertas, cofres, altar, losa, llaves). */
  bindNetworkEvents() {
    const game = this.game;
    const net = game.network;

    net.addEventListener('door-open', (e) => {
      const doorId = e.detail?.doorId || 1;
      const conn = e.detail?.conn;

      // Validación autoritativa en el Host: distancia euclidiana <= 3.5m (tolerancia de jitter)
      let requester = null;
      if (game.mode === 'host' && conn) {
        requester = game.playerManager.getPlayerByConnection(conn);
        if (!requester) return;

        const door = game.world.doors?.find(d => d.id === doorId);
        const doorZ = door?.z ?? (doorId === 1 ? 11 : 24);
        const doorCenterX = 12.0;
        const doorCenterZ = doorZ + 0.5;
        const dist = Math.hypot(requester.pos.x - doorCenterX, requester.pos.z - doorCenterZ);
        if (dist > 3.5) {
          console.warn(`[AntiCheat] Apertura de puerta ${doorId} rechazada: jugador ${requester.name} fuera de rango (${dist.toFixed(2)}m > 3.5m)`);
          return;
        }

        // Validación de llave en el Host (el cliente ya pre-chequeó, esto es anti-trampas)
        this.requestOpenDoor(doorId, requester);
        return;
      }

      this.openDoor(doorId);
    });

    net.addEventListener('chest-open', (e) => {
      const chestId = e.detail?.chestId || 1;
      const conn = e.detail?.conn;

      // Validación autoritativa en el Host: distancia euclidiana al cofre <= 3.2m
      let opener = null;
      if (game.mode === 'host' && conn) {
        opener = game.playerManager.getPlayerByConnection(conn);
        if (!opener) return;

        const chest = game.world.chests?.find(c => c.id === chestId);
        if (chest) {
          const dist = Math.hypot(opener.pos.x - chest.x, opener.pos.z - chest.z);
          if (dist > 3.2) {
            console.warn(`[AntiCheat] Apertura de cofre ${chestId} rechazada: jugador ${opener.name} fuera de rango (${dist.toFixed(2)}m > 3.2m)`);
            return;
          }
        }
      }

      this.openChest(chestId, opener);
    });

    net.addEventListener('pedestal', (e) => {
      const detail = e.detail || {};
      if (game.mode === 'host') {
        // Petición de un cliente: validar solicitante y arrancar ceremonia global
        if (!detail.isRequest) return;
        if (this.transitioning) return;
        const player = game.playerManager.getPlayerByConnection(detail.conn);
        if (!player) return;
        this.requestPedestal(detail.index ?? 0, player);
      } else if (game.mode === 'client') {
        // Ceremonia retransmitida por el Host: vivirla en local
        if (detail.isRequest) return;
        this.startPortalCeremony(detail);
      }
    });

    net.addEventListener('stairs', (e) => {
      const detail = e.detail || {};
      if (game.mode === 'host') {
        if (detail.kind !== Proto.STAIRS_KIND.REQ || this.transitioning) return;
        const player = game.playerManager.getPlayerByConnection(detail.conn);
        if (!player) return;
        this.requestStairsOpen(player);
      } else if (game.mode === 'client') {
        if (detail.kind !== Proto.STAIRS_KIND.OPEN) return;
        this.openStairsCeremony();
      }
    });

    net.addEventListener('key-update', (e) => {
      if (game.mode !== 'client') return;
      const { playerId, keyId } = e.detail || {};
      if (!keyId) return;
      const player = game.playerManager.getPlayerById(playerId);
      if (!player) return;
      if (player.addKey(keyId) && player === game.playerManager.localPlayer) {
        const chestData = game.world.chests?.find(c => c.givesKey === keyId);
        // Si la llave proviene de un cofre, openChest ya emite la notificación narrativa unificada
        this.onLocalKeyReceived(chestData || {}, !chestData);
      }
    });
  }
}
