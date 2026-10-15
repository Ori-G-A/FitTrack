import test from 'node:test';
import assert from 'node:assert/strict';
import { selectSpec, contractIds } from '../scripts/sdd-contract.js';

test('SDD seleccion de spec mantiene default y rechaza rutas o argumentos ambiguos', () => {
  assert.equal(selectSpec([]), '001-datos');
  assert.equal(selectSpec(['--complete']), '001-datos');
  assert.equal(selectSpec(['--spec=002-identidad-fotos', '--complete']), '002-identidad-fotos');
  for (const args of [['--spec=../secret'], ['--spec=C:/secret'], ['--spec=002-a', '--spec=003-b'], ['--spec='], ['--unknown']]) assert.throws(() => selectSpec(args));
});

test('SDD contrato incluye CHANGE propuesto y escenarios de varios digitos sin duplicados', () => {
  assert.deepEqual(contractIds('- FR-001 [AS-IS] texto\n- FR-002 [CHANGE PROPUESTO, NO APROBADO] texto\n- FR-003 [CHANGE] texto\n- US12-AS10: escenario\n'), ['FR-001', 'FR-002', 'FR-003', 'US12-AS10']);
  assert.throws(() => contractIds('- FR-001 [AS-IS] x\n- FR-001 [CHANGE] y'), /repetidos/);
  assert.throws(() => contractIds('sin contrato'), /sin requisitos/);
});
