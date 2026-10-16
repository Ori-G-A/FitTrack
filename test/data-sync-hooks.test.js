import test from 'node:test';
import assert from 'node:assert/strict';
import { mountApp, waitFor } from '../test-support/app-dom.js';

test('datos debounce y suscripciones', async () => {
  const app = await mountApp({}, { hook: true });
  try {
    const render = async props => { app.w.__sddRenderHook(props); await new Promise(r => setTimeout(r, 20)); };
    const props = { userId: 'sdd-user-001', keyName: 'x', value: 1, enabled: true };
    const events = []; const off = app.w.__sddSync.onSaveStatus(e => events.push(e.status));
    assert.equal(events.length, 0);
    await render(props); await app.clock.advance(599); assert.equal(app.fixture.writes.length, 0);
    await render({ ...props, value: 2 }); await app.clock.advance(599); assert.equal(app.fixture.writes.length, 0);
    await app.clock.advance(1); await waitFor(() => app.fixture.writes.length === 1);
    assert.equal(app.fixture.writes[0].payload.value, 2);
    await render({ ...props, enabled: false }); await app.clock.advance(600); assert.equal(app.fixture.writes.length, 1);
    await render({ ...props, userId: null }); await app.clock.advance(600); assert.equal(app.fixture.writes.length, 1);
    await render({ ...props, delay: 123 }); await app.clock.advance(122); assert.equal(app.fixture.writes.length, 1);
    await app.clock.advance(1); await waitFor(() => app.fixture.writes.length === 2);
    off(); const count = events.length;
    await render({ ...props, value: 3 }); app.w.__sddUnmount();
    await app.clock.advance(600); assert.equal(app.fixture.writes.length, 2);
    await app.w.__sddSync.saveKey('sdd-user-001', 'other', []);
    assert.equal(events.length, count);
    app.w.__sddUnmount = null;
  } finally { app.close(); }
});
