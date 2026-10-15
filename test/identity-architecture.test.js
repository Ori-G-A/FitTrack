import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

async function check(snippet) {
  const fixture = '__identity_layer_fixture__.js';
  const allowed = new Set(['src/photo-service.js', 'src/photo-operations.js', 'src/async-utils.js', 'src/date-utils.js', fixture]);
  const result = await build({
    ...(snippet ? { stdin: { contents: snippet, sourcefile: fixture, resolveDir: process.cwd() } } : { entryPoints: ['src/photo-service.js'] }),
    bundle: true, write: false, metafile: true, platform: 'browser', define: { 'import.meta.env.DEV': 'false' },
  });
  for (const input of Object.keys(result.metafile.inputs)) {
    const path = input.replaceAll('\\', '/');
    assert.ok(allowed.has(path), `Dependencia prohibida: ${path}`);
    const source = path === fixture ? snippet : await readFile(path, 'utf8');
    assert.doesNotMatch(source, /\b(?:document|window|localStorage)\s*(?:\.|\[)|\bnew\s+(?:Image|FileReader)\b/, `DOM prohibido: ${path}`);
  }
}

test('identidad capas de fotos sin React DOM ni cliente global', async () => {
  await check();
  await assert.rejects(check("import React from 'react'; export const bad = React;"), /Dependencia prohibida/);
  await assert.rejects(check('export const bad = () => document.title;'), /DOM prohibido/);
});
