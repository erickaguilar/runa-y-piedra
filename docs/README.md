# Documentación Técnica: Sandbox 3D Multijugador Móvil WebGL

Este directorio contiene el compendio integral de hallazgos técnicos, diseño de arquitectura, presupuestos de rendimiento y protocolos de comunicación para un entorno 3D sandbox multijugador a 60 FPS estables en navegadores móviles estándar.

---

## Índice de Documentos

0. [**00. Especificación Maestra de Arquitectura e Implementación**](./00-especificacion-maestra.md)
   - Requerimientos completos del proyecto, mapa 24x24, paquetes exactos de 13 y 14 bytes, Raycaster autoritativo, roles y prompt de acción.

1. [**01. Requerimientos de Hardware y Presupuesto de Rendimiento**](./01-hardware-y-presupuesto-rendimiento.md)
   - Perfil de hardware móvil objetivo (gama de entrada/media: 3-4 GB RAM, WebGL 2.0).
   - Presupuesto estricto: Draw Calls (20-40), Triángulos (15k-40k), memoria Heap (<120 MB) y DPR limit ($\le 1.25$).
   - Las 4 optimizaciones críticas para evitar OOM y estrangulamiento térmico.

2. [**02. Stack Tecnológico de 6 Capas**](./02-stack-tecnico-6-capas.md)
   - Desglose y justificación técnica de cada capa:
     1. Gráficos: Three.js + `THREE.InstancedMesh`
     2. Red P2P: WebRTC + PeerJS / QR Code
     3. Físicas: Custom AABB / Rapier3D WASM
     4. Input Móvil: Nipple.js + Touch Events pasivos
     5. Serialización: TypedArrays nativos (13 bytes)
     6. Despliegue: Vite + Vercel (HTTPS obligatorio)

3. [**03. Protocolo de Red Binario y Señalización WebRTC**](./03-protocolo-red-binario-webrtc.md)
   - Arquitectura Listen-Server (Topología en Estrella).
   - Formato exacto de paquetes binarios de cero asignación (Zero-GC).
   - Señalización ágil por código PIN (PeerJS) y señalización 100% offline sin servidor (QR Handshake con SDP comprimido).
   - Buffer de snapshots e interpolación lineal (Lerp) para movimiento a 60 FPS.

4. [**04. Motor de Físicas y Estructura de Vóxeles**](./04-motor-fisica-voxeles.md)
   - Grid de vóxeles plano en `Uint8Array` (16 KB en memoria).
   - Bucle de física desacoplado a 30 Hz con acumulador de delta time.
   - Algoritmo AABB cubo-caja de costo computacional nulo y 0 allocations.

5. [**05. Controles Táctiles y Experiencia Móvil (UX)**](./05-controles-moviles-ux.md)
   - Esquema de pantalla dividida: Joystick virtual dinámico (Nipple.js) y zona de rotación de cámara.
   - Manejo de Touch Events con banderas `{ passive: true }` y prevención de gestos nativos del navegador.
   - Soporte automático para teclado y ratón (Pointer Lock API) para pruebas en PC.

6. [**06. Arquitectura Listen-Server y Modelo de Hosting (Vercel + P2P)**](./06-arquitectura-listen-server-hosting.md)
   - Distribución tripartita de responsabilidades (Vercel vs. Móvil Host vs. Móvil Cliente).
   - Costo cero de backend y conmutación de tráfico al router Wi-Fi local (< 5 ms).
   - Análisis de ventajas y limitaciones del servidor anfitrión en memoria.

7. [**07. Arquitectura Atómica y Modular del Código**](./07-arquitectura-atomica-modular.md)
   - Desglose de responsabilidades únicas (SRP) por módulo y carpeta.
   - Eliminación del antipatrón God-file y desacoplamiento de simulación, input y render.

8. [**08. Sistema de Mazmorras, Niveles y Progresión Cooperativa**](./08-sistema-mazmorras-niveles-y-progresion.md)
   - Definición de escenarios desacoplada en JSON (`dungeon_classic.json`, `crypt_inferno.json`).
   - `LevelLoader` y `LevelRegistry` para conmutación de mapas en caliente.
   - Techos abovedados, umbral continuo bajo puertas, parkour en el abismo/lava y sensación de caída libre ($5.5\text{ m}$).
   - Puntos de control automáticos (Checkpoints por sala) y cofres interactivos con animación 3D de tapa ($77^\circ$).

9. [**09. Biblioteca de Héroes, Clases Únicas y Modificadores Físicos**](./09-biblioteca-heroes-clases-y-fisica.md)
   - Base de datos declarativa en JSON (`heroes.json`) y gestor `HeroRegistry`.
   - Las 5 clases oficiales: Aventurero, Paladín, Explorador, Hechicero y Guardián.
   - Modificadores físicos de velocidad y salto en tiempo real (`speedMultiplier`, `jumpMultiplier`).
   - Tarjetas dinámicas de características en el menú y avatares 3D con distintivos y nameplates flotantes.

10. [**10. Sistema de Iconografía SVG Vectorial y Experiencia de Usuario (UI/UX)**](./10-sistema-iconografia-svg-y-ui-ux.md)
    - Repositorio global de iconos vectoriales SVG (`Icons.js`) y reemplazo del 100% de emojis.
    - Utilidad reactiva `replaceEmojisWithSvg` para textos y mensajes narrativos del HUD.
    - Integración completa de la Sala de Expedición en el modal de ⚙️ Configuración (sin segundo modal).
    - Maquetación elástica anti-desbordamiento del botón "Unirse" en resoluciones móviles estrechas.
    - Visibilidad contextual inteligente de botones de acción táctiles.

11. [**11. Protocolo Híbrido v2, Telemetría de Red y Resiliencia WebRTC**](./11-protocolo-hibrido-v2-telemetria-y-resiliencia.md)
    - Protocolo híbrido DataView Zero-GC para hot paths (15 bytes INPUT, 8+N*17 bytes SNAPSHOT).
    - `PROTOCOL_VERSION = 2` y handshake de verificación estricta contra versiones obsoletas.
    - Medición en caliente de RTT (Ping/Pong a 1 Hz) con media móvil de jitter.
    - Cierre ordenado de sala (`HOST_CLOSING`) en `beforeunload` y sincronización de `LEVEL_CHANGE`.
    - Monitor HUD de telemetría en tiempo real (`NetworkStats.js`) con toggle `?debug=1`.

12. [**12. Reconciliación Cliente-Servidor Real e Interpolación Temporal de Snapshots**](./12-reconciliacion-cliente-servidor-e-interpolacion.md)
    - Netcode determinista con predicción local en cliente a 60 FPS y buffer de inputs pendientes.
    - Reconciliación autoritativa por ack explícito (`lastInputSeq` en SNAPSHOT a 19 bytes/entidad).
    - Repetición (*replay*) física Zero-GC con umbrales de tolerancia ($0.04\text{ m}$) y teletransporte ($2.5\text{ m}$).
    - Interpolación temporal de entidades remotas a $100\text{ ms}$ en el pasado para absorber jitter de Wi-Fi.
    - Nuevas métricas en el HUD: `Pred Err (m)`, `In Flight` y `Corrections/s`.


