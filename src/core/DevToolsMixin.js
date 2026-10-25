/**
 * DevToolsMixin.js - Herramientas de desarrollo y utilidades del mundo.
 *
 * Composición por mixin sobre `VoxelSandboxGame.prototype`. Los métodos asumen el
 * contexto del juego (`this.world`, `this.ui`, `this.network`, ...).
 */
import * as Proto from '../network/Protocol.js';
import { NET_CONFIG, PLAYER_HEROES } from '../config/constants.js';

export const DevToolsMixin = {
  getCurrentRoomInfo() {
    const local = this.playerManager.localPlayer;
    if (!local) return { id: 'unknown', name: 'Desconocido' };
    const pz = local.pos.z;
    if (Array.isArray(this.world.checkpoints) && this.world.checkpoints.length > 0) {
      const cp = this.world.checkpoints.find(c => pz >= (c.minZ ?? -Infinity) && pz <= (c.maxZ ?? Infinity));
      if (cp) return { id: cp.id, name: cp.name, checkpoint: cp };
    }
    return { id: 'default', name: local.checkpoint?.roomName || 'Zona de Inicio', checkpoint: null };
  },

  teleportLocalPlayer(x, y, z, yaw = null) {
    const local = this.playerManager.localPlayer;
    if (!local) return;
    local.teleport(x, y, z, yaw);
    this.ui.showHudMessage(`Teletransportado a [${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}]`);
  },

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
  },

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
  },

  resetRoomMechanisms() {
    if (Array.isArray(this.world.doors)) {
      for (const d of this.world.doors) {
        this.world.closeDoor(d.id);
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
  },

  restoreHealth() {
    const local = this.playerManager.localPlayer;
    if (!local) return;
    local.resetLives();
    this.ui.updateLives(local.lives, local.maxLives);
    this.ui.showHudMessage(':heart: ¡Salud y vidas restauradas!');
  },

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
  },

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
  },

  toggleFlightMode(enable = null) {
    const local = this.playerManager.localPlayer;
    if (!local) return;
    const nextVal = enable !== null ? !!enable : !local.isNoclip;
    local.isNoclip = nextVal;
    if (local.cancelLavaSinking) local.cancelLavaSinking();
    local.vel.y = 0;
    local.inputFlyY = 0;
    this.input?.setFlightMode?.(nextVal);
    this.ui?.setFlightMode?.(nextVal);
    this.ui.showHudMessage(nextVal ? '🦅 Modo Vuelo (Noclip) ACTIVADO' : '🚶 Modo Vuelo DESACTIVADO');
  },

  /**
   * Crea una sala PvE cooperativa real (con PIN) sobre la arena dev_combatroom.
   * El anfitrión queda como autoridad del combate: simula IA y daño, difunde
   * COMBAT_EVENT/ENEMY_SNAPSHOT y los invitados se unen con el PIN estándar.
   * (Vive aquí porque SessionManager.js está congelado por el guardarraíl de líneas.)
   */
  async startCoopCombatRoomSession() {
    const name = this.ui.playerName || 'Host';
    const colorIndex = Number.isFinite(this.ui.selectedColorIndex) ? this.ui.selectedColorIndex : 0;
    this.playerManager.setLocalProfile(name, colorIndex);

    this.ui.setStatus('Creando arena cooperativa...');
    try {
      const pin = await this.network.host();
      this.mode = 'host';
      this.playerManager.setLocalId(0);
      this.avatars.remove(-1);
      this.lastConnectedPin = pin;

      const hostAddr = localStorage.getItem('dungeon_lan_ip') || window.location.host;
      this.currentJoinUrl = `${window.location.protocol}//${hostAddr}/?join=${pin}&hh=${colorIndex}`;

      this.ui.currentScreen = 'in_game';
      this.ui.hideMenu();
      this.ui.setCrosshairVisible(true);
      this.ui.setActionButtonsVisible(true);
      this.ui.setLivesVisible(true);
      this.resetInventory({ keepGems: false, keepRelics: false });

      const localInit = this.playerManager.localPlayer;
      localInit.resetLives();
      this.ui.updateLives(localInit.lives, localInit.maxLives);
      this.ui.setHasKey(false);

      const hero = PLAYER_HEROES[colorIndex] || PLAYER_HEROES[0];
      this.avatars.setMetadata(0, name, hero.hex || hero.color, hero.id || null);

      // Cargar la arena difundiendo el cambio de nivel a los invitados presentes
      this.switchLevel('dev_combatroom', true);
      this.broadcastRoster();
      this.network.startWorldSnapshot?.(() => this.collectWorldSnapshot?.());

      this.ui.setStatus(`Sala cooperativa PvE activa (PIN: ${pin})`);
      this.ui.showNarrativeMessage(`:swords: Arena cooperativa creada (PIN: ${pin}). Los invitados se unen con el PIN.`, 7000);
    } catch (e) {
      this.mode = null;
      this.ui.setStatus('Error al crear la sala cooperativa: ' + (e?.message || e));
    }
  },

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
      onEnterCombatRoom: async () => {
        if (!this.mode) {
          // Ofrecer sala cooperativa real (PIN, autoridad del host) o la sesión
          // local de desarrollo sin red.
          this.ui.showConfirmDialog({
            title: 'Sala de Combate PvE',
            message: '¿Crear una sala cooperativa (los invitados se unen con el PIN y el anfitrión simula el combate) o una sesión local de desarrollo?',
            confirmText: 'Sala Cooperativa (PIN)',
            cancelText: 'Sesión Local Dev',
            icon: 'swords',
            iconColor: '#dc2626',
            danger: false,
            onConfirm: () => this.startCoopCombatRoomSession(),
            onCancel: () => this.startDevCombatRoomSession(),
          });
          return;
        }
        this.switchLevel('dev_combatroom', this.mode === 'host');
      },
      onExitCombatRoom: () => {
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
        this.toggleFlightMode(enable);
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

};
