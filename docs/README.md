# Documentación Técnica: Runa y Piedra (Mazmorra Vóxel 3D Multijugador P2P)

Este directorio contiene el compendio integral de hallazgos técnicos, diseño de arquitectura, presupuestos de rendimiento y protocolos de comunicación de Runa y Piedra para navegadores móviles y de escritorio a 60 FPS estables.

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
     3. Físicas: AABB propio (Zero-GC, sin dependencias WASM)
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
   - Gestión de desconexión del Host (fail-safe defensivo, paquete `HOST_CLOSING` y detección de corte de canal seguro).
   - Hoja de ruta para Migración Automática de Host (*Host Migration* P2P con elección de líder y snapshot distribuido).
   - Flujo de onboarding móvil optimizado con código QR dinámico, PIN numérico y Web Share API.

7. [**07. Arquitectura Atómica y Modular del Código**](./07-arquitectura-atomica-modular.md)
   - Desglose de responsabilidades únicas (SRP) por módulo y carpeta.
   - Eliminación del antipatrón God-file y desacoplamiento de simulación, input, render, controladores y UI.

8. [**08. Sistema de Mazmorras, Niveles y Progresión Cooperativa**](./08-sistema-mazmorras-niveles-y-progresion.md)
   - Catálogo de mazmorras en 10 capítulos (3 niveles cada uno) más el Campamento/Lobby de tutorial.
   - `LevelLoader` y `LevelRegistry` para conmutación de mapas y progresión.
   - Escalinatas de descenso cooperativo, llaves y puertas con cerradura, plataformas de salto rúnico (*Jump Pads*) y fosa de lava.
   - Puntos de control automáticos (Checkpoints por sala), ciclo de 3 vidas y cofres interactivos con animación 3D ($77^\circ$).

9. [**09. Biblioteca de Héroes, Clases Únicas y Modificadores Físicos**](./09-biblioteca-heroes-clases-y-fisica.md)
   - Base de datos declarativa en JSON (`heroes.json`) y gestor `HeroRegistry`.
   - Las 5 clases oficiales: Aventurero, Paladín, Explorador, Hechicero y Guardián.
   - Modificadores físicos de velocidad y salto en tiempo real (`speedMultiplier`, `jumpMultiplier`).
   - Tarjetas dinámicas de características en el menú y avatares 3D con distintivos y nameplates flotantes.

10. [**10. Sistema de Iconografía SVG Vectorial y Experiencia de Usuario (UI/UX)**](./10-sistema-iconografia-svg-y-ui-ux.md)
    - Repositorio global de iconos vectoriales SVG (`Icons.js`) y reemplazo del 100% de emojis.
    - Utilidad reactiva `replaceEmojisWithSvg` para textos y mensajes narrativos del HUD.
    - Integración completa de la Sala de Expedición en el modal de ⚙️ Configuración (sin segundo modal).
    - Maquetación elástica anti-desbordamiento del botón "Unirse" en resoluciones móviles estrechas.
    - Visibilidad contextual inteligente de botones de acción táctiles.

11. [**11. Protocolo Híbrido v2, Telemetría de Red y Resiliencia WebRTC**](./11-protocolo-hibrido-v2-telemetria-y-resiliencia.md)
    - Protocolo híbrido DataView Zero-GC para hot paths (16 bytes INPUT con acciones, 8+N*25 bytes SNAPSHOT con vidas y ack).
    - `PROTOCOL_VERSION = 2` y handshake de verificación estricta contra versiones obsoletas.
    - Opcodes para eventos de juego (`KEY`, `PEDESTAL`, `DESCENT`, `STAIRS`).
    - Medición en caliente de RTT (Ping/Pong a 1 Hz) con media móvil de jitter.
    - Cierre ordenado de sala (`HOST_CLOSING`) en `beforeunload` y sincronización de `LEVEL_CHANGE`.
    - Monitor HUD de telemetría en tiempo real (`NetworkStats.js`) con toggle `?debug=1`.

12. [**12. Reconciliación Cliente-Servidor Real e Interpolación Temporal de Snapshots**](./12-reconciliacion-cliente-servidor-e-interpolacion.md)
    - Netcode determinista con predicción local en cliente a 60 FPS y buffer de inputs pendientes.
    - Reconciliación autoritativa por ack explícito (`lastInputSeq` en SNAPSHOT a 19 bytes/entidad).
    - Repetición (*replay*) física Zero-GC con umbrales de tolerancia ($0.04\text{ m}$) y teletransporte ($2.5\text{ m}$).
    - Interpolación temporal de entidades remotas a $100\text{ ms}$ en el pasado para absorber jitter de Wi-Fi.
    - Nuevas métricas en el HUD: `Pred Err (m)`, `In Flight` y `Corrections/s`.

13. [**13. Canales Duales WebRTC y Endurecimiento de Conexión P0**](./13-canales-duales-webrtc-endurecimiento-p0.md)
    - Arquitectura de canales duales sobre `RTCDataChannel`: canal seguro (`game-safe`, `reliable: true`) para eventos críticos frente a canal caliente (`game-hot`, `reliable: false`) para inputs (30 Hz) y snapshots (20 Hz).
    - Erradicación del *Head-of-Line Blocking* (HoL) en redes inalámbricas y datos móviles.
    - Normalización de conexiones lógicas en el Host y fallback transparente en clientes.
    - Endurecimiento P0: STUN/TURN configurable, reintentos de PIN en colisiones, timeout de 12 s con reintentos automáticos y traducción de errores al español.

14. [**14. Subsistemas de Audio Procedural, Vidas, Resortes y Suite de Tests**](./14-subsistemas-audio-procedural-vidas-y-resortes.md)
    - Motor de audio procedural sintetizado con Web Audio API (`SoundManager.js`) con cero descarga de ficheros pesados.
    - Ciclo de 3 vidas, peligros ambientales letales (lava y abismo), invulnerabilidad temporal (2.5 s) y Game Over cooperativo.
    - Oscilador armónico amortiguado (`Spring.js`) para animaciones elásticas reactivas de UI.
    - Suite de 359 pruebas automatizadas nativas con `node:test` sin dependencias externas pesadas.

15. [**15. Flujo de Trabajo Git y Creación de Nuevos Niveles de Mazmorra**](./15-flujo-de-trabajo-git-y-creacion-de-niveles.md)
    - Metodología de ramificación GitFlow (`main`, `develop`, `feature/*`, `hotfix/*`).
    - Protocolo de validación obligatoria con `npm test` y compilación `npm run build`.
    - Convención de commits semánticos y publicación de versiones (*releases*).

16. [**Smoke Test y Protocolo de Verificación Multijugador**](./smoke-test.md)
    - Protocolo de 7 pasos para validación end-to-end de partidas cooperativas.
    - Metodología de pruebas de latencia y fluctuación con emulación de red (Slow 4G).
    - Lista de control (*Release Checklist*) obligatoria previa a fusión en `main`.

17. [**17. Arquitectura de Capítulos y Escalado de Mazmorras (10 Capítulos × 3 Niveles)**](./17-arquitectura-de-capitulos-y-escalado-de-mazmorras.md)
    - Viabilidad técnica, matriz de complejidad y presupuesto de memoria/red para 30 mazmorras.
    - Modelo jerárquico `ChapterRegistry`, ciclo de 3 mazmorras por capítulo y clímax ceremonial.
    - Taxonomía de los 10 biomas temáticos y peligros ambientales exclusivos (hielo, ácido, pistones, teletransporte).
    - Hub de selección en el Lobby, persistencia en `localStorage` y estrategia de generación modular.

18. [**18. Sistema de Inventario, HUD Expandido y Herramientas de Desarrollo**](./18-inventario-hud-y-herramientas-desarrollo.md)
    - HUD superior elástico: botón de inventario (`#hud-inventory`) con badge reactivo y HUD de estado (`#hud-lives`).
    - Representación de vidas: corazones llenos frente a contorno de corazones perdidos (`heartOutline` SVG).
    - Insignia persistente de llaves y contador en vivo de gemas integrados en el HUD de vidas.
    - Consumo autoritativo de llaves al abrir puertas selladas (`Player.removeKey`, `removeInventoryKey`).
    - Modal interactivo de botín con desglose de tesoros y herramientas de desarrollo exclusivas (`#modal-dev`).
    - Diálogo temático de confirmación para salir al menú, scrollbars dark fantasy y orientación inicial a 180°.

19. [**19. Capacidad de Jugadores Simultáneos, Límite de 5 Jugadores y Unicidad de Razas/Clases**](./19-limite-jugadores-y-clases-unicas.md)
    - Justificación técnica del aforo máximo: presupuestos de ancho de banda WebRTC Listen-Server (~10 KB/s @ 20 Hz para 5 jugadores) y arquitectura espacial de pasillos de 2 metros.
    - Unicidad absoluta de razas/clases: catálogo de los 5 arquetipos oficiales (Aventurero, Paladín, Explorador, Hechicero y Guardián) con prohibición estricta de duplicados.
    - Árbitro autoritativo en el Host: `PlayerManager.getAvailableColorIndex` para reasignación determinista de clases en caso de colisión.
    - Protocolo de sala llena: rechazo de conexiones entrantes con `HOST_CLOSING` código 1 (`ROOM_FULL`) y retorno limpio al menú en el cliente rechazado.
    - Experiencia de usuario (UI): selector de clase en Configuración con estado `.occupied`, bloqueo visual con cruz roja y pill de aforo reactivo (`5/5 Llena`).

20. [**20. Bloques de Respawn y Losas de Aparición Rúnica**](./20-bloques-respawn-y-aparicion-runica.md)
    - Definición del bloque especializado `BLOCK_TYPES.RESPAWN_PAD = 11` y su arte vectorial en el **Tile 11** del Texture Atlas.
    - Diseño visual del glifo rúnico azul cian (`#38bdf8`), estrella sagrada de 4 puntas y remaches de forja celestial.
    - Colocación automática en plataformas 2x2 bajo el spawn principal y puntos de control intermedios (`LevelLoader._placeRespawnPads`).
    - Mecánica de Santuario de Reaparición Segura con protección e invulnerabilidad temporal (2 s).
    - Síntesis de audio procedural `playRespawn()` mediante arpegio armónico de campanillas celestiales en Web Audio API.

21. [**21. Sistema de Sprites de Lava y Renderizado Ígneo Procedural (Paleta de 5 Variantes)**](./21-sprite-lava-y-renderizado-igneo.md)
    - Expansión a paleta completa de **5 sprites procedurales ígneos** (Tiles 13, 16, 17, 18, 19) en el Texture Atlas 4x8 (512x1024 px) para el bloque de peligro `BLOCK_TYPES.LAVA = 7`.
    - Arquitectura de renderizado multicapa en SVG: magma activo con afluentes en Y, fisuras tectónicas con bordes al rojo vivo, géiseres hirvientes con domos de gas en ebullición, río piroclástico diagonal y caldera hiper-térmica solar.
    - Distribución determinista espacial en `VoxelMap` mediante `hashCoord(x, y, z) % 5` (~20% por variante) y preservación de aspect ratio 1:1 en caras de cubos mediante shader UV `vec2(0.25, 0.125)`.
    - Continuidad y mosaico sin costuras (*seamless tiling*) en los bordes del bloque de 128x128 píxeles.

22. [**22. Showroom de Desarrollo y Galería Completa de Bloques**](./22-showroom-desarrollo-y-galeria-bloques.md)
    - Entorno sandbox completo (`dev_showroom`) con dimensiones de 24x16x36 m², aislado de la rotación de la campaña regular (`isDevOnly`, `hiddenFromCampaign`).
    - Sala 1 (Galería de Sprites): Podios elevados para cada bloque del Texture Atlas (`FLOOR_STONE`, `FLOOR_WORN`, `FLOOR_MOSS`, `WALL`, `PILLAR`, `RESPAWN_PAD`, `JUMP_PAD`, `LAVA`, `PEDESTAL`).
    - Sala 2 (Laboratorio de Físicas y Mecánicas): Circuito escalonado de Jump Pads, fosa de lava activa con viscosidad y sumersión, y 3 cofres (Llave Maestra, 250 gemas y poción de vida +1 ❤️).
    - Divisores con puertas libre y sellada por llave, altar ancestral con orbe flotante y escalinata de descenso ceremonial.
    - Acceso exclusivo desde el modal de Herramientas Dev (`#btn-dev-enter-showroom` y `#btn-dev-exit-showroom`) con soporte de sesión local directa (`startDevShowroomSession`).

23. [**23. Catálogo Técnico de Sprites y Modelos 3D**](./23-catalogo-sprites-y-modelos-3d.md)
    - Especificación exhaustiva de los **28 sprites procedurales SVG activos** del Texture Atlas en matriz 4x8 (5 de muros, 5 de suelos, 5 de pilares y columnas, losa de respawn, 5 de lava volcánica, jump pad, pedestal y 5 de techos/bóvedas).
    - Desglose detallado de los 11 modelos 3D del motor: 5 arquetipos de héroes con kits distintivos, cofre de botín animado a 85°, puertas batientes de doble hoja, altar con orbe flotante en levitación armónica, escalinata ceremonial con losa corrediza y malla instanciada del mundo vóxel.
    - Modularización atómica de componentes gráficos en `src/render/textures/` (sprites SVG por familia, incluyendo `ceilings.js`) y `src/render/models/` (constructores paramétricos de héroes y props).
    - Matriz cuantitativa de geometrías, algoritmos deterministas de selección de tiles y presupuestos de Draw Calls (20-35 DC).

24. [**24. Persistencia Avanzada con IndexedDB y Cómputo Intensivo con Rust / WebAssembly**](./24-almacenamiento-indexeddb-y-computo-rust-wasm.md)
    - Evaluación técnica y operativa de IndexedDB frente a `localStorage` para almacenamiento asíncrono y masivo de bloques binarios.
    - Arquitectura de integración de Rust compilado a WebAssembly (Wasm) para cómputo intensivo respetando el presupuesto de bundle (< 500 KB) y los 60 FPS estables.

25. [**25. Hojas de Personaje Oficiales: Las 5 Clases de Héroes de Runa y Piedra**](./25-hojas-de-personaje-heroes.md)
    - Guía canónica de hojas de personaje para los 5 héroes: Aventurero, Paladín, Explorador, Hechicero y Guardián.
    - Especificación de trasfondo narrativo, parámetros numéricos de físicas (velocidad, salto, defensa), modelos vóxel y roles tácticos cooperativos.

26. [**26. Arquitectura de Altares por Capítulo y Separación Mecánica de Escalinatas**](./26-altares-por-capitulo-y-escalinatas.md)
    - Desacoplamiento conceptual y jugable neto entre la losa de escalinata (avance entre mazmorras) y los altares (clímax de capítulo y utilidades de campamento).
    - Funcionamiento autoritativo de `stairs` con fosa dinámica a $y=-8$ y cuenta atrás de descenso.
    - Catálogo de los altares únicos por capítulo: Altar Sagrado Ancestral (Capítulo 1), Altar Crepuscular con halo orbital (Capítulo 2), Pedestal del Mercader con Balanza 3D (*Scales*) y Mesa de Cartografía con Brújula náutica 3D y aguja magnética.
    - Hoja de ruta para los Capítulos 3 al 10 e invariantes técnicas de centrado y cinemática orbital.

27. [**27. Catálogo Canónico de Objetos, Reliquias y Consumibles**](./27-catalogo-de-objetos-reliquias-y-consumibles.md)
    - Consolidación del consumible de retorno al Lobby en un único objeto canónico: `pergamino_retorno`.
    - Panteón cerrado e invariable de exactamente diez (10) Reliquias Míticas (6 activas y 4 selladas) con regla de no generación de reliquias adicionales tras su activación.
    - Especificación teórica de diseño de las funcionalidades mecánicas proyectadas para las diez reliquias (en estado documental sin saturar mazmorras hasta culminar los 10 capítulos).
    - Precios de compra y venta en el Bazar Rúnico y función de calibración dinámica `setShopItemPrice`.

28. [**28. Capítulo 3: Cataratas Subterráneas y Mecánica de Torrentes Fluviales**](./28-capitulo-3-cataratas-y-mecanica-torrente.md)
    - Activación del Capítulo 3 (`subterranean_falls`) y catálogo de sus 3 mazmorras: `falls_aqueduct` (intro), `falls_torrent` (desafío) y `falls_reservoir` (clímax).
    - Mecánica de Torrentes y Corrientes Acuáticas Direccionales (`WATER`, `WATER_STREAM_NORTH`, `WATER_STREAM_SOUTH`, `WATER_STREAM_EAST`, `WATER_STREAM_WEST`).
    - Modelo físico en `SimulationEngine`: empuje vectorial horizontal continuo, flotabilidad, amortiguación de caída libre terminal (-3.5 m/s) y salto acuático a 30 Hz determinista Zero-GC.
    - Cuatro nuevos sprites procedurales vectoriales en el Texture Atlas 4x8 (Tiles 28 a 31: agua cristalina, torrente Z, torrente X y cascada).
    - Síntesis de audio procedural `playWaterSplash()` en `SoundManager` e iluminación/materiales de caliza y zafiro para altares y escalinatas.

29. [**29. Sistema de Diseño Visual UI: Sumi-e Pixel Art & Pergamino Washi**](./29-diseno-visual-sumi-e-pixel-art.md)
    - Transformación completa de la interfaz desde el estilo dashboard SaaS hacia la estética Sumi-e Pixel Art (losas de basalto, pergamino Washi antiguo, tinta negra china y sellos imperiales Hanko).
    - Supresión de radios redondeados suaves (`border-radius: 0 !important`) y adopción de bordes y sombras de tinta duros sin difuminado.
    - Tipografía retro legible: `Silkscreen` para títulos y sellos, y `Pixelify Sans` para descripciones e inputs.
    - Rediseño de componentes y modales: Menú principal, selector de héroes como sellos octogonales, ranuras de guardado en tablillas de piedra, HUD de vidas, inventario/botín, Atlas de 10 capítulos y Bazar Rúnico del Mercader.
    - Unificación de la notificación superior y el botón de descenso por escalinata en una sola placa interactiva con temporizador integrado.
    - Retratos canónicos Sumi-e Pixel Art (32x32) con renderizado `crispEdges` en UI 2D y texturizado facial/torso sobre mallas 3D para los 5 héroes.

30. [**30. Plan de Saneamiento Técnico por Fases**](./30-plan-saneamiento-tecnico.md)
    - Plan de ejecución para eliminar la deuda de mantenibilidad detectada en la auditoría v1.40.0.
    - 8 fases (0–7): infraestructura local, coherencia documental, type checking real, higiene de logs,
      descomposición de god-objects, CSS con capas `@layer`, extracción de arte y guardarraíles de CI.
    - Métricas objetivo medibles (tests, `!important`, tamaño máximo de archivo, bundle) y reglas de ejecución.

31. [**31. Sala de Combate de Desarrollo (CombatRoom) y Mecánica de Combate Híbrido PvE**](./31-sala-de-combate-dev-y-mecanica-hibrida-pve.md)
    - Sandbox aislado (`dev_combatroom`) accesible exclusivamente desde `#modal-dev` (`#btn-dev-enter-combatroom`).
    - Combate PvE híbrido con botón independiente `ATACAR` (`#btn-attack` en HUD táctil Sumi-e y tecla `F`/Click Izquierdo).
    - Armas canónicas especializadas por clase: Espada de Explorador, Mandoble Sagrado, Arco Rúnico, Báculo Arcano y Mazo Sísmico.
    - Simulación autoritativa en Host (Listen-Server WebRTC), muñecos de prueba estáticos, autómatas centinela y presupuesto Zero-GC a 60 FPS.

32. [**32. Lore Unificado y Bestiario PvE: 10 Enemigos, 5 Dificultades, Escalado y Balanceo**](./32-lore-y-bestiario-10-enemigos-pve.md)
    - Lore de la "Piedra Hendida": despertar hostil de los antiguos centinelas minerales y purificación rúnica.
    - Bestiario canónico de 10 enemigos distribuidos en 5 grados (Autómatas Rústicos, Hostigadores, Defensores Tácticos, Élite del Subsuelo y Titanes Jefes).
    - Reglas de escalado dinámico de enemigos según aforo de la party (1 a 5 jugadores) y presupuesto Zero-GC.
    - Palancas de calibración numéricas (`telegraphMs`, `cooldownMs`, `knockbackFactor`, `aggroRange`) y directrices de balanceo.

33. [**33. Armería Ancestral Canónica: Lore, Modelado 3D, Posturas de Guardia y Viewmodel 1ª Persona**](./33-armeria-canonica-lore-y-modelado-de-armas.md)
    - Mito de las Cinco Armas Forjadas por los Primeros Constructores (Espada, Mandoble, Arco, Báculo y Mazo).
    - Especificación geométrica 3D modular en `heroWeapons.js` con presupuesto móvil Zero-GC (`userData.isShared`).
    - Cinemática y corrección anatómica de empuñadura en mano derecha (`armLPivot`) en 3ª persona y orientación frontal ($+Z$).
    - Viewmodel ergonómico continuo en primera persona (`FirstPersonWeaponRenderer.js`) con calibración por clase (`FP_CONFIGS`).
    - Matriz de sinergia táctica de combate PvE entre armas de héroe y debilidades del bestiario.




