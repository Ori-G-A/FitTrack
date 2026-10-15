import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { verifyTrace } from './sdd-trace.js';

const require = createRequire(import.meta.url);
const manifestPackage = JSON.parse(readFileSync('package.json', 'utf8'));
if (readFileSync('.node-version', 'utf8').trim() !== manifestPackage.devEngines.runtime.version) {
  throw new Error('El espejo .node-version no coincide con el runtime propietario en package.json');
}
mkdirSync('test-results', { recursive: true });
function run(args, output) {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  writeFileSync(output, result.stdout || '');
  if (result.error || result.status !== 0) {
    process.stderr.write(result.stderr || '');
    process.stderr.write(result.stdout || '');
    throw result.error || new Error(`Checkpoint falló (${result.status}): ${args.join(' ')}`);
  }
  return result.stdout;
}
const tap = run(['--test', '--test-isolation=none', '--test-reporter=tap'], 'test-results/sdd-pilot.tap');
const browserJson = run([require.resolve('@playwright/test/cli'), 'test', '--reporter=json'], 'test-results/sdd-browser.json');
const results = [...tap.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map((match) => {
  const skipped = / # (SKIP|TODO)/.test(match[2]);
  return { name: match[2].replace(/ # (SKIP|TODO).*$/, ''), status: skipped ? 'skipped' : match[1] === 'ok' ? 'passed' : 'failed' };
});
function collect(suites) {
  for (const suite of suites) {
    for (const spec of suite.specs || []) for (const test of spec.tests) {
      results.push({ name: spec.title, status: test.results.length === 1 ? test.results[0].status : 'retried' });
    }
    collect(suite.suites || []);
  }
}
collect(JSON.parse(browserJson).suites);
const spec = readFileSync('specs/001-datos/spec.md', 'utf8');
const ids = [...spec.matchAll(/^- (FR-\d+) \[AS-IS\]|^- (US\d-AS\d+):/gm)].map((m) => m[1] || m[2]);
const manifest = JSON.parse(readFileSync('specs/001-datos/traceability.json', 'utf8'));
const srcFiles = spawnSync('git', ['ls-files', 'src'], { encoding: 'utf8' }).stdout.trim().split(/\r?\n/);
const sourceHash = createHash('sha256');
for (const file of srcFiles) sourceHash.update(file).update(readFileSync(file));
const report = verifyTrace(manifest, ids, results, { complete: process.argv.includes('--complete') });
writeFileSync('test-results/sdd-evidence.json', JSON.stringify({ generatedAt: new Date().toISOString(), node: process.version, sourceHash: sourceHash.digest('hex'), results, ...report }, null, 2));
console.log(`${results.length} pruebas ejecutadas; trazabilidad: ${JSON.stringify(report.counts)}`);
if (report.errors.length) { console.error(report.errors.join('\n')); process.exitCode = 1; }
else console.log(process.argv.includes('--complete') ? 'Contrato completo: todas las filas tienen pruebas ejecutadas y aprobadas; revisar aserciones y puertas de gobierno.' : 'Evidencia válida; consultar estados del manifiesto y puertas de gobierno.');
