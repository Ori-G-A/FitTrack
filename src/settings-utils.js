import { localISO } from "./date-utils.js";
import { slopePerDay, weightTrendHighlight } from "./app-utils.js";
import { evaluateWeightPace, compareWeightExpected } from "./goals-model.js";
export { latestWeight, goalDirection, goalSuggestion, PACE_ALERT, VS_EXPECTED_WINDOW_DAYS } from "./goals-model.js";

// La inferencia existente se ejecuta dentro del modelo, después de sus guardas.
export function weightPaceAlert(weights = [], goals = {}, today = localISO()) {
  return evaluateWeightPace(weights, goals, today, slopePerDay);
}
export function weightVsExpected(weights = [], goals = {}, today = localISO()) {
  return compareWeightExpected(weights, goals, today, weightTrendHighlight);
}
