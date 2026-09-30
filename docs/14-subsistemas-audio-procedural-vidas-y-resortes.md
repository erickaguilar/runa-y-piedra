# 14. Subsistemas de Audio Procedural, Vidas, Resortes y Suite de Tests

Este documento detalla los subsistemas de soporte del juego: el motor de audio procedural sintetizado con Web Audio API ([`SoundManager.js`](file:///data/data/com.termux/files/home/develop/game/src/audio/SoundManager.js)), el ciclo vital de vidas y checkpoints ([`Player.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/Player.js)), las animaciones por física de resortes elásticos ([`Spring.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Spring.js)) y la suite de pruebas unitarias automatizadas con `node:test`.

---

## 1. Motor de Audio Procedural Sintetizado ([`SoundManager.js`](file:///data/data/com.termux/files/home/develop/game/src/audio/SoundManager.js))

Para mantener el presupuesto estricto de rendimiento móvil ($0\text{ bytes}$ adicionales en descarga de ficheros pesados `.mp3` o `.wav` y ausencia de decodificadores en el bucle principal), todo el paisaje sonoro de la mazmorra se sintetiza en tiempo real utilizando la **Web Audio API** nativa del navegador.

### Principios de Implementación
- **Activación por Gesto**: Cumple la política de reproducción automática (*autoplay policy*) inicializando el `AudioContext` en el primer toque de pantalla o clic del usuario (`resumeAudioContext`).
- **Envolventes ADSR (Attack, Decay, Sustain, Release)**: Modulación precisa de ganancia mediante `exponentialRampToValueAtTime` para evitar chasquidos (*clicks*) acústicos.
- **Recursos Efímeros**: Los nodos osciladores y de ganancia se crean bajo demanda y se desconectan/destruyen automáticamente al finalizar su envolvente.

### Catálogo de Efectos de Sonido (SFX)

| Efecto | Método | Tipo de Onda / Filtro | Envolvente y Frecuencia | Sensación Acústica |
| :--- | :--- | :--- | :--- | :--- |
| **Salto** | `playJump()` | Senoidal (`sine`) | Barrido de $180\text{ Hz} \rightarrow 360\text{ Hz}$ en $0.15\text{ s}$ | Impulso elástico ascendente |
| **Daño / Lava** | `playHurt()` | Diente de sierra (`sawtooth`) | Salto disonante $120\text{ Hz} \rightarrow 60\text{ Hz}$ con decaimiento rápido ($0.2\text{ s}$) | Impacto áspero y doloroso |
| **Puerta** | `playDoorOpen()` | Triangular (`triangle`) + Filtro paso bajo | Frecuencia grave ($80\text{ Hz}$) con modulación lenta ($0.8\text{ s}$) | Piedra pesada deslizándose |
| **Cofre** | `playChestOpen()` | Senoidal armónica | Dos tonos ascendentes ($440\text{ Hz} \rightarrow 880\text{ Hz}$) | Crujido de gozne y brillo interior |
| **Llave** | `playKeyPickup()` | Senoidal pura | Campanilleo en arpegio brillante ($1046\text{ Hz} \rightarrow 1318\text{ Hz}$) | Tintineo metálico de bronce |
| **Victoria** | `playVictory()` | Acorde tríada mayor | Acorde múltiple con sustain de $2.5\text{ s}$ y brillo ascendente | Fanfarria ceremonial triunfal |

---

## 2. Ciclo Vital de Vidas, Peligros y Checkpoints

### Estructura de Vidas en [`Player.js`](file:///data/data/com.termux/files/home/develop/game/src/entities/Player.js)
Cada aventurero dispone de **3 vidas** iniciales:
- `lives`: Entero entre $0$ y $3$.
- `maxLives`: 3 vidas máximas.
- `isInvulnerable`: Booleano calculado mediante marca temporal `invulnerableUntil`.

```javascript
loseLife(now = performance.now()) {
  if (this.isInvulnerable(now)) return false;
  this.lives = Math.max(0, this.lives - 1);
  this.invulnerableUntil = now + 2500; // 2.5 segundos de gracia
  return true;
}
```

### Protocolo de Red y Persistencia entre Mazmorras
El contador de vidas se transmite en el hot path del `MSG.SNAPSHOT` (byte número 24 de cada jugador). Cuando un jugador pierde una vida en el Host o en local:
1. El HUD actualiza los corazones mediante la animación elástica de [`Spring.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Spring.js).
2. El avatar 3D parpadea en pantalla durante el lapso de invulnerabilidad (alternancia de opacidad en [`AvatarRenderer.js`](file:///data/data/com.termux/files/home/develop/game/src/render/AvatarRenderer.js)).
3. **Persistencia en la Expedición**: Al descender a una nueva mazmorra a través de la escalinata de transición, las vidas perdidas **se mantienen intactas** en todos los jugadores. Las vidas no se recargan al superar una mazmorra.
4. **Restauración por Game Over**: Al alcanzar $0$ vidas, se dispara el evento de **Game Over**, notificando la derrota en el HUD, restaurando las vidas al máximo ($3$) y reiniciando la expedición en el vestíbulo seguro del lobby.

---

## 3. Animaciones por Física de Resortes ([`Spring.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Spring.js))

Para prescindir de librerías pesadas de animación externa (como Framer Motion o GSAP), se implementó un oscilador armónico amortiguado en [`Spring.js`](file:///data/data/com.termux/files/home/develop/game/src/ui/Spring.js).

### Ecuación de Movimiento
El resorte resuelve por integración numérica paso a paso:
$$F = -k \cdot (x - x_{\text{target}}) - c \cdot v$$
$$a = \frac{F}{m}$$

Donde:
- $k$ (**Stiffness / Rigidez**): Fuerza que atrae el elemento hacia el objetivo (ej. $170$).
- $c$ (**Damping / Amortiguación**): Resistencia que disipa la energía cinética (ej. $26$).
- $m$ (**Masa**): Inercia del objeto ($1.0$).

### Aplicaciones en Juego
- **Escala de Iconos y Botones Táctiles**: Efecto de contracción y rebote suave al pulsar o soltar botones.
- **Indicador de Vidas en HUD**: Los corazones palpitan con rebote elástico al recibir daño o regenerarse.
- **Mensajería Narrativa**: Entrada fluida desde la parte superior de la pantalla con una ligera sobreoscilación (*overshoot*) natural.

---

## 4. Suite de Pruebas Automatizadas (`node:test`)

El proyecto dispone de una batería completa de **58 pruebas unitarias** ejecutables en milisegundos mediante el runner nativo de Node.js:

```bash
npm test
```

### Cobertura de la Suite (`tests/*.test.js`)

1. **Protocolo Binario y Red ([`tests/protocol.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/protocol.test.js))**:
   - Serialización y deserialización sin pérdidas de `INPUT`, `SNAPSHOT`, `PING`, `PONG`, `KEY`, `DOOR`, `CHEST`, `PEDESTAL` y `DESCENT`.
   - Compatibilidad hacia atrás con snapshots antiguos de 19 y 24 bytes.
2. **Canales Duales WebRTC ([`tests/network-channels.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/network-channels.test.js))**:
   - Enrutado de mensajes calientes frente a seguros.
   - Configuración de reintentos y timeouts.
3. **Predicción y Reconciliación ([`tests/reconciler.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/reconciler.test.js))**:
   - Confirmación estricta de inputs mediante monotonicidad de secuencias.
   - Búfer circular de inputs pendientes y teletransporte ante desvíos mayores a $2.5\text{ m}$.
4. **Físicas, Peligros y Vidas ([`tests/physics-lives.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/physics-lives.test.js))**:
   - Contacto con bloques de lava y deducción de vida.
   - Rescate al vacío y teletransporte a coordenadas del checkpoint.
   - Invulnerabilidad post-reaparición e inmunidad temporal a daño.
5. **Generación de Niveles y Sensores ([`tests/levels.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/levels.test.js))**:
   - Verificación de consistencia de los 4 niveles JSON.
   - Detección de escalinata de descenso y requisitos de llave en puertas.
6. **Física de Resortes ([`tests/spring.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/spring.test.js))**:
   - Convergencia, límites de oscilación y amortiguación.
7. **Sanitización UI e Iconos SVG ([`tests/icons-ui.test.js`](file:///data/data/com.termux/files/home/develop/game/tests/icons-ui.test.js))**:
   - Prevención de inyección XSS en apodos de jugadores y resolución vectorial de iconos.
