/**
 * ClientReconciler.js - Client-Side Prediction, Server Reconciliation & Entity Interpolation
 * 
 * Implements:
 * 1. Client prediction with pending input buffer for 0-latency responsiveness.
 * 2. Server reconciliation on authoritative snapshots (replaying unacknowledged inputs with action flags).
 * 3. Tri-band correction: tolerance (<0.09m), smooth blend (0.09-1.0m), snap/teleport (>1.0m / >2.5m).
 * 4. Snapshot buffer interpolation (~100ms) with safe linear extrapolation (<=150ms) and visual frozen indicator.
 * 5. Diagnostics telemetry (prediction error, inputs in flight, soft corrections/sec, teleports/sec).
 */

import { PHYSICS_CONFIG } from '../config/constants.js';

export class ClientReconciler {
  constructor({
    snapThreshold = 0.09,     // 9 cm (medio tick a ~5m/s) de tolerancia para absorber jitter
    blendUpperThreshold = 1.0, // 1.0 m: límite para blend suave vs snap instantáneo
    teleportThreshold = 2.5,  // 2.5 m para teleport/reaparición forzada
    interpolationDelayMs = 100, // 100 ms de buffer temporal para entidades remotas
    maxPendingInputs = 120,
  } = {}) {
    this.snapThreshold = snapThreshold;
    this.blendUpperThreshold = blendUpperThreshold;
    this.teleportThreshold = teleportThreshold;
    this.interpolationDelayMs = interpolationDelayMs;
    this.maxPendingInputs = maxPendingInputs;

    // Buffer de inputs locales pendientes de confirmación por el host
    // [{ seq, dt, forward, right, yaw, actions, time }]
    this.pendingInputs = [];

    // Buffer de snapshots para entidades remotas: Map(playerId -> Array<{ time, x, y, z, yaw }>)
    this.remoteSnapshots = new Map();

    // Guarda monotónica de tiempo de simulación para descartar snapshots desordenados
    this.lastProcessedSimTime = 0;

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
      lives: 3,
      maxLives: 3,
      invulnTicks: 0,
      get isInvulnerable() { return this.invulnTicks > 0; },
      setCheckpoint: () => {},
      respawn() {
        this.invulnTicks = 60;
        return { roomName: '' };
      },
      loseLife() { return { lives: this.lives, gameOver: false, ignored: false }; },
      tickInvulnerability() { if (this.invulnTicks > 0) this.invulnTicks--; },
      fullResetToSpawn() { return this.respawn(); },
    };

    // Métricas de diagnóstico
    this.predictionError = 0;
    this.softCorrectionsPerSec = 0;
    this.teleportsPerSec = 0;
    this._softWindow = 0;
    this._teleWindow = 0;
    this._lastCorrectionResetTime = performance.now();
  }

  recordInput(seq, dt, forward, right, yaw, actions = 0) {
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
      actions: actions || 0,
      time: performance.now(),
    });
  }

  onSnapshot(simTime, players, localPlayer, simulationEngine) {
    if (!localPlayer || !Array.isArray(players)) return;

    // 0. Guarda Monotónica: descartar snapshots antiguos si llegan desordenados
    if (simTime && simTime <= this.lastProcessedSimTime) {
      return;
    }
    if (simTime) {
      this.lastProcessedSimTime = simTime;
    }

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

      // Yaw inicial del ghost: usar el último input pendiente para evitar giros hacia atrás
      this.ghostPlayer.yaw = this.pendingInputs.length > 0
        ? this.pendingInputs[this.pendingInputs.length - 1].yaw
        : localEntry.yaw;

      for (let i = 0; i < this.pendingInputs.length; i++) {
        const inp = this.pendingInputs[i];
        this.ghostPlayer.inputForward = inp.forward;
        this.ghostPlayer.inputRight = inp.right;
        this.ghostPlayer.yaw = inp.yaw;
        // Pasa inp.actions para que el ghost ejecute el salto en el tick exacto
        simulationEngine.integratePlayer(this.ghostPlayer, inp.dt, inp.actions || 0);
      }

      // Medir error de predicción entre la repetición y la predicción actual
      const errHoriz = Math.hypot(this.ghostPlayer.pos.x - localPlayer.pos.x, this.ghostPlayer.pos.z - localPlayer.pos.z);
      const errVert = Math.abs(this.ghostPlayer.pos.y - localPlayer.pos.y);
      this.predictionError = Math.hypot(errHoriz, errVert);

      if (this.predictionError > this.teleportThreshold) {
        // Desfase drástico (> 2.5 m): caída al abismo, respawn o cambio de nivel -> Snap forzado lógico y visual
        localPlayer.pos.x = localEntry.x;
        localPlayer.pos.y = localEntry.y;
        localPlayer.pos.z = localEntry.z;
        if (localPlayer.visualPos) {
          localPlayer.visualPos.x = localEntry.x;
          localPlayer.visualPos.y = localEntry.y;
          localPlayer.visualPos.z = localEntry.z;
        }
        if (localEntry.yaw !== undefined) {
          localPlayer.yaw = localEntry.yaw;
          localPlayer.pitch = 0;
        }
        localPlayer.vel.x = 0;
        localPlayer.vel.y = localEntry.velY !== undefined ? localEntry.velY : 0;
        localPlayer.vel.z = 0;
        localPlayer.onGround = localEntry.onGround !== undefined ? localEntry.onGround : false;
        this.pendingInputs.length = 0;
        this._recordTeleport();
        if (typeof this.onTeleport === 'function') {
          this.onTeleport(localEntry);
        }
      } else {
        // En TODAS las zonas de error normal (<= 2.5 m), la posición y velocidad LÓGICA
        // adoptan SIEMPRE e incondicionalmente el resultado exacto del replay autoritativo.
        // Esto garantiza que el baseline de la física jamás congele errores residuales y converja a 0 m.
        localPlayer.pos.x = this.ghostPlayer.pos.x;
        localPlayer.pos.y = this.ghostPlayer.pos.y;
        localPlayer.pos.z = this.ghostPlayer.pos.z;
        localPlayer.vel.x = this.ghostPlayer.vel.x;
        localPlayer.vel.y = this.ghostPlayer.vel.y;
        localPlayer.vel.z = this.ghostPlayer.vel.z;
        localPlayer.onGround = this.ghostPlayer.onGround;

        if (this.predictionError > this.blendUpperThreshold) {
          // Desfase medio-alto (1.0 m a 2.5 m): snap directo también en la posición visual
          // para evitar que la cámara interpole a través de muros o esquinas.
          if (localPlayer.visualPos) {
            localPlayer.visualPos.x = this.ghostPlayer.pos.x;
            localPlayer.visualPos.y = this.ghostPlayer.pos.y;
            localPlayer.visualPos.z = this.ghostPlayer.pos.z;
          }
          this._recordSoftCorrection();
        } else if (this.predictionError > this.snapThreshold) {
          // Desfase suave (0.09 m a 1.0 m):
          // visualPos NO se altera aquí: se aproxima de forma continua en onRender(dt)
          // hacia localPlayer.pos sin saltos ("pops") en la cámara.
          this._recordSoftCorrection();
        }
        // Zona de tolerancia (<= 0.09 m):
        // visualPos no se altera y sigue naturalmente a pos en onRender(dt).
        // No se registran correcciones para no inflar la telemetría ante jitter residual.
      }
    }

    // 2. BUFFER DE ENTIDADES REMOTAS (Timestamp local del cliente para interpolación sin desincronización de reloj)
    const now = performance.now();

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (p.id === localPlayer.id) continue;

      let list = this.remoteSnapshots.get(p.id);
      if (!list) {
        list = [];
        this.remoteSnapshots.set(p.id, list);
      }

      list.push({
        time: now,
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
        avatarRenderer.setFrozen(id, false);
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
        // Todos los snapshots son más recientes que renderTime (caso arranque o buffer rellenándose)
        const first = snapshots[0];
        avatarRenderer.setTarget(id, first.x, first.y, first.z, first.yaw);
        avatarRenderer.setFrozen(id, false);
      } else if (!s1) {
        // renderTime es posterior al snapshot más nuevo (hambre de paquetes / jitter de red)
        const last = snapshots[snapshots.length - 1];
        const isStarved = (renderTime - last.time) > 500;
        avatarRenderer.setFrozen(id, isStarved);

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
        avatarRenderer.setFrozen(id, false);
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

  _recordSoftCorrection() {
    this._softWindow++;
  }

  _recordTeleport() {
    this._teleWindow++;
  }

  _updateCorrectionRate() {
    const now = performance.now();
    const dt = (now - this._lastCorrectionResetTime) / 1000;
    if (dt >= 1.0) {
      this.softCorrectionsPerSec = Math.round(this._softWindow / dt);
      this.teleportsPerSec = Math.round(this._teleWindow / dt);
      this._softWindow = 0;
      this._teleWindow = 0;
      this._lastCorrectionResetTime = now;
    }
  }

  reset(minSimTime = 0) {
    this.pendingInputs.length = 0;
    this.remoteSnapshots.clear();
    this.lastProcessedSimTime = minSimTime || 0;
    this.predictionError = 0;
    this.softCorrectionsPerSec = 0;
    this.teleportsPerSec = 0;
    this._softWindow = 0;
    this._teleWindow = 0;
  }

  getStats() {
    return {
      predictionError: this.predictionError,
      inputsInFlight: this.pendingInputs.length,
      softCorrectionsPerSec: this.softCorrectionsPerSec,
      teleportsPerSec: this.teleportsPerSec,
      correctionsPerSec: this.softCorrectionsPerSec + this.teleportsPerSec,
    };
  }
}
