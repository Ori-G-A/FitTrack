import { guessPrimaryMuscle } from "./fase1Config.js";

export function patchTrainingSession(prev, date, patch, uid) {
  const cur = prev.find((w) => w.date === date);
  const next = { ...(cur || { id: uid(), date, exercises: [], durationMin: 0, cardio: [] }), ...patch };
  const empty = next.exercises.length === 0 && !next.durationMin && (!next.cardio || next.cardio.length === 0);
  const others = prev.filter((w) => w.date !== date);
  return empty ? others : [...others, next];
}

export function createTrainingExercise(name, primary, secondary, uid) {
  return { id: uid(), name: name.trim(), primary, secondary: secondary.filter((m) => m !== primary), sets: [{ id: uid(), reps: "", kg: "", rpe: "" }] };
}

export function createTrainingExercises(list, uid) {
  return list.map((e) => ({
    id: uid(), name: e.name,
    primary: e.primary || guessPrimaryMuscle(e.name), secondary: e.secondary || [],
    targetRpe: e.targetRpe || "", targetReps: e.targetReps != null ? String(e.targetReps) : "", notes: e.notes || "",
    sets: Array.from({ length: Math.max(1, Number(e.targetSets) || 1) }, () => ({ id: uid(), reps: "", kg: "", rpe: "" })),
  }));
}

export function appendTrainingExercises(prev, date, newEx, addMin, uid) {
  const cur = prev.find((w) => w.date === date) || { id: uid(), date, exercises: [], durationMin: 0, cardio: [] };
  const next = { ...cur, exercises: [...cur.exercises, ...newEx], durationMin: (cur.durationMin || 0) + addMin };
  const others = prev.filter((w) => w.date !== date);
  return [...others, next];
}

export const editTrainingSet = (exercises, exId, sId, f, v) => exercises.map((e) => e.id !== exId ? e : { ...e, sets: e.sets.map((s) => s.id === sId ? { ...s, [f]: v } : s) });
export const addTrainingSet = (exercises, exId, uid) => exercises.map((e) => e.id !== exId ? e : { ...e, sets: [...e.sets, { id: uid(), reps: "", kg: "", rpe: "" }] });
export const deleteTrainingSet = (exercises, exId, sId) => exercises.map((e) => e.id !== exId ? e : { ...e, sets: e.sets.length > 1 ? e.sets.filter((s) => s.id !== sId) : e.sets });
export const deleteTrainingExercise = (exercises, exId) => exercises.filter((e) => e.id !== exId);
export const createTrainingCardio = (cardio, uid) => ({ id: uid(), type: cardio.type, minutes: Number(cardio.minutes), kcal: Number(cardio.kcal) || 0 });
export const deleteTrainingCardio = (cardioList, id) => cardioList.filter((c) => c.id !== id);

export const replaceExerciseSets = (exercises, index, nextSets) => exercises.map((e, i) => (i === index ? { ...e, sets: nextSets } : e));
export const registerTrainingSet = (sets, targetSetId, draft) => sets.map((s) => (s.id === targetSetId ? { ...s, reps: String(draft.reps), kg: draft.kg ? String(draft.kg) : "", rpe: draft.rpe } : s));

// Aplica un ajuste de sesion (quitar ejercicios y cambiar la carga de trabajo)
// sobre los ejercicios del dia. Regla dura: una serie ya registrada no se toca
// nunca; cambiarle el peso falsearia el historial de carga y de RPE, que es de
// donde salen la progresion, los records y el aviso de fatiga.
// `draft` es [{ id, kg, removed }].
export function applyAdjustments(exercises = [], draft = []) {
  const wanted = new Map(draft.map((d) => [d.id, d]));
  return exercises
    .filter((e) => !wanted.get(e.id)?.removed)
    .map((e) => {
      const target = wanted.get(e.id);
      if (!target) return e;
      const pending = (e.sets || []).some((s) => !(Number(s.reps) > 0));
      if (!pending) return e;
      return { ...e, sets: (e.sets || []).map((s) => (Number(s.reps) > 0 ? s : { ...s, kg: target.kg ? String(target.kg) : "" })) };
    });
}
