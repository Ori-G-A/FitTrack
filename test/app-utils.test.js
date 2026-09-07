import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  applyAdjustments,
  authUserChanged,
  dayFeed,
  daysBetween,
  loadProgressHighlight,
  localISO,
  lutealRetentionKg,
  matchedLoadRpeTrend,
  mergePhotoUrls,
  migrateWorkouts,
  mondayOf,
  nextSetAdvice,
  parseRpeTarget,
  planCompliance,
  planWeek,
  proteinAdherence,
  readThemePref,
  resolveTheme,
  searchFeed,
  selectFreshRecords,
  slopePerDay,
  stepsToday,
  validateBackup,
  weekNumber,
  weightTrendHighlight,
} from "../src/app-utils.js";
import { alertMetrics, buildAlerts } from "../src/alerts.js";
import { PROTEIN_CONFIG, distributeProtein } from "../src/fase1Config.js";

const DEFAULT_GOALS = { kcalTarget: 2200, proteinTarget: 150, autoMacros: false };

test("localISO uses local calendar fields", () => {
  assert.equal(localISO(new Date(2026, 5, 14, 23, 30)), "2026-06-14");
});

test("authUserChanged ignores token refreshes for the same user", () => {
  assert.equal(authUserChanged("user-1", "user-1"), false);
  assert.equal(authUserChanged("user-1", "user-2"), true);
  assert.equal(authUserChanged("user-1", null), true);
});

test("fresh record alerts expire after three days and are capped", () => {
  const records = [
    { name: "old", date: "2026-07-13", best: 90 },
    { name: "today-low", date: "2026-07-17", best: 40 },
    { name: "three-days", date: "2026-07-14", best: 60 },
    { name: "today-high", date: "2026-07-17", best: 80 },
    { name: "yesterday", date: "2026-07-16", best: 70 },
  ];

  assert.deepEqual(
    selectFreshRecords(records, "2026-07-17").map((record) => record.name),
    ["today-high", "today-low", "yesterday"],
  );
});

test("mergePhotoUrls updates existing photos without restoring deleted ones", () => {
  const current = [{ id: "kept", storagePath: "user/kept.jpg", signedUrl: "old" }];
  const refreshed = [
    { id: "kept", storagePath: "user/kept.jpg", signedUrl: "new" },
    { id: "deleted", storagePath: "user/deleted.jpg", signedUrl: "new-deleted" },
  ];
  assert.deepEqual(mergePhotoUrls(current, refreshed), [
    { id: "kept", storagePath: "user/kept.jpg", signedUrl: "new" },
  ]);
  assert.equal(mergePhotoUrls(current, [{ ...current[0] }]), current);
});

test("date helpers handle month boundaries", () => {
  assert.equal(addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(daysBetween("2026-01-31", "2026-02-02"), 2);
});

test("slopePerDay computes a linear trend", () => {
  assert.equal(slopePerDay([{ x: 0, y: 10 }, { x: 2, y: 14 }, { x: 4, y: 18 }]), 2);
  assert.equal(slopePerDay([{ x: 1, y: 5 }]), null);
});

test("validateBackup rejects malformed collections and fills goal defaults", () => {
  assert.throws(() => validateBackup({ weights: [{ date: "not-a-date" }] }, DEFAULT_GOALS), /fechas/i);
  const backup = validateBackup({ goals: { kcalTarget: 1900 } }, DEFAULT_GOALS);
  assert.deepEqual(backup.goals, { kcalTarget: 1900, proteinTarget: 150, autoMacros: false });
});

test("validateBackup accepts image data and workout structure", () => {
  const backup = validateBackup({
    workouts: [{ date: "2026-06-14", exercises: [{ sets: [] }] }],
    menstrualLogs: [{ date: "2026-06-14", bleedingLevel: "none" }],
    photos: [{ date: "2026-06-14", dataUrl: "data:image/jpeg;base64,AA==" }],
  }, DEFAULT_GOALS);
  assert.equal(backup.workouts.length, 1);
  assert.equal(backup.menstrualLogs.length, 1);
  assert.equal(backup.photos.length, 1);
});

// Serie sintética: peso base constante, +bump kg los días marcados como lútea tardía.
const cycleWeights = ({ days = 24, base = 60, bump = 1, slopePerDay: drift = 0 } = {}) => {
  const phases = [], weights = [];
  for (let i = 0; i < days; i += 1) {
    const isLuteal = i % 6 >= 4;                       // 2 de cada 6 días
    const date = addDays("2026-01-01", i);
    phases.push([date, isLuteal ? "luteal_late" : "follicular_mid_late"]);
    weights.push({ date, kg: base + drift * i + (isLuteal ? bump : 0) });
  }
  return { weights, phaseOf: (date) => new Map(phases).get(date) };
};

test("lutealRetentionKg recovers the retention offset", () => {
  const { weights, phaseOf } = cycleWeights({ bump: 1.2 });
  const result = lutealRetentionKg(weights, phaseOf);
  assert.equal(result.kg, 1.2);
  assert.equal(result.capped, false);
  assert.equal(result.lutealDays, 8);
  assert.equal(result.follicularDays, 16);
});

test("lutealRetentionKg detrends so a cut is not read as less retention", () => {
  // bajando 100 g/día: sin detrendar, la fase que cae más tarde arrastra la media
  const { weights, phaseOf } = cycleWeights({ bump: 1.2, slopePerDay: -0.1 });
  assert.equal(lutealRetentionKg(weights, phaseOf).kg, 1.2);
});

test("lutealRetentionKg ignores noise, thin phases and caps implausible values", () => {
  assert.equal(lutealRetentionKg(cycleWeights({ bump: 0.1 }).weights, cycleWeights({ bump: 0.1 }).phaseOf), null);
  const thin = cycleWeights({ days: 8, bump: 1 });      // solo 2 días de lútea
  assert.equal(lutealRetentionKg(thin.weights, thin.phaseOf), null);
  const wild = cycleWeights({ bump: 4 });
  const capped = lutealRetentionKg(wild.weights, wild.phaseOf);
  assert.equal(capped.kg, 2.5);
  assert.equal(capped.capped, true);
});

test("lutealRetentionKg returns null when weight loss looks like the luteal phase is lighter", () => {
  const { weights, phaseOf } = cycleWeights({ bump: -1 });
  assert.equal(lutealRetentionKg(weights, phaseOf), null);
});

const workoutAt = (date, rpe, kg = 20, reps = 10, name = "Sentadilla goblet") => ({
  date,
  exercises: [{ name, sets: [{ kg, reps, rpe }] }],
});

test("matchedLoadRpeTrend detects rising RPE at equal load as fatigue", () => {
  const result = matchedLoadRpeTrend([
    workoutAt("2026-07-01", 7),
    workoutAt("2026-07-03", 7.5),
    workoutAt("2026-07-06", 8.5),
  ]);
  assert.deepEqual(result.fatigue, { name: "Sentadilla", kg: 20, reps: 10, from: 7, to: 8.5 });
  assert.equal(result.fatigueCount, 1);
  assert.equal(result.progress, null);
});

test("matchedLoadRpeTrend counts distinct fatigued exercises, not combos", () => {
  const twoLifts = (date, rpeSquat, rpeRow) => ({
    date,
    exercises: [
      { name: "Sentadilla goblet", sets: [{ kg: 20, reps: 10, rpe: rpeSquat }, { kg: 24, reps: 8, rpe: rpeSquat }] },
      { name: "Remo con mancuerna", sets: [{ kg: 12, reps: 12, rpe: rpeRow }] },
    ],
  });
  const result = matchedLoadRpeTrend([
    twoLifts("2026-07-01", 7, 7),
    twoLifts("2026-07-03", 7.5, 7.5),
    twoLifts("2026-07-06", 8.5, 8.5),
  ]);
  // la sentadilla dispara en dos combos (20×10 y 24×8) pero cuenta una sola vez
  assert.equal(result.fatigueCount, 2);
});

test("matchedLoadRpeTrend detects falling RPE at equal load as progress", () => {
  const result = matchedLoadRpeTrend([
    workoutAt("2026-07-01", 8.5),
    workoutAt("2026-07-03", 8),
    workoutAt("2026-07-06", 7),
  ]);
  assert.equal(result.fatigue, null);
  assert.deepEqual(result.progress, { name: "Sentadilla", kg: 20, reps: 10, from: 8.5, to: 7 });
});

test("matchedLoadRpeTrend ignores noise, short streaks and mismatched loads", () => {
  const NONE = { fatigue: null, fatigueCount: 0, progress: null };
  // salto total <1 punto = ruido
  assert.deepEqual(matchedLoadRpeTrend([
    workoutAt("2026-07-01", 7), workoutAt("2026-07-03", 7.2), workoutAt("2026-07-06", 7.5),
  ]), NONE);
  // solo 2 sesiones a igual carga (la tercera cambia el kg)
  assert.deepEqual(matchedLoadRpeTrend([
    workoutAt("2026-07-01", 7), workoutAt("2026-07-03", 8), workoutAt("2026-07-06", 8.5, 22.5),
  ]), NONE);
  // bajada que termina arriba de RPE 8 no sugiere subir carga
  assert.deepEqual(matchedLoadRpeTrend([
    workoutAt("2026-07-01", 10), workoutAt("2026-07-03", 9.5), workoutAt("2026-07-06", 8.5),
  ]), NONE);
  // sets sin RPE no cuentan
  assert.deepEqual(matchedLoadRpeTrend([
    workoutAt("2026-07-01", 0), workoutAt("2026-07-03", 7), workoutAt("2026-07-06", 8.5),
  ]), NONE);
});

test("matchedLoadRpeTrend merges tool variants via canonExercise and averages sets per day", () => {
  const result = matchedLoadRpeTrend([
    { date: "2026-07-01", exercises: [{ name: "Sentadilla goblet (mancuerna)", sets: [{ kg: 20, reps: 10, rpe: 6.5 }, { kg: 20, reps: 10, rpe: 7.5 }] }] },
    workoutAt("2026-07-03", 8, 20, 10, "Sentadilla con barra ligera"),
    workoutAt("2026-07-06", 9),
  ]);
  assert.deepEqual(result.fatigue, { name: "Sentadilla", kg: 20, reps: 10, from: 7, to: 9 });
});

test("migrateWorkouts supplies legacy defaults", () => {
  const result = migrateWorkouts([{ date: "2026-06-14", exercises: [{ muscle: "Pecho", sets: [] }] }], "Espalda");
  assert.equal(result[0].durationMin, 0);
  assert.deepEqual(result[0].cardio, []);
  assert.equal(result[0].exercises[0].primary, "Pecho");
  assert.deepEqual(result[0].exercises[0].secondary, []);
});

test("el destacado de fuerza usa el 1RM estimado de la sesion", () => {
  const workouts = [
    { date: "2026-08-01", exercises: [{ name: "Peso muerto", sets: [{ kg: 60, reps: 5 }, { kg: 50, reps: 8 }] }] },
    { date: "2026-08-15", exercises: [{ name: "peso muerto", sets: [{ kg: 65, reps: 5 }] }] },
    { date: "2026-08-29", exercises: [{ name: "Peso muerto", sets: [{ kg: 70, reps: 4 }] }] },
    { date: "2026-08-29", exercises: [{ name: "Press banca", sets: [{ kg: 40, reps: 6 }] }] },
  ];
  const best = loadProgressHighlight(workouts, "2026-09-01");
  // 1RM estimado con Epley por sesion: 60x5 -> 70, 65x5 -> 76, 70x4 -> 79
  assert.deepEqual([best.name, best.from, best.to, best.pct, best.sessions], ["Peso muerto", 70, 79, 13, 3]);
  assert.deepEqual(best.series, [70, 76, 79]);
  // con menos de tres sesiones del mismo ejercicio no se afirma nada
  assert.equal(loadProgressHighlight(workouts.slice(0, 2), "2026-09-01"), null);
});

test("la tendencia de peso se mide por semana sobre la ventana pedida", () => {
  const weights = [
    { date: "2026-08-11", kg: 73.0 },
    { date: "2026-08-18", kg: 72.6 },
    { date: "2026-08-25", kg: 72.3 },
    { date: "2026-09-01", kg: 72.0 },
  ];
  const trend = weightTrendHighlight(weights, "2026-09-01");
  assert.equal(trend.perWeek, -0.33);
  assert.deepEqual([trend.from, trend.to, trend.days], [73, 72, 21]);
  // dos pesos no son una tendencia
  assert.equal(weightTrendHighlight(weights.slice(0, 2), "2026-09-01"), null);
});

test("la adherencia de proteina solo cuenta los dias registrados", () => {
  const nutrition = [
    { date: "2026-08-30", protein: 80 },
    { date: "2026-08-30", protein: 70 },
    { date: "2026-08-31", protein: 100 },
    { date: "2026-09-01", protein: 155 },
    { date: "2026-07-01", protein: 200 },
  ];
  const adherence = proteinAdherence(nutrition, 150, "2026-09-01");
  assert.deepEqual([adherence.onTarget, adherence.logged, adherence.days], [2, 3, 7]);
  assert.deepEqual(adherence.series, [150, 100, 155]);
  assert.equal(adherence.avg, 135);
  // sin objetivo no hay nada que comparar
  assert.equal(proteinAdherence(nutrition, 0, "2026-09-01"), null);
});

test("dayFeed reúne entreno, comidas y cuerpo del día en una sola lista", () => {
  const date = "2026-09-06";
  const entries = dayFeed(date, {
    workouts: [{ id: "w1", date, durationMin: 52, exercises: [{ name: "Sentadilla", sets: [{ reps: 5, kg: 100, rpe: "8" }, { reps: 5, kg: 100, rpe: "8" }] }], cardio: [{ id: "c1", type: "Bici", minutes: 30, kcal: 210 }] }],
    nutrition: [{ id: "n1", date, name: "Avena", kcal: 320, protein: 12 }, { id: "n2", date: "2026-09-05", name: "Ayer", kcal: 100, protein: 5 }],
    weights: [{ id: "p1", date, kg: 68.4 }],
    measurements: [{ id: "m1", date, cintura: 74, cadera: null, pecho: null, brazo: null, muslo: null }],
    wellness: [{ id: "s1", date, sleep: 7, energy: 4, notes: "" }],
  });
  assert.deepEqual(entries.map((e) => e.kind), ["entreno", "cardio", "comida", "peso", "medidas", "nota"]);
  assert.equal(entries[0].meta, "52 min · 2 series · 1000 kg · RPE 8");
  assert.equal(entries[2].meta, "320 kcal · 12 g P");
  assert.equal(entries[3].title, "68,4 kg");
  assert.equal(entries[4].meta, "cintura 74 cm");
});

test("dayFeed ignora el ruido: sesión vacía, nota en blanco y días ajenos", () => {
  const date = "2026-09-06";
  const entries = dayFeed(date, {
    workouts: [{ id: "w1", date, exercises: [] }],
    wellness: [{ id: "s1", date, sleep: null, energy: null, notes: "   " }],
    nutrition: [{ id: "n1", date: "2026-09-05", name: "Ayer", kcal: 100 }],
  });
  assert.deepEqual(entries, []);
});

// --- autoregulacion intra-sesion ------------------------------------------
test("parseRpeTarget entiende rangos y valores sueltos", () => {
  assert.deepEqual(parseRpeTarget("7–8"), [7, 8]);
  assert.deepEqual(parseRpeTarget("6-7"), [6, 7]);
  assert.deepEqual(parseRpeTarget("8"), [8, 8]);
  assert.equal(parseRpeTarget("—"), null);
});

test("pasarse un punto del objetivo pide backoff, no progresión", () => {
  const advice = nextSetAdvice({ rpe: "9", targetRpe: "7–8", kg: 80, muscle: "Pecho" });
  assert.equal(advice.kind, "backoff");
  assert.equal(advice.kg, 74.5); // ~7% menos, redondeado a medio kilo
});

test("una serie al fallo en un accesorio también pide backoff", () => {
  const advice = nextSetAdvice({ rpe: "10", targetRpe: "6", kg: 30, muscle: "Tríceps" });
  assert.equal(advice.kind, "backoff");
  assert.match(advice.text, /fallo/);
});

test("quedarse corta sube más en tren inferior que en superior", () => {
  assert.equal(nextSetAdvice({ rpe: "6", targetRpe: "7–8", kg: 100, muscle: "Cuádriceps" }).kg, 105);
  assert.equal(nextSetAdvice({ rpe: "6", targetRpe: "7–8", kg: 40, muscle: "Bíceps" }).kg, 42.5);
});

test("dentro del rango objetivo se repite la carga", () => {
  const advice = nextSetAdvice({ rpe: "7.5", targetRpe: "7–8", kg: 60, muscle: "Espalda" });
  assert.equal(advice.kind, "hold");
  assert.equal(advice.kg, 60);
});

test("sin RPE registrado no se aconseja nada", () => {
  assert.equal(nextSetAdvice({ rpe: "", targetRpe: "7–8", kg: 60 }), null);
});

// --- tema ------------------------------------------------------------------
test("el tema por defecto es oscuro, que es el aspecto del prototipo", () => {
  // Sin localStorage (aqui) o sin valor guardado, oscuro. Un valor invalido
  // tampoco debe colar: la app pinta data-theme con lo que salga de aqui.
  assert.equal(readThemePref(), "dark");
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("light", true), "light");
  // "auto" es lo unico que consulta al sistema.
  assert.equal(resolveTheme("auto", true), "dark");
  assert.equal(resolveTheme("auto", false), "light");
});

// --- busqueda del diario ---------------------------------------------------
const searchData = {
  workouts: [{
    id: "w1", date: "2026-09-01", durationMin: 55, cardio: [{ id: "c1", type: "Bici", minutes: 40, kcal: 300 }],
    exercises: [{ id: "e1", name: "Press banca", sets: [{ id: "s1", reps: "8", kg: "60", rpe: "8" }] }],
  }],
  nutrition: [{ id: "n1", date: "2026-08-20", name: "Avena en copos", kcal: 380, protein: 13 }],
  weights: [{ id: "p1", date: "2026-08-15", kg: 70 }],
  measurements: [], wellness: [{ id: "x1", date: "2026-07-02", sleep: 6, energy: 3, notes: "Récord en remo" }],
};

test("la búsqueda encuentra ejercicios que la fila no llega a mostrar", () => {
  // La sesión se pinta como "Sesión · 1 ejercicio": sin el campo de búsqueda
  // aparte, teclear el nombre del ejercicio no encontraría nada.
  const hit = searchFeed("press banca", searchData);
  assert.equal(hit.length, 1);
  assert.equal(hit[0].date, "2026-09-01");
  assert.equal(hit[0].kind, "entreno");
  assert.doesNotMatch(hit[0].title, /press/i);
  // Y la fila dice cuál fue el ejercicio que coincidió, o no se entiende por qué sale.
  assert.match(hit[0].meta, /^Press banca ·/);
});

test("la búsqueda cubre alimentos, notas y cardio, y ordena por fecha", () => {
  assert.equal(searchFeed("avena", searchData)[0].kind, "comida");
  assert.equal(searchFeed("récord", searchData)[0].kind, "nota");
  assert.equal(searchFeed("bici", searchData)[0].kind, "cardio");
  // Varias coincidencias salen de más reciente a más antigua.
  const fechas = searchFeed("a", { ...searchData }).map((r) => r.date);
  assert.deepEqual([...fechas].sort((a, b) => b.localeCompare(a)), fechas);
});

test("la búsqueda calla con menos de dos caracteres y no inventa resultados", () => {
  assert.deepEqual(searchFeed("", searchData), []);
  assert.deepEqual(searchFeed("p", searchData), []);
  assert.deepEqual(searchFeed("zzzz", searchData), []);
});

test("la búsqueda respeta el tope de resultados", () => {
  const muchos = { nutrition: Array.from({ length: 60 }, (_, i) => ({ id: `n${i}`, date: addDays("2026-01-01", i), name: "Avena", kcal: 100, protein: 5 })) };
  assert.equal(searchFeed("avena", muchos).length, 40);
  assert.equal(searchFeed("avena", muchos, { limit: 5 }).length, 5);
});

// --- plan semanal ----------------------------------------------------------
const sesion = (date, sets = 3) => ({
  id: `w-${date}`, date, durationMin: 50,
  exercises: [{ id: "e", name: "Sentadilla", sets: Array.from({ length: sets }, (_, i) => ({ id: `s${i}`, reps: "8", kg: "80", rpe: "8" })) }],
});
const planRoutines = [
  { id: "r1", name: "Empuje", suggestedDay: 1, exercises: [] },
  { id: "r2", name: "Tracción", suggestedDay: 4, exercises: [] },
];

test("la semana empieza en lunes, venga de donde venga la fecha", () => {
  assert.equal(mondayOf("2026-09-06"), "2026-08-31"); // domingo cae en su propia semana
  assert.equal(mondayOf("2026-08-31"), "2026-08-31"); // lunes
  assert.equal(mondayOf("2026-09-02"), "2026-08-31"); // miércoles
});

test("cada día del plan sabe si está hecho, pendiente o perdido", () => {
  // Miércoles 2 sept: el lunes tenía Empuje y se registró; el jueves está por venir.
  const week = planWeek(planRoutines, [sesion("2026-08-31")], "2026-09-02");
  const byKey = Object.fromEntries(week.map((d) => [d.key, d.state]));
  assert.equal(byKey.L, "hecho");
  assert.equal(byKey.M, "libre");   // sin rutina asignada
  assert.equal(byKey.J, "previsto");
  // Sin registrar un día pasado con rutina, el estado es "perdido" y no "libre":
  // la diferencia entre no tocaba y no lo hiciste es justo lo que se viene a ver.
  const tarde = planWeek(planRoutines, [], "2026-09-06");
  assert.equal(tarde.find((d) => d.key === "L").state, "perdido");
  assert.equal(tarde.find((d) => d.key === "J").state, "perdido");
});

test("un día con serie registrada cuenta como hecho aunque no estuviera planificado", () => {
  const week = planWeek(planRoutines, [sesion("2026-09-01")], "2026-09-02");
  assert.equal(week.find((d) => d.key === "M").state, "hecho");
  // Una sesión cargada pero sin reps no cuenta: el plan mide lo hecho, no lo abierto.
  const vacia = { id: "w0", date: "2026-09-01", exercises: [{ id: "e", sets: [{ id: "s", reps: "", kg: "", rpe: "" }] }] };
  assert.equal(planWeek(planRoutines, [vacia], "2026-09-02").find((d) => d.key === "M").state, "libre");
});

test("el cumplimiento mide semanas completas, no la que está en curso", () => {
  // Hoy es martes de la semana del 31 ago; la ventana son las 8 semanas previas.
  const previas = ["2026-08-24", "2026-08-27", "2026-08-17", "2026-08-20"].map((d) => sesion(d));
  const c = planCompliance(planRoutines, [...previas, sesion("2026-09-01")], "2026-09-01");
  assert.equal(c.perWeek, 2);
  assert.equal(c.planned, 16);
  assert.equal(c.done, 4);          // la sesión de esta semana queda fuera
  assert.equal(c.adherence, 25);
  assert.equal(c.full, 2);          // dos semanas con las dos sesiones
  assert.equal(c.weeks.length, 8);
});

test("sin días asignados el cumplimiento no inventa un porcentaje", () => {
  const c = planCompliance([{ id: "r", name: "Suelta", exercises: [] }], [sesion("2026-08-24")], "2026-09-01");
  assert.equal(c.perWeek, 0);
  assert.equal(c.adherence, null);
});

test("el número de semana cuenta desde la primera sesión registrada", () => {
  assert.equal(weekNumber([sesion("2026-08-31")], "2026-08-31"), 1);
  assert.equal(weekNumber([sesion("2026-08-31")], "2026-09-06"), 1); // misma semana
  assert.equal(weekNumber([sesion("2026-08-31")], "2026-09-07"), 2);
  assert.equal(weekNumber([], "2026-09-06"), null);
});

// --- ajustar la sesión ------------------------------------------------------
test("ajustar la carga solo reescribe las series que faltan por hacer", () => {
  const exercises = [{
    id: "a", name: "Press banca", sets: [
      { id: "s1", reps: "8", kg: "60", rpe: "8" },   // hecha: intocable
      { id: "s2", reps: "", kg: "60", rpe: "" },     // pendiente
      { id: "s3", reps: "", kg: "60", rpe: "" },
    ],
  }];
  const [out] = applyAdjustments(exercises, [{ id: "a", kg: 55, removed: false }]);
  assert.equal(out.sets[0].kg, "60");  // ya registrada: el historial no se falsea
  assert.equal(out.sets[0].reps, "8");
  assert.equal(out.sets[1].kg, "55");
  assert.equal(out.sets[2].kg, "55");
});

test("un ejercicio con todo registrado no cambia aunque se pida otra carga", () => {
  const exercises = [{ id: "a", name: "Sentadilla", sets: [{ id: "s1", reps: "5", kg: "100", rpe: "8" }] }];
  const [out] = applyAdjustments(exercises, [{ id: "a", kg: 80, removed: false }]);
  assert.equal(out.sets[0].kg, "100");
});

test("quitar un ejercicio lo saca de la sesión y deja intactos los demás", () => {
  const exercises = [
    { id: "a", name: "Press", sets: [{ id: "s1", reps: "", kg: "40", rpe: "" }] },
    { id: "b", name: "Remo", sets: [{ id: "s2", reps: "10", kg: "50", rpe: "7" }] },
  ];
  const out = applyAdjustments(exercises, [{ id: "a", kg: 40, removed: true }, { id: "b", kg: 50, removed: false }]);
  assert.equal(out.length, 1);
  assert.equal(out[0].name, "Remo");
  assert.equal(out[0].sets[0].kg, "50");
});

test("sin carga se vacía el kilaje de las series pendientes, no se pone un cero", () => {
  const exercises = [{ id: "a", name: "Fondos", sets: [{ id: "s1", reps: "", kg: "20", rpe: "" }] }];
  const [out] = applyAdjustments(exercises, [{ id: "a", kg: 0, removed: false }]);
  assert.equal(out.sets[0].kg, "");
});

test("un día de descanso sigue teniendo contenido: el Plan lo lee con dayFeed", () => {
  const datos = {
    workouts: [],
    nutrition: [{ id: "n1", date: "2026-09-01", name: "Yogur", kcal: 346, protein: 28 }],
    weights: [{ id: "w1", date: "2026-09-01", kg: 69 }],
    measurements: [],
    wellness: [{ id: "s1", date: "2026-09-01", sleep: 6.4, energy: 2, notes: "" }],
  };
  // El dia no tiene sesion, que es justo el caso en el que el Plan antes no
  // mostraba nada y su unico boton mandaba a Entrenar.
  const resto = dayFeed("2026-09-01", datos).filter((e) => e.kind !== "entreno");
  assert.deepEqual(resto.map((e) => e.kind), ["comida", "peso", "nota"]);
  // Cada tipo abre su propia pantalla: peso, medidas y nota dejaron de ser la
  // misma pila de formularios.
  assert.deepEqual(resto.map((e) => e.tab), ["nutricion", "peso", "nota"]);
});

test("los pasos de hoy se leen contra la media de los 7 días anteriores", () => {
  const wellness = [
    { date: "2026-08-30", steps: 6000 }, { date: "2026-08-31", steps: 8000 },
    { date: "2026-09-01", steps: 0 }, // sin registrar: no arrastra la media a la baja
    { date: "2026-09-06", steps: 9000 },
  ];
  const hoy = stepsToday(wellness, "2026-09-06");
  assert.equal(hoy.today, 9000);
  assert.equal(hoy.avg, 7000);
  assert.equal(hoy.days, 2);
  // Un día sin dato no es un día de cero pasos.
  assert.equal(stepsToday(wellness, "2026-09-05").today, null);
});

test("cada aviso sabe a qué tarjeta de Métricas lleva y respeta la coma decimal", () => {
  const hoy = localISO();
  const dias = (n) => addDays(hoy, -n);
  // Baja mucho más rápido que el objetivo y come poca proteína: dos avisos seguros.
  const weights = Array.from({ length: 25 }, (_, i) => ({ id: `w${i}`, date: dias(24 - i), kg: +(70 - i * 0.12).toFixed(1) }));
  const nutrition = Array.from({ length: 14 }, (_, i) => ({ id: `n${i}`, date: dias(13 - i), kcal: 1800, protein: 70 }));
  const goals = { weeklyChange: -0.3, proteinTarget: 150, targetWeight: "65" };
  const avisos = buildAlerts(alertMetrics({ workouts: [], nutrition, weights, wellness: [], periods: [], menstrualLogs: [], goals }), goals);

  // Sin `card` el aviso no puede llevar a ningún sitio, que es justo lo que se pide.
  const cards = ["peso", "macros", "records", "volumen", "constancia", "proyeccion", "rpe", "ciclo"];
  assert.ok(avisos.length > 0);
  avisos.forEach((aviso) => assert.ok(cards.includes(aviso.card), `card inválida: ${aviso.card}`));

  const peso = avisos.find((a) => a.card === "peso");
  assert.ok(peso, "falta el aviso de tendencia de peso");
  assert.match(peso.body, /-\d+,\d\d kg\/sem/);
  assert.doesNotMatch(peso.body, /\d\.\d/);
  assert.equal(avisos.find((a) => a.title.includes("Proteína"))?.card, "macros");
});

test("las comidas del día salen del reparto elegido, no de una lista fija", () => {
  // 4 y 5 son las dos opciones que ofrece Ajustes; los nombres y el reparto de
  // proteína viven juntos, así que la pantalla de nutrición no puede inventarlos.
  assert.deepEqual(PROTEIN_CONFIG.mealLabels[4], ["Desayuno", "Almuerzo", "Merienda", "Cena"]);
  assert.deepEqual(PROTEIN_CONFIG.mealLabels[5], ["Desayuno", "Media mañana", "Almuerzo", "Merienda", "Cena"]);
  for (const count of [4, 5]) {
    const split = distributeProtein(150, count);
    assert.equal(split.length, count, `el reparto de ${count} comidas no tiene ${count} tramos`);
    assert.deepEqual(split.map((meal) => meal.label), PROTEIN_CONFIG.mealLabels[count]);
  }
});

test("con perfil de hombre no se calcula ni se avisa nada del ciclo", () => {
  const hoy = localISO();
  const dias = (n) => addDays(hoy, -n);
  const weights = Array.from({ length: 25 }, (_, i) => ({ id: `w${i}`, date: dias(24 - i), kg: +(80 - i * 0.1).toFixed(1) }));
  const periods = [{ id: "p1", date: dias(56) }, { id: "p2", date: dias(28) }];
  const menstrualLogs = [56, 55, 28, 27].map((d) => ({ id: `l${d}`, date: dias(d), bleedingLevel: "medium" }));
  const datos = { workouts: [], nutrition: [], weights, wellness: [], periods, menstrualLogs };

  const hombre = { ...datos, goals: { sex: "hombre", weeklyChange: -0.3 } };
  const mujer = { ...datos, goals: { sex: "mujer", weeklyChange: -0.3 } };

  const m = alertMetrics(hombre);
  assert.equal(m.completeCyclesCount, 0);
  assert.equal(m.lutealOffset, null);
  assert.equal(m.cycleConfound, false);
  assert.equal(m.phaseByDate.size, 0, "no se infiere fase para ningún pesaje");

  const avisosHombre = buildAlerts(m, hombre.goals);
  assert.equal(avisosHombre.filter((a) => a.card === "ciclo").length, 0);
  // Y con perfil de mujer los mismos datos sí los producen: la diferencia es el
  // perfil, no que falten datos.
  assert.ok(buildAlerts(alertMetrics(mujer), mujer.goals).some((a) => a.card === "ciclo"));
});
