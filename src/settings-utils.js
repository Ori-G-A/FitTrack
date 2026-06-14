import { ACTIVITY_LEVELS, KCAL_PER_KG } from "./app-config.js";
import { computeProteinTargets } from "./fase1Config.js";

export function latestWeight(weights) {
  if (!Array.isArray(weights) || weights.length === 0) return null;
  return [...weights].sort((a, b) => a.date.localeCompare(b.date)).at(-1)?.kg ?? null;
}

export function goalDirection(startWeight, targetWeight) {
  const start = Number(startWeight);
  const target = Number(targetWeight);
  if (!start || !target) return null;
  if (target < start) return "perder grasa";
  if (target > start) return "ganar músculo";
  return "mantener";
}

export function goalSuggestion(referenceWeight, goals) {
  const weight = Number(referenceWeight);
  if (!weight) return null;
  const activity = ACTIVITY_LEVELS.find((item) => item.key === goals.activity) || ACTIVITY_LEVELS[2];
  const maintenance = weight * activity.factor;
  const kcal = Math.round((maintenance + (Number(goals.weeklyChange) * KCAL_PER_KG) / 7) / 10) * 10;
  const protein = computeProteinTargets(weight, { gPerKg: goals.proteinPerKg ?? 2 });
  return {
    maintenance: Math.round(maintenance),
    kcal,
    protein: protein.dailyTarget,
    proteinPerKg: protein.gPerKg,
    lowEnd: protein.lowEnd,
    highEnd: protein.highEnd,
  };
}
