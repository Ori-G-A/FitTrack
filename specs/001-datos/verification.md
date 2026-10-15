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
| E3 / T018–T019 | Pendiente | Copias y reejecución |
| E4 / T020–T021 | Pendiente | Borrado y reejecución |
| T022–T024 / converge | Pendiente | Gate final, build y cierre de gaps |

CI remoto no observado. No hay despliegues ni pruebas contra datos reales.
