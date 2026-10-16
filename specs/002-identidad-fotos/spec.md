# Spec 002 — Identidad y fotos privadas

Estado: ALCANCE APROBADO, 2026-10-15, mediante «Aprobar alcance y ambos cambios
propuestos». Plan técnico y tareas pendientes de su propia puerta de aprobación.
Gobierno: [constitución](../../.specify/memory/constitution.md).
Evidencia: [survey](../../docs/sdd/identidad-fotos-survey.md).

## Resultado de usuario y alcance

Acceder a la cuenta y conservar fotos propias, con errores observables según
el contrato y sin exponer secretos en diagnósticos. Se propone caracterizar
autenticación, sesión, Storage, adaptación de imágenes y reporting; separar
coordinación de fotos de E/S de navegador; verificar políticas existentes
en servidor local. 001 conserva la coordinación de app_data y borrado global.

## Historias y escenarios

### US1 — Acceder a mi cuenta

- US1-AS1: Dadas credenciales, cuando entro o me registro, entonces se envía
  correo normalizado, contraseña intacta y se aplica el plazo de FR-001.
- US1-AS2: Dado registro corto o respuesta de error, cuando envío desde UI,
  entonces veo el mensaje correspondiente y el formulario recupera disponibilidad.
- US1-AS3: Dada consulta de sesión pendiente o cambio de usuario, cuando llega
  respuesta/evento o se desmonta, entonces la coordinación sigue FR-003.

### US2 — Conservar y recuperar fotos

- US2-AS1: Dado archivo admitido, cuando lo preparo y subo, entonces mantengo
  límites, JPEG comprimido y ruta propia antes de recibir URL firmada.
- US2-AS2: Dadas fotos remotas o embebidas, cuando hidrato o renuevo URLs,
  entonces se conservan orden, metadatos y fallback individual de FR-007.
- US2-AS3: Dadas fotos para copia, cuando materializo el backup, entonces todas
  quedan embebidas o la operación rechaza sin entregar una copia parcial.
- US2-AS4: Dado borrado de fotos, cuando termina o falla un lote, entonces
  respeta paginación, orden y propagación de FR-009 sin prometer rollback.
- US2-AS5: Dados dos usuarios y anónimo, cuando operan en servidor local,
  entonces las políticas existentes delimitan acceso según FR-011.

### US3 — Diagnosticar errores sin exponer datos

- US3-AS1: Dado reporting habilitado y sesión, cuando reporto un fallo,
  entonces se sanitiza, deduplica y limita con la semántica de FR-010.
- US3-AS2: Dada configuración inválida o caída del servicio opcional,
  cuando se activa el caso correspondiente, entonces se aplica el comportamiento
  aprobado por FR-012/013.

## Requisitos EARS

- FR-001 [AS-IS] Cuando se autentica, el sistema deberá aplicar trim/lowercase
  al correo, conservar contraseña y elegir signInWithPassword en modo login
  o signUp en el otro modo; deberá propagar error devuelto, excepción y timeout
  de 15000 ms, sin cancelar ni afirmar fracaso remoto definitivo.
- FR-002 [AS-IS] Cuando el usuario envía desde AuthScreen, el sistema deberá
  ignorar campos vacíos, rechazar registro con contraseña menor de 8 caracteres,
  deshabilitar inputs y botón de envío mientras espera, mostrar confirmación de
  registro o error y restablecer busy; invalid_credentials tendrá mensaje propio.
  Al cambiar modo deberá limpiar mensaje y conservar valores de campos.
- FR-003 [AS-IS] Cuando App monta o reintenta sesión, el sistema deberá consultar
  getSession con plazo 15000 ms, observar eventos y desuscribir al limpiar;
  una consulta completada tras cleanup no deberá aplicar estado. Un cambio de
  userId deberá reiniciar loaded y loadError antes de cargar datos del siguiente.
  Un fallo deberá mostrar el error genérico de verificación. No se añade una
  garantía nueva de orden entre consulta inicial y evento concurrente.
- FR-004 [AS-IS] Cuando se selecciona una imagen, el sistema deberá admitir
  JPEG/PNG/WebP/HEIC/HEIF hasta 25 MiB inclusive y rechazar otros tipos/tamaños;
  al comprimir deberá generar JPEG con calidad predeterminada 0,62, dimensión
  máxima 820 px sin ampliar, dimensiones redondeadas y objectURL liberado tanto
  tras carga como ante fallo de decodificación.
- FR-005 [AS-IS] Cuando se sube una foto con dataUrl, el sistema deberá convertir
  a Blob, usar JPEG/PNG/WebP o contentType JPEG como fallback, generar ruta
  userId/ID saneado de hasta 80 caracteres con extensión correspondiente,
  ejecutar upload upsert y después firmar. Deberá conservar id/fecha o generarlos
  si faltan y propagar fallos de subida/firma; no eliminará el objeto ya subido.
- FR-006 [AS-IS] Cuando una foto tiene storagePath y no dataUrl, el sistema
  deberá solicitar URL firmada por 86400 segundos y conservar metadatos;
  en caso contrario deberá devolver la foto sin firmar. Al preparar persistencia
  deberá excluir únicamente signedUrl. Las peticiones Storage deberán tener
  plazo local de 20000 ms, sin prometer cancelación remota.
- FR-007 [AS-IS] Cuando hidrata o renueva una colección, el sistema deberá
  devolver array vacío para entrada no array/vacía, mantener orden mediante
  ejecución concurrente y conservar referencia original ante fallo individual,
  registrando hydratePhoto o refreshPhotoUrl. Hidratar deberá subir dataUrl;
  renovar solo deberá firmar storagePath sin dataUrl. Al volver visible o cada
  12 horas, App deberá reintentar carga si falta loaded o renovar URLs existentes
  sin restaurar registros eliminados durante la petición.
- FR-008 [AS-IS] Cuando se preparan fotos para backup, el sistema deberá
  conservar fotos inline sin signedUrl y materializar remotas como id/date/dataUrl,
  usar URL disponible o firmar y rechazar ante respuesta HTTP no válida, fallo
  de red/lectura o timeout de fetch de 20000 ms. FileReader y lectura de Blob
  no tienen plazo propio; no se añade esa garantía.
- FR-009 [AS-IS] Cuando borra una foto sin storagePath, el sistema deberá
  terminar sin petición; con ruta deberá eliminarla y propagar fallo. Cuando
  borra fotos de usuario, deberá listar páginas de 100 ordenadas por nombre,
  filtrar nombres vacíos y completar listado antes de eliminar lotes de 100;
  deberá detenerse al fallar, sin rollback de lotes previos.
- FR-010 [AS-IS] Mientras reporting esté habilitado exactamente por el flag
  true, el sistema deberá limitar a diez fingerprints por instancia de página,
  deduplicar kind/mensaje/primeros 300 caracteres de stack antes de consultar
  sesión y solo insertar con usuario autenticado. Deberá sanitizar campos,
  omitir user_id del payload y limitar inserción a 5000 ms; getSession no tiene
  plazo propio. Fallos actuales se absorben; FR-013 cambia únicamente
  el diagnóstico local de esa degradación. Eventos globales deberán retirarse
  con los mismos handlers al limpiar la instalación.
- FR-011 [AS-IS] Mientras se apliquen las migraciones existentes, el servidor
  deberá limitar app_data a su propietario, Storage al prefijo del propietario
  dentro del bucket privado y diagnósticos a inserción autenticada propia,
  sin lectura para el cliente. Esta intención SQL aún requiere prueba ejecutada:
  no se afirma comprobación efectiva en servidor local o remoto.
- FR-012 [CHANGE] Cuando falte configuración requerida
  o la URL no sea HTTP(S) válida, el arranque deberá rechazar antes de crear el
  cliente, con mensaje que nombre la variable y nunca su valor; configuración
  válida de desarrollo o producción deberá conservar construcción del cliente.
- FR-013 [CHANGE] Si falla el envío opcional de diagnóstico,
  el sistema deberá registrar un diagnóstico local sanitizado y acotado, sin
  invocarse recursivamente ni generar otro fallo de usuario. Deberá conservar
  cupo, fingerprint y resultado resuelto actuales. No se registrarán credenciales,
  payload completo ni objetos crudos de error.

## Aceptación medible

- SC-001: Los 13 FR y 10 escenarios tienen evidencia ejecutada por ID; los CHANGE
  aprobados requieren prueba roja por causa esperada antes de implementar.
- SC-002: Pins AS-IS pasan antes/después, con hashes y revisión productiva;
  UI, sesión y servidor se prueban en su frontera, sin atribuir cobertura por texto.
- SC-003: Suite completa, recorridos Chromium y build verdes; pins de 001 intactos.
- SC-004: Dos usuarios y anónimo ejecutan casos permitidos/denegados de RLS
  en entorno desechable. Guarda rechaza destinos no locales antes de conectar;
  sin `.env.local`, datos reales ni credenciales privilegiadas en cliente.
- SC-005: Fachadas y llamadores conservados; módulos de coordinación sin React,
  DOM ni cliente global; adaptadores explícitos para lectura/imagen/descarga.
- SC-006: KD-003/004/005 se revisan con evidencia; cierre o enmienda se tramitan
  aparte, sin declarar retiradas las desviaciones por crear documentación.

## Exclusiones y aclaraciones

Sin cambios de proveedor, recuperación de contraseña, MFA, renovación automática
nueva, reintentos, rollback de Storage, cupo o deduplicación nuevos, métricas,
fórmulas, despliegues ni modificaciones de backend real. Ninguna migración nueva
se presupone necesaria. No se normaliza userId ni se cambia el contrato de 001.

C2-001 a C2-005 quedan resueltas dentro del alcance presentado: preservar
semántica de fotos, aplicar FR-012/013, excluir cambios de cupo/deduplicación/
plazo de sesión y comprobar RLS en servidor local desechable. La disponibilidad
del entorno es un impedimento técnico, no una decisión de producto pendiente.
Los pins preparatorios no son cierre de etapa ni ejecución RLS.
Estado detallado: [trazabilidad](traceability.json), [plan](plan.md),
[tareas](tasks.md), [verificación](verification.md).

## Registro de aprobación

El 2026-10-15 el propietario respondió «Aprobar alcance y ambos cambios
propuestos» a la pregunta que enlazaba esta spec y describía preservar
identidad/fotos, añadir validación de configuración y diagnóstico local sanitizado.
No se registra esa respuesta como aprobación anticipada del plan técnico,
tasks/analyze, PRs o aceptación de desviaciones pendientes.
