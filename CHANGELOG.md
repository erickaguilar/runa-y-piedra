# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.11.0] - 2026-09-28

### Added
- **Protocolo de Red Híbrido v2 de Alto Rendimiento ([`Protocol.js`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js))**:
  - Introducción de `PROTOCOL_VERSION = 2` para versionado estricto en el handshake de inicialización.
  - **Zero-GC Hot Path Buffer**: Implementación de buffers estáticos reutilizables con vistas `DataView` nativas para eliminar por completo la recolección de basura (*GC Pauses*) a 30 Hz y 60 FPS en navegadores móviles.
  - **Inputs Secuenciados (15 bytes)**: Paquete `INPUT` ampliado con contador cíclico de secuencia `seq` (`Uint16`) para detección precisa de orden y paquetes perdidos (`dx`, `dz`, `yaw`).
  - **Snapshots Secuenciados con Timestamp ($8 + N \times 17$ bytes)**: Paquete `SNAPSHOT` autoritativo con cabecera de 8 bytes (`type`, `seq`, `simulationTime`, `playerCount`) y 17 bytes por entidad (`playerId`, `x`, `y`, `z`, `yaw`).
  - **Sonda Periódica de Latencia RTT Ping / Pong (5 bytes)**: Paquetes `0x08` (`PING`) y `0x09` (`PONG`) a 1 Hz que permiten al cliente calcular el RTT en milisegundos con suavizado de jitter exponencial sin requerir sincronización de relojes.
  - **Cierre Ordenado de Sala ([`HOST_CLOSING`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js#L235-L246))**: Paquete de 2 bytes emitido en el evento `beforeunload` del anfitrión para desconexión limpia de clientes y retorno narrativo al menú principal.
  - **Conmutación Dinámica de Nivel ([`LEVEL_CHANGE`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js#L248-L263))**: Paquete de sincronización en caliente para cambiar de mapa (`dungeon_classic`, `crypt_inferno`) sin reiniciar conexiones WebRTC.

- **Monitor y Telemetría de Red en Tiempo Real ([`NetworkStats.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkStats.js))**:
  - Creación del monitor de diagnóstico y telemetría de red con panel flotante HUD (`#net-debug-panel`).
  - Métricas en tiempo real: Modo de conexión (`HOST` o `CLIENT`), peers activos, latencia RTT (Ping en ms con código de color dinámico), caudal de paquetes (`PPS In` / `PPS Out`), ancho de banda consumido (`KB/s In` / `KB/s Out`) y contador de pérdidas de secuencia (`Drops`).
  - Activación múltiple y persistente: Mediante query param `?debug=1`, interruptor de telemetría en el modal de ⚙️ Configuración, o `localStorage.getItem('dungeon_debug')`.

### Changed
- **Configuración de Canales WebRTC de Máxima Fiabilidad ([`NetworkManager.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkManager.js))**:
  - Actualización de los canales de datos hacia `reliable: true` y `serialization: 'binary'`, eliminando pérdidas de snapshots en redes Wi-Fi locales que anteriormente congelaban el movimiento suave (*Lerp*) de los avatares remotos.
  - Detección proactiva de incompatibilidad de versiones (`version-mismatch`) al procesar `MSG.INIT`, alertando al usuario de actualizar la versión en caso de discrepancias entre host y cliente.
- **Gestión de Configuración y Diagnóstico en UI ([`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js))**:
  - Incorporación del selector visual *"Telemetría de Red (?debug=1)"* en la sección de rendimiento del modal de ajustes, permitiendo alternar el HUD de diagnóstico en pantallas táctiles sin necesidad de editar la URL manualmente.

---

## [1.10.0] - 2026-09-28

### Added
- **Biblioteca Declarativa en JSON de Personajes y Héroes ([`heroes.json`](file:///data/data/com.termux/files/home/develop/game/src/heroes/data/heroes.json))**:
  - Creación de [`src/heroes/data/heroes.json`](file:///data/data/com.termux/files/home/develop/game/src/heroes/data/heroes.json) y el gestor [`HeroRegistry.js`](file:///data/data/com.termux/files/home/develop/game/src/heroes/HeroRegistry.js) que centraliza la definición de personajes del juego:
    - **Aventurero** (`#38bdf8`): Explorador Versátil con icono de brújula (`compass`). Pasiva *Instinto Explorador* (100% vel, 100% salto).
    - **Paladín** (`#f43f5e`): Caballero de la Luz con icono de escudo sagrado (`shield`). Pasiva *Aura de Firmeza* (96% vel, 98% salto, 5/5 defensa).
    - **Explorador** (`#10b981`): Rastreador Veloz con icono de pluma ágil (`feather`). Pasiva *Paso del Viento* (+12% de velocidad de carrera, 104% salto).
    - **Hechicero** (`#a855f7`): Mago Arcano con icono de báculo rúnico (`wand`). Pasiva *Salto de Levitación* (+14% de impulso de salto vertical).
    - **Guardián** (`#fbbf24`): Baluarte Ancestral con icono de corona regia (`crown`). Pasiva *Presencia Áurea* (5/5 defensa y firmeza colosal).
  - Los multiplicadores de física (`speedMultiplier` y `jumpMultiplier`) se aplican en tiempo real en [`SimulationEngine.js`](file:///data/data/com.termux/files/home/develop/game/src/simulation/SimulationEngine.js) y [`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js).
  - Tarjetas dinámicas de características de héroe en la interfaz con estadísticas y descripción visual en el menú y modal de configuración.

### Fixed
- **Desbordamiento del Botón "Unirse" en el Modal Inicial (`index.html`)**:
  - Corregido el ancho y encaje del contenedor `.join-container` en pantallas móviles estrechas.
  - Aplicado `box-sizing: border-box` universal y `min-width: 0` en el campo `.join-input` para permitir que el campo de PIN se ajuste fluidamente al espacio disponible sin empujar el botón `.btn-join` fuera del borde del modal.

---

## [1.9.0] - 2026-09-28

### Added
- **Repositorio Global de Iconos SVG Reutilizables ([`Icons.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js))**:
  - Creación del archivo global [`src/ui/Icons.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js) con catálogo completo de iconos vectoriales SVG limpios y nítidos:
    - `castle` (🏰 Fortaleza / Mazmorra)
    - `volcano` (🌋 Cripta / Volcán)
    - `swords` (⚔️ Espadas cruzadas de batalla)
    - `shield` (🛡️ Escudo heráldico de aventurero)
    - `settings` (⚙️ Rueda dentada de configuración)
    - `x` (✕ Botón de cierre)
    - `check` (✅ Confirmación de copiado)
    - `warning` (⚠️ Triángulo de advertencia)
    - `door` (🚪 Portón de mazmorra)
    - `chest` (📦 Cofre del tesoro)
    - `key` (🗝️ Llave rúnica)
    - `gem` (💎 Gema preciosa)
    - `trophy` (🏆 Reliquia dorada / Cáliz)
    - `sparkles` (✨ Destellos mágicos / Pedestal)
    - `flame` (🔥 Fuego / Brasas)
    - `share` (📱 Compartir en mensajería)
    - `copy` (📋 Copiar portapapeles)
    - `user` (👤 Aventurero / Compañero)
    - `action` (⚡ Acción / Rayo)
    - `jump` (⬆️ Salto)
  - Función reutilizable [`renderIcon(nameOrEmoji, options)`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js#L145-L165) para generar marcado SVG en línea con tamaño, color, clases CSS y estilos configurables.
  - Función reactiva [`replaceEmojisWithSvg(text, options)`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js#L170-L195) que transforma automáticamente cualquier emoji presente en textos o mensajes en su correspondiente icono vectorial SVG con alineación vertical perfecta.

### Changed
- **Sustitución Integral de Emojis por Iconos SVG Vectoriales**:
  - Reemplazo de todos los emojis en [`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js):
    - Título del menú principal con espadas vectoriales.
    - Badges dinámicos de héroe y clase (`Aventurero`, `Paladín`, `Explorador`, `Hechicero`, `Guardián`) con escudo SVG coloreado según la clase seleccionada.
    - Botón de creación de mazmorra y cabecera de sala con fortaleza SVG dorada.
    - Cabecera y botón de cierre del modal de Configuración con engranaje y aspas vectoriales.
    - Tarjetas interactivas de selección de mapa (*Mazmorra Ancestral*, *Cripta del Fuego*) en [`dungeon_classic.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/dungeon_classic.json) y [`crypt_inferno.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/crypt_inferno.json).
  - Sistema de Notificaciones Narrativas del HUD ([`showNarrativeMessage`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js#L605-L620)): ahora procesa e inserta iconos SVG estilizados para advertencias de caída al vacío, apertura de cofres, llaves, gemas, apertura de puertas y consagración de pedestales.
  - Estilos CSS añadidos en [`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html) para soporte flexible (`.svg-icon`, `.narrative-icon`, `#hud-message` flexbox).

---

## [1.8.0] - 2026-09-28

### Changed
- **Eliminación del Segundo Modal de Sala e Integración Completa en Configuración (`UIManager`, `main.js`)**:
  - Al pulsar "🏰 Crear Mazmorra", el Host entra de forma instantánea a la aventura (`in_game`) sin ventanas intermedias ni interrupciones, activando la cruceta, controles táctiles y un aviso narrativo superior con el PIN de la sala.
  - La suite completa de la **Sala de Expedición** se trasladó de forma nativa al modal de ⚙️ **Configuración**:
    - **Display de PIN destacado** de 4 dígitos para unirse rápidamente.
    - **Botones de difusión cooperativa**: *Compartir en Mensajería* (Web Share API para WhatsApp/Telegram) y *Copiar Enlace* directo al portapapeles.
    - **Código QR dinámico** generado mediante canvas con `qrcode` para escaneo directo con cámara móvil.
    - **Selector interactivo de nivel/mapa en tiempo real** (*Mazmorra Ancestral*, *Cripta del Fuego*), permitiendo al Host alternar escenarios sobre la marcha sin reiniciar el servidor P2P.
    - **Lista de Compañeros sincronizada en vivo**, actualizando los nombres y clases de héroe de los aventureros conectados tanto en el modal como en partida.
  - Al cerrar la ventana de Configuración, el Host regresa inmediatamente al juego fluido sin redirecciones secundarias.

---

## [1.7.1] - 2026-09-28

### Fixed
- **Ocultamiento de Botones de Saltar y Acción en Modales y Lobby (`UIManager`)**:
  - Eliminada la presencia de los botones flotantes de acción (**SALTAR** e **ACTION**) durante las pantallas de menú principal, modal de "Crear Mazmorra" / Sala de Expedición del Host y ventana de Configuración.
  - En [`InputManager.js`](file:///data/data/com.termux/files/home/develop/game/src/input/InputManager.js), los botones táctiles se inicializan como invisibles (`display = 'none'`) en lugar de forzarse en pantalla al cargar la página.
  - En [`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js), se implementó el método reactivo [`setActionButtonsVisible(visible)`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js#L519-L525) que asegura que los botones táctiles permanezcan ocultos mientras cualquier modal o lobby esté abierto, mostrándose únicamente cuando el jugador entra efectivamente a la mazmorra en partida activa.

---

## [1.7.0] - 2026-09-28

### Added
- **Cofres del Tesoro Interactivos y Jugables (`ChestRenderer`)**:
  - Implementación de [`ChestRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/ChestRenderer.js) con modelo 3D detallado de cofre voxel: madera de roble, refuerzos y bisagras doradas, cerradura de hierro y botín interior brillante (oro y gemas rúnicas resplandecientes).
  - Animación suave de apertura de tapa en tiempo real ($77^\circ$) al interactuar con el botón **ACTION**.
  - Distribución estratégica en los niveles:
    - **[`dungeon_classic.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/dungeon_classic.json)**: *Cofre Antiguo del Vestíbulo* (contiene la Llave Antigua del Santuario y 100 Gemas) y *Cofre Oculto del Santuario* (contiene el Cáliz Sagrado y 250 Gemas).
    - **[`crypt_inferno.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/crypt_inferno.json)**: *Cofre de Brasas del Vestíbulo* y *Cofre Volcánico del Altar*.
  - Sincronización multijugador P2P: nuevo mensaje binario [`CHEST_OPEN`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js#L131) en [`Protocol.js`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js) y [`NetworkManager.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkManager.js) para que todos los jugadores vean abrirse el cofre y reciban la notificación cooperativa.

### Changed
- **Iluminación Ambiental Clara y Mazmorra Despejada**:
  - Eliminación de las antorchas fijas y luces puntuales para reducir la saturación de elementos estáticos y priorizar objetos interactivos y jugables.
  - Aumento de la luz ambiental general ([`AmbientLight`](file:///data/data/com.termux/files/home/develop/game/src/render/SceneManager.js)) a `0.95` (blanco puro) y luz direccional cenital a `0.70`, proporcionando visibilidad clara, uniforme y sin zonas oscuras en toda la mazmorra.
  - Ajuste de niebla a distancia lejana ($35\text{ m}$ a $80\text{ m}$) con fondo limpio slate-800 (`0x1e293b`), permitiendo apreciar las salas con total amplitud y nitidez.

---

## [1.6.0] - 2026-09-28

### Added
- **Sistema de Antorchas Fijas y Candiles en la Mazmorra (`TorchRenderer`)**:
  - Implementación de [`TorchRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TorchRenderer.js) con modelos 3D de apliques de hierro forjado, copas metálicas y llamas vivas de doble núcleo (`MeshBasicMaterial`).
  - Animación procedimental de parpadeo realista de fuego (flickering natural) sin asignaciones de memoria (Zero-GC) en el bucle de renderizado.
  - Distribución estratégica de puntos de luz cálidos ([`PointLight`](file:///data/data/com.termux/files/home/develop/game/src/render/TorchRenderer.js)) en las columnas de soporte, dinteles y laterales de las puertas, el arco sobre el abismo y el Pedestal / Altar Ancestral.
  - Soporte declarativo en archivos de niveles ([`dungeon_classic.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/dungeon_classic.json) y [`crypt_inferno.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/crypt_inferno.json)) a través de [`LevelLoader.js`](file:///data/data/com.termux/files/home/develop/game/src/levels/LevelLoader.js) y recarga automática al cambiar de nivel o sincronizar por red.

### Changed
- **Overhaul de Visibilidad y Claridad de la Mazmorra**:
  - Aumento de la iluminación ambiental [`AmbientLight`](file:///data/data/com.termux/files/home/develop/game/src/render/SceneManager.js) a `0.78` y luz de relleno direccional a `0.85` en [`SceneManager.js`](file:///data/data/com.termux/files/home/develop/game/src/render/SceneManager.js), eliminando sombras negras impenetrables sin perder la estética subterránea.
  - Ajuste de niebla (`Fog`): inicio ampliado a $26\text{ m}$ y final a $62\text{ m}$ con color de cripta nocturna `0x0f172a`, otorgando visión clara de las salas completas y vislumbrando a lo lejos el resplandor de las siguientes cámaras.
  - Paleta de colores de bloques mejorada en [`constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js): losas de suelo de piedra más claras (`0x475569`), muros de sillar labrado (`0x334155`) y columnas contrastadas (`0x64748b`), haciendo nítidos los detalles de bisel y relieve del shader procedural.

---

## [1.5.1] - 2026-09-28

### Changed
- **Extensión de la Profundidad de Caída al Abismo (Sensación de Vértigo y Caída Libre)**:
  - Ajustado el umbral de rescate del vacío [`VOID_RESCUE_Y`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js) de $-0.5$ a $-4.5$ en [`constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js) y [`SimulationEngine.js`](file:///data/data/com.termux/files/home/develop/game/src/simulation/SimulationEngine.js).
  - La distancia total de caída libre desde la superficie del suelo ($y = 1.0$) se amplía de $1.5\text{ m}$ a $5.5\text{ m}$ (4 bloques exactos adicionales de recorrido vertical al vacío).
  - Tiempo de caída libre extendido a $\approx 0.74\text{ s}$ bajo gravedad acelerada ($g = -20\text{ m/s}^2$), alcanzando velocidades de descenso cercanas a $-15\text{ m/s}$ y proporcionando una auténtica sensación de precipicio y vértigo antes del punto de reaparición.
- **Física AABB Optimizada en Caída Libre**:
  - En [`PhysicsAABB.js`](file:///data/data/com.termux/files/home/develop/game/src/core/PhysicsAABB.js), se garantiza que cuando no existe superficie sólida de apoyo inferior (`floorTop === -Infinity`), el jugador continúe cayendo verticalmente (`pos.y = oldY + dy`) sin congelar su posición en el aire al rozar paredes o salientes durante la trayectoria.

---

## [1.5.0] - 2026-09-28

### Added
- **Techo Abovedado de Piedra en la Mazmorra**:
  - Implementación de la directiva `ceiling` en [`LevelLoader.js`](file:///data/data/com.termux/files/home/develop/game/src/levels/LevelLoader.js) para techar de forma completa y sólida las estancias de la mazmorra.
  - Techo colocado a altura $y = 6$ ($5.0\text{ m}$ de altura interior libre), permitiendo saltos máximos sobre plataformas elevadas con más de $1\text{ m}$ de holgura y sin colisiones incómodas.
  - Elevación de muros perimetrales y muros divisores hasta $y = 5$, cerrando por completo los laterales de la mazmorra.
  - Columnas de soporte alargadas hasta $y = 5$ conectando el suelo de piedra con el techo, junto con vigas de arcos fajones transversales.
- **Ambientación Subterránea Inmersiva**:
  - Sustitución del fondo celeste de cielo abierto por un entorno oscuro de cripta (`0x090d16`) con niebla de profundidad atmosférica en [`SceneManager.js`](file:///data/data/com.termux/files/home/develop/game/src/render/SceneManager.js).
  - Iluminación cálida estilo antorchas cenitales (`0xffedd5`) con rebotes volumétricos en piedra y pizarra.
- **Física de Rebote en Techos y Dinteles**:
  - En [`SimulationEngine.js`](file:///data/data/com.termux/files/home/develop/game/src/simulation/SimulationEngine.js), cuando el jugador salta y colisiona su cabeza con un techo o dintel (`r.hitY && p.vel.y > 0`), la velocidad vertical ascendente se anula inmediatamente, provocando una caída natural y suave sin quedarse adherido.

---

## [1.4.1] - 2026-09-28

### Fixed
- **Corrección de Suelo Bajo las Puertas (Hueco al Abrir)**:
  - Corregido el problema por el cual los cubos de suelo situados debajo de la puerta desaparecían o quedaban vacíos al abrirla.
  - La directiva `divider` de [`LevelLoader.js`](file:///data/data/com.termux/files/home/develop/game/src/levels/LevelLoader.js) ahora garantiza explícitamente la colocación de losas de piedra sólidas (`STONE_FLOOR`) en la cota $y = 0$ a lo largo de todo el muro y umbral.
  - Actualizados los archivos de nivel JSON ([`dungeon_classic.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/dungeon_classic.json) y [`crypt_inferno.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/crypt_inferno.json)) para extender la cobertura del suelo continuo a $z = 11$ y $z = 24$. Al abrir la puerta, el umbral permanece 100% sólido y transitable.

---

## [1.4.0] - 2026-09-28

### Added
- **Arquitectura de Niveles Desacoplada en Archivos de Datos**:
  - Creación del subsistema `src/levels/` para definir y almacenar mapas de mazmorras en archivos JSON limpios, legibles y extensibles sin tocar el código fuente del motor.
  - **Nivel 1**: [`src/levels/data/dungeon_classic.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/dungeon_classic.json) (*"Mazmorra Ancestral: Las Tres Cámaras"* - vestíbulo, foso de abismo con parkour y santuario del pedestal).
  - **Nivel 2**: [`src/levels/data/crypt_inferno.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/crypt_inferno.json) (*"Cripta del Fuego: Rocas Volcánicas"* - nuevo mapa con pilares de basalto, saltos en zig-zag sobre río de lava y altar ígneo).
  - **`LevelLoader`**: Motor interpretador que traduce directivas declarativas (`perimeter`, `fill`, `divider`, `pillar`, `block`) a la malla voxel de `World`, e incluye utilidades para importar/exportar niveles JSON.
  - **`LevelRegistry`**: Catálogo central para registro, consulta y cambio de niveles en caliente.
  - **Selector Visual de Niveles en el Lobby**:
    - El Host puede elegir interactivamente entre los diferentes mapas antes de iniciar la partida con tarjetas visuales, iconos de ambientación y etiquetas de dificultad.
    - Sincronización automática P2P: los clientes reciben el mapa seleccionado por el Host en el paquete `INIT` sin configuraciones adicionales.

---

## [1.3.2] - 2026-09-28

### Fixed
- **Corrección de Teletransporte Ascendente a las Bardas (Muros Perimetrales)**:
  - Eliminado el bucle de elevación en `tryMove` (`while (overlaps) pos.y += 1`) de [`PhysicsAABB.js`](file:///data/data/com.termux/files/home/develop/game/src/core/PhysicsAABB.js) que transportaba al jugador a la cima de las bardas ($y = 4.0$) al rozar un muro o caer al vacío.
  - Implementada resolución geométrica de suelo: un jugador solo aterriza sobre una superficie si se encontraba previamente sobre ella (`oldY >= floorTop`). Si cae junto a un muro lateral, sufre caída limpia sin ser elevado a la cornisa.

### Added
- **Sistema Integral de Puntos de Reaparición (Checkpoints por Estancia)**:
  - Los jugadores registran dinámicamente su punto de control conforme avanzan y pisan suelo firme:
    - **Sala 1 (Vestíbulo)**: Spawn inicial en `(12.0, 1.2, 4.5)`.
    - **Sala 2 (El Abismo)**: Umbral seguro tras la Puerta 1 en `(11.5, 1.2, 12.0)`.
    - **Sala 3 (Santuario)**: Umbral interior tras la Puerta 2 en `(11.5, 1.2, 25.0)`.
  - Rescate inmediato ante caídas al vacío ($pos.y < -0.5$) y seguridad anti-barda con aviso en el HUD: *"⚠️ ¡Caíste al abismo! Reapareciendo en [Sala]..."*.

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
