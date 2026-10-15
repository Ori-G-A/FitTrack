# Tareas NNN — <área>

Estado: BORRADOR. Referencias: spec.md, plan.md, research.md.
Cada tarea incluye historia, resultado y FR/escenarios. Tareas de infraestructura
trazan a la historia que habilitan. Sin fases vacías ni trabajo sin trazabilidad.

## 1. Preparación

- [ ] T001 [US1; FR-xxx; US1-ASx] <preparar entorno aislado y fixtures sintéticos>.

## 2. Fijar comportamiento actual — BLOQUEANTE

- [ ] T002 [US1; FR-xxx AS-IS; US1-ASx] Escribir <archivo :: prueba exacta>.
- [ ] T003 [US1; FR-xxx] Ejecutar pins contra producción sin modificar;
  registrar revisión base, comando, totales y resultado.

GATE: no iniciar refactor ni cambios productivos hasta pins verdes sobre el
código original. Enumerar TODOS los AS-IS tocados y sus escenarios.

## 3. Fundamentos

- [ ] T004 [US1; FR-xxx] <trabajo habilitador con dependencias T003>.

## 4. Historias por prioridad

- [ ] T005 [US1; FR-yyy CHANGE; US1-ASy] Escribir <prueba exacta>; ejecutar
  y registrar fallo esperado antes de implementar (depende de T003).
- [ ] T006 [US1; FR-yyy] <implementar> (depende de T005 con rojo observado).
- [ ] T007 [US1; FR-xxx, FR-yyy] Ejecutar pins y nuevas pruebas; registrar verde.

Repetir por historia. Eliminar ejemplos CHANGE si no hay cambios aprobados.
Un cambio de aserción fijada debe citar el FR aprobado. Para fronteras numéricas,
redondeos, tiempo o carreras usar regresión determinista antes de corregir.

## 5. Trazabilidad y verificación

Incluir negativos del verificador (prueba inexistente/omitida y cobertura parcial
que no puede pasar por completa). Para efectos críticos, planificar mutaciones
controladas que las aserciones deban detectar. Identificar recorridos de navegador
necesarios y distinguirlos de DOM simulado. Cada extracción debe poder verificarse
y revertirse como una entrega pequeña sin revertir datos de usuario.

- [ ] T008 [US1; <todos los IDs>] Comparar Traceability con descubrimiento del
  runner; verificar que las aserciones cubren cada requisito completo.
- [ ] T009 [US1; <IDs>] Ejecutar checks relevantes y obligatorios del plan;
  repetir íntegro cualquier checkpoint que hubiera fallado después de corregir.
- [ ] T010 [US1; <IDs>] Converge contra spec, plan y constitución; cero gaps
  pendientes y cero filas PENDING antes del PR de código.

## Revisión inicial obligatoria de tareas

- [ ] Cada FR y escenario tiene tarea de prueba concreta con sus IDs.
- [ ] Todos los AS-IS tocados tienen pin en fase bloqueante.
- [ ] Cada CHANGE tiene rojo observado antes de su implementación.
- [ ] Dependencias imponen ese orden; no hay fases vacías.
- [ ] Analyze no tiene hallazgos CRITICAL antes del PR documental.

## Registro de ejecución

Al completar cada tarea: qué cambió, pruebas/números reales, revisión comprobada
y desviaciones del plan. Distinguir pruebas previstas, ejecutadas y omitidas.

## Convergencia — solo añadir

Añadir fases numeradas únicamente si converge encuentra gaps. Nunca reescribir
tareas anteriores para simular cumplimiento. Cada gap conserva su FR y evidencia.
