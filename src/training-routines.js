export function minimalRoutineExercises(r, templates) {
  if (!r) return null;
  if (r.minimal && r.minimal.exercises) return r.minimal.exercises;
  const tpl = templates.find((t) => t.id === r.templateId || t.name === r.name);
  if (tpl && tpl.minimalVersion) return tpl.minimalVersion.exercises.map((e) => ({ name: e.name, targetSets: e.sets, targetReps: e.reps }));
  return null;
}

export function minimalRoutineMinutes(r, templates) {
  if (r && r.minimal && r.minimal.durationMin) return r.minimal.durationMin;
  const tpl = templates.find((t) => t.id === r.templateId || t.name === r.name);
  return tpl && tpl.minimalVersion ? tpl.minimalVersion.durationMin : null;
}

export const routineForDate = (routines, date) => routines.find((r) => r.suggestedDay != null && Number(r.suggestedDay) === new Date(`${date}T00:00:00`).getDay()) || null;
export const removeRoutineExercise = (prev, routineId, name) => prev.map((r) => (r.id === routineId
  ? { ...r, exercises: (r.exercises || []).filter((x) => x.name !== name) }
  : r));

export const trainingSessionRoutineItems = (exercises, uid) => exercises.map((e) => ({ id: uid(), name: e.name, primary: e.primary, secondary: e.secondary || [], targetSets: e.sets.length, targetReps: String(e.sets[0]?.reps || e.targetReps || ""), targetRpe: e.targetRpe || "" }));

export const saveTrainingRoutine = (current, open, data, uid) => open && open !== "nuevo"
  ? current.map((routine) => routine.id === open ? { ...routine, ...data } : routine)
  : [...current, { id: uid(), ...data }];

export function appendRoutineTemplates(current, templates, convert, uid) {
  const have = new Set(current.map((r) => r.name));
  return [...current, ...templates.filter((t) => !have.has(t.name)).map((t) => convert(t, uid))];
}
