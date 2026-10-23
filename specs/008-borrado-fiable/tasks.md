# Tareas 008 — borrado fiable

Estado: plan y 36 tareas aprobados el 2026-10-22. Ejecución local autorizada;
ninguna caracteriza evidencia contractual ya ejecutada. [Plan](plan.md),
[spec](spec.md), [validación](validation-plan.md), [análisis](analyze.md).
Cada fila enlaza historias y requisitos; las tareas comunes conservan esos vínculos
porque verifican el mismo resultado: borrar sin reescritura ni efectos sobre otra sesión.
Las dependencias son necesarias, no autorización para saltar puertas.

## E0 — original y congelación

| ID | Estado | Historias / cláusulas | Entrega y criterio | Depende de |
| --- | --- | --- | --- | --- |
| T001 | pendiente | US1–US4 / FR-001–013 | Registrar aprobación separada, runtime fijado y snapshot documental aprobado; conservar BASE y límites de autorización local | — |
| T002 | pendiente | US1–US4 / FR-003/004/011 | Inventariar 108 firmas efectivas, llamadores y anclas; archivar original de data-delete y helper de firmas | T001 |
| T003 | pendiente | US1–US4 / FR-001–013 | Repetir 325 Node/29 Chromium y build originales; medir bundle, versiones y sourceHash antes de añadir casos | T002 |
| T004 | pendiente | US1–US4 / FR-003/007/011 | Preparar fixtures sintéticas: DELETE elimina filas cuando corresponda, auth explícita, diferidos y reloj controlados; no modificar dobles congelados | T003 |
| T005 | pendiente | US1 / FR-001/002; US1-AS1/AS2 | Dos AS-IS verdes: confirmación exacta/cancelación y rechazo sin usuario antes de efectos | T004 |
| T006 | pendiente | US1 / FR-003/004; US1-AS3 | Dos AS-IS verdes: orden/propietario/cola y efectos parciales sin rollback | T004 |
| T007 | pendiente | US2/US3 / FR-005/007/008/010; US2-AS2/AS3/AS4 | Tres CHANGE de núcleo rojos específicos: error de cierre, resultado incierto y ausencia de recreación tras fallo | T004 |
| T008 | pendiente | US1/US2 / FR-010/012/013; US1-AS4; US2-AS1/AS5 | Tres CHANGE de App rojos: duplicados, feedback tras desmontar Ajustes y cierre manual sin repetir borrado | T004 |
| T009 | pendiente | US3 / FR-008; US3-AS1/AS2 | Un CHANGE de App rojo, con visibilidad e intervalo comprobados independientemente durante pendiente y error | T004 |
| T010 | pendiente | US3 / FR-009; US3-AS3/AS4 | Dos CHANGE de App rojos: recarga fallida mantiene bloqueo y recarga exitosa aplica valores antes del primer guardado permitido | T004 |
| T011 | pendiente | US4 / FR-011; US4-AS1/AS2/AS3 | Tres CHANGE de App rojos: fallo A con B pendiente, cierre tardío A sobre B y A→B→A; comprobar datos y efectos | T004 |
| T012 | pendiente | US2 / FR-006; US2-AS1 | Un CHANGE Chromium rojo, subcasos 390/1280 con texto seguro, nombre y anuncio accesible; congelar ocho archivos y registrar G-PIN: 7 complete/22 pending | T005, T006, T007, T008, T009, T010, T011 |

## E1 — secuencia y coordinación

| ID | Estado | Historias / cláusulas | Entrega y criterio | Depende de |
| --- | --- | --- | --- | --- |
| T013 | pendiente | US1/US2/US4 / FR-002–005/007/011 | Evolucionar motor inyectado: fases, inspección de retorno de cierre, vigencia antes/después de cada espera; fallo conserva bloqueo y error original | T012 |
| T014 | pendiente | US1–US4 / FR-007–013 | Añadir coordinador puro con actor, intento, exclusión, recuperación manual y confirmación de commit; sin segundo camino destructivo | T013 |
| T015 | pendiente | US1/US2/US3 / FR-003/005/008/010 | PIN-008-001 con original/hash/rojo/verde: enmendar solo expectativas contradictorias de data-delete y añadir adenda 001 FR-011/US3-AS2 | T013, T014 |
| T016 | pendiente | US1–US4 / FR-003/005/008/011 | Resolutor 008 independiente compuesto desde helper 007; conservar cadenas 006/007 y rechazar hashes/enmiendas falsos | T015 |
| T017 | pendiente | US1–US4 / FR-007–013 | Pruebas suplementarias de coordinador y arquitectura, incluidos StrictMode, finally obsoleto y negativos React/DOM/SDK; no sustituyen rojos E0 | T014, T016 |
| T018 | pendiente | US1–US4 / FR-001–013 | Revisar llamadores, firmas, anclas y grafo; preservar props y dependencias; verificar que no se amplíen allowlists históricas | T013, T014, T015, T016, T017 |
| T019 | pendiente | US1–US4 / FR-001–013 | Checkpoint E1 íntegro: heredados, 4 AS-IS, 3 CHANGE de núcleo y suplementos verdes, 29 Chromium heredados/build; 8 complete/21 pending, App nuevo aún pendiente | T018 |

## E2 — App y experiencia de recuperación

| ID | Estado | Historias / cláusulas | Entrega y criterio | Depende de |
| --- | --- | --- | --- | --- |
| T020 | pendiente | US4 / FR-011; US4-AS1/AS2/AS3 | Actualizar actor en callback auth y publicar generación observable incluso A→B→A batido; refresco del mismo usuario no invalida; cleanup seguro | T019 |
| T021 | pendiente | US2/US3/US4 / FR-009/011/012 | Adaptador React por raíz: snapshot estable, suscripción, carga con guardas y confirmación posterior al commit de valores frescos | T020 |
| T022 | pendiente | US3/US4 / FR-008/011 | Proteger doce hooks, carga ordinaria ya iniciada, visibilidad e intervalo; B conserva su carga/guardado independiente | T021 |
| T023 | pendiente | US1/US2 / FR-001/006/007/012 | Feedback raíz con textos seguros y controles 390/1280; conservar prompt/ancla/props de Settings y añadir adenda 006 FR-012 | T022 |
| T024 | pendiente | US1/US2/US3 / FR-009/010/013 | Conectar recarga manual temprana y cierre manual posterior, exclusión y barrera de commit; fallo de recarga/cierre mantiene bloqueo | T021, T022, T023 |
| T025 | pendiente | US1–US4 / FR-001–013 | Pasar nueve CHANGE de App y Chromium nuevo; comprobar regresiones en siete anchos, foco, Toast, previews y ausencia de error crudo | T020, T021, T022, T023, T024 |
| T026 | pendiente | US1–US4 / FR-001–013 | Checkpoint E2 entero con descubrimiento ordinario Node/Chromium y build: 29 IDs 008 completos, 30 Chromium previstos; no recertificar RLS sin ejecución fresca | T025 |
| T027 | pendiente | US1–US4 / FR-001–013 | Revisar fases, actor, primer guardado después del commit y sourceHash; añadir tareas de converge ante brechas y repetir checkpoint afectado | T026 |

## E3 — evidencia de cierre local

| ID | Estado | Historias / cláusulas | Entrega y criterio | Depende de |
| --- | --- | --- | --- | --- |
| T028 | pendiente | US2/US3/US4 / FR-005/008/009/011 | Detectar cinco mutaciones con controles positivos, fallo de negocio específico, copias aisladas sin secretos y limpieza verificada | T027 |
| T029 | pendiente | US1/US4 / FR-003/004/011 | Ejecutar RLS real en Supabase local desechable A/B/anónimo con guardas, CLI fijada y limpieza; no usar .env.local/backend real | T028 |
| T030 | pendiente | US1–US4 / FR-001–013 | Verificar ocho contratos/234 IDs sobre mismo sourceHash, cláusulas completas, firmas y adendas explícitas | T027, T028, T029 |
| T031 | pendiente | US1–US4 / FR-001–013 | Extender CI con 008 completa/artefactos; conservar siete puertas anteriores, mutaciones 006/007 y job RLS separado | T030 |
| T032 | pendiente | US1–US4 / FR-001–013 | Controles negativos del manifiesto: nombre falso/inexistente, duplicado, omitido y partial no pueden aprobar cierre | T031 |
| T033 | pendiente | US1–US4 / FR-001–013 | Checkpoint final completo Node/Chromium/build, ocho contratos y RLS fresco; registrar counts reales sin skips/retries | T032 |
| T034 | pendiente | US1–US4 / FR-001–013 | Registrar bundle comparado, readiness, límites, comandos y enlaces; conservar hallazgos ajenos y distinción producción/local | T033 |
| T035 | pendiente | US1–US4 / FR-001–013 | Converge: revisar requisitos, tareas, aprobaciones y enmiendas; cero brechas abiertas; solo añadir tareas si aparece trabajo nuevo | T034 |
| T036 | pendiente | US1–US4 / FR-001–013 | Preparar PR documental y código, orden/omisiones/reversión y commits lógicos locales; árbol limpio; sin publicar/fusionar/Vercel | T035 |

El conteo por nombre E0 es 4 AS-IS + 13 CHANGE; los subcasos y el total del runner
se registran aparte. Cada rojo debe fallar por la cláusula y ejecutarse sobre
el original, no por una API nueva ausente o un error del harness. Un checkpoint
fallido obliga a repetirlo completo después de corregirlo. T033 reutiliza RLS
fresco de T029 solo si conserva el mismo sourceHash y destino válido; si cambió
el candidato o dejó de ser fresco, lo repite. No modifica la tarea completada.
