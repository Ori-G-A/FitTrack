import test from "node:test";
import assert from "node:assert/strict";
import { PACE_ALERT, goalDirection, goalSuggestion, latestWeight, weightPaceAlert, weightVsExpected } from "../src/settings-utils.js";
import { addDays } from "../src/app-utils.js";

test("latestWeight returns the newest dated measurement", () => {
  assert.equal(latestWeight([
    { date: "2026-06-14", kg: 61 },
    { date: "2026-06-10", kg: 62 },
  ]), 61);
  assert.equal(latestWeight([]), null);
});

test("goalDirection classifies weight goals", () => {
  assert.equal(goalDirection(61, 58), "perder grasa");
  assert.equal(goalDirection(61, 64), "ganar músculo");
  assert.equal(goalDirection(61, 61), "mantener");
  assert.equal(goalDirection("", 58), null);
});

test("goalSuggestion uses activity, weekly change and protein settings", () => {
  assert.deepEqual(goalSuggestion(60, {
    activity: "moderado",
    weeklyChange: -0.4,
    proteinPerKg: 2,
  }), {
    maintenance: 1920,
    kcal: 1480,
    protein: 120,
    proteinPerKg: 2,
    lowEnd: 96,
    highEnd: 144,
  });
});

// --- aviso de ritmo -------------------------------------------------------
const paceWeights = (kgPerWeek, { days = 22, from = 70, start = "2026-08-16" } = {}) =>
  Array.from({ length: days }, (_, i) => ({ date: addDays(start, i), kg: +(from + (kgPerWeek / 7) * i).toFixed(2) }));

test("el aviso de ritmo calla cuando la desviación cabe en el error de medida", () => {
  // objetivo -0,40 y real -0,50: 0,10 kg/sem está por debajo del umbral de 0,15
  assert.equal(weightPaceAlert(paceWeights(-0.5), { weeklyChange: -0.4, kcalTarget: 2000 }, "2026-09-06"), null);
});

test("el aviso de ritmo calla sin pesajes suficientes o sin ventana completa", () => {
  const goals = { weeklyChange: -0.4, kcalTarget: 2000 };
  assert.equal(weightPaceAlert(paceWeights(-0.9, { days: 6 }), goals, "2026-09-06"), null);
  // 22 pesajes pero apretados en una semana: la ventana no cubre las 3 semanas
  const apretados = Array.from({ length: 22 }, (_, i) => ({ date: addDays("2026-08-31", i % 7), kg: 70 - i * 0.05 }));
  assert.equal(weightPaceAlert(apretados, goals, "2026-09-06"), null);
});

test("bajar más rápido de lo previsto sube las kcal, redondeadas a 50", () => {
  // real -0,90 vs objetivo -0,40 => 0,50 kg/sem de más ≈ +550 kcal/día, topado en +300
  const alert = weightPaceAlert(paceWeights(-0.9), { weeklyChange: -0.4, kcalTarget: 2000 }, "2026-09-06");
  assert.equal(alert.next, 2300);
  assert.equal(alert.limited, "step");
  assert.ok(alert.next % 50 === 0);
  // La hoja "por qué veo esto" enseña el cálculo, así que las piezas viajan con
  // el aviso: sin ellas no se puede explicar de dónde sale el número.
  assert.equal(alert.rawKcal, 550);          // 0,50 kg/sem × 1100, antes del tope
  assert.ok(alert.rawKcal > PACE_ALERT.maxKcalStep);
  assert.equal(alert.from, "2026-08-16");
  assert.equal(alert.to, "2026-09-06");
  assert.ok(alert.floor > 0 && alert.weight > 0);
});

test("bajar más lento de lo previsto baja las kcal, pero nunca bajo el suelo de 22 kcal/kg", () => {
  // real -0,10 vs objetivo -0,40 => -330 kcal/día, topado en -300 => 1300,
  // pero 69,7 kg × 22 = 1533 es el suelo de disponibilidad energética
  const alert = weightPaceAlert(paceWeights(-0.1), { weeklyChange: -0.4, kcalTarget: 1600 }, "2026-09-06");
  assert.equal(alert.limited, "floor");
  assert.equal(alert.next, 1533);
  assert.ok(alert.next > 1300);
});


test("aplicar o descartar el aviso lo calla hasta que haya pesajes nuevos", () => {
  const weights = paceWeights(-0.9);
  const goals = { weeklyChange: -0.4, kcalTarget: 2000 };
  const primero = weightPaceAlert(weights, goals, "2026-09-06");
  assert.equal(primero.next, 2300);
  // Tras aplicarlo, los mismos pesajes describen la ingesta vieja: sin el corte
  // el aviso volvia a pedir +300 sobre 2300, y otra vez sobre 2600.
  const aplicado = { ...goals, kcalTarget: primero.next, paceCheckedAt: "2026-09-06" };
  assert.equal(weightPaceAlert(weights, aplicado, "2026-09-06"), null);
  // Una semana despues sigue callado: la ventana nueva aun no cubre 3 semanas.
  assert.equal(weightPaceAlert(paceWeights(-0.9, { days: 29 }), aplicado, "2026-09-13"), null);
  // Con 3 semanas de pesajes posteriores al ajuste vuelve a hablar.
  const despues = weightPaceAlert(paceWeights(-0.9, { days: 43 }), aplicado, "2026-09-27");
  assert.equal(despues.current, 2300);
  assert.ok(despues.days >= 17);
});

// --- real vs esperado -----------------------------------------------------
test("real vs esperado mide contra la recta del objetivo y marca si vas por delante", () => {
  // ancla 72,0 el 16-ago con objetivo -0,4 kg/sem: a 21 días la recta espera 70,8
  const weights = paceWeights(-0.6, { from: 72, start: "2026-08-16" });
  const vs = weightVsExpected(weights, { weeklyChange: -0.4, targetWeight: 68 }, "2026-09-06");
  assert.equal(vs.expected, 70.8);
  assert.equal(vs.real, 70.2);
  assert.equal(vs.delta, -0.6);
  assert.equal(vs.ahead, true);
  assert.equal(vs.series.length, 22);
});

test("la proyección usa el ritmo real y desaparece si te alejas de la meta", () => {
  const bajando = weightVsExpected(paceWeights(-0.7, { from: 72 }), { weeklyChange: -0.4, targetWeight: 68 }, "2026-09-06");
  assert.ok(bajando.projection > "2026-09-06");
  const subiendo = weightVsExpected(paceWeights(0.3, { from: 72 }), { weeklyChange: -0.4, targetWeight: 68 }, "2026-09-06");
  assert.equal(subiendo.projection, null);
});

test("real vs esperado calla con un solo pesaje", () => {
  assert.equal(weightVsExpected([{ date: "2026-09-06", kg: 70 }], { weeklyChange: -0.4 }, "2026-09-06"), null);
});

test("real vs esperado ancla en la ventana de 12 semanas, no en el primer pesaje", () => {
  // Un año de registros: anclar en el primero mediria contra un objetivo viejo y
  // daria un hueco de decenas de kilos.
  const viejos = Array.from({ length: 40 }, (_, i) => ({ date: addDays("2025-09-01", i), kg: 90 }));
  const recientes = paceWeights(-0.4, { from: 72, start: "2026-08-16" });
  const vs = weightVsExpected([...viejos, ...recientes], { weeklyChange: -0.4 }, "2026-09-06");
  assert.equal(vs.series[0].iso, "2026-08-16");
  assert.equal(vs.expected, 70.8);
  assert.ok(Math.abs(vs.delta) <= 0.1);
  // startWeight solo manda cuando el historial entero cabe en la ventana.
  const corto = weightVsExpected(recientes, { weeklyChange: -0.4, startWeight: "75" }, "2026-09-06");
  assert.equal(corto.expected, 73.8);
});
