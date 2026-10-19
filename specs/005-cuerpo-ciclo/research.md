# Decisiones técnicas propuestas — 005

Estado: APROBADAS con el plan. Lectura del BASE 02ab519; sin
experimentos, runtime ni baseline nuevos. [Plan](plan.md), [survey](../../docs/sdd/cuerpo-ciclo-survey.md).

| Decisión | Evidencia y alternativa | Elección propuesta y consecuencia |
| --- | --- | --- |
| R-001 Fachada de ciclo y grafo dirigido | cycle-inference reúne normalización, contexto, fase, resumen y lecturas; importar facade internamente crearía ciclos | Context sin summary/phase; phase depende de context; summary de phase; readings de los anteriores. Fachada conserva API, sin reexport ambiguo |
| R-002 Fechas puras compartidas | cycle-inference importa fechas de app-utils, con acceso DOM transitivo; date-utils ya es módulo puro | Importar fechas directamente sin reimplementar aritmética local ni agrupar instantes distintos |
| R-003 Registros como transformaciones | Handlers mezclan ID, conversiones, setters y toast; hooks propios podrían cambiar efectos/montaje | Helpers puros reciben estado actual e ID/now; mantener hooks y orden de efectos en BodyScreen, incluso diferencias incómodas |
| R-004 Peso separado de objetivos | settings-utils inyecta regresión/tendencia existentes en goals-model 004 | Reexportar desde app-utils, preservar inyección tardía; no duplicar algoritmos ni importar app-utils desde módulos nuevos |
| R-005 Métricas por responsabilidad | alerts combina peso/ciclo, nutrición y entrenamiento; ventanas distintas son observables | Extraer solo cadena de peso/ciclo, conservar composición y condiciones compartidas; no unificar proyecciones ni filtros |
| R-006 Harness sobre original | Ya hay esbuild/jsdom/React/Playwright y backend falso; texto fuente no prueba interacción | Nuevo harness específico con instrumentación solo en bundle de pruebas, cuatro recorridos y fixtures sintéticos; no tocar pins anteriores |
| R-007 Salidas no finitas | JSON serializa NaN/Infinity como null y escondería BODY-001 | Aserciones numéricas en memoria; evidencia JSON solo guarda resultados y hashes, no convierte fixtures en oráculo |
| R-008 Alcance de métricas adyacentes | Dashboard también calcula sueño/pulso/movimiento | Mantener sueño/pulso donde están y comprobar regresión; no trasladar movimiento ni rediseñar tarjetas |

Nombres de módulos son propuesta técnica: ajustar solo si G-PIN demuestra una
frontera innecesaria o dependencia no prevista, registrando motivo e impacto sin
cambiar alcance, contrato ni baseline fijada. Decisiones de comportamiento no se
resuelven con un rename o una abstracción: requieren CHANGE aprobado.

Aprobación 2026-10-18: «aprobado», respuesta directa a plan/tasks/analyze y
autorización de ejecución local E0–E6 antes de integrar el PR documental.
No autoriza publicación, merge ni despliegue.

## Ajuste técnico observado en E0

phaseSegments llama a buildCycleTimeline, que usa inferCyclePhase. Para evitar
un ciclo summary/readings, buildCycleTimeline se ubicará junto a inferCyclePhase
en cycle-phase; readings lo consumirá desde allí y la fachada conservará el export.
No cambia API ni comportamiento. Los pins de duplicados fijan que un registro
posterior puede crear el inicio mientras el primer registro determina la fase.

R-009: E0 reprodujo 13 fallos de anclas congeladas tras checkout CRLF. Se añade
.gitattributes limitado a src/** text eol=lf para reproducir el código original
en Windows y Linux, sin editar pins ni configuración global. La normalización
de bytes no cambia blobs fuente de Git; el nuevo sourceHash se registra en baseline.

R-010: precisión de evidencia: la revisión de aserciones de E0 la realiza el
agente autorizado, aparte del verificador; no se presenta como revisión humana
ni aceptación final del propietario. Se corrige esa denominación del documento
de validación, manteniendo la revisión cláusula a cláusula y las puertas aprobadas.
