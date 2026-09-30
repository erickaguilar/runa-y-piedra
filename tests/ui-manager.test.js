import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { UIManager } from '../src/ui/UIManager.js';

describe('UIManager - Contratos de API de Configuración', () => {
  it('expone métodos de settings en el prototipo', () => {
    assert.equal(typeof UIManager.prototype.openSettingsModal, 'function');
    assert.equal(typeof UIManager.prototype.closeSettingsModal, 'function');
    assert.equal(typeof UIManager.prototype.toggleSettingsModal, 'function');
    assert.equal(typeof UIManager.prototype.openSettings, 'function');
    assert.equal(typeof UIManager.prototype.closeSettings, 'function');
    assert.equal(typeof UIManager.prototype.toggleSettings, 'function');
    assert.equal(typeof UIManager.prototype.showSettings, 'function');
  });

  describe('comportamiento con DOM simulado', () => {
    let originalDocument;
    let originalLocalStorage;

    before(() => {
      originalDocument = globalThis.document;
      originalLocalStorage = globalThis.localStorage;

      const mockEl = () => ({
        style: {},
        classList: { add() {}, remove() {}, toggle() {} },
        innerHTML: '',
        value: '',
        addEventListener() {},
      });

      globalThis.document = {
        getElementById: () => mockEl(),
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
  });
});
