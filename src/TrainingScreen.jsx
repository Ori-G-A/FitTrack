import { useTrainingTimer } from "./use-training-timer.js";
import { patchTrainingSession, createTrainingExercise, createTrainingExercises, appendTrainingExercises, editTrainingSet, addTrainingSet, deleteTrainingSet, deleteTrainingExercise, createTrainingCardio, deleteTrainingCardio } from "./training-records.js";
import { minimalRoutineExercises, minimalRoutineMinutes, routineForDate, removeRoutineExercise, trainingSessionRoutineItems } from "./training-routines.js";
import { lastTrainingPerformance, trainingSummary } from "./training-metrics.js";
import React, { lazy, Suspense, useState, useEffect, useMemo } from "react";
import { MUSCLES, MUSCLE_COLOR, CARDIO_TYPES, EXERCISE_PRESETS } from "./training-config.js";
import { uid } from "./id-utils.js";
import { localISO } from "./date-utils.js";
import { canonExercise, epley, loadProgressHighlight } from "./training-metrics.js";
import { applyAdjustments } from "./training-records.js";
import { ROUTINE_TEMPLATES, WARMUP, isJointLaxityRisk } from "./fase1Config.js";
import { inferCyclePhase } from "./cycle-inference.js";
import { loadKey, saveKey } from "./data-sync.js";
import { EDateNav, ScreenMast, Headline } from "./EditorialUI.jsx";
import { Dumbbell, Plus, Trash2, AlertTriangle, Timer, Play, Pause, RotateCcw, Check, X, ListChecks, Zap, Activity } from "lucide-react";

const SessionScreen = lazy(() => import("./SessionScreen.jsx"));
const todayISO = () => localISO();
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
const clock = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(m)}:${p(ss)}` : `${p(m)}:${p(ss)}`;
};
const TRAINING_TIMER_PORTS = {
  loadKey, saveKey, now: () => Date.now(),
  setInterval: (tick, ms) => setInterval(tick, ms),
  clearInterval: (id) => clearInterval(id),
  logError: (...args) => console.error(...args),
};

export function Train({ workouts, setWorkouts, routines, setRoutines, userId, periods = [], menstrualLogs = [], wellness = [], initialDate }) {
  const [date, setDate] = useState(initialDate || todayISO());
  // Fase ovulatoria/ventana fértil probable: mayor laxitud articular es común (no es
  // sobreentrenamiento ni requiere bajar volumen, es cuidado de técnica/rango en
  // patrones de rodilla y cadera-lumbar bajo carga). Solo se muestra con confianza
  // media/alta del modelo — no se prescribe con datos insuficientes.
  const phaseCaution = useMemo(() => {
    const estimate = inferCyclePhase({ date, periods, menstrualLogs, wellness });
    if (!["ovulation_probable", "fertile_window_probable"].includes(estimate.phase)) return null;
    return estimate.confidence === "low" ? null : estimate;
  }, [date, periods, menstrualLogs, wellness]);
  // El unico titular de la pantalla: donde mejor esta progresando la carga.
  const strengthHighlight = useMemo(() => loadProgressHighlight(workouts, date), [workouts, date]);
  const [name, setName] = useState("");
  const [primary, setPrimary] = useState(MUSCLES[0]);
  const [secondary, setSecondary] = useState([]);
  const [cardio, setCardio] = useState({ type: CARDIO_TYPES[0], minutes: "", kcal: "" });

  const session = workouts.find((w) => w.date === date) || { exercises: [], durationMin: 0, cardio: [] };
  const exercises = session.exercises;
  const cardioList = session.cardio || [];
  // Referencia "última vez": el set más pesado logueado para este ejercicio (por
  // nombre canónico) en la sesión previa más reciente antes de esta fecha. Da el
  // punto de comparación para decidir repetir o subir carga a propósito, y de paso
  // deja un dato más comparable sesión a sesión para el seguimiento de RPE.
  const lastPerformance = useMemo(() => lastTrainingPerformance(workouts, date), [workouts, date]);
  // La sesion guiada no es otra pantalla: es otro modo de la misma, sobre los
  // mismos datos. Una serie con reps ya es una serie registrada.
  const [inSession, setInSession] = useState(false);
  const [durInput, setDurInput] = useState(session.durationMin ? String(session.durationMin) : "");
  useEffect(() => { setDurInput(session.durationMin ? String(session.durationMin) : ""); }, [date, session.durationMin]);
  const commitDuration = () => writeSession({ durationMin: Number(durInput) || 0 });
  // Autoguardado: el teclado numérico del móvil no trae tecla Enter, así que el
  // valor se guarda solo al a segundo de dejar de escribir. Enter y salir del campo
  // lo siguen guardando al instante. La guarda evita reescribir (y borrar la sesión)
  // cuando el input ya coincide con lo guardado, ej. al montar el componente.
  useEffect(() => {
    if (durInput === (session.durationMin ? String(session.durationMin) : "")) return;
    const timer = setTimeout(commitDuration, 1000);
    return () => clearTimeout(timer);
  }, [durInput]); // eslint-disable-line

  const writeSession = (patch) => setWorkouts((prev) => patchTrainingSession(prev, date, patch, uid));

  const toggleSec = (m) => setSecondary((s) => s.includes(m) ? s.filter((x) => x !== m) : [...s, m]);
  const applyPreset = (idx) => { if (idx === "") return; const p = EXERCISE_PRESETS[Number(idx)]; setName(p.name); setPrimary(p.primary); setSecondary(p.secondary); };
  const addExercise = () => {
    if (!name.trim()) return;
    const ex = createTrainingExercise(name, primary, secondary, uid);
    writeSession({ exercises: [...exercises, ex] }); setName(""); setSecondary([]);
  };
  const addExercisesFromList = (list, addMin = 0) => {
    const newEx = createTrainingExercises(list, uid);
    setWorkouts((prev) => appendTrainingExercises(prev, date, newEx, addMin, uid));
  };
  const loadRoutine = (idx) => { if (idx === "") return; addExercisesFromList(routines[Number(idx)].exercises); };
  // Resuelve la versión mínima desde la rutina o, si no la tiene, desde la plantilla original.
  const minimalFor = (r) => minimalRoutineExercises(r, ROUTINE_TEMPLATES);
  const minimalMin = (r) => minimalRoutineMinutes(r, ROUTINE_TEMPLATES);
  const loadMinimal = (idx) => { if (idx === "") return; const list = minimalFor(routines[Number(idx)]); if (list) addExercisesFromList(list); };
  const loadWarmup = () => addExercisesFromList(WARMUP.exercises.map((w) => ({ name: w.name, targetReps: w.dose, targetSets: 1 })), WARMUP.durationMin);
  const routinesWithMin = routines.map((r, i) => ({ r, i })).filter((x) => minimalFor(x.r));
  const upEx = (n) => writeSession({ exercises: n });
  const editSet = (exId, sId, f, v) => upEx(editTrainingSet(exercises, exId, sId, f, v));
  const addSet = (exId) => upEx(addTrainingSet(exercises, exId, uid));
  const delSet = (exId, sId) => upEx(deleteTrainingSet(exercises, exId, sId));
  const delEx = (exId) => upEx(deleteTrainingExercise(exercises, exId));
  // Carga de golpe para todo un ejercicio. Reutiliza applyAdjustments, que ya
  // impone la regla dura: una serie registrada no se reescribe nunca, porque de
  // ahi salen los records, la progresion y el aviso de fatiga.
  const setExerciseLoad = (exId, kg) => upEx(applyAdjustments(exercises, [{ id: exId, kg, removed: false }]));
  // La rutina del dia, para poder quitar un ejercicio tambien de ella y que no
  // vuelva a proponerse la semana que viene.
  const dayRoutine = routineForDate(routines, date);
  const delExEverywhere = (exId) => {
    const target = exercises.find((e) => e.id === exId);
    if (target && dayRoutine) {
      setRoutines((prev) => removeRoutineExercise(prev, dayRoutine.id, target.name));
    }
    delEx(exId);
  };
  const [removingId, setRemovingId] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const addCardio = () => { if (!cardio.minutes) return; writeSession({ cardio: [...cardioList, createTrainingCardio(cardio, uid)] }); setCardio({ type: CARDIO_TYPES[0], minutes: "", kcal: "" }); };
  const delCardio = (id) => writeSession({ cardio: deleteTrainingCardio(cardioList, id) });

  const { tSec, tRun, startT, pauseT, resetT } = useTrainingTimer(userId, TRAINING_TIMER_PORTS);
  const commitT = () => { const min = Math.round(tSec / 60); if (min > 0) writeSession({ durationMin: (session.durationMin || 0) + min }); resetT(); };

  const { totalVol, totalSets, avgRpe } = trainingSummary(exercises);
  const saveDayAsRoutine = () => {
    if (!exercises.length) return;
    const nm = window.prompt("Nombre de la rutina:", `Rutina ${date}`);
    if (!nm || !nm.trim()) return;
    const items = trainingSessionRoutineItems(exercises, uid);
    setRoutines((prev) => [...prev, { id: uid(), name: nm.trim(), exercises: items }]);
  };

  if (inSession && exercises.length > 0) {
    return (
      <Suspense fallback={<div className="ft-empty">Cargando sesión…</div>}>
        <SessionScreen
          exercises={exercises}
          writeExercises={(next) => writeSession({ exercises: next })}
          lastPerformance={lastPerformance}
          onExit={(minutes) => {
            if (minutes > 0 && minutes > (session.durationMin || 0)) writeSession({ durationMin: minutes });
            setInSession(false);
          }}
        />
      </Suspense>
    );
  }

  return (
    <>
      <ScreenMast
        kicker="FITTRACK · ENTRENAR"
        title="Entrenar"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <EDateNav date={date} setDate={setDate} />
            {exercises.length > 0 && (
              <button className="ft-dc-btn" onClick={() => setInSession(true)}>
                {exercises.some((e) => (e.sets || []).some((x) => Number(x.reps) > 0)) ? "Seguir sesión" : "Empezar sesión"}
              </button>
            )}
          </div>
        }
      />
      {strengthHighlight && (
        <Headline
          kicker="Lo que importa ahora · Fuerza"
          sub={`+${strengthHighlight.to - strengthHighlight.from} kg estimados · ${strengthHighlight.sessions} sesiones registradas`}
          value={`+${strengthHighlight.pct}`}
          unit="%"
          valueSub="1RM est. vs inicio"
          spark={strengthHighlight.series}
        >
          {strengthHighlight.name}: de {strengthHighlight.from} a {strengthHighlight.to} kg de 1RM estimado en estas ocho semanas.
        </Headline>
      )}
      <div style={{ height: 16 }} />

      {phaseCaution && (
        <div className="ft-card" style={{ display: "flex", gap: 10, alignItems: "flex-start", borderColor: "var(--accent)" }}>
          <AlertTriangle size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <b>Fase ovulatoria/ventana fértil probable.</b> Mayor laxitud articular es frecuente en esta fase — no es motivo para bajar volumen, pero conviene cuidar técnica y rango en sentadilla, peso muerto/bisagra e hip thrust. Marcados abajo con <AlertTriangle size={12} style={{ verticalAlign: "-1px", color: "var(--accent)" }} /> si ya cargaste peso.
          </div>
        </div>
      )}

      <div className="ft-card">
        <h2><Timer size={16} /> Duración <span className="tag">{session.durationMin || 0} min · {cardioList.reduce((t, c) => t + c.minutes, 0)} min cardio</span></h2>
        <div className="ft-timer">
          <span className={"clock" + (tRun ? " run" : "")}>{clock(tSec)}</span>
          {!tRun ? <button className="ft-btn" onClick={startT}><Play size={15} /> {tSec ? "Reanudar" : "Empezar"}</button>
            : <button className="ft-btn ghost" onClick={pauseT}><Pause size={15} /> Pausar</button>}
          <button className="ft-btn ghost" onClick={resetT}><RotateCcw size={15} /> Reiniciar</button>
          <button className="ft-btn ghost" onClick={commitT} disabled={tSec < 60}><Check size={15} /> Guardar (+{Math.round(tSec / 60)} min)</button>
          <input className="ft-input ft-mono" style={{ maxWidth: 96 }} type="number" inputMode="numeric" enterKeyHint="done" value={durInput} placeholder="min"
            aria-label="Minutos de la sesión (editar a mano)" title="Minutos (editar a mano)"
            onChange={(e) => setDurInput(e.target.value)}
            onBlur={commitDuration}
            onKeyDown={(e) => { if (e.key === "Enter") { commitDuration(); e.currentTarget.blur(); } }} />
        </div>
      </div>

      {/* Casi todos los dias se empieza cargando una rutina, no escribiendo un
          ejercicio a mano. Lo habitual va en una fila; el alta manual, plegada. */}
      <div className="ft-card">
        <h2><Plus size={16} /> Preparar el día</h2>
        <div className="ft-row" style={{ gap: 8 }}>
          {routines.length > 0 && (
            <select className="ft-select" style={{ flex: "1 1 190px" }} value="" onChange={(e) => loadRoutine(e.target.value)} aria-label="Cargar una rutina completa">
              <option value="">Cargar rutina…</option>
              {routines.map((r, i) => <option key={r.id} value={i}>{r.name} ({r.exercises.length} ej.)</option>)}
            </select>
          )}
          {routinesWithMin.length > 0 && (
            <select className="ft-select" style={{ flex: "1 1 170px" }} value="" onChange={(e) => loadMinimal(e.target.value)} aria-label="Cargar la versión mínima de una rutina">
              <option value="">Versión mínima…</option>
              {routinesWithMin.map(({ r, i }) => <option key={r.id} value={i}>{r.name.split("—")[0].trim()} · {minimalFor(r).length} ej.{minimalMin(r) ? ` · ${minimalMin(r)} min` : ""}</option>)}
            </select>
          )}
          <button className="ft-btn ghost" style={{ flex: "none" }} onClick={loadWarmup} title="Añade los 7 ejercicios de movilidad y suma 10 min de duración"><Zap size={15} /> Calentamiento</button>
          <button className="ft-btn ghost" style={{ flex: "none" }} aria-expanded={manualOpen} onClick={() => setManualOpen((v) => !v)}>
            {manualOpen ? <X size={15} /> : <Plus size={15} />} Ejercicio suelto
          </button>
        </div>

        {manualOpen && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--hair)" }}>
            <div className="ft-row" style={{ gap: 8 }}>
              <input className="ft-input" style={{ flex: "2 1 160px" }} placeholder="Nombre del ejercicio" aria-label="Nombre del ejercicio" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addExercise()} />
              <select className="ft-select" style={{ flex: "1 1 150px" }} value="" onChange={(e) => applyPreset(e.target.value)} aria-label={`Sugerencias de ${primary}`}>
                <option value="">Sugerencias · {primary}</option>
                {EXERCISE_PRESETS.map((p, i) => p.primary === primary ? <option key={p.name} value={i}>{p.name}</option> : null)}
              </select>
              <select className="ft-select" style={{ flex: "1 1 120px" }} value={primary} onChange={(e) => setPrimary(e.target.value)} aria-label="Músculo primario">
                {MUSCLES.map((m) => <option key={m}>{m}</option>)}
              </select>
              <button className="ft-btn" style={{ flex: "none" }} onClick={addExercise}><Plus size={15} /> Añadir</button>
            </div>
            <div className="n" style={{ marginTop: 8 }}>Secundarios (opcional, para repartir el volumen en los multiarticulares)</div>
            <div className="ft-secchips" style={{ marginTop: 4 }}>
              {MUSCLES.filter((m) => m !== primary).map((m) => <span key={m} className={"ft-secchip" + (secondary.includes(m) ? " on" : "")} onClick={() => toggleSec(m)}>{m}</span>)}
            </div>
          </div>
        )}
      </div>

      {exercises.length === 0 ? (
        <div className="ft-card"><div className="ft-empty"><div className="ic"><Dumbbell size={32} /></div>Sin ejercicios este día. Añade el primero o carga una rutina.</div></div>
      ) : (
        <>
          <div className="ft-stats">
            <div className="ft-stat"><div className="k"><Dumbbell size={13} /> Ejercicios</div><div className="v">{exercises.length}</div></div>
            <div className="ft-stat"><div className="k">Series</div><div className="v">{totalSets}</div></div>
            <div className="ft-stat"><div className="k">Volumen total</div><div className="v">{Math.round(totalVol).toLocaleString("es-ES")}<small>kg</small></div></div>
            <div className="ft-stat"><div className="k"><Zap size={13} /> RPE medio</div><div className="v">{avgRpe != null ? avgRpe.toFixed(1) : "—"}</div></div>
          </div>
          <div style={{ marginBottom: 12 }}><button className="ft-btn ghost" onClick={saveDayAsRoutine}><ListChecks size={15} /> Guardar día como rutina</button></div>
          {exercises.length > 0 && (
            <div className="ft-prev" style={{ marginTop: 0, marginBottom: 12, display: "block", lineHeight: 1.55 }}>
              <b style={{ color: "var(--accent)" }}>RPE</b> = esfuerzo percibido, opcional (1–10). Guía: <b>6</b> cómodo, te sobran ~4 reps · <b>8</b> exigente, ~2 en reserva · <b>10</b> máximo, no podías una más.
            </div>
          )}
          {exercises.map((ex) => {
            const best1rm = ex.sets.reduce((m, s) => Math.max(m, epley(Number(s.kg) || 0, Number(s.reps) || 0)), 0);
            const last = lastPerformance[canonExercise(ex.name)];
            return (
              <div className="ft-ex" key={ex.id}>
                <div className="ft-ex-head">
                  <span className="dot" style={{ background: MUSCLE_COLOR[ex.primary] || "#888" }} />
                  <span className="nm">{ex.name}</span>
                  <span className="ft-mu">{ex.primary}</span>
                  {(ex.secondary || []).map((s) => <span key={s} className="ft-mu sec">+{s}</span>)}
                  {ex.targetRpe && <span className="ft-mu" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}>RPE obj. {ex.targetRpe}</span>}
                  {best1rm > 0 && <span className="ft-1rm">1RM ~{Math.round(best1rm)} kg</span>}
                  {phaseCaution && isJointLaxityRisk(ex.name) && ex.sets.some((s) => Number(s.kg) > 0) && (
                    <span title="Fase de mayor laxitud articular: cuidá técnica y rango con carga" style={{ display: "inline-flex", alignItems: "center" }}>
                      <AlertTriangle size={14} style={{ color: "var(--accent)" }} />
                    </span>
                  )}
                  {removingId === ex.id ? (
                    <span style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
                      <button className="ft-dc-chip" onClick={() => { delEx(ex.id); setRemovingId(null); }}>SOLO HOY</button>
                      <button className="ft-dc-chip" onClick={() => { delExEverywhere(ex.id); setRemovingId(null); }}>Y DE LA RUTINA</button>
                      <button className="ft-trash" aria-label="Cancelar" onClick={() => setRemovingId(null)}><X size={15} /></button>
                    </span>
                  ) : (
                    <button className="ft-trash" aria-label={`Quitar ${ex.name}`} onClick={() => (dayRoutine ? setRemovingId(ex.id) : delEx(ex.id))}><Trash2 size={16} /></button>
                  )}
                </div>
                {ex.sets.some((s) => !(Number(s.reps) > 0)) && (() => {
                  const kgs = ex.sets.map((s) => Number(s.kg) || 0).filter((kg) => kg > 0);
                  const load = kgs.length ? Math.max(...kgs) : 0;
                  const step = ["Cuádriceps", "Femoral", "Glúteos", "Aductores", "Gemelos"].includes(ex.primary) ? 5 : 2.5;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 9, letterSpacing: ".14em", color: "var(--muted)" }}>PENDIENTES</span>
                      <button className="ft-dc-step sm" aria-label={`Bajar carga pendiente de ${ex.name}`} onClick={() => setExerciseLoad(ex.id, Math.max(0, load - step))}>−</button>
                      <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 600, fontSize: 12, minWidth: 62, textAlign: "center" }}>
                        {load ? `${String(load).replace(".", ",")} kg` : "sin carga"}
                      </span>
                      <button className="ft-dc-step sm" aria-label={`Subir carga pendiente de ${ex.name}`} onClick={() => setExerciseLoad(ex.id, load + step)}>+</button>
                    </div>
                  );
                })()}
                {last && (
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'IBM Plex Mono'", marginBottom: 8 }}>
                    Última vez ({fmtDate(last.date)}): <b style={{ color: "var(--text)" }}>{last.kg} kg × {last.reps}</b>{last.rpe ? ` @ RPE ${last.rpe}` : ""}
                  </div>
                )}
                {ex.notes && <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'IBM Plex Mono'", marginBottom: 8, lineHeight: 1.45 }}>{ex.notes}</div>}
                <div className="ft-set" style={{ gridTemplateColumns: "24px 1fr 1fr 1fr 30px", color: "var(--muted)", fontSize: 11, fontFamily: "'IBM Plex Mono'", marginBottom: 4 }}>
                  <span></span><span style={{ textAlign: "center" }}>REPS</span><span style={{ textAlign: "center" }}>KG</span><span style={{ textAlign: "center" }}>RPE</span><span></span>
                </div>
                {ex.sets.map((s, i) => (
                  <div className="ft-set" key={s.id} style={{ gridTemplateColumns: "24px 1fr 1fr 1fr 30px" }}>
                    <span className="ix">{i + 1}</span>
                    <input className="si" type="number" inputMode="numeric" value={s.reps} placeholder={ex.targetReps || "0"} title={ex.targetReps ? `Objetivo: ${ex.targetReps} reps` : undefined} onChange={(e) => editSet(ex.id, s.id, "reps", e.target.value)} />
                    <input className="si" type="number" inputMode="decimal" value={s.kg} placeholder="0" onChange={(e) => editSet(ex.id, s.id, "kg", e.target.value)} />
                    <input className="si" type="text" inputMode="decimal" value={s.rpe || ""} placeholder={ex.targetRpe || "–"} title="Esfuerzo percibido 1–10 (opcional)" onChange={(e) => editSet(ex.id, s.id, "rpe", e.target.value)} />
                    <button className="ft-trash" onClick={() => delSet(ex.id, s.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
                <button className="ft-addset" onClick={() => addSet(ex.id)}>+ serie</button>
              </div>
            );
          })}
        </>
      )}

      <div className="ft-card">
        <h2><Activity size={16} /> Cardio</h2>
        <div className="ft-row">
          <div className="ft-field"><label>Tipo</label><select className="ft-select" value={cardio.type} onChange={(e) => setCardio({ ...cardio, type: e.target.value })}>{CARDIO_TYPES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="ft-field"><label>Minutos</label><input className="ft-input ft-mono" type="number" inputMode="numeric" placeholder="0" value={cardio.minutes} onChange={(e) => setCardio({ ...cardio, minutes: e.target.value })} /></div>
          <div className="ft-field"><label>Kcal (opcional)</label><input className="ft-input ft-mono" type="number" inputMode="numeric" placeholder="0" value={cardio.kcal} onChange={(e) => setCardio({ ...cardio, kcal: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addCardio()} /></div>
          <button className="ft-btn" onClick={addCardio}><Plus size={15} /></button>
        </div>
        {cardioList.length > 0 && (
          <div className="ft-list" style={{ marginTop: 12 }}>
            {cardioList.map((c) => (
              <div className="ft-li" key={c.id}>
                <span className="li-main">{c.type}</span>
                <span className="li-sub">{c.minutes} min{c.kcal ? ` · ${c.kcal} kcal` : ""}</span>
                <button className="ft-trash" onClick={() => delCardio(c.id)}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

