import { useState, useEffect } from "react";
import { M, Kicker, PrimaryBtn, Icon, Stepper, Sheet } from "../kit.jsx";
import { haptic } from "../kit.jsx";

function fmtClock(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const restBtn = { height: 32, padding: "0 12px", border: "1px solid rgba(243,239,230,0.3)", background: "transparent", color: M.paper, cursor: "pointer", fontFamily: M.mono, fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", WebkitTapHighlightColor: "transparent" };

export function ScreenWorkout({ t, lang, session, setSession, onClose, onFinish, appData }) {
  const r = appData.routines.find((x) => x.id === session.routineId);
  const name = lang === "es" ? r.nameES : r.nameEN;
  const order = r.exercises.map((e) => e.key);

  const firstIncomplete = order.find((k) => session.log[k].some((s) => !s.done)) || order[0];
  const [activeEx, setActiveEx] = useState(firstIncomplete);
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - session.startedAt) / 1000));
  const [rest, setRest] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [showFinish, setShowFinish] = useState(false);

  useEffect(() => { const id = setInterval(() => setElapsed((e) => e + 1), 1000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (rest <= 0) return;
    const id = setInterval(() => setRest((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(id);
  }, [rest > 0]);

  const patchSet = (exKey, idx, patch) => {
    setSession((s) => {
      const log = { ...s.log, [exKey]: s.log[exKey].map((set, i) => i === idx ? { ...set, ...patch } : set) };
      return { ...s, log };
    });
  };
  const addSet = (exKey) => setSession((s) => {
    const arr = s.log[exKey]; const last = arr[arr.length - 1];
    return { ...s, log: { ...s.log, [exKey]: [...arr, { reps: last.reps, kg: last.kg, done: false }] } };
  });

  const logSet = (exKey, idx) => {
    haptic();
    patchSet(exKey, idx, { done: true });
    const restSec = ["deadlift","squat","bench","ohp","row","rdl"].includes(exKey) ? 150 : 90;
    setRest(restSec); setRestTotal(restSec);
    setTimeout(() => {
      const arr = session.log[exKey];
      const stillLeft = arr.some((s, i) => i !== idx && !s.done);
      if (!stillLeft) {
        const next = order.find((k) => k !== exKey && session.log[k].some((s) => !s.done));
        if (next) setActiveEx(next);
      }
    }, 250);
  };

  let totalSets = 0, doneSets = 0, vol = 0;
  order.forEach((k) => session.log[k].forEach((s) => { totalSets++; if (s.done) { doneSets++; vol += s.kg * s.reps; } }));
  const progress = totalSets ? doneSets / totalSets : 0;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 70, background: M.paper, display: "flex", flexDirection: "column", fontFamily: M.disp }}>
      <div style={{ paddingTop: M.topPad - 6, background: M.ink, color: M.paper, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px 14px" }}>
          <button onClick={onClose} style={{ width: 38, height: 38, border: "1px solid rgba(243,239,230,0.25)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
            <Icon name="chevL" color={M.paper} size={20} />
          </button>
          <div style={{ textAlign: "center" }}>
            <Kicker color="rgba(243,239,230,0.55)">{name}</Kicker>
            <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", marginTop: 2 }}>{fmtClock(elapsed)}</div>
          </div>
          <button onClick={() => setShowFinish(true)} style={{ height: 38, padding: "0 14px", border: "none", background: M.acc, color: M.paper, cursor: "pointer", fontFamily: M.mono, fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", WebkitTapHighlightColor: "transparent" }}>{t.finish}</button>
        </div>
        <div style={{ height: 3, background: "rgba(243,239,230,0.2)" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: M.acc, transition: "width .4s ease" }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: rest > 0 ? 150 : 90 }}>
        {order.map((exKey) => {
          const sets = session.log[exKey];
          const exDone = sets.filter((s) => s.done).length;
          const isOpen = activeEx === exKey;
          const allDone = exDone === sets.length;
          const target = r.exercises.find((e) => e.key === exKey);
          return (
            <div key={exKey} style={{ borderBottom: `1px solid ${M.line}` }}>
              <div onClick={() => setActiveEx(isOpen ? null : exKey)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", background: isOpen ? M.panel : M.paper }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  {allDone
                    ? <div style={{ width: 26, height: 26, borderRadius: 999, background: M.ok, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="check" color={M.paper} size={16} /></div>
                    : <div style={{ width: 26, height: 26, borderRadius: 999, border: `2px solid ${M.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: M.mono, fontSize: 11, color: M.ink2, fontWeight: 600 }}>{exDone}</div>}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 18, lineHeight: 1.04, textTransform: "uppercase", letterSpacing: "-0.02em", color: allDone ? M.ink2 : M.ink }}>{t.exercises[exKey]}</div>
                    <div style={{ fontFamily: M.mono, fontSize: 10.5, color: M.ink2, marginTop: 3 }}>{target.sets}×{target.reps} · {target.kg}kg {t.target}</div>
                  </div>
                </div>
                <Icon name={isOpen ? "chevL" : "chevR"} color={M.ink2} size={18} />
              </div>

              {isOpen && (
                <div style={{ padding: "4px 20px 20px", background: M.panel }}>
                  {sets.map((set, idx) => {
                    const isCurrent = !set.done && sets.slice(0, idx).every((s) => s.done);
                    if (set.done) {
                      return (
                        <div key={idx} onClick={() => patchSet(exKey, idx, { done: false })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${M.hair}`, cursor: "pointer" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 999, background: M.acc, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" color={M.paper} size={14} /></div>
                            <Kicker>{t.setN(idx + 1)}</Kicker>
                          </div>
                          <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 19, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{set.kg}<span style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2 }}>kg</span> × {set.reps}</div>
                        </div>
                      );
                    }
                    if (isCurrent) {
                      return (
                        <div key={idx} style={{ padding: "14px 0 4px", borderBottom: `1px solid ${M.hair}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                            <Kicker color={M.acc}>{t.setN(idx + 1)}</Kicker>
                            <span style={{ fontFamily: M.mono, fontSize: 10, color: M.ink2 }}>{t.prev}: {target.kg}kg × {target.reps}</span>
                          </div>
                          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                            <div style={{ flex: 1 }}>
                              <Kicker style={{ marginBottom: 7 }}>{t.kg}</Kicker>
                              <Stepper value={set.kg} step={2.5} onChange={(v) => patchSet(exKey, idx, { kg: v })} w={62} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <Kicker style={{ marginBottom: 7 }}>{t.reps}</Kicker>
                              <Stepper value={set.reps} step={1} onChange={(v) => patchSet(exKey, idx, { reps: v })} w={62} />
                            </div>
                          </div>
                          <PrimaryBtn tone="acc" onClick={() => logSet(exKey, idx)}><Icon name="check" color={M.paper} size={18} />{t.logSet}</PrimaryBtn>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${M.hair}`, opacity: 0.5 }}>
                        <Kicker>{t.setN(idx + 1)}</Kicker>
                        <div style={{ fontFamily: M.disp, fontWeight: 700, fontSize: 17, color: M.ink2 }}>{set.kg}<span style={{ fontFamily: M.mono, fontSize: 10 }}>kg</span> × {set.reps}</div>
                      </div>
                    );
                  })}
                  <button onClick={() => addSet(exKey)} style={{ marginTop: 14, width: "100%", height: 42, border: `1px dashed ${M.line}`, background: "transparent", cursor: "pointer", fontFamily: M.mono, fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: M.ink2, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, WebkitTapHighlightColor: "transparent" }}>
                    <Icon name="plus" color={M.ink2} size={15} />{t.addSet}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {rest > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5, background: M.ink, color: M.paper, padding: "14px 20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="clock" color={M.acc} size={18} />
              <Kicker color="rgba(243,239,230,0.6)">{t.restTimer}</Kicker>
              <span style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums" }}>{fmtClock(rest)}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { haptic(); setRest((x) => x + 15); setRestTotal((x) => x + 15); }} style={restBtn}>+15s</button>
              <button onClick={() => { haptic(); setRest(0); }} style={restBtn}>{t.skipRest}</button>
            </div>
          </div>
          <div style={{ height: 3, background: "rgba(243,239,230,0.2)" }}>
            <div style={{ height: "100%", width: `${(rest / restTotal) * 100}%`, background: M.acc, transition: "width 1s linear" }} />
          </div>
        </div>
      )}

      <Sheet open={showFinish} onClose={() => setShowFinish(false)} title={t.workoutDone}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: M.line, border: `1px solid ${M.line}`, marginBottom: 20 }}>
          {[
            { v: fmtClock(elapsed), k: t.duration },
            { v: (vol / 1000).toFixed(1) + "t", k: t.totalVol },
            { v: `${doneSets}/${totalSets}`, k: t.sets },
          ].map((s, i) => (
            <div key={i} style={{ background: M.paper, padding: "16px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 24, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>{s.v}</div>
              <Kicker style={{ marginTop: 5 }}>{s.k}</Kicker>
            </div>
          ))}
        </div>
        <PrimaryBtn tone="ink" onClick={onFinish}><Icon name="check" color={M.paper} size={18} />{t.done}</PrimaryBtn>
      </Sheet>
    </div>
  );
}
