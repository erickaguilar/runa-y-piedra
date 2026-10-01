/**
 * SessionManager.js - Gestión del ciclo de vida de salas, anfitrión, cliente y migración
 * 
 * Orquesta inicio de partidas como Host, unión con PIN como Cliente,
 * modo Showroom de Desarrollo, transiciones de niveles y migración por caída de líder.
 */
import * as Proto from '../network/Protocol.js';
import { buildWorldSnapshot } from '../network/HostSnapshot.js';
import { WORLD_CONFIG } from '../config/constants.js';
import { escapeHtml } from '../ui/Icons.js';

export const SessionMixin = {
  async startHost(profile = {}) {
    const name = profile.name || 'Host';
    const colorIndex = profile.colorIndex ?? 0;
    this.playerManager.setLocalProfile(name, colorIndex);

    this.ui.setStatus('Creando mazmorra...');
    try {
      const pin = await this.network.host();
      this.mode = 'host';
      this.playerManager.setLocalId(0);
      this.avatars.remove(-1);

      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const hostAddr = isLocal ? (localStorage.getItem('dungeon_lan_ip') || '192.168.100.28:5173') : window.location.host;
      const joinUrl = `${window.location.protocol}//${hostAddr}/?join=${pin}`;
      this.currentJoinUrl = joinUrl;
      this.lastConnectedPin = pin;

      // Entrar directamente a la partida sin segundo modal
      this.ui.currentScreen = 'in_game';
      this.ui.hideMenu();
      this.ui.setCrosshairVisible(true);
      this.ui.setActionButtonsVisible(true);
      this.ui.setLivesVisible(true);
      this.resetInventory({ keepGems: false, keepRelics: false });
      const lvl = this.world.levelRegistry.getCurrentLevel();
      this.ui.setTutorialControlsVisible(lvl?.id === 'lobby_tutorial');
      const localInit = this.playerManager.localPlayer;
      this.input.yaw = Math.PI;
      localInit.yaw = Math.PI;
      localInit.resetLives();
      this.ui.updateLives(localInit.lives, localInit.maxLives);
      this.ui.setHasKey(false);

      this.ui.showNarrativeMessage(`🏰 ${lvl.name} (Sala PIN: ${pin}). Toca ⚙️ para invitar amigos.`, 5500);
      this.broadcastRoster();
      this.network.startWorldSnapshot(() => this.collectWorldSnapshot());
    } catch (e) {
      this.ui.setStatus('Error al crear sala: ' + (e?.message || e));
    }
  },

  async startDevShowroomSession() {
    this.mode = 'host';
    this.playerManager.setLocalId(0);
    this.playerManager.setLocalProfile('Dev Tester', 0);
    this.avatars.remove(-1);

    this.ui.currentScreen = 'in_game';
    this.ui.hideMenu();
    this.ui.setCrosshairVisible(true);
    this.ui.setActionButtonsVisible(true);
    this.ui.setLivesVisible(true);
    this.resetInventory({ keepGems: false, keepRelics: false });

    const localInit = this.playerManager.localPlayer;
    this.input.yaw = Math.PI;
    localInit.yaw = Math.PI;
    localInit.resetLives();
    this.ui.updateLives(localInit.lives, localInit.maxLives);
    this.ui.setHasKey(false);

    // Cargar directamente el nivel dev_showroom sin sincronizar por red
    this.switchLevel('dev_showroom', false);
    this.ui.showNarrativeMessage('🧪 Sesión local iniciada en Showroom de Desarrollo.', 4500);
  },

  switchLevel(levelId, broadcast = true, { isGameOver = false } = {}) {
    const levelData = this.world.levelRegistry.getLevel(levelId);
    if (!levelData) return;
    this.world.levelRegistry.setCurrentLevel(levelId);
    this.world.loadLevel(levelData);
    this.voxelMap.rebuildFromWorld();
    this.chestRenderer.loadChests(this.world.chests);
    this.doorRenderer.loadDoors(this.world.doors);
    this.pedestalRenderer.loadPedestals(this.world.objectives, { theme: this.pedestalTheme(), monoliths: this.world.monoliths });
    this.interaction.ensureStairsState();
    // Reset del descenso sincronizado al cambiar de mapa
    this.descent.reset();

    const spawn = levelData.spawn || { x: WORLD_CONFIG.SPAWN_X, y: 1.2, z: WORLD_CONFIG.SPAWN_Z };
    const allPlayers = this.playerManager.getAllPlayers();
    for (const pl of allPlayers) {
      pl.clearKeys?.();
      const spawnZ = pl.id === 0 ? spawn.z : spawn.z + 3.0;
      pl.setCheckpoint(spawn.x, spawn.y, spawnZ, levelData.name, levelData.id);
      pl.pos.x = spawn.x;
      pl.pos.y = spawn.y;
      pl.pos.z = spawnZ;
      if (pl.visualPos) {
        pl.visualPos.x = spawn.x;
        pl.visualPos.y = spawn.y;
        pl.visualPos.z = spawnZ;
      }
      pl.vel.x = 0;
      pl.vel.y = 0;
      pl.vel.z = 0;
      pl.onGround = true;
      pl.invulnTicks = 90; // 3s de invulnerabilidad garantizada en el nuevo nivel
      // Las vidas se mantienen entre mazmorras a lo largo de todo el capítulo/nivel.
      // Únicamente se restauran si ocurre Game Over (muerte total) y reinicio o retorno al lobby hub.
      if (isGameOver || levelData.id === 'lobby_tutorial') {
        pl.resetLives();
      }
    }

    // Reposicionar avatares visuales al nuevo punto de spawn
    for (const [id, a] of this.avatars.avatars.entries()) {
      const targetZ = id === 0 ? spawn.z : spawn.z + 3.0;
      a.target.x = spawn.x;
      a.target.y = spawn.y;
      a.target.z = targetZ;
      a.current.x = spawn.x;
      a.current.y = spawn.y;
      a.current.z = targetZ;
      a.mesh.position.set(spawn.x, spawn.y, targetZ);
    }

    const local = this.playerManager.localPlayer;
    this.resetInventory({ keepGems: true, keepRelics: true, keepPotions: true });
    this.ui.setLivesVisible(true);
    this.ui.setActionButtonsVisible(true);
    this.ui.setCrosshairVisible(true);
    this.ui.updateLives(local.lives, local.maxLives);
    this.ui.setTutorialControlsVisible(levelData.id === 'lobby_tutorial');
    this.ui.setHasKey(false);
    // Fin de la transición del portal (el velo se retira sobre el nuevo mapa)
    this.ui.hideLevelTransition();
    this.ui.hideNarrativeMessage();

    // Limpiar buffers de reconciliación y cola de inputs para evitar replay cruzado de niveles
    this.reconciler.reset(this.reconciler.lastProcessedSimTime);
    this.inputQueue.clear();

    if (levelData.id === 'dev_showroom') {
      this.ui.showNarrativeMessage('🧪 Showroom de Desarrollo: Galería completa de bloques y físicas.', 5500);
    } else if (levelData.id === 'lobby_tutorial') {
      const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: coarse)').matches
        : false;
      if (!isTouch) {
        this.ui.showNarrativeMessage('🎮 Controles: WASD mover · Click apuntar · Espacio saltar · E interactuar / bajar · V cámara', 7500);
      } else {
        this.ui.showNarrativeMessage('🎯 Practica: salta las losas ámbar, abre el 📦 cofre, usa la 🗝️ llave en la 🚪 puerta, empuja la 🪨 losa y baja.', 6500);
      }
    } else {
      this.ui.showNarrativeMessage(`🏰 Has descendido a: ${levelData.name}`, 3500);
    }

    if (broadcast && this.mode === 'host') {
      this.network.broadcast(Proto.serializeLevelChange(levelId, isGameOver));
    }
  },

  selectCampaignChapter(chapterId) {
    if (this.mode === 'client') {
      this.ui.showNarrativeMessage('Solo el Anfitrión puede seleccionar el capítulo de la expedición.', 3500);
      return false;
    }
    // Si estamos en lobby o práctica local sin haber creado sala de red formal:
    if (!this.mode) {
      this.mode = 'host';
      this.playerManager.setLocalId(0);
      this.avatars.remove(-1);
      this.ui.currentScreen = 'in_game';
      this.ui.setCrosshairVisible(true);
      this.ui.setActionButtonsVisible(true);
    }

    if (chapterId === 'lobby' || chapterId === 'lobby_tutorial') {
      const currentLevel = this.world?.levelRegistry?.currentLevelId;
      if (currentLevel === 'lobby_tutorial') {
        this.ui.showNarrativeMessage('📍 Ya te encuentras en el Campamento Central.', 2500);
        return true;
      }
      this.soundManager.playPedestal();
      this.ui.showNarrativeMessage('🏛️ Regresando al Campamento Central...', 3000);
      setTimeout(() => {
        this.switchLevel('lobby_tutorial', true);
      }, 400);
      return true;
    }
    if (!this.chapterRegistry.isChapterUnlocked(chapterId)) {
      this.ui.showNarrativeMessage('🔒 Este capítulo aún está bloqueado.', 3000);
      return false;
    }
    this.chapterRegistry.setCurrentChapter(chapterId);
    const dungeons = this.chapterRegistry.getDungeonsForChapter(chapterId);
    const firstDungeon = dungeons[0];
    if (!firstDungeon) return false;

    if (this.network && (this.network.connections?.length > 0 || this.network.isHost)) {
      this.network.broadcast(Proto.serializeChapterSelect(chapterId, firstDungeon.id));
    }
    this.soundManager.playPedestal();
    const ch = this.chapterRegistry.getChapter(chapterId);
    this.ui.showNarrativeMessage(`🗺️ Iniciando Capítulo ${ch.number}: ${ch.name}...`, 3500);

    setTimeout(() => {
      this.switchLevel(firstDungeon.id, true);
    }, 400);
    return true;
  },

  /** Fase 2 MVP: foto de mazmorra para host-migration (nivel + puertas + cofres + losa). */
  collectWorldSnapshot() {
    const levelId = this.world.levelRegistry.currentLevelId || 'lobby_tutorial';
    const chapterId = this.chapterRegistry?.currentChapterId || 'capitulo_1';
    const doorsOpen = [];
    if (this.world.isDoor1Open) doorsOpen.push(1);
    if (this.world.isDoor2Open) doorsOpen.push(2);
    if (Array.isArray(this.world.doors)) {
      for (const d of this.world.doors) {
        if (d?.id > 2 && this.doorRenderer?.isDoorOpen?.(d.id)) doorsOpen.push(d.id);
      }
    }
    const chestsOpen = Array.isArray(this.world.chests)
      ? this.world.chests.filter((c) => c?.isOpen).map((c) => c.id)
      : [];
    return buildWorldSnapshot({ levelId, chapterId, doorsOpen, chestsOpen, stairsOpen: !!this.world.stairsOpen });
  },

  applyWorldSnapshot(snap) {
    if (!snap) return false;
    const levelId = snap.levelId || 'lobby_tutorial';
    if (snap.chapterId && this.chapterRegistry) {
      this.chapterRegistry.setCurrentChapter(snap.chapterId);
    }
    this.switchLevel(levelId, false);
    for (const doorId of snap.doorsOpen || []) {
      try {
        this.world.openDoor(doorId);
        this.voxelMap?.openDoor?.(doorId);
        this.doorRenderer?.setOpenInstant?.(doorId);
      } catch { /* puerta inexistente en este nivel */ }
    }
    for (const chestId of snap.chestsOpen || []) {
      try {
        const chestData = this.world.chests?.find((c) => c.id === chestId);
        if (chestData) chestData.isOpen = true;
        this.chestRenderer?.setOpenInstant?.(chestId);
      } catch { /* cofre inexistente */ }
    }
    return true;
  },

  /** Reanuda la mazmorra como nuevo Host tras caída del anterior (sala de migración PIN). */
  async resumeAsHostFromSnapshot(snap, customPin = null) {
    try {
      this.network.disconnect();
      const pin = await this.network.host(customPin);
      this.mode = 'host';
      this.lastConnectedPin = pin;
      this.playerManager.setLocalId(0);
      this.avatars.remove(-1);
      const name = this.playerManager.localPlayer?.name || this.ui.playerName || 'Anfitrión';
      const colorIndex = this.playerManager.localPlayer?.colorIndex ?? this.ui.selectedColorIndex ?? 0;
      this.playerManager.setLocalProfile(name, colorIndex);

      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const hostAddr = isLocal ? (localStorage.getItem('dungeon_lan_ip') || '192.168.100.28:5173') : window.location.host;
      this.currentJoinUrl = `${window.location.protocol}//${hostAddr}/?join=${pin}`;

      this.applyWorldSnapshot(snap);
      this.ui.currentScreen = 'in_game';
      this.ui.hideMenu();
      this.ui.setCrosshairVisible(true);
      this.ui.setActionButtonsVisible(true);
      this.ui.setLivesVisible(true);
      const local = this.playerManager.localPlayer;
      if (local) {
        local.resetLives();
        this.ui.updateLives(local.lives, local.maxLives);
      }
      this.ui.setHasKey(false);
      this.broadcastRoster();
      this.network.startWorldSnapshot(() => this.collectWorldSnapshot());
      this.ui.showNarrativeMessage(`🏰 Mazmorra reanudada como Host (sala migrada: ${pin}). Comparte el enlace desde ⚙️.`, 6000);
    } catch (e) {
      this.ui.showNarrativeMessage('⚠️ No se pudo reanudar como Host: ' + (e?.message || e), 5000);
      this.mode = null;
      window.location.href = window.location.origin + window.location.pathname;
    }
  },

  /** Reconecta automáticamente al nuevo anfitrión electo en la sala derivada de migración */
  async reconnectToMigratedHost(migrationPin) {
    try {
      this.network.disconnect();
      this.ui.showNarrativeMessage(`⏳ Reconectando con el nuevo líder en sala ${migrationPin}...`, 4000);
      const profile = {
        name: this.playerManager.localPlayer?.name || this.ui.playerName || 'Aventurero',
        colorIndex: this.playerManager.localPlayer?.colorIndex ?? this.ui.selectedColorIndex ?? 1,
      };
      await this.joinRoom(migrationPin, profile, 4);
    } catch (e) {
      console.warn('[HostMigration] Fallo al reconectar con el nuevo líder:', e);
      this.ui.showNarrativeMessage('⚠️ No se pudo reconectar con el nuevo anfitrión.', 5000);
      this.ui.showMenu(this.ui.lastMenuParams || {});
    }
  },

  async joinRoom(pin, profile = {}, attempts = 2) {
    if (!/^\d{4}(-M\d*)?$/.test(String(pin))) {
      this.ui.setStatus('PIN inválido (debe contener 4 dígitos)');
      return;
    }
    const name = profile.name || 'Aventurero';
    const colorIndex = profile.colorIndex ?? 0;
    this.playerManager.setLocalProfile(name, colorIndex);

    for (let i = 1; i <= attempts; i++) {
      this.ui.setStatus(i === 1 ? 'Conectando a la mazmorra...' : `Reintentando conexión (${i}/${attempts})...`);
      try {
        await this.network.join(pin, { timeoutMs: 12000 });
        this.mode = 'client';
        this.lastConnectedPin = pin;
        break;
      } catch (e) {
        if (i === attempts) {
          this.ui.setStatus('Error de conexión: ' + (e?.message || e));
          return;
        }
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    this.currentJoinUrl = `${window.location.protocol}//${window.location.host}/?join=${pin}`;
    this.network.stopWorldSnapshot();
    this.ui.currentScreen = 'in_game';
    this.ui.setCrosshairVisible(true);
    this.ui.setActionButtonsVisible(true);
    this.ui.hideMenu();
    this.resetInventory({ keepGems: false, keepRelics: false });
    this.ui.setLivesVisible(true);
    const curLevel = this.world.levelRegistry.getCurrentLevel();
    this.ui.setTutorialControlsVisible(curLevel?.id === 'lobby_tutorial');
    const localCli = this.playerManager.localPlayer;
    localCli.resetLives();
    this.ui.updateLives(localCli.lives, localCli.maxLives);
    this.ui.setHasKey(false);
    this.ui.showNarrativeMessage(`Conectado como ${escapeHtml(name)}. Explorad juntos.`, 5000);
  },
};
