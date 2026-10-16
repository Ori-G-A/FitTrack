import test from 'node:test';
import assert from 'node:assert/strict';
import { connectLocalRlsFixture } from '../test-support/rls/fixture-client.js';

const context = {
  environment: 'fittrack-sdd-disposable', projectId: 'fittrack-sdd-rls-abcdef123456',
  nonce: '11111111-1111-1111-1111-111111111111', anonKey: 'synthetic-anon', serviceRoleKey: 'synthetic-admin',
  apiUrl: 'http://127.0.0.1:59321', databaseUrl: 'postgres://synthetic:synthetic@127.0.0.1:59322/postgres',
};
test('RLS fixture rechaza destino remoto antes de crear cualquier cliente', async () => {
  let calls = 0;
  await assert.rejects(connectLocalRlsFixture({ ...context, apiUrl: 'https://remote.invalid:59321' }, () => { calls++; }), /loopback/);
  assert.equal(calls, 0);
});
test('RLS fixture exige marcador antes de crear cliente privilegiado', async () => {
  for (const marker of [{ data: 'other' }, { error: new Error('unavailable') }]) {
    const keys = [];
    await assert.rejects(connectLocalRlsFixture(context, (_url, key) => { keys.push(key); return { rpc: async () => marker }; }), /no pertenece/);
    assert.deepEqual(keys, [context.anonKey]);
  }
  const keys = [];
  await connectLocalRlsFixture(context, (_url, key) => { keys.push(key); return { rpc: async () => ({ data: context.nonce }) }; });
  assert.deepEqual(keys, [context.anonKey, context.serviceRoleKey]);
});
