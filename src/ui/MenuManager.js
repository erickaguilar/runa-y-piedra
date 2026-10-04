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
    this.setSettingsButtonVisible(false);

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
        <div class="menu-header">
          <h1>${renderIcon('raido', { size: 22, color: '#d97706' })} RUNA Y PIEDRA</h1>
          <div class="menu-subtitle">
            ${renderIcon('compass', { size: 12, color: '#94a3b8' })} <span>Mazmorra Cooperativa P2P</span>
          </div>
        </div>
        
        <div class="menu-body-grid">
          <div class="menu-col menu-col-left">
            <div class="lobby-section">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <label class="lobby-label" style="margin:0">Tu Aventurero</label>
                <span id="menu-adventurer-lock-badge" class="menu-adventurer-lock-badge" style="font-size:10px;font-weight:700;display:inline-flex;align-items:center;gap:4px;"></span>
              </div>
              <input id="player-name-input" class="name-input" maxlength="12" 
                     placeholder="Nombre o Apodo" value="${escapeHtml(this.playerName)}" autocomplete="off"
                     autocapitalize="words" spellcheck="false" enterkeyhint="done" />
            </div>

            <div class="lobby-section">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <label class="lobby-label" style="margin:0">Clase de Héroe</label>
                <span id="menu-hero-lock-badge" class="menu-hero-lock-badge" style="font-size:10px;"></span>
              </div>
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
          </div>

          <div class="menu-col menu-col-right">
            <div class="menu-actions-group">
              <button id="btn-host" class="btn-primary">${renderIcon('castle', { size: 18, color: '#fff' })} Crear Mazmorra</button>
              
              <div class="join-container">
                <input id="pin-input" class="join-input" placeholder="PIN (4 dig.)" maxlength="4" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" enterkeyhint="go" />
                <button id="btn-join" class="btn-join">${renderIcon('door', { size: 15, color: '#fff' })} Unirse</button>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Ranuras de Guardado (3 ranuras directas) -->
            <div class="lobby-section">
              <label class="lobby-label" style="margin:0 0 6px 0;display:flex;align-items:center;gap:6px;">
                ${renderIcon('save', { size: 14, color: '#38bdf8' })} Ranuras de Guardado
              </label>
              <div class="menu-slots-row" id="menu-slots-row">
                ${this.renderMenuSlotsHtml()}
              </div>
              <div class="menu-slot-actions-row" style="margin-top:6px;">
                <button id="btn-menu-delete-active-slot" class="menu-delete-slot-btn" type="button" style="display:none;">
                  ${renderIcon('trash', { size: 12, color: '#f87171' })} Borrar Partida
                </button>
              </div>
            </div>

            <div class="status" id="status"></div>
          </div>
        </div>
      </div>`;

    // 1. Selector de clases de héroe
    const chips = this.uiEl.querySelectorAll ? this.uiEl.querySelectorAll('.hero-chip') : document.querySelectorAll('.hero-chip');
    if (chips) {
      chips.forEach(chip => {
        chip.onclick = () => {
          if (this.isMenuLocked) {
            soundManager.playHurt?.();
            const curHero = PLAYER_HEROES[this.selectedColorIndex] || PLAYER_HEROES[0];
            this.showNarrativeMessage(`:lock: La clase (${curHero.name}) está bloqueada para esta partida guardada. Bórrala desde el menú para cambiar de clase.`, 3200);
            return;
          }
          soundManager.playClick();
          chips.forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          const idx = parseInt(chip.dataset.index, 10);
          this.selectedColorIndex = idx;
          try {
            saveManager.updateProfile({ favoriteHero: idx });
          } catch {}
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('dungeon_player_color', idx.toString());
          }

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

          // Si el nombre no ha sido personalizado (o coincide con una clase), adaptarlo al héroe seleccionado
          const isHeroName = (n) => !n || PLAYER_HEROES.some((h) => h.name.toLowerCase() === n.trim().toLowerCase());
          const currentVal = nameInput ? nameInput.value.trim() : (this.playerName || '');
          if (isHeroName(currentVal)) {
            if (nameInput) nameInput.value = hero.name;
            this.playerName = hero.name;
            try {
              saveManager.updateProfile({ name: hero.name });
            } catch {}
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('dungeon_player_name', hero.name);
            }
          }
        };
      });
    }

    // 2. Guardar nombre
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        if (this.isMenuLocked) {
          e.preventDefault();
          return;
        }
        const currentHero = PLAYER_HEROES[this.selectedColorIndex] || PLAYER_HEROES[0];
        const val = e.target.value.trim();
        this.playerName = val || currentHero.name;
        try {
          saveManager.updateProfile({ name: this.playerName });
        } catch {}
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('dungeon_player_name', this.playerName);
        }
      });
    }

    // 3. Crear sala
    const btnHost = document.getElementById('btn-host');
    if (btnHost) {
      btnHost.onclick = () => {
        const activeSave = saveManager.currentSave;
        const colorIndex = (this.isMenuLocked && Number.isFinite(activeSave?.profile?.favoriteHero))
          ? activeSave.profile.favoriteHero
          : (this.selectedColorIndex ?? 0);
        const currentHero = PLAYER_HEROES[colorIndex] || PLAYER_HEROES[0];
        const name = (this.isMenuLocked && activeSave?.profile?.name)
          ? activeSave.profile.name
          : (nameInput ? nameInput.value.trim() || currentHero.name : (this.playerName || currentHero.name));
        if (activeSave?.profile) {
          activeSave.profile.name = name;
          activeSave.profile.favoriteHero = colorIndex;
        }
        onHost({ name, colorIndex });
      };
    }

    // 4. Unirse con selector interactivo de héroe para invitados
    const handleJoin = () => {
      const pin = document.getElementById('pin-input')?.value?.trim() || '';
      if (!pin) {
        this.setStatus('Introduce el PIN de la sala');
        return;
      }
      const activeSave = saveManager.currentSave;
      const currentColorIndex = (this.isMenuLocked && Number.isFinite(activeSave?.profile?.favoriteHero))
        ? activeSave.profile.favoriteHero
        : (this.selectedColorIndex ?? 0);
      const currentHero = PLAYER_HEROES[currentColorIndex] || PLAYER_HEROES[0];
      const currentName = (this.isMenuLocked && activeSave?.profile?.name)
        ? activeSave.profile.name
        : (nameInput ? nameInput.value.trim() || currentHero.name : (this.playerName || currentHero.name));

      if (typeof this.showGuestJoinModal === 'function') {
        this.showGuestJoinModal({
          pin,
          initialName: currentName,
          initialHeroIndex: currentColorIndex,
          onConfirm: ({ name, colorIndex }) => {
            onJoin(pin, { name, colorIndex });
          },
        });
      } else {
        onJoin(pin, { name: currentName, colorIndex: currentColorIndex });
      }
    };

    const btnJoin = document.getElementById('btn-join');
    if (btnJoin) btnJoin.onclick = handleJoin;
    const pinInput = document.getElementById('pin-input');
    if (pinInput) {
      pinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleJoin();
      });
    }

    // 5. Auto-join si existe parámetro ?join= en la URL
    const urlParams = typeof window !== 'undefined' && window.location ? new URLSearchParams(window.location.search) : null;
    const joinParam = urlParams?.get('join');
    if (joinParam && pinInput) {
      pinInput.value = joinParam;
      this.setStatus(`Invitación a sala ${joinParam} detectada`);
      setTimeout(() => {
        handleJoin();
      }, 350);
    }

    // 6. Ranuras de Guardado en el Menú Principal
    this.bindMenuSlotsEvents();
    this.refreshMenuSlots();

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
        <div class="menu-slot-chip ${isActive ? 'active' : ''} ${isEmpty ? 'is-empty' : 'has-data'}" 
             data-slot-id="${s.slotId}" 
             role="button"
             tabindex="0"
             title="${isEmpty ? `Ranura ${num}: Vacía` : `Ranura ${num}: ${escapeHtml(s.name)} (${hero.name} - Cap. ${s.highestChapter})`}">
          <div class="menu-slot-chip-top">
            <span class="menu-slot-num">Ranura ${num}</span>
            <span class="menu-slot-badge ${isActive ? (isEmpty ? 'badge-empty' : 'badge-active') : (isEmpty ? 'badge-empty' : 'badge-saved')}">
              ${isActive ? (isEmpty ? 'Vacía' : 'Activa') : (isEmpty ? 'Vacía' : 'Cargar')}
            </span>
          </div>
          <div class="menu-slot-chip-body">
            ${isEmpty ? `
              <div class="menu-slot-empty-text">${isActive ? 'Vacía (Activa)' : 'Vacía'}</div>
            ` : `
              <div class="menu-slot-info-box">
                <div class="menu-slot-info-main">
                  <div class="menu-slot-hero-tag" style="color:${hero.color}">
                    ${renderIcon(hero.icon || 'shield', { size: 12, color: hero.color })}
                    <span class="menu-slot-name-val">${escapeHtml(s.name)}</span>
                  </div>
                  <div class="menu-slot-meta-tag">
                    <span class="menu-slot-hero-class">${hero.name}</span> • <span class="menu-slot-chapter-val">Cap. ${s.highestChapter}</span>
                  </div>
                </div>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');
  },

  setMenuLockedState(isLocked, summary = null) {
    this.isMenuLocked = !!isLocked;
    const getEl = (id) => (typeof document !== 'undefined' && document?.getElementById ? document.getElementById(id) : (this.uiEl?.querySelector ? this.uiEl.querySelector('#' + id) : null));
    const nameInput = getEl('player-name-input');
    const heroesRow = getEl('heroes-row');
    const advBadge = getEl('menu-adventurer-lock-badge');
    const heroLockBadge = getEl('menu-hero-lock-badge');
    const deleteActiveBtn = getEl('btn-menu-delete-active-slot');

    if (this.isMenuLocked) {
      if (nameInput) {
        if (summary?.name) {
          nameInput.value = summary.name;
          this.playerName = summary.name;
        }
        nameInput.disabled = true;
        nameInput.classList.add('input-locked');
        nameInput.title = 'Nombre bloqueado para esta partida guardada. Bórrala desde el menú para cambiar de aventurero.';
      }
      if (heroesRow) {
        heroesRow.classList.add('heroes-locked');
        heroesRow.title = 'Clase bloqueada para esta partida guardada.';
      }
      if (summary && Number.isFinite(summary.heroIndex)) {
        this.selectedColorIndex = summary.heroIndex;
        const heroChips = this.uiEl.querySelectorAll ? this.uiEl.querySelectorAll('#heroes-row .hero-chip') : (typeof document !== 'undefined' ? document?.querySelectorAll?.('#heroes-row .hero-chip') : null);
        if (heroChips) {
          heroChips.forEach(c => {
            const idx = parseInt(c.dataset.index, 10);
            c.classList.toggle('selected', idx === this.selectedColorIndex);
          });
        }
        const hero = PLAYER_HEROES[this.selectedColorIndex] || PLAYER_HEROES[0];
        const badge = getEl('hero-badge');
        if (badge) {
          badge.innerHTML = `${renderIcon(hero.icon || 'shield', { size: 15, color: hero.color })} <span>${hero.name}</span>`;
          badge.style.color = hero.color;
        }
        const traitContainer = getEl('hero-trait-container');
        if (traitContainer) {
          traitContainer.innerHTML = this.renderHeroTraitCard(hero);
        }
      }
      if (advBadge) {
        advBadge.innerHTML = `${renderIcon('lock', { size: 11, color: '#f59e0b' })} <span style="color:#f59e0b">Guardado</span>`;
      }
      if (heroLockBadge) {
        heroLockBadge.innerHTML = `<span style="color:#f59e0b;font-weight:700;">${renderIcon('lock', { size: 10, color: '#f59e0b' })} Clase fija</span>`;
      }
      if (deleteActiveBtn) {
        deleteActiveBtn.style.display = 'inline-flex';
        const num = (saveManager.currentSlotId || 'slot_1').replace('slot_', '');
        deleteActiveBtn.innerHTML = `${renderIcon('trash', { size: 12, color: '#f87171' })} Borrar Partida (Ranura ${num})`;
      }
    } else {
      if (nameInput) {
        nameInput.disabled = false;
        nameInput.classList.remove('input-locked');
        nameInput.title = 'Introduce tu nombre o apodo';
        nameInput.value = this.playerName || 'Aventurero';
      }
      if (heroesRow) {
        heroesRow.classList.remove('heroes-locked');
        heroesRow.title = 'Selecciona tu clase de héroe';
      }
      const heroChips = this.uiEl.querySelectorAll ? this.uiEl.querySelectorAll('#heroes-row .hero-chip') : (typeof document !== 'undefined' ? document?.querySelectorAll?.('#heroes-row .hero-chip') : null);
      if (heroChips) {
        heroChips.forEach(c => {
          const idx = parseInt(c.dataset.index, 10);
          c.classList.toggle('selected', idx === this.selectedColorIndex);
        });
      }
      const hero = PLAYER_HEROES[this.selectedColorIndex] || PLAYER_HEROES[0];
      const badge = getEl('hero-badge');
      if (badge) {
        badge.innerHTML = `${renderIcon(hero.icon || 'shield', { size: 15, color: hero.color })} <span>${hero.name}</span>`;
        badge.style.color = hero.color;
      }
      const traitContainer = getEl('hero-trait-container');
      if (traitContainer) {
        traitContainer.innerHTML = this.renderHeroTraitCard(hero);
      }
      if (advBadge) {
        advBadge.innerHTML = `${renderIcon('sparkles', { size: 11, color: '#22c55e' })} <span style="color:#4ade80">Nueva Partida</span>`;
      }
      if (heroLockBadge) {
        heroLockBadge.innerHTML = `<span style="color:#94a3b8">1 por equipo</span>`;
      }
      if (deleteActiveBtn) {
        deleteActiveBtn.style.display = 'none';
      }
    }
  },

  bindMenuSlotsEvents() {
    const slotChips = this.uiEl.querySelectorAll ? this.uiEl.querySelectorAll('.menu-slot-chip') : (typeof document !== 'undefined' ? document?.querySelectorAll?.('.menu-slot-chip') : null);
    if (slotChips && slotChips.length > 0) {
      slotChips.forEach(chip => {
        const handleChipClick = async (e) => {
          if (e) {
            e.stopPropagation();
            if (e.cancelable) e.preventDefault();
          }
          if (this._isSwitchingSlot) return;
          const slotId = chip.dataset.slotId;
          if (!slotId) return;

          // Ya no abre el admin de guardados, solo afecta al modal menu
          if (slotId === saveManager.currentSlotId) {
            return;
          }

          this._isSwitchingSlot = true;
          try {
            soundManager.playClick?.();
            const updatedSave = await saveManager.switchSlot(slotId);
            const summaries = await saveManager.getAllSlotsSummary();
            const targetSummary = summaries.find(s => s.slotId === slotId);
            const isSaved = targetSummary ? !targetSummary.isEmpty : false;

            if (isSaved) {
              this.playerName = updatedSave.profile?.name || 'Aventurero';
              this.selectedColorIndex = Number.isFinite(updatedSave.profile?.favoriteHero)
                ? updatedSave.profile.favoriteHero
                : 0;
            } else {
              this.playerName = 'Aventurero';
              this.selectedColorIndex = 0;
            }

            try {
              localStorage.setItem('dungeon_player_name', this.playerName);
              localStorage.setItem('dungeon_player_color', this.selectedColorIndex.toString());
            } catch {}

            if (updatedSave.profile?.settings) {
              const s = updatedSave.profile.settings;
              try {
                if (s.camera) {
                  this.cameraModeUI = s.camera;
                  this.settingsCallbacks?.onCameraChange?.(s.camera);
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
              } catch {}
            }

            try {
              if (this.lastMenuParams?.onSlotChanged) {
                await this.lastMenuParams.onSlotChanged(slotId, updatedSave);
              } else {
                await this.campaignCallbacks?.onReloadCatalog?.();
              }
            } catch {}

            try {
              this.settingsCallbacks?.onProfileSave?.({
                name: this.playerName,
                colorIndex: this.selectedColorIndex,
              });
            } catch {}

            this.setMenuLockedState(isSaved, targetSummary);
            await this.refreshMenuSlots(summaries);

            const num = slotId.replace('slot_', '');
            if (isSaved) {
              const hero = PLAYER_HEROES[this.selectedColorIndex] || PLAYER_HEROES[0];
              this.showNarrativeMessage(`:save: Ranura ${num} cargada: ${escapeHtml(this.playerName)} (${hero.name} • Cap. ${updatedSave.campaign?.highestChapterUnlocked || 1})`, 2800);
            } else {
              this.showNarrativeMessage(`:save: Ranura ${num} vacía seleccionada. Personaliza tu aventurero y clase.`, 2800);
            }
          } catch (err) {
            console.warn('[MenuManager] Error cambiando ranura:', err);
            this.showNarrativeMessage(`Error al cargar ranura: ${err?.message || 'Error'}`, 3500);
          } finally {
            this._isSwitchingSlot = false;
          }
        };

        chip.onclick = handleChipClick;
        chip.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleChipClick(e);
          }
        };
      });
    }


    // Botón de borrado de la ranura activa en cabecera
    const getEl = (id) => (typeof document !== 'undefined' && document?.getElementById ? document.getElementById(id) : (this.uiEl?.querySelector ? this.uiEl.querySelector('#' + id) : null));
    const deleteActiveBtn = getEl('btn-menu-delete-active-slot');
    if (deleteActiveBtn) {
      const handleDeleteActive = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        soundManager.playClick();
        const activeSlotId = saveManager.currentSlotId || 'slot_1';
        const num = activeSlotId.replace('slot_', '');
        const summary = (saveManager.getCachedSummaries() || []).find(s => s.slotId === activeSlotId);
        const hero = summary ? (PLAYER_HEROES[summary.heroIndex] || PLAYER_HEROES[0]) : PLAYER_HEROES[0];

        this.showConfirmDialog({
          title: `¿Borrar Ranura ${num}?`,
          message: `¿Estás seguro de que deseas eliminar la partida de ${escapeHtml(summary?.name || this.playerName)} (${hero.name})? Se perderá todo el progreso y se reiniciará la ranura.`,
          confirmText: 'Borrar Guardado',
          cancelText: 'Cancelar',
          icon: 'trash',
          iconColor: '#ef4444',
          danger: true,
          onConfirm: async () => {
            try {
              await saveManager.deleteSlot(activeSlotId);
              try {
                if (this.lastMenuParams?.onResetSessionProgress) {
                  this.lastMenuParams.onResetSessionProgress();
                }
                await this.campaignCallbacks?.onReloadCatalog?.();
              } catch {}
              this.playerName = 'Aventurero';
              this.selectedColorIndex = 0;
              try {
                localStorage.setItem('dungeon_player_name', this.playerName);
                localStorage.setItem('dungeon_player_color', '0');
              } catch {}

              const summaries = await saveManager.getAllSlotsSummary();
              await this.refreshMenuSlots(summaries);
              this.setMenuLockedState(false);
              this.showNarrativeMessage(`:trash: Ranura ${num} borrada. Puedes modificar tu nombre y elegir tu clase de héroe.`, 3500);
            } catch (err) {
              console.error('[MenuManager] Error borrando ranura activa:', err);
              this.showNarrativeMessage(`Error al borrar: ${err.message}`, 3500);
            }
          },
        });
      };
      deleteActiveBtn.onclick = handleDeleteActive;
      deleteActiveBtn.addEventListener('touchend', handleDeleteActive, { passive: false });
    }
  },

  async refreshMenuSlots(providedSummaries = null) {
    const getEl = (id) => (typeof document !== 'undefined' && document?.getElementById ? document.getElementById(id) : (this.uiEl?.querySelector ? this.uiEl.querySelector('#' + id) : null));
    const slotsRow = getEl('menu-slots-row');
    if (!slotsRow) return;

    try {
      const summaries = providedSummaries || await saveManager.getAllSlotsSummary();
      slotsRow.innerHTML = this.renderMenuSlotsHtml(summaries);
      this.bindMenuSlotsEvents();

      const activeSlot = summaries.find(s => s.isActive);
      const isSaved = activeSlot ? !activeSlot.isEmpty : false;
      this.setMenuLockedState(isSaved, activeSlot);
    } catch (err) {
      console.warn('[MenuManager] Error refrescando ranuras:', err);
    }
  },

  hideMenu() {
    this.uiEl.innerHTML = '';
    this.setSettingsButtonVisible(true);
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
