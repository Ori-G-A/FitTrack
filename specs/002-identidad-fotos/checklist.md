# Checklist de requisitos y puertas — 002

Revisado: 2026-10-16. Las aprobaciones del propietario constan en approvals.md;
la revisión del agente no las sustituye.

- [x] Resultado de usuario y fronteras con 001 definidos.
- [x] FR estables en EARS con AS-IS separado de CHANGE aprobado.
- [x] Escenarios, exclusiones, tiempos y limitaciones observadas explícitos.
- [x] Inventario de llamadores principal/preview y adapters de E/S.
- [x] Evidencia preparatoria separada de cobertura completa y RLS real.
- [x] Evidencia de corrección local de KD-003/004/005 registrada, sin retirada formal antes de PATCH.
- [x] Plan incremental, riesgos y tareas vinculadas a historias.
- [x] C2-001 a C2-005 resueltas dentro del alcance; FR-012/013 aprobados.
- [x] Casos preparatorios de UI/sesión/fotos ejecutados y manifiesto revisado.
- [x] Entorno RLS local desechable, pruebas reales ejecutadas y limpieza confirmada.
- [x] Plan/tasks y revisión cruzada aprobados, sin contradicciones críticas nuevas.
- [x] Autorización directa de ejecución local registrada; integración remota pendiente.
- [x] Gate completo: 23/23 IDs, suite, RLS real, Chromium y build aprobados.

La preparación puede continuar sin decisiones de producto; la implementación
productiva debe respetar las puertas de la constitución. No se presenta PR de
código mientras existan filas pending/partial o CHANGE sin decisión.
