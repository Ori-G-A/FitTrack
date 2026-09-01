import test from "node:test";
import assert from "node:assert/strict";
import {
  MENSTRUAL_DAILY_LOG_FIELDS,
  buildCycleStarts,
  dailyGuidance,
  detectOvulationProbableDates,
  getCycleInsights,
  inferCyclePhase,
  ovulationEstimate,
  phaseSegments,
  recalculateCycleEstimates,
  summarizeCycles,
  symptomDistribution,
} from "../src/cycle-inference.js";

test("menstrual logs do not duplicate sleep or energy fields", () => {
  assert.equal(MENSTRUAL_DAILY_LOG_FIELDS.includes("sleep"), false);
  assert.equal(MENSTRUAL_DAILY_LOG_FIELDS.includes("sleepHours"), false);
  assert.equal(MENSTRUAL_DAILY_LOG_FIELDS.includes("energy"), false);
  assert.equal(MENSTRUAL_DAILY_LOG_FIELDS.includes("energyScore"), false);
});

test("clear menstrual bleeding estimates menstruation", () => {
  const result = inferCyclePhase({
    date: "2026-07-01",
    menstrualLogs: [{ date: "2026-07-01", bleedingLevel: "medium" }],
  });
  assert.equal(result.phase, "menstruation");
  assert.equal(result.confidence, "high");
});

test("spotting does not restart a cycle", () => {
  const starts = buildCycleStarts(
    [{ date: "2026-06-01", duration: 5 }],
    [{ date: "2026-06-20", bleedingLevel: "spotting" }],
  );
  assert.deepEqual(starts, ["2026-06-01"]);
});

test("fertile cervical fluid marks a probable fertile window", () => {
  const result = inferCyclePhase({
    date: "2026-07-13",
    periods: [{ date: "2026-07-01", duration: 5 }],
    menstrualLogs: [{ date: "2026-07-13", cervicalFluid: "watery" }],
  });
  assert.equal(result.phase, "fertile_window_probable");
});

test("flow peak followed by dry fluid marks probable ovulation and early luteal", () => {
  const menstrualLogs = [
    { date: "2026-07-12", cervicalFluid: "creamy" },
    { date: "2026-07-13", cervicalFluid: "watery" },
    { date: "2026-07-14", cervicalFluid: "slippery_eggwhite" },
    { date: "2026-07-15", cervicalFluid: "dry" },
  ];
  assert.equal(detectOvulationProbableDates(menstrualLogs).has("2026-07-14"), true);
  assert.equal(inferCyclePhase({ date: "2026-07-14", menstrualLogs }).phase, "ovulation_probable");
  assert.equal(inferCyclePhase({ date: "2026-07-15", menstrualLogs }).phase, "luteal_early");
});

test("luteal early and mid use days after probable ovulation", () => {
  const menstrualLogs = [
    { date: "2026-07-10", cervicalFluid: "slippery_eggwhite" },
    { date: "2026-07-11", cervicalFluid: "dry" },
  ];
  assert.equal(inferCyclePhase({ date: "2026-07-12", menstrualLogs }).phase, "luteal_early");
  assert.equal(inferCyclePhase({ date: "2026-07-17", menstrualLogs }).phase, "luteal_mid");
});

test("luteal late is inferred near the next period", () => {
  const result = inferCyclePhase({
    date: "2026-07-24",
    periods: [
      { date: "2026-06-30", duration: 5 },
      { date: "2026-07-28", duration: 5 },
    ],
  });
  assert.equal(result.phase, "luteal_late");
});

test("recalculation reclassifies days before a newly logged period", () => {
  const estimates = recalculateCycleEstimates("u1", "2026-07-24", "2026-07-28", {
    periods: [
      { date: "2026-06-30", duration: 5 },
      { date: "2026-07-28", duration: 5 },
    ],
  });
  assert.deepEqual(
    estimates.filter((item) => item.date >= "2026-07-24" && item.date <= "2026-07-27").map((item) => item.phase),
    ["luteal_late", "luteal_late", "luteal_late", "luteal_late"],
  );
});

test("insights read sleep and energy from wellness records", () => {
  const insights = getCycleInsights({
    periods: [
      { date: "2026-05-01", duration: 5 },
      { date: "2026-05-29", duration: 5 },
      { date: "2026-06-26", duration: 5 },
    ],
    wellness: [
      { date: "2026-06-22", energy: 2, sleep: 5.8 },
      { date: "2026-06-23", energy: 2, sleep: 5.5 },
      { date: "2026-06-24", energy: 3, sleep: 7 },
      { date: "2026-06-25", energy: 2, sleep: 5.2 },
    ],
    menstrualLogs: [
      { date: "2026-06-22", bloatingLevel: 2, breastSensitivity: 1 },
      { date: "2026-06-23", bloatingLevel: 2, breastSensitivity: 2 },
    ],
  });
  assert.equal(insights.some((item) => item.type === "energy_by_phase"), true);
  assert.equal(insights.some((item) => item.message.includes("sueno")), true);
});

test("un check-in sin sangrado gana a la duracion asumida del periodo", () => {
  const periods = [{ date: "2026-06-01", duration: 5 }];
  const sinLog = inferCyclePhase({ date: "2026-06-04", periods });
  assert.equal(sinLog.phase, "menstruation");
  const conLog = inferCyclePhase({
    date: "2026-06-04",
    periods,
    menstrualLogs: [{ date: "2026-06-04", bleedingLevel: "none", cervicalFluid: "dry" }],
  });
  assert.notEqual(conLog.phase, "menstruation");
});

test("el resumen agrupa por ciclo, no por dia, y mide el sangrado", () => {
  const summary = summarizeCycles(
    [{ id: "p1", date: "2026-06-01", duration: 5 }],
    [
      { id: "l1", date: "2026-06-29", bleedingLevel: "heavy" },
      { id: "l2", date: "2026-06-30", bleedingLevel: "medium" },
      { id: "l3", date: "2026-07-02", bleedingLevel: "none" },
    ],
  );
  assert.deepEqual(summary.cycles.map((cycle) => cycle.start), ["2026-06-29", "2026-06-01"]);
  const [current, legacy] = summary.cycles;
  // ciclo en curso: sin largo todavia, pero con los dias de sangrado ya registrados
  assert.deepEqual([current.length, current.bleedDays, current.logId], [null, 2, "l1"]);
  // el registro antiguo toma su duracion de si mismo y su largo del siguiente inicio
  assert.deepEqual([legacy.length, legacy.bleedDays, legacy.periodId], [28, 5, "p1"]);
  assert.deepEqual([summary.avgCycle, summary.samples, summary.avgBleed], [28, 1, 3.5]);
});

test("un ciclo fuera de rango no entra en la media", () => {
  const summary = summarizeCycles([], [
    { date: "2026-06-01", bleedingLevel: "medium" },
    { date: "2026-06-08", bleedingLevel: "medium" },
    { date: "2026-07-06", bleedingLevel: "medium" },
  ]);
  assert.equal(summary.outliers, 1);
  assert.equal(summary.avgCycle, 28);
});

test("la distribucion ubica cada sintoma en su tramo del ciclo", () => {
  const menstrualLogs = [
    { date: "2026-06-01", bleedingLevel: "heavy", crampsLevel: 8 },
    { date: "2026-06-02", bleedingLevel: "medium", crampsLevel: 6 },
    { date: "2026-06-25", bloatingLevel: 3, acneLevel: 2 },
    { date: "2026-06-29", bleedingLevel: "heavy", crampsLevel: 7 },
  ];
  const tracks = symptomDistribution({ menstrualLogs, bins: 4 });
  const cramps = tracks.find((track) => track.key === "cramps");
  assert.equal(cramps.peakDay, 1);
  // los colicos se concentran al inicio del ciclo, no al final
  assert.ok(cramps.bins[0] > cramps.bins[3]);
  const bloating = tracks.find((track) => track.key === "bloating");
  assert.equal(bloating.peakDay, 25);
  assert.ok(bloating.bins[3] > bloating.bins[0]);
  // sin registros de senos, la pista no se dibuja
  assert.equal(tracks.some((track) => track.key === "breast"), false);
});

test("las lecturas de energia por fase vienen etiquetadas con su fase", () => {
  const insights = getCycleInsights({
    periods: [
      { date: "2026-05-01", duration: 5 },
      { date: "2026-05-29", duration: 5 },
      { date: "2026-06-26", duration: 5 },
    ],
    wellness: [
      { date: "2026-06-22", energy: 2, sleep: 7 },
      { date: "2026-06-23", energy: 2, sleep: 7 },
    ],
  });
  const energy = insights.filter((item) => item.type === "energy_by_phase");
  assert.ok(energy.length > 0);
  assert.ok(energy.every((item) => item.phase));
  // filtrando por la fase de hoy no queda una lectura de otra fase
  assert.equal(energy.filter((item) => item.phase === "menstruation").length, 0);
});

test("cada ciclo se segmenta en fases consecutivas, sin repetir tramo", () => {
  const periods = [{ date: "2026-06-01", duration: 5 }, { date: "2026-06-29", duration: 5 }];
  const segments = phaseSegments("2026-06-01", "2026-06-28", periods, []);
  assert.equal(segments[0].phase, "menstruation");
  assert.equal(segments[0].days, 5);
  assert.deepEqual(
    segments.map((segment) => segment.phase),
    ["menstruation", "follicular_early", "follicular_mid_late", "luteal_late"],
  );
  // los tramos cubren el ciclo entero y no se pisan
  assert.equal(segments.reduce((sum, segment) => sum + segment.days, 0), 28);
  assert.deepEqual(segments.map((segment) => segment.startDay), [1, 6, 10, 23]);
});

test("la guia del dia cambia con la fase y con lo que registraste", () => {
  const periods = [
    { date: "2026-05-01", duration: 5 },
    { date: "2026-05-29", duration: 5 },
    { date: "2026-06-26", duration: 5 },
  ];
  const menstruacion = dailyGuidance({
    date: "2026-06-26",
    periods,
    menstrualLogs: [{ date: "2026-06-26", bleedingLevel: "heavy", crampsLevel: 7 }],
  });
  assert.equal(menstruacion.phase, "menstruation");
  assert.match(menstruacion.hormones, /punto mas bajo/);
  // colicos altos reorientan la sesion del dia, la fase sola no basta
  assert.ok(menstruacion.notes.some((note) => note.includes("version minima")));
  assert.equal(menstruacion.provisional, false);

  const lutea = dailyGuidance({
    date: "2026-06-22",
    periods,
    menstrualLogs: [{ date: "2026-06-22", bloatingLevel: 3, breastSensitivity: 2 }],
    wellness: [{ date: "2026-06-22", energy: 2, sleep: 5 }],
  });
  assert.equal(lutea.phase, "luteal_late");
  assert.notEqual(lutea.training, menstruacion.training);
  assert.ok(lutea.notes.some((note) => note.includes("Energia 2/5")));
  assert.ok(lutea.notes.some((note) => note.includes("sueno")));
});

test("sin dos ciclos completos la guia se marca como orientativa", () => {
  const guidance = dailyGuidance({ date: "2026-06-05", menstrualLogs: [{ date: "2026-06-01", bleedingLevel: "medium" }] });
  assert.equal(guidance.provisional, true);
});

test("la ovulacion se estima por calendario y el flujo la corrige", () => {
  const periods = [{ date: "2026-06-01", duration: 5 }, { date: "2026-06-29", duration: 5 }];
  const calendario = ovulationEstimate({ date: "2026-06-10", periods });
  // 14 dias antes del siguiente periodo, no la mitad del ciclo
  assert.deepEqual([calendario.date, calendario.cycleDay, calendario.source], ["2026-06-15", 15, "calendario"]);

  const porFlujo = ovulationEstimate({
    date: "2026-06-20",
    periods,
    menstrualLogs: [
      { date: "2026-06-10", cervicalFluid: "creamy" },
      { date: "2026-06-11", cervicalFluid: "slippery_eggwhite" },
      { date: "2026-06-12", cervicalFluid: "dry" },
    ],
  });
  assert.deepEqual([porFlujo.date, porFlujo.cycleDay, porFlujo.source], ["2026-06-11", 11, "flujo"]);
});

test("sin ciclos registrados no se inventa una ovulacion", () => {
  assert.equal(ovulationEstimate({ date: "2026-06-10" }), null);
});
