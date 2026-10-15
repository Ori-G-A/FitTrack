# Spec NNN: <área>

Estado: BORRADOR | Propietario: <nombre> | Fecha: <AAAA-MM-DD>
Constitución: [referencia](../memory/constitution.md) (resolver ruta al generar).

## Resultado de usuario e intención

<Resultado observable; por qué importa y cómo medirlo.>

## Alcance y restricciones

<Fronteras, usuarios, datos y restricciones; no elegir implementación aquí.>

## Historias y escenarios

### US1 — <resultado> (prioridad P1)

Como <usuario>, quiero <comportamiento> para <resultado medible>.

- US1-AS1: Dado <estado>, cuando <evento>, entonces <resultado verificable>.

## Requisitos funcionales

IDs estables: no renumerar; insertar FR-001a cuando corresponda.
Cada requisito lleva exactamente una etiqueta. `[AS-IS]` exige evidencia
de código y prueba de caracterización antes de implementar; `[CHANGE]` exige
decisión aprobada y prueba que falle antes del cambio.

Usar el patrón EARS apropiado (no es obligatorio usar los cinco en cada spec):

- FR-001 [AS-IS] Ubicuo: El sistema deberá <respuesta observable>.
- FR-002 [AS-IS] Evento: Cuando <evento>, el sistema deberá <respuesta>.
- FR-003 [AS-IS] Estado: Mientras <estado>, el sistema deberá <respuesta>.
- FR-004 [CHANGE] No deseado: Si <fallo>, entonces el sistema deberá <respuesta>.
- FR-005 [CHANGE] Opcional: Donde <capacidad habilitada>, el sistema deberá <respuesta>.

Sustituir ejemplos; no conservar requisitos ficticios.

## Evidencia AS-IS

| FR | Código file:line | Prueba actual o pin pendiente | Límite de evidencia |
| --- | --- | --- | --- |
| <ID> | <ruta:línea> | <archivo y nombre exacto o PENDING> | <qué no demuestra> |

## Criterios medibles de aceptación

- SC-001: <comando/prueba o valor numérico y condiciones de medición>.

## Out of Scope

- <Exclusión explícita>.

## Compatibilidad temporal

Si un AS-IS conserva un defecto conocido, registrar su FR, seguimiento y momento
de revisión. Distinguir comportamiento observado de garantía deseada. Si no hay
defectos conservados, indicarlo explícitamente.

## Clarificaciones

### Sesión <AAAA-MM-DD>

- <Pregunta, recomendación, consecuencias, decisión del dueño y evidencia de aprobación>.
- [NEEDS CLARIFICATION] <Solo si sigue pendiente; indicar trabajo dependiente>.

## Traceability

Una fila por FR y por escenario; no agruparlos ocultando casos sin prueba.
PENDING solo se admite durante documentación. Registrar nombre exacto de la
prueba y comprobar que el runner la descubre; revisar también sus aserciones.

| FR o escenario | Historia | Resultado | Archivo :: prueba | Tarea | Estado/evidencia |
| --- | --- | --- | --- | --- | --- |
| <ID> | US1 | <resultado> | PENDING | <T-ID> | PENDING |

## Aprobación

<Fecha y aprobación explícita; no inferirla de la creación del archivo.>
