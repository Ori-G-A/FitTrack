import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabase.js";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, ComposedChart, Cell
} from "recharts";
import {
  Dumbbell, Scale, Utensils, LayoutDashboard, Plus, Trash2,
  Download, Upload, Target, TrendingUp, TrendingDown, AlertTriangle,
  Check, ChevronLeft, ChevronRight, Flame, Timer, Play, Pause, RotateCcw,
  Apple, Pencil, X, Clock, Activity, Ruler, Moon, ListChecks, Bell, Trophy,
  Settings, Zap, BookOpen, Droplet, Lock, Camera
} from "lucide-react";

/* ----------------------------- helpers ----------------------------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);
const round1 = (x) => Math.round(x * 10) / 10;
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
const daysBetween = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
const isoMinus = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const clock = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(m)}:${p(ss)}` : `${p(m)}:${p(ss)}`;
};
const epley = (kg, reps) => (kg > 0 && reps > 0 ? kg * (1 + reps / 30) : 0);
const KCAL_PER_KG = 7700;

const MUSCLES = ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Cuádriceps", "Femoral", "Glúteos", "Gemelos", "Core", "Trapecio", "Antebrazo"];
const MAJOR_MUSCLES = ["Pecho", "Espalda", "Hombros", "Cuádriceps", "Femoral"];
const MUSCLE_COLOR = {
  Pecho: "#c5f82a", Espalda: "#5ad1ff", Hombros: "#ff8a3d", Bíceps: "#ff6b9d", Tríceps: "#b388ff",
  Cuádriceps: "#ffd23d", Femoral: "#3ddc97", Glúteos: "#ff6b4a", Gemelos: "#7ee787", Core: "#f2f0e6", Trapecio: "#9aa0a6", Antebrazo: "#c0a3ff",
};
const SECONDARY_FACTOR = 0.5;
const CARDIO_TYPES = ["Caminar", "Correr", "Bici", "Elíptica", "Remo", "Natación", "HIIT", "Otro"];

const EXERCISE_PRESETS = [
  { name: "Press banca", primary: "Pecho", secondary: ["Tríceps", "Hombros"] },
  { name: "Press inclinado", primary: "Pecho", secondary: ["Hombros", "Tríceps"] },
  { name: "Fondos", primary: "Tríceps", secondary: ["Pecho", "Hombros"] },
  { name: "Sentadilla", primary: "Cuádriceps", secondary: ["Glúteos", "Femoral", "Core"] },
  { name: "Prensa", primary: "Cuádriceps", secondary: ["Glúteos", "Femoral"] },
  { name: "Zancadas", primary: "Cuádriceps", secondary: ["Glúteos", "Femoral"] },
  { name: "Peso muerto", primary: "Femoral", secondary: ["Glúteos", "Espalda", "Trapecio", "Core"] },
  { name: "Hip thrust", primary: "Glúteos", secondary: ["Femoral"] },
  { name: "Dominadas", primary: "Espalda", secondary: ["Bíceps", "Antebrazo"] },
  { name: "Jalón al pecho", primary: "Espalda", secondary: ["Bíceps"] },
  { name: "Remo con barra", primary: "Espalda", secondary: ["Bíceps", "Trapecio"] },
  { name: "Press militar", primary: "Hombros", secondary: ["Tríceps"] },
  { name: "Elevaciones laterales", primary: "Hombros", secondary: [] },
  { name: "Curl bíceps", primary: "Bíceps", secondary: ["Antebrazo"] },
  { name: "Extensión tríceps", primary: "Tríceps", secondary: [] },
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
  ["Lácteos y huevos", "Leche entera", 61, 3.2, 4.8, 3.3], ["Lácteos y huevos", "Leche desnatada", 34, 3.4, 5, 0.1],
  ["Lácteos y huevos", "Yogur griego (0%)", 59, 10, 3.6, 0.4], ["Lácteos y huevos", "Yogur griego (entero)", 97, 9, 4, 5],
  ["Lácteos y huevos", "Yogur natural", 61, 3.5, 4.7, 3.3], ["Lácteos y huevos", "Requesón / cottage", 98, 11, 3.4, 4.3],
  ["Lácteos y huevos", "Queso cheddar", 403, 25, 1.3, 33], ["Lácteos y huevos", "Queso mozzarella", 300, 22, 2.2, 22],
  ["Lácteos y huevos", "Queso parmesano", 392, 36, 3.2, 26], ["Lácteos y huevos", "Queso fresco", 264, 18, 4, 20],
  ["Lácteos y huevos", "Huevo entero", 143, 13, 0.7, 9.5], ["Lácteos y huevos", "Clara de huevo", 52, 11, 0.7, 0.2],
  ["Lácteos y huevos", "Mantequilla", 717, 0.9, 0.1, 81], ["Lácteos y huevos", "Nata / crema de leche", 340, 2, 3, 36], ["Lácteos y huevos", "Leche de almendra (sin azúcar)", 15, 0.6, 0.6, 1.2],
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
  ["Aceites y grasas", "Aceite de oliva", 884, 0, 0, 100], ["Aceites y grasas", "Aceite de coco", 862, 0, 0, 100], ["Aceites y grasas", "Aceite de girasol", 884, 0, 0, 100],
  ["Aceites y grasas", "Aceite de aguacate", 884, 0, 0, 100], ["Aceites y grasas", "Aceite de canola", 884, 0, 0, 100], ["Aceites y grasas", "Manteca de cerdo", 902, 0, 0, 100],
];
const CATALOG = CATALOG_RAW.map((r) => ({ cat: r[0], name: r[1], kcal: r[2], protein: r[3], carbs: r[4], fat: r[5] }));

/* least-squares slope per day over [{x,y}] */
function slopePerDay(points) {
  const n = points.length;
  if (n < 2) return null;
  const sx = points.reduce((s, p) => s + p.x, 0), sy = points.reduce((s, p) => s + p.y, 0);
  const sxx = points.reduce((s, p) => s + p.x * p.x, 0), sxy = points.reduce((s, p) => s + p.x * p.y, 0);
  const d = n * sxx - sx * sx;
  return d === 0 ? null : (n * sxy - sx * sy) / d;
}

/* ---------- ciclo menstrual ---------- */
const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const CYCLE_PHASES = {
  "Menstrual": { color: "#ff6b4a", note: "Energía variable y posibles molestias. Está bien bajar intensidad si lo necesitas; escucha a tu cuerpo." },
  "Folicular": { color: "#3ddc97", note: "Al subir el estrógeno, muchas personas reportan más energía y fuerza. Suele ser una buena ventana para intentar récords." },
  "Ovulatoria": { color: "#c5f82a", note: "Pico de energía frecuente. Algunas notan más laxitud articular: cuida especialmente la técnica con cargas altas." },
  "Lútea": { color: "#b388ff", note: "En la fase lútea tardía algunas reportan más fatiga, antojos y peor recuperación. Que el rendimiento fluctúe aquí es normal." },
  "Por confirmar": { color: "#878d86", note: "Tu periodo podría ir retrasado respecto a tu media. Registra el inicio cuando llegue para afinar las predicciones." },
};
function cycleInfo(periods) {
  if (!periods || !periods.length) return null;
  const starts = periods.map((p) => p.date).sort();
  const last = starts[starts.length - 1];
  const lens = [];
  for (let i = 1; i < starts.length; i++) lens.push(daysBetween(starts[i - 1], starts[i]));
  const valid = lens.filter((l) => l >= 18 && l <= 45);
  const avgCycle = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 28;
  const durs = periods.map((p) => Number(p.duration) || 5);
  const avgPeriod = Math.max(1, Math.round(durs.reduce((a, b) => a + b, 0) / durs.length));
  const day = daysBetween(last, todayISO()) + 1;
  const nextDate = addDays(last, avgCycle);
  const daysToNext = daysBetween(todayISO(), nextDate);
  const ovulation = avgCycle - 14;
  let phase;
  if (day > avgCycle + 2) phase = "Por confirmar";
  else if (day <= avgPeriod) phase = "Menstrual";
  else if (day < ovulation - 1) phase = "Folicular";
  else if (day <= ovulation + 1) phase = "Ovulatoria";
  else phase = "Lútea";
  return { avgCycle, avgPeriod, day, phase, nextDate, daysToNext, samples: valid.length };
}

/* ----------------------------- storage ----------------------------- */
async function loadKey(key, fb) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fb;
    const { data, error } = await supabase
      .from("app_data").select("value").eq("user_id", user.id).eq("key", key).single();
    if (error || !data) return fb;
    return data.value;
  } catch { return fb; }
}
async function saveKey(key, val) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("app_data").upsert(
      { user_id: user.id, key, value: val },
      { onConflict: "user_id,key" }
    );
  } catch (e) { console.error(e); }
}
const DEFAULT_GOALS = { startWeight: "", targetWeight: "", weeklyChange: -0.4, kcalTarget: 2200, proteinTarget: 150, autoMacros: false, activity: "moderado" };

function migrateWorkouts(ws) {
  return ws.map((w) => ({
    ...w, durationMin: w.durationMin || 0, cardio: w.cardio || [],
    exercises: (w.exercises || []).map((e) => ({ ...e, primary: e.primary || e.muscle || MUSCLES[0], secondary: e.secondary || [] })),
  }));
}
const scaleFood = (food, g) => { const k = (Number(g) || 0) / 100; return { kcal: food.kcal * k, protein: food.protein * k, carbs: food.carbs * k, fat: food.fat * k }; };

async function sha256(s) {
  try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
  catch { return "plain:" + s; }
}
function compressImage(file, maxPx = 820, quality = 0.62) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen")); };
    img.src = url;
  });
}
const ACTIVITY = [
  { key: "sedentario", label: "Sedentario", factor: 28 },
  { key: "ligero", label: "Ligero (1-2 entrenos/sem)", factor: 30 },
  { key: "moderado", label: "Moderado (3-4/sem)", factor: 32 },
  { key: "activo", label: "Activo (5-6/sem)", factor: 35 },
  { key: "muy_activo", label: "Muy activo (físico + diario)", factor: 38 },
];

/* ----------------------------- styles ----------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;800;900&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.ft-root *{box-sizing:border-box;}
.ft-root{--bg:#0b0d0a;--panel:#14171a;--panel2:#1b1f22;--line:#262b2d;--text:#e9ebe5;--muted:#878d86;--accent:#c5f82a;--accentdim:rgba(197,248,42,.12);--danger:#ff6b4a;--blue:#5ad1ff;--ok:#3ddc97;font-family:'Hanken Grotesk',sans-serif;color:var(--text);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased;line-height:1.4;background-image:radial-gradient(circle at 85% -5%, rgba(197,248,42,.07), transparent 45%);}
.ft-mono{font-family:'IBM Plex Mono',monospace;}
.ft-wrap{max-width:1120px;margin:0 auto;padding:20px 18px 90px;}
.ft-topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:22px;}
.ft-logo{display:flex;align-items:center;gap:10px;}
.ft-logo .mark{width:34px;height:34px;border-radius:9px;background:var(--accent);display:grid;place-items:center;color:#0b0d0a;}
.ft-logo h1{font-family:'Archivo';font-weight:900;letter-spacing:-.04em;text-transform:uppercase;font-size:22px;line-height:1;margin:0;}
.ft-logo span{color:var(--muted);font-size:11px;letter-spacing:.18em;text-transform:uppercase;}
.ft-iconbtn{background:var(--panel);border:1px solid var(--line);color:var(--muted);border-radius:9px;padding:8px 10px;display:inline-flex;gap:6px;align-items:center;cursor:pointer;font-size:12px;font-weight:600;}
.ft-iconbtn:hover{border-color:var(--accent);color:var(--text);}
.ft-nav{display:flex;gap:6px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:5px;margin-bottom:24px;overflow-x:auto;}
.ft-nav button{flex:1;min-width:78px;border:none;background:transparent;color:var(--muted);padding:11px 8px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12.5px;display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;transition:.15s;}
.ft-nav button.active{background:var(--accent);color:#0b0d0a;}
.ft-nav button:not(.active):hover{color:var(--text);background:var(--panel2);}
.ft-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:16px;}
.ft-card h2{font-family:'Archivo';font-weight:800;text-transform:uppercase;letter-spacing:-.01em;font-size:15px;margin:0 0 14px;display:flex;align-items:center;gap:9px;}
.ft-card h2 .tag{margin-left:auto;font-size:11px;color:var(--muted);font-weight:600;letter-spacing:.1em;font-family:'IBM Plex Mono';text-transform:none;}
.ft-row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;}
.ft-field{display:flex;flex-direction:column;gap:5px;flex:1;min-width:90px;}
.ft-field label{font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;font-weight:600;}
.ft-input,.ft-select{background:var(--panel2);border:1px solid var(--line);border-radius:9px;color:var(--text);padding:10px 11px;font-size:14px;font-family:inherit;width:100%;}
.ft-input:focus,.ft-select:focus{outline:none;border-color:var(--accent);}
.ft-mono.ft-input{font-family:'IBM Plex Mono';}
textarea.ft-input{resize:vertical;min-height:60px;}
.ft-btn{background:var(--accent);color:#0b0d0a;border:none;border-radius:9px;padding:10px 16px;font-weight:800;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:7px;}
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
.ft-toggle button.on{background:var(--accent);color:#0b0d0a;}
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
.ft-energy button.on{background:var(--accent);color:#0b0d0a;border-color:var(--accent);}
.ft-photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-top:14px;}
.ft-photo{position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--line);aspect-ratio:3/4;background:var(--panel2);}
.ft-photo img{width:100%;height:100%;object-fit:cover;display:block;}
.ft-photo .cap{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff;font-family:'IBM Plex Mono';font-size:11px;padding:14px 8px 5px;}
.ft-photo-del{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.55);border:none;color:#fff;border-radius:7px;padding:5px;cursor:pointer;display:grid;place-items:center;}
.ft-photo-del:hover{background:var(--danger);}
.ft-lock{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
.ft-lock-box{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:28px 24px;width:100%;max-width:340px;}
.recharts-cartesian-axis-tick-value{font-family:'IBM Plex Mono';font-size:11px;}
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
              <span>{x.name}</span><span className="sub">{x.kcal} kcal/100g</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- APP ----------------------------- */
export default function App() {
  const [tab, setTab] = useState("entrenar");
  const [session, setSession] = useState(undefined); // undefined = cargando, null = sin sesión
  const [loaded, setLoaded] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [weights, setWeights] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [wellness, setWellness] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [goals, setGoals] = useState(DEFAULT_GOALS);

  // Escucha cambios de sesión de Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Carga datos cuando hay sesión activa
  useEffect(() => {
    if (!session) { setLoaded(false); return; }
    (async () => {
      setWorkouts(migrateWorkouts(await loadKey("workouts", [])));
      setWeights(await loadKey("weights", []));
      setNutrition(await loadKey("nutrition", []));
      setFoods(await loadKey("foods", []));
      setRecipes(await loadKey("recipes", []));
      setRoutines(await loadKey("routines", []));
      setMeasurements(await loadKey("measurements", []));
      setWellness(await loadKey("wellness", []));
      setPeriods(await loadKey("periods", []));
      setPhotos(await loadKey("photos", []));
      setGoals(await loadKey("goals", DEFAULT_GOALS));
      setLoaded(true);
    })();
  }, [session?.user?.id]); // eslint-disable-line
  useEffect(() => { if (loaded) saveKey("workouts", workouts); }, [workouts, loaded]);
  useEffect(() => { if (loaded) saveKey("weights", weights); }, [weights, loaded]);
  useEffect(() => { if (loaded) saveKey("nutrition", nutrition); }, [nutrition, loaded]);
  useEffect(() => { if (loaded) saveKey("foods", foods); }, [foods, loaded]);
  useEffect(() => { if (loaded) saveKey("recipes", recipes); }, [recipes, loaded]);
  useEffect(() => { if (loaded) saveKey("routines", routines); }, [routines, loaded]);
  useEffect(() => { if (loaded) saveKey("measurements", measurements); }, [measurements, loaded]);
  useEffect(() => { if (loaded) saveKey("wellness", wellness); }, [wellness, loaded]);
  useEffect(() => { if (loaded) saveKey("periods", periods); }, [periods, loaded]);
  useEffect(() => { if (loaded) saveKey("photos", photos); }, [photos, loaded]);
  useEffect(() => { if (loaded) saveKey("goals", goals); }, [goals, loaded]);

  const signOut = () => supabase.auth.signOut();

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ workouts, weights, nutrition, foods, recipes, routines, measurements, wellness, periods, photos, goals }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `fittrack-${todayISO()}.json`; a.click();
  };
  const fileRef = useRef();
  const importData = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (d.workouts) setWorkouts(migrateWorkouts(d.workouts));
        if (d.weights) setWeights(d.weights);
        if (d.nutrition) setNutrition(d.nutrition);
        if (d.foods) setFoods(d.foods);
        if (d.recipes) setRecipes(d.recipes);
        if (d.routines) setRoutines(d.routines);
        if (d.measurements) setMeasurements(d.measurements);
        if (d.wellness) setWellness(d.wellness);
        if (d.periods) setPeriods(d.periods);
        if (d.photos) setPhotos(d.photos);
        if (d.goals) setGoals(d.goals);
      } catch { alert("Archivo no válido"); }
    };
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
        <div className="ft-wrap"><div className="ft-empty">Cargando…</div></div>
      ) : !session ? (
        <AuthScreen />
      ) : !loaded ? (
        <div className="ft-wrap"><div className="ft-empty">Cargando tus datos…</div></div>
      ) : (
        <div className="ft-wrap">
          <div className="ft-topbar">
            <div className="ft-logo">
              <div className="mark"><Dumbbell size={20} /></div>
              <div><h1>FitTrack</h1><span>tu progreso, medido</span></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
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
          {tab === "entrenar" && <Train workouts={workouts} setWorkouts={setWorkouts} routines={routines} />}
          {tab === "cuerpo" && <Body weights={weights} setWeights={setWeights} measurements={measurements} setMeasurements={setMeasurements} wellness={wellness} setWellness={setWellness} periods={periods} setPeriods={setPeriods} photos={photos} setPhotos={setPhotos} />}
          {tab === "nutricion" && <Nutrition nutrition={nutrition} setNutrition={setNutrition} foods={foods} recipes={recipes} goals={goals} setTab={setTab} />}
          {tab === "biblioteca" && <Library foods={foods} setFoods={setFoods} recipes={recipes} setRecipes={setRecipes} />}
          {tab === "rutinas" && <Routines routines={routines} setRoutines={setRoutines} />}
          {tab === "dashboard" && <Dashboard workouts={workouts} weights={weights} nutrition={nutrition} measurements={measurements} periods={periods} goals={goals} />}
          {tab === "ajustes" && <Goals goals={goals} setGoals={setGoals} weights={weights} exportData={exportData} userEmail={session.user.email} signOut={signOut} />}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- AUTH SCREEN ----------------------------- */
function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: false });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) return;
    setBusy(true); setMsg({ text: "", ok: false });
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ text: error.message, ok: false });
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg({ text: error.message, ok: false });
      else setMsg({ text: "Revisa tu correo para confirmar el registro.", ok: true });
    }
    setBusy(false);
  };

  return (
    <div className="ft-lock">
      <div className="ft-lock-box">
        <div className="ft-logo" style={{ justifyContent: "center", marginBottom: 20 }}>
          <div className="mark"><Dumbbell size={20} /></div>
          <div><h1>FitTrack</h1><span>tu progreso, medido</span></div>
        </div>
        <div className="ft-toggle" style={{ marginBottom: 18 }}>
          <button className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setMsg({ text: "", ok: false }); }}>Entrar</button>
          <button className={mode === "register" ? "on" : ""} onClick={() => { setMode("register"); setMsg({ text: "", ok: false }); }}>Registrarse</button>
        </div>
        <div className="ft-field" style={{ marginBottom: 12 }}>
          <label>Correo electrónico</label>
          <input className="ft-input" type="email" autoFocus value={email} placeholder="tu@email.com"
            onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>
        <div className="ft-field" style={{ marginBottom: 16 }}>
          <label>Contraseña</label>
          <input className="ft-input" type="password" value={password} placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>
        {msg.text && <div style={{ color: msg.ok ? "var(--ok)" : "var(--danger)", fontSize: 13, marginBottom: 12 }}>{msg.text}</div>}
        <button className="ft-btn" onClick={submit} disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
          <Lock size={15} /> {busy ? "…" : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- date bar ----------------------------- */
function DateBar({ date, setDate }) {
  const shift = (n) => { const d = new Date(date + "T00:00:00"); d.setDate(d.getDate() + n); setDate(d.toISOString().slice(0, 10)); };
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
function Train({ workouts, setWorkouts, routines }) {
  const [date, setDate] = useState(todayISO());
  const [name, setName] = useState("");
  const [primary, setPrimary] = useState(MUSCLES[0]);
  const [secondary, setSecondary] = useState([]);
  const [cardio, setCardio] = useState({ type: CARDIO_TYPES[0], minutes: "", kcal: "" });

  const session = workouts.find((w) => w.date === date) || { exercises: [], durationMin: 0, cardio: [] };
  const exercises = session.exercises;
  const cardioList = session.cardio || [];

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
    const ex = { id: uid(), name: name.trim(), primary, secondary: secondary.filter((m) => m !== primary), sets: [{ id: uid(), reps: "", kg: "" }] };
    writeSession({ exercises: [...exercises, ex] }); setName(""); setSecondary([]);
  };
  const loadRoutine = (idx) => {
    if (idx === "") return;
    const r = routines[Number(idx)];
    const newEx = r.exercises.map((e) => ({
      id: uid(), name: e.name, primary: e.primary, secondary: e.secondary || [],
      sets: Array.from({ length: Math.max(1, Number(e.targetSets) || 1) }, () => ({ id: uid(), reps: e.targetReps || "", kg: "" })),
    }));
    writeSession({ exercises: [...exercises, ...newEx] });
  };
  const upEx = (n) => writeSession({ exercises: n });
  const editSet = (exId, sId, f, v) => upEx(exercises.map((e) => e.id !== exId ? e : { ...e, sets: e.sets.map((s) => s.id === sId ? { ...s, [f]: v } : s) }));
  const addSet = (exId) => upEx(exercises.map((e) => e.id !== exId ? e : { ...e, sets: [...e.sets, { id: uid(), reps: "", kg: "" }] }));
  const delSet = (exId, sId) => upEx(exercises.map((e) => e.id !== exId ? e : { ...e, sets: e.sets.length > 1 ? e.sets.filter((s) => s.id !== sId) : e.sets }));
  const delEx = (exId) => upEx(exercises.filter((e) => e.id !== exId));
  const addCardio = () => { if (!cardio.minutes) return; writeSession({ cardio: [...cardioList, { id: uid(), type: cardio.type, minutes: Number(cardio.minutes), kcal: Number(cardio.kcal) || 0 }] }); setCardio({ type: CARDIO_TYPES[0], minutes: "", kcal: "" }); };
  const delCardio = (id) => writeSession({ cardio: cardioList.filter((c) => c.id !== id) });

  // timer
  const [tSec, setTSec] = useState(0); const [tRun, setTRun] = useState(false); const tRef = useRef(null);
  useEffect(() => {
    (async () => {
      const t = await loadKey("timer", { running: false, baseSec: 0, startedAt: null });
      if (t.running && t.startedAt) { setTSec((t.baseSec || 0) + Math.floor((Date.now() - t.startedAt) / 1000)); setTRun(true); }
      else setTSec(t.baseSec || 0);
    })();
    return () => clearInterval(tRef.current);
  }, []);
  useEffect(() => { if (tRun) tRef.current = setInterval(() => setTSec((s) => s + 1), 1000); else clearInterval(tRef.current); return () => clearInterval(tRef.current); }, [tRun]);
  const startT = () => { saveKey("timer", { running: true, startedAt: Date.now(), baseSec: tSec }); setTRun(true); };
  const pauseT = () => { saveKey("timer", { running: false, startedAt: null, baseSec: tSec }); setTRun(false); };
  const resetT = () => { saveKey("timer", { running: false, startedAt: null, baseSec: 0 }); setTRun(false); setTSec(0); };
  const commitT = () => { const min = Math.round(tSec / 60); if (min > 0) writeSession({ durationMin: (session.durationMin || 0) + min }); resetT(); };

  const totalVol = exercises.reduce((t, e) => t + e.sets.reduce((st, s) => st + (Number(s.reps) || 0) * (Number(s.kg) || 0), 0), 0);
  const totalSets = exercises.reduce((t, e) => t + e.sets.length, 0);

  return (
    <>
      <DateBar date={date} setDate={setDate} />

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
            <input className="ft-input ft-mono" type="number" inputMode="numeric" value={session.durationMin || ""} placeholder="0" onChange={(e) => writeSession({ durationMin: Number(e.target.value) || 0 })} /></div>
        </div>
      </div>

      <div className="ft-card">
        <h2><Plus size={16} /> Añadir ejercicio</h2>
        {routines.length > 0 && (
          <div className="ft-row" style={{ marginBottom: 12 }}>
            <div className="ft-field" style={{ maxWidth: 320 }}><label>Cargar una rutina completa</label>
              <select className="ft-select" value="" onChange={(e) => loadRoutine(e.target.value)}>
                <option value="">Elegir rutina…</option>
                {routines.map((r, i) => <option key={r.id} value={i}>{r.name} ({r.exercises.length} ej.)</option>)}
              </select></div>
          </div>
        )}
        <div className="ft-row" style={{ marginBottom: 10 }}>
          <div className="ft-field" style={{ flex: 2, minWidth: 150 }}><label>Ejercicio</label>
            <input className="ft-input" placeholder="Ej. Press banca" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addExercise()} /></div>
          <div className="ft-field"><label>Plantilla rápida</label>
            <select className="ft-select" value="" onChange={(e) => applyPreset(e.target.value)}>
              <option value="">Ejercicio común…</option>
              {EXERCISE_PRESETS.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}
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
          </div>
          {exercises.map((ex) => {
            const best1rm = ex.sets.reduce((m, s) => Math.max(m, epley(Number(s.kg) || 0, Number(s.reps) || 0)), 0);
            return (
              <div className="ft-ex" key={ex.id}>
                <div className="ft-ex-head">
                  <span className="dot" style={{ background: MUSCLE_COLOR[ex.primary] || "#888" }} />
                  <span className="nm">{ex.name}</span>
                  <span className="ft-mu">{ex.primary}</span>
                  {(ex.secondary || []).map((s) => <span key={s} className="ft-mu sec">+{s}</span>)}
                  {best1rm > 0 && <span className="ft-1rm">1RM ~{Math.round(best1rm)} kg</span>}
                  <button className="ft-trash" onClick={() => delEx(ex.id)}><Trash2 size={16} /></button>
                </div>
                <div className="ft-set" style={{ color: "var(--muted)", fontSize: 11, fontFamily: "'IBM Plex Mono'", marginBottom: 4 }}>
                  <span></span><span style={{ textAlign: "center" }}>REPS</span><span style={{ textAlign: "center" }}>KG</span><span></span>
                </div>
                {ex.sets.map((s, i) => (
                  <div className="ft-set" key={s.id}>
                    <span className="ix">{i + 1}</span>
                    <input className="si" type="number" inputMode="numeric" value={s.reps} placeholder="0" onChange={(e) => editSet(ex.id, s.id, "reps", e.target.value)} />
                    <input className="si" type="number" inputMode="decimal" value={s.kg} placeholder="0" onChange={(e) => editSet(ex.id, s.id, "kg", e.target.value)} />
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
function Body({ weights, setWeights, measurements, setMeasurements, wellness, setWellness, periods, setPeriods, photos, setPhotos }) {
  const [wDate, setWDate] = useState(todayISO()); const [kg, setKg] = useState("");
  const addW = () => { if (!kg) return; setWeights((p) => [...p.filter((w) => w.date !== wDate), { id: uid(), date: wDate, kg: Number(kg) }].sort((a, b) => a.date.localeCompare(b.date))); setKg(""); };
  const delW = (id) => setWeights((p) => p.filter((w) => w.id !== id));
  const wSorted = [...weights].sort((a, b) => b.date.localeCompare(a.date));
  const wChart = [...weights].sort((a, b) => a.date.localeCompare(b.date)).map((w) => ({ date: fmtDate(w.date), kg: w.kg }));

  const [mDate, setMDate] = useState(todayISO());
  const [meas, setMeas] = useState({ cintura: "", cadera: "", pecho: "", brazo: "", muslo: "" });
  const addM = () => {
    const vals = Object.fromEntries(Object.entries(meas).map(([k, v]) => [k, v === "" ? null : Number(v)]));
    if (Object.values(vals).every((v) => v === null)) return;
    setMeasurements((p) => [...p.filter((x) => x.date !== mDate), { id: uid(), date: mDate, ...vals }].sort((a, b) => a.date.localeCompare(b.date)));
    setMeas({ cintura: "", cadera: "", pecho: "", brazo: "", muslo: "" });
  };
  const delM = (id) => setMeasurements((p) => p.filter((x) => x.id !== id));
  const mSorted = [...measurements].sort((a, b) => b.date.localeCompare(a.date));
  const cinturaChart = [...measurements].filter((m) => m.cintura != null).sort((a, b) => a.date.localeCompare(b.date)).map((m) => ({ date: fmtDate(m.date), cintura: m.cintura }));

  const [welDate, setWelDate] = useState(todayISO());
  const existingWel = wellness.find((w) => w.date === welDate);
  const [wel, setWel] = useState({ sleep: "", energy: 0, notes: "" });
  useEffect(() => { setWel(existingWel ? { sleep: existingWel.sleep ?? "", energy: existingWel.energy ?? 0, notes: existingWel.notes ?? "" } : { sleep: "", energy: 0, notes: "" }); }, [welDate]); // eslint-disable-line
  const saveWel = () => {
    if (wel.sleep === "" && !wel.energy && !wel.notes.trim()) return;
    setWellness((p) => [...p.filter((x) => x.date !== welDate), { id: uid(), date: welDate, sleep: wel.sleep === "" ? null : Number(wel.sleep), energy: wel.energy || null, notes: wel.notes.trim() }].sort((a, b) => a.date.localeCompare(b.date)));
  };
  const welSorted = [...wellness].sort((a, b) => b.date.localeCompare(a.date));

  const [pDate, setPDate] = useState(todayISO());
  const [pDur, setPDur] = useState("5");
  const addPeriod = () => { setPeriods((p) => [...p.filter((x) => x.date !== pDate), { id: uid(), date: pDate, duration: Number(pDur) || 5 }].sort((a, b) => a.date.localeCompare(b.date))); };
  const delPeriod = (id) => setPeriods((p) => p.filter((x) => x.id !== id));
  const cyc = cycleInfo(periods);
  const pSorted = [...periods].sort((a, b) => b.date.localeCompare(a.date));
  const fmtNext = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long" });

  const photoRef = useRef();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState("");
  const addPhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoBusy(true); setPhotoErr("");
    try {
      const dataUrl = await compressImage(file);
      setPhotos((p) => [{ id: uid(), date: todayISO(), dataUrl }, ...p]);
    } catch { setPhotoErr("No se pudo procesar la imagen."); }
    setPhotoBusy(false); if (photoRef.current) photoRef.current.value = "";
  };
  const delPhoto = (id) => setPhotos((p) => p.filter((x) => x.id !== id));
  const pSortedPhotos = [...photos].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="ft-card">
        <h2><Scale size={16} /> Peso corporal</h2>
        <div className="ft-row">
          <div className="ft-field"><label>Fecha</label><input className="ft-input ft-mono" type="date" value={wDate} onChange={(e) => setWDate(e.target.value)} /></div>
          <div className="ft-field"><label>Peso (kg)</label><input className="ft-input ft-mono" type="number" inputMode="decimal" step="0.1" placeholder="0.0" value={kg} onChange={(e) => setKg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addW()} /></div>
          <button className="ft-btn" onClick={addW}><Check size={15} /> Guardar</button>
        </div>
        {wChart.length >= 2 && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={wChart} margin={{ top: 14, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#262b2d" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#878d86" tick={{ fill: "#878d86" }} /><YAxis stroke="#878d86" tick={{ fill: "#878d86" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#1b1f22", border: "1px solid #262b2d", borderRadius: 8 }} />
              <Line type="monotone" dataKey="kg" stroke="#c5f82a" strokeWidth={2.5} dot={{ r: 3, fill: "#c5f82a" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {wSorted.length > 0 && (
          <div className="ft-list" style={{ marginTop: 12 }}>
            {wSorted.slice(0, 8).map((w, i) => {
              const prev = wSorted[i + 1]; const diff = prev ? w.kg - prev.kg : null;
              return (<div className="ft-li" key={w.id}><span className="li-d">{fmtDate(w.date)}</span><span className="li-main ft-mono">{w.kg.toFixed(1)} kg</span>
                {diff !== null && <span className="li-sub" style={{ color: diff <= 0 ? "var(--ok)" : "var(--danger)" }}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}</span>}
                <button className="ft-trash" onClick={() => delW(w.id)}><Trash2 size={15} /></button></div>);
            })}
          </div>
        )}
      </div>

      <div className="ft-card">
        <h2><Droplet size={16} /> Ciclo menstrual {cyc && <span className="tag">día {cyc.day} · ciclo ~{cyc.avgCycle}d</span>}</h2>
        <div className="ft-row" style={{ marginBottom: 10 }}>
          <div className="ft-field"><label>Inicio del periodo</label><input className="ft-input ft-mono" type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} /></div>
          <div className="ft-field" style={{ maxWidth: 150 }}><label>Días de sangrado</label><input className="ft-input ft-mono" type="number" inputMode="numeric" value={pDur} onChange={(e) => setPDur(e.target.value)} /></div>
          <button className="ft-btn" onClick={addPeriod}><Check size={15} /> Registrar inicio</button>
        </div>
        {cyc ? (
          <div className="ft-alert" style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${CYCLE_PHASES[cyc.phase].color}55`, marginBottom: 0 }}>
            <Droplet size={20} color={CYCLE_PHASES[cyc.phase].color} />
            <div>
              <div className="t">Fase actual: {cyc.phase}{cyc.samples === 0 ? " (estimada sobre 28 días)" : ""}</div>
              <div className="b">{CYCLE_PHASES[cyc.phase].note} {cyc.daysToNext >= 0 ? `Próximo periodo estimado: ${fmtNext(cyc.nextDate)} (~${cyc.daysToNext} días).` : `Tu periodo lleva ~${Math.abs(cyc.daysToNext)} días de retraso respecto a tu media.`}</div>
            </div>
          </div>
        ) : (
          <div className="ft-empty" style={{ padding: "18px 8px" }}>Registra el inicio de tu periodo para ver tu fase actual y la predicción del siguiente. Con 2-3 ciclos las estimaciones se ajustan a ti.</div>
        )}
        {pSorted.length > 0 && (
          <div className="ft-list" style={{ marginTop: 12 }}>
            {pSorted.slice(0, 6).map((p, i) => {
              const prev = pSorted[i + 1];
              const len = prev ? daysBetween(prev.date, p.date) : null;
              return (<div className="ft-li" key={p.id}><span className="li-d">{fmtDate(p.date)}</span><span className="li-main">Inicio de periodo</span><span className="li-sub">{p.duration} días{len ? ` · ciclo ${len}d` : ""}</span><button className="ft-trash" onClick={() => delPeriod(p.id)}><Trash2 size={15} /></button></div>);
            })}
          </div>
        )}
      </div>

      <div className="ft-card">
        <h2><Ruler size={16} /> Medidas corporales <span className="tag">cm</span></h2>
        <div className="ft-row" style={{ marginBottom: 10 }}>
          <div className="ft-field"><label>Fecha</label><input className="ft-input ft-mono" type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} /></div>
        </div>
        <div className="ft-row">
          {["cintura", "cadera", "pecho", "brazo", "muslo"].map((k) => (
            <div className="ft-field" key={k}><label>{k}</label><input className="ft-input ft-mono" type="number" inputMode="decimal" step="0.1" placeholder="–" value={meas[k]} onChange={(e) => setMeas({ ...meas, [k]: e.target.value })} /></div>
          ))}
          <button className="ft-btn" onClick={addM}><Check size={15} /></button>
        </div>
        {cinturaChart.length >= 2 && (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cinturaChart} margin={{ top: 16, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#262b2d" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#878d86" tick={{ fill: "#878d86" }} /><YAxis stroke="#878d86" tick={{ fill: "#878d86" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#1b1f22", border: "1px solid #262b2d", borderRadius: 8 }} />
              <Line type="monotone" dataKey="cintura" stroke="#5ad1ff" strokeWidth={2.5} dot={{ r: 3, fill: "#5ad1ff" }} name="Cintura" />
            </LineChart>
          </ResponsiveContainer>
        )}
        {mSorted.length > 0 && (
          <div className="ft-list" style={{ marginTop: 12 }}>
            {mSorted.slice(0, 6).map((m) => (
              <div className="ft-li" key={m.id}><span className="li-d">{fmtDate(m.date)}</span>
                <span className="li-sub" style={{ flex: 1 }}>{["cintura", "cadera", "pecho", "brazo", "muslo"].filter((k) => m[k] != null).map((k) => `${k} ${m[k]}`).join(" · ")}</span>
                <button className="ft-trash" onClick={() => delM(m.id)}><Trash2 size={15} /></button></div>
            ))}
          </div>
        )}
      </div>

      <div className="ft-card">
        <h2><Moon size={16} /> Bienestar diario</h2>
        <div className="ft-row" style={{ marginBottom: 10 }}>
          <div className="ft-field"><label>Fecha</label><input className="ft-input ft-mono" type="date" value={welDate} onChange={(e) => setWelDate(e.target.value)} /></div>
          <div className="ft-field"><label>Horas de sueño</label><input className="ft-input ft-mono" type="number" inputMode="decimal" step="0.5" placeholder="0" value={wel.sleep} onChange={(e) => setWel({ ...wel, sleep: e.target.value })} /></div>
        </div>
        <label style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>Energía / cómo te sentiste</label>
        <div className="ft-energy" style={{ marginTop: 6, marginBottom: 12 }}>
          {[1, 2, 3, 4, 5].map((n) => <button key={n} className={wel.energy === n ? "on" : ""} onClick={() => setWel({ ...wel, energy: n })}>{n}</button>)}
        </div>
        <textarea className="ft-input" placeholder="Notas del día (dormí mal, viaje, enfermo…)" value={wel.notes} onChange={(e) => setWel({ ...wel, notes: e.target.value })} />
        <div style={{ marginTop: 12 }}><button className="ft-btn" onClick={saveWel}><Check size={15} /> Guardar bienestar</button></div>
        {welSorted.length > 0 && (
          <div className="ft-list" style={{ marginTop: 14 }}>
            {welSorted.slice(0, 6).map((w) => (
              <div className="ft-li" key={w.id}><span className="li-d">{fmtDate(w.date)}</span>
                <span className="li-sub">{w.sleep != null ? `${w.sleep}h` : ""} {w.energy ? `· energía ${w.energy}/5` : ""}</span>
                {w.notes && <span className="li-main" style={{ fontWeight: 400, fontStyle: "italic", color: "var(--muted)" }}>“{w.notes}”</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ft-card">
        <h2><Camera size={16} /> Fotos de progreso <span className="tag">{photos.length}</span></h2>
        <input ref={photoRef} type="file" accept="image/*" hidden onChange={addPhoto} />
        <button className="ft-btn" onClick={() => photoRef.current.click()} disabled={photoBusy}><Camera size={15} /> {photoBusy ? "Procesando…" : "Subir foto de hoy"}</button>
        {photoErr && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>{photoErr}</div>}
        <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 10, marginBottom: 0 }}>Las fotos se comprimen y se guardan en tu app. Por el límite de almacenamiento, manténlas en unas pocas decenas; quedan incluidas en tu copia de seguridad (Exportar).</p>
        {pSortedPhotos.length > 0 && (
          <div className="ft-photos">
            {pSortedPhotos.map((ph) => (
              <div className="ft-photo" key={ph.id}>
                <img src={ph.dataUrl} alt={ph.date} />
                <span className="cap">{fmtDate(ph.date)}</span>
                <button className="ft-photo-del" onClick={() => delPhoto(ph.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ----------------------------- NUTRITION ----------------------------- */
function Nutrition({ nutrition, setNutrition, foods, recipes, goals, setTab }) {
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

  const addFromLib = () => { if (!sel || !grams) return; const c = scaleFood(sel, grams); setNutrition((p) => [...p, { id: uid(), date, name: sel.name, grams: Number(grams), kcal: round1(c.kcal), protein: round1(c.protein), carbs: round1(c.carbs), fat: round1(c.fat) }]); setSel(null); setGrams(""); };
  const addRecipe = () => { if (!selRec || !recPreview) return; setNutrition((p) => [...p, { id: uid(), date, name: `${selRec.name} (${servings} porc.)`, grams: null, kcal: round1(recPreview.kcal), protein: round1(recPreview.protein), carbs: round1(recPreview.carbs), fat: round1(recPreview.fat) }]); setRecId(""); setServings("1"); };
  const addManual = () => { if (!m.name.trim()) return; setNutrition((p) => [...p, { id: uid(), date, name: m.name.trim(), grams: null, kcal: +m.kcal || 0, protein: +m.protein || 0, carbs: +m.carbs || 0, fat: +m.fat || 0 }]); setM({ name: "", kcal: "", protein: "", carbs: "", fat: "" }); };
  const del = (id) => setNutrition((p) => p.filter((n) => n.id !== id));

  const kcalPct = goals.kcalTarget ? Math.round((sum.kcal / goals.kcalTarget) * 100) : 0;
  const protPct = goals.proteinTarget ? Math.round((sum.protein / goals.proteinTarget) * 100) : 0;

  return (
    <>
      <DateBar date={date} setDate={setDate} />
      <div className="ft-stats">
        <div className="ft-stat"><div className="k"><Flame size={13} /> Calorías</div><div className="v">{Math.round(sum.kcal)}<small>/{goals.kcalTarget}</small></div><div className="sub" style={{ color: kcalPct > 105 ? "var(--danger)" : "var(--ok)" }}>{kcalPct}% objetivo</div></div>
        <div className="ft-stat"><div className="k">Proteína</div><div className="v">{Math.round(sum.protein)}<small>/{goals.proteinTarget} g</small></div><div className="sub" style={{ color: protPct >= 90 ? "var(--ok)" : "var(--muted)" }}>{protPct}% objetivo</div></div>
        <div className="ft-stat"><div className="k">Carbos</div><div className="v">{Math.round(sum.carbs)}<small>g</small></div></div>
        <div className="ft-stat"><div className="k">Grasa</div><div className="v">{Math.round(sum.fat)}<small>g</small></div></div>
      </div>

      <div className="ft-card">
        <h2><Plus size={16} /> Añadir comida</h2>
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
            <div className="ft-field" style={{ maxWidth: 130 }}><label>Gramos</label><input className="ft-input ft-mono" type="number" inputMode="decimal" placeholder="0" value={grams} onChange={(e) => setGrams(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFromLib()} /></div>
            <button className="ft-btn" onClick={addFromLib} disabled={!sel || !grams}><Plus size={15} /> Añadir</button>
          </div>
          {computed && <div className="ft-prev"><span><b>{Math.round(computed.kcal)}</b> kcal</span><span>P <b>{round1(computed.protein)}</b></span><span>C <b>{round1(computed.carbs)}</b></span><span>G <b>{round1(computed.fat)}</b></span><span style={{ opacity: .7 }}>· {sel.name} · {grams} g</span></div>}
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
      </div>

      <div className="ft-card">
        <h2>Comidas del día</h2>
        {dayItems.length === 0 ? <div className="ft-empty">Sin registros este día.</div> : (
          <div className="ft-list">
            {dayItems.map((n) => (
              <div className="ft-li" key={n.id}>
                <span className="li-main">{n.name}{n.grams ? <span className="li-sub" style={{ marginLeft: 8 }}>{n.grams} g</span> : null}</span>
                <div className="ft-chips">{n.protein ? <span className="ft-chip">P {n.protein}</span> : null}{n.carbs ? <span className="ft-chip">C {n.carbs}</span> : null}{n.fat ? <span className="ft-chip">G {n.fat}</span> : null}</div>
                <span className="li-v" style={{ color: "var(--accent)" }}>{Math.round(n.kcal)} kcal</span>
                <button className="ft-trash" onClick={() => del(n.id)}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ----------------------------- LIBRARY (alimentos + catálogo + recetas) ----------------------------- */
function Library({ foods, setFoods, recipes, setRecipes }) {
  const [view, setView] = useState("mis");
  const [f, setF] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "" });
  const [editId, setEditId] = useState(null); const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("Todas"); const [catQ, setCatQ] = useState("");
  // recetas
  const [rName, setRName] = useState(""); const [rServings, setRServings] = useState("1");
  const [rItems, setRItems] = useState([]); const [rSel, setRSel] = useState(null); const [rGrams, setRGrams] = useState("");

  const existing = useMemo(() => new Set(foods.map((x) => x.name.toLowerCase())), [foods]);
  const save = () => {
    if (!f.name.trim()) return;
    const data = { name: f.name.trim(), kcal: +f.kcal || 0, protein: +f.protein || 0, carbs: +f.carbs || 0, fat: +f.fat || 0 };
    setFoods((p) => (editId ? p.map((x) => x.id === editId ? { ...x, ...data } : x) : [...p, { id: uid(), ...data }]).sort((a, b) => a.name.localeCompare(b.name)));
    setF({ name: "", kcal: "", protein: "", carbs: "", fat: "" }); setEditId(null);
  };
  const edit = (food) => { setView("mis"); setEditId(food.id); setF({ name: food.name, kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat }); };
  const del = (id) => { setFoods((p) => p.filter((x) => x.id !== id)); if (editId === id) setEditId(null); };
  const addCat = (item) => { if (existing.has(item.name.toLowerCase())) return; setFoods((p) => [...p, { id: uid(), ...item }].sort((a, b) => a.name.localeCompare(b.name))); };
  const addCategory = (cat) => { const add = CATALOG.filter((i) => i.cat === cat && !existing.has(i.name.toLowerCase())).map((i) => ({ id: uid(), name: i.name, kcal: i.kcal, protein: i.protein, carbs: i.carbs, fat: i.fat })); if (add.length) setFoods((p) => [...p, ...add].sort((a, b) => a.name.localeCompare(b.name))); };

  const myList = foods.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
  const catItems = CATALOG.filter((i) => (catFilter === "Todas" || i.cat === catFilter) && i.name.toLowerCase().includes(catQ.toLowerCase()));
  const catsToShow = catFilter === "Todas" ? CATALOG_CATS : [catFilter];

  // recetas
  const addRItem = () => { if (!rSel || !rGrams) return; const c = scaleFood(rSel, rGrams); setRItems((p) => [...p, { id: uid(), name: rSel.name, grams: Number(rGrams), kcal: round1(c.kcal), protein: round1(c.protein), carbs: round1(c.carbs), fat: round1(c.fat) }]); setRSel(null); setRGrams(""); };
  const delRItem = (id) => setRItems((p) => p.filter((x) => x.id !== id));
  const rTotal = rItems.reduce((t, i) => ({ kcal: t.kcal + i.kcal, protein: t.protein + i.protein, carbs: t.carbs + i.carbs, fat: t.fat + i.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const saveRecipe = () => { if (!rName.trim() || rItems.length === 0) return; setRecipes((p) => [...p, { id: uid(), name: rName.trim(), servings: Number(rServings) || 1, items: rItems }]); setRName(""); setRServings("1"); setRItems([]); };
  const delRecipe = (id) => setRecipes((p) => p.filter((r) => r.id !== id));

  return (
    <>
      <div className="ft-toggle">
        <button className={view === "mis" ? "on" : ""} onClick={() => setView("mis")}>Mis alimentos ({foods.length})</button>
        <button className={view === "catalogo" ? "on" : ""} onClick={() => setView("catalogo")}>Catálogo</button>
        <button className={view === "recetas" ? "on" : ""} onClick={() => setView("recetas")}>Recetas ({recipes.length})</button>
      </div>

      {view === "mis" && (<>
        <div className="ft-card">
          <h2><Plus size={16} /> {editId ? "Editar alimento" : "Añadir alimento"} <span className="tag">por 100 g</span></h2>
          <div className="ft-row" style={{ marginBottom: 10 }}><div className="ft-field" style={{ flex: 3, minWidth: 150 }}><label>Nombre</label><input className="ft-input" placeholder="Ej. Pechuga de pollo (cruda)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div></div>
          <div className="ft-row">
            <div className="ft-field"><label>Kcal/100g</label><input className="ft-input ft-mono" type="number" placeholder="0" value={f.kcal} onChange={(e) => setF({ ...f, kcal: e.target.value })} /></div>
            <div className="ft-field"><label>Prot/100g</label><input className="ft-input ft-mono" type="number" placeholder="0" value={f.protein} onChange={(e) => setF({ ...f, protein: e.target.value })} /></div>
            <div className="ft-field"><label>Carb/100g</label><input className="ft-input ft-mono" type="number" placeholder="0" value={f.carbs} onChange={(e) => setF({ ...f, carbs: e.target.value })} /></div>
            <div className="ft-field"><label>Grasa/100g</label><input className="ft-input ft-mono" type="number" placeholder="0" value={f.fat} onChange={(e) => setF({ ...f, fat: e.target.value })} onKeyDown={(e) => e.key === "Enter" && save()} /></div>
            <button className="ft-btn" onClick={save}>{editId ? <Check size={15} /> : <Plus size={15} />} {editId ? "Guardar" : "Añadir"}</button>
            {editId && <button className="ft-btn ghost" onClick={() => { setEditId(null); setF({ name: "", kcal: "", protein: "", carbs: "", fat: "" }); }}><X size={15} /></button>}
          </div>
        </div>
        <div className="ft-card">
          <h2><Apple size={16} /> Mis alimentos <span className="tag">{foods.length}</span></h2>
          {foods.length === 0 ? <div className="ft-empty">Aún no has guardado alimentos.<div style={{ marginTop: 12 }}><button className="ft-btn" onClick={() => setView("catalogo")}><Apple size={15} /> Cargar desde el catálogo</button></div></div> : (<>
            {foods.length > 6 && <input className="ft-input" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />}
            <div className="ft-list">{myList.map((x) => (<div className="ft-li" key={x.id}><span className="li-main">{x.name}</span><span className="li-sub">{x.kcal} kcal · P {x.protein} · C {x.carbs} · G {x.fat} <span style={{ opacity: .6 }}>/100g</span></span><button className="ft-trash" onClick={() => edit(x)}><Pencil size={15} /></button><button className="ft-trash" onClick={() => del(x.id)}><Trash2 size={15} /></button></div>))}</div>
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
              <div className="ft-list">{items.map((i) => { const added = existing.has(i.name.toLowerCase()); return (<div className="ft-li" key={i.name}><span className="li-main">{i.name}</span><span className="li-sub">{i.kcal} kcal · P {i.protein} · C {i.carbs} · G {i.fat}</span><button className={"ft-btn" + (added ? " ghost" : "")} style={{ padding: "7px 12px" }} onClick={() => addCat(i)} disabled={added}>{added ? <><Check size={14} /> Añadido</> : <Plus size={14} />}</button></div>); })}</div>
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
              <div className="ft-field" style={{ maxWidth: 120 }}><label>Gramos</label><input className="ft-input ft-mono" type="number" inputMode="decimal" placeholder="0" value={rGrams} onChange={(e) => setRGrams(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addRItem()} /></div>
              <button className="ft-btn ghost" onClick={addRItem} disabled={!rSel || !rGrams}><Plus size={15} /> Ingrediente</button>
            </div>
            {rItems.length > 0 && (<>
              <div className="ft-list" style={{ marginTop: 12 }}>
                {rItems.map((i) => (<div className="ft-li" key={i.id}><span className="li-main">{i.name}<span className="li-sub" style={{ marginLeft: 8 }}>{i.grams} g</span></span><span className="li-v" style={{ color: "var(--accent)" }}>{Math.round(i.kcal)} kcal</span><button className="ft-trash" onClick={() => delRItem(i.id)}><Trash2 size={15} /></button></div>))}
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
function Routines({ routines, setRoutines }) {
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

  return (
    <>
      <div className="ft-alert info"><ListChecks size={20} color="var(--blue)" /><div><div className="t">Plantillas de entrenamiento</div><div className="b">Define tus días (A / B / C, Push / Pull / Legs…) una vez. Después, en Entrenar las cargas con un toque: registrar pasa a ser editar, no escribir desde cero.</div></div></div>
      <div className="ft-card">
        <h2><Plus size={16} /> Nueva rutina</h2>
        <div className="ft-row" style={{ marginBottom: 12 }}><div className="ft-field" style={{ flex: 2 }}><label>Nombre</label><input className="ft-input" placeholder="Ej. Día A · Empuje" value={name} onChange={(e) => setName(e.target.value)} /></div></div>
        <div className="ft-row" style={{ marginBottom: 10 }}>
          <div className="ft-field" style={{ flex: 2, minWidth: 140 }}><label>Ejercicio</label><input className="ft-input" placeholder="Ej. Press banca" value={exName} onChange={(e) => setExName(e.target.value)} /></div>
          <div className="ft-field"><label>Plantilla</label><select className="ft-select" value="" onChange={(e) => applyPreset(e.target.value)}><option value="">Común…</option>{EXERCISE_PRESETS.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}</select></div>
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
        {routines.length === 0 ? <div className="ft-empty">Aún no has creado rutinas.</div> : (
          <div className="ft-list">{routines.map((r) => (<div className="ft-li" key={r.id}><span className="li-main">{r.name}</span><span className="li-sub">{r.exercises.map((e) => e.name).join(", ")}</span><button className="ft-trash" onClick={() => delRoutine(r.id)}><Trash2 size={15} /></button></div>))}</div>
        )}
      </div>
    </>
  );
}

/* ----------------------------- DASHBOARD ----------------------------- */
function Dashboard({ workouts, weights, nutrition, measurements, periods, goals }) {
  const sortedW = useMemo(() => [...weights].sort((a, b) => a.date.localeCompare(b.date)), [weights]);

  // moving average (7-day trailing)
  const maSeries = useMemo(() => sortedW.map((w) => {
    const start = new Date(w.date + "T00:00:00"); start.setDate(start.getDate() - 6);
    const win = sortedW.filter((x) => x.date <= w.date && new Date(x.date + "T00:00:00") >= start);
    return { iso: w.date, date: fmtDate(w.date), real: w.kg, media: round1(win.reduce((s, x) => s + x.kg, 0) / win.length) };
  }), [sortedW]);

  // weight chart with objetivo
  const weightChart = useMemo(() => {
    if (!maSeries.length) return [];
    const start = maSeries[0]; const startKg = goals.startWeight ? Number(goals.startWeight) : start.real;
    return maSeries.map((p) => ({ ...p, objetivo: Number((startKg + goals.weeklyChange * (daysBetween(start.iso, p.iso) / 7)).toFixed(2)) }));
  }, [maSeries, goals]);

  // smoothed weekly trend (last 14 days of MA)
  const trend = useMemo(() => {
    const recent = maSeries.filter((p) => daysBetween(p.iso, todayISO()) <= 21);
    const pts = (recent.length >= 2 ? recent : maSeries.slice(-6)).map((p) => ({ x: daysBetween(maSeries[0]?.iso || p.iso, p.iso), y: p.media }));
    const sp = slopePerDay(pts); return sp === null ? null : sp * 7;
  }, [maSeries]);

  const currentMA = maSeries.length ? maSeries[maSeries.length - 1].media : null;
  const currentW = sortedW.length ? sortedW[sortedW.length - 1].kg : null;
  const change7 = useMemo(() => { if (sortedW.length < 2) return null; const last = sortedW[sortedW.length - 1]; const ref = [...sortedW].reverse().find((w) => daysBetween(w.date, last.date) >= 7); return ref ? last.kg - ref.kg : null; }, [sortedW]);

  // per-exercise history
  const exHistory = useMemo(() => {
    const map = {};
    [...workouts].sort((a, b) => a.date.localeCompare(b.date)).forEach((w) => w.exercises.forEach((e) => {
      let best = 0, vol = 0; e.sets.forEach((s) => { const r = +s.reps || 0, kg = +s.kg || 0; if (r > 0 && kg > 0) { best = Math.max(best, epley(kg, r)); vol += r * kg; } });
      if (best > 0) (map[e.name] = map[e.name] || []).push({ iso: w.date, date: fmtDate(w.date), oneRM: Math.round(best), volume: Math.round(vol) });
    }));
    return map;
  }, [workouts]);
  const exNames = useMemo(() => Object.keys(exHistory).filter((n) => exHistory[n].length >= 2).sort(), [exHistory]);
  const [selEx, setSelEx] = useState("");
  useEffect(() => { if (!selEx && exNames.length) setSelEx(exNames[0]); }, [exNames]); // eslint-disable-line

  // PRs (current best per exercise + recent)
  const prs = useMemo(() => Object.entries(exHistory).map(([name, h]) => {
    const best = h.reduce((m, x) => x.oneRM > m.oneRM ? x : m, h[0]);
    const latest = h[h.length - 1];
    const isRecent = h.length >= 2 && best.iso === latest.iso && daysBetween(best.iso, todayISO()) <= 7;
    return { name, best: best.oneRM, date: best.iso, isRecent };
  }).sort((a, b) => b.best - a.best), [exHistory]);
  const recentPRs = prs.filter((p) => p.isRecent);

  // weekly muscle volume (last 7 days) with secondary factor
  const weeklyMuscle = useMemo(() => {
    const m = {}; const since = isoMinus(7);
    workouts.filter((w) => w.date >= since).forEach((w) => w.exercises.forEach((e) => {
      const v = e.sets.reduce((t, s) => t + (+s.reps || 0) * (+s.kg || 0), 0);
      m[e.primary || e.muscle] = (m[e.primary || e.muscle] || 0) + v;
      (e.secondary || []).forEach((sm) => { m[sm] = (m[sm] || 0) + v * SECONDARY_FACTOR; });
    }));
    return m;
  }, [workouts]);
  const muscleVolAll = useMemo(() => {
    const m = {};
    workouts.forEach((w) => w.exercises.forEach((e) => { const v = e.sets.reduce((t, s) => t + (+s.reps || 0) * (+s.kg || 0), 0); m[e.primary || e.muscle] = (m[e.primary || e.muscle] || 0) + v; (e.secondary || []).forEach((sm) => { m[sm] = (m[sm] || 0) + v * SECONDARY_FACTOR; }); }));
    return Object.entries(m).map(([muscle, vol]) => ({ muscle, vol: Math.round(vol) })).sort((a, b) => b.vol - a.vol);
  }, [workouts]);

  // calories chart + averages
  const kcalChart = useMemo(() => { const days = []; for (let i = 13; i >= 0; i--) { const iso = isoMinus(i); const kcal = nutrition.filter((n) => n.date === iso).reduce((t, n) => t + (+n.kcal || 0), 0); days.push({ date: fmtDate(iso), kcal: Math.round(kcal) }); } return days; }, [nutrition]);

  // maintenance calories from data
  const maintenance = useMemo(() => {
    const since = isoMinus(28);
    const byDay = {}; nutrition.filter((n) => n.date >= since).forEach((n) => { byDay[n.date] = (byDay[n.date] || 0) + (+n.kcal || 0); });
    const loggedDays = Object.values(byDay).filter((v) => v > 50);
    if (loggedDays.length < 10 || trend === null) return null;
    const avgKcal = loggedDays.reduce((s, v) => s + v, 0) / loggedDays.length;
    const maint = avgKcal - (trend / 7) * KCAL_PER_KG;
    return { maint: Math.round(maint), avgKcal: Math.round(avgKcal), days: loggedDays.length };
  }, [nutrition, trend]);

  // adherence
  const trainingDays7 = useMemo(() => new Set(workouts.filter((w) => w.date >= isoMinus(7) && (w.exercises.length || (w.cardio || []).length)).map((w) => w.date)).size, [workouts]);
  const lastTrain = useMemo(() => { const ds = workouts.filter((w) => w.exercises.length || (w.cardio || []).length).map((w) => w.date).sort(); return ds.length ? ds[ds.length - 1] : null; }, [workouts]);
  const nutDays7 = useMemo(() => new Set(nutrition.filter((n) => n.date >= isoMinus(7)).map((n) => n.date)).size, [nutrition]);

  // protein avg last 7 days (only logged days)
  const protAvg7 = useMemo(() => { const byDay = {}; nutrition.filter((n) => n.date >= isoMinus(7)).forEach((n) => { byDay[n.date] = (byDay[n.date] || 0) + (+n.protein || 0); }); const vals = Object.values(byDay); return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null; }, [nutrition]);

  // projection to goal weight
  const projection = useMemo(() => {
    if (!goals.targetWeight || currentMA === null || trend === null || Math.abs(trend) < 0.02) return null;
    const remaining = Number(goals.targetWeight) - currentMA;
    if (Math.sign(remaining) !== Math.sign(trend)) return { off: true };
    const weeks = remaining / trend; const d = new Date(); d.setDate(d.getDate() + Math.round(weeks * 7));
    return { weeks: Math.round(weeks), date: d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) };
  }, [goals, currentMA, trend]);

  // ALERTS
  const alerts = useMemo(() => {
    const a = [];
    recentPRs.forEach((p) => a.push({ type: "pr", title: `¡Nuevo récord en ${p.name}!`, body: `Tu 1RM estimado subió a ${p.best} kg. La sobrecarga progresiva está funcionando.` }));
    if (trend !== null) {
      const diff = trend - goals.weeklyChange;
      if (Math.abs(diff) > 0.25) a.push({ type: "warn", title: "Desvío en tu tendencia de peso", body: `Tendencia real (suavizada) ${trend > 0 ? "+" : ""}${trend.toFixed(2)} kg/sem vs objetivo ${goals.weeklyChange > 0 ? "+" : ""}${goals.weeklyChange.toFixed(2)}. ${diff > 0 ? "Vas más hacia arriba de lo previsto — recorta calorías." : "Bajas más rápido de lo previsto — sube calorías para proteger músculo."}${maintenance ? ` Tu mantenimiento estimado es ~${maintenance.maint} kcal.` : ""}` });
      else a.push({ type: "ok", title: "Peso en línea con tu objetivo", body: `Tendencia real ${trend > 0 ? "+" : ""}${trend.toFixed(2)} kg/sem, dentro de ±0,25 de tu meta.` });
    }
    if (protAvg7 !== null && goals.proteinTarget && protAvg7 < 0.85 * goals.proteinTarget) a.push({ type: "warn", title: "Proteína por debajo del objetivo", body: `Media de ${Math.round(protAvg7)} g/día en los días registrados de la última semana, frente a tu meta de ${goals.proteinTarget} g. Importante si buscas ganar o mantener músculo.` });
    // imbalance
    const vols = MAJOR_MUSCLES.map((m) => weeklyMuscle[m] || 0); const maxV = Math.max(...vols);
    if (maxV > 0) { const neglected = MAJOR_MUSCLES.filter((m) => (weeklyMuscle[m] || 0) < 0.15 * maxV); if (neglected.length) a.push({ type: "warn", title: "Posible descompensación muscular", body: `Esta semana apenas trabajaste: ${neglected.join(", ")}. Equilibrar el volumen reduce riesgo de lesión y mejora la estética.` }); }
    if (lastTrain && daysBetween(lastTrain, todayISO()) >= 4) a.push({ type: "info", title: "Racha de entreno en pausa", body: `Llevas ${daysBetween(lastTrain, todayISO())} días sin registrar entrenamiento. La consistencia es lo que más predice resultados.` });
    if (projection && projection.off) a.push({ type: "info", title: "No avanzas hacia tu peso meta", body: "A tu ritmo actual no te acercas a la meta fijada. Revisa objetivo o calorías." });
    return a;
  }, [recentPRs, trend, goals, maintenance, protAvg7, weeklyMuscle, lastTrain, projection]);

  const totalMin = workouts.reduce((t, w) => t + (w.durationMin || 0), 0);
  const timed = workouts.filter((w) => w.durationMin > 0).length;
  const avgMin = timed ? Math.round(totalMin / timed) : 0;
  const cyc = cycleInfo(periods);

  const noData = weights.length === 0 && workouts.length === 0 && nutrition.length === 0;
  if (noData) return <div className="ft-card"><div className="ft-empty"><div className="ic"><LayoutDashboard size={34} /></div>Aún no hay datos. Registra entrenamientos, peso o comidas y aquí verás tu evolución, récords y alertas.</div></div>;

  const exData = selEx ? exHistory[selEx] : null;

  return (
    <>
      {alerts.length > 0 && (
        <div className="ft-card">
          <h2><Bell size={16} /> Alertas y avisos <span className="tag">{alerts.length}</span></h2>
          {alerts.map((al, i) => (
            <div className={`ft-alert ${al.type}`} key={i} style={i === alerts.length - 1 ? { marginBottom: 0 } : {}}>
              {al.type === "warn" ? <AlertTriangle size={20} color="var(--danger)" /> : al.type === "pr" ? <Trophy size={20} color="var(--accent)" /> : al.type === "ok" ? <Check size={20} color="var(--ok)" /> : <Bell size={20} color="var(--blue)" />}
              <div><div className="t">{al.title}</div><div className="b">{al.body}</div></div>
            </div>
          ))}
        </div>
      )}

      <div className="ft-stats">
        <div className="ft-stat"><div className="k"><Scale size={13} /> Peso (media 7d)</div><div className="v">{currentMA !== null ? currentMA.toFixed(1) : "—"}<small>kg</small></div>{currentW !== null && <div className="sub">hoy {currentW.toFixed(1)} kg</div>}</div>
        <div className="ft-stat"><div className="k">Cambio 7 días</div><div className="v" style={{ color: change7 === null ? "var(--text)" : change7 <= 0 ? "var(--ok)" : "var(--danger)" }}>{change7 === null ? "—" : `${change7 > 0 ? "+" : ""}${change7.toFixed(1)}`}<small>kg</small></div><div className="sub">{change7 !== null && (change7 <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />)} tendencia real</div></div>
        <div className="ft-stat"><div className="k"><Flame size={13} /> Mantenimiento</div><div className="v">{maintenance ? maintenance.maint : "—"}<small>kcal</small></div><div className="sub">{maintenance ? `de ${maintenance.days} días de datos` : "necesito ~2 sem."}</div></div>
        <div className="ft-stat"><div className="k"><Clock size={13} /> Constancia</div><div className="v">{trainingDays7}<small>/sem</small></div><div className="sub">{nutDays7} días con dieta · {avgMin} min/sesión</div></div>
      </div>

      {projection && !projection.off && (
        <div className="ft-alert info"><Target size={20} color="var(--blue)" /><div><div className="t">Proyección a tu meta</div><div className="b">A tu ritmo actual llegarías a {goals.targetWeight} kg alrededor del <b style={{ color: "var(--text)" }}>{projection.date}</b> (~{Math.abs(projection.weeks)} semanas).</div></div></div>
      )}

      {cyc && (
        <div className="ft-alert" style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${CYCLE_PHASES[cyc.phase].color}55` }}>
          <Droplet size={20} color={CYCLE_PHASES[cyc.phase].color} />
          <div>
            <div className="t">Ciclo: fase {cyc.phase} · día {cyc.day}</div>
            <div className="b">{CYCLE_PHASES[cyc.phase].note} {cyc.daysToNext >= 0 ? `Próximo periodo estimado en ~${cyc.daysToNext} días.` : `Periodo con ~${Math.abs(cyc.daysToNext)} días de retraso.`} Cruza esta fase con tu energía y tus 1RM para descubrir tu patrón personal.</div>
          </div>
        </div>
      )}

      {weightChart.length >= 2 && (
        <div className="ft-card">
          <h2>Peso: real · media 7d · objetivo <span className="tag">kg</span></h2>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={weightChart} margin={{ top: 5, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#262b2d" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#878d86" tick={{ fill: "#878d86" }} /><YAxis stroke="#878d86" tick={{ fill: "#878d86" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#1b1f22", border: "1px solid #262b2d", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono'" }} />
              <Line type="monotone" dataKey="real" stroke="#3a4042" strokeWidth={1} dot={{ r: 2, fill: "#3a4042" }} name="Real" />
              <Line type="monotone" dataKey="objetivo" stroke="#5ad1ff" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Objetivo" />
              <Line type="monotone" dataKey="media" stroke="#c5f82a" strokeWidth={2.8} dot={false} name="Media 7d" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {exNames.length > 0 && (
        <div className="ft-card">
          <h2><TrendingUp size={16} /> Progresión por ejercicio</h2>
          <div className="ft-row" style={{ marginBottom: 12 }}>
            <div className="ft-field" style={{ maxWidth: 320 }}><label>Ejercicio</label><select className="ft-select" value={selEx} onChange={(e) => setSelEx(e.target.value)}>{exNames.map((n) => <option key={n}>{n}</option>)}</select></div>
          </div>
          {exData && (
            <ResponsiveContainer width="100%" height={230}>
              <ComposedChart data={exData} margin={{ top: 5, right: 14, left: -14, bottom: 0 }}>
                <CartesianGrid stroke="#262b2d" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#878d86" tick={{ fill: "#878d86" }} />
                <YAxis yAxisId="l" stroke="#878d86" tick={{ fill: "#878d86" }} /><YAxis yAxisId="r" orientation="right" stroke="#5ad1ff" tick={{ fill: "#5ad1ff" }} />
                <Tooltip contentStyle={{ background: "#1b1f22", border: "1px solid #262b2d", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono'" }} />
                <Bar yAxisId="r" dataKey="volume" fill="rgba(90,209,255,.25)" name="Volumen (kg)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="l" type="monotone" dataKey="oneRM" stroke="#c5f82a" strokeWidth={2.8} dot={{ r: 3, fill: "#c5f82a" }} name="1RM est. (kg)" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {prs.length > 0 && (
        <div className="ft-card">
          <h2><Trophy size={16} /> Récords personales <span className="tag">1RM estimado</span></h2>
          <div className="ft-list">
            {prs.slice(0, 10).map((p) => (
              <div className="ft-li" key={p.name}><span className="li-main">{p.name} {p.isRecent && <Zap size={14} color="var(--accent)" style={{ verticalAlign: "middle" }} />}</span><span className="li-d">{fmtDate(p.date)}</span><span className="li-v" style={{ color: "var(--accent)" }}>{p.best} kg</span></div>
            ))}
          </div>
        </div>
      )}

      {muscleVolAll.length > 0 && (
        <div className="ft-card">
          <h2>Volumen por grupo muscular <span className="tag">histórico · sec. {SECONDARY_FACTOR * 100}%</span></h2>
          <ResponsiveContainer width="100%" height={Math.max(180, muscleVolAll.length * 34)}>
            <BarChart data={muscleVolAll} layout="vertical" margin={{ top: 5, right: 14, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="#262b2d" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="#878d86" tick={{ fill: "#878d86" }} /><YAxis type="category" dataKey="muscle" stroke="#878d86" tick={{ fill: "#c9cdc4" }} width={78} />
              <Tooltip contentStyle={{ background: "#1b1f22", border: "1px solid #262b2d", borderRadius: 8 }} cursor={{ fill: "rgba(255,255,255,.04)" }} />
              <Bar dataKey="vol" radius={[0, 5, 5, 0]} name="Volumen">{muscleVolAll.map((m) => <Cell key={m.muscle} fill={MUSCLE_COLOR[m.muscle] || "#888"} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {kcalChart.some((d) => d.kcal > 0) && (
        <div className="ft-card">
          <h2>Calorías últimos 14 días <span className="tag">vs objetivo / mantenimiento</span></h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={kcalChart} margin={{ top: 5, right: 14, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#262b2d" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#878d86" tick={{ fill: "#878d86", fontSize: 10 }} /><YAxis stroke="#878d86" tick={{ fill: "#878d86" }} />
              <Tooltip contentStyle={{ background: "#1b1f22", border: "1px solid #262b2d", borderRadius: 8 }} cursor={{ fill: "rgba(255,255,255,.04)" }} />
              {goals.kcalTarget ? <ReferenceLine y={Number(goals.kcalTarget)} stroke="#5ad1ff" strokeDasharray="5 4" label={{ value: "objetivo", fill: "#5ad1ff", fontSize: 11, position: "insideTopRight" }} /> : null}
              {maintenance ? <ReferenceLine y={maintenance.maint} stroke="#ff8a3d" strokeDasharray="5 4" label={{ value: "mantenimiento", fill: "#ff8a3d", fontSize: 11, position: "insideBottomRight" }} /> : null}
              <Bar dataKey="kcal" fill="#ff8a3d" radius={[5, 5, 0, 0]} name="kcal" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

/* ----------------------------- AJUSTES / GOALS ----------------------------- */
function Goals({ goals, setGoals, weights, exportData, userEmail, signOut }) {
  const upd = (k, v) => setGoals((g) => ({ ...g, [k]: v }));
  const latestW = weights.length ? [...weights].sort((a, b) => a.date.localeCompare(b.date)).slice(-1)[0].kg : null;
  const refW = Number(goals.startWeight) || latestW || null;
  const start = Number(goals.startWeight) || latestW;
  const target = Number(goals.targetWeight);
  const dir = (start && target) ? (target < start ? "perder grasa" : target > start ? "ganar músculo" : "mantener") : null;
  const factor = (ACTIVITY.find((a) => a.key === goals.activity) || ACTIVITY[2]).factor;

  const suggestion = useMemo(() => {
    if (!refW) return null;
    const maintenance = refW * factor;
    const kcal = Math.round((maintenance + (Number(goals.weeklyChange) * KCAL_PER_KG) / 7) / 10) * 10;
    const proteinPerKg = dir === "perder grasa" ? 2.2 : dir === "ganar músculo" ? 2.0 : 1.8;
    const protein = Math.round(proteinPerKg * refW);
    return { maintenance: Math.round(maintenance), kcal, protein, proteinPerKg };
  }, [refW, factor, goals.weeklyChange, dir]);

  // auto-aplicar cuando está activado y cambian los inputs
  useEffect(() => {
    if (goals.autoMacros && suggestion) {
      if (Number(goals.kcalTarget) !== suggestion.kcal || Number(goals.proteinTarget) !== suggestion.protein)
        setGoals((g) => ({ ...g, kcalTarget: suggestion.kcal, proteinTarget: suggestion.protein }));
    }
  }, [goals.autoMacros, suggestion]); // eslint-disable-line

  return (
    <>
      <div className="ft-card">
        <h2><Target size={16} /> Objetivos de peso</h2>
        <div className="ft-row" style={{ marginBottom: 12 }}>
          <div className="ft-field"><label>Peso inicial (kg)</label><input className="ft-input ft-mono" type="number" step="0.1" placeholder={latestW ? `${latestW} (último)` : "auto"} value={goals.startWeight} onChange={(e) => upd("startWeight", e.target.value)} /></div>
          <div className="ft-field"><label>Peso meta (kg)</label><input className="ft-input ft-mono" type="number" step="0.1" placeholder="0.0" value={goals.targetWeight} onChange={(e) => upd("targetWeight", e.target.value)} /></div>
        </div>
        <div className="ft-field" style={{ marginBottom: 12 }}><label>Ritmo objetivo: {goals.weeklyChange > 0 ? "+" : ""}{Number(goals.weeklyChange).toFixed(2)} kg/semana{goals.weeklyChange < 0 ? " (déficit)" : goals.weeklyChange > 0 ? " (volumen)" : " (mantenimiento)"}</label>
          <input type="range" min="-1" max="1" step="0.05" value={goals.weeklyChange} onChange={(e) => upd("weeklyChange", Number(e.target.value))} style={{ accentColor: "#c5f82a", width: "100%" }} /></div>
        {dir && <div className="ft-prev" style={{ marginTop: 0 }}><span>Objetivo detectado:</span><b style={{ color: dir === "perder grasa" ? "var(--blue)" : dir === "ganar músculo" ? "var(--accent)" : "var(--text)" }}>{dir}</b></div>}
      </div>

      <div className="ft-card">
        <h2><Flame size={16} /> Objetivos de nutrición</h2>
        <div className="ft-row" style={{ marginBottom: 12 }}>
          <div className="ft-field"><label>Nivel de actividad</label><select className="ft-select" value={goals.activity} onChange={(e) => upd("activity", e.target.value)}>{ACTIVITY.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}</select></div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", marginBottom: 14, fontSize: 14 }}>
          <input type="checkbox" checked={goals.autoMacros} onChange={(e) => upd("autoMacros", e.target.checked)} style={{ accentColor: "#c5f82a", width: 18, height: 18 }} />
          Calcular calorías y proteína automáticamente desde mi objetivo
        </label>
        {goals.autoMacros && suggestion && (
          <div className="ft-prev" style={{ marginTop: 0, marginBottom: 14 }}>
            <span>Mantenimiento est. <b>{suggestion.maintenance}</b> kcal</span>
            <span>→ objetivo <b>{suggestion.kcal}</b> kcal</span>
            <span>· proteína <b>{suggestion.protein}</b> g ({suggestion.proteinPerKg} g/kg)</span>
          </div>
        )}
        <div className="ft-row">
          <div className="ft-field"><label>Calorías diarias</label><input className="ft-input ft-mono" type="number" placeholder="2200" value={goals.kcalTarget} disabled={goals.autoMacros} onChange={(e) => upd("kcalTarget", e.target.value)} /></div>
          <div className="ft-field"><label>Proteína diaria (g)</label><input className="ft-input ft-mono" type="number" placeholder="150" value={goals.proteinTarget} disabled={goals.autoMacros} onChange={(e) => upd("proteinTarget", e.target.value)} /></div>
        </div>
        {goals.autoMacros && !refW && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>Introduce tu peso inicial (o registra un peso en Cuerpo) para poder calcular.</div>}
      </div>

      <div className="ft-card">
        <h2><Lock size={16} /> Cuenta</h2>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 0 }}>
          Sesión activa: <strong style={{ color: "var(--text)" }}>{userEmail}</strong>
        </p>
        <button className="ft-btn ghost" onClick={signOut}><X size={15} /> Cerrar sesión</button>
      </div>

      <div className="ft-card">
        <h2><Download size={16} /> Copia de seguridad</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 0 }}>Tus datos (incluidas las fotos) viven solo en esta app. Exporta un JSON cada cierto tiempo; puedes reimportarlo desde la cabecera.</p>
        <button className="ft-btn" onClick={exportData}><Download size={15} /> Exportar copia ahora</button>
      </div>

      <div className="ft-alert ok"><Check size={20} color="var(--ok)" /><div><div className="t">Cómo se calculan tus macros y avisos</div><div className="b">El cálculo automático estima tu mantenimiento como peso × factor de actividad, le resta/suma el equivalente a tu ritmo objetivo (7700 kcal ≈ 1 kg), y fija más proteína en déficit (2,2 g/kg) que en volumen (2,0 g/kg). Es un punto de partida: el dashboard ajusta tu mantenimiento real con tus datos en ~2 semanas, y ahí puedes afinar.</div></div></div>
    </>
  );
}
