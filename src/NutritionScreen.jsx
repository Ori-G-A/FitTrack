import React, { useMemo, useState } from "react";
import { CATALOG, round1, uid } from "./FitTrack.jsx";
import { localISO, addDays, proteinAdherence } from "./app-utils.js";
import { PROTEIN_CONFIG } from "./fase1Config.js";
import { toast } from "./toast.jsx";

// Registrar una comida son tres pantallas, como en el prototipo: el día, elegir
// qué, y cuánto. No una pantalla con paneles colgando al lado.
//
// Cada una ocupa la pantalla entera y trae su propia cabecera con su salida
// —CERRAR, ATRÁS—, así que la acción está siempre donde se la busca y no hace
// falta pegar nada por encima del contenido para alcanzarla.
//
// El paso de cantidad no se salta: sin él se registran raciones inventadas y los
// macros del día dejan de significar nada.

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

const RACION = [50, 100, 150, 200];
const PORCION = [0.5, 1, 1.5, 2];

// Todo lo elegible se normaliza a lo mismo: nombre, unidad y los macros de 100
// unidades de esa medida. Asi la pantalla de cantidad no sabe si viene del
// catalogo, de la biblioteca, de una receta o de algo que ya comiste.
const fromFood = (food, mio) => {
  const unit = food.unit || "g";
  const per = { kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat };
  return {
    key: `f-${food.id || food.name}`, name: food.name, unit, step: 10, base: 100, per, mio, atajos: RACION,
    line: `por 100 ${unit} · ${kcalFmt(per.kcal)} kcal · P ${num(per.protein)}`,
  };
};
const fromRecipe = (recipe) => {
  const total = recipe.items.reduce(add, empty());
  const perServing = times(total, 1 / (recipe.servings || 1));
  return {
    key: `r-${recipe.id}`, name: recipe.name, unit: "porc.", step: 0.5, base: 1, per: times(perServing, 100),
    recipe, atajos: PORCION,
    line: `rinde ${recipe.servings} porc. · ${recipe.items.length} ingredientes · ${kcalFmt(perServing.kcal)} kcal`,
  };
};
// Una entrada ya registrada: si tenia gramos se recupera la racion base; si no
// (una receta o algo escrito a mano) se vuelve a ofrecer entera.
const fromEntry = (entry, mio) => {
  const grams = Number(entry.grams);
  const macros = { kcal: +entry.kcal || 0, protein: +entry.protein || 0, carbs: +entry.carbs || 0, fat: +entry.fat || 0 };
  if (grams > 0) {
    const unit = entry.unit || "g";
    const per = times(macros, 100 / grams);
    return {
      key: `h-${entry.id}`, name: entry.name, unit, step: 10, base: 100, per, lastQty: grams, mio, atajos: RACION,
      line: `por 100 ${unit} · ${kcalFmt(per.kcal)} kcal · P ${num(per.protein)}`,
    };
  }
  return {
    key: `h-${entry.id}`, name: entry.name, unit: "ración", step: 1, base: 1, per: times(macros, 100),
    lastQty: 1, mio, atajos: [1],
    line: `1 ración · ${kcalFmt(macros.kcal)} kcal · P ${num(macros.protein)}`,
  };
};

/* --------------------------- pantalla: cuánto --------------------------- */

function AmountScreen({ pick, date, meals, onSave, onBack }) {
  const fmt = (value) => String(Math.round(value * 100) / 100).replace(".", ",");
  const [qty, setQty] = useState(fmt(pick.lastQty ?? pick.base));
  const [meal, setMeal] = useState(meals[0]);
  const amount = Number(String(qty).replace(",", "."));
  const valid = amount > 0;
  const macros = valid ? times(pick.per, amount / 100) : null;
  const esPorciones = pick.unit === "porc.";
  const unidad = esPorciones ? "porc." : pick.unit;
  const bump = (delta) => setQty(fmt(Math.max(0, Math.round(((amount || 0) + delta) * 100) / 100)));

  return (
    <div className="ft-dc">
      <div className="ft-dc-head">
        <div style={{ minWidth: 0 }}>
          <h1>{pick.name}</h1>
          <span className="sub">{pick.line}</span>
        </div>
        <button className="ft-dc-btn ghost" onClick={onBack}>Atrás</button>
      </div>

      <div className="ft-dc-card">
        <div className="h"><span>{esPorciones ? "Porciones" : `Cantidad en ${pick.unit}`}</span></div>
        <div className="ft-qty">
          <button className="ft-dc-step" aria-label="Menos" onClick={() => bump(-pick.step)}>−</button>
          <input className="ft-qty-input ft-mono" inputMode="decimal" value={qty}
            aria-label={esPorciones ? "Porciones" : `Cantidad en ${pick.unit}`}
            onChange={(event) => setQty(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && valid && onSave({ ...macros, qty: amount, meal })} />
          <span className="u">{unidad}</span>
          <button className="ft-dc-step" aria-label="Más" onClick={() => bump(pick.step)}>+</button>
        </div>
        <div className="ft-dc-chips" style={{ paddingTop: 0 }}>
          {pick.atajos.map((preset) => (
            <button key={preset} className={amount === preset ? "on" : ""} onClick={() => setQty(fmt(preset))}>
              {fmt(preset)} {unidad}
            </button>
          ))}
        </div>
      </div>

      <div className="ft-dc-strip" style={{ "--cols": 4, border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden", marginTop: 12 }}>
        {[["KCAL", macros ? kcalFmt(macros.kcal) : "—"], ["PROTEÍNA", macros ? `${num(macros.protein)} g` : "—"],
          ["CARBO", macros ? `${num(macros.carbs)} g` : "—"], ["GRASA", macros ? `${num(macros.fat)} g` : "—"]].map(([label, value]) => (
          <div key={label}><span className="k">{label}</span><span className="v" style={{ fontSize: 20 }}>{value}</span></div>
        ))}
      </div>

      {/* Los ingredientes se reescalan con las porciones elegidas: media receta no
          lleva los mismos gramos que una entera. */}
      {pick.recipe && valid && (
        <>
          <div className="ft-dc-day">
            <span className="t">INGREDIENTES</span>
            <span className="m">cantidad por porción elegida</span>
          </div>
          <div className="ft-dc-list">
            {pick.recipe.items.map((item) => {
              const factor = amount / (pick.recipe.servings || 1);
              return (
                <div key={item.id} className="ft-dc-row" style={{ cursor: "default" }}>
                  <span style={{ flex: 1, minWidth: 0 }}><span className="nm">{item.name}</span></span>
                  <span className="mt" style={{ margin: 0 }}>
                    {num(item.grams * factor)} {item.unit || "g"} · {kcalFmt(item.kcal * factor)} kcal · P {num(item.protein * factor)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="ft-dc-day">
        <span className="t">COMIDA</span>
        <span className="m">{cap(fecha(date))}</span>
      </div>
      <div className="ft-dc-chips" style={{ paddingTop: 0 }}>
        {meals.map((option) => (
          <button key={option} className={meal === option ? "on" : ""} onClick={() => setMeal(option)}>{option.toUpperCase()}</button>
        ))}
      </div>

      <button className="ft-dc-cta" disabled={!valid} onClick={() => onSave({ ...macros, qty: amount, meal })}>
        {valid ? `Añadir ${fmt(amount)} ${unidad} · ${kcalFmt(macros.kcal)} kcal` : "Escribe una cantidad"}
      </button>
      <div className="n">
        {!valid
          ? "Sin cantidad no se puede registrar: una ración inventada arruina los macros del día."
          : pick.recipe
            ? "Se guarda como una entrada con los macros de las porciones elegidas."
            : "Se guarda con la cantidad exacta y aparece en Recientes para repetirla mañana."}
      </div>
    </div>
  );
}

/* ------------------------- pantalla: elegir qué ------------------------- */

function SearchScreen({ options, tab, setTab_, query, setQuery, sum, kcalTarget, vacio, onPick, onClose, onLibrary }) {
  const quedan = kcalTarget ? kcalTarget - sum.kcal : null;
  return (
    <div className="ft-dc">
      <div className="ft-dc-head">
        <div>
          <h1>Añadir comida</h1>
          <span className="sub">
            {kcalFmt(sum.kcal)} / {kcalTarget ? kcalFmt(kcalTarget) : "—"} kcal
            {quedan != null && ` · ${quedan >= 0 ? `quedan ${kcalFmt(quedan)}` : `${kcalFmt(-quedan)} de más`}`}
          </span>
        </div>
        <button className="ft-dc-btn ghost" onClick={onClose}>Cerrar</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12, padding: "10px 13px", borderRadius: 10, background: "color-mix(in srgb,var(--text) 5%,transparent)" }}>
        <input className="ft-dc-search" value={query} onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar alimento o receta" aria-label="Buscar qué registrar" autoFocus />
        {query && <button className="ft-dc-chip" onClick={() => setQuery("")}>LIMPIAR</button>}
      </div>

      <div className="ft-dc-chips">
        {TABS.map(([key, label]) => (
          <button key={key} className={tab === key ? "on" : ""} onClick={() => setTab_(key)}>{label}</button>
        ))}
        <button className="ft-dc-chip" style={{ marginLeft: "auto" }} onClick={onLibrary}>
          {tab === "recetas" ? "CREAR RECETA" : "CREAR ALIMENTO"}
        </button>
      </div>

      <div className="ft-dc-list" style={{ marginTop: 12 }}>
        {options.length === 0
          ? <div className="ft-dc-empty">{vacio}</div>
          : options.map((option) => (
            <button key={option.key} className="ft-dc-row" onClick={() => onPick(option)}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="nm" style={{ display: "block" }}>{option.name}</span>
                <span className="mt" style={{ display: "block" }}>{option.line}</span>
              </span>
              {option.mio && <span className="ft-dc-mio">MÍO</span>}
              <span className="ft-dc-plus" aria-hidden="true">+</span>
            </button>
          ))}
      </div>
    </div>
  );
}

/* --------------------------- pantalla: el día --------------------------- */

export default function NutritionScreen({ nutrition, setNutrition, foods = [], recipes = [], goals = {}, setTab, initialDate }) {
  const [date, setDate] = useState(initialDate || localISO());
  const [adding, setAdding] = useState(false);
  const [tab, setTab_] = useState("mios");
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState(null);

  const meals = mealsFor(goals);
  const dayItems = nutrition.filter((entry) => entry.date === date);
  const sum = dayItems.reduce(add, empty());
  const adherence = useMemo(() => proteinAdherence(nutrition, goals.proteinTarget, date), [nutrition, goals.proteinTarget, date]);

  const matches = (text) => text.toLowerCase().includes(query.trim().toLowerCase());
  const mine = useMemo(() => new Set(foods.map((food) => food.name.toLowerCase())), [foods]);
  // Recientes: un nombre una vez, lo ultimo primero. Es el atajo que evita volver
  // a buscar lo que comes todos los dias.
  const recent = useMemo(() => {
    const seen = new Set();
    return [...nutrition].sort((a, b) => b.date.localeCompare(a.date))
      .filter((entry) => { const key = entry.name.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; })
      .slice(0, 20);
  }, [nutrition]);

  const options = {
    buscar: CATALOG.filter((item) => matches(item.name)).slice(0, 60).map((item) => fromFood(item, mine.has(item.name.toLowerCase()))),
    mios: foods.filter((food) => matches(food.name)).map((food) => fromFood(food, true)),
    recetas: recipes.filter((recipe) => matches(recipe.name)).map(fromRecipe),
    recientes: recent.filter((entry) => matches(entry.name)).map((entry) => fromEntry(entry, mine.has(entry.name.toLowerCase()))),
  }[tab];

  const vacio = tab === "mios" && foods.length === 0
    ? "Sin alimentos guardados todavía. Búscalos en el catálogo o créalos en la biblioteca."
    : tab === "recetas" && recipes.length === 0
      ? "Sin recetas guardadas. Junta varios alimentos en un plato y se registra de un toque."
      : "Nada coincide.";

  const save = ({ kcal, protein, carbs, fat, qty, meal }) => {
    setNutrition((current) => [...current, {
      id: uid(), date, name: pick.name, meal,
      grams: pick.unit === "porc." || pick.unit === "ración" ? null : qty,
      unit: pick.unit, kcal: round1(kcal), protein: round1(protein), carbs: round1(carbs), fat: round1(fat),
    }]);
    toast(`${pick.name} · ${kcalFmt(kcal)} kcal en ${meal.toLowerCase()}`);
    setPick(null); setAdding(false); setQuery("");
  };

  const kcalTarget = Number(goals.kcalTarget) || 0;
  const proteinTarget = Number(goals.proteinTarget) || 0;
  const shift = (days) => { setDate(addDays(date, days)); setPick(null); };

  if (pick) {
    return <AmountScreen key={pick.key} pick={pick} date={date} meals={meals} onSave={save} onBack={() => setPick(null)} />;
  }
  if (adding) {
    return (
      <SearchScreen
        options={options} tab={tab} setTab_={(next) => { setTab_(next); setQuery(""); }}
        query={query} setQuery={setQuery} sum={sum} kcalTarget={kcalTarget} vacio={vacio}
        onPick={setPick} onClose={() => { setAdding(false); setQuery(""); }} onLibrary={() => setTab("biblioteca")}
      />
    );
  }

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
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className="ft-dc-step" aria-label="Día anterior" onClick={() => shift(-1)}>‹</button>
          <input className="ft-input ft-mono ft-dc-date" type="date" value={date} aria-label="Ir a otro día"
            onChange={(event) => { if (event.target.value) { setDate(event.target.value); setPick(null); } }} />
          <button className="ft-dc-step" aria-label="Día siguiente" onClick={() => shift(1)}>›</button>
          <button className="ft-dc-btn" onClick={() => { setAdding(true); setPick(null); }}>Añadir comida</button>
        </div>
      </div>

      <div className="ft-dc-strip" style={{ "--cols": 2 }}>
        <div>
          <span className="k">KCAL</span>
          <span className="v">{kcalFmt(sum.kcal)}</span>
          <span className="d">{kcalTarget ? `de ${kcalFmt(kcalTarget)} · quedan ${kcalFmt(Math.max(0, kcalTarget - sum.kcal))}` : "sin objetivo"}</span>
        </div>
        <div>
          <span className="k">PROTEÍNA</span>
          <span className="v">{Math.round(sum.protein)}<small>g</small></span>
          <span className="d" style={proteinTarget && sum.protein >= proteinTarget * 0.9 ? { color: "var(--ok)" } : undefined}>
            {proteinTarget ? `de ${proteinTarget} g` : "sin objetivo"}
          </span>
        </div>
      </div>

      {adherence && adherence.onTarget < adherence.logged && (
        <div className="ft-dc-quiet" style={{ cursor: "default" }}>
          <span className="dot" />
          <span style={{ flex: 1 }}>Proteína {adherence.avg} g de media · {adherence.onTarget} de {adherence.logged} días en objetivo</span>
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
