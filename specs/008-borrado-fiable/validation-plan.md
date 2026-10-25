# Validación propuesta 008

Cierre local — 2026-10-24 (Bogotá): [370 Node/30 Chromium/build](evidence/final.json),
29 IDs propios completos, ocho contratos/234 IDs y RLS fresco con limpieza.
T037/T038 son suplementos posteriores; los ocho archivos E0 permanecen intactos.

Plan aprobado, con nombres conservados en los ocho archivos congelados E0.
E2 verificó los 29 IDs completos en [trazabilidad](traceability.json);
[evidencia por etapa](verification.md). El sondeo del survey sigue siendo
diagnóstico independiente; no se confunde con G-PIN ni con cierre E3.

| Nombre exacto previsto | Tipo | Cláusulas |
| --- | --- | --- |
| borrado008 confirmacion exacta y cancelacion no producen efectos | AS-IS | FR-001; US1-AS1 |
| borrado008 usuario ausente rechaza antes de efectos | AS-IS | FR-002; US1-AS2 |
| borrado008 conserva orden cola fotos registros y propietario | AS-IS | FR-003; US1-AS3 |
| borrado008 conserva efectos parciales sin rollback | AS-IS | FR-004 |
| borrado008 intento y recuperacion no se duplican | CHANGE | FR-013; US1-AS4 |
| borrado008 cierre distingue retorno error y rechazo | CHANGE | FR-005; US2-AS3/AS4 |
| borrado008 navegador fallo persiste visible y accesible | CHANGE; Chromium | FR-006; US2-AS1 |
| borrado008 feedback sobrevive al desmontaje de Ajustes | CHANGE | FR-012; US2-AS1 |
| borrado008 resultado de borrado no confirmado conserva bloqueo | CHANGE | FR-007/010; US2-AS2 |
| borrado008 no recrea datos tras fallo de cierre | CHANGE | FR-008/010; US2-AS3/AS4 |
| borrado008 reintento manual solo cierra sesion | CHANGE | FR-010; US2-AS5 |
| borrado008 visibilidad e intervalo no reactivan guardados | CHANGE | FR-008; US3-AS1/AS2 |
| borrado008 recarga temprana fallida conserva bloqueo | CHANGE | FR-009; US3-AS3 |
| borrado008 recarga temprana completa precede a nuevos guardados | CHANGE | FR-009; US3-AS4 |
| borrado008 fallo tardio de A no habilita ni escribe B | CHANGE | FR-011; US4-AS1 |
| borrado008 respuesta de A no cierra ni continua B | CHANGE | FR-011; US4-AS2 |
| borrado008 cambio A B A invalida el intento anterior | CHANGE | FR-011; US4-AS3 |

## Oráculos requeridos para el plan

- Diferidos controlados para listado/fotos, DELETE, cierre y cargas; no depender
  de que el efecto de React ocurra casualmente antes o después de una aserción.
- Diferenciar retorno error de rechazo. Si DELETE ya se despachó, una respuesta
  fallida no demuestra ausencia de efecto remoto; no modelar rollback ficticio.
- El doble de DELETE debe modelar eliminación de filas cuando corresponda;
  comprobar ausencia de upserts posteriores, no solamente eventos de delete.
- Cambiar a B mientras su lectura queda pendiente para detectar que un catch A
  habilite loaded y guarde valores anteriores bajo la identidad B.
- Cambiar de cuenta después del despacho de DELETE A para detectar un signOut
  tardío sobre B sin suponer que RLS permitiría una petición nueva mal delimitada.
- Disparar visibilidad e intervalo de doce horas durante pendiente y error;
  comprobar lecturas, suspensión y escrituras, no solo presencia de spinner.
- Repetir intentos y recuperación mientras su promesa sigue pendiente; contar
  secuencias y efectos. Verificar cleanup, sesión A→B→A y ausencia de reintentos.
- Medir visibilidad y controles operables en 390/1280; mensaje accesible y fijo,
  no backend crudo. El feedback debe sobrevivir al desmontaje real de Ajustes.

Las pruebas AS-IS deberán pasar sobre BASE; las CHANGE deberán fallar por el
comportamiento concreto antes de implementar, sin aceptar errores del harness
o APIs inexistentes como rojo válido. El plan propone los archivos y tareas siguientes.
Las expectativas heredadas contradictorias requerirán enmiendas explícitas por FR.

El cierre E3 exige manifestación completa real, suite/build y RLS fresco.
La puerta CI 008 está preparada; ejecución remota pendiente de autorización.
No se ejecutan pruebas contra backend productivo. Proponer nombres no constituye evidencia.

## Archivos y congelación propuestos

| Archivo previsto | Casos por nombre | Tareas E0 |
| --- | --- | --- |
| test/delete-state-asis.test.js | 4 AS-IS | T005, T006 |
| test/delete-state-core-change.test.js | 3 CHANGE: cierre, DELETE incierto, no recreación | T007 |
| test/delete-state-app-change.test.js | 9 CHANGE: duplicados, desmontaje, cierre manual, disparadores, recarga y sesiones | T008, T009, T010, T011 |
| change-tests/delete-state.spec.js | 1 CHANGE Chromium, con subcasos 390/1280 | T012 |
| test-support/delete-state-fixtures.js | Datos, callbacks y diferidos propios; DELETE con efectos explícitos | T004 |
| test-support/delete-state-browser.js | Bootstrap propio, reloj detenido antes de montar y acciones por UI | T004, T012 |
| playwright.delete-state.config.js | Caso Chromium nuevo aislado, sin retries | T012 |
| playwright.delete-state-legacy.config.js | 29 casos heredados durante E0/E1 | T003, T012 |

Los ocho archivos se congelaron juntos en T012: [baseline](evidence/baseline.json).
Los suplementos posteriores de coordinador/arquitectura no se presentarán como
rojos originales. El manifiesto conserva tests vacío y pending, añadiendo solo
plannedFiles/plannedTaskIds. Cada nombre conserva su escritura aprobada.

## Matriz por entrega

| Puerta | Complete 008 | Pending 008 | Evidencia que permite la transición |
| --- | --- | --- | --- |
| Preparación documental histórica | 0 | 29 | Solo revisión documental; no evidencia contractual |
| E0 / G-PIN | 7 | 22 | FR-001–004 y US1-AS1–AS3 verdes; 13 CHANGE rojos de negocio, ocho archivos firmados |
| E1 | 8 | 21 | Añadir FR-005 con núcleo verde; no atribuir a App resultados no reevaluados |
| E2 | 29 | 0 | Todos los casos propios y heredados, Node/Chromium/build completos |
| E3 | 29 | 0 | Cinco mutaciones, ocho contratos/234 IDs y RLS local fresco con limpieza |

La prueba de recarga exitosa debe observar el primer payload permitido y la
barrera de commit; loadUserData puede absorber errores, por lo que resolver su
promesa no prueba éxito. Mutaciones y controles están definidos en el
[plan](plan.md); las firmas/adendas se tramitan por T002/T015/T016/T023.
