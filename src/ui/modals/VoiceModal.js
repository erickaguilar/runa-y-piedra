/**
 * VoiceModal.js - Modal de solicitud de activación de micrófono y chat de voz
 * 
 * Permite solicitar de forma explícita el permiso de micrófono ante un gesto
 * de usuario (clic / tap), cumpliendo con las políticas de autoplay y permisos
 * de navegadores móviles (iOS Safari / Android Chrome).
 */

export function showVoicePrompt(onAccept, onDecline) {
  if (typeof document === 'undefined') return null;
  // Si ya hay un prompt en pantalla, no duplicar
  const existing = document.querySelector('.voice-prompt');
  if (existing) return existing;

  const modal = document.createElement('div');
  modal.className = 'voice-prompt';
  modal.innerHTML = `
    <div class="voice-card">
      <div class="voice-icon">🎤</div>
      <h3>Chat de voz</h3>
      <p>¿Activar micrófono para hablar con tu equipo?</p>
      <div class="voice-actions">
        <button id="voice-no" type="button">Ahora no</button>
        <button id="voice-yes" type="button">Activar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const btnYes = modal.querySelector('#voice-yes');
  const btnNo = modal.querySelector('#voice-no');

  const cleanup = () => {
    modal.remove();
  };

  btnYes.onclick = () => {
    cleanup();
    if (typeof onAccept === 'function') onAccept();
  };
  btnNo.onclick = () => {
    cleanup();
    if (typeof onDecline === 'function') onDecline();
  };

  return modal;
}

export const VoiceModalMixin = {
  showVoicePrompt(onAccept, onDecline) {
    return showVoicePrompt(onAccept, onDecline);
  },
};
