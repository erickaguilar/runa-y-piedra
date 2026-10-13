# 26. Arquitectura de Altares por Capítulo y Separación Mecánica de Escalinatas

Este documento formaliza la separación conceptual, arquitectónica y jugable entre la **Losa de Escalinata Ancestral** (progresión vertical entre mazmorras) y los **Altares Rúnicos Temáticos por Capítulo** (consagración, clímax de expedición y utilidades de campamento).

---

## 1. Desacoplamiento Fundamental: Losa vs. Altar

Históricamente, existía una ambigüedad donde se asumía que el altar clásico servía para abrir la escalinata. En la arquitectura canónica de *Runa y Piedra*, ambos sistemas están **totalmente desacoplados**:

```
                               MECÁNICAS DE INTERACCIÓN
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
         ESCALINATA ANCESTRAL                             ALTARES Y MONOLITOS
     (Losa Sellada en el Suelo)                        (Props 3D de Coronación)
                  │                                               │
    - Tipo: `stairs`                                - Tipo: `pedestal` / `monolith`
    - Rol: Avance entre salas/mazmorras             - Rol: Culminación de capítulo o utilidad
    - Ubicación: Mazmorras intermedias              - Ubicación: Mazmorras clímax o Lobby
    - Interacción: Sobre la losa de piso            - Interacción: Radio de consagración 3D
    - Efecto: Abre fosa física (y=-8)               - Efecto: Victoria de campaña / Tienda / Atlas
```

---

## 2. Funcionamiento Autoritativo de la Escalinata (`StairsRenderer` / `DescentManager`)

La escalinata es el mecanismo de **tránsito vertical descendente** que conecta las distintas profundidades de un capítulo (por ejemplo, de la mazmorra 1 a la 2).

### A. Ciclo de Vida y Estados
1. **Losa Sellada (`openFromStart: false`)**:
   - En el archivo JSON del nivel se define un área rectangular de bloques de piso:
     ```json
     "stairs": { "x1": 11, "x2": 12, "z1": 31, "z2": 33, "openFromStart": false }
     ```
   - El suelo es físicamente sólido. La mira contextual del jugador indica: `[E] Abrir Escalinata Ancestral`.

2. **Ceremonia de Apertura (`openStairsCeremony`)**:
   - Al pulsar la tecla de acción, el Host valida la distancia ($\le 3.2\text{ m}$) y emite el opcode `STAIRS_OPEN` (`0x0A`).
   - `SoundManager` reproduce el chirrido de piedra pesada `playSlabGrind()`.
   - Se retiran los bloques de piso y se cava dinámicamente la fosa (`applyStairPit`, de $y=0$ hasta $y=-8$).
   - `StairsRenderer` anima el retroceso de la losa superior y genera peldaños en espiral hacia la oscuridad junto con partículas de niebla profunda (`tintStairPit`).

3. **Sensor de Descenso y Teletransporte**:
   - Al bajar por la fosa ($y < -2.0$), [`DescentManager.js`](file:///data/data/com.termux/files/home/develop/runa-y-piedra/src/controllers/DescentManager.js) detecta la presencia del grupo.
   - Dispara una cuenta atrás sincronizada de 5 segundos con aviso visual unificado en el HUD (`showDescentCard`).
   - Al expirar, toda la expedición es transportada al `spawn` de la siguiente mazmorra del capítulo.

> [!IMPORTANT]
> **Invariante de Diseño**: En los niveles que contienen escalinata de descenso (`dungeon_classic`, `crypt_inferno`, `shadow_vault`, `shadow_chasm`), la lista de objetivos rúnicos está vacía (`"objectives": []`). La escalinata se activa interactuando **con la losa misma**.

---

## 3. Catálogo de Altares Únicos por Capítulo (`PedestalRenderer`)

Los altares rúnicos (`type: "pedestal"`) son los **monumentos de consagración final** situados en el santuario clímax de cada capítulo (tercera mazmorra), o monolitos utilitarios de campamento en el tutorial.

Para evitar la monotonía de reutilizar un modelo genérico con cambio de color, cada capítulo cuenta con una **arquitectura de cantería única, reliquia coronaria temática y animación distintiva**:

```
                        FAMILIA DE ALTARES 3D (THEMES)
                                       │
     ┌──────────────────┬──────────────┴─────┬──────────────────┐
     ▼                  ▼                    ▼                  ▼
 CAPÍTULO 1         CAPÍTULO 2           CAMPAMENTO         CAMPAMENTO
Altar Sagrado     Altar Crepuscular   Mesa Cartográfica   Pedestal Mercader
(Santuario Real)  (Trono del Vacío)   (Atlas de Misión)    (Bazar Rúnico)
```

---

### A. Capítulo 1: Altar Sagrado Ancestral (`theme: "classic"`)
- **Mazmorra Clímax:** *Trono del Abismo* (Capítulo 1: *El Descenso Ancestral*).
- **Propósito:** Consagración del templo primigenio y victoria del Capítulo 1.
- **Cantería Base:** Granito gris oscuro (`#1e293b`) de 2 peldaños escalonados robustos con **4 arbotantes/contrafuertes angulares** de refuerzo sacro en las esquinas.
- **Coronación:** Cornisa de sillar con biseles dorados perimetrales y runa solar de 24 radios.
- **Reliquia Central:** **Cristal Octaédrico Sagrado** flotante en levitación armónica ($y=1.66\text{ m}$), rodeado de brasas doradas (`#fcd34d`).
- **Comportamiento:** Al consagrarse, emite un pulso triunfal de luz dorada (`#fbbf24`), culminando la expedición del capítulo.

---

### B. Capítulo 2: Altar Crepuscular de las Sombras (`theme: "abyss" / "shadow"`)
- **Mazmorra Clímax:** *Santuario Crepuscular* (Capítulo 2: *Cripta de las Sombras*).
- **Propósito:** Sellar las corrientes del vacío y victoria del Capítulo 2.
- **Cantería Base:** Pizarra oscura abisal de base **hexagonal** con **4 monolitos colmillares cónicos** que ascienden enmarcando la reliquia superior a modo de garra ceremonial.
- **Coronación:** Losa hexagonal de obsidiana con ribete de runas amatistas y sello de vacío de 6 puntas.
- **Reliquia Central:** **Prisma Bi-piramidal de Vacío** (doble cono alargado amatista) abrazado por un **Halo Orbital de Sombras** (`TorusGeometry`, radio $0.20\text{ m}$) que oscila y gira de forma oblicua en torno al cristal.
- **Comportamiento:** Al activarse, estalla en un destello púrpura espectral (`#a78bfa`) y activa la cinemática de victoria de la Cripta de las Sombras.

---

### C. Campamento / Hub: Pedestal del Mercader (`theme: "merchant"`)
- **Nivel:** *Lobby / Tutorial* (`lobby_tutorial`).
- **Propósito:** Apertura interactiva de la tienda de compras, venta de botín y mejoras permanentes.
- **Cantería Base:** Basalto octogonal con collarín de cambio y mostrador superior circular con un **cuenco tallado de ofrendas doradas**.
- **Reliquia Central:** **Balanza de Comercio 3D (*Scales*)** de forja dorada con mástil, fulcro esférico, travesaño basculante, dos platillos de pesaje y una **gema esmeralda de tasación** en su platillo izquierdo.
- **Comportamiento:** Flota sobre el cuenco con rotación continua en $Y$ y un sutil balanceo en $Z$ (simulando el pesaje de monedas). Al interactuar (`[E]`), despliega el modal interactivo de la tienda (`#modal-shop`).

---

### D. Campamento / Hub: Mesa de Cartografía (`type: "cartography"`)
- **Nivel:** *Lobby / Tutorial* (`lobby_tutorial`).
- **Propósito:** Selección de capítulos desbloqueados, revisión de lore y navegación en el Atlas.
- **Cantería Base:** Pedestal de 4 pilares con mesa de cantería y disco holográfico del mapa iluminado en cian celestial (`#38bdf8`).
- **Reliquia Central:** **Brújula Náutica Mística 3D**:
  - Limbo cilíndrico de bronce con reborde graduado.
  - Rosa de los vientos con cruz cardinal Este–Oeste.
  - **Aguja magnética articulada bicolor**: flecha Norte en carmesí radiante (`#ef4444`) y flecha Sur en acero plata (`#f8fafc`).
  - Dos aros armilares celestiales en rotación cruzada independiente.
- **Comportamiento:** La aguja magnética oscila en tiempo real contrarrestando la rotación del dial para señalar el Norte arcano. Al interactuar (`[E]`), abre el modal del Atlas de Expedición (`#modal-chapter`).

---

## 4. Hoja de Ruta para Futuros Capítulos

El subsistema [`pedestalModel.js`](file:///data/data/com.termux/files/home/develop/runa-y-piedra/src/render/models/props/pedestalModel.js) implementa el patrón *Factory*:

```javascript
createPedestalGeometries(themeName)
```

Para los capítulos en desarrollo se diseñarán altares específicos:
- **Capítulo 3 (*Cataratas Subterráneas*):** *Altar del Torrente*, coronado por un Cáliz de Zafiro o Fuente de Maná Celestial con partículas de agua y cascada invertida.
- **Capítulo 4 (*La Gran Forja Enana*):** *Altar del Yunque Rúnico*, con martillo de fragua flotante, cadenas de hierro fundido y partículas de chispas incandescentes.
- **Capítulo 5 al 10:** Reliquias acordes a los biomas de cristal, cripta helada, arenas temporales y observatorio cósmico.

---

## 5. Resumen de Invariantes Técnicas

1. **Sin Z-fighting ni desalineación**: Todas las figuras centrales de los altares tienen su centro de masa en su origen local $(0,0,0)$ y se posicionan exactamente a la altura de sus aros/accesorios ($y=1.66\text{ m}$ en altares sagrados/abisales, $y=1.68\text{ m}$ en mostrador del mercader).
2. **Sin interferencia con el suelo**: El radio de giro de los aros y accesorios orbitales está acotado entre $0.20\text{ m}$ y $0.21\text{ m}$, rotando sobre su propio centro de flotación para evitar sumergirse en los bloques de piso.
3. **Escalinata sin Altar**: Ningún nivel debe asociar la apertura de su escalinata a la activación de un pedestal; la escalinata siempre se acciona directamente sobre su losa rúnica de suelo.
