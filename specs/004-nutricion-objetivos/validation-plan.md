# Plan de validación — 004

Estado: PREVISTO; no son resultados ejecutados. [Plan](plan.md), [spec](spec.md).

## Pins bloqueantes E0

Cada fila es un grupo top-level Node con subcasos de las condiciones enumeradas.
Todos invocan producto original; revisar aserciones antes de declarar cobertura completa.
Fechas/IDs sintéticos y repetibles; conservar NaN/Infinity en memoria sin inventar
serialización nueva ni escribir datos reales. Los nombres exactos se fijan aquí.

| FR / escenarios | Archivo :: nombre exacto previsto | Casos obligatorios |
| --- | --- | --- |
| FR-001; US1-AS1 | test/nutrition-catalog.test.js :: nutricion catalogo y migracion conservan valores y unidades | Comparar catálogo completo con fixture revisado de BASE: filas/categorías/orden/valores/exports. Migrar sin unidad por nombre con mayúsculas, nombre desconocido, g/ml existentes; conservar otros campos y composición carga/importación. |
| FR-002; US1-AS1 | test/nutrition-foods.test.js :: nutricion alimentos conservan crud conversiones orden y deduplicacion | Alta/edición/borrado reales, merge de campos desconocidos, nombre trim, Number y ||0 con vacío/cadena/negativo/NaN, unidad por defecto, localeCompare, IDs; copia catálogo repetida con distinto case y snapshot frente a updater; alta manual duplicada permitida. |
| FR-003; US1-AS2 | test/nutrition-recipes.test.js :: nutricion recetas conservan ingredientes porciones y snapshots | Crear/editar/eliminar y quitar ingrediente; guardas nombre/ingredientes/pick/grams. Cero, cadena vacía, negativos y Number(servings)||1; escalado round1, suma y kcal por porción. Cambiar alimento después y demostrar receta/historial inmutables. |
| FR-004; US1-AS3 | test/nutrition-search.test.js :: nutricion busqueda conserva fuentes limites recientes y navegacion | fromFood/fromRecipe/fromEntry y cuatro tabs; consulta trim/lower/includes, acentos no normalizados, nombre repetido y empate de fechas, límite recientes20 antes de filtrar, catálogo60 después de filtrar, back/cierre y selección. |
| FR-005; US1-AS4 | test/nutrition-amount.test.js :: nutricion cantidad conserva validacion escalado guardado y retorno | Coma decimal, vacío/cero/negativo/Infinity, factor por100, round1 y stepper/atajos; guardar con Enter y botón. Fecha/comida/uid, grams null para porc./ración, recetas porciones, resets y tab conservada; no duplicar entradas por interacción. |
| FR-006; US1-AS5 | test/nutrition-day.test.js :: nutricion diario nutricional conserva totales grupos fechas y borrado | Día vacío y fechas vecinas, totales de los cuatro macros, comidas configuradas+extras+sin etiqueta y orden estable, eliminar un ID sin tocar otros días; navegación fecha y cierre de selección. |
| FR-007; US2-AS1 | test/nutrition-protein.test.js :: nutricion proteina conserva clamps reparto etiquetas y redondeos | Valores por kg por defecto/override bajo/dentro/alto; peso vacío/cadena; cuatro/cinco comidas, labels/distribución override y ausente, suma exacta del objetivo redondeado y última toma absorbiendo diferencia. |
| FR-008; US2-AS2 | test/nutrition-goals.test.js :: nutricion objetivos conservan referencia actividad direccion y sugerencia | StartWeight frente a último peso ordenado sin mutar; dirección perder/ganar/mantener/null; actividad desconocida fallback, ritmo positivo/negativo/cero/no numérico, 7700/7, kcal redondeadas10 y proteína clamp. |
| FR-009; US2-AS3 | test/nutrition-auto-goals.test.js :: nutricion objetivos conservan edicion efecto automatico y montaje | Ediciones string/number/boolean conservadas y campos ajenos; auto off/on, cambios de peso/objetivo y guardas sin bucle de escrituras. Montar Cuenta perfil y datos, desmontar y cambiar peso fuera: no recálculo global. Capturar persistencia sintética real. |
| FR-010; US2-AS4 | test/nutrition-adherence.test.js :: nutricion adherencia conserva ventana dias registrados y umbral | Fecha desde hoy−6 y hoy inclusivas, fuera y futura excluidas; solo días registrados, macros sumadas antes de round, umbral90% y fronteras de redondeo, promedio; null sin target/registros. Verificar consumidores Diario/Nutrición. |
| FR-011; US3-AS1 | test/nutrition-alerts.test.js :: nutricion alertas conservan mantenimiento proteina y otras metricas | Ventanas desde−28/−7 con futuros incluidos tal como BASE; kcal50 excluida y >50 incluida, nueve/diez días, tendencia null/cero/no nula y redondeo; proteína85% y texto. Otros campos/avisos de peso/ciclo/entrenamiento sin cambios. |
| FR-012; US3-AS2 | test/nutrition-dashboard.test.js :: nutricion metricas conservan series medias ventanas y macros | 14 fechas exactas y kcal diarias redondeadas; promedio solo positivas. macro14 desde−13 incluye futuro y omite días ausentes; entrenos desde−7, únicos con ejercicio/cardio. Objetivos ausentes/remanente0/frecuencia0–7+, carbo4/fat9 y nutDays7. |
| FR-013; US3-AS3 | test/nutrition-pace.test.js :: nutricion ritmo conserva guardas ventana limites y redondeos | Menos de8/8 puntos, span16/17, ventana21 y paceCheckedAt, fechas futuras/no positivas, regresión actual y drift redondeado; .14/.15, paso±300, suelo1400/kg22, redondeo50, prioridad floor/step, null sin cambio y metas inválidas. |
| FR-014; US3-AS4 | test/nutrition-pace-actions.test.js :: nutricion ritmo conserva aplicar descartar snapshot y deshacer | Aplicar desactiva autoMacros y cambia kcal/corte; descartar solo corte. Undo restaura snapshot previo de tres campos, conservando cambios ajenos posteriores; secuencia aviso/deshacer y fecha local. |
| FR-015; US3-AS5 | test/nutrition-expected.test.js :: nutricion real esperado conserva ancla direccion y proyeccion | Historial corto/largo con corte84 inclusive, puntos fuera/futuros/no positivos, startWeight condicionado al primer punto total, min2, recta/redondeos, ahead por dirección, tendencia existente invocada tras guardas y proyección >0 hasta104 semanas. |
| FR-016; US3-AS6 | test/nutrition-compatibility.test.js :: nutricion consumidores y previews conservan contratos y fachadas | Exports/props y montaje de App/Cuenta/Diario/Métricas/Biblioteca/Nutrición; ambos previews por compilación y montaje; carga/importación con migración; ejecutar regresiones001/002/003 y hashes22 sin modificar aserciones. |

## Chromium previsto

Archivo browser-tests/nutrition.spec.js; tres nombres top-level exactos:

- nutricion navegador registrar cantidades y corregir dia: catálogo/recientes, cantidad coma, Enter, comida, fecha, guardar/quitar y totales (US1-AS3/4/5; FR-004/005/006).
- nutricion navegador biblioteca recetas y snapshots: alta/edición/borrado alimento, receta y porciones; editar alimento y comprobar snapshot/entrada previa (US1-AS1/2; FR-001/002/003).
- nutricion navegador objetivos automaticos y aviso: Cuenta perfil/datos, autoMacros/manual, aplicar/descartar/deshacer ritmo y persistencia aislada (US2-AS2/3, US3-AS3/4; FR-008/009/013/014).

No hay backend remoto: fixtures y dobles de Supabase locales. Construir escenarios
con UI real y capturar escrituras del adaptador; instrumentar solo cuando haga
falta observar una función original inaccesible. Estos recorridos complementan
los pins Node; no prueban RLS ni validación clínica.

## Sensibilidad y negativos

Mutaciones temporales independientes, con originales restaurados y hash comprobado:
M1 guardar grams numéricos para receta (FR-005); M2 redondear después del umbral
en vez de por día (FR-010); M3 quitar efecto en section datos (FR-009); M4 deshacer
sobre estado capturado y perder campos recientes (FR-014). Cada pin pertinente
debe fallar por su aserción esperada; registrar control verde y fallo, sin
versionar código mutado. Si una mutación ya coincide con BASE, revisar el diseño
y no declarar sensibilidad hasta observar el fallo correcto.

Verificador: complete rechaza pending/partial; rechaza prueba ausente, duplicada,
skipped o fallida. Se usa el código existente, sin incorporar plannedTests como
evidencia. Límites transitivos: fixture con import React/DOM/Supabase y ciclo hacia
FitTrack debe fallar; comprobar casos válidos y callbacks de inferencia.

## Registro y aceptación

E0 registra src idéntico a BASE, comandos/runtime, 31 IDs revisados, Node/Chromium/
build reales y hashes normalizados UTF8 CRLF→LF de pins nuevos y22 anteriores.
E1–E4 repiten checkpoint descrito en plan; G-CLOSE exige misma revisión/hash,
gates001/002/003/004 completos y RLS renovada con limpieza. Guardar evidencia
en evidence/baseline.json y checkpoints, sin crearlos con resultados previstos.
No omitir/reintentar pruebas para conseguir verde. La suite existente no
sustituye subcasos faltantes; hallazgos agregan tareas de converge.
