// Diagnóstico de propuesta: ejecuta el código original con datos sintéticos.
// No es G-PIN ni modifica el producto, los contratos o los fixtures existentes.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {mountBody, plain} from '../../../test-support/body-dom.js';
import {sourceHash, digest} from '../../../scripts/save-state-evidence.js';

const files = ['src/BodyScreen.jsx', 'src/body-records.js', 'test/body-weight.test.js', 'test/body-measurements.test.js', 'test/body-wellness.test.js', 'test-support/body-build.js', 'test-support/body-dom.js', 'test-support/body-entry.jsx', 'scripts/clock-state-evidence.js'];
const before = {sourceHash: sourceHash(), files: files.map(file => ({file, sha256: digest(file)}))};
const cases = [];
const serializable = value => JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'number' && !Number.isFinite(item) ? {$nonFinite: String(item)} : item));
async function probe(name, section, act, collection, expected) {
  const h = await mountBody({section});
  try {
    h.w.__bodyEvents.length = 0;
    const observedInput = await act(h);
    const records = serializable(plain(h.state[collection]));
    assert.deepEqual(records.map(expected.select), expected.values, name);
    assert.deepEqual(h.errors, [], name + ': errores del instrumental');
    cases.push({name, section, collection, observedInput, records, events: plain(h.w.__bodyEvents), fixtureErrors: [...h.errors], expectationMatched: true});
  } finally { h.close(); }
}
await probe('peso negativo mediante entrada DOM y botón', 'peso', async h => {
  await h.input('input[inputmode="decimal"]', '-1');
  await h.button('Guardar pesaje');
  return {path: 'DOM', entered: '-1'};
}, 'weights', {select: r => r.kg, values: [-1]});
await probe('Infinity en peso mediante entrada DOM y botón', 'peso', async h => {
  await h.input('input[inputmode="decimal"]', 'Infinity');
  await h.button('Guardar pesaje');
  return {path: 'DOM', entered: 'Infinity'};
}, 'weights', {select: r => r.kg, values: [{$nonFinite: 'Infinity'}]});
await probe('coma decimal válida en peso como control positivo', 'peso', async h => {
  await h.input('input[inputmode="decimal"]', '65,4');
  await h.button('Guardar pesaje');
  return {path: 'DOM', entered: '65,4'};
}, 'weights', {select: r => r.kg, values: [65.4]});
await probe('medida negativa mediante entrada DOM y botón', 'medidas', async h => {
  await h.input('input[type="number"]', '-1');
  await h.call(() => h.w.document.querySelector('.ft-row button.ft-btn').click());
  return {path: 'DOM', entered: '-1'};
}, 'measurements', {select: r => r.cintura, values: [-1]});
await probe('coma en input number se pierde antes del guardado en JSDOM', 'medidas', async h => {
  await h.input('input[type="number"]', '72,5');
  const actual = h.w.document.querySelector('input[type="number"]').value;
  await h.call(h.b.addM);
  return {path: 'DOM de JSDOM; no certifica teclado de Chromium', entered: '72,5', actual};
}, 'measurements', {select: r => r.cintura, values: []});
await probe('medidas con coma y mezcla válida-inválida mediante borrador', 'medidas', async h => {
  await h.call(h.b.setMeas, {cintura: '72,5', cadera: '90', pecho: '', brazo: '', muslo: ''});
  await h.call(h.b.addM);
  return {path: 'setter de borrador y coordinador; no entrada de teclado', entered: {cintura: '72,5', cadera: '90'}};
}, 'measurements', {select: r => [r.cintura, r.cadera], values: [[{$nonFinite: 'NaN'}, 90]]});
await probe('sueño y pasos negativos mediante entradas DOM y botón', 'nota', async h => {
  await h.input('input[type="number"]', '-2');
  await h.input('input[type="number"][inputmode="numeric"][title*="reloj"]', '-5');
  await h.button('Guardar bienestar');
  return {path: 'DOM', entered: {sleep: '-2', steps: '-5'}};
}, 'wellness', {select: r => [r.sleep, r.steps], values: [[-2, -5]]});
await probe('pulso con coma mediante borrador', 'nota', async h => {
  await h.call(h.b.setWel, {sleep: '', restingHr: '60,5', steps: '', energy: 0, notes: '  control  '});
  await h.call(h.b.saveWel);
  return {path: 'setter de borrador y coordinador; no entrada de teclado', entered: {restingHr: '60,5'}};
}, 'wellness', {select: r => [r.restingHr, r.notes], values: [[{$nonFinite: 'NaN'}, 'control']]});
await probe('cero conocido de sueño y pasos como control positivo', 'nota', async h => {
  await h.input('input[type="number"]', '0');
  await h.input('input[type="number"][inputmode="numeric"][title*="reloj"]', '0');
  await h.button('Guardar bienestar');
  return {path: 'DOM', entered: {sleep: '0', steps: '0'}};
}, 'wellness', {select: r => [r.sleep, r.steps, r.restingHr], values: [[0, 0, null]]});
const after = {sourceHash: sourceHash(), files: files.map(file => ({file, sha256: digest(file)}))};
assert.deepEqual(after, before, 'El diagnóstico debe conservar fuente y archivos observados');
const report = {
  stage: 'survey; propuesta pendiente de aprobación; no G-PIN',
  generatedAt: new Date().toISOString(),
  runtime: process.version,
  baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(),
  command: 'pnpm exec node specs/010-entradas-cuerpo/evidence/survey-probe.mjs',
  isolation: 'React/JSDOM, datos sintéticos, red bloqueada por body-dom y Supabase sustituido por body-build',
  cases,
  nonFiniteEncoding: '{$nonFinite: string} evita que JSON convierta NaN/Infinity en null y oculte el diagnóstico',
  limits: ['No prueba teclado real ni todos los navegadores', 'No ejecuta persistencia, RLS ni producción', 'No acredita validación nueva ni cobertura contractual de 010'],
  before, after, unchanged: true,
};
writeFileSync(new URL('./survey.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({runtime: report.runtime, cases: cases.length, matched: cases.every(c => c.expectationMatched), unchanged: report.unchanged, sourceHash: before.sourceHash}));
