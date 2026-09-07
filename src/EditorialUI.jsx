import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { localISO } from "./app-utils.js";

export const A_INK = "var(--text)";
export const A_INK2 = "var(--muted)";
export const A_ACC = "var(--accent)";
export const A_OK = "var(--ok)";
export const A_DANGER = "var(--danger)";
export const A_DISP = "'Archivo', sans-serif";
export const A_MONO = "'IBM Plex Mono', monospace";
export const A_PAPER = "var(--bg)";
export const A_LINE = "var(--line)";
export const A_HAIR = "var(--hair)";

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
// Tarjeta de aviso del prototipo: borde de atencion a la izquierda, kicker en
// mono, titular corto y la cifra a la derecha.
export function Headline({ kicker, sub, value, unit, valueSub, spark, children }) {
  const show = useReveal(60);
  return (
    <Rise show={show} i={1}>
      <div className="ft-dc-card attn" style={{ marginTop: 12 }}>
        <div className="ft-dc-kicker">{kicker}{sub && <span>{sub}</span>}</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div className="t" style={{ flex: "1 1 260px", minWidth: 0 }}>{children}</div>
          {(value != null || spark) && (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {spark && <Spark values={spark} width={110} height={34} />}
              {value != null && (
                <div style={{ textAlign: "right" }}>
                  <div className="ft-dc-big" style={{ color: A_ACC }}>{value}{unit && <small>{unit}</small>}</div>
                  {valueSub && <div style={{ fontFamily: A_MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: A_INK2, marginTop: 7 }}>{valueSub}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Rise>
  );
}

// Cabecera de pantalla: titulo de 24px y su linea de contexto en mono, no el
// mast de 60px en mayusculas del lenguaje anterior.
export function ScreenMast({ kicker, title, right }) {
  const show = useReveal(40);
  return (
    <Rise show={show} i={0}>
      <div className="ft-dc-head">
        <div>
          <h1>{title}</h1>
          {kicker && <span className="sub">{kicker}</span>}
        </div>
        {right}
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
  const buttonStyle = { width: 32, height: 32, borderRadius: 9, border: `1px solid ${A_LINE}`, background: "transparent", cursor: "pointer", display: "grid", placeItems: "center", color: A_INK };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => shift(-1)} style={buttonStyle} aria-label="Día anterior"><ChevronLeft size={16} /></button>
      <div style={{ textAlign: "center", minWidth: 120 }}>
        <div style={{ fontFamily: A_DISP, fontWeight: 700, fontSize: 14, textTransform: "capitalize" }}>{label}</div>
        <div style={{ fontFamily: A_MONO, fontSize: 10.5, color: A_INK2 }}>{current.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</div>
      </div>
      <button onClick={() => shift(1)} style={buttonStyle} aria-label="Día siguiente"><ChevronRight size={16} /></button>
    </div>
  );
}

// Strip de cifras del prototipo: separadores de 1px, etiqueta en mono, cifra 24px.
export function KpiStrip({ items }) {
  const show = useReveal(80);
  const isMobile = useIsMobile();
  return (
    <Rise show={show} i={1}>
      <div className="ft-dc-strip" style={{ "--cols": isMobile ? 2 : items.length }}>
        {items.map((item) => (
          <div key={item.k}>
            <span className="k">{String(item.k).toUpperCase()}</span>
            <span className="v" style={item.color ? { color: item.color } : undefined}>
              {item.v}{item.u && <small>{item.u}</small>}
            </span>
            {item.sub && <span className="d" style={item.subColor ? { color: item.subColor } : undefined}>{item.sub}</span>}
          </div>
        ))}
      </div>
    </Rise>
  );
}

// Panel de seccion: la tarjeta del prototipo, con la cabecera en mono.
export function EPanel({ title, meta, children, i = 2, raise }) {
  const show = useReveal(60);
  return (
    <Rise show={show} i={i} style={raise ? { position: "relative", zIndex: 20 } : undefined}>
      <div className="ft-dc-card">
        {title && <div className="h"><span>{title}</span>{meta && <span>{meta}</span>}</div>}
        {children}
      </div>
    </Rise>
  );
}
