# Plan técnico 008 — borrado fiable

Estado vigente — 2026-10-27 (Bogotá): 008 integrada mediante #18/#19;
CI de main y Vercel Production verificados en `1f6b29d`.
[Entrega remota](evidence/integration.json). Las etapas siguientes conservan
la cronología local; sus esperas de autorización e integración están cumplidas.


Ejecución local completada — 2026-10-24 (Bogotá): E0–E3 y 38 tareas
(36 aprobadas más T037/T038 aditivas), con RLS fresco y ocho contratos/234 IDs.
[Converge](converge.md). Las exclusiones de publicación, fusión y Vercel siguen vigentes.

Estado: aprobado el 2026-10-22 (Bogotá), junto con tareas y análisis.
El propietario autorizó ejecución local E0–E3 antes de integrar el documental.
No autoriza publicar, fusionar ni desplegar.
Alcance aprobado en `462a344`, el 2026-10-22 (Bogotá).
[Spec](spec.md), [tareas](tasks.md), [decisiones](research.md),
[validación](validation-plan.md), [análisis](analyze.md).
BASE de producto: `06177642060393b85ff0181e371cc18a317d97ea`.
SourceHash original: `0d01417177a2f231d480a09ba77949cf781ce901b161cb2092f8fa2724718802`.
`c0ab936` y el alcance aprobado solo añaden documentación sobre ese producto.

## Entregas y puertas

- G-DOC: aprobar este plan, 36 tareas y análisis; se propone autorizar E0–E3
  local antes de integrar el documental, conservando un snapshot aprobado.
  Publicación, fusión y Vercel requieren autorización posterior específica.
- E0 / T001–T012: repetir original con Node 24.21.0/pnpm 11.11.0, inventariar
  llamadores y firmas, cuatro AS-IS verdes y trece CHANGE rojos específicos
  (tres de núcleo, nueve de App, uno Chromium). Congelar ocho archivos propios.
  G-PIN: siete IDs AS-IS completos, veintidós pending; src original intacto.
- E1 / T013–T019: motor sin recuperación automática, coordinador por intento y
  sesión, enmienda controlada del pin y composición de resolutores. Checkpoint
  parcial: heredados, cuatro AS-IS y tres CHANGE del núcleo verdes; los nueve
  casos de App y el Chromium nuevo quedan pendientes de reevaluar en E2.
  Matriz: ocho complete (siete AS-IS y FR-005), veintiuno pending.
- E2 / T020–T027: adaptar sesión/carga/guardados, feedback y recuperación con
  barrera posterior al commit de React. Todos los casos 008 pasan: 29 IDs
  complete. Descubrimiento ordinario de Node y Chromium sin filtros; build.
- E3 / T028–T036: cinco mutaciones, RLS local fresco con limpieza, ocho contratos
  y 234 IDs completos, CI y converge. Preparar ambos PRs, sin publicarlos.

325 Node/29 Chromium son referencia del producto anterior, no evidencia nueva.
El total Node futuro se registrará desde el runner, incluidos subcasos; no se
finge un total sumando nombres. Se prevén 30 casos Chromium al añadir el caso 008.
Cada checkpoint fallido se repetirá entero después de corregirlo. No usar skips,
retries de Playwright ni filtros permanentes para presentar un cierre verde.

## Fronteras y responsabilidades

| Archivo | Cambio propuesto | Límite |
| --- | --- | --- |
| src/app-data-lifecycle.js | Evolucionar deleteUserData: fases, comprobación de vigencia alrededor de cada espera, inspección de error de signOut y ausencia de recuperación automática | Conservar nombre y objeto de dependencias actual, ampliable con callbacks internos; carga/import/export sin rediseño; sin React ni cliente global |
| src/delete-coordinator.js (nuevo) | Estado estable del intento, sesión de origen, exclusión de duplicados, recuperación y cierre manual; delega la secuencia a deleteUserData | Sin React, DOM, SDK ni persistencia; efectos y lectura de actor inyectados; sin camino de borrado alternativo |
| src/use-delete-flow.js (nuevo) | Adaptación React del coordinador: snapshot, suscripción, montaje/limpieza y confirmación de recuperación después del commit | No decide borrados ni toca directamente Supabase |
| src/DeleteFeedback.jsx (nuevo) | Progreso/error por fase y acciones accesibles con textos fijos | No ejecuta Storage/SQL; no muestra error técnico crudo ni promete rollback |
| src/FitTrack.jsx | Construir una instancia por App, inyectar efectos, actualizar generación de sesión y cerrar las entradas de carga/sincronización durante el bloqueo | Cola, payloads, tema, navegación, import/export y lógica de pantallas conservados |
| src/SettingsScreen.jsx | Conservar prompt y removeAllData; feedback de App reside fuera de Ajustes | Mantener props, ancla de nutrition-build y compatibilidad aislada/previews; cualquier fallback local usará texto genérico |

Único llamador productivo de deleteUserData: App. AccountScreen transmite
deleteAllData; Settings lo invoca; preview-main y fixtures usan callbacks
sintéticos. No cambiar sus firmas ni mover el ancla de captura de build-harness.
El motor conserva la forma de dependencias para contextos estables; el adaptador
productivo siempre inyecta la comprobación del actor vigente.

El coordinador puede importar el motor; el motor no importa el coordinador.
Así, el grafo histórico de data-architecture sigue acotado y no se necesita
debilitar su allowlist. Las pruebas nuevas comprobarán el grafo del coordinador
y negativos de React, DOM y cliente global.

## Intento, sesión y secuencia

Un intento captura usuario, generación de sesión y un identificador propio.
La generación cambia al cambiar usuario o pasar por ausencia de sesión; no
cambia por refrescar token del mismo usuario. La referencia se actualiza en
el callback de auth antes de esperar un efecto de React. App recibe también
una señal de generación para que A→B→A batido no se pierda por comparar solo UID.

El bloqueo y la exclusión del intento se establecen antes del primer await.
El motor conserva suspensión, espera capturada, fotos, DELETE y cierre en orden.
Comprueba vigencia antes de cada nuevo efecto y después de resolver cada espera.
Marca DELETE como despachado antes de llamarlo y como confirmado solo al resolver
sin error. El retorno error y el rechazo de signOut se tratan como cierre fallido.

Si la sesión se invalida, el resultado anterior no cambia loaded, estado visible,
datos ni guardados de la nueva. No empieza pasos posteriores ni signOut sobre B.
El finally de A tampoco puede limpiar un intento posterior de B. Las peticiones
ya enviadas no se cancelan ni se consideran revertidas. Un fallo vigente conserva
el error original para el contrato de promesa; la UI publica un resultado seguro.

Snapshots inmutables y de identidad estable mientras no cambien los campos;
useSyncExternalStore ya está disponible. La instancia pertenece a App, no a un
singleton que mezcle raíces/previews. Cleanup invalida el trabajo anterior y
retira listeners; StrictMode setup→cleanup→setup debe volver a funcionar sin
duplicar efectos ni dejar permanentemente desactivado el coordinador.

## Recuperación y barrera de commit

Antes del despacho de DELETE, el fallo mantiene el bloqueo. La acción manual
Recargar datos usa loadUserData y las migraciones/hidratación existentes, con
cancelación lógica por intento/sesión. Sus setters solo se aplican si sigue
vigente. Una lectura fallida conserva bloqueo y error; no restaura fotos borradas.

Una lectura exitosa no basta para llamar inmediatamente resumeUserSaves. El
coordinador publica recuperación lista para aplicar, conservando el bloqueo.
El adaptador confirma el identificador de recuperación tras el commit en que
los datos frescos y loaded ya están aplicados. Solo entonces se reanuda y libera
el bloqueo. Una confirmación obsoleta no produce efectos. Esto impide habilitar
los doce hooks sobre valores anteriores por el orden de sus efectos.

Después del despacho de DELETE, incluso con resultado incierto, no se ofrece esa
recarga para reabrir edición. Se ofrece cierre manual de la sesión de origen;
si ya se confirmó la eliminación, se comunica Datos eliminados y cierre fallido.
Reintentar cierre solo llama signOut, sin repetir fotos ni DELETE. Mientras dure
una recuperación o cierre, otra activación no duplica la acción. No hay reintentos
destructivos automáticos ni temporizadores nuevos para dar por cancelada la red.

## Entradas que deben quedar protegidas

- Carga ordinaria: no reanudar ni iniciar si el intento vigente bloquea; una
  carga anterior que termine durante el borrado no puede aplicar sus setters.
- Visibilidad e intervalo de doce horas: consultar el bloqueo vigente antes de
  incrementar loadAttempt o renovar fotos; comprobar ambos disparadores aparte.
- Doce useSyncedValue: conservar demora y valores, pero habilitar solo con loaded,
  sesión/generación coherente y ausencia de bloqueo. No modificar save-coordinator
  ni la política de errores de 007.
- Recuperación manual: único camino temprano que puede cargar durante el bloqueo;
  conserva su barrera hasta la confirmación de commit. B carga y guarda de forma
  independiente cuando ya no hay intento vigente de su propia sesión.

## Presentación y compatibilidad

DeleteFeedback se presenta en la raíz autenticada antes del fallback genérico
de carga mientras su intento sea vigente. Sustituye la pantalla desmontada y
mantiene tema, textos de fase, nombre de controles y anuncio de estado/error.
El fallo no depende de deleteError de una instancia anterior de Settings.

No hay botón que prometa cancelar una petición enviada. No modificar la cadena
CSS histórica; usar estilos locales y clases existentes. Preservar siete anchos,
foco, shell normal, ft-focus, Toast y señal de guardado 007. La selección local
de AccountScreen mantiene su contrato: no se promete restaurarla tras desmontar.

## Enmienda de contratos y firmas

E0 valida 108 firmas existentes: 101 efectivas con las enmiendas 006/007, seis
archivos congelados 007 y su caso suplementario firmado. Se archivarán sus hashes
efectivos y el contenido original de test/data-delete.test.js y del adaptador.

PIN-008-001, después del rojo previo y del verde dirigido E1, cambia solo las
expectativas de recuperación automática y error de retorno ignorado del caso
datos borrado orden y recuperacion. Mantener sus garantías de orden, propietario,
cola, rechazo sin usuario y efectos parciales. Los nuevos casos prueban por
separado recuperación manual, error visible y aislamiento. Añadir adenda a
001 FR-011/US3-AS2; la presentación de 006 FR-012 se enmienda en E2.

Los cinco verificadores históricos ya consultan approvedSavePinHash. Componer
al final un resolutor 008 estricto desde un módulo independiente
scripts/delete-pin-amendments.js; este no importará el helper 007 ni leerá una
baseline ausente para archivos desconocidos. Mantener las cadenas 006/007.
El helper 008 de evidencia puede reutilizar utilidades 007 sin formar un ciclo.
No hacen falta nuevas modificaciones de los cinco validadores ni sus pins.
Previsión: 107/108 archivos intactos y uno enmendado, además de ocho pins nuevos.

Un conflicto adicional exige documentar FR y añadir tarea de converge antes
de cambiar la expectativa. No ampliar esta autorización a cambios de geometría,
exportaciones ajenas, reparación de TEST-001 o debilitamiento de verificación.

## Checkpoints, CI y cierre

El runner por etapa seleccionará archivos explícitos en E0/E1, sin test.skip.
E1 no afirmará que App/Chromium nuevo sigue rojo sin reevaluarlo: conserva los
rojos E0 y declara pendiente esa integración. E2/E3 usan descubrimiento ordinario.
Revisar nombres y aserciones, no solo counts. RLS 002 no se recertifica en E1/E2;
E3 exige evidencia fresca sobre destino local desechable, con guardas y limpieza.

Mutaciones postverde: ignorar error de signOut; reactivar loaded/guardados al
fallar; omitir vigencia antes del siguiente paso/cierre; quitar bloqueo de
visibilidad; liberar recuperación antes del commit. Cada una requiere control
positivo, fallo de negocio específico, cero skips/retries y copia aislada con
propietario/ruta verificados, sin .env y con limpieza y sourceHash conservados.
Las verificaciones locales pesadas se ejecutarán secuencialmente.

Añadir CI completa 008 y artefactos; conservar las siete puertas anteriores,
mutaciones 006/007 y RLS separado. No hay dependencias nuevas, instalación local
ni auditoría por esta preparación documental. CI conserva instalación congelada.
Medir delta de bundle contra E0; el aviso >500 kB no se oculta ni se optimiza aquí.

El cierre local tendrá 29 IDs 008 y 234 en ocho contratos, cero partial/pending,
RLS fresco, revisión de cláusulas y PRs preparados con orden documental→código.
Reversión de código/adendas/pins mediante revert coordinado; nunca revertir datos.
No publicar, fusionar ni desplegar por la aprobación de alcance o de este plan local.
