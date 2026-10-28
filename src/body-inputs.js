// Reglas de entrada del producto, sin límites ni interpretaciones clínicas.
export const BODY_NUMBER_RULES = {
  weight: { required: true, allowZero: false },
  measurement: { required: false, allowZero: false },
  restingHr: { required: false, allowZero: false },
  sleep: { required: false, allowZero: true },
  steps: { required: false, allowZero: true },
};

export const BODY_INPUT_LABELS = {
  kg: 'Peso en kg', cintura: 'cintura', cadera: 'cadera', pecho: 'pecho',
  brazo: 'brazo', muslo: 'muslo', sleep: 'Horas de sueño',
  restingHr: 'Pulso en reposo (ppm)', steps: 'Pasos',
};
const measurementFields = ['cintura', 'cadera', 'pecho', 'brazo', 'muslo'];
const decimal = /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/;
const invalidDecimal = 'Introduce un decimal válido con coma o punto.';

export function parseBodyDecimal(value, {required = false, allowZero = false} = {}) {
  let number;
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    return required ? {valid: false, error: 'Introduce un valor.'} : {valid: true, value: null};
  }
  if (typeof value === 'number') number = value;
  else if (typeof value === 'string' && decimal.test(value.trim())) number = Number(value.trim().replace(',', '.'));
  else return {valid: false, error: invalidDecimal};
  if (!Number.isFinite(number)) return {valid: false, error: invalidDecimal};
  if (allowZero ? number < 0 : number <= 0) return {valid: false, error: allowZero ? 'No puede ser negativo.' : 'Debe ser mayor que cero.'};
  return {valid: true, value: number};
}

export function validateWeightDraft(value) {
  const parsed = parseBodyDecimal(value, BODY_NUMBER_RULES.weight);
  return parsed.valid ? parsed : {valid: false, errors: {kg: parsed.error}};
}

function validateFields(draft, fields, ruleFor) {
  const values = {}, errors = {};
  for (const field of fields) {
    const parsed = parseBodyDecimal(draft[field], ruleFor(field));
    if (parsed.valid) values[field] = parsed.value;
    else errors[field] = parsed.error;
  }
  return Object.keys(errors).length ? {valid: false, errors} : {valid: true, values};
}

export function validateMeasurementsDraft(draft) {
  return validateFields(draft, measurementFields, () => BODY_NUMBER_RULES.measurement);
}

export function validateWellnessDraft(draft) {
  return validateFields(draft, ['sleep', 'restingHr', 'steps'], field => BODY_NUMBER_RULES[field]);
}
