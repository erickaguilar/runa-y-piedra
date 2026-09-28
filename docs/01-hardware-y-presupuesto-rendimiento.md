# 01. Requerimientos de Hardware y Presupuesto de Rendimiento

## 1. Perfil del Dispositivo Móvil Estándar Global

Para lograr que el juego funcione a 60 FPS estables en la mayor cuota de mercado global posible, se toma como referencia la gama de entrada/media típica:
- **RAM Total**: 3 GB a 4 GB.
- **Procesador (SoC)**: Octa-core de 1.8 a 2.2 GHz (MediaTek Helio G35/G80/G85/G99, Qualcomm Snapdragon 450/662/680).
- **GPU**: Mali-G52, Adreno 610 o equivalente, corriendo sobre WebGL 2.0.
- **Navegadores**: Google Chrome 90+, Samsung Internet, Safari 15+ en iOS 14+.

### Carga Asimétrica: Host vs. Cliente
El dispositivo configurado como **Host (Listen-Server)** asume una carga computacional mayor:
- Ejecuta la simulación física autoritativa de todas las entidades.
- Valida la construcción y destrucción de bloques.
- Empaqueta y retransmite los estados a todos los clientes conectados.

| Parámetro | Requerimiento Mínimo (Cliente) | Requerimiento Óptimo (Host) |
|---|---|---|
| **RAM Libre para Pestaña** | $\ge 250\text{ MB}$ libres | $\ge 400\text{ MB}$ libres |
| **SoC** | Octa-core @ 1.8 GHz | Octa-core @ 2.0+ GHz |
| **Gráficos** | WebGL 2.0 | WebGL 2.0 |
| **Red Wi-Fi** | Wi-Fi 4 (802.11n @ 2.4 GHz) | Wi-Fi 5 (802.11ac @ 5 GHz preferible) |
| **OS** | Android 8.0+ / iOS 14+ | Android 10+ / iOS 15+ |

---

## 2. Presupuesto Técnico Estricto (Performance Budget)

Los navegadores móviles ejecutan políticas severas de recolección de recursos (OOM Tab Killer) si el uso de memoria o la temperatura del procesador se eleva de forma crítica.

Para una arena cerrada de **32×32 a 48×48 metros**:

| Métrica | Límite Máximo | Justificación y Control |
|---|---|---|
| **Draw Calls** | **20 a 40** por frame | Si cada cubo genera un draw call separado, el navegador colapsa al superar los 200 cubos. Toda la arena debe dibujarse mediante `THREE.InstancedMesh`. |
| **Polígonos Visibles** | **15,000 a 40,000** triángulos | Caras no expuestas del voxel grid no deben generarse o deben agruparse. Mallas de avatares ultra low-poly (<100 triángulos). |
| **Tasa de Refresco** | **60 FPS** (render) / **30 Hz** (físicas) | El renderizado corre ligado a `requestAnimationFrame`, mientras que la física corre desacoplada en un bucle acumulador a 30 Hz. |
| **Memoria JS Heap** | **< 120 MB** | Cero instanciación de objetos (`new Vector3`, objetos temporales) dentro del bucle de animación para evitar GC stutter. |
| **Atlas de Texturas** | Un único atlas WebP $\le 1024\times 1024$ | Compartido por bloques, avatares y partículas. Reduce el cambio de estados en WebGL a cero durante el renderizado del mapa. |

---

## 3. Las 4 Optimizaciones Críticas para Celulares

### A. Limitar la resolución nativa (`devicePixelRatio`)
Las pantallas de los smartphones modernos cuentan con densidades de píxeles muy altas ($DPR \approx 2.5 - 3.5$). Renderizar a resolución nativa 1080p o 2K satura inmediatamente el rasterizador y la tasa de relleno (fill-rate) de la GPU móvil.

```typescript
// Forzar un DPR máximo de 1.25 a 1.5 para mantener 60 FPS estables
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
```

### B. Agrupación de geometría (Evitar objetos independientes)
- **Mundos estáticos**: `BufferGeometryUtils.mergeGeometries` para combinar mallas en un solo objeto de buffer estático.
- **Bloques interactivos**: `THREE.InstancedMesh`. Con una sola instancia y una única llamada a la GPU se dibujan más de 4,000 bloques.

### C. Físicas desacopladas y ligeras
- Evitar librerías monolíticas como Ammo.js (3-4 MB de script y alto consumo de CPU).
- Utilizar exclusivamente cajas de colisión AABB (*Axis-Aligned Bounding Boxes*) o esferas matemáticas.
- Bucle de física fijo a 30 Hz mediante un acumulador de tiempo delta.

### D. Serialización de red binaria (Sin JSON en bucle activo)
- Enviar `{ x, y, z, rot }` en formato JSON 30 veces por segundo produce picos continuos de Garbage Collection (GC pauses).
- Usar `ArrayBuffer` y `TypedArrays` nativos (`Float32Array`, `Uint8Array`, `DataView`) reutilizados cuadro a cuadro.
