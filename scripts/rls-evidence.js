import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { assertDisposableLocalRlsTarget } from './local-rls-guard.js';

export const RLS_TEST_NAMES = [
  'SDD-RLS-001 app_data dos propietarios y anonimo',
  'SDD-RLS-002 Storage privado permite solo prefijo propio',
  'SDD-RLS-003 diagnosticos insert-only sin suplantacion',
];
export function currentRlsHashes() {
  const files = ['rls-tests/ownership.js', 'scripts/run-local-rls.js', 'scripts/local-rls-guard.js', 'test-support/rls/fixture-client.js', 'pnpm-lock.yaml', ...readdirSync('supabase/migrations').filter(file => file.endsWith('.sql')).sort().map(file => `supabase/migrations/${file}`)];
  return Object.fromEntries(files.map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
}
export function validateRlsEvidence(evidence, expectedHashes, nodeVersion = process.version) {
  if (evidence.passed !== true || evidence.cleanupPassed !== true || evidence.cliVersion !== '2.121.0' || evidence.node !== nodeVersion || !Number.isFinite(Date.parse(evidence.generatedAt))) {
    throw new Error('Evidencia RLS incompleta o entorno no coincidente');
  }
  assertDisposableLocalRlsTarget({ environment: evidence.environment, apiUrl: evidence.apiOrigin, databaseUrl: 'postgresql://127.0.0.1:59322/postgres' });
  if (!evidence.hashes || Object.keys(evidence.hashes).length !== Object.keys(expectedHashes).length || Object.entries(expectedHashes).some(([file, hash]) => evidence.hashes[file] !== hash)) {
    throw new Error('Evidencia RLS obsoleta: políticas, runner, tests o dependencias cambiaron');
  }
  if (!Array.isArray(evidence.results) || evidence.results.length !== 3 || new Set(evidence.results.map(result => result.name)).size !== 3 || evidence.results.some(result => result.status !== 'passed' || !RLS_TEST_NAMES.includes(result.name))) {
    throw new Error('Resultados RLS ausentes, repetidos o no aprobados');
  }
  return evidence.results;
}
