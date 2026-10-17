/// <reference types="vite/client" />

// Declaraciones de tipos para globales de diagnóstico/desarrollo expuestos en `window`.
// El sufijo `__`/`__net` denota herramientas de depuración (ver `src/network/NetAudit.js`).

interface Window {
  /** Instancia global del juego (solo en desarrollo/diagnóstico). */
  __game?: { mode?: string | null };
  /** Fachada de red expuesta para depuración desde consola. */
  network?: object;
  /** PeerJS activo del host. */
  __peer?: unknown;
  /** Conexiones RTC registradas para inspección manual. */
  __debugPeerConnections?: unknown[];
  /** Override del dispatcher de eventos para la auditoría de red. */
  __net_dispatch?: (event: Event) => boolean;
  /** Registro circular de eventos de red capturados. */
  __netAuditLogs?: Array<{ time: number; type: string; detail?: unknown }>;
  /** Conteo acumulado de eventos de red por tipo. */
  __netEventCounts?: Record<string, number>;
  /** Último volcado de coordenadas del overlay de depuración. */
  __lastCoordsDebug?: any;
  /** Volcado de la auditoría de red a la consola. */
  printNetAudit?: () => Record<string, number> | undefined;
  /** Contexto de audio con prefijo de proveedor (Safari). */
  webkitAudioContext?: typeof AudioContext;
}
