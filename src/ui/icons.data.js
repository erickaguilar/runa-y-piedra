// src/ui/icons.data.js
// Datos del registro global de iconos SVG (mapa ICONS, alias y equivalencias emoji->icono).
// Separado de la logica en src/ui/Icons.js (Fase 6). Sin cambios de contenido.

/**
 * Icons.js - Global Reusable SVG Icon Registry
 * 
 * Centralized repository of high-resolution vector SVG icons for Runa y Piedra.
 * Provides direct icon rendering, custom sizing/coloring, and automated
 * emoji-to-SVG conversion for menus, HUD notifications, buttons, and levels.
 */

export const ICONS = {
  castle: {
    name: 'castle',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#fbbf24',
    body: `<path d="M4 21V10l2-2h12l2 2v11M3 21h18M9 21v-4a3 3 0 0 1 6 0v4M4 7V4h3v3h2V4h2v3h2V4h2v3h2V4h3v3" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  volcano: {
    name: 'volcano',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#f97316',
    body: `<path d="M3 21h18l-5-12h-8L3 21zM9 9c0-3 1.5-5 3-6 1.5 1 3 3 3 6M10 13l1 2 2-1 1 3" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  swords: {
    name: 'swords',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#94a3b8',
    body: `<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l2 2M16 16l4 4M19 13l2 2M9.5 17.5L21 6V3h-3L6.5 14.5M11 19l-2 2M8 16l-4 4M5 13l-2 2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  raido: {
    name: 'raido',
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 4,
    defaultColor: '#d97706',
    body: `<path d="M27 14 L27 50" stroke-linecap="square"/><path d="M27 14 L44 22 L27 32" stroke-linecap="square"/>`,
  },

  hanko: {
    name: 'hanko',
    viewBox: '0 0 12 12',
    fill: 'none',
    stroke: 'none',
    defaultColor: '#991b1b',
    body: `<rect width="12" height="12" fill="#0c0a09"/><rect x="1" y="1" width="10" height="10" fill="#991b1b"/><path d="M2,2 h8 v1 h-8 z M2,4 h3 v1 h-3 z M7,4 h3 v1 h-3 z M5,3 h2 v6 h-2 z M2,7 h3 v2 h-3 z M7,7 h3 v1 h-3 z M2,9 h8 v1 h-8 z" fill="#d6cfc2"/>`,
  },

  shield: {
    name: 'shield',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 2v20" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  settings: {
    name: 'settings',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#cbd5e1',
    body: `<circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  terminal: {
    name: 'terminal',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#10b981',
    body: `<polyline points="4 17 10 11 4 5" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="19" x2="20" y2="19" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  refresh: {
    name: 'refresh',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  x: {
    name: 'x',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    defaultColor: '#94a3b8',
    body: `<line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  check: {
    name: 'check',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    defaultColor: '#22c55e',
    body: `<polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  warning: {
    name: 'warning',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#f59e0b',
    body: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/>`,
  },

  door: {
    name: 'door',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#d97706',
    body: `<path d="M4 21h16M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" stroke-linecap="round" stroke-linejoin="round"/><circle cx="14" cy="12" r="1" fill="currentColor"/>`,
  },

  chest: {
    name: 'chest',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#f59e0b',
    body: `<path d="M3 10c0-4.5 4-6.5 9-6.5s9 2 9 6.5v1H3v-1zM3 11v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8H3zM7 5.5v15.5M17 5.5v15.5M10 10h4v4h-4z" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/>`,
  },

  key: {
    name: 'key',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#fbbf24',
    body: `<circle cx="7.5" cy="15.5" r="4.5"/><path d="M11 12l10-10M17 6l2 2M19 4l2 2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  gem: {
    name: 'gem',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<polygon points="6 3 18 3 22 9 12 22 2 9 6 3" stroke-linecap="round" stroke-linejoin="round"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="22" x2="7" y2="9"/><line x1="12" y1="22" x2="17" y2="9"/><line x1="6" y1="3" x2="7" y2="9"/><line x1="18" y1="3" x2="17" y2="9"/>`,
  },

  trophy: {
    name: 'trophy',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#eab308',
    body: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34M18 4H6v7a6 6 0 0 0 12 0V4z" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  sparkles: {
    name: 'sparkles',
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    stroke: 'none',
    defaultColor: '#facc15',
    body: `<path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2zM19 16l1.2 2.8L23 20l-2.8 1.2L19 24l-1.2-2.8L15 20l2.8-1.2L19 16zM5 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/>`,
  },

  flame: {
    name: 'flame',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#ef4444',
    body: `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  share: {
    name: 'share',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    defaultColor: 'currentColor',
    body: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,
  },

  copy: {
    name: 'copy',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    defaultColor: 'currentColor',
    body: `<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`,
  },

  user: {
    name: 'user',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#94a3b8',
    body: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  },

  potion: {
    name: 'potion',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#f43f5e',
    body: `<path d="M9 2h6M10 2v3a4 4 0 0 1-.8 2.4L5 14.5A5 5 0 0 0 9.4 22h5.2a5 5 0 0 0 4.4-7.5l-4.2-7.1A4 4 0 0 1 14 5V2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 16c2 1 4-1 6 0s3 0 5-1" stroke-linecap="round"/>`,
  },

  gamepad: {
    name: 'gamepad',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#a855f7',
    body: `<rect x="2" y="6" width="20" height="12" rx="4" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="12" x2="10" y2="12" stroke-linecap="round"/><line x1="8" y1="10" x2="8" y2="14" stroke-linecap="round"/><circle cx="15" cy="13" r="1" fill="currentColor"/><circle cx="18" cy="11" r="1" fill="currentColor"/>`,
  },

  joystick: {
    name: 'joystick',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M5 19a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2H5v-2z" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="6" r="3" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="17" stroke-linecap="round"/>`,
  },

  target: {
    name: 'target',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#ef4444',
    body: `<circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="2" fill="currentColor"/>`,
  },

  action: {
    name: 'action',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    defaultColor: '#f59e0b',
    body: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  jump: {
    name: 'jump',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    defaultColor: '#94a3b8',
    body: `<polyline points="18 15 12 9 6 15" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="21" stroke-linecap="round"/>`,
  },

  compass: {
    name: 'compass',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  feather: {
    name: 'feather',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#10b981',
    body: `<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8L2 22M17.5 15H9" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  wand: {
    name: 'wand',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#a855f7',
    body: `<path d="M15 4V2M15 16v-2M8 9h2M20 9h-2M17.8 11.8L19 13M17.8 6.2L19 5M12.2 11.8L11 13M12.2 6.2L11 5M3 21l9-9" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  crown: {
    name: 'crown',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#fbbf24',
    body: `<path d="M3 18h18v-2l-3-10-4.5 5.5L12 4l-1.5 7.5L6 6l-3 10v2zM5 20h14" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  avatar_guardian: {
    name: 'avatar_guardian',
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'none',
    shapeRendering: 'crispEdges',
    defaultColor: '#fbbf24',
    body: `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="26" width="30" height="5" fill="#a8a29e"/><rect x="1" y="13" width="3" height="18" fill="#bfb6a6"/><rect x="28" y="13" width="3" height="18" fill="#a8a29e"/><rect x="1" y="1" width="30" height="4" fill="#1c1917"/><path d="M1,1 H6 V5 H12 V1 H20 V5 H26 V1 H31 V12 H1 Z" fill="#b45309"/><path d="M2,2 H5 V6 H13 V2 H19 V6 H27 V2 H30 V10 H2 Z" fill="#d97706"/><g fill="#fef08a"><rect x="2" y="2" width="3" height="1"/><rect x="13" y="2" width="6" height="1"/><rect x="27" y="2" width="3" height="1"/><rect x="2" y="9" width="28" height="1"/></g><rect x="1" y="11" width="30" height="2" fill="#0c0a09"/><rect x="1" y="13" width="30" height="2" fill="#78716c"/><rect x="13" y="3" width="6" height="7" fill="#0c0a09"/><rect x="14" y="4" width="4" height="5" fill="#991b1b"/><rect x="14" y="4" width="3" height="3" fill="#dc2626"/><rect x="14" y="4" width="1" height="1" fill="#ffffff"/><rect x="6" y="16" width="6" height="2" fill="#0c0a09"/><rect x="20" y="16" width="6" height="2" fill="#0c0a09"/><rect x="7" y="18" width="4" height="4" fill="#0c0a09"/><rect x="21" y="18" width="4" height="4" fill="#0c0a09"/><rect x="7" y="18" width="2" height="2" fill="#ffffff"/><rect x="21" y="18" width="2" height="2" fill="#ffffff"/><rect x="9" y="20" width="2" height="2" fill="#0284c7"/><rect x="23" y="20" width="2" height="2" fill="#0284c7"/><rect x="12" y="25" width="8" height="2" fill="#450a0a"/><rect x="13" y="25" width="6" height="1" fill="#0c0a09"/><rect x="24" y="23" width="1" height="4" fill="#78716c"/>`,
  },

  avatar_wizard: {
    name: 'avatar_wizard',
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'none',
    shapeRendering: 'crispEdges',
    defaultColor: '#a855f7',
    body: `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="1" width="30" height="3" fill="#1c1917"/><rect x="1" y="4" width="30" height="2" fill="#57534e"/><g fill="#78716c"><rect x="2" y="6" width="28" height="1"/><rect x="4" y="7" width="2" height="1"/><rect x="10" y="7" width="2" height="1"/><rect x="20" y="7" width="2" height="1"/><rect x="26" y="7" width="2" height="1"/></g><rect x="1" y="6" width="3" height="14" fill="#bfb6a6"/><rect x="28" y="6" width="3" height="14" fill="#a8a29e"/><rect x="9" y="8" width="14" height="1" fill="#a8a29e"/><rect x="15" y="7" width="2" height="5" fill="#581c87"/><rect x="14" y="9" width="4" height="1" fill="#581c87"/><rect x="15" y="8" width="2" height="3" fill="#a855f7"/><rect x="15" y="9" width="1" height="1" fill="#f3e8ff"/><g fill="#78716c"><rect x="1" y="6" width="3" height="12"/><rect x="28" y="6" width="3" height="12"/></g><g fill="#a8a29e"><rect x="2" y="8" width="2" height="10"/><rect x="28" y="8" width="2" height="10"/></g><g fill="#0c0a09"><rect x="5" y="10" width="8" height="2"/><rect x="19" y="10" width="8" height="2"/></g><g fill="#d6cfc2"><rect x="5" y="11" width="7" height="2"/><rect x="20" y="11" width="7" height="2"/><rect x="4" y="12" width="2" height="1"/><rect x="26" y="12" width="2" height="1"/></g><g fill="#ffffff"><rect x="6" y="11" width="4" height="1"/><rect x="22" y="11" width="4" height="1"/></g><rect x="6" y="13" width="5" height="5" fill="#0c0a09"/><rect x="21" y="13" width="5" height="5" fill="#0c0a09"/><rect x="7" y="14" width="4" height="4" fill="#f4efe4"/><rect x="21" y="14" width="4" height="4" fill="#f4efe4"/><rect x="8" y="14" width="3" height="4" fill="#6b21a8"/><rect x="22" y="14" width="3" height="4" fill="#6b21a8"/><rect x="8" y="15" width="2" height="3" fill="#a855f7"/><rect x="22" y="15" width="2" height="3" fill="#a855f7"/><rect x="7" y="14" width="2" height="2" fill="#ffffff"/><rect x="21" y="14" width="2" height="2" fill="#ffffff"/><rect x="7" y="18" width="4" height="1" fill="#a8a29e"/><rect x="21" y="18" width="4" height="1" fill="#a8a29e"/><rect x="15" y="15" width="2" height="4" fill="#bfb6a6"/><rect x="14" y="18" width="4" height="2" fill="#a8a29e"/><rect x="15" y="19" width="2" height="1" fill="#57534e"/><path d="M1,18 H5 V21 H9 V20 H13 V19 H19 V20 H23 V21 H27 V18 H31 V32 H1 Z" fill="#0c0a09"/><path d="M2,19 H4 V22 H8 V21 H24 V22 H28 V19 H30 V31 H2 Z" fill="#78716c"/><path d="M3,22 H7 V25 H5 V31 H27 V25 H25 V22 H29 V31 H3 Z" fill="#a8a29e"/><rect x="8" y="21" width="16" height="10" fill="#a8a29e"/><path d="M8,21 H14 V22 H18 V21 H24 V24 H26 V26 H22 V24 H18 V23 H14 V24 H10 V26 H6 V24 H8 Z" fill="#d6cfc2"/><rect x="10" y="21" width="4" height="1" fill="#ffffff"/><rect x="18" y="21" width="4" height="1" fill="#ffffff"/><rect x="13" y="23" width="6" height="2" fill="#1c1917"/><rect x="14" y="24" width="4" height="1" fill="#450a0a"/><g fill="#44403c"><rect x="6" y="27" width="1" height="4"/><rect x="11" y="25" width="1" height="6"/><rect x="15" y="26" width="2" height="5"/><rect x="20" y="25" width="1" height="6"/><rect x="25" y="27" width="1" height="4"/></g><g fill="#d6cfc2"><rect x="8" y="26" width="2" height="5"/><rect x="13" y="26" width="2" height="5"/><rect x="17" y="26" width="2" height="5"/><rect x="22" y="26" width="2" height="5"/></g>`,
  },

  avatar_ranger: {
    name: 'avatar_ranger',
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'none',
    shapeRendering: 'crispEdges',
    defaultColor: '#10b981',
    body: `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="10" width="3" height="21" fill="#bfb6a6"/><rect x="28" y="10" width="3" height="21" fill="#a8a29e"/><rect x="1" y="27" width="30" height="4" fill="#a8a29e"/><rect x="4" y="29" width="24" height="2" fill="#78716c"/><path d="M1,1 H31 V10 H28 V8 H24 V9 H18 V7 H12 V9 H7 V7 H4 V11 H1 Z" fill="#0c0a09"/><path d="M1,1 H31 V8 H28 V6 H23 V8 H18 V5 H11 V8 H6 V6 H3 V9 H1 Z" fill="#14532d"/><path d="M2,1 H29 V5 H24 V6 H19 V4 H10 V6 H5 V4 H2 Z" fill="#15803d"/><g fill="#22c55e"><rect x="4" y="2" width="5" height="1"/><rect x="12" y="2" width="6" height="1"/><rect x="22" y="2" width="5" height="1"/></g><rect x="1" y="9" width="3" height="7" fill="#0c0a09"/><rect x="2" y="9" width="2" height="6" fill="#14532d"/><rect x="28" y="9" width="3" height="7" fill="#0c0a09"/><rect x="28" y="9" width="2" height="6" fill="#14532d"/><path d="M24,7 L29,2 H31 V4 L26,9 Z" fill="#0c0a09"/><path d="M25,7 L29,3 H30 V4 L26,8 Z" fill="#f4efe4"/><rect x="28" y="3" width="2" height="2" fill="#dc2626"/><rect x="4" y="9" width="24" height="1" fill="#a8a29e"/><path d="M5,12 H12 V14 H10 V13 H5 Z" fill="#0c0a09"/><path d="M20,12 H27 V13 H22 V14 H20 Z" fill="#0c0a09"/><rect x="6" y="14" width="5" height="5" fill="#0c0a09"/><rect x="21" y="14" width="5" height="5" fill="#0c0a09"/><rect x="7" y="15" width="4" height="4" fill="#f4efe4"/><rect x="21" y="15" width="4" height="4" fill="#f4efe4"/><rect x="8" y="15" width="3" height="4" fill="#047857"/><rect x="22" y="15" width="3" height="4" fill="#047857"/><rect x="8" y="16" width="2" height="3" fill="#10b981"/><rect x="22" y="16" width="2" height="3" fill="#10b981"/><rect x="7" y="15" width="2" height="2" fill="#ffffff"/><rect x="21" y="15" width="2" height="2" fill="#ffffff"/><g fill="#7f1d1d"><rect x="4" y="20" width="4" height="1"/><rect x="5" y="22" width="3" height="1"/><rect x="24" y="20" width="4" height="1"/><rect x="24" y="22" width="3" height="1"/></g><rect x="15" y="16" width="2" height="5" fill="#bfb6a6"/><rect x="14" y="20" width="4" height="1" fill="#78716c"/><rect x="13" y="17" width="6" height="1" fill="#a8a29e"/><rect x="14" y="17" width="4" height="1" fill="#f4efe4"/><rect x="11" y="24" width="9" height="2" fill="#451a03"/><path d="M11,24 H19 V23 H21 V25 H11 Z" fill="#0c0a09"/><rect x="13" y="26" width="5" height="1" fill="#78716c"/>`,
  },

  avatar_paladin: {
    name: 'avatar_paladin',
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'none',
    shapeRendering: 'crispEdges',
    defaultColor: '#f43f5e',
    body: `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="5" y="9" width="22" height="2" fill="#78716c"/><rect x="5" y="11" width="22" height="1" fill="#a8a29e"/><rect x="5" y="26" width="22" height="5" fill="#bfb6a6"/><rect x="8" y="28" width="16" height="3" fill="#a8a29e"/><path d="M1,1 H31 V23 H26 V11 H18 V17 H14 V11 H6 V23 H1 Z" fill="#0c0a09"/><path d="M1,1 H31 V21 H27 V10 H17 V16 H15 V10 H5 V21 H1 Z" fill="#52525b"/><path d="M2,1 H30 V8 H28 V19 H27 V9 H17 V15 H15 V9 H5 V19 H4 V8 H2 Z" fill="#71717a"/><rect x="3" y="2" width="26" height="4" fill="#a1a1aa"/><rect x="4" y="2" width="24" height="1" fill="#e4e4e7"/><g fill="#d97706"><rect x="5" y="8" width="10" height="1"/><rect x="17" y="8" width="10" height="1"/><rect x="15" y="6" width="2" height="9"/></g><rect x="15" y="4" width="2" height="2" fill="#991b1b"/><rect x="15" y="7" width="1" height="7" fill="#fef08a"/><g fill="#18181b"><rect x="3" y="4" width="1" height="1"/><rect x="28" y="4" width="1" height="1"/><rect x="2" y="13" width="2" height="1"/><rect x="28" y="13" width="2" height="1"/><rect x="2" y="17" width="2" height="1"/><rect x="28" y="17" width="2" height="1"/></g><rect x="7" y="12" width="6" height="2" fill="#292524"/><rect x="19" y="12" width="6" height="2" fill="#292524"/><rect x="8" y="12" width="4" height="1" fill="#57534e"/><rect x="20" y="12" width="4" height="1" fill="#57534e"/><rect x="7" y="14" width="5" height="5" fill="#0c0a09"/><rect x="20" y="14" width="5" height="5" fill="#0c0a09"/><rect x="8" y="15" width="4" height="4" fill="#f4efe4"/><rect x="20" y="15" width="4" height="4" fill="#f4efe4"/><rect x="9" y="15" width="3" height="4" fill="#1d4ed8"/><rect x="21" y="15" width="3" height="4" fill="#1d4ed8"/><rect x="9" y="16" width="2" height="3" fill="#38bdf8"/><rect x="21" y="16" width="2" height="3" fill="#38bdf8"/><rect x="8" y="15" width="2" height="2" fill="#ffffff"/><rect x="20" y="15" width="2" height="2" fill="#ffffff"/><rect x="14" y="18" width="4" height="3" fill="#bfb6a6"/><rect x="14" y="20" width="4" height="1" fill="#78716c"/><rect x="8" y="20" width="1" height="4" fill="#a8a29e"/><rect x="9" y="20" width="1" height="4" fill="#f4efe4"/><rect x="12" y="24" width="8" height="2" fill="#451a03"/><rect x="12" y="24" width="8" height="1" fill="#0c0a09"/><rect x="15" y="27" width="2" height="2" fill="#78716c"/><path d="M5,23 H7 V28 H11 V30 H21 V28 H25 V23 H27 V31 H5 Z" fill="#78716c"/><rect x="11" y="29" width="10" height="2" fill="#57534e"/>`,
  },

  avatar_adventurer: {
    name: 'avatar_adventurer',
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'none',
    shapeRendering: 'crispEdges',
    defaultColor: '#38bdf8',
    body: `<rect width="32" height="32" fill="#d6cfc2"/><path d="M0,0 H32 V32 H0 Z M1,1 V31 H31 V1 Z" fill="#0c0a09"/><rect x="1" y="10" width="3" height="21" fill="#bfb6a6"/><rect x="28" y="10" width="3" height="21" fill="#a8a29e"/><rect x="1" y="27" width="30" height="4" fill="#a8a29e"/><rect x="3" y="29" width="26" height="2" fill="#78716c"/><path d="M1,1 H31 V10 H28 V8 H25 V10 H21 V7 H17 V10 H13 V8 H8 V10 H4 V12 H1 Z" fill="#0c0a09"/><path d="M1,1 H31 V8 H28 V6 H25 V8 H21 V5 H17 V8 H13 V6 H8 V8 H4 V10 H1 Z" fill="#2e1909"/><path d="M2,1 H30 V6 H26 V7 H22 V4 H16 V7 H12 V5 H7 V7 H3 V8 H2 Z" fill="#451a03"/><g fill="#78350f"><rect x="4" y="2" width="5" height="2"/><rect x="12" y="2" width="6" height="1"/><rect x="22" y="2" width="5" height="2"/></g><rect x="1" y="10" width="2" height="5" fill="#0c0a09"/><rect x="2" y="10" width="1" height="4" fill="#2e1909"/><rect x="29" y="10" width="2" height="5" fill="#0c0a09"/><rect x="29" y="10" width="1" height="4" fill="#2e1909"/><rect x="4" y="9" width="24" height="1" fill="#a8a29e"/><path d="M6,11 H12 V13 H6 Z" fill="#0c0a09"/><path d="M20,11 H26 V13 H20 Z" fill="#0c0a09"/><rect x="6" y="11" width="5" height="1" fill="#451a03"/><rect x="21" y="11" width="5" height="1" fill="#451a03"/><rect x="6" y="14" width="5" height="5" fill="#0c0a09"/><rect x="21" y="14" width="5" height="5" fill="#0c0a09"/><rect x="7" y="15" width="4" height="4" fill="#f4efe4"/><rect x="21" y="15" width="4" height="4" fill="#f4efe4"/><rect x="8" y="15" width="3" height="4" fill="#0369a1"/><rect x="22" y="15" width="3" height="4" fill="#0369a1"/><rect x="8" y="16" width="2" height="3" fill="#38bdf8"/><rect x="22" y="16" width="2" height="3" fill="#38bdf8"/><rect x="7" y="15" width="2" height="2" fill="#ffffff"/><rect x="21" y="15" width="2" height="2" fill="#ffffff"/><rect x="15" y="16" width="2" height="4" fill="#bfb6a6"/><rect x="14" y="19" width="4" height="2" fill="#a8a29e"/><rect x="15" y="20" width="2" height="1" fill="#78716c"/><rect x="22" y="20" width="6" height="3" fill="#78716c"/><rect x="23" y="20" width="4" height="2" fill="#f4efe4"/><rect x="24" y="20" width="2" height="2" fill="#e7ded0"/><rect x="5" y="20" width="3" height="2" fill="#a8a29e"/><path d="M11,23 H13 V24 H20 V26 H12 V25 H11 Z" fill="#0c0a09"/><rect x="12" y="24" width="7" height="1" fill="#7f1d1d"/><rect x="12" y="24" width="2" height="1" fill="#f4efe4"/><rect x="14" y="27" width="4" height="1" fill="#78716c"/>`,
  },

  lock: {
    name: 'lock',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#f59e0b',
    body: `<rect x="4" y="11" width="16" height="10" rx="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="16" r="1.4" fill="currentColor"/>`,
  },

  vortex: {
    name: 'vortex',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M19 12a7 7 0 1 1-2-4.9M16.5 12a4.5 4.5 0 1 1-1.3-3.2M14 12a2 2 0 1 1-.6-1.4" stroke-linecap="round"/><circle cx="12" cy="12" r="1" fill="currentColor"/>`,
  },

  stone: {
    name: 'stone',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#a8a29e',
    body: `<path d="M4 14l3-6 6-3 6 4 1 6-4 5H8l-4-6z" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 8l4 3 5-2M11 11l-1 9" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  stairs: {
    name: 'stairs',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#f59e0b',
    body: `<path d="M4 19h4v-4h4v-4h4V7h4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 19v2h16v-2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 19v-2M12 15v-2M16 11v-2" stroke-linecap="round" opacity="0.6"/>`,
  },

  skull: {
    name: 'skull',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#e2e8f0',
    body: `<path d="M12 2a8 8 0 0 0-8 8c0 3 1.6 5.2 3.5 6.4V20a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-3.6C18.4 15.2 20 13 20 10a8 8 0 0 0-8-8z" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="11" r="1.6" fill="currentColor"/><circle cx="15" cy="11" r="1.6" fill="currentColor"/><line x1="12" y1="15" x2="12" y2="18" stroke-linecap="round"/>`,
  },

  soundOn: {
    name: 'soundOn',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#fbbf24',
    body: `<path d="M11 5L6 9H2v6h4l5 4V5z" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" stroke-linecap="round"/>`,
  },

  soundOff: {
    name: 'soundOff',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#94a3b8',
    body: `<path d="M11 5L6 9H2v6h4l5 4V5z" stroke-linecap="round" stroke-linejoin="round"/><line x1="23" y1="9" x2="17" y2="15" stroke-linecap="round"/><line x1="17" y1="9" x2="23" y2="15" stroke-linecap="round"/>`,
  },

  heart: {
    name: 'heart',
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    stroke: 'none',
    defaultColor: '#ef4444',
    body: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  },

  heartOutline: {
    name: 'heartOutline',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#64748b',
    body: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  arrowUp: {
    name: 'arrowUp',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    defaultColor: '#fff',
    body: `<polyline points="18 15 12 9 6 15" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="21" stroke-linecap="round"/>`,
  },

  star: {
    name: 'star',
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    stroke: 'none',
    defaultColor: '#fde68a',
    body: `<path d="M12 2l2.6 6.2 6.7.5-5.1 4.4 1.6 6.6L12 16l-5.8 3.7 1.6-6.6L2.7 8.7l6.7-.5L12 2z"/>`,
  },

  camera: {
    name: 'camera',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="13" r="4"/>`,
  },

  construction: {
    name: 'construction',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#f59e0b',
    body: `<rect x="3" y="6" width="18" height="10" rx="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v5M20 16v5M7 6l8 10M13 6l7 8.5M3 10.5l5 5.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  hammer: {
    name: 'hammer',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#f59e0b',
    body: `<path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9M17.6 3.6 20.4 6.4a2 2 0 0 1 0 2.8l-2.8 2.8-5.6-5.6 2.8-2.8a2 2 0 0 1 2.8 0z" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  pickaxe: {
    name: 'pickaxe',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#94a3b8',
    body: `<path d="m14 10-8.5 8.5a2.12 2.12 0 1 1-3-3L11 7M14.5 3.5 20.5 9.5M21 3a16.5 16.5 0 0 0-9 9" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  droplet: {
    name: 'droplet',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  anvil: {
    name: 'anvil',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#fb923c',
    body: `<path d="M3 7h18l-3 4h-4v2c0 1.5 1 2 2 2h3v3H5v-3h3c1 0 2-.5 2-2v-2H7L4 10c-1-1.5-1-3-1-3z" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  snowflake: {
    name: 'snowflake',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#67e8f9',
    body: `<path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07M10 4l2-2 2 2M10 20l2 2 2 2M4 10l-2 2 2 2M20 10l2 2-2 2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  biohazard: {
    name: 'biohazard',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#22c55e',
    body: `<circle cx="12" cy="12" r="2"/><path d="M12 7.5a4.5 4.5 0 0 0-4.5 4.5M16.5 12a4.5 4.5 0 0 0-4.5-4.5M7.5 16.5A4.5 4.5 0 0 0 12 12M12 2v4M5 20l3.5-2M19 20l-3.5-2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  orbit: {
    name: 'orbit',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#c084fc',
    body: `<circle cx="12" cy="12" r="3" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" stroke-linecap="round"/>`,
  },

  sun: {
    name: 'sun',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#f59e0b',
    body: `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  mapPin: {
    name: 'mapPin',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#ef4444',
    body: `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="3"/>`,
  },

  temple: {
    name: 'temple',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M3 21h18M4 18h16M12 2l10 5H2l10-5zM6 10v8M10 10v8M14 10v8M18 10v8" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  rocket: {
    name: 'rocket',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4.5c1.45-1.47 4.5-2 4.5-2M15 15v5s3.03-.55 4.5-2c1.47-1.45 2-4.5 2-4.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  bolt: {
    name: 'bolt',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#facc15',
    body: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  timer: {
    name: 'timer',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#fbbf24',
    body: `<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4M12 2v3" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  map: {
    name: 'map',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" stroke-linecap="round" stroke-linejoin="round"/><line x1="8" y1="2" x2="8" y2="18" stroke-linecap="round"/><line x1="16" y1="6" x2="16" y2="22" stroke-linecap="round"/>`,
  },

  save: {
    name: 'save',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 21 17 13 7 13 7 21" stroke-linecap="round" stroke-linejoin="round"/><polyline points="7 3 7 8 15 8" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  trash: {
    name: 'trash',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#ef4444',
    body: `<polyline points="3 6 5 6 21 6" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  download: {
    name: 'download',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round" stroke-linejoin="round"/><polyline points="7 10 12 15 17 10" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  upload: {
    name: 'upload',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#38bdf8',
    body: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 8 12 3 7 8" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="3" x2="12" y2="15" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  ban: {
    name: 'ban',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    defaultColor: '#ef4444',
    body: `<circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
};

/**
 * Convenient aliases for common icon names
 */
export const ICON_ALIASES = {
  hero_guardian: 'avatar_guardian',
  guardian: 'avatar_guardian',
  hero_wizard: 'avatar_wizard',
  wizard: 'avatar_wizard',
  hero_ranger: 'avatar_ranger',
  ranger: 'avatar_ranger',
  hero_paladin: 'avatar_paladin',
  paladin: 'avatar_paladin',
  hero_adventurer: 'avatar_adventurer',
  adventurer: 'avatar_adventurer',
  barrier: 'construction',
  pin: 'mapPin',
  monolith: 'temple',
  flash: 'bolt',
  clock: 'timer',
  atlas: 'map',
  lightning: 'bolt',
  disk: 'save',
  floppy: 'save',
  delete: 'trash',
  export: 'download',
  import: 'upload',
  prohibited: 'ban',
  noEntry: 'ban',
  stair: 'stairs',
  stairwell: 'stairs',
  losa: 'stairs',
  ladder: 'stairs',
  trapdoor: 'stairs',
};

/**
 * Mapping between legacy Unicode emojis and SVG icon definitions.
 */
export const EMOJI_TO_ICON_MAP = [
  { regex: /⚔\uFE0F?/g, icon: 'swords',       defaultColor: '#94a3b8' },
  { regex: /🏰\uFE0F?/g, icon: 'castle',       defaultColor: '#fbbf24' },
  { regex: /🌋\uFE0F?/g, icon: 'volcano',      defaultColor: '#f97316' },
  { regex: /🛡\uFE0F?/g, icon: 'shield',       defaultColor: '#38bdf8' },
  { regex: /⚙\uFE0F?/g, icon: 'settings',     defaultColor: '#cbd5e1' },
  { regex: /🚪\uFE0F?/g, icon: 'door',         defaultColor: '#d97706' },
  { regex: /🔥\uFE0F?/g, icon: 'flame',        defaultColor: '#ef4444' },
  { regex: /📦\uFE0F?/g, icon: 'chest',        defaultColor: '#f59e0b' },
  { regex: /🗝\uFE0F?/g, icon: 'key',          defaultColor: '#fbbf24' },
  { regex: /🧪\uFE0F?/g, icon: 'potion',       defaultColor: '#f43f5e' },
  { regex: /💎\uFE0F?/g, icon: 'gem',          defaultColor: '#38bdf8' },
  { regex: /🏆\uFE0F?/g, icon: 'trophy',       defaultColor: '#eab308' },
  { regex: /✨\uFE0F?/g, icon: 'sparkles',     defaultColor: '#facc15' },
  { regex: /⚠\uFE0F?/g, icon: 'warning',      defaultColor: '#f59e0b' },
  { regex: /✅\uFE0F?/g, icon: 'check',        defaultColor: '#22c55e' },
  { regex: /📱\uFE0F?/g, icon: 'share',        defaultColor: '#38bdf8' },
  { regex: /📋\uFE0F?/g, icon: 'copy',         defaultColor: '#cbd5e1' },
  { regex: /🧭\uFE0F?/g, icon: 'compass',      defaultColor: '#38bdf8' },
  { regex: /🪶\uFE0F?/g, icon: 'feather',      defaultColor: '#10b981' },
  { regex: /🪄\uFE0F?/g, icon: 'wand',         defaultColor: '#a855f7' },
  { regex: /👑\uFE0F?/g, icon: 'crown',        defaultColor: '#fbbf24' },
  { regex: /🔒\uFE0F?/g, icon: 'lock',         defaultColor: '#f59e0b' },
  { regex: /🌀\uFE0F?/g, icon: 'vortex',       defaultColor: '#38bdf8' },
  { regex: /🪨\uFE0F?/g, icon: 'stone',        defaultColor: '#a8a29e' },
  { regex: /🪜\uFE0F?/g, icon: 'stairs',       defaultColor: '#f59e0b' },
  { regex: /💀\uFE0F?/g, icon: 'skull',        defaultColor: '#e2e8f0' },
  { regex: /🔊\uFE0F?/g, icon: 'soundOn',      defaultColor: '#fbbf24' },
  { regex: /🔇\uFE0F?/g, icon: 'soundOff',     defaultColor: '#94a3b8' },
  { regex: /❤\uFE0F?/g, icon: 'heart',        defaultColor: '#ef4444' },
  { regex: /🖤\uFE0F?/g, icon: 'heartOutline', defaultColor: '#64748b' },
  { regex: /🤍\uFE0F?/g, icon: 'heartOutline', defaultColor: '#94a3b8' },
  { regex: /⬆\uFE0F?/g, icon: 'arrowUp',      defaultColor: '#fff' },
  { regex: /✦/g,         icon: 'star',         defaultColor: '#fde68a' },
  { regex: /📷\uFE0F?/g, icon: 'camera',       defaultColor: '#38bdf8' },
  { regex: /🎮\uFE0F?/g, icon: 'gamepad',      defaultColor: '#a855f7' },
  { regex: /🕹\uFE0F?/g, icon: 'joystick',     defaultColor: '#38bdf8' },
  { regex: /🎯\uFE0F?/g, icon: 'target',       defaultColor: '#ef4444' },
  { regex: /✕/g,        icon: 'x',            defaultColor: '#94a3b8' },
  { regex: /🚧/g,        icon: 'construction', defaultColor: '#f59e0b' },
  { regex: /🔨\uFE0F?/g, icon: 'hammer',       defaultColor: '#f59e0b' },
  { regex: /⛏\uFE0F?/g, icon: 'pickaxe',      defaultColor: '#94a3b8' },
  { regex: /💧\uFE0F?/g, icon: 'droplet',      defaultColor: '#38bdf8' },
  { regex: /❄\uFE0F?/g, icon: 'snowflake',    defaultColor: '#67e8f9' },
  { regex: /☣\uFE0F?/g, icon: 'biohazard',    defaultColor: '#22c55e' },
  { regex: /🪐\uFE0F?/g, icon: 'orbit',        defaultColor: '#c084fc' },
  { regex: /🌌\uFE0F?/g, icon: 'orbit',        defaultColor: '#c084fc' },
  { regex: /☀\uFE0F?/g, icon: 'sun',          defaultColor: '#f59e0b' },
  { regex: /📍\uFE0F?/g, icon: 'mapPin',       defaultColor: '#ef4444' },
  { regex: /🏛\uFE0F?/g, icon: 'temple',       defaultColor: '#38bdf8' },
  { regex: /🚀\uFE0F?/g, icon: 'rocket',       defaultColor: '#38bdf8' },
  { regex: /⚡\uFE0F?/g, icon: 'bolt',         defaultColor: '#facc15' },
  { regex: /⏱\uFE0F?/g, icon: 'timer',        defaultColor: '#fbbf24' },
  { regex: /🗺\uFE0F?/g, icon: 'map',          defaultColor: '#38bdf8' },
  { regex: /💾\uFE0F?/g, icon: 'save',         defaultColor: '#38bdf8' },
  { regex: /🗑\uFE0F?/g, icon: 'trash',        defaultColor: '#ef4444' },
  { regex: /🚫\uFE0F?/g, icon: 'ban',          defaultColor: '#ef4444' },
  { regex: /⏳\uFE0F?/g, icon: 'timer',        defaultColor: '#fbbf24' },
];
