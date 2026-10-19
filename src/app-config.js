export { tracksCycle, CYCLE_PHASES, PHASE_GROUPS } from "./body-config.js";

export const KCAL_PER_KG = 7700;

export const DEFAULT_GOALS = {
  startWeight: "",
  targetWeight: "",
  weeklyChange: -0.4,
  kcalTarget: 2200,
  proteinTarget: 150,
  autoMacros: false,
  activity: "moderado",
  proteinPerKg: 2,
  proteinMeals: 4,
  // Solo decide si se sigue el ciclo; vacio = sin indicar, que sigue mostrandolo
  // si ya hay registros.
  sex: "",
  // Fecha del ultimo aviso de ritmo aplicado o descartado: corta la ventana de
  // weightPaceAlert para que el mismo desvio no se cobre dos veces.
  paceCheckedAt: "",
  // Avisos descartados: clave -> fecha. Vuelven a los 7 dias si la condicion
  // sigue siendo cierta, para que descartar no sea silenciarlos para siempre.
  dismissedAlerts: {},
};

export const ACTIVITY_LEVELS = [
  { key: "sedentario", label: "Sedentario", factor: 28 },
  { key: "ligero", label: "Ligero (1-2 entrenos/sem)", factor: 30 },
  { key: "moderado", label: "Moderado (3-4/sem)", factor: 32 },
  { key: "activo", label: "Activo (5-6/sem)", factor: 35 },
  { key: "muy_activo", label: "Muy activo (físico + diario)", factor: 38 },
];
