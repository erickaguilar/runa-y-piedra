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

---

## 4. Unificación de la Notificación y Botón de Descenso por Escalinata

### 4.1. El Problema Previo
Al interactuar con la escalinata o activarse el descenso por un compañero, la interfaz desplegaba dos elementos visualmente discordantes y desconectados:
1. Una tarjeta flotante de aviso en la parte superior (`#descent-card` a `top: 16px`).
2. Un botón gigante flotante independiente en el tercio inferior (`#btn-descend-now` a `top: 62%`) que tapaba el centro de la pantalla y la mira del jugador.

### 4.2. Solución Unificada Sumi-e (`src/ui/HudManager.js`, `src/styles/sumie-ui.css`)
Ambas alertas se han fusionado en un **único componente interactivo superior**:
- **Estructura:**
  - **Izquierda:** Emblema octogonal tallado de la escalinata (`.descent-badge-seal`) en oro rúnico.
  - **Centro:** Columna informativa con el título `¡${byName} desciende!` en `Silkscreen`, sello Hanko imperial miniatura y subtítulo de ayuda contextual (`Toca para bajar o baja a la escalinata`).
  - **Derecha:** Pastilla de acción táctil integrada con texto `BAJAR YA` (o `[E] BAJAR YA`) y badge cuadrado de cuenta regresiva con actualización reactiva en vivo (`<span class="descent-timer">5</span>s`).
- **Comportamiento:**
  - Al hacer clic o toque en cualquier zona del botón, se ejecuta el descenso inmediato sincronizado vía WebRTC.
  - Animación `@keyframes descendPulseSumiE`: Oscilación vertical de exactamente 2 píxeles discretos (`steps(2)`), preservando la nitidez de píxel art sin deformación analógica.

---

## 5. Hoja de Estilos Centralizada (`src/styles/sumie-ui.css`)

Para facilitar el mantenimiento y evitar regresiones, todas las reglas de transformación visual se consolidaron en la hoja modular `src/styles/sumie-ui.css`, importada al final de `src/style.css`. De esta manera, no se rompe la lógica interna ni los contratos de eventos de `UIManager`, asegurando compatibilidad del 100% con la suite automatizada de pruebas (287 pruebas pasando).
