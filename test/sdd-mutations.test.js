import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { build } from 'esbuild';

async function moduleUnderTest(file, client, replacement) {
  const source = await readFile(file, 'utf8');
  const moved = replacement && !source.includes(replacement[0]);
  const targetSource = moved ? await readFile('src/save-coordinator.js', 'utf8') : source;
  if (replacement && !targetSource.includes(replacement[0])) throw new Error('Mutación ya no aplicable');
  const result = await build({
    stdin: { contents: replacement && !moved ? source.replace(...replacement) : source, resolveDir: resolve('src'), sourcefile: file },
    bundle: true, write: false, format: 'iife', globalName: 'subject', platform: 'browser',
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name: 'fake-client', setup(builder) {
      if (moved) builder.onLoad({ filter: /save-coordinator\.js$/ }, () => ({ contents: targetSource.replace(...replacement), loader: 'js' }));
      builder.onResolve({ filter: /supabase\.js$/ }, () => ({ path: 'fake', namespace: 'sdd' }));
      builder.onLoad({ filter: /.*/, namespace: 'sdd' }, () => ({ contents: 'export const supabase = globalThis.client;' }));
    } }],
  });
  return vm.runInNewContext(`${result.outputFiles[0].text}\nsubject`, {
    client, setTimeout, clearTimeout, console: { error() {} },
  });
}

async function ownerContract(mutate) {
  const filters = [];
  const query = { select() { return this; }, eq(key, value) { filters.push([key, value]); return this; }, maybeSingle: async () => ({ data: null, error: null }) };
  const subject = await moduleUnderTest('src/data-operations.js', null,
    mutate ? ['.eq("user_id", userId)', ''] : null);
  await subject.loadAppDataKey({ from: () => query }, 'owner', 'weights', []);
  assert.ok(filters.some(([key, value]) => key === 'user_id' && value === 'owner'), 'Debe filtrar propietario');
}

async function orderContract(mutate) {
  let release;
  let started;
  const firstStarted = new Promise((resolve) => { started = resolve; });
  const gate = new Promise((resolve) => { release = resolve; });
  const writes = [];
  const client = { from: () => ({ upsert: async ({ value }) => {
    writes.push(value);
    if (value === 1) { started(); await gate; }
    return { error: null };
  } }) };
  const subject = await moduleUnderTest('src/data-sync.js', client,
    mutate ? ['const previous = saveQueues.get(queueKey) || Promise.resolve();', 'const previous = Promise.resolve();'] : null);
  const first = subject.saveKey('owner', 'weights', 1);
  await firstStarted;
  const second = subject.saveKey('owner', 'weights', 2);
  try {
    await Promise.resolve(); await Promise.resolve();
    assert.deepEqual(writes, [1], 'La segunda escritura debe esperar');
  } finally { release(); await Promise.all([first, second]); }
  assert.deepEqual(writes, [1, 2]);
}

test('SDD-MUT-002 detecta quitar aislamiento por usuario', async () => {
  await ownerContract(false);
  await assert.rejects(ownerContract(true), { code: 'ERR_ASSERTION', message: /Debe filtrar propietario/ });
});
test('SDD-MUT-003 detecta romper orden de escrituras', async () => {
  await orderContract(false);
  await assert.rejects(orderContract(true), { code: 'ERR_ASSERTION', message: /segunda escritura debe esperar/ });
});
