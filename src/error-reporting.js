import { withTimeout } from "./async-utils.js";
import { errorDetails, sanitizeDiagnostic } from "./error-utils.js";
import { supabase } from "./supabase.js";

const REPORT_TIMEOUT_MS = 5000;
const MAX_REPORTS_PER_PAGE = 10;
const seenReports = new Set();
let reportCount = 0;

const reportingEnabled = () => import.meta.env.VITE_ERROR_REPORTING_ENABLED === "true";

export async function reportClientError(kind, error, context = {}) {
  if (!reportingEnabled() || reportCount >= MAX_REPORTS_PER_PAGE) return;
  const details = errorDetails(error);
  const fingerprint = `${kind}:${details.message}:${details.stack.slice(0, 300)}`;
  if (seenReports.has(fingerprint)) return;
  seenReports.add(fingerprint);
  reportCount += 1;

  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user?.id) return;
    const { error: insertError } = await withTimeout(
      supabase.from("client_error_reports").insert({
        kind: sanitizeDiagnostic(kind, 40),
        message: details.message,
        stack: details.stack,
        component_stack: sanitizeDiagnostic(context.componentStack || "", 4000),
        path: sanitizeDiagnostic(window.location.pathname, 300),
        user_agent: sanitizeDiagnostic(navigator.userAgent, 500),
        release: sanitizeDiagnostic(import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA || "unknown", 100),
      }),
      REPORT_TIMEOUT_MS,
      "El reporte de error tardo demasiado.",
    );
    if (insertError) throw insertError;
  } catch {
    // Reporting must never create another user-facing failure.
  }
}

export function installGlobalErrorReporting() {
  const onError = (event) => reportClientError("window_error", event.error || event.message);
  const onRejection = (event) => reportClientError("unhandled_rejection", event.reason);
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
