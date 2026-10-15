// src/heroes/heroPortraits.js
import * as THREE from 'three';

/**
 * SVG canónico del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Papel pergamino Washi (#d6cfc2) y marco perimetral de tinta Sumi (#0c0a09).
 * - Corona real con almenas de oro viejo (#b45309, #d97706), filo áureo (#fef08a) y gema Hanko bermellón (#991b1b, #dc2626).
 * - Rostro caligráfico con cejas severas, esclerótica blanca con pupila azul espiritual (#0284c7),
 *   boca firme y cicatriz de tinta (#78716c).
 */
export const GUARDIAN_PORTRAIT_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="26" width="30" height="5" fill="#a8a29e"/><rect x="1" y="13" width="3" height="18" fill="#bfb6a6"/><rect x="28" y="13" width="3" height="18" fill="#a8a29e"/><rect x="1" y="1" width="30" height="4" fill="#1c1917"/><path d="M1,1 H6 V5 H12 V1 H20 V5 H26 V1 H31 V12 H1 Z" fill="#b45309"/><path d="M2,2 H5 V6 H13 V2 H19 V6 H27 V2 H30 V10 H2 Z" fill="#d97706"/><g fill="#fef08a"><rect x="2" y="2" width="3" height="1"/><rect x="13" y="2" width="6" height="1"/><rect x="27" y="2" width="3" height="1"/><rect x="2" y="9" width="28" height="1"/></g><rect x="1" y="11" width="30" height="2" fill="#0c0a09"/><rect x="1" y="13" width="30" height="2" fill="#78716c"/><rect x="13" y="3" width="6" height="7" fill="#0c0a09"/><rect x="14" y="4" width="4" height="5" fill="#991b1b"/><rect x="14" y="4" width="3" height="3" fill="#dc2626"/><rect x="14" y="4" width="1" height="1" fill="#ffffff"/><rect x="6" y="16" width="6" height="2" fill="#0c0a09"/><rect x="20" y="16" width="6" height="2" fill="#0c0a09"/><rect x="7" y="18" width="4" height="4" fill="#0c0a09"/><rect x="21" y="18" width="4" height="4" fill="#0c0a09"/><rect x="7" y="18" width="2" height="2" fill="#ffffff"/><rect x="21" y="18" width="2" height="2" fill="#ffffff"/><rect x="9" y="20" width="2" height="2" fill="#0284c7"/><rect x="23" y="20" width="2" height="2" fill="#0284c7"/><rect x="12" y="25" width="8" height="2" fill="#450a0a"/><rect x="13" y="25" width="6" height="1" fill="#0c0a09"/><rect x="24" y="23" width="1" height="4" fill="#78716c"/>`;

export const GUARDIAN_PORTRAIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">${GUARDIAN_PORTRAIT_BODY}</svg>`;

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

  ctx.fillStyle = '#1c1917';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 4 * s);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(1 * s, 1 * s, 5 * s, 11 * s);
  ctx.fillRect(6 * s, 5 * s, 6 * s, 7 * s);
  ctx.fillRect(12 * s, 1 * s, 8 * s, 11 * s);
  ctx.fillRect(20 * s, 5 * s, 6 * s, 7 * s);
  ctx.fillRect(26 * s, 1 * s, 5 * s, 11 * s);

  ctx.fillStyle = '#d97706';
  ctx.fillRect(2 * s, 2 * s, 3 * s, 8 * s);
  ctx.fillRect(5 * s, 6 * s, 8 * s, 4 * s);
  ctx.fillRect(13 * s, 2 * s, 6 * s, 8 * s);
  ctx.fillRect(19 * s, 6 * s, 8 * s, 4 * s);
  ctx.fillRect(27 * s, 2 * s, 3 * s, 8 * s);

  ctx.fillStyle = '#fef08a';
  ctx.fillRect(2 * s, 2 * s, 3 * s, 1 * s);
  ctx.fillRect(13 * s, 2 * s, 6 * s, 1 * s);
  ctx.fillRect(27 * s, 2 * s, 3 * s, 1 * s);
  ctx.fillRect(2 * s, 9 * s, 28 * s, 1 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 11 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(1 * s, 13 * s, 30 * s, 2 * s);

  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(13 * s, 3 * s, 6 * s, 7 * s);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(14 * s, 4 * s, 4 * s, 5 * s);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(14 * s, 4 * s, 3 * s, 3 * s);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(14 * s, 4 * s, 1 * s, 1 * s);

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
 * Catálogo canónico de retratos de héroes para la UI e integración 3D.
 */
export const HERO_PORTRAITS = {
  guardian: {
    id: 'guardian',
    icon: 'avatar_guardian',
    viewBox: '0 0 32 32',
    svg: GUARDIAN_PORTRAIT_SVG,
    body: GUARDIAN_PORTRAIT_BODY,
    drawToCanvas: drawGuardianPortraitToCanvas,
  },
  wizard: {
    id: 'wizard',
    icon: 'avatar_wizard',
    viewBox: '0 0 32 32',
    svg: WIZARD_PORTRAIT_SVG,
    body: WIZARD_PORTRAIT_BODY,
    chestSvg: WIZARD_CHEST_SVG,
    chestBody: WIZARD_CHEST_BODY,
    drawToCanvas: drawWizardHeadToCanvas,
    drawChestToCanvas: drawWizardChestToCanvas,
  },
  ranger: {
    id: 'ranger',
    icon: 'avatar_ranger',
    viewBox: '0 0 32 32',
    svg: RANGER_PORTRAIT_SVG,
    body: RANGER_PORTRAIT_BODY,
    drawToCanvas: drawRangerPortraitToCanvas,
  },
  paladin: {
    id: 'paladin',
    icon: 'avatar_paladin',
    viewBox: '0 0 32 32',
    svg: PALADIN_PORTRAIT_SVG,
    body: PALADIN_PORTRAIT_BODY,
    drawToCanvas: drawPaladinPortraitToCanvas,
  },
  adventurer: {
    id: 'adventurer',
    icon: 'avatar_adventurer',
    viewBox: '0 0 32 32',
    svg: ADVENTURER_PORTRAIT_SVG,
    body: ADVENTURER_PORTRAIT_BODY,
    drawToCanvas: drawAdventurerPortraitToCanvas,
  },
};

// Caché Singleton de texturas CanvasTexture por héroe y resolución (reutilización global)
const _faceTextureCache = new Map();
const _chestTextureCache = new Map();

// Caché Singleton de materiales MeshLambertMaterial por héroe (reutilización global)
const _faceMaterialCache = new Map();
const _chestMaterialCache = new Map();

/**
 * Genera o recupera del caché la textura CanvasTexture de Three.js para la cara del héroe.
 * Renderizado 100% síncrono píxel a píxel: cero parseo de XML/SVG, cero GC y 60 FPS estables.
 */
export function createHeroFaceTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_faceTextureCache.has(key)) {
    return _faceTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _faceTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material MeshLambertMaterial frontal para la cabeza 3D del héroe.
 */
export function createHeroFaceMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_faceMaterialCache.has(heroId)) {
      return _faceMaterialCache.get(heroId);
    }
    const mat = new THREE.MeshLambertMaterial({ color: 0xd6cfc2 });
    mat.userData = { isShared: true, heroId };
    _faceMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_faceMaterialCache.has(heroId)) {
    return _faceMaterialCache.get(heroId);
  }

  const texture = createHeroFaceTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _faceMaterialCache.set(heroId, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura CanvasTexture de Three.js para el torso / pecho del héroe.
 * Renderizado 100% síncrono píxel a píxel.
 */
export function createHeroChestTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_chestTextureCache.has(key)) {
    return _chestTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawChestToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawChestToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _chestTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material MeshLambertMaterial frontal para el torso / pecho 3D del héroe.
 */
export function createHeroChestMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_chestMaterialCache.has(heroId)) {
      return _chestMaterialCache.get(heroId);
    }
    const mat = new THREE.MeshLambertMaterial({ color: 0x581c87 });
    mat.userData = { isShared: true, heroId };
    _chestMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_chestMaterialCache.has(heroId)) {
    return _chestMaterialCache.get(heroId);
  }

  const texture = createHeroChestTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _chestMaterialCache.set(heroId, mat);
  return mat;
}

/**
 * Libera de forma explícita todos los materiales y texturas cacheados en memoria de GPU.
 */
export function disposeHeroPortraitsCache() {
  for (const mat of _faceMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _faceMaterialCache.clear();

  for (const tex of _faceTextureCache.values()) {
    tex.dispose?.();
  }
  _faceTextureCache.clear();

  for (const mat of _chestMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _chestMaterialCache.clear();

  for (const tex of _chestTextureCache.values()) {
    tex.dispose?.();
  }
  _chestTextureCache.clear();
}

