# Spec 010 — entradas numéricas de Cuerpo

Estado: alcance y C-001/002/003 APROBADOS el 2026-10-27 (Bogotá); plan y ejecución local E0–E2 aprobados.
Propietario: usuario del proyecto. Fecha: 2026-10-27 (Bogotá).
Gobierno: [constitución 1.0.3](../../.specify/memory/constitution.md).
[Survey](../../docs/sdd/entradas-cuerpo-survey.md),
[diagnóstico reproducible](evidence/survey.json).
Base de producto integrada: `392e797`; cierre documental previo: `73819e6`.

## Resultado de usuario e intención

Como persona que registra su cuerpo, poder introducir decimales con coma o
punto y corregir una entrada inválida antes de que reemplace los datos del día.
Conservar cero conocido para sueño y pasos, y ausencia explícita como null en
campos opcionales. Evitar negativos y valores no finitos en los nuevos registros.
Esto define reglas de entrada del producto; no valida clínicamente una medición.

## Alcance y restricciones

Los nueve campos numéricos de Cuerpo: peso; cintura, cadera, pecho, brazo y
muslo; horas de sueño, pulso en reposo y pasos. Incluye sus tres acciones de
guardado, errores accesibles y recuperación tras corregir el borrador.
La validación se aplica antes de modificar las colecciones, sin guardar una
parte del formulario si otra contiene un valor inválido.

Se propone sustituir únicamente las conversiones y guardas permisivas de
[005 FR-001/002/003](../005-cuerpo-ciclo/spec.md) por FR-005–010 de esta spec.
Las demás obligaciones de 005 permanecen. El alcance de esta sustitución está aprobado; su aplicación al producto requiere
aprobar y ejecutar el plan separado. El plan deberá proponer
las enmiendas de pruebas y verificadores congelados; este borrador no las aplica.

## Historias y escenarios

### US1 — registrar números interpretables (P1)

- US1-AS1: Dados los nueve campos en sus formularios, al escribir un decimal válido con coma o punto y guardar, se conservará el mismo valor numérico finito, sin perder la coma antes de validar.
- US1-AS2: Dadas entradas decimales con espacios exteriores, signo positivo o fracción, al guardar, se interpretarán según C-001, sin redondeo añadido; un campo opcional solo con espacios quedará como null.
- US1-AS3: Dados campos opcionales vacíos y al menos una medida válida, o solo una nota/energía de bienestar válida, al guardar, los opcionales vacíos quedarán como null. Los formularios totalmente vacíos no crearán ni reemplazarán registros.
- US1-AS4: Dados cero en sueño o pasos y positivos en los demás campos, al guardar, los ceros conocidos se conservarán y los demás valores mantendrán su precisión, sin imponer enteros o máximos nuevos.
- US1-AS5: Dado texto mal formado, notación exponencial, hexadecimal, separadores mezclados, NaN o Infinity en cualquier campo, al intentar guardar, no se modificará la colección y se mostrará el motivo.
- US1-AS6: Dados cero en peso, medidas o pulso, o un negativo en cualquiera de los nueve campos, al intentar guardar, se rechazará todo el intento sin sustituir el registro existente.

### US2 — corregir sin perder el borrador (P1)

- US2-AS1: Dado un formulario inválido, al intentar guardar desde una pantalla móvil o de escritorio, el error será visible y anunciado como alerta, identificará los campos afectados y sus nombres accesibles permitirán encontrarlos.
- US2-AS2: Dado un registro previo de la misma fecha, al rechazar una entrada, su ID y valores permanecerán intactos, no se invocará el setter de su colección y no aparecerá el mensaje local de guardado exitoso.
- US2-AS3: Dado un error y su borrador conservado, al corregir todos los campos inválidos y guardar, desaparecerá el error de ese formulario y se ejecutará una sola solicitud local de actualización, con los reinicios de borrador actuales.
- US2-AS4: Dados varios campos válidos y uno inválido, aunque bienestar incluya una nota o energía válida, al intentar guardar, se conservará todo el borrador y no se guardará un subconjunto ni se convertirá el inválido en null.

### US3 — conservar el comportamiento restante (P1)

- US3-AS1: Dados duplicados de una fecha y registros de otras fechas, al guardar datos válidos, se sustituirán todos los de esa fecha por uno con ID nuevo y se conservará el orden ascendente y los registros de otras fechas.
- US3-AS2: Dado bienestar con datos existentes, al cambiar fecha se hidratará su borrador; sin cambiar fecha, un cambio externo de colección no lo reiniciará. Notas recortadas, energía y conservación del borrador tras guardar seguirán como ahora.
- US3-AS3: Dados datos históricos, al consultar Cuerpo o usar borrado, pasos de peso de 0,1 y accesos rápidos con una entrada válida, se conservarán los historiales de ocho/seis/seis y sus gráficos y acciones actuales.
- US3-AS4: Dados los consumidores y contratos anteriores, al verificar el candidato, se conservarán las fórmulas, fotos, ciclo, navegación y coordinación de persistencia; las únicas excepciones documentadas serán las validaciones y su feedback aprobados aquí.

## Requisitos EARS

- FR-001 [AS-IS] Cuando se guarde un registro válido, el sistema deberá sustituir todos los registros de su fecha por uno con ID nuevo, mantener los de otras fechas y ordenar ascendentemente la colección, conservando los reinicios actuales: peso y medidas se vacían; bienestar permanece.
- FR-002 [AS-IS] Cuando se consulte o elimine un registro de Cuerpo, el sistema deberá conservar los historiales de ocho pesos, seis medidas y seis notas de bienestar, sus selectores/gráficos y borrados actuales, sin añadir borrado a bienestar; los pasos de peso de 0,1 y accesos rápidos deberán seguir funcionando con entradas válidas.
- FR-003 [AS-IS] Cuando cambie la fecha de bienestar, el sistema deberá hidratar su borrador actual; mientras esa fecha no cambie, deberá conservarlo ante cambios externos de colección. Al guardar deberá mantener energía o null, recorte de notas y feedback local actuales, sin equipararlos con confirmación remota.
- FR-004 [AS-IS] Cuando los campos opcionales estén vacíos, el sistema deberá representarlos como null en un guardado válido y deberá permitir bienestar con solo nota o energía; si peso no tiene dato, todas las medidas están vacías o bienestar no tiene datos ni nota ni energía, no deberá crear ni reemplazar registros.
- FR-005 [CHANGE] Cuando se interprete cualquiera de los nueve campos para guardar, el sistema deberá quitar solo los espacios exteriores y aceptar únicamente un decimal finito con signo opcional, dígitos y como máximo un separador decimal coma o punto; deberá rechazar texto restante, notación exponencial, hexadecimal, separadores mezclados o de agrupación y NaN/Infinity. Un opcional vacío tras recortar será null; el peso vacío no será un dato válido.
- FR-006 [CHANGE] Cuando una entrada decimal se haya interpretado, el sistema deberá exigir valores estrictamente mayores que cero para peso, las cinco medidas y pulso; para sueño y pasos deberá aceptar cero y exigir valores no negativos. No deberá añadir máximos, redondeos ni exigencia de enteros a estos campos.
- FR-007 [CHANGE] Si un formulario contiene alguna entrada inválida, el sistema deberá rechazar el intento completo antes de invocar el setter de su colección, conservar el borrador y los registros/IDs previos, y evitar el mensaje local de guardado exitoso; no deberá guardar parcialmente ni sustituir errores por null.
- FR-008 [CHANGE] Si se rechaza un dato inválido, el sistema deberá mostrar un error de ese formulario, identificar el campo y la regla incumplida, anunciarlo mediante una alerta accesible y asociar el estado inválido con los campos afectados. Los nueve campos y las tres acciones de guardado deberán tener nombres accesibles, tanto en móvil como en escritorio.
- FR-009 [CHANGE] Mientras exista un error de formulario, el sistema deberá permitir corregir el borrador; cuando se guarde un formulario corregido y válido, deberá retirar ese error y solicitar una única actualización local con valores numéricos finitos o null, conservando los reinicios de FR-001 y el feedback local existente.
- FR-010 [CHANGE] Cuando una persona escriba una coma decimal válida en cualquiera de los nueve campos desde la interfaz, el sistema deberá conservar la entrada hasta validarla y permitir guardarla con el mismo resultado que su equivalente con punto; no deberá descartarla silenciosamente antes del guardado.

## Evidencia AS-IS e impacto normativo

| FR | Código actual | Caracterización vigente | Límite |
| --- | --- | --- | --- |
| FR-001 | [BodyScreen.jsx:29–61](../../src/BodyScreen.jsx), [body-records.js:3–20](../../src/body-records.js) | test/body-weight.test.js; test/body-measurements.test.js; test/body-wellness.test.js | Prueban también conversiones permisivas que deberán enmendarse explícitamente; no son oráculos nuevos de 010 |
| FR-002 | [BodyScreen.jsx:32–64 y 398–445](../../src/BodyScreen.jsx), [body-metrics.js](../../src/body-metrics.js) | Los mismos tres casos de caracterización | No prueba nuevos errores ni teclado real |
| FR-003 | [BodyScreen.jsx:52–61](../../src/BodyScreen.jsx) | test/body-wellness.test.js :: cuerpo bienestar conserva borrador fecha guardas y guardado | BODY-002 sigue preservado; se observa toast antes de actualizar la colección |
| FR-004 | [body-records.js:7–20](../../src/body-records.js), [BodyScreen.jsx:29–61](../../src/BodyScreen.jsx) | Los mismos tres casos de caracterización | Espacios exteriores y coma en opcionales pertenecen al CHANGE |

El [sondeo](evidence/survey.json) reproduce nueve casos sobre el original con
React/JSDOM, red bloqueada y Node 24.21.0. Distingue interacción DOM de inyección
del borrador, y etiqueta NaN/Infinity para que JSON no los oculte como null.
No sustituye la caracterización G-PIN ni los rojos exigidos por P3.
Las tres caracterizaciones originales pasaron sin cambios;
[salida](evidence/original-targeted.txt) y [revisión documental](evidence/proposal-review.json).

El plan deberá revisar las aserciones de conversión de los tres archivos de
caracterización, sus firmas transitivas y el verificador congelado de 009 que
exige igualdad del sourceHash histórico. Aprobar esta propuesta solo permite
proponer esas enmiendas y su evidencia; no relajar firmas ni reescribir recibos.

## Criterios medibles de aceptación

- SC-001: caracterizar los cuatro AS-IS sobre el original y obtener rojos específicos de cada cambio de producto antes de implementarlo. Una API ausente, selector roto o fallo de montaje no cuenta como rojo funcional.
- SC-002: ejecutar una matriz de los nueve campos con coma/punto, espacios, vacío, cero, negativos, texto inválido y valores no finitos; comprobar que ningún rechazo invoca el setter ni emite éxito. Separar pruebas puras de entradas que el navegador normaliza.
- SC-003: comprobar entrada real, mensajes, nombres y asociación de errores en Chromium con viewport móvil y de escritorio; corregir y guardar sin perder el borrador, con una única solicitud local de actualización.
- SC-004: completar los 24 IDs de esta spec y conservar los 250 anteriores mediante las enmiendas concretas aprobadas en el plan, sin omitir escenarios ni reescribir evidencia histórica. Mantener las puertas actuales, incluidas mutaciones, build y RLS local fresco con limpieza para el cierre.
- SC-005: demostrar que los registros históricos y los módulos de cálculos, ciclo, fotos y persistencia no cambian por esta entrega; informar comandos, resultados, límites y limpieza de las pruebas negativas que establezca el plan.

## Fuera de alcance

- Limpieza o migración de registros históricos, cambios de importación/exportación o validación global de todo app_data.
- Objetivos, nutrición, entrenamiento, creatina y check-in menstrual; no cambiar fórmulas, inferencias clínicas, fechas ni BODY-002–005.
- Establecer rangos médicos, máximos de sueño/pulso/peso, pasos enteros o precisión nueva.
- Resolver PHOTO-001, optimizar el bundle, rediseñar Cuerpo o cambiar los textos históricos del feedback exitoso.
- Cambiar cola, errores o confirmación remota de 007/008, SQL, autenticación, dependencias o backend real.
- Ejecutar la implementación, publicar ramas/PRs, fusionar o desplegar a partir de esta aprobación de alcance.

## Compatibilidad temporal

BODY-001 continúa abierto hasta demostrar el cierre de 010. BODY-002–005 y la
presentación histórica de cero en los listados siguen preservados por 005.
Los datos antiguos no se reparan al abrir una pantalla. Si una nota existente
contiene un valor incompatible y se intenta guardarla, se exigirá corregir ese
campo o vaciarlo expresamente; nunca se modificará el histórico sin guardar.

## Aclaraciones aprobadas — 2026-10-27

- C-001 [APROBADA]: se aprueba admitir espacios exteriores, signo opcional y formas decimales como `65`, `+65,4`, `65.4`, `.5` y `5,`; rechazar exponentes, hexadecimal y agrupadores. `1,000` se interpretará como decimal 1, nunca como mil; los campos opcionales con solo espacios se tratarán como vacíos. Esta decisión cambia la aceptación accidental de Number.
- C-002 [APROBADA]: se aprueba exigir positivos para peso/medidas/pulso y no negativos para sueño/pasos, preservando cero conocido en estos dos. Admitir fracciones sin máximos nuevos, incluso en pasos/pulso; imponer enteros o límites clínicos requeriría otro CHANGE.
- C-003 [APROBADA]: se aprueba rechazo completo, borrador conservado y error accesible por formulario, sin limpiar historia ni ampliar a importación/objetivos. Autorizar solo proponer en el plan las enmiendas de 005 y del verificador 009, conservando las pruebas ajenas y la evidencia histórica.

## Trazabilidad y aprobación

[Manifiesto](traceability.json): diez requisitos (cuatro AS-IS y seis CHANGE)
y catorce escenarios; 24 filas individuales pending. Los tests y tareas están propuestos en el [plan](plan.md), la
[validación](validation-plan.md) y las [tareas](tasks.md), pendientes de aprobación.
[Checklist](checklist.md).

El propietario respondió «Aprobar alcance y las tres aclaraciones» el
2026-10-27 (Bogotá). Aprueba los cuatro AS-IS, seis CHANGE, catorce escenarios
y C-001/002/003. Autoriza preparar plan/tareas/análisis para revisión separada;
no implementar, publicar, fusionar ni desplegar 010.

## Aprobación de planificación — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar plan, tareas y análisis; autorizar ejecución local E0–E2». Aprueba plan, 31 tareas y análisis,
y autoriza E0–E2 local antes de integrar el PR documental con snapshot aprobado.
Las esperas de decisión local anteriores son históricas. No autoriza publicar,
fusionar ni desplegar 010.
