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
      const mockEl = (tag = 'div') => {
        let _id = '';
        const el = {
          tagName: tag.toUpperCase(),
          style: {},
          classList: { add() {}, remove() {}, toggle() {} },
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
            if (sel?.includes('btn-use-potion')) {
              if (!lastMockButton) lastMockButton = mockEl('button');
              return [lastMockButton];
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
        'temple', 'rocket', 'bolt', 'timer', 'map'
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

      // Obtiene llave del santuario
      ui.setHasKey(true);
      assert.match(ui.livesHud.innerHTML, /key-badge/);
      assert.match(ui.livesHud.innerHTML, /title="Llave de la Mazmorra"/);

      // Recolecta gemas: actualiza automáticamente el contador en el HUD
      ui.updateInventory({
        keys: [{ id: 'llave_santuario', name: 'Llave del Santuario' }],
        gems: 100,
        relics: [],
      });
      assert.match(ui.livesHud.innerHTML, /<span class="gems-count">100<\/span>/);
      assert.match(ui.livesHud.innerHTML, /key-badge/);

      // Consume la llave (puerta abierta)
      ui.setHasKey(false);
      assert.doesNotMatch(ui.livesHud.innerHTML, /key-badge/);
      // Las gemas y corazones se conservan
      assert.match(ui.livesHud.innerHTML, /<span class="gems-count">100<\/span>/);
      assert.match(ui.livesHud.innerHTML, /heart lost/);
    });

    it('parseMessageToList unifica el botín de cofre y el desbloqueo de puertas en una lista estructurada', () => {
      const ui = new UIManager();
      const res = ui.parseMessageToList('📦 ¡Has abierto el Cofre del Vestíbulo! Has obtenido: 🗝️ Llave Antigua del Santuario y 💎 100 Gemas. Ahora puedes abrir: Puerta del Santuario.');
      assert.equal(res.title, '📦 ¡Has abierto el Cofre del Vestíbulo!');
      assert.equal(res.items.length, 3);
      assert.equal(res.items[0], '🗝️ Llave Antigua del Santuario');
      assert.equal(res.items[1], '💎 100 Gemas');
      assert.equal(res.items[2], '🚪 Ahora puedes abrir: Puerta del Santuario');
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

      // 1. Botón en el menú principal
      ui.showMenu({ onHost: () => {}, onJoin: () => {} });
      assert.match(ui.uiEl.innerHTML, /id="btn-open-save-slots"/);
      assert.match(ui.uiEl.innerHTML, /Partidas Guardadas \(3 Ranuras\)/);

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

      // 4. Cierre del modal
      ui.closeSaveSlotsModal();
      assert.equal(ui.isSaveSlotsOpen, false);
    });
  });
});


