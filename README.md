# Runa y Piedra (WebGL 2.0 / 60 FPS)

> Mazmorra vóxel cooperativa 3D multijugador en tiempo real para navegadores móviles y de escritorio, optimizada bajo un presupuesto de rendimiento móvil estricto (60 FPS estables) en smartphones estándar globales (3–4 GB RAM, WebGL 2.0).

[![Version](https://img.shields.io/badge/version-1.23.0-blue.svg)](package.json)
[![Tech](https://img.shields.io/badge/WebGL-2.0-orange.svg)](https://threejs.org/)
[![P2P](https://img.shields.io/badge/WebRTC-Dual%20Channels-green.svg)](https://webrtc.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%205-purple.svg)](https://vitejs.dev/)

---

## 🌟 Características Principales

* **Progresión de Mazmorra por Niveles**: Sistema de niveles modular ([`src/levels/`](file:///data/data/com.termux/files/home/develop/game/src/levels/)) con transiciones fluidas:
  * **Lobby / Tutorial**: Vestíbulo seguro con cofre de prueba, puerta con cerradura y escalinata introductoria.
  * **Calabozo Clásico**: Salas de sillar, fosa de lava ardiente sobre el abismo, plataformas de salto rúnicas y laberinto de puertas.
  * **Trono del Abismo**: Desafío final con altar ancestral y ceremonia de victoria cooperativa.
* **Mecánicas Cooperativas e Interacción**:
  * **Puertas autoritativas de 2×2**: Apertura sincronizada accionable por proximidad o enfoque (con y sin requerimiento de llave).
  * **Cofres del tesoro**: Cofres interactivos que otorgan llaves de mazmorra persistentes y sincronizadas entre pares.
  * **Plataformas de Salto (*Jump Pads*)**: Losas de cantería oscura con glifo rúnico tallado que impulsan verticalmente al jugador.
  * **Escalinatas de descenso y Pedestales**: Descenso coordinado entre jugadores y ritual de victoria en el altar final.
* **Sistema de Vidas, Peligros y Checkpoints**:
  * 3 vidas por héroe con indicador HUD reactivo.
  * Peligros letales: fosa de lava y caída al vacío con penalización de vida y reaparición en el último checkpoint seguro.
  * Período de invulnerabilidad post-reaparición y Game Over sincronizado.
* **Canales Duales WebRTC de Alto Rendimiento**:
  * **Canal Seguro (`game-safe`, `reliable: true`)**: Transmisión garantizada de eventos críticos (`INIT`, `DOOR`, `CHEST`, `KEY`, `LEVEL_CHANGE`, `PLAYER_META`).
  * **Canal Caliente (`game-hot`, `reliable: false`)**: Tráfico de alta frecuencia tolerante a pérdida (`INPUT` a 30 Hz, `SNAPSHOT` a 20 Hz, `PING`/`PONG` a 1 Hz) para eliminar el *head-of-line blocking*.
  * Reintentos automáticos, timeouts robustos y fallback transparente a canal seguro.
* **Predicción y Reconciliación del Cliente**: Movimiento local con cero latencia percibida, búfer circular de inputs no confirmados y reconciliación autoritativa en [`ClientReconciler`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js).
* **Audio Procedural Sintetizado**: Motor de sonido basado en Web Audio API ([`SoundManager`](file:///data/data/com.termux/files/home/develop/game/src/audio/SoundManager.js)) que genera efectos de salto, apertura de puertas, llaves, daño y victoria sin descargar activos pesados.
* **Lobby de Configuración de Aventurero**: Personalización de nombre o apodo, selección de clase y color de héroe con persistencia en `localStorage`.
* **Compartir Enlace por Mensajería (WhatsApp / Telegram)**: Botón integrado con Web Share API (`navigator.share`) para enviar enlaces de invitación directa (`?join=XXXX`) con un solo toque, además de botón de copiado al portapapeles.
* **Conexión Instantánea por Código QR o PIN**: El Host genera una sala con PIN de 4 dígitos y un código QR dinámico que el invitado puede escanear con la cámara de su celular para unirse automáticamente.
* **Arquitectura Listen-Server P2P**: Uno de los dispositivos asume el rol de servidor autoritativo dentro de su navegador. El tráfico fluye directo mediante WebRTC (latencia LAN < 5 ms, costo de servidor = **$0**).
* **Etiquetas 3D Flotantes (Nametags)**: Nombres de los jugadores e insignias de clase flotando sobre sus avatares en 3D con orientación automática hacia la cámara.
* **Presupuesto de Rendimiento Móvil Estricto**:
  * **Draw Calls**: Menos de 25 por cuadro (toda la mazmorra se dibuja en **1 solo `THREE.InstancedMesh`**).
  * **Límite DPR ($\le 1.5$)**: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))` para evitar estrangulamiento térmico de GPUs móviles (Mali-G52 / Adreno 610).
  * **Sin Garbage Collection (Zero-GC)**: Paquetes binarios fijos con `DataView` y `ArrayBuffer` reutilizados en el bucle principal.
  * **Físicas Desacopladas a 30 Hz**: Motor de colisiones AABB propio sin sobrecarga en la CPU del teléfono.
* **Controles Táctiles y de Escritorio**:
  * **Móvil**: Joystick dinámico Nipple.js (mitad izquierda), Touch Look pasivo a 60–120 Hz (mitad derecha) y botones flotantes (*ACCION*, *SALTAR*).
  * **PC**: Teclado WASD, Barra espaciadora (`SALTAR`) y teclas `E` / `F` / Clic izquierdo (`INTERACTUAR`).
* **Suite de Pruebas Unitarias Integrada**: 58 pruebas automatizadas con el ejecutor nativo `node:test` cubriendo protocolo binario, colisiones, reconciliación, vidas y niveles.

---

## 🏗️ Arquitectura del Proyecto

El código está estructurado bajo **Clean Architecture** y principios de **Responsabilidad Única (SRP)**:

```
runa-y-piedra/
├── docs/                     # Documentación técnica completa
├── tests/                    # Suite de pruebas automatizadas (node:test)
├── src/
│   ├── audio/
│   │   └── SoundManager.js   # Efectos de sonido procedurales con Web Audio API
│   ├── camera/
│   │   └── CameraController.js # Vista en primera persona y rotación suave
│   ├── config/
│   │   └── constants.js      # Constantes de mundo, físicas, red y colores
│   ├── controllers/
│   │   ├── DescentManager.js # Gestión de escalinatas y transición de niveles
│   │   └── InteractionController.js # Detección de proximidad e interacciones HUD
│   ├── core/
│   │   ├── GameLoop.js       # Acumulador desacoplado a 30 Hz y render a rAF
│   │   ├── PhysicsAABB.js    # Resolución de colisiones por ejes
│   │   └── World.js          # Voxel Grid optimizado
│   ├── entities/
│   │   ├── Player.js         # Entidad jugador (físicas, vidas, llaves)
│   │   └── PlayerManager.js  # Gestión de jugadores locales y remotos
│   ├── heroes/
│   │   ├── data/             # Definiciones de clases de héroes
│   │   └── HeroRegistry.js   # Registro y persistencia de perfiles
│   ├── input/
│   │   └── InputManager.js   # Joystick táctil, Touch Look, Teclado y Ratón
│   ├── interaction/
│   │   └── BlockRaycaster.js # Raycast central y selección de objetivos
│   ├── levels/
│   │   ├── data/             # Niveles (lobby, dungeon_classic, abyss_throne)
│   │   ├── LevelLoader.js    # Carga y ensamblado de vóxeles y sensores
│   │   └── LevelRegistry.js  # Registro de mazmorras y progresión
│   ├── network/
│   │   ├── ClientReconciler.js # Predicción y reconciliación de movimiento
│   │   ├── InputQueue.js     # Cola autoritativa de inputs en el Host
│   │   ├── NetworkManager.js # Canales duales WebRTC (game-safe / game-hot)
│   │   ├── NetworkStats.js   # Monitor de latencia RTT, ancho de banda y paquetes
│   │   └── Protocol.js       # Protocolo binario de cero asignación (Zero-GC)
│   ├── render/
│   │   ├── AvatarRenderer.js # Avatares 3D con interpolación Lerp y nametags
│   │   ├── ChestRenderer.js  # Mallas de cofres y estados de apertura
│   │   ├── DoorRenderer.js   # Mallas de puertas correderas 2x2
│   │   ├── PedestalRenderer.js # Altar y orbe ancestral de victoria
│   │   ├── SceneManager.js   # Three.js WebGL 2.0, niebla y luces fijas
│   │   ├── StairsRenderer.js # Losa y escalinata de descenso
│   │   ├── TextureGenerator.js # Atlas de texturas SVG procedurales
│   │   └── VoxelMap.js       # Terreno InstancedMesh único
│   ├── simulation/
│   │   └── SimulationEngine.js # Físicas del Host y predicción del Cliente
│   ├── ui/
│   │   ├── Icons.js          # Iconografía SVG para botones y HUD
│   │   ├── Spring.js         # Física de resortes para animaciones UI
│   │   └── UIManager.js      # Menú, QR, selección de héroe, HUD y modales
│   └── main.js               # Orquestador del juego
├── index.html                # Canvas a pantalla completa, UI y HUD
├── package.json              # Dependencias y scripts
└── vite.config.js            # Configuración de Vite con host expuesto
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
* Node.js v18+ y npm instalados.

### Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar suite de pruebas unitarias
npm test

# 3. Iniciar servidor de desarrollo en red local
npm run dev

# 4. Compilar para producción
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
| **Interactuar / Acción** | Botón flotante `ACTION` | Teclas `E`, `F` o Clic izquierdo |

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
* [**08. Sistema de Mazmorras, Niveles y Progresión Cooperativa**](docs/08-sistema-mazmorras-niveles-y-progresion.md)
* [**09. Biblioteca de Héroes, Clases Únicas y Modificadores Físicos**](docs/09-biblioteca-heroes-clases-y-fisica.md)
* [**10. Sistema de Iconografía SVG Vectorial y Experiencia de Usuario (UI/UX)**](docs/10-sistema-iconografia-svg-y-ui-ux.md)
* [**11. Protocolo Híbrido v2, Telemetría de Red y Resiliencia WebRTC**](docs/11-protocolo-hibrido-v2-telemetria-y-resiliencia.md)
* [**12. Reconciliación Cliente-Servidor Real e Interpolación Temporal**](docs/12-reconciliacion-cliente-servidor-e-interpolacion.md)
* [**13. Canales Duales WebRTC y Endurecimiento de Conexión P0**](docs/13-canales-duales-webrtc-endurecimiento-p0.md)
* [**14. Subsistemas de Audio Procedural, Vidas, Resortes y Suite de Tests**](docs/14-subsistemas-audio-procedural-vidas-y-resortes.md)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
