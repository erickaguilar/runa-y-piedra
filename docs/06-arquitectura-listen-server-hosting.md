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
* **Consumo Térmico/Batería en el Host**: El dispositivo anfitrión tiene un consumo de batería ligeramente superior al ejecutar la física de todos los jugadores y el broadcast de red a 20–30 Hz.

---

## 4. Gestión de Desconexión del Host (Fail-Safe & Graceful Shutdown)

Al no contar con un servidor backend centralizado para sostener el socket, el juego implementa una arquitectura defensiva en capas para manejar cualquier tipo de interrupción del Host sin dejar al cliente en estados inconsistentes:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CIERRE O CAÍDA DEL DISPOSITIVO HOST                   │
└────────────────────────────────────────────────────────────────────────┘
          │                                           │
          ▼ [Salida Ordenada]                         ▼ [Cierre Abrupto / Red]
┌───────────────────────────────────┐       ┌───────────────────────────────────┐
│ Eventos beforeunload / pagehide   │       │ Caída de socket WebRTC / Timeout  │
│ Envío de paquete binario:         │       │ Disparo de evento safe.on('close')│
│ HOST_CLOSING (0x07) por game-safe │       │ o pérdida de Heartbeat/RTT        │
└───────────────────────────────────┘       └───────────────────────────────────┘
                  │                                           │
                  └─────────────────────┬─────────────────────┘
                                        ▼
                      ┌───────────────────────────────────┐
                      │    DETECCIÓN EN CLIENTE INVITADO   │
                      ├───────────────────────────────────┤
                      │ 1. Interrupción de bucle de juego │
                      │ 2. Audio procedural de pérdida    │
                      │ 3. Toast narrativo temático:      │
                      │    "El anfitrión ha abandonado"   │
                      │ 4. Limpieza Zero-Memory WebRTC    │
                      │ 5. Retorno suave al menú/lobby    │
                      └───────────────────────────────────┘
```

### A. Salida Limpia y Controlada (Graceful Teardown)
* **Captura de Ciclo de Vida del Navegador**: El Host escucha los eventos de ventana `beforeunload` y `pagehide` (crucial para móviles cuando el navegador suspende la pestaña o el usuario cambia de aplicación).
* **Paquete Binario `HOST_CLOSING` (`0x07`)**: Antes de que la memoria se libere, el Host despacha un paquete binario ultra-compacto por el canal seguro garantizado `game-safe` (`reliable: true`), notificando la causa del cierre:
  * `0`: Cierre voluntario / Abandono de expedición.
  * `1`: Sala completa (`ROOM_FULL`, aforo superado de 5 jugadores).

### B. Desconexión Abrupta (Crash, Batería Agotada o Corte de Señal)
* Si el teléfono del Host muere instantáneamente o pierde cobertura Wi-Fi sin poder disparar `beforeunload`, el cliente detecta el fallo por dos vías:
  1. **Disparo de `safe.on('close')` en WebRTC**: El canal `RTCDataChannel` notifica de inmediato la ruptura del socket P2P. El cliente despacha internamente `host-closing` garantizando que no existan bucles colgados.
  2. **Monitor RTT & Heartbeat**: El sistema de telemetría vigila la pérdida de paquetes `PING`/`PONG` a 1 Hz; si los acuses dejan de recibirse durante más de 3 segundos consecutivos, el enlace se declara muerto.

### C. Experiencia de Usuario (UX) ante la Desconexión
* El cliente no experimenta cuelgues ni pantallas congeladas.
* Se reproduce un efecto sonoro procedural de daño/alerta con Web Audio API.
* Se despliega un aviso narrativo flotante en el HUD: *"🏰 El anfitrión ha abandonado o cerrado la partida."*
* Tras 1.5 segundos de gracia para lectura, el cliente realiza una limpieza completa de memoria (`disconnect()`, destrucción de mallas Three.js y reseteo de reconciliador) y regresa de forma limpia al vestíbulo principal.

---

## 5. Hoja de Ruta: Migración Automática de Host (*Host Migration*)

Para futuras iteraciones avanzadas de la arquitectura P2P de *Runa y Piedra*, el diseño contempla un sistema de **Migración Automática de Host** que permitirá a los clientes continuar la mazmorra sin interrupción si el anfitrión se marcha:

```
┌────────────────┐      (Host cae)      ┌────────────────┐      (Nuevo Host)    ┌────────────────┐
│  Host Original │ ═══════════════════> │ Elección de    │ ═══════════════════> │ Invitado P2    │
│  (Desconectado)│                      │ Líder (RAFT)   │                      │ (Listen-Server)│
└────────────────┘                      └────────────────┘                      └────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │ Restaura Snapshot     │
                                    │ - Vóxeles modificados │
                                    │ - Puertas abiertas    │
                                    │ - Llaves e inventario │
                                    │ - Checkpoints y vidas │
                                    └───────────────────────┘
```

### Fases de la Migración Planificada:
1. **Elección Determinista del Nuevo Líder**:
   * Algoritmo de consenso distribuido ligero inspirado en Raft.
   * Criterio determinista: El peer con menor RTT acumulado o el `playerId` más longevo en la sala asume automáticamente el liderazgo.
2. **Replicación Periódica del Estado Maestro (Snapshot Distribuido)**:
   * El Host actual difunde cada 5 segundos un resumen de sincronización de mundo (`WORLD_STATE_SUMMARY`):
     * Estado del grid de vóxeles modificados (bloques rotos/colocados).
     * Registro binario de puertas desbloqueadas (`doorsOpenMask`).
     * Lista de cofres saqueados y llaves activas.
     * Vidas restantes y checkpoint seguro de cada héroe.
3. **Reapertura de Sala en PeerJS**:
   * El nuevo anfitrión electo instancia de inmediato su propio `Peer` con una sala derivada identificable (ej. `VOXELSALA-XXXX-MIGRATE`).
   * Los clientes restantes conmutan sus canales WebRTC duales hacia el nuevo Host en menos de 1.8 segundos.
4. **Respaldo Local de Emergencia (`sessionStorage`)**:
   * Como salvaguarda intermedia previa a la migración automática completa, si el Host se desconecta, cada cliente preserva en memoria local el progreso de nivel, llaves y botín acumulado, permitiendo pulsar *"Recrear Mazmorra"* para reanudar el capítulo actual sin empezar desde cero.

---

## 6. Flujo de Conexión y Onboarding (Código QR, PIN y Enlace Directo)

El juego elimina cualquier fricción de registro o configuración de red. El onboarding cooperativo está optimizado para dispositivos móviles en 3 pasos rápidos:

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│       DISPOSITIVO 1 (HOST)      │                 │     DISPOSITIVO 2 (INVITADO)    │
├─────────────────────────────────┤                 ├─────────────────────────────────┤
│ 1. Pulsa "Crear Sala".          │                 │ 1. Abre la cámara del celular.  │
│ 2. El sistema reserva el PIN    │  ESCANEADO QR   │ 2. Apunta al código QR en       │
│    (ej. 4821) en PeerJS.        │ ──────────────> │    la pantalla del Host.        │
│ 3. Muestra en pantalla el QR    │   (1 Segundo)   │ 3. Abre el enlace (?join=4821). │
│    y el enlace de invitación.   │                 │ 4. ¡Conexión WebRTC directa!    │
└─────────────────────────────────┘                 └─────────────────────────────────┘
```

1. **Creación Instantánea (Host)**:
   * Al pulsar **"Crear Sala"**, se genera un PIN aleatorio de 4 dígitos (ej. `4821`), se abre la sala `VOXELSALA-4821` y la biblioteca [`qrcode`](https://github.com/soldair/node-qrcode) renderiza un código QR dinámico de alta fidelidad directamente en el `<canvas id="settings-qr-canvas">`.
2. **Unión Zero-Typing (Invitado)**:
   * El segundo jugador simplemente apunta la cámara de su smartphone a la pantalla del anfitrión.
   * La cámara reconoce la URL parametrizada (`https://runa-y-piedra.vercel.app/?join=4821`) y abre el navegador conectando inmediatamente ambos canales WebRTC (`game-safe` y `game-hot`).
3. **Compartir en Mensajería (WhatsApp / Telegram)**:
   * El botón **"Compartir en Mensajería"** invoca la Web Share API nativa (`navigator.share`) para enviar el enlace directo con un toque a amigos remotos o en grupos de chat.
4. **Selección de Héroe Sin Duplicados**:
   * Cada jugador escoge su clase favorita (Guardián, Mago, Pícaro, Clérigo o Paladín).
   * El Host valida que no haya clases repetidas, garantizando un equipo balanceado y colores distintivos en el mapa vóxel.

