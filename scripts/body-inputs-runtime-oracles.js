import assert from 'node:assert/strict';

// Los manifiestos históricos pueden guardar «archivo :: nombre» en plannedTests;
// tests contiene los nombres ya verificados que realmente descubre el runner.
export function runtimeOracles(row, candidate = false) {
  const names = candidate ? row.plannedTests : row.tests;
  assert(Array.isArray(names) && names.length, 'Sin oráculo de ejecución: ' + row.id);
  assert(names.every(name => typeof name === 'string' && name.length));
  return names;
}

export function missingMutationOracles(names, ordinary, allowed) {
  const missing = names.filter(name => !ordinary.has(name));
  assert(missing.every(name => allowed.includes(name)), 'Falta oráculo ordinario: ' + missing.join(', '));
  return missing;
}
