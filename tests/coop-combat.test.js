/**
 * coop-combat.test.js - Sprint cooperativo PvE: protocolo, autoridad del host y réplica de cliente.
 *
 * Modelo listen-server: el host resuelve TODO el daño (ataques de invitados, IA,
 * enemigos); los clientes envían intención de ataque (yaw/pitch + seq) y aplican
 * eventos/snapshots. Estás pruebas cubren el protocolo binario, la deduplicación,
 * la puerta de autoridad en CombatManager y la réplica de enemigos por índice.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import * as CombatProto from '../src/combat/CombatProtocol.js';
import * as Proto from '../src/network/Protocol.js';
import {
  WEAPON_CODE_ORDER,
  WEAPON_TYPES,
  weaponTypeToCode,
  weaponTypeFromCode,
  getWeaponByType,
} from '../src/config/combat.js';
import { CombatSync } from '../src/combat/CombatSync.js';
import { CombatManager } from '../src/combat/CombatManager.js';
import { EnemyManager } from '../src/combat/EnemyManager.js';
import { PlayerManager } from '../src/entities/PlayerManager.js';
import { Player } from '../src/entities/Player.js';

// ── Utilidades de prueba ─────────────────────────────────────────────────────

/** Red falsa que captura paquetes por canal y reparte eventos sin CustomEvent. */
class MockNetwork {
  constructor() {
    this.handlers = new Map();
    this.safe = [];     // broadcast() — eventos fiables
    this.hot = [];      // broadcastHot() — snapshots de enemigos
    this.toHost = [];   // sendToHost() — intención de ataque del cliente
    this.direct = [];   // sendTo(conn, buf) — late joiners
  }

  addEventListener(type, fn) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type).push(fn);
  }

  emit(type, detail) {
    for (const fn of this.handlers.get(type) || []) fn({ detail });
  }

  sendToHost(buf) { this.toHost.push(buf); }
  broadcast(buf) { this.safe.push(buf); }
  broadcastHot(buf) { this.hot.push(buf); }
  sendTo(_conn, buf) { this.direct.push(buf); }
}

/** UI y audio falsos para verificar feedback local del cliente sin DOM. */
function makeFeedback() {
  return {
    messages: [],
    sounds: [],
    hurtCount: 0,
    showNarrativeMessage(msg) { this.messages.push(msg); },
    playHit(type) { this.sounds.push(type); },
    playHurt() { this.hurtCount += 1; },
    playAttack() { this.sounds.push('attack'); },
  };
}

function makeSync(mode, { enemies = 0, dummies = false } = {}) {
  const network = new MockNetwork();
  const enemyManager = new EnemyManager();
  for (let i = 0; i < enemies; i++) {
    enemyManager.spawnEnemy('basalt_skitterer', { x: 8 + i, y: 1.0, z: 25.0 }, `enemy_${i}`);
  }
  const combatManager = new CombatManager({
    enemyManager,
    authoritative: mode !== 'client',
  });
  const ui = makeFeedback();
  const sync = new CombatSync({
    getMode: () => mode,
    playerManager: new PlayerManager(),
    combatManager,
    enemyManager,
    network,
    ui,
    soundManager: ui,
  });
  sync.bindNetwork(network);
  return { network, enemyManager, combatManager, ui, sync };
}

// ── 1. Protocolo binario de combate ──────────────────────────────────────────

test('PLAYER_ATTACK: roundtrip de 11 bytes con opcode 0x14', () => {
  const buf = CombatProto.serializePlayerAttack(517, 1.25, -0.4);
  assert.equal(buf.byteLength, 11);
  assert.equal(new DataView(buf).getUint8(0), 0x14);

  const out = CombatProto.deserializePlayerAttack(buf);
  assert.equal(out.seq, 517);
  assert.ok(Math.abs(out.yaw - 1.25) < 1e-6);
  assert.ok(Math.abs(out.pitch - (-0.4)) < 1e-6);
});

test('PLAYER_ATTACK: buffer corrupto devuelve valores neutros sin lanzar', () => {
  const out = CombatProto.deserializePlayerAttack(new ArrayBuffer(4));
  assert.equal(out.seq, 0);
  assert.equal(out.yaw, 0);
  assert.equal(out.pitch, 0);
});

test('COMBAT_EVENT: roundtrip de 26 bytes con campos preservados', () => {
  const event = {
    kind: CombatProto.COMBAT_EVENT_KIND.HIT_ENEMY,
    actorId: 2,
    targetId: 1,
    weaponCode: 3,
    x: 8.5,
    y: 1.0,
    z: 25.0,
    yaw: 2.5,
    pitch: 0.1,
    value: 2,
  };
  const buf = CombatProto.serializeCombatEvent(event);
  assert.equal(buf.byteLength, 26);
  assert.equal(new DataView(buf).getUint8(0), 0x15);

  const out = CombatProto.deserializeCombatEvent(buf);
  assert.equal(out.kind, event.kind);
  assert.equal(out.actorId, 2);
  assert.equal(out.targetId, 1);
  assert.equal(out.weaponCode, 3);
  assert.ok(Math.abs(out.x - 8.5) < 1e-6);
  assert.ok(Math.abs(out.z - 25.0) < 1e-6);
  assert.equal(out.value, 2);
});

test('COMBAT_EVENT: value se satura al rango [0, 255]', () => {
  const buf = CombatProto.serializeCombatEvent({ kind: 1, value: 300 });
  const out = CombatProto.deserializeCombatEvent(buf);
  assert.equal(out.value, 255);
});

test('ENEMY_SNAPSHOT: roundtrip con bloques de 20 bytes por enemigo', () => {
  const enemies = [
    { x: 1.5, y: 1.0, z: 2.5, yaw: 0.7, hp: 2, maxHp: 3, state: 'chase' },
    { x: 9.5, y: 1.0, z: 26.0, yaw: 3.0, hp: 0, maxHp: 3, state: 'dead' },
  ];
  const buf = CombatProto.serializeEnemySnapshot(7, enemies);
  assert.equal(buf.byteLength, 4 + enemies.length * 20);
  assert.equal(new DataView(buf).getUint8(0), 0x16);

  const out = CombatProto.deserializeEnemySnapshot(buf);
  assert.equal(out.seq, 7);
  assert.equal(out.enemies.length, 2);
  assert.equal(out.enemies[0].index, 0);
  assert.ok(Math.abs(out.enemies[0].x - 1.5) < 1e-6);
  assert.equal(out.enemies[0].hp, 2);
  assert.equal(out.enemies[0].maxHp, 3);
  assert.equal(out.enemies[0].state, 'chase');
  assert.equal(out.enemies[1].index, 1);
  assert.equal(out.enemies[1].state, 'dead');
});

test('ENEMY_SNAPSHOT: lista vacía son solo 4 bytes de cabecera', () => {
  const buf = CombatProto.serializeEnemySnapshot(1, []);
  assert.equal(buf.byteLength, 4);
  const out = CombatProto.deserializeEnemySnapshot(buf);
  assert.equal(out.enemies.length, 0);
});

test('ENEMY_SNAPSHOT: paquete truncado no lanza y devuelve lo íntegro', () => {
  const out = CombatProto.deserializeEnemySnapshot(new ArrayBuffer(6));
  assert.equal(out.enemies.length, 0);
});

test('encodeEnemyState/decodeEnemyState: estados canónicos ida y vuelta', () => {
  for (const state of CombatProto.ENEMY_STATE_ORDER) {
    assert.equal(CombatProto.decodeEnemyState(CombatProto.encodeEnemyState(state)), state);
  }
  assert.equal(CombatProto.decodeEnemyState(99), 'idle');
});

test('Los opcodes de combate no colisionan con el protocolo base', () => {
  const base = new Set(Object.values(Proto.MSG));
  for (const op of Object.values(CombatProto.COMBAT_MSG)) {
    assert.ok(!base.has(op), `opcode 0x${op.toString(16)} colisiona con Protocol.js`);
  }
  assert.ok(CombatProto.COMBAT_MSG.PLAYER_ATTACK > Proto.MSG.CHAPTER_SELECT);
});

// ── 2. Mapping de armas a códigos de red ─────────────────────────────────────

test('weaponTypeToCode/FromCode: ida y vuelta para el orden canónico', () => {
  assert.equal(WEAPON_CODE_ORDER.length, 5);
  WEAPON_CODE_ORDER.forEach((type, code) => {
    assert.equal(weaponTypeToCode(type), code);
    assert.equal(weaponTypeFromCode(code), type);
  });
  assert.equal(weaponTypeToCode('arma_inventada'), 255);
  assert.equal(weaponTypeFromCode(255), '');
});

// ── 3. Cliente: intención de ataque y eventos del host ──────────────────────

test('Cliente: requestAttack envía intención (0x14) y aplica cooldown local', () => {
  const { network, sync } = makeSync('client');
  const player = new Player(1, 0, 1.2, 3, 'Invitado', 1, 0);
  player.lives = 3;

  assert.equal(sync.requestAttack(player, 1000), true);
  assert.equal(network.toHost.length, 1);
  assert.equal(new DataView(network.toHost[0]).getUint8(0), 0x14);
  assert.equal(CombatProto.deserializePlayerAttack(network.toHost[0]).seq, 1);

  // El cooldown del arma del héroe (Ranger: 650ms) rechaza el ataque inmediato
  assert.equal(sync.requestAttack(player, 1100), false);
  assert.equal(network.toHost.length, 1);
  assert.equal(sync.requestAttack(player, 1700), true);
  assert.equal(network.toHost.length, 2);
});

test('Cliente: requestAttack rechaza si está muerto o no es cliente', () => {
  const { sync: client } = makeSync('client');
  const dead = new Player(1, 0, 1.2, 3, 'Invitado', 1, 0);
  dead.lives = 0;
  assert.equal(client.requestAttack(dead, 1000), false);

  const { sync: host } = makeSync('host');
  const alive = new Player(0, 0, 1.2, 3, 'Host', 0, 0);
  assert.equal(host.requestAttack(alive, 1000), false);
});

test('Cliente: HIT_ENEMY aplica vida remota y solo el actor recibe el mensaje', () => {
  const { enemyManager, ui, sync } = makeSync('client', { enemies: 2 });
  const enemy = enemyManager.getByIndex(0);
  assert.equal(enemy.hp, 3);

  // HIT_ENEMY lleva la vida RESTANTE autoritativa (no el daño).
  // Impacto de otro invitado: sin mensaje propio, con feedback de sonido.
  sync.handleCombatEvent({
    kind: CombatProto.COMBAT_EVENT_KIND.HIT_ENEMY,
    actorId: 2,
    targetId: 0,
    weaponCode: 0,
    value: 2,
  });
  assert.equal(enemy.hp, 2);
  assert.equal(ui.messages.length, 0);
  assert.equal(ui.sounds.length, 1);

  // Impacto del propio jugador local: mensaje personal
  sync.handleCombatEvent({
    kind: CombatProto.COMBAT_EVENT_KIND.HIT_ENEMY,
    actorId: sync.localPlayerId(),
    targetId: 0,
    weaponCode: 0,
    value: 1,
  });
  assert.equal(enemy.hp, 1);
  assert.equal(ui.messages.length, 1);
});

test('Cliente: ENEMY_DEFEAT marca muerto y ENEMY_ATTACK solo afecta a la víctima', () => {
  const { enemyManager, ui, sync } = makeSync('client', { enemies: 2 });

  sync.handleCombatEvent({ kind: CombatProto.COMBAT_EVENT_KIND.ENEMY_DEFEAT, actorId: 1, targetId: 0 });
  const dead = enemyManager.getByIndex(0);
  assert.equal(dead.isDead, true);
  assert.equal(dead.state, 'dead');

  const hurtBefore = ui.hurtCount;
  sync.handleCombatEvent({
    kind: CombatProto.COMBAT_EVENT_KIND.ENEMY_ATTACK,
    actorId: 0,
    targetId: sync.localPlayerId(),
    value: 1,
  });
  assert.equal(ui.hurtCount, hurtBefore + 1);
  assert.equal(ui.messages.length, 1);

  sync.handleCombatEvent({ kind: CombatProto.COMBAT_EVENT_KIND.ENEMY_ATTACK, actorId: 0, targetId: 9, value: 1 });
  assert.equal(ui.hurtCount, hurtBefore + 1);
  assert.equal(ui.messages.length, 1);
});

test('Cliente: ATTACK remoto lanza proyectil visual con arma decodificada', () => {
  const { combatManager, sync } = makeSync('client');
  const before = combatManager.projectilePool.projectiles.filter(p => p.active).length;

  sync.handleCombatEvent({
    kind: CombatProto.COMBAT_EVENT_KIND.ATTACK,
    actorId: 3,
    targetId: 255,
    weaponCode: weaponTypeToCode(WEAPON_TYPES.PROJECTILE_ARROW),
    x: 7.5, y: 2.2, z: 20.0,
    yaw: 0,
    pitch: 0,
    value: 0,
  });

  const active = combatManager.projectilePool.projectiles.filter(p => p.active).length;
  assert.equal(active, before + 1);
  // El proyectil visual no aplica daño: la autoridad es del host
  assert.equal(combatManager.authoritative, false);
});

test('Cliente: los snapshots del host posicionan enemigos en la réplica', () => {
  const { enemyManager, sync } = makeSync('client', { enemies: 2 });
  const snapshot = CombatProto.deserializeEnemySnapshot(
    CombatProto.serializeEnemySnapshot(9, [
      { x: 5.5, y: 1.0, z: 7.5, yaw: 1.0, hp: 1, maxHp: 3, state: 'telegraph' },
      { x: 0.0, y: 1.0, z: 0.0, yaw: 0.0, hp: 3, maxHp: 3, state: 'idle' },
    ])
  );
  sync.applyEnemySnapshot(snapshot);

  const e0 = enemyManager.getByIndex(0);
  const e1 = enemyManager.getByIndex(1);
  assert.ok(Math.abs(e0.x - 5.5) < 1e-5);
  assert.equal(e0.state, 'telegraph');
  assert.equal(e1.hp, 3);
});

test('El host ignora los COMBAT_EVENT de la red (es la fuente autoritativa)', () => {
  const { enemyManager, sync } = makeSync('host', { enemies: 1 });
  const enemy = enemyManager.getByIndex(0);
  sync.handleCombatEvent({ kind: CombatProto.COMBAT_EVENT_KIND.HIT_ENEMY, actorId: 1, targetId: 0, value: 1 });
  assert.equal(enemy.hp, 3);
  sync.applyEnemySnapshot(null);
  assert.ok(sync.handleCombatEvent({ kind: CombatProto.COMBAT_EVENT_KIND.HIT_ENEMY, targetId: 0 }) === null);
});

// ── 4. Host: resolución autoritativa y difusión ──────────────────────────────

test('Host: resuelve el ataque del invitado con su posición autoritativa y difunde ATTACK', () => {
  const { network, sync } = makeSync('host');
  const pm = sync.playerManager;
  const conn = { peer: 'peer-guest-1' };
  const guest = pm.addRemotePlayer(conn, 'Invitado', 1);
  guest.pos.x = 12.0;
  guest.pos.z = 27.5;
  guest.attackCooldownMs = 0;

  const result = sync.handlePlayerAttack({ seq: 42, yaw: 1.2, pitch: 0.1 }, conn, 1000);
  assert.ok(result, 'el ataque del invitado debe resolverse en el host');
  assert.equal(guest.yaw, 1.2);
  assert.equal(network.safe.length, 1);

  const out = CombatProto.deserializeCombatEvent(network.safe[0]);
  assert.equal(out.kind, CombatProto.COMBAT_EVENT_KIND.ATTACK);
  assert.equal(out.actorId, guest.id);
  assert.ok(Math.abs(out.yaw - 1.2) < 1e-6);
});

test('Host: deduplica la intención repetida (mismo seq resuelve una sola vez)', () => {
  const { network, sync } = makeSync('host');
  const conn = { peer: 'peer-guest-1' };
  sync.playerManager.addRemotePlayer(conn, 'Invitado', 1);

  assert.ok(sync.handlePlayerAttack({ seq: 7, yaw: 0, pitch: 0 }, conn, 1000));
  assert.equal(sync.handlePlayerAttack({ seq: 7, yaw: 0, pitch: 0 }, conn, 1010), null);
  assert.equal(network.safe.length, 1);
});

test('Host: rechaza ataques de conexiones desconocidas, muertos o con pitch inválido', () => {
  const { network, sync } = makeSync('host');
  const conn = { peer: 'peer-guest-1' };
  const guest = sync.playerManager.addRemotePlayer(conn, 'Invitado', 1);

  assert.equal(sync.handlePlayerAttack({ seq: 1, yaw: 0, pitch: 0 }, { peer: 'fantasma' }, 1000), null);

  guest.lives = 0;
  assert.equal(sync.handlePlayerAttack({ seq: 1, yaw: 0, pitch: 0 }, conn, 1000), null);
  guest.lives = 3;

  // pitch no numérico: rechazado (no hay daño ni broadcast)
  assert.equal(sync.handlePlayerAttack({ seq: 2, yaw: 'x', pitch: NaN }, conn, 1000), null);
  assert.equal(network.safe.length, 0);
});

test('Host: clampa el pitch extremo del invitado antes de resolver', () => {
  const { sync } = makeSync('host');
  const conn = { peer: 'peer-guest-1' };
  const guest = sync.playerManager.addRemotePlayer(conn, 'Invitado', 1);
  guest.attackCooldownMs = 0;
  sync.handlePlayerAttack({ seq: 3, yaw: 0, pitch: 5 }, conn, 1000);
  assert.equal(guest.pitch, 1.5);
});

test('Host: broadcast de hit/defeat/enemy-attack usan el índice de red correcto', () => {
  const { network, enemyManager, sync } = makeSync('host', { enemies: 2 });
  const source = new Player(2, 8, 1.2, 22, 'Arquero', 2, 0);
  const enemy = enemyManager.getByIndex(1);
  const weapon = getWeaponByType(WEAPON_TYPES.MELEE_LIGHT);

  sync.broadcastEnemyHit({ enemy, hp: 1, weapon, sourcePlayer: source });
  const hit = CombatProto.deserializeCombatEvent(network.safe[0]);
  assert.equal(hit.kind, CombatProto.COMBAT_EVENT_KIND.HIT_ENEMY);
  assert.equal(hit.targetId, 1);
  assert.equal(hit.actorId, 2);
  assert.equal(hit.value, 1);

  sync.broadcastEnemyDefeat(enemy, source);
  const defeat = CombatProto.deserializeCombatEvent(network.safe[1]);
  assert.equal(defeat.kind, CombatProto.COMBAT_EVENT_KIND.ENEMY_DEFEAT);
  assert.equal(defeat.targetId, 1);

  const victim = new Player(3, 8, 1.2, 22, 'Víctima', 3, 0);
  sync.broadcastEnemyAttack(victim, 1, enemyManager.getByIndex(0));
  const atk = CombatProto.deserializeCombatEvent(network.safe[2]);
  assert.equal(atk.kind, CombatProto.COMBAT_EVENT_KIND.ENEMY_ATTACK);
  assert.equal(atk.targetId, 3);
  assert.equal(atk.actorId, 0);
});

test('Host: snapshot de enemigos va por el canal hot y late joiner lo recibe por safe', () => {
  const { network, enemyManager, sync } = makeSync('host', { enemies: 2 });

  sync.broadcastEnemySnapshot();
  assert.equal(network.hot.length, 1);
  assert.equal(new DataView(network.hot[0]).getUint8(0), 0x16);
  assert.equal(CombatProto.deserializeEnemySnapshot(network.hot[0]).enemies.length, 2);

  const conn = { peer: 'peer-late-1' };
  sync.sendStateTo(conn);
  assert.equal(network.direct.length, 1);
  assert.equal(CombatProto.deserializeEnemySnapshot(network.direct[0]).enemies.length, 2);
  assert.ok(!enemyManager.getByIndex(0).isDead);
});

// ── 5. Puerta de autoridad en CombatManager ──────────────────────────────────

function fireProjectileAtDummy(combatManager, now = 1000) {
  combatManager.spawnVisualProjectile(
    { id: 3, pos: { x: 7.5, y: 1.0, z: 20.0 }, yaw: 0, pitch: 0 },
    getWeaponByType(WEAPON_TYPES.PROJECTILE_ARROW)
  );
  const dummy = combatManager.getAllDummies().find(d => d.id === 'dummy_light');
  for (let i = 0; i < 30; i++) {
    combatManager.update(0.02, null, now + i * 20);
    if (dummy.totalDamage > 0) break;
  }
  return dummy;
}

test('CombatManager: cliente (authoritative=false) no aplica daño a maniquíes', () => {
  const cm = new CombatManager({ authoritative: false });
  const dummy = fireProjectileAtDummy(cm);
  assert.equal(dummy.totalDamage, 0);
});

test('CombatManager: host (authoritative=true) aplica daño y difunde vía onHit', () => {
  const hits = [];
  const cm = new CombatManager({ authoritative: true, onHit: (h) => hits.push(h) });
  const dummy = fireProjectileAtDummy(cm);
  assert.equal(dummy.totalDamage, 1);
  assert.equal(hits.length, 1);
  assert.equal(cm.setAuthoritative(false), undefined);
  cm.setAuthoritative(false);
  const before = dummy.totalDamage;
  fireProjectileAtDummy(cm, 2000);
  assert.equal(dummy.totalDamage, before);
});

// ── 6. Determinismo de índices de enemigos entre host y cliente ──────────────

test('dev_combatroom: el orden de spawn es idéntico en host y cliente (índices estables)', () => {
  const level = JSON.parse(
    fs.readFileSync(new URL('../src/levels/data/dev_combatroom.json', import.meta.url), 'utf8')
  );
  assert.ok(Array.isArray(level.enemies) && level.enemies.length >= 2);

  const hostReplica = new EnemyManager();
  const clientReplica = new EnemyManager();
  for (const e of level.enemies) {
    hostReplica.spawnEnemy(e.type, e, e.id);
    clientReplica.spawnEnemy(e.type, e, e.id);
  }

  hostReplica.getAllEnemies().forEach((hostEnemy, index) => {
    const clientEnemy = clientReplica.getByIndex(index);
    assert.equal(clientEnemy.id, hostEnemy.id);
  });

  // Un golpe del host en el índice 0 cae en el mismo enemigo del cliente
  const targetId = hostReplica.getAllEnemies()[0].id;
  clientReplica.applyRemoteHit(0, 1);
  assert.equal(clientReplica.getEnemy(targetId).hp, 1);
});
