# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.3.1] - 2026-09-28

### Fixed
- **Corrección de Bloqueo Inferior en la Puerta 1**:
  - Resuelto el problema por el cual la puerta abierta quedaba obstruida por dos cubos en su parte inferior.
  - El umbral de entrada a la Sala 2 ($z = 12$) y la llegada a la Puerta 2 ($z = 23$) se encontraban incorrectamente situados a altura $y = 1$ en lugar de coincidir con el plano de caminata $y = 0$.
  - Ahora el suelo es 100% plano y continuo ($y = 0$) a través de los vanos de ambas puertas, permitiendo un paso limpio, natural y sin obstáculos.

### Changed
- **Ajuste de Foso y Checkpoint en Sala 2 (El Abismo)**:
  - Vaciado real del suelo a nivel $y = 0$ (`BLOCK_TYPES.AIR`) en los huecos entre plataformas rúnicas.
  - Al caer al abismo, el motor de físicas detecta la caída libre y activa el checkpoint automático en el umbral seguro de la Sala 2 (`x = 11.5, y = 1.5, z = 12.0`) en lugar de reiniciar al jugador al principio de la partida.
  - Plataformas de parkour alineadas a $y = 0$ (plataformas base) y $y = 1$ (plataformas elevadas) garantizando un desafío de salto fluido y exigente.

---

## [1.3.0] - 2026-09-28

### Added
- **Nueva Zona de Parkour / Desafío de Salto Obligatorio (Sala 2: El Abismo)**:
  - Expansión de la mazmorra a 3 estancias completas ($24 \times 16 \times 36$ vóxeles).
  - Fondo de abismo/lava (`BLOCK_TYPES.LAVA = 7`) con desaparición del suelo común.
  - Plataformas de salto rúnicas (`BLOCK_TYPES.JUMP_PAD = 6`, color celeste brillante) separadas por vacíos de 1 y 2 bloques y saltos verticales a $y = 2$. Es físicamente imposible avanzar caminando; se requiere usar el botón **SALTAR**.
  - Escalera lateral de rescate en el abismo para que los jugadores que caigan puedan volver a subir sin quedar bloqueados.
  - Sistema multi-puerta: **Puerta 1** ($z = 11$) hacia el Abismo y **Puerta 2** ($z = 24$) hacia el Santuario Interior, ambas sincronizadas autoritativamente en red.

### Changed
- **Renombrado del Botón a "ACTION"**:
  - El botón interactivo principal pasa de "ABRIR" a **"ACTION"** con icono SVG vectorial de acción dinámico para abarcar apertura de puertas, activación del pedestal y futuras interacciones cooperativas.

---

## [1.2.0] - 2026-09-28

### Added
- **Lobby de Configuración de Aventurero**:
  - Personalización de nombre o apodo con persistencia local automática (`localStorage`).
  - Selector de clases y colores (`PLAYER_HEROES`: Aventurero, Paladín, Explorador, Hechicero, Guardián) con distintivos visuales interactivos.
- **Compartir por Mensajería (WhatsApp, Telegram, etc.)**:
  - Botón **"Compartir en Mensajería"** con integración nativa de la Web Share API (`navigator.share`), permitiendo enviar invitaciones directas con 1 toque.
  - Botón **"Copiar Enlace"** con notificación de portapapeles y respuesta visual animada.
  - Soporte de unirse con enlace directo (`?join=XXXX`) que auto-rellena y destaca la sala invitada.
- **Etiquetas 3D Flotantes (Nametags) sobre Avatares**:
  - Renderizado de Sprite 3D billboard (`THREE.Sprite`) sobre la cabeza de cada jugador con su nombre personalizado y emblema del color de su clase.
  - Sincronización continua con interpolación Lerp sin impacto de rendimiento.
- **Protocolo de Metadatos de Red (`MSG.PLAYER_META = 0x06`)**:
  - Intercambio binario de metadatos (ID, índice de color, longitud y nombre codificado en UTF-8 con `TextEncoder` / `TextDecoder`).
  - Avisos en el HUD al unirse o desconectarse compañeros: *"🛡️ ¡[Nombre] se unió a la expedición!"*.
- **Botón Flotante de Configuración en Pantalla (Superior Derecha)**:
  - Botón translúcido circular (`#btn-settings`) con icono SVG de engranaje accesible en todo momento (tanto en menús como dentro de la mazmorra).
  - Modal de Ajustes en tiempo real:
    - Edición del nombre y clase de aventurero con sincronización instantánea a compañeros.
    - Slider de **Sensibilidad de Mirada** (0.4x a 2.5x) para móvil (Touch Look) y PC (Mouse Look).
    - Selector de **Rendimiento Gráfico** en caliente: Modo Fluido / Batería (1.0x DPR) vs Alta Nitidez (1.5x DPR).
    - Acciones rápidas de sala: visualización del PIN, compartir/copiar enlace y botón para salir al menú principal.

---

## [1.1.0] - 2026-09-28

### Added
- **Evolución a Mazmorra Cooperativa (Dungeon Crawler)**:
  - Generación arquitectónica de mazmorra dividida en dos estancias: **Área 1 (Vestíbulo)** y **Área 2 (Cripta / Santuario)** con columnas de soporte y muro divisorio con arco de piedra.
  - **Gran Puerta Interactiva**: Puerta maciza central de 2×2 bloques que conecta ambas salas, accionable cooperativamente por proximidad o puntería.
  - **Pedestal Ancestral**: Objetivo narrativo en el corazón del Santuario interior de la Cripta.
  - **Mensajería Narrativa HUD**: Banner superior no intrusivo (`#hud-message`) con efecto translúcido para guiar a los jugadores con avisos de sala, aperturas de puertas e interacciones con el entorno.
  - **Protocolo de Puerta Sincronizada P2P**: Paquete binario ultra-ligero (`MSG.DOOR = 0x05`, 1 byte) para activación autoritativa desde el Host y sincronización inmediata a todos los clientes. Sincronización transparente para jugadores tardíos en el paquete `INIT`.

### Changed
- **Reemplazo de Botones de Edición por Interacción**:
  - Eliminación de los botones destructivos de edición libre (`PONER` y `ROMPER`).
  - Nuevo botón unificado **ABRIR / INTERACTUAR** con icono SVG vectorial integrado tanto en controles táctiles móviles como en teclado (`E`, `F`, clic en PC).
- **Paleta de Colores de Mazmorra**: Nuevos bloques temáticos (`STONE_FLOOR`, `WALL`, `DOOR`, `PILLAR`, `PEDESTAL`) con losas oscuras de pizarra y piedra rúnica.

---

## [1.0.0] - 2026-09-28

### Added
- **Arquitectura Listen-Server P2P**: Soporte completo para multijugador local en navegador mediante WebRTC `RTCDataChannel` en modo UDP no fiable (`ordered: false, maxRetransmits: 0`) vía PeerJS.
- **Renderizado Voxel 3D en 1 Solo Draw Call**: Terreno de 24×24 gestionado íntegramente por una única instancia de `THREE.InstancedMesh` con reubicación a $(0, -9999, 0)$ y lista de `freeSlots`.
- **Texturas Vóxel Procedurales en SVG**: Generador [`TextureGenerator.js`](src/render/TextureGenerator.js) que rasteriza patrones vectoriales SVG en escala de grises sobre `CanvasTexture` con filtro `NearestFilter`. Se multiplica automáticamente por el color de cada bloque (`instanceColor`) aportando biseles de iluminación 3D y relieve sin añadir descargas de imágenes externas.
- **Iconografía SVG en Botones Táctiles**: Reemplazo de texto plano en los botones de acción (`PONER`, `ROMPER`, `SALTAR`) por iconos SVG nítidos y vectoriales optimizados para móvil.
- **Protocolo Binario de Red (Zero-GC)**:
  - Paquete de movimiento de 13 bytes (`[type: 0x01, deltaX, deltaZ, yaw]`).
  - Paquete de modificación de bloque de 14 bytes (`[type: 0x03, action, x, y, z]`).
  - Paquete de Snapshot autoritativo del Host de 33 bytes.
  - Paquete de inicialización de mapa (`INIT: 0x04`).
- **Señalización Serverless por Código QR**: Generación de códigos QR en pantalla para escaneo con cámara móvil y conexión instantánea sin escribir PIN (`?join=XXXX`).
- **Delimitación de Seguridad del Escenario**:
  - Muros perimetrales visibles (`BLOCK_WALL`) de 2 bloques de altura con protección contra destrucción.
  - Barrera matemática impenetrable en el motor de colisiones AABB.
  - Sistema de rescate al vacío que reposiciona al jugador si cae por debajo de $y = -5$.
- **Controles Unificados (`InputManager`)**:
  - Joystick dinámico táctil con **Nipple.js**.
  - Control de cámara táctil pasivo a 60–120 Hz (`{ passive: true }`) en la mitad derecha.
  - Soporte para PC con teclado WASD, barra espaciadora y ratón con **Pointer Lock**.
- **Entidades y Simulación Modular**:
  - Clase `Player` y administrador de sesiones `PlayerManager`.
  - Motor de simulación determinista `SimulationEngine`.
  - Controlador de cámara en primera persona `CameraController`.
  - Módulo de Raycasting `BlockRaycaster` con detección de caras para colocación.
- **Constantes Centralizadas (`src/config/constants.js`)**: Eliminación de números mágicos para dimensiones de mundo, físicas, paletas de colores y frecuencias de red.
- **Documentación Técnica Integral (`docs/`)**: 8 documentos técnicos cubriendo hardware, presupuesto móvil, protocolo de red, físicas, UX, hosting y arquitectura atómica.

### Changed
- Refactorización de arquitectura aplicando el principio de **Responsabilidad Única (SRP)**, dividiendo el código en carpetas atómicas (`config/`, `input/`, `camera/`, `interaction/`, `entities/`, `simulation/`, `ui/`, `core/`, `network/`, `render/`).
- Reducción del archivo principal `main.js` a un orquestador limpio y desacoplado del DOM.
- Límite de resolución forzado (`devicePixelRatio <= 1.5`) para garantizar 60 FPS estables sin estrangulamiento térmico en smartphones de gama de entrada/media.
