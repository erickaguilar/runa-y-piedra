// src/controllers/DescentManager.js
import * as Proto from '../network/Protocol.js';
import { escapeHtml } from '../ui/Icons.js';

/**
 * DescentManager - Descenso sincronizado por la escalinata (5s, estilo Deep Rock).
 *
 * Extraído del game principal: posee el estado de la cuenta atrás
 * (active/initiator/timer) y orquesta START/GO/fade entre host y clientes.
 */
export class DescentManager {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.initiator = null;
    this.timer = null;
    this.transitioning = false;
  }

  freezeAllPlayers() {
    const all = this.game.playerManager.getAllPlayers();
    for (const p of all) {
      p.vel.x = 0;
      p.vel.y = 0;
      p.vel.z = 0;
      p.inputForward = 0;
      p.inputRight = 0;
      p.invulnTicks = Math.max(p.invulnTicks || 0, 90);
    }
  }

  onStairTouch(p) {
    const game = this.game;
    if (game.mode !== 'host') return;
    if (this.transitioning) return;
    if (!game.world.stairsOpen || game.interaction.isTransitioning()) return;
    if (!this.active) {
      this.startCountdown(p);
    } else if (p !== this.initiator) {
      this.goNow();
    }
  }

  startCountdown(initiator) {
    if (this.active || this.transitioning) return;
    this.active = true;
    this.initiator = initiator;
    const deadline = Date.now() + 5000;
    this.game.network.broadcast(Proto.serializeDescentStart(initiator.id, initiator.name, deadline));
    // Unificar notificaciones: limpiar alertas de losa/interacción previas para centrar la atención en el descenso
    this.game.ui.hideNarrativeMessage?.();
    this.game.ui.showDescentCountdown({
      byName: initiator.name, endsAtMs: deadline, onNow: () => this.goNow(),
    });
    this.timer = setTimeout(() => this.goNow(), 5000);
  }

  /** Transición inmediata de toda la party: fade negro + siguiente nivel. */
  goNow() {
    if (this.transitioning) return;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.active = false;
    this.initiator = null;
    this.transitioning = true;

    const game = this.game;
    const curLevelId = game.world.levelRegistry.getCurrentLevel()?.id;
    let next = null;

    if (game.chapterRegistry) {
      const nextDungeon = game.chapterRegistry.getNextDungeonInChapter(curLevelId);
      if (nextDungeon) {
        next = game.world.levelRegistry.getLevel(nextDungeon.id);
      }
    }

    if (!next) {
      const levels = game.world.levelRegistry.getAllLevels();
      const curIdx = levels.findIndex(l => l.id === curLevelId);
      next = levels[curIdx + 1] || null;
    }

    if (!next) {
      this.transitioning = false;
      return;
    }

    this.freezeAllPlayers();
    game.network.broadcast(Proto.serializeDescentGo(next.id, next.name));
    this.beginFade(next.name);
    if (game.mode === 'host') {
      setTimeout(() => {
        if (game.mode === 'host') game.switchLevel(next.id, true);
      }, 1600);
    }
  }

  beginFade(nextName = '') {
    this.transitioning = true;
    this.freezeAllPlayers();
    this.game.ui.hideDescent();
    this.game.ui.hideNarrativeMessage?.();
    this.game.ui.showLevelTransition(nextName || 'Descendiendo...', 'Descendiendo a las profundidades…');
    this.game.soundManager.playDescentEcho();
  }

  /** Enruta eventos 'descent' de la red según el modo. */
  onDescendEvent(detail = {}) {
    const game = this.game;
    if (game.mode === 'host') {
      // "Bajar ya" de un cliente: transición inmediata si hay cuenta atrás
      if (detail.kind === Proto.DESCENT_KIND.NOW && (this.active || !this.transitioning)) {
        this.goNow();
      }
      return;
    }
    if (game.mode !== 'client') return;
    if (detail.kind === Proto.DESCENT_KIND.START) {
      this.active = true;
      const deadline = detail.deadline || (Date.now() + 5000);
      game.ui.hideNarrativeMessage?.();
      game.ui.showDescentCountdown({
        byName: detail.byName || 'Un compañero',
        endsAtMs: deadline,
        onNow: () => game.network.sendToHost(Proto.serializeDescentNow()),
      });
    } else if (detail.kind === Proto.DESCENT_KIND.GO) {
      this.active = false;
      this.beginFade(detail.nextName || '');
    }
  }

  /** Reset al cambiar de mapa (lo llama switchLevel). */
  reset() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.active = false;
    this.initiator = null;
    this.transitioning = false;
    this.game.ui.hideDescent();
  }
}
