# Spec 003: entrenamiento

Estado: ALCANCE APROBADO, 2026-10-16; plan técnico aprobado y E0 verificada.
Fecha: 2026-10-16. Constitución: [1.0.2](../../.specify/memory/constitution.md).
Evidencia: [survey](../../docs/sdd/entrenamiento-survey.md).

## Resultado de usuario e intención

Registrar sesiones, usar rutinas y consultar métricas y planificación con los
mismos datos y resultados mientras se separan responsabilidades. Se medirá
mediante contratos ejecutados sobre original y refactor, sin pérdida de registros
ni cambios de fórmula, orden, umbrales o APIs.

## Alcance y restricciones

Train y sesión guiada; coordinación de sesión/temporizador; cálculos de fuerza,
RPE y planificación; operaciones de rutinas de Biblioteca/Plan; plantillas y
consumidores compartidos necesarios. Conservar 001/002 y sus pins intactos.
Todas las propuestas son AS-IS; no hay CHANGE ni correcciones implícitas.

## Historias y escenarios

### US1 — Registrar y preparar sesiones (P1)

Como usuario, quiero cargar rutinas y registrar ejercicios, series, cardio y
duración para conservar mi historial.

- US1-AS1: Dado un historial inicial, cuando se ejecute la interacción, entonces: Crear y vaciar una sesión conserva datos ajenos y orden observable.
- US1-AS2: Dado un historial inicial, cuando se ejecute la interacción, entonces: Cargar rutina completa, mínima y calentamiento conserva prescripción y repetición de carga.
- US1-AS3: Dado un historial inicial, cuando se ejecute la interacción, entonces: Editar series/cardio y guardar rutina conserva IDs, serie mínima y eliminación opcional.
- US1-AS4: Dado un historial inicial, cuando se ejecute la interacción, entonces: Guardar duración por teclado, blur y espera conserva el valor y cleanup.

### US2 — Completar una sesión con sus tiempos actuales (P1)

Como usuario, quiero usar timer y sesión guiada para conservar el registro actual
de mis series y duración.

- US2-AS1: Dada una sesión y un reloj controlado, cuando se ejecute la interacción, entonces: Reanudar timer con tiempo transcurrido, pausar, aplicar y reiniciar conserva persistencia.
- US2-AS2: Dada una sesión y un reloj controlado, cuando se ejecute la interacción, entonces: Registrar/corregir serie guiada, añadir extra y salir conserva duración y limpieza de foco.

### US3 — Consultar progreso y planificación compatibles (P1)

Como usuario, quiero mantener mis referencias y calendario para comparar
resultados antes y después de la refactorización.

- US3-AS1: Dados historial y fechas de frontera, cuando se consulte o ajuste el entrenamiento, entonces: Consultar antecedentes y métricas con ceros, empates y fechas límite conserva resultados.
- US3-AS2: Dados historial y fechas de frontera, cuando se consulte o ajuste el entrenamiento, entonces: Aplicar consejo/ajuste conserva series registradas y fronteras RPE.
- US3-AS3: Dados historial y fechas de frontera, cuando se consulte o ajuste el entrenamiento, entonces: Asignar rutina y consultar semana/cumplimiento conserva estados y semanas completas.
- US3-AS4: Dados historial y fechas de frontera, cuando se consulte o ajuste el entrenamiento, entonces: Abrir App y ambos previews conserva consumidores e inferencia recibida.

## Requisitos funcionales

- FR-001 [AS-IS] Cuando se modifique una sesión por fecha local, el sistema deberá conservar campos no modificados, reemplazar las entradas de esa fecha por la sesión al final del array y eliminarla si no tiene ejercicios, duración ni cardio.
- FR-002 [AS-IS] Cuando se añadan ejercicios, rutinas completas, versiones mínimas o calentamiento, el sistema deberá conservar el mapeo actual, generar IDs nuevos y añadir ejercicios sin deduplicarlos; el calentamiento sumará su duración configurada.
- FR-003 [AS-IS] Cuando se editen o eliminen series, ejercicios o cardio, el sistema deberá conservar sus reglas actuales, incluida una serie mínima por ejercicio y la eliminación opcional del ejercicio por nombre exacto de la rutina asignada al día.
- FR-004 [AS-IS] Cuando se modifique duración manual, el sistema deberá convertir mediante Number(valor) || 0 y guardar por Enter, blur o debounce de 1000 ms, conservando el cleanup actual.
- FR-005 [AS-IS] Cuando se cargue, inicie, pause, reinicie o aplique el temporizador, el sistema deberá conservar la clave timer por usuario, el cálculo desde Date.now y baseSec, y la suma de minutos redondeados positivos seguida de reinicio, con el botón Guardar deshabilitado por debajo de 60 segundos.
- FR-006 [AS-IS] Mientras esté abierta la sesión guiada, el sistema deberá conservar selección inicial pendiente, prioridad de valores sugeridos, registro/corrección de series, series extra, navegación, contador por ticks y limpieza del modo de foco; al salir conservará la sustitución de duración solo por un valor mayor.
- FR-007 [AS-IS] Cuando se consulten métricas o antecedentes, el sistema deberá conservar normalización de ejercicio, selección de última carga, Epley, volumen, promedio RPE, destacado de 56 días y tendencia RPE comparable con sus filtros, redondeos y desempates actuales.
- FR-008 [AS-IS] Cuando se proponga carga para la siguiente serie o se aplique un ajuste masivo, el sistema deberá conservar los umbrales RPE, reducción aproximada del 7 %, incrementos 5/2,5 kg y redondeo a 0,5, y excluir del ajuste masivo series con repeticiones positivas.
- FR-009 [AS-IS] Cuando se consulte o asigne el plan semanal, el sistema deberá conservar lunes como inicio, estados por series registradas, semanas completas anteriores para cumplimiento y la asignación/desasignación actual por suggestedDay.
- FR-010 [AS-IS] Cuando se creen, editen o carguen rutinas y plantillas, el sistema deberá conservar campos, valores por defecto, inferencia de músculo/equipo, versiones mínimas y carga de plantillas por nombre exacto ausente.
- FR-011 [AS-IS] Cuando se refactoricen símbolos compartidos, el sistema deberá conservar las APIs consumidas por App, sesión guiada, Plan, Biblioteca, métricas y los dos previews, incluidas fechas locales y el consumo sin cambios de la inferencia de ciclo.

## Evidencia AS-IS

Las referencias remiten a BASE c7d9e81. Los pins están ejecutados y fijados en [baseline](evidence/baseline.json).
La matriz ejecutable está en [traceability.json](traceability.json).

| FR | Código | Prueba de caracterización | Límite |
| --- | --- | --- | --- |
| FR-001 | src/FitTrack.jsx:1042 | Gate completo 003 verde | Baseline anterior a extracción |
| FR-002 | src/FitTrack.jsx:1057 | Gate completo 003 verde | Baseline anterior a extracción |
| FR-003 | src/FitTrack.jsx:1089 | Gate completo 003 verde | Baseline anterior a extracción |
| FR-004 | src/FitTrack.jsx:1028 | Gate completo 003 verde | Baseline anterior a extracción |
| FR-005 | src/FitTrack.jsx:1116 | Gate completo 003 verde | Baseline anterior a extracción |
| FR-006 | src/SessionScreen.jsx:24; src/FitTrack.jsx:1166 | Gate completo 003 verde | Baseline anterior a extracción |
| FR-007 | src/FitTrack.jsx:1000; src/app-utils.js:22,52,183 | Gate completo 003 verde | Baseline anterior a extracción |
| FR-008 | src/app-utils.js:443,570 | Gate completo 003 verde | Baseline anterior a extracción |
| FR-009 | src/app-utils.js:513; src/PlanScreen.jsx:65 | Gate completo 003 verde | Baseline anterior a extracción |
| FR-010 | src/fase1Config.js:381; src/LibraryScreen.jsx:320 | Gate completo 003 verde | Baseline anterior a extracción |
| FR-011 | src/FitTrack.jsx:898,995; src/preview-main.jsx:208 | Gate completo 003 verde | Baseline anterior a extracción |

## Criterios medibles de aceptación

- SC-001: 11 FR y 10 escenarios con evidencia ejecutada, cero filas partial o pending al PR de código.
- SC-002: Pins AS-IS verdes antes de transformar; aserciones/hashes conservados después.
- SC-003: Suite, build y contratos completos de 001/002 continúan verdes.
- SC-004: Recorridos funcionales de registro guiado, timer y rutinas/plan; ambos previews montan.
- SC-005: Límites de capas con casos negativos; cálculos extraídos sin React, DOM ni Supabase.
- SC-006: Sin cambios de datos persistidos, fórmulas, prescripciones, SQL o dependencias productivas por defecto.

## Out of Scope

- Corregir TRAIN-001/002/003 o DATA/IDEN/PHOTO sin CHANGE separado.
- Cambiar recomendaciones, fórmulas, mensajes clínicos o inferencia de ciclo (005).
- Refactorizar proteína, alimentos, recetas u objetivos (004).
- Rediseño visual, accesibilidad global o optimización de bundle (006).
- Migraciones, backend real, despliegues o nueva semántica de persistencia.

## Compatibilidad temporal

FR-005 conserva el ciclo de carga timer que se caracterizará en TRAIN-001.
FR-006 conserva ticks (TRAIN-002); FR-005/006 conservan sumar frente a sustituir
duración (TRAIN-003). Son límites observados, no garantías deseadas ni defectos
corregidos. Se revisarán al caracterizar, antes de extraer y en converge.

## Clarificaciones resueltas

- C-001: preservar AS-IS y separar los tres hallazgos de timer; recomendación:
  no introducir CHANGE en esta primera refactorización.
- C-002: incluir las operaciones de rutinas de Biblioteca/Plan y sus consumidores,
  manteniendo fuera sus dominios de alimentos/cuerpo; recomendación: sí.
- C-003: mantener cálculos actuales sin ratificar validez clínica; recomendación: sí.
- Decisión del propietario: «si», en respuesta a la propuesta de alcance presentada; C-001/002/003 aceptadas.
  Preservar AS-IS, incluir operaciones de rutinas/Plan y mantener las fórmulas actuales; plan e implementación conservan sus puertas.

## Traceability

Una fila por requisito y escenario. Los nombres previstos de prueba y tareas
se definen en el plan propuesto y validation-plan.md; no hay cobertura
ejecutada declarada para 003.

| ID | Historia | Resultado | Archivo :: prueba | Tarea | Estado |
| --- | --- | --- | --- | --- | --- |
| FR-001 | US1 | Contrato de entrenamiento preservado | test/training-records.test.js :: entrenamiento sesion por fecha orden y vaciado (prevista) | T002 | PENDING |
| FR-002 | US1 | Contrato de entrenamiento preservado | test/training-records.test.js :: entrenamiento carga completa minima y calentamiento (prevista) | T003 | PENDING |
| FR-003 | US1 | Contrato de entrenamiento preservado | test/training-records.test.js :: entrenamiento edicion series ejercicios y cardio (prevista) | T004 | PENDING |
| FR-004 | US1 | Contrato de entrenamiento preservado | test/training-duration.test.js :: entrenamiento duracion manual eventos y limpieza (prevista) | T005 | PENDING |
| FR-005 | US2 | Contrato de entrenamiento preservado | test/training-timer.test.js :: entrenamiento timer persistencia reloj y transiciones (prevista) | T006 | PENDING |
| FR-006 | US2 | Contrato de entrenamiento preservado | test/training-guided.test.js :: entrenamiento sesion guiada registro correccion y salida (prevista) | T007 | PENDING |
| FR-007 | US3 | Contrato de entrenamiento preservado | test/training-metrics.test.js :: entrenamiento metricas historial y fronteras (prevista) | T008 | PENDING |
| FR-008 | US3 | Contrato de entrenamiento preservado | test/training-metrics.test.js :: entrenamiento consejo y ajustes conservan registros (prevista) | T009 | PENDING |
| FR-009 | US3 | Contrato de entrenamiento preservado | test/training-plan.test.js :: entrenamiento semana cumplimiento y asignacion (prevista) | T010 | PENDING |
| FR-010 | US1 | Contrato de entrenamiento preservado | test/training-routines.test.js :: entrenamiento rutinas plantillas y biblioteca (prevista) | T011 | PENDING |
| FR-011 | US3 | Contrato de entrenamiento preservado | test/training-compatibility.test.js :: entrenamiento consumidores y previews compatibles (prevista) | T012 | PENDING |
| US1-AS1 | US1 | Crear y vaciar una sesión conserva datos ajenos y orden observable. | validation-plan.md :: entrenamiento sesion por fecha orden y vaciado (previstas) | T002 | PENDING |
| US1-AS2 | US1 | Cargar rutina completa, mínima y calentamiento conserva prescripción y repetición de carga. | validation-plan.md :: entrenamiento carga completa minima y calentamiento (previstas) | T003 | PENDING |
| US1-AS3 | US1 | Editar series/cardio y guardar rutina conserva IDs, serie mínima y eliminación opcional. | validation-plan.md :: entrenamiento edicion series ejercicios y cardio; entrenamiento rutinas plantillas y biblioteca (previstas) | T004, T011 | PENDING |
| US1-AS4 | US1 | Guardar duración por teclado, blur y espera conserva el valor y cleanup. | validation-plan.md :: entrenamiento duracion manual eventos y limpieza (previstas) | T005 | PENDING |
| US2-AS1 | US2 | Reanudar timer con tiempo transcurrido, pausar, aplicar y reiniciar conserva persistencia. | validation-plan.md :: entrenamiento timer persistencia reloj y transiciones (previstas) | T006 | PENDING |
| US2-AS2 | US2 | Registrar/corregir serie guiada, añadir extra y salir conserva duración y limpieza de foco. | validation-plan.md :: entrenamiento sesion guiada registro correccion y salida (previstas) | T007 | PENDING |
| US3-AS1 | US3 | Consultar antecedentes y métricas con ceros, empates y fechas límite conserva resultados. | validation-plan.md :: entrenamiento metricas historial y fronteras (previstas) | T008 | PENDING |
| US3-AS2 | US3 | Aplicar consejo/ajuste conserva series registradas y fronteras RPE. | validation-plan.md :: entrenamiento consejo y ajustes conservan registros (previstas) | T009 | PENDING |
| US3-AS3 | US3 | Asignar rutina y consultar semana/cumplimiento conserva estados y semanas completas. | validation-plan.md :: entrenamiento semana cumplimiento y asignacion (previstas) | T010 | PENDING |
| US3-AS4 | US3 | Abrir App y ambos previews conserva consumidores e inferencia recibida. | validation-plan.md :: entrenamiento consumidores y previews compatibles (previstas) | T012 | PENDING |

## Aprobación

El propietario respondió «si» a la propuesta concreta de alcance, autorizando preparar el plan técnico. Se aprueban los once FR AS-IS, diez escenarios y C-001/002/003. La instrucción posterior «continua» mantiene la preparación del plan en curso; no aprueba anticipadamente su contenido aún no presentado. Plan, tareas, analyze e implementación pendientes de aprobación.
