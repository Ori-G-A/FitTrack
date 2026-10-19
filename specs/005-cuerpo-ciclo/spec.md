# Spec 005: Cuerpo y ciclo

Estado: ALCANCE Y ACLARACIONES APROBADOS; plan aprobado para ejecución local | Propietario: propietario de FitTrack | Fecha: 2026-10-18
Constitución: [1.0.2 ratificada](../../.specify/memory/constitution.md).
BASE de observación: 02ab5193f9d01e0037e9640626b25742e5224a5a.
[Survey](../../docs/sdd/cuerpo-ciclo-survey.md). No autoriza implementación.

## Resultado de usuario e intención

Registrar peso, medidas, bienestar y check-in, y consultar tendencias e inferencias
con sus desconocidos, procedencia y confianza visibles. Reorganizar las
responsabilidades sin cambiar los registros ni resultados observados. Las
fórmulas se describen como software existente, sin ratificación clínica.

## Alcance y restricciones

Incluye formularios y selectores de Cuerpo, motor de ciclo, tendencias y ajustes
de peso, y consumidores necesarios de Perfil, Métricas, avisos, Diario y
Entrenamiento. Incluye navegación con fecha y compatibilidad de ambos previews.
001 conserva persistencia; 002 identidad/fotos; 003 entrenamiento; 004 nutrición
y objetivos. Las firmas compartidas se revisarán con todos sus llamadores.
La implementación deberá esperar aprobación separada de alcance y plan.

## Historias y escenarios

### US1 — Registrar el cuerpo sin perder información (prioridad P1)

Como usuario, quiero guardar mis registros con sus fechas para recuperarlos con el comportamiento conocido.

- US1-AS1: Dado pesos con fechas repetidas, coma, cero, negativos y valores no finitos, cuando se guarde, borre o ajuste el borrador, entonces se conservarán las conversiones, guardas, ID, orden, pasos e historial de peso.
- US1-AS2: Dado medidas vacías, cero, coma y campos adicionales existentes, cuando se guarde o borre una medida, entonces se conservarán los cinco campos, null, Number, reemplazo e historial actuales.
- US1-AS3: Dado bienestar existente y un borrador editado, cuando cambie la colección sin cambiar fecha y luego se cambie la fecha, entonces solo el cambio de fecha recargará el borrador; el guardado conservará números y notas actuales.
- US1-AS4: Dado check-in existente, alias y periodo legado, cuando se normalice, guarde o borre cada tipo de registro, entonces se conservarán clamps, campos extra, timestamps, ID y destino de borrado.
- US1-AS5: Dado navegación con fecha y una sección abierta, cuando se cambien pestañas o props de sexo/datos, entonces se conservarán fecha inicial, fallback, remontaje y visibilidad propia de cada consumidor.

### US2 — Interpretar ciclo e incertidumbre (prioridad P1)

Como usuario, quiero distinguir observación y estimación para leer fase, procedencia y confianza de manera consistente.

- US2-AS1: Dado periodos legados, sangrado continuo y longitudes 17/18/45/46, cuando se construya contexto, entonces se conservarán comienzos, cobertura de siete días, media, siguiente real/esperado y null.
- US2-AS2: Dado flujos consecutivos, progresión y dolor con distancias frontera, cuando se detecte o estime ovulación, entonces se conservarán fechas, confianza, procedencia y alternativa de calendario.
- US2-AS3: Dado evidencias simultáneas y ausencia de confirmación de sangrado, cuando se infiera fase en las fronteras temporales, entonces se conservarán precedencia, nueve fases, confianza y desconocido tardío.
- US2-AS4: Dado ciclos abiertos, cerrados y fuera de rango, cuando se resuman y segmenten, entonces se conservarán duraciones, medias, outliers, orden y segmentos inclusivos.
- US2-AS5: Dado pistas de síntomas con ceros, valores límite y picos empatados, cuando se distribuyan en seis bins, entonces se conservarán escala, denominador, pico y exclusión de pistas sin síntomas.
- US2-AS6: Dado un rango inclusivo y registros duplicados, cuando se recalcule o genere timeline, entonces se conservarán selección de duplicados, IDs, timestamps y ausencia de E/S.
- US2-AS7: Dado menos de dos ciclos completos y bienestar dentro/fuera del rango, cuando se consulten guía e insights, entonces se conservarán provisionalidad, mínimos, textos, orden y alcance de sueño.
- US2-AS8: Dado un mismo conjunto de ciclo en Cuerpo, Perfil, Métricas y Entrenamiento, cuando se consulten las pantallas, entonces cada consumidor conservará límites, avisos, confianza y condiciones propias.

### US3 — Consultar tendencias y avisos compatibles (prioridad P1)

Como usuario, quiero mantener mis métricas y recorridos para comparar resultados antes y después de reorganizar el código.

- US3-AS1: Dado pesos positivos y excluidos en los límites de la ventana, cuando se calcule pendiente o tendencia, entonces se conservarán mínimos, null, ventana de 21 días y redondeos usados por 004.
- US3-AS2: Dado inicio de creatina ausente, futuro o activo, cuando se calcule y edite su ajuste, entonces se conservarán curva, saturación, fecha y resto de objetivos.
- US3-AS3: Dado muestras foliculares y lúteas con pérdida de peso y diferencias frontera, cuando se estime retención y corrección, entonces se conservarán mínimos, detrending, umbral, cap y requisito de ciclos.
- US3-AS4: Dado pesos históricos y futuros y objetivos en ambos sentidos, cuando se calcule media, tendencia o proyección, entonces se conservarán ventanas, fallback, signo, redondeos y diferencias con 004.
- US3-AS5: Dado ciclo activo o desactivado, energía y fatiga, cuando se construyan avisos, entonces se conservarán condiciones, textos y presencia/ausencia actual de claves.
- US3-AS6: Dado medidas, pasos y registros de cuerpo con ceros y pulso aislado, cuando se abra Métricas o Diario, entonces se conservarán selectores, diferencias, formatos y exclusiones actuales.
- US3-AS7: Dado los consumidores y formatos de 001–004, cuando se ejerciten navegación, fotos y persistencia tras reorganizar, entonces sus contratos y los 40 hashes congelados permanecerán intactos.

## Requisitos funcionales

Todos son AS-IS; cualquier corrección semántica exigirá CHANGE aprobado y prueba roja previa.

- FR-001 [AS-IS] Cuando se guarde o borre un peso, el sistema deberá conservar el parseo de coma decimal, la guarda por valor verdadero, sustitución de todos los registros de esa fecha por un registro con ID nuevo, orden ascendente, pasos de 0,1 y accesos rápidos; historial de ocho y gráfico con todos los registros.
- FR-002 [AS-IS] Cuando se guarden medidas, el sistema deberá conservar los cinco campos actuales, vacío como null y conversión Number sin normalizar coma, rechazo solo si todos son null, sustitución por fecha con ID nuevo y borrado por ID; historial de seis y gráfico de cintura con valores distintos de null.
- FR-003 [AS-IS] Cuando se cambie la fecha de bienestar, el sistema deberá cargar el borrador existente; mientras esa fecha no cambie, deberá conservar el borrador aunque cambie la colección. Al guardar deberá mantener la guarda actual, conversiones Number, energía o null, notas recortadas, reemplazo por fecha, ID nuevo y orden; historial de seis sin añadir borrado.
- FR-004 [AS-IS] Cuando se normalice o guarde un check-in, el sistema deberá conservar valores por defecto, alias camel/snake, clamps 0–10 y 0–3, campos adicionales, spotting, notas y timestamps actuales; mantener ID/createdAt existentes y sustituir por fecha. Borrar check-in o periodo legado deberá conservar sus destinos independientes.
- FR-005 [AS-IS] Cuando se abra una sección de cuerpo, el sistema deberá conservar initialDate, la sección inicial válida y su fallback a peso, así como el remontaje por pestaña. Mientras cambien props sin remontar, deberá conservar el estado de sección y las diferencias actuales de visibilidad por sexo/datos entre consumidores.
- FR-006 [AS-IS] Cuando se construyan comienzos y contexto, el sistema deberá conservar periodos legados, sangrado claro continuo, cobertura fija de siete días, longitudes válidas 18–45, media redondeada o 28, comienzo actual, siguiente real o esperado y desconocidos explícitos.
- FR-007 [AS-IS] Cuando se estime ovulación, el sistema deberá conservar transición de flujo fértil a poco fértil con separación máxima de dos días, progresión en cuatro entradas previas, dolor y confianza; mantener fuente flujo o calendario, resta de 14 días y ausencia si no hay comienzo o queda antes de él.
- FR-008 [AS-IS] Cuando se infiera una fase, el sistema deberá conservar la precedencia de sangrado explícito, periodo legado, ovulación probable, días posteriores y proximidad al siguiente periodo; las nueve etiquetas, confianza, motivos y fase desconocida ante ambigüedad tardía, con ventanas y umbrales actuales.
- FR-009 [AS-IS] Cuando se resuman ciclos, el sistema deberá conservar orden inverso, duración de sangrado consecutivo hasta 15 días o fallback legado, longitudes null del ciclo abierto, medias y outliers 18–45, y segmentos inclusivos consecutivos sin repetir tramos contiguos de igual fase.
- FR-010 [AS-IS] Cuando se distribuyan síntomas, el sistema deberá conservar las cinco pistas, pesos y clamps actuales, seis bins por defecto, ceros por ausencia de síntoma, media por bucket, pico y desempate estable, sin inventar pistas sin días positivos.
- FR-011 [AS-IS] Cuando se recalcule o construya un timeline, el sistema deberá conservar rangos inclusivos, IDs usuario:fecha, timestamps y orden de spreads; también selección de duplicados mediante primer registro en inferencia y último en mapas de presentación. No deberá añadir E/S a estas operaciones.
- FR-012 [AS-IS] Cuando se consulte guía o insights, el sistema deberá conservar textos, orden de notas, energía/sueño desde bienestar, marca orientativa con menos de dos ciclos completos, mínimos por fase y coincidencias de sueño que actualmente consideran toda la colección.
- FR-013 [AS-IS] Donde se muestre ciclo, el sistema deberá conservar ocho filas en Cuerpo y seis en Perfil, resumen del ciclo actual en Métricas, etiquetas, motivos, procedencia y aviso existente de incertidumbre; en Entrenamiento deberá mantener la cautela solo para fases fértiles/ovulación probable con confianza distinta de baja, sin introducir un filtro de sexo nuevo.
- FR-014 [AS-IS] Cuando se calcule regresión y tendencia de peso, el sistema deberá conservar mínimo de dos puntos para pendiente y null con denominador cero; tendencia con al menos tres pesos positivos, ventana inclusiva de 21 días hasta hoy y redondeo semanal a dos decimales, manteniendo el contrato de callbacks de objetivos 004.
- FR-015 [AS-IS] Donde haya fecha de inicio de creatina, el sistema deberá conservar la curva exponencial con tau 7 y máximo 1,5 kg, cero antes del inicio o sin fecha y la presentación de saturación, horizonte de 28 días y umbral 98%; editar inicio deberá preservar otros objetivos.
- FR-016 [AS-IS] Cuando se estime retención, el sistema deberá conservar pesos positivos, al menos tres muestras por grupo folicular/lútea tardía, detrending folicular, rechazo de diferencias hasta 0,2 kg, techo 2,5 y bandera capped; el consumidor deberá aplicar el ajuste solo con al menos tres ciclos completos.
- FR-017 [AS-IS] Cuando se calculen métricas de avisos, el sistema deberá conservar medias móviles de siete días, ajuste por creatina/fase, ventana de tendencia con futuros y fallback de seis puntos, pendiente semanal y proyección con umbral 0,02, signo de alejamiento y redondeo por semanas, sin añadir el límite de 104 semanas de otro consumidor.
- FR-018 [AS-IS] Cuando se construyan avisos, el sistema deberá conservar umbral 0,25, confusión de ciclo con dos ciclos completos y score 3, meta de tres ciclos y ventana de energía baja sin límite superior de fecha. Deberá mantener textos y condiciones compartidas de fatiga/nutrición, así como el retorno sin claves de avisos cuando ciclo está desactivado.
- FR-019 [AS-IS] Cuando se consulten métricas, pasos o diario, el sistema deberá conservar línea objetivo de peso y cambio a siete días, diferencias de medidas, media de pasos positivos de los siete días previos y filtros/formato de entradas de cuerpo; una nota solo con pulso seguirá sin crear entrada en el diario.
- FR-020 [AS-IS] Mientras se reorganice cuerpo y ciclo, el sistema deberá mantener firmas públicas y consumidores App/Perfil/Cuenta/Diario/Plan/previews, formatos persistidos y contratos 001–004, incluidos los 40 archivos de pins congelados de 004. Fotos, identidad, importación y guardado deberán conservar sus operaciones existentes.

## Evidencia AS-IS

Las líneas corresponden al BASE indicado. PENDING significa pin previo aún no ejecutado para 005; las pruebas existentes son evidencia parcial, no contrato completo.

| FR | Código file:line | Prueba actual o pin pendiente | Límite de evidencia |
| --- | --- | --- | --- |
| FR-001 | [BodyScreen.jsx:71](../../src/BodyScreen.jsx) | test/body-weight.test.js :: cuerpo peso conserva conversiones reemplazo pasos e historial | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-002 | [BodyScreen.jsx:96](../../src/BodyScreen.jsx) | test/body-measurements.test.js :: cuerpo medidas conservan campos null conversiones y reemplazo | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-003 | [BodyScreen.jsx:113](../../src/BodyScreen.jsx) | test/body-wellness.test.js :: cuerpo bienestar conserva borrador fecha guardas y guardado | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-004 | [cycle-inference.js:43](../../src/cycle-inference.js) | test/body-logs.test.js :: cuerpo checkin conserva normalizacion identidad timestamps y legado | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-005 | [BodyScreen.jsx:181](../../src/BodyScreen.jsx) | test/body-routing.test.js :: cuerpo conserva seccion fecha montaje y visibilidad | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-006 | [cycle-inference.js:83](../../src/cycle-inference.js) | test/body-context.test.js :: cuerpo ciclo conserva comienzos longitudes y contexto | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-007 | [cycle-inference.js:239](../../src/cycle-inference.js) | test/body-ovulation.test.js :: cuerpo ciclo conserva ovulacion flujo calendario y confianza | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-008 | [cycle-inference.js:305](../../src/cycle-inference.js) | test/body-phase.test.js :: cuerpo ciclo conserva precedencia fases y desconocido tardio | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-009 | [cycle-inference.js:126](../../src/cycle-inference.js) | test/body-summary.test.js :: cuerpo ciclo conserva resumen sangrado segmentos y outliers | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-010 | [cycle-inference.js:180](../../src/cycle-inference.js) | test/body-distribution.test.js :: cuerpo ciclo conserva distribucion escalas bins y picos | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-011 | [cycle-inference.js:518](../../src/cycle-inference.js) | test/body-timeline.test.js :: cuerpo ciclo conserva recalculo timeline duplicados y timestamps | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-012 | [cycle-inference.js:443](../../src/cycle-inference.js) | test/body-guidance.test.js :: cuerpo ciclo conserva guia insights provisionalidad y textos | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-013 | [PerfilScreen.jsx:1](../../src/PerfilScreen.jsx) | test/body-consumers.test.js :: cuerpo ciclo consumidores conservan confianza limites y cautela | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-014 | [app-utils.js:85](../../src/app-utils.js) | test/body-trend.test.js :: cuerpo peso conserva regresion tendencia y callbacks de objetivos | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-015 | [app-utils.js:41](../../src/app-utils.js) | test/body-creatine.test.js :: cuerpo peso conserva creatina saturacion y edicion de objetivo | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-016 | [app-utils.js:57](../../src/app-utils.js) | test/body-retention.test.js :: cuerpo peso conserva retencion detrending umbral y cap | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-017 | [alerts.js:28](../../src/alerts.js) | test/body-metrics.test.js :: cuerpo peso conserva medias correcciones tendencia y proyeccion | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-018 | [alerts.js:143](../../src/alerts.js) | test/body-alerts.test.js :: cuerpo avisos conservan fatiga textos umbrales y claves | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-019 | [DashboardScreen.jsx:1](../../src/DashboardScreen.jsx) | test/body-dashboard.test.js :: cuerpo metricas y diario conservan selectores y formatos | Ejecutada sobre original; baseline y revisión de aserciones |
| FR-020 | [FitTrack.jsx:1](../../src/FitTrack.jsx) | test/body-compatibility.test.js :: cuerpo consumidores conservan fachadas fotos y contratos previos | Ejecutada sobre original; baseline y revisión de aserciones |

## Criterios medibles de aceptación

- SC-001: 20 FR y 20 escenarios con una fila de trazabilidad cada uno, sin IDs huérfanos ni duplicados.
- SC-002: Antes de modificar src, caracterizar los 40 IDs sobre BASE; fijar nombres, aserciones y hashes de pins en el plan aprobado. No convertir lectura de texto fuente en prueba funcional.
- SC-003: Tras cada entrega, ejecutar pruebas relevantes; al cierre suite Node, Chromium, build, contratos completos 001–005 y RLS real local desechable con guardas y limpieza, según plan aprobado.
- SC-004: Conservar los 40 archivos congelados de 004 y cualquier baseline nueva; comprobar fronteras transitivas sin React/DOM/Supabase en cálculos nuevos. No hay objetivo de rendimiento ni cobertura porcentual inventados.
- SC-005: Cero IDs pending/partial al presentar PR de código; revisión de aserciones y convergencia sin gaps. Publicación, merge y despliegue requieren su autorización específica.

## Out of Scope

Cambiar algoritmos, umbrales, consejo clínico, fuentes de evidencia, valores numéricos
aceptados o textos de salud; introducir filtros uniformes por sexo; corregir los
hallazgos BODY; rediseñar interfaz o accesibilidad transversal (006); cambiar
formatos persistidos, fotos, identidad, sincronización, SQL/RLS o dependencias
sin una necesidad y decisión separadas. No se usarán credenciales ni datos reales.

## Compatibilidad temporal

Los hallazgos BODY-001–005 del [survey](../../docs/sdd/cuerpo-ciclo-survey.md)
son observaciones por lectura, pendientes de reproducción. No se declaran todos
defectos. Se propone conservarlos para esta extracción y revisar cada uno al
cierre M6; una corrección posterior tendrá CHANGE separado y aprobación explícita.

## Clarificaciones

### Sesión 2026-10-18

- C-001 [APROBADA]: ¿Incluir registros, motor y consumidores necesarios descritos, preservando las áreas dueñas 001–004? Recomendación: sí; permite una frontera completa sin trasladar reglas compartidas fuera del inventario.
- C-002 [APROBADA]: ¿Conservar las diferencias numéricas, temporales, de borrador, visibilidad y claves BODY-001–005, separando correcciones? Recomendación: sí; evita cambios silenciosos durante extracción. Revisar al cierre M6.
- C-003 [APROBADA]: ¿Preservar fórmulas, textos, confianza, desconocidos y provisionalidad actuales, sin validar clínicamente ni introducir consejo o fuentes nuevos? Recomendación: sí.

Decisión: alcance y las tres recomendaciones aprobados mediante «continua» el
2026-10-18, en respuesta directa a la solicitud conjunta de aprobación.
Esto permite preparar el plan; su ejecución requiere aprobación separada.

## Traceability

Archivo, prueba prevista y tarea se enumeran en el plan propuesto. PENDING
indicaba ausencia de ejecución en planificación; E0 ya cruzó los nombres con resultados reales.

| FR o escenario | Historia | Resultado | Archivo :: prueba | Tarea | Estado/evidencia |
| --- | --- | --- | --- | --- | --- |
| FR-001 | US1 | guardar un peso | test/body-weight.test.js :: cuerpo peso conserva conversiones reemplazo pasos e historial | T002 | Completo en E0; baseline |
| FR-002 | US1 | registrar medidas | test/body-measurements.test.js :: cuerpo medidas conservan campos null conversiones y reemplazo | T003 | Completo en E0; baseline |
| FR-003 | US1 | registrar bienestar | test/body-wellness.test.js :: cuerpo bienestar conserva borrador fecha guardas y guardado | T004 | Completo en E0; baseline |
| FR-004 | US1 | guardar check-in y conservar legado | test/body-logs.test.js :: cuerpo checkin conserva normalizacion identidad timestamps y legado | T005 | Completo en E0; baseline |
| FR-005 | US1 | abrir el registro correcto | test/body-routing.test.js :: cuerpo conserva seccion fecha montaje y visibilidad | T006 | Completo en E0; baseline |
| FR-006 | US2 | reconstruir contexto de ciclo | test/body-context.test.js :: cuerpo ciclo conserva comienzos longitudes y contexto | T007 | Completo en E0; baseline |
| FR-007 | US2 | estimar ovulación con procedencia | test/body-ovulation.test.js :: cuerpo ciclo conserva ovulacion flujo calendario y confianza | T008 | Completo en E0; baseline |
| FR-008 | US2 | inferir fase e incertidumbre | test/body-phase.test.js :: cuerpo ciclo conserva precedencia fases y desconocido tardio | T009 | Completo en E0; baseline |
| FR-009 | US2 | resumir ciclos y segmentos | test/body-summary.test.js :: cuerpo ciclo conserva resumen sangrado segmentos y outliers | T010 | Completo en E0; baseline |
| FR-010 | US2 | distribuir síntomas | test/body-distribution.test.js :: cuerpo ciclo conserva distribucion escalas bins y picos | T011 | Completo en E0; baseline |
| FR-011 | US2 | recalcular y construir timeline | test/body-timeline.test.js :: cuerpo ciclo conserva recalculo timeline duplicados y timestamps | T012 | Completo en E0; baseline |
| FR-012 | US2 | consultar guía y lecturas | test/body-guidance.test.js :: cuerpo ciclo conserva guia insights provisionalidad y textos | T013 | Completo en E0; baseline |
| FR-013 | US2 | ver ciclo en sus consumidores | test/body-consumers.test.js :: cuerpo ciclo consumidores conservan confianza limites y cautela | T014 | Completo en E0; baseline |
| FR-014 | US3 | consultar tendencia bruta | test/body-trend.test.js :: cuerpo peso conserva regresion tendencia y callbacks de objetivos | T015 | Completo en E0; baseline |
| FR-015 | US3 | consultar ajuste de creatina | test/body-creatine.test.js :: cuerpo peso conserva creatina saturacion y edicion de objetivo | T016 | Completo en E0; baseline |
| FR-016 | US3 | estimar retención lútea | test/body-retention.test.js :: cuerpo peso conserva retencion detrending umbral y cap | T017 | Completo en E0; baseline |
| FR-017 | US3 | consultar peso suavizado y proyección | test/body-metrics.test.js :: cuerpo peso conserva medias correcciones tendencia y proyeccion | T018 | Completo en E0; baseline |
| FR-018 | US3 | interpretar avisos de cuerpo y fatiga | test/body-alerts.test.js :: cuerpo avisos conservan fatiga textos umbrales y claves | T019 | Completo en E0; baseline |
| FR-019 | US3 | consultar métricas y diario de cuerpo | test/body-dashboard.test.js :: cuerpo metricas y diario conservan selectores y formatos | T020 | Completo en E0; baseline |
| FR-020 | US3 | mantener integraciones previas | test/body-compatibility.test.js :: cuerpo consumidores conservan fachadas fotos y contratos previos | T021 | Completo en E0; baseline |
| US1-AS1 | US1 | guardar un peso | test/body-weight.test.js :: cuerpo peso conserva conversiones reemplazo pasos e historial | T002 | Completo en E0; baseline |
| US1-AS2 | US1 | registrar medidas | test/body-measurements.test.js :: cuerpo medidas conservan campos null conversiones y reemplazo | T003 | Completo en E0; baseline |
| US1-AS3 | US1 | registrar bienestar | test/body-wellness.test.js :: cuerpo bienestar conserva borrador fecha guardas y guardado | T004 | Completo en E0; baseline |
| US1-AS4 | US1 | guardar check-in y conservar legado | test/body-logs.test.js :: cuerpo checkin conserva normalizacion identidad timestamps y legado | T005 | Completo en E0; baseline |
| US1-AS5 | US1 | abrir el registro correcto | test/body-routing.test.js :: cuerpo conserva seccion fecha montaje y visibilidad | T006 | Completo en E0; baseline |
| US2-AS1 | US2 | reconstruir contexto de ciclo | test/body-context.test.js :: cuerpo ciclo conserva comienzos longitudes y contexto | T007 | Completo en E0; baseline |
| US2-AS2 | US2 | estimar ovulación con procedencia | test/body-ovulation.test.js :: cuerpo ciclo conserva ovulacion flujo calendario y confianza | T008 | Completo en E0; baseline |
| US2-AS3 | US2 | inferir fase e incertidumbre | test/body-phase.test.js :: cuerpo ciclo conserva precedencia fases y desconocido tardio | T009 | Completo en E0; baseline |
| US2-AS4 | US2 | resumir ciclos y segmentos | test/body-summary.test.js :: cuerpo ciclo conserva resumen sangrado segmentos y outliers | T010 | Completo en E0; baseline |
| US2-AS5 | US2 | distribuir síntomas | test/body-distribution.test.js :: cuerpo ciclo conserva distribucion escalas bins y picos | T011 | Completo en E0; baseline |
| US2-AS6 | US2 | recalcular y construir timeline | test/body-timeline.test.js :: cuerpo ciclo conserva recalculo timeline duplicados y timestamps | T012 | Completo en E0; baseline |
| US2-AS7 | US2 | consultar guía y lecturas | test/body-guidance.test.js :: cuerpo ciclo conserva guia insights provisionalidad y textos | T013 | Completo en E0; baseline |
| US2-AS8 | US2 | ver ciclo en sus consumidores | test/body-consumers.test.js :: cuerpo ciclo consumidores conservan confianza limites y cautela | T014 | Completo en E0; baseline |
| US3-AS1 | US3 | consultar tendencia bruta | test/body-trend.test.js :: cuerpo peso conserva regresion tendencia y callbacks de objetivos | T015 | Completo en E0; baseline |
| US3-AS2 | US3 | consultar ajuste de creatina | test/body-creatine.test.js :: cuerpo peso conserva creatina saturacion y edicion de objetivo | T016 | Completo en E0; baseline |
| US3-AS3 | US3 | estimar retención lútea | test/body-retention.test.js :: cuerpo peso conserva retencion detrending umbral y cap | T017 | Completo en E0; baseline |
| US3-AS4 | US3 | consultar peso suavizado y proyección | test/body-metrics.test.js :: cuerpo peso conserva medias correcciones tendencia y proyeccion | T018 | Completo en E0; baseline |
| US3-AS5 | US3 | interpretar avisos de cuerpo y fatiga | test/body-alerts.test.js :: cuerpo avisos conservan fatiga textos umbrales y claves | T019 | Completo en E0; baseline |
| US3-AS6 | US3 | consultar métricas y diario de cuerpo | test/body-dashboard.test.js :: cuerpo metricas y diario conservan selectores y formatos | T020 | Completo en E0; baseline |
| US3-AS7 | US3 | mantener integraciones previas | test/body-compatibility.test.js :: cuerpo consumidores conservan fachadas fotos y contratos previos | T021 | Completo en E0; baseline |

## Aprobación

Alcance y C-001/C-002/C-003 aprobados el 2026-10-18 mediante «continua»,
en respuesta directa a la solicitud de aprobación de esta spec. Plan, tareas, analyze y ejecución local E0–E6 aprobados después mediante
«aprobado» el 2026-10-18. Publicación, integración y despliegue no autorizados.
