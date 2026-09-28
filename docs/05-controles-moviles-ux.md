# 05. Controles Táctiles y Experiencia Móvil (UX)

## 1. Esquema de Pantalla Dividida (Touch Zones)

En dispositivos táctiles, la experiencia de juego depende de evitar conflictos entre el desplazamiento de cámara y el movimiento direccional. La pantalla se segmenta en dos zonas virtuales invisibles:

```
+-----------------------------------------------------------+
| [HUD: FPS, Calls, Ping]                                   |
|                                                           |
|        MITAD IZQUIERDA              MITAD DERECHA         |
|                                                           |
|       +-----------------+         +-----------------+     |
|       |  Joystick       |         |  Rotación de    |     |
|       |  Dinámico       |         |  Cámara         |     |
|       |  (Nipple.js)    |         |  (Touch Move)   |     |
|       +-----------------+         +-----------------+     |
|                                                           |
|                                     (SALTO)  (BLOQUE)     |
+-----------------------------------------------------------+
```

---

## 2. Implementación de los Controles

### A. Joystick Virtual Dinámico (Nipple.js)
- Modo `dynamic`: El joystick aparece exactamente bajo la posición donde el jugador coloca su pulgar izquierdo.
- Al soltar el pulgar, el joystick desaparece y el vector de movimiento regresa a $(0, 0)$.
- Se extrae el vector normalizado $(x, y)$ con magnitudes proporcionales para permitir pasos lentos o carrera continua.

### B. Rotación de Cámara sin Retardo (Passive Touch Events)
- Manejo directo en la mitad derecha con listeners configurados con `{ passive: true }`. Esto indica al navegador que no se llamará a `preventDefault()` dentro del evento de movimiento, permitiendo que el hilo del compositor de pantalla procese el toque a 60-120 Hz sin bloqueos del hilo principal.
- Cálculo de sensibilidad angular adaptado a pantallas táctiles de alta densidad.
- Rango de inclinación vertical (*Pitch*) bloqueado entre $-80^\circ$ y $+80^\circ$ para evitar desorientación con la cámara invertida.

### C. Botones Táctiles Flotantes
- Botón **SALTO**: Dispara el impulso vertical cuando el jugador se encuentra en contacto con el suelo.
- Botón **BLOQUE**: Añade un cubo en la posición calculada frente a la mirada del jugador.
- Efecto visual táctil mediante `:active { transform: scale(0.92); }` para brindar retroalimentación táctil inmediata (haptic-like feedback visual).

---

## 3. Prevención de Gestos Nativos del Navegador

Para evitar que el navegador móvil active el refresco por deslizamiento (*pull-to-refresh*), el zoom por doble toque (*double-tap zoom*) o el menú contextual al mantener presionado:

```css
* {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

html, body {
  touch-action: none;
  overscroll-behavior: none;
  overflow: hidden;
}
```

Y en el `<head>` del HTML:
```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
/>
```

---

## 4. Fallback de Control para Escritorio (Desktop Testing)

Para facilitar el desarrollo y pruebas locales rápidas en ordenador:
- Teclas **WASD** / Flechas de dirección: Movimiento planar.
- Barra **Espaciadora**: Salto.
- **Pointer Lock API**: Al hacer clic en la pantalla, se bloquea el cursor del ratón, permitiendo mover la cámara mediante `movementX` y `movementY` exactamente como en un juego de ordenador tradicional.
- Clic izquierdo: Colocación de bloque.
