import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CYCLE_PHASES, KCAL_PER_KG, PHASE_GROUPS, tracksCycle } from "./app-config.js";
import { alertMetrics } from "./alerts.js";
import { daysBetween, localISO } from "./app-utils.js";
import { CLEAR_BLEEDING_LEVELS, cycleContext, inferCyclePhase, ovulationEstimate, phaseSegments, symptomScore } from "./cycle-inference.js";
import { planCompliance } from "./app-utils.js";
import DetailSheet from "./DetailSheet.jsx";
import { weightVsExpected } from "./settings-utils.js";
import { A_DISP, A_INK, A_INK2, A_MONO, DKicker, useIsMobile, useReveal } from "./EditorialUI.jsx";

const SECONDARY_FACTOR = 0.5;
const todayISO = () => localISO();
const round1 = (value) => Math.round(value * 10) / 10;
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
const isoMinus = (days) => { const date = new Date(); date.setDate(date.getDate() - days); return localISO(date); };

/* ----------------------------- DASHBOARD ----------------------------- */
/* ============================================================
   BRUTALIST DASHBOARD — editorial layout fed by real data.
   Inlined animation/SVG primitives (bone/ink/tangerine).
   ============================================================ */
const A_PAPER = "var(--bg)", A_PANEL = "var(--panel)",
  A_ACC = "var(--accent)", A_OK = "var(--ok)", A_DANGER = "var(--danger)",
  A_LINE = "var(--line)", A_HAIR = "var(--hair)";
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
  const ramp = ["var(--hair)", "rgba(231,83,28,0.26)", "rgba(231,83,28,0.5)", "rgba(231,83,28,0.74)", "var(--accent)"];
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


/* ----------------------------------------------------------------------------
   PESO · REAL VS ESPERADO — la tarjeta que encabeza Metricas (prototipo 3a).
   Una tarjeta, no una pantalla: quien solo quiere el progreso general sigue de
   largo hasta la cuadricula. La matematica esta en weightVsExpected.
   ---------------------------------------------------------------------------- */
// Tarjeta de seccion del prototipo: cabecera en mono, contenido dentro.
function DCard({ id, title, meta, span, children }) {
  return (
    <div id={id ? `card-${id}` : undefined} className={span ? "ft-dc-card span2" : "ft-dc-card"}>
      <div className="h"><span>{title}</span>{meta && <span>{meta}</span>}</div>
      {children}
    </div>
  );
}

// Cabecera de la tarjeta de peso: real, esperado y meta. Vivia en una tarjeta
// propia encima del grafico de tendencia, que dibujaba la MISMA serie: dos
// tarjetas seguidas respondiendo a la misma pregunta con dos dibujos distintos.
function VsExpectedHead({ vs }) {
  // 68 y no 68,0: la meta suele ser redonda y el decimal vacio solo hace ruido.
  const kg = (value) => (Math.round(value * 10) / 10).toString().replace(".", ",");
  const fecha = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const gap = Math.abs(vs.delta);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap", paddingBottom: 4 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="ft-dc-big">{kg(vs.real)}<small>kg real</small></span>
        <span style={{ fontFamily: A_MONO, fontSize: 10.5, color: A_INK2 }}>
          esperado {kg(vs.expected)}{vs.target ? ` · meta ${kg(vs.target)}` : ""}
        </span>
      </div>
      <div className="ft-dc-foot" style={{ borderTop: "none", paddingTop: 0, marginTop: 0, flex: "1 1 190px" }}>
        {gap >= 0.1 && vs.ahead != null && (
          <span className={vs.ahead ? "ft-dc-tag" : "ft-dc-tag late"}>{kg(gap)} KG {vs.ahead ? "ADELANTADA" : "POR DETRÁS"}</span>
        )}
        <span style={{ flex: 1 }}>
          {vs.projection ? `proyección ${fecha(vs.projection)}` : vs.perWeek == null ? "sin tendencia aún" : "sin proyección a este ritmo"}
        </span>
      </div>
    </div>
  );
}

// Barra de fases del ciclo en curso: ancho proporcional a los dias que llevo
// cada fase, no a una duracion asumida.
function BCycleStrip({ segments }) {
  const total = segments.reduce((sum, seg) => sum + seg.days, 0) || 1;
  return (
    <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", background: A_HAIR }}>
      {segments.map((seg, i) => (
        <span
          key={`${seg.phase}-${i}`}
          title={`${seg.label} · ${seg.days} d`}
          style={{ width: `${(seg.days / total) * 100}%`, background: (CYCLE_PHASES[PHASE_GROUPS[seg.phase]] || CYCLE_PHASES["Por confirmar"]).color }}
        />
      ))}
    </div>
  );
}

// Filas clave/valor: el mismo formato que usa la hoja de detalle, pero dentro de
// una tarjeta. ponytail: si aparece una tercera copia, extraer a EditorialUI.
function BRows({ rows }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map((row, i) => (
        <div key={row.k} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: i < rows.length - 1 ? "1px solid var(--hair)" : "none" }}>
          <span style={{ fontFamily: A_MONO, fontSize: 10.5, color: A_INK2 }}>{row.k}</span>
          <span style={{ fontFamily: A_MONO, fontSize: 12.5, fontWeight: 600, textAlign: "right", color: row.strong ? A_INK : A_INK2 }}>{row.v}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardScreen({ workouts, weights, nutrition, measurements, periods, goals, menstrualLogs = [], wellness = [], routines = [], focusCard = null, onFocused }) {
  const isMobile = useIsMobile();
  // Tendencia, records, RPE, retencion lutea: la cadena entera vive en alerts.js
  // porque el Diario necesita los mismos numeros para pintar los avisos, y
  // calcularlos dos veces era pedir que un dia dejaran de coincidir.
  const m = useMemo(
    () => alertMetrics({ workouts, nutrition, weights, wellness, periods, menstrualLogs, goals }),
    [workouts, nutrition, weights, wellness, periods, menstrualLogs, goals],
  );
  const {
    sortedW, maSeries, maSeriesForTrend, currentMA, lutealOffset, completeCyclesCount,
    trend, cycleConfound, loadRpe, exHistory, prs, recentPRs, weeklyMuscle,
    rpeSeries, deloadSignal, maintenance, protAvg7, lastTrain, projection,
  } = m;
  const vsExpected = useMemo(() => weightVsExpected(weights, goals), [weights, goals]);
  const weightChart = useMemo(() => {
    if (!maSeries.length) return [];
    const start = maSeries[0]; const startKg = goals.startWeight ? Number(goals.startWeight) : start.real;
    return maSeries.map((p) => ({ ...p, objetivo: Number((startKg + goals.weeklyChange * (daysBetween(start.iso, p.iso) / 7)).toFixed(2)) }));
  }, [maSeries, goals]);
  const currentW = sortedW.length ? sortedW[sortedW.length - 1].kg : null;
  const change7 = useMemo(() => { if (sortedW.length < 2) return null; const last = sortedW[sortedW.length - 1]; const ref = [...sortedW].reverse().find((w) => daysBetween(w.date, last.date) >= 7); return ref ? round1(last.kg - ref.kg) : null; }, [sortedW]);

  const trackable = useMemo(() => Object.keys(exHistory).filter((n) => exHistory[n].length >= 2), [exHistory]);
  const muscleOptions = useMemo(() => [...new Set(trackable.map((n) => exHistory[n][0].muscle))].sort(), [trackable, exHistory]);
  const [filter, setFilter] = useState("all");
  const [openKpi, setOpenKpi] = useState(null);
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [exFilter, setExFilter] = useState("all");
  const exOptions = useMemo(() => trackable.filter((n) => muscleFilter === "all" || exHistory[n][0].muscle === muscleFilter).sort(), [trackable, exHistory, muscleFilter]);
  // exFilter puede quedar obsoleto al cambiar de músculo; lo tratamos como "all" si ya no aplica
  const activeEx = exOptions.includes(exFilter) ? exFilter : "all";
  const strengthSeries = useMemo(() => {
    const colors = [A_ACC, A_INK, "var(--muted)", A_OK];
    const picked = (activeEx !== "all" ? [activeEx] : [...exOptions].sort((a, b) => exHistory[b].length - exHistory[a].length)).slice(0, 4);
    return picked.map((n, idx) => { const h = exHistory[n]; const first = h[0].oneRM || 1; return { label: n.length > 11 ? n.slice(0, 11) : n, color: colors[idx % colors.length], w: idx === 0 ? 3 : 2.25, points: h.map((x) => ({ date: x.iso, pct: (x.oneRM / first - 1) * 100, kg: x.oneRM })), lastKg: h[h.length - 1].oneRM }; });
  }, [exHistory, exOptions, activeEx]);

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
  const measSorted = useMemo(() => [...measurements].sort((a, b) => a.date.localeCompare(b.date)), [measurements]);
  const measLatest = measSorted[measSorted.length - 1] || null;
  const MEAS_FIELDS = [["cintura", "Cintura"], ["cadera", "Cadera"], ["pecho", "Pecho"], ["brazo", "Brazo"], ["muslo", "Muslo"]];
  const measDelta = (k) => { const s = measSorted.filter((m) => m[k] != null); return s.length >= 2 ? s[s.length - 1][k] - s[0][k] : null; };
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

  const nutDays7 = useMemo(() => new Set(nutrition.filter((n) => n.date >= isoMinus(7)).map((n) => n.date)).size, [nutrition]);
  const totalMin = workouts.reduce((t, w) => t + (w.durationMin || 0), 0);
  const timed = workouts.filter((w) => w.durationMin > 0).length;
  const avgMin = timed ? Math.round(totalMin / timed) : 0;

  // Adherencia al plan: cuantas de las sesiones previstas se registraron en las
  // 8 semanas completas anteriores. El mapa de calor de al lado dice cuando
  // entrenaste; esto dice si eso era lo que tocaba, que el mapa no sabe.
  const compliance = useMemo(() => planCompliance(routines, workouts), [routines, workouts]);
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

  // Resumen del ciclo EN MARCHA, no solo la fase de hoy: cuanto llevas, que
  // fases han pasado, cuanto sangrado y cuantos dias con sintomas altos. Es lo
  // que Cuerpo ya sabe del historico, contado del ciclo que estas viviendo.
  const cyc = useMemo(() => {
    const date = todayISO();
    const ctx = cycleContext(date, periods, menstrualLogs);
    if (!ctx.currentStart) return null;
    const phase = PHASE_GROUPS[inferCyclePhase({ date, menstrualLogs, periods, wellness }).phase];
    const logs = menstrualLogs.filter((log) => log.date >= ctx.currentStart && log.date <= date);
    return {
      phase, day: ctx.cycleDay, daysToNext: ctx.daysToNext, avgCycle: ctx.avgCycle, samples: ctx.samples,
      start: ctx.currentStart, nextPeriod: ctx.nextPeriod,
      segments: phaseSegments(ctx.currentStart, date, periods, menstrualLogs),
      logged: logs.length,
      bleedDays: logs.filter((log) => CLEAR_BLEEDING_LEVELS.includes(log.bleedingLevel)).length,
      symptomDays: logs.filter((log) => symptomScore(log) >= 3).length,
      ovulation: ovulationEstimate({ date, periods, menstrualLogs }),
    };
  }, [periods, menstrualLogs, wellness]);

  // Sueno: ya se registra en el check-in de Cuerpo y no se veia en ningun lado.
  const sleep = useMemo(() => {
    const nights = wellness.filter((w) => Number(w.sleep) > 0).sort((a, b) => a.date.localeCompare(b.date));
    if (!nights.length) return null;
    const mean = (list) => list.reduce((sum, w) => sum + Number(w.sleep), 0) / list.length;
    const last14 = nights.filter((w) => w.date >= isoMinus(13));
    const last7 = nights.filter((w) => w.date >= isoMinus(6));
    if (!last14.length) return null;
    return {
      avg7: last7.length ? mean(last7) : null, avg14: mean(last14), nights: last14.length,
      short: last14.filter((w) => Number(w.sleep) < 6).length,
      best: Math.max(...last14.map((w) => Number(w.sleep))), worst: Math.min(...last14.map((w) => Number(w.sleep))),
      series: last14.map((w) => ({ iso: w.date, sueno: round1(Number(w.sleep)) })),
    };
  }, [wellness]);

  // Pulso en reposo: sube cuando la recuperacion va mal, asi que se lee contra tu
  // propia linea base (28 dias previos), no contra una tabla por edad.
  const hr = useMemo(() => {
    const days = wellness.filter((w) => Number(w.restingHr) > 0).sort((a, b) => a.date.localeCompare(b.date));
    if (!days.length) return null;
    const mean = (list) => list.reduce((sum, w) => sum + Number(w.restingHr), 0) / list.length;
    const recent = days.filter((w) => w.date >= isoMinus(6));
    const baseline = days.filter((w) => w.date < isoMinus(6) && w.date >= isoMinus(34));
    return {
      last: Number(days[days.length - 1].restingHr), lastDate: days[days.length - 1].date,
      avg7: recent.length ? mean(recent) : null, base: baseline.length >= 5 ? mean(baseline) : null,
      days: days.length,
      series: days.filter((w) => w.date >= isoMinus(29)).map((w) => ({ iso: w.date, pulso: Math.round(Number(w.restingHr)) })),
    };
  }, [wellness]);

  // Movimiento: el cardio ya registrado en Entrenar, agregado. Es donde aterriza
  // lo que venga de un reloj o de Strava: misma entrada, tipo + minutos + kcal.
  const movement = useMemo(() => {
    const items = workouts.filter((w) => w.date >= isoMinus(27)).flatMap((w) => (w.cardio || []).map((c) => ({ ...c, date: w.date })));
    if (!items.length) return null;
    const byType = {};
    items.forEach((c) => {
      const row = byType[c.type] || (byType[c.type] = { min: 0, kcal: 0, n: 0 });
      row.min += Number(c.minutes) || 0; row.kcal += Number(c.kcal) || 0; row.n += 1;
    });
    const week = items.filter((c) => c.date >= isoMinus(6));
    return {
      rows: Object.entries(byType).map(([type, v]) => ({ type, ...v })).sort((a, b) => b.min - a.min),
      totalMin: items.reduce((sum, c) => sum + (Number(c.minutes) || 0), 0),
      weekMin: week.reduce((sum, c) => sum + (Number(c.minutes) || 0), 0),
      days: new Set(items.map((c) => c.date)).size,
    };
  }, [workouts]);


  // Un aviso del Diario apunta a la tarjeta que lo disparo. Si el filtro activo
  // la esconde no hay nada a lo que desplazarse, asi que primero se quita.
  useEffect(() => {
    if (!focusCard) return;
    setFilter("all");
    const node = document.getElementById(`card-${focusCard}`);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    node.classList.add("ft-dc-focus");
    const clear = setTimeout(() => node.classList.remove("ft-dc-focus"), 2200);
    onFocused?.();
    return () => clearTimeout(clear);
  }, [focusCard, onFocused]);

  const noData = weights.length === 0 && workouts.length === 0 && nutrition.length === 0;
  if (noData) return <div className="ft-card"><div className="ft-empty"><div className="ic"><LayoutDashboard size={34} /></div>Aún no hay datos. Registra entrenamientos, peso o comidas y aquí verás tu evolución, récords y alertas.</div></div>;

  // Cada cifra de arriba abre su desglose. No es una pantalla nueva: es la misma
  // cifra, con de donde sale y que significa. Las notas se escriben desde los
  // datos; cuando no hay nada que decir, no se dice nada.
  const kg1 = (value) => (value == null ? "—" : `${value.toFixed(1).replace(".", ",")} kg`);
  const kcal = (value) => `${Math.round(value).toLocaleString("es-ES")} kcal`;
  const kpis = [
    { k: "Peso · media 7d", v: currentMA, dec: 1, u: "kg", sub: currentW !== null ? `hoy ${currentW.toFixed(1)} kg` : "sin registro", big: true,
      detail: {
        title: "Peso · media de 7 días",
        sub: "La media suaviza el ruido diario de agua y glucógeno",
        rows: [
          { k: "Media 7 días", v: kg1(currentMA), strong: true },
          { k: "Último pesaje", v: kg1(currentW) },
          { k: "Cambio 7 días", v: change7 == null ? "—" : `${change7 > 0 ? "+" : ""}${kg1(change7)}` },
          ...(vsExpected ? [
            { k: "Esperado por tu objetivo", v: kg1(vsExpected.expected) },
            { k: "Diferencia", v: `${vsExpected.delta > 0 ? "+" : ""}${kg1(vsExpected.delta)}`, strong: true },
          ] : []),
          ...(goals.targetWeight ? [{ k: "Meta", v: kg1(Number(goals.targetWeight)) }] : []),
        ],
        note: vsExpected && vsExpected.ahead != null
          ? `Vas ${kg1(Math.abs(vsExpected.delta))} ${vsExpected.ahead ? "por delante de" : "por detrás de"} la recta que marca tu objetivo${vsExpected.projection ? `, y a este ritmo llegarías a la meta alrededor del ${fmtDate(vsExpected.projection)}` : ""}.`
          : "Con dos pesajes o más aparece la comparación contra la recta de tu objetivo.",
        source: "Media móvil de 7 días sobre tus pesajes. Un solo día pesa poco: por eso la cifra grande es la media y no la báscula de esta mañana.",
      } },
    { k: "Cambio 7 días", v: change7, dec: 1, u: "kg", sub: "tendencia real", signed: true,
      detail: {
        title: "Cambio en 7 días",
        sub: "Diferencia entre tu último pesaje y el más cercano a una semana antes",
        rows: [
          { k: "Diferencia", v: change7 == null ? "—" : `${change7 > 0 ? "+" : ""}${kg1(change7)}`, strong: true },
          { k: "Ritmo objetivo", v: `${Number(goals.weeklyChange).toFixed(2).replace(".", ",")} kg/sem` },
          ...(trend !== null ? [{ k: "Tendencia de 3 semanas", v: `${trend > 0 ? "+" : ""}${trend.toFixed(2).replace(".", ",")} kg/sem`, strong: true }] : []),
        ],
        note: "Siete días es poca ventana: cabe entera dentro de una fluctuación de agua, sal o fase del ciclo. La tendencia de tres semanas es la que decide, y es la que usa el aviso del Diario para proponer calorías.",
      } },
    { k: "Mantenimiento", v: maintenance ? maintenance.maint : null, dec: 0, u: "kcal", sub: maintenance ? `de ${maintenance.days} días` : "necesito ~2 sem.",
      detail: {
        title: "Mantenimiento estimado",
        sub: maintenance ? `Medido sobre ${maintenance.days} días con comida registrada` : "Hacen falta 10 días registrados",
        rows: maintenance ? [
          { k: "Ingesta media", v: kcal(maintenance.avgKcal), strong: true },
          { k: "Tendencia de peso", v: `${trend > 0 ? "+" : ""}${trend.toFixed(2).replace(".", ",")} kg/sem` },
          { k: "Equivalencia", v: `${kcal(Math.abs((trend / 7) * KCAL_PER_KG))}/día` },
          { k: "Mantenimiento", v: kcal(maintenance.maint), strong: true },
        ] : [],
        note: maintenance
          ? "Esto no es una fórmula por peso y actividad: es tu mantenimiento medido. Se toma lo que comes de media y se le suma o resta lo que tu peso dice que sobra o falta. Si no cuadra con la calculadora, manda esto."
          : "Se calcula con al menos 10 días de comida registrada y tres semanas de pesajes. Sin eso, cualquier número sería una fórmula genérica disfrazada.",
        source: "Conversión de 7700 kcal por kilo de peso corporal.",
      } },
    { k: "Constancia", v: trainingDays7, dec: 0, u: "/sem", sub: `${nutDays7} días dieta · ${avgMin} min/ses`,
      detail: {
        title: "Constancia de la última semana",
        rows: [
          { k: "Días con entreno", v: `${trainingDays7} de 7`, strong: true },
          { k: "Días con comida registrada", v: `${nutDays7} de 7` },
          { k: "Duración media", v: avgMin ? `${avgMin} min por sesión` : "sin duración anotada" },
          ...(compliance.adherence != null ? [{ k: "Adherencia al plan (8 sem.)", v: `${compliance.adherence}%`, strong: true }] : []),
        ],
        note: compliance.adherence != null
          ? `En las 8 semanas completas anteriores registraste ${compliance.done} de las ${compliance.planned} sesiones previstas. La semana en curso no cuenta aquí: contarla a medias solo haría bajar el número los lunes.`
          : "Asigna días a tus rutinas en Plan y aquí aparecerá también cuánto del plan estás cumpliendo.",
      } },
  ];
  const macroRows = macro14 ? [
    { label: "Proteína", avg: macro14.p, target: macroTargets.p, hero: true },
    { label: "Carbohidratos", avg: macro14.c, target: macroTargets.c },
    { label: "Grasa", avg: macro14.f, target: macroTargets.f },
  ] : [];
  const dateLabel = new Date().toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const selStyle = { fontFamily: A_MONO, fontSize: 11, color: A_INK, background: A_PANEL, border: "1px solid var(--line)", borderRadius: 7, padding: "6px 9px", cursor: "pointer" };

  // Las secciones del prototipo con su grupo: los chips filtran la cuadricula.
  // En escritorio la cuadricula va a dos columnas; en movil, a una.
  const groups = [["all", "TODO"], ["cuerpo", "CUERPO"], ["fuerza", "FUERZA"], ["nutricion", "NUTRICIÓN"]];
  const on = (group) => filter === "all" || filter === group;

  const cards = [
    on("cuerpo") && (
      <DCard key="peso" id="peso" span title="Peso y tendencia" meta="media 7 d vs objetivo · 12 sem">
        {vsExpected && <VsExpectedHead vs={vsExpected} />}
        {weightChart.length >= 2 ? (
          <>
            <BWeightChart data={weightChart.map((point) => ({ ...point, date: fmtDate(point.iso) }))} targetKey="objetivo" />
            <div style={{ display: "flex", gap: 16, paddingTop: 4 }}><DLegend color={A_ACC} label="Media 7d" /><DLegend color={A_INK2} label="Objetivo" dash /></div>
          </>
        ) : <DNeed>Registra tu peso al menos 2 días para ver la tendencia.</DNeed>}
      </DCard>
    ),

    on("nutricion") && (
      <DCard key="macros" id="macros" title="Macros · media 14 d vs objetivo" meta="carbo/grasa según frecuencia">
        {macro14 ? <BMacros rows={macroRows} footer={"media " + Math.round(macro14.k) + " / " + (goals.kcalTarget || "-") + " kcal"} /> : <DNeed>Registra comidas para ver tus macros.</DNeed>}
      </DCard>
    ),

    on("nutricion") && (
      <DCard key="kcal" title="Calorías diarias · 14 d" meta={kcalAvg ? "media " + kcalAvg + " kcal" : null}>
        {kcalChart.some((d) => d.kcal > 0) ? <BKcalBars data={kcalChart} target={Number(goals.kcalTarget) || null} /> : <DNeed>Registra comidas para ver tus calorías diarias.</DNeed>}
      </DCard>
    ),

    on("fuerza") && (
      <DCard key="fuerza" id="fuerza" title="Progresión de fuerza" meta="1RM est. · vs inicio">
        {trackable.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select className="ft-select" value={muscleFilter} onChange={(e) => { setMuscleFilter(e.target.value); setExFilter("all"); }} style={selStyle}>
              <option value="all">Todos los músculos</option>
              {muscleOptions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="ft-select" value={activeEx} onChange={(e) => setExFilter(e.target.value)} style={selStyle}>
              <option value="all">Todos los ejercicios</option>
              {exOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
        {strengthSeries.length > 0 ? (
          <>
            <BStrength series={strengthSeries} isMobile={isMobile} />
            {isMobile && <BStrengthLegend series={strengthSeries} />}
          </>
        ) : <DNeed>Necesitas al menos 2 sesiones de un mismo ejercicio.</DNeed>}
      </DCard>
    ),

    on("fuerza") && (
      <DCard key="volumen" id="volumen" title="Volumen muscular" meta={(Object.keys(weeklyMuscle).length ? "esta semana" : "histórico") + " · tonelaje + % ef."}>
        {muscleData.length > 0 ? <BMuscleBars data={muscleData} /> : <DNeed>Registra entrenamientos para ver el volumen por grupo.</DNeed>}
      </DCard>
    ),

    on("fuerza") && rpeSeries.length >= 2 && (
      <DCard key="rpe" id="rpe" title="Esfuerzo · RPE" meta={rpeSeries.length + " sesiones · ahora " + rpeSeries[rpeSeries.length - 1].rpe.toFixed(1)}>
        <BWeightChart data={rpeSeries.map((point) => ({ ...point, date: fmtDate(point.iso) }))} valueKey="rpe" valueLabel="RPE medio" unit="RPE" />
      </DCard>
    ),

    on("fuerza") && (
      <DCard key="records" id="records" title="Récords" meta="1RM estimado">
        {prs.length > 0 ? prs.slice(0, 6).map((p, i) => (
          <div key={p.name} style={{ display: "grid", gridTemplateColumns: "22px 1fr auto", alignItems: "baseline", gap: 10, padding: "9px 0", borderBottom: i < Math.min(prs.length, 6) - 1 ? "1px solid var(--hair)" : "none" }}>
            <span style={{ fontFamily: A_MONO, fontSize: 10.5, color: A_INK2 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 7 }}>
              {p.name}
              {p.isRecent && <span style={{ fontFamily: A_MONO, fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", background: "color-mix(in srgb,var(--ok) 18%,transparent)", color: "var(--ok)", padding: "2px 6px", borderRadius: 4 }}>nuevo</span>}
            </span>
            <span style={{ fontFamily: A_DISP, fontWeight: 700, fontSize: 19, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>{p.best}<span style={{ fontSize: 11, fontFamily: A_MONO, fontWeight: 500, color: A_INK2, marginLeft: 3 }}>kg</span></span>
          </div>
        )) : <DNeed>Registra entrenamientos con peso y reps para ver tus 1RM estimados.</DNeed>}
      </DCard>
    ),

    on("cuerpo") && measLatest && (
      <DCard key="medidas" title="Medidas" meta={"última " + fmtDate(measLatest.date)}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(" + (isMobile ? 3 : 5) + ", 1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
          {MEAS_FIELDS.filter(([k]) => measLatest[k] != null).map(([k, label]) => {
            const d = measDelta(k);
            return (
              <div key={k} style={{ background: A_PANEL, padding: "11px 12px" }}>
                <span style={{ fontFamily: A_MONO, fontSize: 9, letterSpacing: ".14em", color: A_INK2 }}>{label.toUpperCase()}</span>
                <div style={{ fontFamily: A_DISP, fontWeight: 700, fontSize: 21, letterSpacing: "-0.03em", marginTop: 6 }}>{measLatest[k]}<span style={{ fontSize: 11, fontFamily: A_MONO, fontWeight: 500, color: A_INK2, marginLeft: 3 }}>cm</span></div>
                {d != null && <div style={{ fontFamily: A_MONO, fontSize: 10, marginTop: 4, color: d <= 0 ? A_OK : A_INK2 }}>{d > 0 ? "+" : ""}{d.toFixed(1)} cm</div>}
              </div>
            );
          })}
        </div>
      </DCard>
    ),

    on("fuerza") && (
      <DCard key="constancia" id="constancia" span title="Constancia" meta={"racha " + heat.streak + " d · " + heat.total + " sesiones · mejor semana " + heat.bestWeek}>
        <BHeatmap days={heat.days} isMobile={isMobile} />
        {compliance.adherence != null && (
          <div className="ft-dc-foot">
            <span className={compliance.adherence >= 80 ? "ft-dc-tag" : "ft-dc-tag late"}>{compliance.adherence}% DEL PLAN</span>
            <span style={{ flex: 1 }}>
              {compliance.done} de {compliance.planned} sesiones previstas en las 8 semanas completas anteriores
              {compliance.full ? ` · ${compliance.full} con el plan entero` : ""}
            </span>
          </div>
        )}
      </DCard>
    ),

    on("cuerpo") && projection && !projection.off && (
      <DCard key="proyeccion" id="proyeccion" title="Proyección a tu meta">
        <div style={{ fontSize: 13, lineHeight: 1.5, color: A_INK2 }}>
          A tu ritmo actual llegarías a <b style={{ color: A_INK }}>{goals.targetWeight} kg</b> alrededor del <b style={{ color: A_INK }}>{projection.date}</b> (~{Math.abs(projection.weeks)} semanas).
        </div>
      </DCard>
    ),

    on("cuerpo") && tracksCycle(goals) && cyc && (
      <DCard key="ciclo" id="ciclo" title={"Ciclo en curso · " + cyc.phase} meta={cyc.daysToNext >= 0 ? "próximo en ~" + cyc.daysToNext + " d" : Math.abs(cyc.daysToNext) + " d de retraso"}>
        <span className="ft-dc-big">{cyc.day}<small>día de ~{cyc.avgCycle} d</small></span>
        {cyc.segments.length > 0 && <BCycleStrip segments={cyc.segments} />}
        <BRows rows={[
          { k: "Empezó", v: fmtDate(cyc.start), strong: true },
          { k: "Sangrado registrado", v: cyc.bleedDays ? `${cyc.bleedDays} día${cyc.bleedDays === 1 ? "" : "s"}` : "sin registrar" },
          ...(cyc.ovulation?.date ? [{ k: "Ovulación estimada", v: `${fmtDate(cyc.ovulation.date)} · día ${cyc.ovulation.cycleDay}` }] : []),
          { k: "Días con síntomas altos", v: cyc.symptomDays ? `${cyc.symptomDays} de ${cyc.logged} anotados` : `0 de ${cyc.logged} anotados` },
          { k: "Próximo periodo", v: cyc.nextPeriod ? fmtDate(cyc.nextPeriod) : "sin estimar", strong: true },
        ]} />
        <div style={{ display: "flex", gap: 11 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: CYCLE_PHASES[cyc.phase].color, marginTop: 5, flexShrink: 0 }} />
          <span style={{ fontSize: 13, lineHeight: 1.5, color: A_INK2 }}>{CYCLE_PHASES[cyc.phase].note}</span>
        </div>
        <div className="ft-dc-foot">
          <span style={{ flex: 1 }}>
            {cyc.samples ? `Media sobre ${cyc.samples} ciclo${cyc.samples === 1 ? "" : "s"} completo${cyc.samples === 1 ? "" : "s"}.` : "Aún sin ciclos completos: la duración media es la de referencia (28 d)."} El historial completo está en Cuerpo.
          </span>
        </div>
      </DCard>
    ),

    on("cuerpo") && (
      <DCard key="sueno" title="Sueño" meta={sleep ? `media 14 d ${sleep.avg14.toFixed(1).replace(".", ",")} h` : null}>
        {sleep ? (
          <>
            <span className="ft-dc-big">{(sleep.avg7 ?? sleep.avg14).toFixed(1).replace(".", ",")}<small>h · media 7 d</small></span>
            <BWeightChart data={sleep.series.map((point) => ({ ...point, date: fmtDate(point.iso) }))} valueKey="sueno" valueLabel="Horas" unit="h" />
            <BRows rows={[
              { k: "Noches anotadas (14 d)", v: `${sleep.nights} de 14`, strong: true },
              { k: "Rango", v: `${sleep.worst.toFixed(1).replace(".", ",")} – ${sleep.best.toFixed(1).replace(".", ",")} h` },
              { k: "Noches por debajo de 6 h", v: `${sleep.short}`, strong: sleep.short > 0 },
            ]} />
            {sleep.short > 0 && (
              <div className="ft-dc-foot"><span style={{ flex: 1 }}>
                Por debajo de 6 h la recuperación entre sesiones se resiente antes que el rendimiento del día: si además el RPE sube a igual carga, mira ahí primero y no a la programación.
              </span></div>
            )}
          </>
        ) : <DNeed>Anota las horas de sueño en el check-in diario de Cuerpo y aquí verás la media y las noches cortas.</DNeed>}
      </DCard>
    ),

    on("cuerpo") && (
      <DCard key="pulso" title="Ritmo cardíaco en reposo" meta={hr ? `${hr.days} día${hr.days === 1 ? "" : "s"} anotados` : null}>
        {hr && hr.series.length >= 2 ? (
          <>
            <span className="ft-dc-big">{Math.round(hr.avg7 ?? hr.last)}<small>ppm · media 7 d</small></span>
            <BWeightChart data={hr.series.map((point) => ({ ...point, date: fmtDate(point.iso) }))} valueKey="pulso" valueLabel="Pulso" unit="ppm" />
            <BRows rows={[
              { k: "Último", v: `${hr.last} ppm · ${fmtDate(hr.lastDate)}`, strong: true },
              ...(hr.base ? [
                { k: "Tu línea base (28 d previos)", v: `${Math.round(hr.base)} ppm` },
                { k: "Diferencia", v: `${hr.avg7 - hr.base > 0 ? "+" : ""}${(hr.avg7 - hr.base).toFixed(1).replace(".", ",")} ppm`, strong: true },
              ] : [{ k: "Línea base", v: "faltan días para calcularla" }]),
            ]} />
            {hr.base && hr.avg7 - hr.base >= 5 && (
              <div className="ft-dc-foot"><span style={{ flex: 1 }}>
                Cinco pulsaciones por encima de tu línea base mantenidas una semana suelen ir con fatiga acumulada, falta de sueño o algo incubándose. Es una señal para descargar, no para apretar.
              </span></div>
            )}
          </>
        ) : <DNeed>Anota tu pulso en reposo en el check-in diario de Cuerpo (nada más despertar, antes de levantarte). Con una semana de datos aparece tu línea base.</DNeed>}
      </DCard>
    ),

    on("fuerza") && (
      <DCard key="movimiento" title="Movimiento" meta={movement ? `${movement.days} día${movement.days === 1 ? "" : "s"} · 4 sem` : null}>
        {movement ? (
          <>
            <span className="ft-dc-big">{movement.weekMin}<small>min esta semana</small></span>
            <BRows rows={[
              ...movement.rows.map((row) => ({ k: row.type.toUpperCase(), v: `${row.min} min · ${row.n} ses.${row.kcal ? ` · ${Math.round(row.kcal).toLocaleString("es-ES")} kcal` : ""}` })),
              { k: "Total 4 semanas", v: `${movement.totalMin} min`, strong: true },
            ]} />
          </>
        ) : <DNeed>El cardio que registres en Entrenar (tipo, minutos y kcal) se resume aquí. Es también donde entra lo que traigas de un reloj o de Strava.</DNeed>}
      </DCard>
    ),
  ].filter(Boolean);

  return (
    <div className="ft-dc">
      <div className="ft-dc-head">
        <div>
          <h1>Métricas</h1>
          <span className="sub">{cards.length} secciones · {dateLabel}</span>
        </div>
      </div>

      <div className="ft-dc-strip" style={{ "--cols": isMobile ? 2 : 4 }}>
        {kpis.map((kpi, i) => (
          <button key={kpi.k} className="ft-kpi" onClick={() => setOpenKpi(kpi.k)} aria-label={`Ver de dónde sale ${kpi.k}`}>
            <span className="k">{kpi.k.toUpperCase()}<span className="why">?</span></span>
            <span className="v" style={kpi.signed ? { color: kpi.v <= 0 ? A_OK : "var(--attn)" } : undefined}>
              {kpi.v === null ? "\u2014" : <>{kpi.signed && kpi.v > 0 ? "+" : ""}<CountUp value={kpi.v} decimals={kpi.dec} delay={200 + i * 80} /></>}
              <small>{kpi.u}</small>
            </span>
            <span className="d">{kpi.sub}</span>
          </button>
        ))}
      </div>

      {openKpi && (() => {
        const kpi = kpis.find((x) => x.k === openKpi);
        return kpi?.detail ? <DetailSheet kicker="De dónde sale" {...kpi.detail} onClose={() => setOpenKpi(null)} /> : null;
      })()}

      <div className="ft-dc-chips">
        {groups.map(([key, label]) => (
          <button key={key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>

      <div className="ft-dc-grid">{cards}</div>
    </div>
  );
}
