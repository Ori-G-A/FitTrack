import test from 'node:test';
import assert from 'node:assert/strict';
import { identityModule } from '../test-support/identity-harness.js';
import { deferred, settle } from '../test-support/clock.js';

async function load({ enabled = true, session = { user: { id: 'owner' } }, insert = async () => ({}), getSession, logger } = {}) {
  let inserts = 0;
  const client = {
    auth: { getSession: getSession || (async () => ({ data: { session } })) },
    from: () => ({ insert: value => { inserts++; return insert(value); } }),
  };
  const module = await identityModule('src/error-reporting.js', { client, enabled, globals: {
    window: { location: { pathname: '/synthetic' } }, navigator: { userAgent: 'synthetic-agent' },
    ...(logger ? { console: logger } : {}),
  } });
  return { ...module, get inserts() { return inserts; } };
}

function safeFallback(warnings) {
  assert.equal(warnings.length, 1, 'FR-013: falta diagnóstico local de degradación');
  assert.ok(warnings[0].every(value => typeof value === 'string'));
  const text = warnings[0].join(' ');
  assert.ok(text.length > 0 && text.length <= 160);
  for (const secret of ['private-synthetic-key', 'synthetic@example.test', 'session-secret', 'insert-secret', 'remote-stack', 'token=value']) assert.equal(text.includes(secret), false);
}

test('identidad CHANGE reporting degradado sin filtrar datos', async t => {
  await t.test('fallos de sesión e insert dejan mensaje fijo sin datos externos', async () => {
    const remote = new Error('private-synthetic-key synthetic@example.test https://invalid.test?token=value remote-stack');
    let expected;
    for (const options of [
      { insert: async () => ({ error: remote }) },
      { insert: async () => { throw remote; } },
      { getSession: async () => { throw new Error('session-secret'); } },
    ]) {
      const module = await load(options);
      await assert.doesNotReject(module.subject.reportClientError('kind', new Error('insert-secret')));
      safeFallback(module.warnings);
      const text = JSON.stringify(module.warnings);
      if (expected) assert.equal(text, expected); else expected = text;
    }
  });
  await t.test('timeout de inserción informa a 5000 ms sin reintentar', async () => {
    const gate = deferred(); const module = await load({ insert: () => gate.promise });
    const pending = module.subject.reportClientError('kind', 'synthetic');
    await settle(); await module.clock.advance(4999);
    assert.equal(module.warnings.length, 0);
    await module.clock.advance(1); await pending;
    safeFallback(module.warnings); assert.equal(module.inserts, 1);
    gate.resolve({});
  });
  await t.test('logger fallido no rechaza ni provoca otro envío', async () => {
    let logs = 0;
    const module = await load({ insert: async () => ({ error: new Error('remote') }), logger: {
      warn() { logs++; throw new Error('logger failure'); }, error() { throw new Error('No imprimir error crudo'); },
    } });
    await assert.doesNotReject(module.subject.reportClientError('kind', 'synthetic'));
    assert.equal(logs, 1); assert.equal(module.inserts, 1);
  });
  await t.test('flag apagado sesión ausente y duplicado no añaden degradación', async () => {
    for (const options of [{ enabled: false }, { session: null }]) {
      const module = await load(options);
      await module.subject.reportClientError('kind', 'synthetic');
      assert.equal(module.warnings.length, 0); assert.equal(module.inserts, 0);
    }
    const module = await load();
    await module.subject.reportClientError('kind', 'synthetic');
    await module.subject.reportClientError('kind', 'synthetic');
    assert.equal(module.warnings.length, 0); assert.equal(module.inserts, 1);
  });
});
