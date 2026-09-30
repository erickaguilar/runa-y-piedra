# 19. Capacidad de Jugadores Simultáneos, Límite de 5 Jugadores y Unicidad de Razas/Clases

Este documento detalla los hallazgos técnicos, el análisis de rendimiento de red y la implementación del sistema de control de aforo (máximo 5 jugadores) y la regla estricta de **una clase/raza única por jugador**, garantizando expediciones cooperativas equilibradas, fluidas y sin conflictos en dispositivos móviles y de escritorio.

---

## 1. Justificación Técnica: ¿Cuántos jugadores pueden jugar al mismo tiempo?

### 1.1 Límites Teóricos del Protocolo Binario
En el protocolo binario v2 ([`Protocol.js`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js)), los paquetes están optimizados con *DataView* sin recolección de basura (*Zero-GC*):
- El campo `count` en la cabecera del snapshot es un `Uint8` (1 byte, hasta 255 entidades).
- Cada jugador se identifica con un `playerId` de 1 byte.
- Por diseño de serialización, el protocolo podría admitir técnicamente hasta 255 jugadores en una sola sesión.

### 1.2 Límites de la Arquitectura Listen-Server P2P (WebRTC)
El juego opera en una topología en estrella P2P sin servidores centrales dedicados ([`NetworkManager.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkManager.js)):
- **El anfitrión (Host)** ejecuta la simulación autoritativa en su propio navegador (frecuentemente un teléfono móvil o portátil).
- Cada cliente mantiene **2 canales WebRTC simultáneos** con el Host:
  - Canal seguro (`game-safe`, SCTP fiable) para eventos de juego (puertas, llaves, cofres, cambio de nivel).
  - Canal caliente (`game-hot`, SCTP no fiable) para entradas a 30 Hz y snapshots de estado a 20 Hz.
- **Ancho de banda por snapshot:**
  $$\text{Tamaño} = 8 + (N \times 25)\text{ bytes}$$
  - Con **4 jugadores:** $8 + 100 = 108\text{ B}$ @ 20 Hz $\approx 2.16\text{ KB/s}$ por cliente. Tráfico de subida del Host: $\approx 6.5\text{ KB/s}$.
  - Con **5 jugadores:** $8 + 125 = 133\text{ B}$ @ 20 Hz $\approx 2.66\text{ KB/s}$ por cliente. Tráfico de subida del Host: $\approx 10.6\text{ KB/s}$.
  - Con **8 jugadores:** $\approx 4.16\text{ KB/s}$ por cliente. Tráfico de subida del Host: $\approx 29.1\text{ KB/s}$.
- **Estrangulamiento en Navegadores Móviles:**
  En Android (Chrome) e iOS (Safari), el subsistema de red restringe el número de puertos ICE y conexiones SCTP en segundo plano para ahorrar batería. Superar 6-8 conexiones P2P en un teléfono provoca latencia errática, pérdida de paquetes en el canal caliente y eventual desconexión de clientes débiles.

### 1.3 Relación Espacial y Jugabilidad en las Mazmorras
- Las dimensiones del mapa ([`constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js)) son de **24 × 24 × 36 metros**.
- Los pasillos y puertas de separación entre cámaras miden **2 bloques de ancho (2.0 m)**.
- Las plataformas de salto (*Jump Pads*) miden 2×1 metros.
- Con más de 5 jugadores en la misma sala, se producen aglomeraciones en los umbrales de las losas y puertas, empujones en los saltos de lava y confusión visual en tercera persona.

> [!IMPORTANT]
> **Punto dulce (Sweet Spot):** **5 jugadores** es el tamaño óptimo perfecto. Permite una party completa donde cada participante asume un rol complementario e irrepetible, con un consumo de red despreciable (~10 KB/s de subida en el Host) y sin saturar los corredores de la mazmorra.

---

## 2. Unicidad Absoluta de Razas y Clases de Héroes

El juego cuenta con exactamente **5 clases de héroes declaradas** en [`src/heroes/data/heroes.json`](file:///data/data/com.termux/files/home/develop/game/src/heroes/data/heroes.json):

| Índice | Clase / Raza | Título | Rol | Color | Rasgo Distintivo |
| :---: | :--- | :--- | :--- | :---: | :--- |
| `0` | **Aventurero** | Explorador Versátil | Equilibrado | `#38bdf8` | Velocidad y salto 100% estándar; adaptabilidad total en laberintos. |
| `1` | **Paladín** | Caballero de la Luz | Tanque / Firmeza | `#f43f5e` | Alta resistencia (5/5), pisada pesada (-4% vel, -2% salto). |
| `2` | **Explorador** | Rastreador Veloz | Agilidad | `#10b981` | Gran velocidad (+12% vel, +4% salto) para esquivar fosas. |
| `3` | **Hechicero** | Mago Arcano | Levitación | `#a855f7` | Impulso gravitacional elevado (+14% salto) para cruzar precipicios. |
| `4` | **Guardián** | Baluarte Ancestral | Coloso Rúnico | `#fbbf24` | Máxima defensa (5/5) e imperturbabilidad ante impactos de magma. |

### 2.1 Regla: Prohibición de Razas Duplicadas
Para garantizar la riqueza táctica del grupo:
1. **No pueden existir dos jugadores con la misma raza/clase** en la misma partida.
2. Si un jugador ya seleccionó *Aventurero*, ningún otro jugador podrá elegirlo.
3. El grupo completo de 5 jugadores abarca exactamente los 5 arquetipos de la expedición.

---

## 3. Implementación de la Arquitectura de Unicidad

### 3.1 Métodos Autoritativos en `PlayerManager`
En [`src/entities/PlayerManager.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/PlayerManager.js):

```javascript
// Obtiene el conjunto de colorIndex actualmente ocupados en la sala
getTakenColorIndices(excludePlayerId = null) {
  const taken = new Set();
  for (const p of this.players.values()) {
    if (excludePlayerId !== null && p.id === excludePlayerId) continue;
    if (typeof p.colorIndex === 'number' && !isNaN(p.colorIndex)) {
      taken.add(p.colorIndex);
    }
  }
  return taken;
}

// Resuelve la clase solicitada o asigna la primera libre disponible
getAvailableColorIndex(preferredIndex = 0, excludePlayerId = null, maxHeroes = 5) {
  const taken = this.getTakenColorIndices(excludePlayerId);
  if (preferredIndex !== undefined && preferredIndex !== null && !taken.has(preferredIndex)) {
    return preferredIndex;
  }
  for (let i = 0; i < maxHeroes; i++) {
    if (!taken.has(i)) return i;
  }
  return preferredIndex ?? 0;
}
```

### 3.2 Negociación y Arbitraje en el Host (`src/main.js`)
Al unirse un nuevo jugador o al intentar cambiar de clase:
1. El cliente envía su `PLAYER_META` con su clase deseada.
2. El Host ejecuta `playerManager.getAvailableColorIndex(requestedColor, player.id)`.
3. Si la clase ya está ocupada:
   - El Host asigna automáticamente la siguiente clase libre (por ejemplo, de *Aventurero* a *Paladín*).
   - El Host difunde el paquete oficial `PLAYER_META` a todos los clientes.
4. El cliente que solicitó la clase recibe la confirmación oficial:
   - Detecta la reasignación (`oldColor !== colorIndex`).
   - Actualiza su perfil local y `localStorage`.
   - Muestra una notificación narrativa:
     ```text
     ⚠️ Tu clase elegida ya estaba en uso. El anfitrión te asignó: Paladín.
     ```

---

## 4. Control de Aforo Estricto (`MAX_PLAYERS = 5`)

### 4.1 Rechazo Autoritativo de Conexiones Excedentes
En [`src/config/constants.js`](file:///data/data/com.termux/files/home/develop/game/src/config/constants.js):
```javascript
export const GAME_CONFIG = {
  MAX_PLAYERS: 5,
};

export const NET_CONFIG = {
  ...
  MAX_PLAYERS: 5,
  CLOSE_REASON: {
    NORMAL: 0,
    ROOM_FULL: 1,
  },
};
```

Cuando un sexto jugador intenta ingresar a la sala:
1. Se dispara el evento `peer-joined` en el Host.
2. El Host evalúa `this.playerManager.isFull(NET_CONFIG.MAX_PLAYERS)`.
3. Al detectar aforo completo ($\ge 5$ jugadores):
   - El Host **no registra** al jugador remoto ni asigna recursos de avatar o mundo.
   - Envía de inmediato un paquete `HOST_CLOSING` con motivo `1` (`CLOSE_REASON.ROOM_FULL`):
     ```javascript
     this.network.sendTo(conn, Proto.serializeHostClosing(NET_CONFIG.CLOSE_REASON.ROOM_FULL));
     setTimeout(() => { try { conn.close(); } catch {} }, 200);
     ```

### 4.2 Comportamiento en el Cliente Rechazado
En el cliente que intentó unirse:
1. Al recibir `host-closing` con `reason === 1`:
   - Muestra el estado: `La sala está llena (máximo 5 aventureros)`.
   - Despliega un mensaje narrativo prominente:
     ```text
     🚫 La sala está llena (máximo 5 jugadores). No se admiten más aventureros.
     ```
   - Reproduce sonido de retroalimentación y se desconecta limpiamente de WebRTC.
   - Tras 2.5 segundos, restaura la pantalla del menú principal sin recargar la página ni lanzar excepciones.

### 4.3 Liberación Dinámica de Cupos
- Si cualquier jugador abandona la partida (`peer-left`), `PlayerManager.removeByConnection` elimina su registro.
- Su clase queda liberada inmediatamente en `getTakenColorIndices()`.
- `pm.isFull()` vuelve a `false`, permitiendo el ingreso ordenado de un nuevo aventurero.

---

## 5. Experiencia de Usuario e Interfaz Visual (UI/UX)

### 5.1 Selector de Clases en Configuración con Bloqueo Visual
En el modal de ⚙️ Configuración ([`UIManager.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/UIManager.js)):
- Se renderiza la fila de fichas de héroe (`#settings-heroes-row`).
- Las clases tomadas por otros compañeros de la sala reciben la clase CSS `.hero-chip.occupied`:
  - **Filtro:** escala de grises al 85% y opacidad al 35%.
  - **Icono:** cruz roja superpuesta (`✕`) y cursor `not-allowed`.
  - **Tooltip:** `[Clase] (En uso por [Nombre del jugador])`.
- Al pulsar una ficha ocupada, no se selecciona y se emite un aviso:
  ```text
  ⚠️ La clase Aventurero ya está en uso por Gandalf. Elige otra clase única.
  ```

### 5.2 Indicador de Capacidad de Sala en Tiempo Real
En la cabecera de la lista de compañeros:
- Mientras la sala tenga entre 1 y 4 jugadores:
  `[N]/5 Jugadores` en tono cian (#38bdf8).
- Al alcanzar los 5 jugadores:
  `🔒 5/5 Llena` con insignia dorada/ámbar (#f59e0b).

---

## 6. Verificación Automatizada

La implementación cuenta con pruebas exhaustivas en [`tests/player-manager.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/player-manager.test.js):
- `límite estricto de 5 jugadores simultáneos y rechazo al exceder aforo`: verifica que el 6º jugador recibe `null`, que la sala marca `isFull() === true`, y que al desconectarse un miembro el cupo se libera de nuevo.
- `unicidad absoluta de razas/héroes`: comprueba que si dos o más clientes solicitan la misma clase (p. ej. *Aventurero*), el gestor asigna determinísticamente las clases libres sucesivas (*Paladín*, *Explorador*...), garantizando cero colisiones.
- **Resultado de la suite:** 93/93 pruebas unitarias pasando satisfactoriamente.
