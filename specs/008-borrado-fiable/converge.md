# Converge 008 — cierre local

Estado: E0–E3 verificadas el 2026-10-24 (Bogotá). Sin publicación ni autorización remota.
[Revisión](evidence/completion-review.json), [checkpoint final](evidence/final.json), [verificación](verification.md).

## Puertas y responsabilidades

- Alcance/C-001–003 aprobados en 462a344; plan y ejecución local en 2ee8edc.
- Cuatro AS-IS verdes y trece CHANGE rojos específicos antes de modificar src; ocho pins E0 intactos.
- 107 firmas históricas intactas y PIN-008-001 explícita; adendas 001 FR-011/US3-AS2 y 006 FR-012.
- Motor/coordinador puros separados de adaptación React y presentación; capas y negativos de dependencia aprobados.
- 370 Node/30 Chromium/build, once mutaciones nuevas/heredadas, RLS real fresco y limpieza aprobados.
- Ocho contratos/234 IDs completos desde el mismo sourceHash; 29 IDs propios completos.
- T038 fue aditiva, dentro de FR-005/009/010: doce rojos en candidato previo y catorce verdes dirigidos; rechazo falsy no impide recuperación. [Evidencia](evidence/rejection-values.json).
- T037 fue aditiva, dentro de FR-008/011. Sus dos casos posteriores están identificados como suplementos, sin atribuirles rojo original.
- CI mantiene siete puertas anteriores, mutaciones 006/007 y RLS separado; añade 008 y sus artefactos. CI remoto pendiente.

## Revisión por cláusula

Los nombres conservan el contrato aprobado; se revisaron aserciones, no solo conteos.
Cada fila enlaza historia, caso ejecutado y tarea de caracterización.

| ID | Historia | Casos aprobados | Tareas E0 |
| --- | --- | --- | --- |
| FR-001 | US1 | borrado008 confirmacion exacta y cancelacion no producen efectos | T005 |
| FR-002 | US1 | borrado008 usuario ausente rechaza antes de efectos | T005 |
| FR-003 | US1 | borrado008 conserva orden cola fotos registros y propietario | T006 |
| FR-004 | US1 | borrado008 conserva efectos parciales sin rollback | T006 |
| FR-005 | US2 | borrado008 cierre distingue retorno error y rechazo | T007 |
| FR-006 | US2 | borrado008 navegador fallo persiste visible y accesible | T012 |
| FR-007 | US2 | borrado008 feedback sobrevive al desmontaje de Ajustes; borrado008 resultado de borrado no confirmado conserva bloqueo; borrado008 no recrea datos tras fallo de cierre | T008, T007 |
| FR-008 | US3 | borrado008 no recrea datos tras fallo de cierre; borrado008 visibilidad e intervalo no reactivan guardados | T007, T009 |
| FR-009 | US3 | borrado008 recarga temprana fallida conserva bloqueo; borrado008 recarga temprana completa precede a nuevos guardados | T010 |
| FR-010 | US2 | borrado008 resultado de borrado no confirmado conserva bloqueo; borrado008 no recrea datos tras fallo de cierre; borrado008 reintento manual solo cierra sesion | T007, T008 |
| FR-011 | US4 | borrado008 fallo tardio de A no habilita ni escribe B; borrado008 respuesta de A no cierra ni continua B; borrado008 cambio A B A invalida el intento anterior | T011 |
| FR-012 | US2 | borrado008 feedback sobrevive al desmontaje de Ajustes | T008 |
| FR-013 | US1 | borrado008 intento y recuperacion no se duplican | T008 |
| US1-AS1 | US1 | borrado008 confirmacion exacta y cancelacion no producen efectos | T005 |
| US1-AS2 | US1 | borrado008 usuario ausente rechaza antes de efectos | T005 |
| US1-AS3 | US1 | borrado008 conserva orden cola fotos registros y propietario | T006 |
| US1-AS4 | US1 | borrado008 intento y recuperacion no se duplican | T008 |
| US2-AS1 | US2 | borrado008 navegador fallo persiste visible y accesible; borrado008 feedback sobrevive al desmontaje de Ajustes | T012, T008 |
| US2-AS2 | US2 | borrado008 resultado de borrado no confirmado conserva bloqueo | T007 |
| US2-AS3 | US2 | borrado008 cierre distingue retorno error y rechazo; borrado008 no recrea datos tras fallo de cierre | T007 |
| US2-AS4 | US2 | borrado008 cierre distingue retorno error y rechazo; borrado008 no recrea datos tras fallo de cierre | T007 |
| US2-AS5 | US2 | borrado008 reintento manual solo cierra sesion | T008 |
| US3-AS1 | US3 | borrado008 visibilidad e intervalo no reactivan guardados | T009 |
| US3-AS2 | US3 | borrado008 visibilidad e intervalo no reactivan guardados | T009 |
| US3-AS3 | US3 | borrado008 recarga temprana fallida conserva bloqueo | T010 |
| US3-AS4 | US3 | borrado008 recarga temprana completa precede a nuevos guardados | T010 |
| US4-AS1 | US4 | borrado008 fallo tardio de A no habilita ni escribe B | T011 |
| US4-AS2 | US4 | borrado008 respuesta de A no cierra ni continua B | T011 |
| US4-AS3 | US4 | borrado008 cambio A B A invalida el intento anterior | T011 |

## Resultado y límites

El fallo queda en la raíz por sesión, con datos confirmados separados del cierre. La recarga manual temprana no reanuda hasta aplicar valores frescos; después del despacho solo se permite cerrar sin repetir borrado. Guardas de carga/visibilidad/intervalo y generación A→B→A impiden aplicar resultados obsoletos o habilitar guardados ajenos.

La revisión no encontró brechas pendientes dentro de 008. No promete rollback, cancelación de operaciones ya invocadas dentro del SDK, caché durable ni restauración de fotos parciales. Se conserva TEST-001 y el aviso de bundle fuera de este alcance. No hay prueba autenticada de producción ni certificación de RLS productivo.

El intento RLS fallido permanece archivado como historia. Su fixture se retiró con verificación de propietario, cero contenedores/volúmenes y directorio eliminado antes del nuevo ensayo. El ensayo fresco aprobó tres contratos y cleanup.

## Entrega preparada

Snapshot documental 2ee8edc en codex/008-borrado-fiable-docs; código en codex/008-borrado-fiable. [PR documental](doc-pr.md) primero y [PR de código](code-pr.md) después. Falta autorización específica de publicación, integración con CI remoto verde y Vercel. Revert coordinado de código/adendas/pin, sin restaurar datos eliminados.
