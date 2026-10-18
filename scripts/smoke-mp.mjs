/**
 * Smoke test multijugador automatizado (Anfitrión + Invitado) vía Chrome DevTools Protocol.
 *
 * Abre DOS pestañas en un Chrome headless y recorre los 8 pasos del protocolo
 * (`docs/smoke-test.md`), el overlay de telemetría (`?debug=1`) y una pasada de latencia
 * (predicción local del cliente con ~350 ms de retardo en el enlace).
 *
 * Requisitos:
 *   - El servidor de desarrollo levantado: `npm run dev` (por defecto http://localhost:5173/).
 *   - Chrome/Chromium instalado (`google-chrome` en PATH, o `CHROME_BIN=/ruta/chrome`).
 *   - Salida a Internet (PeerJS Cloud para la señalización WebRTC).
 *
 * Uso:
 *   npm run smoke:mp                       # contra http://localhost:5173/
 *   BASE_URL=http://localhost:5199/ npm run smoke:mp
 *   CDP_PORT=9500 SMOKE_OUT=/tmp/smoke npm run smoke:mp
 *
 * Salida: informe JSON + capturas PNG en `SMOKE_OUT` (por defecto `.smoke-out/`).
 * Código de salida: 0 si todas las comprobaciones pasan, 1 en caso contrario.
 *
 * Limitaciones conocidas (documentadas en `docs/smoke-test.md`):
 *   - El FPS medido en headless con SwiftShader no es representativo del dispositivo real;
 *     esta comprobación verifica que la telemetría reporta FPS/draw calls, no el presupuesto.
 *   - El cierre abrupto de una pestaña no propaga el cierre de SCTP al otro extremo de forma
 *     determinista (ICE tarda decenas de segundos), así que la desconexión y la caída del host
 *     se ejercitan con salida ordenada (`leaveSession`), el mismo camino de código que usa un
 *     cierre real de ventana (`pagehide` → HOST_CLOSING + cierre de DataChannels).
 *   - `Network.emulateNetworkConditions` de CDP no afecta a WebRTC (SCTP): la latencia se
 *     simula sobre los canales de envío del cliente.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = process.cwd();
const CHROME = process.env.CHROME_BIN || 'google-chrome';
const PORT = Number(process.env.CDP_PORT || 9444);
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const OUT_DIR = path.resolve(ROOT, process.env.SMOKE_OUT || '.smoke-out');
const PROFILE_DIR = path.join(os.tmpdir(), `runa-smoke-mp-profile-${PORT}`);

fs.mkdirSync(OUT_DIR, { recursive: true });

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail: String(detail) });
  console.log(`${ok ? '\u2713' : '\u2717'} ${name}${detail ? ' \u2014 ' + detail : ''}`);
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + PROFILE_DIR,
  '--no-first-run', '--no-default-browser-check',
  '--disable-gpu', '--enable-unsafe-swiftshader', '--no-sandbox',
  '--hide-scrollbars', '--window-size=960,640',
  '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
  '--autoplay-policy=no-user-gesture-required',
  '--disable-features=Translate,MediaRouter,CalculateNativeWinOcclusion',
  // Necesario en headless con dos pestañas: ninguna debe quedar "en segundo plano",
  // o su requestAnimationFrame (y por tanto su simulación) se pausa.
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
chrome.stderr.on('data', () => {});
chrome.on('error', (err) => {
  console.error(`[smoke-mp] No se pudo lanzar Chrome (${CHROME}): ${err.message}`);
  console.error('           Instala Chrome/Chromium o define CHROME_BIN=/ruta/al/binario.');
  process.exit(2);
});

function cleanup(code) {
  try { chrome.kill('SIGKILL'); } catch { /* ya cerrado */ }
  process.exit(code);
}

function writeReport(extra = {}) {
  const file = path.join(OUT_DIR, 'report.json');
  fs.writeFileSync(file, JSON.stringify({ base: BASE, date: new Date().toISOString(), results, ...extra }, null, 2));
  return file;
}

async function preflight() {
  try {
    const r = await Promise.race([
      fetch(BASE),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000)),
    ]);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
  } catch (e) {
    console.error(`[smoke-mp] No se puede alcanzar el servidor de desarrollo en ${BASE} (${e.message}).`);
    console.error('           Arráncalo con "npm run dev" o define BASE_URL.');
    cleanup(2);
  }
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) return; } catch { /* aún arrancando */ }
    await sleep(250);
  }
  throw new Error('CDP no disponible en el puerto ' + PORT);
}

class Cdp {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) {
        const { res, rej } = this.pending.get(m.id); this.pending.delete(m.id);
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
}

class Page {
  constructor(cdp, label) { this.cdp = cdp; this.label = label; }
  async ev(expr) {
    const r = await this.cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(`${this.label}: ${r.exceptionDetails.text || JSON.stringify(r.exceptionDetails)}`);
    return r.result?.value;
  }
  async waitFor(expr, { timeout = 20000, poll = 200 } = {}) {
    const t0 = Date.now(); let last = null;
    while (Date.now() - t0 < timeout) {
      try { last = await this.ev(`!!(${expr})`); if (last) return true; } catch (e) { last = e.message; }
      await sleep(poll);
    }
    throw new Error(`${this.label}: timeout esperando "${expr}" (último=${last})`);
  }
  async shot(name) {
    const s = await this.cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, `${name}.png`), Buffer.from(s.data, 'base64'));
  }
}

async function newPage(label) {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const cdp = new Cdp(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  // Foco emulado: evita que la pestaña inactiva pierda el bucle de render/simulación.
  await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  const page = new Page(cdp, label);
  page.targetId = t.id;
  return page;
}

// ---- Expresiones reutilizables ----
const E = {
  roster: `JSON.stringify(window.__game.playerManager.getRoster())`,
  // Posición observable del jugador remoto: lógica (autoritativa en el Host) y de avatar
  // (en el cliente la lógica no se actualiza: los snapshots solo mueven el avatar interpolado).
  remoteObs: `(() => {
    const g = window.__game, pm = g.playerManager;
    const remotes = Array.from(pm.players.values()).filter((p) => p !== pm.localPlayer);
    if (!remotes.length) return null;
    const p = remotes[0];
    const av = g.avatars?.avatars?.get(p.id);
    return JSON.stringify({
      id: p.id,
      logical: { x: p.pos.x, y: p.pos.y, z: p.pos.z },
      avatar: av ? { x: av.target.x, y: av.target.y, z: av.target.z } : null,
    });
  })()`,
  localPos: `(() => { const p = window.__game.playerManager.localPlayer; return JSON.stringify({ x: p.pos.x, y: p.pos.y, z: p.pos.z }); })()`,
  eventCounts: `JSON.stringify(window.__netEventCounts || {})`,
};

async function move(page, ms = 1600) {
  await page.ev(`window.__game.input.keys['KeyW'] = true; true`);
  await sleep(ms);
  await page.ev(`window.__game.input.keys['KeyW'] = false; true`);
  await sleep(600);
}

/**
 * Hace caminar al Invitado hasta (tx,tz) usando la posición AUTORITATIVA que ve el Anfitrión.
 * El cliente envía entradas (no posiciones), así que hay que pilotarlo dirigiéndolo con el yaw
 * y comprobando el avance en el Host (autoritativo).
 */
async function walkGuestTo(guest, host, tx, tz, { maxMs = 60000, tol = 2.2 } = {}) {
  const t0 = Date.now();
  let last = Infinity;
  while (Date.now() - t0 < maxMs) {
    const info = await host.ev(`(() => {
      const pm = window.__game.playerManager;
      for (const p of pm.players.values()) if (p !== pm.localPlayer) {
        const dx = ${tx} - p.pos.x, dz = ${tz} - p.pos.z;
        return JSON.stringify({ dist: Math.hypot(dx, dz), yaw: Math.atan2(-dx, -dz) });
      }
      return null;
    })()`);
    if (!info) break;
    const { dist, yaw } = JSON.parse(info);
    last = dist;
    if (dist <= tol) break;
    await guest.ev(`window.__game.input.yaw = ${yaw}; window.__game.playerManager.localPlayer.yaw = ${yaw}; window.__game.input.keys['KeyW'] = true; true`);
    await sleep(250);
  }
  await guest.ev(`window.__game.input.keys['KeyW'] = false; true`);
  await sleep(500);
  return last;
}

function fin(n) { return Number.isFinite(n) ? n.toFixed(2) : String(n); }

// Desplazamiento observado del jugador remoto (máx. entre posición lógica y de avatar).
function moved(a, b) {
  if (!a || !b) return 0;
  const A = JSON.parse(a), B = JSON.parse(b);
  const d = (u, v) => (u && v ? Math.hypot(u.x - v.x, u.y - v.y, u.z - v.z) : 0);
  return Math.max(d(A.logical, B.logical), d(A.avatar, B.avatar));
}

async function closeTab(page) {
  try { await page.cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch { /* ya cerrada */ }
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${page.targetId}`); } catch { /* ya cerrada */ }
}

async function main() {
  await preflight();

  // ===== Paso 1: crear y unirse =====
  const host = await newPage('host');
  await host.cdp.send('Page.navigate', { url: BASE + '?debug=1' });
  await host.waitFor(`document.getElementById('btn-host')`, { timeout: 25000 });
  await host.ev(`document.getElementById('btn-host').click(); true`);
  await host.waitFor(`window.__game && window.__game.mode === 'host' && window.__game.lastConnectedPin`, { timeout: 30000 });
  const pin = await host.ev(`String(window.__game.lastConnectedPin)`);
  check('Paso 1a — el Anfitrión crea la sala', /^\d{4}$/.test(pin), `PIN=${pin} (sala=${await host.ev('window.__game.network.roomId')})`);

  const guest = await newPage('guest');
  await guest.cdp.send('Page.navigate', { url: BASE + '?join=' + encodeURIComponent(pin) });
  await guest.waitFor(`document.getElementById('btn-guest-confirm')`, { timeout: 25000 });
  await guest.ev(`document.getElementById('btn-guest-confirm').click(); true`);
  await guest.waitFor(`window.__game && window.__game.network && window.__game.network.isHost === false && window.__game.mode === 'client'`, { timeout: 25000 });
  await host.waitFor(`window.__game.playerManager.getRoster().length === 2`, { timeout: 20000 });
  await guest.waitFor(`window.__game.playerManager.getRoster().length === 2`, { timeout: 20000 });
  const rHost = JSON.parse(await host.ev(E.roster));
  const rGuest = JSON.parse(await guest.ev(E.roster));
  check('Paso 1b — el Invitado entra y ambos se ven (roster = 2)', rHost.length === 2 && rGuest.length === 2,
    `host=[${rHost.map((r) => r.name).join(', ')}] guest=[${rGuest.map((r) => r.name).join(', ')}]`);
  await host.shot('paso1-host');
  await guest.shot('paso1-guest');

  // ===== Paso 2: movimiento del Invitado visto por el Anfitrión =====
  const before2 = await host.ev(E.remoteObs);
  await move(guest, 3500);
  const after2 = await host.ev(E.remoteObs);
  check('Paso 2 — el Anfitrión ve moverse al Invitado', moved(before2, after2) > 0.3,
    `Δ=${moved(before2, after2).toFixed(2)} m`);

  // ===== Paso 3: movimiento del Anfitrión visto por el Invitado =====
  const before3 = await guest.ev(E.remoteObs);
  await move(host, 3500);
  const after3 = await guest.ev(E.remoteObs);
  check('Paso 3 — el Invitado ve moverse al Anfitrión', moved(before3, after3) > 0.3,
    `Δ=${moved(before3, after3).toFixed(2)} m`);

  // ===== Paso 4: interacción del Invitado (cofre) validada y replicada por el Anfitrión =====
  // El Invitado camina hasta el Cofre de Práctica (6.5, 8.5) y pide abrirlo; el Anfitrión valida
  // distancia (≤3.2 m) y llave, abre y retransmite. Cubre el camino cliente → host → cliente.
  const chestDist = await walkGuestTo(guest, host, 6.5, 8.5);
  const sent = await guest.ev(`(async () => {
    const Proto = await import('/src/network/Protocol.js');
    window.__game.network.sendToHost(Proto.serializeChestOpen(1));
    return 'sent';
  })()`);
  await sleep(1500);
  const hostChestEvents = JSON.parse(await host.ev(E.eventCounts))['chest-open'] || 0;
  const hostOpenedChest = (JSON.parse(await host.ev(`JSON.stringify([...(window.__game.openedChestKeys || [])].map(String))`)))
    .some((k) => /chest_1$|:1$/.test(k));
  const guestChestEcho = JSON.parse(await guest.ev(E.eventCounts))['chest-open'] || 0;
  check('Paso 4 — el Invitado abre el cofre: el Anfitrión valida y replica (ida y vuelta)',
    sent === 'sent' && hostChestEvents > 0 && hostOpenedChest && guestChestEcho > 0,
    `dist guest→cofre=${fin(chestDist)} m, chest-open host=${hostChestEvents} guest=${guestChestEcho}, host abrió=${hostOpenedChest}`);

  // ===== Paso 5: puerta del Anfitrión vista por el Invitado =====
  const doorHost = await host.ev(`(() => { try { window.__game.interaction.openDoor(1); return 'ok'; } catch (e) { return 'err:' + e.message; } })()`);
  await sleep(1500);
  const guestDoorEvents = JSON.parse(await guest.ev(E.eventCounts))['door-open'] || 0;
  const guestDoorOpen = await guest.ev(`!!window.__game.world.isDoor1Open`);
  const guestLevel = await guest.ev(`window.__game.world.levelRegistry?.getCurrentLevel?.()?.id || null`);
  check('Paso 5 — la puerta abierta por el Anfitrión se ve en el Invitado', doorHost === 'ok' && guestDoorEvents > 0 && guestDoorOpen === true,
    `door-open en guest=${guestDoorEvents}, isDoor1Open=${guestDoorOpen}, nivel guest=${guestLevel}`);

  // ===== Paso 7 (antes de la desconexión): un nuevo Invitado recibe el estado =====
  await sleep(5600); // el Host difunde world-snapshot cada ~5 s
  const guest2 = await newPage('guest2');
  await guest2.cdp.send('Page.navigate', { url: BASE + '?join=' + encodeURIComponent(pin) });
  await guest2.waitFor(`document.getElementById('btn-guest-confirm')`, { timeout: 25000 });
  await guest2.ev(`document.getElementById('btn-guest-confirm').click(); true`);
  await guest2.waitFor(`window.__game && window.__game.mode === 'client'`, { timeout: 25000 });
  await host.waitFor(`window.__game.playerManager.getRoster().length >= 3`, { timeout: 20000 });
  const lvlHost = await host.ev(`window.__game.world.levelRegistry?.getCurrentLevel?.()?.id || null`);
  const lvlG2 = await guest2.ev(`window.__game.world.levelRegistry?.getCurrentLevel?.()?.id || null`);
  const doorG2 = await guest2.ev(`!!window.__game.world.isDoor1Open`);
  const chestG2 = await guest2.ev(`!!(window.__game.world.chests || []).find((c) => c.id === 1 && c.isOpen)`);
  check('Paso 7 — nueva incorporación recibe nivel y estado del mundo (puerta y cofre abiertos)',
    !!lvlG2 && lvlG2 === lvlHost && doorG2 === true && chestG2 === true,
    `nivel host=${lvlHost} guest2=${lvlG2}, puerta1Abierta=${doorG2}, cofre1Abierto=${chestG2}`);

  // ===== Paso 6: salida ordenada de guest2 -> el Anfitrión recibe peer-left =====
  const peersBefore = (JSON.parse(await host.ev(E.roster))).length;
  await guest2.ev(`window.__game.leaveSession(); true`);
  await host.waitFor(`window.__game.playerManager.getRoster().length === ${peersBefore - 1}`, { timeout: 20000 });
  const peersAfter = (JSON.parse(await host.ev(E.roster))).length;
  check('Paso 6 — desconexión de invitado: el Anfitrión recibe peer-left', peersAfter === peersBefore - 1,
    `roster ${peersBefore} -> ${peersAfter}`);

  // ===== Overlay de telemetría (?debug=1) =====
  await sleep(2500);
  const stats = JSON.parse(await host.ev(`JSON.stringify(window.__game.network.stats.getPerfSummary() || {})`));
  check('Overlay ?debug=1 — FPS y draw calls medidos', stats.fps > 0 && typeof stats.calls === 'number',
    `fps=${stats.fps} draws=${stats.calls} tris=${stats.tris} rtt=${stats.rttMs}ms peers=${stats.peers}`);

  // ===== Latencia: predicción local con enlace lento (≈350 ms) =====
  // CDP no puede limitar el SCTP de WebRTC, así que se añade retardo+jitter a los canales de envío.
  await guest.ev(`(() => {
    const n = window.__game.network; if (n.__lagPatched) return 'already';
    const lag = (fn) => (buf) => setTimeout(() => fn(buf), 300 + Math.random() * 150);
    if (n.sendToHost) { const o = n.sendToHost.bind(n); n.sendToHost = lag(o); }
    if (n.sendToHostHot) { const o = n.sendToHostHot.bind(n); n.sendToHostHot = lag(o); }
    n.__lagPatched = true; return 'ok';
  })()`);
  // Orientar de vuelta hacia el spawn (espacio abierto) para garantizar desplazamiento real.
  await guest.ev(`(() => {
    const lp = window.__game.playerManager.localPlayer;
    const dx = 12.0 - lp.pos.x, dz = 2.5 - lp.pos.z;
    window.__game.input.yaw = Math.atan2(-dx, -dz);
    return 'yaw-ok';
  })()`);
  const latentBefore = await guest.ev(E.localPos);
  await guest.ev(`window.__game.input.keys['KeyW'] = true; true`);
  await sleep(900);
  const latentMid = await guest.ev(E.localPos);
  await guest.ev(`window.__game.input.keys['KeyW'] = false; true`);
  await sleep(400);
  const latentDelta = (() => {
    const a = JSON.parse(latentBefore), b = JSON.parse(latentMid);
    return Math.hypot(a.x - b.x, a.z - b.z);
  })();
  const guestFps = JSON.parse(await guest.ev(`JSON.stringify(window.__game.network.stats.getPerfSummary())`)).fps;
  check('Slow 4G simulado — la predicción local responde pese a ~350 ms de latencia',
    latentDelta > 0.2 && guestFps > 0,
    `Δ local(0.9s)=${latentDelta.toFixed(2)} m, fps=${guestFps}`);

  // ===== Paso 8: caída del Anfitrión -> el Invitado reanuda como Host =====
  await host.shot('paso8-host-antes-de-caer');
  const oldPin = pin;
  // Cierre de ventana del Anfitrión: `pagehide` dispara HOST_CLOSING y `leaveSession` cierra
  // los DataChannels (equivalente al cierre real que hace el navegador).
  await host.ev(`window.dispatchEvent(new Event('pagehide')); true`).catch(() => {});
  await sleep(300);
  await host.ev(`window.__game.leaveSession(); true`).catch(() => {});
  await closeTab(host);
  await guest.waitFor(`window.__game.network.isHost === true`, { timeout: 25000 });
  const newPin = await guest.ev(`window.__game.network.roomId`);
  const guestMode = await guest.ev(`window.__game.mode`);
  check('Paso 8 — caída del Host: el Invitado reanuda como Host con nueva sala',
    guestMode === 'host' && !!newPin,
    `pin ${oldPin} -> ${newPin} (modo=${guestMode})`);
  await guest.shot('paso8-guest-nuevo-host');

  // ===== Resumen =====
  const failed = results.filter((r) => !r.ok);
  const file = writeReport();
  console.log(`\n==== ${results.length - failed.length}/${results.length} comprobaciones OK ====`);
  console.log(`Informe: ${file}`);
  if (failed.length) {
    console.log('FALLOS:');
    for (const f of failed) console.log(`  - ${f.name} (${f.detail})`);
  }
  cleanup(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error('[smoke-mp] ERROR:', e.message);
  console.error('           Informe: ' + writeReport({ error: e.message }));
  cleanup(1);
});
