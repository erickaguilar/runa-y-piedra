import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Spring } from '../src/ui/Spring.js';

test('snap fija valor y marca settled', () => {
  const s = new Spring(200, 14, 0);
  s.snap(1.5);
  assert.equal(s.update(0.016), 1.5);
  assert.equal(s.isSettled, true);
});

test('set converge al objetivo', () => {
  const s = new Spring(200, 14, 0);
  s.snap(0);
  s.set(1.0);
  let v = 0;
  for (let i = 0; i < 600; i++) v = s.update(1 / 60);
  assert.ok(Math.abs(v - 1.0) < 0.01, `no converge: ${v}`);
  assert.equal(s.isSettled, true);
});

test('resorte con poca amortiguación sobrepasa (overshoot)', () => {
  const s = new Spring(300, 4, 0);
  s.snap(0);
  s.set(1.0);
  let max = 0;
  for (let i = 0; i < 300; i++) max = Math.max(max, s.update(1 / 60));
  assert.ok(max > 1.0, `sin overshoot: ${max}`);
});
