import { Player } from './Player.js';
import { WORLD_CONFIG } from '../config/constants.js';

export class PlayerManager {
  constructor() {
    this.localPlayer = new Player(0, WORLD_CONFIG.SPAWN_X, WORLD_CONFIG.SPAWN_Y, WORLD_CONFIG.SPAWN_Z);
    this.players = new Map();
    this.players.set(0, this.localPlayer);

    this.connToPlayerId = new Map();
    this.nextPlayerId = 1;
  }

  setLocalId(id) {
    this.players.delete(this.localPlayer.id);
    this.localPlayer.id = id;
    this.players.set(id, this.localPlayer);
  }

  addRemotePlayer(conn) {
    const pid = this.nextPlayerId++;
    const spawnZ = WORLD_CONFIG.SPAWN_Z + 3.0;
    const player = new Player(pid, WORLD_CONFIG.SPAWN_X, WORLD_CONFIG.SPAWN_Y, spawnZ);
    player.yaw = Math.PI;

    this.connToPlayerId.set(conn, pid);
    this.players.set(pid, player);
    return player;
  }

  removeByConnection(conn) {
    const pid = this.connToPlayerId.get(conn);
    if (pid === undefined) return null;

    const player = this.players.get(pid);
    this.players.delete(pid);
    this.connToPlayerId.delete(conn);
    return player;
  }

  getPlayerByConnection(conn) {
    const pid = this.connToPlayerId.get(conn);
    if (pid === undefined) return null;
    return this.players.get(pid) || null;
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  getSnapshots() {
    return Array.from(this.players.values()).map(p => p.toSnapshot());
  }
}
