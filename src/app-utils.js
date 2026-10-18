export { applyAdjustments } from "./training-records.js";
export { canonExercise, matchedLoadRpeTrend, epley, loadProgressHighlight } from "./training-metrics.js";
export { RPE_STEPS, parseRpeTarget, nextSetAdvice } from "./training-advice.js";
export { WEEK_ORDER, mondayOf, planWeek, planCompliance, weekNumber } from "./training-plan.js";
import { localISO, addDays, daysBetween } from "./date-utils.js";
export { localISO, addDays, daysBetween } from "./date-utils.js";

export const authUserChanged = (previousUserId, nextUserId) =>
  (previousUserId ?? null) !== (nextUserId ?? null);

export function mergePhotoUrls(currentPhotos, refreshedPhotos) {
  const signedUrls = new Map(
    refreshedPhotos
      .filter((photo) => photo.storagePath && photo.signedUrl)
      .map((photo) => [photo.storagePath, photo.signedUrl]),
  );
  let changed = false;
  const nextPhotos = currentPhotos.map((photo) => {
    const signedUrl = signedUrls.get(photo.storagePath);
    if (!signedUrl || signedUrl === photo.signedUrl) return photo;
    changed = true;
    return { ...photo, signedUrl };
  });
  return changed ? nextPhotos : currentPhotos;
}

export function selectFreshRecords(records, today, { maxAgeDays = 3, maxItems = 3 } = {}) {
  return records
    .filter((record) => {
      const age = daysBetween(record.date, today);
      return age >= 0 && age <= maxAgeDays;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.best - a.best)
    .slice(0, maxItems);
}

// ponytail: saturación de creatina modelada, no medida. tau=7d -> ~98% a 28d;
// 1.5kg agua a plena carga (rango tipico 1-2kg). Compartido entre BodyScreen
// (muestra el estado actual) y DashboardScreen (para no leer esa agua como
// grasa perdida/ganada en la tendencia de peso).
export const creatineWaterKg = (creatineStart, date, tauDays = 7, fullKg = 1.5) => {
  if (!creatineStart || !date || date < creatineStart) return 0;
  const days = daysBetween(creatineStart, date);
  return (1 - Math.exp(-days / tauDays)) * fullKg;
};

// Offset empírico de retención de líquidos en lútea tardía, en kg. Detrenda con
// la pendiente de la fase folicular (si no, una fase que cae en una racha de
// bajada se lee como "menos retención") y compara el residuo medio de lútea
// tardía contra el de folicular, que es la línea base con menos progesterona.
// Rango esperado 0.5–2 kg de agua en lútea (ACSM); por eso <0.2 kg se descarta
// como ruido y >2.5 kg se recorta: fuera de ese rango es más probable un
// artefacto de pocas pesadas que retención real.
// `phaseOf` es un callback date -> phase para no importar cycle-inference acá
// (ese módulo ya importa de este, sería circular).
// ponytail: media simple, sin ponderar por confianza de la fase ni por ciclo.
export function lutealRetentionKg(weights, phaseOf, minPerPhase = 3) {
  const points = [...weights]
    .filter((w) => w.date && Number(w.kg) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < minPerPhase * 2) return null;
  const base = points[0].date;
  const luteal = [], follicular = [];
  points.forEach((w) => {
    const phase = phaseOf(w.date);
    const bucket = phase === "luteal_late" ? luteal
      : (phase === "follicular_early" || phase === "follicular_mid_late") ? follicular : null;
    if (bucket) bucket.push({ x: daysBetween(base, w.date), y: Number(w.kg) });
  });
  if (luteal.length < minPerPhase || follicular.length < minPerPhase) return null;
  // La pendiente se estima SOLO sobre folicular: si se ajusta sobre toda la serie,
  // el propio salto lútea entra en la tendencia y el offset sale subestimado.
  const slope = slopePerDay(follicular) ?? 0;
  const meanResidual = (pts) => pts.reduce((sum, p) => sum + (p.y - slope * p.x), 0) / pts.length;
  const raw = meanResidual(luteal) - meanResidual(follicular);
  if (raw <= 0.2) return null;
  return {
    kg: Math.round(Math.min(raw, 2.5) * 100) / 100,
    capped: raw > 2.5,
    lutealDays: luteal.length,
    follicularDays: follicular.length,
  };
}

export function slopePerDay(points) {
  const count = points.length;
  if (count < 2) return null;
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
  const denominator = count * sumXX - sumX * sumX;
  return denominator === 0 ? null : (count * sumXY - sumX * sumY) / denominator;
}

const BACKUP_ARRAY_KEYS = ["workouts", "weights", "nutrition", "foods", "recipes", "routines", "measurements", "wellness", "periods", "menstrualLogs", "photos"];
const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isISODate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

// Destacados de cabecera: cada uno resume, con los datos que ya hay, lo unico que
// merece leerse antes de entrar a la pantalla. Devuelven null cuando no hay
// suficiente para afirmar nada, y la cabecera entonces no se dibuja.

export function weightTrendHighlight(weights = [], today = localISO(), windowDays = 21) {
  const since = addDays(today, -windowDays);
  const points = [...weights]
    .filter((weight) => weight.date >= since && weight.date <= today && Number(weight.kg) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < 3) return null;
  const slope = slopePerDay(points.map((point) => ({ x: daysBetween(points[0].date, point.date), y: Number(point.kg) })));
  if (slope == null) return null;
  const last = points[points.length - 1];
  return {
    perWeek: Math.round(slope * 7 * 100) / 100,
    from: Number(points[0].kg),
    to: Number(last.kg),
    days: daysBetween(points[0].date, last.date),
    series: points.map((point) => Number(point.kg)),
  };
}

export { proteinAdherence } from "./nutrition-metrics.js";

export function validateBackup(value, defaultGoals) {
  if (!isPlainObject(value)) throw new Error("La copia debe contener un objeto JSON");
  const backup = {};
  let found = false;
  BACKUP_ARRAY_KEYS.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(value, key)) return;
    if (!Array.isArray(value[key]) || !value[key].every(isPlainObject)) throw new Error(`La coleccion ${key} no es valida`);
    backup[key] = value[key];
    found = true;
  });
  if (Object.prototype.hasOwnProperty.call(value, "goals")) {
    if (!isPlainObject(value.goals)) throw new Error("Los objetivos no son validos");
    backup.goals = Object.fromEntries(Object.keys(defaultGoals).map((key) => [key, value.goals[key] ?? defaultGoals[key]]));
    found = true;
  }
  if (!found) throw new Error("El archivo no contiene datos de FitTrack");
  if (backup.workouts?.some((workout) => !isISODate(workout.date)
    || !Array.isArray(workout.exercises)
    || workout.exercises.some((exercise) => !isPlainObject(exercise) || !Array.isArray(exercise.sets))
    || (workout.cardio != null && !Array.isArray(workout.cardio)))) {
    throw new Error("El historial de entrenamientos no es valido");
  }
  ["weights", "nutrition", "measurements", "wellness", "periods", "menstrualLogs"].forEach((key) => {
    if (backup[key]?.some((item) => !isISODate(item.date))) throw new Error(`Las fechas de ${key} no son validas`);
  });
  if (backup.photos?.some((photo) => !isISODate(photo.date)
    || typeof photo.dataUrl !== "string"
    || !/^data:image\/(jpeg|png|webp);base64,/i.test(photo.dataUrl))) {
    throw new Error("Las fotos de la copia no son validas");
  }
  return backup;
}

export function migrateWorkouts(workouts, defaultMuscle) {
  return workouts.map((workout) => ({
    ...workout,
    durationMin: workout.durationMin || 0,
    cardio: workout.cardio || [],
    exercises: (workout.exercises || []).map((exercise) => ({
      ...exercise,
      primary: exercise.primary || exercise.muscle || defaultMuscle,
      secondary: exercise.secondary || [],
    })),
  }));
}

// Entradas de un dia para el Diario: entreno, cardio, comidas, peso, medidas y
// nota, en una sola lista.
// ponytail: el orden es fijo (entreno -> comidas -> cuerpo) porque el modelo de
// datos no guarda hora de registro. Si algun dia se anade `time`, ordenar por
// ella y borrar este comentario.
// Pasos de un dia y la media de los 7 anteriores, que es contra lo que se lee
// si el dia va bien o flojo. Sin dato de hoy devuelve `today: null`, no un cero:
// no haber registrado no es haberse quedado quieta.
export function stepsToday(wellness = [], date = localISO()) {
  const day = wellness.find((w) => w.date === date);
  const from = addDays(date, -7);
  const week = wellness.filter((w) => w.date >= from && w.date < date && Number(w.steps) > 0).map((w) => Number(w.steps));
  return {
    today: Number(day?.steps) > 0 ? Number(day.steps) : null,
    avg: week.length ? Math.round(week.reduce((sum, n) => sum + n, 0) / week.length) : null,
    days: week.length,
  };
}

export function dayFeed(date, { workouts = [], nutrition = [], weights = [], measurements = [], wellness = [] } = {}) {
  const entries = [];

  const workout = workouts.find((w) => w.date === date);
  if (workout) {
    const exercises = workout.exercises || [];
    const sets = exercises.reduce((total, e) => total + (e.sets || []).filter((s) => Number(s.reps) > 0).length, 0);
    const rpes = exercises.flatMap((e) => (e.sets || []).map((s) => parseFloat(s.rpe)).filter((r) => r > 0));
    const volume = exercises.reduce((total, e) => total + (e.sets || []).reduce((sum, s) => sum + (Number(s.kg) || 0) * (Number(s.reps) || 0), 0), 0);
    if (exercises.length) {
      const meta = [
        workout.durationMin ? `${workout.durationMin} min` : null,
        sets ? `${sets} series` : null,
        volume ? `${Math.round(volume).toLocaleString("es-ES")} kg` : null,
        rpes.length ? `RPE ${(Math.round((rpes.reduce((a, b) => a + b, 0) / rpes.length) * 10) / 10).toString().replace(".", ",")}` : null,
      ].filter(Boolean).join(" · ");
      entries.push({
        id: `w-${workout.id}`, kind: "entreno",
        title: `Sesión · ${exercises.length} ejercicio${exercises.length > 1 ? "s" : ""}`,
        meta, tab: "entrenar", done: sets > 0,
        // La fila no muestra los ejercicios, pero buscar "press banca" tiene que
        // encontrarla: el texto buscable no es el que se pinta.
        names: exercises.map((e) => e.name),
        search: exercises.map((e) => e.name).join(" "),
      });
    }
    (workout.cardio || []).forEach((c) => entries.push({
      id: `c-${c.id}`, kind: "cardio", title: c.type,
      meta: [`${c.minutes} min`, c.kcal ? `${c.kcal} kcal` : null].filter(Boolean).join(" · "),
      tab: "entrenar", done: true,
    }));
  }

  nutrition.filter((n) => n.date === date).forEach((n) => entries.push({
    id: `n-${n.id}`, kind: "comida", title: n.name,
    meta: [`${Math.round(Number(n.kcal) || 0)} kcal`, Number(n.protein) ? `${Math.round(n.protein)} g P` : null].filter(Boolean).join(" · "),
    tab: "nutricion", done: true,
  }));

  const weight = weights.find((w) => w.date === date);
  if (weight) entries.push({ id: `p-${weight.id || date}`, kind: "peso", title: `${String(weight.kg).replace(".", ",")} kg`, meta: "peso corporal", tab: "peso", done: true });

  const measure = measurements.find((m) => m.date === date);
  if (measure) {
    const parts = ["cintura", "cadera", "pecho", "brazo", "muslo"]
      .filter((key) => Number(measure[key]) > 0)
      .map((key) => `${key} ${String(measure[key]).replace(".", ",")}`);
    if (parts.length) entries.push({ id: `m-${measure.id || date}`, kind: "medidas", title: "Medidas", meta: `${parts.join(" · ")} cm`, tab: "medidas", done: true });
  }

  const note = wellness.find((w) => w.date === date);
  if (note && (note.sleep != null || note.steps != null || note.energy || (note.notes || "").trim())) {
    const meta = [
      note.sleep != null ? `${String(note.sleep).replace(".", ",")} h de sueño` : null,
      note.steps ? `${Number(note.steps).toLocaleString("es-ES")} pasos` : null,
      note.energy ? `energía ${note.energy}` : null,
      (note.notes || "").trim() || null,
    ].filter(Boolean).join(" · ");
    entries.push({ id: `s-${note.id || date}`, kind: "nota", title: "Nota del día", meta, tab: "nota", done: true, search: note.notes || "" });
  }

  // Todo lo que se pinta es buscable; `search` solo anade lo que no se ve.
  // `date` viaja con la entrada para que pulsarla pueda abrir la pantalla
  // destino en ese dia, no en hoy.
  return entries.map((entry) => ({
    ...entry,
    date,
    search: `${entry.title} ${entry.meta || ""} ${entry.search || ""}`.toLowerCase(),
  }));
}

// Busqueda del Diario sobre todo el historial: sesiones, ejercicios, alimentos,
// medidas y notas. Reutiliza dayFeed en vez de formatear las filas otra vez, asi
// que un resultado se ve exactamente igual que en la lista del dia.
// ponytail: recorre dia a dia de mas reciente a mas antiguo y para al llegar al
// tope. Sin indice: con el historial de una persona el corte llega en las
// primeras decenas de dias. Si algun dia va lento, indexar por termino.
export function searchFeed(query, data = {}, { limit = 40, maxDays = 460 } = {}) {
  const needle = String(query || "").trim().toLowerCase();
  if (needle.length < 2) return [];

  const dates = new Set();
  ["workouts", "nutrition", "weights", "measurements", "wellness"].forEach((key) => {
    (data[key] || []).forEach((row) => { if (row && row.date) dates.add(row.date); });
  });

  const results = [];
  const ordered = [...dates].sort((a, b) => b.localeCompare(a)).slice(0, maxDays);
  for (const date of ordered) {
    for (const entry of dayFeed(date, data)) {
      if (!entry.search.includes(needle)) continue;
      // Una sesion se pinta como "Sesión · 3 ejercicios": si lo que coincidio fue
      // el nombre de un ejercicio, el resultado tiene que decir cual, o la fila no
      // explica por que esta ahi.
      const matched = (entry.names || []).find((name) => name.toLowerCase().includes(needle));
      results.push({ ...entry, date, meta: matched ? [matched, entry.meta].filter(Boolean).join(" · ") : entry.meta });
    }
    if (results.length >= limit) break;
  }
  return results.slice(0, limit);
}

// ============================================================================
// Autoregulacion dentro de la sesion
// ----------------------------------------------------------------------------
// Escala de RPE que se ofrece al registrar: por debajo de 6 (5+ reps en reserva)
// la serie no informa de la proximidad al fallo, y el medio punto solo aporta de
// 7 en adelante, que es donde se decide si la carga sube.
// ============================================================================
// Tema
// ----------------------------------------------------------------------------
// El prototipo 3a es oscuro puro: ese es el aspecto de la app, asi que "dark" es
// el valor por defecto y no "auto". Quien prefiera claro lo elige en Ajustes y su
// eleccion manda sobre el sistema.
// ponytail: sin migracion. Una preferencia guardada antigua ("auto" o "light")
// se respeta tal cual; solo cambia lo que ve quien nunca ha elegido.
export const THEME_KEY = "ft-theme";

export function readThemePref() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "auto" || stored === "light" || stored === "dark" ? stored : "dark";
  } catch {
    return "dark";
  }
}

export function resolveTheme(pref, systemDark) {
  return pref === "auto" ? (systemDark ? "dark" : "light") : pref;
}

// ============================================================================
// Plan semanal
// ----------------------------------------------------------------------------
// La semana no necesita modelo nuevo: las rutinas ya traen `suggestedDay` desde
// fase1Config (0=domingo .. 6=sabado), asi que el plan es "que rutina cae en que
// dia" leido de las propias rutinas. Reasignar un dia escribe ese campo.
// ponytail: una rutina por dia. Si algun dia hacen falta dos sesiones el mismo
// dia, esto pasa a ser una lista y el resto del calculo no cambia.
