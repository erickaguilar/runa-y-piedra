export function isHotChannel(conn) {
  if (conn?.reliable === false) return true;
  if (conn?.dataChannel && conn.dataChannel.ordered === false) return true;
  const label = conn?.label || conn?.metadata?.channel || '';
  return /hot/i.test(label);
}

export function trackLink(linkMap, conn, kind) {
  // kind: 'safe' | 'hot'. Agrupa ambos canales por peer remoto.
  const peerId = conn?.peer;
  if (!peerId) return null;
  if (!linkMap) return null;
  let link = linkMap.get(peerId);
  if (!link) {
    link = {};
    linkMap.set(peerId, link);
  }
  link[kind] = conn;
  return link;
}

export function safeForConn(linkMap, conn) {
  // Normaliza al canal safe para que PlayerManager/InputQueue usen una clave estable.
  const peerId = conn?.peer;
  const link = peerId && linkMap?.get(peerId);
  if (link?.safe) return link.safe;
  return conn;
}
