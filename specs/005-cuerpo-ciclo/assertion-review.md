# Revisión de aserciones de E0 — 005

Revisión del agente, 2026-10-18. Código original del árbol src 582e62c3dab2bdaa4feb3f8b20fcc21060b702a8
(BASE 02ab519). No constituye aceptación clínica ni aceptación final del propietario.

Cada grupo usa callbacks/componentes originales o funciones públicas, no una
reimplementación del algoritmo. Los nombres previstos se contrastarán con TAP/JSON
en G-PIN. Este informe se completa con los resultados de baseline; no los anticipa.

| Contrato | Archivo / grupo | Asunciones y fuerza de aserciones |
| --- | --- | --- |
| FR-001 y su escenario | test/body-weight.test.js :: cuerpo peso conserva conversiones reemplazo pasos e historial | Coma, rechazos por falsedad, negativos/no finitos en memoria, IDs al repetir updater, pasos, accesos rápidos, orden e historial ocho. |
| FR-002 y su escenario | test/body-measurements.test.js :: cuerpo medidas conservan campos null conversiones y reemplazo | Todos vacíos/cinco campos, null/cero/NaN/coma, reemplazo elimina extras, orden, borrado y seis filas. |
| FR-003 y su escenario | test/body-wellness.test.js :: cuerpo bienestar conserva borrador fecha guardas y guardado | Cambio de colección vs fecha, guarda y trimming, números/null y visibilidad de ceros; orden toast antes de setter capturado sin sustituir el toast. |
| FR-004 y su escenario | test/body-logs.test.js :: cuerpo checkin conserva normalizacion identidad timestamps y legado | Defaults/alias/clamps/extras/spotting, timestamps, rehidratación por objeto, ID/createdAt existentes y borrados independientes. |
| FR-005 y su escenario | test/body-routing.test.js :: cuerpo conserva seccion fecha montaje y visibilidad | Fecha/sección inicial/fallback y remontaje; cambios de sexo y props; navegador App real desde Diario/Plan a una fecha pasada, no solo callback aislado. |
| FR-006 y su escenario | test/body-context.test.js :: cuerpo ciclo conserva comienzos longitudes y contexto | Comienzos/cobertura siete, continuidad, spotting, longitudes 17/18/45/46, actual/siguiente y unknown. |
| FR-007 y su escenario | test/body-ovulation.test.js :: cuerpo ciclo conserva ovulacion flujo calendario y confianza | Gaps 0/1/2/3 y progresión fuera de las cuatro entradas previas; confianza, razones, calendario 14 y evidencia posterior a consulta. |
| FR-008 y su escenario | test/body-phase.test.js :: cuerpo ciclo conserva precedencia fases y desconocido tardio | Nueve fases en tabla, conflictos de sangrado/legado y score/ventanas 7/10; 45 fixtures completos de fase/motivo/confianza fijados desde original. |
| FR-009 y su escenario | test/body-summary.test.js :: cuerpo ciclo conserva resumen sangrado segmentos y outliers | Sangrado continuo limitado a 15, duración legado, ciclos abiertos, medias/outliers, segmentos y Map last-wins para IDs. |
| FR-010 y su escenario | test/body-distribution.test.js :: cuerpo ciclo conserva distribucion escalas bins y picos | Cinco pistas/escalas/clamps, denominador con ceros, seis y dos bins, cap final, empate estable y exclusión de vacíos. |
| FR-011 y su escenario | test/body-timeline.test.js :: cuerpo ciclo conserva recalculo timeline duplicados y timestamps | Rangos inclusivos/invertidos, primer duplicado en fase/último en presentación, IDs y timestamps controlados, spread data.date y fechas locales. |
| FR-012 y su escenario | test/body-guidance.test.js :: cuerpo ciclo conserva guia insights provisionalidad y textos | Textos completos PHASE_GUIDANCE y guía fijados, orden de notas, umbrales, provisionalidad, mínimos por fase y sueño fuera del rango. |
| FR-013 y su escenario | test/body-consumers.test.js :: cuerpo ciclo consumidores conservan confianza limites y cautela | React real: ocho/seis filas, fase/confianza y datos de Dashboard; cautela de Training y marca por fila solo con kg positivo. |
| FR-014 y su escenario | test/body-trend.test.js :: cuerpo peso conserva regresion tendencia y callbacks de objetivos | Regresión/minimos/denominador, ventanas/positivos y no finitos, redondeo, fachada y regresiones congeladas 004 de callbacks tras guardas. |
| FR-015 y su escenario | test/body-creatine.test.js :: cuerpo peso conserva creatina saturacion y edicion de objetivo | Curva comparada con constantes independientes, parámetros, inicio y saturación, presentación Lograda y edición mantiene objetivos. |
| FR-016 y su escenario | test/body-retention.test.js :: cuerpo peso conserva retencion detrending umbral y cap | Muestras mínimas, fase/detrending/ruido/cap, diferencia 0,2 a distintas magnitudes preserva punto flotante, filtro del consumidor por ciclos/sexo. |
| FR-017 y su escenario | test/body-metrics.test.js :: cuerpo peso conserva medias correcciones tendencia y proyeccion | Medias y siete días, correcciones, futuro/fallback, proyección fraccional y fecha por días, signo y umbral; diferencia con límite 104 preservada. |
| FR-018 y su escenario | test/body-alerts.test.js :: cuerpo avisos conservan fatiga textos umbrales y claves | Umbral 0,25, energía cero/futuro, confusión y fatiga/deload, claves ausentes con ciclo false y regresiones de nutrición 004. |
| FR-019 y su escenario | test/body-dashboard.test.js :: cuerpo metricas y diario conservan selectores y formatos | Dashboard target/change7/medidas, pasos duplicados y media, dayFeed/search; sueño/pulso futuros y baseline cuatro vs cinco muestras. |
| FR-020 y su escenario | test/body-compatibility.test.js :: cuerpo consumidores conservan fachadas fotos y contratos previos | Exports y formatos, fotos fallo/éxito en React/Chromium, consumidores reales/previews y 40 hashes anteriores normalizados. |

## Sensibilidad y límites

Cuatro mutaciones en bundle, cada una con control original aprobado y rechazo
por AssertionError de la aserción contractual; no por error de sintaxis/build.
Negativos de trazabilidad incluyen inexistente/skipped/retried/failed y estados
partial/pending completos. No se modifican pins congelados 001–004.

Los fixtures de texto y 45 resultados de fase son capturas del original,
contrastadas con las aserciones explícitas de precedencia y fronteras; no son
algoritmos duplicados ni un oráculo calculado durante el test. NaN/Infinity se
comparan antes de serializar. Chromium usa controles reales para valores válidos
y callbacks de React para cambios externos de colección; los casos no admitidos
por input number se distinguen como invocación del callback en Node.

No hay prueba funcional con backend real ni validación de causalidad clínica.
RLS fresco queda para G-CLOSE. KD-002 sigue global; este checkpoint no retira
la deuda del resto de la interfaz. Checkpoint final completo aprobado: 284 Node, 13 Chromium, build, 40/40 IDs
y 68 archivos congelados (28 nuevos y 40 anteriores). [Baseline](evidence/baseline.json).
La revisión corresponde al agente; no se declara revisión humana del propietario.
