# Validación propuesta 008

Nombres previstos, no pruebas contractuales creadas ni ejecutadas. Todos los
IDs siguen pending en [trazabilidad](traceability.json). El sondeo del survey
es diagnóstico independiente, no una baseline ni G-PIN aprobado.

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
o APIs inexistentes como rojo válido. El plan fijará archivos, tareas y firmas.
Las expectativas heredadas contradictorias requerirán enmiendas explícitas por FR.

El cierre futuro exige manifestación completa real, suite/build y RLS fresco
según el plan que se apruebe. No se añaden ahora puertas CI de 008 ni se ejecutan
pruebas contra backend real. No hay evidencia contractual nueva por proponer nombres.
