export const updateGoalField = (current, key, value) => ({ ...current, [key]: value });
export const automaticGoalPatch = (current, suggestion) => ({ ...current, kcalTarget: suggestion.kcal, proteinTarget: suggestion.protein });
export const paceSnapshot = (goals) => ({ kcalTarget: goals.kcalTarget, autoMacros: goals.autoMacros, paceCheckedAt: goals.paceCheckedAt });
export const markPaceGoals = (current, patch, today) => ({ ...current, ...patch, paceCheckedAt: today });
export const undoPaceGoals = (current, previous) => ({ ...current, ...previous });
