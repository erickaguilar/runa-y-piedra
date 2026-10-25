/**
 * CombatProtocol.js - Mensajes binarios del combate cooperativo (extensión de Protocol.js).
 *
 * Se mantiene en un módulo aparte porque `Protocol.js` está en la deuda congelada de
 * 500 líneas del guardarraíl. Los opcodes reservados son 0x14, 0x15 y 0x16 (el resto
 * de 0x00..0x13 ya está ocupado por el protocolo de exploración).
 *
 * Canales:
 * - PLAYER_ATTACK (cliente -> host) va por el canal safe: es una intención poco
 *   frecuente (~1/s) y perderla rompería la sensación de respuesta.
 * - COMBAT_EVENT (host -> todos) va por el canal safe para conservar el orden causal
 *   entre impactos, muertes y reapariciones.
 * - ENEMY_SNAPSHOT (host -> todos) va por el canal hot a 10 Hz: un paquete perdido lo
 *   reemplaza el siguiente y el ancho de banda se mantiene por debajo de 1 KB/s.
 */

export const COMBAT_MSG = {
  PLAYER_ATTACK: 0x14,
  COMBAT_EVENT: 0x15,
  ENEMY_SNAPSHOT: 0x16,
};

/** Tipos de evento autoritativo emitidos por el host. */
export const COMBAT_EVENT_KIND = {
  ATTACK: 1,       // Un jugador ejecutó un ataque (origen, arma y dirección)
  HIT_ENEMY: 2,    // Daño confirmado a un enemigo (targetId = índice de enemigo)
  ENEMY_ATTACK: 3, // Un enemigo golpeó a un jugador (targetId = id de jugador)
  ENEMY_DEFEAT: 4, // Enemigo derrotado (targetId = índice de enemigo)
  HIT_DUMMY: 5,    // Impacto en un maniquí de entrenamiento (targetId = índice)
};

/** Orden canónico de estados de enemigo para serializarlos como un byte. */
export const ENEMY_STATE_ORDER = ['idle', 'chase', 'telegraph', 'hurt', 'dead'];

function toView(buf) {
  return buf instanceof DataView
    ? buf
    : (ArrayBuffer.isView(buf)
      ? new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      : new DataView(buf));
}

/**
 * Codifica el estado de un enemigo como índice de ENEMY_STATE_ORDER.
 * @param {string} state
 * @returns {number}
 */
export function encodeEnemyState(state) {
  const index = ENEMY_STATE_ORDER.indexOf(state);
  return index >= 0 ? index : 0;
}

/**
 * Decodifica el estado de un enemigo desde su byte canónico.
 * @param {number} code
 * @returns {string}
 */
export function decodeEnemyState(code) {
  return ENEMY_STATE_ORDER[code] || 'idle';
}

// ==========================================
// 1. PLAYER_ATTACK (cliente -> host)
// [type:1][seq:2][yaw:f32][pitch:f32] -> 11 bytes
// ==========================================
const attackBuffer = new ArrayBuffer(11);
const attackView = new DataView(attackBuffer);

export function serializePlayerAttack(seq = 0, yaw = 0, pitch = 0) {
  attackView.setUint8(0, COMBAT_MSG.PLAYER_ATTACK);
  attackView.setUint16(1, seq & 0xFFFF, true);
  attackView.setFloat32(3, yaw, true);
  attackView.setFloat32(7, pitch, true);
  return attackBuffer;
}

export function deserializePlayerAttack(buf) {
  const v = toView(buf);
  if (v.byteLength < 11) return { seq: 0, yaw: 0, pitch: 0 };
  return {
    seq: v.getUint16(1, true),
    yaw: v.getFloat32(3, true),
    pitch: v.getFloat32(7, true),
  };
}

// ==========================================
// 2. COMBAT_EVENT (host -> todos)
// [type:1][kind:1][actorId:1][targetId:1][weaponCode:1]
// [x:f32][y:f32][z:f32][yaw:f32][pitch:f32][value:1] -> 26 bytes
// ==========================================
export function serializeCombatEvent(event = {}) {
  const buf = new ArrayBuffer(26);
  const v = new DataView(buf);
  v.setUint8(0, COMBAT_MSG.COMBAT_EVENT);
  v.setUint8(1, (event.kind || 0) & 0xFF);
  v.setUint8(2, (event.actorId ?? 255) & 0xFF);
  v.setUint8(3, (event.targetId ?? 255) & 0xFF);
  v.setUint8(4, (event.weaponCode ?? 255) & 0xFF);
  v.setFloat32(5, Number(event.x) || 0, true);
  v.setFloat32(9, Number(event.y) || 0, true);
  v.setFloat32(13, Number(event.z) || 0, true);
  v.setFloat32(17, Number(event.yaw) || 0, true);
  v.setFloat32(21, Number(event.pitch) || 0, true);
  v.setUint8(25, Math.max(0, Math.min(255, event.value ?? 0)) & 0xFF);
  return buf;
}

export function deserializeCombatEvent(buf) {
  const v = toView(buf);
  if (v.byteLength < 26) return null;
  return {
    kind: v.getUint8(1),
    actorId: v.getUint8(2),
    targetId: v.getUint8(3),
    weaponCode: v.getUint8(4),
    x: v.getFloat32(5, true),
    y: v.getFloat32(9, true),
    z: v.getFloat32(13, true),
    yaw: v.getFloat32(17, true),
    pitch: v.getFloat32(21, true),
    value: v.getUint8(25),
  };
}

// ==========================================
// 3. ENEMY_SNAPSHOT (host -> todos, 10 Hz)
// [type:1][seq:2][count:1]
// [ { u8 index, f32 x, f32 y, f32 z, f32 yaw, u8 hp, u8 maxHp, u8 state } * N ] -> 4 + N*20
// ==========================================
export function serializeEnemySnapshot(seq = 0, enemies = []) {
  const list = Array.isArray(enemies) ? enemies : [];
  const buf = new ArrayBuffer(4 + list.length * 20);
  const v = new DataView(buf);
  v.setUint8(0, COMBAT_MSG.ENEMY_SNAPSHOT);
  v.setUint16(1, seq & 0xFFFF, true);
  v.setUint8(3, list.length & 0xFF);

  let o = 4;
  for (let i = 0; i < list.length; i++) {
    const enemy = list[i] || {};
    v.setUint8(o, i & 0xFF); o += 1;
    v.setFloat32(o, Number(enemy.x) || 0, true); o += 4;
    v.setFloat32(o, Number(enemy.y) || 0, true); o += 4;
    v.setFloat32(o, Number(enemy.z) || 0, true); o += 4;
    v.setFloat32(o, Number(enemy.yaw) || 0, true); o += 4;
    v.setUint8(o, Math.max(0, Math.min(255, enemy.hp ?? 0)) & 0xFF); o += 1;
    v.setUint8(o, Math.max(0, Math.min(255, enemy.maxHp ?? 0)) & 0xFF); o += 1;
    v.setUint8(o, encodeEnemyState(enemy.state) & 0xFF); o += 1;
  }
  return buf;
}

export function deserializeEnemySnapshot(buf) {
  const v = toView(buf);
  const seq = v.byteLength >= 4 ? v.getUint16(1, true) : 0;
  const count = v.byteLength >= 4 ? v.getUint8(3) : 0;
  const enemies = [];
  let o = 4;

  for (let i = 0; i < count && o + 20 <= v.byteLength; i++) {
    enemies.push({
      index: v.getUint8(o),
      x: v.getFloat32(o + 1, true),
      y: v.getFloat32(o + 5, true),
      z: v.getFloat32(o + 9, true),
      yaw: v.getFloat32(o + 13, true),
      hp: v.getUint8(o + 17),
      maxHp: v.getUint8(o + 18),
      state: decodeEnemyState(v.getUint8(o + 19)),
    });
    o += 20;
  }
  return { seq, enemies };
}
