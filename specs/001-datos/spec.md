# Spec 001 — Persistencia y ciclo de vida de datos

Adenda vigente de ejecución local 007 — 2026-10-21: el alcance y plan aprobados
de [007](../007-guardado-fiable/spec.md) sustituyen la agregación defectuosa de
FR-004 por errores retenidos por usuario:clave y resolución solo del mismo par.
FR-006 conserva la suscripción heredada sin replay y añade consulta/suscripción
por usuario para el indicador. Cola, payloads, debounce y promesas permanecen.
El texto y checkpoints siguientes conservan el contrato histórico de 001;
[PIN-007-001](../007-guardado-fiable/evidence/pin-007-001.json) documenta las
aserciones sustituidas con evidencia original y nueva. Sin integración remota aún.

Estado: ALCANCE APROBADO, 2026-10-14. Propietario: usuario del proyecto.
Gobierno: [constitución](../../.specify/memory/constitution.md).
Evidencia: [survey](../../docs/sdd/datos-survey.md).

## Resultado de usuario e intención

Poder recuperar y guardar registros y gestionar copias conservando el
comportamiento actual durante la separación de responsabilidades. Medición:
todos los contratos observados del área pasan antes y después del refactor.

## Alcance y restricciones

app_data, cola y bus de guardado, hook de sincronización, carga de App,
exportación/importación y coordinación de borrado. Las operaciones de fotos
son dependencias compartidas: se conserva su contrato sin rediseñarlas aquí.
Se preservan nombres de claves, payloads, APIs llamadas por pantallas y timer.
La spec define comportamiento; el plan escogerá módulos y mecanismos de prueba.

## Historias y escenarios

### US1 — Recuperar y conservar registros (P1)

Como usuario quiero cargar y guardar mis registros para continuar mi seguimiento.

- US1-AS1: Dado un usuario y clave, cuando se lee o escribe, entonces la petición
  mantiene ambos identificadores y conserva value o el fallback descrito.
- US1-AS2: Dadas dos escrituras a la misma clave, cuando la primera está pendiente,
  entonces la segunda espera; otra clave puede avanzar independientemente.
- US1-AS3: Dado un fallo de escritura, cuando termina, entonces se informa por
  el bus y la promesa conserva la semántica actual descrita en FR-004.
- US1-AS4: Dado un usuario suspendido o ausente, cuando se pide guardar,
  entonces no hay escritura remota; reanudar permite nuevas entradas.
- US1-AS5: Dado un valor habilitado, cuando cambia antes del plazo del efecto,
  entonces se cancela el timer anterior; deshabilitado no agenda escritura.
- US1-AS6: Dada carga pendiente, fallida o descartada por cleanup, cuando termina
  una petición, entonces loaded y los setters siguen FR-007.

### US2 — Gestionar copias (P1)

Como usuario quiero exportar e importar mis registros para disponer de una copia.

- US2-AS1: Dado estado cargado, cuando exporto, entonces recibo JSON de las 12
  claves con fotos embebidas y sin timer, o un error si no se pueden incluir fotos.
- US2-AS2: Dado un archivo inválido o cancelación, cuando intento importar,
  entonces no se aplican colecciones; una copia válida confirmada aplica solo
  las incluidas y conserva las demás, con las limitaciones de FR-010.

### US3 — Borrar los datos de la cuenta (P1)

Como usuario quiero ejecutar el borrado de mis datos en el orden establecido.

- US3-AS1: Dado usuario activo y guardados en cola, cuando borro, entonces se
  suspenden nuevas entradas y se espera lo capturado antes de fotos y app_data.
- US3-AS2: Dada una excepción durante el borrado, cuando se captura, entonces
  se reanuda guardado y loaded sin prometer restauración de efectos anteriores.

## Requisitos funcionales

Las etiquetas AS-IS describen observación del código, no cobertura ya completada.
Sus pruebas pendientes bloquean cualquier refactor. No hay CHANGE aprobado.

- FR-001 [AS-IS] Cuando se consulta una clave, el sistema deberá filtrar app_data
  por user_id y key y devolver value, o fallback ante valor null/ausente.
- FR-002 [AS-IS] Cuando se escribe una clave, el sistema deberá enviar
  `{user_id, key, value}` mediante upsert con conflicto `user_id,key`; lecturas
  y escrituras deberán propagar error del cliente o timeout local de 15000 ms,
  sin prometer cancelación remota.
- FR-003 [AS-IS] Mientras una escritura de usuario:clave está pendiente, el
  sistema deberá encolar la siguiente de ese par, permitiendo ejecución
  independiente de otros pares y manteniendo la referencia del valor recibido.
- FR-004 [AS-IS] Cuando una escritura comienza, el sistema deberá publicar saving;
  cuando las escrituras en ejecución llegan a cero, deberá publicar saved o error.
  Un error del backend deberá registrarse en consola y capturarse en el bus,
  sin rechazar por ese error la promesa devuelta por saveKey. El bus global
  mantiene su comportamiento actual: cada emisión reemplaza error y no cuenta
  como pendientes todos los trabajos que todavía están en cola.
- FR-005 [AS-IS] Si no hay userId, entonces el sistema deberá publicar
  `Sin sesion activa` y resolver sin escribir; mientras el usuario esté suspendido,
  deberá resolver sin escribir ni emitir evento. Reanudar deberá permitir nuevas
  entradas; esperar guardados deberá observar solo las colas capturadas del usuario.
- FR-006 [AS-IS] Mientras enabled y userId estén presentes, el sistema deberá
  agendar el valor con demora predeterminada de 600 ms; cuando se limpie el
  efecto, deberá cancelar ese timer. Suscribir estado devolverá una función
  que elimina al suscriptor, sin reproducir inmediatamente el último evento.
- FR-007 [AS-IS] Cuando App carga los datos de una sesión, el sistema deberá
  pedir workouts, weights, nutrition, foods, recipes, routines, measurements,
  wellness, periods, menstrualLogs, photos y goals; usar arrays vacíos como
  fallback salvo DEFAULT_GOALS para goals; hidratar fotos y migrar workouts/foods
  antes de habilitar loaded. Si falla la carga deberá mantener loaded falso y
  activar error; tras cleanup no deberá aplicar su resultado.
- FR-008 [AS-IS] Mientras App tenga datos cargados, el sistema deberá sincronizar
  las 12 claves y excluir signedUrl del valor persistido de photos. El temporizador
  deberá seguir usando su clave timer separada y sus escrituras explícitas.
- FR-009 [AS-IS] Cuando se exporta, el sistema deberá generar JSON desde estado
  en memoria, con las 12 claves, fotos embebidas y nombre fittrack-fecha.json,
  sin timer ni espera de guardados. Si falla la materialización de fotos, entonces
  deberá mostrar error sin descargar un archivo parcial.
- FR-010 [AS-IS] Cuando se importa, el sistema deberá rechazar tamaños mayores
  de 50 MiB, parsear y validar antes de confirmar y aplicar solo claves presentes
  tras confirmación. Deberá conservar normalización/migración actual, el orden
  de setters previo a hidratar fotos, la conservación de fotos individuales que
  no se hidratan y la limpieza del input tras finalizar o cancelar. No se promete
  atomicidad ni validación numérica adicional a validateBackup.
- FR-011 [AS-IS] Cuando se borra con usuario, el sistema deberá suspender entradas,
  deshabilitar loaded, esperar colas capturadas, borrar fotos, borrar app_data
  filtrado por usuario y llamar signOut en ese orden. Si se lanza una excepción,
  entonces deberá reanudar y restaurar loaded antes de propagarla, sin rollback
  de efectos previos. Sin usuario deberá rechazar antes de producir efectos.
  Se conserva que el retorno `{error}` de signOut no se inspecciona.

## Evidencia AS-IS

Adenda aprobada por 008, alcance `462a344` y plan `2ee8edc`: FR-011 y US3-AS2
conservan orden, propietario, espera de cola, ausencia de rollback y rechazo sin
usuario. Se sustituye únicamente la recuperación automática y el retorno error
ignorado: retorno `{error}` y rechazo de signOut son fallos; no se reanudan
guardados ni se restaura loaded en catch. La recuperación manual según despacho,
feedback y aislamiento de sesión se rigen por [008](../008-borrado-fiable/spec.md).
El texto anterior conserva el AS-IS histórico; esta adenda prevalece sobre esas
dos expectativas. Enmienda de prueba: PIN-008-001, con original archivado.

Las citas de esta tabla corresponden a BASE
`46697650f18043319a7c96ccdf93ebbdf29e2d75`, usada para fijar comportamiento.
La ubicación final y su verificación están en [converge](converge.md).

| FR | Código | Cobertura actual y límite |
| --- | --- | --- |
| FR-001 | `src/data-operations.js:5` | Pin T002: BASE y final verdes |
| FR-002 | `src/data-operations.js:21` | Pin T002: BASE y final verdes |
| FR-003 | `src/data-sync.js:40` | Pin T003: BASE y final verdes |
| FR-004 | `src/data-sync.js:9`, `25` | Pin T004: BASE y final verdes |
| FR-005 | `src/data-sync.js:40`, `64` | Pin T005: BASE y final verdes |
| FR-006 | `src/data-sync.js:16`, `56` | Pin T006: BASE y final verdes |
| FR-007 | `src/FitTrack.jsx:695` | Pin T007: BASE y final verdes |
| FR-008 | `src/FitTrack.jsx:767`, `1179` | Pin T008: BASE y final verdes |
| FR-009 | `src/FitTrack.jsx:800`, `src/photo-storage.js:82` | Pin T009: BASE y final verdes |
| FR-010 | `src/FitTrack.jsx:810`, `src/app-utils.js:257` | Pin T010: BASE y final verdes |
| FR-011 | `src/FitTrack.jsx:783` | Pin T011: BASE y final verdes |

## Criterios medibles de aceptación

- SC-001: 11 FR y 10 escenarios con pruebas nombradas, descubiertas y aprobadas;
  cero filas PENDING al presentar código.
- SC-002: pins aprobados en revisión original y refactorizada; resultados y
  nombres registrados, sin conexiones a datos reales.
- SC-003: suite Node completa y build Vite con exit code 0; avisos documentados.
- SC-004: pruebas deterministas con reloj controlado para 600/15000 ms y
  promesas controladas para orden/concurrencia, sin esperas de red reales.
- SC-005: contrato público de llamadores del survey conservado; prueba de humo
  principal/preview con servicios simulados si se tocan sus firmas o montaje.

## Out of Scope

- Cambios de fórmulas, defaults, interfaz o semántica de datos.
- Atomicidad nueva, rollback distribuido, guardado offline o reintentos nuevos.
- Corrección del bus global o errores de signOut sin CHANGE explícito.
- Migraciones remotas, despliegues y modificación de datos reales.
- Refactor interno de fotos/auth y reglas RLS, salvo dependencia indispensable.

## Compatibilidad temporal, no garantía deseada

Los siguientes comportamientos se preservan por la decisión C-001/002/003,
para que la refactorización sea verificable. No deben convertirse en patrones
para funcionalidades nuevas. Su corrección requiere CHANGE y prueba previa.

| Comportamiento conservado | Requisito | Seguimiento y revisión |
| --- | --- | --- |
| Error del bus global puede sobrescribirse; promesa no indica éxito remoto | FR-004 | DATA-003; cierre M2 |
| Importación por setters sin atomicidad y foto fallida conservada | FR-010 | DATA-001; cierre M2 |
| Borrado parcial sin rollback distribuido | FR-011 | DATA-002; cierre M2 |
| Retorno error de signOut no inspeccionado | FR-011 | DATA-004; cierre M2 |

El [roadmap](../../docs/sdd/roadmap.md) gestiona los seguimientos. El dueño
decidirá cada corrección; preservarlos ahora no equivale a aceptarlos para siempre.

## Clarificaciones

### Sesión 2026-10-14 — resueltas

- Decisión del propietario: «aprobado el alcance», en respuesta a la propuesta
  de preservar comportamiento y abordar defectos mediante cambios posteriores.
- C-001: preservar promesas resueltas y comunicación de errores mediante bus,
  incluidas sus limitaciones actuales; corregirlas requiere CHANGE posterior.
- C-002: preservar aplicación parcial de importación y conservación de fotos
  no hidratadas; no se introduce atomicidad.
- C-003: preservar borrado secuencial y recuperación actual, sin rollback nuevo.
- Esta aprobación permite preparar el plan; no aprueba todavía su implementación.

## Traceability

El estado de evidencia por ID y los nombres exactos ejecutables se mantienen en
[traceability.json](traceability.json). Las filas siguientes enlazan los pins y
tareas ejecutados sobre BASE y la revisión final. No se atribuye la cobertura
completa al piloto inicial; el cierre está en verification.md.

| FR o escenario | Historia | Resultado | Archivo :: prueba | Tarea | Estado |
| --- | --- | --- | --- | --- | --- |
| FR-001 | US1 | Recuperar registros | test/data-operations.test.js :: datos lectura y escritura por usuario y clave | T002 | VERIFIED |
| FR-002 | US1 | Guardar registros | test/data-operations.test.js :: datos lectura y escritura por usuario y clave | T002 | VERIFIED |
| FR-003 | US1 | Conservar orden | test/data-sync.test.js :: datos cola orden concurrencia y referencia | T003 | VERIFIED |
| FR-004 | US1 | Observar guardado | test/data-sync.test.js :: datos eventos y promesas de guardado | T004 | VERIFIED |
| FR-005 | US1 | Controlar entradas | test/data-sync.test.js :: datos suspension y espera capturada | T005 | VERIFIED |
| FR-006 | US1 | Diferir guardado | test/data-sync-hooks.test.js :: datos debounce y suscripciones | T006 | VERIFIED |
| FR-007 | US1 | Recuperar sesión | test/data-lifecycle.test.js :: datos carga y descarte de resultados | T007 | VERIFIED |
| FR-008 | US1 | Conservar claves | test/data-lifecycle.test.js :: datos claves sincronizadas y timer | T008 | VERIFIED |
| FR-009 | US2 | Obtener copia | test/data-backup.test.js :: datos exportacion completa o error | T009 | VERIFIED |
| FR-010 | US2 | Aplicar copia | test/data-backup.test.js :: datos importacion validacion y aplicacion parcial | T010 | VERIFIED |
| FR-011 | US3 | Borrar datos | test/data-delete.test.js :: datos borrado orden y recuperacion | T011 | VERIFIED |
| US1-AS1 | US1 | Recuperar/guardar | test/data-operations.test.js :: datos lectura y escritura por usuario y clave | T002 | VERIFIED |
| US1-AS2 | US1 | Conservar orden | test/data-sync.test.js :: datos cola orden concurrencia y referencia | T003 | VERIFIED |
| US1-AS3 | US1 | Observar fallo | test/data-sync.test.js :: datos eventos y promesas de guardado | T004 | VERIFIED |
| US1-AS4 | US1 | Controlar entradas | test/data-sync.test.js :: datos suspension y espera capturada | T005 | VERIFIED |
| US1-AS5 | US1 | Diferir guardado | test/data-sync-hooks.test.js :: datos debounce y suscripciones | T006 | VERIFIED |
| US1-AS6 | US1 | Recuperar sesión | test/data-lifecycle.test.js :: datos carga y descarte de resultados | T007 | VERIFIED |
| US2-AS1 | US2 | Obtener copia | test/data-backup.test.js :: datos exportacion completa o error | T009 | VERIFIED |
| US2-AS2 | US2 | Aplicar copia | test/data-backup.test.js :: datos importacion validacion y aplicacion parcial | T010 | VERIFIED |
| US3-AS1 | US3 | Ordenar borrado | test/data-delete.test.js :: datos borrado orden y recuperacion | T011 | VERIFIED |
| US3-AS2 | US3 | Observar fallo parcial | test/data-delete.test.js :: datos borrado orden y recuperacion | T011 | VERIFIED |

## Aprobación

El propietario aprobó el alcance descrito mediante «aprobado el alcance» el
2026-10-14. C-001 a C-003 quedan resueltas según la propuesta presentada.
Plan técnico aprobado para avanzar mediante «continua» el 2026-10-15.
Tareas/analyze e implementación local autorizadas posteriormente mediante
«apruebo todo. Cotninua con el trabajo». Entregas E1–E4 y convergencia local
verificadas; PRs y CI remotos permanecen pendientes, sin afirmar merges.
