# Verificación 007

## E0 / G-PIN — 2026-10-21

T001–T010 completadas con Node 24.21.0. Original: 314 Node, 27 Chromium y
build aprobados; cuatro AS-IS nuevos verdes y seis CHANGE rojos específicos.
[Baseline y firmas](evidence/baseline.json). 101 firmas anteriores intactas,
incluidas las dos enmiendas 006. Se congelan seis archivos nuevos de pruebas,
harness y configuración. SourceHash coincide con el cierre de 006; src intacto.

Los cuatro rojos Node fallan por FR-005/006/007/008, sin TypeError por API nueva.
Los dos de Chromium fallan por texto oculto y ausencia de región accesible.
La matriz 007 contiene siete IDs completos y catorce pending; no es contrato
completo ni se usa modo completo para fingir que los CHANGE están implementados.
Los contenidos originales de los dos pins que se enmendarán permanecen en
[archivo separado](evidence/original-pins.json). No hay publicación autorizada.

## E1 — 2026-10-21

T011–T014 y T025 completadas: 323 Node, 27 Chromium heredados compatibles,
build y tres CHANGE del coordinador verdes. Los tres CHANGE del indicador
siguen rojos por sus motivos esperados. Matriz 007: 16 completos y cinco pending.
[Checkpoint](evidence/e1.json). RLS fresco se exige en E3; 002 no se certifica
de nuevo en esta entrega parcial.

Los verificadores históricos necesitaban reconocer las enmiendas aprobadas.
T025 preserva las baselines y archiva sus originales; PIN-007-003/005 adaptan
los dos archivos congelados afectados y tres validadores no congelados conservan
sus guardas. PIN-007-001 cambia solo la expectativa de pérdida de error de 001.
98 de las 101 firmas siguen intactas; la verificación estricta rechaza firmas
falsas. [Fallos y repeticiones](evidence/e1-failures.json) conservados. E1 se
repitió completo después de corregir la integración de firmas; no se aceptó
una ejecución con adaptadores incompletos.

## E2 — 2026-10-21

325 Node, 29 Chromium y build aprobados, sin skips/retries, después de repetir
E2 completo con PIN-007-002/006 finales. Matriz 007: 21 completos, cero pending.
[Checkpoint](evidence/e2.json), [fallos previos](evidence/e2-failures.json).
La revisión añadió T026 con rojo específico sobre BASE y verde candidato, sin
modificar los seis archivos fijados en E0. 97 de 101 archivos anteriores intactos;
cuatro archivos con cinco enmiendas explícitas. La suite conserva las dos
enmiendas 006. RLS fresco y mutaciones ya ejecutados; cierre E3 requiere todavía
checkpoint final de los siete contratos y converge documental.
