import React, { useMemo, useState } from "react";
import { CATALOG, round1, uid } from "./FitTrack.jsx";
import { localISO, addDays, proteinAdherence } from "./app-utils.js";
import { PROTEIN_CONFIG } from "./fase1Config.js";
import { useIsMobile } from "./EditorialUI.jsx";
import { toast } from "./toast.jsx";

// Registrar una comida: primero se elige qué, después cuánto. El paso de cantidad
// es obligatorio y no se salta — sin él se registran raciones inventadas y los
// macros del día dejan de significar nada.
//
// En móvil el prototipo lo resuelve con dos pantallas. En escritorio la búsqueda
// se queda a la izquierda y la cantidad ocupa el panel derecho, así que se ve de
// dónde salen los gramos que estás escribiendo.

// Las comidas del dia salen de cuantas hayas elegido en Ajustes, no de una lista
// fija: los nombres y el reparto de proteina ya viven juntos en PROTEIN_CONFIG y
// tenerlos dos veces era garantizar que un dia dejaran de coincidir.
const mealsFor = (goals) => PROTEIN_CONFIG.mealLabels[goals?.proteinMeals ?? PROTEIN_CONFIG.mealsPerDay]
  || PROTEIN_CONFIG.mealLabels[PROTEIN_CONFIG.mealsPerDay];
const TABS = [["buscar", "BUSCAR"], ["mios", "MÍOS"], ["recetas", "RECETAS"], ["recientes", "RECIENTES"]];
const num = (value) => String(Math.round(Number(value) * 10) / 10).replace(".", ",");
const kcalFmt = (value) => Math.round(value).toLocaleString("es-ES");
const fecha = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" });
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const empty = () => ({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
const add = (a, b) => ({ kcal: a.kcal + (+b.kcal || 0), protein: a.protein + (+b.protein || 0), carbs: a.carbs + (+b.carbs || 0), fat: a.fat + (+b.fat || 0) });
const times = (macros, factor) => ({ kcal: macros.kcal * factor, protein: macros.protein * factor, carbs: macros.carbs * factor, fat: macros.fat * factor });
const macroLine = (m) => `${kcalFmt(m.kcal)} kcal · P ${num(m.protein)} · C ${num(m.carbs)} · G ${num(m.fat)}`;

// Todo lo elegible se normaliza a lo mismo: un nombre, una unidad y los macros de
// UNA unidad de esa medida. Así la pantalla de cantidad no sabe si viene de la
// biblioteca, del catálogo, de una receta o de algo que ya comiste.
const fromFood = (food) => {
  const per = { kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat };
  return {
    key: `f-${food.id || food.name}`, name: food.name, unit: food.unit || "g", step: 100, base: 100, per,
    line: `${macroLine(per)} /100${food.unit || "g"}`,
  };
};
const fromRecipe = (recipe) => {
  const total = recipe.items.reduce(add, empty());
  const perServing = times(total, 1 / (recipe.servings || 1));
  return {
    key: `r-${recipe.id}`, name: recipe.name, unit: "porción", step: 1, base: 1, per: times(perServing, 100), recipe,
    line: `${macroLine(perServing)} por porción`,
  };
};
// Una entrada ya registrada: si tenía gramos se recupera la ración base; si no
// (una receta o algo escrito a mano) se vuelve a ofrecer entera.
const fromEntry = (entry) => {
  const grams = Number(entry.grams);
  const macros = { kcal: +entry.kcal || 0, protein: +entry.protein || 0, carbs: +entry.carbs || 0, fat: +entry.fat || 0 };
  if (grams > 0) {
    const per = times(macros, 100 / grams);
    return {
      key: `h-${entry.id}`, name: entry.name, unit: entry.unit || "g", step: 100, base: 100, per, lastQty: grams,
      line: `${macroLine(per)} /100${entry.unit || "g"}`,
    };
  }
  // Sin gramos (una receta o algo escrito a mano) la ración es la unidad: los
  // macros de la lista son los de la entrada, no los de 100 raciones.
  return {
    key: `h-${entry.id}`, name: entry.name, unit: "ración", step: 1, base: 1, per: times(macros, 100), lastQty: 1,
    line: `${macroLine(macros)} por ración`,
  };
};

function AmountPanel({ pick, date, meals, onSave, onClose }) {
  // Cuatro cifras en 84 px cada una no se leen: en movil van de dos en dos.
  const isMobile = useIsMobile();
  const [qty, setQty] = useState(String(pick.lastQty ?? pick.base));
  const [meal, setMeal] = useState(meals[0]);
  const amount = Number(String(qty).replace(",", "."));
  const valid = amount > 0;
  const macros = valid ? times(pick.per, amount / 100) : null;
  const bump = (delta) => setQty(String(Math.max(0, Math.round((amount || 0) + delta))));

  return (
    <div className="ft-dc-card" style={{ marginTop: 0 }}>
      <div className="h"><span>Cuánto</span><span>{pick.name}</span></div>

      <label className="ft-lib-field">
        <span>Cantidad en {pick.unit}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="ft-dc-step" aria-label="Menos" onClick={() => bump(-(pick.step === 1 ? 1 : 10))}>−</button>
          <input className="ft-input ft-mono" style={{ textAlign: "center" }} inputMode="decimal" value={qty}
            onChange={(event) => setQty(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && valid && onSave({ ...macros, qty: amount, meal })} autoFocus />
          <button className="ft-dc-step" aria-label="Más" onClick={() => bump(pick.step === 1 ? 1 : 10)}>+</button>
        </div>
      </label>

      {pick.step !== 1 && (
        <div className="ft-dc-chips" style={{ paddingTop: 0 }}>
          {[50, 100, 150, 200].map((preset) => (
            <button key={preset} className={amount === preset ? "on" : ""} onClick={() => setQty(String(preset))}>{preset} {pick.unit}</button>
          ))}
        </div>
      )}

      <label className="ft-lib-field">
        <span>Comida del día</span>
        <div className="ft-dc-chips" style={{ paddingTop: 0 }}>
          {meals.map((option) => (
            <button key={option} className={meal === option ? "on" : ""} onClick={() => setMeal(option)}>{option.toUpperCase()}</button>
          ))}
        </div>
      </label>

      <div className="ft-dc-strip" style={{ "--cols": isMobile ? 2 : 4, border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
        {[["KCAL", macros ? kcalFmt(macros.kcal) : "—"], ["PROT", macros ? num(macros.protein) : "—"],
          ["CARB", macros ? num(macros.carbs) : "—"], ["GRASA", macros ? num(macros.fat) : "—"]].map(([label, value]) => (
          <div key={label}><span className="k">{label}</span><span className="v" style={{ fontSize: 19 }}>{value}</span></div>
        ))}
      </div>

      <div className="ft-dc-acts">
        <button className="ft-dc-btn" disabled={!valid} onClick={() => onSave({ ...macros, qty: amount, meal })}>
          Registrar en {cap(fecha(date).split(",")[0])}
        </button>
        <button className="ft-dc-btn ghost" onClick={onClose}>Cancelar</button>
      </div>
      {!valid && <div className="n">Escribe una cantidad: sin ella no se puede registrar, y una ración inventada arruina los macros del día.</div>}
    </div>
  );
}

export default function NutritionScreen({ nutrition, setNutrition, foods = [], recipes = [], goals = {}, setTab, initialDate }) {
  const [date, setDate] = useState(initialDate || localISO());
  const [adding, setAdding] = useState(false);
  const [tab, setTab_] = useState("mios");
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState(null);
  const isMobile = useIsMobile();

  const meals = mealsFor(goals);
  const dayItems = nutrition.filter((entry) => entry.date === date);
  const sum = dayItems.reduce(add, empty());
  const adherence = useMemo(() => proteinAdherence(nutrition, goals.proteinTarget, date), [nutrition, goals.proteinTarget, date]);

  const matches = (text) => text.toLowerCase().includes(query.trim().toLowerCase());
  // Recientes: un nombre una vez, lo último primero. Es el atajo que evita volver
  // a buscar lo que comes todos los días.
  const recent = useMemo(() => {
    const seen = new Set();
    return [...nutrition].sort((a, b) => b.date.localeCompare(a.date))
      .filter((entry) => { const key = entry.name.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; })
      .slice(0, 20);
  }, [nutrition]);

  const options = {
    buscar: CATALOG.filter((item) => matches(item.name)).slice(0, 60).map(fromFood),
    mios: foods.filter((food) => matches(food.name)).map(fromFood),
    recetas: recipes.filter((recipe) => matches(recipe.name)).map(fromRecipe),
    recientes: recent.filter((entry) => matches(entry.name)).map(fromEntry),
  }[tab];

  const save = ({ kcal, protein, carbs, fat, qty, meal }) => {
    setNutrition((current) => [...current, {
      id: uid(), date, name: pick.name, meal,
      grams: pick.unit === "porción" || pick.unit === "ración" ? null : qty,
      unit: pick.unit, kcal: round1(kcal), protein: round1(protein), carbs: round1(carbs), fat: round1(fat),
    }]);
    toast(`${pick.name} · ${kcalFmt(kcal)} kcal en ${meal.toLowerCase()}`);
    setPick(null); setAdding(false); setQuery("");
  };

  const kcalTarget = Number(goals.kcalTarget) || 0;
  const proteinTarget = Number(goals.proteinTarget) || 0;
  const shift = (days) => { setDate(addDays(date, days)); setPick(null); };

  // Agrupado por comida del dia. Lo que se registro con otro reparto (o antes de
  // que hubiera reparto) no desaparece: sale detras, con su etiqueta o sin ella.
  const extras = [...new Set(dayItems.map((entry) => entry.meal).filter((meal) => meal && !meals.includes(meal)))];
  const groups = [...meals, ...extras, null].map((meal) => ({
    meal, items: dayItems.filter((entry) => (entry.meal || null) === meal),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="ft-dc">
      <div className="ft-dc-head">
        <div>
          <h1>Nutrición</h1>
          <span className="sub">{cap(fecha(date))}{date === localISO() ? " · hoy" : ""}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="ft-dc-step" aria-label="Día anterior" onClick={() => shift(-1)}>‹</button>
          {/* Planificar el jueves eran ocho flechas. El selector nativo del
              navegador ya sabe hacer esto: un calendario, cero dependencias. */}
          <input className="ft-input ft-mono ft-dc-date" type="date" value={date} aria-label="Ir a otro día"
            onChange={(event) => { if (event.target.value) { setDate(event.target.value); setPick(null); } }} />
          <button className="ft-dc-step" aria-label="Día siguiente" onClick={() => shift(1)}>›</button>
          <button className="ft-dc-btn" onClick={() => { setAdding(true); setPick(null); }}>Añadir comida</button>
        </div>
      </div>

      <div className="ft-dc-strip" style={{ "--cols": isMobile ? 2 : 4 }}>
        <div>
          <span className="k">KCAL</span>
          <span className="v">{kcalFmt(sum.kcal)}</span>
          <span className="d">{kcalTarget ? `de ${kcalFmt(kcalTarget)}` : "sin objetivo"}</span>
        </div>
        <div>
          <span className="k">PROTEÍNA</span>
          <span className="v">{Math.round(sum.protein)}<small>g</small></span>
          <span className="d" style={proteinTarget && sum.protein >= proteinTarget * 0.9 ? { color: "var(--ok)" } : undefined}>
            {proteinTarget ? `de ${proteinTarget} g` : "sin objetivo"}
          </span>
        </div>
        <div><span className="k">CARBOS</span><span className="v">{Math.round(sum.carbs)}<small>g</small></span><span className="d">del día</span></div>
        <div><span className="k">GRASA</span><span className="v">{Math.round(sum.fat)}<small>g</small></span><span className="d">del día</span></div>
      </div>

      {adherence && adherence.onTarget < adherence.logged && (
        <div className="ft-dc-quiet" style={{ cursor: "default" }}>
          <span className="dot" />
          <span style={{ flex: 1 }}>Proteína {adherence.avg} g de media · {adherence.onTarget} de {adherence.logged} días en objetivo</span>
        </div>
      )}

      {adding && (
        <div className={pick ? "ft-lib open" : "ft-lib"}>
          <div className="ft-lib-list">
            <div className="ft-dc-chips">
              {TABS.map(([key, label]) => (
                <button key={key} className={tab === key ? "on" : ""} onClick={() => { setTab_(key); setPick(null); }}>{label}</button>
              ))}
              <button className="ft-dc-chip" style={{ marginLeft: "auto" }} onClick={() => { setAdding(false); setPick(null); setQuery(""); }}>CERRAR</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", borderRadius: 10, background: "color-mix(in srgb,var(--text) 5%,transparent)" }}>
              <input className="ft-dc-search" value={query} onChange={(event) => setQuery(event.target.value)}
                placeholder={tab === "recetas" ? "Buscar receta" : "Buscar alimento"} aria-label="Buscar qué registrar" autoFocus />
              {query && <button className="ft-dc-chip" onClick={() => setQuery("")}>LIMPIAR</button>}
            </div>

            <div className="ft-dc-list" style={{ marginTop: 12 }}>
              {options.length === 0 ? (
                <div className="ft-dc-empty">
                  {tab === "mios" && foods.length === 0
                    ? <>Sin alimentos guardados. <button className="ft-dc-chip" onClick={() => setTab("biblioteca")}>IR A LA BIBLIOTECA</button></>
                    : tab === "recetas" && recipes.length === 0
                      ? <>Sin recetas guardadas. <button className="ft-dc-chip" onClick={() => setTab("biblioteca")}>CREAR UNA</button></>
                      : "Nada coincide."}
                </div>
              ) : options.map((option) => (
                <button key={option.key} className={pick?.key === option.key ? "ft-dc-row sel" : "ft-dc-row"} onClick={() => setPick(option)}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="nm" style={{ display: "block" }}>{option.name}</span>
                    <span className="mt" style={{ display: "block" }}>{option.line}</span>
                  </span>
                  <span className="go">›</span>
                </button>
              ))}
            </div>
          </div>

          {pick && (
            <div className="ft-lib-detail">
              <AmountPanel key={pick.key} pick={pick} date={date} meals={meals} onSave={save} onClose={() => setPick(null)} />
            </div>
          )}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="ft-dc-list" style={{ marginTop: 16 }}>
          <div className="ft-dc-empty">Sin comidas registradas {date === localISO() ? "hoy" : "ese día"}.</div>
        </div>
      ) : groups.map((group) => (
        <div key={group.meal || "otras"}>
          <div className="ft-dc-day">
            <span className="t">{(group.meal || "Sin comida asignada").toUpperCase()}</span>
            <span className="m">{kcalFmt(group.items.reduce(add, empty()).kcal)} kcal</span>
          </div>
          <div className="ft-dc-list">
            {group.items.map((entry) => (
              <div key={entry.id} className="ft-dc-row" style={{ cursor: "default" }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="nm" style={{ display: "block" }}>{entry.name}</span>
                  <span className="mt" style={{ display: "block" }}>
                    {[entry.grams ? `${num(entry.grams)} ${entry.unit || "g"}` : null, `P ${num(entry.protein)}`, `C ${num(entry.carbs)}`, `G ${num(entry.fat)}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span style={{ fontFamily: "Archivo", fontWeight: 700, fontSize: 18, letterSpacing: "-.03em", fontVariantNumeric: "tabular-nums" }}>
                  {kcalFmt(entry.kcal)}<small style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, color: "var(--muted)", marginLeft: 3 }}>kcal</small>
                </span>
                <button className="ft-dc-chip" onClick={() => setNutrition((current) => current.filter((item) => item.id !== entry.id))}>QUITAR</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
