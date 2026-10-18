// src/heroes/portraits/ranger.js
// Arte Sumi-e Pixel Art del heroe Ranger: datos SVG (canonicos, verificados por tests)
// y funciones de dibujo imperativo a canvas (usadas por las texturas 3D).
// Generado al trocear src/heroes/heroPortraits.js (Fase 6). Sin cambios de comportamiento.

/**
 * SVG canónico del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Fondo pergamino Washi (#d6cfc2) y contorno de tinta Sumi (#0c0a09).
 * - Capucha y flequillo verde bosque (#14532d, #15803d, #22c55e) con pluma de aventurero (#f4efe4, #dc2626).
 * - Ojos de arquero con iris verde esmeralda / jade (#047857, #10b981) y cejas afiladas.
 * - Pinturas de guerra carmesí en las mejillas (#7f1d1d).
 * - Cicatriz horizontal en el puente de la nariz y sonrisa confiada de lado (smirk).
 */
export const RANGER_PORTRAIT_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="10" width="3" height="21" fill="#bfb6a6"/><rect x="28" y="10" width="3" height="21" fill="#a8a29e"/><rect x="1" y="27" width="30" height="4" fill="#a8a29e"/><rect x="4" y="29" width="24" height="2" fill="#78716c"/><path d="M1,1 H31 V10 H28 V8 H24 V9 H18 V7 H12 V9 H7 V7 H4 V11 H1 Z" fill="#0c0a09"/><path d="M1,1 H31 V8 H28 V6 H23 V8 H18 V5 H11 V8 H6 V6 H3 V9 H1 Z" fill="#14532d"/><path d="M2,1 H29 V5 H24 V6 H19 V4 H10 V6 H5 V4 H2 Z" fill="#15803d"/><g fill="#22c55e"><rect x="4" y="2" width="5" height="1"/><rect x="12" y="2" width="6" height="1"/><rect x="22" y="2" width="5" height="1"/></g><rect x="1" y="9" width="3" height="7" fill="#0c0a09"/><rect x="2" y="9" width="2" height="6" fill="#14532d"/><rect x="28" y="9" width="3" height="7" fill="#0c0a09"/><rect x="28" y="9" width="2" height="6" fill="#14532d"/><path d="M24,7 L29,2 H31 V4 L26,9 Z" fill="#0c0a09"/><path d="M25,7 L29,3 H30 V4 L26,8 Z" fill="#f4efe4"/><rect x="28" y="3" width="2" height="2" fill="#dc2626"/><rect x="4" y="9" width="24" height="1" fill="#a8a29e"/><path d="M5,12 H12 V14 H10 V13 H5 Z" fill="#0c0a09"/><path d="M20,12 H27 V13 H22 V14 H20 Z" fill="#0c0a09"/><rect x="6" y="14" width="5" height="5" fill="#0c0a09"/><rect x="21" y="14" width="5" height="5" fill="#0c0a09"/><rect x="7" y="15" width="4" height="4" fill="#f4efe4"/><rect x="21" y="15" width="4" height="4" fill="#f4efe4"/><rect x="8" y="15" width="3" height="4" fill="#047857"/><rect x="22" y="15" width="3" height="4" fill="#047857"/><rect x="8" y="16" width="2" height="3" fill="#10b981"/><rect x="22" y="16" width="2" height="3" fill="#10b981"/><rect x="7" y="15" width="2" height="2" fill="#ffffff"/><rect x="21" y="15" width="2" height="2" fill="#ffffff"/><g fill="#7f1d1d"><rect x="4" y="20" width="4" height="1"/><rect x="5" y="22" width="3" height="1"/><rect x="24" y="20" width="4" height="1"/><rect x="24" y="22" width="3" height="1"/></g><rect x="15" y="16" width="2" height="5" fill="#bfb6a6"/><rect x="14" y="20" width="4" height="1" fill="#78716c"/><rect x="13" y="17" width="6" height="1" fill="#a8a29e"/><rect x="14" y="17" width="4" height="1" fill="#f4efe4"/><rect x="11" y="24" width="9" height="2" fill="#451a03"/><path d="M11,24 H19 V23 H21 V25 H11 Z" fill="#0c0a09"/><rect x="13" y="26" width="5" height="1" fill="#78716c"/>`;

export const RANGER_PORTRAIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_PORTRAIT_BODY}</svg>`;

/**
 * Renderizado procedural síncrono píxel a píxel del Rostro del Explorador sobre Canvas 2D.
 */
export function drawRangerPortraitToCanvas(ctx, size = 32) {
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

  // Sombras laterales de pómulos y mandíbula
  ctx.fillStyle = '#bfb6a6';
  ctx.fillRect(1 * s, 10 * s, 3 * s, 21 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(28 * s, 10 * s, 3 * s, 21 * s);
  ctx.fillRect(1 * s, 27 * s, 30 * s, 4 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(4 * s, 29 * s, 24 * s, 2 * s);

  // Cabello / capucha: Sombra negra
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 7 * s);
  ctx.fillRect(4 * s, 8 * s, 24 * s, 2 * s);
  ctx.fillRect(1 * s, 8 * s, 3 * s, 3 * s);
  ctx.fillRect(24 * s, 8 * s, 4 * s, 1 * s);

  // Masa verde bosque oscuro (#14532d)
  ctx.fillStyle = '#14532d';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 5 * s);
  ctx.fillRect(3 * s, 6 * s, 25 * s, 2 * s);
  ctx.fillRect(11 * s, 8 * s, 7 * s, 1 * s);
  ctx.fillRect(23 * s, 8 * s, 5 * s, 1 * s);

  // Mechones verde musgo (#15803d)
  ctx.fillStyle = '#15803d';
  ctx.fillRect(2 * s, 1 * s, 27 * s, 4 * s);
  ctx.fillRect(5 * s, 5 * s, 5 * s, 1 * s);
  ctx.fillRect(19 * s, 5 * s, 5 * s, 1 * s);

  // Brillos verde (#22c55e)
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(4 * s, 2 * s, 5 * s, 1 * s);
  ctx.fillRect(12 * s, 2 * s, 6 * s, 1 * s);
  ctx.fillRect(22 * s, 2 * s, 5 * s, 1 * s);

  // Patillas
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 9 * s, 3 * s, 7 * s);
  ctx.fillRect(28 * s, 9 * s, 3 * s, 7 * s);
  ctx.fillStyle = '#14532d';
  ctx.fillRect(2 * s, 9 * s, 2 * s, 6 * s);
  ctx.fillRect(28 * s, 9 * s, 2 * s, 6 * s);

  // Pluma de explorador
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(24 * s, 2 * s, 7 * s, 7 * s);
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(25 * s, 3 * s, 5 * s, 5 * s);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(28 * s, 3 * s, 2 * s, 2 * s);

  // Sombra sobre la frente
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(4 * s, 9 * s, 24 * s, 1 * s);

  // Cejas afiladas
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(5 * s, 12 * s, 7 * s, 2 * s);
  ctx.fillRect(20 * s, 12 * s, 7 * s, 2 * s);

  // Ojos tinta negra
  ctx.fillRect(6 * s, 14 * s, 5 * s, 5 * s);
  ctx.fillRect(21 * s, 14 * s, 5 * s, 5 * s);

  // Esclerótica
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(7 * s, 15 * s, 4 * s, 4 * s);
  ctx.fillRect(21 * s, 15 * s, 4 * s, 4 * s);

  // Iris esmeralda
  ctx.fillStyle = '#047857';
  ctx.fillRect(8 * s, 15 * s, 3 * s, 4 * s);
  ctx.fillRect(22 * s, 15 * s, 3 * s, 4 * s);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(8 * s, 16 * s, 2 * s, 3 * s);
  ctx.fillRect(22 * s, 16 * s, 2 * s, 3 * s);

  // Brillo blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7 * s, 15 * s, 2 * s, 2 * s);
  ctx.fillRect(21 * s, 15 * s, 2 * s, 2 * s);

  // Pinturas de guerra en mejillas
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(4 * s, 20 * s, 4 * s, 1 * s);
  ctx.fillRect(5 * s, 22 * s, 3 * s, 1 * s);
  ctx.fillRect(24 * s, 20 * s, 4 * s, 1 * s);
  ctx.fillRect(24 * s, 22 * s, 3 * s, 1 * s);

  // Nariz y cicatriz
  ctx.fillStyle = '#bfb6a6';
  ctx.fillRect(15 * s, 16 * s, 2 * s, 5 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(14 * s, 20 * s, 4 * s, 1 * s);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(13 * s, 17 * s, 6 * s, 1 * s);
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(14 * s, 17 * s, 4 * s, 1 * s);

  // Boca (smirk)
  ctx.fillStyle = '#451a03';
  ctx.fillRect(11 * s, 24 * s, 9 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(11 * s, 24 * s, 8 * s, 1 * s);
  ctx.fillRect(19 * s, 23 * s, 2 * s, 2 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(13 * s, 26 * s, 5 * s, 1 * s);
}

/**
 * SVG canónico del Torso / Pecho del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Jubón de cuero y paño verde bosque (#14532d, #15803d, #166534) con pliegues iluminados (#22c55e).
 * - Cuello en V sombreado bajo la capucha y bandolera diagonal con hebilla y virotes (#451a03, #b45309, #f59e0b).
 */
export const RANGER_CHEST_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#14532d"/><rect x="3" y="1" width="26" height="24" fill="#166534"/><rect x="4" y="2" width="5" height="22" fill="#15803d"/><rect x="5" y="3" width="2" height="18" fill="#22c55e"/><rect x="24" y="2" width="5" height="22" fill="#052e16"/><rect x="12" y="1" width="8" height="6" fill="#0c0a09"/><rect x="13" y="1" width="6" height="4" fill="#451a03"/><path d="M5,24 L23,2 H28 L10,24 Z" fill="#0c0a09"/><path d="M6,24 L24,2 H27 L9,24 Z" fill="#451a03"/><rect x="14" y="11" width="5" height="5" fill="#b45309"/><rect x="15" y="12" width="3" height="3" fill="#f59e0b"/><rect x="1" y="26" width="30" height="5" fill="#2e1909"/><rect x="12" y="26" width="8" height="5" fill="#78350f"/>`;

export const RANGER_CHEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_CHEST_BODY}</svg>`;

export function drawRangerChestToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Jubón verde bosque
  ctx.fillStyle = '#14532d';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#166534';
  ctx.fillRect(3 * s, 1 * s, 26 * s, 24 * s);

  // Pliegues iluminados e izquierda / sombra derecha
  ctx.fillStyle = '#15803d';
  ctx.fillRect(4 * s, 2 * s, 5 * s, 22 * s);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(5 * s, 3 * s, 2 * s, 18 * s);
  ctx.fillStyle = '#052e16';
  ctx.fillRect(24 * s, 2 * s, 5 * s, 22 * s);

  // Cuello en V con cordones de cuero
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(12 * s, 1 * s, 8 * s, 6 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(13 * s, 1 * s, 6 * s, 4 * s);

  // Bandolera escalonada de cuero que acompaña el relieve 3D
  for (let i = 0; i < 18; i++) {
    const bx = (7 + Math.floor(i * 0.85)) * s;
    const by = (22 - i) * s;
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(bx - s, by, 6 * s, 2 * s);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(bx, by, 4 * s, 2 * s);
  }

  // Engaste de hebilla central
  ctx.fillStyle = '#b45309';
  ctx.fillRect(14 * s, 11 * s, 5 * s, 5 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(15 * s, 12 * s, 3 * s, 3 * s);

  // Cinturón de explorador
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(12 * s, 26 * s, 8 * s, 5 * s);
}

/**
 * SVG canónico del Perfil Lateral de la Cabeza del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Capucha de montaraz verde bosque (#052e16, #14532d, #15803d, #22c55e) que envuelve la parte superior y cae en diagonal hacia la nuca.
 * - Sien en piel Washi (#d6cfc2) con patilla, pintura de guerra carmesí (#7f1d1d), punta de oreja bajo el paño y embozo de cuero (#451a03, #78350f).
 */
export const RANGER_SIDE_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="9" width="3" height="18" fill="#a8a29e"/><rect x="5" y="9" width="4" height="7" fill="#0c0a09"/><rect x="6" y="9" width="2" height="6" fill="#14532d"/><g fill="#7f1d1d"><rect x="2" y="20" width="4" height="1"/><rect x="3" y="22" width="3" height="1"/></g><rect x="9" y="14" width="6" height="7" fill="#0c0a09"/><rect x="10" y="15" width="4" height="5" fill="#d6cfc2"/><rect x="11" y="16" width="2" height="3" fill="#78716c"/><rect x="1" y="1" width="30" height="8" fill="#0c0a09"/><rect x="14" y="8" width="17" height="19" fill="#0c0a09"/><rect x="1" y="1" width="30" height="7" fill="#14532d"/><rect x="15" y="8" width="16" height="18" fill="#14532d"/><rect x="2" y="1" width="28" height="5" fill="#15803d"/><rect x="17" y="8" width="13" height="16" fill="#15803d"/><g fill="#22c55e"><rect x="4" y="2" width="22" height="1"/><rect x="18" y="9" width="2" height="12"/></g><g fill="#052e16"><rect x="22" y="9" width="2" height="15"/><rect x="27" y="9" width="2" height="15"/></g><rect x="15" y="8" width="2" height="18" fill="#78350f"/><rect x="1" y="26" width="30" height="5" fill="#0c0a09"/><rect x="2" y="27" width="28" height="4" fill="#451a03"/><rect x="4" y="27" width="24" height="1" fill="#78350f"/><rect x="13" y="28" width="3" height="2" fill="#d97706"/>`;

export const RANGER_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_SIDE_BODY}</svg>`;

export function drawRangerSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  // Sombra de sien frontal y patilla
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(rx(1, 3), 9 * s, 3 * s, 18 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(5, 4), 9 * s, 4 * s, 7 * s);
  ctx.fillStyle = '#14532d';
  ctx.fillRect(rx(6, 2), 9 * s, 2 * s, 6 * s);

  // Pintura de guerra lateral en mejilla
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(rx(2, 4), 20 * s, 4 * s, 1 * s);
  ctx.fillRect(rx(3, 3), 22 * s, 3 * s, 1 * s);

  // Oreja asomando bajo el borde de la capucha
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(9, 6), 14 * s, 6 * s, 7 * s);
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(rx(10, 4), 15 * s, 4 * s, 5 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(11, 2), 16 * s, 2 * s, 3 * s);

  // Capucha envolvente verde bosque (parte superior y mitad trasera)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 8 * s);
  ctx.fillRect(rx(14, 17), 8 * s, 17 * s, 19 * s);
  ctx.fillStyle = '#14532d';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 7 * s);
  ctx.fillRect(rx(15, 16), 8 * s, 16 * s, 18 * s);
  ctx.fillStyle = '#15803d';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 5 * s);
  ctx.fillRect(rx(17, 13), 8 * s, 13 * s, 16 * s);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(rx(4, 22), 2 * s, 22 * s, 1 * s);
  ctx.fillRect(rx(18, 2), 9 * s, 2 * s, 12 * s);
  ctx.fillStyle = '#052e16';
  ctx.fillRect(rx(22, 2), 9 * s, 2 * s, 15 * s);
  ctx.fillRect(rx(27, 2), 9 * s, 2 * s, 15 * s);

  // Ribete de cuero del borde de la capucha
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(15, 2), 8 * s, 2 * s, 18 * s);

  // Embozo / cuello de cuero inferior (y=26..30)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(2, 28), 27 * s, 28 * s, 4 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(4, 24), 27 * s, 24 * s, 1 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(13, 3), 28 * s, 3 * s, 2 * s);
}

/**
 * SVG canónico de la Nuca / Parte Trasera de la Cabeza del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Capucha trasera completa en paño verde bosque (#052e16, #14532d, #15803d, #22c55e) con costura central de cuero (#451a03, #78350f) y pliegues hacia el faldón.
 */
export const RANGER_BACK_BODY = `<rect width="32" height="32" fill="#14532d"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="2" y="2" width="28" height="24" fill="#15803d"/><g fill="#22c55e"><rect x="4" y="2" width="24" height="1"/><rect x="6" y="4" width="2" height="19"/><rect x="24" y="4" width="2" height="19"/></g><g fill="#052e16"><rect x="10" y="3" width="2" height="22"/><rect x="20" y="3" width="2" height="22"/></g><rect x="14" y="1" width="4" height="25" fill="#0c0a09"/><rect x="15" y="2" width="2" height="24" fill="#78350f"/><rect x="1" y="26" width="30" height="5" fill="#0c0a09"/><rect x="2" y="27" width="28" height="4" fill="#451a03"/><rect x="4" y="27" width="24" height="1" fill="#78350f"/>`;

export const RANGER_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_BACK_BODY}</svg>`;

export function drawRangerBackToCanvas(ctx, size = 32) {
  const s = size / 32;

  ctx.fillStyle = '#14532d';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, s);
  ctx.fillRect(0, size - s, size, s);
  ctx.fillRect(0, 0, s, size);
  ctx.fillRect(size - s, 0, s, size);

  ctx.fillStyle = '#15803d';
  ctx.fillRect(2 * s, 2 * s, 28 * s, 24 * s);

  ctx.fillStyle = '#22c55e';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 1 * s);
  ctx.fillRect(6 * s, 4 * s, 2 * s, 19 * s);
  ctx.fillRect(24 * s, 4 * s, 2 * s, 19 * s);

  ctx.fillStyle = '#052e16';
  ctx.fillRect(10 * s, 3 * s, 2 * s, 22 * s);
  ctx.fillRect(20 * s, 3 * s, 2 * s, 22 * s);

  // Costura central trasera de cuero
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 1 * s, 4 * s, 25 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(15 * s, 2 * s, 2 * s, 24 * s);

  // Esclavina / cuello de cuero en la base
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(2 * s, 27 * s, 28 * s, 4 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(4 * s, 27 * s, 24 * s, 1 * s);
}

/**
 * SVG canónico del Costado Lateral del Torso del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Jubón verde bosque (#14532d, #166534, #15803d, #052e16) con costura lateral acordonada de cuero (#451a03, #78350f) y cinturón utilitario.
 */
export const RANGER_TORSO_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#14532d"/><rect x="2" y="1" width="28" height="24" fill="#166534"/><rect x="2" y="2" width="6" height="22" fill="#15803d"/><rect x="24" y="2" width="6" height="22" fill="#052e16"/><rect x="13" y="1" width="6" height="25" fill="#0c0a09"/><rect x="14" y="2" width="4" height="23" fill="#451a03"/><g fill="#78350f"><rect x="13" y="5" width="6" height="2"/><rect x="13" y="11" width="6" height="2"/><rect x="13" y="17" width="6" height="2"/><rect x="13" y="23" width="6" height="2"/></g><rect x="1" y="26" width="30" height="5" fill="#2e1909"/><rect x="12" y="26" width="8" height="5" fill="#78350f"/>`;

export const RANGER_TORSO_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_TORSO_SIDE_BODY}</svg>`;

export function drawRangerTorsoSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#14532d';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#166534';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 24 * s);
  ctx.fillStyle = '#15803d';
  ctx.fillRect(rx(2, 6), 2 * s, 6 * s, 22 * s);
  ctx.fillStyle = '#052e16';
  ctx.fillRect(rx(24, 6), 2 * s, 6 * s, 22 * s);

  // Costura lateral de cuero con cordones horizontales
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(13, 6), 1 * s, 6 * s, 25 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(14, 4), 2 * s, 4 * s, 23 * s);
  ctx.fillStyle = '#78350f';
  for (const y of [5, 11, 17, 23]) {
    ctx.fillRect(rx(13, 6), y * s, 6 * s, 2 * s);
  }

  // Cinturón lateral de montaraz
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(rx(1, 30), 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(12, 8), 26 * s, 8 * s, 5 * s);
}

/**
 * SVG canónico de la Espalda del Torso del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Dorso del jubón verde bosque con pliegues bajo la capa, arnés dorsal de cuero y argolla de bronce (#b45309, #f59e0b) para el carcaj 3D.
 */
export const RANGER_TORSO_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="25" fill="#14532d"/><rect x="3" y="1" width="26" height="24" fill="#166534"/><g fill="#052e16"><rect x="6" y="2" width="3" height="22"/><rect x="23" y="2" width="3" height="22"/></g><path d="M5,24 L23,2 H28 L10,24 Z" fill="#0c0a09"/><path d="M6,24 L24,2 H27 L9,24 Z" fill="#451a03"/><rect x="13" y="2" width="6" height="23" fill="#0c0a09"/><rect x="14" y="2" width="4" height="23" fill="#451a03"/><rect x="12" y="10" width="8" height="8" fill="#0c0a09"/><rect x="13" y="11" width="6" height="6" fill="#b45309"/><rect x="14" y="12" width="4" height="4" fill="#f59e0b"/><rect x="1" y="26" width="30" height="5" fill="#2e1909"/><rect x="12" y="26" width="8" height="5" fill="#78350f"/>`;

export const RANGER_TORSO_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_TORSO_BACK_BODY}</svg>`;

export function drawRangerTorsoBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#14532d';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 25 * s);
  ctx.fillStyle = '#166534';
  ctx.fillRect(3 * s, 1 * s, 26 * s, 24 * s);
  ctx.fillStyle = '#052e16';
  ctx.fillRect(6 * s, 2 * s, 3 * s, 22 * s);
  ctx.fillRect(23 * s, 2 * s, 3 * s, 22 * s);

  // Correa diagonal + correa vertical del arnés del carcaj
  for (let i = 0; i < 18; i++) {
    const bx = (7 + Math.floor(i * 0.85)) * s;
    const by = (22 - i) * s;
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(bx - s, by, 6 * s, 2 * s);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(bx, by, 4 * s, 2 * s);
  }
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(13 * s, 2 * s, 6 * s, 23 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(14 * s, 2 * s, 4 * s, 23 * s);

  // Argolla maestra de bronce en el centro de la espalda
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(12 * s, 10 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(13 * s, 11 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(14 * s, 12 * s, 4 * s, 4 * s);

  // Cinturón trasero
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(1 * s, 26 * s, 30 * s, 5 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(12 * s, 26 * s, 8 * s, 5 * s);
}

/**
 * SVG canónico del Frente del Brazo del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Manga verde bosque (#14532d, #166534, #15803d) con brazallete protector de arquero en cuero endurecido (#451a03, #78350f) y ojetes de bronce con cordones cruzados (#d97706, #fef08a).
 */
export const RANGER_ARM_FRONT_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="15" fill="#14532d"/><rect x="2" y="1" width="28" height="14" fill="#166534"/><rect x="4" y="2" width="6" height="12" fill="#15803d"/><rect x="22" y="2" width="6" height="12" fill="#052e16"/><rect x="14" y="2" width="4" height="12" fill="#15803d"/><rect x="1" y="15" width="30" height="2" fill="#0c0a09"/><rect x="3" y="17" width="26" height="13" fill="#2e1909"/><rect x="4" y="17" width="24" height="12" fill="#451a03"/><rect x="6" y="18" width="20" height="10" fill="#78350f"/><rect x="13" y="17" width="6" height="12" fill="#2e1909"/><rect x="14" y="18" width="4" height="10" fill="#b45309"/><g fill="#fef08a"><rect x="8" y="19" width="2" height="2"/><rect x="22" y="19" width="2" height="2"/><rect x="8" y="23" width="2" height="2"/><rect x="22" y="23" width="2" height="2"/><rect x="8" y="27" width="2" height="2"/><rect x="22" y="27" width="2" height="2"/></g><g fill="#0c0a09"><path d="M10,20 L22,24 L20,24 L10,21 Z"/><path d="M22,20 L10,24 L12,24 L22,21 Z"/><path d="M10,24 L22,28 L20,28 L10,25 Z"/><path d="M22,24 L10,28 L12,28 L22,25 Z"/></g><rect x="1" y="29" width="30" height="2" fill="#0c0a09"/>`;

export const RANGER_ARM_FRONT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_ARM_FRONT_BODY}</svg>`;

export function drawRangerArmFrontToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Manga superior del jubón de montaraz en verde bosque
  ctx.fillStyle = '#14532d';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 15 * s);
  ctx.fillStyle = '#166534';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 14 * s);

  // Pliegues y reflejos de luz forestal
  ctx.fillStyle = '#15803d';
  ctx.fillRect(4 * s, 2 * s, 6 * s, 12 * s);
  ctx.fillRect(14 * s, 2 * s, 4 * s, 12 * s);
  ctx.fillStyle = '#052e16';
  ctx.fillRect(22 * s, 2 * s, 6 * s, 12 * s);

  // Seam de unión entre bicep y brazal
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 15 * s, 30 * s, 2 * s);

  // 2. Brazal protector de arquero en cuero endurecido
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(3 * s, 17 * s, 26 * s, 13 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(4 * s, 17 * s, 24 * s, 12 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(6 * s, 18 * s, 20 * s, 10 * s);

  // Nervadura central de refuerzo contra el latigazo de la cuerda del arco
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(13 * s, 17 * s, 6 * s, 12 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(14 * s, 18 * s, 4 * s, 10 * s);

  // Ojetes de bronce para cordones
  ctx.fillStyle = '#fef08a';
  for (const y of [19, 23, 27]) {
    ctx.fillRect(8 * s, y * s, 2 * s, 2 * s);
    ctx.fillRect(22 * s, y * s, 2 * s, 2 * s);
  }

  // Cordones cruzados de cuero negro
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(10 * s, 20 * s, 12 * s, 1 * s);
  ctx.fillRect(10 * s, 24 * s, 12 * s, 1 * s);
  ctx.fillRect(10 * s, 28 * s, 12 * s, 1 * s);

  // Remate de la muñeca
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 29 * s, 30 * s, 2 * s);
}

/**
 * SVG canónico del Costado Exterior del Brazo del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Emblema de montaraz en el hombro, cuero lateral con dos correas y hebillas de bronce (#78350f, #d97706, #fef08a).
 */
export const RANGER_ARM_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="15" fill="#14532d"/><rect x="2" y="1" width="28" height="14" fill="#166534"/><rect x="11" y="3" width="10" height="10" fill="#0c0a09"/><rect x="12" y="4" width="8" height="8" fill="#451a03"/><rect x="13" y="5" width="6" height="6" fill="#78350f"/><rect x="15" y="6" width="2" height="4" fill="#86efac"/><rect x="1" y="15" width="30" height="2" fill="#0c0a09"/><rect x="2" y="17" width="28" height="13" fill="#2e1909"/><rect x="4" y="18" width="24" height="11" fill="#451a03"/><rect x="6" y="18" width="20" height="11" fill="#78350f"/><g fill="#0c0a09"><rect x="2" y="20" width="28" height="3"/><rect x="2" y="26" width="28" height="3"/></g><g fill="#2e1909"><rect x="3" y="21" width="26" height="1"/><rect x="3" y="27" width="26" height="1"/></g><g fill="#d97706"><rect x="14" y="20" width="4" height="3"/><rect x="14" y="26" width="4" height="3"/></g><g fill="#fef08a"><rect x="15" y="21" width="2" height="1"/><rect x="15" y="27" width="2" height="1"/></g>`;

export const RANGER_ARM_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_ARM_SIDE_BODY}</svg>`;

export function drawRangerArmSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Manga exterior superior
  ctx.fillStyle = '#14532d';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 15 * s);
  ctx.fillStyle = '#166534';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 14 * s);

  // Emblema de la orden de exploradores en el hombro (parche de cuero con hoja verde)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(11, 10), 3 * s, 10 * s, 10 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(12, 8), 4 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(13, 6), 5 * s, 6 * s, 6 * s);
  ctx.fillStyle = '#86efac';
  ctx.fillRect(rx(15, 2), 6 * s, 2 * s, 4 * s);

  // Seam horizontal
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 15 * s, 30 * s, 2 * s);

  // Placa lateral exterior del brazal
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(rx(2, 28), 17 * s, 28 * s, 13 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(4, 24), 18 * s, 24 * s, 11 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(6, 20), 18 * s, 20 * s, 11 * s);

  // 2 correas de ajuste del brazal con hebillas de bronce
  for (const y of [20, 26]) {
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(rx(2, 28), y * s, 28 * s, 3 * s);
    ctx.fillStyle = '#2e1909';
    ctx.fillRect(rx(3, 26), (y + 1) * s, 26 * s, 1 * s);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(rx(14, 4), y * s, 4 * s, 3 * s);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(rx(15, 2), (y + 1) * s, 2 * s, 1 * s);
  }
}

/**
 * SVG canónico del Costado Interior del Brazo del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Manga interior orientada al torso: pliegues en penumbra verde oscura (#052e16, #14532d) con costuras de cuero flexibles.
 */
export const RANGER_ARM_INNER_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="30" fill="#052e16"/><rect x="2" y="1" width="28" height="29" fill="#14532d"/><rect x="14" y="2" width="4" height="28" fill="#052e16"/><rect x="15" y="2" width="2" height="28" fill="#451a03"/><g fill="#78350f"><rect x="13" y="6" width="6" height="2"/><rect x="13" y="14" width="6" height="2"/><rect x="13" y="22" width="6" height="2"/></g><rect x="1" y="29" width="30" height="2" fill="#0c0a09"/>`;

export const RANGER_ARM_INNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_ARM_INNER_BODY}</svg>`;

export function drawRangerArmInnerToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Penumbra interior verde
  ctx.fillStyle = '#052e16';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 30 * s);
  ctx.fillStyle = '#14532d';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 29 * s);

  // Costura interior con puntadas de hilo grueso
  ctx.fillStyle = '#052e16';
  ctx.fillRect(rx(14, 4), 2 * s, 4 * s, 28 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(15, 2), 2 * s, 2 * s, 28 * s);

  ctx.fillStyle = '#78350f';
  for (const y of [6, 14, 22]) {
    ctx.fillRect(rx(13, 6), y * s, 6 * s, 2 * s);
  }

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 29 * s, 30 * s, 2 * s);
}

/**
 * SVG canónico de la Espalda del Brazo del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Tríceps en verde bosque con codera de cuero reforzada (#451a03, #78350f) y remache de sujeción.
 */
export const RANGER_ARM_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="14" fill="#14532d"/><rect x="2" y="1" width="28" height="13" fill="#166534"/><rect x="5" y="2" width="4" height="11" fill="#15803d"/><rect x="23" y="2" width="4" height="11" fill="#052e16"/><rect x="1" y="14" width="30" height="2" fill="#0c0a09"/><rect x="6" y="15" width="20" height="9" fill="#0c0a09"/><rect x="7" y="16" width="18" height="7" fill="#451a03"/><rect x="10" y="17" width="12" height="5" fill="#78350f"/><rect x="15" y="18" width="2" height="3" fill="#d97706"/><rect x="2" y="24" width="28" height="6" fill="#2e1909"/><rect x="4" y="25" width="24" height="5" fill="#451a03"/><rect x="1" y="29" width="30" height="2" fill="#0c0a09"/>`;

export const RANGER_ARM_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_ARM_BACK_BODY}</svg>`;

export function drawRangerArmBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // Manga dorsal superior
  ctx.fillStyle = '#14532d';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 14 * s);
  ctx.fillStyle = '#166534';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 13 * s);
  ctx.fillStyle = '#15803d';
  ctx.fillRect(5 * s, 2 * s, 4 * s, 11 * s);
  ctx.fillStyle = '#052e16';
  ctx.fillRect(23 * s, 2 * s, 4 * s, 11 * s);

  // Codera de cuero reforzada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 14 * s, 30 * s, 2 * s);
  ctx.fillRect(6 * s, 15 * s, 20 * s, 9 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(7 * s, 16 * s, 18 * s, 7 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(10 * s, 17 * s, 12 * s, 5 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(15 * s, 18 * s, 2 * s, 3 * s);

  // Dorso del antebrazo
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(2 * s, 24 * s, 28 * s, 6 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(4 * s, 25 * s, 24 * s, 5 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 29 * s, 30 * s, 2 * s);
}

/**
 * SVG canónico del Frente de la Pierna del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Muslo con pantalón de montaraz verde bosque (#14532d, #166534) y refuerzo de cuero (#451a03), rodillera de cuero reforzada con remaches de bronce (#78350f, #fef08a), bota alta de cazador con cordones en zigzag (#d9b48a) y suela Sumi.
 */
export const RANGER_LEG_FRONT_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="11" fill="#052e16"/><rect x="2" y="1" width="28" height="10" fill="#14532d"/><rect x="4" y="2" width="24" height="8" fill="#166534"/><rect x="7" y="2" width="8" height="8" fill="#15803d"/><rect x="21" y="2" width="6" height="8" fill="#052e16"/><rect x="13" y="1" width="6" height="10" fill="#0c0a09"/><rect x="14" y="2" width="4" height="8" fill="#451a03"/><rect x="15" y="2" width="2" height="8" fill="#78350f"/><rect x="2" y="11" width="28" height="8" fill="#0c0a09"/><rect x="3" y="11" width="26" height="8" fill="#2e1909"/><rect x="4" y="12" width="24" height="6" fill="#451a03"/><rect x="7" y="12" width="18" height="6" fill="#78350f"/><rect x="11" y="13" width="10" height="4" fill="#b45309"/><rect x="14" y="14" width="4" height="2" fill="#d97706"/><rect x="15" y="14" width="2" height="2" fill="#fef08a"/><g fill="#fef08a"><rect x="4" y="12" width="2" height="2"/><rect x="26" y="12" width="2" height="2"/><rect x="4" y="16" width="2" height="2"/><rect x="26" y="16" width="2" height="2"/></g><rect x="2" y="19" width="28" height="9" fill="#0c0a09"/><rect x="3" y="19" width="26" height="8" fill="#2e1909"/><rect x="4" y="20" width="24" height="7" fill="#3d2817"/><rect x="7" y="20" width="18" height="7" fill="#4a2e18"/><g fill="#fef08a"><rect x="8" y="21" width="2" height="1"/><rect x="22" y="21" width="2" height="1"/><rect x="8" y="24" width="2" height="1"/><rect x="22" y="24" width="2" height="1"/></g><g fill="#d9b48a"><rect x="10" y="21" width="12" height="1"/><rect x="11" y="22" width="10" height="1"/><rect x="10" y="24" width="12" height="1"/><rect x="11" y="25" width="10" height="1"/></g><rect x="1" y="28" width="30" height="4" fill="#0c0a09"/><rect x="2" y="28" width="28" height="3" fill="#2e1909"/><rect x="4" y="29" width="24" height="2" fill="#3d2817"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const RANGER_LEG_FRONT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_LEG_FRONT_BODY}</svg>`;

export function drawRangerLegFrontToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Muslo con pantalón de montaraz
  ctx.fillStyle = '#052e16';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 11 * s);
  ctx.fillStyle = '#14532d';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 10 * s);
  ctx.fillStyle = '#166534';
  ctx.fillRect(4 * s, 2 * s, 24 * s, 8 * s);
  ctx.fillStyle = '#15803d';
  ctx.fillRect(7 * s, 2 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#052e16';
  ctx.fillRect(21 * s, 2 * s, 6 * s, 8 * s);

  // Refuerzo de cuero en el muslo
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(13 * s, 1 * s, 6 * s, 10 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(14 * s, 2 * s, 4 * s, 8 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(15 * s, 2 * s, 2 * s, 8 * s);

  // 2. Rodillera de cuero reforzada
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 11 * s, 28 * s, 8 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(3 * s, 11 * s, 26 * s, 8 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(4 * s, 12 * s, 24 * s, 6 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(7 * s, 12 * s, 18 * s, 6 * s);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(11 * s, 13 * s, 10 * s, 4 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(14 * s, 14 * s, 4 * s, 2 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 14 * s, 2 * s, 2 * s);

  // Remaches de bronce en las esquinas
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(4 * s, 12 * s, 2 * s, 2 * s);
  ctx.fillRect(26 * s, 12 * s, 2 * s, 2 * s);
  ctx.fillRect(4 * s, 16 * s, 2 * s, 2 * s);
  ctx.fillRect(26 * s, 16 * s, 2 * s, 2 * s);

  // 3. Caña de la bota alta de cazador con cordones
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 19 * s, 28 * s, 9 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(3 * s, 19 * s, 26 * s, 8 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(4 * s, 20 * s, 24 * s, 7 * s);
  ctx.fillStyle = '#4a2e18';
  ctx.fillRect(7 * s, 20 * s, 18 * s, 7 * s);

  // Ojetes de bronce
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(8 * s, 21 * s, 2 * s, 1 * s);
  ctx.fillRect(22 * s, 21 * s, 2 * s, 1 * s);
  ctx.fillRect(8 * s, 24 * s, 2 * s, 1 * s);
  ctx.fillRect(22 * s, 24 * s, 2 * s, 1 * s);

  // Cordones en zigzag
  ctx.fillStyle = '#d9b48a';
  ctx.fillRect(10 * s, 21 * s, 12 * s, 1 * s);
  ctx.fillRect(11 * s, 22 * s, 10 * s, 1 * s);
  ctx.fillRect(10 * s, 24 * s, 12 * s, 1 * s);
  ctx.fillRect(11 * s, 25 * s, 10 * s, 1 * s);

  // 4. Empeine y puntera con suela Sumi
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 28 * s, 30 * s, 4 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(2 * s, 28 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(4 * s, 29 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 31 * s, 30 * s, 1 * s);
}

/**
 * SVG canónico del Costado Lateral de la Pierna del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Vaina utilitaria de cuero en el muslo (#451a03, #78350f) con hebilla de bronce, aleta exterior de rodillera y caña de bota con correas dobles.
 */
export const RANGER_LEG_SIDE_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="11" fill="#052e16"/><rect x="2" y="1" width="28" height="10" fill="#14532d"/><rect x="4" y="2" width="24" height="8" fill="#166534"/><rect x="10" y="2" width="12" height="9" fill="#0c0a09"/><rect x="11" y="3" width="10" height="7" fill="#451a03"/><rect x="12" y="4" width="8" height="5" fill="#78350f"/><rect x="14" y="3" width="4" height="4" fill="#d97706"/><rect x="15" y="4" width="2" height="2" fill="#fef08a"/><rect x="2" y="11" width="28" height="8" fill="#0c0a09"/><rect x="3" y="11" width="26" height="8" fill="#2e1909"/><rect x="4" y="12" width="24" height="6" fill="#451a03"/><rect x="7" y="12" width="18" height="6" fill="#78350f"/><rect x="13" y="11" width="6" height="8" fill="#d97706"/><rect x="14" y="12" width="4" height="6" fill="#fef08a"/><rect x="15" y="14" width="2" height="2" fill="#f8fafc"/><rect x="2" y="19" width="28" height="9" fill="#0c0a09"/><rect x="3" y="19" width="26" height="8" fill="#2e1909"/><rect x="4" y="20" width="24" height="7" fill="#3d2817"/><rect x="7" y="20" width="18" height="7" fill="#4a2e18"/><rect x="2" y="22" width="28" height="3" fill="#0c0a09"/><rect x="3" y="23" width="26" height="1" fill="#451a03"/><rect x="13" y="22" width="6" height="3" fill="#d97706"/><rect x="14" y="23" width="4" height="1" fill="#fef08a"/><rect x="1" y="28" width="30" height="4" fill="#0c0a09"/><rect x="2" y="28" width="28" height="3" fill="#2e1909"/><rect x="4" y="29" width="24" height="2" fill="#3d2817"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const RANGER_LEG_SIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_LEG_SIDE_BODY}</svg>`;

export function drawRangerLegSideToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Muslo lateral
  ctx.fillStyle = '#052e16';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 11 * s);
  ctx.fillStyle = '#14532d';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 10 * s);
  ctx.fillStyle = '#166534';
  ctx.fillRect(rx(4, 24), 2 * s, 24 * s, 8 * s);

  // Vaina / bolsillo utilitario lateral
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(10, 12), 2 * s, 12 * s, 9 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(11, 10), 3 * s, 10 * s, 7 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(12, 8), 4 * s, 8 * s, 5 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(14, 4), 3 * s, 4 * s, 4 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(15, 2), 4 * s, 2 * s, 2 * s);

  // 2. Aleta lateral de la rodillera
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 11 * s, 28 * s, 8 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(rx(3, 26), 11 * s, 26 * s, 8 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(4, 24), 12 * s, 24 * s, 6 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(rx(7, 18), 12 * s, 18 * s, 6 * s);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(13, 6), 11 * s, 6 * s, 8 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(14, 4), 12 * s, 4 * s, 6 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(rx(15, 2), 14 * s, 2 * s, 2 * s);

  // 3. Caña lateral de bota
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(2, 28), 19 * s, 28 * s, 9 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(rx(3, 26), 19 * s, 26 * s, 8 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(rx(4, 24), 20 * s, 24 * s, 7 * s);
  ctx.fillStyle = '#4a2e18';
  ctx.fillRect(rx(7, 18), 20 * s, 18 * s, 7 * s);

  // Correa de cuero y hebilla
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
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(rx(2, 28), 28 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(rx(4, 24), 29 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 31 * s, 30 * s, 1 * s);
}

/**
 * SVG canónico del Costado Interior de la Pierna del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Penumbra verde bosque (#052e16, #14532d), refuerzo de badana de cuero (#2e1909, #451a03) y puntadas de cáñamo.
 */
export const RANGER_LEG_INNER_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="30" fill="#052e16"/><rect x="2" y="1" width="28" height="29" fill="#14532d"/><rect x="3" y="2" width="8" height="27" fill="#052e16"/><rect x="4" y="3" width="6" height="25" fill="#166534"/><g fill="#451a03"><rect x="14" y="4" width="8" height="3"/><rect x="14" y="11" width="8" height="3"/><rect x="14" y="18" width="8" height="3"/><rect x="14" y="24" width="8" height="3"/></g><g fill="#78350f"><rect x="15" y="5" width="6" height="1"/><rect x="15" y="12" width="6" height="1"/><rect x="15" y="19" width="6" height="1"/><rect x="15" y="25" width="6" height="1"/></g><rect x="11" y="2" width="4" height="28" fill="#0c0a09"/><rect x="12" y="2" width="2" height="28" fill="#451a03"/><rect x="1" y="29" width="30" height="3" fill="#0c0a09"/><rect x="3" y="30" width="26" height="2" fill="#2e1909"/>`;

export const RANGER_LEG_INNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_LEG_INNER_BODY}</svg>`;

export function drawRangerLegInnerToCanvas(ctx, size = 32, flipX = false) {
  const s = size / 32;
  const rx = (x, w) => (flipX ? (32 - x - w) * s : x * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#052e16';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 30 * s);
  ctx.fillStyle = '#14532d';
  ctx.fillRect(rx(2, 28), 1 * s, 28 * s, 29 * s);

  ctx.fillStyle = '#052e16';
  ctx.fillRect(rx(3, 8), 2 * s, 8 * s, 27 * s);
  ctx.fillStyle = '#166534';
  ctx.fillRect(rx(4, 6), 3 * s, 6 * s, 25 * s);

  // Parches de cuero interior de fricción
  ctx.fillStyle = '#451a03';
  for (const y of [4, 11, 18, 24]) {
    ctx.fillRect(rx(14, 8), y * s, 8 * s, 3 * s);
  }
  ctx.fillStyle = '#78350f';
  for (const y of [5, 12, 19, 25]) {
    ctx.fillRect(rx(15, 6), y * s, 6 * s, 1 * s);
  }

  // Costura central
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(11, 4), 2 * s, 4 * s, 28 * s);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(rx(12, 2), 2 * s, 2 * s, 28 * s);

  // Remate inferior
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 29 * s, 30 * s, 3 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(rx(3, 26), 30 * s, 26 * s, 2 * s);
}

/**
 * SVG canónico de la Espalda de la Pierna del Explorador (32x32) en estilo Sumi-e Pixel Art:
 * - Muslo posterior con costura vertical dorsal (#14532d, #052e16), hueco poplíteo con doble correa de cuero (#451a03, #d97706) y caña trasera de bota.
 */
export const RANGER_LEG_BACK_BODY = `<rect width="32" height="32" fill="#0c0a09"/><rect x="1" y="1" width="30" height="11" fill="#052e16"/><rect x="2" y="1" width="28" height="10" fill="#14532d"/><rect x="5" y="2" width="8" height="8" fill="#166534"/><rect x="19" y="2" width="8" height="8" fill="#052e16"/><rect x="14" y="1" width="4" height="11" fill="#0c0a09"/><rect x="15" y="1" width="2" height="10" fill="#052e16"/><rect x="1" y="12" width="30" height="8" fill="#0c0a09"/><rect x="2" y="13" width="28" height="6" fill="#14532d"/><rect x="2" y="14" width="28" height="2" fill="#451a03"/><rect x="3" y="14" width="26" height="2" fill="#78350f"/><rect x="13" y="14" width="6" height="2" fill="#d97706"/><rect x="14" y="14" width="4" height="1" fill="#fef08a"/><rect x="2" y="17" width="28" height="2" fill="#451a03"/><rect x="3" y="17" width="26" height="2" fill="#78350f"/><rect x="13" y="17" width="6" height="2" fill="#d97706"/><rect x="14" y="17" width="4" height="1" fill="#fef08a"/><rect x="2" y="20" width="28" height="8" fill="#0c0a09"/><rect x="3" y="20" width="26" height="7" fill="#3d2817"/><rect x="5" y="21" width="22" height="5" fill="#4a2e18"/><rect x="8" y="21" width="16" height="4" fill="#6b4423"/><rect x="14" y="20" width="4" height="7" fill="#0c0a09"/><rect x="15" y="20" width="2" height="7" fill="#2e1909"/><rect x="1" y="28" width="30" height="4" fill="#0c0a09"/><rect x="2" y="28" width="28" height="3" fill="#2e1909"/><rect x="4" y="29" width="24" height="2" fill="#3d2817"/><rect x="1" y="31" width="30" height="1" fill="#0c0a09"/>`;

export const RANGER_LEG_BACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${RANGER_LEG_BACK_BODY}</svg>`;

export function drawRangerLegBackToCanvas(ctx, size = 32) {
  const s = size / 32;
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, size, size);

  // 1. Muslo posterior
  ctx.fillStyle = '#052e16';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 11 * s);
  ctx.fillStyle = '#14532d';
  ctx.fillRect(2 * s, 1 * s, 28 * s, 10 * s);
  ctx.fillStyle = '#166534';
  ctx.fillRect(5 * s, 2 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#052e16';
  ctx.fillRect(19 * s, 2 * s, 8 * s, 8 * s);

  // Costura central vertical
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 1 * s, 4 * s, 11 * s);
  ctx.fillStyle = '#052e16';
  ctx.fillRect(15 * s, 1 * s, 2 * s, 10 * s);

  // 2. Hueco poplíteo con correas dobles
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 12 * s, 30 * s, 8 * s);
  ctx.fillStyle = '#14532d';
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

  // 3. Caña trasera de la bota
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(2 * s, 20 * s, 28 * s, 8 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(3 * s, 20 * s, 26 * s, 7 * s);
  ctx.fillStyle = '#4a2e18';
  ctx.fillRect(5 * s, 21 * s, 22 * s, 5 * s);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(8 * s, 21 * s, 16 * s, 4 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14 * s, 20 * s, 4 * s, 7 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(15 * s, 20 * s, 2 * s, 7 * s);

  // 4. Talonera de cuero
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 28 * s, 30 * s, 4 * s);
  ctx.fillStyle = '#2e1909';
  ctx.fillRect(2 * s, 28 * s, 28 * s, 3 * s);
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(4 * s, 29 * s, 24 * s, 2 * s);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 31 * s, 30 * s, 1 * s);
}

export const rangerPortrait = {
    id: 'ranger',
    icon: 'avatar_ranger',
    viewBox: '0 0 32 32',
    svg: RANGER_PORTRAIT_SVG,
    body: RANGER_PORTRAIT_BODY,
    sideSvg: RANGER_SIDE_SVG,
    sideBody: RANGER_SIDE_BODY,
    backSvg: RANGER_BACK_SVG,
    backBody: RANGER_BACK_BODY,
    chestSvg: RANGER_CHEST_SVG,
    chestBody: RANGER_CHEST_BODY,
    torsoSideSvg: RANGER_TORSO_SIDE_SVG,
    torsoSideBody: RANGER_TORSO_SIDE_BODY,
    torsoBackSvg: RANGER_TORSO_BACK_SVG,
    torsoBackBody: RANGER_TORSO_BACK_BODY,
    armFrontSvg: RANGER_ARM_FRONT_SVG,
    armFrontBody: RANGER_ARM_FRONT_BODY,
    armSideSvg: RANGER_ARM_SIDE_SVG,
    armSideBody: RANGER_ARM_SIDE_BODY,
    armInnerSvg: RANGER_ARM_INNER_SVG,
    armInnerBody: RANGER_ARM_INNER_BODY,
    armBackSvg: RANGER_ARM_BACK_SVG,
    armBackBody: RANGER_ARM_BACK_BODY,
    legFrontSvg: RANGER_LEG_FRONT_SVG,
    legFrontBody: RANGER_LEG_FRONT_BODY,
    legSideSvg: RANGER_LEG_SIDE_SVG,
    legSideBody: RANGER_LEG_SIDE_BODY,
    legInnerSvg: RANGER_LEG_INNER_SVG,
    legInnerBody: RANGER_LEG_INNER_BODY,
    legBackSvg: RANGER_LEG_BACK_SVG,
    legBackBody: RANGER_LEG_BACK_BODY,
    drawToCanvas: drawRangerPortraitToCanvas,
    drawSideToCanvas: drawRangerSideToCanvas,
    drawBackToCanvas: drawRangerBackToCanvas,
    drawChestToCanvas: drawRangerChestToCanvas,
    drawTorsoSideToCanvas: drawRangerTorsoSideToCanvas,
    drawTorsoBackToCanvas: drawRangerTorsoBackToCanvas,
    drawArmFrontToCanvas: drawRangerArmFrontToCanvas,
    drawArmSideToCanvas: drawRangerArmSideToCanvas,
    drawArmInnerToCanvas: drawRangerArmInnerToCanvas,
    drawArmBackToCanvas: drawRangerArmBackToCanvas,
    drawLegFrontToCanvas: drawRangerLegFrontToCanvas,
    drawLegSideToCanvas: drawRangerLegSideToCanvas,
    drawLegInnerToCanvas: drawRangerLegInnerToCanvas,
    drawLegBackToCanvas: drawRangerLegBackToCanvas,
};
