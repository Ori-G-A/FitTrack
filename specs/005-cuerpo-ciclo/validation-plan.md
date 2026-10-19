# Plan de validación — 005

Estado: APROBADO; no hay ejecución ni baseline 005. [Spec](spec.md), [tareas](tasks.md).
BASE src: 02ab5193f9d01e0037e9640626b25742e5224a5a.

## Pins completos antes de extraer

Cada grupo es un test superior con nombre exacto y subcasos; se invocan funciones
y callbacks del original, sin copiar algoritmos. Fixtures sintéticos y salidas
explícitas fijadas tras revisar la fuente; fechas/IDs controlados, NaN/Infinity
comparados en memoria, sin serialización JSON que los convierta en null.
Las interacciones usarán React real, act y setters funcionales, no snapshots de JSX.

| Tarea | Contrato | Archivo :: prueba prevista | Subcasos/aserciones obligatorios |
| --- | --- | --- | --- |
| T002 | FR-001, US1-AS1 | test/body-weight.test.js :: cuerpo peso conserva conversiones reemplazo pasos e historial | Coma/punto, vacío, cero, NaN, negativos, Infinity mediante callback real cuando input nativo no lo admite; fechas duplicadas, ID generado dentro del updater, orden, borrado, pasos 0,1 y rápidos ±0,4/±0,2/0; ocho filas y gráfico completo. |
| T003 | FR-002, US1-AS2 | test/body-measurements.test.js :: cuerpo medidas conservan campos null conversiones y reemplazo | Cinco campos, todos vacíos, cero, NaN por coma, negativos, campos previos adicionales eliminados por reemplazo, duplicados de fecha, ID/orden/borrado, seis filas y cintura no-null con umbral gráfico de dos. |
| T004 | FR-003, US1-AS3 | test/body-wellness.test.js :: cuerpo bienestar conserva borrador fecha guardas y guardado | Props de colección cambian a igual fecha sin recargar borrador; fecha nueva sí recarga; guardas con notas blancas y energía cero; Number de tres campos, null, trimming, ID/orden/reemplazo; toast antes de setter, seis filas, ceros visibles según campo y ausencia de borrado. |
| T005 | FR-004, US1-AS4 | test/body-logs.test.js :: cuerpo checkin conserva normalizacion identidad timestamps y legado | Defaults, alias camel/snake, precedencia de valores falsos, clamps y no finitos, campos extra preservados, spotting según alias/Boolean, notas, createdAt/updatedAt; cambio de objeto existente recarga borrador; ID existente o nuevo y timestamps controlados; reemplazo por fecha sin crear periodos; borrado por logId o periodId sin eliminar ambos. |
| T006 | FR-005, US1-AS5 | test/body-routing.test.js :: cuerpo conserva seccion fecha montaje y visibilidad | Sección inicial válida/fallback, initialDate, key por pestaña y props sin remontaje; sexo vacío/mujer/otro/hombre con y sin datos; ADD_ROWS, Cuerpo, Perfil y Dashboard conservan condiciones distintas; cambiar sexo no reinicia sección abierta; navegación desde Diario/Plan con fecha y ambas previews. |
| T007 | FR-006, US2-AS1 | test/body-context.test.js :: cuerpo ciclo conserva comienzos longitudes y contexto | Periodos desordenados/duplicados, clear vs spotting, continuidad un día vs huecos, cobertura fija de siete días incluso duración legado distinta; longitudes 17/18/45/46 y fallback 28, media redondeada, antes del primero, actual, próximo real vs esperado, futuros y desconocidos. |
| T008 | FR-007, US2-AS2 | test/body-ovulation.test.js :: cuerpo ciclo conserva ovulacion flujo calendario y confianza | Transición fértil a seco/pegajoso/cremoso a 0/1/2/3 días; progresión en cuatro entradas previas y dolor lateral/central/general; confianza baja/media/alta, razones exactas; calendario menos 14 días, fecha previa al inicio y sin inicio; evidencia futura conserva efecto observado. |
| T009 | FR-008, US2-AS3 | test/body-phase.test.js :: cuerpo ciclo conserva precedencia fases y desconocido tardio | Tabla de nueve fases y combinaciones en conflicto; sangrado claro vs none/spotting/not_logged y legado; ovulación, DPO 1/4/5/9/10, ciclo día 8/9/10, siguiente a 0/6/7 días; score 2/3, sangrado reciente siete y none diez días, muestras y fluidos, motivos con bienestar; no usar inferCyclePhase como oráculo de sí misma. |
| T010 | FR-009, US2-AS4 | test/body-summary.test.js :: cuerpo ciclo conserva resumen sangrado segmentos y outliers | Ciclo abierto/cerrado, sin registros, sangrado 1/15/más de 15 días, fallback legado, medias redondeadas y null, 18–45 y outliers; IDs de resumen, Map last-wins; rangos vacíos/invertidos y segmentos inclusivos contiguos, orden inverso. |
| T011 | FR-010, US2-AS5 | test/body-distribution.test.js :: cuerpo ciclo conserva distribucion escalas bins y picos | Cinco pistas, escalas 0,25/0,5/0,75/1 y cramps/10/otros/3; valores fuera de rango, missing como cero en denominador, bins seis y parámetro existente, ciclo abierto/promedio, límites de bucket y cap final, empate estable y pista sin positivos omitida. |
| T012 | FR-011, US2-AS6 | test/body-timeline.test.js :: cuerpo ciclo conserva recalculo timeline duplicados y timestamps | Rangos de cero/uno/varios días e invertido; IDs user:fecha y local:fecha; timestamps controlados y orden del spread data.date; primer duplicado para inferencia vs último para mapas; campos de presentación ausentes, no mutación de entradas ni E/S. |
| T013 | FR-012, US2-AS7 | test/body-guidance.test.js :: cuerpo ciclo conserva guia insights provisionalidad y textos | Textos y notas en orden, sangrado, cramps 4/5, apetito/score, energía 0/1/2/3, sueño 0/menor de 6/6; cero/uno/dos ciclos completos; lecturas por fase con 1/2/4/5 muestras; sueño fuera del rango, coincidencias y fallback; Cuerpo filtra por fase y muestra dos. |
| T014 | FR-013, US2-AS8 | test/body-consumers.test.js :: cuerpo ciclo consumidores conservan confianza limites y cautela | React real para Body ocho filas, Perfil seis, Dashboard ciclo actual y ausencia de comienzo; textos/colores/fuentes/confianza/desconocido/provisional y disclaimer existentes; Training advierte solo fase fértil/ovulación y confianza no baja, sin goals, riesgo por fila solo con kg positivo. |
| T015 | FR-014, US3-AS1 | test/body-trend.test.js :: cuerpo peso conserva regresion tendencia y callbacks de objetivos | Pendiente 0/1/2 puntos y denominador cero; pesos positivos y coerciones originales, al menos tres, límites today−21/today y futuros excluidos; redondeo semanal y ventana parámetro; fachadas app-utils/settings-utils y callbacks 004, sin anticipar inferencia tras guardas. |
| T016 | FR-015, US3-AS2 | test/body-creatine.test.js :: cuerpo peso conserva creatina saturacion y edicion de objetivo | Sin inicio, antes/en/después, tau 7/full 1,5 y parámetros explícitos; curva con resultados esperados calculados como fixtures constantes, no copia del algoritmo; saturación/redondeo, 28 días y 98%; edición funcional conserva otros objetivos. |
| T017 | FR-016, US3-AS3 | test/body-retention.test.js :: cuerpo peso conserva retencion detrending umbral y cap | Mínimos 2/3 por fase, pesos no positivos excluidos, fase folicular temprana/media-tardía vs lútea tardía, detrending con pérdida; diferencia ≤0,2 y encima, cap 2,5/capped y redondeos; consumidor con 2/3 ciclos completos y fechas futuras. |
| T018 | FR-017, US3-AS4 | test/body-metrics.test.js :: cuerpo peso conserva medias correcciones tendencia y proyeccion | Media por fecha con ventana inclusiva de siete días y redondeo uno; duplicados/ceros/no finitos observados; correcciones por creatina y fase, faseByDate, currentMA; ventana de 21 días sin excluir futuros y fallback seis; proyección umbral 0,02, signo opuesto/igual/cero, fecha por round(weeks*7) y weeks redondeada, sin cap 104; inputs de mantenimiento 004 intactos. |
| T019 | FR-018, US3-AS5 | test/body-alerts.test.js :: cuerpo avisos conservan fatiga textos umbrales y claves | Diferencia 0,25 y adyacentes, 2/3 ciclos, score 2/3, lowEnergy energía null/0/2/3 desde today−7 con futuros; fatiga/deload y supresión por ciclo, nutrición/entrenamiento 003/004 intactos; ciclo false retorna sin keys y true asigna alertKey, orden/textos/card. |
| T020 | FR-019, US3-AS6 | test/body-dashboard.test.js :: cuerpo metricas y diario conservan selectores y formatos | Dashboard línea startWeight truthy o real inicial y weeklyChange, change7 con referencia ≥7, medidas first/last no-null; pasos de hoy vs siete previos positivos sin deduplicar; dayFeed excluye pulso aislado y medidas no positivas, notas recortadas y formatos; búsqueda/navegación. Proteger sueño/pulso existentes con ventanas 7/14/28 y baseline mínimo cinco sin extraerlos ni recalibrarlos. |
| T021 | FR-020, US3-AS7 | test/body-compatibility.test.js :: cuerpo consumidores conservan fachadas fotos y contratos previos | Todos los exports y consumidores inventariados; App/Account/Diario/Plan y previews; formatos 001, fotos 002 éxito/fallo sin tocar almacenamiento, cautela 003 y callbacks 004; los 40 hashes anteriores y nuevos pins congelados; asegurar que tests fuente no se presentan como interacción. |

## Recorridos Chromium previstos

Archivo nuevo previsto: browser-tests/body.spec.js, con cuatro títulos únicos:

- cuerpo navegador peso medidas y creatina: fecha de entrada, coma, pasos, reemplazo, borrado, medidas y objetivo de creatina sin perder otros campos.
- cuerpo navegador bienestar fecha y persistencia de borrador: editar, cambiar colección a misma fecha, cambiar fecha, guardar y comprobar colección/Diario y navegación de retorno.
- cuerpo navegador checkin incertidumbre y consumidores: guardar, cambiar evidencia, fase/confianza/motivo/provisionalidad, borrar log/legado y comprobar Cuerpo/Perfil/Métricas/Training.
- cuerpo navegador rutas perfiles previews y fotos: variantes de sexo/datos, fecha desde Diario/Plan, ambas previews y fallo/éxito de fotos con servicio falso; ningún backend real.

UI usa inputs/clicks reales para casos representables; los callbacks instrumentados
cubren valores que input type=number rechaza antes del handler. Distinguir ambos
resultados. Inventariar controles y anclas antes de congelar harness; fallar si
faltan, no omitir silenciosamente pantallas. Reutilizar infraestructura existente,
con roots, timers, ResizeObserver y relojes limpiados por caso; fijar zona local
y probar borde de medianoche y cambio de mes sin reinterpretar fechas como UTC.

## Sensibilidad, negativas y baseline

T022 añade test/body-sensitivity.test.js :: cuerpo pins detectan mutaciones controladas.
Cuatro mutaciones solo en bundle de pruebas: aceptar cero en guarda de peso,
rehidratar bienestar a igual fecha, alterar precedencia none/legado y asignar
claves antes del retorno sin ciclo. Cada mutación debe fallar por una aserción
identificada, y su control original debe pasar; no cuentan fallos de compilación.
Añadir negativos del verificador por nombre inexistente, skipped, retried y estado
partial/pending en modo completo, reutilizando scripts originales sin debilitarlos.

G-PIN exige suite Node, cuatro recorridos Chromium nuevos y los anteriores,
build, 40/40 IDs completos y revisión humana de aserciones contra cada cláusula.
Congelar archivos nuevos de pins, fixtures/harness y browser, más los 40 previos;
registrar lista exacta/hashes SHA256 con normalización de saltos igual al proyecto,
sourceHash, revisión src, runtime, comandos/resultados y mutaciones. Cualquier
ajuste posterior de aserción requiere FR y justificación, nunca reescribir baseline.
Si un subcaso contradice la spec, registrar discrepancia y resolver antes de E1.

## Capas y cierre

T029 añade test/body-architecture.test.js :: cuerpo capas puras y negativos transitivos;
y :: cuerpo conserva hashes congelados y contratos publicos. Grafo de imports
mediante metafile esbuild y detección directa DOM/React/Supabase, con fixtures
negativos transitivos y API de navegador directa. Comprobar módulos realmente
creados, facade cycle-inference y ausencia de ciclos; no limitarse a regex de imports.

Cada E1–E5: pins afectados, suite completa, build, hashes y recorridos afectados.
T031: renovar RLS local desechable con guardas y cleanup; suite/Chromium/build y
cinco contratos completos usando mismo src y resultados frescos. Si Docker falla,
registrar fallo y conservar pendiente; reparar/retirar fixture solo con guardas de
propietario, ruta y nonce. No usar .env.local ni evidencia antigua como cierre nuevo.
Repetir íntegro un checkpoint fallido tras corregirlo. Reportar omisiones y reintentos;
para cierre se exige cero skipped/retried en pruebas contractuales.

Aprobación 2026-10-18: «aprobado», respuesta directa a plan/tasks/analyze y
autorización de ejecución local E0–E6 antes de integrar el PR documental.
No autoriza publicación, merge ni despliegue.
