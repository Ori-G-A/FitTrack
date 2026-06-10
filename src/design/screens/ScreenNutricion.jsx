import { useState } from "react";
import { useReveal, Rise } from "../shared.jsx";
import { M, Kicker, TopBar, ScreenScroll, Icon, Ring, MacroBar, GhostBtn, Sheet } from "../kit.jsx";
import { MInsight, MInsightBars, MInsightMetric, MHl, mnfmt } from "../insight.jsx";
import { FT } from "../data.js";

const sectionH = { margin: 0, fontFamily: M.disp, fontWeight: 800, fontSize: 22, textTransform: "uppercase", letterSpacing: "-0.02em", color: M.ink };

function sumMeal(ids, foodById) {
  return ids.reduce((a, id) => {
    const f = foodById[id];
    if (!f) return a;
    return { kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f };
  }, { kcal: 0, p: 0, c: 0, f: 0 });
}

export function ScreenNutricion({ t, lang, meals, setMeals, appData }) {
  const show = useReveal(40);
  const [addFor, setAddFor] = useState(null);

  const mealKeys = ["breakfast","lunch","dinner","snacks"];
  const totals = mealKeys.reduce((a, k) => {
    const s = sumMeal(meals[k] || [], appData.foodById);
    return { kcal: a.kcal + s.kcal, p: a.p + s.p, c: a.c + s.c, f: a.f + s.f };
  }, { kcal: 0, p: 0, c: 0, f: 0 });

  const goal = FT.kcalTarget;
  const remaining = goal - totals.kcal;
  const name = lang === "es" ? "nameES" : "nameEN";

  const addFood = (id) => { setMeals({ ...meals, [addFor]: [...(meals[addFor] || []), id] }); };
  const removeFood = (mealKey, idx) => { setMeals({ ...meals, [mealKey]: meals[mealKey].filter((_, i) => i !== idx) }); };

  return (
    <ScreenScroll>
      <TopBar kicker="FITTRACK · HOY" title={t.nutriTitle} />

      {(() => {
        const deficit = FT.maintenance - FT.kcalAvg;
        return (
          <MInsight
            topic={lang === "es" ? "Lo más importante · Energía" : "What matters now · Energy"}
            headline={lang === "es"
              ? <span>Media de 14 días: <MHl>{mnfmt(FT.kcalAvg, lang)} kcal</MHl>, déficit limpio de <MHl>~{mnfmt(deficit, lang)}/día</MHl>.</span>
              : <span>14-day average: <MHl>{mnfmt(FT.kcalAvg, lang)} kcal</MHl>, a clean <MHl>~{mnfmt(deficit, lang)}/day</MHl> deficit.</span>}
            sub={lang === "es" ? `proteína ${FT.proteinAvg}/${FT.macros.protein.target} g · 7 de 7 días registrados` : `protein ${FT.proteinAvg}/${FT.macros.protein.target} g · 7 of 7 days logged`}
            viz={<MInsightBars />}
            metric={<MInsightMetric value={deficit} unit="kcal" label={lang === "es" ? "déficit/día" : "deficit/day"} color={M.ok} count />}
          />
        );
      })()}

      <Rise show={show} i={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "20px 20px 22px", borderTop: `1px solid ${M.line}`, borderBottom: `1px solid ${M.line}`, marginTop: 6 }}>
          <Ring value={totals.kcal} max={goal} size={128} stroke={13} color={remaining < 0 ? M.acc : M.ink}>
            <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 30, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: remaining < 0 ? M.acc : M.ink }}>{Math.abs(remaining)}</div>
            <Kicker style={{ marginTop: 4 }}>{remaining < 0 ? "+kcal" : t.remaining}</Kicker>
          </Ring>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div><Kicker>{t.eaten}</Kicker><div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums" }}>{totals.kcal}</div></div>
              <div style={{ textAlign: "right" }}><Kicker>{t.goalKcal}</Kicker><div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums", color: M.ink2 }}>{goal}</div></div>
            </div>
            {[
              { label: t.protein, v: totals.p, tg: FT.macros.protein.target, hero: true },
              { label: t.carbs, v: totals.c, tg: FT.macros.carbs.target },
              { label: t.fat, v: totals.f, tg: FT.macros.fat.target },
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? 10 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Kicker>{r.label}</Kicker>
                  <span style={{ fontFamily: M.mono, fontSize: 10.5, color: M.ink }}>{r.v}/{r.tg}g</span>
                </div>
                <MacroBar value={r.v} target={r.tg} hero={r.hero} />
              </div>
            ))}
          </div>
        </div>
      </Rise>

      {mealKeys.map((mk, i) => {
        const ids = meals[mk] || [];
        const s = sumMeal(ids, appData.foodById);
        return (
          <Rise key={mk} show={show} i={1 + i}>
            <div style={{ borderBottom: `1px solid ${M.line}` }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "16px 20px 10px" }}>
                <h2 style={{ ...sectionH, fontSize: 20 }}>{t[mk]}</h2>
                <span style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2 }}>{s.kcal} {t.kcal}</span>
              </div>
              <div style={{ padding: "0 20px" }}>
                {ids.length === 0 && <div style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2, padding: "4px 0 12px", opacity: 0.7 }}>{t.emptyMeal}</div>}
                {ids.map((id, idx) => {
                  const f = appData.foodById[id];
                  if (!f) return null;
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: `1px solid ${M.hair}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: M.disp, fontWeight: 600, fontSize: 15, color: M.ink }}>{f[name]}</div>
                        <div style={{ fontFamily: M.mono, fontSize: 10, color: M.ink2, marginTop: 2 }}>{f.serv} · P{f.p} C{f.c} G{f.f}</div>
                      </div>
                      <div style={{ fontFamily: M.disp, fontWeight: 700, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>{f.kcal}</div>
                      <button onClick={() => removeFood(mk, idx)} style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: M.ink2, fontFamily: M.disp, fontSize: 16, WebkitTapHighlightColor: "transparent" }}>✕</button>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "8px 20px 16px" }}>
                <GhostBtn onClick={() => setAddFor(mk)} style={{ width: "100%" }}><Icon name="plus" color={M.ink} size={15} />{t.addFood}</GhostBtn>
              </div>
            </div>
          </Rise>
        );
      })}

      <Sheet open={!!addFor} onClose={() => setAddFor(null)} title={addFor ? t[addFor] : ""}>
        <Kicker style={{ marginBottom: 12 }}>{t.quickAdd}</Kicker>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {appData.foods.map((f) => (
            <button key={f.id} onClick={() => { addFood(f.id); setAddFor(null); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", border: "none", borderTop: `1px solid ${M.hair}`, background: "transparent", cursor: "pointer", textAlign: "left", WebkitTapHighlightColor: "transparent" }}>
              <div style={{ width: 30, height: 30, borderRadius: 999, background: M.ink, color: M.paper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="plus" color={M.paper} size={16} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: M.disp, fontWeight: 600, fontSize: 15, color: M.ink }}>{f[name]}</div>
                <div style={{ fontFamily: M.mono, fontSize: 10, color: M.ink2, marginTop: 2 }}>{f.serv} · P{f.p} C{f.c} G{f.f}</div>
              </div>
              <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 17, fontVariantNumeric: "tabular-nums" }}>{f.kcal}<span style={{ fontFamily: M.mono, fontSize: 9, color: M.ink2, marginLeft: 2 }}>{t.kcal}</span></div>
            </button>
          ))}
        </div>
      </Sheet>
    </ScreenScroll>
  );
}
