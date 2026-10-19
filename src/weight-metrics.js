import { daysBetween } from "./date-utils.js";
import { creatineWaterKg, slopePerDay } from "./weight-model.js";
const round1 = (value) => Math.round(value * 10) / 10;

// Media movil de 7 dias sobre una lista de pesajes ya ordenada. `adjust` permite
// descontar agua (creatina, retencion lutea) sin duplicar la ventana.
export function movingAverage(sortedW, adjust = (w) => w.kg) {
  return sortedW.map((w) => {
    const start = new Date(w.date + "T00:00:00");
    start.setDate(start.getDate() - 6);
    const win = sortedW.filter((x) => x.date <= w.date && new Date(x.date + "T00:00:00") >= start);
    return { iso: w.date, real: w.kg, media: round1(win.reduce((sum, x) => sum + adjust(x), 0) / win.length) };
  });
}

export function correctedWeightSeries(sortedW, maSeries, goals, lutealOffset, phaseByDate) {
  const maSeriesForTrend = (!goals.creatineStart && !lutealOffset)
    ? maSeries
    : movingAverage(sortedW, (x) => x.kg
      - creatineWaterKg(goals.creatineStart, x.date)
      - (lutealOffset && phaseByDate.get(x.date) === "luteal_late" ? lutealOffset.kg : 0));

  return maSeriesForTrend;
}

export function weeklyWeightTrend(maSeriesForTrend, today) {
  const recent = maSeriesForTrend.filter((p) => daysBetween(p.iso, today) <= 21);
  const pts = (recent.length >= 2 ? recent : maSeriesForTrend.slice(-6))
    .map((p) => ({ x: daysBetween(maSeriesForTrend[0]?.iso || p.iso, p.iso), y: p.media }));
  const slope = slopePerDay(pts);
  return slope === null ? null : slope * 7;
}

export function weightProjection(currentMA, trend, goals, createDate = () => new Date()) {
  if (!goals.targetWeight || currentMA === null || trend === null || Math.abs(trend) < 0.02) return null;
  const remaining = Number(goals.targetWeight) - currentMA;
  if (Math.sign(remaining) !== Math.sign(trend)) return { off: true };
  const weeks = remaining / trend;
  const d = createDate();
  d.setDate(d.getDate() + Math.round(weeks * 7));
  return { weeks: Math.round(weeks), date: d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) };
}
