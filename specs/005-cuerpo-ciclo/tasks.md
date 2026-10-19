# Tareas — 005-cuerpo-ciclo

Estado: APROBADAS para ejecución local E0–E6; ejecución pendiente. Fecha: 2026-10-18. Adaptación de plantilla
local. [Plan](plan.md), [validación](validation-plan.md), [analyze](analyze.md).
Todas AS-IS; el alcance aprobado no aprueba estas tareas.

| ID | Historia y contrato | Resultado/tarea | Depende de | Estado |
| --- | --- | --- | --- | --- |
| T001 | US1/US2/US3; todos los FR/escenarios | Obtener aprobación separada de plan/tasks/analyze y preparar PR documental; ejecutar localmente antes del merge solo con autorización explícita. Inventariar instrumentación original y controles de limpieza. | — | Completada |
| T002 | US1; FR-001, US1-AS1 | Crear y ejecutar sobre BASE test/body-weight.test.js :: cuerpo peso conserva conversiones reemplazo pasos e historial; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T003 | US1; FR-002, US1-AS2 | Crear y ejecutar sobre BASE test/body-measurements.test.js :: cuerpo medidas conservan campos null conversiones y reemplazo; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T004 | US1; FR-003, US1-AS3 | Crear y ejecutar sobre BASE test/body-wellness.test.js :: cuerpo bienestar conserva borrador fecha guardas y guardado; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T005 | US1; FR-004, US1-AS4 | Crear y ejecutar sobre BASE test/body-logs.test.js :: cuerpo checkin conserva normalizacion identidad timestamps y legado; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T006 | US1; FR-005, US1-AS5 | Crear y ejecutar sobre BASE test/body-routing.test.js :: cuerpo conserva seccion fecha montaje y visibilidad; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T007 | US2; FR-006, US2-AS1 | Crear y ejecutar sobre BASE test/body-context.test.js :: cuerpo ciclo conserva comienzos longitudes y contexto; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T008 | US2; FR-007, US2-AS2 | Crear y ejecutar sobre BASE test/body-ovulation.test.js :: cuerpo ciclo conserva ovulacion flujo calendario y confianza; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T009 | US2; FR-008, US2-AS3 | Crear y ejecutar sobre BASE test/body-phase.test.js :: cuerpo ciclo conserva precedencia fases y desconocido tardio; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T010 | US2; FR-009, US2-AS4 | Crear y ejecutar sobre BASE test/body-summary.test.js :: cuerpo ciclo conserva resumen sangrado segmentos y outliers; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T011 | US2; FR-010, US2-AS5 | Crear y ejecutar sobre BASE test/body-distribution.test.js :: cuerpo ciclo conserva distribucion escalas bins y picos; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T012 | US2; FR-011, US2-AS6 | Crear y ejecutar sobre BASE test/body-timeline.test.js :: cuerpo ciclo conserva recalculo timeline duplicados y timestamps; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T013 | US2; FR-012, US2-AS7 | Crear y ejecutar sobre BASE test/body-guidance.test.js :: cuerpo ciclo conserva guia insights provisionalidad y textos; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T014 | US2; FR-013, US2-AS8 | Crear y ejecutar sobre BASE test/body-consumers.test.js :: cuerpo ciclo consumidores conservan confianza limites y cautela; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T015 | US3; FR-014, US3-AS1 | Crear y ejecutar sobre BASE test/body-trend.test.js :: cuerpo peso conserva regresion tendencia y callbacks de objetivos; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T016 | US3; FR-015, US3-AS2 | Crear y ejecutar sobre BASE test/body-creatine.test.js :: cuerpo peso conserva creatina saturacion y edicion de objetivo; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T017 | US3; FR-016, US3-AS3 | Crear y ejecutar sobre BASE test/body-retention.test.js :: cuerpo peso conserva retencion detrending umbral y cap; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T018 | US3; FR-017, US3-AS4 | Crear y ejecutar sobre BASE test/body-metrics.test.js :: cuerpo peso conserva medias correcciones tendencia y proyeccion; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T019 | US3; FR-018, US3-AS5 | Crear y ejecutar sobre BASE test/body-alerts.test.js :: cuerpo avisos conservan fatiga textos umbrales y claves; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T020 | US3; FR-019, US3-AS6 | Crear y ejecutar sobre BASE test/body-dashboard.test.js :: cuerpo metricas y diario conservan selectores y formatos; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T021 | US3; FR-020, US3-AS7 | Crear y ejecutar sobre BASE test/body-compatibility.test.js :: cuerpo consumidores conservan fachadas fotos y contratos previos; cubrir todos los subcasos de validation-plan, sin modificar src. | T001 | Completada |
| T022 | US1/US2/US3; todos los FR/escenarios | Cuatro recorridos Chromium, cuatro mutaciones controladas con control original y negativos del verificador; documentar aserción que detecta cada mutación. | T002,T003,T004,T005,T006,T007,T008,T009,T010,T011,T012,T013,T014,T015,T016,T017,T018,T019,T020,T021 | Completada |
| T023 | US1/US2/US3; todos los FR/escenarios | G-PIN: original idéntico a BASE; suite/build/Chromium, 40/40 IDs, revisión de cláusulas/aserciones, sourceHash/runtime y congelación de pins/fixtures/harness; comprobar los 40 hashes anteriores. | T022 | Completada |
| T024 | US1/US2; FR-004/006/007/008/013/020; US1-AS4, US2-AS1/2/3/8, US3-AS7 | E1: context/config y facades con fechas puras; negativos de la frontera introducida y checkpoint de entrega. | T023 | Completada |
| T025 | US2; FR-008/009/010/011/012/013/020; US2-AS3/4/5/6/7/8, US3-AS7 | E2: fase, resúmenes, lecturas y fachada acíclica; conservar precedencia/duplicados/timestamps/textos y ejecutar checkpoint. | T024 | Completada |
| T026 | US1; FR-001/002/003/004/005/015/020; US1-AS1/2/3/4/5, US3-AS2/7 | E3: transformaciones de registros y selectores de BodyScreen; IDs/estado/effects/toast/fotos intactos; checkpoint. | T025 | Completada |
| T027 | US2/US3; FR-006/007/008/014/015/016/017/018/020; US2-AS1/2/3, US3-AS1/2/3/4/5/7 | E4: weight-model/weight-metrics y composición de alerts; conservar callbacks 004, guardas, ventanas y claves; checkpoint. | T026 | Pendiente |
| T028 | US1/US2/US3; FR-005/013/019/020; US1-AS5, US2-AS8, US3-AS6/7 | E5: body-metrics, consumidores, Diario/Plan y previews; proteger sueño/pulso sin extraer y reglas ajenas; checkpoint. | T027 | Pendiente |
| T029 | US1/US2/US3; FR-020, US3-AS7; capas de todos los contratos | Cerrar prueba de arquitectura con grafo transitivo, negativos y hashes; verificar exports/consumidores y ausencia de ciclos. Mantener los checks incrementales desde T024. | T028 | Pendiente |
| T030 | US1/US2/US3; todos los FR/escenarios | Añadir gate y artifacts 005 a CI manteniendo gates previos y job RLS; cruzar manifiesto con descubrimiento y aserciones reales. | T029 | Pendiente |
| T031 | US1/US2/US3; todos los FR/escenarios | G-CLOSE: RLS real local desechable fresco con cleanup; suite/build/Chromium, cinco contratos completos sobre mismo src/resultados, hashes congelados y límites documentados. | T030 | Pendiente |
| T032 | US1/US2/US3; todos los FR/escenarios | Converge contra spec/plan/constitución; revisar BODY y KD-002, añadir tareas para gaps sin reescribir completadas; no declarar aceptación clínica ni retirar deuda global. | T031 | Pendiente |
| T033 | US1/US2/US3; todos los FR/escenarios | Preparar PR de código con alcance, comandos/resultados, omisiones, orden de integración y rollback; entregar al propietario sin publicar, fusionar o desplegar. | T032 | Pendiente |

## Revisión inicial de tareas

33 tareas, dependencias acíclicas. T002–T021 cubren individualmente los 20 FR
y los 20 escenarios. T023 bloquea todos los cambios de producto T024–T033.
E1–E5 tienen checkpoint por entrega y reversión de código; los checks no se
aplazan al cierre. T001 no está completada hasta aprobar el plan y resolver la
puerta documental o autorizar expresamente ejecución local previa a su merge.
Ninguna prueba prevista se declara descubierta/ejecutada.

## Convergencia — solo añadir

No hay tareas añadidas ni completadas. Si aparecen discrepancias se registrarán
aquí con ID nuevo, dependencia, evidencia y estado, sin reescribir completadas.

Aprobación 2026-10-18: «aprobado», respuesta directa a plan/tasks/analyze y
autorización de ejecución local E0–E6 antes de integrar el PR documental.
No autoriza publicación, merge ni despliegue.

## Checkpoint E0 — 2026-10-19

T001–T023 completadas localmente: 284 Node, 13 Chromium, build y 40/40 IDs
completos sobre original. 28 archivos nuevos de pins/infraestructura congelados;
40 anteriores intactos. [Baseline](evidence/baseline.json),
[revisión de aserciones](assertion-review.md). E1–E6 pendientes.

E1 / T024 completada: 286 Node, 13 Chromium, build, 40 IDs de005 y gates
001/003/004 completos con los mismos resultados; 68 hashes intactos.
[Evidencia E1](evidence/e1.json). RLS fresco/gate002 pendientes para cierre.

E2 / T025 completada: fase, timeline, resúmenes y lecturas separados sin ciclos;
286 Node, 13 Chromium, build y cuatro gates completos, 68 hashes intactos.
[Evidencia E2](evidence/e2.json).

E3 / T026 completada: transformaciones de registros separadas; hooks, parseo de
frontera, toast/setter y IDs conservados. 286 Node, 13 Chromium, build y gates
001/003/004/005 completos con 68 hashes intactos. [Evidencia E3](evidence/e3.json).
