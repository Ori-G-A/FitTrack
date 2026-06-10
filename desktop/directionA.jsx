/* ============================================================
   DIRECTION A — EDITORIAL BRUTALIST
   Bone paper · ink · tangerine · exposed hairline grid ·
   oversized tabular numerals · mono kickers. Data-as-art.
   ============================================================ */
const A = {
  paper: "#f3efe6",
  panel: "#f8f5ee",
  ink: "#16140d",
  ink2: "#6a655a",
  line: "rgba(22,20,13,0.16)",
  hair: "rgba(22,20,13,0.10)",
  acc: "#e7531c",       // tangerine — oklch(.64 .19 41)
  accDim: "rgba(231,83,28,0.12)",
  ok: "#3f7d4e",
  disp: "'Archivo', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

function KickerA({ children, color }) {
  return (
    <div style={{
      fontFamily: A.mono, fontSize: 11, letterSpacing: ".18em",
      textTransform: "uppercase", color: color || A.ink2, fontWeight: 500,
    }}>{children}</div>
  );
}

/* big editorial weight chart */
function WeightChartA({ t }) {
  const show = useReveal(260);
  const s = FT.weightSeries;
  const W = 720, H = 230, padT = 22, padB = 28;
  const avgs = s.map((d) => d.avg), tgts = s.map((d) => d.target);
  const lo = Math.min(...avgs, ...tgts) - 0.5;
  const hi = Math.max(...avgs, ...tgts) + 0.5;
  const ptsAvg = toPoints(avgs, { w: W, h: H, pad: 0, min: lo, max: hi })
    .map((p) => ({ ...p, y: padT + (p.y / H) * (H - padT - padB) }));
  const ptsTgt = toPoints(tgts, { w: W, h: H, pad: 0, min: lo, max: hi })
    .map((p) => ({ ...p, y: padT + (p.y / H) * (H - padT - padB) }));
  const dAvg = smoothPath(ptsAvg, 0.6);
  const dTgt = smoothPath(ptsTgt, 0.6);
  const last = ptsAvg[ptsAvg.length - 1];
  const gridY = [hi, (hi + lo) / 2, lo];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      {gridY.map((g, i) => {
        const y = padT + ((hi - g) / (hi - lo)) * (H - padT - padB);
        return (
          <g key={i}>
            <line x1="0" y1={y} x2={W} y2={y} stroke={A.hair} strokeWidth="1" />
            <text x="0" y={y - 5} fontFamily={A.mono} fontSize="10" fill={A.ink2}>{g.toFixed(1)}</text>
          </g>
        );
      })}
      {/* target ghost */}
      <DrawLine d={dTgt} color={A.ink2} width="1.5" reveal={show} dash="2 5" opacity={0.55} delay={120} />
      {/* avg ink line */}
      <DrawLine d={dAvg} color={A.acc} width="3" reveal={show} dur={1600} delay={200} />
      {/* end marker */}
      <circle cx={last.x} cy={last.y} r={show ? 5 : 0} fill={A.acc}
        style={{ transition: "r .4s ease 1.7s" }} />
      <circle cx={last.x} cy={last.y} r="5" fill="none" stroke={A.acc} strokeWidth="1.5"
        opacity={show ? 1 : 0} style={{ transition: "opacity .3s 1.7s" }}>
        <animate attributeName="r" values="5;13;5" dur="2.4s" begin="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0;0.9" dur="2.4s" begin="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* calories columns */
function KcalBarsA({ t }) {
  const show = useReveal(420);
  const data = FT.kcalSeries;
  const max = Math.max(...data.map((d) => d.kcal)) * 1.08;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 150, position: "relative" }}>
      <div style={{
        position: "absolute", left: 0, right: 0,
        bottom: `${(FT.kcalTarget / max) * 100}%`,
        borderTop: `1.5px dashed ${A.ink}`, opacity: 0.5,
      }}>
        <span style={{ position: "absolute", right: 0, top: -16, fontFamily: A.mono, fontSize: 10, color: A.ink2 }}>
          {t.targetLabel} {FT.kcalTarget}
        </span>
      </div>
      {data.map((d, i) => {
        const over = d.kcal > FT.kcalTarget;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
            <div style={{
              height: show ? `${(d.kcal / max) * 100}%` : "0%",
              background: over ? A.acc : A.ink,
              transition: `height .8s cubic-bezier(.22,.61,.36,1) ${i * 45}ms`,
            }} />
          </div>
        );
      })}
    </div>
  );
}

/* muscle volume horizontal bars */
function MuscleBarsA({ t, lang }) {
  const show = useReveal(520);
  const data = FT.muscleVolume;
  const max = Math.max(...data.map((d) => d.vol));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {data.map((d, i) => (
        <div key={d.key} style={{ display: "grid", gridTemplateColumns: "92px 1fr 54px", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: A.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", color: A.ink2 }}>
            {t.muscles[d.key]}
          </div>
          <div style={{ height: 14, background: A.hair, position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", inset: 0, transformOrigin: "left",
              width: `${(d.vol / max) * 100}%`,
              background: i === 0 ? A.acc : A.ink,
              transform: show ? "scaleX(1)" : "scaleX(0)",
              transition: `transform .9s cubic-bezier(.22,.61,.36,1) ${i * 60}ms`,
            }} />
          </div>
          <div style={{ fontFamily: A.mono, fontSize: 11, textAlign: "right", color: A.ink, fontWeight: 500 }}>
            {(d.vol / 1000).toFixed(1)}t
          </div>
        </div>
      ))}
    </div>
  );
}

/* strength progression — 4 lifts, % gain vs block start, est. 1RM */
function StrengthChartA({ t }) {
  const show = useReveal(400);
  const W = 720, H = 200, padT = 16, padB = 22, plotW = 575, labelX = 588;
  const lifts = [
    { key: "deadlift", color: A.acc, w: 3 },
    { key: "squat", color: A.ink, w: 2.25 },
    { key: "bench", color: "rgba(22,20,13,0.45)", w: 2.25 },
    { key: "ohp", color: A.ok, w: 2.25 },
  ];
  const series = lifts.map((l) => {
    const s = FT.strength[l.key];
    return { ...l, pct: s.map((v) => (v / s[0] - 1) * 100), lastKg: s[s.length - 1] };
  });
  const hi = Math.max(...series.flatMap((s) => s.pct)) * 1.1;
  const yOf = (v) => padT + ((hi - v) / hi) * (H - padT - padB);
  const grid = [hi, hi / 2, 0];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      {grid.map((g, i) => (
        <g key={i}>
          <line x1="0" y1={yOf(g)} x2={plotW} y2={yOf(g)} stroke={A.hair} strokeWidth="1" />
          <text x="0" y={yOf(g) - 5} fontFamily={A.mono} fontSize="10" fill={A.ink2}>+{g.toFixed(0)}%</text>
        </g>
      ))}
      {series.map((s, si) => {
        const pts = s.pct.map((v, i) => ({ x: (i / (s.pct.length - 1)) * plotW, y: yOf(v) }));
        const d = smoothPath(pts, 0.6);
        const last = pts[pts.length - 1];
        return (
          <g key={s.key}>
            <DrawLine d={d} color={s.color} width={s.w} reveal={show} dur={1400} delay={150 + si * 130} />
            <circle cx={last.x} cy={last.y} r={show ? 4 : 0} fill={s.color}
              style={{ transition: `r .4s ease ${1.2 + si * 0.13}s` }} />
            <text x={labelX} y={last.y + 3.5} fontFamily={A.mono} fontSize="11" fill={A.ink2}
              opacity={show ? 1 : 0} style={{ transition: `opacity .4s ease ${1.3 + si * 0.13}s` }}>
              {t.liftShort[s.key].toUpperCase()} <tspan fill={A.ink} fontWeight="600">{s.lastKg} kg</tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* macro targets — actual vs target bars, 14-day averages */
function MacrosA({ t }) {
  const show = useReveal(540);
  const rows = [
    { label: t.proteinLabel, d: FT.macros.protein, hero: true },
    { label: t.carbsLabel, d: FT.macros.carbs },
    { label: t.fatLabel, d: FT.macros.fat },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
      {rows.map((r, i) => {
        const max = r.d.target * 1.15;
        const fillPct = Math.min(1, r.d.avg / max) * 100;
        const tickPct = (r.d.target / max) * 100;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
              <KickerA>{r.label}</KickerA>
              <div style={{ fontFamily: A.mono, fontSize: 12, color: A.ink, fontVariantNumeric: "tabular-nums" }}>
                <span style={{ fontWeight: 600 }}>{r.d.avg}</span>
                <span style={{ color: A.ink2 }}> / {r.d.target} g</span>
              </div>
            </div>
            <div style={{ height: 14, background: A.hair, position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: 0, transformOrigin: "left",
                width: `${fillPct}%`, background: r.hero ? A.acc : A.ink,
                transform: show ? "scaleX(1)" : "scaleX(0)",
                transition: `transform .9s cubic-bezier(.22,.61,.36,1) ${i * 90}ms`,
              }}></div>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${tickPct}%`, width: 2, background: A.ink, opacity: 0.85 }}></div>
            </div>
          </div>
        );
      })}
      <div style={{ fontFamily: A.mono, fontSize: 11, color: A.ink2, textTransform: "uppercase", letterSpacing: ".06em", paddingTop: 10, borderTop: `1px solid ${A.hair}` }}>
        {t.kcalLine(FT.kcalAvg, FT.kcalTarget)}
      </div>
    </div>
  );
}

/* GitHub-style consistency tiling — 26 weeks, Mon-first columns */
function HeatmapA({ t }) {
  const show = useReveal(640);
  const cols = [];
  FT.heatmap.forEach((d) => {
    if (d.dw === 0 || cols.length === 0) cols.push([]);
    cols[cols.length - 1].push(d);
  });
  const CELL = 22, GAP = 4;
  const ramp = ["rgba(22,20,13,0.07)", "rgba(231,83,28,0.26)", "rgba(231,83,28,0.5)", "rgba(231,83,28,0.74)", "#e7531c"];
  let prevM = -1;
  const monthLabels = cols.map((col) => {
    const m = parseInt(col[0].iso.slice(5, 7), 10) - 1;
    const lbl = m !== prevM ? t.monthsShort[m] : null;
    prevM = m;
    return lbl;
  });
  const dayRows = [0, 2, 4, 6];
  return (
    <div>
      {/* month labels */}
      <div style={{ display: "flex", gap: GAP, marginLeft: 26 + GAP, marginBottom: 7 }}>
        {monthLabels.map((m, i) => (
          <div key={i} style={{ width: CELL, flexShrink: 0, fontFamily: A.mono, fontSize: 10, color: A.ink2, textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap", overflow: "visible" }}>{m || ""}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: GAP }}>
        {/* day-of-week labels */}
        <div style={{ width: 26, display: "flex", flexDirection: "column", gap: GAP }}>
          {Array.from({ length: 7 }, (_, r) => (
            <div key={r} style={{ height: CELL, display: "flex", alignItems: "center", fontFamily: A.mono, fontSize: 10, color: A.ink2 }}>
              {dayRows.indexOf(r) >= 0 ? t.days[r] : ""}
            </div>
          ))}
        </div>
        {cols.map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
            {Array.from({ length: 7 }, (_, r) => {
              const d = col.find((x) => x.dw === r);
              if (!d) return <div key={r} style={{ width: CELL, height: CELL }}></div>;
              return (
                <div key={r} title={`${d.iso} · ${d.lvl > 0 ? t.trained : t.rest}`} style={{
                  width: CELL, height: CELL, background: ramp[d.lvl],
                  opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.5)",
                  transition: `opacity .45s ease ${ci * 16}ms, transform .45s cubic-bezier(.22,.61,.36,1) ${ci * 16}ms`,
                }}></div>
              );
            })}
          </div>
        ))}
      </div>
      {/* legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 14, marginLeft: 26 + GAP, fontFamily: A.mono, fontSize: 10, color: A.ink2, textTransform: "uppercase", letterSpacing: ".06em" }}>
        <span style={{ marginRight: 4 }}>{t.less}</span>
        {ramp.map((c, i) => <div key={i} style={{ width: 12, height: 12, background: c }}></div>)}
        <span style={{ marginLeft: 4 }}>{t.more}</span>
      </div>
    </div>
  );
}

function DashboardA({ lang, setLang }) {
  const t = I18N[lang];
  const show = useReveal(60);
  const stats = [
    { k: t.weightAvg, v: FT.currentAvg, dec: 1, u: "kg", sub: `${t.today} ${FT.currentToday} kg`, big: true },
    { k: t.change7, v: FT.change7, dec: 1, u: "kg", sub: t.trendReal, signed: true, good: true },
    { k: t.maintenance, v: FT.maintenance, dec: 0, u: "kcal", sub: t.ofData(28) },
    { k: t.consistency, v: FT.trainingDays7, dec: 0, u: t.perWeek, sub: `${t.dietDays(FT.nutDays7)} · ${FT.avgMin} ${t.perSession}` },
  ];

  return (
    <div style={{ width: "100%", height: "100%", background: A.paper, color: A.ink, fontFamily: A.disp, position: "relative", overflow: "hidden" }}>
      {/* masthead */}
      <div style={{ padding: "30px 44px 0" }}>
        <Rise show={show} i={0}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <div style={{ fontFamily: A.mono, fontSize: 11, letterSpacing: ".2em", color: A.ink2, paddingTop: 6 }}>
                FITTRACK&nbsp;—&nbsp;N°01
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ fontFamily: A.mono, fontSize: 11, letterSpacing: ".12em", color: A.ink2 }}>
                {lang === "es" ? "LUN 09 JUN 2026" : "MON 09 JUN 2026"}
              </div>
              <LangSwitch lang={lang} setLang={setLang} bg="transparent" fg={A.ink2} active={A.ink} activeFg={A.paper} border={A.line} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 10, borderBottom: `2px solid ${A.ink}`, paddingBottom: 14 }}>
            <h1 style={{ margin: 0, fontFamily: A.disp, fontWeight: 900, fontSize: 104, lineHeight: 0.82, letterSpacing: "-0.05em", textTransform: "uppercase" }}>
              {t.overview}
            </h1>
            <div style={{ textAlign: "right", maxWidth: 280, fontFamily: A.mono, fontSize: 11.5, lineHeight: 1.5, color: A.ink2, paddingBottom: 6 }}>
              {lang === "es"
                ? "Cuerpo · Fuerza · Nutrición. Una sola vista de tu progreso real."
                : "Body · Strength · Nutrition. One honest view of your real progress."}
            </div>
          </div>
        </Rise>
      </div>

      {/* KPI strip */}
      <Rise show={show} i={1}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1px solid ${A.line}` }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: "22px 28px 24px", borderLeft: i ? `1px solid ${A.line}` : "none",
              borderRight: i === stats.length - 1 ? `1px solid ${A.line}` : "none",
            }}>
              <KickerA>{s.k}</KickerA>
              <div style={{
                fontFamily: A.disp, fontWeight: 800, fontSize: s.big ? 72 : 60, lineHeight: 0.95,
                letterSpacing: "-0.04em", marginTop: 12, fontVariantNumeric: "tabular-nums",
                color: s.signed ? (s.v <= 0 ? A.ok : A.acc) : A.ink,
              }}>
                {s.signed && s.v > 0 ? "+" : ""}
                <CountUp value={s.v} decimals={s.dec} delay={300 + i * 90} />
                <span style={{ fontSize: 22, fontFamily: A.mono, fontWeight: 500, marginLeft: 6, letterSpacing: 0, color: A.ink2 }}>{s.u}</span>
              </div>
              <div style={{ fontFamily: A.mono, fontSize: 11, color: A.ink2, marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </Rise>

      {/* row: weight chart (left) + records (right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.85fr 1fr", borderBottom: `1px solid ${A.line}` }}>
        <Rise show={show} i={2} style={{ borderRight: `1px solid ${A.line}` }}>
          <div style={{ padding: "22px 28px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontFamily: A.disp, fontWeight: 800, fontSize: 26, textTransform: "uppercase", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{t.weightTrend}</h2>
              <div style={{ display: "flex", gap: 18 }}>
                <Legend color={A.acc} label={`${t.average} 7d`} mono={A.mono} ink={A.ink2} />
                <Legend color={A.ink2} label={t.target} dash mono={A.mono} ink={A.ink2} />
              </div>
            </div>
            <WeightChartA t={t} />
            <div style={{ fontFamily: A.mono, fontSize: 11, color: A.ink2, marginTop: 8 }}>{t.last8wk.toUpperCase()}</div>
          </div>
        </Rise>
        <Rise show={show} i={3}>
          <div style={{ padding: "22px 28px 24px" }}>
            <h2 style={{ margin: "0 0 16px", fontFamily: A.disp, fontWeight: 800, fontSize: 26, textTransform: "uppercase", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{t.records}</h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {FT.prs.slice(0, 6).map((p, i) => (
                <div key={p.key} style={{
                  display: "grid", gridTemplateColumns: "20px 1fr auto", alignItems: "baseline", gap: 10,
                  padding: "9px 0", borderBottom: i < 5 ? `1px solid ${A.hair}` : "none",
                }}>
                  <span style={{ fontFamily: A.mono, fontSize: 11, color: A.ink2 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                    {t.exercises[p.key]}
                    {p.recent && <span style={{ fontFamily: A.mono, fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", background: A.acc, color: A.paper, padding: "2px 5px" }}>{t.newPR}</span>}
                  </span>
                  <span style={{ fontFamily: A.disp, fontWeight: 800, fontSize: 24, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>
                    {p.kg}<span style={{ fontSize: 12, fontFamily: A.mono, fontWeight: 500, color: A.ink2, marginLeft: 3 }}>kg</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Rise>
      </div>

      {/* row: strength progression (left) + macros (right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.85fr 1fr", borderBottom: `1px solid ${A.line}` }}>
        <Rise show={show} i={4} style={{ borderRight: `1px solid ${A.line}` }}>
          <div style={{ padding: "22px 28px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontFamily: A.disp, fontWeight: 800, fontSize: 26, textTransform: "uppercase", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{t.strengthProg}</h2>
              <span style={{ fontFamily: A.mono, fontSize: 11, color: A.ink2 }}>{`${t.est1rm} · ${t.vsStart}`.toUpperCase()}</span>
            </div>
            <StrengthChartA t={t} />
            <div style={{ fontFamily: A.mono, fontSize: 11, color: A.ink2, marginTop: 8 }}>{t.last8wk.toUpperCase()}</div>
          </div>
        </Rise>
        <Rise show={show} i={5}>
          <div style={{ padding: "22px 28px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontFamily: A.disp, fontWeight: 800, fontSize: 26, textTransform: "uppercase", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{t.macrosTitle}</h2>
              <span style={{ fontFamily: A.mono, fontSize: 11, color: A.ink2 }}>{t.avg14.toUpperCase()}</span>
            </div>
            <MacrosA t={t} />
          </div>
        </Rise>
      </div>

      {/* row: calories (left) + muscle volume (right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr" }}>
        <Rise show={show} i={6} style={{ borderRight: `1px solid ${A.line}` }}>
          <div style={{ padding: "22px 28px 26px" }}>
            <h2 style={{ margin: "0 0 18px", fontFamily: A.disp, fontWeight: 800, fontSize: 26, textTransform: "uppercase", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{t.calories}</h2>
            <KcalBarsA t={t} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: A.mono, fontSize: 11, color: A.ink2, marginTop: 10 }}>
              <span>{t.last14d.toUpperCase()}</span>
              <span>{t.average.toUpperCase()} {FT.kcalAvg} KCAL</span>
            </div>
          </div>
        </Rise>
        <Rise show={show} i={7}>
          <div style={{ padding: "22px 28px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontFamily: A.disp, fontWeight: 800, fontSize: 24, textTransform: "uppercase", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{t.muscleVol}</h2>
              <span style={{ fontFamily: A.mono, fontSize: 11, color: A.ink2 }}>{t.thisWeek.toUpperCase()}</span>
            </div>
            <MuscleBarsA t={t} lang={lang} />
          </div>
        </Rise>
      </div>

      {/* row: consistency tiling (left) + streak stats (right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.85fr 1fr", borderTop: `1px solid ${A.line}` }}>
        <Rise show={show} i={8} style={{ borderRight: `1px solid ${A.line}` }}>
          <div style={{ padding: "22px 28px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontFamily: A.disp, fontWeight: 800, fontSize: 26, textTransform: "uppercase", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{t.consistency}</h2>
              <span style={{ fontFamily: A.mono, fontSize: 11, color: A.ink2 }}>{t.last26wk.toUpperCase()}</span>
            </div>
            <HeatmapA t={t} />
          </div>
        </Rise>
        <Rise show={show} i={9}>
          <div style={{ padding: "22px 28px 24px" }}>
            <h2 style={{ margin: "0 0 14px", fontFamily: A.disp, fontWeight: 800, fontSize: 26, textTransform: "uppercase", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{t.streakTitle}</h2>
            <div style={{ fontFamily: A.disp, fontWeight: 800, fontSize: 72, lineHeight: 0.95, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", color: A.acc }}>
              <CountUp value={FT.streak} delay={700} />
              <span style={{ fontSize: 16, fontFamily: A.mono, fontWeight: 500, marginLeft: 8, letterSpacing: ".04em", color: A.ink2, textTransform: "uppercase" }}>{t.streakLabel}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
              {[t.heatSessions(FT.heatStats.total), t.heatWeeksOn(FT.heatStats.weeksOn, FT.heatStats.weeksTotal), t.bestWeekLabel(FT.heatStats.bestWeek)].map((line, i) => (
                <div key={i} style={{
                  fontFamily: A.mono, fontSize: 12, color: A.ink, padding: "10px 0",
                  borderBottom: i < 2 ? `1px solid ${A.hair}` : "none",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ width: 8, height: 8, background: i === 0 ? A.acc : A.ink2, flexShrink: 0 }}></span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </Rise>
      </div>

      {/* footer notes: projection + cycle */}
      <Rise show={show} i={10}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `2px solid ${A.ink}` }}>
          <div style={{ padding: "18px 28px", borderRight: `1px solid ${A.line}`, display: "flex", gap: 14 }}>
            <div style={{ fontFamily: A.disp, fontWeight: 900, fontSize: 30, color: A.acc, lineHeight: 1 }}>→</div>
            <div>
              <KickerA color={A.acc}>{t.projection}</KickerA>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 6, color: A.ink, maxWidth: 460 }}>
                {t.projectionBody(FT.profile.goalKg, lang === "es" ? FT.projection.dateES : FT.projection.dateEN, FT.projection.weeks)}
              </div>
            </div>
          </div>
          <div style={{ padding: "18px 28px", display: "flex", gap: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: A.ok, marginTop: 6, flexShrink: 0 }} />
            <div>
              <KickerA>{t.cycle(t.phases[FT.cycle.phaseKey], FT.cycle.day)}</KickerA>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 6, color: A.ink2, maxWidth: 460 }}>
                {t.cycleBody(FT.cycle.daysToNext)}
              </div>
            </div>
          </div>
        </div>
      </Rise>
    </div>
  );
}

function Legend({ color, label, dash, mono, ink }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke={color} strokeWidth="2.5" strokeDasharray={dash ? "2 3" : "0"} /></svg>
      <span style={{ fontFamily: mono, fontSize: 10.5, color: ink, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
    </div>
  );
}

window.DashboardA = DashboardA;
