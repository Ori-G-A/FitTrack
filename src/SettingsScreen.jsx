import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Download, Flame, Lock, Target, Trash2, X } from "lucide-react";
import { ACTIVITY_LEVELS } from "./app-config.js";
import { ScreenMast } from "./EditorialUI.jsx";
import { distributeProtein, PROTEIN_CONFIG } from "./fase1Config.js";
import { goalDirection, goalSuggestion, latestWeight } from "./settings-utils.js";

export default function SettingsScreen({ goals, setGoals, weights, exportData, userEmail, signOut, deleteAllData }) {
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const updateGoal = (key, value) => setGoals((current) => ({ ...current, [key]: value }));
  const latest = latestWeight(weights);
  const referenceWeight = Number(goals.startWeight) || latest || null;
  const direction = goalDirection(Number(goals.startWeight) || latest, Number(goals.targetWeight));
  const proteinPerKg = goals.proteinPerKg ?? 2;
  const proteinMeals = goals.proteinMeals ?? 4;
  const suggestion = useMemo(
    () => referenceWeight ? goalSuggestion(referenceWeight, { ...goals, proteinPerKg }) : null,
    [referenceWeight, goals, proteinPerKg],
  );
  const mealSplit = suggestion ? distributeProtein(suggestion.protein, proteinMeals) : [];

  useEffect(() => {
    if (!goals.autoMacros || !suggestion) return;
    if (Number(goals.kcalTarget) !== suggestion.kcal || Number(goals.proteinTarget) !== suggestion.protein) {
      setGoals((current) => ({ ...current, kcalTarget: suggestion.kcal, proteinTarget: suggestion.protein }));
    }
  }, [goals.autoMacros, goals.kcalTarget, goals.proteinTarget, setGoals, suggestion]);

  const removeAllData = async () => {
    const confirmation = window.prompt("Escribe ELIMINAR para borrar permanentemente todos tus datos de FitTrack.");
    if (confirmation !== "ELIMINAR") return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await deleteAllData();
    } catch (error) {
      setDeleteError(error?.message || "No se pudieron eliminar todos los datos");
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <ScreenMast kicker="FITTRACK · AJUSTES" title="Ajustes" />
      <div style={{ height: 16 }} />
      <div className="ft-card">
        <h2><Target size={16} /> Objetivos de peso</h2>
        <div className="ft-row" style={{ marginBottom: 12 }}>
          <div className="ft-field"><label>Peso inicial (kg)</label><input className="ft-input ft-mono" type="number" step="0.1" placeholder={latest ? `${latest} (último)` : "auto"} value={goals.startWeight} onChange={(event) => updateGoal("startWeight", event.target.value)} /></div>
          <div className="ft-field"><label>Peso meta (kg)</label><input className="ft-input ft-mono" type="number" step="0.1" placeholder="0.0" value={goals.targetWeight} onChange={(event) => updateGoal("targetWeight", event.target.value)} /></div>
        </div>
        <div className="ft-field" style={{ marginBottom: 12 }}>
          <label>Ritmo objetivo: {goals.weeklyChange > 0 ? "+" : ""}{Number(goals.weeklyChange).toFixed(2)} kg/semana{goals.weeklyChange < 0 ? " (déficit)" : goals.weeklyChange > 0 ? " (volumen)" : " (mantenimiento)"}</label>
          <input type="range" min="-1" max="1" step="0.05" value={goals.weeklyChange} onChange={(event) => updateGoal("weeklyChange", Number(event.target.value))} style={{ accentColor: "#e7531c", width: "100%" }} />
        </div>
        {direction && <div className="ft-prev" style={{ marginTop: 0 }}><span>Objetivo detectado:</span><b style={{ color: direction === "perder grasa" ? "var(--blue)" : direction === "ganar músculo" ? "var(--accent)" : "var(--text)" }}>{direction}</b></div>}
      </div>

      <div className="ft-card">
        <h2><Flame size={16} /> Objetivos de nutrición</h2>
        <div className="ft-row" style={{ marginBottom: 12 }}>
          <div className="ft-field"><label>Nivel de actividad</label><select className="ft-select" value={goals.activity} onChange={(event) => updateGoal("activity", event.target.value)}>{ACTIVITY_LEVELS.map((activity) => <option key={activity.key} value={activity.key}>{activity.label}</option>)}</select></div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", marginBottom: 14, fontSize: 14 }}>
          <input type="checkbox" checked={goals.autoMacros} onChange={(event) => updateGoal("autoMacros", event.target.checked)} style={{ accentColor: "#e7531c", width: 18, height: 18 }} />
          Calcular calorías y proteína automáticamente desde mi peso
        </label>
        {goals.autoMacros && (
          <div className="ft-field" style={{ marginBottom: 14 }}>
            <label>Proteína por kg de peso: {proteinPerKg.toFixed(1)} g/kg{referenceWeight ? ` · ${Math.round(referenceWeight * proteinPerKg)} g/día para ${Math.round(referenceWeight * 10) / 10} kg` : ""}</label>
            <input type="range" min={PROTEIN_CONFIG.minGPerKg} max={PROTEIN_CONFIG.maxGPerKg} step="0.1" value={proteinPerKg} onChange={(event) => updateGoal("proteinPerKg", Number(event.target.value))} style={{ accentColor: "#e7531c", width: "100%" }} />
            <div className="ft-mono" style={{ fontSize: 11, color: "var(--muted)" }}>1.6 conservador · 2.0 recomendado en déficit · 2.4 máximo. El objetivo se recalcula solo al cambiar tu peso.</div>
          </div>
        )}
        {goals.autoMacros && suggestion && (
          <div className="ft-prev" style={{ marginTop: 0, marginBottom: 14 }}>
            <span>Mantenimiento est. <b>{suggestion.maintenance}</b> kcal</span>
            <span>→ objetivo <b>{suggestion.kcal}</b> kcal</span>
            <span>· proteína <b>{suggestion.protein}</b> g ({suggestion.proteinPerKg} g/kg · rango {suggestion.lowEnd}–{suggestion.highEnd})</span>
          </div>
        )}
        {goals.autoMacros && mealSplit.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div className="ft-mono" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Reparto sugerido por comida</span>
              <span style={{ display: "inline-flex", gap: 4 }}>{[4, 5].map((count) => <button key={count} className={`ft-secchip${proteinMeals === count ? " on" : ""}`} onClick={() => updateGoal("proteinMeals", count)} style={{ cursor: "pointer" }}>{count} comidas</button>)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${mealSplit.length},1fr)`, gap: 8 }}>
              {mealSplit.map((meal) => <div key={meal.label} style={{ border: "1px solid var(--line)", padding: "10px 8px", textAlign: "center" }}><div className="ft-mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{meal.label}</div><div style={{ fontFamily: "'Archivo'", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", marginTop: 4 }}>{meal.grams}<span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'IBM Plex Mono'", marginLeft: 2 }}>g</span></div></div>)}
            </div>
          </div>
        )}
        <div className="ft-row">
          <div className="ft-field"><label>Calorías diarias</label><input className="ft-input ft-mono" type="number" placeholder="2200" value={goals.kcalTarget} disabled={goals.autoMacros} onChange={(event) => updateGoal("kcalTarget", event.target.value)} /></div>
          <div className="ft-field"><label>Proteína diaria (g)</label><input className="ft-input ft-mono" type="number" placeholder="150" value={goals.proteinTarget} disabled={goals.autoMacros} onChange={(event) => updateGoal("proteinTarget", event.target.value)} /></div>
        </div>
        {goals.autoMacros && !referenceWeight && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>Introduce tu peso inicial (o registra un peso en Cuerpo) para poder calcular.</div>}
      </div>

      <div className="ft-card"><h2><Lock size={16} /> Cuenta</h2><p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 0 }}>Sesión activa: <strong style={{ color: "var(--text)" }}>{userEmail}</strong></p><button className="ft-btn ghost" onClick={signOut}><X size={15} /> Cerrar sesión</button></div>
      <div className="ft-card"><h2><Download size={16} /> Copia de seguridad</h2><p style={{ color: "var(--muted)", fontSize: 14, marginTop: 0 }}>Tus datos, incluidas las fotos, se sincronizan con tu cuenta en Supabase. Exporta un JSON periódicamente como copia adicional; puedes reimportarlo desde la cabecera.</p><button className="ft-btn" onClick={exportData}><Download size={15} /> Exportar copia ahora</button></div>
      <div className="ft-card">
        <h2><AlertTriangle size={16} /> Privacidad y eliminación</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 0 }}>FitTrack almacena en Supabase tus entrenamientos, nutrición, peso, medidas, bienestar, ciclo menstrual y fotos. Las fotos se guardan en un bucket privado y se muestran mediante enlaces temporales.</p>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Esta acción elimina los datos y fotos de FitTrack, pero conserva tu usuario de acceso para que puedas volver a empezar.</p>
        <button className="ft-btn ghost" disabled={deleteBusy} onClick={removeAllData}><Trash2 size={15} /> {deleteBusy ? "Eliminando…" : "Eliminar todos mis datos"}</button>
        {deleteError && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>{deleteError}</div>}
      </div>
      <div className="ft-alert ok"><Check size={20} color="var(--ok)" /><div><div className="t">Cómo se calculan tus macros y avisos</div><div className="b">El cálculo automático estima tu mantenimiento como peso × factor de actividad, le resta o suma el equivalente a tu ritmo objetivo (7700 kcal ≈ 1 kg) y calcula la proteína usando el valor por kg que configures. Es un punto de partida: el dashboard ajusta tu mantenimiento real con tus datos en unas dos semanas.</div></div></div>
    </>
  );
}
