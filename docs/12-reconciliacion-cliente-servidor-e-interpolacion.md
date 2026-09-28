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

## 2. Estructura de Paquetes en Protocolo v2.1

Para posibilitar el ack explícito sin canales de mensajes dedicados, se ampliaron 2 bytes por entidad en el paquete `SNAPSHOT` en [`Protocol.js`](file:///data/data/com.termux/files/home/develop/game/src/network/Protocol.js):

### Paquete `SNAPSHOT` (19 bytes por entidad)
- `Offset 0` (`Uint8`): `0x02` (`MSG.SNAPSHOT`)
- `Offset 1-2` (`Uint16`): Número de secuencia cíclico `seq` del snapshot
- `Offset 3-6` (`Uint32`): Timestamp de simulación (`simTime` en ms)
- `Offset 7` (`Uint8`): Número de jugadores ($N$)
- **Bloque por Jugador (19 bytes)**:
  - `Offset +0` (`Uint8`): `playerId`
  - `Offset +1` (`Uint16`): `lastInputSeq` (último paquete de input del cliente confirmado e integrado por el host)
  - `Offset +3` (`Float32`): Posición X autoritativa
  - `Offset +7` (`Float32`): Posición Y autoritativa
  - `Offset +11` (`Float32`): Posición Z autoritativa
  - `Offset +15` (`Float32`): Rotación Yaw autoritativa

---

## 3. Algoritmo de Reconciliación del Jugador Local

El proceso en [`ClientReconciler.js`](file:///data/data/com.termux/files/home/develop/game/src/network/ClientReconciler.js) opera en tiempo de tick y render:

1. **Registro Continuo de Inputs (`recordInput`)**:
   En cada tick de física (`onTick` a 30 Hz):
   $$\text{pendingInputs.push}(\{ \text{seq}, \Delta t, \text{forward}, \text{right}, \text{yaw}, \text{time} \})$$
2. **Descarte de Inputs Confirmados**:
   $$\text{pendingInputs} = \text{pendingInputs.filter}(\text{inp} \to \text{inp.seq} > \text{lastInputSeq})$$
3. **Simulación de Replay Determinista (Zero-GC)**:
   Se utiliza un `ghostPlayer` estático pre-asignado que comienza exactamente en la coordenada autoritativa confirmada $(X_h, Y_h, Z_h)$. Se itera sobre todos los inputs pendientes en vuelo y se re-ejecuta `simulationEngine.integratePlayer(ghost, inp.dt)`.
4. **Cálculo y Resolución de Error de Predicción**:
   $$\Delta_{\text{error}} = \sqrt{(X_{\text{ghost}} - X_{\text{local}})^2 + (Y_{\text{ghost}} - Y_{\text{local}})^2 + (Z_{\text{ghost}} - Z_{\text{local}})^2}$$
   - **Zona de Tolerancia ($\Delta_{\text{error}} \le 0.04\text{ m}$)**: Predicción válida, no se aplica corrección visual, preservando la máxima fluidez.
   - **Zona de Corrección Suave ($0.04\text{ m} < \Delta_{\text{error}} \le 2.5\text{ m}$)**: Se adopta la posición recalculada por el replay ($X_{\text{ghost}}, Y_{\text{ghost}}, Z_{\text{ghost}}$) y se incrementa el contador de correcciones.
   - **Zona de Teletransporte / Reaparición ($\Delta_{\text{error}} > 2.5\text{ m}$)**: El jugador cayó al abismo, reapareció en un checkpoint o cambió de nivel. Se fuerza la posición autoritativa instantánea y se limpia el buffer de inputs pendientes.

---

## 4. Interpolación Temporal de Entidades Remotas (Snapshot Buffering)

Para los compañeros de equipo en la mazmorra, la réplica no debe predecirse por inputs ajenos, sino interpolarse temporalmente entre dos instantes del pasado para absorber el jitter de la red:

1. **Tiempo Objetivo de Renderizado**:
   $$t_{\text{render}} = t_{\text{actual}} - 100\text{ ms}$$
2. **Localización de Snapshots Envolventes**:
   Se buscan en el buffer circular de 10 snapshots los dos estados $S_0$ y $S_1$ tales que:
   $$S_0.\text{time} \le t_{\text{render}} \le S_1.\text{time}$$
3. **Interpolación Lineal y Angular**:
   $$\alpha = \frac{t_{\text{render}} - S_0.\text{time}}{S_1.\text{time} - S_0.\text{time}} \in [0, 1]$$
   $$\vec{P}(t) = \vec{S_0}.pos + (\vec{S_1}.pos - \vec{S_0}.pos) \cdot \alpha$$
   $$\Delta \text{yaw} = ((\text{yaw}_1 - \text{yaw}_0 + 3\pi) \pmod{2\pi}) - \pi$$
   $$\text{yaw}(t) = \text{yaw}_0 + \Delta \text{yaw} \cdot \alpha$$

Este mecanismo elimina por completo los saltos, congelamientos o micro-tirones cuando se pierden paquetes en Wi-Fi.

---

## 5. Telemetría Diagnóstica en el HUD (`?debug=1`)

El monitor [`NetworkStats.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkStats.js) ahora reporta en tiempo real:

* **`Pred Err`**: Desfase métrico instantáneo entre predicción del cliente y confirmación del host. Se colorea en azul celeste ($\le 0.08\text{ m}$) o ámbar ($> 0.08\text{ m}$).
* **`In Flight`**: Número de paquetes de input enviados pendientes de ack (típicamente 1 a 3 a 30 Hz).
* **`Corr/s`**: Frecuencia de correcciones físicas por segundo (0/s en movimiento libre; incrementa brevemente en colisiones complejas).
