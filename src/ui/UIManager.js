import { PLAYER_HEROES, APP_CONFIG } from '../config/constants.js';
import { soundManager } from '../audio/SoundManager.js';
import { MenuMixin } from './MenuManager.js';
import { HudMixin } from './HudManager.js';
import { ModalMixin } from './ModalManager.js';
import { HeroMixin } from './HeroManager.js';
import { saveManager } from '../storage/SaveManager.js';

export class UIManager {
  constructor({
    uiContainerId = 'ui',
    crosshairId = 'crosshair',
    hudMessageId = 'hud-message',
    settingsBtnId = 'btn-settings',
    devBtnId = 'btn-dev',
    livesHudId = 'hud-lives',
    transitionId = 'level-transition',
    inventoryHudId = 'hud-inventory',
    isDev = undefined,
  } = {}) {
    this.version = APP_CONFIG.VERSION;
    this.uiEl = document.getElementById(uiContainerId);
    this.crosshair = document.getElementById(crosshairId);
    this.hudMessage = document.getElementById(hudMessageId);
    this.livesHud = document.getElementById(livesHudId);
    this.transitionEl = document.getElementById(transitionId);
    this.settingsBtn = document.getElementById(settingsBtnId);
    this.devBtn = document.getElementById(devBtnId);
    this.inventoryHud = document.getElementById(inventoryHudId);
    this.keysTagHud = document.getElementById('hud-keys-tag');
    this.inventory = { keys: [], gems: 0, relics: [], potions: [] };
    this.inventoryFilter = 'all';
    this.inventoryCallbacks = {};
    this.isInventoryOpen = false;
    this.isDevOpen = false;
    this.isDevMode = typeof isDev === 'boolean' ? isDev : this.checkDevMode();

    if (this.inventoryHud) {
      const handleOpenLoot = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        this.toggleInventoryModal();
      };
      this.inventoryHud.onclick = handleOpenLoot;
      this.inventoryHud.addEventListener('touchend', handleOpenLoot, { passive: false });
    }

    if (this.keysTagHud) {
      const handleOpenKeys = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        this.openInventoryModal('keys');
      };
      this.keysTagHud.onclick = handleOpenKeys;
      this.keysTagHud.addEventListener('touchend', handleOpenKeys, { passive: false });
    }

    if (this.devBtn) {
      const handleDevClick = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        this.toggleDevModal();
      };
      this.devBtn.onclick = handleDevClick;
      this.devBtn.addEventListener('touchend', handleDevClick, { passive: false });
    }

    if (this.livesHud) {
      const handleLivesHudClick = (e) => {
        const target = e?.target;
        if (target && (target.closest?.('.gems-badge') || target.closest?.('.key-badge'))) {
          if (e) {
            e.stopPropagation();
            if (e.cancelable) e.preventDefault();
          }
          soundManager.playClick();
          this.toggleInventoryModal();
        }
      };
      this.livesHud.onclick = handleLivesHudClick;
      this.livesHud.addEventListener('touchend', handleLivesHudClick, { passive: false });
    }

    this.updateDevButtonVisibility();

    this.messageTimeout = null;
    this._lastLives = -1;
    this._lastMaxLives = 3;
    this._hasKey = false;
    this._interactKey = null;

    // Estado de pantallas
    this.currentScreen = 'menu'; // 'menu' | 'in_game'
    this.lastMenuParams = null;
    this.isSettingsOpen = false;
    this.isSaveSlotsOpen = false;
    this.settingsCallbacks = null;
    this.devCallbacks = null;
    this.descentCard = null;
    this.descentBtn = null;
    this.descentOnNow = null;
    this._descentInterval = null;

    // Cargar perfil guardado del jugador desde saveManager con fallback legacy
    const profile = saveManager.getProfile?.() || {};
    const settings = saveManager.getSettings?.() || {};

    const rawColor = profile.favoriteHero ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('dungeon_player_color') : null);
    this.selectedColorIndex = parseInt(rawColor || '0', 10);
    if (this.selectedColorIndex < 0 || this.selectedColorIndex >= PLAYER_HEROES.length) {
      this.selectedColorIndex = 0;
    }
    this.playerName = profile.name || (typeof localStorage !== 'undefined' ? localStorage.getItem('dungeon_player_name') : null) || 'Aventurero';
    this.setActionButtonsVisible(false);
    this.setSettingsButtonVisible(false);
    this.updateInventory(this.inventory);

    // Estado del panel superpuesto de controles (HUD)
    this.isControlsDismissed = settings.controlsDismissed ?? (typeof localStorage !== 'undefined'
      ? localStorage.getItem('runa_controls_dismissed') === 'true'
      : false);
    this.isControlsHudVisible = false;
    this._bindControlsHud();
  }
}

// Composición SRP (v1.30.0): UIManager es fachada, la lógica vive en mixins.
// API pública 100% retrocompatible con v1.29.
Object.assign(UIManager.prototype, MenuMixin, HudMixin, ModalMixin, HeroMixin);
