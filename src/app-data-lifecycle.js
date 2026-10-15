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
