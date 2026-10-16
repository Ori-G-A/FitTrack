# Registro de aprobaciones y estado

Revisado: 2026-10-15. Este archivo registra evidencia de decisiones; las reglas
siguen en la [constitución](../../.specify/memory/constitution.md) y el alcance
en la [spec 001](../../specs/001-datos/spec.md).

| Elemento | Evidencia de autorización | Estado actual |
| --- | --- | --- |
| Adopción SDD y preparación de fase 0 | «haremos una refactorización… de acuerdo a las reglas del SDD»; «empecemos» | Autorizado; fase 0 aún no cerrada en su totalidad |
| Constitución inicial, KD e idioma | «aprobado. Crea las carpetas», respondiendo a la constitución y comenzar por 001 | Ratificada; estados editoriales corregidos en 1.0.1 |
| Carpetas de specs | «Crea las carpetas» | Creadas las seis áreas; no implica aprobar sus specs futuras |
| Área 001 y alcance AS-IS | «aprobado el alcance», respondiendo a preservar comportamiento y corregir defectos después | Aprobado; C-001/002/003 resueltas |
| Mejoras propuestas de evidencia | «aplica tus sugerencias y revisa el estado actual de lo aprobado» | Autorizadas: entorno, piloto, entregas pequeñas, compatibilidad temporal, mutaciones, trazabilidad y navegador |
| Preparación técnica anticipada | Misma autorización anterior, que incluye validar el entorno y el código original antes del plan | Autorizada para infraestructura y pruebas; no autoriza extracción productiva |
| Checklist de requisitos | Revisión realizada por el agente | Completo documentalmente; no es aprobación del dueño ni analyze |
| Plan 001 revisado | Presentado; el usuario pidió mejorar antes de aprobar | Pendiente de aprobación; no se infiere aprobación total de «aplica tus sugerencias» |
| Tareas, analyze y PR documental 001 | No hay aprobación ni merge registrados | Pendientes |
| Refactor productivo / converge | Puertas anteriores aún pendientes | No iniciado; src conserva la revisión base |
| Calendario | Fechas propuestas por el agente | Tentativo, no compromiso del propietario |
| Despliegue | Ninguna autorización | Fuera de alcance; vínculo real de main con Vercel sin verificar |

## Git y orden de integración

La documentación creada al inicio estaba sin versionar; no había commits de
sus etapas. La primera enmienda registrada incorpora la constitución completa
con su corrección editorial, no un diff frente a una 1.0.0 previamente versionada.

1. `codex/sdd-constitution-1.0.1`: commit de constitución e informe editorial.
2. `codex/sdd-readiness`: preparación técnica y revisión documental; depende del anterior.
3. `codex/001-datos`: rama inicial de área; deberá incorporar lo fusionado por el
   dueño antes de avanzar con la refactorización.

No hay PRs publicados ni merges realizados. Los borradores de plan no se
consideran etapas aprobadas por estar guardados en el workspace.

## Próxima decisión concreta

Revisar el [plan actualizado](../../specs/001-datos/plan.md) con la evidencia de
[preparación](readiness.md). Tras aprobarlo: tareas y analyze, puerta documental
y luego pins completos antes de cualquier extracción. La evidencia parcial
obtenida no sustituye esos pins ni cambia las decisiones de dominio.
