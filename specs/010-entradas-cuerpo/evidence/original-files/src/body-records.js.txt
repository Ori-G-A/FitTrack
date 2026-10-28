import { normalizeMenstrualLog } from "./cycle-context.js";

export function replaceWeightRecord(records, date, kg, createId) {
  return [...records.filter((w) => w.date !== date), { id: createId(), date, kg }].sort((a, b) => a.date.localeCompare(b.date));
}

export function measurementValues(draft) {
  return Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value === "" ? null : Number(value)]));
}

export function replaceMeasurementRecord(records, date, values, createId) {
  return [...records.filter((x) => x.date !== date), { id: createId(), date, ...values }].sort((a, b) => a.date.localeCompare(b.date));
}

export function wellnessDraft(record) {
  return record ? { sleep: record.sleep ?? "", restingHr: record.restingHr ?? "", steps: record.steps ?? "", energy: record.energy ?? 0, notes: record.notes ?? "" } : { sleep: "", restingHr: "", steps: "", energy: 0, notes: "" };
}

export function replaceWellnessRecord(records, date, draft, createId) {
  return [...records.filter((x) => x.date !== date), { id: createId(), date, sleep: draft.sleep === "" ? null : Number(draft.sleep), restingHr: draft.restingHr === "" ? null : Number(draft.restingHr), steps: draft.steps === "" ? null : Number(draft.steps), energy: draft.energy || null, notes: draft.notes.trim() }].sort((a, b) => a.date.localeCompare(b.date));
}

export function prepareMenstrualRecord(draft, existing, date, now, createId) {
  return normalizeMenstrualLog({ ...draft, id: existing?.id || draft.id || createId(), date, createdAt: existing?.createdAt }, now);
}

export function replaceMenstrualRecord(records, date, normalized) {
  return [...records.filter((item) => item.date !== date), normalized].sort((a, b) => a.date.localeCompare(b.date));
}

export function removeBodyRecord(records, id) {
  return records.filter((item) => item.id !== id);
}
