/* ============================================================
   DESKTOP — Nutrición: date nav + macro cards + add-meal
   (Alimento / Receta / Manual) + meals of the day. Direction-A.
   Loads AFTER desktop-screens.jsx + desktop-forms.jsx.
   ============================================================ */
const { useState: useStateN } = React;

function DMacroCard({ label, value, goal, unit, hero }) {
  const pct = goal ? Math.round((value / goal) * 100) : null;
  return (
    <div style={{ border: `1px solid ${M.line}`, background: M.panel, padding: "16px 20px 18px" }}>
      <Kicker style={{ marginBottom: 12 }}>{label}</Kicker>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, fontFamily: M.disp, fontWeight: 800, fontSize: 38, lineHeight: 0.9, letterSpacing: "-0.04em", color: hero ? M.acc : M.ink, fontVariantNumeric: "tabular-nums" }}>
        {value}{goal != null && <span style={{ fontSize: 15, fontFamily: M.mono, fontWeight: 500, color: M.ink2 }}>/{goal}{unit}</span>}{goal == null && unit && <span style={{ fontSize: 15, fontFamily: M.mono, fontWeight: 500, color: M.ink2 }}>{unit}</span>}
      </div>
      {pct != null && <div style={{ fontFamily: M.mono, fontSize: 10.5, color: pct > 100 ? M.acc : M.ink2, marginTop: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>{pct}% objetivo</div>}
    </div>
  );
}

function DesktopNutricion({ t, lang, meals, setMeals }) {
  const mealKeys = ["breakfast", "lunch", "dinner", "snacks"];
  const nameK = lang === "es" ? "nameES" : "nameEN";
  const [extra, setExtra] = useStateN({});
  const [addTab, setAddTab] = useStateN("food");
  const [target, setTarget] = useStateN("breakfast");
  const [mName, setMName] = useStateN(""); const [mKcal, setMKcal] = useStateN(0);
  const [mP, setMP] = useStateN(0); const [mC, setMC] = useStateN(0); const [mF, setMF] = useStateN(0);

  const lookup = (id) => FT.app.foodById[id] || extra[id];
  const sumMeal = (ids) => (ids || []).reduce((a, id) => { const f = lookup(id); return f ? { kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f } : a; }, { kcal: 0, p: 0, c: 0, f: 0 });
  const totals = mealKeys.reduce((a, k) => { const s = sumMeal(meals[k]); return { kcal: a.kcal + s.kcal, p: a.p + s.p, c: a.c + s.c, f: a.f + s.f }; }, { kcal: 0, p: 0, c: 0, f: 0 });
  const goal = FT.kcalTarget;

  const addFood = (id) => setMeals({ ...meals, [target]: [...(meals[target] || []), id] });
  const removeFood = (mk, idx) => setMeals({ ...meals, [mk]: meals[mk].filter((_, i) => i !== idx) });
  const addManual = () => {
    if (!mName.trim()) return;
    const id = "x" + Date.now();
    setExtra({ ...extra, [id]: { nameES: mName.trim(), nameEN: mName.trim(), kcal: parseFloat(mKcal) || 0, p: parseFloat(mP) || 0, c: parseFloat(mC) || 0, f: parseFloat(mF) || 0, serv: lang === "es" ? "manual" : "manual" } });
    setMeals({ ...meals, [target]: [...(meals[target] || []), id] });
    setMName(""); setMKcal(0); setMP(0); setMC(0); setMF(0);
  };

  const mealOpts = mealKeys.map((k) => ({ id: k, label: t[k] }));

  return (
    <div>
      <DHeader kicker="FITTRACK · HOY" title={t.nutriTitle} right={<DDateNav label={t.todayWord} sub="09 / 06 / 2026" />} />
      {(() => {
        const deficit = FT.maintenance - FT.kcalAvg;
        return (
          <DInsight
            topic={lang === "es" ? "Lo más importante · Energía" : "What matters now · Energy"}
            headline={lang === "es"
              ? <span>Media de 14 días: <Hl>{nfmt(FT.kcalAvg, lang)} kcal</Hl> — déficit limpio de <Hl>~{nfmt(deficit, lang)}/día</Hl>.</span>
              : <span>14-day average: <Hl>{nfmt(FT.kcalAvg, lang)} kcal</Hl> — a clean <Hl>~{nfmt(deficit, lang)}/day</Hl> deficit.</span>}
            sub={lang === "es" ? `proteína ${FT.proteinAvg}/${FT.macros.protein.target} g · 7 de 7 días registrados` : `protein ${FT.proteinAvg}/${FT.macros.protein.target} g · 7 of 7 days logged`}
            viz={<DInsightBars />}
            metric={<DInsightMetric value={deficit} unit="kcal" label={lang === "es" ? "déficit/día" : "deficit/day"} color={M.ok} count />}
          />
        );
      })()}

      <div style={{ padding: "30px 44px 44px" }}>
        {/* macro cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 26 }}>
          <DMacroCard label={t.calories} value={totals.kcal} goal={goal} unit="" hero />
          <DMacroCard label={t.protein} value={totals.p} goal={FT.macros.protein.target} unit="g" />
          <DMacroCard label={t.carbs} value={totals.c} goal={null} unit="g" />
          <DMacroCard label={t.fat} value={totals.f} goal={null} unit="g" />
        </div>

        {/* ADD MEAL */}
        <DPanel icon="plus" title={t.addMeal}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <Segmented value={addTab} onChange={setAddTab} options={[{ id: "food", label: t.tabFood }, { id: "recipe", label: t.tabRecipe }, { id: "manual", label: t.tabManual }]} />
            <Segmented value={target} onChange={setTarget} options={mealOpts} />
          </div>
          {addTab === "food" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {FT.app.foods.map((f) => (
                <button key={f.id} onClick={() => { haptic(); addFood(f.id); }} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", border: `1px solid ${M.hair}`, background: M.paper, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 999, background: M.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="plus" color={M.paper} size={15} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: M.disp, fontWeight: 600, fontSize: 13.5 }}>{f[nameK]}</div><div style={{ fontFamily: M.mono, fontSize: 9.5, color: M.ink2 }}>{f.serv}</div></div>
                  <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{f.kcal}</div>
                </button>
              ))}
            </div>
          )}
          {addTab === "recipe" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "16px 0 6px" }}>
              <div style={{ fontFamily: M.mono, fontSize: 12.5, color: M.ink2 }}>{t.noRecipes}</div>
              <GhostBtn onClick={() => {}}><Icon name="nutri" color={M.ink} size={15} />{t.goToLibrary}</GhostBtn>
            </div>
          )}
          {addTab === "manual" && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) repeat(4,minmax(0,1fr)) auto", gap: 12, alignItems: "end" }}>
              <DField label={t.routineName}><DInput value={mName} onChange={setMName} placeholder={t.foodNamePh} /></DField>
              <DField label="KCAL"><DNumber value={mKcal} onChange={setMKcal} min={0} step={10} /></DField>
              <DField label="P"><DNumber value={mP} onChange={setMP} min={0} step={1} /></DField>
              <DField label="C"><DNumber value={mC} onChange={setMC} min={0} step={1} /></DField>
              <DField label="G"><DNumber value={mF} onChange={setMF} min={0} step={1} /></DField>
              <button onClick={addManual} style={{ width: 50, height: 46, border: "none", background: M.acc, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" color={M.paper} size={18} /></button>
            </div>
          )}
        </DPanel>

        {/* MEALS OF THE DAY */}
        <h2 style={{ ...DSecH, marginBottom: 16 }}>{t.mealsOfDay}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {mealKeys.map((mk) => {
            const ids = meals[mk] || []; const s = sumMeal(ids);
            return (
              <div key={mk} style={{ border: `1px solid ${M.line}`, background: M.panel, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "15px 18px 11px", borderBottom: `1px solid ${M.hair}` }}>
                  <h3 style={{ ...DSecH, fontSize: 18 }}>{t[mk]}</h3><span style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2 }}>{s.kcal} {t.kcal}</span>
                </div>
                <div style={{ padding: "4px 18px", flex: 1 }}>
                  {ids.length === 0 && <div style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2, padding: "12px 0", opacity: 0.7 }}>{t.emptyMeal}</div>}
                  {ids.map((id, idx) => { const f = lookup(id); if (!f) return null; return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${M.hair}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: M.disp, fontWeight: 600, fontSize: 14 }}>{f[nameK]}</div><div style={{ fontFamily: M.mono, fontSize: 9.5, color: M.ink2, marginTop: 1 }}>{f.serv} · P{f.p} C{f.c} G{f.f}</div></div>
                      <div style={{ fontFamily: M.disp, fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{f.kcal}</div>
                      <button onClick={() => removeFood(mk, idx)} style={{ width: 26, height: 26, border: "none", background: "transparent", cursor: "pointer", color: M.ink2, fontFamily: M.disp, fontSize: 15 }}>✕</button>
                    </div>
                  ); })}
                </div>
                <div style={{ padding: "10px 18px 16px" }}><GhostBtn onClick={() => { setTarget(mk); setAddTab("food"); }} style={{ width: "100%" }}><Icon name="plus" color={M.ink} size={15} />{t.addFood}</GhostBtn></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DesktopNutricion });
