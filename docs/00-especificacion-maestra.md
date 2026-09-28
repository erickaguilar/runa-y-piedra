# 00. Especificación Maestra: Sandbox Voxel Multijugador P2P Web

Este documento contiene la especificación de arquitectura y requerimientos de implementación definitiva para el proyecto.

---

## 1. Visión General del Proyecto
Crear un minijuego sandbox 3D interactivo multijugador para navegadores móviles y de escritorio, optimizado para ejecutarse fluidamente (60 FPS) en dispositivos móviles estándar globales (gama de entrada/media, 3–4 GB RAM).
- **Modelo de Red**: Arquitectura Listen-Server (uno de los navegadores actúa como servidor autoritativo).
- **Tráfico de Juego**: P2P directo sobre Wi-Fi local mediante WebRTC DataChannel (latencia LAN < 5 ms, 0 kbps de consumo en servidores externos durante el gameplay).
- **Alojamiento**: Sitio estático servido bajo HTTPS vía Vercel (únicamente para servir el bundle web inicial).

---

## 2. Stack Tecnológico
| Capa | Tecnología | Propósito |
|---|---|---|
| **Build Tool** | Vite (Vanilla TypeScript o JavaScript ES Modules) | Servidor local rápido y bundler minificado para producción. |
| **Motor 3D** | Three.js (r128+) | Renderizado WebGL 2.0. |
| **Optimizador Geometría** | `THREE.InstancedMesh` | Renderizar todo el terreno/bloques en 1 solo Draw Call. |
| **Red P2P** | WebRTC (`RTCDataChannel`) + PeerJS | Comunicación UDP/SCTP directa; señalización ligera con PINs de 4 dígitos. |
| **Input Móvil** | Nipple.js | Joystick virtual táctil sin dependencias. |
| **Serialización** | JavaScript TypedArray (`ArrayBuffer`, `DataView`) | Transferencia binaria de bajo peso (evitar Garbage Collection por JSON). |
| **Físicas** | AABB (*Axis-Aligned Bounding Box*) custom | Físicas volumétricas ligeras calculadas en CPU móvil sin saturar el hilo. |

---

## 3. Arquitectura del Sistema y Roles

### A. Dispositivo Host (Servidor Autoritativo + Render Local)
- **Bucle de Simulación Fijo (Tick Rate)**: Corre a 20–30 Hz mediante un acumulador de tiempo o setInterval.
- **Mundo Maestro**: Mantiene la cuadrícula tridimensional de bloques (en memoria como un `Uint8Array` 3D plano).
- **Árbitro de Físicas y Reglas**: Procesa inputs de ambos jugadores, resuelve colisiones AABB, valida colocación/destrucción de bloques y calcula posiciones reales.
- **Broadcasting**: Envía paquetes binarios de sincronización a los clientes conectados a 20–30 Hz.

### B. Dispositivo Cliente (Terminal de Renderizado)
- **Captura de Input**: Lee el joystick (Nipple.js) y botones táctiles a 60 Hz.
- **Envío al Host**: Envía deltas de movimiento mediante un paquete binario ultra-compacto.
- **Interpolación (Lerp)**: Recibe deltas del servidor e interpola suavemente la posición de los avatares a 60 FPS en pantalla.

---

## 4. Protocolo Binario de Red (Especificación de Paquetes)

Tipos de Mensajes (`Uint8 Header`):
- `0x01`: Input del Cliente -> Host (Movimiento y rotación).
- `0x02`: Snapshot del Host -> Cliente (Posición global de avatares).
- `0x03`: Modificación de Bloque (Destrucción/Colocación).
- `0x04`: Sincronización Inicial del Mapa (Chunk data al unirse).

### Layout del Paquete de Movimiento (13 bytes):
- `[0]` `Uint8` -> `MessageType (0x01)`
- `[1..4]` `Float32` -> Input Delta X
- `[5..8]` `Float32` -> Input Delta Z
- `[9..12]` `Float32` -> Yaw Angle (Rotación horizontal)

### Layout de Modificación de Bloque (14 bytes):
- `[0]` `Uint8` -> `MessageType (0x03)`
- `[1]` `Uint8` -> `Action (0 = Destruir, 1 = Colocar)`
- `[2..5]` `Int32` -> Grid X
- `[6..9]` `Int32` -> Grid Y
- `[10..13]` `Int32` -> Grid Z

---

## 5. Pipeline de Gráficos y Renderizado (Three.js)

### Terreno Voxel con `THREE.InstancedMesh`
- **Configuración de la Malla**: Mapa base de $24 \times 24$ (576 bloques) manejado por una única instancia de `InstancedMesh(BoxGeometry, MeshLambertMaterial, N)`.
- **Transformación Eficiente**: Usar un `THREE.Object3D` ficticio (`dummy`) compartido para actualizar posiciones y rotaciones sin crear matrices nuevas en el loop.
- **Destrucción de Bloques**: Escalar la instancia a $(0, 0, 0)$ y trasladarla a $(0, -9999, 0)$, activando `instancedMesh.instanceMatrix.needsUpdate = true`.
- **Colocación de Bloques**: Usar `intersects[0].face.normal` del Raycaster para calcular la celda contigua vacía y asignar una instancia disponible.

### Restricciones para Navegadores Móviles (Budget):
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))` obligatorio.
- `powerPreference: "high-performance"`.
- Draw Calls máximos del frame: $< 25$.
- Sombras dinámicas complejas desactivadas (iluminación direccional fija + luz ambiental Lambert).

---

## 6. Flujo de Conexión P2P (Señalización con PeerJS)
- **Host**:
  - Inicializa `const peer = new Peer('SALA-' + Math.floor(1000 + Math.random() * 9000))`.
  - Muestra el código de 4 dígitos en el UI y el código QR.
  - Escucha `peer.on('connection', (conn) => setupHostChannel(conn))`.
  - Configuración de canal: `{ ordered: false, maxRetransmits: 0 }`.
- **Cliente**:
  - Introduce el PIN en el input o escanea el QR.
  - Ejecuta `const conn = peer.connect('SALA-' + pin, { reliable: false })`.
  - Al abrirse (`conn.on('open')`), solicita el snapshot inicial del mundo y comienza a enviar inputs.
