import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isHotChannel, trackLink, safeForConn } from '../src/network/ChannelLinks.js';

describe('ChannelLinks - clasificación y agrupación de canales WebRTC', () => {
  it('detecta canal hot por reliable=false, dataChannel y label', () => {
    assert.equal(isHotChannel({ reliable: false, label: 'game-hot' }), true);
    assert.equal(isHotChannel({ reliable: true, label: 'game-safe' }), false);
    assert.equal(isHotChannel({ dataChannel: { ordered: false }, label: 'x' }), true);
    assert.equal(isHotChannel({ label: 'game-hot', metadata: {} }), true);
    assert.equal(isHotChannel({ label: 'game-safe', metadata: { channel: 'safe' } }), false);
  });

  it('agrupa safe+hot por peer y normaliza a safe', () => {
    const map = new Map();
    const safe = { peer: 'p1', label: 'game-safe', open: true };
    const hot = { peer: 'p1', label: 'game-hot', open: true };
    trackLink(map, safe, 'safe');
    trackLink(map, hot, 'hot');
    const link = map.get('p1');
    assert.equal(link.safe, safe);
    assert.equal(link.hot, hot);
    assert.equal(safeForConn(map, hot), safe);
    assert.equal(safeForConn(map, safe), safe);
    assert.equal(trackLink(map, null, 'safe'), null);
  });
});
