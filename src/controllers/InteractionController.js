import * as Proto from '../network/Protocol.js';
import { StairCeremonyController } from './StairCeremonyController.js';
import { InteractionActionsMixin } from './InteractionActions.js';
import { InteractionMechanismsMixin } from './InteractionMechanisms.js';

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
    this.stairCeremony = new StairCeremonyController(this);
  }

  isTransitioning() {
    return this.transitioning;
  }

  handleInteract(forcedInteraction = null) {
    const game = this.game;
    if (!game.mode) return;

    // Si la tarjeta de descenso ("Bajar ya") está en pantalla, pulsar E / click activa el descenso inmediato
    if (game.ui?.descentCard && game.ui.descentOnNow) {
      game.ui.descentOnNow();
      return;
    }

    const local = game.playerManager?.localPlayer;
    const interaction = forcedInteraction || game.raycaster?.getTargetInteraction(local?.pos);
    if (!interaction) {
      game.ui?.showNarrativeMessage?.('Nada con lo que interactuar cerca.', 2000);
      return;
    }

    return this.executeInteraction(interaction, local);
  }

  executeInteraction(interaction, local = null) {
    const game = this.game;
    if (!interaction) return false;
    local = local || game.playerManager?.localPlayer;

    if (interaction.type === 'door_mechanism') {
      game.soundManager?.playLocked?.();
      game.ui?.showNarrativeMessage?.(':lock: Esta puerta está sellada por un mecanismo rúnico. Activa la losa de presión correspondiente.', 3500);
      return false;
    }

    if (interaction.type === 'door') {
      const doorId = interaction.doorId || 1;
      const door = game.world.doors?.find(d => d.id === doorId);
      if (this.isMechanismDoor(door)) {
        game.soundManager?.playLocked?.();
        game.ui?.showNarrativeMessage?.(':lock: Esta puerta está sellada por un mecanismo rúnico. Activa la losa de presión correspondiente.', 3500);
        return;
      }

      const isOpen = doorId === 1 ? game.world.isDoor1Open : game.world.isDoor2Open;
      if (isOpen) return;

      if (game.mode === 'host') {
        this.requestOpenDoor(doorId, local);
      } else {
        // Pre-chequeo local de llave para feedback inmediato sin tráfico de red
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
    } else if (interaction.type === 'merchant' || interaction.type === 'shop') {
      game.soundManager?.playClick?.();
      game.ui.openShopModal?.();
      return true;
    } else if (interaction.type === 'pressure_plate') {
      const plateId = interaction.plateId;
      this.pressPressurePlate(plateId, local);
      return true;
    }
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

// Composición modular SRP: el controlador conserva la detección/dispatch; la
// ejecución de acciones vive en mixins (cofres/puertas y mecanismos/fosa).
Object.assign(
  InteractionController.prototype,
  InteractionActionsMixin,
  InteractionMechanismsMixin
);
