# Plan de validación — 006

Estado: APROBADO; pruebas previstas, no ejecutadas. Fecha: 2026-10-19.
[Plan](plan.md), [tareas](tasks.md), [spec](spec.md), [survey](../../docs/sdd/interfaz-survey.md).

## Grupos contractuales y cláusulas

Cada FR y su escenario comparten un grupo, no una aserción genérica de humo.
Los nombres siguientes son los previstos; tests ejecutados del manifiesto siguen
vacíos. Todos los subcasos de cada fila deben cubrirse para declararla completa.

### FR-001 / US1-AS1 — AS-IS (T003)

Archivo: test/interface-navigation.test.js.

- interfaz conserva raices activas y entradas de shell
- interfaz navegador raices registrar y fechas

Comprobar los cuatro destinos, orden distinto de barras, estados activos, apertura/cierre del rail por hover/focus/clic y entrada a cuenta por nombre; no exigir orden idéntico entre barras.

### FR-002 / US1-AS2 — AS-IS (T004)

Archivo: test/interface-registration.test.js.

- interfaz conserva destinos de registrar segun ciclo
- interfaz navegador raices registrar y fechas

Enumerar filas y orden con tracksCycle true/false; cada fila abre su pantalla y cierra hoja. Probar fondo/contenido/cerrar antes de añadir teclado; no ampliar condición de ciclo.

### FR-003 / US1-AS3 — AS-IS (T005)

Archivo: test/interface-routing.test.js.

- interfaz conserva fecha enfocada y tarjeta solicitada
- interfaz navegador raices registrar y fechas

Fecha histórica desde fila, limpieza al entrar a raíz y después Registrar, orden de setters, openCard limpia fecha y conserva ID; probar no añadir validación a destinos existentes.

### FR-004 / US1-AS4 — AS-IS (T006)

Archivo: test/interface-account.test.js.

- interfaz conserva alias de cuenta y seleccion local
- interfaz navegador cuenta cuerpo y plan

Montar cuenta/perfil/ajustes; pestañas y composición; rerender section en la misma instancia conserva selección; remontaje vuelve a inicializar. Cubrir UI-006-005 por separado del caso feliz.

### FR-005 / US1-AS5 — AS-IS (T007)

Archivo: test/interface-body-routing.test.js.

- interfaz conserva alias seccion fecha y montaje de cuerpo
- interfaz navegador cuenta cuerpo y plan

cuerpo/peso/medidas/nota/checkin con key por tab; fecha inicial, cambios entre alias/sección, desmontaje y condiciones de ciclo sin unificar reglas 005.

### FR-006 / US1-AS6 — AS-IS (T008)

Archivo: test/interface-diary.test.js.

- interfaz conserva busqueda filtros limites y vacios de diario
- interfaz navegador diario busqueda y descartes

trim/case, menos de dos caracteres, 40 resultados y 460 fechas distintas, orden, coincidencia de ejercicio en meta, filtro antes/después y limpiar sin resetear filtros. Fixtures mayores que cada límite.

### FR-007 / US1-AS7 — AS-IS (T009)

Archivo: test/interface-plan.test.js.

- interfaz conserva destinos y fecha del dia del plan
- interfaz navegador cuenta cuerpo y plan

Elegir día distinto de hoy, fila sesión/comida/peso/medida/bienestar, huecos y enlace rutinas; comprobar destino/fecha reales y que datos del día seleccionado llegan completos.

### FR-008 / US1-AS8 — AS-IS (T010)

Archivo: test/interface-metric-focus.test.js.

- interfaz conserva filtro ancla resaltado y retorno temprano
- interfaz navegador metricas tarjeta y desglose

Nodo presente: all, scroll y clase; comprobar 2199/2200 ms con reloj controlado, callback y cleanup. Nodo inicialmente ausente por filtro y ID inexistente: retorno temprano, sin inventar reintento o consumo.

### FR-009 / US2-AS1 — AS-IS (T011)

Archivo: test/interface-theme.test.js.

- interfaz conserva preferencia y fallos de almacenamiento
- interfaz navegador temas carga y errores

vacío/auto/light/dark/inválido; lectura y escritura que lanzan; default dark; persistencia de elección y API de app-utils. No cambiar script inicial.

### FR-010 / US2-AS2 — AS-IS (T012)

Archivo: test/interface-theme-lifecycle.test.js.

- interfaz conserva tema de sistema primer render y limpieza
- interfaz navegador temas carga y errores

Auto cambia con media query; explícitos prevalecen; registrar add/remove del mismo listener, StrictMode y desmontaje. Ejecutar script real de index antes de React; inválido conserva light inicial y dark tras App; lectura bloqueada y falta de matchMedia conservan sus caminos.

### FR-011 / US2-AS3 — AS-IS (T013)

Archivo: test/interface-toast.test.js.

- interfaz conserva toast ultimo mensaje plazo y limpieza
- interfaz navegador temas carga y errores

Mensaje vacío ignorado, emisión premontaje sin replay, último reemplaza, 2599/2600 ms y plazo reiniciado, status/polite, ms inyectado, limpieza y remount. No usar toast como resultado remoto.

### FR-012 / US2-AS4 — AS-IS (T014)

Archivo: test/interface-boot.test.js.

- interfaz conserva cargas reintentos errores y estado de guardado
- interfaz navegador temas carga y errores

Sesión undefined/null/válida/error/reintentar; carga diferida/error/reintentar; suspender import diferido solo en bundle de test; fallback ErrorBoundary por tema y clic Recargar. Guardando/Guardado/Error al guardar distintos del toast. Reporter y servicios falsos, sin red.

### FR-013 / US2-AS5 — AS-IS (T015)

Archivo: test/interface-detail.test.js.

- interfaz conserva contenido y cierres de desglose
- interfaz navegador metricas tarjeta y desglose

Título, kicker/sub, filas con valores de 003–005, strong y campos opcionales ausentes; contenido no cierra, fondo y botón sí. Montar desde Diario y Métricas, no solo fixture aislada.

### FR-014 / US3-AS1 — AS-IS (T016)

Archivo: test/interface-responsive.test.js.

- interfaz conserva CSS y matriz responsive original
- interfaz navegador responsive geometria y tacto

Capturar cadena CSS original y cajas reales a 390/420/720/721/959/960/1280, altura 900; visibilidad rail/barra, Biblioteca lista/ficha, grid Métricas y dimensiones de gráficos, datos vacíos y representativos. No convertir overflow existente en corrección oculta.

### FR-015 / US3-AS2 — AS-IS (T017)

Archivo: test/interface-session.test.js.

- interfaz conserva foco visual de sesion y salida limpia
- interfaz navegador sesion biblioteca nutricion y previews

Montar sesión con ejercicios mediante flujo real, ft-focus oculta navegación, fondo y ancho; salir y desmontar retiran clase. Reutilizar pruebas 003 y comprobar interacción con shell App.

### FR-016 / US3-AS3 — AS-IS (T018)

Archivo: test/interface-touch.test.js.

- interfaz conserva cabecera sticky y medidas tactiles
- interfaz navegador responsive geometria y tacto

Lista larga, scroll real, cabecera sigue en su posición original; steppers normal/sm, trash/addset/iconbtn, selects de fuerza y excepciones. Comparar getBoundingClientRect y estilos computados en 390/1280, no solo regex.

### FR-017 / US3-AS4 — AS-IS (T019)

Archivo: test/interface-screens.test.js.

- interfaz conserva recorridos y salidas de registro
- interfaz navegador sesion biblioteca nutricion y previews

Biblioteca lista/ficha/nuevo, Nutrición día/buscar/cantidad/back/close y cantidad inválida, Cuerpo una sección; round trip con guardado y mismo snapshot de 003–005. Sin reescribir esas operaciones.

### FR-018 / US3-AS5 — AS-IS (T020)

Archivo: test/interface-editorial.test.js.

- interfaz conserva componentes fechas movimiento y cleanup
- interfaz navegador responsive geometria y tacto

EDateNav fechas locales y anterior/siguiente, Spark oculto con menos de dos y decorativo, reveal/timeout y cancelación, KpiStrip 639/640, listener resize retirado; reduced-motion preserva solo las excepciones reales.

### FR-019 / US3-AS6 — AS-IS (T021)

Archivo: test/interface-previews.test.js.

- interfaz conserva contratos diferentes de ambos previews
- interfaz navegador sesion biblioteca nutricion y previews

Enumerar destinos admitidos de preview-main y maqueta, secciones/fecha donde existe y diferencias de tema/estado; comprobar cada uno sin asumir misma semántica que App. Construir sin cliente real.

### FR-020 / US3-AS7 — AS-IS (T022)

Archivo: test/interface-compatibility.test.js.

- interfaz conserva fachadas CSS y contratos anteriores
- interfaz navegador sesion biblioteca nutricion y previews

Exports de FitTrack/Train/CSS y app-utils antes/después; imports de pantallas/previews/harness; 68 pins previos; matrices 001–005 y cadena CSS en orden. Revisar cada una de las 21 regresiones estáticas sin falsear sus títulos.

### FR-021 / US4-AS1 — CHANGE (T023)

Archivo: change-tests/interface-accessibility.spec.js.

- interfaz cambio Registrar teclado y foco
- interfaz cambio DetailSheet teclado y foco

Cinco rojos independientes descritos abajo; este FR usa dos: Registrar y DetailSheet, incluyendo apertura, Tab/Shift+Tab, Escape, cancelación/restauración, selección con navegación, disparador removido y contenedor sin controles.

### FR-022 / US4-AS2 — CHANGE (T024)

Archivo: change-tests/interface-accessibility.spec.js.

- interfaz cambio campo Peso en kg
- interfaz cambio campo Correo electrónico
- interfaz cambio campo Contraseña

Tres rojos independientes: Peso en kg, Correo electrónico y Contraseña; getByLabel exacto único y uso por teclado, con resultado de guardado/autenticación igual a los contratos previos.

### FR-023 / US2-AS6 — AS-IS (T025)

Archivo: test/interface-dismiss.test.js.

- interfaz conserva descarte general siete dias y deshacer
- interfaz navegador diario busqueda y descartes

Avisos generales reales con clave estable; descartar guarda fecha local y conserva otras claves; antes del límite oculta, exactamente fecha+7 reaparece; deshacer borra solo última clave. Aislar de paceCheckedAt de 004.

## Recorridos de navegador y CHANGE

Los siete títulos AS-IS anteriores viven en browser-tests/interface.spec.js;
cada caso puede recorrer varias fixtures, pero debe fallar con la aserción de
la cláusula afectada. Matriz de anchos y lista larga no se sustituyen por
setViewport sin comprobar cajas o por DOM simulado. Capturar screenshots como
apoyo de revisión, no como único oráculo.

Las siete pruebas CHANGE viven fuera del descubrimiento verde inicial; ejecutar
con playwright.interface-change.config.js y reporter JSON sin skips ni test.fail.
Cada rojo debe identificar la carencia real de su overlay/campo; fallos de
montaje/red/import/fixtures se reparan y se repite el conjunto. Tras E4/E5 se
ejecutan con el mismo código y aserciones, sin actualizar expectativas para
hacerlas pasar. En E6 se incorporan a la ejecución ordinaria una sola vez.

## G-PIN y evidencia por checkpoint

- Comparar src e index.html con BASE; no basta nombre de rama. Baseline identifica revisión exacta, runtime, comandos, resultados Node/Chromium y hash de todo src tracked.
- Registrar 42 IDs AS-IS completos y seis CHANGE pending, siete rojos individuales, cuatro mutaciones AS-IS y negativos del verificador. El modo completo debe rechazar los seis IDs.
- Congelar hashes LF de archivos de prueba nuevos, fixture/harness, config CHANGE y oráculos CSS/geometría sobre original. Registrar los 68 previos. Las pruebas de arquitectura de módulos futuros son guardas añadidas, no oráculos fingidos de E0.
- Revisión del agente por cláusula/aserción; distinguirla de aceptación humana. El conteo mecánico no demuestra cobertura semántica.
- Cada entrega E1–E5: pins + Node completo + Chromium AS-IS + CHANGE ya verdes + build + hashes + matriz vigente. Repetir entero el checkpoint fallido tras corregirlo.
- Cierre: mismos TAP/JSON/sourceHash para seis manifiestos (184 IDs), cero pending/partial/skip/retry, RLS real fresco con cleanup y tamaños del build; no reutilizar un RLS viejo.

## Negativos y casos límite transversales

Fecha no limpiada, auto invertido, toast sin reinicio y breakpoint alterado deben
fallar contra sus controles originales. Postverde: quitar Escape y etiqueta
debe fallar. Fixtures de grafo prueban import React/DOM/backend/ciclo prohibido.
Verificador rechaza prueba ausente/duplicada/omitida/reintentada y partial como
complete. No modificar el verificador para aceptar una expectativa incompleta.

## Límites

Chromium es el navegador requerido; no certifica Safari/Firefox ni lectores de
pantalla. Fuentes remotas bloqueadas: cajas se comparan bajo fuente fallback
constante, con tolerancia explícita ≤1 CSS px. Un desborde existente se conserva
y registra hasta CHANGE, sin convertir un baseline en promesa de corrección.
BODY-001–005 y UI-006-003–006 conservados; resultados y evidencia de dominio
anterior no sustituyen recorridos de interfaz todavía no probados.

## Extensión aprobada FR-024 / US1-AS9 — 2026-10-20

Dos casos congelados en change-tests/interface-highlight.spec.js: «interfaz
cambio resaltado temporal tras consumo de focusCard» e «interfaz cambio
resaltado reemplazo y desmontaje». Plazo2199/2200, consumo en App, sustitución
por otra tarjeta válida, limpieza de clase/temporizador al desmontar y retorno
sin clase obsoleta. Los pins FR-008 mantienen el retorno temprano si falta la
tarjeta; no se añade un reintento. Ambos rojos y el plan T040–T043 aprobados se
registran en baseline. T043 exige un negativo del plazo después de corregir.
