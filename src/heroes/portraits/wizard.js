// src/heroes/portraits/wizard.js
// Arte Sumi-e Pixel Art del heroe Wizard: datos SVG (canonicos, verificados por tests)
// y funciones de dibujo imperativo a canvas (usadas por las texturas 3D).
// Generado al trocear src/heroes/heroPortraits.js (Fase 6). Sin cambios de comportamiento.

/**
 * SVG canónico del Hechicero (Cabeza / Rostro / Retrato - 32x32) en estilo Sumi-e Pixel Art:
 * - Papel pergamino envejecido Washi (#d6cfc2) y contorno de tinta Sumi (#0c0a09).
 * - Sombra proyectada por el ala del sombrero con dithering en la frente (#1c1917, #57534e, #78716c).
 * - Runa arcano-amatista en el entrecejo (#581c87, #a855f7, #f3e8ff).
 * - Cejas pobladas canosas y ojos místicos con iris amatista (#6b21a8, #a855f7) y destello de sabiduría.
 * - Barba y bigote de sabio en gris piedra con surcos verticales (Kasure) que conectan con el pecho.
 */
export const WIZARD_PORTRAIT_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="1" width="30" height="3" fill="#1c1917"/><rect x="1" y="4" width="30" height="2" fill="#57534e"/><g fill="#78716c"><rect x="2" y="6" width="28" height="1"/><rect x="4" y="7" width="2" height="1"/><rect x="10" y="7" width="2" height="1"/><rect x="20" y="7" width="2" height="1"/><rect x="26" y="7" width="2" height="1"/></g><rect x="1" y="6" width="3" height="14" fill="#bfb6a6"/><rect x="28" y="6" width="3" height="14" fill="#a8a29e"/><rect x="9" y="8" width="14" height="1" fill="#a8a29e"/><rect x="15" y="7" width="2" height="5" fill="#581c87"/><rect x="14" y="9" width="4" height="1" fill="#581c87"/><rect x="15" y="8" width="2" height="3" fill="#a855f7"/><rect x="15" y="9" width="1" height="1" fill="#f3e8ff"/><g fill="#78716c"><rect x="1" y="6" width="3" height="12"/><rect x="28" y="6" width="3" height="12"/></g><g fill="#a8a29e"><rect x="2" y="8" width="2" height="10"/><rect x="28" y="8" width="2" height="10"/></g><g fill="#0c0a09"><rect x="5" y="10" width="8" height="2"/><rect x="19" y="10" width="8" height="2"/></g><g fill="#d6cfc2"><rect x="5" y="11" width="7" height="2"/><rect x="20" y="11" width="7" height="2"/><rect x="4" y="12" width="2" height="1"/><rect x="26" y="12" width="2" height="1"/></g><g fill="#ffffff"><rect x="6" y="11" width="4" height="1"/><rect x="22" y="11" width="4" height="1"/></g><rect x="6" y="13" width="5" height="5" fill="#0c0a09"/><rect x="21" y="13" width="5" height="5" fill="#0c0a09"/><rect x="7" y="14" width="4" height="4" fill="#f4efe4"/><rect x="21" y="14" width="4" height="4" fill="#f4efe4"/><rect x="8" y="14" width="3" height="4" fill="#6b21a8"/><rect x="22" y="14" width="3" height="4" fill="#6b21a8"/><rect x="8" y="15" width="2" height="3" fill="#a855f7"/><rect x="22" y="15" width="2" height="3" fill="#a855f7"/><rect x="7" y="14" width="2" height="2" fill="#ffffff"/><rect x="21" y="14" width="2" height="2" fill="#ffffff"/><rect x="7" y="18" width="4" height="1" fill="#a8a29e"/><rect x="21" y="18" width="4" height="1" fill="#a8a29e"/><rect x="15" y="15" width="2" height="4" fill="#bfb6a6"/><rect x="14" y="18" width="4" height="2" fill="#a8a29e"/><rect x="15" y="19" width="2" height="1" fill="#57534e"/><path d="M1,18 H5 V21 H9 V20 H13 V19 H19 V20 H23 V21 H27 V18 H31 V32 H1 Z" fill="#0c0a09"/><path d="M2,19 H4 V22 H8 V21 H24 V22 H28 V19 H30 V31 H2 Z" fill="#78716c"/><path d="M3,22 H7 V25 H5 V31 H27 V25 H25 V22 H29 V31 H3 Z" fill="#a8a29e"/><rect x="8" y="21" width="16" height="10" fill="#a8a29e"/><path d="M8,21 H14 V22 H18 V21 H24 V24 H26 V26 H22 V24 H18 V23 H14 V24 H10 V26 H6 V24 H8 Z" fill="#d6cfc2"/><rect x="10" y="21" width="4" height="1" fill="#ffffff"/><rect x="18" y="21" width="4" height="1" fill="#ffffff"/><rect x="13" y="23" width="6" height="2" fill="#1c1917"/><rect x="14" y="24" width="4" height="1" fill="#450a0a"/><g fill="#44403c"><rect x="6" y="27" width="1" height="4"/><rect x="11" y="25" width="1" height="6"/><rect x="15" y="26" width="2" height="5"/><rect x="20" y="25" width="1" height="6"/><rect x="25" y="27" width="1" height="4"/></g><g fill="#d6cfc2"><rect x="8" y="26" width="2" height="5"/><rect x="13" y="26" width="2" height="5"/><rect x="17" y="26" width="2" height="5"/><rect x="22" y="26" width="2" height="5"/></g>`;

export const WIZARD_PORTRAIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_PORTRAIT_BODY}</svg>`;

/**
 * SVG canónico del Torso / Pecho del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Túnica arcana morada (#581c87, #6b21a8) con pliegues iluminados (#7e22ce, #4c1d95).
 * - Estola rúnica bordada en oro (#b45309, #f59e0b).
 * - Cinturón de cuero y grimorio carmesí con gema amatista (#78350f, #a855f7).
 * - Continuación fluida de la barba larga que empata exactamente con los surcos y mechones de la cabeza.
 */
export const WIZARD_CHEST_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#581c87"/><rect x="2" y="1" width="28" height="24" fill="#6b21a8"/><path d="M2,1 H8 V3 H4 V24 H2 Z" fill="#7e22ce"/><path d="M24,1 H30 V24 H28 V3 H24 Z" fill="#4c1d95"/><rect x="5" y="1" width="2" height="25" fill="#b45309"/><rect x="25" y="1" width="2" height="25" fill="#b45309"/><rect x="6" y="1" width="1" height="25" fill="#f59e0b"/><rect x="25" y="1" width="1" height="25" fill="#f59e0b"/><rect x="1" y="26" width="30" height="5" fill="#292524"/><rect x="1" y="26" width="30" height="1" fill="#0c0a09"/><rect x="12" y="26" width="8" height="5" fill="#78350f"/><rect x="13" y="27" width="6" height="3" fill="#a855f7"/><path d="M6,0 H26 V16 H23 V21 H19 V24 H13 V21 H9 V16 H6 Z" fill="#0c0a09"/><path d="M7,0 H25 V15 H22 V20 H18 V23 H14 V20 H10 V15 H7 Z" fill="#a8a29e"/><g fill="#d6cfc2"><rect x="8" y="0" width="2" height="14"/><rect x="13" y="0" width="2" height="19"/><rect x="17" y="0" width="2" height="19"/><rect x="22" y="0" width="2" height="14"/><rect x="15" y="18" width="2" height="4"/></g><g fill="#44403c"><rect x="11" y="0" width="1" height="17"/><rect x="15" y="0" width="2" height="16"/><rect x="20" y="0" width="1" height="17"/></g>`;

export const WIZARD_CHEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_CHEST_BODY}</svg>`;

/**
 * Renderizado procedural síncrono píxel a píxel del Rostro del Hechicero sobre Canvas 2D.
 */
export function drawWizardHeadToCanvas(ctx, size = 32) {
  const s = size / 32;

  // Fondo Washi
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(0, 0, size, size);

  // Marco tinta
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  // Sombra ala sombrero
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(1 * s, 4 * s, 30 * s, 2 * s);

  // Dithering sombra
  ctx.fillStyle = '#78716c';
  ctx.fillRect(2 * s, 6 * s, 28 * s, 1 * s);
  ctx.fillRect(4 * s, 7 * s, 2 * s, 1 * s);
  ctx.fillRect(10 * s, 7 * s, 2 * s, 1 * s);
  ctx.fillRect(20 * s, 7 * s, 2 * s, 1 * s);
  ctx.fillRect(26 * s, 7 * s, 2 * s, 1 * s);

  // Sombras y pómulos
  ctx.fillStyle = '#bfb6a6';
  ctx.fillRect(1 * s, 6 * s, 3 * s, 14 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(28 * s, 6 * s, 3 * s, 14 * s);
  ctx.fillRect(9 * s, 8 * s, 14 * s, 1 * s);

  // Runa amatista en el entrecejo
  ctx.fillStyle = '#581c87';
  ctx.fillRect(15 * s, 7 * s, 2 * s, 5 * s);
  ctx.fillRect(14 * s, 9 * s, 4 * s, 1 * s);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(15 * s, 8 * s, 2 * s, 3 * s);
  ctx.fillStyle = '#f3e8ff';
  ctx.fillRect(15 * s, 9 * s, 1 * s, 1 * s);

  // Patillas
  ctx.fillStyle = '#78716c';
  ctx.fillRect(1 * s, 6 * s, 3 * s, 12 * s);
  ctx.fillRect(28 * s, 6 * s, 3 * s, 12 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(2 * s, 8 * s, 2 * s, 10 * s);
  ctx.fillRect(28 * s, 8 * s, 2 * s, 10 * s);

  // Cejas canosas pobladas
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(5 * s, 10 * s, 8 * s, 2 * s);
  ctx.fillRect(19 * s, 10 * s, 8 * s, 2 * s);
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(5 * s, 11 * s, 7 * s, 2 * s);
  ctx.fillRect(20 * s, 11 * s, 7 * s, 2 * s);
  ctx.fillRect(4 * s, 12 * s, 2 * s, 1 * s);
  ctx.fillRect(26 * s, 12 * s, 2 * s, 1 * s);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(6 * s, 11 * s, 4 * s, 1 * s);
  ctx.fillRect(22 * s, 11 * s, 4 * s, 1 * s);

  // Ojos místicos
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(6 * s, 13 * s, 5 * s, 5 * s);
  ctx.fillRect(21 * s, 13 * s, 5 * s, 5 * s);
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(7 * s, 14 * s, 4 * s, 4 * s);
  ctx.fillRect(21 * s, 14 * s, 4 * s, 4 * s);
  ctx.fillStyle = '#6b21a8';
  ctx.fillRect(8 * s, 14 * s, 3 * s, 4 * s);
  ctx.fillRect(22 * s, 14 * s, 3 * s, 4 * s);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(8 * s, 15 * s, 2 * s, 3 * s);
  ctx.fillRect(22 * s, 15 * s, 2 * s, 3 * s);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7 * s, 14 * s, 2 * s, 2 * s);
  ctx.fillRect(21 * s, 14 * s, 2 * s, 2 * s);

  // Nariz
  ctx.fillStyle = '#bfb6a6';
  ctx.fillRect(15 * s, 15 * s, 2 * s, 4 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(14 * s, 18 * s, 4 * s, 2 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(15 * s, 19 * s, 2 * s, 1 * s);

  // Barba y bigote
  ctx.fillStyle = '#78716c';
  ctx.fillRect(2 * s, 19 * s, 28 * s, 12 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(3 * s, 22 * s, 26 * s, 9 * s);

  // Bigote
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(8 * s, 21 * s, 16 * s, 3 * s);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(10 * s, 21 * s, 4 * s, 1 * s);
  ctx.fillRect(18 * s, 21 * s, 4 * s, 1 * s);

  // Boca entreabierta
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(13 * s, 23 * s, 6 * s, 2 * s);
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(14 * s, 24 * s, 4 * s, 1 * s);

  // Surcos verticales de barba (Kasure)
  ctx.fillStyle = '#44403c';
  ctx.fillRect(6 * s, 27 * s, 1 * s, 4 * s);
  ctx.fillRect(11 * s, 25 * s, 1 * s, 6 * s);
  ctx.fillRect(15 * s, 26 * s, 2 * s, 5 * s);
  ctx.fillRect(20 * s, 25 * s, 1 * s, 6 * s);
  ctx.fillRect(25 * s, 27 * s, 1 * s, 4 * s);

  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(8 * s, 26 * s, 2 * s, 5 * s);
  ctx.fillRect(13 * s, 26 * s, 2 * s, 5 * s);
  ctx.fillRect(17 * s, 26 * s, 2 * s, 5 * s);
  ctx.fillRect(22 * s, 26 * s, 2 * s, 5 * s);
}

/**
 * Renderizado procedural síncrono píxel a píxel del Pecho del Hechicero sobre Canvas 2D.
 */
export function drawWizardChestToCanvas(ctx, size = 32) {
  const s = size / 32;

  // Fondo tinta
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Túnica morada
  ctx.fillStyle = '#581c87';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#6b21a8';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 24 * s);

  // Pliegues iluminados
  ctx.fillStyle = '#7e22ce';
  ctx.fillRect(2 * s, 1 * s, 6 * s, 23 * s);
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(24 * s, 1 * s, 6 * s, 23 * s);

  // Estola rúnica dorada
  ctx.fillStyle = '#b45309';
  ctx.fillRect(5 * s, 1 * s, 2 * s, 25 * s);
  ctx.fillRect(25 * s, 1 * s, 2 * s, 25 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(6 * s, 1 * s, 1 * s, 25 * s);
  ctx.fillRect(25 * s, 1 * s, 1 * s, 25 * s);

  // Cinturón de cuero
  ctx.fillStyle = '#292524';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 1 * s);

  // Grimorio
  ctx.fillStyle = '#78350f';
  ctx.fillRect(12 * s, 26 * s, 8 * s, 5 * s);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(13 * s, 27 * s, 6 * s, 3 * s);

  // Masa de la barba sobre el pecho
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(6 * s, 0, 20 * s, 16 * s);
  ctx.fillRect(9 * s, 16 * s, 14 * s, 5 * s);
  ctx.fillRect(13 * s, 21 * s, 6 * s, 3 * s);

  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(7 * s, 0, 18 * s, 15 * s);
  ctx.fillRect(10 * s, 15 * s, 12 * s, 5 * s);
  ctx.fillRect(14 * s, 20 * s, 4 * s, 3 * s);

  // Mechones iluminados
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(8 * s, 0, 2 * s, 14 * s);
  ctx.fillRect(13 * s, 0, 2 * s, 19 * s);
  ctx.fillRect(17 * s, 0, 2 * s, 19 * s);
  ctx.fillRect(22 * s, 0, 2 * s, 14 * s);
  ctx.fillRect(15 * s, 18 * s, 2 * s, 4 * s);

  // Surcos oscuros
  ctx.fillStyle = '#44403c';
  ctx.fillRect(11 * s, 0, 1 * s, 17 * s);
  ctx.fillRect(15 * s, 0, 2 * s, 16 * s);
  ctx.fillRect(20 * s, 0, 1 * s, 17 * s);
}

/**
 * SVG canónico del Perfil Lateral de la Cabeza del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Sombra superior proyectada por el ala del sombrero (#1c1917, #57534e, #78716c) en y=1..6.
 * - Patilla y perfil de barba canosa que conecta en x=1..12 con el frente (#78716c, #a8a29e, #d6cfc2).
 * - Oreja estilizada Sumi-e entre mechones plateados y cabellera larga hacia la nuca con trazos Kasure (#44403c) y cuello de túnica arcana (#581c87, #f59e0b).
 */
export const WIZARD_SIDE_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="1" width="30" height="3" fill="#1c1917"/><rect x="1" y="4" width="30" height="2" fill="#57534e"/><rect x="1" y="6" width="30" height="1" fill="#78716c"/><rect x="1" y="7" width="3" height="12" fill="#78716c"/><rect x="2" y="8" width="2" height="10" fill="#a8a29e"/><rect x="1" y="19" width="14" height="12" fill="#78716c"/><rect x="2" y="21" width="13" height="10" fill="#a8a29e"/><rect x="4" y="23" width="8" height="8" fill="#d6cfc2"/><rect x="14" y="7" width="17" height="20" fill="#78716c"/><rect x="16" y="8" width="14" height="18" fill="#a8a29e"/><g fill="#d6cfc2"><rect x="18" y="9" width="3" height="16"/><rect x="24" y="9" width="3" height="16"/></g><g fill="#44403c"><rect x="7" y="25" width="1" height="6"/><rect x="16" y="10" width="1" height="15"/><rect x="22" y="9" width="1" height="16"/><rect x="28" y="10" width="1" height="15"/></g><rect x="10" y="13" width="6" height="7" fill="#0c0a09"/><rect x="11" y="14" width="4" height="5" fill="#d6cfc2"/><rect x="12" y="15" width="2" height="3" fill="#78716c"/><rect x="14" y="26" width="17" height="5" fill="#0c0a09"/><rect x="15" y="27" width="15" height="4" fill="#581c87"/><rect x="16" y="27" width="13" height="1" fill="#f59e0b"/>`;

export const WIZARD_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_SIDE_BODY}</svg>`;

export function drawWizardSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  // Sombra proyectada por el ala del sombrero (y=1..6)
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(rx(1, 30), 4 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(1, 30), 6 * s, 30 * s, 1 * s);

  // Patilla y perfil de barba frontal (x=1..14)
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(1, 3), 7 * s, 3 * s, 12 * s);
  ctx.fillRect(rx(1, 14), 19 * s, 14 * s, 12 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(rx(2, 2), 8 * s, 2 * s, 10 * s);
  ctx.fillRect(rx(2, 13), 21 * s, 13 * s, 10 * s);
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(rx(4, 8), 23 * s, 8 * s, 8 * s);

  // Cabellera larga de sabio hacia la nuca (x=14..30, y=7..26)
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(14, 17), 7 * s, 17 * s, 20 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(rx(16, 14), 8 * s, 14 * s, 18 * s);
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(rx(18, 3), 9 * s, 3 * s, 16 * s);
  ctx.fillRect(rx(24, 3), 9 * s, 3 * s, 16 * s);

  // Surcos Kasure en barba y melena
  ctx.fillStyle = '#44403c';
  ctx.fillRect(rx(7, 1), 25 * s, 1 * s, 6 * s);
  ctx.fillRect(rx(16, 1), 10 * s, 1 * s, 15 * s);
  ctx.fillRect(rx(22, 1), 9 * s, 1 * s, 16 * s);
  ctx.fillRect(rx(28, 1), 10 * s, 1 * s, 15 * s);

  // Oreja estilizada Sumi-e asomando entre los mechones (x=10..15, y=13..19)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(10, 6), 13 * s, 6 * s, 7 * s);
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(rx(11, 4), 14 * s, 4 * s, 5 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(12, 2), 15 * s, 2 * s, 3 * s);

  // Cuello posterior de la túnica arcana con ribete dorado (x=14..30, y=26..30)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(14, 17), 26 * s, 17 * s, 5 * s);
  ctx.fillStyle = '#581c87';
  ctx.fillRect(rx(15, 15), 27 * s, 15 * s, 4 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(rx(16, 13), 27 * s, 13 * s, 1 * s);
}

/**
 * SVG canónico de la Nuca / Parte Trasera de la Cabeza del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Sombra bajo el ala del sombrero (#1c1917, #57534e) y cabellera larga canosa (#78716c, #a8a29e, #d6cfc2) con surcos Kasure (#44403c).
 * - Cordón/diadema arcana amatista y oro (#581c87, #a855f7, #f59e0b) y cuello de túnica morada con estola dorada en la base.
 */
export const WIZARD_BACK_BODY = `<rect width="32" height="32" fill="#78716c"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="1" width="30" height="3" fill="#1c1917"/><rect x="1" y="4" width="30" height="2" fill="#57534e"/><rect x="2" y="6" width="28" height="20" fill="#a8a29e"/><g fill="#d6cfc2"><rect x="4" y="7" width="3" height="18"/><rect x="10" y="7" width="3" height="18"/><rect x="19" y="7" width="3" height="18"/><rect x="25" y="7" width="3" height="18"/></g><g fill="#44403c"><rect x="8" y="7" width="1" height="18"/><rect x="15" y="7" width="2" height="18"/><rect x="23" y="7" width="1" height="18"/></g><rect x="2" y="9" width="28" height="3" fill="#0c0a09"/><rect x="3" y="10" width="26" height="1" fill="#581c87"/><rect x="13" y="9" width="6" height="3" fill="#f59e0b"/><rect x="14" y="10" width="4" height="1" fill="#a855f7"/><rect x="1" y="26" width="30" height="5" fill="#0c0a09"/><rect x="2" y="27" width="28" height="4" fill="#581c87"/><rect x="3" y="27" width="26" height="1" fill="#f59e0b"/>`;

export const WIZARD_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_BACK_BODY}</svg>`;

export function drawWizardBackToCanvas(ctx, size = 32) {
  const s = size / 32;

  ctx.fillStyle = '#78716c';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  ctx.fillStyle = '#1c1917';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(1 * s, 4 * s, 30 * s, 2 * s);

  // Cabellera trasera canosa con mechones iluminados y surcos Kasure
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(2 * s, 6 * s, 28 * s, 20 * s);
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(4 * s, 7 * s, 3 * s, 18 * s);
  ctx.fillRect(10 * s, 7 * s, 3 * s, 18 * s);
  ctx.fillRect(19 * s, 7 * s, 3 * s, 18 * s);
  ctx.fillRect(25 * s, 7 * s, 3 * s, 18 * s);

  ctx.fillStyle = '#44403c';
  ctx.fillRect(8 * s, 7 * s, 1 * s, 18 * s);
  ctx.fillRect(15 * s, 7 * s, 2 * s, 18 * s);
  ctx.fillRect(23 * s, 7 * s, 1 * s, 18 * s);

  // Cordón / broche rúnico trasero
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 9 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#581c87';
  ctx.fillRect(3 * s, 10 * s, 26 * s, 1 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(13 * s, 9 * s, 6 * s, 3 * s);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(14 * s, 10 * s, 4 * s, 1 * s);

  // Cuello posterior de la túnica arcana
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#581c87';
  ctx.fillRect(2 * s, 27 * s, 28 * s, 4 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(3 * s, 27 * s, 26 * s, 1 * s);
}

/**
 * SVG canónico del Costado Lateral del Torso del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Pliegues laterales de la túnica arcana morada (#4c1d95, #581c87, #6b21a8, #7e22ce) con costura dorada (#b45309, #f59e0b) y cinturón con presilla del grimorio.
 */
export const WIZARD_TORSO_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#581c87"/><rect x="2" y="1" width="28" height="24" fill="#6b21a8"/><rect x="2" y="1" width="7" height="24" fill="#7e22ce"/><rect x="23" y="1" width="7" height="24" fill="#4c1d95"/><rect x="14" y="1" width="4" height="25" fill="#0c0a09"/><rect x="15" y="1" width="2" height="25" fill="#b45309"/><rect x="15" y="1" width="1" height="25" fill="#f59e0b"/><rect x="1" y="26" width="30" height="5" fill="#292524"/><rect x="12" y="26" width="8" height="5" fill="#78350f"/><rect x="14" y="27" width="4" height="3" fill="#a855f7"/>`;

export const WIZARD_TORSO_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_TORSO_SIDE_BODY}</svg>`;

export function drawWizardTorsoSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#581c87';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#6b21a8';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 24 * s);
  ctx.fillStyle = '#7e22ce';
  ctx.fillRect(rx(2, 7), 1 * s, 7 * s, 24 * s);
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(rx(23, 7), 1 * s, 7 * s, 24 * s);

  // Costura rúnica dorada en el costado
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(14, 4), 1 * s, 4 * s, 25 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(rx(15, 2), 1 * s, 2 * s, 25 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(rx(15, 1), 1 * s, 1 * s, 25 * s);

  // Cinturón lateral y correa del grimorio
  ctx.fillStyle = '#292524';
  ctx.fillRect(rx(1, 30), 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(12, 8), 26 * s, 8 * s, 5 * s);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(rx(14, 4), 27 * s, 4 * s, 3 * s);
}

/**
 * SVG canónico de la Espalda del Torso del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Túnica arcana morada con estola dorada dorsal y gran sello / círculo rúnico amatista (#a855f7, #f3e8ff) bordado en el centro.
 */
export const WIZARD_TORSO_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#581c87"/><rect x="2" y="1" width="28" height="24" fill="#6b21a8"/><rect x="2" y="1" width="5" height="24" fill="#4c1d95"/><rect x="25" y="1" width="5" height="24" fill="#4c1d95"/><rect x="6" y="1" width="2" height="25" fill="#b45309"/><rect x="24" y="1" width="2" height="25" fill="#b45309"/><rect x="7" y="1" width="1" height="25" fill="#f59e0b"/><rect x="24" y="1" width="1" height="25" fill="#f59e0b"/><rect x="10" y="6" width="12" height="12" fill="#0c0a09"/><rect x="11" y="7" width="10" height="10" fill="#b45309"/><rect x="12" y="8" width="8" height="8" fill="#581c87"/><rect x="13" y="9" width="6" height="6" fill="#a855f7"/><rect x="15" y="11" width="2" height="2" fill="#f3e8ff"/><rect x="1" y="26" width="30" height="5" fill="#292524"/><rect x="13" y="26" width="6" height="5" fill="#b45309"/>`;

export const WIZARD_TORSO_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_TORSO_BACK_BODY}</svg>`;

export function drawWizardTorsoBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#581c87';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#6b21a8';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 24 * s);
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(2 * s, 1 * s, 5 * s, 24 * s);
  ctx.fillRect(25 * s, 1 * s, 5 * s, 24 * s);

  // Estola rúnica dorada trasera
  ctx.fillStyle = '#b45309';
  ctx.fillRect(6 * s, 1 * s, 2 * s, 25 * s);
  ctx.fillRect(24 * s, 1 * s, 2 * s, 25 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(7 * s, 1 * s, 1 * s, 25 * s);
  ctx.fillRect(24 * s, 1 * s, 1 * s, 25 * s);

  // Gran sello arcano amatista bordado en la espalda
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(10 * s, 6 * s, 12 * s, 12 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(11 * s, 7 * s, 10 * s, 10 * s);
  ctx.fillStyle = '#581c87';
  ctx.fillRect(12 * s, 8 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(13 * s, 9 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#f3e8ff';
  ctx.fillRect(15 * s, 11 * s, 2 * s, 2 * s);

  // Cinturón trasero
  ctx.fillStyle = '#292524';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(13 * s, 26 * s, 6 * s, 5 * s);
}

/**
 * SVG canónico del Frente del Brazo del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Manga amplia de túnica arcana violeta (#581c87, #6b21a8, #7e22ce) con estola rúnica dorada central (#b45309, #f59e0b, #fef08a) y bocamanga ancha con bordado de oro.
 */
export const WIZARD_ARM_FRONT_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="24" fill="#581c87"/><rect x="2" y="1" width="28" height="23" fill="#6b21a8"/><rect x="2" y="2" width="4" height="22" fill="#4c1d95"/><rect x="26" y="2" width="4" height="22" fill="#4c1d95"/><rect x="5" y="2" width="3" height="22" fill="#7e22ce"/><rect x="24" y="2" width="3" height="22" fill="#7e22ce"/><rect x="12" y="1" width="8" height="24" fill="#0c0a09"/><rect x="13" y="2" width="6" height="23" fill="#b45309"/><rect x="14" y="2" width="4" height="23" fill="#f59e0b"/><rect x="15" y="4" width="2" height="3" fill="#fef08a"/><rect x="15" y="11" width="2" height="3" fill="#f3e8ff"/><rect x="15" y="18" width="2" height="3" fill="#fef08a"/><rect x="1" y="25" width="30" height="4" fill="#0c0a09"/><rect x="1" y="25" width="30" height="3" fill="#b45309"/><rect x="2" y="26" width="28" height="2" fill="#f59e0b"/><rect x="3" y="26" width="26" height="1" fill="#fef08a"/><rect x="2" y="28" width="28" height="3" fill="#2e1065"/><rect x="6" y="29" width="20" height="2" fill="#0c0a09"/>`;

export const WIZARD_ARM_FRONT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_ARM_FRONT_BODY}</svg>`;

export function drawWizardArmFrontToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Cuerpo de la manga de la túnica violeta
  ctx.fillStyle = '#581c87';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 24 * s);
  ctx.fillStyle = '#6b21a8';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 23 * s);

  // Pliegues de sombra y luz en los costados de la tela
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(2 * s, 2 * s, 4 * s, 22 * s);
  ctx.fillRect(26 * s, 2 * s, 4 * s, 22 * s);
  ctx.fillStyle = '#7e22ce';
  ctx.fillRect(5 * s, 2 * s, 3 * s, 22 * s);
  ctx.fillRect(24 * s, 2 * s, 3 * s, 22 * s);

  // 2. Estola rúnica dorada central que desciende por la manga
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(12 * s, 1 * s, 8 * s, 24 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(13 * s, 2 * s, 6 * s, 23 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(14 * s, 2 * s, 4 * s, 23 * s);

  // Glifos / runas mágicas bordadas en oro y amatista
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 4 * s, 2 * s, 3 * s);
  ctx.fillStyle = '#f3e8ff';
  ctx.fillRect(15 * s, 11 * s, 2 * s, 3 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 18 * s, 2 * s, 3 * s);

  // 3. Bocamanga ancha con ribete de oro y boca interior oscura
  ctx.fillStyle = '#b45309';
  ctx.fillRect(1 * s, 25 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(2 * s, 26 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(3 * s, 26 * s, 26 * s, 1 * s);

  ctx.fillStyle = '#2e1065';
  ctx.fillRect(2 * s, 28 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(6 * s, 29 * s, 20 * s, 2 * s);
}

/**
 * SVG canónico del Costado Exterior del Brazo del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Manga amplia con gran sello arcano bordado en el hombro (#a855f7, #f3e8ff), pliegues ondulantes y bocamanga acampanada.
 */
export const WIZARD_ARM_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="24" fill="#581c87"/><rect x="2" y="1" width="28" height="23" fill="#6b21a8"/><rect x="2" y="2" width="6" height="22" fill="#4c1d95"/><rect x="24" y="2" width="6" height="22" fill="#7e22ce"/><rect x="11" y="3" width="10" height="10" fill="#0c0a09"/><rect x="12" y="4" width="8" height="8" fill="#b45309"/><rect x="13" y="5" width="6" height="6" fill="#581c87"/><rect x="14" y="6" width="4" height="4" fill="#a855f7"/><rect x="15" y="7" width="2" height="2" fill="#f3e8ff"/><rect x="14" y="13" width="4" height="11" fill="#4c1d95"/><rect x="15" y="14" width="2" height="10" fill="#7e22ce"/><rect x="1" y="25" width="30" height="4" fill="#0c0a09"/><rect x="1" y="25" width="30" height="3" fill="#b45309"/><rect x="2" y="26" width="28" height="2" fill="#f59e0b"/><rect x="4" y="26" width="24" height="1" fill="#fef08a"/><rect x="2" y="28" width="28" height="3" fill="#2e1065"/>`;

export const WIZARD_ARM_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_ARM_SIDE_BODY}</svg>`;

export function drawWizardArmSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Manga amplia exterior
  ctx.fillStyle = '#581c87';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 24 * s);
  ctx.fillStyle = '#6b21a8';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 23 * s);

  // Pliegues laterales
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(rx(2, 6), 2 * s, 6 * s, 22 * s);
  ctx.fillStyle = '#7e22ce';
  ctx.fillRect(rx(24, 6), 2 * s, 6 * s, 22 * s);

  // Sello arcano de la escuela de magia en la parte superior del brazo
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(11, 10), 3 * s, 10 * s, 10 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(rx(12, 8), 4 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#581c87';
  ctx.fillRect(rx(13, 6), 5 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(rx(14, 4), 6 * s, 4 * s, 4 * s);
  ctx.fillStyle = '#f3e8ff';
  ctx.fillRect(rx(15, 2), 7 * s, 2 * s, 2 * s);

  // Caída vertical de pliegue bajo el sello
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(rx(14, 4), 13 * s, 4 * s, 11 * s);
  ctx.fillStyle = '#7e22ce';
  ctx.fillRect(rx(15, 2), 14 * s, 2 * s, 10 * s);

  // Bocamanga acampanada con ribete dorado
  ctx.fillStyle = '#b45309';
  ctx.fillRect(rx(1, 30), 25 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(rx(2, 28), 26 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(4, 24), 26 * s, 24 * s, 1 * s);

  ctx.fillStyle = '#2e1065';
  ctx.fillRect(rx(2, 28), 28 * s, 28 * s, 3 * s);
}

/**
 * SVG canónico del Costado Interior del Brazo del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Vista orientada al torso: pliegues en penumbra índigo (#2e1065, #3b1078, #4c1d95) y ribete dorado en la bocamanga interior.
 */
export const WIZARD_ARM_INNER_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="24" fill="#3b1078"/><rect x="2" y="1" width="28" height="23" fill="#2e1065"/><rect x="4" y="2" width="8" height="22" fill="#4c1d95"/><rect x="20" y="2" width="8" height="22" fill="#1e1b4b"/><rect x="14" y="2" width="4" height="22" fill="#0c0a09"/><rect x="1" y="25" width="30" height="4" fill="#0c0a09"/><rect x="2" y="25" width="28" height="3" fill="#b45309"/><rect x="3" y="26" width="26" height="2" fill="#f59e0b"/><rect x="2" y="28" width="28" height="3" fill="#0c0a09"/>`;

export const WIZARD_ARM_INNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_ARM_INNER_BODY}</svg>`;

export function drawWizardArmInnerToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Penumbra de la manga interior hacia el torso
  ctx.fillStyle = '#3b1078';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 24 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 23 * s);

  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(rx(4, 8), 2 * s, 8 * s, 22 * s);
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(rx(20, 8), 2 * s, 8 * s, 22 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(14, 4), 2 * s, 4 * s, 22 * s);

  // Ribete dorado inferior
  ctx.fillStyle = '#b45309';
  ctx.fillRect(rx(2, 28), 25 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(rx(3, 26), 26 * s, 26 * s, 2 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 28 * s, 28 * s, 3 * s);
}

/**
 * SVG canónico de la Espalda del Brazo del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Caída dorsal de la manga con pliegues pesados en el codo (#4c1d95, #6b21a8) y franja rúnica dorada en el puño.
 */
export const WIZARD_ARM_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="24" fill="#581c87"/><rect x="2" y="1" width="28" height="23" fill="#6b21a8"/><rect x="2" y="2" width="6" height="22" fill="#4c1d95"/><rect x="24" y="2" width="6" height="22" fill="#4c1d95"/><rect x="12" y="2" width="8" height="22" fill="#7e22ce"/><rect x="14" y="3" width="4" height="20" fill="#a855f7"/><rect x="10" y="14" width="12" height="4" fill="#0c0a09"/><rect x="11" y="15" width="10" height="2" fill="#4c1d95"/><rect x="1" y="25" width="30" height="4" fill="#0c0a09"/><rect x="1" y="25" width="30" height="3" fill="#b45309"/><rect x="2" y="26" width="28" height="2" fill="#f59e0b"/><rect x="5" y="26" width="22" height="1" fill="#fef08a"/><rect x="2" y="28" width="28" height="3" fill="#2e1065"/>`;

export const WIZARD_ARM_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_ARM_BACK_BODY}</svg>`;

export function drawWizardArmBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Tela dorsal de la manga
  ctx.fillStyle = '#581c87';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 24 * s);
  ctx.fillStyle = '#6b21a8';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 23 * s);

  // Pliegues y sombras laterales
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(2 * s, 2 * s, 6 * s, 22 * s);
  ctx.fillRect(24 * s, 2 * s, 6 * s, 22 * s);

  // Nervadura de luz central
  ctx.fillStyle = '#7e22ce';
  ctx.fillRect(12 * s, 2 * s, 8 * s, 22 * s);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(14 * s, 3 * s, 4 * s, 20 * s);

  // Pliegue transversal del codo
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(10 * s, 14 * s, 12 * s, 4 * s);
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(11 * s, 15 * s, 10 * s, 2 * s);

  // Bocamanga dorsal con cinta dorada
  ctx.fillStyle = '#b45309';
  ctx.fillRect(1 * s, 25 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(2 * s, 26 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(5 * s, 26 * s, 22 * s, 1 * s);

  ctx.fillStyle = '#2e1065';
  ctx.fillRect(2 * s, 28 * s, 28 * s, 3 * s);
}

/**
 * SVG canónico del Frente de la Pierna del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Caída frontal de la falda talar en violeta místico (#2e1065, #3b1078, #4c1d95) con estola rúnica vertical en oro y amatista (#d4af37, #fef08a, #c084fc), cenefa dorada inferior y botines de terciopelo nocturno.
 */
export const WIZARD_LEG_FRONT_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="20" fill="#1e1b4b"/><rect x="2" y="1" width="28" height="19" fill="#2e1065"/><rect x="4" y="2" width="24" height="17" fill="#3b1078"/><rect x="6" y="2" width="20" height="17" fill="#4c1d95"/><rect x="12" y="1" width="8" height="19" fill="#0c0a09"/><rect x="13" y="2" width="6" height="17" fill="#2e1065"/><rect x="14" y="2" width="4" height="17" fill="#5b21b6"/><g fill="#fef08a"><rect x="15" y="4" width="2" height="2"/><rect x="15" y="9" width="2" height="2"/><rect x="15" y="14" width="2" height="2"/></g><g fill="#c084fc"><rect x="14" y="5" width="4" height="1"/><rect x="14" y="10" width="4" height="1"/><rect x="14" y="15" width="4" height="1"/></g><rect x="1" y="21" width="30" height="6" fill="#0c0a09"/><rect x="2" y="21" width="28" height="5" fill="#2e1065"/><rect x="3" y="22" width="26" height="3" fill="#3b1078"/><rect x="2" y="23" width="28" height="2" fill="#d4af37"/><rect x="4" y="23" width="24" height="1" fill="#fef08a"/><rect x="1" y="27" width="30" height="5" fill="#0c0a09"/><rect x="3" y="27" width="26" height="3" fill="#1e1b4b"/><rect x="6" y="28" width="20" height="2" fill="#2e1065"/><rect x="14" y="28" width="4" height="2" fill="#d4af37"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const WIZARD_LEG_FRONT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_LEG_FRONT_BODY}</svg>`;

export function drawWizardLegFrontToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Caída frontal de la falda talar
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 20 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 19 * s);
  ctx.fillStyle = '#3b1078';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 17 * s);
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(6 * s, 2 * s, 20 * s, 17 * s);

  // Estola rúnica central
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(12 * s, 1 * s, 8 * s, 19 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(13 * s, 2 * s, 6 * s, 17 * s);
  ctx.fillStyle = '#5b21b6';
  ctx.fillRect(14 * s, 2 * s, 4 * s, 17 * s);

  // Sellos y runas doradas/amatistas
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 4 * s, 2 * s, 2 * s);
  ctx.fillRect(15 * s, 9 * s, 2 * s, 2 * s);
  ctx.fillRect(15 * s, 14 * s, 2 * s, 2 * s);

  ctx.fillStyle = '#c084fc';
  ctx.fillRect(14 * s, 5 * s, 4 * s, 1 * s);
  ctx.fillRect(14 * s, 10 * s, 4 * s, 1 * s);
  ctx.fillRect(14 * s, 15 * s, 4 * s, 1 * s);

  // 2. Dobladillo inferior con cenefa dorada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 21 * s, 30 * s, 6 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(2 * s, 21 * s, 28 * s, 5 * s);
  ctx.fillStyle = '#3b1078';
  ctx.fillRect(3 * s, 22 * s, 26 * s, 3 * s);
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(2 * s, 23 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(4 * s, 23 * s, 24 * s, 1 * s);

  // 3. Botines de sabio y suela Sumi
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 27 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(3 * s, 27 * s, 26 * s, 3 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(6 * s, 28 * s, 20 * s, 2 * s);
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(14 * s, 28 * s, 4 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 31 * s, 30 * s, 1 * s);
}

/**
 * SVG canónico del Costado Lateral de la Pierna del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Caída lateral de la túnica con sello de estrella arcana (#c084fc, #fef08a), cenefa dorada y perfil del botín puntiagudo.
 */
export const WIZARD_LEG_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="20" fill="#1e1b4b"/><rect x="2" y="1" width="28" height="19" fill="#2e1065"/><rect x="4" y="2" width="24" height="17" fill="#3b1078"/><rect x="6" y="2" width="20" height="17" fill="#4c1d95"/><rect x="11" y="5" width="10" height="10" fill="#0c0a09"/><rect x="12" y="6" width="8" height="8" fill="#2e1065"/><rect x="13" y="7" width="6" height="6" fill="#3b1078"/><rect x="14" y="7" width="4" height="6" fill="#c084fc"/><rect x="15" y="8" width="2" height="4" fill="#fef08a"/><rect x="1" y="21" width="30" height="6" fill="#0c0a09"/><rect x="2" y="21" width="28" height="5" fill="#2e1065"/><rect x="3" y="22" width="26" height="3" fill="#3b1078"/><rect x="2" y="23" width="28" height="2" fill="#d4af37"/><rect x="4" y="23" width="24" height="1" fill="#fef08a"/><rect x="1" y="27" width="30" height="5" fill="#0c0a09"/><rect x="3" y="27" width="26" height="3" fill="#1e1b4b"/><rect x="5" y="28" width="22" height="2" fill="#2e1065"/><rect x="13" y="27" width="6" height="2" fill="#d4af37"/><rect x="14" y="28" width="4" height="1" fill="#fef08a"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const WIZARD_LEG_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_LEG_SIDE_BODY}</svg>`;

export function drawWizardLegSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Caída lateral de la túnica
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 20 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 19 * s);
  ctx.fillStyle = '#3b1078';
  ctx.fillRect(rx(4, 24), 2 * s, 24 * s, 17 * s);
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(rx(6, 20), 2 * s, 20 * s, 17 * s);

  // Sello arcano lateral de estrella/luna
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(11, 10), 5 * s, 10 * s, 10 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(rx(12, 8), 6 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#3b1078';
  ctx.fillRect(rx(13, 6), 7 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#c084fc';
  ctx.fillRect(rx(14, 4), 7 * s, 4 * s, 6 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(15, 2), 8 * s, 2 * s, 4 * s);

  // 2. Dobladillo inferior con cenefa dorada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 21 * s, 30 * s, 6 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(rx(2, 28), 21 * s, 28 * s, 5 * s);
  ctx.fillStyle = '#3b1078';
  ctx.fillRect(rx(3, 26), 22 * s, 26 * s, 3 * s);
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(rx(2, 28), 23 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(4, 24), 23 * s, 24 * s, 1 * s);

  // 3. Botín lateral y suela Sumi
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 27 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(rx(3, 26), 27 * s, 26 * s, 3 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(rx(5, 22), 28 * s, 22 * s, 2 * s);
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(rx(13, 6), 27 * s, 6 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(14, 4), 28 * s, 4 * s, 1 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 31 * s, 30 * s, 1 * s);
}

/**
 * SVG canónico del Costado Interior de la Pierna del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Penumbra mística interior (#0f172a, #1e1b4b, #2e1065), pliegues oscuros y costura interior de tela talar.
 */
export const WIZARD_LEG_INNER_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="30" fill="#0f172a"/><rect x="2" y="1" width="28" height="29" fill="#1e1b4b"/><rect x="3" y="2" width="8" height="27" fill="#0f172a"/><rect x="4" y="3" width="6" height="25" fill="#2e1065"/><rect x="11" y="2" width="4" height="28" fill="#0c0a09"/><rect x="12" y="2" width="2" height="28" fill="#1e1b4b"/><g fill="#3b1078"><rect x="16" y="5" width="6" height="2"/><rect x="16" y="13" width="6" height="2"/><rect x="16" y="21" width="6" height="2"/></g><rect x="1" y="28" width="30" height="4" fill="#0c0a09"/><rect x="3" y="29" width="26" height="2" fill="#1e1b4b"/>`;

export const WIZARD_LEG_INNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_LEG_INNER_BODY}</svg>`;

export function drawWizardLegInnerToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 30 * s);
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 29 * s);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(rx(3, 8), 2 * s, 8 * s, 27 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(rx(4, 6), 3 * s, 6 * s, 25 * s);

  // Pliegues interiores
  ctx.fillStyle = '#3b1078';
  for (const y of [5, 13, 21]) {
    ctx.fillRect(rx(16, 6), y * s, 6 * s, 2 * s);
  }

  // Costura vertical interior
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(11, 4), 2 * s, 4 * s, 28 * s);
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(rx(12, 2), 2 * s, 2 * s, 28 * s);

  // Remate inferior
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 28 * s, 30 * s, 4 * s);
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(rx(3, 26), 29 * s, 26 * s, 2 * s);
}

/**
 * SVG canónico de la Espalda de la Pierna del Hechicero (32x32) en estilo Sumi-e Pixel Art:
 * - Caída posterior de la falda talar con pliegues simétricos (#2e1065, #3b1078, #4c1d95), cenefa rúnica dorada continua y talones de terciopelo.
 */
export const WIZARD_LEG_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="20" fill="#1e1b4b"/><rect x="2" y="1" width="28" height="19" fill="#2e1065"/><rect x="4" y="2" width="24" height="17" fill="#3b1078"/><rect x="6" y="2" width="20" height="17" fill="#4c1d95"/><rect x="14" y="1" width="4" height="19" fill="#0c0a09"/><rect x="15" y="1" width="2" height="19" fill="#1e1b4b"/><rect x="1" y="21" width="30" height="6" fill="#0c0a09"/><rect x="2" y="21" width="28" height="5" fill="#2e1065"/><rect x="3" y="22" width="26" height="3" fill="#3b1078"/><rect x="2" y="23" width="28" height="2" fill="#d4af37"/><rect x="4" y="23" width="24" height="1" fill="#fef08a"/><rect x="1" y="27" width="30" height="5" fill="#0c0a09"/><rect x="3" y="27" width="26" height="3" fill="#1e1b4b"/><rect x="6" y="28" width="20" height="2" fill="#2e1065"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const WIZARD_LEG_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${WIZARD_LEG_BACK_BODY}</svg>`;

export function drawWizardLegBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Caída posterior de la túnica
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 20 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 19 * s);
  ctx.fillStyle = '#3b1078';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 17 * s);
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(6 * s, 2 * s, 20 * s, 17 * s);

  // Costura central dorsal
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 1 * s, 4 * s, 19 * s);
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(15 * s, 1 * s, 2 * s, 19 * s);

  // 2. Dobladillo inferior con cenefa dorada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 21 * s, 30 * s, 6 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(2 * s, 21 * s, 28 * s, 5 * s);
  ctx.fillStyle = '#3b1078';
  ctx.fillRect(3 * s, 22 * s, 26 * s, 3 * s);
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(2 * s, 23 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(4 * s, 23 * s, 24 * s, 1 * s);

  // 3. Talones de botines y suela Sumi
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 27 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(3 * s, 27 * s, 26 * s, 3 * s);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(6 * s, 28 * s, 20 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 31 * s, 30 * s, 1 * s);
}

export const wizardPortrait = {
    id: 'wizard',
    icon: 'avatar_wizard',
    viewBox: '0 0 32 32',
    svg: WIZARD_PORTRAIT_SVG,
    body: WIZARD_PORTRAIT_BODY,
    sideSvg: WIZARD_SIDE_SVG,
    sideBody: WIZARD_SIDE_BODY,
    backSvg: WIZARD_BACK_SVG,
    backBody: WIZARD_BACK_BODY,
    chestSvg: WIZARD_CHEST_SVG,
    chestBody: WIZARD_CHEST_BODY,
    torsoSideSvg: WIZARD_TORSO_SIDE_SVG,
    torsoSideBody: WIZARD_TORSO_SIDE_BODY,
    torsoBackSvg: WIZARD_TORSO_BACK_SVG,
    torsoBackBody: WIZARD_TORSO_BACK_BODY,
    armFrontSvg: WIZARD_ARM_FRONT_SVG,
    armFrontBody: WIZARD_ARM_FRONT_BODY,
    armSideSvg: WIZARD_ARM_SIDE_SVG,
    armSideBody: WIZARD_ARM_SIDE_BODY,
    armInnerSvg: WIZARD_ARM_INNER_SVG,
    armInnerBody: WIZARD_ARM_INNER_BODY,
    armBackSvg: WIZARD_ARM_BACK_SVG,
    armBackBody: WIZARD_ARM_BACK_BODY,
    legFrontSvg: WIZARD_LEG_FRONT_SVG,
    legFrontBody: WIZARD_LEG_FRONT_BODY,
    legSideSvg: WIZARD_LEG_SIDE_SVG,
    legSideBody: WIZARD_LEG_SIDE_BODY,
    legInnerSvg: WIZARD_LEG_INNER_SVG,
    legInnerBody: WIZARD_LEG_INNER_BODY,
    legBackSvg: WIZARD_LEG_BACK_SVG,
    legBackBody: WIZARD_LEG_BACK_BODY,
    drawToCanvas: drawWizardHeadToCanvas,
    drawSideToCanvas: drawWizardSideToCanvas,
    drawBackToCanvas: drawWizardBackToCanvas,
    drawChestToCanvas: drawWizardChestToCanvas,
    drawTorsoSideToCanvas: drawWizardTorsoSideToCanvas,
    drawTorsoBackToCanvas: drawWizardTorsoBackToCanvas,
    drawArmFrontToCanvas: drawWizardArmFrontToCanvas,
    drawArmSideToCanvas: drawWizardArmSideToCanvas,
    drawArmInnerToCanvas: drawWizardArmInnerToCanvas,
    drawArmBackToCanvas: drawWizardArmBackToCanvas,
    drawLegFrontToCanvas: drawWizardLegFrontToCanvas,
    drawLegSideToCanvas: drawWizardLegSideToCanvas,
    drawLegInnerToCanvas: drawWizardLegInnerToCanvas,
    drawLegBackToCanvas: drawWizardLegBackToCanvas,
};
