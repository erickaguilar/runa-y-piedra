# Protocolo de Smoke Test Multijugador — Runa y Piedra

Este documento establece el protocolo obligatorio de verificación end-to-end antes de cada merge a `main` o publicación de versión en producción.

---

## 1. Por qué este protocolo es obligatorio

Un juego que compila limpio (`npm run build`) y pasa todos sus tests automatizados (`npm test`) no garantiza por sí solo que dos dispositivos o navegadores reales puedan conectarse e interactuar en tiempo real bajo condiciones de red variables.

El ciclo de vida de WebRTC (señalización PeerJS, STUN, negociación ICE, apertura asíncrona de DataChannels y entrega de paquetes en ráfaga) requiere una comprobación manual de **2 minutos** antes de cada entrega importante.

---

## 2. Los 8 Pasos del Smoke Test

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
| **8** | **Caída de Host / Reanudar**<br>El Anfitrión cierra la pestaña con un Invitado dentro (snapshot previo de ~5s). | El Invitado recibe `host-closing` y ofrece **Reanudar como Host**: nueva sala PIN con mismo `levelId`, puertas/cofres conservados y narrativa de nueva sala. |

### 2.1 Ejecución automatizada (headless)

El arnés [`scripts/smoke-mp.mjs`](../scripts/smoke-mp.mjs) abre **dos pestañas** (Anfitrión e
Invitado) en un Chrome headless por CDP, recorre los 8 pasos, la **fase cooperativa de la arena
PvE** (§2.2) y añade tres comprobaciones extra: overlay de telemetría (`?debug=1`), predicción
local con ~350 ms de latencia y reanudación del Invitado como Host.

```bash
npm run dev        # terminal 1 → http://localhost:5173/
npm run smoke:mp   # terminal 2 → sale con código 0 si pasa todo
# Otro puerto / binario:
BASE_URL=http://localhost:5199/ CHROME_BIN=/usr/bin/chromium npm run smoke:mp
```

Genera `report.json` y capturas PNG en `.smoke-out/` (ignorado por git). Sale con código `0` si
todas las comprobaciones pasan y `1` en caso contrario. Requiere Chrome/Chromium en `PATH` (o
`CHROME_BIN`) y salida a Internet para la señalización de PeerJS.

**Cobertura:** creación de sala (PIN de 4 dígitos), unión por `?join=PIN`, roster en ambos lados,
movimiento en ambos sentidos, cofre abierto por el Invitado (con la validación autoritativa de
distancia del Host), puerta abierta por el Anfitrión, incorporación tardía con estado del mundo
(nivel + puerta + cofre), `peer-left`, **fase cooperativa PvE (§2.2)**, telemetría y migración de
Host.

### 2.2 Fase cooperativa de la arena PvE (C1–C6)

Después del Paso 6 (y antes de la telemetría), el Anfitrión entra a `dev_combatroom`
difundiendo el cambio de nivel y el arnés ejercita el combate cooperativo de
`docs/31` §7 con autoridad del Anfitrión. Se cierra antes el modal de chat de voz
(aparece en cada `peer-joined`) para dejar la vista libre en ambas pestañas.

| # | Comprobación | Mecanismo verificado |
|---|---|---|
| C1 | **Arena sincronizada** — enemigos con índices estables | Ambas réplicas generan los mismos enemigos en el mismo orden desde `dev_combatroom.json`; los índices de red (`targetId`) son deterministas. |
| C2 | **Snapshots de enemigos (hot)** | `ENEMY_SNAPSHOT` a 10 Hz posiciona la réplica del Invitado (Δ < 1.5 m; medido ≈ 0.00 m). |
| C3 | **Ataque del Invitado a un maniquí** | El Invitado camina al maniquí, ataca; el Host resuelve el daño con su posición autoritativa y difunde `HIT_DUMMY`. |
| C4 | **Derribo de la serpiente** | El Invitado rodea el muro parcial de la arena (z=21, x=5..8) por el pasillo este (x≥9), acerca al enemigo (walk dinámico con anti-atasco), apunta con su réplica y ataca: `HIT_ENEMY` (vida restante) + `ENEMY_DEFEAT` replicados en Host e Invitado. |
| C5 | **Contraataque del enemigo** | Antes del golpe letal, el arnés mantiene la posición y espera `ENEMY_ATTACK`: la serpiente muerde al Invitado y el evento llega a su cliente (el daño/vidas corren por el `SNAPSHOT` existente). |
| C6 | **Ataque del propio Anfitrión** | `handleAttack` del Anfitrión difunde `ATTACK` (0x15, `actorId=0`); el Invitado lo percibe. La comprobación exige un evento **nuevo** con actor 0 (los ecos de los ataques del propio Invitado también son kind 1). |

Notas de calibración (por qué el arnés hace lo que hace):

- El **walk es dinámico** hacia la posición autoritativa del enemigo (se relee cada 250 ms):
  la serpiente persigue (agro 16 m, vel. 2.2 m/s) y un punto fijo la deja fuera del rango de la
  espada (1.8 m).
- La arena tiene un **muro parcial en z=21 (x=5..8)**: acercarse en línea recta deja al Invitado
  a ~1.6 m de la serpiente pero con LOS bloqueada (el melee no atraviesa muros desde el sprint
  de correctitud, y la serpiente tampoco puede morder a través). Por eso se encamina primero por
  el pasillo este (x≥9) y el walk dinámico lleva anti-atasco (rodea por el este si el progreso se
  detiene 2.5 s).
- La serpiente tiene **1 HP**: el primer golpe conectado la mata. Para que C5 (contraataque) sea
  alcanzable, la fase A mantiene posición y deja que la serpiente muerda **antes** de atacar.
- El arnés recarga las vidas del Invitado en el Anfitrión (`recoverHeart(3)`) durante C4/C5 para
  que el daño de la serpiente no derive en Game Over durante la prueba.

**Límites conocidos** (el resto del protocolo sigue siendo una comprobación manual):

- El **FPS** medido en headless (SwiftShader, sin GPU) no representa al dispositivo real. La
  comprobación valida que la telemetría **reporta** FPS/draw calls, no el presupuesto de 60 FPS.
- El **cierre abrupto** de una pestaña no propaga el cierre de SCTP al otro extremo de forma
  determinista (ICE tarda decenas de segundos). Por eso los pasos 6 y 8 se ejercitan con salida
  ordenada (`leaveSession`), que recorre el mismo código que un cierre real de ventana
  (`pagehide` → `HOST_CLOSING` + cierre de DataChannels).
- CDP (`Network.emulateNetworkConditions`) **no limita el SCTP de WebRTC**: la latencia se simula
  sobre los canales de envío del cliente para comprobar la predicción local.
- **No sustituye** la prueba en dos dispositivos/navegadores reales ni con red móvil real: es una
  red de seguridad reproducible, no un reemplazo del paso manual antes de una release.

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

> **Parcialmente automatizado:** `npm run smoke:mp` añade ~350 ms de latencia + jitter a los
> canales de envío del Invitado y comprueba que la predicción local mantiene la respuesta
> inmediata. La prueba con *throttling* real de red móvil sigue siendo manual: CDP
> (`Network.emulateNetworkConditions`) no limita el SCTP de WebRTC.

---

## 4. Lista de Control Pre-Lanzamiento (Release Checklist)

Antes de fusionar `develop` en `main`, todas las casillas deben quedar marcadas. **Última
ejecución verificada: 2026-10-18 · v1.41.0.**

- [x] `npm test`: 322/322 tests pasando con 0 errores.
- [x] `npm run lint`: 0 errores de sintaxis (`node --check`).
- [x] `npm run build`: Compilación de producción con Vite terminada con código 0.
- [x] Smoke Test de 8 pasos + fase cooperativa de la arena PvE ejecutado satisfactoriamente
      (incluye reanudar como Host) — `npm run smoke:mp` → **17/17** comprobaciones (11 del
      protocolo + 6 de la fase coop C1–C6, §2.2).
- [x] Overlay `?debug=1`: la telemetría reporta FPS y draw calls, RTT estable. *(El umbral de
      "FPS ≥55" no es evaluable en headless: SwiftShader sin GPU.)*
- [x] Prueba con latencia de red (~350 ms + jitter) verificada de forma automatizada (§3); se
      recomienda además la pasada manual con Slow 4G real antes de una release importante.
- [x] Commit limpio en `develop` y merge hacia `main`.

---

## 5. Verificación visual de CSS (capas Sumi-e)

A partir de la Fase 5, el CSS se organiza en **capas**: las 5 hojas heredadas
(`base`, `menu`, `hud`, `modals`, `chapter`) viven en `@layer legacy { ... }` y
`sumie-ui.css` se importa **sin capa**, de modo que su cascada normal gana a la heredada **sin
necesidad de `!important`**. El `!important` restante (48 en total) solo sirve para vencer estilos
*inline* que inyecta JavaScript.

Antes de fusionar cualquier cambio que toque `src/styles/` o los estilos inline de los modales:

1. Arranca el servidor de desarrollo: `npm run dev`.
2. Recorre manualmente los estados clave y compáralos con la referencia: **menú**, **menú con
   foco**, **Ajustes**, **Capítulos**, **Slots de guardado**, **Inventario**, **Herramientas de
   desarrollo**, **Tienda**, **Unirse a sala**, **HUD de controles**, y **showroom in-game**
   (+ variantes de vidas/HUD).
3. Comprueba que no cambia ningún color, borde, sombra, tipografía ni tamaño.
4. Verifica en el inspector que `sumie-ui.css` **no** introduce nuevas reglas `!important` fuera de
   la lista justificada (estilos inline de JS).

**Automatizable:** existe un arnés headless (Chrome por CDP) que captura los 16 estados y compara
estilos computados y capturas PNG contra una línea base. En la ejecución de la Fase 5 dio
**0 diferencias** de estilos computados y **0 diferencias** de píxeles (salvo el parpadeo del cursor
de texto).
