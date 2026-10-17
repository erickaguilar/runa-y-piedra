/**
 * IncomingMixin.js - Despacho de mensajes entrantes del protocolo de red.
 *
 * Composición por mixin sobre `NetworkManager.prototype`. Los métodos asumen el
 * contexto de `NetworkManager` (`this.stats`, `this.voiceManager`, `this._links`, ...).
 */
import * as Proto from './Protocol.js';
import { saveWorldSnapshot } from './HostSnapshot.js';

export const IncomingMixin = {
  /** Info de diagnóstico para UI: ¿hay hot o estamos en fallback safe? */
  getLinkInfo() {
    if (this.isHost) {
      let hot = 0;
      for (const [, link] of this._links || []) {
        if (link?.hot?.open) hot++;
      }
      return { mode: 'HOST', peers: this.connections.length, hotPeers: hot, fallback: hot < this.connections.length };
    }
    const safeOpen = !!this.hostConn?.open;
    const hotOpen = !!this.hostHotConn?.open;
    return { mode: 'CLIENT', safeOpen, hotOpen, fallback: safeOpen && !hotOpen };
  },

  _handleIncoming(data, conn) {
    let buf;
    if (data instanceof ArrayBuffer) {
      buf = data;
    } else if (ArrayBuffer.isView(data)) {
      buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    } else if (data?.buffer instanceof ArrayBuffer) {
      buf = data.buffer;
    } else {
      buf = data;
    }
    if (!buf || buf.byteLength < 1) return;
    this.stats.recordPacketIn(buf.byteLength);

    const isHot = this._isHotChannel(conn);
    const peerId = conn?.peer;
    if (isHot && peerId && this._links) {
      const link = this._links.get(peerId);
      if (link) link.hotReady = true;
    }

    // Normalizar al canal safe para claves estables (PlayerManager/InputQueue).
    const logicalConn = this.isHost ? this._safeForConn(conn) : conn;

    const v = new DataView(buf);
    const type = v.getUint8(0);

    switch (type) {
      case Proto.MSG.INPUT: {
        const m = Proto.deserializeInput(buf);
        m.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('input', { detail: m }));
        break;
      }

      case Proto.MSG.SNAPSHOT: {
        const s = Proto.deserializeSnapshot(buf);
        this.stats.recordSnapshotSeq(s.seq);
        this.dispatchEvent(new CustomEvent('snapshot', {
          detail: {
            players: s.players,
            seq: s.seq,
            time: s.time,
          }
        }));
        break;
      }

      case Proto.MSG.PING: {
        // El Host responde de inmediato con PONG y el mismo timestamp del cliente
        // (por hot si existe para no bloquear el canal fiable).
        if (this.isHost) {
          const p = Proto.deserializePing(buf);
          this.sendToHot(logicalConn, Proto.serializePong(p.time));
        }
        break;
      }

      case Proto.MSG.PONG: {
        // El cliente calcula el RTT exacto
        const p = Proto.deserializePong(buf);
        const rtt = Math.round(performance.now() - p.time);
        this.stats.recordRtt(rtt);
        this.dispatchEvent(new CustomEvent('rtt-update', { detail: { rtt } }));
        break;
      }

      case Proto.MSG.INIT: {
        const init = Proto.deserializeInit(buf);
        // Comprobación estricta de versión del protocolo
        if (init.version !== Proto.PROTOCOL_VERSION) {
          this.dispatchEvent(new CustomEvent('version-mismatch', {
            detail: {
              hostVersion: init.version,
              clientVersion: Proto.PROTOCOL_VERSION,
            }
          }));
          return;
        }
        this.dispatchEvent(new CustomEvent('init', { detail: init }));
        break;
      }

      case Proto.MSG.HOST_CLOSING: {
        this.dispatchEvent(new CustomEvent('host-closing', { detail: Proto.deserializeHostClosing(buf) }));
        break;
      }

      case Proto.MSG.LEVEL_CHANGE: {
        const lvl = Proto.deserializeLevelChange(buf);
        this.dispatchEvent(new CustomEvent('level-change', { detail: lvl }));
        break;
      }

      case Proto.MSG.BLOCK: {
        const m = Proto.deserializeBlock(buf);
        m.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('block-edit', { detail: m }));
        break;
      }

      case Proto.MSG.DOOR: {
        const d = Proto.deserializeDoorOpen(buf);
        this.dispatchEvent(new CustomEvent('door-open', { detail: { doorId: d.doorId, conn: logicalConn } }));
        break;
      }

      case Proto.MSG.PLAYER_META: {
        const m = Proto.deserializePlayerMeta(buf);
        m.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('player-meta', { detail: m }));
        break;
      }

      case Proto.MSG.CHEST_OPEN: {
        const c = Proto.deserializeChestOpen(buf);
        this.dispatchEvent(new CustomEvent('chest-open', { detail: { chestId: c.chestId, conn: logicalConn } }));
        break;
      }

      case Proto.MSG.DESCENT: {        const d = Proto.deserializeDescent(buf);
        // NOW solo lo procesa el Host; START/GO solo los clientes
        // (el Host ejecuta su propio descenso en local).
        if (d.kind === Proto.DESCENT_KIND.NOW && !this.isHost) break;
        if (d.kind !== Proto.DESCENT_KIND.NOW && this.isHost) break;
        d.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('descent', { detail: d }));
        break;
      }

      case Proto.MSG.STAIRS: {
        const s = Proto.deserializeStairs(buf);
        // REQ solo lo procesa el Host; OPEN solo los clientes.
        if (s.kind === Proto.STAIRS_KIND.REQ && !this.isHost) break;
        if (s.kind !== Proto.STAIRS_KIND.REQ && this.isHost) break;
        s.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('stairs', { detail: s }));
        break;
      }

      case Proto.MSG.PEDESTAL: {
        const p = Proto.deserializePedestal(buf);
        // Peticiones solo las procesa el Host; ceremonias solo los clientes
        // (el Host ejecuta su propia ceremonia en local sin pasar por la red).
        if (p.isRequest && !this.isHost) break;
        if (!p.isRequest && this.isHost) break;
        p.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('pedestal', { detail: p }));
        break;
      }

      case Proto.MSG.KEY: {
        // Solo el Host otorga llaves: los clientes ignoran KEY entrantes no solicitados
        // y el Host ignora KEY de clientes (anti-trampas: nadie se auto-otorga llaves).
        if (this.isHost) break;
        const k = Proto.deserializeKeyUpdate(buf);
        this.dispatchEvent(new CustomEvent('key-update', { detail: k }));
        break;
      }

      case Proto.MSG.POTION: {
        // Solo el Host procesa peticiones de poción de clientes para sincronizar la salud autoritativa
        if (!this.isHost) break;
        const potionData = Proto.deserializePotionUse(buf);
        potionData.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('potion-use', { detail: potionData }));
        break;
      }

      case Proto.MSG.WORLD_SNAPSHOT: {
        // Solo los clientes procesan snapshots de mundo (el Host es la fuente).
        if (this.isHost) break;
        const snap = Proto.deserializeWorldSnapshot(buf);
        if (!snap) break;
        saveWorldSnapshot(snap);
        this.dispatchEvent(new CustomEvent('world-snapshot', { detail: snap }));
        break;
      }

      case Proto.MSG.PEER_ROSTER: {
        // Solo los clientes procesan el roster sincronizado por el Host
        if (this.isHost) break;
        const roster = Proto.deserializePeerRoster(buf);
        if (Array.isArray(roster)) {
          this.peerRoster = roster;
          this.dispatchEvent(new CustomEvent('peer-roster', { detail: { roster } }));
        }
        break;
      }

      case Proto.MSG.CHAPTER_SELECT: {
        const cs = Proto.deserializeChapterSelect(buf);
        cs.conn = logicalConn;
        this.dispatchEvent(new CustomEvent('chapter-select', { detail: cs }));
        break;
      }
    }
  }
};
