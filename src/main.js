import './style.css';
import { VoxelSandboxGame } from './core/GameApp.js';
import { initNetAudit } from './network/NetAudit.js';

// Inicializar interceptor de diagnóstico y auditoría de paquetes WebRTC
initNetAudit();

// Inicialización de la aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  new VoxelSandboxGame();
});

export { VoxelSandboxGame };
