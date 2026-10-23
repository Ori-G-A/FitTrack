# Survey 008 — borrado fiable

Fecha: 2026-10-22 (Bogotá). Propuesta; alcance pendiente de aprobación.
Base de producto: `06177642060393b85ff0181e371cc18a317d97ea` (007 integrada).
La rama parte de `c0ab936`, que añade solamente el cierre documental verificado.
SourceHash: `0d01417177a2f231d480a09ba77949cf781ce901b161cb2092f8fa2724718802`.

## Recorrido y responsables

| Frontera | Código observado | Responsabilidad |
| --- | --- | --- |
| Confirmación y feedback local | `src/SettingsScreen.jsx:20`, `:41`, `:174` | Prompt exacto ELIMINAR; busy/error locales; muestra el error si esa instancia sigue montada |
| Coordinación del borrado | `src/app-data-lifecycle.js:79` | Suspende usuario, deshabilita loaded, espera cola, fotos, app_data y signOut; catch reanuda y restaura loaded |
| Sesión, carga y render | `src/FitTrack.jsx:152`, `:183`, `:203`, `:244`, `:302` | Cambio de usuario, recuperación por visibilidad/12 h, adaptadores y sustitución de toda la pantalla al deshabilitar loaded |
| Filtrado de registros | `src/data-operations.js:33` | DELETE app_data con user_id; propaga retorno error |
| Borrado de fotos | `src/photo-storage.js:60` y servicio de fotos | Fachada de 002; operación paginada por propietario, sin transacción compartida con app_data |
| Guardados | `src/save-coordinator.js`, `src/data-sync.js` | Suspensión, cola y estado fiable de 007; la carga de App reanuda al usuario |

Llamadores: Settings recibe deleteAllData a través de AccountScreen; App inyecta
deleteUserData. signOut normal también se ofrece desde Cuenta, pero esta propuesta
no rediseña todos los cierres de sesión de la aplicación.

## Diagnóstico ejecutado

Node **24.21.0**, pnpm con runtime fijado. Servicios sustituidos por
`test-support/fake-supabase.js`, red real excluida por el harness y filas sintéticas.
No se leyó `.env.local` ni se llamó al backend real. Seis observaciones verificadas;
src conserva el mismo hash antes y después. [Resultado](../../specs/008-borrado-fiable/evidence/survey.json).

| ID | Reproducción en el código original | Resultado observado |
| --- | --- | --- |
| D008-01 / DATA-004 | signOut resuelve `{error}` | loaded permanece false; se presenta Cargando tus datos sin error visible |
| D008-02 / DATA-005 | Listado Storage diferido falla después de desmontar Ajustes | loaded vuelve a true, pero el error local de la instancia anterior no aparece |
| D008-03 / DATA-006 | DELETE app_data simulado borra filas; signOut rechaza | Se habilita loaded y se reemiten doce guardados automáticos; reaparece el peso anterior |
| D008-04 / DATA-008 | Borrado detenido en Storage; se emite visibilitychange visible | Doce nuevas lecturas reanudan al usuario y habilitan loaded; se acepta otro guardado mientras sigue el borrado |
| D008-05 / DATA-007 | A borra; B cambia de sesión y su carga queda pendiente; falla A | El catch de A habilita loaded para B; se emite a B un payload de pesos que todavía contiene el valor de A |
| D008-06 / DATA-007 | DELETE de A ya despachado queda pendiente; entra B; termina DELETE | El paso signOut se despacha cuando la cuenta activa es B |

Los dobles muestran llamadas y payloads del cliente, no incidentes acreditados
en producción. D008-03 modela expresamente la eliminación efectiva de filas;
el doble predeterminado solo registra DELETE y no bastaría para demostrarla.
D008-06 cambia de cuenta después de despachar DELETE, sin suponer que RLS permita
una petición nueva de B para borrar filas de A.

El sondeo reproducible se conserva en
`specs/008-borrado-fiable/evidence/survey-probe.mjs`; se ejecuta desde la raíz con
`pnpm exec node specs/008-borrado-fiable/evidence/survey-probe.mjs`.
Es diagnóstico preparatorio, **no G-PIN**, ni rojo/verde contractual congelado.
El plan posterior deberá fijar caracterización y pruebas CHANGE sobre BASE antes
de modificar src. No se ejecutó una suite completa nueva por esta propuesta.

## Alcance recomendado

Corregir DATA-004/005 junto con sus dependencias del mismo flujo: impedir que un
fallo reactive estado anterior, que visibilidad/intervalo levante la suspensión
y que un resultado de otra sesión altere la actual. Separar resultado de datos
y resultado de cierre de sesión; conservar feedback fuera de Ajustes.

Propuesta de recuperación conservadora: antes de despachar DELETE app_data,
permitir una recarga manual completa del servidor antes de reanudar edición.
Después de despacharlo, conservar el bloqueo hasta salir de la sesión de origen,
sin volver a guardar su estado anterior; una respuesta perdida no demuestra que
el servidor no haya aplicado el borrado. Si el borrado se confirmó y falla signOut,
reintentar solo el cierre por acción explícita, sin repetir fotos ni DELETE.

Conservar confirmación, orden de cola/fotos/datos y propiedad. No prometer rollback,
atomicidad ni cancelación remota de peticiones iniciadas. No añadir reintentos
destructivos automáticos, caché durable ni cambios de SQL o de algoritmos.

## Contratos y pins afectados

001 FR-011 y US3-AS2 describen recuperación automática y retorno error de signOut
ignorado: necesitarán una adenda aprobada, sin reescribir su evidencia histórica.
006 FR-012 conserva presentación de carga/reintento: la nueva presentación del
borrado necesitará una adenda limitada. 002 conserva operaciones de fotos y RLS;
007 conserva su política de errores de guardado.

`test/data-delete.test.js` fija expresamente recuperación automática y retorno
error ignorado. Sus expectativas contradictorias solo se podrán enmendar después
de aprobar alcance/plan, archivar originales, caracterizar BASE y citar FR 008.
El inventario completo de firmas y otros consumidores corresponde al plan; no
se supone que este sea el único archivo afectado. No hay pins modificados ahora.

## Puertas

[Spec propuesta](../../specs/008-borrado-fiable/spec.md): cuatro AS-IS,
nueve CHANGE y dieciséis escenarios. C-001/002/003 propuestas, no aprobadas.
Primero aprobar alcance/aclaraciones; después preparar plan/tareas/análisis para
aprobación separada. No hay implementación, publicación, fusión ni Vercel 008
autorizados por continuar esta preparación.
