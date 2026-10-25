/**
 * CombatSync.js - Sincronización del combate cooperativo con autoridad del host.
 *
 * Modelo listen-server:
 * - El host simula la IA, los proyectiles y TODO el daño (jugadores y enemigos).
 * - Los clientes envían solo su intención de ataque (yaw/pitch) y renderizan los
 *   eventos y snapshots que difunde el host. Nunca aplican daño por su cuenta.
 *
 * El módulo es deliberadamente agnóstico de Three.js y de la UI: recibe callbacks
 * opcionales para poder probarse en Node sin DOM.
 */
import * as CombatProto from './CombatProtocol.js';
import { getWeaponByType, weaponTypeToCode, weaponTypeFromCode } from '../config/combat.js';

const UNKNOWN_ID = 255;

export class CombatSync {
  /**
   * @param {Object} [options]
   * @param {() => (string|null)} [options.getMode] Devuelve 'host', 'client' o null
   * @param {('host'|'client'|null)} [options.mode] Modo por defecto si no hay getMode
   * @param {Object} [options.playerManager]
   * @param {Object} [options.combatManager]
   * @param {Object} [options.enemyManager]
   * @param {Object} [options.world]
   * @param {Object} [options.network]
   * @param {Object} [options.ui]
   * @param {Object} [options.soundManager]
   */
  constructor(options = {}) {
    this.getMode = typeof options.getMode === 'function'
      ? options.getMode
      : () => options.mode || 'host';
    this.playerManager = options.playerManager || null;
    this.combatManager = options.combatManager || null;
    this.enemyManager = options.enemyManager || null;
    this.world = options.world || null;
    this.network = options.network || null;
    this.ui = options.ui || null;
    this.soundManager = options.soundManager || null;

    this._attackSeq = 0;
    this._enemySeq = 0;
    this._lastAttackSeq = new Map();
  }

  /**
   * Registra los listeners de red del combate. Se invoca una sola vez tras crear
   * NetworkManager; los eventos llegan desde IncomingMixin (player-attack,
   * combat-event, enemy-snapshot).
   * @param {Object} network
   */
  bindNetwork(network) {
    this.network = network || this.network;
    if (!network || typeof network.addEventListener !== 'function') return;

    network.addEventListener('player-attack', (e) => {
      this.handlePlayerAttack(e.detail, e.detail?.conn);
    });
    network.addEventListener('combat-event', (e) => {
      this.handleCombatEvent(e.detail);
    });
    network.addEventListener('enemy-snapshot', (e) => {
      this.applyEnemySnapshot(e.detail);
    });
  }

  isHost() {
    return this.getMode() === 'host';
  }

  localPlayerId() {
    return this.playerManager?.localPlayer?.id ?? -1;
  }

  // ═══════════════════════════════════════════════════════════
  // CLIENTE: intención de ataque y recepción de estado
  // ═══════════════════════════════════════════════════════════

  /**
   * Envía al host la intención de ataque del jugador local.
   * El cooldown se aplica también en cliente para no inundar la red.
   * @param {Object} player
   * @param {number} [now]
   * @returns {boolean} True si se envió el paquete
   */
  requestAttack(player, now = Date.now()) {
    if (this.getMode() !== 'client' || !player || !this.network) return false;
    if (player.lives !== undefined && player.lives <= 0) return false;
    if (typeof player.canAttack === 'function' && !player.canAttack(now)) return false;
    if (typeof player.triggerAttack === 'function') player.triggerAttack(now);

    this._attackSeq = (this._attackSeq + 1) & 0xFFFF;
    this.network.sendToHost(
      CombatProto.serializePlayerAttack(this._attackSeq, player.yaw || 0, player.pitch || 0)
    );
    return true;
  }

  /**
   * Aplica un evento autoritativo del host en la réplica del cliente.
   * @param {Object} event
   * @returns {Object|null} Enemigo afectado, si aplica
   */
  handleCombatEvent(event) {
    if (!event || this.getMode() === 'host') return null;
    const localId = this.localPlayerId();

    switch (event.kind) {
      case CombatProto.COMBAT_EVENT_KIND.ATTACK:
        this._onRemoteAttack(event, localId);
        return null;

      case CombatProto.COMBAT_EVENT_KIND.HIT_ENEMY: {
        const enemy = this.enemyManager?.applyRemoteHit?.(event.targetId, event.value) || null;
        if (enemy) {
          this.soundManager?.playHit?.(enemy.soundType || 'stone');
          if (event.actorId === localId) {
            this.ui?.showNarrativeMessage?.(
              `:crossed_swords: ¡Golpe a ${enemy.name}! Vida: ${enemy.hp}/${enemy.maxHp}`,
              1400
            );
          }
        }
        return enemy;
      }

      case CombatProto.COMBAT_EVENT_KIND.ENEMY_ATTACK:
        if (event.targetId === localId) {
          const enemy = this.enemyManager?.getByIndex?.(event.actorId);
          this.soundManager?.playHurt?.();
          this.ui?.showNarrativeMessage?.(
            `:shield: ¡${enemy?.name || 'Un enemigo'} te ha golpeado!`,
            1800
          );
        }
        return null;

      case CombatProto.COMBAT_EVENT_KIND.ENEMY_DEFEAT: {
        const enemy = this.enemyManager?.applyRemoteDefeat?.(event.targetId) || null;
        if (enemy && event.actorId === localId) {
          this.soundManager?.playHit?.('iron');
          this.ui?.showNarrativeMessage?.(`:skull: ¡${enemy.name} derrotado!`, 2600);
        }
        return enemy;
      }

      case CombatProto.COMBAT_EVENT_KIND.HIT_DUMMY:
        if (event.actorId === localId) {
          this.soundManager?.playHit?.('wood');
          this.ui?.showNarrativeMessage?.(
            `:swords: ¡Impacto en maniquí! Daño: ${event.value}`,
            1300
          );
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * Aplica un snapshot de enemigos del host a la réplica local.
   * @param {{seq:number, enemies:Array<Object>}} snapshot
   */
  applyEnemySnapshot(snapshot) {
    if (!snapshot || this.getMode() === 'host') return;
    this.enemyManager?.applySnapshot?.(snapshot.enemies || []);
  }

  /**
   * Reproduce un ataque remoto: sonido y proyectil visual (sin daño).
   * @private
   */
  _onRemoteAttack(event, localId) {
    // El atacante local ya reprodujo su animación y sonido de forma predictiva.
    if (event.actorId === localId) return;

    this.soundManager?.playAttack?.();

    const type = weaponTypeFromCode(event.weaponCode);
    const weapon = type ? getWeaponByType(type) : null;
    if (weapon?.category === 'projectile' && this.combatManager?.spawnVisualProjectile) {
      this.combatManager.spawnVisualProjectile(
        {
          id: event.actorId,
          pos: { x: event.x, y: event.y - 1.2, z: event.z },
          yaw: event.yaw,
          pitch: event.pitch,
        },
        weapon
      );
    }
  }

  // ═══════════════════════════════════════════════════════════
  // HOST: resolución autoritativa y difusión
  // ═══════════════════════════════════════════════════════════

  /**
   * Ejecuta el ataque solicitado por un invitado usando la posición autoritativa
   * que el host mantiene para ese jugador. Ignora duplicados y conexiones extrañas.
   * @param {Object} packet { seq, yaw, pitch }
   * @param {Object} conn Conexión del invitado
   * @param {number} [now]
   * @returns {Object|null} Resultado de CombatManager.executePlayerAttack
   */
  handlePlayerAttack(packet, conn, now = Date.now()) {
    if (!this.isHost() || !packet || !conn) return null;

    const player = this.playerManager?.getPlayerByConnection?.(conn);
    if (!player || player.lives <= 0) return null;

    // Anti-duplicados: un mismo seq no puede resolver dos ataques.
    const lastSeq = this._lastAttackSeq.get(player.id);
    if (lastSeq === packet.seq) return null;
    this._lastAttackSeq.set(player.id, packet.seq);

    if (!Number.isFinite(packet.yaw) || !Number.isFinite(packet.pitch)) return null;
    player.yaw = packet.yaw;
    player.pitch = Math.max(-1.5, Math.min(1.5, packet.pitch));

    const result = this.combatManager?.executePlayerAttack?.(player, now, this.world);
    if (result) this.broadcastAttack(player, result);
    return result || null;
  }

  /**
   * Difunde el ataque (sonido/animación/proyectil visual) a todos los clientes.
   * @param {Object} player
   * @param {Object} result
   */
  broadcastAttack(player, result) {
    if (!this.isHost() || !player || !result) return;
    this._broadcast({
      kind: CombatProto.COMBAT_EVENT_KIND.ATTACK,
      actorId: player.id,
      targetId: UNKNOWN_ID,
      weaponCode: weaponTypeToCode(result.weapon?.type),
      x: player.pos.x,
      y: player.pos.y + 1.2,
      z: player.pos.z,
      yaw: player.yaw,
      pitch: player.pitch,
      value: 0,
    });
  }

  /**
   * Notifica un impacto confirmado sobre un enemigo.
   * @param {Object} hit Resultado de EnemyManager.applyDamage
   */
  broadcastEnemyHit(hit) {
    if (!this.isHost() || !hit?.enemy) return;
    const index = this._enemyIndex(hit.enemy);
    if (index < 0) return;
    this._broadcast({
      kind: CombatProto.COMBAT_EVENT_KIND.HIT_ENEMY,
      actorId: hit.sourcePlayer?.id ?? UNKNOWN_ID,
      targetId: index,
      weaponCode: weaponTypeToCode(hit.weapon?.type),
      x: hit.enemy.x,
      y: hit.enemy.y,
      z: hit.enemy.z,
      yaw: hit.enemy.yaw,
      pitch: 0,
      value: hit.hp,
    });
  }

  /**
   * Notifica la derrota de un enemigo.
   * @param {Object} enemy
   * @param {Object} [sourcePlayer]
   */
  broadcastEnemyDefeat(enemy, sourcePlayer = null) {
    if (!this.isHost() || !enemy) return;
    const index = this._enemyIndex(enemy);
    if (index < 0) return;
    this._broadcast({
      kind: CombatProto.COMBAT_EVENT_KIND.ENEMY_DEFEAT,
      actorId: sourcePlayer?.id ?? UNKNOWN_ID,
      targetId: index,
      weaponCode: UNKNOWN_ID,
      x: enemy.x,
      y: enemy.y,
      z: enemy.z,
      yaw: enemy.yaw,
      pitch: 0,
      value: 0,
    });
  }

  /**
   * Notifica que un enemigo ha golpeado a un jugador (para sonido/mensaje en su cliente).
   * @param {Object} player
   * @param {number} damage
   * @param {Object} enemy
   */
  broadcastEnemyAttack(player, damage, enemy) {
    if (!this.isHost() || !player || !enemy) return;
    const index = this._enemyIndex(enemy);
    if (index < 0) return;
    this._broadcast({
      kind: CombatProto.COMBAT_EVENT_KIND.ENEMY_ATTACK,
      actorId: index,
      targetId: player.id,
      weaponCode: UNKNOWN_ID,
      x: enemy.x,
      y: enemy.y,
      z: enemy.z,
      yaw: enemy.yaw,
      pitch: 0,
      value: Math.max(1, Math.round(damage || 1)),
    });
  }

  /**
   * Notifica un impacto en maniquí de entrenamiento.
   * @param {Object} hit Resultado de CombatManager.applyDamageToDummy
   */
  broadcastDummyHit(hit) {
    if (!this.isHost() || !hit?.dummy) return;
    const dummies = this.combatManager?.getAllDummies?.() || [];
    const index = dummies.indexOf(hit.dummy);
    if (index < 0) return;
    this._broadcast({
      kind: CombatProto.COMBAT_EVENT_KIND.HIT_DUMMY,
      actorId: hit.sourcePlayer?.id ?? UNKNOWN_ID,
      targetId: index,
      weaponCode: weaponTypeToCode(hit.weapon?.type),
      x: hit.dummy.x,
      y: hit.dummy.y,
      z: hit.dummy.z,
      yaw: 0,
      pitch: 0,
      value: hit.effectiveDamage,
    });
  }

  /**
   * Envía el estado completo de enemigos a un recién llegado.
   * @param {Object} conn
   */
  sendStateTo(conn) {
    if (!this.isHost() || !conn || !this.enemyManager) return;
    const enemies = this.enemyManager.getAllEnemies?.() || [];
    this.network?.sendTo?.(
      conn,
      CombatProto.serializeEnemySnapshot(this._nextEnemySeq(), enemies)
    );
  }

  /**
   * Difunde el snapshot periódico de enemigos por el canal hot.
   */
  broadcastEnemySnapshot() {
    if (!this.isHost() || !this.enemyManager) return;
    const enemies = this.enemyManager.getAllEnemies?.() || [];
    if (enemies.length === 0) return;
    this.network?.broadcastHot?.(
      CombatProto.serializeEnemySnapshot(this._nextEnemySeq(), enemies)
    );
  }

  // ═══════════════════════════════════════════════════════════
  // Utilidades internas
  // ═══════════════════════════════════════════════════════════

  _broadcast(event) {
    if (!this.isHost() || !this.network?.broadcast) return;
    this.network.broadcast(CombatProto.serializeCombatEvent(event));
  }

  _enemyIndex(enemy) {
    const list = this.enemyManager?.getAllEnemies?.() || [];
    return list.indexOf(enemy);
  }

  _nextEnemySeq() {
    this._enemySeq = (this._enemySeq + 1) & 0xFFFF;
    return this._enemySeq;
  }
}
