# Tareas — 004-nutricion-objetivos

Estado: APROBADAS para ejecución local E0–E5 el 2026-10-18. [Plan](plan.md), [validación](validation-plan.md),
[analyze](analyze.md). Adaptación de la plantilla local de tareas. Todas AS-IS.

| ID | Historia y contrato | Resultado/tarea | Depende de | Estado |
| --- | --- | --- | --- | --- |
| T001 | US1/US2/US3; todos los FR/escenarios | Obtener aprobación plan/tasks/analyze y ejecución local; puerta documental, harness sintético, fecha e IDs controlados. | — | Completada |
| T002 | US1; FR-001, US1-AS1 | Escribir y ejecutar sobre original test/nutrition-catalog.test.js :: nutricion catalogo y migracion conservan valores y unidades; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T003 | US1; FR-002, US1-AS1 | Escribir y ejecutar sobre original test/nutrition-foods.test.js :: nutricion alimentos conservan crud conversiones orden y deduplicacion; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T004 | US1; FR-003, US1-AS2 | Escribir y ejecutar sobre original test/nutrition-recipes.test.js :: nutricion recetas conservan ingredientes porciones y snapshots; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T005 | US1; FR-004, US1-AS3 | Escribir y ejecutar sobre original test/nutrition-search.test.js :: nutricion busqueda conserva fuentes limites recientes y navegacion; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T006 | US1; FR-005, US1-AS4 | Escribir y ejecutar sobre original test/nutrition-amount.test.js :: nutricion cantidad conserva validacion escalado guardado y retorno; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T007 | US1; FR-006, US1-AS5 | Escribir y ejecutar sobre original test/nutrition-day.test.js :: nutricion diario nutricional conserva totales grupos fechas y borrado; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T008 | US2; FR-007, US2-AS1 | Escribir y ejecutar sobre original test/nutrition-protein.test.js :: nutricion proteina conserva clamps reparto etiquetas y redondeos; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T009 | US2; FR-008, US2-AS2 | Escribir y ejecutar sobre original test/nutrition-goals.test.js :: nutricion objetivos conservan referencia actividad direccion y sugerencia; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T010 | US2; FR-009, US2-AS3 | Escribir y ejecutar sobre original test/nutrition-auto-goals.test.js :: nutricion objetivos conservan edicion efecto automatico y montaje; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T011 | US2; FR-010, US2-AS4 | Escribir y ejecutar sobre original test/nutrition-adherence.test.js :: nutricion adherencia conserva ventana dias registrados y umbral; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T012 | US3; FR-011, US3-AS1 | Escribir y ejecutar sobre original test/nutrition-alerts.test.js :: nutricion alertas conservan mantenimiento proteina y otras metricas; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T013 | US3; FR-012, US3-AS2 | Escribir y ejecutar sobre original test/nutrition-dashboard.test.js :: nutricion metricas conservan series medias ventanas y macros; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T014 | US3; FR-013, US3-AS3 | Escribir y ejecutar sobre original test/nutrition-pace.test.js :: nutricion ritmo conserva guardas ventana limites y redondeos; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T015 | US3; FR-014, US3-AS4 | Escribir y ejecutar sobre original test/nutrition-pace-actions.test.js :: nutricion ritmo conserva aplicar descartar snapshot y deshacer; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T016 | US3; FR-015, US3-AS5 | Escribir y ejecutar sobre original test/nutrition-expected.test.js :: nutricion real esperado conserva ancla direccion y proyeccion; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T017 | US3; FR-016, US3-AS6 | Escribir y ejecutar sobre original test/nutrition-compatibility.test.js :: nutricion consumidores y previews conservan contratos y fachadas; cubrir todos los subcasos de validation-plan. | T001 | Completada |
| T018 | US1/US2/US3; FR-001–006/008/009/013/014; US1-AS1–5, US2-AS2/3, US3-AS3/4 | Tres recorridos Chromium, cuatro mutaciones controladas y negativos del verificador, con controles restaurados. | T002,T003,T004,T005,T006,T007,T008,T009,T010,T011,T012,T013,T014,T015,T016,T017 | Completada |
| T019 | US1/US2/US3; todos los FR/escenarios | G-PIN: suite/build/Chromium sobre src original, 31 IDs completos, revisión de aserciones y congelación de pins; comprobar 22 hashes previos. | T018 | Completada |
| T020 | US1/US2; FR-001/007/016; US1-AS1, US2-AS1, US3-AS6 | E1: catálogo/unidades/proteína y fachadas; checkpoint completo por entrega. | T019 | Pendiente |
| T021 | US1; FR-001–006/016; US1-AS1–5, US3-AS6 | E2: modelos/operaciones alimentarias; integrar Biblioteca/Nutrición sin cambiar snapshots/updaters; checkpoint. | T020 | Pendiente |
| T022 | US2/US3; FR-008/009/013/014/015/016; US2-AS2/3, US3-AS3–6 | E3: objetivos y acciones; callbacks de inferencia sin anticiparlos, efecto en Ajustes intacto; checkpoint. | T021 | Pendiente |
| T023 | US2/US3; FR-010/011/012/016; US2-AS4, US3-AS1/2/6 | E4: métricas y consumidores; ventanas y avisos ajenos intactos; checkpoint. | T022 | Pendiente |
| T024 | US3; FR-016; US3-AS6; capas de todos los FR | Prueba de arquitectura transitiva y negativos; APIs/consumidores, inventario de llamadas y revisión de diferencias. | T023 | Pendiente |
| T025 | US1/US2/US3; todos los FR/escenarios | Añadir gate004 a CI conservando001/002/003 y RLS; contrastar manifiesto con resultados reales completos. | T024 | Pendiente |
| T026 | US1/US2/US3; todos los FR/escenarios | G-CLOSE: renovar RLS desechable con limpieza, suite/build/Chromium y gates001/002/003/004 del mismo src; hashes congelados. | T025 | Pendiente |
| T027 | US1/US2/US3; todos los FR/escenarios | Converge contra spec/plan/constitución; añadir tareas ante gaps, revisar NUTR y KD-002 sin retirar esta globalmente. | T026 | Pendiente |
| T028 | US1/US2/US3; todos los FR/escenarios | Preparar PR de código con evidencia, omisiones y rollback; entregar revisión al propietario, sin publicar/fusionar/desplegar. | T027 | Pendiente |

## Dependencias y revisión inicial

T019 bloquea cualquier cambio de src en T020–T028. Cada entrega T020–T023
repite pins de grupo, suite/build, hashes y navegador afectado antes de avanzar.
Las tareas de cierre no aplazan esos checks. Los rangos de contratos indican
las filas individuales enumeradas en spec/manifiesto, no nuevos IDs.

- Cada FR y escenario tiene tarea concreta T002–T017 y casos en validation-plan.
- Todos los AS-IS tienen pin previo a extracción. No hay CHANGE ni tareas de implementación de conducta nueva.
- Dependencias acíclicas; puertas documental, baseline y cierre independientes.
- Analyze aprobado junto al plan el 2026-10-18.

## Registro de ejecución

E0 completada sobre BASE sin cambios en src: 260 Node, 9 Chromium, 31/31 IDs,
cuatro mutaciones detectadas, build y 22 hashes previos intactos.
[Baseline congelada](evidence/baseline.json). T020–T028 pendientes.
El selector pnpm falló dentro del sandbox por su base de datos; fuera confirmó
Node24.21.0. Fallos iniciales de fixtures/selectores corregidos y checkpoints repetidos.

## Convergencia — solo añadir

Añadir T029 en adelante si aparecen gaps; conservar historial y FR de cada tarea.
