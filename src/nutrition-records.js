import { CATALOG_UNIT_BY_NAME } from "./nutrition-config.js";
import { round1 } from "./nutrition-numbers.js";
export const migrateFoodUnits = (foods) => foods.map((f) => (f.unit ? f : { ...f, unit: CATALOG_UNIT_BY_NAME.get(f.name.toLowerCase()) || "g" }));
export const foodData = (draft) => ({ name: draft.name.trim(), kcal: +draft.kcal || 0, protein: +draft.protein || 0, carbs: +draft.carbs || 0, fat: +draft.fat || 0, unit: draft.unit || "g" });
export const saveFoodRecord = (current, draft, data, uid) => (draft.id
 ? current.map((food) => food.id === draft.id ? { ...food, ...data } : food)
 : [...current, { id: uid(), ...data }]).sort((a, b) => a.name.localeCompare(b.name));
export const appendCatalogFood = (current, item, uid) => [...current, { id: uid(), name: item.name, kcal: item.kcal, protein: item.protein, carbs: item.carbs, fat: item.fat, unit: item.unit || "g" }].sort((a, b) => a.name.localeCompare(b.name));
export const saveRecipeRecord = (current, open, data, uid) => open && open !== "nuevo"
 ? current.map((recipe) => recipe.id === open ? { ...recipe, ...data } : recipe)
 : [...current, { id: uid(), ...data }];
export const appendRecipeIngredient = (current, picked, grams, scaled, uid) => [...current, { id: uid(), name: picked.name, grams: Number(grams), unit: picked.unit || "g", kcal: round1(scaled.kcal), protein: round1(scaled.protein), carbs: round1(scaled.carbs), fat: round1(scaled.fat) }];
export const appendNutritionEntry = (current, {pick,date,kcal,protein,carbs,fat,qty,meal}, uid) => [...current, {
 id: uid(), date, name: pick.name, meal,
 grams: pick.unit === "porc." || pick.unit === "ración" ? null : qty,
 unit: pick.unit, kcal: round1(kcal), protein: round1(protein), carbs: round1(carbs), fat: round1(fat),
}];
export const removeRecordById = (records, id) => records.filter((record) => record.id !== id);
