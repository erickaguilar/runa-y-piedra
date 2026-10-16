import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const hookPath = path.resolve('.githooks/pre-commit');

try {
  if (fs.existsSync(hookPath)) {
    fs.chmodSync(hookPath, 0o755);
  }
  execSync('git config core.hooksPath .githooks', { stdio: 'ignore' });
  console.log('[hooks] Git core.hooksPath configurado en .githooks (pre-commit activo).');
} catch {
  // Ignorar silenciosamente en entornos CI sin repositorio .git
}
