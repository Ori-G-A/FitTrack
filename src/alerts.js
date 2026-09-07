import { KCAL_PER_KG, tracksCycle } from "./app-config.js";
import { canonExercise, creatineWaterKg, daysBetween, epley, localISO, lutealRetentionKg, matchedLoadRpeTrend, selectFreshRecords, slopePerDay } from "./app-utils.js";
import { buildCycleStarts, inferCyclePhase, symptomScore } from "./cycle-inference.js";

// Los avisos se leen en el Diario —son cosas a las que prestar atencion hoy— pero
// se calculan sobre lo mismo que dibujan las tarjetas de Metricas. Vivian dentro
// del Dashboard, asi que el Diario no podia verlos sin montarlo entero; y sacar
// solo el texto habria dejado dos tendencias distintas para el mismo peso.
//
// Aqui esta la cadena completa una sola vez. Metricas la consume para sus
// tarjetas y el Diario para los avisos, con lo que los dos cuentan lo mismo.
//
// Cada aviso lleva `card`: el id de la tarjeta de Metricas que lo disparo, para
// que pulsarlo lleve al sitio donde se ve el dato y no a Metricas en general.

const MAJOR_MUSCLES = ["Pecho", "Espalda", "Hombros", "Cuádriceps", "Femoral"];
const SECONDARY_FACTOR = 0.5;
const PR_ALERT_MAX_AGE_DAYS = 3;
const PR_ALERT_MAX_ITEMS = 3;
const round1 = (value) => Math.round(value * 10) / 10;
// Coma decimal: es la convencion de toda la app y estos textos la rompian.
const dec = (value, digits) => value.toFixed(digits).replace(".", ",");
const isoMinus = (days) => { const date = new Date(); date.setDate(date.getDate() - days); return localISO(date); };

// Media movil de 7 dias sobre una lista de pesajes ya ordenada. `adjust` permite
// descontar agua (creatina, retencion lutea) sin duplicar la ventana.
function movingAverage(sortedW, adjust = (w) => w.kg) {
  return sortedW.map((w) => {
    const start = new Date(w.date + "T00:00:00");
    start.setDate(start.getDate() - 6);
    const win = sortedW.filter((x) => x.date <= w.date && new Date(x.date + "T00:00:00") >= start);
    return { iso: w.date, real: w.kg, media: round1(win.reduce((sum, x) => sum + adjust(x), 0) / win.length) };
  });
}

export function alertMetrics({ workouts = [], nutrition = [], weights = [], wellness = [], periods = [], menstrualLogs = [], goals = {} } = {}) {
  const today = localISO();
  const sortedW = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const maSeries = movingAverage(sortedW);
  const currentMA = maSeries.length ? maSeries[maSeries.length - 1].media : null;

  // Sin seguimiento de ciclo el resto de la cadena no puede corregir por fase ni
  // avisar de retencion: se apaga en el origen, no en cada sitio que la usa.
  const cycle = tracksCycle(goals);
  const starts = cycle ? buildCycleStarts(periods, menstrualLogs) : [];
  const completeCyclesCount = starts.length > 1 ? starts.length - 1 : 0;

  const phaseByDate = new Map();
  if (cycle) sortedW.forEach((w) => phaseByDate.set(w.date, inferCyclePhase({ date: w.date, menstrualLogs, periods, wellness }).phase));

  const lutealOffset = completeCyclesCount >= 3
    ? lutealRetentionKg(sortedW, (date) => phaseByDate.get(date))
    : null;

  // Para inferir tendencia y mantenimiento se descuenta el agua modelada: sin eso,
  // una carga de creatina o una fase lutea se leen como grasa ganada.
  const maSeriesForTrend = (!goals.creatineStart && !lutealOffset)
    ? maSeries
    : movingAverage(sortedW, (x) => x.kg
      - creatineWaterKg(goals.creatineStart, x.date)
      - (lutealOffset && phaseByDate.get(x.date) === "luteal_late" ? lutealOffset.kg : 0));

  const trend = (() => {
    const recent = maSeriesForTrend.filter((p) => daysBetween(p.iso, today) <= 21);
    const pts = (recent.length >= 2 ? recent : maSeriesForTrend.slice(-6))
      .map((p) => ({ x: daysBetween(maSeriesForTrend[0]?.iso || p.iso, p.iso), y: p.media }));
    const slope = slopePerDay(pts);
    return slope === null ? null : slope * 7;
  })();

  const cycleConfound = (() => {
    if (!cycle || completeCyclesCount < 2) return false;
    if (inferCyclePhase({ date: today, menstrualLogs, periods, wellness }).phase !== "luteal_late") return false;
    return symptomScore(menstrualLogs.find((log) => log.date === today)) >= 3;
  })();

  const loadRpe = matchedLoadRpeTrend(workouts);
  const lowEnergyDays = wellness.filter((w) => w.date >= isoMinus(7) && w.energy != null && w.energy <= 2).length;

  const exHistory = {};
  [...workouts].sort((a, b) => a.date.localeCompare(b.date)).forEach((w) => w.exercises.forEach((e) => {
    let best = 0;
    e.sets.forEach((s) => { const r = +s.reps || 0, kg = +s.kg || 0; if (r > 0 && kg > 0) best = Math.max(best, epley(kg, r)); });
    if (best > 0) {
      const key = canonExercise(e.name);
      (exHistory[key] = exHistory[key] || []).push({ iso: w.date, oneRM: Math.round(best), muscle: e.primary || e.muscle || "Core" });
    }
  }));

  const prs = Object.entries(exHistory).map(([name, h]) => {
    const best = h.reduce((m, x) => x.oneRM > m.oneRM ? x : m, h[0]);
    const latest = h[h.length - 1];
    const recordAge = daysBetween(best.iso, today);
    const isRecent = h.length >= 2 && best.iso === latest.iso && recordAge >= 0 && recordAge <= PR_ALERT_MAX_AGE_DAYS;
    return { name, best: best.oneRM, date: best.iso, isRecent };
  }).sort((a, b) => b.best - a.best);
  const recentPRs = selectFreshRecords(prs.filter((p) => p.isRecent), today, { maxAgeDays: PR_ALERT_MAX_AGE_DAYS, maxItems: PR_ALERT_MAX_ITEMS });

  const weeklyMuscle = {};
  workouts.filter((w) => w.date >= isoMinus(7)).forEach((w) => w.exercises.forEach((e) => {
    const v = e.sets.reduce((t, s) => t + (+s.reps || 0) * (+s.kg || 0), 0);
    weeklyMuscle[e.primary || e.muscle] = (weeklyMuscle[e.primary || e.muscle] || 0) + v;
    (e.secondary || []).forEach((sm) => { weeklyMuscle[sm] = (weeklyMuscle[sm] || 0) + v * SECONDARY_FACTOR; });
  }));

  const rpeSeries = [...workouts].sort((a, b) => a.date.localeCompare(b.date)).map((w) => {
    const vals = w.exercises.flatMap((e) => e.sets.map((s) => parseFloat(s.rpe)).filter((v) => v > 0));
    return vals.length ? { iso: w.date, rpe: vals.reduce((s, v) => s + v, 0) / vals.length } : null;
  }).filter(Boolean).slice(-12);

  const deloadSignal = (() => {
    const recent = rpeSeries.slice(-3);
    if (recent.length < 3) return null;
    const rising = recent[0].rpe < recent[1].rpe && recent[1].rpe < recent[2].rpe;
    const jump = recent[2].rpe - recent[0].rpe;
    return rising && jump >= 1 ? { from: recent[0].rpe, to: recent[2].rpe } : null;
  })();

  const maintenance = (() => {
    const byDay = {};
    nutrition.filter((n) => n.date >= isoMinus(28)).forEach((n) => { byDay[n.date] = (byDay[n.date] || 0) + (+n.kcal || 0); });
    const loggedDays = Object.values(byDay).filter((v) => v > 50);
    if (loggedDays.length < 10 || trend === null) return null;
    const avgKcal = loggedDays.reduce((s, v) => s + v, 0) / loggedDays.length;
    return { maint: Math.round(avgKcal - (trend / 7) * KCAL_PER_KG), days: loggedDays.length, avgKcal: Math.round(avgKcal) };
  })();

  const protAvg7 = (() => {
    const byDay = {};
    nutrition.filter((n) => n.date >= isoMinus(7)).forEach((n) => { byDay[n.date] = (byDay[n.date] || 0) + (+n.protein || 0); });
    const vals = Object.values(byDay);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  })();

  const trainedDates = workouts.filter((w) => w.exercises.length || (w.cardio || []).length).map((w) => w.date).sort();
  const lastTrain = trainedDates.length ? trainedDates[trainedDates.length - 1] : null;

  const projection = (() => {
    if (!goals.targetWeight || currentMA === null || trend === null || Math.abs(trend) < 0.02) return null;
    const remaining = Number(goals.targetWeight) - currentMA;
    if (Math.sign(remaining) !== Math.sign(trend)) return { off: true };
    const weeks = remaining / trend;
    const d = new Date();
    d.setDate(d.getDate() + Math.round(weeks * 7));
    return { weeks: Math.round(weeks), date: d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) };
  })();

  return {
    cycle, sortedW, maSeries, maSeriesForTrend, currentMA, phaseByDate, completeCyclesCount, lutealOffset,
    trend, cycleConfound, loadRpe, lowEnergyDays, exHistory, prs, recentPRs, weeklyMuscle,
    rpeSeries, deloadSignal, maintenance, protAvg7, lastTrain, projection,
  };
}

export function buildAlerts(metrics, goals = {}) {
  const {
    recentPRs, trend, maintenance, cycleConfound, lutealOffset, protAvg7, weeklyMuscle,
    lastTrain, projection, loadRpe, deloadSignal, lowEnergyDays, completeCyclesCount, cycle,
  } = metrics;
  const today = localISO();
  const a = [];

  recentPRs.forEach((p) => a.push({ type: "pr", card: "records", title: `¡Nuevo récord en ${p.name}!`, body: `Tu 1RM estimado subió a ${p.best} kg. La sobrecarga progresiva está funcionando.` }));

  // El estado de la tendencia se dice aqui aunque la tarjeta "real vs esperado"
  // muestre el hueco: son dos preguntas distintas. La tarjeta compara contra la
  // recta acumulada del objetivo; esto compara el ritmo de las ultimas semanas
  // contra el ritmo objetivo, y es lo unico que confirma "vas bien". La accion
  // (cuantas kcal mover) no se repite: vive en el aviso de ritmo del Diario.
  if (trend !== null) {
    const diff = trend - goals.weeklyChange;
    const real = `Tendencia real ${trend > 0 ? "+" : ""}${dec(trend, 2)} kg/sem frente a tu objetivo de ${goals.weeklyChange > 0 ? "+" : ""}${dec(goals.weeklyChange, 2)}`;
    if (Math.abs(diff) > 0.25) {
      a.push({
        type: "warn", card: "peso",
        title: "Desvío en tu tendencia de peso",
        body: `${real}. ${diff > 0 ? "Vas más hacia arriba de lo previsto." : "Bajas más rápido de lo previsto."}${maintenance ? ` Mantenimiento estimado ~${maintenance.maint} kcal.` : ""} El Diario propone el ajuste de calorías en cuanto haya tres semanas de pesajes.`,
      });
    } else {
      a.push({ type: "ok", card: "peso", title: "Peso en línea con tu objetivo", body: `${real}, dentro de ±0,25.` });
    }
  }

  // Lo que ni la tarjeta ni el aviso de ritmo saben: que hoy es lutea tardia y
  // parte del desvio puede ser agua.
  if (trend !== null && cycleConfound && Math.abs(trend - goals.weeklyChange) > 0.25) {
    a.push({
      type: "warn", card: "ciclo",
      title: "Estás en fase lútea tardía",
      body: lutealOffset
        ? `La tendencia ya descuenta tus ${lutealOffset.kg} kg de retención habituales, así que el desvío que ves es real y puedes ajustar calorías sin esperar.`
        : "Los síntomas de hoy son compatibles con retención de líquidos: parte del desvío puede ser agua, no grasa. Espera unos días antes de ajustar calorías.",
    });
  }

  if (protAvg7 !== null && goals.proteinTarget && protAvg7 < 0.85 * goals.proteinTarget) {
    a.push({ type: "warn", card: "macros", title: "Proteína por debajo del objetivo", body: `Media de ${Math.round(protAvg7)} g/día la última semana frente a tu meta de ${goals.proteinTarget} g.` });
  }

  const vols = MAJOR_MUSCLES.map((m) => weeklyMuscle[m] || 0);
  const maxV = Math.max(...vols);
  if (maxV > 0) {
    const neglected = MAJOR_MUSCLES.filter((m) => (weeklyMuscle[m] || 0) < 0.15 * maxV);
    if (neglected.length) a.push({ type: "warn", card: "volumen", title: "Posible descompensación muscular", body: `Esta semana apenas trabajaste: ${neglected.join(", ")}. Equilibrar el volumen reduce riesgo de lesión.` });
  }

  if (lastTrain && daysBetween(lastTrain, today) >= 4) {
    a.push({ type: "info", card: "constancia", title: "Racha de entreno en pausa", body: `Llevas ${daysBetween(lastTrain, today)} días sin registrar entrenamiento.` });
  }
  if (projection && projection.off) {
    a.push({ type: "info", card: "proyeccion", title: "No avanzas hacia tu peso meta", body: "A tu ritmo actual no te acercas a la meta fijada. Revisa objetivo o calorías." });
  }

  // Dos niveles: señal aislada = versión reducida de la próxima sesión; fatiga en
  // 2+ ejercicios distintos, o señal de RPE + energía baja reportada 3+ días de la
  // semana = semana de descarga completa. Si coincide con lútea tardía sintomática,
  // no se escala a semana: lo esperable es que remita al arrancar la folicular.
  const rpeFatigue = loadRpe.fatigue || deloadSignal;
  const deloadWeek = !cycleConfound && (loadRpe.fatigueCount >= 2 || (rpeFatigue && lowEnergyDays >= 3));
  if (rpeFatigue || cycleConfound) {
    const reasons = [];
    if (loadRpe.fatigue) reasons.push(`a igual carga (${loadRpe.fatigue.name} ${loadRpe.fatigue.kg} kg × ${loadRpe.fatigue.reps}) tu RPE subió ${dec(loadRpe.fatigue.from, 1)} → ${dec(loadRpe.fatigue.to, 1)} en las últimas 3 sesiones${loadRpe.fatigueCount >= 2 ? ` — y pasa en ${loadRpe.fatigueCount} ejercicios distintos` : ""}`);
    else if (deloadSignal) reasons.push(`tu RPE medio por sesión viene subiendo (${dec(deloadSignal.from, 1)} → ${dec(deloadSignal.to, 1)} en las últimas 3)`);
    if (lowEnergyDays >= 3) reasons.push(`reportaste energía baja ${lowEnergyDays} días esta semana`);
    if (cycleConfound) reasons.push("estás en fase lútea tardía con síntomas altos");
    if (deloadWeek) {
      a.push({ type: "warn", card: "rpe", title: "Programá una semana de descarga", body: `${reasons.join(" y ")}. Esto ya no parece un ejercicio estancado sino fatiga acumulada: hacé toda la semana con la versión reducida de tus rutinas (menos series, mismo patrón) y retomá la progresión la semana siguiente.` });
    } else {
      a.push({ type: "info", card: "rpe", title: "Señal de deload", body: `${reasons.join(" y ")}. Es razonable considerar la versión reducida de tu próxima rutina en vez de la completa${cycleConfound ? " — si la causa es la fase del ciclo, debería remitir al arrancar la folicular; si persiste después, pensá en una semana de descarga" : ""}.` });
    }
  }
  if (loadRpe.progress) {
    a.push({ type: "ok", card: "rpe", title: `Lista para subir carga en ${loadRpe.progress.name}`, body: `${loadRpe.progress.kg} kg × ${loadRpe.progress.reps} te costó cada vez menos (RPE ${dec(loadRpe.progress.from, 1)} → ${dec(loadRpe.progress.to, 1)} en las últimas 3 sesiones). Subí al siguiente escalón de peso o sumá 1-2 reps manteniendo el RPE objetivo.` });
  }

  const CYCLE_TARGET = 3;
  if (!cycle) return a;
  if (completeCyclesCount < CYCLE_TARGET) {
    a.push({ type: "info", card: "ciclo", title: "Progreso hacia seguimiento más robusto", body: `Ciclos completos registrados: ${completeCyclesCount}/${CYCLE_TARGET}. Cuando llegues a la meta, la tendencia de peso va a descontar sola la retención de la fase lútea.` });
  } else if (lutealOffset) {
    a.push({ type: "ok", card: "ciclo", title: "Retención por ciclo ya descontada", body: `Con ${completeCyclesCount} ciclos registrados, en fase lútea tardía pesás ${lutealOffset.kg} kg más que en tu línea base folicular (${lutealOffset.lutealDays} pesadas en lútea vs ${lutealOffset.follicularDays} en folicular). La tendencia y el mantenimiento ya descuentan ese peso, así que no lo leas como grasa.${lutealOffset.capped ? " El valor venía más alto y se recortó a 2,5 kg: por encima de eso suele ser pocas pesadas, no retención." : ""}` });
  } else {
    a.push({ type: "info", card: "ciclo", title: "Sin retención lútea medible", body: `Ya tenés ${completeCyclesCount} ciclos completos, pero tus pesadas no muestran una diferencia clara entre fase lútea tardía y folicular (hace falta al menos 3 pesadas en cada fase y una diferencia mayor a 0,2 kg). No hay nada que descontar: pesate también en los días previos al periodo y se recalcula solo.` });
  }

  return a;
}
