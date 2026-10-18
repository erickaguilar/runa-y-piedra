// src/heroes/portraits/guardian.js
// Arte Sumi-e Pixel Art del heroe Guardian: datos SVG (canonicos, verificados por tests)
// y funciones de dibujo imperativo a canvas (usadas por las texturas 3D).
// Generado al trocear src/heroes/heroPortraits.js (Fase 6). Sin cambios de comportamiento.

/**
 * SVG canónico del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Papel pergamino Washi (#d6cfc2) y marco perimetral de tinta Sumi (#0c0a09).
 * - Sombra proyectada por la corona 3D con degradado/dithering (#1c1917, #57534e, #78716c) y sienes canosas (#44403c, #57534e).
 * - Rostro caligráfico de coloso veterano con ceño curtido, cejas severas, esclerótica blanca con pupila azul espiritual (#0284c7),
 *   boca firme y cicatriz de tinta (#78716c).
 */
export const GUARDIAN_PORTRAIT_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="26" width="30" height="5" fill="#a8a29e"/><rect x="1" y="13" width="3" height="18" fill="#bfb6a6"/><rect x="28" y="13" width="3" height="18" fill="#a8a29e"/><rect x="1" y="1" width="30" height="3" fill="#1c1917"/><rect x="1" y="4" width="30" height="2" fill="#57534e"/><g fill="#78716c"><rect x="2" y="6" width="28" height="1"/><rect x="4" y="7" width="2" height="1"/><rect x="10" y="7" width="2" height="1"/><rect x="20" y="7" width="2" height="1"/><rect x="26" y="7" width="2" height="1"/></g><g fill="#44403c"><rect x="1" y="6" width="3" height="8"/><rect x="28" y="6" width="3" height="8"/></g><g fill="#57534e"><rect x="2" y="7" width="2" height="7"/><rect x="28" y="7" width="2" height="7"/></g><rect x="8" y="11" width="16" height="1" fill="#a8a29e"/><rect x="11" y="13" width="10" height="1" fill="#78716c"/><rect x="15" y="12" width="2" height="3" fill="#78716c"/><rect x="6" y="16" width="6" height="2" fill="#0c0a09"/><rect x="20" y="16" width="6" height="2" fill="#0c0a09"/><rect x="7" y="18" width="4" height="4" fill="#0c0a09"/><rect x="21" y="18" width="4" height="4" fill="#0c0a09"/><rect x="7" y="18" width="2" height="2" fill="#ffffff"/><rect x="21" y="18" width="2" height="2" fill="#ffffff"/><rect x="9" y="20" width="2" height="2" fill="#0284c7"/><rect x="23" y="20" width="2" height="2" fill="#0284c7"/><rect x="12" y="25" width="8" height="2" fill="#450a0a"/><rect x="13" y="25" width="6" height="1" fill="#0c0a09"/><rect x="24" y="23" width="1" height="4" fill="#78716c"/>`;

export const GUARDIAN_PORTRAIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_PORTRAIT_BODY}</svg>`;

/**
 * Renderizado procedural síncrono píxel a píxel del Guardián sobre un Canvas 2D.
 */
export function drawGuardianPortraitToCanvas(ctx, size = 32) {
  const s = size / 32;

  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillRect(28 * s, 13 * s, 3 * s, 18 * s);
  ctx.fillStyle = '#bfb6a6';
  ctx.fillRect(1 * s, 13 * s, 3 * s, 18 * s);

  // Sombra proyectada por la corona 3D (y=1..6)
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(1 * s, 4 * s, 30 * s, 2 * s);

  // Dithering de sombra en la frente
  ctx.fillStyle = '#78716c';
  ctx.fillRect(2 * s, 6 * s, 28 * s, 1 * s);
  ctx.fillRect(4 * s, 7 * s, 2 * s, 1 * s);
  ctx.fillRect(10 * s, 7 * s, 2 * s, 1 * s);
  ctx.fillRect(20 * s, 7 * s, 2 * s, 1 * s);
  ctx.fillRect(26 * s, 7 * s, 2 * s, 1 * s);

  // Patillas y sienes de veterano (gris piedra canoso)
  ctx.fillStyle = '#44403c';
  ctx.fillRect(1 * s, 6 * s, 3 * s, 8 * s);
  ctx.fillRect(28 * s, 6 * s, 3 * s, 8 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(2 * s, 7 * s, 2 * s, 7 * s);
  ctx.fillRect(28 * s, 7 * s, 2 * s, 7 * s);

  // Ceño curtido de coloso sobre las cejas
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(8 * s, 11 * s, 16 * s, 1 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(11 * s, 13 * s, 10 * s, 1 * s);
  ctx.fillRect(15 * s, 12 * s, 2 * s, 3 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(6 * s, 16 * s, 6 * s, 2 * s);
  ctx.fillRect(20 * s, 16 * s, 6 * s, 2 * s);

  ctx.fillRect(7 * s, 18 * s, 4 * s, 4 * s);
  ctx.fillRect(21 * s, 18 * s, 4 * s, 4 * s);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7 * s, 18 * s, 2 * s, 2 * s);
  ctx.fillRect(21 * s, 18 * s, 2 * s, 2 * s);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(9 * s, 20 * s, 2 * s, 2 * s);
  ctx.fillRect(23 * s, 20 * s, 2 * s, 2 * s);

  ctx.fillStyle = '#450a0a';
  ctx.fillRect(12 * s, 25 * s, 8 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(13 * s, 25 * s, 6 * s, 1 * s);

  ctx.fillStyle = '#78716c';
  ctx.fillRect(24 * s, 23 * s, 1 * s, 4 * s);
}

/**
 * SVG canónico del Torso / Pecho del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Coraza monolítica de basalto y bronce (#292524, #44403c, #78350f, #92400e) enmarcada en tinta Sumi (#0c0a09).
 * - Filos de oro imperial (#b45309, #d97706, #fef08a) que enmarcan el emblema 3D del pecho.
 * - Placas abdominales laminadas con pincel seco (Kasure) y cinturón con gema Hanko (#991b1b, #dc2626).
 */
export const GUARDIAN_CHEST_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#44403c"/><rect x="2" y="2" width="28" height="22" fill="#78350f"/><rect x="4" y="2" width="24" height="16" fill="#92400e"/><rect x="2" y="2" width="4" height="22" fill="#57534e"/><rect x="26" y="2" width="4" height="22" fill="#292524"/><rect x="6" y="3" width="20" height="2" fill="#d97706"/><rect x="8" y="3" width="16" height="1" fill="#fef08a"/><rect x="9" y="6" width="14" height="10" fill="#0c0a09"/><rect x="10" y="7" width="12" height="8" fill="#b45309"/><rect x="12" y="8" width="8" height="6" fill="#fef08a"/><rect x="7" y="18" width="18" height="2" fill="#0c0a09"/><rect x="7" y="21" width="18" height="2" fill="#0c0a09"/><rect x="1" y="26" width="30" height="5" fill="#1c1917"/><rect x="12" y="26" width="8" height="5" fill="#b45309"/><rect x="14" y="27" width="4" height="3" fill="#dc2626"/>`;

export const GUARDIAN_CHEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_CHEST_BODY}</svg>`;

export function drawGuardianChestToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Placas laterales de piedra basalto y coraza de bronce
  ctx.fillStyle = '#44403c';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(2 * s, 2 * s, 28 * s, 22 * s);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 16 * s);

  // Sombreado lateral Sumi-e
  ctx.fillStyle = '#57534e';
  ctx.fillRect(2 * s, 2 * s, 4 * s, 22 * s);
  ctx.fillStyle = '#292524';
  ctx.fillRect(26 * s, 2 * s, 4 * s, 22 * s);

  // Collarín y ribete de oro imperial
  ctx.fillStyle = '#d97706';
  ctx.fillRect(6 * s, 3 * s, 20 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(8 * s, 3 * s, 16 * s, 1 * s);

  // Engaste pectoral para la pechera y rombo 3D (volumen mixto)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(9 * s, 6 * s, 14 * s, 10 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(10 * s, 7 * s, 12 * s, 8 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(12 * s, 8 * s, 8 * s, 6 * s);

  // Lamas abdominales y remaches
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(7 * s, 18 * s, 18 * s, 2 * s);
  ctx.fillRect(7 * s, 21 * s, 18 * s, 2 * s);

  // Cinturón pesado con sello Hanko
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(12 * s, 26 * s, 8 * s, 5 * s);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(14 * s, 27 * s, 4 * s, 3 * s);
}

/**
 * SVG canónico del Perfil Lateral de la Cabeza del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Orientación base (+X, lado derecho del cubo mirando desde +Z): frente a la izquierda (x=0), nuca a la derecha (x=31).
 * - Sombra proyectada por la corona 3D (#1c1917, #57534e, #78716c) en y=1..6.
 * - Sien, patilla y cabello corto gris piedra de coloso veterano (#292524, #44403c, #57534e, #78716c) con trazos Kasure.
 * - Oreja estilizada Sumi-e en relieve pergamino (#d6cfc2, #a8a29e, #0c0a09) y carrillera/placa lateral acorazada (#44403c, #b45309, #d97706).
 */
export const GUARDIAN_SIDE_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="1" width="30" height="3" fill="#1c1917"/><rect x="1" y="4" width="30" height="2" fill="#57534e"/><rect x="1" y="6" width="30" height="1" fill="#78716c"/><rect x="1" y="7" width="3" height="24" fill="#a8a29e"/><rect x="1" y="26" width="14" height="5" fill="#a8a29e"/><rect x="8" y="7" width="4" height="15" fill="#57534e"/><rect x="9" y="7" width="2" height="14" fill="#44403c"/><rect x="18" y="7" width="13" height="17" fill="#44403c"/><rect x="19" y="7" width="11" height="16" fill="#57534e"/><g fill="#292524"><rect x="20" y="7" width="2" height="16"/><rect x="24" y="7" width="2" height="16"/><rect x="28" y="7" width="2" height="16"/></g><g fill="#78716c"><rect x="22" y="8" width="2" height="14"/><rect x="26" y="8" width="2" height="14"/></g><rect x="12" y="16" width="6" height="8" fill="#0c0a09"/><rect x="13" y="17" width="4" height="6" fill="#d6cfc2"/><rect x="14" y="18" width="2" height="4" fill="#78716c"/><rect x="14" y="19" width="1" height="2" fill="#0c0a09"/><rect x="14" y="24" width="17" height="7" fill="#0c0a09"/><rect x="15" y="25" width="15" height="5" fill="#44403c"/><rect x="16" y="25" width="13" height="2" fill="#b45309"/><rect x="17" y="25" width="11" height="1" fill="#d97706"/><rect x="17" y="28" width="2" height="2" fill="#fef08a"/><rect x="25" y="28" width="2" height="2" fill="#fef08a"/>`;

export const GUARDIAN_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_SIDE_BODY}</svg>`;

/**
 * Renderizado procedural síncrono píxel a píxel del Perfil Lateral del Guardián sobre un Canvas 2D.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {boolean} flipX - Si es true (cara -X), invierte horizontalmente para empatar el frente (+Z) a la derecha del lienzo.
 */
export function drawGuardianSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  // Fondo pergamino Washi
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(0, 0, size, size);

  // Marco perimetral de tinta Sumi (1px)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  // Sombra proyectada por la corona 3D (y=1..6)
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(rx(1, 30), 4 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(1, 30), 6 * s, 30 * s, 1 * s);

  // Sombra de transición con el borde de la cara (x=1..3) y mandíbula inferior (y=26..30)
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(rx(1, 3), 7 * s, 3 * s, 24 * s);
  ctx.fillRect(rx(1, 14), 26 * s, 14 * s, 5 * s);

  // Patilla de veterano frente a la oreja (x=8..11, y=7..21)
  ctx.fillStyle = '#57534e';
  ctx.fillRect(rx(8, 4), 7 * s, 4 * s, 15 * s);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(rx(9, 2), 7 * s, 2 * s, 14 * s);

  // Cabello corto gris piedra hacia la nuca con surcos Kasure (x=18..30, y=7..23)
  ctx.fillStyle = '#44403c';
  ctx.fillRect(rx(18, 13), 7 * s, 13 * s, 17 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(rx(19, 11), 7 * s, 11 * s, 16 * s);
  ctx.fillStyle = '#292524';
  ctx.fillRect(rx(20, 2), 7 * s, 2 * s, 16 * s);
  ctx.fillRect(rx(24, 2), 7 * s, 2 * s, 16 * s);
  ctx.fillRect(rx(28, 2), 7 * s, 2 * s, 16 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(22, 2), 8 * s, 2 * s, 14 * s);
  ctx.fillRect(rx(26, 2), 8 * s, 2 * s, 14 * s);

  // Oreja estilizada Sumi-e (x=12..17, y=16..23)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(12, 6), 16 * s, 6 * s, 8 * s);
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(rx(13, 4), 17 * s, 4 * s, 6 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(14, 2), 18 * s, 2 * s, 4 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(14, 1), 19 * s, 1 * s, 2 * s);

  // Placa lateral acorazada / carrillera que conecta con el cubrenuca (x=14..30, y=24..30)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(14, 17), 24 * s, 17 * s, 7 * s);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(rx(15, 15), 25 * s, 15 * s, 5 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(rx(16, 13), 25 * s, 13 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(17, 11), 25 * s, 11 * s, 1 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(17, 2), 28 * s, 2 * s, 2 * s);
  ctx.fillRect(rx(25, 2), 28 * s, 2 * s, 2 * s);
}

/**
 * SVG canónico de la Nuca / Parte Trasera de la Cabeza del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Sombra proyectada por la corona 3D (#1c1917, #57534e, #78716c) en y=1..6.
 * - Cabello corto de coloso veterano en gris basalto y ceniza (#292524, #44403c, #57534e, #78716c) con trazos Kasure verticales.
 * - Cubrenuca / gorjal acorazado de acero y bronce con ribete áureo y remaches en y=24..30 que empata con los laterales.
 */
export const GUARDIAN_BACK_BODY = `<rect width="32" height="32" fill="#44403c"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="1" width="30" height="3" fill="#1c1917"/><rect x="1" y="4" width="30" height="2" fill="#57534e"/><rect x="1" y="6" width="30" height="1" fill="#78716c"/><rect x="2" y="7" width="28" height="17" fill="#57534e"/><g fill="#292524"><rect x="4" y="7" width="2" height="17"/><rect x="9" y="7" width="2" height="17"/><rect x="15" y="7" width="2" height="17"/><rect x="21" y="7" width="2" height="17"/><rect x="26" y="7" width="2" height="17"/></g><g fill="#78716c"><rect x="6" y="8" width="2" height="15"/><rect x="12" y="8" width="2" height="15"/><rect x="18" y="8" width="2" height="15"/><rect x="24" y="8" width="2" height="15"/></g><rect x="1" y="24" width="30" height="7" fill="#0c0a09"/><rect x="2" y="25" width="28" height="5" fill="#44403c"/><rect x="3" y="25" width="26" height="2" fill="#b45309"/><rect x="4" y="25" width="24" height="1" fill="#d97706"/><rect x="15" y="25" width="2" height="5" fill="#292524"/><g fill="#fef08a"><rect x="6" y="28" width="2" height="2"/><rect x="24" y="28" width="2" height="2"/></g>`;

export const GUARDIAN_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_BACK_BODY}</svg>`;

/**
 * Renderizado procedural síncrono píxel a píxel de la Nuca del Guardián sobre un Canvas 2D.
 */
export function drawGuardianBackToCanvas(ctx, size = 32) {
  const s = size / 32;

  // Base gris piedra oscuro
  ctx.fillStyle = '#44403c';
  ctx.fillRect(0, 0, size, size);

  // Marco perimetral de tinta Sumi (1px)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  // Sombra proyectada por la corona 3D (y=1..6)
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(1 * s, 4 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(1 * s, 6 * s, 30 * s, 1 * s);

  // Cabello corto de veterano en la nuca con surcos Kasure (y=7..23)
  ctx.fillStyle = '#57534e';
  ctx.fillRect(2 * s, 7 * s, 28 * s, 17 * s);
  ctx.fillStyle = '#292524';
  ctx.fillRect(4 * s, 7 * s, 2 * s, 17 * s);
  ctx.fillRect(9 * s, 7 * s, 2 * s, 17 * s);
  ctx.fillRect(15 * s, 7 * s, 2 * s, 17 * s);
  ctx.fillRect(21 * s, 7 * s, 2 * s, 17 * s);
  ctx.fillRect(26 * s, 7 * s, 2 * s, 17 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(6 * s, 8 * s, 2 * s, 15 * s);
  ctx.fillRect(12 * s, 8 * s, 2 * s, 15 * s);
  ctx.fillRect(18 * s, 8 * s, 2 * s, 15 * s);
  ctx.fillRect(24 * s, 8 * s, 2 * s, 15 * s);

  // Cubrenuca / gorjal acorazado de acero y bronce (y=24..30)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 24 * s, 30 * s, 7 * s);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(2 * s, 25 * s, 28 * s, 5 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(3 * s, 25 * s, 26 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(4 * s, 25 * s, 24 * s, 1 * s);
  ctx.fillStyle = '#292524';
  ctx.fillRect(15 * s, 25 * s, 2 * s, 5 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(6 * s, 28 * s, 2 * s, 2 * s);
  ctx.fillRect(24 * s, 28 * s, 2 * s, 2 * s);
}

/**
 * SVG canónico del Costado Lateral del Torso del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Placas de basalto y bronce hacia el pecho (x=1..9) y hacia el espaldar (x=22..30).
 * - Faja lateral de cuero/malla (#292524) cruzada por 3 correas tensoras con hebillas de oro (#b45309, #d97706, #fef08a) y cinturón pesado inferior.
 */
export const GUARDIAN_TORSO_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#292524"/><rect x="1" y="2" width="9" height="23" fill="#78350f"/><rect x="2" y="2" width="6" height="22" fill="#92400e"/><rect x="22" y="2" width="9" height="23" fill="#44403c"/><rect x="23" y="2" width="6" height="22" fill="#78350f"/><g fill="#0c0a09"><rect x="8" y="5" width="16" height="4"/><rect x="8" y="12" width="16" height="4"/><rect x="8" y="19" width="16" height="4"/></g><g fill="#b45309"><rect x="9" y="6" width="14" height="2"/><rect x="9" y="13" width="14" height="2"/><rect x="9" y="20" width="14" height="2"/></g><g fill="#fef08a"><rect x="14" y="6" width="4" height="2"/><rect x="14" y="13" width="4" height="2"/><rect x="14" y="20" width="4" height="2"/></g><rect x="1" y="26" width="30" height="5" fill="#1c1917"/><rect x="2" y="27" width="28" height="2" fill="#b45309"/>`;

export const GUARDIAN_TORSO_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_TORSO_SIDE_BODY}</svg>`;

export function drawGuardianTorsoSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#292524';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 25 * s);

  // Borde del peto de bronce (frente) y espaldar (dorso)
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(1, 9), 2 * s, 9 * s, 23 * s);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(rx(2, 6), 2 * s, 6 * s, 22 * s);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(rx(22, 9), 2 * s, 9 * s, 23 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(23, 6), 2 * s, 6 * s, 22 * s);

  // 3 correas laterales con hebillas doradas que unen peto y espaldar
  for (const y of [5, 12, 19]) {
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(rx(8, 16), y * s, 16 * s, 4 * s);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(rx(9, 14), (y + 1) * s, 14 * s, 2 * s);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(rx(14, 4), (y + 1) * s, 4 * s, 2 * s);
  }

  // Continuación lateral del cinturón pesado
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(rx(1, 30), 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(rx(2, 28), 27 * s, 28 * s, 2 * s);
}

/**
 * SVG canónico de la Espalda del Torso del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Espaldar monolítico de basalto y bronce (#44403c, #78350f, #92400e) con collarín áureo y columna vertebral acorazada en relieve (#b45309, #fef08a).
 */
export const GUARDIAN_TORSO_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#44403c"/><rect x="2" y="2" width="28" height="22" fill="#78350f"/><rect x="5" y="2" width="22" height="18" fill="#92400e"/><rect x="2" y="2" width="3" height="22" fill="#292524"/><rect x="27" y="2" width="3" height="22" fill="#292524"/><rect x="6" y="3" width="20" height="2" fill="#d97706"/><rect x="8" y="3" width="16" height="1" fill="#fef08a"/><rect x="12" y="5" width="8" height="20" fill="#0c0a09"/><rect x="13" y="6" width="6" height="18" fill="#b45309"/><g fill="#fef08a"><rect x="14" y="7" width="4" height="2"/><rect x="14" y="11" width="4" height="2"/><rect x="14" y="15" width="4" height="2"/><rect x="14" y="19" width="4" height="2"/></g><rect x="1" y="26" width="30" height="5" fill="#1c1917"/><rect x="12" y="26" width="8" height="5" fill="#b45309"/><rect x="14" y="27" width="4" height="3" fill="#dc2626"/>`;

export const GUARDIAN_TORSO_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_TORSO_BACK_BODY}</svg>`;

export function drawGuardianTorsoBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#44403c';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(2 * s, 2 * s, 28 * s, 22 * s);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(5 * s, 2 * s, 22 * s, 18 * s);

  ctx.fillStyle = '#292524';
  ctx.fillRect(2 * s, 2 * s, 3 * s, 22 * s);
  ctx.fillRect(27 * s, 2 * s, 3 * s, 22 * s);

  // Collarín dorsal de oro
  ctx.fillStyle = '#d97706';
  ctx.fillRect(6 * s, 3 * s, 20 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(8 * s, 3 * s, 16 * s, 1 * s);

  // Columna vertebral acorazada en el centro del espaldar
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(12 * s, 5 * s, 8 * s, 20 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(13 * s, 6 * s, 6 * s, 18 * s);
  ctx.fillStyle = '#fef08a';
  for (const y of [7, 11, 15, 19]) {
    ctx.fillRect(14 * s, y * s, 4 * s, 2 * s);
  }

  // Cinturón pesado trasero
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(12 * s, 26 * s, 8 * s, 5 * s);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(14 * s, 27 * s, 4 * s, 3 * s);
}

/**
 * SVG canónico del Frente del Brazo del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Placa superior de bíceps en bronce acorazado (#5a3a18, #78350f, #92400e) con arista dorada central (#d97706, #fef08a).
 * - Cota de malla y refuerzo vertical de acero (#1e293b, #3a3f48, #6b7078) con correa transversal y hebilla de oro.
 */
export const GUARDIAN_ARM_FRONT_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="2" y="1" width="28" height="15" fill="#5a3a18"/><rect x="4" y="2" width="24" height="13" fill="#78350f"/><rect x="8" y="3" width="16" height="11" fill="#92400e"/><rect x="13" y="3" width="6" height="11" fill="#b45309"/><rect x="15" y="4" width="2" height="9" fill="#fef08a"/><rect x="5" y="4" width="2" height="2" fill="#fef08a"/><rect x="25" y="4" width="2" height="2" fill="#fef08a"/><rect x="5" y="11" width="2" height="2" fill="#fef08a"/><rect x="25" y="11" width="2" height="2" fill="#fef08a"/><rect x="2" y="16" width="28" height="2" fill="#0c0a09"/><rect x="3" y="18" width="26" height="13" fill="#1c1917"/><rect x="6" y="18" width="20" height="13" fill="#292524"/><rect x="10" y="18" width="12" height="13" fill="#3a3f48"/><rect x="12" y="18" width="8" height="13" fill="#6b7078"/><rect x="15" y="18" width="2" height="13" fill="#94a3b8"/><rect x="3" y="24" width="26" height="4" fill="#0c0a09"/><rect x="4" y="25" width="24" height="2" fill="#78350f"/><rect x="14" y="24" width="4" height="4" fill="#fef08a"/>`;

export const GUARDIAN_ARM_FRONT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_ARM_FRONT_BODY}</svg>`;

export function drawGuardianArmFrontToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Placa de bíceps superior de bronce
  ctx.fillStyle = '#5a3a18';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 15 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 13 * s);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(8 * s, 3 * s, 16 * s, 11 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(13 * s, 3 * s, 6 * s, 11 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 4 * s, 2 * s, 9 * s);

  // Remaches dorados de fijación
  for (const y of [4, 11]) {
    ctx.fillRect(5 * s, y * s, 2 * s, 2 * s);
    ctx.fillRect(25 * s, y * s, 2 * s, 2 * s);
  }

  // Seam divisorio de articulación
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 16 * s, 28 * s, 2 * s);

  // 2. Antebrazo inferior con cota de malla y riel de acero
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(3 * s, 18 * s, 26 * s, 13 * s);
  ctx.fillStyle = '#292524';
  ctx.fillRect(6 * s, 18 * s, 20 * s, 13 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(10 * s, 18 * s, 12 * s, 13 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(12 * s, 18 * s, 8 * s, 13 * s);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(15 * s, 18 * s, 2 * s, 13 * s);

  // Correa transversal de cuero con hebilla dorada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(3 * s, 24 * s, 26 * s, 4 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(4 * s, 25 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(14 * s, 24 * s, 4 * s, 4 * s);
}

/**
 * SVG canónico del Costado Exterior del Brazo del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Placa exterior de blindaje pesado con blasón romboidal dorado en el bíceps y doble faja de acero inferior.
 */
export const GUARDIAN_ARM_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="2" y="1" width="28" height="15" fill="#78350f"/><rect x="4" y="2" width="24" height="13" fill="#92400e"/><rect x="13" y="4" width="6" height="8" fill="#0c0a09"/><rect x="14" y="5" width="4" height="6" fill="#d97706"/><rect x="15" y="6" width="2" height="4" fill="#fef08a"/><rect x="5" y="3" width="2" height="11" fill="#44403c"/><rect x="25" y="3" width="2" height="11" fill="#44403c"/><rect x="2" y="16" width="28" height="2" fill="#0c0a09"/><rect x="2" y="18" width="28" height="13" fill="#3a3f48"/><rect x="4" y="19" width="24" height="11" fill="#475569"/><rect x="7" y="19" width="18" height="11" fill="#6b7078"/><rect x="2" y="21" width="28" height="3" fill="#0c0a09"/><rect x="3" y="22" width="26" height="1" fill="#1c1917"/><rect x="15" y="21" width="2" height="3" fill="#fef08a"/><rect x="2" y="27" width="28" height="3" fill="#0c0a09"/><rect x="3" y="28" width="26" height="1" fill="#1c1917"/><rect x="15" y="27" width="2" height="3" fill="#fef08a"/>`;

export const GUARDIAN_ARM_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_ARM_SIDE_BODY}</svg>`;

export function drawGuardianArmSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Placa lateral exterior de bíceps
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 15 * s);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(rx(4, 24), 2 * s, 24 * s, 13 * s);

  // Blasón romboidal de oro
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(13, 6), 4 * s, 6 * s, 8 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(14, 4), 5 * s, 4 * s, 6 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(15, 2), 6 * s, 2 * s, 4 * s);

  // Remaches laterales
  ctx.fillStyle = '#44403c';
  ctx.fillRect(rx(5, 2), 3 * s, 2 * s, 11 * s);
  ctx.fillRect(rx(25, 2), 3 * s, 2 * s, 11 * s);

  // Línea de articulación
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 16 * s, 28 * s, 2 * s);

  // Placa lateral exterior inferior de acero
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(rx(2, 28), 18 * s, 28 * s, 13 * s);
  ctx.fillStyle = '#475569';
  ctx.fillRect(rx(4, 24), 19 * s, 24 * s, 11 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(rx(7, 18), 19 * s, 18 * s, 11 * s);

  // Correas de acero con remache central
  for (const y of [21, 27]) {
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(rx(2, 28), y * s, 28 * s, 3 * s);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(rx(3, 26), (y + 1) * s, 26 * s, 1 * s);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(rx(15, 2), y * s, 2 * s, 3 * s);
  }
}

/**
 * SVG canónico del Costado Interior del Brazo del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Vista orientada al torso: cuero acolchado (#1c1917, #292524) con correas de cuero y hebillas doradas.
 */
export const GUARDIAN_ARM_INNER_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="2" y="1" width="28" height="30" fill="#1c1917"/><rect x="4" y="2" width="24" height="28" fill="#292524"/><g fill="#0c0a09"><rect x="2" y="6" width="28" height="4"/><rect x="2" y="14" width="28" height="4"/><rect x="2" y="22" width="28" height="4"/></g><g fill="#451a03"><rect x="3" y="7" width="26" height="2"/><rect x="3" y="15" width="26" height="2"/><rect x="3" y="23" width="26" height="2"/></g><g fill="#fef08a"><rect x="14" y="6" width="4" height="4"/><rect x="14" y="14" width="4" height="4"/><rect x="14" y="22" width="4" height="4"/></g>`;

export const GUARDIAN_ARM_INNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_ARM_INNER_BODY}</svg>`;

export function drawGuardianArmInnerToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Acolchado interior de cuero y lona oscura
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 30 * s);
  ctx.fillStyle = '#292524';
  ctx.fillRect(rx(4, 24), 2 * s, 24 * s, 28 * s);

  // 3 correas de ajuste con hebillas doradas
  for (const y of [6, 14, 22]) {
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(rx(2, 28), y * s, 28 * s, 4 * s);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(rx(3, 26), (y + 1) * s, 26 * s, 2 * s);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(rx(14, 4), y * s, 4 * s, 4 * s);
  }
}

/**
 * SVG canónico de la Espalda del Brazo del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Placa dorsal de tríceps en bronce (#5a3a18, #78350f) y codera protectora articulada en acero con remache central (#3a3f48, #6b7078, #fef08a).
 */
export const GUARDIAN_ARM_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="2" y="1" width="28" height="14" fill="#5a3a18"/><rect x="4" y="2" width="24" height="12" fill="#78350f"/><rect x="12" y="2" width="8" height="12" fill="#92400e"/><rect x="15" y="3" width="2" height="10" fill="#b45309"/><rect x="5" y="4" width="2" height="2" fill="#fef08a"/><rect x="25" y="4" width="2" height="2" fill="#fef08a"/><rect x="2" y="15" width="28" height="2" fill="#0c0a09"/><rect x="6" y="17" width="20" height="9" fill="#0c0a09"/><rect x="7" y="18" width="18" height="7" fill="#3a3f48"/><rect x="10" y="19" width="12" height="5" fill="#6b7078"/><rect x="14" y="20" width="4" height="3" fill="#fef08a"/><rect x="3" y="27" width="26" height="4" fill="#1c1917"/><rect x="6" y="27" width="20" height="4" fill="#475569"/>`;

export const GUARDIAN_ARM_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_ARM_BACK_BODY}</svg>`;

export function drawGuardianArmBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Placa dorsal de tríceps
  ctx.fillStyle = '#5a3a18';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 14 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 12 * s);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(12 * s, 2 * s, 8 * s, 12 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(15 * s, 3 * s, 2 * s, 10 * s);

  // Remaches superiores
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(5 * s, 4 * s, 2 * s, 2 * s);
  ctx.fillRect(25 * s, 4 * s, 2 * s, 2 * s);

  // Seam horizontal
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 15 * s, 28 * s, 2 * s);

  // Codera articulada central (couter)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(6 * s, 17 * s, 20 * s, 9 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(7 * s, 18 * s, 18 * s, 7 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(10 * s, 19 * s, 12 * s, 5 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(14 * s, 20 * s, 4 * s, 3 * s);

  // Base inferior del antebrazo
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(3 * s, 27 * s, 26 * s, 4 * s);
  ctx.fillStyle = '#475569';
  ctx.fillRect(6 * s, 27 * s, 20 * s, 4 * s);
}

/**
 * SVG canónico del Frente de la Pierna del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Muslo superior acorazado con quijote de bronce monolítico (#5a3a18, #78350f, #92400e) y remaches áureos (#b45309, #fef08a).
 * - Rodillera masiva de acero pesado (#3a3f48, #475569, #6b7078) con arista dorada central (#d97706, #fef08a).
 * - Greba de placas de acero con arista brillante (#94a3b8, #cbd5e1), sabatón acorazado con puntera reforzada y suela de tinta Sumi.
 */
export const GUARDIAN_LEG_FRONT_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="2" y="1" width="28" height="11" fill="#5a3a18"/><rect x="4" y="2" width="24" height="9" fill="#78350f"/><rect x="8" y="2" width="16" height="8" fill="#92400e"/><rect x="13" y="3" width="6" height="7" fill="#b45309"/><rect x="15" y="4" width="2" height="5" fill="#fef08a"/><rect x="5" y="3" width="2" height="2" fill="#fef08a"/><rect x="25" y="3" width="2" height="2" fill="#fef08a"/><rect x="5" y="8" width="2" height="2" fill="#fef08a"/><rect x="25" y="8" width="2" height="2" fill="#fef08a"/><rect x="2" y="12" width="28" height="8" fill="#0c0a09"/><rect x="3" y="13" width="26" height="6" fill="#3a3f48"/><rect x="5" y="13" width="22" height="6" fill="#475569"/><rect x="8" y="14" width="16" height="4" fill="#6b7078"/><rect x="13" y="13" width="6" height="6" fill="#0c0a09"/><rect x="14" y="14" width="4" height="4" fill="#d97706"/><rect x="15" y="15" width="2" height="2" fill="#fef08a"/><rect x="2" y="20" width="28" height="7" fill="#0c0a09"/><rect x="3" y="20" width="26" height="6" fill="#3a3f48"/><rect x="5" y="21" width="22" height="5" fill="#475569"/><rect x="8" y="21" width="16" height="4" fill="#6b7078"/><rect x="12" y="21" width="8" height="4" fill="#94a3b8"/><rect x="15" y="20" width="2" height="6" fill="#cbd5e1"/><rect x="2" y="22" width="28" height="2" fill="#0c0a09"/><rect x="3" y="22" width="26" height="1" fill="#1c1917"/><rect x="15" y="22" width="2" height="2" fill="#fef08a"/><rect x="1" y="27" width="30" height="5" fill="#0c0a09"/><rect x="2" y="27" width="28" height="4" fill="#3a3f48"/><rect x="4" y="28" width="24" height="2" fill="#6b7078"/><rect x="2" y="28" width="28" height="1" fill="#d97706"/><rect x="4" y="28" width="24" height="1" fill="#fef08a"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const GUARDIAN_LEG_FRONT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_LEG_FRONT_BODY}</svg>`;

export function drawGuardianLegFrontToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Quijote / Placa superior de muslo en bronce monolítico
  ctx.fillStyle = '#5a3a18';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 11 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 9 * s);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(8 * s, 2 * s, 16 * s, 8 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(13 * s, 3 * s, 6 * s, 7 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 4 * s, 2 * s, 5 * s);

  // Remaches áureos de fijación
  for (const y of [3, 8]) {
    ctx.fillRect(5 * s, y * s, 2 * s, 2 * s);
    ctx.fillRect(25 * s, y * s, 2 * s, 2 * s);
  }

  // 2. Rodillera masiva de acero articulada (poleyn)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 12 * s, 28 * s, 8 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(3 * s, 13 * s, 26 * s, 6 * s);
  ctx.fillStyle = '#475569';
  ctx.fillRect(5 * s, 13 * s, 22 * s, 6 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(8 * s, 14 * s, 16 * s, 4 * s);

  // Rombo central áureo en la rodilla
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(13 * s, 13 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(14 * s, 14 * s, 4 * s, 4 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 15 * s, 2 * s, 2 * s);

  // 3. Greba de placas de acero
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 20 * s, 28 * s, 7 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(3 * s, 20 * s, 26 * s, 6 * s);
  ctx.fillStyle = '#475569';
  ctx.fillRect(5 * s, 21 * s, 22 * s, 5 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(8 * s, 21 * s, 16 * s, 4 * s);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(12 * s, 21 * s, 8 * s, 4 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(15 * s, 20 * s, 2 * s, 6 * s);

  // Correa transversal de ajuste de la greba con remache áureo
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 22 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(3 * s, 22 * s, 26 * s, 1 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 22 * s, 2 * s, 2 * s);

  // 4. Sabatón laminado pesado con puntera reforzada y filo de oro
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 27 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(2 * s, 27 * s, 28 * s, 4 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(4 * s, 28 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(2 * s, 28 * s, 28 * s, 1 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(4 * s, 28 * s, 24 * s, 1 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 31 * s, 30 * s, 1 * s);
}

/**
 * SVG canónico del Costado Exterior de la Pierna del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Placas de quijote lateral de bronce (#78350f, #92400e) con correas pesadas y remaches (#44403c).
 * - Aleta protectora lateral de rodilla (fan-plate) en acero con ribete de bronce y oro.
 * - Caña de greba lateral con doble hebilla de acero y sabatón perfilado con suela Sumi.
 */
export const GUARDIAN_LEG_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="2" y="1" width="28" height="11" fill="#5a3a18"/><rect x="4" y="2" width="24" height="9" fill="#78350f"/><rect x="8" y="2" width="16" height="8" fill="#92400e"/><rect x="13" y="3" width="6" height="6" fill="#0c0a09"/><rect x="14" y="4" width="4" height="4" fill="#d97706"/><rect x="15" y="5" width="2" height="2" fill="#fef08a"/><rect x="5" y="3" width="2" height="7" fill="#44403c"/><rect x="25" y="3" width="2" height="7" fill="#44403c"/><rect x="2" y="12" width="28" height="8" fill="#0c0a09"/><rect x="3" y="13" width="26" height="6" fill="#3a3f48"/><rect x="5" y="13" width="22" height="6" fill="#475569"/><rect x="8" y="14" width="16" height="4" fill="#6b7078"/><rect x="3" y="15" width="26" height="2" fill="#0c0a09"/><rect x="4" y="15" width="24" height="1" fill="#d97706"/><rect x="2" y="20" width="28" height="7" fill="#0c0a09"/><rect x="3" y="20" width="26" height="6" fill="#3a3f48"/><rect x="5" y="21" width="22" height="5" fill="#475569"/><rect x="8" y="21" width="16" height="4" fill="#6b7078"/><rect x="2" y="22" width="28" height="3" fill="#0c0a09"/><rect x="3" y="23" width="26" height="1" fill="#1c1917"/><rect x="13" y="22" width="6" height="3" fill="#d97706"/><rect x="14" y="23" width="4" height="1" fill="#fef08a"/><rect x="1" y="27" width="30" height="5" fill="#0c0a09"/><rect x="2" y="27" width="28" height="4" fill="#3a3f48"/><rect x="4" y="28" width="24" height="2" fill="#6b7078"/><rect x="2" y="28" width="28" height="1" fill="#d97706"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const GUARDIAN_LEG_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_LEG_SIDE_BODY}</svg>`;

export function drawGuardianLegSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Quijote lateral de bronce monolítico
  ctx.fillStyle = '#5a3a18';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 11 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(4, 24), 2 * s, 24 * s, 9 * s);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(rx(8, 16), 2 * s, 16 * s, 8 * s);

  // Blasón romboidal de oro en el muslo
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(13, 6), 3 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(14, 4), 4 * s, 4 * s, 4 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(15, 2), 5 * s, 2 * s, 2 * s);

  // Remaches laterales oscuros
  ctx.fillStyle = '#44403c';
  ctx.fillRect(rx(5, 2), 3 * s, 2 * s, 7 * s);
  ctx.fillRect(rx(25, 2), 3 * s, 2 * s, 7 * s);

  // 2. Aleta lateral de rodillera (fan-plate)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 12 * s, 28 * s, 8 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(rx(3, 26), 13 * s, 26 * s, 6 * s);
  ctx.fillStyle = '#475569';
  ctx.fillRect(rx(5, 22), 13 * s, 22 * s, 6 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(rx(8, 16), 14 * s, 16 * s, 4 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(3, 26), 15 * s, 26 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(4, 24), 15 * s, 24 * s, 1 * s);

  // 3. Caña lateral de la greba con hebilla reforzada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 20 * s, 28 * s, 7 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(rx(3, 26), 20 * s, 26 * s, 6 * s);
  ctx.fillStyle = '#475569';
  ctx.fillRect(rx(5, 22), 21 * s, 22 * s, 5 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(rx(8, 16), 21 * s, 16 * s, 4 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 22 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(rx(3, 26), 23 * s, 26 * s, 1 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(13, 6), 22 * s, 6 * s, 3 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(14, 4), 23 * s, 4 * s, 1 * s);

  // 4. Sabatón lateral y suela Sumi
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 27 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(rx(2, 28), 27 * s, 28 * s, 4 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(rx(4, 24), 28 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(2, 28), 28 * s, 28 * s, 1 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 31), 31 * s, 30 * s, 1 * s);
}

/**
 * SVG canónico del Costado Interior de la Pierna del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Vista orientada a la entrepierna: penumbra acorazada (#1c1917, #292524), cuero protector de fricción y cota de malla densa (#3a3f48, #57534e).
 */
export const GUARDIAN_LEG_INNER_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="30" fill="#1c1917"/><rect x="2" y="1" width="28" height="29" fill="#292524"/><rect x="3" y="2" width="8" height="27" fill="#44403c"/><rect x="4" y="3" width="6" height="25" fill="#57534e"/><g fill="#3a3f48"><rect x="14" y="4" width="2" height="2"/><rect x="19" y="4" width="2" height="2"/><rect x="24" y="4" width="2" height="2"/><rect x="14" y="11" width="2" height="2"/><rect x="19" y="11" width="2" height="2"/><rect x="24" y="11" width="2" height="2"/><rect x="14" y="18" width="2" height="2"/><rect x="19" y="18" width="2" height="2"/><rect x="24" y="18" width="2" height="2"/><rect x="14" y="24" width="2" height="2"/><rect x="19" y="24" width="2" height="2"/><rect x="24" y="24" width="2" height="2"/></g><rect x="11" y="2" width="4" height="28" fill="#0c0a09"/><rect x="12" y="2" width="2" height="28" fill="#451a03"/><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="3" y="30" width="26" height="2" fill="#3a3f48"/>`;

export const GUARDIAN_LEG_INNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_LEG_INNER_BODY}</svg>`;

export function drawGuardianLegInnerToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Penumbra interior de coloso
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 30 * s);
  ctx.fillStyle = '#292524';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 29 * s);

  // Cuero acolchado de fricción
  ctx.fillStyle = '#44403c';
  ctx.fillRect(rx(3, 8), 2 * s, 8 * s, 27 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(rx(4, 6), 3 * s, 6 * s, 25 * s);

  // Eslabones de cota de malla interior
  ctx.fillStyle = '#3a3f48';
  for (const y of [4, 11, 18, 24]) {
    ctx.fillRect(rx(14, 2), y * s, 2 * s, 2 * s);
    ctx.fillRect(rx(19, 2), y * s, 2 * s, 2 * s);
    ctx.fillRect(rx(24, 2), y * s, 2 * s, 2 * s);
  }

  // Costura reforzada de cuero flexible
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(11, 4), 2 * s, 4 * s, 28 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(12, 2), 2 * s, 2 * s, 28 * s);

  // Remate inferior
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 29 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(rx(3, 26), 30 * s, 26 * s, 2 * s);
}

/**
 * SVG canónico de la Espalda de la Pierna del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Isquiotibial acolchado de cuero y bronce (#5a3a18, #78350f), hueco poplíteo con doble correa de blindaje (#1c1917, #fef08a), greba posterior maciza de acero y talonera reforzada.
 */
export const GUARDIAN_LEG_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="2" y="1" width="28" height="11" fill="#5a3a18"/><rect x="4" y="2" width="24" height="9" fill="#78350f"/><rect x="8" y="2" width="16" height="8" fill="#92400e"/><rect x="14" y="1" width="4" height="11" fill="#0c0a09"/><rect x="15" y="1" width="2" height="10" fill="#5a3a18"/><rect x="5" y="3" width="2" height="2" fill="#fef08a"/><rect x="25" y="3" width="2" height="2" fill="#fef08a"/><rect x="1" y="12" width="30" height="8" fill="#0c0a09"/><rect x="2" y="13" width="28" height="6" fill="#1c1917"/><rect x="2" y="14" width="28" height="2" fill="#292524"/><rect x="3" y="14" width="26" height="2" fill="#44403c"/><rect x="13" y="14" width="6" height="2" fill="#d97706"/><rect x="14" y="14" width="4" height="1" fill="#fef08a"/><rect x="2" y="17" width="28" height="2" fill="#292524"/><rect x="3" y="17" width="26" height="2" fill="#44403c"/><rect x="13" y="17" width="6" height="2" fill="#d97706"/><rect x="14" y="17" width="4" height="1" fill="#fef08a"/><rect x="2" y="20" width="28" height="8" fill="#0c0a09"/><rect x="3" y="20" width="26" height="7" fill="#3a3f48"/><rect x="5" y="21" width="22" height="5" fill="#475569"/><rect x="8" y="21" width="16" height="4" fill="#6b7078"/><rect x="14" y="20" width="4" height="7" fill="#0c0a09"/><rect x="15" y="20" width="2" height="7" fill="#94a3b8"/><rect x="1" y="28" width="30" height="4" fill="#0c0a09"/><rect x="2" y="28" width="28" height="3" fill="#3a3f48"/><rect x="4" y="29" width="24" height="2" fill="#6b7078"/><rect x="2" y="29" width="28" height="1" fill="#d97706"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const GUARDIAN_LEG_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_LEG_BACK_BODY}</svg>`;

export function drawGuardianLegBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Isquiotibial posterior acorazado
  ctx.fillStyle = '#5a3a18';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 11 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 9 * s);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(8 * s, 2 * s, 16 * s, 8 * s);

  // Costura central dorsal
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 1 * s, 4 * s, 11 * s);
  ctx.fillStyle = '#5a3a18';
  ctx.fillRect(15 * s, 1 * s, 2 * s, 10 * s);

  // Remaches superiores
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(5 * s, 3 * s, 2 * s, 2 * s);
  ctx.fillRect(25 * s, 3 * s, 2 * s, 2 * s);

  // 2. Hueco poplíteo con doble correa de ajuste y hebillas áureas
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 12 * s, 30 * s, 8 * s);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(2 * s, 13 * s, 28 * s, 6 * s);

  for (const y of [14, 17]) {
    ctx.fillStyle = '#292524';
    ctx.fillRect(2 * s, y * s, 28 * s, 2 * s);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(3 * s, y * s, 26 * s, 2 * s);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(13 * s, y * s, 6 * s, 2 * s);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(14 * s, y * s, 4 * s, 1 * s);
  }

  // 3. Greba posterior articulada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 20 * s, 28 * s, 8 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(3 * s, 20 * s, 26 * s, 7 * s);
  ctx.fillStyle = '#475569';
  ctx.fillRect(5 * s, 21 * s, 22 * s, 5 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(8 * s, 21 * s, 16 * s, 4 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 20 * s, 4 * s, 7 * s);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(15 * s, 20 * s, 2 * s, 7 * s);

  // 4. Talonera reforzada y suela
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 28 * s, 30 * s, 4 * s);
  ctx.fillStyle = '#3a3f48';
  ctx.fillRect(2 * s, 28 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#6b7078';
  ctx.fillRect(4 * s, 29 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(2 * s, 29 * s, 28 * s, 1 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 31 * s, 30 * s, 1 * s);
}

export const guardianPortrait = {
    id: 'guardian',
    icon: 'avatar_guardian',
    viewBox: '0 0 32 32',
    svg: GUARDIAN_PORTRAIT_SVG,
    body: GUARDIAN_PORTRAIT_BODY,
    sideSvg: GUARDIAN_SIDE_SVG,
    sideBody: GUARDIAN_SIDE_BODY,
    backSvg: GUARDIAN_BACK_SVG,
    backBody: GUARDIAN_BACK_BODY,
    chestSvg: GUARDIAN_CHEST_SVG,
    chestBody: GUARDIAN_CHEST_BODY,
    torsoSideSvg: GUARDIAN_TORSO_SIDE_SVG,
    torsoSideBody: GUARDIAN_TORSO_SIDE_BODY,
    torsoBackSvg: GUARDIAN_TORSO_BACK_SVG,
    torsoBackBody: GUARDIAN_TORSO_BACK_BODY,
    armFrontSvg: GUARDIAN_ARM_FRONT_SVG,
    armFrontBody: GUARDIAN_ARM_FRONT_BODY,
    armSideSvg: GUARDIAN_ARM_SIDE_SVG,
    armSideBody: GUARDIAN_ARM_SIDE_BODY,
    armInnerSvg: GUARDIAN_ARM_INNER_SVG,
    armInnerBody: GUARDIAN_ARM_INNER_BODY,
    armBackSvg: GUARDIAN_ARM_BACK_SVG,
    armBackBody: GUARDIAN_ARM_BACK_BODY,
    legFrontSvg: GUARDIAN_LEG_FRONT_SVG,
    legFrontBody: GUARDIAN_LEG_FRONT_BODY,
    legSideSvg: GUARDIAN_LEG_SIDE_SVG,
    legSideBody: GUARDIAN_LEG_SIDE_BODY,
    legInnerSvg: GUARDIAN_LEG_INNER_SVG,
    legInnerBody: GUARDIAN_LEG_INNER_BODY,
    legBackSvg: GUARDIAN_LEG_BACK_SVG,
    legBackBody: GUARDIAN_LEG_BACK_BODY,
    drawToCanvas: drawGuardianPortraitToCanvas,
    drawSideToCanvas: drawGuardianSideToCanvas,
    drawBackToCanvas: drawGuardianBackToCanvas,
    drawChestToCanvas: drawGuardianChestToCanvas,
    drawTorsoSideToCanvas: drawGuardianTorsoSideToCanvas,
    drawTorsoBackToCanvas: drawGuardianTorsoBackToCanvas,
    drawArmFrontToCanvas: drawGuardianArmFrontToCanvas,
    drawArmSideToCanvas: drawGuardianArmSideToCanvas,
    drawArmInnerToCanvas: drawGuardianArmInnerToCanvas,
    drawArmBackToCanvas: drawGuardianArmBackToCanvas,
    drawLegFrontToCanvas: drawGuardianLegFrontToCanvas,
    drawLegSideToCanvas: drawGuardianLegSideToCanvas,
    drawLegInnerToCanvas: drawGuardianLegInnerToCanvas,
    drawLegBackToCanvas: drawGuardianLegBackToCanvas,
};
