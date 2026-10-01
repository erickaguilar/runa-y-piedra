import { renderIcon } from './Icons.js';

export const HeroMixin = {
  renderHeroTraitCard(hero) {
    if (!hero) return '';
    const speedPct = Math.round((hero.speedMultiplier || 1.0) * 100);
    const jumpPct = Math.round((hero.jumpMultiplier || 1.0) * 100);
    const defense = hero.stats?.defense || 3;
    return `
      <div class="hero-trait-box" style="border-left:3px solid ${hero.color}">
        <div class="hero-role" style="color:${hero.color}">
          ${renderIcon(hero.icon || 'shield', { size: 14, color: hero.color })}
          <span>${hero.title || hero.name}</span>
        </div>
        <div class="hero-trait">${hero.trait || hero.description || ''}</div>
        <div class="hero-stat-badges">
          <span class="hero-stat">${renderIcon('action', { size: 11, color: '#f59e0b' })} Vel ${speedPct}%</span>
          <span class="hero-stat">${renderIcon('jump', { size: 11, color: '#38bdf8' })} Salto ${jumpPct}%</span>
          <span class="hero-stat">${renderIcon('shield', { size: 11, color: '#10b981' })} Def ${defense}/5</span>
        </div>
      </div>
    `;
  },
};
