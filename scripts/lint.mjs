import { execFileSync, execSync } from 'node:child_process';

console.log('[lint] 1/3: Verificando sintaxis con node --check...');
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
console.log(`[lint] OK: ${files.length} ficheros con sintaxis válida.`);

console.log('[lint] 2/3: Ejecutando ESLint...');
try {
  execFileSync(process.execPath, ['node_modules/eslint/bin/eslint.js', 'src/**/*.js', 'scripts/**/*.mjs', 'vite.config.js'], {
    stdio: 'inherit'
  });
  console.log('[lint] OK: ESLint pasó sin errores.');
} catch {
  console.error('[lint] ERROR: ESLint detectó problemas.');
  process.exit(1);
}

console.log('[lint] 3/3: Verificando tipos con TypeScript (jsconfig.json)...');
try {
  execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'jsconfig.json'], {
    stdio: 'inherit'
  });
  console.log('[lint] OK: TypeScript comprobación exitosa.');
} catch {
  console.error('[lint] ERROR: TypeScript comprobación fallida.');
  process.exit(1);
}

console.log('[lint] Pipeline de linting y tipado COMPLETADO con éxito.');
