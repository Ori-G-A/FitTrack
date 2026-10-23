# Validación y trazabilidad prevista — 007

Plan aprobado; pruebas congeladas en E0 y ejecución por etapas registrada en
[verificación](verification.md). La matriz vigente se conserva en traceability.json.

| Nombre exacto | Tipo y archivo previsto | FR / escenarios |
| --- | --- | --- |
| guardado007 cola mantiene orden concurrencia y referencia | AS-IS; test/save-state-asis.test.js | FR-001; US3-AS1 |
| guardado007 debounce conserva 600ms y cleanup | AS-IS; test/save-state-asis.test.js | FR-002; US3-AS2 |
| guardado007 promesa conserva resolucion ante fallo | AS-IS; test/save-state-asis.test.js | FR-003 |
| guardado007 conserva ausencia suspension y espera capturada | AS-IS; test/save-state-asis.test.js | FR-004; US3-AS3 |
| guardado007 error persiste entre claves y nuevos intentos | CHANGE; test/save-state-change.test.js | FR-005; US1-AS1/AS4 |
| guardado007 recuperacion selectiva conserva otros errores | CHANGE; test/save-state-change.test.js | FR-006; US1-AS2/AS3 |
| guardado007 sesiones y resultados tardios aislados | CHANGE; test/save-state-change.test.js | FR-007; US2-AS1/AS2 |
| guardado007 indicador recupera estado al remontar | CHANGE; test/save-indicator.test.js | FR-008; US2-AS3 |
| guardado007 navegador error visible en movil y escritorio | CHANGE; change-tests/save-state.spec.js | FR-009; US4-AS1 |
| guardado007 navegador estado accesible y sin exito falso | CHANGE; change-tests/save-state.spec.js | FR-009; US4-AS2 |

## Oráculos y controles

E0 debe producir cuatro AS-IS verdes y seis CHANGE rojos específicos sobre el
original. El caso de remontaje usa el componente real: no debe fallar únicamente
por una API nueva ausente. El de sesión puede invocar la suscripción existente
con un segundo argumento: BASE lo ignora y el fallo esperado es recibir el estado
ajeno, no TypeError. Los nombres y las aserciones se congelan antes de modificar src.

Casos de estado: diferidos para A/B/C; ambos órdenes de resolución, fallo tardío,
nuevo intento cuando no hay pendientes, dos claves fallidas, recuperación de una
y de ambas, segundo fallo del mismo par. Usar valores y usuarios sintéticos.
Verificar ausencia de llamadas remotas adicionales; no introducir reintento.

UI: error al iniciar otra escritura y al terminarla, estado ya existente antes
del montaje, transición de A a B y cambio de usuario entre render/effect. Probar
que una emisión en el intervalo de suscripción no deja un snapshot obsoleto.
Comprobar cleanup y que resultados de A no actualizan B.

Chromium: 390/1280, región única visible y sin clipping ni solapamiento con
navegación; color insuficiente como oráculo. Comprobar role=status y texto, sin
confundirlo con Toast. No certificar lectores de pantalla por inspeccionar ARIA.
Repetir geometría 006 en siete anchos y modo sesión ft-focus para detectar que
la nueva ubicación del indicador no revele shell durante entrenamiento guiado.

## Negativos tras corregir

T019 ejecutará tres mutaciones aisladas: borrar errores al comenzar otra clave,
eliminar el filtro de usuario y retirar la región accesible. Cada una debe fallar
en su prueba exacta, con control positivo previo. Copia sin .env; validación de
ruta/propietario; retirar unión de node_modules antes de borrar solo la copia
propia. Verificar que sourceHash del checkout no cambió y que hubo limpieza.

## Evidencia y mínimos de cierre

E0: siete IDs complete, catorce pending; seis CHANGE rojos archivados.
E1: tres CHANGE del coordinador verdes, tres del indicador todavía rojos;
16 IDs complete y cinco pending, sin presentar el contrato como completo.
E2/E3: 21 IDs complete y cero pending/partial; total siete contratos, 205 IDs.
No inferir resultados de totales previos. Exigir TAP/JSON, sourceHash común,
firmas nuevas congeladas, enmienda de dos pins, RLS local fresco y cleanup.
Registrar build y delta frente al original. Sin pruebas de producción ni credenciales reales.

## Comprobación suplementaria T026

`guardado007 cambio de usuario no pinta error ajeno antes del efecto`, en
`test/save-state-race.test.js`, observa el DOM en layout antes del efecto pasivo.
Comprueba el primer commit de B y un fallo tardío de A, además del retorno a A.
Es una prueba de revisión añadida después de implementar, con rojo específico
sobre una copia de BASE y verde candidato; no forma parte de los seis rojos E0
ni altera sus archivos congelados. [Evidencia](evidence/supplementary-race.json).
