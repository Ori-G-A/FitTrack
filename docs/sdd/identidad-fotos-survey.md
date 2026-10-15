# Survey 002 — Identidad, fotos y diagnósticos

Fecha: 2026-10-15. Revisión productiva observada:
`80920d4c1ff86648ef5f39ce459284929d7cf975`; HEAD documental de partida
`7060952`. No se modifica producción durante este survey.
Gobierno: [constitución](../../.specify/memory/constitution.md).
Contrato propuesto: [spec 002](../../specs/002-identidad-fotos/spec.md).

## Resultado y mapa de responsabilidades

Permitir acceso a la cuenta y operaciones sobre fotos propias, conservando
el comportamiento observable durante la separación de responsabilidades.
La protección efectiva del servidor se debe comprobar por separado: un doble
de cliente demuestra la petición emitida, pero no la autorización aplicada.

| Frontera | Código observado | Llamadores y efectos |
| --- | --- | --- |
| Credenciales | `src/auth-service.js:5` | `AuthUI.jsx`: normaliza correo, login/registro, timeout 15000 ms |
| Presentación de acceso | `src/AuthUI.jsx:39` | App: modo, contraseña mínima en registro, estado busy y mensajes |
| Sesión | `src/FitTrack.jsx:665` | getSession, suscripción, cambio de propietario, cleanup y reintento |
| Cliente | `src/supabase.js:3` | Fachadas de datos/fotos/diagnósticos y autenticación; configuración Vite |
| Operaciones Storage | `src/photo-operations.js:9` | Fachada photo-storage: rutas, subida y firma |
| Adaptación de imágenes | `src/photo-storage.js:9` | BodyScreen: validación, compresión y eliminación individual |
| Coordinación de fotos | `src/photo-storage.js:57` | App y app-data-lifecycle: hidratación, refresh, backup y borrado por usuario |
| Recuperación visible | `src/FitTrack.jsx:714` | visibilitychange e intervalo de 12 horas; merge de URLs sin restaurar fotos eliminadas |
| Diagnóstico | `src/error-reporting.js:12` | main instala eventos; ErrorBoundary reporta fallos React |
| Sanitización | `src/error-utils.js` | Datos de diagnóstico: correo, tokens, query de URL y longitudes |
| Políticas | `supabase/migrations/` | app_data, Storage privado y client_error_reports; sin ejecución local observada |

001 sigue siendo dueña del orden global de carga/importación/borrado. 002
es dueña del contrato de las operaciones de fotos invocadas por ese orden.
No se duplican las reglas de 001 ni se extraen fórmulas de app-utils por proximidad.
Los dos previews alcanzan estos módulos a través de App; conservar fachadas.

## Contratos y riesgos observados

- El servicio autentica con correo trim/lowercase y contraseña intacta. La
  comprobación de longitud de registro pertenece a la UI; no al servicio.
- El timeout limita la espera, no cancela la operación remota. Subida, firma,
  listado y eliminación usan 20000 ms. Convertir dataUrl a Blob y FileReader
  no tienen plazo propio; no atribuirles la garantía de la petición Storage.
- Archivos admitidos: JPEG/PNG/WebP/HEIC/HEIF, hasta 25 MiB inclusive.
  El mensaje dice 25 MB. La compresión genera JPEG, máximo 820 px, calidad
  0,62 y sin ampliar; el soporte efectivo de HEIC depende del decodificador.
- Una foto persistida excluye signedUrl. Firma por 86400 segundos; una foto
  con dataUrl no se vuelve a firmar. La subida usa upsert y luego firma;
  un fallo al firmar puede dejar el objeto ya subido.
- Hydrate/refresh conservan la foto original y registran consola si falla
  una operación individual. Backup rechaza ante fallo, sin devolver copia parcial.
- El borrado completo lista todas las páginas antes de eliminar. Páginas y
  lotes de 100, orden ascendente por nombre. No hay rollback entre lotes.
- El cliente genera rutas con prefijo de usuario, pero eso no prueba permisos
  del servidor. Saneamiento de ID de foto no equivale a validar userId.
- La migración configura Storage con máximo 5 MiB y MIME JPEG/PNG/WebP,
  mientras el archivo fuente admite hasta 25 MiB antes de comprimir. Comprimir
  a 820 px no comprueba explícitamente el tamaño final: no prometer aceptación
  por el servidor solo porque pasó la validación de origen.
- Reporting exige flag exactamente `"true"`, sesión autenticada y cupo menor
  de 10. Deduplica kind/mensaje/primeros 300 caracteres de stack. Consume
  fingerprint/cupo antes de consultar sesión. Captura fallos sin consola (KD-004).
- getSession del reporter no tiene timeout; solo la inserción tiene 5000 ms.
  El payload omite user_id y depende del default auth.uid() de la migración.
- createClient recibe variables directamente; no hay validación propia (KD-005).

## Evidencia y entorno

Pruebas nuevas: identity-auth, identity-photos e identity-diagnostics ejecutan
los módulos productivos empaquetados, sustituyendo únicamente cliente, entorno,
reloj y E/S. Ninguna conexión externa; fetch rechaza salvo respuesta sintética
explícita. 27 comprobaciones aprobadas en ejecución diagnóstica con Node global;
el checkpoint con runtime declarado se recoge en verification.md de 002.
La preparación posterior añade UI de acceso, ciclo de sesión y recuperación
en DOM jsdom: 45 comprobaciones de identidad en total, incluyendo grupos Node.
No se atribuye cobertura a códec real de navegador ni RLS ejecutada.

`docker info --format '{{.ServerVersion}}'` terminó con código 1: no existe el
pipe dockerDesktopLinuxEngine. Docker CLI está instalado; motor no disponible.
No se identificaron supabase CLI ni psql en el PATH observado. No se arrancó
ningún servicio ni se inspeccionó `.env.local`. AUTO-003 permanece pendiente.

## Decisiones para clarify

| ID | Pregunta concreta | Propuesta para revisión |
| --- | --- | --- |
| C2-001 | ¿Conservar semántica de fotos al refactorizar? | AS-IS: fallos individuales conservados y borrado sin rollback; no introducir reintentos |
| C2-002 | ¿Cómo cerrar KD-004? | CHANGE mínimo: diagnóstico local sanitizado, sin recursión y sin alterar resultado de usuario; no enviar payload sensible a consola |
| C2-003 | ¿Cómo cerrar KD-005? | CHANGE: validar presencia y URL HTTP(S) antes de createClient, mensaje sin valores de variables; conservar localhost de desarrollo |
| C2-004 | ¿Cambiar cupo, deduplicación o plazo de getSession del reporter? | Excluir de esta extracción; registrar como seguimiento y decidir en cambio posterior |
| C2-005 | ¿Cómo demostrar RLS? | Entorno Supabase local desechable, dos usuarios y anónimo, guardas previas a conexión; no sustituir con SQL simulado |

Actualización posterior: el propietario aprobó el alcance presentado y ambos
CHANGE el 2026-10-15 con «Aprobar alcance y ambos cambios propuestos»; C2 queda
resuelto como registra la spec. No hay migración nueva justificada todavía.
El trabajo preparatorio no cierra KD-003/004/005 ni aprueba por sí solo el plan.
