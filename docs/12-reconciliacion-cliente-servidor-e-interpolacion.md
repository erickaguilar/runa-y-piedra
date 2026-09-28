# 12. Reconciliación Cliente-Servidor Real e Interpolación Temporal de Snapshots

Este documento expone la arquitectura de **predicción en el cliente, reconciliación autoritativa en el host e interpolación temporal de entidades remotas**, completando la transición desde un modelo de réplica visual pasiva a un netcode multijugador determinista de baja latencia adaptado a navegadores móviles sobre WebRTC.

---

## 1. Fundamentos y Problema de la Predicción Pura

En arquitecturas P2P o servidor autoritativo, existen dos alternativas extremas:
1. **Sin Predicción (Lockstep)**: El jugador pulsa avanzar y no se mueve hasta que el host confirma el movimiento (latencia $\ge \text{RTT}$, respuesta pesada e injugable en pantallas táctiles).
2. **Predicción sin Reconciliación (v1)**: El cliente se mueve inmediatamente en local y solo interpola las posiciones remotas. Si el host detecta una colisión que el cliente no anticipó (ej. colisión con otro avatar, puerta en movimiento, desync de tick o jitter), se produce una desincronización permanente (*drift*), rubber-banding brusco y estados inconsistentes.

### Solución Implementada: Modelo de Reconciliación por Ack (`ClientReconciler.js`)

```
   CLIENTE                                                HOST
      |                                                    |
 1. Input local #42 -------------------------------------> | 2. Recibe #42
    Guarda en buffer pendingInputs                         |    Aplica físicas
    Predice localmente a 60 FPS                            |    Actualiza lastInputSeq = 42
      |                                                    |
      | <------------------------------------------------- | 3. Emite SNAPSHOT
      |   [Snapshot: Pos=(12.4, 1.2, 5.1), lastInputSeq=42]    (a 20 Hz con seq y simTime)
 4. Reconciliación:                                        |
    - Descarta inputs con seq <= 42                        |
    - Replay de inputs pendientes (#43..#45)               |
    - Compara error con umbral (0.04 m)                    |
    - Corrige suavemente o mantiene predicción             |
```

---

## 2. Estructura de Paquetes en Protocolo v2.2

### Paquete `INPUT` (16 bytes - Cliente a Host @ 30 Hz)
- `Offset 0` (`Uint8`): `0x01` (`MSG.INPUT`)
- `Offset 1-2` (`Uint16`): Número de secuencia cíclico `seq` del input
- `Offset 3-6` (`Float32`): Movimiento lateral `dx` (strafe derecho/izquierdo)
- `Offset 7-10` (`Float32`): Movimiento longitudinal `dz` (avance/retroceso)
- `Offset 11-14` (`Float32`): Rotación `yaw` de la cámara en radianes
- `Offset 15` (`Uint8`): Bitmask de acciones edge-triggered (`ACTION_FLAGS`):
  - `0x01`: `JUMP` (impulso vertical)
  - `0x02`: `DESTROY` (destrucción de vóxel)
  - `0x04`: `PLACE` (colocación de vóxel)
  - `0x08`: `INTERACT` (cofres, puertas, palancas)

### Paquete `SNAPSHOT` (24 bytes por entidad - Host a Clientes @ 20 Hz)
- `Offset 0` (`Uint8`): `0x02` (`MSG.SNAPSHOT`)
- `Offset 1-2` (`Uint16`): Número de secuencia cíclico `seq` del snapshot
- `Offset 3-6` (`Uint32`): Timestamp de simulación (`simTime` en ms)
- `Offset 7` (`Uint8`): Número de jugadores ($N$)
- **Bloque por Jugador (24 bytes)**:
  - `Offset +0` (`Uint8`): `playerId`
  - `Offset +1` (`Uint16`): `lastInputSeq` (último paquete de input del cliente confirmado e integrado por el host)
  - `Offset +3` (`Float32`): Posición X autoritativa
  - `Offset +7` (`Float32`): Posición Y autoritativa
  - `Offset +11` (`Float32`): Posición Z autoritativa
  - `Offset +15` (`Float32`): Rotación Yaw autoritativa
  - `Offset +19` (`Float32`): Velocidad vertical autoritativa (`velY`)
  - `Offset +23` (`Uint8`): Estado en suelo (`onGround`, 1 = true, 0 = false)

---

## 3. Buffer de Jitter, Rate Limiting y Sanitización en el Host (`InputQueue.js`)

Los navegadores móviles ejecutan temporizadores con fluctuaciones naturales ($\pm 5\text{ a }15\text{ ms}$). Sin un buffer de jitter, el host recibiría 0 inputs en un tick y 2 en el siguiente, provocando micro-tirones visuales.

[`InputQueue.js`](file:///data/data/com.termux/files/home/develop/game/src/network/InputQueue.js) resuelve esto mediante:
1. **Desacoplamiento Temporal**: Encola los inputs recibidos por conexión WebRTC y entrega exactamente **un input por tick de simulación (30 Hz)** en el host.
2. **Profundidad Máxima de Cola**: Limitada estrictamente a 5 inputs ($\sim 166\text{ ms}$). Si un cliente laggy acumula exceso de paquetes, se descartan los más viejos para evitar retraso acumulativo en cámara lenta.
3. **Rate Limiting por Conexión**: Límite de 45 inputs/segundo por peer para prevenir saturación de ancho de banda o spam malicioso.
4. **Sanitización y Anti-Speedhack**:
   - Clamping del vector de movimiento: si $\sqrt{dx^2 + dz^2} > 1.0$, se normaliza a magnitud $1.0$.
   - Normalización angular de Yaw al rango canónico $[-\pi, \pi]$.
5. **Retención de Velocidad y Decaimiento Suave**:
   - Mantiene la velocidad completa durante los primeros **3 ticks** de pérdida ($\sim 100-130\text{ ms}$) para absorber micro-jitter de Wi-Fi sin frenazos bruscos.
   - Aplica decaimiento del $15\%$ por tick a partir del 4º tick.
   - Detiene por completo al avatar tras 30 ticks ($\sim 1\text{ s}$) sin paquetes.
   - Las acciones (`actions`) son estrictamente forzadas a `0` en ticks repetidos, asegurando que un salto nunca se dispare por duplicado.

---

## 4. Algoritmo de Reconciliación del Jugador Local (`ClientReconciler.js`)

El proceso en [`ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js) opera desacoplando el **estado lógico/físico** del **estado visual de renderizado**:

1. **Separación de Estado Lógico (`pos`) y Visual (`visualPos`)**:
   - `player.pos`: Autoridad física local y resultado exacto del replay de reconciliación. Todos los cálculos de colisiones (`tryMove`), predicción de saltos e inputs se realizan contra `player.pos`.
   - `player.visualPos`: Estado suavizado utilizado exclusivamente por [`CameraController.js`](file:///data/data/com.termux/files/home/develop/game/src/camera/CameraController.js) para posicionar la cámara a 60 FPS sin saltos perceptibles.
2. **Guarda Monotónica**: Descarte de snapshots que lleguen con timestamp desfasado o fuera de orden (`simTime <= lastProcessedSimTime`).
3. **Registro Continuo de Inputs (`recordInput`)**:
   En cada tick de física (`onTick` a 30 Hz), con $\Delta t$ fijo idéntico al del host (`FIXED_DT = 1/30 s`) y flags de acción unificados (sin estado interno duplicado `pendingActions`):
   $$\text{pendingInputs.push}(\{ \text{seq}, \Delta t_{\text{fijo}}, \text{forward}, \text{right}, \text{yaw}, \text{actions}, \text{time} \})$$
4. **Descarte de Inputs Confirmados**:
   $$\text{pendingInputs} = \text{pendingInputs.filter}(\text{inp} \to \text{inp.seq} > \text{lastInputSeq})$$
5. **Simulación de Replay Determinista (Zero-GC)**:
   Se utiliza un `ghostPlayer` pre-asignado que comienza en la coordenada autoritativa $(X_h, Y_h, Z_h)$, inicializa su velocidad vertical (`velY`) y estado `onGround`, y alinea su `yaw` con el último input pendiente en vuelo para no girar hacia atrás. Se itera sobre todos los inputs pendientes en vuelo ejecutando `simulationEngine.integratePlayer(ghost, inp.dt, inp.actions)`.
6. **Adopción Incondicional en Física Lógica y Zonificación Visual**:
   La posición y velocidad **lógicas** ($\vec{P}_{\text{local}}$, $\vec{V}_{\text{local}}$, $\text{onGround}$) adoptan **SIEMPRE e incondicionalmente** el resultado del replay ($\vec{P}_{\text{ghost}}$, $\vec{V}_{\text{ghost}}$) para cualquier error $\le 2.5\text{ m}$. Esto erradica por completo la acumulación de desvíos subcentimétricos no autoritativos ("drift congelado") y garantiza convergencia matemática a $0\text{ m}$.

   La zonificación tri-banda rige **exclusivamente** el comportamiento de `visualPos` (el suavizado seguido por la cámara) y las métricas diagnósticas:
   - **Zona de Tolerancia ($\Delta_{\text{error}} \le 0.09\text{ m}$)**: Tolerancia calibrada a medio tick de movimiento regular. `pos` adopta el replay exacto. `visualPos` se mantiene libre para seguir a `pos` en el bucle de render sin tirones perceptibles. Cero correcciones registradas.
   - **Zona de Mezcla Suave ($0.09\text{ m} < \Delta_{\text{error}} \le 1.0\text{ m}$)**:
     - La posición **lógica** adopta el resultado exacto del replay: $\vec{P}_{\text{local}} \gets \vec{P}_{\text{ghost}}$. Cero *drift* en la física.
     - La posición **visual** (`visualPos`) se aproxima exponencialmente en `onRender(dt)` (60 FPS):
       $$\vec{P}_{\text{visual}} \gets \vec{P}_{\text{visual}} + (\vec{P}_{\text{local}} - \vec{P}_{\text{visual}}) \cdot (1 - 0.001^{\Delta t_{\text{safe}}})$$
       donde $\Delta t_{\text{safe}} = \min(\Delta t, 0.05)$ protege contra saltos abruptos de cámara al reanudar pestañas en segundo plano. Elimina cualquier "pop" visual perceptible. Registra `Soft/s`.
   - **Zona de Snap Directo ($1.0\text{ m} < \Delta_{\text{error}} \le 2.5\text{ m}$)**: Se adoptan inmediatamente la posición lógica y visual del replay para no interpolar a través de muros o esquinas. Registra `Soft/s`.
   - **Zona de Teletransporte / Rescate ($\Delta_{\text{error}} > 2.5\text{ m}$)**: Caída al abismo, respawn o cambio de sala. Snap autoritativo instantáneo al host y vaciado de inputs pendientes. Registra `Tele/s`.

> [!NOTE]
> **Coordinación de DESTROY, PLACE e INTERACT**: Actualmente los eventos de edición de bloques (`MSG.BLOCK`) y cofres/puertas viajan en eventos paralelos; su sincronización dentro del paquete de inputs por `seq` queda agendada para v1.17. En co-op actual, las modificaciones de bloques son globales y se aplican inmediatamente sobre la malla compartida.

---

## 5. Interpolación Temporal, Extrapolación y Estado Visual de Inanición

Para compañeros de equipo en la mazmorra:
1. **Tiempo Objetivo de Renderizado**:
   $$t_{\text{render}} = t_{\text{actual}} - 100\text{ ms}$$
2. **Interpolación Lineal y Angular**:
   Si $t_{\text{render}}$ se encuentra entre dos snapshots $S_0$ y $S_1$, se interpola con corrección circular del ángulo yaw más corto.
3. **Extrapolación Lineal de Seguridad ante Inanición**:
   Si una ráfaga de retraso en la red hace que $t_{\text{render}} > S_{\text{último}}.\text{time}$, el reconciliador extrapola cinemáticamente hasta un máximo estricto de **$150\text{ ms}$**.
4. **Indicador Visual de Congelamiento**:
   Si la inanición supera los $500\text{ ms}$, [`AvatarRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/AvatarRenderer.js) atenúa el avatar al $55\%$ de opacidad (`setFrozen(id, true)`), señalando visualmente el estado de lag sin romper la inmersión.

---

## 6. Telemetría Diagnóstica en el HUD (`?debug=1`)

El monitor [`NetworkStats.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkStats.js) reporta en tiempo real:

* **`Pred Err`**: Desfase métrico instantáneo a 3 decimales (ej. `0.012 m`).
* **`In Flight`**: Número de paquetes de input enviados pendientes de ack (típicamente 1 a 3).
* **`Soft`**: Tasa de correcciones suaves por segundo ($< 2.5\text{ m}$).
* **`Tele`**: Tasa de teletransportes o reapariciones por segundo ($> 2.5\text{ m}$).
