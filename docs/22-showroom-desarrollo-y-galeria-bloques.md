# 22. Showroom de Desarrollo y Galería Completa de Bloques

## 1. Propósito y Filosofía de Diseño

A medida que el ecosistema de *Runa y Piedra* creció incorporando nuevos bloques vóxel en el **Texture Atlas** procedural (baldosas de piedra, piedra desgastada, musgo, muros con runas y fisuras, pilares de cantería, losas rúnicas de respawn, plataformas de salto *Jump Pad*, magma incandescente y pedestales arcanos), así como mecánicas complejas (viscosidad y sumersión en lava, arpegio de reaparición celestial, apertura de cofres con llaves, pociones y gemas, puertas con cerradura y escalinatas de descenso ceremonial), verificar visualmente y probar el comportamiento de cada elemento requería jugar repetidamente la campaña secuencial o alterar temporalmente los archivos de niveles.

Para resolver esta fricción sin comprometer el flujo del jugador final, se implementó el **Showroom de Desarrollo** (`dev_showroom`): un entorno sandbox integral, de dimensiones completas (`24 × 16 × 36`), que exhibe en un único mapa interactivo todos los sprites y mecánicas del motor, accesible **estrictamente de forma exclusiva** a través del modal de herramientas de desarrollo (`#modal-dev`).

```
                              [ Modal Herramientas Dev ]
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
         [ Entrar al Showroom ]                     [ Volver al Lobby ]
                     │                                         │
                     ▼                                         ▼
            dev_showroom (Sandbox)                    lobby_tutorial (Campaña)
       ┌───────────────────────────────┐
       │ Sala 1: Galería de Sprites    │
       │  - Podios 2x2 de cada bloque  │
       │  - Inspección de Texture Atlas│
       ├───────────────────────────────┤
       │ Puerta 1: Acceso libre        │
       ├───────────────────────────────┤
       │ Sala 2: Físicas & Mecánicas   │
       │  - Circuito de Jump Pads      │
       │  - Fosa de Lava activa        │
       │  - Cofres (Llave, Gemas, Poció│
       ├───────────────────────────────┤
       │ Puerta 2: Cerradura c/ Llave  │
       ├───────────────────────────────┤
       │ Sala 3: Altar & Escalinata    │
       │  - Altar Ancestral con Orbe   │
       │  - Escalinata de Descenso     │
       └───────────────────────────────┘
```

---

## 2. Aislamiento Estricto de la Campaña Regular

Para garantizar que ningún jugador de la campaña acceda accidentalmente al nivel de pruebas mediante descenso, Game Over o comandos de lobby, se definieron metadatos de aislamiento en su configuración:

```json
{
  "id": "dev_showroom",
  "name": "Showroom de Desarrollo: Galería de Bloques y Físicas",
  "difficulty": "Dev Sandbox",
  "isDevOnly": true,
  "hiddenFromCampaign": true
}
```

### Contrato en `LevelRegistry.js`
El método `getAllLevels(includeDev = false)` filtra por defecto cualquier mapa marcado con `isDevOnly` o `hiddenFromCampaign`:

```javascript
getAllLevels(includeDev = false) {
  const list = Array.from(this.levels.values());
  if (includeDev) return list;
  return list.filter(l => !l.isDevOnly && !l.hiddenFromCampaign);
}
```

De este modo:
1. `DescentManager.js` itera sobre `getAllLevels(false)`, por lo que la rotación natural (`lobby_tutorial` $\to$ `dungeon_classic` $\to$ `crypt_inferno` $\to$ `abyss_throne`) jamás salta al Showroom.
2. Al ocurrir un Game Over o reinicio de incursión, el juego siempre retorna al vestíbulo (`lobby_tutorial`).
3. El Showroom solo se carga mediante invocación explícita desde el botón `#btn-dev-enter-showroom`.

---

## 3. Topología de las 3 Salas del Showroom

El mapa aprovecha los 864 m² por plano vertical que define `WORLD_CONFIG` (`SIZE_X: 24`, `SIZE_Y: 16`, `SIZE_Z: 36`, `MIN_Y: -8`), dividiéndose en tres recintos con objetivos pedagógicos y de auditoría específicos:

### Sala 1: Galería de Sprites y Bloques del Texture Atlas ($z = 1$ a $13$)
Contiene podios elevados a $y = 1$ de $2 \times 2$ bloques para examinar con fidelidad de cámara cada textura procedural:
- **`FLOOR_STONE`** (Tile 0): Baldosa de cantería pura sin desgaste.
- **`FLOOR_WORN`** (Tile 1): Losa erosionada con grietas oscuras.
- **`FLOOR_MOSS`** (Tile 2): Piedra cubierta de vegetación y musgo arcano.
- **`WALL`** (Tiles 3, 4, 5, 8, 9, 10): Muros estructurales con variantes estocásticas (piedra, grietas, musgo, runas iluminadas).
- **`PILLAR`** (Tile 12): Columnas arquitectónicas con capiteles y fuste labrado.
- **`RESPAWN_PAD`** (Tile 11): Losa de respawn con rosa de los vientos celestial azul cian (`#38bdf8`) y arpegio procedural.
- **`JUMP_PAD`** (Tile 14): Plataforma de salto con glifo rúnico ámbar.
- **`LAVA`** (Tile 13): Magma hirviente con corrientes procedurales, placas de obsidiana y burbujas térmicas.
- **`PEDESTAL`** (Tile 7): Base pétrea para reliquias sagradas.

### Divisor 1 y Puerta Libre ($z = 13$)
Muro transversal con abertura central de $2 \times 2$ protegida por una puerta deslizante libre (ID 1). Se abre pulsando `E` o el botón de acción en móvil, permitiendo probar la cinemática de apertura sin necesidad de llave.

### Sala 2: Laboratorio de Físicas y Mecánicas Interactivas ($z = 14$ a $24$)
Diseñada para auditar las reglas dinámicas del motor:
1. **Circuito de Salto Escalonado**:
   - Plataforma *Jump Pad* a $y = 0$, que impulsa al jugador a una repisa elevada a $y = 2$.
   - Segundo *Jump Pad* a $y = 2$, que impulsa al jugador a una plataforma superior a $y = 4$.
   - Permite verificar el impulso vertical ($v_y = 14.0$), la cancelación de daño por caída y la respuesta en bucle desacoplado a 30 Hz.
2. **Fosa de Lava Activa**:
   - Receptáculo de $4 \times 4$ bloques de lava (`y = 0` y `y = -1`) delimitado por muros de contención.
   - Permite auditar la física de fluidos no sólidos: descenso frenado a velocidad terminal constante ($-1.0$), inhibición total de salto, temporizador de inmersión y reaparición en la losa rúnica con arpegio de campanas de `SoundManager`.
3. **Trilogía de Cofres de Botín**:
   - **Cofre 1** ($x=10.5, z=17.5$): Otorga la `llave_showroom` (*"Llave Maestra del Showroom"*), imprescindible para franquear la Puerta 2.
   - **Cofre 2** ($x=12.0, z=20.5$): Otorga `250` gemas arcanas, actualizando en tiempo real el HUD de botín y el modal de inventario.
   - **Cofre 3** ($x=13.5, z=17.5$): Otorga una `pocion_vida` (+1 corazón), permitiendo probar el consumo de pociones con tecla `P` o desde el modal de inventario (`B`).

### Divisor 2 y Puerta Sellada con Llave ($z = 24$)
Muro transversal con puerta de seguridad (ID 2) vinculada a `requiresKey: "llave_showroom"`.
- Si el aventurero intenta abrirla sin la llave, emite la alerta sonora de puerta trancada y el mensaje *"🔒 Requiere la Llave Maestra del Cofre 1"*.
- Al poseer la llave, se desbloquea consumiendo el objeto del inventario y reproduciendo el tintineo dorado.

### Sala 3: Santuario, Reliquias y Escalinata Ceremonial ($z = 25$ a $36$)
- **Altar Ancestral** ($x=12, z=29$): Pedestal rúnico coronado con orbe flotante en levitación armónica seno-coseno. Interactuar con él activa los laureles de victoria.
- **Escalinata de Descenso** ($x \in [11, 12], z \in [32, 34]$): Trampilla corrediza para auditar la animación y apertura de escalinatas ceremoniales.

---

## 4. Integración en Interfaz (`UIManager.js`) y Ciclo de Vida (`main.js`)

En el modal `#modal-dev` se integró la sección destacada de acceso al Showroom:

```html
<!-- Sección Showroom en modal-dev -->
<div class="settings-group" style="background:rgba(15, 23, 42, 0.75);border:1px solid rgba(52, 211, 153, 0.35);">
  <button id="btn-dev-enter-showroom" class="btn-primary">
    🧪 Entrar al Showroom de Bloques
  </button>
  <!-- Si ya se está en el showroom, se renderiza el botón de retorno: -->
  <button id="btn-dev-exit-showroom" class="btn-secondary">
    Volver al Lobby / Tutorial
  </button>
</div>
```

### Inicialización Dinámica (`startDevShowroomSession`)
Si el desarrollador pulsa *"Entrar al Showroom"* desde la pantalla de bienvenida o menú principal (`this.mode === null`), el cliente inicializa una sesión local en modo Host (`this.mode = 'host'`), registra el jugador local con perfil de pruebas, activa la interfaz in-game (punto de mira, botones táctiles y vidas) y conmuta inmediatamente a `'dev_showroom'`:

```javascript
async startDevShowroomSession() {
  this.mode = 'host';
  this.playerManager.setLocalId(0);
  this.playerManager.setLocalProfile('Dev Tester', 0);
  this.avatars.remove(-1);

  this.ui.currentScreen = 'in_game';
  this.ui.hideMenu();
  this.ui.setCrosshairVisible(true);
  this.ui.setActionButtonsVisible(true);
  this.ui.setLivesVisible(true);
  this.resetInventory({ keepGems: false, keepRelics: false });

  const localInit = this.playerManager.localPlayer;
  if (localInit) {
    this.input.yaw = Math.PI;
    localInit.yaw = Math.PI;
    localInit.resetLives();
    this.ui.updateLives(localInit.lives, localInit.maxLives);
    this.ui.setHasKey(false);
  }

  this.switchLevel('dev_showroom', false);
}
```

Si el juego ya se encuentra en marcha, `this.switchLevel('dev_showroom', this.mode === 'host')` teletransporta a todos los miembros de la sala al Showroom y difunde el mensaje narrativo:
> *"🧪 Showroom de Desarrollo: Galería completa de bloques y físicas."*

---

## 5. Pruebas Automatizadas

La suite de pruebas en `node:test` verifica rigurosamente los siguientes aspectos:
1. **Aislamiento en `LevelRegistry`**: `getAllLevels(false)` excluye `dev_showroom`, mientras que `getAllLevels(true)` lo incluye.
2. **Estructura de Bloques e Interactivos**: Comprobación de que `dev_showroom` carga 2 puertas, 3 cofres, 1 objetivo, 1 escalinata y bloques `JUMP_PAD`.
3. **Consistencia de Botín y Cerraduras**: Validación de que el Cofre 1 otorga la `llave_showroom` requerida por la Puerta 2, el Cofre 2 contiene 250 gemas y el Cofre 3 otorga la poción de vida.
4. **Navegación en el Modal Dev**: Eventos `click` en `#btn-dev-enter-showroom` y `#btn-dev-exit-showroom` disparando `onEnterShowroom` y `onExitShowroom` respectivamente.
