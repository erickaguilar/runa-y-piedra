import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { UIManager } from '../src/ui/UIManager.js';
import { APP_CONFIG } from '../src/config/constants.js';

describe('UIManager - Contratos de API de Configuración', () => {
  it('expone métodos de settings en el prototipo', () => {
    assert.equal(typeof UIManager.prototype.openSettingsModal, 'function');
    assert.equal(typeof UIManager.prototype.closeSettingsModal, 'function');
    assert.equal(typeof UIManager.prototype.toggleSettingsModal, 'function');
    assert.equal(typeof UIManager.prototype.openSettings, 'function');
    assert.equal(typeof UIManager.prototype.closeSettings, 'function');
    assert.equal(typeof UIManager.prototype.toggleSettings, 'function');
    assert.equal(typeof UIManager.prototype.showSettings, 'function');
    assert.equal(typeof UIManager.prototype.showConfirmDialog, 'function');
    assert.equal(typeof UIManager.prototype.closeConfirmDialog, 'function');
  });

  describe('comportamiento con DOM simulado', () => {
    let originalDocument;
    let originalLocalStorage;

    before(() => {
      originalDocument = globalThis.document;
      originalLocalStorage = globalThis.localStorage;

      const elementStore = new Map();
      const mockEl = (tag = 'div') => ({
        tagName: tag.toUpperCase(),
        style: {},
        classList: { add() {}, remove() {}, toggle() {} },
        innerHTML: '',
        value: '',
        children: [],
        addEventListener(evt, fn) { this['on' + evt] = fn; },
        appendChild(child) { this.children.push(child); return child; },
        remove() {
          for (const [k, v] of elementStore.entries()) {
            if (v === this) elementStore.delete(k);
          }
        },
      });

      globalThis.document = {
        getElementById: (id) => {
          if (!elementStore.has(id)) {
            elementStore.set(id, mockEl());
          }
          return elementStore.get(id);
        },
        createElement: (tag) => mockEl(tag),
        querySelectorAll: () => [],
        addEventListener: () => {},
        exitPointerLock: () => {},
      };

      globalThis.localStorage = {
        getItem: () => null,
        setItem: () => {},
      };
    });

    after(() => {
      globalThis.document = originalDocument;
      globalThis.localStorage = originalLocalStorage;
    });

    it('toggleSettings alterna el estado isSettingsOpen', () => {
      const ui = new UIManager();
      assert.equal(ui.isSettingsOpen, false);

      ui.openSettings();
      assert.equal(ui.isSettingsOpen, true);

      ui.closeSettings();
      assert.equal(ui.isSettingsOpen, false);

      ui.showSettings();
      assert.equal(ui.isSettingsOpen, true);

      ui.toggleSettings();
      assert.equal(ui.isSettingsOpen, false);

      ui.toggleSettings();
      assert.equal(ui.isSettingsOpen, true);
    });

    it('gestiona la visibilidad y actualización del HUD de inventario', () => {
      const ui = new UIManager();
      assert.equal(typeof ui.setInventoryVisible, 'function');
      assert.equal(typeof ui.updateInventory, 'function');

      ui.setInventoryVisible(true);
      assert.equal(ui.inventoryHud.style.display, 'flex');

      ui.setInventoryVisible(false);
      assert.equal(ui.inventoryHud.style.display, 'none');

      // Inventario vacío inicial
      ui.updateInventory({ keys: [], gems: 0, relics: [] });
      assert.match(ui.inventoryHud.innerHTML, /BOTÍN/);
      assert.match(ui.inventoryHud.innerHTML, /Vacío/);

      // Botín recolectado de cofres
      ui.updateInventory({
        keys: [{ id: 'llave_santuario', name: 'Llave del Santuario' }],
        gems: 250,
        relics: [{ id: 'caliz_sagrado', name: 'Cáliz Sagrado', icon: 'trophy', color: '#eab308' }],
      });

      assert.match(ui.inventoryHud.innerHTML, /Llave del Santuario/);
      assert.match(ui.inventoryHud.innerHTML, /250/);
      assert.match(ui.inventoryHud.innerHTML, /Cáliz Sagrado/);
      assert.equal(ui.inventory.gems, 250);
      assert.equal(ui.inventory.keys.length, 1);
      assert.equal(ui.inventory.relics.length, 1);
    });

    it('muestra la versión del proyecto en el modal de configuración', () => {
      const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
      assert.equal(APP_CONFIG.VERSION, packageJson.version);

      const ui = new UIManager();
      assert.equal(ui.version, packageJson.version);

      ui.openSettingsModal();
      assert.match(ui.uiEl.innerHTML, new RegExp(`v${packageJson.version}`));
      assert.match(ui.uiEl.innerHTML, /settings-version-pill/);
      assert.match(ui.uiEl.innerHTML, /settings-footer-version/);
      assert.match(ui.uiEl.innerHTML, /Runa y Piedra/);
    });

    it('muestra y gestiona el diálogo temático de confirmación para salir al menú', () => {
      const ui = new UIManager();
      let confirmed = false;
      let cancelled = false;

      ui.showConfirmDialog({
        title: '¿Abandonar Incursión?',
        message: 'Regresarás al menú principal y se cancelará tu expedición actual.',
        confirmText: 'Salir al Menú',
        cancelText: 'Seguir Jugando',
        onConfirm: () => { confirmed = true; },
        onCancel: () => { cancelled = true; },
      });

      const acceptBtn = document.getElementById('btn-confirm-accept');
      const cancelBtn = document.getElementById('btn-confirm-cancel');
      assert.equal(typeof acceptBtn.onclick, 'function');
      assert.equal(typeof cancelBtn.onclick, 'function');

      // Test cancelar
      cancelBtn.onclick();
      assert.equal(cancelled, true);
      assert.equal(confirmed, false);

      // Reabrir y test confirmar
      cancelled = false;
      ui.showConfirmDialog({
        onConfirm: () => { confirmed = true; },
        onCancel: () => { cancelled = true; },
      });
      acceptBtn.onclick();
      assert.equal(confirmed, true);

      // Verificar que closeConfirmDialog limpia el elemento
      ui.showConfirmDialog();
      const modalEl = document.getElementById('modal-confirm-dialog');
      assert.ok(modalEl);
      ui.closeConfirmDialog();
    });
  });
});

