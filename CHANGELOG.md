# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.29.0] - 2026-10-01

### Fixed
- **Contención de Celdas SVG y Corrección de Sangrado en Sprites de Pilares y Jump Pad ([`src/render/TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js), [`src/render/textures/lava.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/lava.js), [`src/render/VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js))**:
  - Implementación de máscara de recorte estricta por celda en el Texture Atlas mediante `<clipPath id="tile-cell-clip">` aplicado a cada casilla `<g clip-path="url(#tile-cell-clip)">` en `TextureGenerator.js`, evitando que trazados vectoriales con grosores elevados o curvas se proyecten fuera de su cuadrícula de $128 \times 128$ px.
  - Saneamiento y clamp de todas las coordenadas de placas basálticas y corrientes de magma en `lavaActive` (Tile 13), `lavaFissures` (Tile 16) y `lavaRiver` (Tile 18) para acotarlas estrictamente al rango $[0, 128]$ px, eliminando desbordamientos negativos ($-6, -2$) o superiores ($130, 134$).
  - Eliminación definitiva del sangrado rojo/anaranjado que invadía el lateral derecho del pilar acanalado (Tile 12), la parte superior de los pilares en la fila 5 (Tiles 20, 21, 22) y las esquinas de la losa de salto *Jump Pad* (Tile 14).
  - Calibración del clamping UV en el fragment shader de `VoxelMap` a `clamp(fract(vMapUv), 0.004, 0.996)` para prevenir redondeos subpíxel hacia celdas adyacentes en GPU.

### Added
- **Expansión del Texture Atlas a Matriz $4 \times 8$ ($512 \times 1024$ px) ([`src/render/TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js), [`src/render/VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js))**:
  - Ampliación de la resolución vertical del atlas a 1024 píxeles (8 filas de casillas de 128x128 px), manteniendo potencias de dos exactas ($512 \times 1024$) para máxima eficiencia en GPU y mipmapping en WebGL.
  - Ajuste del shader de fragmentos en `VoxelMap` para escalar las UVs locales con `vec2(0.25, 0.125)`, preservando una relación de aspecto estrictamente cuadrada ($1:1$) en cada cara de los bloques cúbicos.
  - Función de coordenadas UV `VoxelMap.getTileUVOffset(tileIndex)` adaptada para 8 filas: `u = (tileIndex % 4) * 0.25` y `v = (7 - Math.floor(tileIndex / 4)) * 0.125`.
- **Paleta de 5 Sprites Procedurales de Lava con Estructura Base Unificada (`BLOCK_TYPES.LAVA = 7`) ([`src/render/textures/lava.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/lava.js), [`src/render/VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js))**:
  - Unificación arquitectónica de las 5 variantes de lava siguiendo la misma filosofía de los pilares: todas comparten la base exacta de magma fundido (`#450a0a`), gradientes térmicos incandescentes (`lava-core`), afluentes en 4 capas de temperatura y 6 placas tectónicas perimetrales de basalto/obsidiana con orillas al rojo vivo.
  - Cada variante introduce ligeros cambios característicos en su interior:
    - **Tile 13 (Lava 1: Magma Activo / Flujo Base)**: Flujo de magma fluido y viscoso con ascuas sutiles en suspensión.
    - **Tile 16 (Lava 2: Magma con Fisuras en la Corteza)**: Red de micro-fracturas incandescentes en las placas de basalto donde brota el magma a presión.
    - **Tile 17 (Lava 3: Magma con Burbujas en Ebullición)**: Domos esféricos de gas volcánico 3D en ebullición sobre los canales con reflejos de luz y ondas de tensión térmica.
    - **Tile 18 (Lava 4: Magma con Ascuas y Chispas)**: Enjambre activo de chispas ardientes voladoras y micro-destellos térmicos en filamentos de alto calor.
    - **Tile 19 (Lava 5: Magma con Costra Flotante de Obsidiana)**: Placas menores de escoria negra en enfriamiento arrastradas por la corriente con estelas viscosas.
  - Distribución espacial determinista $O(1)$ en `VoxelMap.selectTile` con la paleta `[13, 16, 17, 18, 19]` basada en `VoxelMap.hashCoord(x, y, z)`, garantizando una apariencia orgánica y homogénea (~20% por variante) sincronizada entre todos los clientes en red P2P sin patrón repetitivo.
- **Reubicación de Bloques de Spawn y Losa de Entrada a 1 Bloque de la Pared ([`constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js), [`dungeon_classic.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/dungeon_classic.json), [`crypt_inferno.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/crypt_inferno.json), [`abyss_throne.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/abyss_throne.json), [`lobby_tutorial.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/lobby_tutorial.json), [`dev_showroom.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/dev_showroom.json))**:
  - Ajuste de `WORLD_CONFIG.SPAWN_Z` de `4.5` a `2.5` y reubicación de la losa rúnica de aparición `RESPAWN_PAD` a `z = [2, 3]` en todos los niveles.
  - La plataforma queda a exactamente 1 bloque de separación respecto a la pared perimetral trasera (`z = 0`), manteniendo el bloque `z = 1` como pasillo libre de suelo transitable para evitar colisiones con el cuerpo del jugador y permitir que el brazo de la cámara en tercera persona no sufra recortes inmediatos.
  - Actualización de los checkpoints de entrada de Sala 1 en todas las mazmorras y suites de pruebas unitarias.
- **Paleta de 5 Sprites Procedurales de Pilares / Columnas (`BLOCK_TYPES.PILLAR = 4`) ([`src/render/TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js), [`src/render/VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js))**:
  - Incorporación de 3 nuevas variantes de sprites de columnas monolíticas vectoriales SVG de alta definición preservando la misma arquitectura geométrica continua (3 acanaladuras verticales en $X=32, 64, 96$, bisel lateral y sombreado cilíndrico), garantizando un ensamble vertical continuo y sin costuras horizontales (*seamless*):
    - **Tile 10 (Pilar 1: Columna Monolítica Base)**: Fuste de piedra caliza/granito con sombreado cilíndrico y micro-desgaste sutil.
    - **Tile 12 (Pilar 2: Columna Acanalada Lisa)**: Fuste pulido de cantería limpia con líneas puras y contraste suave.
    - **Tile 20 (Pilar 3: Columna con Musgo)**: Colonización vegetal de humedad umbría en hendiduras y estrías verticales (`#14532d`), musgo vivo superficial (`#16a34a`) y esporas/líquenes (`#4ade80`).
    - **Tile 21 (Pilar 4: Columna con Desgaste Estructural)**: Fractura diagonal severa por fatiga de carga, grietas ramificadas con bisel lumínico 3D (`stroke-width="2.2"`), picado mineral profundo y muescas de mampostería desprendida.
    - **Tile 22 (Pilar 5: Columna con Manchas Oscuras)**: Mismo tono base unificado de cantería común (`#1c2027`), sombreado cilíndrico y acanaladuras que los demás pilares, incorporando exclusivamente manchas orgánicas oscuras de hollín y filtraciones sombrías (`#040507`, `#080a0d`), con vetas descendentes por las estrías y salpicaduras de tizne.
  - Distribución espacial determinista $O(1)$ en `VoxelMap.selectTile` con la paleta `[10, 12, 20, 21, 22]` basada en `VoxelMap.hashCoord(x, y, z)`, completando la simetría de 5 variantes orgánicas para todos los bloques estructurales elementales (Muros, Suelos, Lava y Pilares).
- **Paleta de 5 Sprites Procedurales de Techos y Bóvedas (`BLOCK_TYPES.CEILING = 12`) ([`src/render/textures/ceilings.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/ceilings.js), [`src/render/VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js), [`src/levels/LevelLoader.js`](file:///data/data/com.termux/files/home/develop/game/src/levels/LevelLoader.js))**:
  - Incorporación del módulo atómico [`ceilings.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/ceilings.js) que añade 5 sprites vectoriales SVG de alta definición para las cubiertas cenitales de la mazmorra (expandiendo el atlas de 23 a **28 sprites activos** en la matriz $4 \times 8$):
    - **Tile 23 (Techo 1: Bóveda de Crucería Gótica - Base)**: Arcos fajones diagonales cruzados en relieve, dovelas de piedra y clave de bóveda central circular tallada.
    - **Tile 24 (Techo 2: Artesonado de Vigas de Roble y Forja)**: Cuatro casetones rehundidos con veta de madera, dos vigas maestras cruzadas y placa de unión de hierro forjado con remaches.
    - **Tile 25 (Techo 3: Losa con Fracturas y Filtraciones)**: Fractura tectónica profunda ramificada, halo de humedad oscura y depósitos minerales de caliza/salitre con gotas de condensación.
    - **Tile 26 (Techo 4: Bóveda con Musgo Colgante y Moho)**: Colonización vegetal cenital en tres capas botánicas con esporas claras suspendidas y condensación de agua.
    - **Tile 27 (Techo 5: Clave de Bóveda Rúnica de Contención)**: Círculo rúnico arcano concéntrico con octagrama de soporte tectónico, 4 ménsulas angulares de contención y núcleo cálido.
  - Asignación del nuevo tipo de bloque `BLOCK_TYPES.CEILING = 12`, distribución pseudoaleatoria determinista en `VoxelMap.selectTile` con la paleta `[23, 23, 24, 25, 26, 27]`, actualización de `LevelLoader` y adaptación de todas las directivas de techo en los niveles JSON (`dungeon_classic`, `crypt_inferno`, `abyss_throne`, `lobby_tutorial`, `dev_showroom`).
  - Podio interactivo en el Showroom de Desarrollo (Sala 1) para inspeccionar de cerca las variantes de techo junto a los demás bloques del catálogo.
- **Modularización y Desacoplamiento Atómico del Sistema de Sprites (`src/render/textures/`, `src/render/TextureGenerator.js`)**:
  - Descomposición de la clase monolítica `TextureGenerator.js` (reducción de 1,175 a 65 líneas de código), separando la generación de texturas vectoriales SVG en módulos especializados por tipo de bloque:
    - [`src/render/textures/walls.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/walls.js): Muros (Tiles 0 a 4).
    - [`src/render/textures/floors.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/floors.js): Suelos (Tiles 5 a 9).
    - [`src/render/textures/pillars.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/pillars.js): Pilares y Columnas (Tiles 10, 12, 20, 21, 22).
    - [`src/render/textures/specials.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/specials.js): Respawn Pad, Jump Pad y Pedestal (Tiles 11, 14, 15).
    - [`src/render/textures/lava.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/lava.js): Lava y Fluidos Ígneos (Tiles 13, 16, 17, 18, 19).
    - [`src/render/textures/index.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/index.js): Módulo agregador con la función `createTilesSvgArray(S)`.
  - Mantenimiento del 100% de retrocompatibilidad con Three.js y WebGL, 0 peticiones HTTP adicionales, empaquetado optimizado con Vite y suite de pruebas unitarias que valida la integridad estructural de cada sprite.
- **Modularización y Desacoplamiento Paramétrico de Modelos 3D (`src/render/models/`)**:
  - Descomposición de la lógica de construcción geométrica y ensamblaje de mallas 3D de los controladores de renderizado, centralizándola en submódulos atómicos bajo `src/render/models/`:
    - **Héroes (`src/render/models/heroes/`)**:
      - [`baseAvatar.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/heroes/baseAvatar.js): Geometrías compartidas (`head`, `torso`, `belt`, `arm`, `leg`), materiales comunes con rostro procedural SVG, creador de cartel billboard `createNameSprite` y esqueleto base `buildBaseAvatarMesh`.
      - [`paladinGear.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/heroes/paladinGear.js): Yelmo plateado con visera, cresta de crin escarlata, hombreras esféricas y escudo heráldico con umbo dorado.
      - [`rangerGear.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/heroes/rangerGear.js): Capucha verde bosque, capa élfica y carcaj con astiles de flecha y plumas blancas.
      - [`wizardGear.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/heroes/wizardGear.js): Sombrero cónico puntiagudo de ala ancha y báculo arcano con cristal octaédrico brillante.
      - [`guardianGear.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/heroes/guardianGear.js): Corona dorada con gema de rubí, hombreras reforzadas, faldón de placas y brazales de forja.
      - [`index.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/heroes/index.js): Diccionario unificado `GEAR_BUILDERS`.
    - **Props del Escenario (`src/render/models/props/`)**:
      - [`chestModel.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/props/chestModel.js): Textura procedural SVG de roble, base hueca con cantoneras y asas toroidales, cerradura dorada, tapa arqueada con herrajes abiertos (`openEnded=true`) y tesoro interior con 3 gemas talladas (zafiro, rubí, esmeralda).
      - [`doorModel.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/props/doorModel.js): Textura procedural de tablones, dos hojas batientes independientes, bandas de refuerzo, cerradura y pomos esféricos dobles.
      - [`pedestalModel.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/props/pedestalModel.js): Plinto escalonado de 2 peldaños, columna ahusada de 4 caras, collar de forja, runas solares contrarrotatorias, cristal octaédrico en suspensión y sistema de partículas de ascuas mágicas.
      - [`stairsModel.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/props/stairsModel.js): Losa rúnica corrediza con 3 bandas de forja y runas doradas, escalones tallados, luz de fosa profunda y partículas de niebla ascendente.
      - [`index.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/props/index.js): Exportador unificado de props.
    - **Índice Raíz ([`src/render/models/index.js`](file:///data/data/com.termux/files/home/develop/game/src/render/models/index.js))**: Re-exportador general de constructores y equipamiento.
  - Refactorización de controladores ([`AvatarRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/AvatarRenderer.js), [`ChestRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/ChestRenderer.js), [`DoorRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/DoorRenderer.js), [`PedestalRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/PedestalRenderer.js), [`StairsRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/StairsRenderer.js)), reduciendo más de 1,000 líneas y delegando la creación física a los módulos especializados, preservando el 100% de su API y comportamiento cinemático/resortes.
  - Protección isomórfica con salvaguardas para entornos de pruebas en Node.js (`typeof document === 'undefined'`), evitando errores de referencia y permitiendo testing automatizado sin emuladores pesados.
  - Suite de pruebas unitarias dedicada en [`tests/models.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/models.test.js) con 7 tests que verifican geometrías, materiales compartidos, generador de nametags y constructores de mallas.
- **Documentación Técnica y Pruebas Unitarias ([`docs/21-sprite-lava-y-renderizado-igneo.md`](file:///data/data/com.termux/files/home/develop/game/docs/21-sprite-lava-y-renderizado-igneo.md), [`docs/23-catalogo-sprites-y-modelos-3d.md`](file:///data/data/com.termux/files/home/develop/game/docs/23-catalogo-sprites-y-modelos-3d.md), [`docs/README.md`](file:///data/data/com.termux/files/home/develop/game/docs/README.md), [`tests/levels.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/levels.test.js), [`tests/models.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/models.test.js))**:
  - Documentación de las 5 variantes ígneas y las 5 variantes de columnas monolíticas, diagramas de flujo y especificación matemática de la matriz 4x8.
  - Actualización del catálogo de sprites (23 casillas activas en matriz 4x8), catálogo exhaustivo de modelos 3D y su arquitectura modular en `src/render/textures/` y `src/render/models/`.
  - Pruebas unitarias que certifican la selección balanceada de las 5 variantes de lava, las 5 variantes de pilares, la generación de los 23 fragmentos SVG modulares, la precisión de coordenadas UV en la cuadrícula 4x8 y la integridad de los modelos 3D paramétricos.

## [1.28.0] - 2026-10-01

### Added
- **Showroom de Desarrollo y Sandbox de Pruebas de Bloques (`dev_showroom.json`, `LevelRegistry.js`, `UIManager.js`, `main.js`)**:
  - Mapa de pruebas exhaustivo (`24 × 16 × 36`) que reúne todos los bloques vóxel creados y todas las mecánicas interactivas del motor en un único escenario sin alterar el progreso de la campaña.
  - **Aislamiento Absoluto de la Campaña**: Registro con banderas `isDevOnly: true` y `hiddenFromCampaign: true`. `LevelRegistry.getAllLevels()` filtra el nivel para que `DescentManager` jamás lo cargue en la rotación regular (`lobby_tutorial` $\to$ `dungeon_classic` $\to$ `crypt_inferno` $\to$ `abyss_throne`).
  - **Sala 1 (Galería de Sprites y Texturas)**: Podios elevados de $2 \times 2$ para inspeccionar con fidelidad cada bloque del Texture Atlas procedural (`FLOOR_STONE`, `FLOOR_WORN`, `FLOOR_MOSS`, `WALL` con fisuras/musgo/runas, `PILLAR`, `RESPAWN_PAD`, `JUMP_PAD`, `LAVA`, `PEDESTAL`).
  - **Puerta 1 (Divisor Libre)**: Puerta deslizante 2×2 interactiva con tecla `E` / botón táctil sin requerimiento de llave.
  - **Sala 2 (Laboratorio de Físicas y Mecánicas)**:
    - Circuito de salto escalonado con dos *Jump Pads* a diferentes alturas ($y=0 \to y=2 \to y=4$) para verificar el impulso vertical ($14.0$), ausencia de daño por caída y acumulador de delta time a 30 Hz.
    - Fosa activa de lava de $4 \times 4$ bloques para auditar la física de fluidos no sólidos: sumersión, velocidad terminal reducida ($-1.0$), bloqueo de salto, ciclo de daño por inmersión y reaparición en la losa rúnica con arpegio procedural.
    - Cofre 1: Otorga la `llave_showroom` (*"Llave Maestra del Showroom"*).
    - Cofre 2: Otorga 250 gemas arcanas con actualización en vivo del HUD.
    - Cofre 3: Otorga la `pocion_vida` (+1 ❤️) consumible desde inventario (`B`) o atajo (`P`).
  - **Puerta 2 (Divisor Sellado)**: Cerradura de seguridad que exige la `llave_showroom` obtenida en el Cofre 1 y la consume al abrirse.
  - **Sala 3 (Santuario, Reliquias y Escalinata Ceremonial)**: Altar ancestral con orbe flotante en levitación trigonométrica y compuerta de escalinata de descenso.
- **Acceso Exclusivo desde el Modal de Herramientas Dev (`UIManager.js`, `main.js`)**:
  - Botón `#btn-dev-enter-showroom` en el modal `#modal-dev` (activo solo en desarrollo o con botón dev).
  - Botón dinámico `#btn-dev-exit-showroom` para regresar al vestíbulo (`lobby_tutorial`) cuando se está dentro del Showroom.
  - Método `startDevShowroomSession()` en `main.js`: permite iniciar una sesión local directa en solitario al hacer clic en el Showroom desde el menú principal o vestíbulo, configurando controles, HUD e invulnerabilidad inicial.
- **Documentación Técnica y Pruebas Unitarias ([`docs/22-showroom-desarrollo-y-galeria-bloques.md`](file:///data/data/com.termux/files/home/develop/game/docs/22-showroom-desarrollo-y-galeria-bloques.md), [`docs/23-catalogo-sprites-y-modelos-3d.md`](file:///data/data/com.termux/files/home/develop/game/docs/23-catalogo-sprites-y-modelos-3d.md), [`tests/levels.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/levels.test.js), [`tests/ui-manager.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/ui-manager.test.js))**:
  - Especificación completa de arquitectura del Showroom, topología de salas y flujo de navegación.
  - Catálogo exhaustivo de los 16 sprites procedurales del Texture Atlas y desglose detallado de los 11 modelos 3D paramétricos del motor (5 héroes, cofre interactivo, puertas dobles, altar con orbe, escalinata y mundo vóxel instanciado).
  - Tests unitarios que validan el aislamiento estricto de la campaña, la coherencia de llaves/cofres/puertas, la carga del mapa en `World` y los eventos del modal dev.

## [1.27.0] - 2026-10-01

### Added
- **Activos Visuales de Jugabilidad y Experiencia Móvil (`docs/assets/gameplay-coop.svg`, `docs/assets/mobile-hud-preview.svg`)**:
  - `gameplay-coop.svg`: Representación vectorial panorámica que ilustra la apertura cooperativa de puertas 2×2, la plataforma de salto rúnico (*Jump Pad*), la fosa de lava ardiente sobre el abismo, el cofre de botín interactivo con llaves doradas y los avatares vóxel con nametags 3D en perspectiva.
  - `mobile-hud-preview.svg`: Representación de la interfaz móvil en smartphone landscape, detallando el joystick virtual dinámico Nipple.js, Touch Look a 120 Hz, botones de acción (`USAR`, `SALTAR`), HUD de vidas con contorno y el nuevo panel interactivo de controles.
  - Incorporación del logotipo oficial wordmark en la cabecera del README.
- **Panel Superpuesto de Controles Descartable con Persistencia ([`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html), [`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js), [`InputManager.js`](file:///data/data/com.termux/files/home/develop/game/src/input/InputManager.js), [`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**:
  - Cabecera interactiva `#tutorial-controls-hud` con botón de cierre táctil `(×)` (`#btn-close-controls`) y badge de atajo `[H]`.
  - Curva de aprendizaje guiada: se muestra automáticamente para nuevos aventureros y memoriza su descarte en `localStorage` (`runa_controls_dismissed`).
  - Métodos `UIManager.prototype.showControlsHud`, `hideControlsHud` y `toggleControlsHud`.
  - Atajo de teclado en tecla `H` para alternar la visibilidad de controles en cualquier momento con respuesta sonora procedural.
  - Control de visibilidad en el modal de Ajustes (`⚙️` -> *"Guía de Controles (HUD)"* -> botones *Mostrar / Ocultar*).
  - Barra inferior `#pc-hint` enriquecida con `B` botín y `H` controles.
- **Documentación de Arquitectura de Red y Onboarding ([`06-arquitectura-listen-server-hosting.md`](file:///data/data/com.termux/files/home/develop/game/docs/06-arquitectura-listen-server-hosting.md), [`README.md`](file:///data/data/com.termux/files/home/develop/game/README.md), [`docs/README.md`](file:///data/data/com.termux/files/home/develop/game/docs/README.md))**:
  - Sección 4: Gestión de desconexión del Host (fail-safe defensivo, paquete binario `HOST_CLOSING` `0x07` y captura de socket caído en `safe.on('close')`).
  - Sección 5: Hoja de ruta para Migración Automática de Host (*Host Migration* P2P con algoritmo de consenso ligero y sincronización de snapshots maestros de mazmorra).
  - Sección 6: Flujo de conexión y onboarding móvil paso a paso (*Zero-Typing WebRTC Onboarding* con escaneo de código QR dinámico y Web Share API).

### Changed
- **Robustecimiento ante Desconexión Abrupta de Host ([`NetworkManager.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkManager.js))**:
  - Despacho automático de `host-closing` ante el cierre inesperado del canal seguro `safe.on('close')`, evitando que el cliente quede en un mundo huérfano si el host se apaga o pierde conexión súbitamente.

## [1.26.0] - 2026-09-30

### Added
- **Bloque de Respawn y Losa Rúnica de Aparición (`RESPAWN_PAD`) ([`constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js), [`TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js), [`VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js), [`LevelLoader.js`](file:///data/data/com.termux/files/home/develop/game/src/levels/LevelLoader.js))**:
  - Constante `BLOCK_TYPES.RESPAWN_PAD = 11` y mapeo de color neutro `BLOCK_COLORS[11] = 0xffffff`.
  - Arte vectorial procedural en el **Tile 11** del Texture Atlas: base de sillar de basalto oscuro (`#0b0f19`, `#131b2e`), esquineros de aleación y forja celestial con remaches de zafiro (`#38bdf8`), círculos concéntricos de invocación en bajorrelieve y rosa de los vientos sagrada de 4 puntas con núcleo radiante de almas (`#f0f9ff`).
  - Mapeo en `VoxelMap.selectTile`: vincula determinísticamente el tipo `RESPAWN_PAD` al Tile 11 del atlas.
  - Colocación automática en mazmorras (`LevelLoader._placeRespawnPads`): instala plataformas sagradas de `2x2` losas a nivel de suelo (`y = 0`) exactamente bajo las coordenadas de spawn de cada nivel (`spawnPoint`) y en cada uno de los puntos de control intermedios (`checkpoints`).
  - Identificación visual unificada: tanto el Anfitrión como los invitados pueden reconocer a simple vista el punto exacto de entrada y reaparición en el vestíbulo y salas subsiguientes.
- **Mecánica de Santuario y Resonancia Celestial ([`SoundManager.js`](file:///data/data/com.termux/files/home/develop/game/src/audio/SoundManager.js), [`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**:
  - Efecto de sonido procedural `SoundManager.prototype.playRespawn`: sintetiza un arpegio ascendente de campanillas y armónicos cristalinos en frecuencias puras (Do5: 523.25 Hz, Mi5: 659.25 Hz, Sol5: 783.99 Hz, Do6: 1046.50 Hz) mediante Web Audio API con cero descarga de ficheros externos.
  - Activación en el ciclo de vida: al reaparecer tras caer en lava o en el abismo, se reproduce el arpegio celestial y se emite la notificación narrativa `✨ Reapareciendo en la Losa Rúnica...`.
  - Mantenimiento del escudo de invulnerabilidad temporal (2 s, `invulnTicks = 60`) al rematerializarse sobre la losa.
- **Documentación Técnica ([`docs/20-bloques-respawn-y-aparicion-runica.md`](file:///data/data/com.termux/files/home/develop/game/docs/20-bloques-respawn-y-aparicion-runica.md), [`docs/README.md`](file:///data/data/com.termux/files/home/develop/game/docs/README.md))**:
  - Especificación exhaustiva del bloque, arte SVG en el Texture Atlas, algoritmo de centrado de plataformas 2x2, integración con Web Audio API y pruebas unitarias.

## [1.25.0] - 2026-09-30

### Added
- **Control de Aforo Estricto y Límite de 5 Jugadores ([`constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js), [`PlayerManager.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/PlayerManager.js), [`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**:
  - Constantes `GAME_CONFIG.MAX_PLAYERS = 5` y `NET_CONFIG.MAX_PLAYERS = 5` con motivo de cierre `NET_CONFIG.CLOSE_REASON.ROOM_FULL = 1`.
  - Método `PlayerManager.prototype.isFull(max)`: evalúa el límite de capacidad de la expedición y rechaza el registro de un 6º jugador devolviendo `null`.
  - Rechazo autoritativo en el Host: al exceder 5 jugadores, emite paquete binario `HOST_CLOSING` con código `1` (`ROOM_FULL`) y cierra el canal WebRTC de inmediato.
  - Manejo amigable en cliente rechazado: muestra el estado `"La sala está llena (máximo 5 aventureros)"` y alerta narrativa `"🚫 La sala está llena (máximo 5 jugadores). No se admiten más aventureros."` retornando al menú sin cuelgues ni recargas forzadas.
  - Liberación dinámica de cupos: al desconectarse un jugador (`peer-left`), `PlayerManager.removeByConnection` libera el cupo y reactiva la admisión.
- **Unicidad Absoluta de Razas y Clases de Héroes ([`PlayerManager.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/PlayerManager.js), [`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js), [`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js), [`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html))**:
  - Métodos autoritativos `PlayerManager.prototype.getTakenColorIndices(excludePlayerId)` y `getAvailableColorIndex(preferredIndex, excludePlayerId, maxHeroes)`.
  - Resolución y arbitraje en el Host: si un jugador solicita una clase ya ocupada por un compañero (e.g. *Aventurero*), el Host reasigna determinísticamente la primera clase libre disponible (*Paladín*, *Explorador*, *Hechicero*, *Guardián*) y difunde los metadatos oficiales a la party.
  - Notificación en cliente reasignado: al recibir la clase reasignada por el Host, actualiza su perfil local y emite el mensaje `"⚠️ Tu clase elegida ya estaba en uso. El anfitrión te asignó: [Clase]"`.
  - Selector de clase interactivo en modal de ⚙️ Configuración (`#settings-heroes-row`): muestra las 5 clases con sus tarjetas de rasgos y estadísticas.
  - Bloqueo visual de clases ocupadas (`.hero-chip.occupied`): desaturadas al 85%, opacidad 35%, cruz roja superpuesta `✕`, cursor `not-allowed` y tooltip explicativo `"En uso por [Compañero]"`.
  - Bloqueo interactivo: intentar pulsar una clase ocupada bloquea la selección, reproduce sonido de advertencia y muestra `"⚠️ La clase [Nombre] ya está en uso por [Compañero]"`.
  - **Emblemas e Iconografía Vectorial en Fichas de Clase ([`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js), [`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html))**:
    - Sustitución de círculos de color lisos por insignias circulares que integran en su centro el **logotipo vectorial SVG exclusivo de cada clase**: brújula (`compass` para Aventurero), escudo (`shield` para Paladín), pluma (`feather` para Explorador), varita (`wand` para Hechicero) y corona (`crown` para Guardián).
    - Color inherente a la clase: eliminación de la selección independiente de color; el color característico pertenece al arquetipo y conforma el fondo y resplandor de la insignia.
    - Actualización de textos en UI: reemplazo del encabezado `"Clase y Color"` por `"Clase de Héroe"`.
    - Maquetación CSS de 36px con display flex centrado, sombreado proyectado `drop-shadow` en los iconos SVG y transiciones elásticas al pasar el cursor (`:hover`) y al pulsar.
  - Insignia reactiva de aforo en la lista de compañeros: indicador elástico `[N]/5 Jugadores` en cian (#38bdf8) y candado dorado `🔒 5/5 Llena` (#f59e0b) al completarse la party.
- **Documentación Técnica de Aforo y Clases ([`docs/19-limite-jugadores-y-clases-unicas.md`](file:///data/data/com.termux/files/home/develop/game/docs/19-limite-jugadores-y-clases-unicas.md), [`docs/README.md`](file:///data/data/com.termux/files/home/develop/game/docs/README.md))**:
  - Compendio integral sobre presupuestos de ancho de banda WebRTC (~10 KB/s @ 20 Hz para 5 jugadores), arquitectura espacial de 2 metros en pasillos, matriz de las 5 razas y protocolos de cierre.

## [1.24.0] - 2026-09-30

### Added
- **HUD de Estado Expandido e Interactivo ([`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js), [`Icons.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js), [`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html))**:
  - **Contorno de Corazones para Vidas Perdidas (`heartOutline`)**: Representación geométrica idéntica al corazón activo pero con `fill="none"` y `stroke="currentColor" stroke-width="2"` en tono `#64748b` con animación `@keyframes heartShake` al recibir daño.
  - **Insignia de Llaves de Mazmorra (`.key-badge`)**: Mantiene visible la llave activa en el HUD con icono dorado `#fbbf24` y borde divisorio vertical.
  - **Contador Numérico de Gemas en Tiempo Real (`.gems-badge`)**: Muestra el icono de gema azul cielo (`#38bdf8`) junto a la cantidad acumulada, reactivo a la recolección en cofres y reseteos.
  - **Delegación de Clic en el HUD**: Al pulsar las insignias de llave o gemas se abre directamente el modal de inventario.
  - **Botón Icono de Inventario (`#hud-inventory`)**: Botón cuadrado de $38\times 38\text{ px}$ con borde translúcido a la izquierda de las vidas, indicador badge numérico de botín y atajo de teclado tecla `B`.
- **Consumo y Eliminación de Llaves al Abrir Puertas ([`Player.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/Player.js), [`InteractionController.js`](file:///data/data/com.termux/files/home/develop/game/src/controllers/InteractionController.js), [`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**:
  - Método `Player.prototype.removeKey(keyId)` para retirar llaves consumidas.
  - Métodos `VoxelSandboxGame.prototype.removeInventoryKey(keyId)` y `removeInventoryRelic(relicId)`.
  - Apertura autoritativa: `InteractionController.prototype.openDoor(doorId, opener)` consume `door.requiresKey` tanto en el jugador como en el inventario, oculta la insignia si no restan llaves y emite el mensaje narrativo `"🗝️ ¡Llave consumida!"`.
  - Sincronización en red WebRTC en clientes al recibir confirmación de apertura de puerta.
- **Erradicación de Emojis e Incorporación de Iconos SVG Vectoriales (`gamepad`, `joystick`, `target`) ([`Icons.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js), [`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html), [`tests/icons.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/icons.test.js))**:
  - Eliminación total de emojis heterogéneos del DOM HTML (`🎮`, `🕹️`, `📦`) en la tarjeta de controles y botones táctiles del HUD de tutorial, sustituidos por marcado inline SVG nativo de alta resolución.
  - Nuevos iconos vectoriales agregados al catálogo `ICONS`: `gamepad` (mando/controles en púrpura `#a855f7`), `joystick` (palanca virtual en azul cielo `#38bdf8`) y `target` (diana de práctica en rojo `#ef4444`).
  - Mapeo automático en `EMOJI_TO_ICON_MAP` para que `replaceEmojisWithSvg` convierta dinámicamente cualquier mención de estos emojis en avisos narrativos y mensajes de tutorial a gráficos vectoriales nítidos sin emojis residuales.
- **Prioridad Visual Absoluta de Notificaciones (`#hud-message`, `z-index: 9999`) y Unificación de Alertas ([`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html), [`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js), [`InteractionController.js`](file:///data/data/com.termux/files/home/develop/game/src/controllers/InteractionController.js), [`DescentManager.js`](file:///data/data/com.termux/files/home/develop/game/src/controllers/DescentManager.js))**:
  - Reubicación de la pila de alertas narrativas al final del árbol DOM con `z-index: 9999`, garantizando que ninguna ventana modal, menú ni velo de transición oculte los avisos del juego.
  - Soporte de descarte rápido: las alertas pueden cerrarse instantáneamente al tocarlas o hacer clic sobre ellas.
  - **Unificación de Alertas de Cofres**: Al abrir un cofre que contiene llave se emitía una doble notificación superpuesta. Ahora se consolida en una única tarjeta narrativa que desglosa el cofre, el botín (`🗝️ Llave`, `💎 Gemas`, `🏆 Reliquias`) y añade la fila de progresión con icono de puerta (`🚪 Ahora puedes abrir: [Puerta]`).
  - **Unificación de Notificaciones y Reducción del Descenso a 5 Segundos**: El tiempo de espera sincronizado de la escalinata bajó de 8s a 5s para mayor dinamismo. Se eliminó la notificación narrativa redundante simultánea a la tarjeta de descenso, purga las alertas viejas de la pantalla (`hideNarrativeMessage()`) y ubica la tarjeta en `top: max(16px, env(safe-area-inset-top))` con `z-index: 9998` y botón con `z-index: 9999`.
  - **Movimiento Libre al Abrir la Losa Sellada**: Se eliminó el estado de bloqueo de 2.6 segundos en [`InteractionController.js`](file:///data/data/com.termux/files/home/develop/game/src/controllers/InteractionController.js) al abrir la losa de la escalinata. El jugador puede moverse, saltar y retroceder sin interrupción mientras se desplaza la losa.
  - Eliminación del mensaje preliminar `"Abriendo cofre..."` en clientes WebRTC para evitar parpadeos visuales previos a la confirmación autoritativa.
  - Corrección del texto de la notificación inicial del anfitrión en [`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js): eliminación de la indicación obsoleta de "cambiar mapa" (`"Toca ⚙️ para invitar amigos."`).
- **Herramientas de Desarrollo y Diagnóstico (`#modal-dev`)**:
  - Botón `#btn-dev` visible exclusivamente en desarrollo (`import.meta.env.DEV` o `localhost`).
  - Modal con botón "Reiniciar Partida (F5)" para navegadores móviles sin teclado y panel de telemetría WebRTC en tiempo real.
- **Diálogo Temático de Confirmación para Salir**:
  - Reemplazo de `window.confirm()` por modal oscuro *dark fantasy* con botones estilizados y efectos sonoros (`playClick()`, `playMenuClose()`).
- **Personalización de Barras de Desplazamiento y Versión de Proyecto**:
  - Scrollbars WebKit/Firefox en tonos obsidiana y ámbar.
  - Versión del proyecto expuesta dinámicamente en el modal de configuración leyendo `APP_CONFIG.VERSION`.
- **Orientación Inicial a 180° (`Math.PI`)**:
  - El jugador inicia mirando hacia el pasillo de la mazmorra (`player.yaw = Math.PI`), eliminando el spawn mirando contra la pared trasera.
- **Resiliencia de Red Multijugador y Corrección de Avatares**:
  - Reconexión automática con servidor de señalización PeerJS ante eventos `disconnected`.
  - Eliminación de avatar fantasma (ID -1) al iniciar partida.
  - Spawn offset seguro de invitados (+3 en Z) para evitar caídas a la lava o vacío en descensos de nivel.
- **Animación de Hundimiento y Muerte Cinemática en Lava ([`PhysicsAABB.js`](file:///data/data/com.termux/files/home/develop/game/src/core/PhysicsAABB.js), [`SimulationEngine.js`](file:///data/data/com.termux/files/home/develop/game/src/simulation/SimulationEngine.js), [`Player.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/Player.js), [`constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js), [`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**:
  - **Permeabilidad de Fluidos**: La lava (`BLOCK_TYPES.LAVA = 7`) deja de ser un bloque sólido impermeable en `PhysicsAABB.js`, permitiendo que el jugador penetre y se sumerja físicamente a través de su superficie.
  - **Bloqueo Autoritativo del Salto**: Se inhabilita por completo la acción de salto (`ACTION_FLAGS.JUMP`) al tocar lava o durante el estado `isSinkingInLava`.
  - **Caída Lenta y Viscosidad**: Descenso amortiguado a velocidad constante (`PHYSICS_CONFIG.LAVA_SINK_SPEED = -1.0 m/s`) y reducción horizontal al 20%, simulando la densidad del magma.
  - **Temporizador de Animación de Muerte (`LAVA_SINK_TICKS = 36`, ~1.2 s a 30 Hz)**: Proporciona una transición visual continua donde el cuerpo y la cámara del héroe se hunden en el magma incandescente antes de aplicar el daño de -1 vida y reaparecer en el punto de control.
  - **Feedback Audiovisual Instantáneo**: El evento `onPlayerLavaSink` dispara de inmediato el audio de quemadura (`SoundManager.playHurt()`) y la notificación de advertencia en pantalla al primer contacto.
- **Botón Interactivo de Descarte en Pantalla de Victoria del Altar Final ([`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js), [`InteractionController.js`](file:///data/data/com.termux/files/home/develop/game/src/controllers/InteractionController.js), [`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html))**:
  - Incorporación del botón interactivo `#btn-close-victory` ("Continuar Explorando") sobre el velo de victoria de la última mazmorra (`abyss_throne`).
  - Habilitación de `pointer-events: auto` y fondo degradado radial que permite interactuar con el botón en cualquier momento sin obligar a esperar una pantalla fija.
  - Al pulsar el botón (o cumplirse el tiempo de cortesía de 12 segundos), se invoca el callback `onClose` que descongelar de inmediato el movimiento del jugador para continuar explorando la cámara final libremente.
- **Suite de Pruebas Unitarias Ampliada ([`tests/`](file:///data/data/com.termux/files/home/develop/game/tests/))**:
  - 91 tests automatizados con `node:test` cubriendo el botón de descarte de victoria, la animación de hundimiento en lava, bloqueo de salto, velocidad lenta de fluido, consumo de llaves, contorno de corazones, HUD de gemas, herramientas dev, unificación de alertas de cofres, parser estructurado, descenso sincronizado a 5 segundos y movimiento libre en apertura de losa.

---

## [1.23.0] - 2026-09-29

### Added
- **Canales duales WebRTC ([`NetworkManager.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkManager.js), [`constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js), [`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**:
  - Canal `game-safe` (`reliable: true`) para eventos raros: `INIT`, `DOOR`, `CHEST`, `KEY`, `LEVEL_CHANGE`, `PLAYER_META`.
  - Canal `game-hot` (`reliable: false`) para hot-path tolerante a pérdida: `INPUT` (30 Hz), `SNAPSHOT` (20 Hz), `PING`/`PONG` (1 Hz). Un paquete perdido lo reemplaza el siguiente tick, sin head-of-line blocking.
  - Fallback automático a `safe` si el `hot` aún no abrió o se cae; `getLinkInfo()` expone el estado para UI/debug.
  - Normalización al canal `safe` como clave estable en `PlayerManager`/`InputQueue` aunque el `INPUT` llegue por `hot`.
- **Conexión endurecida P0**:
  - Config ICE con STUN público + TURN opcional vía `localStorage` (`dungeon_turn_url/user/pass`).
  - `host()` reintenta PIN si hay colisión (`unavailable-id`, hasta 5 intentos).
  - `join(pin, { timeoutMs: 12000 })` con timeout de 12 s, errores traducidos al español y `joinRoom()` con 1 reintento automático.
- **Constantes de red (`NET_CONFIG`)**: `CHANNEL_SAFE/HOT`, `HOT_MSGS`, `JOIN_TIMEOUT_MS`, `JOIN_RETRIES`.
- **Tests de regresión ([`tests/network-channels.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/network-channels.test.js))**: 4 tests de enrutado hot vs safe.
- **Nombre Oficial del Videojuego — Runa y Piedra**:
  - Sustitución de denominaciones técnicas previas (*voxel-sandbox-p2p*, *Voxel Dungeon*) por la identidad de marca oficial **`Runa y Piedra`** en [`package.json`](file:///data/data/com.termux/files/home/develop/game/package.json), [`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html), [`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js), [`README.md`](file:///data/data/com.termux/files/home/develop/game/README.md) y documentación técnica en [`docs/`](file:///data/data/com.termux/files/home/develop/game/docs/).

---

## [1.22.3] - 2026-09-28

### Added
- **Sprite de Plataforma de Salto `jumpPadStone` Integrado en el Calabozo ([`TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js), [`VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js), [`constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js))**:
  - Sustitución del antiguo bloque celeste neón fluorescente por una **losa de cantería ancestral arrancada del suelo del templo**:
    - **Base de sillar oscuro**: Tono idéntico a los pilares y sillar (`#252a32`), con biseles de luz cenital (`#3d434c`) y sombra (`#14181e`).
    - **Fracturas del colapso**: Grietas de impacto perimetrales en los bordes heredadas de la caída del templo sobre el abismo.
    - **Refuerzos de forja medieval**: 4 esquineros de hierro forjado (`#27272a`) con 12 remaches dorados (`#8a7a4a`).
    - **Glifo rúnico de impulso vertical**: Espiral de viento central con flecha ascendente grabada en bajorrelieve (sombra de cincelado `#0a0c10`) en ámbar cálido (`#d97706`), brillo interior volumétrico (`#f5a623`) y halo tenue contenido de visibilidad a distancia (`#d97706` al $8\%$).
  - **Alojamiento en Casilla 14 del Atlas**: Separación arquitectónica entre `BLOCK_TYPES.JUMP_PAD` (Casilla 14) y `BLOCK_TYPES.PEDESTAL` (Casilla 15).
  - Tinte neutro calibrado (`BLOCK_COLORS[6] = 0xffffff`) para reproducir fielmente la piedra oscura y el brillo ámbar sin atenuación cromática.

---

## [1.22.2] - 2026-09-28

### Changed
- **Sprite Unificado de Columna Monolítica Continua ([`TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js), [`VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js))**:
  - Se sustituyó la antigua mezcla de 5 estilos dispares de pilares por **un único sprite continuo** (Casilla 10), garantizando que las columnas verticales de varios bloques apilados se perciban visualmente como una sola pieza monolítica.
  - **Continuidad Vertical Absoluta (*Seamless Vertical Tiling*)**:
    - Supresión radical de cualquier línea horizontal o bisel en $Y = 0$ y $Y = 128$.
    - 3 acanaladuras/estrías verticales continuas ($X = 32, 64, 96$) que corren de extremo a extremo sin costura ni salto de fase al apilarse los bloques.
    - Sombreado de volumen cilíndrico/prismático continuo: realce lumínico lateral en $X = 0..14$ y sombra de caída en $X = 116..128$.
  - **Estética Oscura y Desgastada de Piedra Antigua**:
    - Base de sillar de basalto oscuro (`#1c2027`) con tinte neutro calibrado (`BLOCK_COLORS[4] = 0xffffff` y `THREE_COLORS[4]`).
    - Micro-fisuras de compresión longitudinales en cantería, desconchones en las aristas de las estrías, pátina vertical de hollín y grano mineral picado.

---

## [1.22.1] - 2026-09-28

### Changed
- **Ampliación de Escala a Losas Grandes $2 \times 2$ ($50\text{ cm}$) y Mortero Suave ([`TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js))**:
  - Se sustituyó la antigua cuadrícula densa de 16 cuadritos pequeños ($4 \times 4$ de $25\text{ cm}$) por **4 losas grandes de cantería señorial** ($2 \times 2$ de $50\text{ cm}$, $64 \times 64\text{ px}$ en atlas).
  - **Eliminación del efecto rejilla negra**:
    - Se reemplazó el fondo azabache `#0a0c10` por un tono de mortero de juntura suave `#22262d`.
    - Reducción del ancho visible de junta a $\approx 1\text{ px}$ con bisel de sombra amortiguado (`#181b20`, opacidad reducida a $0.35$).
    - Rediseño de las grietas (`floorTilesWorn`), acumulación de musgo en la cruz central (`floorTilesMossy`), variante combinada (`floorTilesMossyWorn`) y losa ceremonial (`floorTilesSanctuary`) a la nueva escala métrica.
    - Se logra un aspecto mucho más espacioso, limpio y monumental en todo el pavimento del calabozo.

---

## [1.22.0] - 2026-09-28

### Added
- **Set Cohesivo de Suelo en SVG de Adoquines Medievales ([`TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js))**:
  - Sustitución de los patrones de piso por una suite uniforme basada en cuadrícula métrica idéntica ($32 \times 32\text{ px}$ por adoquín en celdas de $128 \times 128\text{ px}$), misma iluminación cenital (bisel superior e izquierdo en `#8a929c` y bisel de sombra inferior y derecho en `#0a0c10`), y misma base cromática `#6a7078`:
    - **`floorTiles` (Casilla 5)**: Adoquín limpio con variación sutil de tono por baldosa para evitar monotonía visual.
    - **`floorTilesWorn` (Casilla 6)**: Adoquín desgastado con grietas de trazo oscuro `#0a0c10` (ancho $1.4\text{ px}$) y bisel de luz paralelo (`#8a929c`), además de lascas y desconchones angulares.
    - **`floorTilesMossy` (Casilla 7)**: Adoquín húmedo con acumulación de musgo en las juntas (`#3d5a2a`), matas oscuras de base (`#4a6e30`) y brillos volumétricos (`#5d8a3d`).
    - **`floorTilesMossyWorn` (Casilla 8)**: Combinación de grietas intermedias con brotes de vegetación en llagas.
    - **`floorTilesSanctuary` (Casilla 9)**: Pavimento con rombo ceremonial integrado en la trama de adoquines para zonas sacras.
  - Tinte base neutro en blanco (`#ffffff`) en `THREE_COLORS` para preservar fielmente los matices y el verde natural del musgo sin oscurecimiento indeseado.

- **Nuevos Tipos de Bloque y Función de Dispersión `floorVariant` ([`constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js), [`World.js`](file:///data/data/com.termux/files/home/develop/game/src/core/World.js), [`LevelLoader.js`](file:///data/data/com.termux/files/home/develop/game/src/levels/LevelLoader.js))**:
  - Incorporación de `BLOCK_FLOOR_STONE = 8`, `BLOCK_FLOOR_WORN = 9`, `BLOCK_FLOOR_MOSS = 10`.
  - Implementación de `floorVariant(x, z)` mediante hash determinista de 32 bits:
    - Distribución precisa y balanceada: $\approx 70\%$ limpio (`BLOCK_FLOOR_STONE`), $\approx 20\%$ desgastado (`BLOCK_FLOOR_WORN`), y $\approx 10\%$ con musgo (`BLOCK_FLOOR_MOSS`).
    - Cero sobrecarga de red: cálculo determinista al vuelo idéntico en host y clientes WebRTC.
    - Integración en generador de niveles para regiones `fill` de suelo y umbrales `divider`.

---

## [1.21.0] - 2026-09-28

### Added
- **Atlas de Texturas Procedural Vectorial SVG 4x4 (16 Casillas) ([`TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js))**:
  - Implementación de un generador procedural de alta definición ($512 \times 512\text{ px}$, 16 tiles de $128 \times 128\text{ px}$) con tres grupos temáticos de 5 variaciones cada uno más un glifo arcano especial:
    - **Grupo de Muros (5 variantes)**:
      1. *Sillar regular*: Muro de sillares clásicos con hiladas alternadas y juntas profundas de mortero.
      2. *Sillar agrietado*: Fracturas diagonales en zigzag con biseles de luz y desprendimientos.
      3. *Mampostería irregular*: Aparejo rústico de piedras de diferentes dimensiones y juntas anchas.
      4. *Sillar con musgo*: Manchas de humedad y colonias vegetales en esquinas y llagas.
      5. *Sillar rúnico*: Medallón circular central con glifo ancestral tallado en bajo relieve.
    - **Grupo de Suelo (5 variantes)**:
      1. *Grandes losas $2 \times 2$*: Pavimento señorial con biseles en cruz y juntas finas.
      2. *Losa fracturada*: Fractura radial por impacto central de estrella y lascas de piedra.
      3. *Adoquines medievales*: Patrón empedrado orgánico de cantos rodados redondeados.
      4. *Losa con musgo*: Juntas tomadas por vegetación y líquenes de calabozo húmedo.
      5. *Rombo ceremonial*: Losa heráldica con rombo concéntrico y molduras de templo.
    - **Grupo de Pilares (5 variantes)**:
      1. *Columna estriada*: Acanaladuras verticales jónicas con relieve de sombra y aristas vivas.
      2. *Pilar con anillo de forja*: Faja metálica horizontal de hierro reforzado con remaches.
      3. *Sillar almohadillado*: Bloque rústico toscano con chaflanes perimetrales pronunciados.
      4. *Columna salomónica*: Fuste helicoidal torsionado con relieve en diagonal a $45^\circ$.
      5. *Capitel / Basa moldurada*: Molduras escalonadas clásicas con toro y plinto.
    - **Glifo Rúnico Celestial (Casilla 15)**: Octagrama solar ceremonial para pedestales y plataformas mágicas.
  - Generación 100% vectorial en memoria (SVG a Canvas) sin requerir ninguna descarga ni asset externo en disco.

- **Inyección de Shader Instanciado (`onBeforeCompile`) y 1 Solo Draw Call ([`VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js))**:
  - Incorporación del atributo de instancia `atlasOffset` (`THREE.InstancedBufferAttribute`) en el `THREE.BoxGeometry` del mapa voxel.
  - Modificación de los shaders Lambert mediante `material.onBeforeCompile`:
    - En vertex shader: transmisión de `vAtlasOffset` mediante `varying vec2`.
    - En fragment shader: cálculo de coordenadas `tileUv = clamp(fract(vMapUv), 0.002, 0.998) * vec2(0.25, 0.25) + vAtlasOffset` con margen anti-bleeding, garantizando muestreo libre de artefactos en los bordes de casilla.
  - Se mantiene el presupuesto móvil inquebrantable de **1 único Draw Call** para todo el terreno del mundo.
  - Multiplicación automática con los colores de bloque (`mesh.setColorAt`), preservando la iluminación y paleta de la mazmorra.

- **Selección Pseudoaleatoria Determinista $O(1)$ por Coordenada ([`VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js))**:
  - Función hash entera libre de colisiones (`hashCoord(x, y, z)`), reproduciendo la misma asignación de variantes en todos los clientes y el host sin consumir ancho de banda de red ni emitir paquetes de sincronización.
  - Ponderación arquitectónica natural: sillar regular dominante con presencia orgánica de grietas, musgo y mampostería.

---

## [1.20.1] - 2026-09-28

### Fixed
- **Corrección de Z-Fighting y Parpadeo en los Laterales de la Tapa ([`ChestRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/ChestRenderer.js))**:
  - Se configuró `openEnded: true` en todas las bandas semicilíndricas de forja (`bandArc1`, `bandArc2`, `endRim1`, `endRim2`), eliminando las tapas semicirculares planas de hierro que coincidían en el mismo plano geométrico ($X = \pm 0.45\text{ m}$) que los laterales de madera noble de la bóveda.
- **Corrección del Parpadeo del Interior al Abrir el Cofre ([`ChestRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/ChestRenderer.js))**:
  - **Modelado de cavidad interior hueca**: La base del cofre y los marcos de remate superior ahora poseen una cavidad interior abierta de $18\text{ cm}$ de profundidad, suprimiendo la antigua losa sólida de madera y metal que cortaba el montículo de oro y las gemas provocando Z-fighting severo.
  - **Elevación de la fuente de luz `lootLight`**: Se desplazó la luz puntual dorada a $Y = 0.60\text{ m}$ ($20\text{ cm}$ por encima de las gemas), erradicando la división por distancia cero y artefactos NaN que hacían titilar los polígonos durante la rampa de intensidad del resorte.
  - **Renderizado de doble cara (`THREE.DoubleSide`)**: El material de madera de roble ahora renderiza tanto el exterior como el intradós de la bóveda abovedada sin transparencia ni culling inverso.
  - **Fijación limpia de reposo en Spring**: Al asentarse el resorte de la bisagra, el ángulo y la intensidad de la luz se fijan de forma estricta y determinista.
  - **Sincronización `setOpenInstant` en uniones tardías ([`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**: Los clientes que se unen a una partida con cofres abiertos reciben el estado inmediato sin animación retrasada.

---

## [1.20.0] - 2026-09-28

### Added
- **Rediseño Completo del Cofre del Tesoro 3D Medieval ([`ChestRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/ChestRenderer.js))**:
  - **Eliminación de la apariencia de caja de regalo**:
    - Supresión de las cintas cruzadas en "+" central que asemejaban un paquete con lazos de regalo.
    - Transformación de la tapa plana en una **bóveda semicilíndrica arqueada** de proporciones góticas ($0.90\text{ m}$ ancho $\times 0.60\text{ m}$ profundidad $\times 0.225\text{ m}$ flecha de arco).
  - **Textura Procedural SVG de Roble de Mazmorra**:
    - Textura canvas de $256 \times 256$ píxeles generada en código con 4 tablones horizontales de roble noble envejecido (`#2e1405`, `#4a240a`, `#5c2e0e`), juntas con sombras profundas y bisel de luz, vetas orgánicas longitudinales, nudos artesanales y clavos de forja oscuros con brillo especular.
  - **Herrajes de Forja Paralelos y Piezas Fusionadas ([`BufferGeometryUtils.mergeGeometries`](file:///data/data/com.termux/files/home/develop/game/src/render/ChestRenderer.js))**:
    - 2 bandas de hierro forjado paralelas ($X = \pm 0.25\text{ m}$) que recorren la curvatura de la bóveda superior y abrazan la base de madera.
    - 4 esquineros de refuerzo en ángulo en los vértices del sillar.
    - Plinto inferior y marco de encaje perimetral para ambas piezas.
    - Gran placa de cerradura medieval frontal con cerrojo articulado colgante (*hasp*) que pivota con la tapa al abrirse.
    - Asas laterales de transporte de hierro con anillas abatibles (*drop rings*).
    - Fusión en memoria a **solo 2 draw calls por sección** (madera noble con textura SVG + herrajes de forja unificados).
  - **Tesoro Interior Esculpido**:
    - Montículo de monedas de oro brillantes y tres gemas rúnicas talladas (zafiro, rubí y esmeralda) bañadas por la luz dorada interior (`lootLight`) acoplada a la física del resorte.

- **Nuevo Sprite/Icono SVG Arqueado de Cofre para Alertas y HUD ([`Icons.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js))**:
  - Actualización del icono vectorial de cofre (`chest`) con silueta de tapa en cúpula abovedada, bandas de refuerzo dobles y cerradura central con cerradero para sustituir la antigua caja plana en todos los mensajes narrativos y banners de recompensa.

---

## [1.19.0] - 2026-09-28

### Added
- **Sintetizador Procedural de Efectos de Sonido con Web Audio API ([`SoundManager.js`](file:///data/data/com.termux/files/home/develop/game/src/audio/SoundManager.js))**:
  - Motor de audio procedural integrado con **cero dependencias y cero descargas de audio externas** (0 kB en ficheros `.mp3`/`.wav`), sintetizado 100% en tiempo real mediante Web Audio API.
  - **Apertura de Puerta de Mazmorra (`playDoorOpen`)**:
    - Transitorio metálico de liberación del cerrojo/pestillo de forja (barrido rápido de oscilador triangular $320\text{ Hz} \rightarrow 110\text{ Hz}$ y chasquido de banda alta a $2200\text{ Hz}$).
    - Fricción y crujido de roble noble con resonancia de bisagras mediante buffer estático de ruido marrón procesado por `BiquadFilterNode` con barrido dinámico ($210\text{ Hz} \rightarrow 480\text{ Hz} \rightarrow 170\text{ Hz}$, $Q=8.5$) y sub-oscilador sinusoidal a $74\text{ Hz}$ para emular la masa de las hojas de madera maciza.
    - Tope mecánico amortiguado al alcanzar el ángulo de reposo contra el marco de sillar.
  - **Apertura de Cofres del Tesoro (`playChestOpen`)**:
    - Crujido de bisagra de tapa + arpegio polifónico brillante en acordes mayores (Do5, Mi5, Sol5, Do6) con decaimiento exponencial áureo.
  - **Física de Salto e Interfaz Táctil (`playJump`, `playClick`)**:
    - Impulso aerodinámico al despegar del suelo y chasquidos de alta frecuencia para retroalimentación táctil de botones y selectores.
  - **Audio Espacial Dinámico y Paneo Estéreo Relativo**:
    - Atenuación de volumen cuadrática según distancia Euclidiana entre la fuente sonora y el jugador local, junto a paneo estéreo ($L/R$) en tiempo real.
  - **Conformidad con Políticas Móviles y Selector en Configuración**:
    - Reanudación asíncrona del `AudioContext` en el primer evento de usuario (`pointerdown`, `touchstart`, `keydown`).
    - Selector dedicado de activación/silenciado de efectos en el modal de ajustes con persistencia en `localStorage`.

- **Métricas de Renderizado en Vivo en Panel de Diagnóstico ([`NetworkStats.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkStats.js))**:
  - Visualización en tiempo real de `Draw Calls` (`renderer.info.render.calls`) y triángulos renderizados (`renderer.info.render.triangles`) en el overlay de telemetría (`?debug=1`).
  - Corrección de la variable de color `rttColor` para evitar excepciones en clientes conectados con diagnóstico activo.

### Changed
- **Fusión de Geometrías y Optimización de Draw Calls en Puertas 3D ([`DoorRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/DoorRenderer.js))**:
  - Fusión de todas las piezas metálicas (banda de refuerzo superior, banda inferior, cerradura de forja y pomos esféricos delantero y trasero) en un único `BufferGeometry` estático pre-horneado vía `BufferGeometryUtils.mergeGeometries`.
  - Reducción de 5 mallas a **solo 2 mallas por hoja** (1 para el panel de roble noble con textura procedural SVG y 1 para la forja completa).
  - Reducción drástica del número total de draw calls para las puertas del nivel: de 20 llamadas a **solo 8 draw calls** (reducción del 60%), blindando holgadamente el presupuesto móvil objetivo ($< 25$ calls).
  - Consumo Zero-GC durante la carga de niveles al reutilizar las geometrías instanciadas en `_createGeometries()`.

### Security
- **Validación Autoritativa de Proximidad en el Host ([`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**:
  - El Host valida de forma autoritativa la distancia euclidiana del jugador solicitante antes de procesar aperturas de puertas ($\le 3.5\text{ m}$) y cofres ($\le 3.2\text{ m}$).
  - Peticiones fuera de rango o paquetes maliciosos spoofed son descartados silenciosamente con trazabilidad de advertencia en logs.

---

## [1.18.0] - 2026-09-28

### Added
- **Renderizador de Puertas Medievales 3D con Doble Hoja Batiente ([`DoorRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/DoorRenderer.js))**:
  - Transformación del vano de $2 \times 2$ bloques en una puerta batiente tridimensional completa de 12 cm de grosor compuesta por dos hojas de roble macizo (`0x78350f`), bandas pasantes de hierro forjado (`0x27272a`), cerrojo central y pomo dorado (`0xd97706`).
  - Cada hoja cuenta con su propio pivote lateral en los extremos del marco ($X=11.0$ e $X=13.0$), encontrándose en el centro ($X=12.0$) para ocluir visualmente el 100% del vano cuando está cerrada.
- **Textura Procedural SVG de Tablones de Roble ([`DoorRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/DoorRenderer.js))**:
  - Generación en memoria de textura vectorial de alta definición ($256 \times 512$, relación de aspecto $1:2$ idéntica a la hoja 3D) mapeada sobre los paneles de madera.
  - Representa 4 tablones verticales de roble noble con ranuras sombreadas, biseles de luz, vetas orgánicas longitudinales, nudos artesanales y clavos de hierro forjado, integrándose con bisagras y herrajes 3D.
- **Dinámica Mecánica de Apertura con `Spring(240, 20)`**:
  - Amortiguación rápida y contundente (~0.38s de tiempo de asentamiento) con rebote elástico del $\sim 8\%$ ($1.48\text{ rad} \approx 85^\circ$ objetivo con pico en $\sim 92^\circ$) contra el sillar del muro.
  - Apertura hacia la sala de destino (`swingDir: +1`), invitando al jugador a cruzar hacia la siguiente sala (Abismo o Santuario) sin empujar la cámara hacia atrás.
- **Paso Físico Instantáneo y Sincronización Autoritativa ([`World.js`](file:///data/data/com.termux/files/home/develop/game/src/core/World.js) y [`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**:
  - Al pulsar `ACTION`, los bloques del vano pasan inmediatamente a `BLOCK_TYPES.AIR` en la simulación física autoritativa, permitiendo cruzar el umbral sin esperar al fin de la animación cosmética.
  - Omisión de los bloques planos de puerta en el `InstancedMesh` de [`VoxelMap.js`](file:///data/data/com.termux/files/home/develop/game/src/render/VoxelMap.js) para evitar solapamiento visual con las hojas 3D.
  - Sincronización transparente en uniones tardías (`INIT`): si las puertas ya estaban abiertas en el host, [`DoorRenderer.setOpenInstant()`](file:///data/data/com.termux/files/home/develop/game/src/render/DoorRenderer.js) las posiciona abiertas sin disparar animación diferida.

---

## [1.17.0] - 2026-09-28

### Changed
- **Corrección Taxonómica de Animaciones ([`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html))**:
  - Reetiquetado formal de la curva `cubic-bezier(0.16, 1, 0.3, 1)` de `.hud-alert-card` como **ease-out-expo** asintótica (puntos de control $Y \le 1.0$, sin rebasamiento ni oscilación).

### Added
- **Integrador Físico de Resortes Amortiguados ([`Spring.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Spring.js))**:
  - Implementación autónoma de resorte basado en Euler semi-implícito con 4 sub-pasos numéricos por tick y umbral de reposo estricto ($5 \times 10^{-4}$), sin dependencias externas ni overhead en background.
- **Física de Apertura con Masa y Rebote en Cofre 3D ([`ChestRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/ChestRenderer.js))**:
  - Sustitución de la curva fija sinusoidal por `Spring(200, 14)` para la bisagra de la tapa, aportando un overshoot elástico del $\sim 112\%$ y rebote físico al abrirse.
  - Normalización de la luz de botín (`lootLight.intensity`) acotada a $[0.0, 1.0]$ con respecto al ángulo objetivo, evitando parpadeos de sobre-brillo durante el rebote elástico.
- **Asimetría Táctil en Botones de Acción ([`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html))**:
  - Presión (*Press*) ultra rápida y responsiva a 80 ms con `ease-out`.
  - Liberación (*Release*) elástica a 180 ms con curva de resorte `cubic-bezier(0.34, 1.56, 0.64, 1)` y supresión de destello gris en iOS vía `-webkit-tap-highlight-color: transparent`.
- **Keyframes de Spring Real para Iconos del HUD ([`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html), [`Icons.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js), [`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js))**:
  - `@keyframes springPopIn`: Overshoot elástico único a 420 ms para cabeceras y títulos de alertas.
  - `@keyframes springBounce`: Rebote con 2-3 oscilaciones elásticas a 620 ms para items de recompensa (gemas, llaves, monedas).
  - Selectores duales `.svg-icon` y `.narrative-icon` acelerados 100% por hardware en el hilo compositor de la GPU, con limpieza automática de `will-change`.
  - Función de utilidad [`replaySpringAnimation(el, variant)`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js) para disparar o reiniciar animaciones de resorte mediante reflow forzado sin clonar nodos del DOM.
- **Selector de Mapas Compacto en Configuración ([`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js) e [`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html))**:
  - Sustitución de las tarjetas verticales voluminosas con descripciones largas por una botonera horizontal compacta (`.level-btn-group` / `.level-select-btn`).
  - Muestra el icono temático SVG de cada nivel (castillo/volcán), nombre de la mazmorra y estado activo con resplandor dorado, reduciendo drásticamente la altura del modal de ajustes en pantallas móviles.

---

## [1.16.0] - 2026-09-28

### Changed
- **Adopción Incondicional de Replay Autoritativo en Estado Lógico ([`ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js))**:
  - Corrección del desvío congelado en la zona de tolerancia ($\le 0.09\text{ m}$): `localPlayer.pos`, `localPlayer.vel` y `localPlayer.onGround` adoptan **siempre e incondicionalmente** el resultado exacto del replay de `ghostPlayer` para cualquier error $\le 2.5\text{ m}$.
  - Se erradica la preservación de líneas base no autoritativas en el cliente, asegurando que el error de predicción converja bit a bit a cero tras cada snapshot sin acumular saltos retardados por hipos de rAF.
  - La zonificación tri-banda rige de manera exclusiva la interpolación visual (`visualPos`) y la telemetría diagnóstica:
    - $\le 0.09\text{ m}$: `visualPos` sigue suave a `pos` en el render loop. 0 correcciones contadas.
    - $0.09\text{ m} \text{ a } 1.0\text{ m}$: `visualPos` se amortigua exponencialmente hacia `pos` sin sobresaltos. Registra `Soft/s`.
    - $1.0\text{ m} \text{ a } 2.5\text{ m}$: `visualPos` salta instantáneamente a `pos` para impedir que la cámara traspase esquinas o muros. Registra `Soft/s`.
    - $> 2.5\text{ m}$: Snap directo a coordenadas autoritativas del host y reseteo de `pendingInputs`. Registra `Tele/s`.

### Fixed
- **Protección de Cámara ante Reanudación de Pestaña y Lag Spikes ([`Player.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/Player.js))**:
  - Acotamiento de seguridad `safeDt = Math.min(dt, 0.05)` en `updateVisualSmoothing(dt)`.
  - Impide que deltas gigantescos generados al volver de pestañas en segundo plano o bloqueos de renderizado hagan tender $1 - 0.001^{\Delta t}$ a $1.0$, suprimiendo sacudidas bruscas en la cámara orbital.

---

## [1.15.0] - 2026-09-28

### Added
- **Separación Arquitectónica de Estado Lógico y Estado Visual ([`Player.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/Player.js) y [`CameraController.js`](file:///data/data/com.termux/files/home/develop/game/src/camera/CameraController.js))**:
  - `player.pos`: Autoridad física y lógica local, siempre coincidente con el resultado exacto del replay de reconciliación para evitar *drift* acumulativo.
  - `player.visualPos`: Estado suavizado en el render loop a 60 FPS (`local.updateVisualSmoothing(dt)`), seguido por la cámara para una experiencia completamente libre de saltos o "pops".
  - En correcciones suaves ($0.09\text{ m} \text{ a } 1.0\text{ m}$), `player.pos` adopta inmediatamente el replay exacto mientras que `visualPos` interpola suavemente por fotograma hacia la nueva posición.
- **Unificación de la Fuente de Acciones ([`SimulationEngine.js`](file:///data/data/com.termux/files/home/develop/game/src/simulation/SimulationEngine.js) y [`Player.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/Player.js))**:
  - Eliminación de la propiedad interna redundante `p.pendingActions`.
  - Las acciones viajan exclusivamente como argumento directo `actions` en `integratePlayer(player, dt, actions)`, garantizando canal único de verdad sin riesgo de saltos dobles ni flags residuales.
- **Simulación Estricta con Paso Fijo Constante ([`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**:
  - Uso explícito de `FIXED_DT = 1 / 30` en todas las integraciones de simulación (`host` y `client`), garantizando coincidencia bit a bit independientemente de la tasa de refresco del dispositivo.
- **Byte de Acciones Edge-Triggered en el Paquete de INPUT ([`Protocol.js`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js))**:
  - Ampliación del paquete `INPUT` a 16 bytes: `[type:1][seq:2][f32 dx:4][f32 dz:4][f32 yaw:4][u8 actions:1]`.
  - Definición de bitmask canónico de acciones: `ACTION_FLAGS = { JUMP: 0x01, DESTROY: 0x02, PLACE: 0x04, INTERACT: 0x08 }`.
  - Muestreo y consumo estrictamente edge-triggered (se envía únicamente en el tick exacto donde ocurre la pulsación).
  - Compatibilidad retroactiva para deserializar paquetes previos de 15 y 13 bytes (`actions = 0`).
- **Buffer de Jitter Avanzado con Retención y Profundidad Máxima ([`InputQueue.js`](file:///data/data/com.termux/files/home/develop/game/src/network/InputQueue.js))**:
  - Límite de profundidad estricto a 5 inputs (`maxQueueSize = 5`, $\sim 166\text{ ms}$ de buffer): descarta paquetes obsoletos ante ráfagas de lag para evitar cámara lenta acumulada.
  - Rate limiting por conexión limitado a 45 inputs/s para prevenir inundaciones de canal.
  - Retención de velocidad al 100% durante los primeros 3 ticks de pérdida ($\sim 100-130\text{ ms}$) para absorber micro-jitter sin frenazos visuales bruscos, seguido de decaimiento suave del 15% por tick a partir del 4º tick y parada completa a los 30 ticks ($\sim 1\text{ s}$).
  - Garantía de `actions: 0` en ticks repetidos/amortiguados para impedir saltos fantasma ante pérdidas de paquetes.
- **Guarda Monotónica de Snapshots ([`ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js))**:
  - Descarte inmediato de snapshots antiguos si llegan desordenados (`simTime <= lastProcessedSimTime`).
- **Yaw de Replay Alineado con el Presente ([`ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js))**:
  - Inicialización de `ghostPlayer.yaw` a partir del último input pendiente en vuelo (`pendingInputs[last].yaw`), previniendo giros hacia atrás en la cámara al reconciliar.
- **Indicador Visual de Entidad Congelada/Inanición ([`AvatarRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/AvatarRenderer.js))**:
  - Método `setFrozen(id, true)` que aplica transparencia reactiva ($55\%$ de opacidad) si una entidad remota permanece en inanición de red $> 500\text{ ms}$.
- **Telemetría Diagnóstica Desacoplada y Alerta Inteligente ([`NetworkStats.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkStats.js))**:
  - Separación de `Corr/s` en `Soft: X/s` y `Tele: Y/s`.
  - Esquema de color reactivo: celeste en estado nominal, ámbar en absorción de jitter suave (`Soft > 0` con `Pred Err < 0.15 m`) y rojo solo en problemas reales de congestión (`Soft > 2/s` y `Pred Err > 0.3 m`).
- **Envío de Inputs en Lockstep con el Tick de Física ([`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js))**:
  - Eliminación del temporizador desacoplado `setInterval` para inputs de cliente; ahora se envían de forma determinista y síncrona dentro de `onTick(dt)`.

---

## [1.14.0] - 2026-09-28

### Added
- **Buffer de Jitter y Sanitización de Inputs en el Host ([`InputQueue.js`](file:///data/data/com.termux/files/home/develop/game/src/network/InputQueue.js))**:
  - Cola FIFO por conexión de cliente (`InputQueue`), aislando por completo la fluctuación temporal de los temporizadores de red del bucle de física fija del host ($30\text{ Hz}$).
  - Consumo regular de exactamente 1 input por tick por cada compañero remoto conectado.
  - Sanitización estricta de vector de movimiento: supresión de *speedhacks* mediante *clamping* euclidiano ($\sqrt{dx^2 + dz^2} \le 1.0$).
  - Normalización canónica de ángulo Yaw al intervalo $[-\pi, \pi]$.
  - Amortiguación suave y decaimiento exponencial ante pérdidas de paquetes por jitter extremo (reducción al $85\%$ hasta anularse a $0\text{ m/s}$), eliminando carreras fantasmas contra muros.
- **Sincronización Autoritativa de Física Vertical en Snapshots ([`Protocol.js`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js))**:
  - Ampliación del bloque de jugador en `SNAPSHOT` a 24 bytes ($+5\text{ bytes}$ por entidad: `velY: Float32` y `onGround: Uint8`).
  - Sincronización fidedigna de saltos, plataformas de impulso e inicio de caídas al abismo, eliminando correcciones suaves en cadena durante saltos o caídas.
  - Decodificación retrocompatible tolerante a formatos previos de 19 y 17 bytes.
- **Extrapolación Lineal de Seguridad ante Inanición de Snapshots ([`ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js))**:
  - Proyección cinemática de entidades remotas de hasta $150\text{ ms}$ basada en la velocidad del último intervalo cuando `renderTime` supera el snapshot más reciente por jitter en Wi-Fi móvil.
- **Replay Determinista con Paso Fijo ([`ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js))**:
  - Replay de predicción forzando $\Delta t = 1 / 30\text{ s}$ constante en los inputs pendientes, asegurando coincidencia bit a bit con el simulador del host.

### Changed
- **Calibración del Umbral de Tolerancia de Reconciliación ([`ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js))**:
  - Elevación de `snapThreshold` de $0.04\text{ m}$ a $0.09\text{ m}$ ($\sim\text{medio tick}$ de carrera a $4.8\text{ m/s}$), absorbiendo fluctuaciones normales de paquetes sin disparar micro-ajustes visuales.
- **Telemetría Diagnóstica Refinada ([`NetworkStats.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkStats.js))**:
  - Precisión milimétrica (3 decimales) en `Pred Err (m)` y alerta visual sincronizada con el nuevo umbral de $0.09\text{ m}$.

---

## [1.13.0] - 2026-09-28

### Added
- **Reconciliación Cliente-Servidor Real y Buffer de Snapshots ([`ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js))**:
  - Implementación del sistema de predicción local con buffer de inputs pendientes (`pendingInputs`).
  - Reconciliación determinista al recibir snapshots del host: descarte de inputs confirmados (`seq <= lastInputSeq`), repetición (*replay*) contra la simulación física ([`SimulationEngine.js`](file:///data/data/com.termux/files/home/develop/game/src/simulation/SimulationEngine.js)), y corrección suave si la discrepancia excede el umbral de tolerancia ($0.04\text{ m}$).
  - Manejo de reaparición forzada y teletransporte instantáneo si la diferencia supera los $2.5\text{ m}$.
  - **Interpolación Temporal de Entidades Remotas**: Buffer circular de snapshots con interpolación temporal lineal a $100\text{ ms}$ en el pasado (`renderTime = now - 100ms`), eliminando el jitter de red y garantizando movimiento suave a 60 FPS de compañeros de equipo.
- **Confirmación Explícita de Secuencia de Input en Snapshots ([`Protocol.js`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js))**:
  - Ampliación de 2 bytes por entidad en el paquete `SNAPSHOT` (`lastInputSeq`), permitiendo al cliente conocer con precisión qué paquete de movimiento fue el último integrado por la física autoritativa del host.
  - Compatibilidad retroactiva transparente para decodificar tanto paquetes de 19 bytes como de 17 bytes.
- **Telemetría de Reconciliación en Tiempo Real ([`NetworkStats.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkStats.js))**:
  - Integración en el panel `#net-debug-panel` (`?debug=1`) de tres métricas diagnósticas esenciales:
    - `Pred Err (m)`: Desfase métrico instantáneo entre predicción local y estado autoritativo.
    - `In Flight`: Cantidad de paquetes de input pendientes de confirmación en la red.
    - `Corr/s`: Tasa de correcciones físicas por segundo.

### Fixed
- **Resiliencia de Cierre de Sala en iOS Safari y Navegadores Móviles ([`NetworkManager.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkManager.js))**:
  - Emisión de `HOST_CLOSING` extendida a `beforeunload`, `pagehide` y `visibilitychange` con temporizador de seguridad de 2.5s para evitar que cambios rápidos de app expulsen prematuramente a los clientes.
- **Reseteo Limpio de Velocidad y Estado en [`switchLevel`](file:///data/data/com.termux/files/home/develop/game/src/main.js)**:
  - Anulación forzada de inercia (`vel = {0,0,0}`) y vaciado de los buffers de reconciliación al cambiar de nivel, previniendo caídas dentro de la geometría y repeticiones cruzadas de inputs.

---

## [1.12.0] - 2026-09-28

### Added
- **Cofre Cúbico 1x1x1 con Bisagra 3D ([`ChestRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/ChestRenderer.js))**:
  - Remodelado geométrico completo del cofre para ocupar exactamente el volumen unitario de un bloque vóxel ($1.0 \times 1.0 \times 1.0\text{ m}$):
    - Base de roble noble de $0.96\text{ m} \times 0.62\text{ m} \times 0.96\text{ m}$ con refuerzos perimetrales dorados, cantoneras esquineras y rodapié de hierro forjado oscuro.
    - Tapa cúbica de $0.96\text{ m} \times 0.34\text{ m} \times 0.96\text{ m}$ pivotada en el borde superior trasero (`z = -0.48, y = 0.62`) con cerradura frontal de hierro forjado.
    - Rotación cinemática suave de apertura de bisagra de hasta $83^\circ$ (`1.45 rad`).
    - Cámara interior espaciosa con tesoros ampliados: pila de lingotes de oro, gema rúnica celeste y rubí ancestral carmesí (`#ef4444`).
    - Punto de luz dorada interior (`THREE.PointLight`) que se ilumina gradualmente hasta intensidad 3.0 al abrir la tapa.
  - Centrado de coordenadas en [`dungeon_classic.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/dungeon_classic.json) y [`crypt_inferno.json`](file:///data/data/com.termux/files/home/develop/game/src/levels/data/crypt_inferno.json) para encajar con precisión en las celdas $(4, 1, 5)$ y $(19, 1, 29)$.

- **Pila y Feed de Alertas en Lista para Móviles ([`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js) e [`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html))**:
  - Transformación del sistema de alertas HUD desde una píldora monolínea comprimida hacia una **pila vertical de tarjetas estructuradas en lista**.
  - **Parser Reactivo de Mensajes**: Separa automáticamente títulos, oraciones y elementos de recompensa (llaves, gemas, monedas, reliquias) en viñetas ordenadas con iconos SVG vectoriales.
  - **Experiencia Móvil Optimizada**: Ancho adaptativo `calc(100vw - 110px)` (máx. 350px) centrado en pantalla, previniendo colisiones con el botón de ajustes (⚙️) o la telemetría de red.
  - Animaciones fluidas de entrada (`alertSlideDown`) y salida (`alertFadeOut`), con límite dinámico de 3 alertas activas simultáneas sin desbordar el viewport táctil.

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
