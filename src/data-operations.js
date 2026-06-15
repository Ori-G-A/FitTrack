import { withTimeout } from "./async-utils.js";

const DATA_REQUEST_TIMEOUT_MS = 15000;

export async function loadAppDataKey(client, userId, key, fallback) {
  const request = client
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

export async function upsertAppDataKey(client, userId, key, value) {
  const { error } = await withTimeout(
    client.from("app_data").upsert(
      { user_id: userId, key, value },
      { onConflict: "user_id,key" },
    ),
    DATA_REQUEST_TIMEOUT_MS,
    "El guardado tardo demasiado.",
  );
  if (error) throw error;
}
