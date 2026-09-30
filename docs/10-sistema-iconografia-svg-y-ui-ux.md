# 10. Sistema de Iconografía SVG Vectorial y Experiencia de Usuario (UI/UX)

Este documento detalla el subsistema global de iconos vectoriales SVG, el motor reactivo de conversión de emojis, la integración de la Sala de Expedición en el modal de configuración y las optimizaciones de maquetación móvil anti-desbordamiento.

---

## 1. Repositorio Global de Iconos SVG ([`src/ui/Icons.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js))

Para garantizar una estética medieval-voxel profesional y nítida en pantallas de alta densidad (Retina, AMOLED), se eliminó la dependencia de emojis Unicode heterogéneos y se creó un catálogo centralizado de iconos vectoriales SVG limpios con `viewBox="0 0 24 24"`.

### Catálogo de Iconos Vectoriales Registrados

| Clave | Icono | Color por Defecto | Propósito / Ubicación |
| :--- | :---: | :---: | :--- |
| `castle` | 🏰 | `#fbbf24` | Botón "Crear Mazmorra", cabecera de sala y mapa Mazmorra Ancestral |
| `volcano` | 🌋 | `#f97316` | Tarjeta del mapa Cripta del Fuego |
| `swords` | ⚔️ | `#94a3b8` | Título del Menú Principal (`RUNA Y PIEDRA`) |
| `shield` | 🛡️ | `#38bdf8` | Emblema de clase Paladín y escudo de aventurero |
| `compass` | 🧭 | `#38bdf8` | Emblema de clase Aventurero |
| `feather` | 🪶 | `#10b981` | Emblema de clase Explorador |
| `wand` | 🪄 | `#a855f7` | Emblema de clase Hechicero |
| `crown` | 👑 | `#fbbf24` | Emblema de clase Guardián |
| `settings` | ⚙️ | `#cbd5e1` | Botón flotante y cabecera de Configuración |
| `x` | ✕ | `#94a3b8` | Botón de cerrar modales |
| `check` | ✅ | `#22c55e` | Confirmación de copia de enlace en el portapapeles |
| `warning` | ⚠️ | `#f59e0b` | Avisos de caída al vacío o desconexión |
| `door` | 🚪 | `#d97706` | Avisos de apertura de puertas |
| `chest` | 📦 | `#f59e0b` | Notificaciones de apertura de cofres y botín |
| `key` | 🗝️ | `#fbbf24` | Recompensa de llaves rúnicas |
| `gem` | 💎 | `#38bdf8` | Recompensa de gemas legendarias |
| `trophy` | 🏆 | `#eab308` | Cáliz sagrado y reliquias |
| `sparkles` | ✨ | `#facc15` | Activación de pedestales y efectos rúnicos |
| `flame` | 🔥 | `#ef4444` | Peligro de lava e impacto ígneo |
| `share` | 📱 | `currentColor` | Botón Web Share API ("Compartir en Mensajería") |
| `copy` | 📋 | `currentColor` | Botón copiar link al portapapeles |
| `action` | ⚡ | `#f59e0b` | Botón de acción táctil / estadística de velocidad |
| `jump` | ⬆️ | `#94a3b8` | Botón de salto táctil / estadística de salto |

---

## 2. Métodos Utilitarios de Renderizado

### 1. `renderIcon(nameOrEmoji, options)`
Genera el marcado SVG en línea a partir del nombre o de un emoji legado:
```javascript
renderIcon('castle', { size: 18, color: '#fff', className: 'btn-icon' });
```
Soporta:
- `size`: Dimensiones en píxeles (ancho y alto proporcionales).
- `color`: Inyección directa en `fill` o `stroke` según el tipo de glifo.
- `className`: Clases CSS complementarias (`svg-icon`).
- `style`: Estilos CSS inline adicionales.

### 2. `replaceEmojisWithSvg(text, options)`
Escanea dinámicamente cualquier cadena de texto (incluso proveniente de archivos JSON de niveles o eventos de red) y sustituye automáticamente los caracteres Unicode por su correspondiente SVG:
```javascript
this.hudMessage.innerHTML = replaceEmojisWithSvg(text);
```
Garantiza alineación vertical milimétrica (`vertical-align: -2px`) y consistencia en todas las plataformas.

---

## 3. Integración de la Sala de Expedición en Configuración (Flujo sin Fricción)

### Eliminación del Segundo Modal Intermedio
- **Flujo Anterior**: Al pulsar "Crear Mazmorra", se abría un segundo modal ("Sala de Expedición") que obligaba al anfitrión a pulsar "Comenzar Aventura" antes de poder moverse.
- **Flujo Actual (v1.8.0+)**:
  1. Al pulsar **"Crear Mazmorra"**, el anfitrión entra **directamente al juego** (`in_game`) con controles listos y cruceta activa.
  2. Un aviso narrativo superior notifica: `🏰 [Nivel] (PIN: [XXXX]). Toca ⚙️ para invitar amigos.`
  3. Toda la suite de la Sala de Expedición reside de forma permanente dentro del modal de ⚙️ **Configuración**:
     - Visualización del PIN en tipografía destacada de 32px.
     - Botón "Compartir en Mensajería" (WhatsApp, Telegram vía Web Share API).
     - Botón "Copiar Enlace" con checkmark interactivo.
     - Código QR en canvas generado con `QRCode.toCanvas`.
     - Selector interactivo de mapas para cambiar de nivel en caliente.
     - Lista de compañeros de expedición sincronizada en vivo con iconos de clase.

---

## 4. Maquetación Móvil Responsiva y Anti-Desbordamiento

### Corrección del Botón "Unirse"
- **Problema Detectado**: En resoluciones de pantalla estrechas ($\le 360\text{ px}$), el campo de texto de 4 dígitos `.join-input` superaba el ancho disponible debido al valor predeterminado del navegador `min-width: auto`, expulsando a `.btn-join` fuera del borde del modal.
- **Solución Implementada ([`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html#L8-L45))**:
  1. **Reset Universal**: `*, *:before, *:after { box-sizing: border-box; }`.
  2. **Contenedor Elástico**: `.join-container { width: 100%; display: flex; gap: 8px; box-sizing: border-box; }`.
  3. **Input de Ancho Cero Base**: `.join-input { flex: 1; min-width: 0; box-sizing: border-box; }`.
  4. **Botón Fijo**: `.btn-join { flex-shrink: 0; box-sizing: border-box; }`.
  
El botón y el campo se adaptan con precisión matemática desde pantallas de $280\text{ px}$ hasta tablets y escritorios.

---

## 5. Visibilidad Contextual de Controles Táctiles

Para mantener las pantallas de lobby, creación de sala y ajustes limpias y despejadas:
- En [`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js), el método `setActionButtonsVisible(visible)` conmuta la visibilidad de los botones flotantes **SALTAR** y **ACTION**.
- Los botones permanecen en `display: none` durante los menús y modales, apareciendo únicamente en partida activa (`currentScreen === 'in_game'`).

---

## 6. Dinámica de Resortes (Spring Physics), Asimetría Táctil y Taxonomía de Animaciones

Para lograr un acabado táctil y receptivo de nivel comercial en navegadores móviles, se formalizó la arquitectura de animaciones en tres niveles bien diferenciados:

### 1. Corrección Taxonómica: Ease-Out-Expo vs Spring Real
- **Ease-Out-Expo (`cubic-bezier(0.16, 1, 0.3, 1)`)**: Utilizada en las tarjetas de alerta del HUD (`.hud-alert-card`). Es una curva asintótica suave y veloz ($Y \le 1.0$) sin rebasamiento (*overshoot*) ni oscilación.
- **Spring Real (Resorte Físico)**: Requiere capacidad de sobrepasar el objetivo ($Y > 1.0$), oscilar en sistemas sub-amortiguados ($\zeta < 1.0$) y estabilizarse según masa y amortiguación.

### 2. Integrador Físico de Resortes ([`src/ui/Spring.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Spring.js))
Clase autónoma y sin dependencias externas basada en **Euler semi-implícito** con 4 sub-pasos por tick:
$$a = -k \cdot (x - x_{\text{target}}) - c \cdot v$$
$$v \gets v + a \cdot \Delta t_{\text{sub}}$$
$$x \gets x + v \cdot \Delta t_{\text{sub}}$$
- **Cofre 3D ([`ChestRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/ChestRenderer.js))**: Emplea `Spring(200, 14)` para la tapa, proporcionando sensación de masa pesada, rebote elástico contra el tope (~112% de apertura) y disipación natural. La intensidad luminosa interior (`lootLight.intensity`) se normaliza mediante $\text{clamp}(\text{angle} / \text{target}, 0, 1) \cdot 3.0$ para evitar destellos o parpadeos durante el rebote.

### 3. Asimetría Táctil en Botones de Acción Móvil ([`index.html`](file:///data/data/com.termux/files/home/develop/game/index.html))
- **Press (Presión)**: $80\text{ ms}$ con `ease-out` para feedback táctil instantáneo.
- **Release (Liberación)**: $180\text{ ms}$ con `cubic-bezier(0.34, 1.56, 0.64, 1)` (curva *back-out* con rebote elástico visible).
- Supresión del destello translúcido en Safari iOS vía `-webkit-tap-highlight-color: transparent`.

### 4. Micro-Animaciones CSS para Iconos SVG ([`Icons.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Icons.js))
- `@keyframes springPopIn`: Overshoot elástico único ($420\text{ ms}$) para títulos y avisos narrativos.
- `@keyframes springBounce`: Rebote con dos oscilaciones elásticas ($620\text{ ms}$) para elementos de recompensa (gemas, llaves, tesoros).
- **Ejecución 100% en Hilo Compositor GPU**: Selectores duales `.svg-icon` y `.narrative-icon` con descarte de `will-change` al completarse (`.done`) para optimizar memoria en pantallas Retina y AMOLED.
- Función de utilidad reactiva `replaySpringAnimation(element, variant)` para re-disparar animaciones forzando reflow (`void el.offsetWidth`) sin clonar nodos del DOM.
