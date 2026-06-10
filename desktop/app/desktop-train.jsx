/* ============================================================
   DESKTOP — Entrenar (live workout logger) + Rutinas (builder)
   Faithful to the original app's collectors, in Direction-A style.
   Loads AFTER desktop-screens.jsx (uses DHeader / DInsight / forms).
   ============================================================ */
const { useState: useStateT, useEffect: useEffectT, useRef: useRefT } = React;

const epley = (kg, reps) => Math.round((parseFloat(kg) || 0) * (1 + (parseFloat(reps) || 0) / 30));
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* small stat tile used in the workout summary row */
function DStatTile({ icon, label, value, unit }) {
  return (
    <div style={{ border: `1px solid ${M.line}`, background: M.panel, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {icon && <Icon name={icon} color={M.ink2} size={15} />}<Kicker>{label}</Kicker>
      </div>
      <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 34, lineHeight: 0.9, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
        {value}{unit && <span style={{ fontSize: 14, fontFamily: M.mono, fontWeight: 500, color: M.ink2, marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

/* ============================ ENTRENAR (LOGGER) ============================ */
function DesktopEntrenar({ t, lang }) {
  const muscleLabel = (k) => t.muscleNames[k];
  const seed = [{
    id: 1, name: t.exercises.bench, primary: "chest", sec: ["triceps", "shoulders"],
    sets: [{ reps: 10, kg: 20 }, { reps: 10, kg: 20 }, { reps: 10, kg: 20 }, { reps: 10, kg: 20 }],
  }];
  const [exs, setExs] = useStateT(seed);
  const [cardio, setCardio] = useStateT([{ type: "bike", min: 10, kcal: 0 }]);

  // add-exercise form
  const [exName, setExName] = useStateT("");
  const [tpl, setTpl] = useStateT("");
  const [primary, setPrimary] = useStateT("chest");
  const [sec, setSec] = useStateT([]);

  // cardio form
  const [cType, setCType] = useStateT("walk");
  const [cMin, setCMin] = useStateT(0);
  const [cKcal, setCKcal] = useStateT(0);

  // timer
  const [running, setRunning] = useStateT(false);
  const [secs, setSecs] = useStateT(0);
  const [manualMin, setManualMin] = useStateT(0);
  const ref = useRefT(null);
  useEffectT(() => {
    if (running) { ref.current = setInterval(() => setSecs((s) => s + 1), 1000); }
    return () => clearInterval(ref.current);
  }, [running]);

  const muscleOpts = FTD.muscleKeys.map((k) => ({ id: k, label: muscleLabel(k) }));
  const tplOpts = [{ id: "", label: t.exCommon }, ...FTD.exTemplates.map((e) => ({ id: e.key, label: t.exercises[e.key] }))];
  const cardioOpts = FTD.cardioTypes.map((k) => ({ id: k, label: t.cardioNames[k] }));

  const onTpl = (id) => {
    setTpl(id);
    if (!id) return;
    const e = FTD.exTemplates.find((x) => x.key === id);
    setExName(t.exercises[id] || ""); setPrimary(e.primary); setSec(e.sec);
  };
  const addExercise = () => {
    const nm = exName.trim() || t.exercises[tpl] || (lang === "es" ? "Ejercicio" : "Exercise");
    setExs([...exs, { id: Date.now(), name: nm, primary, sec, sets: [{ reps: 10, kg: 20 }, { reps: 10, kg: 20 }, { reps: 10, kg: 20 }] }]);
    setExName(""); setTpl(""); setSec([]);
  };
  const setSet = (ei, si, key, v) => setExs(exs.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.map((s, j) => j !== si ? s : { ...s, [key]: v }) }));
  const addSet = (ei) => setExs(exs.map((e, i) => i !== ei ? e : { ...e, sets: [...e.sets, { ...e.sets[e.sets.length - 1] }] }));
  const delSet = (ei, si) => setExs(exs.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.filter((_, j) => j !== si) }));
  const delEx = (ei) => setExs(exs.filter((_, i) => i !== ei));
  const addCardio = () => { setCardio([...cardio, { type: cType, min: parseFloat(cMin) || 0, kcal: parseFloat(cKcal) || 0 }]); setCMin(0); setCKcal(0); };

  const setsCount = exs.reduce((a, e) => a + e.sets.length, 0);
  const volume = exs.reduce((a, e) => a + e.sets.reduce((b, s) => b + (parseFloat(s.reps) || 0) * (parseFloat(s.kg) || 0), 0), 0);
  const cardioMin = cardio.reduce((a, c) => a + (c.min || 0), 0);
  const totalMin = Math.round(secs / 60) + (parseFloat(manualMin) || 0);

  return (
    <div>
      <DHeader kicker="FITTRACK · ENTRENAMIENTO" title={t.tabTrain}
        right={<DDateNav label={t.todayWord} sub={fmtDayD(FT.weightSeries[FT.weightSeries.length - 1].iso, lang) === (lang === "es" ? "hoy" : "today") ? "09 / 06 / 2026" : "09 / 06 / 2026"} />} />
      {(() => {
        const dl = FT.strength.deadlift; const last = dl[dl.length - 1]; const gain = Math.round((last / dl[0] - 1) * 100); const delta = last - dl[0];
        return (
          <DInsight
            topic={lang === "es" ? "Lo más importante · Fuerza" : "What matters now · Strength"}
            headline={lang === "es"
              ? <span>Peso muerto: de {dl[0]} a <Hl>{last} kg</Hl> este bloque, <Hl>+{gain}%</Hl> de 1RM estimado.</span>
              : <span>Deadlift: from {dl[0]} to <Hl>{last} kg</Hl> this block, <Hl>+{gain}%</Hl> estimated 1RM.</span>}
            sub={lang === "es" ? `+${delta} kg · la sobrecarga progresiva está funcionando` : `+${delta} kg · progressive overload is working`}
            viz={<DInsightSpark series={dl} />}
            metric={<DInsightMetric value={gain} unit="%" sign label={lang === "es" ? "vs inicio" : "vs start"} color={M.acc} count />}
          />
        );
      })()}

      <div style={{ padding: "30px 44px 44px" }}>
        {/* DURACIÓN */}
        <DPanel icon="clock" title={t.duration} right={<span style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2 }}>{totalMin} min · {cardioMin} min {t.cardioLabel}</span>}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            <div style={{ fontFamily: M.disp, fontWeight: 900, fontSize: 56, lineHeight: 0.9, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", minWidth: 170 }}>{mmss(secs)}</div>
            <PrimaryBtn tone={running ? "ink" : "acc"} onClick={() => setRunning((r) => !r)} style={{ width: "auto", padding: "0 26px" }}>
              <Icon name={running ? "clock" : "arrowR"} color={M.paper} size={17} />{running ? t.reset.toUpperCase() : t.start}
            </PrimaryBtn>
            <GhostBtn onClick={() => { setRunning(false); setSecs(0); }} style={{ height: 54 }}>{t.reset}</GhostBtn>
            <div style={{ marginLeft: "auto" }}>
              <DField label={t.minsManual}><DNumber value={manualMin} onChange={setManualMin} min={0} step={1} suffix="min" style={{ width: 150 }} /></DField>
            </div>
          </div>
        </DPanel>

        {/* AÑADIR EJERCICIO */}
        <DPanel icon="plus" title={t.addExerciseT}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr) minmax(0,1fr)", gap: 16, marginBottom: 16 }}>
            <DField label={t.exerciseField}><DInput value={exName} onChange={setExName} placeholder={t.exNamePh} /></DField>
            <DField label={t.quickTemplate}><DSelect value={tpl} onChange={onTpl} options={tplOpts} /></DField>
            <DField label={t.primaryMuscle}><DSelect value={primary} onChange={setPrimary} options={muscleOpts} /></DField>
          </div>
          <DField label={t.secondaryMuscles} style={{ marginBottom: 18 }}>
            <DChips keys={FTD.muscleKeys.filter((k) => k !== primary)} selected={sec} onToggle={(k) => setSec(sec.includes(k) ? sec.filter((x) => x !== k) : [...sec, k])} labelFn={muscleLabel} />
          </DField>
          <PrimaryBtn tone="acc" onClick={addExercise} style={{ width: "auto", padding: "0 24px" }}><Icon name="plus" color={M.paper} size={16} />{t.addExerciseT}</PrimaryBtn>
        </DPanel>

        {/* SUMMARY */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 22 }}>
          <DStatTile icon="train" label={t.exCount} value={exs.length} />
          <DStatTile icon="check" label={t.setsCount} value={setsCount} />
          <DStatTile icon="flame" label={t.totalVol} value={volume.toLocaleString(lang === "es" ? "es-ES" : "en-US")} unit="kg" />
        </div>

        {/* EXERCISE CARDS */}
        {exs.map((e, ei) => {
          const best = e.sets.reduce((m, s) => Math.max(m, epley(s.kg, s.reps)), 0);
          return (
            <div key={e.id} style={{ border: `1px solid ${M.line}`, background: M.panel, marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 22px", borderBottom: `1px solid ${M.hair}` }}>
                <div style={{ width: 9, height: 9, background: M.acc, flexShrink: 0 }} />
                <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 19, textTransform: "uppercase", letterSpacing: "-0.01em" }}>{e.name}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: M.mono, fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: M.paper, background: M.ink, padding: "3px 7px" }}>{muscleLabel(e.primary)}</span>
                  {e.sec.map((k) => <span key={k} style={{ fontFamily: M.mono, fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: M.ink2, border: `1px solid ${M.line}`, padding: "3px 7px" }}>+{muscleLabel(k)}</span>)}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontFamily: M.mono, fontSize: 11, color: M.acc, fontWeight: 600 }}>{t.est1rmShort} ~{best} kg</span>
                  <button onClick={() => delEx(ei)} style={{ width: 30, height: 30, border: `1px solid ${M.line}`, background: "transparent", cursor: "pointer", color: M.ink2, fontFamily: M.disp, fontSize: 15 }}>✕</button>
                </div>
              </div>
              <div style={{ padding: "8px 22px 18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 44px", gap: 12, padding: "8px 0" }}>
                  <Kicker>#</Kicker><Kicker>{t.repsCol}</Kicker><Kicker>{t.kgCol}</Kicker><div />
                </div>
                {e.sets.map((s, si) => (
                  <div key={si} style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 44px", gap: 12, alignItems: "center", padding: "5px 0", borderTop: `1px solid ${M.hair}` }}>
                    <div style={{ fontFamily: M.mono, fontSize: 13, color: M.ink2, fontWeight: 600 }}>{si + 1}</div>
                    <DNumber value={s.reps} onChange={(v) => setSet(ei, si, "reps", v)} min={0} step={1} />
                    <DNumber value={s.kg} onChange={(v) => setSet(ei, si, "kg", v)} min={0} step={2.5} />
                    <button onClick={() => delSet(ei, si)} style={{ width: 34, height: 34, border: `1px solid ${M.line}`, background: "transparent", cursor: "pointer", color: M.ink2, fontSize: 13 }}>✕</button>
                  </div>
                ))}
                <button onClick={() => addSet(ei)} style={{ width: "100%", marginTop: 10, height: 40, border: `1px dashed ${M.line}`, background: "transparent", cursor: "pointer", fontFamily: M.mono, fontSize: 11.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: M.ink2 }}>{t.addSetRow}</button>
              </div>
            </div>
          );
        })}

        {/* CARDIO */}
        <DPanel icon="flame" title={t.cardioTitle}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) auto", gap: 16, alignItems: "end", marginBottom: cardio.length ? 18 : 0 }}>
            <DField label={t.cardioType}><DSelect value={cType} onChange={setCType} options={cardioOpts} /></DField>
            <DField label={t.cardioMin}><DNumber value={cMin} onChange={setCMin} min={0} step={5} /></DField>
            <DField label={t.cardioKcal}><DNumber value={cKcal} onChange={setCKcal} min={0} step={10} /></DField>
            <button onClick={addCardio} style={{ width: 54, height: 46, border: "none", background: M.acc, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" color={M.paper} size={20} /></button>
          </div>
          {cardio.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${M.hair}` }}>
              <span style={{ fontFamily: M.disp, fontWeight: 600, fontSize: 15 }}>{t.cardioNames[c.type]}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: M.mono, fontSize: 12, color: M.ink2 }}>{c.min} min{c.kcal ? ` · ${c.kcal} kcal` : ""}</span>
                <button onClick={() => setCardio(cardio.filter((_, j) => j !== i))} style={{ width: 28, height: 28, border: `1px solid ${M.line}`, background: "transparent", cursor: "pointer", color: M.ink2, fontSize: 12 }}>✕</button>
              </div>
            </div>
          ))}
        </DPanel>
      </div>
    </div>
  );
}

/* ============================ RUTINAS (BUILDER) ============================ */
function DesktopRutinas({ t, lang }) {
  const muscleLabel = (k) => t.muscleNames[k];
  const initial = FT.app.routines.map((r) => ({
    id: r.id, name: lang === "es" ? r.nameES : r.nameEN, split: r.split,
    exercises: r.exercises.map((e) => ({ name: t.exercises[e.key], sets: e.sets, reps: e.reps, primary: "chest", sec: [] })),
  }));
  const [routines, setRoutines] = useStateT(initial);

  // builder state
  const [name, setName] = useStateT("");
  const [draft, setDraft] = useStateT([]);
  const [exName, setExName] = useStateT("");
  const [tpl, setTpl] = useStateT("");
  const [primary, setPrimary] = useStateT("chest");
  const [sec, setSec] = useStateT([]);
  const [series, setSeries] = useStateT(3);
  const [reps, setReps] = useStateT(8);

  const muscleOpts = FTD.muscleKeys.map((k) => ({ id: k, label: muscleLabel(k) }));
  const tplOpts = [{ id: "", label: t.exCommon }, ...FTD.exTemplates.map((e) => ({ id: e.key, label: t.exercises[e.key] }))];
  const onTpl = (id) => { setTpl(id); if (!id) return; const e = FTD.exTemplates.find((x) => x.key === id); setExName(t.exercises[id] || ""); setPrimary(e.primary); setSec(e.sec); };
  const addEx = () => {
    if (!exName.trim() && !tpl) return;
    setDraft([...draft, { name: exName.trim() || t.exercises[tpl], sets: parseInt(series) || 3, reps: parseInt(reps) || 8, primary, sec }]);
    setExName(""); setTpl(""); setSec([]); setSeries(3); setReps(8);
  };
  const saveRoutine = () => {
    if (!draft.length) return;
    const letter = String.fromCharCode(65 + routines.length);
    setRoutines([...routines, { id: Date.now(), name: name.trim() || `${lang === "es" ? "Rutina" : "Routine"} ${letter}`, split: letter, exercises: draft }]);
    setName(""); setDraft([]);
  };

  const totalEx = FT.app.routines.reduce((a, r) => a + r.exercises.length, 0);

  return (
    <div>
      <DHeader kicker="FITTRACK · RUTINAS" title={t.tabRoutines} />
      <DInsight
        topic={lang === "es" ? "Lo más importante · Plantillas" : "What matters now · Templates"}
        headline={lang === "es"
          ? <span><Hl>{FT.app.routines.length} plantillas</Hl> cubren empuje, tirón y pierna — <Hl>{totalEx} ejercicios</Hl> listos para cargar de un toque.</span>
          : <span><Hl>{FT.app.routines.length} templates</Hl> cover push, pull and legs — <Hl>{totalEx} exercises</Hl> ready to load with one tap.</span>}
        sub={lang === "es" ? "registrar pasa a ser editar, no escribir desde cero" : "logging becomes editing, not writing from scratch"}
        metric={<DInsightMetric value={FT.app.routines.length} label={lang === "es" ? "rutinas" : "routines"} />}
      />
      <div style={{ padding: "30px 44px 44px" }}>
        {/* info note */}
        <div style={{ display: "flex", gap: 14, border: `1px solid ${M.line}`, background: M.panel, padding: "18px 22px", marginBottom: 22 }}>
          <div style={{ width: 22, height: 22, flexShrink: 0, border: `1.5px solid ${M.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" color={M.ink} size={13} /></div>
          <div>
            <Kicker style={{ marginBottom: 6 }}>{t.routineTemplates}</Kicker>
            <div style={{ fontSize: 13.5, lineHeight: 1.5, color: M.ink2, maxWidth: 720 }}>{t.routineTemplatesBody}</div>
          </div>
        </div>

        {/* NUEVA RUTINA */}
        <DPanel icon="plus" title={t.newRoutine}>
          <DField label={t.routineName} style={{ marginBottom: 18 }}><DInput value={name} onChange={setName} placeholder={t.routineNamePh} /></DField>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr) 88px 88px", gap: 14, marginBottom: 16, alignItems: "end" }}>
            <DField label={t.exerciseField}><DInput value={exName} onChange={setExName} placeholder={t.exNamePh} /></DField>
            <DField label={t.quickTemplate}><DSelect value={tpl} onChange={onTpl} options={tplOpts} /></DField>
            <DField label={t.primaryMuscle}><DSelect value={primary} onChange={setPrimary} options={muscleOpts} /></DField>
            <DField label={t.seriesShort}><DNumber value={series} onChange={setSeries} min={1} step={1} /></DField>
            <DField label={t.repsShort}><DNumber value={reps} onChange={setReps} min={1} step={1} /></DField>
          </div>
          <DField label={t.secondaryMuscles} style={{ marginBottom: 18 }}>
            <DChips keys={FTD.muscleKeys.filter((k) => k !== primary)} selected={sec} onToggle={(k) => setSec(sec.includes(k) ? sec.filter((x) => x !== k) : [...sec, k])} labelFn={muscleLabel} />
          </DField>
          <GhostBtn onClick={addEx} style={{ marginBottom: draft.length ? 18 : 0 }}><Icon name="plus" color={M.ink} size={15} />{t.addExerciseT}</GhostBtn>
          {draft.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderTop: `1px solid ${M.hair}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: M.disp, fontWeight: 600, fontSize: 15 }}>{e.name}</span>
                <span style={{ fontFamily: M.mono, fontSize: 10, color: M.ink2, textTransform: "uppercase" }}>{muscleLabel(e.primary)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontFamily: M.mono, fontSize: 12, color: M.ink2 }}>{e.sets}×{e.reps}</span>
                <button onClick={() => setDraft(draft.filter((_, j) => j !== i))} style={{ width: 28, height: 28, border: `1px solid ${M.line}`, background: "transparent", cursor: "pointer", color: M.ink2, fontSize: 12 }}>✕</button>
              </div>
            </div>
          ))}
          {draft.length > 0 && <div style={{ marginTop: 20 }}><PrimaryBtn tone="ink" onClick={saveRoutine} style={{ width: "auto", padding: "0 26px" }}><Icon name="check" color={M.paper} size={16} />{t.saveRoutine}</PrimaryBtn></div>}
        </DPanel>

        {/* MIS RUTINAS */}
        <DPanel icon="train" title={t.myRoutines} right={<span style={{ fontFamily: M.mono, fontSize: 12, color: M.ink2 }}>{routines.length}</span>}>
          {routines.length === 0 ? (
            <div style={{ fontFamily: M.mono, fontSize: 12, color: M.ink2, textAlign: "center", padding: "20px 0" }}>{t.noRoutines}</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {routines.map((r) => (
                <div key={r.id} style={{ border: `1px solid ${M.line}`, background: M.paper, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px 12px", borderBottom: `1px solid ${M.hair}` }}>
                    <div style={{ fontFamily: M.disp, fontWeight: 900, fontSize: 40, lineHeight: 0.8, color: M.ink, letterSpacing: "-0.04em" }}>{r.split}</div>
                    <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 20, textTransform: "uppercase", letterSpacing: "-0.02em" }}>{r.name}</div>
                  </div>
                  <div style={{ padding: "8px 18px 16px" }}>
                    {r.exercises.map((e, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, padding: "7px 0", borderTop: i ? `1px solid ${M.hair}` : "none" }}>
                        <span style={{ fontFamily: M.disp, fontWeight: 500, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</span>
                        <span style={{ fontFamily: M.mono, fontSize: 10.5, color: M.ink2, flexShrink: 0 }}>{e.sets}×{e.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DPanel>
      </div>
    </div>
  );
}

Object.assign(window, { DesktopEntrenar, DesktopRutinas });
