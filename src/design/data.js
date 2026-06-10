/* FitTrack — shared demo dataset + ES/EN strings */

const round1 = (x) => Math.round(x * 10) / 10;
const isoMinus = (n) => {
  const d = new Date("2026-06-09T00:00:00");
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const N = 56;
const startKg = 76.9;
const slopePerDay = -0.4 / 7;
const noise = [
  0.0,0.3,-0.2,0.1,0.4,-0.1,0.2,-0.3,0.5,0.0,-0.2,0.3,0.1,-0.4,
  0.2,0.0,0.4,-0.1,-0.3,0.2,0.1,0.3,-0.2,0.0,0.4,-0.3,0.1,0.2,
  -0.1,0.3,0.0,-0.2,0.4,0.1,-0.3,0.2,0.0,0.3,-0.1,0.2,-0.4,0.1,
  0.3,0.0,-0.2,0.4,0.1,-0.1,0.2,-0.3,0.0,0.3,-0.2,0.1,0.2,-0.1,
];
const weightRaw = [];
for (let i = 0; i < N; i++) {
  const iso = isoMinus(N - 1 - i);
  const kg = round1(startKg + slopePerDay * i + (noise[i] || 0));
  weightRaw.push({ iso, kg });
}
const weightSeries = weightRaw.map((p, i) => {
  const win = weightRaw.slice(Math.max(0, i - 6), i + 1);
  const avg = round1(win.reduce((s, x) => s + x.kg, 0) / win.length);
  const target = round1(startKg + slopePerDay * i);
  return { iso: p.iso, kg: p.kg, avg, target };
});
const currentAvg = weightSeries[weightSeries.length - 1].avg;
const currentToday = weightRaw[weightRaw.length - 1].kg;
const change7 = round1(weightRaw[weightRaw.length - 1].kg - weightRaw[weightRaw.length - 8].kg);

const kcalVals = [2180,2260,2090,2240,1980,2520,2310,2150,2200,2080,2330,1990,2410,2120];
const proteinVals = [148,152,139,161,128,144,150,142,158,133,149,136,155,141];
const kcalSeries = kcalVals.map((kcal, i) => ({ iso: isoMinus(13 - i), kcal, protein: proteinVals[i], target: 2200 }));
const kcalAvg = Math.round(kcalVals.reduce((a, b) => a + b, 0) / kcalVals.length);
const proteinAvg = Math.round(proteinVals.reduce((a, b) => a + b, 0) / proteinVals.length);
const fatAvg = 72;
const carbsAvg = Math.round((kcalAvg - proteinAvg * 4 - fatAvg * 9) / 4);

const strength = {
  bench:    [78,80,80,82,84,83,86,88,90,92],
  squat:    [118,120,124,126,125,130,132,135,138,142],
  deadlift: [150,152,156,158,162,160,166,168,170,174],
  ohp:      [52,54,54,56,58,57,60,61,62,64],
};
const strengthDates = [];
for (let i = 9; i >= 0; i--) strengthDates.push(isoMinus(i * 6 + 2));

const prs = [
  { key: "deadlift", kg: 174, recent: true },
  { key: "squat", kg: 142, recent: true },
  { key: "bench", kg: 92, recent: false },
  { key: "ohp", kg: 64, recent: false },
  { key: "row", kg: 88, recent: false },
  { key: "pullup", kg: 28, recent: false },
];

const muscleVolume = [
  { key: "back", vol: 9840, hue: 198 },
  { key: "quads", vol: 9120, hue: 84 },
  { key: "chest", vol: 7460, hue: 24 },
  { key: "hamstrings", vol: 6230, hue: 152 },
  { key: "shoulders", vol: 4880, hue: 286 },
  { key: "glutes", vol: 4310, hue: 8 },
  { key: "biceps", vol: 2940, hue: 330 },
  { key: "triceps", vol: 2610, hue: 264 },
  { key: "core", vol: 1780, hue: 48 },
];

const sessions = [
  { iso: isoMinus(0), type: "push", min: 64, vol: 8420 },
  { iso: isoMinus(2), type: "pull", min: 71, vol: 9210 },
  { iso: isoMinus(3), type: "legs", min: 58, vol: 11240 },
  { iso: isoMinus(5), type: "push", min: 66, vol: 8010 },
  { iso: isoMinus(6), type: "pull", min: 62, vol: 8880 },
];

const weekGrid = [
  [1,0,1,1,0,1,0],[1,1,0,1,0,1,0],[1,0,1,1,0,1,1],[0,1,1,0,1,1,0],
  [1,1,0,1,1,0,1],[1,0,1,1,0,1,0],[1,1,1,0,1,1,0],[1,0,1,1,0,0,0],
];

const dowMon = (iso) => (new Date(iso + "T00:00:00").getDay() + 6) % 7;
const todayDow = dowMon(isoMinus(0));
const heatDaysN = 25 * 7 + todayDow + 1;
const srand = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const heatmap = [];
for (let i = 0; i < heatDaysN; i++) {
  const iso = isoMinus(heatDaysN - 1 - i);
  const dw = dowMon(iso);
  const r = srand(i), r2 = srand(i + 999);
  const pTrain = [0.86,0.78,0.5,0.84,0.74,0.45,0.12][dw];
  let lvl = 0;
  if (r < pTrain) lvl = 1 + Math.min(3, Math.floor(r2 * 3.4));
  heatmap.push({ iso, lvl, dw });
}
const lastLvls = [3,0,3,4,0,2,3];
lastLvls.forEach((lvl, off) => { const idx = heatmap.length - 1 - off; if (idx >= 0) heatmap[idx].lvl = lvl; });
const heatWeekCounts = [];
heatmap.forEach((d) => { if (d.dw === 0 || heatWeekCounts.length === 0) heatWeekCounts.push(0); if (d.lvl > 0) heatWeekCounts[heatWeekCounts.length - 1]++; });
const heatStats = {
  total: heatmap.filter((d) => d.lvl > 0).length,
  weeksOn: heatWeekCounts.filter((c) => c >= 4).length,
  weeksTotal: heatWeekCounts.length,
  bestWeek: Math.max(...heatWeekCounts),
};

export const FT = {
  profile: { name: "Ana", goalKg: 72, startKg: 76.9 },
  weightSeries, currentAvg, currentToday, change7,
  kcalSeries, kcalAvg, kcalTarget: 2200,
  proteinAvg, proteinTarget: 150,
  macros: {
    protein: { avg: proteinAvg, target: 150 },
    carbs: { avg: carbsAvg, target: 240 },
    fat: { avg: fatAvg, target: 70 },
  },
  maintenance: 2460,
  trainingDays7: 4, nutDays7: 7, avgMin: 64, streak: 18,
  strength, strengthDates, prs, muscleVolume, sessions, weekGrid,
  heatmap, heatStats,
  projection: { weeks: 5, dateES: "14 de julio de 2026", dateEN: "July 14, 2026" },
  cycle: { phaseKey: "follicular", day: 9, daysToNext: 19 },
};

export const I18N = {
  es: {
    tagline: "tu progreso, medido",
    nav: { train: "Entrenar", body: "Cuerpo", nutrition: "Nutrición", dashboard: "Resumen", settings: "Ajustes" },
    greetingAm: "Buenos días", greetingPm: "Buenas tardes",
    overview: "Resumen", alerts: "Alertas", seeAll: "ver todo",
    weightAvg: "Peso · media 7d", change7: "Cambio 7 días", maintenance: "Mantenimiento",
    consistency: "Constancia", today: "hoy", perWeek: "/sem", trendReal: "tendencia real",
    ofData: (d) => `de ${d} días de datos`, dietDays: (d) => `${d} días con dieta`,
    perSession: "min/sesión", weightTrend: "Peso y tendencia", activity: "Actividad",
    last8wk: "últimas 8 semanas", calories: "Calorías", last14d: "últimos 14 días",
    strengthProg: "Progresión de fuerza", est1rm: "1RM estimado", records: "Récords personales",
    muscleVol: "Volumen por músculo", thisWeek: "esta semana",
    real: "real", average: "media", target: "objetivo", goal: "meta",
    avgLabel: "media", targetLabel: "objetivo", newPR: "nuevo récord", kg: "kg", kcal: "kcal",
    projection: "Proyección a tu meta",
    projectionBody: (kg, date, wk) => `A tu ritmo actual llegarías a ${kg} kg alrededor del ${date} (~${wk} semanas).`,
    cycle: (phase, day) => `Ciclo · fase ${phase} · día ${day}`,
    cycleBody: (d) => `Buena ventana de energía y fuerza — momento ideal para buscar récords. Próximo periodo en ~${d} días.`,
    alertPR: "Tu 1RM estimado en peso muerto subió a 174 kg. La sobrecarga progresiva funciona.",
    alertWeight: "Tendencia −0,40 kg/sem, exactamente en tu objetivo. Mantén el rumbo.",
    alertProtein: "Media de 144 g/día esta semana frente a tu meta de 150 g. Casi en objetivo.",
    alertPRtitle: "¡Nuevo récord en peso muerto!", alertWeightTitle: "Peso en línea con tu objetivo",
    alertProteinTitle: "Proteína ligeramente baja",
    muscles: { back: "Espalda", quads: "Cuádriceps", chest: "Pecho", hamstrings: "Femoral", shoulders: "Hombros", glutes: "Glúteos", biceps: "Bíceps", triceps: "Tríceps", core: "Core" },
    exercises: { bench: "Press banca", squat: "Sentadilla", deadlift: "Peso muerto", ohp: "Press militar", row: "Remo", pullup: "Dominadas lastradas" },
    phases: { follicular: "folicular" },
    days: ["L","M","X","J","V","S","D"],
    streakLabel: "días de racha", sessionsWk: "sesiones / semana",
    monthsShort: ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],
    last26wk: "últimas 26 semanas", less: "menos", more: "más",
    streakTitle: "Racha", trained: "entreno", rest: "descanso",
    heatSessions: (n) => `${n} sesiones en 26 semanas`,
    heatWeeksOn: (a, b) => `${a}/${b} semanas con ≥4 sesiones`,
    bestWeekLabel: (n) => `mejor semana · ${n} sesiones`,
    macrosTitle: "Macros", proteinLabel: "Proteína", carbsLabel: "Carbohidratos", fatLabel: "Grasa",
    avg14: "media · 14 días",
    kcalLine: (a, b) => `energía · media ${a} kcal · objetivo ${b}`,
    liftShort: { bench: "Banca", squat: "Sentadilla", deadlift: "P. muerto", ohp: "Militar" },
    vsStart: "% vs inicio",
    // app-specific
    tabTrain: "Entrenar", tabBody: "Cuerpo", tabHome: "Resumen", tabNutri: "Nutri", tabSettings: "Ajustes",
    add: "Añadir", done: "Hecho", cancel: "Cancelar", save: "Guardar", start: "Empezar",
    finish: "Terminar", edit: "Editar", week: "Semana", all: "Todo",
    reps: "reps", min: "min", sets: "series", cm: "cm",
    routinesTitle: "Rutinas", historyTitle: "Historial", startWorkout: "Empezar entreno",
    continueWorkout: "Continuar entreno", nextUp: "Toca hoy",
    exercisesN: (n) => `${n} ejercicios`,
    lastDid: "última vez", volume: "volumen", logSet: "Registrar serie",
    restTimer: "Descanso", skipRest: "Saltar", addSet: "Añadir serie",
    setN: (n) => `Serie ${n}`, prev: "anterior",
    finishWorkout: "Terminar entreno", workoutDone: "¡Entreno completado!",
    summary: "Resumen", totalVol: "volumen total", duration: "duración",
    bodyTitle: "Cuerpo", weightTab: "Peso", measuresTab: "Medidas", photosTab: "Fotos",
    logWeight: "Registrar peso", current: "actual", goalWeight: "meta",
    toGoal: (kg) => `${kg} kg para la meta`, measurements: "Medidas corporales",
    addPhoto: "Añadir foto", compare: "Comparar", dropPhoto: "tu foto de progreso",
    waist: "Cintura", hips: "Cadera", arm: "Brazo", chest: "Pecho", thigh: "Muslo",
    nutriTitle: "Nutrición", remaining: "restante", eaten: "consumido", goalKcal: "objetivo",
    breakfast: "Desayuno", lunch: "Comida", dinner: "Cena", snacks: "Snacks",
    addFood: "Añadir alimento", quickAdd: "Añadido rápido", searchFood: "Buscar alimento",
    perServing: "por ración", emptyMeal: "Sin alimentos aún",
    protein: "Proteína", carbs: "Carbos", fat: "Grasa",
    settingsTitle: "Ajustes", profile: "Perfil", goalsSec: "Objetivos", unitsSec: "Unidades",
    integrations: "Integraciones", account: "Cuenta", name: "Nombre", age: "Edad", height: "Altura",
    metric: "Métrico", imperial: "Imperial",
    goalCut: "Déficit (cut)", goalMaintain: "Mantener", goalBulk: "Volumen",
    cycleTrack: "Seguir ciclo", trainDays: "Días de entreno / semana", language: "Idioma",
    appleHealth: "Apple Health", whoop: "WHOOP", strava: "Strava",
    connected: "conectado", connect: "conectar",
    signOut: "Cerrar sesión", version: "Versión",
    welcome: "Bienvenida a", obStart: "Vamos a configurar tu perfil en 4 pasos rápidos.",
    obName: "¿Cómo te llamas?", obGoalQ: "¿Cuál es tu objetivo?",
    obBodyQ: "Tus datos básicos", obDaysQ: "¿Cuántos días entrenas?",
    obWeightNow: "Peso actual", obWeightGoal: "Peso objetivo",
    next: "Siguiente", back: "Atrás", getStarted: "Empezar a usar FitTrack",
    step: (a, b) => `Paso ${a} de ${b}`, daysWeek: "días / semana",
    alertsTitle: "Alertas y avisos", alertImbalanceTitle: "Posible descompensación muscular",
    alertImbalanceBody: "Esta semana cargaste fuerte espalda y pierna, pero core y brazos quedaron bajos. Equilibrar el volumen reduce el riesgo de lesión.",
    moreExercises: {
      incline: "Press inclinado", lateral: "Elevaciones lat.", pushdown: "Extensión tríceps",
      facepull: "Face pull", curl: "Curl bíceps", rdl: "Peso muerto rumano",
      legpress: "Prensa", legcurl: "Curl femoral", calf: "Gemelo",
    },
  },
  en: {
    tagline: "your progress, measured",
    nav: { train: "Train", body: "Body", nutrition: "Nutrition", dashboard: "Overview", settings: "Settings" },
    greetingAm: "Good morning", greetingPm: "Good afternoon",
    overview: "Overview", alerts: "Alerts", seeAll: "see all",
    weightAvg: "Weight · 7d avg", change7: "7-day change", maintenance: "Maintenance",
    consistency: "Consistency", today: "today", perWeek: "/wk", trendReal: "real trend",
    ofData: (d) => `from ${d} days of data`, dietDays: (d) => `${d} days logged`,
    perSession: "min/session", weightTrend: "Weight & trend", activity: "Activity",
    last8wk: "last 8 weeks", calories: "Calories", last14d: "last 14 days",
    strengthProg: "Strength progression", est1rm: "estimated 1RM", records: "Personal records",
    muscleVol: "Volume by muscle", thisWeek: "this week",
    real: "actual", average: "average", target: "target", goal: "goal",
    avgLabel: "avg", targetLabel: "target", newPR: "new record", kg: "kg", kcal: "kcal",
    projection: "Projection to your goal",
    projectionBody: (kg, date, wk) => `At your current pace you'd reach ${kg} kg around ${date} (~${wk} weeks).`,
    cycle: (phase, day) => `Cycle · ${phase} phase · day ${day}`,
    cycleBody: (d) => `Strong energy window — a great time to chase records. Next period in ~${d} days.`,
    alertPR: "Your estimated deadlift 1RM rose to 174 kg. Progressive overload is working.",
    alertWeight: "Trend −0.40 kg/wk, right on your target. Hold the course.",
    alertProtein: "Averaging 144 g/day this week vs your 150 g goal. Almost there.",
    alertPRtitle: "New deadlift record!", alertWeightTitle: "Weight on track with your goal",
    alertProteinTitle: "Protein slightly low",
    muscles: { back: "Back", quads: "Quads", chest: "Chest", hamstrings: "Hamstrings", shoulders: "Shoulders", glutes: "Glutes", biceps: "Biceps", triceps: "Triceps", core: "Core" },
    exercises: { bench: "Bench press", squat: "Squat", deadlift: "Deadlift", ohp: "Overhead press", row: "Barbell row", pullup: "Weighted pull-ups" },
    phases: { follicular: "follicular" },
    days: ["M","T","W","T","F","S","S"],
    streakLabel: "day streak", sessionsWk: "sessions / week",
    monthsShort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    last26wk: "last 26 weeks", less: "less", more: "more",
    streakTitle: "Streak", trained: "trained", rest: "rest",
    heatSessions: (n) => `${n} sessions in 26 weeks`,
    heatWeeksOn: (a, b) => `${a}/${b} weeks with ≥4 sessions`,
    bestWeekLabel: (n) => `best week · ${n} sessions`,
    macrosTitle: "Macros", proteinLabel: "Protein", carbsLabel: "Carbs", fatLabel: "Fat",
    avg14: "avg · 14 days",
    kcalLine: (a, b) => `energy · avg ${a} kcal · target ${b}`,
    liftShort: { bench: "Bench", squat: "Squat", deadlift: "Deadlift", ohp: "OHP" },
    vsStart: "% vs start",
    tabTrain: "Train", tabBody: "Body", tabHome: "Overview", tabNutri: "Food", tabSettings: "Settings",
    add: "Add", done: "Done", cancel: "Cancel", save: "Save", start: "Start",
    finish: "Finish", edit: "Edit", week: "Week", all: "All",
    reps: "reps", min: "min", sets: "sets", cm: "cm",
    routinesTitle: "Routines", historyTitle: "History", startWorkout: "Start workout",
    continueWorkout: "Resume workout", nextUp: "Up next",
    exercisesN: (n) => `${n} exercises`,
    lastDid: "last time", volume: "volume", logSet: "Log set",
    restTimer: "Rest", skipRest: "Skip", addSet: "Add set",
    setN: (n) => `Set ${n}`, prev: "prev",
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
    metric: "Metric", imperial: "Imperial",
    goalCut: "Cut (deficit)", goalMaintain: "Maintain", goalBulk: "Bulk",
    cycleTrack: "Cycle tracking", trainDays: "Training days / week", language: "Language",
    appleHealth: "Apple Health", whoop: "WHOOP", strava: "Strava",
    connected: "connected", connect: "connect",
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

// Merge moreExercises into exercises
["es", "en"].forEach((lng) => {
  Object.assign(I18N[lng].exercises, I18N[lng].moreExercises);
});
