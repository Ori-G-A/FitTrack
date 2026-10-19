# Inventario final de llamadores — 005

Revisión del agente: 2026-10-19. Se contrastaron imports/reexports con rg sobre
src y con el metafile de esbuild usado por las pruebas de arquitectura.
Las pruebas funcionales conservan los recorridos; las coincidencias textuales
solo sirven para inventariar, no para declarar interacción aprobada.

| API o responsabilidad | Implementación | Consumidores conservados |
| --- | --- | --- |
| 20 exports originales de ciclo | cycle-context, cycle-phase, cycle-summary, cycle-readings | Fachada cycle-inference; BodyScreen, PerfilScreen, Dashboard a través de body-metrics, TrainingScreen y alerts |
| tracksCycle/CYCLE_PHASES/PHASE_GROUPS | body-config | Fachada app-config; App, Cuerpo, Perfil, Dashboard, alerts; goals-model/nutrition-metrics mantienen sus importaciones del mismo facade |
| CRUD de cuerpo y normalización de borrador | body-records con normalizeMenstrualLog de context | Handlers BodyScreen, conservando hooks, fecha, guardas, IDs, toast y fotos |
| creatineWaterKg/lutealRetentionKg/slopePerDay/weightTrendHighlight | weight-model | Fachada app-utils; BodyScreen, Diario, alerts y settings-utils; goals-model recibe callbacks tras las mismas guardas |
| Media, corrección, tendencia y proyección de avisos | weight-metrics | alertMetrics mantiene composición, cicloConfound, energía y entrenamiento/nutrición |
| Historiales/series/selectores corporales | body-metrics | BodyScreen y Dashboard, con sus diferentes filtros/órdenes |
| stepsToday | body-metrics | Fachada app-utils y Diario |
| Fragmento de cuerpo de dayFeed | bodyFeedEntries en body-metrics | dayFeed conserva concatenación y mapa final; Diario, Plan y searchFeed mantienen fecha, IDs y texto buscable |
| Navegación y formatos persistidos | App y coordinación 001 intactas | Fecha desde Diario/Plan y key por pestaña; Account compone Perfil/Settings; ambas previews montan Cuerpo |
| Fotos privadas y errores | Operaciones 002 intactas | BodyScreen delega validar/comprimir/subir/borrar; errores no pierden metadatos |

Los módulos nuevos solo importan fechas y otros módulos puros del área. No
importan app-utils, fachadas de pantalla, React, DOM o Supabase transitivamente.
El grafo interno de ciclo importa hacia context; summary depende de timeline
en phase, y readings de phase, evitando el ciclo detectado durante planificación.

La prueba de arquitectura verifica la lista exacta de exports públicos de
cycle-inference, negativos transitivos y 68 hashes de pins. La compatibilidad de
001/003/004 se comprueba además con sus manifiestos completos sobre resultados
frescos. El gate 002 y RLS desechable fresco se verifican en G-CLOSE.

No se retiran fachadas ni se congela una carpeta legacy. Sueño/pulso de Dashboard,
movimiento y algoritmos nutricionales/de entrenamiento permanecen en sus dueños.
