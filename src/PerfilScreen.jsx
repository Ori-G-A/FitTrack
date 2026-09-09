import React, { useMemo } from "react";
import { CYCLE_PHASES, PHASE_GROUPS } from "./app-config.js";
import { localISO } from "./app-utils.js";
import { cycleContext, dailyGuidance, summarizeCycles } from "./cycle-inference.js";

// Quien eres y en que punto del ciclo estas. Todo esto ya se calculaba en
// cycle-inference, pero solo se veia enterrado entre los seis formularios de
// Cuerpo, debajo del check-in. Aqui se lee sin tener que registrar nada.

const SEX_OPTIONS = [["mujer", "Mujer"], ["hombre", "Hombre"], ["otro", "Prefiero no decir"]];
const fecha = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
const CONFIDENCE = { high: "estimación firme", medium: "estimación media", low: "estimación floja" };

function PhaseBar({ segments }) {
  const total = segments.reduce((sum, seg) => sum + seg.days, 0) || 1;
  return (
    <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", background: "var(--hair)" }}>
      {segments.map((seg, index) => (
        <span
          key={`${seg.phase}-${index}`}
          title={`${seg.label} · ${seg.days} d`}
          style={{ width: `${(seg.days / total) * 100}%`, background: (CYCLE_PHASES[PHASE_GROUPS[seg.phase]] || CYCLE_PHASES["Por confirmar"]).color }}
        />
      ))}
    </div>
  );
}

export default function PerfilScreen({ embedded = false, userEmail = "", goals = {}, setGoals, periods = [], menstrualLogs = [], wellness = [], setTab }) {
  const today = localISO();
  const sex = goals.sex || "";
  const hasCycleData = periods.length > 0 || menstrualLogs.length > 0;
  const tracksCycle = sex !== "hombre" && hasCycleData;

  const ctx = useMemo(() => cycleContext(today, periods, menstrualLogs), [today, periods, menstrualLogs]);
  const guide = useMemo(() => dailyGuidance({ date: today, menstrualLogs, periods, wellness }), [today, menstrualLogs, periods, wellness]);
  const summary = useMemo(() => summarizeCycles(periods, menstrualLogs, today), [periods, menstrualLogs, today]);

  const group = PHASE_GROUPS[guide.phase] || "Por confirmar";
  const phaseColor = (CYCLE_PHASES[group] || CYCLE_PHASES["Por confirmar"]).color;

  // Embebida dentro de Cuenta no repite cabecera ni el enlace a objetivos: los
  // objetivos estan justo debajo, en la misma pestana.
  const Marco = embedded ? React.Fragment : "div";
  const marcoProps = embedded ? {} : { className: "ft-dc" };

  return (
    <Marco {...marcoProps}>
      {!embedded && (
        <div className="ft-dc-head">
          <div>
            <h1>Perfil</h1>
            <span className="sub">{userEmail || "sin cuenta"}</span>
          </div>
        </div>
      )}

      <div className="ft-dc-card">
        <div className="h"><span>Sexo</span><span>define qué se sigue</span></div>
        <div className="ft-dc-chips" style={{ paddingTop: 0 }}>
          {SEX_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              className={sex === value ? "on" : ""}
              aria-pressed={sex === value}
              onClick={() => setGoals((current) => ({ ...current, sex: value }))}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="n">
          {sex === "hombre"
            ? "Sin seguimiento de ciclo. El resto de la app funciona igual."
            : "Con el ciclo registrado, la tendencia de peso descuenta la retención lútea y los avisos avisan cuando un desvío puede ser agua."}
        </div>
      </div>

      {!tracksCycle ? (
        sex !== "hombre" && (
          <div className="ft-dc-card">
            <div className="t">Sin datos de ciclo todavía</div>
            <div className="b">Registra un check-in y aquí verás en qué fase estás, qué esperar y cómo suele afectar al entreno.</div>
            <div className="ft-dc-acts">
              <button className="ft-dc-btn" onClick={() => setTab("cuerpo")}>Hacer el check-in</button>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="ft-dc-strip" style={{ "--cols": 3 }}>
            <div>
              <span className="k">DÍA DEL CICLO</span>
              <span className="v">{ctx.cycleDay ?? "—"}</span>
              <span className="d">{ctx.samples ? `ciclo ~${ctx.avgCycle} d · ${ctx.samples} medidos` : "sin ciclos completos"}</span>
            </div>
            <div>
              <span className="k">FASE DE HOY</span>
              <span className="v" style={{ fontSize: 19, color: phaseColor }}>{group}</span>
              <span className="d">{CONFIDENCE[guide.confidence] || guide.confidence}</span>
            </div>
            <div>
              <span className="k">PRÓXIMO PERIODO</span>
              {/* «0 d» se lee como un error; el dia que toca se dice con palabras. */}
              <span className="v" style={ctx.daysToNext === 0 ? { fontSize: 19 } : undefined}>
                {ctx.daysToNext == null ? "—" : ctx.daysToNext === 0 ? "Hoy" : Math.abs(ctx.daysToNext)}
                {ctx.daysToNext != null && ctx.daysToNext !== 0 && <small>{ctx.daysToNext < 0 ? "d de retraso" : "d"}</small>}
              </span>
              <span className="d">{ctx.nextPeriod ? fecha(ctx.nextPeriod) : "sin estimar"}</span>
            </div>
          </div>

          <div className="ft-dc-card">
            <div className="h">
              <span style={{ color: phaseColor }}>GUÍA DE HOY · {group.toUpperCase()}</span>
              {guide.provisional && <span>provisional · faltan ciclos</span>}
            </div>
            {guide.reason && (
              <div className="n" style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 9 }}>
                <b style={{ color: "var(--text)" }}>Por qué.</b> {guide.reason}
              </div>
            )}
            <div className="b"><b style={{ color: "var(--text)" }}>Hormonas.</b> {guide.hormones}</div>
            <div className="b"><b style={{ color: "var(--text)" }}>Qué esperar.</b> {guide.expected}</div>
            <div className="b"><b style={{ color: "var(--text)" }}>Entreno.</b> {guide.training}</div>
            <div className="b"><b style={{ color: "var(--text)" }}>Nutrición.</b> {guide.nutrition}</div>
            {guide.notes.length > 0 && (
              <div style={{ borderTop: "1px solid var(--hair)", paddingTop: 9, marginTop: 2, display: "flex", flexDirection: "column", gap: 6 }}>
                {guide.notes.map((note, index) => <div key={index} className="n" style={{ color: "var(--text)" }}>{note}</div>)}
              </div>
            )}
            <div className="ft-dc-acts">
              <button className={guide.phase === "unknown" ? "ft-dc-btn" : "ft-dc-btn ghost"} onClick={() => setTab("checkin")}>
                {guide.phase === "unknown" ? "Registrar el periodo" : "Actualizar el check-in"}
              </button>
            </div>
          </div>

          <div className="ft-dc-day">
            <span className="t">HISTORIAL DE FASES</span>
            <span className="m">
              {summary.samples ? `${summary.samples} ciclo${summary.samples === 1 ? "" : "s"} medidos · media ${summary.avgCycle} d` : "aún sin ciclos completos"}
              {summary.avgBleed ? ` · sangrado ${String(summary.avgBleed).replace(".", ",")} d` : ""}
            </span>
          </div>
          <div className="ft-dc-list">
            {summary.cycles.length === 0
              ? <div className="ft-dc-empty">Cuando registres el inicio de dos periodos, aquí se dibuja cada ciclo con sus fases.</div>
              : summary.cycles.slice(0, 6).map((cycle) => (
                <div key={cycle.start} className="ft-dc-row" style={{ cursor: "default", display: "block", padding: "11px 14px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <span className="nm">Desde el {fecha(cycle.start)}</span>
                    <span className="mt" style={{ margin: 0 }}>
                      {[
                        cycle.length ? `${cycle.length} d` : "en curso",
                        cycle.bleedDays ? `${cycle.bleedDays} d de sangrado` : null,
                        cycle.ovulation?.date ? `ovulación ~${fecha(cycle.ovulation.date)}` : null,
                      ].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  <PhaseBar segments={cycle.segments} />
                </div>
              ))}
          </div>
          {summary.outliers > 0 && (
            <div className="ft-dc-quiet" style={{ cursor: "default" }}>
              <span className="dot" />
              <span style={{ flex: 1 }}>
                {summary.outliers} ciclo{summary.outliers === 1 ? "" : "s"} fuera del rango 18–45 días quedan fuera de la media. Suele ser un inicio sin registrar, no un ciclo raro.
              </span>
            </div>
          )}

          <div className="ft-dc-empty" style={{ paddingLeft: 2 }}>
            Las fases son estimaciones para autoconocimiento y seguimiento. No es diagnóstico médico ni método anticonceptivo.
          </div>
        </>
      )}
    </Marco>
  );
}
