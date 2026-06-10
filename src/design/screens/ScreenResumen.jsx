import { useState } from "react";
import { useReveal, smoothPath, toPoints, DrawLine, Rise } from "../shared.jsx";
import { M, Kicker, BigNum, MacroBar, TopBar, ScreenScroll, Icon } from "../kit.jsx";
import { MAlertBand } from "../insight.jsx";
import { FT } from "../data.js";
import { LangSwitch } from "../shared.jsx";

function nextRoutineId(appData) {
  const order = ["push", "pull", "legs"];
  const last = appData.history[0] && appData.history[0].routine;
  const i = order.indexOf(last);
  return order[(i + 1) % order.length];
}

function MiniWeightChart() {
  const show = useReveal(220);
  const s = FT.weightSeries.slice(-28);
  const W = 320, H = 96;
  const avgs = s.map((d) => d.avg), tgts = s.map((d) => d.target);
  const lo = Math.min(...avgs, ...tgts) - 0.3, hi = Math.max(...avgs, ...tgts) + 0.3;
  const pa = toPoints(avgs, { w: W, h: H, pad: 8, min: lo, max: hi });
  const pt = toPoints(tgts, { w: W, h: H, pad: 8, min: lo, max: hi });
  const last = pa[pa.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      <DrawLine d={smoothPath(pt, 0.6)} color={M.ink2} width="1.4" reveal={show} dash="2 5" opacity={0.5} delay={80} />
      <DrawLine d={smoothPath(pa, 0.6)} color={M.acc} width="2.6" reveal={show} dur={1500} delay={160} />
      <circle cx={last.x} cy={last.y} r={show ? 4 : 0} fill={M.acc} style={{ transition: "r .4s ease 1.5s" }} />
    </svg>
  );
}

function MiniHeat({ t }) {
  const show = useReveal(360);
  const data = FT.heatmap.slice(-13 * 7);
  const cols = [];
  data.forEach((d) => { if (d.dw === 0 || cols.length === 0) cols.push([]); cols[cols.length - 1].push(d); });
  const ramp = ["rgba(22,20,13,0.07)","rgba(231,83,28,0.3)","rgba(231,83,28,0.55)","rgba(231,83,28,0.78)","#e7531c"];
  const CELL = 13, GAP = 3;
  return (
    <div style={{ display: "flex", gap: GAP }}>
      {cols.map((col, ci) => (
        <div key={ci} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          {Array.from({ length: 7 }, (_, r) => {
            const d = col.find((x) => x.dw === r);
            return <div key={r} style={{ width: CELL, height: CELL, background: d ? ramp[d.lvl] : "transparent", opacity: show ? 1 : 0, transition: `opacity .4s ease ${ci * 22}ms` }} />;
          })}
        </div>
      ))}
    </div>
  );
}

const sectionH = { margin: 0, fontFamily: M.disp, fontWeight: 800, fontSize: 22, textTransform: "uppercase", letterSpacing: "-0.02em", color: M.ink };

export function ScreenResumen({ t, lang, setLang, startWorkout, hasSession, resumeWorkout, appData }) {
  const show = useReveal(40);
  const nextId = nextRoutineId(appData);
  const nextR = appData.routines.find((r) => r.id === nextId);
  const nextName = lang === "es" ? nextR.nameES : nextR.nameEN;
  const toGoal = Math.round((FT.currentAvg - FT.profile.goalKg) * 10) / 10;
  const dateStr = lang === "es" ? "LUN 09 JUN" : "MON 09 JUN";

  return (
    <ScreenScroll>
      <TopBar kicker={`FITTRACK · ${dateStr}`} title={t.overview}
        right={<LangSwitch lang={lang} setLang={setLang} bg="transparent" fg={M.ink2} active={M.ink} activeFg={M.paper} border={M.line} />} />

      <MAlertBand t={t} />

      <div style={{ padding: "20px 20px 0" }}>
        <Rise show={show} i={0}>
          <div onClick={() => hasSession ? resumeWorkout() : startWorkout(nextId)}
            style={{ background: M.ink, color: M.paper, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div>
              <Kicker color="rgba(243,239,230,0.6)">{hasSession ? t.continueWorkout : t.nextUp}</Kicker>
              <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 30, textTransform: "uppercase", letterSpacing: "-0.03em", marginTop: 6 }}>{hasSession ? "→" : nextName}</div>
              <div style={{ fontFamily: M.mono, fontSize: 11, color: "rgba(243,239,230,0.55)", marginTop: 4 }}>{t.exercisesN(nextR.exercises.length)}</div>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: M.acc, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="arrowR" color={M.paper} size={26} />
            </div>
          </div>
        </Rise>
      </div>

      <Rise show={show} i={1}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${M.line}`, borderBottom: `1px solid ${M.line}`, marginTop: 20 }}>
          {[
            { k: t.weightAvg, v: FT.currentAvg, dec: 1, u: "kg", sub: `${t.today} ${FT.currentToday} kg` },
            { k: t.change7, v: FT.change7, dec: 1, u: "kg", sub: t.trendReal, signed: true },
          ].map((s, i) => (
            <div key={i} style={{ padding: "18px 20px", borderLeft: i ? `1px solid ${M.line}` : "none" }}>
              <Kicker style={{ marginBottom: 12 }}>{s.k}</Kicker>
              <BigNum value={s.v} unit={s.u} size={46} count decimals={s.dec} delay={300 + i * 90}
                color={s.signed ? (s.v <= 0 ? M.ok : M.acc) : M.ink} />
              <div style={{ fontFamily: M.mono, fontSize: 10.5, color: M.ink2, marginTop: 9 }}>{s.signed && s.v > 0 ? "+" : ""}{s.sub}</div>
            </div>
          ))}
        </div>
      </Rise>

      <Rise show={show} i={2}>
        <div style={{ padding: "20px 20px 22px", borderBottom: `1px solid ${M.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <h2 style={sectionH}>{t.weightTrend}</h2>
            <span style={{ fontFamily: M.mono, fontSize: 10.5, color: M.ink2 }}>{toGoal} kg → {FT.profile.goalKg}</span>
          </div>
          <MiniWeightChart />
        </div>
      </Rise>

      <Rise show={show} i={3}>
        <div style={{ padding: "20px 20px 22px", borderBottom: `1px solid ${M.line}` }}>
          <h2 style={{ ...sectionH, marginBottom: 16 }}>{t.macrosTitle}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: t.protein, d: FT.macros.protein, hero: true },
              { label: t.carbs, d: FT.macros.carbs },
              { label: t.fat, d: FT.macros.fat },
            ].map((r, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <Kicker>{r.label}</Kicker>
                  <span style={{ fontFamily: M.mono, fontSize: 11, color: M.ink }}><b style={{ fontWeight: 600 }}>{r.d.avg}</b><span style={{ color: M.ink2 }}> / {r.d.target} g</span></span>
                </div>
                <MacroBar value={r.d.avg} target={r.d.target} hero={r.hero} />
              </div>
            ))}
          </div>
        </div>
      </Rise>

      <Rise show={show} i={4}>
        <div style={{ padding: "20px 20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h2 style={sectionH}>{t.consistency}</h2>
              <div style={{ fontFamily: M.mono, fontSize: 10.5, color: M.ink2, marginTop: 4 }}>{t.last26wk.replace("26", "13").toUpperCase()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <BigNum value={FT.streak} unit={t.streakLabel} size={40} color={M.acc} count delay={500} />
            </div>
          </div>
          <MiniHeat t={t} />
        </div>
      </Rise>
    </ScreenScroll>
  );
}
