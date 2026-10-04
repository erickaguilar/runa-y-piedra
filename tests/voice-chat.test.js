import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NetworkManager } from '../src/network/NetworkManager.js';
import { showVoicePrompt } from '../src/ui/modals/VoiceModal.js';
import { UIManager } from '../src/ui/UIManager.js';

test('VoiceChat - NetworkManager inicializa estado de voz aislado', () => {
  const nm = new NetworkManager();
  assert.equal(nm.localStream, null, 'localStream debe ser null al inicio');
  assert.ok(nm.mediaCalls instanceof Map, 'mediaCalls debe ser un Map');
  assert.equal(nm.mediaCalls.size, 0);
  assert.ok(nm.remoteAudios instanceof Map, 'remoteAudios debe ser un Map');
  assert.equal(nm.remoteAudios.size, 0);
  assert.equal(nm.voiceEnabled, false, 'voiceEnabled debe ser false al inicio');
  assert.equal(nm.isMuted(), true, 'isMuted debe devolver true si no hay stream');
});

test('VoiceChat - toggleMute e isMuted alternan estado de audio tracks', () => {
  const nm = new NetworkManager();

  // Sin stream, toggleMute devuelve false
  assert.equal(nm.toggleMute(), false);

  // Simular MediaStream con audio track
  let trackEnabled = true;
  const mockTrack = {
    get enabled() { return trackEnabled; },
    set enabled(val) { trackEnabled = val; },
    stop: () => {},
  };
  nm.localStream = {
    getAudioTracks: () => [mockTrack],
    getTracks: () => [mockTrack],
  };
  nm.voiceEnabled = true;

  assert.equal(nm.isMuted(), false, 'isMuted es false cuando track.enabled es true');

  let eventFired = false;
  let mutedState = null;
  nm.addEventListener('voice-mute-change', (e) => {
    eventFired = true;
    mutedState = e.detail.muted;
  });

  const enabledResult1 = nm.toggleMute();
  assert.equal(enabledResult1, false, 'toggleMute desactiva el micro');
  assert.equal(trackEnabled, false);
  assert.equal(nm.isMuted(), true);
  assert.equal(eventFired, true);
  assert.equal(mutedState, true);

  const enabledResult2 = nm.toggleMute();
  assert.equal(enabledResult2, true, 'toggleMute reactiva el micro');
  assert.equal(trackEnabled, true);
  assert.equal(nm.isMuted(), false);
  assert.equal(mutedState, false);
});

test('VoiceChat - startVoiceCall conecta con peer y enlaza llamada', async () => {
  const nm = new NetworkManager();

  // Mock _ensureLocalStream
  const mockStream = {
    getAudioTracks: () => [{ enabled: true, stop: () => {} }],
    getTracks: () => [{ stop: () => {} }],
  };
  nm._ensureLocalStream = async () => mockStream;

  let calledPeerId = null;
  let sentStream = null;
  const mockCallEvents = {};
  const mockCall = {
    on: (evt, handler) => {
      mockCallEvents[evt] = handler;
    },
    close: () => {
      mockCall.closed = true;
    },
  };

  nm.peer = {
    call: (peerId, stream) => {
      calledPeerId = peerId;
      sentStream = stream;
      return mockCall;
    },
  };

  await nm.startVoiceCall('peer-123');

  assert.equal(calledPeerId, 'peer-123');
  assert.equal(sentStream, mockStream);
  assert.equal(nm.mediaCalls.get('peer-123'), mockCall);

  // Si ya existe llamada activa con peer-123, no duplica
  calledPeerId = null;
  await nm.startVoiceCall('peer-123');
  assert.equal(calledPeerId, null, 'no debe llamar si ya existe en mediaCalls');
});

test('VoiceChat - _attachRemoteAudio crea elemento <audio> con playsinline y autoplay', () => {
  const nm = new NetworkManager();

  // Simular DOM mínimo
  const createdElements = [];
  const appendedElements = [];
  const fakeDoc = {
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        attributes: {},
        style: {},
        setAttribute(k, v) { this.attributes[k] = v; },
        play: async () => {},
        remove: () => {
          const idx = appendedElements.indexOf(el);
          if (idx !== -1) appendedElements.splice(idx, 1);
        },
      };
      createdElements.push(el);
      return el;
    },
    body: {
      appendChild: (el) => {
        appendedElements.push(el);
      },
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  const originalDoc = globalThis.document;
  globalThis.document = fakeDoc;

  try {
    const remoteStream = { id: 'remote-stream-1' };
    nm._attachRemoteAudio('peer-abc', remoteStream);

    assert.equal(nm.remoteAudios.has('peer-abc'), true);
    const audioEl = nm.remoteAudios.get('peer-abc');
    assert.equal(audioEl.tagName, 'AUDIO');
    assert.equal(audioEl.playsinline, true);
    assert.equal(audioEl.autoplay, true);
    assert.equal(audioEl.srcObject, remoteStream);
    assert.equal(audioEl.attributes['playsinline'], '');
    assert.equal(audioEl.attributes['webkit-playsinline'], '');
    assert.equal(audioEl.style.display, 'none');
    assert.ok(appendedElements.includes(audioEl));

    // Reutiliza el mismo elemento si se vuelve a llamar para el mismo peer
    const countBefore = createdElements.length;
    nm._attachRemoteAudio('peer-abc', remoteStream);
    assert.equal(createdElements.length, countBefore);
  } finally {
    globalThis.document = originalDoc;
  }
});

test('VoiceChat - _cleanupMedia y stopAllVoice liberan recursos', () => {
  const nm = new NetworkManager();

  let audioRemoved = false;
  const mockAudio = {
    srcObject: {},
    remove: () => { audioRemoved = true; },
  };
  let callClosed = false;
  const mockCall = {
    close: () => { callClosed = true; },
  };

  nm.remoteAudios.set('peer-x', mockAudio);
  nm.mediaCalls.set('peer-x', mockCall);

  nm._cleanupMedia('peer-x');
  assert.equal(audioRemoved, true);
  assert.equal(callClosed, true);
  assert.equal(mockAudio.srcObject, null);
  assert.equal(nm.remoteAudios.has('peer-x'), false);
  assert.equal(nm.mediaCalls.has('peer-x'), false);

  // stopAllVoice
  let trackStopped = false;
  nm.localStream = {
    getTracks: () => [{ stop: () => { trackStopped = true; } }],
  };
  nm.voiceEnabled = true;
  nm.remoteAudios.set('peer-y', { srcObject: {}, remove: () => {} });
  nm.mediaCalls.set('peer-y', { close: () => {} });

  let stopEventFired = false;
  nm.addEventListener('voice-stop', () => { stopEventFired = true; });

  nm.stopAllVoice();
  assert.equal(trackStopped, true);
  assert.equal(nm.localStream, null);
  assert.equal(nm.voiceEnabled, false);
  assert.equal(nm.remoteAudios.size, 0);
  assert.equal(nm.mediaCalls.size, 0);
  assert.equal(stopEventFired, true);
});

test('VoiceChat - showVoicePrompt gestiona aceptación y rechazo', () => {
  const appendedElements = [];
  const fakeDoc = {
    querySelector: (sel) => {
      if (sel === '.voice-prompt') return appendedElements.find(e => e.className === 'voice-prompt') || null;
      return null;
    },
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        className: '',
        innerHTML: '',
        querySelector: (sel) => {
          if (sel === '#voice-yes') return el._yesBtn;
          if (sel === '#voice-no') return el._noBtn;
          return null;
        },
        remove: () => {
          const idx = appendedElements.indexOf(el);
          if (idx !== -1) appendedElements.splice(idx, 1);
        },
        _yesBtn: { onclick: null },
        _noBtn: { onclick: null },
      };
      return el;
    },
    body: {
      appendChild: (el) => {
        appendedElements.push(el);
      },
    },
  };

  const originalDoc = globalThis.document;
  globalThis.document = fakeDoc;

  try {
    let accepted = false;
    let declined = false;

    // Caso 1: Aceptar
    const modal1 = showVoicePrompt(() => { accepted = true; }, () => { declined = true; });
    assert.ok(modal1, 'Debe crear modal');
    assert.equal(appendedElements.length, 1);

    // No debe duplicar si ya existe
    const modalDup = showVoicePrompt(() => {}, () => {});
    assert.equal(modalDup, modal1);

    modal1._yesBtn.onclick();
    assert.equal(accepted, true);
    assert.equal(declined, false);
    assert.equal(appendedElements.length, 0, 'modal debe ser removido al aceptar');

    // Caso 2: Rechazar
    accepted = false;
    declined = false;
    const modal2 = showVoicePrompt(() => { accepted = true; }, () => { declined = true; });
    assert.equal(appendedElements.length, 1);
    modal2._noBtn.onclick();
    assert.equal(accepted, false);
    assert.equal(declined, true);
    assert.equal(appendedElements.length, 0, 'modal debe ser removido al rechazar');
  } finally {
    globalThis.document = originalDoc;
  }
});
