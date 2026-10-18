export const round1 = (x) => Math.round(x * 10) / 10;
export const scaleFood = (food, g) => { const k = (Number(g) || 0) / 100; return { kcal: food.kcal * k, protein: food.protein * k, carbs: food.carbs * k, fat: food.fat * k }; };
