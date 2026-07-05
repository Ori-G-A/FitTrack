import React, { lazy, Suspense, useState, useEffect, useMemo, useRef } from "react";
import { withTimeout } from "./async-utils.js";
import { supabase } from "./supabase.js";
import { ROUTINE_TEMPLATES, templateToAppRoutine, WARMUP, guessPrimaryMuscle, isJointLaxityRisk } from "./fase1Config.js";
import { DEFAULT_GOALS } from "./app-config.js";
import {
  authUserChanged, canonExercise, localISO, mergePhotoUrls, migrateWorkouts as migrateWorkoutData,
  validateBackup as validateBackupData,
} from "./app-utils.js";
import { inferCyclePhase } from "./cycle-inference.js";
import {
  loadKey, resumeUserSaves, saveKey, suspendUserSaves,
  useSyncedValue, waitForUserSaves,
} from "./data-sync.js";
import { AuthScreen, SaveIndicator } from "./AuthUI.jsx";
import {
  A_ACC, A_DANGER, A_DISP, A_HAIR, A_INK, A_INK2, A_MONO, A_OK,
  DKicker, EDateNav, EPanel, KpiStrip, Rise, ScreenMast,
  useIsMobile, useReveal,
} from "./EditorialUI.jsx";
import SettingsScreen from "./SettingsScreen.jsx";
import {
  deleteUserPhotos, hydratePhotos, photoForStorage, photosForBackup, refreshPhotoUrls,
} from "./photo-storage.js";
import {
  Dumbbell, Scale, Utensils, LayoutDashboard, Plus, Trash2,
  Download, Upload, AlertTriangle,
  Check, ChevronLeft, ChevronRight, Timer, Play, Pause, RotateCcw,
  Apple, Pencil, X, Clock, Activity, ListChecks,
  Settings, Zap, BookOpen
} from "lucide-react";

const BodyScreen = lazy(() => import("./BodyScreen.jsx"));
const DashboardScreen = lazy(() => import("./DashboardScreen.jsx"));

/* ----------------------------- helpers ----------------------------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => localISO();
const round1 = (x) => Math.round(x * 10) / 10;
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
const clock = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(m)}:${p(ss)}` : `${p(m)}:${p(ss)}`;
};
const epley = (kg, reps) => (kg > 0 && reps > 0 ? kg * (1 + reps / 30) : 0);
const MUSCLES = ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Cuádriceps", "Femoral", "Glúteos", "Aductores", "Gemelos", "Core", "Trapecio", "Antebrazo"];
const MUSCLE_COLOR = {
  Pecho: "#e7531c", Espalda: "#5ad1ff", Hombros: "#ff8a3d", Bíceps: "#ff6b9d", Tríceps: "#b388ff",
  Cuádriceps: "#d99000", Femoral: "#2f8f6a", Glúteos: "#e7531c", Aductores: "#c06fa0", Gemelos: "#4a9d5e", Core: "#6a655a", Trapecio: "#7a7468", Antebrazo: "#8a6fc0",
};
const CARDIO_TYPES = ["Caminar", "Correr", "Bici", "Elíptica", "Remo", "Natación", "HIIT", "Otro"];

const EXERCISE_PRESETS = [
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
const CATALOG_CATS = ["Verduras", "Frutas", "Lácteos y huevos", "Carne de res", "Carne de cerdo", "Aves", "Pescados y mariscos", "Legumbres", "Cereales y granos", "Harinas y panes", "Frutos secos y semillas", "Aceites y grasas"];
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
const CATALOG = CATALOG_RAW.map((r) => ({ cat: r[0], name: r[1], kcal: r[2], protein: r[3], carbs: r[4], fat: r[5], unit: r[6] || "g" }));
// tazas/cucharas -> ml, para medir líquidos sin báscula
const LIQUID_MEASURES = [["1 cdta", 5], ["1 cda", 15], ["¼ taza", 60], ["½ taza", 120], ["1 taza", 240]];

const validateBackup = (value) => validateBackupData(value, DEFAULT_GOALS);
const migrateWorkouts = (workouts) => migrateWorkoutData(workouts, MUSCLES[0]);
const CATALOG_UNIT_BY_NAME = new Map(CATALOG.map((c) => [c.name.toLowerCase(), c.unit]));
const migrateFoodUnits = (foods) => foods.map((f) => (f.unit ? f : { ...f, unit: CATALOG_UNIT_BY_NAME.get(f.name.toLowerCase()) || "g" }));
const scaleFood = (food, g) => { const k = (Number(g) || 0) / 100; return { kcal: food.kcal * k, protein: food.protein * k, carbs: food.carbs * k, fat: food.fat * k }; };

async function sha256(s) {
  try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
  catch { return "plain:" + s; }
}
/* ----------------------------- styles ----------------------------- */
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;800;900&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.ft-root *{box-sizing:border-box;}
.ft-root{--bg:#f3efe6;--panel:#faf7f0;--panel2:#ece6da;--line:#dcd4c2;--text:#16140d;--muted:#6f6a5d;--accent:#e7531c;--accentdim:rgba(231,83,28,.12);--danger:#c0341a;--blue:#2f6f8f;--ok:#3a7d44;font-family:'Hanken Grotesk',sans-serif;color:var(--text);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased;line-height:1.4;background-image:none;}
.ft-mono{font-family:'IBM Plex Mono',monospace;}
.ft-wrap{max-width:1120px;margin:0 auto;padding:20px 18px 90px;}
.ft-topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:22px;}
.ft-logo{display:flex;align-items:center;gap:10px;}
.ft-logo .mark{width:34px;height:34px;border-radius:9px;background:var(--accent);display:grid;place-items:center;color:#f3efe6;}
.ft-logo h1{font-family:'Archivo';font-weight:900;letter-spacing:-.04em;text-transform:uppercase;font-size:22px;line-height:1;margin:0;}
.ft-logo span{color:var(--muted);font-size:11px;letter-spacing:.18em;text-transform:uppercase;}
.ft-iconbtn{background:var(--panel);border:1px solid var(--line);color:var(--muted);border-radius:9px;padding:8px 10px;display:inline-flex;gap:6px;align-items:center;cursor:pointer;font-size:12px;font-weight:600;}
.ft-iconbtn:hover{border-color:var(--accent);color:var(--text);}
.ft-nav{display:flex;gap:6px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:5px;margin-bottom:24px;overflow-x:auto;}
.ft-nav button{flex:1;min-width:78px;border:none;background:transparent;color:var(--muted);padding:11px 8px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12.5px;display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;transition:.15s;}
.ft-nav button.active{background:var(--accent);color:#f3efe6;}
.ft-nav button:not(.active):hover{color:var(--text);background:var(--panel2);}
.ft-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:16px;}
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
.ft-trash:hover{color:var(--danger);background:rgba(255,107,74,.1);}
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
.ft-alert.warn{background:rgba(255,107,74,.1);border:1px solid rgba(255,107,74,.4);}
.ft-alert.ok{background:rgba(61,220,151,.09);border:1px solid rgba(61,220,151,.35);}
.ft-alert.info{background:rgba(90,209,255,.08);border:1px solid rgba(90,209,255,.3);}
.ft-alert.pr{background:rgba(197,248,42,.1);border:1px solid rgba(197,248,42,.45);}
.ft-alert .t{font-weight:700;margin-bottom:3px;}
.ft-alert .b{color:var(--muted);line-height:1.5;}
.ft-list{display:flex;flex-direction:column;gap:8px;}
.ft-li{display:flex;align-items:center;gap:12px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:11px 13px;flex-wrap:wrap;}
.ft-li .li-d{font-family:'IBM Plex Mono';font-size:12px;color:var(--muted);min-width:54px;}
.ft-li .li-main{flex:1;font-weight:600;min-width:120px;}
.ft-li .li-sub{font-size:12px;color:var(--muted);font-family:'IBM Plex Mono';}
.ft-li .li-v{font-family:'IBM Plex Mono';font-weight:600;}
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
.ft-lock-box{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:28px 24px;width:100%;max-width:340px;}
.recharts-cartesian-axis-tick-value{font-family:'IBM Plex Mono';font-size:11px;}
/* ---- brutalist re-skin: sharp corners + editorial chrome ---- */
.ft-root .ft-card,.ft-root .ft-stat,.ft-root .ft-nav,.ft-root .ft-nav button,.ft-root .ft-btn,.ft-root .ft-iconbtn,.ft-root .ft-input,.ft-root .ft-select,.ft-root .ft-ex,.ft-root .ft-li,.ft-root .ft-lock-box,.ft-root .ft-combo-list,.ft-root .ft-combo-list button,.ft-root .ft-toggle,.ft-root .ft-toggle button,.ft-root .ft-mu,.ft-root .ft-chip,.ft-root .ft-prev,.ft-root .ft-secchip,.ft-root .ft-energy button,.ft-root .ft-photo,.ft-root .ft-alert,.ft-root .ft-set .si,.ft-root .ft-addset,.ft-root .ft-datebar .nav,.ft-root .ft-logo .mark,.ft-root .ft-trash,.ft-root .ft-photo-del{border-radius:0;}
.ft-root .ft-logo h1{letter-spacing:-.045em;}
.ft-root .ft-card h2,.ft-root .ft-h3{letter-spacing:-.01em;}
.ft-root .ft-card{border-color:var(--line);}
.ft-root .ft-nav button.active,.ft-root .ft-btn,.ft-root .ft-toggle button.on,.ft-root .ft-energy button.on,.ft-root .ft-logo .mark{color:#f3efe6;}
.ft-root .ft-btn.ghost{color:var(--text);}
/* ---- editorial panels: hairline framing + section rules + big numerals ---- */
.ft-root .ft-card{background:var(--bg);padding:22px 24px 24px;}
.ft-root .ft-card h2{font-family:'Archivo';font-weight:800;font-size:23px;letter-spacing:-.02em;padding-bottom:13px;margin-bottom:18px;border-bottom:1px solid var(--line);}
.ft-root .ft-card h2 .tag{font-size:11px;letter-spacing:.04em;text-transform:uppercase;}
.ft-root .ft-stat{background:var(--bg);padding:18px 20px 20px;}
.ft-root .ft-stat .k{letter-spacing:.16em;}
.ft-root .ft-stat .v{font-family:'Archivo';font-size:44px;letter-spacing:-.04em;font-variant-numeric:tabular-nums;}
.ft-root .ft-stat .v small{font-size:14px;}
.ft-root .ft-h3{font-size:14px;letter-spacing:.04em;}
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
  const [tab, setTab] = useState("entrenar");
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
    (async () => {
      try {
        const [nextWorkouts, nextWeights, nextNutrition, nextFoods, nextRecipes, nextRoutines,
          nextMeasurements, nextWellness, nextPeriods, nextMenstrualLogs, nextPhotos, nextGoals] = await Promise.all([
          loadKey(userId, "workouts", []),
          loadKey(userId, "weights", []),
          loadKey(userId, "nutrition", []),
          loadKey(userId, "foods", []),
          loadKey(userId, "recipes", []),
          loadKey(userId, "routines", []),
          loadKey(userId, "measurements", []),
          loadKey(userId, "wellness", []),
          loadKey(userId, "periods", []),
          loadKey(userId, "menstrualLogs", []),
          loadKey(userId, "photos", []),
          loadKey(userId, "goals", DEFAULT_GOALS),
        ]);
        const hydratedPhotos = await hydratePhotos(userId, nextPhotos);
        if (cancelled) return;
        setWorkouts(migrateWorkouts(nextWorkouts));
        setWeights(nextWeights);
        setNutrition(nextNutrition);
        setFoods(migrateFoodUnits(nextFoods));
        setRecipes(nextRecipes);
        setRoutines(nextRoutines);
        setMeasurements(nextMeasurements);
        setWellness(nextWellness);
        setPeriods(nextPeriods);
        setMenstrualLogs(nextMenstrualLogs);
        setPhotos(hydratedPhotos);
        setGoals(nextGoals);
        setLoaded(true);
      } catch (error) {
        if (cancelled) return;
        console.error("loadAppData", error);
        setLoadError(true);
      }
    })();
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
  const deleteAllData = async () => {
    if (!userId) throw new Error("No hay una sesión activa");
    suspendUserSaves(userId);
    setLoaded(false);
    try {
      await waitForUserSaves(userId);
      await deleteUserPhotos(userId);
      const { error } = await supabase.from("app_data").delete().eq("user_id", userId);
      if (error) throw error;
      await supabase.auth.signOut();
    } catch (error) {
      resumeUserSaves(userId);
      setLoaded(true);
      throw error;
    }
  };

  const exportData = async () => {
    try {
      const backupPhotos = await photosForBackup(photos);
      const blob = new Blob([JSON.stringify({ workouts, weights, nutrition, foods, recipes, routines, measurements, wellness, periods, menstrualLogs, photos: backupPhotos, goals }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `fittrack-${todayISO()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { alert(error?.message || "No se pudo crear la copia de seguridad"); }
  };
  const fileRef = useRef();
  const importData = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 50 * 1024 * 1024) { alert("La copia supera el límite de 50 MB"); e.target.value = ""; return; }
    const r = new FileReader();
    r.onload = async () => {
      try {
        const d = validateBackup(JSON.parse(r.result));
        if (!window.confirm("Esta importación reemplazará las colecciones incluidas en la copia. ¿Continuar?")) return;
        if (d.workouts) setWorkouts(migrateWorkouts(d.workouts));
        if (d.weights) setWeights(d.weights);
        if (d.nutrition) setNutrition(d.nutrition);
        if (d.foods) setFoods(migrateFoodUnits(d.foods));
        if (d.recipes) setRecipes(d.recipes);
        if (d.routines) setRoutines(d.routines);
        if (d.measurements) setMeasurements(d.measurements);
        if (d.wellness) setWellness(d.wellness);
        if (d.periods) setPeriods(d.periods);
        if (d.menstrualLogs) setMenstrualLogs(d.menstrualLogs);
        if (d.photos) setPhotos(await hydratePhotos(userId, d.photos));
        if (d.goals) setGoals(d.goals);
      } catch (error) { alert(error?.message || "Archivo no válido"); }
      finally { e.target.value = ""; }
    };
    r.onerror = () => { alert("No se pudo leer el archivo"); e.target.value = ""; };
    r.readAsText(f);
  };

  const NAV = [
    { id: "entrenar", label: "Entrenar", icon: Dumbbell },
    { id: "cuerpo", label: "Cuerpo", icon: Scale },
    { id: "nutricion", label: "Nutrición", icon: Utensils },
    { id: "biblioteca", label: "Biblioteca", icon: Apple },
    { id: "rutinas", label: "Rutinas", icon: ListChecks },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ajustes", label: "Ajustes", icon: Settings },
  ];

  return (
    <div className="ft-root">
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
        <div className="ft-wrap">
          <div className="ft-topbar">
            <div className="ft-logo">
              <div className="mark"><Dumbbell size={20} /></div>
              <div><h1>FitTrack</h1><span>tu progreso, medido</span></div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <SaveIndicator />
              <button className="ft-iconbtn" onClick={exportData}><Download size={14} /> Exportar</button>
              <button className="ft-iconbtn" onClick={() => fileRef.current.click()}><Upload size={14} /> Importar</button>
              <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
            </div>
          </div>
          <nav className="ft-nav">
            {NAV.map(({ id, label, icon: Ic }) => (
              <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Ic size={15} /> {label}</button>
            ))}
          </nav>
          {tab === "entrenar" && <Train workouts={workouts} setWorkouts={setWorkouts} routines={routines} setRoutines={setRoutines} userId={userId} periods={periods} menstrualLogs={menstrualLogs} wellness={wellness} />}
          {tab === "cuerpo" && (
            <Suspense fallback={<div className="ft-empty">Cargando Cuerpo…</div>}>
              <BodyScreen weights={weights} setWeights={setWeights} measurements={measurements} setMeasurements={setMeasurements} wellness={wellness} setWellness={setWellness} periods={periods} setPeriods={setPeriods} menstrualLogs={menstrualLogs} setMenstrualLogs={setMenstrualLogs} photos={photos} setPhotos={setPhotos} goals={goals} setGoals={setGoals} userId={userId} />
            </Suspense>
          )}
          {tab === "nutricion" && <Nutrition nutrition={nutrition} setNutrition={setNutrition} foods={foods} recipes={recipes} goals={goals} setTab={setTab} />}
          {tab === "biblioteca" && <Library foods={foods} setFoods={setFoods} recipes={recipes} setRecipes={setRecipes} />}
          {tab === "rutinas" && <Routines routines={routines} setRoutines={setRoutines} />}
          {tab === "dashboard" && (
            <Suspense fallback={<div className="ft-empty">Cargando Dashboard…</div>}>
              <DashboardScreen workouts={workouts} weights={weights} nutrition={nutrition} measurements={measurements} periods={periods} menstrualLogs={menstrualLogs} wellness={wellness} goals={goals} />
            </Suspense>
          )}
          {tab === "ajustes" && <SettingsScreen goals={goals} setGoals={setGoals} weights={weights} exportData={exportData} userEmail={session.user.email} signOut={signOut} deleteAllData={deleteAllData} />}
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
export function Train({ workouts, setWorkouts, routines, setRoutines, userId, periods = [], menstrualLogs = [], wellness = [] }) {
  const [date, setDate] = useState(todayISO());
  // Fase ovulatoria/ventana fértil probable: mayor laxitud articular es común (no es
  // sobreentrenamiento ni requiere bajar volumen, es cuidado de técnica/rango en
  // patrones de rodilla y cadera-lumbar bajo carga). Solo se muestra con confianza
  // media/alta del modelo — no se prescribe con datos insuficientes.
  const phaseCaution = useMemo(() => {
    const estimate = inferCyclePhase({ date, periods, menstrualLogs, wellness });
    if (!["ovulation_probable", "fertile_window_probable"].includes(estimate.phase)) return null;
    return estimate.confidence === "low" ? null : estimate;
  }, [date, periods, menstrualLogs, wellness]);
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
  const lastPerformance = useMemo(() => {
    const map = {};
    [...workouts].filter((w) => w.date < date).sort((a, b) => a.date.localeCompare(b.date)).forEach((w) => {
      w.exercises.forEach((e) => {
        const best = e.sets.reduce((m, s) => {
          const kg = Number(s.kg) || 0, reps = Number(s.reps) || 0;
          return kg > 0 && kg >= (m?.kg || 0) ? { kg, reps, rpe: s.rpe || "" } : m;
        }, null);
        if (best) map[canonExercise(e.name)] = { ...best, date: w.date };
      });
    });
    return map;
  }, [workouts, date]);
  const [durInput, setDurInput] = useState(session.durationMin ? String(session.durationMin) : "");
  useEffect(() => { setDurInput(session.durationMin ? String(session.durationMin) : ""); }, [date, session.durationMin]);
  const commitDuration = () => writeSession({ durationMin: Number(durInput) || 0 });

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

  const totalVol = exercises.reduce((t, e) => t + e.sets.reduce((st, s) => st + (Number(s.reps) || 0) * (Number(s.kg) || 0), 0), 0);
  const totalSets = exercises.reduce((t, e) => t + e.sets.length, 0);
  const rpeVals = exercises.flatMap((e) => e.sets.map((s) => parseFloat(s.rpe)).filter((v) => v > 0));
  const avgRpe = rpeVals.length ? rpeVals.reduce((a, b) => a + b, 0) / rpeVals.length : null;
  const saveDayAsRoutine = () => {
    if (!exercises.length) return;
    const nm = window.prompt("Nombre de la rutina:", `Rutina ${date}`);
    if (!nm || !nm.trim()) return;
    const items = exercises.map((e) => ({ id: uid(), name: e.name, primary: e.primary, secondary: e.secondary || [], targetSets: e.sets.length, targetReps: String(e.sets[0]?.reps || e.targetReps || ""), targetRpe: e.targetRpe || "" }));
    setRoutines((prev) => [...prev, { id: uid(), name: nm.trim(), exercises: items }]);
  };

  return (
    <>
      <ScreenMast kicker="FITTRACK · ENTRENAR" title="Entrenar" right={<EDateNav date={date} setDate={setDate} />} />
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
        </div>
        <div className="ft-row" style={{ marginTop: 12 }}>
          <div className="ft-field" style={{ maxWidth: 200 }}><label>Minutos (editar a mano)</label>
            <input className="ft-input ft-mono" type="number" inputMode="numeric" value={durInput} placeholder="0"
              onChange={(e) => setDurInput(e.target.value)}
              onBlur={commitDuration}
              onKeyDown={(e) => e.key === "Enter" && commitDuration()} /></div>
        </div>
      </div>

      <div className="ft-card">
        <h2><Plus size={16} /> Añadir ejercicio</h2>
        <div className="ft-row" style={{ marginBottom: 12, alignItems: "flex-end" }}>
          {routines.length > 0 && (
            <div className="ft-field" style={{ maxWidth: 300 }}><label>Cargar una rutina completa</label>
              <select className="ft-select" value="" onChange={(e) => loadRoutine(e.target.value)}>
                <option value="">Elegir rutina…</option>
                {routines.map((r, i) => <option key={r.id} value={i}>{r.name} ({r.exercises.length} ej.)</option>)}
              </select></div>
          )}
          {routinesWithMin.length > 0 && (
            <div className="ft-field" style={{ maxWidth: 260 }}><label>Versión mínima (día difícil)</label>
              <select className="ft-select" value="" onChange={(e) => loadMinimal(e.target.value)}>
                <option value="">Elegir mínima…</option>
                {routinesWithMin.map(({ r, i }) => <option key={r.id} value={i}>{r.name.split("—")[0].trim()} · {minimalFor(r).length} ej.{minimalMin(r) ? ` · ${minimalMin(r)} min` : ""}</option>)}
              </select></div>
          )}
          <div className="ft-field" style={{ flex: "none" }}><label>Antes de empezar</label>
            <button className="ft-btn ghost" onClick={loadWarmup} title="Añade los 7 ejercicios de movilidad y suma 10 min de duración"><Zap size={15} /> Calentamiento 10 min</button></div>
        </div>
        <div className="ft-row" style={{ marginBottom: 10 }}>
          <div className="ft-field" style={{ flex: 2, minWidth: 150 }}><label>Ejercicio</label>
            <input className="ft-input" placeholder="Ej. Press banca" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addExercise()} /></div>
          <div className="ft-field"><label>Sugerencias · {primary}</label>
            <select className="ft-select" value="" onChange={(e) => applyPreset(e.target.value)}>
              <option value="">Elegir ejercicio…</option>
              {EXERCISE_PRESETS.map((p, i) => p.primary === primary ? <option key={p.name} value={i}>{p.name}</option> : null)}
            </select></div>
          <div className="ft-field"><label>Músculo primario</label>
            <select className="ft-select" value={primary} onChange={(e) => setPrimary(e.target.value)}>{MUSCLES.map((m) => <option key={m}>{m}</option>)}</select></div>
        </div>
        <label style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>Músculos secundarios (multiarticular)</label>
        <div className="ft-secchips">
          {MUSCLES.filter((m) => m !== primary).map((m) => <span key={m} className={"ft-secchip" + (secondary.includes(m) ? " on" : "")} onClick={() => toggleSec(m)}>{m}</span>)}
        </div>
        <div style={{ marginTop: 14 }}><button className="ft-btn" onClick={addExercise}><Plus size={15} /> Añadir ejercicio</button></div>
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
                  <button className="ft-trash" onClick={() => delEx(ex.id)}><Trash2 size={16} /></button>
                </div>
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
export function Nutrition({ nutrition, setNutrition, foods, recipes, goals, setTab }) {
  const [date, setDate] = useState(todayISO());
  const [mode, setMode] = useState("biblioteca");
  const [sel, setSel] = useState(null); const [grams, setGrams] = useState("");
  const [recId, setRecId] = useState(""); const [servings, setServings] = useState("1");
  const [m, setM] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "" });

  const dayItems = nutrition.filter((n) => n.date === date);
  const sum = dayItems.reduce((t, n) => ({ kcal: t.kcal + (+n.kcal || 0), protein: t.protein + (+n.protein || 0), carbs: t.carbs + (+n.carbs || 0), fat: t.fat + (+n.fat || 0) }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const computed = sel && grams ? scaleFood(sel, grams) : null;

  const recTotals = (r) => r.items.reduce((t, i) => ({ kcal: t.kcal + i.kcal, protein: t.protein + i.protein, carbs: t.carbs + i.carbs, fat: t.fat + i.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const selRec = recipes.find((r) => r.id === recId);
  const recPreview = selRec ? (() => { const tot = recTotals(selRec); const f = (Number(servings) || 0) / (selRec.servings || 1); return { kcal: tot.kcal * f, protein: tot.protein * f, carbs: tot.carbs * f, fat: tot.fat * f }; })() : null;

  const addFromLib = () => { if (!sel || !grams) return; const c = scaleFood(sel, grams); setNutrition((p) => [...p, { id: uid(), date, name: sel.name, grams: Number(grams), unit: sel.unit || "g", kcal: round1(c.kcal), protein: round1(c.protein), carbs: round1(c.carbs), fat: round1(c.fat) }]); setSel(null); setGrams(""); };
  const addRecipe = () => { if (!selRec || !recPreview) return; setNutrition((p) => [...p, { id: uid(), date, name: `${selRec.name} (${servings} porc.)`, grams: null, kcal: round1(recPreview.kcal), protein: round1(recPreview.protein), carbs: round1(recPreview.carbs), fat: round1(recPreview.fat) }]); setRecId(""); setServings("1"); };
  const addManual = () => { if (!m.name.trim()) return; setNutrition((p) => [...p, { id: uid(), date, name: m.name.trim(), grams: null, kcal: +m.kcal || 0, protein: +m.protein || 0, carbs: +m.carbs || 0, fat: +m.fat || 0 }]); setM({ name: "", kcal: "", protein: "", carbs: "", fat: "" }); };
  const del = (id) => setNutrition((p) => p.filter((n) => n.id !== id));

  const kcalPct = goals.kcalTarget ? Math.round((sum.kcal / goals.kcalTarget) * 100) : 0;
  const protPct = goals.proteinTarget ? Math.round((sum.protein / goals.proteinTarget) * 100) : 0;

  return (
    <div style={{ fontFamily: A_DISP, color: A_INK }}>
      <ScreenMast kicker="FITTRACK · HOY" title="Nutrición" right={<EDateNav date={date} setDate={setDate} />} />
      <KpiStrip items={[
        { k: "Calorías", v: Math.round(sum.kcal), u: `/ ${goals.kcalTarget || "—"}`, sub: `${kcalPct}% objetivo`, subColor: kcalPct > 105 ? A_DANGER : A_OK },
        { k: "Proteína", v: Math.round(sum.protein), u: `/ ${goals.proteinTarget || "—"} g`, sub: `${protPct}% objetivo`, subColor: protPct >= 90 ? A_OK : A_INK2 },
        { k: "Carbohidratos", v: Math.round(sum.carbs), u: "g" },
        { k: "Grasa", v: Math.round(sum.fat), u: "g" },
      ]} />

      <EPanel title="Añadir comida" i={2} raise>
        <div className="ft-toggle">
          <button className={mode === "biblioteca" ? "on" : ""} onClick={() => setMode("biblioteca")}>Alimento</button>
          <button className={mode === "receta" ? "on" : ""} onClick={() => setMode("receta")}>Receta</button>
          <button className={mode === "manual" ? "on" : ""} onClick={() => setMode("manual")}>Manual</button>
        </div>

        {mode === "biblioteca" && (foods.length === 0 ? (
          <div className="ft-empty">No tienes alimentos guardados.<div style={{ marginTop: 12 }}><button className="ft-btn" onClick={() => setTab("biblioteca")}><Apple size={15} /> Ir a la biblioteca</button></div></div>
        ) : (<>
          <div className="ft-row">
            <FoodCombo foods={foods} selected={sel} onChange={setSel} />
            <AmountField food={sel} value={grams} onChange={setGrams} onEnter={addFromLib} />
            <button className="ft-btn" onClick={addFromLib} disabled={!sel || !grams}><Plus size={15} /> Añadir</button>
          </div>
          {computed && <div className="ft-prev"><span><b>{Math.round(computed.kcal)}</b> kcal</span><span>P <b>{round1(computed.protein)}</b></span><span>C <b>{round1(computed.carbs)}</b></span><span>G <b>{round1(computed.fat)}</b></span><span style={{ opacity: .7 }}>· {sel.name} · {grams} {sel.unit || "g"}</span></div>}
        </>))}

        {mode === "receta" && (recipes.length === 0 ? (
          <div className="ft-empty">No tienes recetas guardadas.<div style={{ marginTop: 12 }}><button className="ft-btn" onClick={() => setTab("biblioteca")}><BookOpen size={15} /> Crear una receta</button></div></div>
        ) : (<>
          <div className="ft-row">
            <div className="ft-field" style={{ flex: 2 }}><label>Receta</label><select className="ft-select" value={recId} onChange={(e) => setRecId(e.target.value)}><option value="">Elegir receta…</option>{recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div className="ft-field" style={{ maxWidth: 120 }}><label>Porciones</label><input className="ft-input ft-mono" type="number" inputMode="decimal" step="0.5" value={servings} onChange={(e) => setServings(e.target.value)} /></div>
            <button className="ft-btn" onClick={addRecipe} disabled={!selRec}><Plus size={15} /> Añadir</button>
          </div>
          {recPreview && <div className="ft-prev"><span><b>{Math.round(recPreview.kcal)}</b> kcal</span><span>P <b>{round1(recPreview.protein)}</b></span><span>C <b>{round1(recPreview.carbs)}</b></span><span>G <b>{round1(recPreview.fat)}</b></span><span style={{ opacity: .7 }}>· {servings} de {selRec.servings} porciones</span></div>}
        </>))}

        {mode === "manual" && (<>
          <div className="ft-row" style={{ marginBottom: 10 }}><div className="ft-field" style={{ flex: 3, minWidth: 160 }}><label>Comida</label><input className="ft-input" placeholder="Ej. Café con leche" value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} /></div></div>
          <div className="ft-row">
            <div className="ft-field"><label>Kcal</label><input className="ft-input ft-mono" type="number" placeholder="0" value={m.kcal} onChange={(e) => setM({ ...m, kcal: e.target.value })} /></div>
            <div className="ft-field"><label>Prot</label><input className="ft-input ft-mono" type="number" placeholder="0" value={m.protein} onChange={(e) => setM({ ...m, protein: e.target.value })} /></div>
            <div className="ft-field"><label>Carb</label><input className="ft-input ft-mono" type="number" placeholder="0" value={m.carbs} onChange={(e) => setM({ ...m, carbs: e.target.value })} /></div>
            <div className="ft-field"><label>Grasa</label><input className="ft-input ft-mono" type="number" placeholder="0" value={m.fat} onChange={(e) => setM({ ...m, fat: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addManual()} /></div>
            <button className="ft-btn" onClick={addManual}><Plus size={15} /></button>
          </div>
        </>)}
      </EPanel>

      <EPanel title="Comidas del día" meta={`${dayItems.length} ${dayItems.length === 1 ? "registro" : "registros"}`} i={3}>
        {dayItems.length === 0 ? <div className="ft-empty">Sin registros este día.</div> : (
          <div>
            {dayItems.map((n, idx) => (
              <div key={n.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: idx < dayItems.length - 1 ? `1px solid ${A_HAIR}` : "none" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{n.name}</div>
                  <div style={{ fontFamily: A_MONO, fontSize: 11, color: A_INK2, marginTop: 2 }}>{n.grams ? `${n.grams} ${n.unit || "g"} · ` : ""}P {Math.round(n.protein)} · C {Math.round(n.carbs)} · G {Math.round(n.fat)}</div>
                </div>
                <div style={{ fontFamily: A_DISP, fontWeight: 800, fontSize: 20, color: A_ACC, fontVariantNumeric: "tabular-nums" }}>{Math.round(n.kcal)}<span style={{ fontSize: 11, fontFamily: A_MONO, color: A_INK2, marginLeft: 3 }}>kcal</span></div>
                <button className="ft-trash" onClick={() => del(n.id)}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </EPanel>
    </div>
  );
}

/* ----------------------------- LIBRARY (alimentos + catálogo + recetas) ----------------------------- */
export function Library({ foods, setFoods, recipes, setRecipes }) {
  const [view, setView] = useState("mis");
  const [f, setF] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "", unit: "g" });
  const [editId, setEditId] = useState(null); const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("Todas"); const [catQ, setCatQ] = useState("");
  // recetas
  const [rName, setRName] = useState(""); const [rServings, setRServings] = useState("1");
  const [rItems, setRItems] = useState([]); const [rSel, setRSel] = useState(null); const [rGrams, setRGrams] = useState("");

  const existing = useMemo(() => new Set(foods.map((x) => x.name.toLowerCase())), [foods]);
  const save = () => {
    if (!f.name.trim()) return;
    const data = { name: f.name.trim(), kcal: +f.kcal || 0, protein: +f.protein || 0, carbs: +f.carbs || 0, fat: +f.fat || 0, unit: f.unit || "g" };
    setFoods((p) => (editId ? p.map((x) => x.id === editId ? { ...x, ...data } : x) : [...p, { id: uid(), ...data }]).sort((a, b) => a.name.localeCompare(b.name)));
    setF({ name: "", kcal: "", protein: "", carbs: "", fat: "", unit: "g" }); setEditId(null);
  };
  const edit = (food) => { setView("mis"); setEditId(food.id); setF({ name: food.name, kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat, unit: food.unit || "g" }); };
  const del = (id) => { setFoods((p) => p.filter((x) => x.id !== id)); if (editId === id) setEditId(null); };
  const addCat = (item) => { if (existing.has(item.name.toLowerCase())) return; setFoods((p) => [...p, { id: uid(), ...item }].sort((a, b) => a.name.localeCompare(b.name))); };
  const addCategory = (cat) => { const add = CATALOG.filter((i) => i.cat === cat && !existing.has(i.name.toLowerCase())).map((i) => ({ id: uid(), name: i.name, kcal: i.kcal, protein: i.protein, carbs: i.carbs, fat: i.fat, unit: i.unit || "g" })); if (add.length) setFoods((p) => [...p, ...add].sort((a, b) => a.name.localeCompare(b.name))); };

  const myList = foods.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
  const catItems = CATALOG.filter((i) => (catFilter === "Todas" || i.cat === catFilter) && i.name.toLowerCase().includes(catQ.toLowerCase()));
  const catsToShow = catFilter === "Todas" ? CATALOG_CATS : [catFilter];

  // recetas
  const addRItem = () => { if (!rSel || !rGrams) return; const c = scaleFood(rSel, rGrams); setRItems((p) => [...p, { id: uid(), name: rSel.name, grams: Number(rGrams), unit: rSel.unit || "g", kcal: round1(c.kcal), protein: round1(c.protein), carbs: round1(c.carbs), fat: round1(c.fat) }]); setRSel(null); setRGrams(""); };
  const delRItem = (id) => setRItems((p) => p.filter((x) => x.id !== id));
  const rTotal = rItems.reduce((t, i) => ({ kcal: t.kcal + i.kcal, protein: t.protein + i.protein, carbs: t.carbs + i.carbs, fat: t.fat + i.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const saveRecipe = () => { if (!rName.trim() || rItems.length === 0) return; setRecipes((p) => [...p, { id: uid(), name: rName.trim(), servings: Number(rServings) || 1, items: rItems }]); setRName(""); setRServings("1"); setRItems([]); };
  const delRecipe = (id) => setRecipes((p) => p.filter((r) => r.id !== id));

  return (
    <>
      <ScreenMast kicker="FITTRACK · BIBLIOTECA" title="Biblioteca" />
      <div style={{ height: 16 }} />
      <div className="ft-toggle">
        <button className={view === "mis" ? "on" : ""} onClick={() => setView("mis")}>Mis alimentos ({foods.length})</button>
        <button className={view === "catalogo" ? "on" : ""} onClick={() => setView("catalogo")}>Catálogo</button>
        <button className={view === "recetas" ? "on" : ""} onClick={() => setView("recetas")}>Recetas ({recipes.length})</button>
      </div>

      {view === "mis" && (<>
        <div className="ft-card">
          <h2><Plus size={16} /> {editId ? "Editar alimento" : "Añadir alimento"} <span className="tag">por 100 {f.unit}</span></h2>
          <div className="ft-row" style={{ marginBottom: 10 }}>
            <div className="ft-field" style={{ flex: 3, minWidth: 150 }}><label>Nombre</label><input className="ft-input" placeholder="Ej. Pechuga de pollo (cruda)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="ft-field" style={{ maxWidth: 130 }}><label>Se mide en</label><select className="ft-select" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}><option value="g">Sólido (g)</option><option value="ml">Líquido (ml)</option></select></div>
          </div>
          <div className="ft-row">
            <div className="ft-field"><label>Kcal/100{f.unit}</label><input className="ft-input ft-mono" type="number" placeholder="0" value={f.kcal} onChange={(e) => setF({ ...f, kcal: e.target.value })} /></div>
            <div className="ft-field"><label>Prot/100{f.unit}</label><input className="ft-input ft-mono" type="number" placeholder="0" value={f.protein} onChange={(e) => setF({ ...f, protein: e.target.value })} /></div>
            <div className="ft-field"><label>Carb/100{f.unit}</label><input className="ft-input ft-mono" type="number" placeholder="0" value={f.carbs} onChange={(e) => setF({ ...f, carbs: e.target.value })} /></div>
            <div className="ft-field"><label>Grasa/100{f.unit}</label><input className="ft-input ft-mono" type="number" placeholder="0" value={f.fat} onChange={(e) => setF({ ...f, fat: e.target.value })} onKeyDown={(e) => e.key === "Enter" && save()} /></div>
            <button className="ft-btn" onClick={save}>{editId ? <Check size={15} /> : <Plus size={15} />} {editId ? "Guardar" : "Añadir"}</button>
            {editId && <button className="ft-btn ghost" onClick={() => { setEditId(null); setF({ name: "", kcal: "", protein: "", carbs: "", fat: "", unit: "g" }); }}><X size={15} /></button>}
          </div>
        </div>
        <div className="ft-card">
          <h2><Apple size={16} /> Mis alimentos <span className="tag">{foods.length}</span></h2>
          {foods.length === 0 ? <div className="ft-empty">Aún no has guardado alimentos.<div style={{ marginTop: 12 }}><button className="ft-btn" onClick={() => setView("catalogo")}><Apple size={15} /> Cargar desde el catálogo</button></div></div> : (<>
            {foods.length > 6 && <input className="ft-input" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />}
            <div className="ft-list">{myList.map((x) => (<div className="ft-li" key={x.id}><span className="li-main">{x.name}</span><span className="li-sub">{x.kcal} kcal · P {x.protein} · C {x.carbs} · G {x.fat} <span style={{ opacity: .6 }}>/100{x.unit || "g"}</span></span><button className="ft-trash" onClick={() => edit(x)}><Pencil size={15} /></button><button className="ft-trash" onClick={() => del(x.id)}><Trash2 size={15} /></button></div>))}</div>
          </>)}
        </div>
      </>)}

      {view === "catalogo" && (<>
        <div className="ft-alert info"><Apple size={20} color="var(--blue)" /><div><div className="t">Catálogo de referencia · {CATALOG.length} alimentos</div><div className="b">Valores por 100 g (USDA y guías estándar). <b style={{ color: "var(--text)" }}>Carnes y pescados en crudo</b>, granos y legumbres cocidos, harinas en seco. Toca + para añadir; luego edítalo si tu etiqueta difiere.</div></div></div>
        <div className="ft-card">
          <div className="ft-row" style={{ marginBottom: 14 }}>
            <div className="ft-field"><label>Categoría</label><select className="ft-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}><option>Todas</option>{CATALOG_CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="ft-field" style={{ flex: 2 }}><label>Buscar</label><input className="ft-input" placeholder="Ej. salmón, ribeye, lentejas…" value={catQ} onChange={(e) => setCatQ(e.target.value)} /></div>
          </div>
          {catsToShow.map((cat) => {
            const items = catItems.filter((i) => i.cat === cat); if (!items.length) return null;
            const remaining = items.filter((i) => !existing.has(i.name.toLowerCase())).length;
            return (<div key={cat} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><h3 className="ft-h3">{cat}</h3>{remaining > 0 && <button className="ft-iconbtn" style={{ marginLeft: "auto" }} onClick={() => addCategory(cat)}><Plus size={13} /> Añadir todos ({remaining})</button>}</div>
              <div className="ft-list">{items.map((i) => { const added = existing.has(i.name.toLowerCase()); return (<div className="ft-li" key={i.name}><span className="li-main">{i.name}</span><span className="li-sub">{i.kcal} kcal · P {i.protein} · C {i.carbs} · G {i.fat} <span style={{ opacity: .6 }}>/100{i.unit}</span></span><button className={"ft-btn" + (added ? " ghost" : "")} style={{ padding: "7px 12px" }} onClick={() => addCat(i)} disabled={added}>{added ? <><Check size={14} /> Añadido</> : <Plus size={14} />}</button></div>); })}</div>
            </div>);
          })}
          {catItems.length === 0 && <div className="ft-empty">Sin resultados.</div>}
        </div>
      </>)}

      {view === "recetas" && (<>
        <div className="ft-alert info"><BookOpen size={20} color="var(--blue)" /><div><div className="t">Recetas y platos combinados</div><div className="b">Junta varios alimentos de tu biblioteca en una receta (ej. "mi desayuno"). FitTrack suma los macros totales y por porción; luego la registras de un toque en Nutrición.</div></div></div>
        <div className="ft-card">
          <h2><Plus size={16} /> Nueva receta</h2>
          {foods.length === 0 ? <div className="ft-empty">Primero añade alimentos a tu biblioteca.</div> : (<>
            <div className="ft-row" style={{ marginBottom: 12 }}>
              <div className="ft-field" style={{ flex: 2 }}><label>Nombre</label><input className="ft-input" placeholder="Ej. Bowl de yogur griego" value={rName} onChange={(e) => setRName(e.target.value)} /></div>
              <div className="ft-field" style={{ maxWidth: 120 }}><label>Porciones</label><input className="ft-input ft-mono" type="number" inputMode="numeric" value={rServings} onChange={(e) => setRServings(e.target.value)} /></div>
            </div>
            <div className="ft-row">
              <FoodCombo foods={foods} selected={rSel} onChange={setRSel} label="Ingrediente" />
              <AmountField food={rSel} value={rGrams} onChange={setRGrams} onEnter={addRItem} />
              <button className="ft-btn ghost" onClick={addRItem} disabled={!rSel || !rGrams}><Plus size={15} /> Ingrediente</button>
            </div>
            {rItems.length > 0 && (<>
              <div className="ft-list" style={{ marginTop: 12 }}>
                {rItems.map((i) => (<div className="ft-li" key={i.id}><span className="li-main">{i.name}<span className="li-sub" style={{ marginLeft: 8 }}>{i.grams} {i.unit || "g"}</span></span><span className="li-v" style={{ color: "var(--accent)" }}>{Math.round(i.kcal)} kcal</span><button className="ft-trash" onClick={() => delRItem(i.id)}><Trash2 size={15} /></button></div>))}
              </div>
              <div className="ft-prev"><span style={{ opacity: .7 }}>Total:</span><span><b>{Math.round(rTotal.kcal)}</b> kcal</span><span>P <b>{round1(rTotal.protein)}</b></span><span>C <b>{round1(rTotal.carbs)}</b></span><span>G <b>{round1(rTotal.fat)}</b></span><span style={{ opacity: .7 }}>· {Math.round(rTotal.kcal / (Number(rServings) || 1))} kcal/porción</span></div>
              <div style={{ marginTop: 12 }}><button className="ft-btn" onClick={saveRecipe}><Check size={15} /> Guardar receta</button></div>
            </>)}
          </>)}
        </div>
        <div className="ft-card">
          <h2><BookOpen size={16} /> Mis recetas <span className="tag">{recipes.length}</span></h2>
          {recipes.length === 0 ? <div className="ft-empty">Aún no has guardado recetas.</div> : (
            <div className="ft-list">{recipes.map((r) => { const t = r.items.reduce((a, i) => ({ kcal: a.kcal + i.kcal, protein: a.protein + i.protein }), { kcal: 0, protein: 0 }); return (<div className="ft-li" key={r.id}><span className="li-main">{r.name}<span className="li-sub" style={{ marginLeft: 8 }}>{r.items.length} ingr · {r.servings} porc.</span></span><span className="li-sub">{Math.round(t.kcal)} kcal · {round1(t.protein)}g P total</span><button className="ft-trash" onClick={() => delRecipe(r.id)}><Trash2 size={15} /></button></div>); })}</div>
          )}
        </div>
      </>)}
    </>
  );
}

/* ----------------------------- ROUTINES ----------------------------- */
export function Routines({ routines, setRoutines }) {
  const [name, setName] = useState("");
  const [items, setItems] = useState([]);
  const [exName, setExName] = useState(""); const [primary, setPrimary] = useState(MUSCLES[0]); const [secondary, setSecondary] = useState([]);
  const [sets, setSets] = useState("3"); const [reps, setReps] = useState("8");

  const applyPreset = (idx) => { if (idx === "") return; const p = EXERCISE_PRESETS[Number(idx)]; setExName(p.name); setPrimary(p.primary); setSecondary(p.secondary); };
  const toggleSec = (m) => setSecondary((s) => s.includes(m) ? s.filter((x) => x !== m) : [...s, m]);
  const addItem = () => { if (!exName.trim()) return; setItems((p) => [...p, { id: uid(), name: exName.trim(), primary, secondary: secondary.filter((m) => m !== primary), targetSets: Number(sets) || 3, targetReps: reps }]); setExName(""); setSecondary([]); };
  const delItem = (id) => setItems((p) => p.filter((x) => x.id !== id));
  const saveRoutine = () => { if (!name.trim() || items.length === 0) return; setRoutines((p) => [...p, { id: uid(), name: name.trim(), exercises: items }]); setName(""); setItems([]); };
  const delRoutine = (id) => setRoutines((p) => p.filter((r) => r.id !== id));
  const loadTemplates = () => {
    setRoutines((prev) => {
      const have = new Set(prev.map((r) => r.name));
      const add = ROUTINE_TEMPLATES.filter((t) => !have.has(t.name)).map((t) => templateToAppRoutine(t, uid));
      return [...prev, ...add];
    });
  };

  return (
    <>
      <ScreenMast kicker="FITTRACK · RUTINAS" title="Rutinas" />
      <div style={{ height: 16 }} />
      <div className="ft-alert info"><ListChecks size={20} color="var(--blue)" /><div><div className="t">Plantillas de entrenamiento</div><div className="b">Define tus días (A / B / C, Push / Pull / Legs…) una vez. Después, en Entrenar las cargas con un toque: registrar pasa a ser editar, no escribir desde cero.</div></div></div>
      <div className="ft-card">
        <h2><Plus size={16} /> Nueva rutina</h2>
        <div className="ft-row" style={{ marginBottom: 12 }}><div className="ft-field" style={{ flex: 2 }}><label>Nombre</label><input className="ft-input" placeholder="Ej. Día A · Empuje" value={name} onChange={(e) => setName(e.target.value)} /></div></div>
        <div className="ft-row" style={{ marginBottom: 10 }}>
          <div className="ft-field" style={{ flex: 2, minWidth: 140 }}><label>Ejercicio</label><input className="ft-input" placeholder="Ej. Press banca" value={exName} onChange={(e) => setExName(e.target.value)} /></div>
          <div className="ft-field"><label>Sugerencias · {primary}</label><select className="ft-select" value="" onChange={(e) => applyPreset(e.target.value)}><option value="">Elegir…</option>{EXERCISE_PRESETS.map((p, i) => p.primary === primary ? <option key={p.name} value={i}>{p.name}</option> : null)}</select></div>
          <div className="ft-field"><label>Primario</label><select className="ft-select" value={primary} onChange={(e) => setPrimary(e.target.value)}>{MUSCLES.map((m) => <option key={m}>{m}</option>)}</select></div>
          <div className="ft-field" style={{ maxWidth: 90 }}><label>Series</label><input className="ft-input ft-mono" type="number" value={sets} onChange={(e) => setSets(e.target.value)} /></div>
          <div className="ft-field" style={{ maxWidth: 90 }}><label>Reps</label><input className="ft-input ft-mono" value={reps} onChange={(e) => setReps(e.target.value)} /></div>
        </div>
        <div className="ft-secchips">{MUSCLES.filter((m) => m !== primary).map((m) => <span key={m} className={"ft-secchip" + (secondary.includes(m) ? " on" : "")} onClick={() => toggleSec(m)}>{m}</span>)}</div>
        <div style={{ marginTop: 12 }}><button className="ft-btn ghost" onClick={addItem}><Plus size={15} /> Añadir ejercicio</button></div>
        {items.length > 0 && (<>
          <div className="ft-list" style={{ marginTop: 14 }}>
            {items.map((i) => (<div className="ft-li" key={i.id}><span className="dot" style={{ width: 10, height: 10, borderRadius: "50%", background: MUSCLE_COLOR[i.primary] || "#888" }} /><span className="li-main">{i.name}</span><span className="li-sub">{i.primary} · {i.targetSets}×{i.targetReps}</span><button className="ft-trash" onClick={() => delItem(i.id)}><Trash2 size={15} /></button></div>))}
          </div>
          <div style={{ marginTop: 12 }}><button className="ft-btn" onClick={saveRoutine}><Check size={15} /> Guardar rutina</button></div>
        </>)}
      </div>
      <div className="ft-card">
        <h2><ListChecks size={16} /> Mis rutinas <span className="tag">{routines.length}</span></h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <button className="ft-btn ghost" onClick={loadTemplates}><Download size={15} /> Cargar plantillas Fase 1</button>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "var(--muted)" }}>{ROUTINE_TEMPLATES.length} rutinas guía · Empuje/Tracción/Pierna + accesorio + amable</span>
        </div>
        {routines.length === 0 ? <div className="ft-empty">Aún no has creado rutinas. Usa “Cargar plantillas Fase 1” para empezar con las rutinas guía, o créalas a mano arriba.</div> : (
          <div className="ft-list">{routines.map((r) => (
            <div className="ft-li" key={r.id}>
              <span className="li-main">{r.name}</span>
              <span className="li-sub">{r.focus ? `${r.focus} · ` : ""}{r.exercises.length} ej.{r.estimatedMin ? ` · ~${r.estimatedMin} min` : ""}</span>
              <button className="ft-trash" onClick={() => delRoutine(r.id)}><Trash2 size={15} /></button>
            </div>
          ))}</div>
        )}
      </div>
    </>
  );
}
