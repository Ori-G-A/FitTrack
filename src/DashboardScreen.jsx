import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CYCLE_PHASES, KCAL_PER_KG } from "./app-config.js";
import { canonExercise, creatineWaterKg, cycleInfo, daysBetween, localISO, matchedLoadRpeTrend, selectFreshRecords, slopePerDay } from "./app-utils.js";
import { buildCycleStarts, inferCyclePhase, symptomScore } from "./cycle-inference.js";
import { A_DISP, A_INK, A_INK2, A_MONO, DKicker, Rise, useIsMobile, useReveal } from "./EditorialUI.jsx";

const MAJOR_MUSCLES = ["Pecho", "Espalda", "Hombros", "Cuádriceps", "Femoral"];
const SECONDARY_FACTOR = 0.5;
const todayISO = () => localISO();
const round1 = (value) => Math.round(value * 10) / 10;
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
const isoMinus = (days) => { const date = new Date(); date.setDate(date.getDate() - days); return localISO(date); };
const epley = (kg, reps) => (kg > 0 && reps > 0 ? kg * (1 + reps / 30) : 0);
const PR_ALERT_MAX_AGE_DAYS = 3;
const PR_ALERT_MAX_ITEMS = 3;

/* ----------------------------- DASHBOARD ----------------------------- */
/* ============================================================
   BRUTALIST DASHBOARD — editorial layout fed by real data.
   Inlined animation/SVG primitives (bone/ink/tangerine).
   ============================================================ */
const A_PAPER = "#f3efe6", A_PANEL = "#faf7f0",
  A_ACC = "#e7531c", A_OK = "#3f7d4e", A_DANGER = "#c0341a",
  A_LINE = "rgba(22,20,13,0.16)", A_HAIR = "rgba(22,20,13,0.10)";
const CHART_TOOLTIP = { background: A_PANEL, border: `1px solid ${A_LINE}`, borderRadius: 0, fontFamily: A_MONO, fontSize: 12 };
function useCountUp(value, { dur = 1100, decimals = 0, delay = 0 } = {}) {
  const [n, setN] = useState(0);
  const ref = useRef({ from: 0 });
  useEffect(() => {
    const from = ref.current.from; let start = null, raf = 0;
    const tick = (tm) => {
      if (start === null) start = tm;
      const p = Math.min(1, (tm - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setN(from + (value - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick); else ref.current.from = value;
    };
    const d = setTimeout(() => { raf = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(d); cancelAnimationFrame(raf); };
  }, [value, dur, delay]);
  return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
}
function CountUp({ value, decimals = 0, dur = 1100, delay = 0 }) {
  return <span>{useCountUp(value, { dur, decimals, delay })}</span>;
}
function DLegend({ color, label, dash }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke={color} strokeWidth="2.5" strokeDasharray={dash ? "2 3" : "0"} /></svg>
      <span style={{ fontFamily: A_MONO, fontSize: 10.5, color: A_INK2, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
    </div>
  );
}
const dSecH = { margin: 0, fontFamily: A_DISP, fontWeight: 800, fontSize: 24, textTransform: "uppercase", letterSpacing: "-0.02em", whiteSpace: "nowrap" };
function DNeed({ children }) { return <div style={{ fontFamily: A_MONO, fontSize: 12, color: A_INK2, padding: "26px 0", lineHeight: 1.5 }}>{children}</div>; }

function BWeightChart({ data, valueKey = "media", valueLabel = "Media 7d", targetKey = null, targetLabel = "Objetivo", unit = "kg" }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <LineChart data={data} margin={{ top: 14, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={A_HAIR} strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke={A_INK2} tick={{ fill: A_INK2, fontFamily: A_MONO, fontSize: 10 }} minTickGap={28} />
        <YAxis stroke={A_INK2} tick={{ fill: A_INK2, fontFamily: A_MONO, fontSize: 10 }} domain={["auto", "auto"]} />
        <Tooltip contentStyle={CHART_TOOLTIP} labelStyle={{ color: A_INK }} formatter={(value, name) => [`${Number(value).toFixed(1)} ${unit}`, name]} />
        {targetKey && <Line type="monotone" dataKey={targetKey} name={targetLabel} stroke={A_INK2} strokeWidth={1.5} strokeDasharray="3 5" dot={false} activeDot={{ r: 4 }} />}
        <Line type="monotone" dataKey={valueKey} name={valueLabel} stroke={A_ACC} strokeWidth={3} dot={{ r: 3, fill: A_ACC }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
function BStrength({ series, isMobile }) {
  const dates = [...new Set(series.flatMap((item) => item.points.map((point) => point.date)))].sort();
  const data = dates.map((date) => Object.fromEntries([
    ["date", fmtDate(date)],
    ...series.map((item, index) => [String(index), item.points.find((point) => point.date === date)?.pct ?? null]),
  ]));
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 190 : 220}>
      <LineChart data={data} margin={{ top: 14, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={A_HAIR} strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke={A_INK2} tick={{ fill: A_INK2, fontFamily: A_MONO, fontSize: 10 }} minTickGap={24} />
        <YAxis stroke={A_INK2} tick={{ fill: A_INK2, fontFamily: A_MONO, fontSize: 10 }} tickFormatter={(value) => `${value > 0 ? "+" : ""}${Math.round(value)}%`} domain={["auto", "auto"]} />
        <Tooltip contentStyle={CHART_TOOLTIP} labelStyle={{ color: A_INK }} formatter={(value, key) => [`${Number(value).toFixed(1)}%`, series[Number(key)]?.label || key]} />
        {series.map((item, index) => <Line key={item.label} type="monotone" connectNulls dataKey={String(index)} name={item.label} stroke={item.color} strokeWidth={item.w} dot={{ r: 2.5, fill: item.color }} activeDot={{ r: 5 }} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}
function BStrengthLegend({ series }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 10 }}>
      {series.map((s, i) => (
        <span key={i} style={{ fontFamily: A_MONO, fontSize: 11, color: A_INK2, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 12, height: 3, background: s.color, flexShrink: 0 }} />{s.label.toUpperCase()} <b style={{ color: A_INK }}>{s.lastKg} kg</b>
        </span>
      ))}
    </div>
  );
}
function BKcalBars({ data, target }) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} margin={{ top: 14, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid stroke={A_HAIR} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" stroke={A_INK2} tick={{ fill: A_INK2, fontFamily: A_MONO, fontSize: 9 }} minTickGap={15} />
        <YAxis stroke={A_INK2} tick={{ fill: A_INK2, fontFamily: A_MONO, fontSize: 9 }} />
        <Tooltip contentStyle={CHART_TOOLTIP} labelStyle={{ color: A_INK }} formatter={(value) => [`${Math.round(value)} kcal`, "Calorías"]} />
        {target && <ReferenceLine y={target} stroke={A_INK} strokeDasharray="4 4" label={{ value: `obj ${target}`, position: "insideTopRight", fill: A_INK2, fontFamily: A_MONO, fontSize: 10 }} />}
        <Bar dataKey="kcal" name="Calorías" fill={A_INK} activeBar={{ fill: A_ACC }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
function BMuscleBars({ data }) {
  const show = useReveal(520);
  const max = Math.max(...data.map((d) => d.vol)) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {data.map((d, i) => (
        <div key={d.label} title={`${d.label}: ${(d.vol / 1000).toFixed(1)} toneladas${d.effPct == null ? "" : ` · ${d.effPct}% de sets efectivos vs. tu media`}`} style={{ display: "grid", gridTemplateColumns: "100px 1fr 54px 58px", alignItems: "center", gap: 10, cursor: "help" }}>
          <div style={{ fontFamily: A_MONO, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", color: A_INK2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.label}</div>
          <div style={{ height: 14, background: A_HAIR, position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", inset: 0, transformOrigin: "left", width: `${(d.vol / max) * 100}%`, background: i === 0 ? A_ACC : A_INK, transform: show ? "scaleX(1)" : "scaleX(0)", transition: `transform .9s cubic-bezier(.22,.61,.36,1) ${i * 60}ms` }} /></div>
          <div style={{ fontFamily: A_MONO, fontSize: 11, textAlign: "right", color: A_INK, fontWeight: 500 }}>{(d.vol / 1000).toFixed(1)}t</div>
          <div style={{ fontFamily: A_MONO, fontSize: 10.5, textAlign: "right", color: d.effPct == null ? A_INK2 : d.effPct >= 90 ? A_OK : A_INK2 }} title="Sets a RPE>=8, % vs. tu propia media semanal">
            {d.effPct == null ? "—" : `${d.effPct}% ef.`}
          </div>
        </div>
      ))}
    </div>
  );
}
function BMacros({ rows, footer }) {
  const show = useReveal(540);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
      {rows.map((r, i) => {
        const max = (r.target || r.avg || 1) * 1.15;
        const fillPct = Math.min(1, r.avg / max) * 100;
        const tickPct = r.target ? (r.target / max) * 100 : null;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
              <DKicker>{r.label}</DKicker>
              <div style={{ fontFamily: A_MONO, fontSize: 12, color: A_INK }}><span style={{ fontWeight: 600 }}>{Math.round(r.avg)}</span><span style={{ color: A_INK2 }}> / {r.target ? Math.round(r.target) : "—"} g</span></div>
            </div>
            <div style={{ height: 14, background: A_HAIR, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, transformOrigin: "left", width: `${fillPct}%`, background: r.hero ? A_ACC : A_INK, transform: show ? "scaleX(1)" : "scaleX(0)", transition: `transform .9s cubic-bezier(.22,.61,.36,1) ${i * 90}ms` }} />
              {tickPct != null && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${tickPct}%`, width: 2, background: A_INK, opacity: 0.85 }} />}
            </div>
          </div>
        );
      })}
      {footer && <div style={{ fontFamily: A_MONO, fontSize: 11, color: A_INK2, textTransform: "uppercase", letterSpacing: ".06em", paddingTop: 10, borderTop: `1px solid ${A_HAIR}` }}>{footer}</div>}
    </div>
  );
}
function BHeatmap({ days, isMobile }) {
  const show = useReveal(640);
  let cols = [];
  days.forEach((d) => { if (d.dw === 0 || cols.length === 0) cols.push([]); cols[cols.length - 1].push(d); });
  if (isMobile) cols = cols.slice(-12); // últimas ~12 semanas para que entre sin desbordar
  const CELL = isMobile ? 18 : 15, GAP = 4;
  const ramp = ["rgba(22,20,13,0.07)", "rgba(231,83,28,0.26)", "rgba(231,83,28,0.5)", "rgba(231,83,28,0.74)", "#e7531c"];
  const dayLabels = ["L", "", "X", "", "V", "", "D"];
  return (
    <div>
      <div style={{ display: "flex", gap: GAP }}>
        <div style={{ width: 16, flexShrink: 0, display: "flex", flexDirection: "column", gap: GAP }}>
          {Array.from({ length: 7 }, (_, r) => (<div key={r} style={{ height: CELL, display: "flex", alignItems: "center", fontFamily: A_MONO, fontSize: 9, color: A_INK2 }}>{dayLabels[r]}</div>))}
        </div>
        <div style={{ display: "flex", gap: GAP, flexWrap: "nowrap", flex: 1, justifyContent: isMobile ? "space-between" : "flex-start", overflow: "hidden" }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: GAP, flexShrink: 0 }}>
              {Array.from({ length: 7 }, (_, r) => { const d = col.find((x) => x.dw === r); if (!d) return <div key={r} style={{ width: CELL, height: CELL }} />; return <div key={r} title={`${fmtDate(d.iso)} · ${d.score ? `${d.score} bloques registrados` : "sin entrenamiento"}`} style={{ width: CELL, height: CELL, background: ramp[d.lvl], opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.5)", transition: `opacity .45s ease ${ci * 14}ms, transform .45s ${ci * 14}ms`, cursor: "help" }} />; })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 14, fontFamily: A_MONO, fontSize: 10, color: A_INK2, textTransform: "uppercase", letterSpacing: ".06em" }}>
        <span style={{ marginRight: 4 }}>menos</span>
        {ramp.map((c, i) => <div key={i} style={{ width: 12, height: 12, background: c }} />)}
        <span style={{ marginLeft: 4 }}>más</span>
      </div>
    </div>
  );
}

export default function DashboardScreen({ workouts, weights, nutrition, measurements, periods, goals, menstrualLogs = [], wellness = [] }) {
  const show = useReveal(60);
  const isMobile = useIsMobile();
  const sortedW = useMemo(() => [...weights].sort((a, b) => a.date.localeCompare(b.date)), [weights]);
  const maSeries = useMemo(() => sortedW.map((w) => {
    const start = new Date(w.date + "T00:00:00"); start.setDate(start.getDate() - 6);
    const win = sortedW.filter((x) => x.date <= w.date && new Date(x.date + "T00:00:00") >= start);
    return { iso: w.date, real: w.kg, media: round1(win.reduce((s, x) => s + x.kg, 0) / win.length) };
  }), [sortedW]);
  const weightChart = useMemo(() => {
    if (!maSeries.length) return [];
    const start = maSeries[0]; const startKg = goals.startWeight ? Number(goals.startWeight) : start.real;
    return maSeries.map((p) => ({ ...p, objetivo: Number((startKg + goals.weeklyChange * (daysBetween(start.iso, p.iso) / 7)).toFixed(2)) }));
  }, [maSeries, goals]);
  // Para inferir tendencia/mantenimiento (no para lo que se muestra como peso real)
  // restamos el agua de creatina modelada: si no se descuenta, una carga de creatina
  // se lee como "subiste de grasa" cuando en realidad es agua intramuscular.
  const maSeriesForTrend = useMemo(() => {
    if (!goals.creatineStart) return maSeries;
    return sortedW.map((w) => {
      const start = new Date(w.date + "T00:00:00"); start.setDate(start.getDate() - 6);
      const win = sortedW.filter((x) => x.date <= w.date && new Date(x.date + "T00:00:00") >= start);
      const adjKg = (x) => x.kg - creatineWaterKg(goals.creatineStart, x.date);
      return { iso: w.date, media: round1(win.reduce((s, x) => s + adjKg(x), 0) / win.length) };
    });
  }, [sortedW, maSeries, goals.creatineStart]);
  const trend = useMemo(() => {
    const recent = maSeriesForTrend.filter((p) => daysBetween(p.iso, todayISO()) <= 21);
    const pts = (recent.length >= 2 ? recent : maSeriesForTrend.slice(-6)).map((p) => ({ x: daysBetween(maSeriesForTrend[0]?.iso || p.iso, p.iso), y: p.media }));
    const sp = slopePerDay(pts); return sp === null ? null : sp * 7;
  }, [maSeriesForTrend]);
  const completeCyclesCount = useMemo(() => {
    const starts = buildCycleStarts(periods, menstrualLogs);
    return starts.length > 1 ? starts.length - 1 : 0;
  }, [periods, menstrualLogs]);
  // ponytail: la retención por fase de ciclo hoy solo agrega una advertencia de texto,
  // no una corrección numérica (a diferencia de la creatina, no hay un modelo de kg de
  // agua confiable — la magnitud varía demasiado entre personas/ciclos). Con 3+ ciclos
  // completos registrados, se podría derivar un offset empírico propio (peso medio en
  // lútea tardía vs. línea base folicular, controlando por tendencia) y restarlo igual
  // que se hace con creatineWaterKg. Revisar cuando haya ese historial (ver contador
  // "Progreso hacia seguimiento más robusto" en alerts).
  const cycleConfound = useMemo(() => {
    if (completeCyclesCount < 2) return false;
    const today = todayISO();
    const estimate = inferCyclePhase({ date: today, menstrualLogs, periods, wellness });
    if (estimate.phase !== "luteal_late") return false;
    return symptomScore(menstrualLogs.find((log) => log.date === today)) >= 3;
  }, [completeCyclesCount, menstrualLogs, periods, wellness]);
  // RPE a igual carga (mismo ejercicio, kg y reps repetidos en 3+ sesiones):
  // fatigue = RPE subiendo sostenido, progress = RPE bajando (lista para cargar más).
  const loadRpe = useMemo(() => matchedLoadRpeTrend(workouts), [workouts]);
  // Energía baja (<=2/5) reportada 3+ días en la última semana: combinada con una
  // señal de RPE apunta a fatiga sistémica, no a un ejercicio estancado.
  const lowEnergyDays = useMemo(
    () => wellness.filter((w) => w.date >= isoMinus(7) && w.energy != null && w.energy <= 2).length,
    [wellness],
  );
  const currentMA = maSeries.length ? maSeries[maSeries.length - 1].media : null;
  const currentW = sortedW.length ? sortedW[sortedW.length - 1].kg : null;
  const change7 = useMemo(() => { if (sortedW.length < 2) return null; const last = sortedW[sortedW.length - 1]; const ref = [...sortedW].reverse().find((w) => daysBetween(w.date, last.date) >= 7); return ref ? round1(last.kg - ref.kg) : null; }, [sortedW]);

  const exHistory = useMemo(() => {
    const map = {};
    [...workouts].sort((a, b) => a.date.localeCompare(b.date)).forEach((w) => w.exercises.forEach((e) => {
      let best = 0; e.sets.forEach((s) => { const r = +s.reps || 0, kg = +s.kg || 0; if (r > 0 && kg > 0) best = Math.max(best, epley(kg, r)); });
      if (best > 0) { const key = canonExercise(e.name); (map[key] = map[key] || []).push({ iso: w.date, oneRM: Math.round(best), muscle: e.primary || e.muscle || "Core" }); }
    }));
    return map;
  }, [workouts]);
  const prs = useMemo(() => Object.entries(exHistory).map(([name, h]) => {
    const best = h.reduce((m, x) => x.oneRM > m.oneRM ? x : m, h[0]);
    const latest = h[h.length - 1];
    const recordAge = daysBetween(best.iso, todayISO());
    const isRecent = h.length >= 2 && best.iso === latest.iso && recordAge >= 0 && recordAge <= PR_ALERT_MAX_AGE_DAYS;
    return { name, best: best.oneRM, date: best.iso, isRecent };
  }).sort((a, b) => b.best - a.best), [exHistory]);
  const recentPRs = useMemo(
    () => selectFreshRecords(prs.filter((p) => p.isRecent), todayISO(), { maxAgeDays: PR_ALERT_MAX_AGE_DAYS, maxItems: PR_ALERT_MAX_ITEMS }),
    [prs],
  );
  const trackable = useMemo(() => Object.keys(exHistory).filter((n) => exHistory[n].length >= 2), [exHistory]);
  const muscleOptions = useMemo(() => [...new Set(trackable.map((n) => exHistory[n][0].muscle))].sort(), [trackable, exHistory]);
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [exFilter, setExFilter] = useState("all");
  const exOptions = useMemo(() => trackable.filter((n) => muscleFilter === "all" || exHistory[n][0].muscle === muscleFilter).sort(), [trackable, exHistory, muscleFilter]);
  // exFilter puede quedar obsoleto al cambiar de músculo; lo tratamos como "all" si ya no aplica
  const activeEx = exOptions.includes(exFilter) ? exFilter : "all";
  const strengthSeries = useMemo(() => {
    const colors = [A_ACC, A_INK, "rgba(22,20,13,0.45)", A_OK];
    const picked = (activeEx !== "all" ? [activeEx] : [...exOptions].sort((a, b) => exHistory[b].length - exHistory[a].length)).slice(0, 4);
    return picked.map((n, idx) => { const h = exHistory[n]; const first = h[0].oneRM || 1; return { label: n.length > 11 ? n.slice(0, 11) : n, color: colors[idx % colors.length], w: idx === 0 ? 3 : 2.25, points: h.map((x) => ({ date: x.iso, pct: (x.oneRM / first - 1) * 100, kg: x.oneRM })), lastKg: h[h.length - 1].oneRM }; });
  }, [exHistory, exOptions, activeEx]);

  const weeklyMuscle = useMemo(() => {
    const m = {}; const since = isoMinus(7);
    workouts.filter((w) => w.date >= since).forEach((w) => w.exercises.forEach((e) => {
      const v = e.sets.reduce((t, s) => t + (+s.reps || 0) * (+s.kg || 0), 0);
      m[e.primary || e.muscle] = (m[e.primary || e.muscle] || 0) + v;
      (e.secondary || []).forEach((sm) => { m[sm] = (m[sm] || 0) + v * SECONDARY_FACTOR; });
    }));
    return m;
  }, [workouts]);
  const muscleVolAll = useMemo(() => {
    const m = {};
    workouts.forEach((w) => w.exercises.forEach((e) => { const v = e.sets.reduce((t, s) => t + (+s.reps || 0) * (+s.kg || 0), 0); m[e.primary || e.muscle] = (m[e.primary || e.muscle] || 0) + v; (e.secondary || []).forEach((sm) => { m[sm] = (m[sm] || 0) + v * SECONDARY_FACTOR; }); }));
    return m;
  }, [workouts]);
  // Series efectivas: sets a RPE>=8 (el estímulo que de verdad compara entre músculos
  // de tamaño/palanca distinta, a diferencia del tonelaje bruto). % relativo a la media
  // semanal propia de ESE músculo desde el primer registro, no contra otros músculos.
  const muscleRelative = useMemo(() => {
    if (!workouts.length) return {};
    const firstDate = [...workouts].map((w) => w.date).sort()[0];
    const weeksElapsed = Math.max(1, daysBetween(firstDate, todayISO()) / 7);
    const since = isoMinus(7);
    const allTime = {}, weekly = {};
    workouts.forEach((w) => w.exercises.forEach((e) => e.sets.forEach((s) => {
      if ((Number(s.rpe) || 0) < 8) return;
      const bump = (m, factor) => {
        allTime[m] = (allTime[m] || 0) + factor;
        if (w.date >= since) weekly[m] = (weekly[m] || 0) + factor;
      };
      bump(e.primary || e.muscle, 1);
      (e.secondary || []).forEach((sm) => bump(sm, SECONDARY_FACTOR));
    })));
    const out = {};
    Object.keys(allTime).forEach((m) => {
      const baseline = allTime[m] / weeksElapsed;
      out[m] = baseline > 0 ? Math.round(((weekly[m] || 0) / baseline) * 100) : null;
    });
    return out;
  }, [workouts]);
  const muscleData = useMemo(() => {
    const src = Object.keys(weeklyMuscle).length ? weeklyMuscle : muscleVolAll;
    return Object.entries(src).map(([label, vol]) => ({ label, vol: Math.round(vol), effPct: muscleRelative[label] ?? null })).sort((a, b) => b.vol - a.vol).slice(0, 8);
  }, [weeklyMuscle, muscleVolAll, muscleRelative]);

  const kcalChart = useMemo(() => { const days = []; for (let i = 13; i >= 0; i--) { const iso = isoMinus(i); const kcal = nutrition.filter((n) => n.date === iso).reduce((t, n) => t + (+n.kcal || 0), 0); days.push({ date: fmtDate(iso), kcal: Math.round(kcal) }); } return days; }, [nutrition]);
  const kcalAvg = useMemo(() => { const vals = kcalChart.map((d) => d.kcal).filter((v) => v > 0); return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null; }, [kcalChart]);
  const rpeSeries = useMemo(() => [...workouts].sort((a, b) => a.date.localeCompare(b.date)).map((w) => {
    const vals = w.exercises.flatMap((e) => e.sets.map((s) => parseFloat(s.rpe)).filter((v) => v > 0));
    return vals.length ? { iso: w.date, rpe: vals.reduce((s, v) => s + v, 0) / vals.length } : null;
  }).filter(Boolean).slice(-12), [workouts]);
  // Señal de deload por RPE medio subiendo 3 sesiones seguidas — proxy que mezcla
  // cargas distintas; loadRpe.fatigue (misma carga exacta) tiene prioridad cuando
  // existe. Salto total >=1 punto para no marcar ruido normal de semana a semana.
  const deloadSignal = useMemo(() => {
    const recent = rpeSeries.slice(-3);
    if (recent.length < 3) return null;
    const rising = recent[0].rpe < recent[1].rpe && recent[1].rpe < recent[2].rpe;
    const jump = recent[2].rpe - recent[0].rpe;
    return rising && jump >= 1 ? { from: recent[0].rpe, to: recent[2].rpe } : null;
  }, [rpeSeries]);
  const measSorted = useMemo(() => [...measurements].sort((a, b) => a.date.localeCompare(b.date)), [measurements]);
  const measLatest = measSorted[measSorted.length - 1] || null;
  const MEAS_FIELDS = [["cintura", "Cintura"], ["cadera", "Cadera"], ["pecho", "Pecho"], ["brazo", "Brazo"], ["muslo", "Muslo"]];
  const measDelta = (k) => { const s = measSorted.filter((m) => m[k] != null); return s.length >= 2 ? s[s.length - 1][k] - s[0][k] : null; };
  const maintenance = useMemo(() => {
    const since = isoMinus(28);
    const byDay = {}; nutrition.filter((n) => n.date >= since).forEach((n) => { byDay[n.date] = (byDay[n.date] || 0) + (+n.kcal || 0); });
    const loggedDays = Object.values(byDay).filter((v) => v > 50);
    if (loggedDays.length < 10 || trend === null) return null;
    const avgKcal = loggedDays.reduce((s, v) => s + v, 0) / loggedDays.length;
    return { maint: Math.round(avgKcal - (trend / 7) * KCAL_PER_KG), days: loggedDays.length };
  }, [nutrition, trend]);
  const macro14 = useMemo(() => {
    const since = isoMinus(13); const byDay = {};
    nutrition.filter((n) => n.date >= since).forEach((n) => { const d = byDay[n.date] || (byDay[n.date] = { p: 0, c: 0, f: 0, k: 0 }); d.p += +n.protein || 0; d.c += +n.carbs || 0; d.f += +n.fat || 0; d.k += +n.kcal || 0; });
    const ds = Object.values(byDay); if (!ds.length) return null;
    const avg = (k) => ds.reduce((s, d) => s + d[k], 0) / ds.length;
    return { p: avg("p"), c: avg("c"), f: avg("f"), k: avg("k"), days: ds.length };
  }, [nutrition]);
  const trainingDays7 = useMemo(() => new Set(workouts.filter((w) => w.date >= isoMinus(7) && (w.exercises.length || (w.cardio || []).length)).map((w) => w.date)).size, [workouts]);
  // Periodizado: más carbo en días de entreno (glucógeno/rendimiento), más grasa en
  // descanso, mismo total de kcal/proteína. Como el objetivo se compara contra un
  // PROMEDIO de 14 días (no un día puntual), se pondera por tu frecuencia real de
  // entreno en vez de asumir un día concreto.
  const macroTargets = useMemo(() => {
    const pt = Number(goals.proteinTarget) || null, kt = Number(goals.kcalTarget) || null;
    if (!kt) return { p: pt, c: null, f: null };
    const rem = Math.max(0, kt - (pt || 0) * 4);
    const CARB_RATIO_TRAIN = 0.60, CARB_RATIO_REST = 0.45;
    const trainFrac = Math.min(1, trainingDays7 / 7);
    const carbRatio = CARB_RATIO_REST + (CARB_RATIO_TRAIN - CARB_RATIO_REST) * trainFrac;
    return { p: pt, c: rem * carbRatio / 4, f: rem * (1 - carbRatio) / 9 };
  }, [goals, trainingDays7]);

  const lastTrain = useMemo(() => { const ds = workouts.filter((w) => w.exercises.length || (w.cardio || []).length).map((w) => w.date).sort(); return ds.length ? ds[ds.length - 1] : null; }, [workouts]);
  const nutDays7 = useMemo(() => new Set(nutrition.filter((n) => n.date >= isoMinus(7)).map((n) => n.date)).size, [nutrition]);
  const protAvg7 = useMemo(() => { const byDay = {}; nutrition.filter((n) => n.date >= isoMinus(7)).forEach((n) => { byDay[n.date] = (byDay[n.date] || 0) + (+n.protein || 0); }); const vals = Object.values(byDay); return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null; }, [nutrition]);
  const totalMin = workouts.reduce((t, w) => t + (w.durationMin || 0), 0);
  const timed = workouts.filter((w) => w.durationMin > 0).length;
  const avgMin = timed ? Math.round(totalMin / timed) : 0;

  const heat = useMemo(() => {
    const trained = {};
    workouts.forEach((w) => { const s = w.exercises.reduce((t, e) => t + e.sets.length, 0) + ((w.cardio || []).length); if (s > 0) trained[w.date] = s; });
    const days = [];
    for (let i = 181; i >= 0; i--) { const iso = isoMinus(i); const score = trained[iso] || 0; const lvl = score === 0 ? 0 : score <= 3 ? 1 : score <= 6 ? 2 : score <= 10 ? 3 : 4; const dw = (new Date(iso + "T00:00:00").getDay() + 6) % 7; days.push({ iso, dw, lvl, score }); }
    let streak = 0; for (let i = 0; ; i++) { if (trained[isoMinus(i)]) streak++; else break; }
    const total = Object.keys(trained).length;
    const wk = (iso) => { const d = new Date(iso + "T00:00:00"); const j = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + "-" + Math.ceil(((d - j) / 86400000 + j.getDay() + 1) / 7); };
    const weeks = {}; Object.keys(trained).forEach((iso) => { weeks[wk(iso)] = (weeks[wk(iso)] || 0) + 1; });
    const bestWeek = Object.values(weeks).length ? Math.max(...Object.values(weeks)) : 0;
    return { days, streak, total, weeksOn: Object.keys(weeks).length, bestWeek };
  }, [workouts]);

  const projection = useMemo(() => {
    if (!goals.targetWeight || currentMA === null || trend === null || Math.abs(trend) < 0.02) return null;
    const remaining = Number(goals.targetWeight) - currentMA;
    if (Math.sign(remaining) !== Math.sign(trend)) return { off: true };
    const weeks = remaining / trend; const d = new Date(); d.setDate(d.getDate() + Math.round(weeks * 7));
    return { weeks: Math.round(weeks), date: d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) };
  }, [goals, currentMA, trend]);
  const cyc = cycleInfo(periods);

  const alerts = useMemo(() => {
    const a = [];
    recentPRs.forEach((p) => a.push({ type: "pr", title: `¡Nuevo récord en ${p.name}!`, body: `Tu 1RM estimado subió a ${p.best} kg. La sobrecarga progresiva está funcionando.` }));
    if (trend !== null) {
      const diff = trend - goals.weeklyChange;
      if (Math.abs(diff) > 0.25) a.push({ type: "warn", title: "Desvío en tu tendencia de peso", body: `Tendencia real ${trend > 0 ? "+" : ""}${trend.toFixed(2)} kg/sem vs objetivo ${goals.weeklyChange > 0 ? "+" : ""}${goals.weeklyChange.toFixed(2)}. ${diff > 0 ? "Vas más hacia arriba de lo previsto — recorta calorías." : "Bajas más rápido de lo previsto — sube calorías para proteger músculo."}${maintenance ? ` Mantenimiento estimado ~${maintenance.maint} kcal.` : ""}${cycleConfound ? " Estás en fase lútea tardía con síntomas compatibles con retención de líquidos — parte de este desvío puede ser agua, no grasa. Esperá unos días antes de ajustar calorías." : ""}` });
      else a.push({ type: "ok", title: "Peso en línea con tu objetivo", body: `Tendencia real ${trend > 0 ? "+" : ""}${trend.toFixed(2)} kg/sem, dentro de ±0,25 de tu meta.` });
    }
    if (protAvg7 !== null && goals.proteinTarget && protAvg7 < 0.85 * goals.proteinTarget) a.push({ type: "warn", title: "Proteína por debajo del objetivo", body: `Media de ${Math.round(protAvg7)} g/día la última semana frente a tu meta de ${goals.proteinTarget} g.` });
    const vols = MAJOR_MUSCLES.map((m) => weeklyMuscle[m] || 0); const maxV = Math.max(...vols);
    if (maxV > 0) { const neglected = MAJOR_MUSCLES.filter((m) => (weeklyMuscle[m] || 0) < 0.15 * maxV); if (neglected.length) a.push({ type: "warn", title: "Posible descompensación muscular", body: `Esta semana apenas trabajaste: ${neglected.join(", ")}. Equilibrar el volumen reduce riesgo de lesión.` }); }
    if (lastTrain && daysBetween(lastTrain, todayISO()) >= 4) a.push({ type: "info", title: "Racha de entreno en pausa", body: `Llevas ${daysBetween(lastTrain, todayISO())} días sin registrar entrenamiento.` });
    if (projection && projection.off) a.push({ type: "info", title: "No avanzas hacia tu peso meta", body: "A tu ritmo actual no te acercas a la meta fijada. Revisa objetivo o calorías." });
    // Dos niveles: señal aislada = versión reducida de la próxima sesión; fatiga en
    // 2+ ejercicios distintos, o señal de RPE + energía baja reportada 3+ días de la
    // semana = semana de descarga completa. Si coincide con lútea tardía sintomática,
    // no se escala a semana: lo esperable es que remita al arrancar la folicular.
    const rpeFatigue = loadRpe.fatigue || deloadSignal;
    const deloadWeek = !cycleConfound && (loadRpe.fatigueCount >= 2 || (rpeFatigue && lowEnergyDays >= 3));
    if (rpeFatigue || cycleConfound) {
      const reasons = [];
      if (loadRpe.fatigue) reasons.push(`a igual carga (${loadRpe.fatigue.name} ${loadRpe.fatigue.kg} kg × ${loadRpe.fatigue.reps}) tu RPE subió ${loadRpe.fatigue.from.toFixed(1)} → ${loadRpe.fatigue.to.toFixed(1)} en las últimas 3 sesiones${loadRpe.fatigueCount >= 2 ? ` — y pasa en ${loadRpe.fatigueCount} ejercicios distintos` : ""}`);
      else if (deloadSignal) reasons.push(`tu RPE medio por sesión viene subiendo (${deloadSignal.from.toFixed(1)} → ${deloadSignal.to.toFixed(1)} en las últimas 3)`);
      if (lowEnergyDays >= 3) reasons.push(`reportaste energía baja ${lowEnergyDays} días esta semana`);
      if (cycleConfound) reasons.push("estás en fase lútea tardía con síntomas altos");
      if (deloadWeek) {
        a.push({ type: "warn", title: "Programá una semana de descarga", body: `${reasons.join(" y ")}. Esto ya no parece un ejercicio estancado sino fatiga acumulada: hacé toda la semana con la versión reducida de tus rutinas (menos series, mismo patrón) y retomá la progresión la semana siguiente.` });
      } else {
        a.push({ type: "info", title: "Señal de deload", body: `${reasons.join(" y ")}. Es razonable considerar la versión reducida de tu próxima rutina en vez de la completa${cycleConfound ? " — si la causa es la fase del ciclo, debería remitir al arrancar la folicular; si persiste después, pensá en una semana de descarga" : ""}.` });
      }
    }
    if (loadRpe.progress) a.push({ type: "ok", title: `Lista para subir carga en ${loadRpe.progress.name}`, body: `${loadRpe.progress.kg} kg × ${loadRpe.progress.reps} te costó cada vez menos (RPE ${loadRpe.progress.from.toFixed(1)} → ${loadRpe.progress.to.toFixed(1)} en las últimas 3 sesiones). Subí al siguiente escalón de peso o sumá 1-2 reps manteniendo el RPE objetivo.` });
    // Recordatorio para volver a ajustar la retención por ciclo (hoy solo advertencia
    // de texto, no corrección numérica). El ajuste de RPE a igual carga ya está
    // implementado (loadRpe). Umbral: 3 ciclos completos.
    const CYCLE_TARGET = 3;
    if (completeCyclesCount < CYCLE_TARGET) {
      a.push({ type: "info", title: "Progreso hacia seguimiento más robusto", body: `Ciclos completos registrados: ${completeCyclesCount}/${CYCLE_TARGET}. Cuando llegues a la meta, volvé a pedir el ajuste de retención por ciclo.` });
    } else {
      a.push({ type: "ok", title: "Listo para ajustar retención por ciclo", body: `Ya tenés ${completeCyclesCount} ciclos completos registrados. Pedime que derive el offset de retención por ciclo con este historial.` });
    }
    return a;
  }, [recentPRs, trend, goals, maintenance, protAvg7, weeklyMuscle, lastTrain, projection, cycleConfound, deloadSignal, completeCyclesCount, loadRpe, lowEnergyDays]);

  const noData = weights.length === 0 && workouts.length === 0 && nutrition.length === 0;
  if (noData) return <div className="ft-card"><div className="ft-empty"><div className="ic"><LayoutDashboard size={34} /></div>Aún no hay datos. Registra entrenamientos, peso o comidas y aquí verás tu evolución, récords y alertas.</div></div>;

  const kpis = [
    { k: "Peso · media 7d", v: currentMA, dec: 1, u: "kg", sub: currentW !== null ? `hoy ${currentW.toFixed(1)} kg` : "sin registro", big: true },
    { k: "Cambio 7 días", v: change7, dec: 1, u: "kg", sub: "tendencia real", signed: true },
    { k: "Mantenimiento", v: maintenance ? maintenance.maint : null, dec: 0, u: "kcal", sub: maintenance ? `de ${maintenance.days} días` : "necesito ~2 sem." },
    { k: "Constancia", v: trainingDays7, dec: 0, u: "/sem", sub: `${nutDays7} días dieta · ${avgMin} min/ses` },
  ];
  const macroRows = macro14 ? [
    { label: "Proteína", avg: macro14.p, target: macroTargets.p, hero: true },
    { label: "Carbohidratos", avg: macro14.c, target: macroTargets.c },
    { label: "Grasa", avg: macro14.f, target: macroTargets.f },
  ] : [];
  const dateLabel = new Date().toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const alColor = (ty) => ty === "warn" ? A_DANGER : ty === "ok" ? A_OK : ty === "pr" ? A_ACC : A_INK2;
  const rowGrid = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.85fr 1fr", borderTop: `1px solid ${A_LINE}` };
  const cellL = { padding: isMobile ? "20px 18px 22px" : "22px 28px 26px", borderRight: isMobile ? "none" : `1px solid ${A_LINE}`, borderBottom: isMobile ? `1px solid ${A_LINE}` : "none" };
  const cellR = { padding: isMobile ? "20px 18px 22px" : "22px 28px 24px" };
  const secHead = { display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6, marginBottom: 16 };
  const secTitle = { ...dSecH, fontSize: isMobile ? 19 : 24, whiteSpace: isMobile ? "normal" : "nowrap" };
  const meta = { fontFamily: A_MONO, fontSize: 11, color: A_INK2, textTransform: "uppercase", letterSpacing: ".04em" };
  const selStyle = { fontFamily: A_MONO, fontSize: 11, color: A_INK, background: A_PANEL, border: `1px solid ${A_LINE}`, padding: "5px 8px", textTransform: "uppercase", letterSpacing: ".04em", cursor: "pointer" };

  return (
    <div style={{ marginBottom: 8 }}>
      {alerts.length > 0 && (
        <div style={{ border: `1px solid ${A_LINE}`, borderLeft: `5px solid ${A_ACC}`, background: A_PANEL, padding: "16px 22px", marginBottom: 18 }}>
          <DKicker color={A_ACC}>Alertas y avisos · {alerts.length}</DKicker>
          <div style={{ fontFamily: A_DISP, fontWeight: 800, fontSize: 22, textTransform: "uppercase", letterSpacing: "-0.01em", marginTop: 6, color: A_INK }}>{alerts[0].title}.</div>
          <div style={{ fontSize: 13, color: A_INK2, marginTop: 6, lineHeight: 1.5, maxWidth: 780 }}>{alerts[0].body}</div>
          {alerts.length > 1 && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7, borderTop: `1px solid ${A_HAIR}`, paddingTop: 12 }}>
              {alerts.slice(1).map((al, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 12.5, color: A_INK2, lineHeight: 1.45 }}>
                  <span style={{ width: 7, height: 7, marginTop: 5, flexShrink: 0, background: alColor(al.type) }} />
                  <span><b style={{ color: A_INK }}>{al.title}.</b> {al.body}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ border: `1px solid ${A_LINE}`, background: A_PAPER, color: A_INK, fontFamily: A_DISP }}>
        {/* masthead */}
        <Rise show={show} i={0}>
          <div style={{ padding: isMobile ? "20px 18px 0" : "26px 28px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontFamily: A_MONO, fontSize: 11, letterSpacing: ".2em", color: A_INK2, paddingTop: 6 }}>FITTRACK&nbsp;—&nbsp;N°01</div>
              <div style={{ fontFamily: A_MONO, fontSize: 11, letterSpacing: ".12em", color: A_INK2 }}>{dateLabel}</div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 8, borderBottom: `2px solid ${A_INK}`, paddingBottom: 12 }}>
              <h1 style={{ margin: 0, fontFamily: A_DISP, fontWeight: 900, fontSize: isMobile ? 44 : 84, lineHeight: 0.82, letterSpacing: "-0.05em", textTransform: "uppercase" }}>Resumen</h1>
              {!isMobile && <div style={{ textAlign: "right", maxWidth: 260, fontFamily: A_MONO, fontSize: 11, lineHeight: 1.5, color: A_INK2, paddingBottom: 6 }}>Cuerpo · Fuerza · Nutrición. Una sola vista de tu progreso real.</div>}
            </div>
          </div>
        </Rise>

        {/* KPI strip */}
        <Rise show={show} i={1}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", borderBottom: `1px solid ${A_LINE}` }}>
            {kpis.map((s, i) => (
              <div key={i} style={{
                padding: isMobile ? "14px 16px 16px" : "20px 24px 22px",
                borderLeft: isMobile ? (i % 2 ? `1px solid ${A_LINE}` : "none") : (i ? `1px solid ${A_LINE}` : "none"),
                borderTop: isMobile && i >= 2 ? `1px solid ${A_LINE}` : "none",
              }}>
                <DKicker>{s.k}</DKicker>
                <div style={{ fontFamily: A_DISP, fontWeight: 800, fontSize: isMobile ? 34 : (s.big ? 60 : 52), lineHeight: 0.95, letterSpacing: "-0.04em", marginTop: 10, fontVariantNumeric: "tabular-nums", color: s.signed ? (s.v <= 0 ? A_OK : A_ACC) : A_INK }}>
                  {s.v === null ? "—" : <>{s.signed && s.v > 0 ? "+" : ""}<CountUp value={s.v} decimals={s.dec} delay={300 + i * 90} /></>}
                  <span style={{ fontSize: isMobile ? 14 : 18, fontFamily: A_MONO, fontWeight: 500, marginLeft: 6, color: A_INK2 }}>{s.u}</span>
                </div>
                <div style={{ fontFamily: A_MONO, fontSize: 11, color: A_INK2, marginTop: 9 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </Rise>

        {/* weight + records */}
        <div style={{ ...rowGrid, borderTop: "none" }}>
          <Rise show={show} i={2} style={cellL}>
            <div style={secHead}>
              <h2 style={secTitle}>Peso y tendencia</h2>
              <div style={{ display: "flex", gap: 16 }}><DLegend color={A_ACC} label="Media 7d" /><DLegend color={A_INK2} label="Objetivo" dash /></div>
            </div>
            {weightChart.length >= 2 ? <BWeightChart data={weightChart.map((point) => ({ ...point, date: fmtDate(point.iso) }))} targetKey="objetivo" /> : <DNeed>Registra tu peso al menos 2 días para ver la tendencia.</DNeed>}
          </Rise>
          <Rise show={show} i={3} style={cellR}>
            <h2 style={{ ...secTitle, marginBottom:16 }}>Récords</h2>
            {prs.length > 0 ? (
              <div>{prs.slice(0, 6).map((p, i) => (
                <div key={p.name} style={{ display: "grid", gridTemplateColumns: "20px 1fr auto", alignItems: "baseline", gap: 10, padding: "9px 0", borderBottom: i < Math.min(prs.length, 6) - 1 ? `1px solid ${A_HAIR}` : "none" }}>
                  <span style={{ fontFamily: A_MONO, fontSize: 11, color: A_INK2 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>{p.name}{p.isRecent && <span style={{ fontFamily: A_MONO, fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", background: A_ACC, color: A_PAPER, padding: "2px 5px" }}>nuevo</span>}</span>
                  <span style={{ fontFamily: A_DISP, fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>{p.best}<span style={{ fontSize: 12, fontFamily: A_MONO, fontWeight: 500, color: A_INK2, marginLeft: 3 }}>kg</span></span>
                </div>
              ))}</div>
            ) : <DNeed>Registra entrenamientos con peso y reps para ver tus 1RM estimados.</DNeed>}
          </Rise>
        </div>

        {/* strength + macros */}
        <div style={rowGrid}>
          <Rise show={show} i={4} style={cellL}>
            <div style={secHead}><h2 style={secTitle}>Progresión de fuerza</h2><span style={meta}>1RM est. · vs inicio</span></div>
            {trackable.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <select value={muscleFilter} onChange={(e) => { setMuscleFilter(e.target.value); setExFilter("all"); }} style={selStyle}>
                  <option value="all">Todos los músculos</option>
                  {muscleOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={activeEx} onChange={(e) => setExFilter(e.target.value)} style={selStyle}>
                  <option value="all">Todos los ejercicios</option>
                  {exOptions.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}
            {strengthSeries.length > 0 ? <><BStrength series={strengthSeries} isMobile={isMobile} />{isMobile && <BStrengthLegend series={strengthSeries} />}</> : <DNeed>Necesitas al menos 2 sesiones de un mismo ejercicio.</DNeed>}
          </Rise>
          <Rise show={show} i={5} style={cellR}>
            <div style={secHead}><h2 style={secTitle}>Macros</h2><span style={meta}>media 14d · carbo/grasa según frec. de entreno</span></div>
            {macro14 ? <BMacros rows={macroRows} footer={`media ${Math.round(macro14.k)} / ${goals.kcalTarget || "—"} kcal`} /> : <DNeed>Registra comidas para ver tus macros.</DNeed>}
          </Rise>
        </div>

        {rpeSeries.length >= 2 && (
          <div style={{ borderTop: `1px solid ${A_LINE}` }}>
            <Rise show={show} i={6} style={{ padding: isMobile ? "20px 18px 22px" : "22px 28px 26px" }}>
              <div style={secHead}><h2 style={secTitle}>Esfuerzo (RPE)</h2><span style={meta}>{rpeSeries.length} sesiones · ahora {rpeSeries[rpeSeries.length - 1].rpe.toFixed(1)}</span></div>
              <BWeightChart data={rpeSeries.map((point) => ({ ...point, date: fmtDate(point.iso) }))} valueKey="rpe" valueLabel="RPE medio" unit="RPE" />
            </Rise>
          </div>
        )}

        {measLatest && (
          <div style={{ borderTop: `1px solid ${A_LINE}` }}>
            <Rise show={show} i={6} style={{ padding: isMobile ? "20px 18px 22px" : "22px 28px 26px" }}>
              <div style={secHead}><h2 style={secTitle}>Medidas</h2><span style={meta}>última {fmtDate(measLatest.date)}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${isMobile ? 3 : 5}, 1fr)`, gap: 1, background: A_LINE, border: `1px solid ${A_LINE}` }}>
                {MEAS_FIELDS.filter(([k]) => measLatest[k] != null).map(([k, label]) => {
                  const d = measDelta(k);
                  return (
                    <div key={k} style={{ background: A_PAPER, padding: "12px 14px" }}>
                      <DKicker>{label}</DKicker>
                      <div style={{ fontFamily: A_DISP, fontWeight: 800, fontSize: isMobile ? 24 : 30, letterSpacing: "-0.03em", marginTop: 6 }}>{measLatest[k]}<span style={{ fontSize: 13, fontFamily: A_MONO, fontWeight: 500, color: A_INK2, marginLeft: 3 }}>cm</span></div>
                      {d != null && <div style={{ fontFamily: A_MONO, fontSize: 11, marginTop: 4, color: d <= 0 ? A_OK : A_INK2 }}>{d > 0 ? "+" : ""}{d.toFixed(1)} cm</div>}
                    </div>
                  );
                })}
              </div>
            </Rise>
          </div>
        )}

        {/* calories + muscle */}
        <div style={{ ...rowGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1.25fr" }}>
          <Rise show={show} i={6} style={cellL}>
            <h2 style={{ ...secTitle, marginBottom:18 }}>Calorías</h2>
            {kcalChart.some((d) => d.kcal > 0) ? (<><BKcalBars data={kcalChart} target={Number(goals.kcalTarget) || null} /><div style={{ display: "flex", justifyContent: "space-between", ...meta, marginTop: 10 }}><span>últimos 14 días</span><span>media {kcalAvg || "—"} kcal</span></div></>) : <DNeed>Registra comidas para ver tus calorías diarias.</DNeed>}
          </Rise>
          <Rise show={show} i={7} style={cellR}>
            <div style={secHead}><h2 style={secTitle}>Volumen muscular</h2><span style={meta}>{Object.keys(weeklyMuscle).length ? "esta semana" : "histórico"} · tonelaje + % ef. vs tu media</span></div>
            {muscleData.length > 0 ? <BMuscleBars data={muscleData} /> : <DNeed>Registra entrenamientos para ver el volumen por grupo.</DNeed>}
          </Rise>
        </div>

        {/* consistency + streak */}
        <div style={rowGrid}>
          <Rise show={show} i={8} style={cellL}>
            <div style={secHead}><h2 style={secTitle}>Constancia</h2><span style={meta}>{isMobile ? "últimas 12 semanas" : "últimas 26 semanas"}</span></div>
            <BHeatmap days={heat.days} isMobile={isMobile} />
          </Rise>
          <Rise show={show} i={9} style={cellR}>
            <h2 style={{ ...secTitle, marginBottom:14 }}>Racha</h2>
            <div style={{ fontFamily: A_DISP, fontWeight: 800, fontSize: 60, lineHeight: 0.95, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", color: A_ACC }}>
              <CountUp value={heat.streak} delay={700} /><span style={{ fontSize: 15, fontFamily: A_MONO, fontWeight: 500, marginLeft: 8, letterSpacing: ".04em", color: A_INK2, textTransform: "uppercase" }}>días</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
              {[`${heat.total} sesiones registradas`, `${heat.weeksOn} semanas con entreno`, `mejor semana: ${heat.bestWeek} sesiones`].map((line, i) => (
                <div key={i} style={{ fontFamily: A_MONO, fontSize: 12, color: A_INK, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${A_HAIR}` : "none", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, background: i === 0 ? A_ACC : A_INK2, flexShrink: 0 }} />{line}
                </div>
              ))}
            </div>
          </Rise>
        </div>

        {/* footer: projection + cycle */}
        {(projection && !projection.off || cyc) && (
          <Rise show={show} i={10}>
            <div style={{ display: "grid", gridTemplateColumns: !isMobile && cyc && projection && !projection.off ? "1fr 1fr" : "1fr", borderTop: `2px solid ${A_INK}` }}>
              {projection && !projection.off && (
                <div style={{ padding: isMobile ? "16px 18px" : "18px 28px", borderRight: !isMobile && cyc ? `1px solid ${A_LINE}` : "none", borderBottom: isMobile && cyc ? `1px solid ${A_LINE}` : "none", display: "flex", gap: 14 }}>
                  <div style={{ fontFamily: A_DISP, fontWeight: 900, fontSize: 30, color: A_ACC, lineHeight: 1 }}>→</div>
                  <div><DKicker color={A_ACC}>Proyección a tu meta</DKicker><div style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 6, color: A_INK, maxWidth: 460 }}>A tu ritmo actual llegarías a {goals.targetWeight} kg alrededor del <b>{projection.date}</b> (~{Math.abs(projection.weeks)} semanas).</div></div>
                </div>
              )}
              {cyc && (
                <div style={{ padding: isMobile ? "16px 18px" : "18px 28px", display: "flex", gap: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: CYCLE_PHASES[cyc.phase].color, marginTop: 6, flexShrink: 0 }} />
                  <div><DKicker>Ciclo · fase {cyc.phase} · día {cyc.day}</DKicker><div style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 6, color: A_INK2, maxWidth: 460 }}>{CYCLE_PHASES[cyc.phase].note} {cyc.daysToNext >= 0 ? `Próximo periodo en ~${cyc.daysToNext} días.` : `Periodo con ~${Math.abs(cyc.daysToNext)} días de retraso.`}</div></div>
                </div>
              )}
            </div>
          </Rise>
        )}
      </div>
    </div>
  );
}
