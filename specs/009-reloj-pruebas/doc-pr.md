# PR documental 009 — preparado localmente

Estado vigente — 2026-10-27 (Bogotá): 009 integrada mediante #20/#21,
con CI de main y Vercel Production verificados en `392e797`.
[Entrega remota](evidence/integration.json). Los apartados siguientes conservan
la cronología de preparación local y sus autorizaciones ya cumplidas.


Rama codex/009-reloj-pruebas-docs; snapshot 5658328.
Título: `docs(sdd): aprobar preparación determinista del reloj (009)`.

## Cuerpo para el PR

La preparación del reloj puede pedir una pausa en el pasado si el host se demora entre install y pauseAt. 009 especifica el cambio de tres montajes conservando fechas, tiempos y oráculos. Alcance y aclaraciones aprobados en ed35fb2; plan de 26 tareas y precisión SC-001 aprobados en 5658328, con ejecución local E0–E2 autorizada.

Este snapshot conserva dieciséis IDs pending y la planificación aprobada. Incluye investigación de API en página vacía, separada de G-PIN. No cambia producto, fixtures, SQL ni dependencias. El código y la evidencia posterior están en la rama de implementación; integrar primero este documental y después el código con CI verde, cuando exista autorización remota.
