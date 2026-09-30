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
    assert.equal(typeof UIManager.prototype.openDevModal, 'function');
    assert.equal(typeof UIManager.prototype.closeDevModal, 'function');
    assert.equal(typeof UIManager.prototype.toggleDevModal, 'function');
    assert.equal(typeof UIManager.prototype.openDev, 'function');
    assert.equal(typeof UIManager.prototype.closeDev, 'function');
    assert.equal(typeof UIManager.prototype.toggleDev, 'function');
    assert.equal(typeof UIManager.prototype.showDev, 'function');
    assert.equal(typeof UIManager.prototype.showConfirmDialog, 'function');
    assert.equal(typeof UIManager.prototype.closeConfirmDialog, 'function');
    assert.equal(typeof UIManager.prototype.openInventoryModal, 'function');
    assert.equal(typeof UIManager.prototype.closeInventoryModal, 'function');
    assert.equal(typeof UIManager.prototype.toggleInventoryModal, 'function');
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
      // La telemetría y el reload se movieron a herramientas dev exclusivas
      assert.doesNotMatch(ui.uiEl.innerHTML, /Telemetría de Red/);
    });

    it('gestiona el modal de herramientas dev (reload y telemetría) solo en desarrollo', () => {
      const uiDev = new UIManager({ isDev: true });
      assert.equal(uiDev.isDevMode, true);
      assert.equal(uiDev.devBtn.style.display, 'flex');
      assert.equal(uiDev.isDevOpen, false);

      const uiProd = new UIManager({ isDev: false });
      assert.equal(uiProd.isDevMode, false);
      assert.equal(uiProd.devBtn.style.display, 'none');

      uiDev.openDevModal();
      assert.equal(uiDev.isDevOpen, true);
      assert.match(uiDev.uiEl.innerHTML, /HERRAMIENTAS DEV/);
      assert.match(uiDev.uiEl.innerHTML, /btn-reload-page/);
      assert.match(uiDev.uiEl.innerHTML, /Recargar Página Ahora/);
      assert.match(uiDev.uiEl.innerHTML, /Telemetría de Red WebRTC/);
      assert.match(uiDev.uiEl.innerHTML, /btn-net-debug-on/);
      assert.match(uiDev.uiEl.innerHTML, /btn-dev-audit/);
      assert.match(uiDev.uiEl.innerHTML, /btn-dev-copy-state/);

      uiDev.closeDevModal();
      assert.equal(uiDev.isDevOpen, false);

      uiDev.toggleDev();
      assert.equal(uiDev.isDevOpen, true);
      uiDev.toggleDev();
      assert.equal(uiDev.isDevOpen, false);
    });

    it('el HUD de botín es interactivo y abre el modal al hacer clic o touch', () => {
      const ui = new UIManager();
      assert.equal(ui.isInventoryOpen, false);

      // Simular click en el botón de botín
      ui.inventoryHud.onclick();
      assert.equal(ui.isInventoryOpen, true);

      ui.closeInventoryModal();
      assert.equal(ui.isInventoryOpen, false);

      // Simular evento touch (touchend) en móvil
      let preventDefaultCalled = false;
      let stopPropagationCalled = false;
      const fakeTouchEvent = {
        cancelable: true,
        preventDefault() { preventDefaultCalled = true; },
        stopPropagation() { stopPropagationCalled = true; },
      };
      ui.inventoryHud['ontouchend'](fakeTouchEvent);
      assert.equal(ui.isInventoryOpen, true);
      assert.equal(preventDefaultCalled, true);
      assert.equal(stopPropagationCalled, true);
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

    it('abre y cierra el modal interactivo de botín con el desglose de tesoros', () => {
      const ui = new UIManager();
      assert.equal(ui.isInventoryOpen, false);

      // Cargar botín y abrir modal
      ui.updateInventory({
        keys: [{ id: 'llave_santuario', name: 'Llave del Santuario' }],
        gems: 150,
        relics: [{ id: 'corona_vacio', name: 'Corona del Vacío', icon: 'crown', color: '#a855f7' }],
      });

      ui.openInventoryModal();
      assert.equal(ui.isInventoryOpen, true);

      const overlay = document.getElementById('modal-inventory-overlay');
      assert.ok(overlay);
      assert.match(overlay.innerHTML, /BOTÍN DE EXPEDICIÓN/);
      assert.match(overlay.innerHTML, /Llave del Santuario/);
      assert.match(overlay.innerHTML, /150 Gemas/);
      assert.match(overlay.innerHTML, /Corona del Vacío/);

      // Cerrar modal
      ui.closeInventoryModal();
      assert.equal(ui.isInventoryOpen, false);

      // Toggle modal
      ui.toggleInventoryModal();
      assert.equal(ui.isInventoryOpen, true);
      ui.toggleInventoryModal();
      assert.equal(ui.isInventoryOpen, false);
    });
  });
});

