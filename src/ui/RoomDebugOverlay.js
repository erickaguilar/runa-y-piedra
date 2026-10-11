// src/ui/RoomDebugOverlay.js
import { BLOCK_TYPES } from '../config/constants.js';

const BLOCK_NAMES = {
  [BLOCK_TYPES.AIR]: 'Aire',
  [BLOCK_TYPES.STONE_FLOOR]: 'Suelo Piedra',
  [BLOCK_TYPES.WALL]: 'Muro Mazmorra',
  [BLOCK_TYPES.DOOR]: 'Puerta de Madera/Hierro',
  [BLOCK_TYPES.PILLAR]: 'Columna / Pilar',
  [BLOCK_TYPES.PEDESTAL]: 'Pedestal / Altar',
  [BLOCK_TYPES.JUMP_PAD]: 'Jump Pad (Losa Rúnica de Salto)',
  [BLOCK_TYPES.LAVA]: 'Lava Volcánica',
  [BLOCK_TYPES.FLOOR_STONE]: 'Adoquín Limpio',
  [BLOCK_TYPES.FLOOR_WORN]: 'Adoquín Agrietado',
  [BLOCK_TYPES.FLOOR_MOSS]: 'Adoquín con Musgo',
  [BLOCK_TYPES.RESPAWN_PAD]: 'Losa de Respawn',
  [BLOCK_TYPES.CEILING]: 'Techo / Bóveda',
  [BLOCK_TYPES.PRESSURE_PAD]: 'Losa de Presión Mecánica',
};

export class RoomDebugOverlay {
  constructor() {
    this.enabled = typeof localStorage !== 'undefined' && localStorage.getItem('dungeon_coords_overlay') === '1';
    this.domElement = null;
    this.lastRenderTime = 0;

    if (this.enabled) {
      this.initDom();
    }
  }

  setEnabled(enable) {
    this.enabled = !!enable;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dungeon_coords_overlay', this.enabled ? '1' : '0');
    }
    if (this.enabled) {
      this.initDom();
    } else if (this.domElement) {
      this.domElement.style.display = 'none';
    }
  }

  initDom() {
    if (typeof document === 'undefined') return;
    if (this.domElement) {
      this.domElement.style.display = 'block';
      return;
    }

    const el = document.createElement('div');
    el.id = 'room-coords-overlay';
    el.style.cssText = `
      position: fixed;
      top: 62px;
      left: 14px;
      background: rgba(15, 23, 42, 0.90);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(16, 185, 129, 0.45);
      color: #34d399;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      line-height: 1.45;
      padding: 9px 12px;
      border-radius: 10px;
      z-index: 99;
      pointer-events: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 12px rgba(16, 185, 129, 0.15);
      user-select: none;
      max-width: 320px;
    `;
    document.body.appendChild(el);
    this.domElement = el;
  }

  getBlockName(type) {
    return BLOCK_NAMES[type] || `Bloque (${type})`;
  }

  update(data = {}) {
    if (!this.enabled) return;
    if (!this.domElement) this.initDom();
    if (!this.domElement) return;

    const now = performance.now();
    // Limitar actualización visual a ~15 Hz para máximo rendimiento
    if (now - this.lastRenderTime < 65) return;
    this.lastRenderTime = now;

    const {
      levelId = '—',
      levelName = '—',
      roomName = '—',
      pos = { x: 0, y: 0, z: 0 },
      yaw = 0,
      pitch = 0,
      hero = null,
      isNoclip = false,
      lives = 3,
      targetBlock = null,
    } = data;

    const yawDeg = Math.round(((yaw * 180 / Math.PI) % 360 + 360) % 360);
    const pitchDeg = Math.round(pitch * 180 / Math.PI);
    const heroName = hero?.name || 'Aventurero';
    const jumpMult = hero?.jumpMultiplier ? hero.jumpMultiplier.toFixed(2) : '1.00';
    const targetBlockName = targetBlock
      ? `${this.getBlockName(targetBlock.blockType)} @ [${targetBlock.coords.x}, ${targetBlock.coords.y}, ${targetBlock.coords.z}] (${targetBlock.distance.toFixed(1)}m)`
      : 'Ninguno en rango';

    this.domElement.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(52, 211, 153, 0.25);padding-bottom:4px;margin-bottom:5px;">
        <span style="font-weight:700;color:#6ee7b7;letter-spacing:0.3px;" title="${levelName}">${roomName}</span>
        <span style="font-size:9px;color:#94a3b8;background:rgba(255,255,255,0.06);padding:1px 5px;border-radius:4px;" title="${levelName}">${levelId}</span>
      </div>
      <div>
        <span style="color:#94a3b8;">POS:</span>
        <strong style="color:#f8fafc;">X: ${pos.x.toFixed(2)} | Y: ${pos.y.toFixed(2)} | Z: ${pos.z.toFixed(2)}</strong>
      </div>
      <div>
        <span style="color:#94a3b8;">LOOK:</span>
        <span style="color:#cbd5e1;">Yaw: ${yawDeg}° | Pitch: ${pitchDeg}°</span>
      </div>
      <div>
        <span style="color:#94a3b8;">HERO:</span>
        <span style="color:#38bdf8;">${heroName}</span>
        <span style="color:#94a3b8;font-size:10px;">(Salto: ×${jumpMult})</span>
      </div>
      <div>
        <span style="color:#94a3b8;">ESTADO:</span>
        ${isNoclip
          ? '<strong style="color:#fbbf24;background:rgba(251,191,36,0.18);padding:1px 4px;border-radius:3px;">VUELO (NOCLIP)</strong>'
          : '<span style="color:#cbd5e1;">Física Normal</span>'}
        <span style="color:#94a3b8;margin-left:4px;">Vidas: ${lives}</span>
      </div>
      <div style="margin-top:4px;padding-top:4px;border-top:1px dashed rgba(255,255,255,0.1);font-size:10px;color:#e2e8f0;word-break:break-word;">
        <span style="color:#94a3b8;">MIRA:</span> ${targetBlockName}
      </div>
    `;
  }

  destroy() {
    if (this.domElement && this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
      this.domElement = null;
    }
  }
}
