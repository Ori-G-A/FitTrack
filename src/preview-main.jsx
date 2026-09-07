// TEMPORAL — banco de pruebas visual. Monta las pantallas reales con datos de
// ejemplo para poder verlas sin pasar por el login. Borrar junto con preview.html.
import React, { Suspense, lazy, useState } from "react";
import { createRoot } from "react-dom/client";
import { CSS, Train } from "./FitTrack.jsx";
import { ROUTINE_TEMPLATES, templateToAppRoutine } from "./fase1Config.js";
import { addDays, localISO } from "./app-utils.js";
import { DEFAULT_GOALS } from "./app-config.js";

const DiarioScreen = lazy(() => import("./DiarioScreen.jsx"));
const SessionScreen = lazy(() => import("./SessionScreen.jsx"));
const DashboardScreen = lazy(() => import("./DashboardScreen.jsx"));
const PlanScreen = lazy(() => import("./PlanScreen.jsx"));
const BodyScreen = lazy(() => import("./BodyScreen.jsx"));
const MoreScreen = lazy(() => import("./MoreScreen.jsx"));
const PerfilScreen = lazy(() => import("./PerfilScreen.jsx"));
const LibraryScreen = lazy(() => import("./LibraryScreen.jsx"));
const NutritionScreen = lazy(() => import("./NutritionScreen.jsx"));

const today = localISO();
const day = (n) => addDays(today, n);
let seq = 0;
const uid = () => `f${++seq}`;

// Peso: 90 días bajando ~0,62 kg/sem contra un objetivo de -0,30, que es justo
// la desviación que dispara el aviso de ritmo del Diario.
const weights = Array.from({ length: 90 }, (_, i) => {
  const d = -89 + i;
  const noise = Math.sin(i * 1.7) * 0.25 + Math.sin(i * 0.6) * 0.15;
  return { id: uid(), date: day(d), kg: +(68.9 - (d / 7) * 0.62 + noise).toFixed(1) };
}).filter((_, i) => i % 10 !== 3); // algún día sin pesaje, como en la vida real

const meals = [
  ["Yogur griego 0% con avena", 346, 28, 44, 7],
  ["Pechuga de pollo con arroz", 468, 42, 56, 6],
  ["Batido de proteína", 118, 24, 2, 2],
  ["Salmón con verduras", 392, 34, 12, 22],
];
const nutrition = [];
for (let d = -30; d <= 0; d++) {
  const count = d === 0 ? 3 : 4;
  meals.slice(0, count).forEach(([name, kcal, protein, carbs, fat]) => {
    const k = 1 + Math.sin(d * 0.9) * 0.08;
    nutrition.push({
      id: uid(), date: day(d), name, grams: null,
      kcal: Math.round(kcal * k), protein: Math.round(protein * k),
      carbs: Math.round(carbs * k), fat: Math.round(fat * k),
    });
  });
}

const EX = [
  ["Sentadilla", "Cuádriceps", 4, 5, 92, "7-8"],
  ["Press banca", "Pecho", 4, 6, 58, "7-8"],
  ["Remo con barra", "Espalda", 4, 8, 62, "7-8"],
  ["Press militar", "Hombros", 3, 8, 34, "6-7"],
  ["Peso muerto rumano", "Femoral", 3, 8, 78, "7-8"],
  ["Elevaciones laterales", "Hombros", 3, 15, 10, "6"],
];
const makeExercise = ([name, primary, sets, reps, kg, targetRpe], weekIdx, logged = true) => ({
  id: uid(), name, primary, secondary: [],
  targetReps: String(reps), targetRpe, notes: "",
  sets: Array.from({ length: sets }, (_, s) => logged
    ? { id: uid(), reps: String(reps - (s > 1 ? 1 : 0)), kg: String(+(kg + weekIdx * 2.5).toFixed(1)), rpe: String(7 + Math.min(2, s * 0.5)) }
    : { id: uid(), reps: "", kg: "", rpe: "" }),
});

// 12 semanas de sesiones, 4 por semana, con la carga subiendo semana a semana.
const workouts = [];
for (let w = 11; w >= 0; w--) {
  [1, 3, 5, 6].forEach((dow, n) => {
    const offset = -(w * 7) + dow - 7;
    if (offset > 0) return;
    const picks = n % 2 === 0 ? [EX[0], EX[4], EX[5]] : [EX[1], EX[2], EX[3]];
    workouts.push({
      id: uid(), date: day(offset), durationMin: 52 + n * 4,
      exercises: picks.map((e) => makeExercise(e, 11 - w)),
      cardio: n === 3 ? [{ id: uid(), type: "Bici", minutes: 40, kcal: 320 }] : [],
    });
  });
}
// Hoy: sesión cargada del plan y a medio registrar, que es lo que ve la pantalla
// de sesión guiada al entrar.
const todaySets = [
  makeExercise(EX[1], 11, true),
  makeExercise(EX[2], 11, false),
  makeExercise(EX[3], 11, false),
];
todaySets[1].sets[0] = { id: uid(), reps: "8", kg: "62.5", rpe: "7" };
workouts.push({ id: uid(), date: today, durationMin: 0, exercises: todaySets, cardio: [] });

const measurements = Array.from({ length: 8 }, (_, i) => ({
  id: uid(), date: day(-84 + i * 12),
  cintura: +(79 - i * 0.7).toFixed(1), cadera: +(99 - i * 0.4).toFixed(1),
  pecho: +(92 - i * 0.3).toFixed(1), brazo: +(29.5 + i * 0.05).toFixed(1), muslo: +(58 - i * 0.3).toFixed(1),
}));

const wellness = Array.from({ length: 30 }, (_, i) => ({
  id: uid(), date: day(-29 + i),
  sleep: +(6.4 + Math.sin(i * 1.3) * 1.1).toFixed(1),
  restingHr: Math.round(54 + Math.sin(i * 0.5) * 3 + (i > 24 ? 5 : 0)),
  steps: i % 9 === 4 ? null : Math.round(7600 + Math.sin(i * 1.1) * 2600),
  energy: 3 + (Math.sin(i * 0.8) > 0.4 ? 1 : Math.sin(i * 0.8) < -0.6 ? -1 : 0),
  notes: i === 29 ? "Rodilla algo cargada en la sentadilla" : "",
}));

const periods = [{ id: uid(), date: day(-84), duration: 5 }, { id: uid(), date: day(-56), duration: 4 },
  { id: uid(), date: day(-28), duration: 5 }];
const menstrualLogs = [-84, -83, -82, -56, -55, -28, -27, -26].map((d) => ({
  id: uid(), date: day(d), bleedingLevel: "medium", cervicalFluid: "sticky",
  crampsLevel: 2, breastSensitivity: 1, bloatingLevel: 1, acneLevel: 0, appetiteChange: "none", pelvicPain: "not_logged",
}));

// Rutinas con dia asignado, que es de donde el Plan saca la semana.
const PLAN_ROUTINES = [
  { id: "rp", name: "Empuje — Press horizontal + hombro", focus: "Pecho, hombro, tríceps", suggestedDay: 1, intensity: "Moderada", estimatedMin: 58,
    exercises: EX.slice(1, 4).map(([name, primary, sets, reps, , rpe]) => ({ id: uid(), name, primary, targetSets: sets, targetReps: String(reps), targetRpe: rpe })) },
  { id: "rt", name: "Tracción — Remo y dominadas", focus: "Espalda, bíceps", suggestedDay: 3, intensity: "Moderada", estimatedMin: 55,
    exercises: EX.slice(2, 5).map(([name, primary, sets, reps, , rpe]) => ({ id: uid(), name, primary, targetSets: sets, targetReps: String(reps), targetRpe: rpe })) },
  { id: "rl", name: "Pierna — Cadena posterior", focus: "Cuádriceps y femoral", suggestedDay: 5, intensity: "Alta", estimatedMin: 65,
    exercises: [EX[0], EX[4], EX[5]].map(([name, primary, sets, reps, , rpe]) => ({ id: uid(), name, primary, targetSets: sets, targetReps: String(reps), targetRpe: rpe, isOptional: name === "Elevaciones laterales" })) },
  { id: "rs", name: "Sesión amable — movilidad", focus: "Recuperación activa", suggestedDay: 6, intensity: "Amable", estimatedMin: 30, exercises: [] },
];

// Rutinas reales de las plantillas: traen calentamiento, notas y version minima.
const TEMPLATE_ROUTINES = ROUTINE_TEMPLATES.map((t) => templateToAppRoutine(t, uid));

const SCREENS = ["Diario", "Entrenar", "Nutrición", "Cuerpo", "Plan", "Biblioteca", "Métricas", "Más", "Perfil"];

function Preview() {
  const [screen, setScreen] = useState("Diario");
  // El Diario navega con la fecha de la entrada; aqui se traduce el id de
  // pestana real al nombre del banco de pruebas.
  const [focus, setFocus] = useState(null);
  // Un destino por pestana real. Colapsarlos aqui hacia que toda fila del Diario
  // aterrizara en Entrenar, que no es lo que hace la app.
  const TAB_TO_SCREEN = { entrenar: "Entrenar", nutricion: "Nutrición", cuerpo: "Cuerpo", rutinas: "Biblioteca", biblioteca: "Biblioteca", mas: "Más", perfil: "Perfil", ajustes: "Más" };
  const goTo = (tab, date = null) => { setFocus(date); setScreen(TAB_TO_SCREEN[tab] || "Diario"); };
  const [card, setCard] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [goals, setGoals] = useState({ ...DEFAULT_GOALS, kcalTarget: 1850, proteinTarget: 150, weeklyChange: -0.3, targetWeight: "68", startWeight: "" });
  const [exercises, setExercises] = useState(todaySets);
  const [planRoutines, setPlanRoutines] = useState(PLAN_ROUTINES);
  const [libRoutines, setLibRoutines] = useState(TEMPLATE_ROUTINES);
  const [libFoods, setLibFoods] = useState([
    { id: "f1", name: "Yogur griego 0%", kcal: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: "g" },
    { id: "f2", name: "Pechuga de pollo (cruda)", kcal: 120, protein: 22.5, carbs: 0, fat: 2.6, unit: "g" },
    { id: "f3", name: "Avena en hojuelas", kcal: 389, protein: 16.9, carbs: 66, fat: 6.9, unit: "g" },
  ]);
  const [libRecipes, setLibRecipes] = useState([
    { id: "r1", name: "Bowl de yogur y avena", servings: 1, items: [
      { id: "i1", name: "Yogur griego 0%", grams: 200, unit: "g", kcal: 118, protein: 20, carbs: 7.2, fat: 0.8 },
      { id: "i2", name: "Avena en hojuelas", grams: 60, unit: "g", kcal: 233, protein: 10.1, carbs: 39.6, fat: 4.1 },
    ] },
  ]);
  const [trainWorkouts, setTrainWorkouts] = useState(workouts);
  const [feedNutrition, setFeedNutrition] = useState(nutrition);
  const [feedWeights, setFeedWeights] = useState(weights);
  const [feedMeas, setFeedMeas] = useState(measurements);
  const [feedWellness, setFeedWellness] = useState(wellness);
  const [feedPeriods, setFeedPeriods] = useState(periods);
  const [feedLogs, setFeedLogs] = useState(menstrualLogs);

  React.useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  return (
    <div className="ft-root" data-theme={theme}>
      <style>{CSS}</style>
      <div className="ft-wrap">
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {SCREENS.map((s) => (
            <button key={s} className={s === screen ? "ft-btn" : "ft-btn ghost"} onClick={() => setScreen(s)}>{s}</button>
          ))}
          <button className="ft-btn ghost" style={{ marginLeft: "auto" }} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            Tema {theme}
          </button>
        </div>
        <Suspense fallback={<div className="ft-empty">Cargando…</div>}>
          {screen === "Diario" && (
            <DiarioScreen workouts={workouts} nutrition={nutrition} weights={weights} measurements={measurements}
              wellness={wellness} periods={periods} menstrualLogs={menstrualLogs} goals={goals} setGoals={setGoals}
              setTab={goTo} openCard={(card) => { setCard(card); setScreen("Métricas"); }} />
          )}
          {screen === "Entrenar" && (
            <Train key={focus || "hoy"} workouts={trainWorkouts} setWorkouts={setTrainWorkouts} routines={libRoutines} setRoutines={setLibRoutines}
              userId="preview" periods={periods} menstrualLogs={menstrualLogs} wellness={wellness} initialDate={focus} />
          )}
          {screen === "Nutrición" && (
            <NutritionScreen key={focus || "hoy"} nutrition={feedNutrition} setNutrition={setFeedNutrition} foods={libFoods} recipes={libRecipes}
              goals={goals} setTab={goTo} initialDate={focus} />
          )}
          {screen === "Cuerpo" && (
            <BodyScreen key={focus || "hoy"} weights={feedWeights} setWeights={setFeedWeights} measurements={feedMeas} setMeasurements={setFeedMeas}
              wellness={feedWellness} setWellness={setFeedWellness} periods={feedPeriods} setPeriods={setFeedPeriods}
              menstrualLogs={feedLogs} setMenstrualLogs={setFeedLogs} photos={[]} setPhotos={() => {}}
              goals={goals} setGoals={setGoals} userId="preview" initialDate={focus} />
          )}
          {screen === "Más" && (
            <MoreScreen userEmail="ana@correo.com" goals={goals} weights={feedWeights} periods={feedPeriods} menstrualLogs={feedLogs}
              foods={[]} recipes={[]} routines={libRoutines} theme={theme} setThemePref={setTheme}
              exportData={() => {}} importData={() => {}} setTab={goTo} />
          )}
          {screen === "Perfil" && (
            <PerfilScreen userEmail="ana@correo.com" goals={goals} setGoals={setGoals}
              periods={feedPeriods} menstrualLogs={feedLogs} wellness={feedWellness} setTab={goTo} />
          )}
          {screen === "Sesión" && (
            <SessionScreen exercises={exercises} writeExercises={setExercises} onExit={() => {}}
              lastPerformance={{ "press banca": { reps: 6, kg: 57.5 } }} />
          )}
          {screen === "Plan" && (
            <PlanScreen routines={planRoutines} setRoutines={setPlanRoutines} workouts={workouts}
              nutrition={feedNutrition} weights={feedWeights} measurements={feedMeas} wellness={feedWellness} setTab={goTo} />
          )}
          {screen === "Biblioteca" && <LibraryScreen foods={libFoods} setFoods={setLibFoods} recipes={libRecipes} setRecipes={setLibRecipes} routines={libRoutines} setRoutines={setLibRoutines} initialView="rutinas" />}
          {screen === "Métricas" && (
            <DashboardScreen workouts={workouts} weights={weights} nutrition={nutrition} measurements={measurements}
              periods={periods} menstrualLogs={menstrualLogs} wellness={wellness} goals={goals} routines={planRoutines}
              focusCard={card} onFocused={() => setCard(null)} />
          )}
        </Suspense>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Preview />);
