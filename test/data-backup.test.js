import test from 'node:test';
import assert from 'node:assert/strict';
import { mountApp, plain, waitFor } from '../test-support/app-dom.js';
import { deferred } from '../test-support/clock.js';

test('datos exportacion completa o error', async t => {
  await t.test('FR-009 US2-AS1 copia de memoria con fotos sin esperar guardado', async () => {
    const app = await mountApp({ data: {
      weights: [{ date: '2026-10-15', kg: 60 }],
      photos: [{ id: 'p', date: '2026-10-15', storagePath: 'sdd-user-001/p.jpg' }],
    } });
    const gate = deferred(); let pending;
    try {
      await app.account();
      app.fixture.data.weights = [{ date: '2026-10-15', kg: 99 }];
      app.fixture.onWrite = () => gate.promise;
      pending = app.w.__sddSync.saveKey('sdd-user-001', 'weights', []);
      await app.button('Exportar copia ahora'); await waitFor(() => app.downloads.length);
      const backup = JSON.parse(await app.downloads[0].blob.text());
      assert.equal(Object.keys(backup).length, 12); assert.equal(backup.timer, undefined);
      assert.equal(backup.weights[0].kg, 60);
      assert.match(backup.photos[0].dataUrl, /^data:image\/jpeg;base64,/);
      assert.equal(backup.photos[0].signedUrl, undefined);
      assert.equal(app.downloads[0].name, 'fittrack-2026-10-15.json');
      await app.clock.advance(999); assert.equal(app.revoked.length, 0);
      await app.clock.advance(1); assert.deepEqual(app.revoked, ['blob:sdd']);
    } finally { gate.resolve({ error: null }); await pending; app.close(); }
  });
  await t.test('FR-009 foto fallida impide descarga parcial', async () => {
    const app = await mountApp({ failPhotoDownload: true, data: { photos: [{ id: 'p', date: '2026-10-15', storagePath: 'sdd-user-001/p.jpg' }] } });
    try {
      await app.account(); await app.button('Exportar copia ahora');
      await waitFor(() => app.alerts.length);
      assert.match(app.alerts[0], /foto/i); assert.equal(app.downloads.length, 0);
    } finally { app.close(); }
  });
});

test('datos importacion validacion y aplicacion parcial', async t => {
  await t.test('FR-010 US2-AS2 rechazos límite exacto cancelación y lectura', async () => {
    const app = await mountApp({ data: { weights: [{ date: '2026-10-15', kg: 60 }] } });
    try {
      await app.ready(); let confirmations = 0;
      app.w.confirm = () => { confirmations++; return false; };
      const input = await app.import(undefined); assert.equal(input.value, 'selected');
      const invalidDates = ['weights','nutrition','measurements','wellness','periods','menstrualLogs'].map(key => ({ [key]: [{ date: 'bad' }] }));
      for (const value of ['{', { weights: 'invalid' }, ...invalidDates, { other: [] }, { goals: null },
        { workouts: [{ date: '2026-10-15', exercises: [{ sets: null }] }] },
        { photos: [{ date: '2026-10-15', dataUrl: 'https://external.invalid/image' }] }]) {
        await app.import(value); assert.equal(confirmations, 0);
      }
      await app.import({ weights: [] }, 50 * 1024 * 1024 + 1);
      assert.equal(confirmations, 0); assert.match(app.alerts.at(-1), /50 MB/);
      await app.import({ weights: [] }, 50 * 1024 * 1024);
      assert.equal(confirmations, 1); assert.equal(app.current.state.weights[0].kg, 60);
      await app.import('{}', 100, true); assert.match(app.alerts.at(-1), /leer/i);
      app.w.confirm = () => true;
      await app.import({ weights: [], unknown: [1], goals: { kcalTarget: 1900 } });
      await waitFor(() => app.current.state.goals.kcalTarget === 1900);
      assert.deepEqual(plain(app.current.state.weights), []);
      assert.equal(app.current.state.goals.proteinTarget, 150);
      assert.equal(app.current.state.goals.unknown, undefined);
      assert.equal(app.current.state.timer, undefined);
    } finally { app.close(); }
  });
  await t.test('FR-010 aplicación previa a fotos conserva colecciones y foto fallida', async () => {
    const app = await mountApp({ data: { recipes: [{ name: 'conservar' }] } });
    const photo = deferred();
    try {
      await app.ready(); app.fixture.onStorage = kind => kind === 'uploadPhoto' ? photo.promise : undefined;
      const backup = { weights: [{ date: '2026-10-15', kg: 70 }],
        workouts: [{ date: '2026-10-15', exercises: [] }], foods: [{ name: 'Aceite de oliva' }],
        photos: [{ id: 'p', date: '2026-10-15', dataUrl: 'data:image/jpeg;base64,cGhvdG8=' }], goals: { kcalTarget: 1800 } };
      const importing = app.import(backup);
      await waitFor(() => app.current.state.weights[0]?.kg === 70);
      assert.notEqual(app.current.state.goals.kcalTarget, 1800);
      photo.resolve({ error: new Error('fallo foto') }); await importing;
      await waitFor(() => app.current.state.goals.kcalTarget === 1800);
      assert.equal(app.current.state.photos[0].dataUrl, backup.photos[0].dataUrl);
      assert.equal(app.current.state.foods[0].unit, 'ml');
      assert.equal(app.current.state.workouts[0].durationMin, 0);
      assert.equal(app.current.state.recipes[0].name, 'conservar');
    } finally { photo.resolve({ error: null }); app.close(); }
  });
});
