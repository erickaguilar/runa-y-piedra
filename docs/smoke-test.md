# Protocolo de Smoke Test Multijugador — Runa y Piedra

Este documento establece el protocolo obligatorio de verificación end-to-end antes de cada merge a `main` o publicación de versión en producción.

---

## 1. Por qué este protocolo es obligatorio

Un juego que compila limpio (`npm run build`) y pasa todos sus tests automatizados (`npm test`) no garantiza por sí solo que dos dispositivos o navegadores reales puedan conectarse e interactuar en tiempo real bajo condiciones de red variables.

El ciclo de vida de WebRTC (señalización PeerJS, STUN, negociación ICE, apertura asíncrona de DataChannels y entrega de paquetes en ráfaga) requiere una comprobación manual de **2 minutos** antes de cada entrega importante.

---

## 2. Los 7 Pasos del Smoke Test

Abre dos ventanas del navegador (una normal como **Anfitrión** y una en modo incógnito como **Invitado**):

| Paso | Acción | Resultado Esperado |
| :---: | :--- | :--- |
| **1** | **Crear y Unirse**<br>El Anfitrión pulsa **CREAR MAZMORRA** y copia el PIN o enlace.<br>El Invitado ingresa el PIN o accede vía URL `?join=PIN`. | Ambos jugadores entran a la partida.<br>La notificación narrativa muestra la bienvenida con el nombre y clase de cada aventurero.<br>La lista de grupo en ajustes muestra a ambos miembros. |
| **2** | **Movimiento del Invitado**<br>El Invitado camina y salta usando el joystick/WASD y el botón SALTAR. | El Anfitrión ve al avatar del Invitado moverse y saltar de forma fluida y sincronizada.<br>El Invitado no sufre rubber-banding ni se queda clavado en el spawn. |
| **3** | **Movimiento del Anfitrión**<br>El Anfitrión camina y gira por la sala. | El Invitado ve al avatar del Anfitrión desplazarse con animación de marcha e interpolación suave (sin congelamientos ni teletransportes bruscos). |
| **4** | **Interacción del Invitado**<br>El Invitado se acerca a un cofre o puerta y pulsa **USAR** (o tecla E). | El evento se replica en el Anfitrión:<br>El cofre se abre con sonido y partículas en ambas pantallas.<br>Si otorga una llave, el HUD del Invitado se actualiza y el Anfitrión ve el estado sincronizado. |
| **5** | **Interacción del Anfitrión**<br>El Anfitrión abre la puerta con su llave o empuja una losa. | El Invitado ve la puerta abrirse inmediatamente y puede atravesar el umbral sin colisiones fantasma. |
| **6** | **Desconexión Ordenada**<br>El Invitado cierra la pestaña o sale de la partida. | El Anfitrión recibe el evento `peer-left`:<br>Se muestra el mensaje narrativo *"⚠️ [Nombre] ha abandonado la partida"*, el avatar remoto desaparece de Three.js y la cola de inputs se limpia sin memory leaks. |
| **7** | **Reconexión / Estado Persistente**<br>Un nuevo Invitado se une a la misma sala en curso. | El nuevo jugador recibe el mapa actual con las puertas ya abiertas, cofres ya saqueados y posición sincronizada. |

---

## 3. Prueba de Estrés y Latencia (Slow 4G / Throttling)

Para garantizar que el juego tolere fluctuaciones de red móvil sin congelarse:

1. En la pestaña del **Invitado**, abre Chrome DevTools (`F12` o `Ctrl + Shift + I`).
2. Ve a la pestaña **Network** (Red).
3. En el selector de aceleración (Throttling), cambia de *"No throttling"* a **"Slow 4G"** (o *"Fast 4G"* con 100 ms de latencia artificial).
4. Realiza movimientos y saltos:
   - **Verificación:** La predicción del cliente debe mantener la respuesta inmediata en pantalla local.
   - **Reconciliación:** El reconciliador debe amortiguar el jitter mediante correcciones suaves (`softCorrections`) sin saltos de cámara ni congelamiento.
   - **Panel de telemetría:** Con `?debug=1` en la URL, verifica que el RTT y los paquetes de entrada/salida se mantengan estables.

---

## 4. Lista de Control Pre-Lanzamiento (Release Checklist)

Antes de fusionar `develop` en `main`:

- [ ] `npm test`: 62/62 tests pasando con 0 errores.
- [ ] `npm run build`: Compilación de producción con Vite terminada con código 0.
- [ ] Smoke Test de 7 pasos ejecutado satisfactoriamente.
- [ ] Prueba rápida con throttling de red (Slow 4G) verificada.
- [ ] Commit limpio en `develop` y merge hacia `main`.
