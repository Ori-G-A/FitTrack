/* ============================================================
   DESKTOP — app shell: sidebar nav (7 windows) + Export/Import.
   Dashboard reuses approved DashboardA + an Alertas y avisos lede.
   ============================================================ */
const { useState: useStateDS } = React;

function DesktopNavItem({ id, icon, label, active, onClick }) {
  return (
    <button onClick={() => { haptic(); onClick(id); }} style={{
      display: "flex", alignItems: "center", gap: 13, width: "100%", padding: "0 22px", height: 50, border: "none",
      borderLeft: `3px solid ${active ? M.acc : "transparent"}`, background: active ? M.panel : "transparent", cursor: "pointer",
      color: active ? M.ink : M.ink2, transition: "background .15s", WebkitTapHighlightColor: "transparent" }}>
      <Icon name={icon} color={active ? M.ink : M.ink2} fill={active} size={21} />
      <span style={{ fontFamily: M.mono, fontSize: 11.5, fontWeight: active ? 600 : 400, letterSpacing: ".09em", textTransform: "uppercase" }}>{label}</span>
    </button>
  );
}

/* slim breaking-news alert strip above the RESUMEN masthead */
function DAlertsBand({ t, lang }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 44px", borderBottom: `1px solid ${M.line}`, background: M.accDim }}>
      <div style={{ width: 30, height: 30, flexShrink: 0, border: `1.5px solid ${M.acc}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: M.disp, fontWeight: 900, fontSize: 18, color: M.acc }}>!</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <Kicker color={M.acc}>{t.alertsTitle}</Kicker>
        <span style={{ fontFamily: M.disp, fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: "-0.01em", color: M.ink }}>{t.alertImbalanceTitle}.</span>
        <span style={{ fontSize: 13, color: M.ink2, maxWidth: 620, lineHeight: 1.45 }}>{t.alertImbalanceBody}</span>
      </div>
    </div>
  );
}

function DesktopDashboard({ lang, setLang, t }) {
  return (
    <div>
      <DAlertsBand t={t} lang={lang} />
      <DashboardA lang={lang} setLang={setLang} />
    </div>
  );
}

function FitTrackDesktop() {
  const [lang, setLang] = useLocal("lang", "es");
  const [tab, setTab] = useLocal("dtab", "dashboard");
  const [weightLog, setWeightLog] = useLocal("weightLog", []);
  const [meals, setMeals] = useLocal("meals", FT.app.todayMeals);
  const [profileSaved, setProfile] = useLocal("profile", FT.app.profile);
  const profile = { ...FT.app.profile, ...profileSaved };
  const [integrations, setIntegrations] = useLocal("integrations", FT.app.profile.integrations);
  const t = I18N[lang];

  const shared = { lang, setLang, t, weightLog, setWeightLog, meals, setMeals, profile, setProfile, integrations, setIntegrations };

  const nav = [
    { id: "entrenar", icon: "train", label: t.tabTrain },
    { id: "cuerpo", icon: "body", label: t.tabBody },
    { id: "nutricion", icon: "nutri", label: t.nutriTitle },
    { id: "biblioteca", icon: "book", label: t.tabLibrary },
    { id: "rutinas", icon: "list", label: t.tabRoutines },
    { id: "dashboard", icon: "home", label: t.tabDash },
    { id: "ajustes", icon: "settings", label: t.tabSettings },
  ];

  let Screen;
  if (tab === "dashboard") Screen = <DesktopDashboard {...shared} />;
  else if (tab === "entrenar") Screen = <DesktopEntrenar {...shared} />;
  else if (tab === "cuerpo") Screen = <DesktopCuerpo {...shared} />;
  else if (tab === "nutricion") Screen = <DesktopNutricion {...shared} />;
  else if (tab === "biblioteca") Screen = <DesktopBiblioteca {...shared} />;
  else if (tab === "rutinas") Screen = <DesktopRutinas {...shared} />;
  else Screen = <DesktopAjustes {...shared} />;

  const exportBackup = () => {
    try {
      const dump = {}; Object.keys(localStorage).forEach((k) => { if (k.startsWith("ft:")) dump[k] = localStorage.getItem(k); });
      const blob = new Blob([JSON.stringify({ app: "FitTrack", exported: new Date().toISOString(), data: dump }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "fittrack-backup.json"; a.click(); URL.revokeObjectURL(url);
    } catch (e) {}
  };

  return (
    <div style={{ width: "100vw", height: "100vh", minWidth: 1080, display: "flex", background: M.paper, fontFamily: M.disp, overflow: "hidden" }}>
      {/* sidebar */}
      <div style={{ width: 236, flexShrink: 0, borderRight: `2px solid ${M.ink}`, display: "flex", flexDirection: "column", background: M.paper }}>
        <div style={{ padding: "26px 22px 22px", borderBottom: `1px solid ${M.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 16, height: 16, background: M.acc }} />
            <div style={{ fontFamily: M.disp, fontWeight: 900, fontSize: 23, letterSpacing: "-0.04em", textTransform: "uppercase" }}>FitTrack</div>
          </div>
          <div style={{ fontFamily: M.mono, fontSize: 9.5, color: M.ink2, letterSpacing: ".18em", marginTop: 8, textTransform: "uppercase" }}>{t.tagline}</div>
        </div>
        <div style={{ paddingTop: 10, flex: 1, overflowY: "auto" }}>
          {nav.map((n) => <DesktopNavItem key={n.id} {...n} active={tab === n.id} onClick={setTab} />)}
        </div>
        <div style={{ padding: "14px 18px", borderTop: `1px solid ${M.line}`, display: "flex", gap: 8 }}>
          <GhostBtn onClick={exportBackup} style={{ flex: 1, height: 40, padding: 0 }}><Icon name="download" color={M.ink} size={15} />{t.exportData}</GhostBtn>
          <GhostBtn onClick={() => {}} style={{ flex: 1, height: 40, padding: 0 }}><Icon name="upload" color={M.ink} size={15} />{t.importData}</GhostBtn>
        </div>
        <div style={{ padding: "16px 22px 20px", borderTop: `1px solid ${M.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: M.ink, color: M.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: M.disp, fontWeight: 900, fontSize: 17 }}>{profile.name[0]}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: M.disp, fontWeight: 700, fontSize: 14.5, textTransform: "uppercase", letterSpacing: "-0.01em" }}>{profile.name}</div>
              <div style={{ fontFamily: M.mono, fontSize: 10, color: M.ink2 }}>{t[profile.goal === "cut" ? "goalCut" : profile.goal === "bulk" ? "goalBulk" : "goalMaintain"].split(" ")[0]} · {profile.goalKg}kg</div>
            </div>
          </div>
          <LangSwitch lang={lang} setLang={setLang} bg="transparent" fg={M.ink2} active={M.ink} activeFg={M.paper} border={M.line} />
        </div>
      </div>

      {/* main */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <div key={tab} style={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden" }}>
          {Screen}
        </div>
      </div>
    </div>
  );
}

window.FitTrackDesktop = FitTrackDesktop;
