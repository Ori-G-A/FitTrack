import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("nutrition imports every editorial token it renders", async () => {
  const source = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  const importBlock = source.match(/import \{[\s\S]*?\} from "\.\/EditorialUI\.jsx";/)?.[0] || "";
  const nutrition = source.slice(
    source.indexOf("export function Nutrition"),
    source.indexOf("/* ----------------------------- LIBRARY"),
  );

  for (const token of ["A_ACC", "A_DANGER", "A_HAIR", "A_OK"]) {
    assert.match(nutrition, new RegExp(`\\b${token}\\b`));
    assert.match(importBlock, new RegExp(`\\b${token}\\b`));
  }
  assert.doesNotMatch(nutrition, /<DNeed\b/);
});
