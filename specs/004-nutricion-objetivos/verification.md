# Verificación documental — 004

Fecha: 2026-10-18. Estado: propuesta de alcance; aprobación pendiente.
[Spec](spec.md), [checklist](checklist.md), [survey](../../docs/sdd/nutricion-objetivos-survey.md).

Comprobaciones documentales ejecutadas con v26.5.0 global, usando los
módulos existentes scripts/sdd-contract.js y scripts/sdd-trace.js y assert.
Esto no es una ejecución de la suite con Node 24.21.0 ni una baseline runtime.

- selectSpec acepta 004-nutricion-objetivos.
- contractIds descubre 31 IDs únicos: 16 FR y 15 escenarios.
- Cada ID tiene exactamente una fila en la matriz de trazabilidad.
- Manifiesto inicial: 31 pending, tests vacíos; modo parcial sin errores.
- Modo completo: 31 errores de cobertura incompleta, rechazo esperado.
- 6 enlaces locales existentes en los archivos comprobados; sin ejemplos de plantilla conservados.
- No se ejecutaron pruebas de nutrición, suite, build, instalación ni auditoría por esta entrega documental.
- No hay pins nuevos, baseline, plan, tareas, analyze ni resultado verde de 004 declarado.

BASE: 2a7004277bd75d87fdf9746c90853b4c34eac044. La evidencia remota de 003
(PR #9, CI de main y Vercel Production aprobados) no se reutiliza como contrato 004.
La puerta de alcance/C-001/002/003 bloquea avanzar al plan técnico.

Comprobación final ampliada: 57 enlaces locales existentes en propuesta,
survey y registros actualizados; git diff --check correcto. Diff contra BASE
vacío en src, test, browser-tests, scripts, SQL, package.json y lockfile.
