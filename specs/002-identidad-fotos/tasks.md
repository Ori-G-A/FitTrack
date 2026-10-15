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
| T009 | US2, aislamiento | Diseño local desechable y guardas comprobadas antes de conexión | Parcial: guarda pura y tres pruebas verdes; falta integrarla en runner y fixture |
| T010 | US2, aislamiento | RLS ejecutada para dos usuarios y anónimo, permitidos/denegados | Pendiente; motor Docker no disponible |
| T011 | Todas | Clarify/checklist/aprobación spec/plan/tasks y analyze | Completo: aprobación explícita de alcance y después plan/tareas/revisión |
| T012 | Todas | PR documental preparado; integración por propietario | Cuerpo preparado; ejecución local autorizada antes de integración remota |
| T013 | Todas | Gate PIN completo sobre src original, hashes y trazabilidad | Pendiente de RLS; alcance aprobado y evidencia preparatoria ejecutada |
| T014 | US2, compatibilidad | Separar coordinación de fotos y conservar fachada | Pendiente de puertas |
| T015 | US1, sesión | Evaluar extracción según beneficio demostrado | Evaluación preparada: mantener en App, justificación en research; sin extracción propuesta |
| T016 | US3, arranque | FR-012: prueba roja e implementación de validación aprobada | CHANGE aprobado; pendiente de plan/gate PIN y ejecución |
| T017 | US3, diagnóstico | FR-013: prueba roja e implementación de fallback sanitizado | CHANGE aprobado; pendiente de plan/gate PIN y ejecución |
| T018 | Todas | Límites de capas, pins de 001 intactos, suite/Chromium/build | Pendiente final; checkpoint preparatorio en verification |
| T019 | Todas | Converge, revisión KD y evidencia completa por ID | Pendiente |
| T020 | Todas | Cuerpo PR de código con orden de merge y límites observados | Pendiente |
| T021 | Todas | Incluir gate completo 002 en CI con entorno local desechable y documentar límites remotos | Pendiente; hallazgo TEST-002-02 de analyze |
| T022 | US2, capas sin DOM | Separar localISO puro conservando reexport de app-utils para eliminar localStorage transitivo | Implementado; checkpoint completo de E1 en curso |

Converge añadirá T023 en adelante si aparecen gaps; no reescribirá tareas
completadas. Ningún pending/partial es admisible al presentar PR de código.

## Autorización de ejecución local — 2026-10-15

El propietario aprobó plan, tareas y revisión mediante «Aprobar plan, tareas y
revisión; continuar implementación local». Se autoriza ejecutar E1–E3 localmente
y conservar RLS real como requisito de cierre. Los estados de propuesta anteriores
son históricos; no hay integración remota ni cierre RLS declarado.
