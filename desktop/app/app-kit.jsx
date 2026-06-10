/* ============================================================
   FitTrack APP — mobile design kit (Editorial Brutalist → mobile)
   Theme tokens + shared primitives for every screen.
   Loaded as Babel JSX. Exports to window.
   ============================================================ */
const { useState: useStateK, useEffect: useEffectK, useRef: useRefK } = React;

/* palette — same ink/paper/tangerine system as Direction A */
const M = {
  paper: "#f3efe6",
  panel: "#f8f5ee",
  panel2: "#efeadf",
  ink: "#16140d",
  ink2: "#6a655a",
  ink3: "#9a948700",
  line: "rgba(22,20,13,0.16)",
  hair: "rgba(22,20,13,0.10)",
  acc: "#e7531c",
  accDim: "rgba(231,83,28,0.12)",
  ok: "#3f7d4e",
  okDim: "rgba(63,125,78,0.14)",
  disp: "'Archivo', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  navH: 78,
  topPad: 60,
};

/* localStorage-backed state */
function useLocal(key, initial) {
  const [v, setV] = useStateK(() => {
    try { const s = localStorage.getItem("ft:" + key); return s !== null ? JSON.parse(s) : initial; }
    catch (e) { return initial; }
  });
  useEffectK(() => {
    try { localStorage.setItem("ft:" + key, JSON.stringify(v)); } catch (e) {}
  }, [key, v]);
  return [v, setV];
}

function haptic() { try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {} }

/* ---------- atoms ---------- */
function Kicker({ children, color, style }) {
  return <div style={{ fontFamily: M.mono, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: color || M.ink2, fontWeight: 500, ...style }}>{children}</div>;
}

function Divider({ style }) { return <div style={{ height: 1, background: M.hair, ...style }} />; }

/* big tabular display number with unit */
function BigNum({ value, unit, size = 56, color, count, decimals = 0, delay = 0 }) {
  return (
    <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: size, lineHeight: 0.92, letterSpacing: "-0.04em", color: color || M.ink, fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "baseline" }}>
      {count ? <CountUp value={value} decimals={decimals} delay={delay} /> : value}
      {unit && <span style={{ fontSize: Math.max(13, size * 0.26), fontFamily: M.mono, fontWeight: 500, marginLeft: 5, letterSpacing: 0, color: M.ink2 }}>{unit}</span>}
    </div>
  );
}

/* full-width primary action — 54px tall hit target */
function PrimaryBtn({ children, onClick, tone = "ink", disabled, style }) {
  const bg = disabled ? M.line : tone === "acc" ? M.acc : M.ink;
  return (
    <button onClick={() => { if (!disabled) { haptic(); onClick && onClick(); } }} disabled={disabled}
      style={{ width: "100%", height: 54, border: "none", background: bg, color: M.paper, cursor: disabled ? "default" : "pointer",
        fontFamily: M.mono, fontSize: 13, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9, transition: "transform .08s, background .2s",
        WebkitTapHighlightColor: "transparent", ...style }}
      onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.985)"; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, style }) {
  return (
    <button onClick={() => { haptic(); onClick && onClick(); }}
      style={{ height: 44, border: `1px solid ${M.line}`, background: "transparent", color: M.ink, cursor: "pointer",
        fontFamily: M.mono, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase",
        padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        WebkitTapHighlightColor: "transparent", ...style }}>
      {children}
    </button>
  );
}

/* stepper for reps / weight — large + / − targets */
function Stepper({ value, onChange, step = 1, min = 0, suffix, w = 118 }) {
  const btn = (label, d) => (
    <button onClick={() => { haptic(); onChange(Math.max(min, Math.round((value + d) * 100) / 100)); }}
      style={{ width: 40, height: 40, border: "none", background: "transparent", color: M.ink, cursor: "pointer",
        fontFamily: M.disp, fontSize: 26, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
        WebkitTapHighlightColor: "transparent" }}>{label}</button>
  );
  return (
    <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${M.line}`, height: 44, background: M.panel }}>
      {btn("−", -step)}
      <div style={{ width: w, textAlign: "center", fontFamily: M.disp, fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums", color: M.ink, borderLeft: `1px solid ${M.hair}`, borderRight: `1px solid ${M.hair}`, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
        {value}{suffix && <span style={{ fontFamily: M.mono, fontSize: 11, fontWeight: 500, color: M.ink2 }}>{suffix}</span>}
      </div>
      {btn("+", step)}
    </div>
  );
}

/* segmented control — editorial squared style */
function Segmented({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", border: `1px solid ${M.line}`, background: M.panel }}>
      {options.map((o, i) => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => { haptic(); onChange(o.id); }}
            style={{ flex: 1, height: 40, border: "none", borderLeft: i ? `1px solid ${M.hair}` : "none",
              background: on ? M.ink : "transparent", color: on ? M.paper : M.ink2, cursor: "pointer",
              fontFamily: M.mono, fontSize: 11.5, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase",
              transition: "background .18s, color .18s", WebkitTapHighlightColor: "transparent" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* labeled macro/progress bar with optional target tick */
function MacroBar({ value, target, color, hero, animate = true }) {
  const show = useReveal(animate ? 120 : 0);
  const max = target * 1.18;
  const fill = Math.min(1, value / max) * 100;
  const tick = (target / max) * 100;
  return (
    <div style={{ height: 12, background: M.hair, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "left", width: `${fill}%`, background: color || (hero ? M.acc : M.ink), transform: show ? "scaleX(1)" : "scaleX(0)", transition: "transform .8s cubic-bezier(.22,.61,.36,1)" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${tick}%`, width: 2, background: M.ink, opacity: 0.8 }} />
    </div>
  );
}

/* circular progress ring (calories) */
function Ring({ value, max, size = 132, stroke = 13, color, children }) {
  const show = useReveal(150);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={M.hair} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || M.acc} strokeWidth={stroke} strokeLinecap="butt"
          strokeDasharray={c} strokeDashoffset={show ? c * (1 - pct) : c} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,.61,.36,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

/* bottom sheet modal */
function Sheet({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(22,20,13,0.34)", animation: "ftfade .2s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: M.paper, borderTop: `2px solid ${M.ink}`, maxHeight: "82%", display: "flex", flexDirection: "column", animation: "ftslide .26s cubic-bezier(.22,.61,.36,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: `1px solid ${M.hair}` }}>
          <h3 style={{ margin: 0, fontFamily: M.disp, fontWeight: 800, fontSize: 22, textTransform: "uppercase", letterSpacing: "-0.02em" }}>{title}</h3>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${M.line}`, background: "transparent", cursor: "pointer", fontFamily: M.disp, fontSize: 18, color: M.ink, display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>✕</button>
        </div>
        <div style={{ overflow: "auto", padding: "16px 20px 26px", WebkitOverflowScrolling: "touch" }}>{children}</div>
      </div>
    </div>
  );
}

/* ---------- icons (basic geometry only) ---------- */
function Icon({ name, color = M.ink2, size = 24, fill = false }) {
  const sw = 2;
  const common = { fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    train: (<g><rect x="2.5" y="9" width="3" height="6" rx="1" {...common} fill={fill ? color : "none"} /><rect x="18.5" y="9" width="3" height="6" rx="1" {...common} fill={fill ? color : "none"} /><line x1="6.5" y1="12" x2="17.5" y2="12" {...common} /><line x1="2.5" y1="12" x2="1.5" y2="12" {...common} /><line x1="22.5" y1="12" x2="21.5" y2="12" {...common} /></g>),
    body: (<g><circle cx="12" cy="6" r="2.6" {...common} fill={fill ? color : "none"} /><path d="M12 9v8M12 11l-4 2M12 11l4 2M12 17l-2.5 4M12 17l2.5 4" {...common} /></g>),
    home: (<g>{[ [5,13,5],[10.5,9,9],[16,11,7] ].map((b,i)=>(<rect key={i} x={b[0]} y={20-b[1]} width="3.2" height={b[1]} {...common} fill={fill ? color : "none"} />))}</g>),
    nutri: (<g><circle cx="12" cy="12" r="8.2" {...common} fill={fill ? color : "none"} /><circle cx="12" cy="12" r="3.4" {...common} fill="none" stroke={fill ? M.paper : color} /></g>),
    settings: (<g><line x1="3" y1="8" x2="21" y2="8" {...common} /><line x1="3" y1="16" x2="21" y2="16" {...common} /><rect x="8" y="6" width="4" height="4" rx="1" {...common} fill={M.paper} /><rect x="13" y="14" width="4" height="4" rx="1" {...common} fill={M.paper} /></g>),
    plus: (<g><line x1="12" y1="5" x2="12" y2="19" {...common} /><line x1="5" y1="12" x2="19" y2="12" {...common} /></g>),
    check: (<polyline points="4,12 10,18 20,6" {...common} />),
    chevR: (<polyline points="9,5 16,12 9,19" {...common} />),
    chevL: (<polyline points="15,5 8,12 15,19" {...common} />),
    clock: (<g><circle cx="12" cy="12" r="8.5" {...common} /><polyline points="12,7 12,12 16,14" {...common} /></g>),
    flame: (<path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 2-4 0 1 1 2 2 2 0-2-1-4 0-6z" {...common} fill={fill ? color : "none"} />),
    arrowR: (<g><line x1="4" y1="12" x2="19" y2="12" {...common} /><polyline points="13,6 19,12 13,18" {...common} /></g>),
    book: (<g><path d="M4 5.5h6a2 2 0 012 2V20a2 2 0 00-2-2H4z" {...common} fill={fill ? color : "none"} /><path d="M20 5.5h-6a2 2 0 00-2 2V20a2 2 0 012-2h6z" {...common} fill={fill ? color : "none"} /></g>),
    list: (<g><line x1="9" y1="7" x2="20" y2="7" {...common} /><line x1="9" y1="12" x2="20" y2="12" {...common} /><line x1="9" y1="17" x2="20" y2="17" {...common} /><rect x="3.5" y="5.8" width="2.4" height="2.4" {...common} fill={fill ? color : "none"} /><rect x="3.5" y="10.8" width="2.4" height="2.4" {...common} fill={fill ? color : "none"} /><rect x="3.5" y="15.8" width="2.4" height="2.4" {...common} fill={fill ? color : "none"} /></g>),
    download: (<g><line x1="12" y1="4" x2="12" y2="15" {...common} /><polyline points="7,11 12,16 17,11" {...common} /><line x1="5" y1="20" x2="19" y2="20" {...common} /></g>),
    upload: (<g><line x1="12" y1="16" x2="12" y2="5" {...common} /><polyline points="7,9 12,4 17,9" {...common} /><line x1="5" y1="20" x2="19" y2="20" {...common} /></g>),
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>{paths[name]}</svg>;
}

/* ---------- top bar ---------- */
function TopBar({ kicker, title, right, big = true }) {
  return (
    <div style={{ padding: `${M.topPad}px 20px 0` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {kicker && <Kicker style={{ marginBottom: 8 }}>{kicker}</Kicker>}
          <h1 style={{ margin: 0, fontFamily: M.disp, fontWeight: 900, fontSize: big ? 44 : 32, lineHeight: 0.9, letterSpacing: "-0.045em", textTransform: "uppercase", color: M.ink }}>{title}</h1>
        </div>
        {right}
      </div>
    </div>
  );
}

/* ---------- bottom nav ---------- */
function BottomNav({ tab, setTab, t }) {
  const items = [
    { id: "entrenar", icon: "train", label: t.tabTrain },
    { id: "cuerpo", icon: "body", label: t.tabBody },
    { id: "resumen", icon: "home", label: t.tabHome },
    { id: "nutricion", icon: "nutri", label: t.tabNutri },
    { id: "ajustes", icon: "settings", label: t.tabSettings },
  ];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 40, height: M.navH, background: M.paper, borderTop: `1.5px solid ${M.ink}`, display: "flex", paddingBottom: 16 }}>
      {items.map((it) => {
        const on = tab === it.id;
        return (
          <button key={it.id} onClick={() => { haptic(); setTab(it.id); }}
            style={{ flex: 1, border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 5, paddingTop: 11, position: "relative", WebkitTapHighlightColor: "transparent" }}>
            {on && <div style={{ position: "absolute", top: 0, left: "28%", right: "28%", height: 3, background: M.acc }} />}
            <Icon name={it.icon} color={on ? M.ink : M.ink2} fill={on} size={23} />
            <span style={{ fontFamily: M.mono, fontSize: 9, letterSpacing: ".06em", textTransform: "uppercase", color: on ? M.ink : M.ink2, fontWeight: on ? 600 : 400 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* scrollable screen body with nav clearance */
function ScreenScroll({ children, refEl }) {
  return (
    <div ref={refEl} style={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", paddingBottom: M.navH + 20, background: M.paper }}>
      {children}
    </div>
  );
}

Object.assign(window, {
  M, useLocal, haptic, Kicker, Divider, BigNum, PrimaryBtn, GhostBtn, Stepper,
  Segmented, MacroBar, Ring, Sheet, Icon, TopBar, BottomNav, ScreenScroll,
});
