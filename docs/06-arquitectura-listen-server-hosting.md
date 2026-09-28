# 06. Arquitectura Listen-Server y Modelo de Hosting (Vercel + P2P)

En el desarrollo de videojuegos web multijugador sin infraestructura dedicada de backend, este modelo se implementa como un **Listen-Server (servidor anfitrión local)** ejecutado 100% en el navegador del cliente.

```
             1. Descarga inicial de la web (HTML, JS, Three.js)
        ┌─────────────────── VERCEL (Hosting) ───────────────────┐
        │                                                        │
        ▼                                                        ▼
┌─────────────────────────┐                            ┌─────────────────────────┐
│  Dispositivo 1: HOST    │                            │  Dispositivo 2: CLIENTE │
│  (Servidor del juego)   │                            │  (Jugador invitado)     │
│                         │   2. Datos del juego       │                         │
│  - Genera el terreno    │<==========================>│  - Captura toques/WASD  │
│  - Valida físicas       │   (WebRTC vía Wi-Fi local) │  - Renderiza Three.js   │
│  - Guarda puntuación    │   CERO consumo de Vercel   │  - Envía solo inputs    │
└─────────────────────────┘                            └─────────────────────────┘
```

---

## 1. Distribución de Responsabilidades

### A. Vercel (Solo al abrir la aplicación)
* **Entrega de assets estáticos**: Distribuye el bundle minificado (`index.html`, JavaScript, assets WebP y geometrías).
* **Certificado SSL / HTTPS automático**: Proporciona el entorno de contexto seguro (`https://`) obligatorio por los navegadores móviles para habilitar las APIs de WebRTC, Touch Events y WebGL 2.0.
* **Consumo cero durante la partida**: Una vez que la aplicación está cargada en la memoria RAM del teléfono, Vercel no procesa físicas, no mantiene sockets abiertos ni almacena datos en base de datos. El coste de computación para el desarrollador es **$0**.

### B. Dispositivo Host (Servidor Autoritativo)
El smartphone que presiona "Crear Sala" asume el rol de un servidor dedicado dentro de su propia pestaña:
* **Mundo Maestro**: Almacena en memoria el `Uint8Array` del grid de vóxeles, la posición de todas las entidades y las variables de estado (puntuación, tiempo).
* **Bucle de Físicas Autoritativo**: Ejecuta el bucle fijo a 30 Hz calculando colisiones AABB, gravedad y velocidades.
* **Árbitro de Reglas**: Cuando un cliente solicita una acción (ej. "destruir bloque en (x, y, z)"), el Host valida que la distancia sea legal y que el bloque exista antes de modificar el estado y propagarlo.

### C. Dispositivo Cliente (Terminal Gráfico)
* **Sin sobrecarga de lógica**: No calcula la simulación global ni el comportamiento de otros jugadores.
* **Captura de Input**: Lee el joystick virtual de Nipple.js y botones de acción y los envía como paquetes de 9 a 13 bytes.
* **Renderizado con Interpolación**: Renderiza el mundo a 60 FPS suavizando las posiciones recibidas del Host mediante interpolación lineal (*Lerp*).

---

## 2. Negociación y Enlace (Signaling con PeerJS)

Para enlazar los dispositivos sin necesidad de configurar un backend propio:
1. **Creación de Sala**: El Host se conecta durante ~1 segundo al servidor de señalización gratuito de PeerJS y reserva un identificador corto (ej. `SALA-482`).
2. **Unión de Cliente**: El segundo jugador ingresa a la misma URL de Vercel, escribe `SALA-482` y presiona "Unirse".
3. **Intercambio ICE/SDP (~1 segundo)**: El servidor de señalización únicamente intercambia los candidatos de red local (IPs en la misma subred Wi-Fi).
4. **Conmutación a Tráfico Local Directo**: Tras la negociación, el canal `RTCDataChannel` queda establecido de forma P2P a través del router Wi-Fi o punto de acceso (*hotspot*), con latencias ultra bajas de **1 a 5 ms**.

---

## 3. Ventajas y Limitaciones del Modelo

### Ventajas
* **Costo Cero de Infraestructura**: Millones de partidas pueden jugarse en simultáneo sin generar costes de servidores dedicados (AWS EC2, Google Cloud, DigitalOcean). Todo el cómputo y ancho de banda recae en el hardware de los jugadores.
* **Latencia LAN Mínima**: Al no viajar a servidores foráneos, la reactividad es inmediata.
* **Despliegues Continuos Inmediatos**: Cada `git push` a la rama principal en GitHub despliega la última versión estática en Vercel en segundos.

### Limitaciones Naturales
* **Dependencia del Host**: Si el jugador que actúa como Host cierra la pestaña del navegador o bloquea su teléfono, la sala se cancela inmediatamente (comportamiento idéntico a las partidas LAN de Minecraft clásico).
* **Consumo Térmico/Batería en el Host**: El dispositivo anfitrión tiene un consumo de batería ligeramente superior al ejecutar la física de ambos jugadores y el broadcast de red.
