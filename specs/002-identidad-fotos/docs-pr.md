# PR documental propuesto — 002

Estado: cuerpo de PR para revisión; alcance aprobado, plan/tasks pendientes;
no publicado. Dependencia:
`codex/001-datos-code`, cuyo cierre local está en 7060952. Apertura/fusión por
propietario; no se afirma integración remota de las ramas anteriores.

## Título propuesto

docs(sdd): especifica identidad y fotos con evidencia previa y decisiones explícitas

## Cuerpo propuesto

La siguiente área separa los contratos observados de identidad/fotos de dos
cambios aprobados: validar configuración antes de crear el cliente y registrar
diagnóstico local sanitizado cuando falle el reporting opcional. El survey
identifica llamadores, límites de archivos, firmas, fallos parciales y políticas
existentes; la spec propone 13 requisitos y diez escenarios, con plan y tareas.

Se adjuntan pruebas preparatorias que ejecutan módulos y DOM de la aplicación
con cliente, reloj y E/S simulados. La trazabilidad ahora admite elegir una spec
mediante --spec=002-identidad-fotos sin cambiar el default de 001 ni sobrescribir
sus informes. No se modifica src, configuración de producción, dependencias,
SQL ni datos reales.

Una guarda pura preparatoria rechaza conexiones propuestas fuera de loopback
literal y configuraciones no marcadas como desechables. Tres pruebas negativas/
positivas pasan sin abrir conexiones; su integración con el futuro runner y
la ejecución de políticas permanecen pendientes.

Validación local: 210/210 Node, 3/3 Chromium, build Vite correcto. Dieciocho IDs
de 002 tienen evidencia; cinco permanecen pendientes por RLS/CHANGE propuestos.
Los 21 IDs de 001 siguen completos y sus seis pins conservan hash original.
El aviso conocido de chunk index 508,72 kB persiste. Enlaces locales y diff
comprobados; no se observó CI remoto.

El propietario aprobó alcance y ambos CHANGE el 2026-10-15. C2 queda resuelto;
antes de implementar falta aprobar plan/tasks y revisión cruzada mediante las
puertas SDD. Docker CLI existe pero su motor no
está disponible: RLS no se ha ejecutado. KD-003/004/005 permanecen abiertos.
No presentar este cuerpo como PR de código ni como aprobación del plan técnico.

## Autorización de ejecución local — 2026-10-15

El propietario aprobó plan, tareas y revisión mediante «Aprobar plan, tareas y
revisión; continuar implementación local». Se autoriza ejecutar E1–E3 localmente
y conservar RLS real como requisito de cierre. Los estados de propuesta anteriores
son históricos; no hay integración remota ni cierre RLS declarado.
