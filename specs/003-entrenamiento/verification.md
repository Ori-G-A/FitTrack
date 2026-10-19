# Verificación — 003

Estado actual, 2026-10-18: integrado mediante [PR #9](https://github.com/Ori-G-A/FitTrack/pull/9)
en main 2a70042. CI del PR y de main aprobados; Vercel Production confirmado.
La verificación local E0–E5 conserva su [resumen](evidence/final.json).
La URL individual exige login de Vercel; no hay prueba funcional con datos de
producción. Las secciones fechadas conservan el historial de evidencia.

Fecha: 2026-10-16. Alcance aprobado en d22d608. Plan/tareas aún propuestos.

Comprobaciones ejecutadas con Node mediante los módulos existentes
scripts/sdd-contract.js y scripts/sdd-trace.js, más assert estricto y lectura
de los documentos. No se ejecutó suite runtime por esta entrega documental.

- selectSpec con --spec=003-entrenamiento devuelve la spec correcta.
- contractIds descubre 21 IDs únicos: once FR y diez escenarios.
- verifyTrace con manifiesto inicial y resultados vacíos: 21 pending,
  cero errores en modo parcial; cero complete.
- verifyTrace en modo completo devuelve 21 errores de cobertura incompleta.
  Es el rechazo esperado, no un gate de implementación aprobado.
- 24 tareas con IDs únicos, referencias de dependencia existentes y grafo acíclico.
- Cada fila del manifiesto tiene tareas y nombres de prueba previstos; tests vacío.
- 21 filas de matriz documental con tarea asignada; enlaces locales válidos.
- git diff --check correcto.
- Ningún archivo src, test, scripts, SQL, package.json o lockfile modificado.

Falta ejecutar E0 y todo el plan tras aprobación. No hay conteos de pruebas
nuevas, baseline de pins ni CI remoto de 003 declarado. El cuerpo de PR documental
está preparado; no se publicó ni se fusionó esta rama.


## E0 — 2026-10-17

Plan y ejecución local aprobados en 11e1fb1. G-PIN verde sobre src c7d9e81:
239/239 pruebas Node (179 de nivel superior), 6/6 Chromium, build correcto
con aviso existente de bundle >500 kB; 21/21 contratos completos.
Once pins nuevos congelados y once anteriores verificados, normalizando CRLF
a LF y contrastando los anteriores también con sus blobs Git.
Evidencia: [baseline](evidence/baseline.json), [manifiesto](traceability.json).

Se corrigieron dos defectos del harness: selector RUTINAS y sincronización
React act con MessageChannel de tareas reales en JSDOM. Se repitió la suite
completa y el gate después de corregirlos; ninguna aserción BASE se relajó.
Las tres mutaciones son detectadas y los negativos de trazabilidad pasan.
TRAIN-001 reproducido; TRAIN-002/003 preservados. Sin modificaciones de src,
SQL ni dependencias. E1–E5 pendientes; no hay PR/CI/merge remoto de 003.


## E1 — 2026-10-17

Extraídos training-metrics, training-advice, training-plan y fechas puras.
FitTrack utiliza selectores de antecedentes/resumen; app-utils conserva APIs.
Un primer checkpoint detectó addDays sin importar; se corrigió el import y se
repitieron suite, Chromium y build completos. Resultado: 239/239 Node, 6/6
Chromium, 21/21 contratos, build correcto; 22 hashes de pins intactos.
Evidencia: [e1.json](evidence/e1.json). T015 completada; E2 pendiente.


## E2 — 2026-10-17

Extraídas transformaciones records/routines e integradas en Train, Biblioteca,
Plan y sesión guiada. Generadores inyectados; creación de ejercicios fuera del
updater y creación de sesión/rutina dentro del updater conservadas. Ajustes
masivos se reexportan por app-utils. Se corrigió sintaxis de asignación y se
descartó una ejecución que coincidió con edición; checkpoint completo repetido
sobre árbol estable: 239/239 Node, 6/6 Chromium, 21/21 contratos y build correcto.
22 hashes intactos. Evidencia: [e2.json](evidence/e2.json). T016 completada.


## E3 — 2026-10-17

Extraído use-training-timer con puertos de persistencia, reloj, intervalos y
logger compuestos en pantalla. Dependencias de efectos [userId]/[tRun], cierres
capturados y carrera TRAIN-001 conservados; commitT mantiene la suma redondeada
en la pantalla. Sesión guiada sigue contando ticks. Checkpoint completo: 239/239
Node, 6/6 Chromium, 21/21 contratos, build correcto y 22 hashes intactos.
Evidencia: [e3.json](evidence/e3.json). T017 completada.


## E4 — 2026-10-17

Train movido a TrainingScreen con la misma firma y lazy SessionScreen; FitTrack
conserva export Train, MUSCLES, EXERCISE_PRESETS y uid. Constantes en training-config
y expresión UID original en id-utils. Helpers fmtDate/clock movidos tras revisar
llamadores. DateBar/dayNameOf/exLine sin usos observados quedan fuera de limpieza.
SessionScreen importa métricas/consejo puros directamente. La única adaptación
de prueba heredada es la ruta de lectura del primer test textual de duración;
conserva todas sus aserciones. Pins congelados intactos.
Checkpoint: 239/239 Node, 6/6 Chromium, 21/21 contratos y build correcto.
Evidencia: [e4.json](evidence/e4.json). T018/T019 completadas.


## E5 — verificación final en curso, 2026-10-17

Arquitectura y negativos: 3/3. Gates completos finales 001 y 003: 242/242 Node
(182 tests de nivel superior), 6/6 Chromium, 21/21 IDs en cada spec; sin omitidos
ni reintentos. Los 22 pins congelados siguen intactos. Build de E4 válido sobre
el mismo código productivo; E5 solo añade pruebas, CI y documentación.

CI conserva 001/002/RLS y añade gate completo 003 con artefactos. Esta es
configuración local revisada, no un resultado remoto observado.

La regeneración RLS falló antes de iniciar el fixture porque Docker estaba
apagado. El arranque de Docker reveló un socket dockerInference inaccesible;
la recuperación local quedó bloqueada por acceso al socket. Evidencia anterior invalidada por el
runner, sin restaurarla ni presentar su resultado como vigente. T022–T024 aún
no se consideran cerradas.


## Resultado del cierre local — 2026-10-17

Gates 001 y 003 verdes; gate 002 ejecutado y rechazado por «Evidencia RLS
incompleta o entorno no coincidente». Su suite previa al rechazo pasó 242/242
Node y 6/6 Chromium. El runner RLS invalidó la evidencia anterior; no se reutiliza.
Build final E5 correcto. Resumen: [e5.json](evidence/e5.json).

Docker Desktop falló antes de arrancar Linux al abrir su socket vacío de
inferencia con error de acceso. Se intentó reinicio normal y apartarlo de forma
reversible mediante Rename-Item y File.Move; ambos renombrados fallaron y no se
creó backup. Se cerró la instancia fallida. No se cambiaron permisos, configuración,
imágenes ni volúmenes. T025 registra recuperar el entorno y repetir RLS/002.

Converge revisó contrato, límites, snapshots, IDs, consumidores, hashes, CI y
exclusiones. No se detectó un gap de implementación adicional; G-CLOSE sigue
bloqueada por T025. TRAIN-001/002/003 y KD-002 permanecen abiertos.
[PR preparado](code-pr.md), sin publicación, CI remoto, merge ni despliegue de 003.

Comprobación documental final: 56 enlaces locales existentes, 25 tareas únicas
y grafo acíclico; git diff --check correcto. Archivos SQL, package.json y
lockfile sin diferencias respecto a BASE. No se añadieron placeholders.


## Verificación local completa — 2026-10-17

El motor Docker volvió a responder al retomar el trabajo. Se repitió
pnpm test:rls sobre un fixture nuevo: 3 contratos reales aprobados y cleanup
confirmado. La consulta filtrada de contenedores no encontró restos del fixture.
No hubo cambios adicionales de configuración, permisos ni archivos de Docker.
Evidencia sanitizada: [rls-local.json](evidence/rls-local.json).

Después se repitió íntegramente pnpm run test:sdd:complete
--spec=002-identidad-fotos: 242/242 Node, 6/6 Chromium, 3/3 RLS; 23/23 IDs.
Se contrastaron los reportes 001/002/003 con git ls-files src y sus bytes
actuales: mismo hash en los tres, todos los resultados aprobados, sin
omitidos ni reintentos. 001 y 003 conservan 21/21 IDs cada una.
Build final correcto y 22 hashes congelados intactos.

Converge: requisitos, historias, escenarios, límites de capas, consumidores,
snapshots/updaters, IDs, datos persistidos, fórmulas y exclusiones revisados.
T025 resuelta; T022/T023/T024 completadas en su alcance local. Ningún gap de
implementación abierto. TRAIN-001/002/003 y KD-002 se conservan como se aprobó.
Evidencia de cierre: [final.json](evidence/final.json), sin sobrescribir baseline
ni el checkpoint E5 anterior que documenta el fallo.

Entrega preparada para revisión del propietario: [cuerpo de PR](code-pr.md).
No hay PR publicado ni CI remoto observado para 003; no se ejecutó merge ni
despliegue. El resultado no cierra M4 integrado ni la adopción global de SDD.

Comprobación documental de cierre: 72 enlaces locales existentes, 25 tareas
únicas completadas y grafo acíclico; evidencia RLS archivada sin credenciales.


## Integración observada — 2026-10-18

PR #9 fusionado con head 28bd509 tras CI 39090760297 exitoso. Commit de main
2a7004277bd75d87fdf9746c90853b4c34eac044, CI de main 39090941895 exitoso,
ambos jobs aprobados. Vercel Production, deployment 7148987435, estado success
para el mismo commit. [Registro remoto](https://github.com/Ori-G-A/FitTrack/pull/9).
La autorización incluye esta fusión/despliegue, no nuevas áreas. Los checkpoints
locales archivados no se reescriben como resultados remotos.
