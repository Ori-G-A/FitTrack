import { addDays, daysBetween, localISO } from "./date-utils.js";
import { isClearBleeding, asNumber, sortByDate, clamp, buildCycleStarts, ovulationEstimate } from "./cycle-context.js";
import { buildCycleTimeline } from "./cycle-phase.js";

const BLEEDING_WEIGHT = { spotting: 0.25, light: 0.5, medium: 0.75, heavy: 1 };

// Pistas de la vista compacta: cada una lee un sintoma y lo normaliza a 0-1.
export const SYMPTOM_TRACKS = [
  { key: "bleeding", label: "sangrado", value: (log) => BLEEDING_WEIGHT[log.bleedingLevel] || 0 },
  { key: "cramps", label: "colicos", value: (log) => clamp(log.crampsLevel, 0, 10) / 10 },
  { key: "bloating", label: "hinchazon", value: (log) => clamp(log.bloatingLevel, 0, 3) / 3 },
  { key: "breast", label: "senos", value: (log) => clamp(log.breastSensitivity, 0, 3) / 3 },
  { key: "acne", label: "acne", value: (log) => clamp(log.acneLevel, 0, 3) / 3 },
];

// Tramos consecutivos de una misma fase dentro de un ciclo, para dibujarlo segmentado.
// ponytail: recorre dia por dia; con anos de registros conviene memorizar inferCyclePhase.
export function phaseSegments(start, end, periods = [], menstrualLogs = []) {
  if (!start || !end || end < start) return [];
  const segments = [];
  buildCycleTimeline({ startDate: start, endDate: end, periods, menstrualLogs }).forEach((item) => {
    const last = segments[segments.length - 1];
    if (last && last.phase === item.phase) {
      last.days += 1;
      return;
    }
    segments.push({ phase: item.phase, label: item.phaseLabel, startDay: daysBetween(start, item.date) + 1, days: 1 });
  });
  return segments;
}

// Un ciclo por fila, no un dia por fila: largo real y dias de sangrado medidos,
// nunca una duracion asumida el dia uno.
export function summarizeCycles(periods = [], menstrualLogs = [], today = localISO()) {
  const starts = buildCycleStarts(periods, menstrualLogs);
  const logByDate = new Map(sortByDate(menstrualLogs).map((log) => [log.date, log]));
  const periodByDate = new Map(sortByDate(periods).map((period) => [period.date, period]));
  const cycles = starts.map((start, index) => {
    const nextStart = starts[index + 1] || null;
    let bleedDays = 0;
    // ponytail: tope de 15 dias, un sangrado mas largo que eso es tema de consulta, no de UI
    for (let date = start; bleedDays < 15 && (!nextStart || date < nextStart); date = addDays(date, 1)) {
      if (!isClearBleeding(logByDate.get(date)?.bleedingLevel)) break;
      bleedDays += 1;
    }
    const period = periodByDate.get(start);
    return {
      start,
      nextStart,
      segments: phaseSegments(start, nextStart ? addDays(nextStart, -1) : today, periods, menstrualLogs),
      ovulation: ovulationEstimate({ date: start, periods, menstrualLogs }),
      length: nextStart ? daysBetween(start, nextStart) : null,
      bleedDays: bleedDays || asNumber(period?.duration, 0) || null,
      periodId: period?.id || null,
      logId: logByDate.get(start)?.id || null,
    };
  });
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const lengths = cycles.map((cycle) => cycle.length).filter((length) => length >= 18 && length <= 45);
  const bleeds = cycles.map((cycle) => cycle.bleedDays).filter((days) => days > 0);
  return {
    cycles: [...cycles].reverse(),
    avgCycle: lengths.length ? Math.round(mean(lengths)) : 28,
    samples: lengths.length,
    spread: lengths.length > 1 ? Math.max(...lengths) - Math.min(...lengths) : null,
    avgBleed: bleeds.length ? Math.round(mean(bleeds) * 10) / 10 : null,
    outliers: cycles.filter((cycle) => cycle.length != null && (cycle.length < 18 || cycle.length > 45)).length,
  };
}

// Distribucion: donde cae cada sintoma dentro del ciclo, en `bins` tramos iguales.
export function symptomDistribution({ periods = [], menstrualLogs = [], bins = 6 } = {}) {
  const { cycles, avgCycle } = summarizeCycles(periods, menstrualLogs);
  const byStart = new Map(cycles.map((cycle) => [cycle.start, cycle]));
  const starts = [...byStart.keys()].sort().reverse();
  const points = [];
  sortByDate(menstrualLogs).forEach((log) => {
    const start = starts.find((item) => item <= log.date);
    if (!start) return;
    const length = byStart.get(start).length || avgCycle;
    const cycleDay = daysBetween(start, log.date) + 1;
    points.push({ log, cycleDay, bin: Math.min(bins - 1, Math.floor(((cycleDay - 1) / length) * bins)) });
  });
  return SYMPTOM_TRACKS.map((track) => {
    const buckets = Array.from({ length: bins }, () => ({ sum: 0, count: 0 }));
    const byDay = new Map();
    let days = 0;
    points.forEach(({ log, cycleDay, bin }) => {
      const value = track.value(log);
      buckets[bin].sum += value;
      buckets[bin].count += 1;
      const day = byDay.get(cycleDay) || { sum: 0, count: 0 };
      byDay.set(cycleDay, { sum: day.sum + value, count: day.count + 1 });
      if (value > 0) days += 1;
    });
    const peak = [...byDay.entries()]
      .filter(([, day]) => day.sum > 0)
      .sort((a, b) => b[1].sum / b[1].count - a[1].sum / a[1].count)[0];
    return {
      key: track.key,
      label: track.label,
      bins: buckets.map((bucket) => (bucket.count ? bucket.sum / bucket.count : 0)),
      days,
      peakDay: peak ? peak[0] : null,
    };
  }).filter((track) => track.days > 0);
}
