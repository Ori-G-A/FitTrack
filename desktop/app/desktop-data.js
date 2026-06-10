/* ============================================================
   FitTrack DESKTOP — extra data the full app windows need:
   muscle groups, exercise templates, food catalog + categories,
   activity levels, cardio types, wellness + extended profile.
   Loads AFTER app-data.js. Plain JS → window.FTD + I18N merge.
   ============================================================ */
(function () {
  "use strict";
  if (!window.FT) { console.error("desktop-data.js: data.js / app-data.js must load first"); return; }

  /* muscle keys shared by Entrenar + Rutinas builders */
  const muscleKeys = ["chest", "back", "shoulders", "biceps", "triceps", "quads", "hamstrings", "glutes", "calves", "core", "traps", "forearms"];

  /* quick exercise templates (Plantilla rápida) */
  const exTemplates = [
    { key: "bench", primary: "chest", sec: ["triceps", "shoulders"] },
    { key: "squat", primary: "quads", sec: ["glutes", "core"] },
    { key: "deadlift", primary: "back", sec: ["hamstrings", "glutes", "traps"] },
    { key: "ohp", primary: "shoulders", sec: ["triceps"] },
    { key: "row", primary: "back", sec: ["biceps", "traps"] },
    { key: "pullup", primary: "back", sec: ["biceps", "forearms"] },
    { key: "curl", primary: "biceps", sec: ["forearms"] },
    { key: "pushdown", primary: "triceps", sec: [] },
    { key: "lateral", primary: "shoulders", sec: [] },
    { key: "legpress", primary: "quads", sec: ["glutes"] },
    { key: "legcurl", primary: "hamstrings", sec: [] },
    { key: "calf", primary: "calves", sec: [] },
  ];

  const cardioTypes = ["walk", "run", "bike", "elliptical", "rowerg", "swim"];

  const activityLevels = ["sedentary", "light", "moderate", "active", "veryactive"];

  /* food categories for the Biblioteca catalog */
  const foodCats = ["veg", "fruit", "dairy", "beef", "pork", "poultry", "fish", "legume", "grain", "flour", "nuts", "oils"];

  /* reference catalog — values per 100 g (USDA-ish) */
  const catalog = [
    { id: "broccoli_c", cat: "veg", nameES: "Brócoli", nameEN: "Broccoli", kcal: 34, p: 2.8, c: 7, f: 0.4 },
    { id: "spinach_c", cat: "veg", nameES: "Espinaca", nameEN: "Spinach", kcal: 23, p: 2.9, c: 3.6, f: 0.4 },
    { id: "tomato_c", cat: "veg", nameES: "Tomate", nameEN: "Tomato", kcal: 18, p: 0.9, c: 3.9, f: 0.2 },
    { id: "pepper_c", cat: "veg", nameES: "Pimiento rojo", nameEN: "Red pepper", kcal: 31, p: 1, c: 6, f: 0.3 },
    { id: "onion_c", cat: "veg", nameES: "Cebolla", nameEN: "Onion", kcal: 40, p: 1.1, c: 9.3, f: 0.1 },
    { id: "potato_c", cat: "veg", nameES: "Patata", nameEN: "Potato", kcal: 77, p: 2, c: 17, f: 0.1 },
    { id: "banana_c", cat: "fruit", nameES: "Plátano", nameEN: "Banana", kcal: 89, p: 1.1, c: 23, f: 0.3 },
    { id: "apple_c", cat: "fruit", nameES: "Manzana", nameEN: "Apple", kcal: 52, p: 0.3, c: 14, f: 0.2 },
    { id: "berries_c", cat: "fruit", nameES: "Arándanos", nameEN: "Blueberries", kcal: 57, p: 0.7, c: 14, f: 0.3 },
    { id: "orange_c", cat: "fruit", nameES: "Naranja", nameEN: "Orange", kcal: 47, p: 0.9, c: 12, f: 0.1 },
    { id: "eggs_c", cat: "dairy", nameES: "Huevo entero", nameEN: "Whole egg", kcal: 143, p: 13, c: 1.1, f: 9.5 },
    { id: "yogurt_c", cat: "dairy", nameES: "Yogur griego", nameEN: "Greek yogurt", kcal: 59, p: 10, c: 3.6, f: 0.4 },
    { id: "milk_c", cat: "dairy", nameES: "Leche semi", nameEN: "Milk 2%", kcal: 50, p: 3.3, c: 4.8, f: 2 },
    { id: "cheese_c", cat: "dairy", nameES: "Queso fresco", nameEN: "Cottage cheese", kcal: 98, p: 11, c: 3.4, f: 4.3 },
    { id: "beef_c", cat: "beef", nameES: "Ternera magra", nameEN: "Lean beef", kcal: 187, p: 26, c: 0, f: 9 },
    { id: "beefmince_c", cat: "beef", nameES: "Carne picada 5%", nameEN: "Beef mince 5%", kcal: 137, p: 21, c: 0, f: 5 },
    { id: "pork_c", cat: "pork", nameES: "Lomo de cerdo", nameEN: "Pork loin", kcal: 143, p: 21, c: 0, f: 6 },
    { id: "chicken_c", cat: "poultry", nameES: "Pechuga de pollo", nameEN: "Chicken breast", kcal: 120, p: 23, c: 0, f: 2.6 },
    { id: "turkey_c", cat: "poultry", nameES: "Pavo", nameEN: "Turkey breast", kcal: 135, p: 29, c: 0, f: 1 },
    { id: "salmon_c", cat: "fish", nameES: "Salmón", nameEN: "Salmon", kcal: 208, p: 20, c: 0, f: 13 },
    { id: "tuna_c", cat: "fish", nameES: "Atún", nameEN: "Tuna", kcal: 132, p: 28, c: 0, f: 1.3 },
    { id: "shrimp_c", cat: "fish", nameES: "Gambas", nameEN: "Shrimp", kcal: 99, p: 24, c: 0.2, f: 0.3 },
    { id: "lentils_c", cat: "legume", nameES: "Lentejas cocidas", nameEN: "Lentils (cooked)", kcal: 116, p: 9, c: 20, f: 0.4 },
    { id: "chickpea_c", cat: "legume", nameES: "Garbanzos", nameEN: "Chickpeas", kcal: 164, p: 9, c: 27, f: 2.6 },
    { id: "rice_c", cat: "grain", nameES: "Arroz cocido", nameEN: "Rice (cooked)", kcal: 130, p: 2.7, c: 28, f: 0.3 },
    { id: "oats_c", cat: "grain", nameES: "Avena", nameEN: "Oats", kcal: 379, p: 13, c: 67, f: 7 },
    { id: "pasta_c", cat: "grain", nameES: "Pasta cocida", nameEN: "Pasta (cooked)", kcal: 158, p: 6, c: 31, f: 0.9 },
    { id: "bread_c", cat: "flour", nameES: "Pan integral", nameEN: "Whole bread", kcal: 247, p: 13, c: 41, f: 3.4 },
    { id: "flour_c", cat: "flour", nameES: "Harina de avena", nameEN: "Oat flour", kcal: 404, p: 15, c: 66, f: 9 },
    { id: "almond_c", cat: "nuts", nameES: "Almendras", nameEN: "Almonds", kcal: 579, p: 21, c: 22, f: 50 },
    { id: "peanut_c", cat: "nuts", nameES: "Crema de cacahuete", nameEN: "Peanut butter", kcal: 588, p: 25, c: 20, f: 50 },
    { id: "oliveoil_c", cat: "oils", nameES: "Aceite de oliva", nameEN: "Olive oil", kcal: 884, p: 0, c: 0, f: 100 },
  ];

  window.FTD = {
    muscleKeys,
    exTemplates,
    cardioTypes,
    activityLevels,
    foodCats,
    catalog,
    catalogCount: 136, // reference library size
  };

  /* extend profile with the goal-engine fields the original Ajustes collects */
  Object.assign(window.FT.app.profile, {
    startKgInput: "auto",
    pacePerWeek: -0.4,
    activity: "moderate",
    autoMacros: false,
    kcalGoal: 2200,
    proteinGoal: 150,
    bleedDays: 5,
    email: "ana@fittrack.app",
  });

  /* ---- i18n merge ---- */
  const more = {
    es: {
      tabLibrary: "Biblioteca", tabRoutines: "Rutinas", tabDash: "Dashboard",
      exportData: "Exportar", importData: "Importar",
      // muscles
      muscleNames: { chest: "Pecho", back: "Espalda", shoulders: "Hombros", biceps: "Bíceps", triceps: "Tríceps", quads: "Cuádriceps", hamstrings: "Femoral", glutes: "Glúteos", calves: "Gemelos", core: "Core", traps: "Trapecio", forearms: "Antebrazo" },
      // entrenar logger
      duration: "Duración", start: "Empezar", reset: "Reiniciar", saveMin: "Guardar",
      minsManual: "Minutos (editar a mano)", cardioLabel: "cardio",
      addExercise: "Añadir alimento", addExerciseT: "Añadir ejercicio", exerciseField: "Ejercicio",
      quickTemplate: "Plantilla rápida", primaryMuscle: "Músculo primario",
      secondaryMuscles: "Músculos secundarios (multiarticular)", exCommon: "Ejercicio común…",
      exCount: "Ejercicios", setsCount: "Series", totalVol: "Volumen total",
      addSetRow: "+ serie", repsCol: "Reps", kgCol: "Kg", est1rmShort: "1RM",
      cardioTitle: "Cardio", cardioType: "Tipo", cardioMin: "Minutos", cardioKcal: "Kcal (opcional)",
      cardioNames: { walk: "Caminar", run: "Correr", bike: "Bici", elliptical: "Elíptica", rowerg: "Remo", swim: "Natación" },
      todayWord: "Hoy",
      // rutinas
      routineTemplates: "Plantillas de entrenamiento",
      routineTemplatesBody: "Define tus días (A / B / C, Push / Pull / Legs…) una vez. Después, en Entrenar, las cargas con un toque: registrar pasa a ser editar, no escribir desde cero.",
      newRoutine: "Nueva rutina", routineName: "Nombre", routineNamePh: "Ej. Día A · Empuje",
      exNamePh: "Ej. Press banca", myRoutines: "Mis rutinas", noRoutines: "Aún no has creado rutinas.",
      seriesShort: "Series", repsShort: "Reps", saveRoutine: "Guardar rutina",
      // biblioteca
      myFoods: "Mis alimentos", catalogTab: "Catálogo", recipesTab: "Recetas",
      catalogTitle: "Catálogo de referencia", foodsWord: "alimentos",
      catalogBody: "Valores por 100 g (USDA y guías estándar). Carnes y pescados en crudo, granos y legumbres cocidos, harinas en seco. Toca + para añadir; luego edítalo si tu etiqueta difiere.",
      category: "Categoría", allCats: "Todas", searchFood: "Buscar",
      searchFoodPh: "Ej. salmón, ribeye, lentejas…", addAll: "Añadir todos",
      addFoodTitle: "Añadir alimento", per100: "por 100 g",
      foodNamePh: "Ej. Pechuga de pollo (cruda)", noMyFoods: "Aún no has guardado alimentos.",
      loadFromCatalog: "Cargar desde el catálogo",
      recipesTitle: "Recetas y platos combinados",
      recipesBody: "Junta varios alimentos de tu biblioteca en una receta (ej. \"mi desayuno\"). FitTrack suma los macros totales y por porción; luego la registras de un toque en Nutrición.",
      newRecipe: "Nueva receta", needFoodsFirst: "Primero añade alimentos a tu biblioteca.",
      myRecipes: "Mis recetas", noRecipes: "Aún no has guardado recetas.",
      catNames: { veg: "Verduras", fruit: "Frutas", dairy: "Lácteos y huevos", beef: "Carne de res", pork: "Carne de cerdo", poultry: "Aves", fish: "Pescados y mariscos", legume: "Legumbres", grain: "Cereales y granos", flour: "Harinas y panes", nuts: "Frutos secos y semillas", oils: "Aceites y grasas" },
      // cuerpo collectors
      bodyWeight: "Peso corporal", dateField: "Fecha", weightKg: "Peso (kg)",
      menstrualCycle: "Ciclo menstrual", periodStart: "Inicio del periodo", bleedDaysF: "Días de sangrado",
      logPeriod: "Registrar inicio",
      cycleHint: "Registra el inicio de tu periodo para ver tu fase actual y la predicción del siguiente. Con 2-3 ciclos las estimaciones se ajustan a ti.",
      bodyMeasures: "Medidas corporales", dailyWellness: "Bienestar diario",
      sleepHours: "Horas de sueño", energyFelt: "Energía / cómo te sentiste",
      dayNotesPh: "Notas del día (dormí mal, viaje, enfermo…)", saveWellness: "Guardar bienestar",
      progressPhotos: "Fotos de progreso", uploadTodayPhoto: "Subir foto de hoy",
      // nutricion add
      addMeal: "Añadir comida", tabFood: "Alimento", tabRecipe: "Receta", tabManual: "Manual",
      mealsOfDay: "Comidas del día", noMealsToday: "Sin registros este día",
      goToLibrary: "Ir a la biblioteca", noSavedFoods: "No tienes alimentos guardados.",
      kcalUnit: "kcal", ofGoal: "objetivo",
      // ajustes original
      weightGoals: "Objetivos de peso", startWeight: "Peso inicial (kg)", goalWeightKg: "Peso meta (kg)",
      paceGoal: "Ritmo objetivo", deficitWord: "déficit", surplusWord: "superávit", perWeekKg: "kg/semana",
      nutritionGoals: "Objetivos de nutrición", activityLevel: "Nivel de actividad",
      autoCalc: "Calcular calorías y proteína automáticamente desde mi objetivo",
      dailyKcal: "Calorías diarias", dailyProtein: "Proteína diaria (g)",
      accountSec: "Cuenta", activeSession: "Sesión activa", signOutBtn: "Cerrar sesión",
      backupSec: "Copia de seguridad",
      backupBody: "Tus datos (incluidas las fotos) viven solo en esta app. Exporta un JSON cada cierto tiempo; puedes reimportarlo desde la cabecera.",
      exportNow: "Exportar copia ahora",
      howMacros: "Cómo se calculan tus macros y avisos",
      howMacrosBody: "El cálculo automático estima tu mantenimiento como peso × factor de actividad, le resta/suma el equivalente a tu ritmo objetivo (7700 kcal ≈ 1 kg), y fija más proteína en déficit (2,2 g/kg) que en volumen (2,0 g/kg). Es un punto de partida: el dashboard ajusta tu mantenimiento real con tus datos en ~2 semanas, y ahí puedes afinar.",
      activityNames: { sedentary: "Sedentario", light: "Ligero (1-2/sem)", moderate: "Moderado (3-4/sem)", active: "Activo (5-6/sem)", veryactive: "Muy activo (7+/sem)" },
      // dashboard alerts
      alertsTitle: "Alertas y avisos", alertImbalanceTitle: "Posible descompensación muscular",
      alertImbalanceBody: "Esta semana cargaste fuerte Espalda, Cuádriceps y Pecho, pero Core y brazos quedaron bajos. Equilibrar el volumen reduce el riesgo de lesión.",
    },
    en: {
      tabLibrary: "Library", tabRoutines: "Routines", tabDash: "Dashboard",
      exportData: "Export", importData: "Import",
      muscleNames: { chest: "Chest", back: "Back", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps", quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes", calves: "Calves", core: "Core", traps: "Traps", forearms: "Forearms" },
      duration: "Duration", start: "Start", reset: "Reset", saveMin: "Save",
      minsManual: "Minutes (edit by hand)", cardioLabel: "cardio",
      addExercise: "Add food", addExerciseT: "Add exercise", exerciseField: "Exercise",
      quickTemplate: "Quick template", primaryMuscle: "Primary muscle",
      secondaryMuscles: "Secondary muscles (compound)", exCommon: "Common exercise…",
      exCount: "Exercises", setsCount: "Sets", totalVol: "Total volume",
      addSetRow: "+ set", repsCol: "Reps", kgCol: "Kg", est1rmShort: "1RM",
      cardioTitle: "Cardio", cardioType: "Type", cardioMin: "Minutes", cardioKcal: "Kcal (optional)",
      cardioNames: { walk: "Walk", run: "Run", bike: "Bike", elliptical: "Elliptical", rowerg: "Row erg", swim: "Swim" },
      todayWord: "Today",
      routineTemplates: "Workout templates",
      routineTemplatesBody: "Define your days (A / B / C, Push / Pull / Legs…) once. Then in Train you load them with a tap: logging becomes editing, not writing from scratch.",
      newRoutine: "New routine", routineName: "Name", routineNamePh: "e.g. Day A · Push",
      exNamePh: "e.g. Bench press", myRoutines: "My routines", noRoutines: "You haven't created routines yet.",
      seriesShort: "Sets", repsShort: "Reps", saveRoutine: "Save routine",
      myFoods: "My foods", catalogTab: "Catalog", recipesTab: "Recipes",
      catalogTitle: "Reference catalog", foodsWord: "foods",
      catalogBody: "Values per 100 g (USDA and standard guides). Meat and fish raw, grains and legumes cooked, flours dry. Tap + to add; then edit it if your label differs.",
      category: "Category", allCats: "All", searchFood: "Search",
      searchFoodPh: "e.g. salmon, ribeye, lentils…", addAll: "Add all",
      addFoodTitle: "Add food", per100: "per 100 g",
      foodNamePh: "e.g. Chicken breast (raw)", noMyFoods: "You haven't saved foods yet.",
      loadFromCatalog: "Load from catalog",
      recipesTitle: "Recipes & combined dishes",
      recipesBody: "Combine several foods from your library into a recipe (e.g. \"my breakfast\"). FitTrack sums total and per-portion macros; then you log it with one tap in Nutrition.",
      newRecipe: "New recipe", needFoodsFirst: "First add foods to your library.",
      myRecipes: "My recipes", noRecipes: "You haven't saved recipes yet.",
      catNames: { veg: "Vegetables", fruit: "Fruit", dairy: "Dairy & eggs", beef: "Beef", pork: "Pork", poultry: "Poultry", fish: "Fish & seafood", legume: "Legumes", grain: "Grains & cereals", flour: "Flours & breads", nuts: "Nuts & seeds", oils: "Oils & fats" },
      bodyWeight: "Body weight", dateField: "Date", weightKg: "Weight (kg)",
      menstrualCycle: "Menstrual cycle", periodStart: "Period start", bleedDaysF: "Bleeding days",
      logPeriod: "Log start",
      cycleHint: "Log your period start to see your current phase and the next prediction. With 2-3 cycles the estimates adapt to you.",
      bodyMeasures: "Body measurements", dailyWellness: "Daily wellness",
      sleepHours: "Hours of sleep", energyFelt: "Energy / how you felt",
      dayNotesPh: "Day notes (slept badly, travel, sick…)", saveWellness: "Save wellness",
      progressPhotos: "Progress photos", uploadTodayPhoto: "Upload today's photo",
      addMeal: "Add meal", tabFood: "Food", tabRecipe: "Recipe", tabManual: "Manual",
      mealsOfDay: "Meals of the day", noMealsToday: "Nothing logged this day",
      goToLibrary: "Go to library", noSavedFoods: "You have no saved foods.",
      kcalUnit: "kcal", ofGoal: "of goal",
      weightGoals: "Weight goals", startWeight: "Start weight (kg)", goalWeightKg: "Goal weight (kg)",
      paceGoal: "Target pace", deficitWord: "deficit", surplusWord: "surplus", perWeekKg: "kg/week",
      nutritionGoals: "Nutrition goals", activityLevel: "Activity level",
      autoCalc: "Calculate calories and protein automatically from my goal",
      dailyKcal: "Daily calories", dailyProtein: "Daily protein (g)",
      accountSec: "Account", activeSession: "Active session", signOutBtn: "Sign out",
      backupSec: "Backup",
      backupBody: "Your data (including photos) lives only in this app. Export a JSON now and then; you can re-import it from the header.",
      exportNow: "Export backup now",
      howMacros: "How your macros & alerts are calculated",
      howMacrosBody: "Auto-calc estimates maintenance as weight × activity factor, subtracts/adds the equivalent of your target pace (7700 kcal ≈ 1 kg), and sets more protein in a deficit (2.2 g/kg) than in a surplus (2.0 g/kg). It's a starting point: the dashboard adjusts your real maintenance from your data in ~2 weeks, and you fine-tune there.",
      activityNames: { sedentary: "Sedentary", light: "Light (1-2/wk)", moderate: "Moderate (3-4/wk)", active: "Active (5-6/wk)", veryactive: "Very active (7+/wk)" },
      alertsTitle: "Alerts & notices", alertImbalanceTitle: "Possible muscle imbalance",
      alertImbalanceBody: "This week you loaded Back, Quads and Chest hard, but Core and arms stayed low. Balancing volume lowers injury risk.",
    },
  };
  ["es", "en"].forEach((lng) => { Object.assign(window.I18N[lng], more[lng]); });
})();
