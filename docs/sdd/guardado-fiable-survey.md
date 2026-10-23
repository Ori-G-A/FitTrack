# Survey 007 — errores de guardado visibles y recuperables

Estado: preparación de alcance; sin CHANGE aprobado. Fecha: 2026-10-21 (Bogotá).
BASE: `4eee59db2efb7ff389acdb5396b4e77ca4094cad`.
Gobierno: [constitución 1.0.3](../../.specify/memory/constitution.md).

## Hallazgo priorizado

DATA-003 permanece abierto tras la refactorización. En
[save-coordinator](../../src/save-coordinator.js:15), comenzar una escritura
emite `saving` con error nulo y reemplaza el error agregado. Si falla A, B sigue
pendiente y después comienza C, terminar B/C puede publicar `saved` aunque A
no se haya guardado. [Reproducción sintética](../../specs/007-guardado-fiable/evidence/survey.json).

La reproducción ejecuta el coordinador real con promesas diferidas y tres
claves sintéticas, sin Supabase ni credenciales. Usó Node global v26.5.0:
es diagnóstico, no baseline contractual con el runtime fijado. El plan debe
repetir caracterización y rojos con Node 24.21.0 antes de implementar.
El test existente `datos eventos y promesas de guardado` ya conserva esta
secuencia AS-IS en [data-sync](../../test/data-sync.test.js:24).

## Responsabilidades y contratos afectados

| Frontera | Evidencia | Restricción propuesta |
| --- | --- | --- |
| Cola y bus | [save-coordinator](../../src/save-coordinator.js) | Preservar orden por usuario:clave y promesas; cambiar solo agregación y consulta de estado |
| Fachada y debounce | [data-sync](../../src/data-sync.js) | Mantener 600 ms, limpieza, persistencia inyectada y APIs existentes salvo evolución explícita del estado |
| Indicador | [AuthUI](../../src/AuthUI.jsx:7) | Actualmente suscribe sin snapshot ni usuario; al remontar empieza idle |
| Sesión y shell | [FitTrack](../../src/FitTrack.jsx:324) y [AppNavigation](../../src/AppNavigation.jsx) | Indicador pertenece al rail; verificar visibilidad real móvil antes de corregir |
| Contratos anteriores | [001 FR-004/006](../../specs/001-datos/spec.md), [006 FR-012](../../specs/006-interfaz/spec.md) | La nueva política debe declarar qué semántica sustituye; no fingir que todo AS-IS permanece |

## Propuesta de decisión

Conservar fallos por usuario y clave hasta una escritura posterior exitosa
de ese mismo par; éxitos de otras claves no los resuelven. El indicador muestra
el estado del usuario actual, incluso al remontar, sin recibir errores tardíos
de otro usuario. Hacer el error perceptible en móvil y escritorio y accesible
como estado textual. La retención es en memoria durante la ejecución; no se
introducen caché durable, nuevas escrituras ni reintentos automáticos.

## Fuera de esta propuesta

DATA-004/005 requieren otra decisión sobre cierre de sesión, borrado parcial,
rehidratación y feedback tras desmontar Settings. No se agrupan con DATA-003:
mostrar un error de borrado no basta para definir la recuperación de los datos.
No hay sesión autenticada de producción disponible ni autorización implícita
para crear o borrar datos allí. La propuesta puede avanzar con servicios sintéticos.

## Siguiente puerta

[Spec 007](../../specs/007-guardado-fiable/spec.md): aprobar alcance y C-001/002/003.
Después preparar plan, tareas y análisis para aprobación separada. Ningún test
congelado, contrato anterior, runtime, SQL o dependencia se modifica ahora.
