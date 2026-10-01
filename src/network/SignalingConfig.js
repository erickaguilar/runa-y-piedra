export const ICE_SERVERS = [
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:global.relay.metered.ca:80',
    username: '520abdc449e671e900251fc6',
    credential: 'ML25kOXmKOcfSLFO',
  },
  {
    urls: 'turn:global.relay.metered.ca:80?transport=tcp',
    username: '520abdc449e671e900251fc6',
    credential: 'ML25kOXmKOcfSLFO',
  },
  {
    urls: 'turn:global.relay.metered.ca:443',
    username: '520abdc449e671e900251fc6',
    credential: 'ML25kOXmKOcfSLFO',
  },
  {
    urls: 'turns:global.relay.metered.ca:443?transport=tcp',
    username: '520abdc449e671e900251fc6',
    credential: 'ML25kOXmKOcfSLFO',
  },
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
      const user = import.meta.env.VITE_TURN_USERNAME;
      const pass = import.meta.env.VITE_TURN_CREDENTIAL;
      if (user || pass) return { user, pass };
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
  // Aplicar credenciales de entorno a las entradas Metered por defecto
  const { user, pass } = getEnvTurnCredentials();
  if (user || pass) {
    return {
      iceServers: iceServers.map((s) =>
        String(s.urls || '').includes('relay.metered.ca')
          ? { ...s, username: user || s.username, credential: pass || s.credential }
          : s
      ),
      iceCandidatePoolSize: 10,
    };
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
