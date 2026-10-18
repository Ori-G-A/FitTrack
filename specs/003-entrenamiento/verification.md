# Verificación documental — 003

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
