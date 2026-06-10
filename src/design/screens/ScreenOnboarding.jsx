import { useState } from "react";
import { M, Kicker, Icon, PrimaryBtn, Stepper, haptic } from "../kit.jsx";
import { LangSwitch } from "../shared.jsx";

function OptionCard({ on, onClick, title, sub }) {
  return (
    <button onClick={() => { haptic(); onClick(); }}
      style={{ width: "100%", textAlign: "left", padding: "18px 20px", border: `1.5px solid ${on ? M.ink : M.line}`, background: on ? M.ink : M.panel, color: on ? M.paper : M.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all .15s", WebkitTapHighlightColor: "transparent" }}>
      <div>
        <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 22, textTransform: "uppercase", letterSpacing: "-0.02em" }}>{title}</div>
        {sub && <div style={{ fontFamily: M.mono, fontSize: 11, color: on ? "rgba(243,239,230,0.6)" : M.ink2, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid ${on ? M.acc : M.line}`, background: on ? M.acc : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {on && <Icon name="check" color={M.paper} size={13} />}
      </div>
    </button>
  );
}

const obQ = { margin: 0, fontFamily: M.disp, fontWeight: 900, fontSize: 38, lineHeight: 0.92, letterSpacing: "-0.04em", textTransform: "uppercase", color: M.ink };

export function ScreenOnboarding({ t, lang, setLang, profile, setProfile, onDone }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ ...profile });
  const TOTAL = 4;

  const next = () => { haptic(); if (step < TOTAL) setStep(step + 1); else finish(); };
  const finish = () => { setProfile(d); onDone(); };

  if (step === 0) {
    return (
      <div style={{ position: "absolute", inset: 0, background: M.ink, color: M.paper, display: "flex", flexDirection: "column", fontFamily: M.disp, padding: "0 28px" }}>
        <div style={{ position: "absolute", top: M.topPad - 6, right: 20 }}>
          <LangSwitch lang={lang} setLang={setLang} bg="transparent" fg="rgba(243,239,230,0.55)" active={M.acc} activeFg={M.paper} border="rgba(243,239,230,0.25)" />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Kicker color="rgba(243,239,230,0.55)" style={{ marginBottom: 16 }}>{t.welcome}</Kicker>
          <h1 style={{ margin: 0, fontFamily: M.disp, fontWeight: 900, fontSize: 76, lineHeight: 0.84, letterSpacing: "-0.05em", textTransform: "uppercase" }}>Fit<br />Track</h1>
          <div style={{ width: 48, height: 4, background: M.acc, margin: "26px 0 18px" }} />
          <p style={{ margin: 0, fontFamily: M.mono, fontSize: 13, lineHeight: 1.6, color: "rgba(243,239,230,0.7)", maxWidth: 300 }}>{t.obStart}</p>
        </div>
        <div style={{ paddingBottom: 40 }}>
          <PrimaryBtn tone="acc" onClick={next}>{t.start}<Icon name="arrowR" color={M.paper} size={18} /></PrimaryBtn>
        </div>
      </div>
    );
  }

  const canNext = step === 1 ? d.name.trim().length > 0 : true;

  return (
    <div style={{ position: "absolute", inset: 0, background: M.paper, color: M.ink, display: "flex", flexDirection: "column", fontFamily: M.disp }}>
      <div style={{ paddingTop: M.topPad - 6, padding: `${M.topPad - 6}px 20px 0` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setStep(step - 1)} style={{ width: 38, height: 38, border: `1px solid ${M.line}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent", flexShrink: 0 }}>
            <Icon name="chevL" color={M.ink} size={18} />
          </button>
          <div style={{ flex: 1, display: "flex", gap: 5 }}>
            {Array.from({ length: TOTAL }, (_, i) => (
              <div key={i} style={{ flex: 1, height: 4, background: i < step ? M.acc : M.hair }} />
            ))}
          </div>
        </div>
        <Kicker style={{ marginTop: 18 }}>{t.step(step, TOTAL)}</Kicker>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px" }}>
        {step === 1 && (
          <div>
            <h1 style={obQ}>{t.obName}</h1>
            <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} autoFocus
              style={{ width: "100%", marginTop: 26, padding: "14px 0", border: "none", borderBottom: `2px solid ${M.ink}`, background: "transparent", fontFamily: M.disp, fontWeight: 800, fontSize: 34, color: M.ink, outline: "none", letterSpacing: "-0.02em", boxSizing: "border-box" }} />
          </div>
        )}
        {step === 2 && (
          <div>
            <h1 style={obQ}>{t.obGoalQ}</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 26 }}>
              {[{ id: "cut", title: t.goalCut.split(" ")[0], sub: t.goalCut }, { id: "maintain", title: t.goalMaintain }, { id: "bulk", title: t.goalBulk }].map((o) => (
                <OptionCard key={o.id} on={d.goal === o.id} onClick={() => setD({ ...d, goal: o.id })} title={o.title} sub={o.sub !== o.title ? o.sub : null} />
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h1 style={obQ}>{t.obBodyQ}</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 28 }}>
              <div><Kicker style={{ marginBottom: 11 }}>{t.obWeightNow}</Kicker><Stepper value={d.startKg} step={0.1} min={30} onChange={(v) => setD({ ...d, startKg: v })} suffix="kg" w={120} /></div>
              <div><Kicker style={{ marginBottom: 11 }}>{t.obWeightGoal}</Kicker><Stepper value={d.goalKg} step={0.5} min={40} onChange={(v) => setD({ ...d, goalKg: v })} suffix="kg" w={120} /></div>
              <div><Kicker style={{ marginBottom: 11 }}>{t.height}</Kicker><Stepper value={d.heightCm} step={1} min={120} onChange={(v) => setD({ ...d, heightCm: v })} suffix="cm" w={120} /></div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <h1 style={obQ}>{t.obDaysQ}</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 26 }}>
              {[3, 4, 5, 6].map((n) => (
                <OptionCard key={n} on={d.trainDaysGoal === n} onClick={() => setD({ ...d, trainDaysGoal: n })} title={`${n} ${t.daysWeek}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 20px 40px", borderTop: `1px solid ${M.hair}` }}>
        <PrimaryBtn tone={step === TOTAL ? "acc" : "ink"} disabled={!canNext} onClick={next}>
          {step === TOTAL ? t.getStarted : t.next}
          {step < TOTAL && <Icon name="arrowR" color={M.paper} size={18} />}
        </PrimaryBtn>
      </div>
    </div>
  );
}
