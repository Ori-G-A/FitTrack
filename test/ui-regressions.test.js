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

test("el aviso de ritmo persiste su decisión en goals, no en estado local", async () => {
  const source = await readFile(new URL("../src/DiarioScreen.jsx", import.meta.url), "utf8");
  // Sin paceCheckedAt en goals, el aviso reaparece a cada montaje del Diario
  // pidiendo otro ajuste sobre el objetivo que acaba de subir.
  assert.match(source, /setGoals\(\(current\) => \(\{ \.\.\.current, \.\.\.patch, paceCheckedAt: today \}\)\)/);
  // Deshacer tiene que devolver también la marca, o el aviso queda mudo 3 semanas.
  assert.match(source, /previous = \{[^}]*paceCheckedAt: goals\.paceCheckedAt[^}]*\}/);
  assert.doesNotMatch(source, /useState\(false\);\s*\n\s*const \[previous/);
});

test("el arranque pinta el tema antes de que React monte", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  // Sin esto la carga es un flash blanco sobre una app oscura.
  assert.match(html, /html\{background:#17150f/);
  assert.match(html, /localStorage\.getItem\("ft-theme"\) \|\| "dark"/);
  // El @import de las fuentes tiene que seguir siendo la primera regla de CSS,
  // o el navegador lo descarta y la app pierde Archivo e IBM Plex Mono.
  const source = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  const css = source.slice(source.indexOf("export const CSS = `"));
  assert.match(css.slice(0, 260), /^export const CSS = `\r?\n@import url\(/);
});

test("cada fila del diario aterriza en la pantalla de su tipo", async () => {
  const utils = await readFile(new URL("../src/app-utils.js", import.meta.url), "utf8");
  const feed = utils.slice(utils.indexOf("export function dayFeed"), utils.indexOf("export function searchFeed"));
  const destinos = [...new Set([...feed.matchAll(/tab: "([a-z]+)"/g)].map((m) => m[1]))];
  // Si dayFeed inventa un destino nuevo, esto avisa antes de que la fila caiga
  // en el `|| "Diario"` de turno y el usuario acabe en otra pantalla.
  assert.deepEqual(destinos.sort(), ["cuerpo", "entrenar", "nutricion"]);

  // La app tiene que renderizar los tres, y el banco de pruebas tiene que
  // enrutarlos por separado: colapsarlos mandaba toda fila a Entrenar.
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  const bench = await readFile(new URL("../src/preview-main.jsx", import.meta.url), "utf8");
  const mapa = bench.match(/const TAB_TO_SCREEN = \{[^}]*\}/)?.[0] || "";
  for (const destino of destinos) {
    assert.match(app, new RegExp(`tab === "${destino}"`), `la app no renderiza ${destino}`);
    assert.match(mapa, new RegExp(`${destino}: "([^"]+)"`), `el banco no enruta ${destino}`);
  }
  const pantallas = [...mapa.matchAll(/(cuerpo|entrenar|nutricion): "([^"]+)"/g)].map((m) => m[2]);
  assert.equal(new Set(pantallas).size, 3, "el banco colapsa dos destinos en la misma pantalla");
});

test("el día del Plan recibe todo el día, no solo el entreno", async () => {
  const plan = await readFile(new URL("../src/PlanScreen.jsx", import.meta.url), "utf8");
  // Sin dayFeed sobre el dia seleccionado, la tarjeta vuelve a ser solo la sesion.
  assert.match(plan, /dayFeed\(selected\.iso, \{ workouts, nutrition, weights, measurements, wellness \}\)/);
  // Cada fila y cada hueco pendiente abren su editor en la fecha del dia mirado,
  // no en la de hoy: sin el segundo argumento se registra sobre el dia equivocado.
  assert.match(plan, /setTab\(entry\.tab, selected\.iso\)/);
  assert.match(plan, /setTab\(option\.tab, selected\.iso\)/);
  assert.match(plan, /setTab\("entrenar", selected\.iso\)/);

  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  const uso = app.match(/<PlanScreen[^>]*\/>/)?.[0] || "";
  for (const prop of ["nutrition=", "weights=", "measurements=", "wellness="]) {
    assert.match(uso, new RegExp(prop), `Plan no recibe ${prop}`);
  }
  // goTo, no setTab: setTab ignora la fecha y el Plan abriria siempre hoy.
  assert.match(uso, /setTab=\{goTo\}/);
  // Y volver a una raíz tiene que limpiar la fecha enfocada, o la pantalla
  // reaparece en el día que se miró hace tres navegaciones.
  assert.doesNotMatch(app, /onClick=\{\(\) => setTab\("(diario|dashboard|plan)"\)\}/);
});

test("los avisos se leen en el Diario y saltan a su tarjeta de Métricas", async () => {
  const diario = await readFile(new URL("../src/DiarioScreen.jsx", import.meta.url), "utf8");
  const dash = await readFile(new URL("../src/DashboardScreen.jsx", import.meta.url), "utf8");

  // El Diario los pinta; Métricas ya no. Si vuelven a los dos sitios, son dos
  // respuestas a la misma pregunta y una acabará desactualizada.
  assert.match(diario, /buildAlerts\(alertMetrics\(/);
  assert.match(diario, /onClick=\{\(\) => openCard\(alert\.card\)\}/);
  assert.doesNotMatch(dash, /buildAlerts/);
  assert.doesNotMatch(dash, /Avisos · \{alerts\.length\}/);

  // El destino solo existe si la tarjeta lleva ancla, y solo se ve si el filtro
  // activo no la esconde.
  assert.match(dash, /<div id=\{id \? `card-\$\{id\}` : undefined\}/);
  assert.match(dash, /document\.getElementById\(`card-\$\{focusCard\}`\)/);
  assert.match(dash, /if \(!focusCard\) return;\s*\n\s*setFilter\("all"\);/);

  // La cadena de métricas vive en un solo sitio: Métricas y Diario la comparten.
  const alerts = await readFile(new URL("../src/alerts.js", import.meta.url), "utf8");
  assert.match(alerts, /export function alertMetrics/);
  assert.doesNotMatch(dash, /const trend = useMemo/);
});
