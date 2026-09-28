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
