/**
 * NetworkCoordinator.js - Coordinador de eventos de red y temporizadores periódicos WebRTC
 * 
 * Centraliza la recepción y despacho de paquetes del protocolo de red
 * (handshake INIT, snapshots @ 20Hz, inputs, interactables, descent,
 * migración de anfitrión, asignación autoritativa de héroes únicos y censos de peers).
 */
import * as Proto from './Protocol.js';
import { NET_CONFIG, PLAYER_HEROES, WORLD_CONFIG } from '../config/constants.js';
import { escapeHtml } from '../ui/Icons.js';
import { electLeader, deriveMigrationPin } from './LeaderElection.js';
import { loadWorldSnapshot, clearWorldSnapshot } from './HostSnapshot.js';

export const NetworkCoordinatorMixin = {
  /** Difunde el roster de peers autoritativo a todos los clientes */
  broadcastRoster() {
    if (this.mode !== 'host') return;
    const roster = this.playerManager.getRoster();
    const hostEntry = roster.find((p) => p.playerId === 0);
    if (hostEntry && !hostEntry.peerId) {
      hostEntry.peerId = this.network.peer?.id || this.network.roomId || 'host';
    }
    const buf = Proto.serializePeerRoster(roster);
    this.network.broadcast(buf);
  },

  initNetworkEvents() {
    this.network.addEventListener('peer-joined', (e) => {
      const conn = e.detail.conn;

      // 0. Control de aforo autoritativo: máximo 5 jugadores por partida
      if (this.playerManager.isFull(NET_CONFIG.MAX_PLAYERS || 5)) {
        console.warn(`[Network] [BLOCKED] Rechazando conexión de ${conn?.peer}: Sala llena (máximo ${NET_CONFIG.MAX_PLAYERS || 5} aventureros).`);
        this.network.sendTo(conn, Proto.serializeHostClosing(NET_CONFIG.CLOSE_REASON?.ROOM_FULL ?? 1));
        setTimeout(() => {
          try { conn.close(); } catch {}
        }, 200);
        return;
      }

      const remotePlayer = this.playerManager.addRemotePlayer(conn);
      if (!remotePlayer) {
        console.warn('[Network] [BLOCKED] No se pudo registrar jugador remoto (aforo completo).');
        return;
      }

      // 1. Enviar INIT con el mapa y el ID asignado
      this.network.sendTo(conn, Proto.serializeInit(this.world.blocks, remotePlayer.id));

      // Sincronizar el nivel actual activo con el cliente que ingresa
      const currentLvl = this.world.levelRegistry.getCurrentLevel();
      if (currentLvl) {
        this.network.sendTo(conn, Proto.serializeLevelChange(currentLvl.id));
      }

      // 2. Enviar metadatos del Host al nuevo jugador
      const local = this.playerManager.localPlayer;
      this.network.sendTo(conn, Proto.serializePlayerMeta(local.id, local.colorIndex, local.name));

      // 3. Enviar metadatos de otros compañeros si los hubiera
      for (const p of this.playerManager.getAllPlayers()) {
        if (p.id !== local.id && p.id !== remotePlayer.id) {
          this.network.sendTo(conn, Proto.serializePlayerMeta(p.id, p.colorIndex, p.name));
        }
      }

      // 4. Sincronizar llaves ya otorgadas (p. ej. si el cofre 1 se abrió antes de unirse)
      for (const p of this.playerManager.getAllPlayers()) {
        if (Array.isArray(p.keys)) {
          for (const keyId of p.keys) {
            this.network.sendTo(conn, Proto.serializeKeyUpdate(p.id, keyId));
          }
        }
      }

      // 5. Sincronizar cofres ya abiertos
      if (Array.isArray(this.world.chests)) {
        for (const c of this.world.chests) {
          if (c.isOpen) {
            this.network.sendTo(conn, Proto.serializeChestOpen(c.id));
          }
        }
      }

      // 5b. Sincronizar puertas y losa ya abiertas (late-join coherente)
      if (this.world.isDoor1Open) {
        this.network.sendTo(conn, Proto.serializeDoorOpen(1));
      }
      if (this.world.isDoor2Open) {
        this.network.sendTo(conn, Proto.serializeDoorOpen(2));
      }
      if (this.world.stairsOpen) {
        this.network.sendTo(conn, Proto.serializeStairsOpen());
      }

      this.avatars.setTarget(
        remotePlayer.id,
        remotePlayer.pos.x,
        remotePlayer.pos.y,
        remotePlayer.pos.z,
        remotePlayer.yaw
      );

      this.ui.updatePartyList(this.playerManager.getAllPlayers());
      this.broadcastRoster();
    });

    this.network.addEventListener('peer-left', (e) => {
      this.inputQueue.remove(e.detail.conn);
      const removedPlayer = this.playerManager.removeByConnection(e.detail.conn);
      if (removedPlayer) {
        this.avatars.remove(removedPlayer.id);
        this.ui.showNarrativeMessage(`:warning: ${escapeHtml(removedPlayer.name)} ha abandonado la partida.`, 4000);
        this.ui.updatePartyList(this.playerManager.getAllPlayers());
        this.broadcastRoster();
      }
    });

    this.network.addEventListener('peer-roster', (e) => {
      const roster = e.detail?.roster;
      if (Array.isArray(roster) && this.mode === 'client') {
        this.ui.updatePartyList(roster.map((r) => ({ id: r.playerId, name: r.name, colorIndex: r.colorIndex })));
      }
    });

    this.network.addEventListener('version-mismatch', (e) => {
      const { hostVersion, clientVersion } = e.detail;
      alert(`Versión de protocolo incompatible.\nHost v${hostVersion} vs Cliente v${clientVersion}.\nPor favor, actualiza tu versión del juego.`);
      window.location.href = window.location.origin + window.location.pathname;
    });

    this.network.addEventListener('host-closing', (e) => {
      const reason = e?.detail?.reason;
      if (reason === (NET_CONFIG.CLOSE_REASON?.ROOM_FULL ?? 1)) {
        this.ui.setStatus('La sala está llena (máximo 5 aventureros)');
        this.ui.showNarrativeMessage(':ban: La sala está llena (máximo 5 jugadores). No se admiten más aventureros.', 6000);
        this.soundManager.playHurt();
        setTimeout(() => {
          this.mode = null;
          this.network.disconnect();
          this.ui.showMenu(this.ui.lastMenuParams || {});
        }, 2500);
        return;
      }

      // Fase 4: Migración de host con elección determinista de líder y snapshot
      const snap = loadWorldSnapshot();
      if (snap && this.mode === 'client') {
        const myPeerId = this.network.peer?.id || '';
        const roster = this.network.peerRoster || [];
        const election = electLeader(roster, myPeerId);

        if (election.isLeader) {
          const migrationPin = deriveMigrationPin(this.lastConnectedPin || this.ui.pinInput || '4821');
          this.ui.showNarrativeMessage(`:crown: Has sido elegido como nuevo Líder de la expedición. Reanudando sala ${migrationPin}...`, 6000);
          this.soundManager.playVictory?.();
          this.resumeAsHostFromSnapshot(snap, migrationPin);
          return;
        } else if (election.leader) {
          const leaderName = election.leader.name || 'el nuevo anfitrión';
          const migrationPin = deriveMigrationPin(this.lastConnectedPin || this.ui.pinInput || '4821');
          this.ui.showNarrativeMessage(`:crown: ${escapeHtml(leaderName)} es el nuevo anfitrión. Reconectando a ${migrationPin}...`, 6000);
          this.soundManager.playHurt();
          setTimeout(() => {
            this.reconnectToMigratedHost(migrationPin);
          }, 1200);
          return;
        }

        // Si no hay otros compañeros en el roster: ofrecer reanudación manual como anfitrión
        this.ui.showNarrativeMessage(':castle: El anfitrión ha abandonado. Puedes reanudar la mazmorra como Host.', 5000);
        this.soundManager.playHurt();
        this.ui.showConfirmDialog({
          title: '¿Reanudar como Anfitrión?',
          message: `El host cerró la partida en ${snap.levelId}. Puedes reanudarla en una nueva sala con puertas/cofres conservados.`,
          confirmText: 'Reanudar como Host',
          cancelText: 'Salir al Menú',
          icon: 'castle',
          iconColor: '#38bdf8',
          danger: false,
          onConfirm: () => this.resumeAsHostFromSnapshot(snap),
          onCancel: () => {
            clearWorldSnapshot();
            this.leaveSession?.();
          },
        });
        return;
      }
      this.ui.showNarrativeMessage(':castle: El anfitrión ha abandonado o cerrado la partida.', 5000);
      setTimeout(() => {
        this.leaveSession?.();
      }, 1500);
    });

    this.network.addEventListener('level-change', (e) => {
      const lvlId = e.detail?.levelId;
      const isGameOver = !!e.detail?.isGameOver;
      if (lvlId) {
        this.switchLevel(lvlId, false, { isGameOver });
      }
    });

    this.network.addEventListener('chapter-select', (e) => {
      const { chapterId } = e.detail || {};
      if (chapterId && this.chapterRegistry) {
        this.chapterRegistry.setCurrentChapter(chapterId);
        const ch = this.chapterRegistry.getChapter(chapterId);
        if (ch) {
          this.ui.showNarrativeMessage(`:map: El anfitrión ha elegido: Capítulo ${ch.number} - ${ch.name}`, 4000);
        }
      }
    });

    this.network.addEventListener('player-meta', (e) => {
      const { playerId, colorIndex, name, conn } = e.detail;

      if (this.mode === 'host') {
        const player = this.playerManager.getPlayerByConnection(conn);
        if (player) {
          // Árbitro autoritativo de raza/héroe único:
          // Si la clase solicitada ya está tomada por otro jugador, asignar la primera disponible
          const uniqueColor = this.playerManager.getAvailableColorIndex(colorIndex, player.id, PLAYER_HEROES.length);
          if (uniqueColor !== colorIndex) {
            const reqHero = PLAYER_HEROES[colorIndex] || PLAYER_HEROES[0];
            const assignedHero = PLAYER_HEROES[uniqueColor] || PLAYER_HEROES[0];
            console.log(`[Host] [INFO] Clase ${reqHero.name} duplicada. Reasignada a ${assignedHero.name} para ${name}.`);
          }
          player.name = name;
          player.colorIndex = uniqueColor;
          const hero = PLAYER_HEROES[uniqueColor] || PLAYER_HEROES[0];
          this.avatars.setMetadata(player.id, name, hero.hex, hero.id || null);
          this.ui.showNarrativeMessage(`:shield: ¡${escapeHtml(name)} (${hero.name}) se unió a la partida!`, 4500);

          // Transmitir metadatos oficiales del jugador a todos los clientes (incluyendo al emisor)
          this.network.broadcast(Proto.serializePlayerMeta(player.id, uniqueColor, name));
          this.ui.updatePartyList(this.playerManager.getAllPlayers());
          this.broadcastRoster();
        }

      } else if (this.mode === 'client') {
        // Evitar procesar metadatos de otros jugadores antes de recibir INIT (cuando localPlayer.id sigue en -1)
        if (this.playerManager.localPlayer.id === -1 && playerId !== 0) {
          return;
        }
        const local = this.playerManager.localPlayer;
        const isLocal = playerId === local.id;
        const oldColor = isLocal ? local.colorIndex : null;

        this.playerManager.updatePlayerMeta(playerId, name, colorIndex);
        const hero = PLAYER_HEROES[colorIndex] || PLAYER_HEROES[0];

        if (isLocal) {
          // Si el Host reasignó la clase por colisión de raza
          if (oldColor !== null && oldColor !== colorIndex) {
            this.ui.selectedColorIndex = colorIndex;
            localStorage.setItem('dungeon_player_color', colorIndex.toString());
            this.ui.showNarrativeMessage(`:warning: Tu clase elegida ya estaba en uso. El anfitrión te asignó: ${hero.name}.`, 5000);
          }
        } else {
          this.avatars.setMetadata(playerId, name, hero.hex, hero.id || null);
          const av = this.avatars.avatars.get(playerId);
          if (av) {
            av.isLocal = false;
            av.mesh.visible = true;
          }
          if (playerId === 0) {
            this.ui.showNarrativeMessage(`:castle: Mazmorra de ${escapeHtml(name)} (${hero.name})`, 4000);
          } else {
            this.ui.showNarrativeMessage(`:shield: ¡${escapeHtml(name)} (${hero.name}) se unió!`, 4000);
          }
        }
        this.ui.updatePartyList(this.playerManager.getAllPlayers());
      }
    });

    this.network.addEventListener('input', (e) => {
      if (this.mode !== 'host') return;
      this.inputQueue.enqueue(e.detail.conn, e.detail);
    });

    this.interaction.bindNetworkEvents();

    this.network.addEventListener('descent', (e) => {
      this.descent.onDescendEvent(e.detail || {});
    });

    this.network.addEventListener('potion-use', (e) => {
      const { playerId, healAmount = 1 } = e.detail || {};
      if (this.mode === 'host') {
        const player = this.playerManager.getPlayer(playerId);
        if (player && player.recoverHeart) {
          player.recoverHeart(healAmount);
        }
      }
    });

    this.network.addEventListener('snapshot', (e) => {
      if (this.mode !== 'client') return;
      const players = Array.isArray(e.detail) ? e.detail : (e.detail?.players || []);
      const simTime = e.detail?.time || performance.now();
      const local = this.playerManager.localPlayer;
      this.reconciler.onSnapshot(simTime, players, local, this.simulation);

      // Posicionamiento inmediato si el avatar remoto aún no se había inicializado
      for (const p of players) {
        if (p.id !== local.id) {
          const remoteAv = this.avatars.avatars.get(p.id);
          if (!remoteAv) {
            this.avatars.setTarget(p.id, p.x, p.y, p.z, p.yaw);
          } else {
            remoteAv.isLocal = false;
            remoteAv.mesh.visible = true;
          }
        }
      }

      // Sincronización autoritativa de vidas desde el host
      const localEntry = players.find(p => p.id === local.id);
      if (localEntry && localEntry.lives !== undefined && localEntry.lives !== local.lives) {
        const wasGameOver = localEntry.lives >= (local.maxLives ?? 3) && local.lives <= 0;
        local.lives = localEntry.lives;
        this.ui.updateLives(local.lives, local.maxLives ?? 3);
        if (wasGameOver) {
          this.soundManager.playGameOver();
          this.ui.showGameOver(local.lives, local.maxLives ?? 3);
          if (typeof this.restoreSavedState === 'function') {
            this.restoreSavedState();
          } else {
            this.resetInventory({ keepGems: false, keepRelics: false });
          }
        }
      }
    });

    this.network.addEventListener('init', (e) => {
      this.world.setFromArray(e.detail.blocks);
      this.voxelMap.rebuildFromWorld();
      this.chestRenderer.loadChests(this.world.chests);
      this.doorRenderer.loadDoors(this.world.doors);
      this.pedestalRenderer.loadPedestals(this.world.objectives, { theme: this.pedestalTheme(), monoliths: this.world.monoliths });
      this.interaction.ensureStairsState();
      if (this.world.isDoor1Open) {
        this.doorRenderer.setOpenInstant(1);
      }
      if (this.world.isDoor2Open) {
        this.doorRenderer.setOpenInstant(2);
      }
      if (Array.isArray(this.world.chests)) {
        for (const c of this.world.chests) {
          if (c.isOpen) {
            this.chestRenderer.setOpenInstant(c.id);
            this.interaction.collectChestLoot(c);
          }
        }
      }
      this.playerManager.setLocalId(e.detail.playerId);
      const local = this.playerManager.localPlayer;
      this.avatars.remove(-1);
      const myAv = this.avatars.avatars.get(local.id);
      if (myAv) {
        myAv.isLocal = true;
        myAv.mesh.visible = (this.cameraMode === 'third');
      }

      // Colocar al jugador invitado en el punto de spawn de invitado (offset +3 en Z)
      const spawnZ = WORLD_CONFIG.SPAWN_Z + 3.0;
      local.pos.x = WORLD_CONFIG.SPAWN_X;
      local.pos.y = WORLD_CONFIG.SPAWN_Y;
      local.pos.z = spawnZ;
      if (local.visualPos) {
        local.visualPos.x = WORLD_CONFIG.SPAWN_X;
        local.visualPos.y = WORLD_CONFIG.SPAWN_Y;
        local.visualPos.z = spawnZ;
      }
      const spawnYaw = this.world?.spawnPoint?.yaw ?? Math.PI;
      local.yaw = spawnYaw;
      local.pitch = 0;
      this.input.yaw = spawnYaw;
      this.input.pitch = 0;

      // El avatar 0 es el anfitrión: asegurar que exista, sea visible y esté en el spawn del anfitrión
      const hostAvatar = this.avatars.ensure(0);
      hostAvatar.isLocal = false;
      hostAvatar.mesh.visible = true;
      hostAvatar.target.x = WORLD_CONFIG.SPAWN_X;
      hostAvatar.target.y = 1.2;
      hostAvatar.target.z = WORLD_CONFIG.SPAWN_Z;
      hostAvatar.current.x = WORLD_CONFIG.SPAWN_X;
      hostAvatar.current.y = 1.2;
      hostAvatar.current.z = WORLD_CONFIG.SPAWN_Z;
      hostAvatar.mesh.position.set(WORLD_CONFIG.SPAWN_X, 1.2, WORLD_CONFIG.SPAWN_Z);

      // Enviar metadatos oficiales del jugador con su ID asignado al host
      this.network.sendToHost(Proto.serializePlayerMeta(local.id, local.colorIndex, local.name));

      // Actualizar lista de miembros de la partida en el cliente
      this.ui.updatePartyList(this.playerManager.getAllPlayers());

      if (this.world.isDoor2Open) {
        this.ui.showNarrativeMessage('Las dos puertas ya están abiertas. El Santuario os espera.', 4000);
      } else if (this.world.isDoor1Open) {
        this.ui.showNarrativeMessage('Puerta 1 abierta. ¡Cruza el Abismo con el botón SALTAR!', 4000);
      }
    });
  },

  initNetworkTimers() {
    // Broadcast de snapshots (Host -> Clientes @ 20 Hz, canal hot unreliable)
    setInterval(() => {
      if (this.mode !== 'host') return;
      this.snapshotSeq = (this.snapshotSeq + 1) & 0xFFFF;
      const snapshots = this.playerManager.getSnapshots();
      this.network.broadcastHot(Proto.serializeSnapshot(this.snapshotSeq, snapshots));

      // Actualizar réplicas visuales en el host
      for (const p of snapshots) {
        if (p.id !== 0) {
          this.avatars.setTarget(p.id, p.x, p.y, p.z, p.yaw);
        }
      }
    }, 1000 / NET_CONFIG.SNAPSHOT_HZ);
  },
};
