# Plan técnico propuesto — 002

Estado: PLAN APROBADO, 2026-10-15, para ejecución local de E1–E3;
RLS real obligatorio al cierre. Decisiones técnicas: [research](research.md).

## Entregas y puertas

1. Completar pins AS-IS sobre producción intacta: autenticación, UI/sesión,
   imágenes/Storage, recuperación visible y reporting. La preparación actual
   cubre módulos, UI/sesión en jsdom y recuperación; falta servidor RLS real.
2. Con alcance/clarify resueltos, aprobar este plan y sus tareas/revisión; preparar
   PR documental según constitución. Mantener separados los CHANGE FR-012/013.
3. Fijar hashes y revisión original por entrega antes de tocar su producción.
   Ejecutar suite y navegador y guardar evidencia inmutable. El gate de fotos/
   configuración/reporting usa sus pins ejecutables; RLS es gate independiente
   de cierre, obligatorio antes del PR de código. Su indisponibilidad no justifica
   declarar permisos comprobados ni impide trabajo independiente sin cambios SQL.
4. Extraer coordinación de fotos a módulo con cliente y adaptadores explícitos.
   Conservar photo-storage como fachada, validación/compresión y E/S del navegador
   en adaptador. No introducir clase/repositorio genérico ni dependencias nuevas.
5. Conservar coordinación de sesión en App y auth-service como están; sus pins
   ya fijan comportamiento. No hay necesidad demostrada de una capa adicional.
6. Implementar FR-012/013 aprobados: cada uno con prueba roja específica,
   implementación mínima y repetición completa del checkpoint que falle.
7. Ejecutar políticas existentes en Supabase local desechable, incluyendo
   rechazo anónimo/cruzado y operaciones permitidas. Preparar fixture separado
   para esquema de partida; no afirmar que las migraciones crean todo Supabase.
   Ensayar migraciones dos veces si se propone alguna nueva.
8. Converge añade tareas para gaps; revisión de 001, hashes, suite, Chromium,
   build, límites de capas y trazabilidad. Preparar cuerpo de PR, sin publicar.

## Arquitectura y compatibilidad

La interfaz actual exportada por photo-storage se conserva para BodyScreen,
App y app-data-lifecycle. Cliente global solo en la composición de fachada;
coordinación recibe cliente y funciones de conversión/descarga/diagnóstico.
photo-operations conserva contratos observados de firma y upload. No extraer
compresión junto al servicio remoto: depende de canvas/Image/objectURL.

Módulos previstos: `photo-service.js` para hidratación/refresh/backup/borrado
con cliente y adaptadores; `photo-storage.js` conserva su API y composición;
`supabase-config.js` valida entradas sin importar SDK/DOM/React y `supabase.js`
la invoca antes de createClient. Reporting conserva su módulo actual: añadir
un fallback local fijo y acotado no requiere una fábrica adicional.

FR-012 comprueba strings presentes y URL HTTP(S) parseable; no cambia el formato
de la clave, no normaliza valores válidos ni diagnostica su contenido. La prueba
instrumenta createClient y comprueba cero llamadas con configuración inválida.
FR-013 usa un mensaje local fijo, sin error remoto, stack, contexto ni payload;
el fallo del propio logger también se absorbe para evitar recursión. No se cambia
el cupo ni el plazo de getSession. Casos concretos: [validación](validation-plan.md).

La prueba de capas inspeccionará imports transitivos y uso DOM del módulo nuevo,
con fixture negativo. Los tests sustituyen frontera de E/S, no el algoritmo de
producción. La instrumentación de tests no debe copiar handlers productivos.

## RLS y entorno

No hay motor Docker activo ni Supabase CLI/psql disponibles en PATH observado.
No instalar ni arrancar servicios como efecto colateral de un survey. El plan
de prueba debe rechazar host ajeno a loopback y requerir identificador explícito
del entorno desechable antes de realizar conexión/escrituras. Variables de prueba
separadas, sin cargar `.env.local`; no aceptar hostname que solo contenga localhost.
La prueba de guarda no cuenta como ejecución de las políticas. La guarda pura
preparatoria está en `scripts/local-rls-guard.js`: exige entorno
`fittrack-sdd-disposable`, direcciones literales 127.0.0.1 o ::1 y puertos
explícitos. No resuelve DNS ni acepta aliases como localhost. Todavía falta
invocarla desde el futuro runner antes de crear cualquier cliente/conexión.

## Riesgos y decisiones técnicas

- Firma fallida tras upload deja objeto remoto: preservar y probar, sin compensar.
- Borrado paginado solo es estable sobre conjunto sin modificaciones concurrentes;
  no introducir garantías de snapshot inexistentes.
- Browser HEIC no se promete por MIME admitido: usar fixture decodificable para
  probar canvas y caso de error separado, sin simular soporte universal.
- Reporting silencioso/configuración requieren CHANGE, no mera extracción.
- RLS es gate independiente de los dobles. Motor no disponible impide cerrar
  AUTO-003 aunque toda la suite Node pase.
- No añadir dependencias ni tocar lockfile para una extracción que puede usar
  las herramientas existentes. Cambios posteriores de entorno se justificarán.

## Orden de entregas revisables

E0: registro de aprobación y pins originales. E1: coordinación de fotos y
límites de capas. E2: configuración (rojo/verde FR-012). E3: diagnóstico local
(rojo/verde FR-013). E4: RLS real y gate de cierre. Cada entrega repite su
checkpoint fallido completo; E4 no se marca terminada si falta motor/CLI.
Sin cambios SQL previstos; si los tests descubren defectos de políticas,
registrarlos y diseñar CHANGE separado antes de alterar permisos.

## Autorización de ejecución local — 2026-10-15

El propietario aprobó plan, tareas y revisión mediante «Aprobar plan, tareas y
revisión; continuar implementación local». Se autoriza ejecutar E1–E3 localmente
y conservar RLS real como requisito de cierre. Los estados de propuesta anteriores
son históricos; no hay integración remota ni cierre RLS declarado.
