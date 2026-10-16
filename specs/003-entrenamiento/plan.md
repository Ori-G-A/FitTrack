<!-- Aprobado el 2026-10-16 mediante «adelante»: plan, tareas, revisión y ejecución local de pins/extracciones antes de integración remota. Los estados de propuesta que siguen conservan el contenido presentado. -->
# Plan técnico — 003-entrenamiento

Estado: PROPUESTO para aprobación conjunta con tareas y analyze. Alcance aprobado
el 2026-10-16. [Spec](spec.md), [research](research.md), [validación](validation-plan.md).
BASE productiva: c7d9e814de992b376005d82ee042f1304da6e46f. Los commits documentales
posteriores no cambian src. No hay CHANGE aprobado.

## Puertas y entregas

G-DOC: aprobar plan/tareas/analyze; preparar PR documental y respetar su puerta
de integración. Si el propietario autoriza ejecución local antes del merge,
registrar expresamente esa autorización. El plan por sí solo no declara el merge.

E0: harness y pins completos sobre producción original, manifiesto de 21 IDs,
baseline con revisión, hashes de src/pins, versiones y resultados. G-PIN exige
todos los AS-IS verdes antes de cualquier extracción. La prueba debe invocar
código original por UI/exports; nunca copiar el algoritmo al harness.

E1: cálculos puros de entrenamiento y fechas necesarias; reexports compatibles.
E2: transformaciones de sesiones y rutinas, incluidas operaciones Biblioteca/Plan.
E3: hook/coordinación del timer con puertos explícitos, manteniendo efectos,
cierres capturados, dependencias y comportamiento asíncrono original.
E4: extraer Train a TrainingScreen y constantes necesarias; preservar fachada
Train y consumidores. SessionScreen sigue como presentación con su temporizador
por ticks; no unificarlo con el timer persistido.
E5: cierre de trazabilidad, CI, arquitectura, converge y PR de código.

Cada entrega lleva commit propio, pins de su grupo, suite y build. Revertir una
extracción revierte código, no datos. G-CLOSE exige 21/21 IDs, cero omisiones,
tres recorridos nuevos de entrenamiento y regresiones de 001/002. El gate RLS
002 sigue ejecutándose en entorno local desechable o CI; no se sustituye por SQL.

## Fronteras previstas

| Módulo | Responsabilidad y dependencias |
| --- | --- |
| training-metrics.js | canonExercise, matchedLoadRpeTrend, epley, loadProgressHighlight y selectores de última carga/volumen/RPE; solo módulos puros |
| training-plan.js | WEEK_ORDER, mondayOf, planWeek, planCompliance, weekNumber y asignación; solo fechas y datos |
| training-records.js | transformaciones de sesiones, series, cardio y aplicación de ajustes; IDs recibidos por parámetro; sin React/DOM/E/S |
| training-routines.js | guardar sesión como rutina, actualización de colección y selección mínima; recibe plantillas y generador de IDs donde proceda |
| training-advice.js | RPE_STEPS, parseRpeTarget y nextSetAdvice; texto/fórmulas exactos, sin React |
| use-training-timer.js | hook con load/save/now/intervalos/logger inyectables; composición de puertos en pantalla, sin cliente Supabase directo |
| training-config.js | MUSCLES, MUSCLE_COLOR, CARDIO_TYPES y EXERCISE_PRESETS necesarios para romper imports hacia FitTrack |
| TrainingScreen.jsx | UI Train y composición, helpers de formato locales; conserva props, lazy SessionScreen y comportamiento |
| date-utils.js | localISO más addDays/daysBetween si necesarios para evitar importar app-utils con DOM transitivo; reexports anteriores intactos |

FitTrack mantiene export Train y reexports MUSCLES/EXERCISE_PRESETS. UID conserva
la expresión actual Math.random; si TrainingScreen lo necesita sin ciclo, mover
su implementación a id-utils.js y mantener reexport, sin nueva estrategia de IDs.
app-utils mantiene sus APIs importadas por alerts y pantallas, y sus usos locales
requieren imports además de reexports. No importar app-utils desde dominio nuevo:
incluye lectura de localStorage. No mover proteína ni todas las plantillas para
satisfacer un límite de capas. fase1Config continúa como módulo compatible puro;
sus valores y mapeos se fijan en pins.

Los updates de React conservan cuándo calculan desde snapshot frente a updater
funcional. No convertir silenciosamente un snapshot en cálculo sobre estado más
reciente. DateBar/dayNameOf/exLine se revisan por llamadores antes de mover o
eliminar; no introducir limpieza ajena por compartir archivo.

## Instrumentación y entorno

Reutilizar esbuild, jsdom, fake-supabase y Playwright instalados. El harness 003
monta componentes reales y puede capturar callbacks originales por instrumentación
de compilación cuando la interacción no basta. Controlar IDs, Date.now, timeout e
intervalos por separado, con cleanup y modo de ticks omitidos. Las opciones nuevas
del harness no alteran por defecto las de 001/002. Red externa prohibida.

El selector actual ya acepta 003; añadir traceability.json y validar sus resultados.
No cambiar selectSpec sin una necesidad demostrada. Tests futuros se registran
como plannedTests, no como tests ejecutados. Cada fila pasa a complete solo al
revisar todas sus aserciones y observar su ejecución sin skipped/retried.

## Verificación y CI

Comandos previstos: pnpm exec node --version; pnpm test; pnpm build;
pnpm run test:sdd:complete --spec=003-entrenamiento.
Conservar gates 001 y 002; para 002 ejecutar pnpm test:rls antes del modo completo
con guardas vigentes. El último job puede compartir la ejecución completa ya
disponible si todos los IDs/resultados/hash corresponden a la misma revisión;
nunca reutilizar evidencia obsoleta. CI añadirá gate 003 con Chromium. No cambiar
versiones/dependencias/lockfile; si surgiera necesidad, justificar y auditar.

Los once pins originales 001/002 conservan hash. Pins nuevos se congelan tras
G-PIN; modificar aserciones requiere citar FR y decisión pertinente. La suite
textual heredada puede requerir adaptar ubicaciones de imports tras la extracción,
sin eliminar aserciones de comportamiento: registrar diferencia y conservar
evidencia funcional equivalente. No sustituir un pin fallido por texto estático.

## Riesgos y decisión de cierre

TRAIN-001/002/003 permanecen AS-IS. Si un test descubre un comportamiento distinto
al supuesto, registrar evidencia y ajustar la descripción factual antes de extraer;
cambiar conducta requiere CHANGE aprobado. Ningún ciclo de imports ni dependencia
DOM transitiva se acepta en módulos puros. Los detalles de [validación](validation-plan.md)
y [tareas](tasks.md) son parte del plan. Aprobación aún pendiente.
