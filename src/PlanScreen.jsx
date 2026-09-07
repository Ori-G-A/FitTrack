import React, { useMemo, useState } from "react";
import { dayFeed, localISO, planWeek, weekNumber } from "./app-utils.js";

const STATE = {
  hecho: { tag: "HECHO", color: "var(--ok)" },
  hoy: { tag: "TOCA HOY", color: "var(--ok)" },
  previsto: { tag: "PREVISTO", color: "var(--muted)" },
  perdido: { tag: "SIN REGISTRAR", color: "var(--attn)" },
  libre: { tag: "DÍA LIBRE", color: "var(--muted)" },
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const KIND_LABEL = { cardio: "CARDIO", comida: "COMIDA", peso: "PESO", medidas: "MEDIDAS", nota: "NOTA" };
// Lo que se puede registrar de un dia ademas de la sesion. El destino es el
// mismo que usa el Diario, asi que un dia se abre igual desde los dos sitios.
const REGISTRABLE = [
  { kind: "comida", label: "Añadir comida", tab: "nutricion" },
  { kind: "peso", label: "Registrar peso", tab: "cuerpo" },
  { kind: "nota", label: "Escribir nota", tab: "cuerpo" },
];
const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
const num = (value) => String(Math.round(Number(value) * 10) / 10).replace(".", ",");
// "Empuje — Press horizontal/inclinado + hombro" no cabe en una celda de 40 px.
// La primera palabra basta para reconocerla y no parte por la mitad.
const shortName = (name) => String(name || "").split(/[—–-]/)[0].trim().split(/\s+/)[0].toUpperCase();

// Lo que se hizo de verdad en una serie registrada.
const doneLine = (exercise) => {
  const sets = (exercise.sets || []).filter((s) => Number(s.reps) > 0);
  if (!sets.length) return "sin registrar";
  const kg = sets.map((s) => Number(s.kg) || 0).filter(Boolean);
  const rpe = sets.map((s) => parseFloat(s.rpe)).filter((r) => r > 0);
  return [
    `${sets.length} serie${sets.length === 1 ? "" : "s"}`,
    kg.length ? `${num(Math.max(...kg))} kg` : null,
    rpe.length ? `RPE ${num(rpe.reduce((a, b) => a + b, 0) / rpe.length)}` : null,
  ].filter(Boolean).join(" · ");
};

function prescription(exercise) {
  const sets = Number(exercise.targetSets) || null;
  const reps = String(exercise.targetReps || "").trim();
  const load = [sets && reps ? `${sets}×${reps}` : sets ? `${sets} series` : reps, exercise.targetRpe ? `RPE ${exercise.targetRpe}` : null];
  return load.filter(Boolean).join(" · ");
}

export default function PlanScreen({ routines = [], setRoutines, workouts = [], nutrition = [], weights = [], measurements = [], wellness = [], setTab }) {
  const today = localISO();
  const week = useMemo(() => planWeek(routines, workouts, today), [routines, workouts, today]);
  const number = useMemo(() => weekNumber(workouts, today), [workouts, today]);

  // Plan solo mira la semana en curso. El historial de adherencia y el mapa de
  // calor viven en Metricas: repetirlos aqui daba dos respuestas a la misma
  // pregunta, y encima con numeros distintos.
  const perWeek = routines.filter((r) => r.suggestedDay != null && r.suggestedDay !== "").length;
  const doneThisWeek = week.filter((d) => d.state === "hecho").length;
  const missed = week.filter((d) => d.state === "perdido");

  const [pickedIso, setPickedIso] = useState(null);
  const [editing, setEditing] = useState(false);
  const selected = week.find((d) => d.iso === pickedIso) || week.find((d) => d.iso === today) || week[0];

  // Un día, una rutina: asignarla aquí se la quita a quien la tuviera antes, o
  // el mismo entreno saldría dos veces en la misma semana.
  const assign = (dow, routineId) => setRoutines((current) => current.map((routine) => {
    if (routine.id === routineId) return { ...routine, suggestedDay: dow };
    if (Number(routine.suggestedDay) === dow) return { ...routine, suggestedDay: null };
    return routine;
  }));

  // Un dia no es solo el entreno: es todo lo que se registro ese dia. La sesion
  // ya tiene su bloque arriba, asi que aqui va el resto y los huecos que faltan
  // por llenar. Misma lista que el Diario, misma fecha al abrir cada fila.
  const rest = useMemo(
    () => dayFeed(selected.iso, { workouts, nutrition, weights, measurements, wellness }).filter((entry) => entry.kind !== "entreno"),
    [selected.iso, workouts, nutrition, weights, measurements, wellness],
  );
  const kcalDay = nutrition.filter((n) => n.date === selected.iso).reduce((total, n) => total + (Number(n.kcal) || 0), 0);
  const pending = REGISTRABLE.filter((option) => !rest.some((entry) => entry.kind === option.kind));

  const state = STATE[selected.state];
  const routine = selected.routine;
  const isToday = selected.iso === today;

  // Un dia ya entrenado muestra lo que se hizo, no lo que tocaba: la prescripcion
  // deja de importar en cuanto hay series registradas. Y una sesion sin rutina
  // asignada sigue siendo una sesion, no un descanso.
  const done = selected.sets > 0;
  const exercises = done ? (selected.workout?.exercises || []) : (routine?.exercises || []);
  const title = done ? (routine?.name || "Sesión libre") : routine ? routine.name : "Descanso";
  const subtitle = done
    ? [`${exercises.length} ejercicio${exercises.length === 1 ? "" : "s"}`, selected.workout?.durationMin ? `${selected.workout.durationMin} min` : null, routine ? null : "fuera del plan"].filter(Boolean).join(" · ")
    : routine
      ? [`${exercises.length} ejercicio${exercises.length === 1 ? "" : "s"}`, routine.estimatedMin ? `~${routine.estimatedMin} min` : null, routine.focus].filter(Boolean).join(" · ")
      : "Sin sesión programada. Movilidad o paseo si te apetece.";

  return (
    <div className="ft-dc">
      <div className="ft-dc-head">
        <div>
          <h1>Plan</h1>
          <span className="sub">
            {number ? `semana ${number}` : "sin sesiones aún"}
            {/* "5 de 4" se lee como un fallo: entrenar de mas es normal, no un error. */}
            {perWeek > 0 ? ` · ${doneThisWeek} hechas de ${perWeek} previstas` : " · sin días asignados"}
          </span>
        </div>
        <button className="ft-dc-btn ghost" onClick={() => setEditing((v) => !v)}>
          {editing ? "Listo" : "Editar"}
        </button>
      </div>

      <div className="ft-plan-week">
        {week.map((day) => (
          <button
            key={day.iso}
            className={`${day.iso === selected.iso ? "sel " : ""}${day.state}`}
            onClick={() => setPickedIso(day.iso)}
            aria-label={`${day.label}, ${STATE[day.state].tag.toLowerCase()}`}
          >
            <span className="k">{day.key}</span>
            <span className="dot" />
            <span className="n">{day.routine ? shortName(day.routine.name) : "—"}</span>
          </button>
        ))}
      </div>

      <div className="ft-dc-card">
        <div className="h">
          <span style={{ color: state.color }}>{state.tag} · {capitalize(selected.label)} {shortDate(selected.iso)}</span>
          {routine?.intensity && <span>{routine.intensity}</span>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "Archivo", fontWeight: 700, fontSize: 21, letterSpacing: "-.02em" }}>{title}</span>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, color: "var(--muted)" }}>{subtitle}</span>
        </div>

        {done && (
          <div className="n" style={{ color: "var(--ok)" }}>
            {selected.sets} serie{selected.sets === 1 ? "" : "s"} registradas.
          </div>
        )}

        {editing && (
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 9, letterSpacing: ".14em", color: "var(--muted)" }}>
              QUÉ TOCA LOS {selected.label.toUpperCase()}
            </span>
            <select
              className="ft-select"
              value={routine ? routine.id : ""}
              onChange={(event) => assign(selected.dow, event.target.value)}
            >
              <option value="">Descanso</option>
              {routines.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
        )}

        {exercises.length > 0 && (
          <div className="ft-dc-list" style={{ marginTop: 2 }}>
            {exercises.map((exercise, index) => (
              <div key={exercise.id || index} className="ft-dc-row" style={{ cursor: "default" }}>
                <span className="kind">{String(index + 1).padStart(2, "0")}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="nm" style={{ display: "block" }}>
                    {exercise.name}
                    {exercise.isOptional && <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 9, letterSpacing: ".08em", color: "var(--muted)", marginLeft: 7 }}>OPCIONAL</span>}
                  </span>
                  <span className="mt" style={{ display: "block" }}>
                    {[exercise.primary, done ? doneLine(exercise) : prescription(exercise)].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {(routine || isToday || selected.state === "perdido") && (
          <div className="ft-dc-acts">
            {/* Un dia pasado con rutina sin registrar sigue siendo registrable:
                el boton lleva a Entrenar con esa fecha, no con la de hoy. */}
            {(isToday || selected.state === "perdido") && (
              <button className="ft-dc-btn" onClick={() => setTab("entrenar", selected.iso)}>
                {done ? "Seguir la sesión" : isToday ? "Entrenar hoy" : "Registrar esta sesión"}
              </button>
            )}
            {routine && <button className="ft-dc-btn ghost" onClick={() => setTab("rutinas")}>Ver y editar la rutina completa</button>}
          </div>
        )}
      </div>

      <div className="ft-dc-day">
        <span className="t">RESTO DEL DÍA</span>
        <span className="m">{kcalDay ? `${Math.round(kcalDay).toLocaleString("es-ES")} kcal` : "sin comidas registradas"}</span>
      </div>
      <div className="ft-dc-list">
        {rest.map((entry) => (
          <button key={entry.id} className="ft-dc-row" onClick={() => setTab(entry.tab, selected.iso)}>
            <span className="kind">{KIND_LABEL[entry.kind]}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="nm" style={{ display: "block" }}>{entry.title}</span>
              {entry.meta && <span className="mt" style={{ display: "block" }}>{entry.meta}</span>}
            </span>
            <span className="go">›</span>
          </button>
        ))}
        {rest.length === 0 && <div className="ft-dc-empty">Nada más registrado {isToday ? "hoy" : "ese día"}.</div>}
      </div>
      {pending.length > 0 && (
        <div className="ft-dc-acts">
          {pending.map((option) => (
            <button key={option.kind} className="ft-dc-btn ghost" onClick={() => setTab(option.tab, selected.iso)}>{option.label}</button>
          ))}
        </div>
      )}

      {perWeek === 0 ? (
        <div className="ft-dc-empty">
          Ninguna rutina tiene día asignado. Pulsa Editar y reparte tus rutinas por la semana.
        </div>
      ) : missed.length > 0 ? (
        <button className="ft-dc-quiet" onClick={() => setPickedIso(missed[0].iso)}>
          <span className="dot" />
          <span style={{ flex: 1 }}>
            {missed.length === 1
              ? `Queda sin registrar ${missed[0].label}: ${missed[0].routine.name}.`
              : `Quedan ${missed.length} días sin registrar esta semana.`}
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13 }}>›</span>
        </button>
      ) : null}

    </div>
  );
}
