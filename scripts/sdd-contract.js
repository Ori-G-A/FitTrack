export function selectSpec(args) {
  const selections = args.filter(value => value.startsWith('--spec='));
  if (selections.length > 1) throw new Error('Selecciona una sola spec');
  const spec = selections.length ? selections[0].slice('--spec='.length) : '001-datos';
  if (!/^\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(spec)) throw new Error('Nombre de spec inválido');
  for (const arg of args) if (arg !== '--complete' && !arg.startsWith('--spec=')) throw new Error(`Argumento desconocido: ${arg}`);
  return spec;
}

export function contractIds(source) {
  const ids = [...source.matchAll(/^- (FR-\d+) \[(?:AS-IS|CHANGE[^\]]*)\]|^- (US\d+-AS\d+):/gm)].map(match => match[1] || match[2]);
  if (ids.length === 0) throw new Error('Spec sin requisitos ni escenarios reconocidos');
  if (new Set(ids).size !== ids.length) throw new Error('IDs repetidos en la spec');
  return ids;
}
