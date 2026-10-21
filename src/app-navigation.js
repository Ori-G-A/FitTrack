// Datos de navegación; App conserva los estados y aplica los callbacks.
// Los nombres de icono se resuelven en presentación, sin importar React aquí.
export const ACCOUNT_TABS = ["cuenta", "perfil", "ajustes"];
export const BODY_TABS = ["cuerpo", "peso", "medidas", "nota", "checkin"];
export const NAV = [
  { id: "diario", label: "Diario", icon: "Newspaper" },
  { id: "plan", label: "Plan", icon: "CalendarDays" },
  { id: "dashboard", label: "Métricas", icon: "LayoutDashboard" },
  { id: "biblioteca", label: "Biblioteca", icon: "Apple" },
];

export function registrationRows(cycle) {
  const ADD_ROWS = [
    { id: "entrenar", label: "Entreno", sub: "series y RPE", icon: "Dumbbell" },
    { id: "nutricion", label: "Comida", sub: "kcal y macros", icon: "Utensils" },
    { id: "peso", label: "Peso", sub: "báscula del día", icon: "Scale" },
    { id: "nota", label: "Nota del día", sub: "sueño · pasos · energía", icon: "Moon" },
    { id: "medidas", label: "Medidas", sub: "cintura · cadera · fotos", icon: "Ruler" },
    ...(cycle ? [{ id: "checkin", label: "Check-in de ciclo", sub: "sangrado y síntomas", icon: "Droplet" }] : []),
  ].filter(Boolean);
  return ADD_ROWS;
}
