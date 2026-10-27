# Validación propuesta — 009

Estado: nombres y archivos previstos; plan aún no aprobado. Todos los tests del
[manifiesto](traceability.json) ejecutados siguen vacíos/pending. Los siguientes
casos nuevos no existen todavía. Los seis nombres heredados ya pertenecen a
contratos aprobados y conservarán sus aserciones.

## Casos propios previstos

| Nombre exacto | Archivo previsto | Qué debe observar |
| --- | --- | --- |
| reloj009 conserva fechas datos y red de tres montajes | change-tests/clock-state.spec.js | Cada helper real en contexto nuevo, fecha/semillas, bloqueo de red y doble; fecha antes de App |
| reloj009 demora de preparacion conserva instante y reloj detenido | change-tests/clock-state.spec.js | Matriz 3 fixtures × 0/250/1500 ms; sin petición de retroceso; instante exacto antes del bundle |
| reloj009 host no consume plazos antes ni despues del montaje | change-tests/clock-state.spec.js | Demora impuesta de preparación y tras montaje; sin efectos por host; avance virtual explícito con fronteras comprobadas |
| reloj009 fallos de preparacion y montaje se registran sin ocultarlos | change-tests/clock-state.spec.js | Errores centinela en APIs e inyección conservados por identidad; etapa registrada; no se devuelve ready tras error |
| reloj009 contextos independientes conservan su origen | change-tests/clock-state.spec.js | Contextos nuevos no heredan tiempo, temporizadores ni datos; no confundir nueva página con nuevo contexto |
| reloj009 firmas y enmiendas rechazan alteraciones no autorizadas | test/clock-state-pins.test.js | Firmas efectivas, diffs canónicos, before/after/plan/archivo falsos y cambios de aserciones rechazados |
| reloj009 trazabilidad rechaza resultados falsos omitidos y parciales | test/clock-state-trace.test.js | Negativos de estructura; control sintético identificado como tal, sin atribuir ejecución de negocio |
| reloj009 reintroduccion del patron original detecta tres montajes | scripts/check-clock-state-mutations.js | Resultado real agregado tras tres mutantes, controles positivos, causa específica y cleanup verificado |

El resultado agregado de mutaciones se incorpora a 009 del mismo modo que los
resultados externos RLS a 002: únicamente después de validar huella, comandos,
salidas originales, tres casos, controles positivos y limpieza. No se inventa
una prueba Node ni se permite sustituirla por un control estructural sintético.

## Oráculos heredados reutilizados sin copiar aserciones

- `interfaz cambio resaltado temporal tras consumo de focusCard`.
- `interfaz cambio resaltado reemplazo y desmontaje`.
- `interfaz navegador temas carga y errores` (incluye Toast y reemplazo).
- `guardado007 navegador error visible en movil y escritorio`.
- `guardado007 navegador estado accesible y sin exito falso`.
- `borrado008 navegador fallo persiste visible y accesible`.

Los dos primeros viven en change-tests/interface-highlight.spec.js; el tercero
en browser-tests/interface.spec.js; los dos siguientes en change-tests/save-state.spec.js;
el último en change-tests/delete-state.spec.js. Las aserciones de 2199+1 ms,
reemplazo y limpieza, Toast 2000/600/2000 y guardado 600 ms/doce escrituras se
ejecutan tal como están. No ampliar tiempos, retries ni tolerancias de producto.

## Caracterización original y precisión pendiente

Con la [precisión SC-001](precision-sc-001.md) aceptada, tres casos nuevos son
controles de preservación previstos verdes en el original: fechas/red,
errores/etapas observadas y aislamiento. Los dos casos con carrera impuesta
deberán fallar por `Cannot fast-forward to the past`, antes de App, con prueba
específica por fixture; no por imports, TypeError, sintaxis o un API nuevo.

Los casos nuevos prueban los helpers reales. Los wrappers que introducen demora
y errores existen solo en el proceso de prueba y conservan las implementaciones
originales. Los errores esperados de un control no cuentan como un montaje
aprobado. Si aparecen fallos de preparación distintos se archivan y diagnostican;
no se los etiqueta como rojo de la carrera ni se ocultan mediante retries.

Cada combinación debe producir su propia observación aunque otra falle. Se
ejecutan en contextos nuevos y se conservan todos los errores originales; el
caso agregado falla al terminar si alguna combinación incumple el contrato.
Recoger errores para completar la matriz no puede convertirla en un aprobado.
G-PIN exige causa específica en cada fixture afectado, no una sola coincidencia
de texto que oculte otros errores de instrumental.

## Matriz contractual por etapa

| Etapa | Complete 009 | Pending 009 | Qué permite el paso |
| --- | --- | --- | --- |
| Planificación | 0 | 16 | Solo propuesta; pruebas ejecutadas vacías |
| E0/G-PIN | 9 | 7 | FR-001/002/003/006, US1-AS1/AS3 y US2-AS1/AS2/AS3 preservados; dos regresiones específicas rojas; siete firmas nuevas congeladas |
| E1 | 14 | 2 | Montajes y plazos verdes, tres enmiendas válidas y firmas; FR-007/US3-AS2 siguen pendientes hasta mutaciones reales |
| E2 | 16 | 0 | Tres mutaciones de reloj, once heredadas, RLS fresco/cleanup y nueve contratos/250 IDs completos |

La matriz es una expectativa, no un permiso para marcar complete por conteo.
Cada fila exige revisar todas sus aserciones. Si una regresión ya pasa en el
original se informa y ajusta la planificación con decisión expresa cuando
corresponda; no se fuerza un fallo para simular desarrollo dirigido por pruebas.

## Cierre y descubrimiento

Se prevén cinco casos nuevos Chromium y dos tests Node E0, más suplementos
que el plan requiera para recibos y firmas. El runner decide el total real.
El cierre usa descubrimiento ordinario (35 Chromium previstos), Node y build,
sin filtros permanentes. Los mutadores sí usan selecciones dirigidas en sus
copias, con controles positivos. Todos los reportes referencian la misma huella
de verificación, y se ejecuta RLS nuevo después de E1. Los reportes anteriores
de 008 quedan como evidencia histórica aunque compartan hash de src.
