import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyTrace } from '../scripts/sdd-trace.js';

const manifest = { requirements: [{ id: 'FR-001', status: 'partial', tests: ['real'] }] };
test('trazabilidad rechaza prueba inexistente u omitida', () => {
  assert.match(verifyTrace(manifest, ['FR-001'], []).errors.join(), /ausente/);
  assert.match(verifyTrace(manifest, ['FR-001'], [{ name: 'real', status: 'skipped' }]).errors.join(), /no aprobada/);
});
test('trazabilidad completa no acepta evidencia parcial ni filas faltantes', () => {
  const results = [{ name: 'real', status: 'passed' }];
  assert.equal(verifyTrace(manifest, ['FR-001'], results).errors.length, 0);
  assert.match(verifyTrace(manifest, ['FR-001', 'FR-002'], results, { complete: true }).errors.join(), /incompleta.*sin fila/);
});
test('trazabilidad rechaza IDs duplicados y pruebas fallidas', () => {
  const duplicated = { requirements: [...manifest.requirements, ...manifest.requirements] };
  const errors = verifyTrace(duplicated, ['FR-001'], [{ name: 'real', status: 'failed' }]).errors.join();
  assert.match(errors, /duplicado/);
  assert.match(errors, /no aprobada/);
});
