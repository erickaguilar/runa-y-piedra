import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PerfMonitor, PERF_BUDGET } from '../src/perf/PerfMonitor.js';

describe('PerfMonitor - FPS real para presupuesto móvil 60fps', () => {
  it('mide ~60fps con dt de 16.6ms tras 1s de ventana', () => {
    const perf = new PerfMonitor({ windowMs: 1000 });
    for (let i = 0; i < 61; i++) perf.record(1 / 60);
    const { fps } = perf.getStats();
    assert.ok(fps >= 55 && fps <= 65, `FPS esperado ~60, recibido ${fps}`);
  });

  it('mide ~30fps con dt de 33ms', () => {
    const perf = new PerfMonitor({ windowMs: 1000 });
    for (let i = 0; i < 31; i++) perf.record(1 / 30);
    const { fps } = perf.getStats();
    assert.ok(fps >= 25 && fps <= 35, `FPS esperado ~30, recibido ${fps}`);
  });

  it('colores de presupuesto: verde/ámbar/rojo', () => {
    assert.equal(PerfMonitor.fpsColor(60), '#4ade80');
    assert.equal(PerfMonitor.fpsColor(35), '#f59e0b');
    assert.equal(PerfMonitor.fpsColor(20), '#ef4444');
    assert.equal(PerfMonitor.drawCallsColor(20), '#4ade80');
    assert.equal(PerfMonitor.drawCallsColor(PERF_BUDGET.DRAW_CALLS_MAX), '#4ade80');
    assert.equal(PerfMonitor.drawCallsColor(40), '#f59e0b');
    assert.equal(PerfMonitor.drawCallsColor(80), '#ef4444');
  });
});
