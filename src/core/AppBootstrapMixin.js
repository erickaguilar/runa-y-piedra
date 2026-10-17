/**
 * AppBootstrapMixin.js - Bootstrap de ajustes, interfaz y bucle de juego.
 *
 * Composición por mixin sobre `VoxelSandboxGame.prototype`. Los métodos asumen el
 * contexto del juego (`this.sceneManager`, `this.ui`, `this.world`, ...).
 */
import * as Proto from '../network/Protocol.js';
import { GameLoop } from './GameLoop.js';
import { saveManager } from '../storage/SaveManager.js';
import { NET_CONFIG, PHYSICS_CONFIG, PLAYER_HEROES } from '../config/constants.js';

export const AppBootstrapMixin = {
  initSettings() {
    this.ui.bindSettings({
      onProfileSave: ({ name, colorIndex }) => {
        const local = this.playerManager.localPlayer;
        local.name = name;

        // Si estamos conectados en red, validar unicidad y propagar metadatos
        if (this.mode === 'host') {
          const uniqueColor = this.playerManager.getAvailableColorIndex(colorIndex, local.id, PLAYER_HEROES.length);
          local.colorIndex = uniqueColor;
          const hero = PLAYER_HEROES[uniqueColor] || PLAYER_HEROES[0];
          this.avatars.setMetadata(local.id, name, hero.hex, hero.id || null);
          this.network.broadcast(Proto.serializePlayerMeta(local.id, uniqueColor, name));
          try {
            if (this.lastConnectedPin && typeof localStorage !== 'undefined') {
              localStorage.setItem(`dungeon_room_${this.lastConnectedPin}_host_hero`, String(uniqueColor));
            }
            if (this.lastConnectedPin && this.currentJoinUrl) {
              const hostAddr = localStorage.getItem('dungeon_lan_ip') || window.location.host;
              this.currentJoinUrl = `${window.location.protocol}//${hostAddr}/?join=${this.lastConnectedPin}&hh=${uniqueColor}`;
            }
          } catch {}
        } else if (this.mode === 'client') {
          this.network.sendToHost(Proto.serializePlayerMeta(local.id, colorIndex, name));
        }
        this.ui.updatePartyList(this.playerManager.getAllPlayers());
      },
      onQualityChange: (dpr) => {
        this.sceneManager.setQuality(dpr);
      },
      onSensitivityChange: (val) => {
        this.input.setSensitivity(val);
      },
      onCameraChange: (mode) => {
        this.setCameraMode(mode);
      },
      onLeaveGame: () => {
        this.leaveSession();
      },
      getGameState: () => ({
        inGame: this.mode !== null,
        isHost: this.mode === 'host',
        currentLevelId: this.world.levelRegistry.currentLevelId,
        chapter: {
          currentChapterId: this.chapterRegistry?.currentChapterId || 'capitulo_1',
          currentChapterName: this.chapterRegistry?.getCurrentChapter()?.name || '',
          highestChapterUnlocked: this.chapterRegistry?.progress?.highestChapterUnlocked || 1,
        },
        roomPin: this.network.roomId ? this.network.roomId.replace(NET_CONFIG.ROOM_PREFIX, '') : null,
        joinUrl: this.currentJoinUrl,
        players: this.playerManager.getAllPlayers(),
        localPlayer: this.playerManager.localPlayer,
        perf: this.network.stats.getPerfSummary(),
        gameplay: {
          altitude: this.playerManager.localPlayer?.pos?.y || 0,
          maxAltitude: this.playerManager.localPlayer?.maxAltitude || 0,
          jumpCount: this.playerManager.localPlayer?.jumpCount || 0,
          jumpPadCount: this.playerManager.localPlayer?.jumpPadCount || 0,
          checkpoint: this.playerManager.localPlayer?.checkpoint?.roomName || 'Ninguno'
        },
      }),
      onToggleDebug: (enable) => {
        this.network.stats.setEnabled(enable);
      },
      onChapterReload: async () => {
        await this.chapterRegistry?.load?.();
      },
    });
  }
,

  initUI() {
    this.ui.bindCampaign({
      getChapterRegistry: () => this.chapterRegistry,
      getGameState: () => ({
        isHost: this.mode !== 'client',
        currentLevelId: this.world.levelRegistry.currentLevelId,
      }),
      onSelectChapter: (chapterId) => this.selectCampaignChapter(chapterId),
      onReloadCatalog: async () => {
        await this.chapterRegistry?.load?.();
      },
    });
    this.ui.bindInventory({
      onUsePotion: (potion, idx) => this.usePotion(potion, idx),
    });
    this.ui.bindShop?.({
      onBuyItem: (item, price) => this.buyShopItem(item, price),
      onSellItem: (itemType, itemId, price) => this.sellShopItem(itemType, itemId, price),
    });
    this.ui.bindVoice?.(this.network);
    this.ui.showMenu({
      onHost: (profile) => this.startHost(profile),
      onJoin: (pin, profile) => this.joinRoom(pin, profile),
      onSlotChanged: async () => {
        await this.chapterRegistry?.load?.();
      },
      onResetSessionProgress: () => {
        this.resetInventory({ keepGems: false, keepRelics: false, keepPotions: false, keepChests: false });
        this.openedChestKeys = new Set();
        this.openedDoorKeys = new Set();
        this.ui.updateInventory(this.inventory);
      },
    });

    // Inicializar y sincronizar saveManager con la UI en el arranque
    saveManager.init().then(() => {
      this.ui.refreshMenuSlots?.();
      const current = saveManager.currentSave;
      if (current?.inventory) {
        this.inventory.gems = current.inventory.totalGems || 0;
        this.inventory.potions = Array.isArray(current.inventory.potions) ? [...current.inventory.potions] : [];
        this.inventory.relics = Array.isArray(current.inventory.relics) ? [...current.inventory.relics] : [];
        this.inventory.keys = Array.isArray(current.inventory.keys) ? [...current.inventory.keys] : [];
        this.openedChestKeys = saveManager.deserializeOpenedChests(current.inventory.openedChests);
        this.openedDoorKeys = saveManager.deserializeOpenedDoors(current.inventory.openedDoors);
        this.ui.updateInventory(this.inventory);

        const lvlId = this.world?.levelRegistry?.getCurrentLevel()?.id || 'lobby_tutorial';
        for (const c of this.world?.chests || []) {
          if (this.openedChestKeys.has(`${lvlId}_chest_${c.id ?? 1}`) || this.openedChestKeys.has(`${lvlId}:${c.id ?? 1}`)) {
            c.isOpen = true;
          }
        }
        this.chestRenderer?.loadChests(this.world.chests);

        for (const d of this.world?.doors || []) {
          const isMechanism = d.mechanism || d.lockedByPlate || (Array.isArray(this.world.pressurePlates) && this.world.pressurePlates.some(p => p.targetDoorId === d.id));
          if (isMechanism) continue;
          if (this.openedDoorKeys.has(`${lvlId}_door_${d.id ?? 1}`) || this.openedDoorKeys.has(`${lvlId}:${d.id ?? 1}`)) {
            this.openDoorInstant(d.id);
          }
        }
      }
    }).catch(err => console.warn('[GameApp] Error en saveManager.init:', err));
  },

  /** Alterna 1ª/3ª persona (tecla V o ajustes). Persiste la preferencia. */
  toggleCameraMode() {
    this.setCameraMode(this.cameraMode === 'third' ? 'first' : 'third');
  },

  /** Abre o cierra el modal de configuración (tecla Escape). */
  toggleSettings() {
    if (this.ui.isShopOpen || document.getElementById('modal-shop-overlay')) {
      this.ui.closeShopModal();
      return;
    }
    if (this.ui.isInventoryOpen || document.getElementById('modal-inventory-overlay')) {
      this.ui.closeInventoryModal();
      return;
    }
    if (this.ui.isSettingsOpen || document.getElementById('modal-settings')) {
      this.ui.closeSettingsModal();
    } else if (this.mode) {
      this.ui.openSettingsModal();
    }
  },

  setCameraMode(mode, silent = false) {
    this.cameraMode = mode === 'third' ? 'third' : 'first';
    saveManager.updateSettings({ camera: this.cameraMode });
    const local = this.playerManager.localPlayer;
    if (local) this.avatars.setLocalVisible(local.id, this.cameraMode === 'third');
    if (!silent) {
      // Se elimina la notificación de vista en primera persona por solicitud del usuario
      if (this.cameraMode === 'third') {
        this.ui.showNarrativeMessage(':camera: Vista en tercera persona.', 1400);
      }
    }
  },

  /** Tema visual del altar según la mazmorra activa y su capítulo (dorado clásico / amatista crepuscular). */
  pedestalTheme() {
    const curLevel = this.world?.levelRegistry?.getCurrentLevel?.();
    const id = curLevel?.id || '';

    // 1. Declaración explícita del nivel o del objetivo principal
    if (curLevel?.pedestalTheme) return curLevel.pedestalTheme;
    const firstPed = curLevel?.objectives?.find?.(o => (o.type || 'pedestal') === 'pedestal');
    if (firstPed?.theme) return firstPed.theme;

    // 2. Vinculación formal por capítulo en ChapterRegistry
    const ch = this.chapterRegistry?.getChapterForLevel?.(id);
    if (ch) {
      if (ch.id === 'capitulo_1' || ch.number === 1) return 'classic'; // Cap 1: Cáliz Sagrado Dorado
      if (ch.id === 'capitulo_2' || ch.number === 2) return 'abyss';   // Cap 2: Altar Crepuscular (Amatista)
    }

    // 3. Fallbacks contextuales por ID de nivel
    if (id === 'shadow_sanctum' || id.startsWith('shadow_')) return 'abyss';
    if (id === 'abyss_throne' || id.startsWith('dungeon_') || id === 'dev_showroom') return 'classic';
    if (id.includes('inferno')) return 'inferno';
    return 'classic';
  },

  initGameLoop() {
    const loop = new GameLoop({
      tickHz: PHYSICS_CONFIG.TICK_HZ,
      onTick: (_dt) => {
        const FIXED_DT = 1 / PHYSICS_CONFIG.TICK_HZ;
        const local = this.playerManager.localPlayer;
        const inTransition = !!(this.descent?.transitioning || this.interaction?.isTransitioning?.());
        const move = inTransition ? { forward: 0, right: 0 } : this.input.getMovement();
        local.setInput(move.forward, move.right, this.input.yaw);
        local.pitch = this.input.pitch;

        if (local.isNoclip) {
          local.inputFlyDown = !!(this.input?.keys?.['ShiftLeft'] || this.input?.keys?.['ShiftRight'] || this.input?.keys?.['KeyC']);
          local.inputFlyY = this.input?.getFlightElevation?.() ?? 0;
          const flightYawDelta = this.input?.consumeFlightYawDelta?.(FIXED_DT) ?? 0;
          if (flightYawDelta !== 0) {
            this.input.yaw += flightYawDelta;
            local.yaw = this.input.yaw;
          }
        }

        // Salto con perdón: buffer 150ms (pulsa antes de aterrizar) + coyote 120ms
        // (salta justo después de dejar el borde). El sonido va en la ejecución.
        const nowMs = performance.now();
        if (!inTransition && this.input.consumeJump()) this.jumpBufferTime = nowMs;
        if (local.onGround) this.lastGroundTime = nowMs;
        const hasBuffer = nowMs - (this.jumpBufferTime || -1e9) <= 150;
        const canCoyote = nowMs - (this.lastGroundTime || -1e9) <= 120;
        let jumpAction = 0;
        if (!inTransition && hasBuffer && (local.onGround || canCoyote || local.isNoclip)) {
          jumpAction = Proto.ACTION_FLAGS.JUMP;
          this.jumpBufferTime = 0;
          if (!local.isNoclip) this.soundManager.playJump();
        }

        if (this.mode === 'host') {
          // 1. Simular jugador local del Host aplicando su acción con dt fijo
          this.simulation.integratePlayer(local, FIXED_DT, jumpAction);

          // 2. Desacoplar jitter de red consumiendo exactamente 1 input sanitizado por tick (30 Hz)
          for (const [conn, pid] of this.playerManager.connToPlayerId.entries()) {
            const remotePlayer = this.playerManager.players.get(pid);
            if (!remotePlayer) continue;
            const clientInput = this.inputQueue.dequeue(conn);
            if (clientInput) {
              remotePlayer.setInput(clientInput.dz, clientInput.dx, clientInput.yaw);
              remotePlayer.lastInputSeq = clientInput.seq || 0;
              this.simulation.integratePlayer(remotePlayer, FIXED_DT, clientInput.actions || 0);
            } else {
              this.simulation.integratePlayer(remotePlayer, FIXED_DT, 0);
            }
          }
        } else if (this.mode === 'client') {
          this.inputSeq = (this.inputSeq + 1) & 0xFFFF;

          // 1. Enviar input autoritativo con flags de acción al Host en lockstep
          // (canal hot unreliable: si se pierde, el siguiente tick lo reemplaza)
          this.network.sendToHostHot(
            Proto.serializeInput(
              this.inputSeq,
              local.inputRight,
              local.inputForward,
              local.yaw,
              jumpAction
            )
          );

          // 2. Registrar input en el buffer de predicción local con dt fijo y flags de acción
          this.reconciler.recordInput(
            this.inputSeq,
            FIXED_DT,
            local.inputForward,
            local.inputRight,
            local.yaw,
            jumpAction
          );

          // 3. Simular predicción local con la misma acción y dt fijo
          this.simulation.integratePlayer(local, FIXED_DT, jumpAction);
        }
      },
      onRender: (dt) => {
        // Perf fase 3: FPS real medido en rAF, push al overlay cada ~0.5s
        this.perf.record(dt);
        this._perfAcc += dt;
        if (this._perfAcc >= 0.5) {
          this._perfAcc = 0;
          const { fps } = this.perf.getStats();
          const dpr = this.sceneManager.renderer?.getPixelRatio?.() || 0;
          this.network.stats.setPerfStats({ fps, dpr });
        }
        if (this.mode) {
          const local = this.playerManager.localPlayer;
          local.updateVisualSmoothing(dt);
          this.cameraController.update(local, local.yaw, local.pitch, this.cameraMode);

          // Actualizar overlay de coordenadas y salas en vivo si está activo
          if (this.roomDebugOverlay?.enabled) {
            const currentLevel = this.world.levelRegistry?.getCurrentLevel();
            const roomInfo = this.getCurrentRoomInfo();
            const targetBlock = this.raycaster?.getTargetBlockDebug?.(30);
            this.roomDebugOverlay.update({
              levelId: currentLevel?.id || this.world.levelRegistry?.currentLevelId || '—',
              levelName: currentLevel?.name || '—',
              roomName: roomInfo.name,
              pos: local.pos,
              yaw: local.yaw,
              pitch: local.pitch,
              hero: local.hero || PLAYER_HEROES[local.colorIndex] || PLAYER_HEROES[0],
              isNoclip: !!local.isNoclip,
              lives: local.lives,
              targetBlock,
            });
          }

          // Avatar propio solo visible en tercera persona
          if (this.cameraMode === 'third') {
            const hero = local.hero || PLAYER_HEROES[local.colorIndex] || PLAYER_HEROES[0];
            this.avatars.updateLocal(local.id, local.visualPos.x, local.visualPos.y, local.visualPos.z, local.yaw, hero.hex || hero.color, hero.id || null);
          } else {
            this.avatars.setLocalVisible(local.id, false);
          }

          // Reflejar invulnerabilidad post-respawn en el HUD sin re-renderizar corazones
          const livesHud = document.getElementById('hud-lives');
          if (livesHud) {
            livesHud.classList.toggle('invuln', !!local.isInvulnerable);
          }

          // Botón contextual (~8 Hz): qué se puede usar cerca sin raycast costoso
          this._interactUiAcc = (this._interactUiAcc || 0) + dt;
          if (this._interactUiAcc >= 0.12) {
            this._interactUiAcc = 0;
            this.ui.setInteractTarget(this.raycaster.getProximityTarget(local.pos));
          }

          if (this.mode === 'client') {
            // Interpolación temporal de entidades remotas (~100ms)
            this.reconciler.updateRemoteAvatars(this.avatars);

            // Transmitir telemetría de reconciliación al panel de diagnóstico
            const rStats = this.reconciler.getStats();
            this.network.stats.setReconciliationStats(
              rStats.predictionError,
              rStats.inputsInFlight,
              rStats.softCorrectionsPerSec,
              rStats.teleportsPerSec
            );
          }

          this.avatars.update(dt);
        }
        this.chestRenderer.update(dt);
        this.doorRenderer.update(dt);
        this.pedestalRenderer.update(dt);
        this.stairsRenderer.update(dt);
        this.pressurePlateRenderer.update(dt);
        this.propShowcaseRenderer?.update(dt);
        this.sceneManager.render();
      },
    });

    this.loop = loop;
    loop.start();
  }
};
