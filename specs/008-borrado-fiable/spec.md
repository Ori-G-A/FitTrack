# Spec 008 — borrado fiable y recuperación visible

Estado: ALCANCE y C-001/002/003 APROBADOS; plan técnico pendiente.
Propietario: usuario del proyecto. Fecha: 2026-10-22 (Bogotá).
Gobierno: [constitución 1.0.3](../../.specify/memory/constitution.md).
Evidencia: [survey](../../docs/sdd/borrado-fiable-survey.md) y
[diagnóstico sintético](evidence/survey.json). Producto BASE: `0617764`.

## Resultado de usuario e intención

Saber qué parte del borrado se confirmó, conservar una salida comprensible si
falla y evitar que la recuperación vuelva a enviar datos anteriores o afecte
otra cuenta. Se medirá con fallos diferidos, resultados por etapa, cambios de
cuenta y recorridos en móvil/escritorio, sin usar datos reales.

## Alcance y restricciones

DATA-004/005 y sus dependencias reproducidas DATA-006/007/008: coordinación del
borrado, feedback persistente en la sesión, bloqueo de guardados y recuperación.
Trece FR: cuatro AS-IS y nueve CHANGE; dieciséis escenarios, 29 IDs propuestos.
No elige módulos, firmas ni librerías; esas decisiones pertenecen al plan.

La sesión de origen deja de ser vigente al cambiar de cuenta o salir y volver a
entrar; un refresco de token del mismo usuario no es por sí solo ese cambio.
El bloqueo se refiere a nuevas admisiones/sincronizaciones; las escrituras ya
capturadas conservan su espera antes del borrado. No hay cancelación remota.

## Historias y escenarios

### US1 — Borrar solo después de confirmar y en el orden correcto (P1)

- US1-AS1: Dada la confirmación cancelada o distinta de ELIMINAR, cuando se
  solicita borrar, entonces no comienza ningún efecto de borrado.
- US1-AS2: Dada ausencia de usuario, cuando se invoca el caso de uso, entonces
  rechaza antes de suspender, esperar, borrar o cerrar sesión.
- US1-AS3: Dada sesión estable y guardados capturados, cuando el borrado termina
  sin fallos, entonces suspende nuevas entradas, espera lo capturado, elimina
  fotos propias, elimina app_data propio y solicita cierre en ese orden.
- US1-AS4: Dado un intento pendiente, cuando se repite la acción, entonces no
  se inicia una segunda secuencia destructiva para ese mismo intento.

### US2 — Entender el fallo y no confundir borrado con cierre (P1)

- US2-AS1: Dado Storage diferido, cuando falla después de desmontar Ajustes,
  entonces el error permanece visible al volver, sin depender de esa instancia.
- US2-AS2: Dado DELETE app_data despachado, cuando falla o se pierde su resultado,
  entonces informa que no pudo confirmarlo y no afirma que nada se haya eliminado.
- US2-AS3: Dado app_data eliminado con confirmación, cuando signOut resuelve error,
  entonces informa datos eliminados y cierre fallido, sin restaurar guardados.
- US2-AS4: Dada la misma eliminación confirmada, cuando signOut rechaza, entonces
  mantiene el mismo resultado y bloqueo, sin reenviar las doce colecciones previas.
- US2-AS5: Dado cierre fallido después del borrado, cuando se reintenta cerrar
  explícitamente, entonces solo solicita cierre de la sesión de origen vigente.

### US3 — Recuperar sin reactivar estado anterior (P1)

- US3-AS1: Dado borrado pendiente o bloqueado, cuando vuelve visible la pestaña,
  entonces la recuperación ordinaria no levanta su bloqueo ni inicia otra carga.
- US3-AS2: Dado ese estado, cuando llega el intervalo de recuperación de doce
  horas, entonces tampoco habilita guardados ni reanuda la carga ordinaria.
- US3-AS3: Dado fallo antes de despachar DELETE app_data, cuando la recarga manual
  de recuperación falla, entonces conserva el bloqueo y un error visible.
- US3-AS4: Dado ese fallo temprano, cuando la recarga manual completa tiene éxito,
  entonces reemplaza el estado desde el servidor antes de reanudar edición;
  no garantiza restaurar fotos que ya se hayan eliminado.

### US4 — Aislar intentos y cuentas (P1)

- US4-AS1: Dado borrado A y carga B pendiente, cuando falla A, entonces no cambia
  loaded de B ni emite a B guardados con los valores anteriores de A.
- US4-AS2: Dado DELETE A en curso, cuando cambia a B y termina A, entonces no
  solicita signOut de B ni despacha pasos nuevos del intento ya no vigente.
- US4-AS3: Dado cambio A→B→A, cuando termina un intento de la primera sesión A,
  entonces no altera la nueva sesión A ni reaparece allí su error anterior.

## Requisitos funcionales

- FR-001 [AS-IS] Cuando la confirmación se cancele o no sea exactamente ELIMINAR,
  el sistema deberá conservar la ausencia de efectos del borrado.
- FR-002 [AS-IS] Si falta usuario, entonces el caso de uso deberá rechazar antes
  de producir efectos o cambiar el estado de carga.
- FR-003 [AS-IS] Cuando se borre sin fallos ni cambio de sesión, el sistema deberá
  conservar el orden suspensión → espera capturada → fotos propias → app_data
  filtrado por usuario → solicitud de cierre, sin borrar el usuario de acceso.
- FR-004 [AS-IS] Cuando falle una etapa después de otros efectos confirmados,
  el sistema deberá conservar la ausencia de rollback distribuido; las operaciones
  de fotos mantienen su contrato de paginación, propiedad y fallos de 002.
- FR-005 [CHANGE] Cuando signOut resuelva con error o rechace, el sistema deberá
  tratar ambos resultados como cierre fallido y no declarar completado ese cierre.
- FR-006 [CHANGE] Mientras un intento esté pendiente o conserve un fallo, el sistema
  deberá presentar texto de progreso/error y acciones disponibles a 390/1280 px,
  con nombre accesible y anuncio de estado; seguirá visible sin la instancia de
  Ajustes. No expondrá el mensaje técnico crudo del backend ni datos de otra cuenta.
- FR-007 [CHANGE] Cuando falle el borrado, el sistema deberá distinguir datos
  confirmadamente eliminados, borrado de registros no confirmado y fallo previo
  a despachar DELETE; no afirmará restauración, atomicidad ni ausencia de efectos
  parciales por el mero rechazo o timeout de una promesa.
- FR-008 [CHANGE] Desde que comienza el intento, el sistema deberá mantener el
  bloqueo de nuevos guardados de su sesión de origen hasta la recuperación
  explícita permitida o su salida; visibilidad, intervalo y carga ordinaria no
  podrán levantarlo ni volver a enviar el estado previo tras el borrado.
- FR-009 [CHANGE] Si el intento falla antes de despachar DELETE app_data y la
  sesión de origen sigue vigente, entonces el sistema deberá ofrecer recuperación
  por recarga manual completa del servidor; solo reanudará edición/guardados tras
  su éxito y aplicación íntegra. Si falla la lectura, conservará bloqueo y error.
- FR-010 [CHANGE] Si DELETE app_data ya se despachó y el intento no culmina, entonces
  el sistema deberá conservar el bloqueo hasta salir de la sesión de origen;
  ofrecerá cierre explícito de esa sesión, sin repetir fotos ni DELETE. Tras borrado
  confirmado y cierre fallido, presentará esa diferencia y permitirá reintentar
  únicamente el cierre; no restaurará el estado anterior mediante loaded=true.
- FR-011 [CHANGE] Cuando la sesión de origen deje de ser vigente, el sistema deberá
  excluir sus resultados de la sesión actual, no cambiar su carga, datos ni errores
  y no despachar nuevos pasos o cierres del intento anterior. No se cancelan por
  contrato peticiones ya enviadas; volver al mismo usuario no revive aquel intento.
- FR-012 [CHANGE] Mientras persista un fallo del intento vigente, el sistema deberá
  conservar su estado durante desmontajes de pantallas de esta ejecución hasta
  recuperación permitida, cierre o invalidación de la sesión; no añadirá caché
  durable ni prometerá continuidad tras recargar la página.
- FR-013 [CHANGE] Mientras haya un intento pendiente o una acción de recuperación
  en curso, el sistema deberá impedir secuencias duplicadas del mismo intento;
  no reintentará pasos destructivos automáticamente. Un nuevo borrado tras una
  recuperación temprana exitosa requerirá otra confirmación explícita.

## Evidencia AS-IS y evolución contractual

| FR | Código original | Evidencia existente y límite |
| --- | --- | --- |
| FR-001 | `src/SettingsScreen.jsx:41` | Prompt exacto inspeccionado; caracterización adicional cancelación/variantes pendiente |
| FR-002 | `src/app-data-lifecycle.js:81` | test/data-delete.test.js: FR-011 US3-AS1 sin usuario no produce efectos |
| FR-003 | `src/app-data-lifecycle.js:82–88`, `src/data-operations.js:33` | datos borrado orden y recuperacion; no demuestra guardas nuevas ni error de retorno corregido |
| FR-004 | `src/app-data-lifecycle.js:85–93` | Casos de fallos por etapa de 001 y lotes parciales de identidad fotos; no prueban rollback |

La corrección necesita una adenda limitada a 001 FR-011/US3-AS2 y a la
presentación de borrado de 006 FR-012. La excepción actual de retorno error
ignorado y la recuperación automática no serán garantías a conservar en 008.
No se modifican ahora esas specs ni pins. 002 y la semántica de guardado 007
permanecen vigentes. Un pin contradictorio requerirá original archivado, motivo
por FR y prueba sobre BASE antes de su enmienda, según el plan que se apruebe.

## Criterios medibles de aceptación

- SC-001: Los 29 IDs tendrán pruebas reales descubiertas y aprobadas al cierre;
  esta propuesta tiene todos pending y no anticipa ese resultado.
- SC-002: Caracterizar AS-IS sobre BASE y obtener rojos específicos de cada
  CHANGE antes de implementar; conservar originales y fallos de los checkpoints.
- SC-003: Probar retorno error y rechazo de signOut por separado, Storage y DELETE
  diferidos, duplicados, recuperación fallida/exitosa y cambios A→B→A.
- SC-004: Probar que no se escriben valores anteriores tras la eliminación ni
  valores de A a B, y que la recuperación ordinaria no levanta el bloqueo.
- SC-005: Chromium demostrará feedback y controles operables a 390/1280, sin
  confundir presencia en DOM con visibilidad ni ARIA con una prueba de lector real.
- SC-006: El plan exigirá suite/build, contratos previos compatibles con adendas
  aprobadas y RLS local desechable fresco; no usará backend real ni .env.local.

## Fuera de alcance y compatibilidad temporal

- Eliminar la cuenta de autenticación, cambiar confirmación o fórmulas clínicas.
- Rediseñar importación/exportación, payloads, cola, política de errores 007,
  algoritmos, límites de fotos, migraciones SQL o políticas RLS.
- Rollback entre Storage y app_data, reconciliación de fotos ya perdidas,
  cancelación remota, nuevas transacciones o continuidad después de recargar.
- Reintentos destructivos automáticos, caché durable, tiempos de espera nuevos
  y rediseño del cierre de sesión normal fuera de este flujo.
- Publicación, integración, Vercel y prueba autenticada de producción.

DATA-002 sigue siendo una limitación distribuida explícita: una recarga no
restaura archivos ya eliminados. El diagnóstico 008 no acredita incidentes en
producción ni sustituye la baseline contractual. TEST-001 del reloj se conserva
en su seguimiento; esta propuesta no mezcla su reparación con el borrado.

## Aclaraciones aprobadas — 2026-10-22

- C-001 [APROBADA]: Recuperación conservadora según despacho de DELETE:
  antes, recarga manual completa antes de editar; después, bloqueo hasta salir
  de esa sesión, porque un error no prueba que el servidor no haya borrado.
  Añade fricción ante fallos tardíos a cambio de evitar reenvíos del estado previo.
- C-002 [APROBADA]: Separar datos eliminados de cierre fallido y permitir solo
  reintento manual de cierre después del borrado; no repetir fotos/DELETE ni
  prometer rollback o recuperación de archivos.
- C-003 [APROBADA]: Aislar cada intento a su sesión de origen, bloquear duplicados
  y recuperación ordinaria mientras corresponda, sin caché durable ni continuidad
  garantizada después de recargar. No extender esto a todos los cierres normales.

Las tres decisiones fueron aprobadas por el propietario junto con el alcance.
Permiten preparar el plan; no autorizan implementar sin su aprobación separada.

## Trazabilidad

Una fila por FR y escenario en [manifiesto](traceability.json), todos pending.
Los nombres previstos se detallan en [validación propuesta](validation-plan.md).
No hay tareas ni plan técnico aprobados; la matriz no afirma pruebas ejecutadas.

## Aprobación

El propietario respondió «Aprobar alcance y las tres aclaraciones» el 2026-10-22
a la pregunta de aprobar cuatro AS-IS, nueve CHANGE, dieciséis escenarios y
C-001/002/003. Autoriza preparar plan, tareas y análisis para aprobación separada;
no autoriza implementar, publicar, fusionar ni desplegar 008.
