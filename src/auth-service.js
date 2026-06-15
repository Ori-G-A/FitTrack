import { withTimeout } from "./async-utils.js";

const AUTH_REQUEST_TIMEOUT_MS = 15000;

export async function authenticate(client, mode, email, password) {
  const credentials = { email: email.trim().toLowerCase(), password };
  const request = mode === "login"
    ? client.auth.signInWithPassword(credentials)
    : client.auth.signUp(credentials);
  const { error } = await withTimeout(
    request,
    AUTH_REQUEST_TIMEOUT_MS,
    "La autenticacion tardo demasiado.",
  );
  if (error) throw error;
}
