# Decisiones técnicas propuestas — 005

Estado: pendientes de aprobación con el plan. Lectura del BASE 02ab519; sin
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
