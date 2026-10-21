# Spec 007 — estado de guardado fiable

Estado: ALCANCE APROBADO; plan técnico pendiente de aprobación separada.
Propietario: usuario del proyecto. Fecha: 2026-10-21 (Bogotá).
Gobierno: [constitución 1.0.3](../../.specify/memory/constitution.md).
Evidencia inicial: [survey](../../docs/sdd/guardado-fiable-survey.md).

## Resultado de usuario

Saber que algún cambio no se guardó aunque otras escrituras hayan tenido éxito,
y ver cuándo se recuperó la clave afectada. No recibir estados de otra cuenta.
Se medirá con fallos y recuperaciones deterministas del coordinador y con
recorridos de interfaz en móvil y escritorio; no basta inspeccionar texto fuente.

## Alcance y restricciones

DATA-003: agregación de errores, consulta/suscripción de estado por usuario y
presentación del indicador. Se preservan cola, debounce, payloads, persistencia,
suspensión y semántica de promesas. Nueve FR: cuatro AS-IS y cinco CHANGE.
Esta propuesta no elige módulos, APIs nuevas ni librerías; eso corresponde al plan.

## Historias y escenarios

### US1 — No perder un fallo entre escrituras (P1)

- US1-AS1: Dadas A/B concurrentes, cuando falla A, comienza C y terminan B/C,
  entonces sigue existiendo un error de A y no se anuncia Guardado.
- US1-AS2: Dado un fallo de una clave, cuando una escritura posterior de esa
  misma clave tiene éxito y no quedan fallos ni escrituras ejecutándose del
  usuario, entonces se anuncia Guardado.
- US1-AS3: Dadas dos claves fallidas, cuando solo una se recupera, entonces el
  estado sigue siendo error por la otra.
- US1-AS4: Dado un fallo previo, cuando la siguiente escritura del mismo par
  vuelve a fallar, entonces el error permanece; iniciar el intento no lo borra.

### US2 — Ver solo el estado de mi cuenta (P1)

- US2-AS1: Dado un error de A, cuando se inicia sesión B, entonces B no muestra
  el error de A y presenta su propio estado o Sin cambios si no tiene historial.
- US2-AS2: Dada una escritura de A aún pendiente, cuando cambia a B y termina
  la escritura de A, entonces el indicador de B no cambia por ese resultado.
- US2-AS3: Dado un error retenido de A, cuando se desmonta y remonta el indicador
  para A en la misma ejecución, entonces muestra ese error sin esperar otro guardado.

### US3 — Conservar las garantías de persistencia (P1)

- US3-AS1: Dadas dos escrituras del mismo par y otras independientes, cuando se
  ejecutan, entonces mantienen orden por par, concurrencia independiente y valores.
- US3-AS2: Dado un cambio sincronizado, cuando cambia antes de 600 ms o se limpia
  el efecto, entonces conserva la cancelación y solo persiste el valor habilitado.
- US3-AS3: Dado usuario ausente o suspendido, cuando se solicita guardar, entonces
  se mantiene la ausencia de escritura remota y la resolución de la promesa actual.

### US4 — Entender el fallo en móvil y escritorio (P1)

- US4-AS1: Dado un error no resuelto, cuando se usa la aplicación a 390 o 1280 px,
  entonces existe un estado textual visible Error al guardar, independiente del color.
- US4-AS2: Dado que se inicia otro guardado tras el fallo, cuando cambia el estado,
  entonces no se sustituye el error por Guardado ni se anuncia falsamente éxito;
  el estado se expone a tecnologías de asistencia mediante una región de estado.

## Requisitos funcionales

- FR-001 [AS-IS] Mientras una escritura del par usuario:clave esté pendiente,
  el sistema deberá encolar la siguiente del par, permitir otros pares y conservar
  la referencia del valor recibido y el formato de persistencia existente.
- FR-002 [AS-IS] Cuando cambie un valor sincronizado habilitado con usuario,
  el sistema deberá mantener la demora predeterminada de 600 ms y cancelar
  el temporizador al limpiar el efecto; deshabilitado no agendará escritura.
- FR-003 [AS-IS] Cuando una persistencia falle por error del backend, el sistema
  deberá mantener el registro diagnóstico y la promesa resuelta de saveKey;
  la resolución de esa promesa no deberá reinterpretarse como éxito remoto.
- FR-004 [AS-IS] Si falta usuario o el usuario está suspendido, entonces el
  sistema deberá conservar el comportamiento de no escribir y resolver la
  promesa; suspensión, reanudación y espera de colas capturadas no se rediseñan.
- FR-005 [CHANGE] Cuando falle una escritura de un usuario y clave, el sistema
  deberá conservar un fallo no resuelto de ese par durante la misma ejecución;
  iniciar o terminar escrituras de otras claves no deberá eliminarlo, incluso
  si no había escrituras ejecutándose al iniciar el siguiente intento.
- FR-006 [CHANGE] Cuando una escritura posterior del mismo usuario y clave
  tenga éxito, el sistema deberá resolver únicamente el fallo de ese par;
  mientras quede cualquier fallo del usuario, el estado agregado deberá ser
  error. Sin fallos, mostrará Guardando mientras ejecute escrituras y Guardado
  al terminarlas; iniciar un reintento no equivale a recuperarse.
- FR-007 [CHANGE] Cuando se presente el estado de una sesión, el sistema deberá
  seleccionar únicamente el del usuario actual y excluir resultados tardíos de
  otros usuarios. Sin sesión no mostrará errores de cuentas anteriores.
- FR-008 [CHANGE] Cuando se monte el indicador o cambie el usuario actual,
  el sistema deberá mostrar su estado vigente sin esperar una nueva emisión;
  si no hay historial mostrará Sin cambios. La retención no sobrevivirá por
  contrato a recargar la página ni almacenará nuevos datos en el navegador.
- FR-009 [CHANGE] Mientras haya un fallo no resuelto del usuario actual, el
  sistema deberá mostrar Error al guardar como texto visible a 390 y 1280 px
  y exponer el estado a tecnologías de asistencia mediante una región de estado;
  el color o un tooltip no bastarán para comunicarlo. No deberá mostrar Guardado
  simultáneamente para ese mismo usuario mientras siga el fallo.

La prioridad visual del error sobre Guardando es deliberada. Se mantienen
escrituras en segundo plano; el indicador no bloqueará ediciones. No se añade
un botón de reintento: se considera recuperación una escritura posterior normal
del mismo par que tenga éxito. No se promete guardar cambios tras cerrar la página.

## Evidencia AS-IS y contrato afectado

| FR | Evidencia de código o prueba actual | Límite |
| --- | --- | --- |
| FR-001 | src/save-coordinator.js:31; test/data-sync.test.js :: datos cola orden concurrencia y referencia | Pin de 001; repetir sobre BASE con runtime fijado |
| FR-002 | src/data-sync.js:13; test/data-sync-hooks.test.js | Falta caracterización específica 007 |
| FR-003 | src/save-coordinator.js:21; test/data-sync.test.js :: datos eventos y promesas de guardado | Contiene además la expectativa histórica que CHANGE sustituye |
| FR-004 | src/save-coordinator.js:32; test/data-sync.test.js :: datos suspension y espera capturada | Sin cambio de política de borrado |

La [reproducción del survey](evidence/survey.json) demuestra DATA-003 con Node
global v26.5.0 y sin backend. No es baseline contractual, prueba roja del nuevo
contrato ni autorización para implementar. Deben producirse después de aprobar
el plan, con Node 24.21.0, nombres fijados y hashes.

## Compatibilidad y evolución de contratos

FR-005/006 sustituyen exclusivamente la agregación descrita como defecto
preservado en 001 FR-004; FR-007/008 evolucionan el estado global y la falta de
snapshot descritos en 001 FR-006. FR-009 amplía la presentación de 006 FR-012.
No se renumeran IDs ni se borran baseline, evidencia o fallos anteriores.

El plan deberá precisar las adendas a esos contratos y los casos heredados que
esperan el defecto. No se podrá afirmar que todos los pins permanecen idénticos
si un CHANGE aprobado los contradice. Cualquier enmienda conservará firma
original, FR, motivo, evidencia original y nueva, y la decisión aprobada.
Los 184 IDs de 001–006 no se presentan como evidencia completa de 007.

## Criterios de aceptación

- SC-001: FR-001–004 y US3 pasan sobre BASE antes de cambiar runtime.
- SC-002: US1/US2/US4 fallan sobre BASE por motivos específicos del CHANGE y
  pasan en el candidato sin omisiones ni reintentos de pruebas.
- SC-003: Caracterizar ambas órdenes de resolución de escrituras independientes,
  recuperación por clave, varios errores y resultado tardío tras cambiar usuario.
- SC-004: Chromium demuestra texto visible y estado accesible a 390/1280 px,
  remontaje del indicador y ausencia de éxito falso después del fallo.
- SC-005: Adendas y firmas afectadas revisadas explícitamente; suite y build
  completos, contratos previos compatibles con los CHANGE y RLS local fresco
  según plan. No usar producción para estas pruebas.

## Exclusiones

- DATA-004/005, cierre de sesión fallido, borrado parcial y recuperación tras borrado.
- Importación/exportación, payloads, migraciones SQL, algoritmos, fotos y fórmulas.
- Nuevos reintentos automáticos, caché/offline durable, esperas de red distintas,
  resolución de conflictos, versionado remoto o cambios de semántica de promesas.
- Garantizar estado de trabajos aún no aceptados por el coordinador, incluyendo
  el tiempo previo de debounce; rediseñar el conteo de toda la cola.
- Prueba autenticada en producción, publicación, fusión y despliegue sin autorización específica.

## Aclaraciones aprobadas — 2026-10-21

- C-001 [APROBADA]: Retención por usuario:clave hasta escritura posterior exitosa
  del mismo par, con prioridad del error aunque haya otros guardados en curso.
- C-002 [APROBADA]: Aislamiento por sesión y snapshot al montar; errores de A no
  aparecen en B y el estado de A se conserva solo en memoria en la misma ejecución.
- C-003 [APROBADA]: Estado textual accesible en móvil/escritorio, sin reintentos
  automáticos ni caché durable, dejando DATA-004/005 para una spec separada.

## Trazabilidad propuesta

Pruebas exactas y tareas se fijarán en el plan aprobado; estas filas siguen PENDING.

| ID | Historia | Resultado | Estado |
| --- | --- | --- | --- |
| FR-001 | US3 | Orden y concurrencia preservados | PENDING |
| FR-002 | US3 | Debounce preservado | PENDING |
| FR-003 | US3 | Promesa no promete éxito remoto | PENDING |
| FR-004 | US3 | Ausencia/suspensión preservadas | PENDING |
| FR-005 | US1 | No perder un fallo | PENDING |
| FR-006 | US1 | Recuperación por clave | PENDING |
| FR-007 | US2 | Aislamiento por sesión | PENDING |
| FR-008 | US2 | Estado vigente al montar | PENDING |
| FR-009 | US4 | Error visible y accesible | PENDING |
| US1-AS1 | US1 | Fallo y otras escrituras | PENDING |
| US1-AS2 | US1 | Recuperación correcta | PENDING |
| US1-AS3 | US1 | Varios errores | PENDING |
| US1-AS4 | US1 | Nuevo fallo conserva error | PENDING |
| US2-AS1 | US2 | Cambio de cuenta | PENDING |
| US2-AS2 | US2 | Resultado tardío | PENDING |
| US2-AS3 | US2 | Remontaje | PENDING |
| US3-AS1 | US3 | Cola y payloads | PENDING |
| US3-AS2 | US3 | Timer y limpieza | PENDING |
| US3-AS3 | US3 | Guardas existentes | PENDING |
| US4-AS1 | US4 | Visibilidad móvil/escritorio | PENDING |
| US4-AS2 | US4 | Estado accesible sin éxito falso | PENDING |

## Aprobación

El propietario respondió «Aprobar alcance y las tres aclaraciones» el
2026-10-21 a la pregunta explícita de aprobar cuatro AS-IS, cinco CHANGE,
doce escenarios y C-001/002/003. Autoriza preparar plan, tareas y análisis;
no autoriza implementar, publicar, fusionar ni desplegar. La evolución
semántica de contratos se limita a los CHANGE aprobados; el plan precisará
sus artefactos y preservación de evidencia antes de ejecutarlos.
