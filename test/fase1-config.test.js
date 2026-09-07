import test from "node:test";
import assert from "node:assert/strict";
import {
  PROTEIN_CONFIG, ROUTINE_TEMPLATES, computeProteinTargets, distributeProtein,
  getAllRoutines, getRoutineById, guessEquipmentLevel, guessPrimaryMuscle,
  routinePlace, suggestRoutineForDay, templateToAppRoutine, WARMUP,
} from "../src/fase1Config.js";

test("computeProteinTargets calculates and clamps grams per kilogram", () => {
  assert.deepEqual(computeProteinTargets(61), {
    gPerKg: 2,
    weightKg: 61,
    dailyTarget: 122,
    lowEnd: Math.round(61 * PROTEIN_CONFIG.minGPerKg),
    highEnd: Math.round(61 * PROTEIN_CONFIG.maxGPerKg),
  });
  assert.equal(computeProteinTargets(61, { gPerKg: 99 }).gPerKg, PROTEIN_CONFIG.maxGPerKg);
  assert.equal(computeProteinTargets(61, { gPerKg: 0.5 }).gPerKg, PROTEIN_CONFIG.minGPerKg);
  // lowEnd/highEnd deben seguir el min/max configurado, no un rango fijo distinto
  assert.deepEqual(computeProteinTargets(61, { minGPerKg: 1.8, maxGPerKg: 2.2 }), {
    gPerKg: 2,
    weightKg: 61,
    dailyTarget: 122,
    lowEnd: 110,
    highEnd: 134,
  });
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

// --- dónde se puede hacer cada rutina ---------------------------------------
test("el equipo se infiere del nombre, y lo explícito gana a lo mencionado de paso", () => {
  // "sin peso" manda aunque el nombre nombre una banda o un disco como opción.
  assert.equal(guessEquipmentLevel("Bisagra de cadera sin peso o con banda (3×12)"), 0);
  assert.equal(guessEquipmentLevel("Sentadilla lenta sin peso o disco liviano"), 0);
  // Máquina, polea y barra de dominadas son gimnasio sí o sí.
  assert.equal(guessEquipmentLevel("Curl femoral (máquina)"), 2);
  assert.equal(guessEquipmentLevel("Jalón al pecho"), 2);
  assert.equal(guessEquipmentLevel("Dominadas"), 2);
  // "Remo" a secas se lee como remo con barra; en TRX, no.
  assert.equal(guessEquipmentLevel("Remo"), 2);
  assert.equal(guessEquipmentLevel("Remo suave en TRX"), 1);
  // Igual con la sentadilla: desnuda es con barra, con apellido no.
  assert.equal(guessEquipmentLevel("Sentadilla"), 2);
  assert.equal(guessEquipmentLevel("Sentadilla búlgara"), 1);
  assert.equal(guessEquipmentLevel("Sentadilla goblet"), 1);
  // Peso corporal puro.
  assert.equal(guessEquipmentLevel("Plancha"), 0);
  assert.equal(guessEquipmentLevel("Puente de glúteo en piso"), 0);
  // Sin pistas, lo prudente es asumir que hace falta algo.
  assert.equal(guessEquipmentLevel("Ejercicio raro"), 1);
});

test("una rutina vale para el nivel de su ejercicio más exigente", () => {
  assert.equal(routinePlace({ exercises: [{ name: "Plancha" }, { name: "Bird dog" }] }), "casa sin equipo");
  assert.equal(routinePlace({ exercises: [{ name: "Plancha" }, { name: "Curl bíceps" }] }), "casa con equipo");
  // Un solo movimiento de polea arrastra la sesión entera al gimnasio.
  assert.equal(routinePlace({ exercises: [{ name: "Plancha" }, { name: "Jalón al pecho" }] }), "gimnasio");
  assert.equal(routinePlace({ exercises: [] }), "casa sin equipo");
});

test("las plantillas reales se reparten como es su programa", () => {
  const place = Object.fromEntries(ROUTINE_TEMPLATES.map((t) => [t.id, routinePlace(t)]));
  // Su split de fuerza es de gimnasio: banca, dominadas, peso muerto, máquinas.
  assert.equal(place.empuje, "gimnasio");
  assert.equal(place.traccion, "gimnasio");
  // El accesorio y la sesión amable salen de casa.
  assert.equal(place["accesorio-core-brazos"], "casa con equipo");
  assert.equal(place.amable, "casa con equipo");
  // Ninguna es "sin material": el calentamiento obligatorio pide minibanda.
  assert.equal(Math.max(...WARMUP.exercises.map((e) => guessEquipmentLevel(e.name))), 1);
});
