import test from "node:test";
import assert from "node:assert/strict";
import {
  MENSTRUAL_DAILY_LOG_FIELDS,
  buildCycleStarts,
  detectOvulationProbableDates,
  getCycleInsights,
  inferCyclePhase,
  recalculateCycleEstimates,
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
