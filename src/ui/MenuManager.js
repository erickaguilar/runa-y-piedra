import { PLAYER_HEROES } from '../config/constants.js';
import { renderIcon, escapeHtml } from './Icons.js';
import { soundManager } from '../audio/SoundManager.js';
import { saveManager } from '../storage/SaveManager.js';

export const MenuMixin = {
  showMenu({ onHost, onJoin }) {
    this.currentScreen = 'menu';
    this.lastMenuParams = { onHost, onJoin };
    this.setCrosshairVisible(false);
    this.setActionButtonsVisible(false);
    this.setLivesVisible(false);

    const heroesHtml = PLAYER_HEROES.map((h, i) => `
      <div class="hero-chip ${i === this.selectedColorIndex ? 'selected' : ''}" 
           data-index="${i}" 
           style="background:${h.color}; --hero-color:${h.color}" 
           title="${h.name} (${h.title || ''})">
        ${renderIcon(h.icon || 'shield', { size: 18, color: '#ffffff' })}
      </div>
    `).join('');

    const currentHero = PLAYER_HEROES[this.selectedColorIndex];

    this.uiEl.innerHTML = `
      <div class="menu">
        <h1>${renderIcon('raido', { size: 22, color: '#d97706' })} RUNA Y PIEDRA</h1>
        
        <div class="lobby-section">
          <label class="lobby-label">Tu Aventurero</label>
          <input id="player-name-input" class="name-input" maxlength="12" 
                 placeholder="Nombre o Apodo" value="${escapeHtml(this.playerName)}" autocomplete="off" />
        </div>

        <div class="lobby-section">
          <label class="lobby-label">Clase de Héroe</label>
          <div class="heroes-row" id="heroes-row">
            ${heroesHtml}
          </div>
          <div id="hero-badge" class="hero-badge" style="color:${currentHero.color}">
            ${renderIcon(currentHero.icon || 'shield', { size: 15, color: currentHero.color })} <span>${currentHero.name}</span>
          </div>
          <div id="hero-trait-container">
            ${this.renderHeroTraitCard(currentHero)}
          </div>
        </div>

        <div class="divider"></div>

        <button id="btn-host" class="btn-primary">${renderIcon('castle', { size: 18, color: '#fff' })} Crear Mazmorra</button>
        
        <div class="join-container">
          <input id="pin-input" class="join-input" placeholder="0000" maxlength="4" inputmode="numeric" />
          <button id="btn-join" class="btn-join">Unirse</button>
        </div>

        <!-- Ranuras de Guardado -->
        <div class="lobby-section">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <label class="lobby-label" style="margin:0;display:flex;align-items:center;gap:6px;">
              ${renderIcon('save', { size: 14, color: '#38bdf8' })} Ranuras de Guardado
            </label>
            <button id="btn-open-save-slots" class="menu-slots-manage-btn" style="background:transparent;border:none;color:#38bdf8;font-size:11px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:2px 4px;">
              ${renderIcon('settings', { size: 12, color: '#38bdf8' })} Partidas Guardadas (3 Ranuras)
            </button>
          </div>
          <div class="menu-slots-row" id="menu-slots-row">
            ${this.renderMenuSlotsHtml()}
          </div>
        </div>

        <div class="status" id="status"></div>
      </div>`;

    // 1. Selector de clases de héroe
    const chips = this.uiEl.querySelectorAll('.hero-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        soundManager.playClick();
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        const idx = parseInt(chip.dataset.index, 10);
        this.selectedColorIndex = idx;
        localStorage.setItem('dungeon_player_color', idx.toString());

        const hero = PLAYER_HEROES[idx];
        const badge = document.getElementById('hero-badge');
        if (badge) {
          badge.innerHTML = `${renderIcon(hero.icon || 'shield', { size: 15, color: hero.color })} <span>${hero.name}</span>`;
          badge.style.color = hero.color;
        }
        const traitContainer = document.getElementById('hero-trait-container');
        if (traitContainer) {
          traitContainer.innerHTML = this.renderHeroTraitCard(hero);
        }
      };
    });

    // 2. Guardar nombre
    const nameInput = document.getElementById('player-name-input');
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      this.playerName = val || 'Aventurero';
      localStorage.setItem('dungeon_player_name', this.playerName);
    });

    // 3. Crear sala
    document.getElementById('btn-host').onclick = () => {
      const name = nameInput.value.trim() || 'Aventurero';
      onHost({ name, colorIndex: this.selectedColorIndex });
    };

    // 4. Unirse
    const handleJoin = () => {
      const pin = document.getElementById('pin-input').value.trim();
      const name = nameInput.value.trim() || 'Aventurero';
      onJoin(pin, { name, colorIndex: this.selectedColorIndex });
    };

    document.getElementById('btn-join').onclick = handleJoin;
    document.getElementById('pin-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleJoin();
    });

    // 5. Auto-join si existe parámetro ?join= en la URL
    const urlParams = typeof window !== 'undefined' && window.location ? new URLSearchParams(window.location.search) : null;
    const joinParam = urlParams?.get('join');
    if (joinParam) {
      document.getElementById('pin-input').value = joinParam;
      this.setStatus(`Invitación a sala ${joinParam} detectada`);
    }

    // 6. Ranuras de Guardado en el Menú Principal
    this.bindMenuSlotsEvents();
    this.refreshMenuSlots();

    const btnSlots = document.getElementById('btn-open-save-slots');
    if (btnSlots) {
      const handleOpenSlots = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        this.openSaveSlotsModal();
      };
      btnSlots.onclick = handleOpenSlots;
      btnSlots.addEventListener('touchend', handleOpenSlots, { passive: false });
    }
  },

  renderMenuSlotsHtml(summaries) {
    const list = summaries || saveManager.getCachedSummaries() || [
      { slotId: 'slot_1', isEmpty: false, isActive: (saveManager.currentSlotId || 'slot_1') === 'slot_1', name: this.playerName || 'Aventurero', heroIndex: this.selectedColorIndex || 0, highestChapter: 1 },
      { slotId: 'slot_2', isEmpty: true, isActive: saveManager.currentSlotId === 'slot_2', name: 'Ranura Vacía', heroIndex: 0, highestChapter: 1 },
      { slotId: 'slot_3', isEmpty: true, isActive: saveManager.currentSlotId === 'slot_3', name: 'Ranura Vacía', heroIndex: 0, highestChapter: 1 },
    ];

    return list.map(s => {
      const num = s.slotId.replace('slot_', '');
      const isActive = s.slotId === (saveManager.currentSlotId || 'slot_1');
      const isEmpty = !!s.isEmpty;
      const hero = PLAYER_HEROES[s.heroIndex] || PLAYER_HEROES[0];

      return `
        <button class="menu-slot-chip ${isActive ? 'active' : ''} ${isEmpty ? 'is-empty' : 'has-data'}" 
                data-slot-id="${s.slotId}" 
                type="button"
                title="${isEmpty ? `Ranura ${num}: Vacía` : `Ranura ${num}: ${escapeHtml(s.name)} (${hero.name} - Cap. ${s.highestChapter})`}">
          <div class="menu-slot-chip-top">
            <span class="menu-slot-num">Ranura ${num}</span>
            <span class="menu-slot-badge ${isActive ? 'badge-active' : (isEmpty ? 'badge-empty' : 'badge-saved')}">
              ${isActive ? 'Activa' : (isEmpty ? 'Vacía' : 'Cargar')}
            </span>
          </div>
          <div class="menu-slot-chip-body">
            ${isEmpty ? `
              <div class="menu-slot-empty-text">${isActive ? 'Vacía (Activa)' : 'Vacía'}</div>
            ` : `
              <div class="menu-slot-info-box">
                <div class="menu-slot-hero-tag" style="color:${hero.color}">
                  ${renderIcon(hero.icon || 'shield', { size: 12, color: hero.color })}
                  <span class="menu-slot-name-val">${escapeHtml(s.name)}</span>
                </div>
                <div class="menu-slot-meta-tag">
                  <span class="menu-slot-hero-class">${hero.name}</span> • <span class="menu-slot-chapter-val">Cap. ${s.highestChapter}</span>
                </div>
              </div>
            `}
          </div>
        </button>
      `;
    }).join('');
  },

  bindMenuSlotsEvents() {
    const slotChips = this.uiEl.querySelectorAll ? this.uiEl.querySelectorAll('.menu-slot-chip') : document.querySelectorAll('.menu-slot-chip');
    if (!slotChips || slotChips.length === 0) return;

    slotChips.forEach(chip => {
      const handleChipClick = async (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        const slotId = chip.dataset.slotId;
        const num = slotId ? slotId.replace('slot_', '') : '1';

        if (slotId === saveManager.currentSlotId) {
          this.openSaveSlotsModal();
          return;
        }

        try {
          const updatedSave = await saveManager.switchSlot(slotId);
          const summaries = await saveManager.getAllSlotsSummary();
          const targetSummary = summaries.find(s => s.slotId === slotId);

          // Cargar toda la información de la ranura seleccionada
          this.playerName = updatedSave.profile?.name || 'Aventurero';
          this.selectedColorIndex = Number.isFinite(updatedSave.profile?.favoriteHero)
            ? updatedSave.profile.favoriteHero
            : 0;
          localStorage.setItem('dungeon_player_name', this.playerName);
          localStorage.setItem('dungeon_player_color', this.selectedColorIndex.toString());

          // Cargar ajustes del perfil si existen
          if (updatedSave.profile?.settings) {
            const s = updatedSave.profile.settings;
            if (s.camera) {
              localStorage.setItem('dungeon_camera', s.camera);
              this.cameraModeUI = s.camera;
              if (typeof window !== 'undefined' && window.__game?.cameraController) {
                window.__game.setCameraMode?.(s.camera);
              }
            }
            if (s.soundMuted !== undefined) {
              soundManager.isMuted = !!s.soundMuted;
              localStorage.setItem('dungeon_sound_muted', s.soundMuted ? '1' : '0');
            }
            if (s.dpr) {
              localStorage.setItem('dungeon_dpr', String(s.dpr));
            }
            if (s.sensitivity) {
              localStorage.setItem('dungeon_sensitivity', String(s.sensitivity));
            }
          }

          // Cargar progreso de campaña en el registro de capítulos
          if (typeof window !== 'undefined' && window.__game?.chapterRegistry) {
            window.__game.chapterRegistry.load?.();
          }

          this.settingsCallbacks?.onProfileSave?.({
            name: this.playerName,
            colorIndex: this.selectedColorIndex,
          });

          // Actualizar campos del menú principal en tiempo real
          const nameInput = document.getElementById('player-name-input');
          if (nameInput) {
            nameInput.value = this.playerName;
          }

          const heroChips = this.uiEl.querySelectorAll ? this.uiEl.querySelectorAll('#heroes-row .hero-chip') : document.querySelectorAll('#heroes-row .hero-chip');
          if (heroChips) {
            heroChips.forEach(c => {
              const idx = parseInt(c.dataset.index, 10);
              c.classList.toggle('selected', idx === this.selectedColorIndex);
            });
          }

          const hero = PLAYER_HEROES[this.selectedColorIndex] || PLAYER_HEROES[0];
          const badge = document.getElementById('hero-badge');
          if (badge) {
            badge.innerHTML = `${renderIcon(hero.icon || 'shield', { size: 15, color: hero.color })} <span>${hero.name}</span>`;
            badge.style.color = hero.color;
          }

          const traitContainer = document.getElementById('hero-trait-container');
          if (traitContainer) {
            traitContainer.innerHTML = this.renderHeroTraitCard(hero);
          }

          // Refrescar los chips visuales de ranura
          await this.refreshMenuSlots(summaries);

          if (targetSummary && !targetSummary.isEmpty) {
            this.showNarrativeMessage(`💾 Ranura ${num} cargada: ${escapeHtml(this.playerName)} (${hero.name} • Cap. ${updatedSave.campaign?.highestChapterUnlocked || 1})`, 2800);
          } else {
            this.showNarrativeMessage(`💾 Ranura ${num} vacía seleccionada.`, 2500);
          }
        } catch (err) {
          console.warn('[MenuManager] Error cambiando ranura:', err);
          this.showNarrativeMessage(`Error al cargar ranura: ${err.message}`, 3500);
        }
      };

      chip.onclick = handleChipClick;
      chip.addEventListener('touchend', handleChipClick, { passive: false });
    });
  },

  async refreshMenuSlots(providedSummaries = null) {
    const slotsRow = document.getElementById('menu-slots-row');
    if (!slotsRow) return;

    try {
      const summaries = providedSummaries || await saveManager.getAllSlotsSummary();
      slotsRow.innerHTML = this.renderMenuSlotsHtml(summaries);
      this.bindMenuSlotsEvents();

      // Si la ranura activa tiene información y el menú difiere, cargar la información del perfil
      const activeSlot = summaries.find(s => s.isActive);
      if (activeSlot && !activeSlot.isEmpty && saveManager.currentSave?.profile) {
        const profile = saveManager.currentSave.profile;
        let changed = false;
        if (profile.name && this.playerName !== profile.name) {
          this.playerName = profile.name;
          localStorage.setItem('dungeon_player_name', this.playerName);
          const nameInput = document.getElementById('player-name-input');
          if (nameInput) nameInput.value = this.playerName;
          changed = true;
        }
        if (Number.isFinite(profile.favoriteHero) && this.selectedColorIndex !== profile.favoriteHero) {
          this.selectedColorIndex = profile.favoriteHero;
          localStorage.setItem('dungeon_player_color', this.selectedColorIndex.toString());
          changed = true;
        }
        if (changed) {
          const heroChips = this.uiEl.querySelectorAll ? this.uiEl.querySelectorAll('#heroes-row .hero-chip') : document.querySelectorAll('#heroes-row .hero-chip');
          if (heroChips) {
            heroChips.forEach(c => {
              const idx = parseInt(c.dataset.index, 10);
              c.classList.toggle('selected', idx === this.selectedColorIndex);
            });
          }
          const hero = PLAYER_HEROES[this.selectedColorIndex] || PLAYER_HEROES[0];
          const badge = document.getElementById('hero-badge');
          if (badge) {
            badge.innerHTML = `${renderIcon(hero.icon || 'shield', { size: 15, color: hero.color })} <span>${hero.name}</span>`;
            badge.style.color = hero.color;
          }
          const traitContainer = document.getElementById('hero-trait-container');
          if (traitContainer) {
            traitContainer.innerHTML = this.renderHeroTraitCard(hero);
          }
        }
      }
    } catch (err) {
      console.warn('[MenuManager] Error refrescando ranuras:', err);
    }
  },

  hideMenu() {
    this.uiEl.innerHTML = '';
  },

  setStatus(msg) {
    const s = document.getElementById('status');
    if (s) s.textContent = msg;
  },

  async shareLink(url, pin) {
    const shareData = {
      title: 'Runa y Piedra — Mazmorra Cooperativa P2P',
      text: `¡Únete a mi expedición en Runa y Piedra! Código PIN: ${pin}`,
      url: url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    await this.copyLink(url);
  },

  async copyLink(url) {
    const copyText = document.getElementById('copy-btn-text');
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      copied = document.execCommand('copy');
      document.body.removeChild(ta);
    }

    if (copyText) {
      copyText.innerHTML = copied ? `${renderIcon('check', { size: 14, color: '#22c55e' })} ¡Enlace Copiado!` : 'Error al copiar';
      setTimeout(() => {
        if (copyText) copyText.textContent = 'Copiar Enlace';
      }, 3000);
    }
    this.showNarrativeMessage('¡Enlace copiado! Envíalo por WhatsApp o Telegram.', 3500);
  },

  updatePartyList(players) {
    const countPills = document.querySelectorAll('.party-count-pill');
    if (countPills && countPills.length > 0) {
      countPills.forEach(pill => {
        if (players.length >= 5) {
          pill.style.color = '#f59e0b';
          pill.innerHTML = `${renderIcon('lock', { size: 11, color: '#f59e0b' })} 5/5 Llena`;
        } else {
          pill.style.color = '#38bdf8';
          pill.textContent = `${players.length}/5 Jugadores`;
        }
      });
    }

    const partyLists = document.querySelectorAll('#settings-party-list, #party-list');
    if (!partyLists || partyLists.length === 0) return;

    const partyHtml = players.map(p => {
      const hero = PLAYER_HEROES[p.colorIndex] || PLAYER_HEROES[0];
      const isHost = p.id === 0;
      return `
        <div class="party-item">
          <div class="party-member">
            <span class="party-dot" style="background:${hero.color}"></span>
            ${renderIcon(hero.icon || 'shield', { size: 13, color: hero.color })}
            <span>${escapeHtml(p.name || 'Aventurero')} (${hero.name})</span>
          </div>
          <span class="party-badge" style="${isHost ? '' : 'background:rgba(56,189,248,.2);color:#38bdf8'}">
            ${isHost ? 'Host' : 'Listo'}
          </span>
        </div>`;
    }).join('') + (players.length < 2 ? `
        <div class="party-item" style="color:#64748b;font-style:italic">
          <span>Esperando compañero...</span>
        </div>` : '');

    partyLists.forEach(el => {
      el.innerHTML = partyHtml;
    });
  },
};
