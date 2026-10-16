# Tareas propuestas — 002

Estado: PLAN DE TAREAS APROBADO, 2026-10-15, con autorización de ejecución
local. Las marcas distinguen preparación, implementación y cierre pendiente.

| ID | Historia/resultado | Tarea y condición de cierre | Estado |
| --- | --- | --- | --- |
| T001 | US1/US2/US3, contrato verificable | Survey, llamadas y decisiones C2 inventariadas | Hecho preparatorio |
| T002 | US1, acceso | Pins auth-service: normalización, errores y 15000 ms | Hecho preparatorio |
| T003 | US1, acceso | UI real: vacíos, registro corto, busy, mensajes y cambio de modo | Hecho preparatorio; DOM jsdom |
| T004 | US1, sesión | Consulta/eventos/cleanup/reintento y cambio de usuario con reloj controlado | Hecho preparatorio |
| T005 | US2, fotos | Pins validación/compresión/firma/subida/hidratación y backup | Hecho preparatorio |
| T006 | US2, borrado | Pins paginación, filtros, orden, errores y plazos Storage | Hecho preparatorio |
| T007 | US2, recuperación | Visibilidad/12h/cleanup/merge con borrado concurrente | Hecho preparatorio; callback e intervalo registrados, sin esperar 12h reales |
| T008 | US3, privacidad | Pins flag, sesión, cupo, sanitización, error y handlers | Hecho preparatorio |
| T009 | US2, aislamiento | Diseño local desechable y guardas comprobadas antes de conexión | Completo E4: runner, marcador y negativos de destino/marcador/evidencia |
| T010 | US2, aislamiento | RLS ejecutada para dos usuarios y anónimo, permitidos/denegados | Completo E4: tres contratos reales aprobados y limpieza confirmada con guardas definitivas |
| T011 | Todas | Clarify/checklist/aprobación spec/plan/tasks y analyze | Completo: aprobación explícita de alcance y después plan/tareas/revisión |
| T012 | Todas | PR documental preparado; integración por propietario | Cuerpo preparado; ejecución local autorizada antes de integración remota |
| T013 | Todas | Gate PIN cliente sobre src original, hashes y trazabilidad; RLS separado según plan aprobado | Completo cliente: client-baseline.json y once pins intactos; RLS en T010 |
| T014 | US2, compatibilidad | Separar coordinación de fotos y conservar fachada | Completo E1, 74de716 |
| T015 | US1, sesión | Evaluar extracción según beneficio demostrado | Completo: mantener en App, justificación en research; sin cambios de sesión |
| T016 | US3, arranque | FR-012: prueba roja e implementación de validación aprobada | Completo E2, 4a23f37, rojo por llamada previa al SDK y verde completo |
| T017 | US3, diagnóstico | FR-013: prueba roja e implementación de fallback sanitizado | Completo E3, 54deef5, rojo por aviso ausente y verde completo |
| T018 | Todas | Límites de capas, pins de 001 intactos, suite/Chromium/build | Completo para cliente E1–E3: 220 Node, 3 Chromium y build; RLS en T010 |
| T019 | Todas | Converge, revisión KD y evidencia completa por ID | Completo local: 23/23 IDs, KD revisadas; retirada formal e integración remota separadas |
| T020 | Todas | Cuerpo PR de código con orden de merge y límites observados | Preparado en code-pr.md; apertura/fusión por propietario |
| T021 | Todas | Incluir gate completo 002 en CI con entorno local desechable y documentar límites remotos | Configuración completa en rls-and-sdd-002; ejecución remota no observada |
| T022 | US2, capas sin DOM | Separar localISO puro conservando reexport de app-utils para eliminar localStorage transitivo | Completo E1, mismos cálculos y checkpoint repetido verde |
| T023 | US2, evidencia fiable | Invalidar evidencia verde antes del preflight y acotar herramientas/limpieza | Completo: regresión negativa y ejecución real final aprobadas |
| T024 | US2, destino local | Rechazar pipes Docker remotos además de TCP/SSH y probar sockets locales | Completo: prueba negativa y matriz real final aprobadas |
| T025 | Todas | Repetir gate completo tras reforzar guardas y verificar limpieza/hash/pins | Completo: 226 Node, 3 RLS, 3 Chromium, 23/23 IDs, once pins intactos |

Converge añadirá T026 en adelante si aparecen gaps; no reescribirá tareas
completadas. Ningún pending/partial es admisible al presentar PR de código.

## Autorización de ejecución local — 2026-10-15

El propietario aprobó plan, tareas y revisión mediante «Aprobar plan, tareas y
revisión; continuar implementación local». Se autoriza ejecutar E1–E3 localmente
y conservar RLS real como requisito de cierre. Los estados de propuesta anteriores
son históricos; no hay integración remota ni cierre RLS declarado.
