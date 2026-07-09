export const localISO = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const authUserChanged = (previousUserId, nextUserId) =>
  (previousUserId ?? null) !== (nextUserId ?? null);

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

export const daysBetween = (start, end) => Math.round(
  (new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000
);

export const addDays = (iso, amount) => {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return localISO(date);
};

// ponytail: saturación de creatina modelada, no medida. tau=7d -> ~98% a 28d;
// 1.5kg agua a plena carga (rango tipico 1-2kg). Compartido entre BodyScreen
// (muestra el estado actual) y DashboardScreen (para no leer esa agua como
// grasa perdida/ganada en la tendencia de peso).
export const creatineWaterKg = (creatineStart, date, tauDays = 7, fullKg = 1.5) => {
  if (!creatineStart || !date || date < creatineStart) return 0;
  const days = daysBetween(creatineStart, date);
  return (1 - Math.exp(-days / tauDays)) * fullKg;
};

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

export function cycleInfo(periods, currentDate = localISO()) {
  if (!Array.isArray(periods) || periods.length === 0) return null;
  const starts = periods.map((period) => period.date).sort();
  const last = starts[starts.length - 1];
  const lengths = [];
  for (let index = 1; index < starts.length; index += 1) {
    lengths.push(daysBetween(starts[index - 1], starts[index]));
  }
  const validLengths = lengths.filter((length) => length >= 18 && length <= 45);
  const avgCycle = validLengths.length
    ? Math.round(validLengths.reduce((sum, length) => sum + length, 0) / validLengths.length)
    : 28;
  const durations = periods.map((period) => Number(period.duration) || 5);
  const avgPeriod = Math.max(1, Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length));
  const day = daysBetween(last, currentDate) + 1;
  const nextDate = addDays(last, avgCycle);
  const daysToNext = daysBetween(currentDate, nextDate);
  const ovulation = avgCycle - 14;
  let phase;
  if (day > avgCycle + 2) phase = "Por confirmar";
  else if (day <= avgPeriod) phase = "Menstrual";
  else if (day < ovulation - 1) phase = "Folicular";
  else if (day <= ovulation + 1) phase = "Ovulatoria";
  else phase = "L\u00fatea";
  return { avgCycle, avgPeriod, day, phase, nextDate, daysToNext, samples: validLengths.length };
}

const BACKUP_ARRAY_KEYS = ["workouts", "weights", "nutrition", "foods", "recipes", "routines", "measurements", "wellness", "periods", "menstrualLogs", "photos"];
const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isISODate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

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
