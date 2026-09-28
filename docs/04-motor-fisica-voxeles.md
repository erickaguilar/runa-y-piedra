# 04. Motor de Físicas y Estructura de Vóxeles

## 1. Estructura de Memoria del Voxel Grid

Para mantener el consumo de memoria al mínimo absoluto y permitir lecturas ultra veloces en $O(1)$:
- La arena de $32 \times 32 \times 16$ bloques se almacena en un único buffer plano `Uint8Array`.
- Tamaño total en RAM: $32 \times 32 \times 16 = 16,384\text{ bytes}$ (**16 KB**).
- Conversión de coordenadas $(x, y, z)$ a índice plano:
  $$\text{index} = (x \ \& \ 31) + (z \ \& \ 31) \times 32 + (y \times 1024)$$

Valores de los vóxeles:
- `0`: Espacio vacío / aire.
- `1`: Bloque transitable / rompible.
- `2`: Muro perimetral indestructible.

---

## 2. Bucle de Física Desacoplado a 30 Hz

Para evitar que la física se vuelva inconsistente si el framerate fluctúa entre 45 y 60 FPS:
- La física avanza en pasos de tiempo fijos (`fixedDeltaTime = 1/30` segundos $\approx 33.3\text{ ms}$).
- Un acumulador suma el tiempo delta entregado por `requestAnimationFrame`.
- Mientras el acumulador contenga $\ge 33.3\text{ ms}$, se ejecuta una iteración física determinista (`step`).
- Se aplica un límite máximo de seguridad de $200\text{ ms}$ al acumulador para evitar congelamientos ("espiral de la muerte") en caso de que la pestaña pierda el foco brevemente.

---

## 3. Algoritmo de Colisión AABB (Axis-Aligned Bounding Box)

El jugador se modela como una caja rectangular con dimensiones de $0.6\text{ m}$ de ancho por $1.8\text{ m}$ de alto.

### Resolución Eje por Eje (Separated Axis Collision)
Para evitar que el jugador atraviese esquinas o se quede atascado:
1. **Paso Vertical (Eje Y)**:
   - Se suma la gravedad y velocidad vertical: $y_{nuevo} = y + v_y \cdot \Delta t$.
   - Si la caja colisiona contra un bloque sólido en $y_{nuevo}$, se anula la velocidad vertical ($v_y = 0$). Si caía, se marca `onGround = true` y se posiciona exactamente sobre el bloque.
2. **Paso Horizontal (Eje X)**:
   - Se proyecta el movimiento en X. Si la caja colisiona, se cancela la velocidad en X ($v_x = 0$) manteniendo la posición previa en X.
3. **Paso Horizontal (Eje Z)**:
   - Se proyecta el movimiento en Z de forma independiente. Si hay colisión, se anula la velocidad en Z ($v_z = 0$).

### Comprobación de Vóxeles Adyacentes
En cada paso, el algoritmo únicamente consulta los índices del grid entre:
- $X \in [\lfloor x - 0.3 \rfloor, \lfloor x + 0.3 \rfloor]$
- $Y \in [\lfloor y \rfloor, \lfloor y + 1.8 \rfloor]$
- $Z \in [\lfloor z - 0.3 \rfloor, \lfloor z + 0.3 \rfloor]$

Esto requiere como máximo entre 8 y 18 accesos directos al `Uint8Array`, consumiendo menos del 1% del tiempo de un núcleo de CPU en procesadores móviles.
