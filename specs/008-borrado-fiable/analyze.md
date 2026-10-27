# Revisión cruzada 008

Estado: revisión documental del agente, aprobada por el propietario el 2026-10-22;
no es revisión independiente ni prueba de implementación. [Plan](plan.md),
[tareas](tasks.md), [decisiones](research.md), [spec aprobada](spec.md).

## Coherencia y correcciones incorporadas

| Riesgo | Resolución del plan | Verificación prevista |
| --- | --- | --- |
| Ignorar error devuelto por signOut y recuperar valores borrados | Inspeccionar retorno/rechazo; no reanudar en catch; distinguir despacho y confirmación | T007, T013, T028 / FR-005/007/008/010 |
| React habilita hooks antes de aplicar datos frescos | Mantener bloqueo hasta confirmación de commit del token de recuperación vigente | T010, T021, T024, T028 / FR-009 |
| Una carga resuelve sin éxito porque su helper absorbe el error | Usar señal explícita de éxito/error y guarda dinámica, no la mera resolución de la promesa | T010, T021 / FR-009 |
| Cambio A→B→A invisible al comparar UID en efectos | Generación actualizada en auth callback y señal observable por App | T011, T020 / FR-011 |
| Finally de A limpia B o cierre tardío desconecta B | Comprobar actor/intento antes de cada paso y antes de publicar; no cancelar lo ya despachado | T011, T014, T028 / FR-011 |
| Visibilidad/intervalo/carga anterior levantan el bloqueo | Guardas en las tres entradas y habilitación de los doce hooks | T009, T022 / FR-008 |
| StrictMode inutiliza la instancia tras su primer cleanup | Cleanup invalida trabajo/listeners, permitiendo reenganche por raíz | T017, T021 / FR-011/012 |
| Enmendar aserciones congeladas sin evidencia | Archivar original y hashes; PIN-008-001 acotado a contradicciones y adendas 001/006 | T002, T015, T023 |
| Ciclo entre resolutores 007/008 o ampliar cinco allowlists | Módulo 008 independiente compuesto al final del helper existente; motor no importa coordinador | T016, T017, T018 |
| Declarar UI verde en el checkpoint parcial de núcleo | E1 solo acredita núcleo; nueve App y Chromium nuevo permanecen pendientes | T019, T026 |
| Contar nombres como evidencia suficiente | Revisar aserciones por cláusula, manifestación runner y controles negativos; cero partial al cierre | T030, T032, T035 |

No se identifican contradicciones documentales bloqueantes tras estas decisiones.
Los riesgos de implementación siguen abiertos hasta ejecutar las tareas; esta
conclusión no certifica que ya estén corregidos en producto.

## Cobertura propuesta y límites

13 FR (4 AS-IS, 9 CHANGE) y 16 escenarios: 29 filas pending. Diecisiete nombres
previstos se reparten en cuatro AS-IS, tres CHANGE de núcleo, nueve de App y uno
Chromium. Archivos y tareas previstos están en [validación](validation-plan.md)
y [manifiesto](traceability.json). Cada fila tiene un caso y una tarea E0 concretos;
la revisión de firmas existentes no convierte esas filas en completas.

36 tareas E0–E3, con dependencias acíclicas y vínculos a historias. G-PIN espera
7 completos/22 pending; E1 8/21; E2 los 29 completos; E3 ocho contratos/234 IDs y
RLS fresco. Los 108 archivos históricos efectivos se inventarían antes de tocar
pins; solo uno tiene enmienda prevista. Ocho archivos E0 nuevos se congelarán.

La comprobación documental ejecutada está registrada en
[plan-review.json](evidence/plan-review.json): IDs, nombres, dependencias, enlaces,
firmas vigentes y ausencia de cambios de runtime: 36 tareas, 103 enlaces y 108
firmas verificados con Node 24.21.0; los 29 IDs siguen pending y el modo completo
los rechaza. No sustituye E0 ni una corrida
de CI. El [sondeo](evidence/survey.json) sigue siendo diagnóstico con dobles.

La restricción tras DELETE incierto puede obligar a salir de sesión aunque el
servidor no haya borrado datos; es C-001 aprobada. No se garantizan restauración
de fotos parciales, transacción, cancelación de red ni continuidad tras recargar
la página. Tampoco se certifica RLS productivo o una sesión autenticada real.

## Puertas

El alcance y C-001/002/003 están aprobados en `462a344`. Plan, decisiones,
36 tareas, análisis y ejecución local previa al PR documental fueron aprobados
por separado el 2026-10-22. No hay implementación 008 al aprobar esta etapa,
adendas aplicadas, nuevas pruebas contractuales ni rama publicada.

TEST-001 y aviso de bundle conservan su registro; no autorizan reparar harnesses
congelados ni alterar geometría en esta entrega. Hallazgos ajenos van al roadmap.
Publicar, fusionar y Vercel requieren autorización específica posterior al cierre.
