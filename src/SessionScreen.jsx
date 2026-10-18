import { replaceExerciseSets, registerTrainingSet } from "./training-records.js";
import React, { useEffect, useMemo, useState } from "react";
import { canonExercise } from "./training-metrics.js";
import { nextSetAdvice, RPE_STEPS } from "./training-advice.js";

// Una serie cuenta como registrada cuando tiene repeticiones: el modelo de datos
// ya crea las series vacias al cargar la rutina, asi que "pendiente" y "hecha"
// salen de los propios datos y no hace falta un estado nuevo que sincronizar.
const isLogged = (set) => Number(set.reps) > 0;
const num = (value) => String(Math.round(Number(value) * 10) / 10).replace(".", ",");
const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

function Stepper({ label, value, step, min, onChange, format = (v) => v }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
      <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 500, fontSize: 9, letterSpacing: ".14em", color: "var(--muted)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button className="ft-dc-step" onClick={() => onChange(Math.max(min, value - step))} aria-label={`Bajar ${label}`}>−</button>
        <span style={{ flex: 1, textAlign: "center", fontFamily: "'IBM Plex Mono'", fontWeight: 700, fontSize: 20 }}>{format(value)}</span>
        <button className="ft-dc-step" onClick={() => onChange(value + step)} aria-label={`Subir ${label}`}>+</button>
      </div>
    </div>
  );
}

export default function SessionScreen({ exercises, writeExercises, onExit, lastPerformance = {} }) {
  const [index, setIndex] = useState(() => {
    const pending = exercises.findIndex((e) => (e.sets || []).some((s) => !isLogged(s)));
    return pending === -1 ? 0 : pending;
  });
  // La sesion es la unica pantalla que se usa de pie, con el movil en la mano:
  // va a pantalla completa, sin rail ni barra inferior compitiendo con el
  // cronometro. Se marca en la raiz y la clase se limpia sola al salir, asi que
  // no hace falta subir el estado de la sesion hasta App.
  useEffect(() => {
    const root = document.querySelector(".ft-root");
    root?.classList.add("ft-focus");
    return () => root?.classList.remove("ft-focus");
  }, []);

  const [editingSetId, setEditingSetId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [advice, setAdvice] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const exercise = exercises[index];
  const sets = exercise?.sets || [];
  const logged = sets.filter(isLogged);
  const pendingSet = sets.find((s) => !isLogged(s)) || null;
  const targetSet = editingSetId ? sets.find((s) => s.id === editingSetId) : pendingSet;

  // Punto de partida de los steppers: la serie que se corrige, la anterior de hoy,
  // lo que se hizo la ultima vez, y por ultimo la prescripcion.
  const seed = useMemo(() => {
    if (!exercise) return { reps: 8, kg: 0 };
    if (editingSetId && targetSet) return { reps: Number(targetSet.reps) || 0, kg: Number(targetSet.kg) || 0 };
    if (advice && advice.kg != null) return { reps: Number(logged[logged.length - 1]?.reps) || 8, kg: advice.kg };
    const previous = logged[logged.length - 1];
    if (previous) return { reps: Number(previous.reps) || 8, kg: Number(previous.kg) || 0 };
    const history = lastPerformance[canonExercise(exercise.name)];
    return {
      reps: Number(exercise.targetReps) || history?.reps || 8,
      kg: history?.kg || 0,
    };
  }, [exercise, editingSetId, targetSet, logged.length, advice]); // eslint-disable-line

  useEffect(() => { setDraft({ ...seed, rpe: editingSetId && targetSet ? String(targetSet.rpe || "") : "" }); }, [seed, editingSetId]); // eslint-disable-line

  if (!exercise || !draft) return null;

  const patchSets = (nextSets) => writeExercises(replaceExerciseSets(exercises, index, nextSets));

  const register = () => {
    if (!targetSet) return;
    patchSets(registerTrainingSet(sets, targetSet.id, draft));
    setAdvice(editingSetId ? null : nextSetAdvice({ rpe: draft.rpe, targetRpe: exercise.targetRpe, kg: draft.kg, muscle: exercise.primary }));
    setEditingSetId(null);
  };

  const addExtraSet = () => {
    const extra = { id: `x${Date.now()}`, reps: "", kg: "", rpe: "" };
    patchSets([...sets, extra]);
    setAdvice(null);
  };

  const goTo = (i) => { setIndex(i); setEditingSetId(null); setAdvice(null); };

  const done = logged.length;
  const total = sets.length;
  const setLabel = editingSetId
    ? `CORRIGIENDO LA ${sets.findIndex((s) => s.id === editingSetId) + 1}ª`
    : targetSet ? `SERIE ${done + 1} DE ${total}` : `${total} DE ${total} · COMPLETO`;
  const lower = ["Cuádriceps", "Femoral", "Glúteos", "Aductores", "Gemelos"].includes(exercise.primary);
  const prescription = [
    total ? `${total}×${exercise.targetReps || "—"}` : null,
    exercise.targetRpe ? `RPE obj. ${exercise.targetRpe}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="ft-dc ft-session">
      <div className="ft-dc-head">
        <div>
          <h1>Sesión</h1>
          <span className="sub" style={{ color: "var(--ok)" }}>EN CURSO · {clock(elapsed)}</span>
        </div>
        <button className="ft-dc-btn ghost" onClick={() => onExit(Math.round(elapsed / 60))}>Salir</button>
      </div>

      <div className="ft-dc-card" style={{ borderColor: "color-mix(in srgb,var(--ok) 32%,transparent)", gap: 12 }}>
        <div className="h">
          <span>Ejercicio {index + 1} de {exercises.length} · {exercise.primary}</span>
          {exercise.notes && <span>{exercise.notes.length > 40 ? `${exercise.notes.slice(0, 40)}…` : exercise.notes}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "Archivo", fontWeight: 700, fontSize: 21, letterSpacing: "-.02em", lineHeight: 1.1 }}>{exercise.name}</span>
          {prescription && <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, color: "var(--muted)" }}>prescrito {prescription}</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 9, letterSpacing: ".16em", color: targetSet ? "var(--ok)" : "var(--muted)" }}>{setLabel}</span>
          <div style={{ display: "flex", gap: 4 }}>
            {sets.map((s) => (
              <span key={s.id} style={{ width: 10, height: 10, borderRadius: "50%", background: isLogged(s) ? "var(--ok)" : s.id === targetSet?.id ? "var(--accent)" : "var(--line)" }} />
            ))}
          </div>
        </div>

        {targetSet ? (
          <>
            {/* Tope de ancho: los steppers se disenaron para 390 px y en monitor
                los botones de - y + acababan a un palmo uno del otro. */}
            <div style={{ display: "flex", gap: 10, maxWidth: 440 }}>
              <Stepper label="REPS" value={draft.reps} step={1} min={1} onChange={(reps) => setDraft({ ...draft, reps })} />
              <Stepper label="KG" value={draft.kg} step={lower ? 5 : 2.5} min={0} onChange={(kg) => setDraft({ ...draft, kg })} format={(v) => (v ? num(v) : "—")} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 500, fontSize: 9, letterSpacing: ".14em", color: "var(--muted)" }}>
                RPE · ESFUERZO PERCIBIDO{exercise.targetRpe ? ` · OBJ. ${exercise.targetRpe}` : ""}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {RPE_STEPS.map((value) => {
                  const key = String(value);
                  const on = draft.rpe === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setDraft({ ...draft, rpe: on ? "" : key })}
                      className="ft-dc-rpe"
                      style={on ? { background: value >= 9 ? "var(--attn)" : "var(--ok)", color: "var(--bg)", borderColor: "transparent" } : undefined}
                    >
                      {num(value)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ft-dc-acts">
              <button className="ft-dc-btn" style={{ flex: 1 }} onClick={register}>
                {editingSetId ? "Guardar cambios" : `Registrar serie ${done + 1}`}
              </button>
              {editingSetId
                ? <button className="ft-dc-btn ghost" onClick={() => setEditingSetId(null)}>Cancelar</button>
                : index < exercises.length - 1 && <button className="ft-dc-btn ghost" onClick={() => goTo(index + 1)}>Saltar</button>}
            </div>
          </>
        ) : (
          <button className="ft-dc-btn" onClick={addExtraSet}>+ Registrar una serie extra</button>
        )}

        {advice && (
          <div className="n" style={{ color: advice.kind === "backoff" ? "var(--attn)" : "var(--muted)" }}>{advice.text}</div>
        )}
      </div>

      {logged.length > 0 && (
        <>
          <div className="ft-dc-day"><span className="t">SERIES REGISTRADAS</span><span className="m">toca para corregir</span></div>
          <div className="ft-dc-list">
            {sets.filter(isLogged).map((s, i) => (
              <button key={s.id} className="ft-dc-row" onClick={() => { setEditingSetId(s.id); setAdvice(null); }}>
                <span className="kind">{String(i + 1).padStart(2, "0")}</span>
                <span style={{ flex: 1 }} className="nm">{s.reps} reps{s.kg ? ` · ${num(s.kg)} kg` : ""}</span>
                {s.rpe && <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 600, fontSize: 9.5, color: Number(s.rpe) >= 9 ? "var(--attn)" : "var(--ok)" }}>RPE {num(s.rpe)}</span>}
                <span className="go">›</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="ft-dc-day"><span className="t">SESIÓN</span><span className="m">{exercises.length} ejercicios</span></div>
      <div className="ft-dc-list">
        {exercises.map((e, i) => {
          const eSets = e.sets || [];
          const eDone = eSets.filter(isLogged).length;
          const state = eDone === 0 ? "pendiente" : eDone >= eSets.length ? "completo" : `${eDone} de ${eSets.length}`;
          return (
            <button key={e.id} className="ft-dc-row" onClick={() => goTo(i)} style={i === index ? { background: "color-mix(in srgb,var(--text) 6%,transparent)" } : undefined}>
              <span className="kind">{String(i + 1).padStart(2, "0")}</span>
              <span style={{ flex: 1 }} className="nm">{e.name}</span>
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, color: eDone >= eSets.length && eSets.length ? "var(--ok)" : "var(--muted)" }}>{state}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
