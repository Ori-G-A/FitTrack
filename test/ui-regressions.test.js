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
  assert.deepEqual(destinos.sort(), ["entrenar", "medidas", "nota", "nutricion", "peso"]);

  // La app tiene que renderizar los tres, y el banco de pruebas tiene que
  // enrutarlos por separado: colapsarlos mandaba toda fila a Entrenar.
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  const bench = await readFile(new URL("../src/preview-main.jsx", import.meta.url), "utf8");
  const mapa = bench.match(/const TAB_TO_SCREEN = \{[^}]*\}/)?.[0] || "";
  // Los cuatro de Cuerpo son la misma pantalla con una sección activa.
  const cuerpo = app.match(/const BODY_TABS = \[[^\]]*\]/)?.[0] || "";
  for (const destino of destinos) {
    const renderiza = app.includes(`tab === "${destino}"`) || cuerpo.includes(`"${destino}"`);
    assert.ok(renderiza, `la app no renderiza ${destino}`);
    assert.match(mapa, new RegExp(`${destino}: "([^"]+)"`), `el banco no enruta ${destino}`);
  }
  const pantallas = [...mapa.matchAll(/(peso|medidas|nota|entrenar|nutricion): "([^"]+)"/g)].map((m) => m[2]);
  assert.equal(new Set(pantallas).size, 5, "el banco colapsa dos destinos en la misma pantalla");
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

test("Más es una pantalla con la cuenta, no una hoja de atajos", async () => {
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  const more = await readFile(new URL("../src/MoreScreen.jsx", import.meta.url), "utf8");

  // La hoja "more" se fue entera: si vuelve, hay dos Más con contenidos distintos.
  assert.doesNotMatch(app, /setSheet\("more"\)/);
  assert.doesNotMatch(app, /const MORE_ROWS/);
  assert.match(app, /goTo\("mas"\)/);
  assert.match(app, /tab === "mas"/);
  assert.match(app, /tab === "perfil"/);

  // Lo que faltaba del mockup: de quién es la cuenta.
  assert.match(more, /ft-more-user/);
  assert.match(more, /\{userEmail\}/);

  // Nada de filas que no llevan a ningún sitio.
  assert.doesNotMatch(more, /disabled/);
});

test("Biblioteca abre con la lista y la ficha vive en el panel derecho", async () => {
  const lib = await readFile(new URL("../src/LibraryScreen.jsx", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");

  // Lo que se repintaba: el formulario de alta era lo primero de la pantalla.
  // Ahora el alta es un botón y la ficha solo existe cuando hay algo abierto.
  assert.match(lib, /const \[open, setOpen\] = useState\(null\)/);
  assert.match(lib, /\{detail && <div className="ft-lib-detail">/);
  assert.match(lib, /onClick=\{\(\) => setOpen\("nuevo"\)\}/);

  // Filtros de lugar y músculo, deducidos de los ejercicios y no de una etiqueta.
  assert.match(lib, /routinePlace\(r\)/);
  assert.match(lib, /e\.primary/);

  // La versión vieja se borró: dos bibliotecas divergen a la primera edición.
  assert.doesNotMatch(app, /export function Library\(/);
  assert.doesNotMatch(app, /export function Routines\(/);
  assert.match(app, /<LibraryScreen/);
});

test("registrar comida no se puede sin cantidad", async () => {
  const screen = await readFile(new URL("../src/NutritionScreen.jsx", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");

  // El paso de cantidad es lo único que el handoff marca como intocable de esta
  // pantalla: sin él se registran raciones inventadas y los macros del día no
  // significan nada. Elegir abre el panel; guardar exige un número mayor que 0.
  assert.match(screen, /const valid = amount > 0;/);
  assert.match(screen, /className="ft-dc-btn" disabled=\{!valid\}/);
  assert.match(screen, /pick && \(/);

  // Las cuatro pestañas del prototipo, sobre datos que ya existen.
  for (const key of ["buscar", "mios", "recetas", "recientes"]) {
    assert.ok(screen.includes(`"${key}"`), `falta la pestaña ${key}`);
  }

  // La versión vieja se borró: dos pantallas de nutrición divergen enseguida.
  assert.doesNotMatch(app, /export function Nutrition\(/);
  assert.match(app, /<NutritionScreen/);
});

test("Cuerpo se registra en cuatro pantallas, no en una pila de formularios", async () => {
  const body = await readFile(new URL("../src/BodyScreen.jsx", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");

  // Una sección activa por vez: seis tarjetas apiladas hacían el trabajo de
  // cuatro pantallas del prototipo.
  for (const section of ["peso", "medidas", "nota", "checkin"]) {
    assert.match(body, new RegExp(`section === "${section}"`), `falta la sección ${section}`);
  }
  assert.match(app, /const BODY_TABS = \["peso", "medidas", "nota", "checkin"\]/);
  assert.match(app, /<BodyScreen key=\{tab\} section=\{tab\}/);

  // El peso se registra con stepper y atajos, no con un campo suelto, y la coma
  // decimal es la de la app: escribirla no puede invalidar el pesaje.
  assert.match(body, /aria-label="Subir 0,1 kg"/);
  assert.match(body, /const parseKg = \(value\) => Number\(String\(value\)\.replace\(",", "\."\)\)/);
  assert.doesNotMatch(body, /setKg\([^)]*toFixed\(1\)\)/);
});
