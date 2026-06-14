import test from "node:test";
import assert from "node:assert/strict";
import { addDays, authUserChanged, cycleInfo, daysBetween, localISO, mergePhotoUrls, migrateWorkouts, slopePerDay, validateBackup } from "../src/app-utils.js";

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
    photos: [{ date: "2026-06-14", dataUrl: "data:image/jpeg;base64,AA==" }],
  }, DEFAULT_GOALS);
  assert.equal(backup.workouts.length, 1);
  assert.equal(backup.photos.length, 1);
});

test("migrateWorkouts supplies legacy defaults", () => {
  const result = migrateWorkouts([{ date: "2026-06-14", exercises: [{ muscle: "Pecho", sets: [] }] }], "Espalda");
  assert.equal(result[0].durationMin, 0);
  assert.deepEqual(result[0].cardio, []);
  assert.equal(result[0].exercises[0].primary, "Pecho");
  assert.deepEqual(result[0].exercises[0].secondary, []);
});
