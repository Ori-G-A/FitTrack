# Evidencia de implementación — 001-datos

Fecha de inicio: 2026-10-15. Rama local: `codex/001-datos-code`.
Autorización: «apruebo todo. Cotninua con el trabajo», después de presentar
tareas/analyze y sus puertas. Se registra aprobación de esos artefactos y orden
directa de continuar localmente. No se representa como publicado/fusionado un
PR remoto: apertura y merge por el propietario continúan pendientes.

## G-PIN — verde sobre producción original

BASE: `46697650f18043319a7c96ccdf93ebbdf29e2d75`.
`git diff BASE -- src` vacío antes de ejecutar `pnpm test:sdd:complete`.
Runtime: Node 24.21.0 / pnpm 11.11.0.

| Checkpoint | Ejecutado | Resultado |
| --- | --- | --- |
| Pins nuevos T002–T011 | Node sobre los seis archivos data-*.test.js | 26 pruebas incluidas sus subcasos, 26 aprobadas |
| Suite original + pins | pnpm test:sdd:complete, salida TAP | 158 pruebas, 158 aprobadas, 0 fallidas/omitidas |
| Chromium | Mismo checkpoint completo | 3 recorridos aprobados |
| Trazabilidad completa | Mismo checkpoint completo | 21 complete, 0 partial, 0 pending |

El runner informa 145 resultados de nivel superior (142 Node + 3 Chromium);
TAP cuenta además subcasos y da 158 pruebas Node. No son 145 pruebas adicionales.
Resumen/hash y hashes de los seis archivos de pins: [baseline](evidence/baseline.json).
Los resultados se conservarán sin alterar aserciones al extraer código.

## Primer checkpoint fallido y corrección del harness

Primer pase de pins: 19 aprobadas, 7 fallidas de 26 (incluye un grupo padre
fallido). No se modificó producción para resolverlo.

- El reloj avanzaba antes de que los efectos de React quedaran comprometidos.
  Se añadió un marcador de commit exclusivamente al bundle de pruebas.
- Se contaban eventos mientras aún empezaba otra escritura independiente.
  Se esperó su inicio antes de comprobar que la suspensión es silenciosa.
- La prueba de borrado pretendía observar un mensaje de Settings que no forma
  parte de FR-011. El desmontaje durante loaded=false puede perder ese estado
  local. Ahora los casos excepcionales verifican el callback real de App, su
  rechazo y reanudación; el caso de éxito sigue pasando por UI. Se registró el
  posible problema de presentación para seguimiento, sin corregir producto.

Después se reejecutó el checkpoint completo de 26 pins y luego toda la suite y
Chromium. Los pins nuevos no se habían declarado válidos antes de ese cierre.

## Entregas

| Entrega | Estado | Evidencia |
| --- | --- | --- |
| T001–T012 / G-PIN | Completa | Baseline anterior y revisión de cláusulas por FR |
| T013 / límites | Checker creado y activado por módulo | Grafo transitivo y negativos React/DOM; lifecycle se incorpora al crearlo |
| E1 / T014–T015 | Completa | 159/159 Node; mismos pins públicos, 3 mutaciones y límites verdes |
| E2 / T016–T017 | Completa | 159/159 Node y 1 smoke adicional de ambos previews; cleanup/migraciones preservados |
| E3 / T018–T019 | Completa | 160/160 Node, 3/3 Chromium, 21 filas completas; pins de copia sin cambios |
| E4 / T020–T021 | Completa | 160/160 Node, 3/3 Chromium y gate de 21 filas; errores por paso preservados |
| T022–T024 / converge | Completa localmente | Gate completo, build y audit verdes; revisión local sin gaps nuevos; CI remoto pendiente |

CI remoto no observado. No hay despliegues ni pruebas contra datos reales.

## Cierre local

Suite final: 160/160 Node y 3/3 Chromium. El runner agrega 147 resultados de
nivel superior (144 Node + 3 browser); los subcasos llevan el total Node a 160.
Gate completo: 21/21. Build: 2254 módulos, 16,90 s; chunk index 508,72 kB.
Audit: 0 vulnerabilidades. Hashes de los seis pins: idénticos a BASE.
Código: `80920d4c1ff86648ef5f39ce459284929d7cf975`.
Detalle: [converge](converge.md). Cuerpo para revisión: [PR de código](code-pr.md).

## Notas de ejecución por tarea

| Tarea | Trabajo y evidencia |
| --- | --- |
| T001 | Fixtures de sesión/Storage, relojes, capturas de App y módulos aislados; cliente real excluido |
| T002 | Consulta/upsert, fallback y frontera 15000 ms; grupo lectura/escritura verde en BASE y final |
| T003 | Cola/concurrencia/referencias, grupo correspondiente verde en ambas revisiones |
| T004 | Bus/errores/intercalados y promesas resueltas, grupo de eventos verde |
| T005 | Suspensión y snapshot de colas, grupo correspondiente verde |
| T006 | Hook React, 599/600 ms, delay explícito y unsubscribe, grupo correspondiente verde |
| T007 | Carga/migraciones/cancelación y error de fotos, grupo correspondiente verde |
| T008 | 12 claves/URLs/timer y payloads, grupo correspondiente verde |
| T009 | Exportación no espera cola, fotos completas, error y revocación, grupo verde |
| T010 | Importación/fronteras/validación/aplicación parcial y cleanup, grupo verde |
| T011 | Callback original de borrado/fallos por etapa/sin usuario; caso de éxito por UI. Ajuste de técnica explicado arriba |
| T012 | 158/158 Node y 3/3 Chromium sobre src intacto; 21 complete y baseline guardada antes de extraer |
| T013 | Imports transitivos y referencias DOM directas; negativos React/DOM; módulos activados al crearlos |
| T014 | Coordinador extraído en E1, conservando fachada/instancia global y semántica |
| T015 | 159/159 Node después de E1, incluidos mutaciones y límites |
| T016 | Coordinación de carga extraída a lifecycle en E2 |
| T017 | 159/159 Node y smoke de ambos previews con Train, tras E2 |
| T018 | Importación/exportación extraídas preservando adaptadores y orden, E3 |
| T019 | 160/160 Node y 3/3 Chromium; 21 complete tras E3 |
| T020 | Borrado coordinado en lifecycle y consulta filtrada en adaptador, E4 |
| T021 | 160/160 Node y 3/3 Chromium; 21 complete tras E4 |
| T022 | Trazabilidad completa y negativos verdes; seis hashes de pins sin cambios |
| T023 | Suite/build/audit locales verdes; se declara CI remoto no ejecutado, gate externo antes de merge |
| T024 | Revisión contra spec/plan/constitución sin gaps nuevos; code-pr preparado y cierre de KD-001 propuesto, no aplicado |
