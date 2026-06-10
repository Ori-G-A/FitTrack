/* ============================================================
   DESKTOP — Cuerpo: weight + cycle + measurements + wellness +
   photos. Collectors (original app) + previews, Direction-A.
   Loads AFTER desktop-screens.jsx + desktop-forms.jsx.
   ============================================================ */
const { useState: useStateB } = React;

function DWeightChartB() {
  const show = useReveal(160);
  const base = FT.weightSeries.slice(-42); const avgs = base.map((d) => d.avg), tgts = base.map((d) => d.target);
  const W = 620, H = 200, padT = 16, padB = 22;
  const lo = Math.min(...avgs, ...tgts, FT.profile.goalKg) - 0.4, hi = Math.max(...avgs, ...tgts) + 0.4;
  const map = (arr) => toPoints(arr, { w: W, h: H, pad: 0, min: lo, max: hi }).map((p) => ({ ...p, y: padT + (p.y / H) * (H - padT - padB) }));
  const pa = map(avgs), pt = map(tgts); const last = pa[pa.length - 1];
  const goalY = padT + ((hi - FT.profile.goalKg) / (hi - lo)) * (H - padT - padB);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      <line x1="0" y1={goalY} x2={W} y2={goalY} stroke={M.ok} strokeWidth="1.2" strokeDasharray="2 4" />
      <text x={W} y={goalY - 6} textAnchor="end" fontFamily={M.mono} fontSize="11" fill={M.ok}>{FT.profile.goalKg} kg · {lang_meta()}</text>
      <DrawLine d={smoothPath(pt, 0.6)} color={M.ink2} width="1.6" reveal={show} dash="2 5" opacity={0.5} delay={80} />
      <DrawLine d={smoothPath(pa, 0.6)} color={M.acc} width="3" reveal={show} dur={1500} delay={160} />
      <circle cx={last.x} cy={last.y} r={show ? 5 : 0} fill={M.acc} style={{ transition: "r .4s ease 1.5s" }} />
    </svg>
  );
}
function lang_meta() { return (localStorage.getItem("ft:lang") || '"es"').includes("es") ? "meta" : "goal"; }

function DMeasureSparkB({ series }) {
  const show = useReveal(120); const W = 110, H = 36;
  const pts = toPoints(series, { w: W, h: H, pad: 5 }); const down = series[series.length - 1] <= series[0];
  return <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", overflow: "visible" }}><DrawLine d={smoothPath(pts, 0.6)} color={down ? M.ok : M.acc} width="2.4" reveal={show} dur={1000} /></svg>;
}

function DesktopCuerpo({ t, lang, weightLog, setWeightLog }) {
  const today = "09 / 06 / 2026";
  const latestKg = weightLog.length ? weightLog[0].kg : FT.currentToday;
  const toGoal = Math.round((latestKg - FT.profile.goalKg) * 10) / 10;
  const recent = [...weightLog, ...FT.weightSeries.slice(-7).reverse().map((d) => ({ iso: d.iso, kg: d.kg }))].slice(0, 7);

  // collectors
  const [wDate, setWDate] = useStateB(today);
  const [wKg, setWKg] = useStateB(latestKg);
  const [pDate, setPDate] = useStateB(today);
  const [bleed, setBleed] = useStateB(FT.app.profile.bleedDays);
  const measKeys = ["waist", "hips", "chest", "arm", "thigh"];
  const [meas, setMeas] = useStateB({ waist: "", hips: "", chest: "", arm: "", thigh: "" });
  const [sleep, setSleep] = useStateB(0);
  const [energy, setEnergy] = useStateB(0);
  const [notes, setNotes] = useStateB("");

  return (
    <div>
      <DHeader kicker="FITTRACK · COMPOSICIÓN" title={t.tabBody} />
      {(() => {
        const ws = FT.weightSeries.slice(-42).map((d) => d.avg);
        const wm = FT.app.measurements.waist.series; const waistDelta = Math.round((wm[wm.length - 1] - wm[0]) * 10) / 10;
        return (
          <DInsight
            topic={lang === "es" ? "Lo más importante · Composición" : "What matters now · Composition"}
            headline={lang === "es"
              ? <span>A <Hl>−0,40 kg/sem</Hl> llegas a tu meta de <Hl>{FT.profile.goalKg} kg</Hl> el {FT.projection.dateES}.</span>
              : <span>At <Hl>−0.40 kg/wk</Hl> you reach your <Hl>{FT.profile.goalKg} kg</Hl> goal by {FT.projection.dateEN}.</span>}
            sub={lang === "es" ? `cintura ${waistDelta} cm en 10 semanas · tendencia real, no agua` : `waist ${waistDelta} cm over 10 weeks · real trend, not water`}
            viz={<DInsightSpark series={ws} />}
            metric={<DInsightMetric value={Math.abs(toGoal)} unit="kg" decimals={1} label={lang === "es" ? "para la meta" : "to goal"} color={M.acc} count />}
          />
        );
      })()}

      <div style={{ padding: "30px 44px 10px", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 28, alignItems: "start" }}>
        {/* LEFT: weight + cycle */}
        <div>
          <DPanel icon="body" title={t.bodyWeight}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 14, alignItems: "end", marginBottom: 22 }}>
              <DField label={t.dateField}><DInput value={wDate} onChange={setWDate} mono /></DField>
              <DField label={t.weightKg}><DNumber value={wKg} onChange={setWKg} min={30} max={250} step={0.1} decimals={1} /></DField>
              <PrimaryBtn tone="acc" onClick={() => { setWeightLog([{ iso: "2026-06-09", kg: Math.round((parseFloat(wKg) || latestKg) * 10) / 10 }, ...weightLog]); }} style={{ width: "auto", padding: "0 20px", height: 46 }}><Icon name="check" color={M.paper} size={16} />{t.save}</PrimaryBtn>
            </div>
            <div style={{ borderTop: `1px solid ${M.hair}`, paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <Kicker>{t.weightTrend}</Kicker>
                <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums" }}>{latestKg}<span style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2 }}>kg</span></div>
              </div>
              <DWeightChartB />
              <div style={{ marginTop: 16 }}>
                {recent.slice(0, 5).map((e, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 4 ? `1px solid ${M.hair}` : "none" }}>
                    <Kicker>{fmtDayD(e.iso, lang)}</Kicker>
                    <div style={{ fontFamily: M.disp, fontWeight: 700, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>{e.kg}<span style={{ fontFamily: M.mono, fontSize: 10, color: M.ink2 }}>kg</span></div>
                  </div>
                ))}
              </div>
            </div>
          </DPanel>

          <DPanel icon="nutri" title={t.menstrualCycle}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr auto", gap: 14, alignItems: "end", marginBottom: 16 }}>
              <DField label={t.periodStart}><DInput value={pDate} onChange={setPDate} mono /></DField>
              <DField label={t.bleedDaysF}><DNumber value={bleed} onChange={setBleed} min={1} max={10} step={1} /></DField>
              <PrimaryBtn tone="ink" onClick={() => {}} style={{ width: "auto", padding: "0 18px", height: 46 }}><Icon name="check" color={M.paper} size={15} />{t.logPeriod}</PrimaryBtn>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: `1px solid ${M.line}`, background: M.paper, marginBottom: 14 }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: M.ok, flexShrink: 0 }} />
              <span style={{ fontFamily: M.mono, fontSize: 11.5, color: M.ink, textTransform: "uppercase", letterSpacing: ".04em" }}>{t.phases[FT.cycle.phaseKey]} · {lang === "es" ? "día" : "day"} {FT.cycle.day} · {lang === "es" ? `próximo en ~${FT.cycle.daysToNext} días` : `next in ~${FT.cycle.daysToNext} days`}</span>
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: M.ink2 }}>{t.cycleHint}</div>
          </DPanel>
        </div>

        {/* RIGHT: measurements + wellness */}
        <div>
          <DPanel icon="body" title={t.bodyMeasures} right={<span style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2 }}>cm</span>}>
            <DField label={t.dateField} style={{ marginBottom: 16 }}><DInput value={wDate} onChange={setWDate} mono /></DField>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr)) auto", gap: 10, alignItems: "end", marginBottom: 20 }}>
              {measKeys.map((k) => (
                <DField key={k} label={t[k]}><DNumber value={meas[k]} onChange={(v) => setMeas({ ...meas, [k]: v })} min={0} step={0.1} decimals={1} /></DField>
              ))}
              <button onClick={() => {}} style={{ width: 50, height: 46, border: "none", background: M.acc, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" color={M.paper} size={18} /></button>
            </div>
            <div style={{ borderTop: `1px solid ${M.hair}`, paddingTop: 6 }}>
              {measKeys.map((k) => {
                const m = FT.app.measurements[k]; const cur = m.series[m.series.length - 1]; const delta = Math.round((cur - m.series[0]) * 10) / 10;
                return (
                  <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${M.hair}` }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                      <Kicker style={{ width: 72 }}>{t[k]}</Kicker>
                      <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums" }}>{cur}<span style={{ fontFamily: M.mono, fontSize: 10, color: M.ink2 }}>cm</span></div>
                      <span style={{ fontFamily: M.mono, fontSize: 10.5, color: delta <= 0 ? M.ok : M.acc }}>{delta > 0 ? "+" : ""}{delta}</span>
                    </div>
                    <DMeasureSparkB series={m.series} />
                  </div>
                );
              })}
            </div>
          </DPanel>

          <DPanel icon="clock" title={t.dailyWellness}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 18 }}>
              <DField label={t.dateField}><DInput value={wDate} onChange={setWDate} mono /></DField>
              <DField label={t.sleepHours}><DNumber value={sleep} onChange={setSleep} min={0} max={16} step={0.5} decimals={1} /></DField>
            </div>
            <DField label={t.energyFelt} style={{ marginBottom: 18 }}><DEnergy value={energy} onChange={setEnergy} /></DField>
            <DField label="—" style={{ marginBottom: 18 }}><DTextarea value={notes} onChange={setNotes} placeholder={t.dayNotesPh} rows={2} /></DField>
            <PrimaryBtn tone="acc" onClick={() => {}} style={{ width: "auto", padding: "0 22px" }}><Icon name="check" color={M.paper} size={16} />{t.saveWellness}</PrimaryBtn>
          </DPanel>
        </div>
      </div>

      {/* FOTOS */}
      <div style={{ padding: "8px 44px 44px" }}>
        <DPanel icon="body" title={t.progressPhotos} right={<GhostBtn onClick={() => {}} style={{ height: 38 }}><Icon name="plus" color={M.ink} size={15} />{t.uploadTodayPhoto}</GhostBtn>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {FT.app.photos.map((p) => (
              <div key={p.iso}>
                <image-slot id={`progress-${p.iso}`} shape="rect" placeholder={`${fmtDayD(p.iso, lang)} · ${p.kg}kg`} style={{ width: "100%", height: 260, display: "block", border: `1px solid ${M.line}` }}></image-slot>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}><Kicker>{fmtDayD(p.iso, lang)}</Kicker><span style={{ fontFamily: M.mono, fontSize: 11, color: M.ink, fontWeight: 600 }}>{p.kg}kg</span></div>
              </div>
            ))}
            <div style={{ height: 260, border: `1px dashed ${M.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: M.ink2 }}><Icon name="plus" color={M.ink2} size={26} /><Kicker>{t.addPhoto}</Kicker></div>
          </div>
        </DPanel>
      </div>
    </div>
  );
}

Object.assign(window, { DesktopCuerpo });
