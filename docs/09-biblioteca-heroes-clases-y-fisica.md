# 09. Biblioteca de Héroes, Clases Únicas y Modificadores Físicos

Este documento describe la arquitectura declarativa de personajes del juego, el catálogo de clases gestionado por [`heroes.json`](file:///data/data/com.termux/files/home/develop/game/src/heroes/data/heroes.json), los modificadores de física en tiempo real y la representación de avatares en 3D.

---

## 1. Arquitectura Declarativa en JSON

Toda la información referente a clases de aventureros, estética, rasgos pasivos e impacto en las físicas del juego se almacena de forma desacoplada en [`src/heroes/data/heroes.json`](file:///data/data/com.termux/files/home/develop/game/src/heroes/data/heroes.json) y se administra mediante [`HeroRegistry.js`](file:///data/data/com.termux/files/home/develop/game/src/heroes/HeroRegistry.js).

### Vinculación con las Constantes del Motor

En [`src/config/constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js):
```javascript
import heroesData from '../heroes/data/heroes.json';

export const PLAYER_HEROES = heroesData.heroes;
export const PLAYER_PALETTE = heroesData.heroes.map(h => h.hex);
```
Cualquier módulo que importe `PLAYER_HEROES` o `PLAYER_PALETTE` recibe automáticamente la biblioteca completa sin incompatibilidades.

---

## 2. Catálogo Oficial de Clases y Características

| Clase | Color | Icono SVG | Rol / Título | Habilidad Pasiva | Mult. Vel | Mult. Salto | Defensa |
| :--- | :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| **Aventurero** | `#38bdf8` | `compass` (🧭) | Explorador Versátil | *Instinto Explorador*: Adaptación total a plataformas | $1.00$ | $1.00$ | $3/5$ |
| **Paladín** | `#f43f5e` | `shield` (🛡️) | Caballero de la Luz | *Aura de Firmeza*: Máxima resiliencia y estabilidad | $0.96$ | $0.98$ | $5/5$ |
| **Explorador** | `#10b981` | `feather` (🪶) | Rastreador Veloz | *Paso del Viento*: Gran aceleración en corredores | **$1.12$** | $1.04$ | $2/5$ |
| **Hechicero** | `#a855f7` | `wand` (🪄) | Mago Arcano | *Salto de Levitación*: Suspensión rúnica vertical | $0.98$ | **$1.14$** | $2/5$ |
| **Guardián** | `#fbbf24` | `crown` (👑) | Baluarte Ancestral | *Presencia Áurea*: Coloso de roca impenetrable | $0.94$ | $0.96$ | $5/5$ |

### Esquema de Datos de un Héroe (`heroes.json`)
```json
{
  "id": "ranger",
  "index": 2,
  "name": "Explorador",
  "title": "Rastreador Veloz",
  "role": "Velocidad y Agilidad",
  "color": "#10b981",
  "hex": 1096065,
  "icon": "feather",
  "passive": "Paso del Viento",
  "trait": "Velocidad de movimiento mejorada (+12%) en corredores y pasillos.",
  "description": "Ágil como el viento. Cruza pasadizos a gran velocidad y esquiva precipicios con reflejos felinos.",
  "stats": {
    "speed": 1.12,
    "jump": 1.04,
    "defense": 2,
    "difficulty": "Veloz"
  },
  "speedMultiplier": 1.12,
  "jumpMultiplier": 1.04
}
```

---

## 3. Integración en la Física en Tiempo Real

Las características de los héroes no son meramente cosméticas; modifican directamente las ecuaciones del motor físico:

### 1. Velocidad de Carrera Horizontal ([`SimulationEngine.js`](file:///data/data/com.termux/files/home/develop/game/src/simulation/SimulationEngine.js#L10-L16))
```javascript
const speedMult = p.hero?.speedMultiplier || 1.0;
const currentSpeed = PHYSICS_CONFIG.SPEED * speedMult;
p.vel.x = (fx * p.inputForward + rx * p.inputRight) * currentSpeed;
p.vel.z = (fz * p.inputForward + rz * p.inputRight) * currentSpeed;
```
- **Explorador ($1.12\times$)**: Permite cruzar los fosos con menor margen de riesgo gracias a su aceleración de carrera.
- **Guardián ($0.94\times$)**: Ofrece pisada más pausada y precisa en cornisas estrechas.

### 2. Impulso de Salto Vertical ([`main.js`](file:///data/data/com.termux/files/home/develop/game/src/main.js#L181-L187))
```javascript
handleJump() {
  const local = this.playerManager.localPlayer;
  if (local.onGround) {
    const jumpMult = local.hero?.jumpMultiplier || 1.0;
    local.vel.y = PHYSICS_CONFIG.JUMP_VELOCITY * jumpMult;
    local.onGround = false;
  }
}
```
- **Hechicero ($1.14\times$)**: Alcanza cotas verticales superiores y amplía la distancia horizontal alcanzable en caída parabólica.

---

## 4. Tarjeta Dinámica de Características en la Interfaz (UI)

En [`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js), el método `renderHeroTraitCard(hero)` renderiza en tiempo real una tarjeta informativa interactiva cuando el jugador selecciona o cambia de héroe:

- **Cabecera**: Icono SVG personalizado del héroe + Título de clase.
- **Descripción**: Resumen del estilo de juego y rol.
- **Badges de Estadísticas**:
  - `⚡ Vel: [speedMultiplier]%`
  - `⬆️ Salto: [jumpMultiplier]%`
  - `🛡️ Def: [defense]/5`

Esta misma tarjeta se actualiza reactivamente tanto en la pantalla inicial como dentro del modal de ⚙️ **Configuración**.

---

## 5. Renderizado 3D de Avatares y Nombres en Partida ([`AvatarRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/AvatarRenderer.js))

- **Malla Vóxel**: Cada jugador conectado está representado por un prisma 3D ($0.6 \times 1.8 \times 0.6\text{ m}$) teñido con el color distintivo de su clase.
- **Sprite de Texto Flotante (Nameplate)**:
  - Generado dinámicamente sobre un canvas 2D ($256 \times 64\text{ px}$) con `THREE.CanvasTexture`.
  - Contiene fondo oscuro translúcido con bordes redondeados (`roundRect`), borde exterior coloreado según la clase, punto identificativo y tipografía blanca nítida sin artefactos de compresión.
  - Sigue automáticamente la posición de la cabeza del compañero en tiempo real.
