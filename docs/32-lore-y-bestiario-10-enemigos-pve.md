# 32. Lore Unificado y Bestiario PvE: 10 Enemigos, 5 Dificultades, Escalado y Balanceo

> [!NOTE]
> Este documento técnico y narrativo establece la mitología del combate en *Runa y Piedra*, el catálogo canónico de los 10 primeros enemigos distribuidos en 5 niveles de dificultad, las reglas de arquitectura para incrementar el número y tipos de enemigos, y las directrices precisas de balanceo y ajuste numérico previo a la implementación de código.

---

## 1. Lore Unificado: *"El Despertar de la Piedra Hendida"*

### 1.1. La Paz Mineral y el Pacto de los Primeros Constructores
Durante incontables eras, las cámaras subterráneas, criptas y templos de la mazmorra reposaron en un letargo sagrado. Los **Primeros Constructores** diseñaron los diez capítulos de la expedición no como tumbas mortuorias, sino como una prueba de temple para las Cinco Órdenes Rúnicas:
- 🧭 **Aventurero** (Instinto y exploración)
- 🛡️ **Paladín** (Vanguardia y protección)
- 🪶 **Explorador** (Agilidad y velocidad)
- 🪄 **Hechicero** (Dominio gravitatorio y arcano)
- 👑 **Guardián** (Estabilidad y firmeza monolítica)

Cada sala fue sellada con compuertas de basalto de $2 \times 2$, losas de presión y altares ceremoniales con orbes flotantes. La piedra dormía en equilibrio gracias al flujo armónico de las runas celestiales.

### 1.2. La Ruptura del Velo y el Hálito de la Piedra Hendida
A medida que las incursiones alcanzaron los niveles más profundos (las corrientes torrenciales del Capítulo 3 y la proximidad con el *Núcleo del Titán Rúnico*), los sellos milenarios sufrieron una microfisura tectónica. De estas grietas brotó una radiación telúrica corrupta conocida como **El Hálito de la Piedra Hendida** (*Cleft-Blight*).

Esta energía no es nigromancia orgánica tradicional, sino la propia roca, la obsidiana y el magma primigenio cobrando una consciencia hostil y protectora:
1. **Los Autómatas Centinela**, diseñados originalmente como muñecos de entrenamiento y guardianes mecánicos por los antiguos canteros, han reinterpretado su directiva: ahora consideran a cualquier expedición viva como un invasor que debe ser erradicado.
2. **Las Esculturas y Gárgolas**, labradas en los muros de basalto para honrar a las órdenes primitivas, han abierto ojos incandescentes y desprendido sus garras de la cantería.
3. **El Polvo Mineral y los Ecos de Héroes Caídos**, aglomerados por la fricción del sillar, han dado forma a apariciones de piedra hueca y esqueletos revestidos de caliza.

### 1.3. La Misión de Purificación de los Héroes y el Despertar de las Armas
Para consagrar los altares y permitir que las escalinatas ceremoniales desciendan con seguridad hacia el siguiente capítulo, **los héroes ya no pueden limitarse a esquivar fosas y resolver cerraduras**: deben desenvainar sus armas ancestrales forjadas por los Primeros Constructores (detalladas en [33. Armería Ancestral Canónica](./33-armeria-canonica-lore-y-modelado-de-armas.md)) para doblegar a las entidades corrompidas, restaurando la pureza mineral de la mazmorra:
* 🧭 **La Espada de Explorador** interrumpe los golpes telegrafiados lentos de los autómatas.
* 🛡️ **El Mandoble de la Luz y Escudo Sagrado** barren enjambres y disipan la corrupción de sombra.
* 🪶 **El Arco Rúnico del Viento** abate voladores y centinelas a distancia antes de que activen sus trampas.
* 🪄 **El Báculo de Rayo Arcano** perfora corazas pétreas densas con plasma amatista.
* 👑 **El Mazo Sísmico de Basalto** fractura las losas del suelo generando ondas de choque con retroceso masivo.

---

## 2. Taxonomía de las 5 Dificultades Canónicas

En consonancia con el sistema de **3 corazones de vida** de los jugadores, la dificultad de los enemigos no se basa en daño numérico inflado (todos los golpes restan entre 1 y 2 corazones como máximo), sino en la **cadencia de ataque, tiempo de anticipación (telegrafiado), patrones de evasión, agresividad espacial y necesidad de coordinación cooperativa**:

```
┌──────────────┬─────────────────────────┬─────────┬──────────────┬───────────────┬──────────────────────────┐
│ Grado        │ Clasificación           │ HP Base │ Velocidad    │ Telegrafiado  │ Comportamiento Táctico   │
├──────────────┼─────────────────────────┼─────────┼──────────────┼───────────────┼──────────────────────────┤
│ Dificultad 1 │ Autómatas Rústicos      │ 1 – 2   │ 1.8 – 3.2 m/s│ Lento (500 ms)│ Trayectoria frontal / enjambre
│ Dificultad 2 │ Hostigadores de Pasillo │ 3       │ 2.0 – 2.4 m/s│ Medio (400 ms)│ Bloqueo direccional o rango
│ Dificultad 3 │ Defensores Tácticos     │ 4 – 5   │ 1.5 – 3.0 m/s│ Rápido(350 ms)│ Explosión AoE o teletransporte
│ Dificultad 4 │ Élite del Subsuelo      │ 6 – 8   │ 2.0 – 3.8 m/s│ Mixto (300 ms)│ Resistencia knockback / emboscada
│ Dificultad 5 │ Titanes del Umbral (Boss│ 14 – 16 │ 2.2 – 3.4 m/s│ 2 Fases       │ Control de sala, ondas de choque
└──────────────┴─────────────────────────┴─────────┴──────────────┴───────────────┴──────────────────────────┘
```

---

## 3. Catálogo de los 10 Enemigos Oficiales (2 por Dificultad)

### 🟢 Dificultad 1: Autómatas Rústicos (Iniciación y Pasillos)

#### 1. Gólem de Cascotes (*Rubble Golem*)
* **Rol:** Tanque menor lento y predecible.
* **Apariencia Vóxel:** Bloques cúbicos de piedra erosionada (`FLOOR_WORN`) unidos por un núcleo de energía ámbar parpadeante.
* **Comportamiento (IA):** Avanza hacia el jugador más cercano a $1.8\text{ m/s}$. Al situarse a menos de $1.2\text{ m}$, alza su puño de piedra durante $500\text{ ms}$ emitiendo un brillo ámbar antes de impactar.
* **Estadísticas Base:** `HP: 2` | `Vel: 1.8 m/s` | `Daño: 1 ❤️` | `Cadencia: 1.2 s` | `Rango detección: 7 m`.
* **Sinergia de Combate:** Excelente para calibrar el golpe rápido del Aventurero (1 HP por golpe $\to$ eliminado en 2 estocadas) o tiro parabólico del Explorador.

#### 2. Escarabajo de Obsidiana (*Obsidian Scuttler*)
* **Rol:** Alimaña rápida de hostigamiento a ras de suelo.
* **Apariencia Vóxel:** Pequeño cuerpo cuadrangular de obsidiana negra (`#181615`) de $0.5\text{ m}$ con patas puntiagudas y ojos al rojo vivo.
* **Comportamiento (IA):** Movimiento errático en zigzag que dificulta el apuntado con flechas; realiza un salto rasante hacia los pies del héroe al estar a $1.5\text{ m}$.
* **Estadísticas Base:** `HP: 1` | `Vel: 3.2 m/s` | `Daño: 1 ❤️` | `Cadencia: 0.8 s` | `Rango detección: 6 m`.
* **Sinergia de Combate:** El barrido horizontal del Paladín o la onda de choque del Guardián los destruyen en grupo de un solo impacto.

---

### 🟡 Dificultad 2: Hostigadores de Pasadizo (Tensión Básica)

#### 3. Centinela Esquelético de Sillar (*Sillar Skirmisher*)
* **Rol:** Combatiente cuerpo a cuerpo con defensa frontal activa.
* **Apariencia Vóxel:** Esqueleto articulado de cantería grisácea portando una espada corta mellada y un broquel de madera fosilizada en su mano izquierda.
* **Comportamiento (IA):** Mantiene una guardia frontal que anula impactos de proyectiles ligeros y estocadas directas en un cono de $120^\circ$. Si el jugador retrocede, realiza una acometida de estocada.
* **Estadísticas Base:** `HP: 3` | `Vel: 2.4 m/s` | `Daño: 1 ❤️` | `Cadencia: 0.9 s` | `Rango detección: 8 m`.
* **Sinergia de Combate:** Exige juego cooperativo: un héroe atrae su atención frontal mientras otro lo golpea por la espalda; el mandoble del Paladín o el mazo del Guardián rompen su guardia frontal directamente.

#### 4. Gárgola Menor de Cantería (*Crypt Gargoyle*)
* **Rol:** Centinela aéreo con proyectil dirigido.
* **Apariencia Vóxel:** Busto alado de basalto con alas rígidas y un prisma violeta en el pecho, suspendida en el aire a $2.2\text{ m}$ sobre el suelo o fosas de lava.
* **Comportamiento (IA):** Mantiene distancia de seguridad ($4\text{ a }6\text{ m}$). Cada $2.0\text{ s}$ canaliza durante $400\text{ ms}$ y arroja una esquirla de roca que viaja en línea recta a $12\text{ m/s}$.
* **Estadísticas Base:** `HP: 3` | `Vel: 2.0 m/s (vuelo)` | `Daño: 1 ❤️` | `Proyectil: 12 m/s` | `Rango: 10 m`.
* **Sinergia de Combate:** Inalcanzable para espadas cortas a menos que el jugador salte. El arco del Explorador y los orbes del Hechicero son sus mayores amenazas.

---

### 🟠 Dificultad 3: Defensores Tácticos (Control de Sala y Magia)

#### 5. Fanático del Moho Ígneo (*Fire-Mold Zealot*)
* **Rol:** Kamikaze de daño de área y negación de terreno.
* **Apariencia Vóxel:** Humanoide encorvado cubierto de líquenes amarillos con una ampolla gigante de magma brillante en la espalda.
* **Comportamiento (IA):** Al divisar a los aventureros, corre directamente hacia el centro del grupo ($3.0\text{ m/s}$). Al morir o contactar con un héroe, entra en sobrecarga ($1\text{ s}$ de parpadeo carmesí) y explota en un radio de $2.5\text{ m}$, generando una llamarada temporal de $3\text{ s}$ en el suelo.
* **Estadísticas Base:** `HP: 4` | `Vel: 3.0 m/s` | `Daño: 1 ❤️ + Fuego de área` | `Radio explosión: 2.5 m`.
* **Sinergia de Combate:** Debe ser priorizado como objetivo a distancia por el Explorador o Hechicero antes de que alcance las líneas aliadas.

#### 6. Tejedora de Runas Corrupta (*Cleft Spellweaver*)
* **Rol:** Conjuradora de apoyo con teletransporte defensivo.
* **Apariencia Vóxel:** Figura etérea vestida con jirones de pergamino Washi negro y máscara de piedra, flotando a $0.3\text{ m}$ del suelo con un cetro rúnico.
* **Comportamiento (IA):** Si un jugador entra a su radio de proximidad ($< 2.0\text{ m}$), se disuelve en una nube de cenizas y reaparece a $5\text{ m}$ (cooldown de $4\text{ s}$). Canaliza un haz de energía que confiere un escudo de `+1 HP` temporal al enemigo más fuerte de la sala.
* **Estadísticas Base:** `HP: 4` | `Vel: 1.5 m/s` | `Teletransporte CD: 4 s` | `Daño: 1 ❤️` | `Rango: 12 m`.
* **Sinergia de Combate:** El Hechicero puede contrarrestar sus escudos con su daño en área y el Aventurero puede interceptar su posición de reaparición con saltos coordinados.

---

### 🔴 Dificultad 4: Élite del Subsuelo (Desafío Avanzado)

#### 7. Dullahan de la Forja (*Forge Ironclad*)
* **Rol:** Coloso blindado pesado inmune a retrocesos ordinarios.
* **Apariencia Vóxel:** Armadura completa de placas de hierro negro remachado, sin cabeza, con fuego interior carmesí brotando de la gola y portando un mazo de guerra monumental.
* **Comportamiento (IA):** Inmune a la fuerza de retroceso (*knockback*) de armas convencionales. Ejecuta un combo rítmico: barrido horizontal semicircular ($180^\circ$) seguido de un golpe aplastante en el suelo que genera una fisura de impacto de $2\text{ m}$.
* **Estadísticas Base:** `HP: 7` | `Vel: 2.0 m/s` | `Daño: 1 ❤️ por golpe` | `Resistencia: Inmune a stun ligero`.
* **Sinergia de Combate:** El Paladín debe bloquear su embestida con escudo mientras el Guardián descarga su *Mazo Sísmico* para desestabilizar su armadura y abrir una ventana de vulnerabilidad.

#### 8. Acechador del Vacío (*Chasm Stalker*)
* **Rol:** Emboscador que caza al jugador rezagado o aislado.
* **Apariencia Vóxel:** Cuadrúpedo biomecánico alargado tallado en obsidiana con cuatro brazos frontales en forma de hoz y ojos esmeralda.
* **Comportamiento (IA):** Permanece agazapado en el techo o cornisas altas. Calcula continuamente la dispersión de la party: si un jugador se aleja a más de $6\text{ m}$ del resto del equipo, desciende a gran velocidad ($3.8\text{ m/s}$) sobre su espalda con un golpe sorpresa.
* **Estadísticas Base:** `HP: 6` | `Vel: 3.8 m/s` | `Daño: 1 ❤️ inicial + zarpazos rápidos` | `Rango detección: 14 m`.
* **Sinergia de Combate:** Obliga al equipo a mantener la disciplina de marcha en bloque. El Explorador puede advertir su presencia aérea y el Paladín puede interponerse con su escudo.

---

### 🟣 Dificultad 5: Titanes del Umbral (Jefes de Capítulo y Clímax)

#### 9. El Coloso de Basalto Hendido (*The Cleft Behemoth*)
* **Rol:** Jefe de fuerza bruta, impacto telúrico y demolición de entorno.
* **Apariencia Vóxel:** Titán bípedo de $3.5\text{ m}$ de altura tallado en basalto oscuro con venas de lava dorada que cruzan su pecho y brazos ciclópeos.
* **Fases de Combate:**
  - **Fase 1 ($100\% - 50\%$ HP):** Golpea el suelo provocando una onda sísmica circular a ras de piso que obliga a los aventureros a saltar para evitar perder el equilibrio; arranca peñascos del suelo y los lanza a distancia en trayectoria parabólica.
  - **Fase 2 ($< 50\%$ HP - Furia de Magma):** El coloso ruge, sus fisuras se tornan rojo incandescente, su velocidad aumenta a $3.4\text{ m/s}$ y ejecuta embestidas lineales destructivas seguidas de un giro en $360^\circ$.
* **Estadísticas Base:** `HP: 14` | `Fase 1: 2.2 m/s / Fase 2: 3.4 m/s` | `Daño: 1 ❤️` | `Onda Sísmica: Radio 6 m`.
* **Sinergia Cooperativa Total:**
  1. El **Paladín** intercepta la embestida con su escudo angulado para mitigar el empuje.
  2. El **Guardián** descarga su mazo sísmico al suelo en sincronía para anular la vibración telúrica.
  3. El **Hechicero** sube a los pilares elevados con su salto para atacar desde la cota alta.
  4. El **Explorador** y el **Aventurero** atacan las fisuras débiles de lava en su espalda y tobillos.

#### 10. Aparición de la Runa Quebrada (*Void Eidolon*)
* **Rol:** Jefe espectral con escudos cinéticos orbitales y control gravitatorio.
* **Apariencia Vóxel:** Cristal piramidal flotante de cuarzo violeta coronado por tres grandes losas de basalto en rotación orbital constante a su alrededor.
* **Fases de Combate:**
  - **Fase 1 (Escudo Orbital):** Las 3 losas orbitales absorben todo impacto frontal (`2 HP` cada placa). El equipo debe posicionarse en ángulos opuestos para golpear simultáneamente las placas expuestas mientras la aparición invoca parejas de *Escarabajos de Obsidiana*.
  - **Fase 2 (Núcleo Expuesto):** Tras destruir las losas, el núcleo se eleva y desata ráfagas de proyectiles violetas en espiral descendente, activando pulsos gravitatorios que empujan periódicamente a los héroes hacia las fosas perimetrales de la sala.
* **Estadísticas Base:** `HP: 16 (10 núcleo + 3x2 placas orbitales)` | `Vel: 2.6 m/s (flotación)` | `Daño: 1 ❤️`.
* **Sinergia Cooperativa Total:** Ataque concentrado coordinado; el Hechicero neutraliza pulsos gravitatorios con su suspensión rúnica y el Explorador dispara con precisión entre los huecos de rotación de las placas.

---

## 4. Arquitectura de Escalado para Incrementar Enemigos

Para permitir que el juego pase de la sala de pruebas a mazmorras con mayor número de enemigos sin saturar la CPU móvil ni el ancho de banda P2P, se implementa una arquitectura modular de generación y gestión:

```
                                 [ LevelLoader / JSON ]
                                           │
                         ┌─────────────────┴─────────────────┐
                         ▼                                   ▼
                [ Bloques Vóxel ]                   [ EnemySpawner Nodes ]
                         │                                   │
                         │                         ┌─────────┴─────────┐
                         │                         ▼                   ▼
                         │                 [ EnemyRegistry ]    [ Dynamic Scaling ]
                         │                 - Factory por ID     - Party size (1 a 5)
                         │                 - Geometrías pooling - Dificultad sala
                         ▼                         ▼                   ▼
             [ VoxelMap (1 Draw Call) ]  ───> [ CombatEngine (Host Autoritativo) ]
                                              - AABB Collision Pool
                                              - FSM de IA ligera a 20 Hz
                                              - Mensajes WebRTC compactos
```

### 4.1. Presupuesto Móvil de Entidades Concurrentes
Para mantener **60 FPS estables** y menos de **30 Draw Calls** en smartphones estándar (3–4 GB RAM):
- **Límite Estricto de Entidades Activas Simultáneas:** Máximo **6 a 8 enemigos activos** en el campo de visión del jugador.
- **Zona de Hibernación (Culling de IA):** Enemigos a más de $20\text{ metros}$ o en salas no descubiertas se colocan en estado `DORMANT` (consumo de CPU cero: sin raycasts ni comprobaciones de proximidad).
- **Pooling Pre-asignado de Entidades:** El motor pre-asigna un array estático de 12 entidades `CombatEntity` al cargar el nivel. Jamás se hace `new Entity()` ni `delete` en caliente para asegurar **Zero-GC**.

### 4.2. Fórmula de Escalado Dinámico según la Party ($P$)
En partidas cooperativas, el aforo de héroes varía de 1 a 5 jugadores. Para mantener la tensión sin multiplicar exponencialmente las entidades en pantalla, se utiliza un escalado mixto de **Salud + Cantidad**:

$$\text{Cantidad de Enemigos Menores} = \text{baseCount} + \lfloor 0.5 \times (P - 1) \rfloor$$

$$\text{Multiplicador de HP en Jefes y Élite} = 1.0 + 0.30 \times (P - 1)$$

*Ejemplo con el Coloso de Basalto (Base 14 HP):*
- **1 Jugador (Solo):** $14\text{ HP}$ (Experiencia accesible).
- **2 Jugadores:** $14 \times 1.30 = 18.2 \approx \mathbf{18\text{ HP}}$.
- **5 Jugadores:** $14 \times (1 + 0.30 \times 4) = 14 \times 2.20 = \mathbf{31\text{ HP}}$ (Exige que los 5 jugadores ataquen coordinados).

### 4.3. Registro Declarativo de Nuevos Enemigos (`EnemyRegistry.js`)
Para incorporar nuevos monstruos a futuro, el sistema utiliza un catálogo declarativo desacoplado del motor central:
```javascript
EnemyRegistry.register('rubble_golem', {
  tier: 1,
  maxHp: 2,
  speed: 1.8,
  telegraphMs: 500,
  cooldownMs: 1200,
  modelBuilder: buildRubbleGolemMesh,
  aiType: 'melee_chase'
});
```

---

## 5. Parámetros de Calibración y Levers de Balanceo

Para ajustar y balancear los enemigos en la sala de desarrollo (`dev_combatroom`) sin alterar la estabilidad del código, se definen **palancas de ajuste numérico (tuning levers)**:

```
                                  PALANCAS DE BALANCEO
        ┌───────────────────────────────────┬───────────────────────────────────┐
        ▼                                   ▼                                   ▼
 [ TIEMPO DE TELEGRAFIADO ]          [ TIEMPO PARA MORIR (TTK) ]         [ VULNERABILIDADES DE CLASE ]
  - Ventana para esquivar/bloquear    - Golpes necesarios por clase       - Armas melee vs distancia
  - Rango: 250 ms a 700 ms            - Ajuste de HP (1 a 16)             - Escudos vs aturdimiento
```

### 5.1. Matriz de Levers y Efecto en la Experiencia de Juego

| Parámetro | Rango Operativo | Si es muy alto | Si es muy bajo | Función de Balanceo |
| :--- | :---: | :--- | :--- | :--- |
| **`telegraphMs`** (Anticipación) | $250\text{ ms} - 650\text{ ms}$ | El enemigo se vuelve trivial; da tiempo a huir sin esquivar. | El jugador siente que el daño es injusto e imposible de evitar en pantalla táctil. | **Calibración táctil:** En móviles se recomiendan $\ge 400\text{ ms}$ para compensar latencia de respuesta del pulgar. |
| **`cooldownMs`** (Recuperación) | $800\text{ ms} - 2500\text{ ms}$ | El enemigo queda indefenso demasiado tiempo tras fallar. | El enemigo ataca continuamente sin dejar espacio al contraataque. | Define la ventana de castigo tras esquivar la acometida. |
| **`knockbackFactor`** (Retroceso) | $0.0 - 3.0$ | Los enemigos caen a la lava con facilidad excesiva. | Las clases melee sufren daño inevitable por superposición de hitboxes. | Permite que el Paladín mantenga la línea y el Guardián controle el espacio. |
| **`aggroRange`** (Radio de visión) | $5.0\text{ m} - 16.0\text{ m}$ | Múltiples salas se activan a la vez sobrecargando al jugador. | El enemigo ignora al jugador hasta que está encima. | Evita hordas accidentales al cruzar puertas. |
| **`invulnAfterHitTicks`** | $6 - 20\text{ ticks}$ | El enemigo parece invulnerable y los combos se pierden. | Permite matar enemigos instantáneamente con ataques continuos (spam). | Garantiza legibilidad visual y evita daño accidental duplicado. |

### 5.2. Reglas de Ajuste según Datos de Prueba en `dev_combatroom`

1. **Si una clase a distancia (Explorador / Hechicero) trivializa los encuentros:**
   - Incrementar la velocidad de desplazamiento de hostigadores menores (`speed` de $2.4 \to 2.8\text{ m/s}$).
   - Dotar a ciertos enemigos de saltos de evasión o escudos de sillar frontal (como el *Centinela Esquelético*).
2. **Si las clases cuerpo a cuerpo (Aventurero / Paladín) sufren demasiado daño:**
   - Aumentar el retroceso recibido por el enemigo al ser golpeado (`knockbackFactor` $+20\%$).
   - Aumentar la ventana de telegrafiado antes del golpe enemigo ($+100\text{ ms}$).
3. **Si el ritmo de combate resulta lento:**
   - Reducir el HP de enemigos comunes a 1–2 golpes precisos.
   - Aumentar la cantidad de enemigos simultáneos de 2 a 4 para fomentar combate dinámico de control de masas en lugar de esponjas de daño.

---

## 6. Hoja de Ruta de Integración Técnica

1. **Documentación (Completada):**
   - [`docs/31-sala-de-combate-dev-y-mecanica-hibrida-pve.md`](./31-sala-de-combate-dev-y-mecanica-hibrida-pve.md): Especificación de `dev_combatroom`, botón `ATACAR` y armas de las 5 clases.
   - [`docs/32-lore-y-bestiario-10-enemigos-pve.md`](./32-lore-y-bestiario-10-enemigos-pve.md): Lore unificado, 10 enemigos, 5 dificultades, fórmulas de escalado y matriz de balanceo.
2. **Fase 1 de Código (Sandbox Base):**
   - Nivel `dev_combatroom.json` con los 3 sectores (Armería, Blancos Estáticos, Arena Activa).
   - Botón `ATACAR` en HUD móvil e integración con `InputManager.js`.
3. **Fase 2 de Código (Armas y Dummies):**
   - Resolución de ataques de clase en `SimulationEngine.js` y prueba contra blancos de entrenamiento estáticos.
4. **Fase 3 de Código (Enemigos Iniciales de Prueba):**
   - Implementación de los 2 primeros enemigos rústicos (Gólem de Cascotes y Escarabajo) con máquina de estados finita ligera y pooling Zero-GC.
