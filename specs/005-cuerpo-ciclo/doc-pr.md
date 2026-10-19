# PR documental preparado — 005

Estado: borrador local; plan pendiente de aprobación. No publicado.
Rama: codex/005-cuerpo-ciclo. Base: main (02ab519).

Título propuesto: Definir contratos y plan de refactorización de cuerpo y ciclo 005

## Problema y resultado

Cuerpo, inferencias y métricas comparten cálculos y efectos entre pantallas.
La propuesta documenta 20 requisitos AS-IS y 20 escenarios para preservar
registros, incertidumbre y resultados al separar responsabilidades. Alcance y
C-001/002/003 aprobados; plan, 33 tareas y revisión preparados para aprobación.
No modifica src, SQL, dependencias, tests ni CI.

## Validación y límites

Revisión de fuente y consumidores; matriz/manifiesto con 40 IDs pending y
pruebas previstas, dependencias acíclicas y enlaces locales comprobados.
No se ejecutaron suite/build/Chromium/RLS nuevos en esta preparación documental.
[Verificación](verification.md). Los resultados de 004 son evidencia histórica,
no una baseline de 005. No hay validación clínica ni correcciones BODY implícitas.

## Orden de integración

004 ya integrada en main. Este PR documental va antes del PR de código 005.
El propietario abre y fusiona; cualquier ejecución local antes del merge requiere
autorización expresa, y publicar/fusionar/desplegar código requerirá su decisión.
Rollback documental revierte estos documentos, sin cambios de datos.
