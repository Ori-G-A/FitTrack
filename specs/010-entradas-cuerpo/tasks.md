# Tareas 010 — entradas numéricas de Cuerpo

Estado: 31 tareas APROBADAS el 2026-10-27 (Bogotá); ejecución local E0–E2 autorizada.
[Plan](plan.md), [spec](spec.md), [validación](validation-plan.md), [análisis](analyze.md).
Las claves A1–M1 remiten a nombres exactos en la matriz de validación.

## E0 — original y G-PIN bloqueante

| ID | Estado | Historia / cláusulas | Entrega y criterio | Depende de |
| --- | --- | --- | --- | --- |
| T001 | completada | US1–US3 / FR-001–010 | Registrar aprobación separada del plan/tareas/análisis y ejecución local E0–E2; conservar snapshot documental aprobado, sin publicar | — |
| T002 | completada | US3 / FR-001–004; US3-AS4 | Inventariar 123 firmas efectivas, src completo/SQL/dependencias y nueve archivos de impacto; archivar seis originales; fijar hashes y versiones | T001 |
| T003 | completada | US1–US3 / FR-001–004; US3-AS1–AS4 | Baseline original íntegra Node/35 Chromium/build, con salidas y huellas; conservar fallos y repetir checkpoint afectado tras corregir | T002 |
| T004 | completada | US1/US2 / FR-005–010; US1-AS1–AS6; US2-AS1–AS4 | Crear fixture de BodyScreen real con contadores de setters, entry propio, cliente falso, red bloqueada y reloj 009; configuración solo para ocho casos nuevos | T003 |
| T005 | completada | US1/US3 / FR-001–004; US1-AS3/AS4; US3-AS1/AS2/AS3 | A1/A2/B6 originales verdes: reemplazo, historial, vacíos/null, bienestar y cero conocido; sin transformar el producto | T004 |
| T006 | completada | US1/US2 / FR-005–010; US1-AS1/AS2/AS5/AS6; US2-AS1–AS4 | B1–B5 rojos por comportamiento original, con motivo por subcláusula; nada de import ausente, selector roto o rechazo de fill por Playwright | T004 |
| T007 | completada | US3 / US3-AS4; SC-004/005 | Crear P1/T1 y helpers completos de firmas/transición/traza; negativos estructurales y transformaciones canónicas, sin aceptar after arbitrario | T002, T004 |
| T008 | completada | US1–US3 / FR-001–010; todos los escenarios | Revisar aserciones y congelar nueve archivos propios E0; G-PIN original, tres controles verdes y cinco rojos; no iniciar E1 si falla | T005, T006, T007 |

## E1 — validación, feedback y compatibilidad

| ID | Estado | Historia / cláusulas | Entrega y criterio | Depende de |
| --- | --- | --- | --- | --- |
| T009 | pendiente | US1 / FR-005/006; US1-AS1–AS6 | Implementar módulo puro body-inputs: gramática decimal, tipos hidratados, finitud, vacío/null y reglas signo/cero; resultados discriminados sin mutar entradas | T008 |
| T010 | pendiente | US1/US2/US3 / FR-001/002/005/006/007/009/010; US1-AS1/AS5/AS6; US2-AS2/AS3; US3-AS1/AS3 | Coordinar peso: validar antes de uid/setter/éxito, conservar parseKg/pasos/accesos válidos, reset solo al éxito | T009 |
| T011 | pendiente | US1/US2/US3 / FR-001/004–010; US1-AS1–AS6; US2-AS2/AS3/AS4; US3-AS1 | Coordinar las cinco medidas y retirar measurementValues tras revisar llamador único; rechazo completo, payload number/null y reset actual | T009 |
| T012 | pendiente | US1/US2/US3 / FR-001/003–010; US1-AS1–AS6; US2-AS2/AS3/AS4; US3-AS2 | Coordinar bienestar y ajustar builder a valores ya validados; conservar notas/energía, toast antes de setter e hidratación solo por fecha | T009 |
| T013 | pendiente | US1/US2 / FR-007/008/009/010; US1-AS1; US2-AS1–AS4 | Nombres de nueve campos/tres acciones, controles que admiten coma, error por formulario, role/aria y corrección; limpiar error al guardar válido o cambiar contexto de fecha | T010, T011, T012 |
| T014 | pendiente | US1/US2/US3 / FR-001–007/009/010; US3-AS1/AS2/AS3/AS4 | Aplicar transformaciones canónicas PIN-010-001/002/003/004 sin editar adendas aún; preservar las cuatro mutaciones Node de Cuerpo | T013 |
| T015 | pendiente | US3 / US3-AS4; SC-004/005 | Implementar composición 010 y transición acotada de fuente; PIN-010-005/006 y contador 008: 101/7 anteriores, 7/1 propios; conservar negativos | T014 |
| T016 | pendiente | US1/US2/US3 / FR-004–010; US1-AS1–AS6; US2-AS2/AS4; US3-AS4 | Añadir V1/V2/L1 del módulo real: matriz de nueve campos, null/inmutabilidad, dependencias puras y negativos transitivos/alcance; sin contar API ausente como rojo | T013 |
| T017 | pendiente | US1/US2/US3 / FR-005–010; US3-AS4 | Preparar runner/checker de cinco mutaciones, recibos, contrato 010, artefactos y CI; mantener proofs 009 y nueve contratos/RLS separado; terminar ejecutables antes del verde dirigido | T015, T016 |
| T018 | pendiente | US1–US3 / FR-001–010; todos los escenarios | Verde dirigido de tres pruebas antiguas enmendadas, V1/V2/L1 y ocho Chromium propios; huellas estables, nuevo src indexado; emitir transición y seis adendas verificadas | T017 |
| T019 | pendiente | US1–US3 / FR-001–010; todos los escenarios | Checkpoint E1 Node/43 Chromium/build, firmas y trazas; preservar 250 IDs anteriores sin presentar RLS antiguo como fresco; ningún contrato propio completo por evidencia parcial | T018 |
| T020 | pendiente | US3 / FR-001–004; US3-AS1–AS4 | Revisar diff de src y compatibilidad; añadir nota de sustitución normativa de 005 FR-001/002/003 sin reescribir su historia; documentar BODY-002–005 y límites | T019 |
| T021 | pendiente | US1–US3 / FR-001–010 | Congelar cuatro archivos E1 (valores, arquitectura, mutador, runner), registrar resultado E1 y commit lógico; nueve propios E0 intactos, 117/6 históricos | T020 |

## E2 — pruebas negativas, cierre e informe

| ID | Estado | Historia / cláusulas | Entrega y criterio | Depende de |
| --- | --- | --- | --- | --- |
| T022 | pendiente | US1/US2/US3 / FR-005–010; US3-AS4 | Ejecutar cinco mutaciones 010 y catorce postverde heredadas con controles positivos, recibos actuales y limpieza; conservar cuatro mutaciones Cuerpo dentro de Node | T021 |
| T023 | pendiente | US3 / US3-AS4; SC-004/005 | Negativos de nombres/resultados/adendas/transición/recibos: omitido, duplicado, parcial, plan/hash/comando/fuente ajenos y cleanup ausente deben rechazarse; registrar positivos y restauración | T022 |
| T024 | pendiente | US3 / US3-AS4; SC-004/005 | Ejecutar RLS local desechable fresco después de E1 con A/B/anónimo y tres contratos reales, guardas y limpieza; sin .env.local/backend real | T021 |
| T025 | pendiente | US1–US3 / FR-001–010; todos los escenarios | Checkpoint final íntegro Node/43 Chromium/build, diez contratos/274 IDs y recibos de diecinueve mutaciones; RLS nuevo dentro del checkpoint; repetir íntegro si falla | T022, T023, T024 |
| T026 | pendiente | US1–US3 / FR-001–010; todos los escenarios | Converge por cláusula, aserciones, nombres descubiertos y enmiendas; cero pending/partial/gaps; añadir tareas ante hallazgos, sin reescribir completadas | T025 |
| T027 | pendiente | US1–US3 / FR-001–010 | Actualizar verification/readiness/roadmap/aprobaciones con comandos, hashes, conteos reales, límites y warning de bundle; no atribuir pruebas productivas inexistentes | T026 |
| T028 | pendiente | US3 / US3-AS4; SC-004/005 | Preparar PR documental primero y código después: alcance, seis enmiendas, evidencia, omisiones, reversión coordinada y orden de merge; sin publicar | T027 |
| T029 | pendiente | US1–US3 / todos los FR/escenarios | Preparar informe final de la refactorización inicial y 007–010, con resultados/pendientes y backlog futuro separado; no iniciar 011 | T028 |
| T030 | pendiente | US3 / US3-AS4; SC-004/005 | Commits lógicos locales, revisión de enlaces/diff, fuente y firmas verificadas, árbol limpio; snapshot documental aprobado conservado | T029 |
| T031 | pendiente | US1–US3 / todos los FR/escenarios | Presentar cierre local y solicitar autorización específica para publicación/integración con CI verde/Vercel; no ejecutar esas acciones sin decisión | T030 |

## Revisión del desglose

- Cada FR/escenario tiene pruebas y tareas individuales en el manifiesto.
- E1 depende de G-PIN, que exige originales verdes y rojos funcionales.
- Las seis enmiendas citan reglas aprobadas y transformaciones acotadas.
- El verde dirigido no depende de haber declarado previamente verde la adenda.
- Converge añade tareas y exige repetir el checkpoint completo afectado.
- Los conteos finales son previsiones hasta ejecutar; la tabla registra los estados vigentes.

## Registro de ejecución local

- T001: aprobación explícita registrada en `c8be7bd`; rama documental `codex/010-entradas-cuerpo-docs` fijada en ese snapshot, sin publicar.
- T002: inventario E0 de 123 firmas efectivas y fuente, seis archivos congelados y dos fuentes originales archivados; Node 24.21.0 y huellas iguales al original. [Inventario](evidence/original-inventory.json). La baseline íntegra T003 está en ejecución.

- T003: baseline original íntegra aprobada, 372 Node/35 Chromium/build, sin skips/retries.
- T004–T007: fixture real, dos AS-IS y B6 verdes, cinco CHANGE rojos funcionales y dos tests de metadatos aprobados. El primer control de gráfico requirió avanzar su animación virtual antes de congelar; intentos 1/2 conservados como preparación.
- T008: checkpoint E0 con huellas antes/después estable, tres verdes/cinco rojos y nueve archivos congelados; sourceHash original y 123 firmas efectivas intactas. [G-PIN](evidence/baseline.json).
