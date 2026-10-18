/**
 * Icons.js - Global Reusable SVG Icon Registry
 * 
 * Centralized repository of high-resolution vector SVG icons for Runa y Piedra.
 * Provides direct icon rendering, custom sizing/coloring, and automated
 * emoji-to-SVG conversion for menus, HUD notifications, buttons, and levels.
 */

import { ICONS, ICON_ALIASES, EMOJI_TO_ICON_MAP } from './icons.data.js';

// Re-export de los datos para mantener la API historica de este modulo.
export { ICONS, ICON_ALIASES, EMOJI_TO_ICON_MAP };

/**
 * Normalizes input name or emoji to an icon definition.
 */
export function resolveIcon(nameOrEmoji) {
  if (!nameOrEmoji) return ICONS.castle;

  // Direct match in registry
  if (ICONS[nameOrEmoji]) return ICONS[nameOrEmoji];

  // Alias check
  if (ICON_ALIASES[nameOrEmoji] && ICONS[ICON_ALIASES[nameOrEmoji]]) {
    return ICONS[ICON_ALIASES[nameOrEmoji]];
  }

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
  const shapeRendering = icon.shapeRendering ? ` shape-rendering="${icon.shapeRendering}"` : '';

  return `<svg class="${className}" width="${size}" height="${size}" viewBox="${icon.viewBox}" fill="${fill}" stroke="${stroke}"${strokeWidth}${shapeRendering}${style}>${icon.body}</svg>`;
}

/**
 * Converts all icon shortcodes (:icon:) and known emojis inside a text string into crisp inline SVG icons.
 * Perfect for narrative HUD messages, level rewards, descriptions and buttons.
 * 
 * @param {string} text - Input text containing :shortcodes: or emojis
 * @param {Object} [options] - Options passed to renderIcon
 * @param {number} [options.size=16] - SVG icon size
 * @param {string} [options.color] - Color (defaults to icon color or 'currentColor')
 * @param {string} [options.className] - Extra CSS class name
 * @param {string} [options.style] - Extra inline CSS
 * @returns {string} Text with icon shortcodes and emojis replaced by inline SVGs
 */
export function replaceEmojisWithSvg(text, options = {}) {
  if (!text || typeof text !== 'string') return text || '';
  const size = options.size || 16;

  let result = text;

  // 1. Reemplazo de shortcodes canónicos de la biblioteca SVG (:castle:, :key:, etc.)
  result = result.replace(/:([a-zA-Z0-9_-]+):/g, (match, iconName) => {
    if (ICONS[iconName] || ICON_ALIASES[iconName]) {
      return renderIcon(iconName, {
        size,
        color: options.color,
        className: options.className || 'narrative-icon',
        style: options.style || 'margin:0 3px; vertical-align:-2px;',
      });
    }
    return match;
  });

  // 2. Retrocompatibilidad para cualquier emoji residual
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

export const replaceIconsWithSvg = replaceEmojisWithSvg;

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
