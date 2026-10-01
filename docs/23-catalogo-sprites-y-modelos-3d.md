# 23. Catálogo Técnico de Sprites y Modelos 3D

## 1. Arquitectura de Renderizado y Presupuesto Visual

*Runa y Piedra* implementa una arquitectura gráfica híbrida diseñada para alcanzar **60 FPS estables** con un consumo de memoria Heap inferior a **120 MB** en dispositivos móviles de gama de entrada y navegadores de escritorio.

Esta arquitectura separa estrictamente el renderizado del mundo en dos subsistemas coordinados:

1. **Mundo Vóxel Instanciado (`VoxelMap.js`)**: Renderizado masivo de hasta 13,824 bloques cúbicos simultáneos mediante un único `THREE.InstancedMesh`. Las texturas no se cargan como archivos PNG/JPG independientes, sino que se muestrean desde un **Texture Atlas vectorial procedural SVG de $512 \times 1024$ píxeles** ($4 \times 8$ casillas, 23 sprites procedurales activos) inyectado directamente en el shader (`onBeforeCompile`), permitiendo renderizar toda la geometría estática en **1 sola llamada de dibujo (Draw Call)**.
2. **Entidades 3D Interactivas y Dinámicas (`AvatarRenderer.js`, `ChestRenderer.js`, `DoorRenderer.js`, `PedestalRenderer.js`, `StairsRenderer.js`)**: Modelos tridimensionales paramétricos con geometrías optimizadas y fusionadas (`BufferGeometryUtils.mergeGeometries`), provistos de simulaciones físicas basadas en resortes (*Spring mechanics*), luces puntuales dinámicas y sistemas de partículas.

```
                     ┌──────────────────────────────────────────────┐
                     │          ESCENA PRINCIPAL (Three.js)         │
                     └──────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
     ┌─────────────────────────────┐                 ┌─────────────────────────────┐
     │      MUNDO VÓXEL (1 DC)     │                 │   ENTIDADES 3D DINÁMICAS    │
     ├─────────────────────────────┤                 ├─────────────────────────────┤
     │ • InstancedMesh (Box 1x1x1) │                 │ • Avatares (5 Clases Héroe) │
     │ • Atlas Vectorial 4x8 SVG   │                 │ • Cofres con apertura 85°   │
     │ • 23 Sprites Procedurales   │                 │ • Puertas de Doble Hoja     │
     │ • Shaders con Atlas Offset  │                 │ • Altar con Orbe Flotante   │
     │ • Modulación THREE_COLORS   │                 │ • Escalinata con Losa Desl. │
     └─────────────────────────────┘                 └─────────────────────────────┘
```

---

## 2. Catálogo de Sprites del Texture Atlas (23 Sprites Activos en Matriz 4x8)

El Texture Atlas procedural se genera en tiempo de ejecución en un canvas HTML5 de $512 \times 1024$ píxeles dividido en **32 casillas de $128 \times 128$ píxeles** (4 columnas $\times$ 8 filas), de las cuales **23 casillas activas** (Tiles 0 al 22) están implementadas para los tipos de bloques del juego. La textura se calibra en escala de grises para que el shader de Three.js multiplique los valores de luminancia por el color del tipo de bloque (`BLOCK_COLORS`), preservando contrastes, biseles y microtexturas minerales, con la excepción de las losas de respawn y la lava volcánica, que emplean policromía vectorial de alta fidelidad (`0xffffff`).

### Matriz de Distribución en el Atlas ($4 \times 8$)

| Fila / Columna | Col 0 ($u=0.00$) | Col 1 ($u=0.25$) | Col 2 ($u=0.50$) | Col 3 ($u=0.75$) |
| :---: | :---: | :---: | :---: | :---: |
| **Fila 0** ($v=0.875$) | **Tile 0**: Muro Sillar | **Tile 1**: Muro Fisuras | **Tile 2**: Muro Mampostería | **Tile 3**: Muro Musgo |
| **Fila 1** ($v=0.750$) | **Tile 4**: Muro Runa | **Tile 5**: Suelo Limpio | **Tile 6**: Suelo Desgaste | **Tile 7**: Suelo Musgo |
| **Fila 2** ($v=0.625$) | **Tile 8**: Suelo Mixto | **Tile 9**: Suelo Santuario | **Tile 10**: Columna Fuste | **Tile 11**: Losa Respawn |
| **Fila 3** ($v=0.500$) | **Tile 12**: Columna Acanalada | **Tile 13**: Lava 1 (Magma Activo) | **Tile 14**: Salto Jump Pad | **Tile 15**: Pedestal Runa |
| **Fila 4** ($v=0.375$) | **Tile 16**: Lava 2 (Fisuras Magma) | **Tile 17**: Lava 3 (Géiseres Gas) | **Tile 18**: Lava 4 (Río Piroclástico) | **Tile 19**: Lava 5 (Caldera Hipertérmica) |
| **Fila 5** ($v=0.250$) | **Tile 20**: Pilar con Musgo | **Tile 21**: Pilar con Desgaste | **Tile 22**: Pilar Tono Oscuro | *(Reservado Expansión)* |
| **Filas 6-7** ($v \le 0.125$) | *(Reservado Expansión)* | *(Reservado Expansión)* | *(Reservado Expansión)* | *(Reservado Expansión)* |

### Modularización Atómica del Código de Sprites (`src/render/textures/`)

Para optimizar el mantenimiento, evitar archivos monolíticos de más de 1,000 líneas y facilitar la expansión de nuevos biomas, el código vectorial SVG de los sprites está modularizado en archivos independientes por categoría:

- [`src/render/textures/walls.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/walls.js): Muros (Tiles 0 a 4 — sillar regular, agrietado, mampostería, musgo, glifo rúnico).
- [`src/render/textures/floors.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/floors.js): Suelos (Tiles 5 a 9 — losas limpias, desgaste, musgo, mixto, rombo de santuario).
- [`src/render/textures/pillars.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/pillars.js): Pilares y Columnas (Tiles 10, 12, 20, 21, 22 — monolítica base, acanalada lisa, musgo, desgaste, oscura).
- [`src/render/textures/specials.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/specials.js): Losas interactivas y ceremoniales (Tiles 11, 14, 15 — Respawn Pad, Jump Pad, Pedestal).
- [`src/render/textures/lava.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/lava.js): Fluidos volcánicos (Tiles 13, 16, 17, 18, 19 — magma activo, fisuras, géiseres, río piroclástico, caldera).
- [`src/render/textures/index.js`](file:///data/data/com.termux/files/home/develop/game/src/render/textures/index.js): Agregador y ensamblador unificado `createTilesSvgArray(S)`.
- [`src/render/TextureGenerator.js`](file:///data/data/com.termux/files/home/develop/game/src/render/TextureGenerator.js): Orquestador desacoplado que renderiza el SVG combinado al canvas HTML5 y crea la instancia de `THREE.CanvasTexture`.

---

### Desglose Detallado de Sprites por Tipo de Bloque

#### A. Muros (`WALL` — Bloque Tipo 2)
Cuenta con **5 sprites distintos** (Tiles 0 al 4). Para evitar el efecto de cuadrícula monótona, el motor ejecuta un hash determinista espacial pseudoaleatorio $O(1)$ (`VoxelMap.hashCoord(x, y, z)`) evaluado sobre la paleta ponderada `[0, 0, 0, 0, 1, 1, 2, 2, 3, 4]`, garantizando sillar regular dominante con apariciones orgánicas de fracturas, musgo y runas místicas:

1. **Tile 0 (Sillar Regular)**: Bloques de cantería con hiladas horizontales alternadas, juntas de mortero oscuro de 4 px, biseles de iluminación superior y picado fino de cantera.
2. **Tile 1 (Sillar Agrietado)**: Fracturas diagonales profundas y microfisuras con bordes de luz reflejada que denotan daño estructural por el paso de los siglos.
3. **Tile 2 (Mampostería Irregular)**: Composición de piedras poligonales de distintos tamaños con lecho de argamasa rústica ancha.
4. **Tile 3 (Muro con Musgo y Humedad)**: Manchas botánicas en degradado de verde ceniza sobre las uniones y gotas de condensación de mazmorra.
5. **Tile 4 (Glifo Rúnico Ancestral)**: Relieve pétreo con glifo arcano central en bajo relieve y sombras de incisión.

#### B. Suelos (`FLOOR_STONE`, `FLOOR_WORN`, `FLOOR_MOSS`, `STONE_FLOOR` — Bloques Tipos 1, 8, 9, 10)
Cuenta con **5 sprites distintos** (Tiles 5 al 9). Si el mapa define el bloque genérico `STONE_FLOOR`, el algoritmo `selectTile` aplica una dispersión determinista (70% losa limpia, 20% losa agrietada, 10% losa con musgo):

1. **Tile 5 (Losa Limpia — `FLOOR_STONE`)**: Cuatro baldosas simétricas de $2 \times 2$ con juntas perimetrales marcadas y textura de piedra plana transitable.
2. **Tile 6 (Losa Fracturada — `FLOOR_WORN`)**: Desgaste superficial con fisuras ramificadas que revelan el tránsito de aventureros.
3. **Tile 7 (Losa con Musgo — `FLOOR_MOSS`)**: Crecimiento de líquenes y musgo en las ranuras perimetrales para biomas húmedos o subterráneos.
4. **Tile 8 (Losa Mixta)**: Combinación de agrietamiento severo y parches de musgo en esquinas.
5. **Tile 9 (Losa Ceremonial de Santuario)**: Losa noble con grabado de rombo rúnico central para salas de recompensa.

#### C. Pilares y Columnas (`PILLAR` — Bloque Tipo 3)
Cuenta con **5 sprites distintos** (Tiles 10, 12, 20, 21, 22). Para garantizar una apariencia rica y orgánica manteniendo continuidad vertical estricta (*seamless vertical tiling*), todos los sprites comparten la misma estructura prismática (3 acanaladuras verticales profundas continuas a X=32, 64 y 96, sombreado cilíndrico lateral y ausencia de juntas horizontales). `VoxelMap.selectTile` distribuye deterministamente las 5 variantes mediante la paleta `[10, 12, 20, 21, 22]` evaluada con `hashCoord(x, y, z)` (~20% por variante):

1. **Tile 10 (Columna Monolítica Continua - Base)**: Textura con fuste sombreado verticalmente, bisel lumínico izquierdo, juntas longitudinales continuas y micro-desgaste sutil.
2. **Tile 12 (Columna Acanalada Lisa)**: Fuste de cantería limpio con estrías profundas, filetes de iluminación de 1.5 px y sombras laterales de volumen cilíndrico, sin grietas.
3. **Tile 20 (Columna con Musgo y Líquenes)**: Misma estructura geométrica acanalada enriquecida con 3 capas vegetales: humedad verde oscura en hendiduras (`#14532d`), musgo vivo en verde bosque (`#16a34a`) y brotes de líquenes/esporas en resalte claro (`#4ade80`).
4. **Tile 21 (Columna con Desgaste y Fracturas)**: Fisura diagonal severa que quiebra el fuste, fracturas ramificadas por estrés de carga (`stroke-width="2.2"`), bisel de luz en bordes de roca quebrada y grandes muescas de cantería desprendida.
5. **Tile 22 (Columna Tono Oscuro / Basalto Sombrío)**: Fuste de basalto y sillar sombrío ~35% más oscuro (`#111419`), realces lumínicos atenuados, sombras derechas más profundas (`#020304`) y densa pátina de hollín volcánico.

#### D. Losa Rúnica de Aparición (`RESPAWN_PAD` — Bloque Tipo 11)
Cuenta con **1 sprite exclusivo** (Tile 11):
- Base de basalto oscuro (`#0b0f19`, `#131b2e`).
- Cuatro esquineros reforzados con remaches celestiales de zafiro (`#38bdf8`).
- Círculos de invocación concéntricos con glifos cardinales.
- Rosa de los vientos sagrada de 4 puntas con núcleo radiante de almas (`#f0f9ff`).
- Vinculado al sonido procedural de campanillas `SoundManager.playRespawn()`.

#### E. Magma Volcánico (`LAVA` — Bloque Tipo 7)
Cuenta con **5 sprites distintos multicapa** (Tiles 13, 16, 17, 18, 19). Para evitar patrones repetitivos en los lagos y abismos volcánicos, `VoxelMap.selectTile` distribuye deterministamente las 5 variantes mediante `hashCoord(x, y, z) % 5` (~20% de probabilidad por variante):

1. **Tile 13 (Lava 1: Magma Activo con Afluentes en Y)**: Corrientes de magma divergentes con 4 niveles térmicos concéntricos, 6 placas de basalto periféricas con microfisuras rojas y domo de gas hirviente.
2. **Tile 16 (Lava 2: Fisuras Magmáticas y Corteza Tectónica)**: Placas oscuras de enfriamiento basáltico dominantes con red de fracturas carmesí vivo y bordes al rojo vivo.
3. **Tile 17 (Lava 3: Géiseres e Incandescencia Hirviente)**: Foco de ebullición extrema con 3 domos de gas en erupción, reflejo especular esférico 3D y salpicaduras de magma proyectadas al aire.
4. **Tile 18 (Lava 4: Río Piroclástico Rápido)**: Flujo direccional en diagonal rápida con orillas escarpadas de escoria y micro-estrías de velocidad superficial.
5. **Tile 19 (Lava 5: Caldera de Fusión Hiper-Térmica)**: Vórtice térmico rotacional con núcleo solar blanco-oro hiper-caliente y ondas de calor concéntricas.

#### F. Plataforma de Salto (`JUMP_PAD` — Bloque Tipo 6)
Cuenta con **1 sprite exclusivo** (Tile 14):
- Losa de cantería reforzada con cantoneras metálicas de forja y remaches.
- Gran glifo rúnico ámbar (`#f59e0b`, `#fef08a`) en forma de chevrón ascendente con halo de energía cinética.
- Vinculado a la física de propulsión vertical ($v_y = 14.0$).

#### G. Pedestal Arcano (`PEDESTAL` — Bloque Tipo 4)
Cuenta con **1 sprite exclusivo** (Tile 15):
- Círculo rúnico arcano con estrella mística de 8 puntas (octagrama) y símbolos de protección para la base del altar.

---

## 3. Catálogo Exhaustivo de Modelos 3D

El juego incluye **6 familias de modelos 3D paramétricos** instanciados e integrados en la escena con físicas y animaciones en tiempo real:

```
                            MODELOS 3D DEL MOTOR
                                      │
     ┌──────────────┬─────────────────┼─────────────────┬──────────────┐
     ▼              ▼                 ▼                 ▼              ▼
1. AVATARES     2. COFRE          3. PUERTAS       4. PEDESTAL    5. ESCALINATA
 (5 Héroes)   (Tapa Móvil)       (2 Batientes)     (Orbe Flotante) (Losa Desliz.)
```

---

### 1. Avatares de Jugadores (5 Clases de Héroes) (`AvatarRenderer.js`)

Cada jugador cuenta con un modelo vóxel articulado a escala física de **$1.8$ metros de altura**:

#### Esqueleto Base Común (Geometrías Compartidas)
* **Cabeza** ($0.50 \times 0.50 \times 0.50$ m): Cubo con textura procedural de rostro de $64 \times 64$ px (ojos oscuros, boca y tono de piel).
* **Torso** ($0.55 \times 0.65 \times 0.32$ m): Tronco con el color característico del héroe.
* **Cinturón 3D** ($0.59 \times 0.12 \times 0.36$ m): Cintura modelada 20 mm hacia el exterior para evitar parpadeos de caras coplanares (*Z-fighting*).
* **Brazo Izquierdo y Derecho** ($0.18 \times 0.62 \times 0.20$ m): Articulados con pivote de rotación en los hombros.
* **Pierna Izquierda y Derecha** ($0.22 \times 0.75 \times 0.24$ m): Articuladas con pivote en la cadera para ciclo de marcha.
* **Nametag 3D**: Placa flotante en billboard con el nombre del jugador y fondo translúcido.

#### Equipamiento y Accesorios por Clase de Héroe
1. **Paladín (`paladin`)**:
   - Yelmo plateado de acero pulido ($0.54 \times 0.22 \times 0.54$ m).
   - Cresta superior de crin escarlata ($0.09 \times 0.20 \times 0.44$ m).
   - Dos hombreras semiesféricas (`SphereGeometry`).
   - Escudo heráldico en antebrazo izquierdo con cantos biselados en oro y umbo central semiesférico que oscila con el balanceo del brazo.
2. **Explorador (`ranger`)**:
   - Capucha verde bosque con corona protectora y faldón posterior hasta la nuca.
   - Capa de paño élfico a la espalda con caída vertical.
   - Carcaj de cuero en el hombro derecho con astiles de flecha y plumas blancas de vuelo.
3. **Hechicero (`wizard`)**:
   - Sombrero cónico puntiagudo de ala ancha con doble sección.
   - Báculo arcano de madera en mano derecha rematado con cristal místico octaédrico de emisión luminosa.
4. **Guardián (`guardian`)**:
   - Gran yelmo cerrado de placas de hierro oscuro con hendidura de visera.
   - Hombreras de combate masivas con escuadras de protección para el cuello.
5. **Aventurero (`adventurer`)**:
   - Modelo base ligero con cinchas de cuero y túnica de expedición.

---

### 2. Cofre de Botín Medieval Interactivo (`ChestRenderer.js`)

Modelo articulado con cinemática física basada en muelle sub-amortiguado ($K=200$, $C=14$):

* **Cuerpo Inferior (Base)**:
  - Estructura de madera de roble con cavidad interior hueca de 18 cm de profundidad.
  - Textura SVG procedural de $256 \times 256$ px con 4 tablones, nudos y clavos forjados.
  - Plinto perimetral inferior de hierro forjado.
  - Dos bandas metálicas verticales de refuerzo.
  - Cuatro cantoneras angulares en las esquinas.
  - Dos asas laterales de transporte con anillas toroidales (`TorusGeometry`) y monturas de perno.
  - Placa de cerradura y ojo de cerradura cilíndrico de oro macizo.
* **Tapa Abovedada Móvil**:
  - Tapa semicilíndrica de madera de roble curvada (`CylinderGeometry` con arco de $180^\circ$).
  - Herrajes arqueados de forja (`openEnded=true` para evitar Z-fighting en caras laterales).
  - Cerrojo frontal colgante (*hasp*) que desciende sobre la cerradura.
  - Eje de rotación posterior con apertura hasta $1.48$ radianes (~$85^\circ$) con rebote elástico.
* **Tesoro Interior 3D**:
  - Montículo de monedas de oro poligonal (`DodecahedronGeometry` escalado).
  - Tres gemas preciosas talladas independientes: Zafiro rúnico azul, Rubí ancestral carmesí y Esmeralda profunda.
  - Luz puntual dorada de 3.0 lúmenes que ilumina el entorno al abrirse.

---

### 3. Puertas de Doble Hoja de Mazmorra (`DoorRenderer.js`)

Conjunto de dos hojas batientes 3D independientes que cubren un vano de $2.0 \times 2.0$ metros:

* **Estructura de las Hojas**:
  - Dos paneles macizos de roble de 12 cm de espesor ($1.0 \times 1.98 \times 0.12$ m cada una).
  - Textura SVG procedural de $256 \times 512$ px con 4 tablones verticales y juntas de mortero.
* **Herrajes de Seguridad de Forja**:
  - Dos bandas horizontales de refuerzo de 9 cm de alto por hoja.
  - Caja de cerradura de hierro central.
  - Pomos esféricos de forja (`SphereGeometry`) tanto en la cara frontal exterior como en la interior.
* **Cinemática**:
  - Pivotes en los quicios exteriores ($x = 11.0$ y $x = 13.0$).
  - Apertura hacia el interior mediante resorte dinámico ($K=240$, $C=20$) a $1.48$ radianes (~$85^\circ$) con micro-rebote contra el sillar de contención.

---

### 4. Altar Ancestral / Pedestal Arcano (`PedestalRenderer.js`)

Monumento ceremonial con orbe en suspensión y efectos visuales shader:

* **Basamento Arquitectónico**:
  - Zócalo de cantería de 2 peldaños escalonados ($1.0$ m y $0.8$ m).
  - Fuste monolítico ahusado de 4 caras (`CylinderGeometry` de 4 segmentos girado $45^\circ$).
  - Collar de forja, losa de coronación y filete decorativo dorado perimetral.
* **Runa Solar Dinámica**:
  - Disco rúnico central de 24 segmentos y anillo circundante que giran en sentidos opuestos.
* **Orbe / Cristal Reliquia**:
  - Cristal tallado en octaedro (`OctahedronGeometry`) suspendido a $1.95$ m de altura.
  - Animación continua con rotación biaxial y levitación vertical armónica trigonométrica ($\sin / \cos$).
* **VFX y Luces**:
  - Sistema de 36 partículas 3D de ascuas mágicas en levitación continua (`PointsMaterial`).
  - Luz puntual dinámica con 3 temas según la mazmorra: Dorado clásico (`#fbbf24`), Brasa volcánica (`#fb9235`) y Amatista abisal (`#a78bfa`).

---

### 5. Escalinata de Descenso Ceremonial (`StairsRenderer.js`)

Mecanismo interactivo de descenso entre pisos de la mazmorra:

* **Losa de Cierre Corrediza**:
  - Bloque pétreo de $2.0 \times 3.0$ metros con base de piedra oscura.
  - Tres bandas transversales de hierro forjado.
  - Cuatro bajorrelieves rúnicos dorados.
* **Peldaños 3D de Piedra**:
  - Tramo de escalones de cantería modelados que descienden en espiral por la fosa hasta $y = -8$.
* **Cinemática de Apertura**:
  - Máquina de estados: Fase 1 de temblor telúrico sísmico estocástico (0.5 s) $\to$ Fase 2 de deslizamiento horizontal suave de $2.6$ metros (1.4 s).
* **Atmósfera y Niebla**:
  - Sistema de 24 partículas 3D de niebla ascendente (`Points`).
  - Fuente de luz brasienta naranja en el pozo profundo ($y = -4.2$).

---

### 6. Malla de Vóxeles del Escenario (`VoxelMap.js`)

* **Geometría Base**: `THREE.BoxGeometry(1, 1, 1)` reutilizada en un único `THREE.InstancedMesh`.
* **Capacidad Máxima**: Hasta 13,824 instancias de bloques por nivel ($24 \times 16 \times 36$ m).
* **Buffer Atributo `atlasOffset`**: Vector bidimensional `(u, v)` de 2 componentes por instancia inyectado en el vertex shader para mapear cualquier bloque a uno de los 23 sprites activos del Texture Atlas en tiempo constante sin llamadas adicionales a la GPU.

---

## 4. Tabla Resumen y Métricas de Rendimiento

| Subsistema / Elemento | Tipo de Entidad | N.º Variantes | Geometría / Primitivas | Draw Calls Estimadas |
| :--- | :--- | :---: | :--- | :---: |
| **Texture Atlas Procedural** | Textura SVG 512x1024 | **23 Sprites Activos** | 32 casillas (4x8) de 128x128 px | 0 (Memoria Textura) |
| **Mundo Vóxel (`VoxelMap`)** | `InstancedMesh` | **1 Malla global** | Cubos $1 \times 1 \times 1$ m | **1** |
| **Avatares de Jugadores** | Modelos 3D Vóxel | **5 Clases** | 6 piezas base + kits de clase | **1 - 3** por jugador |
| **Cofre de Botín** | Modelo 3D Articulado | **1 Modelo completo** | Base hueca + tapa arco + gemas | **2 - 3** por cofre |
| **Puertas de Mazmorra** | Modelo 3D Articulado | **2 Hojas** | Madera 4 tablones + forja | **2** por puerta |
| **Altar Ancestral** | Modelo 3D con VFX | **1 Monumento** | Zócalo + fuste + orbe + ascuas | **4** por altar |
| **Escalinata de Descenso** | Modelo 3D Mecánico | **1 Sistema** | Losa corrediza + peldaños + niebla | **3** por escalinata |

### Conclusión Técnica
La combinación de **23 sprites procedurales activos** (incluyendo paletas completas de 5 variantes para muros, suelos, lava volcánica y pilares) en un atlas único junto a **11 modelos 3D especializados** permite renderizar una mazmorra multijugador con alta riqueza estética, cinemática física y respuesta táctil, manteniendo el total de Draw Calls entre **20 y 35**, cumpliendo con holgura los presupuestos de hardware móvil a 60 cuadros por segundo.
