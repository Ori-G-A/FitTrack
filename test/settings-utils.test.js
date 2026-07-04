import test from "node:test";
import assert from "node:assert/strict";
import { goalDirection, goalSuggestion, latestWeight } from "../src/settings-utils.js";

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
