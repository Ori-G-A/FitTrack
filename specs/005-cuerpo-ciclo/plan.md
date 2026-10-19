# Plan técnico — 005-cuerpo-ciclo

Estado: APROBADO para ejecución local E0–E6. Fecha: 2026-10-18.
[Spec aprobada](spec.md), [research](research.md), [validación](validation-plan.md),
[tareas](tasks.md), [analyze](analyze.md), [PR documental preparado](doc-pr.md).
BASE src: 02ab5193f9d01e0037e9640626b25742e5224a5a; los commits posteriores son documentales.
No hay CHANGE ni autorización de publicación, integración o despliegue.

## Puertas y entregas

G-DOC / T001: aprobación del propietario de plan, tareas y analyze, preparación
del PR documental y autorización explícita si se ejecuta localmente antes de
integrarlo. Un borrador de cuerpo de PR no equivale a publicación.

E0 / T002–T023: 20 grupos de caracterización sobre original y cuatro recorridos
Chromium nuevos; cuatro mutaciones, negativos del verificador y revisión de
aserciones para las 40 filas. src debe coincidir con BASE. G-PIN T023 registra
resultados, hashes y runtime, congela pins nuevos y verifica los 40 anteriores.
Ninguna extracción puede comenzar sin ese checkpoint completo verde.

E1 / T024: separar núcleo de registros/contexto de ciclo y constantes de
presentación, preservando facades; romper import transitivo de app-utils.
E2 / T025: separar fase, resúmenes y lecturas sin ciclos de imports ni cambios
de precedencia, cronología, confianza, textos o selección de duplicados.
E3 / T026: separar transformaciones de registros y selectores de Cuerpo;
conservar estado y efectos en la pantalla, operaciones de fotos y orden de eventos.
E4 / T027: separar algoritmos de peso y métricas necesarias de alerts; preservar
callbacks 004 y momento de inferencias, medias/proyecciones distintas y retorno sin claves.
E5 / T028: integrar selectores de Dashboard/Diario y consumidores de ciclo;
revisar rutas y previews sin rediseñar ni modificar reglas de entrenamiento/nutrición.
E6 / T029–T033: límites de capas, CI 005, cierre local completo, converge y
preparación del PR de código para el propietario. Sin permisos remotos implícitos.

Cada E1–E5 exige pins del grupo, suite Node, build, hashes congelados y recorridos
Chromium afectados antes de continuar; commit por entrega. T029 añade negativos
de arquitectura sin aplazarlos cuando una frontera se introduce antes.
Cualquier checkpoint fallido se repite íntegramente tras corregirlo.

## Fronteras propuestas y grafo

| Módulo | Responsabilidad | Dependencias permitidas |
| --- | --- | --- |
| src/body-config.js | Opciones y etiquetas locales de Cuerpo; CYCLE_PHASES/PHASE_GROUPS/tracksCycle si se trasladan manteniendo app-config como fachada | Constantes y datos; sin E/S |
| src/cycle-context.js | Normalización/defaults, helpers internos, comienzos, contexto, score, detección y estimación de ovulación | date-utils y constantes puras; no summaries ni facade |
| src/cycle-phase.js | inferCyclePhase, buildCycleTimeline, confianza y motivos con bienestar | cycle-context, date-utils |
| src/cycle-summary.js | phaseSegments, summarizeCycles y symptomDistribution | cycle-context, cycle-phase, date-utils |
| src/cycle-readings.js | PHASE_GUIDANCE, dailyGuidance, recálculo e insights | context, phase, summary, date-utils |
| src/body-records.js | Transformaciones de peso/medidas/bienestar/check-in y borrados | cycle-context, date-utils; ID y now recibidos como funciones/valores explícitos |
| src/weight-model.js | creatineWaterKg, slopePerDay, lutealRetentionKg, weightTrendHighlight | date-utils; ninguna dependencia de UI, alerts o goals-model |
| src/weight-metrics.js | Medias móviles, ajuste por fase, tendencia de avisos, proyección y contexto de ciclo de alertMetrics | weight-model, cycle-context/phase, body-config, date-utils |
| src/body-metrics.js | Selectores de series/historial/medidas, pasos y resumen actual de ciclo para Dashboard; fragmento de entradas de cuerpo de dayFeed | weight-model, cycle modules, date-utils; formato/fecha recibidos donde corresponda |

cycle-inference conserva TODOS sus exports como fachada. Los módulos internos
no la importan: readings → summary → phase → context es acíclico. Evitar helper
compartido adicional salvo necesidad demostrada, y registrar ajuste en research.
Los helpers privados que necesiten varios módulos se ubican en context solo
si corresponden a ese dominio; no crear utilidades universales sin llamadores.

app-utils conserva sus exports y usa imports locales donde requiere invocarlos;
settings-utils continúa inyectando slopePerDay/weightTrendHighlight a goals-model
tras las mismas guardas. No editar los ocho módulos puros de 004 para resolver
la dependencia. cycle-inference deja de importar app-utils y reutiliza date-utils.
app-config mantiene sus exports/valores; no crear una segunda copia de constantes.

weight-metrics recibe el instante actual donde hoy se captura; evitar convertir
llamadas dispersas a new Date en un único reloj global, porque alteraría límites
de medianoche. Mantener número, orden y guardas de inferencias observados donde
tengan efecto en resultados. alerts conserva composición, nutrición y entrenamiento;
la extracción no exige trasladar todos sus avisos ni sus algoritmos ajenos.

## Estado, efectos y consumidores

BodyScreen mantiene hooks, dependencias y orden de toast/setter/reset. Los IDs
se generan en el mismo punto: peso/medidas/bienestar dentro del updater; check-in
antes del updater según fuente. Normalización conserva campos adicionales;
peso/medidas/bienestar reemplazan con sus campos actuales. No añadir validación,
coerción uniforme ni fusión de datos. El helper recibe el estado actual del updater,
no un snapshot capturado antes. Fotos usan operaciones 002 intactas y estado busy/error.

No extraer un hook solo para reducir líneas. Mantener useEffect de bienestar
con [welDate] y check-in con [cycleDate, existingCycleLog], hidratación y initialDate.
Sección no se sincroniza a props ni se reinicia al cambiar sexo. Conservar key
por tab, fechas desde Diario/Plan y handlers de navegación de ambos previews.
Cuerpo/Perfil/Dashboard/Training conservan sus condiciones diferentes.

Dashboard conserva sueño y pulso en su posición actual y ventanas actuales;
protegerlos en pins de compatibilidad de FR-019, sin ampliar extracción a todo
el panel. Movimiento y entrenamiento permanecen en 003; nutrición en 004.
El fragmento corporal de dayFeed puede delegarse sin cambiar la concatenación,
orden, IDs, campos de búsqueda y formato de los demás fragmentos.

## Pruebas, CI y cierre

Reutilizar esbuild, jsdom, React act, Playwright y fake-supabase instalados.
Harness de prueba previsto body-entry/body-build/body-dom/body-fixtures en
test-support, sin modificar el producto para exponer handlers. Plugins de
instrumentación fallan ante anclas ausentes; los pins congelados anteriores no
se editan para adaptar extracciones nuevas. Fecha, aleatoriedad y backend falsos
se restauran al terminar. Sin instalaciones, dependencias, SQL o datos nuevos.

Comandos previstos con pnpm 11.11.0 / Node 24.21.0: pnpm exec node --version;
pnpm test; pnpm run build; pnpm test:browser;
pnpm run test:sdd:complete --spec=005-cuerpo-ciclo.
Gates previos: seleccionar 001-datos, 002-identidad-fotos, 003-entrenamiento y
004-nutricion-objetivos. Renovar pnpm test:rls en fixture local con guardas y
cleanup. Contrastar cinco manifiestos contra resultados frescos del mismo src;
se puede reutilizar una colección verificada sin repetirla por cada manifiesto.
La evidencia 002 debe validar hashes RLS actuales, no solo filas sintéticas.

Añadir gate y artifacts 005 a CI, conservando jobs, gates anteriores y RLS.
La disponibilidad de Docker no se presume: un fallo deja el cierre pendiente.
Registrar sourceHash sobre todos los archivos src versionados incluidos los
nuevos ya preparados en índice; evitar una evidencia que omita archivos sin trackear.

Converge revisa 40/40 IDs completos, cláusulas enteras, hashes, arquitectura,
BODY-001–005 y constitución/KD-002. La deuda global no se retira al cerrar solo 005.
Si aparece gap, añadir tarea sin reescribir completadas. Preparar PR con resultados,
omisiones, orden de merge y rollback de código por entrega, sin migración de datos.

Aprobación 2026-10-18: «aprobado», respuesta directa a plan/tasks/analyze y
autorización de ejecución local E0–E6 antes de integrar el PR documental.
No autoriza publicación, merge ni despliegue.
