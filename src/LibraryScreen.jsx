import React, { useEffect, useMemo, useState } from "react";
import { CATALOG, CATALOG_CATS, EXERCISE_PRESETS, MUSCLES, round1, scaleFood, uid } from "./FitTrack.jsx";
import { PLACES, ROUTINE_TEMPLATES, WARMUP, routinePlace, templateToAppRoutine } from "./fase1Config.js";

// Biblioteca: lista a la izquierda, ficha a la derecha.
//
// Antes abria con el formulario de alta y las listas quedaban debajo, asi que lo
// primero que veias al entrar a consultar era un formulario vacio. Ahora entras a
// la lista y el alta es un boton; la ficha ocupa el panel derecho, que en movil
// pasa a ser la pantalla entera.

const num = (value) => String(Math.round(Number(value) * 10) / 10).replace(".", ",");
const TABS = [["mis", "ALIMENTOS"], ["catalogo", "CATÁLOGO"], ["recetas", "RECETAS"], ["rutinas", "RUTINAS"]];
const EMPTY_FOOD = { name: "", kcal: "", protein: "", carbs: "", fat: "", unit: "g" };
// El boton y el subtitulo concuerdan en genero y numero: "Nuevo rutina" y
// "1 recetas" se leen como texto sin terminar.
const NEW_LABEL = { mis: "Nuevo alimento", recetas: "Nueva receta", rutinas: "Nueva rutina" };
const plural = (count, singular, plural_) => `${count} ${count === 1 ? singular : plural_}`;

const macroLine = (item) => `${Math.round(item.kcal)} kcal · P ${num(item.protein)} · C ${num(item.carbs)} · G ${num(item.fat)}`;
const recipeTotals = (recipe) => recipe.items.reduce(
  (total, item) => ({ kcal: total.kcal + item.kcal, protein: total.protein + item.protein, carbs: total.carbs + item.carbs, fat: total.fat + item.fat }),
  { kcal: 0, protein: 0, carbs: 0, fat: 0 },
);

function Rows({ rows }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map((row, index) => (
        <div key={row.k} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: index < rows.length - 1 ? "1px solid var(--hair)" : "none" }}>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, color: "var(--muted)" }}>{row.k}</span>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12.5, fontWeight: 600, textAlign: "right" }}>{row.v}</span>
        </div>
      ))}
    </div>
  );
}

function Item({ title, meta, selected, onClick }) {
  return (
    <button className={selected ? "ft-dc-row sel" : "ft-dc-row"} onClick={onClick}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="nm" style={{ display: "block" }}>{title}</span>
        <span className="mt" style={{ display: "block" }}>{meta}</span>
      </span>
      <span className="go">›</span>
    </button>
  );
}

/* ---------------------------- fichas ---------------------------- */

function FoodDetail({ food, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(food ? { ...food } : EMPTY_FOOD);
  useEffect(() => setDraft(food ? { ...food } : EMPTY_FOOD), [food?.id]); // eslint-disable-line
  const fields = [["kcal", "Kcal"], ["protein", "Proteína"], ["carbs", "Carbos"], ["fat", "Grasa"]];
  const valid = draft.name.trim().length > 0;

  return (
    <div className="ft-dc-card" style={{ marginTop: 0 }}>
      <div className="h">
        <span>{food ? "Editar alimento" : "Nuevo alimento"}</span>
        <span>por 100 {draft.unit}</span>
      </div>
      <label className="ft-lib-field">
        <span>Nombre</span>
        <input className="ft-input" placeholder="Ej. Pechuga de pollo (cruda)" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </label>
      <label className="ft-lib-field">
        <span>Se mide en</span>
        <select className="ft-select" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}>
          <option value="g">Sólido (g)</option>
          <option value="ml">Líquido (ml)</option>
        </select>
      </label>
      <div className="ft-lib-nums">
        {fields.map(([key, label]) => (
          <label key={key} className="ft-lib-field">
            <span>{label}</span>
            <input className="ft-input ft-mono" type="number" inputMode="decimal" placeholder="0" value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
          </label>
        ))}
      </div>
      <div className="ft-dc-acts">
        <button className="ft-dc-btn" disabled={!valid} onClick={() => onSave(draft)}>{food ? "Guardar cambios" : "Añadir a mi biblioteca"}</button>
        {food && <button className="ft-dc-btn ghost" onClick={() => onDelete(food.id)}>Eliminar</button>}
        <button className="ft-dc-btn ghost" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

function RecipeDetail({ recipe, foods, onSave, onDelete, onClose }) {
  const [name, setName] = useState(recipe?.name || "");
  const [servings, setServings] = useState(String(recipe?.servings || 1));
  const [items, setItems] = useState(recipe ? recipe.items.map((item) => ({ ...item })) : []);
  const [pickId, setPickId] = useState("");
  const [grams, setGrams] = useState("");
  useEffect(() => {
    setName(recipe?.name || "");
    setServings(String(recipe?.servings || 1));
    setItems(recipe ? recipe.items.map((item) => ({ ...item })) : []);
  }, [recipe?.id]); // eslint-disable-line

  const picked = foods.find((food) => food.id === pickId) || null;
  const addItem = () => {
    if (!picked || !grams) return;
    const scaled = scaleFood(picked, grams);
    setItems((current) => [...current, { id: uid(), name: picked.name, grams: Number(grams), unit: picked.unit || "g", kcal: round1(scaled.kcal), protein: round1(scaled.protein), carbs: round1(scaled.carbs), fat: round1(scaled.fat) }]);
    setPickId(""); setGrams("");
  };
  const total = recipeTotals({ items });
  const perServing = Math.round(total.kcal / (Number(servings) || 1));

  return (
    <div className="ft-dc-card" style={{ marginTop: 0 }}>
      <div className="h">
        <span>{recipe ? "Editar receta" : "Nueva receta"}</span>
        <span>{items.length} ingrediente{items.length === 1 ? "" : "s"}</span>
      </div>
      <label className="ft-lib-field">
        <span>Nombre</span>
        <input className="ft-input" placeholder="Ej. Bowl de yogur griego" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="ft-lib-field">
        <span>Porciones</span>
        <input className="ft-input ft-mono" type="number" inputMode="numeric" value={servings} onChange={(e) => setServings(e.target.value)} />
      </label>

      {foods.length === 0 ? (
        <div className="ft-dc-empty" style={{ padding: "8px 0" }}>Primero añade alimentos a tu biblioteca: una receta se arma con ellos.</div>
      ) : (
        <div className="ft-lib-add">
          <select className="ft-select" value={pickId} onChange={(e) => setPickId(e.target.value)}>
            <option value="">Ingrediente…</option>
            {foods.map((food) => <option key={food.id} value={food.id}>{food.name}</option>)}
          </select>
          <input className="ft-input ft-mono" type="number" inputMode="decimal" placeholder={picked ? picked.unit || "g" : "g"} value={grams}
            onChange={(e) => setGrams(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} />
          <button className="ft-dc-btn ghost" disabled={!picked || !grams} onClick={addItem}>Añadir</button>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="ft-dc-list" style={{ marginTop: 2 }}>
            {items.map((item) => (
              <div key={item.id} className="ft-dc-row" style={{ cursor: "default" }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="nm" style={{ display: "block" }}>{item.name}</span>
                  <span className="mt" style={{ display: "block" }}>{num(item.grams)} {item.unit || "g"} · {Math.round(item.kcal)} kcal</span>
                </span>
                <button className="ft-dc-chip" onClick={() => setItems((current) => current.filter((x) => x.id !== item.id))}>QUITAR</button>
              </div>
            ))}
          </div>
          <Rows rows={[
            { k: "TOTAL", v: `${Math.round(total.kcal)} kcal · P ${num(total.protein)} · C ${num(total.carbs)} · G ${num(total.fat)}` },
            { k: "POR PORCIÓN", v: `${perServing} kcal · P ${num(total.protein / (Number(servings) || 1))}` },
          ]} />
        </>
      )}

      <div className="ft-dc-acts">
        <button className="ft-dc-btn" disabled={!name.trim() || items.length === 0}
          onClick={() => onSave({ name: name.trim(), servings: Number(servings) || 1, items })}>
          {recipe ? "Guardar cambios" : "Guardar receta"}
        </button>
        {recipe && <button className="ft-dc-btn ghost" onClick={() => onDelete(recipe.id)}>Eliminar</button>}
        <button className="ft-dc-btn ghost" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

function RoutineDetail({ routine, onSave, onDelete, onClose }) {
  const [name, setName] = useState(routine?.name || "");
  const [items, setItems] = useState(routine ? routine.exercises.map((e) => ({ ...e })) : []);
  const [exName, setExName] = useState("");
  const [primary, setPrimary] = useState(MUSCLES[0]);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("8");
  useEffect(() => {
    setName(routine?.name || "");
    setItems(routine ? routine.exercises.map((e) => ({ ...e })) : []);
  }, [routine?.id]); // eslint-disable-line

  const minimal = routine?.minimal?.exercises || null;
  const addItem = () => {
    if (!exName.trim()) return;
    setItems((current) => [...current, { id: uid(), name: exName.trim(), primary, targetSets: Number(sets) || 3, targetReps: reps }]);
    setExName("");
  };

  return (
    <div className="ft-dc-card" style={{ marginTop: 0 }}>
      <div className="h">
        <span>{routine ? routine.name : "Nueva rutina"}</span>
        <span>{routine ? [routinePlace(routine), routine.estimatedMin ? `~${routine.estimatedMin} min` : null].filter(Boolean).join(" · ") : `${items.length} ejercicios`}</span>
      </div>

      <label className="ft-lib-field">
        <span>Nombre</span>
        <input className="ft-input" placeholder="Ej. Día A · Empuje" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      {routine?.hasWarmup && (
        <div className="n">
          <b style={{ color: "var(--text)" }}>Bloque 0 · Calentamiento ({WARMUP.durationMin} min, obligatorio).</b> {WARMUP.exercises.map((w) => w.name).join(" · ")}
        </div>
      )}

      <div className="ft-dc-list" style={{ marginTop: 2 }}>
        {items.length === 0
          ? <div className="ft-dc-empty">Sin ejercicios todavía.</div>
          : items.map((exercise, index) => (
            <div key={exercise.id || index} className="ft-dc-row" style={{ cursor: "default" }}>
              <span className="kind">{String(index + 1).padStart(2, "0")}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="nm" style={{ display: "block" }}>
                  {exercise.name}
                  {exercise.isOptional && <span className="ft-dc-tag late" style={{ marginLeft: 8 }}>OPCIONAL</span>}
                </span>
                <span className="mt" style={{ display: "block" }}>
                  {[exercise.primary, `${exercise.targetSets || 3}×${exercise.targetReps || "8"}`, exercise.targetRpe ? `RPE ${exercise.targetRpe}` : null].filter(Boolean).join(" · ")}
                </span>
              </span>
              <button className="ft-dc-chip" onClick={() => setItems((current) => current.filter((x) => x.id !== exercise.id))}>QUITAR</button>
            </div>
          ))}
      </div>

      {minimal && (
        <div className="n">
          <b style={{ color: "var(--text)" }}>Versión mínima ({routine.minimal.estimatedMin} min).</b> {minimal.map((e) => e.name).join(" · ")}
        </div>
      )}

      <div className="ft-lib-add">
        <select className="ft-select" value="" onChange={(e) => {
          if (e.target.value === "") return;
          const preset = EXERCISE_PRESETS[Number(e.target.value)];
          setExName(preset.name); setPrimary(preset.primary);
        }}>
          <option value="">Desde la lista…</option>
          {EXERCISE_PRESETS.map((preset, index) => <option key={preset.name} value={index}>{preset.name}</option>)}
        </select>
        <input className="ft-input" placeholder="O escríbelo" value={exName} onChange={(e) => setExName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} />
        <button className="ft-dc-btn ghost" disabled={!exName.trim()} onClick={addItem}>Añadir</button>
      </div>
      <div className="ft-lib-nums">
        <label className="ft-lib-field"><span>Músculo</span>
          <select className="ft-select" value={primary} onChange={(e) => setPrimary(e.target.value)}>{MUSCLES.map((m) => <option key={m}>{m}</option>)}</select>
        </label>
        <label className="ft-lib-field"><span>Series</span><input className="ft-input ft-mono" type="number" inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} /></label>
        <label className="ft-lib-field"><span>Reps</span><input className="ft-input ft-mono" value={reps} onChange={(e) => setReps(e.target.value)} /></label>
      </div>

      <div className="ft-dc-acts">
        <button className="ft-dc-btn" disabled={!name.trim() || items.length === 0} onClick={() => onSave({ name: name.trim(), exercises: items })}>
          {routine ? "Guardar cambios" : "Guardar rutina"}
        </button>
        {routine && <button className="ft-dc-btn ghost" onClick={() => onDelete(routine.id)}>Eliminar</button>}
        <button className="ft-dc-btn ghost" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

/* ---------------------------- pantalla ---------------------------- */

export default function LibraryScreen({ foods, setFoods, recipes, setRecipes, routines = [], setRoutines = () => {}, initialView = "mis" }) {
  const [tab, setTab] = useState(initialView === "rutinas" ? "rutinas" : "mis");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Todas");
  const [place, setPlace] = useState("todos");
  const [muscle, setMuscle] = useState("todos");
  // `null` = nada abierto, `"nuevo"` = ficha en blanco, un id = ficha existente.
  const [open, setOpen] = useState(null);
  const switchTab = (next) => { setTab(next); setOpen(null); setQuery(""); };

  const existing = useMemo(() => new Set(foods.map((food) => food.name.toLowerCase())), [foods]);
  const matches = (text) => text.toLowerCase().includes(query.trim().toLowerCase());

  const placeOf = useMemo(() => new Map(routines.map((r) => [r.id, routinePlace(r)])), [routines]);
  const placeTabs = useMemo(() => ["todos", ...PLACES.filter((p) => [...placeOf.values()].includes(p))], [placeOf]);
  const muscleTabs = useMemo(
    () => ["todos", ...[...new Set(routines.flatMap((r) => (r.exercises || []).map((e) => e.primary).filter(Boolean)))].sort()],
    [routines],
  );

  const myFoods = foods.filter((food) => matches(food.name));
  const catalogItems = CATALOG.filter((item) => (cat === "Todas" || item.cat === cat) && matches(item.name));
  const shownRecipes = recipes.filter((recipe) => matches(recipe.name));
  const shownRoutines = routines
    .filter((r) => matches(r.name))
    .filter((r) => muscle === "todos" || (r.exercises || []).some((e) => e.primary === muscle))
    .filter((r) => place === "todos" || placeOf.get(r.id) === place);

  const saveFood = (draft) => {
    const data = { name: draft.name.trim(), kcal: +draft.kcal || 0, protein: +draft.protein || 0, carbs: +draft.carbs || 0, fat: +draft.fat || 0, unit: draft.unit || "g" };
    setFoods((current) => (draft.id
      ? current.map((food) => food.id === draft.id ? { ...food, ...data } : food)
      : [...current, { id: uid(), ...data }]).sort((a, b) => a.name.localeCompare(b.name)));
    setOpen(null);
  };
  const addFromCatalog = (item) => {
    if (existing.has(item.name.toLowerCase())) return;
    setFoods((current) => [...current, { id: uid(), name: item.name, kcal: item.kcal, protein: item.protein, carbs: item.carbs, fat: item.fat, unit: item.unit || "g" }].sort((a, b) => a.name.localeCompare(b.name)));
  };
  const saveRecipe = (data) => {
    setRecipes((current) => open && open !== "nuevo"
      ? current.map((recipe) => recipe.id === open ? { ...recipe, ...data } : recipe)
      : [...current, { id: uid(), ...data }]);
    setOpen(null);
  };
  const saveRoutine = (data) => {
    setRoutines((current) => open && open !== "nuevo"
      ? current.map((routine) => routine.id === open ? { ...routine, ...data } : routine)
      : [...current, { id: uid(), ...data }]);
    setOpen(null);
  };
  const loadTemplates = () => setRoutines((current) => {
    const have = new Set(current.map((r) => r.name));
    return [...current, ...ROUTINE_TEMPLATES.filter((t) => !have.has(t.name)).map((t) => templateToAppRoutine(t, uid))];
  });

  const counts = { mis: foods.length, catalogo: CATALOG.length, recetas: recipes.length, rutinas: routines.length };
  const detail = (() => {
    if (!open) return null;
    const isNew = open === "nuevo";
    if (tab === "mis") return <FoodDetail food={isNew ? null : foods.find((f) => f.id === open)} onSave={saveFood} onDelete={(id) => { setFoods((c) => c.filter((f) => f.id !== id)); setOpen(null); }} onClose={() => setOpen(null)} />;
    if (tab === "recetas") return <RecipeDetail recipe={isNew ? null : recipes.find((r) => r.id === open)} foods={foods} onSave={saveRecipe} onDelete={(id) => { setRecipes((c) => c.filter((r) => r.id !== id)); setOpen(null); }} onClose={() => setOpen(null)} />;
    if (tab === "rutinas") return <RoutineDetail routine={isNew ? null : routines.find((r) => r.id === open)} onSave={saveRoutine} onDelete={(id) => { setRoutines((c) => c.filter((r) => r.id !== id)); setOpen(null); }} onClose={() => setOpen(null)} />;
    return null;
  })();

  return (
    <div className="ft-dc">
      <div className="ft-dc-head">
        <div>
          <h1>Bibliotecas</h1>
          <span className="sub">{plural(foods.length, "alimento", "alimentos")} · {plural(recipes.length, "receta", "recetas")} · {plural(routines.length, "rutina", "rutinas")}</span>
        </div>
        {tab !== "catalogo" && (
          <button className="ft-dc-btn" onClick={() => setOpen("nuevo")}>{NEW_LABEL[tab]}</button>
        )}
      </div>

      <div className="ft-dc-chips">
        {TABS.map(([key, label]) => (
          <button key={key} className={tab === key ? "on" : ""} onClick={() => switchTab(key)}>{label} {counts[key]}</button>
        ))}
      </div>

      <div className={detail ? "ft-lib open" : "ft-lib"}>
        <div className="ft-lib-list">
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", borderRadius: 10, background: "color-mix(in srgb,var(--text) 5%,transparent)" }}>
            <input className="ft-dc-search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "rutinas" ? "Buscar rutina" : tab === "recetas" ? "Buscar receta" : "Buscar alimento"} aria-label="Buscar en la biblioteca" />
            {query && <button className="ft-dc-chip" onClick={() => setQuery("")}>LIMPIAR</button>}
          </div>

          {tab === "catalogo" && (
            <div className="ft-dc-chips">
              {["Todas", ...CATALOG_CATS].map((option) => (
                <button key={option} className={cat === option ? "on" : ""} onClick={() => setCat(option)}>{option.toUpperCase()}</button>
              ))}
            </div>
          )}

          {tab === "rutinas" && (
            <>
              {placeTabs.length > 1 && (
                <div className="ft-dc-chips">
                  {placeTabs.map((option) => (
                    <button key={option} className={place === option ? "on" : ""} onClick={() => setPlace(option)}>{option.toUpperCase()}</button>
                  ))}
                </div>
              )}
              {muscleTabs.length > 1 && (
                <div className="ft-dc-chips">
                  {muscleTabs.map((option) => (
                    <button key={option} className={muscle === option ? "on" : ""} onClick={() => setMuscle(option)}>{option.toUpperCase()}</button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="ft-dc-list" style={{ marginTop: 12 }}>
            {tab === "mis" && (myFoods.length === 0
              ? <div className="ft-dc-empty">{foods.length === 0 ? "Aún no has guardado alimentos. El catálogo trae 100+ listos para copiar." : "Nada coincide con la búsqueda."}</div>
              : myFoods.map((food) => <Item key={food.id} title={food.name} meta={`${macroLine(food)} /100${food.unit || "g"}`} selected={open === food.id} onClick={() => setOpen(food.id)} />))}

            {tab === "catalogo" && (catalogItems.length === 0
              ? <div className="ft-dc-empty">Sin resultados.</div>
              : catalogItems.slice(0, 80).map((item) => {
                const added = existing.has(item.name.toLowerCase());
                return (
                  <div key={item.name} className="ft-dc-row" style={{ cursor: "default" }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="nm" style={{ display: "block" }}>{item.name}</span>
                      <span className="mt" style={{ display: "block" }}>{item.cat} · {macroLine(item)} /100{item.unit}</span>
                    </span>
                    <button className="ft-dc-chip" disabled={added} onClick={() => addFromCatalog(item)} style={added ? { opacity: .45 } : undefined}>
                      {added ? "AÑADIDO" : "AÑADIR"}
                    </button>
                  </div>
                );
              }))}

            {tab === "recetas" && (shownRecipes.length === 0
              ? <div className="ft-dc-empty">Sin recetas. Junta varios alimentos en un plato y se registra de un toque.</div>
              : shownRecipes.map((recipe) => {
                const total = recipeTotals(recipe);
                return <Item key={recipe.id} title={recipe.name} meta={`${plural(recipe.items.length, "ingrediente", "ingredientes")} · ${plural(recipe.servings, "porción", "porciones")} · ${Math.round(total.kcal)} kcal`} selected={open === recipe.id} onClick={() => setOpen(recipe.id)} />;
              }))}

            {tab === "rutinas" && (shownRoutines.length === 0
              ? <div className="ft-dc-empty">{routines.length === 0 ? "Sin rutinas guardadas." : "Nada coincide con los filtros."}</div>
              : shownRoutines.map((routine) => (
                <Item key={routine.id} title={routine.name}
                  meta={[plural((routine.exercises || []).length, "ejercicio", "ejercicios"), placeOf.get(routine.id), routine.estimatedMin ? `~${routine.estimatedMin} min` : null].filter(Boolean).join(" · ")}
                  selected={open === routine.id} onClick={() => setOpen(routine.id)} />
              )))}
          </div>

          {tab === "rutinas" && (
            <button className="ft-dc-quiet" onClick={loadTemplates} style={{ cursor: "pointer" }}>
              <span style={{ flex: 1 }}>Cargar las plantillas de Fase 1 (empuje, tracción, pierna, sesión amable) con calentamiento y versión mínima.</span>
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13 }}>›</span>
            </button>
          )}
        </div>

        {detail && <div className="ft-lib-detail">{detail}</div>}
      </div>
    </div>
  );
}
