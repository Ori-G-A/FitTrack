# Survey de nutrición y objetivos — 004

Fecha: 2026-10-18. BASE: `2a7004277bd75d87fdf9746c90853b4c34eac044`.
Estado: inventario para propuesta de alcance; no autoriza extracción.
Gobierno: [constitución](../../.specify/memory/constitution.md).
[Propuesta](../../specs/004-nutricion-objetivos/spec.md).

## Resultado y frontera

Registrar cantidades y recetas, conservar historial, configurar objetivos y
entender métricas/avisos con los mismos datos y resultados al separar lógica y UI.
El área atraviesa Nutrición, Biblioteca, Ajustes, Diario y Métricas. No equivale
a mover únicamente NutritionScreen. Los valores observados son software actual;
el survey no valida científicamente recomendaciones ni propone nuevas fórmulas.

## Inventario y consumidores

| Responsabilidad | Implementación en BASE | Consumidores y límite |
| --- | --- | --- |
| Catálogo, unidades, escalado y redondeo | src/FitTrack.jsx:51–110 | NutritionScreen, LibraryScreen y src/preview-main.jsx; conservar exports y datos exactos |
| Migración de unidad ausente | src/FitTrack.jsx:108–109 | Carga/importación vía app-data-lifecycle.js; no alterar coordinación 001 |
| Selección normalizada alimento/receta/historial | src/NutritionScreen.jsx:20–73,239–255 | Cuatro pestañas, búsqueda, recientes por nombre y límites 20/60 |
| Cantidad, guardado, resumen y borrado | src/NutritionScreen.jsx:77–172,225–fin | Fecha local, comida, unidades, gramos/null, round1 y snapshots |
| Alimentos y recetas | src/LibraryScreen.jsx:21–25,55–176,302–319 | Alta/edición/borrado; recetas guardan macros y cantidades por ingrediente, sin vínculo vivo al alimento |
| Proteína y reparto | src/fase1Config.js:22–99 | SettingsScreen, NutritionScreen, settings-utils y pruebas de compatibilidad 003 |
| Adherencia | src/app-utils.js:122–141 | Nutrición y Diario; días registrados, redondeo diario y corte de 90 % |
| Objetivo y referencia de peso | src/settings-utils.js:5–33; src/SettingsScreen.jsx:18–38 | App lee latestWeight; AccountScreen monta Ajustes en perfil y datos |
| Aviso de ritmo | src/settings-utils.js:67–116 | Diario; ventana/corte, regresión, umbral, tope, suelo y redondeos |
| Aplicar/descartar/deshacer | src/DiarioScreen.jsx:229–241 | Cambios de goals y snapshot de tres campos; corte paceCheckedAt persistido |
| Mantenimiento y proteína media | src/alerts.js:117–132,155–195 | Métricas y Diario comparten alertMetrics/buildAlerts; reciben tendencia calculada con el ciclo actual |
| Gráficos, medias y objetivos de macros | src/DashboardScreen.jsx:339–368 | kcal 14 días, macro14, días de entreno, reparto carbo/grasa |
| Real frente a esperado | src/settings-utils.js:132–fin; src/DashboardScreen.jsx:280 | Interpretación del objetivo, ancla de 84 días y proyección; usa tendencia existente |

`FoodCombo`, `AmountField` y `LIQUID_MEASURES` solo aparecen como declaraciones
o dentro de esas funciones en FitTrack al buscar sus llamadores. No se extraen
ni eliminan por inferir que son legacy; el plan deberá registrar cualquier decisión.
`round1` también tiene implementaciones locales en alerts y Dashboard: compartir
un nombre no autoriza unificar redondeos o cambiar el momento de redondear.

## Comportamientos que deben fijarse antes de extraer

- Buscar no elimina diacríticos; usa lower-case/includes y trim de consulta.
  Recientes deduplica nombres en lower-case, ordena por fecha y corta a 20 antes
  del filtro de búsqueda. El catálogo de Nutrición corta a 60 después de filtrar.
- Registro exige `Number(qty.replace(',', '.')) > 0`; ese predicado no exige
  finitud. Recetas e ingredientes usan otras guardas. No endurecerlas sin CHANGE.
- Una receta y una entrada nutricional son snapshots. Cambiar/eliminar un alimento
  no recalcula las recetas ni el historial. Conservar campos ajenos al editar.
- Al guardar una entrada, los gramos son null para `porc.` y `ración`; los macros
  se redondean a una cifra. Guardar una receta convierte porciones con Number || 1.
- La suma de proteína diaria se redondea antes de evaluar adherencia; la última
  comida absorbe la diferencia de redondeo del reparto.
- El efecto autoMacros vive en SettingsScreen y puede ejecutarse aun cuando
  section sea datos; no es un coordinador global que siga el peso permanentemente.
- Adherencia filtra desde hoy−6 hasta hoy; proteína media de alertMetrics desde
  hoy−7 sin techo de fecha; macro14 desde hoy−13 sin techo. No homogeneizar ventanas.
- El aviso de ritmo usa >=8 pesajes, span >=17 días, ventana 21 y corte persistido;
  compara drift redondeado contra 0,15, limita a ±300, redondea a 50 y aplica suelo.
  La prioridad de la etiqueta floor/step también se conserva como software.
- Deshacer ritmo restaura kcalTarget/autoMacros/paceCheckedAt del snapshot,
  preservando otros campos actuales; no sustituir por un nuevo cálculo.

## Cobertura actual y faltantes

Pruebas leídas, no ejecutadas de nuevo por este cambio documental:

- test/fase1-config.test.js: `computeProteinTargets calculates and clamps grams per kilogram`,
  `distributeProtein supports four and five meals`,
  `el reparto de proteína suma el objetivo y ninguna toma se queda corta`.
- test/settings-utils.test.js: latestWeight, goalDirection, goalSuggestion,
  fronteras del aviso de ritmo y ancla/proyección real frente a esperado.
- test/app-utils.test.js: `la adherencia de proteina solo cuenta los dias registrados`,
  `las comidas del día salen del reparto elegido, no de una lista fija`, avisos/claves.
- test/ui-regressions.test.js inspecciona fuente para cantidad y persistencia del
  aviso; no demuestra interacciones ni cleanup del efecto de objetivos.
- 001 conserva carga/importación/guardado de las cuatro colecciones y 003 monta
  App/previews/Biblioteca. Eso no certifica los contratos nuevos de 004.

Faltan pins funcionales completos de cantidades, recetas, snapshots, CRUD,
autoMacros por montaje/sección, aplicación/deshacer y ventanas de métricas,
recorridos Chromium y mutaciones específicas. El manifiesto 004 empieza pending.

## Fronteras propuestas para aprobar

1. Preservar AS-IS, incluidos los comportamientos numéricos y temporales observados.
2. Incluir cálculo de objetivos, métricas nutricionales y comparación con el objetivo.
   Mantener como entradas/dependencias las tendencias y fases existentes de 005;
   no reescribir inferencia, corrección de agua, creatina ni gráficos de cuerpo.
3. Incluir solo operaciones alimentarias de Biblioteca y efectos de objetivos en
   Ajustes/Diario; proteger rutinas, datos/fotos/identidad y los 22 pins congelados.

## Seguimientos

- NUTR-001: validación numérica desigual y falta de comprobación de finitud.
  Observado por lectura; reproducción funcional controlada pendiente de E0.
- NUTR-002: algunas métricas incluyen fechas futuras y sus ventanas no coinciden.
  Observado por lectura; no unificarlas como parte de una extracción.
- NUTR-003: autoMacros se recalcula al montar/actualizar Ajustes, también en datos.
  Reproducción funcional pendiente; no moverlo a un efecto global sin CHANGE.

No se modifica src, SQL, dependencias ni despliegues durante este survey.
