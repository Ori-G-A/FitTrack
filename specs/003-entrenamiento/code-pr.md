# PR de código preparado — 003-entrenamiento

Estado: preparado localmente; no publicado. El cierre conjunto está bloqueado por T025 (Docker/RLS).
Título: Separa entrenamiento preservando sesiones, rutinas y métricas.

Train concentraba la presentación, las transformaciones de sesiones y los
cálculos de métricas y temporizador en FitTrack. Esta entrega separa métricas,
consejos, planificación, registros, rutinas, timer con puertos y TrainingScreen,
conservando los exports usados por App, pantallas y ambos previews.

Se fijó la baseline completa antes de extraer y se verificó cada entrega.
Resultado final observado para 001 y 003: 242 pruebas Node, 6 recorridos Chromium
y 21/21 contratos por spec; arquitectura con fixtures negativos y 22 hashes
congelados intactos. Build correcto con el aviso previo de bundle >500 kB.
El gate 002 se ejecutó: Node y Chromium pasaron, pero fue rechazado por
evidencia RLS incompleta. Docker falla al abrir su socket de inferencia. T025
exige recuperar el entorno, renovar RLS y repetir el gate antes de cerrar.

No hay cambios de dependencias, SQL, datos persistidos, fórmulas ni inferencia.
TRAIN-001/002/003 siguen caracterizados y preservados. KD-002 continúa activa
para las áreas restantes. La validación no ratifica recomendaciones clínicas.

Orden: revisar sobre main c7d9e81, verificar los dos jobs CI y obtener la
aprobación de integración/despliegue de esta entrega. No hay autorización
permanente de merge ni despliegue. Esta rama no se ha publicado.
Rollback: revertir los commits de extracción y cierre como código; no existe
migración ni transformación de datos que revertir.

Evidencia y límites: [verificación](verification.md),
[baseline](evidence/baseline.json), [tareas](tasks.md), [revisión](analyze.md).
