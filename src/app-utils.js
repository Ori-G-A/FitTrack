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

export function selectFreshRecords(records, today, { maxAgeDays = 3, maxItems = 3 } = {}) {
  return records
    .filter((record) => {
      const age = daysBetween(record.date, today);
      return age >= 0 && age <= maxAgeDays;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.best - a.best)
    .slice(0, maxItems);
}

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

export function proteinAdherence(nutrition = [], target, today = localISO(), days = 7) {
  const goal = Number(target) || 0;
  if (!goal) return null;
  const since = addDays(today, -(days - 1));
  const byDate = new Map();
  nutrition
    .filter((item) => item.date >= since && item.date <= today)
    .forEach((item) => byDate.set(item.date, (byDate.get(item.date) || 0) + (Number(item.protein) || 0)));
  if (byDate.size === 0) return null;
  const logged = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, grams]) => Math.round(grams));
  // 90% del objetivo cuenta como dia cumplido: el pesaje de comida no da para mas precision.
  return {
    onTarget: logged.filter((grams) => grams >= goal * 0.9).length,
    logged: logged.length,
    days,
    target: goal,
    avg: Math.round(logged.reduce((sum, grams) => sum + grams, 0) / logged.length),
    series: logged,
  };
}

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
