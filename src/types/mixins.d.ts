// Augmentación de tipos para la composición por mixins mediante `Object.assign(Clase.prototype, ...)`,
// patrón invisible para el comprobador de tipos. Refleja la API pública real en tiempo de ejecución.
//
// Nota: la cláusula `extends` de una interfaz solo admite identificadores (no `typeof`),
// por lo que los miembros se declaran explícitamente.

import '../core/GameApp.js';
import '../ui/UIManager.js';
import '../network/ClientReconciler.js';
import '../network/NetworkManager.js';

declare module '../ui/UIManager.js' {
  interface UIManager {
    checkDevMode(...args: any[]): any;
    setActionButtonsVisible(...args: any[]): any;
    setSettingsButtonVisible(...args: any[]): any;
    updateInventory(...args: any[]): any;
    bindSettings(...args: any[]): any;
    bindDev(...args: any[]): any;
    bindCampaign(...args: any[]): any;
    bindInventory(...args: any[]): any;
    bindShop(...args: any[]): any;
    bindVoice(...args: any[]): any;
    showMenu(...args: any[]): any;
    refreshMenuSlots(...args: any[]): any;
    updatePartyList(...args: any[]): any;
    setInteractTarget(...args: any[]): any;
    setFlightMode(...args: any[]): any;
    showNarrativeMessage(...args: any[]): any;
    showHudMessage(...args: any[]): any;
    updateLives(...args: any[]): any;
    showGameOver(...args: any[]): any;
    toggleControlsHud(...args: any[]): any;
    toggleChapterModal(...args: any[]): any;
    toggleInventoryModal(...args: any[]): any;
    openInventoryModal(...args: any[]): any;
    closeInventoryModal(...args: any[]): any;
    toggleDevModal(...args: any[]): any;
    updateDevButtonVisibility(...args: any[]): any;
    openSettingsModal(...args: any[]): any;
    closeSettingsModal(...args: any[]): any;
    closeShopModal(...args: any[]): any;
    _bindControlsHud(...args: any[]): any;
  }
}

declare module '../core/GameApp.js' {
  interface VoxelSandboxGame {
    restoreSavedState(...args: any[]): any;
    switchLevel(...args: any[]): any;
    usePotion(...args: any[]): any;
    initNetworkEvents(...args: any[]): any;
    initNetworkTimers(...args: any[]): any;
    leaveSession(...args: any[]): any;
    openDoorInstant(...args: any[]): any;
    startDevShowroomSession(...args: any[]): any;
    selectCampaignChapter(...args: any[]): any;
    buyShopItem(...args: any[]): any;
    sellShopItem(...args: any[]): any;
    startHost(...args: any[]): any;
    joinRoom(...args: any[]): any;
    resetInventory(...args: any[]): any;
    /** PIN de la última sala conectada (gestionado en `SessionManager`). */
    lastConnectedPin?: string | null;
  }
}

declare module '../network/ClientReconciler.js' {
  interface ClientReconciler {
    /** Callback invocado al detectar un teletransporte (asignado por `GameApp`). */
    onTeleport?: ((entry: any) => void) | null;
  }
}

declare module '../network/NetworkManager.js' {
  interface NetworkManager {
    /** Volcado de la auditoría de red a la consola (solo diagnóstico). */
    printAudit?: () => void;
  }
}
