import React from "react";
import { latestWeight } from "./settings-utils.js";

// Indice de todo lo que no es una raiz. En movil sustituye a la hoja de cinco
// atajos que habia antes; en escritorio convive con el rail, que solo lleva a las
// pantallas de uso diario.
//
// Arriba va quien eres, que era lo que faltaba: el correo y el objetivo activo
// estaban escondidos al pie del rail, donde solo se ven al desplegarlo.

const goalLine = (goals, weights) => {
  const current = latestWeight(weights);
  const direction = Number(goals.weeklyChange) < 0 ? "déficit" : Number(goals.weeklyChange) > 0 ? "superávit" : "mantenimiento";
  return [
    current ? `${String(current).replace(".", ",")} kg` : null,
    goals.targetWeight ? `meta ${String(goals.targetWeight).replace(".", ",")} kg` : null,
    direction,
  ].filter(Boolean).join(" · ");
};

const SEX_LABEL = { mujer: "mujer", hombre: "hombre", otro: "sin especificar" };

function Row({ title, sub, onClick }) {
  return (
    <button className="ft-dc-row ft-more-row" onClick={onClick}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="nm" style={{ display: "block" }}>{title}</span>
        <span className="mt" style={{ display: "block" }}>{sub}</span>
      </span>
      <span className="go">›</span>
    </button>
  );
}

export default function MoreScreen({
  userEmail = "", goals = {}, weights = [], periods = [], menstrualLogs = [],
  foods = [], recipes = [], routines = [], theme = "dark", setThemePref, exportData, importData, setTab,
}) {
  const sex = goals.sex || "";
  const tracksCycle = sex !== "hombre" && (periods.length > 0 || menstrualLogs.length > 0);
  const initial = (userEmail || "?")[0].toUpperCase();
  const name = (userEmail || "").split("@")[0];

  return (
    <div className="ft-dc">
      <div className="ft-dc-head">
        <div>
          <h1>Más</h1>
          <span className="sub">cuenta · datos · export</span>
        </div>
        <button className="ft-dc-btn ghost" onClick={() => setThemePref(theme === "dark" ? "light" : "dark")}>
          Tema {theme === "dark" ? "oscuro" : "claro"}
        </button>
      </div>

      <div className="ft-more-user">
        <span className="avatar">{initial}</span>
        <span style={{ minWidth: 0 }}>
          <b>{name || "Tu cuenta"}</b>
          <small>{userEmail}</small>
        </span>
      </div>

      <div className="ft-more-grid">
        <Row
          title="Perfil"
          sub={[sex ? SEX_LABEL[sex] : "sexo sin indicar", tracksCycle ? "seguimiento de ciclo activo" : "sin seguimiento de ciclo"].join(" · ")}
          onClick={() => setTab("perfil")}
        />
        <Row
          title="Bibliotecas"
          sub={`${foods.length} alimentos · ${recipes.length} recetas · ${routines.length} rutinas`}
          onClick={() => setTab("biblioteca")}
        />
        <Row
          title="Objetivos"
          sub={goalLine(goals, weights)}
          onClick={() => setTab("ajustes")}
        />
        <Row
          title="Exportar datos"
          sub="copia completa en json, incluidas las fotos"
          onClick={exportData}
        />
        <Row
          title="Importar una copia"
          sub="restaura un json exportado antes"
          onClick={importData}
        />
        <Row
          title="Cuenta"
          sub={`${userEmail} · cerrar sesión y borrado`}
          onClick={() => setTab("ajustes")}
        />
      </div>

      {/* Lo que el prototipo pide y todavia no existe se dice, no se pinta como
          fila muerta: una entrada que no lleva a ningun sitio se prueba una vez
          y se recuerda como rota. */}
      <div className="ft-dc-empty" style={{ paddingLeft: 2 }}>
        Todavía no están «Crear plan nuevo» ni «Fuentes de datos» (reloj, báscula, Strava). Los planes se arman por ahora desde Bibliotecas → Rutinas.
      </div>
    </div>
  );
}
