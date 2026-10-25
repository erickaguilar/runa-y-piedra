/**
 * Smoke test multijugador automatizado (Anfitrión + Invitado) vía Chrome DevTools Protocol.
 *
 * Abre DOS pestañas en un Chrome headless y recorre los 8 pasos del protocolo
 * (`docs/smoke-test.md`), el overlay de telemetría (`?debug=1`), una pasada de latencia
 * (predicción local del cliente con ~350 ms de retardo en el enlace) y la fase
 * cooperativa de la arena PvE (autoridad del Anfitrión, índices de enemigos estables,
 * daño del Invitado resuelto en el Host y eventos/snapshots de vuelta).
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

// Recarga las vidas de los jugadores remotos en el Anfitrión (evita el Game Over
// del Invitado mientras la serpiente le pega durante la prueba).
async function topUpGuestHearts(host) {
  await host.ev(`(() => {
    const pm = window.__game.playerManager;
    for (const p of pm.players.values()) {
      if (p !== pm.localPlayer && p.recoverHeart) p.recoverHeart(3);
    }
  })(); true`);
}

// Apunta al Invitado hacia el enemigo del índice dado según su réplica local (10 Hz).
async function aimGuestAtEnemy(guest, idx = 0) {
  await guest.ev(`(() => {
    const e = window.__game.enemyManager.getAllEnemies()[${idx}];
    const lp = window.__game.playerManager.localPlayer;
    if (!e || !lp || e.isDead) return;
    const yaw = Math.atan2(-(e.x - lp.pos.x), -(e.z - lp.pos.z));
    window.__game.input.yaw = yaw;
    lp.yaw = yaw;
  })(); true`);
}

// Camina al Invitado hacia el ENEMIGO (no a un punto fijo): la serpiente persigue y
// se mueve (agro 16 m, vel. 2.2), así que el destino se refresca con la posición
// autoritativa del Anfitrión hasta quedar a distancia de melee (rango espada 1.8 m).
// Anti-atasco: si un obstáculo (muro de la arena) frena el avance 2.5 s, rodea por
// un punto lateral despejado (este del par invitado/enemigo) y reanuda la recta.
async function walkGuestToEnemy(guest, host, idx = 0, { maxMs = 30000, tol = 1.3 } = {}) {
  const t0 = Date.now();
  let last = Infinity;
  let best = Infinity;
  let stallT0 = 0;
  let detour = null;
  let detourDone = false;
  while (Date.now() - t0 < maxMs) {
    const info = await host.ev(`(() => {
      const e = window.__game.enemyManager.getAllEnemies()[${idx}];
      const pm = window.__game.playerManager;
      let g = null;
      for (const p of pm.players.values()) if (p !== pm.localPlayer) g = p;
      if (!e || !g || e.isDead) return null;
      const dx = e.x - g.pos.x, dz = e.z - g.pos.z;
      // LOS plana a nivel del suelo: un muro entre ambos hace que la distancia
      // euclidiana mienta (el invitado queda emparedado a ~1 m sin poder golpear).
      let clear = true;
      const w = window.__game.world;
      if (w && typeof w.get === 'function') {
        for (let i = 1; i < 6; i++) {
          const t = i / 6;
          if (w.get(Math.floor(g.pos.x + dx * t), 1, Math.floor(g.pos.z + dz * t))) { clear = false; break; }
        }
      }
      return JSON.stringify({ dist: Math.hypot(dx, dz), yaw: Math.atan2(-dx, -dz), gx: g.pos.x, gz: g.pos.z, ex: e.x, clear });
    })()`);
    if (!info) break;
    const { dist, yaw, gx, gz, ex, clear } = JSON.parse(info);
    last = dist;
    if (dist <= tol && clear) break;

    if (dist < best - 0.25) { best = dist; stallT0 = 0; } else if (!stallT0) stallT0 = Date.now();
    if (!detour && !detourDone && stallT0 && Date.now() - stallT0 > 2500) {
      detour = { x: Math.max(gx, ex) + 2.5, z: gz };
    }
    let tyaw = yaw;
    if (detour) {
      const ddx = detour.x - gx, ddz = detour.z - gz;
      if (Math.hypot(ddx, ddz) <= 1.0) { detour = null; detourDone = true; continue; }
      tyaw = Math.atan2(-ddx, -ddz);
    }
    await guest.ev(`window.__game.input.yaw = ${tyaw}; window.__game.playerManager.localPlayer.yaw = ${tyaw}; window.__game.input.keys['KeyW'] = true; true`);
    await sleep(250);
  }
  await guest.ev(`window.__game.input.keys['KeyW'] = false; true`);
  await sleep(400);
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

  // ===== Fase cooperativa: arena PvE con autoridad del Anfitrión =====
  // Cerrar el modal de chat de voz (aparece en cada peer-joined) para dejar la vista
  // libre en ambas pestañas antes de la arena.
  for (const t of [host, guest]) {
    await t.ev(`document.getElementById('voice-no')?.click(); true`);
  }
  // El Anfitrión entra a la arena difundiendo LEVEL_CHANGE; ambas réplicas generan
  // los enemigos del nivel en el mismo orden (índices de red estables). El combate
  // corre con autoridad del Anfitrión (CombatSync): intención del Invitado (0x14) ->
  // resolución en el Host -> eventos (0x15) y snapshots (0x16) de vuelta.
  await host.ev(`window.__game.switchLevel('dev_combatroom', true); true`);
  await host.waitFor(`window.__game.world.levelRegistry.currentLevelId === 'dev_combatroom'`, { timeout: 15000 });
  await guest.waitFor(`window.__game.world.levelRegistry.currentLevelId === 'dev_combatroom'`, { timeout: 15000 });
  await host.waitFor(`window.__game.enemyManager.getAllEnemies().length === 2`, { timeout: 10000 });
  await guest.waitFor(`window.__game.enemyManager.getAllEnemies().length === 2`, { timeout: 10000 });
  const idsHost = JSON.parse(await host.ev(`JSON.stringify(window.__game.enemyManager.getAllEnemies().map((e) => e.id))`));
  const idsGuest = JSON.parse(await guest.ev(`JSON.stringify(window.__game.enemyManager.getAllEnemies().map((e) => e.id))`));
  check('Coop C1 — arena sincronizada: enemigos generados con índices estables en ambas réplicas',
    idsHost.length === 2 && JSON.stringify(idsHost) === JSON.stringify(idsGuest),
    `host=[${idsHost.join(',')}] guest=[${idsGuest.join(',')}]`);
  await host.shot('coop-arena-host');
  await guest.shot('coop-arena-guest');

  // Espías de combate en el Invitado (los eventos de combate no están en NetAudit);
  // actorId permite distinguir el autor de cada evento (0 = Anfitrión).
  await guest.ev(`window.__coopKinds = []; window.__coopActors = []; window.__coopSnapshots = 0;
    window.__game.network.addEventListener('combat-event', (e) => {
      window.__coopKinds.push(e.detail.kind);
      window.__coopActors.push(e.detail.actorId);
    });
    window.__game.network.addEventListener('enemy-snapshot', () => { window.__coopSnapshots += 1; });
    true`);

  // C2: snapshots de enemigos (0x16, hot a 10 Hz) posicionan la réplica del Invitado
  await guest.waitFor(`window.__coopSnapshots > 0`, { timeout: 8000 });
  const posHost = JSON.parse(await host.ev(`JSON.stringify(window.__game.enemyManager.getAllEnemies().map((e) => ({ x: e.x, z: e.z })))`));
  const posGuest = JSON.parse(await guest.ev(`JSON.stringify(window.__game.enemyManager.getAllEnemies().map((e) => ({ x: e.x, z: e.z })))`));
  const maxDiff = Math.max(0, ...posHost.map((p, i) => {
    const q = posGuest[i];
    return q ? Math.hypot(p.x - q.x, p.z - q.z) : 99;
  }));
  check('Coop C2 — snapshots de enemigos (hot) replican posiciones en el Invitado',
    posHost.length === 2 && maxDiff < 1.5,
    `snapshots=${await guest.ev('window.__coopSnapshots')} Δmax=${maxDiff.toFixed(2)} m`);

  // C3: el Invitado ataca un maniquí: intención (0x14) -> resolución en el Host -> HIT_DUMMY
  const dummyDist = await walkGuestTo(guest, host, 7.5, 15.0, { tol: 1.2 });
  let dummyDamage = 0;
  for (let i = 0; i < 6 && dummyDamage <= 0; i++) {
    await guest.ev(`window.__game.handleAttack(); true`);
    await sleep(800);
    dummyDamage = Number(await host.ev(`(() => {
      const d = window.__game.combatManager.getAllDummies().find((x) => x.id === 'dummy_light');
      return d ? d.totalDamage : -1;
    })()`));
  }
  const kindsC3 = JSON.parse(await guest.ev(`JSON.stringify(window.__coopKinds)`));
  check('Coop C3 — ataque del Invitado: el Host resuelve el daño y difunde HIT_DUMMY',
    dummyDamage > 0 && kindsC3.includes(5),
    `dist=${fin(dummyDist)} m, daño maniquí=${dummyDamage}, kinds=[${kindsC3.join(',')}]`);

  // C4/C5: el Invitado derriba a la serpiente (1 HP) y recibe su contraataque.
  // Walk DINÁMICO hacia el enemigo (posición autoritativa del Anfitrión): la serpiente
  // persigue y se mueve, un punto fijo la deja fuera del rango de la espada (1.8 m).
  const hpBefore = Number(await host.ev(`window.__game.enemyManager.getAllEnemies()[0].hp`));
  // La arena tiene un muro parcial en z=21 (x=5..8) entre los maniquíes y la zona de
  // la serpiente: encaminar primero por el pasillo este (x≥9) para no quedar del
  // lado opuesto (distancia euclidiana corta pero LOS y camino bloqueados).
  await walkGuestTo(guest, host, 10.0, 21.5, { tol: 1.2, maxMs: 20000 });
  const enemyDist = await walkGuestToEnemy(guest, host, 0, { tol: 1.3, maxMs: 30000 });

  // Fase A (C5): mantener posición y dejar que la serpiente golpee primero — el
  // primer golpe conectado del Invitado la mata (1 HP), así que el contraataque
  // debe llegar antes. Top-up de vidas por iteración para evitar el Game Over.
  let enemyAttacked = false;
  for (let i = 0; i < 6 && !enemyAttacked; i++) {
    await topUpGuestHearts(host);
    await aimGuestAtEnemy(guest, 0);
    await sleep(900);
    const kinds = JSON.parse(await guest.ev(`JSON.stringify(window.__coopKinds)`));
    if (kinds.includes(3)) enemyAttacked = true;
  }

  // Fase B (C4): derribar a la serpiente con ataques del Invitado (intención 0x14 ->
  // resolución en el Host -> HIT_ENEMY/ENEMY_DEFEAT de vuelta).
  let enemyDown = false;
  for (let i = 0; i < 12 && !enemyDown; i++) {
    await topUpGuestHearts(host);
    await aimGuestAtEnemy(guest, 0);
    await guest.ev(`window.__game.handleAttack(); true`);
    await sleep(800);
    const hpHost = Number(await host.ev(`window.__game.enemyManager.getAllEnemies()[0].hp`));
    const hpGuest = Number(await guest.ev(`window.__game.enemyManager.getAllEnemies()[0].hp`));
    if (hpHost <= 0 && hpGuest <= 0) enemyDown = true;
  }
  // Diagnóstico final: distancia invitado↔serpiente y estado según el Anfitrión
  const diag = JSON.parse(await host.ev(`(() => {
    const e = window.__game.enemyManager.getAllEnemies()[0];
    const pm = window.__game.playerManager;
    let g = null;
    for (const p of pm.players.values()) if (p !== pm.localPlayer) g = p;
    const dist = e && g ? Math.hypot(e.x - g.pos.x, e.z - g.pos.z) : -1;
    return JSON.stringify({ dist, state: e?.state, hp: e?.hp, dead: !!e?.isDead });
  })()`));
  const kindsC4 = JSON.parse(await guest.ev(`JSON.stringify(window.__coopKinds)`));
  const actorsC4 = JSON.parse(await guest.ev(`JSON.stringify(window.__coopActors)`));
  check('Coop C4 — golpe del Invitado: derrota de la serpiente replicada en Host e Invitado',
    enemyDown && kindsC4.includes(2) && kindsC4.includes(4),
    `walk=${fin(enemyDist)} m, hp ${hpBefore} -> ${diag.hp}/${diag.dead ? 'muerta' : diag.state}, dist final=${fin(diag.dist)} m, kinds=[${kindsC4.join(',')}]`);
  check('Coop C5 — contraataque del enemigo: el Invitado recibe ENEMY_ATTACK',
    enemyAttacked, `kinds=[${kindsC4.join(',')}]`);

  // C6: el ataque del PROPIO Anfitrión se difunde (ATTACK, actorId=0). Los ecos de
  // los ataques del Invitado también son kind 1, así que la comprobación exige un
  // evento NUEVO con actor 0, no solo la presencia de kind 1.
  const hostAttacksBefore = kindsC4.reduce((n, k, i) => n + ((k === 1 && actorsC4[i] === 0) ? 1 : 0), 0);
  await host.ev(`window.__game.handleAttack(); true`);
  await sleep(900);
  const kindsC6 = JSON.parse(await guest.ev(`JSON.stringify(window.__coopKinds)`));
  const actorsC6 = JSON.parse(await guest.ev(`JSON.stringify(window.__coopActors)`));
  const hostAttacksAfter = kindsC6.reduce((n, k, i) => n + ((k === 1 && actorsC6[i] === 0) ? 1 : 0), 0);
  check('Coop C6 — el ataque del Anfitrión se difunde a los invitados (ATTACK, actorId=0)',
    hostAttacksAfter > hostAttacksBefore,
    `ataques del Host vistos por el Invitado: ${hostAttacksBefore} -> ${hostAttacksAfter}`);

  // Volver al lobby para no perturbar la migración de host del Paso 8
  await host.ev(`window.__game.switchLevel('lobby_tutorial', true); true`);
  await host.waitFor(`window.__game.world.levelRegistry.currentLevelId === 'lobby_tutorial'`, { timeout: 15000 });
  await guest.waitFor(`window.__game.world.levelRegistry.currentLevelId === 'lobby_tutorial'`, { timeout: 15000 });
  await sleep(1000);

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
