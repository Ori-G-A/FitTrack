import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModule } from '../test-support/module-harness.js';
import { deferred, settle } from '../test-support/clock.js';
const clientFor = persist => ({ from: () => ({ upsert: persist }) });

test('datos cola orden concurrencia y referencia', async () => {
  const first = deferred(), calls = [];
  const { subject } = await loadModule('src/data-sync.js', clientFor(async payload => {
    calls.push(payload);
    return calls.length === 1 ? first.promise : { error: null };
  }));
  const a = subject.saveKey('a', 'x', 1); await settle();
  const value = { revision: 1 };
  const b = subject.saveKey('a', 'x', value);
  const c = subject.saveKey('a', 'y', 3);
  const d = subject.saveKey('b', 'x', 4); await settle();
  assert.deepEqual(calls.map(p => p.value), [1, 3, 4]);
  value.revision = 2; first.resolve({ error: { message: 'fallo previo' } });
  await Promise.all([a, b, c, d]);
  assert.equal(calls.at(-1).value, value); assert.equal(calls.at(-1).value.revision, 2);
  await subject.saveKey('a', 'x', 5); assert.equal(calls.at(-1).value, 5);
});

test('datos eventos y promesas de guardado', async () => {
  const a = deferred(), b = deferred(), c = deferred(), events = [];
  const { subject, errors } = await loadModule('src/data-sync.js', clientFor(payload => ({ a, b, c }[payload.key].promise)));
  subject.onSaveStatus(event => events.push(JSON.parse(JSON.stringify(event))));
  const pa = subject.saveKey('u', 'a', []), pb = subject.saveKey('u', 'b', []);
  await settle(); assert.deepEqual(events.map(e => e.status), ['saving', 'saving']);
  a.resolve({ error: { message: 'falló A' } }); await pa;
  assert.equal(events.length, 2);
  const pc = subject.saveKey('u', 'c', []); await settle();
  b.resolve({ error: null }); await pb; assert.equal(events.at(-1).status, 'saving');
  c.resolve({ error: null }); await pc;
  assert.deepEqual(events.at(-1), { status: 'saved', error: null });
  assert.equal(errors.length, 1);
  const isolated = await loadModule('src/data-sync.js', clientFor(async () => ({ error: {} })));
  let last; isolated.subject.onSaveStatus(event => { last = event; });
  await assert.doesNotReject(isolated.subject.saveKey('u', 'x', []));
  assert.equal(last.status, 'error'); assert.equal(last.error, 'Error al guardar');
  const serial = await loadModule('src/data-sync.js', clientFor(async () => ({ error: null })));
  const sequence = []; serial.subject.onSaveStatus(event => sequence.push(event.status));
  await Promise.all([serial.subject.saveKey('u', 'x', 1), serial.subject.saveKey('u', 'x', 2)]);
  assert.deepEqual(sequence, ['saving', 'saved', 'saving', 'saved']);
});

test('datos suspension y espera capturada', async () => {
  const gates = [deferred(), deferred(), deferred()], calls = [], events = [];
  const { subject } = await loadModule('src/data-sync.js', clientFor(payload => { calls.push(payload); return gates[payload.value].promise; }));
  subject.onSaveStatus(event => events.push(event.status));
  await subject.saveKey(null, 'x', 0);
  assert.deepEqual(events, ['error']); assert.equal(calls.length, 0);
  const first = subject.saveKey('a', 'x', 0); await settle();
  const snapshot = subject.waitForUserSaves('a'); let finished = false;
  snapshot.then(() => { finished = true; });
  const second = subject.saveKey('a', 'x', 1);
  const other = subject.saveKey('b', 'x', 2);
  await settle();
  subject.suspendUserSaves('a');
  const eventCount = events.length;
  await subject.saveKey('a', 'blocked', 2); assert.equal(events.length, eventCount);
  gates[0].resolve({ error: null }); await first; await settle(); await snapshot;
  assert.equal(finished, true); assert.ok(calls.some(p => p.user_id === 'a' && p.value === 1));
  gates[1].resolve({ error: null }); gates[2].resolve({ error: null }); await Promise.all([second, other]);
  subject.resumeUserSaves('a'); await subject.saveKey('a', 'x', 1);
  assert.equal(calls.at(-1).user_id, 'a');
  assert.equal((await subject.waitForUserSaves('none')).length, 0);
});
