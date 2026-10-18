# Tareas — 003-entrenamiento

Estado: APROBADAS para ejecución local. [Plan](plan.md),
[validación](validation-plan.md), [analyze](analyze.md).
E0 completada el 2026-10-17; E1–E4 y sus checkpoints completados; E5 preparada; cierre bloqueado por Docker/RLS (T025).

| ID | Historia y contrato | Resultado/tarea | Depende de | Estado |
| --- | --- | --- | --- | --- |
| T001 | US1/US2/US3; todos los FR/escenarios | Aprobación plan/tasks/analyze y puerta documental; preparar harness 003, manifiesto y reloj/IDs aislados. | — | Completada |
| T002 | US1; FR-001, US1-AS1 | Escribir y ejecutar sobre original training-records.test.js :: entrenamiento sesion por fecha orden y vaciado; cubrir casos de validation-plan. | T001 | Completada |
| T003 | US1; FR-002, US1-AS2 | Escribir y ejecutar sobre original training-records.test.js :: entrenamiento carga completa minima y calentamiento; cubrir casos de validation-plan. | T001 | Completada |
| T004 | US1; FR-003, US1-AS3 | Escribir y ejecutar sobre original training-records.test.js :: entrenamiento edicion series ejercicios y cardio; cubrir casos de validation-plan. | T001 | Completada |
| T005 | US1; FR-004, US1-AS4 | Escribir y ejecutar sobre original training-duration.test.js :: entrenamiento duracion manual eventos y limpieza; cubrir casos de validation-plan. | T001 | Completada |
| T006 | US2; FR-005, US2-AS1 | Escribir y ejecutar sobre original training-timer.test.js :: entrenamiento timer persistencia reloj y transiciones; cubrir casos de validation-plan. | T001 | Completada |
| T007 | US2; FR-006, US2-AS2 | Escribir y ejecutar sobre original training-guided.test.js :: entrenamiento sesion guiada registro correccion y salida; cubrir casos de validation-plan. | T001 | Completada |
| T008 | US3; FR-007, US3-AS1 | Escribir y ejecutar sobre original training-metrics.test.js :: entrenamiento metricas historial y fronteras; cubrir casos de validation-plan. | T001 | Completada |
| T009 | US3; FR-008, US3-AS2 | Escribir y ejecutar sobre original training-metrics.test.js :: entrenamiento consejo y ajustes conservan registros; cubrir casos de validation-plan. | T001 | Completada |
| T010 | US3; FR-009, US3-AS3 | Escribir y ejecutar sobre original training-plan.test.js :: entrenamiento semana cumplimiento y asignacion; cubrir casos de validation-plan. | T001 | Completada |
| T011 | US1; FR-010, US1-AS3 | Escribir y ejecutar sobre original training-routines.test.js :: entrenamiento rutinas plantillas y biblioteca; cubrir casos de validation-plan. | T001 | Completada |
| T012 | US3; FR-011, US3-AS4 | Escribir y ejecutar sobre original training-compatibility.test.js :: entrenamiento consumidores y previews compatibles; cubrir casos de validation-plan. | T001 | Completada |
| T013 | US1/US2/US3; FR-001/003/004/005/006/008/009/010/011; todos los escenarios | Tres recorridos Chromium y mutaciones/negativos de manifiesto previstos en validation-plan. | T002–T012 | Completada |
| T014 | US1/US2/US3; todos los FR/escenarios | G-PIN: suite/build/Chromium verdes sobre src original, 21 IDs completos, hashes de pins 003 y once previos; registrar BASE y resultados. | T013 | Completada |
| T015 | US3; FR-007/008/009/011, US3-AS1/AS2/AS3/AS4 | E1: extraer métricas/consejo/plan y fechas necesarias, mantener imports/reexports; repetir checkpoint. | T014 | Completada |
| T016 | US1/US3; FR-001/002/003/008/010/011, US1-AS1/AS2/AS3, US3-AS2/AS4 | E2: extraer transformaciones records/routines e integrar Biblioteca/Plan preservando snapshots, IDs y campos. | T015 | Completada |
| T017 | US1/US2; FR-004/005/006, US1-AS4, US2-AS1/AS2 | E3: hook timer con puertos; conservar debounce, ciclo de efectos y distintos relojes; repetir pruebas de carreras y tiempo. | T016 | Completada |
| T018 | US1/US2/US3; todos los FR/escenarios | E4: extraer TrainingScreen y constantes mínimas, conservar Train y props, lazy SessionScreen; evitar ciclo hacia FitTrack. | T017 | Completada |
| T019 | US1/US2/US3; todos los FR/escenarios | Suite/build/Chromium y hashes tras cada entrega; registrar resultados reales y repetir cualquier checkpoint fallido íntegro. | T018 | Completada |
| T020 | US3; FR-011, US3-AS4; capas de FR-001–010 | Comprobar límites transitivos y fixtures negativos; revisar imports, wrappers y consumidores. | T018 | Completada |
| T021 | US1/US2/US3; todos los FR/escenarios | Añadir gate completo 003 a CI; conservar 001/002/RLS. Revisar manifiesto contra pruebas realmente descubiertas. | T019,T020 | Completada |
| T022 | US1/US2/US3; todos los FR/escenarios | Gate final 001/002/003 con evidencia válida; revisiones sin tests omitidos, build e inventario de diferencias. | T021,T025 | Bloqueada por T025 |
| T023 | US1/US2/US3; todos los FR/escenarios | Converge contra spec/plan/constitución; añadir tareas si hay gaps, revisar TRAIN y KD-002 sin retirarla globalmente. | T022 | En curso; gap T025 registrado |
| T024 | US1/US2/US3; todos los FR/escenarios | Preparar PR de código con evidencia, omisiones, orden de integración y rollback de código; no declarar merge/CI remoto sin observar. | T023 | Preparada; cierre condicionado a T022/T023 |
| T025 | Regresión 002 / G-CLOSE | Recuperar arranque Docker local (socket de inferencia inaccesible), ejecutar RLS desechable con limpieza y repetir gate completo 002. Sin restaurar evidencia invalidada ni cambiar políticas. | T021 | Bloqueada por entorno local |

G-PIN bloquea T015–T024 hasta T014 verde. E1–E4 requieren cada una su checkpoint
de grupo, suite y build antes de comenzar la siguiente; T019 consolida esa
evidencia, no difiere las comprobaciones al final. T020 puede diseñarse antes,
pero valida imports reales tras las extracciones.

## Revisión inicial

- Cada FR tiene un pin concreto T002–T012; cada escenario se vincula en la matriz.
- No hay CHANGE ni tarea roja de comportamiento nuevo; las mutaciones prueban sensibilidad.
- Dependencias acíclicas y puerta BASE anterior a producción.
- Plan y analyze aprobados; autorización registrada en docs/sdd/approvals.md.
- Converge añadirá T025 en adelante sin reescribir tareas completadas.
