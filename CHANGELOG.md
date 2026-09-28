# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] - 2026-09-28

### Added
- **Arquitectura Listen-Server P2P**: Soporte completo para multijugador local en navegador mediante WebRTC `RTCDataChannel` en modo UDP no fiable (`ordered: false, maxRetransmits: 0`) vía PeerJS.
- **Renderizado Voxel 3D en 1 Solo Draw Call**: Terreno de 24×24 gestionado íntegramente por una única instancia de `THREE.InstancedMesh` con reubicación a $(0, -9999, 0)$ y lista de `freeSlots`.
- **Protocolo Binario de Red (Zero-GC)**:
  - Paquete de movimiento de 13 bytes (`[type: 0x01, deltaX, deltaZ, yaw]`).
  - Paquete de modificación de bloque de 14 bytes (`[type: 0x03, action, x, y, z]`).
  - Paquete de Snapshot autoritativo del Host de 33 bytes.
  - Paquete de inicialización de mapa (`INIT: 0x04`).
- **Señalización Serverless por Código QR**: Generación de códigos QR en pantalla para escaneo con cámara móvil y conexión instantánea sin escribir PIN (`?join=XXXX`).
- **Delimitación de Seguridad del Escenario**:
  - Muros perimetrales visibles (`BLOCK_WALL`) de 2 bloques de altura con protección contra destrucción.
  - Barrera matemática impenetrable en el motor de colisiones AABB.
  - Sistema de rescate al vacío que reposiciona al jugador si cae por debajo de $y = -5$.
- **Controles Unificados (`InputManager`)**:
  - Joystick dinámico táctil con **Nipple.js**.
  - Control de cámara táctil pasivo a 60–120 Hz (`{ passive: true }`) en la mitad derecha.
  - Soporte para PC con teclado WASD, barra espaciadora y ratón con **Pointer Lock**.
- **Entidades y Simulación Modular**:
  - Clase `Player` y administrador de sesiones `PlayerManager`.
  - Motor de simulación determinista `SimulationEngine`.
  - Controlador de cámara en primera persona `CameraController`.
  - Módulo de Raycasting `BlockRaycaster` con detección de caras para colocación.
- **Constantes Centralizadas (`src/config/constants.js`)**: Eliminación de números mágicos para dimensiones de mundo, físicas, paletas de colores y frecuencias de red.
- **Documentación Técnica Integral (`docs/`)**: 8 documentos técnicos cubriendo hardware, presupuesto móvil, protocolo de red, físicas, UX, hosting y arquitectura atómica.

### Changed
- Refactorización de arquitectura aplicando el principio de **Responsabilidad Única (SRP)**, dividiendo el código en carpetas atómicas (`config/`, `input/`, `camera/`, `interaction/`, `entities/`, `simulation/`, `ui/`, `core/`, `network/`, `render/`).
- Reducción del archivo principal `main.js` a un orquestador limpio y desacoplado del DOM.
- Límite de resolución forzado (`devicePixelRatio <= 1.5`) para garantizar 60 FPS estables sin estrangulamiento térmico en smartphones de gama de entrada/media.
