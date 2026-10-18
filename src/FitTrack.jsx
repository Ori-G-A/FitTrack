import { lastTrainingPerformance, trainingSummary } from "./training-metrics.js";
import React, { lazy, Suspense, useState, useEffect, useMemo, useRef } from "react";
import { withTimeout } from "./async-utils.js";
import { deleteUserData, exportUserData, importUserData, loadUserData } from "./app-data-lifecycle.js";
import { deleteAppDataForUser } from "./data-operations.js";
import { supabase } from "./supabase.js";
import { PLACES, ROUTINE_TEMPLATES, routinePlace, templateToAppRoutine, WARMUP, guessPrimaryMuscle, isJointLaxityRisk } from "./fase1Config.js";
import { DEFAULT_GOALS, tracksCycle } from "./app-config.js";
import { Toast } from "./toast.jsx";
import {
  authUserChanged, canonExercise, epley, loadProgressHighlight, localISO, mergePhotoUrls,
  migrateWorkouts as migrateWorkoutData, proteinAdherence, readThemePref, resolveTheme,
  THEME_KEY, validateBackup as validateBackupData, WEEK_ORDER, applyAdjustments,
} from "./app-utils.js";
import { inferCyclePhase } from "./cycle-inference.js";
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
const SessionScreen = lazy(() => import("./SessionScreen.jsx"));
const AccountScreen = lazy(() => import("./AccountScreen.jsx"));
const LibraryScreen = lazy(() => import("./LibraryScreen.jsx"));
const NutritionScreen = lazy(() => import("./NutritionScreen.jsx"));
const DashboardScreen = lazy(() => import("./DashboardScreen.jsx"));
const PlanScreen = lazy(() => import("./PlanScreen.jsx"));

/* ----------------------------- helpers ----------------------------- */
export const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => localISO();
export const round1 = (x) => Math.round(x * 10) / 10;
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
const clock = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(m)}:${p(ss)}` : `${p(m)}:${p(ss)}`;
};
export const MUSCLES = ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Cuádriceps", "Femoral", "Glúteos", "Aductores", "Gemelos", "Core", "Trapecio", "Antebrazo"];
const MUSCLE_COLOR = {
  Pecho: "#e7531c", Espalda: "#5ad1ff", Hombros: "#ff8a3d", Bíceps: "#ff6b9d", Tríceps: "#b388ff",
  Cuádriceps: "#d99000", Femoral: "#2f8f6a", Glúteos: "#e7531c", Aductores: "#c06fa0", Gemelos: "#4a9d5e", Core: "#6a655a", Trapecio: "#7a7468", Antebrazo: "#8a6fc0",
};
const CARDIO_TYPES = ["Caminar", "Correr", "Bici", "Elíptica", "Remo", "Natación", "HIIT", "Otro"];

export const EXERCISE_PRESETS = [
  // Pecho
  { name: "Press banca", primary: "Pecho", secondary: ["Tríceps", "Hombros"] },
  { name: "Press inclinado", primary: "Pecho", secondary: ["Hombros", "Tríceps"] },
  { name: "Aperturas", primary: "Pecho", secondary: [] },
  { name: "Fondos en paralelas", primary: "Pecho", secondary: ["Tríceps", "Hombros"] },
  // Espalda
  { name: "Dominadas", primary: "Espalda", secondary: ["Bíceps", "Antebrazo"] },
  { name: "Jalón al pecho", primary: "Espalda", secondary: ["Bíceps"] },
  { name: "Remo", primary: "Espalda", secondary: ["Bíceps", "Trapecio"] },
  { name: "Peso muerto", primary: "Espalda", secondary: ["Femoral", "Glúteos", "Trapecio", "Core"] },
  { name: "Pull-over", primary: "Espalda", secondary: ["Pecho"] },
  // Hombros
  { name: "Press militar", primary: "Hombros", secondary: ["Tríceps"] },
  { name: "Elevaciones laterales", primary: "Hombros", secondary: [] },
  { name: "Pájaros (deltoide posterior)", primary: "Hombros", secondary: ["Espalda"] },
  { name: "Face pull", primary: "Hombros", secondary: ["Espalda"] },
  // Bíceps / Tríceps / Antebrazo
  { name: "Curl bíceps", primary: "Bíceps", secondary: ["Antebrazo"] },
  { name: "Curl martillo", primary: "Bíceps", secondary: ["Antebrazo"] },
  { name: "Extensión tríceps", primary: "Tríceps", secondary: [] },
  { name: "Fondos en banco", primary: "Tríceps", secondary: ["Pecho"] },
  { name: "Curl de muñeca", primary: "Antebrazo", secondary: [] },
  // Cuádriceps
  { name: "Sentadilla", primary: "Cuádriceps", secondary: ["Glúteos", "Femoral", "Core"] },
  { name: "Prensa", primary: "Cuádriceps", secondary: ["Glúteos", "Femoral"] },
  { name: "Zancadas", primary: "Cuádriceps", secondary: ["Glúteos", "Femoral"] },
  { name: "Extensión de cuádriceps", primary: "Cuádriceps", secondary: [] },
  { name: "Step-up", primary: "Cuádriceps", secondary: ["Glúteos"] },
  // Femoral
  { name: "Peso muerto rumano", primary: "Femoral", secondary: ["Glúteos", "Espalda", "Core"] },
  { name: "Curl femoral", primary: "Femoral", secondary: [] },
  { name: "Buenos días", primary: "Femoral", secondary: ["Glúteos", "Espalda"] },
  // Glúteos
  { name: "Hip thrust", primary: "Glúteos", secondary: ["Femoral"] },
  { name: "Puente de glúteo", primary: "Glúteos", secondary: ["Femoral"] },
  { name: "Patada de glúteo", primary: "Glúteos", secondary: [] },
  { name: "Abducción de cadera", primary: "Glúteos", secondary: [] },
  // Aductores
  { name: "Aducción de cadera", primary: "Aductores", secondary: [] },
  { name: "Sentadilla sumo", primary: "Aductores", secondary: ["Cuádriceps", "Glúteos"] },
  { name: "Zancada lateral", primary: "Aductores", secondary: ["Cuádriceps", "Glúteos"] },
  // Gemelos / Core / Trapecio
  { name: "Elevación de gemelos", primary: "Gemelos", secondary: [] },
  { name: "Plancha", primary: "Core", secondary: [] },
  { name: "Crunch", primary: "Core", secondary: [] },
  { name: "Elevación de piernas", primary: "Core", secondary: [] },
  { name: "Rueda abdominal", primary: "Core", secondary: ["Espalda"] },
  { name: "Encogimientos (shrugs)", primary: "Trapecio", secondary: ["Antebrazo"] },
];

/* ---------- catálogo nutricional (por 100 g; carnes/pescados crudo, granos/legumbres cocido, harinas seco) ---------- */
export const CATALOG_CATS = ["Verduras", "Frutas", "Lácteos y huevos", "Carne de res", "Carne de cerdo", "Aves", "Pescados y mariscos", "Legumbres", "Cereales y granos", "Harinas y panes", "Frutos secos y semillas", "Aceites y grasas"];
const CATALOG_RAW = [
  ["Verduras", "Brócoli", 34, 2.8, 7, 0.4], ["Verduras", "Espinaca", 23, 2.9, 3.6, 0.4], ["Verduras", "Lechuga", 15, 1.4, 2.9, 0.2],
  ["Verduras", "Tomate", 18, 0.9, 3.9, 0.2], ["Verduras", "Zanahoria", 41, 0.9, 10, 0.2], ["Verduras", "Pepino", 15, 0.7, 3.6, 0.1],
  ["Verduras", "Pimiento rojo", 31, 1, 6, 0.3], ["Verduras", "Cebolla", 40, 1.1, 9.3, 0.1], ["Verduras", "Ajo", 149, 6.4, 33, 0.5],
  ["Verduras", "Calabacín", 17, 1.2, 3.1, 0.3], ["Verduras", "Berenjena", 25, 1, 6, 0.2], ["Verduras", "Champiñones", 22, 3.1, 3.3, 0.3],
  ["Verduras", "Coliflor", 25, 1.9, 5, 0.3], ["Verduras", "Judía verde / habichuela", 31, 1.8, 7, 0.2], ["Verduras", "Patata / papa", 77, 2, 17, 0.1],
  ["Verduras", "Batata / boniato", 86, 1.6, 20, 0.1], ["Verduras", "Maíz dulce", 86, 3.2, 19, 1.2], ["Verduras", "Remolacha", 43, 1.6, 10, 0.2], ["Verduras", "Apio", 16, 0.7, 3, 0.2],
  ["Frutas", "Manzana", 52, 0.3, 14, 0.2], ["Frutas", "Plátano / banana", 89, 1.1, 23, 0.3], ["Frutas", "Naranja", 47, 0.9, 12, 0.1],
  ["Frutas", "Fresa", 32, 0.7, 7.7, 0.3], ["Frutas", "Arándanos", 57, 0.7, 14, 0.3], ["Frutas", "Uvas", 69, 0.7, 18, 0.2],
  ["Frutas", "Pera", 57, 0.4, 15, 0.1], ["Frutas", "Piña", 50, 0.5, 13, 0.1], ["Frutas", "Mango", 60, 0.8, 15, 0.4],
  ["Frutas", "Sandía", 30, 0.6, 8, 0.2], ["Frutas", "Melón", 34, 0.8, 8, 0.2], ["Frutas", "Kiwi", 61, 1.1, 15, 0.5],
  ["Frutas", "Aguacate", 160, 2, 9, 15], ["Frutas", "Papaya", 43, 0.5, 11, 0.3], ["Frutas", "Durazno / melocotón", 39, 0.9, 10, 0.3],
  ["Frutas", "Cereza", 63, 1.1, 16, 0.2], ["Frutas", "Limón", 29, 1.1, 9, 0.3], ["Frutas", "Granada", 83, 1.7, 19, 1.2],
  ["Lácteos y huevos", "Leche entera", 61, 3.2, 4.8, 3.3, "ml"], ["Lácteos y huevos", "Leche desnatada", 34, 3.4, 5, 0.1, "ml"],
  ["Lácteos y huevos", "Yogur griego (0%)", 59, 10, 3.6, 0.4], ["Lácteos y huevos", "Yogur griego (entero)", 97, 9, 4, 5],
  ["Lácteos y huevos", "Yogur natural", 61, 3.5, 4.7, 3.3], ["Lácteos y huevos", "Requesón / cottage", 98, 11, 3.4, 4.3],
  ["Lácteos y huevos", "Queso cheddar", 403, 25, 1.3, 33], ["Lácteos y huevos", "Queso mozzarella", 300, 22, 2.2, 22],
  ["Lácteos y huevos", "Queso parmesano", 392, 36, 3.2, 26], ["Lácteos y huevos", "Queso fresco", 264, 18, 4, 20],
  ["Lácteos y huevos", "Huevo entero", 143, 13, 0.7, 9.5], ["Lácteos y huevos", "Clara de huevo", 52, 11, 0.7, 0.2],
  ["Lácteos y huevos", "Mantequilla", 717, 0.9, 0.1, 81], ["Lácteos y huevos", "Nata / crema de leche", 340, 2, 3, 36, "ml"], ["Lácteos y huevos", "Leche de almendra (sin azúcar)", 15, 0.6, 0.6, 1.2, "ml"],
  ["Carne de res", "Lomo ancho / ribeye", 291, 19, 0, 24], ["Carne de res", "Solomillo / filete (tenderloin)", 170, 21, 0, 9],
  ["Carne de res", "Lomo / sirloin", 150, 21, 0, 7], ["Carne de res", "Falda / flank", 165, 21, 0, 8], ["Carne de res", "Costilla de res", 290, 17, 0, 25],
  ["Carne de res", "Carne molida 80/20", 254, 17, 0, 20], ["Carne de res", "Carne molida 90/10", 176, 20, 0, 10], ["Carne de res", "Hígado de res", 135, 20, 3.9, 3.6], ["Carne de res", "Lengua de res", 224, 15, 3.7, 17],
  ["Carne de cerdo", "Lomo de cerdo", 143, 21, 0, 6], ["Carne de cerdo", "Chuleta de cerdo", 198, 21, 0, 12], ["Carne de cerdo", "Panceta / tocino", 518, 9, 0, 53],
  ["Carne de cerdo", "Careta / papada de cerdo", 655, 6.4, 0, 70], ["Carne de cerdo", "Costilla de cerdo", 277, 17, 0, 23], ["Carne de cerdo", "Jamón cocido (magro)", 145, 21, 1.5, 5.5],
  ["Carne de cerdo", "Carne molida de cerdo", 263, 17, 0, 21], ["Carne de cerdo", "Chorizo", 455, 24, 2, 38],
  ["Aves", "Pechuga de pollo (sin piel)", 120, 23, 0, 2.6], ["Aves", "Contramuslo de pollo (con piel)", 221, 16.5, 0, 16.6], ["Aves", "Muslo de pollo (sin piel)", 121, 20, 0, 4],
  ["Aves", "Ala de pollo (con piel)", 222, 18, 0, 16], ["Aves", "Pollo entero (con piel)", 215, 18, 0, 15], ["Aves", "Pechuga de pavo", 111, 24, 0, 1], ["Aves", "Carne molida de pavo", 148, 20, 0, 7.7], ["Aves", "Pato (con piel)", 404, 11, 0, 39],
  ["Pescados y mariscos", "Salmón", 208, 20, 0, 13], ["Pescados y mariscos", "Atún fresco", 109, 24, 0, 1], ["Pescados y mariscos", "Atún en lata (en agua)", 116, 26, 0, 1],
  ["Pescados y mariscos", "Tilapia", 96, 20, 0, 1.7], ["Pescados y mariscos", "Bacalao", 82, 18, 0, 0.7], ["Pescados y mariscos", "Merluza", 90, 18, 0, 1.5],
  ["Pescados y mariscos", "Camarón / gamba", 85, 20, 0, 0.5], ["Pescados y mariscos", "Sardina en lata (aceite)", 208, 25, 0, 11], ["Pescados y mariscos", "Trucha", 119, 20, 0, 3.5],
  ["Pescados y mariscos", "Pulpo", 82, 15, 2.2, 1], ["Pescados y mariscos", "Mejillones", 86, 12, 3.7, 2.2],
  ["Legumbres", "Lentejas (cocidas)", 116, 9, 20, 0.4], ["Legumbres", "Garbanzos (cocidos)", 164, 9, 27, 2.6], ["Legumbres", "Frijoles negros (cocidos)", 132, 9, 24, 0.5],
  ["Legumbres", "Frijoles rojos (cocidos)", 127, 9, 23, 0.5], ["Legumbres", "Judías blancas (cocidas)", 139, 9.7, 25, 0.4], ["Legumbres", "Soja / edamame (cocida)", 121, 12, 9, 5],
  ["Legumbres", "Guisantes / arvejas (cocidos)", 84, 5.4, 16, 0.2], ["Legumbres", "Habas (cocidas)", 110, 8, 20, 0.4], ["Legumbres", "Tofu firme", 144, 15, 3, 8], ["Legumbres", "Hummus", 166, 8, 14, 10],
  ["Cereales y granos", "Arroz blanco (cocido)", 130, 2.7, 28, 0.3], ["Cereales y granos", "Arroz integral (cocido)", 123, 2.7, 26, 1], ["Cereales y granos", "Quinoa (cocida)", 120, 4.4, 21, 1.9],
  ["Cereales y granos", "Avena (seca)", 389, 17, 66, 7], ["Cereales y granos", "Avena (cocida)", 71, 2.5, 12, 1.5], ["Cereales y granos", "Pasta (cocida)", 158, 6, 31, 0.9],
  ["Cereales y granos", "Cuscús (cocido)", 112, 3.8, 23, 0.2], ["Cereales y granos", "Trigo sarraceno (cocido)", 92, 3.4, 20, 0.6], ["Cereales y granos", "Cebada (cocida)", 123, 2.3, 28, 0.4],
  ["Harinas y panes", "Harina de trigo (todo uso)", 364, 10, 76, 1], ["Harinas y panes", "Harina integral", 340, 13, 72, 2.5], ["Harinas y panes", "Harina de maíz (masa)", 362, 8, 76, 3.6],
  ["Harinas y panes", "Harina de avena", 404, 15, 66, 9], ["Harinas y panes", "Harina de almendra", 571, 21, 20, 50], ["Harinas y panes", "Harina de maíz precocida (arepa)", 358, 7, 79, 1.5],
  ["Harinas y panes", "Pan blanco", 265, 9, 49, 3.2], ["Harinas y panes", "Pan integral", 247, 13, 41, 3.4], ["Harinas y panes", "Tortilla de maíz", 218, 5.7, 45, 2.9], ["Harinas y panes", "Tortilla de harina", 304, 8, 49, 7.5],
  ["Frutos secos y semillas", "Almendras", 579, 21, 22, 50], ["Frutos secos y semillas", "Nueces", 654, 15, 14, 65], ["Frutos secos y semillas", "Anacardos / marañón", 553, 18, 30, 44],
  ["Frutos secos y semillas", "Pistachos", 560, 20, 28, 45], ["Frutos secos y semillas", "Cacahuetes / maní", 567, 26, 16, 49], ["Frutos secos y semillas", "Avellanas", 628, 15, 17, 61],
  ["Frutos secos y semillas", "Nueces de Brasil", 659, 14, 12, 67], ["Frutos secos y semillas", "Semillas de chía", 486, 17, 42, 31], ["Frutos secos y semillas", "Semillas de lino / linaza", 534, 18, 29, 42],
  ["Frutos secos y semillas", "Semillas de girasol", 584, 21, 20, 51], ["Frutos secos y semillas", "Semillas de calabaza", 559, 30, 11, 49], ["Frutos secos y semillas", "Mantequilla de maní", 588, 25, 20, 50], ["Frutos secos y semillas", "Tahini", 595, 17, 21, 54],
  ["Aceites y grasas", "Aceite de oliva", 884, 0, 0, 100, "ml"], ["Aceites y grasas", "Aceite de coco", 862, 0, 0, 100, "ml"], ["Aceites y grasas", "Aceite de girasol", 884, 0, 0, 100, "ml"],
  ["Aceites y grasas", "Aceite de aguacate", 884, 0, 0, 100, "ml"], ["Aceites y grasas", "Aceite de canola", 884, 0, 0, 100, "ml"], ["Aceites y grasas", "Manteca de cerdo", 902, 0, 0, 100],
];
export const CATALOG = CATALOG_RAW.map((r) => ({ cat: r[0], name: r[1], kcal: r[2], protein: r[3], carbs: r[4], fat: r[5], unit: r[6] || "g" }));
// tazas/cucharas -> ml, para medir líquidos sin báscula
const LIQUID_MEASURES = [["1 cdta", 5], ["1 cda", 15], ["¼ taza", 60], ["½ taza", 120], ["1 taza", 240]];

const validateBackup = (value) => validateBackupData(value, DEFAULT_GOALS);
const migrateWorkouts = (workouts) => migrateWorkoutData(workouts, MUSCLES[0]);
const CATALOG_UNIT_BY_NAME = new Map(CATALOG.map((c) => [c.name.toLowerCase(), c.unit]));
const migrateFoodUnits = (foods) => foods.map((f) => (f.unit ? f : { ...f, unit: CATALOG_UNIT_BY_NAME.get(f.name.toLowerCase()) || "g" }));
export const scaleFood = (food, g) => { const k = (Number(g) || 0) / 100; return { kcal: food.kcal * k, protein: food.protein * k, carbs: food.carbs * k, fat: food.fat * k }; };

async function sha256(s) {
  try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
  catch { return "plain:" + s; }
}
/* ----------------------------- styles ----------------------------- */
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;800;900&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
/* El tema tambien en el documento: el fondo del navegador asoma al hacer
   overscroll y en las pantallas mas cortas que el viewport. */
html{background:#17150f;color-scheme:dark;}
html[data-theme="light"]{background:#f3efe6;color-scheme:light;}
.ft-root *{box-sizing:border-box;}
.ft-root{--bg:#f3efe6;--panel:#faf7f0;--panel2:#ece6da;--line:#dcd4c2;--hair:rgba(22,20,13,.10);--text:#16140d;--muted:#6f6a5d;--accent:#e7531c;--accentdim:rgba(231,83,28,.12);--danger:#c0341a;--blue:#2f6f8f;--ok:#3d8b68;--attn:#c4451a;color-scheme:light;font-family:'Hanken Grotesk',sans-serif;color:var(--text);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased;line-height:1.4;background-image:none;}
.ft-root[data-theme="dark"]{--bg:#17150f;--panel:#201d16;--panel2:#1e1b14;--line:rgba(243,239,230,.12);--hair:rgba(243,239,230,.08);--text:#f3efe6;--muted:#8b8578;--accent:#e7531c;--accentdim:rgba(231,83,28,.18);--danger:#ff6b4a;--blue:#6fb2f0;--ok:#4fa87f;--attn:#ff8a5c;color-scheme:dark;}
.ft-mono{font-family:'IBM Plex Mono',monospace;}
.ft-wrap{max-width:1120px;margin:0 auto;padding:20px 18px 90px;}
.ft-wrap.with-side{padding-left:74px;}
.ft-side{position:fixed;top:0;left:0;bottom:0;z-index:40;width:56px;display:flex;flex-direction:column;gap:16px;padding:14px 8px;background:var(--panel);border-right:1px solid var(--line);overflow:hidden;transition:width .18s ease;}
.ft-side.open,.ft-side:focus-within{width:232px;}
@media (hover:hover){.ft-side:hover{width:232px;}}
.ft-side .label{opacity:0;white-space:nowrap;transition:opacity .12s ease;}
.ft-side.open .label,.ft-side:focus-within .label{opacity:1;}
@media (hover:hover){.ft-side:hover .label{opacity:1;}}
.ft-side-logo{display:flex;align-items:center;gap:10px;background:transparent;border:none;padding:0;cursor:pointer;color:var(--text);text-align:left;}
.ft-side-logo .mark{flex:0 0 auto;width:34px;height:34px;border-radius:9px;background:var(--accent);display:grid;place-items:center;color:#f3efe6;}
.ft-side-logo b{display:block;font-family:'Archivo';font-weight:900;letter-spacing:-.04em;text-transform:uppercase;font-size:19px;line-height:1;}
.ft-side-logo small{color:var(--muted);font-size:10px;letter-spacing:.16em;text-transform:uppercase;}
.ft-side-foot{margin-top:auto;display:flex;flex-direction:column;gap:6px;}
.ft-user{display:flex;align-items:center;gap:10px;padding:10px 4px 4px;border:none;border-top:1px solid var(--line);background:transparent;color:var(--text);text-align:left;width:100%;cursor:pointer;border-radius:0 0 9px 9px;}
.ft-user:hover{background:var(--panel2);}
.ft-user.active{background:var(--accentdim);}
.ft-user .avatar{flex:0 0 auto;width:34px;height:34px;border-radius:50%;background:var(--text);color:var(--bg);display:grid;place-items:center;font-family:'Archivo';font-weight:800;font-size:13px;}
.ft-user b{display:block;font-size:12.5px;line-height:1.25;text-transform:capitalize;}
.ft-user small{font-size:11px;color:var(--muted);font-family:'IBM Plex Mono';}
.ft-logo{display:flex;align-items:center;gap:10px;}
.ft-logo .mark{width:34px;height:34px;border-radius:9px;background:var(--accent);display:grid;place-items:center;color:#f3efe6;}
.ft-logo h1{font-family:'Archivo';font-weight:900;letter-spacing:-.04em;text-transform:uppercase;font-size:22px;line-height:1;margin:0;}
.ft-logo span{color:var(--muted);font-size:11px;letter-spacing:.18em;text-transform:uppercase;}
.ft-iconbtn{background:var(--panel);border:1px solid var(--line);color:var(--muted);border-radius:9px;padding:8px 10px;display:inline-flex;gap:6px;align-items:center;cursor:pointer;font-size:12px;font-weight:600;}
.ft-iconbtn:hover{border-color:var(--accent);color:var(--text);}
.ft-nav{display:flex;flex-direction:column;gap:4px;}
.ft-nav button{border:none;background:transparent;color:var(--muted);padding:11px 9px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12.5px;display:flex;align-items:center;gap:12px;white-space:nowrap;transition:.15s;}
.ft-nav button.active{background:var(--accent);color:#f3efe6;}
.ft-nav-add{border:none;background:transparent;padding:0 0 6px;margin-bottom:2px;cursor:pointer;color:var(--text);display:flex;align-items:center;gap:12px;font-weight:700;font-size:12.5px;white-space:nowrap;}
.ft-nav-add .mark{flex:0 0 auto;width:34px;height:34px;border-radius:10px;background:var(--ok);color:var(--bg);display:grid;place-items:center;}
.ft-nav-add:hover .mark{filter:brightness(1.08);}
.ft-nav-sep{height:1px;background:var(--line);margin:8px 2px;}
.ft-side .ft-iconbtn{justify-content:flex-start;gap:12px;padding:9px;border:none;background:transparent;}
.ft-side svg{flex:0 0 auto;}
.ft-nav button:not(.active):hover{color:var(--text);background:var(--panel2);}
.ft-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:16px;}
.ft-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;}
@media (max-width:900px){.ft-cols{grid-template-columns:1fr;}}
.ft-profile{display:flex;align-items:center;gap:14px;margin:18px 0;}
.ft-profile .avatar{width:56px;height:56px;border-radius:50%;background:var(--text);color:var(--bg);display:grid;place-items:center;font-family:'Archivo';font-weight:900;font-size:22px;}
.ft-profile b{display:block;font-family:'Archivo';font-weight:900;font-size:26px;letter-spacing:-.03em;text-transform:uppercase;line-height:1;}
.ft-profile small{font-family:'IBM Plex Mono';font-size:11px;color:var(--muted);letter-spacing:.08em;}
.ft-card h2{font-family:'Archivo';font-weight:800;text-transform:uppercase;letter-spacing:-.01em;font-size:15px;margin:0 0 14px;display:flex;align-items:center;gap:9px;}
.ft-card h2 .tag{margin-left:auto;font-size:11px;color:var(--muted);font-weight:600;letter-spacing:.1em;font-family:'IBM Plex Mono';text-transform:none;}
.ft-row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;}
.ft-field{display:flex;flex-direction:column;gap:5px;flex:1;min-width:90px;}
.ft-field label{font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;font-weight:600;}
.ft-measures{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;}
.ft-measures button{background:var(--panel2);border:1px solid var(--line);color:var(--muted);border-radius:7px;padding:4px 8px;font-size:11px;font-weight:600;cursor:pointer;}
.ft-measures button:hover{border-color:var(--accent);color:var(--text);}
.ft-input,.ft-select{background:var(--panel2);border:1px solid var(--line);border-radius:9px;color:var(--text);padding:10px 11px;font-size:14px;font-family:inherit;width:100%;}
.ft-input:focus,.ft-select:focus{outline:none;border-color:var(--accent);}
.ft-mono.ft-input{font-family:'IBM Plex Mono';}
textarea.ft-input{resize:vertical;min-height:60px;}
.ft-btn{background:var(--accent);color:#f3efe6;border:none;border-radius:9px;padding:10px 16px;font-weight:800;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:7px;}
.ft-btn:hover{filter:brightness(1.08);}
.ft-btn.ghost{background:var(--panel2);color:var(--text);border:1px solid var(--line);}
.ft-btn.ghost:hover{border-color:var(--accent);}
.ft-btn:disabled{opacity:.4;cursor:not-allowed;}
.ft-trash{background:transparent;border:none;color:var(--muted);cursor:pointer;padding:5px;border-radius:6px;display:grid;place-items:center;}
.ft-trash:hover{color:var(--danger);background:color-mix(in srgb,var(--danger) 12%,transparent);}
.ft-datebar{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:16px;}
.ft-datebar .nav{background:var(--panel);border:1px solid var(--line);color:var(--text);width:36px;height:36px;border-radius:9px;cursor:pointer;display:grid;place-items:center;}
.ft-datebar .nav:hover{border-color:var(--accent);}
.ft-datebar .lbl{text-align:center;}
.ft-datebar .lbl .d{font-family:'Archivo';font-weight:800;text-transform:capitalize;font-size:16px;}
.ft-datebar .lbl .y{color:var(--muted);font-size:12px;font-family:'IBM Plex Mono';}
.ft-ex{background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:13px;margin-bottom:11px;}
.ft-ex-head{display:flex;align-items:center;gap:9px;margin-bottom:10px;flex-wrap:wrap;}
.ft-ex-head .dot{width:10px;height:10px;border-radius:50%;flex:none;}
.ft-ex-head .nm{font-weight:700;font-size:15px;}
.ft-mu{font-size:11px;color:var(--muted);background:var(--bg);padding:3px 8px;border-radius:20px;border:1px solid var(--line);}
.ft-mu.sec{opacity:.75;}
.ft-1rm{margin-left:auto;font-family:'IBM Plex Mono';font-size:12px;color:var(--accent);}
.ft-set{display:grid;grid-template-columns:24px 1fr 1fr 30px;gap:8px;align-items:center;margin-bottom:6px;}
.ft-set .ix{color:var(--muted);font-family:'IBM Plex Mono';font-size:12px;text-align:center;}
.ft-set .si{background:var(--bg);border:1px solid var(--line);border-radius:7px;color:var(--text);padding:7px 8px;font-family:'IBM Plex Mono';font-size:13px;text-align:center;width:100%;}
.ft-set .si:focus{outline:none;border-color:var(--accent);}
.ft-addset{background:transparent;border:1px dashed var(--line);color:var(--muted);border-radius:7px;padding:7px;width:100%;cursor:pointer;font-size:12px;font-weight:600;}
.ft-addset:hover{border-color:var(--accent);color:var(--accent);}
.ft-empty{text-align:center;color:var(--muted);padding:34px 16px;font-size:14px;}
.ft-empty .ic{opacity:.4;margin-bottom:10px;display:flex;justify-content:center;}
.ft-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px;}
.ft-stat{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;}
.ft-stat .k{font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.ft-stat .v{font-family:'Archivo';font-weight:900;font-size:28px;line-height:1;letter-spacing:-.03em;}
.ft-stat .v small{font-size:13px;color:var(--muted);font-weight:700;margin-left:3px;}
.ft-stat .sub{font-size:12px;margin-top:7px;color:var(--muted);font-family:'IBM Plex Mono';display:flex;align-items:center;gap:5px;}
.ft-alert{border-radius:13px;padding:14px 15px;margin-bottom:12px;display:flex;gap:12px;align-items:flex-start;font-size:14px;}
.ft-alert.warn{background:color-mix(in srgb,var(--attn) 12%,transparent);border:1px solid color-mix(in srgb,var(--attn) 42%,transparent);}
.ft-alert.ok{background:color-mix(in srgb,var(--ok) 12%,transparent);border:1px solid color-mix(in srgb,var(--ok) 38%,transparent);}
.ft-alert.info{background:color-mix(in srgb,var(--blue) 11%,transparent);border:1px solid color-mix(in srgb,var(--blue) 34%,transparent);}
.ft-alert.pr{background:var(--accentdim);border:1px solid color-mix(in srgb,var(--accent) 45%,transparent);}
.ft-alert .t{font-weight:700;margin-bottom:3px;}
.ft-alert .b{color:var(--muted);line-height:1.5;}
.ft-list{display:flex;flex-direction:column;gap:8px;}
.ft-acc{margin-top:12px;}
.ft-acc>summary{cursor:pointer;list-style:none;font-family:'IBM Plex Mono';font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px;}
.ft-acc>summary::-webkit-details-marker{display:none;}
.ft-acc>summary::before{content:'+';font-weight:700;}
.ft-acc[open]>summary::before{content:'–';}
.ft-li{display:flex;align-items:center;gap:12px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:11px 13px;flex-wrap:wrap;}
.ft-li .li-d{font-family:'IBM Plex Mono';font-size:12px;color:var(--muted);min-width:54px;}
.ft-li .li-main{flex:1;font-weight:600;min-width:120px;}
.ft-li .li-sub{font-size:12px;color:var(--muted);font-family:'IBM Plex Mono';}
.ft-li .li-v{font-family:'IBM Plex Mono';font-weight:600;}
.ft-li-group{background:var(--panel2);border:1px solid var(--line);}
.ft-li-group>.ft-li{background:transparent;border:0;}
.ft-li-detail{border-top:1px solid var(--line);padding:4px 13px 12px;}
.ft-li-detail .ft-li{padding:9px 0;border:0;border-bottom:1px solid var(--line);background:transparent;}
.ft-li-detail .ft-li:last-child{border-bottom:0;}
.ft-detail-toggle{color:var(--text);}
.ft-detail-toggle svg{transition:transform .18s ease;}
.ft-detail-toggle[aria-expanded="true"] svg{transform:rotate(180deg);}
.ft-chips{display:flex;gap:6px;flex-wrap:wrap;}
.ft-chip{font-size:11px;font-family:'IBM Plex Mono';color:var(--muted);background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:2px 7px;}
.ft-timer{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.ft-timer .clock{font-family:'IBM Plex Mono';font-weight:600;font-size:38px;letter-spacing:.01em;min-width:130px;}
.ft-timer .clock.run{color:var(--accent);}
.ft-secchips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;}
.ft-secchip{font-size:12px;border:1px solid var(--line);background:var(--panel2);color:var(--muted);border-radius:20px;padding:5px 11px;cursor:pointer;user-select:none;}
.ft-secchip.on{border-color:var(--accent);color:var(--accent);background:var(--accentdim);}
.ft-toggle{display:inline-flex;gap:3px;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:3px;margin-bottom:14px;flex-wrap:wrap;}
.ft-toggle button{border:none;background:transparent;color:var(--muted);padding:7px 14px;border-radius:7px;cursor:pointer;font-weight:700;font-size:12px;}
.ft-toggle button.on{background:var(--accent);color:#f3efe6;}
.ft-combo{position:relative;}
.ft-combo-list{position:absolute;top:100%;left:0;right:0;z-index:30;background:var(--panel2);border:1px solid var(--line);border-radius:9px;margin-top:4px;max-height:240px;overflow:auto;box-shadow:0 10px 28px rgba(0,0,0,.45);}
.ft-combo-list button{display:flex;justify-content:space-between;align-items:center;width:100%;background:transparent;border:none;border-bottom:1px solid var(--line);color:var(--text);padding:10px 12px;cursor:pointer;text-align:left;font-size:13px;font-weight:600;}
.ft-combo-list button:last-child{border-bottom:none;}
.ft-combo-list button:hover{background:var(--bg);}
.ft-combo-list .sub{color:var(--muted);font-family:'IBM Plex Mono';font-size:11px;font-weight:400;}
.ft-prev{background:var(--bg);border:1px dashed var(--line);border-radius:9px;padding:10px 13px;font-family:'IBM Plex Mono';font-size:13px;color:var(--muted);margin-top:10px;display:flex;gap:14px;flex-wrap:wrap;}
.ft-prev b{color:var(--accent);}
.ft-h3{font-family:'Archivo';font-weight:800;text-transform:uppercase;font-size:13px;color:var(--muted);letter-spacing:.04em;margin:0;}
.ft-energy{display:flex;gap:6px;}
.ft-energy button{flex:1;background:var(--panel2);border:1px solid var(--line);color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-weight:700;font-family:'IBM Plex Mono';}
.ft-energy button.on{background:var(--accent);color:#f3efe6;border-color:var(--accent);}
.ft-photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-top:14px;}
.ft-photo{position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--line);aspect-ratio:3/4;background:var(--panel2);}
.ft-photo img{width:100%;height:100%;object-fit:cover;display:block;}
.ft-photo .cap{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff;font-family:'IBM Plex Mono';font-size:11px;padding:14px 8px 5px;}
.ft-photo-del{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.55);border:none;color:#fff;border-radius:7px;padding:5px;cursor:pointer;display:grid;place-items:center;}
.ft-photo-del:hover{background:var(--danger);}
.ft-lock{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
.ft-side .label{text-align:left;}
.ft-lock-box{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:28px 24px;width:100%;max-width:340px;}
.recharts-cartesian-axis-tick-value{font-family:'IBM Plex Mono';font-size:11px;}
/* ---- sistema visual del prototipo 3a ---------------------------------------
   Tarjetas suaves (12px), tipo pequena, mono para todo lo que es metadato, y
   el color como semantica: teal = va bien / accion principal, naranja = pide
   atencion, azul = ajuste sugerido. --------------------------------------- */
.ft-dc{max-width:1120px;margin:0 auto;}
.ft-dc-head{position:sticky;top:0;z-index:20;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:10px 2px 13px;border-bottom:1px solid var(--line);background:var(--bg);}
.ft-dc-head h1{margin:0;font-family:'Archivo';font-weight:700;font-size:24px;line-height:1;letter-spacing:-.03em;}
.ft-dc-head .sub{display:block;font-family:'IBM Plex Mono';font-size:10.5px;color:var(--muted);margin-top:4px;text-transform:uppercase;letter-spacing:.1em;}
/* Escritorio: las mismas secciones del prototipo repartidas en dos columnas,
   no una columna de movil estirada. */
/* Rejilla fluida en vez de un salto seco a dos columnas en 860 px. El minimo es
   380 y no los 240 del handoff: aqui las tarjetas llevan graficos, no los tiles
   numericos del prototipo, y a 315 px las etiquetas de eje se salen del area. */
.ft-dc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:12px;align-items:start;margin-top:12px;}
.ft-dc-grid>.ft-dc-card,.ft-dc-grid>*>.ft-dc-card{margin-top:0;}
.ft-dc-grid .span2{grid-column:1 / -1;}
@media (max-width:420px){.ft-dc-grid{grid-template-columns:1fr;}}
.ft-dc-chips{display:flex;gap:6px;flex-wrap:wrap;padding:14px 0 0;}
.ft-dc-chips button{font-family:'IBM Plex Mono';font-weight:600;font-size:10.5px;padding:7px 11px;border-radius:6px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer;}
.ft-dc-chips button:hover{color:var(--text);}
.ft-dc-chips button.on{background:var(--accentdim);border-color:var(--accent);color:var(--accent);}
/* Filtros del diario: todo incluido es el estado normal, asi que se pinta
   callado; lo que llama la atencion es lo que has dejado fuera. */
.ft-dc-chips button.off{opacity:.4;text-decoration:line-through;}
/* ---- plan: la semana de un vistazo ---------------------------------------
   Siete celdas iguales; el punto lleva el estado y el color hace el trabajo:
   verde hecho, naranja sin registrar, apagado libre o por venir. */
.ft-plan-week{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-top:12px;}
.ft-plan-week button{background:var(--panel);border:0;cursor:pointer;padding:11px 4px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--text);min-width:0;}
.ft-plan-week button:hover{background:color-mix(in srgb,var(--text) 6%,transparent);}
.ft-plan-week button.sel{background:color-mix(in srgb,var(--accent) 12%,var(--panel));box-shadow:inset 0 -2px 0 var(--accent);}
.ft-plan-week .k{font-family:'IBM Plex Mono';font-weight:600;font-size:11px;letter-spacing:.1em;}
.ft-plan-week .dot{width:7px;height:7px;border-radius:50%;background:var(--line);}
.ft-root .ft-plan-week .n{font-family:'IBM Plex Mono';font-size:8.5px;letter-spacing:.06em;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
.ft-plan-week button.hecho .dot{background:var(--ok);}
.ft-plan-week button.hoy .dot{background:var(--accent);box-shadow:0 0 0 3px var(--accentdim);}
.ft-plan-week button.perdido .dot{background:var(--attn);}
.ft-plan-week button.previsto .dot{background:var(--muted);}
.ft-dc-search{flex:1;min-width:0;background:transparent;border:0;outline:0;font-family:'Hanken Grotesk';font-size:13px;color:var(--text);}
.ft-dc-search::placeholder{color:var(--muted);}
.ft-dc-strip{display:grid;grid-template-columns:repeat(var(--cols,3),1fr);gap:1px;background:var(--line);border-bottom:1px solid var(--line);}
.ft-dc-strip>div,.ft-dc-strip>button{background:var(--bg);padding:12px 14px;display:flex;flex-direction:column;gap:5px;min-width:0;}
.ft-dc-strip .k{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.14em;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ft-dc-strip .v{font-family:'Archivo';font-weight:700;font-size:24px;line-height:1;letter-spacing:-.035em;font-variant-numeric:tabular-nums;}
.ft-dc-strip .v small{font-family:'IBM Plex Mono';font-weight:500;font-size:10px;color:var(--muted);margin-left:4px;letter-spacing:0;}
.ft-dc-strip .d{font-family:'IBM Plex Mono';font-weight:500;font-size:10px;color:var(--muted);}
/* Cifra que se puede abrir: la interrogacion solo aparece al pasar por encima,
   para no llenar la tira de simbolos. */
.ft-dc-strip button.ft-kpi{text-align:left;border:0;font:inherit;color:inherit;cursor:pointer;}
.ft-dc-strip button.ft-kpi:hover{background:color-mix(in srgb,var(--text) 5%,var(--bg));}
.ft-kpi .why{display:inline-grid;place-items:center;width:12px;height:12px;margin-left:5px;border-radius:50%;border:1px solid var(--line);font-size:8px;color:var(--muted);opacity:0;transition:opacity .12s;vertical-align:1px;}
.ft-kpi:hover .why,.ft-kpi:focus-visible .why{opacity:1;}
.ft-dc-card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:13px 16px;margin-top:12px;display:flex;flex-direction:column;gap:7px;}
.ft-dc-card.attn{border-left:3px solid var(--accent);}
.ft-dc-card.ft-dc-focus{outline:2px solid var(--accent);outline-offset:3px;transition:outline-color .4s;}
@media (prefers-reduced-motion:reduce){.ft-dc-card.ft-dc-focus{transition:none;}}
.ft-dc-alert{display:flex;align-items:flex-start;gap:10px;width:100%;text-align:left;background:transparent;border:none;border-top:1px solid var(--hair);padding:9px 0 0;margin-top:2px;color:inherit;font-family:inherit;}
.ft-dc-alert .tx{flex:1;min-width:0;background:transparent;border:none;padding:0;text-align:left;color:var(--muted);font-family:inherit;font-size:12.5px;line-height:1.45;cursor:pointer;}
.ft-dc-x{flex:none;width:28px;height:28px;margin-top:-4px;border:none;background:transparent;color:var(--muted);font-size:19px;line-height:1;cursor:pointer;border-radius:7px;}
.ft-dc-x:hover{background:color-mix(in srgb,var(--text) 10%,transparent);color:var(--text);}
@media (max-width:720px){.ft-root .ft-dc-x{width:40px;height:40px;}}
.ft-dc-alert:first-of-type{border-top:none;padding-top:0;margin-top:0;}
.ft-dc-alert .dot{width:6px;height:6px;border-radius:50%;margin-top:6px;flex:none;}
.ft-dc-alert .tx b{color:var(--text);font-weight:700;}
.ft-dc-alert:hover .tx{color:var(--text);}
.ft-dc-alert .go{font-family:'IBM Plex Mono';font-size:12px;color:var(--muted);}
.ft-dc-card .t{font-weight:700;font-size:15px;line-height:1.35;}
.ft-dc-card .b{font-size:12.5px;line-height:1.45;color:var(--muted);}
/* Nota al pie: misma voz en cualquier contenedor, no solo dentro de tarjeta. */
.ft-root .n{font-family:'IBM Plex Mono';font-size:10.5px;line-height:1.5;color:var(--muted);}
.ft-dc-card .h{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);}
.ft-dc-big{font-family:'Archivo';font-weight:700;font-size:30px;line-height:.9;letter-spacing:-.04em;font-variant-numeric:tabular-nums;}
.ft-dc-big small{font-family:'IBM Plex Mono';font-weight:500;font-size:11px;color:var(--muted);margin-left:5px;letter-spacing:0;}
.ft-dc-foot{display:flex;align-items:center;gap:8px;padding-top:10px;border-top:1px solid var(--hair);font-family:'IBM Plex Mono';font-size:10.5px;color:var(--muted);}
.ft-dc-tag{font-family:'IBM Plex Mono';font-weight:600;font-size:10px;padding:4px 8px;border-radius:5px;background:color-mix(in srgb,var(--ok) 18%,transparent);color:var(--ok);white-space:nowrap;}
.ft-dc-tag.late{background:color-mix(in srgb,var(--attn) 18%,transparent);color:var(--attn);}
.ft-dc-kicker{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--attn);}
.ft-dc-kicker span{color:var(--muted);letter-spacing:.06em;}
.ft-dc-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:3px;}
.ft-dc-btn{font-family:'Hanken Grotesk';font-weight:700;font-size:12px;padding:10px 14px;border:none;border-radius:9px;background:var(--ok);color:var(--bg);cursor:pointer;}
.ft-dc-btn:hover{filter:brightness(1.08);}
.ft-dc-btn.warn{background:var(--accent);color:#faf7f0;}
.ft-dc-btn.ghost{background:transparent;border:1px solid var(--line);color:var(--text);font-weight:600;}
.ft-dc-btn.ghost:hover{border-color:var(--muted);filter:none;}
.ft-dc-chip{font-family:'IBM Plex Mono';font-weight:600;font-size:10px;letter-spacing:.06em;padding:6px 9px;border-radius:7px;border:1px solid color-mix(in srgb,var(--ok) 42%,transparent);background:transparent;color:var(--ok);cursor:pointer;}
.ft-dc-ok{display:flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--ok) 12%,transparent);border:1px solid color-mix(in srgb,var(--ok) 34%,transparent);border-radius:12px;padding:12px 15px;margin-top:12px;font-weight:600;font-size:12.5px;}
.ft-dc-quiet{display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:color-mix(in srgb,var(--text) 5%,transparent);border:none;border-radius:10px;padding:10px 13px;margin-top:8px;color:var(--muted);font-family:'Hanken Grotesk';font-size:11.5px;cursor:pointer;}
.ft-dc-quiet:hover{background:color-mix(in srgb,var(--text) 9%,transparent);}
.ft-dc-quiet .dot{width:7px;height:7px;border-radius:50%;background:var(--attn);flex:none;}
.ft-dc-day{display:flex;align-items:baseline;justify-content:space-between;gap:9px;padding:18px 2px 7px;}
.ft-dc-day .t{font-family:'IBM Plex Mono';font-weight:700;font-size:13px;letter-spacing:.04em;}
.ft-dc-day .m{font-family:'IBM Plex Mono';font-size:10.5px;color:var(--muted);}
.ft-dc-list{border:1px solid var(--line);border-radius:12px;overflow:hidden;}
.ft-dc-row{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:transparent;border:none;border-bottom:1px solid var(--hair);padding:10px 14px;cursor:pointer;color:inherit;}
.ft-dc-row:last-child{border-bottom:none;}
.ft-dc-row:hover{background:color-mix(in srgb,var(--text) 6%,transparent);}
.ft-dc-row .kind{font-family:'IBM Plex Mono';font-weight:500;font-size:9.5px;letter-spacing:.1em;color:var(--muted);width:58px;flex:none;}
.ft-dc-row .nm{font-weight:700;font-size:13.5px;}
.ft-dc-row .mt{font-family:'IBM Plex Mono';font-size:10.5px;color:var(--muted);margin-top:2px;}
.ft-dc-row .go{font-family:'IBM Plex Mono';font-size:13px;color:var(--muted);}
.ft-lib{display:grid;grid-template-columns:1fr;gap:16px;align-items:start;margin-top:4px;}
@media (min-width:960px){.ft-lib.open{grid-template-columns:minmax(0,1fr) minmax(0,420px);}}
/* En movil la ficha no se apila debajo de la lista: la reemplaza, como el paso
   de cantidad del prototipo. Todos los paneles traen su propio Cerrar/Cancelar,
   asi que siempre hay vuelta atras. */
@media (max-width:959px){.ft-lib.open .ft-lib-list{display:none;}}
.ft-lib-list{min-width:0;display:flex;flex-direction:column;}
.ft-lib-detail{min-width:0;}
@media (min-width:960px){.ft-lib-detail{position:sticky;top:14px;}}
.ft-lib-field{display:flex;flex-direction:column;gap:5px;}
.ft-lib-field>span{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}
.ft-lib-nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:9px;}
.ft-lib-add{display:grid;grid-template-columns:1fr 92px auto;gap:8px;align-items:center;}
@media (max-width:520px){.ft-lib-add{grid-template-columns:1fr;}}
.ft-root .ft-dc-row.sel{background:var(--accentdim);box-shadow:inset 2px 0 0 var(--accent);}
.ft-root .ft-dc-chip:disabled{cursor:default;}
.ft-more-user{display:flex;align-items:center;gap:13px;padding:16px 2px 4px;}
.ft-more-user .avatar{flex:0 0 auto;width:46px;height:46px;border-radius:50%;background:var(--text);color:var(--bg);display:grid;place-items:center;font-family:'Archivo';font-weight:900;font-size:19px;}
.ft-more-user b{display:block;font-family:'Archivo';font-weight:700;font-size:20px;letter-spacing:-.03em;text-transform:capitalize;line-height:1.1;}
.ft-more-user small{font-family:'IBM Plex Mono';font-size:10.5px;color:var(--muted);}
.ft-more-grid{display:grid;grid-template-columns:1fr;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-top:14px;}
@media (min-width:760px){.ft-more-grid{grid-template-columns:1fr 1fr;}}
.ft-more-row{border-bottom:none;background:var(--bg);padding:14px 16px;}
.ft-more-row .nm{font-size:14px;}
.ft-dc-empty{font-family:'IBM Plex Mono';font-size:11.5px;line-height:1.5;color:var(--muted);padding:14px;}
.ft-dc-step{width:32px;height:32px;flex:none;display:grid;place-items:center;border:1px solid var(--line);border-radius:8px;background:transparent;color:var(--text);font-family:'IBM Plex Mono';font-weight:600;font-size:15px;cursor:pointer;}
.ft-dc-step:hover{border-color:var(--muted);}
/* Solo en movil: en escritorio la cuenta esta al pie del rail y esto sobraria. */
.ft-dc-avatar{display:none;width:36px;height:36px;flex:none;border-radius:50%;border:1px solid var(--line);background:var(--panel);color:var(--text);font-family:'Archivo';font-weight:800;font-size:14px;cursor:pointer;}
@media (max-width:720px){.ft-dc-avatar{display:grid;place-items:center;}}
.ft-dc-step.sm{width:26px;height:26px;font-size:13px;}
/* Dedo, no raton: la app se usa entrenando. 40 px es el minimo comodo y por
   debajo de 32 se falla el toque con la mano ocupada. */
@media (max-width:720px){
  .ft-root .ft-dc-step,.ft-root .ft-dc-step.sm{width:40px;height:40px;font-size:17px;}
  .ft-root .ft-dc-chip,.ft-root .ft-dc-chips button,.ft-root .ft-secchip,.ft-root .ft-measures button{min-height:36px;}
  .ft-root .ft-trash,.ft-root .ft-addset,.ft-root .ft-iconbtn{min-height:40px;min-width:40px;}
  .ft-root .ft-input,.ft-root .ft-select,.ft-root .ft-dc-search,.ft-root .ft-dc-btn{min-height:40px;}
}
.ft-dc-date{width:auto;min-width:132px;padding:7px 9px;font-size:12px;}
/* Cifra grande y editable, como el paso de cantidad del prototipo. */
.ft-qty{display:flex;align-items:center;justify-content:center;gap:12px;padding:6px 0 2px;}
.ft-qty-input{width:min(150px,42vw);border:none;background:transparent;text-align:right;font-family:'Archivo';font-weight:700;font-size:40px;letter-spacing:-.04em;color:var(--text);padding:0;outline:none;font-variant-numeric:tabular-nums;}
.ft-qty-input:focus{color:var(--accent);}
.ft-qty .u{font-family:'IBM Plex Mono';font-size:13px;color:var(--muted);flex:none;}
/* Accion primaria de la pantalla: ancha, al final, y dice lo que va a pasar. */
.ft-dc-cta{width:100%;margin-top:16px;padding:15px 18px;border:none;border-radius:12px;background:var(--ok);color:var(--bg);font-family:'Hanken Grotesk';font-weight:700;font-size:14.5px;cursor:pointer;}
.ft-dc-cta:hover:enabled{filter:brightness(1.08);}
.ft-dc-cta:disabled{background:var(--panel2);color:var(--muted);cursor:default;}
.ft-dc-mio{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.12em;color:var(--muted);flex:none;}
.ft-dc-plus{font-family:'IBM Plex Mono';font-size:21px;line-height:1;color:var(--ok);flex:none;width:22px;text-align:center;}
.ft-dc-rpe{flex:1;min-width:0;text-align:center;font-family:'IBM Plex Mono';font-weight:600;font-size:11px;padding:9px 0;border-radius:6px;background:transparent;border:1px solid var(--line);color:var(--muted);cursor:pointer;}
.ft-dc-rpe:hover{color:var(--text);}
/* ---- movil: barra inferior de 5 destinos (Diario · Metricas · + · Plan · Mas) ---- */
/* Modo sesion: fondo propio y nada de navegacion alrededor. El handoff lo marca
   como intocable y era lo unico de la lista que se habia perdido al montar la
   sesion dentro del marco de la app. */
.ft-root.ft-focus{--bg:#141209;}
.ft-root.ft-focus .ft-side,.ft-root.ft-focus .ft-tabbar{display:none;}
.ft-root.ft-focus .ft-wrap,.ft-root.ft-focus .ft-wrap.with-side{max-width:760px;padding:18px 18px calc(28px + env(safe-area-inset-bottom));}
.ft-session{min-height:100vh;}
.ft-toast{position:fixed;right:18px;bottom:18px;z-index:60;max-width:min(360px,calc(100vw - 36px));background:var(--text);color:var(--bg);border-radius:10px;padding:12px 15px;font-weight:600;font-size:12.5px;line-height:1.4;box-shadow:0 10px 30px rgba(0,0,0,.28);animation:ft-toast-in .18s ease;}
@keyframes ft-toast-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
@media (prefers-reduced-motion:reduce){.ft-toast{animation:none;}}
@media (max-width:720px){.ft-toast{left:12px;right:12px;max-width:none;bottom:calc(84px + env(safe-area-inset-bottom));}}
.ft-tabbar{display:none;position:fixed;left:0;right:0;bottom:0;z-index:45;align-items:flex-end;gap:4px;padding:8px 12px calc(10px + env(safe-area-inset-bottom));background:var(--panel);border-top:1px solid var(--line);}
.ft-tabbar button{flex:1;background:none;border:none;color:var(--muted);cursor:pointer;padding:6px 0;display:flex;flex-direction:column;align-items:center;gap:5px;font-family:'IBM Plex Mono';font-weight:600;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;}
.ft-tabbar button.active{color:var(--accent);}
.ft-tabbar button.add{color:var(--muted);}
.ft-tab-avatar{width:20px;height:20px;border-radius:50%;background:var(--muted);color:var(--bg);display:grid;place-items:center;font-family:'Archivo';font-weight:800;font-size:10px;}
.ft-tabbar button.active .ft-tab-avatar{background:var(--accent);color:#f3efe6;}
.ft-tabbar button.add .circle{width:52px;height:52px;border-radius:50%;background:var(--ok);color:var(--bg);display:grid;place-items:center;box-shadow:0 6px 18px var(--accentdim);}
.ft-sheet{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;}
.ft-sheet-panel{width:100%;max-width:560px;margin:0 auto;border-radius:16px 16px 0 0;max-height:80vh;overflow:auto;background:var(--panel);border-top:1px solid var(--line);padding:16px 16px calc(20px + env(safe-area-inset-bottom));animation:ft-up .18s ease;}
@keyframes ft-up{from{transform:translateY(100%);}to{transform:translateY(0);}}
.ft-sheet-panel h3{margin:0 0 12px;font-family:'Archivo';font-weight:800;text-transform:uppercase;font-size:15px;letter-spacing:-.01em;display:flex;align-items:center;}
.ft-sheet-panel h3 button{margin-left:auto;background:none;border:none;color:var(--muted);cursor:pointer;padding:4px;}
.ft-sheet-row{display:flex;align-items:center;gap:12px;width:100%;background:none;border:none;border-bottom:1px solid var(--line);color:var(--text);padding:14px 2px;cursor:pointer;font:600 14px 'Hanken Grotesk',sans-serif;text-align:left;}
.ft-sheet-row:last-child{border-bottom:none;}
.ft-sheet-row .sub{margin-left:auto;font-family:'IBM Plex Mono';font-size:11px;color:var(--muted);font-weight:400;}
@media (max-width:720px){
  .ft-side{display:none;}
  .ft-wrap.with-side{padding-left:18px;padding-bottom:104px;}
  .ft-tabbar{display:flex;}
}
/* ---- re-skin 3a ------------------------------------------------------------
   Las pantallas que todavia no se reescribieron (Entrenar, Nutricion,
   Biblioteca, Rutinas, Ajustes) se pintan con estas clases base, asi que
   traducirlas aqui las migra a la vez sin tocar su JSX: tarjeta suave sobre
   panel, cabecera en mono en vez del titular de 23px, cifras de 24px en vez de
   44 y teal para la accion principal. ---------------------------------------- */
.ft-root .ft-card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:15px 17px 17px;margin-bottom:12px;}
.ft-root .ft-card h2{font-family:'IBM Plex Mono';font-weight:600;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:0 0 14px;padding-bottom:0;border-bottom:none;gap:8px;}
.ft-root .ft-card h2 .tag{font-size:10px;letter-spacing:.06em;color:var(--muted);}
.ft-root .ft-h3{font-family:'IBM Plex Mono';font-weight:600;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);}
.ft-root .ft-stat{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:13px 15px 15px;}
.ft-root .ft-stat .k{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.14em;margin-bottom:6px;}
.ft-root .ft-stat .v{font-family:'Archivo';font-weight:700;font-size:24px;letter-spacing:-.035em;font-variant-numeric:tabular-nums;}
.ft-root .ft-stat .v small{font-family:'IBM Plex Mono';font-size:10px;font-weight:500;}
.ft-root .ft-stat .sub{font-size:10.5px;margin-top:6px;}
.ft-root .ft-btn{border-radius:9px;background:var(--ok);color:var(--bg);font-weight:700;font-size:12px;padding:10px 14px;}
.ft-root .ft-btn:hover{filter:brightness(1.08);}
.ft-root .ft-btn.ghost{background:transparent;border:1px solid var(--line);color:var(--text);font-weight:600;}
.ft-root .ft-btn.ghost:hover{border-color:var(--muted);filter:none;}
.ft-root .ft-iconbtn{border-radius:9px;font-size:11.5px;}
.ft-root .ft-input,.ft-root .ft-select{border-radius:9px;background:var(--panel2);font-size:13px;padding:9px 11px;}
.ft-root .ft-field label{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.14em;}
.ft-root .ft-li{border-radius:10px;background:var(--panel2);padding:10px 13px;}
.ft-root .ft-li .li-main{font-size:13.5px;font-weight:700;}
.ft-root .ft-li .li-d,.ft-root .ft-li .li-sub{font-size:10.5px;}
.ft-root .ft-ex{border-radius:12px;background:var(--panel2);}
.ft-root .ft-ex-head .nm{font-size:14px;}
.ft-root .ft-toggle{border-radius:9px;}
.ft-root .ft-toggle button{border-radius:7px;font-size:11.5px;}
.ft-root .ft-toggle button.on{background:var(--accentdim);color:var(--accent);}
.ft-root .ft-energy button{border-radius:8px;}
.ft-root .ft-energy button.on{background:var(--accentdim);color:var(--accent);border-color:var(--accent);}
.ft-root .ft-chip,.ft-root .ft-mu,.ft-root .ft-measures button{border-radius:6px;}
.ft-root .ft-secchip{border-radius:20px;}
.ft-root .ft-secchip.on{border-color:var(--ok);color:var(--ok);background:color-mix(in srgb,var(--ok) 14%,transparent);}
.ft-root .ft-set .si,.ft-root .ft-addset{border-radius:8px;}
.ft-root .ft-alert{border-radius:12px;font-size:13px;}
.ft-root .ft-alert .t{font-size:14px;}
.ft-root .ft-alert .b{font-size:12.5px;}
.ft-root .ft-combo-list,.ft-root .ft-lock-box{border-radius:12px;}
.ft-root .ft-combo-list button{font-size:13px;}
.ft-root .ft-prev{border-radius:10px;font-size:12px;}
.ft-root .ft-photo{border-radius:10px;}
.ft-root .ft-photo-del,.ft-root .ft-trash{border-radius:8px;}
.ft-root .ft-datebar .nav{border-radius:9px;}
.ft-root .ft-logo .mark,.ft-root .ft-side-logo .mark{border-radius:9px;}
.ft-root .ft-nav button{border-radius:9px;}
.ft-root .ft-nav button.active,.ft-root .ft-logo .mark,.ft-root .ft-side-logo .mark{color:#f3efe6;}
.ft-root .ft-empty{font-family:'IBM Plex Mono';font-size:12px;}
`;

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
  const [themePref, setThemePref] = useState(readThemePref);
  const [systemDark, setSystemDark] = useState(() => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    if (typeof matchMedia !== "function") return undefined;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const update = (event) => setSystemDark(event.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, themePref); } catch { /* almacenamiento bloqueado */ } }, [themePref]);
  const theme = resolveTheme(themePref, systemDark);
  // El fondo del documento tambien: .ft-root solo pinta lo que ocupa, y al hacer
  // overscroll o con la pantalla a medias asomaba el blanco del navegador.
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
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

  // La barra inferior lleva 5 destinos; lo que no cabe vive en la pantalla "Mas",
  // que ademas es la unica que muestra de quien es la cuenta.
  const ACCOUNT_TABS = ["cuenta", "perfil", "ajustes"];
  const ADD_ROWS = [
    { id: "entrenar", label: "Entreno", sub: "series y RPE", icon: Dumbbell },
    { id: "nutricion", label: "Comida", sub: "kcal y macros", icon: Utensils },
    { id: "peso", label: "Peso", sub: "báscula del día", icon: Scale },
    { id: "nota", label: "Nota del día", sub: "sueño · pasos · energía", icon: Moon },
    { id: "medidas", label: "Medidas", sub: "cintura · cadera · fotos", icon: Ruler },
    // El check-in solo existe si hay ciclo que seguir.
    ...(tracksCycle(goals) ? [{ id: "checkin", label: "Check-in de ciclo", sub: "sangrado y síntomas", icon: Droplet }] : []),
  ].filter(Boolean);

  // Cuerpo se registra en cuatro sitios distintos; los cuatro son la misma
  // pantalla con una seccion activa, y el rail solo lleva al primero.
  const BODY_TABS = ["cuerpo", "peso", "medidas", "nota", "checkin"];
  // El rail listaba en plano tres cosas distintas —consultar, registrar y
  // configurar— y por eso Mas duplicaba: no habia donde poner lo de configurar
  // que no estuviera ya arriba. Ahora sigue el mismo modelo que la barra movil:
  // Anadir para registrar, tres raices para consultar, y Mas para el resto. Es
  // exactamente la barra inferior del movil, asi que no hay dos modelos que
  // mantener ni nada que aparezca en dos sitios: Biblioteca vive en Mas, como en
  // Y lo de configurar dejo de ser una pestana: es la cuenta, y se entra por el
  // nombre al pie del rail, que es donde se busca en cualquier app.
  //
  // Entrenar, Cuerpo y Nutricion salen de la lista pero no se pierden: se llega
  // por Anadir, por las filas del Diario, por el dia del Plan y por los huecos
  // por llenar, que es de donde se llega de verdad.
  const NAV = [
    { id: "diario", label: "Diario", icon: Newspaper },
    { id: "plan", label: "Plan", icon: CalendarDays },
    { id: "dashboard", label: "Métricas", icon: LayoutDashboard },
    { id: "biblioteca", label: "Biblioteca", icon: Apple },
  ];

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
          <aside className={menuOpen ? "ft-side open" : "ft-side"} onMouseLeave={() => setMenuOpen(false)}>
            <button className="ft-side-logo" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Menú">
              <span className="mark"><Dumbbell size={20} /></span>
              <span className="label"><b>FitTrack</b><small>tu progreso, medido</small></span>
            </button>
            <nav className="ft-nav">
              <button className="ft-nav-add" onClick={() => { setSheet("add"); setMenuOpen(false); }} title="Registrar">
                <span className="mark"><Plus size={19} /></span><span className="label">Añadir</span>
              </button>
              {NAV.map(({ id, label, icon: Ic, sep }) => (
                sep
                  ? <span key="sep" className="ft-nav-sep" />
                  : (
                    <button key={id} className={tab === id ? "active" : ""} onClick={() => { goTo(id); setMenuOpen(false); }} title={label}>
                      <Ic size={17} /><span className="label">{label}</span>
                    </button>
                  )
              ))}
            </nav>
            <div className="ft-side-foot">
              <SaveIndicator />
              <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
              {/* Tema, exportar e importar se fueron a la pestana de Datos: el
                  pie del rail es la cuenta, no un cajon de acciones sueltas. */}
              <button
                className={ACCOUNT_TABS.includes(tab) ? "ft-user active" : "ft-user"}
                onClick={() => { goTo("cuenta"); setMenuOpen(false); }}
                title={`Tu cuenta · ${profileLine}`}
              >
                <span className="avatar">{(session.user.email || "?")[0].toUpperCase()}</span>
                <span className="label">
                  <b>{(session.user.email || "").split("@")[0]}</b>
                  <small>{profileLine}</small>
                </span>
              </button>
            </div>
          </aside>
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

          <nav className="ft-tabbar">
            <button className={tab === "diario" ? "active" : ""} onClick={() => goTo("diario")}><Newspaper size={18} />Diario</button>
            <button className={tab === "dashboard" ? "active" : ""} onClick={() => goTo("dashboard")}><LayoutDashboard size={18} />Métricas</button>
            <button className="add" onClick={() => setSheet("add")} aria-label="Registrar"><span className="circle"><Plus size={26} /></span>Añadir</button>
            <button className={tab === "plan" ? "active" : ""} onClick={() => goTo("plan")}><CalendarDays size={18} />Plan</button>
            <button className={tab === "biblioteca" || tab === "rutinas" ? "active" : ""} onClick={() => goTo("biblioteca")}><Apple size={18} />Biblioteca</button>
          </nav>

          <Toast />

          {sheet && (
            <div className="ft-sheet" onClick={() => setSheet(null)}>
              <div className="ft-sheet-panel" onClick={(e) => e.stopPropagation()}>
                <h3>Registrar<button onClick={() => setSheet(null)} aria-label="Cerrar"><X size={18} /></button></h3>
                {ADD_ROWS.map(({ id, label, sub, icon: Ic }) => (
                  <button key={id} className="ft-sheet-row" onClick={() => { goTo(id); setSheet(null); }}>
                    <Ic size={17} />{label}<span className="sub">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
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
export function Train({ workouts, setWorkouts, routines, setRoutines, userId, periods = [], menstrualLogs = [], wellness = [], initialDate }) {
  const [date, setDate] = useState(initialDate || todayISO());
  // Fase ovulatoria/ventana fértil probable: mayor laxitud articular es común (no es
  // sobreentrenamiento ni requiere bajar volumen, es cuidado de técnica/rango en
  // patrones de rodilla y cadera-lumbar bajo carga). Solo se muestra con confianza
  // media/alta del modelo — no se prescribe con datos insuficientes.
  const phaseCaution = useMemo(() => {
    const estimate = inferCyclePhase({ date, periods, menstrualLogs, wellness });
    if (!["ovulation_probable", "fertile_window_probable"].includes(estimate.phase)) return null;
    return estimate.confidence === "low" ? null : estimate;
  }, [date, periods, menstrualLogs, wellness]);
  // El unico titular de la pantalla: donde mejor esta progresando la carga.
  const strengthHighlight = useMemo(() => loadProgressHighlight(workouts, date), [workouts, date]);
  const [name, setName] = useState("");
  const [primary, setPrimary] = useState(MUSCLES[0]);
  const [secondary, setSecondary] = useState([]);
  const [cardio, setCardio] = useState({ type: CARDIO_TYPES[0], minutes: "", kcal: "" });

  const session = workouts.find((w) => w.date === date) || { exercises: [], durationMin: 0, cardio: [] };
  const exercises = session.exercises;
  const cardioList = session.cardio || [];
  // Referencia "última vez": el set más pesado logueado para este ejercicio (por
  // nombre canónico) en la sesión previa más reciente antes de esta fecha. Da el
  // punto de comparación para decidir repetir o subir carga a propósito, y de paso
  // deja un dato más comparable sesión a sesión para el seguimiento de RPE.
  const lastPerformance = useMemo(() => lastTrainingPerformance(workouts, date), [workouts, date]);
  // La sesion guiada no es otra pantalla: es otro modo de la misma, sobre los
  // mismos datos. Una serie con reps ya es una serie registrada.
  const [inSession, setInSession] = useState(false);
  const [durInput, setDurInput] = useState(session.durationMin ? String(session.durationMin) : "");
  useEffect(() => { setDurInput(session.durationMin ? String(session.durationMin) : ""); }, [date, session.durationMin]);
  const commitDuration = () => writeSession({ durationMin: Number(durInput) || 0 });
  // Autoguardado: el teclado numérico del móvil no trae tecla Enter, así que el
  // valor se guarda solo al a segundo de dejar de escribir. Enter y salir del campo
  // lo siguen guardando al instante. La guarda evita reescribir (y borrar la sesión)
  // cuando el input ya coincide con lo guardado, ej. al montar el componente.
  useEffect(() => {
    if (durInput === (session.durationMin ? String(session.durationMin) : "")) return;
    const timer = setTimeout(commitDuration, 1000);
    return () => clearTimeout(timer);
  }, [durInput]); // eslint-disable-line

  const writeSession = (patch) => {
    setWorkouts((prev) => {
      const cur = prev.find((w) => w.date === date);
      const next = { ...(cur || { id: uid(), date, exercises: [], durationMin: 0, cardio: [] }), ...patch };
      const empty = next.exercises.length === 0 && !next.durationMin && (!next.cardio || next.cardio.length === 0);
      const others = prev.filter((w) => w.date !== date);
      return empty ? others : [...others, next];
    });
  };

  const toggleSec = (m) => setSecondary((s) => s.includes(m) ? s.filter((x) => x !== m) : [...s, m]);
  const applyPreset = (idx) => { if (idx === "") return; const p = EXERCISE_PRESETS[Number(idx)]; setName(p.name); setPrimary(p.primary); setSecondary(p.secondary); };
  const addExercise = () => {
    if (!name.trim()) return;
    const ex = { id: uid(), name: name.trim(), primary, secondary: secondary.filter((m) => m !== primary), sets: [{ id: uid(), reps: "", kg: "", rpe: "" }] };
    writeSession({ exercises: [...exercises, ex] }); setName(""); setSecondary([]);
  };
  const addExercisesFromList = (list, addMin = 0) => {
    const newEx = list.map((e) => ({
      id: uid(), name: e.name,
      primary: e.primary || guessPrimaryMuscle(e.name), secondary: e.secondary || [],
      targetRpe: e.targetRpe || "", targetReps: e.targetReps != null ? String(e.targetReps) : "", notes: e.notes || "",
      sets: Array.from({ length: Math.max(1, Number(e.targetSets) || 1) }, () => ({ id: uid(), reps: "", kg: "", rpe: "" })),
    }));
    setWorkouts((prev) => {
      const cur = prev.find((w) => w.date === date) || { id: uid(), date, exercises: [], durationMin: 0, cardio: [] };
      const next = { ...cur, exercises: [...cur.exercises, ...newEx], durationMin: (cur.durationMin || 0) + addMin };
      const others = prev.filter((w) => w.date !== date);
      return [...others, next];
    });
  };
  const loadRoutine = (idx) => { if (idx === "") return; addExercisesFromList(routines[Number(idx)].exercises); };
  // Resuelve la versión mínima desde la rutina o, si no la tiene, desde la plantilla original.
  const minimalFor = (r) => {
    if (!r) return null;
    if (r.minimal && r.minimal.exercises) return r.minimal.exercises;
    const tpl = ROUTINE_TEMPLATES.find((t) => t.id === r.templateId || t.name === r.name);
    if (tpl && tpl.minimalVersion) return tpl.minimalVersion.exercises.map((e) => ({ name: e.name, targetSets: e.sets, targetReps: e.reps }));
    return null;
  };
  const minimalMin = (r) => {
    if (r && r.minimal && r.minimal.durationMin) return r.minimal.durationMin;
    const tpl = ROUTINE_TEMPLATES.find((t) => t.id === r.templateId || t.name === r.name);
    return tpl && tpl.minimalVersion ? tpl.minimalVersion.durationMin : null;
  };
  const loadMinimal = (idx) => { if (idx === "") return; const list = minimalFor(routines[Number(idx)]); if (list) addExercisesFromList(list); };
  const loadWarmup = () => addExercisesFromList(WARMUP.exercises.map((w) => ({ name: w.name, targetReps: w.dose, targetSets: 1 })), WARMUP.durationMin);
  const routinesWithMin = routines.map((r, i) => ({ r, i })).filter((x) => minimalFor(x.r));
  const upEx = (n) => writeSession({ exercises: n });
  const editSet = (exId, sId, f, v) => upEx(exercises.map((e) => e.id !== exId ? e : { ...e, sets: e.sets.map((s) => s.id === sId ? { ...s, [f]: v } : s) }));
  const addSet = (exId) => upEx(exercises.map((e) => e.id !== exId ? e : { ...e, sets: [...e.sets, { id: uid(), reps: "", kg: "", rpe: "" }] }));
  const delSet = (exId, sId) => upEx(exercises.map((e) => e.id !== exId ? e : { ...e, sets: e.sets.length > 1 ? e.sets.filter((s) => s.id !== sId) : e.sets }));
  const delEx = (exId) => upEx(exercises.filter((e) => e.id !== exId));
  // Carga de golpe para todo un ejercicio. Reutiliza applyAdjustments, que ya
  // impone la regla dura: una serie registrada no se reescribe nunca, porque de
  // ahi salen los records, la progresion y el aviso de fatiga.
  const setExerciseLoad = (exId, kg) => upEx(applyAdjustments(exercises, [{ id: exId, kg, removed: false }]));
  // La rutina del dia, para poder quitar un ejercicio tambien de ella y que no
  // vuelva a proponerse la semana que viene.
  const dayRoutine = routines.find((r) => r.suggestedDay != null && Number(r.suggestedDay) === new Date(`${date}T00:00:00`).getDay()) || null;
  const delExEverywhere = (exId) => {
    const target = exercises.find((e) => e.id === exId);
    if (target && dayRoutine) {
      setRoutines((prev) => prev.map((r) => (r.id === dayRoutine.id
        ? { ...r, exercises: (r.exercises || []).filter((x) => x.name !== target.name) }
        : r)));
    }
    delEx(exId);
  };
  const [removingId, setRemovingId] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const addCardio = () => { if (!cardio.minutes) return; writeSession({ cardio: [...cardioList, { id: uid(), type: cardio.type, minutes: Number(cardio.minutes), kcal: Number(cardio.kcal) || 0 }] }); setCardio({ type: CARDIO_TYPES[0], minutes: "", kcal: "" }); };
  const delCardio = (id) => writeSession({ cardio: cardioList.filter((c) => c.id !== id) });

  // timer
  const [tSec, setTSec] = useState(0); const [tRun, setTRun] = useState(false); const tRef = useRef(null);
  // ponytail: el conteo se recalcula del reloj real (Date.now()-startedAt) en cada tick,
  // no se acumula tick a tick — así un tab en background/pantalla bloqueada (donde el
  // navegador pausa setInterval) no hace que el tiempo registrado quede por detrás.
  const runRef = useRef({ startedAt: null, baseSec: 0 });
  useEffect(() => {
    (async () => {
      try {
        const t = await loadKey(userId, "timer", { running: false, baseSec: 0, startedAt: null });
        if (t.running && t.startedAt) {
          runRef.current = { startedAt: t.startedAt, baseSec: t.baseSec || 0 };
          setTSec(runRef.current.baseSec + Math.floor((Date.now() - runRef.current.startedAt) / 1000));
          setTRun(true);
        } else { runRef.current = { startedAt: null, baseSec: t.baseSec || 0 }; setTSec(t.baseSec || 0); }
      } catch (error) { console.error("loadTimer", error); }
    })();
    return () => clearInterval(tRef.current);
  }, [userId]);
  useEffect(() => {
    if (!tRun) { clearInterval(tRef.current); return; }
    const tick = () => setTSec(runRef.current.startedAt ? runRef.current.baseSec + Math.floor((Date.now() - runRef.current.startedAt) / 1000) : runRef.current.baseSec);
    tick();
    tRef.current = setInterval(tick, 1000);
    return () => clearInterval(tRef.current);
  }, [tRun]);
  const startT = () => { runRef.current = { startedAt: Date.now(), baseSec: tSec }; saveKey(userId, "timer", { running: true, startedAt: runRef.current.startedAt, baseSec: tSec }); setTRun(true); };
  const pauseT = () => { runRef.current = { startedAt: null, baseSec: tSec }; saveKey(userId, "timer", { running: false, startedAt: null, baseSec: tSec }); setTRun(false); };
  const resetT = () => { runRef.current = { startedAt: null, baseSec: 0 }; saveKey(userId, "timer", { running: false, startedAt: null, baseSec: 0 }); setTRun(false); setTSec(0); };
  const commitT = () => { const min = Math.round(tSec / 60); if (min > 0) writeSession({ durationMin: (session.durationMin || 0) + min }); resetT(); };

  const { totalVol, totalSets, avgRpe } = trainingSummary(exercises);
  const saveDayAsRoutine = () => {
    if (!exercises.length) return;
    const nm = window.prompt("Nombre de la rutina:", `Rutina ${date}`);
    if (!nm || !nm.trim()) return;
    const items = exercises.map((e) => ({ id: uid(), name: e.name, primary: e.primary, secondary: e.secondary || [], targetSets: e.sets.length, targetReps: String(e.sets[0]?.reps || e.targetReps || ""), targetRpe: e.targetRpe || "" }));
    setRoutines((prev) => [...prev, { id: uid(), name: nm.trim(), exercises: items }]);
  };

  if (inSession && exercises.length > 0) {
    return (
      <Suspense fallback={<div className="ft-empty">Cargando sesión…</div>}>
        <SessionScreen
          exercises={exercises}
          writeExercises={(next) => writeSession({ exercises: next })}
          lastPerformance={lastPerformance}
          onExit={(minutes) => {
            if (minutes > 0 && minutes > (session.durationMin || 0)) writeSession({ durationMin: minutes });
            setInSession(false);
          }}
        />
      </Suspense>
    );
  }

  return (
    <>
      <ScreenMast
        kicker="FITTRACK · ENTRENAR"
        title="Entrenar"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <EDateNav date={date} setDate={setDate} />
            {exercises.length > 0 && (
              <button className="ft-dc-btn" onClick={() => setInSession(true)}>
                {exercises.some((e) => (e.sets || []).some((x) => Number(x.reps) > 0)) ? "Seguir sesión" : "Empezar sesión"}
              </button>
            )}
          </div>
        }
      />
      {strengthHighlight && (
        <Headline
          kicker="Lo que importa ahora · Fuerza"
          sub={`+${strengthHighlight.to - strengthHighlight.from} kg estimados · ${strengthHighlight.sessions} sesiones registradas`}
          value={`+${strengthHighlight.pct}`}
          unit="%"
          valueSub="1RM est. vs inicio"
          spark={strengthHighlight.series}
        >
          {strengthHighlight.name}: de {strengthHighlight.from} a {strengthHighlight.to} kg de 1RM estimado en estas ocho semanas.
        </Headline>
      )}
      <div style={{ height: 16 }} />

      {phaseCaution && (
        <div className="ft-card" style={{ display: "flex", gap: 10, alignItems: "flex-start", borderColor: "var(--accent)" }}>
          <AlertTriangle size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <b>Fase ovulatoria/ventana fértil probable.</b> Mayor laxitud articular es frecuente en esta fase — no es motivo para bajar volumen, pero conviene cuidar técnica y rango en sentadilla, peso muerto/bisagra e hip thrust. Marcados abajo con <AlertTriangle size={12} style={{ verticalAlign: "-1px", color: "var(--accent)" }} /> si ya cargaste peso.
          </div>
        </div>
      )}

      <div className="ft-card">
        <h2><Timer size={16} /> Duración <span className="tag">{session.durationMin || 0} min · {cardioList.reduce((t, c) => t + c.minutes, 0)} min cardio</span></h2>
        <div className="ft-timer">
          <span className={"clock" + (tRun ? " run" : "")}>{clock(tSec)}</span>
          {!tRun ? <button className="ft-btn" onClick={startT}><Play size={15} /> {tSec ? "Reanudar" : "Empezar"}</button>
            : <button className="ft-btn ghost" onClick={pauseT}><Pause size={15} /> Pausar</button>}
          <button className="ft-btn ghost" onClick={resetT}><RotateCcw size={15} /> Reiniciar</button>
          <button className="ft-btn ghost" onClick={commitT} disabled={tSec < 60}><Check size={15} /> Guardar (+{Math.round(tSec / 60)} min)</button>
          <input className="ft-input ft-mono" style={{ maxWidth: 96 }} type="number" inputMode="numeric" enterKeyHint="done" value={durInput} placeholder="min"
            aria-label="Minutos de la sesión (editar a mano)" title="Minutos (editar a mano)"
            onChange={(e) => setDurInput(e.target.value)}
            onBlur={commitDuration}
            onKeyDown={(e) => { if (e.key === "Enter") { commitDuration(); e.currentTarget.blur(); } }} />
        </div>
      </div>

      {/* Casi todos los dias se empieza cargando una rutina, no escribiendo un
          ejercicio a mano. Lo habitual va en una fila; el alta manual, plegada. */}
      <div className="ft-card">
        <h2><Plus size={16} /> Preparar el día</h2>
        <div className="ft-row" style={{ gap: 8 }}>
          {routines.length > 0 && (
            <select className="ft-select" style={{ flex: "1 1 190px" }} value="" onChange={(e) => loadRoutine(e.target.value)} aria-label="Cargar una rutina completa">
              <option value="">Cargar rutina…</option>
              {routines.map((r, i) => <option key={r.id} value={i}>{r.name} ({r.exercises.length} ej.)</option>)}
            </select>
          )}
          {routinesWithMin.length > 0 && (
            <select className="ft-select" style={{ flex: "1 1 170px" }} value="" onChange={(e) => loadMinimal(e.target.value)} aria-label="Cargar la versión mínima de una rutina">
              <option value="">Versión mínima…</option>
              {routinesWithMin.map(({ r, i }) => <option key={r.id} value={i}>{r.name.split("—")[0].trim()} · {minimalFor(r).length} ej.{minimalMin(r) ? ` · ${minimalMin(r)} min` : ""}</option>)}
            </select>
          )}
          <button className="ft-btn ghost" style={{ flex: "none" }} onClick={loadWarmup} title="Añade los 7 ejercicios de movilidad y suma 10 min de duración"><Zap size={15} /> Calentamiento</button>
          <button className="ft-btn ghost" style={{ flex: "none" }} aria-expanded={manualOpen} onClick={() => setManualOpen((v) => !v)}>
            {manualOpen ? <X size={15} /> : <Plus size={15} />} Ejercicio suelto
          </button>
        </div>

        {manualOpen && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--hair)" }}>
            <div className="ft-row" style={{ gap: 8 }}>
              <input className="ft-input" style={{ flex: "2 1 160px" }} placeholder="Nombre del ejercicio" aria-label="Nombre del ejercicio" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addExercise()} />
              <select className="ft-select" style={{ flex: "1 1 150px" }} value="" onChange={(e) => applyPreset(e.target.value)} aria-label={`Sugerencias de ${primary}`}>
                <option value="">Sugerencias · {primary}</option>
                {EXERCISE_PRESETS.map((p, i) => p.primary === primary ? <option key={p.name} value={i}>{p.name}</option> : null)}
              </select>
              <select className="ft-select" style={{ flex: "1 1 120px" }} value={primary} onChange={(e) => setPrimary(e.target.value)} aria-label="Músculo primario">
                {MUSCLES.map((m) => <option key={m}>{m}</option>)}
              </select>
              <button className="ft-btn" style={{ flex: "none" }} onClick={addExercise}><Plus size={15} /> Añadir</button>
            </div>
            <div className="n" style={{ marginTop: 8 }}>Secundarios (opcional, para repartir el volumen en los multiarticulares)</div>
            <div className="ft-secchips" style={{ marginTop: 4 }}>
              {MUSCLES.filter((m) => m !== primary).map((m) => <span key={m} className={"ft-secchip" + (secondary.includes(m) ? " on" : "")} onClick={() => toggleSec(m)}>{m}</span>)}
            </div>
          </div>
        )}
      </div>

      {exercises.length === 0 ? (
        <div className="ft-card"><div className="ft-empty"><div className="ic"><Dumbbell size={32} /></div>Sin ejercicios este día. Añade el primero o carga una rutina.</div></div>
      ) : (
        <>
          <div className="ft-stats">
            <div className="ft-stat"><div className="k"><Dumbbell size={13} /> Ejercicios</div><div className="v">{exercises.length}</div></div>
            <div className="ft-stat"><div className="k">Series</div><div className="v">{totalSets}</div></div>
            <div className="ft-stat"><div className="k">Volumen total</div><div className="v">{Math.round(totalVol).toLocaleString("es-ES")}<small>kg</small></div></div>
            <div className="ft-stat"><div className="k"><Zap size={13} /> RPE medio</div><div className="v">{avgRpe != null ? avgRpe.toFixed(1) : "—"}</div></div>
          </div>
          <div style={{ marginBottom: 12 }}><button className="ft-btn ghost" onClick={saveDayAsRoutine}><ListChecks size={15} /> Guardar día como rutina</button></div>
          {exercises.length > 0 && (
            <div className="ft-prev" style={{ marginTop: 0, marginBottom: 12, display: "block", lineHeight: 1.55 }}>
              <b style={{ color: "var(--accent)" }}>RPE</b> = esfuerzo percibido, opcional (1–10). Guía: <b>6</b> cómodo, te sobran ~4 reps · <b>8</b> exigente, ~2 en reserva · <b>10</b> máximo, no podías una más.
            </div>
          )}
          {exercises.map((ex) => {
            const best1rm = ex.sets.reduce((m, s) => Math.max(m, epley(Number(s.kg) || 0, Number(s.reps) || 0)), 0);
            const last = lastPerformance[canonExercise(ex.name)];
            return (
              <div className="ft-ex" key={ex.id}>
                <div className="ft-ex-head">
                  <span className="dot" style={{ background: MUSCLE_COLOR[ex.primary] || "#888" }} />
                  <span className="nm">{ex.name}</span>
                  <span className="ft-mu">{ex.primary}</span>
                  {(ex.secondary || []).map((s) => <span key={s} className="ft-mu sec">+{s}</span>)}
                  {ex.targetRpe && <span className="ft-mu" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}>RPE obj. {ex.targetRpe}</span>}
                  {best1rm > 0 && <span className="ft-1rm">1RM ~{Math.round(best1rm)} kg</span>}
                  {phaseCaution && isJointLaxityRisk(ex.name) && ex.sets.some((s) => Number(s.kg) > 0) && (
                    <span title="Fase de mayor laxitud articular: cuidá técnica y rango con carga" style={{ display: "inline-flex", alignItems: "center" }}>
                      <AlertTriangle size={14} style={{ color: "var(--accent)" }} />
                    </span>
                  )}
                  {removingId === ex.id ? (
                    <span style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
                      <button className="ft-dc-chip" onClick={() => { delEx(ex.id); setRemovingId(null); }}>SOLO HOY</button>
                      <button className="ft-dc-chip" onClick={() => { delExEverywhere(ex.id); setRemovingId(null); }}>Y DE LA RUTINA</button>
                      <button className="ft-trash" aria-label="Cancelar" onClick={() => setRemovingId(null)}><X size={15} /></button>
                    </span>
                  ) : (
                    <button className="ft-trash" aria-label={`Quitar ${ex.name}`} onClick={() => (dayRoutine ? setRemovingId(ex.id) : delEx(ex.id))}><Trash2 size={16} /></button>
                  )}
                </div>
                {ex.sets.some((s) => !(Number(s.reps) > 0)) && (() => {
                  const kgs = ex.sets.map((s) => Number(s.kg) || 0).filter((kg) => kg > 0);
                  const load = kgs.length ? Math.max(...kgs) : 0;
                  const step = ["Cuádriceps", "Femoral", "Glúteos", "Aductores", "Gemelos"].includes(ex.primary) ? 5 : 2.5;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 9, letterSpacing: ".14em", color: "var(--muted)" }}>PENDIENTES</span>
                      <button className="ft-dc-step sm" aria-label={`Bajar carga pendiente de ${ex.name}`} onClick={() => setExerciseLoad(ex.id, Math.max(0, load - step))}>−</button>
                      <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 600, fontSize: 12, minWidth: 62, textAlign: "center" }}>
                        {load ? `${String(load).replace(".", ",")} kg` : "sin carga"}
                      </span>
                      <button className="ft-dc-step sm" aria-label={`Subir carga pendiente de ${ex.name}`} onClick={() => setExerciseLoad(ex.id, load + step)}>+</button>
                    </div>
                  );
                })()}
                {last && (
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'IBM Plex Mono'", marginBottom: 8 }}>
                    Última vez ({fmtDate(last.date)}): <b style={{ color: "var(--text)" }}>{last.kg} kg × {last.reps}</b>{last.rpe ? ` @ RPE ${last.rpe}` : ""}
                  </div>
                )}
                {ex.notes && <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'IBM Plex Mono'", marginBottom: 8, lineHeight: 1.45 }}>{ex.notes}</div>}
                <div className="ft-set" style={{ gridTemplateColumns: "24px 1fr 1fr 1fr 30px", color: "var(--muted)", fontSize: 11, fontFamily: "'IBM Plex Mono'", marginBottom: 4 }}>
                  <span></span><span style={{ textAlign: "center" }}>REPS</span><span style={{ textAlign: "center" }}>KG</span><span style={{ textAlign: "center" }}>RPE</span><span></span>
                </div>
                {ex.sets.map((s, i) => (
                  <div className="ft-set" key={s.id} style={{ gridTemplateColumns: "24px 1fr 1fr 1fr 30px" }}>
                    <span className="ix">{i + 1}</span>
                    <input className="si" type="number" inputMode="numeric" value={s.reps} placeholder={ex.targetReps || "0"} title={ex.targetReps ? `Objetivo: ${ex.targetReps} reps` : undefined} onChange={(e) => editSet(ex.id, s.id, "reps", e.target.value)} />
                    <input className="si" type="number" inputMode="decimal" value={s.kg} placeholder="0" onChange={(e) => editSet(ex.id, s.id, "kg", e.target.value)} />
                    <input className="si" type="text" inputMode="decimal" value={s.rpe || ""} placeholder={ex.targetRpe || "–"} title="Esfuerzo percibido 1–10 (opcional)" onChange={(e) => editSet(ex.id, s.id, "rpe", e.target.value)} />
                    <button className="ft-trash" onClick={() => delSet(ex.id, s.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
                <button className="ft-addset" onClick={() => addSet(ex.id)}>+ serie</button>
              </div>
            );
          })}
        </>
      )}

      <div className="ft-card">
        <h2><Activity size={16} /> Cardio</h2>
        <div className="ft-row">
          <div className="ft-field"><label>Tipo</label><select className="ft-select" value={cardio.type} onChange={(e) => setCardio({ ...cardio, type: e.target.value })}>{CARDIO_TYPES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="ft-field"><label>Minutos</label><input className="ft-input ft-mono" type="number" inputMode="numeric" placeholder="0" value={cardio.minutes} onChange={(e) => setCardio({ ...cardio, minutes: e.target.value })} /></div>
          <div className="ft-field"><label>Kcal (opcional)</label><input className="ft-input ft-mono" type="number" inputMode="numeric" placeholder="0" value={cardio.kcal} onChange={(e) => setCardio({ ...cardio, kcal: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addCardio()} /></div>
          <button className="ft-btn" onClick={addCardio}><Plus size={15} /></button>
        </div>
        {cardioList.length > 0 && (
          <div className="ft-list" style={{ marginTop: 12 }}>
            {cardioList.map((c) => (
              <div className="ft-li" key={c.id}>
                <span className="li-main">{c.type}</span>
                <span className="li-sub">{c.minutes} min{c.kcal ? ` · ${c.kcal} kcal` : ""}</span>
                <button className="ft-trash" onClick={() => delCardio(c.id)}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

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


