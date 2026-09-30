import { Player } from './Player.js';
import { WORLD_CONFIG } from '../config/constants.js';

export class PlayerManager {
  constructor() {
    this.localPlayer = new Player(-1, WORLD_CONFIG.SPAWN_X, WORLD_CONFIG.SPAWN_Y, WORLD_CONFIG.SPAWN_Z);
    this.players = new Map();
    this.players.set(-1, this.localPlayer);

    this.connToPlayerId = new Map();
    this.nextPlayerId = 1;
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
      if (colorIndex !== undefined) existing.setColorIndex(colorIndex);
      return existing;
    }

    const pid = this.nextPlayerId++;
    const spawnZ = WORLD_CONFIG.SPAWN_Z + 3.0;
    const player = new Player(pid, WORLD_CONFIG.SPAWN_X, WORLD_CONFIG.SPAWN_Y, spawnZ, name, colorIndex);
    player.yaw = Math.PI;

    this.connToPlayerId.set(conn, pid);
    this.players.set(pid, player);
    return player;
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
