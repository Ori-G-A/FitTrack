import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readVercelConfig = async () => JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
);

test("Vercel applies the required security headers to every route", async () => {
  const config = await readVercelConfig();
  const globalRule = config.headers.find((rule) => rule.source === "/(.*)");
  assert.ok(globalRule);
  const headers = Object.fromEntries(globalRule.headers.map(({ key, value }) => [key, value]));

  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["Cross-Origin-Opener-Policy"], "same-origin");
  assert.equal(headers["Strict-Transport-Security"], "max-age=31536000");
  assert.match(headers["Content-Security-Policy"], /default-src 'self'/);
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.match(headers["Content-Security-Policy"], /connect-src[^;]*data:/);
  assert.match(headers["Content-Security-Policy"], /connect-src[^;]*https:\/\/\*\.supabase\.co/);
  assert.match(headers["Content-Security-Policy"], /img-src[^;]*data:[^;]*blob:[^;]*https:\/\/\*\.supabase\.co/);
});
