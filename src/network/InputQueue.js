/**
 * InputQueue.js - Host-side Jitter Buffer, Rate Limiter and Input Sanitizer
 * 
 * Deserializes and buffers incoming client input packets, isolating network jitter
 * from the simulation loop. Consumes exactly one input per tick at fixed rate,
 * repeating or interpolating if jitter stalls a packet, and sanitizing input vectors.
 */

export class InputQueue {
  constructor({ maxQueueSize = 5 } = {}) {
    this.maxQueueSize = maxQueueSize;
    // Map(conn -> Array<{ seq, dx, dz, yaw, actions, time }>)
    this.queues = new Map();
    // Map(conn -> { seq, dx, dz, yaw, missingTicks })
    this.lastInputs = new Map();
    // Map(conn -> { count, windowStart })
    this.rateLimits = new Map();
  }

  _key(conn) {
    if (!conn) return null;
    return conn.peer || conn;
  }

  enqueue(conn, rawInput) {
    if (!conn) return;
    const key = this._key(conn);

    // 1. Rate Limiting por conexión (máximo 45 inputs/seg para prevenir inundación)
    const now = performance.now();
    let rl = this.rateLimits.get(key);
    if (!rl || (now - rl.windowStart) >= 1000) {
      rl = { count: 0, windowStart: now };
      this.rateLimits.set(key, rl);
    }
    rl.count++;
    if (rl.count > 45) {
      return; // Descartar exceso
    }

    let q = this.queues.get(key);
    if (!q) {
      q = [];
      this.queues.set(key, q);
    }

    // 2. Sanitización de vector de movimiento (Anti-Speedhack y Clamping)
    let dx = Number(rawInput.dx) || 0;
    let dz = Number(rawInput.dz) || 0;
    const mag = Math.hypot(dx, dz);
    if (mag > 1.0) {
      dx /= mag;
      dz /= mag;
    }

    // 3. Normalización angular de Yaw a [-PI, PI]
    let yaw = Number(rawInput.yaw) || 0;
    while (yaw > Math.PI) yaw -= Math.PI * 2;
    while (yaw < -Math.PI) yaw += Math.PI * 2;

    const actions = (Number(rawInput.actions) || 0) & 0xFF;

    const sanitized = {
      seq: (rawInput.seq || 0) & 0xFFFF,
      dx,
      dz,
      yaw,
      actions,
      time: now,
    };

    // Prevenir desbordamiento de cola limitando la profundidad máxima (~166 ms buffer)
    if (q.length >= this.maxQueueSize) {
      q.splice(0, q.length - this.maxQueueSize + 1);
    }

    q.push(sanitized);
  }

  dequeue(conn) {
    if (!conn) return null;
    const key = this._key(conn);

    const q = this.queues.get(key);
    if (q && q.length > 0) {
      const input = q.shift();
      this.lastInputs.set(key, {
        seq: input.seq,
        dx: input.dx,
        dz: input.dz,
        yaw: input.yaw,
        missingTicks: 0,
      });
      return { ...input, isRepeated: false };
    }

    // Si la cola está vacía por jitter de red, reutilizamos el último input
    const last = this.lastInputs.get(key);
    if (last) {
      last.missingTicks = (last.missingTicks || 0) + 1;

      // Tras 30 ticks (~1 seg sin inputs), detener completamente al cliente
      if (last.missingTicks > 30) {
        last.dx = 0;
        last.dz = 0;
        return null;
      }

      // Mantener fuerza completa los primeros 3 ticks (~100-130ms) para absorber micro-jitter
      // A partir del tick 4, aplicar decay de 15% por tick
      if (last.missingTicks > 3) {
        last.dx *= 0.85;
        last.dz *= 0.85;
        if (Math.hypot(last.dx, last.dz) < 0.001) {
          last.dx = 0;
          last.dz = 0;
        }
      }

      return {
        seq: last.seq,
        dx: last.dx,
        dz: last.dz,
        yaw: last.yaw,
        actions: 0, // ¡CRÍTICO! Las acciones NUNCA se repiten en ticks duplicados
        isRepeated: true,
      };
    }

    return null;
  }

  remove(conn) {
    const key = this._key(conn);
    this.queues.delete(key);
    this.lastInputs.delete(key);
    this.rateLimits.delete(key);
    if (key !== conn) {
      this.queues.delete(conn);
      this.lastInputs.delete(conn);
      this.rateLimits.delete(conn);
    }
  }

  clear() {
    this.queues.clear();
    this.lastInputs.clear();
    this.rateLimits.clear();
  }
}
