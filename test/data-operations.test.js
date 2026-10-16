import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModule } from '../test-support/module-harness.js';
import { deferred } from '../test-support/clock.js';

test('datos lectura y escritura por usuario y clave', async t => {
  await t.test('FR-001 FR-002 US1-AS1 filtros payload valores y errores', async () => {
    const { subject } = await loadModule('src/data-operations.js');
    const calls = []; let result = { data: null, error: null }, rejection;
    const client = { from(table) { calls.push(['from', table]); return {
      select(value) { calls.push(['select', value]); return this; },
      eq(key, value) { calls.push(['eq', key, value]); return this; },
      maybeSingle() { return rejection ? Promise.reject(rejection) : Promise.resolve(result); },
      upsert(payload, options) { calls.push(['upsert', payload, options]); return rejection ? Promise.reject(rejection) : Promise.resolve(result); },
    }; } };
    const fallback = [];
    for (const value of [0, false, '', [{ id: 1 }]]) {
      result = { data: { value }, error: null };
      assert.equal(await subject.loadAppDataKey(client, 'a', 'weights', fallback), value);
    }
    for (const data of [null, {}, { value: null }]) {
      result = { data, error: null };
      assert.equal(await subject.loadAppDataKey(client, 'b', 'goals', fallback), fallback);
    }
    assert.ok(calls.some(c => c[0] === 'eq' && c[1] === 'user_id' && c[2] === 'a'));
    assert.ok(calls.some(c => c[0] === 'eq' && c[1] === 'user_id' && c[2] === 'b'));
    assert.ok(calls.some(c => c[0] === 'eq' && c[1] === 'key' && c[2] === 'goals'));
    await subject.upsertAppDataKey(client, 'b', 'goals', fallback);
    const write = calls.find(c => c[0] === 'upsert');
    assert.deepEqual(JSON.parse(JSON.stringify(write.slice(1))), [{ user_id: 'b', key: 'goals', value: [] }, { onConflict: 'user_id,key' }]);
    assert.equal(write[1].value, fallback);
    assert.ok(calls.filter(c => c[0] === 'from').every(c => c[1] === 'app_data'));
    assert.ok(calls.filter(c => c[0] === 'select').every(c => c[1] === 'value'));
    for (const mode of ['returned', 'rejected']) {
      const error = new Error(mode);
      result = { error }; rejection = mode === 'rejected' ? error : undefined;
      await assert.rejects(subject.loadAppDataKey(client, 'a', 'x', []), e => e === error);
      await assert.rejects(subject.upsertAppDataKey(client, 'a', 'x', []), e => e === error);
    }
  });
  await t.test('FR-002 plazo exacto y operación remota no cancelada', async () => {
    for (const write of [false, true]) {
      const { subject, clock } = await loadModule('src/data-operations.js');
      const gate = deferred(); let remoteDone = false;
      const request = gate.promise.then(value => { remoteDone = true; return value; });
      const query = { select() { return this; }, eq() { return this; }, maybeSingle: () => request, upsert: () => request };
      const pending = write ? subject.upsertAppDataKey({ from: () => query }, 'a', 'x', []) : subject.loadAppDataKey({ from: () => query }, 'a', 'x', []);
      let done = false; pending.then(() => { done = true; }, () => { done = true; });
      const assertion = assert.rejects(pending, error => error.code === 'OPERATION_TIMEOUT');
      await clock.advance(14999); assert.equal(done, false);
      await clock.advance(1); await assertion;
      assert.equal(remoteDone, false);
      gate.resolve({ data: { value: [] }, error: null }); await request;
      assert.equal(remoteDone, true);
    }
  });
});
