import { addDays, daysBetween, localISO } from "./date-utils.js";
import { PHASE_LABELS, isClearBleeding, isFertileFluid, sortByDate, periodContains, cycleContext, hasFertileProgression, detectOvulationProbableDates, confidenceFromContext, symptomScore } from "./cycle-context.js";

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
  const loggedNoBleeding = ["none", "spotting"].includes(log?.bleedingLevel);
  const periodEvent = loggedNoBleeding ? null : periods.find((period) => periodContains(period, date));
  // Una ovulacion de otro ciclo no puede determinar la fase del ciclo actual.
  const currentLogs = logs.filter((item) => (!context.currentStart || item.date >= context.currentStart)
    && (!context.nextStart || item.date < context.nextStart));
  const ovulations = detectOvulationProbableDates(currentLogs);
  const ovulation = ovulations.get(date);
  const lastOvulation = [...ovulations.keys()].filter((itemDate) => itemDate < date).sort().pop();
  const dpo = lastOvulation ? daysBetween(lastOvulation, date) : null;
  const hasUsefulFluid = currentLogs.some((item) => item.date <= date && item.cervicalFluid && !["not_checked", "unknown"].includes(item.cervicalFluid));
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
    // Aqui la unica evidencia puede ser el calendario: "faltan pocos dias para el
    // periodo esperado" y "el periodo ya vino y no lo registraste" producen los
    // mismos datos. Sin un registro reciente que confirme que el ciclo sigue
    // corriendo, esto es una suposicion y no puede venderse como estimacion firme.
    // Lutea tardia significa que el periodo TODAVIA no ha llegado. Dos cosas lo
    // contradicen y las dos se registraban sin que el codigo las mirara:
    //
    //   - Sangrado reciente de cualquier tipo. Si se marco "manchado", no cuenta
    //     como inicio de ciclo, pero desde luego no es "aun no ha venido".
    //   - Un check-in que no dice nada del sangrado. Haberlo abierto para anotar
    //     colicos no confirma que no hayas sangrado.
    //
    // Solo confirma un check-in que diga explicitamente que no hubo sangrado.
    const recientes = logs.filter((item) => item.date <= date && daysBetween(item.date, date) <= 7);
    const sangradoReciente = recientes.find((item) => item.bleedingLevel && !["not_logged", "none"].includes(item.bleedingLevel));
    const confirmaSinSangrado = logs.some((item) => item.date <= date
      && daysBetween(item.date, date) <= 10 && item.bleedingLevel === "none");
    const sinConfirmar = !context.nextStart && (Boolean(sangradoReciente) || (score < 3 && !confirmaSinSangrado));
    const base = context.nextStart
      ? `Estas a ${context.daysToNext} dias de un periodo registrado.`
      : sangradoReciente
        ? `Registraste sangrado hace ${daysBetween(sangradoReciente.date, date)} dias, asi que el periodo no esta por venir. Si ese fue tu periodo, marcalo como leve, medio o abundante en el check-in y el ciclo se recalcula desde ahi.`
        : sinConfirmar
          ? `Estas cerca del periodo esperado, pero ningun check-in reciente dice si ya sangraste: si tu periodo ya llego, registralo y la fase se recalcula.`
          : `Estas cerca del periodo esperado segun tus ciclos registrados.`;
    return {
      date,
      phase: sinConfirmar ? "unknown" : "luteal_late",
      confidence: sinConfirmar ? "low" : (score >= 3 || context.nextStart ? confidenceFromContext(context, hasUsefulFluid, true) : confidence),
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
