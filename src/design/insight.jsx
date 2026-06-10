import { useReveal, CountUp, smoothPath, toPoints, DrawLine } from "./shared.jsx";
import { M, Kicker } from "./kit.jsx";
import { FT } from "./data.js";

function MHl({ children }) { return <span style={{ color: M.acc }}>{children}</span>; }
const mnfmt = (n, lang) => Math.round(n).toLocaleString(lang === "es" ? "es-ES" : "en-US");

export { MHl, mnfmt };

export function MInsight({ topic, headline, sub, viz, metric }) {
  const show = useReveal(70);
  return (
    <div style={{
      position: "relative", background: M.panel, borderTop: `1px solid ${M.line}`, borderBottom: `1px solid ${M.line}`,
      padding: "16px 20px 18px 23px",
      opacity: show ? 1 : 0, transform: show ? "none" : "translateY(8px)",
      transition: "opacity .45s ease, transform .45s ease",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: M.acc }} />
      <Kicker color={M.acc} style={{ marginBottom: 9 }}>{topic}</Kicker>
      <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 20, lineHeight: 1.16, letterSpacing: "-0.02em", color: M.ink, textWrap: "pretty" }}>{headline}</div>
      {(viz || metric) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>{viz}</div>
          {metric}
        </div>
      )}
      {sub && <div style={{ fontFamily: M.mono, fontSize: 10, color: M.ink2, marginTop: viz || metric ? 12 : 11, letterSpacing: ".05em", textTransform: "uppercase", lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

export function MInsightMetric({ value, unit, label, count, decimals = 0, color, sign }) {
  return (
    <div style={{ textAlign: "right", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", fontFamily: M.disp, fontWeight: 800, fontSize: 42, lineHeight: 0.85, letterSpacing: "-0.04em", color: color || M.ink, fontVariantNumeric: "tabular-nums" }}>
        {sign && value > 0 ? "+" : ""}{count ? <CountUp value={value} decimals={decimals} delay={280} /> : value}
        {unit && <span style={{ fontSize: 13, fontFamily: M.mono, fontWeight: 500, marginLeft: 3, letterSpacing: 0, color: M.ink2 }}>{unit}</span>}
      </div>
      <Kicker style={{ marginTop: 8 }}>{label}</Kicker>
    </div>
  );
}

export function MInsightSpark({ series, color }) {
  const show = useReveal(200);
  const W = 180, H = 50;
  const pts = toPoints(series, { w: W, h: H, pad: 7 });
  const last = pts[pts.length - 1];
  const c = color || M.acc;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible", maxWidth: W }}>
      <DrawLine d={smoothPath(pts, 0.6)} color={c} width="2.4" reveal={show} dur={1100} />
      <circle cx={last.x} cy={last.y} r={show ? 4 : 0} fill={c} style={{ transition: "r .4s ease 1s" }} />
    </svg>
  );
}

export function MInsightBars() {
  const show = useReveal(200);
  const data = FT.kcalSeries;
  const W = 180, H = 50;
  const max = Math.max(...data.map((d) => d.kcal)) * 1.06;
  return (
    <div style={{ width: "100%", maxWidth: W, height: H, display: "flex", alignItems: "flex-end", gap: 2, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: `${(FT.kcalTarget / max) * 100}%`, borderTop: `1px dashed ${M.ink}`, opacity: 0.4 }} />
      {data.map((d, i) => {
        const over = d.kcal > FT.kcalTarget;
        return <div key={i} style={{ flex: 1, height: show ? `${(d.kcal / max) * 100}%` : "0%", background: over ? M.acc : M.ink, transition: `height .6s cubic-bezier(.22,.61,.36,1) ${i * 30}ms` }} />;
      })}
    </div>
  );
}

export function MInsightDots({ states }) {
  const show = useReveal(180);
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {states.map((on, i) => (
        <div key={i} style={{ width: 24, height: 24, border: `1.5px solid ${M.ink}`, background: on ? M.acc : "transparent", opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.6)", transition: `opacity .4s ease ${i * 70}ms, transform .4s cubic-bezier(.22,.61,.36,1) ${i * 70}ms` }} />
      ))}
    </div>
  );
}

export function MAlertBand({ t }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 20px", background: M.accDim, borderTop: `1px solid ${M.line}`, borderBottom: `1px solid ${M.line}` }}>
      <div style={{ width: 26, height: 26, flexShrink: 0, border: `1.5px solid ${M.acc}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: M.disp, fontWeight: 900, fontSize: 15, color: M.acc }}>!</div>
      <div>
        <Kicker color={M.acc} style={{ marginBottom: 4 }}>{t.alertsTitle}</Kicker>
        <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 15, textTransform: "uppercase", letterSpacing: "-0.01em", color: M.ink, lineHeight: 1.15 }}>{t.alertImbalanceTitle}</div>
        <div style={{ fontSize: 12, color: M.ink2, marginTop: 5, lineHeight: 1.45 }}>{t.alertImbalanceBody}</div>
      </div>
    </div>
  );
}
