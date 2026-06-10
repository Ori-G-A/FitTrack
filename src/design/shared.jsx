import { useState, useEffect, useRef } from "react";

export function useReveal(delay = 0) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return on;
}

export function useCountUp(value, { dur = 1100, decimals = 0, delay = 0 } = {}) {
  const [n, setN] = useState(0);
  const ref = useRef({ raf: 0, from: 0 });
  useEffect(() => {
    const from = ref.current.from;
    let start = null;
    let raf = 0;
    const tick = (t) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setN(from + (value - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else ref.current.from = value;
    };
    const d = setTimeout(() => { raf = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(d); cancelAnimationFrame(raf); };
  }, [value, dur, delay]);
  return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
}

export function CountUp({ value, decimals = 0, dur = 1100, delay = 0, prefix = "", suffix = "" }) {
  const v = useCountUp(value, { dur, decimals, delay });
  return <span>{prefix}{v}{suffix}</span>;
}

export function smoothPath(pts, tension = 0.5) {
  if (pts.length < 2) return "";
  const d = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;
    d.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

export function toPoints(values, { w, h, pad = 0, min, max }) {
  const lo = min !== undefined ? min : Math.min(...values);
  const hi = max !== undefined ? max : Math.max(...values);
  const span = hi - lo || 1;
  const innerH = h - pad * 2;
  return values.map((v, i) => ({
    x: (i / (values.length - 1 || 1)) * w,
    y: pad + innerH - ((v - lo) / span) * innerH,
    v,
  }));
}

export function DrawLine({ d, color, width = 2.5, reveal, dur = 1400, delay = 0, dash, opacity = 1, cap = "round" }) {
  const ref = useRef(null);
  const [len, setLen] = useState(0);
  useEffect(() => { if (ref.current) setLen(ref.current.getTotalLength()); }, [d]);
  return (
    <path
      ref={ref} d={d} fill="none" stroke={color} strokeWidth={width}
      strokeLinecap={cap} strokeLinejoin="round" opacity={opacity}
      style={dash ? { strokeDasharray: dash } : (len ? {
        strokeDasharray: len,
        strokeDashoffset: reveal ? 0 : len,
        transition: `stroke-dashoffset ${dur}ms cubic-bezier(.22,.61,.36,1) ${delay}ms`,
      } : undefined)}
    />
  );
}

export function Rise({ show, i = 0, step = 70, y = 16, dur = 620, children, style = {} }) {
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : `translateY(${y}px)`,
      transition: `opacity ${dur}ms ease, transform ${dur}ms cubic-bezier(.22,.61,.36,1)`,
      transitionDelay: `${i * step}ms`,
      ...style,
    }}>{children}</div>
  );
}

export function LangSwitch({ lang, setLang, bg, fg, active, activeFg, border }) {
  return (
    <div style={{ display: "inline-flex", padding: 3, borderRadius: 999, background: bg, border: `1px solid ${border}`, gap: 2 }}>
      {["es", "en"].map((o) => (
        <button key={o} onClick={() => setLang(o)} style={{
          border: "none", cursor: "pointer", padding: "5px 12px", borderRadius: 999,
          fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", fontFamily: "inherit",
          background: lang === o ? active : "transparent",
          color: lang === o ? activeFg : fg,
          transition: "background .2s, color .2s",
        }}>{o}</button>
      ))}
    </div>
  );
}
