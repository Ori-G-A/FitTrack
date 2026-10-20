# Survey 005: Cuerpo y ciclo

Fecha: 2026-10-18. BASE: 02ab5193f9d01e0037e9640626b25742e5224a5a.
Estado: lectura de código y propuesta, sin baseline ejecutada para 005.
[Spec](../../specs/005-cuerpo-ciclo/spec.md), [checklist](../../specs/005-cuerpo-ciclo/checklist.md),
[constitución](../../.specify/memory/constitution.md).

## Responsabilidades y consumidores

| Fuente | Responsabilidad observada | Consumidores y frontera |
| --- | --- | --- |
| [BodyScreen](../../src/BodyScreen.jsx) | Formularios de peso, medidas, bienestar y check-in; gráficos, resúmenes, creatina; fotos adyacentes | App abre con fecha/sección; operaciones de fotos siguen en 002 |
| [cycle-inference](../../src/cycle-inference.js) | Normalización, comienzos/contexto, ovulación, fase/confianza, resumen/segmentos, distribución, guía e insights | Cuerpo, Perfil, Dashboard, Training, alerts; hoy importa fechas desde app-utils |
| [app-utils](../../src/app-utils.js) | Creatina, retención, regresión/tendencia, pasos y entradas de cuerpo en dayFeed | Cuerpo, Dashboard, Diario, alerts y callbacks de goals-model/settings-utils 004; contiene también acceso DOM |
| [alerts](../../src/alerts.js) | Medias de peso, correcciones, proyección y avisos compartidos | Dashboard/App; preservar nutrición 004 y fatiga de entrenamiento 003 |
| [DashboardScreen](../../src/DashboardScreen.jsx) | Series de peso, cambio a siete días, diferencias de medidas y resumen de ciclo | Composición de Métricas; línea objetivo distinta de weightVsExpected 004 |
| [PerfilScreen](../../src/PerfilScreen.jsx) | Sexo, guía/resumen de ciclo y navegación a check-in | AppAccount lo compone junto con Settings 004 |
| [TrainingScreen](../../src/TrainingScreen.jsx) | Cautela fértil/ovulación con confianza no baja | No recibe goals/sex; no imponer filtro nuevo |
| [app-config](../../src/app-config.js) | tracksCycle, colores y agrupación de fases | App/Cuerpo/Perfil/Dashboard/alerts; facades y valores a preservar |
| [FitTrack](../../src/FitTrack.jsx) | Rutas cuerpo/peso/medidas/nota/checkin, fecha enfocada, key por pestaña, colecciones/setters | Diario/Plan y ambas previews deben mantener navegación y firmas |

Hay una frontera pura pendiente: cycle-inference depende transitivamente de
app-utils, que contiene acceso DOM. El plan decidirá cómo aislarla y verificarla;
esta propuesta no elige todavía módulos ni cambia dependencias.

## Comportamientos que requieren pins

Peso convierte coma y rechaza por falsedad; medidas/bienestar usan Number con
vacío a null. Los reemplazos por fecha no son merges, y los IDs de peso,
medidas y bienestar se regeneran. El check-in conserva ID y createdAt, actualiza
updatedAt y mantiene campos adicionales por spread. La lista declarada de
campos menstruales no implica que se eliminen campos desconocidos.

El motor distingue sangrado claro, spotting, ausencia explícita y dato sin
registrar. Contexto usa longitudes 18–45 y fallback 28; ovulación distingue flujo
de calendario con resta de 14 días. La fase depende del orden de reglas, días
posteriores, síntomas y confirmación reciente, con desconocido tardío explícito.
Las inferencias retrospectivas pueden utilizar registros posteriores a la fecha
consultada. Recalcular y construir timeline no tienen E/S, pero crean timestamps
y presentan distinta selección de duplicados según operación.

Las tendencias no son intercambiables: tendencia bruta positiva con ventana
acotada; medias móviles de avisos con correcciones de creatina/retención y
ventanas que admiten futuros; línea objetivo de Dashboard distinta de la
proyección de 004. La retención exige muestras por fase, detrending, umbral y
cap. Los consumidores aplican diferentes condiciones de visibilidad y mínimos.

## Hallazgos temporales

Observados por lectura, sin reproducción nueva ni calificación clínica.
Se propone conservarlos en 005 y revisarlos al cierre M6; cualquier corrección
necesita CHANGE explícito, aceptación y prueba que falle antes del cambio.

| ID | Observación | FR afectados | Revisión |
| --- | --- | --- | --- |
| BODY-001 | Guarda de peso permite negativos/Infinity; medidas/bienestar no normalizan coma y pueden conservar cero/NaN. No son validaciones equivalentes | FR-001/002/003 | M6; decidir corrección separada |
| BODY-002 | Borrador de bienestar se hidrata solo al cambiar fecha; check-in también al cambiar el objeto existente | FR-003/004 | M6; reproducir tiempos antes de extraer |
| BODY-003 | Visibilidad por sexo/datos varía; cambiar sexo no reinicia sección de Cuerpo; Training no recibe sexo; cálculos pueden ejecutarse aunque no se muestren | FR-005/013 | M6; no prometer supresión universal |
| BODY-004 | buildAlerts retorna antes de asignar claves si ciclo está desactivado | FR-018 | M6; corrección como CHANGE |
| BODY-005 | Hay evidencia posterior/futura, selección first/last de duplicados y ventanas/proyecciones distintas entre consumidores | FR-006/007/008/011/012/014/017/019 | M6; distinguir intención y defecto con reproducción |

Estos hallazgos también quedan enlazados desde el roadmap; no se amplía el
alcance con cambios numéricos o de producto implícitos.

## Pruebas existentes y límites

- [cycle-inference.test.js](../../test/cycle-inference.test.js): casos como
  «clear menstrual bleeding estimates menstruation», «spotting does not restart a cycle»,
  «recalculation reclassifies days before a newly logged period»,
  «sin dos ciclos completos la guia se marca como orientativa» y
  «no afirma lútea tardía cuando el periodo pudo llegar sin registrarse».
  No cubren todo el contrato de normalización, precedencias ni consumidores.
- [app-utils.test.js](../../test/app-utils.test.js): pendiente, tendencia,
  retención, pasos y dayFeed. El caso de perfil hombre examina métricas/avisos;
  no demuestra todas las pantallas. El caso de claves estables no cubre el
  retorno temprano sin ciclo.
- [ui-regressions.test.js](../../test/ui-regressions.test.js): inspección de
  texto fuente, insuficiente para afirmar hidratación de borradores, guardado
  y navegación reales. Harán falta interacciones con React/Chromium según plan.
- Contratos completos 001–004 y los 40 archivos congelados en
  [baseline 004](../../specs/004-nutricion-objetivos/evidence/baseline.json)
  son regresiones obligatorias; no sustituyen pins de 005.

No se ejecutó suite ni se capturaron hashes nuevos en este survey documental.
La revisión de nombres y aserciones, baseline sobre original y fronteras
transitivas corresponde a un plan separado tras aprobar este alcance.

## Siguiente puerta

Aprobar alcance y C-001/002/003 de la spec. Después preparar plan, tareas,
research, validación y analyze para revisión separada; no iniciar extracción ni
publicar o integrar código a partir de esta propuesta.
