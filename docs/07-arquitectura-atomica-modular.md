# 07. Arquitectura Atómica y Modular del Código

Este documento describe la división en módulos atómicos bajo principios de **Clean Architecture** y **Single Responsibility Principle (SRP)** implementada en el proyecto.

---

## 1. Estructura de Directorios Atómica

```
src/
├── config/
│   └── constants.js         # Constantes centralizadas de mundo, físicas, red y paletas
├── input/
│   └── InputManager.js      # Unificación de Nipple.js, touch look pasivo, teclado y Pointer Lock
├── camera/
│   └── CameraController.js  # Posicionamiento y orientación de cámara en 1ra persona
├── interaction/
│   └── BlockRaycaster.js    # Detección central de bloques y cálculo de caras adyacentes
├── entities/
│   ├── Player.js            # Entidad jugador (posición, velocidad, ángulos, estado en suelo)
│   └── PlayerManager.js     # Colección de jugadores y mapeo con DataConnections WebRTC
├── simulation/
│   └── SimulationEngine.js  # Bucle de física autoritativo (Host) y predicción (Cliente)
├── ui/
│   └── UIManager.js         # Menú de sala, generación de código QR, auto-join y HUD
├── core/
│   ├── World.js             # Cuadrícula 24x16x24 en Uint8Array plano
│   ├── PhysicsAABB.js       # Resolución de colisiones por ejes y barreras de mundo
│   └── GameLoop.js          # Acumulador desacoplado (30 Hz físicas / 60 Hz rAF)
├── network/
│   ├── NetworkManager.js    # Envoltura EventTarget para PeerJS con canales UDP no fiables
│   └── Protocol.js          # Serialización y deserialización binaria con DataView (Zero-GC)
├── render/
│   ├── SceneManager.js      # Setup WebGL 2.0 (Three.js), luces fijas y niebla
│   ├── VoxelMap.js          # THREE.InstancedMesh único, pool de slots y reubicación a -9999
│   └── AvatarRenderer.js    # Mallas low-poly de avatares con interpolación (Lerp) a 60 FPS
└── main.js                  # Orquestador del juego (< 250 líneas)
```

---

## 2. Responsabilidades por Módulo

| Módulo | Responsabilidad Única |
|---|---|
| [`src/config/constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js) | Centralizar todas las constantes numéricas, configuraciones de red y paletas de color, eliminando números mágicos. |
| [`src/input/InputManager.js`](file:///data/data/com.termux/files/home/develop/game/src/input/InputManager.js) | Capturar todos los eventos de entrada de forma homogénea (Touch, Mouse, Teclado) y exponer vectores normalizados `{ forward, right }`. |
| [`src/camera/CameraController.js`](file:///data/data/com.termux/files/home/develop/game/src/camera/CameraController.js) | Manejar la perspectiva del jugador con interpolación angular sin allocations de vectores en el render loop. |
| [`src/interaction/BlockRaycaster.js`](file:///data/data/com.termux/files/home/develop/game/src/interaction/BlockRaycaster.js) | Ejecutar el Raycasting contra la malla de vóxeles y calcular la celda contigua según la normal de la cara interceptada. |
| [`src/entities/Player.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/Player.js) | Encapsular el estado interno de un jugador y su serialización a snapshot. |
| [`src/entities/PlayerManager.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/PlayerManager.js) | Administrar las instancias de jugadores en memoria y enlazarlas con sus conexiones WebRTC correspondientes. |
| [`src/simulation/SimulationEngine.js`](file:///data/data/com.termux/files/home/develop/game/src/simulation/SimulationEngine.js) | Ejecutar el avance de simulación determinista para todos los jugadores a 30 Hz. |
| [`src/ui/UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js) | Controlar la interfaz gráfica, botones táctiles, menús y la generación de códigos QR. |
| [`src/main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js) | Conectar los módulos entre sí: eventos de red $\rightarrow$ simulación $\rightarrow$ render $\rightarrow$ UI. |

---

## 3. Beneficios Técnicos Obtenidos

1. **Desacoplamiento Total**: Las clases de física y entidades (`Player`, `SimulationEngine`, `World`) no tienen dependencias hacia Three.js ni hacia el DOM, lo que permite ejecutarlas en un Web Worker o en Node.js en caso de migrar a un servidor dedicado en el futuro.
2. **Eliminación del Antipatrón God-File**: `main.js` dejó de manejar directamente el DOM, Raycaster, timers y eventos táctiles sueltos.
3. **Mantenimiento Ágil**: Modificar los controles o la cámara ya no requiere tocar la simulación ni la lógica de red.
