import { useState, useEffect } from "react";
import { M, useLocal, BottomNav } from "./kit.jsx";
import { I18N } from "./data.js";
import { appData as defaultAppData } from "./app-data.js";
import { ScreenResumen } from "./screens/ScreenResumen.jsx";
import { ScreenEntrenar } from "./screens/ScreenEntrenar.jsx";
import { ScreenWorkout } from "./screens/ScreenWorkout.jsx";
import { ScreenCuerpo } from "./screens/ScreenCuerpo.jsx";
import { ScreenNutricion } from "./screens/ScreenNutricion.jsx";
import { ScreenAjustes } from "./screens/ScreenAjustes.jsx";
import { ScreenOnboarding } from "./screens/ScreenOnboarding.jsx";

function buildSession(routineId, appData) {
  const r = appData.routines.find((x) => x.id === routineId);
  const log = {};
  r.exercises.forEach((ex) => {
    log[ex.key] = Array.from({ length: ex.sets }, () => ({ reps: ex.reps, kg: ex.kg, done: false }));
  });
  return { routineId, startedAt: Date.now(), log };
}

export function FitTrackApp() {
  const [lang, setLang] = useLocal("lang", "es");
  const [onboarded, setOnboarded] = useLocal("onboarded", false);
  const [tab, setTab] = useLocal("tab", "resumen");
  const [session, setSession] = useLocal("session", null);
  const [showWorkout, setShowWorkout] = useState(false);
  const [weightLog, setWeightLog] = useLocal("weightLog", []);
  const [meals, setMeals] = useLocal("meals", defaultAppData.todayMeals);
  const [profile, setProfile] = useLocal("profile", defaultAppData.profile);
  const [integrations, setIntegrations] = useLocal("integrations", defaultAppData.profile.integrations);

  const t = I18N[lang];

  const startWorkout = (routineId) => { setSession(buildSession(routineId, defaultAppData)); setShowWorkout(true); };
  const resumeWorkout = () => setShowWorkout(true);
  const finishWorkout = () => { setSession(null); setShowWorkout(false); };
  const closeWorkout = () => setShowWorkout(false);

  const shared = {
    lang, setLang, t, tab, setTab, session, setSession,
    weightLog, setWeightLog, meals, setMeals,
    profile, setProfile, integrations, setIntegrations,
    startWorkout, resumeWorkout, hasSession: !!session,
    appData: defaultAppData,
  };

  const screens = {
    resumen: ScreenResumen,
    entrenar: ScreenEntrenar,
    cuerpo: ScreenCuerpo,
    nutricion: ScreenNutricion,
    ajustes: ScreenAjustes,
  };
  const Screen = screens[tab] || ScreenResumen;

  if (!onboarded) {
    return <ScreenOnboarding {...shared} onDone={() => setOnboarded(true)} />;
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: M.paper, overflow: "hidden", fontFamily: M.disp }}>
      <Screen key={tab} {...shared} />
      <BottomNav tab={tab} setTab={setTab} t={t} />
      {showWorkout && session && (
        <ScreenWorkout {...shared} onClose={closeWorkout} onFinish={finishWorkout} />
      )}
    </div>
  );
}
