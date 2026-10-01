/**
 * Protocol.js - High-Performance Binary Protocol (v2)
 * 
 * Optimized hybrid binary protocol using Zero-GC DataView buffers on hot paths
 * (INPUT at 30 Hz, SNAPSHOT at 20 Hz, PING/PONG at 1 Hz) and structured data
 * for rare game events (DOOR, CHEST, INIT, LEVEL_CHANGE, HOST_CLOSING).
 */

export const PROTOCOL_VERSION = 2;

export const MSG = {
  HANDSHAKE:    0x00,
  INPUT:        0x01, // Client -> Host (hot path: 15 bytes)
  SNAPSHOT:     0x02, // Host -> Clients (hot path: 8 + N*17 bytes)
  BLOCK:        0x03, // Block modifications (14 bytes)
  INIT:         0x04, // World snapshot + player ID assignment (with protocol version)
  DOOR:         0x05, // Door state sync
  PLAYER_META:  0x06, // Player identity & class hero metadata
  CHEST_OPEN:   0x07, // Chest opened event
  PING:         0x08, // Latency probe (5 bytes)
  PONG:         0x09, // Latency reply (5 bytes)
  HOST_CLOSING: 0x0A, // Graceful host disconnect (2 bytes)
  LEVEL_CHANGE: 0x0B, // Dynamic map change in hot state
  KEY:          0x0C, // Key grant sync (host -> clients, rare event)
  PEDESTAL:     0x0D, // Portal altar: request (client->host) & ceremony (host->all)
  DESCENT:      0x0E, // Synced descent: NOW (client->host), START/GO (host->all)
  STAIRS:       0x0F, // Sealed slab: REQ (client->host) & OPEN (host->all)
  POTION:       0x10, // Consumable potion use (client->host)
  WORLD_SNAPSHOT: 0x11, // Host -> all: world state (level + doors + chests, JSON, ~5s)
  PEER_ROSTER:    0x12, // Host -> all: peer list for deterministic leader election
};

export const ACTION_FLAGS = {
  JUMP:     0x01,
  DESTROY:  0x02,
  PLACE:    0x04,
  INTERACT: 0x08,
};

// ==========================================
// 1. INPUT (Hot Path - Zero-GC Buffer Reutilizable v2.2)
// [type:1][seq:2][f32 dx:4][f32 dz:4][f32 yaw:4][u8 actions:1] -> 16 bytes
// ==========================================
const inputBuffer = new ArrayBuffer(16);
const inputView = new DataView(inputBuffer);

export function serializeInput(seq = 0, dx = 0, dz = 0, yaw = 0, actions = 0) {
  inputView.setUint8(0, MSG.INPUT);
  inputView.setUint16(1, seq & 0xFFFF, true);
  inputView.setFloat32(3, dx, true);
  inputView.setFloat32(7, dz, true);
  inputView.setFloat32(11, yaw, true);
  inputView.setUint8(15, actions & 0xFF);
  return inputBuffer;
}

export function deserializeInput(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  if (v.byteLength >= 16) {
    return {
      seq: v.getUint16(1, true),
      dx: v.getFloat32(3, true),
      dz: v.getFloat32(7, true),
      yaw: v.getFloat32(11, true),
      actions: v.getUint8(15),
    };
  }
  if (v.byteLength >= 15) {
    return {
      seq: v.getUint16(1, true),
      dx: v.getFloat32(3, true),
      dz: v.getFloat32(7, true),
      yaw: v.getFloat32(11, true),
      actions: 0,
    };
  }
  // Compatibilidad con paquetes antiguos de 13 bytes sin seq
  return {
    seq: 0,
    dx: v.getFloat32(1, true),
    dz: v.getFloat32(5, true),
    yaw: v.getFloat32(9, true),
    actions: 0,
  };
}

// ==========================================
// 2. SNAPSHOT (Hot Path - Host a Clientes con Ack de Input y Física Vertical)
// [type:1][seq:2][u32 time:4][count:1][ {u8 id, u16 lastInputSeq, f32 x, f32 y, f32 z, f32 yaw, f32 velY, u8 onGround[, u8 lives]} * N ]
// v2.3 añade lives (25 bytes/jugador), con fallback a 24 y 19 para compatibilidad.
// ==========================================
export function serializeSnapshot(seq = 0, players = []) {
  const n = players.length;
  // Cada jugador: id(1) + lastInputSeq(2) + x(4) + y(4) + z(4) + yaw(4) + velY(4) + onGround(1) + lives(1) = 25 bytes
  const buf = new ArrayBuffer(8 + n * 25);
  const v = new DataView(buf);
  v.setUint8(0, MSG.SNAPSHOT);
  v.setUint16(1, seq & 0xFFFF, true);
  v.setUint32(3, (performance.now() | 0) >>> 0, true);
  v.setUint8(7, n);

  let o = 8;
  for (const p of players) {
    v.setUint8(o, p.id);                              o += 1;
    v.setUint16(o, (p.lastInputSeq || 0) & 0xFFFF, true); o += 2;
    v.setFloat32(o, p.x, true);                       o += 4;
    v.setFloat32(o, p.y, true);                       o += 4;
    v.setFloat32(o, p.z, true);                       o += 4;
    v.setFloat32(o, p.yaw, true);                     o += 4;
    v.setFloat32(o, p.velY || 0, true);               o += 4;
    v.setUint8(o, p.onGround ? 1 : 0);                o += 1;
    v.setUint8(o, p.lives ?? 3);                      o += 1;
  }
  return buf;
}

export function deserializeSnapshot(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  const isV2 = v.byteLength >= 8;
  const seq = isV2 ? v.getUint16(1, true) : 0;
  const time = isV2 ? v.getUint32(3, true) : 0;
  const n = isV2 ? v.getUint8(7) : v.getUint8(1);

  // Soporta formato v2.3 (25 bytes con lives), v2.2 (24 bytes con velY y onGround), v2.1 (19 bytes con lastInputSeq) y v2.0 (17 bytes)
  const is25Bytes = (v.byteLength - 8) >= n * 25;
  const is24Bytes = (v.byteLength - 8) >= n * 24;
  const is19Bytes = (v.byteLength - 8) >= n * 19;
  let o = 8;

  const players = [];
  for (let i = 0; i < n; i++) {
    if (is25Bytes) {
      players.push({
        id:           v.getUint8(o),
        lastInputSeq: v.getUint16(o + 1, true),
        x:            v.getFloat32(o + 3, true),
        y:            v.getFloat32(o + 7, true),
        z:            v.getFloat32(o + 11, true),
        yaw:          v.getFloat32(o + 15, true),
        velY:         v.getFloat32(o + 19, true),
        onGround:     v.getUint8(o + 23) === 1,
        lives:        v.getUint8(o + 24),
      });
      o += 25;
    } else if (is24Bytes) {
      players.push({
        id:           v.getUint8(o),
        lastInputSeq: v.getUint16(o + 1, true),
        x:            v.getFloat32(o + 3, true),
        y:            v.getFloat32(o + 7, true),
        z:            v.getFloat32(o + 11, true),
        yaw:          v.getFloat32(o + 15, true),
        velY:         v.getFloat32(o + 19, true),
        onGround:     v.getUint8(o + 23) === 1,
        lives:        3,
      });
      o += 24;
    } else if (is19Bytes) {
      players.push({
        id:           v.getUint8(o),
        lastInputSeq: v.getUint16(o + 1, true),
        x:            v.getFloat32(o + 3, true),
        y:            v.getFloat32(o + 7, true),
        z:            v.getFloat32(o + 11, true),
        yaw:          v.getFloat32(o + 15, true),
        velY:         0,
        onGround:     true,
        lives:        3,
      });
      o += 19;
    } else {
      players.push({
        id:           v.getUint8(o),
        lastInputSeq: 0,
        x:            v.getFloat32(o + 1, true),
        y:            v.getFloat32(o + 5, true),
        z:            v.getFloat32(o + 9, true),
        yaw:          v.getFloat32(o + 13, true),
        velY:         0,
        onGround:     true,
        lives:        3,
      });
      o += 17;
    }
  }
  return { seq, time, players };
}

// ==========================================
// 3. PING & PONG (Medición de RTT / Latencia en caliente)
// ==========================================
const pingBuffer = new ArrayBuffer(5);
const pingView = new DataView(pingBuffer);
export function serializePing(timeMs = 0) {
  pingView.setUint8(0, MSG.PING);
  pingView.setUint32(1, (timeMs | 0) >>> 0, true);
  return pingBuffer;
}
export function deserializePing(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  return { time: v.getUint32(1, true) };
}

const pongBuffer = new ArrayBuffer(5);
const pongView = new DataView(pongBuffer);
export function serializePong(timeMs = 0) {
  pongView.setUint8(0, MSG.PONG);
  pongView.setUint32(1, (timeMs | 0) >>> 0, true);
  return pongBuffer;
}
export function deserializePong(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  return { time: v.getUint32(1, true) };
}

// ==========================================
// 4. INIT & VERIFICACIÓN DE PROTOCOLO
// [type:1][version:1][u8 playerId:1][world bytes...]
// ==========================================
export function serializeInit(blocks, playerId) {
  const buf = new ArrayBuffer(3 + blocks.length);
  const v = new DataView(buf);
  v.setUint8(0, MSG.INIT);
  v.setUint8(1, PROTOCOL_VERSION);
  v.setUint8(2, playerId);
  new Uint8Array(buf, 3).set(blocks);
  return buf;
}

export function deserializeInit(buf) {
  const v = buf instanceof DataView
    ? buf
    : (ArrayBuffer.isView(buf)
      ? new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      : new DataView(buf));
  const version = v.getUint8(1);
  const playerId = v.getUint8(2);
  const blocks = new Uint8Array(v.buffer, v.byteOffset + 3, v.byteLength - 3);
  return { version, playerId, blocks };
}

// ==========================================
// 5. BLOQUES (14 bytes)
// [type:1][action:1][i32 x:4][i32 y:4][i32 z:4]
// ==========================================
export function serializeBlock(action, x, y, z) {
  const buf = new ArrayBuffer(14);
  const v = new DataView(buf);
  v.setUint8(0, MSG.BLOCK);
  v.setUint8(1, action);
  v.setInt32(2, x, true);
  v.setInt32(6, y, true);
  v.setInt32(10, z, true);
  return buf;
}

export function deserializeBlock(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  return { action: v.getUint8(1), x: v.getInt32(2, true), y: v.getInt32(6, true), z: v.getInt32(10, true) };
}

// ==========================================
// 6. PUERTAS & COFRES (2 bytes)
// ==========================================
export function serializeDoorOpen(doorId = 1) {
  const buf = new ArrayBuffer(2);
  const v = new DataView(buf);
  v.setUint8(0, MSG.DOOR);
  v.setUint8(1, doorId);
  return buf;
}
export function deserializeDoorOpen(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  return { doorId: v.byteLength > 1 ? v.getUint8(1) : 1 };
}

export function serializeChestOpen(chestId = 1) {
  const buf = new ArrayBuffer(2);
  const v = new DataView(buf);
  v.setUint8(0, MSG.CHEST_OPEN);
  v.setUint8(1, chestId);
  return buf;
}
export function deserializeChestOpen(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  return { chestId: v.getUint8(1) };
}

// ==========================================
// 7. METADATOS DE JUGADOR & TEXTO
// ==========================================
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function serializePlayerMeta(playerId, colorIndex, name) {
  const nameBytes = textEncoder.encode(name || 'Aventurero');
  const clampedLen = Math.min(nameBytes.length, 24);
  const buf = new ArrayBuffer(4 + clampedLen);
  const v = new DataView(buf);
  v.setUint8(0, MSG.PLAYER_META);
  v.setUint8(1, playerId);
  v.setUint8(2, colorIndex);
  v.setUint8(3, clampedLen);
  new Uint8Array(buf, 4).set(nameBytes.subarray(0, clampedLen));
  return buf;
}

export function deserializePlayerMeta(buf) {
  const v = buf instanceof DataView
    ? buf
    : (ArrayBuffer.isView(buf)
      ? new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      : new DataView(buf));
  const playerId = v.getUint8(1);
  const colorIndex = v.getUint8(2);
  const len = v.getUint8(3);
  const nameBytes = new Uint8Array(v.buffer, v.byteOffset + 4, len);
  const name = textDecoder.decode(nameBytes);
  return { playerId, colorIndex, name };
}

// ==========================================
// 8. CIERRE ORDENADO & CAMBIO DE NIVEL
// ==========================================
export function serializeHostClosing(reason = 0) {
  const buf = new ArrayBuffer(2);
  const v = new DataView(buf);
  v.setUint8(0, MSG.HOST_CLOSING);
  v.setUint8(1, reason);
  return buf;
}

export function deserializeHostClosing(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  return { reason: v.getUint8(1) };
}

export function serializeLevelChange(levelId = 'dungeon_classic', isGameOver = false) {
  const bytes = textEncoder.encode(levelId);
  const buf = new ArrayBuffer(3 + bytes.length);
  const v = new DataView(buf);
  v.setUint8(0, MSG.LEVEL_CHANGE);
  v.setUint8(1, bytes.length);
  v.setUint8(2, isGameOver ? 1 : 0);
  new Uint8Array(buf, 3).set(bytes);
  return buf;
}

export function deserializeLevelChange(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  const len = v.getUint8(1);
  const hasGameOverFlag = v.byteLength >= 3 + len;
  const isGameOver = hasGameOverFlag ? (v.getUint8(2) === 1) : false;
  const offset = hasGameOverFlag ? 3 : 2;
  const idBytes = new Uint8Array(v.buffer, v.byteOffset + offset, len);
  return { levelId: textDecoder.decode(idBytes), isGameOver };
}

// ==========================================
// 9. LLAVES (otorgamiento autoritativo del Host)
// [type:1][u8 playerId:1][u8 len:1][keyId bytes...]
// ==========================================
export function serializeKeyUpdate(playerId = 0, keyId = '') {
  const bytes = textEncoder.encode(keyId);
  const buf = new ArrayBuffer(3 + bytes.length);
  const v = new DataView(buf);
  v.setUint8(0, MSG.KEY);
  v.setUint8(1, playerId);
  v.setUint8(2, bytes.length);
  new Uint8Array(buf, 3).set(bytes);
  return buf;
}

export function deserializeKeyUpdate(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  const playerId = v.getUint8(1);
  const len = v.getUint8(2);
  const idBytes = new Uint8Array(buf, 3, len);
  return { playerId, keyId: textDecoder.decode(idBytes) };
}

// ==========================================
// 11. DESCENSO SINCRONIZADO (escalinata a siguiente mazmorra)
// kind 1 NOW:   [type:1][kind:1] (cliente -> host, "bajar ya")
// kind 2 START: [type:1][kind:1][u8 initiatorId:1][u32 deadline:4][u8 len:1][name] (host -> all)
// kind 3 GO:    [type:1][kind:1][u8 len:1][nextId][u8 len2:1][nextName] (host -> all)
// ==========================================
export const DESCENT_KIND = { NOW: 1, START: 2, GO: 3 };

export function serializeDescentNow() {
  const buf = new ArrayBuffer(2);
  const v = new DataView(buf);
  v.setUint8(0, MSG.DESCENT);
  v.setUint8(1, DESCENT_KIND.NOW);
  return buf;
}

export function serializeDescentStart(initiatorId = 0, byName = '', deadlineMs = 0) {
  const bytes = textEncoder.encode(byName);
  const buf = new ArrayBuffer(8 + bytes.length);
  const v = new DataView(buf);
  v.setUint8(0, MSG.DESCENT);
  v.setUint8(1, DESCENT_KIND.START);
  v.setUint8(2, initiatorId);
  v.setUint32(3, (deadlineMs | 0) >>> 0, true);
  v.setUint8(7, bytes.length);
  new Uint8Array(buf, 8).set(bytes);
  return buf;
}

export function serializeDescentGo(nextLevelId = '', nextName = '') {
  const idBytes = textEncoder.encode(nextLevelId);
  const nameBytes = textEncoder.encode(nextName);
  const buf = new ArrayBuffer(4 + idBytes.length + nameBytes.length);
  const v = new DataView(buf);
  v.setUint8(0, MSG.DESCENT);
  v.setUint8(1, DESCENT_KIND.GO);
  v.setUint8(2, idBytes.length);
  new Uint8Array(buf, 3).set(idBytes);
  v.setUint8(3 + idBytes.length, nameBytes.length);
  new Uint8Array(buf, 4 + idBytes.length).set(nameBytes);
  return buf;
}

export function deserializeDescent(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  const kind = v.byteLength > 1 ? v.getUint8(1) : 0;
  if (kind === DESCENT_KIND.START) {
    const initiatorId = v.getUint8(2);
    const deadline = v.getUint32(3, true);
    const len = v.getUint8(7);
    const byName = textDecoder.decode(new Uint8Array(buf, 8, len));
    return { kind, initiatorId, deadline, byName };
  }
  if (kind === DESCENT_KIND.GO) {
    const idLen = v.getUint8(2);
    const nextLevelId = textDecoder.decode(new Uint8Array(buf, 3, idLen));
    const nameLen = v.getUint8(3 + idLen);
    const nextName = textDecoder.decode(new Uint8Array(buf, 4 + idLen, nameLen));
    return { kind, nextLevelId, nextName };
  }
  return { kind };
}

// ==========================================
// 12. LOSA SELLADA (apertura de escalinata)
// REQ:  [type:1][kind:0] (cliente -> host)
// OPEN: [type:1][kind:1] (host -> todos)
// ==========================================
export const STAIRS_KIND = { REQ: 0, OPEN: 1 };

export function serializeStairsReq() {
  const buf = new ArrayBuffer(2);
  const v = new DataView(buf);
  v.setUint8(0, MSG.STAIRS);
  v.setUint8(1, STAIRS_KIND.REQ);
  return buf;
}

export function serializeStairsOpen() {
  const buf = new ArrayBuffer(2);
  const v = new DataView(buf);
  v.setUint8(0, MSG.STAIRS);
  v.setUint8(1, STAIRS_KIND.OPEN);
  return buf;
}

export function deserializeStairs(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  return { kind: v.byteLength > 1 ? v.getUint8(1) : 0 };
}

// ==========================================
// 10. PEDESTAL PORTAL (altar a siguiente mazmorra)
// Petición (2 bytes): [type:1][u8 objectiveIndex:1] (cliente -> host)
// Ceremonia (variable): [type:1][u8 index:1][u8 isLast:1][u8 len:1][nextLevelId][u8 len2:1][nextName]
// ==========================================
export function serializePedestalRequest(index = 0) {
  const buf = new ArrayBuffer(2);
  const v = new DataView(buf);
  v.setUint8(0, MSG.PEDESTAL);
  v.setUint8(1, index & 0xFF);
  return buf;
}

export function serializePedestalEvent(index = 0, nextLevelId = '', nextName = '', isLast = false) {
  const idBytes = textEncoder.encode(nextLevelId);
  const nameBytes = textEncoder.encode(nextName);
  const buf = new ArrayBuffer(5 + idBytes.length + nameBytes.length);
  const v = new DataView(buf);
  v.setUint8(0, MSG.PEDESTAL);
  v.setUint8(1, index & 0xFF);
  v.setUint8(2, isLast ? 1 : 0);
  v.setUint8(3, idBytes.length);
  new Uint8Array(buf, 4).set(idBytes);
  v.setUint8(4 + idBytes.length, nameBytes.length);
  new Uint8Array(buf, 5 + idBytes.length).set(nameBytes);
  return buf;
}

export function deserializePedestal(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  const index = v.byteLength > 1 ? v.getUint8(1) : 0;
  if (v.byteLength <= 2) return { index, isRequest: true };
  const isLast = v.getUint8(2) === 1;
  const idLen = v.getUint8(3);
  const nextLevelId = textDecoder.decode(new Uint8Array(buf, 4, idLen));
  const nameLen = v.getUint8(4 + idLen);
  const nextName = textDecoder.decode(new Uint8Array(buf, 5 + idLen, nameLen));
  return { index, isRequest: false, isLast, nextLevelId, nextName };
}

// ==========================================
// 13. POCIONES Y CONSUMIBLES
// Uso de poción (3 bytes): [type:1][u8 playerId:1][u8 healAmount:1] (cliente -> host)
// ==========================================
export function serializePotionUse(playerId = 0, healAmount = 1) {
  const buf = new ArrayBuffer(3);
  const v = new DataView(buf);
  v.setUint8(0, MSG.POTION);
  v.setUint8(1, playerId & 0xFF);
  v.setUint8(2, healAmount & 0xFF);
  return buf;
}

export function deserializePotionUse(buf) {
  const v = buf instanceof DataView ? buf : new DataView(buf);
  const playerId = v.byteLength > 1 ? v.getUint8(1) : 0;
  const healAmount = v.byteLength > 2 ? v.getUint8(2) : 1;
  return { playerId, healAmount };
}

// ==========================================
// 14. WORLD SNAPSHOT (estado de mazmorra, ~5s, canal safe)
// [type:1][json bytes...] (host -> todos, raro pero fiable)
// ==========================================
export function serializeWorldSnapshot(snap = {}) {
  const bytes = textEncoder.encode(JSON.stringify(snap));
  const buf = new ArrayBuffer(1 + bytes.length);
  const v = new DataView(buf);
  v.setUint8(0, MSG.WORLD_SNAPSHOT);
  new Uint8Array(buf, 1).set(bytes);
  return buf;
}

export function deserializeWorldSnapshot(buf) {
  const v = buf instanceof DataView
    ? buf
    : (ArrayBuffer.isView(buf)
      ? new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      : new DataView(buf));
  const bytes = new Uint8Array(v.buffer, v.byteOffset + 1, v.byteLength - 1);
  try {
    return JSON.parse(textDecoder.decode(bytes));
  } catch {
    return null;
  }
}

// ==========================================
// 15. PEER ROSTER (lista de aventureros en la sala para migración de host determinista)
// [type:1][json bytes...] (host -> todos, canal safe al conectar/desconectar)
// ==========================================
export function serializePeerRoster(roster = []) {
  const bytes = textEncoder.encode(JSON.stringify(roster));
  const buf = new ArrayBuffer(1 + bytes.length);
  const v = new DataView(buf);
  v.setUint8(0, MSG.PEER_ROSTER);
  new Uint8Array(buf, 1).set(bytes);
  return buf;
}

export function deserializePeerRoster(buf) {
  const v = buf instanceof DataView
    ? buf
    : (ArrayBuffer.isView(buf)
      ? new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      : new DataView(buf));
  const bytes = new Uint8Array(v.buffer, v.byteOffset + 1, v.byteLength - 1);
  try {
    const list = JSON.parse(textDecoder.decode(bytes));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

