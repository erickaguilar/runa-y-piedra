/**
 * LeaderElection.js - Elección Determinista de Líder para Host-Migration
 *
 * Algoritmo distribuido puro sin votaciones asíncronas en red:
 * Todos los peers supervivientes disponen del mismo peerRoster sincronizado
 * y determinan exactamente el mismo nuevo anfitrión mediante ordenación determinista.
 */

/**
 * Elige al nuevo líder entre los candidatos de la sala.
 *
 * Criterio de ordenación determinista:
 * 1. Menor `playerId` (prioridad absoluta a los jugadores con mayor antigüedad en la sesión).
 * 2. Menor timestamp `joinedAt` (en caso de igualdad o ids dinámicos).
 * 3. Comparación lexicográfica de `peerId` (desempate estricto y único).
 *
 * @param {Array<{peerId: string, playerId: number, name?: string, colorIndex?: number, joinedAt?: number}>} roster
 * @param {string} myPeerId - ID de PeerJS del cliente local
 * @param {string|null} currentHostPeerId - ID del host que acaba de caer para excluirlo
 * @returns {{leader: Object|null, isLeader: boolean, candidates: Array<Object>}}
 */
export function electLeader(roster = [], myPeerId = '', currentHostPeerId = null) {
  if (!Array.isArray(roster) || roster.length === 0) {
    return { leader: null, isLeader: false, candidates: [] };
  }

  // Filtrar al host caído (playerId === 0 o con su peerId coincidente)
  const candidates = roster.filter((p) => {
    if (!p || typeof p !== 'object') return false;
    if (p.playerId === 0) return false;
    if (currentHostPeerId && p.peerId === currentHostPeerId) return false;
    return Boolean(p.peerId);
  });

  if (candidates.length === 0) {
    return { leader: null, isLeader: false, candidates: [] };
  }

  // Ordenación determinista
  candidates.sort((a, b) => {
    const idA = Number.isInteger(a.playerId) ? a.playerId : 999;
    const idB = Number.isInteger(b.playerId) ? b.playerId : 999;
    if (idA !== idB) return idA - idB;

    const timeA = typeof a.joinedAt === 'number' ? a.joinedAt : 0;
    const timeB = typeof b.joinedAt === 'number' ? b.joinedAt : 0;
    if (timeA !== timeB) return timeA - timeB;

    return String(a.peerId || '').localeCompare(String(b.peerId || ''));
  });

  const leader = candidates[0];
  const isLeader = Boolean(myPeerId && leader.peerId === myPeerId);

  return { leader, isLeader, candidates };
}

/**
 * Deriva un PIN de sala de migración determinista a partir del PIN o RoomId original.
 * Ejemplos:
 *  '4821' -> '4821-M'
 *  'VOXELSALA-4821' -> '4821-M'
 *  '4821-M' -> '4821-M2'
 */
export function deriveMigrationPin(pinOrRoomId) {
  if (!pinOrRoomId) return 'MIGRATE';
  let raw = String(pinOrRoomId).trim();
  if (raw.startsWith('VOXELSALA-')) {
    raw = raw.replace(/^VOXELSALA-/, '');
  }
  const match = raw.match(/^(.+)-M(\d*)$/);
  if (match) {
    const base = match[1];
    const round = match[2] ? parseInt(match[2], 10) + 1 : 2;
    return `${base}-M${round}`;
  }
  return `${raw}-M`;
}

/**
 * Deriva el RoomId completo de migración ('VOXELSALA-XXXX-M').
 */
export function deriveMigrationRoomId(pinOrRoomId) {
  const pin = deriveMigrationPin(pinOrRoomId);
  return 'VOXELSALA-' + pin;
}
