import { bodyFeedEntries } from "./body-metrics.js";
import { THEME_KEY, readThemePref as readUiThemePref } from "./ui-theme.js";
export { stepsToday } from "./body-metrics.js";
export { creatineWaterKg, lutealRetentionKg, slopePerDay, weightTrendHighlight } from "./weight-model.js";
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

const BACKUP_ARRAY_KEYS = ["workouts", "weights", "nutrition", "foods", "recipes", "routines", "measurements", "wellness", "periods", "menstrualLogs", "photos"];
const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isISODate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

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

  entries.push(...bodyFeedEntries(date, { weights, measurements, wellness }));

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
export { THEME_KEY, resolveTheme } from "./ui-theme.js";
// Fachada compatible: conserva la lectura del navegador y delega su validación.
export function readThemePref() {
  return readUiThemePref(() => localStorage.getItem(THEME_KEY));
}

// ============================================================================
// Plan semanal
// ----------------------------------------------------------------------------
// La semana no necesita modelo nuevo: las rutinas ya traen `suggestedDay` desde
// fase1Config (0=domingo .. 6=sabado), asi que el plan es "que rutina cae en que
// dia" leido de las propias rutinas. Reasignar un dia escribe ese campo.
// ponytail: una rutina por dia. Si algun dia hacen falta dos sesiones el mismo
// dia, esto pasa a ser una lista y el resto del calculo no cambia.
