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
// Split real de la usuaria (derivado de su historial de entrenamientos, no de
// un programa genérico): Empuje / Tracción / Pierna-cadera / Pierna-cuádriceps
// + un día accesorio opcional de core y brazos. `suggestedDay` es SOLO una
// pista (lunes=1 … domingo=0). No restringe.
// Esquema de ejercicio:
//   { name, sets, reps, rpe, restSec, notes?, isOptional?, alternatives? }
// Techo de RPE ~7 en esta fase (readaptación + déficit): las series de tope no
// deberían superar RPE 7 aunque el historial muestre sesiones a RPE 9–10.
// ============================================================================

export const ROUTINE_TEMPLATES = [
  // ---------------------------------------------------------------- Empuje
  {
    id: "empuje",
    name: "Empuje — Press horizontal/inclinado + hombro",
    focus: "Empuje (pecho, hombro, tríceps)",
    suggestedDay: 2,        // pista: martes
    mandatory: false,
    intensity: "Moderada",
    estimatedMin: 45,
    warmupId: "warmup-fase1",
    exercises: [
      { name: "Press inclinado con mancuernas", sets: 3, reps: "8–10", rpe: "6–7", restSec: 90,
        notes: "Series de acercamiento antes del peso de trabajo; la última serie no debería superar RPE 7 en esta fase.",
        alternatives: ["Press banca con mancuernas o barra ligera (alternar semana a semana en vez de hacer ambos el mismo día)"] },
      { name: "Press militar sentado con mancuernas", sets: 3, reps: "8–10", rpe: "6–7", restSec: 90 },
      { name: "Elevaciones laterales con mancuernas", sets: 3, reps: "12–15", rpe: "6–7", restSec: 60 },
      { name: "Pájaros (deltoide posterior) con mancuernas", sets: 2, reps: "12–15", rpe: "6–7", restSec: 60 },
    ],
    minimalVersion: {
      durationMin: "18–20",
      exercises: [
        { name: "Press inclinado", sets: 2, reps: "10" },
        { name: "Press militar", sets: 2, reps: "10" },
        { name: "Elevaciones laterales", sets: 2, reps: "12" },
      ],
    },
  },

  // ---------------------------------------------------------------- Tracción
  {
    id: "traccion",
    name: "Tracción — Dominadas, remo y bíceps",
    focus: "Tracción (espalda, bíceps)",
    suggestedDay: 4,        // pista: jueves
    mandatory: false,
    intensity: "Moderada",
    estimatedMin: 45,
    warmupId: "warmup-fase1",
    exercises: [
      { name: "Dominadas (con lastre solo si podés dejar reserva)", sets: 3, reps: "5–6", rpe: "6–7", restSec: 120,
        notes: "Si las últimas series terminan en RPE 9–10 con muy pocas repeticiones, es señal de bajar el lastre en la próxima sesión: el objetivo es dejar 2–3 repeticiones en reserva, no llegar al fallo. Subir peso o reps solo después de 2 sesiones seguidas cerrando cómoda en RPE 6–7.",
        alternatives: ["Jalón al pecho en polea (misma pauta de RPE) si el hombro se siente inestable colgando lastre"] },
      { name: "Remo (polea, TRX o mancuerna apoyada)", sets: 3, reps: "8–10", rpe: "6–7", restSec: 90 },
      { name: "Jalón al pecho en polea", sets: 2, reps: "10–12", rpe: "6–7", restSec: 75 },
      { name: "Curl bíceps con mancuernas", sets: 2, reps: "10–12", rpe: "6–7", restSec: 60 },
    ],
    minimalVersion: {
      durationMin: "18–20",
      exercises: [
        { name: "Remo", sets: 2, reps: "10" },
        { name: "Jalón al pecho", sets: 2, reps: "10" },
        { name: "Curl bíceps", sets: 2, reps: "10" },
      ],
    },
  },

  // ---------------------------------------------------------- Pierna (cadera)
  {
    id: "pierna-cadera",
    name: "Pierna — Cadera, glúteo e isquios",
    focus: "Pierna (cadena posterior)",
    suggestedDay: 1,        // pista: lunes
    mandatory: false,
    intensity: "Moderada",
    estimatedMin: 50,
    warmupId: "warmup-fase1",
    exercises: [
      { name: "Peso muerto rumano (mancuernas o barra ligera)", sets: 3, reps: "8–10", rpe: "6–7", restSec: 90,
        notes: "Mantené la rampa que ya usás: 1–2 series de acercamiento livianas antes del peso de trabajo. La serie más pesada no debería superar RPE 7 en esta fase.",
        alternatives: ["Bisagra de cadera sin peso o con banda (3×12) si aparece molestia lumbar al bajar"] },
      { name: "Step-up (escalón bajo o mediano)", sets: 3, reps: "8–10 por pierna", rpe: "6–7", restSec: 75,
        notes: "Subí la altura del escalón solo después de 2 sesiones seguidas en RPE 6–7 con la altura actual.",
        alternatives: ["Hip thrust (3×10–12) si la rodilla de apoyo molesta al subir con carga"] },
      { name: "Sentadilla búlgara o sumo (alternar)", sets: 3, reps: "8–10 por lado / 10", rpe: "6–7", restSec: 75,
        alternatives: ["Puente de glúteo con disco (3×12) si hay molestia de rodilla en la variante cargada"] },
      { name: "Rueda abdominal", sets: 2, reps: "8–12", rpe: "6–7", restSec: 45, isOptional: true,
        alternatives: ["Plancha frontal (3×20–30 s) si aparece molestia lumbar al extender con la rueda"] },
    ],
    minimalVersion: {
      durationMin: "20–22",
      exercises: [
        { name: "Peso muerto rumano", sets: 2, reps: "8" },
        { name: "Step-up", sets: 2, reps: "8 por pierna" },
        { name: "Plancha", sets: 2, reps: "25 s" },
      ],
    },
  },

  // ------------------------------------------------------- Pierna (cuádriceps)
  {
    id: "pierna-cuadriceps",
    name: "Pierna — Cuádriceps",
    focus: "Pierna (cuádriceps)",
    suggestedDay: 5,        // pista: viernes
    mandatory: false,
    intensity: "Moderada",
    estimatedMin: 35,
    warmupId: "warmup-fase1",
    exercises: [
      { name: "Sentadilla (barra ligera, goblet o con disco)", sets: 3, reps: "8–10", rpe: "6–7", restSec: 90,
        notes: "Rampa de acercamiento antes del peso de trabajo; la última serie no debería superar RPE 7 en esta fase — evitá repetir el patrón de llegar a RPE 10 en la última serie.",
        alternatives: ["Sentadilla goblet (mancuerna o disco) si la barra genera molestia lumbar o de rodilla"] },
      { name: "Extensión de cuádriceps (banda o polea)", sets: 2, reps: "10–12", rpe: "5–6", restSec: 60,
        notes: "Es un ejercicio de cierre, no una segunda serie máxima: dejá buena reserva porque la sentadilla ya fue el esfuerzo principal del día." },
    ],
    minimalVersion: {
      durationMin: "15–18",
      exercises: [
        { name: "Sentadilla", sets: 2, reps: "8" },
        { name: "Extensión de cuádriceps", sets: 2, reps: "10" },
      ],
    },
  },

  // ------------------------------------------------------- Accesorio (opcional)
  {
    id: "accesorio-core-brazos",
    name: "Accesorio — Core y brazos (opcional)",
    focus: "Accesorio (core, bíceps, tríceps)",
    suggestedDay: 6,        // pista: sábado
    mandatory: false,
    intensity: "Amable",
    estimatedMin: 25,
    warmupId: "warmup-fase1",
    exercises: [
      { name: "Curl bíceps con mancuernas", sets: 2, reps: "10–12", rpe: "6–7", restSec: 60,
        notes: "Si este día se suma después de tracción o empuje, quedate en 2 series para no acumular fatiga extra sobre el mismo tejido." },
      { name: "Extensión tríceps (mancuerna o banda)", sets: 2, reps: "10–12", rpe: "6–7", restSec: 60 },
      { name: "Reverse crunch", sets: 2, reps: "10–12", rpe: "6–7", restSec: 45 },
      { name: "Pallof press (banda)", sets: 2, reps: "15–20", rpe: "6", restSec: 45 },
    ],
    minimalVersion: null,   // ya es una sesión corta
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
  // Orden importa: los patrones más específicos van antes que los que se
  // solapan (ej. "jalón al pecho" debe caer en Espalda, no en Pecho por
  // contener "pecho"; "sentadilla búlgara" debe caer en Glúteos, no en
  // Cuádriceps por contener "sentadilla").
  [/aducci[oó]n|aductor|sumo/i, "Aductores"],
  [/hip thrust|puente|gl[uú]teo|abducci[oó]n|caminata lateral|b[uú]lgara/i, "Glúteos"],
  [/sentadilla|goblet|step-?up|prensa|zancad|cu[aá]driceps/i, "Cuádriceps"],
  [/peso muerto|rumano|bisagra|isquio|femoral/i, "Femoral"],
  [/remo|jal[oó]n|dominad|espalda|bird dog/i, "Espalda"],
  [/press de pecho|press inclinado|press banca|pecho/i, "Pecho"],
  [/press militar|elevaciones laterales|face pull|hombro|p[aá]jaros|deltoide/i, "Hombros"],
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
