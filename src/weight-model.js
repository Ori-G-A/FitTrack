import { localISO, addDays, daysBetween } from "./date-utils.js";

// ponytail: saturación de creatina modelada, no medida. tau=7d -> ~98% a 28d;
// 1.5kg agua a plena carga (rango tipico 1-2kg). Compartido entre BodyScreen
// (muestra el estado actual) y DashboardScreen (para no leer esa agua como
// grasa perdida/ganada en la tendencia de peso).
export const creatineWaterKg = (creatineStart, date, tauDays = 7, fullKg = 1.5) => {
  if (!creatineStart || !date || date < creatineStart) return 0;
  const days = daysBetween(creatineStart, date);
  return (1 - Math.exp(-days / tauDays)) * fullKg;
};

// Offset empírico de retención de líquidos en lútea tardía, en kg. Detrenda con
// la pendiente de la fase folicular (si no, una fase que cae en una racha de
// bajada se lee como "menos retención") y compara el residuo medio de lútea
// tardía contra el de folicular, que es la línea base con menos progesterona.
// Rango esperado 0.5–2 kg de agua en lútea (ACSM); por eso <0.2 kg se descarta
// como ruido y >2.5 kg se recorta: fuera de ese rango es más probable un
// artefacto de pocas pesadas que retención real.
// `phaseOf` es un callback date -> phase para no importar cycle-inference acá
// (ese módulo ya importa de este, sería circular).
// ponytail: media simple, sin ponderar por confianza de la fase ni por ciclo.
export function lutealRetentionKg(weights, phaseOf, minPerPhase = 3) {
  const points = [...weights]
    .filter((w) => w.date && Number(w.kg) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < minPerPhase * 2) return null;
  const base = points[0].date;
  const luteal = [], follicular = [];
  points.forEach((w) => {
    const phase = phaseOf(w.date);
    const bucket = phase === "luteal_late" ? luteal
      : (phase === "follicular_early" || phase === "follicular_mid_late") ? follicular : null;
    if (bucket) bucket.push({ x: daysBetween(base, w.date), y: Number(w.kg) });
  });
  if (luteal.length < minPerPhase || follicular.length < minPerPhase) return null;
  // La pendiente se estima SOLO sobre folicular: si se ajusta sobre toda la serie,
  // el propio salto lútea entra en la tendencia y el offset sale subestimado.
  const slope = slopePerDay(follicular) ?? 0;
  const meanResidual = (pts) => pts.reduce((sum, p) => sum + (p.y - slope * p.x), 0) / pts.length;
  const raw = meanResidual(luteal) - meanResidual(follicular);
  if (raw <= 0.2) return null;
  return {
    kg: Math.round(Math.min(raw, 2.5) * 100) / 100,
    capped: raw > 2.5,
    lutealDays: luteal.length,
    follicularDays: follicular.length,
  };
}

export function slopePerDay(points) {
  const count = points.length;
  if (count < 2) return null;
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
  const denominator = count * sumXX - sumX * sumX;
  return denominator === 0 ? null : (count * sumXY - sumX * sumY) / denominator;
}

// Destacados de cabecera: cada uno resume, con los datos que ya hay, lo unico que
// merece leerse antes de entrar a la pantalla. Devuelven null cuando no hay
// suficiente para afirmar nada, y la cabecera entonces no se dibuja.

export function weightTrendHighlight(weights = [], today = localISO(), windowDays = 21) {
  const since = addDays(today, -windowDays);
  const points = [...weights]
    .filter((weight) => weight.date >= since && weight.date <= today && Number(weight.kg) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < 3) return null;
  const slope = slopePerDay(points.map((point) => ({ x: daysBetween(points[0].date, point.date), y: Number(point.kg) })));
  if (slope == null) return null;
  const last = points[points.length - 1];
  return {
    perWeek: Math.round(slope * 7 * 100) / 100,
    from: Number(points[0].kg),
    to: Number(last.kg),
    days: daysBetween(points[0].date, last.date),
    series: points.map((point) => Number(point.kg)),
  };
}
