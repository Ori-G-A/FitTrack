import { build } from 'esbuild';
import vm from 'node:vm';
import { resolve } from 'node:path';
import { createClock } from './clock.js';

const bundles = new Map();
// Ejecuta módulos originales; solo sustituye cliente, entorno y E/S de frontera.
export async function identityModule(file, { client = {}, enabled = false, globals = {} } = {}) {
  const key = `${file}:${enabled}`;
  if (!bundles.has(key)) bundles.set(key, build({
    entryPoints: [resolve(file)], bundle: true, write: false, format: 'iife',
    globalName: 'subject', platform: 'browser',
    define: {
      'import.meta.env.DEV': 'false',
      'import.meta.env.VITE_ERROR_REPORTING_ENABLED': JSON.stringify(String(enabled)),
      'import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA': '"test-release"',
    },
    plugins: [{ name: 'isolated-identity-client', setup(builder) {
      builder.onResolve({ filter: /(?:^|\/)supabase\.js$/ }, () => ({ path: 'client', namespace: 'synthetic' }));
      builder.onLoad({ filter: /.*/, namespace: 'synthetic' }, () => ({ contents: 'export const supabase = globalThis.client;' }));
    } }],
  }).then(result => result.outputFiles[0].text));
  const clock = createClock(), errors = [];
  const subject = vm.runInNewContext(`${await bundles.get(key)}\nsubject`, {
    client, Blob, Error, Date, crypto: { randomUUID: () => 'generated-id' },
    setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
    fetch: () => { throw new Error('Red bloqueada en caracterización de identidad'); },
    console: { error: (...args) => errors.push(args) },
    ...globals,
  });
  return { subject, clock, errors };
}
