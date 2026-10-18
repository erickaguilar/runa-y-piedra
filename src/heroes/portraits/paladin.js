// src/heroes/portraits/paladin.js
// Arte Sumi-e Pixel Art del heroe Paladin: datos SVG (canonicos, verificados por tests)
// y funciones de dibujo imperativo a canvas (usadas por las texturas 3D).
// Generado al trocear src/heroes/heroPortraits.js (Fase 6). Sin cambios de comportamiento.

/**
 * SVG canónico del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Fondo pergamino Washi (#d6cfc2) y contorno de tinta Sumi (#0c0a09).
 * - Yelmo de acero forjado (#52525b, #71717a, #a1a1aa, #e4e4e7) con filo dorado (#d97706, #fef08a) y engaste carmesí (#991b1b).
 * - Cejas nobles severas (#292524, #57534e) y ojos de paladín azul celestial templario (#1d4ed8, #38bdf8).
 * - Cicatriz vertical de honor en el pómulo izquierdo (#a8a29e, #f4efe4).
 * - Mentón firme, hoyuelo y barba corta en gris acero (#78716c, #57534e).
 */
export const PALADIN_PORTRAIT_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="5" y="9" width="22" height="2" fill="#78716c"/><rect x="5" y="11" width="22" height="1" fill="#a8a29e"/><rect x="5" y="26" width="22" height="5" fill="#bfb6a6"/><rect x="8" y="28" width="16" height="3" fill="#a8a29e"/><path d="M1,1 H31 V23 H26 V11 H18 V17 H14 V11 H6 V23 H1 Z" fill="#0c0a09"/><path d="M1,1 H31 V21 H27 V10 H17 V16 H15 V10 H5 V21 H1 Z" fill="#52525b"/><path d="M2,1 H30 V8 H28 V19 H27 V9 H17 V15 H15 V9 H5 V19 H4 V8 H2 Z" fill="#71717a"/><rect x="3" y="2" width="26" height="4" fill="#a1a1aa"/><rect x="4" y="2" width="24" height="1" fill="#e4e4e7"/><g fill="#d97706"><rect x="5" y="8" width="10" height="1"/><rect x="17" y="8" width="10" height="1"/><rect x="15" y="6" width="2" height="9"/></g><rect x="15" y="4" width="2" height="2" fill="#991b1b"/><rect x="15" y="7" width="1" height="7" fill="#fef08a"/><g fill="#18181b"><rect x="3" y="4" width="1" height="1"/><rect x="28" y="4" width="1" height="1"/><rect x="2" y="13" width="2" height="1"/><rect x="28" y="13" width="2" height="1"/><rect x="2" y="17" width="2" height="1"/><rect x="28" y="17" width="2" height="1"/></g><rect x="7" y="12" width="6" height="2" fill="#292524"/><rect x="19" y="12" width="6" height="2" fill="#292524"/><rect x="8" y="12" width="4" height="1" fill="#57534e"/><rect x="20" y="12" width="4" height="1" fill="#57534e"/><rect x="7" y="14" width="5" height="5" fill="#0c0a09"/><rect x="20" y="14" width="5" height="5" fill="#0c0a09"/><rect x="8" y="15" width="4" height="4" fill="#f4efe4"/><rect x="20" y="15" width="4" height="4" fill="#f4efe4"/><rect x="9" y="15" width="3" height="4" fill="#1d4ed8"/><rect x="21" y="15" width="3" height="4" fill="#1d4ed8"/><rect x="9" y="16" width="2" height="3" fill="#38bdf8"/><rect x="21" y="16" width="2" height="3" fill="#38bdf8"/><rect x="8" y="15" width="2" height="2" fill="#ffffff"/><rect x="20" y="15" width="2" height="2" fill="#ffffff"/><rect x="14" y="18" width="4" height="3" fill="#bfb6a6"/><rect x="14" y="20" width="4" height="1" fill="#78716c"/><rect x="8" y="20" width="1" height="4" fill="#a8a29e"/><rect x="9" y="20" width="1" height="4" fill="#f4efe4"/><rect x="12" y="24" width="8" height="2" fill="#451a03"/><rect x="12" y="24" width="8" height="1" fill="#0c0a09"/><rect x="15" y="27" width="2" height="2" fill="#78716c"/><path d="M5,23 H7 V28 H11 V30 H21 V28 H25 V23 H27 V31 H5 Z" fill="#78716c"/><rect x="11" y="29" width="10" height="2" fill="#57534e"/>`;

export const PALADIN_PORTRAIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_PORTRAIT_BODY}</svg>`;

/**
 * Renderizado procedural síncrono píxel a píxel del Rostro del Paladín sobre Canvas 2D.
 */
export function drawPaladinPortraitToCanvas(ctx, size = 32) {
  const s = size / 32;

  // Fondo Washi
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(0, 0, size, size);

  // Marco tinta negra
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  // Sombras de aguada en rostro bajo el yelmo
  ctx.fillStyle = '#78716c';
  ctx.fillRect(5 * s, 9 * s, 22 * s, 2 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(5 * s, 11 * s, 22 * s, 1 * s);
  ctx.fillStyle = '#bfb6a6';
  ctx.fillRect(5 * s, 26 * s, 22 * s, 5 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(8 * s, 28 * s, 16 * s, 3 * s);

  // Yelmo de acero forjado: contorno interior negro
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 10 * s);
  ctx.fillRect(1 * s, 11 * s, 5 * s, 12 * s);
  ctx.fillRect(26 * s, 11 * s, 5 * s, 12 * s);
  ctx.fillRect(14 * s, 11 * s, 4 * s, 6 * s);

  // Base acero oscuro
  ctx.fillStyle = '#52525b';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 9 * s);
  ctx.fillRect(1 * s, 10 * s, 4 * s, 11 * s);
  ctx.fillRect(27 * s, 10 * s, 4 * s, 11 * s);
  ctx.fillRect(15 * s, 10 * s, 2 * s, 6 * s);

  // Placas iluminadas de acero bruñido
  ctx.fillStyle = '#71717a';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 7 * s);
  ctx.fillRect(4 * s, 8 * s, 1 * s, 11 * s);
  ctx.fillRect(27 * s, 8 * s, 1 * s, 11 * s);
  ctx.fillRect(15 * s, 9 * s, 2 * s, 6 * s);

  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(3 * s, 2 * s, 26 * s, 4 * s);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 1 * s);

  // Filo dorado sagrado en visera y protector nasal
  ctx.fillStyle = '#d97706';
  ctx.fillRect(5 * s, 8 * s, 10 * s, 1 * s);
  ctx.fillRect(17 * s, 8 * s, 10 * s, 1 * s);
  ctx.fillRect(15 * s, 6 * s, 2 * s, 9 * s);

  // Engaste penacho y brillo dorado
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(15 * s, 4 * s, 2 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 7 * s, 1 * s, 7 * s);

  // Remaches
  ctx.fillStyle = '#18181b';
  ctx.fillRect(3 * s, 4 * s, 1 * s, 1 * s);
  ctx.fillRect(28 * s, 4 * s, 1 * s, 1 * s);
  ctx.fillRect(2 * s, 13 * s, 2 * s, 1 * s);
  ctx.fillRect(28 * s, 13 * s, 2 * s, 1 * s);
  ctx.fillRect(2 * s, 17 * s, 2 * s, 1 * s);
  ctx.fillRect(28 * s, 17 * s, 2 * s, 1 * s);

  // Cejas nobles
  ctx.fillStyle = '#292524';
  ctx.fillRect(7 * s, 12 * s, 6 * s, 2 * s);
  ctx.fillRect(19 * s, 12 * s, 6 * s, 2 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(8 * s, 12 * s, 4 * s, 1 * s);
  ctx.fillRect(20 * s, 12 * s, 4 * s, 1 * s);

  // Ojos paladín (tinta)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(7 * s, 14 * s, 5 * s, 5 * s);
  ctx.fillRect(20 * s, 14 * s, 5 * s, 5 * s);

  // Esclerótica
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(8 * s, 15 * s, 4 * s, 4 * s);
  ctx.fillRect(20 * s, 15 * s, 4 * s, 4 * s);

  // Iris azul templario
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(9 * s, 15 * s, 3 * s, 4 * s);
  ctx.fillRect(21 * s, 15 * s, 3 * s, 4 * s);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(9 * s, 16 * s, 2 * s, 3 * s);
  ctx.fillRect(21 * s, 16 * s, 2 * s, 3 * s);

  // Destello blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(8 * s, 15 * s, 2 * s, 2 * s);
  ctx.fillRect(20 * s, 15 * s, 2 * s, 2 * s);

  // Pómulos y nariz
  ctx.fillStyle = '#bfb6a6';
  ctx.fillRect(14 * s, 18 * s, 4 * s, 3 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(14 * s, 20 * s, 4 * s, 1 * s);

  // Cicatriz vertical de honor
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(8 * s, 20 * s, 1 * s, 4 * s);
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(9 * s, 20 * s, 1 * s, 4 * s);

  // Boca firme
  ctx.fillStyle = '#451a03';
  ctx.fillRect(12 * s, 24 * s, 8 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(12 * s, 24 * s, 8 * s, 1 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(15 * s, 27 * s, 2 * s, 2 * s);

  // Barba candado corta / sombra mandíbula
  ctx.fillStyle = '#78716c';
  ctx.fillRect(5 * s, 23 * s, 2 * s, 8 * s);
  ctx.fillRect(25 * s, 23 * s, 2 * s, 8 * s);
  ctx.fillRect(7 * s, 28 * s, 4 * s, 3 * s);
  ctx.fillRect(21 * s, 28 * s, 4 * s, 3 * s);
  ctx.fillRect(11 * s, 30 * s, 10 * s, 1 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(11 * s, 29 * s, 10 * s, 2 * s);
}

/**
 * SVG canónico del Torso / Pecho del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Peto de placas de acero templado (#52525b, #71717a, #a1a1aa, #e4e4e7) con contorno de tinta Sumi (#0c0a09).
 * - Tabardo sagrado carmesí (#7f1d1d, #991b1b) con ribete dorado (#d97706, #fef08a) bajo la cruz 3D.
 */
export const PALADIN_CHEST_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#52525b"/><rect x="2" y="2" width="28" height="22" fill="#71717a"/><rect x="3" y="2" width="26" height="5" fill="#a1a1aa"/><rect x="4" y="2" width="24" height="1" fill="#e4e4e7"/><rect x="25" y="2" width="5" height="22" fill="#3f3f46"/><rect x="10" y="2" width="12" height="23" fill="#0c0a09"/><rect x="11" y="2" width="10" height="23" fill="#991b1b"/><rect x="12" y="2" width="8" height="23" fill="#7f1d1d"/><rect x="11" y="2" width="1" height="23" fill="#d97706"/><rect x="20" y="2" width="1" height="23" fill="#d97706"/><rect x="14" y="5" width="4" height="14" fill="#fef08a"/><rect x="10" y="9" width="12" height="4" fill="#fef08a"/><rect x="1" y="26" width="30" height="5" fill="#27272a"/><rect x="12" y="26" width="8" height="5" fill="#d97706"/><rect x="13" y="27" width="6" height="3" fill="#fef08a"/>`;

export const PALADIN_CHEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_CHEST_BODY}</svg>`;

export function drawPaladinChestToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Peto de acero forjado
  ctx.fillStyle = '#52525b';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(2 * s, 2 * s, 28 * s, 22 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(3 * s, 2 * s, 26 * s, 5 * s);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 1 * s);
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(25 * s, 2 * s, 5 * s, 22 * s);

  // Tabardo central carmesí con ribete áureo
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(10 * s, 2 * s, 12 * s, 23 * s);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(11 * s, 2 * s, 10 * s, 23 * s);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(12 * s, 2 * s, 8 * s, 23 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(11 * s, 2 * s, 1 * s, 23 * s);
  ctx.fillRect(20 * s, 2 * s, 1 * s, 23 * s);

  // Halo dorado bajo la cruz 3D del pecho
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(14 * s, 5 * s, 4 * s, 14 * s);
  ctx.fillRect(10 * s, 9 * s, 12 * s, 4 * s);

  // Cinturón templario
  ctx.fillStyle = '#27272a';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(12 * s, 26 * s, 8 * s, 5 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(13 * s, 27 * s, 6 * s, 3 * s);
}

/**
 * SVG canónico del Perfil Lateral de la Cabeza del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Yelmo cerrado de acero templario (#52525b, #71717a, #a1a1aa, #e4e4e7) con banda áurea horizontal en y=8..9 (#b45309, #d97706, #fef08a).
 * - Carrillera articulada con respiraderos de tinta (#0c0a09), roseta de bisagra dorada y cota de malla inferior (#27272a, #78716c).
 */
export const PALADIN_SIDE_BODY = `<rect width="32" height="32" fill="#52525b"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="2" y="2" width="28" height="22" fill="#71717a"/><rect x="3" y="2" width="26" height="5" fill="#a1a1aa"/><rect x="4" y="2" width="24" height="1" fill="#e4e4e7"/><rect x="1" y="8" width="30" height="2" fill="#d97706"/><rect x="2" y="8" width="28" height="1" fill="#fef08a"/><rect x="13" y="14" width="6" height="6" fill="#0c0a09"/><rect x="14" y="15" width="4" height="4" fill="#d97706"/><rect x="15" y="16" width="2" height="2" fill="#fef08a"/><g fill="#0c0a09"><rect x="3" y="13" width="7" height="1"/><rect x="3" y="16" width="7" height="1"/><rect x="3" y="19" width="7" height="1"/><rect x="22" y="12" width="2" height="10"/><rect x="26" y="12" width="2" height="10"/></g><rect x="1" y="24" width="8" height="7" fill="#78716c"/><rect x="2" y="26" width="6" height="5" fill="#57534e"/><rect x="9" y="24" width="22" height="7" fill="#0c0a09"/><rect x="10" y="25" width="20" height="5" fill="#27272a"/><rect x="11" y="25" width="18" height="1" fill="#d97706"/><g fill="#a1a1aa"><rect x="12" y="27" width="2" height="2"/><rect x="17" y="27" width="2" height="2"/><rect x="22" y="27" width="2" height="2"/><rect x="27" y="27" width="2" height="2"/></g>`;

export const PALADIN_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_SIDE_BODY}</svg>`;

export function drawPaladinSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#52525b';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  // Placas laterales de acero bruñido
  ctx.fillStyle = '#71717a';
  ctx.fillRect(rx(2, 28), 2 * s, 28 * s, 22 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(rx(3, 26), 2 * s, 26 * s, 5 * s);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(rx(4, 24), 2 * s, 24 * s, 1 * s);

  // Banda horizontal de oro sagrado (y=8..9) que empata con la visera frontal
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(1, 30), 8 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(2, 28), 8 * s, 28 * s, 1 * s);

  // Roseta / bisagra dorada del yelmo en el centro lateral
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(13, 6), 14 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(14, 4), 15 * s, 4 * s, 4 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(15, 2), 16 * s, 2 * s, 2 * s);

  // Respiraderos frontales en la carrillera y estrías traseras
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(3, 7), 13 * s, 7 * s, 1 * s);
  ctx.fillRect(rx(3, 7), 16 * s, 7 * s, 1 * s);
  ctx.fillRect(rx(3, 7), 19 * s, 7 * s, 1 * s);
  ctx.fillRect(rx(22, 2), 12 * s, 2 * s, 10 * s);
  ctx.fillRect(rx(26, 2), 12 * s, 2 * s, 10 * s);

  // Transición con la barba gris acero del mentón (x=1..8, y=24..30) y gorjal de malla trasero
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(1, 8), 24 * s, 8 * s, 7 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(rx(2, 6), 26 * s, 6 * s, 5 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(9, 22), 24 * s, 22 * s, 7 * s);
  ctx.fillStyle = '#27272a';
  ctx.fillRect(rx(10, 20), 25 * s, 20 * s, 5 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(11, 18), 25 * s, 18 * s, 1 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(rx(12, 2), 27 * s, 2 * s, 2 * s);
  ctx.fillRect(rx(17, 2), 27 * s, 2 * s, 2 * s);
  ctx.fillRect(rx(22, 2), 27 * s, 2 * s, 2 * s);
  ctx.fillRect(rx(27, 2), 27 * s, 2 * s, 2 * s);
}

/**
 * SVG canónico de la Nuca / Parte Trasera de la Cabeza del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Yelmo templario posterior en acero (#52525b, #71717a, #a1a1aa) con cruz sagrada dorada (#d97706, #fef08a), engaste de cresta carmesí (#991b1b) y faldón de cota de malla.
 */
export const PALADIN_BACK_BODY = `<rect width="32" height="32" fill="#52525b"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="2" y="2" width="28" height="22" fill="#71717a"/><rect x="3" y="2" width="26" height="5" fill="#a1a1aa"/><rect x="4" y="2" width="24" height="1" fill="#e4e4e7"/><rect x="1" y="8" width="30" height="2" fill="#d97706"/><rect x="14" y="2" width="4" height="20" fill="#d97706"/><rect x="2" y="8" width="28" height="1" fill="#fef08a"/><rect x="15" y="2" width="2" height="19" fill="#fef08a"/><rect x="14" y="2" width="4" height="4" fill="#991b1b"/><rect x="1" y="24" width="30" height="7" fill="#0c0a09"/><rect x="2" y="25" width="28" height="5" fill="#27272a"/><rect x="3" y="25" width="26" height="1" fill="#d97706"/><g fill="#a1a1aa"><rect x="5" y="27" width="2" height="2"/><rect x="10" y="27" width="2" height="2"/><rect x="15" y="27" width="2" height="2"/><rect x="20" y="27" width="2" height="2"/><rect x="25" y="27" width="2" height="2"/></g>`;

export const PALADIN_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_BACK_BODY}</svg>`;

export function drawPaladinBackToCanvas(ctx, size = 32) {
  const s = size / 32;

  ctx.fillStyle = '#52525b';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  ctx.fillStyle = '#71717a';
  ctx.fillRect(2 * s, 2 * s, 28 * s, 22 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(3 * s, 2 * s, 26 * s, 5 * s);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 1 * s);

  // Cruz templaria dorada en la nuca del yelmo + engaste de la cresta carmesí
  ctx.fillStyle = '#d97706';
  ctx.fillRect(1 * s, 8 * s, 30 * s, 2 * s);
  ctx.fillRect(14 * s, 2 * s, 4 * s, 20 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(2 * s, 8 * s, 28 * s, 1 * s);
  ctx.fillRect(15 * s, 2 * s, 2 * s, 19 * s);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(14 * s, 2 * s, 4 * s, 4 * s);

  // Faldón trasero de cota de malla templaria
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 24 * s, 30 * s, 7 * s);
  ctx.fillStyle = '#27272a';
  ctx.fillRect(2 * s, 25 * s, 28 * s, 5 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(3 * s, 25 * s, 26 * s, 1 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(5 * s, 27 * s, 2 * s, 2 * s);
  ctx.fillRect(10 * s, 27 * s, 2 * s, 2 * s);
  ctx.fillRect(15 * s, 27 * s, 2 * s, 2 * s);
  ctx.fillRect(20 * s, 27 * s, 2 * s, 2 * s);
  ctx.fillRect(25 * s, 27 * s, 2 * s, 2 * s);
}

/**
 * SVG canónico del Costado Lateral del Torso del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Placas de acero templado (#52525b, #71717a, #a1a1aa), cota de malla central (#27272a, #a1a1aa) y correas con hebillas doradas (#d97706, #fef08a).
 */
export const PALADIN_TORSO_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#27272a"/><rect x="1" y="2" width="9" height="23" fill="#71717a"/><rect x="2" y="2" width="6" height="22" fill="#a1a1aa"/><rect x="22" y="2" width="9" height="23" fill="#52525b"/><rect x="23" y="2" width="6" height="22" fill="#71717a"/><g fill="#a1a1aa"><rect x="12" y="4" width="2" height="2"/><rect x="17" y="4" width="2" height="2"/><rect x="12" y="13" width="2" height="2"/><rect x="17" y="13" width="2" height="2"/><rect x="12" y="22" width="2" height="2"/><rect x="17" y="22" width="2" height="2"/></g><g fill="#0c0a09"><rect x="8" y="7" width="16" height="4"/><rect x="8" y="16" width="16" height="4"/></g><g fill="#d97706"><rect x="9" y="8" width="14" height="2"/><rect x="9" y="17" width="14" height="2"/></g><g fill="#fef08a"><rect x="14" y="8" width="4" height="2"/><rect x="14" y="17" width="4" height="2"/></g><rect x="1" y="26" width="30" height="5" fill="#27272a"/><rect x="2" y="27" width="28" height="2" fill="#d97706"/>`;

export const PALADIN_TORSO_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_TORSO_SIDE_BODY}</svg>`;

export function drawPaladinTorsoSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#27272a';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 25 * s);

  // Placas laterales del peto (frente) y espaldar (dorso)
  ctx.fillStyle = '#71717a';
  ctx.fillRect(rx(1, 9), 2 * s, 9 * s, 23 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(rx(2, 6), 2 * s, 6 * s, 22 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(rx(22, 9), 2 * s, 9 * s, 23 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(rx(23, 6), 2 * s, 6 * s, 22 * s);

  // Eslabones de cota de malla en el costado
  ctx.fillStyle = '#a1a1aa';
  for (const y of [4, 13, 22]) {
    ctx.fillRect(rx(12, 2), y * s, 2 * s, 2 * s);
    ctx.fillRect(rx(17, 2), y * s, 2 * s, 2 * s);
  }

  // Correas templarias con hebillas doradas
  for (const y of [7, 16]) {
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(rx(8, 16), y * s, 16 * s, 4 * s);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(rx(9, 14), (y + 1) * s, 14 * s, 2 * s);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(rx(14, 4), (y + 1) * s, 4 * s, 2 * s);
  }

  // Cinturón templario lateral
  ctx.fillStyle = '#27272a';
  ctx.fillRect(rx(1, 30), 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(2, 28), 27 * s, 28 * s, 2 * s);
}

/**
 * SVG canónico de la Espalda del Torso del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Espaldar de acero bruñido (#52525b, #71717a, #a1a1aa) con tabardo dorsal carmesí (#991b1b, #7f1d1d) y gran cruz solar templaria en oro (#d97706, #fef08a).
 */
export const PALADIN_TORSO_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#52525b"/><rect x="2" y="2" width="28" height="22" fill="#71717a"/><rect x="3" y="2" width="26" height="5" fill="#a1a1aa"/><rect x="4" y="2" width="24" height="1" fill="#e4e4e7"/><rect x="10" y="2" width="12" height="23" fill="#0c0a09"/><rect x="11" y="2" width="10" height="23" fill="#991b1b"/><rect x="12" y="2" width="8" height="23" fill="#7f1d1d"/><rect x="11" y="2" width="1" height="23" fill="#d97706"/><rect x="20" y="2" width="1" height="23" fill="#d97706"/><rect x="14" y="5" width="4" height="14" fill="#d97706"/><rect x="10" y="9" width="12" height="4" fill="#d97706"/><rect x="15" y="6" width="2" height="12" fill="#fef08a"/><rect x="11" y="10" width="10" height="2" fill="#fef08a"/><rect x="1" y="26" width="30" height="5" fill="#27272a"/><rect x="12" y="26" width="8" height="5" fill="#d97706"/><rect x="13" y="27" width="6" height="3" fill="#fef08a"/>`;

export const PALADIN_TORSO_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_TORSO_BACK_BODY}</svg>`;

export function drawPaladinTorsoBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#52525b';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(2 * s, 2 * s, 28 * s, 22 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(3 * s, 2 * s, 26 * s, 5 * s);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 1 * s);

  // Tabardo dorsal carmesí con ribete áureo
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(10 * s, 2 * s, 12 * s, 23 * s);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(11 * s, 2 * s, 10 * s, 23 * s);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(12 * s, 2 * s, 8 * s, 23 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(11 * s, 2 * s, 1 * s, 23 * s);
  ctx.fillRect(20 * s, 2 * s, 1 * s, 23 * s);

  // Gran cruz solar templaria en el dorso
  ctx.fillStyle = '#d97706';
  ctx.fillRect(14 * s, 5 * s, 4 * s, 14 * s);
  ctx.fillRect(10 * s, 9 * s, 12 * s, 4 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 6 * s, 2 * s, 12 * s);
  ctx.fillRect(11 * s, 10 * s, 10 * s, 2 * s);

  // Cinturón templario trasero
  ctx.fillStyle = '#27272a';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(12 * s, 26 * s, 8 * s, 5 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(13 * s, 27 * s, 6 * s, 3 * s);
}

/**
 * SVG canónico del Frente del Brazo del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Bíceps con tela carmesí sagrada (#991b1b, #7f1d1d), placa de acero templado (#71717a, #a1a1aa, #e4e4e7) con ribete dorado, articulación del codo y gran brazal con la Cruz Solar templaria (#d97706, #fef08a).
 */
export const PALADIN_ARM_FRONT_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="15" fill="#7f1d1d"/><rect x="2" y="1" width="28" height="14" fill="#991b1b"/><rect x="4" y="2" width="24" height="12" fill="#52525b"/><rect x="6" y="2" width="20" height="12" fill="#71717a"/><rect x="9" y="3" width="14" height="10" fill="#a1a1aa"/><rect x="13" y="3" width="6" height="10" fill="#e4e4e7"/><rect x="15" y="4" width="2" height="8" fill="#f8fafc"/><rect x="6" y="13" width="20" height="2" fill="#d97706"/><rect x="8" y="13" width="16" height="1" fill="#fef08a"/><rect x="7" y="4" width="2" height="2" fill="#fef08a"/><rect x="23" y="4" width="2" height="2" fill="#fef08a"/><rect x="1" y="15" width="30" height="2" fill="#0c0a09"/><rect x="4" y="15" width="24" height="2" fill="#27272a"/><rect x="2" y="17" width="28" height="13" fill="#0c0a09"/><rect x="3" y="17" width="26" height="12" fill="#52525b"/><rect x="5" y="18" width="22" height="10" fill="#71717a"/><rect x="7" y="19" width="18" height="8" fill="#a1a1aa"/><rect x="14" y="19" width="4" height="9" fill="#0c0a09"/><rect x="15" y="20" width="2" height="8" fill="#d97706"/><rect x="11" y="22" width="10" height="4" fill="#0c0a09"/><rect x="12" y="23" width="8" height="2" fill="#d97706"/><rect x="14" y="22" width="4" height="4" fill="#d97706"/><rect x="15" y="23" width="2" height="2" fill="#fef08a"/><rect x="6" y="19" width="2" height="2" fill="#f8fafc"/><rect x="24" y="19" width="2" height="2" fill="#f8fafc"/><rect x="6" y="26" width="2" height="2" fill="#f8fafc"/><rect x="24" y="26" width="2" height="2" fill="#f8fafc"/><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="3" y="30" width="26" height="2" fill="#d97706"/><rect x="5" y="30" width="22" height="1" fill="#fef08a"/>`;

export const PALADIN_ARM_FRONT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_ARM_FRONT_BODY}</svg>`;

export function drawPaladinArmFrontToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Bíceps / brazo superior con tela carmesí sagrada y placa de acero
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 15 * s);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 14 * s);

  ctx.fillStyle = '#52525b';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 12 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(6 * s, 2 * s, 20 * s, 12 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(9 * s, 3 * s, 14 * s, 10 * s);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(13 * s, 3 * s, 6 * s, 10 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(15 * s, 4 * s, 2 * s, 8 * s);

  // Filigrana y ribete dorado en el bíceps
  ctx.fillStyle = '#d97706';
  ctx.fillRect(6 * s, 13 * s, 20 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(8 * s, 13 * s, 16 * s, 1 * s);

  // Remaches dorados del bíceps
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(7 * s, 4 * s, 2 * s, 2 * s);
  ctx.fillRect(23 * s, 4 * s, 2 * s, 2 * s);

  // 2. Articulación del codo
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 15 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#27272a';
  ctx.fillRect(4 * s, 15 * s, 24 * s, 2 * s);

  // 3. Antebrazo / brazalete de acero con Cruz Solar
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 17 * s, 28 * s, 13 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(3 * s, 17 * s, 26 * s, 12 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(5 * s, 18 * s, 22 * s, 10 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(7 * s, 19 * s, 18 * s, 8 * s);

  // Cruz solar templaria dorada en relieve central
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 19 * s, 4 * s, 9 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(15 * s, 20 * s, 2 * s, 8 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(11 * s, 22 * s, 10 * s, 4 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(12 * s, 23 * s, 8 * s, 2 * s);

  ctx.fillStyle = '#d97706';
  ctx.fillRect(14 * s, 22 * s, 4 * s, 4 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 23 * s, 2 * s, 2 * s);

  // Remaches plateados del brazal
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(6 * s, 19 * s, 2 * s, 2 * s);
  ctx.fillRect(24 * s, 19 * s, 2 * s, 2 * s);
  ctx.fillRect(6 * s, 26 * s, 2 * s, 2 * s);
  ctx.fillRect(24 * s, 26 * s, 2 * s, 2 * s);

  // Bocamanga de acero y oro en la muñeca
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 29 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(3 * s, 30 * s, 26 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(5 * s, 30 * s, 22 * s, 1 * s);
}

/**
 * SVG canónico del Costado Exterior del Brazo del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Placa lateral de acero bruñido con blasón solar en el hombro (#d97706, #fef08a), couter lateral y 2 correas de cuero con hebillas doradas.
 */
export const PALADIN_ARM_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="15" fill="#52525b"/><rect x="2" y="1" width="28" height="14" fill="#71717a"/><rect x="4" y="2" width="24" height="12" fill="#a1a1aa"/><rect x="6" y="2" width="20" height="12" fill="#cbd5e1"/><rect x="11" y="3" width="10" height="10" fill="#0c0a09"/><rect x="12" y="4" width="8" height="8" fill="#d97706"/><rect x="13" y="5" width="6" height="6" fill="#f59e0b"/><rect x="15" y="5" width="2" height="6" fill="#fef08a"/><rect x="13" y="7" width="6" height="2" fill="#fef08a"/><rect x="15" y="7" width="2" height="2" fill="#f8fafc"/><rect x="1" y="15" width="30" height="2" fill="#0c0a09"/><rect x="4" y="15" width="24" height="2" fill="#3f3f46"/><rect x="2" y="17" width="28" height="13" fill="#0c0a09"/><rect x="3" y="17" width="26" height="12" fill="#52525b"/><rect x="5" y="18" width="22" height="10" fill="#71717a"/><rect x="2" y="20" width="28" height="3" fill="#0c0a09"/><rect x="3" y="21" width="26" height="1" fill="#451a03"/><rect x="13" y="20" width="6" height="3" fill="#d97706"/><rect x="14" y="21" width="4" height="1" fill="#fef08a"/><rect x="2" y="26" width="28" height="3" fill="#0c0a09"/><rect x="3" y="27" width="26" height="1" fill="#451a03"/><rect x="13" y="26" width="6" height="3" fill="#d97706"/><rect x="14" y="27" width="4" height="1" fill="#fef08a"/><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="2" y="30" width="28" height="2" fill="#d97706"/>`;

export const PALADIN_ARM_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_ARM_SIDE_BODY}</svg>`;

export function drawPaladinArmSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Placa lateral superior
  ctx.fillStyle = '#52525b';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 15 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 14 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(rx(4, 24), 2 * s, 24 * s, 12 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(rx(6, 20), 2 * s, 20 * s, 12 * s);

  // Emblema heráldico solar en el hombro
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(11, 10), 3 * s, 10 * s, 10 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(12, 8), 4 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(rx(13, 6), 5 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(15, 2), 5 * s, 2 * s, 6 * s);
  ctx.fillRect(rx(13, 6), 7 * s, 6 * s, 2 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(rx(15, 2), 7 * s, 2 * s, 2 * s);

  // Codera lateral articulada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 15 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(rx(4, 24), 15 * s, 24 * s, 2 * s);

  // Brazal lateral inferior
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 17 * s, 28 * s, 13 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(rx(3, 26), 17 * s, 26 * s, 12 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(rx(5, 22), 18 * s, 22 * s, 10 * s);

  // 2 Correas templarias de cuero con hebillas doradas
  for (const y of [20, 26]) {
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(rx(2, 28), y * s, 28 * s, 3 * s);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(rx(3, 26), (y + 1) * s, 26 * s, 1 * s);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(rx(13, 6), y * s, 6 * s, 3 * s);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(rx(14, 4), (y + 1) * s, 4 * s, 1 * s);
  }

  // Remate muñeca
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 29 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(2, 28), 30 * s, 28 * s, 2 * s);
}

/**
 * SVG canónico del Costado Interior del Brazo del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Cota de malla oscura templaria (#27272a, #18181b), pliegues carmesí profundos (#7f1d1d, #450a0a) y costura interior de cuero.
 */
export const PALADIN_ARM_INNER_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="30" fill="#18181b"/><rect x="2" y="1" width="28" height="29" fill="#27272a"/><rect x="3" y="2" width="7" height="27" fill="#450a0a"/><rect x="4" y="3" width="5" height="25" fill="#7f1d1d"/><g fill="#52525b"><rect x="13" y="4" width="2" height="2"/><rect x="18" y="4" width="2" height="2"/><rect x="23" y="4" width="2" height="2"/><rect x="13" y="10" width="2" height="2"/><rect x="18" y="10" width="2" height="2"/><rect x="23" y="10" width="2" height="2"/><rect x="13" y="16" width="2" height="2"/><rect x="18" y="16" width="2" height="2"/><rect x="23" y="16" width="2" height="2"/><rect x="13" y="22" width="2" height="2"/><rect x="18" y="22" width="2" height="2"/><rect x="23" y="22" width="2" height="2"/></g><rect x="11" y="2" width="4" height="28" fill="#0c0a09"/><rect x="12" y="2" width="2" height="28" fill="#451a03"/><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="3" y="30" width="26" height="2" fill="#3f3f46"/>`;

export const PALADIN_ARM_INNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_ARM_INNER_BODY}</svg>`;

export function drawPaladinArmInnerToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Fondo de cota de malla y penumbra
  ctx.fillStyle = '#18181b';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 30 * s);
  ctx.fillStyle = '#27272a';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 29 * s);

  // Pliegues carmesí de la túnica interior
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(rx(3, 7), 2 * s, 7 * s, 27 * s);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(rx(4, 5), 3 * s, 5 * s, 25 * s);

  // Eslabones de cota de malla
  ctx.fillStyle = '#52525b';
  for (const y of [4, 10, 16, 22]) {
    ctx.fillRect(rx(13, 2), y * s, 2 * s, 2 * s);
    ctx.fillRect(rx(18, 2), y * s, 2 * s, 2 * s);
    ctx.fillRect(rx(23, 2), y * s, 2 * s, 2 * s);
  }

  // Costura interior de unión
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(11, 4), 2 * s, 4 * s, 28 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(12, 2), 2 * s, 2 * s, 28 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 29 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(rx(3, 26), 30 * s, 26 * s, 2 * s);
}

/**
 * SVG canónico de la Espalda del Brazo del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Placa dorsal de tríceps en acero templado (#71717a, #a1a1aa, #f8fafc), gran couter puntiagudo en relieve con remache áureo (#fef08a) y bandas laminares del antebrazo.
 */
export const PALADIN_ARM_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="14" fill="#52525b"/><rect x="2" y="1" width="28" height="13" fill="#71717a"/><rect x="5" y="2" width="22" height="11" fill="#a1a1aa"/><rect x="9" y="3" width="14" height="9" fill="#cbd5e1"/><rect x="14" y="3" width="4" height="9" fill="#f8fafc"/><rect x="5" y="4" width="2" height="2" fill="#fef08a"/><rect x="25" y="4" width="2" height="2" fill="#fef08a"/><rect x="1" y="14" width="30" height="2" fill="#0c0a09"/><rect x="6" y="15" width="20" height="9" fill="#0c0a09"/><rect x="7" y="16" width="18" height="7" fill="#52525b"/><rect x="9" y="17" width="14" height="5" fill="#71717a"/><rect x="11" y="18" width="10" height="3" fill="#a1a1aa"/><rect x="13" y="18" width="6" height="3" fill="#e4e4e7"/><rect x="15" y="19" width="2" height="2" fill="#fef08a"/><rect x="2" y="24" width="28" height="6" fill="#0c0a09"/><rect x="3" y="24" width="26" height="5" fill="#52525b"/><rect x="5" y="25" width="22" height="4" fill="#71717a"/><rect x="8" y="25" width="16" height="3" fill="#a1a1aa"/><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="2" y="30" width="28" height="2" fill="#d97706"/>`;

export const PALADIN_ARM_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_ARM_BACK_BODY}</svg>`;

export function drawPaladinArmBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Placa dorsal de tríceps en acero
  ctx.fillStyle = '#52525b';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 14 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 13 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(5 * s, 2 * s, 22 * s, 11 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(9 * s, 3 * s, 14 * s, 9 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(14 * s, 3 * s, 4 * s, 9 * s);

  // Remaches dorados del tríceps
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(5 * s, 4 * s, 2 * s, 2 * s);
  ctx.fillRect(25 * s, 4 * s, 2 * s, 2 * s);

  // Seam horizontal
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 14 * s, 30 * s, 2 * s);

  // Codera puntiaguda en relieve (Couter)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(6 * s, 15 * s, 20 * s, 9 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(7 * s, 16 * s, 18 * s, 7 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(9 * s, 17 * s, 14 * s, 5 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(11 * s, 18 * s, 10 * s, 3 * s);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(13 * s, 18 * s, 6 * s, 3 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 19 * s, 2 * s, 2 * s);

  // Dorso del antebrazo con bandas laminares de acero
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 24 * s, 28 * s, 6 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(3 * s, 24 * s, 26 * s, 5 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(5 * s, 25 * s, 22 * s, 4 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(8 * s, 25 * s, 16 * s, 3 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 29 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(2 * s, 30 * s, 28 * s, 2 * s);
}

/**
 * SVG canónico del Frente de la Pierna del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Muslo con tela carmesí sagrada (#7f1d1d, #991b1b) y quijote de acero (#52525b, #71717a, #a1a1aa), poleyn diamantado con Cruz Solar dorada (#d97706, #fef08a), greba de acero con arista central brillante (#f8fafc) y sabatón articulado con suela Sumi.
 */
export const PALADIN_LEG_FRONT_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="11" fill="#7f1d1d"/><rect x="2" y="1" width="28" height="10" fill="#991b1b"/><rect x="4" y="2" width="24" height="8" fill="#52525b"/><rect x="6" y="2" width="20" height="8" fill="#71717a"/><rect x="9" y="3" width="14" height="6" fill="#a1a1aa"/><rect x="13" y="3" width="6" height="6" fill="#cbd5e1"/><rect x="15" y="3" width="2" height="6" fill="#f8fafc"/><rect x="4" y="9" width="24" height="2" fill="#d97706"/><rect x="6" y="9" width="20" height="1" fill="#fef08a"/><rect x="2" y="11" width="28" height="8" fill="#0c0a09"/><rect x="3" y="11" width="26" height="8" fill="#52525b"/><rect x="5" y="12" width="22" height="6" fill="#71717a"/><rect x="8" y="12" width="16" height="6" fill="#a1a1aa"/><rect x="12" y="13" width="8" height="4" fill="#cbd5e1"/><rect x="15" y="13" width="2" height="4" fill="#f8fafc"/><rect x="14" y="12" width="4" height="6" fill="#d97706"/><rect x="12" y="14" width="8" height="2" fill="#d97706"/><rect x="15" y="14" width="2" height="2" fill="#fef08a"/><rect x="2" y="19" width="28" height="9" fill="#0c0a09"/><rect x="3" y="19" width="26" height="8" fill="#52525b"/><rect x="5" y="20" width="22" height="7" fill="#71717a"/><rect x="8" y="20" width="16" height="7" fill="#a1a1aa"/><rect x="13" y="20" width="6" height="7" fill="#cbd5e1"/><rect x="15" y="20" width="2" height="7" fill="#f8fafc"/><g fill="#f8fafc"><rect x="5" y="21" width="2" height="2"/><rect x="25" y="21" width="2" height="2"/><rect x="5" y="25" width="2" height="2"/><rect x="25" y="25" width="2" height="2"/></g><rect x="1" y="28" width="30" height="4" fill="#0c0a09"/><rect x="2" y="28" width="28" height="3" fill="#52525b"/><rect x="4" y="29" width="24" height="2" fill="#71717a"/><rect x="2" y="29" width="28" height="1" fill="#d97706"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const PALADIN_LEG_FRONT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_LEG_FRONT_BODY}</svg>`;

export function drawPaladinLegFrontToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Muslo / Calzones carmesí sagrado con placa de acero superior (quijote)
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 11 * s);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 10 * s);

  ctx.fillStyle = '#52525b';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 8 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(6 * s, 2 * s, 20 * s, 8 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(9 * s, 3 * s, 14 * s, 6 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(13 * s, 3 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(15 * s, 3 * s, 2 * s, 6 * s);

  // Ribete dorado inferior del quijote
  ctx.fillStyle = '#d97706';
  ctx.fillRect(4 * s, 9 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(6 * s, 9 * s, 20 * s, 1 * s);

  // 2. Rodillera templaria diamantada (Poleyn)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 11 * s, 28 * s, 8 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(3 * s, 11 * s, 26 * s, 8 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(5 * s, 12 * s, 22 * s, 6 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(8 * s, 12 * s, 16 * s, 6 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(12 * s, 13 * s, 8 * s, 4 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(15 * s, 13 * s, 2 * s, 4 * s);

  // Cruz solar en oro en el centro de la rodillera
  ctx.fillStyle = '#d97706';
  ctx.fillRect(14 * s, 12 * s, 4 * s, 6 * s);
  ctx.fillRect(12 * s, 14 * s, 8 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 14 * s, 2 * s, 2 * s);

  // 3. Greba de espinilla (Cnémida) en acero laminado
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 19 * s, 28 * s, 9 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(3 * s, 19 * s, 26 * s, 8 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(5 * s, 20 * s, 22 * s, 7 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(8 * s, 20 * s, 16 * s, 7 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(13 * s, 20 * s, 6 * s, 7 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(15 * s, 20 * s, 2 * s, 7 * s);

  // Remaches plateados en los flancos de la greba
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(5 * s, 21 * s, 2 * s, 2 * s);
  ctx.fillRect(25 * s, 21 * s, 2 * s, 2 * s);
  ctx.fillRect(5 * s, 25 * s, 2 * s, 2 * s);
  ctx.fillRect(25 * s, 25 * s, 2 * s, 2 * s);

  // 4. Sabatón / Escarpe laminado y suela Sumi
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 28 * s, 30 * s, 4 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(2 * s, 28 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(4 * s, 29 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(2 * s, 29 * s, 28 * s, 1 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 31 * s, 30 * s, 1 * s);
}

/**
 * SVG canónico del Costado Lateral de la Pierna del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Placas laterales de acero con correas de cuero y hebillas doradas, aleta exterior de rodillera (fan-plate) con ribete de oro, greba lateral y sabatón.
 */
export const PALADIN_LEG_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="11" fill="#7f1d1d"/><rect x="2" y="1" width="28" height="10" fill="#991b1b"/><rect x="4" y="2" width="24" height="8" fill="#52525b"/><rect x="6" y="2" width="20" height="8" fill="#71717a"/><rect x="2" y="4" width="28" height="3" fill="#0c0a09"/><rect x="3" y="5" width="26" height="1" fill="#451a03"/><rect x="13" y="4" width="6" height="3" fill="#d97706"/><rect x="14" y="5" width="4" height="1" fill="#fef08a"/><rect x="2" y="11" width="28" height="8" fill="#0c0a09"/><rect x="3" y="11" width="26" height="8" fill="#52525b"/><rect x="5" y="12" width="22" height="6" fill="#71717a"/><rect x="8" y="12" width="16" height="6" fill="#a1a1aa"/><rect x="10" y="13" width="12" height="4" fill="#cbd5e1"/><rect x="13" y="11" width="6" height="8" fill="#d97706"/><rect x="14" y="12" width="4" height="6" fill="#fef08a"/><rect x="15" y="14" width="2" height="2" fill="#f8fafc"/><rect x="2" y="19" width="28" height="9" fill="#0c0a09"/><rect x="3" y="19" width="26" height="8" fill="#52525b"/><rect x="5" y="20" width="22" height="7" fill="#71717a"/><rect x="8" y="20" width="16" height="7" fill="#a1a1aa"/><rect x="2" y="22" width="28" height="3" fill="#0c0a09"/><rect x="3" y="23" width="26" height="1" fill="#451a03"/><rect x="13" y="22" width="6" height="3" fill="#d97706"/><rect x="14" y="23" width="4" height="1" fill="#fef08a"/><rect x="1" y="28" width="30" height="4" fill="#0c0a09"/><rect x="2" y="28" width="28" height="3" fill="#52525b"/><rect x="4" y="29" width="24" height="2" fill="#71717a"/><rect x="2" y="29" width="28" height="1" fill="#d97706"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const PALADIN_LEG_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_LEG_SIDE_BODY}</svg>`;

export function drawPaladinLegSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Muslo exterior con tela carmesí y placa de acero
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 11 * s);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 10 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(rx(4, 24), 2 * s, 24 * s, 8 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(rx(6, 20), 2 * s, 20 * s, 8 * s);

  // Correa de cuero del muslo con hebilla dorada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 4 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(3, 26), 5 * s, 26 * s, 1 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(13, 6), 4 * s, 6 * s, 3 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(14, 4), 5 * s, 4 * s, 1 * s);

  // 2. Aleta lateral de la rodillera (fan-plate)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 11 * s, 28 * s, 8 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(rx(3, 26), 11 * s, 26 * s, 8 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(rx(5, 22), 12 * s, 22 * s, 6 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(rx(8, 16), 12 * s, 16 * s, 6 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(rx(10, 12), 13 * s, 12 * s, 4 * s);

  // Relieve de fan-plate con ribete de oro y gema central
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(13, 6), 11 * s, 6 * s, 8 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(14, 4), 12 * s, 4 * s, 6 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(rx(15, 2), 14 * s, 2 * s, 2 * s);

  // 3. Greba lateral de acero
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 19 * s, 28 * s, 9 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(rx(3, 26), 19 * s, 26 * s, 8 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(rx(5, 22), 20 * s, 22 * s, 7 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(rx(8, 16), 20 * s, 16 * s, 7 * s);

  // Correa inferior de la greba con hebilla dorada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 22 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(3, 26), 23 * s, 26 * s, 1 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(13, 6), 22 * s, 6 * s, 3 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(14, 4), 23 * s, 4 * s, 1 * s);

  // 4. Sabatón lateral y suela Sumi
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 28 * s, 30 * s, 4 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(rx(2, 28), 28 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(rx(4, 24), 29 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(2, 28), 29 * s, 28 * s, 1 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 31 * s, 30 * s, 1 * s);
}

/**
 * SVG canónico del Costado Interior de la Pierna del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Penumbra templaria (#18181b, #27272a), pliegues carmesí profundos (#450a0a, #7f1d1d), cota de malla y costura interior de cuero.
 */
export const PALADIN_LEG_INNER_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="30" fill="#18181b"/><rect x="2" y="1" width="28" height="29" fill="#27272a"/><rect x="3" y="2" width="8" height="27" fill="#450a0a"/><rect x="4" y="3" width="6" height="25" fill="#7f1d1d"/><g fill="#52525b"><rect x="14" y="4" width="2" height="2"/><rect x="19" y="4" width="2" height="2"/><rect x="24" y="4" width="2" height="2"/><rect x="14" y="11" width="2" height="2"/><rect x="19" y="11" width="2" height="2"/><rect x="24" y="11" width="2" height="2"/><rect x="14" y="18" width="2" height="2"/><rect x="19" y="18" width="2" height="2"/><rect x="24" y="18" width="2" height="2"/><rect x="14" y="24" width="2" height="2"/><rect x="19" y="24" width="2" height="2"/><rect x="24" y="24" width="2" height="2"/></g><rect x="11" y="2" width="4" height="28" fill="#0c0a09"/><rect x="12" y="2" width="2" height="28" fill="#451a03"/><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="3" y="30" width="26" height="2" fill="#3f3f46"/>`;

export const PALADIN_LEG_INNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_LEG_INNER_BODY}</svg>`;

export function drawPaladinLegInnerToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Penumbra interior templaria
  ctx.fillStyle = '#18181b';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 30 * s);
  ctx.fillStyle = '#27272a';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 29 * s);

  // Pliegues carmesí profundos
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(rx(3, 8), 2 * s, 8 * s, 27 * s);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(rx(4, 6), 3 * s, 6 * s, 25 * s);

  // Eslabones de cota de malla interior
  ctx.fillStyle = '#52525b';
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
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(rx(3, 26), 30 * s, 26 * s, 2 * s);
}

/**
 * SVG canónico de la Espalda de la Pierna del Paladín (32x32) en estilo Sumi-e Pixel Art:
 * - Muslo posterior con calzones carmesí acolchados (#7f1d1d, #991b1b), hueco poplíteo con doble correa templaria (#451a03, #d97706), greba posterior articulada de acero y talonera reforzada.
 */
export const PALADIN_LEG_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="11" fill="#7f1d1d"/><rect x="2" y="1" width="28" height="10" fill="#991b1b"/><rect x="5" y="2" width="8" height="8" fill="#b91c1c"/><rect x="19" y="2" width="8" height="8" fill="#450a0a"/><rect x="14" y="1" width="4" height="11" fill="#0c0a09"/><rect x="15" y="1" width="2" height="10" fill="#450a0a"/><rect x="1" y="12" width="30" height="8" fill="#0c0a09"/><rect x="2" y="13" width="28" height="6" fill="#27272a"/><rect x="2" y="14" width="28" height="2" fill="#451a03"/><rect x="3" y="14" width="26" height="2" fill="#78350f"/><rect x="13" y="14" width="6" height="2" fill="#d97706"/><rect x="14" y="14" width="4" height="1" fill="#fef08a"/><rect x="2" y="17" width="28" height="2" fill="#451a03"/><rect x="3" y="17" width="26" height="2" fill="#78350f"/><rect x="13" y="17" width="6" height="2" fill="#d97706"/><rect x="14" y="17" width="4" height="1" fill="#fef08a"/><rect x="2" y="20" width="28" height="8" fill="#0c0a09"/><rect x="3" y="20" width="26" height="7" fill="#52525b"/><rect x="5" y="21" width="22" height="5" fill="#71717a"/><rect x="8" y="21" width="16" height="4" fill="#a1a1aa"/><rect x="14" y="20" width="4" height="7" fill="#0c0a09"/><rect x="15" y="20" width="2" height="7" fill="#cbd5e1"/><rect x="1" y="28" width="30" height="4" fill="#0c0a09"/><rect x="2" y="28" width="28" height="3" fill="#52525b"/><rect x="4" y="29" width="24" height="2" fill="#71717a"/><rect x="2" y="29" width="28" height="1" fill="#d97706"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const PALADIN_LEG_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${PALADIN_LEG_BACK_BODY}</svg>`;

export function drawPaladinLegBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Muslo posterior con calzones carmesí acolchados
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 11 * s);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 10 * s);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(5 * s, 2 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(19 * s, 2 * s, 8 * s, 8 * s);

  // Costura central vertical
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 1 * s, 4 * s, 11 * s);
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(15 * s, 1 * s, 2 * s, 10 * s);

  // 2. Hueco poplíteo con correas dobles templarias y hebillas de oro
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 12 * s, 30 * s, 8 * s);
  ctx.fillStyle = '#27272a';
  ctx.fillRect(2 * s, 13 * s, 28 * s, 6 * s);

  // Correa 1
  ctx.fillStyle = '#451a03';
  ctx.fillRect(2 * s, 14 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(3 * s, 14 * s, 26 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(13 * s, 14 * s, 6 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(14 * s, 14 * s, 4 * s, 1 * s);

  // Correa 2
  ctx.fillStyle = '#451a03';
  ctx.fillRect(2 * s, 17 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(3 * s, 17 * s, 26 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(13 * s, 17 * s, 6 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(14 * s, 17 * s, 4 * s, 1 * s);

  // 3. Gemelo / Greba posterior articulada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 20 * s, 28 * s, 8 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(3 * s, 20 * s, 26 * s, 7 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(5 * s, 21 * s, 22 * s, 5 * s);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(8 * s, 21 * s, 16 * s, 4 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 20 * s, 4 * s, 7 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(15 * s, 20 * s, 2 * s, 7 * s);

  // 4. Talonera de acero reforzada con ribete de oro y suela Sumi
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 28 * s, 30 * s, 4 * s);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(2 * s, 28 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(4 * s, 29 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(2 * s, 29 * s, 28 * s, 1 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 31 * s, 30 * s, 1 * s);
}

export const paladinPortrait = {
    id: 'paladin',
    icon: 'avatar_paladin',
    viewBox: '0 0 32 32',
    svg: PALADIN_PORTRAIT_SVG,
    body: PALADIN_PORTRAIT_BODY,
    sideSvg: PALADIN_SIDE_SVG,
    sideBody: PALADIN_SIDE_BODY,
    backSvg: PALADIN_BACK_SVG,
    backBody: PALADIN_BACK_BODY,
    chestSvg: PALADIN_CHEST_SVG,
    chestBody: PALADIN_CHEST_BODY,
    torsoSideSvg: PALADIN_TORSO_SIDE_SVG,
    torsoSideBody: PALADIN_TORSO_SIDE_BODY,
    torsoBackSvg: PALADIN_TORSO_BACK_SVG,
    torsoBackBody: PALADIN_TORSO_BACK_BODY,
    armFrontSvg: PALADIN_ARM_FRONT_SVG,
    armFrontBody: PALADIN_ARM_FRONT_BODY,
    armSideSvg: PALADIN_ARM_SIDE_SVG,
    armSideBody: PALADIN_ARM_SIDE_BODY,
    armInnerSvg: PALADIN_ARM_INNER_SVG,
    armInnerBody: PALADIN_ARM_INNER_BODY,
    armBackSvg: PALADIN_ARM_BACK_SVG,
    armBackBody: PALADIN_ARM_BACK_BODY,
    legFrontSvg: PALADIN_LEG_FRONT_SVG,
    legFrontBody: PALADIN_LEG_FRONT_BODY,
    legSideSvg: PALADIN_LEG_SIDE_SVG,
    legSideBody: PALADIN_LEG_SIDE_BODY,
    legInnerSvg: PALADIN_LEG_INNER_SVG,
    legInnerBody: PALADIN_LEG_INNER_BODY,
    legBackSvg: PALADIN_LEG_BACK_SVG,
    legBackBody: PALADIN_LEG_BACK_BODY,
    drawToCanvas: drawPaladinPortraitToCanvas,
    drawSideToCanvas: drawPaladinSideToCanvas,
    drawBackToCanvas: drawPaladinBackToCanvas,
    drawChestToCanvas: drawPaladinChestToCanvas,
    drawTorsoSideToCanvas: drawPaladinTorsoSideToCanvas,
    drawTorsoBackToCanvas: drawPaladinTorsoBackToCanvas,
    drawArmFrontToCanvas: drawPaladinArmFrontToCanvas,
    drawArmSideToCanvas: drawPaladinArmSideToCanvas,
    drawArmInnerToCanvas: drawPaladinArmInnerToCanvas,
    drawArmBackToCanvas: drawPaladinArmBackToCanvas,
    drawLegFrontToCanvas: drawPaladinLegFrontToCanvas,
    drawLegSideToCanvas: drawPaladinLegSideToCanvas,
    drawLegInnerToCanvas: drawPaladinLegInnerToCanvas,
    drawLegBackToCanvas: drawPaladinLegBackToCanvas,
};
