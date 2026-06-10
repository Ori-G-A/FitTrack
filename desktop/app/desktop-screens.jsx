/* ============================================================
   DESKTOP — screens: Entrenar, Cuerpo, Nutrición, Ajustes
   Wide multi-column layouts. Reuses M tokens + kit primitives.
   ============================================================ */
const { useState: useStateD } = React;

/* ---------- shared desktop helpers ---------- */
function fmtDayD(iso, lang) {
  const d = new Date(iso + "T00:00:00");
  const days = lang === "es" ? ["dom","lun","mar","mié","jue","vie","sáb"] : ["sun","mon","tue","wed","thu","fri","sat"];
  const diff = Math.round((new Date("2026-06-09T00:00:00") - d) / 86400000);
  if (diff === 0) return lang === "es" ? "hoy" : "today";
  if (diff === 1) return lang === "es" ? "ayer" : "yesterday";
  return `${days[d.getDay()]} ${d.getDate()}`;
}
function sumMealD(ids) {
  return ids.reduce((a, id) => { const f = FT.app.foodById[id]; return f ? { kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f } : a; }, { kcal: 0, p: 0, c: 0, f: 0 });
}
function nextRoutineIdD() {
  const order = ["push", "pull", "legs"]; const last = FT.app.history[0] && FT.app.history[0].routine;
  return order[(order.indexOf(last) + 1) % order.length];
}

function DHeader({ kicker, title, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "40px 44px 22px", borderBottom: `2px solid ${M.ink}` }}>
      <div>
        <Kicker style={{ marginBottom: 12 }}>{kicker}</Kicker>
        <h1 style={{ margin: 0, fontFamily: M.disp, fontWeight: 900, fontSize: 60, lineHeight: 0.84, letterSpacing: "-0.045em", textTransform: "uppercase", color: M.ink }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

function DToggle({ on, onChange }) {
  return (
    <button onClick={() => { haptic(); onChange(!on); }} style={{ width: 52, height: 30, border: `1.5px solid ${on ? M.ink : M.line}`, background: on ? M.ink : "transparent", cursor: "pointer", position: "relative", padding: 0, transition: "all .2s" }}>
      <span style={{ position: "absolute", top: 2, left: on ? 25 : 2, width: 22, height: 22, background: on ? M.acc : M.ink2, transition: "left .2s" }} />
    </button>
  );
}

const dSecH = { margin: 0, fontFamily: M.disp, fontWeight: 800, fontSize: 26, textTransform: "uppercase", letterSpacing: "-0.02em", color: M.ink };

/* ============================================================
   INSIGHT LEDE — every window opens with its single most
   important takeaway, in the Direction-A editorial voice.
   Data collectors + previews below stay untouched.
   ============================================================ */

/* tangerine emphasis inside a headline sentence */
function Hl({ children }) { return <span style={{ color: M.acc }}>{children}</span>; }

const nfmt = (n, lang) => Math.round(n).toLocaleString(lang === "es" ? "es-ES" : "en-US");

/* the lede band — masthead rule + headline + supporting line + a small proof viz/metric */
function DInsight({ topic, headline, sub, viz, metric }) {
  const show = useReveal(80);
  return (
    <div style={{
      position: "relative", background: M.panel, borderBottom: `1px solid ${M.line}`,
      padding: "26px 44px 28px 49px", display: "grid", gridTemplateColumns: "1fr auto",
      gap: 44, alignItems: "center",
      opacity: show ? 1 : 0, transform: show ? "none" : "translateY(10px)",
      transition: "opacity .5s ease, transform .5s ease",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: M.acc }} />
      <div style={{ maxWidth: 880, display: "flex", flexDirection: "column" }}>
        <Kicker color={M.acc} style={{ marginBottom: 13 }}>{topic}</Kicker>
        <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 31, lineHeight: 1.12, letterSpacing: "-0.025em", color: M.ink, textWrap: "pretty" }}>{headline}</div>
        {sub && <div style={{ fontFamily: M.mono, fontSize: 11.5, color: M.ink2, marginTop: 15, letterSpacing: ".04em", textTransform: "uppercase" }}>{sub}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 30, flexShrink: 0 }}>
        {viz}
        {metric}
      </div>
    </div>
  );
}

/* big hero figure on the right of a lede */
function DInsightMetric({ value, unit, label, count, decimals = 0, color, sign }) {
  return (
    <div style={{ borderLeft: `1px solid ${M.line}`, paddingLeft: 30, textAlign: "right", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", fontFamily: M.disp, fontWeight: 800, fontSize: 58, lineHeight: 0.9, letterSpacing: "-0.04em", color: color || M.ink, fontVariantNumeric: "tabular-nums" }}>
        {sign && value > 0 ? "+" : ""}{count ? <CountUp value={value} decimals={decimals} delay={300} /> : value}
        {unit && <span style={{ fontSize: 17, fontFamily: M.mono, fontWeight: 500, marginLeft: 5, letterSpacing: 0, color: M.ink2 }}>{unit}</span>}
      </div>
      <Kicker style={{ marginTop: 10 }}>{label}</Kicker>
    </div>
  );
}

/* proof sparkline */
function DInsightSpark({ series, w = 240, h = 66, color }) {
  const show = useReveal(220);
  const pts = toPoints(series, { w, h, pad: 9 });
  const last = pts[pts.length - 1];
  const c = color || M.acc;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <DrawLine d={smoothPath(pts, 0.6)} color={c} width="2.6" reveal={show} dur={1200} />
      <circle cx={last.x} cy={last.y} r={show ? 4.5 : 0} fill={c} style={{ transition: "r .4s ease 1.1s" }} />
    </svg>
  );
}

/* proof column chart with target line (calories) */
function DInsightBars({ w = 280, h = 66 }) {
  const show = useReveal(220);
  const data = FT.kcalSeries;
  const max = Math.max(...data.map((d) => d.kcal)) * 1.06;
  return (
    <div style={{ width: w, height: h, display: "flex", alignItems: "flex-end", gap: 3, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: `${(FT.kcalTarget / max) * 100}%`, borderTop: `1px dashed ${M.ink}`, opacity: 0.4 }} />
      {data.map((d, i) => {
        const over = d.kcal > FT.kcalTarget;
        return <div key={i} style={{ flex: 1, height: show ? `${(d.kcal / max) * 100}%` : "0%", background: over ? M.acc : M.ink, transition: `height .7s cubic-bezier(.22,.61,.36,1) ${i * 35}ms` }} />;
      })}
    </div>
  );
}

/* proof dots — integration sources, filled = connected */
function DInsightDots({ states }) {
  const show = useReveal(200);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {states.map((on, i) => (
        <div key={i} style={{ width: 26, height: 26, border: `1.5px solid ${M.ink}`, background: on ? M.acc : "transparent", opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.6)", transition: `opacity .4s ease ${i * 80}ms, transform .4s cubic-bezier(.22,.61,.36,1) ${i * 80}ms` }} />
      ))}
    </div>
  );
}

/* ============================ AJUSTES ============================ */
function DRow({ label, children, onClick, last }) {
  return <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: last ? "none" : `1px solid ${M.hair}`, cursor: onClick ? "pointer" : "default", minHeight: 58 }}><span style={{ fontFamily: M.disp, fontWeight: 500, fontSize: 16 }}>{label}</span><div style={{ display: "flex", alignItems: "center", gap: 12 }}>{children}</div></div>;
}

function DesktopAjustes({ t, lang, setLang, profile, setProfile, integrations, setIntegrations }) {
  const show = true; // instant render (entrance handled per-screen)
  const set = (k, v) => setProfile({ ...profile, [k]: v });
  const exportBackup = () => {
    try {
      const dump = {}; Object.keys(localStorage).forEach((k) => { if (k.startsWith("ft:")) dump[k] = localStorage.getItem(k); });
      const blob = new Blob([JSON.stringify({ app: "FitTrack", exported: new Date().toISOString(), data: dump }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = "fittrack-backup.json"; a.click(); URL.revokeObjectURL(url);
    } catch (e) {}
  };
  const integ = [{ id: "applehealth", label: t.appleHealth }, { id: "whoop", label: t.whoop }, { id: "strava", label: t.strava }];
  const dVal = { fontFamily: M.mono, fontSize: 13, color: M.ink2 };
  const pace = (profile.pacePerWeek == null ? -0.4 : profile.pacePerWeek);
  const pProfile = { startKgInput: "auto", activity: "moderate", autoMacros: false, kcalGoal: 2200, proteinGoal: 150, email: "ana@fittrack.app", ...profile };
  return (
    <div>
      <DHeader kicker="FITTRACK" title={t.tabSettings} />
      {(() => {
        const order = [{ id: "applehealth", label: "Apple Health" }, { id: "whoop", label: "WHOOP" }, { id: "strava", label: "Strava" }];
        const states = order.map((s) => !!integrations[s.id]);
        const active = states.filter(Boolean).length;
        const missing = order.filter((s) => !integrations[s.id]).map((s) => s.label);
        const allOn = active === order.length;
        const headline = allOn
          ? (lang === "es"
              ? <span>Tus <Hl>3 fuentes</Hl> están sincronizando — peso, sueño y entrenos entran solos.</span>
              : <span>All <Hl>3 sources</Hl> are syncing — weight, sleep and workouts flow in automatically.</span>)
          : (lang === "es"
              ? <span><Hl>{active} de {order.length} fuentes</Hl> conectadas. Activa {missing.join(" y ")} para auto-importar sueño y entrenos.</span>
              : <span><Hl>{active} of {order.length} sources</Hl> connected. Turn on {missing.join(" and ")} to auto-import sleep and workouts.</span>);
        return (
          <DInsight
            topic={lang === "es" ? "Lo más importante · Datos" : "What matters now · Data"}
            headline={headline}
            sub={lang === "es" ? "menos registro manual, más señal para tus tendencias" : "less manual logging, more signal in your trends"}
            viz={<DInsightDots states={states} />}
            metric={<DInsightMetric value={active} unit={`/${order.length}`} label={lang === "es" ? "fuentes activas" : "sources active"} color={allOn ? M.ok : M.ink} />}
          />
        );
      })()}
      <div style={{ padding: "30px 44px 44px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
        {/* LEFT */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
            <div style={{ width: 66, height: 66, borderRadius: 999, background: M.ink, color: M.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: M.disp, fontWeight: 900, fontSize: 30 }}>{profile.name[0]}</div>
            <div><div style={{ fontFamily: M.disp, fontWeight: 900, fontSize: 32, textTransform: "uppercase", letterSpacing: "-0.02em" }}>{profile.name}</div><div style={{ fontFamily: M.mono, fontSize: 12, color: M.ink2, marginTop: 3 }}>{profile.age} · {profile.heightCm} cm</div></div>
          </div>

          <DPanel icon="body" title={t.weightGoals}>
            <div style={{ marginBottom: 18 }}><Segmented value={profile.goal} onChange={(v) => set("goal", v)} options={[{ id: "cut", label: t.goalCut.split(" ")[0] }, { id: "maintain", label: t.goalMaintain }, { id: "bulk", label: t.goalBulk }]} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <DField label={t.startWeight}><DInput value={pProfile.startKgInput} onChange={(v) => set("startKgInput", v)} mono /></DField>
              <DField label={t.goalWeightKg}><DNumber value={profile.goalKg} onChange={(v) => set("goalKg", v)} min={40} max={150} step={0.5} decimals={1} /></DField>
            </div>
            <DField label={`${t.paceGoal} · ${(lang === "es" ? pace.toFixed(2).replace(".", ",") : pace.toFixed(2))} ${t.perWeekKg} (${pace < 0 ? t.deficitWord : pace > 0 ? t.surplusWord : "\u2014"})`}>
              <div style={{ paddingTop: 6 }}><DSlider value={pace} onChange={(v) => set("pacePerWeek", v)} min={-1} max={0.5} step={0.05} /></div>
            </DField>
          </DPanel>

          <DPanel icon="flame" title={t.nutritionGoals}>
            <DField label={t.activityLevel} style={{ marginBottom: 18 }}>
              <DSelect value={pProfile.activity} onChange={(v) => set("activity", v)} options={FTD.activityLevels.map((k) => ({ id: k, label: t.activityNames[k] }))} />
            </DField>
            <div style={{ marginBottom: 18 }}><DCheck checked={pProfile.autoMacros} onChange={(v) => set("autoMacros", v)} label={t.autoCalc} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, opacity: pProfile.autoMacros ? 0.5 : 1, pointerEvents: pProfile.autoMacros ? "none" : "auto" }}>
              <DField label={t.dailyKcal}><DNumber value={pProfile.kcalGoal} onChange={(v) => set("kcalGoal", v)} min={1000} max={5000} step={10} /></DField>
              <DField label={t.dailyProtein}><DNumber value={pProfile.proteinGoal} onChange={(v) => set("proteinGoal", v)} min={40} max={350} step={5} /></DField>
            </div>
          </DPanel>
        </div>

        {/* RIGHT */}
        <div>
          <DPanel icon="settings" title={`${t.unitsSec} · ${t.language}`}>
            <div style={{ marginBottom: 16 }}><Segmented value={profile.units} onChange={(v) => set("units", v)} options={[{ id: "metric", label: t.metric }, { id: "imperial", label: t.imperial }]} /></div>
            <div style={{ marginBottom: 16 }}><Segmented value={lang} onChange={setLang} options={[{ id: "es", label: "Español" }, { id: "en", label: "English" }]} /></div>
            <DRow label={t.cycleTrack} last><DToggle on={profile.cycleTracking} onChange={(v) => set("cycleTracking", v)} /></DRow>
          </DPanel>

          <DPanel icon="plus" title={t.integrations}>
            {integ.map((it, i) => (
              <DRow key={it.id} label={it.label} last={i === integ.length - 1}>
                <span style={{ ...dVal, color: integrations[it.id] ? M.ok : M.ink2 }}>{integrations[it.id] ? t.connected : t.connect}</span>
                <DToggle on={integrations[it.id]} onChange={(v) => setIntegrations({ ...integrations, [it.id]: v })} />
              </DRow>
            ))}
          </DPanel>

          <DPanel icon="body" title={t.accountSec}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div><Kicker style={{ marginBottom: 6 }}>{t.activeSession}</Kicker><div style={{ fontFamily: M.mono, fontSize: 13, color: M.ink, fontWeight: 600 }}>{pProfile.email}</div></div>
              <GhostBtn onClick={() => {}}>✕ {t.signOutBtn}</GhostBtn>
            </div>
          </DPanel>

          <DPanel icon="arrowR" title={t.backupSec}>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: M.ink2, marginBottom: 16 }}>{t.backupBody}</div>
            <PrimaryBtn tone="acc" onClick={exportBackup} style={{ width: "auto", padding: "0 22px" }}><Icon name="arrowR" color={M.paper} size={16} />{t.exportNow}</PrimaryBtn>
          </DPanel>

          <div style={{ border: `1px solid ${M.ok}`, background: M.okDim, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: M.ok }} /><Kicker color={M.ok}>{t.howMacros}</Kicker></div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: M.ink2 }}>{t.howMacrosBody}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DesktopAjustes, DHeader, DToggle, DRow, DSecH: dSecH, fmtDayD, sumMealD, nextRoutineIdD });
