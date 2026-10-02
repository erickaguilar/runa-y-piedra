export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.relay.metered.ca:80' },
];

function getTurnOverride() {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const url = localStorage.getItem('dungeon_turn_url');
      const user = localStorage.getItem('dungeon_turn_user') || '';
      const pass = localStorage.getItem('dungeon_turn_pass') || '';
      if (url) {
        return { urls: url, username: user || undefined, credential: pass || undefined };
      }
    }
  } catch { /* localStorage / window no disponible */ }
  return null;
}

function getEnvTurnCredentials() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const url = import.meta.env.VITE_TURN_URL;
      const user = import.meta.env.VITE_TURN_USERNAME;
      const pass = import.meta.env.VITE_TURN_CREDENTIAL;
      if (user || pass || url) return { url, user, pass };
    }
  } catch { /* ignore */ }
  return {};
}

export function getIceConfig() {
  const iceServers = [...ICE_SERVERS];
  const override = getTurnOverride();
  if (override) {
    iceServers.unshift(override);
    return { iceServers, iceCandidatePoolSize: 10 };
  }

  const { url, user, pass } = getEnvTurnCredentials();
  if (user && pass) {
    const turnUrl = url || 'turn:global.relay.metered.ca:80';
    iceServers.unshift(
      { urls: turnUrl, username: user, credential: pass },
      { urls: `${turnUrl}?transport=tcp`, username: user, credential: pass }
    );
  }
  return { iceServers, iceCandidatePoolSize: 10 };
}

export function translatePeerError(e) {
  const raw = String(e?.message || e?.type || e || '');
  if (e?.type === 'peer-unavailable' || /peer-unavailable|Could not connect to peer/i.test(raw)) {
    return 'No se pudo contactar al anfitrión (sala no encontrada). Causas comunes: el anfitrión cerró la partida, cambió de app en móvil (pantalla apagada o en segundo plano), o el PIN es incorrecto. Vuelve a intentarlo.';
  }
  if (e?.type === 'unavailable-id' || /unavailable-id|taken/i.test(raw)) {
    return 'El PIN ya está en uso. Genera una sala nueva.';
  }
  if (e?.type === 'network' || /network/i.test(raw)) {
    return 'Error de conexión de red o NAT restrictivo. Comprueba la conexión Wi-Fi/datos e inténtalo de nuevo.';
  }
  if (e?.type === 'server-error' || /server/i.test(raw)) {
    return 'Servidor de señalización no disponible temporalmente. Reintenta en unos segundos.';
  }
  return raw;
}
