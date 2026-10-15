import test from 'node:test';
import assert from 'node:assert/strict';
import { identityModule } from '../test-support/identity-harness.js';
import { deferred } from '../test-support/clock.js';

async function reporter({ enabled = true, session = { user: { id: 'owner' } }, insert, getSession } = {}) {
  const calls = [], listeners = new Map(), removed = [];
  const client = {
    auth: { async getSession() { calls.push(['session']); return getSession ? getSession() : { data: { session } }; } },
    from(table) { assert.equal(table, 'client_error_reports'); return {
      async insert(value) { calls.push(['insert', value]); return insert ? insert(value) : {}; },
    }; },
  };
  const loaded = await identityModule('src/error-reporting.js', { client, enabled, globals: {
    window: {
      location: { pathname: '/body' },
      addEventListener: (name, handler) => listeners.set(name, handler),
      removeEventListener: (name, handler) => { assert.equal(listeners.get(name), handler); removed.push(name); listeners.delete(name); },
    },
    navigator: { userAgent: 'synthetic-agent' },
  } });
  return { ...loaded, calls, listeners, removed };
}

test('identidad diagnosticos activacion deduplicacion y privacidad', async t => {
  await t.test('deshabilitado no consulta sesión ni inserta', async () => {
    const { subject, calls } = await reporter({ enabled: false });
    await subject.reportClientError('kind', new Error('synthetic'));
    assert.deepEqual(calls, []);
  });
  await t.test('sin sesión consume fingerprint y no reintenta el duplicado', async () => {
    const { subject, calls } = await reporter({ session: null });
    const error = new Error('same');
    await subject.reportClientError('kind', error);
    await subject.reportClientError('kind', error);
    assert.deepEqual(calls, [['session']]);
  });
  await t.test('sanitiza payload y no envía user_id desde cliente', async () => {
    const { subject, calls } = await reporter();
    const error = new Error('contact synthetic@example.com token abcdef0123456789abcdef0123456789ab https://example.invalid/a?secret=value');
    await subject.reportClientError('kind'.repeat(20), error, { componentStack: 'synthetic@example.com '.repeat(400) });
    const payload = calls.find(value => value[0] === 'insert')[1];
    assert.equal(payload.kind.length, 40);
    assert.ok(payload.message.length <= 500);
    assert.ok(payload.stack.length <= 4000);
    assert.ok(payload.component_stack.length <= 4000);
    assert.equal(payload.path, '/body');
    assert.equal(payload.user_agent, 'synthetic-agent');
    assert.equal(payload.release, 'test-release');
    assert.equal(Object.hasOwn(payload, 'user_id'), false);
    const serialized = JSON.stringify(payload);
    for (const secret of ['synthetic@example.com', 'abcdef0123456789abcdef0123456789ab', 'secret=value']) assert.equal(serialized.includes(secret), false);
  });
  await t.test('máximo diez reportes por instancia incluso si fallan', async () => {
    const { subject, calls, errors } = await reporter({ insert: () => ({ error: new Error('offline') }) });
    for (let i = 0; i < 12; i++) await subject.reportClientError(`unique-${i}`, `failure-${i}`);
    assert.equal(calls.filter(value => value[0] === 'insert').length, 10);
    assert.deepEqual(errors, []); // AS-IS KD-004; no equivale a una política deseada.
  });
  await t.test('fallos de sesión e inserción se absorben sin recursión', async () => {
    for (const options of [
      { getSession: () => { throw new Error('session'); } },
      { insert: () => { throw new Error('insert'); } },
      { insert: () => ({ error: new Error('returned') }) },
    ]) {
      const { subject, errors } = await reporter(options);
      await assert.doesNotReject(subject.reportClientError('kind', 'failure'));
      assert.deepEqual(errors, []);
    }
  });
  await t.test('solo inserción tiene plazo de 5000 ms y no cancela remoto', async () => {
    const gate = deferred();
    const { subject, clock, calls } = await reporter({ insert: () => gate.promise });
    let done = false;
    const pending = subject.reportClientError('kind', 'failure').then(() => { done = true; });
    // La consulta de sesión debe terminar antes de comenzar el plazo de inserción.
    for (let i = 0; i < 24; i++) await Promise.resolve();
    assert.equal(calls.filter(value => value[0] === 'insert').length, 1);
    await clock.advance(4999); assert.equal(done, false);
    await clock.advance(1); await pending; assert.equal(done, true);
    gate.resolve({}); await gate.promise;
    const sessionGate = deferred();
    const other = await reporter({ getSession: () => sessionGate.promise });
    let sessionDone = false;
    const waiting = other.subject.reportClientError('kind', 'failure').then(() => { sessionDone = true; });
    await other.clock.advance(10000); assert.equal(sessionDone, false);
    sessionGate.resolve({ data: { session: null } }); await waiting;
  });
  await t.test('instalación conecta eventos y cleanup retira los mismos handlers', async () => {
    const { subject, calls, listeners, removed } = await reporter();
    const cleanup = subject.installGlobalErrorReporting();
    await listeners.get('error')({ message: 'window message' });
    await listeners.get('unhandledrejection')({ reason: 'rejection reason' });
    assert.deepEqual(calls.filter(value => value[0] === 'insert').map(value => value[1].kind), ['window_error', 'unhandled_rejection']);
    cleanup();
    assert.deepEqual(removed, ['error', 'unhandledrejection']);
    assert.equal(listeners.size, 0);
  });
});
