# Spec 004: nutrición y objetivos

Estado: ALCANCE APROBADO; plan e implementación pendientes. Fecha: 2026-10-18.
Constitución: [1.0.2](../../.specify/memory/constitution.md).
Evidencia de código: [survey](../../docs/sdd/nutricion-objetivos-survey.md).
BASE productiva: 2a7004277bd75d87fdf9746c90853b4c34eac044 (PR #9 integrado).

## Resultado de usuario e intención

Conservar registro de alimentos/recetas, objetivos y métricas/decisiones de ajuste
mientras se separan datos, cálculos, coordinación y presentación. Se medirá con
contratos ejecutados antes y después, no con una nueva recomendación nutricional.

## Alcance y restricciones

Operaciones alimentarias de Nutrición/Biblioteca, catálogo/unidades y su migración,
proteína, objetivos de Ajustes, adherencia, métricas nutricionales de Diario y
Métricas, aviso de ritmo y comparación real/esperado. Incluir consumidores y
fachadas necesarios; conservar los 22 pins congelados de 001/002/003.
No cambiar fórmulas, validaciones, redondeos, ventanas, textos de recomendación,
formatos persistidos ni momentos de actualización. Todos los FR son AS-IS.
Los parámetros citados describen software observado; no ratifican validez clínica.

## Historias y escenarios

### US1 — Registrar alimentos y recetas sin perder historial (P1)

Como usuario, quiero elegir alimentos y recetas, indicar cantidades y consultar mis comidas para conservar cantidades, macros e historial al refactorizar.

- US1-AS1: Dada la biblioteca y el catálogo, cuando añada, edite o elimine alimentos y cargue unidades antiguas, entonces se conservan catálogo, IDs, valores, orden y campos ajenos.
- US1-AS2: Dadas recetas e historial existentes, cuando cree o edite una receta y después cambie sus alimentos, entonces se conservan cantidades, porciones y snapshots ya guardados.
- US1-AS3: Dados catálogo, biblioteca y recientes, cuando busque o cambie de pestaña, entonces se conservan normalización, coincidencias, límites, deduplicación y orden observados.
- US1-AS4: Dado un alimento, una receta o una entrada anterior, cuando elija cantidad y comida y confirme por botón o Enter, entonces se conserva validación actual y formato de la entrada, y se restablece la navegación prevista.
- US1-AS5: Dadas comidas con distintas fechas y etiquetas, cuando cambie de día o quite una entrada, entonces se conservan totales, grupos, orden y todos los registros ajenos.

### US2 — Configurar objetivos y leer adherencia consistente (P1)

Como usuario, quiero mantener mis objetivos manuales o automáticos y la lectura de proteína para comparar resultados antes y después de la extracción.

- US2-AS1: Dados pesos y configuraciones de proteína, cuando calcule y reparta el objetivo, entonces se conservan clamps, etiquetas y suma exacta tras redondear.
- US2-AS2: Dados peso inicial, último peso, actividad y ritmo, cuando consulte la sugerencia y dirección, entonces se conservan referencias, fórmulas, redondeos y ausencias.
- US2-AS3: Dados objetivos manuales o automáticos, cuando monte Ajustes en perfil/datos y cambie entradas o peso, entonces solo se actualizan los campos y en los momentos del efecto actual.
- US2-AS4: Dado historial con días ausentes y proteína en fronteras, cuando consulte adherencia, entonces se conservan ventana, días registrados, redondeos y umbral.

### US3 — Entender métricas y decisiones de ajuste (P1)

Como usuario, quiero mantener las métricas y las acciones sobre avisos para entender cambios de objetivo sin perder decisiones ni resultados existentes.

- US3-AS1: Dados registros nutricionales y una tendencia de peso, cuando se calculen mantenimiento y aviso de proteína, entonces se conservan filtros, ventanas, mínimos y límites sin modificar la tendencia.
- US3-AS2: Dados registros y entrenamientos en fechas de frontera, cuando consulte Métricas, entonces se conservan series, promedios y reparto de macros con su tratamiento actual de ceros y fechas futuras.
- US3-AS3: Dados pesajes suficientes o insuficientes y un corte previo, cuando se evalúe el aviso de ritmo, entonces se conservan nulls, límites, redondeos y propuesta calórica.
- US3-AS4: Dado un aviso y campos adicionales de goals, cuando aplique, descarte y deshaga, entonces se conserva el corte persistido y se restaura el snapshot correspondiente sin perder otros campos.
- US3-AS5: Dados un objetivo e historial corto o largo, cuando compare real y esperado, entonces se conserva el ancla, la dirección y la proyección actual.
- US3-AS6: Dada la refactorización, cuando abra App, Cuenta, pantallas consumidoras y ambos previews y ejecute regresiones, entonces se conservan APIs y contratos anteriores.

## Requisitos funcionales

- FR-001 [AS-IS] Cuando se consulte el catálogo o se carguen/importen alimentos sin unidad, el sistema deberá conservar categorías, filas, valores por 100 unidades, orden, exports y resolución de unidad por nombre en lower-case, usando g como fallback.
- FR-002 [AS-IS] Cuando se añada, edite, copie del catálogo o elimine un alimento propio, el sistema deberá conservar IDs, campos ajenos, conversión numérica actual, unidad por defecto, orden por nombre y deduplicación del catálogo por nombre en lower-case, sin añadir deduplicación a las altas manuales.
- FR-003 [AS-IS] Cuando se construya, edite o elimine una receta, el sistema deberá conservar snapshots de ingredientes con IDs, cantidad/unidad y macros escalados/redondeados, suma por ingrediente, guardas actuales y conversión de porciones mediante Number(valor) || 1, sin recalcular historial ni recetas al cambiar la biblioteca.
- FR-004 [AS-IS] Cuando se busque qué registrar, el sistema deberá conservar normalización de alimento/receta/historial, búsqueda por lower-case/includes con consulta recortada, límites de catálogo y recientes, deduplicación de recientes por nombre, orden por fecha y navegación de las cuatro pestañas.
- FR-005 [AS-IS] Cuando se elija y guarde una cantidad, el sistema deberá conservar parseo de coma decimal, predicado amount > 0, steppers/atajos, escalado, selección de comida, fecha local, ID, round1 de macros y grams null para porc./ración, así como retorno desde cantidad/búsqueda y limpieza del estado tras guardar.
- FR-006 [AS-IS] Cuando se consulte un día o se quite una entrada, el sistema deberá conservar suma de macros, agrupación por comidas configuradas seguida de etiquetas extra y no asignadas, orden de registros, eliminación por ID, selección de fecha y datos de otros días.
- FR-007 [AS-IS] Cuando se calcule o reparta la proteína, el sistema deberá conservar configuración y overrides, clamp del valor por kg, conversiones y redondeos, etiquetas/repartos de cuatro o cinco comidas y ajuste de la última toma para sumar el objetivo redondeado.
- FR-008 [AS-IS] Cuando se calcule un objetivo, el sistema deberá conservar referencia startWeight o último peso, dirección, fallback de actividad, mantenimiento por factor, conversión de ritmo mediante 7700/7, redondeo calórico a diez y cálculo de proteína, con sus respuestas actuales para datos ausentes o no numéricos.
- FR-009 [AS-IS] Mientras Ajustes esté montado, el sistema deberá conservar ediciones manuales y automáticas de objetivos, tipos de valores, actualización funcional de campos, efecto autoMacros y sus dependencias/guardas, incluida su ejecución en section datos, sin mover el recálculo a un coordinador global.
- FR-010 [AS-IS] Cuando se consulte adherencia de proteína, el sistema deberá conservar ventana inclusiva de días locales hasta la fecha consultada, suma y redondeo por día registrado, umbral del 90 %, promedio y null sin objetivo o registros, sin convertir días ausentes en cero.
- FR-011 [AS-IS] Cuando se calculen mantenimiento inferido y proteína media o su aviso, el sistema deberá conservar ventanas y filtros actuales, días con kcal > 50 y mínimo de diez para mantenimiento, uso de la tendencia recibida, conversión calórica, redondeos y aviso de proteína por debajo del 85 %, manteniendo datos ajenos de alertMetrics/buildAlerts.
- FR-012 [AS-IS] Cuando Métricas muestre ingesta y objetivos de macros, el sistema deberá conservar serie calórica de catorce días, promedios y conteo de días registrados, ventanas actuales de macro14/entreno, remanente no negativo y reparto carbo/grasa ponderado por frecuencia, incluidos sus filtros de fechas y valores ausentes.
- FR-013 [AS-IS] Cuando se evalúe un aviso de ritmo, el sistema deberá conservar ventana de 21 días y corte paceCheckedAt, mínimo de puntos y span, regresión, redondeo de ritmo/drift, umbral, conversión, tope, suelo, redondeo a 50, prioridad de limitación y null si no cambia el objetivo.
- FR-014 [AS-IS] Cuando se aplique, descarte o deshaga el aviso de ritmo, el sistema deberá conservar cambios de kcalTarget/autoMacros y corte persistido paceCheckedAt, restauración del snapshot de esos tres campos y conservación de otros campos actuales, sin recalcular el snapshot al deshacer.
- FR-015 [AS-IS] Cuando se compare peso real con el objetivo, el sistema deberá conservar filtros, ancla móvil de 84 días, uso condicionado de startWeight, recta esperada, redondeos, sentido de adelanto y proyección con tendencia existente hasta 104 semanas, sin cambiar la inferencia de peso/ciclo que recibe.
- FR-016 [AS-IS] Cuando se separen responsabilidades compartidas, el sistema deberá conservar APIs, props y resultados de App, Cuenta, Diario, Métricas, Biblioteca, Nutrición y ambos previews, junto con contratos y pins de 001/002/003 y composición de las operaciones alimentarias en carga/importación.

## Evidencia AS-IS

Las referencias son de BASE, no un resultado de ejecución nuevo. No hay pins
004 escritos ni cobertura contractual completa declarada.

| FR | Código en BASE | Evidencia actual y límite |
| --- | --- | --- |
| FR-001 | src/FitTrack.jsx:51–110; src/app-data-lifecycle.js:18,60 | Tests de 001 prueban la coordinación de carga/importación; falta pin completo del catálogo/migración. |
| FR-002 | src/LibraryScreen.jsx:55–93,302–313 | CRUD alimentario funcional pendiente; los pins de rutinas 003 no lo sustituyen. |
| FR-003 | src/LibraryScreen.jsx:21–25,95–175,314–319; src/FitTrack.jsx:110 | Falta pin funcional de receta y conservación de snapshots. |
| FR-004 | src/NutritionScreen.jsx:20–73,225–255 | Solo inspección textual parcial de la navegación; falta interacción completa. |
| FR-005 | src/NutritionScreen.jsx:77–172,261–289 | test/ui-regressions.test.js inspecciona el campo y guardas; no demuestra guardado real. |
| FR-006 | src/NutritionScreen.jsx:233–235,272–fin | Falta pin de resumen, grupos y borrado funcional. |
| FR-007 | src/fase1Config.js:22–99 | computeProteinTargets calculates and clamps grams per kilogram; distributeProtein supports four and five meals; ampliar fronteras en E0. |
| FR-008 | src/settings-utils.js:5–33; src/SettingsScreen.jsx:21–31; src/app-config.js:1–35 | latestWeight returns the newest dated measurement; goalDirection classifies weight goals; goalSuggestion uses activity, weekly change and protein settings. |
| FR-009 | src/SettingsScreen.jsx:18–38,93–161; src/AccountScreen.jsx:59–90 | Falta pin funcional de efecto, secciones, cambio de peso y conservación de campos. |
| FR-010 | src/app-utils.js:122–141; src/NutritionScreen.jsx:235; src/DiarioScreen.jsx:194 | la adherencia de proteina solo cuenta los dias registrados; ampliar bordes y consumidores. |
| FR-011 | src/alerts.js:117–132,155–195 | Hay tests generales de avisos; falta pin específico de métricas nutricionales y entradas de frontera. |
| FR-012 | src/DashboardScreen.jsx:339–368 | Falta pin de cálculos y representación con ceros, fechas futuras y días sin registrar. |
| FR-013 | src/settings-utils.js:67–116 | Tests de settings-utils cubren umbral, datos insuficientes, tope, suelo y corte; faltan otras fronteras. |
| FR-014 | src/DiarioScreen.jsx:229–241 | Test textual de persistencia y tests puros del corte; falta recorrido funcional completo. |
| FR-015 | src/settings-utils.js:132–fin; src/DashboardScreen.jsx:280 | Tests real vs esperado de settings-utils; falta pin adicional de fronteras y consumidor. |
| FR-016 | src/FitTrack.jsx; src/AccountScreen.jsx; src/preview-main.jsx; preview/maqueta.jsx | Los gates previos no sustituyen un pin completo de compatibilidad de 004. |

## Criterios medibles de aceptación

- SC-001: 16 FR y 15 escenarios con filas individuales y pruebas completas ejecutadas; cero pending/partial antes del PR de código.
- SC-002: Todos los pins AS-IS pasan sobre BASE antes de modificar src y conservan sus aserciones/hashes durante las extracciones.
- SC-003: Gates completos 001/002/003 verdes, incluidos RLS desechable, suite, build y los 22 archivos de pins congelados.
- SC-004: Pins de cantidades, snapshots, CRUD, efectos de objetivos y aplicación/deshacer; recorridos Chromium de registro, biblioteca/recetas y objetivos/aviso, concretados en el plan.
- SC-005: Casos numéricos y de fechas de frontera deterministas, incluidas las diferencias documentadas; mutaciones controladas detectadas.
- SC-006: Cálculos nuevos sin React, DOM o Supabase transitivos; coordinación/presentación con dependencias explícitas y consumidores compatibles.
- SC-007: Sin alteraciones de catálogo, formatos, fórmulas, inferencia, SQL o dependencias productivas implícitas.
- SC-008: Converge sin gaps de implementación; defectos preservados y límites de evidencia visibles, sin cerrar KD-002 globalmente.

## Out of Scope

- Corregir NUTR-001/002/003 u otros DATA/IDEN/PHOTO/TRAIN sin CHANGE aprobado.
- Nuevas recomendaciones, validación clínica, bases de alimentos externas o nuevos objetivos.
- Inferencia de ciclo, retención, creatina, algoritmo de tendencia de peso y gráficos de cuerpo (005), salvo mantener sus entradas/APIs consumidas.
- Rutinas, series, timer o fórmulas de fuerza de 003; identidad, fotos, RLS y coordinación de persistencia de 001/002.
- Rediseño visual, accesibilidad global o eliminación general de código sin llamadores (006).
- Migraciones, conversión de datos guardados, backend real, publicación, fusiones o despliegues de esta área.

## Compatibilidad temporal

- NUTR-001, FR-002/003/005/008: preservar las guardas y conversiones numéricas observadas, incluida ausencia de comprobación de finitud en cantidad; reproducción controlada pendiente de E0.
- NUTR-002, FR-010/011/012: conservar ventanas y tratamiento desigual de registros futuros; no unificarlos al extraer.
- NUTR-003, FR-009: mantener autoMacros en el ciclo de montaje/actualización de Ajustes, también en section datos; no convertirlo en recálculo global.

Son observaciones de código, no garantías deseadas. Se revisarán al caracterizar
y en converge; una corrección requiere decisión CHANGE independiente.

## Clarificaciones

Sesión: 2026-10-18. El propietario respondió «Aprobar alcance y las tres aclaraciones».

- C-001 resuelta: preservar AS-IS; correcciones NUTR requieren CHANGE separado.
- C-002 resuelta: incluir consumidores, métricas y real/esperado; mantener fuera algoritmos de peso/ciclo de 005.
- C-003 resuelta: conservar fórmulas/textos actuales sin ratificación clínica ni dependencias o datos externos.

La aprobación autoriza preparar el plan técnico. No aprueba su ejecución anticipadamente.

## Traceability

Una fila por FR y escenario. Pruebas/tareas concretas propuestas en el
[plan de validación](validation-plan.md) y [tareas](tasks.md). PENDING es estado real de esta etapa documental;
el manifiesto no usa nombres de pruebas inexistentes como evidencia ejecutada.

| ID | Historia | Resultado | Prueba | Tarea | Estado |
| --- | --- | --- | --- | --- | --- |
| FR-001 | US1 | Preservar contrato observado | nutricion catalogo y migracion conservan valores y unidades | T002 | PENDING |
| FR-002 | US1 | Preservar contrato observado | nutricion alimentos conservan crud conversiones orden y deduplicacion | T003 | PENDING |
| FR-003 | US1 | Preservar contrato observado | nutricion recetas conservan ingredientes porciones y snapshots | T004 | PENDING |
| FR-004 | US1 | Preservar contrato observado | nutricion busqueda conserva fuentes limites recientes y navegacion | T005 | PENDING |
| FR-005 | US1 | Preservar contrato observado | nutricion cantidad conserva validacion escalado guardado y retorno | T006 | PENDING |
| FR-006 | US1 | Preservar contrato observado | nutricion diario nutricional conserva totales grupos fechas y borrado | T007 | PENDING |
| FR-007 | US2 | Preservar contrato observado | nutricion proteina conserva clamps reparto etiquetas y redondeos | T008 | PENDING |
| FR-008 | US2 | Preservar contrato observado | nutricion objetivos conservan referencia actividad direccion y sugerencia | T009 | PENDING |
| FR-009 | US2 | Preservar contrato observado | nutricion objetivos conservan edicion efecto automatico y montaje | T010 | PENDING |
| FR-010 | US2 | Preservar contrato observado | nutricion adherencia conserva ventana dias registrados y umbral | T011 | PENDING |
| FR-011 | US3 | Preservar contrato observado | nutricion alertas conservan mantenimiento proteina y otras metricas | T012 | PENDING |
| FR-012 | US3 | Preservar contrato observado | nutricion metricas conservan series medias ventanas y macros | T013 | PENDING |
| FR-013 | US3 | Preservar contrato observado | nutricion ritmo conserva guardas ventana limites y redondeos | T014 | PENDING |
| FR-014 | US3 | Preservar contrato observado | nutricion ritmo conserva aplicar descartar snapshot y deshacer | T015 | PENDING |
| FR-015 | US3 | Preservar contrato observado | nutricion real esperado conserva ancla direccion y proyeccion | T016 | PENDING |
| FR-016 | US3 | Preservar contrato observado | nutricion consumidores y previews conservan contratos y fachadas | T017 | PENDING |
| US1-AS1 | US1 | FR-001, FR-002 | nutricion catalogo y migracion conservan valores y unidades; nutricion alimentos conservan crud conversiones orden y deduplicacion | T002, T003 | PENDING |
| US1-AS2 | US1 | FR-003 | nutricion recetas conservan ingredientes porciones y snapshots | T004 | PENDING |
| US1-AS3 | US1 | FR-004 | nutricion busqueda conserva fuentes limites recientes y navegacion | T005 | PENDING |
| US1-AS4 | US1 | FR-005 | nutricion cantidad conserva validacion escalado guardado y retorno | T006 | PENDING |
| US1-AS5 | US1 | FR-006 | nutricion diario nutricional conserva totales grupos fechas y borrado | T007 | PENDING |
| US2-AS1 | US2 | FR-007 | nutricion proteina conserva clamps reparto etiquetas y redondeos | T008 | PENDING |
| US2-AS2 | US2 | FR-008 | nutricion objetivos conservan referencia actividad direccion y sugerencia | T009 | PENDING |
| US2-AS3 | US2 | FR-009 | nutricion objetivos conservan edicion efecto automatico y montaje | T010 | PENDING |
| US2-AS4 | US2 | FR-010 | nutricion adherencia conserva ventana dias registrados y umbral | T011 | PENDING |
| US3-AS1 | US3 | FR-011 | nutricion alertas conservan mantenimiento proteina y otras metricas | T012 | PENDING |
| US3-AS2 | US3 | FR-012 | nutricion metricas conservan series medias ventanas y macros | T013 | PENDING |
| US3-AS3 | US3 | FR-013 | nutricion ritmo conserva guardas ventana limites y redondeos | T014 | PENDING |
| US3-AS4 | US3 | FR-014 | nutricion ritmo conserva aplicar descartar snapshot y deshacer | T015 | PENDING |
| US3-AS5 | US3 | FR-015 | nutricion real esperado conserva ancla direccion y proyeccion | T016 | PENDING |
| US3-AS6 | US3 | FR-016 | nutricion consumidores y previews conservan contratos y fachadas | T017 | PENDING |

## Aprobación

El 2026-10-18 el propietario respondió «Aprobar alcance y las tres aclaraciones»
a la propuesta de 16 FR AS-IS y 15 escenarios. Alcance y C-001/002/003 aprobados.
Plan, tareas, analyze, implementación e integración sujetos a sus puertas posteriores.
