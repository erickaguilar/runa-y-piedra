// src/heroes/portraits/adventurer.js
// Arte Sumi-e Pixel Art del heroe Adventurer: datos SVG (canonicos, verificados por tests)
// y funciones de dibujo imperativo a canvas (usadas por las texturas 3D).
// Generado al trocear src/heroes/heroPortraits.js (Fase 6). Sin cambios de comportamiento.

/**
 * SVG canónico del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Fondo base pergamino Washi (#d6cfc2) y contorno de tinta Sumi (#0c0a09).
 * - Cabello castaño despeinado (#2e1909, #451a03, #78350f) y patillas de explorador.
 * - Cejas expresivas y ojos azul cian de brújula (#0369a1, #38bdf8) con destello especular.
 * - Detalle de carácter: tirita/parche de cruz en mejilla derecha (#78716c, #f4efe4, #e7ded0) y polvo de mazmorra en la izquierda.
 * - Boca valiente con sonrisa confiada (#7f1d1d, #f4efe4) y oclusión inferior para conectar con la bufanda.
 */
export const ADVENTURER_PORTRAIT_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="10" width="3" height="21" fill="#bfb6a6"/><rect x="28" y="10" width="3" height="21" fill="#a8a29e"/><rect x="1" y="27" width="30" height="4" fill="#a8a29e"/><rect x="3" y="29" width="26" height="2" fill="#78716c"/><path d="M1,1 H31 V10 H28 V8 H25 V10 H21 V7 H17 V10 H13 V8 H8 V10 H4 V12 H1 Z" fill="#0c0a09"/><path d="M1,1 H31 V8 H28 V6 H25 V8 H21 V5 H17 V8 H13 V6 H8 V8 H4 V10 H1 Z" fill="#2e1909"/><path d="M2,1 H30 V6 H26 V7 H22 V4 H16 V7 H12 V5 H7 V7 H3 V8 H2 Z" fill="#451a03"/><g fill="#78350f"><rect x="4" y="2" width="5" height="2"/><rect x="12" y="2" width="6" height="1"/><rect x="22" y="2" width="5" height="2"/></g><rect x="1" y="10" width="2" height="5" fill="#0c0a09"/><rect x="2" y="10" width="1" height="4" fill="#2e1909"/><rect x="29" y="10" width="2" height="5" fill="#0c0a09"/><rect x="29" y="10" width="1" height="4" fill="#2e1909"/><rect x="4" y="9" width="24" height="1" fill="#a8a29e"/><path d="M6,11 H12 V13 H6 Z" fill="#0c0a09"/><path d="M20,11 H26 V13 H20 Z" fill="#0c0a09"/><rect x="6" y="11" width="5" height="1" fill="#451a03"/><rect x="21" y="11" width="5" height="1" fill="#451a03"/><rect x="6" y="14" width="5" height="5" fill="#0c0a09"/><rect x="21" y="14" width="5" height="5" fill="#0c0a09"/><rect x="7" y="15" width="4" height="4" fill="#f4efe4"/><rect x="21" y="15" width="4" height="4" fill="#f4efe4"/><rect x="8" y="15" width="3" height="4" fill="#0369a1"/><rect x="22" y="15" width="3" height="4" fill="#0369a1"/><rect x="8" y="16" width="2" height="3" fill="#38bdf8"/><rect x="22" y="16" width="2" height="3" fill="#38bdf8"/><rect x="7" y="15" width="2" height="2" fill="#ffffff"/><rect x="21" y="15" width="2" height="2" fill="#ffffff"/><rect x="15" y="16" width="2" height="4" fill="#bfb6a6"/><rect x="14" y="19" width="4" height="2" fill="#a8a29e"/><rect x="15" y="20" width="2" height="1" fill="#78716c"/><rect x="22" y="20" width="6" height="3" fill="#78716c"/><rect x="23" y="20" width="4" height="2" fill="#f4efe4"/><rect x="24" y="20" width="2" height="2" fill="#e7ded0"/><rect x="5" y="20" width="3" height="2" fill="#a8a29e"/><path d="M11,23 H13 V24 H20 V26 H12 V25 H11 Z" fill="#0c0a09"/><rect x="12" y="24" width="7" height="1" fill="#7f1d1d"/><rect x="12" y="24" width="2" height="1" fill="#f4efe4"/><rect x="14" y="27" width="4" height="1" fill="#78716c"/>`;

export const ADVENTURER_PORTRAIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_PORTRAIT_BODY}</svg>`;

/**
 * Renderizado procedural síncrono píxel a píxel del Rostro del Aventurero sobre Canvas 2D.
 */
export function drawAdventurerPortraitToCanvas(ctx, size = 32) {
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

  // Sombras laterales de pómulos y oclusión inferior
  ctx.fillStyle = '#bfb6a6';
  ctx.fillRect(1 * s, 10 * s, 3 * s, 21 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(28 * s, 10 * s, 3 * s, 21 * s);
  ctx.fillRect(1 * s, 27 * s, 30 * s, 4 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(3 * s, 29 * s, 26 * s, 2 * s);

  // Cabello castaño despeinado: sombra de tinta negra
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 7 * s);
  ctx.fillRect(1 * s, 8 * s, 3 * s, 4 * s);
  ctx.fillRect(4 * s, 8 * s, 24 * s, 2 * s);
  ctx.fillRect(28 * s, 8 * s, 3 * s, 2 * s);

  // Masa principal castaño oscuro (#2e1909)
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 5 * s);
  ctx.fillRect(1 * s, 6 * s, 3 * s, 4 * s);
  ctx.fillRect(4 * s, 6 * s, 24 * s, 2 * s);

  // Masa castaño medio (#451a03)
  ctx.fillStyle = '#451a03';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 4 * s);
  ctx.fillRect(3 * s, 5 * s, 23 * s, 2 * s);

  // Reflejos en el cabello (#78350f)
  ctx.fillStyle = '#78350f';
  ctx.fillRect(4 * s, 2 * s, 5 * s, 2 * s);
  ctx.fillRect(12 * s, 2 * s, 6 * s, 1 * s);
  ctx.fillRect(22 * s, 2 * s, 5 * s, 2 * s);

  // Patillas
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 10 * s, 2 * s, 5 * s);
  ctx.fillRect(29 * s, 10 * s, 2 * s, 5 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(2 * s, 10 * s, 1 * s, 4 * s);
  ctx.fillRect(29 * s, 10 * s, 1 * s, 4 * s);

  // Sombra frente
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(4 * s, 9 * s, 24 * s, 1 * s);

  // Cejas expresivas
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(6 * s, 11 * s, 6 * s, 2 * s);
  ctx.fillRect(20 * s, 11 * s, 6 * s, 2 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(6 * s, 11 * s, 5 * s, 1 * s);
  ctx.fillRect(21 * s, 11 * s, 5 * s, 1 * s);

  // Ojos de aventurero (tinta)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(6 * s, 14 * s, 5 * s, 5 * s);
  ctx.fillRect(21 * s, 14 * s, 5 * s, 5 * s);

  // Esclerótica
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(7 * s, 15 * s, 4 * s, 4 * s);
  ctx.fillRect(21 * s, 15 * s, 4 * s, 4 * s);

  // Iris azul cian
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(8 * s, 15 * s, 3 * s, 4 * s);
  ctx.fillRect(22 * s, 15 * s, 3 * s, 4 * s);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(8 * s, 16 * s, 2 * s, 3 * s);
  ctx.fillRect(22 * s, 16 * s, 2 * s, 3 * s);

  // Destello blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7 * s, 15 * s, 2 * s, 2 * s);
  ctx.fillRect(21 * s, 15 * s, 2 * s, 2 * s);

  // Nariz
  ctx.fillStyle = '#bfb6a6';
  ctx.fillRect(15 * s, 16 * s, 2 * s, 4 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(14 * s, 19 * s, 4 * s, 2 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(15 * s, 20 * s, 2 * s, 1 * s);

  // Tirita en mejilla derecha
  ctx.fillStyle = '#78716c';
  ctx.fillRect(22 * s, 20 * s, 6 * s, 3 * s);
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(23 * s, 20 * s, 4 * s, 2 * s);
  ctx.fillStyle = '#e7ded0';
  ctx.fillRect(24 * s, 20 * s, 2 * s, 2 * s);

  // Polvo / rubor en mejilla izquierda
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(5 * s, 20 * s, 3 * s, 2 * s);

  // Boca valiente con sonrisa
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(11 * s, 23 * s, 2 * s, 2 * s);
  ctx.fillRect(13 * s, 24 * s, 7 * s, 2 * s);
  ctx.fillRect(12 * s, 25 * s, 1 * s, 1 * s);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(12 * s, 24 * s, 7 * s, 1 * s);
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(12 * s, 24 * s, 2 * s, 1 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(14 * s, 27 * s, 4 * s, 1 * s);
}

/**
 * SVG canónico del Torso / Pecho del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Túnica de expedición azul acero/cian (#0c4a6e, #0369a1, #0284c7, #38bdf8) con borde de tinta Sumi (#0c0a09).
 * - Arnés de cuero cruzado (#451a03, #78350f) y medallón de brújula central (#b45309, #fef08a).
 */
export const ADVENTURER_CHEST_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#0c4a6e"/><rect x="2" y="2" width="28" height="23" fill="#0369a1"/><rect x="3" y="2" width="5" height="22" fill="#0284c7"/><rect x="4" y="3" width="2" height="18" fill="#38bdf8"/><rect x="25" y="2" width="5" height="22" fill="#082f49"/><rect x="4" y="1" width="24" height="3" fill="#451a03"/><rect x="6" y="3" width="3" height="22" fill="#451a03"/><rect x="23" y="3" width="3" height="22" fill="#451a03"/><rect x="7" y="3" width="1" height="22" fill="#78350f"/><rect x="23" y="3" width="1" height="22" fill="#78350f"/><rect x="12" y="8" width="8" height="8" fill="#0c0a09"/><rect x="13" y="9" width="6" height="6" fill="#f59e0b"/><rect x="14" y="10" width="4" height="4" fill="#fef08a"/><rect x="1" y="26" width="30" height="5" fill="#451a03"/><rect x="13" y="26" width="6" height="5" fill="#d97706"/>`;

export const ADVENTURER_CHEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_CHEST_BODY}</svg>`;

export function drawAdventurerChestToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Túnica azul expedición con pliegues
  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(2 * s, 2 * s, 28 * s, 23 * s);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(3 * s, 2 * s, 5 * s, 22 * s);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(4 * s, 3 * s, 2 * s, 18 * s);
  ctx.fillStyle = '#082f49';
  ctx.fillRect(25 * s, 2 * s, 5 * s, 22 * s);

  // Sombra de bufanda superior y correas de mochila frontales
  ctx.fillStyle = '#451a03';
  ctx.fillRect(4 * s, 1 * s, 24 * s, 3 * s);
  ctx.fillRect(6 * s, 3 * s, 3 * s, 22 * s);
  ctx.fillRect(23 * s, 3 * s, 3 * s, 22 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(7 * s, 3 * s, 1 * s, 22 * s);
  ctx.fillRect(23 * s, 3 * s, 1 * s, 22 * s);

  // Engaste de la brújula dorada en el pecho (bajo el micro-cubo 3D)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(12 * s, 8 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(13 * s, 9 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(14 * s, 10 * s, 4 * s, 4 * s);

  // Cinturón utilitario
  ctx.fillStyle = '#451a03';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(13 * s, 26 * s, 6 * s, 5 * s);
}

/**
 * SVG canónico del Perfil Lateral de la Cabeza del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Cabello castaño despeinado (#2e1909, #451a03, #78350f) con patilla de explorador y mechones escalonados hacia la nuca.
 * - Oreja estilizada Sumi-e en piel Washi (#d6cfc2, #a8a29e) y borde superior del pañuelo/bufanda de viaje en la base (#451a03, #78350f).
 */
export const ADVENTURER_SIDE_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="10" width="3" height="17" fill="#a8a29e"/><rect x="1" y="26" width="30" height="5" fill="#a8a29e"/><rect x="3" y="28" width="26" height="3" fill="#451a03"/><rect x="5" y="28" width="22" height="1" fill="#78350f"/><rect x="1" y="1" width="30" height="8" fill="#0c0a09"/><rect x="6" y="9" width="4" height="6" fill="#0c0a09"/><rect x="15" y="9" width="16" height="14" fill="#0c0a09"/><rect x="1" y="1" width="30" height="6" fill="#2e1909"/><rect x="7" y="9" width="2" height="5" fill="#2e1909"/><rect x="16" y="9" width="15" height="13" fill="#2e1909"/><rect x="2" y="1" width="28" height="4" fill="#451a03"/><rect x="18" y="8" width="12" height="11" fill="#451a03"/><g fill="#78350f"><rect x="4" y="2" width="22" height="2"/><rect x="20" y="9" width="2" height="8"/><rect x="26" y="9" width="2" height="8"/></g><rect x="10" y="14" width="6" height="7" fill="#0c0a09"/><rect x="11" y="15" width="4" height="5" fill="#d6cfc2"/><rect x="12" y="16" width="2" height="3" fill="#78716c"/>`;

export const ADVENTURER_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_SIDE_BODY}</svg>`;

export function drawAdventurerSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  // Sombra frontal y borde de bufanda en la base
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(rx(1, 3), 10 * s, 3 * s, 17 * s);
  ctx.fillRect(rx(1, 30), 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(3, 26), 28 * s, 26 * s, 3 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(5, 22), 28 * s, 22 * s, 1 * s);

  // Cabello castaño despeinado (parte superior, patilla y nuca)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 8 * s);
  ctx.fillRect(rx(6, 4), 9 * s, 4 * s, 6 * s);
  ctx.fillRect(rx(15, 16), 9 * s, 16 * s, 14 * s);

  ctx.fillStyle = '#2e1909';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 6 * s);
  ctx.fillRect(rx(7, 2), 9 * s, 2 * s, 5 * s);
  ctx.fillRect(rx(16, 15), 9 * s, 15 * s, 13 * s);

  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 4 * s);
  ctx.fillRect(rx(18, 12), 8 * s, 12 * s, 11 * s);

  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(4, 22), 2 * s, 22 * s, 2 * s);
  ctx.fillRect(rx(20, 2), 9 * s, 2 * s, 8 * s);
  ctx.fillRect(rx(26, 2), 9 * s, 2 * s, 8 * s);

  // Oreja estilizada Sumi-e (x=10..15, y=14..20)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(10, 6), 14 * s, 6 * s, 7 * s);
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(rx(11, 4), 15 * s, 4 * s, 5 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(12, 2), 16 * s, 2 * s, 3 * s);
}

/**
 * SVG canónico de la Nuca / Parte Trasera de la Cabeza del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Cabello castaño despeinado con mechones escalonados en la nuca (#0c0a09, #2e1909, #451a03, #78350f) y pañuelo/bufanda de viaje en la base.
 */
export const ADVENTURER_BACK_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="22" width="30" height="9" fill="#a8a29e"/><rect x="1" y="27" width="30" height="4" fill="#451a03"/><rect x="3" y="27" width="26" height="1" fill="#78350f"/><rect x="1" y="1" width="30" height="22" fill="#0c0a09"/><rect x="2" y="1" width="28" height="20" fill="#2e1909"/><rect x="3" y="2" width="26" height="16" fill="#451a03"/><g fill="#78350f"><rect x="5" y="2" width="22" height="2"/><rect x="6" y="6" width="3" height="11"/><rect x="14" y="6" width="4" height="11"/><rect x="23" y="6" width="3" height="11"/></g><g fill="#0c0a09"><rect x="10" y="6" width="2" height="15"/><rect x="20" y="6" width="2" height="15"/></g>`;

export const ADVENTURER_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_BACK_BODY}</svg>`;

export function drawAdventurerBackToCanvas(ctx, size = 32) {
  const s = size / 32;

  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  // Nuca sombreada y nudo trasero de la bufanda de viaje
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(1 * s, 22 * s, 30 * s, 9 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(1 * s, 27 * s, 30 * s, 4 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(3 * s, 27 * s, 26 * s, 1 * s);

  // Cabello castaño despeinado en la parte trasera con surcos Kasure
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 22 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 20 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(3 * s, 2 * s, 26 * s, 16 * s);

  ctx.fillStyle = '#78350f';
  ctx.fillRect(5 * s, 2 * s, 22 * s, 2 * s);
  ctx.fillRect(6 * s, 6 * s, 3 * s, 11 * s);
  ctx.fillRect(14 * s, 6 * s, 4 * s, 11 * s);
  ctx.fillRect(23 * s, 6 * s, 3 * s, 11 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(10 * s, 6 * s, 2 * s, 15 * s);
  ctx.fillRect(20 * s, 6 * s, 2 * s, 15 * s);
}

/**
 * SVG canónico del Costado Lateral del Torso del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Túnica azul expedición (#0c4a6e, #0369a1, #0284c7, #082f49), esclavina superior de cuero, correa lateral hacia la mochila 3D y cinturón con presilla.
 */
export const ADVENTURER_TORSO_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#0c4a6e"/><rect x="2" y="2" width="28" height="23" fill="#0369a1"/><rect x="2" y="2" width="6" height="22" fill="#0284c7"/><rect x="24" y="2" width="6" height="22" fill="#082f49"/><rect x="2" y="1" width="28" height="3" fill="#451a03"/><rect x="1" y="12" width="30" height="5" fill="#0c0a09"/><rect x="2" y="13" width="28" height="3" fill="#451a03"/><rect x="3" y="13" width="26" height="1" fill="#78350f"/><rect x="13" y="12" width="6" height="5" fill="#d97706"/><rect x="14" y="13" width="4" height="3" fill="#fef08a"/><rect x="1" y="26" width="30" height="5" fill="#451a03"/><rect x="12" y="26" width="8" height="5" fill="#d97706"/>`;

export const ADVENTURER_TORSO_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_TORSO_SIDE_BODY}</svg>`;

export function drawAdventurerTorsoSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(rx(2, 28), 2 * s, 28 * s, 23 * s);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(rx(2, 6), 2 * s, 6 * s, 22 * s);
  ctx.fillStyle = '#082f49';
  ctx.fillRect(rx(24, 6), 2 * s, 6 * s, 22 * s);

  // Sombra de esclavina / capucha de hombro superior
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 3 * s);

  // Correa tensora lateral que conecta el arnés del pecho con la mochila 3D
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 12 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(2, 28), 13 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(3, 26), 13 * s, 26 * s, 1 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(13, 6), 12 * s, 6 * s, 5 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(14, 4), 13 * s, 4 * s, 3 * s);

  // Cinturón utilitario lateral
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(1, 30), 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(12, 8), 26 * s, 8 * s, 5 * s);
}

/**
 * SVG canónico de la Espalda del Torso del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Dorso de la túnica azul expedición (#0c4a6e, #0369a1), esclavina superior de cuero y bastidor con correas y argollas de latón bajo la mochila 3D.
 */
export const ADVENTURER_TORSO_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#0c4a6e"/><rect x="2" y="2" width="28" height="23" fill="#0369a1"/><rect x="2" y="2" width="4" height="22" fill="#082f49"/><rect x="26" y="2" width="4" height="22" fill="#082f49"/><rect x="2" y="1" width="28" height="4" fill="#451a03"/><rect x="6" y="4" width="4" height="21" fill="#0c0a09"/><rect x="22" y="4" width="4" height="21" fill="#0c0a09"/><rect x="7" y="4" width="2" height="21" fill="#451a03"/><rect x="23" y="4" width="2" height="21" fill="#451a03"/><rect x="6" y="12" width="20" height="4" fill="#0c0a09"/><rect x="7" y="13" width="18" height="2" fill="#78350f"/><rect x="13" y="11" width="6" height="6" fill="#f59e0b"/><rect x="14" y="12" width="4" height="4" fill="#fef08a"/><rect x="1" y="26" width="30" height="5" fill="#451a03"/><rect x="13" y="26" width="6" height="5" fill="#d97706"/>`;

export const ADVENTURER_TORSO_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_TORSO_BACK_BODY}</svg>`;

export function drawAdventurerTorsoBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(2 * s, 2 * s, 28 * s, 23 * s);
  ctx.fillStyle = '#082f49';
  ctx.fillRect(2 * s, 2 * s, 4 * s, 22 * s);
  ctx.fillRect(26 * s, 2 * s, 4 * s, 22 * s);

  // Esclavina superior y bastidor de correas de la mochila 3D
  ctx.fillStyle = '#451a03';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 4 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(6 * s, 4 * s, 4 * s, 21 * s);
  ctx.fillRect(22 * s, 4 * s, 4 * s, 21 * s);
  ctx.fillRect(6 * s, 12 * s, 20 * s, 4 * s);

  ctx.fillStyle = '#451a03';
  ctx.fillRect(7 * s, 4 * s, 2 * s, 21 * s);
  ctx.fillRect(23 * s, 4 * s, 2 * s, 21 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(7 * s, 13 * s, 18 * s, 2 * s);

  // Herraje central de latón del bastidor
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(13 * s, 11 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(14 * s, 12 * s, 4 * s, 4 * s);

  // Cinturón utilitario trasero
  ctx.fillStyle = '#451a03';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(13 * s, 26 * s, 6 * s, 5 * s);
}

/**
 * SVG canónico del Frente del Brazo del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Manga de la túnica de expedición azul zafiro (#0c4a6e, #0369a1, #0284c7), pliegues en codo, brazalete de cuero con tiras de lino cruzadas (#cbd5e1, #f8fafc) y hebillas de latón.
 */
export const ADVENTURER_ARM_FRONT_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="15" fill="#0c4a6e"/><rect x="2" y="1" width="28" height="14" fill="#0369a1"/><rect x="4" y="2" width="6" height="12" fill="#0284c7"/><rect x="14" y="2" width="4" height="12" fill="#38bdf8"/><rect x="22" y="2" width="6" height="12" fill="#082f49"/><rect x="2" y="1" width="28" height="3" fill="#451a03"/><rect x="4" y="1" width="24" height="2" fill="#78350f"/><rect x="1" y="15" width="30" height="2" fill="#0c0a09"/><rect x="3" y="15" width="26" height="2" fill="#78350f"/><rect x="14" y="14" width="4" height="4" fill="#d97706"/><rect x="15" y="15" width="2" height="2" fill="#fef08a"/><rect x="2" y="17" width="28" height="13" fill="#0c0a09"/><rect x="3" y="17" width="26" height="12" fill="#451a03"/><rect x="5" y="18" width="22" height="10" fill="#78350f"/><rect x="7" y="18" width="18" height="10" fill="#b45309"/><g fill="#cbd5e1"><path d="M7,19 L25,27 H23 L5,19 Z"/><path d="M25,19 L7,27 H9 L27,19 Z"/></g><g fill="#f8fafc"><path d="M8,19 L24,27 H23 L7,19 Z"/><path d="M24,19 L8,27 H9 L25,19 Z"/></g><rect x="6" y="20" width="2" height="2" fill="#fef08a"/><rect x="24" y="20" width="2" height="2" fill="#fef08a"/><rect x="6" y="25" width="2" height="2" fill="#fef08a"/><rect x="24" y="25" width="2" height="2" fill="#fef08a"/><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="3" y="30" width="26" height="2" fill="#cbd5e1"/><rect x="5" y="30" width="22" height="1" fill="#f8fafc"/>`;

export const ADVENTURER_ARM_FRONT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_ARM_FRONT_BODY}</svg>`;

export function drawAdventurerArmFrontToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Manga azul de expedición
  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 15 * s);
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 14 * s);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(4 * s, 2 * s, 6 * s, 12 * s);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(14 * s, 2 * s, 4 * s, 12 * s);
  ctx.fillStyle = '#082f49';
  ctx.fillRect(22 * s, 2 * s, 6 * s, 12 * s);

  // Parche de cuero en hombro
  ctx.fillStyle = '#451a03';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(4 * s, 1 * s, 24 * s, 2 * s);

  // Cinta de ajuste en el codo con hebilla
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 15 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(3 * s, 15 * s, 26 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(14 * s, 14 * s, 4 * s, 4 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 15 * s, 2 * s, 2 * s);

  // Brazalete de cuero de viaje
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 17 * s, 28 * s, 13 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(3 * s, 17 * s, 26 * s, 12 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(5 * s, 18 * s, 22 * s, 10 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(7 * s, 18 * s, 18 * s, 10 * s);

  // Vendas / cordajes de lino cruzados
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect((7 + 2 * i) * s, (19 + i) * s, 2 * s, 1 * s);
    ctx.fillRect((23 - 2 * i) * s, (19 + i) * s, 2 * s, 1 * s);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect((8 + 2 * i) * s, (19 + i) * s, 1 * s, 1 * s);
    ctx.fillRect((24 - 2 * i) * s, (19 + i) * s, 1 * s, 1 * s);
  }

  // Remaches de latón
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(6 * s, 20 * s, 2 * s, 2 * s);
  ctx.fillRect(24 * s, 20 * s, 2 * s, 2 * s);
  ctx.fillRect(6 * s, 25 * s, 2 * s, 2 * s);
  ctx.fillRect(24 * s, 25 * s, 2 * s, 2 * s);

  // Muñequera de lino
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 29 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(3 * s, 30 * s, 26 * s, 2 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(5 * s, 30 * s, 22 * s, 1 * s);
}

/**
 * SVG canónico del Costado Exterior del Brazo del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Manga azul con emblema de la Rosa de los Vientos en el hombro (#d97706, #fef08a), codo acolchado y brazalete con 2 correas de cuero y hebillas de latón.
 */
export const ADVENTURER_ARM_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="15" fill="#0c4a6e"/><rect x="2" y="1" width="28" height="14" fill="#0369a1"/><rect x="4" y="2" width="24" height="12" fill="#0284c7"/><rect x="2" y="1" width="28" height="3" fill="#451a03"/><rect x="11" y="3" width="10" height="10" fill="#0c0a09"/><rect x="12" y="4" width="8" height="8" fill="#451a03"/><rect x="13" y="5" width="6" height="6" fill="#d97706"/><rect x="15" y="5" width="2" height="6" fill="#fef08a"/><rect x="13" y="7" width="6" height="2" fill="#fef08a"/><rect x="15" y="7" width="2" height="2" fill="#f8fafc"/><rect x="1" y="15" width="30" height="2" fill="#0c0a09"/><rect x="4" y="15" width="24" height="2" fill="#451a03"/><rect x="2" y="17" width="28" height="13" fill="#0c0a09"/><rect x="3" y="17" width="26" height="12" fill="#451a03"/><rect x="5" y="18" width="22" height="10" fill="#78350f"/><rect x="2" y="20" width="28" height="3" fill="#0c0a09"/><rect x="3" y="21" width="26" height="1" fill="#451a03"/><rect x="13" y="20" width="6" height="3" fill="#d97706"/><rect x="14" y="21" width="4" height="1" fill="#fef08a"/><rect x="2" y="26" width="28" height="3" fill="#0c0a09"/><rect x="3" y="27" width="26" height="1" fill="#451a03"/><rect x="13" y="26" width="6" height="3" fill="#d97706"/><rect x="14" y="27" width="4" height="1" fill="#fef08a"/><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="2" y="30" width="28" height="2" fill="#78350f"/>`;

export const ADVENTURER_ARM_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_ARM_SIDE_BODY}</svg>`;

export function drawAdventurerArmSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Manga lateral superior
  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 15 * s);
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 14 * s);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(rx(4, 24), 2 * s, 24 * s, 12 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 3 * s);

  // Emblema de la Rosa de los Vientos / Brújula en el hombro
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(11, 10), 3 * s, 10 * s, 10 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(12, 8), 4 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(13, 6), 5 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(15, 2), 5 * s, 2 * s, 6 * s);
  ctx.fillRect(rx(13, 6), 7 * s, 6 * s, 2 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(rx(15, 2), 7 * s, 2 * s, 2 * s);

  // Junta del codo
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 15 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(4, 24), 15 * s, 24 * s, 2 * s);

  // Brazal lateral de cuero de explorador
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 17 * s, 28 * s, 13 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(3, 26), 17 * s, 26 * s, 12 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(5, 22), 18 * s, 22 * s, 10 * s);

  // 2 correas utilitarias con hebillas de latón
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
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(2, 28), 30 * s, 28 * s, 2 * s);
}

/**
 * SVG canónico del Costado Interior del Brazo del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Manga interior en penumbra azul profundo (#082f49, #0c4a6e) con costuras de cuero y puntadas de cáñamo.
 */
export const ADVENTURER_ARM_INNER_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="30" fill="#082f49"/><rect x="2" y="1" width="28" height="29" fill="#0c4a6e"/><rect x="14" y="2" width="4" height="28" fill="#082f49"/><rect x="15" y="2" width="2" height="28" fill="#451a03"/><g fill="#78350f"><rect x="13" y="6" width="6" height="2"/><rect x="13" y="14" width="6" height="2"/><rect x="13" y="22" width="6" height="2"/></g><g fill="#d97706"><rect x="15" y="6" width="2" height="2"/><rect x="15" y="14" width="2" height="2"/><rect x="15" y="22" width="2" height="2"/></g><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="2" y="30" width="28" height="2" fill="#451a03"/>`;

export const ADVENTURER_ARM_INNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_ARM_INNER_BODY}</svg>`;

export function drawAdventurerArmInnerToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Penumbra interior azul profunda
  ctx.fillStyle = '#082f49';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 30 * s);
  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 29 * s);

  // Costura interior con refuerzo de cuero
  ctx.fillStyle = '#082f49';
  ctx.fillRect(rx(14, 4), 2 * s, 4 * s, 28 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(15, 2), 2 * s, 2 * s, 28 * s);

  // Puntadas de cáñamo
  for (const y of [6, 14, 22]) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(rx(13, 6), y * s, 6 * s, 2 * s);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(rx(15, 2), y * s, 2 * s, 2 * s);
  }

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 29 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(2, 28), 30 * s, 28 * s, 2 * s);
}

/**
 * SVG canónico de la Espalda del Brazo del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Manga dorsal azul expedición (#0c4a6e, #0369a1), codera acolchada de cuero (#451a03, #78350f) con remache de latón (#fef08a) y muñequera de lino.
 */
export const ADVENTURER_ARM_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="14" fill="#0c4a6e"/><rect x="2" y="1" width="28" height="13" fill="#0369a1"/><rect x="5" y="2" width="4" height="11" fill="#0284c7"/><rect x="23" y="2" width="4" height="11" fill="#082f49"/><rect x="2" y="1" width="28" height="3" fill="#451a03"/><rect x="1" y="14" width="30" height="2" fill="#0c0a09"/><rect x="6" y="15" width="20" height="9" fill="#0c0a09"/><rect x="7" y="16" width="18" height="7" fill="#451a03"/><rect x="10" y="17" width="12" height="5" fill="#78350f"/><rect x="13" y="18" width="6" height="3" fill="#b45309"/><rect x="15" y="18" width="2" height="3" fill="#fef08a"/><rect x="2" y="24" width="28" height="6" fill="#0c0a09"/><rect x="3" y="24" width="26" height="5" fill="#451a03"/><rect x="5" y="25" width="22" height="4" fill="#78350f"/><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="2" y="30" width="28" height="2" fill="#cbd5e1"/>`;

export const ADVENTURER_ARM_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_ARM_BACK_BODY}</svg>`;

export function drawAdventurerArmBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Manga dorsal superior
  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 14 * s);
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 13 * s);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(5 * s, 2 * s, 4 * s, 11 * s);
  ctx.fillStyle = '#082f49';
  ctx.fillRect(23 * s, 2 * s, 4 * s, 11 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 3 * s);

  // Seam horizontal
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 14 * s, 30 * s, 2 * s);

  // Codera acolchada de cuero
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(6 * s, 15 * s, 20 * s, 9 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(7 * s, 16 * s, 18 * s, 7 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(10 * s, 17 * s, 12 * s, 5 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(13 * s, 18 * s, 6 * s, 3 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 18 * s, 2 * s, 3 * s);

  // Dorso del antebrazo
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 24 * s, 28 * s, 6 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(3 * s, 24 * s, 26 * s, 5 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(5 * s, 25 * s, 22 * s, 4 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 29 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(2 * s, 30 * s, 28 * s, 2 * s);
}

/**
 * SVG canónico del Frente de la Pierna del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Muslo con pantalón de expedición (#1e293b, #334155, #475569), rodillera de cuero con remaches de latón (#78350f, #fef08a), espinillera con cordones y empeine de bota con suela Sumi.
 */
export const ADVENTURER_LEG_FRONT_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="11" fill="#1e293b"/><rect x="2" y="1" width="28" height="10" fill="#334155"/><rect x="5" y="2" width="6" height="8" fill="#475569"/><rect x="14" y="2" width="4" height="8" fill="#64748b"/><rect x="22" y="2" width="5" height="8" fill="#0f172a"/><rect x="2" y="12" width="28" height="8" fill="#0c0a09"/><rect x="3" y="12" width="26" height="7" fill="#451a03"/><rect x="5" y="13" width="22" height="5" fill="#78350f"/><rect x="9" y="14" width="14" height="3" fill="#b45309"/><rect x="5" y="13" width="2" height="2" fill="#fef08a"/><rect x="25" y="13" width="2" height="2" fill="#fef08a"/><rect x="5" y="16" width="2" height="2" fill="#fef08a"/><rect x="25" y="16" width="2" height="2" fill="#fef08a"/><rect x="2" y="20" width="28" height="7" fill="#0c0a09"/><rect x="3" y="20" width="26" height="6" fill="#3d2817"/><rect x="5" y="21" width="22" height="4" fill="#4a2e18"/><rect x="8" y="21" width="16" height="3" fill="#6b4423"/><g fill="#cbd5e1"><rect x="10" y="21" width="12" height="1"/><rect x="10" y="24" width="12" height="1"/></g><rect x="1" y="27" width="30" height="5" fill="#0c0a09"/><rect x="2" y="27" width="28" height="3" fill="#2e1909"/><rect x="4" y="28" width="24" height="2" fill="#3d2817"/><rect x="1" y="30" width="30" height="2" fill="#0c0a09"/>`;

export const ADVENTURER_LEG_FRONT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_LEG_FRONT_BODY}</svg>`;

export function drawAdventurerLegFrontToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Muslo / Pantalón de explorador
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 11 * s);
  ctx.fillStyle = '#334155';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 10 * s);

  // Pliegues verticales de marcha
  ctx.fillStyle = '#475569';
  ctx.fillRect(5 * s, 2 * s, 6 * s, 8 * s);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(14 * s, 2 * s, 4 * s, 8 * s);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(22 * s, 2 * s, 5 * s, 8 * s);

  // 2. Rodillera de cuero con remaches de latón
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 12 * s, 28 * s, 8 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(3 * s, 12 * s, 26 * s, 7 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(5 * s, 13 * s, 22 * s, 5 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(9 * s, 14 * s, 14 * s, 3 * s);

  // 4 remaches de latón en las esquinas de la rodillera
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(5 * s, 13 * s, 2 * s, 2 * s);
  ctx.fillRect(25 * s, 13 * s, 2 * s, 2 * s);
  ctx.fillRect(5 * s, 16 * s, 2 * s, 2 * s);
  ctx.fillRect(25 * s, 16 * s, 2 * s, 2 * s);

  // 3. Espinillera / Polaina de viaje con cordones
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 20 * s, 28 * s, 7 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(3 * s, 20 * s, 26 * s, 6 * s);
  ctx.fillStyle = '#4a2e18';
  ctx.fillRect(5 * s, 21 * s, 22 * s, 4 * s);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(8 * s, 21 * s, 16 * s, 3 * s);

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(10 * s, 21 * s, 12 * s, 1 * s);
  ctx.fillRect(10 * s, 24 * s, 12 * s, 1 * s);

  // 4. Empeine de bota y suela
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 27 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(2 * s, 27 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(4 * s, 28 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 30 * s, 30 * s, 2 * s);
}

/**
 * SVG canónico del Costado Exterior de la Pierna del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Muslo lateral con bolsillo cargo utilitario de cuero y hebilla (#451a03, #d97706), rodillera lateral con correa y bota de explorador con hebilla de latón.
 */
export const ADVENTURER_LEG_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="11" fill="#1e293b"/><rect x="2" y="1" width="28" height="10" fill="#334155"/><rect x="8" y="2" width="16" height="9" fill="#0c0a09"/><rect x="9" y="3" width="14" height="7" fill="#451a03"/><rect x="10" y="4" width="12" height="5" fill="#78350f"/><rect x="8" y="2" width="16" height="2" fill="#451a03"/><rect x="14" y="3" width="4" height="2" fill="#d97706"/><rect x="15" y="3" width="2" height="1" fill="#fef08a"/><rect x="1" y="12" width="30" height="8" fill="#0c0a09"/><rect x="2" y="13" width="28" height="6" fill="#451a03"/><rect x="4" y="14" width="24" height="4" fill="#78350f"/><rect x="2" y="15" width="28" height="2" fill="#0c0a09"/><rect x="3" y="15" width="26" height="1" fill="#b45309"/><rect x="2" y="20" width="28" height="7" fill="#0c0a09"/><rect x="3" y="20" width="26" height="6" fill="#3d2817"/><rect x="5" y="21" width="22" height="4" fill="#4a2e18"/><rect x="2" y="22" width="28" height="2" fill="#0c0a09"/><rect x="3" y="22" width="26" height="1" fill="#78350f"/><rect x="14" y="21" width="4" height="3" fill="#d97706"/><rect x="15" y="22" width="2" height="1" fill="#fef08a"/><rect x="1" y="27" width="30" height="5" fill="#0c0a09"/><rect x="2" y="27" width="28" height="3" fill="#2e1909"/><rect x="3" y="28" width="26" height="2" fill="#3d2817"/><rect x="1" y="30" width="30" height="2" fill="#0c0a09"/>`;

export const ADVENTURER_LEG_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_LEG_SIDE_BODY}</svg>`;

export function drawAdventurerLegSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Muslo lateral con bolsillo cargo
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 11 * s);
  ctx.fillStyle = '#334155';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 10 * s);

  // Bolsillo de cuero utilitario
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(8, 16), 2 * s, 16 * s, 9 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(9, 14), 3 * s, 14 * s, 7 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(10, 12), 4 * s, 12 * s, 5 * s);
  // Solapa y hebilla
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(8, 16), 2 * s, 16 * s, 2 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(14, 4), 3 * s, 4 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(15, 2), 3 * s, 2 * s, 1 * s);

  // 2. Rodillera lateral con correa envolvente
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 12 * s, 30 * s, 8 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(2, 28), 13 * s, 28 * s, 6 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(4, 24), 14 * s, 24 * s, 4 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 15 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(rx(3, 26), 15 * s, 26 * s, 1 * s);

  // 3. Polaina lateral y correas con hebilla de latón
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 20 * s, 28 * s, 7 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(rx(3, 26), 20 * s, 26 * s, 6 * s);
  ctx.fillStyle = '#4a2e18';
  ctx.fillRect(rx(5, 22), 21 * s, 22 * s, 4 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 22 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(3, 26), 22 * s, 26 * s, 1 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(14, 4), 21 * s, 4 * s, 3 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(15, 2), 22 * s, 2 * s, 1 * s);

  // 4. Bota lateral y suela
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 27 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(rx(2, 28), 27 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(rx(3, 26), 28 * s, 26 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 30 * s, 30 * s, 2 * s);
}

/**
 * SVG canónico del Costado Interior de la Pierna del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Entrepierna en penumbra azul oscuro (#0f172a, #1e293b), costura de cuero con puntadas y caña interior de la bota.
 */
export const ADVENTURER_LEG_INNER_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="19" fill="#0f172a"/><rect x="2" y="1" width="28" height="18" fill="#1e293b"/><rect x="4" y="2" width="24" height="16" fill="#334155"/><rect x="14" y="2" width="4" height="17" fill="#0f172a"/><rect x="15" y="2" width="2" height="17" fill="#451a03"/><g fill="#78350f"><rect x="13" y="5" width="6" height="1"/><rect x="13" y="9" width="6" height="1"/><rect x="13" y="13" width="6" height="1"/><rect x="13" y="17" width="6" height="1"/></g><rect x="1" y="20" width="30" height="7" fill="#0c0a09"/><rect x="2" y="20" width="28" height="6" fill="#2e1909"/><rect x="3" y="21" width="26" height="4" fill="#3d2817"/><rect x="1" y="27" width="30" height="5" fill="#0c0a09"/><rect x="2" y="27" width="28" height="3" fill="#2e1909"/><rect x="1" y="30" width="30" height="2" fill="#0c0a09"/>`;

export const ADVENTURER_LEG_INNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_LEG_INNER_BODY}</svg>`;

export function drawAdventurerLegInnerToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Penumbra interior de entrepierna
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 19 * s);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 18 * s);
  ctx.fillStyle = '#334155';
  ctx.fillRect(rx(4, 24), 2 * s, 24 * s, 16 * s);

  // Costura reforzada interior
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(rx(14, 4), 2 * s, 4 * s, 17 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(15, 2), 2 * s, 2 * s, 17 * s);

  ctx.fillStyle = '#78350f';
  for (const y of [5, 9, 13, 17]) {
    ctx.fillRect(rx(13, 6), y * s, 6 * s, 1 * s);
  }

  // Caña interior de la bota
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 20 * s, 30 * s, 7 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(rx(2, 28), 20 * s, 28 * s, 6 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(rx(3, 26), 21 * s, 26 * s, 4 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 27 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(rx(2, 28), 27 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 30 * s, 30 * s, 2 * s);
}

/**
 * SVG canónico de la Espalda de la Pierna del Aventurero (32x32) en estilo Sumi-e Pixel Art:
 * - Isquiotibial con costura vertical dorsal (#334155, #1e293b), correas poplíteas de la rodillera, caña trasera de la bota y talón de cuero reforzado.
 */
export const ADVENTURER_LEG_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="11" fill="#1e293b"/><rect x="2" y="1" width="28" height="10" fill="#334155"/><rect x="5" y="2" width="6" height="8" fill="#475569"/><rect x="21" y="2" width="6" height="8" fill="#0f172a"/><rect x="14" y="1" width="4" height="11" fill="#0c0a09"/><rect x="15" y="1" width="2" height="10" fill="#1e293b"/><rect x="1" y="12" width="30" height="8" fill="#0c0a09"/><rect x="2" y="13" width="28" height="6" fill="#1e293b"/><rect x="2" y="14" width="28" height="2" fill="#451a03"/><rect x="3" y="14" width="26" height="2" fill="#78350f"/><rect x="2" y="17" width="28" height="2" fill="#451a03"/><rect x="3" y="17" width="26" height="2" fill="#78350f"/><rect x="2" y="20" width="28" height="7" fill="#0c0a09"/><rect x="3" y="20" width="26" height="6" fill="#3d2817"/><rect x="5" y="21" width="22" height="4" fill="#4a2e18"/><rect x="14" y="20" width="4" height="6" fill="#0c0a09"/><rect x="15" y="20" width="2" height="6" fill="#2e1909"/><rect x="1" y="27" width="30" height="5" fill="#0c0a09"/><rect x="2" y="27" width="28" height="3" fill="#2e1909"/><rect x="4" y="28" width="24" height="2" fill="#3d2817"/><rect x="1" y="30" width="30" height="2" fill="#0c0a09"/>`;

export const ADVENTURER_LEG_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${ADVENTURER_LEG_BACK_BODY}</svg>`;

export function drawAdventurerLegBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Isquiotibial / Pantalón trasero con costura dorsal
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 11 * s);
  ctx.fillStyle = '#334155';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 10 * s);
  ctx.fillStyle = '#475569';
  ctx.fillRect(5 * s, 2 * s, 6 * s, 8 * s);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(21 * s, 2 * s, 6 * s, 8 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 1 * s, 4 * s, 11 * s);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(15 * s, 1 * s, 2 * s, 10 * s);

  // Correas traseras de la rodillera (hueco poplíteo)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 12 * s, 30 * s, 8 * s);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(2 * s, 13 * s, 28 * s, 6 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(2 * s, 14 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(3 * s, 14 * s, 26 * s, 2 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(2 * s, 17 * s, 28 * s, 2 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(3 * s, 17 * s, 26 * s, 2 * s);

  // Pantorrilla / Caña trasera de la bota
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 20 * s, 28 * s, 7 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(3 * s, 20 * s, 26 * s, 6 * s);
  ctx.fillStyle = '#4a2e18';
  ctx.fillRect(5 * s, 21 * s, 22 * s, 4 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 20 * s, 4 * s, 6 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(15 * s, 20 * s, 2 * s, 6 * s);

  // Talón y tacón de la bota
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 27 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(2 * s, 27 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(4 * s, 28 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 30 * s, 30 * s, 2 * s);
}

export const adventurerPortrait = {
    id: 'adventurer',
    icon: 'avatar_adventurer',
    viewBox: '0 0 32 32',
    svg: ADVENTURER_PORTRAIT_SVG,
    body: ADVENTURER_PORTRAIT_BODY,
    sideSvg: ADVENTURER_SIDE_SVG,
    sideBody: ADVENTURER_SIDE_BODY,
    backSvg: ADVENTURER_BACK_SVG,
    backBody: ADVENTURER_BACK_BODY,
    chestSvg: ADVENTURER_CHEST_SVG,
    chestBody: ADVENTURER_CHEST_BODY,
    torsoSideSvg: ADVENTURER_TORSO_SIDE_SVG,
    torsoSideBody: ADVENTURER_TORSO_SIDE_BODY,
    torsoBackSvg: ADVENTURER_TORSO_BACK_SVG,
    torsoBackBody: ADVENTURER_TORSO_BACK_BODY,
    armFrontSvg: ADVENTURER_ARM_FRONT_SVG,
    armFrontBody: ADVENTURER_ARM_FRONT_BODY,
    armSideSvg: ADVENTURER_ARM_SIDE_SVG,
    armSideBody: ADVENTURER_ARM_SIDE_BODY,
    armInnerSvg: ADVENTURER_ARM_INNER_SVG,
    armInnerBody: ADVENTURER_ARM_INNER_BODY,
    armBackSvg: ADVENTURER_ARM_BACK_SVG,
    armBackBody: ADVENTURER_ARM_BACK_BODY,
    drawToCanvas: drawAdventurerPortraitToCanvas,
    drawSideToCanvas: drawAdventurerSideToCanvas,
    drawBackToCanvas: drawAdventurerBackToCanvas,
    drawChestToCanvas: drawAdventurerChestToCanvas,
    drawTorsoSideToCanvas: drawAdventurerTorsoSideToCanvas,
    drawTorsoBackToCanvas: drawAdventurerTorsoBackToCanvas,
    drawArmFrontToCanvas: drawAdventurerArmFrontToCanvas,
    drawArmSideToCanvas: drawAdventurerArmSideToCanvas,
    drawArmInnerToCanvas: drawAdventurerArmInnerToCanvas,
    drawArmBackToCanvas: drawAdventurerArmBackToCanvas,
    legFrontSvg: ADVENTURER_LEG_FRONT_SVG,
    legFrontBody: ADVENTURER_LEG_FRONT_BODY,
    legSideSvg: ADVENTURER_LEG_SIDE_SVG,
    legSideBody: ADVENTURER_LEG_SIDE_BODY,
    legInnerSvg: ADVENTURER_LEG_INNER_SVG,
    legInnerBody: ADVENTURER_LEG_INNER_BODY,
    legBackSvg: ADVENTURER_LEG_BACK_SVG,
    legBackBody: ADVENTURER_LEG_BACK_BODY,
    drawLegFrontToCanvas: drawAdventurerLegFrontToCanvas,
    drawLegSideToCanvas: drawAdventurerLegSideToCanvas,
    drawLegInnerToCanvas: drawAdventurerLegInnerToCanvas,
    drawLegBackToCanvas: drawAdventurerLegBackToCanvas,
};
