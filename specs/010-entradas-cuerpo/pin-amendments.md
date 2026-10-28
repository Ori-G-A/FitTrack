# Enmiendas propuestas de firmas — 010

Estado: PROPUESTA sujeta a aprobación del [plan](plan.md). No se aplicó ninguna.
Las firmas son hashes SHA-256 con finales de línea normalizados, leídos sobre
el alcance aprobado `1fa6561`. No hay firmas after ni evidencia candidata aún.

| ID | Archivo | Before efectivo | Motivo normativo |
| --- | --- | --- | --- |
| PIN-010-001 | test/body-weight.test.js | c58489431bdd25014f2510b92fe965eba65c5be8c235e0dd90988f2e23114972 | FR-005/006/007; reemplazar aceptación de negativo/Infinity por rechazo sin sustitución |
| PIN-010-002 | test/body-measurements.test.js | 0a40deaede9b030d0335756d15247bb00ecbf7e666f1cb498051643a30d920e9 | FR-005/006/007/010; coma válida y bloqueo completo de medidas inválidas |
| PIN-010-003 | test/body-wellness.test.js | cee5bc7581aa789758291741b6b95f96ec8765786bfe783b5240b273a91b6ff3 | FR-005/009/010; pulso con coma se convierte en 1.2 en vez de NaN |
| PIN-010-004 | test-support/body-build.js | 45d8c14efa2b918c9982b783fee694118754812c8370596ab77020aa340d9d9d | FR-006; conservar detección de weight-zero tras mover la regla de entrada |
| PIN-010-005 | scripts/clock-state-evidence.js | 6554a02e10881c10e580a496b161d670bf2db44ed09d74285fe80e26c642fea9 | US3-AS4/SC-004/005; preservar fuente histórica 009 y permitir solo la transición 010 verificada |
| PIN-010-006 | test/clock-state-pins.test.js | 74c2dcd4c946a51e78661e72118b83358f374eb1652fa59806013262ff08dd9f | US3-AS4/SC-004; exigir recuentos reales de firmas propias 009, sin cambiar negativos |

## Transformaciones permitidas

El helper E0 `scripts/body-inputs-pin-amendments.js` fijará transformaciones
canónicas con anclas únicas sobre los originales archivados. Guardará la
operación concreta, no un parche libre suministrado por el candidato.

- PIN-010-001: sustituir solo el bucle que actualmente guarda `-1` e Infinity por intentos rechazados: conservar colección, ID y valor válido previo. Los casos vacío/cero/texto, coma válida, sustitución de duplicados, replay de uid, pasos, accesos, borrado, diez puntos de gráfico y ocho de historial permanecen.
- PIN-010-002: sustituir el bloque que hoy guarda `{cintura:'0',cadera:'1,2',pecho:'-1',brazo:'2.5',muslo:''}` por un intento inválido rechazado íntegro y un intento válido `{cintura:'70',cadera:'1,2',pecho:'1',brazo:'2.5',muslo:''}`. Exigir respectivamente registros/borrador conservados y valores `70/1.2/1/2.5/null`. Mantener unknown descartado, ID nuevo, borrador vaciado al éxito, borrado e historial/gráfico con cero histórico.
- PIN-010-003: reemplazar únicamente `assert(Number.isNaN(r.restingHr))` por `assert.equal(r.restingHr,1.2)`. Conservar los demás asserts y su nombre: hidratación solo por fecha, borrador externo estable, guarda vacía, toast antes de setter, sueño/pasos cero, energía null, notas recortadas, ID, unknown y seis filas históricas.
- PIN-010-004: extender el filtro onLoad a `body-inputs.js`, retirar únicamente la sustitución de la guarda antigua de addW y aplicar weight-zero sobre la regla pura de peso `allowZero: false → true`. Ancla única, comprobación de que la mutación se aplicó y fallo explícito si no existe. No cambiar exports privados del fixture, otras mutaciones, importación real de producto ni bloqueo de cliente/red.
- PIN-010-005: importar el resolutor/validador independiente 010. En verifyClockPins, resolver después de 009 las cuatro firmas anteriores y las dos propias afectadas, contarlas como enmiendas y aceptar solo los seis destinos enumerados. Sustituir la igualdad viva al sourceHash histórico por la validación de transición 010, que sigue exigiendo el original 009 como origen. Retornar los conteos reales. verificationHash/verificationFiles, verifyClockTrace, validateClockMutationEvidence, fechas, plazos y demás constantes permanecen byte a byte normalizado.
- PIN-010-006: conservar el nombre y todos los controles de firmas/rechazos; cambiar solo `newIntact=7` por `newIntact=5` y exigir `newAmended=2`. previousVerified sigue en 116. No cambiar el control sintético de enmiendas originales ni ampliar sus archivos permitidos.

Los originales completos se archivarán en E0; los hashes after se calcularán
desde la transformación canónica y se compararán con el archivo real. Un cambio
fuera de estos bloques no se justifica por coincidir con un after recalculado:
debe rechazarse. Si hace falta otra transformación, detenerla y añadir revisión
de converge antes de editar el archivo congelado.

## Metadatos de cada adenda

- ID/archivo/before efectivo, firma original de su cohorte y after canónico.
- SHA completo del plan aprobado y referencias de FR/escenarios anteriores.
- Baseline G-PIN original, versiones, sourceHash y huella del instrumental E0.
- Resultados originales y rojos funcionales con nombres/motivos reales; controles que ya pasan identificados como tales.
- Verdes dirigidos ejecutados sobre el candidato, recibos con huellas antes/después, comandos, salidas y digests.
- Declaración comprobable de los bloques preservados; no afirmar que ninguna aserción cambia en PIN-010-001/002/003.

## Composición y recuentos

Se propone componer 010 al final de approvedSavePinHash y verifySaveStatePins;
en verifyDeletePins después de 008/009; en verifyClockPins después de 009 tanto
para sus 116 anteriores como para sus siete propios. verifyInterfacePins y los
tests de arquitectura anteriores ya delegan en approvedSavePinHash.

| Cohorte | Antes | Después previsto |
| --- | --- | --- |
| 010, 123 firmas efectivas originales | 123 intactas | 117 intactas/seis enmendadas |
| 009, 116 firmas anteriores | 113 intactas/tres enmendadas | 109 intactas/siete enmendadas |
| 009, siete propias E0 | siete intactas | cinco intactas/dos enmendadas |
| 008, 108 anteriores | 105 intactas/tres enmendadas | 101 intactas/siete enmendadas |
| 008, ocho propias E0 | siete intactas/una enmendada | siete intactas/una enmendada |

Los tres archivos de composición y contador no congelados se inventarían antes
y después: save-state-evidence.js, delete-state-evidence.js y
test/delete-state-trace.test.js. La aserción del último cambia únicamente a los
recuentos de la tabla. No se reescriben baselines ni recibos 005–009.

## Transición de fuente

El registro `evidence/source-transition.json` se generará tras el verde dirigido,
con el plan aprobado, sourceHash original y candidato, inventario completo antes,
dos modificaciones y una adición permitidas, y recibos dirigidos. Archivos nuevos
en src cuentan aunque estén sin commit; se verifica su inclusión en el índice
antes de usar sourceHash legado. La función de transición recibe las huellas
calculadas por el verificador; no importa save/clock-evidence ni crea un ciclo.

Debe rechazar fuente de origen ajena, otro archivo modificado/agregado/omitido,
firma falsa, adenda sin plan, resultado/recibo cambiado y after no canónico.
Los negativos incluyen recomputar un hash sobre un original alterado y cambiar
src ajeno: no basta con que coincidan dos campos editables de JSON.
No cambiar la evidencia histórica de 009 para atribuirle código 010.

## Aprobación de planificación — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar plan, tareas y análisis; autorizar ejecución local E0–E2». Aprueba plan, 31 tareas y análisis,
y autoriza E0–E2 local antes de integrar el PR documental con snapshot aprobado.
Las esperas de decisión local anteriores son históricas. No autoriza publicar,
fusionar ni desplegar 010.
