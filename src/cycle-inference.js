import { addDays, daysBetween, localISO } from "./app-utils.js";

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

const PHASE_LABELS = {
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

const isClearBleeding = (level) => CLEAR_BLEEDING_LEVELS.includes(level);
const isFertileFluid = (fluid) => FERTILE_FLUIDS.includes(fluid);
const isLowFertilityFluid = (fluid) => LOW_FERTILITY_FLUIDS.includes(fluid);
const asNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const sortByDate = (items) => [...items].filter((item) => item?.date).sort((a, b) => a.date.localeCompare(b.date));
const clamp = (value, min, max) => Math.max(min, Math.min(max, asNumber(value)));

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

function averageCycleLength(starts) {
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

function periodContains(period, date) {
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

function cycleContext(date, periods, menstrualLogs) {
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

function hasFertileProgression(logs, fertileIndex) {
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

function confidenceFromContext(context, hasUsefulFluid, hasOvulationPattern) {
  if (context.samples >= 3 && hasUsefulFluid && hasOvulationPattern) return "high";
  if (context.samples >= 2 || hasUsefulFluid || hasOvulationPattern) return "medium";
  return "low";
}

export function symptomScore(log) {
  if (!log) return 0;
  const appetite = ["increased", "sweet_cravings", "salty_cravings"].includes(log.appetiteChange) ? 1 : 0;
  return asNumber(log.breastSensitivity) + asNumber(log.bloatingLevel) + asNumber(log.acneLevel) + appetite;
}

function reasonWithWellness(reason, wellness) {
  if (!wellness) return reason;
  const parts = [];
  if (wellness.energy != null) parts.push(`energia ${wellness.energy}/5`);
  if (wellness.sleep != null) parts.push(`${wellness.sleep} h de sueno`);
  if (!parts.length) return reason;
  return `${reason} Hoy tambien registraste ${parts.join(" y ")}; puede coincidir con la fase estimada y con tu descanso u otros factores.`;
}

export function inferCyclePhase({ date = localISO(), menstrualLogs = [], periods = [], wellness = [] } = {}) {
  const logs = sortByDate(menstrualLogs);
  const log = logs.find((item) => item.date === date) || null;
  const wellnessLog = wellness.find((item) => item.date === date) || null;
  const context = cycleContext(date, periods, logs);
  const periodEvent = periods.find((period) => periodContains(period, date));
  const ovulations = detectOvulationProbableDates(logs);
  const ovulation = ovulations.get(date);
  const lastOvulation = [...ovulations.keys()].filter((itemDate) => itemDate < date).sort().pop();
  const dpo = lastOvulation ? daysBetween(lastOvulation, date) : null;
  const hasUsefulFluid = logs.some((item) => item.cervicalFluid && !["not_checked", "unknown"].includes(item.cervicalFluid));
  const confidence = confidenceFromContext(context, hasUsefulFluid, ovulations.size > 0);

  if (log && isClearBleeding(log.bleedingLevel)) {
    return {
      date,
      phase: "menstruation",
      confidence: "high",
      reason: "Registraste sangrado menstrual claro; esto cuenta como menstruacion estimada.",
    };
  }
  if (periodEvent) {
    return {
      date,
      phase: "menstruation",
      confidence: "medium",
      reason: "La fecha cae dentro de un periodo registrado por ti.",
    };
  }
  if (ovulation) {
    return {
      date,
      phase: "ovulation_probable",
      confidence: ovulation.confidence,
      reason: `${ovulation.reason} Se muestra como probable, no como confirmacion.`,
    };
  }
  if (dpo != null && dpo >= 1 && dpo <= 4) {
    return {
      date,
      phase: "luteal_early",
      confidence,
      reason: `Han pasado ${dpo} dias desde una ovulacion probable segun el flujo registrado.`,
    };
  }
  if (context.daysToNext != null && context.daysToNext >= 0 && context.daysToNext <= 6 && context.cycleDay > 8) {
    const score = symptomScore(log);
    const base = context.nextStart
      ? `Estas a ${context.daysToNext} dias de un periodo registrado.`
      : `Estas cerca del periodo esperado segun tus ciclos registrados.`;
    return {
      date,
      phase: "luteal_late",
      confidence: score >= 3 || context.nextStart ? confidenceFromContext(context, hasUsefulFluid, true) : confidence,
      reason: reasonWithWellness(
        `${base}${score >= 3 ? " Ademas registraste sintomas compatibles con fase premenstrual." : ""}`,
        wellnessLog,
      ),
    };
  }
  if (dpo != null && dpo >= 5 && dpo <= 9) {
    return {
      date,
      phase: "luteal_mid",
      confidence,
      reason: `Han pasado ${dpo} dias desde una ovulacion probable y aun no estas cerca del periodo esperado.`,
    };
  }
  if (dpo != null && dpo > 9) {
    return {
      date,
      phase: "luteal_late",
      confidence,
      reason: reasonWithWellness("Estas despues de la lutea media y antes del siguiente periodo estimado.", wellnessLog),
    };
  }
  if (log && isFertileFluid(log.cervicalFluid)) {
    return {
      date,
      phase: "fertile_window_probable",
      confidence: hasFertileProgression(logs, logs.findIndex((item) => item.date === date)) ? "medium" : "low",
      reason: "Registraste flujo acuoso o elastico/resbaladizo, compatible con ventana fertil probable.",
    };
  }
  if (!context.currentStart) {
    return {
      date,
      phase: "unknown",
      confidence: "low",
      reason: "Aun faltan ciclos registrados para estimar esta fase.",
    };
  }
  if (context.cycleDay <= 9) {
    return {
      date,
      phase: "follicular_early",
      confidence,
      reason: "Estas despues del periodo y al inicio del ciclo segun tus registros.",
    };
  }
  return {
    date,
    phase: "follicular_mid_late",
    confidence,
    reason: "Estas antes de una ventana fertil clara; faltan mas datos de flujo para afinar la estimacion.",
  };
}

export function recalculateCycleEstimates(userId, startDate, endDate, data = {}) {
  const estimates = [];
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const estimate = inferCyclePhase({ date, ...data });
    estimates.push({ id: `${userId || "local"}:${date}`, userId, ...estimate, updatedAt: new Date().toISOString() });
  }
  return estimates;
}

export function buildCycleTimeline({ startDate, endDate, menstrualLogs = [], periods = [], wellness = [] }) {
  const logsByDate = new Map(menstrualLogs.map((log) => [log.date, log]));
  const wellnessByDate = new Map(wellness.map((log) => [log.date, log]));
  const items = [];
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const estimate = inferCyclePhase({ date, menstrualLogs, periods, wellness });
    const log = logsByDate.get(date) || {};
    const wellnessLog = wellnessByDate.get(date) || {};
    items.push({
      date,
      phase: estimate.phase,
      phaseLabel: PHASE_LABELS[estimate.phase],
      confidence: estimate.confidence,
      bleedingLevel: log.bleedingLevel || "not_logged",
      cervicalFluid: log.cervicalFluid || "not_checked",
      energy: wellnessLog.energy ?? null,
      sleep: wellnessLog.sleep ?? null,
    });
  }
  return items;
}

export function getCycleInsights({ menstrualLogs = [], periods = [], wellness = [], startDate, endDate } = {}) {
  const starts = buildCycleStarts(periods, menstrualLogs);
  const completeCycles = starts.length > 1 ? starts.length - 1 : 0;
  if (completeCycles < 2) {
    return [{
      type: "exploratory",
      message: "Con dos ciclos completos FitTrack podra comparar energia, sueno y sintomas por fase sin tratarlos como causa unica.",
      confidence: "low",
    }];
  }
  const first = startDate || starts[0];
  const last = endDate || addDays(starts[starts.length - 1], 35);
  const timeline = buildCycleTimeline({ startDate: first, endDate: last, menstrualLogs, periods, wellness });
  const byPhase = new Map();
  timeline.forEach((item) => {
    const bucket = byPhase.get(item.phase) || { energy: [], sleep: [], symptoms: [] };
    if (item.energy != null) bucket.energy.push(Number(item.energy));
    if (item.sleep != null) bucket.sleep.push(Number(item.sleep));
    const log = menstrualLogs.find((entry) => entry.date === item.date);
    if (log) bucket.symptoms.push(symptomScore(log) + asNumber(log.crampsLevel) / 3);
    byPhase.set(item.phase, bucket);
  });
  const avg = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  const insights = [];
  const lutealLate = byPhase.get("luteal_late");
  if (lutealLate && lutealLate.energy.length >= 2) {
    insights.push({
      type: "energy_by_phase",
      message: `En tus registros, la fase lutea tardia suele coincidir con energia promedio ${avg(lutealLate.energy).toFixed(1)}/5.`,
      confidence: lutealLate.energy.length >= 5 ? "medium" : "low",
    });
  }
  const lowSleepDates = wellness.filter((item) => Number(item.sleep) > 0 && Number(item.sleep) < 6).map((item) => item.date);
  const lowSleepSymptoms = menstrualLogs.filter((item) => lowSleepDates.includes(item.date)).map(symptomScore);
  if (lowSleepSymptoms.length >= 2) {
    insights.push({
      type: "sleep_and_symptoms",
      message: "Los dias con menos de 6 horas de sueno coinciden con mas sintomas en tus registros. No todo el bajon parece explicarse por la fase del ciclo.",
      confidence: "low",
    });
  }
  return insights.length ? insights : [{
    type: "phase_context",
    message: "Ya hay suficientes ciclos para empezar a cruzar fases estimadas con energia y sueno, pero aun faltan registros diarios para ver un patron claro.",
    confidence: "low",
  }];
}
