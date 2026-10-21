import { useEffect, useState } from "react";
import { THEME_KEY, readThemePref, resolveTheme } from "./ui-theme.js";

// Conserva la precedencia de preferencia/sistema y la limpieza del listener.
export function useAppTheme() {
  const [themePref, setThemePref] = useState(() => readThemePref(() => localStorage.getItem(THEME_KEY)));
  const [systemDark, setSystemDark] = useState(() => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    if (typeof matchMedia !== "function") return undefined;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const update = (event) => setSystemDark(event.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, themePref); } catch { /* almacenamiento bloqueado */ } }, [themePref]);
  const theme = resolveTheme(themePref, systemDark);
  // El fondo del documento tambien: .ft-root solo pinta lo que ocupa, y al hacer
  // overscroll o con la pantalla a medias asomaba el blanco del navegador.
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  return { themePref, setThemePref, theme };
}
