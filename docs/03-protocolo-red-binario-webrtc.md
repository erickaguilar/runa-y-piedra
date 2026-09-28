# 03. Protocolo de Red Binario y Señalización WebRTC

## 1. Topología Listen-Server P2P

El sistema adopta una **Topología en Estrella** donde uno de los teléfonos móviles actúa como Host (servidor autoritativo de físicas y reglas de juego) y los demás se conectan directamente a él a través de canales de datos WebRTC (`RTCDataChannel`).

```
                +-------------------+
                |   Móvil Host      |
                | (Listen-Server)   |
                +---------+---------+
                          |
             +------------+------------+
             |                         |
    +--------v--------+       +--------v--------+
    | Móvil Cliente 1 |       | Móvil Cliente 2 |
    +-----------------+       +-----------------+
```

---

## 2. Métodos de Señalización

### A. Señalización por PIN en la Nube (PeerJS)
1. El Host solicita un identificador a la infraestructura de señalización de PeerJS: `vox-[PIN]` (ejemplo: `vox-7341`).
2. El Cliente ingresa el PIN `7341` en la interfaz.
3. PeerJS intercambia el SDP (Session Description Protocol) y los candidatos ICE en < 1 segundo.
4. Una vez conectado, la comunicación fluye exclusivamente **P2P directa** entre los teléfonos vía Wi-Fi local sin pasar por la nube.
5. Parámetros de conexión óptimos:
   ```typescript
   peer.connect(hostId, {
     reliable: false,         // Modo UDP/SCTP rápido
     serialization: 'none'    // Transferencia binaria en crudo (ArrayBuffer)
   });
   ```

### B. Señalización Sin Servidor (Offline QR Handshake)
Cuando no hay conexión a internet disponible:
1. El Host crea `RTCPeerConnection` y espera a que `iceGatheringState === 'complete'`.
2. El SDP se filtra (removiendo codecs de audio/video innecesarios) y se comprime con `CompressionStream('deflate')` a ~200 bytes.
3. Se proyecta un código QR en la pantalla del Host.
4. El Cliente escanea el QR con la cámara trasera (`BarcodeDetector` o `jsQR`) y genera el SDP de respuesta (Answer QR).
5. El Host escanea la respuesta del Cliente y el canal WebRTC se abre de forma 100% desconectada.

---

## 3. Especificación de Paquetes Binarios (Zero-GC)

Se emplean buffers `ArrayBuffer` estáticos pre-asignados y vistas `DataView` para eliminar las pausas de recolección de basura.

### A. Paquete de Movimiento (13 bytes) — `0x01`
Enviado continuamente (30 a 60 Hz):
- `Offset 0` (`Uint8`): `0x01` (Tipo de paquete)
- `Offset 1-4` (`Float32`): Posición X en metros (Little Endian)
- `Offset 5-8` (`Float32`): Posición Z en metros (Little Endian)
- `Offset 9-12` (`Float32`): Rotación Yaw en radianes (Little Endian)

### B. Paquete de Estado Completo 3D (17 bytes) — `0x02`
- `Offset 0` (`Uint8`): `0x02`
- `Offset 1-4` (`Float32`): Posición X
- `Offset 5-8` (`Float32`): Posición Y
- `Offset 9-12` (`Float32`): Posición Z
- `Offset 13-16` (`Float32`): Rotación Yaw

### C. Paquete de Modificación de Bloque (5 bytes) — `0x03`
Enviado bajo demanda cuando se coloca o destruye un bloque:
- `Offset 0` (`Uint8`): `0x03`
- `Offset 1` (`Uint8`): Coordenada X (0 a 31)
- `Offset 2` (`Uint8`): Coordenada Y (0 a 15)
- `Offset 3` (`Uint8`): Coordenada Z (0 a 31)
- `Offset 4` (`Uint8`): Tipo de bloque (0 = Vacío/Aire, 1 = Bloque activo)

---

## 4. Interpolación Suave en el Cliente (Entity Lerp a 60 FPS)

Dado que los paquetes de posición viajan a una frecuencia de 20-30 Hz para preservar batería y ancho de banda, el cliente calcula una interpolación lineal suave (*Lerp*) en cada cuadro renderizado a 60 FPS:

$$\vec{Pos}_{t} = \vec{Pos}_{t-1} + (\vec{Pos}_{objetivo} - \vec{Pos}_{t-1}) \cdot \min(1.0, \Delta t \cdot 15.0)$$

Para la rotación angular (Yaw), se calcula la diferencia cíclica más corta ($[-\pi, \pi]$) evitando rotaciones bruscas de 360 grados al cruzar el límite angular.
