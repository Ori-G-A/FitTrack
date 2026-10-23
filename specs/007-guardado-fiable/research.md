# Decisiones técnicas propuestas — 007

Estado: pendientes de aprobación del plan; alcance ya aprobado.

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
