import { ACTIVITY_LEVELS, KCAL_PER_KG } from "./app-config.js";
import { addDays, daysBetween, localISO, slopePerDay, weightTrendHighlight } from "./app-utils.js";
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

// ============================================================================
// Aviso de ritmo (el que el Diario muestra como tarjeta accionable)
// ----------------------------------------------------------------------------
// Compara el ritmo real de peso contra el objetivo y propone un ajuste de kcal.
// Criterio, para deficit + entrenamiento de fuerza:
//   - Ventana de 21 dias y >=8 pesajes: por debajo de eso la pendiente es agua,
//     glucogeno y fase del ciclo, no cambio de tejido. Tres semanas tambien
//     promedian buena parte del sesgo de retencion lutea sin estimar la fase
//     (para eso ya esta lutealRetentionKg, que pide 3 ciclos).
//   - Umbral 0,15 kg/sem (~165 kcal/dia): por debajo cae dentro del error del
//     pesaje de comida y de la bascula; avisar ahi seria ruido.
//   - Conversion 7700 kcal/kg (KCAL_PER_KG). El ajuste es exactamente la
//     desviacion medida: si comiendo `current` el peso se mueve `perWeek`, el
//     mantenimiento real es current - perWeek*1100, aunque el estimado por
//     factor de actividad diga otra cosa. Redondeado a 50 kcal.
//   - Tope de +-300 kcal/dia por ajuste: un salto mayor no es un ajuste, es
//     replantear el plan.
//   - Suelo absoluto de 22 kcal/kg (minimo 1400): por debajo la disponibilidad
//     energetica baja se asocia a perdida de masa magra y alteracion del ciclo
//     (RED-S), y ademas no da para cubrir 1,6-2,2 g/kg de proteina.
//   - No toca la proteina: va por g/kg (1,6-2,4; extremo alto en deficit para
//     retener masa magra) y la mueve el peso, no las kcal.
//   - Tras aplicar o descartar un aviso, goals.paceCheckedAt fija el inicio de la
//     ventana: los pesajes anteriores describen la ingesta vieja y volverian a
//     pedir el mismo ajuste una y otra vez. Con el corte hacen falta 3 semanas
//     nuevas de pesajes antes del siguiente aviso, que es justo lo que tarda en
//     medirse la respuesta al cambio.
// ponytail: sin techo. Con el tope de +-300 el ajuste nunca llega al
// mantenimiento; anadir uno seria una rama que no se ejecuta nunca.
// ponytail: no infiere fase del ciclo. Si sale un aviso raro justo en lutea
// tardia, el paso siguiente es cruzarlo con inferCyclePhase, no bajar el umbral.
export const PACE_ALERT = {
  windowDays: 21,
  minPoints: 8,
  thresholdPerWeek: 0.15,
  maxKcalStep: 300,
  floorKcalPerKg: 22,
  floorKcalMin: 1400,
};

export function weightPaceAlert(weights = [], goals = {}, today = localISO()) {
  const goalPerWeek = Number(goals.weeklyChange);
  const current = Number(goals.kcalTarget);
  if (!Number.isFinite(goalPerWeek) || !current) return null;

  // La ventana empieza en el ultimo ajuste si es mas reciente que las 3 semanas.
  const since = [addDays(today, -PACE_ALERT.windowDays), goals.paceCheckedAt || ""].sort().pop();
  const points = [...weights]
    .filter((w) => w.date >= since && w.date <= today && Number(w.kg) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < PACE_ALERT.minPoints) return null;
  const span = daysBetween(points[0].date, points[points.length - 1].date);
  if (span < PACE_ALERT.windowDays - 4) return null;

  const slope = slopePerDay(points.map((p) => ({ x: daysBetween(points[0].date, p.date), y: Number(p.kg) })));
  if (slope == null) return null;
  const perWeek = Math.round(slope * 7 * 100) / 100;
  const drift = Math.round((perWeek - goalPerWeek) * 100) / 100; // <0 = bajas mas rapido de lo previsto
  if (Math.abs(drift) < PACE_ALERT.thresholdPerWeek) return null;

  const kcalPerPace = KCAL_PER_KG / 7; // 1100 kcal/dia por cada kg/semana
  const raw = -drift * kcalPerPace;
  const step = Math.max(-PACE_ALERT.maxKcalStep, Math.min(PACE_ALERT.maxKcalStep, raw));
  const weight = Number(points[points.length - 1].kg);
  const floor = Math.max(PACE_ALERT.floorKcalMin, Math.round(weight * PACE_ALERT.floorKcalPerKg));
  const next = Math.max(floor, Math.round((current + step) / 50) * 50);
  if (next === current) return null;

  return {
    perWeek, goalPerWeek, drift, current, next,
    days: span, points: points.length,
    limited: next === floor ? "floor" : Math.abs(raw) > PACE_ALERT.maxKcalStep ? "step" : null,
    // Piezas del calculo, para poder ensenar de donde sale el numero en vez de
    // pedir que se acepte a ciegas un cambio de 300 kcal.
    rawKcal: Math.round(raw), floor, weight,
    from: points[0].date, to: points[points.length - 1].date,
  };
}

// ============================================================================
// Real vs esperado (la tarjeta que encabeza Metricas)
// ----------------------------------------------------------------------------
// "Esperado" es la recta que sale del objetivo: peso de partida + ritmo objetivo
// por semana. La app no guarda fecha de inicio de objetivo, asi que el ancla es
// el primer pesaje DENTRO de la ventana de 12 semanas, no el primero de la
// historia: con dos años de registros, anclar en el primero mide contra un
// objetivo que ya no existe y el desvio sale absurdo. goals.startWeight solo
// manda cuando el historial entero cabe en la ventana, que es el caso en que
// sigue describiendo el punto de partida real.
// ponytail: ventana movil en vez de un campo `goalStartedAt` nuevo. Si algun dia
// Ajustes guarda cuando empezo el objetivo, anclar ahi y borrar esto.
// La proyeccion usa el ritmo REAL de las ultimas 3 semanas (weightTrendHighlight),
// no el objetivo: contesta "a este ritmo, cuando llego", no "si todo saliera bien".
// ponytail: recta, no curva. El gasto baja al bajar el peso y la recta se queda
// corta a la larga; con horizontes de 12 semanas la diferencia es menor que el
// ruido del pesaje. Si algun dia el objetivo dura un año, toca revisarlo.
export const VS_EXPECTED_WINDOW_DAYS = 84;

export function weightVsExpected(weights = [], goals = {}, today = localISO()) {
  const points = [...weights]
    .filter((w) => Number(w.kg) > 0 && w.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < 2) return null;

  const since = addDays(today, -VS_EXPECTED_WINDOW_DAYS);
  const window = points.filter((p) => p.date >= since);
  if (window.length < 2) return null;
  const anchor = window[0];
  const startKg = anchor === points[0] ? Number(goals.startWeight) || Number(anchor.kg) : Number(anchor.kg);
  const goalPerWeek = Number(goals.weeklyChange) || 0;
  const expectedAt = (iso) => startKg + goalPerWeek * (daysBetween(anchor.date, iso) / 7);

  const real = Number(window[window.length - 1].kg);
  const expected = Math.round(expectedAt(today) * 10) / 10;
  const delta = Math.round((real - expected) * 10) / 10;
  const target = Number(goals.targetWeight) || null;
  const trend = weightTrendHighlight(weights, today);
  const perWeek = trend ? trend.perWeek : null;

  // Adelantada = vas por delante de la recta en la direccion que pide el objetivo.
  const ahead = goalPerWeek < 0 ? delta < 0 : goalPerWeek > 0 ? delta > 0 : null;

  let projection = null;
  if (target && perWeek) {
    const weeks = (target - real) / perWeek;
    if (weeks > 0 && weeks <= 104) projection = addDays(today, Math.round(weeks * 7));
  }

  const series = window.map((p) => ({ iso: p.date, real: Number(p.kg), expected: Math.round(expectedAt(p.date) * 100) / 100 }));

  return { real, expected, delta, ahead, target, perWeek, goalPerWeek, projection, series, anchorDate: anchor.date };
}
