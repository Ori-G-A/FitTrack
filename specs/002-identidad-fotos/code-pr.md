# PR de código preparado — 002

Estado: listo para revisión del propietario; no publicado. Revisión: ed077ec.
Base propuesta: codex/002-identidad-fotos-docs (357503d).
Rama de código: codex/002-identidad-fotos.

## Título

refactor(identidad): separa fotos y verifica aislamiento con RLS real

## Cuerpo

La coordinación de fotos compartía módulo con canvas/FileReader y el cliente
global. Se separa en un servicio con dependencias explícitas y se conserva la
fachada pública, sus datos, orden y comportamiento parcial. localISO pasa a un
módulo puro con reexport compatible para eliminar localStorage transitivo.

Se implementan los CHANGE aprobados: rechazar configuración inválida antes de
createClient con errores sin valores y emitir un diagnóstico local fijo cuando
falla reporting, protegiendo también el logger. Cupo, deduplicación y plazos
previos se conservan. El runner RLS crea un Supabase local desechable con marcador,
ejercita roles reales y confirma limpieza. El gate rechaza evidencia obsoleta,
fallida o sin retirada del fixture; CI exige contratos completos de 001 y 002.

Validación local:

- 226/226 Node, 3/3 RLS reales y 3/3 Chromium; cero omitidos.
- 23/23 IDs de 002 y 21/21 de 001 completos; once pins originales intactos.
- Build correcto; aviso de tamaño PERF-001 conservado.
- Sin cambios de dependencias, lockfile ni políticas SQL; sin datos reales.

Límites: CI remoto no observado; compresión usa primitivas simuladas para sus
cálculos y callbacks. Semántica de importación/borrado parcial y los seguimientos
DATA/IDEN/PHOTO quedan preservados; no se presentan como defectos corregidos.
KD-003/004/005 quedan documentadas para una PATCH separada, no retiradas aquí.

Orden de integración por el propietario: constitución/readiness, 001 documental,
001 código, 002 documental (357503d) y este PR de código. Observar los jobs
obligatorios antes de fusionar; no inferir CI remoto a partir de resultados locales.
No se incluyen despliegues ni modificaciones del backend real.

Evidencia: verification.md, converge.md y evidence/e4.json de esta spec.
