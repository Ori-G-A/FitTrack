import React, { useEffect, useRef, useState } from "react";
import { Camera, Check, Droplet, Moon, Ruler, Scale, Sparkles, Trash2 } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CYCLE_PHASES } from "./app-config.js";
import { addDays, cycleInfo, daysBetween, localISO } from "./app-utils.js";
import { CLEAR_BLEEDING_LEVELS, emptyMenstrualLog, getCycleInsights, inferCyclePhase, normalizeMenstrualLog } from "./cycle-inference.js";
import { ScreenMast } from "./EditorialUI.jsx";
import { compressImage, deletePhotoFile, uploadPhotoData, validatePhotoFile } from "./photo-storage.js";

const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => localISO();
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
const BLEEDING_OPTIONS = [
  ["not_logged", "Sin registrar"],
  ["none", "No hubo"],
  ["spotting", "Manchado"],
  ["light", "Leve"],
  ["medium", "Medio"],
  ["heavy", "Abundante"],
];
const FLUID_OPTIONS = [
  ["not_checked", "No revise"],
  ["dry", "Seco"],
  ["sticky", "Pegajoso"],
  ["creamy", "Cremoso"],
  ["watery", "Acuoso"],
  ["slippery_eggwhite", "Elastico / resbaladizo"],
  ["unknown", "No se"],
];
const APPETITE_OPTIONS = [
  ["not_logged", "Sin registrar"],
  ["normal", "Normal"],
  ["increased", "Mas hambre"],
  ["decreased", "Menos hambre"],
  ["sweet_cravings", "Antojos dulces"],
  ["salty_cravings", "Antojos salados"],
];
const PAIN_OPTIONS = [
  ["not_logged", "Sin registrar"],
  ["none", "No"],
  ["left", "Izquierdo"],
  ["right", "Derecho"],
  ["center", "Centro"],
  ["general", "General"],
];
const PHASE_NAMES = {
  menstruation: "menstruacion",
  follicular_early: "folicular temprana",
  follicular_mid_late: "folicular media/tardia",
  fertile_window_probable: "ventana fertil probable",
  ovulation_probable: "ovulacion probable",
  luteal_early: "lutea temprana",
  luteal_mid: "lutea media",
  luteal_late: "lutea tardia",
  unknown: "por estimar",
};
const CONFIDENCE_NAMES = { low: "baja", medium: "media", high: "alta" };

export default function BodyScreen({ weights, setWeights, measurements, setMeasurements, wellness, setWellness, periods, setPeriods, menstrualLogs = [], setMenstrualLogs = () => {}, photos, setPhotos, goals, setGoals, userId }) {
  // ponytail: saturación de creatina modelada, no medida. τ=7d → ~98% a 28d;
  // +1.5 kg agua a plena carga (rango típico 1-2 kg). Ajusta si tu báscula dice otra cosa.
  const creatineStart = goals?.creatineStart || "";
  const creaDays = creatineStart ? Math.max(0, daysBetween(creatineStart, todayISO())) : null;
  const creaSat = creaDays == null ? null : Math.min(100, Math.round(100 * (1 - Math.exp(-creaDays / 7))));
  const creaWater = creaSat == null ? null : (creaSat / 100 * 1.5).toFixed(1);
  const creaFull = creatineStart ? addDays(creatineStart, 28) : null;
  const [wDate, setWDate] = useState(todayISO()); const [kg, setKg] = useState("");
  const addW = () => { if (!kg) return; setWeights((p) => [...p.filter((w) => w.date !== wDate), { id: uid(), date: wDate, kg: Number(kg) }].sort((a, b) => a.date.localeCompare(b.date))); setKg(""); };
  const delW = (id) => setWeights((p) => p.filter((w) => w.id !== id));
  const wSorted = [...weights].sort((a, b) => b.date.localeCompare(a.date));
  const wChart = [...weights].sort((a, b) => a.date.localeCompare(b.date)).map((w) => ({ date: fmtDate(w.date), kg: w.kg }));

  const [mDate, setMDate] = useState(todayISO());
  const [meas, setMeas] = useState({ cintura: "", cadera: "", pecho: "", brazo: "", muslo: "" });
  const addM = () => {
    const vals = Object.fromEntries(Object.entries(meas).map(([k, v]) => [k, v === "" ? null : Number(v)]));
    if (Object.values(vals).every((v) => v === null)) return;
    setMeasurements((p) => [...p.filter((x) => x.date !== mDate), { id: uid(), date: mDate, ...vals }].sort((a, b) => a.date.localeCompare(b.date)));
    setMeas({ cintura: "", cadera: "", pecho: "", brazo: "", muslo: "" });
  };
  const delM = (id) => setMeasurements((p) => p.filter((x) => x.id !== id));
  const mSorted = [...measurements].sort((a, b) => b.date.localeCompare(a.date));
  const cinturaChart = [...measurements].filter((m) => m.cintura != null).sort((a, b) => a.date.localeCompare(b.date)).map((m) => ({ date: fmtDate(m.date), cintura: m.cintura }));

  const [welDate, setWelDate] = useState(todayISO());
  const existingWel = wellness.find((w) => w.date === welDate);
  const [wel, setWel] = useState({ sleep: "", energy: 0, notes: "" });
  useEffect(() => { setWel(existingWel ? { sleep: existingWel.sleep ?? "", energy: existingWel.energy ?? 0, notes: existingWel.notes ?? "" } : { sleep: "", energy: 0, notes: "" }); }, [welDate]); // eslint-disable-line
  const saveWel = () => {
    if (wel.sleep === "" && !wel.energy && !wel.notes.trim()) return;
    setWellness((p) => [...p.filter((x) => x.date !== welDate), { id: uid(), date: welDate, sleep: wel.sleep === "" ? null : Number(wel.sleep), energy: wel.energy || null, notes: wel.notes.trim() }].sort((a, b) => a.date.localeCompare(b.date)));
  };
  const welSorted = [...wellness].sort((a, b) => b.date.localeCompare(a.date));

  const [pDate, setPDate] = useState(todayISO());
  const [pDur, setPDur] = useState("5");
  const addPeriod = () => { setPeriods((p) => [...p.filter((x) => x.date !== pDate), { id: uid(), date: pDate, duration: Number(pDur) || 5 }].sort((a, b) => a.date.localeCompare(b.date))); };
  const delPeriod = (id) => setPeriods((p) => p.filter((x) => x.id !== id));
  const cyc = cycleInfo(periods);
  const pSorted = [...periods].sort((a, b) => b.date.localeCompare(a.date));
  const fmtNext = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  const [cycleDate, setCycleDate] = useState(todayISO());
  const existingCycleLog = menstrualLogs.find((log) => log.date === cycleDate);
  const [cycleLog, setCycleLog] = useState(emptyMenstrualLog(cycleDate));
  useEffect(() => { setCycleLog(existingCycleLog ? normalizeMenstrualLog(existingCycleLog) : emptyMenstrualLog(cycleDate)); }, [cycleDate, existingCycleLog?.updatedAt]); // eslint-disable-line
  const phaseEstimate = inferCyclePhase({ date: cycleDate, menstrualLogs, periods, wellness });
  const cycleInsights = getCycleInsights({ menstrualLogs, periods, wellness });
  const menstrualSorted = [...menstrualLogs].sort((a, b) => b.date.localeCompare(a.date));
  const saveCycleLog = () => {
    const now = new Date();
    const normalized = normalizeMenstrualLog({ ...cycleLog, id: existingCycleLog?.id || cycleLog.id || uid(), date: cycleDate, createdAt: existingCycleLog?.createdAt }, now);
    setMenstrualLogs((prev) => [...prev.filter((item) => item.date !== cycleDate), normalized].sort((a, b) => a.date.localeCompare(b.date)));
    const previousClearBleeding = menstrualLogs.some((item) => CLEAR_BLEEDING_LEVELS.includes(item.bleedingLevel) && daysBetween(item.date, cycleDate) > 0 && daysBetween(item.date, cycleDate) <= 2);
    const coveredByPeriod = periods.some((period) => cycleDate >= period.date && cycleDate <= addDays(period.date, (Number(period.duration) || 5) - 1));
    if (CLEAR_BLEEDING_LEVELS.includes(normalized.bleedingLevel) && !previousClearBleeding && !coveredByPeriod) {
      setPeriods((prev) => [...prev.filter((item) => item.date !== cycleDate), { id: uid(), date: cycleDate, duration: Number(pDur) || 5 }].sort((a, b) => a.date.localeCompare(b.date)));
    }
  };
  const delCycleLog = (id) => setMenstrualLogs((prev) => prev.filter((item) => item.id !== id));

  const photoRef = useRef();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState("");
  const addPhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoBusy(true); setPhotoErr("");
    try {
      validatePhotoFile(file);
      const dataUrl = await compressImage(file);
      const photo = await uploadPhotoData(userId, { id: uid(), date: todayISO(), dataUrl });
      setPhotos((p) => [photo, ...p]);
    } catch (error) { console.error("addPhoto", error); setPhotoErr(error?.message || "No se pudo guardar la imagen de forma segura."); }
    setPhotoBusy(false); if (photoRef.current) photoRef.current.value = "";
  };
  const delPhoto = async (photo) => {
    setPhotoErr("");
    if (photo.storagePath) {
      try { await deletePhotoFile(photo); }
      catch (error) { console.error("delPhoto", error); setPhotoErr("No se pudo eliminar la imagen."); return; }
    }
    setPhotos((p) => p.filter((x) => x.id !== photo.id));
  };
  const pSortedPhotos = [...photos].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <ScreenMast kicker="FITTRACK · CUERPO" title="Cuerpo" />
      <div style={{ height: 16 }} />
      <div className="ft-card">
        <h2><Scale size={16} /> Peso corporal</h2>
        <div className="ft-row">
          <div className="ft-field"><label>Fecha</label><input className="ft-input ft-mono" type="date" value={wDate} onChange={(e) => setWDate(e.target.value)} /></div>
          <div className="ft-field"><label>Peso (kg)</label><input className="ft-input ft-mono" type="number" inputMode="decimal" step="0.1" placeholder="0.0" value={kg} onChange={(e) => setKg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addW()} /></div>
          <button className="ft-btn" onClick={addW}><Check size={15} /> Guardar</button>
        </div>
        {wChart.length >= 2 && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={wChart} margin={{ top: 14, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(22,20,13,0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#6a655a" tick={{ fill: "#6a655a" }} /><YAxis stroke="#6a655a" tick={{ fill: "#6a655a" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#faf7f0", border: "1px solid rgba(22,20,13,0.16)", borderRadius: 0, fontFamily: "'IBM Plex Mono'", fontSize: 12 }} />
              <Line type="monotone" dataKey="kg" stroke="#e7531c" strokeWidth={2.5} dot={{ r: 3, fill: "#e7531c" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {wSorted.length > 0 && (
          <div className="ft-list" style={{ marginTop: 12 }}>
            {wSorted.slice(0, 8).map((w, i) => {
              const prev = wSorted[i + 1]; const diff = prev ? w.kg - prev.kg : null;
              return (<div className="ft-li" key={w.id}><span className="li-d">{fmtDate(w.date)}</span><span className="li-main ft-mono">{w.kg.toFixed(1)} kg</span>
                {diff !== null && <span className="li-sub" style={{ color: diff <= 0 ? "var(--ok)" : "var(--danger)" }}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}</span>}
                <button className="ft-trash" onClick={() => delW(w.id)}><Trash2 size={15} /></button></div>);
            })}
          </div>
        )}
      </div>

      <div className="ft-card">
        <h2><Droplet size={16} /> Creatina <span className="tag">5 g/día</span></h2>
        <div className="ft-row" style={{ marginBottom: creaSat == null ? 0 : 12 }}>
          <div className="ft-field"><label>Inicio suplementación</label><input className="ft-input ft-mono" type="date" max={todayISO()} value={creatineStart} onChange={(e) => setGoals((g) => ({ ...g, creatineStart: e.target.value }))} /></div>
        </div>
        {creaSat != null && (
          <div className="ft-stats" style={{ marginBottom: 0 }}>
            <div className="ft-stat"><div className="k">Reservas (est.)</div><div className="v">{creaSat}<small>%</small></div><div className="sub">día {creaDays} de carga</div></div>
            <div className="ft-stat"><div className="k">Peso por agua (est.)</div><div className="v">+{creaWater}<small>kg</small></div><div className="sub">retención intramuscular</div></div>
            <div className="ft-stat"><div className="k">Carga completa</div><div className="v" style={{ fontSize: 20 }}>{creaSat >= 98 ? "Lograda" : fmtDate(creaFull)}</div><div className="sub">~28 días a 5 g/día</div></div>
          </div>
        )}
      </div>

      <div className="ft-card">
        <h2><Droplet size={16} /> Ciclo menstrual {cyc && <span className="tag">día {cyc.day} · ciclo ~{cyc.avgCycle}d</span>}</h2>
        <div className="ft-row" style={{ marginBottom: 10 }}>
          <div className="ft-field"><label>Inicio del periodo</label><input className="ft-input ft-mono" type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} /></div>
          <div className="ft-field" style={{ maxWidth: 150 }}><label>Días de sangrado</label><input className="ft-input ft-mono" type="number" inputMode="numeric" value={pDur} onChange={(e) => setPDur(e.target.value)} /></div>
          <button className="ft-btn" onClick={addPeriod}><Check size={15} /> Registrar inicio</button>
        </div>
        {cyc ? (
          <div className="ft-alert" style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${CYCLE_PHASES[cyc.phase].color}55`, marginBottom: 0 }}>
            <Droplet size={20} color={CYCLE_PHASES[cyc.phase].color} />
            <div>
              <div className="t">Fase actual: {cyc.phase}{cyc.samples === 0 ? " (estimada sobre 28 días)" : ""}</div>
              <div className="b">{CYCLE_PHASES[cyc.phase].note} {cyc.daysToNext >= 0 ? `Próximo periodo estimado: ${fmtNext(cyc.nextDate)} (~${cyc.daysToNext} días).` : `Tu periodo lleva ~${Math.abs(cyc.daysToNext)} días de retraso respecto a tu media.`}</div>
            </div>
          </div>
        ) : (
          <div className="ft-empty" style={{ padding: "18px 8px" }}>Registra el inicio de tu periodo para ver tu fase actual y la predicción del siguiente. Con 2-3 ciclos las estimaciones se ajustan a ti.</div>
        )}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <div className="ft-alert info" style={{ marginBottom: 12 }}>
            <Sparkles size={20} color="var(--blue)" />
            <div>
              <div className="t">Las fases son estimaciones</div>
              <div className="b">Esta herramienta sirve para autoconocimiento y seguimiento personal; no es diagnostico medico ni metodo anticonceptivo.</div>
            </div>
          </div>
          <h3 className="ft-h3" style={{ marginBottom: 10 }}>Check-in menstrual</h3>
          <div className="ft-row" style={{ marginBottom: 10 }}>
            <div className="ft-field"><label>Fecha</label><input className="ft-input ft-mono" type="date" value={cycleDate} onChange={(e) => setCycleDate(e.target.value)} /></div>
            <div className="ft-field"><label>Sangrado</label><select className="ft-select" value={cycleLog.bleedingLevel} onChange={(e) => setCycleLog({ ...cycleLog, bleedingLevel: e.target.value, hasSpotting: e.target.value === "spotting" })}>{BLEEDING_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div className="ft-field"><label>Como estuvo tu flujo</label><select className="ft-select" value={cycleLog.cervicalFluid} onChange={(e) => setCycleLog({ ...cycleLog, cervicalFluid: e.target.value })}>{FLUID_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <button className="ft-btn" onClick={saveCycleLog}><Check size={15} /> Guardar ciclo</button>
          </div>
          <div className="ft-row" style={{ marginBottom: 10 }}>
            <div className="ft-field"><label>Colicos 0-10</label><input className="ft-input ft-mono" type="number" min="0" max="10" inputMode="numeric" value={cycleLog.crampsLevel} onChange={(e) => setCycleLog({ ...cycleLog, crampsLevel: e.target.value })} /></div>
            <div className="ft-field"><label>Sensibilidad senos</label><select className="ft-select" value={cycleLog.breastSensitivity} onChange={(e) => setCycleLog({ ...cycleLog, breastSensitivity: e.target.value })}>{[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
            <div className="ft-field"><label>Hinchazon</label><select className="ft-select" value={cycleLog.bloatingLevel} onChange={(e) => setCycleLog({ ...cycleLog, bloatingLevel: e.target.value })}>{[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
            <div className="ft-field"><label>Acne</label><select className="ft-select" value={cycleLog.acneLevel} onChange={(e) => setCycleLog({ ...cycleLog, acneLevel: e.target.value })}>{[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          </div>
          <div className="ft-row" style={{ marginBottom: 10 }}>
            <div className="ft-field"><label>Apetito</label><select className="ft-select" value={cycleLog.appetiteChange} onChange={(e) => setCycleLog({ ...cycleLog, appetiteChange: e.target.value })}>{APPETITE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div className="ft-field"><label>Dolor pelvico</label><select className="ft-select" value={cycleLog.pelvicPain} onChange={(e) => setCycleLog({ ...cycleLog, pelvicPain: e.target.value })}>{PAIN_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div className="ft-field" style={{ flex: 2 }}><label>Notas</label><input className="ft-input" placeholder="Opcional" value={cycleLog.notes} onChange={(e) => setCycleLog({ ...cycleLog, notes: e.target.value })} /></div>
          </div>
          <div className="ft-alert" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(22,20,13,.16)", marginBottom: 12 }}>
            <Droplet size={20} color="var(--accent)" />
            <div>
              <div className="t">Fase estimada: {PHASE_NAMES[phaseEstimate.phase]} · confianza {CONFIDENCE_NAMES[phaseEstimate.confidence]}</div>
              <div className="b">{phaseEstimate.reason}</div>
            </div>
          </div>
          {cycleInsights.length > 0 && (
            <div className="ft-list" style={{ marginTop: 12 }}>
              {cycleInsights.slice(0, 2).map((insight) => (
                <div className="ft-li" key={insight.type}>
                  <span className="li-main">{insight.message}</span>
                  <span className="li-sub">confianza {CONFIDENCE_NAMES[insight.confidence]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {pSorted.length > 0 && (
          <div className="ft-list" style={{ marginTop: 12 }}>
            {pSorted.slice(0, 6).map((p, i) => {
              const next = pSorted[i - 1]; // el periodo siguiente (más reciente) en lista descendente
              const len = next ? daysBetween(p.date, next.date) : null;
              return (<div className="ft-li" key={p.id}><span className="li-d">{fmtDate(p.date)}</span><span className="li-main">Inicio de periodo</span><span className="li-sub">{p.duration} días{len ? ` · ciclo ${len}d` : i === 0 ? " · ciclo en curso" : ""}</span><button className="ft-trash" onClick={() => delPeriod(p.id)}><Trash2 size={15} /></button></div>);
            })}
          </div>
        )}
        {menstrualSorted.length > 0 && (
          <div className="ft-list" style={{ marginTop: 12 }}>
            {menstrualSorted.slice(0, 6).map((log) => (
              <div className="ft-li" key={log.id}>
                <span className="li-d">{fmtDate(log.date)}</span>
                <span className="li-main">Sangrado: {BLEEDING_OPTIONS.find(([value]) => value === log.bleedingLevel)?.[1] || log.bleedingLevel}</span>
                <span className="li-sub">flujo {FLUID_OPTIONS.find(([value]) => value === log.cervicalFluid)?.[1] || log.cervicalFluid}</span>
                <button className="ft-trash" onClick={() => delCycleLog(log.id)}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ft-card">
        <h2><Ruler size={16} /> Medidas corporales <span className="tag">cm</span></h2>
        <div className="ft-row" style={{ marginBottom: 10 }}>
          <div className="ft-field"><label>Fecha</label><input className="ft-input ft-mono" type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} /></div>
        </div>
        <div className="ft-row">
          {["cintura", "cadera", "pecho", "brazo", "muslo"].map((k) => (
            <div className="ft-field" key={k}><label>{k}</label><input className="ft-input ft-mono" type="number" inputMode="decimal" step="0.1" placeholder="–" value={meas[k]} onChange={(e) => setMeas({ ...meas, [k]: e.target.value })} /></div>
          ))}
          <button className="ft-btn" onClick={addM}><Check size={15} /></button>
        </div>
        {cinturaChart.length >= 2 && (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cinturaChart} margin={{ top: 16, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(22,20,13,0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#6a655a" tick={{ fill: "#6a655a" }} /><YAxis stroke="#6a655a" tick={{ fill: "#6a655a" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#faf7f0", border: "1px solid rgba(22,20,13,0.16)", borderRadius: 0, fontFamily: "'IBM Plex Mono'", fontSize: 12 }} />
              <Line type="monotone" dataKey="cintura" stroke="#5ad1ff" strokeWidth={2.5} dot={{ r: 3, fill: "#5ad1ff" }} name="Cintura" />
            </LineChart>
          </ResponsiveContainer>
        )}
        {mSorted.length > 0 && (
          <div className="ft-list" style={{ marginTop: 12 }}>
            {mSorted.slice(0, 6).map((m) => (
              <div className="ft-li" key={m.id}><span className="li-d">{fmtDate(m.date)}</span>
                <span className="li-sub" style={{ flex: 1 }}>{["cintura", "cadera", "pecho", "brazo", "muslo"].filter((k) => m[k] != null).map((k) => `${k} ${m[k]}`).join(" · ")}</span>
                <button className="ft-trash" onClick={() => delM(m.id)}><Trash2 size={15} /></button></div>
            ))}
          </div>
        )}
      </div>

      <div className="ft-card">
        <h2><Moon size={16} /> Bienestar diario</h2>
        <div className="ft-row" style={{ marginBottom: 10 }}>
          <div className="ft-field"><label>Fecha</label><input className="ft-input ft-mono" type="date" value={welDate} onChange={(e) => setWelDate(e.target.value)} /></div>
          <div className="ft-field"><label>Horas de sueño</label><input className="ft-input ft-mono" type="number" inputMode="decimal" step="0.5" placeholder="0" value={wel.sleep} onChange={(e) => setWel({ ...wel, sleep: e.target.value })} /></div>
        </div>
        <label style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>Energía / cómo te sentiste</label>
        <div className="ft-energy" style={{ marginTop: 6, marginBottom: 12 }}>
          {[1, 2, 3, 4, 5].map((n) => <button key={n} className={wel.energy === n ? "on" : ""} onClick={() => setWel({ ...wel, energy: n })}>{n}</button>)}
        </div>
        <textarea className="ft-input" placeholder="Notas del día (dormí mal, viaje, enfermo…)" value={wel.notes} onChange={(e) => setWel({ ...wel, notes: e.target.value })} />
        <div style={{ marginTop: 12 }}><button className="ft-btn" onClick={saveWel}><Check size={15} /> Guardar bienestar</button></div>
        {welSorted.length > 0 && (
          <div className="ft-list" style={{ marginTop: 14 }}>
            {welSorted.slice(0, 6).map((w) => (
              <div className="ft-li" key={w.id}><span className="li-d">{fmtDate(w.date)}</span>
                <span className="li-sub">{w.sleep != null ? `${w.sleep}h` : ""} {w.energy ? `· energía ${w.energy}/5` : ""}</span>
                {w.notes && <span className="li-main" style={{ fontWeight: 400, fontStyle: "italic", color: "var(--muted)" }}>“{w.notes}”</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ft-card">
        <h2><Camera size={16} /> Fotos de progreso <span className="tag">{photos.length}</span></h2>
        <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden onChange={addPhoto} />
        <button className="ft-btn" onClick={() => photoRef.current.click()} disabled={photoBusy}><Camera size={15} /> {photoBusy ? "Procesando…" : "Subir foto de hoy"}</button>
        {photoErr && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>{photoErr}</div>}
        <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 10, marginBottom: 0 }}>Las fotos se comprimen y se guardan en un espacio privado de Supabase. Se incluyen también en tu copia de seguridad al exportar.</p>
        {pSortedPhotos.length > 0 && (
          <div className="ft-photos">
            {pSortedPhotos.map((ph) => (
              <div className="ft-photo" key={ph.id}>
                <img src={ph.dataUrl || ph.signedUrl} alt={ph.date} />
                <span className="cap">{fmtDate(ph.date)}</span>
                <button className="ft-photo-del" onClick={() => delPhoto(ph)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
