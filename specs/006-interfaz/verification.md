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

## E0 parcial y CHANGE de resaltado propuesto — 2026-10-20

Producto original intacto. 21 grupos Node pasaron tras corregir tres selectores
incorrectos de fixtures; la suite inicial completa pasó 307 pruebas antes de
incorporar dos casos adicionales de mutaciones/verificador. Build aprobado,
index 504,38 kB / gzip 146,51 kB; se conserva warning de chunk. Cuatro mutaciones
AS-IS detectadas y negativos del verificador aprobados. No se presentan estos
resultados como checkpoint final ni como instalación limpia/auditoría.

Cinco CHANGE de accesibilidad fallan por las carencias esperadas, sin skips:
[evidencia roja](evidence/change-red.json). Chromium AS-IS pasó seis de siete
recorridos; el de Métricas encontró resaltado persistente en App al consumirse
focusCard, mientras el caso aislado retira la clase a 2200 ms. G-PIN no superado,
sin pins nuevos congelados ni modificaciones de src.

El propietario eligió proponer un CHANGE separado, no ratificó conservar ese
defecto. [Propuesta FR-024](change-card-highlight.md): alcance y cuatro tareas
adicionales sujetos a aprobación. Sus dos regresiones fallan específicamente
por resaltado permanente y por conservar el de la tarjeta anterior;
[prueba revisable](evidence/highlight-proposal-red.json). La propuesta no altera
los 46 IDs aprobados ni autoriza implementación del comportamiento nuevo.

## Decisión posterior de alcance — 2026-10-20

El propietario aprobó FR-024 y la precisión de FR-008; spec/manifiesto suman
ahora 48 IDs. El estado de 46 IDs y propuesta pendiente descrito arriba es
histórico. La extensión técnica T040–T043 y su ejecución esperan la segunda
respuesta; no se infiere de la aprobación de alcance. La aserción temporal se
trasladó conservándola a la suite CHANGE roja y se repite el recorrido AS-IS.

## Repetición independiente completada — 2026-10-20

309 pruebas Node aprobadas y build verde; 20 recorridos Chromium aprobados,
sin skips ni reintentos. 68 pins anteriores intactos; sourceHash conserva
be5259ebe677376b1c80317600c727481813a0ed225d9ddaa268147844541d87.
[Evidencia parcial](evidence/e0-partial.json). La primera repetición de 309 casos
falló en el pin previo «datos debounce y suscripciones» (valor 1 frente a 2);
no se editó su aserción y se repitieron suite/build completos, sin Chromium
simultáneo, con éxito. El fallo y la repetición se conservan en e0-attempts.

Los siete CHANGE rojos están observados; aún no se implementó ninguno.
Los 48 IDs permanecen pending hasta completar revisión contractual/G-PIN.
La extensión técnica T040–T043 sigue esperando su aprobación separada; el
alcance aprobado no suple esa decisión. No hay pins nuevos congelados ni src
modificado. No se renovó RLS en E0: se mantiene como requisito del cierre final.

## Extensión aprobada — 2026-10-20

El propietario aprobó la segunda decisión pendiente (T040–T043 y ejecución
local). La autorización completa de 43 tareas se registra en approvals.md.
La evidencia anterior conserva sus estados históricos; no implica G-PIN verde.

## Estado vigente — 2026-10-20

G-PIN superado sobre original:309/309 Node,20/20 Chromium y build verdes; siete CHANGE fallan por el motivo esperado.42 AS-IS completos y seis CHANGE pendientes.33 pins nuevos y68 anteriores verificados. La extensión técnica ya fue aprobada; E1–E6 habilitadas localmente. Evidencia: [baseline](evidence/baseline.json) y [revisión](assertion-review.md). RLS fresco reservado al cierre E6.

## E1 — 2026-10-20

Checkpoint completo verde: 311 Node/20 Chromium, build, trazabilidad parcial sin errores y101 pins intactos. [Evidencia](evidence/e1.json).

## E2 — 2026-10-20

Checkpoint completo verde: 312 Node/20 Chromium, build, trazabilidad parcial sin errores y101 pins intactos. [Evidencia](evidence/e2.json).
