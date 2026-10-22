import {approvedSavePinHash} from '../scripts/save-state-evidence.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { build, transform } from 'esbuild';

const pureModules = ['training-metrics', 'training-advice', 'training-plan', 'training-records', 'training-routines', 'training-config', 'date-utils'];
const browserGlobals = /\b(?:window|document|localStorage|sessionStorage|navigator|fetch|XMLHttpRequest|WebSocket)\b/;

async function graph(contents) {
  const result = await build({
    stdin: { contents, resolveDir: resolve('.'), sourcefile: 'architecture-fixture.js' },
    bundle: true, write: false, metafile: true, format: 'esm', platform: 'browser',
    define: { 'import.meta.env': '{}', 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
  });
  return result.metafile.inputs;
}

async function assertPureGraph(contents) {
  const inputs = await graph(contents);
  for (const file of Object.keys(inputs)) {
    if (file === '<define:import.meta.env>') continue; // literal {} añadido por esbuild
    assert.doesNotMatch(file, /node_modules|supabase|FitTrack|app-utils|\.jsx$/, `dependencia impura: ${file}`);
    const source = file === 'architecture-fixture.js' ? contents : await readFile(file, 'utf8');
    const { code } = await transform(source, { minifyWhitespace: true, legalComments: 'none' });
    assert.doesNotMatch(code, browserGlobals, `API de navegador en ${file}`);
  }
}

test('entrenamiento capas puras y coordinacion sin ciclos', async () => {
  for (const name of pureModules) await assertPureGraph(`export * from './src/${name}.js';`);
  const hookInputs = await graph("export * from './src/use-training-timer.js';");
  for (const file of Object.keys(hookInputs)) {
    if (file === '<define:import.meta.env>') continue;
    assert.doesNotMatch(file, /supabase|data-sync|FitTrack|app-utils|react-dom/);
    if (!file.includes('node_modules')) {
      const source = file === 'architecture-fixture.js' ? '' : await readFile(file, 'utf8');
      assert.doesNotMatch(source, browserGlobals);
    }
  }
  const screenInputs = await graph("export { Train } from './src/TrainingScreen.jsx';");
  assert.ok(Object.keys(screenInputs).some(file => file.endsWith('SessionScreen.jsx')));
  assert.ok(!Object.keys(screenInputs).some(file => file.endsWith('FitTrack.jsx')), 'TrainingScreen depende transitivamente de FitTrack');
  assert.doesNotMatch(await readFile('src/TrainingScreen.jsx', 'utf8'), /from ["']\.\/supabase\.js["']/);
});

test('entrenamiento arquitectura detecta React DOM y cliente transitivos', async () => {
  await assert.rejects(assertPureGraph("export { useState } from 'react';"), /dependencia impura/);
  await assert.rejects(assertPureGraph('export const read = () => document.title;'), /API de navegador/);
  await assert.rejects(assertPureGraph("export { readThemePref } from './src/app-utils.js';"), /dependencia impura/);
  await assert.rejects(assertPureGraph("export { supabase } from './src/supabase.js';"), /dependencia impura/);
});

test('entrenamiento conserva los pins fijados antes de extraer', async () => {
  const base = JSON.parse(await readFile('specs/003-entrenamiento/evidence/baseline.json', 'utf8'));
  for (const pin of [...base.pins, ...base.previousPinsVerified]) {
    const source = (await readFile(pin.file, 'utf8')).replaceAll('\r\n', '\n');
    assert.equal(createHash('sha256').update(source).digest('hex'),approvedSavePinHash(pin.file,pin.sha256),pin.file);
  }
});
