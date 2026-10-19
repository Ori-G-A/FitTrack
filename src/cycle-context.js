import { addDays, daysBetween, localISO } from "./date-utils.js";

export const CLEAR_BLEEDING_LEVELS = ["light", "medium", "heavy"];
export const FERTILE_FLUIDS = ["watery", "slippery_eggwhite"];
export const LOW_FERTILITY_FLUIDS = ["dry", "sticky", "creamy"];

export const MENSTRUAL_DAILY_LOG_FIELDS = [
  "id",
  "date",
  "bleedingLevel",
  "cervicalFluid",
  "crampsLevel",
  "breastSensitivity",
  "bloatingLevel",
  "acneLevel",
  "appetiteChange",
  "pelvicPain",
  "hasSpotting",
  "notes",
  "createdAt",
  "updatedAt",
];

export const PHASE_LABELS = {
  menstruation: "menstruacion",
  follicular_early: "folicular temprana",
  follicular_mid_late: "folicular media/tardia",
  fertile_window_probable: "ventana fertil probable",
  ovulation_probable: "ovulacion probable",
  luteal_early: "lutea temprana",
  luteal_mid: "lutea media",
  luteal_late: "lutea tardia",
  unknown: "por estimar",
};

export const isClearBleeding = (level) => CLEAR_BLEEDING_LEVELS.includes(level);
export const isFertileFluid = (fluid) => FERTILE_FLUIDS.includes(fluid);
export const isLowFertilityFluid = (fluid) => LOW_FERTILITY_FLUIDS.includes(fluid);
export const asNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const sortByDate = (items) => [...items].filter((item) => item?.date).sort((a, b) => a.date.localeCompare(b.date));
export const clamp = (value, min, max) => Math.max(min, Math.min(max, asNumber(value)));

export function emptyMenstrualLog(date = localISO()) {
  return {
    id: "",
    date,
    bleedingLevel: "not_logged",
    cervicalFluid: "not_checked",
    crampsLevel: 0,
    breastSensitivity: 0,
    bloatingLevel: 0,
    acneLevel: 0,
    appetiteChange: "not_logged",
    pelvicPain: "not_logged",
    hasSpotting: false,
    notes: "",
    createdAt: "",
    updatedAt: "",
  };
}

export function normalizeMenstrualLog(input, now = new Date()) {
  const base = emptyMenstrualLog(input?.date || localISO(now));
  const createdAt = input?.createdAt || now.toISOString();
  return {
    ...base,
    ...input,
    bleedingLevel: input?.bleedingLevel || input?.bleeding_level || base.bleedingLevel,
    cervicalFluid: input?.cervicalFluid || input?.cervical_fluid || base.cervicalFluid,
    crampsLevel: clamp(input?.crampsLevel ?? input?.cramps_level, 0, 10),
    breastSensitivity: clamp(input?.breastSensitivity ?? input?.breast_sensitivity, 0, 3),
    bloatingLevel: clamp(input?.bloatingLevel ?? input?.bloating_level, 0, 3),
    acneLevel: clamp(input?.acneLevel ?? input?.acne_level, 0, 3),
    appetiteChange: input?.appetiteChange || input?.appetite_change || base.appetiteChange,
    pelvicPain: input?.pelvicPain || input?.pelvic_pain || base.pelvicPain,
    hasSpotting: Boolean(input?.hasSpotting ?? input?.has_spotting ?? input?.bleedingLevel === "spotting"),
    notes: String(input?.notes || "").trim(),
    createdAt,
    updatedAt: now.toISOString(),
  };
}

export function averageCycleLength(starts) {
  const lengths = [];
  for (let index = 1; index < starts.length; index += 1) {
    lengths.push(daysBetween(starts[index - 1], starts[index]));
  }
  const valid = lengths.filter((length) => length >= 18 && length <= 45);
  return {
    avgCycle: valid.length ? Math.round(valid.reduce((sum, length) => sum + length, 0) / valid.length) : 28,
    samples: valid.length,
  };
}

export function periodContains(period, date) {
  const duration = Math.max(1, asNumber(period.duration, 5));
  return date >= period.date && date <= addDays(period.date, duration - 1);
}

export function buildCycleStarts(periods = [], menstrualLogs = []) {
  const starts = new Set(sortByDate(periods).map((period) => period.date));
  const logs = sortByDate(menstrualLogs);
  logs.forEach((log, index) => {
    if (!isClearBleeding(log.bleedingLevel)) return;
    const previous = logs[index - 1];
    const continuesBleeding = previous && isClearBleeding(previous.bleedingLevel) && daysBetween(previous.date, log.date) === 1;
    const coveredByPeriod = [...starts].some((date) => periodContains({ date, duration: 7 }, log.date));
    if (!continuesBleeding && !coveredByPeriod) starts.add(log.date);
  });
  return [...starts].sort();
}

export function cycleContext(date, periods, menstrualLogs) {
  const starts = buildCycleStarts(periods, menstrualLogs);
  const { avgCycle, samples } = averageCycleLength(starts);
  const currentStart = [...starts].reverse().find((start) => start <= date) || null;
  const nextStart = starts.find((start) => start > date) || null;
  const expectedNext = currentStart ? addDays(currentStart, avgCycle) : null;
  const nextPeriod = nextStart || expectedNext;
  return {
    starts,
    avgCycle,
    samples,
    currentStart,
    nextStart,
    nextPeriod,
    cycleDay: currentStart ? daysBetween(currentStart, date) + 1 : null,
    daysToNext: nextPeriod ? daysBetween(date, nextPeriod) : null,
  };
}

// Dia probable de ovulacion del ciclo que contiene `date`: si el flujo lo delata se
// usa ese dia; si no, se estima restando la fase lutea al proximo periodo.
// ponytail: lutea fija de 14 dias, el estandar; con temperatura basal se afinaria.
export const LUTEAL_LENGTH = 14;

export function ovulationEstimate({ date = localISO(), periods = [], menstrualLogs = [] } = {}) {
  const context = cycleContext(date, periods, menstrualLogs);
  if (!context.currentStart) return null;
  const detected = [...detectOvulationProbableDates(menstrualLogs).values()]
    .filter((item) => item.date >= context.currentStart && (!context.nextStart || item.date < context.nextStart))
    .pop();
  const day = detected?.date || (context.nextPeriod ? addDays(context.nextPeriod, -LUTEAL_LENGTH) : null);
  if (!day || day < context.currentStart) return null;
  return {
    date: day,
    cycleDay: daysBetween(context.currentStart, day) + 1,
    source: detected ? "flujo" : "calendario",
    confidence: detected ? detected.confidence : context.samples >= 3 ? "medium" : "low",
  };
}

export function hasFertileProgression(logs, fertileIndex) {
  const previous = logs.slice(Math.max(0, fertileIndex - 4), fertileIndex).map((log) => log.cervicalFluid);
  return previous.some((fluid) => fluid === "creamy")
    && previous.some((fluid) => fluid === "dry" || fluid === "sticky");
}

export function detectOvulationProbableDates(menstrualLogs = []) {
  const logs = sortByDate(menstrualLogs);
  const dates = new Map();
  for (let index = 0; index < logs.length - 1; index += 1) {
    const log = logs[index];
    const next = logs[index + 1];
    if (!isFertileFluid(log.cervicalFluid) || !isLowFertilityFluid(next.cervicalFluid)) continue;
    if (daysBetween(log.date, next.date) > 2) continue;
    const pelvicPain = ["left", "right", "center", "general"].includes(log.pelvicPain);
    const progression = hasFertileProgression(logs, index);
    dates.set(log.date, {
      date: log.date,
      confidence: progression && pelvicPain ? "high" : progression || pelvicPain ? "medium" : "low",
      reason: pelvicPain
        ? "Ultimo dia de flujo fertil seguido de cambio a flujo menos fertil, con dolor pelvico registrado."
        : "Ultimo dia de flujo fertil seguido de cambio a flujo menos fertil.",
    });
  }
  return dates;
}

export function confidenceFromContext(context, hasUsefulFluid, hasOvulationPattern) {
  if (context.samples >= 3 && hasUsefulFluid && hasOvulationPattern) return "high";
  if (context.samples >= 2 || hasUsefulFluid || hasOvulationPattern) return "medium";
  return "low";
}

export function symptomScore(log) {
  if (!log) return 0;
  const appetite = ["increased", "sweet_cravings", "salty_cravings"].includes(log.appetiteChange) ? 1 : 0;
  return asNumber(log.breastSensitivity) + asNumber(log.bloatingLevel) + asNumber(log.acneLevel) + appetite;
}
