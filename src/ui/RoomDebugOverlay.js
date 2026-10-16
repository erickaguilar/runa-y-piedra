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
  [BLOCK_TYPES.WATER]: 'Agua Subterránea',
  [BLOCK_TYPES.WATER_STREAM_NORTH]: 'Torrente Fluvial Norte (-Z)',
  [BLOCK_TYPES.WATER_STREAM_SOUTH]: 'Torrente Fluvial Sur (+Z)',
  [BLOCK_TYPES.WATER_STREAM_EAST]: 'Torrente Fluvial Este (+X)',
  [BLOCK_TYPES.WATER_STREAM_WEST]: 'Torrente Fluvial Oeste (-X)',
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
    el.className = 'sumie-coords-overlay';

    el.innerHTML = `
      <div class="sumie-coords-header">
        <div style="display:flex;align-items:center;gap:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          <span id="dev-overlay-room" class="sumie-coords-room">—</span>
          <span id="dev-overlay-level" class="sumie-coords-level">—</span>
        </div>
        <button id="btn-overlay-copy-coords" type="button" title="Copiar reporte y coordenadas (o pulsa C)" class="sumie-coords-copy-btn">
          📋 Copiar
        </button>
      </div>
      <div>
        <span class="sumie-coords-label">POS:</span>
        <strong id="dev-overlay-pos" class="sumie-coords-val">X: 0.00 | Y: 0.00 | Z: 0.00</strong>
      </div>
      <div>
        <span class="sumie-coords-label">LOOK:</span>
        <span id="dev-overlay-look" class="sumie-coords-val">Yaw: 0° | Pitch: 0°</span>
      </div>
      <div>
        <span class="sumie-coords-label">HERO:</span>
        <span id="dev-overlay-hero" class="sumie-coords-val sumie-coords-hero">Aventurero</span>
        <span id="dev-overlay-jump" class="sumie-coords-sub">(Salto: ×1.00)</span>
      </div>
      <div>
        <span class="sumie-coords-label">ESTADO:</span>
        <span id="dev-overlay-state" class="sumie-coords-val">Física Normal</span>
        <span id="dev-overlay-lives" class="sumie-coords-sub">Vidas: 3</span>
      </div>
      <div class="sumie-coords-target-row">
        <span class="sumie-coords-label">MIRA:</span> <span id="dev-overlay-target">Ninguno en rango</span>
      </div>
    `;

    const copyBtn = el.querySelector('#btn-overlay-copy-coords');
    if (copyBtn) {
      const handleCopyTrigger = (e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        // Desbloquear cursor temporalmente para evitar que el canvas recapture antes de la copia
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
        this.copyOverlayData();
      };
      copyBtn.addEventListener('click', handleCopyTrigger);
      copyBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    document.body.appendChild(el);
    this.domElement = el;

    // Cachear referencias DOM dinámicas para actualizaciones ultrarrápidas
    this.uiRefs = {
      room: el.querySelector('#dev-overlay-room'),
      level: el.querySelector('#dev-overlay-level'),
      pos: el.querySelector('#dev-overlay-pos'),
      look: el.querySelector('#dev-overlay-look'),
      hero: el.querySelector('#dev-overlay-hero'),
      jump: el.querySelector('#dev-overlay-jump'),
      state: el.querySelector('#dev-overlay-state'),
      lives: el.querySelector('#dev-overlay-lives'),
      target: el.querySelector('#dev-overlay-target'),
      copyBtn,
    };
  }

  getBlockName(type) {
    return BLOCK_NAMES[type] || `Bloque (${type})`;
  }

  formatTargetDescription(target) {
    if (!target) return 'Ninguno en rango';

    // 1. Detección de elementos 3D (Cofres, Puertas, Pedestales, Monolitos, Losas)
    if (target.type === 'prop3d') {
      const stateBadge = target.state ? ` [${target.state}]` : '';
      const dist = target.distance != null ? ` (${target.distance.toFixed(1)}m)` : '';
      const coordStr = target.coords ? ` @ [${target.coords.x}, ${target.coords.y}, ${target.coords.z}]` : '';
      return `✨ <strong style="color:#38bdf8;">${target.name}</strong>${stateBadge}${coordStr}${dist}`;
    }

    // 2. Detección de bloque voxel
    const bName = this.getBlockName(target.blockType);
    const coordsStr = target.coords ? ` @ [${target.coords.x}, ${target.coords.y}, ${target.coords.z}]` : '';
    const distStr = target.distance != null ? ` (${target.distance.toFixed(1)}m)` : '';
    return `${bName}${coordsStr}${distStr}`;
  }

  copyOverlayData() {
    if (!this.lastData) return;
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
    } = this.lastData;

    const yawDeg = Math.round(((yaw * 180 / Math.PI) % 360 + 360) % 360);
    const pitchDeg = Math.round(pitch * 180 / Math.PI);
    const heroName = hero?.name || 'Aventurero';
    
    let targetStr = 'Ninguno';
    if (targetBlock) {
      if (targetBlock.type === 'prop3d') {
        targetStr = `[3D] ${targetBlock.name} (${targetBlock.state || 'activo'}) @ [${targetBlock.coords?.x}, ${targetBlock.coords?.y}, ${targetBlock.coords?.z}] (${targetBlock.distance?.toFixed(1)}m)`;
      } else {
        targetStr = `${this.getBlockName(targetBlock.blockType)} @ [${targetBlock.coords?.x}, ${targetBlock.coords?.y}, ${targetBlock.coords?.z}] (${targetBlock.distance?.toFixed(1)}m)`;
      }
    }

    const coordsText = `[${levelId}] ${roomName} | POS: [${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}] | YAW: ${yawDeg}° PITCH: ${pitchDeg}° | HERO: ${heroName} | MIRA: ${targetStr}`;

    const detailedPayload = {
      timestamp: new Date().toISOString(),
      level: { id: levelId, name: levelName },
      room: roomName,
      position: { x: Number(pos.x.toFixed(2)), y: Number(pos.y.toFixed(2)), z: Number(pos.z.toFixed(2)) },
      rotation: { yaw: yawDeg, pitch: pitchDeg },
      hero: heroName,
      isNoclip,
      lives,
      target: targetBlock ? {
        type: targetBlock.type,
        category: targetBlock.category || null,
        name: targetBlock.name || this.getBlockName(targetBlock.blockType),
        state: targetBlock.state || null,
        coords: targetBlock.coords,
        distance: Number(targetBlock.distance?.toFixed(2) || 0),
      } : null,
    };

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(coordsText).catch(() => {
        // Fallback síncrono por si navigator.clipboard fue bloqueado
        this._fallbackCopyText(coordsText);
      });
    } else {
      this._fallbackCopyText(coordsText);
    }

    if (typeof window !== 'undefined') {
      window.__lastCoordsDebug = detailedPayload;
      console.log('📋 [Dev Coords] Copiado exitosamente al portapapeles:', detailedPayload);
    }

    const copyBtn = this.uiRefs?.copyBtn || document.getElementById('btn-overlay-copy-coords');
    if (copyBtn) {
      copyBtn.innerHTML = `✓ Copiado`;
      copyBtn.style.background = 'rgba(16, 185, 129, 0.45)';
      copyBtn.style.color = '#6ee7b7';
      copyBtn.style.borderColor = '#10b981';
      setTimeout(() => {
        if (copyBtn) {
          copyBtn.innerHTML = `📋 Copiar`;
          copyBtn.style.background = 'rgba(52, 211, 153, 0.18)';
          copyBtn.style.color = '#a7f3d0';
          copyBtn.style.borderColor = 'rgba(52, 211, 153, 0.45)';
        }
      }, 1800);
    }
  }

  _fallbackCopyText(text) {
    if (typeof document === 'undefined') return;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.warn('[RoomDebugOverlay] No se pudo copiar texto:', e);
    }
    document.body.removeChild(textarea);
  }

  update(data = {}) {
    if (!this.enabled) return;
    this.lastData = data;
    if (!this.domElement || !this.uiRefs) this.initDom();
    if (!this.domElement || !this.uiRefs) return;

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
    const targetDesc = this.formatTargetDescription(targetBlock);

    // Actualizar nodos DOM existentes sin destruir el botón de copiar
    const r = this.uiRefs;
    if (r.room) {
      r.room.textContent = roomName;
      r.room.title = levelName;
    }
    if (r.level) {
      r.level.textContent = levelId;
      r.level.title = levelName;
    }
    if (r.pos) {
      r.pos.textContent = `X: ${pos.x.toFixed(2)} | Y: ${pos.y.toFixed(2)} | Z: ${pos.z.toFixed(2)}`;
    }
    if (r.look) {
      r.look.textContent = `Yaw: ${yawDeg}° | Pitch: ${pitchDeg}°`;
    }
    if (r.hero) {
      r.hero.textContent = heroName;
    }
    if (r.jump) {
      r.jump.textContent = `(Salto: ×${jumpMult})`;
    }
    if (r.state) {
      if (isNoclip) {
        r.state.innerHTML = '<strong style="color:#fbbf24;background:rgba(251,191,36,0.18);padding:1px 4px;border-radius:3px;">VUELO (NOCLIP)</strong>';
      } else {
        r.state.innerHTML = '<span style="color:#cbd5e1;">Física Normal</span>';
      }
    }
    if (r.lives) {
      r.lives.textContent = `Vidas: ${lives}`;
    }
    if (r.target) {
      r.target.innerHTML = targetDesc;
    }
  }

  destroy() {
    if (this.domElement && this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
      this.domElement = null;
      this.uiRefs = null;
    }
  }
}
