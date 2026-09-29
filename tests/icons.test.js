import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, replaceEmojisWithSvg, renderIcon, resolveIcon } from '../src/ui/Icons.js';

test('escapeHtml neutraliza vectores XSS', () => {
  assert.equal(
    escapeHtml('<img src=x onerror=alert(1)>'),
    '&lt;img src=x onerror=alert(1)&gt;'
  );
  assert.equal(escapeHtml('" onfocus="alert(1)'), '&quot; onfocus=&quot;alert(1)');
  assert.equal(escapeHtml("a'b&c"), 'a&#39;b&amp;c');
  assert.equal(escapeHtml(null), '');
});

test('nombres normales pasan intactos', () => {
  assert.equal(escapeHtml('Aventurero 123'), 'Aventurero 123');
  assert.equal(escapeHtml('El_Mago-99'), 'El_Mago-99');
});

test('llaves y cofres se convierten a SVG', () => {
  const out = replaceEmojisWithSvg('📦 Cofre con 🗝️ llave y 💎 gemas');
  assert.ok(!out.includes('📦') && !out.includes('🗝') && !out.includes('💎'));
  assert.ok(out.includes('<svg'));
});

test('nuevos iconos de gameplay convierten', () => {
  for (const e of ['🔒', '🌀', '🪨', '💀', '🔊', '🔇', '❤️', '🖤', '⬆️', '✦', '📷']) {
    const out = replaceEmojisWithSvg(`x ${e} y`);
    assert.ok(out.includes('<svg'), `emoji sin convertir: ${e}`);
  }
});

test('emojis desconocidos se dejan tal cual', () => {
  assert.equal(replaceEmojisWithSvg('hola 🛸 mundo').includes('🛸'), true);
});

test('resolveIcon cae a castle con desconocidos', () => {
  assert.equal(resolveIcon('no-existe').name, 'castle');
  assert.equal(resolveIcon('door').name, 'door');
});

test('renderIcon genera svg válido con tamaño y color', () => {
  const svg = renderIcon('heart', { size: 18, color: '#ef4444' });
  assert.ok(svg.startsWith('<svg '));
  assert.ok(svg.includes('width="18"'));
});
