import { renderIcon } from './Icons.js';
import { getHeroWeapon } from '../config/combat.js';

export const HeroMixin = {
  renderHeroTraitCard(hero) {
    if (!hero) return '';
    const speedPct = Math.round((hero.speedMultiplier || 1.0) * 100);
    const jumpPct = Math.round((hero.jumpMultiplier || 1.0) * 100);
    const defense = hero.stats?.defense || 3;

    // Obtener arma canónica y rango de daño con bonificación por distancia
    const weapon = getHeroWeapon(hero.id || hero.index || 0);
    let maxBonus = 0;
    if (weapon.sweetSpotBonus) {
      maxBonus = weapon.sweetSpotBonus;
    } else if (weapon.rangeTiers?.length) {
      maxBonus = Math.max(...weapon.rangeTiers.map(t => t.bonus));
    }
    const maxDmg = weapon.damage + maxBonus;
    const dmgStr = maxBonus > 0 ? `${weapon.damage}-${maxDmg}` : `${weapon.damage}`;

    return `
      <div class="hero-trait-box class-info-box" style="border-left:4px solid ${hero.color}">
        <div class="hero-role" style="color:${hero.color}">
          ${renderIcon(hero.icon || 'shield', { size: 14, color: hero.color })}
          <span>${hero.title || hero.name}</span>
        </div>
        <div class="hero-trait">${hero.trait || hero.description || ''}</div>
        <div class="hero-stat-badges">
          <span class="hero-stat stat-pill" title="Arma: ${weapon.name} (${weapon.damage} base, hasta ${maxDmg} según distancia)">${renderIcon('swords', { size: 11, color: '#f43f5e' })} Daño ${dmgStr}</span>
          <span class="hero-stat stat-pill">${renderIcon('action', { size: 11, color: '#f59e0b' })} Vel ${speedPct}%</span>
          <span class="hero-stat stat-pill">${renderIcon('jump', { size: 11, color: '#38bdf8' })} Salto ${jumpPct}%</span>
          <span class="hero-stat stat-pill">${renderIcon('shield', { size: 11, color: '#10b981' })} Def ${defense}/5</span>
        </div>
      </div>
    `;
  },
};
