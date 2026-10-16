# Constitución de FitTrack

Versión: 1.0.1. Ratificación inicial y corrección editorial autorizada: 2026-10-14.
Estado: APROBADA mediante «aprobado. Crea las carpetas» en esta conversación.
La ratificación no convierte las specs futuras ni los cambios de dominio
pendientes en decisiones aprobadas.

## Naturaleza y evidencia

FitTrack es una aplicación web React 18/Vite 6 con Supabase como backend
de autenticación, datos y fotos (`package.json:15`, `src/supabase.js:1`).
El README describe Vercel como destino de despliegue; el estado real y la
conexión automática de este checkout no se han verificado. No se presupone
que sea una copia aislada de desarrollo. Desplegar queda fuera del trabajo SDD.
Solo se ha identificado un backend de datos; no se exige paridad entre motores
inexistentes. Las fórmulas actuales se documentan como software observado,
sin ratificar su validez clínica.

## Principios

### P1. La especificación es el contrato — no negociable

Cada área DEBE tener requisitos EARS con IDs estables y etiquetas `[AS-IS]`
o `[CHANGE]`, resultados de usuario, escenarios, exclusiones y trazabilidad.
Una modificación de comportamiento DEBE ser un `[CHANGE]` aprobado. La suite
actual pasa, pero todavía no demuestra cobertura de un contrato completo
(`test/ui-regressions.test.js:5`). Esa brecha motiva este principio.

### P2. Datos íntegros y efectos controlados — no negociable

La refactorización DEBE preservar datos, orden de operaciones y aislamiento
por usuario. Cada efecto lógico DEBE aplicarse una sola vez según el contrato;
reintentos DEBEN tener semántica explícita. No se DEBE presentar como atómica
una operación que atraviesa sistemas sin transacción. La cola por usuario/clave
y el borrado coordinado motivan esta regla (`src/data-sync.js:40`,
`src/FitTrack.jsx:783`). Cambiar estas garantías requiere decisión del dueño.

### P3. Caracterizar antes de transformar — no negociable

Las pruebas `[AS-IS]` del área tocada DEBEN pasar sobre el código original antes
de refactorizar. Las pruebas `[CHANGE]` DEBEN fallar por la razón esperada antes
de implementar y pasar después. Cambiar una aserción fijada exige citar el FR.
Las pruebas de texto fuente existentes no bastan para probar interacciones
(`test/ui-regressions.test.js:3`).

### P4. Separación de responsabilidades

El código nuevo DEBE separar cálculos de dominio, coordinación de casos de uso,
acceso a servicios y presentación. Los cálculos puros no DEBEN importar React,
DOM ni Supabase. Los límites exactos y sus pruebas se deciden en cada plan.
La mezcla actual de estado, importación y acceso directo al backend en
`src/FitTrack.jsx:614`, `783`, `814` motiva esta separación incremental.

### P5. Seguridad y privacidad — no negociable

Las operaciones DEBEN estar delimitadas al usuario autenticado. No se DEBEN
versionar secretos ni usar claves privilegiadas en el cliente. Fotos privadas
y diagnósticos sanitizados DEBEN conservar su protección. Evidencia actual:
`src/data-operations.js:5`, `src/photo-operations.js:9`,
`src/error-reporting.js:27`, `test/supabase-contracts.test.js:88`.
Una inspección del SQL no demuestra aplicación efectiva de RLS en un servidor.

### P6. Evidencia y simplicidad

Se DEBEN reportar comandos, resultados, omisiones y límites reales. Optimizar
exige baseline y objetivo medido. Cada tarea DEBE trazar a una historia y esta
a un resultado de usuario. No se DEBE imponer una abstracción sin necesidad
documentada. El build y las pruebas están declarados en CI, pero no la
trazabilidad ni los límites de arquitectura (`.github/workflows/ci.yml:24`).

## Invariantes de dominio y propietarios futuros

Hasta aprobar sus specs, el código citado es evidencia provisional; esta
constitución no cambia parámetros. Cada spec futura será el único dueño normativo
de sus fórmulas y umbrales. Cambiarlos exige `[CHANGE]` y pruebas de fronteras.

| Invariante a preservar | Spec propietaria propuesta | Evidencia |
| --- | --- | --- |
| Identidad de usuario y clave delimita lecturas/escrituras | 001-datos | `src/data-operations.js:5` |
| Fotos persistidas excluyen URL firmada transitoria | 002-identidad-fotos | `src/photo-storage.js:47` |
| Registros diarios usan fecha de calendario local | 003-entrenamiento | `src/app-utils.js:1` |
| Estimación de fuerza conserva fórmula y casos límite | 003-entrenamiento | `src/app-utils.js:187` |
| Objetivos y avisos conservan fórmulas, límites y decisión registrada | 004-nutricion-objetivos | `src/settings-utils.js:19`, `src/app-config.js:21` |
| Inferencias de ciclo conservan nivel de incertidumbre | 005-cuerpo-ciclo | `src/cycle-inference.js:305` |

## Validación, errores y cambios de datos

Se DEBE validar en fronteras de confianza: configuración al iniciar, datos
importados y respuestas externas. Los errores obligatorios DEBEN propagarse
hasta un estado observable; no se DEBEN tragar silenciosamente. Solo servicios
opcionales pueden degradar, dejando diagnóstico local sanitizado sin recursión.
Los timeouts no se DEBEN equiparar a cancelación remota (`src/async-utils.js:10`).
No se promete rollback entre Storage y app_data: ante fallo parcial la spec
DEBE decidir y probar el resultado. Las migraciones nuevas DEBEN ser aditivas,
idempotentes y ensayadas dos veces sobre una copia local restaurada. Una
reconciliación DEBE separar planificación pura y aplicación idempotente.
No se DEBE inferir certeza histórica desde cero, valores por defecto o ausencia;
los desconocidos permanecen explícitos y las estimaciones conservan procedencia.

## Reglas del agente y flujo

El alcance es el objetivo autorizado y sus dependencias necesarias. Hallazgos
ajenos van al registro del roadmap. No se permiten push a main, despliegues ni
operaciones Git destructivas. El propietario decide producto, dominio,
semántica de datos, aceptación de desviaciones y fusiones.

Cada área DEBE recorrer survey → spec → clarify → checklist → plan → tasks →
analyze → PR documental → implementación → converge → PR de código.
El propietario aprueba cada etapa; las decisiones se registran con fecha.
Las aclaraciones pendientes DEBEN marcarse `[NEEDS CLARIFICATION]` y no bloquear
trabajo independiente. Las elecciones técnicas no obvias van en `research.md`.
Cada spec usa su rama; cada etapa aprobada, un commit lógico. El propietario
abre y fusiona PRs; el agente prepara título, cuerpo y evidencia.
Converge solo añade tareas; nunca reescribe el historial de tareas completadas.
Ningún FR o escenario puede quedar `PENDING` al presentar el PR de código.
La reejecución del checkpoint completo que falló es obligatoria tras corregirlo.

## Desviaciones conocidas aceptadas en la ratificación

Aceptadas el 2026-10-14 junto con la constitución y sus hitos límite.
No deben extenderse a código nuevo. Su cierre requiere evidencia y enmienda PATCH.

| ID | Desviación y evidencia | Principio | Spec correctora | Límite |
| --- | --- | --- | --- | --- |
| KD-001 | Coordinación de datos y backend en componente (`src/FitTrack.jsx:783`) | P4 | 001-datos | M2 |
| KD-002 | Sin trazabilidad FR → pruebas; parte de UI es inspección textual (`test/ui-regressions.test.js:3`) | P1, P3 | 006-interfaz y cada área al tocarse | M7 |
| KD-003 | RLS comprobada mediante texto SQL (`test/supabase-contracts.test.js:88`) | P5, P6 | 002-identidad-fotos | M3 |
| KD-004 | Fallos de reporting silenciados (`src/error-reporting.js:40`) | Validación y errores | 002-identidad-fotos | M3 |
| KD-005 | Configuración pasada directamente a createClient (`src/supabase.js:3`) sin validación explícita propia | Validación y errores | 002-identidad-fotos | M3 |

## Cumplimiento y automatización

Declarado en CI hoy: pruebas Node y build Vite; no se ha observado una ejecución
remota de esta revisión. Lo aprobado localmente figura en el survey.

Por revisión hasta automatizar: trazabilidad (AUTO-001), límites de capas
(AUTO-002), RLS ejecutada y guardas locales (AUTO-003), comportamiento de UI
(AUTO-004), ausencia de jobs omitidos y versiones del entorno (AUTO-005).
Las tareas se gestionan en el roadmap. Cobertura y trazabilidad son
complementarias; también se revisa que las aserciones prueben el requisito entero.

## Gobernanza

Precedencia: constitución → spec del área → AGENTS.md → arquitectura →
puntero local. Cada hecho normativo tiene un único propietario; otros documentos
enlazan sin duplicar el detalle. El acuerdo externo informa la adopción;
no se copia como segunda constitución.

Los principios no negociables solo cambian mediante enmienda. Otras excepciones
requieren aprobación explícita en PR, entrada KD y fecha límite por hito;
una excepción vencida o no aprobada es un defecto. Las enmiendas usan rama y PR
propios, con informe de impacto de sincronización. MAJOR redefine o elimina
principios; MINOR los añade o amplía; PATCH aclara hechos o retira desviaciones
resueltas. Al cierre de cada hito se revisa constitución y registro KD.

Idioma aprobado: español para documentación y comentarios nuevos/modificados;
se conservan identificadores y no se hace traducción masiva. D-001 resuelta.

## Informe de impacto de sincronización

- Versión anterior ratificada: 1.0.0. Esta PATCH corrige estados editoriales
  contradictorios, sin añadir ni redefinir principios.
- Plantillas locales: spec y tareas creadas con requisitos de esta propuesta.
- Guía y roadmap: creados y enlazados; sin cambios de runtime ni de CI.
- Ratificación registrada el 2026-10-14, incluidas las desviaciones KD y sus hitos.
- Autorización de corrección: «aplica tus sugerencias y revisa el estado actual
  de lo aprobado», después de señalar las contradicciones sobre KD e idioma.
- Informe detallado: `docs/sdd/amendment-1.0.1.md`.
