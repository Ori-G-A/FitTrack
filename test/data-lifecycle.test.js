import test from 'node:test';
import assert from 'node:assert/strict';
import { mountApp, plain, waitFor } from '../test-support/app-dom.js';
import { deferred } from '../test-support/clock.js';

test('datos carga y descarte de resultados', async t => {
  await t.test('FR-007 US1-AS6 hidratación migraciones y fallos individuales', async () => {
    const photo = deferred();
    const app = await mountApp({ data: {
      workouts: [{ date: '2026-10-15', exercises: [{ name: 'Press', muscle: 'Pecho', sets: [] }] }],
      foods: [{ name: 'Aceite de oliva' }], photos: [{ id: 'p', date: '2026-10-15', storagePath: 'sdd-user-001/p.jpg' }],
    }, onStorage: kind => kind === 'signPhoto' ? photo.promise : undefined });
    try {
      await waitFor(() => app.fixture.events.includes('signPhoto'));
      assert.equal(app.current.state.loaded, false);
      assert.equal(new Set(app.fixture.reads.map(r => r.key)).size, 12);
      photo.resolve({ error: new Error('foto no disponible') }); await app.ready();
      assert.equal(app.current.state.photos[0].storagePath, 'sdd-user-001/p.jpg');
      assert.equal(app.current.state.workouts[0].durationMin, 0);
      assert.equal(app.current.state.workouts[0].exercises[0].primary, 'Pecho');
      assert.equal(app.current.state.foods[0].unit, 'ml');
      assert.deepEqual(plain(app.current.state.weights), []);
      assert.equal(app.current.state.goals.kcalTarget, 2200);
    } finally { app.close(); }
  });
  await t.test('FR-007 US1-AS6 error de carga no habilita escritura', async () => {
    const app = await mountApp({ onRead: ({ key }) => key === 'weights' ? { error: new Error('lectura fallida') } : undefined });
    try {
      await waitFor(() => app.current.state.loadError);
      assert.equal(app.current.state.loaded, false);
      await app.clock.advance(600); assert.equal(app.fixture.writes.length, 0);
    } finally { app.close(); }
  });
  await t.test('FR-007 US1-AS6 sesión anterior queda descartada tras cleanup', async () => {
    const old = deferred();
    const app = await mountApp({ onRead: ({ key, user_id }) => key === 'weights' && user_id === 'sdd-user-001' ? old.promise : undefined,
      data: { weights: [{ date: '2026-10-15', kg: 60 }] } });
    try {
      await waitFor(() => app.fixture.reads.length >= 12);
      app.fixture.emitSession({ id: 'new-user', email: 'new@example.test' });
      await app.ready(); assert.equal(app.current.state.weights[0].kg, 60);
      old.resolve({ data: { value: [{ date: '2026-10-15', kg: 99 }] }, error: null });
      await new Promise(r => setTimeout(r, 20));
      assert.equal(app.current.state.weights[0].kg, 60);
    } finally { app.close(); }
  });
});

test('datos claves sincronizadas y timer', async () => {
  const app = await mountApp({ data: { photos: [{ id: 'p', date: '2026-10-15', storagePath: 'sdd-user-001/p.jpg' }], timer: { running: false, baseSec: 7, startedAt: null } } });
  try {
    await app.ready(); assert.equal(app.fixture.writes.length, 0);
    await app.clock.advance(600); await waitFor(() => app.fixture.writes.length >= 12);
    assert.deepEqual([...new Set(app.fixture.writes.map(w => w.payload.key))].sort(), ['workouts','weights','nutrition','foods','recipes','routines','measurements','wellness','periods','menstrualLogs','photos','goals'].sort());
    const photos = app.fixture.writes.find(w => w.payload.key === 'photos').payload.value;
    assert.equal(Object.hasOwn(photos[0], 'signedUrl'), false);
    app.current.goTo('entrenar'); await waitFor(() => app.fixture.reads.some(r => r.key === 'timer'));
    await app.button('Reanudar'); await waitFor(() => app.fixture.writes.some(w => w.payload.key === 'timer'));
    const start = app.fixture.writes.filter(w => w.payload.key === 'timer').at(-1).payload.value;
    assert.equal(start.running, true); assert.equal(start.baseSec, 7); assert.equal(start.startedAt, app.w.Date.now());
    await app.button('Pausar'); await app.button('Reiniciar');
    const timerWrites = app.fixture.writes.filter(w => w.payload.key === 'timer');
    assert.deepEqual(timerWrites.at(-2).payload.value, { running: false, startedAt: null, baseSec: 7 });
    assert.deepEqual(timerWrites.at(-1).payload.value, { running: false, startedAt: null, baseSec: 0 });
  } finally { app.close(); }
});
