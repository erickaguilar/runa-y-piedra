export const WORLD_SNAPSHOT_KEY = 'runa_world_snapshot_v1';
export const WORLD_SNAPSHOT_MAX_AGE_MS = 10 * 60 * 1000; // 10 min

export function buildWorldSnapshot({
  levelId = 'lobby_tutorial',
  chapterId = 'capitulo_1',
  doorsOpen = [],
  chestsOpen = [],
  stairsOpen = false,
  at = Date.now(),
} = {}) {
  const norm = (arr) => [...new Set((arr || []).map((v) => Number(v)).filter((v) => Number.isFinite(v)))].sort((a, b) => a - b);
  return {
    v: 1,
    levelId: String(levelId || 'lobby_tutorial'),
    chapterId: String(chapterId || 'capitulo_1'),
    doorsOpen: norm(doorsOpen),
    chestsOpen: norm(chestsOpen),
    stairsOpen: !!stairsOpen,
    at: Number(at) || Date.now(),
  };
}

export function isValidWorldSnapshot(snap) {
  if (!snap || typeof snap !== 'object') return false;
  if (snap.v !== 1) return false;
  if (typeof snap.levelId !== 'string' || snap.levelId.length === 0) return false;
  if (snap.chapterId !== undefined && typeof snap.chapterId !== 'string') return false;
  if (!Array.isArray(snap.doorsOpen) || !Array.isArray(snap.chestsOpen)) return false;
  return true;
}

function getSessionStorage() {
  try {
    if (typeof sessionStorage !== 'undefined') return sessionStorage;
    if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage;
  } catch { /* entorno sin sessionStorage (node/tests) */ }
  return null;
}

export function saveWorldSnapshot(snap) {
  if (!isValidWorldSnapshot(snap)) return false;
  const store = getSessionStorage();
  if (!store) return false;
  try {
    store.setItem(WORLD_SNAPSHOT_KEY, JSON.stringify(snap));
    return true;
  } catch {
    return false;
  }
}

export function loadWorldSnapshot(maxAgeMs = WORLD_SNAPSHOT_MAX_AGE_MS) {
  const store = getSessionStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(WORLD_SNAPSHOT_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw);
    if (!isValidWorldSnapshot(snap)) return null;
    if (maxAgeMs > 0 && Date.now() - snap.at > maxAgeMs) return null;
    return snap;
  } catch {
    return null;
  }
}

export function clearWorldSnapshot() {
  const store = getSessionStorage();
  if (!store) return;
  try {
    store.removeItem(WORLD_SNAPSHOT_KEY);
  } catch { /* ignore */ }
}
