# CHANGE propuesto: duración del resaltado de Métricas

Fecha: 2026-10-20. Estado: ALCANCE APROBADO; extensión del plan y ejecución pendientes.
[Spec aprobada](spec.md), [plan aprobado](plan.md), [evidencia E0](evidence/e0-attempts.json).
BASE: 86299a4497e3c19180c30a640598a1358d61cc8f; src permanece intacto.

## Solicitud y problema reproducido

El propietario eligió «Proponer un CHANGE separado para corregir el resaltado»
ante la diferencia observada en FR-008. Esa respuesta autoriza esta propuesta;
no se interpreta como aprobación de un comportamiento todavía no definido.

En DashboardScreen el efecto añade ft-dc-focus y programa su retirada a 2200 ms.
Luego onFocused consume focusCard en App: cambia una dependencia del efecto,
su cleanup cancela el timer y deja la clase. Chromium reprodujo la clase aún
presente después de 2200 ms; Métricas aislada, sin callback que cambie la prop,
sí la retira a los 2200 ms. Se registra como UI-006-007.

El contrato/plan esperaba retirada temporal en App y por eso falló su primer
recorrido. No se transforma ese fallo en pin verde debilitando la aserción.
La aserción temporal se conservará como CHANGE rojo independiente, y G-PIN
seguirá pendiente hasta aprobar la precisión y registrar ambos comportamientos.

## Resultado y contrato propuesto

- FR-024 [CHANGE] Cuando una petición encuentre una tarjeta montada y active su resaltado en Métricas, el sistema deberá mantenerlo durante 2200 ms desde esa activación y retirarlo después, aunque App consuma focusCard o se produzcan renders que no sean otra petición. Si otra petición válida activa una tarjeta antes de vencer, deberá retirar el resaltado anterior y comenzar un plazo de 2200 ms para la nueva. Al desmontar Métricas deberá cancelar los temporizadores y retirar las clases que administra, sin volver a actuar sobre nodos desmontados.
- US1-AS9: Dada una tarjeta montada abierta desde App, cuando se consuma focusCard y avance el reloj, entonces seguirá resaltada antes de 2200 ms y dejará de estarlo al cumplirse el plazo; una segunda petición sustituirá el resaltado anterior y salir de Métricas limpiará sus efectos.

No cambia el caso de una tarjeta ausente en el efecto inicial, el filtro all,
la selección de ancla, el desplazamiento, los cálculos ni la navegación con fecha.
UI-006-006 continúa como compatibilidad documentada; no se promete reintento.
2200 ms es duración de software actual, no objetivo nuevo de rendimiento.

Precisión propuesta de FR-008: conservar filtro/búsqueda inmediata, scroll,
activación y consumo existentes; referir la duración y limpieza al FR-024. Su
evidencia histórica distinguirá App e instancia aislada. Los pins AS-IS finales
no exigirán conservar el defecto que FR-024 corrige. La observación del defecto
queda en evidencia E0 y los rojos originales, no se borra del historial.

## Pruebas propuestas

Archivo independiente: change-tests/interface-highlight.spec.js, configuración
CHANGE ya preparada; sin skips, test.fail ni catches de errores genéricos.

1. interfaz cambio resaltado temporal tras consumo de focusCard: App real con
   servicios sintéticos, activar tarjeta, comprobar consumo de focusCard, clase
   a 2199 ms y retirada a 2200 ms. Fallo original específico: clase permanece.
2. interfaz cambio resaltado reemplazo y desmontaje: activar Peso y después
   Macros; solo la última queda resaltada, con plazo propio. Salir de Métricas
   limpia clases/timers; volver no recibe una activación antigua. Fallo original
   específico: el resaltado anterior no se retira al activar la segunda tarjeta.

Control adicional: instancia aislada y tarjeta inicialmente ausente mantienen
los resultados caracterizados de FR-008. Negativo postverde: cancelar el timer
al consumir focusCard debe volver a ser detectado por el primer caso.

Las pruebas rojas se podrán ejecutar para revisar esta propuesta sin modificar
src. Para declarar completo el nuevo FR harán falta ambos casos verdes, control
de efectos/limpieza y repetición íntegra del checkpoint que falló.

## Extensión del plan propuesta, sujeta a aprobación separada

Se conservan las 39 tareas aprobadas y se añaden cuatro; ninguna completada se
reescribe. Solo las dependencias de tareas aún pendientes se ampliarían.

| ID nuevo | Historia/contrato | Resultado | Dependencias propuestas |
| --- | --- | --- | --- |
| T040 | US1; FR-008/024; US1-AS8/9 | Registrar precisión aprobada, observación App/aislada y matriz; conservar evidencia del fallo y preparar el control AS-IS sin exigir el defecto final | Aprobación de alcance; T002 |
| T041 | US1; FR-024; US1-AS9 | Ejecutar los dos CHANGE rojos sobre BASE y revisar que falla el motivo esperado, no montaje o fixture | T040 |
| T042 | US1; FR-008/024; US1-AS8/9 | E5b: separar la vida del resaltado del consumo de la petición; último resaltado/plazo y cleanup de desmontaje; pasar ambos casos y control AS-IS | T033 y T041, después de G-PIN |
| T043 | US1/US3; FR-020/024; US3-AS7, US1-AS9 | Negativo del temporizador, revisión de aserciones, descubrimiento sin duplicados y cierre actualizado | T036 y T042 |

Nuevas aristas propuestas: T028 depende además de T040/T041; T034 de T042;
T037 de T043. Grafo previsto acíclico. Los checkpoints mantienen todos sus checks.
Posible helper local de resaltado o hook específico, según el grafo real; no
reescribir Métricas ni introducir temporizadores globales. Sin nuevas dependencias.

Alcance aprobado: 24 FR/24 escenarios, 48 IDs de 006. La extensión técnica propone 42 AS-IS completos y seis
CHANGE pending en G-PIN, siete rojos individuales; cierre de seis contratos con
184 IDs (136 anteriores + 48). CI deberá descubrir también estos dos casos.
Las 39 tareas originales conservan su aprobación; las cuatro adicionales y sus aristas siguen pendientes. G-PIN no está superado.

## Estado de aprobaciones

1. Alcance APROBADO el 2026-10-20: FR-024/US1-AS9, precisión de FR-008 y exclusiones explícitas.
2. Plan: T040–T043 y las aristas descritas; autorización de ejecución local de
   esta extensión dentro de E0–E6. No incluye publicar, fusionar ni desplegar 006.

La aprobación de solo una de estas decisiones no aprueba la otra. Las etapas
aprobadas anteriormente y sus pruebas independientes pueden continuar.

Decisión registrada: «Aprobar alcance FR-024 y precisión de FR-008». La segunda
pregunta sobre la extensión técnica sigue pendiente; no se infiere su respuesta.
