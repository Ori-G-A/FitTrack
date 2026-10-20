import { addDays, localISO } from "./date-utils.js";
import { PHASE_LABELS, isClearBleeding, isFertileFluid, isLowFertilityFluid, asNumber, buildCycleStarts, symptomScore } from "./cycle-context.js";
import { inferCyclePhase, buildCycleTimeline } from "./cycle-phase.js";

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
  return { ...base, phase: estimate.phase, confidence: estimate.confidence, reason: estimate.reason, notes, provisional };
}

export function recalculateCycleEstimates(userId, startDate, endDate, data = {}) {
  const estimates = [];
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const estimate = inferCyclePhase({ date, ...data });
    estimates.push({ id: `${userId || "local"}:${date}`, userId, ...estimate, updatedAt: new Date().toISOString() });
  }
  return estimates;
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
