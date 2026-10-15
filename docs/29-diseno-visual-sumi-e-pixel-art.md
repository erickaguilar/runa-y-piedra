# 29. Sistema de Diseño Visual UI: Sumi-e Pixel Art & Pergamino Washi

## 1. Visión General y Filosofía de Diseño

Este documento establece la especificación técnica y estética del **Sistema de Diseño Visual Sumi-e Pixel Art** de *Runa y Piedra*. 

El objetivo primordial de esta transformación ha sido erradicar por completo la estética previa de "dashboard SaaS moderno" (caracterizada por paneles redondeados `border-radius: 16px`, fondos azul marino traslúcidos con desenfoque `backdrop-filter: blur`, brillos de neón difusos y tipografías sans-serif de sistema) para sumergir al jugador en una experiencia visual coherente con la fantasía oscura medieval y el arte vóxel: **una interfaz inspirada en losas de piedra basalto talladas a mano, pergaminos antiguos de papel Washi enmarcados en tinta china negra (*Sumi*), herrajes de hierro pixelados y sellos imperiales bermellón (*Hanko*)**.

```
+------------------------------------------------------------------------+
|                      LOSA DE ALTAR BASALTO (#181615)                  |
|  +------------------------------------------------------------------+  |
|  |  MARCO DE TINTA NEGRA 4px (#0c0a09) + BISEL INTERIOR 2px (#44403c) |  |
|  |                                                                  |  |
|  |  [Sello Hanko]  RUNA Y PIEDRA (Silkscreen)                       |  |
|  |                                                                  |  |
|  |  +----------------------+      +------------------------------+  |  |
|  |  | TABLILLA DE PIEDRA   |      | SELLO HANKO BERMELLÓN (#991b)|  |  |
|  |  | Muesca Octogonal     |      | Bisel duro 2px (#ef4444)     |  |  |
|  |  | Texto Papel Washi    |      | Botón "Crear Mazmorra"       |  |  |
|  |  +----------------------+      +------------------------------+  |  |
|  |                                                                  |  |
|  |  SOMBRA PROYECTADA DURA: 6px 6px 0px #0c0a09 (Cero difuminado)   |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

---

## 2. Los 5 Principios Visuales Fundamentales

### 2.1. Adiós al Border-Radius Suave (Esquinas Pixeladas y Muescas Duras)
En Pixel Art, las curvas vectoriales continuas y los radios suaves rompen de inmediato la inmersión retro. 
- **Regla estricta:** `border-radius: 0 !important;` en todos los contenedores, botones, tarjetas, inputs e insignias.
- **Relieve y volumen:** Simulado mediante bordes de tinta pura de 2 a 4 píxeles (`var(--ink-black)`), dobles biseles interiores de 1 o 2 píxeles (`inset 0 0 0 1px var(--stone-light)`), y sombras sólidas proyectadas sin desenfoque (`box-shadow: 4px 4px 0px var(--ink-black)`).
- **Sellos Octogonales:** Para iconos de clase, botones táctiles y marcos de ítems, se emplea un recorte geométrico de esquinas a 45° mediante `clip-path`:
  ```css
  clip-path: polygon(
    4px 0%, calc(100% - 4px) 0%, 100% 4px,
    100% calc(100% - 4px), calc(100% - 4px) 100%,
    4px 100%, 0% calc(100% - 4px), 0% 4px
  );
  ```

### 2.2. Paleta Canónica: Tinta, Basalto, Washi y Cinabrio
Se sustituyó la gama monocromática azulada/Tailwind (`slate-900`, `blue-500`, `emerald-500`) por la paleta de tintes y minerales tradicionales:

| Variable CSS | Valor Hex | Denominación | Aplicación Principal |
| :--- | :--- | :--- | :--- |
| `--ink-black` | `#0c0a09` | **Tinta China Pura (*Sumi*)** | Bordes duros, sombras proyectadas y fondos de input |
| `--stone-dark` | `#181615` | **Piedra Basalto Profundo** | Fondo principal de modales, losas y tarjetas base |
| `--stone-mid` | `#292524` | **Piedra Ceniza / Carbón** | Tarjetas de contenido, paneles interiores e ítems |
| `--stone-light`| `#44403c` | **Luz Pétrea / Cantería** | Bisel interior rúnico de 1px a 2px para dar relieve 3D |
| `--washi-paper`| `#d6cfc2` | **Papel Washi Antiguo** | Tipografía principal, títulos y glifos rúnicos claros |
| `--washi-muted`| `#a8a29e` | **Tinta Diluida / Ceniza** | Subtítulos, descripciones secundarias y notas de apoyo |
| `--hanko-red`  | `#991b1b` | **Cinabrio Imperial (*Hanko*)**| Botón principal "Crear Mazmorra", botón "Beber", sellos activos |
| `--hanko-bright`| `#dc2626`| **Lacre Encendido** | Bisel de luz superior en sellos y botones rojos |
| `--rune-cyan`  | `#38bdf8` | **Cian Espiritual (*Respawn*)**| Botón "Unirse", enlaces WebRTC, portal de retorno y gemas |
| `--rune-gold`  | `#f59e0b` | **Oro Arcano / Resina** | Enfoque de inputs, altares, estrellas de récord y coronas |

### 2.3. Tipografía Pixel Art y Jerarquía de Legibilidad
Se implementó una arquitectura tipográfica de dos familias desde Google Fonts para equilibrar carácter retro y legibilidad funcional:
1. **`Silkscreen` (Monospace, Display)**:
   - Utilizada para títulos principales (`RUNA Y PIEDRA`, encabezados de modales), etiquetas de categoría y botones de acción principal en mayúsculas.
   - Text shadow de tinta dura: `text-shadow: 2px 2px 0px var(--ink-black);`.
2. **`Pixelify Sans` (Monospace / Variable 400..700)**:
   - Diseñada especialmente para párrafos descriptivos, inputs de texto (nombres, PIN), lore de mazmorra, estadísticas de héroe y precios de mercado.
   - Garantiza lectura limpia sin deformaciones en pantallas móviles de alta densidad (DPR 2.0–3.0).

### 2.4. Microinteracciones Escalonadas (*Stepped Physics*)
En lugar de transiciones analógicas continuas (`ease`, `cubic-bezier` de 300 ms), los elementos táctiles responden con **física de paso discreto**:
```css
transition: transform 0.05s steps(2), background 0.1s !important;

/* Pulsación de botón o sello */
:active {
  transform: translate(2px, 2px) !important;
  box-shadow: 2px 2px 0px var(--ink-black) !important;
}
```
Esto reproduce la sensación física de presionar un sello de madera o tallar una losa de piedra.

### 2.5. Iconografía Vectorial SVG Pixel-Crisp y Sello Hanko
Se incorporó el icono canónico `hanko` en `src/ui/Icons.js`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="24" height="24" shape-rendering="crispEdges">
  <rect width="12" height="12" fill="#0c0a09"/>
  <rect x="1" y="1" width="10" height="10" fill="#991b1b"/>
  <path d="M2,2 h8 v1 h-8 z M2,4 h3 v1 h-3 z M7,4 h3 v1 h-3 z M5,3 h2 v6 h-2 z M2,7 h3 v2 h-3 z M7,7 h3 v1 h-3 z M2,9 h8 v1 h-8 z" fill="#d6cfc2"/>
</svg>
```
Presente como sello imperial en el Menú Principal, Diálogos de Confirmación, Cabeceras de Inventario, Atlas de Mazmorras y Bazar.

---

## 3. Catálogo de Componentes Transformados

### 3.1. Menú Principal y Selector de Héroes (`src/ui/MenuManager.js`, `src/ui/HeroManager.js`)
- **Losa de Entrada (`.menu-card`)**: Contenedor pétreo con ancho seguro (`min(94vw, 380px)`), marco de tinta de 4px y sombra de tinta sólida.
- **Selector de Clases (`.class-selector-btn`)**: Sellos octogonales recortados a 4 píxeles. Cada héroe conserva el color único de su clase (`#38bdf8`, `#10b981`, `#f59e0b`, `#a855f7`, `#ef4444`). La clase activa destaca con doble marco rúnico y pequeña elevación escalonada.
- **Ficha de Atributos (`.class-info-box`)**: Barra lateral cian espiritual (`border-left: 6px solid var(--rune-cyan)`) y píldoras rectangulares duras (`.stat-pill`) para estadísticas de salto, velocidad y defensa.
- **Acciones Principales**: Botón "Crear Mazmorra" como Sello Hanko bermellón y botón "Unirse" como Piedra Rúnica cian.

### 3.2. Ranuras de Guardado y Diálogo de Borrado (`src/ui/modals/ConfirmModal.js`)
- **Ranuras (`.save-slot`)**: Tablillas de piedra talladas con muescas; la ranura activa exhibe borde de oro arcano y un sello bermellón cuadrado `ACTIVA`.
- **Botón de Borrar Partida (`.menu-delete-slot-btn`)**: Placa de advertencia en piedra rojiza oscura con borde de hierro y texto rojo claro.
- **Modal de Confirmación de Borrado (`.confirm-modal`)**: Losa de advertencia crítica con sello imperial Hanko superior, icono central enmarcado en tinta y botones táctiles rectangulares "Cancelar" (Piedra) y "Borrar Partida" (Sello de Advertencia Carmesí).

### 3.3. HUD en Partida y Controles Táctiles (`src/styles/hud.css`, `src/styles/sumie-ui.css`)
- **Contador de Vidas y Tesoro (`#hud-lives`)**: Tablilla de basalto alargada; corazones vectoriales que conservan su contorno de tinta al perder salud, contador de llaves en oro y gemas en cian.
- **Herrajes del HUD (`.settings-btn`, `.dev-btn`, `.mute-btn`, `#hud-inventory`)**: Botones superiores tallados con muescas octogonales, borde de tinta y textura de hierro forjado.
- **Botones Táctiles de Acción (`#btn-jump`, `#btn-interact`)**: Sellos táctiles de 72×72 px con recorte octogonal de 6 px, bisel de hierro y elevación rúnica, garantizando precisión táctil sin deslumbramientos modernos.

### 3.4. Modal de Configuración y Gestión de Ranuras (`src/styles/modals.css`)
- **Ajustes (`#modal-settings`)**: Selectores de calidad gráfica, sonido, controles y cámara convertidos en pulsadores mecánicos de piedra biselada (`.quality-btn.active` con borde dorado).
- **Administrador de Ranuras (`.modal-slots-box`)**: Visualización de las 3 ranuras con botones de acción ("Cargar", "Nueva Partida", "Exportar", "Importar", "Borrar") alineados a la rejilla de píxeles sin desbordamiento horizontal.

### 3.5. Modal de Botín de Expedición / Inventario (`src/ui/modals/InventoryModal.js`)
- **Filtros por Categoría (`.inv-filter-tag`)**: Pestañas rectangulares de piedra; la pestaña activa conmuta a sello Hanko rojo con elevación de 1 px.
- **Tarjetas de Botín (`.inv-detail-card`, `.inv-consumable-card`)**: Tablillas de cantería con muescas octogonales para reliquias, llaves y gemas.
- **Botón "Beber" / "Usar" (`.btn-quick-use`)**: Sello bermellón con bisel encendido `#ef4444` para pociones de salud vital y sello cian espiritual para pergaminos de retorno.

### 3.6. Modal de Atlas de Expedición (`src/ui/modals/ChapterModal.js`)
- **Losa Monolítica de Cartografía (`.modal-chapter-box`)**: Marco de tinta pesada con cabecera de hierro y sello Hanko imperial.
- **Tarjetas de Capítulos (`.chapter-card`)**:
  - *Campamento Central (Lobby)*: Losa con bisel cian espiritual.
  - *Capítulos Disponibles / Conquistados*: Tablillas con sellos de estado rectangulares (`CONQUISTADO`, `ACTIVO`, `DISPONIBLE`).
  - *Capítulos en Construcción / Bloqueados*: Piedra agrietada con líneas de trazo discontinuo y atenuación de contraste.
- **Botón de Despliegue (`.chapter-launch-btn`)**: Botón rúnico "Viaje Rápido" con animación de pulsación por pasos discretos.

### 3.7. Modal del Bazar Rúnico del Mercader (`src/ui/modals/ShopModal.js`)
- **Mostrador de Cantería y Jade (`.shop-modal`)**: Losa de comercio con marco de tinta y relieve esmeralda `#047857`.
- **Monedero de Gemas (`.shop-balance-card`)**: Arcón rúnico cian con contador en `Pixelify Sans` legible.
- **Pestañas "Comprar" y "Vender"**: Sellos de transacción que alternan entre piedra y bermellón.
- **Botón "Comprar" / "Vender"**: Sellos esmeralda `#065f46` y dorados `#92400e` con bisel de relieve.

### 3.8. Modal de Herramientas Dev y Calibrador de Salas (`src/ui/modals/DevModal.js`)
- **Losa de Calibración Rúnica (`#modal-dev.dev-modal`)**: Marco de tinta pesada con acentos de jade `#34d399` y pastillas de sello DEV.
- **Select Rúnico de Salas (`#dev-sel-room`)**: Tablilla de piedra oscura con borde de tinta y relieve interior en `Pixelify Sans`.
- **Botón "Viajar" (`#btn-dev-teleport-room`)**: Botón rúnico cian `#0284c7` biselado con icono de rayo vectorial y tipografía `Silkscreen`.
- **Pulsadores de Mecanismos y Puertas**: Botones de piedra gris con relieve táctil (Spawn Entrada, Puertas 1-3, Mecanismos y Restauración).
- **Selector Rápido de Héroe**: Muestrario de tablillas de héroes con conmutación de borde de jade activo en vivo.

### 3.9. Timón de Vuelo Activo y Overlays de Diagnóstico (`#flight-stick-zone`, `#room-coords-overlay`, `#net-debug-panel`)
- **Palanca de Vuelo Activo (`#flight-stick-zone`)**:
  - *Base*: Medallón octogonal de piedra tallada (`#flight-stick-base`) con canales de mira grabados.
  - *Pomo*: Sello Hanko de cinabrio tallado (`#flight-stick-knob`) con bisel de relieve y feedback táctil inmediato.
  - *Sello Superior*: Pastilla octogonal bermellón (`#flight-stick-badge`) con texto `VUELO ACTIVO` en `Silkscreen`.
  - *Guías*: Flechas en oro rúnico con sombra de tinta para control de altitud vertical.
- **Overlay de Coordenadas (`#room-coords-overlay`)**: Tablilla de basalto con datos alfanuméricos en `Pixelify Sans` (POS, LOOK, HERO, ESTADO, MIRA) y botón de copia Hanko.
- **Panel de Telemetría WebRTC (`#net-debug-panel`)**: Pizarra de diagnóstico en piedra y tinta con métricas de RTT, paquetes y fotogramas sin fondos difuminados modernos.

---

## 4. Unificación de la Notificación y Botón de Descenso por Escalinata

### 4.1. El Problema Previo
Al interactuar con la escalinata o activarse el descenso por un compañero, la interfaz desplegaba avisos discordantes o duplicados:
1. Una tarjeta flotante de aviso y un botón independiente en ubicaciones dispares.
2. Contenido duplicado renderizado dentro del mismo contenedor (`card.innerHTML` + `card.appendChild(bigBtn)`).

### 4.2. Solución Unificada Central Sumi-e (`src/ui/HudManager.js`, `src/styles/hud.css`, `src/styles/sumie-ui.css`)
Ambas alertas se han fusionado en un **único componente interactivo centralizado**:
- **Posición Central Óptima**: Centrado en pantalla (`top: 50%; left: 50%; transform: translate(-50%, -50%)`), con alta visibilidad y sin bloquear de forma permanente la vista una vez activado el descenso.
- **Sin Duplicación en el DOM**: Montaje limpio del botón único interactivo con mapeo reactivo de propiedades, evitando la renderización de bloques visuales gemelos.
- **Estructura:**
  - **Izquierda:** Emblema octogonal tallado de la escalinata (`.descent-badge-seal`) en oro rúnico.
  - **Centro:** Columna informativa con el título `¡${byName} desciende!` en `Silkscreen`, sello Hanko imperial miniatura y subtítulo de ayuda contextual (`Toca para bajar o baja a la escalinata`).
  - **Derecha:** Pastilla de acción táctil integrada con texto `BAJAR YA` (o `[E] BAJAR YA`) y badge cuadrado de cuenta regresiva con actualización reactiva en vivo (`<span class="descent-timer">5</span>s`).
- **Comportamiento:**
  - Al hacer clic o toque en cualquier zona del botón, se ejecuta el descenso inmediato sincronizado vía WebRTC.
  - Animación `@keyframes descendPulseSumiE`: Oscilación vertical de exactamente 2 píxeles discretos (`steps(2)`), preservando la nitidez de píxel art sin deformación analógica.

---

## 5. Notificación Central de Game Over Accesible y Visible (`src/ui/HudManager.js`, `src/styles/sumie-ui.css`)

### 5.1. Diseño e Inmersión Sumi-e Dark Fantasy
- **Overlay Sombreado de Tinta (`#game-over-overlay.game-over-overlay-sumie`)**:
  - Telón de fondo con oscurecimiento dramático en degradado radial (`rgba(12,10,9,0.88)` a `rgba(2,1,1,0.96)`) y `backdrop-filter: blur(4px)`.
- **Losa Central de Derrota (`#game-over-card.game-over-card-sumie`)**:
  - Centrada en pantalla (`top: 50%; left: 50%; transform: translate(-50%, -50%)`).
  - Marco de piedra de basalto (`#181615`) con borde de tinta china (`#0c0a09`) de 4px y doble filete bermellón `#991b1b`.
  - Recorte octogonal en esquinas mediante biseles de relieve.
- **Sello Hanko Imperial de Derrota (`.game-over-hanko-seal`)**:
  - Emblema rojo lacre con icono vectorial `skull` y muesca rúnica.
- **Tipografía y Jerarquía**:
  - Título principal `GAME OVER` en `Silkscreen` (28px) en carmesí `#fca5a5` con sombra de tinta dura.
  - Pastilla de estado de vidas (`0 / 3 Vidas Restantes`).
  - Mensaje de lore en `Pixelify Sans`: "Tu espíritu ha regresado al Campamento Central."
- **Botón "Continuar" (`#btn-game-over-continue.game-over-continue-btn`)**:
  - Botón táctil prominente de cinabrio (`#991b1b` a `#7f1d1d`) con icono vectorial `refresh-cw` y bisel de relieve.

### 5.2. Accesibilidad y Ergonomía
- **Semántica y Roles**: `role="alertdialog"`, `aria-modal="true"`, `aria-label="Fin de la partida - Game Over"`.
- **Navegación por Teclado**: Soporte para descarte mediante teclas `Enter`, `Espacio` o `Escape`, con autofoco en el botón de acción (`continueBtn.focus()`).
- **Cierre Seguro Automático**: Temporizador de seguridad (fallback de 5.5s) que garantiza la reanudación del flujo de juego si el jugador no interactúa.

---

## 6. Transición de Victoria y Progresión Directa entre Capítulos (`#level-transition`)

### 6.1. Progresión sin Interrupciones en Altares Clímax
Al consagrar el altar supremo que culmina un capítulo (ej. `abyss_throne` en el Capítulo 1 o `shadow_sanctum` en el Capítulo 2), la interfaz ya no obliga a un retorno abrupto al Campamento Tutorial:
- **Avance Automático / Directo**: Si existe un siguiente capítulo jugable desbloqueado (ej. Capítulo 2: Cripta de las Sombras), el altar prepara el descenso directo a su primera mazmorra (`shadow_vault`).
- **Botón Primario de Avance (`#btn-close-victory`)**: Muestra la acción contextual `Avanzar al Capítulo X: [Nombre]` con corte octogonal, fondo degradado oro rúnico y relieve Sumi-e.
- **Opción de Retorno al Campamento (`#btn-return-lobby`)**: Si el grupo prefiere regresar al hub para comprar provisiones en el bazar o reorganizar su equipo, se proporciona un botón secundario de piedra tallada `Volver al Campamento`.
- **Sincronización Multijugador P2P**: El Host orquesta el cambio de capítulo mediante `serializeChapterSelect` y `serializeLevelChange`, permitiendo que todos los aventureros conectados entren al nuevo capítulo juntos.
- **Fin de Campaña**: Si se culmina el último capítulo jugable disponible, la transición agradece la bendición de todos los altares y conduce al Campamento Central.

### 6.2. Estilo Visual Sumi-e de la Transición
- **Velo de Tinta y Bruma**: Telón de fondo con oscurecimiento profundo y degradado radial de tinta china (`rgba(24,22,21,0.96)` a `rgba(12,10,9,0.98)`).
- **Tipografía**: Título en `Silkscreen` con sombra dura y texto descriptivo en `Pixelify Sans`.

---

## 7. Hoja de Estilos Centralizada (`src/styles/sumie-ui.css`)

Para facilitar el mantenimiento y evitar regresiones, todas las reglas de transformación visual se consolidaron en la hoja modular `src/styles/sumie-ui.css`, importada al final de `src/style.css`. De esta manera, no se rompe la lógica interna ni los contratos de eventos de `UIManager`, asegurando compatibilidad del 100% con la suite automatizada de pruebas (290+ pruebas pasando).

---

## 8. Retratos de Héroes Sumi-e Pixel Art (`src/heroes/heroPortraits.js`, `public/assets/heroes/`)

### 8.1. Arquitectura Dual UI 2D y Texturizado 3D Vóxel
Se ha inaugurado el sistema canónico de retratos en Pixel Art (32×32) con renderizado `crispEdges` para los héroes de *Runa y Piedra*:

1. **Guardián (`guardian`)**:
   - **Interfaz 2D**: Icono canónico `avatar_guardian` en el selector de clases (`.hero-chip`), modal de invitados (`GuestJoinModal.js`) y ranuras de guardado (`SaveSlotsModal.js`).
   - **Texturizado Facial 3D (`guardianGear.js`)**: Corona de oro viejo, gema Hanko bermellón y rostro caligráfico severo con ojos espirituales cian (`#0284c7`) inyectado en la cara frontal (`+Z`) del cubo craneal.

2. **Hechicero (`wizard`)**:
   - **Interfaz 2D**: Icono canónico `avatar_wizard` en el selector de clases, modal de invitados y ranuras de guardado. Muestra el sabio anciano con sombra proyectada por el ala del sombrero, runa amatista en el entrecejo, ojos arcanos y bigote blanco en relieve.
   - **Texturizado Dual Cabeza + Torso 3D (`wizardGear.js`)**:
     - *Cabeza (+Z)*: Textura facial con cejas pobladas y barba superior de sabio.
     - *Pecho (+Z)*: Textura de túnica arcana morada (`#581c87`, `#6b21a8`) con estola bordada en oro, cinturón con grimorio y la continuación fluida de los mechones y surcos verticales de pincel seco (*Kasure*) de la barba larga, eliminando el antiguo bloque 3D que obstruía la boca y el rostro.
   - **Ciclo de Vida de Materiales (`AvatarRenderer.js`)**: Restauración automática y transparente tanto del material facial (`_sharedMats.face`) como del material original de túnica del torso (`_origTorsoMat`) en `_clearGear()`.

3. **Explorador (`ranger`)**:
   - **Interfaz 2D**: Icono canónico `avatar_ranger` en el selector de clases, modal de invitados y ranuras de guardado. Retrato de rastreador ágil con capucha y flequillo verde bosque (`#14532d`, `#15803d`), pluma de explorador blanca y roja carmesí, ojos vivos color jade esmeralda (`#047857`, `#10b981`), pinturas de guerra en las mejillas (`#7f1d1d`), cicatriz en el puente de la nariz y una sonrisa confiada de lado (*smirk*).
   - **Texturizado Facial 3D (`rangerGear.js`)**: La capucha deja el frente despejado mientras la textura facial Sumi-e Pixel Art viste la cara frontal (+Z) del vóxel craneal con la expresión y plumaje del arquero.
   - **Ciclo de Vida de Materiales**: Registro de `faceMat` para su disposición y restauración a `_sharedMats.face` al desequipar o alternar de clase.

4. **Paladín (`paladin`)**:
   - **Interfaz 2D**: Icono canónico `avatar_paladin` en el selector de clases, modal de invitados y ranuras de guardado. Retrato de caballero sagrado con yelmo de acero forjado (`#52525b`, `#71717a`, `#a1a1aa`, `#e4e4e7`), visera y protector nasal con filo dorado sagrado (`#d97706`, `#fef08a`), engaste de penacho bermellón (`#991b1b`), cejas severas, ojos azul celestial templario (`#1d4ed8`, `#38bdf8`), cicatriz vertical de honor en el pómulo izquierdo y mandíbula firme con barba corta en gris acero.
   - **Texturizado Facial 3D (`paladinGear.js`)**: El casco de acero envuelve nuca, laterales y techo con la cresta de pluma roja en 3D, mientras que la cara frontal (+Z) del vóxel craneal proyecta la visera, protector nasal, ojos templarios y mentón en Pixel Art con máxima nitidez.
   - **Ciclo de Vida de Materiales**: Registro de `faceMat` y restauración limpia a `_sharedMats.face` en `_clearGear()`.

5. **Aventurero (`adventurer`)**:
   - **Interfaz 2D**: Icono canónico `avatar_adventurer` en el selector de clases, modal de invitados y ranuras de guardado. Retrato de explorador versátil con cabello castaño despeinado (`#2e1909`, `#451a03`, `#78350f`), cejas expresivas, ojos azul cian de brújula (`#0369a1`, `#38bdf8`), parche/tirita en cruz en la mejilla derecha (`#78716c`, `#f4efe4`, `#e7ded0`), polvo de mazmorra en la mejilla izquierda, boca audaz con destello de sonrisa confiada y oclusión inferior para empalmar con la bufanda marrón.
   - **Texturizado Facial 3D (`adventurerGear.js`)**: La cara frontal (+Z) proyecta la expresión heroica y el flequillo del aventurero en perfecta continuidad con el casquete y mechón castaño 3D en la parte superior.
   - **Ciclo de Vida de Materiales**: Registro de `faceMat` y restauración a `_sharedMats.face` en `_clearGear()`.






