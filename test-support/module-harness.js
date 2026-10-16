import { build } from 'esbuild';
import vm from 'node:vm';
import { resolve } from 'node:path';
import { createClock } from './clock.js';

const bundles = new Map();
export async function loadModule(file, client = {}, clock = createClock()) {
  if (!bundles.has(file)) bundles.set(file, build({
    entryPoints: [resolve(file)], bundle: true, write: false, format: 'iife',
    globalName: 'subject', platform: 'browser', define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name: 'synthetic-client', setup(builder) {
      builder.onResolve({ filter: /(?:^|\/)supabase\.js$/ }, () => ({ path: 'client', namespace: 'test' }));
      builder.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export const supabase = globalThis.client;' }));
    } }],
  }).then(result => result.outputFiles[0].text));
  const errors = [];
  const subject = vm.runInNewContext(`${await bundles.get(file)}\nsubject`, {
    client, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
    console: { error: (...args) => errors.push(args) },
  });
  return { subject, clock, errors };
}
