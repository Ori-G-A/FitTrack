/* ============================================================
   FitTrack APP — extends window.FT + window.I18N with the data
   the full mobile app needs (routines, history, body, food, profile).
   Loads AFTER data.js. Plain JS.
   ============================================================ */
(function () {
  "use strict";
  if (!window.FT) { console.error("app-data.js: data.js must load first"); return; }

  const isoMinus = (n) => {
    const d = new Date("2026-06-09T00:00:00");
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  /* ---- routines (Push / Pull / Legs) — each exercise carries the
     prefill from last session so logging is one-tap fast ---- */
  const routines = [
    {
      id: "push", nameES: "Empuje", nameEN: "Push", split: "A",
      exercises: [
        { key: "bench",   sets: 4, reps: 6, kg: 80 },
        { key: "incline", sets: 3, reps: 8, kg: 28 },
        { key: "ohp",     sets: 4, reps: 6, kg: 48 },
        { key: "lateral", sets: 3, reps: 14, kg: 10 },
        { key: "pushdown",sets: 3, reps: 12, kg: 32 },
      ],
    },
    {
      id: "pull", nameES: "Tir\u00f3n", nameEN: "Pull", split: "B",
      exercises: [
        { key: "deadlift", sets: 3, reps: 5, kg: 145 },
        { key: "pullup",   sets: 4, reps: 8, kg: 16 },
        { key: "row",      sets: 4, reps: 8, kg: 72 },
        { key: "facepull", sets: 3, reps: 15, kg: 22 },
        { key: "curl",     sets: 3, reps: 10, kg: 16 },
      ],
    },
    {
      id: "legs", nameES: "Pierna", nameEN: "Legs", split: "C",
      exercises: [
        { key: "squat",   sets: 4, reps: 6, kg: 118 },
        { key: "rdl",     sets: 3, reps: 8, kg: 92 },
        { key: "legpress",sets: 3, reps: 12, kg: 180 },
        { key: "legcurl", sets: 3, reps: 12, kg: 45 },
        { key: "calf",    sets: 4, reps: 15, kg: 90 },
      ],
    },
  ];

  /* ---- workout history (recent sessions) ---- */
  const history = [
    { iso: isoMinus(0), routine: "push", min: 64, vol: 8420, sets: 17, top: { key: "bench", kg: 80, reps: 6 } },
    { iso: isoMinus(2), routine: "pull", min: 71, vol: 9210, sets: 17, top: { key: "deadlift", kg: 145, reps: 5 } },
    { iso: isoMinus(3), routine: "legs", min: 58, vol: 11240, sets: 17, top: { key: "squat", kg: 118, reps: 6 } },
    { iso: isoMinus(5), routine: "push", min: 66, vol: 8010, sets: 17, top: { key: "bench", kg: 78, reps: 6 } },
    { iso: isoMinus(6), routine: "pull", min: 62, vol: 8880, sets: 16, top: { key: "deadlift", kg: 142, reps: 5 } },
    { iso: isoMinus(8), routine: "legs", min: 60, vol: 10980, sets: 17, top: { key: "squat", kg: 116, reps: 6 } },
  ];

  /* ---- body measurements (cm) over time, every 2 weeks ---- */
  const measureDates = [];
  for (let i = 5; i >= 0; i--) measureDates.push(isoMinus(i * 14));
  const measurements = {
    waist: { unit: "cm", series: [82.5, 81.8, 81.0, 80.2, 79.4, 78.6], goal: 76 },
    hips:  { unit: "cm", series: [98.0, 97.6, 97.2, 96.9, 96.5, 96.2], goal: null },
    arm:   { unit: "cm", series: [33.8, 33.9, 34.0, 34.1, 34.1, 34.2], goal: null },
    chest: { unit: "cm", series: [99.5, 99.2, 99.0, 98.8, 98.7, 98.6], goal: null },
    thigh: { unit: "cm", series: [56.2, 56.0, 55.8, 55.7, 55.6, 55.5], goal: null },
  };

  /* ---- progress photos (placeholders the user replaces) ---- */
  const photos = [
    { iso: isoMinus(56), kg: 76.9, label: "front" },
    { iso: isoMinus(28), kg: 75.4, label: "front" },
    { iso: isoMinus(0),  kg: 74.1, label: "front" },
  ];

  /* ---- food database for quick-add (per serving) ---- */
  const foods = [
    { id: "eggs",     nameES: "Huevos (2)",        nameEN: "Eggs (2)",         kcal: 156, p: 13, c: 1,  f: 11, serv: "2 ud" },
    { id: "oats",     nameES: "Avena 80g",          nameEN: "Oats 80g",         kcal: 304, p: 11, c: 51, f: 6,  serv: "80 g" },
    { id: "chicken",  nameES: "Pollo 150g",         nameEN: "Chicken 150g",     kcal: 248, p: 46, c: 0,  f: 5,  serv: "150 g" },
    { id: "rice",     nameES: "Arroz 200g",         nameEN: "Rice 200g",        kcal: 260, p: 5,  c: 56, f: 1,  serv: "200 g" },
    { id: "salmon",   nameES: "Salm\u00f3n 140g",   nameEN: "Salmon 140g",      kcal: 280, p: 34, c: 0,  f: 16, serv: "140 g" },
    { id: "yogurt",   nameES: "Yogur griego",       nameEN: "Greek yogurt",     kcal: 130, p: 17, c: 7,  f: 4,  serv: "170 g" },
    { id: "whey",     nameES: "Batido proteico",    nameEN: "Whey shake",       kcal: 120, p: 25, c: 3,  f: 1,  serv: "1 scoop" },
    { id: "banana",   nameES: "Pl\u00e1tano",       nameEN: "Banana",           kcal: 105, p: 1,  c: 27, f: 0,  serv: "1 ud" },
    { id: "almonds",  nameES: "Almendras 30g",      nameEN: "Almonds 30g",      kcal: 174, p: 6,  c: 6,  f: 15, serv: "30 g" },
    { id: "avocado",  nameES: "Aguacate 1/2",       nameEN: "Avocado 1/2",      kcal: 160, p: 2,  c: 9,  f: 15, serv: "1/2 ud" },
    { id: "broccoli", nameES: "Br\u00f3coli 150g",  nameEN: "Broccoli 150g",    kcal: 51,  p: 4,  c: 10, f: 1,  serv: "150 g" },
    { id: "olive",    nameES: "Aceite oliva 1cda",  nameEN: "Olive oil 1 tbsp", kcal: 119, p: 0,  c: 0,  f: 14, serv: "1 cda" },
  ];

  /* today's diary — preseeded so the screen looks lived-in */
  const todayMeals = {
    breakfast: ["oats", "eggs", "banana"],
    lunch: ["chicken", "rice", "broccoli", "olive"],
    dinner: [],
    snacks: ["yogurt", "whey"],
  };

  window.FT.app = {
    routines,
    history,
    measureDates,
    measurements,
    photos,
    foods,
    todayMeals,
    profile: {
      name: "Ana", age: 29, heightCm: 168, sex: "F",
      goal: "cut", goalKg: 72, startKg: 76.9,
      units: "metric", trainDaysGoal: 5,
      cycleTracking: true,
      integrations: { applehealth: true, whoop: false, strava: false },
    },
    foodById: Object.fromEntries(foods.map((f) => [f.id, f])),
  };

  /* ---- app i18n: merge into existing I18N.es / I18N.en ---- */
  const more = {
    es: {
      // nav
      tabTrain: "Entrenar", tabBody: "Cuerpo", tabHome: "Resumen", tabNutri: "Nutri", tabSettings: "Ajustes",
      // generic
      add: "A\u00f1adir", done: "Hecho", cancel: "Cancelar", save: "Guardar", start: "Empezar",
      finish: "Terminar", edit: "Editar", today: "Hoy", week: "Semana", all: "Todo",
      kg: "kg", reps: "reps", min: "min", sets: "series", cm: "cm",
      // entrenar
      routinesTitle: "Rutinas", historyTitle: "Historial", startWorkout: "Empezar entreno",
      continueWorkout: "Continuar entreno", nextUp: "Toca hoy", exercisesN: (n) => `${n} ejercicios`,
      lastDid: "\u00faltima vez", volume: "volumen", logSet: "Registrar serie",
      restTimer: "Descanso", skipRest: "Saltar", addSet: "A\u00f1adir serie",
      setN: (n) => `Serie ${n}`, prev: "anterior", target: "objetivo",
      finishWorkout: "Terminar entreno", workoutDone: "\u00a1Entreno completado!",
      summary: "Resumen", totalVol: "volumen total", duration: "duraci\u00f3n",
      // cuerpo
      bodyTitle: "Cuerpo", weightTab: "Peso", measuresTab: "Medidas", photosTab: "Fotos",
      logWeight: "Registrar peso", current: "actual", goalWeight: "meta",
      toGoal: (kg) => `${kg} kg para la meta`, measurements: "Medidas corporales",
      addPhoto: "A\u00f1adir foto", compare: "Comparar", dropPhoto: "tu foto de progreso",
      waist: "Cintura", hips: "Cadera", arm: "Brazo", chest: "Pecho", thigh: "Muslo",
      // nutricion
      nutriTitle: "Nutrici\u00f3n", remaining: "restante", eaten: "consumido", goalKcal: "objetivo",
      breakfast: "Desayuno", lunch: "Comida", dinner: "Cena", snacks: "Snacks",
      addFood: "A\u00f1adir alimento", quickAdd: "A\u00f1adido r\u00e1pido", searchFood: "Buscar alimento",
      perServing: "por raci\u00f3n", emptyMeal: "Sin alimentos a\u00fan",
      protein: "Prote\u00edna", carbs: "Carbos", fat: "Grasa",
      // ajustes
      settingsTitle: "Ajustes", profile: "Perfil", goalsSec: "Objetivos", unitsSec: "Unidades",
      integrations: "Integraciones", account: "Cuenta", name: "Nombre", age: "Edad", height: "Altura",
      metric: "M\u00e9trico", imperial: "Imperial", goalCut: "D\u00e9ficit (cut)", goalMaintain: "Mantener", goalBulk: "Volumen",
      cycleTrack: "Seguir ciclo", trainDays: "D\u00edas de entreno / semana", language: "Idioma",
      appleHealth: "Apple Health", whoop: "WHOOP", strava: "Strava", connected: "conectado", connect: "conectar",
      signOut: "Cerrar sesi\u00f3n", version: "Versi\u00f3n",
      // onboarding
      welcome: "Bienvenida a", obStart: "Vamos a configurar tu perfil en 4 pasos r\u00e1pidos.",
      obName: "\u00bfC\u00f3mo te llamas?", obGoalQ: "\u00bfCu\u00e1l es tu objetivo?",
      obBodyQ: "Tus datos b\u00e1sicos", obDaysQ: "\u00bfCu\u00e1ntos d\u00edas entrenas?",
      obWeightNow: "Peso actual", obWeightGoal: "Peso objetivo",
      next: "Siguiente", back: "Atr\u00e1s", getStarted: "Empezar a usar FitTrack",
      step: (a, b) => `Paso ${a} de ${b}`, daysWeek: "d\u00edas / semana",
      // insight ledes + alerts
      alertsTitle: "Alertas y avisos", alertImbalanceTitle: "Posible descompensaci\u00f3n muscular",
      alertImbalanceBody: "Esta semana cargaste fuerte espalda y pierna, pero core y brazos quedaron bajos. Equilibrar el volumen reduce el riesgo de lesi\u00f3n.",
      // extra exercises
      moreExercises: {
        incline: "Press inclinado", lateral: "Elevaciones lat.", pushdown: "Extensi\u00f3n tr\u00edceps",
        facepull: "Face pull", curl: "Curl b\u00edceps", rdl: "Peso muerto rumano",
        legpress: "Prensa", legcurl: "Curl femoral", calf: "Gemelo",
      },
    },
    en: {
      tabTrain: "Train", tabBody: "Body", tabHome: "Overview", tabNutri: "Food", tabSettings: "Settings",
      add: "Add", done: "Done", cancel: "Cancel", save: "Save", start: "Start",
      finish: "Finish", edit: "Edit", today: "Today", week: "Week", all: "All",
      kg: "kg", reps: "reps", min: "min", sets: "sets", cm: "cm",
      routinesTitle: "Routines", historyTitle: "History", startWorkout: "Start workout",
      continueWorkout: "Resume workout", nextUp: "Up next", exercisesN: (n) => `${n} exercises`,
      lastDid: "last time", volume: "volume", logSet: "Log set",
      restTimer: "Rest", skipRest: "Skip", addSet: "Add set",
      setN: (n) => `Set ${n}`, prev: "prev", target: "target",
      finishWorkout: "Finish workout", workoutDone: "Workout complete!",
      summary: "Summary", totalVol: "total volume", duration: "duration",
      bodyTitle: "Body", weightTab: "Weight", measuresTab: "Measures", photosTab: "Photos",
      logWeight: "Log weight", current: "current", goalWeight: "goal",
      toGoal: (kg) => `${kg} kg to goal`, measurements: "Body measurements",
      addPhoto: "Add photo", compare: "Compare", dropPhoto: "your progress photo",
      waist: "Waist", hips: "Hips", arm: "Arm", chest: "Chest", thigh: "Thigh",
      nutriTitle: "Nutrition", remaining: "remaining", eaten: "eaten", goalKcal: "goal",
      breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snacks: "Snacks",
      addFood: "Add food", quickAdd: "Quick add", searchFood: "Search food",
      perServing: "per serving", emptyMeal: "Nothing logged yet",
      protein: "Protein", carbs: "Carbs", fat: "Fat",
      settingsTitle: "Settings", profile: "Profile", goalsSec: "Goals", unitsSec: "Units",
      integrations: "Integrations", account: "Account", name: "Name", age: "Age", height: "Height",
      metric: "Metric", imperial: "Imperial", goalCut: "Cut (deficit)", goalMaintain: "Maintain", goalBulk: "Bulk",
      cycleTrack: "Cycle tracking", trainDays: "Training days / week", language: "Language",
      appleHealth: "Apple Health", whoop: "WHOOP", strava: "Strava", connected: "connected", connect: "connect",
      signOut: "Sign out", version: "Version",
      welcome: "Welcome to", obStart: "Let's set up your profile in 4 quick steps.",
      obName: "What's your name?", obGoalQ: "What's your goal?",
      obBodyQ: "Your basics", obDaysQ: "How many days do you train?",
      obWeightNow: "Current weight", obWeightGoal: "Goal weight",
      next: "Next", back: "Back", getStarted: "Start using FitTrack",
      step: (a, b) => `Step ${a} of ${b}`, daysWeek: "days / week",
      alertsTitle: "Alerts & notices", alertImbalanceTitle: "Possible muscle imbalance",
      alertImbalanceBody: "This week you loaded back and legs hard, but core and arms stayed low. Balancing volume lowers injury risk.",
      moreExercises: {
        incline: "Incline press", lateral: "Lateral raise", pushdown: "Triceps pushdown",
        facepull: "Face pull", curl: "Biceps curl", rdl: "Romanian deadlift",
        legpress: "Leg press", legcurl: "Leg curl", calf: "Calf raise",
      },
    },
  };

  ["es", "en"].forEach((lng) => {
    Object.assign(window.I18N[lng], more[lng]);
    Object.assign(window.I18N[lng].exercises, more[lng].moreExercises);
  });
})();
