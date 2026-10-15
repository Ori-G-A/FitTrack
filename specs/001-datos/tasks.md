# Tareas — 001-datos

Estado: PROPUESTA revisada, pendiente de aprobación del propietario y puerta
documental. Fecha: 2026-10-15. Referencias: [spec](spec.md), [plan](plan.md),
[research](research.md), [análisis](analyze.md). Rama: `codex/001-datos-docs`.

Todas las tareas trazan a US1 (conservar registros), US2 (gestionar copias) o
US3 (borrar datos). Los FR y escenarios son los de la spec; no hay CHANGE.
Las casillas corresponden al trabajo futuro de 001, no al piloto ya ejecutado.
Ninguna tarea se marca completa por disponer de un diseño o de evidencia parcial.

## 1. Preparación — E0

- [ ] T001 [US1, US2, US3; FR-001, FR-002, FR-003, FR-004, FR-005, FR-006,
  FR-007, FR-008, FR-009, FR-010, FR-011; US1-AS1, US1-AS2, US1-AS3,
  US1-AS4, US1-AS5, US1-AS6, US2-AS1, US2-AS2, US3-AS1, US3-AS2]
  Ampliar `test-support/` con cliente programable, sesiones cambiantes, promesas
  diferidas, reloj controlado, fallos de Storage y adaptadores DOM. Mantener
  sustitución del cliente real, red bloqueada y restauración en finally. Probar
  el fixture contra App original. Prerrequisito externo: G-DOC aprobado/fusionado.

## 2. Fijar comportamiento actual — BLOQUEANTE

Cada prueba usa los puntos de entrada originales y contiene subcasos que
demuestran todas las cláusulas asignadas; no se permite mover producción para
escribirla. T002–T011 dependen de T001; se ejecutan sin modificar src respecto
a BASE. Sus nombres exactos y obligaciones se fijan aquí y en la matriz del plan.

- [ ] T002 [US1; FR-001, FR-002; US1-AS1] Crear
  `test/data-operations.test.js :: datos lectura y escritura por usuario y clave`.
  Verificar filtros/payload/conflicto exactos, claves y usuarios diferentes,
  value 0/false/null/ausencia, fallback por referencia, error retornado y rechazo,
  14999/15000 ms con reloj controlado y finalización remota tras timeout.
- [ ] T003 [US1; FR-003; US1-AS2] Crear
  `test/data-sync.test.js :: datos cola orden concurrencia y referencia`.
  Mismo par serial, diferentes pares concurrentes, usuarios distintos con misma
  clave, referencia mutada mientras espera, continuación y limpieza tras fallo.
- [ ] T004 [US1; FR-004; US1-AS3] Crear
  `test/data-sync.test.js :: datos eventos y promesas de guardado`.
  Secuencias saving/saved/error, promesa resuelta ante error, consola y fallback
  sin message; saved entre tareas seriales, contador de operaciones en ejecución
  y secuencia determinista donde otro inicio sobrescribe error global.
- [ ] T005 [US1; FR-005; US1-AS4] Crear
  `test/data-sync.test.js :: datos suspension y espera capturada`.
  Usuario ausente, suspensión silenciosa, reanudación, trabajos previamente
  encolados y espera snapshot que excluye entradas futuras y otros usuarios.
- [ ] T006 [US1; FR-006; US1-AS5] Crear
  `test/data-sync-hooks.test.js :: datos debounce y suscripciones`.
  Componente mínimo con React real: 599/600 ms, delay explícito, enabled/userId
  falsos, rerender, cleanup y desmontaje. Sin replay y sin callback tras unsubscribe.
- [ ] T007 [US1; FR-007; US1-AS6] Crear
  `test/data-lifecycle.test.js :: datos carga y descarte de resultados`.
  App original: 12 claves/defaults, paralelismo, espera de fotos, migraciones
  workouts/foods, foto no hidratada conservada, error de carga, limpieza y
  respuesta tardía de sesión anterior sin aplicar setters tras cleanup.
- [ ] T008 [US1; FR-008; US1-AS5] Crear
  `test/data-lifecycle.test.js :: datos claves sincronizadas y timer`.
  12 claves solo tras loaded, signedUrl excluida, timer cargado por separado y
  payloads de iniciar/pausar/reiniciar observados mediante interacciones de Train.
- [ ] T009 [US2; FR-009; US2-AS1] Crear
  `test/data-backup.test.js :: datos exportacion completa o error`.
  Accionar exportación de App: estado en memoria distinto del remoto, sin esperar
  cola, 12 claves sin timer, fotos embebidas, fecha local/nombre y revocación URL;
  foto no descargable muestra error y no produce descarga parcial.
- [ ] T010 [US2; FR-010; US2-AS2] Crear
  `test/data-backup.test.js :: datos importacion validacion y aplicacion parcial`.
  Sin archivo; 50 MiB y un byte más; JSON, estructura y fechas inválidas;
  cancelación; defaults goals; claves ausentes/desconocidas; arrays vacíos;
  migraciones; orden de aplicación respecto a fotos y conservación de foto que
  falla. Capturar error de lectura y limpieza del input al finalizar/cancelar.
- [ ] T011 [US3; FR-011; US3-AS1, US3-AS2] Crear
  `test/data-delete.test.js :: datos borrado orden y recuperacion`.
  Sin usuario/sin efectos; cola pendiente; suspensión y loaded; orden fotos,
  app_data filtrado y signOut. Inyectar excepción en cada paso alcanzable:
  reanudar/loaded antes de propagar, efectos ya realizados sin rollback. Distinguir
  retorno `{error}` de signOut de rechazo. Usar servicios sintéticos, nunca borrar
  fotos/datos reales. Caso sin usuario, no alcanzable desde la pantalla de cuenta:
  capturar el callback real del cierre de App mediante instrumentación exclusiva
  del bundle de tests, sin copiar su cuerpo ni cambiar sus dependencias/efectos.
  Los casos alcanzables se prueban mediante UI. Registrar ese límite de evidencia.
- [ ] T012 [US1, US2, US3; FR-001, FR-002, FR-003, FR-004, FR-005, FR-006,
  FR-007, FR-008, FR-009, FR-010, FR-011; US1-AS1, US1-AS2, US1-AS3,
  US1-AS4, US1-AS5, US1-AS6, US2-AS1, US2-AS2, US3-AS1, US3-AS2]
  Depende de T002–T011. Ampliar `scripts/run-sdd-evidence.js` para ejecutar la
  suite completa y recoger los nombres de los pins además del piloto. Incorporar
  pruebas a `traceability.json` manteniendo evidencia parcial hasta revisión
  suficiente. Ejecutar pins, suite, Chromium y verificador; registrar revisión,
  hash src, diff vacío de src frente a BASE, comandos, nombres, totales y cero
  omitidos en `verification.md`. Evaluar todas las cláusulas del contrato antes
  de promover filas a complete. La puerta completa debe pasar con los pins íntegros.

G-PIN: T012 verde y revisada sobre producción original. BASE:
`46697650f18043319a7c96ccdf93ebbdf29e2d75`. Ninguna extracción T014/T016/T018/T020
empieza antes. Cualquier contradicción entre código y spec se registra y vuelve
a clarify; no cambiar código/aserciones silenciosamente para forzar el gate.

## 3. Fundamentos — verificación de capas

- [ ] T013 [US1, US2, US3; FR-003, FR-004, FR-005, FR-006, FR-007, FR-009,
  FR-010, FR-011; US1-AS2, US1-AS3, US1-AS4, US1-AS5, US1-AS6,
  US2-AS1, US2-AS2, US3-AS1, US3-AS2] Depende de T012. Crear
  `test/data-architecture.test.js :: datos limites de dependencia` con resolución
  transitiva de imports y fixture negativo de React/Supabase/DOM en una capa
  prohibida. El chequeo se activa para cada módulo al crearlo; no saltar ausencia
  de un módulo como prueba pasada de arquitectura. Mantener pins originales.

## 4. Historias por prioridad — extracciones pequeñas

### US1 — E1: cola y bus

- [ ] T014 [US1; FR-003, FR-004, FR-005, FR-006; US1-AS2, US1-AS3, US1-AS4,
  US1-AS5] Depende de T012 y T013. Extraer `src/save-coordinator.js`; conservar
  exports de data-sync y una sola instancia global productiva. Retener errores,
  referencias, plazos y orden. Adaptar solo la instrumentación de la mutación de
  cola al módulo extraído; conservar la aserción y los pins públicos originales.
- [ ] T015 [US1; FR-003, FR-004, FR-005, FR-006; US1-AS2, US1-AS3, US1-AS4,
  US1-AS5] Depende de T014. Reejecutar T003/T004/T005/T006, mutaciones y suite;
  activar límites del coordinador; registrar resultados. Commit lógico E1 con
  reversión de extracción independiente de pruebas.

### US1 — E2: carga

- [ ] T016 [US1; FR-001, FR-002, FR-007, FR-008; US1-AS1, US1-AS5, US1-AS6]
  Depende de T015. Extraer coordinación de carga a `src/app-data-lifecycle.js`,
  manteniendo callbacks, migraciones, cleanup y firmas de Train/pantallas.
- [ ] T017 [US1; FR-001, FR-002, FR-006, FR-007, FR-008; US1-AS1, US1-AS5,
  US1-AS6] Depende de T016. Reejecutar T002/T006/T007/T008, cola y suite;
  activar límites de lifecycle; humo principal/preview con cliente falso si se
  toca montaje o firmas. Registrar E2 sin confundir preview con backend aislado.

### US2 — E3: copias

- [ ] T018 [US2; FR-009, FR-010; US2-AS1, US2-AS2] Depende de T017. Extraer
  coordinación de export/import al lifecycle conservando adaptadores de navegador,
  confirmación, validación, orden de setters, fotos y mensajes existentes.
- [ ] T019 [US2; FR-009, FR-010; US2-AS1, US2-AS2] Depende de T018.
  Reejecutar T009/T010, Chromium de copia, carga/guardado y suite; registrar E3.

### US3 — E4: borrado

- [ ] T020 [US3; FR-011; US3-AS1, US3-AS2] Depende de T019. Extraer borrado
  filtrado a data-operations y coordinación a lifecycle; retirar consulta app_data
  directa de App. No añadir transacción/rollback ni corregir retorno signOut.
- [ ] T021 [US3; FR-011; US3-AS1, US3-AS2] Depende de T020. Reejecutar T011,
  cola, carga, suite y límites de lifecycle/data-operations; registrar E4.

No hay tareas rojas de producto porque no hay CHANGE. Si surge uno, detener
la parte afectada y volver a clarify/plan/tasks/analyze antes de implementarlo.

## 5. Trazabilidad y verificación final

- [ ] T022 [US1, US2, US3; FR-001, FR-002, FR-003, FR-004, FR-005, FR-006,
  FR-007, FR-008, FR-009, FR-010, FR-011; US1-AS1, US1-AS2, US1-AS3,
  US1-AS4, US1-AS5, US1-AS6, US2-AS1, US2-AS2, US3-AS1, US3-AS2]
  Depende de T021. `pnpm test:sdd:complete` verde; cada ID tiene prueba descubierta
  y aprobada, sin PENDING/partial ni omitidos. Reejecutar negativos de prueba
  inexistente/omitida/duplicada y revisar suficiencia de las aserciones.
- [ ] T023 [US1, US2, US3; FR-001, FR-002, FR-003, FR-004, FR-005, FR-006,
  FR-007, FR-008, FR-009, FR-010, FR-011; US1-AS1, US1-AS2, US1-AS3,
  US1-AS4, US1-AS5, US1-AS6, US2-AS1, US2-AS2, US3-AS1, US3-AS2]
  Depende de T022. Ejecutar suite, build, Chromium y checks de límites. Auditar
  si cambió lockfile/dependencias desde preparación. Registrar comandos y salidas
  reales, avisos/omisiones y la repetición íntegra de checkpoints que fallaron.
  Observar CI del commit exacto antes de merge; si no hay CI, declararlo pendiente.
- [ ] T024 [US1, US2, US3; FR-001, FR-002, FR-003, FR-004, FR-005, FR-006,
  FR-007, FR-008, FR-009, FR-010, FR-011; US1-AS1, US1-AS2, US1-AS3,
  US1-AS4, US1-AS5, US1-AS6, US2-AS1, US2-AS2, US3-AS1, US3-AS2]
  Depende de T023. Converge contra spec, plan y constitución: cero gaps nuevos;
  contrastar firmas/callers y compatibilidad temporal. Añadir fase de convergencia
  si aparece gap. Preparar PR de código con pruebas previstas/ejecutadas y límites.
  Proponer cierre de KD-001 solo si hay evidencia; enmienda propia para retirarla.

## Dependencias y puertas externas

G-DOC: aprobación del propietario de tareas y analyze, PR documental abierto y
fusionado por el propietario después de sus dependencias (enmienda/readiness).
No marcar la puerta cumplida por guardar estos archivos o crear un commit local.

Orden: G-DOC → T001 → T002–T011 → T012/G-PIN → T013 → T014 → T015 → T016 →
T017 → T018 → T019 → T020 → T021 → T022 → T023 → T024.
Las dependencias solo permiten paralelismo de ejecución de tests aislados;
no se ha solicitado delegación a agentes.

## Revisión inicial de tareas

- [x] Los 11 FR y los 10 escenarios trazan a T002–T011 con nombres concretos.
- [x] Todos los AS-IS tocados se fijan en la fase bloqueante antes de extraer.
- [x] No hay CHANGE aprobado: no se inventan tests rojos de producto.
- [x] Dependencias imponen ambas puertas y el orden test-first; no hay fases vacías.
- [x] No se confunde piloto parcial con pin completo; se amplía runner en T012.
- [x] Mutaciones conservarán aserciones aunque cambie su punto de instrumentación.
- [x] Tareas habilitadoras trazan al resultado de historias explícitas.
- [x] Analyze documental disponible; aprobación y merge siguen pendientes.

## Registro de ejecución

No hay tareas T001–T024 ejecutadas todavía. Preparación anticipada: ver
[readiness](../../docs/sdd/readiness.md). Al cerrar una tarea registrar: qué se
hizo, revisión, comando y salida/test/números, y cualquier desviación del plan.
No completar casillas por diseño, por estimación ni por existencia del piloto.
