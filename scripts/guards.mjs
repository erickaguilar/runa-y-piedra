#!/usr/bin/env node
/**
 * Guardarraíles de calidad permanentes (Fase 7 del plan de saneamiento técnico).
 *
 * Falla (exit 1) si:
 *   1. `!important` en el CSS de `src/` supera el umbral.
 *   2. Un archivo de lógica de `src/` supera el límite de líneas (los archivos de
 *      datos/arte están exentos y la deuda pre-existente está congelada).
 *   3. Hay `console.log`/`console.info` en `src/` fuera de `src/config/logger.js`.
 *   4. El bundle de entrada construido supera el presupuesto de bytes.
 *
 * Uso: `npm run guards` (requiere `npm run build` previo para el chequeo 4).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// ── Umbrales (ajustar aquí si el plan cambia) ────────────────────────────────
const LIMITS = {
  important: 50, // declaraciones !important en src/**/*.css
  lines: 500, // líneas por archivo de lógica de src/
  // 380 KB → 385 KB (sprint cooperativo PvE): el cableado de sesión/UI del combate
  // cooperativo añadió ~3 KB al entry (el protocolo y CombatSync ya viven en el chunk
  // engine-combat). Pendiente: carga diferida de las herramientas Dev en el próximo
  // saneamiento para recuperar margen.
  entryBytes: 385 * 1000, // bundle de entrada (dist/assets/index-*.js)
};

// Rutas exentas del límite de líneas (datos o arte, no lógica).
const DATA_ART_PATTERNS = [
  /^src\/heroes\/portraits\//,
  /^src\/heroes\/data\//,
  /^src\/levels\/data\//,
  /^src\/render\/textures\//,
  /\.data\.js$/,
];

// Deuda técnica pre-existente al guardarraíl: archivos de lógica con más de
// LIMITS.lines líneas. Están **congelados** a su tamaño actual: no pueden crecer.
// Reducirlos por debajo del límite los saca de esta lista.
const LEGACY_BIG_FILES = new Map([
  ['src/audio/SoundManager.js', 1100],
  ['src/core/SessionManager.js', 770],
  ['src/ui/HudManager.js', 735],
  ['src/ui/MenuManager.js', 679],
  ['src/storage/SaveManager.js', 632],
  ['src/network/Protocol.js', 619],
  ['src/ui/modals/DevModal.js', 620],
  ['src/ui/modals/InventoryModal.js', 573],
  ['src/levels/LevelLoader.js', 504],
]);

// ── Utilidades ───────────────────────────────────────────────────────────────
const failures = [];
const notes = [];

function walk(dir, filter) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

const toRel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const countLines = (p) => fs.readFileSync(p, 'utf8').split('\n').length - 1;

// ── Chequeo 1: !important en CSS ─────────────────────────────────────────────
function checkImportant() {
  const cssFiles = walk(path.join(ROOT, 'src'), (p) => p.endsWith('.css'));
  let total = 0;
  const byFile = [];
  for (const f of cssFiles) {
    const n = (fs.readFileSync(f, 'utf8').match(/!important/g) || []).length;
    if (n) byFile.push([toRel(f), n]);
    total += n;
  }
  byFile.sort((a, b) => b[1] - a[1]);
  if (total > LIMITS.important) {
    failures.push(
      `!important en CSS: ${total} > ${LIMITS.important} (${byFile.map(([f, n]) => `${f}: ${n}`).join(', ')})`,
    );
  } else {
    notes.push(`!important en CSS: ${total} <= ${LIMITS.important}`);
  }
}

// ── Chequeo 2: líneas por archivo de lógica ──────────────────────────────────
function checkLineLimits() {
  const jsFiles = walk(path.join(ROOT, 'src'), (p) => p.endsWith('.js')).map(toRel);
  const logic = jsFiles.filter((f) => !DATA_ART_PATTERNS.some((r) => r.test(f)));
  const oversized = [];
  for (const f of logic) {
    const n = countLines(path.join(ROOT, f));
    if (n <= LIMITS.lines) continue;
    const frozen = LEGACY_BIG_FILES.get(f);
    if (frozen === undefined) {
      failures.push(`archivo nuevo por encima del límite: ${f} (${n} > ${LIMITS.lines})`);
    } else if (n > frozen) {
      failures.push(`archivo de deuda creció: ${f} (${n} > ${frozen} congelado)`);
    } else {
      oversized.push(`${f}: ${n}`);
    }
  }
  // Avisar de entradas de deuda ya resueltas (para limpiar la lista).
  for (const [f] of LEGACY_BIG_FILES) {
    if (!fs.existsSync(path.join(ROOT, f))) {
      notes.push(`deuda obsoleta (archivo ya no existe): ${f}`);
    } else if (countLines(path.join(ROOT, f)) <= LIMITS.lines) {
      notes.push(`deuda resuelta (ya <= ${LIMITS.lines}): ${f} — quitar de LEGACY_BIG_FILES`);
    }
  }
  if (oversized.length) {
    notes.push(`deuda congelada (> ${LIMITS.lines} líneas, no puede crecer): ${oversized.join(', ')}`);
  }
}

// ── Chequeo 3: console.log/info en src/ ──────────────────────────────────────
function checkConsole() {
  const allowed = 'src/config/logger.js';
  const jsFiles = walk(path.join(ROOT, 'src'), (p) => p.endsWith('.js')).map(toRel);
  const offenders = [];
  for (const f of jsFiles) {
    if (f === allowed) continue;
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const lines = src.split('\n');
    lines.forEach((l, i) => {
      if (/console\.(log|info)\s*\(/.test(l)) offenders.push(`${f}:${i + 1}`);
    });
  }
  if (offenders.length) {
    failures.push(`console.log/info en src/ fuera de ${allowed}: ${offenders.join(', ')}`);
  } else {
    notes.push(`console.log/info en src/: 0 (fuera de ${allowed})`);
  }
}

// ── Chequeo 4: presupuesto del bundle de entrada ─────────────────────────────
function checkBundle() {
  const htmlPath = path.join(ROOT, 'dist/index.html');
  if (!fs.existsSync(htmlPath)) {
    notes.push('bundle: SKIP (dist/ no existe; ejecuta `npm run build` antes)');
    return;
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const match = html.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/);
  if (!match) {
    failures.push('bundle: no se pudo localizar el script de entrada en dist/index.html');
    return;
  }
  const entry = path.join(ROOT, 'dist', match[0].replace(/^\//, ''));
  const bytes = fs.statSync(entry).size;
  const kb = (bytes / 1000).toFixed(1);
  if (bytes > LIMITS.entryBytes) {
    failures.push(`bundle de entrada: ${kb} KB (${bytes} B) > ${LIMITS.entryBytes / 1000} KB`);
  } else {
    notes.push(`bundle de entrada: ${kb} KB <= ${LIMITS.entryBytes / 1000} KB`);
  }
}

// ── Ejecución ────────────────────────────────────────────────────────────────
console.log('[guards] Verificando guardarraíles de calidad...');
checkImportant();
checkLineLimits();
checkConsole();
checkBundle();

for (const n of notes) console.log(`  · ${n}`);
if (failures.length) {
  console.error('\n[guards] ✗ Fallos:');
  for (const f of failures) console.error(`  - ${f}`);
  console.error('\n[guards] Corrige los fallos o, si la deuda es legítima, actualiza scripts/guards.mjs.');
  process.exit(1);
}
console.log('\n[guards] ✓ Todos los guardarraíles se cumplen.');
