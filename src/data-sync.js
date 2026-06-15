import { useEffect } from "react";
import { withTimeout } from "./async-utils.js";
import { supabase } from "./supabase.js";

const DATA_REQUEST_TIMEOUT_MS = 15000;
const saveBus = { status: "idle", error: null, at: null, pending: 0, listeners: new Set() };
const saveQueues = new Map();
const suspendedUsers = new Set();

function emitSave(status, error = null) {
  saveBus.status = status;
  saveBus.error = error;
  saveBus.at = Date.now();
  saveBus.listeners.forEach((listener) => listener({ status, error }));
}

export function onSaveStatus(callback) {
  saveBus.listeners.add(callback);
  return () => saveBus.listeners.delete(callback);
}

export async function loadKey(userId, key, fallback) {
  const request = supabase
    .from("app_data")
    .select("value")
    .eq("user_id", userId)
    .eq("key", key)
    .maybeSingle();
  const { data, error } = await withTimeout(
    request,
    DATA_REQUEST_TIMEOUT_MS,
    "La carga de datos tardo demasiado.",
  );
  if (error) throw error;
  return data?.value ?? fallback;
}

async function persistKey(userId, key, value) {
  if (saveBus.pending === 0) saveBus.error = null;
  saveBus.pending += 1;
  emitSave("saving");
  try {
    const { error } = await withTimeout(
      supabase.from("app_data").upsert(
        { user_id: userId, key, value },
        { onConflict: "user_id,key" },
      ),
      DATA_REQUEST_TIMEOUT_MS,
      "El guardado tardo demasiado.",
    );
    if (error) throw error;
  } catch (error) {
    console.error("saveKey", key, error);
    saveBus.error = error.message || "Error al guardar";
  } finally {
    saveBus.pending = Math.max(0, saveBus.pending - 1);
    if (saveBus.pending === 0) emitSave(saveBus.error ? "error" : "saved", saveBus.error);
  }
}

export function saveKey(userId, key, value) {
  if (!userId) {
    emitSave("error", "Sin sesion activa");
    return Promise.resolve();
  }
  if (suspendedUsers.has(userId)) return Promise.resolve();
  const queueKey = `${userId}:${key}`;
  const previous = saveQueues.get(queueKey) || Promise.resolve();
  const next = previous.catch(() => {}).then(() => persistKey(userId, key, value));
  saveQueues.set(queueKey, next);
  next.finally(() => {
    if (saveQueues.get(queueKey) === next) saveQueues.delete(queueKey);
  });
  return next;
}

export function useSyncedValue(userId, key, value, enabled, delay = 600) {
  useEffect(() => {
    if (!enabled || !userId) return undefined;
    const timeout = setTimeout(() => saveKey(userId, key, value), delay);
    return () => clearTimeout(timeout);
  }, [userId, key, value, enabled, delay]);
}

export const waitForUserSaves = (userId) => Promise.allSettled(
  [...saveQueues.entries()]
    .filter(([key]) => key.startsWith(`${userId}:`))
    .map(([, pending]) => pending),
);

export const suspendUserSaves = (userId) => suspendedUsers.add(userId);
export const resumeUserSaves = (userId) => suspendedUsers.delete(userId);
