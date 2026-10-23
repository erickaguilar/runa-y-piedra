# 33. Armería Ancestral Canónica: Lore de las Armas de los Primeros Constructores, Modelado 3D Vóxel, Posturas de Guardia y Viewmodel en 1ª Persona

> [!NOTE]
> Este documento técnico y mitológico establece el canon oficial de las cinco armas arquetípicas empuñadas por las Órdenes de *Runa y Piedra*, su trasfondo narrativo en la pacificación de la mazmorra, la arquitectura 3D vóxel procedural (`heroWeapons.js`), la corrección anatómica de empuñadura diestra en tercera persona y la implementación del viewmodel ergonómico en primera persona (`FirstPersonWeaponRenderer.js`).

---

## 1. El Mito de las Cinco Armas de los Primeros Constructores

### 1.1. La Forja en las Profundidades del Magma Primigenio
Cuando los **Primeros Constructores** erigieron los diez capítulos de la expedición subterránea, comprendieron que la piedra misma poseía memoria y peso telúrico. Para mantener el equilibrio frente a las fuerzas caóticas del núcleo volcánico y consagrar las cámaras de prueba, los artífices no moldearon herramientas corrientes: en las fraguas de caliza blanca del Capítulo 1 (*Cripta Ancestral*) y las vetas de amatista del Capítulo 2 (*Altar de las Sombras*), forjaron **Cinco Reliquias Bélicas Fundacionales**, cada una sintonizada con el espíritu y la fisonomía de una clase heroica:

```
                            [ EL PACTO MINERAL ]
                                     │
         ┌──────────────┬────────────┼────────────┬──────────────┐
         ▼              ▼            ▼            ▼              ▼
    🧭 Aventurero   🛡️ Paladín   🪶 Explorador 🪄 Hechicero   👑 Guardián
    Espada Ligera   Mandoble     Arco Rúnico   Báculo Arcano  Mazo Sísmico
    de Explorador   de la Luz    del Viento    del Rayo       de Basalto
```

### 1.2. Crónica Canónica de cada Arma

#### 1. 🧭 Espada de Explorador (*Pathfinder's Blade*) — Clase Aventurero
* **Origen Legendario:** Forjada con acero plegado de cantera y guarnecida con latón solar pulido. Es un arma balanceada, nacida no para la matanza ciega, sino para la supervivencia en corredores estrechos, el desvío de estalagmitas y la estocada quirúrgica a los puntos débiles de los autómatas.
* **Propiedades Telúricas:** Su hoja templada vibra suavemente al aproximarse a mecanismos ocultos o losas de presión selladas.
* **Mano y Porte:** Empuñada firmemente con la **mano derecha**, apuntando al frente con una inclinación ascendente de $45^\circ$. Su agilidad permite al Aventurero encadenar estocadas rápidas a $1.8\text{ golpes/s}$ con costo estaminal mínimo.

#### 2. 🛡️ Mandoble de la Luz y Escudo Sagrado (*Greatsword of the Dawn & Bulwark*) — Clase Paladín
* **Origen Legendario:** Una inmensa espada de dos manos forjada con plata estelar y una acanaladura central impregnada con la bendición del *Cáliz Sagrado Dorado* (Altar del Capítulo 1). Su contraparte es el *Escudo del Sagrado Corazón*, una losa heráldica de acero templado y cruz de oro reforzada para resistir los embates de bestias colosales.
* **Propiedades Telúricas:** El mandoble no corta por filo ordinario: su masa y resonancia áurea resquebrajan los núcleos de energía ámbar de los constructos de basalto.
* **Mano y Porte:** El Paladín empuña el mandoble en su **mano derecha** en ángulo de guardia alta de $36^\circ$, mientras sujeta el escudo defensivo en su **antebrazo izquierdo**, manteniendo siempre el blasón áureo orientado hacia el invasor.

#### 3. 🪶 Arco Rúnico del Viento (*Gale Rune Bow*) — Clase Explorador
* **Origen Legendario:** Construido a partir de raíces fosilizadas de árboles subterráneos que crecieron junto a los torrentes del Capítulo 3, unidas por gemas de esmeralda viva. Su cuerda no está hecha de cáñamo, sino de filamentos de lino rúnico trenzados bajo agua bendita.
* **Propiedades Telúricas:** Al tensar la cuerda, la fricción genera proyectiles de energía cinética pura que vuelan en trayectoria parabólica sin necesidad de carcaj físico.
* **Mano y Porte:** El Explorador empuña el arco verticalmente en su **mano derecha** con una inclinación ergonómica de $15^\circ$, con la curvatura de las palas empujando hacia el enemigo ($+Z$) y la cuerda tensa orientada hacia el torso del tirador ($-Z$).

#### 4. 🪄 Báculo de Rayo Arcano y Grimorio (*Arcane Lightning Staff & Grimoire*) — Clase Hechicero
* **Origen Legendario:** Un bastón de roble nudoso oscuro rematado por un anillo ceremonial de latón que suspende en levitación un cristal octaédrico amatista, extraído de las fisuras del Abismo del Capítulo 2. En el cinto reposa el *Grimorio de Sellos Antiguos*, forrado en cuero carmesí y cerrado por hebillas de latón.
* **Propiedades Telúricas:** El cristal octaédrico canaliza el *Hálito de la Piedra Hendida*, purificándolo en orbes esféricos de plasma violeta que perforan formaciones enemigas a distancia.
* **Mano y Porte:** El Hechicero sostiene el báculo en su **mano derecha** listo para canalizar encantamientos, mientras el grimorio permanece asegurado en la **cadera izquierda** opuesta al arma, balanceando el centro de gravedad del avatar.

#### 5. 👑 Mazo Sísmico de Basalto (*Seismic Basalt Sledge*) — Clase Guardián
* **Origen Legendario:** Tallado directamente de un bloque monolítico de basalto negro volcánico por los titanes que erigieron los cimientos de la mazmorra. Su cabeza está coronada por una púa frontal de hierro sombrío y grabada con runas solares de topacio que emiten un resplandor ígneo continuo.
* **Propiedades Telúricas:** Cada impacto en el suelo transfiere ondas vibratorias a través de la cantería, aturdiendo a las alimañas que se desplazan a ras de tierra como los *Escarabajos de Obsidiana*.
* **Mano y Porte:** Empuñado en la **mano derecha** con la púa perforadora orientada al frente ($+Z$) y la cabeza masiva inclinada $45^\circ$, listo para descargar su peso con un barrido demoledor.

---

## 2. Especificación Técnica de Geometrías y Materiales 3D

El módulo [`heroWeapons.js`](file:///data/data/com.termux/files/home/develop/runa-y-piedra/src/render/models/heroes/heroWeapons.js) centraliza la fabricación 3D de todo el arsenal, garantizando consistencia estética y optimización móvil extrema:

```
                          ┌──────────────────────────┐
                          │   heroWeapons.js (SRP)   │
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
  getWeaponGeoCache()          getWeaponMatCache()        buildHeroWeaponMesh()
  (22 Geometrías Box/Cyl)     (12 Materiales Lambert/Std)  (Instanciación y Grupos)
           │                            │                            │
           └────────────────────────────┴────────────────────────────┘
                                        │
                          [ userData.isShared = true ]
                           (Cero Garbage Collection)
```

### 2.1. Desglose de Geometrías por Arma

| Arma | Componentes 3D | Dimensiones Vóxel ($X, Y, Z$) | Geometría Three.js |
| :--- | :--- | :--- | :--- |
| **Espada de Explorador** | Hoja<br>Guarda<br>Empuñadura<br>Pomo | $0.06 \times 0.58 \times 0.025\text{ m}$<br>$0.18 \times 0.035 \times 0.045\text{ m}$<br>$0.035 \times 0.14 \times 0.035\text{ m}$<br>$0.055 \times 0.04 \times 0.045\text{ m}$ | `BoxGeometry`<br>`BoxGeometry`<br>`BoxGeometry`<br>`BoxGeometry` |
| **Mandoble de la Luz** | Hoja Principal<br>Acanaladura Solar<br>Gavilanes / Guarda<br>Empuñadura<br>Pomo Octogonal | $0.12 \times 0.92 \times 0.035\text{ m}$<br>$0.03 \times 0.82 \times 0.04\text{ m}$<br>$0.32 \times 0.05 \times 0.06\text{ m}$<br>$0.04 \times 0.22 \times 0.04\text{ m}$<br>$0.07 \times 0.06 \times 0.06\text{ m}$ | `BoxGeometry`<br>`BoxGeometry`<br>`BoxGeometry`<br>`BoxGeometry`<br>`BoxGeometry` |
| **Arco Rúnico del Viento** | Empuñadura de Cuero<br>Palas Superiores/Inferiores<br>Puntas Reforzadas<br>Cuerda de Lino | $0.04 \times 0.12 \times 0.05\text{ m}$<br>$0.035 \times 0.36 \times 0.035\text{ m}$<br>$0.03 \times 0.18 \times 0.03\text{ m}$<br>$r=0.005\text{ m}, h=0.98\text{ m}$ | `BoxGeometry`<br>`BoxGeometry` ($\pm 0.24\text{ rad}$)<br>`BoxGeometry` ($\pm 0.65\text{ rad}$)<br>`CylinderGeometry` (4 caras) |
| **Báculo de Rayo Arcano** | Asta de Ébano<br>Anillo Ceremonial<br>Cristal Amatista Primario<br>Núcleo Resonante Interior | $r=0.024\text{ m}, h=1.15\text{ m}$<br>$r=0.05\text{ m}, h=0.04\text{ m}$<br>$r=0.10\text{ m}$<br>$r=0.05\text{ m}$ | `CylinderGeometry` (6 caras)<br>`CylinderGeometry` (6 caras)<br>`OctahedronGeometry`<br>`OctahedronGeometry` |
| **Mazo Sísmico de Basalto** | Mango de Roble Acorazado<br>Cabeza de Basalto<br>Banda Rúnica de Oro<br>Púa de Hierro Sombrío | $r=0.03\text{ m}, h=0.76\text{ m}$<br>$0.22 \times 0.20 \times 0.32\text{ m}$<br>$0.23 \times 0.14 \times 0.18\text{ m}$<br>$r=0.07\text{ m}, h=0.12\text{ m}$ | `CylinderGeometry` (6 caras)<br>`BoxGeometry`<br>`BoxGeometry`<br>`ConeGeometry` (4 caras) |

### 2.2. Gestión de Memoria y Ciclo de Vida (Zero-GC)
Para cumplir con los guardarraíles de rendimiento en dispositivos móviles:
1. **Singleton Caches**: `_weaponGeoCache` y `_weaponMatCache` se instancian de manera perezosa una sola vez y se reutilizan indefinidamente entre todos los avatares y la cámara.
2. **Bandera de Seguridad `isShared`**: Todas las mallas y materiales portan `userData = { isShared: true }`, previniendo que destructores genéricos de Three.js llamen inadvertidamente a `.dispose()` sobre recursos en uso.
3. **Liberación Controlada**: La función `disposeWeaponCache()` queda enlazada al ciclo global `disposeHeroGearCaches()` para pruebas unitarias y reinicio del contexto WebGL.

---

## 3. Cinemática y Corrección Anatómica de Empuñadura en 3ª Persona

### 3.1. La Paradoja de los Ejes y la Inversión de Brazos
En la arquitectura de avatares de *Runa y Piedra*:
* El frente del cuerpo (cara, ojos y pecho) se proyecta sobre el eje local $+Z$.
* La espalda se proyecta sobre el eje local $-Z$.
* Al jugar en tercera persona, la cámara se posiciona detrás de la espalda del avatar mirando hacia adelante. Para alinear el avance del jugador con el mundo físico, el avatar rota 180° sobre el eje Y:
  $$\text{rotation.y} = \text{yaw} + \pi$$

Esta rotación invierte la proyección horizontal:
* El pivote local $X = +0.30$ rota a $X_{\text{mundo}} = -0.30$ (**lado izquierdo** de la pantalla del jugador).
* El pivote local $X = -0.30$ rota a $X_{\text{mundo}} = +0.30$ (**lado derecho** de la pantalla del jugador).

Por tanto, para que el arma sea empuñada en la **mano derecha del héroe** ante los ojos del jugador y en las partidas multijugador, **el arma debe montarse obligatoriamente en `armLPivot` ($X = -0.30$)**:

```
                       [ VISTA POSTERIOR (3ª PERSONA) ]
                                 CABEZA
                                ┌───────┐
                                │       │
                        BRAZO   └───────┘   BRAZO
                      IZQUIERDO   TORSO    DERECHO
                     (armRPivot) ┌─────┐ (armLPivot)
                        [ X ]    │     │    [⚔️]
                     (x = -0.30) └─────┘ (x = +0.30)
                                 PIERNAS
                                 │     │
```

### 3.2. Vector de Postura Frontal vs. Inversión Retraída
Originalmente, las armas se encontraban rotadas con ángulos negativos en X (`-Math.PI / 4`), lo que provocaba que el filo y las puntas apuntaran hacia la espalda del personaje. La corrección implementada establece rotaciones positivas en X que proyectan las armas hacia adelante:

* **Espada de Explorador**: `rotation.set(Math.PI / 4, 0, 0)` $\to$ Punta orientada hacia $+Z$ y $+Y$.
* **Mandoble de la Luz**: `rotation.set(Math.PI / 5, 0, 0)` $\to$ Hoja colosal en guardia alta frontal.
* **Mazo de Basalto**: `rotation.set(Math.PI / 4, 0, 0)` $\to$ Púa perforadora apuntando al agresor.
* **Arco del Viento**: `rotation.set(Math.PI / 12, 0, -Math.PI / 16)` $\to$ Empuñado listo para tensar.

---

## 4. Viewmodel Ergonómico en Primera Persona (`FirstPersonWeaponRenderer`)

Para que el jugador experimente la sensación de empuñar su arma en todo momento sin obstruir el campo de visión central de la mazmorra, [`FirstPersonWeaponRenderer.js`](file:///data/data/com.termux/files/home/develop/runa-y-piedra/src/render/FirstPersonWeaponRenderer.js) ancla un nodo 3D directo a la cámara de Three.js:

```
  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │                         +                                   │
  │                    (Crosshair)                              │
  │                                                             │
  │                                                             │
  │                                              [Arma 3D]      │
  │                                              / (Viewmodel)  │
  │                                             /               │
  │                                           [🖐️] Mano Der.    │
  └─────────────────────────────────────────────────────────────┘
```

### 4.1. Calibración Ergonómica por Clase (`FP_CONFIGS`)
Cada arma posee un centro de gravedad, silueta y longitud únicos. El renderer aplica automáticamente la configuración óptica correspondiente:

```javascript
const FP_CONFIGS = {
  // Espada: filo inclinado 43° al frente, guardia visible abajo a la derecha
  adventurer: { pos: [0.30, -0.26, -0.54], rot: [-0.75, -0.22, 0.12], scale: 0.72 },

  // Mandoble: gran hoja plateada proyectada hacia el centro superior
  paladin:    { pos: [0.32, -0.28, -0.58], rot: [-0.70, -0.25, 0.10], scale: 0.65 },

  // Arco: montura vertical, madera apuntando al túnel y cuerda orientada al jugador
  ranger:     { pos: [0.28, -0.22, -0.50], rot: [-0.15, Math.PI - 0.20, 0.15], scale: 0.70 },

  // Báculo: asta retraída y cristal amatista flotando iluminando el sector derecho
  wizard:     { pos: [0.32, -0.32, -0.55], rot: [-0.65, -0.20, 0.08], scale: 0.62 },

  // Mazo: cabeza de basalto inclinada lista para golpe descendente
  guardian:   { pos: [0.30, -0.26, -0.52], rot: [-0.70, -0.24, 0.12], scale: 0.68 },
};
```

### 4.2. Control de Visibilidad y Rendimiento en Render Loop
* En [`AppBootstrapMixin.js`](file:///data/data/com.termux/files/home/develop/runa-y-piedra/src/core/AppBootstrapMixin.js):
  - Cuando `cameraMode === 'first'`, se activa `fpWeaponRenderer.setVisible(true)` y se oculta la malla del avatar propio para evitar auto-colisión visual.
  - Cuando `cameraMode === 'third'`, el viewmodel de primera persona se oculta instantáneamente (`setVisible(false)`) y el avatar completo con su arma se renderiza en tercera persona.
  - Al alternar ranuras o cambiar de héroe, `setHero()` verifica si el ID coincide antes de instanciar mallas nuevas, logrando **cero recolecciones de basura durante el juego**.

---

## 5. Matriz de Combate PvE: Armas vs. Bestiario

La siguiente tabla sintetiza la interacción táctica entre las armas ancestrales y los enemigos del bestiario:

| Héroe | Arma Canónica | Tipo de Impacto | Cadencia / Rango | Efectividad Táctica Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Aventurero** | Espada de Explorador | Físico Cortante | $1.8\text{ Hz}$ / $1.8\text{ m}$ | Interrupción rápida de ataques telegrafiados en *Gólems de Cascotes* y *Sombras Acechantes*. |
| **Paladín** | Mandoble de la Luz | Sagrado Contundente | $1.0\text{ Hz}$ / $2.5\text{ m}$ | Barrido horizontal amplio; destruye enjambres de *Escarabajos de Obsidiana* de un solo golpe. |
| **Explorador** | Arco Rúnico del Viento | Perforante Rúnico | $1.2\text{ Hz}$ / $12.0\text{ m}$ | Eliminación segura de tiradores lejanos como la *Gárgola Cenicienta* antes de que lancen orbes de fuego. |
| **Hechicero** | Báculo de Rayo Arcano | Plasma Arcano Penetrado| $1.1\text{ Hz}$ / $10.0\text{ m}$ | Proyectiles penetrantes que atraviesan las corazas de basalto del *Centinela Férreo*. |
| **Guardián** | Mazo Sísmico de Basalto | Sísmico de Choque | $0.9\text{ Hz}$ / $2.0\text{ m}$ | Máximo retroceso (*Knockback* $\times 1.8$); arroja a los enemigos élite a las fosas de lava. |
