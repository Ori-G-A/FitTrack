import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { verifyTrace } from './sdd-trace.js';
import { verifyDeleteTrace, verifyDeletePins } from './delete-state-evidence.js';
import {verifyClockTrace,verifyClockPins,verificationHash,validateClockMutationEvidence} from './clock-state-evidence.js';
import { selectSpec, contractIds } from './sdd-contract.js';
import { currentRlsHashes, validateRlsEvidence } from './rls-evidence.js';

const require = createRequire(import.meta.url);
const selectedSpec = selectSpec(process.argv.slice(2));
const outputPrefix = selectedSpec === '001-datos' ? 'test-results/sdd' : `test-results/sdd-${selectedSpec}`;
const manifestPackage = JSON.parse(readFileSync('package.json', 'utf8'));
if (readFileSync('.node-version', 'utf8').trim() !== manifestPackage.devEngines.runtime.version) {
  throw new Error('El espejo .node-version no coincide con el runtime propietario en package.json');
}
mkdirSync('test-results', { recursive: true });
const verificationBefore = verificationHash();
function run(args, output) {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  writeFileSync(output, result.stdout || '');
  if (result.error || result.status !== 0) {
    process.stderr.write(result.stderr || '');
    // El JSON completo queda en el archivo; el diff de Git adjunto por
    // Playwright puede ocultar el error al truncarse el log remoto.
    if (output.endsWith('-browser.json')) {
      try {
        const report = JSON.parse(result.stdout);
        const failures = [];
        function inspect(suites) {
          for (const suite of suites || []) {
            for (const spec of suite.specs || []) for (const test of spec.tests || []) {
              for (const attempt of test.results || []) if (attempt.status !== 'passed') {
                failures.push({ title: spec.title, status: attempt.status, errors: attempt.errors });
              }
            }
            inspect(suite.suites);
          }
        }
        inspect(report.suites);
        process.stderr.write(JSON.stringify({ errors: report.errors, failures }, null, 2) + '\n');
      } catch {
        process.stderr.write(result.stdout || '');
      }
    } else process.stderr.write(result.stdout || '');
    throw result.error || new Error(`Checkpoint falló (${result.status}): ${args.join(' ')}`);
  }
  return result.stdout;
}
const tap = run(['--test', '--test-isolation=none', '--test-reporter=tap'], `${outputPrefix}-pilot.tap`);
const browserJson = run([require.resolve('@playwright/test/cli'), 'test', '--reporter=json'], `${outputPrefix}-browser.json`);
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
if(selectedSpec==='009-reloj-pruebas'&&process.argv.includes('--complete')){
 results.push(...validateClockMutationEvidence(JSON.parse(readFileSync('test-results/clock009-mutations.json')),verificationBefore));
}
if (selectedSpec === '002-identidad-fotos' && existsSync('test-results/rls-evidence.json')) {
  const rls = JSON.parse(readFileSync('test-results/rls-evidence.json', 'utf8'));
  results.push(...validateRlsEvidence(rls, currentRlsHashes()));
}
const spec = readFileSync(`specs/${selectedSpec}/spec.md`, 'utf8');
const ids = contractIds(spec);
const manifest = JSON.parse(readFileSync(`specs/${selectedSpec}/traceability.json`, 'utf8'));
if (manifest.spec !== selectedSpec) throw new Error('El manifiesto no corresponde a la spec seleccionada');
const srcFiles = spawnSync('git', ['ls-files', 'src'], { encoding: 'utf8' }).stdout.trim().split(/\r?\n/);
const sourceHash = createHash('sha256');
for (const file of srcFiles) sourceHash.update(file).update(readFileSync(file));
if (selectedSpec === '008-borrado-fiable') verifyDeletePins();
if(selectedSpec==='009-reloj-pruebas')verifyClockPins();
const verify = selectedSpec === '009-reloj-pruebas' ? verifyClockTrace : selectedSpec === '008-borrado-fiable' ? verifyDeleteTrace : verifyTrace;
const report = verify(manifest, ids, results, { complete: process.argv.includes('--complete') });
if (verificationHash() !== verificationBefore) throw new Error('El código de verificación cambió durante la ejecución');
writeFileSync(`${outputPrefix}-evidence.json`, JSON.stringify({ spec: selectedSpec, generatedAt: new Date().toISOString(), node: process.version, sourceHash: sourceHash.digest('hex'), verificationHash: verificationBefore, results, ...report }, null, 2));
console.log(`${results.length} pruebas ejecutadas; trazabilidad: ${JSON.stringify(report.counts)}`);
if (report.errors.length) { console.error(report.errors.join('\n')); process.exitCode = 1; }
else console.log(process.argv.includes('--complete') ? 'Contrato completo: todas las filas tienen pruebas ejecutadas y aprobadas; revisar aserciones y puertas de gobierno.' : 'Evidencia válida; consultar estados del manifiesto y puertas de gobierno.');
