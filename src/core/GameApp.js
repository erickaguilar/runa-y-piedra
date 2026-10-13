/**
 * GameApp.js - Orquestador central de la experiencia VoxelSandboxGame
 * 
 * Enlaza los subsistemas de renderizado 3D, física, red WebRTC, controladores
 * de interacción/descenso, interfaz de usuario y bucle de juego principal.
 */
import { SceneManager } from '../render/SceneManager.js';
import { VoxelMap } from '../render/VoxelMap.js';
import { AvatarRenderer } from '../render/AvatarRenderer.js';
import { ChestRenderer } from '../render/ChestRenderer.js';
import { DoorRenderer } from '../render/DoorRenderer.js';
import { PedestalRenderer } from '../render/PedestalRenderer.js';
import { StairsRenderer } from '../render/StairsRenderer.js';
import { HeroShowcaseRenderer } from '../render/HeroShowcaseRenderer.js';
import { PropShowcaseRenderer } from '../render/PropShowcaseRenderer.js';
import { PressurePlateRenderer } from '../render/PressurePlateRenderer.js';
import { World } from './World.js';
import { GameLoop } from './GameLoop.js';
import { PlayerManager } from '../entities/PlayerManager.js';
import { SimulationEngine } from '../simulation/SimulationEngine.js';
import { InputManager } from '../input/InputManager.js';
import { CameraController } from '../camera/CameraController.js';
import { BlockRaycaster } from '../interaction/BlockRaycaster.js';
import { NetworkManager } from '../network/NetworkManager.js';
import * as Proto from '../network/Protocol.js';
import { ClientReconciler } from '../network/ClientReconciler.js';
import { InputQueue } from '../network/InputQueue.js';
import { UIManager } from '../ui/UIManager.js';
import { InteractionController } from '../controllers/InteractionController.js';
import { DescentManager } from '../controllers/DescentManager.js';
import { soundManager } from '../audio/SoundManager.js';
import { InputMode } from '../ui/InputMode.js';
import { saveManager } from '../storage/SaveManager.js';
import { NET_CONFIG, PHYSICS_CONFIG, PLAYER_HEROES } from '../config/constants.js';
import { PerfMonitor } from '../perf/PerfMonitor.js';

import { InventoryMixin } from '../controllers/InventoryController.js';
import { SessionMixin } from './SessionManager.js';
import { NetworkCoordinatorMixin } from '../network/NetworkCoordinator.js';
import { RoomDebugOverlay } from '../ui/RoomDebugOverlay.js';

export class VoxelSandboxGame {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.mode = null; // 'host' | 'client'

    // 1. Núcleo gráfico y simulación
    this.sceneManager = new SceneManager(this.canvas);
    this.world = new World();
    this.chapterRegistry = this.world.chapterRegistry;
    this.voxelMap = new VoxelMap(this.sceneManager.scene, this.world);
    this.chestRenderer = new ChestRenderer(this.sceneManager.scene);
    this.chestRenderer.loadChests(this.world.chests);
    this.doorRenderer = new DoorRenderer(this.sceneManager.scene);
    this.doorRenderer.loadDoors(this.world.doors);
    this.pedestalRenderer = new PedestalRenderer(this.sceneManager.scene);
    this.pedestalRenderer.loadPedestals(this.world.objectives, { theme: this.pedestalTheme(), monoliths: this.world.monoliths });
    this.stairsRenderer = new StairsRenderer(this.sceneManager.scene);
    this.heroShowcaseRenderer = new HeroShowcaseRenderer(this.sceneManager.scene);
    this.heroShowcaseRenderer.loadShowcases(this.world.heroShowcases || []);
    this.propShowcaseRenderer = new PropShowcaseRenderer(this.sceneManager.scene);
    this.propShowcaseRenderer.loadShowcases(this.world.propShowcases || []);
    this.pressurePlateRenderer = new PressurePlateRenderer(this.sceneManager.scene);
    this.pressurePlateRenderer.loadPressurePlates(this.world.pressurePlates);
    this.interaction = new InteractionController(this);
    this.descent = new DescentManager(this);
    this.interaction.ensureStairsState();
    this.avatars = new AvatarRenderer(this.sceneManager.scene);
    this.playerManager = new PlayerManager();
    this.simulation = new SimulationEngine(this.world, {
      onStairTouch: (p) => this.descent.onStairTouch(p),
      onPressurePlateStep: (p, plate) => {
        this.interaction.pressPressurePlate(plate.id, p);
      },
      onPressurePlateRelease: (p, plate) => {
        this.interaction.releasePressurePlate(plate.id, p);
      },
      isTransitioning: () => !!(this.descent?.transitioning || this.interaction?.isTransitioning?.()),
      onJumpPad: (p) => {
        if (p !== this.playerManager.localPlayer) return;
        this.soundManager.playJump();
        this.ui.showNarrativeMessage(':bolt: ¡Impulso rúnico vertical!', 1000);
      },
      onPlayerLavaSink: (p) => {
        if (p !== this.playerManager.localPlayer) return;
        this.soundManager.playHurt();
        this.ui.showNarrativeMessage(':flame: ¡Caíste en la lava! Hundiéndote en el magma incandescente...', 1800);
      },
      onPlayerRespawn: (p, cp, info = {}) => {
        const { cause = 'void', lives = 3, maxLives = 3, gameOver = false, noPenalty = false } = info;
        const targetYaw = cp?.yaw ?? this.world?.spawnPoint?.yaw ?? Math.PI;
        p.yaw = targetYaw;
        p.pitch = 0;
        if (p === this.playerManager.localPlayer) {
          this.input.yaw = targetYaw;
          this.input.pitch = 0;
          if (this.avatars) {
            const hero = p.hero || PLAYER_HEROES[p.colorIndex] || PLAYER_HEROES[0];
            this.avatars.updateLocal(p.id, p.visualPos.x, p.visualPos.y, p.visualPos.z, p.yaw, hero.hex || hero.color, hero.id || null);
          }
          if (this.cameraController) {
            this.cameraController.update(p, p.yaw, p.pitch, this.cameraMode);
          }
          if (noPenalty) {
            this.soundManager.playRespawn();
            this.ui.showNarrativeMessage(':warning: ¡Zona restringida! Reapareces en la Losa de Respawn.', 2500);
            return;
          }
          this.ui.updateLives(lives, maxLives);
          if (gameOver) {
            this.soundManager.playGameOver();
            this.ui.showGameOver(lives, maxLives);
            this.restoreSavedState();
            // Game Over en un capítulo = traslado al campamento/lobby con vidas restauradas
            const curLevelId = this.world?.levelRegistry?.getCurrentLevel()?.id || 'dungeon_classic';
            const targetLevelId = (curLevelId === 'dev_showroom') ? 'dev_showroom' : 'lobby_tutorial';
            this.switchLevel(targetLevelId, this.mode === 'host', { isGameOver: true });
          } else {
            this.soundManager.playHurt();
            setTimeout(() => this.soundManager.playRespawn(), 300);
            const roomMsg = cp?.roomName ? ` en ${cp.roomName}` : '';
            if (cause === 'lava') {
              this.ui.showNarrativeMessage(`:flame: ¡Te consumió la lava! Te quedan ${lives} ${lives === 1 ? 'vida' : 'vidas'}. Reapareciendo en la Losa Rúnica${roomMsg}...`, 3200);
            } else {
              this.ui.showNarrativeMessage(`:warning: ¡Caíste al abismo! Te quedan ${lives} ${lives === 1 ? 'vida' : 'vidas'}. Reapareciendo en la Losa Rúnica${roomMsg}...`, 3200);
            }
          }
        } else {
          if (this.avatars) {
            this.avatars.setTarget(p.id, p.pos.x, p.pos.y, p.pos.z, targetYaw);
          }
          if (gameOver && this.mode === 'host') {
            // Si un compañero en coop sufre Game Over en una mazmorra, la expedición completa regresa al lobby
            const curLevelId = this.world?.levelRegistry?.getCurrentLevel()?.id || 'dungeon_classic';
            const targetLevelId = (curLevelId === 'dev_showroom') ? 'dev_showroom' : 'lobby_tutorial';
            this.soundManager.playGameOver();
            this.ui.showGameOver(this.playerManager.localPlayer?.lives ?? 3, this.playerManager.localPlayer?.maxLives ?? 3);
            this.restoreSavedState();
            this.switchLevel(targetLevelId, true, { isGameOver: true });
          }
        }
      },
    });
    this.cameraController = new CameraController(this.sceneManager.camera);
    this.cameraController.setWorld(this.world);
    this.raycaster = new BlockRaycaster(this.sceneManager.camera, this.voxelMap, this.world);
    this.raycaster.setRenderers({
      chestRenderer: this.chestRenderer,
      doorRenderer: this.doorRenderer,
      pedestalRenderer: this.pedestalRenderer,
      pressurePlateRenderer: this.pressurePlateRenderer,
      stairsRenderer: this.stairsRenderer,
      propShowcaseRenderer: this.propShowcaseRenderer,
    });

    // 2. Red, Audio y UI
    this.network = new NetworkManager();
    this.ui = new UIManager();
    this.soundManager = soundManager;
    this.inventory = { keys: [], gems: 0, relics: [], potions: [] };
    this.openedChestKeys = new Set();
    this.openedDoorKeys = new Set();
    this.network.stats.setRenderer(this.sceneManager.renderer);
    this.inputMode = new InputMode();
    this.roomDebugOverlay = new RoomDebugOverlay();

    // 3. Controles adaptativos PC / Táctil
    this.input = new InputManager({
      canvas: this.canvas,
      inputMode: this.inputMode,
      isGameActive: () => !!this.mode,
      onJump: () => {},
      onInteract: () => this.interaction.handleInteract(),
      onCameraToggle: () => this.toggleCameraMode(),
      onSettingsToggle: () => this.toggleSettings(),
      onInventoryToggle: () => this.ui.toggleInventoryModal(),
      onUsePotion: () => this.usePotion(),
      onControlsToggle: () => {
        this.soundManager.playClick();
        this.ui.toggleControlsHud(true);
      },
      onChapterMapToggle: () => this.ui.toggleChapterModal(),
    });
    const initialSettings = saveManager.getSettings();
    this.cameraMode = initialSettings.camera || (typeof localStorage !== 'undefined' ? localStorage.getItem('dungeon_camera') : null) || 'first';

    // Banner flotante de controles para PC
    let pcHintTimer = null;
    const showPcHint = () => {
      if (!this.mode) return; // Solo en partida
      const hint = document.getElementById('pc-hint');
      if (!hint) return;
      hint.classList.add('shown');
      if (pcHintTimer) clearTimeout(pcHintTimer);
      pcHintTimer = setTimeout(() => hint.classList.remove('shown'), 6500);
    };

    this.inputMode.onModeChange((mode) => {
      if (mode === 'pc') {
        showPcHint();
      } else {
        const hint = document.getElementById('pc-hint');
        if (hint) hint.classList.remove('shown');
      }
    });

    this.currentJoinUrl = null;
    this.inputSeq = 0;
    this.snapshotSeq = 0;
    this.inputQueue = new InputQueue();
    this.reconciler = new ClientReconciler();
    this.reconciler.onTeleport = (entry) => {
      if (entry && entry.yaw !== undefined) {
        this.input.yaw = entry.yaw;
        this.input.pitch = 0;
        const local = this.playerManager?.localPlayer;
        if (local) {
          local.yaw = entry.yaw;
          local.pitch = 0;
          if (this.cameraController) {
            this.cameraController.update(local, local.yaw, local.pitch, this.cameraMode);
          }
        }
      }
    };
    this.perf = new PerfMonitor();
    this._perfAcc = 0;
    // Salto con perdón: buffer 150ms + coyote time 120ms
    this.jumpBufferTime = 0;
    this.lastGroundTime = 0;

    // Aplicar calidad gráfica guardada
    const rawDpr = initialSettings.dpr ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('dungeon_dpr') : null);
    const savedDpr = parseFloat(rawDpr || '1.5');
    this.sceneManager.setQuality(savedDpr);

    this.initNetworkEvents();
    this.initNetworkTimers();
    this.initGameLoop();
    this.initSettings();
    this.initDev();
    this.initUI();
    if (typeof window !== 'undefined') window.__game = this;
  }

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

  getCurrentRoomInfo() {
    const local = this.playerManager.localPlayer;
    if (!local) return { id: 'unknown', name: 'Desconocido' };
    const pz = local.pos.z;
    if (Array.isArray(this.world.checkpoints) && this.world.checkpoints.length > 0) {
      const cp = this.world.checkpoints.find(c => pz >= (c.minZ ?? -Infinity) && pz <= (c.maxZ ?? Infinity));
      if (cp) return { id: cp.id, name: cp.name, checkpoint: cp };
    }
    return { id: 'default', name: local.checkpoint?.roomName || 'Zona de Inicio', checkpoint: null };
  }

  teleportLocalPlayer(x, y, z, yaw = null) {
    const local = this.playerManager.localPlayer;
    if (!local) return;
    local.teleport(x, y, z, yaw);
    this.ui.showHudMessage(`Teletransportado a [${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}]`);
  }

  setHeroLocal(colorIndex) {
    const local = this.playerManager.localPlayer;
    if (!local) return;
    const heroIndex = Math.max(0, Math.min(PLAYER_HEROES.length - 1, colorIndex));
    local.setColorIndex(heroIndex);
    this.ui.selectedColorIndex = heroIndex;
    const hero = PLAYER_HEROES[heroIndex] || PLAYER_HEROES[0];
    try {
      localStorage.setItem('dungeon_player_color', heroIndex.toString());
    } catch { /* ignore */ }
    if (this.mode === 'client') {
      this.network.sendToHost(Proto.serializePlayerMeta(local.id, heroIndex, local.name));
    } else if (this.mode === 'host') {
      this.network.broadcast(Proto.serializePlayerMeta(local.id, heroIndex, local.name));
    }
    this.ui.showHudMessage(`Héroe: ${hero.name} (Salto ×${hero.jumpMultiplier.toFixed(2)})`);
  }

  openAllDoors() {
    let count = 0;
    if (Array.isArray(this.world.doors) && this.world.doors.length > 0) {
      for (const d of this.world.doors) {
        this.openDoorInstant(d.id);
        count++;
      }
    } else {
      this.openDoorInstant(1);
      this.openDoorInstant(2);
      count = 2;
    }
    this.ui.showNarrativeMessage(`:door: Modo Dev: ${count} puertas desbloqueadas.`, 3000);
  }

  resetRoomMechanisms() {
    if (Array.isArray(this.world.doors)) {
      for (const d of this.world.doors) {
        this.world.closeDoor(d.id);
        this.voxelMap?.closeDoor?.(d.id);
        this.doorRenderer?.closeDoor?.(d.id);
      }
    } else {
      this.world.closeDoor(1);
      this.world.closeDoor(2);
      this.doorRenderer?.closeDoor?.(1);
      this.doorRenderer?.closeDoor?.(2);
    }

    if (Array.isArray(this.world.pressurePlates)) {
      for (const plate of this.world.pressurePlates) {
        plate.isPressed = false;
        if (plate._occupants) plate._occupants.clear();
        this.pressurePlateRenderer?.unpress?.(plate.id);
      }
    }

    for (const p of this.playerManager.getAllPlayers()) {
      if (p._standingPlates) p._standingPlates.clear();
    }

    const local = this.playerManager.localPlayer;
    if (local && local.checkpoint) {
      local.teleport(local.checkpoint.x, local.checkpoint.y, local.checkpoint.z, local.checkpoint.yaw);
    }
    this.ui.showNarrativeMessage(':refresh: Mecanismos reseteados y posición restablecida.', 3500);
  }

  restoreHealth() {
    const local = this.playerManager.localPlayer;
    if (!local) return;
    local.resetLives();
    this.ui.updateLives(local.lives, local.maxLives);
    this.ui.showHudMessage(':heart: ¡Salud y vidas restauradas!');
  }

  generateRoomReport() {
    const local = this.playerManager.localPlayer;
    const curLevel = this.world.levelRegistry?.getCurrentLevel();
    const roomInfo = this.getCurrentRoomInfo();
    const targetBlock = this.raycaster?.getTargetBlockDebug?.(30);
    const hero = local?.hero || PLAYER_HEROES[local?.colorIndex ?? 0] || PLAYER_HEROES[0];

    return {
      timestamp: new Date().toISOString(),
      level: {
        id: curLevel?.id || this.world.levelRegistry?.currentLevelId || '—',
        name: curLevel?.name || '—',
      },
      room: roomInfo?.name || '—',
      player: {
        coords: {
          x: Number(local?.pos?.x?.toFixed(2) || 0),
          y: Number(local?.pos?.y?.toFixed(2) || 0),
          z: Number(local?.pos?.z?.toFixed(2) || 0),
        },
        yaw: Math.round(((local?.yaw || 0) * 180 / Math.PI) % 360),
        pitch: Math.round((local?.pitch || 0) * 180 / Math.PI),
        hero: hero.name,
        jumpMultiplier: hero.jumpMultiplier,
        speedMultiplier: hero.speedMultiplier,
        isNoclip: !!local?.isNoclip,
        lives: local?.lives ?? 3,
      },
      targetBlock: targetBlock || 'Ninguno',
      doors: (this.world.doors || []).map(d => ({
        id: d.id,
        name: d.name,
        isOpen: this.world.isDoorOpenId ? this.world.isDoorOpenId(d.id) : false,
      })),
      pressurePlates: (this.world.pressurePlates || []).map(p => ({
        id: p.id,
        name: p.name,
        isPressed: !!p.isPressed,
        targetDoorId: p.targetDoorId,
      })),
    };
  }

  exportLevelPropsJson() {
    const curLevel = this.world.levelRegistry?.getCurrentLevel() || {};
    return {
      levelId: curLevel.id,
      name: curLevel.name,
      checkpoints: curLevel.checkpoints || this.world.checkpoints || [],
      doors: curLevel.doors || this.world.doors || [],
      pressurePlates: curLevel.pressurePlates || this.world.pressurePlates || [],
      jumpPads: curLevel.jumpPads || [],
      platforms: curLevel.platforms || [],
    };
  }

  initDev() {
    this.ui.bindDev({
      onEnterShowroom: async () => {
        if (!this.mode) {
          await this.startDevShowroomSession();
        } else {
          this.switchLevel('dev_showroom', this.mode === 'host');
        }
      },
      onExitShowroom: () => {
        this.switchLevel('lobby_tutorial', this.mode === 'host');
      },
      getGameState: () => {
        const local = this.playerManager.localPlayer;
        const curLevel = this.world.levelRegistry?.getCurrentLevel();
        const roomInfo = this.getCurrentRoomInfo();
        const targetBlock = this.raycaster?.getTargetBlockDebug?.(30) || null;
        return {
          inGame: this.mode !== null,
          isHost: this.mode === 'host',
          currentLevelId: this.world.levelRegistry.currentLevelId,
          currentLevel: curLevel ? {
            id: curLevel.id,
            name: curLevel.name,
            checkpoints: curLevel.checkpoints || this.world.checkpoints || [],
            doors: curLevel.doors || this.world.doors || [],
            pressurePlates: curLevel.pressurePlates || this.world.pressurePlates || [],
            spawn: curLevel.spawn || this.world.spawnPoint,
          } : null,
          currentRoom: roomInfo,
          currentHeroIndex: local?.colorIndex ?? 0,
          isNoclip: !!local?.isNoclip,
          coordsOverlayEnabled: !!this.roomDebugOverlay?.enabled,
          targetBlock,
          chapter: {
            currentChapterId: this.chapterRegistry?.currentChapterId || 'capitulo_1',
            currentChapterName: this.chapterRegistry?.getCurrentChapter()?.name || '',
            highestChapterUnlocked: this.chapterRegistry?.progress?.highestChapterUnlocked || 1,
          },
          roomPin: this.network.roomId ? this.network.roomId.replace(NET_CONFIG.ROOM_PREFIX, '') : null,
          joinUrl: this.currentJoinUrl,
          players: this.playerManager.getAllPlayers(),
          localPlayer: local,
          perf: this.network.stats.getPerfSummary(),
          gameplay: {
            altitude: local?.pos?.y || 0,
            maxAltitude: local?.maxAltitude || 0,
            jumpCount: local?.jumpCount || 0,
            jumpPadCount: local?.jumpPadCount || 0,
            checkpoint: local?.checkpoint?.roomName || 'Ninguno',
          },
        };
      },
      onToggleDebug: (enable) => {
        this.network.stats.setEnabled(enable);
      },
      onPrintNetAudit: () => {
        this.network?.printAudit?.();
      },
      onTeleportToRoom: (cpIndex) => {
        const checkpoints = this.world.checkpoints || this.world.levelRegistry?.getCurrentLevel()?.checkpoints;
        if (Array.isArray(checkpoints) && checkpoints[cpIndex]) {
          const cp = checkpoints[cpIndex];
          const respawn = cp.respawn || { x: 12, y: 1.2, z: cp.minZ + 1.5 };
          this.teleportLocalPlayer(respawn.x, respawn.y, respawn.z, cp.yaw);
          this.ui.showHudMessage(`Teletransportado a: ${cp.name}`);
        }
      },
      onTeleportToSpawn: () => {
        const spawn = this.world.spawnPoint || this.world.levelRegistry?.getCurrentLevel()?.spawn || { x: 12, y: 1.2, z: 2.5 };
        this.teleportLocalPlayer(spawn.x, spawn.y, spawn.z, spawn.yaw ?? Math.PI);
        this.ui.showHudMessage('Teletransportado a la entrada del nivel');
      },
      onTeleportToDoor: (doorId) => {
        const door = this.world.doors?.find(d => d.id === doorId);
        if (door) {
          const dz = door.z ?? 11;
          const dx = door.x1 !== undefined ? (door.x1 + (door.x2 ?? door.x1)) / 2 : 11.5;
          const targetZ = dz > (this.playerManager.localPlayer?.pos?.z ?? 0) ? dz - 1.5 : dz + 1.5;
          this.teleportLocalPlayer(dx, 1.2, targetZ);
          this.ui.showHudMessage(`Teletransportado frente a: ${door.name || `Puerta ${doorId}`}`);
        }
      },
      onTeleportToCoords: (x, y, z, yaw) => {
        this.teleportLocalPlayer(x, y, z, yaw);
      },
      onSwitchHero: (colorIndex) => {
        this.setHeroLocal(colorIndex);
      },
      onToggleNoclip: (enable) => {
        const local = this.playerManager.localPlayer;
        if (local) {
          local.isNoclip = !!enable;
          if (local.cancelLavaSinking) local.cancelLavaSinking();
          local.vel.y = 0;
          this.ui.showHudMessage(enable ? '🦅 Modo Vuelo (Noclip) ACTIVADO' : '🚶 Modo Vuelo DESACTIVADO');
        }
      },
      onToggleCoordsOverlay: (enable) => {
        this.roomDebugOverlay?.setEnabled(enable);
        this.ui.showHudMessage(enable ? 'Overlay de coordenadas activado' : 'Overlay de coordenadas oculto');
      },
      onOpenAllDoors: () => {
        this.openAllDoors();
      },
      onResetRoomMechanisms: () => {
        this.resetRoomMechanisms();
      },
      onRestoreHealth: () => {
        this.restoreHealth();
      },
      onCopyRoomReport: () => {
        return this.generateRoomReport();
      },
      onCopyLevelProps: () => {
        return this.exportLevelPropsJson();
      },
    });
  }

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
  }

  /** Alterna 1ª/3ª persona (tecla V o ajustes). Persiste la preferencia. */
  toggleCameraMode() {
    this.setCameraMode(this.cameraMode === 'third' ? 'first' : 'third');
  }

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
  }

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
  }

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
  }

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

  /**
   * Libera todos los recursos WebGL, la escena, renderizadores y controladores del juego.
   */
  dispose() {
    this.loop?.stop?.();
    this.leaveSession?.();
    this.voxelMap?.dispose?.();
    this.chestRenderer?.dispose?.();
    this.doorRenderer?.dispose?.();
    this.pedestalRenderer?.dispose?.();
    this.stairsRenderer?.dispose?.();
    this.heroShowcaseRenderer?.dispose?.();
    this.propShowcaseRenderer?.dispose?.();
    this.pressurePlateRenderer?.dispose?.();
    this.avatars?.dispose?.();
    this.sceneManager?.dispose?.();
  }
}

// Composición modular SRP: VoxelSandboxGame es el núcleo; la lógica vive en mixins temáticos.
Object.assign(
  VoxelSandboxGame.prototype,
  InventoryMixin,
  SessionMixin,
  NetworkCoordinatorMixin
);
