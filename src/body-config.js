// Si el perfil dice "hombre" no hay ciclo que seguir: ni check-in, ni fase en la
// tira de peso, ni tarjeta en Metricas, ni avisos de retencion lutea. Vacio no
// asume nada, que es distinto de decir que no.
export const tracksCycle = (goals = {}) => goals?.sex !== "hombre";

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

export const BLEEDING_OPTIONS = [
  ["not_logged", "Sin registrar"],
  ["none", "No hubo"],
  ["spotting", "Manchado"],
  ["light", "Leve"],
  ["medium", "Medio"],
  ["heavy", "Abundante"],
];
export const FLUID_OPTIONS = [
  ["not_checked", "No revise"],
  ["dry", "Seco"],
  ["sticky", "Pegajoso"],
  ["creamy", "Cremoso"],
  ["watery", "Acuoso"],
  ["slippery_eggwhite", "Elastico / resbaladizo"],
  ["unknown", "No se"],
];
export const APPETITE_OPTIONS = [
  ["not_logged", "Sin registrar"],
  ["normal", "Normal"],
  ["increased", "Mas hambre"],
  ["decreased", "Menos hambre"],
  ["sweet_cravings", "Antojos dulces"],
  ["salty_cravings", "Antojos salados"],
];
export const PAIN_OPTIONS = [
  ["not_logged", "Sin registrar"],
  ["none", "No"],
  ["left", "Izquierdo"],
  ["right", "Derecho"],
  ["center", "Centro"],
  ["general", "General"],
];
export const PHASE_SHADE = {
  menstruation: 1,
  follicular_early: 0.4,
  follicular_mid_late: 0.75,
  fertile_window_probable: 0.6,
  ovulation_probable: 1,
  luteal_early: 0.4,
  luteal_mid: 0.7,
  luteal_late: 1,
  unknown: 0.15,
};
export const PHASE_NAMES = {
  menstruation: "menstruacion",
  follicular_early: "folicular temprana",
  follicular_mid_late: "folicular media/tardia",
  fertile_window_probable: "ventana fertil probable",
  ovulation_probable: "ovulacion probable",
  luteal_early: "lutea temprana",
  luteal_mid: "lutea media",
  luteal_late: "lutea tardia",
  unknown: "por estimar",
};
export const CONFIDENCE_NAMES = { low: "baja", medium: "media", high: "alta" };
