/* ============================================================
   DESKTOP — Biblioteca: Mis alimentos / Catálogo / Recetas
   Food library collectors, Direction-A editorial style.
   Loads AFTER desktop-screens.jsx + desktop-forms.jsx.
   ============================================================ */
const { useState: useStateL } = React;

function DLibTab({ id, label, count, active, onClick }) {
  return (
    <button onClick={() => { haptic(); onClick(id); }}
      style={{ height: 40, padding: "0 18px", border: `1px solid ${active ? M.ink : M.line}`, background: active ? M.ink : "transparent", color: active ? M.paper : M.ink2, cursor: "pointer", fontFamily: M.mono, fontSize: 11.5, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 7, WebkitTapHighlightColor: "transparent" }}>
      {label}{count != null && <span style={{ opacity: 0.6 }}>({count})</span>}
    </button>
  );
}

function DCatRow({ f, lang, onAdd }) {
  const nm = lang === "es" ? f.nameES : f.nameEN;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderTop: `1px solid ${M.hair}` }}>
      <div style={{ flex: 1, minWidth: 0, fontFamily: M.disp, fontWeight: 600, fontSize: 15 }}>{nm}</div>
      <div style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2, whiteSpace: "nowrap" }}>
        {f.kcal} kcal · P {f.p} · C {f.c} · G {f.f}
      </div>
      <button onClick={() => { haptic(); onAdd(f); }} style={{ width: 38, height: 38, border: "none", background: M.acc, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="plus" color={M.paper} size={18} />
      </button>
    </div>
  );
}

function DesktopBiblioteca({ t, lang }) {
  const [tab, setTab] = useStateL("cat");
  const [myFoods, setMyFoods] = useStateL([]);
  const [recipes] = useStateL([]);
  // add-food form
  const [fName, setFName] = useStateL("");
  const [fKcal, setFKcal] = useStateL(0);
  const [fP, setFP] = useStateL(0);
  const [fC, setFC] = useStateL(0);
  const [fF, setFF] = useStateL(0);
  // catalog filter
  const [cat, setCat] = useStateL("all");
  const [q, setQ] = useStateL("");

  const catOpts = [{ id: "all", label: t.allCats }, ...FTD.foodCats.map((k) => ({ id: k, label: t.catNames[k] }))];
  const filtered = FTD.catalog.filter((f) => (cat === "all" || f.cat === cat) && (q.trim() === "" || (lang === "es" ? f.nameES : f.nameEN).toLowerCase().includes(q.trim().toLowerCase())));
  const addFromCat = (f) => setMyFoods((m) => m.find((x) => x.id === f.id) ? m : [...m, { id: f.id, name: lang === "es" ? f.nameES : f.nameEN, kcal: f.kcal, p: f.p, c: f.c, f: f.f }]);
  const addManual = () => {
    if (!fName.trim()) return;
    setMyFoods([...myFoods, { id: "m" + Date.now(), name: fName.trim(), kcal: parseFloat(fKcal) || 0, p: parseFloat(fP) || 0, c: parseFloat(fC) || 0, f: parseFloat(fF) || 0 }]);
    setFName(""); setFKcal(0); setFP(0); setFC(0); setFF(0);
  };

  return (
    <div>
      <DHeader kicker="FITTRACK · BIBLIOTECA" title={t.tabLibrary} />
      <DInsight
        topic={lang === "es" ? "Lo más importante · Tu despensa" : "What matters now · Your pantry"}
        headline={lang === "es"
          ? <span><Hl>{FTD.catalog.length} alimentos</Hl> de referencia listos; guarda los tuyos y combínalos en recetas para registrar de un toque.</span>
          : <span><Hl>{FTD.catalog.length} reference foods</Hl> ready; save your own and combine them into recipes to log with one tap.</span>}
        sub={lang === "es" ? "valores por 100 g · carnes en crudo, granos cocidos" : "values per 100 g · meats raw, grains cooked"}
        metric={<DInsightMetric value={myFoods.length} label={lang === "es" ? "tuyos guardados" : "of yours saved"} color={myFoods.length ? M.ink : M.ink2} />}
      />
      <div style={{ padding: "26px 44px 44px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <DLibTab id="mis" label={t.myFoods} count={myFoods.length} active={tab === "mis"} onClick={setTab} />
          <DLibTab id="cat" label={t.catalogTab} active={tab === "cat"} onClick={setTab} />
          <DLibTab id="rec" label={t.recipesTab} count={recipes.length} active={tab === "rec"} onClick={setTab} />
        </div>

        {tab === "mis" && (
          <div>
            <DPanel icon="plus" title={t.addFoodTitle} right={<span style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2 }}>{t.per100}</span>}>
              <DField label={t.routineName} style={{ marginBottom: 16 }}><DInput value={fName} onChange={setFName} placeholder={t.foodNamePh} /></DField>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr)) auto", gap: 14, alignItems: "end" }}>
                <DField label="KCAL/100G"><DNumber value={fKcal} onChange={setFKcal} min={0} step={10} /></DField>
                <DField label="PROT/100G"><DNumber value={fP} onChange={setFP} min={0} step={1} /></DField>
                <DField label="CARB/100G"><DNumber value={fC} onChange={setFC} min={0} step={1} /></DField>
                <DField label="GRASA/100G"><DNumber value={fF} onChange={setFF} min={0} step={1} /></DField>
                <PrimaryBtn tone="acc" onClick={addManual} style={{ width: "auto", padding: "0 22px", height: 46 }}><Icon name="plus" color={M.paper} size={16} />{t.add}</PrimaryBtn>
              </div>
            </DPanel>
            <DPanel icon="nutri" title={t.myFoods} right={<span style={{ fontFamily: M.mono, fontSize: 12, color: M.ink2 }}>{myFoods.length}</span>}>
              {myFoods.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "16px 0 8px" }}>
                  <div style={{ fontFamily: M.mono, fontSize: 12.5, color: M.ink2 }}>{t.noMyFoods}</div>
                  <GhostBtn onClick={() => setTab("cat")}><Icon name="nutri" color={M.ink} size={15} />{t.loadFromCatalog}</GhostBtn>
                </div>
              ) : myFoods.map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: `1px solid ${M.hair}` }}>
                  <div style={{ flex: 1, fontFamily: M.disp, fontWeight: 600, fontSize: 15 }}>{f.name}</div>
                  <div style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2 }}>{f.kcal} kcal · P {f.p} · C {f.c} · G {f.f}</div>
                  <button onClick={() => setMyFoods(myFoods.filter((x) => x.id !== f.id))} style={{ width: 30, height: 30, border: `1px solid ${M.line}`, background: "transparent", cursor: "pointer", color: M.ink2, fontSize: 13 }}>✕</button>
                </div>
              ))}
            </DPanel>
          </div>
        )}

        {tab === "cat" && (
          <div>
            <div style={{ display: "flex", gap: 14, border: `1px solid ${M.line}`, background: M.panel, padding: "18px 22px", marginBottom: 22 }}>
              <div style={{ width: 22, height: 22, flexShrink: 0, border: `1.5px solid ${M.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="nutri" color={M.ink} size={13} /></div>
              <div>
                <Kicker style={{ marginBottom: 6 }}>{t.catalogTitle} · {FTD.catalog.length} {t.foodsWord}</Kicker>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: M.ink2, maxWidth: 760 }}>{t.catalogBody}</div>
              </div>
            </div>
            <DPanel icon="nutri" title={t.catalogTab}
              right={<button onClick={() => filtered.forEach(addFromCat)} style={{ height: 36, padding: "0 14px", border: `1px solid ${M.line}`, background: "transparent", cursor: "pointer", fontFamily: M.mono, fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: M.ink, display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="plus" color={M.ink} size={13} />{t.addAll} ({filtered.length})</button>}>
              <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, marginBottom: 4 }}>
                <DField label={t.category}><DSelect value={cat} onChange={setCat} options={catOpts} /></DField>
                <DField label={t.searchFood}><DInput value={q} onChange={setQ} placeholder={t.searchFoodPh} /></DField>
              </div>
              <div style={{ marginTop: 12, maxHeight: 520, overflowY: "auto" }}>
                {filtered.length === 0 ? <div style={{ fontFamily: M.mono, fontSize: 12, color: M.ink2, padding: "16px 0", textAlign: "center" }}>—</div>
                  : filtered.map((f) => <DCatRow key={f.id} f={f} lang={lang} onAdd={addFromCat} />)}
              </div>
            </DPanel>
          </div>
        )}

        {tab === "rec" && (
          <div>
            <div style={{ display: "flex", gap: 14, border: `1px solid ${M.line}`, background: M.panel, padding: "18px 22px", marginBottom: 22 }}>
              <div style={{ width: 22, height: 22, flexShrink: 0, border: `1.5px solid ${M.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" color={M.ink} size={13} /></div>
              <div>
                <Kicker style={{ marginBottom: 6 }}>{t.recipesTitle}</Kicker>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: M.ink2, maxWidth: 760 }}>{t.recipesBody}</div>
              </div>
            </div>
            <DPanel icon="plus" title={t.newRecipe}>
              <div style={{ fontFamily: M.mono, fontSize: 12.5, color: M.ink2, textAlign: "center", padding: "18px 0" }}>{myFoods.length ? "—" : t.needFoodsFirst}</div>
            </DPanel>
            <DPanel icon="nutri" title={t.myRecipes} right={<span style={{ fontFamily: M.mono, fontSize: 12, color: M.ink2 }}>{recipes.length}</span>}>
              <div style={{ fontFamily: M.mono, fontSize: 12.5, color: M.ink2, textAlign: "center", padding: "18px 0" }}>{t.noRecipes}</div>
            </DPanel>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { DesktopBiblioteca });
