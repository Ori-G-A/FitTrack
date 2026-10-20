# Tareas — 006-interfaz

Estado: APROBADAS para ejecución local E0–E6; E0 completada; E1–E6 pendientes. Actualización: 2026-10-20.
Adaptación de [plantilla local](../../.specify/templates/tasks-template.md).
[Plan](plan.md), [validación](validation-plan.md), [analyze](analyze.md), [research](research.md).

| ID | Historia y contrato | Resultado/tarea | Depende de | Estado |
| --- | --- | --- | --- | --- |
| T001 | US1/US2/US3/US4; todos los FR/escenarios | Obtener aprobación separada de plan/tasks/analyze, preparar snapshot del PR documental y resolver ejecución local previa al merge solo por autorización explícita. | — | Completada (E0; registro inferior) |
| T002 | US1/US2/US3/US4; todos los FR/escenarios | Preparar interface-build/entry/fixtures/DOM y config CHANGE separados; red/cliente real prohibidos, relojes/almacenamiento/media query y lazy gates controlados. Inventariar anclas/exports y medidas de build BASE. Sin modificar src. | T001 | Completada (E0; registro inferior) |
| T003 | US1; FR-001; US1-AS1 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-navigation.test.js :: interfaz conserva raices activas y entradas de shell. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T004 | US1; FR-002; US1-AS2 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-registration.test.js :: interfaz conserva destinos de registrar segun ciclo. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T005 | US1; FR-003; US1-AS3 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-routing.test.js :: interfaz conserva fecha enfocada y tarjeta solicitada. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T006 | US1; FR-004; US1-AS4 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-account.test.js :: interfaz conserva alias de cuenta y seleccion local. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T007 | US1; FR-005; US1-AS5 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-body-routing.test.js :: interfaz conserva alias seccion fecha y montaje de cuerpo. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T008 | US1; FR-006; US1-AS6 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-diary.test.js :: interfaz conserva busqueda filtros limites y vacios de diario. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T009 | US1; FR-007; US1-AS7 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-plan.test.js :: interfaz conserva destinos y fecha del dia del plan. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T010 | US1; FR-008; US1-AS8 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-metric-focus.test.js :: interfaz conserva filtro ancla resaltado y retorno temprano. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T011 | US2; FR-009; US2-AS1 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-theme.test.js :: interfaz conserva preferencia y fallos de almacenamiento. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T012 | US2; FR-010; US2-AS2 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-theme-lifecycle.test.js :: interfaz conserva tema de sistema primer render y limpieza. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T013 | US2; FR-011; US2-AS3 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-toast.test.js :: interfaz conserva toast ultimo mensaje plazo y limpieza. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T014 | US2; FR-012; US2-AS4 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-boot.test.js :: interfaz conserva cargas reintentos errores y estado de guardado. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T015 | US2; FR-013; US2-AS5 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-detail.test.js :: interfaz conserva contenido y cierres de desglose. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T016 | US3; FR-014; US3-AS1 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-responsive.test.js :: interfaz conserva CSS y matriz responsive original. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T017 | US3; FR-015; US3-AS2 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-session.test.js :: interfaz conserva foco visual de sesion y salida limpia. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T018 | US3; FR-016; US3-AS3 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-touch.test.js :: interfaz conserva cabecera sticky y medidas tactiles. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T019 | US3; FR-017; US3-AS4 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-screens.test.js :: interfaz conserva recorridos y salidas de registro. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T020 | US3; FR-018; US3-AS5 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-editorial.test.js :: interfaz conserva componentes fechas movimiento y cleanup. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T021 | US3; FR-019; US3-AS6 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-previews.test.js :: interfaz conserva contratos diferentes de ambos previews. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T022 | US3; FR-020; US3-AS7 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-compatibility.test.js :: interfaz conserva fachadas CSS y contratos anteriores. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T023 | US4; FR-021; US4-AS1 | Escribir y ejecutar sobre BASE los casos CHANGE rojos; registrar fallo específico por cada control/overlay, sin skips ni catches genéricos: change-tests/interface-accessibility.spec.js :: interfaz cambio Registrar teclado y foco; change-tests/interface-accessibility.spec.js :: interfaz cambio DetailSheet teclado y foco. Cubrir cláusulas de validation-plan. | T002 | Completada (E0; registro inferior) |
| T024 | US4; FR-022; US4-AS2 | Escribir y ejecutar sobre BASE los casos CHANGE rojos; registrar fallo específico por cada control/overlay, sin skips ni catches genéricos: change-tests/interface-accessibility.spec.js :: interfaz cambio campo Peso en kg; change-tests/interface-accessibility.spec.js :: interfaz cambio campo Correo electrónico; change-tests/interface-accessibility.spec.js :: interfaz cambio campo Contraseña. Cubrir cláusulas de validation-plan. | T002 | Completada (E0; registro inferior) |
| T025 | US2; FR-023; US2-AS6 | Crear y ejecutar sobre BASE el pin AS-IS: test/interface-dismiss.test.js :: interfaz conserva descarte general siete dias y deshacer. Cubrir cláusulas de validation-plan. | T002 | Completada (G-PIN; registro inferior) |
| T026 | US1/US2/US3; 42 IDs AS-IS | Añadir siete recorridos Chromium de la matriz; ejecutar todos los subcasos y anchuras previstos. Nombres únicos y pruebas funcionales reales; red abortada. | T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018, T019, T020, T021, T022, T025 | Completada (G-PIN; registro inferior) |
| T027 | US1/US2/US3; FR-003/009/010/011/014/020; escenarios correspondientes | Cuatro mutaciones AS-IS con control original: no limpiar fecha, invertir resolución auto, perder reinicio de toast y alterar breakpoint de navegación. Negativos de trazabilidad: prueba ausente/duplicada/skip/retry y estado partial/pending rechazado por complete. Guardar aserción y salida detectadas. | T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018, T019, T020, T021, T022, T025 | Completada (G-PIN; registro inferior) |
| T028 | US1/US2/US3/US4; todos los FR/escenarios | G-PIN: src/index idénticos a BASE, 42 AS-IS completos y 6 CHANGE pending; siete rojos específicos, suite verde separada, build/medidas y revisión de cláusulas. Congelar pins/fixtures/harness/oráculos y comprobar 68 anteriores; registrar sourceHash, revisión y runtime. | T026, T027, T023, T024, T040, T041 | Completada (G-PIN; registro inferior) |
| T029 | US1/US3; FR-001/002/003/004/005/007/019/020; US1-AS1/2/3/4/5/7, US3-AS6/7 | E1: extraer configuración pura de navegación y adaptar callers; conservar estados, alias, key por tab y orden de setters. Introducir prueba de capa/negativos y ejecutar checkpoint completo. | T028 | Completada (E1; registro inferior) |
| T030 | US2/US3; FR-009/010/012/019/020; US2-AS1/2/4, US3-AS6/7 | E2: separar ui-theme/use-app-theme y mantener fachada app-utils. Listener/persistencia/primer render conservados; negativos de dependencias y checkpoint completo. | T029 | Completada (E2; registro inferior) |
| T031 | US1/US2/US3; FR-001/002/004/011/012/013/014/015/016/017/018/019/020; escenarios correspondientes | E3: extraer CSS íntegro y presentación AppNavigation con dependencias inyectadas; conservar CSS/Train exports, anclas y geometría. Adaptar solo pruebas no congeladas de ubicación con mismo contrato original; checkpoint completo. | T030 | Completada (E3; registro inferior) |
| T032 | US1/US2/US4; FR-002/003/013/021; US1-AS2/3, US2-AS5, US4-AS1 | E4: implementar ModalSheet y usarlo en Registrar/DetailSheet solo tras los dos rojos; probar foco/teclado/cleanup/cancelación/navegación. Actualizar solo FR-021 y US4-AS1 a complete tras todas sus cláusulas verdes. Checkpoint completo. | T031, T023 | Completada (E4; registro inferior) |
| T033 | US2/US4; FR-012/022; US2-AS4, US4-AS2 | E5: asociar solo peso/correo/contraseña tras sus tres rojos; preservar validación/submit/guardado y pasar regresiones 002/005. Completar FR-022/US4-AS2 y checkpoint completo. | T032, T024 | Completada (E5; registro inferior) |
| T034 | US1/US2/US3/US4; FR-020 y todos los consumidores | E6: cerrar límites transitivos/exports y sus fixtures negativos, comprobar ausencia de ciclos e import de dominio/backend en shell/modal. Registrar hash final del guard, sin reescribir pins E0. | T033, T042 | Pendiente |
| T035 | US1/US2/US3/US4; todos los FR/escenarios | Incluir suite CHANGE verde en descubrimiento Playwright por proyectos sin duplicar existentes; extender CI con gate/artifacts006 y conservar jobs/gates previos. Probar verificador y cero skips/retries. | T034 | Pendiente |
| T036 | US1/US2/US3/US4; FR-021/022 y 21 regresiones relacionadas | Ejecutar negativos postverde: quitar Escape y quitar asociación de etiqueta; exigir detección por pruebas correspondientes. Revisar individualmente las aserciones de 21 casos y vincular cada afirmación visual/interactiva a prueba funcional exacta; inventariar también asserts UI fuera de ese archivo y sus dueños. No basta copiar títulos ni declarar KD-002 cerrada con brechas. | T035 | Pendiente |
| T037 | US1/US2/US3/US4; todos los FR/escenarios | Checkpoint final: Node/Chromium/build, seis manifiestos sobre mismos resultados/src (184 IDs), 68 pins previos y nuevos congelados intactos, RLS local fresco con cleanup, tamaños min/gzip BASE/final y diferencias explicadas. | T036, T043 | Pendiente |
| T038 | US1/US2/US3/US4; todos los FR/escenarios; SC-006 | Converge spec/plan/tareas/constitución y revisión de aserciones; cero gaps locales. Preparar informe de eventual retirada KD-002 solo si evidencia completa, pendiente de PATCH/ratificación separadas; registrar límites/hallazgos restantes. | T037 | Pendiente |
| T039 | US1/US2/US3/US4; todos los FR/escenarios | Preparar PR de código con pruebas/omisiones/orden/reversión y estado real. Publicación, fusión y Vercel solo con autorización específica. | T038 | Pendiente |

## Revisión inicial de tareas

- Cada FR/escenario tiene prueba y tarea concreta T003–T025; 21 grupos AS-IS previos a src.
- T023/T024 exigen cinco rojos antes de T032/T033; T028 bloquea todas las extracciones.
- Dependencias acíclicas; E0–E6 con entregables. Los nombres de pruebas son previstos.
- Aprobación del alcance ya registrada; aprobación de estas 39 tareas pendiente.

## Registro de ejecución y converge

E0 en ejecución, sin G-PIN superado. Al completar una tarea, registrar
revisión, comandos, resultados, omisiones y desviaciones. Converge solo añade
tareas numeradas; nunca reescribe completadas ni convierte propuestas en evidencia.

## Registro parcial E0 — 2026-10-20

T001: aprobación expresa y snapshot documental e06f105. T002: harness sintético,
config CHANGE, oráculos CSS/geometría y build original preparados, sin src.
T023/T024: cinco rojos específicos de accesibilidad observados, no fallos de
montaje. Los 21 grupos Node pasaron y los controles de mutación se ejecutaron;
la revisión de cláusulas y checkpoint completo de cada tarea sigue pendiente.
T026: primera pasada 6/7, discrepancia de resaltado detectada; se repite tras
aprobar precisión FR-008 y mantener la aserción temporal en CHANGE rojo.
T028 no superada. FR-024 aprobado; T040–T043 aún no se consideran aprobadas.

## Extensión aprobada — T040–T043 (2026-10-20)

| ID | Historia y contrato | Resultado/tarea | Depende de | Estado |
| --- | --- | --- | --- | --- |
| T040 | US1; FR-008/024; US1-AS8/9 | Registrar precisión aprobada y observación App/aislada; conservar fallo y control AS-IS | T002 | Completada (alcance acafd25) |
| T041 | US1; FR-024; US1-AS9 | Ejecutar dos CHANGE rojos sobre BASE y revisar motivos específicos | T040 | Completada (G-PIN; registro inferior) |
| T042 | US1; FR-008/024; US1-AS8/9 | E5b: implementar vida del resaltado independiente del consumo, reemplazo y cleanup; checkpoint completo | T033, T041 | Pendiente |
| T043 | US1/US3; FR-020/024; US3-AS7, US1-AS9 | Negativo de temporizador, descubrimiento y revisión final de aserciones | T036, T042 | Pendiente |

Las aristas adicionales de T028/T034/T037 están incorporadas a sus filas aún
pendientes; no se reescribe ninguna tarea completada. Total43 tareas aprobadas.
Conteos vigentes:48 IDs006,42 AS-IS y seis CHANGE; cierre184 IDs en seis contratos.

## Cierre E0 / G-PIN — 2026-10-20

T003–T028 y T041 completadas sobre BASE86299a4, sin cambios de src/index.
[Baseline](evidence/baseline.json):309/309 Node,20/20 Chromium, siete CHANGE
rojos por los motivos previstos, build verde y cuatro mutaciones detectadas.
Verificador parcial sin errores sobre la colección fresca; complete rechaza
únicamente los seis IDs CHANGE pendientes.33 pins nuevos congelados y68 previos
verificados. Revisión de cláusulas en assertion-review.md. Los fallos previos
se conservan en e0-attempts; el último ajuste de fixture añade una segunda
sesión para medir filtros reales de fuerza. No hubo modificación de producto.
E1 queda habilitada por la aprobación local registrada en3d542bc. RLS fresco
se mantiene para E6; no hay publicación, integración ni despliegue006.

## E1 completada — 2026-10-20

T029: checkpoint completo aprobado: 311 Node,20 Chromium, build y101 pins verificados.42 AS-IS completos; seis CHANGE siguen pendientes. [Evidencia](evidence/e1.json). Sin cambios de datos, SQL o dependencias.

## E2 completada — 2026-10-20

T030: checkpoint completo aprobado: 312 Node,20 Chromium, build y101 pins verificados.42 AS-IS completos; seis CHANGE siguen pendientes. [Evidencia](evidence/e2.json). Sin cambios de datos, SQL o dependencias.

## E3 completada — 2026-10-20

T031: checkpoint completo aprobado: 313 Node,20 Chromium, build y101 pins verificados.42 AS-IS completos; seis CHANGE siguen pendientes. [Evidencia](evidence/e3.json). Sin cambios de datos, SQL o dependencias.

## E4 completada — 2026-10-20

T032: 313 pruebas Node,20 Chromium AS-IS y2 CHANGE verdes; build aprobado y101 pins intactos. Trazabilidad:44 IDs completos y4 pendientes. [Evidencia](evidence/e4.json). No se modificaron aserciones congeladas. RLS y cierre E6 siguen pendientes.

## E5 completada — 2026-10-20

T033: 313 pruebas Node,20 Chromium AS-IS y5 CHANGE verdes; build aprobado y101 pins intactos. Trazabilidad:46 IDs completos y2 pendientes. [Evidencia](evidence/e5.json). No se modificaron aserciones congeladas. RLS y cierre E6 siguen pendientes.
