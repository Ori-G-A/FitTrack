# Checklist de requisitos — 001-datos

Fecha: 2026-10-14. Revisión documental contra [spec](../spec.md) y
[survey](../../../docs/sdd/datos-survey.md). No es analyze de tareas ni ejecución.

- [x] Intención y resultado de usuario explícitos; SC-001 a SC-005 medibles.
- [x] Tres historias y diez escenarios con IDs estables.
- [x] Once requisitos con etiqueta AS-IS y patrones EARS aplicables.
- [x] Cada FR tiene evidencia file:line, sin afirmar cobertura inexistente.
- [x] Claves, plazos, límites de tamaño y efectos observables están explícitos.
- [x] Fallos y casos no felices de carga, guardado, backup y borrado incluidos.
- [x] Out of Scope explícito; no se introducen fórmulas o cambios de producto.
- [x] C-001/002/003 resueltas por aprobación del alcance del propietario.
- [x] Una fila de Traceability por cada FR y escenario: 21 filas.
- [x] PENDING está explícito y permitido en documentación; bloquea PR de código.
- [x] La spec evita elegir módulos o herramientas; esas decisiones están en plan.
- [x] Limitaciones de bus, importación, signOut y rollback no están ocultas.
- [x] No se confunden dobles del backend con verificación efectiva de RLS.

Resultado inicial: requisitos listos para planificar. Posteriormente se aprobaron
plan/tareas y se ejecutaron los pins íntegros en BASE y tras la implementación.
Estado vigente y suficiencia de evidencia: [verification](../verification.md)
y [converge](../converge.md). El checklist inicial no sustituye esa ejecución.
