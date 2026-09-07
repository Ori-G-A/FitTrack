import React, { useState } from "react";
import PerfilScreen from "./PerfilScreen.jsx";
import SettingsScreen from "./SettingsScreen.jsx";

// Tu cuenta, no un cajón de "Más".
//
// Antes esto vivía en tres sitios: una pantalla índice llamada Más, un Perfil
// con el ciclo y unos Ajustes con los objetivos y el borrado. Tres destinos para
// una sola idea —quién eres y cómo está configurado lo tuyo— y encima Más
// repetía entradas que ya estaban en el rail.
//
// Ahora es una pantalla con dos pestañas y se entra por tu nombre, que es donde
// se busca la cuenta en cualquier app.

const TABS = [["perfil", "PERFIL"], ["datos", "DATOS Y CONFIGURACIÓN"]];

export default function AccountScreen({
  section = "perfil", userEmail = "", goals, setGoals, weights = [],
  periods = [], menstrualLogs = [], wellness = [], setTab,
  exportData, importData, signOut, deleteAllData, themePref, setThemePref, theme,
}) {
  const [tab, setLocalTab] = useState(TABS.some(([id]) => id === section) ? section : "perfil");
  const name = (userEmail || "").split("@")[0];

  return (
    <div className="ft-dc">
      <div className="ft-dc-head">
        <div className="ft-more-user" style={{ padding: 0 }}>
          <span className="avatar">{(userEmail || "?")[0].toUpperCase()}</span>
          <span style={{ minWidth: 0 }}>
            <b>{name || "Tu cuenta"}</b>
            <small>{userEmail}</small>
          </span>
        </div>
      </div>

      <div className="ft-dc-chips">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} aria-pressed={tab === id} onClick={() => setLocalTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "perfil" ? (
        <>
          {/* Sexo, ciclo y guía viven en Perfil; el objetivo de peso y de
              nutrición, en la columna de objetivos de Ajustes. Se componen en
              vez de reescribirse: el cálculo ya estaba probado. */}
          <PerfilScreen
            embedded
            userEmail={userEmail}
            goals={goals}
            setGoals={setGoals}
            periods={periods}
            menstrualLogs={menstrualLogs}
            wellness={wellness}
            setTab={setTab}
          />
          <SettingsScreen
            section="objetivos"
            goals={goals}
            setGoals={setGoals}
            weights={weights}
            userEmail={userEmail}
            exportData={exportData}
            signOut={signOut}
            deleteAllData={deleteAllData}
            themePref={themePref}
            setThemePref={setThemePref}
            theme={theme}
          />
        </>
      ) : (
        <>
          <SettingsScreen
            section="datos"
            goals={goals}
            setGoals={setGoals}
            weights={weights}
            userEmail={userEmail}
            exportData={exportData}
            signOut={signOut}
            deleteAllData={deleteAllData}
            themePref={themePref}
            setThemePref={setThemePref}
            theme={theme}
          />
          <div className="ft-dc-card">
            <div className="h"><span>Importar</span><span>json exportado antes</span></div>
            <div className="b">Restaura una copia que exportaste. Reemplaza lo que haya en la cuenta, así que hazla antes de importar si tienes dudas.</div>
            <div className="ft-dc-acts">
              <button className="ft-dc-btn ghost" onClick={importData}>Elegir archivo</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
