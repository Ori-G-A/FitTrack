import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { localISO } from "./app-utils.js";

export const A_INK = "#16140d";
export const A_INK2 = "#6a655a";
export const A_ACC = "#e7531c";
export const A_OK = "#3a7d44";
export const A_DANGER = "#c0341a";
export const A_DISP = "'Archivo', sans-serif";
export const A_MONO = "'IBM Plex Mono', monospace";
export const A_PAPER = "#f3efe6";
export const A_LINE = "rgba(22,20,13,0.16)";
export const A_HAIR = "rgba(22,20,13,0.10)";

export function useReveal(delay = 0) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);
  return visible;
}

export function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(typeof window !== "undefined" && window.innerWidth < breakpoint);
  useEffect(() => {
    const update = () => setMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);
  return mobile;
}

export function Rise({ show, i = 0, step = 70, y = 16, dur = 620, children, style = {} }) {
  return (
    <div style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : `translateY(${y}px)`, transition: `opacity ${dur}ms ease, transform ${dur}ms cubic-bezier(.22,.61,.36,1)`, transitionDelay: `${i * step}ms`, ...style }}>
      {children}
    </div>
  );
}

export function DKicker({ children, color }) {
  return <div style={{ fontFamily: A_MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: color || A_INK2, fontWeight: 500 }}>{children}</div>;
}

export function ScreenMast({ kicker, title, right }) {
  const show = useReveal(40);
  const isMobile = useIsMobile();
  return (
    <Rise show={show} i={0}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, borderBottom: `2px solid ${A_INK}`, paddingBottom: 14 }}>
        <div>
          <DKicker>{kicker}</DKicker>
          <h1 style={{ margin: "10px 0 0", fontFamily: A_DISP, fontWeight: 900, fontSize: isMobile ? 38 : 60, lineHeight: 0.85, letterSpacing: "-0.045em", textTransform: "uppercase", color: A_INK }}>{title}</h1>
        </div>
        {right}
      </div>
    </Rise>
  );
}

// Sparkline sin libreria: una polilinea normalizada, suficiente para "va subiendo".
export function Spark({ values = [], width = 190, height = 46, color = A_ACC }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * (width - 6) + 3;
    const y = height - 4 - ((value - min) / span) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const [lastX, lastY] = points[points.length - 1].split(",");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ display: "block" }}>
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="3.5" fill={color} />
    </svg>
  );
}

// Lo que importa ahora: una sola frase por pantalla, con su cifra al lado.
export function Headline({ kicker, sub, value, unit, valueSub, spark, children }) {
  const show = useReveal(60);
  const isMobile = useIsMobile();
  return (
    <Rise show={show} i={1}>
      <div style={{ display: "flex", gap: isMobile ? 14 : 26, alignItems: "center", flexWrap: "wrap", borderLeft: `4px solid ${A_ACC}`, borderBottom: `1px solid ${A_LINE}`, background: A_PAPER, padding: isMobile ? "16px 15px" : "20px 24px" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <DKicker color={A_ACC}>{kicker}</DKicker>
          <div style={{ fontFamily: A_DISP, fontWeight: 800, fontSize: isMobile ? 20 : 26, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "10px 0 0", color: A_INK }}>{children}</div>
          {sub && <div style={{ fontFamily: A_MONO, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: A_INK2, marginTop: 9 }}>{sub}</div>}
        </div>
        {(value != null || spark) && (
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 14 : 22 }}>
            {spark && <Spark values={spark} width={isMobile ? 110 : 190} height={isMobile ? 34 : 46} />}
            {value != null && (
              <div style={{ textAlign: "right", borderLeft: isMobile ? "none" : `1px solid ${A_LINE}`, paddingLeft: isMobile ? 0 : 22 }}>
                <div style={{ fontFamily: A_DISP, fontWeight: 900, fontSize: isMobile ? 34 : 46, lineHeight: 0.9, letterSpacing: "-0.04em", color: A_ACC, fontVariantNumeric: "tabular-nums" }}>
                  {value}{unit && <span style={{ fontSize: isMobile ? 14 : 18, fontFamily: A_MONO, fontWeight: 500, marginLeft: 3, color: A_INK2 }}>{unit}</span>}
                </div>
                {valueSub && <div style={{ fontFamily: A_MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: A_INK2, marginTop: 8 }}>{valueSub}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </Rise>
  );
}

export function EDateNav({ date, setDate }) {
  const shift = (days) => {
    const next = new Date(`${date}T00:00:00`);
    next.setDate(next.getDate() + days);
    setDate(localISO(next));
  };
  const current = new Date(`${date}T00:00:00`);
  const label = date === localISO() ? "Hoy" : current.toLocaleDateString("es-ES", { weekday: "long" });
  const buttonStyle = { width: 34, height: 34, border: `1px solid ${A_LINE}`, background: "transparent", cursor: "pointer", display: "grid", placeItems: "center", color: A_INK };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 4 }}>
      <button onClick={() => shift(-1)} style={buttonStyle}><ChevronLeft size={18} /></button>
      <div style={{ textAlign: "center", minWidth: 132 }}>
        <div style={{ fontFamily: A_DISP, fontWeight: 800, fontSize: 16, textTransform: "capitalize" }}>{label}</div>
        <div style={{ fontFamily: A_MONO, fontSize: 11, color: A_INK2 }}>{current.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</div>
      </div>
      <button onClick={() => shift(1)} style={buttonStyle}><ChevronRight size={18} /></button>
    </div>
  );
}

export function KpiStrip({ items }) {
  const show = useReveal(80);
  const isMobile = useIsMobile();
  return (
    <Rise show={show} i={1}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : `repeat(${items.length},1fr)`, border: `1px solid ${A_LINE}`, borderTop: "none" }}>
        {items.map((item, index) => (
          <div key={item.k} style={{ padding: isMobile ? "14px 16px 16px" : "18px 22px 20px", borderLeft: isMobile ? (index % 2 ? `1px solid ${A_LINE}` : "none") : (index ? `1px solid ${A_LINE}` : "none"), borderTop: isMobile && index >= 2 ? `1px solid ${A_LINE}` : "none" }}>
            <DKicker>{item.k}</DKicker>
            <div style={{ fontFamily: A_DISP, fontWeight: 800, fontSize: isMobile ? 32 : 46, lineHeight: 0.95, letterSpacing: "-0.04em", marginTop: 10, fontVariantNumeric: "tabular-nums", color: item.color || A_INK }}>
              {item.v}{item.u && <span style={{ fontSize: isMobile ? 13 : 15, fontFamily: A_MONO, fontWeight: 500, marginLeft: 5, color: A_INK2 }}>{item.u}</span>}
            </div>
            {item.sub && <div style={{ fontFamily: A_MONO, fontSize: 11, marginTop: 8, color: item.subColor || A_INK2 }}>{item.sub}</div>}
          </div>
        ))}
      </div>
    </Rise>
  );
}

export function EPanel({ title, meta, children, i = 2, raise }) {
  const show = useReveal(60);
  const isMobile = useIsMobile();
  return (
    <Rise show={show} i={i} style={raise ? { position: "relative", zIndex: 20 } : undefined}>
      <div style={{ border: `1px solid ${A_LINE}`, borderTop: "none", padding: isMobile ? "18px 15px 20px" : "22px 24px 24px", background: A_PAPER }}>
        {title && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6, borderBottom: `1px solid ${A_HAIR}`, paddingBottom: 12, marginBottom: 18 }}><h2 style={{ margin: 0, fontFamily: A_DISP, fontWeight: 800, fontSize: isMobile ? 19 : 24, textTransform: "uppercase", letterSpacing: "-0.02em", whiteSpace: isMobile ? "normal" : "nowrap" }}>{title}</h2>{meta && <span style={{ fontFamily: A_MONO, fontSize: 11, color: A_INK2, textTransform: "uppercase", letterSpacing: ".04em" }}>{meta}</span>}</div>}
        {children}
      </div>
    </Rise>
  );
}
