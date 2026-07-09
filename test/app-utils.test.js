import test from "node:test";
import assert from "node:assert/strict";
import { addDays, authUserChanged, cycleInfo, daysBetween, localISO, matchedLoadRpeTrend, mergePhotoUrls, migrateWorkouts, slopePerDay, validateBackup } from "../src/app-utils.js";

const DEFAULT_GOALS = { kcalTarget: 2200, proteinTarget: 150, autoMacros: false };

test("localISO uses local calendar fields", () => {
  assert.equal(localISO(new Date(2026, 5, 14, 23, 30)), "2026-06-14");
});

test("authUserChanged ignores token refreshes for the same user", () => {
  assert.equal(authUserChanged("user-1", "user-1"), false);
  assert.equal(authUserChanged("user-1", "user-2"), true);
  assert.equal(authUserChanged("user-1", null), true);
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

test("cycleInfo calculates cycle length and phase from a fixed date", () => {
  const result = cycleInfo([
    { date: "2026-04-01", duration: 5 },
    { date: "2026-04-29", duration: 5 },
    { date: "2026-05-27", duration: 4 },
  ], "2026-06-14");
  assert.equal(result.avgCycle, 28);
  assert.equal(result.day, 19);
  assert.equal(result.phase, "L\u00fatea");
  assert.equal(result.nextDate, "2026-06-24");
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
