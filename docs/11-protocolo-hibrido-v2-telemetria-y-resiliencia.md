# 11. Protocolo Híbrido v2, Telemetría de Red y Resiliencia WebRTC

Este documento detalla la arquitectura de red v2 implementada en el motor, integrando buffers Zero-GC de alto rendimiento sobre `DataView`, versionado estricto de protocolo, canales WebRTC fiables para Wi-Fi local, sonda periódica de latencia (RTT Ping/Pong) y monitor de diagnóstico visual en tiempo real activable mediante `?debug=1`.

---

## 1. Motivación y Diagnóstico de Riesgos (v1 vs v2)

Durante la evaluación de rendimiento y estabilidad en redes inalámbricas móviles, se identificaron cuatro factores críticos en el protocolo anterior:
1. **Presión sobre el Garbage Collector (GC Pauses)**: La serialización continua con asignación de arrays u objetos en cada tick generaba micro-tirones (*frame drops*) periódicos en procesadores móviles.
2. **Congelamiento de Réplicas Visuales por Descarte de Paquetes**: Con `reliable: false`, ráfagas de pérdida en Wi-Fi descartaban snapshots consecutivos, provocando pausas abruptas en el suavizado *Lerp* de los avatares remotos.
3. **Falta de Detección de Desincronización y Secuencia**: Sin números de secuencia (`seq`) ni timestamps, era imposible cuantificar la pérdida real de paquetes ni calcular el *Round-Trip Time* (RTT) exacto entre jugadores.
4. **Incompatibilidad Silenciosa entre Versiones**: Si un cliente se conectaba con un cliente desactualizado frente al anfitrión, el juego fallaba de manera impredecible sin un mensaje de diagnóstico comprensible.

---

## 2. Especificación del Protocolo Binario Híbrido v2

El protocolo v2 separa el tráfico en dos categorías:
- **Camino Caliente (*Hot Path*)**: Buffers estáticos pre-asignados y vistas `DataView` nativas sin recolección de basura (*Zero-GC*) a 20-30 Hz.
- **Eventos Discretos (*Cold Path*)**: Mensajes binarios compactos con codificación de texto y datos estructurados para acciones de juego (puertas, cofres, cambio de nivel).

Constante de versión:
```javascript
export const PROTOCOL_VERSION = 2;
```

### Tabla de Códigos de Operación (`MSG`)

| Opcode | Nombre | Frecuencia | Tamaño | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| `0x01` | `INPUT` | 30 Hz | 15 bytes | Input de movimiento del cliente al host |
| `0x02` | `SNAPSHOT` | 20 Hz | $8 + N \times 17$ bytes | Estado autoritativo de entidades emitido por el host |
| `0x03` | `BLOCK` | Bajo demanda | 14 bytes | Edición o destrucción de bloques en el voxel map |
| `0x04` | `INIT` | Conexión | Variable | Asignación de ID local + Voxel map completo + Version byte |
| `0x05` | `DOOR` | Bajo demanda | 2 bytes | Sincronización de apertura de portones |
| `0x06` | `PLAYER_META`| Evento | Variable | Sincronización de nombre, clase y color del aventurero |
| `0x07` | `CHEST_OPEN` | Bajo demanda | 2 bytes | Apertura de cofre autoritativa |
| `0x08` | `PING` | 1 Hz | 5 bytes | Sonda de latencia emitida por el cliente con timestamp local |
| `0x09` | `PONG` | 1 Hz | 5 bytes | Eco inmediato del host para cálculo de RTT |
| `0x0A` | `HOST_CLOSING`| Desconexión | 2 bytes | Aviso de salida ordenada del anfitrión |
| `0x0B` | `LEVEL_CHANGE`| Cambio mapa | $2 + L$ bytes | Conmutación dinámica del nivel en caliente |

---

## 3. Estructura de Paquetes en el Hot Path

### A. Paquete de Input del Jugador (`0x01` — 15 bytes)
Reutiliza un `ArrayBuffer(15)` estático sin crear un solo objeto en memoria:
- `Offset 0` (`Uint8`): `0x01` (`MSG.INPUT`)
- `Offset 1-2` (`Uint16`): Número de secuencia cíclico `seq` ($0 - 65535$)
- `Offset 3-6` (`Float32`): Componente lateral `inputRight` ($dx$)
- `Offset 7-10` (`Float32`): Componente frontal `inputForward` ($dz$)
- `Offset 11-14` (`Float32`): Ángulo de rotación horizontal `yaw`

### B. Paquete de Snapshot Autoritativo (`0x02` — $8 + N \times 17$ bytes)
Transmite la posición de todos los jugadores activos en la sala:
- `Offset 0` (`Uint8`): `0x02` (`MSG.SNAPSHOT`)
- `Offset 1-2` (`Uint16`): Número de secuencia cíclico `seq` del snapshot
- `Offset 3-6` (`Uint32`): Timestamp de simulación (`performance.now() | 0`)
- `Offset 7` (`Uint8`): Número de entidades incluidas ($N$)
- **Bloques por Entidad (17 bytes cada uno)**:
  - `Offset +0` (`Uint8`): `playerId`
  - `Offset +1` (`Float32`): Posición X
  - `Offset +5` (`Float32`): Posición Y
  - `Offset +9` (`Float32`): Posición Z
  - `Offset +13` (`Float32`): Rotación Yaw

### C. Sonda de Latencia RTT Ping / Pong (`0x08` y `0x09` — 5 bytes)
- `Offset 0` (`Uint8`): `0x08` (PING) o `0x09` (PONG)
- `Offset 1-4` (`Uint32`): Marca de tiempo del cliente (`performance.now() | 0`)

El host rebota el timestamp sin necesidad de sincronización de reloj entre dispositivos. El cliente calcula:
$$\text{RTT} = \text{performance.now}() - \text{time}_{\text{payload}}$$
Aplicando un filtro de media móvil exponencial para amortiguar el jitter:
$$\text{RTT}_{\text{filtrado}} = 0.7 \cdot \text{RTT}_{t-1} + 0.3 \cdot \text{RTT}_{\text{actual}}$$

---

## 4. Verificación Estricta y Cierre Ordenado

### A. Handshake con Verificación de Versión (`INIT`)
El segundo byte del paquete `INIT` transporta `PROTOCOL_VERSION = 2`.
Si un cliente con una versión obsoleta (v1) o incompatible intenta ingresar, `NetworkManager` dispara el evento `version-mismatch`:
```javascript
if (init.version !== Proto.PROTOCOL_VERSION) {
  this.dispatchEvent(new CustomEvent('version-mismatch', {
    detail: { hostVersion: init.version, clientVersion: Proto.PROTOCOL_VERSION }
  }));
}
```
La interfaz notifica al usuario de forma clara con una alerta de navegador y redirige a la raíz para recargar los assets actualizados.

### B. Desconexión Ordenada (`HOST_CLOSING`)
Para evitar que los clientes se queden congelados indefinidamente cuando el anfitrión cierra la pestaña o vuelve atrás en el navegador, el evento `beforeunload` del host emite inmediatamente un paquete `HOST_CLOSING` (`0x0A`):
```javascript
window.addEventListener('beforeunload', () => {
  if (this.isHost && this.connections.length > 0) {
    this.broadcast(Proto.serializeHostClosing(0));
  }
});
```
Los clientes capturan el evento, muestran un mensaje narrativo en el HUD y regresan al menú principal de forma limpia.

---

## 5. Telemetría de Red en Tiempo Real (`NetworkStats.js`)

Se diseñó la clase [`NetworkStats.js`](file:///data/data/com.termux/files/home/develop/game/src/network/NetworkStats.js) que calcula métricas acumuladas y ventanas deslizantes de 1 segundo:

- **Modo y Topología**: `HOST (N peers)`, `CLIENT (1 host)` o `OFFLINE`.
- **RTT (Ping)**: Latencia de ida y vuelta en milisegundos con indicador visual por colores:
  - $\le 30\text{ ms}$: Verde esmeralda (Óptimo en Wi-Fi local).
  - $31 - 80\text{ ms}$: Amarillo ámbar (Aceptable).
  - $> 80\text{ ms}$: Rojo carmesí (Congestión o mala cobertura).
- **Rendimiento de Paquetes**: `PPS In` / `PPS Out` (paquetes recibidos/enviados por segundo).
- **Ancho de Banda**: `KB/s In` / `KB/s Out` consumidos en tiempo real.
- **Contador de Pérdidas de Secuencia**: Detección de paquetes fuera de orden o descartados mediante comprobación de saltos en `seq`.

### Activación del Panel de Diagnóstico
1. **Parámetro URL**: Acceder con `?debug=1` en la barra de direcciones.
2. **Modal de Configuración (⚙️)**: Sección *"Telemetría de Red (?debug=1)"* con botones interactivos *Oculto* / *Activo (Overlay RTT)*.
3. **Persistencia**: Estado guardado automáticamente en `localStorage.getItem('dungeon_debug')`.
