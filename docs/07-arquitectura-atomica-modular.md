# 07. Arquitectura Atómica y Modular del Código

Este documento describe la división en módulos atómicos bajo principios de **Clean Architecture** y **Single Responsibility Principle (SRP)** implementada en el proyecto.

---

## 1. Estructura de Directorios Atómica

```
runa-y-piedra/
├── docs/                     # Documentación técnica completa
├── tests/                    # Suite de pruebas automatizadas (node:test)
├── src/
│   ├── audio/
│   │   └── SoundManager.js   # Síntesis procedural de audio con Web Audio API
│   ├── camera/
│   │   └── CameraController.js # Posicionamiento y orientación de cámara en 1ra persona
│   ├── config/
│   │   └── constants.js      # Constantes de mundo, físicas, red y paletas
│   ├── controllers/
│   │   ├── DescentManager.js # Gestión de escalinatas y transición de niveles
│   │   └── InteractionController.js # Detección de proximidad e interacciones HUD
│   ├── core/
│   │   ├── GameLoop.js       # Acumulador desacoplado (30 Hz físicas / 60 Hz rAF)
│   │   ├── PhysicsAABB.js    # Resolución de colisiones por ejes y barreras
│   │   └── World.js          # Cuadrícula 3D en Uint8Array plano
│   ├── entities/
│   │   ├── Player.js         # Entidad jugador (físicas, vidas, llaves, checkpoints)
│   │   └── PlayerManager.js  # Colección de jugadores y mapeo con DataConnections WebRTC
│   ├── heroes/
│   │   ├── data/             # Definiciones declarativas de clases de héroes
│   │   └── HeroRegistry.js   # Registro y persistencia de perfiles en localStorage
│   ├── input/
│   │   └── InputManager.js   # Unificación de Nipple.js, touch look pasivo, teclado y ratón
│   ├── interaction/
│   │   └── BlockRaycaster.js # Detección de objetivos por proximidad y enfoque
│   ├── levels/
│   │   ├── data/             # Niveles en JSON (lobby, dungeon_classic, crypt_inferno, abyss_throne)
│   │   ├── LevelLoader.js    # Intérprete constructor de escenarios
│   │   └── LevelRegistry.js  # Catálogo y cambio de nivel en caliente
│   ├── network/
│   │   ├── ClientReconciler.js # Predicción local y reconciliación autoritativa en cliente
│   │   ├── InputQueue.js     # Cola autoritativa de inputs en el Host con descarte de duplicados
│   │   ├── NetworkManager.js # Canales duales WebRTC (game-safe fiable / game-hot no fiable)
│   │   ├── NetworkStats.js   # Telemetría RTT, jitter, ancho de banda y paquetes en tiempo real
│   │   └── Protocol.js       # Protocolo binario DataView Zero-GC (16B input, 8+N*25B snapshot)
│   ├── render/
│   │   ├── AvatarRenderer.js # Mallas de avatares con interpolación Lerp y nametags 3D
│   │   ├── ChestRenderer.js  # Mallas de cofres y apertura animada de tapa (77°)
│   │   ├── DoorRenderer.js   # Mallas de portones deslizantes 2x2
│   │   ├── PedestalRenderer.js # Altar y orbe ancestral de victoria
│   │   ├── SceneManager.js   # Setup WebGL 2.0 (Three.js), luces fijas y niebla
│   │   ├── StairsRenderer.js # Losa y escalinata de descenso
│   │   ├── TextureGenerator.js # Atlas procedural de texturas SVG
│   │   └── VoxelMap.js       # Terreno InstancedMesh único con pool de slots
│   ├── simulation/
│   │   └── SimulationEngine.js # Bucle de física autoritativo a 30 Hz
│   ├── ui/
│   │   ├── Icons.js          # Repositorio global de iconos SVG vectoriales
│   │   ├── Spring.js         # Física de resortes elásticos para animaciones UI
│   │   └── UIManager.js      # HUD, selección de clase, QR, modales y mensajes narrativos
│   └── main.js               # Orquestador desacoplado del juego
├── index.html                # Canvas a pantalla completa y contenedor de UI
├── package.json              # Dependencias y scripts
└── vite.config.js            # Configuración de Vite con host expuesto
```

---

## 2. Responsabilidades por Módulo

| Módulo | Responsabilidad Única |
|---|---|
| [`src/config/constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js) | Centralizar constantes numéricas, configuraciones de red, canales WebRTC y paletas de colores. |
| [`src/audio/SoundManager.js`](file:///data/data/com.termux/files/home/develop/game/src/audio/SoundManager.js) | Sintetizar efectos de sonido procedurales con Web Audio API (salto, daño, puertas, llaves, victoria) sin descargas. |
| [`src/camera/CameraController.js`](file:///data/data/com.termux/files/home/develop/game/src/camera/CameraController.js) | Manejar la perspectiva del jugador con interpolación angular sin allocations de vectores en el render loop. |
| [`src/controllers/DescentManager.js`](file:///data/data/com.termux/files/home/develop/game/src/controllers/DescentManager.js) | Orquestar la apertura cooperativa de escalinatas y la sincronización del descenso de nivel. |
| [`src/controllers/InteractionController.js`](file:///data/data/com.termux/files/home/develop/game/src/controllers/InteractionController.js) | Evaluar proximidad y raycasting contra puertas, cofres y pedestales para actualizar el botón de acción en UI. |
| [`src/core/GameLoop.js`](file:///data/data/com.termux/files/home/develop/game/src/core/GameLoop.js) | Acumulador de tiempo fijo para desacoplar la simulación (30 Hz) del refresco de pantalla (`requestAnimationFrame`). |
| [`src/core/PhysicsAABB.js`](file:///data/data/com.termux/files/home/develop/game/src/core/PhysicsAABB.js) | Resolver colisiones caja-bloque por ejes y verificar plataformas especiales (lava, jump pads, escalinata). |
| [`src/core/World.js`](file:///data/data/com.termux/files/home/develop/game/src/core/World.js) | Almacenar la matriz tridimensional del terreno en un `Uint8Array` plano sin sobrecarga de objetos. |
| [`src/entities/Player.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/Player.js) | Encapsular el estado del aventurero: cinemática, 3 vidas, checkpoints, invulnerabilidad e inventario de llaves. |
| [`src/entities/PlayerManager.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/PlayerManager.js) | Administrar las instancias de jugadores en memoria y enlazarlas de forma unívoca con sus conexiones WebRTC. |
| [`src/heroes/HeroRegistry.js`](file:///data/data/com.termux/files/home/develop/game/src/heroes/HeroRegistry.js) | Gestionar la biblioteca de clases, estadísticas de movimiento/salto y la persistencia del perfil local. |
| [`src/input/InputManager.js`](file:///data/data/com.termux/files/home/develop/game/src/input/InputManager.js) | Capturar todos los eventos de entrada de forma homogénea (Touch, Mouse, Teclado) y exponer vectores de entrada normalizados. |
| [`src/interaction/BlockRaycaster.js`](file:///data/data/com.termux/files/home/develop/game/src/interaction/BlockRaycaster.js) | Identificar interactuables prioritarios mediante distancia euclidiana y cálculo de vector de enfoque. |
| [`src/levels/LevelLoader.js`](file:///data/data/com.termux/files/home/develop/game/src/levels/LevelLoader.js) | Interpretar descripciones JSON de nivel y poblar la cuadrícula vóxel, interactuables y checkpoints. |
| [`src/levels/LevelRegistry.js`](file:///data/data/com.termux/files/home/develop/game/src/levels/LevelRegistry.js) | Registrar los niveles del juego y gestionar la progresión o conmutación en caliente de mapas. |
| [`src/network/ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js) | Almacenar historial de inputs locales, aplicar predicción client-side y corregir desvíos frente a snapshots autoritativos. |
| [`src/network/InputQueue.js`](file:///data/data/com.termux/files/home/develop/game/src/network/InputQueue.js) | Búfer autoritativo de inputs remotos en el Host, garantizando aplicación por tick y prevención de speedhacks. |
| [`src/network/NetworkManager.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkManager.js) | Gestionar canales duales WebRTC (`game-safe` fiable y `game-hot` no fiable), reintentos de conexión y fallback. |
| [`src/network/NetworkStats.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkStats.js) | Recolectar métricas de RTT, jitter, paquetes entrantes/salientes y bytes consumidos. |
| [`src/network/Protocol.js`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js) | Serialización y deserialización binaria Zero-GC en `DataView` preasignados para todos los tipos de mensaje. |
| [`src/render/AvatarRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/AvatarRenderer.js) | Construir mallas 3D para jugadores remotos, nametags flotantes orientados a cámara y suavizado Lerp. |
| [`src/render/DoorRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/DoorRenderer.js) | Renderizar y animar suavemente la apertura de puertas correderas de doble hoja. |
| [`src/render/ChestRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/ChestRenderer.js) | Gestionar los modelos de cofres y su animación angular de apertura de tapa. |
| [`src/render/PedestalRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/PedestalRenderer.js) | Renderizar el pedestal ceremonial, el orbe flotante y los efectos de partículas de victoria. |
| [`src/render/StairsRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/StairsRenderer.js) | Representar visualmente la losa rúnica de descenso y su escalinata oculta al abrirse. |
| [`src/render/TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js) | Generar en tiempo de ejecución el atlas procedural de texturas mediante rasterizado de SVG. |
| [`src/render/VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js) | Renderizar todo el escenario en un único `THREE.InstancedMesh` con gestión de instancias libres. |
| [`src/simulation/SimulationEngine.js`](file:///data/data/com.termux/files/home/develop/game/src/simulation/SimulationEngine.js) | Ejecutar el bucle físico autoritativo para todos los aventureros a 30 Hz. |
| [`src/ui/Icons.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js) | Proveer iconos SVG vectoriales nítidos para botones táctiles y mensajes narrativos. |
| [`src/ui/Spring.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Spring.js) | Modelar osciladores armónicos amortiguados para animaciones elásticas y suaves de UI. |
| [`src/ui/UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js) | Gestionar HUD, indicadores de vidas, selección de héroes, códigos QR, telemetría y modales. |
| [`src/main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js) | Orquestador central: enlazar subsistemas, temporizadores de red, ciclo de vida del juego y transiciones. |

---

## 3. Beneficios Técnicos Obtenidos

1. **Desacoplamiento Total**: Las clases de física, entidades y protocolo (`Player`, `SimulationEngine`, `World`, `Protocol`) no dependen de Three.js ni del DOM, permitiendo su ejecución en Web Workers o en Node.js para testing (`npm test`).
2. **Eliminación del Antipatrón God-File**: `main.js` delega la gestión de interacción a [`InteractionController`](file:///data/data/com.termux/files/home/develop/game/src/controllers/InteractionController.js), el descenso a [`DescentManager`](file:///data/data/com.termux/files/home/develop/game/src/controllers/DescentManager.js), la predicción a [`ClientReconciler`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js) y la UI a [`UIManager`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js).
3. **Mantenibilidad y Testabilidad**: Cada archivo posee una responsabilidad atómica verificable de forma independiente mediante tests unitarios automatizados.
