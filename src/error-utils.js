const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const TOKEN_PATTERN = /\b(?:eyJ[A-Za-z0-9_-]{20,}|[A-Fa-f0-9]{32,})\b/g;
const URL_QUERY_PATTERN = /(https?:\/\/[^\s?#]+)[?#][^\s)]+/g;

export function sanitizeDiagnostic(value, maxLength = 2000) {
  return String(value || "Sin detalle")
    .replace(EMAIL_PATTERN, "[correo]")
    .replace(TOKEN_PATTERN, "[token]")
    .replace(URL_QUERY_PATTERN, "$1")
    .slice(0, maxLength);
}

export function errorDetails(error) {
  if (error instanceof Error) {
    return {
      message: sanitizeDiagnostic(error.message, 500),
      stack: sanitizeDiagnostic(error.stack || error.message, 4000),
    };
  }
  return {
    message: sanitizeDiagnostic(error, 500),
    stack: "",
  };
}
