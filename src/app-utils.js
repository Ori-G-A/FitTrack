export const localISO = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const authUserChanged = (previousUserId, nextUserId) =>
  (previousUserId ?? null) !== (nextUserId ?? null);

export const daysBetween = (start, end) => Math.round(
  (new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000
);

export const addDays = (iso, amount) => {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return localISO(date);
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

const BACKUP_ARRAY_KEYS = ["workouts", "weights", "nutrition", "foods", "recipes", "routines", "measurements", "wellness", "periods", "photos"];
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
  ["weights", "nutrition", "measurements", "wellness", "periods"].forEach((key) => {
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
