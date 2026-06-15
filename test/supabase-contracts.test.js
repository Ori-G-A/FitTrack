import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { authenticate } from "../src/auth-service.js";
import { loadAppDataKey, upsertAppDataKey } from "../src/data-operations.js";
import { photoStoragePath, uploadPhotoWithClient } from "../src/photo-operations.js";

function queryResult(result, calls) {
  const query = {
    select(columns) { calls.push(["select", columns]); return query; },
    eq(column, value) { calls.push(["eq", column, value]); return query; },
    maybeSingle() { calls.push(["maybeSingle"]); return Promise.resolve(result); },
  };
  return query;
}

test("authentication normalizes email and calls the selected Supabase method", async () => {
  const calls = [];
  const client = { auth: {
    signInWithPassword: async (credentials) => { calls.push(["login", credentials]); return { error: null }; },
    signUp: async (credentials) => { calls.push(["register", credentials]); return { error: null }; },
  } };

  await authenticate(client, "login", "  USER@Example.COM ", "secret123");
  await authenticate(client, "register", "NEW@example.com", "secret456");

  assert.deepEqual(calls, [
    ["login", { email: "user@example.com", password: "secret123" }],
    ["register", { email: "new@example.com", password: "secret456" }],
  ]);
});

test("app data reads and writes remain scoped to user and key", async () => {
  const calls = [];
  const client = {
    from(table) {
      calls.push(["from", table]);
      return {
        ...queryResult({ data: { value: [{ id: 1 }] }, error: null }, calls),
        upsert(payload, options) {
          calls.push(["upsert", payload, options]);
          return Promise.resolve({ error: null });
        },
      };
    },
  };

  assert.deepEqual(await loadAppDataKey(client, "user-1", "workouts", []), [{ id: 1 }]);
  await upsertAppDataKey(client, "user-1", "goals", { kcalTarget: 2000 });

  assert.ok(calls.some((call) => call[0] === "eq" && call[1] === "user_id" && call[2] === "user-1"));
  assert.ok(calls.some((call) => call[0] === "eq" && call[1] === "key" && call[2] === "workouts"));
  assert.ok(calls.some((call) => call[0] === "upsert"
    && call[1].user_id === "user-1"
    && call[1].key === "goals"
    && call[2].onConflict === "user_id,key"));
});

test("photo uploads use the private bucket and an owner-prefixed path", async () => {
  const calls = [];
  const client = { storage: { from(bucket) {
    calls.push(["bucket", bucket]);
    return {
      async upload(path, blob, options) {
        calls.push(["upload", path, blob.type, options]);
        return { error: null };
      },
      async createSignedUrl(path, expiresIn) {
        calls.push(["signed", path, expiresIn]);
        return { data: { signedUrl: "https://signed.example/photo" }, error: null };
      },
    };
  } } };

  const photo = await uploadPhotoWithClient(client, "owner-uuid", {
    id: "photo-1",
    date: "2026-06-14",
    dataUrl: "data:image/jpeg;base64,/9j/",
  });

  assert.equal(photo.storagePath, "owner-uuid/photo-1.jpg");
  assert.equal(photo.signedUrl, "https://signed.example/photo");
  assert.deepEqual(photoStoragePath("owner-uuid", "image/png", "../unsafe"), "owner-uuid/unsafe.png");
  assert.ok(calls.some((call) => call[0] === "bucket" && call[1] === "progress-photos"));
  assert.ok(calls.some((call) => call[0] === "upload" && call[1] === "owner-uuid/photo-1.jpg"));
});

test("RLS migrations keep app data and progress photos owner-only", async () => {
  const appDataSql = await readFile(new URL("../supabase/migrations/20260614000000_secure_app_data_rls.sql", import.meta.url), "utf8");
  const photosSql = await readFile(new URL("../supabase/migrations/20260614010000_private_progress_photos.sql", import.meta.url), "utf8");

  assert.match(appDataSql, /enable row level security/i);
  assert.match(appDataSql, /revoke all on table public\.app_data from anon/i);
  assert.equal((appDataSql.match(/\(select auth\.uid\(\)\) = user_id/g) || []).length, 5);
  assert.match(photosSql, /'progress-photos'[\s\S]*false/i);
  assert.equal((photosSql.match(/\(storage\.foldername\(name\)\)\[1\] = \(select auth\.uid\(\)\)::text/g) || []).length, 5);
});

test("error reports are insert-only and scoped to the authenticated owner", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260615000000_client_error_reports.sql", import.meta.url), "utf8");
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /id uuid primary key default gen_random_uuid\(\)/i);
  assert.match(sql, /client_error_reports \(created_at desc\)/i);
  assert.match(sql, /revoke all on table public\.client_error_reports from anon, authenticated/i);
  assert.match(sql, /grant insert on table public\.client_error_reports to authenticated/i);
  assert.doesNotMatch(sql, /grant select/i);
  assert.match(sql, /with check \(\(select auth\.uid\(\)\) = user_id\)/i);
});
