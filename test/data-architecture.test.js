import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const layers = ['src/data-operations.js', 'src/save-coordinator.js', 'src/app-data-lifecycle.js'];
async function checkLayers(snippet) {
  const result = await build({
    ...(snippet ? { stdin: { contents: snippet, sourcefile: '__architecture_fixture__.js', resolveDir: process.cwd() } } : { entryPoints: layers }),
    bundle: true, write: false, metafile: true, outdir: '_tmp_layers', platform: 'browser',
  });
  const allowed = new Set([...layers, 'src/async-utils.js', '__architecture_fixture__.js']);
  for (const input of Object.keys(result.metafile.inputs)) {
    const path = input.replaceAll('\\', '/');
    assert.ok(allowed.has(path), `Import prohibido en capa: ${path}`);
    const source = path === '__architecture_fixture__.js' ? snippet : await readFile(resolve(path), 'utf8');
    assert.doesNotMatch(source, /\b(?:document|window|localStorage)\s*(?:\.|\[)/, `DOM directo en capa: ${path}`);
  }
}
test('datos limites de dependencia', async () => {
  await checkLayers();
  await assert.rejects(checkLayers("import React from 'react'; export const bad = React;"), /Import prohibido/);
  await assert.rejects(checkLayers('export const bad = () => document.title;'), /DOM directo/);
});
