// ============================================================================
// FitTrack — Configuración Fase 1 (readaptación + déficit 61→58 kg)
// ----------------------------------------------------------------------------
// Módulo de datos y funciones puras. No depende de React ni de storage,
// así que puedes importarlo desde cualquier tab (Ajustes, Nutrición, Rutinas).
//
// Identificadores en inglés (consistente con el estilo de código);
// textos visibles en español (consistente con la UI).
// ============================================================================


// ============================================================================
// 1. PROTEÍNA
// ----------------------------------------------------------------------------
// Base científica (déficit + entrenamiento de fuerza):
//   - Rango general: 1.6–2.2 g/kg de peso corporal.
//   - En déficit conviene el extremo alto para retener masa magra.
//   - Default elegido: 2.0 g/kg.
// El cálculo es dinámico: si el peso baja, el objetivo se recalcula solo.
// ============================================================================

export const PROTEIN_CONFIG = {
  gPerKg: 2.0,
  minGPerKg: 1.6,
  maxGPerKg: 2.4,

  mealsPerDay: 4, // o 5

  // Distribución NO uniforme (apetito matutino bajo). Cada array suma 1.0.
  distribution: {
    4: [0.15, 0.32, 0.30, 0.23], // desayuno, almuerzo, merienda/snack, cena
    5: [0.13, 0.27, 0.18, 0.27, 0.15],
  },

  mealLabels: {
    4: ["Desayuno", "Almuerzo", "Merienda", "Cena"],
    5: ["Desayuno", "Media mañana", "Almuerzo", "Merienda", "Cena"],
  },
};

/**
 * Calcula el objetivo diario de proteína a partir del peso actual.
 * @param {number} weightKg  Peso corporal actual (kg).
 * @param {object} [cfg]     Override parcial de PROTEIN_CONFIG.
 * @returns {{ gPerKg:number, weightKg:number, dailyTarget:number,
 *             lowEnd:number, highEnd:number }}
 */
export function computeProteinTargets(weightKg, cfg = {}) {
  const minG = cfg.minGPerKg ?? PROTEIN_CONFIG.minGPerKg;
  const maxG = cfg.maxGPerKg ?? PROTEIN_CONFIG.maxGPerKg;
  const gPerKg = clamp(cfg.gPerKg ?? PROTEIN_CONFIG.gPerKg, minG, maxG);
  const w = Number(weightKg) || 0;
  return {
    gPerKg,
    weightKg: w,
    dailyTarget: Math.round(w * gPerKg),
    lowEnd: Math.round(w * minG),
    highEnd: Math.round(w * maxG),
  };
}

/**
 * Reparte el objetivo diario entre las comidas según la distribución.
 * @param {number} dailyTarget  Gramos totales del día.
 * @param {number} [meals=4]    4 o 5.
 * @param {object} [cfg]        Override de distribución/labels.
 * @returns {Array<{ label:string, grams:number, pct:number }>}
 */
export function distributeProtein(dailyTarget, meals = PROTEIN_CONFIG.mealsPerDay, cfg = {}) {
  const dist = (cfg.distribution ?? PROTEIN_CONFIG.distribution)[meals];
  const labels = (cfg.mealLabels ?? PROTEIN_CONFIG.mealLabels)[meals];
  if (!dist) return [];
  return dist.map((pct, i) => ({
    label: labels?.[i] ?? `Comida ${i + 1}`,
    grams: Math.round(dailyTarget * pct),
    pct,
  }));
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, Number(n) || lo));
}


// ============================================================================
// 2. CALENTAMIENTO (obligatorio antes de cualquier sesión de fuerza)
// ============================================================================

export const WARMUP = {
  id: "warmup-fase1",
  name: "Calentamiento — 10 min",
  durationMin: 10,
  mandatory: true,
  exercises: [
    { name: "Respiración 90/90 en piso", dose: "5 respiraciones lentas" },
    { name: "Cat-cow", dose: "8 repeticiones" },
    { name: "Bird dog", dose: "6 por lado" },
    { name: "Puente de glúteo en piso", dose: "12 repeticiones" },
    { name: "Abducción con minibanda", dose: "12 por lado" },
    { name: "Bisagra de cadera sin peso", dose: "10 repeticiones" },
    { name: "Sentadilla lenta sin peso", dose: "8 repeticiones" },
  ],
  note: "Si hay rigidez notable, repetir bird dog y bisagra una segunda vez.",
};


// ============================================================================
// 3. PLANTILLAS DE RUTINA (seleccionables, NO obligatorias por día)
// ----------------------------------------------------------------------------
// `suggestedDay` es SOLO una pista (lunes=1 … domingo=0). No restringe.
// Esquema de ejercicio:
//   { name, sets, reps, rpe, restSec, notes?, isOptional?, alternatives? }
// ============================================================================

export const ROUTINE_TEMPLATES = [
  // ---------------------------------------------------------------- Fuerza A
  {
    id: "fuerza-a",
    name: "Fuerza A — Sentadilla + empuje + espalda",
    focus: "Cuerpo completo (moderada)",
    suggestedDay: 2,        // pista: martes
    mandatory: false,
    intensity: "Moderada",
    estimatedMin: 50,
    warmupId: "warmup-fase1",
    exercises: [
      { name: "Sentadilla goblet (mancuerna o disco)", sets: 3, reps: "8–10", rpe: "6–7", restSec: 90 },
      { name: "Press de pecho con mancuernas (banco plano)", sets: 3, reps: "8–10", rpe: "6–7", restSec: 90 },
      { name: "Remo en TRX", sets: 3, reps: "8–12", rpe: "6–7", restSec: 90 },
      { name: "Step-up bajo en escalera", sets: 2, reps: "8 por pierna", rpe: "6", restSec: 60,
        notes: "Escalón bajo y controlado, sin buscar altura.",
        alternatives: ["Puente de glúteo en piso con disco (2×12) si molesta la cadera"] },
      { name: "Press militar sentado con mancuernas", sets: 2, reps: "8–10", rpe: "6", restSec: 60 },
      { name: "Plancha frontal", sets: 3, reps: "20–35 s", rpe: "6–7", restSec: 45 },
      { name: "Estiramiento flexor de cadera + espalda alta", sets: 1, reps: "2 min", rpe: "—", restSec: 0 },
    ],
    minimalVersion: {
      durationMin: "18–22",
      exercises: [
        { name: "Sentadilla goblet", sets: 2, reps: "10" },
        { name: "Press de pecho", sets: 2, reps: "10" },
        { name: "Remo TRX", sets: 2, reps: "10" },
        { name: "Plancha", sets: 2, reps: "25 s" },
      ],
    },
  },

  // ---------------------------------------------------------------- Fuerza B
  {
    id: "fuerza-b",
    name: "Fuerza B — Bisagra + espalda + estabilidad",
    focus: "Cadena posterior (moderada)",
    suggestedDay: 4,        // pista: jueves
    mandatory: false,
    intensity: "Moderada",
    estimatedMin: 50,
    warmupId: "warmup-fase1",
    exercises: [
      { name: "Peso muerto rumano (mancuernas o barra ligera)", sets: 3, reps: "8", rpe: "6", restSec: 90,
        notes: "Bajar solo hasta mantener columna neutra; no hace falta tocar el piso. Si se siente más en lumbar que en isquios/glúteo, reducir carga o rango." },
      { name: "Jalón en polea o remo TRX más vertical", sets: 3, reps: "10–12", rpe: "6–7", restSec: 90 },
      { name: "Press inclinado con mancuernas", sets: 3, reps: "8–10", rpe: "6–7", restSec: 90 },
      { name: "Curl femoral con toalla", sets: 2, reps: "10–12", rpe: "6", restSec: 60,
        alternatives: ["Puente de glúteo (2×12)"] },
      { name: "Face pull con banda o polea", sets: 2, reps: "12–15", rpe: "6", restSec: 60 },
      { name: "Bird dog lento", sets: 3, reps: "6 por lado", rpe: "6", restSec: 45 },
      { name: "Rotación torácica en piso", sets: 1, reps: "8 por lado", rpe: "—", restSec: 0 },
    ],
    minimalVersion: {
      durationMin: "18–22",
      exercises: [
        { name: "Peso muerto rumano", sets: 2, reps: "8" },
        { name: "Jalón o remo TRX", sets: 2, reps: "10" },
        { name: "Press inclinado", sets: 2, reps: "10" },
        { name: "Bird dog", sets: 2, reps: "6 por lado" },
      ],
    },
  },

  // ---------------------------------------------------------------- Fuerza C
  {
    id: "fuerza-c",
    name: "Fuerza C — Sesión principal",
    focus: "Cuerpo completo (principal)",
    suggestedDay: 6,        // pista: sábado
    mandatory: false,
    intensity: "Principal",
    estimatedMin: 55,
    warmupId: "warmup-fase1",
    exercises: [
      { name: "Sentadilla con barra ligera o goblet pesada", sets: 4, reps: "6–8", rpe: "6–7", restSec: 90,
        notes: "Si hay cansancio fuerte o SPM intenso, cambiar por goblet squat.",
        alternatives: ["Goblet squat (4×8)"] },
      { name: "Press de pecho con mancuernas o barra", sets: 3, reps: "8", rpe: "7", restSec: 90 },
      { name: "Remo en polea/TRX o con mancuerna apoyada", sets: 3, reps: "8–10", rpe: "6–7", restSec: 90 },
      { name: "Hip thrust", sets: 3, reps: "10–12", rpe: "7", restSec: 60, isOptional: true,
        notes: "Solo si el banco se siente estable y la posición no genera molestias.",
        alternatives: ["Puente de glúteo con disco (3×12)"] },
      { name: "Elevaciones laterales con mancuernas", sets: 2, reps: "12–15", rpe: "6–7", restSec: 60 },
      { name: "Curl bíceps + extensión tríceps (polea o banda)", sets: 2, reps: "10–12 c/u", rpe: "6–7", restSec: 60 },
      { name: "Plancha lateral (rodilla apoyada o completa)", sets: 2, reps: "20–30 s por lado", rpe: "6", restSec: 45 },
    ],
    minimalVersion: {
      durationMin: "20–24",
      exercises: [
        { name: "Sentadilla", sets: 2, reps: "8" },
        { name: "Press pecho", sets: 2, reps: "8" },
        { name: "Remo", sets: 2, reps: "10" },
        { name: "Puente de glúteo", sets: 2, reps: "12" },
      ],
    },
  },

  // ----------------------------------------------------------- Domingo amable
  {
    id: "amable",
    name: "Sesión amable — Movilidad, técnica y gasto suave",
    focus: "Recuperación activa",
    suggestedDay: 0,        // pista: domingo
    mandatory: false,
    intensity: "Amable",
    estimatedMin: 30,
    warmupId: null,         // esta sesión ES la movilidad; no requiere otro calentamiento
    exercises: [
      { name: "Cat-cow + rotación torácica", sets: 1, reps: "8 + 8 por lado", rpe: "—", restSec: 30 },
      { name: "Caminata lateral con minibanda", sets: 2, reps: "12 por lado", rpe: "—", restSec: 30 },
      { name: "Bisagra con palo/barra vacía", sets: 2, reps: "10", rpe: "—", restSec: 30 },
      { name: "Sentadilla lenta sin peso o disco liviano", sets: 2, reps: "10", rpe: "—", restSec: 30 },
      { name: "Remo suave en TRX", sets: 2, reps: "12", rpe: "5", restSec: 30 },
      { name: "Bird dog", sets: 2, reps: "6 por lado", rpe: "—", restSec: 30 },
      { name: "Cardio suave opcional (bici suave o escaleras controladas)", sets: 1, reps: "10–15 min", rpe: "—", restSec: 0, isOptional: true },
    ],
    minimalVersion: null,   // ya es la versión amable
    note: 'Debe terminar con sensación de "podría hacer más".',
  },
];


// ============================================================================
// 4. HELPERS DE SELECCIÓN
// ============================================================================

/** Devuelve SIEMPRE todas las rutinas para poblar el selector. */
export function getAllRoutines() {
  return ROUTINE_TEMPLATES;
}

/** Busca una rutina por id. */
export function getRoutineById(id) {
  return ROUTINE_TEMPLATES.find((r) => r.id === id) ?? null;
}

/**
 * Sugiere (sin imponer) una rutina para una fecha dada.
 * @param {Date} [date=new Date()]
 */
export function suggestRoutineForDay(date = new Date()) {
  const dow = date.getDay(); // 0=domingo … 6=sábado
  const suggested = ROUTINE_TEMPLATES.find((r) => r.suggestedDay === dow) ?? null;
  return { suggested, all: ROUTINE_TEMPLATES };
}


// ============================================================================
// 5. MAPEO A LA APP
// ----------------------------------------------------------------------------
// Convierte una plantilla al formato de rutina que usa FitTrack
// ({ id, name, exercises:[{ name, primary, secondary, targetSets, targetReps,
// targetRpe, restSec, notes, isOptional }] }). Infiere el músculo primario
// desde el nombre del ejercicio.
// ============================================================================

const MUSCLE_KEYWORDS = [
  [/aducci[oó]n|aductor|sumo/i, "Aductores"],
  [/sentadilla|goblet|step-?up|prensa|zancad|cu[aá]driceps/i, "Cuádriceps"],
  [/peso muerto|rumano|bisagra|isquio|femoral/i, "Femoral"],
  [/hip thrust|puente|gl[uú]teo|abducci[oó]n|caminata lateral/i, "Glúteos"],
  [/press de pecho|press inclinado|press banca|pecho/i, "Pecho"],
  [/press militar|elevaciones laterales|face pull|hombro/i, "Hombros"],
  [/remo|jal[oó]n|dominad|espalda|bird dog/i, "Espalda"],
  [/curl b[ií]ceps|b[ií]ceps/i, "Bíceps"],
  [/tr[ií]ceps|fondos|extensi[oó]n tr/i, "Tríceps"],
  [/plancha|cat-?cow|rotaci[oó]n|respiraci[oó]n|core|abdom/i, "Core"],
  [/curl/i, "Bíceps"],
];

export function guessPrimaryMuscle(name) {
  for (const [re, muscle] of MUSCLE_KEYWORDS) if (re.test(name)) return muscle;
  return "Core";
}

// Patrones de rodilla (sentadilla/valgo) y cadera-lumbar (bisagra, hip thrust) bajo
// carga axial — los que más se benefician de cuidar técnica/rango en fases de mayor
// laxitud articular (ovulatoria/ventana fértil probable).
const JOINT_LAXITY_RISK = /sentadilla|goblet|step-?up|prensa|zancad|peso muerto|rumano|bisagra|hip thrust/i;

export function isJointLaxityRisk(name) {
  return JOINT_LAXITY_RISK.test(name);
}

/**
 * Convierte una plantilla al formato de rutina de la app.
 * @param {object} tpl   Plantilla de ROUTINE_TEMPLATES.
 * @param {() => string} uid  Generador de id de la app.
 */
export function templateToAppRoutine(tpl, uid) {
  const mapEx = (e) => ({
    id: uid(),
    name: e.name,
    primary: guessPrimaryMuscle(e.name),
    secondary: [],
    targetSets: typeof e.sets === "number" ? e.sets : 3,
    targetReps: String(e.reps ?? ""),
    targetRpe: e.rpe && e.rpe !== "—" ? String(e.rpe) : "",
    restSec: e.restSec ?? null,
    notes: e.notes || "",
    isOptional: !!e.isOptional,
  });
  return {
    id: uid(),
    name: tpl.name,
    templateId: tpl.id,
    focus: tpl.focus,
    suggestedDay: tpl.suggestedDay,
    intensity: tpl.intensity,
    estimatedMin: tpl.estimatedMin,
    hasWarmup: !!tpl.warmupId,
    exercises: tpl.exercises.map(mapEx),
    minimal: tpl.minimalVersion
      ? {
          durationMin: tpl.minimalVersion.durationMin || null,
          exercises: tpl.minimalVersion.exercises.map(mapEx),
        }
      : null,
  };
}
