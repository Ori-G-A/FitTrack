/* ============================================================
   FitTrack DESKTOP — editorial form primitives (collectors).
   Squared, hairline, mono labels + Archivo values. Controlled.
   Load AFTER app-kit.jsx. Exports to window.
   ============================================================ */
const { useState: useStateF } = React;

/* section card: icon square + uppercase title + optional right slot */
function DPanel({ icon, title, right, children, style }) {
  return (
    <div style={{ border: `1px solid ${M.line}`, background: M.panel, marginBottom: 22, ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${M.hair}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {icon && <div style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${M.ink}` }}><Icon name={icon} color={M.ink} size={13} /></div>}
          <h3 style={{ margin: 0, fontFamily: M.disp, fontWeight: 800, fontSize: 17, textTransform: "uppercase", letterSpacing: "-0.01em", color: M.ink, whiteSpace: "nowrap" }}>{title}</h3>
        </div>
        {right}
      </div>
      <div style={{ padding: "20px 22px 22px" }}>{children}</div>
    </div>
  );
}

/* labeled field wrapper */
function DField({ label, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
      {label && <Kicker>{label}</Kicker>}
      {children}
    </div>
  );
}

const dInputBase = {
  width: "100%", height: 46, border: `1px solid ${M.line}`, background: M.paper,
  color: M.ink, fontFamily: M.disp, fontSize: 15, fontWeight: 500, padding: "0 14px",
  outline: "none", borderRadius: 0, WebkitAppearance: "none", appearance: "none",
};

function DInput({ value, onChange, placeholder, mono, style }) {
  const [foc, setFoc] = useStateF(false);
  return (
    <input value={value} onChange={(e) => onChange && onChange(e.target.value)} placeholder={placeholder}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ ...dInputBase, borderColor: foc ? M.ink : M.line, fontFamily: mono ? M.mono : M.disp, ...style }} />
  );
}

/* number field with editorial +/- spinner on the right */
function DNumber({ value, onChange, step = 1, min = -Infinity, max = Infinity, decimals = 0, suffix, style }) {
  const [foc, setFoc] = useStateF(false);
  const clamp = (v) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  const bump = (d) => { haptic(); onChange(clamp((parseFloat(value) || 0) + d)); };
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", border: `1px solid ${foc ? M.ink : M.line}`, background: M.paper, height: 46, ...style }}>
      <input value={value} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        onChange={(e) => onChange(e.target.value === "" ? "" : e.target.value)}
        inputMode="decimal"
        style={{ flex: 1, minWidth: 0, height: "100%", border: "none", background: "transparent", color: M.ink, fontFamily: M.disp, fontWeight: 600, fontSize: 16, padding: "0 12px", outline: "none", fontVariantNumeric: "tabular-nums" }} />
      {suffix && <span style={{ fontFamily: M.mono, fontSize: 12, color: M.ink2, paddingRight: 8 }}>{suffix}</span>}
      <div style={{ display: "flex", flexDirection: "column", borderLeft: `1px solid ${M.hair}`, height: "100%" }}>
        <button onClick={() => bump(step)} style={{ flex: 1, width: 30, border: "none", borderBottom: `1px solid ${M.hair}`, background: "transparent", cursor: "pointer", color: M.ink2, fontSize: 9, lineHeight: 1, padding: 0 }}>▲</button>
        <button onClick={() => bump(-step)} style={{ flex: 1, width: 30, border: "none", background: "transparent", cursor: "pointer", color: M.ink2, fontSize: 9, lineHeight: 1, padding: 0 }}>▼</button>
      </div>
    </div>
  );
}

function DSelect({ value, onChange, options, style }) {
  const [foc, setFoc] = useStateF(false);
  return (
    <div style={{ position: "relative", ...style }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{ ...dInputBase, borderColor: foc ? M.ink : M.line, cursor: "pointer", paddingRight: 36 }}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <div style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: M.ink2, fontSize: 11 }}>▼</div>
    </div>
  );
}

function DCheck({ checked, onChange, label }) {
  return (
    <button onClick={() => { haptic(); onChange(!checked); }}
      style={{ display: "flex", alignItems: "center", gap: 12, border: "none", background: "transparent", cursor: "pointer", padding: 0, textAlign: "left", WebkitTapHighlightColor: "transparent" }}>
      <span style={{ width: 22, height: 22, flexShrink: 0, border: `1.5px solid ${checked ? M.ink : M.line}`, background: checked ? M.ink : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {checked && <Icon name="check" color={M.acc} size={14} />}
      </span>
      <span style={{ fontFamily: M.disp, fontSize: 14.5, fontWeight: 500, color: M.ink }}>{label}</span>
    </button>
  );
}

function DTextarea({ value, onChange, placeholder, rows = 3 }) {
  const [foc, setFoc] = useStateF(false);
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ ...dInputBase, height: "auto", padding: "12px 14px", resize: "vertical", lineHeight: 1.5, borderColor: foc ? M.ink : M.line }} />
  );
}

/* range slider with tangerine fill */
function DSlider({ value, onChange, min, max, step }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ width: "100%", height: 6, WebkitAppearance: "none", appearance: "none", outline: "none", cursor: "pointer",
        background: `linear-gradient(to right, ${M.acc} 0%, ${M.acc} ${pct}%, ${M.hair} ${pct}%, ${M.hair} 100%)` }}
      className="ft-slider" />
  );
}

/* multi-select chips (secondary muscles) */
function DChips({ keys, selected, onToggle, labelFn }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {keys.map((k) => {
        const on = selected.includes(k);
        return (
          <button key={k} onClick={() => { haptic(); onToggle(k); }}
            style={{ height: 34, padding: "0 14px", border: `1px solid ${on ? M.ink : M.line}`, background: on ? M.ink : "transparent", color: on ? M.paper : M.ink2, cursor: "pointer", fontFamily: M.mono, fontSize: 11, fontWeight: 500, letterSpacing: ".04em", textTransform: "uppercase", transition: "all .15s", WebkitTapHighlightColor: "transparent" }}>
            {labelFn(k)}
          </button>
        );
      })}
    </div>
  );
}

/* energy 1-5 selector (daily wellness) */
function DEnergy({ value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = value === n;
        return (
          <button key={n} onClick={() => { haptic(); onChange(n); }}
            style={{ height: 48, border: `1px solid ${on ? M.ink : M.line}`, background: on ? M.acc : M.paper, color: on ? M.paper : M.ink, cursor: "pointer", fontFamily: M.disp, fontWeight: 800, fontSize: 20, fontVariantNumeric: "tabular-nums", transition: "all .15s", WebkitTapHighlightColor: "transparent" }}>
            {n}
          </button>
        );
      })}
    </div>
  );
}

/* date stepper header (Hoy ‹ ›) — display-only by default */
function DDateNav({ label, sub, onPrev, onNext }) {
  const btn = (dir, fn) => (
    <button onClick={() => { haptic(); fn && fn(); }} style={{ width: 38, height: 38, border: `1px solid ${M.line}`, background: M.paper, cursor: "pointer", color: M.ink, display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
      <Icon name={dir === "l" ? "chevL" : "chevR"} color={M.ink} size={17} />
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {btn("l", onPrev)}
      <div style={{ textAlign: "center", minWidth: 150 }}>
        <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 17, textTransform: "uppercase", letterSpacing: "-0.01em", color: M.ink }}>{label}</div>
        {sub && <div style={{ fontFamily: M.mono, fontSize: 10.5, color: M.ink2, marginTop: 2 }}>{sub}</div>}
      </div>
      {btn("r", onNext)}
    </div>
  );
}

Object.assign(window, { DPanel, DField, DInput, DNumber, DSelect, DCheck, DTextarea, DSlider, DChips, DEnergy, DDateNav });

