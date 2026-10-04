import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { UIManager } from '../src/ui/UIManager.js';
import { APP_CONFIG } from '../src/config/constants.js';
import { ICONS, renderIcon, replaceEmojisWithSvg } from '../src/ui/Icons.js';

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
    assert.equal(typeof UIManager.prototype.showControlsHud, 'function');
    assert.equal(typeof UIManager.prototype.hideControlsHud, 'function');
    assert.equal(typeof UIManager.prototype.toggleControlsHud, 'function');
    assert.equal(typeof UIManager.prototype.setTutorialControlsVisible, 'function');
    assert.equal(typeof UIManager.prototype.setSettingsButtonVisible, 'function');
    assert.equal(typeof UIManager.prototype.openSaveSlotsModal, 'function');
    assert.equal(typeof UIManager.prototype.closeSaveSlotsModal, 'function');
    assert.equal(typeof UIManager.prototype.toggleSaveSlotsModal, 'function');
  });

  describe('comportamiento con DOM simulado', () => {
    let originalDocument;
    let originalLocalStorage;

    before(() => {
      originalDocument = globalThis.document;
      originalLocalStorage = globalThis.localStorage;

      const elementStore = new Map();
      let lastMockButton = null;
      let lastChapterButton = null;
      let lastLobbyButton = null;
      let lastChapterCard = null;
      let lastDeleteButton = null;
      let lastMenuSlotChip = null;
      let lastFilterTag = null;
      const mockEl = (tag = 'div') => {
        let _id = '';
        const classes = new Set();
        const el = {
          tagName: tag.toUpperCase(),
          style: {},
          className: '',
          classList: {
            add(c) { classes.add(c); el.className = Array.from(classes).join(' '); },
            remove(c) { classes.delete(c); el.className = Array.from(classes).join(' '); },
            toggle(c, force) {
              const has = force !== undefined ? !!force : !classes.has(c);
              if (has) classes.add(c); else classes.delete(c);
              el.className = Array.from(classes).join(' ');
              return has;
            },
            contains(c) { return classes.has(c); },
          },
          innerHTML: '',
          value: '',
          dataset: { potionIndex: '0', index: '0' },
          children: [],
          get id() { return _id; },
          set id(val) {
            _id = val;
            if (val) elementStore.set(val, el);
          },
          addEventListener(evt, fn) { this['on' + evt] = fn; },
          dispatchEvent(evt) {
            const fn = this['on' + (evt?.type || evt)];
            if (typeof fn === 'function') fn(evt);
          },
          click() { this.onclick?.(); },
          appendChild(child) { this.children.push(child); return child; },
          querySelector(sel) {
            if (sel?.includes('btn-use-potion')) {
              if (!lastMockButton) lastMockButton = mockEl('button');
              return lastMockButton;
            }
            if (sel?.includes('chapter-launch-btn')) {
              if (sel?.includes('lobby_tutorial')) {
                if (!lastLobbyButton) {
                  lastLobbyButton = mockEl('button');
                  lastLobbyButton.dataset = { chapterId: 'lobby_tutorial' };
                }
                return lastLobbyButton;
              }
              if (!lastChapterButton) {
                lastChapterButton = mockEl('button');
                lastChapterButton.dataset = { chapterId: 'capitulo_1' };
              }
              return lastChapterButton;
            }
            if (sel?.includes('chapter-card')) {
              if (!lastChapterCard) {
                lastChapterCard = mockEl('div');
                lastChapterCard.dataset = { chapterId: 'capitulo_1' };
              }
              return lastChapterCard;
            }
            if (sel?.includes('inv-filter-tag')) {
              if (!lastFilterTag) {
                lastFilterTag = mockEl('button');
                lastFilterTag.dataset = { filter: 'keys' };
              }
              return lastFilterTag;
            }
            return mockEl('span');
          },
          querySelectorAll(sel) {
            if (sel?.includes('chapter-launch-btn')) {
              if (!lastChapterButton) {
                lastChapterButton = mockEl('button');
                lastChapterButton.dataset = { chapterId: 'capitulo_1' };
              }
              if (!lastLobbyButton) {
                lastLobbyButton = mockEl('button');
                lastLobbyButton.dataset = { chapterId: 'lobby_tutorial' };
              }
              return [lastLobbyButton, lastChapterButton];
            }
            if (sel?.includes('chapter-card')) {
              if (!lastChapterCard) {
                lastChapterCard = mockEl('div');
                lastChapterCard.dataset = { chapterId: 'capitulo_1' };
              }
              return [lastChapterCard];
            }
            if (sel?.includes('inv-filter-tag')) {
              if (!lastFilterTag) {
                lastFilterTag = mockEl('button');
                lastFilterTag.dataset = { filter: 'keys' };
              }
              return [lastFilterTag];
            }
            if (sel?.includes('btn-use-potion')) {
              if (!lastMockButton) lastMockButton = mockEl('button');
              return [lastMockButton];
            }
            if (sel?.includes('btn-slot-delete')) {
              if (!lastDeleteButton) {
                lastDeleteButton = mockEl('button');
                lastDeleteButton.dataset = { slotId: 'slot_1' };
              }
              return [lastDeleteButton];
            }
            if (sel?.includes('menu-slot-chip')) {
              if (!lastMenuSlotChip) {
                lastMenuSlotChip = mockEl('button');
                lastMenuSlotChip.dataset = { slotId: 'slot_1' };
              }
              return [lastMenuSlotChip];
            }
            return [];
          },
          remove() {
            for (const [k, v] of elementStore.entries()) {
              if (v === this) elementStore.delete(k);
            }
            if (_id) elementStore.delete(_id);
          },
        };
        return el;
      };

      globalThis.document = {
        body: mockEl('body'),
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

      const storageStore = new Map();
      globalThis.localStorage = {
        getItem: (k) => storageStore.has(k) ? storageStore.get(k) : null,
        setItem: (k, v) => { storageStore.set(k, String(v)); },
        removeItem: (k) => { storageStore.delete(k); },
        clear: () => { storageStore.clear(); },
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

    it('gestiona la visibilidad y actualización del icon botón de inventario', () => {
      const ui = new UIManager();
      assert.equal(typeof ui.setInventoryVisible, 'function');
      assert.equal(typeof ui.updateInventory, 'function');

      ui.setInventoryVisible(true);
      assert.equal(ui.inventoryHud.style.display, 'flex');

      ui.setInventoryVisible(false);
      assert.equal(ui.inventoryHud.style.display, 'none');

      // Inventario vacío inicial
      ui.updateInventory({ keys: [], gems: 0, relics: [] });
      assert.match(ui.inventoryHud.innerHTML, /inv-btn-icon/);
      assert.match(ui.inventoryHud.title, /vacío/i);

      // Botín recolectado de cofres
      ui.updateInventory({
        keys: [{ id: 'llave_santuario', name: 'Llave del Santuario' }],
        gems: 250,
        relics: [{ id: 'caliz_sagrado', name: 'Cáliz Sagrado', icon: 'trophy', color: '#eab308' }],
      });

      assert.match(ui.inventoryHud.innerHTML, /inv-btn-badge/);
      assert.match(ui.inventoryHud.innerHTML, /3/);
      assert.match(ui.inventoryHud.title, /3 tesoros/i);
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
      assert.match(uiDev.uiEl.innerHTML, /btn-dev-enter-showroom/);
      assert.match(uiDev.uiEl.innerHTML, /Showroom de Bloques/);
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

    it('gestiona la navegación hacia y desde el Showroom de Desarrollo en el modal dev', async () => {
      const uiDev = new UIManager({ isDev: true });
      let enteredShowroom = false;
      let exitedShowroom = false;

      uiDev.bindDev({
        getGameState: () => ({ currentLevelId: 'lobby_tutorial' }),
        onEnterShowroom: () => { enteredShowroom = true; },
        onExitShowroom: () => { exitedShowroom = true; },
      });

      uiDev.openDevModal();
      assert.match(uiDev.uiEl.innerHTML, /btn-dev-enter-showroom/);
      assert.doesNotMatch(uiDev.uiEl.innerHTML, /btn-dev-exit-showroom/);

      // Botón para abrir el Atlas de Expedición desde el Showroom
      const openAtlasBtn = document.getElementById('btn-dev-open-atlas');
      assert.ok(openAtlasBtn, 'El botón para abrir el Atlas debe existir en la sección del showroom');
      openAtlasBtn.click();
      assert.equal(uiDev.isChapterOpen, true, 'El Atlas debe abrirse al pulsar el botón dev');
      uiDev.closeChapterModal();

      // Clic en entrar al showroom
      const enterBtn = document.getElementById('btn-dev-enter-showroom');
      assert.ok(enterBtn);
      enterBtn.click();
      assert.equal(enteredShowroom, true);
      assert.equal(uiDev.isDevOpen, false);

      // Ahora dentro del showroom
      uiDev.bindDev({
        getGameState: () => ({ currentLevelId: 'dev_showroom' }),
        onEnterShowroom: () => {},
        onExitShowroom: () => { exitedShowroom = true; },
      });

      uiDev.openDevModal();
      assert.match(uiDev.uiEl.innerHTML, /btn-dev-exit-showroom/);

      // Clic en salir del showroom
      const exitBtn = document.getElementById('btn-dev-exit-showroom');
      assert.ok(exitBtn);
      exitBtn.click();
      assert.equal(exitedShowroom, true);
      assert.equal(uiDev.isDevOpen, false);
    });

    it('la librería Icons.js exporta iconos SVG vectoriales sin emojis para el Atlas y Showroom', () => {
      const requiredIcons = [
        'construction', 'hammer', 'pickaxe', 'droplet', 'anvil',
        'snowflake', 'biohazard', 'orbit', 'sun', 'mapPin',
        'temple', 'rocket', 'bolt', 'timer', 'map', 'stairs'
      ];
      for (const iconName of requiredIcons) {
        assert.ok(ICONS[iconName], `ICONS.${iconName} debe existir`);
        const rendered = renderIcon(iconName);
        assert.match(rendered, /<svg class="svg-icon"/);
        assert.match(rendered, /viewBox="0 0 24 24"/);
      }
      // Reemplazo de emojis sin caracteres unicode en el HTML resultante
      const svgOutput = replaceEmojisWithSvg('🚧 En Construcción 📍 🏛️ 🚀');
      assert.doesNotMatch(svgOutput, /🚧|📍|🏛|🚀/);
      assert.match(svgOutput, /<svg/);
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

    it('renderiza la sección de pociones con el botón Beber y dispara onUsePotion al pulsar', () => {
      const ui = new UIManager();
      let usedPotion = null;
      let usedIndex = -1;

      ui.bindInventory({
        onUsePotion: (potion, idx) => {
          usedPotion = potion;
          usedIndex = idx;
        },
      });

      ui.updateInventory({
        keys: [],
        gems: 0,
        relics: [],
        potions: [{ id: 'pocion_vida', name: 'Poción de Vida', healAmount: 1 }],
      });

      ui.openInventoryModal();
      const overlay = document.getElementById('modal-inventory-overlay');
      assert.ok(overlay);
      assert.match(overlay.innerHTML, /POCIONES Y ELIXIRES/);
      assert.match(overlay.innerHTML, /Poción de Vida/);

      const useBtn = overlay.querySelector('.btn-use-potion');
      assert.ok(useBtn, 'Debe existir el botón .btn-use-potion');
      assert.equal(typeof useBtn.onclick, 'function');

      useBtn.onclick();
      assert.equal(usedPotion?.id, 'pocion_vida');
      assert.equal(usedIndex, 0);

      ui.closeInventoryModal();
    });

    it('discrimina entre scroll táctil y pulsación en las tags del modal de inventario sin selección accidental', () => {
      const ui = new UIManager();
      ui.updateInventory({
        keys: [{ id: 'k1', name: 'Llave del Santuario' }],
        gems: 100,
        relics: [],
        potions: [],
      });

      ui.openInventoryModal();
      assert.equal(ui.inventoryFilter, 'all');

      const overlay = document.getElementById('modal-inventory-overlay');
      assert.ok(overlay);

      const keysTag = overlay.querySelector('.inv-filter-tag');
      assert.ok(keysTag, 'Debe existir la tag de filtro');
      keysTag.dataset.filter = 'keys';

      // 1. Simular desplazamiento / scroll táctil sobre la tag (dx = -60px)
      keysTag.dispatchEvent({
        type: 'touchstart',
        touches: [{ clientX: 100, clientY: 200 }],
      });
      keysTag.dispatchEvent({
        type: 'touchmove',
        touches: [{ clientX: 40, clientY: 200 }],
      });
      keysTag.dispatchEvent({
        type: 'touchend',
        cancelable: true,
      });

      // No debe haberse seleccionado la tag durante el scroll
      assert.equal(ui.inventoryFilter, 'all', 'El scroll táctil no debe activar la tag');
      assert.doesNotMatch(keysTag.className, /\bactive\b/);

      // 2. Simular pulsación limpia (tap) sin movimiento
      keysTag.dispatchEvent({
        type: 'touchstart',
        touches: [{ clientX: 100, clientY: 200 }],
      });
      keysTag.dispatchEvent({
        type: 'touchend',
        cancelable: true,
      });

      // El tap limpio sí activa la tag
      assert.equal(ui.inventoryFilter, 'keys', 'El tap limpio debe activar la tag');
      assert.match(keysTag.className, /\bactive\b/);

      // 3. setInventoryFilter actualiza la clase y el filtro
      ui.setInventoryFilter('gems');
      assert.equal(ui.inventoryFilter, 'gems');

      ui.closeInventoryModal();
    });

    it('renderiza contorno en corazones perdidos, conserva la llave y muestra las gemas en el HUD de vidas', () => {
      const ui = new UIManager();
      assert.ok(ui.livesHud);

      // Estado inicial: 3 vidas llenas, sin llaves, 0 gemas
      ui.updateLives(3, 3);
      assert.match(ui.livesHud.innerHTML, /gems-badge/);
      assert.match(ui.livesHud.innerHTML, /<span class="gems-count">0<\/span>/);
      assert.doesNotMatch(ui.livesHud.innerHTML, /heart lost/);
      assert.doesNotMatch(ui.livesHud.innerHTML, /key-badge/);

      // Pierde 1 vida: 2 corazones vivos y 1 contorno perdido
      ui.updateLives(2, 3);
      assert.match(ui.livesHud.innerHTML, /heart lost hurt/);
      // El SVG del corazón perdido debe tener fill="none" (outline)
      assert.match(ui.livesHud.innerHTML, /fill="none"/);

      // Obtiene llave del santuario (las llaves se gestionan en inventario, nunca en los corazones)
      ui.setHasKey(true);
      assert.doesNotMatch(ui.livesHud.innerHTML, /key-badge/);

      // Recolecta gemas: actualiza automáticamente el contador en el HUD
      ui.updateInventory({
        keys: [{ id: 'llave_santuario', name: 'Llave del Santuario' }],
        gems: 100,
        relics: [],
      });
      assert.match(ui.livesHud.innerHTML, /<span class="gems-count">100<\/span>/);
      assert.doesNotMatch(ui.livesHud.innerHTML, /key-badge/);

      // Consume/usa la llave: el HUD de corazones y gemas sigue intacto y libre de llaves
      ui.setHasKey(false);
      assert.doesNotMatch(ui.livesHud.innerHTML, /key-badge/);
      // Las gemas y corazones se conservan
      assert.match(ui.livesHud.innerHTML, /<span class="gems-count">100<\/span>/);
      assert.match(ui.livesHud.innerHTML, /heart lost/);
    });

    it('parseMessageToList unifica el botín de cofre y el desbloqueo de puertas en una lista estructurada', () => {
      const ui = new UIManager();
      const res = ui.parseMessageToList(':chest: ¡Has abierto el Cofre del Vestíbulo! Has obtenido: :key: Llave Antigua del Santuario y :gem: 100 Gemas. Ahora puedes abrir: Puerta del Santuario.');
      assert.equal(res.title, ':chest: ¡Has abierto el Cofre del Vestíbulo!');
      assert.equal(res.items.length, 3);
      assert.equal(res.items[0], ':key: Llave Antigua del Santuario');
      assert.equal(res.items[1], ':gem: 100 Gemas');
      assert.equal(res.items[2], ':door: Ahora puedes abrir: Puerta del Santuario');
    });

    it('parseMessageToList no divide oraciones en abreviaturas como Cap. o puntos en paréntesis', () => {
      const ui = new UIManager();
      const res = ui.parseMessageToList('🏰 Mazmorra creada: Lobby: Sala de Práctica (PIN: 1234) — Aventurero (Guerrero • Cap. 1).');
      assert.equal(res.items.length, 0, 'No debe generar viñetas cortadas');
      assert.match(res.title, /Cap\. 1/);
    });

    it('oculta el botón de configuración en el menú y lo muestra en partida', () => {
      const ui = new UIManager();
      assert.equal(ui.settingsBtn.style.display, 'none');

      ui.showMenu({ onHost: () => {}, onJoin: () => {} });
      assert.equal(ui.settingsBtn.style.display, 'none');

      ui.hideMenu();
      assert.equal(ui.settingsBtn.style.display, 'flex');

      ui.showMenu({ onHost: () => {}, onJoin: () => {} });
      assert.equal(ui.settingsBtn.style.display, 'none');
    });

    it('gestiona la tarjeta de descenso unificada con temporizador de 5 segundos', () => {
      const ui = new UIManager();
      assert.equal(ui.descentCard, null);
      assert.equal(ui.descentBtn, null);

      let nowClicked = false;
      ui.showDescentCountdown({
        byName: 'Explorador',
        endsAtMs: Date.now() + 5000,
        onNow: () => { nowClicked = true; },
      });

      assert.ok(ui.descentCard);
      assert.ok(ui.descentBtn);
      assert.match(ui.descentCard.innerHTML, /descent-timer/);
      assert.match(ui.descentCard.innerHTML, /5/);
      assert.match(ui.descentCard.innerHTML, /Explorador desciende/);

      // Botón Bajar Ya interactivo
      ui.descentBtn.onclick();
      assert.equal(nowClicked, true);

      // Limpieza completa
      ui.hideDescent();
      assert.equal(ui.descentCard, null);
      assert.equal(ui.descentBtn, null);
    });

    it('showLevelTransition renderiza botón de cerrar en victoria y ejecuta onClose al pulsar', () => {
      const ui = new UIManager();
      assert.ok(ui.transitionEl);

      let closed = false;
      ui.showLevelTransition(
        '🏆 ¡Mazmorras Conquistadas!',
        'Habéis bendecido todos los altares.',
        {
          victory: true,
          autoHideMs: 0,
          onClose: () => { closed = true; },
        }
      );

      assert.match(ui.transitionEl.innerHTML, /Mazmorras Conquistadas/);
      assert.match(ui.transitionEl.innerHTML, /btn-close-victory/);
      assert.match(ui.transitionEl.innerHTML, /Continuar Explorando/);

      // Simular clic en botón de cerrar victoria
      const btn = document.getElementById('btn-close-victory');
      assert.ok(btn);
      btn.onclick();
      assert.equal(closed, true);
    });

    it('gestiona la guía de controles superpuesta, persistencia y toggle con botón (x) y tecla H', () => {
      const ui = new UIManager();
      assert.equal(ui.isControlsDismissed, false);

      // Mostrar y ocultar manualmente
      ui.showControlsHud(true);
      assert.equal(ui.isControlsHudVisible, true);
      assert.equal(ui.isControlsDismissed, false);

      ui.hideControlsHud(true);
      assert.equal(ui.isControlsHudVisible, false);
      assert.equal(ui.isControlsDismissed, true);
      assert.equal(localStorage.getItem('runa_controls_dismissed'), 'true');

      // Alternar toggle
      ui.toggleControlsHud(true);
      assert.equal(ui.isControlsHudVisible, true);
      assert.equal(ui.isControlsDismissed, false);

      // Si está dismissed, setTutorialControlsVisible no lo abre automáticamente salvo force=true
      ui.hideControlsHud(true);
      ui.setTutorialControlsVisible(true, false);
      assert.equal(ui.isControlsHudVisible, false);

      ui.setTutorialControlsVisible(true, true);
      assert.equal(ui.isControlsHudVisible, true);
    });

    it('gestiona el modal de selección de capítulos (Atlas de Expedición)', () => {
      const ui = new UIManager();
      let selectedChapterId = null;

      const mockRegistry = {
        getAllChapters: () => [
          {
            id: 'capitulo_1',
            number: 1,
            name: 'El Descenso Ancestral',
            theme: 'ancient_stone',
            lore: 'Antiguas cámaras de sillar.',
            icon: 'castle',
            dungeons: [{ id: 'dungeon_classic', name: 'Mazmorra Ancestral' }]
          },
          {
            id: 'capitulo_2',
            number: 2,
            name: 'Cripta de las Sombras',
            theme: 'dark_shadows',
            lore: 'Galerías de basalto.',
            icon: 'pickaxe',
            dungeons: [{ id: 'shadow_vault', name: 'Bóveda Umbría' }]
          },
          {
            id: 'capitulo_3',
            number: 3,
            name: 'Cataratas Subterráneas',
            theme: 'subterranean_falls',
            lore: 'Corrientes subterráneas.',
            icon: 'droplet',
            underConstruction: true,
            dungeons: [{ id: 'falls_aqueduct', name: 'Acueducto Arcaico' }]
          },
        ],
        isChapterUnlocked: (id) => id === 'capitulo_1',
        getRecord: (id) => id === 'capitulo_1' ? { bestTimeSec: 150, deaths: 1, stars: 3 } : null,
        currentChapterId: 'capitulo_1',
        progress: { completedChapters: [] },
      };

      ui.bindCampaign({
        getChapterRegistry: () => mockRegistry,
        getGameState: () => ({ isHost: true, currentLevelId: 'lobby_tutorial' }),
        onSelectChapter: (id) => { selectedChapterId = id; },
      });

      // Abrir modal
      ui.openChapterModal();
      assert.equal(ui.isChapterOpen, true);
      const overlay = document.getElementById('modal-chapter-overlay');
      assert.ok(overlay);
      assert.match(overlay.innerHTML, /Atlas de Expedición/);
      assert.match(overlay.innerHTML, /Campamento Central \(Lobby\)/);
      assert.match(overlay.innerHTML, /El Descenso Ancestral/);
      assert.match(overlay.innerHTML, /Cripta de las Sombras/);
      assert.match(overlay.innerHTML, /En Construcción/);

      // El capítulo 1 tiene botón de Viaje Rápido
      const launchBtn = overlay.querySelector('.chapter-launch-btn[data-chapter-id="capitulo_1"]');
      assert.ok(launchBtn);
      launchBtn.click();

      // Debe haber llamado a onSelectChapter con 'capitulo_1' y cerrado el modal
      assert.equal(selectedChapterId, 'capitulo_1');
      assert.equal(ui.isChapterOpen, false);

      // Abrir nuevamente para verificar que hacer clic/scroll en la tarjeta NO navega (solo el botón de Viaje Rápido)
      selectedChapterId = null;
      ui.openChapterModal();
      const currentOverlay = document.getElementById('modal-chapter-overlay');
      assert.ok(currentOverlay);
      const cardUnlocked = currentOverlay.querySelector('.chapter-card.unlocked');
      assert.ok(cardUnlocked);
      cardUnlocked.click();
      assert.equal(selectedChapterId, null, 'Hacer clic en la tarjeta no debe activar viaje');
      assert.equal(ui.isChapterOpen, true);

      // El botón de Viaje Rápido sí debe navegar
      const fastTravelBtn = currentOverlay.querySelector('.chapter-launch-btn[data-chapter-id="capitulo_1"]');
      assert.ok(fastTravelBtn);
      fastTravelBtn.click();
      assert.equal(selectedChapterId, 'capitulo_1');
      assert.equal(ui.isChapterOpen, false);

      // Prueba de gesto de scroll táctil: mover el dedo no debe disparar viaje
      selectedChapterId = null;
      ui.openChapterModal();
      const scrollOverlay = document.getElementById('modal-chapter-overlay');
      const scrollBtn = scrollOverlay.querySelector('.chapter-launch-btn[data-chapter-id="capitulo_1"]');
      assert.ok(scrollBtn);
      scrollBtn.ontouchstart?.({ touches: [{ clientX: 100, clientY: 100 }] });
      scrollBtn.ontouchmove?.({ touches: [{ clientX: 100, clientY: 150 }] });
      scrollBtn.ontouchend?.({ cancelable: true, preventDefault() {} });
      assert.equal(selectedChapterId, null, 'Un gesto de scroll táctil no debe activar viaje');
      assert.equal(ui.isChapterOpen, true);
      ui.closeChapterModal();

      // Prueba en mazmorra: el lobby muestra botón de viaje rápido al lobby
      selectedChapterId = null;
      ui.bindCampaign({
        getChapterRegistry: () => mockRegistry,
        getGameState: () => ({ isHost: true, currentLevelId: 'dungeon_classic' }),
        onSelectChapter: (id) => { selectedChapterId = id; },
      });
      ui.openChapterModal();
      const dungeonOverlay = document.getElementById('modal-chapter-overlay');
      const lobbyTravelBtn = dungeonOverlay.querySelector('.chapter-launch-btn[data-chapter-id="lobby_tutorial"]');
      assert.ok(lobbyTravelBtn, 'Debe haber botón de viaje rápido al lobby estando en mazmorra');
      lobbyTravelBtn.click();
      assert.equal(selectedChapterId, 'lobby_tutorial');
      assert.equal(ui.isChapterOpen, false);

      // Alternar toggle y verificar restauración incondicional de botones de acción
      ui.currentScreen = 'menu';
      ui.openChapterModal();
      assert.equal(ui.isChapterOpen, true);

      ui.closeChapterModal();
      assert.equal(ui.isChapterOpen, false);
      assert.equal(ui.currentScreen, 'in_game');
    });

    it('gestiona el modal de 3 ranuras de guardado y botones de menú/configuración', async () => {
      const ui = new UIManager();

      // 1. En el menú principal se muestran exclusivamente las 3 ranuras directas
      ui.showMenu({ onHost: () => {}, onJoin: () => {} });
      assert.match(ui.uiEl.innerHTML, /id="menu-slots-row"/);
      assert.doesNotMatch(ui.uiEl.innerHTML, /id="btn-open-save-slots"/);

      // 2. Botón en el modal de configuración
      ui.openSettingsModal();
      assert.match(ui.uiEl.innerHTML, /id="btn-settings-save-slots"/);
      assert.match(ui.uiEl.innerHTML, /Administrar Ranuras \(3 Slots\)/);
      ui.closeSettingsModal();

      // 3. Apertura de modal de ranuras
      await ui.openSaveSlotsModal();
      assert.equal(ui.isSaveSlotsOpen, true);
      const overlay = document.getElementById('modal-save-slots-overlay');
      assert.ok(overlay);
      assert.match(overlay.innerHTML, /Ranuras de Guardado/);
      assert.match(overlay.innerHTML, /Ranura 1/);
      assert.match(overlay.innerHTML, /Ranura 2/);
      assert.match(overlay.innerHTML, /Ranura 3/);
      assert.match(overlay.innerHTML, /Regla de la Mazmorra/);
      assert.match(overlay.innerHTML, /El progreso y los tesoros solo se guardan de forma permanente al culminar una mazmorra/);

      // 4. Apertura y flujo de borrado con diálogo de confirmación
      await ui.openSaveSlotsModal();
      const deleteButtons = overlay.querySelectorAll('.btn-slot-delete');
      assert.ok(deleteButtons.length > 0);
      deleteButtons[0].onclick();

      // Debe abrirse el diálogo de confirmación temático montado
      const confirmDialog = document.getElementById('modal-confirm-dialog');
      assert.ok(confirmDialog);
      assert.match(confirmDialog.innerHTML, /¿Borrar Ranura 1\?/);

      // Confirmar borrado
      const confirmAccept = document.getElementById('btn-confirm-accept');
      assert.ok(confirmAccept);
      await confirmAccept.onclick();

      // 5. Cierre del modal
      ui.closeSaveSlotsModal();
      assert.equal(ui.isSaveSlotsOpen, false);
    });

    it('muestra estado vacío o información de partida en los slots visuales del menú y carga sus datos', async () => {
      const ui = new UIManager();
      ui.showMenu({ onHost: () => {}, onJoin: () => {} });

      // Verificar que renderMenuSlotsHtml expone ranuras vacías y ranuras con información
      const mockSummaries = [
        { slotId: 'slot_1', isEmpty: false, isActive: true, name: 'Conan', heroIndex: 0, highestChapter: 3 },
        { slotId: 'slot_2', isEmpty: true, isActive: false, name: 'Ranura Vacía', heroIndex: 0, highestChapter: 1 },
        { slotId: 'slot_3', isEmpty: false, isActive: false, name: 'Merlin', heroIndex: 1, highestChapter: 2 },
      ];

      const html = ui.renderMenuSlotsHtml(mockSummaries);
      // Ranura 1 con datos (Activa)
      assert.match(html, /Ranura 1/);
      assert.match(html, /Conan/);
      assert.match(html, /Cap\. 3/);
      assert.match(html, /badge-active/);

      // Ranura 2 vacía
      assert.match(html, /Ranura 2/);
      assert.match(html, /badge-empty/);
      assert.match(html, /Vacía/);

      // Ranura 3 con datos (Cargar)
      assert.match(html, /Ranura 3/);
      assert.match(html, /Merlin/);
      assert.match(html, /Cap\. 2/);
      assert.match(html, /badge-saved/);
    });

    it('bloquea edición de nombre y clase si la ranura está guardada y permite edición si está vacía, con borrado en el menú', async () => {
      const ui = new UIManager();
      ui.showMenu({ onHost: () => {}, onJoin: () => {} });

      const nameInput = document.getElementById('player-name-input');
      assert.ok(nameInput);

      // 1. Ranura con datos guardados: bloquea edición
      ui.setMenuLockedState(true, { name: 'Conan', heroIndex: 2 });
      assert.equal(ui.isMenuLocked, true);
      assert.equal(nameInput.disabled, true);
      assert.equal(nameInput.value, 'Conan');
      assert.equal(ui.selectedColorIndex, 2);

      // Intentar cambiar clase con slot bloqueado
      const chips = ui.uiEl.querySelectorAll ? ui.uiEl.querySelectorAll('.hero-chip') : document.querySelectorAll('.hero-chip');
      if (chips && chips.length > 0) {
        chips[0].onclick();
        // La clase no debe cambiar (permanece en 2)
        assert.equal(ui.selectedColorIndex, 2);
      }

      // 2. Ranura vacía: desbloquea edición
      ui.setMenuLockedState(false);
      assert.equal(ui.isMenuLocked, false);
      assert.equal(nameInput.disabled, false);

      // Cambiar clase libremente cuando está desbloqueado
      if (chips && chips.length > 0) {
        chips[0].onclick();
        assert.equal(ui.selectedColorIndex, 0);
      }

      // 3. Clic en las ranuras del menú NO abre el admin de guardados
      const slotChips = ui.uiEl.querySelectorAll ? ui.uiEl.querySelectorAll('.menu-slot-chip') : document.querySelectorAll('.menu-slot-chip');
      if (slotChips && slotChips.length > 0) {
        await slotChips[0].onclick();
        assert.equal(ui.isSaveSlotsOpen, false);
      }

      // 4. Botón de borrado directo desde el menú activa confirmación
      ui.setMenuLockedState(true, { name: 'Conan', heroIndex: 0 });
      const deleteActiveBtn = document.getElementById('btn-menu-delete-active-slot');
      assert.ok(deleteActiveBtn);
      assert.equal(deleteActiveBtn.style.display, 'inline-flex');
      deleteActiveBtn.onclick();

      ui.closeConfirmDialog();
    });

    it('gestiona el modal de selección de héroe para invitados (showGuestJoinModal)', () => {
      const ui = new UIManager();
      let confirmed = null;
      let cancelled = false;

      ui.showGuestJoinModal({
        pin: '1337',
        initialName: 'Gandalf',
        initialHeroIndex: 3, // Hechicero
        onConfirm: (res) => { confirmed = res; },
        onCancel: () => { cancelled = true; },
      });

      const modalEl = document.getElementById('modal-guest-join-dialog');
      assert.ok(modalEl, 'El modal de invitado debe existir en el DOM');
      assert.match(modalEl.innerHTML, /#1337/, 'Debe mostrar el PIN de la sala');
      assert.match(modalEl.innerHTML, /Hechicero/, 'Debe mostrar la clase inicial seleccionada');

      const nameInput = document.getElementById('guest-player-name-input');
      assert.ok(nameInput);
      assert.equal(nameInput.value, 'Gandalf');

      // Cambiar de héroe a Paladín (index 1)
      modalEl._updateSelectedHero(1);
      const heroBadge = document.getElementById('guest-hero-badge');
      assert.ok(heroBadge);
      assert.match(heroBadge.innerHTML, /Paladín/, 'Al cambiar de héroe debe actualizar la insignia');

      // Modificar nombre y confirmar
      nameInput.value = 'Sir Lancelot';
      const btnConfirm = document.getElementById('btn-guest-confirm');
      assert.ok(btnConfirm);
      btnConfirm.onclick(new Event('click'));

      assert.ok(confirmed, 'onConfirm debe haberse invocado');
      assert.equal(confirmed.name, 'Sir Lancelot');
      assert.equal(confirmed.colorIndex, 1);

      // Probar cancelación
      ui.showGuestJoinModal({
        pin: '4321',
        onCancel: () => { cancelled = true; },
      });
      assert.ok(document.getElementById('modal-guest-join-dialog'));
      const btnCancel = document.getElementById('btn-guest-cancel');
      assert.ok(btnCancel);
      btnCancel.onclick(new Event('click'));
      assert.equal(cancelled, true, 'onCancel debe haberse llamado al pulsar Volver');

      // Probar cierre explícito
      ui.showGuestJoinModal({ pin: '9999' });
      ui.closeGuestJoinModal();

      // Probar auto-ajuste de nombre al héroe si no ha sido editado
      let autoConfirmed = null;
      ui.showGuestJoinModal({
        pin: '5555',
        initialName: 'Aventurero', // Nombre no editado (coincide con héroe base)
        initialHeroIndex: 1, // Paladín
        onConfirm: (res) => { autoConfirmed = res; },
      });
      const autoModalEl = document.getElementById('modal-guest-join-dialog');
      const autoNameInput = document.getElementById('guest-player-name-input');
      // Debe inicializarse como "Paladín" porque el nombre no fue personalizado
      assert.equal(autoNameInput.value, 'Paladín', 'Si el nombre no fue editado, debe adoptar la clase inicial');

      // Al cambiar a Hechicero (index 3), el nombre se debe auto-ajustar a Hechicero
      autoModalEl._updateSelectedHero(3);
      assert.equal(autoNameInput.value, 'Hechicero', 'Al cambiar de clase sin apodo personalizado debe auto-ajustar a Hechicero');

      // Al cambiar a Guardián (index 4), el nombre se debe auto-ajustar a Guardián
      autoModalEl._updateSelectedHero(4);
      assert.equal(autoNameInput.value, 'Guardián', 'Al cambiar de clase sin apodo personalizado debe auto-ajustar a Guardián');

      // Si el usuario escribe un apodo personalizado, ya no se debe sobreescribir
      autoNameInput.value = 'Merlín';
      autoNameInput.dispatchEvent(new Event('input'));
      autoModalEl._updateSelectedHero(2); // Explorador
      assert.equal(autoNameInput.value, 'Merlín', 'Un apodo personalizado por el usuario no debe sobreescribirse');

      const btnAutoConfirm = document.getElementById('btn-guest-confirm');
      btnAutoConfirm.onclick(new Event('click'));
      assert.equal(autoConfirmed.name, 'Merlín');
      assert.equal(autoConfirmed.colorIndex, 2);
    });
  });
});



