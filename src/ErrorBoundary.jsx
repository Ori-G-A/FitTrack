import React from "react";
import { reportClientError } from "./error-reporting.js";

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
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f3efe6", color: "#16140d", fontFamily: "system-ui, sans-serif" }}>
        <section style={{ maxWidth: 520, border: "1px solid #dcd4c2", background: "#faf7f0", padding: 24 }}>
          <h1 style={{ marginTop: 0, fontSize: 22 }}>FitTrack no pudo mostrar esta pantalla</h1>
          <p style={{ lineHeight: 1.5, color: "#6f6a5d" }}>Tus datos no se han eliminado. Recarga la aplicacion; si el problema continua, exporta el mensaje de la consola antes de hacer cambios.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ border: 0, background: "#e7531c", color: "white", padding: "10px 16px", fontWeight: 700, cursor: "pointer" }}>
            Recargar
          </button>
        </section>
      </main>
    );
  }
}
