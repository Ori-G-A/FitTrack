# Decisiones técnicas — 007

Estado: decisiones aprobadas junto al plan el 2026-10-21; ejecución local autorizada.

| ID | Decisión | Motivo y alternativa descartada |
| --- | --- | --- |
| R-001 | Extender createSaveCoordinator con estado por usuario y fallos por clave | Ya separa persistencia y cola; un único error global no distingue recuperación. No crear otro coordinador paralelo |
| R-002 | Snapshot explícito getSaveStatus y segundo argumento opcional en onSaveStatus | Conserva los llamadores existentes y permite a App escuchar su usuario; no asumir usuario desde una variable global mutable |
| R-003 | Error tiene prioridad sobre saving hasta recuperación del mismo par | C-001 aprobado; iniciar un intento no prueba éxito. No borrar todo el ledger cuando pending llega a cero |
| R-004 | useSyncExternalStore con snapshots inmutables de identidad estable por usuario | React ya instalado cubre la carrera de suscripción y cambio de usuario; no mantener estado visual anterior mediante un effect tardío |
| R-005 | Una región de estado fuera del rail oculto, con estilos locales y regla para ft-focus | El rail desaparece en móvil y recorta contenido; texto en DOM no implica visibilidad. Evitar duplicar regiones vivas y conservar CSS heredado |
| R-006 | PIN-007-001 para data-sync en E1 y PIN-007-002 para role=status en E2 | No adelantar una expectativa de UI antes de implementarla; conservar firmas y evidencia por etapa |
| R-007 | Conservar contador de ejecuciones, debounce y semántica de promesas | La spec excluye rediseñar toda la cola y cachear/reintentar; no ampliar el alcance hacia durabilidad u offline |

La inspección encontró `test/data-sync.test.js` esperando pérdida del error y
`test-support/interface-cases.js` esperando que no haya role=status. Ambos se
reprobarán sin cambios sobre BASE antes de enmendar. No se presuponen otros pins
afectados; nuevos conflictos requieren un informe concreto antes de adaptar asserts.

## R-008 — verificadores históricos independientes

El primer E1 falló en cinco comprobaciones de hashes: body-architecture,
body-compatibility, nutrition-architecture, training-architecture y compatibility
de interface-cases. Todas comparan el pin data-sync contra baselines inmutables.
T025 conserva esas baselines y añade resolución estricta de la enmienda aprobada
antes de comparar hashes. Se archiva el contenido anterior de los adaptadores y
se les asigna trazabilidad de adaptación. Tres validadores de arquitectura no
forman parte de las 101 firmas; interface-cases añade PIN-007-003 antes de
PIN-007-002 y body-compatibility añade PIN-007-005. Se mantienen 98 pins intactos.
No se eliminan verificaciones
ni se aceptan hashes arbitrarios. Repetición completa de E1 obligatoria.

## R-009 — selector de Toast tras FR-009

El segundo checkpoint E2 pasó 324 Node, pero Chromium detectó dos regiones
status al mostrar Toast: la notificación y el indicador nuevo. El selector
global suponía una única región. T027/PIN-007-006 acota los tres selectores
a `.ft-toast` con role=status, conservando texto, temporizadores y ausencia final.
No cambia Toast ni se elimina el indicador accesible para satisfacer una prueba.
Se conservan el original y el fallo, con repetición completa de E2.
