import React from "react";
import { reportClientError } from "./error-reporting.js";

import { readThemePref, resolveTheme } from "./app-utils.js";

const PALETTE = {
  light: { bg: "#f3efe6", panel: "#faf7f0", line: "#dcd4c2", text: "#16140d", muted: "#6f6a5d" },
  dark: { bg: "#17150f", panel: "#201d16", line: "rgba(243,239,230,.12)", text: "#f3efe6", muted: "#8b8578" },
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("FitTrack render error", error, info);
    reportClientError("react_render", error, { componentStack: info.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;
    // Esta pantalla vive fuera de .ft-root, asi que no hereda las variables de
    // tema: resuelve la preferencia por su cuenta para no salir en claro sobre
    // una app oscura.
    const c = PALETTE[resolveTheme(readThemePref(), typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches)];
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: c.bg, color: c.text, fontFamily: "system-ui, sans-serif" }}>
        <section style={{ maxWidth: 520, border: `1px solid ${c.line}`, borderRadius: 12, background: c.panel, padding: 24 }}>
          <h1 style={{ marginTop: 0, fontSize: 22 }}>FitTrack no pudo mostrar esta pantalla</h1>
          <p style={{ lineHeight: 1.5, color: c.muted }}>Tus datos no se han eliminado. Recarga la aplicacion; si el problema continua, exporta el mensaje de la consola antes de hacer cambios.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 9, background: "#e7531c", color: "#f3efe6", padding: "10px 16px", fontWeight: 700, cursor: "pointer" }}>
            Recargar
          </button>
        </section>
      </main>
    );
  }
}
