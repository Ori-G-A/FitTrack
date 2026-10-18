export const MUSCLES = ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Cuádriceps", "Femoral", "Glúteos", "Aductores", "Gemelos", "Core", "Trapecio", "Antebrazo"];
export const MUSCLE_COLOR = {
  Pecho: "#e7531c", Espalda: "#5ad1ff", Hombros: "#ff8a3d", Bíceps: "#ff6b9d", Tríceps: "#b388ff",
  Cuádriceps: "#d99000", Femoral: "#2f8f6a", Glúteos: "#e7531c", Aductores: "#c06fa0", Gemelos: "#4a9d5e", Core: "#6a655a", Trapecio: "#7a7468", Antebrazo: "#8a6fc0",
};
export const CARDIO_TYPES = ["Caminar", "Correr", "Bici", "Elíptica", "Remo", "Natación", "HIIT", "Otro"];

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
