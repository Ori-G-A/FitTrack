import test from 'node:test';
import assert from 'node:assert/strict';
import { mountApp, plain, waitFor } from '../test-support/app-dom.js';
import { deferred } from '../test-support/clock.js';

test('datos borrado orden y recuperacion', async t => {
  await t.test('FR-011 US3-AS1 sin usuario no produce efectos', async () => {
    const app = await mountApp({ user: null });
    try {
      await assert.rejects(app.current.actions.deleteAllData(), /sesión activa/);
      assert.deepEqual(plain(app.fixture.events), []);
    } finally { app.close(); }
  });
  await t.test('FR-011 US3-AS1 cola espera suspensión y orden', async () => {
    const app = await mountApp({ storageFiles: [{ name: 'a.jpg' }, { name: 'b.jpg' }] });
    const gate = deferred(); let saving;
    try {
      await app.account(); app.fixture.onWrite = () => gate.promise;
      saving = app.w.__sddSync.saveKey('sdd-user-001', 'pending', []);
      await waitFor(() => app.fixture.writes.length === 1);
      await app.button('Eliminar todos mis datos');
      await waitFor(() => !app.current.state.loaded);
      await app.w.__sddSync.saveKey('sdd-user-001', 'blocked', []);
      assert.equal(app.fixture.writes.length, 1); assert.equal(app.fixture.events.includes('listPhotos'), false);
      gate.resolve({ error: null }); await saving;
      await waitFor(() => app.fixture.events.includes('signOut'));
      assert.deepEqual(plain(app.fixture.events), ['write:pending', 'listPhotos', 'removePhotos', 'deleteData', 'signOut']);
      assert.deepEqual(plain(app.fixture.deletedFilter), ['user_id', 'sdd-user-001']);
    } finally { gate.resolve({ error: null }); await saving; app.close(); }
  });
  for (const stage of ['listPhotos', 'removePhotos', 'deleteData', 'signOut']) {
    await t.test(`FR-011 US3-AS2 excepción en ${stage}`, async () => {
      const error = new Error(`fallo ${stage}`);
      const app = await mountApp({ storageFiles: [{ name: 'a.jpg' }],
        onStorage: kind => { if (kind === stage) throw error; },
        onDelete: () => { if (stage === 'deleteData') return { error }; },
        onSignOut: () => { if (stage === 'signOut') throw error; },
      });
      try {
        await app.account();
        await assert.rejects(app.current.actions.deleteAllData(), caught => caught === error);
        await waitFor(() => !app.current.state.loaded);
        if (['deleteData', 'signOut'].includes(stage)) assert.equal(app.fixture.storageFiles.length, 0);
        await app.w.__sddSync.saveKey('sdd-user-001', 'probe', []);
        assert.equal(app.fixture.writes.some(write => write.payload.key === 'probe'), false);
        assert.equal(app.current.state.loaded, false);
      } finally { app.close(); }
    });
  }
  await t.test('FR-011 retorno error de signOut no dispara recuperación', async () => {
    const error = new Error('retorno, no rechazo');
    const app = await mountApp({ onSignOut: () => ({ error }) });
    try {
      await app.account();
      await assert.rejects(app.current.actions.deleteAllData(), caught => caught === error);
      await waitFor(() => app.fixture.events.includes('signOut'));
      await waitFor(() => !app.current.state.loaded);
      assert.equal(app.current.state.loaded, false);
      await app.w.__sddSync.saveKey('sdd-user-001', 'blocked', []);
      assert.equal(app.fixture.writes.length, 0);
    } finally { app.close(); }
  });
});
