export const RPE_STEPS = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10];

// Tren inferior mueve saltos de carga mayores que el superior.
const LOWER_BODY = new Set(["Cuadriceps", "Cu\u00e1driceps", "Femoral", "Gl\u00fateos", "Gluteos", "Aductores", "Gemelos"]);

// "7-8", "7–8", "8" -> [7, 8]
export function parseRpeTarget(target) {
  const nums = String(target ?? "").match(/\d+(?:[.,]\d+)?/g);
  if (!nums || !nums.length) return null;
  const values = nums.map((n) => parseFloat(n.replace(",", ".")));
  return [values[0], values[values.length - 1]];
}

// Que hacer en la SIGUIENTE serie del mismo ejercicio, a partir de como salio la
// que se acaba de registrar. Es ajuste intra-sesion (backoff normal despues de
// una serie de tope), no progresion: subir la prescripcion de la proxima sesion
// pide 2+ sesiones completas al RPE objetivo y no lo decide una sola serie.
export function nextSetAdvice({ rpe, targetRpe, kg, muscle } = {}) {
  const done = parseFloat(rpe);
  const range = parseRpeTarget(targetRpe);
  const load = Number(kg) || 0;
  if (!done) return null;

  // Llegar al fallo donde no tocaba acumula fatiga sin estimulo extra.
  if (done >= 9.5 && (!range || range[1] < 9)) {
    return { kg: load ? round(load * 0.93) : null, kind: "backoff", text: "Serie al fallo o casi. Baja un ~7 % en la siguiente y recupera el rango objetivo." };
  }
  if (!range) return null;
  const [low, high] = range;

  if (done >= high + 1) {
    return { kg: load ? round(load * 0.93) : null, kind: "backoff", text: `Salió ${fmt(done - high)} por encima del objetivo. Baja un ~7 % en la siguiente; el backoff después de una serie dura es lo normal.` };
  }
  if (done <= low - 1) {
    const step = LOWER_BODY.has(muscle) ? 5 : 2.5;
    return { kg: load ? round(load + step) : null, kind: "up", text: `Te sobró margen (${fmt(low - done)} por debajo). Puedes sumar ${fmt(step)} kg en la siguiente serie.` };
  }
  return { kg: load || null, kind: "hold", text: "En el rango objetivo: repite la misma carga en la siguiente serie." };
}

const round = (value) => Math.round(value * 2) / 2;
const fmt = (value) => String(Math.round(value * 10) / 10).replace(".", ",");
