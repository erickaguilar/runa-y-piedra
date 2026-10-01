/**
 * NetworkStats.js - Real-time Network Telemetry & Diagnostics Monitor
 * 
 * Tracks RTT (ping), packet throughput (PPS In/Out), bandwidth consumption (KB/s),
 * packet sequence drops, and active peer topology for P2P WebRTC data channels.
 */

export class NetworkStats {
  constructor({ protocolVersion = 2 } = {}) {
    this.protocolVersion = protocolVersion;
    this.mode = 'OFFLINE';
    this.peerCount = 0;
    this.rttMs = 0;
    this.drops = 0;
    this.lastSnapshotSeq = null;

    // Métricas de Reconciliación (Cliente)
    this.predError = 0;
    this.inputsInFlight = 0;
    this.softCorrectionsPerSec = 0;
    this.teleportsPerSec = 0;

    // Métricas de rendimiento (Fase 3: PerfMonitor -> overlay)
    this.fps = 0;
    this.dpr = 0;

    // Conteo continuo
    this.totalPacketsIn = 0;
    this.totalPacketsOut = 0;
    this.totalBytesIn = 0;
    this.totalBytesOut = 0;

    // Métricas por segundo (sliding window de 1s)
    this.ppsIn = 0;
    this.ppsOut = 0;
    this.kbpsIn = 0;
    this.kbpsOut = 0;

    this._windowPacketsIn = 0;
    this._windowPacketsOut = 0;
    this._windowBytesIn = 0;
    this._windowBytesOut = 0;
    this._lastWindowTime = performance.now();

    // Estado de visualización
    this.enabled = this._checkInitialEnabled();
    this.domElement = null;
    this.renderer = null;

    if (this.enabled) {
      this.initDom();
    }
  }

  setRenderer(renderer) {
    this.renderer = renderer;
  }

  _checkInitialEnabled() {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === '1' || localStorage.getItem('dungeon_debug') === '1';
  }

  setEnabled(enable) {
    this.enabled = enable;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dungeon_debug', enable ? '1' : '0');
    }
    if (enable) {
      this.initDom();
    } else if (this.domElement) {
      this.domElement.style.display = 'none';
    }
  }

  setMode(mode, peerCount = 0) {
    this.mode = mode;
    this.peerCount = peerCount;
  }

  recordPacketIn(byteLength = 0) {
    this.totalPacketsIn++;
    this._windowPacketsIn++;
    this.totalBytesIn += byteLength;
    this._windowBytesIn += byteLength;
    this._maybeUpdateWindow();
  }

  recordPacketOut(byteLength = 0) {
    this.totalPacketsOut++;
    this._windowPacketsOut++;
    this.totalBytesOut += byteLength;
    this._windowBytesOut += byteLength;
    this._maybeUpdateWindow();
  }

  recordRtt(rttMs) {
    // Media móvil exponencial para suavizar el jitter
    this.rttMs = this.rttMs === 0 ? rttMs : Math.round(this.rttMs * 0.7 + rttMs * 0.3);
  }

  recordSnapshotSeq(seq) {
    if (this.lastSnapshotSeq !== null) {
      const expected = (this.lastSnapshotSeq + 1) & 0xFFFF;
      if (seq !== expected) {
        // Paquete fuera de secuencia o perdido
        this.drops++;
      }
    }
    this.lastSnapshotSeq = seq;
  }

  setReconciliationStats(predError = 0, inFlight = 0, softCorrectionsPerSec = 0, teleportsPerSec = 0) {
    this.predError = predError;
    this.inputsInFlight = inFlight;
    this.softCorrectionsPerSec = softCorrectionsPerSec;
    this.teleportsPerSec = teleportsPerSec;
    if (this.enabled && this.domElement) {
      this.renderDom();
    }
  }

  setPerfStats({ fps = 0, dpr = 0 } = {}) {
    this.fps = fps;
    this.dpr = dpr;
    if (this.enabled && this.domElement) {
      this.renderDom();
    }
  }

  getPerfSummary() {
    const calls = this.renderer?.info?.render?.calls ?? null;
    const tris = this.renderer?.info?.render?.triangles ?? null;
    return { fps: this.fps, dpr: this.dpr, calls, tris, mode: this.mode, peers: this.peerCount, rttMs: this.rttMs };
  }

  _maybeUpdateWindow() {
    const now = performance.now();
    const dt = (now - this._lastWindowTime) / 1000;
    if (dt >= 1.0) {
      this.ppsIn = Math.round(this._windowPacketsIn / dt);
      this.ppsOut = Math.round(this._windowPacketsOut / dt);
      this.kbpsIn = ((this._windowBytesIn / 1024) / dt).toFixed(1);
      this.kbpsOut = ((this._windowBytesOut / 1024) / dt).toFixed(1);

      this._windowPacketsIn = 0;
      this._windowPacketsOut = 0;
      this._windowBytesIn = 0;
      this._windowBytesOut = 0;
      this._lastWindowTime = now;

      if (this.enabled) {
        this.renderDom();
      }
    }
  }

  initDom() {
    if (this.domElement) {
      this.domElement.style.display = 'block';
      return;
    }
    const el = document.createElement('div');
    el.id = 'net-debug-panel';
    el.style.cssText = `
      position: fixed;
      top: 14px;
      right: 54px;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      line-height: 1.4;
      padding: 8px 12px;
      border-radius: 10px;
      z-index: 100;
      pointer-events: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      user-select: none;
    `;
    document.body.appendChild(el);
    this.domElement = el;
    this.renderDom();
  }

  renderDom() {
    if (!this.domElement || !this.enabled) return;
    const hasNetworkProblem = this.softCorrectionsPerSec > 2 && this.predError > 0.3;
    const isModerateJitter = this.predError > 0.09 || this.softCorrectionsPerSec > 0;
    const rttColor = this.rttMs > 150 ? '#ef4444' : (this.rttMs > 80 ? '#f59e0b' : '#38bdf8');
    const fpsColor = this.fps >= 55 ? '#4ade80' : (this.fps >= 30 ? '#f59e0b' : '#ef4444');
    const calls = this.renderer?.info?.render?.calls;
    const callsColor = calls == null ? '#94a3b8' : (calls <= 25 ? '#4ade80' : (calls <= 50 ? '#f59e0b' : '#ef4444'));
    const predErrColor = hasNetworkProblem ? '#ef4444' : (isModerateJitter ? '#f59e0b' : '#38bdf8');
    const softColor = this.softCorrectionsPerSec > 2 ? '#ef4444' : (this.softCorrectionsPerSec > 0 ? '#f59e0b' : '#94a3b8');
    const teleColor = this.teleportsPerSec > 0 ? '#ef4444' : '#94a3b8';

    const audit = (typeof window !== 'undefined' && window.__netEventCounts) ? window.__netEventCounts : null;

    this.domElement.innerHTML = `
      <div style="font-weight:bold;color:#f8fafc;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:2px;margin-bottom:4px;display:flex;justify-content:space-between;gap:8px;">
        <span>NET DEBUG · P2P</span>
        <span style="color:#fbbf24">v${this.protocolVersion}</span>
      </div>
      <div>Rol: <strong>${this.mode}</strong> | Peers: <strong>${this.peerCount}</strong></div>
      ${this.mode === 'CLIENT' ? `<div>RTT (Ping): <strong style="color:${rttColor}">${this.rttMs} ms</strong></div>` : ''}
      <div>In: <strong>${this.ppsIn}</strong> pps (${this.kbpsIn} KB/s)</div>
      <div>Out: <strong>${this.ppsOut}</strong> pps (${this.kbpsOut} KB/s)</div>
      <div>Drops / OOO: <strong style="color:${this.drops > 0 ? '#f59e0b' : '#94a3b8'}">${this.drops}</strong></div>
      <div>FPS: <strong style="color:${fpsColor}">${this.fps || '—'}</strong>${this.dpr ? ` <span style="color:#94a3b8">| DPR ${Number(this.dpr).toFixed(2)}</span>` : ''}</div>
      ${this.renderer ? `
        <div style="margin-top:4px;border-top:1px solid rgba(255,255,255,0.1);padding-top:2px;font-size:10px;color:#a7f3d0;">
          Draw Calls: <strong style="color:${callsColor}">${this.renderer.info.render.calls}</strong> <span style="color:#64748b">(≤25)</span> | Tris: <strong>${this.renderer.info.render.triangles}</strong>
        </div>
      ` : ''}
      ${this.mode === 'CLIENT' ? `
        <div style="margin-top:4px;border-top:1px dashed rgba(255,255,255,0.15);padding-top:3px;font-size:10px;">
          <div>Pred Err: <strong style="color:${predErrColor}">${(this.predError || 0).toFixed(3)} m</strong></div>
          <div>In Flight: <strong>${this.inputsInFlight || 0}</strong> | Soft: <strong style="color:${softColor}">${this.softCorrectionsPerSec || 0}/s</strong> | Tele: <strong style="color:${teleColor}">${this.teleportsPerSec || 0}/s</strong></div>
        </div>
      ` : ''}
      ${audit ? `
        <div style="margin-top:4px;border-top:1px dashed rgba(56,189,248,0.3);padding-top:3px;font-size:10px;color:#cbd5e1;">
          <div>Audit: 
            ${audit['init'] ? '<span style="color:#4ade80">INIT:✔</span> ' : ''}
            ${audit['peer-joined'] ? '<span style="color:#4ade80">JOIN:✔</span> ' : ''}
            ${audit['input'] ? `<span style="color:#38bdf8">IN:${audit['input']}</span> ` : ''}
            ${audit['snapshot'] ? `<span style="color:#fbbf24">SNAP:${audit['snapshot']}</span> ` : ''}
          </div>
        </div>
      ` : ''}
    `;
  }
}
