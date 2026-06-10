import { useState } from "react";
import { useReveal, smoothPath, toPoints, DrawLine, Rise } from "../shared.jsx";
import { M, Kicker, BigNum, TopBar, ScreenScroll, Icon, Segmented, PrimaryBtn, Stepper, Sheet } from "../kit.jsx";
import { MInsight, MInsightSpark, MInsightMetric, MHl } from "../insight.jsx";
import { FT } from "../data.js";
import { fmtDay } from "./ScreenEntrenar.jsx";

function WeightChartB() {
  const show = useReveal(180);
  const base = FT.weightSeries.slice(-42);
  const avgs = base.map((d) => d.avg), tgts = base.map((d) => d.target);
  const W = 340, H = 150, padT = 14, padB = 18;
  const lo = Math.min(...avgs, ...tgts, FT.profile.goalKg) - 0.4;
  const hi = Math.max(...avgs, ...tgts) + 0.4;
  const map = (arr) => toPoints(arr, { w: W, h: H, pad: 0, min: lo, max: hi }).map((p) => ({ ...p, y: padT + (p.y / H) * (H - padT - padB) }));
  const pa = map(avgs), pt = map(tgts);
  const last = pa[pa.length - 1];
  const goalY = padT + ((hi - FT.profile.goalKg) / (hi - lo)) * (H - padT - padB);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      <line x1="0" y1={goalY} x2={W} y2={goalY} stroke={M.ok} strokeWidth="1.2" strokeDasharray="2 4" />
      <text x={W} y={goalY - 5} textAnchor="end" fontFamily={M.mono} fontSize="9.5" fill={M.ok}>{FT.profile.goalKg} kg</text>
      <DrawLine d={smoothPath(pt, 0.6)} color={M.ink2} width="1.4" reveal={show} dash="2 5" opacity={0.5} delay={80} />
      <DrawLine d={smoothPath(pa, 0.6)} color={M.acc} width="2.8" reveal={show} dur={1500} delay={160} />
      <circle cx={last.x} cy={last.y} r={show ? 4.5 : 0} fill={M.acc} style={{ transition: "r .4s ease 1.5s" }} />
    </svg>
  );
}

function MeasureSpark({ series }) {
  const show = useReveal(120);
  const W = 90, H = 30;
  const pts = toPoints(series, { w: W, h: H, pad: 4 });
  const down = series[series.length - 1] <= series[0];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", overflow: "visible" }}>
      <DrawLine d={smoothPath(pts, 0.6)} color={down ? M.ok : M.acc} width="2" reveal={show} dur={1000} />
    </svg>
  );
}

const sectionH = { margin: 0, fontFamily: M.disp, fontWeight: 800, fontSize: 22, textTransform: "uppercase", letterSpacing: "-0.02em", color: M.ink };

export function ScreenCuerpo({ t, lang, weightLog, setWeightLog, appData }) {
  const show = useReveal(40);
  const [view, setView] = useState("peso");
  const [logOpen, setLogOpen] = useState(false);
  const [draft, setDraft] = useState(FT.currentToday);

  const latestKg = weightLog.length ? weightLog[0].kg : FT.currentToday;
  const toGoal = Math.round((latestKg - FT.profile.goalKg) * 10) / 10;
  const recent = [...weightLog, ...FT.weightSeries.slice(-6).reverse().map((d) => ({ iso: d.iso, kg: d.kg }))].slice(0, 7);

  return (
    <ScreenScroll>
      <TopBar kicker="FITTRACK" title={t.tabBody} />
      {(() => {
        const ws = FT.weightSeries.slice(-42).map((d) => d.avg);
        const wm = appData.measurements.waist.series;
        const waistDelta = Math.round((wm[wm.length - 1] - wm[0]) * 10) / 10;
        return (
          <MInsight
            topic={lang === "es" ? "Lo más importante · Composición" : "What matters now · Composition"}
            headline={lang === "es"
              ? <span>A <MHl>−0,40 kg/sem</MHl> llegas a <MHl>{FT.profile.goalKg} kg</MHl> el {FT.projection.dateES}.</span>
              : <span>At <MHl>−0.40 kg/wk</MHl> you reach <MHl>{FT.profile.goalKg} kg</MHl> by {FT.projection.dateEN}.</span>}
            sub={lang === "es" ? `cintura ${waistDelta} cm en 10 semanas · tendencia real, no agua` : `waist ${waistDelta} cm over 10 weeks · real trend, not water`}
            viz={<MInsightSpark series={ws} />}
            metric={<MInsightMetric value={Math.abs(toGoal)} unit="kg" decimals={1} label={lang === "es" ? "para la meta" : "to goal"} color={M.acc} count />}
          />
        );
      })()}

      <div style={{ padding: "18px 20px 16px" }}>
        <Rise show={show} i={0}>
          <Segmented value={view} onChange={setView} options={[{ id: "peso", label: t.weightTab }, { id: "medidas", label: t.measuresTab }, { id: "fotos", label: t.photosTab }]} />
        </Rise>
      </div>

      {view === "peso" && (
        <div>
          <Rise show={show} i={1}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${M.line}`, borderBottom: `1px solid ${M.line}` }}>
              <div style={{ padding: "18px 20px" }}>
                <Kicker style={{ marginBottom: 12 }}>{t.current}</Kicker>
                <BigNum value={latestKg} unit="kg" size={46} count decimals={1} delay={250} />
              </div>
              <div style={{ padding: "18px 20px", borderLeft: `1px solid ${M.line}` }}>
                <Kicker style={{ marginBottom: 12 }}>{t.goalWeight}</Kicker>
                <BigNum value={FT.profile.goalKg} unit="kg" size={46} color={M.ink2} />
                <div style={{ fontFamily: M.mono, fontSize: 10.5, color: M.acc, marginTop: 9 }}>{t.toGoal(toGoal)}</div>
              </div>
            </div>
          </Rise>
          <Rise show={show} i={2}>
            <div style={{ padding: "20px 20px 22px", borderBottom: `1px solid ${M.line}` }}>
              <h2 style={{ ...sectionH, marginBottom: 14 }}>{t.weightTrend}</h2>
              <WeightChartB />
            </div>
          </Rise>
          <Rise show={show} i={3}>
            <div style={{ padding: "18px 20px" }}>
              {recent.map((e, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < recent.length - 1 ? `1px solid ${M.hair}` : "none" }}>
                  <Kicker>{fmtDay(e.iso, lang)}</Kicker>
                  <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 20, fontVariantNumeric: "tabular-nums" }}>{e.kg}<span style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2 }}>kg</span></div>
                </div>
              ))}
            </div>
          </Rise>
          <div style={{ padding: "4px 20px 24px" }}>
            <PrimaryBtn tone="ink" onClick={() => { setDraft(latestKg); setLogOpen(true); }}><Icon name="plus" color={M.paper} size={17} />{t.logWeight}</PrimaryBtn>
          </div>
        </div>
      )}

      {view === "medidas" && (
        <div style={{ borderTop: `1px solid ${M.line}` }}>
          {["waist","hips","arm","chest","thigh"].map((k, i) => {
            const m = appData.measurements[k];
            const cur = m.series[m.series.length - 1];
            const delta = Math.round((cur - m.series[0]) * 10) / 10;
            return (
              <Rise key={k} show={show} i={1 + i}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${M.line}` }}>
                  <div>
                    <Kicker style={{ marginBottom: 7 }}>{t[k]}</Kicker>
                    <BigNum value={cur} unit="cm" size={30} />
                    <div style={{ fontFamily: M.mono, fontSize: 10.5, color: delta <= 0 ? M.ok : M.acc, marginTop: 6 }}>{delta > 0 ? "+" : ""}{delta} cm · {t.last8wk}</div>
                  </div>
                  <MeasureSpark series={m.series} />
                </div>
              </Rise>
            );
          })}
        </div>
      )}

      {view === "fotos" && (
        <div style={{ borderTop: `1px solid ${M.line}`, padding: "20px 20px 24px" }}>
          <Rise show={show} i={1}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {appData.photos.map((p, i) => (
                <div key={i}>
                  <div style={{ width: "100%", height: 210, border: `1px solid ${M.line}`, background: M.panel2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Kicker>{fmtDay(p.iso, lang)} · {p.kg}kg</Kicker>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                    <Kicker>{fmtDay(p.iso, lang)}</Kicker>
                    <span style={{ fontFamily: M.mono, fontSize: 10.5, color: M.ink, fontWeight: 600 }}>{p.kg}kg</span>
                  </div>
                </div>
              ))}
              <div style={{ height: 210, border: `1px dashed ${M.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: M.ink2 }}>
                <Icon name="plus" color={M.ink2} size={26} />
                <Kicker>{t.addPhoto}</Kicker>
              </div>
            </div>
          </Rise>
        </div>
      )}

      <Sheet open={logOpen} onClose={() => setLogOpen(false)} title={t.logWeight}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, padding: "10px 0 6px" }}>
          <Stepper value={draft} step={0.1} min={30} onChange={setDraft} suffix="kg" w={140} />
          <PrimaryBtn tone="acc" onClick={() => { setWeightLog([{ iso: "2026-06-09", kg: Math.round(draft * 10) / 10 }, ...weightLog]); setLogOpen(false); }} style={{ maxWidth: 280 }}>{t.save}</PrimaryBtn>
        </div>
      </Sheet>
    </ScreenScroll>
  );
}
