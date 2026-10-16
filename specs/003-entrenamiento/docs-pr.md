# PR documental preparado — 003

Estado: contenido propuesto; no publicado ni aprobado como plan.
Título: Define el plan de entrenamiento con contratos originales y extracción incremental.

La coordinación de sesiones, timer y rutinas sigue mezclada con la presentación.
El alcance aprobado preserva once requisitos AS-IS y diez escenarios. Este PR
prepara fronteras técnicas, 24 tareas y nombres concretos de pins, con una puerta
que impide extraer antes de verificar el contrato completo sobre BASE.

Cinco entregas después de los pins: métricas, transformaciones, timer, pantalla
y cierre. Los dos relojes conservan su semántica. Los consumidores y exports
compatibles se mantienen; fórmulas, datos persistidos y SQL no cambian.

Validación documental ejecutada: enlaces, 21 IDs, matriz y 24 tareas sin ciclos; el
verificador existente confirmó 21 pending y rechazo del modo completo. Detalle en verification.md.
No hay nueva suite ejecutada ni resultado verde de 003. Los manifiestos usan
tests vacíos y plannedTests explícitos. Runtime/dependencias intactos.

Dependencia: PATCH 1.0.2 ya integrada en main c7d9e81. Base de revisión main;
rama codex/003-entrenamiento. Puertas: aprobar plan/tareas/revisión y completar
etapa documental antes de ejecutar, salvo autorización expresa de trabajo local.
Este cuerpo preparado no autoriza publicación, merge o despliegue.

Límites: TRAIN-001/002/003 se caracterizan y conservan; KD-002 sigue para el
proyecto. La revisión documental no reemplaza ejecución de pins ni revisión externa.
