# Casos de validación previstos — 002

Plan aprobado. Las tablas conservan los casos previstos; sus resultados
ejecutados de E2/E3 se registran en verification.md, sin sustituir la RLS pendiente.
Baseline preparatorio: [evidencia](evidence/preparatory.json).

## FR-012 — Configuración, rojo antes de verde

Ejecutar el módulo real supabase.js con variables sintéticas y SDK instrumentado.
El sustituto createClient registra argumentos y devuelve objeto centinela;
no valida por cuenta propia, para que el rojo demuestre la falta de validación
productiva en lugar de un error del SDK. Aislar cada importación/entorno.

| Entrada | Resultado exigido | Observación |
| --- | --- | --- |
| URL ausente/vacía/solo espacios | Error con nombre VITE_SUPABASE_URL, cero llamadas SDK | Nunca incluir valor |
| Clave ausente/vacía/solo espacios | Error con nombre VITE_SUPABASE_ANON_KEY, cero llamadas SDK | Sin requisitos JWT nuevos |
| URL malformada, protocolo ftp/file/javascript | Error de URL, cero llamadas SDK | Credenciales sintéticas no aparecen en mensaje |
| HTTP local / HTTPS de producción sintética | Una llamada SDK, argumentos originales y objeto centinela exportado | Sin red |

Antes de implementar, los casos inválidos deben fallar porque el SDK sí se llama
y no hay rechazo propio. Después deben pasar, junto con el caso válido intacto.
No usar como rojo una importación inexistente del helper propuesto.

## FR-013 — Degradación local segura

Ejecutar error-reporting real con flag, sesión y cliente simulados. Capturar logger
de consola por separado de errores de aplicación. Las pruebas AS-IS de cupo y
deduplicación permanecen; nuevas pruebas observan únicamente la diferencia aprobada.

| Caso | Resultado exigido |
| --- | --- |
| Error devuelto/rechazo de insert | Reporte resuelto y mensaje local fijo acotado |
| Excepción de getSession | Mismo fallback sin propagar ni reintentar |
| Timeout de insert a 5000 ms | Fallback tras plazo, sin cancelación remota ni cambio de cupo |
| Error con claves/correo/query sintéticos | Ningún valor externo, stack ni payload en consola |
| Logger arroja excepción | Reporte sigue resuelto, sin recursión ni segundo envío |
| Flag apagado, sesión ausente o duplicado | Sin nuevo fallback, consulta/insert según contrato actual |

El rojo esperado en el código original es ausencia del mensaje local, no un
rechazo de la promesa ni una aserción de éxito remoto. Repetir el checkpoint
completo si falla al introducir el cambio.

## FR-011 — Matriz de servidor pendiente

Esta matriz no sustituye la ejecución contra Supabase local desechable.
Solo el bootstrap de fixtures puede usar privilegios; cada caso usa el rol indicado.

| Recurso | Usuario A | Usuario B | Anónimo |
| --- | --- | --- | --- |
| app_data de A | Leer/insertar/actualizar/borrar propios | No leer ni alterar A; operaciones propias de B sí funcionan | Sin acceso |
| Objeto progress-photos bajo A/ | Subir, firmar/leer, actualizar y borrar propio | No leer/firmar/alterar A; prefijo B permitido | Sin acceso privado |
| Reporte client_error_reports | Insertar propio por default; no leer | Insertar propio, no suplantar A; no leer | No insertar ni leer |

Comprobar resultado y estado posterior con una conexión de control del fixture:
una respuesta sin filas no equivale a que un UPDATE ajeno haya surtido efecto.
Para denegaciones no exigir un único texto/error HTTP si el contrato observable
es cero acceso y ausencia de modificación. Incluir cambio de owner/ruta durante
UPDATE para verificar WITH CHECK, además del filtro de selección USING.

Antes de conectar: guarda, marcador del fixture y configuración explícita sin
carga de env real. Verificar bucket privado, límites configurados y políticas
aplicadas, sin confundir metadatos de Storage con ejercicio real de su API.
No modificar políticas para hacer pasar un test sin nuevo CHANGE aprobado.

## Regresión y capas

- Hashes originales identity-* y seis pins de 001 preservados durante E1.
- Coordinator de fotos sin React, DOM ni cliente global; fixture negativo prueba
  que el detector rechaza una dependencia prohibida, no solo el código válido.
- Suite Node, tres recorridos Chromium existentes y humo de ambos previews.
- Reportar límites: compresión jsdom usa primitivas simuladas, RLS necesita E4,
  build conserva aviso PERF-001 hasta su spec y no hay CI remoto observado.

## Autorización de ejecución local — 2026-10-15

El propietario aprobó plan, tareas y revisión mediante «Aprobar plan, tareas y
revisión; continuar implementación local». Se autoriza ejecutar E1–E3 localmente
y conservar RLS real como requisito de cierre. Los estados de propuesta anteriores
son históricos; no hay integración remota ni cierre RLS declarado.
