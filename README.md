# Voxel Sandbox 3D P2P (WebGL 2.0 / 60 FPS)

> Entorno 3D sandbox multijugador interactivo para navegadores móviles y de escritorio, optimizado bajo un presupuesto de rendimiento móvil estricto (60 FPS estables) en smartphones estándar globales (3–4 GB RAM, WebGL 2.0).

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Tech](https://img.shields.io/badge/WebGL-2.0-orange.svg)](https://threejs.org/)
[![P2P](https://img.shields.io/badge/WebRTC-RTCDataChannel-green.svg)](https://webrtc.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%205-purple.svg)](https://vitejs.dev/)

---

## 🌟 Características Principales

* **Arquitectura Listen-Server P2P**: Uno de los dispositivos asume el rol de servidor autoritativo dentro de su navegador. El tráfico de juego fluye directo por Wi-Fi local mediante WebRTC DataChannel (latencia LAN < 5 ms, costo de servidor = **$0**).
* **Presupuesto de Rendimiento Móvil Estricto**:
  * **Draw Calls**: Menos de 25 por cuadro (todo el terreno se dibuja en **1 solo `THREE.InstancedMesh`**).
  * **Límite DPR ($\le 1.5$)**: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))` para evitar estrangulamiento térmico de GPUs móviles (Mali-G52 / Adreno 610).
  * **Sin Garbage Collection (Zero-GC)**: Paquetes binarios fijos de 13 y 14 bytes con `DataView` y `ArrayBuffer` reutilizados en el bucle principal.
  * **Físicas Desacopladas a 30 Hz**: Motor de colisiones AABB propio sin sobrecarga en la CPU del teléfono.
* **Escenario Delimitado Seguro**: Muros perimetrales visibles (`BLOCK_WALL`) y barrera matemática impenetrable para evitar caídas al vacío.
* **Conexión Instantánea por Código QR o PIN**: El Host genera una sala con PIN de 4 dígitos y un código QR que el invitado puede escanear con la cámara de su celular para unirse automáticamente.
* **Controles Táctiles y de Escritorio**:
  * **Móvil**: Joystick dinámico Nipple.js (mitad izquierda), Touch Look pasivo a 60–120 Hz (mitad derecha) y botones flotantes (*PONER*, *ROMPER*, *SALTAR*).
  * **PC**: Teclado WASD, Barra espaciadora y ratón con **Pointer Lock** (clic izquierdo para destruir, clic derecho para colocar).

---

## 🏗️ Arquitectura del Proyecto

El código está estructurado bajo **Clean Architecture** y principios de **Responsabilidad Única (SRP)**:

```
voxel-sandbox-p2p/
├── docs/                    # Documentación técnica completa
├── src/
│   ├── config/
│   │   └── constants.js     # Constantes de mundo, físicas, red y colores
│   ├── input/
│   │   └── InputManager.js  # Unificación de Joystick, Touch Look, Teclado y Mouse
│   ├── camera/
│   │   └── CameraController.js # Vista en primera persona y rotación suave
│   ├── interaction/
│   │   └── BlockRaycaster.js # Raycast central, detección de caras y coordenadas
│   ├── entities/
│   │   ├── Player.js        # Entidad jugador (posición, velocidad, ángulos, estado)
│   │   └── PlayerManager.js # Colección de jugadores y mapeo con WebRTC
│   ├── simulation/
│   │   └── SimulationEngine.js # Físicas del Host y predicción del Cliente
│   ├── ui/
│   │   └── UIManager.js     # Menú de sala, código QR, auto-join y HUD
│   ├── core/
│   │   ├── World.js         # Voxel Grid 24x16x24 en Uint8Array plano (16 KB)
│   │   ├── PhysicsAABB.js   # Resolución de colisiones por ejes
│   │   └── GameLoop.js      # Acumulador desacoplado a 30 Hz y render a rAF
│   ├── network/
│   │   ├── NetworkManager.js # Envoltura PeerJS con modo UDP no fiable
│   │   └── Protocol.js      # Protocolo binario de cero asignación
│   ├── render/
│   │   ├── SceneManager.js  # Three.js WebGL 2.0, niebla y luces fijas
│   │   ├── VoxelMap.js      # Terreno InstancedMesh único con pool de slots
│   │   └── AvatarRenderer.js # Mallas de avatares con interpolación Lerp
│   └── main.js              # Orquestador del juego
├── index.html               # Canvas a pantalla completa y menú
├── package.json             # Dependencias y scripts
└── vite.config.js           # Configuración de Vite con host expuesto
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
* Node.js v18+ y npm instalados.

### Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo en red local
npm run dev

# 3. Compilar para producción
npm run build
```

---

## 🎮 Cómo Jugar

1. **Dispositivo 1 (Host / Servidor)**:
   * Abre `http://localhost:5173` (o `http://TU_IP_LOCAL:5173`).
   * Pulsa en **"Crear Sala"**.
   * Verás en pantalla el PIN de 4 dígitos y un código QR.
2. **Dispositivo 2 (Cliente / Invitado)**:
   * **Opción QR**: Apunta con la cámara del celular al código QR de la pantalla del Host y abre el enlace (`?join=XXXX`). ¡Se conectará automáticamente sin escribir nada!
   * **Opción Manual**: Abre la URL del juego en la misma red Wi-Fi, introduce el PIN de 4 dígitos y pulsa **"Unirse"**.

### Controles

| Acción | Móvil | Escritorio (PC) |
|---|---|---|
| **Moverse** | Joystick virtual (pulgar izquierdo) | Teclas `W`, `A`, `S`, `D` |
| **Mirar / Girar** | Arrastrar en la mitad derecha | Mover ratón (clic en pantalla para Pointer Lock) |
| **Saltar** | Botón flotante `SALTAR` | Barra `Espaciadora` |
| **Romper Bloque** | Botón flotante `ROMPER` | Clic izquierdo del ratón |
| **Colocar Bloque** | Botón flotante `PONER` | Clic derecho del ratón |

---

## 📚 Documentación Técnica Detallada

La carpeta [`docs/`](docs/) contiene el desglose técnico y las decisiones de diseño:

* [**00. Especificación Maestra de Requerimientos**](docs/00-especificacion-maestra.md)
* [**01. Requerimientos de Hardware y Presupuesto de Rendimiento**](docs/01-hardware-y-presupuesto-rendimiento.md)
* [**02. Stack Tecnológico de 6 Capas**](docs/02-stack-tecnico-6-capas.md)
* [**03. Protocolo de Red Binario y Señalización WebRTC**](docs/03-protocolo-red-binario-webrtc.md)
* [**04. Motor de Físicas y Estructura de Vóxeles**](docs/04-motor-fisica-voxeles.md)
* [**05. Controles Táctiles y Experiencia Móvil (UX)**](docs/05-controles-moviles-ux.md)
* [**06. Arquitectura Listen-Server y Modelo de Hosting**](docs/06-arquitectura-listen-server-hosting.md)
* [**07. Arquitectura Atómica y Modular del Código**](docs/07-arquitectura-atomica-modular.md)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
