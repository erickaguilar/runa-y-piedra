import { test } from 'node:test';
import assert from 'node:assert/strict';
import { InputQueue } from '../src/network/InputQueue.js';

test('sanitiza vectores (anti-speedhack) y yaw', () => {
  const q = new InputQueue();
  const conn = {};
  q.enqueue(conn, { seq: 1, dx: 3, dz: 4, yaw: Math.PI * 3, actions: 0 });
  const out = q.dequeue(conn);
  assert.ok(Math.hypot(out.dx, out.dz) <= 1.0 + 1e-9);
  assert.ok(out.yaw >= -Math.PI && out.yaw <= Math.PI);
});

test('acciones nunca se repiten en ticks duplicados', () => {
  const q = new InputQueue();
  const conn = {};
  q.enqueue(conn, { seq: 9, dx: 1, dz: 0, yaw: 0, actions: 1 });
  q.dequeue(conn);
  const repeated = q.dequeue(conn);
  assert.equal(repeated.isRepeated, true);
  assert.equal(repeated.actions, 0);
});

test('tras 30 ticks sin inputs devuelve null', () => {
  const q = new InputQueue();
  const conn = {};
  q.enqueue(conn, { seq: 1, dx: 1, dz: 0, yaw: 0, actions: 0 });
  q.dequeue(conn);
  let last = null;
  for (let i = 0; i < 40; i++) last = q.dequeue(conn);
  assert.equal(last, null);
});

test('remove y clear limpian por conexión', () => {
  const q = new InputQueue();
  const a = {}, b = {};
  q.enqueue(a, { seq: 1, dx: 0, dz: 0, yaw: 0, actions: 0 });
  q.enqueue(b, { seq: 1, dx: 0, dz: 0, yaw: 0, actions: 0 });
  q.remove(a);
  assert.equal(q.dequeue(a), null);
  assert.ok(q.dequeue(b));
  q.clear();
  assert.equal(q.dequeue(b), null);
});

test('soporta canales duales WebRTC vinculados por peer id', () => {
  const q = new InputQueue();
  const safeConn = { peer: 'peer-abc-123', label: 'game-safe' };
  const hotConn = { peer: 'peer-abc-123', label: 'game-hot' };

  q.enqueue(hotConn, { seq: 42, dx: 0.5, dz: -0.8, yaw: 1.5, actions: 0 });
  const dequeued = q.dequeue(safeConn);
  assert.ok(dequeued, 'debe desencolar el input enviado por el canal hot usando el canal safe');
  assert.equal(dequeued.seq, 42);
  assert.equal(dequeued.dx, 0.5);
});

