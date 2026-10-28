# Tareas 009 — preparación determinista del reloj

Estado: 26 tareas APROBADAS el 2026-10-27; ejecución local E0–E2 autorizada. [Plan](plan.md), [spec](spec.md),
[validación](validation-plan.md), [análisis](analyze.md).
El plan y la precisión SC-001 fueron aprobados expresamente.

## E0 — baseline y regresiones sobre el original

| ID | Estado | Historias / cláusulas | Entrega y criterio | Depende de |
| --- | --- | --- | --- | --- |
| T001 | pendiente | US1–US3 / FR-001–007 | Registrar aprobación del plan, precisión SC-001 y ejecución local; conservar snapshot documental aprobado y límites remotos | — |
| T002 | pendiente | US1/US3 / FR-001/002/007; US3-AS3 | Inventariar 116 firmas efectivas; archivar tres fixtures y verificadores originales; fijar src/SQL/dependencias y huella de verificación | T001 |
| T003 | pendiente | US1–US3 / FR-001/002/003 | Repetir baseline original Node/30 Chromium/build con runtime fijado; conservar cualquier fallo y repetir checkpoint completo | T002 |
| T004 | pendiente | US1–US3 / FR-001–007 | Crear instrumental 009, pruebas Node y configuración; usar los montajes reales, demora inyectada y etapas observadas; sin reparación de reloj ni API ausente exigida al original | T003 |
| T005 | pendiente | US1/US2 / FR-001/002/003/006; US1-AS1/AS3; US2-AS1/AS2/AS3 | Caracterizar fechas/semillas/red y temporalidad original; controles de errores pasan conservando identidad y evidencia de etapa, sin atribuirlos a defecto nuevo | T004 |
| T006 | pendiente | US1/US2/US3 / FR-004/005; US1-AS2; US3-AS1 | Dos casos de carrera rojos específicos con demora; cubrir cada fixture antes de inyectar App, rechazando errores de sintaxis/importación como rojo válido | T004 |
| T007 | pendiente | US1–US3 / FR-001–007 | Congelar siete archivos E0, revisar aserciones y fijar G-PIN: nueve IDs completos/siete pending; sourceHash y 116 firmas originales intactos | T005, T006 |

## E1 — protocolo y enmiendas controladas

| ID | Estado | Historias / cláusulas | Entrega y criterio | Depende de |
| --- | --- | --- | --- | --- |
| T008 | pendiente | US1/US2 / FR-004/005/006 | Añadir preparePausedClock con cuatro APIs públicas, sin catch de éxito, esperas del host ni margen futuro; detener antes de App | T007 |
| T009 | pendiente | US1/US2/US3 / FR-001/003/004/005/007 | Adaptar mountUi; PIN-009-001 con original/rojo/verde y aserciones intactas | T008 |
| T010 | pendiente | US1/US2/US3 / FR-001/003/004/005/007 | Adaptar función local de guardado; PIN-009-002; preservar nombres, 600 ms y doce escrituras y controles accesibles | T008 |
| T011 | pendiente | US1/US2/US3 / FR-001/003/004/005/007 | Adaptar montaje de borrado; PIN-009-003; conservar confirmación, error, fechas y rutas | T008 |
| T012 | pendiente | US3 / FR-007; US3-AS3 | Componer resolutor independiente 009 después de cadenas anteriores en helpers 007/008; sin ciclos, reescritura de baselines ni aceptación genérica de hashes | T009, T010, T011 |
| T013 | pendiente | US3 / FR-007; US3-AS3 | Actualizar informe de integridad 008 y su aserción de recuentos: 105/3 anteriores, 7/1 nuevos; conservar negativos y nombres, sin cambiar oráculos de negocio | T012 |
| T014 | pendiente | US1/US2 / FR-001–006; US1-AS1/AS2/AS3; US2-AS1/AS2/AS3 | Pasar cinco casos nuevos y treinta heredados con demoras 0/250/1500; comprobar reloj antes de App y plazos posteriores al montaje | T009, T010, T011, T012, T013 |
| T015 | pendiente | US3 / FR-007; US3-AS1/AS2/AS3 | Preparar runner 009, huellas/recibos, selección de contrato y CI/artefactos; conservar ocho puertas previas, once mutaciones y RLS separado | T014 |
| T016 | pendiente | US1–US3 / FR-001–007 | Checkpoint E1 Node/35 Chromium/build, firmas y traza; catorce complete/dos pending; no declarar cierre ni recertificar RLS sin ensayo fresco | T015 |

## E2 — mutaciones y cierre local

| ID | Estado | Historias / cláusulas | Entrega y criterio | Depende de |
| --- | --- | --- | --- | --- |
| T017 | pendiente | US1/US3 / FR-004/005/007; US3-AS1/AS2 | Reintroducir patrón original por fixture en tres copias aisladas, controles positivos, error específico y limpieza; huella estable | T016 |
| T018 | pendiente | US2/US3 / FR-003/007; US2-AS1/AS2/AS3 | Ejecutar once mutaciones heredadas con recibos de huella antes/después; no reutilizar reportes por conservar src igual | T016 |
| T019 | pendiente | US1/US3 / FR-002/007 | RLS fresco posterior a E1 en entorno local desechable A/B/anónimo, guardas y limpieza; sin .env.local ni backend real | T016 |
| T020 | pendiente | US1–US3 / FR-001–007 | Checkpoint final íntegro: Node, descubrimiento ordinario Chromium, build, nueve contratos/250 IDs, RLS y mutaciones con misma huella | T017, T018, T019 |
| T021 | pendiente | US3 / FR-006/007; US3-AS2/AS3 | Ejecutar controles negativos de trazabilidad/enmiendas/recibos: nombre falso, omitido, duplicado, parcial, plan/hash/archivo/huella ajenos y cleanup ausente deben rechazarse | T020 |
| T022 | pendiente | US3 / FR-007 | Revisar paridad CI/local y artefactos, nuevas importaciones en copias de mutación y ausencia de escapes de red; sin ejecución remota | T020, T021 |
| T023 | pendiente | US1–US3 / FR-001–007 | Registrar comandos, versiones, conteos reales, bundle sin optimización atribuida, hashes, enlaces y límites de producción/estabilidad | T022 |
| T024 | pendiente | US1–US3 / FR-001–007 | Converge por cláusula: dieciséis completos, 234 previos conservados, ninguna brecha; añadir tareas ante hallazgos sin reescribir las completadas | T023 |
| T025 | pendiente | US3 / FR-007 | Preparar PR documental primero y código después con omisiones, enmiendas y reversión coordinada; sin publicar | T024 |
| T026 | pendiente | US1–US3 / FR-001–007 | Commits lógicos de etapas locales, árbol limpio, evidencia fallida conservada y solicitud posterior de autorización remota | T025 |

El total Node se registra desde el runner. Los 35 casos Chromium son previsión,
no ejecución actual. Tras un fallo se repite entero el checkpoint afectado.
E0 autorizada por aprobación expresa del plan y de la precisión SC-001.
