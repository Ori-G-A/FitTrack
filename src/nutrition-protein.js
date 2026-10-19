export const PROTEIN_CONFIG = {
  gPerKg: 2.0,
  minGPerKg: 1.6,
  maxGPerKg: 2.4,

  mealsPerDay: 4, // o 5

  // Reparto por comida. Cada array suma 1.0.
  //
  // Criterio: dosis por comida de 0.4-0.55 g/kg y reparto lo más parejo posible
  // (Areta 2013, Mamerow 2014: cuatro tomas parejas rinden más en síntesis
  // proteica a 24 h que el patrón desayuno-pequeño / cena-grande). El extremo
  // alto del rango aplica por estar en déficit.
  //
  // Se baja un punto el desayuno por apetito matutino bajo, no más: por debajo
  // de ~25 g la toma deja de disparar bien la señal anabólica.
  //
  // Aviso de suelo: con 5 comidas y un objetivo por debajo de ~110 g las dos
  // medias comidas caen bajo 20 g. En ese caso el reparto de 4 es el correcto.
  distribution: {
    4: [0.20, 0.28, 0.24, 0.28], // desayuno, almuerzo, merienda, cena
    5: [0.18, 0.17, 0.25, 0.17, 0.23], // desayuno, media mañana, almuerzo, merienda, cena
  },

  mealLabels: {
    4: ["Desayuno", "Almuerzo", "Merienda", "Cena"],
    5: ["Desayuno", "Media mañana", "Almuerzo", "Merienda", "Cena"],
  },
};

/**
 * Calcula el objetivo diario de proteína a partir del peso actual.
 * @param {number} weightKg  Peso corporal actual (kg).
 * @param {object} [cfg]     Override parcial de PROTEIN_CONFIG.
 * @returns {{ gPerKg:number, weightKg:number, dailyTarget:number,
 *             lowEnd:number, highEnd:number }}
 */
export function computeProteinTargets(weightKg, cfg = {}) {
  const minG = cfg.minGPerKg ?? PROTEIN_CONFIG.minGPerKg;
  const maxG = cfg.maxGPerKg ?? PROTEIN_CONFIG.maxGPerKg;
  const gPerKg = clamp(cfg.gPerKg ?? PROTEIN_CONFIG.gPerKg, minG, maxG);
  const w = Number(weightKg) || 0;
  return {
    gPerKg,
    weightKg: w,
    dailyTarget: Math.round(w * gPerKg),
    lowEnd: Math.round(w * minG),
    highEnd: Math.round(w * maxG),
  };
}

/**
 * Reparte el objetivo diario entre las comidas según la distribución.
 * @param {number} dailyTarget  Gramos totales del día.
 * @param {number} [meals=4]    4 o 5.
 * @param {object} [cfg]        Override de distribución/labels.
 * @returns {Array<{ label:string, grams:number, pct:number }>}
 */
export function distributeProtein(dailyTarget, meals = PROTEIN_CONFIG.mealsPerDay, cfg = {}) {
  const dist = (cfg.distribution ?? PROTEIN_CONFIG.distribution)[meals];
  const labels = (cfg.mealLabels ?? PROTEIN_CONFIG.mealLabels)[meals];
  if (!dist) return [];
  // Redondear cada tramo por separado desviaba la suma del objetivo (150 g
  // repartidos en 5 daban 152). La ultima comida absorbe el resto, asi que lo
  // que se muestra por comida siempre suma lo que se pide al dia.
  const split = dist.map((pct, i) => ({
    label: labels?.[i] ?? `Comida ${i + 1}`,
    grams: Math.round(dailyTarget * pct),
    pct,
  }));
  const drift = Math.round(dailyTarget) - split.reduce((sum, meal) => sum + meal.grams, 0);
  if (drift !== 0) split[split.length - 1].grams += drift;
  return split;
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, Number(n) || lo));
}
