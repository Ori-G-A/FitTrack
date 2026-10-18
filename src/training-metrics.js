import { localISO, addDays } from "./date-utils.js";

// Nombre canónico de ejercicio: une variantes que solo difieren por herramienta
// (goblet / barra / mancuerna / TRX…) pero conserva lo que sí distingue el
// movimiento (inclinado, rumano, femoral, lateral…).
// ponytail: strip-list, no diccionario de sinónimos. "Press banca" y "Press de
// pecho" NO se fusionan; añadir un alias map si hace falta.
const CANON_DROP = new Set([
  "con", "o", "y", "u", "en", "del", "la", "el", "los", "las",
  "barra", "mancuerna", "mancuernas", "goblet", "disco", "discos", "banda",
  "minibanda", "polea", "trx", "toalla", "kettlebell", "máquina", "maquina",
  "cable", "smith", "pesada", "pesado", "ligera", "ligero", "sentado",
  "sentada", "pie", "apoyada", "apoyado", "piso", "escalera", "banco",
]);
// Sinónimos del mismo movimiento (mismo nombre base tras quitar herramientas).
// ponytail: lista a mano; añade pares aquí cuando aparezcan.
const CANON_ALIAS = { "Press de pecho": "Press banca" }; // plano == banca; inclinado queda aparte
export function canonExercise(name) {
  const words = (name || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")     // quita paréntesis (herramientas/aclaraciones)
    .replace(/[\d./%]+/g, " ")    // quita números y unidades sueltas
    .split(/[\s,]+/)
    .filter((w) => w && !CANON_DROP.has(w));
  const s = words.join(" ").trim();
  const titled = s ? s.charAt(0).toUpperCase() + s.slice(1) : (name || "");
  return CANON_ALIAS[titled] || titled;
}

if (import.meta.env?.DEV) {
  console.assert(canonExercise("Sentadilla goblet (mancuerna o disco)") === "Sentadilla", "canon goblet");
  console.assert(canonExercise("Sentadilla con barra ligera o goblet pesada") === "Sentadilla", "canon barra");
  console.assert(canonExercise("Press de pecho con mancuernas (banco plano)") === "Press banca", "canon press de pecho == banca");
  console.assert(canonExercise("Press banca") === "Press banca", "canon banca");
  console.assert(canonExercise("Press inclinado con mancuernas") === "Press inclinado", "canon inclinado distinto");
  console.assert(canonExercise("Curl femoral con toalla") === "Curl femoral", "canon curl femoral");
}

// RPE a igual carga: para cada combinación (ejercicio canónico, kg, reps) con 3+
// sesiones con RPE registrado, compara el RPE medio de las últimas 3 sesiones.
// Subida sostenida >=1 punto = fatiga acumulada real (mejor señal de deload que
// el RPE medio global, que mezcla cargas distintas). Bajada sostenida >=1 punto
// terminando en RPE <=8 = adaptación: lista para subir carga o reps.
// fatigueCount cuenta en cuántos ejercicios DISTINTOS aparece la fatiga: 1 puede
// ser ese movimiento estancado; 2+ apunta a fatiga sistémica (semana de descarga).
// ponytail: fatigue/progress guardan la primera coincidencia, no un ranking; con
// el volumen de datos de una sola usuaria alcanza.
export function matchedLoadRpeTrend(workouts) {
  const byKey = {};
  workouts.forEach((w) => (w.exercises || []).forEach((e) => (e.sets || []).forEach((s) => {
    const kg = Number(s.kg) || 0, reps = Number(s.reps) || 0, rpe = parseFloat(s.rpe) || 0;
    if (kg <= 0 || reps <= 0 || rpe <= 0) return;
    const key = `${canonExercise(e.name)}|${kg}|${reps}`;
    const days = byKey[key] = byKey[key] || {};
    (days[w.date] = days[w.date] || []).push(rpe);
  })));
  const result = { fatigue: null, fatigueCount: 0, progress: null };
  const fatigued = new Set();
  Object.entries(byKey).forEach(([key, days]) => {
    const dates = Object.keys(days).sort();
    if (dates.length < 3) return;
    const [a, b, c] = dates.slice(-3).map((d) => days[d].reduce((sum, v) => sum + v, 0) / days[d].length);
    const [name, kg, reps] = key.split("|");
    const info = { name, kg: Number(kg), reps: Number(reps), from: a, to: c };
    if (a < b && b < c && c - a >= 1) {
      if (!result.fatigue) result.fatigue = info;
      fatigued.add(name);
    }
    if (!result.progress && a > b && b > c && a - c >= 1 && c <= 8) result.progress = info;
  });
  result.fatigueCount = fatigued.size;
  return result;
}

// 1RM estimado por Epley, la misma referencia que ya usan Entrenar y el dashboard.
export const epley = (kg, reps) => (kg > 0 && reps > 0 ? kg * (1 + reps / 30) : 0);

export function loadProgressHighlight(workouts = [], today = localISO(), windowDays = 56) {
  const since = addDays(today, -windowDays);
  const byExercise = new Map();
  [...workouts]
    .filter((workout) => workout.date >= since && workout.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((workout) => (workout.exercises || []).forEach((exercise) => {
      const top = Math.round((exercise.sets || []).reduce((max, set) => Math.max(max, epley(Number(set.kg) || 0, Number(set.reps) || 0)), 0));
      if (top <= 0) return;
      const key = canonExercise(exercise.name);
      const entry = byExercise.get(key) || { label: exercise.name, points: [] };
      entry.label = exercise.name;
      entry.points.push({ date: workout.date, kg: top });
      byExercise.set(key, entry);
    }));
  let best = null;
  byExercise.forEach((entry) => {
    if (entry.points.length < 3) return;
    const from = entry.points[0].kg;
    const to = entry.points[entry.points.length - 1].kg;
    if (from <= 0 || to <= from) return;
    const pct = Math.round(((to - from) / from) * 100);
    if (!best || pct > best.pct) {
      best = { name: entry.label, from, to, pct, sessions: entry.points.length, series: entry.points.map((point) => point.kg) };
    }
  });
  return best;
}


export function lastTrainingPerformance(workouts, date) {
    const map = {};
    [...workouts].filter((w) => w.date < date).sort((a, b) => a.date.localeCompare(b.date)).forEach((w) => {
      w.exercises.forEach((e) => {
        const best = e.sets.reduce((m, s) => {
          const kg = Number(s.kg) || 0, reps = Number(s.reps) || 0;
          return kg > 0 && kg >= (m?.kg || 0) ? { kg, reps, rpe: s.rpe || "" } : m;
        }, null);
        if (best) map[canonExercise(e.name)] = { ...best, date: w.date };
      });
    });
    return map;
}

export function trainingSummary(exercises) {
  const totalVol = exercises.reduce((t, e) => t + e.sets.reduce((st, s) => st + (Number(s.reps) || 0) * (Number(s.kg) || 0), 0), 0);
  const totalSets = exercises.reduce((t, e) => t + e.sets.length, 0);
  const rpeVals = exercises.flatMap((e) => e.sets.map((s) => parseFloat(s.rpe)).filter((v) => v > 0));
  const avgRpe = rpeVals.length ? rpeVals.reduce((a, b) => a + b, 0) / rpeVals.length : null;
  return { totalVol, totalSets, avgRpe };
}
