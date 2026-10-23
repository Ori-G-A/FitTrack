import { useEffect } from "react";
import { loadAppDataKey, upsertAppDataKey } from "./data-operations.js";
import { createSaveCoordinator } from "./save-coordinator.js";
import { supabase } from "./supabase.js";

const coordinator = createSaveCoordinator((userId, key, value) => upsertAppDataKey(supabase, userId, key, value));
export const { onSaveStatus, getSaveStatus, saveKey, waitForUserSaves, suspendUserSaves, resumeUserSaves } = coordinator;

export async function loadKey(userId, key, fallback, client = supabase) {
  return loadAppDataKey(client, userId, key, fallback);
}

export function useSyncedValue(userId, key, value, enabled, delay = 600) {
  useEffect(() => {
    if (!enabled || !userId) return undefined;
    const timeout = setTimeout(() => saveKey(userId, key, value), delay);
    return () => clearTimeout(timeout);
  }, [userId, key, value, enabled, delay]);
}
