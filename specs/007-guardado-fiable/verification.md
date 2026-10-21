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
