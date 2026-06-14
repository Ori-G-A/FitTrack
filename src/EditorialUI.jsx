import React, { useEffect, useState } from "react";

export const A_INK = "#16140d";
export const A_INK2 = "#6a655a";
export const A_DISP = "'Archivo', sans-serif";
export const A_MONO = "'IBM Plex Mono', monospace";

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
