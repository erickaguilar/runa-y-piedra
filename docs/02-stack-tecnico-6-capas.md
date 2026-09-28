# 02. Stack Tecnológico de 6 Capas

Para construir el sandbox multijugador bajo la arquitectura Listen-Server en navegadores móviles, el software se organiza en 6 capas altamente desacopladas:

```
+-------------------------------------------------------------+
| 6. Empaquetado, Assets y Hosting (Vite + Vercel HTTPS)      |
+-------------------------------------------------------------+
| 4. Controles y UX Móvil (Nipple.js + Touch API + Fallbacks) |
+-------------------------------------------------------------+
| 1. Renderizado 3D (Three.js + InstancedMesh + DPR Clamping) |
+-------------------------------------------------------------+
| 3. Físicas y Lógica (Host AABB Propio / Rapier3D WASM)      |
+-------------------------------------------------------------+
| 5. Serialización Binaria (TypedArrays Zero-GC / 13 bytes)    |
+-------------------------------------------------------------+
| 2. Red y Señalización P2P (WebRTC DataChannel + PeerJS/QR)  |
+-------------------------------------------------------------+
```

---

## Capa 1: Renderizado y Gráficos 3D
- **Three.js (r128+)**: Motor estándar WebGL 2.0 para la gestión de escenas, cámaras, iluminación y mallas.
- **`THREE.InstancedMesh`**: Técnica fundamental para renderizar toda la arena (1,024 bloques en suelo más bordes y obstáculos) en **1 solo Draw Call**, manipulando matrices de transformación en la GPU en lugar de nodos individuales de escena.
- **`three-mesh-bvh` (Opcional)**: Aceleración de raycasting contra geometrías complejas mediante árboles de jerarquías de cajas envolventes, optimizando la detección de bloques al interactuar o construir.

## Capa 2: Capa de Red y Señalización (P2P)
- **WebRTC (`RTCDataChannel`)**: API nativa del navegador para transferencia en tiempo real vía UDP/SCTP con opciones `ordered: false` y `maxRetransmits: 0`. Permite latencias en red local Wi-Fi inferiores a 5 ms.
- **PeerJS**:
  - En cliente: abstrae la negociación SDP y candidatos ICE con llamadas limpias.
  - En la nube: utiliza el servidor de señalización gratuito de PeerJS solo durante el primer segundo para negociar la conexión mediante códigos de sala tipo PIN (ej. `4321`).
- **html5-qrcode / qrcode.js (Alternativa offline)**: Generación y lectura de configuración SDP mediante la cámara de los dispositivos para funcionamiento 100% desconectado de internet.

## Capa 3: Físicas y Lógica del Mundo (Host)
Dado que el procesador móvil del anfitrión debe simular las físicas para ambos jugadores:
- **Opción A (Recomendada para vóxeles)**: Motor AABB propio (*Custom Axis-Aligned Bounding Box*):
  - Algoritmo matemático cubo contra caja de jugador.
  - Ocupa menos de 1 MB de memoria y corre a costo de CPU casi nulo.
- **Opción B (Para dinámicas complejas estilo Roblox)**:
  - `@dimforge/rapier3d-compat`: Motor determinista compilado a WebAssembly (WASM). Entre 5 y 10 veces más rápido que motores JS tradicionales (Cannon.js) y no satura el hilo principal.

## Capa 4: Controles e Interfaz Móvil (Touch / UX)
- **Nipple.js**: Librería ligera sin dependencias para renderizar joysticks táctiles virtuales dinámicos en la mitad izquierda de la pantalla.
- **Touch Events API nativa**: Manejo directo de `touchstart`, `touchmove` y `touchend` con opciones `{ passive: true }` para rotación de cámara e interacción rápida sin tap delay de 300 ms.
- **Pointer Lock API**: Soporte para pruebas en ordenadores bloqueando el ratón en primera/tercera persona.

## Capa 5: Serialización de Red (Optimización de Ancho de Banda)
- **JavaScript TypedArrays (`Float32Array`, `Uint8Array`, `DataView`)**:
  - Paquetes binarios en crudo sin cabeceras JSON.
  - Paquete de movimiento mínimo de **13 bytes**:
    - `1 byte`: ID del paquete (`0x01`).
    - `4 bytes`: Posición X (`Float32`).
    - `4 bytes`: Posición Z (`Float32`).
    - `4 bytes`: Ángulo Yaw (`Float32`).
  - Previene pausas por Garbage Collection.

## Capa 6: Empaquetado, Assets y Hosting
- **Vite**: Empaquetador web con módulos ES nativos (ESM), Hot Module Replacement instantáneo y compilación de TypeScript a JavaScript moderno (ES2022).
- **Texturas WebP**: Formato comprimido de alta eficiencia que minimiza el consumo de VRAM móvil.
- **Vercel**: Despliegue estático con CDN en el Edge y provisión de HTTPS obligatorio (imprescindible para WebRTC y acceso a cámara).
