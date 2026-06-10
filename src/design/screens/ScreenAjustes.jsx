import { useState } from "react";
import { useReveal, Rise } from "../shared.jsx";
import { M, Kicker, TopBar, ScreenScroll, Icon, Segmented, PrimaryBtn, Stepper, Sheet, haptic } from "../kit.jsx";
import { MInsight, MInsightDots, MInsightMetric, MHl } from "../insight.jsx";

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => { haptic(); onChange(!on); }}
      style={{ width: 50, height: 28, border: `1.5px solid ${on ? M.ink : M.line}`, background: on ? M.ink : "transparent", cursor: "pointer", position: "relative", padding: 0, transition: "background .2s, border-color .2s", WebkitTapHighlightColor: "transparent" }}>
      <span style={{ position: "absolute", top: 2, left: on ? 24 : 2, width: 20, height: 20, background: on ? M.acc : M.ink2, transition: "left .2s" }} />
    </button>
  );
}

function Row({ label, children, onClick, last }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", borderBottom: last ? "none" : `1px solid ${M.hair}`, cursor: onClick ? "pointer" : "default", minHeight: 54, boxSizing: "border-box" }}>
      <span style={{ fontFamily: M.disp, fontWeight: 500, fontSize: 16, color: M.ink }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{children}</div>
    </div>
  );
}

function SecHead({ children }) {
  return <div style={{ padding: "22px 20px 9px" }}><Kicker>{children}</Kicker></div>;
}

const valStyle = { fontFamily: M.mono, fontSize: 13, color: M.ink2 };

export function ScreenAjustes({ t, lang, setLang, profile, setProfile, integrations, setIntegrations }) {
  const show = useReveal(40);
  const [edit, setEdit] = useState(null);
  const [draft, setDraft] = useState(0);

  const set = (k, v) => setProfile({ ...profile, [k]: v });
  const openEdit = (k, val) => { setDraft(val); setEdit(k); };

  const integ = [
    { id: "applehealth", label: t.appleHealth },
    { id: "whoop", label: t.whoop },
    { id: "strava", label: t.strava },
  ];

  return (
    <ScreenScroll>
      <TopBar kicker="FITTRACK" title={t.tabSettings} />

      {(() => {
        const order = ["applehealth","whoop","strava"];
        const labels = { applehealth: "Apple Health", whoop: "WHOOP", strava: "Strava" };
        const states = order.map((s) => !!integrations[s]);
        const active = states.filter(Boolean).length;
        const missing = order.filter((s) => !integrations[s]).map((s) => labels[s]);
        const allOn = active === order.length;
        const headline = allOn
          ? (lang === "es"
              ? <span>Tus <MHl>3 fuentes</MHl> sincronizan — peso, sueño y entrenos entran solos.</span>
              : <span>All <MHl>3 sources</MHl> sync — weight, sleep and workouts flow in automatically.</span>)
          : (lang === "es"
              ? <span><MHl>{active} de 3 fuentes</MHl> conectadas. Activa {missing.join(" y ")} para auto-importar.</span>
              : <span><MHl>{active} of 3 sources</MHl> connected. Turn on {missing.join(" and ")} to auto-import.</span>);
        return (
          <MInsight
            topic={lang === "es" ? "Lo más importante · Datos" : "What matters now · Data"}
            headline={headline}
            sub={lang === "es" ? "menos registro manual, más señal para tus tendencias" : "less manual logging, more signal in your trends"}
            viz={<MInsightDots states={states} />}
            metric={<MInsightMetric value={active} unit="/3" label={lang === "es" ? "activas" : "active"} color={allOn ? M.ok : M.ink} />}
          />
        );
      })()}

      <Rise show={show} i={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px 22px", borderTop: `1px solid ${M.line}`, borderBottom: `1px solid ${M.line}`, marginTop: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: 999, background: M.ink, color: M.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: M.disp, fontWeight: 900, fontSize: 28 }}>{profile.name[0]}</div>
          <div>
            <div style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 26, textTransform: "uppercase", letterSpacing: "-0.02em" }}>{profile.name}</div>
            <div style={{ fontFamily: M.mono, fontSize: 11, color: M.ink2, marginTop: 3 }}>{profile.age} · {profile.heightCm} cm · {t[profile.goal === "cut" ? "goalCut" : profile.goal === "bulk" ? "goalBulk" : "goalMaintain"].split(" ")[0]}</div>
          </div>
        </div>
      </Rise>

      <Rise show={show} i={1}>
        <SecHead>{t.goalsSec}</SecHead>
        <div style={{ background: M.panel, borderTop: `1px solid ${M.line}`, borderBottom: `1px solid ${M.line}` }}>
          <div style={{ padding: "15px 20px", borderBottom: `1px solid ${M.hair}` }}>
            <Segmented value={profile.goal} onChange={(v) => set("goal", v)} options={[{ id: "cut", label: t.goalCut.split(" ")[0] }, { id: "maintain", label: t.goalMaintain }, { id: "bulk", label: t.goalBulk }]} />
          </div>
          <Row label={t.goalWeight} onClick={() => openEdit("goalKg", profile.goalKg)}><span style={valStyle}>{profile.goalKg} kg</span><Icon name="chevR" color={M.ink2} size={16} /></Row>
          <Row label={t.trainDays} onClick={() => openEdit("trainDaysGoal", profile.trainDaysGoal)} last><span style={valStyle}>{profile.trainDaysGoal} {t.daysWeek}</span><Icon name="chevR" color={M.ink2} size={16} /></Row>
        </div>
      </Rise>

      <Rise show={show} i={2}>
        <SecHead>{t.unitsSec} · {t.language}</SecHead>
        <div style={{ background: M.panel, borderTop: `1px solid ${M.line}`, borderBottom: `1px solid ${M.line}` }}>
          <div style={{ padding: "15px 20px", borderBottom: `1px solid ${M.hair}` }}>
            <Segmented value={profile.units} onChange={(v) => set("units", v)} options={[{ id: "metric", label: t.metric }, { id: "imperial", label: t.imperial }]} />
          </div>
          <div style={{ padding: "15px 20px", borderBottom: `1px solid ${M.hair}` }}>
            <Segmented value={lang} onChange={setLang} options={[{ id: "es", label: "Español" }, { id: "en", label: "English" }]} />
          </div>
          <Row label={t.cycleTrack} last><Toggle on={profile.cycleTracking} onChange={(v) => set("cycleTracking", v)} /></Row>
        </div>
      </Rise>

      <Rise show={show} i={3}>
        <SecHead>{t.integrations}</SecHead>
        <div style={{ background: M.panel, borderTop: `1px solid ${M.line}`, borderBottom: `1px solid ${M.line}` }}>
          {integ.map((it, i) => (
            <Row key={it.id} label={it.label} last={i === integ.length - 1}>
              <span style={{ ...valStyle, color: integrations[it.id] ? M.ok : M.ink2 }}>{integrations[it.id] ? t.connected : t.connect}</span>
              <Toggle on={integrations[it.id]} onChange={(v) => setIntegrations({ ...integrations, [it.id]: v })} />
            </Row>
          ))}
        </div>
      </Rise>

      <Rise show={show} i={4}>
        <SecHead>{t.account}</SecHead>
        <div style={{ background: M.panel, borderTop: `1px solid ${M.line}`, borderBottom: `1px solid ${M.line}` }}>
          <Row label={t.signOut}><Icon name="chevR" color={M.ink2} size={16} /></Row>
          <Row label={t.version} last><span style={valStyle}>2.0.1</span></Row>
        </div>
        <div style={{ height: 30 }} />
      </Rise>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit === "goalKg" ? t.goalWeight : t.trainDays}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, padding: "10px 0 6px" }}>
          <Stepper value={draft} step={edit === "goalKg" ? 0.5 : 1} min={edit === "goalKg" ? 40 : 1}
            onChange={setDraft} suffix={edit === "goalKg" ? "kg" : ""} w={140} />
          <PrimaryBtn tone="acc" onClick={() => { set(edit, draft); setEdit(null); }} style={{ maxWidth: 280 }}>{t.save}</PrimaryBtn>
        </div>
      </Sheet>
    </ScreenScroll>
  );
}
