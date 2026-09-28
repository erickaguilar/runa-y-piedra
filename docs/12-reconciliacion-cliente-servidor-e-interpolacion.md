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

Para sincronizar la física vertical autoritativa (saltos y caídas al abismo) y evitar divergencias en cadena, se ampliaron 5 bytes por entidad en el paquete `SNAPSHOT` en [`Protocol.js`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js), alcanzando 24 bytes por entidad (con compatibilidad retroactiva con 19 y 17 bytes):

### Paquete `SNAPSHOT` (24 bytes por entidad)
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

## 3. Buffer de Jitter y Sanitización de Inputs en el Host (`InputQueue.js`)

Los navegadores móviles ejecutan temporizadores con fluctuaciones naturales ($\pm 5\text{ a }15\text{ ms}$). Sin un buffer de jitter, el host recibiría 0 inputs en un tick y 2 en el siguiente, provocando micro-tirones visuales.

[`InputQueue.js`](file:///data/data/com.termux/files/home/develop/game/src/network/InputQueue.js) resuelve esto mediante:
1. **Desacoplamiento Temporal**: Encola los inputs recibidos por conexión WebRTC y entrega exactamente **un input por tick de simulación (30 Hz)** en el host.
2. **Sanitización y Anti-Speedhack**:
   - Clamping del vector de movimiento: si $\sqrt{dx^2 + dz^2} > 1.0$, se normaliza a magnitud $1.0$.
   - Normalización angular de Yaw al rango canónico $[-\pi, \pi]$.
3. **Amortiguación Suave ante Pérdidas**: Si un tick no cuenta con input nuevo por jitter extremo, decae el último input conocido al $85\%$ hasta detenerse suavemente ($0\text{ m/s}$), evitando que el avatar continúe corriendo indefinidamente contra paredes.

---

## 4. Algoritmo de Reconciliación del Jugador Local (`ClientReconciler.js`)

El proceso en [`ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js) opera en tiempo de tick y render:

1. **Registro Continuo de Inputs (`recordInput`)**:
   En cada tick de física (`onTick` a 30 Hz), con $\Delta t$ fijo idéntico al del host ($1/30\text{ s}$):
   $$\text{pendingInputs.push}(\{ \text{seq}, \Delta t_{\text{fijo}}, \text{forward}, \text{right}, \text{yaw}, \text{time} \})$$
2. **Descarte de Inputs Confirmados**:
   $$\text{pendingInputs} = \text{pendingInputs.filter}(\text{inp} \to \text{inp.seq} > \text{lastInputSeq})$$
3. **Simulación de Replay Determinista (Zero-GC)**:
   Se utiliza un `ghostPlayer` pre-asignado que comienza en la coordenada autoritativa $(X_h, Y_h, Z_h)$ e **inicializa su velocidad vertical (`velY`) y estado `onGround` autoritativos**. Se itera sobre todos los inputs pendientes en vuelo ejecutando `simulationEngine.integratePlayer(ghost, inp.dt)`.
4. **Cálculo y Resolución de Error de Predicción**:
   $$\Delta_{\text{error}} = \sqrt{(X_{\text{ghost}} - X_{\text{local}})^2 + (Y_{\text{ghost}} - Y_{\text{local}})^2 + (Z_{\text{ghost}} - Z_{\text{local}})^2}$$
   - **Zona de Tolerancia ($\Delta_{\text{error}} \le 0.09\text{ m}$)**: Tolerancia calibrada a medio tick de movimiento regular ($\sim 0.16\text{ m}$ por tick a $4.8\text{ m/s}$). Absorbe jitter de red sin disparar micro-ajustes innecesarios.
   - **Zona de Corrección Suave ($0.09\text{ m} < \Delta_{\text{error}} \le 2.5\text{ m}$)**: Se sincronizan las posiciones ($X, Y, Z$) y la física vertical (`vel.y` y `onGround`) recalculadas por el replay, registrando la corrección en la telemetría.
   - **Zona de Teletransporte / Reaparición ($\Delta_{\text{error}} > 2.5\text{ m}$)**: Desfase crítico por caída al abismo o respawn. Se fuerza la posición autoritativa instantánea y se limpia el buffer de inputs pendientes.

---

## 5. Interpolación Temporal y Extrapolación de Seguridad en Entidades Remotas

Para compañeros de equipo en la mazmorra:
1. **Tiempo Objetivo de Renderizado**:
   $$t_{\text{render}} = t_{\text{actual}} - 100\text{ ms}$$
2. **Interpolación Lineal y Angular**:
   Si $t_{\text{render}}$ se encuentra entre dos snapshots $S_0$ y $S_1$, se interpola con corrección circular del ángulo yaw más corto.
3. **Extrapolación Lineal de Seguridad ante Inanición**:
   Si una ráfaga de retraso en la red hace que $t_{\text{render}} > S_{\text{último}}.\text{time}$, en lugar de congelar bruscamente al avatar, el reconciliador extrapola su posición usando la velocidad del último intervalo hasta un máximo estricto de **$150\text{ ms}$**, preservando la fluidez sin proyectar entidades a través de muros.

---

## 6. Telemetría Diagnóstica en el HUD (`?debug=1`)

El monitor [`NetworkStats.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkStats.js) reporta en tiempo real:

* **`Pred Err`**: Desfase métrico instantáneo (ej. `0.015 m`). Coloreado en azul celeste ($\le 0.09\text{ m}$) o ámbar ($> 0.09\text{ m}$).
* **`In Flight`**: Número de paquetes de input enviados pendientes de ack (típicamente 1 a 3 a 30 Hz).
* **`Corr/s`**: Frecuencia de correcciones físicas por segundo (0/s en movimiento libre; incrementa de forma transparente en colisiones imprevistas).
