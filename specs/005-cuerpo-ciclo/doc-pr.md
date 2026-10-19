# PR documental preparado — 005

Estado: alcance/clarificaciones/plan/tareas/analyze aprobados; publicación pendiente.
Revisión aprobada anterior a implementación: e949c08. Base: main (02ab519).
Rama documental local: codex/005-cuerpo-ciclo-docs desde e949c08.

Título: Definir contratos y plan de cuerpo y ciclo 005

Cuerpo, inferencias y métricas comparten cálculos y efectos entre pantallas.
El contrato aprobado fija 20 requisitos AS-IS y 20 escenarios para preservar
registros, incertidumbre y resultados al separar responsabilidades. El plan
aprobado incluye baseline previa y entregas pequeñas; no autoriza cambios clínicos.

Ese snapshot es documental: src, SQL, dependencias, tests y CI coinciden con
main. El manifiesto permanece pending en esa revisión, como corresponde antes
de ejecutar pins; los resultados posteriores están en el [PR de código](code-pr.md).
La ejecución local antes de integrar documentación fue autorizada por el dueño.

Orden: publicar/integrar este PR primero y luego el de código. La rama principal
de trabajo contiene ambas etapas; el snapshot e949c08 permite separarlas sin
reescribir commits. El propietario autoriza publicación/fusión y Vercel asociado.
No se declara ningún PR remoto creado ni CI remoto aprobado para005.
