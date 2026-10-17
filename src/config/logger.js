/**
 * logger.js - Registro de mensajes con *gate* por modo depuración.
 *
 * `debug`/`info` solo se emiten si la depuración está activa; `warn`/`error`
 * se emiten siempre (son señales reales de problemas).
 *
 * La depuración se activa con cualquiera de estas condiciones:
 * - `?debug=1` en la URL (permite depurar también en producción).
 * - `localStorage.runa_debug === '1'`.
 * - Entorno de desarrollo de Vite (`import.meta.env.DEV`).
 *
 * Este archivo es la única pasarela a `console`; la regla `no-console` está
 * desactivada aquí y activa en el resto del código (ver `eslint.config.js`).
 */
/* eslint-disable no-console */

function detectDebug() {
  try {
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      if (new URLSearchParams(window.location.search).get('debug') === '1') return true;
    }
  } catch { /* entorno sin DOM */ }

  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('runa_debug') === '1') return true;
  } catch { /* almacenamiento no disponible */ }

  try {
    if (import.meta.env?.DEV) return true;
  } catch { /* import.meta.env no disponible (Node/tests) */ }

  return false;
}

/** Bandera de depuración evaluada una sola vez al cargar el módulo. */
export const debugEnabled = detectDebug();

export const logger = {
  /** @returns {boolean} True si los mensajes de depuración están habilitados. */
  get enabled() {
    return debugEnabled;
  },

  /** @param {...any} args */
  debug(...args) {
    if (debugEnabled) console.log(...args);
  },

  /** @param {...any} args */
  info(...args) {
    if (debugEnabled) console.info(...args);
  },

  /** @param {...any} args */
  warn(...args) {
    console.warn(...args);
  },

  /** @param {...any} args */
  error(...args) {
    console.error(...args);
  }
};
