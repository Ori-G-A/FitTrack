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
  // Peso, medidas y nota comparten pantalla (Cuerpo) a propósito, pero cada una
  // abre su sección: el banco tiene que llevar la sección, no solo la pantalla.
  assert.match(bench, /setBodySection\(\["peso", "medidas", "nota", "checkin"\]\.includes\(tab\)/);
  assert.match(bench, /section=\{bodySection \|\| "peso"\}/);
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
  assert.match(app, /const BODY_TABS = \["cuerpo", "peso", "medidas", "nota", "checkin"\]/);
  assert.match(app, /<BodyScreen key=\{tab\} section=\{tab\}/);
  // Una pantalla, cuatro secciones conmutables: si desaparece el selector,
  // vuelven a ser cuatro destinos sueltos.
  assert.match(body, /onClick=\{\(\) => setSection\(id\)\}/);

  // El peso se registra con stepper y atajos, no con un campo suelto, y la coma
  // decimal es la de la app: escribirla no puede invalidar el pesaje.
  assert.match(body, /aria-label="Subir 0,1 kg"/);
  assert.match(body, /const parseKg = \(value\) => Number\(String\(value\)\.replace\(",", "\."\)\)/);
  assert.doesNotMatch(body, /setKg\([^)]*toFixed\(1\)\)/);
});

test("un perfil de hombre no ve nada del ciclo", async () => {
  const body = await readFile(new URL("../src/BodyScreen.jsx", import.meta.url), "utf8");
  const dash = await readFile(new URL("../src/DashboardScreen.jsx", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");

  // El check-in, la fase en la tira de peso, la tarjeta de Métricas y la fila de
  // Añadir se apagan con el mismo criterio, no cada una por su cuenta.
  assert.match(body, /const cycle = tracksCycle\(goals\)/);
  assert.match(body, /\.\.\.\(cycle \? \[\["checkin"/);
  assert.match(body, /\{cycle && \(\s*\n\s*<div>\s*\n\s*<span className="k">FASE ESTIMADA/);
  assert.match(dash, /on\("cuerpo"\) && tracksCycle\(goals\) && cyc/);
  assert.match(app, /tracksCycle\(goals\) \? \[\{ id: "checkin"/);
});

test("sin ciclo no salen avisos de ciclo ni corrección por fase", async () => {
  const alerts = await readFile(new URL("../src/alerts.js", import.meta.url), "utf8");
  // Se apaga en el origen: sin inicios de ciclo, ni retención lútea que descontar
  // de la tendencia ni avisos que emitir.
  assert.match(alerts, /const cycle = tracksCycle\(goals\)/);
  assert.match(alerts, /const starts = cycle \? buildCycleStarts/);
  assert.match(alerts, /if \(!cycle\) return a;/);
});

test("guardar confirma: hay toast en las cuatro pantallas que escriben", async () => {
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  // Un solo <Toast /> montado en App; las pantallas solo emiten.
  assert.match(app, /<Toast \/>/);
  assert.match(app, /\.ft-toast\{position:fixed;right:18px;bottom:18px/);

  for (const file of ["BodyScreen.jsx", "NutritionScreen.jsx", "LibraryScreen.jsx"]) {
    const source = await readFile(new URL(`../src/${file}`, import.meta.url), "utf8");
    assert.match(source, /import \{ toast \} from "\.\/toast\.jsx"/, `${file} no importa toast`);
    assert.ok(source.includes("toast(`"), `${file} no confirma ningún guardado`);
  }

  // JSX en .js no lo transforma Vite: el archivo tiene que seguir siendo .jsx.
  const toastFile = await readFile(new URL("../src/toast.jsx", import.meta.url), "utf8");
  assert.match(toastFile, /export function Toast/);
});

test("la rejilla de Métricas es fluida y no parte los gráficos", async () => {
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  // auto-fill en vez del salto seco a dos columnas en 860 px.
  assert.match(app, /\.ft-dc-grid\{display:grid;grid-template-columns:repeat\(auto-fill,minmax\(380px,1fr\)\)/);
  assert.doesNotMatch(app, /@media \(min-width:860px\)\{\.ft-dc-grid/);
  // 380 y no 240: a 315 px las etiquetas de eje se salen del área del gráfico.
  assert.doesNotMatch(app, /\.ft-dc-grid\{[^}]*minmax\(240px/);
});

test("el modo sesión va a pantalla completa, sin rail ni barra inferior", async () => {
  const session = await readFile(new URL("../src/SessionScreen.jsx", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");

  // Es la única pantalla que se usa de pie, con el móvil en la mano: el handoff
  // la marca como intocable y se había perdido al montarla dentro del marco.
  assert.match(session, /root\?\.classList\.add\("ft-focus"\)/);
  // Y se limpia sola al salir: sin el return, la app se queda sin navegación.
  assert.match(session, /return \(\) => root\?\.classList\.remove\("ft-focus"\)/);

  assert.match(app, /\.ft-root\.ft-focus \.ft-side,\.ft-root\.ft-focus \.ft-tabbar\{display:none;\}/);
  // Fondo propio del modo sesión, el del prototipo.
  assert.match(app, /\.ft-root\.ft-focus\{--bg:#141209;\}/);
});

test("en móvil la ficha reemplaza la lista y las cifras no se aprietan", async () => {
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  const nutrition = await readFile(new URL("../src/NutritionScreen.jsx", import.meta.url), "utf8");

  // Apilada debajo era la solución de escritorio encogida; el prototipo hace del
  // paso de cantidad una pantalla. Los paneles traen su propio Cerrar/Cancelar,
  // así que ocultar la lista no deja a nadie encerrado.
  assert.match(app, /@media \(max-width:959px\)\{\.ft-lib\.open \.ft-lib-list\{display:none;\}\}/);
  for (const vuelta of ["onClose", "Cancelar"]) {
    assert.ok(nutrition.includes(vuelta), `el panel de cantidad no ofrece ${vuelta}`);
  }

  // Cuatro cifras en 84 px no se leen. Tres sí: es la densidad del propio
  // prototipo en un teléfono de 390.
  assert.match(nutrition, /"--cols": isMobile \? 2 : 4/);
  assert.doesNotMatch(nutrition, /"--cols": 4/);
});

test("el rail y la barra móvil llevan a lo mismo, y nada queda huérfano", async () => {
  const app = await readFile(new URL("../src/FitTrack.jsx", import.meta.url), "utf8");
  const nav = app.match(/const NAV = \[[\s\S]*?\];/)?.[0] || "";
  const railIds = [...nav.matchAll(/id: "([a-z]+)"/g)].map((m) => m[1]);

  // El rail dejó de listar en plano tres tipos de destino. Si vuelve a crecer,
  // Más vuelve a duplicar: era la causa, no el síntoma.
  assert.deepEqual(railIds, ["diario", "plan", "dashboard", "mas"]);
  assert.match(app, /className="ft-nav-add" onClick=\{\(\) => \{ setSheet\("add"\)/);

  // Lo que sale del rail tiene que seguir teniendo camino. Registrar va por
  // Añadir; el resto, por las pantallas que ya enlazaban.
  const addIds = [...(app.match(/const ADD_ROWS = \[[\s\S]*?\];/)?.[0] || "").matchAll(/id: "([a-z]+)"/g)].map((m) => m[1]);
  for (const id of ["entrenar", "nutricion", "peso", "nota", "medidas"]) {
    assert.ok(addIds.includes(id), `${id} salió del rail y no está en Añadir`);
  }
  const more = await readFile(new URL("../src/MoreScreen.jsx", import.meta.url), "utf8");
  assert.match(more, /setTab\("biblioteca"\)/, "Biblioteca no tiene camino en móvil");
  // Y no vuelve a estar en dos sitios: registrar el cuerpo se hace desde Añadir.
  assert.doesNotMatch(more, /setTab\("cuerpo"\)/);
});

test("planificar otro día no son ocho flechas", async () => {
  const nutrition = await readFile(new URL("../src/NutritionScreen.jsx", import.meta.url), "utf8");
  // Selector nativo: el navegador ya trae el calendario. Sin él, planificar el
  // jueves o copiar de un día pasado se paga a un clic por día.
  assert.match(nutrition, /className="ft-input ft-mono ft-dc-date" type="date"/);
  assert.match(nutrition, /aria-label="Ir a otro día"/);
  // Las flechas se quedan para moverse de día en día.
  assert.match(nutrition, /aria-label="Día anterior"/);
});
