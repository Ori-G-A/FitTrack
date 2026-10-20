# Verificación de propuesta — 006

Fecha: 2026-10-19. BASE: 86299a4497e3c19180c30a640598a1358d61cc8f.
[Spec](spec.md), [survey](../../docs/sdd/interfaz-survey.md), [checklist](checklist.md).

## Diagnóstico ejecutado

pnpm exec node test-results/survey-interface.mjs, Node 24.21.0, Chromium existente.
App real compilada mediante buildHarness; Supabase sustituido por fixture
sintética, red de navegador abortada. Anchuras 390/1280, altura 900.
[Resultado](evidence/survey.json): Registrar sin role modal, foco fuera, Escape
no cierra; campo de peso presente sin coincidencia por nombre accesible exacto.
Sin overflow horizontal en las dos vistas concretas consultadas.

Primer intento interrumpido: esperaba visibilidad de la cuenta del rail oculta
en móvil. Se corrigió exclusivamente el script exploratorio para esperar montaje
y añadir timeout, y se repitió completo con éxito. No hubo cambio en producto,
tests o harness versionados. Esto no es baseline contractual ni prueba roja
de CHANGE, y no confirma todavía el teclado de DetailSheet ni labels de AuthUI.

## Puertas pendientes

23 FR/23 escenarios propuestos, 46 IDs pending. Falta aprobación de alcance y
clarificaciones C-001/002/003; no se aprueba plan o implementación por inferencia.
Tras aprobar alcance se preparará plan/tareas/analyze. No hay evidencia nueva
de suite/build/RLS 006 ni instalación/auditoría, innecesarias para este borrador.
La evidencia integrada de 005 sigue siendo histórica, no baseline 006.

Constitución 1.0.2 intacta. KD-002 sigue activa. No hay publicación, fusión ni
despliegue 006; las autorizaciones 005 no se extienden a esta área.

## Revisión documental ejecutada

node test-results/finish-interface-proposal.mjs comprobó 23 requisitos,
23 escenarios, 46 IDs únicos y filas/manifiesto correspondientes; todos pending,
sin pruebas ficticias. 21 casos estáticos inventariados individualmente y 147
enlaces locales válidos en nueve documentos. git diff --check sin errores.
Diff de src, test, browser-tests, CI, package/lockfile y SQL vacío.
La propuesta añade FR-023 para descarte general a siete días/deshacer y precisa
FR-008 para no prometer foco de una tarjeta ausente en el efecto inicial.

## Decisión de alcance — 2026-10-19

Spec y C-001/002/003 aprobadas explícitamente mediante «Aprobar alcance, ambos
cambios y las tres aclaraciones». El registro anterior conserva el diagnóstico.
Se prepara el plan; todavía no hay ejecución contractual, implementación o despliegue.

## Plan técnico propuesto — 2026-10-19

Se prepararon plan, research, validación, 39 tareas acíclicas, mapa individual de
21 regresiones y analyze. [Plan](plan.md), [tareas](tasks.md), [revisión](analyze.md).
46 IDs enlazados a tareas y 33 nombres únicos de pruebas previstas: 21 grupos
Node AS-IS, siete recorridos Chromium y cinco casos CHANGE. Tests ejecutados
siguen vacíos y todas las filas pending; no hay baseline contractual 006.

node test-results/review-interface-plan.mjs comprobó IDs, tareas/dependencias,
trazabilidad, enlaces, ausencia de placeholders y diff. También verificó en
memoria que verifyTrace rechaza los 46 pending en modo completo; esto no se
presenta como ejecución de pnpm test:sdd:complete o de pruebas de producto.
[Reporte documental](evidence/plan-review.json). Código/estilos/pruebas/CI,
index.html, dependencias y SQL permanecen sin cambios respecto de BASE.

La revisión del agente no halló CRITICAL documentales abiertos; no hubo revisión
por otro agente ni aceptación humana del plan. Falta aprobación separada y
resolver autorización expresa para ejecutar E0–E6 antes del merge documental.
No se publicó, fusionó ni desplegó 006.

La primera repetición documental detectó una línea vacía adicional al final de
checklist.md; se corrigió el formato y se repitió el verificador documental
completo. No se modificó producto, contrato ni aserciones para resolverlo.

## Aprobación de plan — 2026-10-19

El propietario aprobó plan, 39 tareas y analyze y autorizó explícitamente E0–E6
local antes del merge documental. Publicación, fusión y despliegue no autorizados.
