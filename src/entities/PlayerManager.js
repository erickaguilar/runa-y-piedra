import { Player } from './Player.js';
import { WORLD_CONFIG, GAME_CONFIG } from '../config/constants.js';

export class PlayerManager {
  constructor(maxPlayers = (GAME_CONFIG?.MAX_PLAYERS ?? 5)) {
    this.maxPlayers = maxPlayers;
    this.localPlayer = new Player(-1, WORLD_CONFIG.SPAWN_X, WORLD_CONFIG.SPAWN_Y, WORLD_CONFIG.SPAWN_Z);
    this.players = new Map();
    this.players.set(-1, this.localPlayer);

    this.connToPlayerId = new Map();
    this.nextPlayerId = 1;
  }

  isFull(max = this.maxPlayers) {
    return this.getAllPlayers().length >= max;
  }

  getTakenColorIndices(excludePlayerId = null) {
    const taken = new Set();
    for (const p of this.players.values()) {
      if (excludePlayerId !== null && p.id === excludePlayerId) continue;
      if (typeof p.colorIndex === 'number' && !isNaN(p.colorIndex)) {
        taken.add(p.colorIndex);
      }
    }
    return taken;
  }

  getAvailableColorIndex(preferredIndex = 0, excludePlayerId = null, maxHeroes = 5) {
    const taken = this.getTakenColorIndices(excludePlayerId);
    if (preferredIndex !== undefined && preferredIndex !== null && !taken.has(preferredIndex)) {
      return preferredIndex;
    }
    for (let i = 0; i < maxHeroes; i++) {
      if (!taken.has(i)) return i;
    }
    return preferredIndex ?? 0;
  }

  setLocalProfile(name, colorIndex) {
    if (name) this.localPlayer.name = name;
    if (colorIndex !== undefined) this.localPlayer.setColorIndex(colorIndex);
  }

  setLocalId(id) {
    this.players.delete(this.localPlayer.id);
    this.localPlayer.id = id;
    this.players.set(id, this.localPlayer);
  }

  addRemotePlayer(conn, name = 'Aventurero', colorIndex = 1) {
    const existing = this.getPlayerByConnection(conn);
    if (existing) {
      this.connToPlayerId.set(conn, existing.id);
      if (name) existing.name = name;
      if (colorIndex !== undefined && colorIndex !== null) existing.setColorIndex(colorIndex);
      if (conn?.peer) existing.peerId = conn.peer;
      return existing;
    }

    if (this.isFull()) {
      return null;
    }

    const pid = this.nextPlayerId++;
    const spawnZ = WORLD_CONFIG.SPAWN_Z + 3.0;
    const resolvedColor = this.getAvailableColorIndex(colorIndex ?? 1, null, 5);
    const player = new Player(pid, WORLD_CONFIG.SPAWN_X, WORLD_CONFIG.SPAWN_Y, spawnZ, name, resolvedColor);
    player.yaw = Math.PI;
    player.peerId = conn?.peer || '';
    player.joinedAt = Date.now();

    this.connToPlayerId.set(conn, pid);
    this.players.set(pid, player);
    return player;
  }

  getRoster() {
    return Array.from(this.players.values()).map(p => ({
      playerId: p.id,
      peerId: p.peerId || '',
      name: p.name || 'Aventurero',
      colorIndex: p.colorIndex ?? 0,
      joinedAt: p.joinedAt || 0
    }));
  }


  updatePlayerMeta(id, name, colorIndex) {
    let player = this.players.get(id);
    if (!player) {
      const spawnZ = id === 0 ? WORLD_CONFIG.SPAWN_Z : WORLD_CONFIG.SPAWN_Z + 3.0;
      player = new Player(id, WORLD_CONFIG.SPAWN_X, WORLD_CONFIG.SPAWN_Y, spawnZ, name || 'Aventurero', colorIndex ?? 0);
      this.players.set(id, player);
    } else {
      if (name) player.name = name;
      if (colorIndex !== undefined) player.setColorIndex(colorIndex);
    }
    return player;
  }

  removeByConnection(conn) {
    let pid = this.connToPlayerId.get(conn);
    let matchedConn = conn;
    if (pid === undefined && conn?.peer) {
      for (const [c, id] of this.connToPlayerId.entries()) {
        if (c?.peer === conn.peer) {
          pid = id;
          matchedConn = c;
          break;
        }
      }
    }
    if (pid === undefined) return null;

    const player = this.players.get(pid);
    this.players.delete(pid);
    this.connToPlayerId.delete(matchedConn);
    this.connToPlayerId.delete(conn);
    return player;
  }

  getPlayerByConnection(conn) {
    let pid = this.connToPlayerId.get(conn);
    if (pid === undefined && conn?.peer) {
      for (const [c, id] of this.connToPlayerId.entries()) {
        if (c?.peer === conn.peer) {
          pid = id;
          break;
        }
      }
    }
    if (pid === undefined) return null;
    return this.players.get(pid) || null;
  }

  getPlayerById(id) {
    return this.players.get(id) || null;
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  getSnapshots() {
    return Array.from(this.players.values()).map(p => p.toSnapshot());
  }
}
