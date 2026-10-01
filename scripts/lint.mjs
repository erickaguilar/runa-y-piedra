import { execFileSync, execSync } from 'node:child_process';

let files = [];
try {
  const out = execSync('git ls-files "*.js" "*.mjs" | grep -E "^(src|tests|scripts)/|^vite.config.js$" || true', { encoding: 'utf8' });
  files = out.split('\n').map((s) => s.trim()).filter(Boolean);
} catch {
  files = [];
}

if (files.length === 0) {
  console.error('[lint] No se encontraron ficheros JS para verificar.');
  process.exit(1);
}

let failed = 0;
for (const f of files) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  } catch (e) {
    failed += 1;
    const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || e.message);
    console.error(`[lint] ERROR en ${f}:\n${out}`);
  }
}

if (failed > 0) {
  console.error(`[lint] ${failed}/${files.length} ficheros con errores de sintaxis.`);
  process.exit(1);
}
console.log(`[lint] OK: ${files.length} ficheros verificados con node --check.`);
