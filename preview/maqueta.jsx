import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Apple, Dumbbell, Download, LayoutDashboard, ListChecks, Newspaper, Scale, Settings, Upload, Utensils } from "lucide-react";
import { CSS } from "../src/FitTrack.jsx";
import BodyScreen from "../src/BodyScreen.jsx";
import DiarioScreen from "../src/DiarioScreen.jsx";
import DashboardScreen from "../src/DashboardScreen.jsx";
import { addDays, localISO } from "../src/app-utils.js";
import SettingsScreen from "../src/SettingsScreen.jsx";
import { Train } from "../src/FitTrack.jsx";

// Maqueta sin Supabase: el mismo banner y la misma pantalla Cuerpo, con datos de ejemplo.
const NAV = [
  { id: "diario", label: "Diario", icon: Newspaper },
  { id: "entrenar", label: "Entrenar", icon: Dumbbell },
  { id: "cuerpo", label: "Cuerpo", icon: Scale },
  { id: "nutricion", label: "Nutrición", icon: Utensils },
  { id: "biblioteca", label: "Biblioteca", icon: Apple },
  { id: "rutinas", label: "Rutinas", icon: ListChecks },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "ajustes", label: "Ajustes", icon: Settings },
];

const periods = [
  { id: "p1", date: "2026-04-26", duration: 5 },
  { id: "p2", date: "2026-05-26", duration: 6 },
  { id: "p3", date: "2026-06-26", duration: 6 },
  { id: "p4", date: "2026-07-29", duration: 5 },
  { id: "p5", date: "2026-08-04", duration: 5 },
];
const menstrualLogs = [
  { id: "m1", date: "2026-08-16", bleedingLevel: "not_logged", cervicalFluid: "creamy" },
  { id: "m2", date: "2026-08-17", bleedingLevel: "not_logged", cervicalFluid: "slippery_eggwhite", pelvicPain: "left" },
  { id: "m3", date: "2026-08-18", bleedingLevel: "not_logged", cervicalFluid: "dry" },
  { id: "m4", date: "2026-08-22", bleedingLevel: "not_logged", bloatingLevel: 2, breastSensitivity: 2, acneLevel: 1, crampsLevel: 1 },
  { id: "m5", date: "2026-08-26", bleedingLevel: "not_logged", bloatingLevel: 3, breastSensitivity: 3, acneLevel: 2 },
  { id: "m6", date: "2026-08-28", bleedingLevel: "heavy", crampsLevel: 7 },
  { id: "m7", date: "2026-08-29", bleedingLevel: "heavy", crampsLevel: 6 },
  { id: "m8", date: "2026-08-30", bleedingLevel: "heavy", crampsLevel: 4 },
  { id: "m9", date: "2026-08-31", bleedingLevel: "medium", crampsLevel: 2, bloatingLevel: 1 },
  { id: "m10", date: "2026-09-01", bleedingLevel: "light", crampsLevel: 1 },
];
const wellness = [
  { id: "w1", date: "2026-08-22", energy: 2, sleep: 6 },
  { id: "w2", date: "2026-08-26", energy: 3, sleep: 7 },
  { id: "w3", date: "2026-08-29", energy: 3, sleep: 7 },
];
const workouts = [
  { id: "t1", date: "2026-07-14", durationMin: 55, exercises: [{ id: "e1", name: "Peso muerto", primary: "Espalda", sets: [{ kg: 60, reps: 5, rpe: "7" }, { kg: 55, reps: 8, rpe: "7" }] }], cardio: [] },
  { id: "t2", date: "2026-08-04", durationMin: 58, exercises: [{ id: "e2", name: "Peso muerto", primary: "Espalda", sets: [{ kg: 65, reps: 5, rpe: "8" }] }], cardio: [] },
  { id: "t3", date: "2026-08-25", durationMin: 61, exercises: [{ id: "e3", name: "Peso muerto", primary: "Espalda", sets: [{ kg: 70, reps: 4, rpe: "8" }] }], cardio: [] },
];
const weights = [
  { id: "k1", date: "2026-08-24", kg: 72.8 },
  { id: "k2", date: "2026-08-28", kg: 72.4 },
  { id: "k3", date: "2026-08-31", kg: 72.1 },
];

// Datos del Diario relativos a hoy: la pantalla mira hoy/ayer y el aviso de ritmo
// pide 21 dias de pesajes, asi que fechas fijas no servirian de maqueta.
const HOY = localISO();
const AYER = addDays(HOY, -1);
// -0,9 kg/sem contra un objetivo de -0,4: dispara el aviso topado en +300 kcal.
const diarioWeights = Array.from({ length: 22 }, (_, i) => ({
  id: `dw${i}`, date: addDays(HOY, -21 + i), kg: Math.round((72.8 - (0.9 / 7) * i) * 10) / 10,
}));
const diarioNutrition = [
  { id: "dn1", date: HOY, name: "Avena con yogur", kcal: 420, protein: 28 },
  { id: "dn2", date: HOY, name: "Pollo con arroz", kcal: 610, protein: 45 },
  { id: "dn3", date: AYER, name: "Tortilla y pan", kcal: 380, protein: 24 },
];
// Sesion de hoy con series vacias, como la deja cargar una rutina: es lo que
// necesita la pantalla de sesion guiada para tener algo que registrar.
const empty = (n) => Array.from({ length: n }, (_, i) => ({ id: "s" + Math.random().toString(36).slice(2), reps: "", kg: "", rpe: "" }));
const sesionHoy = {
  id: "hoy", date: HOY, durationMin: 0, cardio: [],
  exercises: [
    { id: "h1", name: "Press banca", primary: "Pecho", secondary: ["Tríceps"], targetReps: "6", targetRpe: "7–8", notes: "Ancla del día: la serie de tope puede llegar a RPE 8.", sets: empty(4) },
    { id: "h2", name: "Press militar", primary: "Hombros", secondary: [], targetReps: "8", targetRpe: "6–7", sets: empty(3) },
    { id: "h3", name: "Elevaciones laterales", primary: "Hombros", secondary: [], targetReps: "15", targetRpe: "6–7", sets: empty(3) },
  ],
};

const diarioWorkouts = [
  { id: "dt1", date: AYER, durationMin: 55, cardio: [], exercises: [
    { id: "de1", name: "Remo con barra", primary: "Espalda", sets: [{ kg: 82.5, reps: 8, rpe: "7" }, { kg: 82.5, reps: 8, rpe: "8" }] },
    { id: "de2", name: "Dominadas", primary: "Espalda", sets: [{ kg: 8, reps: 6, rpe: "8" }] },
  ] },
];

function App() {
  const [tab, setTab] = useState("diario");
  const [themePref, setThemePref] = useState("auto");
  const [menuOpen, setMenuOpen] = useState(false);
  const [logs, setLogs] = useState(menstrualLogs);
  const [w, setW] = useState(weights);
  const [wel, setWel] = useState(wellness);
  const [per, setPer] = useState(periods);
  const [goals, setGoals] = useState({ startWeight: "", targetWeight: "68", weeklyChange: -0.4, kcalTarget: 2200, proteinTarget: 150, autoMacros: false, activity: "moderado", proteinPerKg: 2, proteinMeals: 4 });
  const [wk, setWk] = useState([...workouts, sesionHoy]);
  const profileLine = "Déficit · 72kg";
  const noop = () => {};
  return (
    <div className="ft-root" data-theme={themePref === "auto" ? "dark" : themePref}>
      <style>{CSS}</style>
      <div className="ft-wrap with-side">
          <aside className={menuOpen ? "ft-side open" : "ft-side"} onMouseLeave={() => setMenuOpen(false)}>
            <button className="ft-side-logo" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Menú">
              <span className="mark"><Dumbbell size={20} /></span>
              <span className="label"><b>FitTrack</b><small>tu progreso, medido</small></span>
            </button>
            <nav className="ft-nav">
              {NAV.map(({ id, label, icon: Ic }) => (
                <button key={id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setMenuOpen(false); }} title={label}>
                  <Ic size={17} /><span className="label">{label}</span>
                </button>
              ))}
            </nav>
            <div className="ft-side-foot">
              
              <button className="ft-iconbtn" onClick={() => {}} title="Exportar" aria-label="Exportar"><Download size={15} /><span className="label">Exportar</span></button>
              <button className="ft-iconbtn" onClick={() => {}} title="Importar" aria-label="Importar"><Upload size={15} /><span className="label">Importar</span></button>
              
              <div className="ft-user" title={profileLine}>
                <span className="avatar">{"O"}</span>
                <span className="label">
                  <b>{"oriana"}</b>
                  <small>{profileLine}</small>
                </span>
              </div>
            </div>
          </aside>
        {tab === "diario" && (
          <DiarioScreen workouts={diarioWorkouts} nutrition={diarioNutrition} weights={diarioWeights}
            measurements={[{ id: "dm1", date: AYER, cintura: 74, cadera: 96 }]}
            wellness={[{ id: "ds1", date: HOY, sleep: 7.5, energy: 4, notes: "" }]}
            goals={goals} setGoals={setGoals} setTab={setTab} />
        )}
        {tab === "dashboard" && (
          <DashboardScreen workouts={diarioWorkouts} weights={diarioWeights} nutrition={diarioNutrition}
            measurements={[]} periods={per} menstrualLogs={logs} wellness={wel} goals={goals} />
        )}
        {tab === "cuerpo" && (
          <BodyScreen weights={w} setWeights={setW} measurements={[]} setMeasurements={noop} wellness={wel} setWellness={setWel}
            periods={per} setPeriods={setPer} menstrualLogs={logs} setMenstrualLogs={setLogs} photos={[]} setPhotos={noop}
            goals={goals} setGoals={setGoals} userId="maqueta" />
        )}
        {tab === "ajustes" && (
          <SettingsScreen goals={goals} setGoals={setGoals} weights={w} exportData={noop} userEmail="ana@fittrack.app" signOut={noop} deleteAllData={noop}
            themePref={themePref} setThemePref={setThemePref} theme={themePref === "auto" ? "dark" : themePref} />
        )}
        {tab === "entrenar" && (
          <Train workouts={wk} setWorkouts={setWk} routines={[]} setRoutines={noop} userId="maqueta" periods={per} menstrualLogs={logs} wellness={wel} />
        )}
        {!["diario", "dashboard", "cuerpo", "ajustes", "entrenar"].includes(tab) && (
          <div className="ft-card"><h2>{tab}</h2><div className="ft-empty">Maqueta: Diario, Cuerpo, Entrenar y Ajustes traen datos de ejemplo.</div></div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
