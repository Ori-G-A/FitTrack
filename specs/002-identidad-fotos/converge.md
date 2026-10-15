# Convergencia parcial — 002

Estado: CLIENTE E1–E3 VERIFICADO, CIERRE DEL ÁREA PENDIENTE. 2026-10-15.
No es presentación de PR de código: FR-011 y US2-AS5 siguen pending.

## Contrato y evidencia actual

| Área | Resultado | Evidencia |
| --- | --- | --- |
| FR-001/002/003 y US1 | Autenticación/sesión conservadas, sin extracción adicional | Pins identity-auth/session intactos y suite completa |
| FR-004 a FR-009 y US2-AS1 a AS4 | Coordinación de fotos separada; fachada, cálculo de fecha, orden y errores conservados | E1, pruebas de capas con fixtures negativos, pins fotos/recovery intactos |
| FR-010 y US3-AS1 | Cupo, fingerprint, sanitización y resultado de reporting conservados | Pin identity-diagnostics intacto |
| FR-012 | Configuración inválida rechaza antes de crear cliente; válida conserva argumentos | Rojo/verde E2, SDK instrumentado sin validación propia |
| FR-013 y US3-AS2 | Diagnóstico local fijo, acotado, sin contenido externo y con logger protegido | Rojo/verde E3, fallos devueltos/rechazos/timeout/logger |
| FR-011 y US2-AS5 | Sin prueba de permisos ejecutada | Pendiente: motor Docker local no disponible |

Último checkpoint: 220/220 Node, 3/3 Chromium, build correcto; 21 complete y
dos pending de 002. Mismos resultados verifican 21/21 IDs de 001. Once archivos
pin originales conservan SHA-256; no se cambiaron aserciones AS-IS para acomodar
el refactor. Build conserva aviso de chunk conocido, sin optimización incidental.
Evidencia: [E1](evidence/e1.json), [E2](evidence/e2.json), [E3](evidence/e3.json).

## Cambios y límites revisados

photo-service recibe cliente y adaptadores; photo-storage conserva exports y
E/S del navegador. La dependencia transitiva de localStorage se corrigió con
date-utils y reexport de localISO; el algoritmo permanece idéntico. Supabase
configura su cliente después de validar las entradas, con errores sin valores.
Reporting usa solo un literal fijo en consola y absorbe el fallo del logger.

Sin cambios SQL, dependencias, claves app_data, formatos persistidos, parámetros
de imágenes ni nuevas garantías de atomicidad/reintentos. DATA-001 a DATA-005,
IDEN-001 y PHOTO-001 no se corrigen incidentalmente. No se conectó backend real,
no hubo deploy, PR publicado, merge ni CI remoto observado.

## Revisión de desviaciones

- KD-004: corregida localmente por FR-013; no retirada de la constitución.
- KD-005: corregida localmente por FR-012; no retirada de la constitución.
- KD-003: abierta; la guarda pura no prueba permisos de un servidor.
- La enmienda PATCH de cierre se preparará separadamente con evidencia;
  este documento no ratifica cambios constitucionales.

## Trabajo restante autorizado y condiciones de reanudación

T009: completar runner y fixture, invocando guarda antes de cualquier conexión.
T010: Supabase local desechable operativo y matriz real de dos usuarios/anónimo.
T021: integrar gate 002 en CI con ese entorno y observar su ejecución remota.
T019/T020: concluir convergencia, revisión KD y preparar PR de código solo cuando
no queden pending/partial. Integración/fusión por propietario, como antes.

La aprobación de ejecución local ya existe: no hay que volver a aprobar alcance,
plan ni FR-012/013 para retomar lo pendiente. La condición técnica actual es
disponer del motor/entorno local para ejecutar permisos. El último docker info
terminó en código 1 por ausencia del pipe dockerDesktopLinuxEngine. No hay
evidencia RLS que justifique declarar cierre; tampoco una excepción aprobada
para omitirlo.
