# Plan técnico — 004-nutricion-objetivos

Estado: APROBADO para ejecución local E0–E5 el 2026-10-18.
Alcance aprobado el 2026-10-18 en 1de618b. [Spec](spec.md), [research](research.md),
[validación](validation-plan.md), [tareas](tasks.md), [revisión](analyze.md).
BASE productiva: 2a7004277bd75d87fdf9746c90853b4c34eac044. Los commits documentales
posteriores no cambian src. No hay CHANGE ni permiso de integración/despliegue.

## Puertas y secuencia

G-DOC: aprobación del propietario de este plan, tareas y analyze; preparar el
[PR documental](doc-pr.md). Ejecución local antes de su integración solo si el
propietario la autoriza expresamente. La preparación no declara un PR publicado.

E0 / G-PIN: instrumentación que invoque componentes y funciones originales,
16 grupos de pins, tres recorridos Chromium, mutaciones y negativos. Revisar
31 filas completas; ejecutar sobre src idéntico a BASE y registrar revisiones,
hashes, versiones y resultados. Prohibido iniciar E1 sin baseline verde.
Las pruebas no deben copiar algoritmos del producto al harness.

E1: separar catálogo, unidades y proteína; mantener fachadas y valores exactos.
E2: normalización, selectores y transformaciones alimentarias; integrar Biblioteca
y Nutrición preservando snapshots, IDs y cuándo se consulta el estado.
E3: separar objetivos y acciones del aviso; mantener montaje y dependencias del
efecto autoMacros en SettingsScreen y la inferencia de peso existente.
E4: extraer métricas nutricionales; integrar app-utils, alerts, Diario y Dashboard
sin modificar otros avisos, tendencia, ciclo ni entrenamiento.
E5 / G-CLOSE: límites de capas, manifiesto completo, CI extendido y converge;
preparar PR de código solo con 31/31 contratos y gates previos completos.

Cada E1–E4 exige pins de su grupo, suite Node completa, build, hashes congelados
y recorridos de navegador afectados antes de la siguiente entrega. Cada entrega
tiene commit independiente. Rollback revierte código, sin migraciones de datos.
Un checkpoint fallido se repite íntegro tras corregirlo.

## Fronteras propuestas

| Archivo nuevo | Responsabilidad y dependencias permitidas |
| --- | --- |
| src/nutrition-config.js | Catálogo/categorías/unidades exactos y resolución por nombre; sin E/S |
| src/nutrition-protein.js | PROTEIN_CONFIG, computeProteinTargets y distributeProtein; módulo puro, fachada fase1Config conservada |
| src/nutrition-model.js | fromFood/fromRecipe/fromEntry, búsquedas/recientes, agrupaciones, sumas y escalado; solo datos y fechas puras |
| src/nutrition-records.js | CRUD de alimentos/recetas/entradas y migración de unidades; recibe ID y contexto, sin leer React/DOM/backend |
| src/goals-model.js | latestWeight, dirección, sugerencia, aviso y real/esperado; constantes puras, date-utils y callbacks de inferencia explícitos |
| src/goals-operations.js | Parches de objetivos y acciones aplicar/descartar/deshacer; snapshot separado del estado actual |
| src/nutrition-metrics.js | Adherencia, mantenimiento/proteína media, series y macros; tendencia y fecha recibidas, sin importar alerts/app-utils |

Los nombres son decisiones técnicas propuestas; si la caracterización muestra
que una extracción no separa responsabilidad, documentar ajuste sin ampliar FR.
Mantener exports públicos de FitTrack (CATALOG/CATALOG_CATS/round1/scaleFood),
fase1Config, settings-utils y app-utils, y sus imports para usos internos.
Revisar llamadores de round1 y scaleFood; un helper compartido mínimo puro solo
si hace falta romper ciclos, manteniendo expresión, coerciones y fachada.

SettingsScreen conserva el efecto autoMacros y sus dependencias, sección datos
incluida. No se crea un efecto global ni se añade un hook solo por mover líneas.
Diario conserva la captura de tres campos anterior al updater y restaura sobre
el estado actual. Biblioteca conserva deduplicación desde el snapshot actual,
uid dentro/fuera del updater según origen y merges de campos desconocidos.

settings-utils mantiene la composición con slopePerDay/weightTrendHighlight
existentes. Inyectar funciones en goals-model y llamarlas en el mismo punto
tras las guardas actuales; no calcular anticipadamente ni copiar sus algoritmos.
alerts sigue siendo dueño de la tendencia y otros avisos; pasa su resultado a
nutrition-metrics. Nuevos módulos puros no importan app-utils ni FitTrack ni
React/DOM/Supabase, tampoco transitivamente. date-utils se reutiliza sin cambiar
fechas locales. No mover los algoritmos de peso/ciclo de 005.

## Entorno, pruebas y cierre

Reutilizar esbuild/jsdom/Playwright/fake-supabase instalados; instrumentación
limitada al build de pruebas para invocar handlers y capturar resultados reales.
Fixtures sintéticos, fecha local e IDs controlados, cleanup de roots/efectos/relojes.
Interacciones críticas se prueban tanto con React real como con Chromium.
Sin red externa ni .env.local. No nuevas dependencias, SQL ni auditoría necesaria.

Comandos previstos con Node 24.21.0 y pnpm 11.11.0: pnpm exec node --version;
pnpm test; pnpm run build; pnpm test:browser; pnpm run test:sdd:complete --spec=004-nutricion-objetivos.
Los gates previos se seleccionan análogamente para 001-datos, 002-identidad-fotos
y 003-entrenamiento. Renovar pnpm test:rls en fixture desechable para 002,
con guardas locales y limpieza; no reemplazarlo por inspección SQL.
CI incorpora el gate 004 conservando todos los anteriores.

Congelar nuevos pins solo tras G-PIN y verificar los 22 anteriores contra baseline
003. Evidencia final incluye mismo hash de src, resultados TAP/JSON, cero pruebas
omitidas/reintentadas, revisión de aserciones, build y límites de arquitectura.
plannedTests no equivale a tests ejecutados. KD-002 sigue para el resto del proyecto.
NUTR-001/002/003 se reproducen y preservan; discrepancias de caracterización se
documentan antes de extraer y cualquier cambio de conducta necesita CHANGE.

## Estado de ejecución

E0–E5 y T029 verificadas localmente; cierre RLS renovado y gate 002 repetido
íntegramente. [Converge final](converge.md), [evidencia](evidence/final.json).
La ejecución local previa al merge documental fue autorizada en 5b5fb83.
Revisión del propietario e integración pendientes.
