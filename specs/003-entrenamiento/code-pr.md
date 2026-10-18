# PR de código preparado — 003-entrenamiento

Estado: verificación local completa; publicación e integración autorizadas.
El propietario también autorizó el despliegue automático asociado. CI remoto
y ejecución de la fusión pendientes; ver docs/sdd/approvals.md.
Título: Separa entrenamiento preservando sesiones, rutinas y métricas.

Train concentraba presentación, transformaciones de sesiones y cálculos de
métricas y temporizador en FitTrack. Esta entrega separa métricas, consejos,
planificación, registros, rutinas, timer con puertos y TrainingScreen,
conservando los exports usados por App, pantallas y ambos previews.

La baseline completa se fijó antes de extraer y cada entrega pasó su checkpoint.
Verificación final: 242 pruebas Node, 6 recorridos Chromium, 3 contratos RLS
reales con cleanup y build correcto. Gates completos: 001 21/21, 002 23/23,
003 21/21; los tres reportes corresponden al mismo hash de src. Arquitectura
con fixtures negativos y 22 hashes congelados intactos. El build conserva
el aviso previo de bundle >500 kB. CI incorpora el gate 003 y conserva 001/002/RLS.

No cambian dependencias, SQL, datos persistidos, fórmulas ni inferencia.
TRAIN-001/002/003 siguen caracterizados y preservados; KD-002 continúa activa
para las áreas restantes. La validación no ratifica recomendaciones clínicas.
El bloqueo temporal de Docker se resolvió al volver a responder el motor; se
renovó la evidencia RLS y se repitió el gate completo, sin excepciones.

Orden de integración: revisar sobre main c7d9e81; publicar la rama y el PR
por decisión del propietario; verificar ambos jobs CI; autorizar explícitamente
la fusión y el despliegue automático asociado. No hay permiso permanente.
Rollback: revertir los commits de extracción/cierre como código; no existe
migración ni transformación de datos que revertir.

Evidencia: [resumen final](evidence/final.json), [RLS local](evidence/rls-local.json),
[verificación](verification.md), [baseline](evidence/baseline.json),
[tareas](tasks.md), [revisión](analyze.md).
