import test from "node:test";
import assert from "node:assert/strict";
import { OperationTimeoutError, withTimeout } from "../src/async-utils.js";

test("withTimeout returns operations that finish in time", async () => {
  assert.equal(await withTimeout(Promise.resolve("ok"), 50), "ok");
});

test("withTimeout rejects stalled operations with a recognizable error", async () => {
  await assert.rejects(
    withTimeout(new Promise(() => {}), 5, "Tiempo agotado"),
    (error) => error instanceof OperationTimeoutError
      && error.code === "OPERATION_TIMEOUT"
      && error.message === "Tiempo agotado",
  );
});
