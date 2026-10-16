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
 * SVG canónico del Perfil Lateral de la Cabeza del Guardián (32x32) en estilo Sumi-e Pixel Art:
 * - Orientación base (+X, lado derecho del cubo mirando desde +Z): frente a la izquierda (x=0), nuca a la derecha (x=31).
 * - Continuación exacta en y=1..12 del aro real de la corona dorada (#b45309, #d97706, #fef08a) con remaches y banda de tinta (#0c0a09).
 * - Sombra de ceño y sien (#78716c) en y=13..14 que empata con la cara frontal.
 * - Patilla y cabello corto gris piedra de coloso veterano (#292524, #44403c, #57534e, #78716c) con trazos Kasure.
 * - Oreja estilizada Sumi-e en relieve pergamino (#d6cfc2, #a8a29e, #0c0a09) y carrillera/placa lateral acorazada (#44403c, #b45309, #d97706).
 */
export const GUARDIAN_SIDE_BODY = `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="1" width="30" height="4" fill="#1c1917"/><path d="M1,1 H6 V5 H12 V1 H20 V5 H26 V1 H31 V12 H1 Z" fill="#b45309"/><path d="M2,2 H5 V6 H13 V2 H19 V6 H27 V2 H30 V10 H2 Z" fill="#d97706"/><g fill="#fef08a"><rect x="2" y="2" width="3" height="1"/><rect x="13" y="2" width="6" height="1"/><rect x="27" y="2" width="3" height="1"/><rect x="2" y="9" width="28" height="1"/></g><g fill="#0c0a09"><rect x="5" y="7" width="2" height="2"/><rect x="15" y="6" width="2" height="2"/><rect x="25" y="7" width="2" height="2"/></g><rect x="1" y="11" width="30" height="2" fill="#0c0a09"/><rect x="1" y="13" width="30" height="2" fill="#78716c"/><rect x="1" y="15" width="3" height="16" fill="#a8a29e"/><rect x="1" y="26" width="14" height="5" fill="#a8a29e"/><rect x="8" y="15" width="4" height="7" fill="#57534e"/><rect x="9" y="15" width="2" height="6" fill="#44403c"/><rect x="18" y="15" width="13" height="9" fill="#44403c"/><rect x="19" y="15" width="11" height="8" fill="#57534e"/><g fill="#292524"><rect x="20" y="15" width="2" height="8"/><rect x="24" y="15" width="2" height="8"/><rect x="28" y="15" width="2" height="8"/></g><g fill="#78716c"><rect x="22" y="16" width="2" height="6"/><rect x="26" y="16" width="2" height="6"/></g><rect x="12" y="16" width="6" height="8" fill="#0c0a09"/><rect x="13" y="17" width="4" height="6" fill="#d6cfc2"/><rect x="14" y="18" width="2" height="4" fill="#78716c"/><rect x="14" y="19" width="1" height="2" fill="#0c0a09"/><rect x="14" y="24" width="17" height="7" fill="#0c0a09"/><rect x="15" y="25" width="15" height="5" fill="#44403c"/><rect x="16" y="25" width="13" height="2" fill="#b45309"/><rect x="17" y="25" width="11" height="1" fill="#d97706"/><rect x="17" y="28" width="2" height="2" fill="#fef08a"/><rect x="25" y="28" width="2" height="2" fill="#fef08a"/>`;

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

  // Fondo oscuro interior de las almenas (y=1..4)
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(rx(1, 30), 1 * s, 30 * s, 4 * s);

  // Corona real lateral con almenas que empatan con frente (x=1..5) y nuca (x=26..30)
  ctx.fillStyle = '#b45309';
  ctx.fillRect(rx(1, 5), 1 * s, 5 * s, 11 * s);
  ctx.fillRect(rx(6, 6), 5 * s, 6 * s, 7 * s);
  ctx.fillRect(rx(12, 8), 1 * s, 8 * s, 11 * s);
  ctx.fillRect(rx(20, 6), 5 * s, 6 * s, 7 * s);
  ctx.fillRect(rx(26, 5), 1 * s, 5 * s, 11 * s);

  ctx.fillStyle = '#d97706';
  ctx.fillRect(rx(2, 3), 2 * s, 3 * s, 8 * s);
  ctx.fillRect(rx(5, 8), 6 * s, 8 * s, 4 * s);
  ctx.fillRect(rx(13, 6), 2 * s, 6 * s, 8 * s);
  ctx.fillRect(rx(19, 8), 6 * s, 8 * s, 4 * s);
  ctx.fillRect(rx(27, 3), 2 * s, 3 * s, 8 * s);

  // Filos áureos superiores e inferiores de la corona
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(rx(2, 3), 2 * s, 3 * s, 1 * s);
  ctx.fillRect(rx(13, 6), 2 * s, 6 * s, 1 * s);
  ctx.fillRect(rx(27, 3), 2 * s, 3 * s, 1 * s);
  ctx.fillRect(rx(2, 28), 9 * s, 28 * s, 1 * s);

  // Remaches laterales en el aro de la corona
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(5, 2), 7 * s, 2 * s, 2 * s);
  ctx.fillRect(rx(15, 2), 6 * s, 2 * s, 2 * s);
  ctx.fillRect(rx(25, 2), 7 * s, 2 * s, 2 * s);

  // Banda de tinta Sumi (y=11..12) y sombra de ceño/sien (y=13..14) idénticas al frente
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(rx(1, 30), 11 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(1, 30), 13 * s, 30 * s, 2 * s);

  // Sombra de transición con el borde de la cara (x=1..3) y mandíbula inferior (y=26..30)
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(rx(1, 3), 15 * s, 3 * s, 16 * s);
  ctx.fillRect(rx(1, 14), 26 * s, 14 * s, 5 * s);

  // Patilla de veterano frente a la oreja (x=8..11, y=15..21)
  ctx.fillStyle = '#57534e';
  ctx.fillRect(rx(8, 4), 15 * s, 4 * s, 7 * s);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(rx(9, 2), 15 * s, 2 * s, 6 * s);

  // Cabello corto gris piedra hacia la nuca con surcos Kasure (x=18..30, y=15..23)
  ctx.fillStyle = '#44403c';
  ctx.fillRect(rx(18, 13), 15 * s, 13 * s, 9 * s);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(rx(19, 11), 15 * s, 11 * s, 8 * s);
  ctx.fillStyle = '#292524';
  ctx.fillRect(rx(20, 2), 15 * s, 2 * s, 8 * s);
  ctx.fillRect(rx(24, 2), 15 * s, 2 * s, 8 * s);
  ctx.fillRect(rx(28, 2), 15 * s, 2 * s, 8 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(rx(22, 2), 16 * s, 2 * s, 6 * s);
  ctx.fillRect(rx(26, 2), 16 * s, 2 * s, 6 * s);

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
 * - Continuación trasera de la corona dorada (#b45309, #d97706, #fef08a) con broche imperial posterior.
 * - Cabello corto de coloso veterano en gris basalto y ceniza (#292524, #44403c, #57534e, #78716c) con trazos Kasure verticales.
 * - Cubrenuca / gorjal acorazado de acero y bronce con ribete áureo y remaches en y=24..30 que empata con los laterales.
 */
export const GUARDIAN_BACK_BODY = `<rect width="32" height="32" fill="#44403c"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="1" width="30" height="4" fill="#1c1917"/><path d="M1,1 H6 V5 H12 V1 H20 V5 H26 V1 H31 V12 H1 Z" fill="#b45309"/><path d="M2,2 H5 V6 H13 V2 H19 V6 H27 V2 H30 V10 H2 Z" fill="#d97706"/><g fill="#fef08a"><rect x="2" y="2" width="3" height="1"/><rect x="13" y="2" width="6" height="1"/><rect x="27" y="2" width="3" height="1"/><rect x="2" y="9" width="28" height="1"/></g><rect x="13" y="4" width="6" height="5" fill="#0c0a09"/><rect x="14" y="5" width="4" height="3" fill="#78350f"/><rect x="15" y="5" width="2" height="2" fill="#fef08a"/><rect x="1" y="11" width="30" height="2" fill="#0c0a09"/><rect x="1" y="13" width="30" height="2" fill="#78716c"/><rect x="2" y="15" width="28" height="9" fill="#57534e"/><g fill="#292524"><rect x="4" y="15" width="2" height="9"/><rect x="9" y="15" width="2" height="9"/><rect x="15" y="15" width="2" height="9"/><rect x="21" y="15" width="2" height="9"/><rect x="26" y="15" width="2" height="9"/></g><g fill="#78716c"><rect x="6" y="16" width="2" height="7"/><rect x="12" y="16" width="2" height="7"/><rect x="18" y="16" width="2" height="7"/><rect x="24" y="16" width="2" height="7"/></g><rect x="1" y="24" width="30" height="7" fill="#0c0a09"/><rect x="2" y="25" width="28" height="5" fill="#44403c"/><rect x="3" y="25" width="26" height="2" fill="#b45309"/><rect x="4" y="25" width="24" height="1" fill="#d97706"/><rect x="15" y="25" width="2" height="5" fill="#292524"/><g fill="#fef08a"><rect x="6" y="28" width="2" height="2"/><rect x="24" y="28" width="2" height="2"/></g>`;

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

  // Fondo interior de almenas traseras (y=1..4)
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(1 * s, 1 * s, 30 * s, 4 * s);

  // Corona real trasera (y=1..10)
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

  // Filos áureos
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(2 * s, 2 * s, 3 * s, 1 * s);
  ctx.fillRect(13 * s, 2 * s, 6 * s, 1 * s);
  ctx.fillRect(27 * s, 2 * s, 3 * s, 1 * s);
  ctx.fillRect(2 * s, 9 * s, 28 * s, 1 * s);

  // Broche imperial trasero en el centro de la corona
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(13 * s, 4 * s, 6 * s, 5 * s);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(14 * s, 5 * s, 4 * s, 3 * s);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15 * s, 5 * s, 2 * s, 2 * s);

  // Banda de tinta Sumi (y=11..12) y sombra bajo la corona (y=13..14)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(1 * s, 11 * s, 30 * s, 2 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(1 * s, 13 * s, 30 * s, 2 * s);

  // Cabello corto de veterano en la nuca con surcos Kasure (y=15..23)
  ctx.fillStyle = '#57534e';
  ctx.fillRect(2 * s, 15 * s, 28 * s, 9 * s);
  ctx.fillStyle = '#292524';
  ctx.fillRect(4 * s, 15 * s, 2 * s, 9 * s);
  ctx.fillRect(9 * s, 15 * s, 2 * s, 9 * s);
  ctx.fillRect(15 * s, 15 * s, 2 * s, 9 * s);
  ctx.fillRect(21 * s, 15 * s, 2 * s, 9 * s);
  ctx.fillRect(26 * s, 15 * s, 2 * s, 9 * s);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(6 * s, 16 * s, 2 * s, 7 * s);
  ctx.fillRect(12 * s, 16 * s, 2 * s, 7 * s);
  ctx.fillRect(18 * s, 16 * s, 2 * s, 7 * s);
  ctx.fillRect(24 * s, 16 * s, 2 * s, 7 * s);

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
 * Catálogo canónico de retratos de héroes para la UI e integración 3D.
 */
export const HERO_PORTRAITS = {
  guardian: {
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
    drawToCanvas: drawGuardianPortraitToCanvas,
    drawSideToCanvas: drawGuardianSideToCanvas,
    drawBackToCanvas: drawGuardianBackToCanvas,
    drawChestToCanvas: drawGuardianChestToCanvas,
  },
  wizard: {
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
    drawToCanvas: drawWizardHeadToCanvas,
    drawSideToCanvas: drawWizardSideToCanvas,
    drawBackToCanvas: drawWizardBackToCanvas,
    drawChestToCanvas: drawWizardChestToCanvas,
  },
  ranger: {
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
    drawToCanvas: drawRangerPortraitToCanvas,
    drawSideToCanvas: drawRangerSideToCanvas,
    drawBackToCanvas: drawRangerBackToCanvas,
    drawChestToCanvas: drawRangerChestToCanvas,
  },
  paladin: {
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
    drawToCanvas: drawPaladinPortraitToCanvas,
    drawSideToCanvas: drawPaladinSideToCanvas,
    drawBackToCanvas: drawPaladinBackToCanvas,
    drawChestToCanvas: drawPaladinChestToCanvas,
  },
  adventurer: {
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
    drawToCanvas: drawAdventurerPortraitToCanvas,
    drawSideToCanvas: drawAdventurerSideToCanvas,
    drawBackToCanvas: drawAdventurerBackToCanvas,
    drawChestToCanvas: drawAdventurerChestToCanvas,
  },
};

// Caché Singleton de texturas CanvasTexture por héroe y resolución (reutilización global)
const _faceTextureCache = new Map();
const _headSideTextureCache = new Map();
const _headBackTextureCache = new Map();
const _chestTextureCache = new Map();

// Caché Singleton de materiales MeshLambertMaterial por héroe (reutilización global)
const _faceMaterialCache = new Map();
const _headSideMaterialCache = new Map();
const _headBackMaterialCache = new Map();
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
 * Genera o recupera del caché la textura lateral (+X o -X) de la cabeza del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side - 'R' para cara +X (índice 0, flipX=false), 'L' para cara -X (índice 1, flipX=true).
 * @param {number} size
 */
export function createHeroHeadSideTexture(heroId, side = 'R', size = 64) {
  if (typeof document === 'undefined') return null;

  const normSide = side === 'L' ? 'L' : 'R';
  const key = `${heroId}_${normSide}_${size}`;
  if (_headSideTextureCache.has(key)) {
    return _headSideTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawSideToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawSideToCanvas(ctx, size, normSide === 'L');

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _headSideTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material lateral (+X o -X) para la cabeza 3D del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side - 'R' para cara +X (índice 0), 'L' para cara -X (índice 1).
 */
export function createHeroHeadSideMaterial(heroId, side = 'R') {
  const normSide = side === 'L' ? 'L' : 'R';
  const cacheKey = `${heroId}_${normSide}`;

  if (typeof document === 'undefined') {
    if (_headSideMaterialCache.has(cacheKey)) {
      return _headSideMaterialCache.get(cacheKey);
    }
    const mat = new THREE.MeshLambertMaterial({ color: 0xd6cfc2 });
    mat.userData = { isShared: true, heroId, side: normSide };
    _headSideMaterialCache.set(cacheKey, mat);
    return mat;
  }

  if (_headSideMaterialCache.has(cacheKey)) {
    return _headSideMaterialCache.get(cacheKey);
  }

  const texture = createHeroHeadSideTexture(heroId, normSide, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId, side: normSide };
  _headSideMaterialCache.set(cacheKey, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura trasera / nuca (-Z, índice 5) de la cabeza del héroe.
 */
export function createHeroHeadBackTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_headBackTextureCache.has(key)) {
    return _headBackTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawBackToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawBackToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _headBackTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material trasero / nuca (-Z, índice 5) para la cabeza 3D del héroe.
 */
export function createHeroHeadBackMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_headBackMaterialCache.has(heroId)) {
      return _headBackMaterialCache.get(heroId);
    }
    const mat = new THREE.MeshLambertMaterial({ color: 0x44403c });
    mat.userData = { isShared: true, heroId };
    _headBackMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_headBackMaterialCache.has(heroId)) {
    return _headBackMaterialCache.get(heroId);
  }

  const texture = createHeroHeadBackTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _headBackMaterialCache.set(heroId, mat);
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

  for (const mat of _headSideMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _headSideMaterialCache.clear();

  for (const tex of _headSideTextureCache.values()) {
    tex.dispose?.();
  }
  _headSideTextureCache.clear();

  for (const mat of _headBackMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _headBackMaterialCache.clear();

  for (const tex of _headBackTextureCache.values()) {
    tex.dispose?.();
  }
  _headBackTextureCache.clear();

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


