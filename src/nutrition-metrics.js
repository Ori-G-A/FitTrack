import { addDays, localISO } from "./date-utils.js";
import { KCAL_PER_KG } from "./app-config.js";

export function proteinAdherence(nutrition = [], target, today = localISO(), days = 7) {
  const goal = Number(target) || 0;
  if (!goal) return null;
  const since = addDays(today, -(days - 1));
  const byDate = new Map();
  nutrition
    .filter((item) => item.date >= since && item.date <= today)
    .forEach((item) => byDate.set(item.date, (byDate.get(item.date) || 0) + (Number(item.protein) || 0)));
  if (byDate.size === 0) return null;
  const logged = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, grams]) => Math.round(grams));
  // 90% del objetivo cuenta como dia cumplido: el pesaje de comida no da para mas precision.
  return {
    onTarget: logged.filter((grams) => grams >= goal * 0.9).length,
    logged: logged.length,
    days,
    target: goal,
    avg: Math.round(logged.reduce((sum, grams) => sum + grams, 0) / logged.length),
    series: logged,
  };
}

export function maintenanceFromNutrition(entries, trend) {
 const byDay = {};
 entries.forEach((n) => { byDay[n.date] = (byDay[n.date] || 0) + (+n.kcal || 0); });
 const loggedDays = Object.values(byDay).filter((v) => v > 50);
 if (loggedDays.length < 10 || trend === null) return null;
 const avgKcal = loggedDays.reduce((s, v) => s + v, 0) / loggedDays.length;
 return { maint: Math.round(avgKcal - (trend / 7) * KCAL_PER_KG), days: loggedDays.length, avgKcal: Math.round(avgKcal) };
}
export function meanNutritionProtein(entries) {
 const byDay = {};
 entries.forEach((n) => { byDay[n.date] = (byDay[n.date] || 0) + (+n.protein || 0); });
 const vals = Object.values(byDay);
 return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
}
// dateAt y formatDate son dependencias explícitas del adaptador de calendario.
export function nutritionKcalSeries(nutrition, dateAt, formatDate) {
 const days = [];
 for (let i = 13; i >= 0; i--) { const iso = dateAt(i); const kcal = nutrition.filter((n) => n.date === iso).reduce((t, n) => t + (+n.kcal || 0), 0); days.push({ date: formatDate(iso), kcal: Math.round(kcal) }); }
 return days;
}
export function positiveKcalAverage(kcalChart) {
 const vals = kcalChart.map((d) => d.kcal).filter((v) => v > 0);
 return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
}
export function nutritionMacroAverage(entries) {
 const byDay = {};
 entries.forEach((n) => { const d = byDay[n.date] || (byDay[n.date] = { p: 0, c: 0, f: 0, k: 0 }); d.p += +n.protein || 0; d.c += +n.carbs || 0; d.f += +n.fat || 0; d.k += +n.kcal || 0; });
 const ds = Object.values(byDay); if (!ds.length) return null;
 const avg = (k) => ds.reduce((s, d) => s + d[k], 0) / ds.length;
 return { p: avg("p"), c: avg("c"), f: avg("f"), k: avg("k"), days: ds.length };
}
export const nutritionTrainingDays = (workouts, dateAt) => new Set(workouts.filter((w) => w.date >= dateAt(7) && (w.exercises.length || (w.cardio || []).length)).map((w) => w.date)).size;
export const nutritionDayCount = (entries) => new Set(entries.map((n) => n.date)).size;
export function nutritionMacroTargets(goals, trainingDays7) {
 const pt = Number(goals.proteinTarget) || null, kt = Number(goals.kcalTarget) || null;
 if (!kt) return { p: pt, c: null, f: null };
 const rem = Math.max(0, kt - (pt || 0) * 4);
 const CARB_RATIO_TRAIN = 0.60, CARB_RATIO_REST = 0.45;
 const trainFrac = Math.min(1, trainingDays7 / 7);
 const carbRatio = CARB_RATIO_REST + (CARB_RATIO_TRAIN - CARB_RATIO_REST) * trainFrac;
 return { p: pt, c: rem * carbRatio / 4, f: rem * (1 - carbRatio) / 9 };
}
