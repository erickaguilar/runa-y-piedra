/**
 * InputQueue.js - Host-side Jitter Buffer and Input Sanitizer
 * 
 * Deserializes and buffers incoming client input packets, isolating network jitter
 * from the simulation loop. Consumes exactly one input per tick at fixed rate,
 * repeating or interpolating if jitter stalls a packet, and sanitizing input vectors.
 */

export class InputQueue {
  constructor({ maxQueueSize = 12 } = {}) {
    this.maxQueueSize = maxQueueSize;
    // Map(conn -> Array<{ seq, dx, dz, yaw, timestamp }>)
    this.queues = new Map();
    // Map(conn -> lastDequeuedInput)
    this.lastInputs = new Map();
  }

  enqueue(conn, rawInput) {
    if (!conn) return;

    let q = this.queues.get(conn);
    if (!q) {
      q = [];
      this.queues.set(conn, q);
    }

    // 1. Sanitización de vector de movimiento (Anti-Speedhack y Clamping)
    let dx = Number(rawInput.dx) || 0;
    let dz = Number(rawInput.dz) || 0;
    const mag = Math.hypot(dx, dz);
    if (mag > 1.0) {
      dx /= mag;
      dz /= mag;
    }

    // 2. Normalización angular de Yaw a [-PI, PI]
    let yaw = Number(rawInput.yaw) || 0;
    while (yaw > Math.PI) yaw -= Math.PI * 2;
    while (yaw < -Math.PI) yaw += Math.PI * 2;

    const sanitized = {
      seq: (rawInput.seq || 0) & 0xFFFF,
      dx,
      dz,
      yaw,
      time: performance.now(),
    };

    // Prevenir desbordamiento de cola si el cliente satura el canal
    if (q.length >= this.maxQueueSize) {
      q.shift();
    }

    q.push(sanitized);
  }

  dequeue(conn) {
    if (!conn) return null;

    const q = this.queues.get(conn);
    if (q && q.length > 0) {
      const input = q.shift();
      this.lastInputs.set(conn, input);
      return { ...input, isRepeated: false };
    }

    // Si la cola está vacía por jitter de red, reutilizamos el último input conocido con amortiguación
    const last = this.lastInputs.get(conn);
    if (last) {
      last.dx *= 0.85;
      last.dz *= 0.85;
      if (Math.hypot(last.dx, last.dz) < 0.001) {
        last.dx = 0;
        last.dz = 0;
      }
      return {
        seq: last.seq,
        dx: last.dx,
        dz: last.dz,
        yaw: last.yaw,
        isRepeated: true,
      };
    }

    return null;
  }

  remove(conn) {
    this.queues.delete(conn);
    this.lastInputs.delete(conn);
  }

  clear() {
    this.queues.clear();
    this.lastInputs.clear();
  }
}
