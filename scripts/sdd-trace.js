export function verifyTrace(manifest, requirementIds, results, { complete = false } = {}) {
  const errors = [];
  const rows = new Map();
  const counts = { pending: 0, partial: 0, complete: 0 };
  for (const row of manifest.requirements) {
    if (rows.has(row.id)) errors.push(`ID duplicado: ${row.id}`);
    rows.set(row.id, row);
    if (!requirementIds.includes(row.id)) errors.push(`ID desconocido: ${row.id}`);
    if (!Object.hasOwn(counts, row.status)) errors.push(`Estado inválido: ${row.id}`);
    else counts[row.status]++;
    if (row.status !== 'pending' && !row.tests.length) errors.push(`Sin pruebas: ${row.id}`);
    for (const name of row.tests) {
      const matches = results.filter((result) => result.name === name);
      if (matches.length !== 1) errors.push(`Prueba ausente/duplicada: ${row.id} -> ${name}`);
      else if (matches[0].status !== 'passed') errors.push(`Prueba no aprobada: ${name} (${matches[0].status})`);
    }
    if (complete && row.status !== 'complete') errors.push(`Cobertura incompleta: ${row.id}`);
  }
  for (const id of requirementIds) if (!rows.has(id)) errors.push(`Requisito sin fila: ${id}`);
  return { errors, counts };
}
