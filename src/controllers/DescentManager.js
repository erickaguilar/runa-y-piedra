// src/controllers/DescentManager.js
import * as Proto from '../network/Protocol.js';
import { escapeHtml } from '../ui/Icons.js';

/**
 * DescentManager - Descenso sincronizado por la escalinata (8s, estilo Deep Rock).
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
  }

  onStairTouch(p) {
    const game = this.game;
    if (game.mode !== 'host') return;
    if (!game.world.stairsOpen || game.interaction.isTransitioning()) return;
    if (!this.active) {
      this.startCountdown(p);
    } else if (p !== this.initiator) {
      this.goNow();
    }
  }

  startCountdown(initiator) {
    if (this.active) return;
    this.active = true;
    this.initiator = initiator;
    const deadline = Date.now() + 8000;
    this.game.network.broadcast(Proto.serializeDescentStart(initiator.id, initiator.name, deadline));
    this.game.ui.showDescentCountdown({
      byName: initiator.name, endsAtMs: deadline, onNow: () => this.goNow(),
    });
    this.game.ui.showNarrativeMessage(`🌀 ¡${escapeHtml(initiator.name)} desciende! 8s para bajar juntos...`, 4000);
    this.timer = setTimeout(() => this.goNow(), 8000);
  }

  /** Transición inmediata de toda la party: fade negro + siguiente nivel. */
  goNow() {
    if (!this.active) return;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.active = false;
    this.initiator = null;

    const game = this.game;
    const levels = game.world.levelRegistry.getAllLevels();
    const curIdx = levels.findIndex(l => l.id === game.world.levelRegistry.getCurrentLevel()?.id);
    const next = levels[curIdx + 1] || null;
    if (!next) return;
    game.network.broadcast(Proto.serializeDescentGo(next.id, next.name));
    this.beginFade(next.name);
    if (game.mode === 'host') {
      setTimeout(() => {
        if (game.mode === 'host') game.switchLevel(next.id, true);
      }, 1600);
    }
  }

  beginFade(nextName = '') {
    this.game.ui.hideDescent();
    this.game.ui.showLevelTransition(nextName || 'Descendiendo...', 'Descendiendo a las profundidades…');
    this.game.soundManager.playDescentEcho();
  }

  /** Enruta eventos 'descent' de la red según el modo. */
  onDescendEvent(detail = {}) {
    const game = this.game;
    if (game.mode === 'host') {
      // "Bajar ya" de un cliente: transición inmediata si hay cuenta atrás
      if (detail.kind === Proto.DESCENT_KIND.NOW && this.active) {
        this.goNow();
      }
      return;
    }
    if (game.mode !== 'client') return;
    if (detail.kind === Proto.DESCENT_KIND.START) {
      this.active = true;
      game.ui.showDescentCountdown({
        byName: detail.byName || 'Un compañero',
        endsAtMs: detail.deadline || (Date.now() + 8000),
        onNow: () => game.network.sendToHost(Proto.serializeDescentNow()),
      });
      game.ui.showNarrativeMessage(`🌀 ¡${escapeHtml(detail.byName || 'Un compañero')} desciende! 8s para bajar juntos...`, 4000);
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
    this.game.ui.hideDescent();
  }
}
