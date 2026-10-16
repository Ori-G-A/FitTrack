import test from 'node:test';
import assert from 'node:assert/strict';
import { mountApp, waitFor } from '../test-support/app-dom.js';
import { deferred } from '../test-support/clock.js';

function visible(app, state = 'visible') {
  Object.defineProperty(app.w.document, 'visibilityState', { configurable: true, value: state });
  app.w.document.dispatchEvent(new app.w.Event('visibilitychange'));
}

test('identidad fotos recuperacion visible intervalo y merge concurrente', async t => {
  await t.test('visible renueva sin restaurar foto eliminada mientras esperaba', async () => {
    const app = await mountApp({ data: { photos: [{ id: 'p', storagePath: 'sdd-user-001/p.jpg' }] } }, { captureIntervals: true });
    try {
      await app.ready();
      const gate = deferred(); let signs = 0;
      app.fixture.onStorage = async kind => { if (kind === 'signPhoto') { signs++; return gate.promise; } };
      visible(app);
      await waitFor(() => signs === 1, 'renovación');
      app.current.setters.setPhotos([]);
      await waitFor(() => app.current.state.photos.length === 0, 'eliminación concurrente');
      gate.resolve({ data: { signedUrl: 'synthetic:renewed' } });
      await new Promise(resolve => setTimeout(resolve, 20));
      assert.equal(app.current.state.photos.length, 0);
    } finally { app.close(); }
    assert.equal(app.intervals.size, 0);
  });
  await t.test('intervalo registrado a 12 horas renueva solo con documento visible', async () => {
    const app = await mountApp({ data: { photos: [{ id: 'p', storagePath: 'sdd-user-001/p.jpg' }] } }, { captureIntervals: true });
    try {
      await app.ready();
      await waitFor(() => app.intervals.size === 1, 'intervalo');
      const { callback, delay } = [...app.intervals.values()][0];
      assert.equal(delay, 43200000);
      let signs = 0;
      app.fixture.onStorage = async kind => { if (kind === 'signPhoto') { signs++; return { data: { signedUrl: 'synthetic:renewed' } }; } };
      visible(app, 'hidden'); await callback(); assert.equal(signs, 0);
      Object.defineProperty(app.w.document, 'visibilityState', { configurable: true, value: 'visible' });
      await callback();
      await waitFor(() => app.current.state.photos[0]?.signedUrl === 'synthetic:renewed', 'URL renovada');
      assert.equal(signs, 1);
    } finally { app.close(); }
    assert.equal(app.intervals.size, 0);
  });
  await t.test('visible reintenta carga fallida y sin fotos no firma', async () => {
    let failing = true;
    const app = await mountApp({ onRead: async () => failing ? { error: new Error('load failure') } : undefined }, { captureIntervals: true });
    try {
      await waitFor(() => app.current.state.loadError, 'carga fallida');
      failing = false; visible(app);
      await app.ready();
      assert.equal(app.current.state.loadError, false);
      const before = app.fixture.events.filter(value => value === 'signPhoto').length;
      visible(app);
      await new Promise(resolve => setTimeout(resolve, 20));
      assert.equal(app.fixture.events.filter(value => value === 'signPhoto').length, before);
    } finally { app.close(); }
  });
});
