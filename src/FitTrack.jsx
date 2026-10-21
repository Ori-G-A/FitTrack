import ModalSheet from "./ModalSheet.jsx";
import { CSS } from "./app-styles.js";
import { SideNavigation, BottomNavigation } from "./AppNavigation.jsx";
import { useAppTheme } from "./use-app-theme.js";
import { ACCOUNT_TABS, BODY_TABS, NAV as NAV_ITEMS, registrationRows } from "./app-navigation.js";
import { migrateFoodUnits } from "./nutrition-records.js";
import { CATALOG, CATALOG_CATS } from "./nutrition-config.js";
export { CATALOG, CATALOG_CATS } from "./nutrition-config.js";
import { round1, scaleFood } from "./nutrition-numbers.js";
export { round1, scaleFood } from "./nutrition-numbers.js";
import { Train } from "./TrainingScreen.jsx";
export { Train } from "./TrainingScreen.jsx";
import { MUSCLES } from "./training-config.js";
export { MUSCLES, EXERCISE_PRESETS } from "./training-config.js";
import React, { lazy, Suspense, useState, useEffect, useMemo, useRef } from "react";
import { withTimeout } from "./async-utils.js";
import { deleteUserData, exportUserData, importUserData, loadUserData } from "./app-data-lifecycle.js";
import { deleteAppDataForUser } from "./data-operations.js";
import { supabase } from "./supabase.js";
import { DEFAULT_GOALS, tracksCycle } from "./app-config.js";
import { Toast } from "./toast.jsx";
import {
  authUserChanged, localISO, mergePhotoUrls,
  migrateWorkouts as migrateWorkoutData, proteinAdherence,
  validateBackup as validateBackupData, WEEK_ORDER,
} from "./app-utils.js";
import { latestWeight } from "./settings-utils.js";
import {
  loadKey, resumeUserSaves, saveKey, suspendUserSaves,
  useSyncedValue, waitForUserSaves,
} from "./data-sync.js";
import { AuthScreen, SaveIndicator } from "./AuthUI.jsx";
import {
  A_ACC, A_DANGER, A_DISP, A_HAIR, A_INK, A_INK2, A_MONO, A_OK,
  DKicker, EDateNav, EPanel, Headline, KpiStrip, Rise, ScreenMast,
  useIsMobile, useReveal,
} from "./EditorialUI.jsx";
import SettingsScreen from "./SettingsScreen.jsx";
import {
  deleteUserPhotos, hydratePhotos, photoForStorage, photosForBackup, refreshPhotoUrls,
} from "./photo-storage.js";
import {
  Dumbbell, Scale, Utensils, LayoutDashboard, Plus, Trash2,
  Download, Upload, AlertTriangle,
  Check, ChevronDown, ChevronLeft, ChevronRight, Timer, Play, Pause, RotateCcw,
  Apple, Pencil, X, Clock, Activity, ListChecks, CalendarDays,
  Settings, Zap, BookOpen, Menu, Sun, Moon, Newspaper, Droplet, Ruler
} from "lucide-react";

const BodyScreen = lazy(() => import("./BodyScreen.jsx"));
const DiarioScreen = lazy(() => import("./DiarioScreen.jsx"));
const AccountScreen = lazy(() => import("./AccountScreen.jsx"));
const LibraryScreen = lazy(() => import("./LibraryScreen.jsx"));
const NutritionScreen = lazy(() => import("./NutritionScreen.jsx"));
const DashboardScreen = lazy(() => import("./DashboardScreen.jsx"));
const PlanScreen = lazy(() => import("./PlanScreen.jsx"));

/* ----------------------------- helpers ----------------------------- */
export { uid } from "./id-utils.js";
const todayISO = () => localISO();
/* ---------- catálogo nutricional (por 100 g; carnes/pescados crudo, granos/legumbres cocido, harinas seco) ---------- */
// Catálogo compartido: datos puros y export compatible.
// tazas/cucharas -> ml, para medir líquidos sin báscula
const LIQUID_MEASURES = [["1 cdta", 5], ["1 cda", 15], ["¼ taza", 60], ["½ taza", 120], ["1 taza", 240]];

const validateBackup = (value) => validateBackupData(value, DEFAULT_GOALS);
const migrateWorkouts = (workouts) => migrateWorkoutData(workouts, MUSCLES[0]);

async function sha256(s) {
  try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
  catch { return "plain:" + s; }
}
/* ----------------------------- styles ----------------------------- */
export { CSS } from "./app-styles.js";

/* ----------------------------- shared: food combo ----------------------------- */
function FoodCombo({ foods, selected, onChange, label = "Alimento", flex = 2 }) {
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const filtered = foods.filter((x) => x.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  return (
    <div className="ft-field ft-combo" style={{ flex, minWidth: 160 }}>
      <label>{label}</label>
      <input className="ft-input" placeholder="Busca en tu biblioteca…"
        value={selected ? selected.name : q}
        onChange={(e) => { setQ(e.target.value); onChange(null); setShow(true); }}
        onFocus={() => setShow(true)} onBlur={() => setTimeout(() => setShow(false), 160)} />
      {show && !selected && filtered.length > 0 && (
        <div className="ft-combo-list">
          {filtered.map((x) => (
            <button key={x.id} onMouseDown={() => { onChange(x); setShow(false); setQ(""); }}>
              <span>{x.name}</span><span className="sub">{x.kcal} kcal/100{x.unit || "g"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- shared: cantidad (g o ml según el alimento) ----------------------------- */
function AmountField({ food, value, onChange, onEnter, label = "Cantidad" }) {
  const isLiquid = food?.unit === "ml";
  return (
    <div className="ft-field" style={{ maxWidth: isLiquid ? 220 : 130 }}>
      <label>{food ? (isLiquid ? "ml" : "Gramos") : label}</label>
      <input className="ft-input ft-mono" type="number" inputMode="decimal" placeholder="0" value={value}
        onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onEnter?.()} />
      {isLiquid && (
        <div className="ft-measures">
          {LIQUID_MEASURES.map(([lbl, ml]) => <button type="button" key={lbl} onClick={() => onChange(String(ml))}>{lbl}</button>)}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- APP ----------------------------- */
export default function App() {
  const [tab, setTab] = useState("diario");
  // Fecha a la que salta la pantalla destino. La fija quien navega (una fila del
  // Diario); las llamadas normales a setTab la dejan en null = hoy.
  const [focusDate, setFocusDate] = useState(null);
  const goTo = (next, date = null) => { setFocusDate(date); setTab(next); };
  // Un aviso del Diario abre Metricas ya desplazado a la tarjeta que lo disparo.
  const [focusCard, setFocusCard] = useState(null);
  const openCard = (card) => { setFocusCard(card); setFocusDate(null); setTab("dashboard"); };
  // Tema: oscuro por defecto, que es el aspecto del prototipo. "auto" sigue al
  // sistema (y reacciona si el sistema cambia); "light" y "dark" son eleccion
  // explicita y mandan sobre el sistema.
  const { themePref, setThemePref, theme } = useAppTheme();
  const [session, setSession] = useState(undefined); // undefined = cargando, null = sin sesión
  const [sessionError, setSessionError] = useState("");
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [workouts, setWorkouts] = useState([]);
  const [weights, setWeights] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [wellness, setWellness] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [menstrualLogs, setMenstrualLogs] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const authUserIdRef = useRef(null);
  const photosRef = useRef([]);

  useEffect(() => { photosRef.current = photos; }, [photos]);

  // Escucha cambios de sesión de Supabase
  useEffect(() => {
    let active = true;
    setSessionError("");
    withTimeout(
      supabase.auth.getSession(),
      15000,
      "La verificacion de sesion tardo demasiado.",
    ).then(({ data, error }) => {
      if (error) throw error;
      if (active) {
        authUserIdRef.current = data.session?.user?.id ?? null;
        setSession(data.session ?? null);
      }
    }).catch((error) => {
      console.error("getSession", error);
      if (active) setSessionError("No se pudo verificar tu sesión.");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUserId = nextSession?.user?.id ?? null;
      if (authUserChanged(authUserIdRef.current, nextUserId)) {
        authUserIdRef.current = nextUserId;
        setLoaded(false);
        setLoadError(false);
      }
      setSessionError("");
      setSession(nextSession ?? null);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [sessionAttempt]);

  // Carga datos cuando hay sesión activa
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) { setLoaded(false); setLoadError(false); return; }
    resumeUserSaves(userId);
    let cancelled = false;
    setLoaded(false);
    setLoadError(false);
    loadUserData({
      userId, loadKey, defaultGoals: DEFAULT_GOALS, hydratePhotos, migrateWorkouts, migrateFoodUnits,
      setters: { setWorkouts, setWeights, setNutrition, setFoods, setRecipes, setRoutines,
        setMeasurements, setWellness, setPeriods, setMenstrualLogs, setPhotos, setGoals, setLoaded },
      isCancelled: () => cancelled,
      onError: (error) => { console.error("loadAppData", error); setLoadError(true); },
    });
    return () => { cancelled = true; };
  }, [session?.user?.id, loadAttempt]);

  // Recupera cargas suspendidas y renueva las URLs privadas al volver a la app.
  useEffect(() => {
    let active = true;
    const recoverVisibleApp = async () => {
      if (document.visibilityState !== "visible" || !session?.user?.id) return;
      if (!loaded) {
        setLoadAttempt((attempt) => attempt + 1);
        return;
      }
      const currentPhotos = photosRef.current;
      if (!currentPhotos.some((photo) => photo.storagePath)) return;
      const refreshed = await refreshPhotoUrls(currentPhotos);
      if (active) setPhotos((current) => mergePhotoUrls(current, refreshed));
    };
    document.addEventListener("visibilitychange", recoverVisibleApp);
    const interval = setInterval(recoverVisibleApp, 12 * 60 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", recoverVisibleApp);
    };
  }, [session?.user?.id, loaded]);

  const userId = session?.user?.id;
  useSyncedValue(userId, "workouts", workouts, loaded);
  useSyncedValue(userId, "weights", weights, loaded);
  useSyncedValue(userId, "nutrition", nutrition, loaded);
  useSyncedValue(userId, "foods", foods, loaded);
  useSyncedValue(userId, "recipes", recipes, loaded);
  useSyncedValue(userId, "routines", routines, loaded);
  useSyncedValue(userId, "measurements", measurements, loaded);
  useSyncedValue(userId, "wellness", wellness, loaded);
  useSyncedValue(userId, "periods", periods, loaded);
  useSyncedValue(userId, "menstrualLogs", menstrualLogs, loaded);
  const storedPhotosJson = useMemo(() => JSON.stringify(photos.map(photoForStorage)), [photos]);
  const storedPhotos = useMemo(() => JSON.parse(storedPhotosJson), [storedPhotosJson]);
  useSyncedValue(userId, "photos", storedPhotos, loaded);
  useSyncedValue(userId, "goals", goals, loaded);

  const signOut = () => supabase.auth.signOut();
  const deleteAllData = () => deleteUserData({
    userId, suspendUserSaves, waitForUserSaves, deleteUserPhotos,
    deleteAppData: (id) => deleteAppDataForUser(supabase, id),
    signOut, resumeUserSaves, setLoaded,
  });

  const exportData = () => exportUserData({
    data: { workouts, weights, nutrition, foods, recipes, routines, measurements, wellness, periods, menstrualLogs, photos, goals },
    photosForBackup,
    download: (backup) => {
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `fittrack-${todayISO()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    onError: (error) => alert(error?.message || "No se pudo crear la copia de seguridad"),
  });
  const fileRef = useRef();
  const importData = (event) => importUserData(event, {
    userId, createReader: () => new FileReader(), validateBackup,
    confirm: (message) => window.confirm(message), notify: (message) => alert(message),
    migrateWorkouts, migrateFoodUnits, hydratePhotos,
    setters: { setWorkouts, setWeights, setNutrition, setFoods, setRecipes, setRoutines,
      setMeasurements, setWellness, setPeriods, setMenstrualLogs, setPhotos, setGoals },
  });

  // Misma lectura que usa Ajustes: direccion del objetivo + ultimo peso registrado.
  const currentWeight = latestWeight(weights);
  const profileLine = [
    Number(goals.weeklyChange) < 0 ? "Déficit" : Number(goals.weeklyChange) > 0 ? "Superávit" : "Mantenimiento",
    currentWeight ? `${currentWeight}kg` : null,
  ].filter(Boolean).join(" · ");

  const [menuOpen, setMenuOpen] = useState(false);
  const [sheet, setSheet] = useState(null);

  const icons = { Dumbbell, Utensils, Scale, Moon, Ruler, Droplet, Newspaper, CalendarDays, LayoutDashboard, Apple };
  const withIcon = (row) => ({ ...row, icon: icons[row.icon] });
  const ADD_ROWS = registrationRows(tracksCycle(goals)).map(withIcon);
  const NAV = NAV_ITEMS.map(withIcon);

  return (
    <div className="ft-root" data-theme={theme}>
      <style>{CSS}</style>
      {session === undefined ? (
        <div className="ft-wrap"><div className="ft-empty">
          {sessionError ? (
            <>
              <AlertTriangle size={30} style={{ marginBottom: 12 }} />
              <div>{sessionError}</div>
              <button className="ft-btn" onClick={() => setSessionAttempt((attempt) => attempt + 1)} style={{ marginTop: 16 }}>
                <RotateCcw size={15} /> Reintentar
              </button>
            </>
          ) : "Cargando…"}
        </div></div>
      ) : !session ? (
        <AuthScreen />
      ) : !loaded ? (
        <div className="ft-wrap"><div className="ft-empty">
          {loadError ? (
            <>
              <AlertTriangle size={30} style={{ marginBottom: 12 }} />
              <div>No pudimos cargar tus datos. No se ha sobrescrito ninguna información.</div>
              <button className="ft-btn" onClick={() => setLoadAttempt((n) => n + 1)} style={{ marginTop: 16 }}>
                <RotateCcw size={15} /> Reintentar
              </button>
            </>
          ) : "Cargando tus datos…"}
        </div></div>
      ) : (
        <div className="ft-wrap with-side">
          <SideNavigation tab={tab} NAV={NAV} menuOpen={menuOpen} setMenuOpen={setMenuOpen} setSheet={setSheet} goTo={goTo} userEmail={session.user.email} profileLine={profileLine}>
            <SaveIndicator />
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
          </SideNavigation>
          {tab === "diario" && (
            <Suspense fallback={<div className="ft-empty">Cargando Diario…</div>}>
              <DiarioScreen workouts={workouts} nutrition={nutrition} weights={weights} measurements={measurements} wellness={wellness} periods={periods} menstrualLogs={menstrualLogs} goals={goals} setGoals={setGoals} setTab={goTo} openCard={openCard} userEmail={session.user.email} />
            </Suspense>
          )}
          {tab === "entrenar" && <Train workouts={workouts} setWorkouts={setWorkouts} routines={routines} setRoutines={setRoutines} userId={userId} periods={periods} menstrualLogs={menstrualLogs} wellness={wellness} initialDate={focusDate} />}
          {BODY_TABS.includes(tab) && (
            <Suspense fallback={<div className="ft-empty">Cargando…</div>}>
              <BodyScreen key={tab} section={tab} weights={weights} setWeights={setWeights} measurements={measurements} setMeasurements={setMeasurements} wellness={wellness} setWellness={setWellness} periods={periods} setPeriods={setPeriods} menstrualLogs={menstrualLogs} setMenstrualLogs={setMenstrualLogs} photos={photos} setPhotos={setPhotos} goals={goals} setGoals={setGoals} userId={userId} initialDate={focusDate} />
            </Suspense>
          )}
          {tab === "nutricion" && (
            <Suspense fallback={<div className="ft-empty">Cargando Nutrición…</div>}>
              <NutritionScreen nutrition={nutrition} setNutrition={setNutrition} foods={foods} recipes={recipes} goals={goals} setTab={goTo} initialDate={focusDate} />
            </Suspense>
          )}
          {(tab === "biblioteca" || tab === "rutinas") && (
            <Suspense fallback={<div className="ft-empty">Cargando Biblioteca…</div>}>
              <LibraryScreen key={tab} foods={foods} setFoods={setFoods} recipes={recipes} setRecipes={setRecipes}
                routines={routines} setRoutines={setRoutines} initialView={tab === "rutinas" ? "rutinas" : "mis"} />
            </Suspense>
          )}
          {tab === "plan" && (
            <Suspense fallback={<div className="ft-empty">Cargando Plan…</div>}>
              <PlanScreen routines={routines} setRoutines={setRoutines} workouts={workouts} nutrition={nutrition} weights={weights} measurements={measurements} wellness={wellness} setTab={goTo} />
            </Suspense>
          )}
          {tab === "dashboard" && (
            <Suspense fallback={<div className="ft-empty">Cargando Dashboard…</div>}>
              <DashboardScreen workouts={workouts} weights={weights} nutrition={nutrition} measurements={measurements} periods={periods} menstrualLogs={menstrualLogs} wellness={wellness} goals={goals} routines={routines} focusCard={focusCard} onFocused={() => setFocusCard(null)} />
            </Suspense>
          )}
          {/* Las tres puertas viejas —Mas, Perfil y Ajustes— son la misma
              pantalla con la pestana correspondiente. Los enlaces existentes a
              "perfil" y "ajustes" siguen funcionando y aterrizan donde tocaba. */}
          {ACCOUNT_TABS.includes(tab) && (
            <Suspense fallback={<div className="ft-empty">Cargando tu cuenta…</div>}>
              <AccountScreen
                section={tab === "ajustes" ? "datos" : "perfil"}
                userEmail={session.user.email}
                goals={goals} setGoals={setGoals} weights={weights}
                periods={periods} menstrualLogs={menstrualLogs} wellness={wellness}
                setTab={goTo}
                exportData={exportData} importData={() => fileRef.current.click()}
                signOut={signOut} deleteAllData={deleteAllData}
                themePref={themePref} setThemePref={setThemePref} theme={theme}
              />
            </Suspense>
          )}

          <BottomNavigation tab={tab} goTo={goTo} setSheet={setSheet} />

          <Toast />

          {sheet && (
            <ModalSheet title="Registrar" onClose={() => setSheet(null)}>
              {({ closeForNavigation }) => <>
                <h3>Registrar<button onClick={() => setSheet(null)} aria-label="Cerrar"><X size={18} /></button></h3>
                {ADD_ROWS.map(({ id, label, sub, icon: Ic }) => (
                  <button key={id} className="ft-sheet-row" onClick={() => { goTo(id); closeForNavigation(); }}>
                    <Ic size={17} />{label}<span className="sub">{sub}</span>
                  </button>
                ))}
              </>}
            </ModalSheet>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- date bar ----------------------------- */
function DateBar({ date, setDate }) {
  const shift = (n) => { const d = new Date(date + "T00:00:00"); d.setDate(d.getDate() + n); setDate(localISO(d)); };
  const d = new Date(date + "T00:00:00");
  return (
    <div className="ft-datebar">
      <button className="nav" onClick={() => shift(-1)}><ChevronLeft size={18} /></button>
      <div className="lbl">
        <div className="d">{date === todayISO() ? "Hoy" : d.toLocaleDateString("es-ES", { weekday: "long" })}</div>
        <div className="y">{d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</div>
      </div>
      <button className="nav" onClick={() => shift(1)}><ChevronRight size={18} /></button>
    </div>
  );
}

/* ----------------------------- TRAIN ----------------------------- */
/* ----------------------------- BODY (peso + medidas + bienestar) ----------------------------- */
/* ----------------------------- NUTRITION ----------------------------- */


/* ----------------------------- ROUTINES ----------------------------- */
// El dia que le toca a una rutina vive en la propia rutina (suggestedDay), asi
// que Rutinas y Plan cuentan lo mismo sin pasarse nada.
const dayNameOf = (routine) => {
  const day = WEEK_ORDER.find((d) => routine.suggestedDay != null && Number(routine.suggestedDay) === d.dow);
  return day ? day.label : null;
};

const exLine = (exercise) => [
  exercise.primary || "Sin grupo",
  `${exercise.targetSets || 3}×${exercise.targetReps || "8"}`,
  exercise.targetRpe ? `RPE ${exercise.targetRpe}` : null,
  exercise.restSec ? `${exercise.restSec}s` : null,
].filter(Boolean).join(" · ");


