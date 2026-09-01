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
  // El check-in del dia manda sobre la duracion asumida del periodo: si registraste
  // "no hubo" o "manchado", no estas menstruando aunque el periodo dure 5 dias en papel.
  const loggedNoBleeding = Boolean(log) && log.bleedingLevel !== "not_logged" && !isClearBleeding(log.bleedingLevel);
  const periodEvent = loggedNoBleeding ? null : periods.find((period) => periodContains(period, date));
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

// Que esta pasando hormonalmente, que es esperable y que hacer hoy. Las pautas de
// carga siguen la autoregulacion por RPE de la app; las de comida dan rango, no cifra.
export const PHASE_GUIDANCE = {
  menstruation: {
    hormones: "Estrogeno y progesterona en su punto mas bajo: el sangrado empieza justo cuando caen.",
    expected: "Colicos los primeros dias, energia variable y algo mas de peso por agua. Que la fuerza se sienta igual que siempre tambien es normal.",
    training: "Entrena tu sesion habitual si te sientes bien; el calentamiento no se salta. Con colicos o energia baja usa la version minima de la plantilla, no la suspendas.",
    nutrition: "Sosten la proteina en el extremo alto de tu rango (1.6-2.2 g/kg, alto por el deficit) y sube liquidos mientras sangras.",
  },
  follicular_early: {
    hormones: "Estrogeno empezando a subir desde el minimo, progesterona baja.",
    expected: "La energia suele ir en recuperacion y los sintomas del sangrado se apagan.",
    training: "Buena ventana para volver a tu carga habitual. Sube algo solo si ya completaste 2+ sesiones al RPE objetivo.",
    nutrition: "Sin ajustes especiales: manten kcal y proteina en tu objetivo del dia.",
  },
  follicular_mid_late: {
    hormones: "Estrogeno en ascenso hacia su pico.",
    expected: "Suele ser cuando mejor se tolera el trabajo duro y mejor se recupera entre series.",
    training: "Ventana para los top sets exigentes (RPE 8-9 en el principal) con backoff despues; el resto de series no van al fallo.",
    nutrition: "Aprovecha para cubrir bien los carbohidratos alrededor de la sesion; la proteina sigue en su rango.",
  },
  fertile_window_probable: {
    hormones: "Estrogeno alto y moco cervical fertil; el pico de LH esta cerca.",
    expected: "Energia alta y, en algunas personas, mas laxitud articular.",
    training: "Puedes empujar carga, pero cuida especialmente la tecnica en los ejercicios pesados.",
    nutrition: "Sin cambios: kcal y proteina en tu objetivo.",
  },
  ovulation_probable: {
    hormones: "Pico de LH y estrogeno; despues ambos caen y empieza a subir la progesterona.",
    expected: "Pico frecuente de energia, a veces dolor pelvico de un lado que dura horas.",
    training: "Dia valido para intensidad alta. Si hay dolor pelvico agudo, baja rango antes que carga.",
    nutrition: "Sin cambios: kcal y proteina en tu objetivo.",
  },
  luteal_early: {
    hormones: "Progesterona subiendo, con un rebote de estrogeno detras.",
    expected: "Temperatura basal algo mas alta y percepcion de esfuerzo que puede subir con el mismo peso.",
    training: "Manten la carga y autoregula por RPE: si el mismo peso se siente mas pesado, esa es la lectura, no un retroceso.",
    nutrition: "El gasto en reposo sube un poco; si aparece mas hambre, cubrela con proteina y volumen antes que con extras.",
  },
  luteal_mid: {
    hormones: "Progesterona en meseta alta, estrogeno intermedio.",
    expected: "Apetito mas alto, sueno algo mas ligero y retencion de agua incipiente.",
    training: "Sesion normal. Si el sueno cae por debajo de 6 h varios dias, cuenta como fatiga acumulada, no como falta de ganas.",
    nutrition: "Proteina en el extremo alto del rango: ayuda a la saciedad sin tocar el deficit.",
  },
  luteal_late: {
    hormones: "Progesterona y estrogeno cayendo juntos: es la caida que dispara el sindrome premenstrual.",
    expected: "Hinchazon, antojos, peor recuperacion y peso mas alto por agua. Que el rendimiento fluctue aqui es normal.",
    training: "Con sintomas marcados o energia baja, la version minima de la plantilla es la opcion correcta; no intentes un top set nuevo.",
    nutrition: "Los antojos dulces o salados son esperables y no son un fallo del deficit. El peso de estos dias es agua: leelo en la tendencia, no en el dato suelto.",
  },
  unknown: {
    hormones: "Faltan registros para ubicar la fase hormonal del dia.",
    expected: "Con unos dias de check-in seguidos la estimacion se afina sola.",
    training: "Entrena por sensaciones y RPE, como cualquier dia sin dato.",
    nutrition: "Manten kcal y proteina en tu objetivo del dia.",
  },
};

export function dailyGuidance({ date = localISO(), menstrualLogs = [], periods = [], wellness = [] } = {}) {
  const estimate = inferCyclePhase({ date, menstrualLogs, periods, wellness });
  const base = PHASE_GUIDANCE[estimate.phase] || PHASE_GUIDANCE.unknown;
  const log = menstrualLogs.find((item) => item.date === date) || null;
  const wellnessLog = wellness.find((item) => item.date === date) || null;
  const notes = [];
  if (log && isClearBleeding(log.bleedingLevel)) notes.push("Registraste sangrado claro hoy: el peso de estos dias carga agua, no lo leas como tendencia.");
  if (asNumber(log?.crampsLevel) >= 5) notes.push("Colicos 5+: hoy toca la version minima de la sesion, no una progresion de carga.");
  if (log && isFertileFluid(log.cervicalFluid)) notes.push("Flujo acuoso o elastico: compatible con estrogeno alto, la ventana donde mejor se tolera el trabajo duro.");
  if (log && isLowFertilityFluid(log.cervicalFluid) && estimate.phase.startsWith("luteal")) notes.push("Flujo seco, pegajoso o cremoso: compatible con progesterona dominante despues de ovular.");
  if (symptomScore(log) >= 3) notes.push("Sintomas acumulados: si el mismo peso se siente mas pesado, autoregula por RPE en vez de forzar la carga.");
  if (wellnessLog && Number(wellnessLog.energy) > 0 && Number(wellnessLog.energy) <= 2) notes.push("Energia " + wellnessLog.energy + "/5 hoy: version minima de la plantilla antes que saltarte la sesion.");
  if (Number(wellnessLog?.sleep) > 0 && Number(wellnessLog.sleep) < 6) notes.push("Menos de 6 h de sueno: parte del bajon de hoy puede ser descanso, no fase del ciclo.");
  // Mismo umbral que getCycleInsights: sin dos ciclos completos esto es orientativo.
  const provisional = buildCycleStarts(periods, menstrualLogs).length < 3;
  return { ...base, phase: estimate.phase, confidence: estimate.confidence, notes, provisional };
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
  // Una lectura por fase: la pantalla muestra solo la de la fase estimada de hoy,
  // asi no aparece la lutea tardia mientras estas menstruando.
  byPhase.forEach((bucket, phase) => {
    if (bucket.energy.length < 2) return;
    insights.push({
      type: "energy_by_phase",
      phase,
      message: `En tus registros, la fase ${PHASE_LABELS[phase]} suele coincidir con energia promedio ${avg(bucket.energy).toFixed(1)}/5.`,
      confidence: bucket.energy.length >= 5 ? "medium" : "low",
    });
  });
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
