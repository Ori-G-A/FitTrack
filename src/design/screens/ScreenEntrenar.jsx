import { useState } from "react";
import { useReveal, Rise } from "../shared.jsx";
import { M, Kicker, TopBar, ScreenScroll, Icon, Segmented } from "../kit.jsx";
import { MInsight, MInsightSpark, MInsightMetric, MHl } from "../insight.jsx";
import { FT } from "../data.js";

export function fmtDay(iso, lang) {
  const d = new Date(iso + "T00:00:00");
  const days = lang === "es" ? ["dom","lun","mar","mié","jue","vie","sáb"] : ["sun","mon","tue","wed","thu","fri","sat"];
  const today = new Date("2026-06-09T00:00:00");
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return lang === "es" ? "hoy" : "today";
  if (diff === 1) return lang === "es" ? "ayer" : "yesterday";
  return `${days[d.getDay()]} ${d.getDate()}`;
}

export function ScreenEntrenar({ t, lang, startWorkout, hasSession, resumeWorkout, appData }) {
  const show = useReveal(40);
  const [view, setView] = useState("rutinas");

  const order = ["push", "pull", "legs"];
  const last = appData.history[0] && appData.history[0].routine;
  const idx = order.indexOf(last);
  const nextId = order[(idx + 1) % order.length];

  return (
    <ScreenScroll>
      <TopBar kicker="FITTRACK" title={t.tabTrain} />

      {(() => {
        const dl = FT.strength.deadlift;
        const last = dl[dl.length - 1];
        const gain = Math.round((last / dl[0] - 1) * 100);
        const delta = last - dl[0];
        return (
          <MInsight
            topic={lang === "es" ? "Lo más importante · Fuerza" : "What matters now · Strength"}
            headline={lang === "es"
              ? <span>Peso muerto: de {dl[0]} a <MHl>{last} kg</MHl>, <MHl>+{gain}%</MHl> de 1RM estimado.</span>
              : <span>Deadlift: from {dl[0]} to <MHl>{last} kg</MHl>, <MHl>+{gain}%</MHl> estimated 1RM.</span>}
            sub={lang === "es" ? `+${delta} kg · la sobrecarga progresiva está funcionando` : `+${delta} kg · progressive overload is working`}
            viz={<MInsightSpark series={dl} />}
            metric={<MInsightMetric value={gain} unit="%" sign label={lang === "es" ? "vs inicio" : "vs start"} color={M.acc} count />}
          />
        );
      })()}

      <div style={{ padding: "18px 20px 16px" }}>
        {hasSession && (
          <Rise show={show} i={0}>
            <div onClick={resumeWorkout} style={{ background: M.acc, color: M.paper, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <Icon name="clock" color={M.paper} size={20} />
                <span style={{ fontFamily: M.mono, fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>{t.continueWorkout}</span>
              </div>
              <Icon name="chevR" color={M.paper} size={20} />
            </div>
          </Rise>
        )}
        <Rise show={show} i={1}>
          <Segmented value={view} onChange={setView} options={[{ id: "rutinas", label: t.routinesTitle }, { id: "historial", label: t.historyTitle }]} />
        </Rise>
      </div>

      {view === "rutinas" ? (
        <div style={{ borderTop: `1px solid ${M.line}` }}>
          {appData.routines.map((r, i) => {
            const name = lang === "es" ? r.nameES : r.nameEN;
            const isNext = r.id === nextId && !hasSession;
            return (
              <Rise key={r.id} show={show} i={2 + i}>
                <div onClick={() => startWorkout(r.id)}
                  style={{ display: "flex", alignItems: "stretch", borderBottom: `1px solid ${M.line}`, cursor: "pointer", background: M.paper }}>
                  <div style={{ width: 76, flexShrink: 0, borderRight: `1px solid ${M.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: M.disp, fontWeight: 900, fontSize: 46, color: isNext ? M.acc : M.ink, letterSpacing: "-0.04em" }}>
                    {r.split}
                  </div>
                  <div style={{ flex: 1, padding: "18px 18px", minWidth: 0 }}>
                    {isNext && <Kicker color={M.acc} style={{ marginBottom: 5 }}>{t.nextUp}</Kicker>}
                    <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 26, textTransform: "uppercase", letterSpacing: "-0.025em", color: M.ink }}>{name}</div>
                    <div style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2, marginTop: 6 }}>
                      {r.exercises.map((e) => t.exercises[e.key]).slice(0, 3).join(" · ")}…
                    </div>
                  </div>
                  <div style={{ width: 54, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 999, background: isNext ? M.acc : M.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="chevR" color={M.paper} size={20} />
                    </div>
                  </div>
                </div>
              </Rise>
            );
          })}
        </div>
      ) : (
        <div style={{ borderTop: `1px solid ${M.line}` }}>
          {appData.history.map((h, i) => {
            const r = appData.routines.find((x) => x.id === h.routine);
            const name = lang === "es" ? r.nameES : r.nameEN;
            return (
              <Rise key={i} show={show} i={2 + i}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${M.line}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 21, textTransform: "uppercase", letterSpacing: "-0.02em" }}>{name}</div>
                    <div style={{ fontFamily: M.mono, fontSize: 10.5, color: M.ink2, textTransform: "uppercase", letterSpacing: ".06em" }}>{fmtDay(h.iso, lang)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 22, marginTop: 10 }}>
                    {[
                      { v: h.min, u: t.min, k: t.duration },
                      { v: (h.vol / 1000).toFixed(1) + "t", u: "", k: t.volume },
                      { v: h.sets, u: "", k: t.sets },
                    ].map((s, j) => (
                      <div key={j}>
                        <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>{s.v}<span style={{ fontFamily: M.mono, fontSize: 11, fontWeight: 500, color: M.ink2, marginLeft: 2 }}>{s.u}</span></div>
                        <Kicker style={{ marginTop: 3 }}>{s.k}</Kicker>
                      </div>
                    ))}
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <div style={{ fontFamily: M.mono, fontSize: 10, color: M.ink2, textTransform: "uppercase", letterSpacing: ".06em" }}>{t.exercises[h.top.key]}</div>
                      <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 18, marginTop: 2 }}>{h.top.kg}<span style={{ fontFamily: M.mono, fontSize: 10, color: M.ink2 }}>kg×{h.top.reps}</span></div>
                    </div>
                  </div>
                </div>
              </Rise>
            );
          })}
        </div>
      )}
    </ScreenScroll>
  );
}
