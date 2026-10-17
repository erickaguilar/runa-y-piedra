# 30. Plan de Saneamiento Técnico por Fases

Este documento es un **plan de ejecución** (no una especificación de arquitectura) para resolver
los hallazgos de la auditoría técnica del repositorio. Su objetivo es eliminar deuda de
mantenibilidad acumulada **sin alterar el comportamiento del juego**, apoyándose en la suite de
pruebas existente como red de seguridad.

- **Versión auditada:** `1.40.0` (rama `develop`)
- **Fecha de auditoría:** 2026-10-17
- **Estado:** En ejecución — **Fases 0, 1, 2 y 3 completadas**

### Progreso

| Fase | Estado |
|---|---|
| 0. Infraestructura local | ✅ Completada |
| 1. Coherencia documental | ✅ Completada |
| 2. Type checking real | ✅ Completada |
| 3. Higiene de logs | ✅ Completada |
| 4. God-objects | ⏳ Pendiente |
| 5. CSS mantenible | ⏳ Pendiente |
| 6. Extracción de arte | ⏳ Pendiente |
| 7. Proceso y guardarraíles | ⏳ Pendiente |

---

## 1. Resumen de hallazgos a corregir

| # | Hallazgo | Evidencia (medida) | Severidad | Fase |
|---|---|---|---|---|
| H0 | Dependencias locales incompletas (`eslint`, `typescript` no instaladas) | `npm ls` → 2 UNMET | Bloqueante local | 0 |
| H1 | README y docs desincronizados (conteo de tests, enlaces rotos) | 287 / 146 / 321 contradictorios; 4 enlaces `file:///data/data/com.termux/...` | Baja (credibilidad) | 1 |
| H2 | `tsc` en el pipeline no verifica tipos de verdad | `jsconfig.json` → `checkJs: false` | Media | 2 |
| H3 | Ruido de `console.log` en rutas de producción | 32 en `src/` (NetworkManager 16, NetAudit 7, VoiceChat 6) | Baja | 3 |
| H4 | God-objects supervivientes | `GameApp.js` 912, `NetworkManager.js` 888, `InteractionController.js` 742 líneas | Media | 4 |
| H5 | CSS con `!important` masivo y archivo monolítico | 1822 `!important` (1806 en `sumie-ui.css` de 105 KB) | Alta | 5 |
| H6 | Datos de arte embebidos como JS gigante | `heroPortraits.js` 5 956 líneas | Media | 6 |
| H7 | Proceso: sin revisión de código / sin guardarraíles de calidad | 0 contribuidores; CI sin verificación de límites | Media | 7 |

### Métricas objetivo (línea base → meta)

| Métrica | Hoy | Meta |
|---|---|---|
| Tests en verde | 321 | ≥ 321 (nunca menos) |
| `!important` en CSS | 1822 | ≤ 50 |
| CSS compilado (gzip) | 20.41 KB | sin regresión / a la baja |
| Archivo de lógica más grande | 912 líneas | ≤ 500 |
| `console.log` en `src/` | 32 | 0 en rutas de producción ✅ |
| Enlaces rotos en README | 4 | 0 |
| `checkJs` (type checking real) | `false` (no-op) | `true`, 0 errores ✅ |
| Bundle principal | 373 KB (100 KB gzip) | sin regresión |

---

## 2. Reglas de ejecución (aplican a todas las fases)

1. **Una rama por fase** desde `develop`: `chore/fase-N-<tema>`.
2. **Definition of Done transversal:** `npm run ci` (lint + test + build) en verde antes de
   fusionar. No se fusiona nada con tests en rojo.
3. **Sin cambios de comportamiento.** Las refactorizaciones (Fases 4–6) no alteran jugabilidad;
   si un cambio lo hace, va acompañado de tests nuevos.
4. **Un commit atómico por tarea**, mensaje semántico (`refactor:`, `docs:`, `chore:`, `perf:`).
5. **Validación visual** para cualquier fase que toque CSS/render (Fases 5–6): usar
   `docs/smoke-test.md` sobre `npm run dev`.
6. **Actualizar CHANGELOG.md** en cada fase fusionada.

---

## 3. Fases

### Fase 0 — Infraestructura local y línea base
**Esfuerzo:** ~2 h · **Riesgo:** nulo · **Depende de:** nada

- [x] `npm ci` para instalar `eslint@10.11.0` y `typescript@5.9.3` (faltan en `node_modules`).
- [x] Ejecutar `npm run ci` y confirmar `lint` + `321 tests` + `build` en verde.
- [x] Verificar el pre-commit de `.githooks/` (`npm run precommit`).
- [x] Registrar la línea base del bundle (`dist/assets/*` tamaños) como referencia (Anexo A).

**DoD:** `npm run ci` pasa en local; el pre-commit bloquea correctamente un archivo con error.

---

### Fase 1 — Coherencia documental (victoria rápida)
**Esfuerzo:** ~3 h · **Riesgo:** nulo · **Depende de:** Fase 0

- [x] Unificar el conteo de tests en `README.md`: badge **287 → 321** y texto **146 → 321**
      (líneas 10, 117, 129 y 208).
- [x] Reemplazar los 4 enlaces `file:///data/data/com.termux/files/home/develop/game/...`
      por rutas relativas del repo (`src/levels/`, `src/network/ClientReconciler.js`,
      `src/audio/SoundManager.js`, `src/network/LeaderElection.js`).
- [x] Corregir el *drift* de `docs/README.md`:
  - doc 08: "Catálogo de 4 niveles" → arquitectura vigente de 10 capítulos.
  - doc 02: "Custom AABB **/ Rapier3D WASM**" → el proyecto usa AABB propio (no hay Rapier).
  - doc 14: "Suite de **58** pruebas" → conteo actual (`321`).
- [x] Registrar este plan (`30`) en el índice de `docs/README.md`.

**DoD:** `grep -rn "file:///data" README.md` devuelve 0; los conteos de tests coinciden con
`npm test`; existe un único número de referencia.

---

### Fase 2 — Type checking real
**Esfuerzo:** ~1–2 días · **Riesgo:** bajo · **Depende de:** Fase 0

Hoy `scripts/lint.mjs` ejecuta `tsc` como "3/3 Verificando tipos", pero `checkJs: false` hace
que ese paso sea casi cosmético. Hay que convertirlo en verificación efectiva, de forma
**incremental** para no bloquear el pipeline.

- [x] Crear rama y activar `checkJs: true` con `strict: false` en `jsconfig.json`.
- [x] Corregir los errores por capas, en este orden (de mayor a menor riesgo):
      1. `src/config/`, `src/entities/`, `src/core/` (lógica pura)
      2. `src/network/` (protocolo y reconciliación — el más valioso de tipar)
      3. `src/render/`, `src/ui/` (mucho DOM, tolerante)
- [x] Añadir JSDoc sólo donde el tipo sea ambiguo (`@param`/`@returns` en funciones del protocolo).
- [x] Añadir el comando `npm run typecheck` para ejecutarlo aislado.
- [ ] _Diferido:_ endurecer `noImplicitAny` / `strictNullChecks` (dejar `strict: false` por ahora).
- [ ] _Diferido:_ tipado de `tests/` (requiere `@types/node` para `node:test`).

**Alcance efectivo:** `tsc` comprueba `src/**/*` + `vite.config.js`. Los tests quedan fuera del
programa de `tsc` (se validan en tiempo de ejecución con `node:test`); incluirlos exigiría
`@types/node` y dispararía ~380 errores adicionales, por lo que se pospone como saneamiento
separado.

**Solución adoptada para los mixins:** `src/types/mixins.d.ts` realiza *augmentación de módulos*
(`declare module`) que declara la API pública aportada por los mixins que se componen vía
`Object.assign(Clase.prototype, ...)`. Los globales de diagnóstico y `import.meta.env` se declaran
en `src/types/globals.d.ts`. La comprobación de `node_modules` se evita con
`maxNodeModuleJsDepth: 0` (three.js r160 no incluye tipos propios).

**DoD:** `tsc -p jsconfig.json` con `checkJs: true` reporta **0 errores** (`npm run typecheck`);
el paso 3 del lint deja de ser cosmético; el CI sigue verde. ✅

**Bugs reales detectados y corregidos por el tipado:**
- `MenuManager` asignaba a `soundManager.isMuted` (getter de solo lectura) → en módulos ES
  (modo estricto) lanzaría `TypeError`; ahora usa `soundManager.setMuted()`.
- `GuestJoinModal` invocaba `soundManager.playError()` (inexistente) al seleccionar un héroe
  ocupado; ahora usa `playLocked()`.

---

### Fase 3 — Higiene de logs y código muerto
**Esfuerzo:** ~4 h · **Riesgo:** bajo · **Depende de:** Fase 0

- [x] Introducir un logger mínimo gateado por `?debug=1` / modo dev
      (p. ej. `src/config/logger.js` con `debug/info/warn/error`).
- [x] Migrar los 32 `console.log` de `src/`:
      - `network/NetworkManager.js` (16), `network/NetAudit.js` (7),
        `network/VoiceChatManager.js` (6) → `logger.debug`.
      - Los de `DevModal.js` / `RoomDebugOverlay.js` se mantienen (son de dev) pero vía logger.
- [x] Conservar `console.warn`/`console.error` reales.
- [x] Resolver los 2 `TODO/FIXME` en `src/` (implementar o convertir en *issue*).
- [x] Regla ESLint `no-console` con `allow: ['warn', 'error']` para prevenir regresiones.

**DoD:** 0 `console.log` en rutas de producción; `no-console` activo; tests y build en verde. ✅

**Resultado:**
- `src/config/logger.js`: pasarela única a `console` con `debug/info/warn/error`. Los mensajes
  `debug`/`info` se emiten solo si la depuración está activa (`?debug=1`, `localStorage.runa_debug === '1'`
  o `import.meta.env.DEV`); `warn`/`error` son incondicionales.
- Migrados **32 `console.log` → `logger.debug`** en 6 archivos y **2 `console.info` → `logger.info`**
  en `SaveManager.js`. No queda ningún `console.log`/`info` en `src/` fuera del propio logger.
- Se conservan los `console.warn` (38) y `console.error` (17) reales.
- Regla `no-console` (`error`, `allow: ['warn','error']`) acotada a `src/**/*.js`; `logger.js` la
  desactiva a nivel de archivo. El linter corre con `--max-warnings=0`, así que la regla bloquea el CI.

**Nota:** los "2 TODO/FIXME" del informe eran un **falso positivo**: la búsqueda original capturó
marcadores de relleno `XXXX` (`VOXESALA-XXXX-M`, `?join=XXXX`) y la palabra castellana "todo".
No existe ningún `TODO`/`FIXME` real en `src/`.

---

### Fase 4 — Descomposición de god-objects
**Esfuerzo:** ~3–5 días · **Riesgo:** medio · **Depende de:** Fases 0, 2 (opcional)

Objetivo: ningún archivo de **lógica** supere ~500 líneas (excluyendo archivos de datos/arte).

- [ ] **`GameApp.js` (912):** extraer el *bootstrap* gráfico (escena + renderers + loaders) y la
      coordinación de sesión/red a colaboradores ya existentes (`SessionManager`,
      `NetworkCoordinator`), dejando `GameApp` como orquestador delgado.
- [ ] **`NetworkManager.js` (888):** separar en (a) señalización PeerJS/ICE, (b) gestión de
      canales duales hot/safe, (c) heartbeat/telemetría. Ya existen `ChannelLinks` y
      `NetworkStats` como base.
- [ ] **`InteractionController.js` (742):** separar *detección/raycast* (soporta en
      `BlockRaycaster`) de *ejecución de acciones* (puertas, cofres, altares, placas).
- [ ] Mantener las firmas públicas para no romper consumidores; mover tests existentes si cambia
      la ubicación.

**DoD:** los 3 archivos objetivo ≤ 500 líneas; suite completa en verde; smoke test manual de
host + invitado sin regresiones; `07-arquitectura-atomica-modular.md` actualizado.

---

### Fase 5 — CSS mantenible (mayor esfuerzo)
**Esfuerzo:** ~1–2 semanas · **Riesgo:** alto (visual) · **Depende de:** Fases 0, 1

El problema real: la estética Sumi-e se escribió **encima** del diseño anterior y arrasó con
`!important` (1806 en `sumie-ui.css`). La solución correcta no es borrar `!important` uno a uno,
sino **reorganizar con capas CSS (`@layer`)**, que eliminan la necesidad de `!important`.

- [ ] **Auditoría:** inventariar `sumie-ui.css` por bloques; identificar y borrar reglas
      obsoletas del sistema SaaS previo (candidatas: repeticiones de `border-radius`, sombras,
      gradientes antiguos).
- [ ] **Introducir `@layer`** en `src/style.css`: `@layer reset, tokens, base, components,
      overrides;`. Migrar reglas a la capa correspondiente.
- [ ] **Eliminar `!important`** aprovechando el orden de capas (meta: ≤ 50 en todo el proyecto).
- [ ] **Eliminar el reset global** `border-radius: 0 !important` sustituyéndolo por: los
      componentes nuevos simplemente no definen `radius`.
- [ ] **Dividir `sumie-ui.css`** en módulos: `tokens.css`, `cards.css`, `modals-sumi.css`,
      `hud-sumi.css`, `seals.css` (importados desde `style.css`).
- [ ] Consolidar estilos duplicados entre `modals.css` (34 KB) y `sumie-ui.css`.

**Validación obligatoria:** capturar pantallas de referencia (menú, HUD, cada modal, showroom)
**antes** y **después**; ejecutar `docs/smoke-test.md`.

**DoD:** `!important` ≤ 50; CSS gzip ≤ línea base; cero regresiones visuales en las capturas;
build en verde.

---

### Fase 6 — Extracción de arte y datos
**Esfuerzo:** ~2–3 días · **Riesgo:** medio · **Depende de:** Fase 0

- [ ] `heroPortraits.js` (5 956 líneas de SVG inline) → convertir en assets `.svg` reales en
      `src/heroes/portraits/` importados con `?raw`, o en un módulo `heroPortraits.data.js`
      generado por script.
- [ ] Verificar que el arte queda en el chunk lazy `assets-art` (ya pesa 222 KB) y **no** en el
      bundle inicial.
- [ ] Documentar el pipeline: si el SVG se genera, añadir el script generador a `scripts/`;
      si es artesanal, dejar constancia en el doc 29.
- [ ] Revisar `Icons.js` (917 líneas) con el mismo criterio.

**DoD:** `heroPortraits` deja de ser un `.js` monolítico; el bundle inicial no contiene el arte;
menú de selección de héroe funciona igual.

---

### Fase 7 — Proceso y guardarraíles permanentes
**Esfuerzo:** ~2 días · **Riesgo:** bajo · **Depende de:** Fases 0–6

- [ ] **Branch protection** en `main` y `develop`: PR obligatorio, CI verde requerido, sin
      pushes directos.
- [ ] **Ampliar `.github/workflows/ci.yml`** con un job `guards` que falle si:
      - `!important` > umbral,
      - algún archivo de `src/` (no-data) > 500 líneas,
      - hay `console.log` en `src/`,
      - bundle inicial supera el presupuesto.
- [ ] Promover `develop` → `main` y publicar release `1.41.0` con el CHANGELOG del saneamiento.
- [ ] Revisar que `docs/` vuelve a estar 1:1 con el código (evitar el drift de H1).

**DoD:** push directo a `main`/`develop` rechazado; job `guards` activo; release publicada.

---

## 4. Secuencia recomendada y dependencias

```
Fase 0 (infra)
   └─> Fase 1 (docs)  ──> Fase 5 (CSS)
   └─> Fase 2 (tipos) ──> Fase 4 (god-objects) ──> Fase 7 (proceso)
   └─> Fase 3 (logs)
   └─> Fase 6 (arte)
```

- **Quick wins primero (1 y 3):** bajo riesgo, resultado visible, sin tocar lógica de juego.
- **Fase 2 antes que 4:** tipar facilita refactorizar con seguridad.
- **Fase 5 al final y aislada:** es la de mayor riesgo y necesita validación visual dedicada.
- **Fase 6 es independiente:** puede intercalarse cuando haya hueco.

## 5. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Refactor de god-objects introduce regresiones de red | Tipar antes (Fase 2); smoke test host+invitado obligatorio; conservar firmas |
| Romper la estética Sumi-e al limpiar CSS | Capturas antes/después + `@layer` en vez de borrado manual |
| El type checking bloquea el pipeline | Activación incremental; `strict:false` primero; endurecer después |
| El arte lazy se cuela en el bundle inicial | Verificar tamaños de `dist/` tras cada cambio |
| Sobre-ingeniería / parálisis | Una fase por rama; no fusionar sin DoD |

## 6. KPIs de seguimiento

Comparar tras cada fase fusionada: `npm test` (verde y ≥321), `tsc` (0 errores),
`grep -c "!important"`, tamaño del archivo de lógica mayor, `grep -rc "console.log" src`,
tamaños de `dist/assets`.

---

## Anexo A. Línea base de referencia (v1.40.0, 2026-10-17)

Capturada tras `npm ci && npm run ci` en la rama `chore/fase-0-1-infra-y-docs`.

- **Tests:** `321` pasando / `0` fallando (23 suites).
- **Pre-commit:** hook activo (`core.hooksPath=.githooks`); verificada su capacidad de bloqueo
  ante un archivo con error de sintaxis (exit code 1).
- **Bundle de producción (`dist/`):**

| Archivo | Bytes | Gzip |
|---|---|---|
| `vendor-three-*.js` | 479 548 | 121.37 KB |
| `index-*.js` | 374 438 | 100.55 KB |
| `assets-art-*.js` | 222 940 | 28.70 KB |
| `engine-render-*.js` | 177 495 | 38.06 KB |
| `index-*.css` | 144 530 | 20.41 KB |
| `levels-data-*.js` | 129 775 | 17.56 KB |
| `vendor-net-*.js` | 88 835 | 24.23 KB |
| `vendor-ui-*.js` | 43 096 | 15.23 KB |
| `engine-audio-*.js` | 38 849 | 8.75 KB |
| `levels-showroom-*.js` | 11 094 | 3.01 KB |
| `index.html` | 10 373 | 2.67 KB |

**Umbrales de guardarraíl (Fase 7):** `!important` ≤ 50; archivo de lógica ≤ 500 líneas;
`console.log` en `src/` = 0; bundle inicial (`index-*.js`) ≤ 380 KB.
