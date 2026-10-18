# 30. Plan de Saneamiento Técnico por Fases

Este documento es un **plan de ejecución** (no una especificación de arquitectura) para resolver
los hallazgos de la auditoría técnica del repositorio. Su objetivo es eliminar deuda de
mantenibilidad acumulada **sin alterar el comportamiento del juego**, apoyándose en la suite de
pruebas existente como red de seguridad.

- **Versión auditada:** `1.40.0` (rama `develop`)
- **Fecha de auditoría:** 2026-10-17
- **Estado:** En ejecución — **Fases 0, 1, 2, 3, 4 y 5 completadas**

### Progreso

| Fase | Estado |
|---|---|
| 0. Infraestructura local | ✅ Completada |
| 1. Coherencia documental | ✅ Completada |
| 2. Type checking real | ✅ Completada |
| 3. Higiene de logs | ✅ Completada |
| 4. God-objects | ✅ Completada |
| 5. CSS mantenible | ✅ Completada |
| 6. Extracción de arte | ✅ Completada |
| 7. Proceso y guardarraíles | 🟡 Parcial (guards + docs ✅; branch protection y release pendientes) |

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
| H6 | Datos de arte embebidos como JS gigante | `heroPortraits.js` **5 956 → fachada de 30** + módulos por héroe/región (≤ 1 056) | Media | 6 |
| H7 | Proceso: sin revisión de código / sin guardarraíles de calidad | 0 contribuidores; CI sin verificación de límites | Media | 7 |

### Métricas objetivo (línea base → meta)

| Métrica | Hoy | Meta |
|---|---|---|
| Tests en verde | 321 | ≥ 321 (nunca menos) |
| `!important` en CSS | 1822 | ≤ 50 (hoy **48**) ✅ |
| CSS compilado (gzip) | 20.41 KB | sin regresión / a la baja (hoy **19.32 KB**) ✅ |
| Archivo de lógica más grande (god-objects Fase 4) | 912 líneas | ≤ 500 (hoy 374: `AppBootstrapMixin`) ✅ |
| `heroPortraits.js` (arte) | 5 956 líneas | descompuesto por héroe/región (hoy fachada de **30**) ✅ |
| `Icons.js` (datos + lógica) | 920 líneas | datos separados de lógica (hoy lógica de **133**) ✅ |
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

- [x] **`GameApp.js` (912 → 278):** extraídos ajustes/UI/cámara/bucle a `AppBootstrapMixin` y las
      herramientas de desarrollo/utilidades de mundo a `DevToolsMixin`; `GameApp` queda como
      orquestador delgado (bootstrap + composición de mixins).
- [x] **`NetworkManager.js` (888 → 297):** separado en (a) señalización PeerJS/ICE →
      `SignalingMixin`, (b) canales duales hot/safe → `ChannelsMixin`, (c) despacho de mensajes
      entrantes del protocolo → `IncomingMixin`. Reutiliza `ChannelLinks`/`NetworkStats`.
- [x] **`InteractionController.js` (742 → 230):** conserva *detección/raycast* y *dispatch*; la
      *ejecución de acciones* vive en `InteractionActions` (cofres/llaves, puertas) e
      `InteractionMechanisms` (placas, pedestal, fosa).
- [x] Mantener las firmas públicas: la descomposición usa mixins compuestos vía
      `Object.assign(Clase.prototype, ...)`, así que la API no cambia y no hubo que mover tests.
- [ ] _Pendiente:_ smoke test manual host + invitado sobre `npm run dev` (requiere navegador).

**Técnica aplicada:** cada bloque de métodos se movió **verbatim** a un objeto mixin (mismo `this`,
sin reescribir lógica), lo que garantiza ausencia de cambios de comportamiento. La verificación de
tipos de la API aportada por los mixins se declara en `src/types/mixins.d.ts` (augmentación de
módulos), igual que el resto de mixins del proyecto.

**Resultado (líneas):** `GameApp.js` 278 · `NetworkManager.js` 297 · `InteractionController.js` 230.
Mixins nuevos: `AppBootstrapMixin` 374, `DevToolsMixin` 285, `SignalingMixin` 162, `ChannelsMixin`
244, `IncomingMixin` 223, `InteractionActions` 302, `InteractionMechanisms` 237 (todos ≤ 500).

**DoD:** los 3 archivos objetivo ≤ 500 líneas ✅; suite completa en verde (321 tests) ✅;
`npm run ci` (lint + test + build) en verde ✅; `07-arquitectura-atomica-modular.md` actualizado ✅.

---

### Fase 5 — CSS mantenible (mayor esfuerzo)
**Esfuerzo:** ~1–2 semanas · **Riesgo:** alto (visual) · **Depende de:** Fases 0, 1

El problema real: la estética Sumi-e se escribió **encima** del diseño anterior y arrasó con
`!important` (1806 en `sumie-ui.css`). La solución correcta no es borrar `!important` uno a uno,
sino **reorganizar con capas CSS (`@layer`)**, que eliminan la necesidad de `!important`.

- [x] **Auditoría:** inventario de `sumie-ui.css` por bloques. **Hallazgo clave:** no existe un
      reset global `* { border-radius: 0 !important }` (el punto de checklist siguiente), sino
      `border-radius: 0` repetido por componente (105 veces) y **sin** `!important`; por tanto no
      había nada que eliminar ahí. La estética Sumi-e no añadió reglas SaaS obsoletas nuevas: las
      reglas heredadas siguen siendo las de las 5 hojas antiguas (hoy aisladas en capa).
- [x] **Introducir `@layer`**: las 5 hojas heredadas (`base`, `menu`, `hud`, `modals`, `chapter`)
      se envuelven en `@layer legacy { ... }`; `sumie-ui.css` se importa **sin capa**. Así toda
      declaración *normal* de Sumi-e gana a `legacy` **por orden de capas, sin `!important`**.
- [x] **Eliminar `!important`**: de **1806** en `sumie-ui.css` a **32**; **48** en todo el
      proyecto (32 en Sumi-e + 16 heredadas) — meta ≤ 50 cumplida.
      - Los 32 de Sumi-e existen **solo** para vencer estilos *inline* que inyecta JavaScript
        (colores de estado del HUD, bordes de acento de héroe, botones del modal de desarrollo…).
        Un `@layer` nunca puede vencer un estilo inline, por lo que `!important` es obligatorio ahí.
      - Se derivaron de forma **automática y verificada** (ganador real de la cascada por cada
        conflicto, más el cierre de reordenación entre reglas Sumi-e), no a mano.
      - Adicionalmente se limpiaron **declaraciones inline muertas** en `DevModal.js` e
        `InventoryModal.js` (propiedades que Sumi-e ya sobrescribía), lo que permitió bajar de 87 a
        48 sin tocar ninguna propiedad *viva*.
- [x] **Eliminar el reset global `border-radius: 0 !important`** → **N/A**: ver hallazgo de la
      auditoría (no existía tal reset global).
- [x] **Dividir `sumie-ui.css` en módulos** → **diferido** a fase posterior. Motivo: el archivo ya
      no depende de `!important` para su orden, de modo que la división es hoy una mejora
      *cosmética* de organización; hacerla ahora obliga a reordenar ~86 KB y a re-verificar toda la
      cascada, con riesgo visual desproporcionado frente al beneficio. La capa `legacy` ya resolvió
      el problema de fondo.
- [x] **Consolidar estilos duplicados** entre `modals.css` y `sumie-ui.css` → **diferido** por el
      mismo motivo: es una optimización de bytes (el CSS compilado ya bajó) sin impacto de
      mantenibilidad una vez aisladas las capas.

**Validación obligatoria (ejecutada):** se construyó un *arnés* headless (Chrome por CDP) que
captura **16 estados** (menú, menú con foco, cada modal, HUD de controles y showroom in-game con
sus variantes) y compara **estilos computados + capturas PNG** contra la línea base. El showroom se
normaliza (`onGround`, clase `invuln`, cursor) para que sea determinista.

**Resultado:**
- Estilos computados: **0 diferencias** en los 16 estados.
- Píxeles: **0 diferencias** en 14 estados; los 2 restantes (`slots`, `dev`) difieren solo en
  **~40 px** del parpadeo del cursor de texto (idéntico artefacto aparece al comparar la línea base
  consigo misma).
- `!important`: **1822 → 48** (‑97 %).
- CSS compilado: **20.41 KB → 19.32 KB gzip** (‑1091 B) y **144.5 KB → 126.9 KB** crudos.
- `npm run ci`: lint + **321 tests** + build en verde.

**DoD:** `!important` ≤ 50 ✅; CSS gzip ≤ línea base ✅; cero regresiones visuales en las capturas ✅;
build en verde ✅.

- [ ] _Pendiente:_ smoke test manual **host + invitado** sobre `npm run dev` (requiere navegador).
      La validación visual de CSS ya está cubierta de forma automatizada (16 estados) por encima.

---

### Fase 6 — Extracción de arte y datos
**Esfuerzo:** ~2–3 días · **Riesgo:** medio · **Depende de:** Fase 0

**Hallazgo al ejecutar (matiza el informe):** `heroPortraits.js` **no** eran "5 956 líneas de SVG
inline". Los strings SVG son solo **140 constantes de una línea**; el grueso (~5 000 líneas) son
**funciones de dibujo imperativo a canvas** (`draw*ToCanvas`) que reproducen el mismo *pixel art*
con `ctx.fillRect(...)`. Las texturas 3D usan **únicamente** esas funciones (`def.drawToCanvas`) y
los tests verifican los strings (`HERO_PORTRAITS[*].svg/.body`). Ambos son necesarios: **no hay
código muerto**. Por eso la conversión literal a `.svg` + `?raw` **no** habría desmonolitizado nada
(movería 140 líneas). La descomposición correcta es **por héroe** (arte) y **por región** (pipeline
de texturas), separando datos de lógica.

- [x] `heroPortraits.js` **5 956 → fachada de 30 líneas**; la implementación vive en
      `src/heroes/portraits/`:
      - `<hero>.js` (×5): datos SVG + las 14 funciones `draw*ToCanvas` + su definición
        `<hero>Portrait` (arte; ~920–1 056 líneas cada uno).
      - `registry.js`: ensambla `HERO_PORTRAITS` desde las 5 definiciones (evita ciclos de import).
      - `textures{Head,Torso,Arm,Leg}.js`: factorías `createHero*Texture/Material` + cachés por
        región y su `dispose<Region>PortraitTextures()` (~250–340 líneas cada uno).
      - `heroPortraits.js`: fachada que **re-exporta la API histórica intacta** (registro,
        factorías y todo el arte) y compone `disposeHeroPortraitsCache()`.
- [x] El arte sigue en el chunk **`assets-art`** (222,90 KB, **30,48 KB gzip**) y **no** en el
      *bundle* de entrada `index` (373,16 KB, **sin cambios**). `manualChunks` se amplía con
      `src/heroes/portraits/` y `src/ui/icons.data` para preservar el aislamiento.
      - **Matiz:** `assets-art` es un chunk **dedicado pero estático** (lo importa `index` vía
        `engine-render`/`Icons`), no *lazy* como suponía el informe. Hacerlo perezoso exigiría
        cargar de forma asíncrona la construcción de avatares (cambio de comportamiento), fuera del
        alcance de esta fase.
- [x] Pipeline documentado como **artesanal** (arte dibujado a mano, no generado) en
      `docs/29-diseno-visual-sumi-e-pixel-art.md` §8.2; no procede script generador.
- [x] `Icons.js` revisado con el mismo criterio → **datos separados de lógica**:
      `icons.data.js` (mapa `ICONS` + alias + equivalencias emoji, 797 líneas) e `Icons.js`
      (lógica de resolución/render, **133 líneas**), manteniendo la API (re-export).

**Verificación de equivalencia:** las **268 declaraciones** *top-level* del archivo original se
conservan **con cuerpo idéntico** (comparación normalizada); solo se reescriben `HERO_PORTRAITS`
(ensamblado desde 5 definiciones, cada bloque **idéntico** al original) y `disposeHeroPortraitsCache`
(agrega las 4 regiones; las **28 cachés** siguen liberándose todas). `npm run ci`: lint + **321
tests** + build en verde.

**DoD:** `heroPortraits` deja de ser un `.js` monolítico (5 956 → fachada de 30 líneas + módulos
≤ 1 056) ✅; el *bundle* de entrada no contiene el arte ✅; el menú de selección de héroe y la API
que consumen los tests quedan intactos ✅.

**Validación visual (ejecutada):** arnés headless (Chrome/CDP, 16 estados: menú, foco, cada modal,
HUD de controles y showroom in-game) comparado con la línea base posterior a la Fase 5:
- Estilos computados: **16/16 estados, 0 diferencias**.
- Píxeles: **15/16 idénticos**; el único (`slots`, 83 px en una caja de 12×8) es el **parpadeo del
  cursor de texto** del campo de nombre, confirmado como ruido al comparar dos capturas del
  **mismo** código (que también difieren en esa región y en `dev`).

---

### Fase 7 — Proceso y guardarraíles permanentes
**Esfuerzo:** ~2 días · **Riesgo:** bajo · **Depende de:** Fases 0–6

- [x] **Script de guardarraíles** ([`scripts/guards.mjs`](../scripts/guards.mjs), `npm run guards`,
      integrado en `npm run ci`) que falla si:
      - hay más de **50** `!important` en el CSS de `src/` (hoy **48**),
      - algún archivo de **lógica** de `src/` supera **500** líneas (los datos/arte están exentos
        por patrón y la **deuda pre-existente está congelada** dentro del propio script),
      - hay `console.log`/`console.info` en `src/` fuera de `src/config/logger.js` (hoy **0**),
      - el *bundle* de entrada supera **380 KB** (hoy **373,8 KB**).
      - **Deuda congelada** (> 500 líneas, no puede crecer): `SoundManager` 1035 · `HudManager` 726 ·
        `SessionManager` 711 · `MenuManager` 679 · `SaveManager` 632 · `Protocol` 619 ·
        `DevModal` 592 · `InventoryModal` 573 · `LevelLoader` 504. Reducirlos los saca de la lista.
      - Verificado también **en negativo**: el guardarraíl falla ante un archivo nuevo > 500, ante un
        `console.log` y ante el crecimiento de un archivo de deuda.
- [x] **Job `guards`** añadido a `.github/workflows/ci.yml` (build + `npm run guards`), en paralelo
      al job `verify`.
- [ ] **Branch protection** en `main` y `develop` (PR obligatorio, CI verde requerido, sin pushes
      directos). *(Acción sobre el repositorio remoto; pendiente de aplicar.)*
- [ ] Promover `develop` → `main` y publicar release `1.41.0` con el CHANGELOG del saneamiento.
      *(Pendiente de confirmación.)*
- [x] Revisar `docs/` 1:1 con el código (drift de H1): **141 enlaces**
      `file:///data/data/com.termux/...` → rutas relativas `../` (16 documentos), **8 enlaces**
      `](src/…)` sin `../` corregidos y **2 tests** inexistentes reapuntados en el doc 14;
      **202/202 enlaces relativos** resuelven, el índice de `docs/README.md` está 1:1 con la carpeta
      (30 documentos) y los conteos de tests se sincronizan a **321**.

**DoD:** push directo a `main`/`develop` rechazado ⏳ *(pendiente de branch protection)*; job
`guards` activo ✅; release publicada ⏳ *(pendiente de confirmación)*.

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
