# Decisiones técnicas — 002

Estado: decisiones del plan aprobado, 2026-10-15. Ejecución local autorizada;
RLS real se mantiene como requisito de cierre independiente.

## R1 — Separar fotos sin cambiar fachadas

photo-storage mezcla canvas/FileReader con paginación, fallback de colecciones
y acceso a un cliente global. Una fábrica de servicio recibe cliente y adaptadores
de conversión/descarga/diagnóstico. La fachada conserva todos sus exports y firmas,
incluidos clientes opcionales ya admitidos. No añadir repositorio genérico ni
clase base. Preservar Promise.all, referencias de fallback, orden listado/borrado,
upsert y los plazos existentes. La lectura dataUrl previa a upload puede inyectarse
como argumento opcional interno sin romper los llamadores de photo-operations.

Alternativa descartada: mover todo photo-storage a un servicio; arrastraría DOM
y canvas a la coordinación y no cumpliría el límite de capas propuesto.

## R2 — Conservar coordinación de sesión

El efecto de sesión controla estado, ref de propietario y cleanup de React;
no contiene las operaciones masivas de datos ya extraídas en 001. auth-service
ya recibe cliente. Sus pruebas ejecutan el comportamiento de acceso/sesión y
no muestran duplicación necesaria para una capa nueva. Mantenerlo evita una
abstracción sin beneficio demostrado (P6). No se corrige la carrera entre consulta
inicial y evento: FR-003 no promete orden nuevo.

## R3 — Validación de configuración en frontera

Validar en módulo puro, llamado por supabase.js inmediatamente antes de
createClient. Comprobar string no vacío para URL/clave y URL HTTP(S) parseable;
conservar strings válidos originales para no introducir normalización oculta.
No validar el formato JWT: la spec no lo exige ni se debe rechazar otro formato
de clave permitido por el proveedor. No inspeccionar `.env.local` en pruebas.
Usar nombres de variables en errores, nunca valores.

El rechazo sucede durante el arranque del módulo. No se promete una pantalla
de recuperación dentro de ErrorBoundary, que aún no está montado en ese punto;
añadirla sería otro comportamiento. La prueba debe medir la llamada al SDK,
no inferir validación por inspección de texto fuente.

## R4 — Fallback de diagnóstico sin contenido externo

Los errores del proveedor pueden contener valores no cubiertos por los patrones
actuales de sanitizeDiagnostic. Para FR-013 elegir mensaje fijo local, sin pasar
el objeto crudo, su message ni stack. Un literal conocido ya es contenido
sanitizado y acotado; no hace falta ampliar el sanitizador general ni copiar
el payload a consola. Proteger el logger para que tampoco rechace el reporte.

No registrar cuando el flag está deshabilitado o falta sesión: no son fallos
de envío. Mantener fingerprints/cupo previos a getSession, resultado resuelto
y timeout de inserción. IDEN-001 sigue fuera del CHANGE aprobado.

Alternativa descartada: console.error(error) o sanitizeDiagnostic(error.message).
La primera expone contenido externo; la segunda no garantiza ocultar claves
arbitrarias. Evitar un reporter nuevo para reportar fallos del reporter.

## R5 — Pins y CHANGE distintos

Los cinco archivos identity-* tienen hashes preparatorios sobre src intacto.
Antes de E1 se fija ese checkpoint como baseline de entregas de cliente. Las
pruebas AS-IS no se alteran para hacer pasar la extracción. FR-013 cambia el
diagnóstico de un fallo: añadir pruebas CHANGE que observen el mensaje local,
documentando el FR si se necesita cambiar una aserción antigua de silencio.
Ni un resultado rojo por módulo inexistente ni un mock que lanza por falta
de configuración cuentan como prueba roja de la garantía solicitada.

## R6 — RLS necesita servidor real separado

Los archivos existentes son migraciones sobre Supabase, no un bootstrap completo:
app_data debe existir antes de su política; storage/auth proceden de Supabase.
No recrear auth.uid() o Storage con dobles SQL para declarar AUTO-003 cumplida.
La futura prueba usará instancia local desechable con datos sintéticos y dos
usuarios/anónimo. Preparación privilegiada solo en proceso de test local,
nunca en bundle cliente; las operaciones bajo prueba usarán roles de cliente.

La guarda pura rechaza hosts DNS y exige loopback literal, puertos explícitos
y marcador de entorno. Falta integrarla antes de crear cualquier conexión.
El runner no leerá `.env.local` ni aceptará credenciales implícitas. Deberá
comprobar identidad del fixture local antes de resetearlo. Motor/CLI ausentes
son impedimento observado; no se inventa ejecución ni se elige versión de CLI
sin verificar disponibilidad/compatibilidad. Preparar ese entorno queda como
tarea técnica de E4, sin despliegues ni backend real.

## R7 — Evidencia compartida sin repetir resultados

El runner selecciona manifiesto y salida por --spec, manteniendo 001 como default.
Una ejecución de suite/Chromium puede comprobar ambos manifiestos con los mismos
resultados descubiertos; no cuenta dos veces las pruebas. El modo completo debe
rechazar las cinco filas pendientes actuales. CI solo configura 001 hasta añadir
la comprobación 002 correspondiente; no afirmar CI remoto verde por resultados
locales ni quitar las puertas de cierre.

## R8 — Dependencia transitiva encontrada durante E1

El detector nuevo rechazó app-utils por su acceso a localStorage. Fotos solo
necesitaba localISO, pero el límite se revisa por módulo importado, no por asumir
tree shaking. Se movió el cuerpo idéntico a date-utils y se conserva la reexport
de app-utils; photo-operations importa el módulo puro. T022 registra esta
dependencia necesaria. No se cambia la regla de calendario ni las fórmulas de
la futura 003. El detector mantiene fixtures negativos, sin permitir DOM para
acomodar la extracción.

## Autorización de ejecución local — 2026-10-15

El propietario aprobó plan, tareas y revisión mediante «Aprobar plan, tareas y
revisión; continuar implementación local». Se autoriza ejecutar E1–E3 localmente
y conservar RLS real como requisito de cierre. Los estados de propuesta anteriores
son históricos; no hay integración remota ni cierre RLS declarado.
