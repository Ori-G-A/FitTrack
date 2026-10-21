# Constitución de FitTrack

Versión: 1.0.3. Ratificación inicial: 2026-10-14. PATCH ratificada: 2026-10-20.
Estado: APROBADA; PATCH ratificada mediante «Ratificar PATCH y autorizar
publicación, integración con CI verde y Vercel», en respuesta a la propuesta
de retirar KD-002 y cerrar M7. La integración documental exige CI remoto verde.
La ratificación no convierte las specs futuras ni los cambios de dominio
pendientes en decisiones aprobadas.

## Naturaleza y evidencia

FitTrack es una aplicación web React 18/Vite 6 con Supabase como backend
de autenticación, datos y fotos (`package.json:15`, `src/supabase.js:1`).
Vercel despliega automáticamente desde main. El propietario autorizó las
fusiones de #2–#7 y su despliegue de `9a10a54`, confirmado por Vercel, y después
informó que la aplicación funciona bien. La integración documental del PR #8
también fue autorizada mediante «adelante». Los PRs #13/#14 de 006 se integraron
con autorización específica de publicación, fusión con CI verde y Vercel;
Production se confirmó para `492be5d`. Estas decisiones puntuales no
conceden autorización permanente para futuros despliegues.
Solo se ha identificado un backend de datos; no se exige paridad entre motores
inexistentes. Las fórmulas actuales se documentan como software observado,
sin ratificar su validez clínica.

## Principios

### P1. La especificación es el contrato — no negociable

Cada área DEBE tener requisitos EARS con IDs estables y etiquetas `[AS-IS]`
o `[CHANGE]`, resultados de usuario, escenarios, exclusiones y trazabilidad.
Una modificación de comportamiento DEBE ser un `[CHANGE]` aprobado. La brecha
inicial de cobertura contractual motiva este principio. 001–006 cuentan con
184 IDs completos verificados en sus seis contratos aprobados. Las funciones
futuras requieren su propia especificación y evidencia.

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
La mezcla inicial de estado, importación y acceso directo al backend en
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
documentada. CI verifica build, pruebas, trazabilidad y límites de arquitectura
para 001–006; las áreas futuras deben extender esa evidencia.

## Invariantes de dominio y propietarios

Las specs aprobadas son dueñas normativas de sus fórmulas y umbrales; esta
constitución no cambia parámetros. Las citas de código conservan su contexto
histórico de adopción. Cambiar fórmulas o umbrales exige `[CHANGE]` y pruebas
de fronteras. Las áreas futuras deben establecer su propietario normativo.

| Invariante a preservar | Spec propietaria | Evidencia |
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

No quedan desviaciones ratificadas activas en el alcance de 001–006 tras
ratificar la PATCH 1.0.3. Esto no elimina hallazgos preservados ni concede
excepciones para cambios futuros.

KD-001/003/004/005 retiradas mediante PATCH 1.0.2 tras revisar implementación,
pins y CI integrado. Evidencia y límites en el
[informe de enmienda](../../docs/sdd/amendment-1.0.2.md).
KD-002 retirada mediante PATCH 1.0.3: seis contratos completos,
mapa individual de 21 regresiones textuales y evidencia funcional por cláusula.
Los tests de texto se conservan como complemento. El
[informe 1.0.3](../../docs/sdd/amendment-1.0.3.md) conserva evidencia y límites;
la retirada fue ratificada expresamente el 2026-10-20.

## Cumplimiento y automatización

CI de main observado en `492be5d`: test-and-build y rls-and-sdd-002 aprobados,
incluidos los seis contratos completos (184 IDs), límites de capas, Chromium,
mutaciones y RLS sobre Supabase local desechable con guardas y limpieza.
[Evidencia integrada](../../specs/006-interfaz/evidence/integration.json).
No prueba RLS en el backend productivo, una sesión autenticada en producción
ni todos los escenarios de funciones futuras.

AUTO-001–005 tienen evidencia para 001–006; su extensión a cambios futuros
y los hallazgos pendientes se gestionan en el roadmap. Cobertura y trazabilidad son
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

- Versión anterior ratificada: 1.0.2. Esta PATCH actualiza hechos
  de 001–006 y retira KD-002; conserva los principios.
- Ratificación: «Ratificar PATCH y autorizar publicación, integración con CI
  verde y Vercel», 2026-10-20. M7 cumple la puerta normativa; esta entrega
  documental queda pendiente de integración con CI verde.
- Roadmap, aprobaciones, revisión KD-002 y guía de continuidad enlazan el cierre.
- Plantillas y AGENTS: sin cambios de reglas; runtime, SQL, tests y dependencias intactos.
- Informe vigente: [1.0.3](../../docs/sdd/amendment-1.0.3.md).
- Informes históricos: [1.0.2](../../docs/sdd/amendment-1.0.2.md) y
  [1.0.1](../../docs/sdd/amendment-1.0.1.md).
