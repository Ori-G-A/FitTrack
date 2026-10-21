// Validación de preferencia y resolución; la lectura de almacenamiento se inyecta.
export const THEME_KEY = "ft-theme";

export function readThemePref(readStored) {
  try {
    const stored = readStored();
    return stored === "auto" || stored === "light" || stored === "dark" ? stored : "dark";
  } catch {
    return "dark";
  }
}

export function resolveTheme(pref, systemDark) {
  return pref === "auto" ? (systemDark ? "dark" : "light") : pref;
}

