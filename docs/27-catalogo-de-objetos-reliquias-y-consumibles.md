# 27. Catálogo Canónico de Objetos, Reliquias y Consumibles

> **Versión del documento**: 1.1.0  
> **Fecha de actualización**: 13 de octubre de 2026  
> **Módulos relacionados**: [`src/inventory/ItemRegistry.js`](../src/inventory/ItemRegistry.js), [`src/ui/modals/ShopModal.js`](../src/ui/modals/ShopModal.js), [`src/controllers/InventoryController.js`](../src/controllers/InventoryController.js), [`src/ui/modals/InventoryModal.js`](../src/ui/modals/InventoryModal.js), [`src/levels/ChapterRegistry.js`](../src/levels/ChapterRegistry.js)

---

## 1. Visión General

Este documento establece la especificación técnica y de diseño para todos los objetos, consumibles y reliquias en *Runa y Piedra* (excluyendo llaves de paso de mazmorra). Define la consolidación del objeto de retorno al Lobby, el inventario cerrado de exactamente diez (10) Reliquias Míticas, sus funcionalidades proyectadas y las directrices de prevención de saturación de objetos.

---

## 2. Consolidación de Consumibles de Retorno

### 2.1 Unificación a un Objeto Único
Anteriormente existían dos definiciones paralelas (`pergamino_retorno` y `runa_retorno`). Se han unificado en **un único objeto canónico**:

- **Identificador canónico**: `pergamino_retorno`
- **Nombre**: `Pergamino de Retorno`
- **Icono**: `vortex` (SVG vectorial de remolino arcano)
- **Color temático**: `#38bdf8` (azul cian arcano)
- **Tipo**: `scroll`
- **Precio en Bazar**: Compra por 120 Gemas / Venta por 60 Gemas
- **Compatibilidad**: Cualquier referencia histórica o guardado con `runa_retorno` se normaliza de forma transparente hacia `pergamino_retorno` mediante `getItemDefinition()`.

### 2.2 Mecánica de Teletransporte al Lobby
1. **Uso en mazmorra o expedición**:
   - El jugador activa el objeto desde el modal de inventario (`#modal-inventory-panel`) pulsando el botón azul místico **"Usar"**.
   - Consume una (1) unidad de `inventory.potions`.
   - Emite el mensaje narrativo: `✨ ¡Has usado Pergamino de Retorno! Canalizando portal al Campamento Central...`.
   - Dispara el efecto de audio ceremonial de portal.
   - Ejecuta la transición de nivel a `lobby_tutorial` de manera autoritativa (sincronizada en red con los clientes si el emisor es el host).
2. **Protección contra desperdicio en el Lobby**:
   - Si el jugador intenta usar el pergamino mientras ya se encuentra en `lobby_tutorial`:
     - El juego emite sonido de bloqueo/clic.
     - Muestra el aviso: `✨ Ya te encuentras en el Campamento Central (Lobby).`
     - **El objeto no se consume** ni se desperdicia del inventario.

### 2.3 Cards de Consumibles de Acción Rápida en el Botín de Expedición
Para optimizar el uso de objetos vitales durante incursiones y combate intenso:
- **Prioridad visual en la vista general**: En la pestaña "Todos", la sección de *Pociones y Consumibles* se ubica al principio de la lista, evitando desplazamientos innecesarios en momentos críticos de salud.
- **Diseño de Cards Ergonómicas**: Cada consumible se representa en una tarjeta con fondo degradado y halo cromático (`#f43f5e` para vida, `#fb7185` para elixir mayor, `#38bdf8` para retorno).
- **Insignias de Efecto Directo**: Insignias visuales destacadas (`+1 ❤️`, `+2 ❤️❤️`, `Portal Lobby`) que informan inmediatamente del resultado.
- **Botón de Activación Inmediata**: Botones táctiles amplios (`.btn-quick-use`) con respuesta elástica al toque para disparar la acción sin retrasos.

### 2.4 El Llavero como Pestaña y Contenedor Independiente de Inventario
Las llaves de mazmorra poseen una naturaleza estrictamente orientada a misión y avance:
- **Tag independiente en el selector**: Pestaña dedicada `Llavero` (`data-filter="keys"`) con icono de llave ámbar (`#fbbf24`), separada de los tesoros comerciales.
- **Banner de regla explícita**: Informa que *"Las llaves no se compran ni venden en el bazar. Se usan automáticamente al interactuar ante su puerta sellada"*.
- **Tarjetas de llave**: Muestran nombre canónico, lore de forja, píldora de estado `Puerta Sellada` y etiqueta de regla de consumo automático.
- **Estado vacío explicativo**: Guía al aventurero sobre cómo se obtienen en cofres de cámaras y su conservación segura en el llavero.

---

## 3. Catálogo de las 10 Reliquias Míticas Ancestrales

### 3.1 Panteón Cerrado e Invariante de 10 Reliquias
El panteón de reliquias de *Runa y Piedra* posee un **techo estricto e inmutable de diez (10) reliquias míticas**:
- Una vez que las 4 reliquias selladas sean habilitadas en los capítulos correspondientes, **no se generarán ni añadirán nuevas reliquias al juego**.
- Esta regla de diseño previene la inflación de artefactos, preserva el valor místico de cada hallazgo y evita la saturación del inventario del jugador.

### 3.2 Tabla Comparativa de las 10 Reliquias

| # | ID Canónico | Nombre | Icono / Color | Estado Actual | Procedencia / Capítulo | Venta Bazar |
| :-: | :--- | :--- | :-: | :-: | :--- | :-: |
| **1** | `caliz_sagrado` | Cáliz Sagrado | `trophy` / `#eab308` | Obtenible | Cap. 1: Mazmorra Ancestral (*Dungeon Classic*) | +250 Gemas |
| **2** | `corazon_volcan` | Corazón del Volcán | `flame` / `#f97316` | Obtenible | Cap. 1: Cripta Infernal (*Crypt Inferno*) | +350 Gemas |
| **3** | `corona_vacio` | Corona del Vacío | `crown` / `#a855f7` | Obtenible | Cap. 1: Trono del Vacío (*Abyss Throne*) | +500 Gemas |
| **4** | `cetro_sombras` | Cetro de Sombras | `wand` / `#7c3aed` | Obtenible | Cap. 2: Santuario Crepuscular (*Shadow Sanctum*) | +600 Gemas |
| **5** | `espejo_sombras` | Espejo de Sombras | `shield` / `#6366f1` | Obtenible | Cap. 2: Bóveda de Basalto (*Shadow Vault*) | +200 Gemas |
| **6** | `amuleto_jade` | Amuleto de Jade Rúnico | `trophy` / `#10b981` | Obtenible | Lobby: Bazar Rúnico del Mercader | +200 Gemas (Compra: 350) |
| **7** | `orbe_tempestad` | Orbe de la Tempestad | `bolt` / `#06b6d4` | **Sellada** (`obtainable: false`) | Reinos de Tormenta Inexplorados (Cap. futuro) | +400 Gemas |
| **8** | `lagrima_hielo` | Lágrima de Escarcha Eterna | `snowflake` / `#38bdf8` | **Sellada** (`obtainable: false`) | Cumbres Glaciales Prohibidas (Cap. futuro) | +450 Gemas |
| **9** | `reloj_arenas_tiempo` | Reloj de Arenas Temporales | `timer` / `#f59e0b` | **Sellada** (`obtainable: false`) | Fallas del Tejido Temporal (Cap. futuro) | +550 Gemas |
| **10** | `tomo_astral` | Tomo de las Constelaciones | `sparkles` / `#ec4899` | **Sellada** (`obtainable: false`) | Archivos Cósmicos de Supernova (Cap. futuro) | +650 Gemas |

### 3.3 Política de Bloqueo de Generación Actual (`obtainable: false`)
Para garantizar que **no se puedan encontrar más reliquias ni generarse prematuramente**:
- Las reliquias 7 a 10 no figuran en ninguna lista de recompensas de cofres en `src/levels/data/*.json`.
- No están presentes en el catálogo de compra del Bazar (`SHOP_CATALOG`).
- La bandera `obtainable: false` en `ItemRegistry.js` impide su adjudicación por cualquier generador de botín procedural.

---

## 4. Funcionalidades Proyectadas de las 10 Reliquias (Especificación de Diseño)

> [!IMPORTANT]
> **Estado de Implementación: Solo Documentado (Pre-implementación)**  
> Para evitar saturar de objetos y mecánicas las mazmorras antes de tener los **diez (10) capítulos completamente estructurados y balanceados**, las siguientes funcionalidades son **especificaciones teóricas de diseño**. No se activarán en el código de ejecución hasta que la campaña completa esté delimitada y cada reliquia ocupe su lugar orgánico en la progresión.

Cada reliquia aportará una ventaja pasiva o mecánica temática única al ser portada en el inventario o consagrada en los altares del campamento:

### 1. Cáliz Sagrado (`caliz_sagrado`)
- **Afinidad**: Vida y Vitalidad de los Constructores.
- **Mecánica proyectada**: *Néctar de los Primeros*. Aumenta la potencia de las pociones de vida (cada poción restaura +1 medio corazón adicional o concede 15 segundos de regeneración pasiva al superar una sala sin daño).

### 2. Corazón del Volcán (`corazon_volcan`)
- **Afinidad**: Fuego y Magma Terrestre.
- **Mecánica proyectada**: *Temple Ígneo*. Reduce la aceleración de hundimiento en lava y otorga 3 segundos adicionales de inmunidad térmica antes del reinicio forzado al spawn. Incrementa un +15% el impulso vertical en bloques `JUMP_PAD`.

### 3. Corona del Vacío (`corona_vacio`)
- **Afinidad**: Gravedad y Abismo.
- **Mecánica proyectada**: *Manto del Vacío*. Reduce la velocidad terminal de caída (efecto caída de pluma), permitiendo planear distancias mayores entre islas flotantes.

### 4. Cetro de Sombras (`cetro_sombras`)
- **Afinidad**: Ocultamiento y Penumbra.
- **Mecánica proyectada**: *Velo Crepuscular*. Concede 4 segundos de invulnerabilidad táctica tras activar mecanismos o abrir puertas selladas en cámaras con trampas.

### 5. Espejo de Sombras (`espejo_sombras`)
- **Afinidad**: Refracción y Duplicación.
- **Mecánica proyectada**: *Reflejo de Riqueza*. Otorga una probabilidad del 20% de duplicar las gemas extraídas al abrir cualquier cofre antiguo de expedición.

### 6. Amuleto de Jade Rúnico (`amuleto_jade`)
- **Afinidad**: Prosperidad Comercial.
- **Mecánica proyectada**: *Favor del Mercader*. Otorga un descuento permanente del 15% en las compras del Bazar Rúnico y eleva un 10% el valor de venta de cualquier botín vendido al mercader.

### 7. Orbe de la Tempestad (`orbe_tempestad`)
- **Afinidad**: Tormenta y Viento Eléctrico.
- **Mecánica proyectada**: *Impulso de Tempestad*. Bono pasivo del +12% a la velocidad de movimiento horizontal tanto en carrera terrestre como en salto aéreo.

### 8. Lágrima de Escarcha Eterna (`lagrima_hielo`)
- **Afinidad**: Hielo y Criostasis.
- **Mecánica proyectada**: *Pausa Glacial*. Extiende el margen de tiempo de los temporizadores de descenso y losas de presión en 3 segundos de gracia antes de activarse.

### 9. Reloj de Arenas Temporales (`reloj_arenas_tiempo`)
- **Afinidad**: Crono-reversión.
- **Mecánica proyectada**: *Anclaje Temporal*. Una vez por expedición, si el jugador comete un fallo crítico de salto, es devuelto a la entrada de la sala actual conservando sus vidas intactas.

### 10. Tomo de las Constelaciones (`tomo_astral`)
- **Afinidad**: Revelación Cósmica.
- **Mecánica proyectada**: *Visión de las Estrellas*. Emite un pulso visual sutil en la brújula y HUD que revela la dirección de cofres secretos y puertas selladas en mazmorras laberínticas.

---

## 5. Estrategia de Progresión y Prevención de Saturación

Para mantener un ritmo de juego claro, inmersivo y sin fricción cognitiva:

1. **Una Reliquia Principal por Entorno Mayor**: Cada capítulo o gran hito albergará únicamente una reliquia emblemática asociada a su clímax narrativo y ambiental.
2. **Límite Cerrado de Colección**: El inventario del jugador jamás superará diez reliquias míticas en total. No se introducirán reliquias genéricas, infinitas ni de nivelación de números (*gear treadmill*).
3. **Despliegue Secuencial con los 10 Capítulos**: Las funcionalidades documentadas en la Sección 4 se implementarán de forma modular únicamente cuando se diseñe cada uno de los capítulos del 3 al 10 en `ChapterRegistry.js`, asegurando que cada puzle esté calibrado para la habilidad del aventurero.

---

## 6. Pociones de Salud y Economía del Bazar

### 6.1 Catálogo de Compra del Bazar Rúnico
| Artículo | Tipo | Salud | Precio Compra | Precio Venta |
| :--- | :--- | :-: | :-: | :-: |
| **Poción de Vida** (`pocion_vida`) | Poción básica | +1 ❤️ | 50 Gemas | 25 Gemas |
| **Elixir Mayor de Vida** (`pocion_mayor`) | Poción superior | +2 ❤️❤️ | 100 Gemas | 50 Gemas |
| **Pergamino de Retorno** (`pergamino_retorno`) | Consumible / Scroll | Portal al Lobby | 120 Gemas | 60 Gemas |
| **Amuleto de Jade Rúnico** (`amuleto_jade`) | Reliquia mítica | Fortuna | 350 Gemas | 200 Gemas |

### 6.2 Calibración Dinámica de Precios
El módulo `ShopModal.js` exporta la función:
```javascript
export function setShopItemPrice(id, newPrice)
```
Permite que el sistema o herramientas de equilibrio adapten en caliente el coste de adquisición de vidas o consumibles según la progresión del jugador sin mutar el esquema de persistencia.
