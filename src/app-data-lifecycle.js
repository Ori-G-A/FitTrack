// Coordinación sin React, DOM ni cliente global; las fronteras se reciben explícitamente.
const COLLECTION_KEYS = ['workouts', 'weights', 'nutrition', 'foods', 'recipes', 'routines',
  'measurements', 'wellness', 'periods', 'menstrualLogs', 'photos'];

export async function loadUserData({ userId, loadKey, defaultGoals, hydratePhotos,
  migrateWorkouts, migrateFoodUnits, setters, isCancelled, onError }) {
  try {
    const [nextWorkouts, nextWeights, nextNutrition, nextFoods, nextRecipes, nextRoutines,
      nextMeasurements, nextWellness, nextPeriods, nextMenstrualLogs, nextPhotos, nextGoals] = await Promise.all([
      ...COLLECTION_KEYS.map(key => loadKey(userId, key, [])),
      loadKey(userId, 'goals', defaultGoals),
    ]);
    const hydratedPhotos = await hydratePhotos(userId, nextPhotos);
    if (isCancelled()) return;
    setters.setWorkouts(migrateWorkouts(nextWorkouts));
    setters.setWeights(nextWeights);
    setters.setNutrition(nextNutrition);
    setters.setFoods(migrateFoodUnits(nextFoods));
    setters.setRecipes(nextRecipes);
    setters.setRoutines(nextRoutines);
    setters.setMeasurements(nextMeasurements);
    setters.setWellness(nextWellness);
    setters.setPeriods(nextPeriods);
    setters.setMenstrualLogs(nextMenstrualLogs);
    setters.setPhotos(hydratedPhotos);
    setters.setGoals(nextGoals);
    setters.setLoaded(true);
  } catch (error) {
    if (isCancelled()) return;
    onError(error);
  }
}

export async function exportUserData({ data, photosForBackup, download, onError }) {
  try {
    const backupPhotos = await photosForBackup(data.photos);
    download({ ...data, photos: backupPhotos });
  } catch (error) {
    onError(error);
  }
}

export function importUserData(event, { userId, createReader, validateBackup,
  confirm, notify, migrateWorkouts, migrateFoodUnits, hydratePhotos, setters }) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 50 * 1024 * 1024) {
    notify('La copia supera el límite de 50 MB');
    event.target.value = '';
    return;
  }
  const reader = createReader();
  reader.onload = async () => {
    try {
      const data = validateBackup(JSON.parse(reader.result));
      if (!confirm('Esta importación reemplazará las colecciones incluidas en la copia. ¿Continuar?')) return;
      if (data.workouts) setters.setWorkouts(migrateWorkouts(data.workouts));
      if (data.weights) setters.setWeights(data.weights);
      if (data.nutrition) setters.setNutrition(data.nutrition);
      if (data.foods) setters.setFoods(migrateFoodUnits(data.foods));
      if (data.recipes) setters.setRecipes(data.recipes);
      if (data.routines) setters.setRoutines(data.routines);
      if (data.measurements) setters.setMeasurements(data.measurements);
      if (data.wellness) setters.setWellness(data.wellness);
      if (data.periods) setters.setPeriods(data.periods);
      if (data.menstrualLogs) setters.setMenstrualLogs(data.menstrualLogs);
      if (data.photos) setters.setPhotos(await hydratePhotos(userId, data.photos));
      if (data.goals) setters.setGoals(data.goals);
    } catch (error) {
      notify(error?.message || 'Archivo no válido');
    } finally {
      event.target.value = '';
    }
  };
  reader.onerror = () => { notify('No se pudo leer el archivo'); event.target.value = ''; };
  reader.readAsText(file);
}
