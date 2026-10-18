# Decisiones técnicas — 004

Estado: propuestas para el [plan](plan.md), sin implementación.
Fuentes: [survey](../../docs/sdd/nutricion-objetivos-survey.md) y código BASE
2a70042. No se valida clínicamente ninguna fórmula ni se consulta un catálogo externo.

| Decisión | Evidencia y motivo | Alternativa descartada |
| --- | --- | --- |
| R-001 Separar catálogo/proteína manteniendo fachadas | FitTrack concentra catálogo y helpers; fase1Config comparte proteína con entrenamiento. Extraer solo responsabilidad nutricional evita ciclos y protege consumidores | Trasladar todas las plantillas o importar FitTrack desde dominio |
| R-002 Mantener efecto autoMacros en Ajustes | SettingsScreen:31–38 depende del montaje y también corre en datos. Un hook adicional no aporta una frontera de E/S | Coordinador global que recalcula fuera de Ajustes: cambia FR-009 |
| R-003 Inyectar inferencia en goals-model | settings-utils importa slopePerDay y weightTrendHighlight desde app-utils, que contiene localStorage. Callbacks preservan inferencia y orden de guardas | Importar app-utils transitivamente o duplicar algoritmo de 005 |
| R-004 Mantener ventanas por función | Adherencia limita hasta hoy; medias de alertas/macro14/entreno no siempre lo hacen. Son contratos distintos | Un selector genérico que normalice todos los filtros |
| R-005 Operaciones puras con contexto explícito | Biblioteca y Diario mezclan snapshots con updates funcionales. Pasar snapshot, fecha e ID donde corresponde conserva momento de evaluación | Recalcular todo desde el estado más reciente |
| R-006 Pins por comportamiento e instrumentación mínima | Existentes tests textuales no demuestran CRUD, efectos o snapshots. Harness instalado puede montar componentes originales y capturar callbacks | Copiar fórmulas en harness y probar la copia o depender solo del texto |
| R-007 Sin dependencias nuevas | esbuild/jsdom/Playwright ya instalados; selector SDD admite 004 sin modificación | Cambiar runtime o lockfile por preparación documental |

Riesgos: diferencias de NaN/Infinity, cadenas/negativos, redondeo antes de umbral,
orden estable con fechas iguales y componentes montados. Se cubren explícitamente
en E0. Los controles de reloj no reemplazan fecha local por UTC. Extraer handlers
no convierte snapshots persistidos en referencias a alimentos editables.

R-008 (E1): round1 y scaleFood tienen consumidores compartidos inventariados
y expresiones sin E/S. Se extraen a nutrition-numbers.js para que los nuevos
modelos puedan usarlos sin importar FitTrack; fachada original conservada.

E3 / FR-014: ui-regressions inspeccionaba objetos inline de Diario. Se adapta
a comprobar llamada y expresión trasladada en goals-operations, conservando
la guarda sobre estado local y añadiendo enlace de undo. Los pins funcionales
congelados de E0 no cambian; el harness solo adapta su ancla de mutación.
