/**
 * NetAudit.js - Auditoría automática de eventos de red WebRTC
 * 
 * Interceptor para diagnóstico en tiempo real de tráfico de paquetes
 * (snapshot, input, block-edit, init, door-open, etc.).
 */

export function initNetAudit() {
  if (typeof window === 'undefined') return;

  const AUDIT_EVENTS = [
    'input', 'snapshot', 'block-edit', 'init', 'door-open',
    'chest-open', 'peer-joined', 'peer-left', 'player-meta',
  ];

  const origDispatch = window.__net_dispatch || EventTarget.prototype.dispatchEvent;
  if (!window.__net_dispatch) {
    window.__net_dispatch = origDispatch;
    window.__netAuditLogs = [];
    window.__netEventCounts = {};

    EventTarget.prototype.dispatchEvent = function(ev) {
      if (ev.type && AUDIT_EVENTS.includes(ev.type)) {
        window.__netEventCounts[ev.type] = (window.__netEventCounts[ev.type] || 0) + 1;
        window.__netAuditLogs.push({ time: Date.now(), type: ev.type, detail: ev.detail });
        if (window.__netAuditLogs.length > 200) window.__netAuditLogs.shift();

        if (ev.type === 'snapshot') {
          const count = window.__netEventCounts['snapshot'];
          if (count <= 3 || count % 20 === 0) {
            console.log(`📨 [snapshot] (#${count} @ 20Hz)`, ev.detail);
          }
        } else {
          console.log(`📨 [${ev.type}]`, ev.detail);
        }
      }
      return origDispatch.call(this, ev);
    };
    console.log('✅ Interceptor de auditoría WebRTC instalado.');
  }

  window.printNetAudit = () => {
    console.log('===== AUDITORÍA DE MENSAJES RUNE =====');
    console.log('Modo:', window.__game?.mode || 'menú');
    console.log('Conteo de eventos:', window.__netEventCounts);
    console.log('Últimos 10 eventos:', (window.__netAuditLogs || []).slice(-10));
    return window.__netEventCounts;
  };
}
