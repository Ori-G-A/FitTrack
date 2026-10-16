import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRlsEvidence, RLS_TEST_NAMES } from '../scripts/rls-evidence.js';

const hashes = { 'synthetic-policy.sql': 'hash' };
const valid = () => ({
  generatedAt: new Date().toISOString(), passed: true, cleanupPassed: true, cliVersion: '2.121.0', node: process.version,
  environment: 'fittrack-sdd-disposable', apiOrigin: 'http://127.0.0.1:59321', hashes,
  results: RLS_TEST_NAMES.map(name => ({ name, status: 'passed' })),
});
test('RLS evidencia acepta solo resultados reales completos del contrato esperado', () => {
  const report = valid();
  assert.deepEqual(validateRlsEvidence(report, hashes), report.results);
});
test('RLS evidencia rechaza obsolescencia omission duplicados y limpieza fallida', () => {
  for (const change of [
    { passed: false }, { cleanupPassed: false }, { cliVersion: 'other' }, { node: 'other' }, { generatedAt: 'invalid' },
    { apiOrigin: 'http://remote.invalid:59321' }, { hashes: {} }, { hashes: { 'synthetic-policy.sql': 'changed' } },
    { results: [] }, { results: [valid().results[0], valid().results[0], valid().results[2]] },
    { results: valid().results.map((result, i) => i === 0 ? { ...result, status: 'skipped' } : result) },
  ]) assert.throws(() => validateRlsEvidence({ ...valid(), ...change }, hashes));
});
