export const MSG = {
  INPUT:    0x01,
  SNAPSHOT: 0x02,
  BLOCK:    0x03,
  INIT:     0x04,
};

// INPUT: [type][f32 dx][f32 dz][f32 yaw]  -> 13 bytes
export function serializeInput(dx, dz, yaw) {
  const buf = new ArrayBuffer(13);
  const v = new DataView(buf);
  v.setUint8(0, MSG.INPUT);
  v.setFloat32(1, dx, true);
  v.setFloat32(5, dz, true);
  v.setFloat32(9, yaw, true);
  return buf;
}
export function deserializeInput(buf) {
  const v = new DataView(buf);
  return { dx: v.getFloat32(1, true), dz: v.getFloat32(5, true), yaw: v.getFloat32(9, true) };
}

// BLOCK: [type][u8 action][i32 x][i32 y][i32 z] -> 14 bytes
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
  const v = new DataView(buf);
  return { action: v.getUint8(1), x: v.getInt32(2, true), y: v.getInt32(6, true), z: v.getInt32(10, true) };
}

// SNAPSHOT: [type][u8 count][ {u8 id, f32 x, f32 y, f32 z, f32 yaw} * N ] -> 2 + N*17
export function serializeSnapshot(players) {
  const n = players.length;
  const buf = new ArrayBuffer(2 + n * 17);
  const v = new DataView(buf);
  v.setUint8(0, MSG.SNAPSHOT);
  v.setUint8(1, n);
  let o = 2;
  for (const p of players) {
    v.setUint8(o, p.id);            o += 1;
    v.setFloat32(o, p.x, true);     o += 4;
    v.setFloat32(o, p.y, true);     o += 4;
    v.setFloat32(o, p.z, true);     o += 4;
    v.setFloat32(o, p.yaw, true);   o += 4;
  }
  return buf;
}
export function deserializeSnapshot(buf) {
  const v = new DataView(buf);
  const n = v.getUint8(1);
  const out = [];
  let o = 2;
  for (let i = 0; i < n; i++) {
    out.push({
      id:  v.getUint8(o),
      x:   v.getFloat32(o + 1, true),
      y:   v.getFloat32(o + 5, true),
      z:   v.getFloat32(o + 9, true),
      yaw: v.getFloat32(o + 13, true),
    });
    o += 17;
  }
  return out;
}

// INIT: [type][u8 playerId][Uint8Array world data]  (payload variable)
export function serializeInit(blocks, playerId) {
  const buf = new ArrayBuffer(2 + blocks.length);
  const v = new DataView(buf);
  v.setUint8(0, MSG.INIT);
  v.setUint8(1, playerId);
  new Uint8Array(buf, 2).set(blocks);
  return buf;
}
export function deserializeInit(buf) {
  const v = new DataView(buf);
  return { playerId: v.getUint8(1), blocks: new Uint8Array(buf, 2) };
}
