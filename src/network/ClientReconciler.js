/**
 * ClientReconciler.js - Client-Side Prediction, Server Reconciliation & Entity Interpolation
 * 
 * Implements:
 * 1. Client prediction with pending input buffer for 0-latency responsiveness.
 * 2. Server reconciliation on authoritative snapshots (replaying unacknowledged inputs).
 * 3. Snapshot buffer interpolation (~100ms) for silky-smooth remote entity rendering.
 * 4. Diagnostics telemetry (prediction error, inputs in flight, corrections/sec).
 */

import { PHYSICS_CONFIG } from '../config/constants.js';

export class ClientReconciler {
  constructor({
    snapThreshold = 0.09,     // 9 cm (medio tick a ~5m/s) de tolerancia para absorber jitter
    teleportThreshold = 2.5,  // 2.5 m para teleport/reaparición forzada
    interpolationDelayMs = 100, // 100 ms de buffer temporal para entidades remotas
    maxPendingInputs = 120,
  } = {}) {
    this.snapThreshold = snapThreshold;
    this.teleportThreshold = teleportThreshold;
    this.interpolationDelayMs = interpolationDelayMs;
    this.maxPendingInputs = maxPendingInputs;

    // Buffer de inputs locales pendientes de confirmación por el host
    // [{ seq, dt, forward, right, yaw, time }]
    this.pendingInputs = [];

    // Buffer de snapshots para entidades remotas: Map(playerId -> Array<{ time, x, y, z, yaw }>)
    this.remoteSnapshots = new Map();

    // Objeto temporal reutilizable para simulación de repetición (Zero-GC)
    this.ghostPlayer = {
      pos: { x: 0, y: 0, z: 0 },
      vel: { x: 0, y: 0, z: 0 },
      yaw: 0,
      pitch: 0,
      onGround: true,
      inputForward: 0,
      inputRight: 0,
      hero: null,
      setCheckpoint: () => {},
      respawn: () => {},
    };

    // Métricas de diagnóstico
    this.predictionError = 0;
    this.correctionsPerSec = 0;
    this._correctionsWindow = 0;
    this._lastCorrectionResetTime = performance.now();
  }

  recordInput(seq, dt, forward, right, yaw) {
    if (this.pendingInputs.length >= this.maxPendingInputs) {
      this.pendingInputs.shift();
    }
    // Replay determinista forzando dt fijo a 1/TICK_HZ (1/30s)
    const fixedDt = 1 / PHYSICS_CONFIG.TICK_HZ;
    this.pendingInputs.push({
      seq,
      dt: fixedDt,
      forward,
      right,
      yaw,
      time: performance.now(),
    });
  }

  onSnapshot(simTime, players, localPlayer, simulationEngine) {
    if (!localPlayer || !Array.isArray(players)) return;

    // 1. RECONCILIACIÓN DEL JUGADOR LOCAL
    const localEntry = players.find(p => p.id === localPlayer.id);
    if (localEntry) {
      const ackedSeq = localEntry.lastInputSeq || 0;

      // Descartar inputs confirmados por el host
      this.pendingInputs = this.pendingInputs.filter(inp => inp.seq > ackedSeq);

      // Replay desde el estado autoritativo del host inicializando física vertical
      this.ghostPlayer.pos.x = localEntry.x;
      this.ghostPlayer.pos.y = localEntry.y;
      this.ghostPlayer.pos.z = localEntry.z;
      this.ghostPlayer.vel.x = 0;
      this.ghostPlayer.vel.y = localEntry.velY !== undefined ? localEntry.velY : localPlayer.vel.y;
      this.ghostPlayer.vel.z = 0;
      this.ghostPlayer.hero = localPlayer.hero;
      this.ghostPlayer.onGround = localEntry.onGround !== undefined ? localEntry.onGround : localPlayer.onGround;

      for (let i = 0; i < this.pendingInputs.length; i++) {
        const inp = this.pendingInputs[i];
        this.ghostPlayer.inputForward = inp.forward;
        this.ghostPlayer.inputRight = inp.right;
        this.ghostPlayer.yaw = inp.yaw;
        simulationEngine.integratePlayer(this.ghostPlayer, inp.dt);
      }

      // Medir error de predicción entre la repetición y la predicción actual
      const errHoriz = Math.hypot(this.ghostPlayer.pos.x - localPlayer.pos.x, this.ghostPlayer.pos.z - localPlayer.pos.z);
      const errVert = Math.abs(this.ghostPlayer.pos.y - localPlayer.pos.y);
      this.predictionError = Math.hypot(errHoriz, errVert);

      if (this.predictionError > this.teleportThreshold) {
        // Desfase drástico (caída al abismo, respawn o cambio de nivel)
        localPlayer.pos.x = localEntry.x;
        localPlayer.pos.y = localEntry.y;
        localPlayer.pos.z = localEntry.z;
        localPlayer.vel.x = 0;
        localPlayer.vel.y = localEntry.velY !== undefined ? localEntry.velY : 0;
        localPlayer.vel.z = 0;
        localPlayer.onGround = localEntry.onGround !== undefined ? localEntry.onGround : false;
        this.pendingInputs.length = 0;
        this._recordCorrection();
      } else if (this.predictionError > this.snapThreshold) {
        // Corrección suave de predicción acumulada
        localPlayer.pos.x = this.ghostPlayer.pos.x;
        localPlayer.pos.y = this.ghostPlayer.pos.y;
        localPlayer.pos.z = this.ghostPlayer.pos.z;
        localPlayer.vel.y = this.ghostPlayer.vel.y;
        localPlayer.onGround = this.ghostPlayer.onGround;
        this._recordCorrection();
      }
    }

    // 2. BUFFER DE ENTIDADES REMOTAS
    const now = performance.now();
    const packetTime = simTime || now;

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (p.id === localPlayer.id) continue;

      let list = this.remoteSnapshots.get(p.id);
      if (!list) {
        list = [];
        this.remoteSnapshots.set(p.id, list);
      }

      list.push({
        time: packetTime,
        x: p.x,
        y: p.y,
        z: p.z,
        yaw: p.yaw,
      });

      // Mantener los últimos 10 snapshots por entidad
      if (list.length > 10) {
        list.shift();
      }
    }

    this._updateCorrectionRate();
  }

  updateRemoteAvatars(avatarRenderer) {
    if (!avatarRenderer) return;

    const renderTime = performance.now() - this.interpolationDelayMs;

    for (const [id, snapshots] of this.remoteSnapshots.entries()) {
      if (snapshots.length === 0) continue;

      if (snapshots.length === 1) {
        const s = snapshots[0];
        avatarRenderer.setTarget(id, s.x, s.y, s.z, s.yaw);
        continue;
      }

      // Buscar dos snapshots consecutivos que encierren renderTime
      let s0 = null;
      let s1 = null;

      for (let i = snapshots.length - 1; i >= 0; i--) {
        if (snapshots[i].time <= renderTime) {
          s0 = snapshots[i];
          s1 = snapshots[i + 1] || null;
          break;
        }
      }

      if (!s0) {
        // Todos los snapshots son más recientes que renderTime (caso arranque o lag spike)
        const first = snapshots[0];
        avatarRenderer.setTarget(id, first.x, first.y, first.z, first.yaw);
      } else if (!s1) {
        // renderTime es posterior al snapshot más nuevo (hambre de paquetes / jitter de red)
        const last = snapshots[snapshots.length - 1];
        if (snapshots.length >= 2) {
          const prev = snapshots[snapshots.length - 2];
          const dtSnap = (last.time - prev.time) / 1000;
          if (dtSnap > 0.001) {
            // Extrapolación lineal con límite estricto de seguridad de 150 ms
            const overTime = Math.min((renderTime - last.time) / 1000, 0.150);
            const vx = (last.x - prev.x) / dtSnap;
            const vy = (last.y - prev.y) / dtSnap;
            const vz = (last.z - prev.z) / dtSnap;
            avatarRenderer.setTarget(
              id,
              last.x + vx * overTime,
              last.y + vy * overTime,
              last.z + vz * overTime,
              last.yaw
            );
          } else {
            avatarRenderer.setTarget(id, last.x, last.y, last.z, last.yaw);
          }
        } else {
          avatarRenderer.setTarget(id, last.x, last.y, last.z, last.yaw);
        }
      } else {
        // Interpolación temporal exacta entre s0 y s1
        const dt = s1.time - s0.time;
        const alpha = dt > 0 ? Math.max(0, Math.min(1, (renderTime - s0.time) / dt)) : 1.0;

        const x = s0.x + (s1.x - s0.x) * alpha;
        const y = s0.y + (s1.y - s0.y) * alpha;
        const z = s0.z + (s1.z - s0.z) * alpha;

        // Interpolación angular de yaw con distancia circular más corta
        let dyaw = s1.yaw - s0.yaw;
        while (dyaw > Math.PI) dyaw -= Math.PI * 2;
        while (dyaw < -Math.PI) dyaw += Math.PI * 2;
        const yaw = s0.yaw + dyaw * alpha;

        avatarRenderer.setTarget(id, x, y, z, yaw);
      }
    }
  }

  _recordCorrection() {
    this._correctionsWindow++;
  }

  _updateCorrectionRate() {
    const now = performance.now();
    const dt = (now - this._lastCorrectionResetTime) / 1000;
    if (dt >= 1.0) {
      this.correctionsPerSec = Math.round(this._correctionsWindow / dt);
      this._correctionsWindow = 0;
      this._lastCorrectionResetTime = now;
    }
  }

  reset() {
    this.pendingInputs.length = 0;
    this.remoteSnapshots.clear();
    this.predictionError = 0;
    this.correctionsPerSec = 0;
  }

  getStats() {
    return {
      predictionError: this.predictionError,
      inputsInFlight: this.pendingInputs.length,
      correctionsPerSec: this.correctionsPerSec,
    };
  }
}
