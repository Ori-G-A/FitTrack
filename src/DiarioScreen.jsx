import { paceSnapshot, markPaceGoals, undoPaceGoals } from "./goals-operations.js";
import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import DetailSheet from "./DetailSheet.jsx";
import { alertMetrics, buildAlerts } from "./alerts.js";
import { addDays, dayFeed, localISO, proteinAdherence, searchFeed, stepsToday, weightTrendHighlight } from "./app-utils.js";
import { latestWeight, weightPaceAlert } from "./settings-utils.js";

const dec = (value, digits = 1) => (value == null ? "—" : value.toFixed(digits).replace(".", ","));
const kcalFmt = (value) => Math.round(value).toLocaleString("es-ES");
const KIND_LABEL = { entreno: "ENTRENO", cardio: "CARDIO", comida: "COMIDA", peso: "PESO", medidas: "MEDIDAS", nota: "NOTA" };
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
// Un chip por tipo que el feed emite de verdad. El prototipo dibuja cinco porque
// mete el peso dentro de medidas; aqui son entradas distintas y separarlas cuesta
// lo mismo que explicarle a alguien por que su pesaje esta bajo "medidas".
const KINDS = ["entreno", "cardio", "comida", "peso", "medidas", "nota"];

function FeedRow({ entry, setTab, showDate }) {
  return (
    <button className="ft-dc-row" onClick={() => setTab(entry.tab, entry.date)}>
      <span className="kind">{KIND_LABEL[entry.kind]}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="nm" style={{ display: "block" }}>{entry.title}</span>
        {entry.meta && <span className="mt" style={{ display: "block" }}>{entry.meta}</span>}
      </span>
      {showDate && <span className="mt" style={{ flex: "none" }}>{shortDate(entry.date)}</span>}
      <span className="go">›</span>
    </button>
  );
}

function DayList({ label, date, meta, entries, empty, setTab }) {
  return (
    <div>
      <div className="ft-dc-day" style={{ paddingTop: 0 }}>
        <span className="t">{label}</span>
        <span className="m">{capitalize(new Date(`${date}T00:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" }))}{meta ? ` · ${meta}` : ""}</span>
      </div>
      <div className="ft-dc-list">
        {entries.length === 0
          ? <div className="ft-dc-empty">{empty}</div>
          : entries.map((entry) => <FeedRow key={entry.id} entry={entry} setTab={setTab} />)}
      </div>
    </div>
  );
}

// Aviso de ritmo: una sola tarjeta accionable, nunca una pila. El criterio
// (umbral, tope, suelo) vive en weightPaceAlert; aqui solo se cuenta y se aplica.
// Aplicar o descartar escribe goals.paceCheckedAt, asi que el aviso calla hasta
// que haya 3 semanas nuevas de pesajes: sin esa marca reaparecia en cada visita
// pidiendo otro ajuste sobre el objetivo que acababa de subir.
// El desglose del aviso: la app pide mover 300 kcal, asi que tiene que poder
// ensenar de donde sale cada paso del calculo.
function paceRows(alert) {
  const kg = (value) => `${dec(value, 2)} kg/sem`;
  const rows = [
    { k: "Ventana medida", v: `${alert.points} pesajes en ${alert.days} días`, strong: true },
    { k: "Ritmo real", v: kg(alert.perWeek), strong: true },
    { k: "Ritmo objetivo", v: kg(alert.goalPerWeek) },
    { k: "Desviación", v: kg(alert.drift), strong: true },
    { k: "Equivalencia", v: `${kcalFmt(Math.abs(alert.rawKcal))} kcal/día` },
  ];
  if (alert.limited === "step") rows.push({ k: "Tope por ajuste", v: "300 kcal/día", strong: true });
  if (alert.limited === "floor") rows.push({ k: "Suelo por tu peso", v: `${kcalFmt(alert.floor)} kcal/día`, strong: true });
  rows.push({ k: "Objetivo actual", v: `${kcalFmt(alert.current)} kcal` });
  rows.push({ k: "Objetivo propuesto", v: `${kcalFmt(alert.next)} kcal`, strong: true });
  return rows;
}

function paceNote(alert) {
  if (alert.limited === "floor") {
    return `El cálculo pedía más, pero ${kcalFmt(alert.floor)} kcal es el mínimo recomendable para tus ${dec(alert.weight)} kg (22 kcal por kilo). Por debajo de ahí se asocia pérdida de masa magra y alteración del ciclo, y además no da para cubrir la proteína. Si necesitas frenar más, lo que toca revisar es el ritmo objetivo, no las calorías.`;
  }
  if (alert.limited === "step") {
    const exceso = Math.abs(alert.rawKcal) - 300;
    // Con 19 kcal de exceso, hablar de "replantear el plan" suena absurdo: el
    // motivo del tope se explica cuando el tope de verdad recorta algo.
    return exceso > 100
      ? `La desviación pedía ${kcalFmt(Math.abs(alert.rawKcal))} kcal de golpe. El ajuste se limita a 300 por vez porque un salto mayor no es un ajuste, es replantear el plan; si el ritmo sigue igual, el próximo aviso corrige el resto.`
      : `La desviación pedía ${kcalFmt(Math.abs(alert.rawKcal))} kcal y el ajuste se queda en el tope de 300 por vez. Los ${kcalFmt(exceso)} que faltan los recoge el próximo aviso si el ritmo no cambia.`;
  }
  return "Tres semanas es la ventana mínima para que la pendiente sea cambio de tejido y no agua, glucógeno o fase del ciclo. La proteína no se toca: va por gramos de peso corporal y la mueve tu peso, no las calorías.";
}

function PaceAlert({ alert, goals, onApply, onDismiss }) {
  const [why, setWhy] = useState(false);
  const faster = alert.drift < 0;
  const verb = alert.goalPerWeek < 0 ? "Bajas" : alert.goalPerWeek > 0 ? "Subes" : "Te mueves";
  const action = alert.next > alert.current ? "Subir" : "Bajar";
  const nota = alert.limited === "step"
    ? "Ajuste limitado a 300 kcal por vez; si el ritmo sigue, el próximo aviso corrige el resto."
    : alert.limited === "floor"
      ? "Es el mínimo recomendable para tu peso (22 kcal/kg). Si necesitas frenar más, toca revisar el ritmo objetivo, no las calorías."
      : null;

  return (
    <div className="ft-dc-card attn">
      <div className="ft-dc-kicker">Ajustable<span>{alert.points} pesajes · {alert.days} días</span></div>
      <div className="t">{verb} {dec(Math.abs(alert.perWeek), 2)} kg/sem — {dec(Math.abs(alert.drift), 2)} {faster ? "más rápido" : "más lento"} de lo previsto.</div>
      <div className="b">
        {action} a {kcalFmt(alert.next)} kcal te devuelve al ritmo objetivo de {dec(alert.goalPerWeek, 2)} kg/sem sin tocar la proteína.
        {goals.autoMacros ? " Pasa a cálculo manual: tu mantenimiento real no coincide con el estimado." : ""}
      </div>
      {nota && <div className="n">{nota}</div>}
      <div className="ft-dc-acts">
        <button className="ft-dc-btn warn" onClick={onApply}>{action} a {kcalFmt(alert.next)} kcal</button>
        <button className="ft-dc-btn ghost" onClick={onDismiss}>Descartar</button>
      </div>
      <button className="ft-dc-chip" style={{ alignSelf: "flex-start" }} onClick={() => setWhy(true)}>POR QUÉ VEO ESTO</button>

      {why && (
        <DetailSheet
          kicker="Aviso de ritmo"
          title={`De dónde salen las ${kcalFmt(alert.next)} kcal`}
          sub={`Medido entre el ${shortDate(alert.from)} y el ${shortDate(alert.to)}`}
          rows={paceRows(alert)}
          note={paceNote(alert)}
          source="Se calcula con la pendiente de tus pesajes y 7700 kcal por kilo. Solo aparece si la desviación pasa de 0,15 kg por semana, que es donde deja de ser error de báscula."
          onClose={() => setWhy(false)}
        />
      )}
    </div>
  );
}

// Confirmacion de lo que se acaba de hacer. Vive fuera del aviso porque al
// aplicarlo el aviso ya no existe, y sin esto el deshacer se iria con el.
function PaceDone({ done, undo }) {
  if (done.kind === "applied") {
    return (
      <div className="ft-dc-ok">
        <span style={{ flex: 1 }}>Objetivo actualizado a {kcalFmt(done.kcal)} kcal. El próximo aviso llega tras 3 semanas de pesajes.</span>
        <button className="ft-dc-chip" onClick={undo}>DESHACER</button>
      </div>
    );
  }
  return (
    <button className="ft-dc-quiet" onClick={undo}>
      <span style={{ flex: 1 }}>Aviso descartado · vuelve si el ritmo sigue desviado dentro de 3 semanas</span>
      <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 600, fontSize: 10, color: "var(--text)" }}>DESHACER</span>
    </button>
  );
}

// Los avisos son lo que hay que mirar hoy, asi que se leen aqui. El calculo vive
// en alerts.js con el resto de metricas de Metricas; pulsar uno abre la tarjeta
// que lo disparo, que es donde se ve el dato entero.
const ALERT_COLOR = { warn: "var(--attn)", ok: "var(--ok)", pr: "var(--accent)", info: "var(--muted)" };

// Descartar no es silenciar para siempre: el aviso vuelve a los 7 dias si la
// condicion sigue ahi. Y se puede deshacer, como el aviso de ritmo.
const DISMISS_DAYS = 7;

function Alerts({ alerts, openCard, onDismiss }) {
  const urgent = alerts.filter((alert) => alert.type === "warn").length;
  return (
    <div className="ft-dc-card attn">
      <div className="ft-dc-kicker">
        Para hoy
        <span>{urgent ? `${urgent} por revisar de ${alerts.length}` : `${alerts.length} al día`}</span>
      </div>
      {alerts.map((alert) => (
        <div key={alert.key} className="ft-dc-alert">
          <span className="dot" style={{ background: ALERT_COLOR[alert.type] }} />
          <button className="tx" onClick={() => openCard(alert.card)}>
            <b>{alert.title}.</b> {alert.body}
            <span className="go">›</span>
          </button>
          <button className="ft-dc-x" onClick={() => onDismiss(alert)} aria-label={`Descartar: ${alert.title}`} title="Descartar">×</button>
        </div>
      ))}
    </div>
  );
}

export default function DiarioScreen({ workouts = [], nutrition = [], weights = [], measurements = [], wellness = [], periods = [], menstrualLogs = [], goals, setGoals, setTab, openCard = () => {}, userEmail = "" }) {
  const today = localISO();
  const yesterday = addDays(today, -1);
  const data = { workouts, nutrition, weights, measurements, wellness };

  // Filtrar y buscar. Los dos recortan la misma lista, asi que un filtro activo
  // tambien recorta los resultados de busqueda y no hay dos verdades a la vez.
  const [hidden, setHidden] = useState([]);
  const [query, setQuery] = useState("");
  const visible = (entries) => entries.filter((entry) => !hidden.includes(entry.kind));
  const toggleKind = (kind) => setHidden((current) => (current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind]));

  const todayEntries = useMemo(() => dayFeed(today, data), [today, workouts, nutrition, weights, measurements, wellness]);
  const yesterdayEntries = useMemo(() => dayFeed(yesterday, data), [yesterday, workouts, nutrition, weights, measurements, wellness]);
  const results = useMemo(() => searchFeed(query, data), [query, workouts, nutrition, weights, measurements, wellness]);
  const shown = visible(results);
  const alert = useMemo(() => weightPaceAlert(weights, goals, today), [weights, goals, today]);
  const protein = useMemo(() => proteinAdherence(nutrition, goals.proteinTarget, today), [nutrition, goals.proteinTarget, today]);
  const trend = useMemo(() => weightTrendHighlight(weights, today), [weights, today]);
  // La proteina del dia se lee en su aviso, no en la tira: repetirla aqui dejaba
  // fuera lo unico que la tira no contaba, que es cuanto te has movido.
  const steps = useMemo(() => stepsToday(wellness, today), [wellness, today]);
  const allAlerts = useMemo(
    () => buildAlerts(alertMetrics({ workouts, nutrition, weights, wellness, periods, menstrualLogs, goals }), goals),
    [workouts, nutrition, weights, wellness, periods, menstrualLogs, goals],
  );
  const dismissed = goals.dismissedAlerts || {};
  const alerts = allAlerts.filter((alert) => {
    const when = dismissed[alert.key];
    return !when || addDays(when, DISMISS_DAYS) <= today;
  });
  const [undoDismiss, setUndoDismiss] = useState(null);
  const dismissAlert = (alert) => {
    setGoals((current) => ({ ...current, dismissedAlerts: { ...(current.dismissedAlerts || {}), [alert.key]: today } }));
    setUndoDismiss(alert);
  };
  const undoAlert = () => {
    setGoals((current) => {
      const next = { ...(current.dismissedAlerts || {}) };
      delete next[undoDismiss.key];
      return { ...current, dismissedAlerts: next };
    });
    setUndoDismiss(null);
  };

  const sumDay = (date) => nutrition.filter((n) => n.date === date)
    .reduce((total, n) => ({ kcal: total.kcal + (Number(n.kcal) || 0), protein: total.protein + (Number(n.protein) || 0) }), { kcal: 0, protein: 0 });
  const todaySum = sumDay(today);
  const yesterdaySum = sumDay(yesterday);
  const kcalTarget = Number(goals.kcalTarget) || 0;
  const weight = latestWeight(weights);

  // Lo que se acaba de hacer con el aviso, solo para poder deshacerlo en el sitio.
  const [paceDone, setPaceDone] = useState(null);
  const markPace = (kind, patch) => {
    const previous = paceSnapshot(goals);
    setGoals((current) => markPaceGoals(current, patch, today));
    setPaceDone({ kind, kcal: patch.kcalTarget, previous });
  };
  const applyPace = () => markPace("applied", { kcalTarget: alert.next, autoMacros: false });
  const dismissPace = () => markPace("dismissed", {});
  const undoPace = () => {
    setGoals((current) => undoPaceGoals(current, paceDone.previous));
    setPaceDone(null);
  };

  return (
    <div className="ft-dc">
      <div className="ft-dc-head">
        <div>
          <h1>Diario</h1>
          <span className="sub">{capitalize(new Date(`${today}T00:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }))}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="ft-dc-btn" onClick={() => setTab("entrenar")}>Registrar</button>
          <button className="ft-dc-avatar" onClick={() => setTab("cuenta")} title="Tu cuenta" aria-label="Tu cuenta">
            {(userEmail || "?")[0].toUpperCase()}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12, padding: "10px 13px", borderRadius: 10, background: "color-mix(in srgb,var(--text) 5%,transparent)" }}>
        <Search size={15} style={{ color: "var(--muted)", flex: "none" }} />
        <input
          className="ft-dc-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar en sesiones, ejercicios, alimentos y notas"
          aria-label="Buscar en el diario"
        />
        {query && (
          <button className="ft-dc-chip" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">LIMPIAR</button>
        )}
      </div>

      <div className="ft-dc-chips">
        {KINDS.map((kind) => (
          <button
            key={kind}
            className={hidden.includes(kind) ? "off" : ""}
            aria-pressed={!hidden.includes(kind)}
            onClick={() => toggleKind(kind)}
          >
            {KIND_LABEL[kind]}
          </button>
        ))}
      </div>

      <div className="ft-dc-strip">
        <div>
          <span className="k">PESO</span>
          <span className="v">{weight == null ? "—" : dec(weight)}{weight != null && <small>kg</small>}</span>
          <span className="d">{trend ? `${trend.perWeek > 0 ? "+" : ""}${dec(trend.perWeek, 2)} kg/sem` : "sin tendencia"}</span>
        </div>
        <div>
          <span className="k">KCAL HOY</span>
          <span className="v">{kcalFmt(todaySum.kcal)}</span>
          <span className="d">{kcalTarget ? `de ${kcalFmt(kcalTarget)}` : "sin objetivo"}</span>
        </div>
        <button className="ft-kpi" onClick={() => setTab("nota", today)} aria-label="Registrar los pasos de hoy">
          <span className="k">PASOS</span>
          <span className="v">{steps.today == null ? "—" : steps.today.toLocaleString("es-ES")}</span>
          <span className="d">
            {steps.today == null
              ? "sin registrar hoy"
              : steps.avg
                ? `${steps.today >= steps.avg ? "+" : ""}${(steps.today - steps.avg).toLocaleString("es-ES")} vs media 7 d`
                : "primer día registrado"}
          </span>
        </button>
      </div>

      {paceDone
        ? <PaceDone done={paceDone} undo={undoPace} />
        : alert && <PaceAlert alert={alert} goals={goals} onApply={applyPace} onDismiss={dismissPace} />}

      {alerts.length > 0 && <Alerts alerts={alerts} openCard={openCard} onDismiss={dismissAlert} />}

      {undoDismiss && (
        <button className="ft-dc-quiet" onClick={undoAlert}>
          <span style={{ flex: 1 }}>Descartado «{undoDismiss.title}» · vuelve en {DISMISS_DAYS} días si sigue pasando</span>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 600, fontSize: 10, color: "var(--text)" }}>DESHACER</span>
        </button>
      )}

      {protein && protein.onTarget < protein.logged && (
        <button className="ft-dc-quiet" onClick={() => setTab("nutricion")}>
          <span className="dot" />
          <span style={{ flex: 1 }}>Proteína {protein.avg} g de media · {protein.onTarget} de {protein.logged} días en objetivo</span>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13 }}>›</span>
        </button>
      )}

      {query.trim().length >= 2 ? (
        <>
          <div className="ft-dc-day">
            <span className="t">RESULTADOS</span>
            <span className="m">{shown.length === 0 ? "nada coincide" : `${shown.length}${shown.length === 40 ? "+" : ""} · lo más reciente primero`}</span>
          </div>
          <div className="ft-dc-list">
            {shown.length === 0
              ? <div className="ft-dc-empty">Nada con «{query.trim()}». Se busca en nombres de ejercicio, alimentos, medidas y notas.</div>
              : shown.map((entry) => <FeedRow key={`${entry.date}-${entry.id}`} entry={entry} setTab={setTab} showDate />)}
          </div>
        </>
      ) : (
        <div className="ft-dc-grid">
          <DayList
            label="HOY"
            date={today}
            meta={kcalTarget ? `${kcalFmt(todaySum.kcal)} / ${kcalFmt(kcalTarget)} kcal` : null}
            entries={visible(todayEntries)}
            empty={hidden.length ? "Nada de estos tipos hoy." : "Nada registrado todavía. El botón + abre entreno, comida o peso."}
            setTab={setTab}
          />
          <DayList
            label="AYER"
            date={yesterday}
            meta={yesterdaySum.kcal ? `${kcalFmt(yesterdaySum.kcal)} kcal` : null}
            entries={visible(yesterdayEntries)}
            empty="Sin registros."
            setTab={setTab}
          />
        </div>
      )}
    </div>
  );
}
