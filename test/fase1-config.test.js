import test from "node:test";
import assert from "node:assert/strict";
import {
  PROTEIN_CONFIG, ROUTINE_TEMPLATES, computeProteinTargets, distributeProtein,
  getAllRoutines, getRoutineById, guessPrimaryMuscle, suggestRoutineForDay,
  templateToAppRoutine,
} from "../src/fase1Config.js";

test("computeProteinTargets calculates and clamps grams per kilogram", () => {
  assert.deepEqual(computeProteinTargets(61), {
    gPerKg: 2,
    weightKg: 61,
    dailyTarget: 122,
    lowEnd: 110,
    highEnd: 134,
  });
  assert.equal(computeProteinTargets(61, { gPerKg: 99 }).gPerKg, PROTEIN_CONFIG.maxGPerKg);
  assert.equal(computeProteinTargets(61, { gPerKg: 0.5 }).gPerKg, PROTEIN_CONFIG.minGPerKg);
});

test("distributeProtein supports four and five meals", () => {
  const fourMeals = distributeProtein(120, 4);
  const fiveMeals = distributeProtein(120, 5);
  assert.equal(fourMeals.length, 4);
  assert.equal(fiveMeals.length, 5);
  assert.equal(fourMeals[0].label, PROTEIN_CONFIG.mealLabels[4][0]);
  assert.ok(Math.abs(fourMeals.reduce((sum, meal) => sum + meal.grams, 0) - 120) <= 2);
  assert.deepEqual(distributeProtein(120, 3), []);
});

test("routine selectors expose all templates without restricting the day", () => {
  assert.equal(getAllRoutines(), ROUTINE_TEMPLATES);
  assert.equal(getRoutineById(ROUTINE_TEMPLATES[0].id), ROUTINE_TEMPLATES[0]);
  assert.equal(getRoutineById("missing"), null);
  const result = suggestRoutineForDay(new Date(2026, 5, 15));
  assert.equal(result.all, ROUTINE_TEMPLATES);
  if (result.suggested) assert.equal(result.suggested.suggestedDay, 1);
});

test("guessPrimaryMuscle maps common exercise names", () => {
  assert.equal(guessPrimaryMuscle("Press banca"), "Pecho");
  assert.equal(guessPrimaryMuscle("Peso muerto rumano"), "Femoral");
  assert.equal(guessPrimaryMuscle("Plancha lateral"), "Core");
});

test("templateToAppRoutine preserves routine and minimal-version targets", () => {
  let sequence = 0;
  const template = ROUTINE_TEMPLATES.find((item) => item.minimalVersion) || ROUTINE_TEMPLATES[0];
  const routine = templateToAppRoutine(template, () => `id-${sequence += 1}`);
  assert.equal(routine.templateId, template.id);
  assert.equal(routine.exercises.length, template.exercises.length);
  assert.ok(routine.exercises.every((exercise) => exercise.id && exercise.primary && Array.isArray(exercise.secondary)));
  if (template.minimalVersion) {
    assert.equal(routine.minimal.exercises.length, template.minimalVersion.exercises.length);
    assert.equal(routine.minimal.durationMin, template.minimalVersion.durationMin || null);
  }
});
