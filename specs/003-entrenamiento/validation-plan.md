# Plan de validación — 003

Estado: PREVISTO, ninguna prueba nueva ejecutada. Nombres exactos reservados;
cada grupo será test de nivel superior descubierto por TAP. Los subcasos de la
tabla cubren todo el requisito: un nombre coincidente no basta para completarlo.

| Tarea | Contratos | Archivo :: nombre exacto | Casos mínimos |
| --- | --- | --- | --- |
| T002 | FR-001, US1-AS1 | test/training-records.test.js :: entrenamiento sesion por fecha orden y vaciado | Fechas locales, duplicados de fecha, campos adicionales, orden final, sesión vacía y conservación de otras fechas. |
| T003 | FR-002, US1-AS2 | test/training-records.test.js :: entrenamiento carga completa minima y calentamiento | IDs con generador controlado; mínimos desde rutina/plantilla; campos por defecto, orden, carga repetida y suma de minutos de calentamiento. |
| T004 | FR-003, US1-AS3 | test/training-records.test.js :: entrenamiento edicion series ejercicios y cardio | Alta/edición/borrado, última serie protegida, músculo secundario, cardio vacío/numérico, eliminación en rutina del día por nombre exacto y otras rutinas intactas. |
| T005 | FR-004, US1-AS4 | test/training-duration.test.js :: entrenamiento duracion manual eventos y limpieza | Enter seguido de blur, debounce 999/1000 ms, vacío/cero/negativo y valor ya guardado, cambio de fecha, desmontaje; comprobar valores y número real de escrituras sin prometer deduplicación nueva. |
| T006 | FR-005, US2-AS1 | test/training-timer.test.js :: entrenamiento timer persistencia reloj y transiciones | Payloads timer, Date.now separado de ticks; 59/60 y 89/90 s, start/pause/reset/apply, recuperación activa/inactiva, errores, carga diferida y desmontaje. TRAIN-001 se reproduce o se registra no reproducido. |
| T007 | FR-006, US2-AS2 | test/training-guided.test.js :: entrenamiento sesion guiada registro correccion y salida | Primer pendiente, todo registrado, prioridades de seed, cambio de ejercicio, corrección explícita, extra y salto; formato strings/vacío, RPE y limpieza ft-focus; ticks frente a salto de reloj, comparación de duración al salir. |
| T008 | FR-007, US3-AS1 | test/training-metrics.test.js :: entrenamiento metricas historial y fronteras | Nombre/alias reales, última fecha estricta y empate kg, Epley no positivo, volumen/avg RPE, destacado 2/3 puntos, ventana inclusiva 56 días, empate %, RPE promedio por día y grupos/cargas distintos. |
| T009 | FR-008, US3-AS2 | test/training-metrics.test.js :: entrenamiento consejo y ajustes conservan registros | RPE ausente, rangos con coma/guion, fronteras high+1/low-1/9.5 y objetivo 9, kg cero, ambos trenes y redondeo 0.5; ajuste solo pendiente, eliminación explícita y datos ajenos intactos. |
| T010 | FR-009, US3-AS3 | test/training-plan.test.js :: entrenamiento semana cumplimiento y asignacion | Domingo/lunes, mes/año y DST en subprocesos TZ controlados; estados y reps positivas, asignación y null/vacío, ocho semanas completas sin actual, sin plan y semana inicial; conservar duplicados y días extra observados. |
| T011 | FR-010, US1-AS3 | test/training-routines.test.js :: entrenamiento rutinas plantillas y biblioteca | Crear/editar/borrar mediante UI, guardar día como rutina, cancelación prompt, mapeo exacto/IDs/minimal, deduplicación por nombre y no templateId, inferencia equipo/músculo, protección de campos ajenos. |
| T012 | FR-011, US3-AS4 | test/training-compatibility.test.js :: entrenamiento consumidores y previews compatibles | App y dos previews, Train exportado, alerts/Plan/Dashboard/Library/Session, importación de símbolos existentes, casos de inferencia recibida sin recalcular algoritmo; proteína y contratos de 001/002 intactos. |

## Navegador real, backend simulado

- browser-tests/training-journeys.spec.js :: entrenamiento navegador registrar y corregir serie
  (FR-001/002/003/006/008; US1-AS1/AS2/AS3, US2-AS2, US3-AS2).
- browser-tests/training-journeys.spec.js :: entrenamiento navegador timer y duracion
  (FR-004/005/006; US1-AS4, US2-AS1/AS2).
- browser-tests/training-journeys.spec.js :: entrenamiento navegador biblioteca y plan
  (FR-009/010/011; US1-AS3, US3-AS3/AS4).

Usar API pública de reloj del navegador o inyección controlada compatible con
Playwright instalado; no esperar minutos reales. Comprobar contenido y datos
persistidos observados en el fake, no solo que un botón existe. Los previews y
alertas requieren además los pins de compatibilidad. Sin acceso a datos reales.

## Negativos y arquitectura

T013: mutaciones controladas detectadas por las mismas aserciones: permitir
reescribir series registradas, alterar redondeo timer y cambiar eliminación de
sesión vacía. Instrumentar código productivo en build de prueba, sin persistir
mutaciones en src. Una mutación no aplicable es error del harness, no éxito.
Conservar los negativos existentes de trazabilidad; verificar 003 con nombre
inexistente, skipped, partial y fila ausente.

T020: bundling con metafile e inspección de importación transitiva/DOM para
métricas, plan, records, routines y advice; fixture negativo React, DOM y cliente.
Hook puede importar React, pero no SDK/cliente global. TrainingScreen no importa
FitTrack. Prueba de export Train compatible y ambos previews funcionales.

## Gate BASE y final

T014 genera evidence/baseline.json con revisión productiva, hashes, comando,
versiones, totales reales y limitaciones TRAIN; no puede existir como evidencia
verde hasta ejecución. Once pins 001/002 se comprueban contra sus baselines.
T022 genera evidencia final por entrega sin sobreescribir baseline. No usar
conteos de otra spec como prueba de nuevos contratos.
