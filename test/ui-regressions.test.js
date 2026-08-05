import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("manual duration saves on Enter, on blur and by itself", async () => {
  const source = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  const input = source.slice(source.indexOf("Minutos (editar a mano)"), source.indexOf("Minutos (editar a mano)") + 600);
  assert.match(input, /onBlur=\{commitDuration\}/);
  assert.match(input, /e\.key === "Enter"[\s\S]*?commitDuration\(\)/);
  // El teclado numérico del móvil no trae Enter: sin autoguardado el valor se pierde.
  const autosave = source.match(/setTimeout\(commitDuration, \d+\)/);
  assert.ok(autosave, "falta el autoguardado con debounce de la duración manual");
  // La guarda evita que al montar (input vacío == 0 guardado) se reescriba la sesión.
  assert.match(source, /if \(durInput === \(session\.durationMin \? String\(session\.durationMin\) : ""\)\) return;/);
});

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
