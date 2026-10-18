import { localISO, addDays, daysBetween } from "./date-utils.js";

export const WEEK_ORDER = [
  { key: "L", dow: 1, label: "lunes" },
  { key: "M", dow: 2, label: "martes" },
  { key: "X", dow: 3, label: "miércoles" },
  { key: "J", dow: 4, label: "jueves" },
  { key: "V", dow: 5, label: "viernes" },
  { key: "S", dow: 6, label: "sábado" },
  { key: "D", dow: 0, label: "domingo" },
];

const loggedSets = (workout) =>
  (workout?.exercises || []).reduce((total, e) => total + (e.sets || []).filter((s) => Number(s.reps) > 0).length, 0);

export function mondayOf(iso) {
  const dow = new Date(`${iso}T00:00:00`).getDay();
  return addDays(iso, dow === 0 ? -6 : 1 - dow);
}

// Estados: hecho (hay series registradas), hoy, perdido (dia pasado con rutina y
// sin registrar), previsto (futuro con rutina) y libre (sin rutina asignada).
export function planWeek(routines = [], workouts = [], today = localISO(), weekStart = null) {
  const monday = weekStart || mondayOf(today);
  return WEEK_ORDER.map((day, index) => {
    const iso = addDays(monday, index);
    const routine = routines.find((r) => r.suggestedDay != null && Number(r.suggestedDay) === day.dow) || null;
    const workout = workouts.find((w) => w.date === iso) || null;
    const sets = loggedSets(workout);
    const state = sets > 0 ? "hecho"
      : !routine ? "libre"
        : iso === today ? "hoy"
          : iso < today ? "perdido" : "previsto";
    return { ...day, iso, routine, workout, sets, state };
  });
}

// Cumplimiento de las N semanas COMPLETAS anteriores a la actual: contar la
// semana en curso como incumplida solo porque aun no ha terminado convierte el
// panel en un reproche los lunes.
export function planCompliance(routines = [], workouts = [], today = localISO(), weeks = 8) {
  const perWeek = routines.filter((r) => r.suggestedDay != null && r.suggestedDay !== "").length;
  const thisMonday = mondayOf(today);
  const rows = [];
  for (let i = weeks; i >= 1; i--) {
    const start = addDays(thisMonday, -7 * i);
    const end = addDays(start, 6);
    const done = workouts.filter((w) => w.date >= start && w.date <= end && loggedSets(w) > 0).length;
    rows.push({ start, end, done, planned: perWeek });
  }
  const done = rows.reduce((total, r) => total + r.done, 0);
  const planned = perWeek * weeks;
  const full = rows.filter((r) => r.planned > 0 && r.done >= r.planned).length;
  return {
    weeks: rows, perWeek, done, planned, full,
    adherence: planned > 0 ? Math.round((done / planned) * 100) : null,
  };
}

// Numero de semana desde la primera sesion registrada. La app no guarda inicio
// de bloque, y el primer entreno es el unico ancla que existe en los datos.
export function weekNumber(workouts = [], today = localISO()) {
  const first = workouts.filter((w) => loggedSets(w) > 0).map((w) => w.date).sort()[0];
  if (!first) return null;
  return Math.floor(daysBetween(mondayOf(first), mondayOf(today)) / 7) + 1;
}

export const assignTrainingRoutine = (current, dow, routineId) => current.map((routine) => {
    if (routine.id === routineId) return { ...routine, suggestedDay: dow };
    if (Number(routine.suggestedDay) === dow) return { ...routine, suggestedDay: null };
    return routine;
  });
