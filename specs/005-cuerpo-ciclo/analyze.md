# Revisión cruzada — 005

Fecha: 2026-10-18. Revisión documental del agente; pendiente aprobación del dueño.
[Spec](spec.md), [plan](plan.md), [tareas](tasks.md), [validación](validation-plan.md).
No es converge de implementación ni resultado de pruebas de producto.

| Control | Resultado documental | Evidencia/límite |
| --- | --- | --- |
| Alcance y clarificaciones | Aprobados mediante «continua» en respuesta directa | Registro de aprobaciones; no autoriza plan/ejecución |
| IDs y escenarios | 20 FR y 20 escenarios; sin cambio de numeración | 40 filas en matriz y manifiesto, todos pending |
| Cobertura prevista | Cada ID enlaza un grupo concreto, archivo/nombre y tarea | T002–T021; nombres previstos, tests ejecutados vacíos |
| Caracterización previa | T023 bloquea toda extracción | 20 grupos, cuatro Chromium, cuatro mutaciones y negativos sobre original |
| Contrato completo | Subcasos numéricos/temporales/efectos/duplicados enumerados | Revisión de aserciones y ejecución todavía pendientes |
| Capas | Imports propuestos readings → summary → phase → context | Los módulos importan hacia context, sin React/DOM/backend; prueba transitiva T029 |
| Estado y efectos | Hooks, deps, toast/setter/reset y ubicación de IDs preservados | BODY-001–005 aceptados para preservación, no corrección silenciosa |
| Propiedad previa | 001–004, fotos y 40 pins protegidos | Callbacks tardíos 004 y facades; no mover algoritmos ajenos |
| Cierre y datos | RLS real local con guardas/cleanup y cinco contratos frescos | Docker disponible no presumido; sin backend real ni .env.local |
| Gobernanza | PR documental y autorización de ejecución previa explícitos | T001 pendiente; publicación/merge/despliegue no autorizados |

## Hallazgos de la revisión y resolución propuesta

- A-001: separar summary de context puede crear ciclos por inferCyclePhase.
  Resuelto en propuesta con facade solo pública y dirección readings/summary/phase/context;
  T024/T025/T029 verificarán el grafo real, sin declarar arquitectura implementada.
- A-002: extraer callbacks puede mover ID fuera del updater y cambiar hidratación.
  Resuelto en plan conservando ubicación de ID, dependencias y orden de efectos;
  T002–T006 y mutaciones deben reproducirlo antes de src.
- A-003: JSON ocultaría no finitos; inputs number pueden rechazarlos antes del handler.
  Resuelto con aserciones en memoria y distinción de interacción nativa/callback,
  sin prometer que todos los valores son introducibles por teclado.
- A-004: sueño/pulso adyacentes no justifican extender extracción a todo Dashboard.
  Resuelto con protección de compatibilidad FR-019 y permanencia en su sitio.
- A-005: el hash del runner usa git ls-files; src nuevo sin trackear se omitiría.
  Resuelto exigiendo registrar todos los módulos nuevos antes de capturar hash.

Sin hallazgos CRITICAL documentales abiertos tras estas resoluciones propuestas.
La validación mecánica de IDs, tareas, enlaces y diff se registra en verification;
esto no demuestra todavía los 40 contratos ni las fronteras propuestas.

Siguiente puerta: aprobar plan/tareas/analyze y decidir autorización de ejecución
local E0–E6 previa a integración documental. No se inicia E0 mientras falte.
