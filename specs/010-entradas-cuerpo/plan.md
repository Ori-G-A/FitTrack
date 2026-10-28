Estado vigente — 2026-10-28 (Bogotá): 010 integrada mediante #22/#23, con CI de main y Vercel Production verificados en `e427682`. [Entrega remota](evidence/integration.json). Los apartados siguientes conservan la cronología y sus decisiones ya cumplidas.

Estado vigente — 2026-10-28 (Bogotá): publicación de ambas ramas/PRs, integración con CI remoto verde y Vercel autorizadas. [Decisión](evidence/remote-authorization.json). Pendiente ejecutar y verificar la entrega; las esperas de autorización anteriores son históricas.

Estado vigente — 2026-10-28 (Bogotá): 010 cerrada localmente, 24 IDs propios y diez contratos/274 IDs completos. [Converge](converge.md), [verificación](verification.md). Los apartados siguientes conservan la cronología y sus aprobaciones; las esperas locales antiguas quedan cumplidas. Publicación/integración/Vercel pendientes de autorización específica.

# Plan técnico 010 — entradas numéricas de Cuerpo

Estado: APROBADO el 2026-10-27 (Bogotá); ejecución local E0–E2 autorizada. Alcance y C-001/002/003 aprobados en `1fa6561` el 2026-10-27
(Bogotá). [Spec](spec.md), [tareas](tasks.md), [validación](validation-plan.md),
[research](research.md), [enmiendas](pin-amendments.md), [análisis](analyze.md).

El propietario autoriza ejecución local antes del PR documental, conservando
un snapshot del plan aprobado. Publicar, fusionar y permitir Vercel requieren decisión
posterior específica. E0–E2 quedan autorizadas mediante la decisión registrada.

## Resultado, original y puertas

Validar los nueve campos de Cuerpo antes de modificar sus colecciones, con
coma/punto utilizable, rechazo completo y error accesible. Base integrada
`392e797`; cierre documental 009 `73819e6`; alcance 010 `1fa6561`.
sourceHash original: `e4e98de0fa1bced3a4372dab58e63172257ed8003eafad8febe306260312b377`.
verificationHash previo: `078dd04994509a8cb506b4c2a9a42b5d99e4043e00e1fab547737ae57cee6eb9`.
372 Node, 35 Chromium y nueve contratos/250 IDs son evidencia previa de 009,
no resultados nuevos de este plan.

| Etapa | Tareas | Puerta |
| --- | --- | --- |
| E0 | T001–T008 | Plan aprobado; suite original Node/35 Chromium/build; inventario efectivo de 123 firmas y fuente completa; dos AS-IS y control de significado originales; cinco casos CHANGE rojos funcionales; nueve archivos E0 congelados |
| E1 | T009–T021 | Validadores y tres formularios; seis enmiendas canónicas y transición de fuente acotada; cinco pruebas Node nuevas y ocho Chromium propios verdes; suite/build y 250 IDs previos preservados con RLS pendiente de ensayo fresco |
| E2 | T022–T031 | Cinco mutaciones nuevas y catorce heredadas con recibos; RLS fresco y limpieza; diez contratos/274 IDs; converge, PRs preparados e informe final local |

Los 43 casos Chromium finales son una previsión (35 + ocho); la suite debe
descubrir exactamente los nombres previstos. El conteo Node se toma del runner,
sin inventar un total antes de añadir instrumental. El sondeo y las tres pruebas
del alcance no se reutilizan como G-PIN.

## Fronteras de implementación

| Archivo | Cambio propuesto | Límite |
| --- | --- | --- |
| src/body-inputs.js, nuevo | Parser y validadores puros de peso, medidas y bienestar | Sin React, navegador, IDs, efectos, SDK o fechas; sin fórmulas médicas |
| src/BodyScreen.jsx | Validar antes de los setters, estado de errores por formulario, nombres/asociaciones y entradas que admitan coma | Conservar parseKg para pasos/accesos válidos; no tocar ciclo, fotos, fechas ni otras secciones |
| src/body-records.js | Recibir valores de bienestar ya validados como number/null; retirar measurementValues tras sustituir su único llamador | Conservar reemplazo por fecha, ID, orden, energía y notas; los demás exports intactos |
| test/body-{weight,measurements,wellness}.test.js | Sustituir solo las aserciones de conversión incompatibles con el CHANGE aprobado | PIN-010-001/002/003; conservar nombres y todos los demás controles |
| test-support/body-build.js | Mantener exposición actual y adaptar solo la mutación weight-zero al validador puro | PIN-010-004; las otras tres mutaciones y el bloqueo de red intactos |
| scripts/clock-state-evidence.js y test/clock-state-pins.test.js | Resolver firmas 010, verificar transición explícita de fuente y recuentos reales | PIN-010-005/006; funciones de reloj, tiempos, validación de mutaciones y traza sin cambios |
| scripts/save-state-evidence.js y delete-state-evidence.js | Componer resolutor 010 al final de la cadena existente | Archivos no congelados, sujetos a diff y huella; no ciclos ni baselines reescritas |
| test/delete-state-trace.test.js | Actualizar solo el contador de integridad 008 | 101 anteriores intactas/7 enmendadas, 7 nuevas intactas/1 enmendada; preservar todos sus negativos |
| scripts/run-sdd-evidence.js y .github/workflows/ci.yml | Añadir contrato 010, sus pruebas de mutación y artefactos | Mantener las nueve puertas anteriores y el job RLS independiente |

Los archivos fuente permitidos son exactamente los tres primeros. Cualquier
necesidad adicional exige converge y revisión de alcance antes de ampliarlos.
No cambiar SQL, dependencias, lockfile ni configuración del backend.

## Interpretación y coordinación

Proponer `parseBodyDecimal(value, {required, allowZero})`,
`validateWeightDraft`, `validateMeasurementsDraft` y `validateWellnessDraft`.
Resultado discriminado: éxito con valores number/null o fallo con errores por
campo; nunca NaN como señal de error. Los validadores no alteran el borrador.

Para texto: recortar extremos y aplicar
`^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$`, convertir una coma a punto y comprobar
Number.isFinite más la regla de signo/cero. Los números ya hidratados se
validan por tipo, finitud y signo, sin convertirlos a texto exponencial para
volver a rechazarlos. Booleanos, objetos y otros tipos no son números de formulario.
Se conserva la precisión Number del producto, sin redondeo o límite nuevo.
Los opcionales vacíos devuelven null; peso vacío y formularios sin contenido
mantienen la guarda de no guardar. No se inventa error obligatorio para vacío
total que ya no disparaba una acción.

Peso/medidas/pulso requieren positivos; sueño/pasos permiten cero, incluidos
cero numérico y -0. Se aceptan fracciones de pulso/pasos y valores finitos
grandes; no se aplican límites clínicos o enteros por intuición. Un texto
exponencial se rechaza aunque su equivalente numérico hidratado sea válido.

Las medidas pasan directamente sus valores validados a replaceMeasurementRecord.
replaceWellnessRecord recibe números/null, conserva energía o null y recorte
de notas; no reconvierte null a cero. No hay otro llamador productivo de
measurementValues o replaceWellnessRecord fuera de BodyScreen según el survey.

Cada acción valida el formulario completo. Si falla: actualizar solo su error,
no llamar al setter ni a uid, no limpiar borrador ni emitir éxito. Si es válido:
retirar su error, solicitar una actualización con la función de reemplazo
actual y respetar el reset/feedback de cada formulario. El toast de bienestar
sigue precediendo su setter; no se presenta como confirmación remota.

Usar entradas de texto con inputMode apropiado para no perder coma antes de
validar. Nueve campos con label/id; acciones con nombre accesible, incluida
la acción de medidas que hoy solo muestra un icono. Error visible role=alert,
aria-invalid y aria-describedby en los campos afectados; identificadores
estables. Se retira al guardar corregido o al abandonar el contexto de fecha
del formulario para no atribuir un error viejo a otro día; no reinicia ni
rehidrata el borrador de bienestar por un cambio externo de colección.
No se exige nuevo movimiento automático de foco ni rediseño del layout.

## Original, instrumental y rojos

Nuevo fixture propio: BodyScreen real dentro de un contenedor React que expone
colecciones y contadores de llamadas a sus setters. No reemplaza validadores ni
acciones de BodyScreen. Bundle mediante buildInterface con entry propio, cliente
falso y rutas bloqueadas; estilos existentes y preparePausedClock de 009.
Contexto nuevo por caso, fecha sintética y semillas con duplicados/otros días.
Las pruebas de entrada se realizan por teclado/DOM visible; la inspección de
estado solo comprueba el efecto y el contador, sin invocar callbacks privados.

En original, type=number puede filtrar coma. No usar fill con texto que Playwright
rechaza antes de enviar al producto: emplear pressSequentially y comprobar la
entrada o resultado observado. Un fallo de montaje/selector/importación nunca
se registra como rojo funcional. Los selectores de preparación se apoyan en las
estructuras actuales; los nombres accesibles nuevos son aserciones de producto.

Dos casos AS-IS y un control de vacío/cero/precisión deben pasar sobre el
original. Cinco casos rojos cubren los seis CHANGE: sintaxis y rango comparten
matriz, mientras coma, rechazo mixto, error accesible y recuperación tienen
recorridos propios. Algunas subaserciones ya pasan; no se les atribuye un
defecto nuevo. [Matriz de validación](validation-plan.md).

Congelar en E0 nueve archivos: los dos tests Node de pins/traza, los dos specs
Chromium, body-inputs-browser.js, body-inputs-entry.jsx, configuración Playwright,
body-inputs-evidence.js y body-inputs-pin-amendments.js. Preparar de antemano
sus validadores estrictos; E1 no puede relajarlos para aprobar el candidato.
Los tests Node de la API pura se añaden en E1, tras existir el módulo; no se
cuenta un import ausente del original como rojo del producto.

## Enmiendas, transición de fuente y huellas

[Propuesta detallada](pin-amendments.md): seis archivos congelados. Sobre las
123 firmas efectivas inventariadas en E0 se esperan 117 intactas/seis enmendadas.
Dentro de 009, su cohorte anterior queda en 109 intactas/siete enmendadas
(tres 009 + cuatro 010) y su cohorte propia en cinco intactas/dos enmendadas.
No confundir estos recuentos con el agregado efectivo 010.

El resolutor 010 será independiente de save/clock-evidence para evitar ciclos;
se compone al final de 006→007→008→009, según la cohorte de entrada. Cada
before debe coincidir con su firma efectiva y cada after con un parche canónico
sobre el original archivado. Desconocidos conservan su firma; before ya
transformado, plan/FR/archivo/hash ajenos, o pruebas ausentes se rechazan.

La transición de fuente compara el inventario original completo con el vivo:
solo BodyScreen/body-records modificados y body-inputs nuevo. Exige plan aprobado,
original G-PIN con su hash histórico, cambios enumerados y recibos dirigidos del
candidato. Verifica archivos omitidos/adicionales, hashes, origen y resultados;
no sustituye la igualdad histórica 009 por una aceptación genérica de src.
El informe de 009 se conserva; la ejecución actual identifica ambos hashes.

Completar todos los ejecutables de E1 antes del verde dirigido que genera
adendas. Ejecutar primero pruebas funcionales dirigidas que no dependan del
verificador de pins; sus recibos, huellas estables y after canónico permiten
emitir las adendas y después pasar la suite íntegra de integridad. Evita un
ciclo en que se declare verde para poder ejecutar la prueba que lo demuestra.

sourceHash y verificationHash acompañan cada ejecución. Incluir el nuevo módulo
en el índice Git antes del primer sourceHash candidato (el helper legado enumera
src mediante git ls-files); comprobar además inventario con archivos no ignorados
nuevos. No reutilizar recibos de 009. Capturar antes/después, comando, salida,
resultado y limpieza; no añadir retrospectivamente la huella final a un ensayo.

## Cierre local y remoto

Cinco mutaciones propias: aceptar sintaxis indebida, permitir cero en positivo,
guardar parcialmente pese al error, retirar asociación accesible y reintroducir
type=number que pierde coma. Una copia aislada por mutación o restauración
verificada, sin .env, con nonce y limpieza. Conservar las catorce mutaciones
postverde heredadas y las cuatro de Cuerpo ejecutadas dentro de Node; no
sumarlas dos veces. Total postverde previsto: diecinueve, con controles positivos.

El runner 010 invoca proofs/verify-proofs de 009 sin reescribir su cierre
histórico y añade sus cinco mutaciones. Recibos nuevos de las dos ejecuciones,
reportes y hashes; negativos contra prueba omitida/duplicada, estado parcial,
comando/nombre/hash/plan/fuente/cleanup falsos. El cierre exige ejecución nueva
de RLS local desechable A/B/anónimo después de E1, tres contratos y limpieza.
No .env.local ni backend real. Si Docker falla, conservar fallo y avanzar en
trabajo independiente; no declarar cerrado el contrato.

Checkpoint final: Node, descubrimiento ordinario de 43 Chromium, build, diez
contratos/274 IDs (250 + 24), diecinueve mutaciones postverde, recibos y RLS.
Repetir íntegro un checkpoint fallido después de corregir. Sin cambios de
dependencias no se requiere auditoría/reinstalación local; CI conserva install
frozen. El warning de bundle se registra, sin optimización atribuida a 010.

Preparar PR documental y de código con orden de merge, validación, enmiendas,
omisiones y reversión coordinada de runtime/tests/verificadores; no revertir
datos de usuario. El informe final separará refactor inicial cerrado, mejora
010 y backlog futuro, sin iniciar 011 automáticamente. Integración remota y
despliegue quedan pendientes de aprobación específica tras el cierre local.
