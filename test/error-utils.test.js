import test from "node:test";
import assert from "node:assert/strict";
import { errorDetails, sanitizeDiagnostic } from "../src/error-utils.js";

test("sanitizeDiagnostic removes common identifiers and URL parameters", () => {
  const value = sanitizeDiagnostic(
    "user@example.com https://example.com/path?token=secret eyJabcdefghijklmnopqrstuvwxyz123456",
  );
  assert.equal(value, "[correo] https://example.com/path [token]");
});

test("errorDetails limits diagnostic sizes", () => {
  const error = new Error("x".repeat(700));
  const details = errorDetails(error);
  assert.equal(details.message.length, 500);
  assert.ok(details.stack.length <= 4000);
});
