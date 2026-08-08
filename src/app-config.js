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
};

export const ACTIVITY_LEVELS = [
  { key: "sedentario", label: "Sedentario", factor: 28 },
  { key: "ligero", label: "Ligero (1-2 entrenos/sem)", factor: 30 },
  { key: "moderado", label: "Moderado (3-4/sem)", factor: 32 },
  { key: "activo", label: "Activo (5-6/sem)", factor: 35 },
  { key: "muy_activo", label: "Muy activo (físico + diario)", factor: 38 },
];

export const CYCLE_PHASES = {
  Menstrual: { color: "#ff6b4a", note: "Energía variable y posibles molestias. Está bien bajar intensidad si lo necesitas; escucha a tu cuerpo." },
  Folicular: { color: "#3ddc97", note: "Al subir el estrógeno, muchas personas reportan más energía y fuerza. Suele ser una buena ventana para intentar récords." },
  Ovulatoria: { color: "#e7531c", note: "Pico de energía frecuente. Algunas notan más laxitud articular: cuida especialmente la técnica con cargas altas." },
  Lútea: { color: "#b388ff", note: "En la fase lútea tardía algunas reportan más fatiga, antojos y peor recuperación. Que el rendimiento fluctúe aquí es normal." },
  "Por confirmar": { color: "#878d86", note: "Tu periodo podría ir retrasado respecto a tu media. Registra el inicio cuando llegue para afinar las predicciones." },
};

// Fases finas de cycle-inference agrupadas en las 4 fases con color y nota.
export const PHASE_GROUPS = {
  menstruation: "Menstrual",
  follicular_early: "Folicular",
  follicular_mid_late: "Folicular",
  fertile_window_probable: "Ovulatoria",
  ovulation_probable: "Ovulatoria",
  luteal_early: "Lútea",
  luteal_mid: "Lútea",
  luteal_late: "Lútea",
  unknown: "Por confirmar",
};
