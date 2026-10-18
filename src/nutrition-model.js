import { PROTEIN_CONFIG } from "./nutrition-protein.js";
import { CATALOG } from "./nutrition-config.js";
const mealsFor = (goals) => PROTEIN_CONFIG.mealLabels[goals?.proteinMeals ?? PROTEIN_CONFIG.mealsPerDay]
  || PROTEIN_CONFIG.mealLabels[PROTEIN_CONFIG.mealsPerDay];
const num = (value) => String(Math.round(Number(value) * 10) / 10).replace(".", ",");
const kcalFmt = (value) => Math.round(value).toLocaleString("es-ES");
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

export function recentNutrition(nutrition) {
 const seen = new Set();
 return [...nutrition].sort((a, b) => b.date.localeCompare(a.date))
  .filter((entry) => { const key = entry.name.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 20);
}
export function nutritionOptions(tab, { foods, recipes, recent, mine, query }) {
 const matches = (text) => text.toLowerCase().includes(query.trim().toLowerCase());
 return {
 buscar: CATALOG.filter((item) => matches(item.name)).slice(0, 60).map((item) => fromFood(item, mine.has(item.name.toLowerCase()))),
 mios: foods.filter((food) => matches(food.name)).map((food) => fromFood(food, true)),
 recetas: recipes.filter((recipe) => matches(recipe.name)).map(fromRecipe),
 recientes: recent.filter((entry) => matches(entry.name)).map((entry) => fromEntry(entry, mine.has(entry.name.toLowerCase()))),
 }[tab];
}
export function nutritionGroups(dayItems, meals) {
 const extras = [...new Set(dayItems.map((entry) => entry.meal).filter((meal) => meal && !meals.includes(meal)))];
 return [...meals, ...extras, null].map((meal) => ({ meal, items: dayItems.filter((entry) => (entry.meal || null) === meal) })).filter((group) => group.items.length > 0);
}
export { mealsFor, empty, add, times, fromFood, fromRecipe, fromEntry };

export const recipeTotals = (recipe) => recipe.items.reduce(
  (total, item) => ({ kcal: total.kcal + item.kcal, protein: total.protein + item.protein, carbs: total.carbs + item.carbs, fat: total.fat + item.fat }),
  { kcal: 0, protein: 0, carbs: 0, fat: 0 },
);
