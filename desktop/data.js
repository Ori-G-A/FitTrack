/* ============================================================
   FitTrack — shared demo dataset + ES/EN strings
   Plain JS. Attaches window.FT (data) and window.I18N (strings).
   Realistic numbers for a lean-bulk-to-cut athlete.
   ============================================================ */
(function () {
  "use strict";

  const round1 = (x) => Math.round(x * 10) / 10;
  const isoMinus = (n) => {
    const d = new Date("2026-06-09T00:00:00");
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  /* ---- weight series: 56 days, slow cut 76.9 -> 74.1 ---- */
  const N = 56;
  const startKg = 76.9;
  const slopePerDay = -0.4 / 7; // -0.4 kg/week
  const noise = [
    0.0, 0.3, -0.2, 0.1, 0.4, -0.1, 0.2, -0.3, 0.5, 0.0, -0.2, 0.3, 0.1, -0.4,
    0.2, 0.0, 0.4, -0.1, -0.3, 0.2, 0.1, 0.3, -0.2, 0.0, 0.4, -0.3, 0.1, 0.2,
    -0.1, 0.3, 0.0, -0.2, 0.4, 0.1, -0.3, 0.2, 0.0, 0.3, -0.1, 0.2, -0.4, 0.1,
    0.3, 0.0, -0.2, 0.4, 0.1, -0.1, 0.2, -0.3, 0.0, 0.3, -0.2, 0.1, 0.2, -0.1,
  ];
  const weightRaw = [];
  for (let i = 0; i < N; i++) {
    const iso = isoMinus(N - 1 - i);
    const kg = round1(startKg + slopePerDay * i + (noise[i] || 0));
    weightRaw.push({ iso, kg });
  }
  // 7-day trailing average + target line
  const weightSeries = weightRaw.map((p, i) => {
    const win = weightRaw.slice(Math.max(0, i - 6), i + 1);
    const avg = round1(win.reduce((s, x) => s + x.kg, 0) / win.length);
    const target = round1(startKg + slopePerDay * i);
    return { iso: p.iso, kg: p.kg, avg, target };
  });

  const currentAvg = weightSeries[weightSeries.length - 1].avg; // ~74.x
  const currentToday = weightRaw[weightRaw.length - 1].kg;
  const change7 = round1(
    weightRaw[weightRaw.length - 1].kg - weightRaw[weightRaw.length - 8].kg
  );

  /* ---- calories: last 14 days, target 2200 ---- */
  const kcalVals = [2180, 2260, 2090, 2240, 1980, 2520, 2310, 2150, 2200, 2080, 2330, 1990, 2410, 2120];
  const proteinVals = [148, 152, 139, 161, 128, 144, 150, 142, 158, 133, 149, 136, 155, 141];
  const kcalSeries = kcalVals.map((kcal, i) => ({
    iso: isoMinus(13 - i),
    kcal,
    protein: proteinVals[i],
    target: 2200,
  }));
  const kcalAvg = Math.round(kcalVals.reduce((a, b) => a + b, 0) / kcalVals.length);
  const proteinAvg = Math.round(proteinVals.reduce((a, b) => a + b, 0) / proteinVals.length);
  /* macro split: fat tracked ~72 g/day; carbs derived from remaining energy */
  const fatAvg = 72;
  const carbsAvg = Math.round((kcalAvg - proteinAvg * 4 - fatAvg * 9) / 4);

  /* ---- strength progression (estimated 1RM over time) ---- */
  const strength = {
    bench:    [78, 80, 80, 82, 84, 83, 86, 88, 90, 92],
    squat:    [118, 120, 124, 126, 125, 130, 132, 135, 138, 142],
    deadlift: [150, 152, 156, 158, 162, 160, 166, 168, 170, 174],
    ohp:      [52, 54, 54, 56, 58, 57, 60, 61, 62, 64],
  };
  const strengthDates = [];
  for (let i = 9; i >= 0; i--) strengthDates.push(isoMinus(i * 6 + 2));

  /* ---- personal records ---- */
  const prs = [
    { key: "deadlift", kg: 174, recent: true },
    { key: "squat", kg: 142, recent: true },
    { key: "bench", kg: 92, recent: false },
    { key: "ohp", kg: 64, recent: false },
    { key: "row", kg: 88, recent: false },
    { key: "pullup", kg: 28, recent: false },
  ];

  /* ---- weekly muscle volume (kg lifted, last 7 days) ---- */
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

  /* ---- training log (recent sessions for the activity strip) ---- */
  const sessions = [
    { iso: isoMinus(0), type: "push", min: 64, vol: 8420 },
    { iso: isoMinus(2), type: "pull", min: 71, vol: 9210 },
    { iso: isoMinus(3), type: "legs", min: 58, vol: 11240 },
    { iso: isoMinus(5), type: "push", min: 66, vol: 8010 },
    { iso: isoMinus(6), type: "pull", min: 62, vol: 8880 },
  ];

  /* ---- 8-week consistency grid (1 = trained) ---- */
  const weekGrid = [
    [1, 0, 1, 1, 0, 1, 0],
    [1, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 1, 0, 1, 1],
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 0, 0, 0],
  ];

  /* ---- 26-week GitHub-style training heatmap, ends today ---- */
  const dowMon = (iso) => (new Date(iso + "T00:00:00").getDay() + 6) % 7; // 0=Mon
  const todayDow = dowMon(isoMinus(0));
  const heatDaysN = 25 * 7 + todayDow + 1; // full weeks + current partial week
  const srand = (i) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const heatmap = [];
  for (let i = 0; i < heatDaysN; i++) {
    const iso = isoMinus(heatDaysN - 1 - i);
    const dw = dowMon(iso);
    const r = srand(i), r2 = srand(i + 999);
    // training likelihood by weekday: push/pull/legs split, Sundays mostly rest
    const pTrain = [0.86, 0.78, 0.5, 0.84, 0.74, 0.45, 0.12][dw];
    let lvl = 0;
    if (r < pTrain) lvl = 1 + Math.min(3, Math.floor(r2 * 3.4));
    heatmap.push({ iso, lvl, dw });
  }
  // last 7 days mirror the session log (0 = rest)
  const lastLvls = [3, 0, 3, 4, 0, 2, 3];
  lastLvls.forEach((lvl, off) => {
    const idx = heatmap.length - 1 - off;
    if (idx >= 0) heatmap[idx].lvl = lvl;
  });
  const heatWeekCounts = [];
  heatmap.forEach((d) => {
    if (d.dw === 0 || heatWeekCounts.length === 0) heatWeekCounts.push(0);
    if (d.lvl > 0) heatWeekCounts[heatWeekCounts.length - 1]++;
  });
  const heatStats = {
    total: heatmap.filter((d) => d.lvl > 0).length,
    weeksOn: heatWeekCounts.filter((c) => c >= 4).length,
    weeksTotal: heatWeekCounts.length,
    bestWeek: Math.max.apply(null, heatWeekCounts),
  };

  window.FT = {
    profile: { name: "Ana", goalKg: 72, startKg: 76.9 },
    weightSeries,
    currentAvg,
    currentToday,
    change7,
    kcalSeries,
    kcalAvg,
    kcalTarget: 2200,
    proteinAvg,
    proteinTarget: 150,
    macros: {
      protein: { avg: proteinAvg, target: 150 },
      carbs: { avg: carbsAvg, target: 240 },
      fat: { avg: fatAvg, target: 70 },
    },
    maintenance: 2460,
    trainingDays7: 4,
    nutDays7: 7,
    avgMin: 64,
    streak: 18,
    strength,
    strengthDates,
    prs,
    muscleVolume,
    sessions,
    weekGrid,
    heatmap,
    heatStats,
    projection: { weeks: 5, dateES: "14 de julio de 2026", dateEN: "July 14, 2026" },
    cycle: { phaseKey: "follicular", day: 9, daysToNext: 19 },
  };

  /* ============================================================
     i18n
     ============================================================ */
  window.I18N = {
    es: {
      tagline: "tu progreso, medido",
      nav: { train: "Entrenar", body: "Cuerpo", nutrition: "Nutrición", dashboard: "Resumen", settings: "Ajustes" },
      greetingAm: "Buenos días", greetingPm: "Buenas tardes",
      overview: "Resumen",
      alerts: "Alertas",
      seeAll: "ver todo",
      // stats
      weightAvg: "Peso · media 7d",
      change7: "Cambio 7 días",
      maintenance: "Mantenimiento",
      consistency: "Constancia",
      today: "hoy",
      perWeek: "/sem",
      trendReal: "tendencia real",
      ofData: (d) => `de ${d} días de datos`,
      dietDays: (d) => `${d} días con dieta`,
      perSession: "min/sesión",
      // charts
      weightTrend: "Peso y tendencia",
      activity: "Actividad",
      last8wk: "últimas 8 semanas",
      calories: "Calorías",
      last14d: "últimos 14 días",
      strengthProg: "Progresión de fuerza",
      est1rm: "1RM estimado",
      records: "Récords personales",
      muscleVol: "Volumen por músculo",
      thisWeek: "esta semana",
      real: "real", average: "media", target: "objetivo", goal: "meta",
      avgLabel: "media", targetLabel: "objetivo",
      newPR: "nuevo récord",
      kg: "kg", kcal: "kcal",
      // projection / cycle
      projection: "Proyección a tu meta",
      projectionBody: (kg, date, wk) =>
        `A tu ritmo actual llegarías a ${kg} kg alrededor del ${date} (~${wk} semanas).`,
      cycle: (phase, day) => `Ciclo · fase ${phase} · día ${day}`,
      cycleBody: (d) => `Buena ventana de energía y fuerza — momento ideal para buscar récords. Próximo periodo en ~${d} días.`,
      // alert bodies
      alertPR: "Tu 1RM estimado en peso muerto subió a 174 kg. La sobrecarga progresiva funciona.",
      alertWeight: "Tendencia −0,40 kg/sem, exactamente en tu objetivo. Mantén el rumbo.",
      alertProtein: "Media de 144 g/día esta semana frente a tu meta de 150 g. Casi en objetivo.",
      alertPRtitle: "¡Nuevo récord en peso muerto!",
      alertWeightTitle: "Peso en línea con tu objetivo",
      alertProteinTitle: "Proteína ligeramente baja",
      // muscles
      muscles: { back: "Espalda", quads: "Cuádriceps", chest: "Pecho", hamstrings: "Femoral", shoulders: "Hombros", glutes: "Glúteos", biceps: "Bíceps", triceps: "Tríceps", core: "Core" },
      // exercises
      exercises: { bench: "Press banca", squat: "Sentadilla", deadlift: "Peso muerto", ohp: "Press militar", row: "Remo", pullup: "Dominadas lastradas" },
      phases: { follicular: "folicular" },
      days: ["L", "M", "X", "J", "V", "S", "D"],
      streakLabel: "días de racha",
      sessionsWk: "sesiones / semana",
      monthsShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
      last26wk: "últimas 26 semanas",
      less: "menos", more: "más",
      streakTitle: "Racha",
      trained: "entreno", rest: "descanso",
      heatSessions: (n) => `${n} sesiones en 26 semanas`,
      heatWeeksOn: (a, b) => `${a}/${b} semanas con ≥4 sesiones`,
      bestWeekLabel: (n) => `mejor semana · ${n} sesiones`,
      macrosTitle: "Macros",
      proteinLabel: "Proteína", carbsLabel: "Carbohidratos", fatLabel: "Grasa",
      avg14: "media · 14 días",
      kcalLine: (a, b) => `energía · media ${a} kcal · objetivo ${b}`,
      liftShort: { bench: "Banca", squat: "Sentadilla", deadlift: "P. muerto", ohp: "Militar" },
      vsStart: "% vs inicio",
    },
    en: {
      tagline: "your progress, measured",
      nav: { train: "Train", body: "Body", nutrition: "Nutrition", dashboard: "Overview", settings: "Settings" },
      greetingAm: "Good morning", greetingPm: "Good afternoon",
      overview: "Overview",
      alerts: "Alerts",
      seeAll: "see all",
      weightAvg: "Weight · 7d avg",
      change7: "7-day change",
      maintenance: "Maintenance",
      consistency: "Consistency",
      today: "today",
      perWeek: "/wk",
      trendReal: "real trend",
      ofData: (d) => `from ${d} days of data`,
      dietDays: (d) => `${d} days logged`,
      perSession: "min/session",
      weightTrend: "Weight & trend",
      activity: "Activity",
      last8wk: "last 8 weeks",
      calories: "Calories",
      last14d: "last 14 days",
      strengthProg: "Strength progression",
      est1rm: "estimated 1RM",
      records: "Personal records",
      muscleVol: "Volume by muscle",
      thisWeek: "this week",
      real: "actual", average: "average", target: "target", goal: "goal",
      avgLabel: "avg", targetLabel: "target",
      newPR: "new record",
      kg: "kg", kcal: "kcal",
      projection: "Projection to your goal",
      projectionBody: (kg, date, wk) =>
        `At your current pace you'd reach ${kg} kg around ${date} (~${wk} weeks).`,
      cycle: (phase, day) => `Cycle · ${phase} phase · day ${day}`,
      cycleBody: (d) => `Strong energy window — a great time to chase records. Next period in ~${d} days.`,
      alertPR: "Your estimated deadlift 1RM rose to 174 kg. Progressive overload is working.",
      alertWeight: "Trend −0.40 kg/wk, right on your target. Hold the course.",
      alertProtein: "Averaging 144 g/day this week vs your 150 g goal. Almost there.",
      alertPRtitle: "New deadlift record!",
      alertWeightTitle: "Weight on track with your goal",
      alertProteinTitle: "Protein slightly low",
      muscles: { back: "Back", quads: "Quads", chest: "Chest", hamstrings: "Hamstrings", shoulders: "Shoulders", glutes: "Glutes", biceps: "Biceps", triceps: "Triceps", core: "Core" },
      exercises: { bench: "Bench press", squat: "Squat", deadlift: "Deadlift", ohp: "Overhead press", row: "Barbell row", pullup: "Weighted pull-ups" },
      phases: { follicular: "follicular" },
      days: ["M", "T", "W", "T", "F", "S", "S"],
      streakLabel: "day streak",
      sessionsWk: "sessions / week",
      monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      last26wk: "last 26 weeks",
      less: "less", more: "more",
      streakTitle: "Streak",
      trained: "trained", rest: "rest",
      heatSessions: (n) => `${n} sessions in 26 weeks`,
      heatWeeksOn: (a, b) => `${a}/${b} weeks with ≥4 sessions`,
      bestWeekLabel: (n) => `best week · ${n} sessions`,
      macrosTitle: "Macros",
      proteinLabel: "Protein", carbsLabel: "Carbs", fatLabel: "Fat",
      avg14: "avg · 14 days",
      kcalLine: (a, b) => `energy · avg ${a} kcal · target ${b}`,
      liftShort: { bench: "Bench", squat: "Squat", deadlift: "Deadlift", ohp: "OHP" },
      vsStart: "% vs start",
    },
  };
})();
