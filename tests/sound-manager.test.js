import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SoundManager } from '../src/audio/SoundManager.js';

test('SoundManager - Estado inicial, control de volumen y mute', () => {
  const sm = new SoundManager();
  assert.equal(sm.isMuted, false);

  sm.setVolume(0.8);
  assert.equal(sm._volume, 0.8);

  sm.setVolume(1.5); // Clamping a 1.0
  assert.equal(sm._volume, 1.0);

  sm.setVolume(-0.2); // Clamping a 0.0
  assert.equal(sm._volume, 0.0);

  const muted = sm.toggleMute();
  assert.equal(muted, true);
  assert.equal(sm.isMuted, true);

  sm.setMuted(false);
  assert.equal(sm.isMuted, false);
});

test('SoundManager - Pooling de GainNode y Channel Buses con Mock AudioContext', () => {
  let createdNodes = 0;
  class MockGainNode {
    constructor() {
      this.gain = {
        value: 1,
        setValueAtTime: (v) => { this.gain.value = v; },
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      };
      this.connectedTo = null;
      createdNodes++;
    }
    connect(target) {
      this.connectedTo = target;
    }
    disconnect() {
      this.connectedTo = null;
    }
  }

  class MockAudioBuffer {
    constructor(channels, length, sampleRate) {
      this.numberOfChannels = channels;
      this.length = length;
      this.sampleRate = sampleRate;
      this._data = new Float32Array(length);
    }
    getChannelData() {
      return this._data;
    }
  }

  class MockAudioContext {
    constructor() {
      this.sampleRate = 44100;
      this.currentTime = 0;
      this.state = 'running';
      this.destination = {};
    }
    createGain() {
      return new MockGainNode();
    }
    createBuffer(ch, len, rate) {
      return new MockAudioBuffer(ch, len, rate);
    }
    createBufferSource() {
      return {
        buffer: null,
        connect: () => {},
        start: () => {},
        stop: () => {},
      };
    }
    createOscillator() {
      return {
        type: 'sine',
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {},
        start: () => {},
        stop: () => {},
      };
    }
    resume() {
      return Promise.resolve();
    }
  }

  const origWindow = globalThis.window;
  globalThis.window = {
    AudioContext: MockAudioContext,
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  try {
    const sm = new SoundManager();
    sm._initContext();

    assert.ok(sm.ctx instanceof MockAudioContext);
    assert.ok(sm.masterGain, 'Master gain debe existir');
    assert.ok(sm.sfxGain, 'SFX channel gain debe existir');
    assert.ok(sm.uiGain, 'UI channel gain debe existir');
    assert.ok(sm.ambientGain, 'Ambient channel gain debe existir');

    // Comprobar que los buffers procedurales se pre-calcularon
    assert.ok(sm._clickBuffer, 'Click buffer debe estar pre-calculado');
    assert.ok(sm._jumpBuffer, 'Jump buffer debe estar pre-calculado');
    assert.ok(sm._keyPickupBuffer, 'Key pickup buffer debe estar pre-calculado');
    assert.ok(sm._caveImpulseBuffer, 'Cave impulse buffer debe estar pre-calculado');

    // Reproducción mediante buffer
    sm.playClick();
    sm.playJump();
    sm.playKeyPickup();

    // Comprobar pooling de GainNodes
    const countBefore = createdNodes;
    const g1 = sm._acquireGainNode();
    assert.ok(g1 instanceof MockGainNode);
    sm._releaseGainNode(g1, 0);

    // Timeout síncrono para verificar que se agrega al pool
    setTimeout(() => {
      assert.equal(sm._gainNodePool.length, 1);
      const recycled = sm._acquireGainNode();
      assert.equal(recycled, g1, 'Debe reutilizar el mismo GainNode del pool');
      assert.equal(createdNodes, countBefore + 1);
    }, 10);
  } finally {
    globalThis.window = origWindow;
  }
});
