import { localISO, addDays, daysBetween } from "./date-utils.js";
import { PHASE_GROUPS } from "./body-config.js";
import { CLEAR_BLEEDING_LEVELS, cycleContext, symptomScore, ovulationEstimate } from "./cycle-context.js";
import { inferCyclePhase } from "./cycle-phase.js";
import { phaseSegments } from "./cycle-summary.js";

export const descendingWeights = (weights) => [...weights].sort((a, b) => b.date.localeCompare(a.date));
export const weightPoints = (weights, formatDate) => [...weights].sort((a, b) => a.date.localeCompare(b.date)).map((w) => ({ date: formatDate(w.date), kg: w.kg }));
export const descendingMeasurements = (measurements) => [...measurements].sort((a, b) => b.date.localeCompare(a.date));
export const ascendingMeasurements = (measurements) => [...measurements].sort((a, b) => a.date.localeCompare(b.date));
export const waistPoints = (measurements, formatDate) => [...measurements].filter((m) => m.cintura != null).sort((a, b) => a.date.localeCompare(b.date)).map((m) => ({ date: formatDate(m.date), cintura: m.cintura }));
export const descendingWellness = (wellness) => [...wellness].sort((a, b) => b.date.localeCompare(a.date));

export function targetWeightSeries(maSeries, goals) {
  if (!maSeries.length) return [];
  const start = maSeries[0]; const startKg = goals.startWeight ? Number(goals.startWeight) : start.real;
  return maSeries.map((p) => ({ ...p, objetivo: Number((startKg + goals.weeklyChange * (daysBetween(start.iso, p.iso) / 7)).toFixed(2)) }));
}

export function weightChange7(sortedW) {
  if (sortedW.length < 2) return null;
  const last = sortedW[sortedW.length - 1];
  const ref = [...sortedW].reverse().find((w) => daysBetween(w.date, last.date) >= 7);
  return ref ? Math.round((last.kg - ref.kg) * 10) / 10 : null;
}

export function measurementDelta(measSorted, key) {
  const samples = measSorted.filter((m) => m[key] != null);
  return samples.length >= 2 ? samples[samples.length - 1][key] - samples[0][key] : null;
}

export function currentCycleOverview({ date, periods, menstrualLogs, wellness }) {
  const ctx = cycleContext(date, periods, menstrualLogs);
  if (!ctx.currentStart) return null;
  const phase = PHASE_GROUPS[inferCyclePhase({ date, menstrualLogs, periods, wellness }).phase];
  const logs = menstrualLogs.filter((log) => log.date >= ctx.currentStart && log.date <= date);
  return {
    phase, day: ctx.cycleDay, daysToNext: ctx.daysToNext, avgCycle: ctx.avgCycle, samples: ctx.samples,
    start: ctx.currentStart, nextPeriod: ctx.nextPeriod,
    segments: phaseSegments(ctx.currentStart, date, periods, menstrualLogs),
    logged: logs.length,
    bleedDays: logs.filter((log) => CLEAR_BLEEDING_LEVELS.includes(log.bleedingLevel)).length,
    symptomDays: logs.filter((log) => symptomScore(log) >= 3).length,
    ovulation: ovulationEstimate({ date, periods, menstrualLogs }),
  };
}

export function stepsToday(wellness = [], date = localISO()) {
  const day = wellness.find((w) => w.date === date);
  const from = addDays(date, -7);
  const week = wellness.filter((w) => w.date >= from && w.date < date && Number(w.steps) > 0).map((w) => Number(w.steps));
  return {
    today: Number(day?.steps) > 0 ? Number(day.steps) : null,
    avg: week.length ? Math.round(week.reduce((sum, n) => sum + n, 0) / week.length) : null,
    days: week.length,
  };
}

export function bodyFeedEntries(date, { weights = [], measurements = [], wellness = [] } = {}) {
  const entries = [];
  const weight = weights.find((w) => w.date === date);
  if (weight) entries.push({ id: `p-${weight.id || date}`, kind: "peso", title: `${String(weight.kg).replace(".", ",")} kg`, meta: "peso corporal", tab: "peso", done: true });

  const measure = measurements.find((m) => m.date === date);
  if (measure) {
    const parts = ["cintura", "cadera", "pecho", "brazo", "muslo"]
      .filter((key) => Number(measure[key]) > 0)
      .map((key) => `${key} ${String(measure[key]).replace(".", ",")}`);
    if (parts.length) entries.push({ id: `m-${measure.id || date}`, kind: "medidas", title: "Medidas", meta: `${parts.join(" · ")} cm`, tab: "medidas", done: true });
  }

  const note = wellness.find((w) => w.date === date);
  if (note && (note.sleep != null || note.steps != null || note.energy || (note.notes || "").trim())) {
    const meta = [
      note.sleep != null ? `${String(note.sleep).replace(".", ",")} h de sueño` : null,
      note.steps ? `${Number(note.steps).toLocaleString("es-ES")} pasos` : null,
      note.energy ? `energía ${note.energy}` : null,
      (note.notes || "").trim() || null,
    ].filter(Boolean).join(" · ");
    entries.push({ id: `s-${note.id || date}`, kind: "nota", title: "Nota del día", meta, tab: "nota", done: true, search: note.notes || "" });
  }

  return entries;
}
