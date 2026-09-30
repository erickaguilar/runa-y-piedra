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
    body: `<path d="M12 21s-7.5-4.9-10-9.3C.4 8.6 2.3 5 5.7 5c2 0 3.4 1.1 4.3 2.4h4c.9-1.3 2.3-2.4 4.3-2.4 3.4 0 5.3 3.6 3.7 6.7C19.5 16.1 12 21 12 21z"/>`,
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
};

/**
 * Mapping between legacy Unicode emojis and SVG icon definitions.
 */
export const EMOJI_TO_ICON_MAP = [
  { regex: /⚔\uFE0F?/g, icon: 'swords', defaultColor: '#94a3b8' },
  { regex: /🏰\uFE0F?/g, icon: 'castle', defaultColor: '#fbbf24' },
  { regex: /🌋\uFE0F?/g, icon: 'volcano', defaultColor: '#f97316' },
  { regex: /🛡\uFE0F?/g, icon: 'shield', defaultColor: '#38bdf8' },
  { regex: /⚙\uFE0F?/g, icon: 'settings', defaultColor: '#cbd5e1' },
  { regex: /🚪\uFE0F?/g, icon: 'door', defaultColor: '#d97706' },
  { regex: /🔥\uFE0F?/g, icon: 'flame', defaultColor: '#ef4444' },
  { regex: /📦\uFE0F?/g, icon: 'chest', defaultColor: '#f59e0b' },
  { regex: /🗝\uFE0F?/g, icon: 'key', defaultColor: '#fbbf24' },
  { regex: /💎\uFE0F?/g, icon: 'gem', defaultColor: '#38bdf8' },
  { regex: /🏆\uFE0F?/g, icon: 'trophy', defaultColor: '#eab308' },
  { regex: /✨\uFE0F?/g, icon: 'sparkles', defaultColor: '#facc15' },
  { regex: /⚠\uFE0F?/g, icon: 'warning', defaultColor: '#f59e0b' },
  { regex: /✅\uFE0F?/g, icon: 'check', defaultColor: '#22c55e' },
  { regex: /📱\uFE0F?/g, icon: 'share', defaultColor: '#38bdf8' },
  { regex: /📋\uFE0F?/g, icon: 'copy', defaultColor: '#cbd5e1' },
  { regex: /🧭\uFE0F?/g, icon: 'compass', defaultColor: '#38bdf8' },
  { regex: /🪶\uFE0F?/g, icon: 'feather', defaultColor: '#10b981' },
  { regex: /🪄\uFE0F?/g, icon: 'wand', defaultColor: '#a855f7' },
  { regex: /👑\uFE0F?/g, icon: 'crown', defaultColor: '#fbbf24' },
  { regex: /🔒\uFE0F?/g, icon: 'lock', defaultColor: '#f59e0b' },
  { regex: /🌀\uFE0F?/g, icon: 'vortex', defaultColor: '#38bdf8' },
  { regex: /🪨\uFE0F?/g, icon: 'stone', defaultColor: '#a8a29e' },
  { regex: /💀\uFE0F?/g, icon: 'skull', defaultColor: '#e2e8f0' },
  { regex: /🔊\uFE0F?/g, icon: 'soundOn', defaultColor: '#fbbf24' },
  { regex: /🔇\uFE0F?/g, icon: 'soundOff', defaultColor: '#94a3b8' },
  { regex: /❤\uFE0F?/g, icon: 'heart', defaultColor: '#ef4444' },
  { regex: /🖤\uFE0F?/g, icon: 'heart', defaultColor: '#475569' },
  { regex: /⬆\uFE0F?/g, icon: 'arrowUp', defaultColor: '#fff' },
  { regex: /✦/g,         icon: 'star', defaultColor: '#fde68a' },
  { regex: /📷\uFE0F?/g, icon: 'camera', defaultColor: '#38bdf8' },
  { regex: /✕/g,        icon: 'x',     defaultColor: '#94a3b8' },
];

/**
 * Normalizes input name or emoji to an icon definition.
 */
export function resolveIcon(nameOrEmoji) {
  if (!nameOrEmoji) return ICONS.castle;

  // Direct match in registry
  if (ICONS[nameOrEmoji]) return ICONS[nameOrEmoji];

  // Emoji alias check
  const mapped = EMOJI_TO_ICON_MAP.find(m => m.regex.test(nameOrEmoji));
  if (mapped && ICONS[mapped.icon]) return ICONS[mapped.icon];

  return ICONS.castle;
}

/**
 * Generates an inline HTML SVG string for a given icon.
 * 
 * @param {string} nameOrEmoji - Icon key ('castle', 'shield') or unicode emoji ('🏰', '🛡️')
 * @param {Object} options - Customization options
 * @param {number|string} [options.size=18] - Width/height in pixels
 * @param {string} [options.color] - Color (defaults to icon color or 'currentColor')
 * @param {string} [options.className='svg-icon'] - CSS class name
 * @param {string} [options.style=''] - Extra inline CSS
 * @returns {string} Clean SVG markup string
 */
export function renderIcon(nameOrEmoji, options = {}) {
  const icon = resolveIcon(nameOrEmoji);
  const size = options.size !== undefined ? options.size : 18;
  const color = options.color || icon.defaultColor || 'currentColor';
  const className = options.className ? `svg-icon ${options.className}` : 'svg-icon';
  const style = options.style ? ` style="${options.style}"` : '';

  const fill = icon.fill === 'currentColor' ? color : (icon.fill || 'none');
  const stroke = icon.stroke === 'currentColor' ? color : (icon.stroke || 'none');
  const strokeWidth = icon.strokeWidth ? ` stroke-width="${icon.strokeWidth}"` : '';

  return `<svg class="${className}" width="${size}" height="${size}" viewBox="${icon.viewBox}" fill="${fill}" stroke="${stroke}"${strokeWidth}${style}>${icon.body}</svg>`;
}

/**
 * Converts all known emojis inside a text string into crisp inline SVG icons.
 * Perfect for narrative HUD messages, level rewards, descriptions and buttons.
 * 
 * @param {string} text - Input text containing emojis
 * @param {Object} [options] - Options passed to renderIcon
 * @param {number} [options.size=16] - SVG icon size
 * @returns {string} Text with emojis replaced by inline SVGs
 */
export function replaceEmojisWithSvg(text, options = {}) {
  if (!text || typeof text !== 'string') return text || '';
  const size = options.size || 16;

  let result = text;
  for (const item of EMOJI_TO_ICON_MAP) {
    result = result.replace(item.regex, () => {
      return renderIcon(item.icon, {
        size,
        color: options.color || item.defaultColor,
        className: options.className || 'narrative-icon',
        style: options.style || 'margin:0 3px; vertical-align:-2px;',
      });
    });
  }

  return result;
}

/**
 * Escapa texto controlado por el usuario para interpolarlo en HTML
 * (nombres de jugador) sin riesgo de XSS. Cubre contexto de texto y atributos.
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Reinicia o dispara una animación CSS de resorte (Spring) sobre un elemento SVG o icono
 * utilizando el patrón estándar de reflow forzado (void el.offsetWidth) sin clonar el nodo.
 * 
 * @param {HTMLElement} el - Elemento SVG o contenedor del icono
 * @param {'pop-in' | 'reward'} [variant='pop-in'] - Tipo de animación de resorte
 */
export function replaySpringAnimation(el, variant = 'pop-in') {
  if (!el || !el.classList) return;
  el.classList.remove('pop-in', 'reward', 'done');
  void el.offsetWidth; // fuerza reflow para reiniciar la animación
  el.classList.add(variant);
  // Liberar will-change cuando termine la animación
  el.addEventListener('animationend', () => {
    el.classList.remove(variant);
    el.classList.add('done');
  }, { once: true });
}
