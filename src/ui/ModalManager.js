/**
 * ModalManager.js - Orquestador ligero de modales para Runa y Piedra
 * 
 * Compone la funcionalidad de diálogos y modales a partir de módulos especializados:
 * - SettingsModal: Configuración gráfica (DPR), sensibilidad, sonido, controles y PIN de sala.
 * - DevModal: Herramientas de telemetría de red, recarga limpia y showroom de bloques.
 * - ConfirmModal: Diálogo temático de confirmación in-game.
 * - InventoryModal: Visor y gestor del botín de expedición (llaves, gemas, reliquias, pociones).
 * - ChapterModal: Atlas de expedición y mapa de campaña (10 capítulos).
 * - SaveSlotsModal: Gestión de 3 ranuras de guardado, exportación e importación JSON.
 */
import { SettingsModalMixin } from './modals/SettingsModal.js';
import { DevModalMixin } from './modals/DevModal.js';
import { ConfirmModalMixin } from './modals/ConfirmModal.js';
import { InventoryModalMixin } from './modals/InventoryModal.js';
import { ChapterModalMixin } from './modals/ChapterModal.js';
import { SaveSlotsModalMixin } from './modals/SaveSlotsModal.js';
import { GuestJoinModalMixin } from './modals/GuestJoinModal.js';
import { VoiceModalMixin } from './modals/VoiceModal.js';

export const ModalMixin = {
  ...SettingsModalMixin,
  ...DevModalMixin,
  ...ConfirmModalMixin,
  ...InventoryModalMixin,
  ...ChapterModalMixin,
  ...SaveSlotsModalMixin,
  ...GuestJoinModalMixin,
  ...VoiceModalMixin,
};
