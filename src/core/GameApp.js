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
import { PlayerManager } from '../entities/PlayerManager.js';
import { SimulationEngine } from '../simulation/SimulationEngine.js';
import { InputManager } from '../input/InputManager.js';
import { CameraController } from '../camera/CameraController.js';
import { BlockRaycaster } from '../interaction/BlockRaycaster.js';
import { NetworkManager } from '../network/NetworkManager.js';
import { ClientReconciler } from '../network/ClientReconciler.js';
import { InputQueue } from '../network/InputQueue.js';
import { UIManager } from '../ui/UIManager.js';
import { InteractionController } from '../controllers/InteractionController.js';
import { DescentManager } from '../controllers/DescentManager.js';
import { soundManager } from '../audio/SoundManager.js';
import { InputMode } from '../ui/InputMode.js';
import { saveManager } from '../storage/SaveManager.js';
import { PLAYER_HEROES } from '../config/constants.js';
import { PerfMonitor } from '../perf/PerfMonitor.js';

import { InventoryMixin } from '../controllers/InventoryController.js';
import { SessionMixin } from './SessionManager.js';
import { NetworkCoordinatorMixin } from '../network/NetworkCoordinator.js';
import { AppBootstrapMixin } from './AppBootstrapMixin.js';
import { DevToolsMixin } from './DevToolsMixin.js';
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
      onPlayerWaterEnter: (p) => {
        if (p !== this.playerManager.localPlayer) return;
        this.soundManager.playWaterSplash();
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
      onToggleFlightMode: () => this.toggleFlightMode(),
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
  NetworkCoordinatorMixin,
  AppBootstrapMixin,
  DevToolsMixin
);
