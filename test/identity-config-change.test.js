import test from 'node:test';
import assert from 'node:assert/strict';
import { configuredClient } from '../test-support/config-harness.js';

const valid = { VITE_SUPABASE_URL: 'https://synthetic.supabase.invalid', VITE_SUPABASE_ANON_KEY: 'synthetic-publishable-key' };
async function rejectsBeforeSdk(env, variable) {
  const calls = []; let failure;
  try { await configuredClient(env, (...args) => { calls.push(args); return {}; }); }
  catch (error) { failure = error; }
  assert.equal(calls.length, 0, 'FR-012: SDK invocado antes de validar configuración inválida');
  assert.ok(failure, 'FR-012: falta rechazo propio de configuración');
  assert.ok(failure.message.includes(variable));
  for (const value of Object.values(env)) if (value && String(value).trim()) assert.equal(failure.message.includes(value), false);
}

test('identidad CHANGE configuracion antes de crear cliente', async t => {
  await t.test('rechaza URL ausente vacía malformada o protocolo ajeno antes del SDK', async () => {
    for (const url of [undefined, '', '   ', 'invalid-url-synthetic-secret', 'ftp://synthetic.invalid', 'file:///synthetic', 'javascript:synthetic']) {
      await rejectsBeforeSdk({ ...valid, VITE_SUPABASE_URL: url }, 'VITE_SUPABASE_URL');
    }
  });
  await t.test('rechaza clave ausente o vacía sin exponer su valor', async () => {
    for (const key of [undefined, '', '   ']) await rejectsBeforeSdk({ ...valid, VITE_SUPABASE_ANON_KEY: key }, 'VITE_SUPABASE_ANON_KEY');
  });
  await t.test('configuración válida conserva argumentos originales y cliente exportado', async () => {
    for (const url of [valid.VITE_SUPABASE_URL, 'http://127.0.0.1:54321', '  https://synthetic.invalid/  ']) {
      const env = { ...valid, VITE_SUPABASE_URL: url }, calls = [], sentinel = {};
      const subject = await configuredClient(env, (...args) => { calls.push(args); return sentinel; });
      assert.equal(subject.supabase, sentinel);
      assert.deepEqual(calls, [[url, valid.VITE_SUPABASE_ANON_KEY]]);
    }
  });
});
